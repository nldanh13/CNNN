import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  ClipboardList,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import type { CareEntry, CarePlan, Patient } from '../types';
import { useApp } from '../store/AppContext';
import { navigate } from '../store/router';
import { goalState, newEntry, planProgress } from '../lib/carePlan';
import { findNanda, findNoc, nandaDomain, nocDomain } from '../data/taxonomy';
import { NOC_SCALES } from '../data/reference';
import { bmiCategory, computeBmi, cx, formatDate, signed } from '../lib/utils';
import { Badge, Button, Card, CardHeader, CodeBadge, EmptyState, Field, IconButton, Input, PageHeader, ProgressBar, Select, SYSTEM_DOT, TagInput, Term } from '../components/ui';
import { EntryForm } from '../components/EntryForm';
import { scaleLabel } from '../components/Likert';
import { NocAssessmentPanel } from '../components/NocAssessmentPanel';
import { PrintView } from '../components/PrintView';
import { RETIRED_NIC7 } from '../data/nicMigration';
import { NnnReasoningWorkflow } from '../components/NnnReasoningWorkflow';

export function PlanEditorPage({ id, query }: { id: string; query: URLSearchParams }) {
  const { t, lang, plans, updatePlan, deletePlan, toast } = useApp();
  const plan = plans.find((p) => p.id === id);
  const [editing, setEditing] = useState<{ entry: CareEntry; isNew: boolean } | null>(null);
  // Mặc định chỉ mở vấn đề ưu tiên đầu tiên để danh sách dài vẫn gọn.
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(plan?.entries[0] ? [plan.entries[0].id] : []));
  const toggleOpen = (entryId: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  const allOpen = !!plan && plan.entries.length > 0 && plan.entries.every((e) => openIds.has(e.id));

  // Mở sẵn biểu mẫu khi đến từ thư viện với ?add=nanda&code=…
  useEffect(() => {
    const code = query.get('code');
    if (query.get('add') === 'nanda' && code) {
      const item = findNanda(code, query.get('label') ?? undefined);
      if (item) setEditing({ entry: { ...newEntry(), nanda: { code: item.code, label: item.label } }, isNew: true });
      history.replaceState(null, '', `#/plans/${id}`);
    }
  }, [query, id]);

  if (!plan) {
    return (
      <Card>
        <EmptyState
          icon={<ClipboardList className="h-5 w-5" />}
          title={t.editor.notFound}
          action={
            <Button icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/plans')}>
              {t.editor.back}
            </Button>
          }
        />
      </Card>
    );
  }

  const update = (fn: (p: CarePlan) => CarePlan) => updatePlan(plan.id, fn);
  const setPatient = (patch: Partial<Patient>) => update((p) => ({ ...p, patient: { ...p.patient, ...patch } }));
  const setEntries = (fn: (entries: CareEntry[]) => CareEntry[]) => update((p) => ({ ...p, entries: fn(p.entries) }));

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          breadcrumb={
            <a href="#/plans" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.editor.back}
            </a>
          }
          title={
            <span className="flex flex-wrap items-center gap-3">
              {plan.patient.name || t.plans.untitled}
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{plan.code}</span>
            </span>
          }
          subtitle={`${t.editor.updated}: ${formatDate(plan.updatedAt, lang, true)}`}
          actions={
            <>
              <Button icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
                {t.editor.print}
              </Button>
              <IconButton
                label={t.app.delete}
                tone="danger"
                onClick={() => {
                  if (window.confirm(t.app.confirmDelete)) {
                    deletePlan(plan.id);
                    toast(t.plans.deleted);
                    navigate('/plans');
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </>
          }
        />

        <details className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900 dark:text-white">
            Hướng dẫn chẩn đoán thống nhất: Nhận định → NANDA-I → NOC → NIC → Lượng giá
          </summary>
          <div className="pt-4"><NnnReasoningWorkflow /></div>
        </details>

        <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
          <div className="min-w-0 space-y-6 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:self-start xl:overflow-y-auto xl:p-0.5">
            <PatientCard plan={plan} setPatient={setPatient} setNurse={(nurse) => update((p) => ({ ...p, nurse }))} />
            <SummaryCard plan={plan} />
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  {t.editor.problems} <span className="ml-1 text-sm font-normal text-slate-400">{plan.entries.length}</span>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {plan.entries.length > 1 && (
                  <Button
                    variant="ghost"
                    icon={allOpen ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />}
                    onClick={() => setOpenIds(allOpen ? new Set() : new Set(plan.entries.map((e) => e.id)))}
                  >
                    {allOpen ? t.editor.collapseAll : t.editor.expandAll}
                  </Button>
                )}
                <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setEditing({ entry: newEntry(), isNew: true })}>
                  {t.editor.addProblem}
                </Button>
              </div>
            </div>

            {plan.entries.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Stethoscope className="h-5 w-5" />}
                  title={t.editor.noProblems}
                  action={
                    <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setEditing({ entry: newEntry(), isNew: true })}>
                      {t.editor.addProblem}
                    </Button>
                  }
                />
              </Card>
            ) : (
              <ol className="space-y-3">
                {plan.entries.map((entry, i) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    nurse={plan.nurse}
                    index={i}
                    count={plan.entries.length}
                    open={openIds.has(entry.id)}
                    onToggle={() => toggleOpen(entry.id)}
                    onEdit={() => setEditing({ entry, isNew: false })}
                    onChange={(e) => setEntries((es) => es.map((x) => (x.id === e.id ? e : x)))}
                    onMove={(dir) =>
                      setEntries((es) => {
                        const next = [...es];
                        const j = i + dir;
                        [next[i], next[j]] = [next[j], next[i]];
                        return next;
                      })
                    }
                    onDelete={() => {
                      if (window.confirm(t.app.confirmDelete)) {
                        setEntries((es) => es.filter((x) => x.id !== entry.id));
                        toast(t.editor.deleted);
                      }
                    }}
                  />
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      <PrintView plan={plan} />

      {editing && (
        <EntryForm
          open
          initial={editing.entry}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={(e) => {
            setEntries((es) => (editing.isNew ? [...es, e] : es.map((x) => (x.id === e.id ? e : x))));
            setOpenIds((prev) => new Set(prev).add(e.id));
            setEditing(null);
            toast(t.entryForm.saved);
          }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------

function PatientCard({ plan, setPatient, setNurse }: { plan: CarePlan; setPatient: (p: Partial<Patient>) => void; setNurse: (n: string) => void }) {
  const { t } = useApp();
  const p = plan.patient;
  const bmi = computeBmi(p.heightCm, p.weightKg);
  const cat = bmi != null ? bmiCategory(bmi) : null;
  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  return (
    <Card>
      <CardHeader title={t.editor.patient} />
      <div className="grid grid-cols-2 gap-3 p-5">
        <Field label={t.editor.name} className="col-span-2">
          <Input value={p.name} onChange={(e) => setPatient({ name: e.target.value })} />
        </Field>
        <Field label={t.editor.mrn}>
          <Input value={p.mrn} onChange={(e) => setPatient({ mrn: e.target.value })} className="font-mono" />
        </Field>
        <Field label={t.editor.admission}>
          <Input type="date" value={p.admissionDate} onChange={(e) => setPatient({ admissionDate: e.target.value })} />
        </Field>
        <Field label={t.editor.age}>
          <Input type="number" min={0} max={130} value={p.age ?? ''} onChange={(e) => setPatient({ age: numOrNull(e.target.value) })} />
        </Field>
        <Field label={t.editor.gender}>
          <Select value={p.gender} onChange={(e) => setPatient({ gender: e.target.value as Patient['gender'] })}>
            <option value="male">{t.editor.male}</option>
            <option value="female">{t.editor.female}</option>
            <option value="other">{t.editor.other}</option>
          </Select>
        </Field>
        <Field label={t.editor.height}>
          <Input type="number" min={0} value={p.heightCm ?? ''} onChange={(e) => setPatient({ heightCm: numOrNull(e.target.value) })} />
        </Field>
        <Field label={t.editor.weight}>
          <Input type="number" min={0} step="0.1" value={p.weightKg ?? ''} onChange={(e) => setPatient({ weightKg: numOrNull(e.target.value) })} />
        </Field>
        <div className="col-span-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60">
          <span className="text-xs font-medium text-slate-500">{t.editor.bmi}</span>
          <span className="flex items-center gap-2">
            <strong className="tabular-nums text-slate-900 dark:text-white">{bmi ?? '—'}</strong>
            {cat && <Badge tone={cat === 'normal' ? 'emerald' : cat === 'underweight' ? 'amber' : 'rose'}>{t.editor.bmiCat[cat]}</Badge>}
          </span>
        </div>
        <Field label={t.editor.ward}>
          <Input value={p.ward} onChange={(e) => setPatient({ ward: e.target.value })} />
        </Field>
        <Field label={t.editor.bed}>
          <Input value={p.bed} onChange={(e) => setPatient({ bed: e.target.value })} />
        </Field>
        <Field label={t.editor.medicalDx} className="col-span-2">
          <TagInput
            values={p.medicalDiagnoses}
            onChange={(v) => setPatient({ medicalDiagnoses: v })}
            placeholder={t.editor.addTag}
            renderValue={(v) => <Term code={null} en={v} />}
          />
        </Field>
        <Field label={t.editor.allergies} className="col-span-2">
          <TagInput values={p.allergies} onChange={(v) => setPatient({ allergies: v })} placeholder={t.editor.addTag} />
        </Field>
        <Field label={t.editor.nurse} className="col-span-2">
          <Input value={plan.nurse} onChange={(e) => setNurse(e.target.value)} />
        </Field>
      </div>
    </Card>
  );
}

function SummaryCard({ plan }: { plan: CarePlan }) {
  const { t } = useApp();
  const prog = planProgress(plan);
  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-slate-500">{t.dashboard.goalReached}</p>
        <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
          {prog.met}/{prog.total}
        </p>
      </div>
      <div className="mt-2">
        <ProgressBar value={prog.ratio} />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          [t.systems.nandaShort, plan.entries.length, 'text-rose-600 dark:text-rose-400'],
          [t.systems.nocShort, new Set(plan.entries.map((e) => e.noc.code)).size, 'text-sky-600 dark:text-sky-400'],
          [t.systems.nicShort, plan.entries.reduce((n, e) => n + e.nic.length, 0), 'text-emerald-600 dark:text-emerald-400'],
        ].map(([label, n, color]) => (
          <div key={label as string} className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800/60">
            <dd className={cx('text-lg font-semibold tabular-nums', color as string)}>{n}</dd>
            <dt className="text-[11px] text-slate-500">{label}</dt>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function ColumnTitle({ dot, children }: { dot: string; children: ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
      <span className={cx('h-1.5 w-1.5 rounded-full', dot)} />
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-xs text-slate-400">—</p>;
  return (
    <ul className="space-y-1">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
          <Term code={null} en={x} />
        </li>
      ))}
    </ul>
  );
}

/** Thang 1–5 gọn trong một hàng: ô tô màu tới điểm hiện tại, viền xanh ở mục tiêu, chấm dưới điểm ban đầu. */
function ScoreTrack({ baseline, current, target }: { baseline: number; current: number | null; target: number }) {
  const { t } = useApp();
  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = current != null && n <= current;
          return (
            <div key={n} className="flex flex-1 flex-col items-center gap-1">
              <span
                className={cx(
                  'flex h-6 w-full items-center justify-center rounded-md text-[11px] font-semibold tabular-nums',
                  filled ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
                  n === target && 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900',
                )}
              >
                {n}
              </span>
              <span className={cx('h-1 w-1 rounded-full', n === baseline ? 'bg-slate-500 dark:bg-slate-400' : 'bg-transparent')} />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-slate-500" />{t.editor.baseline} {baseline}</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-sky-500" />{t.editor.current} {current ?? '—'}</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm ring-2 ring-inset ring-emerald-500" />{t.editor.target} {target}</span>
      </div>
    </div>
  );
}

function EntryCard({
  entry,
  nurse,
  index,
  count,
  open,
  onToggle,
  onEdit,
  onChange,
  onMove,
  onDelete,
}: {
  entry: CareEntry;
  nurse: string;
  index: number;
  count: number;
  open: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onChange: (e: CareEntry) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const { t, lang } = useApp();
  const nanda = findNanda(entry.nanda.code, entry.nanda.label);
  const noc = findNoc(entry.noc.code);
  const scale = NOC_SCALES.find((s) => s.code === entry.noc.scaleCode);
  const state = goalState(entry);
  const resolved = entry.status === 'resolved';
  const change = entry.noc.current != null ? entry.noc.current - entry.noc.baseline : null;
  const bodyId = `entry-${entry.id}`;

  const domainText = useMemo(() => {
    if (!nanda) return '';
    const d = nandaDomain(nanda.domainNumber);
    return `${t.library.domain} ${nanda.domainNumber} · ${lang === 'vi' ? d?.nameVi : d?.nameEn}`;
  }, [nanda, lang, t]);

  const goalBadge = (
    <Badge tone={state === 'met' ? 'emerald' : state === 'notMet' ? 'amber' : 'slate'}>
      {state === 'met' ? t.editor.goalMet : state === 'notMet' ? t.editor.goalNotMet : t.editor.notAssessed}
    </Badge>
  );

  return (
    <li>
      <Card className={cx('overflow-hidden transition-shadow', open && 'shadow-md', resolved && 'opacity-70')}>
        {/* Tiêu đề: luôn hiển thị, bấm để mở/thu gọn */}
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:gap-3 sm:px-5">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={bodyId}
            className="flex min-w-0 flex-1 items-start gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <CodeBadge system="nanda" code={entry.nanda.code} className="shrink-0" />
                <Term code={entry.nanda.code} en={entry.nanda.label} className={cx('min-w-0 font-semibold text-slate-900 dark:text-white', open ? '' : 'truncate')} />
              </span>
              {/* Tóm tắt NOC/NIC để đọc nhanh khi thu gọn */}
              <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                {resolved ? (
                  <Badge tone="emerald">
                    <CheckCircle2 className="h-3 w-3" />
                    {t.editor.resolved}
                  </Badge>
                ) : (
                  <Badge tone="brand">{t.editor.active}</Badge>
                )}
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <CodeBadge system="noc" code={entry.noc.code} />
                  <span className="font-mono tabular-nums text-slate-700 dark:text-slate-200">
                    {entry.noc.baseline} → {entry.noc.current ?? '—'} / {entry.noc.target}
                  </span>
                </span>
                {goalBadge}
                <span className="inline-flex items-center gap-1">
                  <span className={cx('h-1.5 w-1.5 rounded-full', SYSTEM_DOT.nic)} />
                  {entry.nic.length} {t.editor.interventions.toLowerCase()}
                </span>
                {open && domainText && <span className="hidden text-slate-400 sm:inline">{domainText}</span>}
              </span>
            </span>
            <ChevronDown className={cx('mt-1.5 h-4 w-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
          </button>
          <div className="-mr-1 flex shrink-0 items-center self-end sm:mr-0 sm:self-auto">
            <IconButton label={t.editor.moveUp} disabled={index === 0} onClick={() => onMove(-1)} className="hidden sm:inline-flex">
              <ArrowUp className="h-4 w-4" />
            </IconButton>
            <IconButton label={t.editor.moveDown} disabled={index === count - 1} onClick={() => onMove(1)} className="hidden sm:inline-flex">
              <ArrowDown className="h-4 w-4" />
            </IconButton>
            <IconButton
              label={resolved ? t.editor.markActive : t.editor.markResolved}
              onClick={() => onChange({ ...entry, status: resolved ? 'active' : 'resolved' })}
            >
              {resolved ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            </IconButton>
            <IconButton label={t.app.edit} onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </IconButton>
            <IconButton label={t.app.delete} tone="danger" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        {open && (
          <div id={bodyId} className="animate-fade border-t border-slate-100 dark:border-slate-800">
            <div className="grid divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0 dark:divide-slate-800">
              {/* Chẩn đoán */}
              <div className="space-y-4 p-4 sm:p-5">
                <div>
                  <ColumnTitle dot="bg-rose-500">{t.editor.definingChars}</ColumnTitle>
                  <BulletList items={entry.definingCharacteristics} />
                </div>
                <div>
                  <ColumnTitle dot="bg-rose-300">{t.editor.relatedFactors}</ColumnTitle>
                  <BulletList items={entry.relatedFactors} />
                </div>
              </div>

              {/* Kết quả NOC */}
              <div className="space-y-4 p-4 sm:p-5">
                <div>
                  <ColumnTitle dot="bg-sky-500">{t.editor.outcome}</ColumnTitle>
                  <div className="flex items-start gap-2">
                    <CodeBadge system="noc" code={entry.noc.code} className="mt-0.5" />
                    <Term code={entry.noc.code} en={entry.noc.label} className="text-sm font-medium text-slate-800 dark:text-slate-100" />
                  </div>
                  {noc && (
                    <p className="mt-1 text-xs text-slate-400">
                      {nocDomain(noc.domainId)?.roman}-{noc.classLetter} · {t.editor.scale} {entry.noc.scaleCode}
                      {scale && ` (${lang === 'vi' ? scale.meaningVi : scale.meaningEn})`}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <ScoreTrack baseline={entry.noc.baseline} current={entry.noc.current} target={entry.noc.target} />
                  <p className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{scaleLabel(entry.noc.scaleCode, entry.noc.current, lang) || '—'}</span>
                    {change != null && (
                      <span className={cx('font-semibold tabular-nums', change > 0 ? 'text-emerald-600 dark:text-emerald-400' : change < 0 ? 'text-rose-600' : 'text-slate-500')}>
                        {t.editor.change} {signed(change)}
                      </span>
                    )}
                  </p>
                </div>

                {entry.noc.indicators.length > 0 && (
                  <div>
                    <ColumnTitle dot="bg-sky-300">{t.editor.indicators}</ColumnTitle>
                    <ul className="space-y-1.5">
                      {entry.noc.indicators.map((ind) => (
                        <li key={ind.id} className="flex items-center gap-2 text-sm">
                          <span className="font-mono text-[11px] text-slate-400">{ind.code}</span>
                          <Term code={null} en={ind.name} showOriginal={false} className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-300" />
                          <span className="rounded bg-sky-50 px-1.5 font-mono text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">{ind.score ?? '–'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <NocAssessmentPanel entry={entry} nurse={nurse} onChange={onChange} />
              </div>

              {/* Can thiệp NIC */}
              <div className="p-4 sm:p-5">
                <ColumnTitle dot="bg-emerald-500">
                  {t.editor.interventions} ({entry.nic.length})
                </ColumnTitle>
                {entry.nic.length === 0 ? (
                  <p className="text-xs text-slate-400">—</p>
                ) : (
                  <ul className="space-y-3">
                    {entry.nic.map((n) => (
                      <li key={n.code}>
                        <div className="flex items-start gap-2">
                          <CodeBadge system="nic" code={n.code} className="mt-0.5" />
                          <span className="min-w-0">
                            <Term code={n.code} en={n.label} showOriginal={false} className="text-sm font-medium text-slate-800 dark:text-slate-100" />
                            {RETIRED_NIC7[n.code] && <span className="mt-1 block text-xs text-amber-700 dark:text-amber-300">
                              Mã NIC 7 đã ngừng trong NIC 8; giữ lại để bảo toàn kế hoạch cũ.
                            </span>}
                          </span>
                        </div>
                        {n.activities.length > 0 && (
                          <ul className="ml-1 mt-1.5 space-y-1 border-l-2 border-emerald-100 pl-3 dark:border-emerald-500/20">
                            {n.activities.map((a, i) => (
                              <li key={i} className="flex gap-1 text-xs text-slate-600 dark:text-slate-400">
                                <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                                <Term code={null} en={a} showOriginal={false} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {entry.notes && (
              <div className="border-t border-slate-100 bg-amber-50/50 px-5 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-amber-500/5 dark:text-slate-300">
                <span className="mr-2 text-xs font-semibold text-amber-700 dark:text-amber-400">{t.editor.notes}:</span>
                {entry.notes}
              </div>
            )}

          </div>
        )}
      </Card>
    </li>
  );
}
