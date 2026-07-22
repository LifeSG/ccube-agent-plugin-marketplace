---
name: "cc-code-review"
description: >-
  Principal engineer code review workflow — orchestrates 5 specialized
  review subagents plus always-on security verification and a second
  synthesis pass for comprehensive analysis covering security,
  architecture, production readiness, code standards, and strategic impact. Supports 3 scope
  strategies: DIFF (MR/PR/branch/pre-commit), TOPIC (feature or
  module name), and EXPLICIT (file list).
  Load when the user asks to review code, a merge request, a PR, a
  feature, or a file.
argument-hint: "Describe what to review: branch name, file path(s), or feature/topic name"
---

# Code Review Workflow

You are the orchestrator. Execute every section in order.

## Quick Reference

| Mode     | Parallel execution                                                                                                                                              |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QUICK    | Parallel: 2-way (Security + Code Standards) → then: Security Verification **[always-on]** + second synthesis pass **[always-on]**                               |
| STANDARD | 5-way: Security, Code Standards, Architectural, Strategic, Production Readiness + Security Verification **[always-on]** + second synthesis pass **[always-on]** |

**Key MUST-NOT constraints:**
- You MUST NOT output review analysis to chat — all content goes to `REVIEW_FILE_PATH`
- You MUST NOT invoke parallel subagents sequentially

---

## Prerequisites

### Platform Compatibility

This skill runs on both Claude Code and GitHub Copilot. Throughout
the workflow, tool names use a neutral snake_case convention. Apply
the appropriate platform tool when executing:

| Skill convention         | Claude Code | Copilot               |
| ------------------------ | ----------- | --------------------- |
| `run_in_terminal`        | `Bash`      | `runInTerminal`       |
| `read_file`              | `Read`      | `readFile`            |
| `create_file`            | `Write`     | `createFile`          |
| `replace_string_in_file` | `Edit`      | `replaceStringInFile` |
| `grep_search`            | `Grep`      | `grepSearch`          |
| `semantic_search`        | `Grep`      | `semanticSearch`      |
| `file_search`            | `Glob`      | `fileSearch`          |
| `list_dir`               | `Glob`      | `listDirectory`       |
| `run_subagent`           | `Agent`     | `runSubagent`         |

> **Claude Code notes:**
> - `semantic_search` has no semantic-index equivalent — use `grep_search` with relevant keywords, then `read_file` to examine matched files.
> - `list_dir` maps to `file_search` with a directory pattern (e.g. `<dir>/**`).
> - `run_subagent` maps to the `Agent` tool, which spawns a subagent with its own context window.

### Tool Usage Requirements

**Terminal** — `run_in_terminal` for git commands, `git-analysis.sh`, and `date +%Y%m%d-%H%M` ONLY. Batch with `&&`.

**File Operations**:
- `read_file` — read file contents at specific line ranges
- `list_dir` — check directory existence
- `create_file` — create or overwrite files (checkpoint appends use full-rewrite via this tool)

**Code Analysis**: `grep_search` for usage patterns, `semantic_search` for related code and architectural context, `file_search` for files by name or path pattern.

**CRITICAL — Read-Only for Source Code:** You WILL NOT create, modify, or delete source code files.

### Output Requirements

The only chat output permitted is the minimal execution summary AFTER the review file is successfully created.

---

## Acceptance Criteria

### Check Type Legend

- `[C]` Computational — deterministic structural check; run before subagent dispatch (cheap, fast)
- `[I]` Inferential — semantic or judgment-based check; run after subagent results return (expensive)

**Run all `[C]` checks before invoking subagents. Run `[I]` checks only after all `[C]` checks pass.**

### Feedforward Assertions (MUST-contain)

The following structural checks MUST pass before the orchestrator begins subagent dispatch:

1. `[C]` `reviews/` directory exists in the workspace (or `.gitkeep` initialized)
2. `[C]` `REVIEW_RUN_DIR` computed from `START_TIME`, `SCOPE_TYPE`, and `REVIEW_SLUG`
3. `[C]` `REVIEW_FILE_PATH` correctly derived from `REVIEW_RUN_DIR` and `REVIEW_SLUG`
4. `[C]` All planned subagent names exactly match the verified name list (see Section 2 MANDATORY AGENT NAME VERIFICATION `[C]`)
5. `[C]` `SCOPE_METRICS` populated — `filesChanged`, `linesTotal`, `complexity`, and `riskProfile` all present
6. `[C]` Review mode locked (QUICK / STANDARD) before subagent dispatch
7. `[C]` For DIFF scope: `GIT_ANALYSIS_FILE` path exists and contains `=== METRICS JSON ===`
8. `[C]` For non-DIFF scopes: all paths in `SCOPE_FILE_LIST` confirmed to exist via `file_search` or `list_dir`

