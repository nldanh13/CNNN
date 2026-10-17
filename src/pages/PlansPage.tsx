import { useMemo, useState, type FormEvent } from 'react';
import { ClipboardList, Copy, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { navigate } from '../store/router';
import { newPlan, nextPlanCode, planProgress } from '../lib/carePlan';
import { formatDate, matches, uid } from '../lib/utils';
import { Badge, Button, Card, CodeBadge, EmptyState, Field, IconButton, Input, Modal, ModalFooter, ModalHeader, PageHeader, ProgressBar, SearchInput, Table, TBody, Td, Th, THead, Tr } from '../ui';
import type { CarePlan } from '../types';
import { MAX_PATIENTS } from '../cloud/patientWorkspace';

export function PlansPage() {
  const { t, lang, plans, upsertPlan, planSyncMessage, retryStorage } = useApp();
  const [q, setQ] = useState('');

  const filtered = useMemo(
    () =>
      [...plans]
        .filter((p) => matches(q, p.patient.name, p.patient.mrn, p.code, p.patient.ward, p.patient.bed, p.nurse))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [plans, q],
  );

  const [adding, setAdding] = useState(false);
  const create = () => { if (plans.length < MAX_PATIENTS) setAdding(true); };

  return (
    <>
      <PageHeader
        title={t.plans.title}
        actions={
          <>
            <Button variant="primary" className="order-first w-full sm:w-auto lg:order-none" icon={<Plus className="h-4 w-4" />} onClick={create}
              disabled={plans.length >= MAX_PATIENTS}>
              {t.plans.newTitle}
            </Button>
          </>
        }
      />

      {planSyncMessage && <div role="status" className="mb-3 flex flex-wrap items-center gap-2 text-xs text-fg-muted">{planSyncMessage}{(planSyncMessage.includes('Không') || planSyncMessage.includes('thay đổi trên thiết bị khác') || planSyncMessage.includes('hết hạn')) && <button type="button" onClick={retryStorage} className="underline">Thử lưu lại</button>}</div>}
      <p className="mb-3 text-xs text-fg-muted">{plans.length}/{MAX_PATIENTS} người bệnh</p>
      <details className="mb-4 text-xs text-fg-muted">
        <summary className="inline-flex cursor-pointer items-center gap-1.5 hover:text-fg">
          <ShieldCheck className="h-3.5 w-3.5" /> Lưu trữ & quyền riêng tư
        </summary>
        <div className="mt-2 max-w-3xl rounded-control bg-surface-muted px-3 py-2 leading-relaxed">
          {t.backup.notice}
        </div>
      </details>

      <Card className="overflow-hidden">
        <div className="border-b border-line-soft p-4">
          <SearchInput value={q} onChange={setQ} placeholder={t.plans.searchPlaceholder} className="max-w-sm" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-5 w-5" />}
            title={plans.length ? t.app.noResults : t.plans.empty}
            action={
              !plans.length && plans.length < MAX_PATIENTS && (
                <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={create}>
                  {t.plans.newTitle}
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Điện thoại: mỗi kế hoạch là một thẻ */}
            <ul className="divide-y divide-line-soft sm:hidden">
              {filtered.map((p) => {
                const prog = planProgress(p);
                return (
                  <li key={p.id} className="flex items-center gap-3 px-4 py-3.5">
                    <a href={`#/plans/${p.id}`} className="min-w-0 flex-1">
                      <p className="truncate font-medium text-fg">{p.patient.name || t.plans.untitled}</p>
                      <p className="mt-0.5 truncate text-xs text-fg-muted">
                        <span className="font-mono">{p.code}</span>
                        {[p.patient.ward, p.patient.bed].filter(Boolean).length > 0 && <> · {[p.patient.ward, p.patient.bed].filter(Boolean).join(' · ')}</>}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-24"><ProgressBar value={prog.ratio} /></div>
                        <span className="text-xs tabular-nums text-fg-muted">{prog.met}/{prog.total} {t.plans.colProgress.toLowerCase()}</span>
                      </div>
                    </a>
                    <RowActions plan={p} />
                  </li>
                );
              })}
            </ul>

            {/* Máy tính: bảng */}
            <div className="hidden sm:block">
              <Table>
                <THead>
                  <Th>{t.plans.colPatient}</Th>
                  <Th className="hidden md:table-cell">{t.plans.colWard}</Th>
                  <Th className="hidden lg:table-cell">{t.plans.colProblems}</Th>
                  <Th>{t.plans.colProgress}</Th>
                  <Th>{t.plans.colUpdated}</Th>
                  <Th className="w-20" />
                </THead>
                <TBody>
                  {filtered.map((p) => {
                    const prog = planProgress(p);
                    return (
                      <Tr key={p.id} interactive onClick={() => navigate(`/plans/${p.id}`)}>
                        <Td>
                          <div className="font-medium text-fg">{p.patient.name || t.plans.untitled}</div>
                          <div className="mt-0.5 text-xs text-fg-muted">
                            <span className="font-mono">{p.code}</span>
                            {p.patient.mrn && <> · {p.patient.mrn}</>}
                            {p.patient.age != null && <> · {p.patient.age} {lang === 'vi' ? 'tuổi' : 'y'}</>}
                          </div>
                        </Td>
                        <Td className="hidden text-fg-body md:table-cell">
                          {[p.patient.ward, p.patient.bed].filter(Boolean).join(' · ') || '—'}
                        </Td>
                        <Td className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {p.entries.slice(0, 4).map((e) => (
                              <CodeBadge key={e.id} system="nanda" code={e.nanda.code} />
                            ))}
                            {p.entries.length > 4 && <Badge>+{p.entries.length - 4}</Badge>}
                            {p.entries.length === 0 && <span className="text-fg-subtle">—</span>}
                          </div>
                        </Td>
                        <Td>
                          <div className="w-28">
                            <div className="mb-1 text-xs tabular-nums text-fg-muted">
                              {prog.met}/{prog.total}
                            </div>
                            <ProgressBar value={prog.ratio} />
                          </div>
                        </Td>
                        <Td className="text-xs text-fg-muted">{formatDate(p.updatedAt, lang, true)}</Td>
                        <Td onClick={(e) => e.stopPropagation()}>
                          <RowActions plan={p} />
                        </Td>
                      </Tr>
                    );
                  })}
                </TBody>
              </Table>
            </div>
          </>
        )}
      </Card>

      <NewPatientDialog
        open={adding && plans.length < MAX_PATIENTS}
        onClose={() => setAdding(false)}
        onCreate={(patient) => {
          if (plans.length >= MAX_PATIENTS) return;
          const plan = newPlan(plans);
          upsertPlan({ ...plan, patient: { ...plan.patient, ...patient } });
          navigate(`/plans/${plan.id}`);
        }}
      />
    </>
  );
}

