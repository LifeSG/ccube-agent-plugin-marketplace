# EP-0004: Fix command injection via unsanitized args in sed substitution

**Created**: 2026-09-11
**Input**: User description: "Title: Fix command injection via unsanitized
args in sed substitution in init-fullstack-project.sh. Problem:
USER-supplied PROJECT_NAME, DB_NAME, and BACKEND_PORT values are
interpolated unescaped into sed s/// substitution commands (lines
132-141). GNU sed's `e` flag enables shell execution of the pattern
space, so a crafted value containing `/` + newline + `e` achieves
OS command execution (CWE-78, CWE-94). DB_NAME is derived from
PROJECT_NAME (hyphens→underscores only), so slashes and newlines
pass through. Solution: Add a validate_input() function that checks
PROJECT_NAME against ^[A-Za-z0-9_-]+$, DB_NAME against
^[A-Za-z0-9_]+$, and BACKEND_PORT against ^[0-9]+$ with range check
1-65535. Call validation immediately after argument parsing, before
any sed substitution. File:
plugins/wai/skills/cc-fullstack-vite/scripts/init-fullstack-project.sh."

- [Summary](#summary)
- [Motivation](#motivation)
  - [Goals](#goals)
  - [Non-Goals](#non-goals)
- [Proposal](#proposal)
  - [Acceptance criteria](#acceptance-criteria)
    - [AC 1 — Invalid PROJECT_NAME rejected](#ac-1--invalid-project_name-rejected)
    - [AC 2 — Invalid DB_NAME rejected](#ac-2--invalid-db_name-rejected)
    - [AC 3 — Invalid BACKEND_PORT rejected](#ac-3--invalid-backend_port-rejected)
    - [AC 4 — Valid inputs pass through unchanged](#ac-4--valid-inputs-pass-through-unchanged)
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

`init-fullstack-project.sh` passes three user-supplied CLI arguments
— `PROJECT_NAME`, `DB_NAME`, and `BACKEND_PORT` — directly into GNU
`sed` substitution expressions without sanitization. GNU sed supports
the `e` flag on `s///` commands, which executes the pattern space as
a shell command. A crafted argument value can exploit this to achieve
arbitrary OS command execution (CWE-78 OS Command Injection,
CWE-94 Code Injection). This EP proposes adding strict allowlist
validation immediately after argument parsing, rejecting any input
that does not match the expected character set before any sed
operation is performed.

## Motivation

The `init-fullstack-project.sh` scaffolding script is invoked by
developers and by AI copilot agents on behalf of users. Any operator
or process that can supply CLI arguments can currently achieve
command injection via GNU sed's `e` flag. The default derivation of
`DB_NAME` from `PROJECT_NAME` (hyphen-to-underscore conversion only)
does not strip slashes or newlines, leaving the injection surface
intact even when `--db-name` is not supplied explicitly.

### Goals

- Reject `PROJECT_NAME` values not matching `^[A-Za-z0-9_-]+$`
  before any sed substitution occurs.
- Reject `DB_NAME` values not matching `^[A-Za-z0-9_]+$` before
  any sed substitution occurs.
- Reject `BACKEND_PORT` values not matching `^[0-9]+$` or outside
  the range 1–65535 before any sed substitution occurs.
- Provide a clear, actionable error message on rejection that names
  the offending argument and its allowed format.
- Preserve 100% of existing behaviour for valid inputs.

### Non-Goals

- Rewriting the template substitution mechanism (sed → node or
  envsubst). Defense-in-depth improvements may follow separately.
- Validating values not used in sed substitutions (e.g.,
  `TARGET_DIR`).
- Supporting any character set beyond the defined allowlists.

## Proposal

Add a `validate_input` shell function immediately after the argument
parsing block and before the `sedi` helper is defined. The function
accepts a value, a regex pattern, and a human-readable field name,
and calls `exit 1` with a descriptive error if validation fails.
Call `validate_input` for each of the three user-supplied values
after all defaults are applied (i.e., after `DB_NAME` is derived
from `PROJECT_NAME`).

This approach is consistent with the validation pattern already
established in `session-telemetry.sh`:
`[[ "${VAR}" =~ ^pattern$ ]] || exit`.

### Acceptance criteria

#### AC 1 — Invalid PROJECT_NAME rejected

Running the script with `PROJECT_NAME` containing `/`, `\n`, `;`,
`$`, or any character not in `[A-Za-z0-9_-]` exits with code 1
and prints an error naming `PROJECT_NAME` and the allowed pattern.

#### AC 2 — Invalid DB_NAME rejected

Running the script with `--db-name` set to a value containing
characters not in `[A-Za-z0-9_]` exits with code 1 and prints an
error naming `DB_NAME` and the allowed pattern.

#### AC 3 — Invalid BACKEND_PORT rejected

Running the script with `--port` set to a non-numeric value, an
empty string, `0`, or a value above `65535` exits with code 1 and
prints an error naming `BACKEND_PORT` and the allowed range.

#### AC 4 — Valid inputs pass through unchanged

Running the script with `PROJECT_NAME=my-app`, `DB_NAME=my_app`,
and `BACKEND_PORT=3333` produces the same output and project
structure as before this change.

### Notes/Constraints/Caveats

- The fix does not change the sed invocation itself; it prevents
  malicious values from ever reaching sed.
- `DB_NAME` is validated after its default derivation from
  `PROJECT_NAME`, so a valid `PROJECT_NAME` with only hyphens
  and alphanumerics will always produce a valid `DB_NAME`.
- Port `0` is excluded from the valid range even though it is
  technically a valid port number for binding, because port `0`
  has OS-assigned ephemeral semantics not suitable for a
  configured backend service.

### Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Legitimate project names with dots or spaces are rejected | Low | Medium | Allowlist covers the most common naming conventions; script documents the constraint in its error message |
| DB_NAME derived from valid PROJECT_NAME still fails (e.g. leading digit) | Very low | Low | Validation fires after derivation; edge cases caught and reported with clear message |
| Port validation rejects valid high-numbered ports | Very low | Low | Range 1–65535 covers all registered and dynamic ports |

## Design Details

### Frontend

Not applicable. This change affects a shell scaffolding script only.

### Backend

Add the following to
`plugins/wai/skills/cc-fullstack-vite/scripts/init-fullstack-project.sh`
immediately after the argument-parsing block (after line 62, where
`DB_NAME` default is set):

```bash
validate_input() {
  local value="$1" pattern="$2" field="$3"
  if [[ ! "$value" =~ $pattern ]]; then
    echo "Error: $field contains invalid characters."
    echo "  Value:   '$value'"
    echo "  Allowed: $pattern"
    exit 1
  fi
}

validate_input "$PROJECT_NAME" '^[A-Za-z0-9_-]+$' "PROJECT_NAME"
validate_input "$DB_NAME"      '^[A-Za-z0-9_]+$'  "DB_NAME"
validate_input "$BACKEND_PORT" '^[0-9]+$'          "BACKEND_PORT"

if (( BACKEND_PORT < 1 || BACKEND_PORT > 65535 )); then
  echo "Error: BACKEND_PORT must be between 1 and 65535 (got $BACKEND_PORT)"
  exit 1
fi
```

### Database

Not applicable.

## Alternatives

**1. Escape sed metacharacters instead of validating**
Replace `/` with `\/` and `&` with `\&` in each value before
passing to sed. This reduces but does not eliminate the attack
surface (newline + `e` flag remains exploitable on GNU sed).
Rejected as incomplete mitigation.

**2. Replace sed with node for substitution**
Use `node -e` to perform literal string replacement instead of
sed. Eliminates the vulnerability entirely but introduces a
dependency on Node.js being available at step 5 (it is available
from step 7 onward). Rejected for this EP; may follow as a
separate hardening EP.

**3. Use `envsubst` for token replacement**
Replace `sedi` calls with `envsubst`. Eliminates sed injection but
requires template files to use `$VAR` syntax instead of
`__PLACEHOLDER__` syntax, which requires broader template changes.
Rejected as out of scope.

## Infrastructure Needed (Optional)

None. This is a pure shell-script change with no infrastructure
dependencies.

---

## Review & Acceptance Checklist

*GATE: Automated checks run during main() execution*

- [ ] All three user-supplied values are validated before sed use
- [ ] Error messages name the offending field and allowed pattern
- [ ] Valid inputs produce identical output to pre-fix behaviour
- [ ] No regression in scaffolded project structure

## Execution Status

*Updated by co-pilot during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] Part 1 sections filled
- [x] No code snippets in Part 1 sections
- [x] No functions or file references in Part 1 sections
- [x] Part 2 sections filled
