# EP-0003: Maestro Automated Evaluation Harness

**Created**: 2026-08-12
**Status**: Draft
**Input**: User description: "Create an Enhancement Proposal for
adding automated evaluations to the Maestro routing agent. The
eval system should: (1) use a JSON test fixture with test cases
covering classification accuracy, multi-category tagging, edge
cases, and dispatch decisions; (2) use a Claude Code workflow as
the eval harness; (3) be runnable locally via a skill; (4)
trigger on demand when iterating on maestro.agent.md."

- [Summary](#summary)
- [Motivation](#motivation)
  - [Goals](#goals)
  - [Non-Goals](#non-goals)
- [Proposal](#proposal)
  - [Scope: Classification-Only](#scope-classification-only)
  - [Phased Rollout](#phased-rollout)
  - [Test Fixture Design](#test-fixture-design)
  - [Workflow Eval Harness](#workflow-eval-harness)
  - [Ratcheting Threshold](#ratcheting-threshold)
  - [Stability Classification](#stability-classification)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Notes/Constraints/Caveats](#notesconstraintscaveats)
  - [Risks and Mitigation](#risks-and-mitigation)
- [Design Details](#design-details)
  - [Test Fixture Schema](#test-fixture-schema)
  - [Workflow Script](#workflow-script)
  - [Invocation](#invocation)
- [Alternatives](#alternatives)
- [Infrastructure Needed (Optional)](#infrastructure-needed-optional)
- [Review & Acceptance Checklist](#review--acceptance-checklist)
- [Execution Status](#execution-status)

## Summary

Add a local evaluation system for the Maestro routing agent that
runs a JSON test fixture through a Claude Code workflow, compares
classification decisions against expected outputs using
deterministic JSON comparison, and reports pass/fail with
accuracy metrics. The eval is invoked on demand via an
`/eval-maestro` skill when iterating on the agent definition.

The system launches with 3 smoke-test cases (Phase 1) and
expands to 15–20 cases with stability classification when the
agent stabilizes (Phase 2).

## Motivation

The Maestro agent is the single entry point for non-dev users
building web applications. Every change to its system prompt —
rewording trigger conditions, adjusting the "handle directly vs.
dispatch" threshold, or adding new categories — can silently
break routing for entire classes of prompts. Today there is no
automated way to detect these regressions.

The existing `validate-*.sh` scripts check agent *output format*
(presence of keywords, absence of forbidden patterns) but do not
test *routing decisions*. A format-valid response that dispatches
to the wrong specialist is invisible to current validation.

Routing is a classification problem. Classification problems have
well-established evaluation methodology: fixed inputs, expected
labels, accuracy measurement. This EP applies that methodology
to the Maestro agent using Claude Code's workflow primitive as
the test runner.

### Goals

1. Catch catastrophic routing regressions — Maestro must still
   route obvious cases correctly after any change.
2. Provide a fast local feedback loop — run the eval workflow
   during development to verify routing before committing.
3. Use a ratcheting threshold that tightens as accuracy improves,
   preventing gradual quality drift.
4. Separate stable classifications (regression signal) from
   inherently unstable ones (reliability signal) by running
   cases multiple times.
5. Produce machine-readable results (`eval-results.json`) for
   trend tracking.
6. Start minimal (3 cases) and grow the fixture organically as
   real mis-routings are discovered.

### Non-Goals

- CI integration — no API key exposure in GitHub Actions. This
  is local-only for now.
- Evaluating specialist agent quality (FDS Engineer, Backend
  Engineer output) — those have their own validation scripts.
- Testing the scaffold skills (`cc-vite-react-ds`,
  `cc-fullstack-vite`).
- Evaluating prompt refinement quality or response prose style.
- Testing the project-context filesystem check (Step 2 of
  Maestro's routing protocol) — that is a deterministic grep,
  not an LLM classification.
- VS Code Copilot cross-harness testing.
- Building a general-purpose agent eval framework.

## Proposal

### Scope: Classification-Only

The eval tests Maestro's Step 1 (intent classification) and
Step 3 (dispatch decision). It does NOT test Step 2 (project
context check — reading `package.json` for FDS dependency).

**Rationale**: Step 2 is deterministic (grep for a string in a
file). It is better tested with a shell script that asserts
presence/absence of `@lifesg/react-design-system` triggers the
correct reclassification. Mixing filesystem state into an LLM
eval adds complexity without proportional value.

Test cases must be self-contained — they cannot rely on project
context for routing decisions.

### Phased Rollout

#### Phase 1: Smoke Test (now)

- 3 test cases: one clear FRONTEND, one clear BACKEND, one
  GENERAL/handle-directly
- Gate: all 3 must pass (binary — no percentage threshold)
- No stability classification (too few cases)
- Purpose: catch catastrophic regressions (Maestro stops
  classifying entirely)

#### Phase 2: Full Eval (when agent stabilizes)

- Expand to 15–20 cases across coverage bands
- Enable ratcheting threshold
- Enable stability classification (3x runs per case)
- Add coverage bands: clear singles, multi-category,
  handle-directly, edge/ambiguous
- Purpose: catch subtle threshold drift and boundary regressions

The Phase 2 trigger is: Maestro has not changed for 2+ weeks
AND the routing rules are considered stable by the maintainer.

### Test Fixture Design

A JSON file containing test cases, each specifying:

- A user prompt (the input)
- Expected category tags (the ground truth)
- Expected dispatch targets (which agents should be invoked)
- Whether Maestro should handle directly
- Difficulty band (Phase 2 only)

Test cases are versioned alongside the agent file. When Maestro's
routing rules change intentionally, test cases update in the same
commit. Every confirmed real-world mis-routing becomes a new test
case (bug-driven test growth).

### Workflow Eval Harness

A Claude Code workflow (`eval-maestro.js`) that:

1. Loads the test fixture
2. Fans out all cases via `pipeline()` — each case spawns a
   classify agent that receives the Maestro system prompt and
   returns a structured routing decision
3. Compares results against expected output using deterministic
   JSON comparison (set equality for arrays, boolean equality
   for handle_directly) — no grader agent
4. Aggregates results: pass/fail per case, overall accuracy

The workflow uses `schema` on classify agents to enforce
structured output — no string parsing needed.

**Why a workflow for 3 cases?** Architectural consistency. The
same workflow scales to Phase 2 without rewriting the harness.
The overhead (~30 seconds) is acceptable for a local dev tool.

### Ratcheting Threshold

Phase 1 uses a binary gate: all cases must pass.

Phase 2 introduces a ratcheting threshold:

1. First run establishes the baseline accuracy
2. Threshold is set to `baseline - 5%`
3. When accuracy improves, threshold advances to
   `new_highest - 5%`
4. The threshold is stored in `eval-results.json` and read by
   subsequent runs

This catches *regressions* without demanding an arbitrary fixed
bar. The 5% margin accommodates LLM non-determinism on
edge cases.

### Stability Classification

Phase 2 only. On initial baseline (or when `--calibrate` is
passed):

1. Run each case 3 times
2. Cases that produce consistent results across all 3 runs are
   marked **stable** — these count toward the accuracy threshold
3. Cases that produce inconsistent results are marked
   **unstable** — reported separately as "Maestro is unreliable
   for this prompt class" but do not count toward the gate

This separates:
- **Regression detection** (stable case flips = real bug)
- **Reliability measurement** (unstable case = ambiguous prompt
  that needs a Maestro rule clarification)

### Acceptance Criteria

#### AC 1: Test Fixture Exists

A file at `plugins/wai/eval/maestro-test-cases.json` contains
≥3 test cases conforming to the defined schema.

#### AC 2: Workflow Executes Successfully

Running `/eval-maestro` produces `eval-results.json` with
per-case verdicts and an aggregate pass/fail.

#### AC 3: Binary Gate (Phase 1)

The workflow reports FAIL if any of the 3 smoke-test cases
produces an incorrect classification.

#### AC 4: Deterministic Grading

Grading uses pure JSON comparison (set equality for arrays,
boolean equality for scalars, null/empty-array equivalence).
No grader agent is involved.

#### AC 5: Machine-Readable Output

The workflow returns structured data: per-case verdicts with
predicted vs. expected values, aggregate accuracy, and
pass/fail status.

### Notes/Constraints/Caveats

- **Non-determinism**: LLM outputs are non-deterministic. The
  same prompt may classify differently across runs. Phase 1
  mitigates by using only clear, unambiguous cases. Phase 2
  adds stability classification to separate signal from noise.
- **Cost**: Phase 1 spawns 3 agent calls per run (~3K tokens,
  negligible). Phase 2 spawns 15–20 classify calls (~20K
  tokens, <$0.10 per run).
- **No project context**: Test cases are self-contained. The
  project-context filesystem check (Step 2) is out of scope.
- **Fixture growth**: New test cases are added when real
  mis-routings are discovered — bug-driven, not speculative.
- **Local-only**: Runs on the developer's own API key. No
  shared CI infrastructure required.

### Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| 3 cases miss subtle regressions | Medium — false confidence | Accepted for Phase 1; expand in Phase 2 when agent stabilizes |
| LLM non-determinism on smoke cases | Low — clear cases are stable | Use `effort: 'low'` and structured schema; cases are deliberately unambiguous |
| Fixture becomes stale | Medium — eval loses value | Bug-driven growth; update fixture in same commit as rule changes |
| Developer forgets to run eval | Medium — no enforcement | Acceptable trade-off vs. CI cost of API key exposure; revisit when CI secrets are available |
| Eval gives false confidence | Medium — passes but routing is broken for real prompts | Grow fixture from real mis-routings, not hypothetical cases |

## Design Details

### Test Fixture Schema

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
      "id": {
        "type": "string",
        "description": "Unique case identifier"
      },
      "prompt": {
        "type": "string",
        "description": "The user message to classify"
      },
      "expected_categories": {
        "type": "array",
        "items": {
          "enum": [
            "FRONTEND",
            "BACKEND",
            "PRODUCT",
            "SCAFFOLD",
            "GENERAL"
          ]
        }
      },
      "expected_dispatch": {
        "type": "array",
        "items": { "type": "string" },
        "nullable": true,
        "description": "Expected agent names or null"
      },
      "handle_directly": {
        "type": "boolean"
      },
      "band": {
        "enum": [
          "clear",
          "multi-category",
          "handle-directly",
          "edge",
          "adversarial"
        ],
        "description": "Phase 2 only"
      },
      "notes": {
        "type": "string"
      }
    }
  }
}
```

### Workflow Script

Located at `plugins/wai/eval/eval-maestro.js`. The source of
truth is the file itself — the snippet below is illustrative
of the architecture, not a copy of the implementation.

Key design decisions in the implementation:

- `isEmpty()` helper treats `null` and `[]` as equivalent
  (both mean "no dispatch") — discovered during first eval run
  where the model returned `[]` instead of `null`
- Results include both `predicted` and `expected` objects for
  easy debugging of failures
- Failed cases are logged individually with which dimensions
  mismatched (cat/disp/direct)

```javascript
// Simplified structure — see eval-maestro.js for full source
const predictions = await pipeline(
  cases,
  (c) => agent("Classify...", {
    schema: CLASSIFY_SCHEMA, effort: 'low'
  })
)

// Deterministic comparison (no grader agent)
function isEmpty(a) { return !a || a.length === 0 }
function setsEqual(a, b) {
  if (isEmpty(a) && isEmpty(b)) return true
  if (isEmpty(a) || isEmpty(b)) return false
  // ... set equality check
}
```

### Invocation

No skill wrapper — invoke the workflow directly in any Claude
Code session:

- Ask: "run the maestro eval"
- Or explicitly: "run the workflow at
  `plugins/wai/eval/eval-maestro.js` with args from
  `plugins/wai/eval/maestro-test-cases.json`"

## Alternatives

### Alternative 1: Deterministic string-matching validation

Extend existing `validate-*.sh` scripts with grep patterns that
check Maestro's output for expected keywords.

**Rejected because:** String matching cannot validate routing
*decisions* — only output *format*. A response that says
"FRONTEND" in its reasoning but dispatches to the wrong agent
would pass string validation.

### Alternative 2: Manual regression testing

Maintain a checklist of prompts to test manually after each
Maestro change.

**Rejected because:** Manual testing doesn't scale, is
error-prone, and relies on developer discipline. The eval makes
verification a one-command habit.

### Alternative 3: Grader agent for fuzzy comparison

Spawn a second LLM agent to judge whether the classification
is "close enough" to expected.

**Rejected because:** All grading dimensions are deterministic
(set equality, boolean equality). A grader agent doubles cost,
adds non-determinism, and masks imprecise test fixtures. If a
classification is "close enough," the test case should be
updated to reflect the correct answer.

### Alternative 4: Single claude call (no workflow)

Pass all 3 prompts in a single API call, parse the response.

**Rejected because:** Architectural inconsistency with Phase 2.
When the fixture grows to 15–20 cases, parallelism matters.
Using a workflow from the start means Phase 2 is a fixture
expansion, not a rewrite.

### Alternative 5: CI-gated eval with GitHub Actions

Run the eval in CI on every push that touches the agent file.

**Deferred (not rejected):** Requires exposing an Anthropic API
key as a CI secret. Revisit when the team has a shared API key
or when Anthropic offers CI-friendly auth (e.g., OIDC token
exchange).

## Infrastructure Needed (Optional)

None. The eval runs locally using the developer's own Claude
Code session and API key.

---

## Review & Acceptance Checklist

- [x] Test fixture contains 3 smoke-test cases
- [x] Workflow executes locally and returns structured results
- [x] All 3 cases pass against current Maestro (baseline
      verified 2026-08-12)
- [x] Workflow invocable via natural language in Claude Code
- [x] Results contain per-case verdicts with predicted/expected
- [x] Grading is purely deterministic (no grader agent)
- [x] Null/empty-array equivalence handled
- [ ] Phase 2 expansion criteria documented

## Execution Status

*Updated by co-pilot during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities resolved (grilling session — 7 decisions)
- [x] Part 1 sections filled
- [x] Part 2 sections filled
- [x] Phase 1 implemented and verified (3/3 pass, 2026-08-12)

---
