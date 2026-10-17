import { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import type { CareEntry } from '../types';
import { useApp } from '../store/AppContext';
import { recordNocAssessment, effectiveIndicatorScale } from '../lib/nocAssessment';
import { formatDate } from '../lib/utils';
import { LikertInput } from './Likert';
import { Button, Input, Textarea } from '../ui';

export function NocAssessmentPanel({ entry, nurse, onChange }: { entry: CareEntry; nurse: string; onChange: (entry: CareEntry) => void }) {
  const { t, lang, toast } = useApp();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [assessor, setAssessor] = useState(nurse);
  const [notes, setNotes] = useState('');
  const [indicatorScores, setIndicatorScores] = useState<Record<string, number | null>>({});
  useEffect(() => {
    setScore(null); setAssessor(nurse); setNotes(''); setIndicatorScores({});
  }, [entry.id, entry.noc.code, nurse]);
  const history = [...(entry.noc.assessments ?? [])].reverse();
  const record = () => {
    if (score == null) { toast(t.entryForm.invalidAssessment, 'error'); return; }
    try {
      onChange(recordNocAssessment(entry, { score, assessor, notes, indicatorScores }));
      setScore(null); setNotes(''); setIndicatorScores({}); setOpen(false);
      toast(t.entryForm.recordNow);
    } catch { toast(t.entryForm.invalidAssessment, 'error'); }
  };
  return (
    <section className="space-y-2 border-t border-line-soft pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold text-fg-body">{t.entryForm.assessmentHistory} ({history.length})</h4>
        <Button size="sm" variant="ghost" icon={<ClipboardCheck className="h-3.5 w-3.5" />} onClick={() => setOpen((v) => !v)}>{t.entryForm.recordAssessment}</Button>
      </div>
      {open && (
        <div className="space-y-3 border-t border-line pt-3">
          <p className="text-xs font-medium">{t.editor.current}</p>
          <LikertInput value={score} onChange={setScore} scaleCode={entry.noc.scaleCode} />
          {entry.noc.indicators.map((ind) => (
            <div key={ind.id} className="space-y-1">
              <p className="text-xs text-fg-body">{ind.code} · {ind.name} ({t.editor.scale} {effectiveIndicatorScale(ind.scaleCode, entry.noc.scaleCode)})</p>
              <LikertInput size="sm" value={indicatorScores[ind.code] ?? null} allowEmpty
                scaleCode={effectiveIndicatorScale(ind.scaleCode, entry.noc.scaleCode)}
                onChange={(v) => setIndicatorScores((s) => ({ ...s, [ind.code]: v }))} />
            </div>
          ))}
          <label className="block space-y-1 text-xs">
            <span>{t.entryForm.assessedBy}</span>
            <Input value={assessor} onChange={(e) => setAssessor(e.target.value)} />
          </label>
          <label className="block space-y-1 text-xs">
            <span>{t.entryForm.assessmentNote}</span>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <p className="text-[11px] text-fg-muted">{t.entryForm.assessmentDate}: {formatDate(new Date().toISOString(), lang, true)}</p>
          <Button size="sm" variant="primary" onClick={record}>{t.entryForm.recordNow}</Button>
        </div>
      )}
      {history.length > 0 &&
        <ol className="space-y-1.5">
          {history.slice(0, 12).map((a) => (
            <li key={a.id} className="text-xs text-fg-body">
              <span className="font-semibold">{formatDate(a.assessedAt, lang, true)}</span> · {a.score}/5 · {t.editor.scale} {a.scaleCode} · {a.assessor || '—'}
              {a.notes && <span className="block text-fg-muted">{a.notes}</span>}
            </li>
          ))}
          {history.length > 12 && <li className="text-xs text-fg-muted">+{history.length - 12}</li>}
        </ol>
      }
    </section>
  );
}
