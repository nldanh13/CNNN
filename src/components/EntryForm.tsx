import { useEffect, useState, type ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CareEntry } from '../types';
import { NOC_SCALES } from '../data/reference';
import { nandaDomain, nocDomain } from '../data/taxonomy';
import { dataHub } from '../data/dataHub';
import { useApp } from '../store/AppContext';
import { signed, uid } from '../lib/utils';
import { Button, CodeBadge, Drawer, Field, IconButton, Input, Select, TagInput, Term, Textarea } from '../ui';
import { TaxonomyPicker } from './TaxonomyPicker';
import { LikertInput, scaleLabel } from './Likert';
import { resetEntryForDiagnosisChange, resetNocOnChange, validateCareEntry } from '../lib/carePlanSafety';
import { CodeExplanationPanel } from './CodeExplanationPanel';
import { RETIRED_NIC7 } from '../data/nicMigration';

function Section({ step, title, color, children }: { step: number; title: string; color: string; children: ReactNode }) {
  return (
    <section className="relative pl-10">
      <span className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white ${color}`}>{step}</span>
      <h3 className="mb-4 pt-1 text-[15px] font-semibold text-fg">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function EntryForm({
  open,
  initial,
  isNew,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: CareEntry;
  isNew: boolean;
  onClose: () => void;
  onSave: (e: CareEntry) => void;
}) {
  const { t, lang, toast } = useApp();
  const [entry, setEntry] = useState<CareEntry>(initial);
  useEffect(() => setEntry(initial), [initial]);

  const set = (patch: Partial<CareEntry>) => setEntry((e) => ({ ...e, ...patch }));
  const setNoc = (patch: Partial<CareEntry['noc']>) => setEntry((e) => ({ ...e, noc: { ...e.noc, ...patch } }));

  const nandaItem = entry.nanda.code ? dataHub.getTerm('nanda', entry.nanda.code, entry.nanda.label) : undefined;
  const nocItem = entry.noc.code ? dataHub.getTerm('noc', entry.noc.code) : undefined;
  const scale = NOC_SCALES.find((s) => s.code === entry.noc.scaleCode);

  const save = () => {
    const issues = validateCareEntry(entry, lang);
    if (issues.length) { toast(issues[0], 'error'); return; }
    onSave(entry);
  };
  const chooseNanda = (item: { code: string; label: string }) => {
    if (entry.nanda.code === item.code && entry.nanda.label === item.label) return;
    const hasData = Boolean(entry.nanda.code || entry.noc.code || entry.nic.length ||
      entry.definingCharacteristics.length || entry.relatedFactors.length || entry.notes);
    if (hasData && !window.confirm(t.entryForm.confirmChangeDiagnosis)) return;
    setEntry((current) => resetEntryForDiagnosisChange(current, item));
  };
  const chooseNoc = (item: { code: string; label: string }) => {
    if (entry.noc.code === item.code && entry.noc.label === item.label) return;
    if (entry.noc.code && !window.confirm(t.entryForm.confirmChangeOutcome)) return;
    setEntry((current) => ({ ...current, noc: resetNocOnChange(current.noc, item) }));
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isNew ? t.entryForm.titleNew : t.entryForm.titleEdit}
      subtitle="NANDA-I → NOC → NIC"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t.app.cancel}
          </Button>
          <Button variant="primary" onClick={save}>
            {t.app.save}
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        <Section step={1} title={t.entryForm.step1} color="bg-nanda-500">
          <TaxonomyPicker
            system="nanda"
            value={entry.nanda}
            placeholder={t.entryForm.pickNanda}
            onPick={chooseNanda}
          />
          {entry.nanda.code && <CodeExplanationPanel system="nanda" code={entry.nanda.code} label={entry.nanda.label} compact />}
          {nandaItem && (
            <p className="text-xs text-fg-muted">
              {t.library.domain} {nandaItem.domainNumber}: {lang === 'vi' ? nandaDomain(nandaItem.domainNumber)?.nameVi : nandaDomain(nandaItem.domainNumber)?.nameEn} ·{' '}
              {t.library.class} {nandaItem.classNumber}: <Term code={null} en={nandaItem.className} showOriginal={false} />
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.editor.definingChars}>
              <TagInput
                values={entry.definingCharacteristics}
                onChange={(v) => set({ definingCharacteristics: v })}
                placeholder={t.entryForm.definingCharsHint}
              />
            </Field>
            <Field label={t.editor.relatedFactors}>
              <TagInput values={entry.relatedFactors} onChange={(v) => set({ relatedFactors: v })} placeholder={t.entryForm.relatedFactorsHint} />
            </Field>
          </div>
        </Section>

        <Section step={2} title={t.entryForm.step2} color="bg-noc-500">
          <TaxonomyPicker system="noc" value={entry.noc} placeholder={t.entryForm.pickNoc} onPick={chooseNoc} />
          {entry.noc.code && <CodeExplanationPanel system="noc" code={entry.noc.code} label={entry.noc.label} compact />}
          {nocItem && (
            <p className="text-xs text-fg-muted">
              {t.library.domain} {nocDomain(nocItem.domainId)?.roman}: {lang === 'vi' ? nocDomain(nocItem.domainId)?.nameVi : nocDomain(nocItem.domainId)?.nameEn} ·{' '}
              {t.library.class} {nocItem.classLetter}: <Term code={null} en={nocItem.className} showOriginal={false} />
            </p>
          )}
          <Field label={t.editor.scale}>
            <Select value={entry.noc.scaleCode} onChange={(e) => setNoc({ scaleCode: e.target.value, current: null, indicators: entry.noc.indicators.map((i) => ({ ...i, score: null })) })}>
              <option value="">{t.entryForm.selectScale}</option>
              {NOC_SCALES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} · {lang === 'vi' ? s.meaningVi : s.meaningEn}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 rounded-card border border-line p-4 sm:grid-cols-3">
            {(
              [
                ['baseline', t.editor.baseline, 'neutral'],
                ['target', t.editor.target, 'success'],
                ['current', t.editor.current, 'info'],
              ] as const
            ).map(([key, label, tone]) => (
              <div key={key}>
                <p className="mb-1.5 text-xs font-medium text-fg-body">{label}</p>
                {key === 'current' ? (
                  <p className="py-1 text-sm font-semibold">{entry.noc.current ?? '—'} <span className="text-xs font-normal text-fg-muted">{t.entryForm.assessInPlan}</span></p>
                ) : (
                  <LikertInput value={entry.noc[key]} tone={tone} scaleCode={entry.noc.scaleCode}
                    onChange={(v) => setNoc({ [key]: v ?? 1 } as Partial<CareEntry['noc']>)} />
                )}
                <p className="mt-1 h-4 truncate text-[11px] text-fg-subtle">{scaleLabel(entry.noc.scaleCode, entry.noc[key], lang)}</p>
              </div>
            ))}
            {entry.noc.current != null && (
              <p className="text-xs text-fg-muted sm:col-span-3">
                {t.editor.change}: <strong className="font-semibold text-fg-body">{signed(entry.noc.current - entry.noc.baseline)}</strong>
                {scale && <span className="ml-2 text-fg-subtle">({lang === 'vi' ? scale.meaningVi : scale.meaningEn})</span>}
              </p>
            )}
          </div>

          <Field label={t.editor.indicators}>
            <div className="space-y-2">
              {entry.noc.indicators.map((ind, i) => (
                <div key={ind.id} className="flex flex-wrap items-center gap-2 rounded-control bg-surface-muted p-2">
                  <Input
                    value={ind.code}
                    placeholder={t.entryForm.indicatorCode}
                    className="w-28 font-mono"
                    onChange={(e) => setNoc({ indicators: entry.noc.indicators.map((x, j) => (j === i ? { ...x, code: e.target.value } : x)) })}
                  />
                  <Input
                    value={ind.name}
                    placeholder={t.entryForm.indicatorName}
                    className="min-w-[10rem] flex-1"
                    onChange={(e) => setNoc({ indicators: entry.noc.indicators.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })}
                  />
                  <Select value={ind.scaleCode ?? ''} className="max-w-[11rem]"
                    onChange={(e) => setNoc({ indicators: entry.noc.indicators.map((x, j) => (j === i ? { ...x, scaleCode: e.target.value || undefined, score: null } : x)) })}>
                    <option value="">{t.entryForm.inheritScale}</option>
                    {NOC_SCALES.map((s) => <option key={s.code} value={s.code}>{s.code} · {lang === 'vi' ? s.meaningVi : s.meaningEn}</option>)}
                  </Select>
                  <Input className="w-28" placeholder={t.entryForm.sourcePage} value={ind.sourcePage ?? ''}
                    onChange={(e) => setNoc({ indicators: entry.noc.indicators.map((x, j) => (j === i ? { ...x, sourcePage: e.target.value } : x)) })} />
                  <span className="text-xs text-fg-muted">{ind.score ?? '—'}</span>
                  <IconButton label={t.app.delete} tone="danger" onClick={() => setNoc({ indicators: entry.noc.indicators.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              ))}
              <Button
                size="sm"
                variant="ghost"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() =>
                  setNoc({ indicators: [...entry.noc.indicators, { id: uid('ind'), code: '', name: '', score: null }] })
                }
              >
                {t.entryForm.addIndicator}
              </Button>
            </div>
          </Field>
        </Section>

        <Section step={3} title={t.entryForm.step3} color="bg-nic-500">
          <div className="space-y-3">
            {entry.nic.map((n, i) => (
              <div key={n.code} className="rounded-card border border-line p-3">
                <div className="mb-3 flex items-start gap-3">
                  <CodeBadge system="nic" code={n.code} className="mt-0.5" />
                  <span className="min-w-0 flex-1"><Term code={n.code} en={n.label} className="block text-sm font-medium text-fg" />
                    {RETIRED_NIC7[n.code]
                      ? <p className="mt-1 text-xs font-medium text-warning-700 dark:text-warning-300">
                          Mã NIC 7 đã ngừng dùng trong NIC 8. Đây là dữ liệu của kế hoạch cũ;
                          hãy đối chiếu và chọn can thiệp NIC 8 phù hợp trước khi tiếp tục điều trị.
                        </p>
                      : <CodeExplanationPanel system="nic" code={n.code} label={n.label} compact />}</span>
                  <IconButton label={t.app.delete} tone="danger" onClick={() => set({ nic: entry.nic.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
                <TagInput
                  values={n.activities}
                  placeholder={t.entryForm.addActivity}
                  onChange={(v) => set({ nic: entry.nic.map((x, j) => (j === i ? { ...x, activities: v } : x)) })}
                />
              </div>
            ))}
          </div>
          <TaxonomyPicker
            system="nic"
            placeholder={t.entryForm.pickNic}
            exclude={entry.nic.map((n) => n.code)}
            onPick={(item) => {
              if (entry.nic.some((n) => n.code === item.code)) return;
              set({ nic: [...entry.nic, { ...item, activities: [] }] });
            }}
            trigger={(openPicker) => (
              <Button icon={<Plus className="h-4 w-4" />} onClick={openPicker}>
                {t.entryForm.pickNic}
              </Button>
            )}
          />
        </Section>

        <Field label={t.editor.notes}>
          <Textarea value={entry.notes} onChange={(e) => set({ notes: e.target.value })} />
        </Field>
      </div>
    </Drawer>
  );
}
