import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, BookText, Check, ChevronDown, ClipboardCopy, ClipboardPlus, Eraser, ListChecks, Plus, Search,
  ShieldAlert, Sparkles, Stethoscope, Target, Wand2, X,
} from 'lucide-react';
import type { CareEntry } from '../types';
import { useApp } from '../store/AppContext';
import { navigate } from '../store/router';
import { CUE_BY_ID, CUE_GROUPS, CUES, SAMPLE_NOTES, type Cue } from '../data/diagnosisKnowledge';
import { PREFILL_KEY, analyzeNote, pesStatement, rankDiagnoses, ruleVi, type Confidence, type DiagnosisSuggestion, type NoteAnalysis } from '../lib/diagnosisAssistant';
import { newEntry, newPlan } from '../lib/carePlan';
import { copyText, cx, matches, uid } from '../lib/utils';
import { Badge, Button, Card, CardHeader, CodeBadge, EmptyState, Input, Modal, PageHeader, ProgressBar, Textarea } from '../components/ui';

const STATE_KEY = 'clinicalnnn.assistant.state';

interface SavedState { note: string; selected: string[]; evidence: Record<string, string> }

function loadState(): SavedState {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<SavedState>;
      return { note: s.note ?? '', selected: (s.selected ?? []).filter((id) => CUE_BY_ID.has(id)), evidence: s.evidence ?? {} };
    }
  } catch { /* phiên duyệt không cho lưu: bắt đầu trống */ }
  return { note: '', selected: [], evidence: {} };
}

const CONFIDENCE: Record<Confidence, { label: string; tone: 'emerald' | 'amber' | 'slate' }> = {
  high: { label: 'Phù hợp cao', tone: 'emerald' },
  medium: { label: 'Phù hợp vừa', tone: 'amber' },
  low: { label: 'Cần thêm dữ liệu', tone: 'slate' },
};
const KIND = { problem: 'Chẩn đoán hiện tại', risk: 'Chẩn đoán nguy cơ', promotion: 'Nâng cao sức khỏe' } as const;
const PRIORITY = {
  1: { label: 'Ưu tiên 1 · ABC / an toàn', tone: 'rose' as const },
  2: { label: 'Ưu tiên 2 · sinh lý', tone: 'amber' as const },
  3: { label: 'Ưu tiên 3 · tâm lý – xã hội', tone: 'sky' as const },
};

