import { useState, type FormEvent } from 'react';
import { BookOpen, KeyRound, LogIn, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button, Card, CardHeader, Input } from '../components/ui';

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
        if (!signedIn) setFeedback('Đã gửi hướng dẫn xác nhận tài khoản đến email (nếu dịch vụ cho phép đăng ký).');
      } else {
        await auth.signIn(email, password);
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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center text-white">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Thư viện Điều dưỡng NNN</h1>
          <p className="mt-2 text-sm text-slate-300">Một tài khoản để truy cập NANDA-I, NOC, NIC và trợ lý chẩn đoán.</p>
        </div>
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">
            {mode === 'login' ? 'Đăng nhập' : mode === 'signup' ? 'Tạo tài khoản' : 'Khôi phục mật khẩu'}
          </h2>
          <form className="space-y-4" onSubmit={submit}>
            {mode === 'signup' && <label className="block space-y-1.5 text-sm">
              <span>Họ tên hiển thị</span>
              <Input value={name} onChange={e => setName(e.target.value)} autoComplete="name" maxLength={80} required />
            </label>}
            <label className="block space-y-1.5 text-sm">
              <span>Email</span>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" inputMode="email" required />
            </label>
            {mode !== 'forgot' && <label className="block space-y-1.5 text-sm">
              <span>Mật khẩu</span>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={mode === 'signup' ? 12 : undefined} required />
            </label>}
            {failure && <p role="alert" className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{failure}</p>}
            {feedback && <p role="status" className="rounded-md bg-sky-50 p-3 text-sm text-sky-800">{feedback}</p>}
            <Button type="submit" variant="primary" className="w-full" disabled={busy}
              icon={mode === 'forgot' ? <KeyRound className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}>
              {busy ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : mode === 'signup' ? 'Đăng ký' : 'Gửi email khôi phục'}
            </Button>
          </form>
          <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm">
            {mode !== 'login' && <button type="button" onClick={() => selectMode('login')}
              className="text-teal-700 hover:underline">Đăng nhập</button>}
            {mode !== 'signup' && <button type="button" onClick={() => selectMode('signup')}
              className="text-teal-700 hover:underline">Đăng ký tài khoản</button>}
            {mode !== 'forgot' && <button type="button" onClick={() => selectMode('forgot')}
              className="text-teal-700 hover:underline">Quên mật khẩu?</button>}
          </div>
        </Card>
        <p className="mt-4 text-center text-xs text-slate-300">
          Kế hoạch chăm sóc hiện lưu trên thiết bị của từng tài khoản, không tự đồng bộ giữa các máy.
          Không nhập dữ liệu nhận dạng người bệnh khi chưa có hệ thống lưu trữ được phê duyệt.
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
  return <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
    <Card className="w-full max-w-md p-6">
      <h1 className="mb-4 text-xl font-semibold">Đặt mật khẩu mới</h1>
      <p className="mb-4 text-sm text-slate-600">Bạn đã xác nhận liên kết khôi phục. Hãy đặt mật khẩu mới để tiếp tục.</p>
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
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
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
      <p className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400">
        Ứng dụng hiện đang ở chế độ thiết bị cá nhân. Quản trị viên cần cấu hình VITE_SUPABASE_URL và
        VITE_SUPABASE_ANON_KEY để bật đăng ký, đăng nhập cho mọi người.
      </p>
    </Card>;
  }
  if (!auth.user) return null;
  return <Card>
    <CardHeader title="Tài khoản của tôi" subtitle="Quản lý thông tin đăng nhập" />
    <div className="space-y-5 p-5">
      <div className="flex items-center gap-2 text-sm"><UserRound className="h-4 w-4" />
        <span className="font-medium">{auth.user.email}</span>
      </div>
      <div className="flex items-start gap-2 rounded-md bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        Mỗi tài khoản có dữ liệu kế hoạch riêng trên trình duyệt hiện tại. Chưa có lưu trữ đám mây
        hoặc đồng bộ giữa thiết bị. Không sử dụng để lưu hồ sơ bệnh án thật.
      </div>
      <form className="space-y-3" onSubmit={e => {
        e.preventDefault();
        void action(() => auth.updateName(fullName));
      }}>
        <label className="block space-y-1 text-sm">
          <span>Họ tên hiển thị</span>
          <Input value={fullName} onChange={e => setFullName(e.target.value)} maxLength={80} required />
        </label>
        <Button type="submit" disabled={busy}>Lưu họ tên</Button>
      </form>
      <form className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800" onSubmit={e => {
        e.preventDefault();
        if (newPassword.length < 12) { setError('Mật khẩu phải có ít nhất 12 ký tự.'); return; }
        void action(async () => { await auth.updatePassword(newPassword); setNewPassword(''); });
      }}>
        <label className="block space-y-1 text-sm">
          <span>Đổi mật khẩu</span>
          <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password" minLength={12} required />
        </label>
        <Button type="submit" disabled={busy}>Đổi mật khẩu</Button>
      </form>
      {message && <p role="status" className="text-sm text-teal-700">{message}</p>}
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
        <Button icon={<LogOut className="h-4 w-4" />} variant="danger" onClick={() => void auth.signOut()}>
          Đăng xuất
        </Button>
      </div>
    </div>
  </Card>;
}
