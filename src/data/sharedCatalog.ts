import type { TaxonomySystem } from '../types';
import pack from '../../shared-data/nnn-catalog.json';

export type TranslationMethod = 'code-dictionary' | 'legacy-name' | 'source-draft' | 'rule-draft';
export interface SharedTerm {
  system: TaxonomySystem;
  code: string;
  label: string;
  labelVi: string;
  domainId?: string;
  classKey?: string;
  sourceLanguage?: string;
  translationMethod?: TranslationMethod;
  translationStatus?: string;
}
export interface OwnerReview {
  status: 'confirmed-by-project-owner';
  recordedAt: string;
  scope: string;
  basis: string;
  note: string;
}
export interface SharedCatalog {
  schema: 'clinicalnnn.shared-catalog/v1';
  revision: string;
  locale: 'vi';
  notes: string;
  editions: { nanda: string; noc: string; nic: string };
  totals: { nanda: number; noc: number; nic: number };
  entries: SharedTerm[];
  /** Project owner review; original source provenance is preserved. */
  ownerReview?: OwnerReview;
}

/** Không ép kiểu một gói private-reference thành danh mục dùng trên web. */
function assertSharedCatalog(value: unknown): asserts value is SharedCatalog {
  if (!value || typeof value !== 'object') throw new Error('Danh mục NNN không hợp lệ.');
  const data = value as Partial<SharedCatalog>;
  if (data.schema !== 'clinicalnnn.shared-catalog/v1'
    || data.locale !== 'vi' || !data.editions || !data.totals || !Array.isArray(data.entries)) {
    throw new Error('Cần danh mục shared-catalog/v1, không phải gói trích xuất sách.');
  }
  if (data.ownerReview && (data.ownerReview.status !== 'confirmed-by-project-owner'
      || !/^\d{4}-\d{2}-\d{2}$/.test(data.ownerReview.recordedAt)
      || !data.ownerReview.scope || !data.ownerReview.basis)) {
    throw new Error('Thiếu nguồn xác nhận kiểm duyệt danh mục.');
  }
  const seen = new Set<string>();
  for (const row of data.entries) {
    if (!row || !['nanda', 'noc', 'nic'].includes(row.system)
      || !/^\d{4,5}$/.test(row.code)
      || typeof row.label !== 'string' || !row.label.trim()
      || typeof row.labelVi !== 'string' || !row.labelVi.trim()
      || 'fullText' in row || 'sections' in row || 'activities' in row || 'indicators' in row) {
      throw new Error('Có mục NNN thiếu nhãn tiếng Việt hoặc chứa nội dung sách không phù hợp.');
    }
    const key = row.system + ':' + row.code;
    if (seen.has(key)) throw new Error('Mã NNN bị trùng: ' + key);
    seen.add(key);
  }
}

assertSharedCatalog(pack);
export const SHARED_CATALOG: SharedCatalog = pack;
/** Project-owner confirmation, not publisher verification. */
export const OWNER_REVIEW = SHARED_CATALOG.ownerReview ?? null;
export const SHARED_VI_LABELS = new Map(
  SHARED_CATALOG.entries.map((item) => [item.system + ':' + item.code, item.labelVi]),
);
export const TRANSLATION_REVIEW = {
  total: SHARED_CATALOG.entries.length,
  draft: SHARED_CATALOG.entries.filter((item) => item.translationStatus?.includes('unreviewed')).length,
  automatic: SHARED_CATALOG.entries.filter((item) => item.translationMethod === 'rule-draft').length,
  missingClass: SHARED_CATALOG.entries.filter((item) =>
    item.system !== 'nic' && (item.domainId?.includes('Unclassified') || item.classKey?.includes('Unclassified'))).length,
};
