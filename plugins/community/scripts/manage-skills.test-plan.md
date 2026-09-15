# manage-skills.sh — AI-Driven Test Plan

This document defines the mandatory and exploratory tests for
`plugins/community/scripts/manage-skills.sh`. It is consumed
by the `test-manage-skills` skill, which instructs Claude to
execute every mandatory case and explore beyond them.

---

## Environment Setup

Before running any test, snapshot files that will be mutated:

```bash
cp plugins/community/plugin.json plugins/community/plugin.json.bak
cp plugins/community/skills/.manifest.json \
   plugins/community/skills/.manifest.json.bak
```

Use the skill name prefix `__test-` for all disposable test
skills (e.g. `__test-probe`). This prevents collisions with
real vendored skills.

## Environment Teardown

After all tests complete — whether they pass or fail — restore
the snapshots:

```bash
mv plugins/community/plugin.json.bak plugins/community/plugin.json
mv plugins/community/skills/.manifest.json.bak \
   plugins/community/skills/.manifest.json
rm -rf plugins/community/skills/__test-*
```

Verify cleanup with `git status` — the working tree must be
clean (no modified or untracked files under `plugins/community/`).

---

## Mandatory Functional Tests

Each test lists the command, expected outcome, and pass
criterion.

### F1 — list

```bash
manage-skills.sh list
```

- **Expected**: Prints vendored skills table; exits 0.
- **Pass**: Output contains at least one skill name. Exit
  code is 0.

### F2 — help

```bash
manage-skills.sh help
```

- **Expected**: Prints usage text; exits 0.
- **Pass**: Output contains `Usage:` and `Commands:`. Exit
  code is 0.

### F3 — add

```bash
manage-skills.sh add mattpocock/skills \
  skills/productivity/grill-me __test-probe
```

- **Expected**: Clones repo, copies skill into
  `plugins/community/skills/__test-probe/`, updates manifest,
  bumps version; exits 0.
- **Pass**: Directory `skills/__test-probe/` exists and
  contains files. Manifest has a `__test-probe` entry. Exit
  code is 0.

### F4 — add (duplicate rejected)

```bash
manage-skills.sh add mattpocock/skills \
  skills/productivity/grill-me __test-probe
```

Run after F3 (skill already exists).

- **Expected**: Dies with "already exists" error; exits 1.
- **Pass**: Exit code is 1. Output contains `already exists`.

### F5 — update (single)

```bash
manage-skills.sh update __test-probe
```

Run after F3.

- **Expected**: Re-downloads the skill, reports result;
  exits 0.
- **Pass**: Exit code is 0. Output contains `Updating` or
  `No changes`.

### F6 — delete

```bash
manage-skills.sh delete __test-probe
```

Run after F3/F5.

- **Expected**: Removes skill directory and manifest entry;
  exits 0.
- **Pass**: Directory `skills/__test-probe/` no longer
  exists. Exit code is 0.

### F7 — add without arguments

```bash
manage-skills.sh add
```

- **Expected**: Prints usage and exits non-zero.
- **Pass**: Exit code is non-zero. Output contains `Usage:`.

### F8 — delete nonexistent

```bash
manage-skills.sh delete __test-nonexistent
```

- **Expected**: Dies with "not found" error; exits 1.
- **Pass**: Exit code is 1. Output contains `not found`.

---

## Mandatory Security Tests

Each test verifies that a malicious input is rejected before
any filesystem mutation occurs.

### S1 — delete `..`

```bash
manage-skills.sh delete ..
```

- **Expected**: Rejected by `validate_skill_name`; exits 1.
- **Pass**: Exit code is 1. Output contains
  `'.' and '..' are not allowed`.

### S2 — delete `.`

```bash
manage-skills.sh delete .
```

- **Expected**: Rejected by `validate_skill_name`; exits 1.
- **Pass**: Exit code is 1. Output contains
  `'.' and '..' are not allowed`.

### S3 — add with `../../escape` as skill name

```bash
manage-skills.sh add mattpocock/skills skills/foo ../../escape
```

