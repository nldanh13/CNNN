import { useState, type FormEvent } from 'react';
import { BookOpen, Eye, EyeOff, KeyRound, LogIn, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { navigate } from '../store/router';
import { accountName, initials } from '../lib/utils';
import { Alert, Button, Card, CardHeader, Field, IconButton, Input, SettingRow, TextLink } from '../ui';

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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setFeedback('');
    setFailure('');
    try {
      if (mode === 'forgot') {
        await auth.resetPassword(email);
        setFeedback('Nếu email đã đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu.');
      } else if (mode === 'signup') {
        if (password.length < 12) throw new Error('Mật khẩu phải có ít nhất 12 ký tự.');
        const signedIn = await auth.signUp(email, password, name);
        if (signedIn) navigate('/home');
        else setFeedback('Đã gửi hướng dẫn xác nhận tài khoản đến email (nếu dịch vụ cho phép đăng ký).');
      } else {
        await auth.signIn(email, password);
        navigate('/home');
      }
    } catch (error) {
      setFailure(errorText(error));
    } finally {
      setBusy(false);
    }
  };

  const selectMode = (next: Mode) => {
    setMode(next); setFailure(''); setFeedback(''); setPassword('');
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
            {failure && <Alert role="alert" tone="danger" size="sm">{failure}</Alert>}
            {feedback && <Alert role="status" tone="info" size="sm">{feedback}</Alert>}
            <Button type="submit" variant="primary" className="w-full" disabled={busy}
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
          Kế hoạch chăm sóc lưu trên thiết bị này.
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

const privacyNote = <p className="flex gap-2 border-t border-line-soft px-5 py-3 text-xs leading-relaxed text-fg-muted">
  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
  <span><span className="font-medium text-fg-body">Lưu trữ & quyền riêng tư:</span> kế hoạch lưu riêng theo tài khoản trong trình duyệt
    hiện tại, không đồng bộ giữa các thiết bị và không được mã hóa. Không nhập dữ liệu nhận dạng người bệnh thật.</span>
</p>;

export function AccountSettings() {
  const auth = useAuth();
  const savedName = auth.user?.user_metadata?.full_name ?? '';
  const [fullName, setFullName] = useState(savedName);
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const action = async (fn: () => Promise<void>, done: string) => {
    setBusy(true); setMessage(''); setError('');
    try { await fn(); setMessage(done); }
    catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  };
  if (!auth.enabled) {
    return <Card>
      <CardHeader icon={<UserRound className="h-4 w-4" />} title="Tài khoản" subtitle="Đang dùng ở chế độ thiết bị cá nhân, chưa bật đăng nhập." />
      {privacyNote}
    </Card>;
  }
  if (!auth.user) return null;
  const displayName = accountName(auth.user);
  const closePassword = () => { setChangingPassword(false); setNewPassword(''); setShowPassword(false); setError(''); };

  return <>
    <Card className="flex flex-wrap items-center gap-4 p-5">
      <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-600 text-lg font-semibold text-white">
        {initials(displayName)}
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="truncate text-lg font-semibold text-fg">{displayName}</p>
        <p className="truncate text-sm text-fg-muted">{auth.user.email}</p>
      </div>
      <Button icon={<LogOut className="h-4 w-4" />} variant="danger" onClick={() => void auth.signOut()}>
        Đăng xuất
      </Button>
    </Card>

    <Card>
      <CardHeader icon={<UserRound className="h-4 w-4" />} title="Tài khoản" />
      <div className="divide-y divide-line-soft">
        <form className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center" onSubmit={e => {
          e.preventDefault();
          void action(() => auth.updateName(fullName), 'Đã lưu họ tên.');
        }}>
          <label htmlFor="account-name" className="text-sm font-medium text-fg sm:w-40 sm:shrink-0">Họ tên hiển thị</label>
          <div className="flex flex-1 gap-2">
            <Input id="account-name" value={fullName} onChange={e => setFullName(e.target.value)} maxLength={80} required />
            <Button type="submit" disabled={busy || !fullName.trim() || fullName.trim() === savedName}>Lưu</Button>
          </div>
        </form>
        {changingPassword ? (
          <form className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start" onSubmit={e => {
            e.preventDefault();
            if (newPassword.length < 12) { setError('Mật khẩu phải có ít nhất 12 ký tự.'); return; }
            void action(async () => { await auth.updatePassword(newPassword); closePassword(); }, 'Đã đổi mật khẩu.');
          }}>
            <label htmlFor="account-password" className="text-sm font-medium text-fg sm:w-40 sm:shrink-0 sm:pt-2.5">Mật khẩu mới</label>
            <div className="flex-1 space-y-2">
              <div className="relative">
                <Input id="account-password" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password" minLength={12} placeholder="Ít nhất 12 ký tự" required autoFocus className="pr-11" />
                <IconButton label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword}
                  className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </IconButton>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={closePassword}>Hủy</Button>
                <Button type="submit" variant="primary" disabled={busy}>Lưu mật khẩu</Button>
              </div>
            </div>
          </form>
        ) : (
          <SettingRow label="Mật khẩu" hint="Đổi mật khẩu đăng nhập của bạn">
            <Button icon={<KeyRound className="h-4 w-4" />} onClick={() => { setChangingPassword(true); setMessage(''); }}>
              Đổi mật khẩu
            </Button>
          </SettingRow>
        )}
      </div>
      {(message || error) && <div className="px-5 pb-4">
        {message && <Alert role="status" tone="success" size="sm">{message}</Alert>}
        {error && <Alert role="alert" tone="danger" size="sm">{error}</Alert>}
      </div>}
      {privacyNote}
    </Card>
  </>;
}
