---
name: test-manage-skills
description: >-
  AI-driven functional and security testing for
  manage-skills.sh. Executes mandatory test cases from the
  test plan, then runs exploratory tests for edge cases and
  attack vectors. Use when: testing manage-skills.sh, verifying
  security fixes, or validating the community skill management
  pipeline. Triggers on: "test manage-skills", "test the skill
  script", "run manage-skills tests", "verify manage-skills".
argument-hint: >-
  Optional: "functional only", "security only", or
  "exploratory only" to limit scope. Default runs all.
user-invocable: true
---

# Test manage-skills.sh

AI-driven test suite for
`plugins/community/scripts/manage-skills.sh`. Executes
mandatory functional and security tests from the test plan,
then explores edge cases and attack vectors beyond the
plan's fixed set.

## Quick Reference

| Scope         | What runs                             |
|---------------|---------------------------------------|
| **Full**      | Mandatory functional + security + exploratory |
| **Functional only** | F1–F8 from the test plan       |
| **Security only**   | S1–S8 from the test plan       |
| **Exploratory only** | E1–E8 areas from the test plan |

---

## Prerequisites

The script under test is at:
`plugins/community/scripts/manage-skills.sh`

The test plan is at:
`plugins/community/scripts/manage-skills.test-plan.md`

Required tools: `git`, `python3`, `realpath`, `bash`.

Functional tests F3–F6 clone from GitHub and require network
access. Security and most exploratory tests are purely local.

---

## Workflow

### Phase 1 — Read the test plan

Read `plugins/community/scripts/manage-skills.test-plan.md`
in full. This is the authoritative source for mandatory test
cases and exploratory areas. Do not skip or summarize — every
mandatory test must be executed exactly as specified.

### Phase 2 — Setup

Snapshot files that will be mutated during testing:

```bash
cp plugins/community/plugin.json \
   plugins/community/plugin.json.bak
cp plugins/community/skills/.manifest.json \
   plugins/community/skills/.manifest.json.bak
```

Set the script path for convenience:

```bash
SCRIPT="plugins/community/scripts/manage-skills.sh"
```

### Phase 3 — Execute mandatory tests

Run every mandatory test from the test plan. For each test:

1. Run the command exactly as specified in the plan.
2. Capture stdout, stderr, and the exit code.
3. Evaluate the pass criteria from the plan.
4. Record the result (PASS or FAIL with details).

**Execution order matters.** Functional tests F3–F6 are
sequential (add → duplicate → update → delete). All other
tests are independent.

For test S8 (poisoned manifest), restore the manifest
snapshot immediately after the test before continuing.

If a mandatory test FAILs, continue running all remaining
tests — do not stop early.

### Phase 4 — Exploratory testing

Choose at least 3 areas from the exploratory section of the
test plan (E1–E8). For each area:

1. Design specific test inputs based on the area description.
2. Run the tests and capture results.
3. Note any unexpected behavior — crashes, hangs, unclear
   error messages, or security bypasses.

You are encouraged to think of additional edge cases beyond
those listed in the plan. The goal is to find bugs and
security gaps that the mandatory tests miss.

**Security-focused exploration is highest priority.** If time
is limited, prioritize E1 (special characters), E4 (symlink
attacks), and E7 (manifest value injection) over others.

### Phase 5 — Teardown

Restore all snapshots and clean up test artifacts:

```bash
mv plugins/community/plugin.json.bak \
   plugins/community/plugin.json
mv plugins/community/skills/.manifest.json.bak \
   plugins/community/skills/.manifest.json
rm -rf plugins/community/skills/__test-*
```

Run `git status` and verify the working tree is clean under
`plugins/community/`. If any files remain modified or
untracked, report them as a teardown failure.

### Phase 6 — Report

Present results in this exact format:

#### Mandatory Test Results

| Category   | Test | Expected         | Actual           | Status |
|------------|------|------------------|------------------|--------|
| Functional | F1   | (from plan)      | (what happened)  | PASS   |
| ...        | ...  | ...              | ...              | ...    |
| Security   | S1   | (from plan)      | (what happened)  | PASS   |
| ...        | ...  | ...              | ...              | ...    |

#### Exploratory Test Results

| Area | Test Description     | Input            | Result   | Status |
|------|----------------------|------------------|----------|--------|
| E1   | emoji in skill name  | `skill-🔥`      | rejected | PASS   |
| ...  | ...                  | ...              | ...      | ...    |

#### Findings

List any issues, concerns, or suggestions discovered during
testing. Include:
- Security bypasses (CRITICAL)
- Crashes or unhandled errors (HIGH)
- Unclear error messages (LOW)
- Missing validation (MEDIUM)

If no issues were found, state: "No issues found."

#### Teardown Verification

State whether `git status` confirmed a clean working tree.

---

## Acceptance Criteria

### Feedforward Assertions (MUST-contain)

- [ ] All 8 mandatory functional tests (F1–F8) executed and
      reported
- [ ] All 8 mandatory security tests (S1–S8) executed and
      reported
- [ ] At least 3 exploratory areas tested with specific
      inputs
- [ ] Results presented as the structured markdown tables
      defined above
- [ ] Teardown verification confirms clean working tree
- [ ] Any FAIL result includes the actual output that
      diverged from expectation

### Feedback Sensors (MUST-NOT-contain)

- MUST-NOT: Skipped mandatory tests (every F and S test must
  appear in the results table)
- MUST-NOT: Modified files left in the working tree after
  teardown (test pollution)
- MUST-NOT: Real vendored skills deleted or modified during
  testing (only `__test-*` prefixed skills may be created or
  removed)
- MUST-NOT: Tests reported as PASS when the actual output
  does not match the expected criteria
- MUST-NOT: Exploratory testing skipped entirely

**PASS example** — correctly reported security test:

```
| Security | S1 | exits 1, contains "'.' and '..' are not allowed" |
  exits 1, output: "✖  Invalid skill name '..': '.' and '..'
  are not allowed." | PASS |
```

**FAIL example** — test marked PASS despite wrong exit code:

```
| Security | S1 | exits 1 | exits 0, no error | PASS |
```

This is a false positive — the status must be FAIL.