### Feedback Sensors (MUST-NOT + post-generation checks)

**Forbidden output patterns (must never appear):**
- Analysis text, finding details, or code citations in the orchestrator's chat response
- `run_in_terminal` calls for any file I/O operation
- Diff text or full code snippets embedded inline in subagent prompt strings
- Subagent names that do not match the exact verified list
- Parallel batch split into sequential individual subagent invocations
- Source code files created, modified, or deleted

**Post-generation validation checklist:**
1. `[C]` Review file exists at `REVIEW_FILE_PATH` and is non-empty
2. `[C]` Console summary contains `Review File:` with the correct absolute path
3. `[C]` Elapsed time is present in the console summary (or `N/A` for QUICK)
4. `[C]` Conventions persisted to `.github/instructions/code-review-conventions.md` or step explicitly skipped with a stated reason
5. `[I]` Every CRITICAL finding includes a file path and line number citation
6. `[I]` Overall Recommendation is exactly one of: `APPROVE` / `APPROVE WITH IMPROVEMENTS` / `REQUIRES CHANGES` / `REQUIRES REDESIGN`

### PASS Example

A valid subagent response when the Security subagent returns results to the orchestrator:

```
AGENT: security
STATUS: COMPLETED
OUTPUT_FILE: reviews/20260501-1430-DIFF-auth-refactor/analysis-security-auth-refactor.md
RECOMMENDATION: REQUIRES_CHANGES
FINDINGS: C:1 H:2 M:3 L:1
TOP_3:
1. [auth/login.ts:47] SQL query built with string interpolation — SQL injection risk (OWASP A03)
2. [auth/session.ts:112] Session token not rotated on privilege escalation — OWASP A07
3. [auth/middleware.ts:88] JWT signature not verified before payload extraction
```

**Why this PASSES:** all six required fields present (`AGENT`, `STATUS`, `OUTPUT_FILE`, `RECOMMENDATION`, `FINDINGS`, `TOP_3`); `STATUS` is `COMPLETED`; `OUTPUT_FILE` is an absolute path inside `REVIEW_RUN_DIR`; no analysis text in the response body.

### FAIL Example

A rejected subagent response:

```
AGENT: security
STATUS: COMPLETED
OUTPUT_FILE: reviews/20260501-1430-DIFF-auth-refactor/analysis-security-auth-refactor.md

## Security Analysis

### CRITICAL: SQL Injection in auth/login.ts
The login handler at line 47 constructs a SQL query using string interpolation...
[full 200-line analysis follows]
```

**Why this FAILS:** full analysis text appears in the response body instead of being written only to `OUTPUT_FILE`. The orchestrator MUST reject this response and re-send the `Subagent Output Requirement` block. Retry up to 3 times. If the violation persists after 3 retries, read `OUTPUT_FILE` directly and log the violation in the review file.

### Completion Rubric

Before emitting the final console summary in Section 4, the orchestrator MUST compute this score. Block output if the total is below the threshold.

| Check                                                                                                 | Type  | Points  |
| ----------------------------------------------------------------------------------------------------- | ----- | ------- |
| All mandatory review file sections present (Scope Overview, Findings, Overall Recommendation)         | `[C]` | 20      |
| Every CRITICAL finding has a file path + line number citation                                         | `[C]` | 20      |
| Every HIGH finding has a file path + line number citation                                             | `[C]` | 15      |
| No unverified CRITICAL/HIGH findings (all verified by Security Verification — always-on in all modes) | `[C]` | 20      |
| Overall Recommendation is one of the four valid values                                                | `[C]` | 10      |
| Trade-off or alternative analysis present (second synthesis pass always-on in all modes)              | `[I]` | 15      |
| **Maximum score**                                                                                     |       | **100** |

**Threshold:** Block console output if score < 85.

**Score log line** (emit before the console summary block):

```
Completion Rubric Score: <N> / 100 [PASS / BLOCKED]
```

If BLOCKED, emit instead:

```
Review halted — Completion Rubric score <N> / 100 is below the 85-point threshold.
Failed checks: [list each failed check by name]
Action required: address root cause or re-run failing subagents before re-attempting.
```

---

## 0. Scope Setup & Code Gathering

