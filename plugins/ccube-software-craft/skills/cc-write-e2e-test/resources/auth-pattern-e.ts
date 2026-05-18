// Purpose: Auth helper for apps that authenticate via an API key in a request header.
// Common for service-to-service API tests, developer portals, and internal tooling.
//
// Outcome: Exports setApiKeyHeader(), apiRequest(), and expectApiKeyRequired()
// for use in Playwright fixtures and API-contract specs.
// The API key is always sourced from process.env — never hardcoded.

import { type Page, expect } from '@playwright/test';

// API_KEY_HEADER — the header name your app expects. Common values:
//   'x-api-key'        (AWS API Gateway default)
//   'Authorization'    (used with API_KEY_PREFIX = 'ApiKey ' or 'Bearer ')
//   'api-key'
const API_KEY_HEADER = '<detected from API docs or server middleware>';

// API_KEY_PREFIX — string prepended to the key value. Leave as '' if none.
// Examples: 'ApiKey ', 'Bearer ', ''
const API_KEY_PREFIX = '';

function resolveKey(): string {
  const key = process.env.TEST_API_KEY ?? '';
  if (!key) throw new Error('TEST_API_KEY is not set — check your .env.test file');
  return key;
}

/**
 * Apply the API key header to a page for all subsequent requests.
 * Call this inside a Playwright fixture — not directly in spec files.
 *
 * @example
 * // In your fixture:
 * apiPage: async ({ page }, use) => {
 *   setApiKeyHeader(page);
 *   await use(page);
 * }
 */
export function setApiKeyHeader(page: Page): void {
  page.setExtraHTTPHeaders({
    [API_KEY_HEADER]: `${API_KEY_PREFIX}${resolveKey()}`,
  });
}

/**
 * Make an authenticated API request.
 * Useful for API contract tests that assert on response shape rather than UI.
 *
 * @example
 * test('GET /api/items returns a list', async ({ page }) => {
 *   const body = await apiRequest(page, 'GET', '/api/items');
 *   expect(body.data).toBeInstanceOf(Array);
 * });
 */
export async function apiRequest(
  page: Page,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  data?: unknown,
): Promise<unknown> {
  const headers = { [API_KEY_HEADER]: `${API_KEY_PREFIX}${resolveKey()}` };
  const res = await page.request.fetch(path, { method, headers, data: data as Record<string, unknown> });
  if (!res.ok()) throw new Error(`API request failed: ${method} ${path} → ${res.status()}`);
  return res.json();
}

/**
 * Assert that the endpoint returns 401 or 403 when the API key is absent.
 * Use in auth boundary tests (Dimension 3) for API endpoints.
 *
 * @example
 * test('rejects requests without an API key', async ({ page }) => {
 *   await expectApiKeyRequired(page, '/api/items');
 * });
 */
export async function expectApiKeyRequired(page: Page, path: string): Promise<void> {
  const res = await page.request.get(path);
  expect(res.status()).toBeGreaterThanOrEqual(401);
  expect(res.status()).toBeLessThanOrEqual(403);
}
