import { AlertTriangle, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { EDITION_AUDIT } from '../data/editionAudit';
import { SHARED_CATALOG } from '../data/sharedCatalog';
import { editionLabel } from '../data/taxonomy';
import { Badge, Card, CardHeader, PageHeader, SYSTEM_DOT } from '../components/ui';

const TITLES={nanda:'Chẩn đoán NANDA-I',noc:'Kết quả NOC',nic:'Can thiệp NIC'} as const;

export function ReferencesPage() {
  const {t,lang}=useApp();
  const anyOlder=EDITION_AUDIT.some(r=>r.status==='older');
  return <>
    <PageHeader title={t.references.title}
      subtitle="Thông tin danh mục và bản dịch tiếng Việt; không có chức năng đọc hoặc nhập sách nguyên bản."/>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Kho dữ liệu chung" icon={<Database className="h-4 w-4"/>}/>
        <div className="space-y-3 p-5 text-sm">
          <p>Dữ liệu dùng chung cho Thư viện và Kế hoạch chăm sóc, chỉ bao gồm thuật ngữ và mã đã có trong danh mục.</p>
          <p className="text-xs text-slate-500">Phiên bản dữ liệu: <strong>{SHARED_CATALOG.revision}</strong></p>
          <ul className="space-y-2">
            {EDITION_AUDIT.map(row=><li key={row.system} className="flex items-center gap-2">
              <span className={'h-2 w-2 shrink-0 rounded-full '+SYSTEM_DOT[row.system]}/>
              <span className="flex-1">{TITLES[row.system]}</span>
              <strong>{row.installedCount} mã</strong>
            </li>)}
          </ul>
          <p className="text-xs text-amber-700 dark:text-amber-300">NIC 8 có 554 tên kế thừa NIC 7 và 60 tên dịch mới. Các bản dịch cần chuyên gia rà soát trước khi dùng làm chuẩn lâm sàng.</p>
        </div>
      </Card>
      <Card>
        <CardHeader title={t.references.editions}
          icon={anyOlder?<AlertTriangle className="h-4 w-4 text-amber-500"/>:<CheckCircle2 className="h-4 w-4 text-emerald-500"/>}/>
        <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {EDITION_AUDIT.map(row=><li key={row.system} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <strong className="w-16">{row.name}</strong>
            <span className="min-w-0 flex-1 text-xs text-slate-500">
              {editionLabel(row.installedEdition,lang)} · {row.installedCount} mục
              {' · '}{row.status==='older'?'Ấn bản mới nhất: ':'Ấn bản hiện hành: '}{row.latestEdition}
            </span>
            <Badge tone={row.status==='older'?'amber':'emerald'}>
              {row.status==='older'?'Cần cập nhật':'Đã đối chiếu'}
            </Badge>
          </li>)}
        </ul>
      </Card>
    </div>
    <a href="#/quality" className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm hover:border-slate-400 dark:border-slate-700">
      <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-400"/>
      <span><strong>{t.nav.quality}</strong><span className="mt-1 block text-xs text-slate-500">
        Kiểm tra số lượng, mã trùng và tính nhất quán giữa các danh mục.
      </span></span>
    </a>
  </>;
}