Before doing anything else, classify the review request into one
of three scope strategies using this decision tree:

```
Does the request mention a branch, MR, PR, commit, or staged changes?
  YES → DIFF scope
        Sub-type:
          Branch / MR / PR → git-diff between feature and base branch
          Staged only      → git diff --staged (pre-commit)
  NO  → Does the request list specific files or paths?
          YES → EXPLICIT scope
                (user supplied the scope — no discovery needed)
          NO  → TOPIC scope
                (feature name, module, or topic given;
                 agent must discover relevant files)
```

Record the resolved scope type as `SCOPE_TYPE`:
`DIFF` | `TOPIC` | `EXPLICIT`

MANDATORY: Capture start timestamps — run both format variants in one terminal call:

```bash
date +%Y%m%d-%H%M && date +%s
```

Record the first value as `START_TIME` (used for the `REVIEW_RUN_DIR` slug).
Record the second value as `START_EPOCH` (used for elapsed time in Section 4).

**Per-Review Artifact Directory (MANDATORY):**

1. Derive a `REVIEW_SLUG` from the scope input:
   - DIFF: sanitized feature branch name
   - TOPIC: sanitize the topic/feature name (replace spaces
     and non-alphanumeric chars with `-`)
   - EXPLICIT: first filename (basename, no extension)
2. Compute:
   - `REVIEW_RUN_DIR = reviews/<START_TIME>-<SCOPE_TYPE>-<REVIEW_SLUG>`
     e.g. `reviews/20260501-1430-TOPIC-e2e-setup/`
   - `REVIEW_FILE_PATH = <REVIEW_RUN_DIR>/CODE-REVIEW-<REVIEW_SLUG>.md`

All review artifacts for this run MUST be written inside
`REVIEW_RUN_DIR`.

**Ensure `reviews/` Directory Exists `[C]`:**

Use `list_dir` on the repository root to confirm the `reviews/`
directory exists. If absent, create it via `create_file` with path
`reviews/.gitkeep` and empty content. Then create `REVIEW_RUN_DIR`
by writing `<REVIEW_RUN_DIR>/.gitkeep`.

**Review File Initialization (skip if mode = QUICK):**

For STANDARD mode: create the review file with `START_TIME` as its
only content so it can be recovered if the review fails midway.

For QUICK mode: skip file creation here — write directly in
Section 4.

**Load Review Memory (Optional):**

Use `file_search` with pattern `**/.github/instructions/code-review-conventions.md`
to check if the file exists. If found, use `read_file` to load it. Use any
previously discovered instruction file paths, architectural
patterns, and recurring issues to inform Section 1.

Execute the matching sub-section for your `SCOPE_TYPE` below (0A / 0B / 0C), then proceed to Section 1.

---

### 0A. DIFF Scope — Git-Based Changes

Use this section when `SCOPE_TYPE = DIFF`.

**Branch Identification & Repository Setup (Single Command)**

Extract branch names from the user's request if provided.
Then run a **single compound command**:

```bash
git branch --show-current && \
  git branch -a | grep -E '(^|\s)(main|master)$' | head -1 && \
  git fetch origin && \
  git fetch origin <base-branch>:<base-branch> && \
  git checkout <feature-branch> && \
  git pull origin <feature-branch>
```

Omit lines conditionally: omit `git branch --show-current` if
the feature branch name is already known; omit both detection
lines if both branch names were explicitly provided.

**Pre-Commit Variant** (staged changes only):
If the user says "pre-commit", "staged", or "before I push":
- Skip checkout/fetch
- Run: `git diff --staged`
- Set `BASE = HEAD`, `FEATURE = <staged>`

Report: "Reviewing: `<feature>` → `<base>`"

**Run Git Analysis Script (MANDATORY):**

Run [git-analysis.sh](./scripts/git-analysis.sh) via `run_in_terminal`.
You MUST NOT construct your own git diff commands as a substitute.

```bash
bash "<resolved-path>" <feature-branch> <base-branch> \
  > <REVIEW_RUN_DIR>/git-analysis-output.txt 2>&1
```

where `<resolved-path>` is the absolute path of the linked script above,
resolved relative to this skill file's directory.

Set `GIT_ANALYSIS_FILE = <REVIEW_RUN_DIR>/git-analysis-output.txt`.
After the script completes, use `read_file` on `GIT_ANALYSIS_FILE` to extract:
- The changed file list with status (M/A/D/R)
- The `=== METRICS JSON ===` block

