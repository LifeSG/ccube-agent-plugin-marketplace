# cc-code-review

A principal-engineer-grade code review skill that produces a structured, file-persisted review report across security, code standards, architecture, production readiness, and strategic impact. Depending on scope and risk, it runs either 2 or up to 5 review subagents in parallel, then performs a non-user-skippable security verification step and a non-user-skippable second synthesis pass.

---

## Concepts

### Review Mode

Mode controls how many review subagents run before synthesis. There are two modes:

| Mode     | Workflow                                                                                                                                              | When it activates                                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| QUICK    | 2-way parallel: Security + Code Standards → Security Verification* → second synthesis pass                                                            | You say "quick review", "fast review", or "light review"; or no mode keyword is given and the scope is Trivial with risk ≤ MEDIUM |
| STANDARD | Up to 5-way parallel: Security, Code Standards, Architectural, Strategic, and Production Readiness** → Security Verification* → second synthesis pass | Default for "review", "standard review", "normal review", or no mode keyword when the change does not qualify for auto-QUICK      |

\* **Security Verification** is part of the fixed workflow in both modes. It cannot be user-skipped, but it auto-skips when the Security subagent returns no CRITICAL/HIGH findings to verify.

\** **Production Readiness** runs only in STANDARD mode and only when the scope complexity is Medium, Large, or Extra Large (unless the user explicitly skips it).

> **Auto-QUICK rule**: if no mode keyword is given and the scope is Trivial with risk ≤ MEDIUM, the skill downgrades to QUICK and logs the reason.
>
> **Auto-escalate rule**: if QUICK is requested but the risk profile is CRITICAL or the files are security-sensitive, the skill escalates to STANDARD.
>
> **Non-skippable workflow steps**: Security Verification and the second synthesis pass are fixed parts of the workflow in both modes. The user cannot suppress them.

You can suppress only the five parallel review subagents with phrases such as `skip security`, `skip standards`, `skip architectural`, `skip production`, or `skip strategic`.

---

### Scope Strategy

Scope determines how the skill discovers which code to review. It is resolved automatically from your request:

| Strategy | When it is chosen                                                    | How the skill collects code                                                                                        |
| -------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| DIFF     | Your request mentions a branch, MR, PR, commit, or staged changes    | Runs `git-analysis.sh` against the relevant branches or staged diff, then reads the generated analysis file        |
| EXPLICIT | Your request lists specific files or paths                           | Validates each path exists, then builds a file list; no git commands needed                                        |
| TOPIC    | Your request names a feature, module, or topic (for example, `auth`) | Runs parallel `semantic_search`, `grep_search`, and `file_search` discovery, then asks you to confirm the file set |

---

### Platform Compatibility

This skill runs on both Claude Code and GitHub Copilot. The skill body uses neutral snake_case tool names such as `read_file`, `grep_search`, and `run_subagent`. Before dispatch, the orchestrator injects a platform tool-mapping block into every subagent context package so subagents can resolve the correct runtime tool names without guessing.

In practice, that means the same workflow can target Claude Code (`Read`, `Grep`, `Agent`, etc.) and GitHub Copilot (`readFile`, `grepSearch`, `runSubagent`, etc.) consistently.

---

### Subagents

Each subagent writes its own findings file inside the review run directory. The orchestrator never prints review analysis to chat — it only coordinates, verifies, deduplicates, and writes the final report.

| Subagent                                   | What it covers                                                                                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Code Review Security Subagent              | OWASP-style security review: injection risk, auth flaws, secrets exposure, unsafe data flow, and exploit-prone patterns                                      |
| Code Review Standards Subagent             | Project-specific instruction-file compliance, coding conventions, naming/structure issues, TypeScript/React patterns, and test coverage expectations         |
| Code Review Architectural Subagent         | System design, service boundaries, data flow, API contract evolution, scalability, pattern consistency, and test coverage adequacy                           |
| Code Review Production Readiness Subagent  | Deployment risk, rollback readiness, monitoring/observability, runtime operations, and operational complexity                                                |
| Code Review Strategic Subagent             | Technical debt, extensibility, long-term maintainability, evolution path, and strategic trade-offs                                                           |
| Code Review Security Verification Subagent | Sequential verification of CRITICAL/HIGH security findings from the Security subagent; non-user-skippable, auto-skipped only when there is nothing to verify |

