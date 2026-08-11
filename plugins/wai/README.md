<div align="center">

# WAI

*Full-stack web application delivery — from idea to deployed software in one
orchestrated workflow*

<p align="center">
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"></a>
  <a href="https://koajs.com/"><img src="https://img.shields.io/badge/Koa-33333D?style=for-the-badge&logo=node.js&logoColor=white" alt="Koa"></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Agents-13-555?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=274183" alt="Agents">
  <img src="https://img.shields.io/badge/Skills-12-555?style=for-the-badge&logo=lightning&logoColor=white&labelColor=F6C063" alt="Skills">
</p>

</div>

---

## What This Plugin Does

This plugin turns your AI coding assistant into a **full-stack delivery
team**. A lightweight Maestro router classifies your intent and dispatches
to specialist agents — product thinking, visual design, frontend (FDS),
and backend (Koa + PostgreSQL) — each self-verifying with build and test.

The result: Say "build me a feedback form" and the right specialist
activates, scaffolds the project if needed, implements with the Flagship
Design System, and verifies the build passes — no manual agent selection
required.

---

## What Gets Installed

| File        | Location         | What it does                                                                              |
| ----------- | ---------------- | ----------------------------------------------------------------------------------------- |
| `.agent.md` | `agents/`        | Specialist AI agents covering product, architecture, frontend, backend, and review        |
| `SKILL.md`  | `skills/<name>/` | Domain-knowledge packages — FDS components, project scaffolding, deployment, git workflow |

---

## Agents

### Maestro

Lightweight routing agent that classifies user intent and dispatches
to the correct specialist. Does NOT generate briefs, review code, or
add workflow phases — it classifies and delegates.

**Activation:**

- VS Code: Select **Maestro** from the agent picker dropdown
- Claude Code: `claude --agent wai:Maestro`

**Routing categories:**

| Category | Dispatches to |
| -------- | ------------- |
| FRONTEND | WAI FDS Engineer |
| BACKEND | WAI Backend Engineer |
| DESIGN | WAI Designer |
| PRODUCT | WAI Product Manager |
| SCAFFOLD | `cc-vite-react-ds` / `cc-fullstack-vite` skill |
| GENERAL | Handles directly (pass-through) |

**Example prompts:**

- "Build me a user profile page with avatar upload and settings form."
- "Create an API endpoint for user authentication."
- "Help me scope an MVP for a feedback portal."

### WAI Product Manager

Guides requirements gathering, MVP scoping, and user story writing for
non-technical users. Produces a structured Product Brief that feeds
directly into Phase 1.5 Architecture Review.

**Example prompts:**

- "Help me scope an MVP for a leave management tool."
- "Turn these user needs into a product brief."
- "What features should be in v1 vs. a later release?"

### WAI FDS Engineer

Frontend implementation specialist using Flagship Design System (FDS).
Translates raw user prompts or structured briefs into working React
pages and components. Self-verifies with `npm run build` and `npm test`.

Requires an existing FDS project (scaffolded via `cc-vite-react-ds` or
`cc-fullstack-vite`). Maestro handles this automatically.

**Example prompts:**

- "Build a user profile page with avatar upload and settings form."
- "Fix the TypeScript error in the login component."
- "Add a data table page at /users with pagination."

### WAI Backend Engineer

Backend specialist that implements Koa routes, database migrations,
and middleware. Self-verifies with `npm run build` and `npm test`.

**Example prompts:**

- "Create a REST endpoint for user registration."
- "Add a migration for the comments table."
- "Fix the 500 error on POST /api/feedback."

---

## Skills

Skills are loaded on demand when semantically matched to the current task.
No manual loading is needed.

### `cc-fullstack-vite`

Scaffolds a complete Vite + React + FDS frontend with Koa + TypeScript
backend and PostgreSQL database in a single project folder. Used by
WAI Maestro in Phase 2.

**Key capabilities:**

- Template-based project creation with token substitution for port and
  database name
- Produces the exact `dist/index.js` and `dist/client/` build outputs
  required by the production Dockerfile
- Sets up Docker Compose for local PostgreSQL, gitleaks pre-commit hook,
  and all TypeScript configs

### `cc-design-system`

Activated when Copilot needs to look up FDS component usage, tokens,
theming, or accessibility patterns. Includes a full component catalogue,
design token reference, layout composition patterns, and theme setup
guide. Used by WAI FDS Engineer.

### `cc-vite-react-ds`

Scaffolds a frontend-only Vite + React + FDS project. Used by WAI FDS
Engineer when a backend is not required.

### `cc-rabbit-deploy`

Covers GCC deployment via Rabbit Deploy — git initialisation, Project
Access Token setup, configuring the GitLab remote, and pushing to trigger
automatic CI/CD. Used by WAI Maestro in Phase 8.

### `cc-git-commit`

Atomic commit workflow that groups changed files into logical commits and
produces Conventional Commit messages prefixed with branch name and author
initials. Used by WAI Maestro after each SDLC phase.

### `cc-create-ep`

Stepwise Enhancement Proposal (EP) creation following KEP-style
documentation standards. Fires 5 specialist research subagents in parallel
to gather codebase context. Used by WAI Software Engineer in standalone
mode.

### `cc-plan-implementation`

Decomposes an EP or task description into a parallelised, phase-based
workplan with a Mermaid dependency graph, critical path analysis, and
per-task agent prompts. Used by WAI Software Engineer in standalone mode.

### `cc-contribute-wai`

Hands-on guide for contributing to or improving the ccube agent plugin
marketplace. Walks contributors through the full workflow: environment
check, branching, creating or editing skills/agents/instructions,
marketplace.json registration, testing via VS Code reload, committing,
pushing, and creating merge requests. Designed for contributors of all
technical levels, including product managers and designers.

---

## Telemetry

This plugin collects anonymous usage data to help understand how many
people install it and which agents are used most. No PII, file contents,
or workspace data is ever collected.

**What is sent on each session start:**

- A random anonymous ID (generated locally at
  `~/.ccube/telemetry-id`, reused across sessions)
- The plugin name
- The agent name (e.g. `maestro`)
- A UTC timestamp

**How to opt out:**

Add the following to your shell profile (`~/.zshrc`, `~/.bashrc`,
or `~/.profile`) and restart VS Code:

```bash
export CCUBE_TELEMETRY_DISABLED=1
```

See [docs/telemetry/DESIGN.md](../../docs/telemetry/DESIGN.md) for
the full privacy and data schema documentation.

---

## Requirements

- Node.js 18+
- Docker + Docker Compose (for local PostgreSQL)
- gitleaks (`brew install gitleaks`)
- pre-commit (`brew install pre-commit`)
