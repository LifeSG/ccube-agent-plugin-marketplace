---
name: cc-git-commit
description: >-
  Atomic commit workflow — groups changed files into logical commits and
  produces Conventional Commit messages prefixed with branch name and
  author initials. Use when performing any git staging, committing, or
  when the user asks to save, commit, or push work.
---

## Atomic Commit Workflow

Group all changed files into atomic commits — one logical concern per
commit — and produce a Conventional Commit message for each group,
prefixed with `[BRANCH_NAME][AUTHOR_INITIALS]`.

---

## Step 1 — Gather Context

Run one terminal command to get the branch name and author name:

```bash
git branch --show-current && git config user.name
```

Then use `getChangedFiles` to retrieve all diffs:

- Call it with `sourceControlState: ["staged"]` to check for staged
  changes.
- If staged results are empty, call it with
  `sourceControlState: ["unstaged"]` to get all unstaged changes.
- If both are non-empty, call it with
  `sourceControlState: ["staged", "unstaged"]` to get the full picture.

Do NOT run any further terminal commands until Step 3.

---

## Step 2 — Group Changes into Atomic Commits

An atomic commit contains exactly one logical concern. A single file may
appear in more than one group if it contains unrelated changes.

### Grouping Rules

1. Identify each distinct logical concern across all changed files
   (e.g. a bug fix, a new feature, a dependency bump, a docs update).
2. Assign every changed file (or hunk, if a file contains mixed concerns)
   to exactly one group.
3. Name each group with a draft Conventional Commit subject so its
   purpose is clear before any staging begins.

### Group Priority Order (commit in this sequence)

1. `fix` — Bug fixes first, so they are reviewable in isolation.
2. `feat` — New features.
3. `refactor` / `perf` — Code improvements with no behaviour change.
4. `test` — Test additions or updates.
5. `docs` / `style` / `chore` / `ci` / `build` — Supporting changes last.

### Present the Plan and Wait for Approval

Before staging anything, display the proposed grouping:

```
Proposed atomic commits (N total):

  1. fix(auth): correct null check in token validator
     Files: src/auth/token.ts

  2. feat(ui): add loading spinner to submit button
     Files: src/components/Button.tsx, src/components/Button.css

  3. chore: bump eslint to v9
     Files: package.json, package-lock.json

Proceed with this grouping? (yes / edit)
```

You MUST wait for user confirmation before staging anything. If the user
edits the grouping, update the plan and present it again before
proceeding.

**When invoked by a subagent on behalf of a non-technical user** (e.g.
from the Product Manager agent): surface the proposed grouping in plain
language before proceeding — replace git jargon with plain descriptions
of what each commit saves. For example: "I'll save your changes in 2
batches: (1) the new Home page, (2) the project setup files."

---

## Step 3 — Compose the Commit Message

Construct the message using this format:

```
[<BRANCH_NAME>][AUTHOR_INITIALS] <type>(<scope>): <subject>

<body — optional>
```

No footer. Subject line only in most cases; include a body only when
the subject alone cannot convey the reason for the change (e.g. a
non-obvious trade-off, a workaround for an external bug, or an
intentional constraint).

### Prefix Rules

- `BRANCH_NAME` — the current branch name, uppercased, with `/` replaced
  by `-` and special characters stripped.
  Example: `feature/user-auth` → `FEATURE-USER-AUTH`.
- `AUTHOR_INITIALS` — derived from `git config user.name` by taking the
  first letter of each word, uppercased.
  Example: `John Wei Jian` → `JWJ`.
  If `user.name` is unset or empty, fall back to `?` and warn the user.

### Conventional Commit Types

| Type       | When to use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature or capability                             |
| `fix`      | A bug fix                                               |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore`    | Build process, dependency updates, tooling              |
| `docs`     | Documentation only                                      |
| `test`     | Adding or updating tests                                |
| `style`    | Formatting changes (no logic change)                    |
| `perf`     | Performance improvements                                |
| `ci`       | CI/CD configuration changes                             |
| `revert`   | Reverts a previous commit                               |
| `build`    | Build system or external dependency changes             |

### Subject Line Rules

- Imperative mood: "add X", "fix Y", "update Z" (not "added" or "fixes")
- 72 characters or fewer (including the prefix)
- No trailing period
- Lowercase after the colon

### Body Rules (opt-in)

Include a body only when the subject alone is insufficient to convey
the reason for the change. When included:

- Wrap at 72 characters
- Explain *what* and *why*, not *how*
- Separate from the subject with a blank line

---

## Step 4 — Stage and Commit Each Group

Process each group from the approved plan in order. For each group:

### 4a — Stage the group's files

Stage only the files belonging to this group. You MUST place each file
on its own line using `\` continuation for readability:

```bash
git add \
  <file1> \
  <file2>
```

For mixed-concern files where only specific hunks belong to this group,
use `git add -p` to stage interactively — but note this requires a
separate approval. Prefer splitting files by concern when possible to
avoid patch-mode staging.

### 4b — Commit with the composed message

Run staging and committing as a single compound command per group.
You MUST place each file on its own line and each `&&` command on its
own line:

```bash
git add \
  <file1> \
  <file2> \
&& git commit \
  -m "<subject line>" \
  -m "<body>" \
&& git log --oneline -1
```

- Use one `-m` per paragraph. Omit the second `-m` when there is no body.
- The `&& git log --oneline -1` confirms the commit without an extra
  approval.
- Repeat for each remaining group.

### 4c — Confirm progress after each commit

After each commit, display:

```
Commit N/total done: <subject line>
Remaining: <list of pending group subjects>
```

---

## Success Criteria

- All changed files are accounted for across one or more atomic commits
- Each commit contains exactly one logical concern
- Every commit message starts with `[<BRANCH_NAME>][AUTHOR_INITIALS]`
- Type and scope are present and accurate for each commit
- Subject is imperative, lowercase, 72 characters or fewer
- Body included only when the subject alone is insufficient; no footer
- Every `git commit` exits with code `0`
- `git log --oneline -<N>` shows N clean, well-scoped commits
