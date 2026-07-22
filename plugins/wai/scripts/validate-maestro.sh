#!/usr/bin/env bash
# validate-maestro.sh — Reads Maestro output from stdin and validates
# against acceptance criteria MUST-contain / MUST-NOT-contain patterns.
# Exit 0 on pass, non-zero on failure.

set -euo pipefail

INPUT=$(cat)
ERRORS=0

# --- MUST contain ---
check_contains() {
  if ! echo "$INPUT" | grep -qiE "$1"; then
    echo "FAIL: Output missing required pattern: $2"
    ERRORS=$((ERRORS + 1))
  fi
}

check_contains "phase [1-8]|Phase [1-8]" "Phase indicator (Phase 1-8)"
check_contains "handing this to|delegating to|sending .* to" "Agent attribution on delegation"
check_contains "next|proceed|shall I|would you like|moving to" "Next-step statement or user question"

# --- MUST NOT contain ---
check_not_contains() {
  if echo "$INPUT" | grep -qiE "$1"; then
    echo "FAIL: Output contains forbidden pattern: $2"
    ERRORS=$((ERRORS + 1))
  fi
}

check_not_contains "at [A-Za-z]+\.[a-z]+:[0-9]+|Traceback|stack trace|Error:.*at " "Raw stack traces or compiler output"
check_not_contains "Goal:.*Context:.*$" "Raw delegation template leaked to user"
check_not_contains "rm -rf|drop table|git reset --hard" "Irreversible actions without confirmation context"

if [ "$ERRORS" -gt 0 ]; then
  echo "VALIDATION FAILED: $ERRORS issue(s) found"
  exit 1
else
  echo "VALIDATION PASSED"
  exit 0
fi
