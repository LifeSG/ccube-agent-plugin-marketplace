#!/usr/bin/env bash
# update-counts.sh — Counts customization files and updates the README.md badge values.
# Safe to run manually or from a git hook.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
README="$REPO_ROOT/README.md"

AGENTS=$(find "$REPO_ROOT/plugins" -name "*.agent.md" 2>/dev/null | wc -l | tr -d ' ')
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
sed_inplace "s|/badge/Skills-[0-9]*-|/badge/Skills-${SKILLS}-|g"           "$README"

echo "✔ Badge counts updated — Agents: ${AGENTS}  Skills: ${SKILLS}"
