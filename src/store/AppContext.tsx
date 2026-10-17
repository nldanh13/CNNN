import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CarePlan, Lang } from '../types';
import { STRINGS, type Strings } from '../i18n/strings';
import { migrateCarePlans } from '../lib/nandaCodeMigration';
import { translateVi } from '../lib/translate';
import { load, save } from './storage';
import { useAuth } from '../auth/AuthContext';
import { carePlanStorageKey } from './planScope';

const KEYS = { plans: 'clinicalnnn.plans.v2', lang: 'clinicalnnn.lang', theme: 'clinicalnnn.theme' };

export type Theme = 'light' | 'dark';
export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info';
  /** Nút hành động kèm theo, ví dụ “Hoàn tác” sau khi xóa. */
  action?: { label: string; run: () => void };
}

interface AppState {
  lang: Lang;
  t: Strings;
  theme: Theme;
  setTheme: (t: Theme) => void;
  /** Nhãn hiển thị theo ngôn ngữ: tiếng Việt (kèm cờ dịch máy) hoặc nhãn gốc tiếng Anh. */
  term: (code: string | null, en: string) => { text: string; machine: boolean };
  plans: CarePlan[];
  storageError: boolean;
  retryStorage: () => void;
  upsertPlan: (plan: CarePlan) => void;
  updatePlan: (id: string, fn: (p: CarePlan) => CarePlan) => void;
  deletePlan: (id: string) => void;
  /** Thêm hoặc thay kế hoạch theo id, dùng khi khôi phục từ tệp sao lưu. */
  mergePlans: (incoming: CarePlan[]) => void;
  toasts: Toast[];
  toast: (message: string, tone?: Toast['tone'], action?: Toast['action']) => void;
  dismissToast: (id: number) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

/** Bản cũ tự tạo một kế hoạch mẫu; gỡ nó nếu vẫn là người bệnh mẫu ban đầu. */
function withoutSamplePlan(plans: CarePlan[]): CarePlan[] {
  return plans.filter((p) => !(p.id === 'plan-sample-1' && p.patient?.mrn === 'BN-240176'));
}

function readPlans(key: string): CarePlan[] {
  return migrateCarePlans(withoutSamplePlan(load<CarePlan[] | null>(key, null) ?? []));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  // In account mode, never attach the old unscoped plans to a newly logged-in user.
  // Users must explicitly import their legacy backup into their own account.
  const planKey = carePlanStorageKey(auth.enabled, auth.user?.id ?? null);
  // Giao diện Việt hóa cố định; vẫn giữ khóa cũ để phục hồi cấu hình người dùng.
  const lang:Lang = 'vi';
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));
  const [planState, setPlanState] = useState<{ key: string | null; plans: CarePlan[] }>(
    () => ({ key: planKey, plans: planKey ? readPlans(planKey) : [] }),
  );
  const plans = planState.key === planKey ? planState.plans : [];
  const setPlans = (change: (current: CarePlan[]) => CarePlan[]) => {
    setPlanState(previous => previous.key === planKey
      ? { ...previous, plans: change(previous.plans) } : previous);
  };
  const [storageError, setStorageError] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const toastId = useRef(0);

  useEffect(() => {
    setPlanState({ key: planKey, plans: planKey ? readPlans(planKey) : [] });
    setStorageError(false);
  }, [planKey]);
  useEffect(() => {
    if (!auth.ready || !planKey || planState.key !== planKey) return;
    setStorageError(!save(planKey, planState.plans));
  }, [auth.ready, planKey, planState]);
  const retryStorage = useCallback(() => {
    if (!planKey || planState.key !== planKey) return;
    setStorageError(!save(planKey, planState.plans));
  }, [planKey, planState]);
  useEffect(() => {
    save(KEYS.lang, lang);
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    save(KEYS.theme, theme);
  }, [theme]);

  const dismissToast = useCallback((id: number) => setToasts((ts) => ts.filter((x) => x.id !== id)), []);
  const toast = useCallback((message: string, tone: Toast['tone'] = 'success', action?: Toast['action']) => {
    const id = ++toastId.current;
    // Như snackbar của các app lớn: chỉ hiện một thông báo, thông báo mới thay thông báo cũ.
    setToasts([{ id, message, tone, action }]);
    // Thông báo có nút Hoàn tác cần ở lâu hơn để kịp bấm.
    setTimeout(() => dismissToast(id), action ? 6000 : 3200);
  }, [dismissToast]);

  const term = useCallback(
    (code: string | null, en: string) => {
      if (!en) return { text: en, machine: false };
      const r = translateVi(code, en);
      return { text: r.text, machine: !r.curated && r.text.toLowerCase() !== en.toLowerCase() };
    },
    [lang],
  );

  const value = useMemo<AppState>(
    () => ({
      lang,
      t: STRINGS.vi,
      theme,
      setTheme,
      term,
      plans,
      storageError,
      retryStorage,
      upsertPlan: (plan) =>
        setPlans((ps) => (ps.some((p) => p.id === plan.id) ? ps.map((p) => (p.id === plan.id ? plan : p)) : [plan, ...ps])),
      updatePlan: (id, fn) =>
        setPlans((ps) => ps.map((p) => (p.id === id ? { ...fn(p), updatedAt: new Date().toISOString() } : p))),
      deletePlan: (id) => setPlans((ps) => ps.filter((p) => p.id !== id)),
      mergePlans: (incoming) =>
        setPlans((ps) => {
          const ids = new Set(incoming.map((p) => p.id));
          return [...incoming, ...ps.filter((p) => !ids.has(p.id))];
        }),
      toasts,
      toast,
      dismissToast,
      paletteOpen,
      setPaletteOpen,
    }),
    [lang, theme, term, plans, storageError, retryStorage, toasts, toast, dismissToast, paletteOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
