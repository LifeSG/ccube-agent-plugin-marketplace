# ccube-software-craft

A VS Code agent plugin that bundles software engineering knowledge as
structured, AI-accessible skills and agents. Intended for anyone who
writes software and wants principal-level engineering guidance on
architecture, system design, technical debt, and code quality.

---

## What This Plugin Does

Installs a curated set of agents, skills, and instructions that bring
proven software engineering practices directly into Copilot chat. You
get actionable guidance on principles, architecture, and workflow without
leaving the editor.

**Key capabilities:**

- Get multi-perspective trade-off analysis for architecture and design
  decisions
- Apply engineering principles (SOLID, DRY, Clean Code, design patterns)
  to your own codebase
- Get structured, severity-graded code reviews at the architectural level
- Reason through system design with a 6-dimension evaluation framework
- Technical debt strategy and incremental migration planning

---

## What Gets Installed

| Type        | Name                           | Purpose                                            |
| ----------- | ------------------------------ | -------------------------------------------------- |
| Agent       | Principal Software Engineer V2 | Architecture, system design, trade-off analysis    |
| Skill       | cc-engineering-principles      | SOLID, DRY/KISS/YAGNI, Clean Code, design patterns |
| Instruction | cc-software-craft-standards    | Technology-agnostic coding standards (always-on)   |

---

## Agent

### Principal Software Engineer V2

Principal-level engineering agent for architecture decisions, technical
debt strategy, scalability analysis, and system design trade-offs.
Provides multi-perspective analysis with explicit options and rationale.

**Example prompts:**

- "Review my service class design for architectural concerns."
- "What architectural pattern suits a feature that needs to be auditable?"
- "We're scaling from 1k to 100k users — what needs to change?"
- "Should we break this monolith into services now, or later?"

---

## Skills

### cc-engineering-principles

Reference knowledge covering:

- **SOLID** — each principle with description, violation example, and fix
- **DRY / KISS / YAGNI / Law of Demeter** — concise definitions and
  common misapplications
- **Clean Code** — naming, function design, error handling, formatting
- **Design Patterns** — Creational, Structural, Behavioral catalogue
  (25 patterns)
- **Code Smell Reference** — 15 common smells with refactoring direction

---

## Requirements

No additional installations required. This plugin operates entirely
through Copilot chat.
