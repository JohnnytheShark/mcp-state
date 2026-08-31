use rusqlite::{Connection, Result as SqlResult};
use serde_json::Value;
use std::sync::{Arc, Mutex};

pub struct BlackboardService {
    pub conn: Arc<Mutex<Connection>>,
}

impl BlackboardService {
    pub fn new(conn: Connection) -> SqlResult<Self> {
        conn.execute(
            "CREATE TABLE IF NOT EXISTS active_blackboard (
                session_id TEXT PRIMARY KEY,
                state_data TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;
        conn.execute(
            "CREATE TABLE IF NOT EXISTS cold_storage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                archived_data TEXT NOT NULL,
                archived_at TEXT NOT NULL
            )",
            [],
        )?;
        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    pub fn read_blackboard(&self, session_id: &str) -> SqlResult<String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt =
            conn.prepare("SELECT state_data FROM active_blackboard WHERE session_id = ?1")?;
        let mut rows = stmt.query(rusqlite::params![session_id])?;

        if let Some(row) = rows.next()? {
            let state_data: String = row.get(0)?;
            Ok(state_data)
        } else {
            Ok("{}".to_string())
        }
    }

    pub fn patch_blackboard(
        &self,
        session_id: &str,
        patch: &serde_json::Map<String, Value>,
    ) -> SqlResult<String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt =
            conn.prepare("SELECT state_data FROM active_blackboard WHERE session_id = ?1")?;
        let mut rows = stmt.query(rusqlite::params![session_id])?;

        let mut current_state = serde_json::Map::new();
        let mut is_new = true;
        if let Some(row) = rows.next()? {
            let state_data_str: String = row.get(0)?;
            if let Ok(Value::Object(map)) = serde_json::from_str(&state_data_str) {
                current_state = map;
            }
            is_new = false;
        }

        for (k, v) in patch {
            current_state.insert(k.clone(), v.clone());
        }

        let new_state_str = serde_json::to_string(&current_state).unwrap_or_default();
        let updated_at = chrono::Utc::now().to_rfc3339();

        if is_new {
            conn.execute(
                "INSERT INTO active_blackboard (session_id, state_data, updated_at) VALUES (?1, ?2, ?3)",
                rusqlite::params![session_id, new_state_str, updated_at],
            )?;
        } else {
            conn.execute(
                "UPDATE active_blackboard SET state_data = ?1, updated_at = ?2 WHERE session_id = ?3",
                rusqlite::params![new_state_str, updated_at, session_id],
            )?;
        }

        Ok(new_state_str)
    }

    pub fn archive_subtask(
        &self,
        session_id: &str,
        key_to_archive: &str,
    ) -> SqlResult<Result<String, String>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt =
            conn.prepare("SELECT state_data FROM active_blackboard WHERE session_id = ?1")?;
        let mut rows = stmt.query(rusqlite::params![session_id])?;

        if let Some(row) = rows.next()? {
            let state_data_str: String = row.get(0)?;
            if let Ok(Value::Object(mut map)) = serde_json::from_str(&state_data_str) {
                if let Some(archived_val) = map.remove(key_to_archive) {
                    let archived_data_str =
                        serde_json::to_string(&archived_val).unwrap_or_default();
                    let now = chrono::Utc::now().to_rfc3339();

                    conn.execute(
                        "INSERT INTO cold_storage (session_id, archived_data, archived_at) VALUES (?1, ?2, ?3)",
                        rusqlite::params![session_id, archived_data_str, now],
                    )?;

                    let new_state_str = serde_json::to_string(&map).unwrap_or_default();
                    conn.execute(
                        "UPDATE active_blackboard SET state_data = ?1, updated_at = ?2 WHERE session_id = ?3",
                        rusqlite::params![new_state_str, now, session_id],
                    )?;

                    Ok(Ok(format!("Successfully archived key: {}", key_to_archive)))
                } else {
                    Ok(Err(format!(
                        "Key {} not found in session {}",
                        key_to_archive, session_id
                    )))
                }
            } else {
                Ok(Err("Invalid state data format".to_string()))
            }
        } else {
            Ok(Err(format!("Session {} not found", session_id)))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn setup_test_service() -> BlackboardService {
        let conn = Connection::open_in_memory().expect("Failed to open in-memory DB");
        BlackboardService::new(conn).expect("Failed to init DB schema")
    }

    #[test]
    fn test_patch_and_read_blackboard() {
        let service = setup_test_service();
        let session = "test_session_1";

        let state = service.read_blackboard(session).unwrap();
        assert_eq!(state, "{}");

        let mut patch1 = serde_json::Map::new();
        patch1.insert("agent_status".to_string(), json!("running"));
        service.patch_blackboard(session, &patch1).unwrap();

        let state = service.read_blackboard(session).unwrap();
        let state_val: Value = serde_json::from_str(&state).unwrap();
        assert_eq!(state_val["agent_status"], "running");

        let mut patch2 = serde_json::Map::new();
        patch2.insert("agent_status".to_string(), json!("idle"));
        patch2.insert("metrics".to_string(), json!({ "cpu": 50 }));
        service.patch_blackboard(session, &patch2).unwrap();

        let state = service.read_blackboard(session).unwrap();
        let state_val: Value = serde_json::from_str(&state).unwrap();
        assert_eq!(state_val["agent_status"], "idle");
        assert_eq!(state_val["metrics"]["cpu"], 50);
    }

    #[test]
    fn test_archive_subtask() {
        let service = setup_test_service();
        let session = "test_session_2";

        let mut patch = serde_json::Map::new();
        patch.insert(
            "subtask_a".to_string(),
            json!({"status": "complete", "result": 42}),
        );
        patch.insert("subtask_b".to_string(), json!({"status": "pending"}));
        service.patch_blackboard(session, &patch).unwrap();

        let res = service.archive_subtask(session, "subtask_a").unwrap();
        assert!(res.is_ok(), "Expected OK result string, got Err");

        let state = service.read_blackboard(session).unwrap();
        let state_val: Value = serde_json::from_str(&state).unwrap();
        assert!(state_val.get("subtask_a").is_none());
        assert!(state_val.get("subtask_b").is_some());

        let conn = service.conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT archived_data FROM cold_storage WHERE session_id = ?1")
            .unwrap();
        let mut rows = stmt.query(rusqlite::params![session]).unwrap();

        let row = rows.next().unwrap().expect("Expected to find archived row");
        let archived_str: String = row.get(0).unwrap();
        let archived_val: Value = serde_json::from_str(&archived_str).unwrap();
        assert_eq!(archived_val["result"], 42);
    }
}
