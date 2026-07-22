#!/usr/bin/env bash
# Usage: ./scripts/release.sh <plugin-name> <version>
# Example: ./scripts/release.sh wai 1.3.0
#
# What this script does:
#   1. Validates the plugin-name and version arguments
#   2. Bumps version in the plugin manifests for the given plugin
#   3. Bumps version in marketplace.json if present
#   4. Prepends the unreleased changelog entries if cliff.toml is present
#   5. Commits and tags locally

set -euo pipefail

PLUGIN_NAME="${1:-}"
VERSION="${2:-}"

if [[ -z "$PLUGIN_NAME" ]]; then
  echo "Error: plugin-name argument required" >&2
  echo "Usage: $0 <plugin-name> <version>  (e.g. $0 wai 1.3.0)" >&2
  exit 1
fi

if [[ -z "$VERSION" ]]; then
  echo "Error: version argument required" >&2
  echo "Usage: $0 <plugin-name> <version>  (e.g. $0 wai 1.3.0)" >&2
  exit 1
fi

if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: version must be semver (e.g. 1.3.0)" >&2
  exit 1
fi

TAG="v${VERSION}"

# Ensure working tree is clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: working tree has uncommitted changes. Commit or stash first." >&2
  exit 1
fi

# Ensure tag doesn't already exist
if git tag --list | grep -qx "$TAG"; then
  echo "Error: tag $TAG already exists" >&2
  exit 1
fi

echo "Releasing ${PLUGIN_NAME} ${TAG}..."

# ── 1. Bump versions ─────────────────────────────────────────────────────────

COPILOT_PLUGIN="plugins/${PLUGIN_NAME}/plugin.json"
CLAUDE_PLUGIN="plugins/${PLUGIN_NAME}/.claude-plugin/plugin.json"
MARKETPLACE=".github/plugin/marketplace.json"
CLAUDE_MARKETPLACE=".claude-plugin/marketplace.json"

# portable sed -i (macOS BSD sed requires a space before the empty extension;
# GNU sed on Linux does not accept a space)
if [[ "$(uname -s)" == "Darwin" ]]; then
  sedi() { sed -i '' "$@"; }
else
  sedi() { sed -i "$@"; }
fi

sedi "s/\"version\": \"[^\"]*\"/\"version\": \"${VERSION}\"/" "$COPILOT_PLUGIN"
sedi "s/\"version\": \"[^\"]*\"/\"version\": \"${VERSION}\"/" "$CLAUDE_PLUGIN"

STAGED_FILES=("$COPILOT_PLUGIN" "$CLAUDE_PLUGIN")

echo "  Bumped versions to $VERSION in:"
echo "    $COPILOT_PLUGIN"
echo "    $CLAUDE_PLUGIN"

if [[ -f "$MARKETPLACE" ]]; then
  # marketplace.json nests the version inside the plugins array entry
  # use Python for reliable JSON patching without a jq dependency
  python3 - "$MARKETPLACE" "$PLUGIN_NAME" "$VERSION" <<'EOF'
import sys, json
path, plugin_name, ver = sys.argv[1], sys.argv[2], sys.argv[3]
with open(path) as f:
    data = json.load(f)
for plugin in data.get("plugins", []):
    if plugin.get("name") == plugin_name:
        plugin["version"] = ver
with open(path, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
EOF
  STAGED_FILES+=("$MARKETPLACE")
  echo "    $MARKETPLACE"
fi

if [[ -f "$CLAUDE_MARKETPLACE" ]]; then
  # .claude-plugin/marketplace.json has two version fields:
  #   metadata.version  — catalog-level version
  #   plugins[].version — per-plugin version
  python3 - "$CLAUDE_MARKETPLACE" "$PLUGIN_NAME" "$VERSION" <<'EOF'
import sys, json
path, plugin_name, ver = sys.argv[1], sys.argv[2], sys.argv[3]
with open(path) as f:
    data = json.load(f)
if "metadata" in data:
    data["metadata"]["version"] = ver
for plugin in data.get("plugins", []):
    if plugin.get("name") == plugin_name:
        plugin["version"] = ver
with open(path, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
EOF
  STAGED_FILES+=("$CLAUDE_MARKETPLACE")
  echo "    $CLAUDE_MARKETPLACE"
fi

# ── 2. Changelog ─────────────────────────────────────────────────────────────

if [[ -f "cliff.toml" ]]; then
  npm run changelog -- --tag "$TAG"
  STAGED_FILES+=("CHANGELOG.md")
  echo "  Prepended CHANGELOG.md"
else
  echo "  Skipping changelog (no cliff.toml found)"
fi

# ── 3. Commit, tag, push ─────────────────────────────────────────────────────

git add "${STAGED_FILES[@]}"
git commit -m "chore(release): ${PLUGIN_NAME} ${TAG}"
git tag -a "$TAG" -m "Release ${PLUGIN_NAME} ${TAG}"

echo ""
echo "Release ${PLUGIN_NAME} ${TAG} committed and tagged locally."
echo "Run the following to publish:"
echo "  git push origin main --follow-tags"
