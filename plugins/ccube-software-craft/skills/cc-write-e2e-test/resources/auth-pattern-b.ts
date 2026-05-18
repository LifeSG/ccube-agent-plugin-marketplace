// Purpose: Auth helper for apps that use a server-side session cookie.
// Outcome: Exports loginViaApi, logout, and expectRedirectToLogin for use
//          in Playwright E2E specs. Fill in LOGIN_PATH and LOGOUT_PATH
//          before copying into the project.

import { type Page, expect } from '@playwright/test';

// LOGIN_PATH — grep the server route files for a POST handler
// whose path contains `login` or `auth`. Use the full path string.
const LOGIN_PATH = '<detected from codebase>';

// LOGOUT_PATH — grep the server route files for a POST handler
// whose path contains `logout`. Use the full path string.
const LOGOUT_PATH = '<detected from codebase>';

/**
 * Log in via the real login API. The server sets the session cookie
 * automatically via the Set-Cookie response header — no manual storage
 * is needed. Playwright's request context captures and replays the cookie
 * on all subsequent requests within the same page context.
 *
 * `credentials` shape must match the login endpoint's expected body.
 * Inspect the server's login handler to determine the exact field names.
 */
export async function loginViaApi(
  page: Page,
  credentials: Record<string, string>,
): Promise<void> {
  const res = await page.request.post(LOGIN_PATH, { data: credentials });
  if (!res.ok()) throw new Error(`Login failed: ${res.status()}`);
  // Cookie is set automatically — nothing to store manually.
}

/** Call the real logout endpoint to invalidate the session server-side. */
export async function logout(page: Page): Promise<void> {
  await page.request.post(LOGOUT_PATH);
}

/**
 * Assert that the page has been redirected to the login route.
 * Update the regex if your app uses a different login path.
 */
export async function expectRedirectToLogin(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/login/);
}
