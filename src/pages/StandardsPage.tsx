import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { NOC_NIC_DOMAIN_MAP, NOC_SCALES } from '../data/reference';
import { editionLabel, NANDA_DOMAINS, NANDA_EDITION, NANDA_ITEMS, NIC_EDITION, NIC_ITEMS, NOC_DOMAINS, NOC_EDITION, NOC_ITEMS } from '../data/taxonomy';
import { cx } from '../lib/utils';
import { Card, CardHeader, PageHeader } from '../components/ui';
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
      bar: 'bg-rose-500',
      text: 'text-rose-700 dark:text-rose-300',
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
      bar: 'bg-sky-500',
      text: 'text-sky-700 dark:text-sky-300',
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
      bar: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300',
      stats: `${NIC_ITEMS.length} can thiệp trong danh mục NIC 8 (bản dịch đang rà soát)`,
      desc: t.standards.nicSchema,
      example: [['3330', 'Hỗ trợ thay đổi tư thế: nằm sấp']],
    },
  ];

  return (
    <>
      <PageHeader title={t.standards.title} />
      <NnnReasoningWorkflow />

      <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">{t.standards.schema}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {schema.map((s) => (
          <Card key={s.name} className="relative overflow-hidden p-5">
            <span className={cx('absolute inset-x-0 top-0 h-0.5', s.bar)} />
            <div className="flex items-baseline justify-between">
              <h3 className={cx('text-sm font-semibold', s.text)}>{s.name}</h3>
              <span className="text-[11px] text-slate-400">{s.edition}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">{s.stats}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{s.desc}</p>
            <div className="mt-3 space-y-1 rounded-lg bg-slate-50 p-3 font-mono text-xs dark:bg-slate-800/60">
              {s.example.map(([code, label]) => (
                <p key={code}>
                  <strong className="text-slate-900 dark:text-white">{code}</strong> <span className="text-slate-400">→</span> <span className="font-sans text-slate-600 dark:text-slate-300">{label}</span>
                </p>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Card className="overflow-hidden">
          <CardHeader title={t.standards.scales} subtitle={t.standards.scalesHint} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500 dark:border-slate-800">
                  <th className="px-5 py-2.5 font-medium">#</th>
                  <th className="px-3 py-2.5 font-medium">{lang === 'vi' ? 'Ý nghĩa' : 'Measures'}</th>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <th key={n} className="px-2 py-2.5 text-center font-mono font-medium">
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {NOC_SCALES.map((s) => (
                  <tr
                    key={s.code}
                    onClick={() => setScaleCode(s.code)}
                    className={cx('cursor-pointer transition', s.code === scaleCode ? 'bg-brand-50/70 dark:bg-brand-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40')}
                  >
                    <td className="px-5 py-2.5 font-mono text-xs font-semibold text-slate-500">{s.code}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200">{lang === 'vi' ? s.meaningVi : s.meaningEn}</td>
                    {(lang === 'vi' ? s.pointsVi : s.points).map((p, i) => (
                      <td key={i} className="px-2 py-2.5 text-center text-[11px] text-slate-500">
                        {p}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="self-start p-5 xl:sticky xl:top-20">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.standards.simulator}</p>
          <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
            {scale.code} · {lang === 'vi' ? scale.meaningVi : scale.meaningEn}
          </p>
          <div className="mt-4">
            <LikertInput value={score} onChange={setScore} scaleCode={scale.code} />
          </div>
          <div className="mt-4 h-2 rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400">
            {score != null && (
              <div className="relative h-full">
                <span className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-slate-900 shadow dark:border-slate-900 dark:bg-white" style={{ left: `${((score - 1) / 4) * 100}%` }} />
              </div>
            )}
          </div>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-center text-sm font-semibold text-slate-800 dark:bg-slate-800/60 dark:text-slate-100">
            {score != null ? `${score} = ${(lang === 'vi' ? scale.pointsVi : scale.points)[score - 1]}` : '—'}
          </p>
        </Card>
      </div>

      <Card className="mt-8 overflow-hidden">
        <CardHeader title={t.standards.domainMap} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-500 dark:border-slate-800">
                <th className="px-5 py-2.5 font-medium">{t.standards.colNum}</th>
                <th className="px-3 py-2.5 font-medium">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-sky-500" />
                  {t.standards.colNoc}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t.standards.colNic}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {NOC_NIC_DOMAIN_MAP.map((r) => (
                <tr key={r.num} className="align-top">
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs font-semibold text-slate-500">{r.num}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900 dark:text-white">{lang === 'vi' ? r.nocDomainVi : r.nocDomain}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{lang === 'vi' ? r.nocClassesVi : r.nocClasses}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900 dark:text-white">{lang === 'vi' ? r.nicDomainVi : r.nicDomain}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{lang === 'vi' ? r.nicDescVi : r.nicDescEn}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
