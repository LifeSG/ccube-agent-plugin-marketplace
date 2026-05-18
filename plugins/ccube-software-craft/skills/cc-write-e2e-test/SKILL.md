---
name: cc-write-e2e-test
description: >-
  Playwright E2E test setup and authoring for any web application. Plan-first:
  when asked to write or generate E2E tests, draft a markdown test plan
  (Overview, Seed, TC-numbered scenarios with Steps + Expected Results) and
  confirm scope with the user BEFORE writing any .spec.ts. Inspired by
  Playwright Test Agents (planner → generator → healer): plan, generate from
  the plan, then run + heal once before declaring done. Use this skill any time
  the user wants to create, set up, fix, scaffold, or migrate browser-level
  tests for a web application — whether or not they mention Playwright by
  name. Typical asks: "write a test for [page/route/flow]", "add e2e coverage
  for [feature I just shipped]", "generate an e2e test plan", "set up
  Playwright in [repo]", "fix our broken Playwright setup", "migrate Cypress
  to Playwright", "add a page object for [X]", "create a fixture that composes
  with authedPage", "switch our auth helper from token-bypass to real
  Cognito/SSO/Singpass", "wire up storageState/JWT/session cookies/mol-token-bypass
  for tests". The common thread is real-browser tests driving a real UI —
  pages, routes, user journeys, auth boundaries, multi-role flows, multi-port
  frontend/backend setups. Do NOT use for: unit tests (Vitest/Jest), component
  tests, mocking with page.route, visual regression (Percy/Chromatic),
  Storybook play functions, backend/API debugging without a browser, or
  general test-strategy / release-QA docs unrelated to browser tests.
argument-hint: >-
  Describe what you need: set up Playwright, fix an existing setup, write
  tests for a feature, scaffold a Page Object, or add an auth pattern, e.g.
  "write tests for the booking page using Singpass citizen login"
user-invocable: true
---

# Write E2E Tests

## Quick Reference

| Mode          | Trigger                                                         | What this skill does                                                                       |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Setup**     | "set up Playwright", "initialise E2E", "Playwright not working" | Inspect → identify issues → ask targeted questions → execute fix                           |
| **Author**    | "write a test", "add coverage", "create a spec", "generate e2e" | **Plan markdown → confirm → write specs → run & heal once** (planner-generator-healer loop) |
| **Scaffold**  | "add page object", "create fixture", "scaffold auth helper"     | Generate POM class, fixture, or auth helper                                                |

Both Setup and Author modes **inspect the workspace first** and **ask the user before committing to ambiguous choices**. Nothing is written until the current state is understood AND the user has confirmed the high-level shape (auth pattern, target environment, DB strategy, scope of first specs).