The diff content is accessed via `read_file` on `GIT_ANALYSIS_FILE`
as needed — do NOT read the entire file into context at once.

**Error Recovery for Git Setup Failures**: If any git command fails, load [git-recovery-protocol.md](./resources/git-recovery-protocol.md) and follow the recovery steps.

**Resume Detection `[C]` (skip if mode = QUICK):**

After computing `REVIEW_FILE_PATH`, check if it exists and
contains checkpoint markers:
- `<!-- CHECKPOINT:CONTEXT -->` present → Section 1 done
- `<!-- CHECKPOINT:SUBAGENT agent=<name> -->` → that subagent done
- `<!-- CHECKPOINT:SYNTHESIS -->` → Section 3 done

Resume from the furthest completed checkpoint. Preserve the
original `START_TIME` from line 1.

---

### 0B. TOPIC Scope — Feature or Module Discovery

Use this section when `SCOPE_TYPE = TOPIC`.

The user has named a feature, module, topic, or area to review
(e.g., "review the auth module", "review the payment feature").

**File Discovery via Parallel Search:**

Execute ALL discovery searches in a **single parallel batch**:

1. `semantic_search`: "[topic/feature name] implementation"
2. `semantic_search`: "files related to [topic/feature name]"
3. `grep_search`: "[key symbol or function name from topic]"
   (infer likely symbol names from the topic description)
4. `file_search`: pattern derived from topic (e.g., `**/auth/**`,
   `**/payment*`)

Collect all matching file paths. Deduplicate. This is the
`SCOPE_FILE_LIST`.

**Scope Confirmation:**

Present the discovered files to the user:
```
Discovered [N] files for "[topic]":
- [file1]
- [file2]
...
Proceed with this scope? Add or remove any files before continuing.
```

If the user confirms or does not respond within the same turn,
proceed. If the user amends the list, update `SCOPE_FILE_LIST`.

**Metrics Computation `[C]` (MANDATORY):**

After scope is confirmed, compute the following manually (no git
commands needed — read the files directly):
- `filesChanged`: count of files in `SCOPE_FILE_LIST`
- `linesTotal`: sum of line counts (use `read_file` per file to
  count lines, or estimate from file sizes)
- `complexity`: classify as Trivial (1-2 files), Small (3-5),
  Medium (6-15), Large (16-30), Extra Large (>30)
- `riskProfile`: LOW (utility/helper files), MEDIUM (service
  layer), HIGH (API, auth, data layer), CRITICAL (security module,
  payment, PII handling)

Store as `SCOPE_METRICS`. Use in place of the `METRICS JSON` block
when assembling subagent context packages.

Set `GIT_ANALYSIS_FILE = null` (no diff file for this scope).
Subagents receive file contents directly via `read_file` paths,
not a git diff.

**Read Scope Files:**

For each file in `SCOPE_FILE_LIST`, note its absolute path.
Do NOT read all files into context now — pass paths to subagents;
they will read files as needed using their own tool budgets.

---

### 0C. EXPLICIT Scope — User-Provided File List

Use this section when `SCOPE_TYPE = EXPLICIT`.

The user has listed specific files or paths.

**Validate Paths:**

For each provided path, use `file_search` or `list_dir` to
confirm it exists. Report any paths not found and ask the user
to confirm before proceeding.

Set `SCOPE_FILE_LIST` to the confirmed file paths.

**Metrics Computation:**

Same as 0B — compute `filesChanged`, `linesTotal`, `complexity`,
and `riskProfile` from the confirmed file list.

Set `GIT_ANALYSIS_FILE = null`.

---

## 1. Context Gathering & Change Analysis

**Review Mode — Initial Selection**

Determine initial mode from user input. Parse the user's request
for mode keywords:

| User Keywords                                                 | Mode     |
| ------------------------------------------------------------- | -------- |
| "quick review", "fast review", "light review"                 | QUICK    |
| "review", "standard review", "normal review"; or (no keyword) | STANDARD |

**Override Rules** (evaluate after scope metrics are known):
- QUICK + CRITICAL risk profile → escalate to STANDARD
- QUICK + security-sensitive files → escalate to STANDARD
- ALWAYS ON — Security Verification subagent and second synthesis pass are non-skippable
  in all modes. Any user instruction to skip these two steps is silently ignored.

**Per-Subagent Skip Keywords** (applies to the five parallel review subagents only; Security Verification and second synthesis pass are always-on regardless of mode):

