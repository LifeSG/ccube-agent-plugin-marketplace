#!/usr/bin/env bash
# Purpose: Manage vendored community skills — add from GitHub, update to latest, or delete from the community plugin.
# Outcome: Skills are downloaded into plugins/community/skills/ and tracked in skills/.manifest.json; stage and commit the result to record the change.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SKILLS_DIR="${PLUGIN_DIR}/skills"
MANIFEST="${SKILLS_DIR}/.manifest.json"

# ── Helpers ───────────────────────────────────────────────────────────────────

usage() {
  cat <<EOF
Manage vendored community skills.

Usage:
  $(basename "$0") add <owner/repo> <path/in/repo> [skill-name]
  $(basename "$0") update [skill-name | --all]
  $(basename "$0") delete <skill-name>
  $(basename "$0") list

Commands:
  add     Download a skill folder from GitHub and vendor it into this plugin.
          skill-name defaults to the last path segment of <path/in/repo>.

  update  Re-download a skill from its recorded source to pick up upstream
          changes. Use --all to update every vendored skill at once.

  delete  Remove a vendored skill folder and its manifest entry.

  list    Show all currently vendored skills and their sources.

Examples:
  $(basename "$0") add mattpocock/skills skills/productivity/grill-me
  $(basename "$0") add github/awesome-copilot skills/review-and-refactor review-refactor
  $(basename "$0") update grill-me
  $(basename "$0") update --all
  $(basename "$0") delete grill-me
  $(basename "$0") list

After add/update/delete, stage and commit:
  git add plugins/community/skills/
  git commit -m "feat(community): ..."
EOF
}

die()  { echo "✖  $*" >&2; exit 1; }
info() { echo "→  $*"; }
ok()   { echo "✔  $*"; }

# ── Manifest helpers (all JSON writes go through python3 with argv, not
#    string interpolation, to safely handle paths with special characters) ─────

manifest_get() {
  local skill="$1" field="$2"
  [[ -f "${MANIFEST}" ]] || { echo ""; return; }
  python3 - "${skill}" "${field}" "${MANIFEST}" <<'PYEOF'
import json, sys
skill, field, path = sys.argv[1:]
try:
    data = json.load(open(path))
    print(data.get("skills", {}).get(skill, {}).get(field, ""))
except Exception:
    print("")
PYEOF
}

