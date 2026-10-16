import type { CarePlan } from '../types';
import { migrateCarePlans } from './nandaCodeMigration';

const FORMAT = 'clinicalnnn-backup';

/** Tệp sao lưu chứa toàn bộ kế hoạch trên máy, giữ nguyên cấu trúc lưu trữ. */
export function backupJson(plans: CarePlan[]): string {
  return JSON.stringify({ format: FORMAT, version: 1, exportedAt: new Date().toISOString(), plans }, null, 2);
}

export function backupFileName(date = new Date()): string {
  return `clinicalnnn-sao-luu-${date.toISOString().slice(0, 10)}.json`;
}

function isPlan(x: unknown): x is CarePlan {
  if (!x || typeof x !== 'object') return false;
  const p = x as Partial<CarePlan>;
  return (
    typeof p.id === 'string' &&
    typeof p.code === 'string' &&
    !!p.patient &&
    typeof p.patient === 'object' &&
    Array.isArray(p.entries) &&
    p.entries.every((e) => !!e && typeof e === 'object' && !!e.nanda && !!e.noc && Array.isArray(e.nic))
  );
}

/** Đọc tệp sao lưu; ném lỗi khi tệp không đúng định dạng để giao diện báo cho người dùng. */
export function parseBackup(text: string): CarePlan[] {
  const raw: unknown = JSON.parse(text);
  const list = Array.isArray(raw) ? raw : (raw as { format?: string; plans?: unknown })?.format === FORMAT ? (raw as { plans: unknown }).plans : null;
  if (!Array.isArray(list) || !list.every(isPlan)) throw new Error('Invalid ClinicalNNN backup');
  return migrateCarePlans(list);
}

export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
