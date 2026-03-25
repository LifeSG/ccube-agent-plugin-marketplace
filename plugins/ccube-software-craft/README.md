# ccube-software-craft

A VS Code agent plugin that bundles software engineering knowledge as
structured, AI-accessible instructions and agents. Intended for anyone
who writes software and wants principal-level engineering guidance on
architecture, system design, technical debt, and code quality.

---

## What This Plugin Does

Installs a curated set of agents and instructions that bring proven
software engineering practices directly into Copilot chat. You get
actionable guidance on principles, architecture, and workflow without
leaving the editor.

**Key capabilities:**

- Get multi-perspective trade-off analysis for architecture and design
  decisions
- Apply engineering principles (SOLID, DRY, Clean Code, design patterns)
  to your own codebase
- Get structured, severity-graded code reviews at the architectural level
- Enforce coding standards, security baselines, and markdown formatting
  automatically across every Copilot interaction
- Technical debt strategy and incremental migration planning

---

## What Gets Installed

| Type        | Name                           | Purpose                                             |
| ----------- | ------------------------------ | --------------------------------------------------- |
| Agent       | Principal Software Engineer V2 | Architecture, system design, trade-off analysis     |
| Instruction | cc-taming-copilot              | Core behavioral directives for all code generation  |
| Instruction | cc-software-craft-standards    | Technology-agnostic coding standards (always-on)    |
| Instruction | cc-security-standards          | OWASP Top 10 security verification (always-on)      |
| Instruction | cc-engineering-principles      | SOLID, DRY/KISS/YAGNI, design patterns, code smells |
| Instruction | cc-markdown-standards          | Markdown formatting rules for `.md` files           |

---

## Agent

### Principal Software Engineer V2

Principal-level engineering agent for architecture decisions, technical
debt strategy, scalability analysis, and system design trade-offs.
Provides multi-perspective analysis with explicit options and rationale.

**Example prompts:**

- "Review my service class design for architectural concerns."
- "What architectural pattern suits a feature that needs to be
  auditable?"
- "We're scaling from 1k to 100k users -- what needs to change?"
- "Should we break this monolith into services now, or later?"

---

## Instructions

All instructions are automatically applied by VS Code based on their
`applyTo` patterns. No manual loading is needed.

### cc-taming-copilot

Core behavioral directives that govern every Copilot response involving
code. Enforces surgical minimal edits, existing code preservation,
standard patterns, no emojis, and reasoning explanations.

- **Applies to:** all files (`**/*`)

### cc-software-craft-standards

Technology-agnostic coding standards covering naming, function design,
error handling, constants, comments, testing, documentation,
accessibility, module design, and code review readiness.

- **Applies to:** all files (`**/*`)

### cc-security-standards

OWASP Top 10 security verification checklist with risk-based scoping,
technology-specific checks, vulnerability patterns, and severity
classification.

- **Applies to:** all files (`**/*`)

### cc-engineering-principles

Reference knowledge for SOLID principles, DRY/KISS/YAGNI, Clean Code,
a 25-pattern design patterns catalogue, and a 15-smell code smell
reference with refactoring directions.

- **Applies to:** all files (`**/*`)

### cc-markdown-standards

Formatting rules for Markdown files: 80-character hard line wrap,
heading hierarchy (no H1), fenced code blocks with language tags,
table alignment, and YAML front matter conventions.

- **Applies to:** Markdown files (`**/*.md`)

---

## Telemetry

This plugin collects anonymous usage data to help understand how
many people install it and which agents are used most. No PII,
file contents, or workspace data is ever collected.

**What is sent on each session start:**

- A random anonymous ID (generated locally at
  `~/.ccube/telemetry-id`, reused across sessions)
- The plugin name
- The agent name (e.g. `cc-principal-software-engineerV2`)
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

No additional installations required. This plugin operates entirely
through Copilot chat.
