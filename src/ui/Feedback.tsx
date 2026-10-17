import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { cx } from '../lib/utils';
import { TONE_ICON, TONE_PANEL, TONE_SOFT, TONE_SOLID, type Tone } from './tone';

export function Badge({ tone = 'neutral', children, className, title }: { tone?: Tone; children: ReactNode; className?: string; title?: string }) {
  return (
    <span title={title} className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium', TONE_SOFT[tone], className)}>
      {children}
    </span>
  );
}

const ALERT_ICON: Partial<Record<Tone, ReactNode>> = {
  info: <Info className="h-4 w-4" />,
  primary: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  danger: <ShieldAlert className="h-4 w-4" />,
};

/** Khung thông báo: lưu ý, cảnh báo, thông tin. Dùng thay cho mọi hộp màu tự chế. */
export function Alert({
  tone = 'info',
  title,
  children,
  icon,
  size = 'md',
  className,
  role,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode | false;
  size?: 'sm' | 'md';
  className?: string;
  role?: string;
}) {
  const shownIcon = icon === false ? null : icon ?? ALERT_ICON[tone];
  return (
    <div role={role} className={cx('flex items-start gap-2.5 rounded-control border leading-relaxed', size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm', TONE_PANEL[tone], className)}>
      {shownIcon && <span className={cx('mt-0.5 shrink-0', TONE_ICON[tone])}>{shownIcon}</span>}
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({ value, tone = 'primary' }: { value: number; tone?: Tone }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
      <div className={cx('h-full rounded-full transition-all', TONE_SOLID[tone])} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-line bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-fg-muted">{children}</kbd>;
}

/** Thẻ chọn hình viên thuốc: dấu hiệu, bộ lọc, gợi ý thêm. */
export function Chip({
  selected,
  variant = 'toggle',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; variant?: 'toggle' | 'solid' | 'add' }) {
  return (
    <button
      type="button"
      aria-pressed={variant === 'toggle' ? !!selected : undefined}
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-left text-xs font-medium transition disabled:cursor-default disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
        variant === 'solid' && 'bg-primary-600 text-white hover:bg-primary-700',
        variant === 'add' && 'border border-dashed border-ink-300 text-fg-body hover:border-primary-500 hover:text-primary-700 dark:border-ink-600',
        variant === 'toggle' &&
          (selected
            ? 'border border-primary-600 bg-primary-50 text-primary-800 dark:bg-primary-500/15 dark:text-primary-200'
            : 'border border-line text-fg-body hover:border-ink-300 hover:bg-surface-muted'),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Nhãn nhỏ viết hoa phía trên một nhóm nội dung. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle', className)}>{children}</p>;
}
