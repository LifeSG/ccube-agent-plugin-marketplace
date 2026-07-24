<div align="center">

# Community

*Curated open-source skills — vendored so every developer gets them without
extra tooling or setup*

<p align="center">
  <img src="https://img.shields.io/badge/Agents-0-555?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=274183" alt="Agents">
  <img src="https://img.shields.io/badge/Skills-5-555?style=for-the-badge&logo=lightning&logoColor=white&labelColor=F6C063" alt="Skills">
</p>

</div>

---

## What This Plugin Does

This plugin vendors curated open-source community skills directly into the
plugin so developers get them automatically when the plugin is installed — no
additional CLI tools or setup steps required.

Skills are chosen for being stable, widely useful, and low-maintenance. When
upstream skills update, a new plugin version is cut with the synced content.

---

## What Gets Installed

| File       | Location         | What it does                      |
| ---------- | ---------------- | --------------------------------- |
| `SKILL.md` | `skills/<name>/` | Vendored community skill packages |

---

## Skills

### domain-modeling

Build and sharpen a project's domain model. Challenges terminology
against code, maintains a CONTEXT.md glossary with opinionated term
definitions and "avoid" lists, and records architectural decisions as
lightweight ADRs. Activates when the user wants to pin down domain
terminology, maintain a ubiquitous language, or record an
architectural decision.

**Source**: `mattpocock/skills` — vendored via `manage-skills.sh`.

### grill-me

Interviews the user relentlessly about a plan or design until reaching
shared understanding, resolving each branch of the decision tree one
question at a time. Thin wrapper that delegates to `/grilling`.
Activates when the user wants to stress-test a plan, get grilled on
their design, or explicitly says "grill me".

**Source**: `mattpocock/skills` — vendored via `manage-skills.sh`.

### grill-with-docs

Grilling session that combines `/grilling` with `/domain-modeling` —
challenges a plan while simultaneously maintaining CONTEXT.md and
ADRs as decisions crystallise. Activates when the user wants to
stress-test a plan against their project's language and documented
decisions.

**Source**: `mattpocock/skills` — vendored via `manage-skills.sh`.

### grilling

Core interview loop — asks questions one at a time, walks down each
branch of the decision tree, and provides recommended answers.
Explores the codebase for facts rather than asking, but puts
decisions to the user. Used by `/grill-me` and `/grill-with-docs`.

**Source**: `mattpocock/skills` — vendored via `manage-skills.sh`.

### impeccable

Frontend design skill that teaches the AI a real visual vocabulary:
23 commands (`/impeccable audit`, `/impeccable polish`,
`/impeccable craft`, and more), 7 domain reference files (typography,
color, spatial, motion, interaction, responsive, UX writing), and
explicit anti-pattern rules that prevent AI slop (gradient text,
cream/sand defaults, identical card grids, bounce easing). Activates
when the user wants to design, redesign, critique, audit, polish, or
otherwise improve a frontend interface. Full script-based features
(live mode, palette seed, context detection) require per-project
installation via `npx impeccable skills install`.

**Getting started**:
[impeccable.style/tutorials/getting-started](https://impeccable.style/tutorials/getting-started/)

**Source**: `pbakaus/impeccable` — vendored via `manage-skills.sh`.

---

## Managing Community Skills

All lifecycle operations go through `plugins/community/scripts/manage-skills.sh`.
Run from the **repository root**.

**Add a skill from GitHub:**

```bash
./plugins/community/scripts/manage-skills.sh add <owner/repo> <path/in/repo> [skill-name]
```

**Update a single skill to the latest upstream commit:**

```bash
./plugins/community/scripts/manage-skills.sh update <skill-name>
```

**Update all vendored skills at once:**

```bash
./plugins/community/scripts/manage-skills.sh update --all
```

**Delete a skill:**

```bash
./plugins/community/scripts/manage-skills.sh delete <skill-name>
```

**List all currently vendored skills:**

```bash
./plugins/community/scripts/manage-skills.sh list
```

After any add / update / delete, you must also:

1. Update the `## Skills` section above (add, update, or remove the entry).
2. Bump the version in `plugins/community/plugin.json` and
   `plugins/community/.claude-plugin/plugin.json`.
3. Update the version in `.github/plugin/marketplace.json` and
   `.claude-plugin/marketplace.json` for the `community` entry.
