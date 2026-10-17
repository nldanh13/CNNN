import type { HTMLAttributes, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cx } from '../lib/utils';

/** Thẻ: khối nội dung chính của mọi trang. */
export function Card({ className, children, ...props }: { className?: string; children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('rounded-card border border-line bg-surface shadow-card', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions, icon }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-soft px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        {icon && <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">{icon}</div>}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-fg">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Phần thân thẻ với khoảng đệm chuẩn. */
export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('px-5 py-4', className)}>{children}</div>;
}

/** Tiêu đề trang: một dòng tiêu đề, một câu mô tả, các nút thao tác bên phải. */
export function PageHeader({ title, subtitle, actions, breadcrumb, icon }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; breadcrumb?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-fg">
          {icon && <span className="text-primary-600 dark:text-primary-400">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-fg-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Tiêu đề nhóm nội dung bên trong trang. */
export function SectionTitle({ children, actions, className }: { children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <div className={cx('mb-3 flex flex-wrap items-end justify-between gap-3', className)}>
      <h2 className="text-base font-semibold text-fg">{children}</h2>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, action }: { icon: ReactNode; title: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-500/15 dark:text-primary-300">{icon}</div>
      <p className="max-w-sm text-sm leading-relaxed text-fg-muted">{title}</p>
      {action}
    </div>
  );
}

/** Khối thu gọn/mở rộng dùng cho phần hướng dẫn phụ. */
export function Disclosure({ summary, children, className, defaultOpen }: { summary: ReactNode; children: ReactNode; className?: string; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className={cx('group rounded-card border border-line bg-surface px-5 py-3 shadow-card', className)}>
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-fg [&::-webkit-details-marker]:hidden">
        <ChevronRight className="h-4 w-4 shrink-0 text-fg-subtle transition-transform group-open:rotate-90" />
        {summary}
      </summary>
      <div className="pt-4">{children}</div>
    </details>
  );
}

/** Dãy bước đánh số: dùng cho mọi quy trình (Trợ lý, Hướng dẫn, Kế hoạch). */
export function Steps({ steps, columns = 3 }: { steps: { title: ReactNode; text: ReactNode; icon?: ReactNode }[]; columns?: 3 | 5 }) {
  return (
    <ol className={cx('grid gap-2', columns === 5 ? 'sm:grid-cols-2 lg:grid-cols-5' : 'sm:grid-cols-3')}>
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-3 rounded-control border border-line bg-surface p-3 text-xs">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">{i + 1}</span>
          <span className="min-w-0">
            <strong className="flex items-center gap-1.5 text-sm text-fg">
              {s.icon && <span className="text-primary-600 dark:text-primary-400">{s.icon}</span>}
              {s.title}
            </strong>
            <span className="mt-0.5 block leading-relaxed text-fg-muted">{s.text}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
