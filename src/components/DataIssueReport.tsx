import { useState } from 'react';
import { Clipboard, Flag, Send } from 'lucide-react';
import type { TaxonomySystem } from '../types';
import { useApp } from '../store/AppContext';
import { useAuth } from '../auth/AuthContext';
import { getReportRepository } from '../reports';
import { makeDataReportText, type DataReport, type ReportCategory } from '../lib/dataReports';
import { Alert, Button, Field, Input, Modal, ModalFooter, ModalHeader, Select, Textarea } from '../ui';

const TYPES: Array<{value: ReportCategory; label: string}> = [
  { value: 'wrong-code', label: 'Sai mã phân loại' },
  { value: 'wrong-label', label: 'Sai thuật ngữ tiếng Việt' },
  { value: 'wrong-translation', label: 'Góp ý bản dịch' },
  { value: 'wrong-definition', label: 'Giải thích chưa chính xác' },
  { value: 'wrong-indicator', label: 'Thông tin chỉ số NOC' },
  { value: 'wrong-activity', label: 'Thông tin can thiệp NIC' },
  { value: 'outdated-edition', label: 'Thông tin ấn bản' },
  { value: 'other', label: 'Vấn đề khác' },
];

export function DataIssueReport({system,code,label,fallbackEdition}: {
  system: TaxonomySystem; code: string; label: string; fallbackEdition: string;
}) {
  const { term, toast } = useApp();
  const { user, session } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ReportCategory>('wrong-translation');
  const [description, setDescription] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [evidence, setEvidence] = useState('');
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const titleVi = term(code,label).text;
  const valid = description.trim().length >= 10 && consent && !sending;
  const draft: DataReport = {
    system, code, label: titleVi, edition: fallbackEdition,
    category, description: description.trim(), suggestion: suggestion.trim(), evidence: evidence.trim(),
  };
  const reset = () => {
    setCategory('wrong-translation'); setDescription(''); setSuggestion('');
    setEvidence(''); setConsent(false); setError(''); setOpen(true);
  };
  const submit = async () => {
    if (!valid || !user || !session) return;
    const repository = getReportRepository();
    if (!repository) {
      setError('Chức năng báo cáo chưa được quản trị viên cấu hình.');
      return;
    }
    setSending(true); setError('');
    try {
      await repository.submit({ userId: user.id, accessToken: session.access_token }, draft);
      setOpen(false);
      toast('Đã gửi báo cáo thành công.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không gửi được báo cáo. Vui lòng thử lại.');
    } finally { setSending(false); }
  };

  return <>
    <Button size="sm" icon={<Flag className="h-3.5 w-3.5" />} onClick={reset}>Báo cáo dữ liệu</Button>
    <Modal open={open} onClose={() => { if (!sending) setOpen(false); }} className="max-w-2xl">
      <ModalHeader title="Báo cáo sai sót hoặc góp ý bản dịch" onClose={() => { if (!sending) setOpen(false); }} />
      <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-4 text-sm">
        <p className="rounded-control bg-surface-muted px-3 py-2 text-xs">
          <strong>{system.toUpperCase()} {code}</strong> · {titleVi}
          <span className="mt-1 block text-fg-muted">{fallbackEdition}</span>
        </p>
        <Field label="Loại vấn đề">
          <Select value={category} onChange={e => setCategory(e.target.value as ReportCategory)} disabled={sending}>
            {TYPES.map(t => <option value={t.value} key={t.value}>{t.label}</option>)}
          </Select>
        </Field>
        <Field label="Mô tả vấn đề (ít nhất 10 ký tự)">
          <Textarea rows={3} maxLength={1000} value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Chỉ ra chỗ chưa chính xác hoặc thuật ngữ cần cải thiện…" disabled={sending} />
        </Field>
        <Field label="Đề xuất chỉnh sửa (không bắt buộc)">
          <Textarea rows={2} maxLength={400} value={suggestion} onChange={e => setSuggestion(e.target.value)}
            disabled={sending} />
        </Field>
        <Field label="Nguồn đối chiếu (không bắt buộc)">
          <Input maxLength={300} value={evidence} onChange={e => setEvidence(e.target.value)}
            placeholder="Tên nguồn, ấn bản, trang hoặc DOI" disabled={sending} />
        </Field>
        <label className="flex items-start gap-2 text-xs">
          <input className="mt-0.5" type="checkbox" checked={consent} disabled={sending}
            onChange={e => setConsent(e.target.checked)} />
          Tôi xác nhận báo cáo không chứa dữ liệu cá nhân người bệnh hoặc nội dung sách nguyên văn.
        </label>
        {error && <Alert role="alert" tone="danger" size="sm">{error}</Alert>}
        {!user && <Alert tone="info" size="sm">Đăng nhập để gửi báo cáo trực tiếp.</Alert>}
      </div>
      <ModalFooter>
        <Button size="sm" disabled={!valid} icon={<Clipboard className="h-3.5 w-3.5" />}
          onClick={() => { void navigator.clipboard.writeText(makeDataReportText(draft))
            .then(() => toast('Đã sao chép báo cáo'))
            .catch(() => toast('Không thể sao chép','error')); }}>Sao chép</Button>
        <Button size="sm" variant="primary" disabled={!valid || !user || !session}
          icon={<Send className="h-3.5 w-3.5" />} onClick={() => void submit()}>
          {sending ? 'Đang gửi…' : 'Gửi báo cáo'}
        </Button>
      </ModalFooter>
    </Modal>
  </>;
}
