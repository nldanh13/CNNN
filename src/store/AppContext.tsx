import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CarePlan, Lang } from '../types';
import { STRINGS, type Strings } from '../i18n/strings';
import { translateVi } from '../lib/translate';
import { save } from './storage';
import { useAuth } from '../auth/AuthContext';
import { usePatientPlans } from './usePatientPlans';

const KEYS = { lang: 'clinicalnnn.lang', theme: 'clinicalnnn.theme' };

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
  planStatus: 'local' | 'loading' | 'ready' | 'migration' | 'error';
  planError: string;
  planSyncMessage: string;
  oldPlansCount: number;
  retryCloudPlans: () => void;
  importOldPlans: () => Promise<void>;
  skipOldPlans: () => void;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const lang: Lang = 'vi';
  const [theme, setTheme] = useState<Theme>(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const {
    plans, status: planStatus, statusError: planError,
    syncMessage: planSyncMessage, legacyCount: oldPlansCount,
    storageError, retryStorage, retryLoad: retryCloudPlans,
    importOldPlans, skipOldPlans, upsertPlan, updatePlan, deletePlan, mergePlans,
  } = usePatientPlans(auth);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const toastId = useRef(0);

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
      planStatus, planError, planSyncMessage, oldPlansCount,
      retryCloudPlans, importOldPlans, skipOldPlans,
      upsertPlan, updatePlan, deletePlan, mergePlans,
      toasts,
      toast,
      dismissToast,
      paletteOpen,
      setPaletteOpen,
    }),
    [lang, theme, term, plans, storageError, retryStorage, planStatus, planError, planSyncMessage, oldPlansCount, retryCloudPlans, importOldPlans, skipOldPlans, upsertPlan, updatePlan, deletePlan, mergePlans, toasts, toast, dismissToast, paletteOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
