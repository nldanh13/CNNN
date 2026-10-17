import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { DATA_QUALITY, type MappingIssue } from '../lib/dataQuality';
import { Badge, Card, CardHeader, CodeBadge, PageHeader, Table, TBody, Td, Th, THead, Tr, Term } from '../ui';
import { cx } from '../lib/utils';

function Status({ ok }: { ok: boolean }) {
  return ok ? <CheckCircle2 className="h-4 w-4 text-success-500" /> : <AlertTriangle className="h-4 w-4 text-warning-500" />;
}

function Section({ title, count, hint, always, children }: { title: string; count: number; hint?: string; always?: boolean; children: ReactNode }) {
  const { t } = useApp();
  return (
    <Card className="overflow-hidden">
      <CardHeader
        icon={<Status ok={count === 0} />}
        title={title}
        subtitle={hint}
        actions={<Badge tone={count ? 'warning' : 'success'}>{count ? `${count} ${t.quality.issues}` : t.quality.ok}</Badge>}
      />
      {(count > 0 || always) && children}
    </Card>
  );
}

function IssueTable({ rows }: { rows: MappingIssue[] }) {
  const { t } = useApp();
  return (
    <Table>
      <THead>
        <Th>{t.library.code}</Th>
        <Th>{t.quality.referenceLabel}</Th>
        <Th>{t.nav.library}</Th>
      </THead>
      <TBody>
        {rows.map((r) => (
          <Tr key={r.code + r.mappingLabel}>
            <Td><CodeBadge system="nanda" code={r.code} /></Td>
            <Td className="text-fg-body"><Term code={r.code} en={r.mappingLabel}/></Td>
            <Td className="text-fg-muted">{r.taxonomyLabels.length?r.taxonomyLabels.map((name,j)=><span key={j}><Term code={r.code} en={name}/>{j<r.taxonomyLabels.length-1?' · ':''}</span>):'—'}</Td>
          </Tr>
        ))}
      </TBody>
    </Table>
  );
}

export function QualityPage() {
  const { t } = useApp();
  const q = DATA_QUALITY;
  const countIssues = q.counts.filter((c) => c.declared !== c.actual).length;

  return (
    <>
      <PageHeader
        title={t.quality.title}
        subtitle="Đối chiếu số lượng, mã trùng và liên kết giữa các danh mục."
        breadcrumb={<a href="#/references" className="text-xs font-medium text-fg-muted hover:text-fg">← {t.nav.referencesShort}</a>}
        actions={
          <Badge tone={q.issueCount ? 'warning' : 'success'} className="px-3 py-1 text-xs">
            {q.issueCount ? `${q.issueCount} ${t.quality.issues}` : t.quality.ok}
          </Badge>
        }
      />

      <div className="space-y-6">
        <Section title={t.quality.counts} count={countIssues} always>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
          {q.counts.map((c) => (
            <div key={c.system} className={cx('rounded-card border p-4', c.declared !== c.actual ? 'border-warning-300' : 'border-line')}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-fg">{c.system === 'nanda' ? 'NANDA-I' : c.system.toUpperCase()}</span>
                <Status ok={c.declared === c.actual} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-control bg-surface-muted py-2">
                  <dd className="text-lg font-semibold tabular-nums">{c.declared}</dd>
                  <dt className="text-[11px] text-fg-muted">{t.quality.declared}</dt>
                </div>
                <div className="rounded-control bg-surface-muted py-2">
                  <dd className="text-lg font-semibold tabular-nums">{c.actual}</dd>
                  <dt className="text-[11px] text-fg-muted">{t.quality.actual}</dt>
                </div>
              </dl>
            </div>
          ))}
        </div>
        </Section>

        <Section title={t.quality.dupCodes} count={q.duplicates.length} hint={t.quality.dupCodesHint}>
          <Table>
            <TBody>
              {q.duplicates.map((d) => (
                <Tr key={d.system + d.code}>
                  <Td className="w-24"><CodeBadge system={d.system} code={d.code} /></Td>
                  <Td>
                    <ul className="space-y-1">
                      {d.labels.map((l) => (
                        <li key={l} className="text-fg-body">
                          <Term code={null} en={l} showOriginal />
                        </li>
                      ))}
                    </ul>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Section>

        <Section title={t.quality.mappingMismatch} count={q.mappingMismatch.length}>
          <IssueTable rows={q.mappingMismatch} />
        </Section>

        <Section title={t.quality.mappingMissing} count={q.mappingMissing.length}>
          <IssueTable rows={q.mappingMissing} />
        </Section>

        <Section title={t.quality.retiredStillActive} count={q.retiredStillActive.length}>
          <IssueTable rows={q.retiredStillActive} />
        </Section>
      </div>
    </>
  );
}
