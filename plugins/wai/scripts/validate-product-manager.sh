#!/usr/bin/env bash
# validate-product-manager.sh — Reads Product Brief from stdin and
# validates against acceptance criteria.
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
check_contains "### Problem Statement" "Problem Statement section"
check_contains "### Users & Goals|### Users and Goals" "Users & Goals section"
check_contains "### Out of Scope" "Out of Scope section"
check_contains "### MVP Scope" "MVP Scope section"
check_contains "### User Stories" "User Stories section"
check_contains "### Frontend Implementation Brief" "Frontend Implementation Brief section"
check_contains "### Backend Implementation Brief" "Backend Implementation Brief section"
check_contains "\- \[ \]" "Acceptance criteria checkboxes in User Stories"
check_contains "(GET|POST|PUT|PATCH|DELETE) " "API endpoint definitions in Backend Brief"

# --- MUST NOT contain ---
check_not_contains "looks good|works well|high quality" "Subjective untestable criteria"

if [ "$ERRORS" -gt 0 ]; then
  echo "VALIDATION FAILED: $ERRORS issue(s) found"
  exit 1
else
  echo "VALIDATION PASSED"
  exit 0
fi
