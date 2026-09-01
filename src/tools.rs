use crate::service::BlackboardService;
use serde_json::{json, Value};
use std::sync::Arc;

pub trait Tool: Send + Sync {
    fn name(&self) -> &'static str;
    fn description(&self) -> &'static str;
    fn input_schema(&self) -> Value;
    fn call(&self, args: &serde_json::Map<String, Value>) -> Result<Value, Value>;
}

pub struct ReadBlackboardTool {
    service: Arc<BlackboardService>,
}
impl ReadBlackboardTool {
    pub fn new(service: Arc<BlackboardService>) -> Self {
        Self { service }
    }
}
impl Tool for ReadBlackboardTool {
    fn name(&self) -> &'static str {
        "read_blackboard"
    }
    fn description(&self) -> &'static str {
        "Reads the active blackboard state for a session"
    }
    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "session_id": { "type": "string" }
            },
            "required": ["session_id"]
        })
    }
    fn call(&self, args: &serde_json::Map<String, Value>) -> Result<Value, Value> {
        let session_id = args
            .get("session_id")
            .and_then(Value::as_str)
            .ok_or_else(|| json!({ "code": -32602, "message": "Missing session_id" }))?;
        match self.service.read_blackboard(session_id) {
            Ok(state) => Ok(json!({ "content": [{ "type": "text", "text": state }] })),
            Err(e) => Err(json!({ "code": -32603, "message": e.to_string() })),
        }
    }
}

pub struct PatchBlackboardTool {
    service: Arc<BlackboardService>,
}
impl PatchBlackboardTool {
    pub fn new(service: Arc<BlackboardService>) -> Self {
        Self { service }
    }
}
impl Tool for PatchBlackboardTool {
    fn name(&self) -> &'static str {
        "patch_blackboard"
    }
    fn description(&self) -> &'static str {
        "Merges a JSON patch into the active blackboard state"
    }
    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "session_id": { "type": "string" },
                "json_patch": { "type": "object" }
            },
            "required": ["session_id", "json_patch"]
        })
    }
    fn call(&self, args: &serde_json::Map<String, Value>) -> Result<Value, Value> {
        let session_id = args
            .get("session_id")
            .and_then(Value::as_str)
            .ok_or_else(|| json!({ "code": -32602, "message": "Missing session_id" }))?;
        let patch = args
            .get("json_patch")
            .and_then(Value::as_object)
            .ok_or_else(|| json!({ "code": -32602, "message": "Missing json_patch" }))?;
        match self.service.patch_blackboard(session_id, patch) {
            Ok(state) => Ok(json!({ "content": [{ "type": "text", "text": state }] })),
            Err(e) => Err(json!({ "code": -32603, "message": e.to_string() })),
        }
    }
}

pub struct ArchiveSubtaskTool {
    service: Arc<BlackboardService>,
}
impl ArchiveSubtaskTool {
    pub fn new(service: Arc<BlackboardService>) -> Self {
        Self { service }
    }
}
impl Tool for ArchiveSubtaskTool {
    fn name(&self) -> &'static str {
        "archive_subtask"
    }
    fn description(&self) -> &'static str {
        "Archives a specific key from the active blackboard to cold storage"
    }
    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "session_id": { "type": "string" },
                "key_to_archive": { "type": "string" }
            },
            "required": ["session_id", "key_to_archive"]
        })
    }
    fn call(&self, args: &serde_json::Map<String, Value>) -> Result<Value, Value> {
        let session_id = args
            .get("session_id")
            .and_then(Value::as_str)
            .ok_or_else(|| json!({ "code": -32602, "message": "Missing session_id" }))?;
        let key = args
            .get("key_to_archive")
            .and_then(Value::as_str)
            .ok_or_else(|| json!({ "code": -32602, "message": "Missing key_to_archive" }))?;
        match self.service.archive_subtask(session_id, key) {
            Ok(Ok(msg)) => Ok(json!({ "content": [{ "type": "text", "text": msg }] })),
            Ok(Err(msg)) => {
                Ok(json!({ "content": [{ "type": "text", "text": msg }], "isError": true }))
            }
            Err(e) => Err(json!({ "code": -32603, "message": e.to_string() })),
        }
    }
}

pub struct ToolRegistry {
    tools: Vec<Box<dyn Tool>>,
}
impl ToolRegistry {
    pub fn new(service: Arc<BlackboardService>) -> Self {
        Self {
            tools: vec![
                Box::new(ReadBlackboardTool::new(Arc::clone(&service))),
                Box::new(PatchBlackboardTool::new(Arc::clone(&service))),
                Box::new(ArchiveSubtaskTool::new(Arc::clone(&service))),
            ],
        }
    }

    pub fn list_tools(&self) -> Value {
        let tools_json: Vec<Value> = self
            .tools
            .iter()
            .map(|t| {
                json!({
                    "name": t.name(),
                    "description": t.description(),
                    "inputSchema": t.input_schema()
                })
            })
            .collect();
        json!({ "tools": tools_json })
    }

    pub fn call_tool(
        &self,
        name: &str,
        args: &serde_json::Map<String, Value>,
    ) -> Result<Value, Value> {
        if let Some(tool) = self.tools.iter().find(|t| t.name() == name) {
            tool.call(args)
        } else {
            Err(json!({ "code": -32601, "message": "Tool not found" }))
        }
    }
}
