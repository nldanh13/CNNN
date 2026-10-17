import type { ReactNode } from 'react';
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
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
      <div className={cx('h-full rounded-full transition-all', TONE_SOLID[tone])} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-line bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-fg-muted">{children}</kbd>;
}
