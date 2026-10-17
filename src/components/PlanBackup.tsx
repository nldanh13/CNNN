import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { backupFileName, backupJson, downloadText, parseBackup } from '../lib/backup';
import { Button } from '../ui';

/** Hai nút Sao lưu / Khôi phục cho toàn bộ kế hoạch lưu trong trình duyệt. */
export function PlanBackupButtons() {
  const { t, plans, mergePlans, toast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const restore = async (file: File | undefined) => {
    if (!file) return;
    try {
      const restored = parseBackup(await file.text());
      mergePlans(restored);
      toast(t.backup.restoreOk.replace('{n}', String(restored.length)));
    } catch {
      toast(t.backup.restoreFail, 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <Button
        icon={<Download className="h-4 w-4" />}
        disabled={plans.length === 0}
        onClick={() => {
          downloadText(backupFileName(), backupJson(plans));
          toast(t.backup.backupOk);
        }}
      >
        {t.backup.backup}
      </Button>
      <Button icon={<Upload className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>
        {t.backup.restore}
      </Button>
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => restore(e.target.files?.[0])} />
    </>
  );
}
