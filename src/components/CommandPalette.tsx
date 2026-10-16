import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BookOpen, CornerDownLeft, Library, Search } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { navigate } from '../store/router';
import { dataHub } from '../data/dataHub';
import { cx } from '../lib/utils';
import type { TaxonomySystem } from '../types';
import { CodeBadge, Kbd, Modal } from './ui';

interface Result {
  key: string;
  group: string;
  title: ReactNode;
  hint?: ReactNode;
  badge?: ReactNode;
  href: string;
}

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, t, term } = useApp();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (paletteOpen) {
      setQ('');
      setActive(0);
    }
  }, [paletteOpen]);

  const results = useMemo<Result[]>(() => {
    const out: Result[] = [];
    const query = q.trim();
    if (!query) {
      out.push(
        { key: 'p-lib', group: t.nav.reference, title: t.nav.library, href: '#/library', badge: <BookOpen className="h-4 w-4 text-slate-400" /> },
        { key: 'p-refs', group: t.nav.reference, title: t.nav.references, href: '#/references', badge: <Library className="h-4 w-4 text-slate-400" /> },
      );
      return out;
    }
    const systems: [TaxonomySystem, string][] = [
      ['nanda', t.systems.nanda],
      ['noc', t.systems.noc],
      ['nic', t.systems.nic],
    ];
    for (const [sys, label] of systems) {
      const items=dataHub.searchClinical(sys,query).slice(0,12);
      for(const item of items){
        out.push({
          key:sys+'-'+item.code+'-'+item.label,
          group:label,
          title:term(item.code,item.label).text,
          href:'#/library?sys='+sys+'&code='+encodeURIComponent(item.code)+'&label='+encodeURIComponent(item.label),
          badge:<CodeBadge system={sys} code={item.code}/>,
        });
      }
    }
    return out;
  }, [q, t, term]);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (r: Result | undefined) => {
    if (!r) return;
    setPaletteOpen(false);
    navigate(r.href);
  };

  let lastGroup = '';
  return (
    <Modal open={paletteOpen} onClose={() => setPaletteOpen(false)}>
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter') {
              go(results[active]);
            }
          }}
          placeholder={t.app.search}
          className="h-12 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
        />
        <Kbd>Esc</Kbd>
      </div>
      <ul ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
        {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-slate-500">{t.app.noResults}</li>}
        {results.map((r, i) => {
          const header = r.group !== lastGroup ? r.group : null;
          lastGroup = r.group;
          return (
            <li key={r.key}>
              {header && <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{header}</p>}
              <button
                type="button"
                data-idx={i}
                onMouseMove={() => setActive(i)}
                onClick={() => go(r)}
                className={cx(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm',
                  i === active ? 'bg-brand-50 text-brand-900 dark:bg-brand-500/10 dark:text-white' : 'text-slate-700 dark:text-slate-300',
                )}
              >
                <span className="flex w-14 shrink-0 justify-start">{r.badge}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{r.title}</span>
                  {r.hint && <span className="block truncate text-xs text-slate-400">{r.hint}</span>}
                </span>
                {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-slate-400" />}
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
