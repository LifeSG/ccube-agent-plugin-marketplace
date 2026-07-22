---
name: cc-write-e2e-test
description: >-
  Playwright setup and test authoring for any web application. Use when
  setting up Playwright from scratch, fixing a misconfigured Playwright
  project, or writing new spec files. Triggers on: "set up Playwright",
  "initialise E2E", "Playwright not working", "write a test",
  "add test coverage", "create a spec", "E2E tests".
argument-hint: >-
  Describe what you need: set up Playwright, fix an existing setup,
  or write tests for a feature, e.g. "write tests for the login page"
user-invocable: true
---

# Write E2E Tests

## Quick Reference

| Mode       | Trigger                                                         | What this skill does                          |
| ---------- | --------------------------------------------------------------- | --------------------------------------------- |
| **Setup**  | "set up Playwright", "initialise E2E", "Playwright not working" | Inspect → identify issues → execute fix       |
| **Author** | "write a test", "add coverage", "create a spec"                 | Detect auth + DB state → five-dimension tests |

> Both modes inspect the workspace first. Nothing is written until the
> current state is understood.

---

## Core Concept — What True E2E Tests Are

**True E2E: real browser → real server → real database. No mocks.**

This skill writes **true E2E tests exclusively**. If `page.route()` is
needed, that is a UI integration test — a different, valid tool, but
not what this skill produces.

| Concern                  | True E2E answer                                      |
| ------------------------ | ---------------------------------------------------- |
| API calls                | Hit the real server — no `page.route()` mocking      |
| Auth                     | Real login via the app's login endpoint              |
| Database                 | Real rows — manage state with setup/teardown helpers |
| What failures are caught | Frontend bugs AND backend contract bugs AND DB bugs  |
| When to run              | Pre-merge gate, nightly, before release              |

If the existing test suite uses `page.route()` mocks, it is a UI
integration suite — leave it intact. True E2E tests live in a separate
folder (`e2e/`) and run against a real server.

---

## Prerequisites

Before writing any test, verify all three prerequisites are met:

1. **A running application** — the server (and any dependent services)
   must be reachable at the `baseURL`. Either start it manually before
   running Playwright, or configure `webServer` in `playwright.config.ts`
   to start it automatically.
2. **A dedicated test database** — true E2E tests write real rows. Use
   a separate database (e.g. via a `TEST_DATABASE_URL` env variable)
   so tests never touch production or development data.
3. **A database reset strategy** — choose one and document it in the
   repo (see Step 2 in Mode 2 for implementation):
   - **Pattern 1** — API-driven setup + teardown; best for small
     suites (≤ ~30 tests); works for any database stack
   - **Pattern 2** — per-worker PostgreSQL schema isolation; scalable
     to any suite size; parallel-safe; PostgreSQL only

---

## Mode 1 — Setup

### Phase A: Inspect the Workspace

You MUST read and check all of the following before writing anything:

1. `package.json` — is `@playwright/test` present?
2. `playwright.config.ts` (or `.js`) — does it exist? What does
   `testDir`, `baseURL`, `timeout`, and `workers` say?
3. Test folder — does `e2e/` exist? Does it contain real tests
   (no `page.route()` calls) or mocked tests?
4. `e2e/helpers/auth.ts` — does it exist with a `loginViaApi` function?
5. Environment config — is there a `TEST_DATABASE_URL` or equivalent?

### Phase B: Identify Issues

Map findings to one or more of these issue classes:

| Issue                              | Symptom                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Not installed**                  | `@playwright/test` absent from `package.json`                                                      |
| **Misconfigured**                  | Wrong `testDir`, missing `baseURL`, no `timeout`, `workers > 1` without Pattern 2 schema isolation |
| **Mocked tests in the E2E folder** | `page.route()` calls inside `e2e/` — these are not true E2E tests                                  |
| **No real auth helper**            | `loginWithMockToken` used instead of `loginViaApi`                                                 |
| **No test DB config**              | Tests share the dev database — risky, may corrupt data                                             |

### Phase C: Execute the Fix

Apply only the fixes needed. Do not overwrite working configuration.

