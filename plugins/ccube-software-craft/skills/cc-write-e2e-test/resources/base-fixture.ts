// Purpose: Template for composing Page Objects with Playwright fixtures.
// Fixtures wire up auth, navigation, and resource cleanup so spec files
// receive fully-configured objects and never call auth helpers directly.
//
// Usage:
//   1. Copy to __tests__/__fixtures__/base.fixture.ts
//   2. Import your page objects and uncomment the relevant auth block
//   3. Replace the placeholder DashboardPage with your actual page objects
//   4. Import { test, expect } from this file in all spec files
//      instead of '@playwright/test'

import { test as base, expect, type Page } from '@playwright/test';

// ── Import your page objects ──────────────────────────────────────────────
// import { DashboardPage } from '../pages/DashboardPage';
// import { BookingPage }   from '../pages/BookingPage';

// ── Import your auth helper (choose the matching pattern) ─────────────────
// Pattern C (MOL header bypass):
// import { getAdminHeaders, getCitizenHeaders, setAuthHeaders, AdminUser } from '../helpers/auth';
// import { users } from '../helpers/users';

// ── Fixture type ──────────────────────────────────────────────────────────

type CleanupItem =
  | { kind: 'path'; path: string }
  | { kind: 'fn';   fn: () => Promise<void> };

type BaseFixtures = {
  /**
   * Tracks resources created during a test and tears them down after,
   * even on failure. Two shapes:
   *
   *   Simple — DELETE the path:
   *     cleanup.track(`/api/bookings/${id}`);
   *
   *   Status-aware — supply an async teardown function (use when the
   *   resource can't be deleted by ID alone, e.g. an in-progress booking
   *   that must be rescheduled before it can be cancelled):
   *     cleanup.track(async () => {
   *       const b = await getBooking(id);
   *       if (b.status === 'IN_PROGRESS') await rescheduleBooking(id);
   *       await cancelBooking(id);
   *     });
   */
  cleanup: {
    track: (pathOrFn: string | (() => Promise<void>)) => void;
  };

  // Uncomment when using Pattern C:
  // dashboardPage: DashboardPage;
};

// type BaseOptions = {
//   adminUser: AdminUser;  // override per spec: test.use({ adminUser: users.superadmin })
// };

// ── Extended test ─────────────────────────────────────────────────────────

export const test = base.extend<BaseFixtures>(/* & BaseOptions */ {

  // ── Pattern C: MOL header bypass ─────────────────────────────────────
  // adminUser: [users.admin, { option: true }],  // default user; override per spec
  //
  // dashboardPage: async ({ page, adminUser }, use) => {
  //   setAuthHeaders(page, getAdminHeaders(adminUser));
  //   await page.goto(`${process.env.BASE_URL}/admin/dashboard`);
  //   const dashboard = new DashboardPage(page);
  //   await dashboard.waitForLoad();
  //   if (adminUser.useCaseName) await dashboard.switchUsecase(adminUser.useCaseName);
  //   await use(dashboard);
  //   // No teardown needed — headers are cleared when the browser context closes
  // },

  // ── Resource cleanup ──────────────────────────────────────────────────
  cleanup: async ({ page }, use) => {
    const items: CleanupItem[] = [];

    await use({
      track: (pathOrFn) => {
        if (typeof pathOrFn === 'string') items.push({ kind: 'path', path: pathOrFn });
        else items.push({ kind: 'fn', fn: pathOrFn });
      },
    });

    // Teardown in reverse order, even on test failure
    for (const item of items.reverse()) {
      try {
        if (item.kind === 'path') await page.request.delete(item.path);
        else await item.fn();
      } catch (err) {
        console.warn('Cleanup failed:', item, err);
      }
    }
  },
});

// ── Page Object base class ────────────────────────────────────────────────

/**
 * Extend this for every page in the app.
 *
 * Conventions:
 *  - Keep locators private (they are implementation details)
 *  - Expose intent-revealing action methods (navigateTo, submit, selectDate)
 *  - waitForLoad() asserts the page is ready — call it after navigation
 *
 * @example
 * export class DashboardPage extends BasePage {
 *   private readonly heading = this.page.getByRole('heading', { level: 1 });
 *
 *   async navigateTo() { await this.page.goto('/admin/dashboard'); }
 *   async waitForLoad() { await expect(this.heading).toBeVisible(); }
 *   async switchUsecase(name: string) {
 *     await this.page.getByRole('combobox', { name: /usecase/i }).selectOption(name);
 *   }
 * }
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navigate to this page's canonical URL. */
  abstract navigateTo(): Promise<void>;

  /** Assert the page has fully loaded and is ready for interaction. */
  abstract waitForLoad(): Promise<void>;
}

export { expect };
