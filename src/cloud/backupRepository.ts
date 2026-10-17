/**
 * Explicit owner-only backup operations for demo/training data.
 * Cloud sync is OPT-IN and gated until an administrator has run the RLS migration.
 * Never send the service_role/secret key to browsers; Supabase checks the JWT with RLS.
 */
import type { AccountSession } from '../auth/supabaseAuth';
import type { CarePlan } from '../types';
import { backupJson, parseBackup } from '../lib/backup';

const baseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
export const cloudBackupEnabled = import.meta.env.VITE_CLOUD_BACKUP_ENABLED === 'true' && Boolean(baseUrl && publicKey);
const TABLE = 'cnnn_backup_snapshots';
const MAX_BYTES = 1048576;

export interface CloudBackupSummary {
  id: string;
  created_at: string;
  plan_count: number;
}

interface CloudBackupRow {
  payload: unknown;
}

type ApiError = { message?: string; details?: string; hint?: string; code?: string };

function getError(data: unknown, response: Response): string {
  const err = data && typeof data === 'object' ? data as ApiError : {};
  if (err.code === '42P01' || err.code === 'PGRST205') {
    return 'Chưa tạo bảng lưu trữ trên Supabase. Quản trị viên cần chạy migration.';
  }
  if (response.status === 401 || response.status === 403) {
    return 'Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Hãy đăng nhập lại.';
  }
  if (err.code === '23514') {
    return 'Bản sao lưu không hợp lệ hoặc đã đạt giới hạn dung lượng/số lượng. Hãy xóa bản cũ hoặc thử bản nhỏ hơn.';
  }
  if (response.status === 413) {
    return 'Bản sao lưu vượt giới hạn dung lượng.';
  }
  return 'Không thể kết nối kho sao lưu. Hãy thử lại sau.';
}

async function request<T>(
  session: AccountSession, method: 'GET' | 'POST' | 'DELETE', query: string, body?: object,
): Promise<T> {
  if (!cloudBackupEnabled || !session.user?.id || !session.access_token) {
    throw new Error('Kho lưu trữ tài khoản chưa sẵn sàng.');
  }
  const apiPath = '/rest/v1/' + TABLE + (query ? '?' + query : '');
  let response: Response;
  try {
    response = await fetch(baseUrl + apiPath, {
      method,
      headers: {
        apikey: publicKey,
        Authorization: 'Bearer ' + session.access_token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Prefer: 'return=representation',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: 'no-store',
    });
  } catch {
    throw new Error('Không có kết nối mạng. Bản sao lưu trên thiết bị vẫn được giữ nguyên.');
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(getError(data, response));
  return data as T;
}

export async function listCloudBackups(session: AccountSession): Promise<CloudBackupSummary[]> {
  // The database RLS policy enforces ownership. This filter only optimizes queries.
  const query = 'select=id,created_at,plan_count&user_id=eq.' +
    encodeURIComponent(session.user.id) + '&order=created_at.desc&limit=10';
  const rows = await request<CloudBackupSummary[]>(session, 'GET', query);
  if (!Array.isArray(rows)) throw new Error('Dữ liệu phản hồi từ Supabase không hợp lệ.');
  return rows;
}

export async function createCloudBackup(session: AccountSession, plans: CarePlan[]): Promise<void> {
  if (plans.length === 0) throw new Error('Chưa có kế hoạch để sao lưu.');
  if (plans.length > 1000) throw new Error('Vượt giới hạn 1.000 kế hoạch trong một bản sao lưu.');
  const payload = JSON.parse(backupJson(plans)) as object;
  const serialized = JSON.stringify(payload);
  if (new TextEncoder().encode(serialized).length > MAX_BYTES) {
    throw new Error('Bản sao lưu lớn hơn 1 MB. Hãy xuất JSON về máy thay vì tải lên đám mây.');
  }
  await request<CloudBackupSummary[]>(session, 'POST', '', {
    user_id: session.user.id,
    payload,
    plan_count: plans.length,
  });
}

export async function downloadCloudBackup(session: AccountSession, id: string): Promise<CarePlan[]> {
  const query = 'select=payload&id=eq.' + encodeURIComponent(id) + '&user_id=eq.' +
    encodeURIComponent(session.user.id) + '&limit=1';
  const rows = await request<CloudBackupRow[]>(session, 'GET', query);
  if (!Array.isArray(rows) || rows.length !== 1) throw new Error('Không tìm thấy bản sao lưu trong tài khoản này.');
  return parseBackup(JSON.stringify(rows[0].payload));
}

export async function deleteCloudBackup(session: AccountSession, id: string): Promise<void> {
  const query = 'id=eq.' + encodeURIComponent(id) + '&user_id=eq.' + encodeURIComponent(session.user.id);
  const rows = await request<Array<{ id: string }>>(session, 'DELETE', query);
  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new Error('Không tìm thấy bản sao lưu cần xóa.');
  }
}

/**
 * Read-only adversarial RLS check. The query deliberately omits user_id:
 * the database must filter other users' records via its authenticated JWT
 * and RLS policies, NOT through a client-supplied owner filter.
 * Never fetch payload or perform a DELETE during this check.
 */
export async function canReadCloudBackupId(session: AccountSession, id: string): Promise<boolean> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id.trim())) {
    throw new Error('Mã bản sao lưu không đúng định dạng UUID.');
  }
  const rows = await request<Array<{ id: string }>>(session, 'GET',
    'select=id&id=eq.' + encodeURIComponent(id.trim()) + '&limit=1');
  if (!Array.isArray(rows)) throw new Error('Dữ liệu phản hồi không hợp lệ.');
  return rows.length > 0;
}
