import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cx } from '../lib/utils';
import { IconButton } from './Button';

function useEscape(onClose: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, active]);
}

const BACKDROP = 'absolute inset-0 animate-fade bg-ink-950/40 backdrop-blur-[2px]';

/** Ngăn kéo bên phải: biểu mẫu dài. */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-2xl',
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  useEscape(onClose, open);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className={BACKDROP} onClick={onClose} />
      <aside role="dialog" aria-modal="true" className={cx('relative flex h-full w-full animate-slide flex-col bg-surface shadow-2xl', width)}>
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-fg">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-fg-muted">{subtitle}</p>}
          </div>
          <IconButton label="Đóng" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 border-t border-line bg-surface-muted px-6 py-3">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  );
}

/** Hộp thoại giữa màn hình: lựa chọn nhanh, xác nhận. */
export function Modal({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  useEscape(onClose, open);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]">
      <div className={BACKDROP} onClick={onClose} />
      <div role="dialog" aria-modal="true" className={cx('relative w-full max-w-xl animate-pop overflow-hidden rounded-card border border-line bg-surface shadow-2xl', className)}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
