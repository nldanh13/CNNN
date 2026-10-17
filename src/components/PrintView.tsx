import type { CarePlan } from '../types';
import { useApp } from '../store/AppContext';
import { computeBmi, formatDate, signed } from '../lib/utils';
import { scaleLabel } from './Likert';

/** Bản in A4 của kế hoạch chăm sóc; chỉ hiển thị khi in. */
export function PrintView({ plan }: { plan: CarePlan }) {
  const { t, lang, term } = useApp();
  const p = plan.patient;
  const tr = (code: string | null, en: string) => term(code, en).text;
  const bmi = computeBmi(p.heightCm, p.weightKg);
  const gender = p.gender === 'male' ? t.editor.male : p.gender === 'female' ? t.editor.female : t.editor.other;

  const cell = 'border border-ink-400 px-2 py-1.5 align-top';

  return (
    <div className="hidden text-[11px] leading-snug text-black print:block">
      <div className="mb-4 flex items-start justify-between border-b-2 border-black pb-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide">Thư viện Điều dưỡng NNN · NANDA-I · NOC · NIC</p>
          <h1 className="mt-1 text-lg font-bold">{t.print.title}</h1>
        </div>
        <div className="text-right">
          <p>
            {t.editor.planCode}: <strong>{plan.code}</strong>
          </p>
          <p>
            {t.editor.created}: {formatDate(plan.createdAt, lang)}
          </p>
        </div>
      </div>

      <table className="mb-4 w-full border-collapse">
        <tbody>
          <tr>
            <td className={cell}>
              {t.editor.name}: <strong>{p.name}</strong>
            </td>
            <td className={cell}>
              {t.editor.mrn}: {p.mrn}
            </td>
            <td className={cell}>
              {t.editor.age}: {p.age ?? ''} · {gender}
            </td>
          </tr>
          <tr>
            <td className={cell}>
              {t.editor.ward}: {p.ward} · {t.editor.bed}: {p.bed}
            </td>
            <td className={cell}>
              {t.editor.admission}: {formatDate(p.admissionDate, lang)}
            </td>
            <td className={cell}>
              {p.heightCm ?? ''} cm · {p.weightKg ?? ''} kg · BMI {bmi ?? ''}
            </td>
          </tr>
          <tr>
            <td className={cell} colSpan={2}>
              {t.editor.medicalDx}: {p.medicalDiagnoses.map((d) => tr(null, d)).join('; ')}
            </td>
            <td className={cell}>
              {t.editor.allergies}: {p.allergies.join(', ') || '—'}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-ink-100">
            <th className={`${cell} w-6`}>#</th>
            <th className={`${cell} w-[30%] text-left`}>{t.editor.diagnosis} (NANDA-I)</th>
            <th className={`${cell} w-[30%] text-left`}>{t.editor.outcome} (NOC)</th>
            <th className={`${cell} text-left`}>{t.editor.interventions} (NIC)</th>
          </tr>
        </thead>
        <tbody>
          {plan.entries.map((e, i) => (
            <tr key={e.id} className="break-inside-avoid">
              <td className={`${cell} text-center font-bold`}>{i + 1}</td>
              <td className={cell}>
                <p className="font-bold">
                  [{e.nanda.code}] {tr(e.nanda.code, e.nanda.label)}
                </p>
                {e.definingCharacteristics.length > 0 && (
                  <p className="mt-1">
                    <em>{t.editor.definingChars}:</em> {e.definingCharacteristics.map((x) => tr(null, x)).join('; ')}
                  </p>
                )}
                {e.relatedFactors.length > 0 && (
                  <p className="mt-1">
                    <em>{t.editor.relatedFactors}:</em> {e.relatedFactors.map((x) => tr(null, x)).join('; ')}
                  </p>
                )}
                {e.status === 'resolved' && <p className="mt-1 font-semibold">✓ {t.editor.resolved}</p>}
              </td>
              <td className={cell}>
                <p className="font-bold">
                  [{e.noc.code}] {tr(e.noc.code, e.noc.label)}
                </p>
                <p className="mt-1">
                  {t.editor.baseline}: {e.noc.baseline} · {t.editor.target}: {e.noc.target} · {t.editor.current}: {e.noc.current ?? '—'}
                  {e.noc.current != null && ` (${signed(e.noc.current - e.noc.baseline)})`}
                </p>
                {e.noc.current != null && <p className="text-[10px] italic">{scaleLabel(e.noc.scaleCode, e.noc.current, lang)}</p>}
                {e.noc.indicators.length > 0 && (
                  <ul className="mt-1 list-disc pl-4">
                    {e.noc.indicators.map((ind) => (
                      <li key={ind.id}>
                        {ind.code} {tr(null, ind.name)}: {ind.score ?? '—'} · {t.editor.scale} {ind.scaleCode || e.noc.scaleCode}{ind.sourcePage ? ` · ${ind.sourcePage}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
                {(e.noc.assessments ?? []).length > 0 && (
                  <div className="mt-2">
                    <strong>{t.entryForm.assessmentHistory}</strong>
                    <ul className="list-disc pl-4">
                      {e.noc.assessments!.map((a) => (
                        <li key={a.id}>{formatDate(a.assessedAt, lang, true)} · {a.score}/5 · {t.editor.scale} {a.scaleCode} · {a.assessor || '—'}{a.notes ? ` — ${a.notes}` : ''}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </td>
              <td className={cell}>
                {e.nic.map((n) => (
                  <div key={n.code} className="mb-1">
                    <p className="font-bold">
                      [{n.code}] {tr(n.code, n.label)}
                    </p>
                    {n.activities.length > 0 && (
                      <ul className="list-disc pl-4">
                        {n.activities.map((a, j) => (
                          <li key={j}>{tr(null, a)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {e.notes && <p className="mt-1 italic">{e.notes}</p>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-10 flex justify-end">
        <div className="w-60 text-center">
          <p>{formatDate(new Date().toISOString(), lang)}</p>
          <p className="font-bold">{t.print.signature}</p>
          <p className="mt-14">{plan.nurse}</p>
        </div>
      </div>
    </div>
  );
}
