/** Kiểm tra hợp lệ cho các ô trong "Thông tin người bệnh". */

export type NameError = 'nameRequired' | 'nameInvalid';
export type MeasureError = 'notNumber' | 'notInteger' | 'outOfRange';

/** Họ tên phải có chữ cái; chỉ cho phép chữ, khoảng trắng và dấu . ' - (để nhập tên viết tắt như "N.V.A"). */
export function validateName(raw: string): NameError | null {
  const s = raw.trim();
  if (!s) return 'nameRequired';
  if (!/\p{L}/u.test(s) || !/^[\p{L}\p{M}\s.'-]+$/u.test(s)) return 'nameInvalid';
  return null;
}

export interface MeasureRule {
  min: number;
  max: number;
  integer?: boolean;
}

export const AGE_RULE: MeasureRule = { min: 0, max: 130, integer: true };
export const HEIGHT_RULE: MeasureRule = { min: 30, max: 250 };
export const WEIGHT_RULE: MeasureRule = { min: 0.5, max: 350 };

/** Đọc một số đo từ chuỗi người dùng nhập. Ô trống là hợp lệ (chưa có số liệu). */
export function parseMeasure(raw: string, rule: MeasureRule): { value: number | null; error: MeasureError | null } {
  const s = raw.trim().replace(',', '.');
  if (!s) return { value: null, error: null };
  if (!/^\d+(\.\d+)?$/.test(s)) return { value: null, error: 'notNumber' };
  const n = Number(s);
  if (rule.integer && !Number.isInteger(n)) return { value: null, error: 'notInteger' };
  if (n < rule.min || n > rule.max) return { value: null, error: 'outOfRange' };
  return { value: n, error: null };
}
