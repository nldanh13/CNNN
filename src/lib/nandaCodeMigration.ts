import type { CarePlan } from '../types';

/**
 * Mã hiệu đính theo NANDA-I 2024–2026 (ấn bản 13).
 * `page` là số trang PDF trong tài liệu Nanda.pdf của dự án.
 * Phải so cả mã cũ lẫn tên tiếng Anh để tránh sửa nhầm chẩn đoán cùng mã.
 */
export const NANDA_CODE_FIXES = [
  {
    "label": "Risk for decreased diversional activity engagement",
    "oldCode": "00404",
    "newCode": "00448",
    "page": 241
  },
  {
    "label": "Readiness for enhanced nutritional intake",
    "oldCode": "00163",
    "newCode": "00419",
    "page": 335
  },
  {
    "label": "Risk for ineffective chestfeeding",
    "oldCode": "00408",
    "newCode": "00406",
    "page": 344
  },
  {
    "label": "Risk for ineffective sleep pattern",
    "oldCode": "00402",
    "newCode": "00407",
    "page": 425
  },
  {
    "label": "Risk for ineffective sleep hygiene behaviors",
    "oldCode": "00403",
    "newCode": "00408",
    "page": 430
  },
  {
    "label": "Impaired surgical recovery",
    "oldCode": "00463",
    "newCode": "00465",
    "page": 453
  },
  {
    "label": "Readiness for enhanced verbal communication",
    "oldCode": "00468",
    "newCode": "00368",
    "page": 524
  },
  {
    "label": "Risk for disrupted attachment behaviors",
    "oldCode": "00480",
    "newCode": "00439",
    "page": 570
  },
  {
    "label": "Ineffective intimate partner relationship",
    "oldCode": "00448",
    "newCode": "00449",
    "page": 574
  },
  {
    "label": "Maladaptive family coping",
    "oldCode": "00455",
    "newCode": "00373",
    "page": 606
  },
  {
    "label": "Risk for accidental suffocation",
    "oldCode": "00465",
    "newCode": "00463",
    "page": 736
  },
  {
    "label": "Risk for occupational physical injury",
    "oldCode": "00470",
    "newCode": "00402",
    "page": 773
  },
  {
    "label": "Delayed child growth",
    "oldCode": "00368",
    "newCode": "00348",
    "page": 827
  },
  {
    "label": "Risk for delayed child growth",
    "oldCode": "00373",
    "newCode": "00478",
    "page": 830
  }
] as const;

function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function correctedNandaCode(code: string, englishLabel: string): string {
  const fix = NANDA_CODE_FIXES.find(
    (entry) => entry.oldCode === code && normalizeLabel(entry.label) === normalizeLabel(englishLabel),
  );
  return fix?.newCode ?? code;
}

/** Chuyển mã kế hoạch cũ không làm thay đổi các trường chăm sóc khác. */
export function migrateCarePlans(plans: CarePlan[]): CarePlan[] {
  return plans.map((plan) => {
    let changed = false;
    const entries = plan.entries.map((entry) => {
      const code = correctedNandaCode(entry.nanda.code, entry.nanda.label);
      if (code === entry.nanda.code) return entry;
      changed = true;
      return { ...entry, nanda: { ...entry.nanda, code } };
    });
    return changed ? { ...plan, entries } : plan;
  });
}
