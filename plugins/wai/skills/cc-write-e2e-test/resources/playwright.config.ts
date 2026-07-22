// Purpose: Canonical Playwright configuration for true E2E test suites.
// Outcome: A correctly configured playwright.config.ts ready to copy into
//          the project root, with comments showing how to switch between
//          Pattern 1 (workers: 1) and Pattern 2 (workers: N).

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',

  // ── Worker / parallelism settings ────────────────────────────────
  // Pattern 1 (API-driven teardown): use the values below as-is.
  // Pattern 2 (per-worker schema isolation): change to:
  //   fullyParallel: true,
  //   workers: process.env.CI ? 4 : 2,
  fullyParallel: false,
  workers: 1,

  // ── CI settings ───────────────────────────────────────────────────
  forbidOnly: !!process.env.CI, // fail if test.only is committed
  retries: process.env.CI ? 2 : 0,

  // ── Reporters ─────────────────────────────────────────────────────
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // ── Timeouts ──────────────────────────────────────────────────────
  globalTimeout: 10 * 60 * 1_000, // 10-minute hard cap — prevents hung CI pipelines
  timeout: 60_000, // per-test timeout
  expect: { timeout: 10_000 }, // per-assertion timeout

  // ── Browser defaults ──────────────────────────────────────────────
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  // ── Optional: start the server automatically ──────────────────────
  // Uncomment if the server should be started by Playwright itself.
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
