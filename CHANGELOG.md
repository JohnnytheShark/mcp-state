# Changelog

All notable changes to `mcp-state` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-08-28

### Added
- Initial public release.
- `BlackboardService` backed by embedded SQLite for persistent agent state storage.
- Two-table schema: `active_blackboard` (hot, frequently accessed) and `cold_storage` (audit log for archived data).
- Three MCP tools exposed over JSON-RPC 2.0 via stdio:
  - `read_blackboard(session_id)` — Reads active JSON state for a session.
  - `patch_blackboard(session_id, json_patch)` — Merges a JSON object into the active state.
  - `archive_subtask(session_id, key_to_archive)` — Moves a key from active state to cold storage.
- Full MCP protocol compliance (`initialize`, `tools/list`, `tools/call`, `notifications/initialized`).
- Diataxis documentation: Tutorials, How-to Guides, Reference, and Explanation.
- Agent Directives system prompt (Stigmergy Blackboard Protocol).
- Interactive documentation site (`site/`) with MCP Playground and terminal simulator.
- GitHub Actions CI, release pipeline, and GitHub Pages deployment.
- Install scripts for Linux/macOS (`install.sh`) and Windows (`install.ps1`).
- Apache 2.0 License.

[Unreleased]: https://github.com/JohnnytheShark/mcp-state/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/JohnnytheShark/mcp-state/releases/tag/v0.1.0
