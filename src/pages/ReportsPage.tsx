import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import {
  getReportRepository, REPORT_STATUSES, reportStatusLabel,
  type ReportIdentity, type StoredReport, type ReportStatus,
} from '../reports';
import { Alert, Button, Card, PageHeader, Select, Textarea } from '../ui';

const PAGE_SIZE = 50;
const when = (date: string) => new Date(date).toLocaleString('vi-VN');

function downloadJson(name: string, value: unknown) {
  const data = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const uri = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = uri; link.download = name;
  document.body.appendChild(link); link.click(); link.remove();
  URL.revokeObjectURL(uri);
}

function ReportCard({report, admin, save}: {
  report: StoredReport;
  admin: boolean;
  save: (id: string, status: ReportStatus, note: string) => Promise<void>;
}) {
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [note, setNote] = useState(report.admin_note ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  return <Card className="space-y-3 p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="rounded-control bg-surface-muted px-2 py-1 text-xs font-semibold text-fg">
          {report.system.toUpperCase()} · {report.code}
        </span>
        <span className="text-xs text-fg-muted">{reportStatusLabel(report.status)}</span>
      </div>
      <time className="text-xs text-fg-muted" dateTime={report.created_at}>{when(report.created_at)}</time>
    </div>
    <h3 className="text-sm font-semibold text-fg">{report.label}</h3>
    <p className="whitespace-pre-wrap break-words text-sm text-fg-body">{report.description}</p>
    {report.suggestion && <p className="text-xs text-fg-muted">Đề xuất: {report.suggestion}</p>}
    {report.evidence && <p className="text-xs text-fg-muted">Nguồn: {report.evidence}</p>}
    {admin && <p className="text-xs text-fg-muted">Người gửi: {report.reporter_id}</p>}
    {!admin && report.admin_note && <p className="rounded-control bg-surface-muted px-3 py-2 text-xs text-fg-body">
      Phản hồi quản trị: {report.admin_note}
    </p>}
    {admin && <div className="space-y-2 border-t border-line pt-3">
      <label className="block text-xs font-semibold text-fg">Trạng thái xử lý</label>
      <Select value={status} disabled={saving} onChange={e => setStatus(e.target.value as ReportStatus)}>
        {REPORT_STATUSES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
      </Select>
      <label className="block text-xs font-semibold text-fg">Phản hồi quản trị</label>
      <Textarea value={note} rows={2} maxLength={1000} disabled={saving}
        onChange={e => setNote(e.target.value)} />
      {error && <p role="alert" className="text-xs text-danger-600">{error}</p>}
      <Button size="sm" disabled={saving || (status === report.status && note === (report.admin_note ?? ''))}
        onClick={() => { setSaving(true); setError('');
          void save(report.id, status, note).catch(e => {
            setError(e instanceof Error ? e.message : 'Không lưu được thay đổi.');
          }).finally(() => setSaving(false));
        }}>
        {saving ? 'Đang lưu…' : 'Lưu xử lý'}
      </Button>
    </div>}
  </Card>;
}

export function ReportsPage() {
  const auth = useAuth();
  const identity = useMemo<ReportIdentity | null>(
    () => auth.user && auth.session
      ? { userId: auth.user.id, accessToken: auth.session.access_token } : null,
    [auth.user?.id, auth.session?.access_token],
  );
  const repository = useMemo(() => getReportRepository(), []);
  const [admin, setAdmin] = useState(false);
  const [view, setView] = useState<'mine' | 'all'>('mine');
  const [rows, setRows] = useState<StoredReport[]>([]);
  const [offset, setOffset] = useState(0);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const fetchPage = useCallback(async (scope: 'mine' | 'all', start = 0) => {
    if (!identity || !repository) return;
    setBusy(true); setError('');
    try {
      const batch = scope === 'all'
        ? await repository.listAll(identity, start, PAGE_SIZE)
        : await repository.listMine(identity, start, PAGE_SIZE);
      setRows(prev => start === 0 ? batch : [...prev, ...batch]);
      setOffset(start + batch.length);
      setMore(batch.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được báo cáo.');
    } finally { setBusy(false); }
  }, [identity, repository]);

  useEffect(() => {
    if (!identity || !repository) { setBusy(false); return; }
    let active = true;
    void repository.isAdmin(identity).then(value => { if (active) setAdmin(value); })
      .catch(() => { if (active) setAdmin(false); });
    return () => { active = false; };
  }, [identity, repository]);

  useEffect(() => { void fetchPage(view); }, [fetchPage, view]);

  async function save(id: string, status: ReportStatus, note: string) {
    if (!identity || !repository || !admin) throw new Error('Không có quyền quản trị.');
    await repository.updateStatus(identity, id, status, note);
    await fetchPage(view);
  }

  async function exportReports() {
    if (!identity || !repository || !admin) return;
    setExporting(true); setError('');
    try {
      const all: StoredReport[] = [];
      for (let start = 0; ; start += 100) {
        const batch = await repository.listAll(identity, start, 100);
        all.push(...batch);
        if (batch.length < 100) break;
      }
      downloadJson('cnnn-data-reports-' + new Date().toISOString().slice(0, 10) + '.json', {
        format: 'cnnn-data-reports', version: 1, exportedAt: new Date().toISOString(), reports: all,
      });
    } catch (e) { setError(e instanceof Error ? e.message : 'Không xuất được báo cáo.'); }
    finally { setExporting(false); }
  }

  return <div className="mx-auto max-w-4xl space-y-5">
    <PageHeader title="Báo cáo dữ liệu" subtitle="Theo dõi các góp ý NANDA-I, NOC và NIC."
      breadcrumb={<a href="#/settings" className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg">
        <ArrowLeft className="h-3.5 w-3.5" /> Cài đặt</a>} />
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button size="sm" variant={view === 'mine' ? 'primary' : undefined}
          onClick={() => setView('mine')}>Của tôi</Button>
        {admin && <Button size="sm" variant={view === 'all' ? 'primary' : undefined}
          onClick={() => setView('all')}>Tất cả báo cáo</Button>}
      </div>
      <div className="flex gap-2">
        {admin && <Button size="sm" icon={<Download className="h-4 w-4" />} disabled={exporting}
          onClick={() => void exportReports()}>{exporting ? 'Đang xuất…' : 'Xuất JSON'}</Button>}
        <Button size="sm" icon={<RefreshCw className="h-4 w-4" />} disabled={busy}
          onClick={() => void fetchPage(view)}>Tải lại</Button>
      </div>
    </div>
    {!repository && <Alert tone="info">
      Chức năng báo cáo chưa được cấu hình. Quản trị viên cần cài đặt kho báo cáo.
    </Alert>}
    {error && <Alert role="alert" tone="danger">{error}</Alert>}
    {rows.length === 0 && !busy && !error && repository &&
      <Card className="p-6 text-sm text-fg-muted">Chưa có báo cáo nào.</Card>}
    <div className="space-y-3">
      {rows.map(item => <ReportCard key={item.id} report={item}
        admin={admin && view === 'all'} save={save} />)}
    </div>
    {more && <Button disabled={busy} onClick={() => void fetchPage(view, offset)}>
      {busy ? 'Đang tải…' : 'Xem thêm báo cáo'}
    </Button>}
  </div>;
}
