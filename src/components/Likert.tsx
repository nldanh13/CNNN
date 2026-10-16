import { cx } from '../lib/utils';
import { NOC_SCALES } from '../data/reference';
import { useApp } from '../store/AppContext';

const TONES = {
  slate: 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900',
  sky: 'bg-sky-600 text-white',
  emerald: 'bg-emerald-600 text-white',
};

/** Chọn điểm Likert 1–5; nhấn lại điểm đang chọn để bỏ chọn khi cho phép để trống. */
export function LikertInput({
  value,
  onChange,
  tone = 'sky',
  allowEmpty = false,
  scaleCode,
  size = 'md',
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  tone?: keyof typeof TONES;
  allowEmpty?: boolean;
  scaleCode?: string;
  size?: 'sm' | 'md';
}) {
  const { lang } = useApp();
  const scale = NOC_SCALES.find((s) => s.code === scaleCode);
  return (
    <div className="inline-flex gap-1" role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => {
        const label = scale ? (lang === 'vi' ? scale.pointsVi : scale.points)[n - 1] : undefined;
        const on = value === n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={on}
            title={label ? `${n} – ${label}` : String(n)}
            onClick={() => onChange(on && allowEmpty ? null : n)}
            className={cx(
              'rounded-md font-mono font-semibold tabular-nums transition',
              size === 'sm' ? 'h-6 w-6 text-[11px]' : 'h-8 w-8 text-xs',
              on ? TONES[tone] : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

export function scaleLabel(scaleCode: string, score: number | null, lang: 'vi' | 'en'): string {
  if (score == null) return '';
  const scale = NOC_SCALES.find((s) => s.code === scaleCode);
  if (!scale) return '';
  return (lang === 'vi' ? scale.pointsVi : scale.points)[score - 1] ?? '';
}
