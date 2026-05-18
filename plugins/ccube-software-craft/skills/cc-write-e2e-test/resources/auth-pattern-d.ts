// Purpose: Global setup for apps using real OAuth/OIDC
// (Cognito, Azure AD, Singpass, Google, etc.) where no bypass header exists.
//
// Authenticates once per role before the test suite starts, then saves the
// browser state (cookies + localStorage) to a JSON file. Each worker loads
// the saved state rather than re-authenticating on every test — faster and
// more reliable.
//
// Outcome: A global-setup.ts to register in playwright.config.ts.
//
// playwright.config.ts changes required:
//   globalSetup: require.resolve('./support/global-setup'),
//   use: { storageState: 'e2e/.auth/user.json' }   // default role
//
// For multiple roles, override storageState per project:
//   projects: [
//     { name: 'admin', use: { storageState: 'e2e/.auth/admin.json' } },
//     { name: 'user',  use: { storageState: 'e2e/.auth/user.json'  } },
//   ]
//
// Add e2e/.auth/ to .gitignore — state files contain live session tokens.

import { chromium, type FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_DIR = path.join(__dirname, '..', '.auth');

interface RoleCredentials {
  email: string;
  password: string;
  stateFile: string;  // filename within AUTH_DIR, e.g. 'admin.json'
}

// One entry per role. Always source credentials from env vars.
const roles: RoleCredentials[] = [
  {
    email:     process.env.TEST_ADMIN_EMAIL    ?? '',
    password:  process.env.TEST_ADMIN_PASSWORD ?? '',
    stateFile: 'admin.json',
  },
  {
    email:     process.env.TEST_USER_EMAIL    ?? '',
    password:  process.env.TEST_USER_PASSWORD ?? '',
    stateFile: 'user.json',
  },
];

// Full URL of your app's login page (may redirect to external IdP)
const LOGIN_URL = `${process.env.BASE_URL ?? 'http://localhost:3000'}/login`;

async function saveStateForRole(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  role: RoleCredentials,
): Promise<void> {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(LOGIN_URL);

  // ── Adapt this block to your IdP's login form ─────────────────────────
  // Works for Cognito hosted UI, Azure AD B2C, and standard form logins.
  // For Singpass: navigate to the mock login URL and fill the NRIC field.
  await page.getByLabel(/email|username/i).fill(role.email);
  await page.getByLabel(/password/i).fill(role.password);
  await page.getByRole('button', { name: /sign in|log in|submit/i }).click();
  // ── End of IdP-specific block ─────────────────────────────────────────

  // Wait until the browser is back in the app (no longer on the IdP)
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });

  await context.storageState({ path: path.join(AUTH_DIR, role.stateFile) });
  await context.close();
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const browser = await chromium.launch();
  try {
    // Sequential by default to avoid race conditions at the IdP.
    // Switch to Promise.all(roles.map(...)) if your IdP allows parallel sessions.
    for (const role of roles) {
      await saveStateForRole(browser, role);
    }
  } finally {
    await browser.close();
  }
}