export function AssistantPage() {
  const initial = useMemo(loadState, []);
  const [note, setNote] = useState(initial.note);
  const [selected, setSelected] = useState<string[]>(initial.selected);
  const [evidence, setEvidence] = useState<Record<string, string>>(initial.evidence);
  const [analysis, setAnalysis] = useState<NoteAnalysis | null>(null);
  const [pushing, setPushing] = useState<CareEntry | null>(null);
  const { toast } = useApp();

  useEffect(() => {
    try { sessionStorage.setItem(STATE_KEY, JSON.stringify({ note, selected, evidence })); } catch { /* bỏ qua */ }
  }, [note, selected, evidence]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const ranked = useMemo(() => rankDiagnoses(selected), [selected]);
  const main = ranked.filter((s) => !s.supersededBy);
  const superseded = ranked.filter((s) => s.supersededBy);

  const toggle = (id: string) => setSelected((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
  const add = (id: string) => setSelected((xs) => (xs.includes(id) ? xs : [...xs, id]));

  const runAnalysis = (text = note) => {
    const result = analyzeNote(text);
    setAnalysis(result);
    setSelected((xs) => [...new Set([...xs, ...result.detections.map((d) => d.cueId)])]);
    setEvidence((ev) => ({ ...ev, ...Object.fromEntries(result.detections.map((d) => [d.cueId, d.evidence])) }));
    toast(result.detections.length ? `Nhận diện ${result.detections.length} dấu hiệu từ ghi chép` : 'Chưa nhận diện được dấu hiệu nào, hãy chọn trong danh sách', result.detections.length ? 'success' : 'info');
  };
  const clearAll = () => { setSelected([]); setEvidence({}); setAnalysis(null); setNote(''); };

  return (
    <>
      <PageHeader
        title={<span className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-brand-600" />Trợ lý chẩn đoán điều dưỡng</span>}
        subtitle="Nhập dữ liệu nhận định, trợ lý xếp hạng chẩn đoán NANDA-I phù hợp kèm lý do, rồi gợi ý mục tiêu NOC và can thiệp NIC để đưa thẳng vào kế hoạch chăm sóc."
        actions={selected.length > 0 && <Button icon={<Eraser className="h-4 w-4" />} onClick={clearAll}>Làm mới</Button>}
      />

      <ol className="mb-5 grid gap-2 text-xs sm:grid-cols-3">
        {[
          { n: 1, title: 'Nhận định', text: 'Dán ghi chép hoặc chọn dấu hiệu, chỉ số sinh tồn, yếu tố nguy cơ.', icon: <Stethoscope className="h-4 w-4" /> },
          { n: 2, title: 'Chẩn đoán', text: 'Xếp hạng theo bằng chứng và mức ưu tiên, có lý do và điều cần đánh giá thêm.', icon: <ListChecks className="h-4 w-4" /> },
          { n: 3, title: 'Mục tiêu & can thiệp', text: 'Chọn NOC, NIC phù hợp; đưa vào kế hoạch để chấm điểm và theo dõi.', icon: <Target className="h-4 w-4" /> },
        ].map((s) => (
          <li key={s.n} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{s.n}</span>
            <span><strong className="flex items-center gap-1.5 text-slate-900 dark:text-white">{s.icon}{s.title}</strong><span className="text-slate-500 dark:text-slate-400">{s.text}</span></span>
          </li>
        ))}
      </ol>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="space-y-5">
          <NotePanel note={note} setNote={setNote} analysis={analysis} onAnalyze={runAnalysis} />
          <CuePanel selected={selectedSet} evidence={evidence} toggle={toggle} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader
              icon={<ListChecks className="h-5 w-5" />}
              title="Chẩn đoán gợi ý"
              subtitle={selected.length
                ? `${main.length} chẩn đoán phù hợp với ${selected.length} dấu hiệu đã chọn, sắp theo mức bằng chứng và ưu tiên chăm sóc.`
                : 'Chọn ít nhất một dấu hiệu để bắt đầu.'}
            />
            {main.length === 0 ? (
              <EmptyState
                icon={<Wand2 className="h-5 w-5" />}
                title={selected.length
                  ? 'Dữ liệu hiện có chưa đủ để gợi ý. Hãy bổ sung dấu hiệu đặc trưng (ví dụ: ho không hiệu quả, điểm đau, SpO₂, Braden).'
                  : 'Dán một ghi chép nhận định hoặc thử một ví dụ mẫu ở bên trái.'}
              />
            ) : (
              <ol className="divide-y divide-slate-100 dark:divide-slate-800">
                {main.map((s, i) => (
                  <SuggestionCard key={s.rule.code} rank={i + 1} s={s} evidence={evidence} selected={selectedSet} onAddCue={add} onPush={setPushing} defaultOpen={i === 0} />
                ))}
              </ol>
            )}
          </Card>

          {superseded.length > 0 && (
            <details className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
              <summary className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                {superseded.length} chẩn đoán nguy cơ đã được thay bằng chẩn đoán hiện tại
              </summary>
              <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                {superseded.map((s) => (
                  <li key={s.rule.code}><CodeBadge system="nanda" code={s.rule.code} className="mr-2" />{s.rule.vi}: vấn đề đã xảy ra, dùng “{ruleVi(s.supersededBy!)}”.</li>
                ))}
              </ul>
            </details>
          )}

          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            Công cụ hỗ trợ suy luận, không thay thế phán đoán lâm sàng. Dấu hiệu, trọng số và liên kết NANDA-I → NOC → NIC là nội dung biên soạn của ứng dụng (không chép từ sách), cần đối chiếu NANDA-I 2024–2026, NOC 6, NIC 8 và quy trình của đơn vị. Tình huống khẩn cấp xử trí theo quy trình cấp cứu trước.
          </p>
        </div>
      </div>

      {pushing && <PushToPlanModal entry={pushing} onClose={() => setPushing(null)} />}
    </>
  );
}

// ---------------------------------------------------------------------------

function NotePanel({ note, setNote, analysis, onAnalyze }: {
  note: string; setNote: (s: string) => void; analysis: NoteAnalysis | null; onAnalyze: (text?: string) => void;
}) {
  return (
    <Card>
      <CardHeader icon={<Wand2 className="h-5 w-5" />} title="Phân tích ghi chép nhận định" subtitle="Viết tự do, có dấu hoặc không dấu. Nhận diện cả chỉ số: SpO₂, nhiệt độ, mạch, HA, nhịp thở, điểm đau x/10, đường huyết, Braden, Morse, GCS." />
      <div className="space-y-3 p-5">
        <Textarea
          rows={5}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: Người bệnh 75 tuổi, ho yếu, đờm đặc khó khạc, SpO2 90%, nhiệt độ 38.5°C, đau vết mổ 6/10, không sốt về đêm…"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" icon={<Sparkles className="h-4 w-4" />} disabled={!note.trim()} onClick={() => onAnalyze()}>Phân tích</Button>
          <span className="text-xs text-slate-500">Ví dụ:</span>
          {SAMPLE_NOTES.map((s) => (
            <Button key={s.title} size="sm" variant="ghost" onClick={() => { setNote(s.text); onAnalyze(s.text); }}>{s.title}</Button>
          ))}
        </div>
        {analysis && (analysis.detections.length > 0 || analysis.negated.length > 0) && (
          <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
            {analysis.detections.length > 0 && (
              <div>
                <p className="mb-1.5 font-medium text-slate-700 dark:text-slate-300">Đã nhận diện và thêm vào dữ liệu:</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.detections.map((d) => (
                    <Badge key={d.cueId} tone="brand" title={CUE_BY_ID.get(d.cueId)?.vi}><Check className="h-3 w-3" />{d.evidence}</Badge>
                  ))}
                </div>
              </div>
            )}
            {analysis.negated.length > 0 && (
              <p className="text-slate-500">Bỏ qua vì có từ phủ định: {analysis.negated.map((d) => d.evidence).join(', ')}.</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function CuePanel({ selected, evidence, toggle }: { selected: Set<string>; evidence: Record<string, string>; toggle: (id: string) => void }) {
  const [q, setQ] = useState('');
  const visible = CUES.filter((c) => matches(q, c.vi, c.keywords.join(' ')));
  const chosen = [...selected].map((id) => CUE_BY_ID.get(id)).filter((c): c is Cue => Boolean(c));
  return (
    <Card>
      <CardHeader icon={<Stethoscope className="h-5 w-5" />} title="Dấu hiệu và yếu tố đã ghi nhận" subtitle="Bấm để chọn hoặc bỏ chọn. Chỉ chọn điều đã thực sự quan sát hoặc đo được." />
      <div className="space-y-4 p-5">
        {chosen.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chosen.map((c) => (
              <button key={c.id} type="button" onClick={() => toggle(c.id)}
                className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700">
                {c.vi}{evidence[c.id] && /\d/.test(evidence[c.id]) ? ` · ${evidence[c.id]}` : ''}<X className="h-3 w-3" aria-label="Bỏ chọn" />
              </button>
            ))}
          </div>
        )}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm dấu hiệu: khó thở, sặc, loét, lo lắng…" className="pl-9" />
        </div>
        <div className="space-y-2">
          {CUE_GROUPS.map((g) => {
            const cues = visible.filter((c) => c.group === g.id);
            if (!cues.length) return null;
            const count = cues.filter((c) => selected.has(c.id)).length;
            return (
              <details key={g.id} open={Boolean(q) || count > 0} className="group rounded-lg border border-slate-200 dark:border-slate-800">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                  <span>{g.vi}{count > 0 && <Badge tone="brand" className="ml-2">{count}</Badge>}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                  {cues.map((c) => {
                    const on = selected.has(c.id);
                    return (
                      <button key={c.id} type="button" aria-pressed={on} onClick={() => toggle(c.id)}
                        className={cx('rounded-full border px-2.5 py-1 text-left text-xs transition',
                          on ? 'border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800')}>
                        {on && <Check className="mr-1 inline h-3 w-3" />}{c.vi}
                      </button>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------

function SuggestionCard({ rank, s, evidence, selected, onAddCue, onPush, defaultOpen }: {
  rank: number; s: DiagnosisSuggestion; evidence: Record<string, string>; selected: Set<string>;
  onAddCue: (id: string) => void; onPush: (e: CareEntry) => void; defaultOpen: boolean;
}) {
  const { toast } = useApp();
  const [open, setOpen] = useState(defaultOpen);
  const [nocCode, setNocCode] = useState(s.noc[0]?.code ?? '');
  const relevantNic = s.nic.filter((n) => n.relevant).slice(0, 4).map((n) => n.code);
  const [nicCodes, setNicCodes] = useState<string[]>(relevantNic);
  // Khi dữ liệu đổi, giữ lựa chọn còn hợp lệ.
  useEffect(() => { if (!s.noc.some((n) => n.code === nocCode)) setNocCode(s.noc[0]?.code ?? ''); }, [s.noc, nocCode]);

  const pes = pesStatement(s);
  const conf = CONFIDENCE[s.confidence];
  const pr = PRIORITY[s.rule.priority];
  const withEvidence = (c: Cue) => (evidence[c.id] && /\d/.test(evidence[c.id]) ? `${c.vi} (${evidence[c.id]})` : c.vi);

  const buildEntry = (): CareEntry => {
    const base = newEntry();
    const noc = s.noc.find((n) => n.code === nocCode) ?? s.noc[0];
    return {
      ...base,
      nanda: { code: s.rule.code, label: s.label },
      definingCharacteristics: s.matchedSigns.map((m) => withEvidence(m.cue)),
      relatedFactors: s.matchedFactors.map((m) => withEvidence(m.cue)),
      noc: { ...base.noc, code: noc.code, label: noc.label },
      nic: s.nic.filter((n) => nicCodes.includes(n.code)).map((n) => ({ code: n.code, label: n.label, activities: [] })),
      notes: `Mục tiêu đề xuất: ${s.rule.goal}\nCâu chẩn đoán: ${pes}\n(Gợi ý từ Trợ lý chẩn đoán, đã được điều dưỡng xem xét.)`,
    };
  };

  return (
    <li className="px-5 py-4">
      <div className="flex items-start gap-3">
        <span className={cx('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
          rank === 1 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300')}>{rank}</span>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => setOpen(!open)} className="w-full text-left" aria-expanded={open}>
            <div className="flex flex-wrap items-center gap-2">
              <CodeBadge system="nanda" code={s.rule.code} />
              <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">{s.rule.vi}</h3>
              <ChevronDown className={cx('ml-auto h-4 w-4 shrink-0 text-slate-400 transition', open && 'rotate-180')} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge tone={conf.tone}>{conf.label}</Badge>
              <Badge tone={pr.tone}>{pr.label}</Badge>
              <Badge>{KIND[s.rule.kind]}</Badge>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1"><ProgressBar value={s.relevance / 100} tone={s.confidence === 'high' ? 'brand' : 'amber'} /></div>
              <span className="w-10 text-right text-xs tabular-nums text-slate-500">{s.relevance}%</span>
            </div>
          </button>

          {s.redFlag && (
            <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{s.redFlag}
            </p>
          )}

          {open && (
            <div className="mt-4 space-y-4 text-sm">
              <section>
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Vì sao gợi ý</h4>
                <ul className="space-y-1">
                  {s.matchedSigns.map((m) => (
                    <li key={m.cue.id} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{withEvidence(m.cue)}{m.weight === 3 && <Badge tone="emerald" className="ml-1.5">đặc trưng</Badge>}</span></li>
                  ))}
                  {s.matchedFactors.map((m) => (
                    <li key={m.cue.id} className="flex items-start gap-2 text-slate-600 dark:text-slate-400"><Plus className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                      <span>{s.rule.kind === 'risk' ? 'Yếu tố nguy cơ' : 'Yếu tố liên quan'}: {withEvidence(m.cue)}</span></li>
                  ))}
                </ul>
                {s.rule.differential && <p className="mt-2 text-xs leading-relaxed text-slate-500">Phân biệt: {s.rule.differential}</p>}
              </section>

              {s.toVerify.length > 0 && (
                <section>
                  <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Cần đánh giá thêm để khẳng định</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {s.toVerify.map((c) => (
                      <button key={c.id} type="button" onClick={() => onAddCue(c.id)} disabled={selected.has(c.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-brand-500 hover:text-brand-700 dark:border-slate-600 dark:text-slate-300">
                        <Plus className="h-3 w-3" />{c.vi}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Câu chẩn đoán (P – E – S)</h4>
                  <Button size="sm" variant="ghost" icon={<ClipboardCopy className="h-3.5 w-3.5" />}
                    onClick={async () => toast(await copyText(pes) ? 'Đã sao chép câu chẩn đoán' : 'Không sao chép được', 'info')}>Sao chép</Button>
                </div>
                <p className="leading-relaxed text-slate-800 dark:text-slate-200">{pes}</p>
              </section>

              <section>
                <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300"><Target className="h-3.5 w-3.5" />Mục tiêu (NOC): chọn một</h4>
                <div className="space-y-1.5">
                  {s.noc.map((n) => (
                    <label key={n.code} className={cx('flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2',
                      nocCode === n.code ? 'border-sky-400 bg-sky-50/60 dark:border-sky-700 dark:bg-sky-950/20' : 'border-slate-200 dark:border-slate-800', !n.relevant && 'opacity-70')}>
                      <input type="radio" name={'noc-' + s.rule.code} className="mt-1" checked={nocCode === n.code} onChange={() => setNocCode(n.code)} />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-1.5"><CodeBadge system="noc" code={n.code} /><span className="font-medium">{n.vi}</span></span>
                        <span className="block text-xs text-slate-500">{n.label} · {n.why}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 rounded-lg border border-sky-200 bg-sky-50/50 px-3 py-2 text-xs leading-relaxed text-sky-900 dark:border-sky-900 dark:bg-sky-950/20 dark:text-sky-200">
                  <strong>Mục tiêu đề xuất:</strong> {s.rule.goal}
                </p>
              </section>

              <section>
                <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"><ListChecks className="h-3.5 w-3.5" />Can thiệp (NIC)</h4>
                <div className="space-y-1.5">
                  {s.nic.map((n) => {
                    const on = nicCodes.includes(n.code);
                    return (
                      <div key={n.code} className={cx('flex items-start gap-2 rounded-lg border px-3 py-2',
                        on ? 'border-emerald-400 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-800', !n.relevant && !on && 'opacity-70')}>
                        <input type="checkbox" className="mt-1" checked={on} aria-label={n.vi}
                          onChange={() => setNicCodes((xs) => (on ? xs.filter((x) => x !== n.code) : [...xs, n.code]))} />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5"><CodeBadge system="nic" code={n.code} /><span className="font-medium">{n.vi}</span>
                            {!n.relevant && <Badge>khi cần</Badge>}</span>
                          <span className="block text-xs text-slate-500">{n.label} · {n.why}</span>
                        </span>
                        <a href={`#/nic-reader?code=${n.code}`} title="Xem định nghĩa và hoạt động NIC 8" className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-700 dark:hover:bg-slate-800">
                          <BookText className="h-4 w-4" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="mr-auto text-xs text-slate-500">Mở biểu mẫu kế hoạch để chọn thang NOC và điểm ban đầu trước khi lưu.</span>
                <Button variant="primary" icon={<ClipboardPlus className="h-4 w-4" />} disabled={!nocCode || nicCodes.length === 0} onClick={() => onPush(buildEntry())}>
                  Đưa vào kế hoạch chăm sóc
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function PushToPlanModal({ entry, onClose }: { entry: CareEntry; onClose: () => void }) {
  const { plans, upsertPlan } = useApp();
  const sorted = [...plans].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const go = (planId: string) => {
    try { sessionStorage.setItem(PREFILL_KEY, JSON.stringify({ ...entry, id: uid('entry') })); } catch { /* bỏ qua */ }
    onClose();
    navigate(`/plans/${planId}?add=assistant`);
  };
  const createAndGo = () => {
    const plan = newPlan(plans);
    upsertPlan(plan);
    go(plan.id);
  };
  return (
    <Modal open onClose={onClose}>
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Đưa vào kế hoạch chăm sóc</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          <CodeBadge system="nanda" code={entry.nanda.code} className="mr-1.5" />{ruleVi(entry.nanda.code)}, kèm {entry.nic.length} can thiệp NIC. Biểu mẫu sẽ mở để bạn chọn thang NOC và điểm ban đầu.
        </p>
      </div>
      <div className="max-h-[50vh] overflow-y-auto p-2">
        <button type="button" onClick={createAndGo} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10">
          <Plus className="h-4 w-4" />Tạo kế hoạch mới
        </button>
        {sorted.map((p) => (
          <button key={p.id} type="button" onClick={() => go(p.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            <span className="font-mono text-xs text-slate-500">{p.code}</span>
            <span className="flex-1 truncate">{p.patient.name || 'Chưa có tên người bệnh'}{p.patient.bed ? ` · giường ${p.patient.bed}` : ''}</span>
            <span className="text-xs text-slate-400">{p.entries.length} vấn đề</span>
          </button>
        ))}
      </div>
      <div className="flex justify-end border-t border-slate-200 px-5 py-3 dark:border-slate-800">
        <Button onClick={onClose}>Hủy</Button>
      </div>
    </Modal>
  );
}