There is no Business Context subagent in the current workflow.

---

### Severity Levels

All findings use the same four-level scale. STANDARD mode loads the full severity matrix resource; QUICK mode uses the abbreviated inline equivalent.

| Severity | Meaning                                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| CRITICAL | Approval-blocking flaw: immediate exploit risk, major outage risk, data loss, or fundamental architectural violation |
| HIGH     | Significant risk that should be fixed before approval                                                                |
| MEDIUM   | Recommended quality or maintainability improvement                                                                   |
| LOW      | Optional suggestion or minor note                                                                                    |

---

### Execution Budgets

Each subagent receives a tool-call budget derived from the scope complexity via `tool-budget-matrix.md`. The budget is injected into the subagent context package as `## Execution Budget`, so each specialist knows exactly how far it can search before stopping.

Examples from the current matrix:

- Security: `8 / 12 / 16` calls for Trivial-or-Small / Medium / Large-or-XL
- Architectural: `6 / 10 / 14`
- Production Readiness: `4 / 8 / 10`
- Security Verification: `6 / 10 / 12`

Subagents prioritize direct code/diff analysis first, then CRITICAL/HIGH verification, and stop once the injected budget is exhausted. Remaining unverified items are explicitly marked.

---

### Review Run Directory

Every review creates a dedicated directory under `reviews/` in the workspace root:

```
reviews/<START_TIME>-<SCOPE_TYPE>-<REVIEW_SLUG>/
  CODE-REVIEW-<REVIEW_SLUG>.md      ← final consolidated report
  git-analysis-output.txt           ← raw git analysis output (DIFF scope only)
  analysis-security-<slug>.md       ← Security subagent output
  analysis-standards-<slug>.md      ← Code Standards subagent output
  analysis-architectural-<slug>.md  ← Architectural subagent output
  ...                               ← one file per invoked subagent
```

The skill never puts review analysis in chat. The only chat output is a brief completion summary after the report file is successfully written.

---

### Persisted Review Memory

After the report is written, the skill may update `.github/instructions/code-review-conventions.md`. This is a **consolidated living knowledge base**, not an append-only log.

If the file already exists, the skill merges newly confirmed facts into the existing sections:

- **Instruction Files** — update summaries in place, do not duplicate entries
- **Architectural Patterns** — refresh `last confirmed` for existing patterns
- **Test Conventions** — overwrite framework/test directory facts when they changed
- **Recurring Issues** — increment counts and update `last` dates for repeated patterns

If the review found nothing new or changed, the skill skips the write entirely.

---

### Completion Rubric

Before the console summary is emitted, the skill scores the review against a 100-point rubric. If the score is below 85, the review is blocked and the failed checks are reported instead of a success summary.

Key rubric checks include:

- required review sections present
- every CRITICAL and HIGH finding includes a file path and line number citation
- no unverified CRITICAL/HIGH findings remain after Security Verification
- overall recommendation is one of the four allowed values
- trade-off or alternative analysis is present from the second synthesis pass

---

## How to Use

### Step 1 — Invoke the skill

Mention a review intent in chat. The skill activates when it detects phrases such as `review`, `code review`, `review this MR`, `review the auth module`, or `review these files`.

### Step 2 — Let the skill resolve scope and mode

The skill classifies your request into a scope strategy (DIFF / TOPIC / EXPLICIT) and a review mode (QUICK / STANDARD) based on your phrasing, scope size, and risk.

