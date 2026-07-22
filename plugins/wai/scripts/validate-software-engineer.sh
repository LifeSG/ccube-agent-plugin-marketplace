#!/usr/bin/env bash
# validate-software-engineer.sh — Reads WAI Software Engineer output
# from stdin and validates against acceptance criteria.
# Supports both Architecture Decision Record (Phase 1.5) and
# Technical Review Report (Phase 7) formats.
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

# --- Detect output type ---
if echo "$INPUT" | grep -qiE "Architecture Decision Record"; then
  MODE="adr"
elif echo "$INPUT" | grep -qiE "Technical Review Report"; then
  MODE="review"
else
  echo "FAIL: Output matches neither Architecture Decision Record nor Technical Review Report"
  exit 1
fi

if [ "$MODE" = "adr" ]; then
  # --- ADR MUST contain ---
  check_contains "## Architecture Decision Record" "ADR heading"
  check_contains "### Data Model Assessment" "Data Model Assessment section"
  check_contains "### API Contract Assessment" "API Contract Assessment section"
  check_contains "### Component Architecture" "Component Architecture section"
  check_contains "### Security Architecture" "Security Architecture section"
  check_contains "### Technical Risks" "Technical Risks section"
  check_contains "### Recommended Changes" "Recommended Changes section"
  check_contains "### Architecture Verdict" "Architecture Verdict section"
  check_contains "proceed as designed|proceed with modifications|needs redesign" "Verdict value"

  # --- ADR MUST NOT contain ---
  check_not_contains "code looks clean|good job|nice work|well done" "Subjective quality assessments"
else
  # --- Technical Review Report MUST contain ---
  check_contains "## Technical Review Report" "Technical Review Report heading"
  check_contains "### CRITICAL Issues|### CRITICAL" "CRITICAL Issues section"
  check_contains "### HIGH Issues|### HIGH" "HIGH Issues section"
  check_contains "### Verdict" "Verdict section"
  check_contains "ready to ship|needs fixes|needs redesign|No blocking issues" "Verdict value"

  # --- Technical Review Report MUST NOT contain ---
  check_not_contains "code looks clean|good job|nice work|well done" "Subjective quality assessments"
fi

if [ "$ERRORS" -gt 0 ]; then
  echo "VALIDATION FAILED ($MODE): $ERRORS issue(s) found"
  exit 1
else
  echo "VALIDATION PASSED ($MODE)"
  exit 0
fi
