import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ChevronDown, ClipboardPlus, Plus, RotateCcw, Sparkles, X } from 'lucide-react';
import type { CareEntry } from '../types';
import { useApp } from '../store/AppContext';
import { navigate } from '../store/router';
import { CUE_BY_ID, CUES, SAMPLE_NOTES, type Cue } from '../data/diagnosisKnowledge';
import { PREFILL_KEY, analyzeNote, pesStatement, rankDiagnoses, ruleVi, type DiagnosisSuggestion } from '../lib/diagnosisAssistant';
import { newEntry, newPlan } from '../lib/carePlan';
import { cx, matches, uid } from '../lib/utils';
import { Button, CodeBadge, Input, Modal, Textarea } from '../components/ui';

const STATE_KEY = 'clinicalnnn.assistant.state';
/** Số chẩn đoán hiện ngay; phần còn lại nằm sau nút "Xem thêm". */
const TOP = 5;

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

/** Nhãn ngắn cho thẻ: phần trước dấu phẩy, gạch chéo hoặc ngoặc. */
const shortLabel = (c: Cue) => c.vi.split(/\s*[,/(]/)[0].trim();
const withEvidence = (c: Cue, evidence: Record<string, string>) =>
  (evidence[c.id] && /\d/.test(evidence[c.id]) ? evidence[c.id] : shortLabel(c));

export function AssistantPage() {
  const initial = useMemo(loadState, []);
  const [note, setNote] = useState(initial.note);
  const [selected, setSelected] = useState<string[]>(initial.selected);
  const [evidence, setEvidence] = useState<Record<string, string>>(initial.evidence);
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [pushing, setPushing] = useState<CareEntry | null>(null);
  const sample = useRef(0);
  const { toast } = useApp();

  useEffect(() => {
    try { sessionStorage.setItem(STATE_KEY, JSON.stringify({ note, selected, evidence })); } catch { /* bỏ qua */ }
  }, [note, selected, evidence]);

  const ranked = useMemo(() => rankDiagnoses(selected).filter((s) => !s.supersededBy), [selected]);
  const visible = showAll ? ranked : ranked.slice(0, TOP);

  const add = (id: string) => setSelected((xs) => (xs.includes(id) ? xs : [...xs, id]));
  const remove = (id: string) => setSelected((xs) => xs.filter((x) => x !== id));

  const analyze = (text = note) => {
    const r = analyzeNote(text);
    setSelected((xs) => [...new Set([...xs, ...r.detections.map((d) => d.cueId)])]);
    setEvidence((ev) => ({ ...ev, ...Object.fromEntries(r.detections.map((d) => [d.cueId, d.evidence])) }));
    setOpenCode(null);
    setShowAll(false);
    if (!r.detections.length) toast('Chưa nhận ra dấu hiệu nào. Hãy viết rõ hơn hoặc thêm dấu hiệu bằng tay.', 'info');
  };
  const trySample = () => {
    const s = SAMPLE_NOTES[sample.current++ % SAMPLE_NOTES.length];
    setNote(s.text);
    setSelected([]);
    setEvidence({});
    analyze(s.text);
  };
  const reset = () => { setNote(''); setSelected([]); setEvidence({}); setOpenCode(null); };

  // Khi danh sách đổi, mở sẵn chẩn đoán đứng đầu.
  const firstCode = ranked[0]?.rule.code ?? null;
  useEffect(() => { setOpenCode((c) => (c && ranked.some((s) => s.rule.code === c) ? c : firstCode)); }, [firstCode, ranked]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Trợ lý chẩn đoán</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Mô tả người bệnh, trợ lý gợi ý chẩn đoán, mục tiêu và can thiệp.</p>

      {/* 1. Nhận định */}
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <Textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && note.trim()) analyze(); }}
          placeholder="Ví dụ: 78 tuổi, ho yếu, đờm đặc khó khạc, SpO2 89%, nhiệt độ 38.6°C, đi không vững…"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="primary" icon={<Sparkles className="h-4 w-4" />} disabled={!note.trim()} onClick={() => analyze()}>Gợi ý chẩn đoán</Button>
          <Button variant="ghost" onClick={trySample}>Thử ví dụ</Button>
          {(selected.length > 0 || note) && (
            <button type="button" onClick={reset} aria-label="Làm mới" title="Làm mới"
              className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>

        {selected.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="mb-2 text-xs font-medium text-slate-500">Dấu hiệu ghi nhận ({selected.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {selected.map((id) => {
                const c = CUE_BY_ID.get(id);
                return c && (
                  <span key={id} title={c.vi} className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-2.5 pr-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {withEvidence(c, evidence)}
                    <button type="button" onClick={() => remove(id)} aria-label={`Bỏ ${c.vi}`} className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"><X className="h-3 w-3" /></button>
                  </span>
                );
              })}
              <CueAdder selected={selected} onAdd={add} />
            </div>
          </div>
        )}
      </section>

      {/* 2. Kết quả */}
      {selected.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
            {ranked.length ? 'Chẩn đoán gợi ý' : 'Chưa đủ dữ liệu để gợi ý. Hãy thêm dấu hiệu đặc trưng.'}
          </h2>
          <ol className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
            {visible.map((s, i) => (
              <DiagnosisRow
                key={s.rule.code} rank={i + 1} s={s} evidence={evidence}
                open={openCode === s.rule.code}
                onToggle={() => setOpenCode(openCode === s.rule.code ? null : s.rule.code)}
                onAddCue={add} onPush={setPushing}
              />
            ))}
          </ol>
          {ranked.length > TOP && (
            <button type="button" onClick={() => setShowAll(!showAll)} className="mt-2 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
              {showAll ? 'Thu gọn' : `Xem thêm ${ranked.length - TOP} chẩn đoán`}
            </button>
          )}
          <p className="mt-4 text-xs text-slate-400">
            Gợi ý hỗ trợ suy luận, không thay thế đánh giá lâm sàng. Đối chiếu NANDA-I, NOC, NIC và quy trình của đơn vị.
          </p>
        </section>
      )}

      {pushing && <PushToPlanModal entry={pushing} onClose={() => setPushing(null)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------

/** Ô tìm để thêm một dấu hiệu chưa có trong ghi chép. */
function CueAdder({ selected, onAdd }: { selected: string[]; onAdd: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const results = q.trim() ? CUES.filter((c) => !selected.includes(c.id) && matches(q, c.vi, c.keywords.join(' '))).slice(0, 8) : [];
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs text-slate-500 hover:border-brand-500 hover:text-brand-700 dark:border-slate-600">
        <Plus className="h-3 w-3" />Thêm
      </button>
    );
  }
  return (
    <div className="relative w-full sm:w-72">
      <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); if (e.key === 'Enter' && results[0]) { onAdd(results[0].id); setQ(''); } }}
        placeholder="Tìm dấu hiệu: sặc, loét, lo lắng…" className="h-8 text-xs" />
      {results.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {results.map((c) => (
            <li key={c.id}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onAdd(c.id); setQ(''); }}
                className="block w-full px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800">{c.vi}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DiagnosisRow({ rank, s, evidence, open, onToggle, onAddCue, onPush }: {
  rank: number; s: DiagnosisSuggestion; evidence: Record<string, string>; open: boolean;
  onToggle: () => void; onAddCue: (id: string) => void; onPush: (e: CareEntry) => void;
}) {
  const [nocCode, setNocCode] = useState(s.noc[0]?.code ?? '');
  const [nicCodes, setNicCodes] = useState<string[]>(() => s.nic.filter((n) => n.relevant).slice(0, 3).map((n) => n.code));
  useEffect(() => { if (!s.noc.some((n) => n.code === nocCode)) setNocCode(s.noc[0]?.code ?? ''); }, [s.noc, nocCode]);

  const reasons = [...s.matchedSigns, ...s.matchedFactors].map((m, i) => {
    const t = withEvidence(m.cue, evidence);
    return i === 0 || /^\S*\p{Lu}\S*\p{Lu}/u.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1);
  });
  const isRisk = s.rule.kind === 'risk';

  const buildEntry = (): CareEntry => {
    const base = newEntry();
    const noc = s.noc.find((n) => n.code === nocCode) ?? s.noc[0];
    const describe = (c: Cue) => (evidence[c.id] && /\d/.test(evidence[c.id]) ? `${c.vi} (${evidence[c.id]})` : c.vi);
    return {
      ...base,
      nanda: { code: s.rule.code, label: s.label },
      definingCharacteristics: s.matchedSigns.map((m) => describe(m.cue)),
      relatedFactors: s.matchedFactors.map((m) => describe(m.cue)),
      noc: { ...base.noc, code: noc.code, label: noc.label },
      nic: s.nic.filter((n) => nicCodes.includes(n.code)).map((n) => ({ code: n.code, label: n.label, activities: [] })),
      notes: `Mục tiêu: ${s.rule.goal}\nCâu chẩn đoán: ${pesStatement(s)}`,
    };
  };

  return (
    <li className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50">
        <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
          rank === 1 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300')}>{rank}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-medium text-slate-900 dark:text-white">{s.rule.vi}</span>
            {isRisk && <span className="text-xs text-slate-500">nguy cơ</span>}
            {s.rule.priority === 1 && <span className="text-xs font-medium text-rose-600 dark:text-rose-400">ưu tiên</span>}
            {s.redFlag && <AlertTriangle className="h-4 w-4 text-rose-600" aria-label="Có dấu hiệu nguy hiểm" />}
          </span>
          <span className="mt-1 flex items-center gap-2">
            <span className="h-1 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <span className={cx('block h-full rounded-full', s.confidence === 'high' ? 'bg-brand-500' : s.confidence === 'medium' ? 'bg-amber-400' : 'bg-slate-300')} style={{ width: `${s.relevance}%` }} />
            </span>
            <span className="text-[11px] text-slate-400">{s.rule.code}</span>
          </span>
        </span>
        <ChevronDown className={cx('h-4 w-4 shrink-0 text-slate-400 transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="space-y-4 px-4 pb-4 text-sm sm:pl-[3.25rem]">
          {s.redFlag && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">{s.redFlag}</p>
          )}

          <p className="text-slate-600 dark:text-slate-300">
            <span className="text-slate-400">Dựa trên: </span>{reasons.join(', ')}.
            {s.toVerify.length > 0 && (
              <span className="mt-1 block text-xs text-slate-500">
                Kiểm tra thêm:{' '}
                {s.toVerify.map((c, i) => (
                  <span key={c.id}>{i > 0 && ', '}<button type="button" onClick={() => onAddCue(c.id)} className="text-brand-700 hover:underline dark:text-brand-300" title="Bấm để thêm nếu có">{shortLabel(c).toLowerCase()}</button></span>
                ))}
              </span>
            )}
          </p>

          <div>
            <p className="mb-1 text-xs font-semibold text-sky-700 dark:text-sky-300">Mục tiêu</p>
            <select value={nocCode} onChange={(e) => setNocCode(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
              {s.noc.map((n) => <option key={n.code} value={n.code}>{n.vi} ({n.code})</option>)}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">{s.rule.goal}</p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Can thiệp</p>
            <ul className="space-y-1">
              {s.nic.map((n) => {
                const on = nicCodes.includes(n.code);
                return (
                  <li key={n.code}>
                    <label className="flex cursor-pointer items-start gap-2" title={n.why}>
                      <input type="checkbox" className="mt-1" checked={on}
                        onChange={() => setNicCodes((xs) => (on ? xs.filter((x) => x !== n.code) : [...xs, n.code]))} />
                      <span className={cx(!on && 'text-slate-500')}>{n.vi} <span className="text-xs text-slate-400">{n.code}</span></span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          <Button variant="primary" icon={<ClipboardPlus className="h-4 w-4" />} disabled={!nocCode || nicCodes.length === 0} onClick={() => onPush(buildEntry())}>
            Thêm vào kế hoạch
          </Button>
        </div>
      )}
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
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Thêm vào kế hoạch nào?</h2>
        <p className="mt-0.5 text-xs text-slate-500"><CodeBadge system="nanda" code={entry.nanda.code} className="mr-1.5" />{ruleVi(entry.nanda.code)}</p>
      </div>
      <div className="max-h-[50vh] overflow-y-auto p-2">
        <button type="button" onClick={createAndGo} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10">
          <Plus className="h-4 w-4" />Kế hoạch mới
        </button>
        {sorted.map((p) => (
          <button key={p.id} type="button" onClick={() => go(p.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            <span className="font-mono text-xs text-slate-500">{p.code}</span>
            <span className="flex-1 truncate">{p.patient.name || 'Chưa có tên người bệnh'}{p.patient.bed ? ` · giường ${p.patient.bed}` : ''}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
