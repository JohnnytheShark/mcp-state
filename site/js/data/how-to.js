export const HOWTO_DATA = {
  "how-to/manage-agent-state.md": `# How to Manage Agent State

This guide explains how to use the \`mcp-state\` tools to effectively manage the lifecycle of agent state during a session.

## Starting a New Session

You don't need to explicitly "create" a session. A session is automatically created the first time you use \`patch_blackboard\` with a new \`session_id\`.

To start, simply patch the initial state:

\`\`\`json
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
\`\`\`

## Updating State Progressively

As your agent makes progress, use \`patch_blackboard\` to add or update fields. The \`json_patch\` argument is merged into the existing state. Existing keys not mentioned in the patch remain untouched.

\`\`\`json
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
\`\`\`

After this patch, the blackboard will contain \`"task"\`, \`"status"\`, and \`"logs_parsed"\`. \`"status"\` is overwritten, and \`"logs_parsed"\` is added.

## Retrieving the Current State

If an agent needs to know its current context (for instance, after a crash or when delegating to a sub-agent), it can read the full state:

\`\`\`json
{
  "name": "read_blackboard",
  "arguments": {
    "session_id": "agent_alpha_123"
  }
}
\`\`\`

## Archiving Completed Subtasks

To prevent the active blackboard from growing too large and consuming context limits, you can move completed subtask data into cold storage.

Use the \`archive_subtask\` tool by providing the key you wish to remove from the active state:

\`\`\`json
{
  "name": "archive_subtask",
  "arguments": {
    "session_id": "agent_alpha_123",
    "key_to_archive": "logs_parsed"
  }
}
\`\`\`

This removes \`"logs_parsed"\` from the active blackboard and saves it to the \`cold_storage\` table in the SQLite database, along with a timestamp.

> **Tip:** Organize your agent's state hierarchically so that entire blocks of completed work can be archived under a single key (e.g., \`{"phase_1_results": {...}}\`).`,
  "how-to/agent-directives.md": `# Agent Directives: Stigmergy Blackboard Protocol

You can use the following system prompt (or "directives") to instruct your Large Language Model (LLM) or AI agent on how to correctly interact with the \`mcp-state\` server.

This prompt enforces a stigmergic workflow, ensuring the agent relies entirely on the blackboard for its context rather than a bloated chat history.

---

\`\`\`markdown
# Agent Directives: Stigmergy Blackboard Protocol

You are operating within a Stigmergic (Blackboard) multi-agent architecture. You do NOT have a persistent conversational memory. Your sole source of truth for the project state, tasks, and shared artifacts is the SQLite Blackboard.

You have access to the \`mcp-state\` MCP server. You MUST obey the following lifecycle for EVERY session:

## 1. Waking Up (Initialization)
Before you write any code or answer any questions, you MUST call the \`read_blackboard(session_id: "current_project")\` tool. 
- Read the active JSON state.
- Identify the \`"current_task"\` and review any \`"shared_artifacts"\`.

## 2. Working (Execution)
Execute the work based strictly on what the blackboard dictates. Do not ask me for permission to do the work, just execute the code generation or analysis required.

## 3. Saving State (Context Compaction)
When your specific task is complete, you MUST update the blackboard before concluding your response. 
Call \`patch_blackboard(session_id: "current_project", json_patch: {...})\` to:
- Mark the current task as complete.
- Overwrite the \`"current_task"\` key with the next logical step.
- Save any generated code, schemas, or architectural decisions to the \`"shared_artifacts"\` key so the next agent can access them.

## 4. Archiving (Maintenance)
If the \`"completed_tasks"\` array in the JSON state exceeds 5 items, you MUST call the \`archive_subtask\` tool to move the oldest tasks to cold storage. Keep the active blackboard clean.

DO NOT output your internal monologue about updating the database. Just call the tools and confirm when the state has been successfully updated.
\`\`\`
`
};
