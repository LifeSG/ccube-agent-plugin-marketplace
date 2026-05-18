# Feature-Folder Organisation — migration & decision detail

Read this when scaffolding a new feature folder OR when an existing suite is flat and you suspect it should be split.

The full layout (Shape A vs Shape B, what each top-level folder holds, the mapping cheat-sheet) lives in **SKILL.md → Step 0.5**. This reference covers the parts that don't fit there: the migration path from a flat suite, the per-feature fixture pattern, the anti-pattern detail, and the size → shape decision matrix.

## Per-feature fixture pattern

Each feature folder owns a `__fixtures__/<feature>.fixture.ts` that **extends** the global `__tests__/__fixtures__/base.fixture.ts`. The feature fixture wires up that feature's page object(s) and any feature-specific seed data:

```ts
// __tests__/agencies/__fixtures__/agencies.fixture.ts            (Shape A)
// __tests__/e2e/__tests__/agencies/__fixtures__/agencies.fixture.ts  (Shape B)

import { test as base, expect } from "__fixtures__/base.fixture";
import AgenciesListPage from "pages/agencies/AgenciesListPage";

type AgenciesFixtures = {
  agenciesListPage: AgenciesListPage;
};

export const test = base.extend<AgenciesFixtures>({
  agenciesListPage: async ({ authedPage }, use) => {
    const page = new AgenciesListPage(authedPage);
    await page.goto();
    await page.waitForLoad();
    await use(page);
  },
});

export { expect };
```

Imports use the `pages/...` and `__fixtures__/...` aliases configured in `tsconfig.json` (see SKILL.md Step 1.5 → "Spec files import only what they need"). Same import paths work in Shape A and Shape B.

Spec files inside `agencies/` import `test` and `expect` from this feature fixture — never from `@playwright/test` directly (except auth-boundary tests, which need an unauthenticated page).

## Anti-pattern: the flat-when-it-grows shape

```
<base>/__tests__/
├── agencies.spec.ts        # all 12 agency scenarios crammed in one file
├── auth.spec.ts            # 8 auth scenarios
├── dashboard.spec.ts
├── users.spec.ts           # all 9 user scenarios
└── helpers/...             # wrong folder — helpers belong in support/, NOT __tests__/
```

**What goes wrong:**

- One `agencies.spec.ts` grows past 300 lines; nobody dares split it because imports are entangled.
- `getByTestId('agencies-card-list')` is repeated in 4 spec files because there are no page objects.
- A new dev cannot tell at a glance which scenarios exist for agencies — they have to scroll through the spec file.
- The progress checklist (if any) is a single big file and gets out of sync.

## Migration path — splitting a flat suite into feature folders

Do this incrementally, one feature at a time. Don't try to refactor the whole suite in one go.

1. **Pick the largest spec file** — usually the one most painful to read.
2. **Scaffold the feature folder.** Create `<base>/__tests__/<feature>/` with an empty `__fixtures__/` inside.
3. **Identify the page objects.** Group repeated `getByTestId(...)` / `getByRole(...)` selectors into one or more POMs at `<base>/pages/<feature>/<Page>.ts`. Don't try to be exhaustive — extract the most-duplicated 60% and stop.
4. **Create the per-feature fixture** at `<base>/__tests__/<feature>/__fixtures__/<feature>.fixture.ts` extending `__fixtures__/base.fixture`. Wire up the POMs.
5. **Split the spec file by scenario type.** A typical feature splits into 3–5 smaller specs (`list.spec.ts`, `create.spec.ts`, `delete.spec.ts`, `auth.spec.ts`, `regression.spec.ts`). Each `describe` block from the old file usually maps to one new spec.
6. **Update imports.** New specs import `test, expect` from the per-feature fixture, not `@playwright/test`.
7. **Scaffold the plan** at `<base>/checklist-test-cases/<feature>-checklist.md` if it doesn't exist. Backfill scenarios from the existing specs (one TC per `test(...)`).
8. **Run the feature's tests** (`npx playwright test --grep @<Feature>`) to confirm nothing regressed.
9. **Repeat for the next-largest spec.** A suite usually migrates 1–2 features per PR.

Avoid the temptation to refactor *everything* at once — incremental migration keeps each PR reviewable and CI green.

## When the simpler shape is OK

For a one-feature smoke suite (< 10 tests total, no growth expected), the flat shape can stay — specs may sit directly under `<base>/__tests__/*.spec.ts` without `<feature>/` subdirs. But scaffold the `checklist-test-cases/<feature>-checklist.md` anyway — that's cheap and gives the team a coverage record.

## Decision matrix

| Suite size                  | Pages                                              | Specs                                          | Fixtures                                              |
| --------------------------- | -------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| **One feature, <10 tests**  | `pages/components/` + 1–2 POMs                     | Flat under `__tests__/*.spec.ts` is OK         | Single `__tests__/__fixtures__/base.fixture.ts`       |
| **Multi-feature (default)** | `pages/<feature>/<Page>.ts`                        | `__tests__/<feature>/<sub>/*.spec.ts`          | Per-feature `__tests__/<feature>/__fixtures__/<feature>.fixture.ts` |
| **Large (>50 tests)**       | Same as above + reuse via inheritance / components | Same as above + sharding                       | Same as above + worker-scoped reference data          |

Start at the row that matches today AND the row that matches the projected size in 3 months — pick the larger of the two. Going flat-first and refactoring later costs more than starting structured.