- **Expected**: Rejected by regex (contains `/`); exits 1.
- **Pass**: Exit code is 1. Output contains
  `only letters, digits`.

### S4 — add with `../bad` as skill name

```bash
manage-skills.sh add mattpocock/skills skills/foo ../bad
```

- **Expected**: Rejected by regex (contains `/`); exits 1.
- **Pass**: Exit code is 1. Output contains
  `only letters, digits`.

### S5 — add with absolute path as skill name

```bash
manage-skills.sh add mattpocock/skills skills/foo /etc/passwd
```

- **Expected**: Rejected by regex (contains `/`); exits 1.
- **Pass**: Exit code is 1. Output contains
  `only letters, digits`.

### S6 — skill name with spaces

```bash
manage-skills.sh add mattpocock/skills skills/foo "has space"
```

- **Expected**: Rejected by regex; exits 1.
- **Pass**: Exit code is 1. Output contains
  `only letters, digits`.

### S7 — skill name with embedded newline

```bash
manage-skills.sh add mattpocock/skills skills/foo $'line\nbreak'
```

- **Expected**: Rejected by regex; exits 1.
- **Pass**: Exit code is 1. Output contains
  `only letters, digits`.

### S8 — poisoned manifest key (update --all path)

Manually inject a traversal key into the manifest, then run
`update --all`.

```bash
python3 -c "
import json
m = json.load(open('plugins/community/skills/.manifest.json'))
m['skills']['../../etc/passwd'] = {
    'source': 'mattpocock/skills',
    'path': 'skills/productivity/grill-me',
    'updated': '2024-01-01T00:00:00Z'
}
json.dump(m, open('plugins/community/skills/.manifest.json','w'), indent=2)
"
manage-skills.sh update --all
```

- **Expected**: The traversal key is rejected by
  `validate_skill_name` (contains `/`); the script dies
  before any filesystem mutation.
- **Pass**: Exit code is 1. Output contains
  `only letters, digits`. No directory was created outside
  `skills/`.

---

## Exploratory Testing Areas

The AI should design and run additional tests in these areas.
These are not prescriptive — the AI decides what specific
inputs and scenarios to try.

### E1 — Unicode and special characters

Try skill names with unicode, emoji, backticks, quotes,
semicolons, pipes, dollar signs, and other shell
metacharacters. Verify all are rejected by the regex.

### E2 — Very long skill names

Try skill names at boundary lengths (255, 256, 1000+
characters). Verify the script handles them without crashing
(rejected by regex or filesystem limits).

### E3 — Names starting with `-`

Try skill names like `-rf`, `--help`, `--version`. These
could be misinterpreted as flags by downstream commands.
Verify they are either rejected or handled safely.

### E4 — Symlink attacks

Create a symlink inside `skills/` pointing outside the repo.
Attempt to update or delete that "skill". Verify the
containment checks catch it.

### E5 — Empty and malformed manifest

- Delete `.manifest.json` and run `list`, `update --all`.
- Replace `.manifest.json` with empty file, `{}`, `[]`,
  invalid JSON.
- Verify the script does not crash with an unhandled error.

### E6 — Missing dependencies

Test behavior when `git`, `python3`, or `realpath` is not in
PATH. Verify the script dies with a clear error message
naming the missing tool.

### E7 — Manifest value injection

Inject manifest entries where `source` or `path` values
contain shell metacharacters, backticks, `$(...)`, or
newlines. Verify these do not result in command injection.

### E8 — Concurrent execution

Run two `add` commands simultaneously with different skill
names. Verify both complete without corrupting the manifest
or each other's files.

---

## Result Format

Report results as a markdown table:

```markdown
| Category     | Test | Expected     | Actual       | Status |
|--------------|------|--------------|--------------|--------|
| Functional   | F1   | exits 0, ... | exits 0, ... | PASS   |
| Security     | S1   | exits 1, ... | exits 1, ... | PASS   |
| Exploratory  | E1a  | rejected     | rejected     | PASS   |
```

After the table, list any findings or concerns discovered
during exploratory testing.
