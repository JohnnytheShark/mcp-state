mod service;
mod tools;
mod rpc;

use rusqlite::Connection;
use serde_json::json;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, BufReader};

use crate::service::BlackboardService;
use crate::tools::ToolRegistry;
use crate::rpc::{RpcRequest, RpcResponse, handle_request};

use std::path::PathBuf;

fn get_db_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
    let mut path = if cfg!(target_os = "windows") {
        PathBuf::from(std::env::var("APPDATA")?)
    } else if cfg!(target_os = "macos") {
        let mut p = PathBuf::from(std::env::var("HOME")?);
        p.push("Library");
        p.push("Application Support");
        p
    } else {
        if let Ok(xdg) = std::env::var("XDG_DATA_HOME") {
            PathBuf::from(xdg)
        } else {
            let mut p = PathBuf::from(std::env::var("HOME")?);
            p.push(".local");
            p.push("share");
            p
        }
    };
    
    path.push("mcp-state");
    std::fs::create_dir_all(&path)?;
    path.push("blackboard.db");
    
    Ok(path)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let db_path = get_db_path()?;
    let conn = Connection::open(db_path)?;
    let service = Arc::new(BlackboardService::new(conn)?);
    let registry = ToolRegistry::new(service);

    let stdin = tokio::io::stdin();
    let mut reader = BufReader::new(stdin).lines();

    while let Some(line) = reader.next_line().await? {
        if line.trim().is_empty() {
            continue;
        }
        
        let req: Result<RpcRequest, _> = serde_json::from_str(&line);
        match req {
            Ok(rpc_req) => {
                let id = rpc_req.id.clone();
                let is_notification = id.is_none();
                
                let result = handle_request(&rpc_req, &registry);
                
                if !is_notification {
                    let response = match result {
                        Ok(res) => RpcResponse {
                            jsonrpc: "2.0".to_string(),
                            result: Some(res),
                            error: None,
                            id,
                        },
                        Err(err) => RpcResponse {
                            jsonrpc: "2.0".to_string(),
                            result: None,
                            error: Some(err),
                            id,
                        }
                    };

                    let out = serde_json::to_string(&response)?;
                    println!("{}", out);
                }
            }
            Err(e) => {
                let err_res = RpcResponse {
                    jsonrpc: "2.0".to_string(),
                    result: None,
                    error: Some(json!({ "code": -32700, "message": "Parse error", "data": e.to_string() })),
                    id: None,
                };
                let out = serde_json::to_string(&err_res)?;
                println!("{}", out);
            }
        }
    }

    Ok(())
}
