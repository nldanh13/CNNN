import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight, BookOpen, ClipboardList, HandHeart, Search,
  Sparkles, Stethoscope, Target, X,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../auth/AuthContext';
import { dataHub } from '../data/dataHub';
import { formatDate } from '../lib/utils';
import type { TaxonomySystem } from '../types';
import { Card, CodeBadge, Term } from '../ui';

const SYSTEMS: {
  system: TaxonomySystem;
  label: string;
  subtitle: string;
  icon: ReactNode;
  iconClass: string;
  countClass: string;
}[] = [
  {
    system: 'nanda', label: 'NANDA-I', subtitle: 'Chẩn đoán điều dưỡng',
    icon: <Stethoscope className="h-5 w-5" />,
    iconClass: 'bg-danger-50 text-danger-600 dark:bg-danger-500/15 dark:text-danger-300',
    countClass: 'text-danger-600 dark:text-danger-300',
  },
  {
    system: 'noc', label: 'NOC', subtitle: 'Kết quả chăm sóc',
    icon: <Target className="h-5 w-5" />,
    iconClass: 'bg-info-50 text-info-600 dark:bg-info-500/15 dark:text-info-300',
    countClass: 'text-info-600 dark:text-info-300',
  },
  {
    system: 'nic', label: 'NIC', subtitle: 'Can thiệp điều dưỡng',
    icon: <HandHeart className="h-5 w-5" />,
    iconClass: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300',
    countClass: 'text-success-700 dark:text-success-300',
  },
];

const SEARCH_PREVIEW = 4;

function greetingTime() {
  const hour = new Date().getHours();
  return hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
}

