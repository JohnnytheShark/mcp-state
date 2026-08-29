/**
 * mcp-playground.js — Interactive MCP & CLI Playground Sandbox for mcp-state
 */

export function renderMcpPlayground(containerId = 'playground-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section class="section" id="playground" aria-label="Interactive MCP Playground">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">Interactive Sandbox</div>
          <h2 class="section-title">MCP Protocol <span class="title-accent">Wire Playground</span></h2>
          <p class="section-desc">
            Simulate how AI agents communicate with <code>mcp-state</code> over stdio JSON-RPC 2.0.
          </p>
        </div>

        <div class="playground-wrap">
          <div class="playground-grid">
            <!-- Left Pane: Input -->
            <div class="play-pane">
              <div class="play-pane-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="4 17 10 11 4 5"></polyline>
                  <line x1="12" y1="19" x2="20" y2="19"></line>
                </svg>
                <span>Select Tool / Command</span>
              </div>

              <div class="play-tool-select" role="tablist">
                <button class="tool-chip active" data-tool="read_blackboard" role="tab" aria-selected="true">read_blackboard</button>
                <button class="tool-chip" data-tool="patch_blackboard" role="tab" aria-selected="false">patch_blackboard</button>
                <button class="tool-chip" data-tool="archive_subtask" role="tab" aria-selected="false">archive_subtask</button>
              </div>

              <div class="play-input-box" id="play-input-controls">
                <!-- Injected dynamically based on selected tool -->
              </div>

              <button class="btn btn-primary" id="play-execute-btn" aria-label="Execute JSON-RPC call">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Execute JSON-RPC Call</span>
              </button>
            </div>

            <!-- Right Pane: Output -->
            <div class="play-pane">
              <div class="play-pane-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <span>Wire Protocol Stream (stdout)</span>
              </div>

              <div class="play-output-box" id="play-output-result" role="region" aria-live="polite">
// Click "Execute JSON-RPC Call" to simulate response...
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  initPlaygroundLogic(container);
}

// Mock state db
const MOCK_DB = {
  "agent_123": { status: "running", items: 42 }
};

function initPlaygroundLogic(container) {
  let activeTool = 'read_blackboard';
  const inputContainer = container.querySelector('#play-input-controls');
  const executeBtn = container.querySelector('#play-execute-btn');
  const outputBox = container.querySelector('#play-output-result');

  function renderToolInputs() {
    if (activeTool === 'read_blackboard') {
      inputContainer.innerHTML = `
        <label class="play-field-label" for="p-session">Session ID:</label>
        <input class="play-input" type="text" id="p-session" value="agent_123">
      `;
    } else if (activeTool === 'patch_blackboard') {
      inputContainer.innerHTML = `
        <label class="play-field-label" for="p-session">Session ID:</label>
        <input class="play-input" type="text" id="p-session" value="agent_123">
        <label class="play-field-label" for="p-patch">JSON Patch:</label>
        <textarea class="play-input" id="p-patch" rows="3" style="resize: vertical;">{"status": "completed", "result": "success"}</textarea>
      `;
    } else if (activeTool === 'archive_subtask') {
      inputContainer.innerHTML = `
        <label class="play-field-label" for="p-session">Session ID:</label>
        <input class="play-input" type="text" id="p-session" value="agent_123">
        <label class="play-field-label" for="p-key">Key to Archive:</label>
        <input class="play-input" type="text" id="p-key" value="items">
      `;
    }
  }

  renderToolInputs();

  container.querySelectorAll('.tool-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.tool-chip').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');
      activeTool = chip.getAttribute('data-tool');
      renderToolInputs();
    });
  });

  executeBtn.addEventListener('click', () => {
    outputBox.innerHTML = '<span style="color: var(--color-taupe);">Executing request...</span>';

    setTimeout(() => {
      const sessionId = document.getElementById('p-session')?.value || 'default';
      if (!MOCK_DB[sessionId]) MOCK_DB[sessionId] = {};

      let request = {
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: activeTool,
          arguments: { session_id: sessionId }
        },
        id: Math.floor(Math.random() * 1000)
      };

      let response;

      if (activeTool === 'read_blackboard') {
        response = {
          jsonrpc: "2.0",
          result: {
            content: [{ type: "text", text: JSON.stringify(MOCK_DB[sessionId]) }]
          },
          id: request.id
        };
      } else if (activeTool === 'patch_blackboard') {
        const patchStr = document.getElementById('p-patch')?.value || '{}';
        let patchObj = {};
        try { patchObj = JSON.parse(patchStr); } catch (e) {}
        
        MOCK_DB[sessionId] = { ...MOCK_DB[sessionId], ...patchObj };
        
        request.params.arguments.json_patch = patchObj;
        
        response = {
          jsonrpc: "2.0",
          result: {
            content: [{ type: "text", text: JSON.stringify(MOCK_DB[sessionId]) }]
          },
          id: request.id
        };
      } else if (activeTool === 'archive_subtask') {
        const key = document.getElementById('p-key')?.value || '';
        request.params.arguments.key_to_archive = key;
        
        if (MOCK_DB[sessionId].hasOwnProperty(key)) {
          delete MOCK_DB[sessionId][key];
          response = {
            jsonrpc: "2.0",
            result: {
              content: [{ type: "text", text: \`Successfully archived key: \${key}\` }]
            },
            id: request.id
          };
        } else {
          response = {
            jsonrpc: "2.0",
            result: {
              content: [{ type: "text", text: \`Key \${key} not found\` }],
              isError: true
            },
            id: request.id
          };
        }
      }

      outputBox.textContent = \`// → stdin (JSON-RPC Request):\n\${JSON.stringify(request, null, 2)}\n\n// ← stdout (JSON-RPC Response):\n\${JSON.stringify(response, null, 2)}\`;
    }, 150);
  });
}
