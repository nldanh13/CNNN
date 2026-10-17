import { AlertTriangle, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { EDITION_AUDIT } from '../data/editionAudit';
import { CATALOG_QUALITY_SUMMARY } from '../data/catalogProvenance';
import { editionLabel } from '../data/taxonomy';
import { Badge, Card, CardHeader, PageHeader, Stat, SYSTEM_DOT } from '../ui';
import { cx } from '../lib/utils';

const TITLES={nanda:'Chẩn đoán NANDA-I',noc:'Kết quả NOC',nic:'Can thiệp NIC'} as const;

export function ReferencesPage() {
  const {t,lang}=useApp();
  const anyOlder=EDITION_AUDIT.some(r=>r.status==='older');
  return <>
    <PageHeader title={t.references.title} />

    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      {EDITION_AUDIT.map(row=><Stat key={row.system}
        label={<span className="inline-flex items-center gap-1.5"><span className={cx('h-2 w-2 rounded-full',SYSTEM_DOT[row.system])}/>{TITLES[row.system]}</span>}
        value={`${row.installedCount} mã`}
        hint={editionLabel(row.installedEdition,lang)}/>)}
    </div>

    <div className="grid gap-6">
      <Card>
        <CardHeader title="Tình trạng thẩm định bản dịch" subtitle="Metadata lấy trực tiếp từ bộ danh mục NNN đang sử dụng, không phải đánh giá lâm sàng độc lập." />
        <ul className="divide-y divide-line-soft text-sm">
          {CATALOG_QUALITY_SUMMARY.map(row => <li key={row.system} className="flex flex-wrap items-center gap-3 px-5 py-3">
            <strong className="w-20 text-fg">{row.system === 'nanda' ? 'NANDA-I' : row.system.toUpperCase()}</strong>
            <span className="min-w-0 flex-1 text-xs text-fg-muted">{row.unreviewed}/{row.count} nhãn chưa thẩm định{row.unknown ? ` · ${row.unknown} thiếu trạng thái` : ''}</span>
            <Badge tone={row.unreviewed || row.unknown ? 'warning' : 'success'}>{row.unreviewed || row.unknown ? 'Cần kiểm duyệt' : 'Đã có trạng thái'}</Badge>
          </li>)}
        </ul>
        <p className="border-t border-line-soft px-5 py-3 text-xs leading-relaxed text-fg-muted">
          Các nhãn chưa thẩm định không được coi là bản dịch chính thức. NOC ấn bản 6 vẫn được giữ để tránh làm sai kế hoạch đã lưu; nâng cấp mã/ấn bản cần nguồn được cấp phép và đối chiếu riêng.
        </p>
      </Card>
      <Card>
        <CardHeader title={t.references.editions}
          icon={anyOlder?<AlertTriangle className="h-4 w-4"/>:<CheckCircle2 className="h-4 w-4"/>}/>
        <ul className="divide-y divide-line-soft text-sm">
          {EDITION_AUDIT.map(row=><li key={row.system} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <strong className="w-20 whitespace-nowrap text-fg">{row.name}</strong>
            <span className="min-w-0 flex-1 text-xs text-fg-muted">
              {editionLabel(row.installedEdition,lang)} · {row.installedCount} mục
              {' · '}{row.status==='older'?'Ấn bản mới nhất: ':'Ấn bản hiện hành: '}{row.latestEdition}
            </span>
            <Badge tone={row.status==='older'?'warning':'success'}>
              {row.status==='older'?'Cần cập nhật':'Đã đối chiếu'}
            </Badge>
          </li>)}
        </ul>
      </Card>
    </div>

    <a href="#/quality" className="group mt-6 block">
      <Card className="flex items-center gap-3 p-4 transition group-hover:border-primary-300 dark:group-hover:border-primary-700">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300"><ShieldCheck className="h-5 w-5"/></span>
        <span className="min-w-0 flex-1">
          <strong className="text-sm text-fg">{t.nav.quality}</strong>

        </span>
        <ChevronRight className="h-5 w-5 text-fg-subtle"/>
      </Card>
    </a>
  </>;
}
