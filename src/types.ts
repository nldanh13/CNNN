export type Lang = 'vi' | 'en';
export type TaxonomySystem = 'nanda' | 'noc' | 'nic';

// ---------------------------------------------------------------------------
// Danh mục chuẩn (taxonomy)
// ---------------------------------------------------------------------------

export interface NandaDomain {
  id: string;
  number: number;
  nameEn: string;
  nameVi: string;
}

export interface NandaItem {
  code: string;
  label: string;
  domainId: string;
  domainNumber: number;
  classKey: string;
  classNumber: number;
  /** Tên phân lớp tiếng Anh, ví dụ "Physical injury". */
  className: string;
}

export interface NocDomain {
  id: string;
  number: number;
  roman: string;
  nameEn: string;
  nameVi: string;
}

export interface NocItem {
  code: string;
  label: string;
  domainId: string;
  domainNumber: number;
  classKey: string;
  /** Ký hiệu lớp NOC, ví dụ "L" hoặc "AA". */
  classLetter: string;
  className: string;
}

export interface NicItem {
  code: string;
  label: string;
}

export interface LabelMapping {
  domain: number;
  previous_domain?: number;
  previous_label: string;
  new_label_2024_2026: string;
  new_code: string;
}

export interface RetiredDiagnosis {
  domain: number;
  class: number | string;
  retired_code: string;
  retired_label: string;
}

export interface NocScale {
  code: string;
  meaningVi: string;
  meaningEn: string;
  points: string[];
  pointsVi: string[];
}

export interface NocNicDomainLink {
  num: string;
  nocDomain: string;
  nocDomainVi: string;
  nocClasses: string;
  nocClassesVi: string;
  nicDomain: string;
  nicDomainVi: string;
  nicDescVi: string;
  nicDescEn: string;
}

// ---------------------------------------------------------------------------
// Kế hoạch chăm sóc
// ---------------------------------------------------------------------------

export type Gender = 'male' | 'female' | 'other';

export interface Patient {
  name: string;
  /** Mã người bệnh / số hồ sơ. */
  mrn: string;
  age: number | null;
  gender: Gender;
  heightCm: number | null;
  weightKg: number | null;
  ward: string;
  bed: string;
  admissionDate: string;
  medicalDiagnoses: string[];
  allergies: string[];
}

export interface NocIndicator {
  id: string;
  code: string;
  name: string;
  score: number | null;
  /** Optional per-indicator scale; older plans inherit the outcome scale. */
  scaleCode?: string;
  /** Manually supplied reference, not verified automatically. */
  sourcePage?: string;
}

export interface NocAssessment {
  id: string;
  assessedAt: string;
  assessor: string;
  score: number;
  scaleCode: string;
  notes: string;
  indicatorRatings: Array<{ code: string; score: number | null; scaleCode: string }>;
}

export interface NicIntervention {
  code: string;
  label: string;
  activities: string[];
}

export type EntryStatus = 'active' | 'resolved';

export interface CareEntry {
  id: string;
  status: EntryStatus;
  nanda: { code: string; label: string };
  definingCharacteristics: string[];
  relatedFactors: string[];
  noc: {
    code: string;
    label: string;
    scaleCode: string;
    baseline: number;
    target: number;
    current: number | null;
    indicators: NocIndicator[];
    assessments?: NocAssessment[];
  };
  nic: NicIntervention[];
  notes: string;
}

export interface CarePlan {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  nurse: string;
  patient: Patient;
  /** Thứ tự trong mảng chính là mức độ ưu tiên. */
  entries: CareEntry[];
}
