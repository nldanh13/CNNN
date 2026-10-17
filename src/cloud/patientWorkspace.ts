import type { AccountSession } from '../auth/supabaseAuth';
import type { CarePlan } from '../types';
import { migrateCarePlans } from '../lib/nandaCodeMigration';
import { parseBackup } from '../lib/backup';

export const MAX_PATIENTS = 3;
export const patientCloudEnabled =
  import.meta.env.VITE_PATIENT_CLOUD_ENABLED === 'true' &&
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export interface PatientWorkspace {
  plans: CarePlan[];
  revision: number;
}

export class CloudWorkspaceError extends Error {
  constructor(message: string, readonly kind: 'conflict' | 'network' | 'setup' | 'quota' | 'other') {
    super(message);
    this.name = 'CloudWorkspaceError';
  }
}

async function request<T>(
  session: AccountSession,
  path: string,
  method: 'GET' | 'POST',
  body?: object,
): Promise<T> {
  if (!patientCloudEnabled || !session.access_token || !session.user?.id) {
    throw new CloudWorkspaceError('Kho dữ liệu tài khoản chưa được kích hoạt.', 'setup');
  }
  let response: Response;
  try {
    response = await fetch(url + '/rest/v1/' + path, {
      method,
      headers: {
        apikey: publicKey,
        Authorization: 'Bearer ' + session.access_token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: 'no-store',
    });
  } catch {
    throw new CloudWorkspaceError('Không kết nối được Supabase. Dữ liệu đang sửa vẫn còn trên thiết bị này.', 'network');
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const err = payload as { code?: string } | null;
    if (err?.code === '40001') {
      throw new CloudWorkspaceError('Dữ liệu đã thay đổi trên thiết bị khác. Chưa ghi đè: hãy giữ bản đang sửa và tải lại sau khi đối chiếu.', 'conflict');
    }
    if (err?.code === '23514') {
      throw new CloudWorkspaceError('Mỗi tài khoản tối đa 3 người bệnh hoặc tổng dữ liệu vượt giới hạn lưu trữ.', 'quota');
    }
    if (err?.code === '42P01' || err?.code === 'PGRST205' || err?.code === 'PGRST202') {
      throw new CloudWorkspaceError('Chưa tạo bảng kế hoạch tài khoản trên Supabase. Quản trị viên cần chạy SQL mới.', 'setup');
    }
    if (response.status === 401 || response.status === 403) {
      throw new CloudWorkspaceError('Phiên đăng nhập hết hạn hoặc chưa có quyền lưu. Hãy đăng nhập lại.', 'other');
    }
    throw new CloudWorkspaceError('Không thể lưu dữ liệu trên tài khoản. Dữ liệu trên thiết bị vẫn được giữ.', 'other');
  }
  return payload as T;
}

export async function loadPatientWorkspace(session: AccountSession): Promise<PatientWorkspace> {
  const query = 'cnnn_patient_workspaces?select=plans,revision&user_id=eq.' +
    encodeURIComponent(session.user.id) + '&limit=1';
  const rows = await request<Array<{ plans: unknown; revision: number }>>(session, query, 'GET');
  if (!Array.isArray(rows)) throw new CloudWorkspaceError('Dữ liệu Supabase không hợp lệ.', 'other');
  if (!rows.length) return { plans: [], revision: 0 };
  if (rows.length !== 1 || !Array.isArray(rows[0].plans) ||
    !Number.isSafeInteger(rows[0].revision) || rows[0].revision < 1) {
    throw new CloudWorkspaceError('Không nhận diện được kho dữ liệu tài khoản.', 'other');
  }
  const plans = rows[0].plans as CarePlan[];
  if (plans.length > MAX_PATIENTS ||
    plans.some(p => !p || typeof p.id !== 'string' || !p.patient || !Array.isArray(p.entries))) {
    throw new CloudWorkspaceError('Dữ liệu kế hoạch tài khoản không hợp lệ.', 'other');
  }
  return { plans: migrateCarePlans(plans), revision: rows[0].revision };
}

export async function savePatientWorkspace(
  session: AccountSession,
  expectedRevision: number,
  plans: CarePlan[],
): Promise<number> {
  if (plans.length > MAX_PATIENTS) throw new CloudWorkspaceError('Mỗi tài khoản tối đa 3 người bệnh.', 'quota');
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
    throw new CloudWorkspaceError('Phiên dữ liệu không hợp lệ.', 'other');
  }
  const result = await request<number>(
    session, 'rpc/cnnn_save_patient_workspace', 'POST',
    { p_expected_revision: expectedRevision, p_plans: plans },
  );
  if (!Number.isSafeInteger(result) || result <= expectedRevision) {
    throw new CloudWorkspaceError('Supabase không xác nhận phiên bản dữ liệu đã lưu.', 'other');
  }
  return result;
}

/**
 * Read the last old backup ONLY for one-time, user-confirmed migration.
 * This path is not exposed as a backup/restore UI. Existing snapshots are
 * left in their original protected table; no destructive data conversion.
 */
export async function findPreviousAccountPlans(session: AccountSession): Promise<CarePlan[]> {
  const query = 'cnnn_backup_snapshots?select=payload&user_id=eq.' +
    encodeURIComponent(session.user.id) + '&order=created_at.desc&limit=1';
  const rows = await request<Array<{ payload: unknown }>>(session, query, 'GET');
  if (!Array.isArray(rows) || !rows.length) return [];
  return parseBackup(JSON.stringify(rows[0].payload));
}
