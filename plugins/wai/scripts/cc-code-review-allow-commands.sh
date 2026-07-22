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
#                                       git fetch origin       — updates .git/refs/remotes/
#                                       git checkout <branch>  — switches the working tree
#                                       git pull origin        — fetches + merges remote commits

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
# Pattern matching
# ---------------------------------------------------------------------------

# [SAFE] Timestamp capture
#   date +%Y%m%d-%H%M  (Section 0 — START_TIME)
#   date +%s           (Section 4 — elapsed time)
if printf '%s' "$COMMAND" | grep -qE '^date \+'; then
  allow "cc-code-review: timestamp capture (read-only)"
fi

# [SAFE] Staged diff — pre-commit scope only
if printf '%s' "$COMMAND" | grep -qE '^git diff --staged$'; then
  allow "cc-code-review: staged diff (read-only)"
fi

# [SAFE] git-analysis.sh execution
#   The script runs only: git rev-parse, git diff, git log, git diff --shortstat
#   Output is redirected to REVIEW_RUN_DIR/git-analysis-output.txt (review artifact,
#   not source code). Safe to auto-approve.
if printf '%s' "$COMMAND" | grep -qF 'git-analysis.sh'; then
  allow "cc-code-review: git-analysis.sh (read-only git operations, output to review dir)"
fi

# [STATE] Branch identification + repository setup compound command.
#   The skill batches these into a single && chain (Section 0A).
#   Detected by the co-occurrence of git fetch AND git pull in one command,
#   which uniquely identifies this compound setup step.
#
#   ⚠️  INCLUDES STATE-CHANGING OPERATIONS:
#     git fetch origin <base>:<base>  — creates/updates a local branch ref
#     git checkout <feature-branch>   — switches the working tree
#     git pull origin <feature-branch>— merges remote commits into the current branch
#
#   These are approved because the skill derives branch names from the user's
#   own review request and the working directory is the repository under review.
if printf '%s' "$COMMAND" | grep -qE 'git fetch origin' && \
   printf '%s' "$COMMAND" | grep -qE 'git pull origin'; then
  allow "cc-code-review: git repository setup [STATE-CHANGING: fetch/checkout/pull]"
fi

# No pattern matched — do not grant approval; let normal behavior apply.
exit 0