**Not installed:**
```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

**Playwright config — create or fix `playwright.config.ts`:**

Copy `resources/playwright.config.ts` from this skill into the project
root. Then set `workers` and `fullyParallel` based on the chosen DB
pattern:
- Pattern 1: `workers: 1`, `fullyParallel: false` (already the default)
- Pattern 2: `workers: process.env.CI ? 4 : 2`, `fullyParallel: true`

**Mocked tests in the E2E folder:**
- Move mocked tests to a separate `ui-integration/` folder
- Update `playwright.config.ts` to keep a second project targeting
  `ui-integration/` (different runner config), or maintain two separate
  config files
- Do NOT delete the mocked tests — they are UI integration tests with
  independent value

**Scaffold `e2e/helpers/auth.ts`:** — see
[Auth Helper Generation](#step-1-auth-helper-generation) below.

---

## Mode 2 — Author

### Step 1: Auth Helper Generation

Before writing any spec, you MUST detect how the app authenticates users
from the codebase. Do NOT skip this — guessing produces broken helpers.

#### Detection (run all three searches in parallel)

1. **Token storage key** — grep `src/` for `localStorage.setItem(` and
   read the first argument. That string is `TOKEN_KEY`.
2. **Login endpoint** — grep the server route files for a POST handler
   whose path contains `login` or `auth`. Read the full path.
3. **Auth mechanism** — determine which pattern applies:
   - `localStorage.setItem(` found → Pattern A (JWT in localStorage)
   - `Set-Cookie` / `session` in the server login handler → Pattern B
   - Neither found → ask the fallback question below

If none of the three searches yield a clear result, ask ONE question:

> "How does your app authenticate users?
> (a) JWT stored in localStorage, (b) Session cookie set by the server,
> (c) Other"

#### Multi-role credentials

Most project needs at minimum two credential sets — a regular user
and a privileged/admin user — to test auth boundary tests A and B.
Detect existing test accounts from seed files, `.env.test`, or
README. If none exist, ask: "What test accounts are available?"

Export both from a single `credentials.ts` file:

```ts
// e2e/helpers/credentials.ts
// Values detected from: <source file where you found them>
export const regularUser = {
  // <field>: process.env.<ENV_VAR> — detected from <source>
};
export const adminUser = {
  // <field>: process.env.<ENV_VAR> — detected from <source>
};
```

#### Pattern A — JWT in localStorage

Detection confirms: `localStorage.setItem(` in frontend source.

Copy `resources/auth-pattern-a.ts` from this skill into the project
at `e2e/helpers/auth.ts`. Fill in the three detected values:
- `TOKEN_KEY` — first argument of `localStorage.setItem(` in `src/`
- `LOGIN_PATH` — POST route path containing `login` or `auth`
- token field — inspect the login handler's response body shape
  (common: `body.token`, `body.data?.token`, `body.accessToken`)

#### Pattern B — Session cookie

Detection confirms: server login handler sets `Set-Cookie` /
uses a session middleware.

Copy `resources/auth-pattern-b.ts` from this skill into the project
at `e2e/helpers/auth.ts`. Fill in the two detected values:
- `LOGIN_PATH` — POST route path containing `login` or `auth`
- `LOGOUT_PATH` — POST route path containing `logout`

### Step 2: Database State Management

Choose one pattern and apply it consistently across the suite.
Both patterns work in local development and in CI pipelines — the
only requirement is a dedicated test database pointed to by
`TEST_DATABASE_URL`.

**Decision rule:**

```
Suite is small (≤ ~30 tests) or you want the simplest setup?
  → Pattern 1 (API-driven teardown) — no DB driver, works for any stack

Suite needs parallel execution or will grow beyond ~30 tests?
  → Pattern 2 (per-worker schema isolation) — parallel-safe, PostgreSQL only
```

---

**Pattern 1 — API-driven setup + teardown**

*Best for small suites (≤ ~30 tests). Lowest complexity. Works for
any database.*

Each test creates its own unique data via the real API in `beforeEach`
and deletes it in `afterEach`. Tests never share rows, so the suite
can start from any database state and remain deterministic. No DB
driver is needed in the test layer.

Use a unique suffix on test data names to prevent collisions if a
previous run left orphaned rows.

```ts
test.describe('Items', () => {
  let createdId: string;

  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, credentials);
    const res = await page.request.post('/api/items', {
      data: { name: `Test Item ${Date.now()}` },
    });
    createdId = (await res.json()).data.id;
  });

  test.afterEach(async ({ page }) => {
    await page.request.delete(`/api/items/${createdId}`);
  });
});
```

`playwright.config.ts` for Pattern 1:
```ts
workers: 1,           // sequential — no shared state issues
fullyParallel: false,
```

CI and local environment variables required:
```
TEST_DATABASE_URL=postgresql://user:pass@host/test_db
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=your-test-password
```

---

**Pattern 2 — Per-worker PostgreSQL schema isolation**

*Scalable to any suite size. Parallel-safe. PostgreSQL only.*

Each Playwright worker gets its own PostgreSQL schema, created with
migrations and seed data before its first test, and dropped after its
last. Workers never share rows, so `workers: N` is safe. CI pipelines
running multiple jobs against the same database server never collide
because each job's worker schemas are namespaced by worker index.

Requires: `TEST_DATABASE_URL` pointing to a dedicated test PostgreSQL
database, the `pg` package, and a migration runner callable from Node.js.

**Implementation:** Copy `resources/db-fixture.ts` from this skill into
your project at `e2e/fixtures/db.ts`. Fill in `runMigrations()` and
`seedSchema()` for your ORM or SQL runner. Then import `test` and
`expect` from that file in every spec instead of `@playwright/test`:

```ts
// e2e/specs/items.spec.ts
import { test, expect } from '../fixtures/db';

test('user sees their items', async ({ page }) => {
  await page.goto('/items');
  await expect(page.getByRole('list')).toBeVisible();
});
```

`playwright.config.ts` for Pattern 2:
```ts
workers: process.env.CI ? 4 : 2,
fullyParallel: true,
```

CI and local environment variables required:
```
TEST_DATABASE_URL=postgresql://user:pass@host/test_db
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=your-test-password
```

**Orphan cleanup:** If a worker crashes mid-run, its schema is left
behind. Run `resources/cleanup-orphaned-schemas.sql` from this skill
before each CI run or as a scheduled job to remove stale schemas.

**Pattern comparison:**

|                    | Pattern 1                    | Pattern 2                    |
| ------------------ | ---------------------------- | ---------------------------- |
| Isolation          | Per-test (via API teardown)  | Per-worker (schema)          |
| Parallelism        | `workers: 1` recommended     | `workers: N` safe            |
| DB driver in tests | Not required                 | Required (`pg`)              |
| Complexity         | Low                          | Medium                       |
| Best for           | ≤ ~30 tests, any stack       | Any size, PostgreSQL only    |
| CI support         | Yes                          | Yes                          |

### Step 3: Standard Spec File Structure

```ts
import { test, expect } from '@playwright/test';
import { loginViaApi, expectRedirectToLogin } from './helpers/auth';

const credentials = {
  email: process.env.TEST_USER_EMAIL ?? 'test@example.com',
  password: process.env.TEST_USER_PASSWORD ?? 'test-password',
};

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, credentials);
  });

  // ── Section Name ─────────────────────────────────────────────────

  test.describe('Section', () => {
    test('does the thing', async ({ page }) => {
      await page.goto('/your-route');
      await expect(page.getByText(/expected text/i)).toBeVisible();
    });
  });
});
```

> Keep credentials in environment variables — never hardcode them in
> spec files. [CRITICAL]

**Selector priority (use in this order):**

1. `page.getByRole('button', { name: /submit/i })` — most resilient
2. `page.getByLabel(/email/i)` — for form fields
3. `page.getByText(/visible text/i)` — for content assertions
4. `page.getByPlaceholder(/search/i)` — for inputs without labels
5. `page.locator('[data-testid="xyz"]')` — last resort

NEVER use CSS class selectors — they change with refactors.

---

## The Five Dimensions — Checklist

Apply to every spec file written. Check all five before considering
the spec complete.

### Dimension 1 — User Journey (Happy Path)

Cover the full journey from entry point to completion, against the
real server.

```ts
// PASS — navigates the full flow with real data
test('user creates an item and sees it in the list', async ({ page }) => {
  await page.goto('/items/new');
  await page.getByLabel(/name/i).fill('My Item');
  await page.getByRole('button', { name: /submit/i }).click();
  // Assert the real server response is reflected in the UI
  await expect(page.getByText('My Item')).toBeVisible();
  // Navigate to the list and verify persistence
  await page.goto('/items');
  await expect(page.getByText('My Item')).toBeVisible();
});

