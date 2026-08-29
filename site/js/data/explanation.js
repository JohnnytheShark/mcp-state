export const EXPLANATION_DATA = {
  "explanation/architecture.md": `# Architecture and Design

This document explains the architectural decisions behind \`mcp-state\` and why the blackboard pattern was chosen for agent state management.

## The Blackboard Pattern

In AI agent design, a "blackboard" is a shared workspace where multiple processes (or the same agent over multiple turns) can read, update, and append information. 

\`mcp-state\` implements this pattern to solve a common problem in LLM-based agent systems: **context window bloat**.

If an agent must keep its entire working history in its conversation context, it quickly runs out of tokens. By externalizing state to an MCP server, the agent can:
1. Maintain only a pointer (session ID) to its state.
2. Interrogate the state only when necessary (\`read_blackboard\`).
3. Deposit intermediate results without cluttering the chat history (\`patch_blackboard\`).

## Active vs. Cold Storage

The system divides data into two tiers:

1. **Active Blackboard:** This is meant to be small, fast, and frequently accessed. It contains the immediate context the agent needs to make its next decision.
2. **Cold Storage:** As tasks are completed, the intermediate data (which might be large, like parsed file contents or extensive reasoning chains) is no longer needed for immediate decision-making. The \`archive_subtask\` tool allows the agent to intentionally "forget" this data from the active board while retaining it in a durable audit log (\`cold_storage\` table).

This design mirrors human memory: we have a limited working memory (active blackboard) and a vast, slower-to-access long-term memory (cold storage).

## Why SQLite?

SQLite was chosen via the \`rusqlite\` crate for several reasons:

- **Zero-configuration:** It requires no separate database server to be running.
- **Portability:** The entire state is contained within a single \`blackboard.db\` file, making it trivial to backup, share, or inspect with standard SQLite tools.
- **Reliability:** It provides ACID guarantees, ensuring that state transitions are atomic and durable even if the server crashes.

## Concurrency Model

The MCP server handles incoming JSON-RPC requests asynchronously over stdin/stdout using \`tokio\`. However, SQLite (by default) is a synchronous, single-file database.

To bridge this gap safely, the \`BlackboardService\` wraps the SQLite \`Connection\` in an \`Arc<Mutex<Connection>>\`. 
- \`Arc\` (Atomic Reference Counted) allows the connection to be shared safely across multiple tool instances in the registry.
- \`Mutex\` ensures that only one database transaction (read, patch, or archive) occurs at a time.

While this introduces a bottleneck, it is perfectly acceptable for the expected workload of an MCP server, which typically serves a single agent or a small local swarm where request concurrency is extremely low.`
};
