use crate::tools::ToolRegistry;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Serialize, Deserialize, Debug)]
pub struct RpcRequest {
    pub jsonrpc: String,
    pub method: String,
    #[serde(default)]
    pub params: Option<Value>,
    #[serde(default)]
    pub id: Option<Value>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RpcResponse {
    pub jsonrpc: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<Value>,
    pub id: Option<Value>,
}

pub fn handle_request(req: &RpcRequest, registry: &ToolRegistry) -> Result<Value, Value> {
    match req.method.as_str() {
        "initialize" => Ok(json!({
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {}
            },
            "serverInfo": {
                "name": "mcp-state",
                "version": "0.1.0"
            }
        })),
        "tools/list" => Ok(registry.list_tools()),
        "tools/call" => {
            let params = req
                .params
                .as_ref()
                .ok_or_else(|| json!({ "code": -32602, "message": "Missing params" }))?;
            let name = params
                .get("name")
                .and_then(Value::as_str)
                .ok_or_else(|| json!({ "code": -32602, "message": "Missing tool name" }))?;
            let args = params
                .get("arguments")
                .and_then(Value::as_object)
                .ok_or_else(|| json!({ "code": -32602, "message": "Missing arguments" }))?;

            registry.call_tool(name, args)
        }
        "notifications/initialized" => Ok(json!({})),
        _ => Err(json!({ "code": -32601, "message": "Method not found" })),
    }
}
