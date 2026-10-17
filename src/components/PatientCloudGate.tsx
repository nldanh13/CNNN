import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Button, Card } from '../ui';

/** Show migration once for existing local plans; never silently discard them. */
export function PatientCloudGate() {
  const {
    planStatus, planError, oldPlansCount, retryCloudPlans,
    importOldPlans, skipOldPlans,
  } = useApp();

  if (planStatus === 'loading') return (
    <div role="status" className="mx-auto max-w-xl py-16 text-center text-sm text-fg-muted">
      <Cloud className="mx-auto mb-3 h-7 w-7" />
      Đang tải kế hoạch của tài khoản…
    </div>
  );

  if (planStatus === 'error') return (
    <Card className="mx-auto max-w-xl space-y-4 p-6">
      <div className="flex items-center gap-3">
        <CloudOff className="h-6 w-6 text-danger-600" />
        <h2 className="text-lg font-semibold text-fg">Chưa tải được dữ liệu tài khoản</h2>
      </div>
      <p role="alert" className="text-sm text-fg-muted">{planError}</p>
      <p className="text-xs text-fg-muted">
        Chúng tôi không xóa kế hoạch cũ trên thiết bị. Hãy kiểm tra kết nối hoặc liên hệ quản trị viên.
      </p>
      <Button icon={<RefreshCw className="h-4 w-4" />} onClick={retryCloudPlans}>Thử tải lại</Button>
    </Card>
  );

  if (planStatus !== 'migration') return null;
  return (
    <Card className="mx-auto max-w-xl space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Cloud className="h-6 w-6 text-primary-600" />
        <h2 className="text-lg font-semibold text-fg">Chuyển kế hoạch cũ vào tài khoản</h2>
      </div>
      <p className="text-sm leading-relaxed text-fg-muted">
        Phát hiện {oldPlansCount} kế hoạch đã lưu trước đây trên thiết bị này.
        Bạn có thể chuyển chúng vào tài khoản để tự lưu và mở trên thiết bị khác.
        Các kế hoạch cũ không bị xóa.
      </p>
      <p className="text-xs text-fg-muted">Mỗi tài khoản được lưu tối đa 3 người bệnh.</p>
      {planError && <p role="alert" className="text-sm text-danger-600">{planError}</p>}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void importOldPlans()}>Chuyển vào tài khoản</Button>
        <Button variant="secondary" onClick={skipOldPlans}>Dùng dữ liệu đang có trên tài khoản</Button>
      </div>
    </Card>
  );
}
