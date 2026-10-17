import { ClipboardList } from 'lucide-react';
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
      ? 'space-y-2 rounded-control border border-info-200 bg-info-50 p-3 text-xs dark:border-info-500/30 dark:bg-info-500/10'
      : 'mt-5 space-y-4 rounded-card border border-line bg-surface-muted p-4 text-sm'}>
      <div className="flex flex-wrap items-center gap-2">
        <ClipboardList className="h-4 w-4 shrink-0 text-info-700 dark:text-info-400" />
        <h3 className="font-semibold text-fg">{t.guide.title}</h3>
        {!compact && <span className="text-[11px] text-fg-muted">#{code}</span>}
      </div>
      <p className="leading-relaxed text-fg-body">{guide.summary}</p>
      {!compact && (
        <>
          <div>
            <h4 className="mb-1 font-semibold text-fg-body">{t.guide.reasoning}</h4>
            <p className="leading-relaxed text-fg-body">{guide.reasoning}</p>
          </div>
          <div>
            <h4 className="mb-1 font-semibold text-fg-body">{t.guide.checklist}</h4>
            <ul className="ml-4 list-disc space-y-1 text-fg-body">
              {guide.assessment.map((text, i) => <li key={i}>{text}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="mb-1 font-semibold text-fg-body">{t.guide.application}</h4>
            <p className="leading-relaxed text-fg-body">{guide.use}</p>
          </div>
        </>
      )}
      {compact ? (
        <a href={`#/library?sys=${system}&code=${code}&label=${encodeURIComponent(label)}`}
          className="text-xs font-medium text-primary-700 hover:underline dark:text-primary-300">{t.guide.openDetail}</a>
      ) : (
        <details className="border-t border-line pt-2 text-xs text-fg-muted">
          <summary className="cursor-pointer">Thông tin nội dung</summary>
          <p className="mt-2">{guide.level === 'source-reviewed' ? t.guide.sourceReviewed : t.guide.editorial}</p>
          <p className="mt-1 leading-relaxed">{t.guide.copyrightNotice}</p>
        </details>
      )}
    </section>
  );
}