export function HomePage() {
  const { t, lang, plans } = useApp();
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const query = q.trim();
  const displayName = user?.user_metadata?.full_name?.trim();
  const results = useMemo(
    () => query ? SYSTEMS.map(({ system }) => ({
      system, items: dataHub.search(system, query),
    })) : [],
    [query],
  );
  const total = results.reduce((n, result) => n + result.items.length, 0);
  const recent = useMemo(
    () => [...plans].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3),
    [plans],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-4 sm:space-y-9">
      <section className="overflow-hidden rounded-card bg-primary-800 p-6 text-white shadow-raised sm:p-9 dark:bg-primary-900">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary-200">{greetingTime()}</p>
          <h1 className="mt-2 text-balance font-sans text-[1.875rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
            {displayName ? `Xin chào, ${displayName}` : 'Chào mừng trở lại'}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-primary-100 sm:text-base">
            Tra cứu và xây dựng kế hoạch chăm sóc cùng NANDA-I, NOC và NIC.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href="#/assistant"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-white px-5 text-sm font-semibold text-primary-800 shadow-button transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <Sparkles className="h-4 w-4" /> Bắt đầu chẩn đoán <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#/plans"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <ClipboardList className="h-4 w-4" /> Kế hoạch của tôi
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="quick-search-heading" className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="quick-search-heading" className="text-sm font-semibold text-fg sm:text-base">Tra cứu nhanh</h2>
          <span className="text-xs text-fg-muted">NANDA-I · NOC · NIC</span>
        </div>
        <label htmlFor="home-search" className="sr-only">Tìm mã hoặc thuật ngữ</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-subtle" />
          <input id="home-search" type="search" enterKeyHint="search" value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Nhập tên chẩn đoán, kết quả, can thiệp hoặc mã…"
            autoComplete="off"
            className="h-12 w-full rounded-control border border-line bg-surface-muted pl-12 pr-11 text-sm text-fg placeholder:text-fg-muted focus:border-primary-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-500/15"
          />
          {q && <button type="button" aria-label={t.app.close} onClick={() => setQ('')}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-control text-fg-muted hover:bg-surface hover:text-fg">
            <X className="h-4 w-4" />
          </button>}
        </div>
      </section>

      {query ? (
        <section aria-live="polite" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-fg">Kết quả tìm kiếm</h2>
            <span className="text-sm tabular-nums text-fg-muted">{total} kết quả</span>
          </div>
          {total === 0 && <Card className="p-6 text-sm text-fg-muted">{t.home.noResults}</Card>}
          {results.filter(r => r.items.length > 0).map(({ system, items }) => (
            <Card key={system} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-line-soft px-4 py-3 sm:px-5">
                <h3 className="text-sm font-semibold text-fg">
                  {t.systems[system]} <span className="ml-1 font-normal text-fg-muted">({items.length})</span>
                </h3>
                {items.length > SEARCH_PREVIEW && (
                  <a href={`#/library?sys=${system}&q=${encodeURIComponent(query)}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline dark:text-primary-300">
                    Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <ul className="divide-y divide-line-soft">
                {items.slice(0, SEARCH_PREVIEW).map(item => (
                  <li key={item.code + '|' + item.label}>
                    <a href={`#/library?sys=${system}&code=${item.code}&label=${encodeURIComponent(item.label)}`}
                      className="flex min-h-12 items-center gap-3 px-4 py-2.5 transition hover:bg-surface-muted sm:px-5">
                      <Term code={item.code} en={item.label} className="min-w-0 flex-1 text-sm text-fg" />
                      <CodeBadge system={system} code={item.code} className="shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </section>
      ) : (
        <>
          {recent.length > 0 && (
            <section aria-labelledby="recent-plans-heading">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 id="recent-plans-heading" className="text-base font-semibold text-fg">Tiếp tục làm việc</h2>
                <a href="#/plans" className="text-xs font-semibold text-primary-700 hover:underline dark:text-primary-300">Xem tất cả</a>
              </div>
              <Card className="overflow-hidden">
                <ul className="divide-y divide-line-soft">
                  {recent.map(plan => (
                    <li key={plan.id}>
                      <a href={`#/plans/${plan.id}`}
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface-muted sm:px-5">
                        <ClipboardList className="h-4 w-4 shrink-0 text-fg-muted" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">
                          {plan.patient.name || t.plans.untitled}
                        </span>
                        <span className="shrink-0 text-xs text-fg-muted">{formatDate(plan.updatedAt, lang)}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-fg-subtle" />
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}
          <section aria-labelledby="home-catalog-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="home-catalog-heading" className="text-base font-semibold text-fg sm:text-lg">Thư viện NNN</h2>
              <a href="#/library" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline dark:text-primary-300">
                Mở thư viện <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {SYSTEMS.map(item => (
                <a key={item.system} href={`#/library?sys=${item.system}`}
                  className="group flex items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 sm:flex-col sm:items-start sm:p-5">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${item.iconClass}`}>
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-fg sm:text-base">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-fg-muted">{item.subtitle}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 sm:mt-2 sm:w-full sm:justify-between">
                    <span className={`text-2xl font-bold tabular-nums tracking-[-0.02em] ${item.countClass}`}>
                      {dataHub.listLibrary(item.system).length}
                      <span className="ml-1 text-xs font-normal text-fg-muted">mã</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-fg-subtle transition group-hover:translate-x-1 group-hover:text-primary-600" />
                  </span>
                </a>
              ))}
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <a href="#/standards" className="group flex items-center gap-3 rounded-card border border-line bg-surface p-4 transition hover:border-primary-300 hover:shadow-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-fg">Hướng dẫn chẩn đoán</span>
                <span className="block text-xs text-fg-muted">Quy trình NANDA-I → NOC → NIC</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-fg-subtle group-hover:text-primary-600" />
            </a>
            <a href="#/plans" className="group flex items-center gap-3 rounded-card border border-line bg-surface p-4 transition hover:border-primary-300 hover:shadow-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-info-50 text-info-700 dark:bg-info-500/15 dark:text-info-300">
                <ClipboardList className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-fg">Kế hoạch chăm sóc</span>
                <span className="block text-xs text-fg-muted">{plans.length}/3 người bệnh trong tài khoản</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-fg-subtle group-hover:text-primary-600" />
            </a>
          </section>

        </>
      )}
    </div>
  );
}