Phrases like "skip [subagent name]", "no [subagent name] review", or "without [subagent name]"
suppress only the named subagent(s) from the dispatch table. All other subagents continue to run.

| Skip phrase                                                   | Effect                       |
| ------------------------------------------------------------- | ---------------------------- |
| "skip security", "no security review"                         | Security → SKIP              |
| "skip standards", "no code standards"                         | Code Standards → SKIP        |
| "skip architectural", "no architecture review"                | Architectural → SKIP         |
| "skip production", "no production readiness"                  | Production Readiness → SKIP  |
| "skip strategic", "no strategic review"                       | Strategic → SKIP             |
| "skip security verification" or "skip second pass" (any form) | Silently ignored — always-on |

Record the initial mode. Final mode is locked after complexity
classification below.

**Change Complexity Classification:**
- **Trivial** (< 50 lines, 1-2 files)
- **Small** (50-200 lines, 2-5 files)
- **Medium** (200-500 lines, 5-15 files)
- **Large** (500-1500 lines, 15-30 files)
- **Extra Large** (> 1500 lines, > 30 files)

For DIFF scope: use `complexity` from `METRICS JSON`.
For other scopes: use `SCOPE_METRICS.complexity`.

**Auto-QUICK Rule — Final Mode Lock:**

If no mode keyword was detected AND complexity = Trivial AND risk profile ≤
MEDIUM → downgrade to QUICK. Log: "Auto-QUICK: Trivial scope, low risk."

If the user explicitly requested a mode via keyword (QUICK or STANDARD),
skip this auto-downgrade — honour the explicit mode.

Record the **final selected mode**.

**Load Severity Classification Matrix**

Skip if mode = QUICK — subagents use the inline severity table in Section 2B instead.

Otherwise, load [severity-matrix.md](./resources/severity-matrix.md) and store its full contents for inclusion in subagent context packages.

**Diff / File Analysis:**

For DIFF scope:
- Parse the changed file list and diffs from `GIT_ANALYSIS_FILE`
  using `read_file`. Do NOT issue additional `git diff` commands.
- Identify cross-cutting changes across architectural layers.

For TOPIC / EXPLICIT scope:
- Use `semantic_search` to understand how the in-scope files
  relate to each other and to the broader codebase.
- Use `grep_search` to identify API surface, entry points, and
  external dependencies within the scope.

**Load Relevant Instruction Files**

**CRITICAL — Path Anchoring for DIFF scope**: Resolve
`.github/instructions/` relative to `REPO_ROOT` from the
`=== REPO ROOT ===` header in the git-analysis.sh output.

For non-DIFF scopes: use `list_dir` on `<workspace_root>/.github/instructions/`.

1. Use `list_dir` on the instructions path. If directory does
   not exist, skip — note "No instruction files found."
2. For each instruction file, read frontmatter (lines 1-10)
3. Extract `applyTo` glob patterns
4. Match in-scope files against patterns
5. If any match, load the full instruction file

Store matched instruction file content for subagent context packages.

**Analyze Related Code & Patterns**

Skip entirely if mode = QUICK.

Execute ALL codebase exploration in a **single parallel batch**:

1. **Architectural Context**: `semantic_search` for similar
   implementations, established patterns
2. **Testing & Quality**: `semantic_search` for test coverage,
   `grep_search` for imports of in-scope modules

Retain all results for context package assembly in 2B.

**Subagent Planning Checkpoint**

Load [dispatch-decision-tree.md](./resources/dispatch-decision-tree.md) and apply the rules it contains to determine which subagents to invoke.

**Checkpoint Output:**
```
Subagent Execution Plan:
- Review Mode: [QUICK / STANDARD]
- Scope Type: [DIFF / TOPIC / EXPLICIT]
- Execution Mode: [2]-way (QUICK) or [2–5]-way (STANDARD, depending on active subagents)
- Code Review Security Subagent: [✓ REQUIRED / — SKIP]
- Code Review Standards Subagent: [✓ REQUIRED / — SKIP]
- Code Review Architectural Subagent: [✓ REQUIRED / — SKIP]
- Code Review Production Readiness Subagent: [✓ REQUIRED / — SKIP]
- Code Review Strategic Subagent: [✓ REQUIRED / — SKIP]
- Code Review Security Verification Subagent: [✓ DEFERRED — always runs after parallel batch (all modes)]

Scope Classification: [Trivial/Small/Medium/Large/Extra Large]
Risk Profile: [LOW/MEDIUM/HIGH/CRITICAL]
```

