import type { MouseEvent, ReactNode } from 'react';
import {
  ArrowRight, BookOpen, CheckCircle2, ClipboardList, FileCheck2, HandHeart, Lock,
  Printer, ShieldCheck, Sparkles, Stethoscope, Target, UserRoundCheck,
} from 'lucide-react';
import { dataHub } from '../data/dataHub';
import { BrandLogo, BrandMark, LinkButton } from '../ui';
import type { TaxonomySystem } from '../types';

/** Trang giới thiệu: người chưa đăng nhập thấy trang này trước, rồi mới chọn Đăng nhập hoặc Tạo tài khoản. */

const SYSTEMS: { system: TaxonomySystem; label: string; subtitle: string; icon: ReactNode; tone: string }[] = [
  { system: 'nanda', label: 'NANDA-I', subtitle: 'Chẩn đoán điều dưỡng', icon: <Stethoscope className="h-5 w-5" />, tone: 'bg-danger-50 text-danger-600 dark:bg-danger-500/15 dark:text-danger-300' },
  { system: 'noc', label: 'NOC', subtitle: 'Kết quả chăm sóc', icon: <Target className="h-5 w-5" />, tone: 'bg-info-50 text-info-600 dark:bg-info-500/15 dark:text-info-300' },
  { system: 'nic', label: 'NIC', subtitle: 'Can thiệp điều dưỡng', icon: <HandHeart className="h-5 w-5" />, tone: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300' },
];

const FEATURES: { icon: ReactNode; title: string; text: string }[] = [
  { icon: <BookOpen className="h-5 w-5" />, title: 'Thư viện số NNN', text: 'Tra cứu chẩn đoán NANDA-I, kết quả NOC và can thiệp NIC bằng tiếng Việt, theo tên hoặc theo mã.' },
  { icon: <Sparkles className="h-5 w-5" />, title: 'Trợ lý chẩn đoán', text: 'Nhập dữ kiện đánh giá người bệnh, nhận gợi ý chẩn đoán kèm đặc điểm xác định và yếu tố liên quan.' },
  { icon: <ClipboardList className="h-5 w-5" />, title: 'Kế hoạch chăm sóc', text: 'Liên kết chẩn đoán với kết quả mong đợi và can thiệp, chấm thang đo NOC trước và sau chăm sóc.' },
  { icon: <Printer className="h-5 w-5" />, title: 'In và lưu trữ', text: 'Xuất kế hoạch thành bản in gọn gàng để nộp bài hoặc bàn giao, sao lưu theo tài khoản của bạn.' },
];

const STEPS: { title: string; text: string }[] = [
  { title: 'Đánh giá', text: 'Ghi nhận dữ kiện chủ quan và khách quan của người bệnh.' },
  { title: 'Chẩn đoán', text: 'Chọn chẩn đoán NANDA-I phù hợp với sự hỗ trợ của trợ lý.' },
  { title: 'Lập kế hoạch', text: 'Đặt mục tiêu NOC, chọn can thiệp NIC và theo dõi kết quả.' },
];

const anchor = 'text-sm font-medium text-fg-body transition hover:text-fg';

export function LandingPage() {
  const total = SYSTEMS.reduce((n, s) => n + dataHub.listLibrary(s.system).length, 0);
  return (
    <div className="min-h-screen bg-canvas text-fg-body">
      <header className="sticky top-0 z-20 border-b border-line-soft bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <BrandLogo href="#/" />
          <nav aria-label="Giới thiệu" className="ml-4 hidden items-center gap-6 md:flex">
            <a href="#/gioi-thieu" onClick={e => scrollTo(e, 'tinh-nang')} className={anchor}>Tính năng</a>
            <a href="#/gioi-thieu" onClick={e => scrollTo(e, 'quy-trinh')} className={anchor}>Quy trình</a>
            <a href="#/gioi-thieu" onClick={e => scrollTo(e, 'nguon-du-lieu')} className={anchor}>Nguồn dữ liệu</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LinkButton href="#/dang-nhap" variant="ghost" className="hidden sm:inline-flex">Đăng nhập</LinkButton>
            <LinkButton href="#/dang-ky" variant="primary">Tạo tài khoản</LinkButton>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-200">
              <UserRoundCheck className="h-3.5 w-3.5" /> Dành cho sinh viên và điều dưỡng lâm sàng
            </p>
            <h1 className="mt-5 text-balance font-sans text-[2.25rem] font-bold leading-[1.12] tracking-[-0.02em] text-fg sm:text-[2.75rem]">
              Lập kế hoạch chăm sóc điều dưỡng theo chuẩn <span className="text-primary-700 dark:text-primary-300">NANDA-I, NOC, NIC</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
              Tra cứu, chẩn đoán và xây dựng kế hoạch chăm sóc hoàn chỉnh bằng tiếng Việt, trên một nền tảng thống nhất.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="#/dang-ky" variant="primary" size="lg" className="sm:px-6">
                Tạo tài khoản <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="#/dang-nhap" variant="secondary" size="lg" className="sm:px-6">Tôi đã có tài khoản</LinkButton>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-muted">
              {['Dữ liệu tách riêng theo tài khoản', 'Giao diện tiếng Việt', 'Dùng tốt trên điện thoại'].map(text => (
                <li key={text} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary-600 dark:text-primary-300" />{text}</li>
              ))}
            </ul>
          </div>
          <ProductPreview />
        </section>

        <section aria-label="Quy mô dữ liệu" className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 sm:px-6 md:grid-cols-4">
            <Stat value={total.toLocaleString('vi-VN')} label="Mã chuẩn hóa" />
            {SYSTEMS.map(s => <Stat key={s.system} value={String(dataHub.listLibrary(s.system).length)} label={`${s.label} · ${s.subtitle}`} />)}
          </div>
        </section>

        <section id="tinh-nang" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24">
          <SectionTitle eyebrow="Tính năng" title="Mọi bước của quy trình điều dưỡng ở một nơi" text="Từ tra cứu thuật ngữ đến bản kế hoạch hoàn chỉnh, không phải chuyển qua lại giữa sách, tệp và ghi chú." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-card border border-line bg-surface p-6 shadow-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-control bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">{f.icon}</span>
                <h3 className="mt-4 text-base font-semibold text-fg">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="quy-trinh" className="scroll-mt-20 border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <SectionTitle eyebrow="Quy trình" title="Ba bước, đúng trình tự NNN" text="Ứng dụng đi theo đúng trình tự bạn đã học: đánh giá, chẩn đoán, rồi lập kế hoạch và đánh giá kết quả." />
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative rounded-card border border-line bg-canvas p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-700 text-sm font-bold text-white">{i + 1}</span>
                  <h3 className="mt-4 text-base font-semibold text-fg">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="nguon-du-lieu" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionTitle eyebrow="Nguồn dữ liệu" title="Dựa trên ấn bản chính thức" text="Danh mục được đối chiếu theo từng ấn bản và ghi rõ nguồn ngay trong ứng dụng." align="left" />
              <ul className="mt-8 divide-y divide-line-soft rounded-card border border-line bg-surface">
                {SYSTEMS.map(s => (
                  <li key={s.system} className="flex items-center gap-4 px-5 py-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${s.tone}`}>{s.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-fg">{s.label}</span>
                      <span className="block text-xs text-fg-muted">{dataHub.editionFor(s.system)}</span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-fg">{dataHub.listLibrary(s.system).length} mã</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionTitle eyebrow="Bảo mật" title="Tài khoản riêng, dữ liệu riêng" text="Mỗi người dùng có không gian làm việc tách biệt." align="left" />
              <ul className="mt-8 space-y-4">
                <Trust icon={<Lock className="h-5 w-5" />} title="Đăng nhập an toàn" text="Mật khẩu tối thiểu 12 ký tự, có xác minh chống truy cập tự động." />
                <Trust icon={<ShieldCheck className="h-5 w-5" />} title="Tách biệt theo tài khoản" text="Kế hoạch của bạn chỉ bạn xem được, không chia sẻ với người dùng khác." />
                <Trust icon={<FileCheck2 className="h-5 w-5" />} title="Không cần dữ liệu người bệnh thật" text="Dùng tên viết tắt hoặc mã ca bệnh khi luyện tập và lập kế hoạch." />
              </ul>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:pb-24">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-card bg-primary-800 px-6 py-10 text-white sm:px-10 md:flex-row md:items-center md:justify-between dark:bg-primary-900">
            <div>
              <h2 className="font-sans text-2xl font-bold tracking-[-0.01em] sm:text-3xl">Sẵn sàng lập kế hoạch đầu tiên?</h2>
              <p className="mt-2 text-primary-100">Chỉ cần email và mật khẩu để bắt đầu.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#/dang-ky" className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-white px-6 font-semibold text-primary-800 shadow-button transition hover:bg-primary-50">
                Tạo tài khoản <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#/dang-nhap" className="inline-flex h-12 items-center justify-center rounded-control border border-white/30 px-6 font-semibold text-white transition hover:bg-white/10">
                Đăng nhập
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-xs text-fg-muted sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <BrandMark className="h-8 w-8" />
            <span>© {new Date().getFullYear()} Điều dưỡng NNN</span>
          </div>
          <p className="max-w-xl leading-relaxed md:text-right">
            Công cụ hỗ trợ học tập và tham khảo. Không thay thế đánh giá lâm sàng, y lệnh hay quy trình của cơ sở y tế.
            NANDA-I, NOC và NIC là tên của các bảng phân loại thuộc chủ sở hữu tương ứng.
          </p>
        </div>
      </footer>
    </div>
  );
}

function scrollTo(event: MouseEvent, id: string) {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function SectionTitle({ eyebrow, title, text, align = 'center' }: { eyebrow: string; title: string; text: string; align?: 'center' | 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700 dark:text-primary-300">{eyebrow}</p>
      <h2 className="mt-3 text-balance font-sans text-[1.75rem] font-bold leading-tight tracking-[-0.015em] text-fg sm:text-[2rem]">{title}</h2>
      <p className="mt-3 text-base leading-relaxed text-fg-muted">{text}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2 py-7 text-center">
      <div className="font-sans text-3xl font-bold tabular-nums tracking-[-0.02em] text-fg">{value}</div>
      <div className="mt-1 text-xs text-fg-muted sm:text-sm">{label}</div>
    </div>
  );
}

function Trust({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <li className="flex gap-4 rounded-card border border-line bg-surface p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">{icon}</span>
      <span>
        <span className="block text-sm font-semibold text-fg">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-fg-muted">{text}</span>
      </span>
    </li>
  );
}

/** Ảnh minh họa dựng bằng HTML: một kế hoạch chăm sóc mẫu, để người xem hình dung sản phẩm. */
function ProductPreview() {
  const row = (code: string, label: string, tone: string, tag: string) => (
    <div className="flex items-center gap-3 rounded-control border border-line-soft bg-canvas px-3 py-2.5">
      <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${tone}`}>{tag} {code}</span>
      <span className="min-w-0 flex-1 truncate text-sm text-fg">{label}</span>
    </div>
  );
  return (
    <div aria-hidden="true" className="relative">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary-100/60 blur-2xl dark:bg-primary-500/10" />
      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-raised">
        <div className="flex items-center gap-2 border-b border-line-soft px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200 dark:bg-ink-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200 dark:bg-ink-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200 dark:bg-ink-700" />
          <span className="ml-3 text-xs font-medium text-fg-muted">Kế hoạch chăm sóc · Ca bệnh A.T.</span>
        </div>
        <div className="space-y-5 p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-muted">Chẩn đoán</p>
            <div className="mt-2">{row('00032', 'Kiểu thở không hiệu quả', 'bg-danger-50 text-danger-700 dark:bg-danger-500/15 dark:text-danger-300', 'NANDA')}</div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-muted">Kết quả mong đợi</p>
            <div className="mt-2 rounded-control border border-line-soft bg-canvas px-3 py-2.5">
              <div className="flex items-center gap-3">
                <span className="rounded bg-info-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-info-700 dark:bg-info-500/15 dark:text-info-300">NOC 0415</span>
                <span className="min-w-0 flex-1 truncate text-sm text-fg">Tình trạng hô hấp</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-fg-muted">
                <span className="w-14 shrink-0">Hiện tại</span>
                <span className="h-1.5 flex-1 rounded-full bg-ink-100 dark:bg-ink-800"><span className="block h-full w-2/5 rounded-full bg-warning-500" /></span>
                <span className="w-4 text-right font-semibold text-fg">2</span>
              </div>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-fg-muted">
                <span className="w-14 shrink-0">Mục tiêu</span>
                <span className="h-1.5 flex-1 rounded-full bg-ink-100 dark:bg-ink-800"><span className="block h-full w-4/5 rounded-full bg-primary-500" /></span>
                <span className="w-4 text-right font-semibold text-fg">4</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-muted">Can thiệp</p>
            <div className="mt-2 space-y-2">
              {row('3350', 'Theo dõi hô hấp', 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300', 'NIC')}
              {row('3320', 'Liệu pháp oxy', 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300', 'NIC')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
