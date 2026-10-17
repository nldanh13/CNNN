import { AlertCircle, CheckCircle2, CloudUpload } from 'lucide-react';
import { useApp } from '../store/AppContext';

/** Persistent, account-scoped save status on both list and editor screens. */
export function PlanSyncStatus() {
  const {
    planStatus, planSyncState, planSyncMessage, hasParkedDraft,
    reviewParkedDraft, retryStorage,
  } = useApp();
  if (planStatus !== 'ready' && planStatus !== 'local') return null;
  if (planStatus === 'local' || (!planSyncMessage && !hasParkedDraft)) return null;
  const failed = planSyncState === 'error' || planSyncState === 'conflict';
  return (
    <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8 print:hidden">
      <div role={failed ? 'alert' : 'status'} className={
        'flex flex-wrap items-center gap-2 rounded-control border px-3 py-2 text-xs ' +
        (failed ? 'border-danger-300 bg-danger-50 text-danger-700 dark:bg-danger-500/10' :
          'border-line bg-surface-muted text-fg-muted')
      }>
        {failed ? <AlertCircle className="h-4 w-4 shrink-0" /> :
          planSyncState === 'saved' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> :
          <CloudUpload className="h-4 w-4 shrink-0" />}
        <span className="min-w-0 flex-1">{planSyncMessage}</span>
        {failed && <button type="button" onClick={retryStorage}
          className="rounded px-2 py-1 font-semibold underline underline-offset-2">
          Thử lưu lại
        </button>}
        {hasParkedDraft && <button type="button" onClick={reviewParkedDraft}
          className="rounded px-2 py-1 font-semibold underline underline-offset-2">
          Xem bản nháp đã giữ
        </button>}
      </div>
    </div>
  );
}