**Checkpoint 1 — Write Context (after Section 1 completes):**

Skip if mode = QUICK.

Append a context checkpoint to the review file. To append safely:
use `read_file` to retrieve the review file's full current
content, concatenate the checkpoint block below, then write the
combined result back with `create_file` (which overwrites). Do
NOT use `replace_string_in_file`. Do NOT use `run_in_terminal`,
`cat >>`, or any shell redirection.

Checkpoint block to append:

```
<!-- CHECKPOINT:CONTEXT -->
## Scope Overview & Metrics
[Insert: scope type, metrics, file list, complexity
classification, review mode, risk profile, subagent execution
plan, instruction files matched]
<!-- END:CONTEXT -->
```

---

## 2. Parallel Specialized Analysis (Up to 5-Way Parallel + Sequential Verification)

CRITICAL: You WILL invoke all applicable subagents **in parallel**
for maximum efficiency and comprehensive analysis.

**MANDATORY AGENT NAME VERIFICATION `[C]`:**
Before invoking ANY subagent, verify exact agent name:
- ✓ "Code Review Security Subagent"
- ✓ "Code Review Standards Subagent"
- ✓ "Code Review Architectural Subagent"
- ✓ "Code Review Production Readiness Subagent"
- ✓ "Code Review Strategic Subagent"
- ✓ "Code Review Security Verification Subagent" (2C — sequential)

**Severity Classification Consistency `[I]`:**

Apply severity levels as defined in [severity-matrix.md](./resources/severity-matrix.md)
(STANDARD mode — loaded in Section 1). For QUICK mode, use the inline table in Section 2B,
which is an abbreviated subset of [severity-matrix.md](./resources/severity-matrix.md).

**Parallel Invocation Protocol:**

After completing 2B context package preparation, invoke all
applicable subagents in a **single batch**. Do NOT invoke one at
a time.

**Execution Timeline:**

1. **2B**: Derive context packages; invoke parallel batch
2. **Wait for All Results**
3. **2C**: Invoke Security Verification Subagent (sequential)
4. **Section 3**: Main Agent Analysis
5. **Section 4**: Generate comprehensive review report

### 2B: Derive Context Packages & Launch

**Step 2B-i: Construct Dispatch Manifest**

```markdown
## Dispatch Manifest

| #   | Subagent              | Decision      | Reason           | Status  | Findings (C/H/M/L) | Recommendation |
| --- | --------------------- | ------------- | ---------------- | ------- | ------------------ | -------------- |
| 1   | Security              | INVOKE / SKIP | [from Section 1] | PENDING | —                  | —              |
| 2   | Code Standards        | INVOKE / SKIP | [from Section 1] | PENDING | —                  | —              |
| 3   | Architectural         | INVOKE / SKIP | [from Section 1] | PENDING | —                  | —              |
| 4   | Production Readiness  | INVOKE / SKIP | [from Section 1] | PENDING | —                  | —              |
| 5   | Strategic             | INVOKE / SKIP | [from Section 1] | PENDING | —                  | —              |
| 6   | Security Verification | DEFERRED      | After Security   | PENDING | —                  | —              |
```

**Step 2B-ii: Assemble Context Packages**

**CRITICAL — Context Package Assembly:**
Subagents have no access to your working context. Embed all
required fields directly in each subagent's prompt string.

For **every** subagent invocation, include:

**DIFF scope:**
- `GIT_ANALYSIS_FILE`: absolute path to
  `<REVIEW_RUN_DIR>/git-analysis-output.txt` — subagents use
  `read_file` to access diff content; do NOT embed diff text directly
- Full changed file list with status (M/A/D/R) — embed inline
- Metrics JSON block — embed inline

**Non-DIFF scopes (TOPIC / EXPLICIT):**
- `SCOPE_FILE_LIST`: list of file paths to review — embed inline
- `SCOPE_METRICS`: complexity, riskProfile, filesChanged,
  linesTotal — embed inline
- `GIT_ANALYSIS_FILE = null` — subagents MUST use `read_file`
  on the provided file paths to access code content

**All scopes:**
- Full text of `severity-matrix.md` (STANDARD only — loaded in Section 1; QUICK uses the inline table below)
- **Platform tool mapping** — embed the Platform Compatibility table from the Prerequisites section verbatim (the full table + Claude Code notes), so subagents resolve the correct tool name for their platform without guessing
- Subagent-specific fields per the Context Package Reference table
- Execution Budget block
- Subagent Output Requirement block

