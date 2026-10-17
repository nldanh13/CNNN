import type { ReportRepository, ReportIdentity, StoredReport } from './ReportRepository';
import type { DataReport } from '../lib/dataReports';

/**
 * Portable backend contract (see docs/REPORTS_ARCHITECTURE.md).
 * Can point to another service after migration; all screens remain unchanged.
 * Backend MUST verify the bearer token and enforce access rules itself.
 */
const apiUrl = (import.meta.env.VITE_REPORTS_API_URL || '').replace(/\/$/, '');
async function call<T>(identity: ReportIdentity, path: string, method = 'GET', payload?: object): Promise<T> {
  if (!apiUrl || !identity.accessToken) throw new Error('Hệ thống báo cáo chưa được cấu hình.');
  const url = apiUrl + path;
  let response: Response;
  try {
    response = await fetch(url, {
      method, headers: {
        Authorization: 'Bearer ' + identity.accessToken,
        'Content-Type': 'application/json',
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    });
  } catch { throw new Error('Không thể kết nối máy chủ báo cáo.'); }
  if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
  if (response.status === 403) throw new Error('Không có quyền truy cập báo cáo.');
  if (!response.ok) throw new Error('Dịch vụ báo cáo hiện không sẵn sàng.');
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
const range = (offset = 0, limit = 50) => '?offset=' + Math.max(0, offset) + '&limit='
  + Math.min(100, Math.max(1, limit));

export const apiReportRepository: ReportRepository = {
  async submit(identity, report: DataReport) { await call(identity, '/reports', 'POST', report); },
  listMine(identity, offset, limit) { return call<StoredReport[]>(identity, '/reports/mine' + range(offset, limit)); },
  async isAdmin(identity) { return (await call<{ isAdmin: boolean }>(identity, '/reports/me/admin')).isAdmin; },
  listAll(identity, offset, limit) { return call<StoredReport[]>(identity, '/reports' + range(offset, limit)); },
  async updateStatus(identity, id, status, note) {
    await call(identity, '/reports/' + encodeURIComponent(id), 'PATCH', { status, admin_note: note.trim() || null });
  },
};
