/**
 * navbar.js — Navigation Bar and Mobile Drawer Component
 */

export function renderNavbar(containerId = 'navbar-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <nav class="navbar" id="main-nav" aria-label="Main Navigation">
      <div class="nav-container">
        <a href="#" class="brand-logo" title="mcp-state Documentation Home">
          <div class="logo-box">
            <span class="logo-text">MS</span>
          </div>
          <span class="brand-name">mcp-state</span>
          <span class="brand-badge">v0.1.0</span>
        </a>

        <div class="nav-links">
          <a href="#features">Architecture</a>
          <a href="#diataxis" class="nav-highlight">Diátaxis Docs</a>
          <a href="#playground">MCP Playground</a>
        </div>

        <div class="nav-actions">
          <button class="search-trigger-btn" id="nav-search-btn" title="Search documentation (Ctrl+K)" aria-label="Open Search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Search docs...</span>
            <kbd>⌘K</kbd>
          </button>

          <button class="mobile-toggle" id="mobile-nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Drawer -->
    <div class="mobile-drawer" id="mobile-nav-drawer">
      <a href="#features" class="mobile-nav-link">Architecture & Pillars</a>
      <a href="#diataxis" class="mobile-nav-link">Diátaxis Documentation</a>
      <a href="#playground" class="mobile-nav-link">MCP Playground</a>
    </div>
  `;

  // Attach navbar events
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('active');
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });
    drawer.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}
