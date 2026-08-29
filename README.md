# mcp-state

[![CI](https://github.com/JohnnytheShark/mcp-state/actions/workflows/ci.yml/badge.svg)](https://github.com/JohnnytheShark/mcp-state/actions)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**mcp-state** is a Model Context Protocol (MCP) server for agent state management. It provides a lightweight, deterministic "blackboard" architecture powered by an embedded SQLite database, enabling AI agents to read, patch, and archive their state without cluttering their conversation context.

## Documentation

Full Diataxis documentation, interactive API playgrounds, and architectural guides are available at the **[mcp-state Documentation Site](https://johnnytheshark.github.io/mcp-state/)**.

## Features

- **Embedded SQLite Core**: Zero database servers to manage. Everything is stored in a local `blackboard.db` file.
- **JSON Patching**: Agents update state incrementally via JSON-RPC.
- **Cold Storage Archiving**: Agents can archive completed subtasks to a `cold_storage` table to preserve their context window limits.
- **Native stdio MCP Server**: Fully compliant with MCP 2024-11-05 standard over standard I/O streams.

## Installation

### Linux / macOS
```bash
curl -fsSL https://raw.githubusercontent.com/JohnnytheShark/mcp-state/master/install.sh | bash
```

### Windows PowerShell
```powershell
irm https://raw.githubusercontent.com/JohnnytheShark/mcp-state/master/install.ps1 | iex
```

### From Source
```bash
cargo build --release
```

## Quick Start

`mcp-state` runs over stdio and is designed to be invoked by an MCP client (such as Claude Desktop or Antigravity).

```json
{
  "mcpServers": {
    "mcp-state": {
      "command": "mcp-state",
      "args": []
    }
  }
}
```

The server exposes the following tools:
- `read_blackboard(session_id)`
- `patch_blackboard(session_id, json_patch)`
- `archive_subtask(session_id, key_to_archive)`

## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) and [NOTICE](NOTICE) files for details.

Copyright © 2026 Johnny Orellana.
