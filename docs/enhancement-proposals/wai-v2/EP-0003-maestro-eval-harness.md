# EP-0003: Maestro Eval Harness & MAI (Bring-Your-Own-Agent)

**Created**: 2026-08-12
**Status**: Draft
**Input**: User description: "Create an Enhancement Proposal for
adding automated evaluations to the Maestro routing agent and
enabling MAI (My AI) support. Eval uses a JSON test fixture with
a Claude Code workflow. MAI allows projects to provide their own
specialist agents in `wai/byoa/` that Maestro defers to
before falling back to WAI (plugin default) specialists. MAI
sounds like 'mine' — they're YOUR agents."

- [Summary](#summary)
- [Motivation](#motivation)
  - [Goals](#goals)
  - [Non-Goals](#non-goals)
- [Proposal](#proposal)
  - [Part A: Automated Evaluation](#part-a-automated-evaluation)
  - [Part B: Bring-Your-Own-Agent](#part-b-bring-your-own-agent)
  - [Part C: MAI vs WAI Naming](#part-c-mai-vs-wai-naming)
  - [Part D: MAI Agent Creation Skill](#part-d-mai-agent-creation-skill)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Notes/Constraints/Caveats](#notesconstraintscaveats)
  - [Risks and Mitigation](#risks-and-mitigation)
- [Design Details](#design-details)
  - [Eval: Test Fixture Schema](#eval-test-fixture-schema)
  - [Eval: Workflow Script](#eval-workflow-script)
  - [BYOA: Maestro Routing Change](#byoa-maestro-routing-change)
  - [BYOA: Example Project Agent](#byoa-example-project-agent)
  - [MAI vs WAI: No File Renames](#mai-vs-wai-no-file-renames)
- [Alternatives](#alternatives)
- [Infrastructure Needed (Optional)](#infrastructure-needed-optional)
- [Review & Acceptance Checklist](#review--acceptance-checklist)
- [Execution Status](#execution-status)

## Summary

Three changes to the Maestro routing agent:

1. **Automated evaluation** — a Claude Code workflow that smoke-
   tests classification accuracy against a JSON fixture,
   runnable locally on demand.
2. **Bring-Your-Own-Agent (BYOA)** — Maestro checks for project-
   local agents in `wai/byoa/` before falling back to
   plugin specialists. This makes Maestro additive (provides
   defaults) rather than overriding (forces its specialists).
3. **MAI naming** — rename all "WAI" agent prefixes to "MAI"
   (sounds like "mine"), reflecting the agent-as-yours philosophy.

## Motivation

### Two user groups

Maestro serves two groups:

1. **New app builders** — use the MAI plugin's scaffold skills
   and FDS/Koa specialists to create web applications from
   scratch.
2. **Existing codebase teams** — have their own frontend/backend
   conventions (Next.js, Angular, Express, Prisma, etc.) and
   want Maestro's routing intelligence without its opinionated
   specialists overriding their stack.

Today Maestro only serves Group 1. For Group 2, it actively
harms: it routes FRONTEND to the FDS Engineer (wrong stack) and
treats non-FDS projects as needing scaffolding (wrong
assumption).

### Why BYOA is harness-agnostic

`wai/byoa/` is the universal agent discovery mechanism.
Every harness (Claude Code, VS Code Copilot, future harnesses)
reads agent descriptions from this directory and routes based
on them. The only thing that breaks this native mechanism is
Maestro intercepting and hardcoding dispatch to its own
specialists.

The fix: make Maestro respect project agents by checking for
them first. In other harnesses, project agents already work
natively via description matching — no Maestro involvement.

### Why eval

Every change to Maestro's system prompt can silently break
routing. The existing `validate-*.sh` scripts check output
format but not routing decisions. An automated eval catches
regressions before they reach users.

### Goals

1. Enable projects to bring their own specialist agents that
   Maestro defers to — no config file needed, just
   `wai/byoa/` with good descriptions.
2. Catch catastrophic routing regressions via a local eval.
3. Rename WAI → MAI across all agent names.
4. Maintain backward compatibility — Group 1 (FDS projects
   without custom agents) works exactly as before.
5. Work across all harnesses: Claude Code, VS Code Copilot,
   and any future harness that reads `wai/byoa/`.

### Non-Goals

- CI integration for the eval (no API key in CI).
- Evaluating specialist agent quality.
- Building a project-agent template generator.
- Changing how Copilot's native routing works (it already
  handles BYOA natively — we only fix Maestro).
- Testing the filesystem check (Step 2) in the eval.

## Proposal

### Part A: Automated Evaluation

#### Scope: Classification-Only

The eval tests Maestro's intent classification (Step 1) and
dispatch decision (Step 3). It does NOT test the project-context
filesystem check (Step 2) — that is deterministic and better
tested with a shell script.

#### Phased Rollout

**Phase 1 (now):** 3 smoke-test cases. Binary gate: all must
pass. Catches catastrophic regressions.

**Phase 2 (when agent stabilizes):** Expand to 15–20 cases.
Ratcheting threshold (highest observed - 5%). Stability
classification (3x runs per case, separate stable from
unstable).

#### Design Decisions (from grilling session)

| Decision | Choice |
|----------|--------|
| Grading method | Deterministic JSON comparison (no grader agent) |
| Threshold | Binary (Phase 1); ratcheting (Phase 2) |
| Non-determinism | Stability classification in Phase 2 |
| Case count | Start with 3, grow from real mis-routings |
| Harness | Claude Code workflow (pipeline) |
| CI | None — local-only for now |

### Part B: Bring-Your-Own-Agent

#### The Contract

For project teams, the instruction is:

> Put your agent in `wai/byoa/`. Write a description with
> trigger conditions. It works in all harnesses.

No config file. No Maestro-specific metadata. The agent's
`description` field is the universal routing interface.

#### Precedence Chain

Maestro resolves dispatch targets in this order:

```
1. Project agents (wai/byoa/) — by description match
2. Plugin specialists (WAI FDS Engineer, WAI Backend Engineer)
3. Maestro handles directly (generalist fallback)
```

Project agents always win. Plugin specialists are defaults for
projects that don't bring their own.

#### How Maestro Discovers Project Agents

In Step 2 of the routing protocol, before checking for FDS:

1. Scan `wai/byoa/*.md` in the workspace
2. Read each agent's `description` field
3. For each classified category (FRONTEND, BACKEND, etc.),
   check if a project agent's description covers it
4. If yes → dispatch to that project agent
5. If no → fall through to plugin specialists or direct handling

**Description matching heuristic:** A project agent "covers" a
category if its description mentions the category's signals
(e.g., "frontend", "React", "component", "page" for FRONTEND;
"API", "endpoint", "database" for BACKEND).

#### Cross-Harness Behavior

| Harness | How BYOA works |
|---------|----------------|
| Claude Code (with Maestro) | Maestro scans `wai/byoa/`, defers to matching agents |
| VS Code Copilot | Maestro scans `wai/byoa/` when invoked |
| Other harnesses | Any harness invoking Maestro gets BYOA via the same scan |

**Why `wai/byoa/` instead of `.claude/agents/`:** The `.claude/`
directory is Claude-specific. `wai/byoa/` belongs to the
project, not a tool — portable across any harness that invokes
Maestro.

#### Maestro's Role After BYOA

Maestro becomes:

1. **Default specialist provider** — offers WAI FDS Engineer +
   WAI Backend Engineer when no project agent covers those
   categories
2. **Scaffold trigger** — detects missing projects and offers
   scaffolding
3. **Product Manager access** — routes product/scope questions
4. **Generalist fallback** — handles GENERAL directly

### Part C: MAI vs WAI Naming

Two tiers of agents with distinct naming:

| Tier | Prefix | Meaning | Location |
|------|--------|---------|----------|
| Project agents | MAI | "My AI" / "mine" | `wai/byoa/` in the project repo |
| Plugin defaults | WAI | Plugin-provided defaults | `plugins/wai/agents/` in the plugin |

**WAI agents stay as-is.** They are the plugin's default
specialists (WAI FDS Engineer, WAI Backend Engineer, WAI
Product Manager). They don't get renamed.

**MAI is the concept** for project-local agents that teams
create. "MAI" sounds like "mine" — these are YOUR agents,
tailored to YOUR stack and conventions.

The precedence chain uses this naming naturally:

```
MAI agents (yours) → WAI agents (defaults) → Maestro direct
```

### Part D: MAI Agent Creation Skill

A skill (`/create-mai-agent`) that guides users through creating
a properly-structured MAI agent that Maestro can discover and
route to. The skill ensures agents follow best practices and
align with Maestro's current routing configuration.

#### What the Skill Does

1. **Detects project stack** — scans `package.json`,
   `tsconfig.json`, directory structure to infer the project's
   frontend/backend frameworks, UI library, database, and
   conventions.
2. **Asks which category to cover** — FRONTEND, BACKEND, or
   both. Informs the user which WAI defaults will be overridden.
3. **Generates the agent file** — writes to `wai/byoa/` with:
   - A `description` field containing the correct trigger
     signals that Maestro's Step 2 matches against
   - Stack-specific instructions derived from detected
     conventions
   - A completion protocol (build/test verification)
   - Project-specific file paths and naming conventions
4. **Validates against Maestro config** — reads Maestro's
   current routing protocol and verifies the generated
   description contains the signals needed for category matching
   (e.g., "page", "component", "frontend" for FRONTEND;
   "endpoint", "API", "database" for BACKEND).

#### Why a Skill

A poorly-written description is the #1 failure mode for BYOA.
If the description doesn't contain Maestro's trigger signals,
the agent won't be discovered. The skill eliminates this risk by
generating descriptions that are guaranteed to match.

It also removes the barrier for Group 2 users who may not know:
- What format agent files use (frontmatter + markdown)
- What trigger signals Maestro looks for
- What a good completion protocol looks like
- Where to place the file (`wai/byoa/`)

#### Skill Inputs

| Input | Source | Required |
|-------|--------|----------|
| Category to cover | User choice | Yes |
| Project stack | Auto-detected from workspace | Auto |
| Conventions (file paths, patterns) | Auto-detected | Auto |
| Custom instructions | User-provided (optional) | No |

#### Skill Output

A file at `wai/byoa/<name>.agent.md` containing:

```markdown
---
name: "<Project> Frontend Engineer"
description: >-
  Frontend specialist for this project. Uses [detected stack].
  Invoke when: building pages, creating components, fixing
  frontend build errors, or implementing UI features.
---

# <Project> Frontend Engineer

## Stack
[auto-detected from package.json]

## Conventions
[auto-detected from directory structure]

## Completion Protocol
[standard build/test verification]
```

### Acceptance Criteria

#### AC 1: Eval — Fixture and Workflow Exist

`plugins/wai/eval/maestro-test-cases.json` (≥3 cases) and
`plugins/wai/eval/eval-maestro.js` exist and produce
`eval-results.json` when run.

#### AC 2: Eval — Smoke Test Passes

All 3 Phase 1 cases pass against current Maestro.

#### AC 3: BYOA — Project Agents Take Precedence

When a project has `wai/byoa/frontend-engineer.agent.md`
whose description covers FRONTEND, Maestro dispatches to it
instead of WAI FDS Engineer.

#### AC 4: BYOA — Fallback Preserved

When no project agent covers a category, Maestro falls back to
plugin specialists (for FDS projects) or handles directly (for
non-FDS projects).

#### AC 5: BYOA — No Config File Required

Projects activate BYOA by placing an agent file — no
`wai/maestro.json` or other config needed.

#### AC 6: BYOA — Cross-Harness

Project agents in `wai/byoa/` work in any harness that
invokes Maestro — Claude Code, VS Code Copilot, or others.
Maestro handles the discovery; the harness doesn't need to
know about the directory.

#### AC 7: MAI Concept Documented

The MAI (project-local) vs WAI (plugin default) distinction is
documented in Maestro's routing protocol and communicated to
users.

#### AC 8: Skill — `/create-mai-agent` Works

Running `/create-mai-agent` in a project produces a valid agent
file at `wai/byoa/` that Maestro successfully discovers and
routes to on the next invocation.

#### AC 9: Skill — Description Matches Maestro Signals

The generated agent's description contains trigger signals that
Maestro's routing heuristic matches for the chosen category.
Verified by running the eval after agent creation.

#### AC 10: Backward Compatibility

Group 1 users (FDS projects, no custom agents) experience no
change in behavior.

### Notes/Constraints/Caveats

- **Description matching is heuristic**: Maestro infers category
  coverage from description text. A poorly-written description
  may not match. This is acceptable — the fix is to improve the
  description, not add config.
- **Multiple project agents for one category**: If a project has
  two agents both covering FRONTEND, Maestro picks the first
  match (alphabetical). This is an edge case unlikely in
  practice.
- **Eval scope expands**: Phase 2 eval cases should include
  BYOA scenarios (project agent exists → Maestro defers). This
  requires fixture cases with simulated project-agent context.
- **Plugin name stays "wai"**: Only agent display names change
  to MAI. The plugin directory remains `plugins/wai/` to avoid
  breaking existing installations.

### Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Description matching mis-routes | Medium — wrong agent invoked | Heuristic is conservative; only matches obvious signals. Eval catches regressions. |
| Teams confused by wai/byoa/ location | Low — documentation gap | README in `wai/byoa/` explains the convention; Maestro logs which agents it discovers |
| Project agents conflict with plugin agents | Low — precedence is clear | Project always wins; documented in routing protocol |
| Eval flakiness from non-determinism | Low — smoke cases are unambiguous | Phase 1 uses only clear cases; Phase 2 adds stability classification |
| BYOA adds complexity to Maestro prompt | Low — ~10 lines added | Routing logic is simple (check directory, match descriptions, fall through) |

## Design Details

### Eval: Test Fixture Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "id",
      "prompt",
      "expected_categories",
      "expected_dispatch",
      "handle_directly"
    ],
    "properties": {
      "id": { "type": "string" },
      "prompt": { "type": "string" },
      "expected_categories": {
        "type": "array",
        "items": {
          "enum": [
            "FRONTEND", "BACKEND", "PRODUCT",
            "SCAFFOLD", "GENERAL"
          ]
        }
      },
      "expected_dispatch": {
        "type": "array",
        "items": { "type": "string" },
        "nullable": true
      },
      "handle_directly": { "type": "boolean" },
      "band": {
        "enum": [
          "clear", "multi-category",
          "handle-directly", "edge", "adversarial"
        ]
      },
      "notes": { "type": "string" }
    }
  }
}
```

### Eval: Workflow Script

Located at `plugins/wai/eval/eval-maestro.js`. Uses `pipeline()`
to fan out classify agents with structured schema output, then
compares deterministically with `setsEqual()` (treats `null` and
`[]` as equivalent for dispatch targets).

Gate: Phase 1 = all must pass. Phase 2 = ratcheting threshold.

### BYOA: Maestro Routing Change

Step 2 of the routing protocol changes from:

```markdown
### Step 2: Check Project Context (FRONTEND and BACKEND only)

Read `package.json` in the workspace root.
- If it does not contain @lifesg/react-design-system:
  reclassify as SCAFFOLD.
```

To:

```markdown
### Step 2: Resolve Agents

For each classified category (FRONTEND, BACKEND):

1. Check wai/byoa/ for project-local agents whose
   description covers the category.
2. If a project agent matches → use it as the dispatch target
   for that category.
3. If no project agent matches → check package.json:
   - Has @lifesg/react-design-system → use MAI specialists
   - No package.json or no FDS → reclassify as SCAFFOLD
     (if building new) or handle directly (if working on
     existing code)
```

### BYOA: Example Project Agent

A team using Next.js + shadcn drops this file:

```markdown
// wai/byoa/frontend-engineer.agent.md
---
name: "Frontend Engineer"
description: >-
  Frontend specialist for this project. Uses Next.js 14
  App Router, shadcn/ui, and Tailwind CSS. Invoke when:
  building pages, creating components, fixing frontend
  build errors, or implementing UI features.
---

# Frontend Engineer

## Stack
- Next.js 14 (App Router)
- shadcn/ui + Tailwind CSS
- TypeScript strict mode

## Conventions
- Components in src/components/
- Pages in src/app/
- Shared hooks in src/hooks/
- Run `pnpm build` before reporting done
```

Maestro reads the description, sees it covers FRONTEND triggers
("building pages", "creating components", "frontend build
errors", "UI features"), and dispatches to it instead of MAI FDS
Engineer.

### Skill: `/create-mai-agent`

Located at `plugins/wai/skills/cc-create-mai-agent/SKILL.md`.

**Workflow:**

1. Detect project stack:
   - Read `package.json` → extract framework, UI lib, test
     runner
   - Read `tsconfig.json` → extract path aliases, strictness
   - Scan directory structure → infer conventions (where
     components live, where pages live, where API routes live)
2. Ask user which category (FRONTEND, BACKEND, or both)
3. Read current Maestro config (`maestro.agent.md`) → extract
   the trigger signals for the chosen category from Step 1's
   classification table
4. Generate agent file with:
   - `description` containing those exact trigger signals
   - Stack details from detection
   - Convention-based instructions (file paths, patterns)
   - Completion protocol (build command, test command)
5. Write to `wai/byoa/<name>.agent.md`
6. Validate: invoke Maestro with a sample prompt for the
   category, confirm it discovers and routes to the new agent

**Key design constraint:** The skill reads Maestro's current
classification table to generate descriptions. If Maestro's
signals change, running the skill again regenerates aligned
descriptions. This creates a feedback loop — Maestro and MAI
agents stay in sync.

### MAI vs WAI: No File Renames

WAI agent files stay as-is. No renames. "MAI" is a conceptual
label for project-local agents, not a file prefix:

- `plugins/wai/agents/wai-fds-engineer.agent.md` → unchanged
- `plugins/wai/agents/wai-backend-engineer.agent.md` → unchanged
- `plugins/wai/agents/wai-product-manager.agent.md` → unchanged

A project's own agents use whatever name the team chooses:
- `wai/byoa/frontend-engineer.agent.md`
- `wai/byoa/backend-engineer.agent.md`

Maestro's routing protocol documents the two tiers:
"MAI agents (project-local) take precedence over WAI agents
(plugin defaults)."

## Alternatives

### Alt 1: Config file for BYOA (`wai/maestro.json`)

Require projects to declare agent mappings explicitly.

**Rejected:** Adds friction. The agent description already
contains everything needed for routing. A config file
duplicates information and requires maintenance.

### Alt 2: Maestro doesn't support BYOA — rely on harness

Let each harness handle project agents natively. Don't change
Maestro at all.

**Rejected:** Works for Copilot but not Claude Code. In Claude
Code, Maestro intercepts all prompts and overrides native
routing. Maestro must be fixed to not override.

### Alt 3: Separate Maestro for Group 1 and Group 2

Two Maestro variants: one for FDS projects, one for BYOA.

**Rejected:** User shouldn't need to choose which Maestro to
use. One agent, one routing protocol, precedence chain handles
both groups transparently.

### Alt 4: Rename WAI agents to MAI

Rename the plugin's default agents from WAI to MAI.

**Rejected:** WAI agents are plugin-provided defaults — they
belong to the plugin, not the user. "MAI" is reserved for
project-local agents that truly are "mine." Renaming WAI to MAI
would blur the distinction between defaults and custom agents.

## Infrastructure Needed (Optional)

None. All changes are to agent markdown files within the
existing plugin structure. Eval runs locally on the developer's
own API key.

---

## Review & Acceptance Checklist

- [ ] Eval: 3 smoke-test cases pass against current Maestro
- [ ] Eval: workflow produces valid `eval-results.json`
- [ ] BYOA: project agent in `wai/byoa/` takes precedence
      over plugin specialist
- [ ] BYOA: fallback to plugin specialists works when no project
      agent matches
- [ ] BYOA: works in Claude Code (Maestro discovery) and Copilot
      (native description matching)
- [ ] MAI vs WAI distinction documented in routing protocol
- [ ] Skill: `/create-mai-agent` produces a valid agent file
- [ ] Skill: generated description matches Maestro's trigger
      signals for the chosen category
- [ ] Skill: Maestro discovers and routes to the generated agent
- [ ] Backward compatibility: FDS project without custom agents
      behaves identically to pre-change

## Execution Status

*Updated by co-pilot during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities resolved (grilling session — 7 eval decisions,
      BYOA design, MAI naming)
- [x] Part 1 sections filled
- [x] Part 2 sections filled

---
