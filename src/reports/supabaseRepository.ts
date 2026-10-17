import type { ReportRepository, ReportIdentity, ReportStatus, StoredReport } from './ReportRepository';
import type { DataReport } from '../lib/dataReports';

const base = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

async function request<T>(path: string, identity: ReportIdentity, method = 'GET', body?: object): Promise<T> {
  if (!base || !publishableKey || !identity.accessToken) {
    throw new Error('Hệ thống báo cáo chưa được cấu hình hoặc phiên đăng nhập đã hết hạn.');
  }
  let response: Response;
  try {
    response = await fetch(base + '/rest/v1/' + path, {
      method,
      headers: {
        apikey: publishableKey,
        Authorization: 'Bearer ' + identity.accessToken,
        'Content-Type': 'application/json',
        ...(method === 'POST' ? { Prefer: 'return=minimal' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error('Không thể kết nối hệ thống báo cáo. Vui lòng thử lại.');
  }
  if (response.status === 401) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  if (response.status === 404) throw new Error('Bảng báo cáo chưa được cài đặt. Vui lòng liên hệ quản trị viên CNNN.');
  if (!response.ok) {
    // Never expose PostgREST SQL details or user tokens to the interface.
    if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này.');
    throw new Error('Không thể lưu hoặc tải báo cáo. Vui lòng thử lại hoặc liên hệ quản trị viên.');
  }
  if (response.status === 204 || !response.headers.get('content-type')?.includes('json')) return undefined as T;
  return response.json() as Promise<T>;
}
const fields = 'id,reporter_id,system,code,label,edition,category,description,suggestion,evidence,status,admin_note,created_at,updated_at';
function paging(offset = 0, limit = 50): string {
  return '&order=created_at.desc&offset=' + Math.max(0, offset) + '&limit=' + Math.min(100, Math.max(1, limit));
}
export const supabaseReportRepository: ReportRepository = {
  async submit(identity, report: DataReport) {
    await request('data_reports', identity, 'POST', {
      ...report, reporter_id: identity.userId,
    });
  },
  listMine(identity, offset, limit) {
    return request<StoredReport[]>('data_reports?select=' + fields
      + '&reporter_id=eq.' + encodeURIComponent(identity.userId) + paging(offset, limit), identity);
  },
  async isAdmin(identity) {
    const rows = await request<Array<{ user_id: string }>>('report_admins?select=user_id&user_id=eq.'
      + encodeURIComponent(identity.userId) + '&limit=1', identity);
    return rows.some(row => row.user_id === identity.userId);
  },
  listAll(identity, offset, limit) {
    // Authorization is enforced by database RLS; never trust this UI call.
    return request<StoredReport[]>('data_reports?select=' + fields + paging(offset, limit), identity);
  },
  async updateStatus(identity, id: string, status: ReportStatus, note: string) {
    await request('data_reports?id=eq.' + encodeURIComponent(id), identity, 'PATCH', {
      status, admin_note: note.trim() || null,
    });
  },
};
