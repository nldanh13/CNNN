import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cx } from '../lib/utils';

/** Bảng dữ liệu: cuộn ngang trên màn hình hẹp, hàng có viền mảnh. */
export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cx('w-full text-sm', className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-line-soft bg-surface-muted/60 text-left text-xs font-medium text-fg-muted">{children}</tr>
    </thead>
  );
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cx('px-4 py-2.5 font-medium first:pl-5 last:pr-5', className)} {...props} />;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-line-soft">{children}</tbody>;
}

export function Tr({ className, interactive, ...props }: HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return <tr className={cx(interactive && 'group cursor-pointer transition hover:bg-surface-muted', className)} {...props} />;
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cx('px-4 py-3 align-top first:pl-5 last:pr-5', className)} {...props} />;
}

/** Ô số liệu ngắn: con số lớn và nhãn nhỏ. */
export function Stat({ label, value, hint, tone = 'default' }: { label: ReactNode; value: ReactNode; hint?: ReactNode; tone?: 'default' | 'primary' | 'warning' | 'success' }) {
  const color = { default: 'text-fg', primary: 'text-primary-700 dark:text-primary-300', warning: 'text-warning-700 dark:text-warning-300', success: 'text-success-700 dark:text-success-300' }[tone];
  return (
    <div className="rounded-card border border-line bg-surface px-4 py-3 shadow-card">
      <p className="text-xs font-medium text-fg-muted">{label}</p>
      <p className={cx('mt-1 font-display text-2xl font-medium tabular-nums', color)}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-fg-subtle">{hint}</p>}
    </div>
  );
}

/** Danh sách nhãn – giá trị (thông tin chi tiết). */
export function DescriptionList({ items, className }: { items: [ReactNode, ReactNode][]; className?: string }) {
  return (
    <dl className={cx('space-y-3 text-sm', className)}>
      {items.map(([label, value], i) => (
        <div key={i}>
          <dt className="text-xs font-medium text-fg-muted">{label}</dt>
          <dd className="mt-0.5 text-fg-body">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Một hàng cài đặt: nhãn và mô tả bên trái, điều khiển bên phải. */
export function SettingRow({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-fg">{label}</p>
        {hint && <p className="text-xs text-fg-muted">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
