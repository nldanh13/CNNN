import { useMemo, useState, type FormEvent } from 'react';
import { ClipboardList, Copy, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { navigate } from '../store/router';
import { newPlan, nextPlanCode, planProgress } from '../lib/carePlan';
import { formatDate, matches, uid } from '../lib/utils';
import { Badge, Button, Card, CodeBadge, EmptyState, Field, IconButton, Input, Modal, PageHeader, ProgressBar } from '../components/ui';
import { PlanBackupButtons } from '../components/PlanBackup';

export function PlansPage() {
  const { t, lang, plans, upsertPlan, deletePlan, toast } = useApp();
  const [q, setQ] = useState('');

  const filtered = useMemo(
    () =>
      [...plans]
        .filter((p) => matches(q, p.patient.name, p.patient.mrn, p.code, p.patient.ward, p.patient.bed, p.nurse))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [plans, q],
  );

  const [adding, setAdding] = useState(false);
  const create = () => setAdding(true);

  return (
    <>
      <PageHeader
        title={t.plans.title}
        actions={
          <>
            <PlanBackupButtons />
            <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={create}>
              {t.plans.newTitle}
            </Button>
          </>
        }
      />

      <p className="mb-4 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-900 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        {t.backup.notice}
      </p>

      <Card>
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.plans.searchPlaceholder} className="pl-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-5 w-5" />}
            title={plans.length ? t.app.noResults : t.plans.empty}
            action={
              !plans.length && (
                <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={create}>
                  {t.plans.newTitle}
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-500 dark:border-slate-800">
                  <th className="px-5 py-3 font-medium">{t.plans.colPatient}</th>
                  <th className="hidden px-3 py-3 font-medium md:table-cell">{t.plans.colWard}</th>
                  <th className="hidden px-3 py-3 font-medium lg:table-cell">{t.plans.colProblems}</th>
                  <th className="px-3 py-3 font-medium">{t.plans.colProgress}</th>
                  <th className="hidden px-3 py-3 font-medium sm:table-cell">{t.plans.colUpdated}</th>
                  <th className="w-20 px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((p) => {
                  const prog = planProgress(p);
                  return (
                    <tr key={p.id} className="group cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/40" onClick={() => navigate(`/plans/${p.id}`)}>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-900 dark:text-white">{p.patient.name || t.plans.untitled}</div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          <span className="font-mono">{p.code}</span>
                          {p.patient.mrn && <> · {p.patient.mrn}</>}
                          {p.patient.age != null && <> · {p.patient.age} {lang === 'vi' ? 'tuổi' : 'y'}</>}
                        </div>
                      </td>
                      <td className="hidden px-3 py-3.5 text-slate-600 md:table-cell dark:text-slate-300">
                        {[p.patient.ward, p.patient.bed].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td className="hidden px-3 py-3.5 lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {p.entries.slice(0, 4).map((e) => (
                            <CodeBadge key={e.id} system="nanda" code={e.nanda.code} />
                          ))}
                          {p.entries.length > 4 && <Badge>+{p.entries.length - 4}</Badge>}
                          {p.entries.length === 0 && <span className="text-slate-400">—</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="w-28">
                          <div className="mb-1 text-xs tabular-nums text-slate-500">
                            {prog.met}/{prog.total}
                          </div>
                          <ProgressBar value={prog.ratio} />
                        </div>
                      </td>
                      <td className="hidden px-3 py-3.5 text-xs text-slate-500 sm:table-cell">{formatDate(p.updatedAt, lang, true)}</td>
                      <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-0.5 opacity-60 transition group-hover:opacity-100">
                          <IconButton
                            label={t.plans.duplicate}
                            onClick={() => {
                              const now = new Date().toISOString();
                              upsertPlan({
                                ...structuredClone(p),
                                id: uid('plan'),
                                code: nextPlanCode(plans),
                                createdAt: now,
                                updatedAt: now,
                                entries: p.entries.map((e) => ({ ...structuredClone(e), id: uid('entry') })),
                              });
                              toast(t.plans.duplicated);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            label={t.app.delete}
                            tone="danger"
                            onClick={() => {
                              if (window.confirm(t.app.confirmDelete)) {
                                deletePlan(p.id);
                                toast(t.plans.deleted);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <NewPatientDialog
        open={adding}
        onClose={() => setAdding(false)}
        onCreate={(patient) => {
          const plan = newPlan(plans);
          upsertPlan({ ...plan, patient: { ...plan.patient, ...patient } });
          navigate(`/plans/${plan.id}`);
        }}
      />
    </>
  );
}

/** Chỉ hỏi ba thông tin tối thiểu; kế hoạch chỉ được tạo khi đã có tên. */
function NewPatientDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (p: { name: string; ward: string; bed: string }) => void }) {
  const { t } = useApp();
  const [name, setName] = useState('');
  const [ward, setWard] = useState('');
  const [bed, setBed] = useState('');
  const [error, setError] = useState(false);

  const close = () => {
    setName('');
    setWard('');
    setBed('');
    setError(false);
    onClose();
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(true);
      document.getElementById('new-patient-name')?.focus();
      return;
    }
    onCreate({ name: name.trim(), ward: ward.trim(), bed: bed.trim() });
    close();
  };

  return (
    <Modal open={open} onClose={close} className="max-w-md">
      <form onSubmit={submit} className="space-y-4 p-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t.plans.newTitle}</h2>
        <Field label={t.editor.name}>
          <Input
            id="new-patient-name"
            autoFocus
            value={name}
            aria-invalid={error}
            aria-describedby={error ? 'new-patient-error' : undefined}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(false);
            }}
            className={error ? 'border-rose-400 focus:border-rose-500' : undefined}
          />
          {error && (
            <p id="new-patient-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {t.plans.nameRequired}
            </p>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.editor.ward}>
            <Input value={ward} onChange={(e) => setWard(e.target.value)} />
          </Field>
          <Field label={t.editor.bed}>
            <Input value={bed} onChange={(e) => setBed(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={close}>
            {t.app.cancel}
          </Button>
          <Button type="submit" variant="primary">
            {t.plans.create}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