**Author mode is plan-first.** Never write a `.spec.ts` until a markdown plan exists in `checklist-test-cases/` and the user has signed off on its scope. The plan is the contract: the user reviews scenarios cheaply in markdown, then the agent generates code that maps 1:1 from plan to spec. See [Step 5 — Plan Document](#step-5--plan-document-the-contract-between-user-specs-and-ci).

---

## Core Concept — What True E2E Tests Are

**True E2E: real browser → real server → real database. No mocks.**

This skill writes **true E2E tests exclusively**. `page.route()` means UI integration test — a separate, valid tool, but not what this skill produces.

| Concern   | True E2E answer                                          |
| --------- | -------------------------------------------------------- |
| API calls | Hit the real server — no `page.route()` mocking          |
| Auth      | Real login OR environment-specific auth bypass           |
| Database  | Real rows — manage state with setup/teardown helpers     |

If the existing suite uses `page.route()` mocks, it is a UI integration suite — leave it intact. True E2E tests live in a separate folder (`e2e/`, `__tests__/`, or `tests/`) and run against a real server.

---

## Prerequisites

Before writing any test, verify all four are met:

1. **A running application** — server(s) reachable at the URL(s) Playwright will hit. Either start them manually or configure `webServer` in `playwright.config.ts`. **For local dev where frontend and backend run on different ports, both must be up** (see [URL Strategy](#url-strategy--single-vs-multi-host)).
2. **A dedicated test environment** — true E2E tests write real data. Use a separate test DB/env (`E2E_BASE_URL`, `E2E_BACKEND_URL`, `TEST_DATABASE_URL`) so tests never touch production.
3. **A database reset strategy** — choose one (see [Step 2](#step-2--database-state-management)):
   - **Pattern 1** — API-driven setup + teardown; ≤ ~30 tests; any stack
   - **Pattern 2** — per-worker PostgreSQL schema isolation; any size; PostgreSQL only
4. **Credentials sourced from env** — never hardcoded as string literals in spec files.

---

## Mode 1 — Setup

### Phase A: Inspect the Workspace

Read and check all of the following **in parallel** before writing anything. Use the file paths to drive grep/find commands — do not guess.

| Check                          | Where to look                                                                                       | Why it matters                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Playwright installed?**      | `package.json` → `devDependencies.@playwright/test`                                                 | Drives the install vs configure decision                                                        |
| **Playwright scripts?**        | `package.json` → `scripts.test*`                                                                    | If `test` is taken (Jest, Vitest), namespace as `test:e2e`                                      |
| **Config exists?**             | `playwright.config.ts` / `.js` at project root OR inside `__tests__/` / `tests/`                    | Reveals existing `testDir`, `baseURL`, `workers`, `webServer`                                   |
| **Test folder convention?**    | `e2e/`, `__tests__/`, `tests/`, `cypress/` (migrate), `playwright/`                                 | Match the project's documented convention (check `CLAUDE.md`, `AGENTS.md`, `project-structure.md`). All specs must live inside ONE wrapper — never at repo root, never co-located with `src/` |
| **Stray spec files?**          | `find . -maxdepth 2 -name "*.test.ts" -o -name "*.spec.ts"` (excluding `node_modules`)              | If any spec exists at repo root or directly under `src/`, flag for migration into the wrapper folder before adding new tests |
| **Spec file extension?**       | grep `*.spec.ts` and `*.test.ts` under candidate folders                                            | Some projects reserve `.test.ts` for E2E and `.spec.ts` for unit tests (or vice versa)          |
| **Mocked specs?**              | grep `page.route(` under candidate folders                                                          | If present, the suite is UI integration — leave intact, set up a separate true-E2E folder      |
| **Auth pattern?**              | grep `localStorage.setItem`, `Set-Cookie`, `mol-token-bypass`, `wog-user-id`, `x-api-key`, OAuth/Cognito/Singpass/OIDC libs | Maps to one of Patterns A–E (see [Step 1](#step-1--auth-helper-generation)) |
| **Existing auth helper?**      | grep `setExtraHTTPHeaders`, `storageState`, `loginViaApi` under tests/                              | Determines fixture-vs-inline cleanup                                                            |
| **Env files?**                 | List `.env*` in root AND in each `params/`, `secrets/`, `__tests__/` directory                      | Tells you what conventions exist (`.env`, `.env.local`, `.env.test`, `.env.e2e`)                |
| **Frontend vs backend URLs?**  | grep `NEXT_PUBLIC_BACKEND_URL`, `BACKEND_URL`, `API_URL` in env / config                            | Determines [single- vs multi-host URL strategy](#url-strategy--single-vs-multi-host)            |
| **API contract / OpenAPI?**    | `api-definitions/*.json`, `openapi.yaml`, `swagger.json`, generated `src/api-clients/`              | Lets you mirror real request/response shapes in API helpers                                     |
| **App routes?**                | List `src/app/*` (Next.js App Router) or `pages/*` or `src/routes/*`                                | Tells you which routes need auth-boundary tests                                                 |
| **Test-id conventions?**       | grep `*_TEST_IDS` constants in `src/constants/`, grep `data-testid=` in pages                       | Reuse existing test IDs in selectors — don't invent new ones                                    |
| **Parent ESLint config?**      | `eslint.config.mjs` / `.eslintrc*` at root                                                          | E2E test folders typically need to be added to `globalIgnores` to avoid false positives         |
| **Parent TS config?**          | `tsconfig.json` → `include` and `exclude`                                                           | If `include: ["**/*.ts"]`, the E2E folder may need explicit `exclude` to keep `type-check` clean |
| **CI config?**                 | `.gitlab-ci.yml`, `.github/workflows/*`                                                             | Tells you whether to wire CI now or defer                                                       |

Summarise findings back to the user in a short table before generating anything.

### Phase B: Identify Issues

| Issue                                  | Symptom                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Not installed**                      | `@playwright/test` absent from `package.json`                                                                      |
| **No npm scripts**                     | `package.json` has no `test`, `test:headed`, or equivalent Playwright scripts                                      |
| **`test` script taken**                | Existing `test` runs Jest/Vitest; Playwright scripts must be namespaced (`test:e2e`)                               |
| **Misconfigured**                      | Wrong `testDir`, missing `baseURL`, no `timeout`, `workers > 1` without schema isolation, no `forbidOnly`          |
| **Single baseURL, multi-host app**     | `baseURL` set but frontend and backend run on different hosts/ports — API calls hit the wrong server               |
| **dotenv not wired**                   | `.env` exists but `playwright.config.ts` does not `dotenv.config({ path, override: true })`                        |
| **Root `.env` leaks**                  | App-level env vars (e.g. `NEXT_PUBLIC_BACKEND_URL`) leak into Playwright because no override                       |
| **Playwright in app `package.json`**   | `@playwright/test` and reporters pollute the production dependency graph                                           |
| **ESLint picks up E2E files**          | Parent ESLint flags Playwright fixture's `use(...)` callback as a React Hook misuse, or flags `any` in test specs  |
| **TS picks up E2E files**              | Parent `tsc --noEmit` tries to compile E2E files; fails to resolve `@playwright/test`                              |
| **Specs at repo root**                 | `*.test.ts` / `*.spec.ts` at `<repo>/` or under `src/` instead of inside a wrapper folder                          |
| **Mocked tests in E2E folder**         | `page.route()` calls inside spec files                                                                             |
| **No auth helper**                     | Mock token injection or `setExtraHTTPHeaders` called directly in spec files                                        |
| **No test env config**                 | Tests point at production or dev database                                                                          |
| **Auth call in unauthenticated test**  | Auth-boundary spec invokes `loginViaApi` / `setExtraHTTPHeaders` — invalidates the very thing the test is checking |

### Phase C: Ask the User Before Generating

Before writing any file, surface the ambiguous decisions to the user. Use **AskUserQuestion** with 2–4 multi-choice options each. Mark the recommended option as "(Recommended)" and put it first. Typical questions:

1. **Auth method** — even if you've auto-detected the pattern, confirm with the user (e.g. an app may support real OAuth in production AND a `mol-token-bypass` header in test envs).
2. **Target environment** — local dev (with `webServer`), deployed test/staging env, or both via env var.
3. **DB strategy** — Pattern 1 (API teardown), Pattern 2 (per-worker schema), or shared-seed read-only.
4. **First flows / scope** — which routes/features the first spec batch should cover. Multi-select.

Follow-up questions to ask once the first round is answered:

5. **Install location** — where Playwright lives. ALWAYS ASK; don't decide unilaterally. See decision-tree below.
6. **User roles** — how many credentials are needed? (Super admin only / admin + regular / admin + regular + non-admin).
7. **Bypass details** — exact header names + env var names (offer standard MOL convention as default; allow custom).
8. **CI integration timing** — now or later. Defer is usually safer.

**Install location — what to ask:**

> "Where should Playwright be installed?
> (a) Root `package.json` — simpler, Playwright sits alongside other devDependencies. Best for small projects, monorepos with one shared root, or when the team is fine with Playwright in the app's dep graph.
> (b) Independent `__tests__/package.json` (Recommended when the project already documents `__tests__/` at root as the E2E folder) — keeps Playwright + reporters + dotenv out of the app's prod dep graph. Slightly more complex (delegating root scripts).
> (c) Other path — I'll specify (e.g. `e2e/package.json`, `tests/package.json`)."

**Bias the recommendation by what you found in Phase A:**

| Phase A signal                                                                                       | Bias toward |
| ---------------------------------------------------------------------------------------------------- | ----------- |
| Project's own `CLAUDE.md` / `AGENTS.md` / `project-structure.md` documents `__tests__/` for E2E      | Option (b)  |
| No documented test convention; small app with few scripts                                            | Option (a)  |
| App's `package.json` is already heavy / OpenNext / strict prod-build constraints                     | Option (b)  |
| Monorepo with single root `package.json` for the workspace                                           | Option (a)  |
| User explicitly wants Playwright deps separate from the app                                          | Option (b)  |
| User explicitly says "just keep it simple" or "all in root"                                          | Option (a)  |

State your bias as the (Recommended) option, but ALWAYS let the user choose. Some teams have strong opinions either way.

**Never proceed past Phase C without explicit user answers.** If the user is "not sure" on any item, ask one targeted follow-up before writing — do not guess.

### Phase D: Execute the Fix

#### D.1 — Install Playwright

**Choose the path the user picked in Phase C question #5.** Do not re-decide here. The two paths produce equivalent test behaviour; the difference is dependency hygiene and the shape of root `package.json` scripts.

| Option                                  | When to use                                                                                  |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| **A — Root install**                    | Small app, monorepo with one shared root, or team is fine with Playwright in app deps        |
| **B — Independent `__tests__/package.json`** | Recommended when project documents `__tests__/` as the E2E folder; keeps app deps clean |
| **C — Custom path**                     | User specifies another directory (`e2e/`, `tests/`, `playwright/`)                           |

For the exact install commands, `__tests__/package.json` template, `__tests__/tsconfig.json`, and root `package.json` delegating scripts — **read `references/install-options.md`** and use the section matching the user's choice. Do not read sections for options the user did not pick.

> ⚠️ If the existing `test` script is Jest or Vitest, **never overwrite it** — use the `test:e2e` namespace. Always announce which scripts you added and why in your closing summary.

#### D.2 — Drop in the Playwright config

Copy `resources/playwright.config.ts` and adjust three sections:
- `testDir` — match project convention (`./e2e`, `./__tests__/e2e`, `./tests`)
- `workers` / `fullyParallel` — pick based on DB pattern
- `use.baseURL` — see [URL Strategy](#url-strategy--single-vs-multi-host) section

Critical block to include for `.env` loading:
```ts
import * as dotenv from "dotenv";
import * as path from "node:path";

dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });
```

**`override: true` is mandatory** when the app has its own root `.env` (e.g. Next.js's `NEXT_PUBLIC_*`). Without it, app-level env vars shadow your test env and you'll see baffling "why is it talking to dev?" symptoms.

#### D.3 — Suppress parent ESLint / TypeScript in the test folder

**Parent ESLint flat config (`eslint.config.mjs`):**
```ts
globalIgnores([
  // …existing ignores…
  "__tests__/**",  // E2E tests use Playwright, not the app's ESLint config.
]),
```

A legacy `.eslintrc.cjs` placed inside `__tests__/` will **not** be read when the parent uses flat config — modify the parent.

**Parent `tsconfig.json`:** Usually not needed (node-module resolution finds `@playwright/test` from `__tests__/node_modules`). If `npm run type-check` complains, add `__tests__` to the parent's `exclude` array.

#### D.4 — Other fixes

- **Mocked tests in E2E folder:** Move to `ui-integration/` — do NOT delete. Update config to keep both as separate projects.
- **Scaffold auth helper:** Follow [Step 1](#step-1--auth-helper-generation) in Author mode below.

#### D.5 — Verify

Run all three before reporting success:

```bash
# Inside __tests__/ (or wherever the config lives):
npx playwright test --list              # Confirms tests discovered + config loads
npx tsc --noEmit                        # E2E TypeScript clean

# From project root:
npm run type-check                      # App TypeScript still clean (E2E didn't leak)
npm run lint                            # No new lint errors from the E2E folder
```

If any of these regress, fix before claiming the task is complete.

---

## URL Strategy — Single vs Multi-Host

**Critical decision: is your app a single host, or does the frontend and backend run on different hosts/ports?**

### Single host (most common — deployed test envs)

Frontend and backend share an origin (e.g. `https://www.cms.e2e.life.gov.sg` serves the Next.js app at `/` and proxies the backend at `/api`).

- One env var: `E2E_BASE_URL`
- `page.goto('/dashboard')` — resolves against `baseURL`
- API helpers — return paths like `/api/v1/resource`; Playwright's `request` resolves against `baseURL`

### Multi-host (local dev, many monorepo setups)

Frontend and backend run on different hosts/ports:
- Frontend Next.js dev server on `:3000`
- Backend API server on `:3800/<app-prefix>/api`

**You need two env vars** — and the API helpers must build absolute URLs, not paths:

```env
# .env (or .env.e2e)
E2E_BASE_URL=http://localhost:3000              # frontend → page.goto()
E2E_BACKEND_URL=http://localhost:3800           # backend  → API helpers
```

In `helpers/env.ts`:
```ts
export const E2E_BASE_URL = process.env.E2E_BASE_URL ?? "https://<deployed-test-host>";

// Default backend to frontend host so deployed (single-host) envs work without configuring both.
export const E2E_BACKEND_URL = process.env.E2E_BACKEND_URL ?? E2E_BASE_URL;

export const E2E_API_BASE_PATH = "/<app-prefix>/api";  // e.g. "/api" or "/<your-app>/api"

export function backendApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = E2E_BACKEND_URL.replace(/\/$/, "");
  return `${base}${E2E_API_BASE_PATH}${normalized}`;
}
```

In `support/apis/http.ts`:
```ts
import { backendApiUrl } from "../env";

export async function apiPost<T>(path: string, body: T, options) {
  const response = await options.request.post(backendApiUrl(path), {
    headers: { ...getBypassHeaders(options.user), ...(options.additionalHeaders ?? {}) },
    data: body as Record<string, unknown>,
  });
  if (!response.ok()) throw new Error(`POST ${path} failed: ${response.status()} ${await response.text()}`);
  return response.json();
}
```

**Why absolute URLs:** Playwright's `request` fixture resolves relative paths against `baseURL`. If `baseURL` points at the frontend, a relative API path hits the frontend (wrong). Building absolute URLs sidesteps this entirely.

**Symptom of getting this wrong:** API setup calls return HTML (the frontend's 404 page) instead of JSON, or hit the wrong port. Always log the resolved URL on first failure to diagnose.

### Heuristic: which strategy does this project need?

| Signal                                                                                | Strategy        |
| ------------------------------------------------------------------------------------- | --------------- |
| Only one URL in app's env config (`BASE_URL`)                                         | Single host     |
| App env config has both `BASE_URL` (or `FRONTEND_URL`) AND `BACKEND_URL`/`API_URL`    | Multi-host      |
| Tests will run against deployed env only                                              | Usually single  |
| Tests will run against `npm run dev` locally with a separate backend on another port  | Multi-host      |
| Both — deployed CI run + local dev runs                                               | Multi-host (set both env vars; backend defaults to frontend host for deployed) |

---

## Mode 2 — Author

### Author flow at a glance (per feature)

The author loop borrows directly from [Playwright Test Agents](https://playwright.dev/docs/test-agents) (planner → generator → healer), with MOL conventions layered on top:

1. **Plan.** Draft `checklist-test-cases/<feature>-checklist.md` — Overview, Seed (fixture path, ID scheme), Scenarios with Steps and Expected Results, each carrying a user-defined test-case ID (sequential `TC No N`, feature-prefixed `AGEN-001`, Jira-aligned, or slug-style — see Step 5). Confirm with the user **before** touching any `.ts` file.
2. **Set up shared scaffolding** (auth helper, API helpers, DB strategy, POMs) — only on the first feature for that suite, or when a new pattern is needed.
3. **Generate.** Write one test per scenario. Each spec file has a `// plan:` and `// fixture:` header comment that points back to the plan and the fixture it uses.
4. **Verify & Heal.** Run the feature's tests (`--grep @<Feature>`). If a test fails for a fixable reason (selector drift, timing), do one healer pass: inspect, patch, retry once. If still failing and the test logic is correct, mark `test.fixme()` with a one-line reason — don't loop forever.
5. **Track.** Flip `- [ ]` → `- [x]` on every scenario whose test now passes; bump `00-progress-checklist.md`.

**Why plan-first matters.** Markdown is cheap to review and cheap to revise. A typo in a plan costs 10 seconds; a typo in 8 generated `.spec.ts` files costs 10 minutes. Letting the user redirect at the plan stage keeps the agent from over-investing in scenarios that don't match intent. It also gives reviewers, PMs, and future-you a human-readable spec — independent of whether the Playwright code is up to date.

**When to skip the plan?** Only when the user explicitly opts out ("just write it, don't plan"). Even then, write a 1-scenario minimal plan stub so the cross-reference contract (test-case ID ↔ spec title) doesn't break. Plans are not bureaucracy — they're the API between human intent and generated code.

**Steps 0–4 are setup that compounds across features. Steps 5–6 are the per-feature loop.**

---

### Step 0: Decide on Project Structure

Decide on two structural choices before writing tests:

**Page Object Model (POM):** Create one class per page or major component. Use when multiple tests share UI interactions with the same page. Keep locators private; expose intent-revealing action methods. Copy `resources/base-fixture.ts` for the `BasePage` base class.

**Shared chrome (NavBar / AppShell):** When a persistent top nav, side nav, or global modal appears on every authenticated page, define those locators once in a `NavBar` class and have every authenticated page extend it:
```ts
export class NavBar extends BasePage {
  readonly sideNav = { dashboard: this.page.getByTestId('dashboard-nav-item'), ... };
  readonly topNav  = { logout:    this.page.getByTestId('signout-btn') };
}
export class DashboardPage extends NavBar { /* page-specific methods */ }
```

**Playwright Fixtures:** Use `test.extend<T>()` when multiple tests need the same setup (logged-in page, created resource, cleanup). Fixtures compose page objects automatically — the fixture logs in, navigates, and returns a ready-to-use page object. This keeps spec files free of setup code. Copy `resources/base-fixture.ts` for the template.

**Typical composition pattern:**
```ts
dashboardPage: async ({ page, adminUser }, use) => {
  await page.setExtraHTTPHeaders(getAdminHeaders(adminUser)); // auth in fixture
  await page.goto(`${process.env.E2E_BASE_URL}/admin/dashboard`);
  const dashboard = new DashboardPage(page);
  await dashboard.waitForLoad();                              // POM encapsulates readiness
  await use(dashboard);                                       // spec receives ready object
}
```

**Minimal fixture (skip POM until needed):** For early-stage suites, a two-fixture file is enough:
```ts
// __tests__/__fixtures__/base.fixture.ts
import { test as base, expect } from "@playwright/test";
import { getBypassHeaders, getSuperAdmin, type TestUser } from "../helpers/auth";

type AuthFixtures = {
  superAdmin: TestUser;
  authedPage: import("@playwright/test").Page;
};

export const test = base.extend<AuthFixtures>({
  superAdmin: async ({}, use) => { await use(getSuperAdmin()); },
  authedPage: async ({ page, superAdmin }, use) => {
    await page.setExtraHTTPHeaders(getBypassHeaders(superAdmin));
    await use(page);
  },
});

export { expect };
```

Spec files then import `test, expect` from this fixture file and get authed sessions for free.

---

### Step 0.5: Feature-Folder Organization (default from day 1)

**Two load-bearing rules, applied to every project:**

1. **Every E2E `*.test.ts` / `*.spec.ts` file lives under a `__tests__/` (or `tests/` / `e2e/`) wrapper.** Never scattered as `<app>/booking.test.ts` at the app's root next to `next.config.ts`, and never co-located with `src/` source files (no `src/agencies/agencies.test.ts`). For a standalone E2E repo, the wrapper IS `__tests__/` at the repo root — that's normal. For a frontend repo with E2E inside, the wrapper is `__tests__/` (or `__tests__/e2e/`) inside the app repo. Either way: one wrapper, all specs inside it.
2. **Inside the wrapper, group by feature from the very first spec.** Do not let a flat `__tests__/<feature>.test.ts` shape accumulate — flat suites that grow past ~10 specs typically need a painful refactor (selectors duplicated across files, no obvious owner per area, fixture bloat). Pages, tests, fixtures, and plans all sit under `<feature>/` subdirectories.

**Why one wrapper folder and not co-located:** E2E tests need their own dependency graph (`@playwright/test`, dotenv, faker), their own tsconfig (`@playwright/test` types vs the app's `dom` lib), their own ESLint scope (Playwright fixtures' `use(...)` callbacks trip React-Hooks rules), and their own folder for traces / reports. Scattering `*.test.ts` next to source files forces all of that into the app's configs and pollutes diff reviews. One wrapper folder makes the boundary obvious and the tooling clean.

**Pick the wrapper name based on what the project already documents:** check `CLAUDE.md`, `AGENTS.md`, `project-structure.md`. If the project documents `__tests__/`, use that. If it documents `tests/` or `e2e/`, use that. If nothing is documented, default to `__tests__/` for MOL projects. **Never invent a second wrapper** — if `__tests__/` already exists, don't create `e2e/` as a sibling.

**One unified internal layout, two locations.** The internal organisation of the E2E suite is **identical** between Shape A and Shape B — same top-level folders, same `__tests__/` pattern, same naming. The *only* difference is **where the root of that layout sits**:

- **Shape A:** at the repo root (the repo IS the E2E suite — typically a dedicated `<app-name>-e2e` repo with no application code alongside).
- **Shape B:** at `<app-repo>/__tests__/e2e/` (the app repo hosts E2E inside it — typically a Next.js / React frontend repo with E2E nested under `__tests__/`).

This is a deliberate change from earlier versions of this skill: one pattern is easier for every team to learn, review, and migrate between. Don't invent a variant unless the project's existing layout forces it.

#### The unified internal layout

This block describes the structure that BOTH shapes use, anchored to a placeholder `<base>/`:

```
<base>/                            ← Shape A: repo root; Shape B: <app>/__tests__/e2e/
├── playwright.config.ts
├── package.json                   ← Playwright deps live here (no nested package.json)
├── tsconfig.json
├── eslint.config.mjs              ← E2E-only lint rules (relax react-hooks for fixture use())
├── checklist-test-cases/          ← TC plans (Step 5)
│   ├── 00-progress-checklist.md
│   ├── <feature-1>-checklist.md
│   └── <feature-2>-checklist.md
├── pages/                         ← Page Objects, by feature — TOP-LEVEL
│   ├── components/                ← shared chrome (NavBar, PaginatedTable, modals)
│   ├── admin/<Page>.ts
│   ├── citizen/<Page>.ts
│   └── <feature>/<Page>.ts
├── support/                       ← cross-feature primitives — called "support", NOT "helpers"
│   ├── apis/                      ← per-domain API wrappers (http.ts, agency-groups.ts, …)
│   ├── const/                     ← shared constants (test IDs, route paths)
│   ├── setup/                     ← global setup hooks (DB seeders, schema migrations)
│   ├── types/                     ← cross-feature TypeScript types
│   └── users/                     ← role-typed test users (admin, citizen, …)
├── config/                        ← env files (.env.dev, .env.uat — gitignored secrets)
├── params/                        ← OPTIONAL: MOL params (deployment-time substitutions)
├── docs/                          ← OPTIONAL: E2E playbook, glossary, ADRs
├── reporters/                     ← OPTIONAL: custom JSON/HTML reporters
└── __tests__/                     ← spec files ONLY (and __fixtures__/) — by feature
    ├── __fixtures__/
    │   └── base.fixture.ts        ← global authedPage + role-typed user fixtures
    └── <feature>/
        ├── <subfeature>/
        │   └── *.spec.ts          ← e.g. <base>/__tests__/admin/dashboard/dashboard.spec.ts
        └── ...
```

**Why this shape:** `pages/`, `support/`, and `__tests__/` are the three pillars. Specs import via `pages/...` and `support/...` aliases configured in `tsconfig.json`'s `paths` and `playwright.config.ts`'s test setup. The `__fixtures__/base.fixture.ts` convention follows Jest's `__fixtures__` precedent and keeps cross-feature fixtures discoverable. `__tests__/` is **only ever** spec files + their `__fixtures__/` sibling — never `package.json`, never `pages/`, never `support/`. This invariant is what makes the shape easy to grep, review, and migrate.

#### Shape A — Standalone E2E repo

Anchor the layout above at the **repo root**. Typical naming: a dedicated `<app-name>-e2e` repo that ships only tests (no application source).

```
<app-name>-e2e/                    ← <base>/ = repo root
├── playwright.config.ts
├── package.json
├── pages/, support/, …            ← (see unified layout above)
└── __tests__/<feature>/<sub>/*.spec.ts
```

#### Shape B — E2E nested inside an app repo

Anchor the same unified layout at **`<app-repo>/__tests__/e2e/`**. The app's root stays clean — `next.config.ts`, `eslint.config.mjs`, app `package.json` — and everything Playwright owns lives inside `__tests__/e2e/`. Typical context: a frontend app repo (Next.js / React) where `__tests__/` is the conventional location for test code.

**Why `__tests__/e2e/` and not just `__tests__/`:** `__tests__/` is the parent test folder — it may host more than just E2E. Many MOL repos have `__tests__/api/`, `__tests__/functional/`, `__tests__/perf/` as siblings, each with their own runner and deps. Putting Playwright's `package.json`, `tsconfig.json`, and `playwright.config.ts` directly under `__tests__/` would clash with those siblings. Nesting everything Playwright owns inside `__tests__/e2e/` keeps each test type fully self-contained.

```
<app-repo>/
├── src/...                        ← application code — NEVER contains *.spec.ts E2E specs
├── package.json                   ← app's own; add ONLY delegating test:e2e scripts here
├── next.config.ts                 ← app config — untouched by E2E setup
└── __tests__/                     ← parent test folder — may host MULTIPLE test types as siblings
    ├── api/                       ← OPTIONAL sibling — API tests (Jest + supertest, etc.)
    ├── functional/                ← OPTIONAL sibling — functional tests (own config, own deps)
    ├── perf/                      ← OPTIONAL sibling — k6, artillery, etc.
    └── e2e/                       ← <base>/ — Playwright E2E lives ENTIRELY here, self-contained
        ├── playwright.config.ts
        ├── package.json
        ├── tsconfig.json
        ├── eslint.config.mjs
        ├── checklist-test-cases/
        ├── pages/                 ← Page Objects, by feature
        ├── support/               ← apis/, const/, users/, types/, setup/
        ├── config/
        └── __tests__/             ← yes, an INNER __tests__/ — specs only
            ├── __fixtures__/
            │   └── base.fixture.ts
            └── <feature>/<subfeature>/*.spec.ts
                                   ← e.g. __tests__/e2e/__tests__/admin/dashboard/dashboard.spec.ts
```

**The intentional double `__tests__/`:** the outer `__tests__/` is the app repo's "all tests" parent (siblings: api, functional, perf, e2e). The inner `__tests__/` is the unified internal layout's spec folder. They serve different purposes at different levels, and keeping the inner one as `__tests__/` (rather than renaming it) is what gives Shape A and Shape B *identical* internals — same `__tests__/<feature>/<sub>/*.spec.ts` path, same `__tests__/__fixtures__/base.fixture.ts`. The full path in Shape B is `__tests__/e2e/__tests__/<feature>/...`, which reads as "tests / e2e / specs / feature".

**Legacy `tests/` variant:** some older repos use an inner `tests/` folder (`__tests__/e2e/tests/<feature>/` with POMs in `__tests__/e2e/tests/page-objects/`) instead of the inner `__tests__/`. That predates this skill's unified pattern. When working in such a repo, leave the existing `tests/` content where it is; new features land in `__tests__/e2e/__tests__/<feature>/` per the unified pattern. Don't migrate the legacy specs unless explicitly asked — incremental adoption is fine.

#### One layout, two anchors — recap

| Concern                                | Shape A (standalone)                                 | Shape B (nested in app)                                            |
| -------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| `<base>/` =                            | repo root                                            | `<app>/__tests__/e2e/`                                             |
| `playwright.config.ts`                 | `playwright.config.ts`                               | `__tests__/e2e/playwright.config.ts`                               |
| `package.json`                         | `package.json`                                       | `__tests__/e2e/package.json`                                       |
| Page Objects                           | `pages/<feature>/<Page>.ts`                          | `__tests__/e2e/pages/<feature>/<Page>.ts`                          |
| Cross-feature helpers                  | `support/{apis,const,users,types,setup}/`            | `__tests__/e2e/support/{apis,const,users,types,setup}/`            |
| Cross-feature fixture                  | `__tests__/__fixtures__/base.fixture.ts`             | `__tests__/e2e/__tests__/__fixtures__/base.fixture.ts`             |
| Per-feature fixture                    | `__tests__/<feature>/__fixtures__/<feature>.fixture.ts` | `__tests__/e2e/__tests__/<feature>/__fixtures__/<feature>.fixture.ts` |
| Specs                                  | `__tests__/<feature>/<sub>/*.spec.ts`                | `__tests__/e2e/__tests__/<feature>/<sub>/*.spec.ts`                |
| Plans                                  | `checklist-test-cases/<feature>-checklist.md`        | `__tests__/e2e/checklist-test-cases/<feature>-checklist.md`        |

The internal columns are IDENTICAL except for the `__tests__/e2e/` prefix in Shape B. **Don't introduce variants** — no `helpers/` in place of `support/`, no `fixtures/` parallel to `__tests__/__fixtures__/`, no flat-suite shape skipping the inner `__tests__/`.

**Per-feature fixture pattern:** each `<feature>/__fixtures__/<feature>.fixture.ts` extends `__tests__/__fixtures__/base.fixture.ts`, adds POM instantiation, and seeds feature-specific data. Specs inside the feature folder import `test, expect` from the feature fixture — not from `@playwright/test` (except auth-boundary tests, which need an unauthenticated page).

**The exception (suite < 10 tests, single feature):** specs may live flat under `__tests__/<feature>/*.spec.ts` (no `<sub>` directory) IF growth is genuinely not expected. Still scaffold `checklist-test-cases/<feature>-checklist.md` — that's cheap and gives the team a coverage record.

**For the full worked example, the migration path from a flat suite, and the size → shape decision matrix, read `references/feature-folders.md`** when scaffolding a new feature folder OR when the existing layout is flat and you suspect it should be split.

**Anti-pattern (do not produce — paths shown as Shape A, but the same anti-pattern applies under `__tests__/e2e/` in Shape B):**
```
<base>/__tests__/
├── agencies.spec.ts        ← 300+ lines, all CRUD + auth + edge cases (no <feature>/ subdir)
├── users.spec.ts           ← same; selectors duplicated with agencies.spec.ts
└── helpers/...             ← wrong folder — helpers belong in support/, not __tests__/
```

---

### Step 1: Auth Helper Generation

Detect how the app authenticates users before writing a single spec. **Never guess — read the code.**

#### Detection (run all four searches in parallel)

1. **Token storage** — grep `src/` for `localStorage.setItem(` to find JWT storage
2. **Login endpoint** — grep server routes for a POST handler whose path contains `login` or `auth`
3. **Bypass headers** — grep tests/config for `setExtraHTTPHeaders`, `mol-token-bypass`, `TOKEN_BYPASS`, `wog-user-id`
4. **OAuth/API libraries** — grep deps/auth middleware for `cognito`, `msal`, `passport`, `oidc`, `singpass`, `auth-forwarder`, `x-api-key`

Map to a pattern:

| Finding                                                                | Pattern                        |
| ---------------------------------------------------------------------- | ------------------------------ |
| `localStorage.setItem(` found in frontend source                       | **A — JWT in localStorage**    |
| `Set-Cookie` / session middleware in server login handler              | **B — Session cookie**         |
| `mol-token-bypass` / `TOKEN_BYPASS` / `setExtraHTTPHeaders` references | **C — MOL header bypass**     |
| OAuth/Cognito/Singpass/OIDC/`auth-forwarder`, no bypass found          | **D — OAuth via storageState** |
| `x-api-key` / `Authorization: ApiKey` in server middleware             | **E — API key**                |

**Apps frequently match BOTH C and D** — they support real OAuth in production but allow a header bypass in test envs. Always confirm with the user which the test env supports; Pattern C is faster and more deterministic when available.

If no clear result, ask ONE question via AskUserQuestion:
> "How does your app authenticate users in tests? (a) JWT in localStorage, (b) Session cookie, (c) MOL header bypass with mol-token-bypass, (d) Real OAuth/SSO, (e) API key header"

**Once the pattern is identified, read `references/auth-patterns.md`** — it contains, for each pattern, the file to copy, the values to fill in, role-specific notes (Pattern C covers 7 user types), and the multi-role-credentials decision tree. Do not read sections for patterns other than the one you identified — keeps context lean.

**Universal rules (apply to all patterns):**
- Set headers/cookies/tokens **only inside a fixture** — never `setExtraHTTPHeaders()` in spec files.
- Source every credential from `process.env.E2E_*` (or `TEST_*`) — never hardcode.
- For Pattern D (OAuth), add `e2e/.auth/` to `.gitignore` — state files contain session tokens.
- For Pattern C local-dev: `mol-token-bypass: true` is a common sentinel value when the backend trusts any truthy bypass token. Confirm with the backend team before assuming.
- Provide a `.env.example` (committed) AND a `.env` / `.env.e2e` (gitignored). Document what each var means and where to source the value from.

---

### Step 1.5: API Helper Layout (graduates as the suite grows)

**Tiny project (≤ 3 endpoints):** Inline `request.post()` calls in test files are fine — don't over-engineer.

**Small project (≤ 5 API helpers):** A single `support/api.ts` is fine. Same path under both shapes (Shape A: `<repo>/support/api.ts`; Shape B: `<app>/__tests__/e2e/support/api.ts`).

**Medium / growing:** Restructure into one file per domain — the highest-scaling pattern for growing API surfaces. Paths shown anchored to `<base>/` (Shape A: repo root; Shape B: `<app>/__tests__/e2e/`):
```
<base>/
├── support/
│   ├── env.ts                  ← E2E_BASE_URL, E2E_BACKEND_URL, backendApiUrl()
│   ├── auth.ts                 ← shared header builder + role-specific user factories
│   ├── const/
│   ├── types/
│   ├── users/                  ← role-typed test users (admin, citizen, …)
│   └── apis/
│       ├── http.ts             ← apiPost / apiPatch / apiDelete wrappers
│       ├── agency-groups.ts    ← all /v1/agency-groups/* operations
│       ├── users.ts            ← all /v1/user/* operations
│       └── files.ts            ← all /v1/files/* operations
└── __tests__/
    └── __fixtures__/
        └── base.fixture.ts     ← `test`, `expect`, `authedPage`, role-typed user fixtures
```

Each domain file:
- Imports the shared HTTP wrappers from `http.ts` (which encapsulates auth + backend URL)
- Exports typed functions: `createAgencyGroup(name, { user, request })`, `deleteUser(id, { user, request })`
- Includes a `uniqueX(prefix)` helper for collision-resistant test data: `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}`

Spec files import only what they need — use `pages/...` and `support/...` aliases from `tsconfig.json` `paths`:
```ts
import { test, expect } from "__fixtures__/base.fixture";
import { createAgencyGroup, deleteAgencyGroups, uniqueAgencyName } from "support/apis/agency-groups";
import AgencyListPage from "pages/admin/AgencyListPage";
```

For this to work, `tsconfig.json` should include:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "pages/*":         ["pages/*"],
      "support/*":       ["support/*"],
      "__fixtures__/*":  ["__tests__/__fixtures__/*"]
    }
  }
}
```

**Match the contract.** If the app has an OpenAPI/Swagger spec (`api-definitions/*.json`), mirror the real request body shape — don't invent fields. If a generated API client exists in `src/`, use it as a reference for paths and types BUT do not import from `src/` in test helpers (would pull in axios config, auth interceptors, and other app baggage). Hand-write thin wrappers.

**GraphQL apps:** copy `resources/graphql-helper.ts` → `support/apis/graphql.ts` and call `gqlQuery<T>(query, variables, { workspaceId, additionalHeaders })` from domain files instead of `page.request.post`. Pair with `graphql-codegen` for typed query documents.

---

### Step 2 — Database State Management

**Decision tree:**
```
Read-only/smoke-only suite?                    → Pattern 3 (shared seed)
Small suite (≤ ~30 tests) or any DB stack?     → Pattern 1 (API-driven teardown)
Larger suite or need parallelism?              → Pattern 2 (per-worker schema) — PostgreSQL only
```

**Pattern 1 — API-driven setup + teardown**

Each test creates data via the API and deletes it after. Use a unique suffix (`Date.now()`) plus a random number to prevent collision from orphaned rows.

```ts
const createdIds: string[] = [];

test.afterEach(async ({ request, superAdmin }) => {
  if (createdIds.length === 0) return;
  await deleteAgencyGroups(createdIds.splice(0), { request, user: superAdmin });
});

test("creates an agency", async ({ authedPage, request, superAdmin }) => {
  const agency = await createAgencyGroup(uniqueAgencyName(), { request, user: superAdmin });
  createdIds.push(agency.id);
  // …drive the UI…
});
```

**Config:** `workers: 1`, `fullyParallel: false`

**Defensive teardown:** Use `splice(0)` or `pop()` loops in `afterEach` so a partially-failed test still cleans up everything it created.

**Pattern 2 — Per-worker PostgreSQL schema isolation**

Copy `resources/db-fixture.ts` → `e2e/fixtures/db.ts`. Implement `runMigrations()` and `seedSchema()`. Import `test` from this file in every spec instead of `@playwright/test`.

**Config:** `workers: process.env.CI ? 4 : 2`, `fullyParallel: true`

**Orphan cleanup:** run `resources/cleanup-orphaned-schemas.sql` before each CI job to remove schemas left by crashed workers.

**Pattern 3 — Shared seed (read-only flows)**

For smoke tests that only read, point at a stable seed dataset in the test env and assert known invariants (e.g. "dashboard shows ≥ 1 agency"). No setup/teardown. Only valid when **no** test creates/mutates data.

**Worker-scoped reference data (add-on to either Pattern 1 or 2)**

When many tests share a **read-only or read-mostly** parent entity (one service, one usecase, one workspace), create it once per worker instead of once per test:
```ts
export const test = base.extend<{}, { service: Service }>({
  service: [async ({}, use) => {
    const s = await createService({ name: `worker-${test.info().workerIndex}-svc` });
    await use(s);
    await deleteService(s.id);
  }, { scope: 'worker', auto: true }],
});
```
**Critical constraint:** tests must not mutate this shared entity. Reserve worker-scoped data for the *parent* of the thing under test (the service that holds the bookings, not the bookings themselves). If a test needs to mutate it, fall back to test-scoped creation.

---

### Step 3 — Writing Spec Files

**Standard structure (note the `tag` on `describe` and the user-defined test-case ID prefix on every test title — sequential `TC No N` shown below; substitute `AGEN-001` / `BOOK-001` / etc. if that's the project's scheme):**
```ts
import { test, expect } from "__fixtures__/base.fixture";
import { createAgencyGroup, deleteAgencyGroups, uniqueAgencyName } from "support/apis/agency-groups";

test.describe("Agencies CRUD", { tag: "@Agencies" }, () => {
  const createdIds: string[] = [];

  test.afterEach(async ({ request, superAdmin }) => {
    if (createdIds.length === 0) return;
    await deleteAgencyGroups(createdIds.splice(0), { request, user: superAdmin });
  });

  test("TC No 1: Super admin sees a created agency in the card list", async ({ authedPage, request, superAdmin }) => {
    const name = uniqueAgencyName();
    const agency = await createAgencyGroup(name, { request, user: superAdmin });
    createdIds.push(agency.id);

    await authedPage.goto("/agencies");
    await expect(authedPage.getByTestId("agencies-card-list")).toBeVisible();
    await expect(authedPage.getByText(name)).toBeVisible();
  });
});
```

- `TC No 1` ↔ the `TC No 1` line in `checklist-test-cases/agencies-checklist.md` — same ID, same description. (For projects using a different ID scheme, substitute consistently — e.g. `AGEN-001` in both places.)
- `tag: "@Agencies"` on the describe block means every test inside inherits the `@Agencies` tag — enables `npx playwright test --grep @Agencies`.

**Selector priority** — check the project's own conventions first (some projects mandate `getByTestId` for content; others prefer `getByRole`). When in doubt:

1. `getByTestId('agencies-card-list')` — most resilient; **preferred when the project already has `*_TEST_IDS` constants** (reuse the literal strings)
2. `getByRole('button', { name: /submit/i })` — for interactive elements without test IDs
3. `getByLabel(/agency name/i)` — form fields
4. `getByText(/visible text/i)` — unique static content
5. `getByPlaceholder(/search/i)` — inputs without labels
6. `locator('[data-testid="xyz"]')` — when the wrapping fixture or DOM structure forces it
7. **Never** CSS class selectors (`.MuiCard-root`, `[class*="Card"]`)

**Chain and filter locators** to scope searches and avoid false matches:
```ts
await page.getByRole("listitem").filter({ hasText: "Order #42" })
  .getByRole("button", { name: /cancel/i }).click();
```

**Web-first assertions** — wait and retry automatically (never use `.isVisible()` then `expect()`):
```ts
// ✓ Retries until visible or times out
await expect(page.getByText("Booking confirmed")).toBeVisible();
await expect(page).toHaveURL(/\/confirmation/);

// ✗ No retry — flaky on slow servers
expect(await page.getByText("Booking confirmed").isVisible()).toBe(true);
```

**Soft assertions** — collect all failures before ending the test (useful for full-form validation):
```ts
await expect.soft(page.getByTestId("status")).toHaveText("Confirmed");
await expect.soft(page.getByTestId("date")).toBeVisible();
// Test continues; all failures reported together
```

**Test data generation** — use `@faker-js/faker` for unique, realistic data:
```ts
import { faker } from "@faker-js/faker";
const name = faker.person.fullName();  // unique per run — no collision risk
```

**Reuse the project's TEST_ID constants** — when `src/constants/<feature>.constants.ts` already exports an `AGENCIES_TEST_IDS` object, prefer using the literal string values (`"agencies-card-list"`) over re-importing the constants (avoids leaking app code into the test folder). Or, if the team prefers, duplicate the constants under `__tests__/e2e/constants/` — but pick a convention and stay consistent.

---

### Step 4 — Test Tagging (required habit on every describe/test)

**Every `test.describe` block — and every standalone `test` outside a describe — gets at least a feature tag.** This is a convention, not an optimisation. Cheap to add up front; expensive to retrofit later (you have to grep+edit every spec). Two payoffs:

- **Selective runs.** `npx playwright test --grep @Agencies` runs one feature in isolation — invaluable while developing or debugging a flaky area.
- **CI failure triage.** A failure tagged `@Agencies @Auth @Create` tells you the feature, dimension, and action in one line of report output.

**Two-tier scaling:**

| Suite shape                         | Tagging approach                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| **1–2 features, < 20 tests**        | Inline string literals: `{ tag: "@Agencies" }` on each describe. No helper file. |
| **3+ features OR growing**          | Copy `resources/tags.const.ts` → `support/tags.const.ts`. Use enum + `toTag()`. |

**Small-suite shape (string literal):**
```ts
test.describe("Agencies", { tag: "@Agencies" }, () => {
  test("TC No 1: Super admin creates an agency", async ({ authedPage }) => { /* ... */ });
});
```

**Growing-suite shape (typed enums — no magic strings, composable `--grep`):**
```ts
import { toTag, UserTypeTag, FeatureTag, ActionTag } from "../../helpers/tags.const";

test.describe("Agencies", { tag: toTag(FeatureTag.AGENCIES) }, () => {
  test("TC No 1: Super admin creates an agency",
    { tag: toTag([UserTypeTag.SUPER_ADMIN, ActionTag.CREATE]) },
    async ({ authedPage }) => { /* ... */ });
});
```

Playwright **merges** describe-level tags with test-level tags — the inner test inherits `@Agencies` from the describe and adds `@SuperAdmin @Create` of its own.

**Run subsets (composable lookahead grep):**
- All agencies tests: `npx playwright test --grep @Agencies`
- Super admin creation only: `npx playwright test --grep "(?=.*@SuperAdmin)(?=.*@Agencies)(?=.*@Create)"`

**Convention summary:** describe ≥ 1 feature tag; tests inherit and may add user-type / action tags. A spec file with zero tags fails the acceptance criteria.

---

### Step 5 — Plan Document (the contract between user, specs, and CI)

Every feature gets a markdown plan at `checklist-test-cases/<feature>-checklist.md` (the path is unchanged from earlier versions of this skill — it's the *content* that's grown). The plan is the single artifact that ties intent ↔ tests ↔ CI failures together.

The plan does three jobs:

| Job                       | Who benefits                | How                                                                                          |
| ------------------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| **Capture intent**        | User, reviewers, future-you | Markdown is cheap to review and revise *before* any code is generated                        |
| **Drive code generation** | The agent                   | Each scenario maps 1:1 to a test whose title starts with the scenario's ID; Steps + Expected Results → assertions |
| **Triage failures**       | On-call, CI consumers       | "BOOK-007 failed" → grep the plan once and read the human-readable scenario                  |

#### When to write the plan

Whenever the user asks to add tests for a new feature, **draft the plan first** and confirm scope with the user before generating any `.spec.ts`. If the plan already exists for a feature, extend it with new scenarios — preserving whatever ID scheme is already in use.

#### Test-case IDs are user-defined

Each scenario carries a **test-case ID** that the user (or the team's convention) chooses. The skill does **not** auto-generate sequential numbers — those are one valid scheme among many.

**Common schemes you'll see in MOL projects:**

| Scheme                   | Example IDs                              | When to use                                                                   |
| ------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------- |
| Sequential per feature   | `TC No 1`, `TC No 2`, …                  | New suites; small features; nothing else to align to                          |
| Feature-prefixed         | `AGEN-001`, `AGEN-002`, `BOOK-001`       | Many features; the prefix makes a global grep across all plans unambiguous    |
| Jira / ticket-aligned    | `MOL-1234`, `BUG-21046-regression`       | When TCs are tracked in Jira and you want CI logs to link straight back       |
| Slug-style               | `super-admin-create-agency`, `unauth-redirect-agencies` | When the team prefers self-describing IDs over numeric ones    |

**Ask the user, don't impose.** Before scaffolding a new plan, check:

1. Does the project already have plans in `checklist-test-cases/`? If yes → mirror whatever scheme they use, exactly.
2. Did the user specify an ID for any scenario in their request? (e.g. "add a regression for BUG-21046", "TC AGEN-005 should cover...") → take that as the user's chosen scheme.
3. Otherwise, ask once: "What ID scheme would you like? (a) sequential `TC No 1`…, (b) feature-prefixed like `AGEN-001`, (c) Jira-aligned, (d) custom — you supply." Recommend (a) for tiny suites, (b) for anything that might grow.

Once an ID scheme is chosen for a feature, **stick to it.** Don't mix `TC No 1` with `AGEN-002` in the same plan.

#### Plan structure (copy from `resources/checklist-templates/feature-checklist.md`)

```markdown
# <Feature> — Test Plan

## Overview
<2–4 sentence description of the feature: what it does, who uses it, what makes it E2E-worthy.>

## Seed
- **Fixture:** `__tests__/__fixtures__/base.fixture.ts` (Shape A) or `__tests__/e2e/__tests__/__fixtures__/base.fixture.ts` (Shape B); per-feature plans may use `__tests__/<feature>/__fixtures__/<feature>.fixture.ts`
- **Auth pattern:** <C — MOL header bypass / D — OAuth storageState / etc.>
- **Roles needed:** <super admin, regular admin, citizen, …>
- **DB pattern:** <Pattern 1 — API teardown / Pattern 2 — schema-per-worker / Pattern 3 — read-only seed>
- **ID scheme:** <Sequential / Feature-prefixed (AGEN-NNN) / Jira-aligned / Slug-style>  ← record once, follow throughout

## Scenarios

### <ID>: <descriptive sentence>  — tags: `@<Feature> @SuperAdmin @Create`
- [ ] Status

**Steps:**
1. <action — one line per step, written as the tester would type>
2. <…>

**Expected results:**
- <observable, verifiable outcome — one line per assertion>
- <…>

### <ID>: <descriptive sentence>  — tags: `@<Feature> @Auth`
- [ ] Status

**Steps:**
1. <…>

**Expected results:**
- <…>
```

Where `<ID>` is whatever the chosen scheme produces — e.g. `TC No 1`, `AGEN-001`, `BUG-21046-regression`, `super-admin-create-agency`. The skill writes the literal ID verbatim; it does **not** auto-increment.

The `- [ ] Status` row keeps the progress-tracking primitive from earlier versions of this skill. Flip it to `- [x]` only once the corresponding test exists AND has passed at least once.

#### Test-case ID — load-bearing rules

- **Unique within a plan.** Two scenarios can't share an ID — that breaks the plan↔spec contract.
- **Stable.** Never rename an ID once a spec references it. Renaming rewrites the past — historic CI logs, PR comments, Jira links stop matching. If the descriptive sentence drifts, update both the plan AND the spec title in the same change; keep the ID alone.
- **Verbatim match.** The spec file's `test("…")` title starts with `<ID>: <descriptive sentence>` — exact same ID, exact same sentence. Whitespace and punctuation count.
- **Grep-friendly.** Avoid spaces inside the ID itself (`TC No 1` has spaces but is grep-friendly because the full prefix `TC No 1:` is unique; `AGEN-001` is even better). If picking a custom scheme, prefer dash-separated alphanumerics.

#### Spec ↔ plan provenance comment (borrowed from Playwright Test Agents)

Every generated spec file begins with two header comments pointing back at the plan and the fixture that satisfies its seed:

```ts
// plan:    checklist-test-cases/agencies-checklist.md
// fixture: __tests__/__fixtures__/base.fixture.ts

import { test, expect } from "__fixtures__/base.fixture";

test.describe("Agencies", { tag: "@Agencies" }, () => {
  // ID scheme for this plan: feature-prefixed (AGEN-NNN)
  test("AGEN-001: Super admin creates an agency and sees it in the card list", async ({ ... }) => { /* ... */ });
  test("AGEN-002: Agency card renders non-empty name from real API response",  async ({ ... }) => { /* ... */ });
});
```

Anyone landing in a failing test file can jump straight to the plan to understand intent — no archaeology, no reading the test code to figure out *what user-visible behaviour* was meant.

#### Workflow (per feature)

1. **Draft the plan.** Copy the template, fill Overview + Seed (including the chosen ID scheme) + 5–10 scenarios with Steps and Expected Results. Cover: user journey, real-server response fidelity, auth boundary (unauthenticated + wrong-role), failure modes (not-found, empty state), known regressions.
2. **Confirm with the user.** Surface the plan markdown. Ask if scenarios are missing, if any should be cut, whether the roles + DB pattern fit, and whether the ID scheme matches the team's convention. **Do not write tests until the user has signed off** — that's the whole point of plan-first.
3. **Generate specs.** One test per scenario. Mirror Steps as code; mirror Expected Results as assertions. Add the `// plan:` / `// fixture:` headers. Inline `// 1.` / `// 2.` step comments matching the plan. Test title format: `<ID>: <descriptive sentence>` — exactly as in the plan.
4. **After the test passes** (see Step 6), flip its `- [ ]` to `- [x]` and update `00-progress-checklist.md`.
5. **Skipped tests** — move them to the `## Skipped Tests` section in `00-progress-checklist.md` with a one-line reason. Skipped ≠ missing. Keep the ID stable.

For a full worked example (plan + matching specs + healer notes), read `references/plan-and-heal.md`.

**Why the agent owns this and not a sub-agent:** keeps the loop tight — the same turn that writes a test updates the plan and the aggregate. A separate sub-agent re-reads context just to flip a checkbox. The healer pass (Step 6) is also kept inline for the same reason.

---

### Step 6 — Verify & Heal (one healer pass before declaring done)

Borrowed from Playwright's healer agent — but capped at one pass to keep the loop predictable. Inspired by how Playwright Test Agents' healer "replays failing steps, inspects the current UI, suggests patches".

#### When this step runs

After Step 5's specs are written, **run them before reporting the task as complete.** Don't hand the user broken specs and ask them to debug — the agent saw the app's state when authoring, and a fresh run is the cheapest possible feedback signal.

#### The pass

```bash
# From the directory where playwright.config.ts lives:
npx playwright test --grep @<Feature> --reporter=line
```

If everything passes → flip the `- [ ]` rows in the plan to `- [x]`, update `00-progress-checklist.md`, done.

If one or more tests fail → triage:

| Symptom                                          | Likely cause                  | Healer action                                                                                       |
| ------------------------------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| `locator.click: ... not found`                   | Selector mismatch             | Re-inspect the DOM (`page.locator(...).all()`, or open a paused page); pick a more resilient role/testid; update the spec |
| Test times out on `expect(...).toBeVisible()`    | Timing / hidden behind nav    | Add a precondition step (e.g. wait for nav to finish loading) or increase `expect.timeout` for that one assertion |
| Assertion fails with unexpected value            | Plan's Expected Results wrong | Re-read the plan: did the user describe the wrong outcome? Either fix the spec assertion OR flag the plan for the user to clarify (don't silently change Expected Results) |
| Auth-boundary test redirects but to wrong path   | Login route mismatch          | Check the actual redirect URL; update the assertion's regex                                          |
| Test fails because the data isn't there          | DB pattern setup gap          | Look at the fixture's `beforeEach` / API setup — likely missing a seed row                          |

#### The cap — exactly one healer pass

After one pass of fixes, re-run the failing tests. If they pass → done. If they still fail AND the test logic is correct → mark with `test.fixme()` and a one-line comment explaining what's happening instead of expected:

```ts
test.fixme("TC No 5: Renamed agency does not reappear after closing the modal", async ({ ... }) => {
  // BUG-21046: modal close emits stale agency name after rename; expected: name updates immediately.
  // …spec body unchanged…
});
```

`test.fixme` keeps the test in the suite (it counts towards plan progress as a known issue) without failing CI. Add a row under `## Skipped Tests` in `00-progress-checklist.md` referencing the bug.

**Why one pass, not infinite:** the healer loop is a productivity multiplier *when the diagnosis is fast*. If a fix doesn't land on the first try, something deeper is wrong — a wrong fixture, an unmet DB precondition, a misunderstanding of the feature. At that point the right action is to ask the user, not to keep flailing.

#### What NOT to do in a healer pass

- Don't change the plan's Expected Results silently. If the spec assertion is wrong because the plan was wrong, surface that to the user.
- Don't add `page.waitForTimeout(...)` — it's the textbook anti-pattern. Always replace it with a `await expect(...)` that retries.
- Don't replace `getByRole/getByTestId` with CSS class selectors just because they "happen to match". Use the selector priority list in Step 3.
- Don't broaden a regex assertion (`/foo/i` → `/.*foo.*/`) to make it pass — that hides real bugs.

For a worked example of a healer pass on a flaky locator and on a stale fixture, read `references/plan-and-heal.md`.

---

## Anti-Patterns

| Anti-pattern                                                  | Why it fails                                                | Correct approach                                                                |
| ------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `page.route()` in E2E tests                                   | Backend bugs go undetected                                  | Hit the real server                                                             |
| `page.waitForTimeout(2000)`                                   | Flaky on slow CI                                            | `await expect(locator).toBeVisible({ timeout: 10_000 })`                        |
| CSS class selectors (`.CardTitle`)                            | Breaks on refactor                                          | `getByTestId`, `getByRole`, `getByLabel`, `getByText`                           |
| Hardcoded credentials in spec files                           | Security risk; breaks on rotation                           | `process.env.E2E_*` [CRITICAL]                                                  |
| `expect(await locator.isVisible()).toBe(true)`                | No auto-retry; flaky on slow loads                          | `await expect(locator).toBeVisible()`                                           |
| `setExtraHTTPHeaders` called in spec files                    | Auth logic scattered; hard to change                        | Encapsulate in a Playwright fixture                                             |
| Auth helper called in unauthenticated tests                   | Invalidates the test — masks the real gate                  | Never call any auth helper in auth boundary test A; import `base` directly      |
| Tests sharing mutable DB state                                | One test's write breaks another                             | `beforeEach`/test-body setup + `afterEach` teardown                             |
| Testing only the happy path                                   | Auth and resilience bugs ship silently                      | Add TCs covering unauth redirect, wrong-role access, not-found, and known regressions |
| Single `baseURL` when frontend + backend on different hosts   | API calls hit the frontend instead of the backend           | Add `E2E_BACKEND_URL`; API helpers return absolute URLs                         |
| `dotenv.config()` without `override: true`                    | Root `.env` (NEXT_PUBLIC_*, etc.) shadows test env silently | `dotenv.config({ path, override: true })` in `playwright.config.ts`             |
| Playwright deps in app's `package.json`                       | Pollutes prod dep graph; slows down `npm ci`                | Independent `__tests__/package.json` + delegating root scripts                  |
| Parent ESLint config flags Playwright fixtures                | `use(...)` callback misread as React Hook violation         | Add `__tests__/**` to parent `globalIgnores`                                    |
| Importing from `src/` inside E2E helpers                      | Pulls in app config, axios interceptors, auth state         | Hand-write small wrappers; mirror types only, don't import them                 |
| Overwriting existing `test` script (Jest/Vitest)              | Breaks unit-test workflow                                   | Namespace as `test:e2e`, `test:e2e:headed`, etc.                                |
| Inventing `data-testid` values not in the source              | Tests pass locally, fail in CI if the source diverges       | Reuse `*_TEST_IDS` constants from the source; verify with grep before writing   |

---

## CI & Debugging

**Retain artefacts on failure** (in `playwright.config.ts` → `use:`):
```ts
trace: "retain-on-failure",
screenshot: "only-on-failure",
video: "retain-on-failure",
```

**View traces locally:** `npx playwright show-report`

**Debug a failing line:** `npx playwright test path/to/test.spec.ts:42 --debug`

**Prevent `test.only` commits:** `forbidOnly: !!process.env.CI`

**CI install (only browsers needed):**
```bash
npx playwright install chromium --with-deps
```

**Shard across CI machines:**
```bash
npx playwright test --shard=1/4   # on machine 1 of 4
```

**Common CI gotchas:**
- Missing system deps for Chromium — always use `--with-deps`
- `E2E_BYPASS_TOKEN` not configured as a masked CI variable — leaks plaintext in logs otherwise
- Single-shard timeout exceeded — bump `globalTimeout` or split into shards
- Trace upload disabled — always upload `playwright-report/` and `test-results/` as artifacts

---

## Acceptance Criteria

### Must-contain
- [ ] `@playwright/test` installed as a devDependency (in `__tests__/package.json` or root, whichever the project chose)
- [ ] Playwright npm scripts present (root `test:e2e` at minimum; or `test` if no Jest/Vitest conflict)
- [ ] `playwright.config.ts` with `testDir`, `baseURL`, `timeout`, `expect.timeout`, `forbidOnly: !!process.env.CI` set
- [ ] `dotenv.config({ path, override: true })` in `playwright.config.ts` if any `.env` is used
- [ ] Auth encapsulated in `support/auth.ts` and the cross-feature fixture at `__tests__/__fixtures__/base.fixture.ts` — no inline token injection in specs
- [ ] No `page.route()` calls in spec files
- [ ] Credentials from `process.env` — not hardcoded as string literals
- [ ] `.env.example` committed; `.env` / `.env.e2e` gitignored
- [ ] At least one auth boundary test (unauthenticated redirect) per protected route, importing `base` from `@playwright/test` directly
- [ ] DB state explicitly managed per test (`beforeEach`/`afterEach` or documented seed)
- [ ] Selectors use `getByTestId`, `getByRole`, `getByLabel`, or `getByText` — never CSS class selectors
- [ ] Multi-host apps: `E2E_BACKEND_URL` env var + API helpers return absolute URLs
- [ ] Parent ESLint flat config has `__tests__/**` in `globalIgnores` (if the project uses one)
- [ ] Verified: `npx playwright test --list`, `npx tsc --noEmit` (inside test dir), root `npm run type-check`, root `npm run lint` all clean
- [ ] **Single wrapper folder for tests** — every `*.test.ts` / `*.spec.ts` file lives inside ONE wrapper directory (`__tests__/`, `tests/`, or `e2e/`); NONE at the project root and NONE co-located with `src/` source files
- [ ] **Feature-folder layout** — pages, tests, and per-feature fixtures grouped under `<wrapper>/<feature>/` directories (unless the suite is a deliberate <10-test single-feature smoke suite, in which case `<wrapper>/*.test.ts` is acceptable)
- [ ] **Plan document first** — `checklist-test-cases/<feature>-checklist.md` exists with Overview, Seed, and scenarios containing Steps + Expected Results, drafted and confirmed with the user BEFORE any `.spec.ts` is written; `00-progress-checklist.md` aggregate exists
- [ ] **Spec ↔ plan provenance** — every generated spec file begins with `// plan:` and `// fixture:` header comments pointing back at the markdown plan and the fixture it uses
- [ ] **Test-case IDs** — every test title starts with `<ID>: <descriptive sentence>` and matches a scenario in the plan verbatim. IDs are user-defined (sequential `TC No N`, feature-prefixed `AGEN-001`, Jira-aligned, or slug-style — whatever the project documents), unique within the plan, stable across edits (never rename), and consistent in scheme across the plan
- [ ] **Feature tag on every describe** — every `test.describe` carries at least `{ tag: "@<Feature>" }`; specs with zero tags fail this criterion
- [ ] **One healer pass** — after writing specs, `npx playwright test --grep @<Feature>` was run; passing tests have `- [x]` in the plan; failing tests either got one healer pass + re-run OR are marked `test.fixme()` with a one-line reason and logged under `## Skipped Tests`

### Must-not-contain
- `page.waitForTimeout` anywhere in the suite
- CSS class selectors (`.ClassName`, `[class*="Foo"]`)
- Hardcoded credentials as string literals
- `loginViaApi` / `setExtraHTTPHeaders` / `authedPage` fixture inside an unauthenticated redirect test
- Imports from `src/` inside E2E helpers (mirror types/contract instead)
- Overwritten `test` script when a unit test runner (Jest/Vitest) was already configured
- `*.test.ts` / `*.spec.ts` files at the project root (e.g. `<repo>/booking.test.ts`) or co-located with source files in `src/` — all E2E specs must live inside ONE wrapper folder (`__tests__/`, `tests/`, or `e2e/`)
- Two parallel wrapper folders (e.g. an existing `__tests__/` AND a new `e2e/`) — pick whichever the project already documents and put everything there
- Flat-and-growing test layout: more than ~10 specs sitting directly under `__tests__/e2e/` with no `<feature>/` subdirectories
- Test titles missing the plan's test-case ID prefix (e.g. `test("Super admin creates an agency", …)` when the plan says `AGEN-001: Super admin creates an agency`)
- Renamed test-case IDs (renaming breaks historic CI logs, PR comments, and Jira links — IDs are stable once a spec references them; if the descriptive sentence drifts, fix both plan and spec sentence but leave the ID alone)
- Auto-incrementing sequential IDs when the project's existing plans use a different scheme (e.g. starting `TC No 1` in a project where every other plan uses `BOOK-NNN`)
- Mixing two ID schemes inside one plan (`TC No 1` next to `AGEN-002`)
- Spec files generated before the user has signed off on the plan markdown
- Healer pass that silently broadens assertions, swaps in CSS class selectors, or inserts `page.waitForTimeout` to make a test pass
