#!/usr/bin/env bash
# ccube plugin telemetry — session start and subagent start events
# Plugin: ccube-ux-designers
#
# Privacy: collects only anonymous, aggregated usage counts.
# No PII, no file contents, no workspace data is ever collected.
#
# Opt out: add the following to your shell profile and restart VS Code:
#   export CCUBE_TELEMETRY_DISABLED=1
#
# Override the endpoint for self-hosting:
#   export CCUBE_TELEMETRY_ENDPOINT=https://your-endpoint/event

# Telemetry must never block or break the user experience.
# Every failure path exits 0 silently.

PLUGIN_NAME="ccube-ux-designers"
TELEMETRY_ENDPOINT="${CCUBE_TELEMETRY_ENDPOINT:-https://cc-agent-plugin-telemetry-frontend.cio.sandbox.gov.sg/api/events}"
ID_FILE="${HOME}/.ccube/telemetry-id"
MARKER_FILE="${HOME}/.ccube/installed-${PLUGIN_NAME}"

# Defence-in-depth: reject plugin names with unexpected characters.
[[ "${PLUGIN_NAME}" =~ ^[a-zA-Z0-9_-]+$ ]] || exit 0

# ── Opt-out check ────────────────────────────────────────────────────────────
[[ "${CCUBE_TELEMETRY_DISABLED:-0}" == "1" ]] && exit 0

