#!/usr/bin/env bash
# ccube plugin telemetry — session start event
# Plugin: ccube-fds-web-app-builder
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

PLUGIN_NAME="ccube-fds-web-app-builder"
TELEMETRY_ENDPOINT="${CCUBE_TELEMETRY_ENDPOINT:-https://webhook.site/1f999c77-c7ec-4101-a234-9de5a0c9e92f}"
ID_FILE="${HOME}/.ccube/telemetry-id"

# ── Opt-out check ────────────────────────────────────────────────────────────
[[ "${CCUBE_TELEMETRY_DISABLED:-0}" == "1" ]] && exit 0

# ── Endpoint HTTPS validation ────────────────────────────────────────────────
# Reject any non-HTTPS endpoint to prevent plaintext transmission of the ID.
[[ "${TELEMETRY_ENDPOINT}" != https://* ]] && exit 0

# ── Parse agent name from stdin (non-blocking, best-effort) ─────────────────
STDIN_JSON=""
IFS= read -r -t 1 STDIN_JSON 2>/dev/null || true

AGENT_NAME="unknown"
if [[ "${STDIN_JSON}" =~ \"agent\"[[:space:]]*:[[:space:]]*\"([^\"]+)\" ]]; then
  AGENT_NAME="${BASH_REMATCH[1]}"
  # Strip all characters not safe for JSON string embedding (backslashes,
  # control characters, and other JSON-significant sequences).
  AGENT_NAME="${AGENT_NAME//[^a-zA-Z0-9_-]/}"
fi

# ── Create or load anonymous installation ID ─────────────────────────────────
mkdir -p "${HOME}/.ccube" 2>/dev/null || true

IS_NEW_INSTALL="false"
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
  IS_NEW_INSTALL="true"
fi

ANON_ID="$(cat "${ID_FILE}" 2>/dev/null || echo "unknown")"
# Validate format to prevent injection from a tampered ID file.
# Accepts: standard UUID (36 chars), 32-char hex (od fallback), or "unknown".
if [[ ! "${ANON_ID}" =~ ^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{32}|unknown)$ ]]; then
  ANON_ID="unknown"
fi

# ── Fire events (synchronous, bounded by --max-time 5) ──────────────────────
# Background curl (&) was dropped: VS Code hook runtime kills the process group
# on script exit, taking backgrounded children with it before they complete.
NOW="$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u)"

# Debug: write a local log so you can verify the hook is firing from VS Code.
# Remove this block once telemetry delivery is confirmed.
DEBUG_LOG="${HOME}/.ccube/hook-debug.log"
printf '[%s] session_start fired: plugin=%s agent=%s\n' \
  "${NOW}" "${PLUGIN_NAME}" "${AGENT_NAME}" >> "${DEBUG_LOG}" 2>/dev/null || true

_fire() {
  curl --silent --max-time 5 --output /dev/null \
    -H "Content-Type: application/json" \
    -d "$1" "${TELEMETRY_ENDPOINT}" 2>/dev/null
}

_fire "$(printf \
  '{"event":"session_start","anonymousId":"%s","plugin":"%s","agent":"%s","ts":"%s"}' \
  "${ANON_ID}" "${PLUGIN_NAME}" "${AGENT_NAME}" "${NOW}")"

# Fire install event on the very first session for this plugin
if [[ "${IS_NEW_INSTALL}" == "true" ]]; then
  _fire "$(printf \
    '{"event":"install","anonymousId":"%s","plugin":"%s","ts":"%s"}' \
    "${ANON_ID}" "${PLUGIN_NAME}" "${NOW}")"
fi

exit 0
