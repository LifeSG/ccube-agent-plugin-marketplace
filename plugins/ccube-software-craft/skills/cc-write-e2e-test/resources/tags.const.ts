// Purpose: Type-safe, composable test tags. Eliminates magic-string typos
// and enables composable `--grep` filters like:
//   npx playwright test --grep "(?=.*@Citizen)(?=.*@Booking)"
//
// Copy to support/tags.const.ts. Extend the enums as your suite grows.

export enum FeatureTag {
  BOOKING  = 'Booking',
  SCHEDULE = 'Schedule',
  RESOURCE = 'Resource',
  ADMIN    = 'AdminMgmt',
  REPORT   = 'Report',
}

export enum UserTypeTag {
  ADMIN      = 'Admin',
  CITIZEN    = 'Citizen',
  SUPERADMIN = 'SuperAdmin',
  WOGAAD     = 'WogAad',
}

export enum ActionTag {
  CREATE = 'Create',
  READ   = 'Read',
  UPDATE = 'Update',
  DELETE = 'Delete',
}

type ValidTag = FeatureTag | UserTypeTag | ActionTag;

/** Turns an enum value (or array) into Playwright's `tag` prop shape. */
export function toTag(input: ValidTag | ValidTag[]): string[] {
  const arr = Array.isArray(input) ? input : [input];
  return arr.map((t) => `@${t}`);
}

// Usage in a spec:
//   import { toTag, UserTypeTag, FeatureTag, ActionTag } from '../helpers/tags.const';
//
//   test('citizen books an appointment',
//     { tag: toTag([UserTypeTag.CITIZEN, FeatureTag.BOOKING, ActionTag.CREATE]) },
//     async ({ page }) => { /* ... */ });
//
// Run subsets:
//   npx playwright test --grep @Booking
//   npx playwright test --grep "(?=.*@Citizen)(?=.*@Booking)(?=.*@Create)"
