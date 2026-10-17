import { useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, BookOpen, ClipboardList, HandHeart, Library, Ruler, Search, Stethoscope, Target, X } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { editionLabel } from '../data/taxonomy';
import { dataHub } from '../data/dataHub';
import { cx, formatDate } from '../lib/utils';
import type { TaxonomySystem } from '../types';
import { Card, CodeBadge, Term } from '../ui';

const SYSTEMS: { system: TaxonomySystem; icon: ReactNode; accent: string }[] = [
  { system: 'nanda', icon: <Stethoscope className="h-4 w-4" />, accent: 'bg-danger-500' },
  { system: 'noc', icon: <Target className="h-4 w-4" />, accent: 'bg-info-500' },
  { system: 'nic', icon: <HandHeart className="h-4 w-4" />, accent: 'bg-success-500' },
];

const PREVIEW = 5;

export function HomePage() {
  const { t, lang, plans } = useApp();
  const [q, setQ] = useState('');
  const query = q.trim();

  const results = useMemo(
    () => (query ? SYSTEMS.map(({ system }) => ({ system, items: dataHub.search(system, query) })) : []),
    [query],
  );
  const total = results.reduce((n, r) => n + r.items.length, 0);

  const catalog: Record<TaxonomySystem, { count: number; edition: string; desc: string }> = {
    nanda: { count: dataHub.listLibrary('nanda').length, edition: editionLabel(dataHub.editionFor('nanda'), lang), desc: t.home.nandaDesc },
    noc: { count: dataHub.listLibrary('noc').length, edition: editionLabel(dataHub.editionFor('noc'), lang), desc: t.home.nocDesc },
    nic: { count: dataHub.listLibrary('nic').length, edition: editionLabel(dataHub.editionFor('nic'), lang), desc: t.home.nicDesc },
  };
  const recent = [...plans].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl">
      <section className="pt-2 sm:pt-6">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{t.home.title}</h1>
        <p className="mt-2 text-base text-ink-600 dark:text-ink-400">{t.home.subtitle}</p>

        <label htmlFor="home-search" className="sr-only">
          {t.home.searchLabel}
        </label>
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            id="home-search"
            type="text"
            enterKeyHint="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.home.searchPlaceholder}
            autoComplete="off"
            className="h-14 w-full rounded-xl border border-ink-300 bg-surface pl-12 pr-12 text-base text-fg shadow-sm placeholder:text-ink-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/15 dark:border-ink-700"
          />
          {q && (
            <button
              type="button"
              aria-label={t.app.close}
              onClick={() => setQ('')}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {query ? (
        <section className="mt-6 space-y-5" aria-live="polite">
          {total === 0 && <p className="rounded-xl bg-surface p-5 text-sm text-ink-500 shadow-card">{t.home.noResults}</p>}
          {results
            .filter((r) => r.items.length > 0)
            .map(({ system, items }) => (
              <Card key={system} className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-3 dark:border-ink-800">
                  <h2 className="text-sm font-semibold text-fg">
                    {t.systems[system]} <span className="ml-1 font-normal text-ink-400">{items.length}</span>
                  </h2>
                  {items.length > PREVIEW && (
                    <a
                      href={`#/library?sys=${system}&q=${encodeURIComponent(query)}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline dark:text-primary-400"
                    >
                      {t.home.seeAll}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <ul className="divide-y divide-line-soft">
                  {items.slice(0, PREVIEW).map((item) => (
                    <li key={`${item.code}|${item.label}`}>
                      <a
                        href={`#/library?sys=${system}&code=${item.code}&label=${encodeURIComponent(item.label)}`}
                        className="flex min-h-[3.25rem] items-center gap-3 px-5 py-2.5 transition hover:bg-ink-50 dark:hover:bg-ink-800/40"
                      >
                        <Term code={item.code} en={item.label} className="min-w-0 flex-1 text-[15px] text-ink-800 dark:text-ink-100" />
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
          <section className="mt-8 grid gap-3 sm:grid-cols-3">
            {SYSTEMS.map(({ system, icon, accent }) => (
              <a
                key={system}
                href={`#/library?sys=${system}`}
                className="group flex flex-col gap-2 rounded-xl border border-line bg-surface p-5 shadow-card transition hover:border-ink-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 dark:hover:border-ink-700"
              >
                <span className="flex items-center gap-2">
                  <span className={cx('flex h-7 w-7 items-center justify-center rounded-lg text-white', accent)}>{icon}</span>
                  <span className="font-semibold text-fg">{t.systems[system]}</span>
                </span>
                <span className="text-sm leading-relaxed text-ink-600 dark:text-ink-400">{catalog[system].desc}</span>
                <span className="mt-auto flex items-center justify-between pt-1 text-xs text-ink-500">
                  <span>
                    {catalog[system].count} {t.home.items} · {catalog[system].edition}
                  </span>
                  <ArrowRight className="h-4 w-4 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
                </span>
              </a>
            ))}
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem]">
            <Card className="p-5 sm:p-6">
              <h2 className="text-base font-semibold text-fg">{t.home.howTitle}</h2>
              <ol className="mt-4 space-y-4">
                {[t.home.how1, t.home.how2, t.home.how3].map((text, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                      {i + 1}
                    </span>
                    <p className="pt-0.5 text-[15px] leading-relaxed text-ink-700 dark:text-ink-300">{text}</p>
                  </li>
                ))}
              </ol>
            </Card>

            <div className="space-y-3">
              {[
                { href: '#/standards', icon: <Ruler className="h-4 w-4" />, title: t.home.scalesLink, desc: t.home.scalesDesc },
                { href: '#/references', icon: <Library className="h-4 w-4" />, title: t.home.referencesLink, desc: t.home.referencesDesc },
                { href: '#/plans', icon: <ClipboardList className="h-4 w-4" />, title: t.nav.plans, desc: t.home.plansDesc },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="flex gap-3 rounded-xl border border-line bg-surface p-4 transition hover:border-ink-300 dark:hover:border-ink-700"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">{l.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-fg">{l.title}</span>
                    <span className="block text-xs leading-relaxed text-fg-muted">{l.desc}</span>
                  </span>
                </a>
              ))}
            </div>
          </section>

          {recent.length > 0 && (
            <section className="mt-8">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-fg">{t.home.myPlans}</h2>
                <a href="#/plans" className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline dark:text-primary-400">
                  {t.home.openPlans}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <Card>
                <ul className="divide-y divide-line-soft">
                  {recent.map((p) => (
                    <li key={p.id}>
                      <a href={`#/plans/${p.id}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-ink-50 dark:hover:bg-ink-800/40">
                        <BookOpen className="h-4 w-4 shrink-0 text-ink-400" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">
                          {p.patient.name || t.plans.untitled}
                          {(p.patient.ward || p.patient.bed) && (
                            <span className="font-normal text-ink-500"> · {[p.patient.ward, p.patient.bed].filter(Boolean).join(' · ')}</span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-ink-400">{formatDate(p.updatedAt, lang)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}
        </>
      )}
    </div>
  );
}
