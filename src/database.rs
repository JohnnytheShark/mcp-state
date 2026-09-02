
use std::path::PathBuf;

pub fn build_db_path(
    appdata: Option<String>,
    home: Option<String>,
    xdg_data_home: Option<String>,
) -> Result<PathBuf, String> {
    let mut base: PathBuf;

    if cfg!(target_os = "windows") {
        base = PathBuf::from(appdata.ok_or("APPDATA environment variable not set")?);
    } else if cfg!(target_os = "macos") {
        let mut p = PathBuf::from(home.ok_or("HOME environment variable not set")?);
        p.push("Library");
        p.push("Application Support");
        base = p;
    } else {
        // Linux / other Unix: respect XDG_DATA_HOME, fall back to ~/.local/share
        base = if let Some(xdg) = xdg_data_home {
            PathBuf::from(xdg)
        } else {
            let mut p = PathBuf::from(home.ok_or("HOME environment variable not set")?);
            p.push(".local");
            p.push("share");
            p
        };
    }

    base.push("mcp-state");
    base.push("blackboard.db");
    Ok(base)
}

pub fn get_db_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
    let path = build_db_path(
        std::env::var("APPDATA").ok(),
        std::env::var("HOME").ok(),
        std::env::var("XDG_DATA_HOME").ok(),
    )?;

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    Ok(path)
}

#[cfg(test)]
mod path_tests {
    use super::*;

    // ── Windows ───────────────────────────────────────────────────────────────

    #[test]
    #[cfg(target_os = "windows")]
    fn test_windows_uses_appdata() {
        let path = build_db_path(
            Some(r"C:\Users\TestUser\AppData\Roaming".to_string()),
            None,
            None,
        )
        .unwrap();
        assert_eq!(
            path,
            PathBuf::from(r"C:\Users\TestUser\AppData\Roaming\mcp-state\blackboard.db")
        );
    }

    #[test]
    #[cfg(target_os = "windows")]
    fn test_windows_returns_error_when_appdata_missing() {
        let result = build_db_path(None, None, None);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("APPDATA"));
    }

    // ── macOS ─────────────────────────────────────────────────────────────────

    #[test]
    #[cfg(target_os = "macos")]
    fn test_macos_uses_library_application_support() {
        let path = build_db_path(None, Some("/Users/testuser".to_string()), None).unwrap();
        assert_eq!(
            path,
            PathBuf::from("/Users/testuser/Library/Application Support/mcp-state/blackboard.db")
        );
    }

    #[test]
    #[cfg(target_os = "macos")]
    fn test_macos_returns_error_when_home_missing() {
        let result = build_db_path(None, None, None);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("HOME"));
    }

    // ── Linux / other Unix ────────────────────────────────────────────────────

    #[test]
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    fn test_linux_uses_xdg_data_home_when_set() {
        let path = build_db_path(
            None,
            Some("/home/testuser".to_string()),
            Some("/custom/data".to_string()),
        )
        .unwrap();
        assert_eq!(path, PathBuf::from("/custom/data/mcp-state/blackboard.db"));
    }

    #[test]
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    fn test_linux_falls_back_to_home_when_xdg_unset() {
        let path = build_db_path(None, Some("/home/testuser".to_string()), None).unwrap();
        assert_eq!(
            path,
            PathBuf::from("/home/testuser/.local/share/mcp-state/blackboard.db")
        );
    }

    #[test]
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    fn test_linux_returns_error_when_home_missing_and_no_xdg() {
        let result = build_db_path(None, None, None);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("HOME"));
    }

    // ── Cross-platform invariants ─────────────────────────────────────────────

    #[test]
    #[cfg(target_os = "windows")]
    fn test_path_always_ends_with_mcp_state_blackboard_db() {
        let path = build_db_path(Some(r"C:\Some\Dir".to_string()), None, None).unwrap();
        assert!(path.ends_with(r"mcp-state\blackboard.db"));
    }

    #[test]
    #[cfg(not(target_os = "windows"))]
    fn test_path_always_ends_with_mcp_state_blackboard_db() {
        let path = build_db_path(None, Some("/some/dir".to_string()), None).unwrap();
        assert!(path.ends_with("mcp-state/blackboard.db"));
    }
}
