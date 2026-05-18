// Purpose: Canonical Playwright configuration for true E2E test suites.
// Copy into the project root and adjust the three sections marked ← below.

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',                   // ← update to '__tests__' if that's your convention

  // ── Worker / parallelism ──────────────────────────────────────────────
  // Pattern 1 (API-driven teardown): keep workers: 1, fullyParallel: false
  // Pattern 2 (per-worker schema isolation): workers: process.env.CI ? 4 : 2, fullyParallel: true
  fullyParallel: false,
  workers: 1,

  // ── CI guards ─────────────────────────────────────────────────────────
  forbidOnly: !!process.env.CI,       // fail if test.only is committed
  retries: process.env.CI ? 2 : 0,

  // ── Optional: one-time auth setup (Pattern D — OAuth/OIDC only) ──────
  // globalSetup: require.resolve('./support/global-setup'),

  // ── Reporters ─────────────────────────────────────────────────────────
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // ── Timeouts ──────────────────────────────────────────────────────────
  globalTimeout: 10 * 60 * 1_000,    // 10-minute hard cap — prevents hung CI pipelines
  timeout:        60_000,             // per-test timeout
  expect: { timeout: 10_000 },       // per-assertion retry window

  // ── Browser defaults ──────────────────────────────────────────────────
  // E2E tests run against ONE environment. Point BASE_URL at your dedicated
  // test environment (never production). Default localhost for local runs.
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace:      'retain-on-failure',  // view with: npx playwright show-report
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
    ignoreHTTPSErrors: process.env.CI !== 'true', // allow self-signed certs locally
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },

    // ── Pattern D: uncomment for multi-role OAuth storageState ───────────
    // { name: 'admin', use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/admin.json' } },
    // { name: 'user',  use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json'  } },
  ],

  // ── Optional: start the server automatically ──────────────────────────
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
