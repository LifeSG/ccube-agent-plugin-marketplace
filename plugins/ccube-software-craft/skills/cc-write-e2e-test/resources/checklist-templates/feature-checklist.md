# <Feature> — Test Plan

> One markdown plan per feature. Lives at `checklist-test-cases/<feature>-checklist.md`.
> Drafted BEFORE any `.spec.ts` is written. Reviewed with the user. Then specs are
> generated from this plan with one test per scenario. Keeps the file in lock-step
> with the spec file(s) in `__tests__/<feature>/`.

## Overview

<2–4 sentence description: what the feature does, who uses it, what makes it
E2E-worthy. Example: "The Agencies page lets super admins create, rename, and
archive agencies. It's E2E-worthy because it spans an authenticated POST to the
backend, a list-view refresh, and an audit log entry — three integration points
that unit tests don't cover.">

## Seed

- **Fixture:** `__tests__/__fixtures__/base.fixture.ts` (Shape A) / `__tests__/e2e/__tests__/__fixtures__/base.fixture.ts` (Shape B); per-feature plans may use `__tests__/<feature>/__fixtures__/<feature>.fixture.ts`
- **Auth pattern:** <A — JWT in localStorage / B — Session cookie / C — MOL header bypass / D — OAuth storageState / E — API key>
- **Roles needed:** <super admin, regular admin, citizen — list only what this feature actually uses>
- **DB pattern:** <Pattern 1 — API teardown / Pattern 2 — per-worker schema / Pattern 3 — read-only seed>
- **ID scheme:** <Sequential `TC No N` / Feature-prefixed `AGEN-NNN` / Jira-aligned `MOL-NNNN` / Slug-style>  ← record once, follow throughout this plan
- **Reference data** (optional): <if any worker-scoped parent entity is needed — e.g. "a Service exists that bookings hang off">

## Conventions (do not edit per feature — these are the contract)

- **Test-case IDs are user-defined**, but must follow ONE scheme per plan (see "ID scheme" above). The skill never auto-increments — IDs come from the user, the existing plan, or Jira.
- **Unique within this plan.** Two scenarios can't share an ID.
- **Stable.** Never rename an ID once the spec references it — that breaks historic CI logs, PR comments, and Jira links.
- **Status checkbox.** Flip `- [ ]` → `- [x]` only after the matching test passes for real (`npx playwright test --grep @<Feature>`).
- **Tags.** Each scenario lists the tags its test should carry. Feature tag is mandatory; user-type / action tags are optional but cheap.
- **Verbatim match.** The spec file's `test("…")` title starts with `<ID>: <descriptive sentence>` — exact same ID, exact same sentence, same punctuation.

## Scenarios

### <ID>: <descriptive sentence — same sentence the test title will use>  — tags: `@<Feature> @SuperAdmin @Create`
- [ ] Status

**Steps:**
1. <single-line action — what the tester would type or click>
2. <…>
3. <…>

**Expected results:**
- <observable, verifiable outcome — one line per assertion the spec will check>
- <…>

---

### <ID>: <descriptive sentence>  — tags: `@<Feature> @Read`
- [ ] Status

**Steps:**
1. <…>

**Expected results:**
- <…>

---

### <ID>: Unauthenticated visitors are redirected to /login when visiting /<route>  — tags: `@<Feature> @Auth`
- [ ] Status

**Steps:**
1. Navigate to `/<route>` without setting any auth headers
2. Wait for the page to settle

**Expected results:**
- URL matches `/login` (or the project's actual login route)
- The intended destination is preserved in the redirect URL (e.g. `?redirect=/<route>`)

---

### <ID>: <wrong-role user> sees 404/forbidden on /<protected-route>  — tags: `@<Feature> @Auth`
- [ ] Status

**Steps:**
1. <…>

**Expected results:**
- <…>

---

### <ID>: Visiting /<route>/<nonexistent-id> shows a not-found state  — tags: `@<Feature> @NotFound`
- [ ] Status

**Steps:**
1. <…>

**Expected results:**
- <…>

---

### Coverage spread (delete this section before saving)

Before saving the plan, double-check that the scenarios cover:
- ✅ Happy path / user journey
- ✅ Real-server response fidelity (assert a value from the backend, not just visibility)
- ✅ Auth boundary — unauthenticated redirect AND wrong-role access
- ✅ Failure modes — not-found, empty state, validation errors
- ✅ Known regressions — if the user mentioned a past bug, scaffold a TC for it

### ID scheme examples (delete before saving)

Pick ONE for the whole plan:

- Sequential: `TC No 1`, `TC No 2`, `TC No 3`, …
- Feature-prefixed: `AGEN-001`, `AGEN-002`, … (good when multiple plans exist — `grep -r 'AGEN-' .` finds every reference globally)
- Jira-aligned: `MOL-1234`, `BUG-21046-regression` (good when QA tracks each scenario as a Jira ticket)
- Slug-style: `super-admin-create-agency`, `citizen-view-own-bookings` (self-describing, no need to look up the ID)
