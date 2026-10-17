/** Sáu sắc thái dùng chung cho nhãn, thông báo, thanh tiến độ. */
export type Tone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

/** Nền nhạt + chữ đậm: dùng cho nhãn (Badge). */
export const TONE_SOFT: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-300',
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
  info: 'bg-info-50 text-info-700 dark:bg-info-500/15 dark:text-info-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300',
  warning: 'bg-warning-50 text-warning-800 dark:bg-warning-500/15 dark:text-warning-300',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-500/15 dark:text-danger-300',
};

/** Khung thông báo (Alert): viền + nền nhạt + chữ. */
export const TONE_PANEL: Record<Tone, string> = {
  neutral: 'border-line bg-surface-muted text-ink-700 dark:text-ink-300',
  primary: 'border-primary-200 bg-primary-50 text-primary-900 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-100',
  info: 'border-info-200 bg-info-50 text-info-900 dark:border-info-500/30 dark:bg-info-500/10 dark:text-info-100',
  success: 'border-success-200 bg-success-50 text-success-900 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-100',
  warning: 'border-warning-200 bg-warning-50 text-warning-900 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-100',
  danger: 'border-danger-200 bg-danger-50 text-danger-900 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-100',
};

/** Màu đặc: thanh tiến độ, chấm trạng thái. */
export const TONE_SOLID: Record<Tone, string> = {
  neutral: 'bg-ink-400',
  primary: 'bg-primary-500',
  info: 'bg-info-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
};

/** Màu biểu tượng trong khung thông báo. */
export const TONE_ICON: Record<Tone, string> = {
  neutral: 'text-ink-500',
  primary: 'text-primary-600 dark:text-primary-400',
  info: 'text-info-600 dark:text-info-400',
  success: 'text-success-600 dark:text-success-400',
  warning: 'text-warning-600 dark:text-warning-400',
  danger: 'text-danger-600 dark:text-danger-400',
};
