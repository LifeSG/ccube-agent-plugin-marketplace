#!/bin/bash
# cc-code-review-allow-commands.sh
#
# PreToolUse hook — auto-approves terminal commands issued by the
# cc-code-review skill. Anything that does not match a skill pattern
# falls through with exit 0 (no decision; normal approval prompt applies).
#
# Approved categories:
#
#   [SAFE]   date commands          — read-only, no side effects
#   [SAFE]   git diff --staged      — read-only, no side effects
#   [SAFE]   git-analysis.sh        — script runs only read-only git operations;
#                                     its output goes to REVIEW_RUN_DIR, not source code
#
#   [STATE]  git repository setup   — the single compound command that runs
#                                     git fetch / git checkout / git pull.
#                                     These change working-tree state but are
#                                     skill-controlled (branch names come from the
#                                     user's review request):
#                                       git fetch origin <base>:<base>  — updates .git/refs/remotes/
#                                       git checkout <branch>           — switches the working tree
#                                       git pull origin <branch>        — fetches + merges remote commits
#
# Security model:
#   All allowlist checks match the ENTIRE command string, anchored at both ends.
#   A metacharacter guard rejects any command containing shell metacharacters
#   (newline, CR, ; | & ` $) before any allowlist check is evaluated.
#   The git compound check is exempt from the metacharacter guard and instead
#   tokenises on ' && ' and validates each token against an exact pattern.
#   All code paths fail closed: unrecognised commands fall through with exit 0
#   (the normal approval prompt applies).

set -uo pipefail

INPUT=$(cat)

# ---------------------------------------------------------------------------
# Extract tool_name and tool_input.command
# Uses python3 for reliable JSON parsing; falls back to empty string on error.
# tool_name is snake_case on both Claude Code and VS Code Copilot.
# tool_input.command is the terminal command string on both platforms.
# ---------------------------------------------------------------------------

