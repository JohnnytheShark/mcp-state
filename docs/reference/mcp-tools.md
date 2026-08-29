# MCP Tools Reference

This document provides a technical specification for the tools exposed by the `mcp-state` server, as well as the underlying database schema.

## Tools Overview

### `read_blackboard`

Reads the active blackboard state for a given session.

- **Input Schema:**
  ```json
  {
    "type": "object",
    "properties": {
      "session_id": { "type": "string" }
    },
    "required": ["session_id"]
  }
  ```
- **Returns:** A text block containing a JSON-encoded string of the current state map. If the session does not exist, it returns `"{}"`.

### `patch_blackboard`

Merges a JSON patch into the active blackboard state. 

- **Input Schema:**
  ```json
  {
    "type": "object",
    "properties": {
      "session_id": { "type": "string" },
      "json_patch": { "type": "object" }
    },
    "required": ["session_id", "json_patch"]
  }
  ```
- **Returns:** A text block containing a JSON-encoded string of the fully merged state.
- **Behavior:** 
  - If the session does not exist, it is created.
  - Keys in `json_patch` overwrite existing keys or are added if they do not exist.
  - The `updated_at` timestamp in the database is refreshed.

### `archive_subtask`

Archives a specific key from the active blackboard, moving its value to cold storage.

- **Input Schema:**
  ```json
  {
    "type": "object",
    "properties": {
      "session_id": { "type": "string" },
      "key_to_archive": { "type": "string" }
    },
    "required": ["session_id", "key_to_archive"]
  }
  ```
- **Returns:** 
  - **Success:** A text block confirming the archiving of the key.
  - **Error (`isError: true`):** If the key is not found, or if the session does not exist.

## Database Schema

The server uses SQLite (`blackboard.db`) to persist data.

### `active_blackboard`

Stores the current, working state for active sessions.

| Column       | Type | Description |
| ------------ | ---- | ----------- |
| `session_id` | TEXT | Primary key. Unique identifier for the agent session. |
| `state_data` | TEXT | JSON string representation of the active state. |
| `updated_at` | TEXT | RFC3339 timestamp of the last patch or archive operation. |

### `cold_storage`

Stores archived data segments removed from the active blackboard.

| Column          | Type    | Description |
| --------------- | ------- | ----------- |
| `id`            | INTEGER | Primary key, autoincremented. |
| `session_id`    | TEXT    | Identifier linking the archived data to its original session. |
| `archived_data` | TEXT    | JSON string representation of the specific key/value archived. |
| `archived_at`   | TEXT    | RFC3339 timestamp of when the archive occurred. |
