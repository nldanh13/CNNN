import { useCallback, useEffect, useState } from 'react';
import { CloudDownload, CloudUpload, RefreshCw, Trash2, Copy, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useApp } from '../store/AppContext';
import {
  cloudBackupEnabled, createCloudBackup, deleteCloudBackup,
  downloadCloudBackup, listCloudBackups, canReadCloudBackupId, type CloudBackupSummary,
} from '../cloud/backupRepository';
import { Button, Card, CardBody, CardHeader } from '../ui';

function explain(error: unknown) {
  return error instanceof Error ? error.message : 'Có lỗi khi truy cập bản sao lưu.';
}

export function CloudBackupPanel() {
  const auth = useAuth();
  const { plans, mergePlans } = useApp();
  const [backups, setBackups] = useState<CloudBackupSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [probeId, setProbeId] = useState('');
  const [probeResult, setProbeResult] = useState<'not-visible' | 'visible' | null>(null);
  const [probeError, setProbeError] = useState('');
  const [probing, setProbing] = useState(false);
  const session = auth.session;

  const reload = useCallback(async () => {
    if (!cloudBackupEnabled || !session) { setLoading(false); return; }
    setError('');
    try {
      setBackups(await listCloudBackups(session));
    } catch (e) { setError(explain(e)); }
    finally { setLoading(false); }
  }, [session]);

  useEffect(() => { void reload(); }, [reload]);

  if (!cloudBackupEnabled || !session || !auth.user) return null;

  const perform = async (task: () => Promise<void>) => {
    setBusy(true);
    setError('');
    setMessage('');
    try { await task(); }
    catch (e) { setError(explain(e)); }
    finally { setBusy(false); }
  };

  const upload = () => {
    if (!plans.length) return;
    if (!window.confirm(
      'Tạo bản sao lưu mới trên Supabase cho tài khoản này? ' +
      'Chỉ sử dụng với dữ liệu thử nghiệm không nhận dạng người bệnh. ' +
      'Không tải hồ sơ người bệnh thật lên tính năng này.',
    )) return;
    void perform(async () => {
      await createCloudBackup(session, plans);
      setMessage('Đã tạo bản sao lưu trên tài khoản.');
      await reload();
    });
  };

  const restore = (item: CloudBackupSummary) => {
    if (!window.confirm(
      'Khôi phục ' + item.plan_count + ' kế hoạch từ tài khoản? ' +
      'CNNN chỉ bổ sung kế hoạch chưa có trên thiết bị, không ghi đè các kế hoạch trùng ID.',
    )) return;
    void perform(async () => {
      const restored = await downloadCloudBackup(session, item.id);
      const existingIds = new Set(plans.map(p => p.id));
      const additions = restored.filter(p => !existingIds.has(p.id));
      if (additions.length) mergePlans(additions);
      setMessage('Đã thêm ' + additions.length + ' kế hoạch. Bỏ qua ' +
        (restored.length - additions.length) + ' kế hoạch trùng để giữ dữ liệu hiện tại.');
    });
  };

  const remove = (item: CloudBackupSummary) => {
    if (!window.confirm('Xóa vĩnh viễn bản sao lưu ' +
      new Date(item.created_at).toLocaleString('vi-VN') + ' khỏi tài khoản?')) return;
    void perform(async () => {
      await deleteCloudBackup(session, item.id);
      setMessage('Đã xóa bản sao lưu khỏi tài khoản.');
      await reload();
    });
  };

  const checkRlsRead = async () => {
    setProbing(true);
    setProbeError('');
    setProbeResult(null);
    try {
      const visible = await canReadCloudBackupId(session, probeId);
      setProbeResult(visible ? 'visible' : 'not-visible');
    } catch (e) { setProbeError(explain(e)); }
    finally { setProbing(false); }
  };

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setMessage('Đã sao chép mã bản sao lưu.');
      setError('');
    } catch {
      setError('Trình duyệt chặn sao chép. Hãy chọn mã UUID bên dưới để sao chép thủ công.');
    }
  };

  return <Card>
    <CardHeader title="Sao lưu trong tài khoản" subtitle="Lưu bản nháp trên Supabase để tải lại trên thiết bị khác." />
    <CardBody className="space-y-4">
      <p className="text-xs leading-relaxed text-fg-muted">
        Sao lưu thủ công, chưa đồng bộ tự động. Chỉ dành cho dữ liệu đào tạo không nhận dạng người bệnh.
        Không tải thông tin người bệnh thật lên kho này.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" icon={<CloudUpload className="h-4 w-4" />}
          disabled={busy || !plans.length} onClick={upload}>
          Sao lưu lên tài khoản
        </Button>
        <Button size="sm" icon={<RefreshCw className="h-4 w-4" />}
          disabled={busy || loading} onClick={() => void reload()}>
          Làm mới
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
      {message && <p role="status" className="text-sm text-success-700">{message}</p>}
      {loading ? <p role="status" className="text-xs text-fg-muted">Đang tải bản sao lưu…</p> :
        backups.length === 0 ? <p className="text-xs text-fg-muted">Tài khoản chưa có bản sao lưu.</p> :
        <ul className="divide-y divide-line-soft rounded-control border border-line">
          {backups.map(item => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg">{new Date(item.created_at).toLocaleString('vi-VN')}</p>
                <p className="text-xs text-fg-muted">{item.plan_count} kế hoạch</p>
                <p className="mt-1 break-all font-mono text-[11px] text-fg-muted">{item.id}</p>
              </div>
              <div className="flex gap-1.5">
                <button type="button" aria-label="Sao chép mã bản sao lưu"
                  onClick={() => void copyId(item.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-control text-fg-muted hover:bg-surface-muted hover:text-fg">
                  <Copy className="h-4 w-4" />
                </button>
                <Button size="sm" icon={<CloudDownload className="h-4 w-4" />} disabled={busy} onClick={() => restore(item)}>
                  Khôi phục
                </Button>
                <button type="button" aria-label="Xóa bản sao lưu" disabled={busy} onClick={() => remove(item)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-control text-fg-muted hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>}
      <details className="border-t border-line-soft pt-3">
        <summary className="cursor-pointer text-xs font-medium text-fg-muted">
          Kiểm tra quyền truy cập dữ liệu
        </summary>
        <div className="mt-3 space-y-3">
          <p className="text-xs leading-relaxed text-fg-muted">
            Kiểm tra chỉ đọc. Tại tài khoản A, sao chép mã UUID của một bản sao lưu giả lập ở trên.
            Tại tài khoản B, dán mã đó vào ô dưới và kiểm tra. Không cần chia sẻ mật khẩu hoặc mã đăng nhập.
            Kết quả chỉ xác minh quyền ĐỌC, không kiểm tra quyền xóa.
          </p>
          <label htmlFor="backup-probe-id" className="block text-xs font-medium text-fg">
            Mã bản sao lưu từ tài khoản cần kiểm tra
          </label>
          <input id="backup-probe-id" type="text" value={probeId} maxLength={36}
            autoComplete="off" spellCheck={false}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            onChange={e => { setProbeId(e.target.value.trim()); setProbeResult(null); setProbeError(''); }}
            className="min-h-10 w-full rounded-control border border-line bg-surface-muted px-3 font-mono text-xs text-fg focus:border-primary-500 focus:outline-none"
          />
          <Button size="sm" icon={<ShieldCheck className="h-4 w-4" />}
            disabled={probing || busy || !probeId}
            onClick={() => void checkRlsRead()}>
            {probing ? 'Đang kiểm tra…' : 'Kiểm tra quyền đọc'}
          </Button>
          {probeResult === 'not-visible' && <p role="status" className="text-xs text-success-700">
            Không đọc được bản sao lưu mang mã này. Nếu mã thuộc tài khoản A và tồn tại,
            quyền đọc giữa tài khoản A/B đang được cách ly theo kết quả API.
          </p>}
          {probeResult === 'visible' && <p role="alert" className="text-xs text-danger-600">
            Tài khoản hiện tại có thể nhìn thấy bản sao lưu này. Nếu nó thuộc tài khoản
            khác, ngừng thử nghiệm và kiểm tra lại chính sách RLS ngay.
          </p>}
          {probeError && <p role="alert" className="text-xs text-danger-600">{probeError}</p>}
        </div>
      </details>
    </CardBody>
  </Card>;
}
