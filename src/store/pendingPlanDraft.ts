import type { CarePlan } from '../types';
import { save } from './storage';

/** Durable, account-scoped journal. Includes zero-plan drafts (a legitimate deletion). */
export interface PendingPlanDraft {
  version: 1;
  plans: CarePlan[];
  baseRevision: number | null;
  savedAt: string;
}
export const PENDING_DRAFT_PREFIX = 'clinicalnnn.cloud.pending-draft.user.';
export const PARKED_DRAFT_PREFIX = 'clinicalnnn.cloud.parked-draft.user.';

export function readPlanDraft(key: string): PendingPlanDraft | null {
  // Detect corruption rather than silently overwriting a user's only local copy.
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  if (raw === null) return null;
  let entry: unknown;
  try { entry = JSON.parse(raw); }
  catch { throw new Error('Bản nháp trên thiết bị bị lỗi định dạng. Không ghi đè; hãy liên hệ quản trị viên.'); }
  const value = entry as Partial<PendingPlanDraft> | null;
  if (value?.version !== 1 || !Array.isArray(value.plans) ||
      value.plans.some(p => !p || typeof p.id !== 'string' || !p.patient || !Array.isArray(p.entries)) ||
      !(value.baseRevision === null || (Number.isSafeInteger(value.baseRevision) && (value.baseRevision ?? -1) >= 0))) {
    throw new Error('Bản nháp trên thiết bị không hợp lệ. Không ghi đè dữ liệu cũ.');
  }
  return value as PendingPlanDraft;
}

export function writePlanDraft(key: string, plans: CarePlan[], baseRevision: number | null): boolean {
  return save(key, {
    version: 1, plans, baseRevision, savedAt: new Date().toISOString(),
  } satisfies PendingPlanDraft);
}

export function removePlanDraft(key: string): boolean {
  try { localStorage.removeItem(key); return true; }
  catch { return false; }
}

/** Preserve unsynced edits separately before showing cloud data. Never overwrite earlier parked edits. */
export function parkPlanDraft(source: string, destination: string, fallback: PendingPlanDraft): boolean {
  // Check raw existence: even an unreadable archive must never be overwritten.
  try { if (localStorage.getItem(destination) !== null) return false; }
  catch { return false; }
  const snapshot = readPlanDraft(source) ?? fallback;
  return save(destination, snapshot);
}
