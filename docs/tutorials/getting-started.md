# Getting Started

This tutorial will guide you through compiling and running the `mcp-state` server, and manually interacting with it to see the blackboard state management in action.

## Prerequisites

- **Rust and Cargo**: Ensure you have Rust installed (edition 2021 or later). You can get it from [rustup.rs](https://rustup.rs/).

## 1. Compile the Server

Clone the repository and build the project using Cargo:

```bash
cargo build --release
```

This will produce a binary in `target/release/mcp-state`.

## 2. Run the Server

The server uses standard input and output (stdin/stdout) for MCP communication and will create an SQLite database named `blackboard.db` in its working directory.

```bash
cargo run
```

*Note: The server will start and silently wait for JSON-RPC messages via stdin.*

## 3. Interact with the Server

In a real scenario, an MCP client handles communication. For this tutorial, we will simulate a client by sending manual JSON-RPC messages to the running server's standard input.

### Initialize the Connection

Send the `initialize` method:

```json
{"jsonrpc": "2.0", "id": 1, "method": "initialize"}
```

You should receive a response showing the server's protocol version and capabilities.

### List Available Tools

Let's ask the server what tools it has:

```json
{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}
```

The response will list `read_blackboard`, `patch_blackboard`, and `archive_subtask`.

### Patch the Blackboard

Let's create some state for a session called `tutorial_session`:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "patch_blackboard",
    "arguments": {
      "session_id": "tutorial_session",
      "json_patch": {
        "status": "learning",
        "progress": 50
      }
    }
  }
}
```

The server will return the newly merged state as a JSON string.

### Read the Blackboard

To verify the state was saved, read it back:

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "read_blackboard",
    "arguments": {
      "session_id": "tutorial_session"
    }
  }
}
```

You should see `{"progress":50,"status":"learning"}` in the response content!

## Next Steps

Now that you have the server running and understand the basics of the protocol, check out the [How-to Guides](../how-to/manage-agent-state.md) to learn how to manage complex state transitions.
