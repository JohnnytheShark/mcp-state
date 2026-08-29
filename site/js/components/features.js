/**
 * features.js — Architecture & Feature Cards Component
 */

export function renderFeatures(containerId = 'features-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section class="section" id="features" aria-label="Architecture & Capabilities">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">Architecture & Design</div>
          <h2 class="section-title">Engineered for <span class="title-accent">Context Window Preservation</span></h2>
          <p class="section-desc">
            Built from first principles in Rust to supply AI agents with a procedural blackboard memory, avoiding the token bloat of infinite conversation histories.
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
            </div>
            <h3>Embedded SQLite Core</h3>
            <p>
              Statically compiled with <code>rusqlite</code>. Zero local database servers to install or manage. Stores session state in a single local file <code>blackboard.db</code>.
            </p>
          </div>

          <div class="feature-card">
            <div class="feat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3>JSON Patching</h3>
            <p>
              Easily update agent state incrementally using standard JSON objects. The server automatically merges new keys and values into the active blackboard.
            </p>
          </div>

          <div class="feature-card">
            <div class="feat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h3>Native MCP stdio Server</h3>
            <p>
              Full compliance with the Model Context Protocol (<code>2024-11-05</code>) over standard input/output. Seamlessly integrations with MCP clients.
            </p>
          </div>

          <div class="feature-card">
            <div class="feat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </div>
            <h3>Cold Storage Archiving</h3>
            <p>
              Provides an <code>archive_subtask</code> tool to intentionally "forget" completed work from the active blackboard, moving it to long-term cold storage.
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}
