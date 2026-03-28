#!/usr/bin/env bash
# update-counts.sh — Counts customization files and updates the README.md badge values.
# Safe to run manually or from a git hook.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
README="$REPO_ROOT/README.md"

# Portable in-place sed (macOS requires an empty-string backup extension; Linux does not)
sed_inplace() {
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

# Root README: update Plugins count only
# (Agents and Skills counts live in each plugin's own README)
PLUGINS=$(find "$REPO_ROOT/plugins" -maxdepth 2 -name "hooks.json" 2>/dev/null | wc -l | tr -d ' ')
sed_inplace "s|/badge/Plugins-[0-9]*-|/badge/Plugins-${PLUGINS}-|g" "$README"

echo "✔ Root badge updated — Plugins: ${PLUGINS}"

# Per-plugin READMEs: update Agents and Skills counts
for PLUGIN_DIR in "$REPO_ROOT/plugins"/*/; do
  PLUGIN_README="${PLUGIN_DIR}README.md"
  [[ -f "$PLUGIN_README" ]] || continue

  PLUGIN_AGENTS=$(find "$PLUGIN_DIR" -maxdepth 2 -name "*.agent.md" 2>/dev/null | wc -l | tr -d ' ')
  # Skills: count SKILL.md sentinels (one per skill subdirectory)
  PLUGIN_SKILLS=$(find "$PLUGIN_DIR" -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')

  sed_inplace "s|/badge/Agents-[0-9]*-|/badge/Agents-${PLUGIN_AGENTS}-|g" "$PLUGIN_README"
  sed_inplace "s|/badge/Skills-[0-9]*-|/badge/Skills-${PLUGIN_SKILLS}-|g" "$PLUGIN_README"

  PLUGIN_NAME=$(basename "$PLUGIN_DIR")
  echo "✔ ${PLUGIN_NAME} — Agents: ${PLUGIN_AGENTS}  Skills: ${PLUGIN_SKILLS}"
done
