import { useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, LogIn, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { TurnstileChallenge, turnstileSiteKey } from '../auth/TurnstileChallenge';
import { navigate } from '../store/router';
import { Alert, BrandLogo, BrandMark, Button, Card, CardBody, CardHeader, Field, Input, TextLink } from '../ui';

type Mode = 'login' | 'signup' | 'forgot';
const errorText = (e: unknown) => e instanceof Error ? e.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.';

export function AccountGate({ initialMode = 'login' }: { initialMode?: Mode }) {
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
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

  const title = mode === 'login' ? 'Đăng nhập' : mode === 'signup' ? 'Tạo tài khoản' : 'Khôi phục mật khẩu';
  const lead = mode === 'login' ? 'Chào mừng trở lại. Đăng nhập để tiếp tục công việc của bạn.'
    : mode === 'signup' ? 'Tạo tài khoản để lưu kế hoạch chăm sóc theo tài khoản của bạn.'
    : 'Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.';

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-primary-900 p-12 text-white lg:flex lg:flex-col dark:bg-primary-950">
        <BrandLogo href="#/" inverted />
        <div className="my-auto max-w-md">
          <h2 className="text-balance font-sans text-3xl font-bold leading-tight tracking-[-0.015em]">
            Kế hoạch chăm sóc điều dưỡng chuẩn NANDA-I, NOC, NIC
          </h2>
          <ul className="mt-8 space-y-4 text-[15px] text-primary-100">
            {['Tra cứu 1.431 mã chẩn đoán, kết quả và can thiệp', 'Trợ lý gợi ý chẩn đoán từ dữ kiện đánh giá', 'Lập, chấm điểm và in kế hoạch chăm sóc'].map(text => (
              <li key={text} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-300" />{text}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs leading-relaxed text-primary-200">
          Công cụ hỗ trợ học tập và tham khảo, không thay thế đánh giá lâm sàng.
        </p>
      </aside>

      <div className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <span className="lg:hidden"><BrandLogo href="#/" compact /></span>
          <a href="#/" className="ml-auto inline-flex items-center gap-1.5 rounded-control px-2 py-1.5 text-sm font-medium text-fg-muted transition hover:bg-surface-muted hover:text-fg">
            <ArrowLeft className="h-4 w-4" /> Trang giới thiệu
          </a>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <BrandMark className="mb-6 hidden h-11 w-11 lg:flex" />
          <h1 className="font-sans text-[1.75rem] font-bold tracking-[-0.015em] text-fg">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">{lead}</p>
          <form className="mt-8 space-y-4" onSubmit={submit}>
            {mode === 'signup' && <Field label="Họ tên hiển thị">
              <Input value={name} onChange={e => setName(e.target.value)} autoComplete="name" maxLength={80} required />
            </Field>}
            <Field label="Email">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" inputMode="email" placeholder="ten@vidu.com" required />
            </Field>
            {mode !== 'forgot' && <Field label="Mật khẩu" hint={mode === 'signup' ? 'Ít nhất 12 ký tự.' : undefined}>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={mode === 'signup' ? 12 : undefined} required />
            </Field>}
            {mode === 'login' && <div className="-mt-1 flex justify-end text-sm">
              <TextLink onClick={() => selectMode('forgot')}>Quên mật khẩu?</TextLink>
            </div>}
            <TurnstileChallenge key={mode + ':' + captchaAttempt} onToken={setCaptchaToken} />
            {failure && <Alert role="alert" tone="danger" size="sm">{failure}</Alert>}
            {feedback && <Alert role="status" tone="info" size="sm">{feedback}</Alert>}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy || Boolean(turnstileSiteKey && !captchaToken)}
              icon={mode === 'forgot' ? <KeyRound className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}>
              {busy ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : mode === 'signup' ? 'Đăng ký' : 'Gửi email khôi phục'}
            </Button>
          </form>
          <p className="mt-8 border-t border-line-soft pt-6 text-center text-sm text-fg-muted">
            {mode === 'signup' ? <>Đã có tài khoản? <TextLink onClick={() => selectMode('login')}>Đăng nhập</TextLink></>
              : mode === 'forgot' ? <>Nhớ lại mật khẩu? <TextLink onClick={() => selectMode('login')}>Đăng nhập</TextLink></>
              : <>Chưa có tài khoản? <TextLink onClick={() => selectMode('signup')}>Đăng ký tài khoản</TextLink></>}
          </p>
        </div>
        <p className="text-center text-xs text-fg-muted">
          Kế hoạch chăm sóc lưu riêng theo tài khoản. Không nhập dữ liệu nhận dạng người bệnh thật.
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
        <Button icon={<LogOut className="h-4 w-4" />} variant="danger" onClick={() => { void auth.signOut(); navigate('/'); }}>
          Đăng xuất
        </Button>
      </div>
    </CardBody>
  </Card>;
}
