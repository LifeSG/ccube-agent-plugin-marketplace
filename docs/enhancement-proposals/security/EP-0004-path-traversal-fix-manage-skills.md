# EP-0004: Fix path traversal vulnerability in manage-skills.sh

**Created**: 2026-09-11
**Input**: Fix path traversal vulnerability (CWE-22, CWE-73) in
manage-skills.sh download_skill. The script builds dest
(${SKILLS_DIR}/${skill_name}) and src (${tmp_dir}/${skill_path})
by plain string concatenation and runs rm -rf on dest without
validating that paths stay within expected parent directories.
Attack vectors: (1) add command with malicious name/path args;
(2) update --all reads .manifest.json keys/values as trusted.
Fix: add validate_skill_name function checking
^[A-Za-z0-9._-]+$, add path containment check using realpath -m
to verify dest is under SKILLS_DIR and src is under tmp_dir.
Treat all manifest-derived values as untrusted.
File: plugins/community/scripts/manage-skills.sh

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
- [Infrastructure Needed](#infrastructure-needed)
- [Review & Acceptance Checklist](#review--acceptance-checklist)
- [Execution Status](#execution-status)

## Summary

`manage-skills.sh` builds file system paths by concatenating
user-supplied or manifest-derived strings without validation.
This allows path traversal attacks (CWE-22) and external control
of file names (CWE-73): a caller can supply `../../../etc/passwd`
as a skill name or path and trigger `rm -rf` or `cp -r` outside
the intended `plugins/community/skills/` directory. This EP
proposes adding input validation and path containment checks to
eliminate both attack surfaces.

## Motivation

`manage-skills.sh` is a privileged script that clones GitHub
repositories and copies files into the plugin skills directory.
It accepts a skill name and path from the CLI (`add` command) and
re-reads those same values from `.manifest.json` on `update
--all`. Neither source is validated before being used in `rm -rf`
and `cp -r` invocations.

A malicious contributor can open a PR that poisons
`.manifest.json` so that running `update --all` performs
destructive file operations outside the repository. A user can
also trigger the same outcome locally by passing a traversal
string to the `add` command.

### Goals

- Reject any skill name that contains `/`, `..`, or characters
  outside `[A-Za-z0-9._-]`.
- Reject any `skill_path` that resolves outside the git-cloned
  temporary directory.
- Verify that the resolved `dest` path is a direct child of
  `SKILLS_DIR` before `rm -rf` and `cp -r`.
- Treat all values read from `.manifest.json` as untrusted and
  validate them through the same checks.

### Non-Goals

- Sandboxing the git clone itself or restricting which GitHub
  repositories can be cloned.
- Auditing other scripts in the repository.
- Changing the public CLI interface (`add`, `update`, `delete`,
  `list`).

## Proposal

Add two validation helpers to `manage-skills.sh`:

1. `validate_skill_name` — applies a strict allowlist regex
   `^[A-Za-z0-9._-]+$` to the skill name. Dies with a
   descriptive error on mismatch.
2. `assert_path_within` — uses `realpath -m` to resolve a
   candidate path and asserts the result starts with the
   expected parent prefix. Dies if the check fails.

Call `validate_skill_name` in `cmd_add` (on the CLI-supplied
name and on the defaulted name derived from `skill_path`) and in
`_update_one` (on the manifest-derived key before it is used to
build `dest`).

Call `assert_path_within` twice inside `download_skill`: once for
`dest` against `SKILLS_DIR`, and once for `src` against
`tmp_dir`.

Apply the same `validate_skill_name` check to `skill_path`
segments to prevent traversal in the `src` side.

### Acceptance Criteria

#### AC 1

Running `manage-skills.sh add owner/repo ../../evil name` exits
non-zero with the message "invalid skill path" before any file
system mutation occurs.

#### AC 2

Running `manage-skills.sh add owner/repo path ../evil` exits
non-zero with the message "invalid skill name" before any file
system mutation occurs.

#### AC 3

A `.manifest.json` containing `{"skills": {"../evil": {...}}}`
causes `update --all` to exit non-zero without touching any file
outside `plugins/community/skills/`.

#### AC 4

A valid skill name such as `grill-me` or `my.skill_v2` continues
to work without error.

### Notes/Constraints/Caveats

- `realpath -m` (GNU coreutils) resolves paths without requiring
  the target to exist. This is intentional so that the check
  works before `dest` is created. macOS ships `realpath` via
  GNU coreutils from Homebrew; the script already requires `git`
  and `python3`, so requiring coreutils is acceptable. If the
  host lacks `realpath`, the script dies with a clear error.
- The regex `^[A-Za-z0-9._-]+$` intentionally rejects forward
  slashes, so nested path segments in skill names are not
  permitted. Skill paths (`skill_path`) are a separate argument
  and are validated differently (containment check, not name
  regex).

### Risks and Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `realpath` not available on some CI runners | Low | Add a startup check: `command -v realpath >/dev/null 2>&1 \|\| die "realpath is required"` |
| Regex too strict, breaking existing skill names | Low | All names in current `.manifest.json` match `^[A-Za-z0-9._-]+$`; verified before merging |
| Attacker controls repo URL, not just path | Out of scope | URL is validated separately (`owner/repo` format); repo content is untrusted by design |

## Design Details

### Frontend

Not applicable — this is a shell script with no UI component.

### Backend

Two new functions added to `manage-skills.sh`:

```
validate_skill_name <name>
assert_path_within  <candidate_path> <parent_dir> <label>
```

Call sites:
- `cmd_add`: validate `skill_name` and the path-derived default
  name before `download_skill`.
- `download_skill`: assert `dest` within `SKILLS_DIR`; assert
  `src` within `tmp_dir`.
- `_update_one`: validate `skill` (manifest key) before building
  `dest`; validate `skill_path` (manifest value) before passing
  to `download_skill`.

### Database

Not applicable.

## Alternatives

**Option A: Strip traversal sequences instead of rejecting**
Use `basename` or `sed` to strip `../` before use. Rejected:
stripping is fragile and may silently corrupt intended paths.
Failing fast on invalid input is safer and gives the caller a
clear error.

**Option B: Chroot or restricted environment for the script**
Run the script inside a restricted directory. Rejected: adds
significant operational complexity with no benefit over simple
validation.

## Infrastructure Needed

None. The fix is a pure shell script change. `realpath` is part
of GNU coreutils and is available on all target platforms.

---

## Review & Acceptance Checklist

*GATE: Automated checks run during main() execution*

- [ ] All AC items manually verified
- [ ] Existing skill names in `.manifest.json` pass validation
- [ ] `realpath` availability check added

## Execution Status

*Updated by co-pilot during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [ ] Ambiguities marked
- [x] Part 1 sections filled
- [x] No code snippets in Part 1 sections
- [x] No functions or file references in Part 1 sections
- [ ] Part 2 sections filled
