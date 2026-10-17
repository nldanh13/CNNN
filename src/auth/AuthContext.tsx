import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  authConfigured, bootstrapSession, refreshSession, signIn as apiSignIn, signUp as apiSignUp,
  requestPasswordReset as apiReset, changePassword as apiPassword, changeFullName as apiName,
  revokeSession, storeSession, type AccountSession, type AccountUser,
} from './supabaseAuth';

interface AuthState {
  enabled: boolean;
  ready: boolean;
  user: AccountUser | null;
  session: AccountSession | null;
  signIn: (email: string, password: string, captchaToken?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, captchaToken?: string) => Promise<boolean>;
  resetPassword: (email: string, captchaToken?: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Context = createContext<AuthState | null>(null);
// React StrictMode mounts effects twice in development. Only one refresh-token
// exchange is allowed, since Supabase rotates refresh tokens.
let bootstrap: Promise<AccountSession | null> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AccountSession | null>(null);
  const [ready, setReady] = useState(!authConfigured);
  const commit = useCallback((next: AccountSession | null) => {
    storeSession(next);
    setSession(next);
  }, []);

  useEffect(() => {
    if (!authConfigured) return;
    let active = true;
    bootstrap ??= bootstrapSession();
    bootstrap.then(next => { if (active) { setSession(next); setReady(true); } })
      .catch(() => { if (active) { commit(null); setReady(true); } });
    return () => { active = false; };
  }, [commit]);

  useEffect(() => {
    if (!authConfigured || !session) return;
    const delay = Math.max(10000, (session.expires_at - Math.floor(Date.now() / 1000) - 90) * 1000);
    const id = window.setTimeout(() => {
      void refreshSession(session).then(commit).catch(() => commit(null));
    }, delay);
    return () => window.clearTimeout(id);
  }, [session, commit]);

  const signIn = useCallback(async (email: string, password: string, captchaToken?: string) => {
    commit(await apiSignIn(email.trim(), password, captchaToken));
  }, [commit]);

  const signUp = useCallback(async (email: string, password: string, name: string, captchaToken?: string) => {
    const next = await apiSignUp(email.trim(), password, name, captchaToken);
    if (next) commit(next);
    return Boolean(next);
  }, [commit]);

  const resetPassword = useCallback((email: string, captchaToken?: string) => apiReset(email.trim(), captchaToken), []);

  const updatePassword = useCallback(async (password: string) => {
    if (!session) throw new Error('Bạn cần đăng nhập.');
    await apiPassword(session, password);
    commit({ ...session, recovery: false });
  }, [session, commit]);

  const updateName = useCallback(async (name: string) => {
    if (!session) throw new Error('Bạn cần đăng nhập.');
    const user = await apiName(session, name);
    commit({ ...session, user });
  }, [session, commit]);

  const signOut = useCallback(async () => {
    const old = session;
    commit(null);
    if (old) {
      try { await revokeSession(old); } catch { /* Local logout must always succeed. */ }
    }
  }, [session, commit]);

  return <Context.Provider value={{
    enabled: authConfigured, ready, session, user: session?.user ?? null,
    signIn, signUp, resetPassword, updatePassword, updateName, signOut,
  }}>{children}</Context.Provider>;
}

export function useAuth() {
  const context = useContext(Context);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