// FAIL — only tests the form renders, no real server interaction
test('form renders', async ({ page }) => {
  await page.goto('/items/new');
  await expect(page.getByText(/new item/i)).toBeVisible();
});
```

### Dimension 2 — Contract Fidelity

True E2E tests catch backend contract drift — this is one of their
primary advantages over mocked suites. Assert on real response fields
to detect renames, removals, or type changes.

```ts
test('item list reflects real server field names', async ({ page }) => {
  await page.goto('/items');
  // If the server renames `title` to `name`, this assertion fails
  await expect(page.getByRole('heading', { level: 3 }))
    .not.toBeEmpty();
});
```

When a new API field is added to the UI, add a test that asserts on
that field's presence — not its mock value, but its actual rendered
output.

### Dimension 3 — Auth Boundary

Every protected route MUST have these three tests:

```ts
// A — unauthenticated redirect (do NOT call loginViaApi)
test('redirects unauthenticated users to /login', async ({ page }) => {
  await page.goto('/protected');
  await expectRedirectToLogin(page);
});

// B — unauthorized (authenticated but wrong role or not the owner)
test('non-owner cannot access the edit page', async ({ page }) => {
  // Login as a different user who does not own the resource
  await loginViaApi(page, otherUserCredentials);
  await page.goto('/items/1/edit');
  await expect(page.getByText(/not found|forbidden|not allowed/i))
    .toBeVisible();
});

