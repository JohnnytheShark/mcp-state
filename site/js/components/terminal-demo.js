/**
 * terminal-demo.js — Interactive Terminal Simulator for mcp-state Workflow
 */

export function renderTerminalDemo(containerId = 'terminal-demo-mount') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="terminal-card" id="terminal-card-instance" aria-label="Terminal Session Simulation">
      <div class="terminal-header">
        <div class="terminal-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <span class="terminal-title">mcp-state session — stdio & mcp</span>
        <span class="terminal-badge">LIVE DEMO</span>
      </div>

      <div class="terminal-body" id="term-output-body" role="region" aria-live="polite">
        <!-- Lines injected dynamically -->
      </div>

      <div class="terminal-footer">
        <span>SQLite + JSON-RPC 2.0</span>
        <button class="term-action-btn" id="term-replay-btn" aria-label="Replay Terminal Demonstration">Replay Demo</button>
      </div>
    </div>
  `;

  startTerminalSimulation();

  const replayBtn = document.getElementById('term-replay-btn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      startTerminalSimulation();
    });
  }
}

let termTimer = null;

function startTerminalSimulation() {
  const body = document.getElementById('term-output-body');
  if (!body) return;

  if (termTimer) {
    clearTimeout(termTimer);
  }

  body.innerHTML = '';

  const steps = [
    {
      delay: 200,
      html: `<div class="term-line"><span class="term-prompt">$ </span><span class="term-user-text">cargo run --release</span> <span style="color: var(--color-taupe);"># Spawning stdio MCP server</span></div>`
    },
    {
      delay: 1000,
      html: `<div class="term-line"><span class="term-tool">Agent → stdio</span> <span class="term-ai-text">tools/call: patch_blackboard({ session_id: "agent_42", json_patch: { status: "running", items_processed: 5 } })</span></div>`
    },
    {
      delay: 1800,
      html: `<div class="term-line"><div class="term-json-box">{"items_processed": 5, "status": "running"}</div></div>`
    },
    {
      delay: 2800,
      html: `<div class="term-line"><span class="term-tool">Agent → stdio</span> <span class="term-ai-text">tools/call: patch_blackboard({ session_id: "agent_42", json_patch: { items_processed: 100, completed_data: { log_id: "123" } } })</span></div>`
    },
    {
      delay: 3600,
      html: `<div class="term-line"><div class="term-json-box">{"completed_data": {"log_id": "123"}, "items_processed": 100, "status": "running"}</div></div>`
    },
    {
      delay: 4600,
      html: `<div class="term-line"><span class="term-tool">Agent → stdio</span> <span class="term-ai-text">tools/call: archive_subtask({ session_id: "agent_42", key_to_archive: "completed_data" })</span></div>`
    },
    {
      delay: 5400,
      html: `<div class="term-line"><span class="term-success">✓ Successfully archived key: completed_data to cold storage</span></div>`
    },
    {
      delay: 6200,
      html: `<div class="term-line"><span class="term-tool">Agent → stdio</span> <span class="term-ai-text">tools/call: read_blackboard({ session_id: "agent_42" })</span></div>`
    },
    {
      delay: 7000,
      html: `<div class="term-line"><div class="term-json-box">{"items_processed": 100, "status": "running"}</div></div>`
    }
  ];

  function runStep(index) {
    if (index >= steps.length) return;
    const step = steps[index];
    termTimer = setTimeout(() => {
      body.innerHTML += step.html;
      body.scrollTop = body.scrollHeight;
      runStep(index + 1);
    }, step.delay);
  }

  runStep(0);
}
