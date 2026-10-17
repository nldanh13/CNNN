import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { cx } from '../lib/utils';
import { IconButton } from './Button';

/** Kiểu chung cho mọi ô nhập. */
export const CONTROL =
  'block w-full rounded-control border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-canvas';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(CONTROL, 'h-10', className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(CONTROL, 'min-h-[80px] resize-y', className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(CONTROL, 'h-10 pr-8', className)} {...props}>
      {children}
    </select>
  );
}

/** Ô tìm kiếm có biểu tượng kính lúp và nút xóa nhanh. */
export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  size = 'md',
  autoFocus,
  id,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'md' | 'lg';
  autoFocus?: boolean;
}) {
  return (
    <div className={cx('relative', className)}>
      <Search className={cx('pointer-events-none absolute top-1/2 -translate-y-1/2 text-fg-subtle', size === 'lg' ? 'left-4 h-5 w-5' : 'left-3 h-4 w-4')} />
      <input
        id={id}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cx(CONTROL, '[&::-webkit-search-cancel-button]:hidden', size === 'lg' ? 'h-12 pl-11 pr-10 text-base' : 'h-10 pl-9 pr-9')}
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Xóa nội dung tìm kiếm" className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-fg-subtle hover:bg-surface-muted hover:text-fg">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function Field({ label, children, className, hint, error }: { label: ReactNode; children: ReactNode; className?: string; hint?: ReactNode; error?: ReactNode }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1.5 block text-xs font-medium text-fg-body">{label}</span>
      {children}
      {error ? <span role="alert" className="mt-1 block text-xs text-danger-600 dark:text-danger-400">{error}</span> : hint && <span className="mt-1 block text-xs text-fg-subtle">{hint}</span>}
    </label>
  );
}

/** Nhóm nút chuyển: chọn một trong vài lựa chọn. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; icon?: ReactNode }[];
  size?: 'sm' | 'md';
}) {
  return (
    <div className="inline-flex rounded-control bg-surface-muted p-1" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'inline-flex items-center gap-1.5 rounded-md font-medium transition',
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
            value === o.value ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg',
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Ô nhập danh sách: gõ rồi nhấn Enter để thêm, nhấn × để xóa. */
export function TagInput({
  values,
  onChange,
  placeholder,
  renderValue,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  renderValue?: (v: string) => ReactNode;
}) {
  const [draft, setDraft] = useState('');
  const commit = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };
  return (
    <div className="space-y-2">
      {values.length > 0 && (
        <ul className="space-y-1.5">
          {values.map((v, i) => (
            <li key={`${v}-${i}`} className="group flex items-start gap-2 rounded-control bg-surface-muted px-3 py-2 text-sm text-fg-body">
              <span className="min-w-0 flex-1">{renderValue ? renderValue(v) : v}</span>
              <button type="button" aria-label="Xóa" onClick={() => onChange(values.filter((_, j) => j !== i))} className="mt-0.5 rounded text-fg-subtle hover:text-danger-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            }
          }}
        />
        <IconButton label="Thêm" onClick={commit} className="h-10 w-10 border border-line">
          <Plus className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
