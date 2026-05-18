# Plan & Heal — worked examples

This reference is read when scaffolding a new feature plan, or when a test fails after authoring and you need to do a single healer pass. Inspired by [Playwright Test Agents](https://playwright.dev/docs/test-agents) (planner → generator → healer).

> **Note on test-case IDs:** The worked example below uses the **feature-prefixed** scheme (`AGEN-001`, `AGEN-002`, …) because it shows the ID-as-grep-anchor pattern at its best. Test-case IDs are user-defined per plan — your project might use sequential `TC No 1`, Jira-aligned `MOL-1234`, or slug-style `super-admin-create-agency` instead. See SKILL.md → Step 5 → "Test-case IDs are user-defined" for the chooser.

---

## Part 1 — A complete plan, side-by-side with the generated specs

### Plan: `checklist-test-cases/agencies-checklist.md`

```markdown
# Agencies — Test Plan

## Overview
The Agencies page (`/agencies`) lets super admins create, rename, and archive agencies.
It's E2E-worthy because it spans an authenticated POST to the backend, a list-view
refresh after creation, and an audit log entry on rename — three integration points
that unit tests don't cover. Only super admins reach this page; other roles are
redirected to /403.

## Seed
- **Fixture:** `__tests__/__fixtures__/base.fixture.ts` (Shape A) — under Shape B this would be `__tests__/e2e/__tests__/__fixtures__/base.fixture.ts`. Import via the `__fixtures__/*` alias.
- **Auth pattern:** C — MOL header bypass (mol-token-bypass + ADMIN_ID)
- **Roles needed:** super admin (mutations), regular admin (auth-boundary test)
- **DB pattern:** Pattern 1 — API-driven setup + teardown (suite has < 30 tests for now)
- **ID scheme:** Feature-prefixed (AGEN-NNN). Picked because there are sibling plans for `users/`, `bookings/`, `dashboard/` and the `AGEN-` prefix makes a global grep unambiguous.

## Scenarios

### AGEN-001: Super admin creates an agency and sees it in the card list  — tags: `@Agencies @SuperAdmin @Create`
- [ ] Status

**Steps:**
1. Open `/agencies` as a super admin
2. Click the "New agency" button in the top-right
3. Fill the "Name" field with a unique value (faker.company.name())
4. Click "Save"

**Expected results:**
- The modal closes
- The new agency appears as a card with its name visible
- The card list contains at least one card (the count increases by 1 from the pre-create state)
- A subsequent `GET /api/v1/agencies` returns the created agency in its response

---

### AGEN-002: Agency card renders the non-empty name from the real API response  — tags: `@Agencies @Read`
- [ ] Status

**Steps:**
1. Create an agency via the API helper with a unique name
2. Open `/agencies` as a super admin
3. Locate the card by its agency name

**Expected results:**
- The card's name text matches the value created via the API exactly
- The name is non-empty (rules out a phantom card from a stale cache)

---

### AGEN-003: Unauthenticated visitors are redirected to /login when visiting /agencies  — tags: `@Agencies @Auth`
- [ ] Status

**Steps:**
1. Open `/agencies` without setting any auth headers
2. Wait for the page to settle

**Expected results:**
- URL matches `/login`
- Redirect URL preserves the intended destination: `?redirect=/agencies`

---

### AGEN-004: Regular admin sees /403 when visiting /agencies  — tags: `@Agencies @Auth`
- [ ] Status

**Steps:**
1. Open `/agencies` as a regular admin (not super admin)

**Expected results:**
- URL matches `/403`
- "Access denied" message is visible

---

### AGEN-005: Renamed agency does not reappear after closing the modal (regression for BUG-21046)  — tags: `@Agencies @SuperAdmin @Update`
- [ ] Status

**Steps:**
1. Create an agency named "Old Name" via the API helper
2. Open `/agencies` and click the agency's rename action
3. Type "New Name" in the rename input and click "Save"
4. Close the rename modal
5. Reload `/agencies`

**Expected results:**
- After save: a card with "New Name" is visible
- After reload: only "New Name" is in the list — "Old Name" is NOT present anywhere on the page
```

### Spec generated from AGEN-001

```ts
// plan:    __tests__/e2e/agencies/agencies-checklist.md
// fixture: __tests__/__fixtures__/base.fixture.ts

import { faker } from "@faker-js/faker";
import { test, expect } from "__fixtures__/base.fixture";
import { deleteAgencyGroups } from "support/apis/agency-groups";

test.describe("Agencies", { tag: "@Agencies" }, () => {
  const createdIds: string[] = [];

  test.afterEach(async ({ request, superAdmin }) => {
    if (createdIds.length === 0) return;
    await deleteAgencyGroups(createdIds.splice(0), { request, user: superAdmin });
  });

  test(
    "AGEN-001: Super admin creates an agency and sees it in the card list",
    { tag: "@SuperAdmin @Create" },
    async ({ authedPage, request, superAdmin }) => {
      const name = faker.company.name();

      // 1. Open /agencies as a super admin
      await authedPage.goto("/agencies");

      // 2. Click the "New agency" button in the top-right
      await authedPage.getByRole("button", { name: /new agency/i }).click();

      // 3. Fill the "Name" field with a unique value
      await authedPage.getByLabel(/name/i).fill(name);

      // 4. Click "Save"
      await authedPage.getByRole("button", { name: /save/i }).click();

      // Expected: modal closes; new agency appears as a card; list count increases
      await expect(authedPage.getByRole("dialog")).toBeHidden();
      const card = authedPage.getByTestId("agencies-card-list").getByText(name);
      await expect(card).toBeVisible();

      // Track for teardown (id comes from the network response or a subsequent list fetch)
      const response = await request.get("/api/v1/agencies");
      const list = (await response.json()) as Array<{ id: string; name: string }>;
      const created = list.find((a) => a.name === name);
      expect(created, "API should report the newly created agency").toBeTruthy();
      if (created) createdIds.push(created.id);
    },
  );
});
```

### Notes for the agent

- The `// plan:` and `// fixture:` headers are **load-bearing.** They turn a CI failure into a one-jump triage. Don't omit them.
- The `// 1.` / `// 2.` step comments mirror the plan's **Steps** verbatim. The assertions mirror the plan's **Expected results.** A reviewer reading the test should be able to recover the plan without opening the markdown.
- Use `faker.company.name()` (or `uniqueX(prefix)`) for any user-visible string — keeps tests order-independent.
- AGEN-003 (unauthenticated redirect) imports `base` from `@playwright/test` directly, not from `auth-fixture.ts` — otherwise the fixture authenticates the page and the boundary test is meaningless. Show this explicitly when generating that test.

---

## Part 2 — One healer pass, two worked examples

The healer pass runs after Step 5's specs are written. It's capped at one round of fixes per test. If a second pass would be needed, the right move is to either `test.fixme()` the test or ask the user — not loop.

### Example A — Locator drift after a UI refresh

#### What happened

```
× AGEN-001: Super admin creates an agency and sees it in the card list
  Error: locator.click: Element not found
  Call log:
  - waiting for getByRole('button', { name: /new agency/i })
```

The plan said "Click the New agency button in the top-right". The button now reads "+ Add agency" — the team renamed it during the same sprint.

#### One healer pass

1. **Inspect.** Open a paused page (`npx playwright test ... --debug` or `page.pause()`) or `page.getByRole("button").allTextContents()` in a quick probe. Discover the actual button text: "Add agency".
2. **Pick the most resilient locator.** Two options:
   - `getByRole("button", { name: /add agency/i })` — matches the new text exactly
   - `getByTestId("agencies-create-button")` — if a test-id exists in the source, prefer this (text labels drift; test-ids usually don't)
3. **Update the spec and re-run.** Result: PASS.
4. **Update the plan?** No — the plan's *Step* ("Click the New agency button") was a description, not a verbatim label. If the user agrees the new label is fine, leave the plan alone. If the user is surprised by the rename, mention it in the closing summary so they can decide whether to update copy.

### Example B — Stale fixture leaves a row the next test trips on

#### What happened

```
× AGEN-002: Agency card renders the non-empty name from the real API response
  Error: Expected at least one card with name "Acme Corp Inc"
  Actual: 0 matches; existing cards: ["Acme Corp Inc", "Acme Corp Inc"]
```

Two cards exist with the same name — AGEN-001's teardown didn't run because the test crashed mid-way before tracking the id.

#### One healer pass

1. **Don't change the assertion** to "at least one card with this name". That hides the real bug.
2. **Make AGEN-001's teardown defensive.** Push the id as soon as you have it; use `splice(0)` in `afterEach` so a partially-failed test still cleans up:
   ```ts
   test.afterEach(async ({ request, superAdmin }) => {
     if (createdIds.length === 0) return;
     await deleteAgencyGroups(createdIds.splice(0), { request, user: superAdmin });
   });
   ```
3. **Add a worker-scoped cleanup as a safety net.** Before the suite starts, delete any agency whose name starts with the test prefix.
4. **Re-run AGEN-002.** Result: PASS.

### Example C — When to give up and `test.fixme()`

The same test fails on the second run. The failure is "Modal close emits stale agency name after rename". The test logic is correct — the app has a real bug.

Don't loop. Mark with `test.fixme()` and a comment:

```ts
test.fixme(
  "AGEN-005: Renamed agency does not reappear after closing the modal (regression for BUG-21046)",
  async ({ authedPage, request, superAdmin }) => {
    // BUG-21046: closing the rename modal emits the pre-rename name into a stale render.
    // Expected: only the new name is visible after close + reload.
    // Actual:   both names appear until a hard reload.
    // …spec body unchanged so it auto-passes once the fix lands…
  },
);
```

Then:

- Flip the row's status in the plan to `- [ ]` (still planned, not yet passing).
- Add a row under `## Skipped Tests` in `00-progress-checklist.md`:
  ```markdown
  - AGEN-005 (Agencies) — Renamed agency does not reappear after close. Blocked by BUG-21046.
  ```
- Mention in the closing summary that this test is `fixme`'d pending the bug fix, so the user knows whether to chase it.

`test.fixme` is the correct primitive here because it:
- Keeps the test visible in the suite (it shows as "fixed me" in the report — pressure to fix)
- Doesn't fail CI
- Auto-passes (and starts failing) once the bug is fixed, so the test isn't lost

---

## What NOT to do during a healer pass

- **Never replace a precise locator with a CSS class selector** (`.MuiCard-root`) just because it happens to match. CSS classes break on any UI refactor.
- **Never insert `page.waitForTimeout(...)`** to "give the page time to settle". Always replace with a `await expect(locator).toBeVisible({ timeout: ... })` that retries.
- **Never broaden an assertion** (`/foo/i` → `/.*foo.*/`) to make it pass. That hides bugs and erodes the test's value.
- **Never silently rewrite the plan's Expected Results.** If the spec assertion contradicts the plan, surface that to the user. The plan is the contract.
- **Never go past one healer pass.** If the fix doesn't land in one round, the diagnosis isn't fast enough — ask the user or `test.fixme()`.