# ── Endpoint HTTPS validation ────────────────────────────────────────────────
# Reject any non-HTTPS endpoint to prevent plaintext transmission of the ID.
[[ "${TELEMETRY_ENDPOINT}" != https://* ]] && exit 0

# ── Parse hook event and context from stdin ─────────────────────────────────
STDIN_JSON=""
IFS= read -r -d '' -t 2 STDIN_JSON 2>/dev/null || true

# Determine which lifecycle event fired this script.
# VS Code sends hook_event_name in snake_case (not hookEventName).
HOOK_EVENT="UNDEFINED"
if [[ "${STDIN_JSON}" =~ \"hook_event_name\"[[:space:]]*:[[:space:]]*\"([^\"]+)\" ]]; then
  HOOK_EVENT="${BASH_REMATCH[1]}"
fi
# Allowlist: only known lifecycle events may enter the curl payload.
[[ "${HOOK_EVENT}" =~ ^(SessionStart|SubagentStart|UNDEFINED)$ ]] || HOOK_EVENT="UNDEFINED"

# For SubagentStart: extract agent_type (camelCase in VS Code).
AGENT_TYPE="UNDEFINED"
if [[ "${STDIN_JSON}" =~ \"agent_type\"[[:space:]]*:[[:space:]]*\"([^\"]+)\" ]]; then
  AGENT_TYPE="${BASH_REMATCH[1]}"
  AGENT_TYPE="${AGENT_TYPE//[^a-zA-Z0-9_-]/}"
fi

# Extract chat session ID from hook context.
# Try camelCase (documented) and snake_case (observed for other fields).
SESSION_ID="UNDEFINED"
if [[ "${STDIN_JSON}" =~ \"sessionId\"[[:space:]]*:[[:space:]]*\"([^\"]+)\" ]]; then
  SESSION_ID="${BASH_REMATCH[1]}"
elif [[ "${STDIN_JSON}" =~ \"session_id\"[[:space:]]*:[[:space:]]*\"([^\"]+)\" ]]; then
  SESSION_ID="${BASH_REMATCH[1]}"
fi
# Sanitise: allow alphanumeric with hyphens/underscores only.
SESSION_ID="${SESSION_ID//[^a-zA-Z0-9_-]/}"

# ── Create or load anonymous installation ID ─────────────────────────────────
mkdir -p "${HOME}/.ccube" 2>/dev/null || true

IS_NEW_ID="false"
if [[ ! -f "${ID_FILE}" ]]; then
  ANON_ID=""
  if command -v uuidgen &>/dev/null; then
    ANON_ID="$(uuidgen 2>/dev/null | tr '[:upper:]' '[:lower:]')"
  elif [[ -r /proc/sys/kernel/random/uuid ]]; then
    ANON_ID="$(cat /proc/sys/kernel/random/uuid 2>/dev/null)"
  fi
  # Last-resort: random bytes from /dev/urandom; avoids hostname (PII-adjacent)
  # or timestamp (predictable and reveals install time).
  if [[ -z "${ANON_ID}" ]]; then
    ANON_ID="$(od -vN 16 -An -tx1 /dev/urandom 2>/dev/null | tr -d ' \n')"
  fi
  # If entropy is truly unavailable, omit the ID entirely.
  if [[ -z "${ANON_ID}" ]]; then
    ANON_ID="unknown"
  fi
  printf '%s' "${ANON_ID}" > "${ID_FILE}" 2>/dev/null || true
  IS_NEW_ID="true"
fi

ANON_ID="$(cat "${ID_FILE}" 2>/dev/null || echo "unknown")"
# Validate format to prevent injection from a tampered ID file.
# Accepts: standard UUID (36 chars), 32-char hex (od fallback), or "unknown".
if [[ ! "${ANON_ID}" =~ ^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{32}|unknown)$ ]]; then
  ANON_ID="unknown"
fi

# New anonymous ID → clear stale per-plugin markers so all plugins
# re-register under the new identity.
if [[ "${IS_NEW_ID}" == "true" ]]; then
  rm -f "${HOME}/.ccube/installed-"* 2>/dev/null || true
fi

# ── Per-plugin install tracking ──────────────────────────────────────────────
NEEDS_INSTALL_EVENT="true"
if [[ -f "${MARKER_FILE}" ]] && [[ -s "${MARKER_FILE}" ]]; then
  NEEDS_INSTALL_EVENT="false"
fi

# ── Fire events (synchronous, bounded by --max-time 5) ──────────────────────
# Background curl (&) was dropped: VS Code hook runtime kills the process group
# on script exit, taking backgrounded children with it before they complete.
NOW="$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u)"

# Debug: write a local log so you can verify the hook is firing from VS Code.
# Remove this block once telemetry delivery is confirmed.
DEBUG_LOG="${HOME}/.ccube/hook-debug.log"
printf '[%s] %s fired: plugin=%s agent_type=%s session_id=%s\n' \
  "${NOW}" "${HOOK_EVENT}" "${PLUGIN_NAME}" "${AGENT_TYPE}" "${SESSION_ID}" >> "${DEBUG_LOG}" 2>/dev/null || true
printf '[%s] stdin: %s\n' "${NOW}" "${STDIN_JSON}" >> "${DEBUG_LOG}" 2>/dev/null || true

_fire() {
  curl --silent --max-time 5 --output /dev/null \
    --write-out '%{http_code}' \
    -H "Content-Type: application/json" \
    -d "$1" "${TELEMETRY_ENDPOINT}" 2>/dev/null || echo "000"
}

_fire "$(printf \
  '{"event":"%s","anonymousId":"%s","plugin":"%s","agentType":"%s","chatSessionId":"%s","ts":"%s"}' \
  "${HOOK_EVENT}" "${ANON_ID}" "${PLUGIN_NAME}" "${AGENT_TYPE}" "${SESSION_ID}" "${NOW}")" >/dev/null

# Fire per-plugin install event if not yet recorded
if [[ "${NEEDS_INSTALL_EVENT}" == "true" ]]; then
  INSTALL_HTTP_CODE="$(_fire "$(printf \
    '{"event":"plugin_installed","anonymousId":"%s","plugin":"%s","chatSessionId":"%s","ts":"%s"}' \
    "${ANON_ID}" "${PLUGIN_NAME}" "${SESSION_ID}" "${NOW}")")"
  if [[ "${INSTALL_HTTP_CODE}" =~ ^2[0-9]{2}$ ]]; then
    printf '%s' "${NOW}" > "${MARKER_FILE}" 2>/dev/null || true
    printf '[%s] plugin_installed delivered for %s (HTTP %s)\n' \
      "${NOW}" "${PLUGIN_NAME}" "${INSTALL_HTTP_CODE}" >> "${DEBUG_LOG}" 2>/dev/null || true
  else
    printf '[%s] plugin_installed FAILED for %s (HTTP %s) — will retry next session\n' \
      "${NOW}" "${PLUGIN_NAME}" "${INSTALL_HTTP_CODE}" >> "${DEBUG_LOG}" 2>/dev/null || true
  fi
fi

exit 0
