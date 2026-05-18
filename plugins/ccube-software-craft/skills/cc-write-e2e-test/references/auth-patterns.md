# Auth Patterns — Per-Pattern Setup

Detailed setup steps for each of the 5 auth patterns identified by the detection table in SKILL.md Step 1. Read only the section for the pattern you've identified.

---

## Pattern A — JWT in localStorage

Copy `resources/auth-pattern-a.ts` → `support/auth.ts`. Fill in:
- `TOKEN_KEY` — first argument of `localStorage.setItem(` in `src/`
- `LOGIN_PATH` — POST route path with `login` or `auth`
- Token response field — inspect login handler (`body.token`, `body.data?.token`, etc.)

---

## Pattern B — Session cookie

Copy `resources/auth-pattern-b.ts` → `support/auth.ts`. Fill in:
- `LOGIN_PATH` — POST route path with `login` or `auth`
- `LOGOUT_PATH` — POST route path with `logout`

---

## Pattern C — MOL header bypass

Used when the test environment trusts a `mol-token-bypass: true` header to skip real OAuth; user identity is passed via `MOLSecurityHeaderKeys` headers.

Copy `resources/auth-pattern-c.ts` → `support/auth.ts`. The file covers all standard MOL user types out of the box:
- **Admin — Cognito:** `ADMIN_ID` + bypass header
- **Admin — WOG AAD:** `WOG_USER_ID`, `WOG_USER_EMAIL`, `USER_AUTH_LEVEL: "2"` + bypass
- **Citizen — Singpass:** `USER_ID`, `USER_UINFIN`, `USER_AUTH_LEVEL: "2"` + bypass
- **Citizen — Mobile OTP:** `MOBILE_OTP_ID`, `MOBILE_OTP_PHONE_NUMBER` + bypass
- **Citizen — Guest Enhanced:** `GUEST_ENHANCED_ID`, `GUEST_ENHANCED_EMAIL` + bypass
- **Citizen — SSO:** `SSO_ID`, `SSO_USER_ID`, `SSO_TYPE: "DELEGATED"`, `SSO_AGENCY_NAME` + bypass
- **Citizen — WOG AD:** `WOG_USER_ID`, `WOG_USER_EMAIL` + bypass

Update `USECASE_ID_HEADER` to your app's usecase header name. Set per-test context headers exclusively through a fixture — never call `setExtraHTTPHeaders()` directly in spec files.

**Route path detection.** The admin/citizen entry paths vary per app and must not be assumed. After confirming Pattern C, grep the app router for route definitions to find:
- Admin entry path (could be `/admin/dashboard`, `/user/dashboard`, `/manage`, etc.)
- Citizen/public path (could be `/citizen/bookings`, `/public/bookings`, etc.)
- Login redirect path (e.g. `/login`, `/sign-in`)

If routes are not obvious, ask: *"What is the admin entry path, the citizen entry path, and the unauthenticated redirect path in your app?"*

**MyInfo-backed citizen apps.** If your app uses Singpass with multiple citizen archetypes (married/single, with/without HDB, with/without vehicles), shape your helper as `loginAs(archetype, overrides)` rather than a long positional-argument signature — keeps test specs readable as archetypes grow.

---

## Pattern D — OAuth / OIDC (via storageState)

For apps using real OAuth (Cognito, Azure AD, Singpass) where no bypass exists.

Copy `resources/auth-pattern-d.ts` → `support/global-setup.ts`. Register in `playwright.config.ts`:
```ts
globalSetup: require.resolve('./support/global-setup'),
use: { storageState: 'e2e/.auth/user.json' }
```
For multiple roles, create one state file per role and override per project:
```ts
projects: [
  { name: 'admin', use: { storageState: 'e2e/.auth/admin.json' } },
  { name: 'user',  use: { storageState: 'e2e/.auth/user.json'  } },
]
```
Add `e2e/.auth/` to `.gitignore` — state files contain session tokens.

---

## Pattern E — API key

Copy `resources/auth-pattern-e.ts` → `support/auth.ts`. Fill in:
- `API_KEY_HEADER` — the header your app expects (`x-api-key`, `Authorization`, etc.)
- `API_KEY_PREFIX` — optional prefix (`"ApiKey "`, `"Bearer "`, or `""`)
- Source the key from `process.env.TEST_API_KEY` — never hardcode

---

## Multi-role credentials (applies to all patterns)

Before writing credentials, ask ONE clarifying question about admin user setup:

> *"Are test admin users pre-defined (fixed IDs from seed data or env vars), or can they be created dynamically via an API with custom permissions (e.g. scoped to a specific service)?"*

- **Pre-defined:** export fixed objects from `support/credentials.ts`, values sourced from env vars. Use this when admin IDs are stable across test runs.
- **Dynamic (API-created):** scaffold a `createAdmin(permissions)` helper and a Playwright fixture that creates the admin with the required permissions before tests and deletes it after. This is needed when tests must verify role-scoped behaviour (e.g. an admin with access to only one service). Use the `cleanup` fixture from `resources/base-fixture.ts` to ensure deletion even on failure.

For pre-defined credentials:
```ts
// support/credentials.ts — values from env vars, never hardcoded
export const adminUser: AdminUser = {
  adminType: AdminType.Cognito,
  adminId: process.env.TEST_ADMIN_ID ?? '',
  email:   process.env.TEST_ADMIN_EMAIL ?? '',
  useCaseId: process.env.TEST_USECASE_ID,
};
export const citizenUser: SingpassUser = {
  loginType: CitizenLoginType.Singpass,
  userId: process.env.TEST_CITIZEN_ID   ?? '',
  nric:   process.env.TEST_CITIZEN_NRIC ?? '',
};
```
