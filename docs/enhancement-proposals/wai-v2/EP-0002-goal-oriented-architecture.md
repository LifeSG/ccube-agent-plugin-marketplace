# EP-0002: WAI v2 Goal-Oriented Architecture

**Created**: 2026-08-10
**Status**: Draft
**Input**: User description: "Create an Enhancement Proposal for
WAI v2: Goal-Oriented Architecture. The EP covers removing the
Maestro orchestrator, removing the SWE agent, removing the Prompt
Refiner agent, and restructuring the remaining agents (PM,
Designer, FDS Engineer, Backend Engineer) as subagent-only tools
that the harness composes dynamically."

- [Summary](#summary)
- [Motivation](#motivation)
  - [Goals](#goals)
  - [Non-Goals](#non-goals)
- [Proposal](#proposal)
  - [Architecture Change](#architecture-change)
  - [Routing Mechanism](#routing-mechanism)
  - [Agent Disposition](#agent-disposition)
  - [Content Redistribution](#content-redistribution)
  - [Workflow Guardrails](#workflow-guardrails)
  - [Self-Verification Protocol](#self-verification-protocol)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Notes/Constraints/Caveats](#notesconstraintscaveats)
  - [Risks and Mitigation](#risks-and-mitigation)
- [Design Details](#design-details)
  - [Agent File Changes](#agent-file-changes)
  - [Skill Changes](#skill-changes)
  - [Validation Scripts](#validation-scripts)
- [Migration Plan](#migration-plan)
- [Alternatives](#alternatives)
- [Infrastructure Needed (Optional)](#infrastructure-needed-optional)
- [Review & Acceptance Checklist](#review--acceptance-checklist)
- [Execution Status](#execution-status)

## Summary

Replace the WAI plugin's rigid 7-phase SDLC orchestrator
(Maestro) with a goal-oriented architecture where the AI harness
(Claude Code / VS Code Copilot) dynamically composes specialist
subagents based on task requirements. Delete three agents
(Maestro, Software Engineer, Prompt Refiner), convert the
remaining four (Product Manager, Designer, FDS Engineer, Backend
Engineer) to subagent-only with enriched description fields that
drive harness routing, extract the SWE's coding standards into
`cc-code-review` resources, and add self-verification to
implementation agents.

The user interacts solely with the bare harness. The harness
reads agent `description` fields to classify intent and dispatch
the appropriate specialist(s). Pipeline depth adapts to task
complexity — a trivial CSS fix dispatches one agent; a new
feature chains PM, Designer, then implementation agents
sequentially.

## Motivation

The current WAI plugin architecture was designed when LLMs needed
explicit workflow sequencing to produce quality results. Maestro
encodes a 7-phase pipeline (Requirements → Design → Brief →
Review → Implement → Verify → Deploy) in a 600+ line agent
definition that mediates every interaction.

With current-generation models and harness capabilities (Claude
Code loops, workflows, dynamic agent dispatch), this orchestrator
creates more problems than it solves:

- **Over-processing**: A trivial CSS fix traverses the full
  pipeline. The "trivial change" escape hatch patches a
  structural problem rather than solving it.
- **Redundant reasoning**: Models already know
  spec-before-code. Encoding it as mandatory phases forces the
  model to follow rules it would follow naturally.
- **Brittleness**: Adding new capabilities (e.g., Figma-to-code)
  requires modifying the orchestrator rather than simply adding
  a new tool.
- **Context waste**: 600+ lines of workflow logic consume context
  budget that could carry domain knowledge instead.
- **Brief generation overhead**: The SWE agent's Brief
  Generation mode produces structured technical contracts that
  the harness itself can produce naturally when composing agents
  sequentially — the PM's output becomes the Designer's input
  becomes the implementer's input without an intermediate
  translation layer.
- **Plugin constraint**: A plugin cannot inject always-on
  instructions into the harness. Cross-cutting rules trapped in
  Maestro are invisible when the harness handles tasks directly.

### Goals

1. Eliminate the Maestro orchestrator and its rigid phase
   pipeline.
2. Let the harness adapt pipeline depth to task complexity
   (simple tasks get 1 step; complex tasks get the full chain).
3. Preserve all valuable domain constraints currently encoded in
   specialist agents.
4. Maintain code review quality by extracting SWE standards into
   `cc-code-review` resources.
5. Reduce total agent count from 13 to 10.
6. Make implementation agents self-verifying (build + test before
   reporting done).
7. Define a concrete routing mechanism that replaces Maestro's
   request classification.
8. Preserve standalone access for PM and Designer agents (Mode B
   from the 80/20 strategy) via enriched descriptions that
   trigger on direct user intent.

### Non-Goals

- Building a user-facing gateway or router skill (parked for
  future consideration).
- Changing the `cc-code-review` skill's orchestration or subagent
  structure.
- Modifying the FDS component catalogue or design system skill.
- Enforcing cross-cutting constraints when the harness handles
  tasks without invoking subagents (accepted risk — see Risks).
- Replacing the harness's native reasoning about when to invoke
  agents (the harness is the orchestrator; we configure it, not
  replace it).

## Proposal

### Architecture Change

Remove the orchestrator layer entirely. The harness reads agent
`description` fields to decide routing and composes agents
dynamically:

```
User states goal
  → Harness classifies intent from agent descriptions
  → Dispatches appropriate subagent(s) sequentially or in parallel
  → Subagents self-verify (build + test)
  → Done
```

The key insight: the harness already performs intent
classification, context management, and sequential/parallel
dispatch. Maestro duplicates this at the cost of 600+ tokens of
system prompt and an additional inference call per turn.

### Routing Mechanism

The harness routes to agents based on their `description` field.
Each agent's description must contain:

1. **Capability declaration** — what the agent does.
2. **Trigger conditions** — when to invoke it.
3. **Input requirements** — what context it needs.

The harness's native routing logic (reading descriptions,
matching to user intent) replaces Maestro's explicit
classification table. This is not implicit — it is the same
mechanism Claude Code already uses for all agent dispatch.

**Complexity-adaptive dispatch** replaces the rigid phase
pipeline:

| User intent | Harness behaviour |
|---|---|
| Informational question | Answer directly (no agent) |
| Trivial change (single file, no schema/API) | Dispatch implementation agent directly |
| Bug report | Dispatch implementation agent with error context |
| Standard feature (multi-file, API/schema) | PM → Designer → FDS Engineer + Backend Engineer |
| Multi-part request | PM (scope all together) → then as standard |
| Design/UX question | Designer directly |
| Product/scope question | PM directly |

This table is not encoded anywhere — it emerges from the
harness's natural reasoning when agent descriptions are
well-written. The descriptions act as the "routing table."

**Example enriched description for FDS Engineer:**

```yaml
description: >-
  Hands-on React implementation specialist using Flagship Design
  System (FDS). Invoke when: (1) React component work is needed
  in src/, (2) a design spec needs to be built, (3) FDS
  compliance issues need fixing, or (4) frontend build errors
  need resolution. Requires: project path, task description,
  and optionally a design spec from WAI Designer. Self-verifies
  with npm run build and npm test before reporting done.
```

### Agent Disposition

| Agent | Action | Rationale |
|---|---|---|
| Maestro | ~~Delete~~ → **Rewrite** | Rewritten as lightweight router (see Design Revision below) |
| Software Engineer | **Delete** | Brief Gen → deleted (harness chains agents directly); Brief Review → deleted (self-verification replaces); Code Review → `cc-code-review` skill (already exists) |
| Prompt Refiner | **Delete** | Invocation-gate logic moves to Designer description; refinement logic is training-data knowledge |
| Product Manager | **Keep as-is** | Already has standalone + subagent modes via description; remains user-invocable for direct product thinking |
| Designer | ~~Modify~~ → **Delete** | Design/UX capabilities absorbed by FDS Engineer (UI) and Maestro-direct (general design questions); standalone Designer added context overhead without clear value |
| FDS Engineer | **Modify** | Add self-verification; update description with trigger conditions and flexible input acceptance; strip Maestro references |
| Backend Engineer | **Modify** | Same as FDS Engineer |

**Note on PM**: This agent remains `user-invocable: true` (or
omit the field, defaulting to invocable). It already has
dual-mode operation (standalone for direct user access, subagent
mode when dispatched with structured input). This preserves
Mode B (SME direct access) from the 80/20 strategy while also
allowing harness composition.

### Content Redistribution

| Content | Source | Destination |
|---|---|---|
| Software Craft Coding Standards | SWE agent §Core Directives | `cc-code-review/resources/software-craft-standards.md` |
| OWASP Top 10 checklist | SWE agent §Security | Already in Security subagent — delete duplicate |
| Brief Generation mode | SWE agent | Deleted — harness passes PM output directly to implementers |
| Brief Review mode | SWE agent | Deleted — self-verification in implementation agents replaces |
| Code Review mode | SWE agent | Already covered by `cc-code-review` skill |
| Architecture Review mode | SWE agent | Harness handles directly (plan mode) |
| Standalone advisory mode | SWE agent | Harness handles directly (native capability) |
| Prompt Refiner invocation gate | `prompt-refiner.sub.agent.md` | Deleted — instruction file `prompt-refiner-auto-accept.instructions.md` also deleted |
| Prompt Refiner logic | `prompt-refiner.sub.agent.md` | Deleted — prompt refinement is training-data knowledge; Designer does not need explicit refinement instructions |
| Delegation templates | Maestro agent body | Deleted — harness constructs context naturally |
| Error Fix Brief template | Maestro agent body | Absorbed into self-verification protocol in implementation agents |
| Communication rules | Maestro agent body | Deleted — harness default communication is sufficient |
| Request classification table | Maestro agent body | Encoded implicitly via agent descriptions |

### Workflow Guardrails

The following guardrails currently in Maestro are preserved
through different mechanisms:

| Guardrail | Current (Maestro) | New (v2) |
|---|---|---|
| User approval before implementation | Phase 1.1 gate: "Do NOT proceed without user sign-off on MVP scope" | PM agent's own instructions: "In standalone mode, produce a Product Brief only when the user has confirmed scope" — unchanged |
| Build verification | Phase 4: explicit `npm run build` step | Self-verification in implementation agents (see below) |
| Test execution | Phase 5: explicit `npm test` step | Self-verification in implementation agents |
| Error recovery with cycle limit | Phase 4/5: max 3 build-fix, 2 test-fix cycles | Self-verification: max 3 attempts, then report failure to caller |
| Code review | Phase 6: delegate to SWE | User invokes `cc-code-review` skill when desired; or harness suggests it for complex changes |
| Security escalation | SWE non-negotiable OWASP rules | Preserved in implementation agent bodies (already present) |
| Source file guardrail | Maestro: "NEVER create/modify source files" | Not needed — Maestro was the only agent that needed this constraint because it was the only non-implementation agent with file access |

**Guardrails intentionally dropped:**

| Guardrail | Reason for removal |
|---|---|
| Phase indicator in every response | UX scaffolding for non-SWE users; harness communicates naturally |
| "I'm handing this to..." attribution | Harness shows agent dispatch natively in UI |
| Technical vocabulary introduction table | Training-data knowledge; models explain terms naturally |
| Raw output suppression | Harness already summarises subagent output |
| Parallel dispatch mandate (FE + BE same turn) | Harness decides parallelism based on independence |

### Self-Verification Protocol

Both FDS Engineer and Backend Engineer gain terminal constraints
added to their agent bodies:

```markdown
## Completion Protocol

Before reporting your work as done, you MUST:

1. Run `npm run build` in the project root.
   - If build errors reference files you created or modified,
     fix them and re-run.
   - Maximum 3 build-fix attempts. If still failing after 3,
     report the remaining errors to the caller.
   - Do NOT fix errors in files you did not modify.

2. Run `npm test` in the project root.
   - If test failures are in test files for code you wrote,
     fix them and re-run.
   - If test failures are in pre-existing tests you did not
     modify, report them as pre-existing failures — do NOT
     modify others' tests.
   - Maximum 2 test-fix attempts.

3. Report done only after both pass (or after reporting
   unfixable pre-existing failures).
```

This replaces Maestro's Phase 4 and Phase 5 with agent-local
verification that runs without orchestrator involvement.

### Acceptance Criteria

#### AC 1: Maestro Rewrite

The file `plugins/wai/agents/maestro.agent.md` is rewritten as
a lightweight intent-classification router (< 200 lines). It no
longer contains "Phase 1–7" or "SDLC Phases". BYOA discovery
enables project-local agent overrides via `wai/byoa/`.

#### AC 2: SWE Deletion

The file `plugins/wai/agents/wai-software-engineer.agent.md` is
deleted. The Software Craft Coding Standards content exists at
`plugins/wai/skills/cc-code-review/resources/software-craft-standards.md`
and is referenced by the Standards subagent.

#### AC 3: Prompt Refiner Deletion

The file `plugins/wai/agents/prompt-refiner.sub.agent.md` is
deleted. The Designer agent body no longer references "Prompt
Refiner" in its `agents:` frontmatter. The instruction file
`prompt-refiner-auto-accept.instructions.md` is deleted or
updated to remove auto-invocation.

#### AC 4: PM Remains User-Invocable

The PM agent file retains its current invocability (no
`user-invocable: false`). Its description contains clear trigger
conditions for both standalone and subagent invocation. Designer
is deleted (design capabilities absorbed by FDS Engineer and
Maestro-direct handling).

#### AC 5: Implementation Agent Self-Verification

FDS Engineer and Backend Engineer agent bodies contain the
Completion Protocol (npm run build + npm test with cycle limits)
as a terminal constraint.

#### AC 6: Description-Based Routing

All remaining agent `description` fields contain:
- Capability declaration (what)
- Trigger conditions (when to invoke)
- Input requirements (what context is needed)

The descriptions are sufficient for the harness to route without
explicit orchestration logic.

#### AC 7: Code Review Continuity

`cc-code-review` skill functions unchanged. The new
`software-craft-standards.md` resource is loadable by the
Standards subagent via its existing resource-loading mechanism.

#### AC 8: No Orphaned References

No remaining file in `plugins/wai/` references deleted agents
(Maestro, Software Engineer, Prompt Refiner) by name in
`agents:` frontmatter, description fields, or body text — except
in changelog/migration notes.

### Notes/Constraints/Caveats

- **Cross-cutting constraint gap**: When the harness handles a
  simple task without invoking any subagent, domain constraints
  (FDS-only, WCAG AA, parameterised SQL) are not enforced. This
  is an accepted risk. Mitigation: implementation agents enforce
  these when invoked; the harness's own training covers basic
  security hygiene for trivial changes.
- **Plugin limitation**: Neither Claude Code nor Copilot
  currently supports plugin-level always-on instructions. If this
  changes, cross-cutting constraints could move to a plugin
  instruction file.
- **Copilot subagent visibility**: With Maestro deleted, no
  parent agent declares the 4 remaining agents in its `agents:`
  frontmatter for Copilot. Copilot's native model routing
  handles dispatch via descriptions. If Copilot routing proves
  insufficient, a future EP can add a thin router agent for
  Copilot only.
- **Brief generation is not lost — it is inlined**: The harness
  naturally constructs context when chaining agents. PM output
  becomes Designer input becomes implementer input. The SWE's
  Brief Generation mode formalised this into a rigid template;
  v2 allows the harness to pass context in whatever form is most
  appropriate for the task complexity.

### Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Harness skips PM for complex features | Medium — under-scoped implementations | Medium | PM description states: "Invoke when requirements are ambiguous, scope is unclear, or the user describes a problem rather than a solution." Monitor first 10 complex tasks. |
| Implementation agents miss build/test errors | High — broken code shipped | Low | Self-verification is enforced in agent body with cycle limits; existing `validate-*.sh` hooks catch output violations |
| Standards subagent cannot load new resource | Medium — review quality drops | Low | Verify resource path in `cc-code-review/SKILL.md` references; test with `cc-code-review` invocation |
| Harness routes to wrong agent | Low — fixable in next turn | Medium | Descriptions are the tuning mechanism; iterate based on mis-routing incidents |
| Loss of parallel dispatch guarantee | Low — slower but correct | Low | Harness naturally parallelises independent work; if it doesn't, the result is slower but not wrong |
| Designer quality drops without Prompt Refiner | Low — minimal real impact | Low | Prompt refinement adds latency without measurable quality improvement for well-specified design tasks; Designer's own expertise suffices |

## Design Details

### Agent File Changes

**Delete:**
- `plugins/wai/agents/maestro.agent.md`
- `plugins/wai/agents/wai-software-engineer.agent.md`
- `plugins/wai/agents/prompt-refiner.sub.agent.md`

**Modify — `wai-designer.agent.md`:**
- Remove `"Prompt Refiner"` from `agents:` frontmatter
- Remove `"WAI Software Engineer"` from `agents:` frontmatter
- Remove all references to Prompt Refiner invocation in body
- Enrich `description` with trigger conditions
- Keep `"WAI FDS Engineer"` in `agents:` (Designer may delegate
  implementation when operating standalone)

**Modify — `wai-fds-engineer.sub.agent.md`:**
- Change description to include trigger conditions and input
  flexibility
- Replace "Invoked as a subagent by WAI Maestro" with "Invoked
  by the harness or any parent agent"
- Replace "You receive structured implementation briefs from the
  WAI Maestro" with "You receive task context from the invoking
  agent — this may be a structured design spec, a plain-language
  description, or error context for a fix"
- Add Completion Protocol section
- Update Priority Hierarchy item 1 to accept flexible input
  (not only structured briefs)

**Modify — `wai-backend-engineer.sub.agent.md`:**
- Same changes as FDS Engineer (parallel treatment)

**Modify — `wai-product-manager.agent.md`:**
- Enrich `description` with trigger conditions
- Remove "Also invokable as a subagent by WAI Maestro" — replace
  with "Also invokable as a subagent by any orchestrating agent"
- Mode detection: replace "structured Maestro delegation brief"
  with "structured delegation brief (contains Goal: and Context:
  fields)"

**No change:**
- `cc-review-*.sub.agent.md` (all 6 review subagents unchanged)

### Skill Changes

**New file — `plugins/wai/skills/cc-code-review/resources/software-craft-standards.md`:**

Extract from SWE agent body:
- Coding standards (naming, structure, error handling patterns)
- Review checklist items unique to the SWE agent that are not
  already covered by the 5 review subagents

Content scope: only standards that are actionable review criteria.
Delete generic engineering principles (already in model training
data) and domain expertise labels (topic categories without
substance).

**Modify — `plugins/wai/skills/cc-code-review/SKILL.md`:**
- Add `software-craft-standards.md` to the Standards subagent's
  resource loading list (if resources are loaded explicitly)
- Or verify that the Standards subagent loads all files in
  `resources/` automatically

**Delete validation scripts:**
- `validate-maestro.sh` (if it exists)
- `validate-software-engineer.sh` (if it exists)

**Keep validation scripts:**
- `validate-fds-engineer.sh`
- `validate-backend-engineer.sh`

### Validation Scripts

Update existing validation scripts for implementation agents to
check:
- Completion Protocol section exists in agent body
- Agent does not reference Maestro or SWE
- Description contains trigger conditions

### Plugin Manifest

**Modify — `.claude-plugin/plugin.json`:**
- Remove Maestro, SWE, Prompt Refiner from agent declarations
- Update plugin description to remove "orchestrates" language
- Bump version

**Modify — `plugin.json` (VS Code):**
- Same removals as above

## Migration Plan

Strangler-fig approach — each phase is independently deployable
and the plugin remains functional throughout.

### Phase 1: Extract SWE Standards (non-breaking)

1. Create `software-craft-standards.md` in cc-code-review
   resources.
2. Verify Standards subagent can load it.
3. Test `cc-code-review` skill invocation still works.

**Checkpoint:** Code review quality unchanged.

### Phase 2: Add Self-Verification to Implementers (non-breaking)

1. Add Completion Protocol to FDS Engineer body.
2. Add Completion Protocol to Backend Engineer body.
3. Test both agents in isolation — verify they run build/test.

**Checkpoint:** Implementation agents self-verify; Maestro still
works (its Phase 4/5 becomes redundant but harmless).

### Phase 3: Enrich Descriptions (non-breaking)

1. Update all remaining agent descriptions with trigger
   conditions.
2. Update FDS Engineer and Backend Engineer to accept flexible
   input (not only structured briefs).
3. Update PM to remove Maestro-specific language.
4. Update Designer to remove Prompt Refiner dependency.

**Checkpoint:** Agents are independently invocable by the harness
with good routing; Maestro still works but is no longer required.

### Phase 4: Delete Agents (breaking)

1. Delete `maestro.agent.md`.
2. Delete `wai-software-engineer.agent.md`.
3. Delete `prompt-refiner.sub.agent.md`.
4. Remove all `agents:` frontmatter references to deleted agents.
5. Update plugin manifests.
6. Delete related validation scripts.
7. Delete or update `prompt-refiner-auto-accept.instructions.md`.

**Checkpoint:** Plugin is v2. Test representative tasks at all
complexity levels.

### Phase 5: Validate and Tune (post-migration)

1. Run 10 representative tasks: 3 trivial, 4 standard, 3
   complex.
2. Monitor routing accuracy — adjust descriptions if the harness
   mis-routes.
3. Verify code review continuity with `cc-code-review`.
4. Collect user feedback on workflow quality.

## Alternatives

### Alternative 1: Thin Maestro (routing + guardrails only)

Strip the 7-phase pipeline and delegation templates but keep
Maestro as a thin router that:
- Classifies request complexity
- Enforces user-approval gates
- Runs build/test verification after implementation
- Dispatches error recovery loops

**Rejected because:** This reduces Maestro from 600 lines to
~100 lines but still maintains two orchestration paths (Maestro
vs harness direct), requires updating Maestro for every new agent
added, and the "thin" orchestrator tends to accumulate logic over
time (scope creep back to v1). Self-verification in
implementation agents and harness-native routing achieve the same
guarantees without the intermediary.

### Alternative 2: Project policy instruction file

A passive constraint document referenced by all agent bodies via
a shared instruction include. Encodes FDS-only, WCAG AA,
parameterised SQL, and other cross-cutting rules.

**Rejected because:** Plugin instruction files are not currently
supported as always-on by either Claude Code or Copilot. Agents
would need to explicitly load the file, making compliance
voluntary. If plugin-level instructions become supported in the
future, this alternative becomes viable and should be revisited.

### Alternative 3: Kill all agents, rely on raw harness

Delete everything and let the model work without specialist
agents.

**Rejected because:** Domain boundaries prevent scope creep
(FDS Engineer won't make product decisions), capability
declarations improve routing accuracy, security constraints in
agent bodies encode institutional knowledge the model might
forget under context pressure, and context efficiency improves
when specialists load only domain-relevant knowledge.

### Alternative 4: Create `cc-implementation-brief` skill

Replace Maestro's Brief Generation with a standalone skill that
produces structured briefs on demand.

**Rejected because:** The brief solved a coordination problem
that Maestro created (parallel FE+BE dispatch needing pre-agreed
contracts). Without Maestro forcing parallel dispatch, the
harness can chain agents sequentially — PM output feeds Designer,
Designer output feeds implementer — with context flowing
naturally. A brief skill formalises an abstraction that is no
longer needed.

### Alternative 5: Keep SWE as advisory-only agent

Strip Brief Generation and Brief Review modes but keep the SWE
agent for standalone architecture advisory questions.

**Rejected because:** The harness itself (Claude Code with plan
mode) already provides architecture advisory capability. The
SWE's value was in its structured modes (brief gen, review) which
are being replaced by other mechanisms. Keeping an advisory-only
agent that duplicates harness capability adds a routing ambiguity
(when does "architecture question" go to SWE vs harness?) without
adding capability.

## Infrastructure Needed (Optional)

None. All changes are to agent markdown files, skill resource
files, and plugin manifests within the existing plugin structure.

---

## Review & Acceptance Checklist

- [ ] All 8 acceptance criteria verified
- [ ] No regression in `cc-code-review` skill behaviour
- [ ] Representative tasks tested: 3 trivial, 4 standard, 3
      complex
- [ ] PM standalone mode works without Maestro
- [ ] Designer standalone mode works without Prompt Refiner
- [ ] Self-verification triggers in both implementation agents
- [ ] Plugin manifests updated and valid (`claude plugin validate`)
- [ ] No orphaned agent references in any remaining file
- [ ] Migration phases executed in order with checkpoints passing

## Design Revision

*Added 2026-08-14 — documents deviations from the original
proposal made during implementation.*

### Why Maestro Was Kept (Not Deleted)

The original proposal assumed the AI harness (Claude Code / VS
Code Copilot) would natively route to agents by reading their
`description` fields. In practice:

1. **Platform inconsistency** — Claude Code and VS Code handle
   agent dispatch differently. Relying on each platform's native
   routing produced unreliable results.
2. **Multi-category dispatch** — The harness has no native
   mechanism to classify a single prompt into multiple categories
   (e.g., FRONTEND + BACKEND) and dispatch both in parallel.
3. **BYOA discovery** — Project-local agents need a deterministic
   lookup mechanism. The harness does not support priority-based
   agent resolution out of the box.

Maestro was rewritten from a 600+ line SDLC orchestrator into a
189-line intent router. It classifies → resolves → dispatches
without generating briefs, reviews, or workflow phases.

### Why Designer Was Deleted (Not Modified)

The Designer agent's responsibilities were:
- UI/UX design thinking → now handled by FDS Engineer (which
  owns component selection and layout)
- General design questions → handled directly by Maestro
- Prompt Refiner integration → Prompt Refiner itself was deleted

A standalone Designer agent consumed context budget without
providing capabilities that the FDS Engineer + Maestro-direct
combination could not cover. Users needing dedicated design
agents can create `wai/byoa/mai-design.agent.md` via BYOA once
the category list is expanded.

### What Was Added (Not In Original EP)

**BYOA (Bring Your Own Agent):** Projects can provide their own
specialist agents in `wai/byoa/` that Maestro discovers by
strict filename and routes to instead of WAI defaults. This was
not in the original proposal but emerged as the natural
extensibility mechanism for projects that do not use FDS/Koa.

**Eval harness:** A Claude Code workflow script
(`eval/eval-maestro.js`) that validates routing correctness via
schema-validated structured output. Added per EP-0003.

**cc-create-mai-agent skill:** Guides users through creating
properly-structured MAI agent files.

**cc-swe-coach skill:** Advisory skill for non-developers
navigating engineering workflows.

---

## Execution Status

*Updated by co-pilot during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities resolved (routing mechanism, strategy
      alignment, SWE redistribution, guardrails, migration)
- [x] Part 1 sections filled (Summary, Motivation, Goals,
      Non-Goals, Proposal, Acceptance Criteria, Risks)
- [x] No code snippets in Part 1 sections
- [x] No functions or file references in Part 1 sections
- [x] Part 2 sections filled (Design Details, Migration Plan,
      Alternatives)

---
