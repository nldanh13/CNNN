import { Info, ClipboardList } from 'lucide-react';
import type { TaxonomySystem } from '../types';
import { explainNnnCode } from '../data/nnnExplanations';
import { useApp } from '../store/AppContext';

export function CodeExplanationPanel({
  system, code, label, compact = false,
}: {
  system: TaxonomySystem; code: string; label: string; compact?: boolean;
}) {
  const { lang, t } = useApp();
  if (!code || !label) return null;
  const guide = explainNnnCode(system, code, label, lang);
  return (
    <section className={compact
      ? 'rounded-lg border border-sky-200 bg-sky-50/50 p-3 text-xs dark:border-sky-900 dark:bg-sky-950/20'
      : 'mt-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/50'}>
      <div className="flex flex-wrap items-center gap-2">
        <ClipboardList className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t.guide.title}</h3>
        {!compact && <span className="text-[11px] text-slate-500">#{code}</span>}
      </div>
      <p className="leading-relaxed text-slate-700 dark:text-slate-200">{guide.summary}</p>
      {!compact && (
        <>
          <div>
            <h4 className="mb-1 font-semibold text-slate-800 dark:text-slate-200">{t.guide.reasoning}</h4>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">{guide.reasoning}</p>
          </div>
          <div>
            <h4 className="mb-1 font-semibold text-slate-800 dark:text-slate-200">{t.guide.checklist}</h4>
            <ul className="ml-4 list-disc space-y-1 text-slate-600 dark:text-slate-300">
              {guide.assessment.map((text, i) => <li key={i}>{text}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="mb-1 font-semibold text-slate-800 dark:text-slate-200">{t.guide.application}</h4>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">{guide.use}</p>
          </div>
        </>
      )}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-2 text-[11px] text-slate-500 dark:border-slate-700">
        <Info className="h-3.5 w-3.5 shrink-0" />
        <span>{guide.level === 'source-reviewed' ? t.guide.sourceReviewed : t.guide.editorial}</span>
        {compact && <a href={`#/library?sys=${system}&code=${code}&label=${encodeURIComponent(label)}`} className="font-medium text-sky-700 underline dark:text-sky-300">{t.guide.openDetail}</a>}
      </div>
      {!compact && <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">{t.guide.copyrightNotice}</p>}
    </section>
  );
}
