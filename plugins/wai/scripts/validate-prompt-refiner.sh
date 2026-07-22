#!/usr/bin/env bash
# validate-prompt-refiner.sh — Reads Prompt Refiner output from stdin
# and validates against acceptance criteria.
# Exit 0 on pass, non-zero on failure.

set -euo pipefail

INPUT=$(cat)
ERRORS=0

check_contains() {
  if ! echo "$INPUT" | grep -qiE "$1"; then
    echo "FAIL: Output missing required pattern: $2"
    ERRORS=$((ERRORS + 1))
  fi
}

check_not_contains() {
  if echo "$INPUT" | grep -qiE "$1"; then
    echo "FAIL: Output contains forbidden pattern: $2"
    ERRORS=$((ERRORS + 1))
  fi
}

# --- MUST contain ---
check_contains "\*\*Refined prompt:\*\*" "Refined prompt section"
check_contains "\*\*Prompt engineering principles applied:\*\*" "Principles applied section"
check_contains "\*\*What was improved:\*\*" "What was improved section"
check_contains "\[.*\]" "Placeholder markers for uninferable details"

# --- MUST NOT contain ---
check_not_contains "could you|can you confirm|please clarify|what do you" "Questions or clarifying requests"
check_not_contains "I refined|I improved|As a prompt engineer" "Meta-commentary about refinement process"

if [ "$ERRORS" -gt 0 ]; then
  echo "VALIDATION FAILED: $ERRORS issue(s) found"
  exit 1
else
  echo "VALIDATION PASSED"
  exit 0
fi
