# Install Location — Decision Detail

Read after the user has answered Phase C question 5 ("Where should Playwright be installed?"). Pick the section that matches their answer.

> **Non-negotiable across all three options:** every `*.test.ts` / `*.spec.ts` file lives inside the wrapper folder — for standalone E2E repos that's `__tests__/` at the repo root (which is fine, because the repo IS the test suite); for nested E2E inside an app repo that's `__tests__/` or `__tests__/e2e/` inside the app. Specs are never scattered as `<repo>/booking.test.ts` or co-located with `src/` source files. The install options below differ in *where the `package.json` lives* and what shape the folder takes around it; the specs are always inside the wrapper.
>
> **Pick a reference project to mirror:**
> - **Standalone E2E repo** (dedicated `<app>-e2e/`) → SKILL.md Step 0.5 → Shape A. Top-level `pages/`, `support/`, `__tests__/` directly at the repo root.
> - **E2E nested in an app repo** (frontend / Next.js / React app) → SKILL.md Step 0.5 → Shape B. Everything inside `__tests__/e2e/`, with the unified layout (`pages/`, `support/`, inner `__tests__/` for specs) anchored there.

---

## Option A — Root install (rare for MOL — typically only for standalone E2E repos or tiny monorepos)

User picked: Playwright lives in the repo's main `package.json`. This is the natural choice when the repo IS the E2E suite (Shape A — a dedicated `<app>-e2e/` repo); the repo doesn't have an "app" alongside the tests, so there's only one `package.json` to begin with.

If the project is an **app repo with E2E inside** (Shape B context), Option A is usually the wrong call — Playwright deps will pollute the app's production dep graph. Prefer Option B for that case unless the team explicitly opts in.

```bash
npm install --save-dev @playwright/test dotenv @faker-js/faker
npx playwright install chromium
```

Add scripts to the repo's `package.json` (do not overwrite an existing `test` script if Jest/Vitest is already there — namespace as `test:e2e`):