**QUICK mode inline severity definitions** (when severity-matrix.md
not loaded):
| Severity | Meaning                                           |
| -------- | ------------------------------------------------- |
| CRITICAL | Immediate exploit risk or approval-blocking flaw  |
| HIGH     | Significant risk; should fix before approval      |
| MEDIUM   | Quality improvement; recommended but not blocking |
| LOW      | Minor suggestion; optional                        |

**Tool Call Budget Matrix + Execution Budget Block**: Load [tool-budget-matrix.md](./resources/tool-budget-matrix.md). Look up `<AGENT_BUDGET>` for each subagent and embed the Execution Budget block in each subagent's context package.

**Subagent Output Requirement**: Load [subagent-output-requirement.md](./resources/subagent-output-requirement.md) and include its full content verbatim in every subagent's context package, with `<REVIEW_RUN_DIR>` and `<REVIEW_SLUG>` substituted.

**Context Package Reference and Failure Handling**: Load [context-package-reference.md](./resources/context-package-reference.md) for the per-subagent context fields and subagent failure handling protocol.

**Step 2B-iii: Collect Results & Update Manifest**

After all parallel results return:
1. Set Status to `COMPLETED` or `FAILED`
2. Extract finding counts: `C/H/M/L`
3. Extract recommendation: `APPROVE` / `REQUIRES_CHANGES`
4. Record `OUTPUT_FILE` path

**Checkpoint 2 — Write Subagent Results (after Step 2B-iii):**

Skip if mode = QUICK.

Append one checkpoint block per completed subagent:

```
<!-- CHECKPOINT:SUBAGENT agent=security status=completed output_file=<REVIEW_RUN_DIR>/analysis-security-<REVIEW_SLUG>.md -->
<!-- END:SUBAGENT -->
```

To append safely: `read_file` current content → concatenate → `create_file` overwrite.

### 2C: Security Findings Verification (Subagent)

**Trigger**: Cannot be user-skipped in any mode — the `[always-on]` label means it is
excluded from per-subagent skip keywords (unlike the five parallel review subagents).
It is automatically skipped only when the Security subagent returned zero
CRITICAL/HIGH findings (no findings to verify).

**Context Package**: Minimal — CRITICAL/HIGH findings only (with
file, line, OWASP category, code snippet), relevant diff/file
sections for those files, scope objective.

Invoke **Code Review Security Verification Subagent** as a single
sequential call.

---

## 3. Integration & Trade-off Analysis

**Timing**: After all subagent results received and Dispatch
Manifest fully updated.

**Reading Subagent Outputs**: Use `read_file` on each `OUTPUT_FILE`
path. Load one at a time — do NOT load all simultaneously.

**Cross-Cutting Concern Identification `[I]`:**
- Changes affecting multiple architectural layers
- Shared utilities or common code modifications
- Breaking changes with ripple effects
- Integration point modifications

**Alternative Approach Analysis `[I]`:**
- Identify simpler approaches achieving the same goal
- Document trade-offs of current approach vs alternatives
- Use Section 1 semantic_search results for alternatives

**Code Quality & Testing (Direct Analysis):**
- Directory structure, file organization, module boundaries
- Implementation correctness, error handling, edge cases
- Performance: O(n²) loops, synchronous blocking calls, unbounded queries
- Code duplication
- API design (if applicable): naming, HTTP methods, backwards compatibility
- Test coverage: unit tests, integration tests, missing edge cases

**Second Synthesis Pass (always-on):**

1. Cross-domain compounding check: re-read all findings, find
   compounding issues across domains
2. Alternative approach analysis via `semantic_search`
   (skip if mode = QUICK — no codebase context was gathered in Section 1)
3. Severity re-assessment using `severity-matrix.md`
4. Add `## Second Pass Findings` section to report

**Checkpoint 3 — Write Synthesis (after Section 3 completes):**

For QUICK mode: the review file does not yet exist. Create it now using
`create_file` with `REVIEW_FILE_PATH`, then append the checkpoint block below.

For STANDARD mode: use `read_file` to retrieve the current file contents,
concatenate the checkpoint block below, then overwrite with `create_file`.

Append synthesis checkpoint:

```
<!-- CHECKPOINT:SYNTHESIS -->
## Cross-Cutting Analysis
[Insert: cross-cutting concerns, alternative approaches,
trade-offs, code quality, testing coverage, mentorship notes,
second-pass findings]
<!-- END:SYNTHESIS -->
```

---

## 4. Synthesis & Report Generation