### Step 3 — Confirm scope (TOPIC only)

If TOPIC scope is used, the skill shows the discovered files and asks you to confirm them before continuing. You can add or remove files at this point.

### Step 4 — Wait for the review to complete

- **QUICK**: runs Security and Code Standards in parallel, then Security Verification if needed, then the second synthesis pass
- **STANDARD**: runs up to 5 review subagents in parallel, then Security Verification if needed, then the second synthesis pass

### Step 5 — Open the report

The skill prints a minimal summary in chat with the report path. Open that file for the full analysis.

---

### Example prompts

**DIFF scope — branch review (STANDARD, default):**
```
Review the changes on feature/payment-gateway against main.
```

**DIFF scope — pre-commit review (QUICK):**
```
Quick review of my staged changes before I push.
```

**TOPIC scope — module review (STANDARD):**
```
Standard review of the authentication module.
```

**EXPLICIT scope — specific files (STANDARD):**
```
Review src/api/users.ts and src/services/auth.ts.
```

**Suppress a parallel review subagent:**
```
Review the changes on feature/logging-refactor. Skip strategic.
```

---

## When to Use

Use this skill when you want a structured, traceable review saved to a file and you want multiple quality dimensions examined in a single workflow. It is appropriate when:

- You are about to merge a branch or open an MR/PR and want a pre-merge review.
- You want to review a feature or module for security, architecture, or maintainability concerns.
- You want an automated review of a specific set of files before committing or handing off work.
- You want one workflow to cover security, standards, architecture, production readiness, and strategic impact rather than running those checks separately.

It may be more than you need if:

- You want a quick one-off answer about a single function or variable.
- You want linting or type-checking only.
- The change is truly trivial and low-risk; the skill can auto-QUICK, but even that is more overhead than a simple chat answer for a one-line non-critical edit.

---

## Expected Output

### Console summary (in chat)

After the review file is written, the skill outputs a brief block in chat:

```
Code Review Completed

Review File: reviews/20260502-1015-DIFF-payment-gateway/CODE-REVIEW-payment-gateway.md

Execution Summary:
Scope Type: DIFF
Review Mode: STANDARD
  Parallel Execution: 5-way subagent analysis

Subagents Executed:
[✓] Security Analysis
[✓] Security Verification [always-on]
[✓] Architectural Analysis
[✓] Strategic Analysis
[✓] Production Readiness
[✓] Code Standards

Critical Findings Summary:
- BLOCKS APPROVAL: 1 issue
- HIGH PRIORITY: 3 issues
- RECOMMENDED: 7 improvements
- STRATEGIC: 2 long-term considerations

Security: FAIL
Architecture: ACCEPTABLE
Production: NEEDS WORK
Strategic: ACCEPTABLE

Overall Recommendation: REQUIRES CHANGES

See detailed analysis in the review file.
```

No review analysis text appears in chat — only this summary.

---

### Review file (Markdown)

The file at `REVIEW_FILE_PATH` contains the full analysis. In practice, the final report includes:

1. **Scope Overview & Metrics** — scope type, file list, complexity classification, risk profile, review mode, and matched instruction files
2. **Findings by Priority** — deduplicated CRITICAL / HIGH / MEDIUM / LOW findings with contributing domains
3. **Detailed Analysis by Domain** — Security, Code Standards, Architectural, Strategic, and Production Readiness (when invoked)
4. **Cross-Cutting Analysis** — trade-offs, alternative approaches, code quality/testing observations, and second-pass synthesis
5. **Overall Recommendation** — exactly one of: `APPROVE`, `APPROVE WITH IMPROVEMENTS`, `REQUIRES CHANGES`, or `REQUIRES REDESIGN`

Every CRITICAL and HIGH finding includes a file path and line number citation. Remaining unverified items are flagged explicitly (for example, `[UNVERIFIED]` or `[VERIFICATION PENDING]`).
