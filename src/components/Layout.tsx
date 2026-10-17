import { useEffect, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, Library, Search, Settings, BookOpen, ClipboardList, BookText, Sparkles, House } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { cx } from '../lib/utils';
import { Alert, BrandLogo, Button, Kbd } from '../ui';
import { CommandPalette } from './CommandPalette';
import { useAuth } from '../auth/AuthContext';

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
  home: 'home',
  assistant: 'assistant',
  library: 'library',
  'nic-reader': 'library',
  standards: 'guide',
  plans: 'plans',
  references: 'references',
  quality: 'references',
  settings: 'settings',
  ui: 'settings',
};

export function Layout({ section, children }: { section: string; children: ReactNode }) {
  const { t, toasts, dismissToast, storageError, retryStorage, setPaletteOpen } = useApp();
  const { user, enabled } = useAuth();
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
    { href: '#/home', key: 'home', label: 'Trang chủ', short: 'Trang chủ', icon: <House className="h-5 w-5" /> },
    { href: '#/library', key: 'library', label: t.nav.library, short: 'Thư viện', icon: <BookOpen className="h-5 w-5" /> },
    { href: '#/assistant', key: 'assistant', label: 'Trợ lý chẩn đoán', short: 'Trợ lý', icon: <Sparkles className="h-5 w-5" /> },
    { href: '#/standards', key: 'guide', label: 'Hướng dẫn chẩn đoán', short: 'Hướng dẫn', icon: <BookText className="h-5 w-5" /> },
    { href: '#/plans', key: 'plans', label: t.nav.plansShort, icon: <ClipboardList className="h-5 w-5" /> },
    { href: '#/references', key: 'references', label: t.nav.referencesShort, icon: <Library className="h-5 w-5" /> },
  ];
  const settingsItem: NavItem = { href: '#/settings', key: 'settings', label: enabled ? 'Cài đặt & tài khoản' : t.nav.settings, short: 'Tài khoản', icon: <Settings className="h-5 w-5" /> };

  const sideLink = (item: NavItem) => {
    const active = activeKey === item.key;
    return (
      <a
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cx(
          'flex items-center gap-3 rounded-control px-3 py-2.5 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
          active ? 'bg-primary-50 text-primary-800 dark:bg-primary-500/15 dark:text-primary-100' : 'text-fg-body hover:bg-surface-muted hover:text-fg',
        )}
      >
        <span className={active ? 'text-primary-700 dark:text-primary-300' : 'text-fg-subtle'}>{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        {item.badge}
      </a>
    );
  };

  const logo = (compact: boolean) => <BrandLogo compact={compact} href="#/home" />;
  const displayName = user?.user_metadata?.full_name?.trim() || user?.email || '';
  const initials = displayName.split(/[\s@]+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('');

  return (
    <div className="min-h-screen bg-canvas text-fg-body print:bg-white">
      {/* Thanh bên cố định trên màn hình lớn */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex print:hidden">
        <div className="px-5 py-5">{logo(false)}</div>
        <nav aria-label={t.app.name} className="flex-1 overflow-y-auto px-3 pb-6">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.key}>{sideLink(item)}</li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-line p-3">{sideLink(settingsItem)}</div>
      </aside>

      <div className="pb-20 lg:pb-0 lg:pl-64 print:p-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line-soft bg-canvas/80 px-4 backdrop-blur-md sm:px-6 print:hidden">
          <span className="min-w-0 lg:hidden">{logo(true)}</span>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label={t.app.search}
            className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-control border border-line bg-surface-muted text-sm text-fg-subtle transition hover:border-ink-300 hover:text-fg-muted sm:w-full sm:max-w-md sm:justify-start sm:px-3 lg:ml-0 dark:hover:border-ink-600"
          >
            <Search className="h-4 w-4" />
            <span className="hidden flex-1 truncate text-left sm:block">{t.app.search}</span>
            <span className="hidden items-center gap-1 lg:flex">
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
          <a
            href={settingsItem.href}
            aria-label={settingsItem.label}
            aria-current={activeKey === 'settings' ? 'page' : undefined}
            className={cx(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-control border transition lg:hidden',
              activeKey === 'settings' ? 'border-primary-700 bg-primary-700 text-white' : 'border-line bg-surface-muted text-fg-muted hover:text-fg',
            )}
          >
            <Settings className="h-5 w-5" />
          </a>
          {user && (
            <a href="#/settings" title="Cài đặt tài khoản" className="ml-auto hidden items-center gap-2.5 rounded-full border border-line bg-surface py-1 pl-1 pr-3 transition hover:border-ink-300 md:flex dark:hover:border-ink-600">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-700 text-xs font-bold text-white">{initials}</span>
              <span className="max-w-44 truncate text-sm font-medium text-fg">{displayName}</span>
            </a>
          )}
        </header>

        {storageError && (
          <div className="mx-auto max-w-7xl px-4 pt-4 print:hidden sm:px-6 lg:px-8">
            <Alert role="alert" tone="danger">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex-1">{t.app.storageFailure}</span>
                <Button size="sm" onClick={retryStorage}>{t.app.retryStorage}</Button>
              </div>
            </Alert>
          </div>
        )}
        <main key={section} className="mx-auto max-w-7xl animate-rise px-4 py-6 sm:px-6 lg:px-8 lg:py-8 print:max-w-none print:animate-none print:p-0">
          {children}
        </main>
      </div>

      {/* Thanh điều hướng dưới cùng trên điện thoại và máy tính bảng */}
      <nav
        aria-label={t.app.name}
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden print:hidden"
      >
        {items.filter(item => item.key !== 'references').map((item) => {
          const active = activeKey === item.key;
          return (
            <a
              key={item.key}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cx('flex min-h-[3.75rem] flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium', active ? 'text-fg' : 'text-fg-muted')}
            >
              <span className={cx('flex h-7 w-12 items-center justify-center rounded-full transition', active && 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200')}>{item.icon}</span>
              <span className="max-w-full truncate">{item.short ?? item.label}</span>
            </a>
          );
        })}
      </nav>

      <CommandPalette />

      {/* Thông báo: điện thoại hiện ở trên, máy tính hiện góc dưới trái, để không che nút Lưu / Đóng của hộp thoại. */}
      <div className="pointer-events-none fixed inset-x-4 top-3 z-[60] flex flex-col items-center gap-2 lg:inset-x-auto lg:bottom-4 lg:left-4 lg:top-auto lg:items-start print:hidden" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto flex max-w-sm animate-rise items-center gap-2.5 rounded-control bg-ink-900 px-4 py-3 text-sm text-white shadow-raised ring-1 ring-white/10 dark:bg-ink-800">
            {toast.tone === 'error' ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-danger-400" />
            ) : toast.tone === 'info' ? (
              <Info className="h-4 w-4 shrink-0 text-info-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-300" />
            )}
            {toast.message}
            {toast.action && (
              <button
                type="button"
                onClick={() => { toast.action!.run(); dismissToast(toast.id); }}
                className="-my-1 ml-2 rounded px-2 py-1 font-semibold text-primary-300 hover:bg-white/10"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
