/**
 * docs-index.js — Composite Dataset of all Diataxis Documentation
 */

import { TUTORIALS_DATA } from './tutorials.js';
import { HOWTO_DATA } from './how-to.js';
import { REFERENCE_DATA } from './reference.js';
import { EXPLANATION_DATA } from './explanation.js';

const RAW_DOCS_DATA = {
  ...TUTORIALS_DATA,
  ...HOWTO_DATA,
  ...REFERENCE_DATA,
  ...EXPLANATION_DATA
};

export const DOCS_CATEGORIES = [
  {
    id: "tutorials",
    name: "Tutorials",
    badge: "🎓 LEARNING-ORIENTED",
    axis: "Practical Acquisition",
    desc: "Step-by-step guided lessons for newcomers to compile, run, and interact with the mcp-state server.",
    primaryDoc: "tutorials/getting-started.md",
    keys: ["tutorials/getting-started.md"]
  },
  {
    id: "how-to",
    name: "How-To Guides",
    badge: "🛠️ PROBLEM-ORIENTED",
    axis: "Practical Application",
    desc: "Task-focused recipes to manage agent state, update progress, and archive completed subtasks.",
    primaryDoc: "how-to/manage-agent-state.md",
    keys: [
      "how-to/manage-agent-state.md",
      "how-to/agent-directives.md"
    ]
  },
  {
    id: "reference",
    name: "Reference",
    badge: "📖 INFORMATION-ORIENTED",
    axis: "Theoretical Application",
    desc: "Authoritative specifications for MCP tools (read_blackboard, patch_blackboard, archive_subtask) and database schemas.",
    primaryDoc: "reference/mcp-tools.md",
    keys: [
      "reference/mcp-tools.md"
    ]
  },
  {
    id: "explanation",
    name: "Explanation",
    badge: "💡 UNDERSTANDING-ORIENTED",
    axis: "Theoretical Acquisition",
    desc: "Deep conceptual discussions on the blackboard pattern, SQLite usage, active vs cold storage, and concurrency.",
    primaryDoc: "explanation/architecture.md",
    keys: [
      "explanation/architecture.md"
    ]
  }
];

export const DOCS_DATA = {};
for (const key in RAW_DOCS_DATA) {
  const content = RAW_DOCS_DATA[key];
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : key.split('/').pop().replace('.md', '');
  
  let category = "Documentation";
  for (const cat of DOCS_CATEGORIES) {
    if (cat.keys.includes(key)) {
      category = cat.name;
      break;
    }
  }

  DOCS_DATA[key] = {
    title,
    content,
    category
  };
}
