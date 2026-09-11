# EP-0004: Fix overly-permissive allowlist in cc-code-review hook

**Created**: 2026-09-11
**Input**: User description: "Fix overly-permissive allowlist patterns in
cc-code-review PreToolUse hook (CWE-863, CWE-78, CWE-77): replace unanchored
grep patterns with full-command exact matches, add metacharacter guard, and
validate git compound command by exact structure."

- [Summary](#summary)
- [Motivation](#motivation)
  - [Goals](#goals)
  - [Non-Goals](#non-goals)
- [Proposal](#proposal)
  - [Acceptance criteria](#acceptance-criteria)
  - [Notes/Constraints/Caveats](#notesconstraintscaveats)
  - [Risks and Mitigation](#risks-and-mitigation)
- [Design Details](#design-details)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Database](#database)
- [Alternatives](#alternatives)
- [Infrastructure Needed (Optional)](#infrastructure-needed-optional)
- [Review & Acceptance Checklist](#review--acceptance-checklist)
- [Execution Status](#execution-status)

## Summary

The `cc-code-review-allow-commands.sh` PreToolUse hook auto-approves Bash
commands issued by the `cc-code-review` skill. Three of its four allowlist
branches use unanchored grep patterns that match any command containing a
target substring, not the complete command. An attacker who crafts a Bash
command containing the substring `git-analysis.sh`, or who can produce a
command that begins with `date +` and contains shell metacharacters after
it, can bypass the human-approval gate entirely. This EP replaces the
unanchored patterns with full-command exact matching, adds a metacharacter
rejection guard, and validates the git compound command by exact token
structure.

## Motivation

The hook was introduced to reduce approval fatigue for the read-only commands
issued by the `cc-code-review` skill. Its security model depends on the
assumption that only the specific known-safe commands are approved. Because
three of the four branches use `grep -qF` (substring) or `grep -qE` with a
prefix anchor only, the assumption is violated: injected commands containing
a known-good fragment are silently auto-approved.

The three vulnerable branches and their bypass vectors are:

- **Line 71** — `grep -qE '^date \+'` — prefix-only; any command starting
  with `date +` passes, including `date +%s && rm -rf /`.
- **Line 84** — `grep -qF 'git-analysis.sh'` — substring match; any command
  containing `git-analysis.sh` anywhere passes.
- **Lines 100-101** — two unanchored co-occurrence checks; any command
  containing both `git fetch origin` and `git pull origin` as independent
  substrings passes, regardless of what else is in the command.

This satisfies the definition of CWE-863 (Incorrect Authorization),
CWE-78 (OS Command Injection), and CWE-77 (Command Injection).

### Goals

- All allowlist checks match the entire command string, anchored at both
  ends.
- A metacharacter guard (`contains_shell_metachar`) rejects any command
  containing `;`, `&&`, `||`, `|`, backtick, `$(`, or a newline before any
  allowlist check is evaluated.
- The `date` pattern is replaced with a full-command regex that allows only
  known-safe format strings.
- The `git-analysis.sh` check is replaced with a pattern that requires the
  script path to be the only meaningful component of the command.
- The git compound check validates the exact expected token sequence rather
  than two independent substring co-occurrences.
- All code paths fail closed: unrecognised commands fall through to the
  normal approval prompt.

### Non-Goals

- Expanding the list of approved commands.
- Changes to other hook scripts (`session-telemetry.sh`,
  `validate-*.sh`).
- Runtime sandboxing or containerisation of hook execution.
- Changes to the `plugins/wai/hooks.json` manifest.

## Proposal

Replace the three vulnerable branches in
`plugins/wai/scripts/cc-code-review-allow-commands.sh` with hardened
equivalents. Add a `contains_shell_metachar` guard function that is called
before any allowlist check and causes the script to fall through (no
auto-approval) whenever the command contains a shell metacharacter or
newline.

The metacharacter guard uses a bash `[[ =~ ]]` test to reject commands
containing any of: `;`, `&`, `|`, backtick, `$`, newline, or carriage
return. This is intentionally broad — any of these characters in a command
issued by the cc-code-review skill would indicate unexpected behaviour.

The three vulnerable branches are replaced as follows:

1. **date**: `[[ "$COMMAND" =~ ^date\ \+[%YmdHMs:T-]+$ ]]`
   — allows only `date +` followed by a format string consisting of `%`,
   letters, digits, `:`, `-`, and `T`; anchored at both ends.
2. **git-analysis.sh**: `[[ "$COMMAND" =~ ^(bash\ )?[^\ ]+/git-analysis\.sh$
   ]]`
   — requires the command to be exactly an optional `bash ` prefix followed
   by a path ending in `/git-analysis.sh` with nothing after it.
3. **git compound**: Tokenise the command on `&&` and verify that each token
   matches one of the three expected sub-commands (`git fetch origin ...`,
   `git checkout ...`, `git pull origin ...`) in the correct order and
   without extra tokens.

### Acceptance criteria

#### AC 1

Given a command `date +%Y%m%d-%H%M`, the hook auto-approves it.
Given a command `date +%s && rm -rf /`, the hook falls through to the
normal approval prompt.

#### AC 2

Given a command `/path/to/git-analysis.sh`, the hook auto-approves it.
Given a command `/path/to/git-analysis.sh; cat /etc/passwd`, the hook falls
through to the normal approval prompt.

#### AC 3

Given the exact compound command emitted by the skill
(`git fetch origin base:base && git checkout feature && git pull origin
feature`), the hook auto-approves it. Given a command that contains both
`git fetch origin` and `git pull origin` as substrings but also contains
injected tokens, the hook falls through.

#### AC 4

Any command containing `;`, `&&`, `||`, `|`, backtick, or `$(` is rejected
by the metacharacter guard before any allowlist check is evaluated —
including commands that would otherwise have matched an allowlist branch.

### Notes/Constraints/Caveats

- The exact `date` format strings used by the skill (`%Y%m%d-%H%M` and `%s`)
  must be in the allowed set.
- The `git-analysis.sh` path will vary per installation because the script
  lives under `${PLUGIN_ROOT}`. The check must match any absolute path
  ending in `/git-analysis.sh`, not a hardcoded path.
- The git compound command structure is defined by the skill source. If the
  skill changes its compound command, the hook must be updated in the same
  commit.
- The metacharacter guard rejects `&&` — which means the git compound
  command, which uses `&&`, must be validated by a different code path that
  tokenises on `&&` rather than relying on the guard.

### Risks and Mitigation

| Risk | Likelihood | Mitigation |
|---|---|---|
| Overly strict date regex blocks a valid format string | Medium | Derive the allowed set from the skill source; document it in a comment |
| git compound tokeniser fails to handle whitespace variants | Low | Normalise whitespace before tokenising; add a unit test |
| Future skill changes introduce new commands not in the allowlist | Medium | Document the dependency; add a CHANGELOG entry requiring hook review |
| Metacharacter guard blocks valid future commands that use pipes | Low | The guard fails closed; new commands require an explicit allowlist update |

## Design Details

### Frontend

Not applicable — this is a server-side hook script with no user interface.

### Backend

The fix is entirely contained in
`plugins/wai/scripts/cc-code-review-allow-commands.sh`. The changes are:

1. Add `contains_shell_metachar` function after the `allow` function.
2. Call `contains_shell_metachar "$COMMAND"` before the first allowlist
   branch; fall through if it returns true — EXCEPT for the git compound
   branch, which is handled after tokenisation.
3. Replace the `date` grep with a bash `[[ =~ ]]` exact match.
4. Replace the `git-analysis.sh` grep with a bash `[[ =~ ]]` path-suffix
   match.
5. Replace the git compound grep pair with a tokenise-and-validate block.

### Database

Not applicable.

## Alternatives

**Use an external allowlist file**: Rejected — adds operational complexity
without improving security; the allowlist is intentionally small and
co-located with the hook.

**Validate commands via a separate Python script**: Rejected — adds a
dependency; bash `[[ =~ ]]` is sufficient and keeps the hook self-contained.

**Disable auto-approval entirely**: Rejected — increases approval fatigue
and was the user experience problem the hook was designed to solve.

## Infrastructure Needed (Optional)

None.

---

## Review & Acceptance Checklist

*GATE: Automated checks run during main() execution*

- [ ] All three vulnerable grep patterns replaced with anchored exact matches
- [ ] `contains_shell_metachar` guard present and called before allowlist
- [ ] `date` allowlist accepts `date +%Y%m%d-%H%M` and `date +%s`
- [ ] `git-analysis.sh` allowlist rejects appended metacharacters
- [ ] git compound allowlist rejects injected tokens between sub-commands
- [ ] All code paths fail closed

## Execution Status

*Updated by co-pilot during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [ ] Ambiguities marked
- [x] Part 1 sections filled
- [x] No code snippets in Part 1 sections
- [x] No functions or file references in Part 1 sections
- [ ] Part 2 sections filled

---
