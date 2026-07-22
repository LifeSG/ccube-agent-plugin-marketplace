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
  <img src="https://img.shields.io/badge/Skills-11-555?style=for-the-badge&logo=lightning&logoColor=white&labelColor=F6C063" alt="Skills">
</p>

</div>

---

## What This Plugin Does

This plugin turns GitHub Copilot into a **full-stack delivery team** that takes
a product goal from requirements to deployed software. A WAI Maestro
orchestrates a fleet of specialist agents — requirements, architecture, frontend,
backend, and review — across a structured 8-phase SDLC.

The result: An AI team that can frame requirements, produce an architecture
decision record, scaffold a production-ready Vite + Koa + PostgreSQL project,
implement frontend and backend in parallel, run build and test verification,
conduct a principal-level code review, and deploy to GCC via Rabbit Deploy —
with explicit handoff gates between every phase.

---

## What Gets Installed

| File        | Location         | What it does                                                                              |
| ----------- | ---------------- | ----------------------------------------------------------------------------------------- |
| `.agent.md` | `agents/`        | Specialist AI agents covering product, architecture, frontend, backend, and review        |
| `SKILL.md`  | `skills/<name>/` | Domain-knowledge packages — FDS components, project scaffolding, deployment, git workflow |

---

## Agents

### WAI Maestro

Delivery orchestrator that coordinates all 8 SDLC phases. Routes incoming
requests through a **Request Routing** classifier — informational questions
are answered directly, bugs go through diagnosis before fix, trivial changes
skip PM and architecture review, and standard features run the full pipeline.
Delegates to the right specialist at the right time, enforces phase gates,
runs automated build and test verification, and produces a git commit after
each phase.

**SDLC phases:**

| Phase | Name                      | Owner                     |
| ----- | ------------------------- | ------------------------- |
| 1     | Requirements              | WAI Product Manager       |
| 1.3   | Design Translation        | WAI Designer              |
| 1.5   | Backend & Security Review | WAI Software Engineer     |
| 2     | Scaffold                  | `cc-fullstack-vite` skill |
| 3     | Frontend                  | WAI FDS Engineer          |
| 4     | Backend                   | WAI Backend Engineer      |
| 5     | Build Verification        | WAI Maestro (automated)   |
| 6     | Test Execution            | WAI Maestro (automated)   |
| 7     | Code Review               | WAI Software Engineer     |
| 8     | Deploy                    | `cc-rabbit-deploy` skill  |

**Orchestration flow:**

```mermaid
flowchart LR
    START(["🎯 Goal"])

    ROUTE{"Request\nRouting"}:::route

    %% Informational path
    INFO["Informational\nAnswer directly\n(read configs, seed, logs)"]:::info
    INFO_DONE(["✅ Answered"])

    %% Bug path
    DIAG["Bug Diagnosis\n[agent] WAI Software Engineer"]:::agent
    FIX["Bug Fix\n[agent] FDS / Backend Engineer"]:::agent

    %% Standard change path
    P1["Phase 1 · Requirements\n[agent] WAI Product Manager\nOutput: Product Brief"]:::agent
    P12["Phase 1.2 · Design Translation\n[agent] WAI Designer\nOutput: Implementation Brief"]:::agent
    P15["Phase 1.5 · Backend & Security Review\n[agent] WAI Software Engineer\nOutput: ADR"]:::agent
    P2["Phase 2 · Scaffold\n[skill] cc-fullstack-vite\nOutput: Project structure"]:::skill

    %% Trivial change path
    IMPL["Trivial Change\n[agent] FDS / Backend Engineer"]:::agent

    %% Shared implementation + verification
    P3["Phase 3 · Frontend\n[agent] WAI FDS Engineer\n[skill] cc-design-system"]:::agent
    P4["Phase 4 · Backend\n[agent] WAI Backend Engineer"]:::agent
    P5["Phase 5 · Build Verification\n[agent] WAI Maestro\nnpm run build"]:::auto
    P6["Phase 6 · Test Execution\n[agent] WAI Maestro\nnpm test"]:::auto
    P7["Phase 7 · Code Review\n[agent] WAI Software Engineer\nOutput: Technical Review Report"]:::agent
    P8["Phase 8 · Deploy\n[skill] cc-rabbit-deploy\nOutput: Live on GCC"]:::skill
    DONE(["✅ Shipped"])

    GIT(["[skill] cc-git-commit\nafter each phase"]):::skill

    START --> ROUTE

    %% Informational — no phases
    ROUTE -->|"Informational\nquestion"| INFO --> INFO_DONE

    %% Bug — diagnose then fix then verify
    ROUTE -->|"Bug\nreport"| DIAG --> FIX --> P5

    %% Trivial — skip PM & arch review
    ROUTE -->|"Trivial\nchange"| IMPL --> P5

    %% Standard — full SDLC
    ROUTE -->|"Standard\nchange"| P1 --> P12 --> P15 --> P2
    P2 --> P3 & P4
    P3 & P4 --> P5

    P5 --> P6 --> P7 --> P8 --> DONE

    P1 & P12 & P15 & P3 & P4 & P7 -.-> GIT

    classDef agent fill:#1e3a5f,color:#fff,stroke:#3b7dd8,stroke-width:2px
    classDef skill fill:#7c4d00,color:#fff,stroke:#f6a623,stroke-width:2px
    classDef auto fill:#1a3a1a,color:#fff,stroke:#5a9e5a,stroke-width:2px
    classDef route fill:#4a1942,color:#fff,stroke:#9b59b6,stroke-width:2px
    classDef info fill:#2c3e50,color:#fff,stroke:#95a5a6,stroke-width:2px
```

**Example prompts:**

- "Build me a task management app with a React frontend and REST API."
- "Take this product brief and deliver a working prototype."
- "Scaffold, build, and deploy a PostgreSQL-backed dashboard."

### WAI Product Manager

Guides requirements gathering, MVP scoping, and user story writing for
non-technical users. Produces a structured Product Brief that feeds
directly into Phase 1.5 Architecture Review.

**Example prompts:**

- "Help me scope an MVP for a leave management tool."
- "Turn these user needs into a product brief."
- "What features should be in v1 vs. a later release?"

### WAI Software Engineer

Principal-level engineer operating at the two highest-leverage points in
the SDLC: architecture review (Phase 1.5) and code review (Phase 7). Also
available standalone for EP authoring and implementation planning.

**Phase 1.5 — Architecture Review:**

- Evaluates the Product Brief and produces an Architecture Decision Record
  (ADR) covering stack, data model, API design, security posture, and
  deployment constraints.
- ADR modifications are applied to implementation briefs before Phases 3
  and 4 begin.

**Phase 7 — Code Review:**

- Runs a principal-level technical review covering correctness, FDS
  compliance, security (OWASP Top 10), performance, and test coverage.
- Produces a structured Technical Review Report.

**Standalone skills:**

- `cc-create-ep` — EP authoring with parallel codebase research subagents
- `cc-plan-implementation` — parallelised workplan with Mermaid dependency
  graph and per-task agent prompts

### WAI FDS Engineer *(subagent)*

Frontend specialist that implements pages and components using FDS components,
tokens, and theming patterns. Operates in Phase 3 under Maestro direction.

### WAI Backend Engineer *(subagent)*

Backend specialist that implements Koa routes, database migrations, and
middleware. Operates in Phase 4 under Maestro direction.

### Prompt Refiner *(subagent)*

Rewrites vague prompts into specific, execution-ready instructions and
explains the prompt-engineering improvements applied. Invoked automatically
by user-facing agents — not user-facing itself.

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
