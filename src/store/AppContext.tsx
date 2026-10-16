import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CarePlan, Lang } from '../types';
import { STRINGS, type Strings } from '../i18n/strings';
import { migrateCarePlans } from '../lib/nandaCodeMigration';
import { translateVi } from '../lib/translate';
import { load, save } from './storage';

const KEYS = { plans: 'clinicalnnn.plans.v2', lang: 'clinicalnnn.lang', theme: 'clinicalnnn.theme' };

export type Theme = 'light' | 'dark';
export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info';
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
  toast: (message: string, tone?: Toast['tone']) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

/** Bản cũ tự tạo một kế hoạch mẫu; gỡ nó nếu vẫn là người bệnh mẫu ban đầu. */
function withoutSamplePlan(plans: CarePlan[]): CarePlan[] {
  return plans.filter((p) => !(p.id === 'plan-sample-1' && p.patient?.mrn === 'BN-240176'));
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Giao diện Việt hóa cố định; vẫn giữ khóa cũ để phục hồi cấu hình người dùng.
  const lang:Lang = 'vi';
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));
  const [plans, setPlans] = useState<CarePlan[]>(() => migrateCarePlans(withoutSamplePlan(load<CarePlan[] | null>(KEYS.plans, null) ?? [])));
  const [storageError, setStorageError] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const toastId = useRef(0);

  useEffect(() => { setStorageError(!save(KEYS.plans, plans)); }, [plans]);
  const retryStorage = useCallback(() => setStorageError(!save(KEYS.plans, plans)), [plans]);
  useEffect(() => {
    save(KEYS.lang, lang);
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    save(KEYS.theme, theme);
  }, [theme]);

  const toast = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts, { id, message, tone }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3200);
  }, []);

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
      paletteOpen,
      setPaletteOpen,
    }),
    [lang, theme, term, plans, storageError, retryStorage, toasts, toast, paletteOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
