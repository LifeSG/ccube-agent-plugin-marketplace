# EP-0001: Per-Plugin Install Telemetry

**Created**: 2026-03-30
**Input**: User description: "I would like to update how the install
count works for telemetry. Currently, only when the first plugin is
installed, it will send a telemetry that there's a new install. But
I would like to track for every plugin installation, linked to the
same user."

- [Summary](#summary)
- [Motivation](#motivation)
  - [Goals](#goals)
  - [Non-Goals](#non-goals)
- [Proposal](#proposal)
  - [Acceptance Criteria](#acceptance-criteria)
  - [Notes/Constraints/Caveats](#notesconstraintscaveats)
  - [Risks and Mitigation](#risks-and-mitigation)
- [Design Details](#design-details)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Database](#database)
- [Alternatives](#alternatives)
- [Infrastructure Needed (Optional)](#infrastructure-needed-optional)
- [Review & Acceptance Checklist](#review--acceptance-checklist)
- [Execution Status](#execution-status)

## Summary

Update the telemetry install tracking mechanism so that each
plugin fires its own `plugin_installed` event the first time it
runs on a user's machine. Today, all four plugins share a single
anonymous ID file (`~/.ccube/telemetry-id`). Because the install
event is gated on that file's creation, only the very first
plugin ever installed sends an install event — plugins two, three,
and four are silently ignored.

This EP proposes decoupling the anonymous identity (shared across
all plugins) from per-plugin install state (tracked individually).
The anonymous ID file remains unchanged; a new per-plugin marker
mechanism records whether each plugin has already fired its install
event. Additionally, a retry mechanism is introduced so that failed
install event deliveries are retried on the next session.

## Motivation

The team currently cannot answer fundamental adoption questions:

- How many users installed plugin X?
- Which plugins are the most popular?
- How many plugins does the average user install?
- What is the install-to-active-use conversion rate per plugin?

All of these require per-plugin install granularity. The current
design conflates "first plugin on this machine" with "plugin
installed", making it impossible to distinguish individual plugin
adoption.

### Goals

- **G1**: Fire a distinct `plugin_installed` event for each
  plugin the first time that plugin's telemetry script runs on a
  given machine.
- **G2**: Reuse the same anonymous ID across all plugins so
  events can be correlated to the same user without identifying
  them.
- **G3**: Retry failed install event delivery on the next
  session instead of silently dropping it.
- **G4**: Maintain backward compatibility — existing opt-out
  (`CCUBE_TELEMETRY_DISABLED`), endpoint override
  (`CCUBE_TELEMETRY_ENDPOINT`), and HTTPS-only validation
  continue to work unchanged.

### Non-Goals

- Tracking plugin **uninstalls** (VS Code does not expose an
  uninstall hook to agent plugins).
- Tracking plugin **reinstalls** — if a user uninstalls and
  reinstalls a plugin, the existing marker persists and no
  new install event fires. This is acceptable for current
  analytics needs.
- Changing the telemetry payload schema — the existing fields
  (`event`, `anonymousId`, `plugin`, `ts`, optional `agentType`)
  remain as-is.
- Adding a server-side deduplication layer — the backend may
  receive a duplicate if the marker file is deleted manually;
  server-side idempotency is out of scope for this EP.
- Introducing a new telemetry transport (e.g., replacing curl
  with a dedicated SDK).
- Adding test infrastructure — while valuable, testing strategy
  is a separate concern.

## Proposal

Split the current single-file install detection into two
concerns:

1. **Anonymous identity** — the shared file
   `~/.ccube/telemetry-id` continues to store the user's UUID.
   Its creation logic is unchanged.

2. **Per-plugin install state** — each plugin tracks whether it
   has successfully sent its `plugin_installed` event using an
   individual marker. When a plugin's telemetry script runs and
   no marker exists for that plugin, it fires the install event.
   On successful delivery, the marker is written. On failure,
   no marker is written, so the next session retries.

### Acceptance Criteria

#### AC 1 — First install of any plugin

Given a user with no plugins installed (no anonymous ID exists),
when they install plugin A and its telemetry script runs for the
first time, then:

- A new anonymous ID is generated and persisted.
- A `plugin_installed` event is sent for plugin A with that ID.
- A marker is written recording plugin A's install was sent.

#### AC 2 — Second plugin on the same machine

Given a user who already has plugin A installed (anonymous ID
exists), when they install plugin B and its telemetry script runs
for the first time, then:

- The existing anonymous ID is reused (not regenerated).
- A `plugin_installed` event is sent for plugin B with the same
  anonymous ID.
- A marker is written for plugin B.
- Plugin A's marker is unaffected.

#### AC 3 — No duplicate on subsequent sessions

Given a user who already has plugin A installed and its install
event was successfully sent, when plugin A's telemetry script
runs again on a subsequent session, then:

- No `plugin_installed` event is sent for plugin A.
- The regular session/subagent events continue to fire normally.

#### AC 4 — All plugins tracked independently

Given a user who installs all 4 plugins over time, when all
telemetry scripts have run at least once each, then:

- Exactly 4 distinct `plugin_installed` events exist — one per
  plugin, all sharing the same anonymous ID.

#### AC 5 — Retry on delivery failure

Given that the telemetry endpoint is unreachable when plugin A's
install event should fire, when the endpoint becomes reachable on
a later session, then:

- The install event is retried and sent successfully.
- The marker is written only after confirmed delivery.

#### AC 6 — Opt-out respected

Given a user who has set `CCUBE_TELEMETRY_DISABLED=1`, when any
plugin's telemetry script runs, then:

- No install event is sent for any plugin.
- No markers are written or checked.

### Notes/Constraints/Caveats

- **Cross-plugin sync**: All 4 `session-telemetry.sh` scripts
  must be updated identically (only `PLUGIN_NAME` differs).
  This is an existing repo convention documented in `AGENT.md`.
- **No background curl**: VS Code's hook runtime kills the
  process group on script exit, so all curl calls must remain
  synchronous with the existing `--max-time 5` bound.
- **Corrupted ID file**: Existing sanitisation logic already
  regenerates the anonymous ID if the file contains an invalid
  value. Per-plugin markers should follow the same resilience
  pattern — if a marker file is corrupted or unreadable, treat
  the plugin as not-yet-installed.
- **Future plugins**: The mechanism must work for any new plugin
  added to the marketplace without changes to existing scripts.
  Each script only needs to know its own `PLUGIN_NAME`.

### Risks and Mitigation

| Risk                                                 | Impact                                                         | Mitigation                                                                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Marker file permissions prevent write                | Install event fires repeatedly every session                   | Fail open: if marker cannot be written, log to debug file and continue; accept potential duplicate events             |
| User deletes `~/.ccube/` directory manually          | All plugins fire install events again under a new anonymous ID | Acceptable — indistinguishable from a new user; server-side dedup is a non-goal                                       |
| Curl timeout on slow networks causes missed installs | Install event not delivered                                    | Retry on next session (AC 5) mitigates this                                                                           |
| Race condition if two plugins start simultaneously   | Two scripts check/write markers at the same time               | Acceptable — worst case is a duplicate install event for one plugin; markers are per-plugin so no cross-contamination |

## Design Details

### Component Design — `session-telemetry.sh`

#### Per-Plugin Marker File

- **Path**: `~/.ccube/installed-<PLUGIN_NAME>` (same directory
  as `telemetry-id`).
  Example: `~/.ccube/installed-ccube-fds-web-app-builder`.
- **Content**: ISO 8601 UTC timestamp of the successful
  delivery (e.g. `2026-03-30T14:22:01Z`). Preferred over
  an empty file because: (a) aids debugging, (b) one `printf`
  — no complexity increase, (c) a zero-byte file is
  indistinguishable from a truncated write.
- **Variable**: Define `MARKER_FILE` immediately after
  `PLUGIN_NAME` and `ID_FILE`:
  `MARKER_FILE="${HOME}/.ccube/installed-${PLUGIN_NAME}"`.

#### Install Detection Logic Redesign

Replace the current `IS_NEW_INSTALL` flag (tied to shared ID
file creation) with per-plugin marker checks:

1. Anonymous ID creation/load block remains **unchanged**.
   Remove `IS_NEW_INSTALL` from it — ID creation no longer
   implies install.
2. After `ANON_ID` is loaded and validated, introduce:
   - Check `[[ -f "${MARKER_FILE}" ]]` and
     `[[ -s "${MARKER_FILE}" ]]` (exists and non-zero size).
   - Both true → `NEEDS_INSTALL_EVENT="false"`.
   - Either false → `NEEDS_INSTALL_EVENT="true"`.
3. Session/subagent event fires unconditionally (unchanged).
4. After session event, if `NEEDS_INSTALL_EVENT == "true"`:
   call `_fire()` for `plugin_installed`. Write marker only
   on confirmed delivery.

#### Delivery Confirmation

Update `_fire()` to capture HTTP status:

- Add `--write-out '%{http_code}'` to curl. Capture stdout
  (the 3-digit HTTP code) since `--output /dev/null` still
  suppresses the response body.
- Success: HTTP 200–299. Anything else (including curl
  failure) = failure.
- For session/subagent events: fire-and-forget (ignore
  return). For install events only: capture and act on result.

#### Retry Mechanism

Implicit — no queue, no retry file, no backoff:

1. If `NEEDS_INSTALL_EVENT == "true"`, attempt the curl call.
2. If delivery succeeds (2xx), write the marker file.
3. If delivery fails, do not write the marker.
4. Next session, marker still absent → triggers attempt again.

Retry frequency = session frequency (user-initiated). One
extra curl per session bounded by `--max-time 5` — no UX
impact.

#### Event Name

Use `plugin_installed` (not `install`).

- Unambiguously refers to a plugin installation (not IDE
  install or extension install).
- The semantic shift (single-install → per-plugin) warrants
  a new event name to avoid conflating old- and
  new-semantics events in analytics.
- Aligns with the API spec examples.

#### Cross-Plugin Isolation

- Each script reads only `~/.ccube/telemetry-id` (shared,
  read-only after creation).
- Each script reads/writes only its own marker file.
- No cross-plugin writes occur — each script is fully
  independent.

### Infrastructure & Deployment

#### Local Filesystem Changes

**New files** (one per plugin, created on successful delivery):

```
~/.ccube/installed-ccube-fds-web-app-builder
~/.ccube/installed-ccube-software-craft
~/.ccube/installed-ccube-frontend-dev
~/.ccube/installed-ccube-ux-designers
```

Total footprint: ~30 bytes per marker. Negligible. No TTL
or rotation needed.

#### Deployment

Scripts are distributed as part of VS Code agent plugins via
the `agentPlugins` folder. Update approach:

1. Edit one canonical script.
2. Copy to the other 3 plugins, changing only `PLUGIN_NAME`.
3. Commit all 4 in a single PR.

Users receive updates on next VS Code restart. The first
`SessionStart` hook after the update triggers install events
for all installed plugins.

#### Environment Variables

No new environment variables required. Existing:

- `CCUBE_TELEMETRY_DISABLED` — opt-out (unchanged).
- `CCUBE_TELEMETRY_ENDPOINT` — endpoint override (unchanged).

Marker directory is not configurable — it follows the same
`~/.ccube/` convention with no foreseeable override need.

#### Backward Compatibility & Migration

**Zero-touch automatic migration**: When updated scripts run
on machines with existing `telemetry-id` but no markers, all
4 plugins fire `plugin_installed` on their next session. This
is the desired backfill — the backend has no prior per-plugin
data.

**Expected rollout pattern**:

- Day 1: Spike as existing users open VS Code — all 4
  plugins fire backfill events.
- Day 2+: Steady trickle of new installs and retries.
- Ongoing: 1–4 events per new user depending on plugins
  installed.

### Data Migration

#### Forward Migration

No explicit migration script needed. The absence of markers
IS the migration trigger. Each plugin fires `plugin_installed`
on its next session, producing exactly 4 events per existing
user — all carrying the existing anonymous ID.

#### Anonymous ID Preservation

**Invariant**: The updated script MUST NOT modify, delete, or
regenerate `~/.ccube/telemetry-id`. The ID creation block
remains unchanged. Marker logic only reads `ANON_ID`.

#### Marker File Schema

Recommended: **Timestamp of successful delivery**.

| Option            | Pros                                        | Cons                                                     |
| ----------------- | ------------------------------------------- | -------------------------------------------------------- |
| (a) Empty file    | Simplest                                    | Zero diagnostics; can't distinguish from truncated write |
| **(b) Timestamp** | **Debuggable; validates intentional write** | **27 bytes vs 0**                                        |
| (c) Anonymous ID  | Links marker to ID                          | Stale if ID regenerated; no use case                     |

#### Rollback Strategy

Old scripts ignore marker files — they never check for them.
Markers become orphaned but harmless (<200 bytes total).
Re-rollforward recognises existing markers correctly.

**Rollback is safe. No data loss. No manual cleanup.**

#### Edge Case — Corrupted Markers

**Policy**: Treat unreadable markers as absent. Re-fire the
install event. A duplicate event is harmless; a missing
install event is unrecoverable data loss.

Log to debug file when corrupted marker detected:
`WARN: marker for <plugin> exists but unreadable — re-firing`

#### Edge Case — Anonymous ID Regenerated

If user deletes `telemetry-id`, a new UUID is generated.
**Clear all per-plugin markers** so all plugins re-fire under
the new ID. Rationale: existing markers reference a stale
identity; the backend would see an active user with no
recorded install.

Add a block after ID generation: if a new ID was just
created, `rm -f ~/.ccube/installed-* 2>/dev/null || true`.

### Security & Testing

#### Security Findings

| #   | Finding                                                                                                                                         | Priority |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| S1  | Add `HOOK_EVENT` allowlist validation — only unvalidated field entering curl payload. Accept `SessionStart`, `SubagentStart`, `UNDEFINED` only. | **High** |
| S2  | Add `PLUGIN_NAME` character-class assertion (`^[a-zA-Z0-9_-]+$`) as defence-in-depth against future refactors                                   | Low      |
| S3  | Use existence-only marker check (`-f`, `-s`); never read marker content into variables used in commands                                         | Medium   |

#### OWASP Top 10 Review

- **A01 Broken Access Control**: N/A — runs as local user,
  writes to user-owned directory.
- **A02 Cryptographic Failures**: Mitigated — HTTPS-only
  validation; CSPRNG for anonymous ID.
- **A03 Injection**: `ANON_ID` regex-validated, `PLUGIN_NAME`
  hardcoded, `AGENT_TYPE` character-class filtered.
  **Action**: Add `HOOK_EVENT` allowlist (S1).
- **A04 Insecure Design**: Fail-open (exit 0) is intentional.
- **A05–A07**: N/A or mitigated (no config files, no
  third-party deps, no authentication).
- **A08 Data Integrity**: Marker written only after HTTP 2xx.
- **A09 Logging**: Debug log is local-only, no PII.
- **A10 SSRF**: Endpoint override is user-configurable
  (self-hosting feature). HTTPS-only limits exposure.

#### Manual Testing Checklist

| #   | AC   | Scenario                                         | Expected Result                                             |
| --- | ---- | ------------------------------------------------ | ----------------------------------------------------------- |
| T1  | AC 1 | `rm -rf ~/.ccube/`, open VS Code with one plugin | ID created, marker created, `plugin_installed` in debug log |
| T2  | AC 2 | Enable second plugin, new session                | Second marker created, same ID, first marker untouched      |
| T3  | AC 3 | Reopen VS Code                                   | No new `plugin_installed` for existing plugins              |
| T4  | AC 4 | All 4 plugins enabled                            | 4 markers, 4 distinct events                                |
| T5  | AC 5 | Set endpoint to unreachable, then fix            | No marker on failure; marker on retry success               |
| T6  | AC 6 | `CCUBE_TELEMETRY_DISABLED=1`                     | No markers, no events, no curl traffic                      |

#### Automated Testing Approach

A self-contained `scripts/test-telemetry.sh` bash harness:

- Start a local HTTPS mock server (python3 or `openssl
  s_server`).
- Set `CCUBE_TELEMETRY_ENDPOINT` to mock.
- Run `session-telemetry.sh` directly.
- Assert: marker exists/absent, mock received expected JSON,
  correct HTTP method and Content-Type.
- Clean `~/.ccube/installed-*` between tests.
- Return 200 for success tests, 503 for retry tests.

#### Regression Scenarios

| #   | Verify                     | How                                      |
| --- | -------------------------- | ---------------------------------------- |
| R1  | Session events still fire  | Check debug log for `SessionStart`       |
| R2  | Subagent events still fire | Invoke agent, check for `SubagentStart`  |
| R3  | Anonymous ID stable        | `md5 ~/.ccube/telemetry-id` before/after |
| R4  | Opt-out works              | Set env var, confirm zero traffic        |
| R5  | HTTPS validation enforced  | HTTP endpoint → silent exit              |
| R6  | Exit code always 0         | Simulate failures → exit 0               |
| R7  | `--max-time 5` preserved   | Unreachable endpoint → <10s total        |
| R8  | Cross-plugin consistency   | `diff` all 4 scripts                     |

### Monitoring & Rollout Verification

**Immediate**: Query backend for `event = 'plugin_installed'`.
Before this EP ships, zero records should exist.

**First-week queries**:

- Install events per plugin (popularity ranking).
- Install events over time (adoption curve).
- Users with all 4 plugins installed (cross-adoption).

**Anomaly detection**:

- Single ID with >4 events → manual marker deletion
  (expected to be rare).
- Zero events 24 hours after release → hook not firing;
  check `~/.ccube/hook-debug.log`.

## Alternatives

- **Embedded install flag in the shared ID file**: Store a
  JSON object in `telemetry-id` mapping plugin names to install
  status. Rejected because it introduces JSON parsing complexity
  in bash, creates a shared mutable file with race conditions
  across concurrent plugin scripts, and breaks backward
  compatibility with the current plain-UUID format.

- **Server-side install detection**: Have the backend derive
  "first seen" per plugin from session events rather than
  relying on explicit install events. Rejected because it
  conflates "first session" with "install", doesn't support
  reinstall tracking, and couples the analytics logic to the
  backend's event processing pipeline.

- **VS Code extension-level tracking**: Use VS Code's extension
  API to detect installs. Rejected because agent plugins do
  not have access to the VS Code extension API — they are shell
  scripts invoked by hooks.

## Infrastructure Needed (Optional)

No new infrastructure required. The change is entirely
client-side within the existing `session-telemetry.sh` scripts
and the `~/.ccube/` directory.

---

## Review & Acceptance Checklist

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] Part 1 sections filled
- [x] No code snippets in Part 1 sections
- [x] No functions or file references in Part 1 sections
- [x] Part 2 sections filled

---

## Implementation Plan

### Technical Analysis

The EP's Design Details section provides comprehensive technical
analysis. Key architectural decisions summarised here:

- **Scope**: 4 identical bash scripts (`session-telemetry.sh`),
  differing only in `PLUGIN_NAME`. All changes must be synced.
- **No new dependencies**: Pure bash, existing `curl`, existing
  `~/.ccube/` directory.
- **Backward compatible**: Old scripts ignore marker files;
  rollback is safe.
- **Migration**: Zero-touch — absence of markers triggers
  backfill install events on first session after update.
- **Security**: One high-priority finding (S1: `HOOK_EVENT`
  allowlist) must be addressed as part of this work.

### Implementation Tasks

**Note:** Tasks are ordered by priority and dependency. Each
task builds on previous work and produces self-contained,
verifiable changes. Complexity & Risk ratings help determine
how many tasks can be assigned simultaneously.

#### Task 1: Add HOOK_EVENT allowlist validation (S1)

- [x] Add HOOK_EVENT allowlist validation
  - Description: Address the high-priority security finding
    S1 before making any functional changes. Add an allowlist
    check for `HOOK_EVENT` immediately after it is parsed
    from stdin. Accept only `SessionStart`,
    `SubagentStart`, and `UNDEFINED`. Any other value is
    overwritten to `UNDEFINED`. Apply to all 4 scripts.
  - Complexity & Risk: **Low** — single conditional added
    to an existing code block; no logic change.
  - Files & References:
    - `plugins/ccube-fds-web-app-builder/scripts/session-telemetry.sh`
    - `plugins/ccube-software-craft/scripts/session-telemetry.sh`
    - `plugins/ccube-frontend-dev/scripts/session-telemetry.sh`
    - `plugins/ccube-ux-designers/scripts/session-telemetry.sh`
    - EP section: Security Findings — S1
  - Dependencies: None
  - Acceptance Criteria:
    - `HOOK_EVENT` is validated against
      `^(SessionStart|SubagentStart|UNDEFINED)$` after
      extraction from stdin JSON
    - Any unrecognised value is replaced with `UNDEFINED`
    - Existing session/subagent events continue to fire
      correctly (regression R1, R2)
    - All 4 scripts are identical except `PLUGIN_NAME`
  - Testing Requirements:
    - Manual: Pipe crafted JSON with a rogue
      `hook_event_name` value to the script; confirm
      `UNDEFINED` appears in the debug log
    - Regression: Run T1 from the manual checklist to
      confirm normal flow is unbroken
  - In Scope:
    - `HOOK_EVENT` allowlist validation
    - Optional: `PLUGIN_NAME` character-class assertion
      (S2, low priority — include if trivial)
  - Out of Scope:
    - Per-plugin install logic (Task 2)
    - `_fire()` changes (Task 3)

#### Task 2: Add per-plugin marker file and install detection

- [x] Add per-plugin marker and install detection logic
  - Description: Introduce `MARKER_FILE` variable and
    `NEEDS_INSTALL_EVENT` flag. Remove `IS_NEW_INSTALL`
    from the anonymous ID creation block. Add per-plugin
    marker check after `ANON_ID` is loaded. Add marker
    cleanup when a new anonymous ID is generated (clear
    `~/.ccube/installed-*`). At this stage, the install
    event still uses the old fire-and-forget `_fire()` —
    delivery confirmation comes in Task 3.
  - Complexity & Risk: **Medium** — core logic change;
    must preserve existing session/subagent event flow
    and anonymous ID generation.
  - Files & References:
    - All 4 `session-telemetry.sh` scripts
    - EP sections: Install Detection Logic Redesign,
      Edge Case — Anonymous ID Regenerated
  - Dependencies: Task 1 (security hardening first)
  - Acceptance Criteria:
    - `MARKER_FILE="${HOME}/.ccube/installed-${PLUGIN_NAME}"`
      defined after `PLUGIN_NAME` and `ID_FILE`
    - `IS_NEW_INSTALL` variable and its usage in the ID
      creation block are removed
    - `NEEDS_INSTALL_EVENT` is `"true"` when marker is
      absent or zero-size; `"false"` when marker exists
      and is non-empty
    - When a new anonymous ID is generated, all
      `~/.ccube/installed-*` markers are cleared
    - The `plugin_installed` event fires when
      `NEEDS_INSTALL_EVENT == "true"` (fire-and-forget
      for now — marker is written unconditionally after
      the curl call)
    - The old `install` event block
      (`if IS_NEW_INSTALL == true`) is removed
    - Event name in payload is `plugin_installed`
    - Session/subagent events are unaffected (R1, R2)
    - Anonymous ID is never modified by the new code (R3)
    - All 4 scripts remain identical except `PLUGIN_NAME`
  - Testing Requirements:
    - Manual: T1 (first install), T2 (second plugin),
      T3 (no duplicate), T4 (all 4 plugins)
    - Regression: R1, R2, R3, R4, R5, R6, R8
  - In Scope:
    - `MARKER_FILE` variable definition
    - `NEEDS_INSTALL_EVENT` flag logic
    - Remove `IS_NEW_INSTALL` variable
    - Fire `plugin_installed` event (fire-and-forget)
    - Write marker after firing (unconditionally for now)
    - Clear markers on new anonymous ID generation
    - Change event name from `install` to `plugin_installed`
  - Out of Scope:
    - Delivery confirmation / conditional marker write
      (Task 3)
    - Retry mechanism validation (Task 4)

#### Task 3: Add delivery confirmation to install event

- [x] Capture HTTP status and write marker conditionally
  - Description: Update `_fire()` to return the HTTP status
    code via `--write-out '%{http_code}'`. For the
    `plugin_installed` call only, capture the status and
    write the marker file only on HTTP 2xx. Session/subagent
    event calls continue to ignore the return value.
  - Complexity & Risk: **Medium** — modifying the shared
    `_fire()` function; must not break existing
    fire-and-forget calls.
  - Files & References:
    - All 4 `session-telemetry.sh` scripts
    - EP sections: Delivery Confirmation, Retry Mechanism
  - Dependencies: Task 2 (install event must exist first)
  - Acceptance Criteria:
    - `_fire()` outputs the HTTP status code to stdout
      via `--write-out '%{http_code}'`
    - Existing session/subagent event calls ignore the
      return value (pipe to `/dev/null` or discard)
    - Install event call captures the HTTP code
    - Marker is written (`printf '%s' "${NOW}"`) only
      when HTTP code is 200–299
    - Marker is NOT written on non-2xx or curl failure
    - Marker content is an ISO 8601 UTC timestamp
    - Debug log entry written on both success and failure
    - Script still exits 0 regardless of delivery outcome
  - Testing Requirements:
    - Manual: T5 (retry) — set endpoint to unreachable,
      confirm no marker; fix endpoint, confirm marker
      written on next run
    - Regression: R1, R2, R6, R7
  - In Scope:
    - `_fire()` curl `--write-out` addition
    - Conditional marker write for install event
    - Marker content: ISO 8601 timestamp
    - Debug logging for install delivery outcome
  - Out of Scope:
    - Conditional marker write for session/subagent
      events (not needed — they are fire-and-forget)
    - Automated test harness (Task 5)

#### Task 4: Sync all 4 scripts and validate cross-plugin

- [x] Final sync and cross-plugin validation
  - Description: Ensure all 4 `session-telemetry.sh`
    scripts are byte-identical except for the
    `PLUGIN_NAME=` line. Run the full manual testing
    checklist (T1–T6) and regression suite (R1–R8).
    Verify debug log output is clean and informative.
  - Complexity & Risk: **Low** — verification and sync
    only; no new logic.
  - Files & References:
    - All 4 `session-telemetry.sh` scripts
    - EP sections: Manual Testing Checklist, Regression
      Scenarios
  - Dependencies: Task 3
  - Acceptance Criteria:
    - `diff` across all 4 scripts shows differences only
      on the `PLUGIN_NAME=` line
    - All manual test scenarios T1–T6 pass
    - All regression scenarios R1–R8 pass
    - `~/.ccube/hook-debug.log` contains clear entries
      for both session events and install events
    - Script completes within ~10s even with unreachable
      endpoint (2 curls × 5s max-time)
  - Testing Requirements:
    - Full manual checklist (T1–T6)
    - Full regression suite (R1–R8)
  - In Scope:
    - Cross-script `diff` verification
    - Full manual and regression testing
    - Debug log review
  - Out of Scope:
    - Automated test harness (Task 5)
    - Code changes (only fixes for issues found during
      validation)

#### Task 5: Create automated test harness (optional)

- [ ] Create `scripts/test-telemetry.sh` bash test harness
  - Description: Create a self-contained bash test script
    that automates the core test scenarios using a local
    mock HTTPS server. This is optional but recommended
    for regression safety on future changes.
  - Complexity & Risk: **Medium** — requires setting up a
    local TLS listener; cross-platform nuances between
    macOS and Linux `openssl`/`socat`.
  - Files & References:
    - New file: `scripts/test-telemetry.sh`
    - EP section: Automated Testing Approach
  - Dependencies: Task 4 (scripts must be finalised)
  - Acceptance Criteria:
    - Script starts a local HTTPS mock, runs telemetry
      script, and asserts outcomes
    - Covers: fresh install, idempotency, delivery
      failure, retry success, opt-out, HTTPS validation
    - Exits with non-zero on any failure
    - Cleans up `~/.ccube/installed-*` between tests
    - Documents usage in a comment header
  - Testing Requirements:
    - The test script IS the test — run it and confirm
      all assertions pass
  - In Scope:
    - Mock HTTPS server setup/teardown
    - 6 core test scenarios
    - Pass/fail reporting
  - Out of Scope:
    - CI/CD integration
    - Tests requiring real VS Code runtime (multi-plugin,
      uninstall/reinstall lifecycle)

### Definition of Done

- [x] All implementation tasks completed (Tasks 1–4 required;
  Task 5 optional)
- [x] All manual tests (T1–T6) passing
- [x] All regression scenarios (R1–R8) verified
- [x] All 4 scripts byte-identical except `PLUGIN_NAME`
- [x] Code review completed
- [x] Debug log output reviewed and clean

---

**Next Steps:** Review the implementation plan above. Once
approved, begin with Task 1 (security hardening) or assign
tasks to your team based on complexity ratings.
