#!/usr/bin/env bash
# validate-backend-engineer.sh — Reads Backend Implementation Report
# from stdin and validates against acceptance criteria.
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
check_contains "## Backend Implementation Report" "Backend Implementation Report heading"
check_contains "### Files Created or Modified" "Files Created or Modified section"
check_contains "### Endpoints Implemented" "Endpoints Implemented section"
check_contains "### Migrations Added" "Migrations Added section"
check_contains "(GET|POST|PUT|PATCH|DELETE) /api/" "HTTP method + API path in endpoints"

# --- MUST NOT contain ---
check_not_contains "from ['\"](\.\./)*shared/" "Import from shared/ in server code"
check_not_contains "sk_live_|api_key.*=.*['\"][a-zA-Z0-9]{20}" "Hardcoded secrets or API keys"

if [ "$ERRORS" -gt 0 ]; then
  echo "VALIDATION FAILED: $ERRORS issue(s) found"
  exit 1
else
  echo "VALIDATION PASSED"
  exit 0
fi
