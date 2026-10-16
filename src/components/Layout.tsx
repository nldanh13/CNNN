import { useEffect, type ReactNode } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Info, Library, Search, Settings, BookOpen, ClipboardList, BookText, Sparkles } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { cx } from '../lib/utils';
import { Kbd } from './ui';
import { CommandPalette } from './CommandPalette';

interface NavItem {
  href: string;
  key: string;
  label: string;
  short?: string;
  icon: ReactNode;
  badge?: ReactNode;
}

/** Các trang phụ được tô sáng dưới mục menu chứa chúng. */
const NAV_OF_SECTION: Record<string, string> = {
  dashboard: 'home',
  assistant: 'assistant',
  library: 'home',
  'nic-reader': 'nic-reader',
  standards: 'home',
  plans: 'plans',
  references: 'references',
  quality: 'references',
  settings: 'settings',
};

export function Layout({ section, children }: { section: string; children: ReactNode }) {
  const { t, toasts, storageError, retryStorage, setPaletteOpen } = useApp();
  const activeKey = NAV_OF_SECTION[section] ?? 'home';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPaletteOpen]);

  const items: NavItem[] = [
    { href: '#/library', key: 'home', label: t.nav.library, icon: <BookOpen className="h-5 w-5" /> },
    { href: '#/assistant', key: 'assistant', label: 'Trợ lý chẩn đoán', short: 'Chẩn đoán', icon: <Sparkles className="h-5 w-5" /> },
    { href: '#/nic-reader', key: 'nic-reader', label: 'Đọc NIC 8', short: 'NIC 8', icon: <BookText className="h-5 w-5" /> },
    { href: '#/plans', key: 'plans', label: t.nav.plansShort, icon: <ClipboardList className="h-5 w-5" /> },
    { href: '#/references', key: 'references', label: t.nav.referencesShort, icon: <Library className="h-5 w-5" /> },
  ];
  const settingsItem: NavItem = { href: '#/settings', key: 'settings', label: t.nav.settings, icon: <Settings className="h-5 w-5" /> };

  const sideLink = (item: NavItem) => {
    const active = activeKey === item.key;
    return (
      <a
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cx(
          'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60',
          active
            ? 'bg-brand-50 text-brand-800 before:absolute before:inset-y-1.5 before:-left-3 before:w-1 before:rounded-r-full before:bg-brand-500 dark:bg-brand-500/10 dark:text-brand-300'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
        )}
      >
        <span className={active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}>{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        {item.badge}
      </a>
    );
  };

  const logo = (
    <a href="#/library" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
        <Activity className="h-5 w-5" strokeWidth={2.4} />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold text-slate-900 dark:text-white">{t.app.name}</span>
        <span className="hidden text-[11px] leading-snug text-slate-500 lg:block dark:text-slate-400">{t.app.tagline}</span>
      </span>
    </a>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 print:bg-white">
      {/* Thanh bên cố định trên màn hình lớn */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <div className="px-5 py-5">{logo}</div>
        <nav aria-label={t.app.name} className="flex-1 overflow-y-auto px-3 pb-6">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.key}>{sideLink(item)}</li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">{sideLink(settingsItem)}</div>
      </aside>

      <div className="pb-20 lg:pb-0 lg:pl-64 print:p-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-900/80 print:hidden">
          <span className="lg:hidden">{logo}</span>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label={t.app.search}
            className="ml-auto flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 transition hover:border-slate-300 hover:bg-white sm:w-full sm:max-w-md lg:ml-0 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800"
          >
            <Search className="h-4 w-4" />
            <span className="hidden flex-1 truncate text-left sm:block">{t.app.search}</span>
            <span className="hidden items-center gap-1 lg:flex">
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
        </header>

        {storageError && (
          <div role="alert" className="mx-auto max-w-7xl px-4 pt-4 print:hidden sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span className="flex-1">{t.app.storageFailure}</span>
              <button type="button" onClick={retryStorage} className="rounded border border-rose-400 px-3 py-1 font-medium hover:bg-rose-100 dark:hover:bg-rose-900">{t.app.retryStorage}</button>
            </div>
          </div>
        )}
        <main key={section} className="mx-auto max-w-7xl animate-rise px-4 py-6 sm:px-6 lg:px-8 lg:py-8 print:max-w-none print:animate-none print:p-0">
          {children}
        </main>
      </div>

      {/* Thanh điều hướng dưới cùng trên điện thoại và máy tính bảng */}
      <nav
        aria-label={t.app.name}
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/95 print:hidden"
      >
        {[...items, settingsItem].map((item) => {
          const active = activeKey === item.key;
          return (
            <a
              key={item.key}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium',
                active ? 'text-brand-700 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400',
              )}
            >
              {item.icon}
              <span className="max-w-full truncate">{item.short ?? item.label}</span>
            </a>
          );
        })}
      </nav>

      <CommandPalette />

      {/* Thông báo */}
      <div className="pointer-events-none fixed bottom-20 right-4 z-[60] flex flex-col items-end gap-2 lg:bottom-4 print:hidden" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex max-w-sm animate-rise items-center gap-2.5 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl ring-1 ring-white/10 dark:bg-slate-800"
          >
            {toast.tone === 'error' ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            ) : toast.tone === 'info' ? (
              <Info className="h-4 w-4 shrink-0 text-sky-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-400" />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
