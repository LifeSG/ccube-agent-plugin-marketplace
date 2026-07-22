// Purpose: Auth helper for apps that store a JWT token in localStorage.
// Outcome: Exports loginViaApi, logout, and expectRedirectToLogin for use
//          in Playwright E2E specs. Fill in TOKEN_KEY and LOGIN_PATH
//          before copying into the project.

import { type Page, expect } from '@playwright/test';

// TOKEN_KEY — grep `localStorage.setItem(` in src/
// Use the first argument of the first call you find.
const TOKEN_KEY = '<detected from codebase>';

// LOGIN_PATH — grep the server route files for a POST handler
// whose path contains `login` or `auth`. Use the full path string.
const LOGIN_PATH = '<detected from codebase>';

/**
 * Log in via the real login API and store the returned JWT in
 * localStorage so subsequent page navigations are authenticated.
 *
 * `credentials` shape must match the login endpoint's expected body.
 * Inspect the server's login handler to determine the exact field names.
 *
 * Token field detection: inspect the login handler's response body.
 * Common shapes: `{ token }`, `{ data: { token } }`, `{ accessToken }`.
 * Update the `body.token ?? body.data?.token` line to match.
 */
export async function loginViaApi(
  page: Page,
  credentials: Record<string, string>,
): Promise<void> {
  const res = await page.request.post(LOGIN_PATH, { data: credentials });
  if (!res.ok()) throw new Error(`Login failed: ${res.status()}`);
  const body = await res.json();
  const token = body.token ?? body.data?.token; // ← update if needed
  await page.evaluate(
    ([key, val]) => localStorage.setItem(key, val),
    [TOKEN_KEY, token],
  );
}

/** Remove the JWT from localStorage, effectively logging out. */
export async function logout(page: Page): Promise<void> {
  await page.evaluate((key) => localStorage.removeItem(key), TOKEN_KEY);
}

/**
 * Assert that the page has been redirected to the login route.
 * Update the regex if your app uses a different login path.
 */
export async function expectRedirectToLogin(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/login/);
}
