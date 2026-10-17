import type { DataReport } from '../lib/dataReports';

/** Stable provider-neutral contract. No Supabase types or URLs in UI. */
export type ReportStatus = 'new' | 'reviewing' | 'resolved' | 'rejected';
export interface StoredReport extends DataReport {
  id: string;
  reporter_id: string;
  status: ReportStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}
export interface ReportIdentity {
  userId: string;
  accessToken: string;
}
export interface ReportRepository {
  submit(identity: ReportIdentity, report: DataReport): Promise<void>;
  listMine(identity: ReportIdentity, offset?: number, limit?: number): Promise<StoredReport[]>;
  isAdmin(identity: ReportIdentity): Promise<boolean>;
  listAll(identity: ReportIdentity, offset?: number, limit?: number): Promise<StoredReport[]>;
  updateStatus(identity: ReportIdentity, id: string, status: ReportStatus, note: string): Promise<void>;
}
export const REPORT_STATUSES: ReadonlyArray<{ value: ReportStatus; label: string }> = [
  { value: 'new', label: 'Mới' },
  { value: 'reviewing', label: 'Đang xử lý' },
  { value: 'resolved', label: 'Đã giải quyết' },
  { value: 'rejected', label: 'Không phù hợp' },
];
export function reportStatusLabel(status: ReportStatus): string {
  return REPORT_STATUSES.find(entry => entry.value === status)?.label ?? status;
}
