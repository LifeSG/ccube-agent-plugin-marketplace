// Purpose: Auth helper for apps using the mol-token-bypass header pattern
// to skip real OAuth in test environments.
//
// Covers all standard MOL auth types:
//   Admin   — Cognito, WOG AAD
//   Citizen — Singpass, Mobile OTP, Guest Enhanced, SSO, WOG AD
//
// Outcome: Exports getAdminHeaders(), getCitizenHeaders(), setAuthHeaders(),
// and expectRedirectToLogin() for use in Playwright fixtures.
//
// IMPORTANT: Call setAuthHeaders() inside a fixture — never directly in spec files.
//
// Dependencies:
//   npm install -D @wog/mol-lib-api-contract

import { type Page, expect } from '@playwright/test';
import { MOLSecurityHeaderKeys } from '@wog/mol-lib-api-contract/auth/index.js';

// ── App-level constants ───────────────────────────────────────────────────
// These match the standard MOL pattern. Rename USECASE_ID_HEADER to match
// your app's header (the placeholder below shows the shape).

export const TOKEN_BYPASS_HEADER = 'mol-token-bypass';
export const USECASE_ID_HEADER   = '<your-app>-usecase-id';  // ← update per app

// ── Admin types ───────────────────────────────────────────────────────────

export enum AdminType {
  Cognito = 'Cognito',  // Cloud admin — ADMIN_ID header
  Wogaad  = 'Wogaad',  // Enterprise WOG AAD — WOG_USER_ID + WOG_USER_EMAIL
}

export interface AdminUser {
  adminType: AdminType;
  adminId: string;
  email: string;
  useCaseId?: string;
  useCaseName?: string;
}

/**
 * Build HTTP headers for an admin user.
 * Pass the result to setAuthHeaders().
 */
export function getAdminHeaders(user: AdminUser): Record<string, string> {
  const base: Record<string, string> = { [TOKEN_BYPASS_HEADER]: 'true' };
  if (user.useCaseId) base[USECASE_ID_HEADER] = user.useCaseId;

  switch (user.adminType) {
    case AdminType.Cognito:
      return { ...base, [MOLSecurityHeaderKeys.ADMIN_ID]: user.adminId };

    case AdminType.Wogaad:
      return {
        ...base,
        [MOLSecurityHeaderKeys.WOG_USER_ID]:     user.adminId,
        [MOLSecurityHeaderKeys.WOG_USER_EMAIL]:  user.email,
        [MOLSecurityHeaderKeys.USER_AUTH_LEVEL]: '2',
      };

    default:
      throw new Error(`Unknown AdminType: ${user.adminType}`);
  }
}

// ── Citizen types ─────────────────────────────────────────────────────────

export enum CitizenLoginType {
  Singpass      = 'Singpass',
  MobileOtp     = 'MobileOtp',
  GuestEnhanced = 'GuestEnhanced',
  Sso           = 'Sso',
  Wogad         = 'Wogad',
}

interface BaseCitizen { loginType: CitizenLoginType; userId: string }

export interface SingpassUser      extends BaseCitizen { loginType: CitizenLoginType.Singpass;      nric: string }
export interface MobileOtpUser     extends BaseCitizen { loginType: CitizenLoginType.MobileOtp;     mobileNumber: string }
export interface GuestEnhancedUser extends BaseCitizen { loginType: CitizenLoginType.GuestEnhanced; email: string }
export interface SsoUser           extends BaseCitizen { loginType: CitizenLoginType.Sso;           ssoUserId: string; agencyName: string }
export interface WogadCitizenUser  extends BaseCitizen { loginType: CitizenLoginType.Wogad;         email: string }

export type CitizenUser =
  | SingpassUser | MobileOtpUser | GuestEnhancedUser | SsoUser | WogadCitizenUser;

/**
 * Build HTTP headers for a citizen user.
 * Pass the result to setAuthHeaders().
 */
export function getCitizenHeaders(user: CitizenUser): Record<string, string> {
  // USER_AUTH_LEVEL '2' is the correct default for ALL citizen auth types.
  // Do NOT use '1' unless the user has configured it intentionally — never apply '1' by default.
  const base: Record<string, string> = {
    [TOKEN_BYPASS_HEADER]: 'true',
    [MOLSecurityHeaderKeys.USER_AUTH_LEVEL]: '2',
  };

  switch (user.loginType) {
    case CitizenLoginType.Singpass:
      return {
        ...base,
        [MOLSecurityHeaderKeys.USER_ID]:     user.userId,
        [MOLSecurityHeaderKeys.USER_UINFIN]: user.nric,
      };

    case CitizenLoginType.MobileOtp:
      return {
        ...base,
        [MOLSecurityHeaderKeys.MOBILE_OTP_ID]:           user.userId,
        [MOLSecurityHeaderKeys.MOBILE_OTP_PHONE_NUMBER]: user.mobileNumber,
      };

    case CitizenLoginType.GuestEnhanced:
      return {
        ...base,
        [MOLSecurityHeaderKeys.GUEST_ENHANCED_ID]:    user.userId,
        [MOLSecurityHeaderKeys.GUEST_ENHANCED_EMAIL]: user.email,
      };

    case CitizenLoginType.Sso:
      return {
        ...base,
        [MOLSecurityHeaderKeys.SSO_ID]:          user.userId,
        [MOLSecurityHeaderKeys.SSO_USER_ID]:     user.ssoUserId,
        [MOLSecurityHeaderKeys.SSO_TYPE]:        'DELEGATED',
        [MOLSecurityHeaderKeys.SSO_AGENCY_NAME]: user.agencyName,
      };

    case CitizenLoginType.Wogad:
      return {
        ...base,
        [MOLSecurityHeaderKeys.WOG_USER_ID]:    user.userId,
        [MOLSecurityHeaderKeys.WOG_USER_EMAIL]: (user as WogadCitizenUser).email,
      };

    default:
      throw new Error(`Unknown CitizenLoginType: ${(user as CitizenUser).loginType}`);
  }
}

// ── Shared utilities ──────────────────────────────────────────────────────

/**
 * Apply auth headers to a page for all subsequent requests.
 * Call this inside a Playwright fixture — not directly in spec files.
 *
 * @example
 * // In your base fixture:
 * adminPage: async ({ page, adminUser }, use) => {
 *   setAuthHeaders(page, getAdminHeaders(adminUser));
 *   await page.goto(`${process.env.BASE_URL}/admin/dashboard`);
 *   await use(page);
 * }
 */
export function setAuthHeaders(page: Page, headers: Record<string, string>): void {
  page.setExtraHTTPHeaders(headers);
}

/** Assert that the page redirected to the login route. */
export async function expectRedirectToLogin(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/login/);
}
