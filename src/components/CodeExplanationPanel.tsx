import { ChevronDown, ClipboardList, Info } from 'lucide-react';
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
  // Trong biểu mẫu kế hoạch, phần giải thích thu gọn thành một dòng, chỉ mở khi người dùng cần.
  if (compact) return (
    <details className="group text-xs">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-control py-0.5 font-medium text-fg-muted hover:text-fg [&::-webkit-details-marker]:hidden">
        <Info className="h-3.5 w-3.5" /> {lang === 'vi' ? 'Giải thích mã' : 'About this code'}
        <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
      </summary>
      <div className="mt-2 space-y-1.5 rounded-control border border-line-soft bg-surface-muted p-3 leading-relaxed text-fg-body">
        <p>{guide.summary}</p>
        <a href={`#/library?sys=${system}&code=${code}&label=${encodeURIComponent(label)}`}
          className="font-medium text-primary-700 hover:underline dark:text-primary-300">{t.guide.openDetail}</a>
      </div>
    </details>
  );
  return (
    <section className="mt-5 space-y-4 rounded-card border border-line bg-surface-muted p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <ClipboardList className="h-4 w-4 shrink-0 text-info-700 dark:text-info-400" />
        <h3 className="font-semibold text-fg">{t.guide.title}</h3>
        <span className="text-[11px] text-fg-muted">#{code}</span>
      </div>
      <p className="leading-relaxed text-fg-body">{guide.summary}</p>
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
      <details className="border-t border-line pt-2 text-xs text-fg-muted">
          <summary className="cursor-pointer">Thông tin nội dung</summary>
          <p className="mt-2">{guide.level === 'source-reviewed' ? t.guide.sourceReviewed : t.guide.editorial}</p>
          <p className="mt-1 leading-relaxed">{t.guide.copyrightNotice}</p>
        </details>
    </section>
  );
}
