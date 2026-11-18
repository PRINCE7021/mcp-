# Nimbus Labs: Campus Helpdesk Agent Toolchain

Welcome to the **Nimbus Labs Campus Helpdesk Agent Toolchain** repository. This project demonstrates modern agent engineering, integrating:
- **Agent Skills**: Progressive disclosure, anti-fabrication guidelines, and executable lookup scripts (`skills/timetable-helper/`).
- **Plugins**: Bundled skills, custom slash commands, guardrail hooks, and MCP servers (`plugins/campus-helpdesk/`).
- **Model Context Protocol (MCP)**: Official stdio server exposing tools (`get_timetable`, `get_fee_status`) and resources (`hostel-rules://campus/rules`) using `@modelcontextprotocol/sdk`.
- **Git Worktrees**: Parallel AI coding sessions, branch isolation, conflict resolution, and worktree maintenance.

---

## Directory Layout

```text
campus-helpdesk-toolchain/
├── .gitignore
├── package.json
├── README.md
├── skills/
│   └── timetable-helper/
│       ├── SKILL.md
│       ├── scripts/
│       │   └── lookup_timetable.py
│       ├── references/
│       │   ├── csv_schema.md
│       │   └── edge_cases.md
│       └── resources/
│           └── timetable.csv
├── plugins/
│   └── campus-helpdesk/
│       ├── plugin.json
│       ├── marketplace.json
│       ├── mcp_config.json
│       ├── hooks.json
│       ├── scripts/
│       │   └── protect_folder.sh
│       ├── commands/
│       │   └── timetable.md
│       ├── rules/
│       │   └── AGENTS.md
│       ├── assets/
│       │   └── logo.svg
│       ├── skills/
│       │   └── timetable-helper/
│       └── README.md
├── mcp-server/
│   ├── server.js
│   ├── test-client.js
│   └── README.md
├── tests/
│   └── test_skill_prompts.py
└── docs/
```

---

## Quick Start & Verification

### 1. Test the MCP Server
```bash
npm run test:mcp
```

### 2. Test Skill Prompts & Anti-Fabrication
```bash
npm run test:skill
```

### 3. Verify Guardrail Hook
```bash
echo '{"toolCall":{"name":"write_file","args":{"Path":"protected/confidential.txt"}}}' | ./plugins/campus-helpdesk/scripts/protect_folder.sh
```

## Worktree Verification Status
Verification Status: All 6 skill tests passing with automated anti-fabrication assertions.
