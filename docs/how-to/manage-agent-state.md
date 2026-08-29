# How to Manage Agent State

This guide explains how to use the `mcp-state` tools to effectively manage the lifecycle of agent state during a session.

## Starting a New Session

You don't need to explicitly "create" a session. A session is automatically created the first time you use `patch_blackboard` with a new `session_id`.

To start, simply patch the initial state:

```json
{
  "name": "patch_blackboard",
  "arguments": {
    "session_id": "agent_alpha_123",
    "json_patch": {
      "task": "analyze_logs",
      "status": "initializing"
    }
  }
}
```

## Updating State Progressively

As your agent makes progress, use `patch_blackboard` to add or update fields. The `json_patch` argument is merged into the existing state. Existing keys not mentioned in the patch remain untouched.

```json
{
  "name": "patch_blackboard",
  "arguments": {
    "session_id": "agent_alpha_123",
    "json_patch": {
      "status": "processing",
      "logs_parsed": 1500
    }
  }
}
```

After this patch, the blackboard will contain `"task"`, `"status"`, and `"logs_parsed"`. `"status"` is overwritten, and `"logs_parsed"` is added.

## Retrieving the Current State

If an agent needs to know its current context (for instance, after a crash or when delegating to a sub-agent), it can read the full state:

```json
{
  "name": "read_blackboard",
  "arguments": {
    "session_id": "agent_alpha_123"
  }
}
```

## Archiving Completed Subtasks

To prevent the active blackboard from growing too large and consuming context limits, you can move completed subtask data into cold storage.

Use the `archive_subtask` tool by providing the key you wish to remove from the active state:

```json
{
  "name": "archive_subtask",
  "arguments": {
    "session_id": "agent_alpha_123",
    "key_to_archive": "logs_parsed"
  }
}
```

This removes `"logs_parsed"` from the active blackboard and saves it to the `cold_storage` table in the SQLite database, along with a timestamp.

> **Tip:** Organize your agent's state hierarchically so that entire blocks of completed work can be archived under a single key (e.g., `{"phase_1_results": {...}}`).
