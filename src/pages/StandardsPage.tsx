import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { NOC_NIC_DOMAIN_MAP, NOC_SCALES } from '../data/reference';
import { editionLabel, NANDA_DOMAINS, NANDA_EDITION, NANDA_ITEMS, NIC_EDITION, NIC_ITEMS, NOC_DOMAINS, NOC_EDITION, NOC_ITEMS } from '../data/taxonomy';
import { cx } from '../lib/utils';
import { Card, CardHeader, Eyebrow, PageHeader, SectionTitle, SYSTEM_DOT, SYSTEM_TEXT, Table, TBody, Td, Th, THead, Tr } from '../ui';
import { LikertInput } from '../components/Likert';
import { NnnReasoningWorkflow } from '../components/NnnReasoningWorkflow';

export function StandardsPage() {
  const { t, lang } = useApp();
  const [scaleCode, setScaleCode] = useState('01');
  const [score, setScore] = useState<number | null>(4);
  const scale = NOC_SCALES.find((s) => s.code === scaleCode) ?? NOC_SCALES[0];

  const nandaClasses = new Set(NANDA_ITEMS.map((i) => i.classKey + i.domainId)).size;
  const nocClasses = new Set(NOC_ITEMS.map((i) => i.classKey)).size;

  const schema = [
    {
      name: 'NANDA-I',
      edition: editionLabel(NANDA_EDITION, lang),
      bar: SYSTEM_DOT.nanda,
      text: SYSTEM_TEXT.nanda,
      stats: `${NANDA_DOMAINS.length} ${lang === 'vi' ? 'lĩnh vực' : 'domains'} · ${nandaClasses} ${lang === 'vi' ? 'phân lớp' : 'classes'} · ${NANDA_ITEMS.length} ${lang === 'vi' ? 'chẩn đoán' : 'diagnoses'}`,
      desc: t.standards.nandaSchema,
      example: [
        ['00312', lang === 'vi' ? 'Tổn thương do tỳ đè ở người lớn' : 'Adult pressure injury'],
        ['00132', lang === 'vi' ? 'Đau cấp tính' : 'Acute pain'],
      ],
    },
    {
      name: 'NOC',
      edition: editionLabel(NOC_EDITION, lang),
      bar: SYSTEM_DOT.noc,
      text: SYSTEM_TEXT.noc,
      stats: `${NOC_DOMAINS.length} ${lang === 'vi' ? 'lĩnh vực' : 'domains'} · ${nocClasses} ${lang === 'vi' ? 'lớp' : 'classes'} · ${NOC_ITEMS.length} ${lang === 'vi' ? 'kết quả' : 'outcomes'}`,
      desc: t.standards.nocSchema,
      example: [
        ['2102', lang === 'vi' ? 'Mức độ đau' : 'Pain Level'],
        ['210201', lang === 'vi' ? 'Chỉ số 01 của 2102' : 'Indicator 01 of 2102'],
      ],
    },
    {
      name: 'NIC',
      edition: editionLabel(NIC_EDITION, lang),
      bar: SYSTEM_DOT.nic,
      text: SYSTEM_TEXT.nic,
      stats: `${NIC_ITEMS.length} can thiệp điều dưỡng`,
      desc: t.standards.nicSchema,
      example: [['3330', 'Hỗ trợ thay đổi tư thế: nằm sấp']],
    },
  ];

  return (
    <>
      <PageHeader title="Hướng dẫn chẩn đoán" />
      <div className="mb-8"><NnnReasoningWorkflow /></div>

      <SectionTitle>{t.standards.schema}</SectionTitle>
      <div className="grid gap-4 md:grid-cols-3">
        {schema.map((s) => (
          <Card key={s.name} className="relative overflow-hidden p-5">
            <span className={cx('absolute inset-x-0 top-0 h-1', s.bar)} />
            <div className="flex items-baseline justify-between">
              <h3 className={cx('text-sm font-semibold', s.text)}>{s.name}</h3>
              <span className="text-[11px] text-fg-subtle">{s.edition}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-fg">{s.stats}</p>
            <p className="mt-2 text-xs leading-relaxed text-fg-muted">{s.desc}</p>
            <div className="mt-3 space-y-1 rounded-control bg-surface-muted p-3 font-mono text-xs">
              {s.example.map(([code, label]) => (
                <p key={code}>
                  <strong className="text-fg">{code}</strong> <span className="text-fg-subtle">→</span> <span className="font-sans text-fg-body">{label}</span>
                </p>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Card className="overflow-hidden">
          <CardHeader title={t.standards.scales} subtitle={t.standards.scalesHint} />
          <Table>
            <THead>
              <Th>#</Th>
              <Th>{lang === 'vi' ? 'Ý nghĩa' : 'Measures'}</Th>
              {[1, 2, 3, 4, 5].map((n) => (
                <Th key={n} className="text-center font-mono">{n}</Th>
              ))}
            </THead>
            <TBody>
              {NOC_SCALES.map((s) => (
                <Tr key={s.code} interactive onClick={() => setScaleCode(s.code)} className={cx(s.code === scaleCode && 'bg-primary-50 hover:bg-primary-50 dark:bg-primary-500/10')}>
                  <Td className="font-mono text-xs font-semibold text-fg-muted">{s.code}</Td>
                  <Td className="font-medium text-fg">{lang === 'vi' ? s.meaningVi : s.meaningEn}</Td>
                  {(lang === 'vi' ? s.pointsVi : s.points).map((p, i) => (
                    <Td key={i} className="px-2 text-center text-[11px] text-fg-muted">{p}</Td>
                  ))}
                </Tr>
              ))}
            </TBody>
          </Table>
        </Card>

        <Card className="self-start p-5 xl:sticky xl:top-20">
          <Eyebrow className="mb-0">{t.standards.simulator}</Eyebrow>
          <p className="mt-2 text-sm font-medium text-fg">
            {scale.code} · {lang === 'vi' ? scale.meaningVi : scale.meaningEn}
          </p>
          <div className="mt-4">
            <LikertInput value={score} onChange={setScore} scaleCode={scale.code} />
          </div>
          <div className="mt-4 h-2 rounded-full bg-gradient-to-r from-danger-400 via-warning-300 to-success-400">
            {score != null && (
              <div className="relative h-full">
                <span className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-surface bg-fg shadow" style={{ left: `${((score - 1) / 4) * 100}%` }} />
              </div>
            )}
          </div>
          <p className="mt-4 rounded-control bg-surface-muted p-3 text-center text-sm font-semibold text-fg">
            {score != null ? `${score} = ${(lang === 'vi' ? scale.pointsVi : scale.points)[score - 1]}` : '—'}
          </p>
        </Card>
      </div>

      <Card className="mt-8 overflow-hidden">
        <CardHeader title={t.standards.domainMap} />
        <Table>
          <THead>
            <Th>{t.standards.colNum}</Th>
            <Th><span className={cx('mr-1.5 inline-block h-1.5 w-1.5 rounded-full', SYSTEM_DOT.noc)} />{t.standards.colNoc}</Th>
            <Th><span className={cx('mr-1.5 inline-block h-1.5 w-1.5 rounded-full', SYSTEM_DOT.nic)} />{t.standards.colNic}</Th>
          </THead>
          <TBody>
            {NOC_NIC_DOMAIN_MAP.map((r) => (
              <Tr key={r.num}>
                <Td className="whitespace-nowrap font-mono text-xs font-semibold text-fg-muted">{r.num}</Td>
                <Td>
                  <p className="font-medium text-fg">{lang === 'vi' ? r.nocDomainVi : r.nocDomain}</p>
                  <p className="mt-0.5 text-xs text-fg-muted">{lang === 'vi' ? r.nocClassesVi : r.nocClasses}</p>
                </Td>
                <Td>
                  <p className="font-medium text-fg">{lang === 'vi' ? r.nicDomainVi : r.nicDomain}</p>
                  <p className="mt-0.5 text-xs text-fg-muted">{lang === 'vi' ? r.nicDescVi : r.nicDescEn}</p>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