// C — authorized (your standard beforeEach covers this)
```

### Dimension 4 — Resilience

True E2E resilience tests verify the real server error path, not a
mocked 500. The most reliable approach is to trigger real error
conditions via the API or by navigating to known invalid states.

```ts
// Navigate to a resource that does not exist
test('shows not-found state for a missing item', async ({ page }) => {
  await page.goto('/items/nonexistent-id-99999');
  await expect(
    page.getByText(/not found|page not found|does not exist/i),
  ).toBeVisible({ timeout: 10_000 });
});

// Empty state — real DB has no items for this user after cleanup
test('shows empty state when the user has no items', async ({ page }) => {
  // afterEach in beforeEach has cleaned up all items
  await page.goto('/items');
  await expect(
    page.getByText(/no items|nothing here|get started/i),
  ).toBeVisible({ timeout: 10_000 });
});
```

### Dimension 5 — Regression Anchors

After every bug fix, write a named test. Never delete it.

```ts
test('BUG-42: deleted item must not appear in the list', async ({ page }) => {
  // ...
});
```

---

## Anti-Patterns

| Anti-pattern                                   | Why it fails                                     | Correct approach                                                           |
| ---------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- |
| `page.route()` mocking in E2E tests            | Defeats the purpose — backend bugs go undetected | Hit the real server; move mocked tests to `ui-integration/`                |
| `page.waitForTimeout(2000)`                    | Flaky on slow CI                                 | `await expect(locator).toBeVisible({ timeout: 10_000 })`                   |
| CSS class selector `'.card__title'`            | Breaks on refactor                               | `getByRole`, `getByLabel`, `getByText`                                     |
| Hardcoded credentials in spec files            | Security risk; breaks on password rotation       | Use `process.env.TEST_USER_EMAIL` / `TEST_USER_PASSWORD` [CRITICAL]        |
| Tests sharing mutable database state           | One test's write breaks another test             | Use `beforeEach` setup + `afterEach` teardown, or isolate with unique data |
| Calling `loginViaApi` in unauthenticated tests | Invalidates the test                             | Do not call any auth helper in auth boundary test A                        |
| Testing only the happy path                    | Auth and resilience bugs ship silently           | Cover all five dimensions per feature                                      |

---

## Acceptance Criteria

### Feedforward Assertions (MUST-contain)

- [ ] `playwright.config.ts` exists with `testDir: './e2e'`,
      `baseURL`, and `timeout` set; `workers: 1` if using Pattern 1,
      `workers: N` + `fullyParallel: true` if using Pattern 2
- [ ] `e2e/helpers/auth.ts` exists with `loginViaApi` — no mock token
      injection functions
- [ ] No `page.route()` calls anywhere in `e2e/` spec files
- [ ] Credentials sourced from `process.env` — not hardcoded
- [ ] At least one auth boundary test per protected route (no auth
      helper called in the unauthenticated test)
- [ ] Database state explicitly managed (beforeEach setup or afterEach
      cleanup or documented seed assumption)
- [ ] Selectors use `getByRole`, `getByLabel`, or `getByText` only

### Feedback Sensors (MUST-NOT-contain)

- MUST-NOT-contain: `page.waitForTimeout` anywhere in the suite
- MUST-NOT-contain: CSS class selectors (`.ClassName`, `[class*="Foo"]`)
- MUST-NOT-contain: hardcoded credentials (emails, passwords, tokens)
  as string literals
- MUST-NOT-contain: `loginViaApi` called inside an unauthenticated
  redirect test

**PASS example** — true E2E auth boundary test:
```ts
test('redirects unauthenticated users to /login', async ({ page }) => {
  // No loginViaApi — testing unauthenticated state against the real server
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
```

**FAIL example** — disguised as E2E but actually mocked:
```ts
test.beforeEach(async ({ page }) => {
  await page.route('**/api/items**', route =>    // ← mock — not true E2E
    route.fulfill({ body: JSON.stringify({ data: [] }) }));
  await loginViaApi(page, credentials);
});
```
