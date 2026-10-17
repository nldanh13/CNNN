import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { dataHub } from '../data/dataHub';
import { cx } from '../lib/utils';
import type { TaxonomySystem } from '../types';
import { CodeBadge, Kbd, Modal } from '../ui';
import { shortNnnExplanation } from '../data/nnnExplanations';

export interface PickedItem {
  code: string;
  label: string;
}

/** Hộp chọn có tìm kiếm cho một danh mục NANDA-I / NOC / NIC. */
export function TaxonomyPicker({
  system,
  value,
  onPick,
  placeholder,
  exclude,
  keepOpen = false,
  trigger,
}: {
  system: TaxonomySystem;
  value?: PickedItem | null;
  onPick: (item: PickedItem) => void;
  placeholder: string;
  /** Các mã đã chọn sẽ được đánh dấu (dùng cho chọn nhiều NIC). */
  exclude?: string[];
  keepOpen?: boolean;
  trigger?: (open: () => void) => ReactNode;
}) {
  const { t, term, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => (open ? dataHub.searchClinical(system, q).slice(0, 80) : []), [system, q, open]);
  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    if (open) setQ('');
  }, [open]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const pick = (item: PickedItem | undefined) => {
    if (!item) return;
    onPick({ code: item.code, label: item.label });
    if (!keepOpen) setOpen(false);
  };

  const selected = value?.code ? term(value.code, value.label) : null;

  return (
    <>
      {trigger ? (
        trigger(() => setOpen(true))
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-left text-sm shadow-sm transition hover:border-ink-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-950 dark:hover:border-ink-600"
        >
          {value?.code ? (
            <>
              <CodeBadge system={system} code={value.code} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-fg">{selected?.text}</span>
                
              </span>
            </>
          ) : (
            <span className="flex-1 text-ink-400">{placeholder}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-400" />
        </button>
      )}

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 text-ink-400" />
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
                e.preventDefault();
                pick(results[active]);
              }
            }}
            placeholder={t.picker.search}
            className="h-12 flex-1 bg-transparent text-sm text-fg placeholder:text-ink-400 focus:outline-none"
          />
          <Kbd>Esc</Kbd>
        </div>
        <p className="border-b border-ink-100 px-4 py-2 text-xs font-medium text-ink-500 dark:border-ink-800">{placeholder}</p>
        <ul ref={listRef} className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-500">{t.app.noResults}</li>}
          {results.map((item, i) => {
            const tr = term(item.code, item.label);
            const isSelected = value?.code === item.code && value.label === item.label;
            const isTaken = exclude?.includes(item.code);
            return (
              <li key={`${item.code}-${item.label}`}>
                <button
                  type="button"
                  data-idx={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => pick(item)}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm',
                    i === active ? 'bg-ink-100 dark:bg-ink-800' : '',
                  )}
                >
                  <CodeBadge system={system} code={item.code} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink-800 dark:text-ink-100">{tr.text}</span>
                    <span className="block truncate text-[11px] text-fg-muted">{shortNnnExplanation(system, item.code, item.label, lang)}</span>
                  </span>
                  {(isSelected || isTaken) && <Check className="h-4 w-4 text-primary-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </>
  );
}
