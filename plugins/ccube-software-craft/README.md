<div align="center">

# CCube Software Craft

*Principal-level software engineering knowledge — directly in Copilot chat*

<p align="center">
  <img src="https://img.shields.io/badge/Agents-2-555?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=274183" alt="Agents">
  <img src="https://img.shields.io/badge/Skills-3-555?style=for-the-badge&logo=lightning&logoColor=white&labelColor=F6C063" alt="Skills">
</p>

</div>

---

## What This Plugin Does

This plugin brings proven software engineering practices directly into Copilot
chat. Once installed, you get actionable principal-level guidance on
architecture, system design, clean code, and workflow — without leaving the
editor.

The result: An AI pair programmer that can reason about trade-offs across
multiple architectural approaches, help manage technical debt strategically,
enforce coding standards and markdown formatting automatically, and assist
with git workflow and feature design documentation.

---

## What Gets Installed

| File        | Location         | What it does                                                                 |
| ----------- | ---------------- | ---------------------------------------------------------------------------- |
| `.agent.md` | `agents/`        | Specialized AI agents for architecture decisions and software craft guidance |
| `SKILL.md`  | `skills/<name>/` | Domain-knowledge packages — EP authoring, git workflow, markdown standards   |

---

## Agents

### CC Software Engineer

Principal-level engineering agent for architecture decisions, technical
debt strategy, scalability analysis, and system design trade-offs.
Provides multi-perspective analysis with explicit options and rationale.

**Example prompts:**

- "Review my service class design for architectural concerns."
- "What architectural pattern suits a feature that needs to be
  auditable?"
- "We're scaling from 1k to 100k users -- what needs to change?"
- "Should we break this monolith into services now, or later?"

### Prompt Refiner

Specialist subagent that rewrites user prompts into clearer,
execution-ready instructions and explains the prompt-engineering
improvements applied. This agent is not user-facing and is invoked by
the main engineering agent when needed.

---

## Skills

Skills are loaded on demand when semantically matched to the current
task. No manual loading is needed.

### cc-create-ep

Stepwise Enhancement Proposal (EP) creation following KEP-style
documentation standards. Covers template discovery, parallel
codebase research via subagents, structured Part-1 / Part-2 /
Part-3 generation, and blocking clarification gates. Bundles the
official EP template as a portable resource.

**Invoke when:** creating or drafting a new EP or feature design
document.

### cc-git-commit

Atomic commit workflow that groups changed files into logical
commits and produces Conventional Commit messages prefixed with
the branch name and author initials.

**Invoke when:** staging, committing, or pushing work.

### cc-markdown-standards

Markdown formatting rules enforcing 80-character hard line wrap,
heading hierarchy, fenced code blocks, table alignment, and YAML
front matter conventions.

**Invoke when:** creating or editing any `.md` or markdown file.

### cc-react-18-patterns

React 18 patterns reference covering concurrent rendering,
automatic batching, transitions, Suspense, new hooks (`useId`,
`useTransition`, `useDeferredValue`, `useSyncExternalStore`),
streaming SSR, and TypeScript integration. Includes migration
notes for upgrading to React 19.

**Invoke when:** implementing, reviewing, or debugging React 18.x
components.

### cc-react-19-patterns

React 19.2 modern patterns reference covering hooks, Actions API,
Server Components, concurrent rendering, and TypeScript integration.
Includes decision trees, code examples, and common-mistake flags.

**Invoke when:** implementing, reviewing, or debugging React 19+
components.

---

## Telemetry

This plugin collects anonymous usage data to help understand how
many people install it and which agents are used most. No PII,
file contents, or workspace data is ever collected.

**What is sent on each session start:**

- A random anonymous ID (generated locally at
  `~/.ccube/telemetry-id`, reused across sessions)
- The plugin name
- The agent name (e.g. `cc-software-engineer`)
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
