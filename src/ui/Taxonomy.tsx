import { cx } from '../lib/utils';
import { useApp } from '../store/AppContext';
import type { TaxonomySystem } from '../types';

/** Mỗi hệ phân loại có một màu riêng, dùng nhất quán ở mọi nơi. */
const SYSTEM_STYLES: Record<TaxonomySystem, string> = {
  nanda: 'bg-nanda-50 text-nanda-700 ring-nanda-600/15 dark:bg-nanda-500/10 dark:text-nanda-300 dark:ring-nanda-400/20',
  noc: 'bg-noc-50 text-noc-700 ring-noc-600/15 dark:bg-noc-500/10 dark:text-noc-300 dark:ring-noc-400/20',
  nic: 'bg-nic-50 text-nic-700 ring-nic-600/15 dark:bg-nic-500/10 dark:text-nic-300 dark:ring-nic-400/20',
};

export const SYSTEM_DOT: Record<TaxonomySystem, string> = {
  nanda: 'bg-nanda-500',
  noc: 'bg-noc-500',
  nic: 'bg-nic-500',
};

/** Màu chữ của từng hệ (tiêu đề nhỏ, biểu tượng). */
export const SYSTEM_TEXT: Record<TaxonomySystem, string> = {
  nanda: 'text-nanda-600 dark:text-nanda-400',
  noc: 'text-noc-600 dark:text-noc-400',
  nic: 'text-nic-600 dark:text-nic-400',
};

export function CodeBadge({ system, code, className }: { system: TaxonomySystem; code: string; className?: string }) {
  return (
    <span className={cx('inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ring-1 ring-inset', SYSTEM_STYLES[system], className)}>
      {code || '—'}
    </span>
  );
}

/** Hiển thị thuật ngữ theo ngôn ngữ đang chọn; ở tiếng Việt kèm cờ "dịch máy" khi cần. */
export function Term({ code, en, className }: { code: string | null; en: string; showOriginal?: boolean; className?: string }) {
  const { term, t } = useApp();
  const r = term(code, en);
  return (
    <span className={className}>
      <span>{r.text}</span>
      {r.machine && (
        <span
          title={t.app.machineTranslatedHint}
          className="ml-1.5 inline-flex translate-y-[-1px] items-center rounded border border-dashed border-warning-400/70 px-1 text-[10px] font-medium leading-4 text-warning-600 dark:text-warning-400"
        >
          {t.app.machineTranslated}
        </span>
      )}
    </span>
  );
}
