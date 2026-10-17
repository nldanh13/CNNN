import { useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { TurnstileChallenge, turnstileSiteKey } from '../auth/TurnstileChallenge';
import { navigate } from '../store/router';
import { patientCloudEnabled } from '../cloud/patientWorkspace';
import { Alert, Badge, BrandLogo, BrandMark, Button, Card, Field, Input, SettingRow, SettingsSection, TextLink } from '../ui';

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
          Mỗi tài khoản được lưu tối đa 3 người bệnh. Không nhập dữ liệu nhận dạng người bệnh thật.
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

/** Các nhóm cài đặt tài khoản: Hồ sơ, Bảo mật, Dữ liệu & quyền riêng tư. */
export function AccountSettings() {
  const auth = useAuth();
  const savedName = auth.user?.user_metadata?.full_name ?? '';
  const [fullName, setFullName] = useState(savedName);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState<'' | 'name' | 'password'>('');
  const [status, setStatus] = useState<{ form: 'name' | 'password'; tone: 'success' | 'danger'; text: string } | null>(null);
  const run = async (form: 'name' | 'password', fn: () => Promise<void>, ok: string) => {
    setBusy(form); setStatus(null);
    try { await fn(); setStatus({ form, tone: 'success', text: ok }); }
    catch (e) { setStatus({ form, tone: 'danger', text: errorText(e) }); }
    finally { setBusy(''); }
  };
  const note = (form: 'name' | 'password') => status?.form === form &&
    <Alert role={status.tone === 'danger' ? 'alert' : 'status'} tone={status.tone} size="sm">{status.text}</Alert>;

  if (!auth.enabled) {
    return <SettingsSection title="Tài khoản" description="Chưa kết nối dịch vụ tài khoản.">
      <p className="px-5 py-4 text-sm leading-relaxed text-fg-muted">
        Ứng dụng hiện đang ở chế độ thiết bị cá nhân. Quản trị viên cần cấu hình VITE_SUPABASE_URL và
        VITE_SUPABASE_ANON_KEY để bật đăng ký, đăng nhập cho mọi người.
      </p>
    </SettingsSection>;
  }
  if (!auth.user) return null;
  const email = auth.user.email;
  const display = savedName.trim() || email;
  const initials = display.split(/[\s@]+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('');
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 12;
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  return <>
    <SettingsSection id="ho-so" title="Hồ sơ" description="Tên hiển thị trong lời chào và trên kế hoạch chăm sóc.">
      <div className="flex items-center gap-4 border-b border-line-soft px-5 py-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-700 text-lg font-bold text-white">{initials}</span>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-fg">{display}</p>
          <p className="flex items-center gap-1.5 truncate text-sm text-fg-muted"><UserRound className="h-3.5 w-3.5 shrink-0" />{email}</p>
        </div>
      </div>
      <form className="space-y-4 px-5 py-5" onSubmit={e => {
        e.preventDefault();
        void run('name', () => auth.updateName(fullName.trim()), 'Đã lưu họ tên.');
      }}>
        <Field label="Họ tên hiển thị">
          <Input value={fullName} onChange={e => setFullName(e.target.value)} maxLength={80} autoComplete="name" required />
        </Field>
        <Field label="Email đăng nhập" hint="Email dùng để đăng nhập và khôi phục mật khẩu, không đổi được tại đây.">
          <Input value={email} readOnly disabled />
        </Field>
        {note('name')}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={busy !== '' || !fullName.trim() || fullName.trim() === savedName.trim()}>
            {busy === 'name' ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </SettingsSection>

    <SettingsSection id="bao-mat" title="Bảo mật" description="Đổi mật khẩu đăng nhập. Mật khẩu cần ít nhất 12 ký tự.">
      <form className="space-y-4 px-5 py-5" onSubmit={e => {
        e.preventDefault();
        if (newPassword.length < 12) { setStatus({ form: 'password', tone: 'danger', text: 'Mật khẩu phải có ít nhất 12 ký tự.' }); return; }
        if (newPassword !== confirmPassword) { setStatus({ form: 'password', tone: 'danger', text: 'Hai mật khẩu không khớp.' }); return; }
        void run('password', async () => { await auth.updatePassword(newPassword); setNewPassword(''); setConfirmPassword(''); }, 'Đã đổi mật khẩu.');
      }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mật khẩu mới" error={passwordTooShort ? 'Ít nhất 12 ký tự.' : undefined}>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password" minLength={12} required />
          </Field>
          <Field label="Nhập lại mật khẩu mới" error={mismatch ? 'Chưa khớp với mật khẩu mới.' : undefined}>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password" minLength={12} required />
          </Field>
        </div>
        {note('password')}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={<KeyRound className="h-4 w-4" />}
            disabled={busy !== '' || newPassword.length < 12 || newPassword !== confirmPassword}>
            {busy === 'password' ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}
          </Button>
        </div>
      </form>
    </SettingsSection>

    <SettingsSection id="du-lieu" title="Lưu trữ & quyền riêng tư" description="Nơi lưu kế hoạch chăm sóc và lưu ý khi nhập dữ liệu.">
      <div className="divide-y divide-line-soft">
        <SettingRow label="Nơi lưu kế hoạch" hint={patientCloudEnabled
          ? 'Tự lưu theo tài khoản, mở được trên mọi thiết bị (tối đa 3 người bệnh).'
          : 'Lưu theo tài khoản trên trình duyệt này; tính năng tự lưu lên máy chủ đang chờ cấu hình.'}>
          <Badge tone={patientCloudEnabled ? 'success' : 'neutral'}>{patientCloudEnabled ? 'Đồng bộ tài khoản' : 'Trên thiết bị này'}</Badge>
        </SettingRow>
        <div className="flex gap-3 px-5 py-4 text-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-warning-600 dark:text-warning-300" />
          <p className="leading-relaxed text-fg-body">
            Không nhập dữ liệu nhận dạng người bệnh thật (họ tên đầy đủ, số hồ sơ, địa chỉ) khi chưa có hệ thống bảo vệ hồ sơ được phê duyệt.
            Dùng tên viết tắt hoặc mã ca bệnh.
          </p>
        </div>
      </div>
    </SettingsSection>
  </>;
}