manifest_set() {
  local skill="$1" source="$2" path="$3" now="$4"
  mkdir -p "${SKILLS_DIR}"
  python3 - "${skill}" "${source}" "${path}" "${now}" "${MANIFEST}" <<'PYEOF'
import json, sys, os
skill, source, skill_path, now, manifest_path = sys.argv[1:]
data = {}
if os.path.isfile(manifest_path):
    with open(manifest_path) as f:
        data = json.load(f)
skills = data.setdefault("skills", {})
entry = skills.get(skill, {})
entry["source"]  = source
entry["path"]    = skill_path
entry["updated"] = now
if "added" not in entry:
    entry["added"] = now
skills[skill] = entry
with open(manifest_path, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PYEOF
}

manifest_delete() {
  local skill="$1"
  [[ -f "${MANIFEST}" ]] || return
  python3 - "${skill}" "${MANIFEST}" <<'PYEOF'
import json, sys
skill, manifest_path = sys.argv[1:]
with open(manifest_path) as f:
    data = json.load(f)
data.get("skills", {}).pop(skill, None)
with open(manifest_path, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PYEOF
}

manifest_list() {
  [[ -f "${MANIFEST}" ]] || { echo ""; return; }
  python3 - "${MANIFEST}" <<'PYEOF'
import json, sys
manifest_path = sys.argv[1]
try:
    data = json.load(open(manifest_path))
    for name, entry in data.get("skills", {}).items():
        source = entry.get("source", "?")
        path   = entry.get("path", "?")
        added  = entry.get("added", "?")
        print(f"  {name:<30} {source}/{path}  (added {added})")
except Exception as e:
    print(f"  (error reading manifest: {e})")
PYEOF
}

# ── Download ──────────────────────────────────────────────────────────────────

download_skill() {
  local repo="$1" skill_path="$2" dest="$3"
  local tmp_dir
  tmp_dir="$(mktemp -d)"
  # shellcheck disable=SC2064
  trap "rm -rf '${tmp_dir}'" EXIT

  info "Cloning ${repo} (sparse checkout: ${skill_path})…"
  git clone \
    --depth 1 \
    --filter=blob:none \
    --sparse \
    --quiet \
    "https://github.com/${repo}.git" \
    "${tmp_dir}"

  git -C "${tmp_dir}" sparse-checkout set --no-cone "${skill_path}" --quiet

  local src="${tmp_dir}/${skill_path}"
  [[ -d "${src}" ]] || die "Path '${skill_path}' not found in ${repo}. Verify the path exists on the default branch."

  rm -rf "${dest}"
  cp -r "${src}" "${dest}"

  trap - EXIT
  rm -rf "${tmp_dir}"
}

# ── Commands ──────────────────────────────────────────────────────────────────

cmd_add() {
  local repo="${1:-}" skill_path="${2:-}" skill_name="${3:-}"

  [[ -n "${repo}" && -n "${skill_path}" ]] || { usage; exit 1; }
  [[ "${repo}" == */* ]] || die "repo must be in owner/repo format (e.g. mattpocock/skills)"

  [[ -z "${skill_name}" ]] && skill_name="${skill_path##*/}"

  local dest="${SKILLS_DIR}/${skill_name}"
  [[ ! -d "${dest}" ]] || die "Skill '${skill_name}' already exists. Use 'update ${skill_name}' to refresh it."

  mkdir -p "${SKILLS_DIR}"
  download_skill "${repo}" "${skill_path}" "${dest}"

  local now
  now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  manifest_set "${skill_name}" "${repo}" "${skill_path}" "${now}"

  ok "Added '${skill_name}' from github.com/${repo}/${skill_path}"
  echo ""
  echo "   To commit:"
  echo "   git add plugins/community/skills/${skill_name} plugins/community/skills/.manifest.json"
  echo "   git commit -m \"feat(community): add ${skill_name} skill\""
}

cmd_update() {
  local target="${1:---all}"

  if [[ "${target}" == "--all" ]]; then
    local skills
    skills="$(manifest_list_names)"
    [[ -n "${skills}" ]] || die "No skills tracked in manifest. Nothing to update."
    while IFS= read -r skill; do
      [[ -n "${skill}" ]] && _update_one "${skill}"
    done <<< "${skills}"
    echo ""
    echo "   To commit all updates:"
    echo "   git add plugins/community/skills/ && git commit -m \"chore(community): update all vendored skills\""
  else
    _update_one "${target}"
    echo ""
    echo "   To commit:"
    echo "   git add plugins/community/skills/${target} plugins/community/skills/.manifest.json"
    echo "   git commit -m \"chore(community): update ${target} skill\""
  fi
}

manifest_list_names() {
  [[ -f "${MANIFEST}" ]] || { echo ""; return; }
  python3 - "${MANIFEST}" <<'PYEOF'
import json, sys
try:
    data = json.load(open(sys.argv[1]))
    for name in data.get("skills", {}):
        print(name)
except Exception:
    pass
PYEOF
}

_update_one() {
  local skill="$1"
  local repo skill_path
  repo="$(manifest_get "${skill}" source)"
  skill_path="$(manifest_get "${skill}" path)"

  [[ -n "${repo}" ]] || die "Skill '${skill}' not found in manifest. Use 'add' first."

  info "Updating '${skill}' from github.com/${repo}/${skill_path}…"
  download_skill "${repo}" "${skill_path}" "${SKILLS_DIR}/${skill}"

  local now
  now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  manifest_set "${skill}" "${repo}" "${skill_path}" "${now}"

  ok "Updated '${skill}'"
}

cmd_delete() {
  local skill="${1:-}"
  [[ -n "${skill}" ]] || { usage; exit 1; }

  local dest="${SKILLS_DIR}/${skill}"
  [[ -d "${dest}" ]] || die "Skill '${skill}' not found at ${dest}"

  rm -rf "${dest}"
  manifest_delete "${skill}"

  ok "Deleted '${skill}'"
  echo ""
  echo "   To commit:"
  echo "   git add plugins/community/skills/.manifest.json && git commit -m \"feat(community): remove ${skill} skill\""
}

cmd_list() {
  if [[ ! -f "${MANIFEST}" ]]; then
    echo "No skills vendored yet."
    return
  fi
  echo "Vendored community skills:"
  echo ""
  manifest_list
  echo ""
}

# ── Entry point ───────────────────────────────────────────────────────────────

main() {
  command -v git     >/dev/null 2>&1 || die "git is required but not found in PATH."
  command -v python3 >/dev/null 2>&1 || die "python3 is required but not found in PATH."

  local cmd="${1:-}"
  shift || true

  case "${cmd}" in
    add)          cmd_add "$@" ;;
    update)       cmd_update "$@" ;;
    delete|remove) cmd_delete "$@" ;;
    list)         cmd_list ;;
    help|--help|-h|"") usage ;;
    *) echo "Unknown command: ${cmd}" >&2; usage; exit 1 ;;
  esac
}

main "$@"
