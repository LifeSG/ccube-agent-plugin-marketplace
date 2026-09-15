# EP-0006: Fix medium-severity security findings (asgard-0013, asgard-0016)

**Created**: 2026-09-15
**Severity**: Medium (CVSS 4.2 -- 4.4)
**Status**: Draft

- [Summary](#summary)
- [Motivation](#motivation)
  - [Goals](#goals)
  - [Non-Goals](#non-goals)
- [Proposal](#proposal)
  - [Finding 1: asgard-0013](#finding-1-asgard-0013)
  - [Finding 2: asgard-0016](#finding-2-asgard-0016)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Risks and Mitigation](#risks-and-mitigation)
- [Design Details](#design-details)
- [Alternatives](#alternatives)

## Summary

Two medium-severity findings require remediation:

1. **asgard-0013** -- LLM output injection via unescaped git
   commit metadata in `git-analysis.sh` (CWE-1427, CWE-116,
   CWE-74).
2. **asgard-0016** -- Command injection via unsanitized
   environment variable in `debug-hook.js` (CWE-78).

Both share a common root cause: untrusted input interpolated
into a structured output context (JSON/shell) without proper
escaping or parameterized construction.

## Motivation

### asgard-0013: LLM output injection in git-analysis.sh

`git-analysis.sh` collects git metadata (author names, commit
messages, diffs) for the cc-code-review skill. The script
builds a `METRICS JSON` block using a shell heredoc that
interpolates `$CONTRIBUTORS` -- derived from
`git log --format='%aN'` -- directly into a JSON string
literal with no JSON escaping.

**Root cause**: Shell variable interpolation inside a heredoc
does not perform JSON escaping. Characters like `"`, `\`, and
control characters in git author names break the JSON
structure.

**Attack vector**: An attacker submits a branch for review
with `git config user.name` set to a crafted value containing
double quotes and JSON syntax. When the review skill runs
`git-analysis.sh`, the malformed JSON can override fields
(e.g., force `riskProfile` to `LOW`) or inject adversarial
text into the LLM's review context, potentially subverting the
automated review verdict.

**File**: `plugins/wai/skills/cc-code-review/scripts/git-analysis.sh`
**Lines**: 57, 73--85

### asgard-0016: Command injection in debug-hook.js

`debug-hook.js` is a diagnostic script that replicates the
telemetry POST using `curl`. The `replicateCurl()` function
builds a shell command string by joining array elements and
passes it to `execSync()`. While the JSON payload is
single-quote-escaped for the shell, the `ENDPOINT` value
(from `CCUBE_TELEMETRY_ENDPOINT` env var) is interpolated
inside single quotes without escaping embedded single quotes.

**Root cause**: Asymmetric escaping -- the payload is escaped
but the URL is not. `execSync` invokes `/bin/sh -c`, so a
single quote in the URL breaks out of quoting.

**Attack vector**: A user runs the diagnostic with
`CCUBE_TELEMETRY_ENDPOINT` set to a crafted value (e.g., from
a shared team profile, CI config, or malicious documentation
snippet) such as `https://x/'$(touch ~/pwned)'`. The
unescaped value breaks out of shell quoting and executes
arbitrary commands.

**File**: `scripts/debug-hook.js`
**Lines**: 603--621

### Goals

- Eliminate the JSON injection vector in git-analysis.sh by
  using `jq` for proper JSON construction.
- Eliminate the command injection vector in debug-hook.js by
  replacing `execSync` with `execFileSync` to avoid shell
  interpretation entirely.
- Preserve existing script functionality and output format.

### Non-Goals

- Comprehensive LLM prompt injection hardening beyond the
  METRICS JSON block (e.g., the verbatim diff/commit-log
  sections are out of scope for this EP).
- Refactoring the overall architecture of either script.

## Proposal

### Finding 1: asgard-0013

Replace the hand-crafted heredoc JSON block with a `jq -n`
invocation that properly escapes all interpolated values:

```bash
jq -n \
  --argjson filesChanged "$FILES_CHANGED" \
  --argjson linesAdded "$LINES_ADDED" \
  --argjson linesDeleted "$LINES_DELETED" \
  --argjson totalChanged "$TOTAL_CHANGED" \
  --argjson commits "$COMMITS" \
  --arg contributors "$CONTRIBUTORS" \
  --arg complexity "$COMPLEXITY" \
  --arg riskProfile "$RISK" \
  '{
    filesChanged: $filesChanged,
    linesAdded: $linesAdded,
    linesDeleted: $linesDeleted,
    totalChanged: $totalChanged,
    commits: $commits,
    contributors: $contributors,
    complexity: $complexity,
    riskProfile: $riskProfile
  }'
```

`jq --arg` handles JSON string escaping (double quotes,
backslashes, control characters). `--argjson` passes numeric
values without quoting.

### Finding 2: asgard-0016

Replace the `execSync(curlCmd)` call with
`execFileSync('curl', [...args])`. `execFileSync` bypasses
the shell entirely, passing arguments directly to the `curl`
process via `execvp`. This eliminates the shell
interpretation that enables the injection.

Additionally, add early-return validation that `ENDPOINT` is
a well-formed HTTPS URL using `new URL()` parsing, so
malformed URLs never reach the curl invocation.

### Acceptance Criteria

- [ ] `git-analysis.sh` produces valid JSON for author names
      containing `"`, `\`, `'`, `,`, `{`, `}`, and backticks.
- [ ] `debug-hook.js` cannot execute injected shell commands
      via `CCUBE_TELEMETRY_ENDPOINT`.
- [ ] `git-analysis.sh` output format is unchanged for clean
      inputs (no breaking change to downstream consumers).
- [ ] `debug-hook.js` curl replication still works for valid
      HTTPS endpoint URLs.

### Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| `jq` not available on all systems | `jq` is a standard tool on dev machines and CI; the script already requires `git` and `bash`. Add a guard that falls back to escaped heredoc if `jq` is missing. |
| `execFileSync` behaviour differs from `execSync` | The only difference is shell interpretation is removed, which is the intended fix. Argument passing is equivalent. |

## Design Details

**git-analysis.sh changes** (lines 73--85):
- Replace the `cat <<JSON ... JSON` heredoc with a `jq -n`
  invocation.
- All string values passed via `--arg` (auto-escaped).
- All numeric values passed via `--argjson`.

**debug-hook.js changes** (lines 603--621):
- Replace `execSync(curlCmd, ...)` with
  `execFileSync('curl', [args], ...)`.
- Remove the `curlCmd` string-building array and `.join(' ')`.
- Add URL validation before the curl call using `new URL()`.
- Import `execFileSync` alongside `execSync`.

## Alternatives

1. **Shell-escape ENDPOINT in debug-hook.js**: Apply the same
   single-quote escaping used for the payload. Rejected
   because `execFileSync` is strictly safer and simpler --
   it eliminates the entire class of shell injection rather
   than playing whack-a-mole with escaping.

2. **printf '%s' for JSON in git-analysis.sh**: Use
   `printf '%s'` with manual escaping. Rejected because `jq`
   is purpose-built for JSON construction and handles all
   edge cases (Unicode, control characters) correctly.

3. **Sanitize git author names by stripping non-alphanumeric
   characters**: Rejected because it silently corrupts
   legitimate names containing accented characters, CJK
   characters, or hyphens.
