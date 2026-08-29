/**
 * footer.js — Footer Component
 */

export function renderFooter(containerId = 'footer-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <footer class="site-footer" aria-label="Site Footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="brand-logo">
              <div class="logo-box">
                <span class="logo-text">MS</span>
              </div>
              <span class="brand-name">mcp-state</span>
            </div>
            <p class="footer-desc">
              Model Context Protocol (MCP) server for agent state management using a blackboard pattern and SQLite.
            </p>
          </div>

          <div class="footer-col">
            <h4>Diátaxis Docs</h4>
            <ul>
              <li><a href="#doc=tutorials/getting-started.md">Getting Started</a></li>
              <li><a href="#doc=how-to/manage-agent-state.md">Manage Agent State</a></li>
              <li><a href="#doc=how-to/agent-directives.md">Agent Directives</a></li>
              <li><a href="#doc=reference/mcp-tools.md">MCP Tools</a></li>
              <li><a href="#doc=explanation/architecture.md">Architecture Spec</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>MCP Tools</h4>
            <ul>
              <li><a href="#doc=reference/mcp-tools.md">read_blackboard</a></li>
              <li><a href="#doc=reference/mcp-tools.md">patch_blackboard</a></li>
              <li><a href="#doc=reference/mcp-tools.md">archive_subtask</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Project</h4>
            <ul>
              <li><a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">Model Context Protocol</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <span>&copy; ${new Date().getFullYear()} Johnny Orellana. Apache License 2.0.</span>
          <span>Structured with the Diátaxis Technical Documentation Framework</span>
        </div>
      </div>
    </footer>
  `;
}
