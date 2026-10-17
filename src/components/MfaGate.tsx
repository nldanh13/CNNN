import { useState, type FormEvent } from 'react';
import { KeyRound, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { verifiedTotpFactors } from '../auth/mfa';
import { Button, Card, Input } from '../ui';

/** Only rendered for users with an already verified MFA factor at AAL1. */
export function MfaGate() {
  const auth = useAuth();
  const factors = verifiedTotpFactors(auth.user);
  const [factorId, setFactorId] = useState(factors[0]?.id ?? '');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !factorId) return;
    setBusy(true);
    setError('');
    try { await auth.verifyMfa(factorId, code.trim()); setCode(''); }
    catch (err) { setCode(''); setError(err instanceof Error ? err.message : 'Không thể xác minh mã.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-8">
      <Card className="w-full max-w-md space-y-4 p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary-600" />
          <h1 className="text-xl font-semibold text-fg">Xác thực hai lớp</h1>
        </div>
        <p className="text-sm leading-relaxed text-fg-muted">
          Mở ứng dụng Authenticator đã liên kết với tài khoản và nhập mã 6 chữ số.
        </p>
        <form onSubmit={verify} className="space-y-3">
          {factors.length > 1 && (
            <label className="block text-xs font-medium text-fg">
              Chọn ứng dụng xác thực
              <select value={factorId} onChange={e => setFactorId(e.target.value)}
                className="mt-2 min-h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-fg">
                {factors.map((f, index) =>
                  <option key={f.id} value={f.id}>{f.friendly_name || 'Thiết bị ' + (index + 1)}</option>)}
              </select>
            </label>
          )}
          <Input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}"
            placeholder="Mã xác thực 6 chữ số" aria-label="Mã Authenticator 6 chữ số"
            value={code} maxLength={6}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
          {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" disabled={busy || !factorId || code.length !== 6}
            icon={<KeyRound className="h-4 w-4" />}>
            {busy ? 'Đang xác minh…' : 'Xác minh và tiếp tục'}
          </Button>
        </form>
        <button type="button" onClick={() => void auth.signOut()}
          className="flex items-center gap-2 text-sm text-fg-muted hover:text-fg">
          <LogOut className="h-4 w-4" /> Đăng xuất
        </button>
      </Card>
    </div>
  );
}
