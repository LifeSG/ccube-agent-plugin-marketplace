#!/usr/bin/env bash
# update-counts.sh — Counts customization files and updates the README.md badge values.
# Safe to run manually or from a git hook.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
README="$REPO_ROOT/README.md"

# Count files for each customization category.
# `find` returns exit 0 even when the directory does not exist if we redirect stderr.
count_files() {
  find "$1" -name "$2" 2>/dev/null | wc -l | tr -d ' '
}

AGENTS=$(find "$REPO_ROOT/plugins" -name "*.agent.md" 2>/dev/null | wc -l | tr -d ' ')
INSTRUCTIONS=$(find "$REPO_ROOT/plugins" -name "*.instructions.md" 2>/dev/null | wc -l | tr -d ' ')
PROMPTS=$(count_files "$REPO_ROOT/prompts"      "*.prompt.md")
# Skills: each skill lives in its own subdirectory inside a plugin; count SKILL.md sentinels
SKILLS=$(find "$REPO_ROOT/plugins" -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')

# Portable in-place sed (macOS requires an empty-string backup extension; Linux does not)
sed_inplace() {
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

sed_inplace "s|/badge/Agents-[0-9]*-|/badge/Agents-${AGENTS}-|g"           "$README"
sed_inplace "s|/badge/Instructions-[0-9]*-|/badge/Instructions-${INSTRUCTIONS}-|g" "$README"
sed_inplace "s|/badge/Skills-[0-9]*-|/badge/Skills-${SKILLS}-|g"           "$README"
sed_inplace "s|/badge/Prompts-[0-9]*-|/badge/Prompts-${PROMPTS}-|g"        "$README"

echo "✔ Badge counts updated — Agents: ${AGENTS}  Instructions: ${INSTRUCTIONS}  Skills: ${SKILLS}  Prompts: ${PROMPTS}"
