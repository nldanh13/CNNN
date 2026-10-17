import { AlertTriangle, CheckCircle2, ChevronRight, ShieldCheck, Database } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { EDITION_AUDIT } from '../data/editionAudit';
import { SHARED_CATALOG } from '../data/sharedCatalog';
import { editionLabel } from '../data/taxonomy';
import { Alert, Badge, Card, CardBody, CardHeader, PageHeader, Stat, SYSTEM_DOT } from '../ui';
import { cx } from '../lib/utils';

const TITLES={nanda:'Chẩn đoán NANDA-I',noc:'Kết quả NOC',nic:'Can thiệp NIC'} as const;

export function ReferencesPage() {
  const {t,lang}=useApp();
  const anyOlder=EDITION_AUDIT.some(r=>r.status==='older');
  return <>
    <PageHeader title={t.references.title}
      subtitle="Thông tin danh mục và bản dịch tiếng Việt; không có chức năng đọc hoặc nhập sách nguyên bản."/>

    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      {EDITION_AUDIT.map(row=><Stat key={row.system}
        label={<span className="inline-flex items-center gap-1.5"><span className={cx('h-2 w-2 rounded-full',SYSTEM_DOT[row.system])}/>{TITLES[row.system]}</span>}
        value={`${row.installedCount} mã`}
        hint={editionLabel(row.installedEdition,lang)}/>)}
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Kho dữ liệu chung" icon={<Database className="h-4 w-4"/>} subtitle={`Phiên bản dữ liệu: ${SHARED_CATALOG.revision}`}/>
        <CardBody className="space-y-3 text-sm text-fg-body">
          <p>Dữ liệu dùng chung cho Thư viện và Kế hoạch chăm sóc, chỉ bao gồm thuật ngữ và mã đã có trong danh mục.</p>
          <Alert tone="warning" size="sm">NIC 8 có 554 tên kế thừa NIC 7 và 60 tên dịch mới. Các bản dịch cần chuyên gia rà soát trước khi dùng làm chuẩn lâm sàng.</Alert>
        </CardBody>
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
          <span className="mt-0.5 block text-xs text-fg-muted">Kiểm tra số lượng, mã trùng và tính nhất quán giữa các danh mục.</span>
        </span>
        <ChevronRight className="h-5 w-5 text-fg-subtle"/>
      </Card>
    </a>
  </>;
}
