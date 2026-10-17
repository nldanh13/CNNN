import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex shrink-0 items-center justify-center rounded-control font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-55';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800',
  secondary: 'border border-line bg-surface text-fg-body shadow-sm hover:border-ink-300 hover:bg-surface-muted dark:hover:border-ink-600',
  ghost: 'text-fg-body hover:bg-surface-muted hover:text-fg',
  danger: 'text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-500/10',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-2.5 text-xs',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-5 text-base',
};

/** Lớp CSS của nút, dùng khi cần một liên kết <a> trông như nút. */
export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', className?: string) {
  return cx(BASE, VARIANTS[variant], SIZES[size], className);
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode }) {
  return (
    <button type="button" className={buttonClass(variant, size, className)} {...props}>
      {icon}
      {children}
    </button>
  );
}

export function LinkButton({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode }) {
  return (
    <a className={buttonClass(variant, size, className)} {...props}>
      {icon}
      {children}
    </a>
  );
}

export function IconButton({
  label,
  className,
  children,
  tone = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: 'default' | 'danger' }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cx(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 disabled:pointer-events-none disabled:opacity-30',
        tone === 'danger'
          ? 'text-fg-subtle hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10'
          : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Liên kết dạng chữ (đổi chế độ, mở trang phụ). */
export function TextLink({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cx('text-sm font-medium text-primary-700 underline-offset-2 hover:underline dark:text-primary-300', className)} {...props}>
      {children}
    </button>
  );
}
