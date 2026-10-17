import type { ReactNode } from 'react';
import {
  ArrowRight, BookOpen, CheckCircle2, ClipboardList, Printer, Sparkles, UserRoundCheck,
} from 'lucide-react';
import { BrandLogo, BrandMark, LinkButton } from '../ui';

/** Trang giới thiệu: người chưa đăng nhập thấy trang này trước, rồi mới chọn Đăng nhập hoặc Tạo tài khoản. */

const FEATURES: { icon: ReactNode; title: string; text: string }[] = [
  { icon: <BookOpen className="h-5 w-5" />, title: 'Thư viện NNN', text: '1.431 mã NANDA-I, NOC, NIC tiếng Việt' },
  { icon: <Sparkles className="h-5 w-5" />, title: 'Trợ lý chẩn đoán', text: 'Gợi ý chẩn đoán từ dữ kiện đánh giá' },
  { icon: <ClipboardList className="h-5 w-5" />, title: 'Kế hoạch chăm sóc', text: 'Mục tiêu NOC, can thiệp NIC, thang đo' },
  { icon: <Printer className="h-5 w-5" />, title: 'In và lưu trữ', text: 'Bản in gọn, lưu theo tài khoản' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-fg-body">
      <header className="sticky top-0 z-20 border-b border-line-soft bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <BrandLogo href="#/" />
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

        <section aria-label="Tính năng" className="border-t border-line bg-surface">
          <ul className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {FEATURES.map(f => (
              <li key={f.title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">{f.icon}</span>
                <span>
                  <span className="block text-sm font-semibold text-fg">{f.title}</span>
                  <span className="mt-0.5 block text-sm text-fg-muted">{f.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-line">
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
