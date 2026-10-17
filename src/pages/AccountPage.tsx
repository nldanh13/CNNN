import { useState, type FormEvent } from 'react';
import { BookOpen, KeyRound, LogIn, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { TurnstileChallenge, turnstileSiteKey } from '../auth/TurnstileChallenge';
import { navigate } from '../store/router';
import { Alert, Button, Card, CardBody, CardHeader, Field, Input, TextLink } from '../ui';

type Mode = 'login' | 'signup' | 'forgot';
const errorText = (e: unknown) => e instanceof Error ? e.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.';

export function AccountGate() {
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [failure, setFailure] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaAttempt, setCaptchaAttempt] = useState(0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setFeedback('');
    setFailure('');
    if (turnstileSiteKey && !captchaToken) {
      setFailure('Vui lòng hoàn tất xác minh bảo mật trước khi tiếp tục.');
      setBusy(false);
      return;
    }
    try {
      if (mode === 'forgot') {
        await auth.resetPassword(email, captchaToken ?? undefined);
        setFeedback('Nếu email đã đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu.');
      } else if (mode === 'signup') {
        if (password.length < 12) throw new Error('Mật khẩu phải có ít nhất 12 ký tự.');
        const signedIn = await auth.signUp(email, password, name, captchaToken ?? undefined);
        if (signedIn) navigate('/home');
        else setFeedback('Đã gửi hướng dẫn xác nhận tài khoản đến email (nếu dịch vụ cho phép đăng ký).');
      } else {
        await auth.signIn(email, password, captchaToken ?? undefined);
        navigate('/home');
      }
    } catch (error) {
      setFailure(errorText(error));
    } finally {
      setBusy(false);
      setCaptchaToken(null);
      setCaptchaAttempt(n => n + 1);
    }
  };

  const selectMode = (next: Mode) => {
    setMode(next); setFailure(''); setFeedback(''); setPassword('');
    setCaptchaToken(null); setCaptchaAttempt(n => n + 1);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-card bg-primary-600 text-white shadow-sm">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-fg">Thư viện Điều dưỡng NNN</h1>
          <p className="mt-2 text-sm text-fg-muted">Một tài khoản để truy cập NANDA-I, NOC, NIC và trợ lý chẩn đoán.</p>
        </div>
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold text-fg">
            {mode === 'login' ? 'Đăng nhập' : mode === 'signup' ? 'Tạo tài khoản' : 'Khôi phục mật khẩu'}
          </h2>
          <form className="space-y-4" onSubmit={submit}>
            {mode === 'signup' && <Field label="Họ tên hiển thị">
              <Input value={name} onChange={e => setName(e.target.value)} autoComplete="name" maxLength={80} required />
            </Field>}
            <Field label="Email">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" inputMode="email" required />
            </Field>
            {mode !== 'forgot' && <Field label="Mật khẩu" hint={mode === 'signup' ? 'Ít nhất 12 ký tự.' : undefined}>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={mode === 'signup' ? 12 : undefined} required />
            </Field>}
            <TurnstileChallenge key={mode + ':' + captchaAttempt} onToken={setCaptchaToken} />
            {failure && <Alert role="alert" tone="danger" size="sm">{failure}</Alert>}
            {feedback && <Alert role="status" tone="info" size="sm">{feedback}</Alert>}
            <Button type="submit" variant="primary" className="w-full" disabled={busy || Boolean(turnstileSiteKey && !captchaToken)}
              icon={mode === 'forgot' ? <KeyRound className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}>
              {busy ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : mode === 'signup' ? 'Đăng ký' : 'Gửi email khôi phục'}
            </Button>
          </form>
          <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm">
            {mode !== 'login' && <TextLink onClick={() => selectMode('login')}>Đăng nhập</TextLink>}
            {mode !== 'signup' && <TextLink onClick={() => selectMode('signup')}>Đăng ký tài khoản</TextLink>}
            {mode !== 'forgot' && <TextLink onClick={() => selectMode('forgot')}>Quên mật khẩu?</TextLink>}
          </div>
        </Card>
        <p className="mt-4 text-center text-xs text-fg-muted">
          Mỗi tài khoản được lưu tối đa 3 người bệnh.
        </p>
      </div>
    </div>
  );
}