/** Nhân bản hoặc xóa một kế hoạch. */
function RowActions({ plan: p }: { plan: CarePlan }) {
  const { t, plans, upsertPlan, deletePlan, toast } = useApp();
  return (
    <div className="flex justify-end gap-0.5">
      <IconButton
        label={t.plans.duplicate}
        disabled={plans.length >= MAX_PATIENTS}
        onClick={() => {
          if (plans.length >= MAX_PATIENTS) return;
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
          deletePlan(p.id);
          toast(t.plans.deleted, 'success', { label: t.app.undo, run: () => upsertPlan(p) });
        }}
      >
        <Trash2 className="h-4 w-4" />
      </IconButton>
    </div>
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
      <form onSubmit={submit}>
        <ModalHeader title={t.plans.newTitle} subtitle="Chỉ cần tên; các thông tin khác bổ sung sau." onClose={close} />
        <div className="space-y-4 p-5">
          <Field label={t.editor.name} error={error ? t.plans.nameRequired : undefined}>
            <Input
              id="new-patient-name"
              autoFocus
              value={name}
              aria-invalid={error}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(false);
              }}
              className={error ? 'border-danger-400 focus:border-danger-500' : undefined}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.editor.ward}>
              <Input value={ward} onChange={(e) => setWard(e.target.value)} />
            </Field>
            <Field label={t.editor.bed}>
              <Input value={bed} onChange={(e) => setBed(e.target.value)} />
            </Field>
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={close}>
            {t.app.cancel}
          </Button>
          <Button type="submit" variant="primary">
            {t.plans.create}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
