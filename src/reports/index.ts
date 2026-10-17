import type { ReportRepository } from './ReportRepository';
import { supabaseReportRepository } from './supabaseRepository';
import { apiReportRepository } from './apiRepository';

export type { ReportIdentity, StoredReport, ReportStatus, ReportRepository } from './ReportRepository';
export { reportStatusLabel, REPORT_STATUSES } from './ReportRepository';

const provider = import.meta.env.VITE_REPORTS_PROVIDER || 'supabase';
export function getReportRepository(): ReportRepository | null {
  if (provider === 'supabase') return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    ? supabaseReportRepository : null;
  if (provider === 'api') {
    const url = import.meta.env.VITE_REPORTS_API_URL || '';
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:' || (parsed.hostname === 'localhost' && parsed.protocol === 'http:')) {
        return apiReportRepository;
      }
    } catch { /* invalid URL; no report submission */ }
  }
  return null;
}
