/**
 * Supabase GoTrue authentication over its documented HTTP API.
 * No backend service key or password is stored in browser storage.
 * Only a short-lived per-tab session is persisted (sessionStorage).
 *
 * This module authenticates users; it does NOT provide secure patient-data storage.
 */
export interface AccountUser {
  id: string;
  email: string;
  user_metadata?: { full_name?: string };
}
export interface AccountSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AccountUser;
  recovery?: boolean;
}

const url = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const authConfigured = Boolean(url && publicKey && (() => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || (parsed.protocol === 'http:' && parsed.hostname === 'localhost');
  } catch { return false; }
})());
const SESSION_KEY = 'clinicalnnn.auth.session.v1';

function configured() {
  if (!authConfigured) throw new Error('Chưa cấu hình dịch vụ tài khoản Supabase.');
}

async function request<T>(path: string, method: string, body?: object, token?: string): Promise<T> {
  configured();
  let response: Response;
  try {
    response = await fetch(url + '/auth/v1/' + path, {
      method,
      headers: {
        apikey: publicKey,
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error('Không kết nối được dịch vụ tài khoản. Vui lòng thử lại.');
  }
  const result: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = result as { msg?: string; message?: string; error_description?: string; error?: string };
    throw new Error(error.msg || error.message || error.error_description || error.error || 'Yêu cầu tài khoản không thành công.');
  }
  return result as T;
}

type TokenResponse = { access_token: string; refresh_token: string; expires_in: number; user: AccountUser };

function toSession(token: TokenResponse, recovery = false): AccountSession {
  if (!token?.access_token || !token.refresh_token || !token.user?.id || !token.user?.email) {
    throw new Error('Phản hồi phiên đăng nhập không hợp lệ.');
  }
  return {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + Number(token.expires_in || 3600),
    user: token.user,
    recovery,
  };
}

export function storeSession(session: AccountSession | null) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch { /* Some privacy modes block sessionStorage. */ }
}

function readSession(): AccountSession | null {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') as AccountSession | null;
    return parsed?.access_token && parsed.refresh_token && parsed.user?.id ? parsed : null;
  } catch { return null; }
}

/** Supabase email callbacks use a hash fragment containing short-lived credentials.
 * Consume it before the application's hash router, then erase credentials from URL. */
function consumeEmailCallback(): AccountSession | null {
  const hash = window.location.hash;
  if (!/^#(?:access_token=|error=|error_code=)/.test(hash)) return null;
  const params = new URLSearchParams(hash.slice(1));
  window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/account');
  if (params.has('error')) throw new Error(params.get('error_description') || 'Liên kết email không hợp lệ hoặc đã hết hạn.');
  const token = params.get('access_token');
  const refresh = params.get('refresh_token');
  if (!token || !refresh) throw new Error('Liên kết xác nhận thiếu thông tin phiên đăng nhập.');
  return {
    access_token: token,
    refresh_token: refresh,
    expires_at: Math.floor(Date.now() / 1000) + Number(params.get('expires_in') || 3600),
    // Fetch the canonical user from Supabase, never infer identity from URL.
    user: { id: '', email: '' },
    recovery: params.get('type') === 'recovery',
  };
}

export async function refreshSession(session: AccountSession): Promise<AccountSession> {
  const response = await request<TokenResponse>('token?grant_type=refresh_token', 'POST', {
    refresh_token: session.refresh_token,
  });
  return toSession(response, session.recovery);
}

export async function bootstrapSession(): Promise<AccountSession | null> {
  if (!authConfigured) return null;
  const fromCallback = consumeEmailCallback();
  const existing = fromCallback || readSession();
  if (!existing) return null;
  try {
    let next = existing;
    if (next.expires_at < Math.floor(Date.now() / 1000) + 90) next = await refreshSession(next);
    const user = await request<AccountUser>('user', 'GET', undefined, next.access_token);
    if (!user.id || !user.email) throw new Error('Phiên tài khoản không hợp lệ.');
    next = { ...next, user };
    storeSession(next);
    return next;
  } catch {
    storeSession(null);
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<AccountSession> {
  const token = await request<TokenResponse>('token?grant_type=password', 'POST', { email, password });
  return toSession(token);
}

/**
 * Keep the GitHub Pages repository path (/CNNN/) on links from Supabase emails.
 * Do not include #/ routes or query strings, which are used by the SPA router.
 */
function authRedirectUrl(): string {
  return window.location.origin + window.location.pathname;
}

export async function signUp(email: string, password: string, fullName: string): Promise<AccountSession | null> {
  const redirect = authRedirectUrl();
  const response = await request<Partial<TokenResponse>>('signup?redirect_to=' + encodeURIComponent(redirect), 'POST', {
    email, password, data: { full_name: fullName.trim() },
  });
  return response.access_token && response.refresh_token && response.user
    ? toSession(response as TokenResponse)
    : null; // Email confirmation enabled: user must open the confirmation email.
}

export async function requestPasswordReset(email: string): Promise<void> {
  const redirect = authRedirectUrl();
  await request('recover?redirect_to=' + encodeURIComponent(redirect), 'POST', { email });
}

export async function changePassword(session: AccountSession, password: string): Promise<void> {
  await request('user', 'PUT', { password }, session.access_token);
}

export async function changeFullName(session: AccountSession, fullName: string): Promise<AccountUser> {
  return request<AccountUser>('user', 'PUT', { data: { full_name: fullName.trim() } }, session.access_token);
}

export async function revokeSession(session: AccountSession): Promise<void> {
  await request('logout', 'POST', undefined, session.access_token);
}
