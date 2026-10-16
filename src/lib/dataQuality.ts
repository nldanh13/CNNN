import { DECLARED_TOTALS, NANDA_BY_CODE, NANDA_ITEMS, NIC_ITEMS, NOC_BY_CODE, NOC_ITEMS, NIC_BY_CODE } from '../data/taxonomy';
import { NANDA_LABEL_MAPPINGS, NANDA_RETIRED_DIAGNOSES } from '../data/reference';
import type { TaxonomySystem } from '../types';

export interface CountCheck {
  system: TaxonomySystem;
  declared: number;
  actual: number;
}

export interface DuplicateCode {
  system: TaxonomySystem;
  code: string;
  labels: string[];
}

export interface MappingIssue {
  code: string;
  mappingLabel: string;
  taxonomyLabels: string[];
}

export interface DataQualityReport {
  counts: CountCheck[];
  duplicates: DuplicateCode[];
  mappingMissing: MappingIssue[];
  mappingMismatch: MappingIssue[];
  retiredStillActive: MappingIssue[];
  issueCount: number;
}

function duplicatesIn(system: TaxonomySystem, index: Map<string, { label: string }[]>): DuplicateCode[] {
  return [...index.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([code, list]) => ({ system, code, labels: list.map((i) => i.label) }));
}

function buildReport(): DataQualityReport {
  const counts: CountCheck[] = [
    { system: 'nanda', declared: DECLARED_TOTALS.nanda, actual: NANDA_ITEMS.length },
    { system: 'noc', declared: DECLARED_TOTALS.noc, actual: NOC_ITEMS.length },
    { system: 'nic', declared: DECLARED_TOTALS.nic, actual: NIC_ITEMS.length },
  ];

  const duplicates = [
    ...duplicatesIn('nanda', NANDA_BY_CODE),
    ...duplicatesIn('noc', NOC_BY_CODE),
    ...duplicatesIn('nic', NIC_BY_CODE),
  ];

  const mappingMissing: MappingIssue[] = [];
  const mappingMismatch: MappingIssue[] = [];
  for (const m of NANDA_LABEL_MAPPINGS) {
    const list = NANDA_BY_CODE.get(m.new_code);
    if (!list) {
      mappingMissing.push({ code: m.new_code, mappingLabel: m.new_label_2024_2026, taxonomyLabels: [] });
    } else if (!list.some((i) => i.label.toLowerCase() === m.new_label_2024_2026.toLowerCase())) {
      mappingMismatch.push({ code: m.new_code, mappingLabel: m.new_label_2024_2026, taxonomyLabels: list.map((i) => i.label) });
    }
  }

  const retiredStillActive: MappingIssue[] = NANDA_RETIRED_DIAGNOSES.filter((r) => NANDA_BY_CODE.has(r.retired_code)).map((r) => ({
    code: r.retired_code,
    mappingLabel: r.retired_label,
    taxonomyLabels: (NANDA_BY_CODE.get(r.retired_code) ?? []).map((i) => i.label),
  }));

  const issueCount =
    counts.filter((c) => c.declared !== c.actual).length +
    duplicates.length +
    mappingMissing.length +
    mappingMismatch.length +
    retiredStillActive.length;

  return { counts, duplicates, mappingMissing, mappingMismatch, retiredStillActive, issueCount };
}

export const DATA_QUALITY = buildReport();

/** Các mã NANDA bị trùng, dùng để hiển thị cảnh báo trong thư viện. */
export const DUPLICATE_NANDA_CODES = new Set(DATA_QUALITY.duplicates.filter((d) => d.system === 'nanda').map((d) => d.code));
