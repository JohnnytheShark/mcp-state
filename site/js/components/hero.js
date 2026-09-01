/**
 * hero.js — Hero Section Component
 */

export function renderHero(containerId = 'hero-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section class="hero-section" aria-label="Introduction">
      <div class="container">
        <div class="hero-layout">
          <div class="hero-text">
            <div class="hero-pill">
              <span class="pill-dot"></span>
              <span>v0.2.0 • Rust MCP Server</span>
            </div>

            <h1 class="hero-title">
              The deterministic state manager for <span class="title-accent">AI agents</span>
            </h1>

            <p class="hero-subtitle">
              A single statically-linked Rust binary providing an embedded <strong>SQLite</strong> database and native <strong>Model Context Protocol (MCP)</strong> server over standard I/O to maintain and archive agent blackboard state.
            </p>

            <div class="hero-installer-box">
              <div class="install-tabs" role="tablist">
                <button class="inst-tab active" data-tab="curl-sh" role="tab" aria-selected="true">Linux / macOS</button>
                <button class="inst-tab" data-tab="powershell" role="tab" aria-selected="false">Windows PowerShell</button>
                <button class="inst-tab" data-tab="cargo" role="tab" aria-selected="false">Cargo</button>
              </div>

              <div class="install-command-wrap">
                <div class="command-content">
                  <span class="prompt-sym">$</span>
                  <span id="hero-cmd-text">curl -fsSL https://raw.githubusercontent.com/JohnnytheShark/mcp-state/master/install.sh | bash</span>
                </div>
                <button class="copy-btn" id="hero-copy-cmd-btn" title="Copy command to clipboard" aria-label="Copy installation command">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div class="hero-ctas">
              <a href="#diataxis" class="btn btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span>Read Documentation</span>
              </a>
            </div>

            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-value">SQLite</span>
                <span class="stat-label">Embedded DB</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">JSON</span>
                <span class="stat-label">Patching</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">0 deps</span>
                <span class="stat-label">Zero Daemons</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">100%</span>
                <span class="stat-label">MCP 2024-11-05</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Attach command tab switching
  const commands = {
    'curl-sh': 'curl -fsSL https://raw.githubusercontent.com/JohnnytheShark/mcp-state/master/install.sh | bash',
    'powershell': 'irm https://raw.githubusercontent.com/JohnnytheShark/mcp-state/master/install.ps1 | iex',
    'cargo': 'cargo install --git https://github.com/JohnnytheShark/mcp-state mcp-state'
  };

  const tabs = container.querySelectorAll('.inst-tab');
  const cmdText = document.getElementById('hero-cmd-text');
  const copyBtn = document.getElementById('hero-copy-cmd-btn');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const key = tab.getAttribute('data-tab');
      if (commands[key] && cmdText) {
        cmdText.textContent = commands[key];
      }
    });
  });

  if (copyBtn && cmdText) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(cmdText.textContent);
      if (window.showToast) {
        window.showToast('Copied installation command to clipboard');
      }
    });
  }
}