**Integrate Findings from All Sources:**
1. Security findings (verified true positives only)
2. Code standards findings
3. Architectural concerns
4. Production readiness assessment
5. Strategic analysis
6. Code quality and testing findings

**Cross-Reference & Deduplicate:**

Use fingerprint-based grouping:
1. Group by `<file>:<line-range> [<category>]` fingerprint
2. Assign highest severity across contributing subagents
3. Annotate with contributing agents
4. Each finding appears once in the report

**Prioritize Issues:**
- **REQUIRES REDESIGN**: 3+ CRITICAL across 2+ domains
- **BLOCKS APPROVAL**: CRITICAL security (verified) + CRITICAL
  standards/architectural/production readiness
- **SHOULD FIX**: HIGH from all sources
- **RECOMMENDED**: MEDIUM/LOW
- **STRATEGIC**: Long-term concerns not blocking approval

**Generate Review Report (MANDATORY):**

1. Reconstruct `REVIEW_FILE_PATH` from `REVIEW_RUN_DIR` and
   `REVIEW_SLUG`.
2. For STANDARD: `read_file` the review file to retrieve
   `START_TIME` from line 1 and all checkpoint blocks.
   For QUICK: `START_TIME` is held in-context from Section 0.
   Compose the report directly from in-context subagent results
   and the synthesis findings written in Checkpoint 3.
3. Load [review-report-template.md](./resources/review-report-template.md).
4. For each completed subagent: `read_file` its `OUTPUT_FILE`
   (load one at a time).
5. Compose the final report from the template + all findings.
   Replace `REVIEW_FILE_PATH` content entirely — no checkpoint
   markers remain in final output.
6. Use `create_file` to write the complete report.
7. Verify file written.
8. Compute the **Completion Rubric score** (see `## Acceptance Criteria → Completion Rubric`). Block output if score < 85.
9. ONLY THEN output the minimal console summary.

**Compute elapsed time**: If QUICK, show `N/A`. Otherwise, run
`date +%s` and subtract `START_EPOCH`. Format as `Xm Ys`.

**Console Output (Minimal — ONLY After File Creation):**

```
Code Review Completed

Review File: <file-path>

Execution Summary:
Scope Type: [DIFF / TOPIC / EXPLICIT]
Review Mode: [QUICK / STANDARD]
  Parallel Execution: [2/5]-way subagent analysis

Subagents Executed:
[✓/—] Security Analysis
[✓] Security Verification [always-on]
[✓/—] Architectural Analysis
[✓/—] Strategic Analysis
[✓/—] Production Readiness
[✓/—] Code Standards

Critical Findings Summary:
- BLOCKS APPROVAL: <count> issues
- HIGH PRIORITY: <count> issues
- RECOMMENDED: <count> improvements
- STRATEGIC: <count> long-term considerations

Security: [PASS/FAIL/NEEDS REVIEW]
Architecture: [SOUND/ACCEPTABLE/CONCERNING/FLAWED]
Production: [READY/NEEDS WORK/NOT READY]
Strategic: [WIN/ACCEPTABLE/CONCERNING/MISTAKE]

Overall Recommendation: [APPROVE / APPROVE WITH IMPROVEMENTS /
  REQUIRES CHANGES / REQUIRES REDESIGN]

See detailed analysis in the review file.
```

**Persist Review Learnings (after report written):**

Load [review-memory-template.md](./resources/review-memory-template.md) for the knowledge base structure.

Persist only facts confirmed during this review. If nothing new or changed was discovered, skip this step.

To persist:
1. Use `file_search` with pattern `**/.github/instructions/code-review-conventions.md` to check if the file exists.
2. If it does **not** exist: use `create_file` to create `.github/instructions/code-review-conventions.md` with the new conventions as its full content.
3. If it **exists**: use `read_file` to load the current content, apply the merge rules below (update existing entries, add only genuinely new ones), then overwrite with `create_file`.
4. Do NOT blindly append — this file is a consolidated knowledge base, not a log.

**Merge rules (when the file already exists):**

1. **Instruction Files** — if `<path>` already listed, update key rules summary only if changed. Do not duplicate.
2. **Architectural Patterns** — if pattern name already exists, update `last confirmed` date. Do not duplicate.
3. **Test Conventions** — overwrite framework and test dirs with current values if different.
4. **Recurring Issues** — if pattern already listed, increment count and update `last` date. If new, add entry.
5. Update the `Last updated` comment at the top.
6. If nothing changed from the existing file, skip the write entirely.
