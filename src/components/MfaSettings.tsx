import { useState, type FormEvent } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { cancelUnverifiedTotp, enrollTotp } from '../auth/supabaseAuth';
import { verifiedTotpFactors, type MfaEnrolledFactor } from '../auth/mfa';
import { Alert, Button, Card, CardBody, CardHeader, Input } from '../ui';

export function MfaSettings() {
  const auth = useAuth();
  const [enrollment, setEnrollment] = useState<MfaEnrolledFactor | null>(null);
  const [code, setCode] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const enabled = import.meta.env.VITE_TOTP_MFA_ENABLED === 'true';
  const alreadyEnabled = verifiedTotpFactors(auth.user).length > 0;

  if (!enabled || !auth.session || !auth.user) return null;

  const start = async () => {
    const current = auth.session;
    if (!current || busy) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try { setEnrollment(await enrollTotp(current)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Không thể kích hoạt Authenticator.'); }
    finally { setBusy(false); }
  };

  const cancel = async () => {
    const current = auth.session;
    if (!current || !enrollment) return;
    setBusy(true);
    setError('');
    try {
      await cancelUnverifiedTotp(current, enrollment.id);
      setEnrollment(null);
      setCode('');
      setAcknowledged(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể hủy thiết lập MFA.');
    } finally { setBusy(false); }
  };

  const confirm = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !enrollment || !acknowledged) return;
    setBusy(true);
    setError('');
    try {
      await auth.verifyMfa(enrollment.id, code);
      setEnrollment(null);
      setCode('');
      setAcknowledged(false);
      setSuccess('Đã bật xác thực hai lớp. Lần đăng nhập sau sẽ yêu cầu mã Authenticator.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xác minh MFA không thành công.');
      setCode('');
    } finally { setBusy(false); }
  };

  return <Card>
    <CardHeader title="Xác thực hai lớp (MFA)" subtitle="Mã bảo vệ từ ứng dụng Authenticator" />
    <CardBody className="space-y-4">
      {alreadyEnabled && !enrollment ? (
        <div className="flex items-center gap-2 text-sm text-success-700">
          <ShieldCheck className="h-5 w-5" /> Tài khoản đã liên kết ứng dụng Authenticator.
        </div>
      ) : enrollment ? (
        <form className="space-y-4" onSubmit={e => void confirm(e)}>
          <p className="text-sm text-fg-muted">
            Quét mã QR trong ứng dụng Authenticator, hoặc nhập khóa thủ công vào ứng dụng đó.
            Đừng chụp, gửi hoặc chia sẻ mã QR / khóa bí mật.
          </p>
          <div className="flex justify-center rounded-control bg-white p-3">
            <img alt="Mã QR chỉ dành cho thiết lập ứng dụng Authenticator của tài khoản này"
              width="196" height="196"
              src={'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(enrollment.totp.qr_code)} />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-fg">Khóa thiết lập thủ công</p>
            <code className="block select-all break-all rounded-control border border-line bg-surface-muted px-3 py-2 text-sm text-fg">
              {enrollment.totp.secret}
            </code>
          </div>
          <label className="block text-sm text-fg">
            Mã gồm 6 chữ số từ ứng dụng
            <Input type="text" inputMode="numeric" autoComplete="one-time-code"
              aria-label="Mã Authenticator 6 chữ số"
              value={code} pattern="[0-9]{6}" maxLength={6}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
          </label>
          <label className="flex items-start gap-2 text-xs leading-relaxed text-fg-muted">
            <input type="checkbox" checked={acknowledged}
              onChange={e => setAcknowledged(e.target.checked)} />
            Tôi đã lưu phương án khôi phục ứng dụng Authenticator.
            Nếu mất thiết bị, tôi có thể cần liên hệ quản trị viên để đặt lại MFA.
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy || code.length !== 6 || !acknowledged}
              icon={<KeyRound className="h-4 w-4" />}>
              {busy ? 'Đang xác minh…' : 'Xác minh và bật MFA'}
            </Button>
            <Button type="button" disabled={busy} variant="secondary" onClick={() => void cancel()}>
              Hủy thiết lập
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-fg-muted">
            Bảo vệ lần đăng nhập tiếp theo bằng mã từ Google Authenticator,
            Microsoft Authenticator hoặc ứng dụng tương đương.
          </p>
          <Button disabled={busy} onClick={() => void start()} icon={<KeyRound className="h-4 w-4" />}>
            {busy ? 'Đang tạo mã…' : 'Bật xác thực hai lớp'}
          </Button>
        </div>
      )}
      {error && <Alert role="alert" tone="danger" size="sm">{error}</Alert>}
      {success && <Alert role="status" tone="success" size="sm">{success}</Alert>}
    </CardBody>
  </Card>;
}