TOOL_NAME=$(printf '%s' "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_name', ''))
except Exception:
    print('')
" 2>/dev/null || echo "")

# Only intercept terminal tool invocations
# Claude Code: Bash  |  VS Code Copilot: runInTerminal
if [[ "$TOOL_NAME" != "Bash" && "$TOOL_NAME" != "runInTerminal" ]]; then
  exit 0
fi

COMMAND=$(printf '%s' "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('command', ''))
except Exception:
    print('')
" 2>/dev/null || echo "")

allow() {
  echo "{\"hookSpecificOutput\": {\"permissionDecision\": \"allow\", \"permissionDecisionReason\": \"$1\"}}"
  exit 0
}

# ---------------------------------------------------------------------------
# Metacharacter guard
#
# Returns 0 (true / "has metachar") if the command contains any character
# that could be used to chain or inject additional shell commands:
#   newline (\n), carriage return (\r), semicolon (;), pipe (|),
#   ampersand (&), backtick (`), or dollar sign ($).
#
# Called before each simple-command allowlist check.  The git compound check
# is intentionally EXEMPT because it uses ' && ' as a structural delimiter
# and is validated by exact token structure instead.
# ---------------------------------------------------------------------------
contains_shell_metachar() {
  local cmd="$1"
  # Use printf | grep to avoid bash regex locale issues.
  # -P enables Perl regex; -q suppresses output; exit 0 = found.
  if printf '%s' "$cmd" | grep -qP '[;\|&`$\n\r]'; then
    return 0  # contains a metacharacter
  fi
  return 1  # clean
}

# ---------------------------------------------------------------------------
# Pattern matching
# ---------------------------------------------------------------------------

# [SAFE] Staged diff — pre-commit scope only
# Exact full-command match; no metacharacter check needed (pattern is
# anchored at both ends and contains no variable parts).
if [[ "$COMMAND" == "git diff --staged" ]]; then
  allow "cc-code-review: staged diff (read-only)"
fi

# Reject commands with shell metacharacters before the remaining simple checks.
# The git compound check below is exempt and handles ' && ' structurally.
if contains_shell_metachar "$COMMAND"; then
  # Falls through — no auto-approval granted.
  exit 0
fi

# [SAFE] Timestamp capture
#   date +%Y%m%d-%H%M  (Section 0 — START_TIME)
#   date +%s           (Section 4 — elapsed time)
#
# Allowed format characters: %, Y, m, d, H, M, s, and literal hyphen (-).
# Pattern is anchored at both ends to prevent suffix injection.
if [[ "$COMMAND" =~ ^date\ \+[%YmdHMs-]+$ ]]; then
  allow "cc-code-review: timestamp capture (read-only)"
fi

# [SAFE] git-analysis.sh execution
#   The script runs only: git rev-parse, git diff, git log, git diff --shortstat
#   Output is redirected to REVIEW_RUN_DIR/git-analysis-output.txt (review
#   artifact, not source code). Safe to auto-approve.
#
# Pattern: optional 'bash ' prefix, then an absolute path ending in
# /git-analysis.sh, nothing after.  Path components may contain alphanumerics,
# forward slashes, hyphens, underscores, and dots.
if [[ "$COMMAND" =~ ^(bash\ )?[A-Za-z0-9/_.-]+/git-analysis\.sh$ ]]; then
  allow "cc-code-review: git-analysis.sh (read-only git operations, output to review dir)"
fi

# [STATE] Branch identification + repository setup compound command.
#   The skill batches these into a single && chain (Section 0A):
#     git fetch origin <base>:<base> && git checkout <branch> && git pull origin <branch>
#
#   Validated by exact token structure, NOT by substring co-occurrence.
#   Steps:
#     1. Command must contain exactly two ' && ' separators.
#     2. Each of the three resulting tokens must match its expected pattern.
#     3. The branch name in token 2 (checkout) must equal the branch name
#        in token 3 (pull), and the ref name on the right side of ':' in
#        token 1 (fetch) must equal the base ref name.
#
#   Branch/ref names: alphanumerics, forward slashes, hyphens, underscores,
#   and dots — covers feature/*, release/*, hotfix/* naming conventions.
#
#   ⚠️  INCLUDES STATE-CHANGING OPERATIONS:
#     git fetch origin <base>:<base>  — creates/updates a local branch ref
#     git checkout <feature-branch>   — switches the working tree
#     git pull origin <feature-branch>— merges remote commits
#
#   These are approved because the skill derives branch names from the user's
#   own review request and the working directory is the repository under review.

# Count ' && ' occurrences — must be exactly 2.
_sep_count=$(printf '%s' "$COMMAND" | grep -o ' && ' | wc -l)
if [[ "$_sep_count" -eq 2 ]]; then
  # Tokenise on ' && '.
  _tok1="${COMMAND%% && *}"
  _rest="${COMMAND#* && }"
  _tok2="${_rest%% && *}"
  _tok3="${_rest#* && }"

  _REF_PATTERN='^[A-Za-z0-9/_.-]+$'
  _BRANCH_PATTERN='^[A-Za-z0-9/_.-]+$'

  # tok1: git fetch origin <ref>:<ref>
  # tok2: git checkout <branch>
  # tok3: git pull origin <branch>
  if [[ "$_tok1" =~ ^git\ fetch\ origin\ ([A-Za-z0-9/_.-]+):([A-Za-z0-9/_.-]+)$ ]] && \
     [[ "$_tok2" =~ ^git\ checkout\ ([A-Za-z0-9/_.-]+)$ ]] && \
     [[ "$_tok3" =~ ^git\ pull\ origin\ ([A-Za-z0-9/_.-]+)$ ]]; then
    allow "cc-code-review: git repository setup [STATE-CHANGING: fetch/checkout/pull]"
  fi
fi

# No pattern matched — do not grant approval; let normal behavior apply.
exit 0
