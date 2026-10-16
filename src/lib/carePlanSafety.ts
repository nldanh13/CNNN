import type { CareEntry } from '../types';
import { NANDA_ITEMS, NOC_ITEMS, NIC_ITEMS } from '../data/taxonomy';
import { NOC_SCALES } from '../data/reference';
import { NIC7_LEGACY_LABELS } from '../data/nicMigration';

export type TermChoice = { code: string; label: string };
export type IssueLang = 'vi' | 'en';
const messages = {
  vi: {
    nanda: 'Chẩn đoán NANDA-I không tồn tại hoặc sai mã/nhãn.',
    noc: 'Kết quả NOC không tồn tại hoặc sai mã/nhãn.',
    nic: 'Cần chọn ít nhất một can thiệp NIC hợp lệ.',
    duplicate: 'Can thiệp NIC bị trùng.',
    scale: 'Cần chọn thang đo NOC và đối chiếu đúng kết quả trong sách.',
    score: 'Điểm NOC phải là số nguyên từ 1 đến 5.',
    indicator: 'Chỉ số NOC cần có mã và tên, không được trùng mã.',
  },
  en: {
    nanda: 'NANDA-I code/label does not match the catalog.',
    noc: 'NOC code/label does not match the catalog.',
    nic: 'Select at least one valid NIC intervention.',
    duplicate: 'Duplicate NIC intervention.',
    scale: 'Choose a NOC scale and verify it against the source book.',
    score: 'NOC ratings must be integers from 1 through 5.',
    indicator: 'NOC indicators require unique codes and labels.',
  },
};
const validScore = (v: number | null) => v === null || (Number.isInteger(v) && v >= 1 && v <= 5);

/** Technical validation; clinical linkage and indicator provenance still require human review. */
export function validateCareEntry(entry: CareEntry, lang: IssueLang = 'vi'): string[] {
  const errors: string[] = [];
  const m = messages[lang];
  if (!NANDA_ITEMS.some((x) => x.code === entry.nanda.code && x.label === entry.nanda.label)) errors.push(m.nanda);
  if (!NOC_ITEMS.some((x) => x.code === entry.noc.code && x.label === entry.noc.label)) errors.push(m.noc);
  // NIC 8 là danh mục duy nhất cho kế hoạch mới. Bí danh NIC 7 chỉ hợp lệ
  // khi chúng đã được ghi trong kế hoạch cũ; không xuất hiện trong bộ chọn.
  if (entry.nic.length === 0 || entry.nic.some(n =>
    !NIC_ITEMS.some(x => x.code === n.code && x.label === n.label) &&
    NIC7_LEGACY_LABELS[n.code] !== n.label
  )) errors.push(m.nic);
  if (new Set(entry.nic.map((n) => n.code)).size !== entry.nic.length) errors.push(m.duplicate);
  if (!NOC_SCALES.some((x) => x.code === entry.noc.scaleCode)) errors.push(m.scale);
  if (![entry.noc.baseline, entry.noc.target, entry.noc.current, ...entry.noc.indicators.map((x) => x.score)].every(validScore)) errors.push(m.score);
  const codes = entry.noc.indicators.map((x) => x.code.trim());
  if (entry.noc.indicators.some((x) => !x.code.trim() || !x.name.trim() || (x.scaleCode && !NOC_SCALES.some((s) => s.code === x.scaleCode))) || new Set(codes).size !== codes.length) errors.push(m.indicator);
  return errors;
}

/** Explicitly discard clinical observations and goals tied to the previous diagnosis. */
export function resetEntryForDiagnosisChange(entry: CareEntry, term: TermChoice): CareEntry {
  if (entry.nanda.code === term.code && entry.nanda.label === term.label) return entry;
  return { ...entry, status: 'active', nanda: term, definingCharacteristics: [], relatedFactors: [],
    noc: { code: '', label: '', scaleCode: '', baseline: 1, target: 5, current: null, indicators: [], assessments: [] },
    nic: [], notes: '' };
}

/** A new NOC outcome cannot inherit another outcome's scale, ratings or indicators. */
export function resetNocOnChange(noc: CareEntry['noc'], term: TermChoice): CareEntry['noc'] {
  if (noc.code === term.code && noc.label === term.label) return noc;
  return { code: term.code, label: term.label, scaleCode: '', baseline: 1, target: 5, current: null, indicators: [], assessments: [] };
}