export function RecoveryGate() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
    <Card className="w-full max-w-md p-6">
      <h1 className="mb-4 text-xl font-semibold text-fg">Đặt mật khẩu mới</h1>
      <p className="mb-4 text-sm text-fg-muted">Bạn đã xác nhận liên kết khôi phục. Hãy đặt mật khẩu mới để tiếp tục.</p>
      <form className="space-y-3" onSubmit={async e => {
        e.preventDefault(); setError('');
        if (password.length < 12) { setError('Mật khẩu phải có ít nhất 12 ký tự.'); return; }
        if (password !== confirm) { setError('Hai mật khẩu không khớp.'); return; }
        setBusy(true);
        try { await updatePassword(password); } catch (err) { setError(errorText(err)); }
        finally { setBusy(false); }
      }}>
        <Input type="password" aria-label="Mật khẩu mới" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Mật khẩu mới" autoComplete="new-password" minLength={12} required />
        <Input type="password" aria-label="Nhập lại mật khẩu" value={confirm} onChange={e => setConfirm(e.target.value)}
          placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" minLength={12} required />
        {error && <Alert role="alert" tone="danger" size="sm">{error}</Alert>}
        <Button type="submit" variant="primary" disabled={busy}>Lưu mật khẩu</Button>
      </form>
    </Card>
  </div>;
}

export function AccountSettings() {
  const auth = useAuth();
  const [fullName, setFullName] = useState(auth.user?.user_metadata?.full_name ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const action = async (fn: () => Promise<void>) => {
    setBusy(true); setMessage(''); setError('');
    try { await fn(); setMessage('Đã cập nhật tài khoản.'); }
    catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  };
  if (!auth.enabled) {
    return <Card>
      <CardHeader title="Tài khoản" subtitle="Chưa kết nối dịch vụ tài khoản" />
      <p className="px-5 py-4 text-sm leading-relaxed text-fg-muted">
        Ứng dụng hiện đang ở chế độ thiết bị cá nhân. Quản trị viên cần cấu hình VITE_SUPABASE_URL và
        VITE_SUPABASE_ANON_KEY để bật đăng ký, đăng nhập cho mọi người.
      </p>
    </Card>;
  }
  if (!auth.user) return null;
  return <Card>
    <CardHeader title="Tài khoản của tôi" subtitle="Quản lý thông tin đăng nhập" />
    <CardBody className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-fg"><UserRound className="h-4 w-4 text-fg-muted" />
        <span className="font-medium">{auth.user.email}</span>
      </div>
      <details className="text-xs text-fg-muted">
        <summary className="flex cursor-pointer items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4" /> Lưu trữ & quyền riêng tư
        </summary>
        <p className="mt-2 rounded-control bg-surface-muted p-3 leading-relaxed">
          Kế hoạch lưu riêng theo tài khoản trong trình duyệt hiện tại, không đồng bộ giữa các thiết bị.
          Bộ nhớ trình duyệt không mã hóa hồ sơ bệnh án. Không nhập dữ liệu nhận dạng người bệnh thật.
        </p>
      </details>
      <form className="space-y-3" onSubmit={e => {
        e.preventDefault();
        void action(() => auth.updateName(fullName));
      }}>
        <Field label="Họ tên hiển thị">
          <Input value={fullName} onChange={e => setFullName(e.target.value)} maxLength={80} required />
        </Field>
        <Button type="submit" disabled={busy}>Lưu họ tên</Button>
      </form>
      <form className="space-y-3 border-t border-line-soft pt-4" onSubmit={e => {
        e.preventDefault();
        if (newPassword.length < 12) { setError('Mật khẩu phải có ít nhất 12 ký tự.'); return; }
        void action(async () => { await auth.updatePassword(newPassword); setNewPassword(''); });
      }}>
        <Field label="Đổi mật khẩu" hint="Ít nhất 12 ký tự.">
          <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password" minLength={12} required />
        </Field>
        <Button type="submit" disabled={busy}>Đổi mật khẩu</Button>
      </form>
      {message && <Alert role="status" tone="success" size="sm">{message}</Alert>}
      {error && <Alert role="alert" tone="danger" size="sm">{error}</Alert>}
      <div className="border-t border-line-soft pt-4">
        <Button icon={<LogOut className="h-4 w-4" />} variant="danger" onClick={() => void auth.signOut()}>
          Đăng xuất
        </Button>
      </div>
    </CardBody>
  </Card>;
}
