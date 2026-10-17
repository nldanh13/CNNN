import { cx } from '../lib/utils';

/**
 * Biểu trưng CNNN: dùng chung cho trang giới thiệu, đăng nhập và khung ứng dụng
 * để người dùng luôn thấy cùng một nhận diện.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cx('flex shrink-0 items-center justify-center rounded-control bg-primary-700 text-white shadow-button', className ?? 'h-10 w-10')}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[58%] w-[58%]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3.5h6v5.5h5.5v6H15v5.5H9V15H3.5V9H9z" />
        <path d="M7 12h2.5l1.25-2.5 2.5 5L14.5 12H17" strokeWidth="1.6" />
      </svg>
    </span>
  );
}

export function BrandLogo({ compact = false, inverted = false, href = '#/home' }: { compact?: boolean; inverted?: boolean; href?: string }) {
  return (
    <a href={href} className="flex min-w-0 items-center gap-3 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50">
      <BrandMark />
      <span className="min-w-0 leading-tight">
        <span className={cx('block truncate text-[16px] font-bold tracking-[-0.01em]', inverted ? 'text-white' : 'text-fg')}>Điều dưỡng NNN</span>
        {!compact && <span className={cx('mt-0.5 block text-[11px] font-medium', inverted ? 'text-primary-200' : 'text-fg-muted')}>NANDA-I · NOC · NIC</span>}
      </span>
    </a>
  );
}
