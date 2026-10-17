/** Isolate browser-only care plans per authenticated account.
 * The legacy key is deliberately retained for guest mode and backup migration.
 * These local drafts are NOT suitable for storing clinical patient records.
 */
export const LEGACY_PLAN_KEY = 'clinicalnnn.plans.v2';

export function carePlanStorageKey(authEnabled: boolean, userId: string | null): string | null {
  if (!authEnabled) return LEGACY_PLAN_KEY;
  if (!userId) return null; // No anonymous plan access in account mode.
  return LEGACY_PLAN_KEY + '.user.' + userId;
}
