#!/usr/bin/env bash
# validate-fds-engineer.sh — Reads WAI FDS Engineer completion report
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
check_contains "files (created|modified)" "Files created/modified listing"
check_contains "@lifesg/react-design-system|FDS|Layout|Text\." "FDS component references"

# --- MUST NOT contain ---
check_not_contains "<input |<select |<textarea |<button type=\"submit\"" "Raw HTML form controls"
check_not_contains "forwardRef" "Deprecated forwardRef usage"
check_not_contains "style=\{.*#[0-9a-fA-F]{3,6}" "Hardcoded CSS hex values"
check_not_contains "material-ui|antd|chakra|mantine" "Third-party UI libraries"
check_not_contains "useMemo|useCallback" "Manual memoization (React Compiler handles this)"
check_not_contains "git |npm install|npm add" "Git or package commands (outside scope)"

if [ "$ERRORS" -gt 0 ]; then
  echo "VALIDATION FAILED: $ERRORS issue(s) found"
  exit 1
else
  echo "VALIDATION PASSED"
  exit 0
fi