```json
{
  "scripts": {
    "test:e2e":        "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug":  "playwright test --debug",
    "test:e2e:ui":     "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

For a standalone repo with no unit-test runner, `"test": "playwright test"` (no `:e2e` suffix) is fine — the repo only ships tests. Check with the user before reserving the bare `test` slot.

Folder layout — Shape A (see SKILL.md Step 0.5 for the full annotated layout):

```
<app-name>-e2e/                  ← the repo IS the wrapper
├── playwright.config.ts
├── package.json                 ← Playwright deps here (no nested package.json)
├── tsconfig.json
├── eslint.config.mjs
├── checklist-test-cases/        ← TC plans
├── pages/                       ← Page Objects, TOP-LEVEL, by feature
│   ├── components/
│   └── <feature>/<Page>.ts
├── support/                     ← cross-feature primitives — apis/, const/, users/, types/, setup/
│   ├── apis/
│   ├── const/
│   └── users/
├── config/                      ← env files (.env.dev, .env.uat)
├── params/                      ← MOL params (optional)
└── __tests__/                   ← specs only, by feature
    ├── __fixtures__/
    │   └── base.fixture.ts      ← global authedPage + role users
    └── <feature>/<subfeature>/*.spec.ts
```

⚠️ Even with Option A, the spec files still live inside `__tests__/<feature>/` — never as `<repo-root>/booking.spec.ts` and never inside `pages/` or `support/`. The repo's top-level `pages/` and `support/` directories hold the POMs and helpers that the specs *import from*, but the spec files themselves only live in `__tests__/`.

---

## Option B — Independent `__tests__/e2e/package.json` (default for E2E inside an app repo)

User picked: Playwright lives inside `__tests__/e2e/package.json`, separate from the app's. This is the **default for E2E nested inside an app repo** — keeps Playwright + reporters + dotenv out of the app's production dep graph.

**Why `__tests__/e2e/` and not just `__tests__/`:** the `__tests__/` folder often hosts more than just E2E — many MOL repos have `__tests__/api/`, `__tests__/functional/`, and `__tests__/perf/` as siblings, each with their own runner and config. Putting Playwright's `package.json`, `tsconfig.json`, and `playwright.config.ts` directly under `__tests__/` would conflict with those siblings. Nesting everything under `__tests__/e2e/` keeps each test type fully self-contained — its own `package.json`, its own deps, its own tsconfig — and the sibling `api/` / `perf/` folders stay unaffected.

```bash
mkdir -p \
  __tests__/e2e/{checklist-test-cases,pages/components,support/{apis,const,users,types,setup},config} \
  __tests__/e2e/__tests__/__fixtures__
# Create __tests__/e2e/package.json (template below), then:
cd __tests__/e2e && npm install
npx playwright install chromium
```

Resulting layout — the **unified internal layout** (same as Shape A's, anchored at `__tests__/e2e/`). `__tests__/` ONLY holds spec files + their `__fixtures__/` sibling; everything else (`pages/`, `support/`, `checklist-test-cases/`, config) lives beside it. See SKILL.md Step 0.5 for the full annotated layout.

```
<app-repo>/
├── src/                           ← app code — UNTOUCHED; never contains *.spec.ts E2E specs
├── package.json                   ← app's; add ONLY delegating test:e2e scripts
├── next.config.ts
└── __tests__/                     ← parent test folder — may host MULTIPLE test types as siblings
    ├── api/                       ← OPTIONAL sibling — API tests (Jest + supertest, etc.)
    ├── functional/                ← OPTIONAL sibling — functional tests
    ├── perf/                      ← OPTIONAL sibling — k6, artillery, etc.
    └── e2e/                       ← <base>/ — Playwright E2E lives ENTIRELY here, self-contained
        ├── playwright.config.ts
        ├── package.json           ← independent install (this option)
        ├── tsconfig.json
        ├── eslint.config.mjs
        ├── checklist-test-cases/  ← TC plans (Step 5)
        ├── pages/                 ← Page Objects, by feature
        ├── support/               ← apis/, const/, users/, types/, setup/ — NOT "helpers/"
        ├── config/                ← env files
        └── __tests__/             ← yes, an INNER __tests__/ — specs ONLY
            ├── __fixtures__/
            │   └── base.fixture.ts
            └── <feature>/<sub>/*.spec.ts
                                   ← e.g. __tests__/e2e/__tests__/admin/dashboard/dashboard.spec.ts
```

**The intentional double `__tests__/`:** the outer one is the app repo's "all tests" parent (siblings: api, functional, perf, e2e). The inner one is the unified layout's spec folder. Keeping the inner one named `__tests__/` (rather than renaming it) is what gives Shape A and Shape B *identical* internal paths. The full spec path reads as `__tests__ / e2e / __tests__ / <feature> / ...` — outer-tests / which-test-type / specs / feature.

`__tests__/e2e/package.json` template:

```json
{
  "name": "<app-name>-e2e",
  "version": "0.1.0",
  "private": true,
  "description": "Playwright E2E tests for <app-name>. Independent install — does not pollute the app's package.json, and stays out of sibling test types in __tests__/.",
  "scripts": {
    "test":        "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug":  "playwright test --debug",
    "test:ui":     "playwright test --ui",
    "test:report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test":  "^1.50.0",
    "@types/node":       "^20.0.0",
    "@faker-js/faker":   "^9.0.0",
    "dotenv":            "^16.4.5"
  }
}
```

Plus a `__tests__/e2e/tsconfig.json` so TypeScript inside the E2E folder resolves `@playwright/test` independently AND wires up the `pages/`, `support/`, `__fixtures__/` path aliases that specs import through:

```json
{
  "compilerOptions": {
    "target":                           "ES2022",
    "module":                           "ESNext",
    "moduleResolution":                 "Bundler",
    "esModuleInterop":                  true,
    "strict":                           true,
    "skipLibCheck":                     true,
    "resolveJsonModule":                true,
    "forceConsistentCasingInFileNames": true,
    "types":                            ["node", "@playwright/test"],
    "baseUrl":                          ".",
    "paths": {
      "pages/*":         ["pages/*"],
      "support/*":       ["support/*"],
      "__fixtures__/*":  ["__tests__/__fixtures__/*"]
    }
  },
  "include": ["**/*.ts", "playwright.config.ts"]
}
```

Then in the **root** `package.json`, add delegating scripts (do not overwrite the existing `test` script) — the prefix is `__tests__/e2e`, not `__tests__`:

```json
{
  "scripts": {
    "test:e2e":         "npm --prefix __tests__/e2e test",
    "test:e2e:headed":  "npm --prefix __tests__/e2e run test:headed",
    "test:e2e:debug":   "npm --prefix __tests__/e2e run test:debug",
    "test:e2e:ui":      "npm --prefix __tests__/e2e run test:ui",
    "test:e2e:report":  "npm --prefix __tests__/e2e run test:report",
    "test:e2e:install": "cd __tests__/e2e && npm install && npx playwright install chromium"
  }
}
```

`playwright.config.ts` lives at `__tests__/e2e/playwright.config.ts`. Its `testDir` points at the **inner** `./__tests__/` — that's where specs live in the unified layout:

```ts
// __tests__/e2e/playwright.config.ts
import { defineConfig } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "node:path";

dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });

export default defineConfig({
  testDir: "./__tests__",
  testMatch: ["**/*.spec.ts", "**/*.test.ts"],
  // …
});
```

For Shape A (standalone repo), the `testDir` is just `"./__tests__"` from the repo root — same setting, different anchor.

---

## Option C — Custom path

User picked a different directory (e.g. a top-level `e2e/`, `tests/e2e/`, `playwright/`).

Apply Option B's structure inside that directory — the spirit is the same: ONE self-contained folder holds `package.json`, `tsconfig.json`, `playwright.config.ts`, plans, helpers, fixtures, and specs. Update the delegating scripts to use `npm --prefix <chosen-dir>`.

---

## Universal rules across all options

- ⚠️ If the existing `test` script is Jest or Vitest, **never overwrite it**. Use `test:e2e` namespace. Announce to the user which scripts were added and why.
- ⚠️ Tell the user which option you implemented in your closing summary — they need to know whether `npm install` at root pulls Playwright or if they need a separate `npm install` step.
- The `playwright.config.ts` must call `dotenv.config({ path, override: true })` so the project's app-level `.env` does not silently shadow your test env. See the main SKILL.md → "D.2 — Drop in the Playwright config".
