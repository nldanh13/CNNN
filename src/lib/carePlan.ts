import type { CareEntry, CarePlan, Lang, Patient, NocAssessment } from '../types';
import { findNanda, findNoc, nandaDomain, nocDomain } from '../data/taxonomy';
import { computeBmi, signed, uid } from './utils';
import { translateVi } from './translate';
import { correctedNandaCode } from './nandaCodeMigration';

export function emptyPatient(): Patient {
  return {
    name: '',
    mrn: '',
    age: null,
    gender: 'male',
    heightCm: null,
    weightKg: null,
    ward: '',
    bed: '',
    admissionDate: new Date().toISOString().slice(0, 10),
    medicalDiagnoses: [],
    allergies: [],
  };
}

export function nextPlanCode(existing: CarePlan[]): string {
  const year = new Date().getFullYear();
  const prefix = `KHCS-${year}-`;
  const max = existing
    .map((p) => (p.code.startsWith(prefix) ? Number(p.code.slice(prefix.length)) : 0))
    .reduce((a, b) => Math.max(a, Number.isFinite(b) ? b : 0), 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

export function newPlan(existing: CarePlan[]): CarePlan {
  const now = new Date().toISOString();
  return { id: uid('plan'), code: nextPlanCode(existing), createdAt: now, updatedAt: now, nurse: '', patient: emptyPatient(), entries: [] };
}

export function newEntry(): CareEntry {
  return {
    id: uid('entry'),
    status: 'active',
    nanda: { code: '', label: '' },
    definingCharacteristics: [],
    relatedFactors: [],
    noc: { code: '', label: '', scaleCode: '', baseline: 1, target: 5, current: null, indicators: [], assessments: [] },
    nic: [],
    notes: '',
  };
}

// ---------------------------------------------------------------------------
// Chỉ số tiến triển
// ---------------------------------------------------------------------------

export type GoalState = 'met' | 'notMet' | 'notAssessed';

export function goalState(entry: CareEntry): GoalState {
  if (entry.noc.current == null) return 'notAssessed';
  return entry.noc.current >= entry.noc.target ? 'met' : 'notMet';
}

export function planProgress(plan: CarePlan) {
  const total = plan.entries.length;
  const met = plan.entries.filter((e) => goalState(e) === 'met').length;
  const active = plan.entries.filter((e) => e.status === 'active').length;
  return { total, met, active, ratio: total ? met / total : 0 };
}

// ---------------------------------------------------------------------------
// Xuất JSON chuẩn EHR (giữ tương thích cấu trúc của bản v1)
// ---------------------------------------------------------------------------

function nandaDomainText(code: string, label: string) {
  const item = findNanda(code, label);
  if (!item) return { domain: '', class: '' };
  const d = nandaDomain(item.domainNumber);
  return { domain: `${item.domainNumber} - ${d?.nameEn ?? ''}`, class: `${item.classNumber} - ${item.className}` };
}

function nocDomainText(code: string) {
  const item = findNoc(code);
  if (!item) return { domain: '', class: '' };
  const d = nocDomain(item.domainId);
  return { domain: `${d?.roman ?? item.domainNumber} - ${d?.nameEn ?? ''}`, class: `${item.classLetter} - ${item.className}` };
}

export function toEhrJson(plan: CarePlan) {
  const p = plan.patient;
  return {
    schema: 'clinicalnnn.careplan/v2',
    care_plan_id: plan.code,
    created_at: plan.createdAt,
    updated_at: plan.updatedAt,
    responsible_nurse: plan.nurse,
    patient_info: {
      patient_name: p.name,
      patient_id: p.mrn,
      age: p.age,
      gender: p.gender === 'male' ? 'Male' : p.gender === 'female' ? 'Female' : 'Other',
      height_cm: p.heightCm,
      weight_kg: p.weightKg,
      bmi: computeBmi(p.heightCm, p.weightKg),
      ward: p.ward,
      bed: p.bed,
      admission_date: p.admissionDate,
      medical_diagnoses: p.medicalDiagnoses,
      allergies: p.allergies,
    },
    nursing_care_entries: plan.entries.map((e, i) => ({
      priority: i + 1,
      status: e.status,
      nanda_diagnosis: {
        code: e.nanda.code,
        label: e.nanda.label,
        ...nandaDomainText(e.nanda.code, e.nanda.label),
        defining_characteristics: e.definingCharacteristics,
        related_factors: e.relatedFactors,
      },
      noc_outcome: {
        code: e.noc.code,
        label: e.noc.label,
        ...nocDomainText(e.noc.code),
        scale_code: e.noc.scaleCode,
        baseline_rating: e.noc.baseline,
        target_rating: e.noc.target,
        post_intervention_rating: e.noc.current,
        change_score: e.noc.current == null ? null : signed(e.noc.current - e.noc.baseline),
        indicators: e.noc.indicators.map((ind) => ({
          indicator_code: ind.code, name: ind.name, score: ind.score,
          scale_code: ind.scaleCode ?? null, source_page: ind.sourcePage ?? null,
        })),
        assessment_history: (e.noc.assessments ?? []).map((a) => ({
          id: a.id, assessed_at: a.assessedAt, assessor: a.assessor, score: a.score,
          scale_code: a.scaleCode, notes: a.notes,
          indicator_ratings: a.indicatorRatings.map((i) => ({ indicator_code: i.code, score: i.score, scale_code: i.scaleCode })),
        })),
      },
      nic_interventions: e.nic.map((n) => ({ code: n.code, label: n.label, activities_selected: n.activities })),
      notes: e.notes || undefined,
    })),
  };
}

/** Bản JSON với khóa và nhãn tiếng Việt, dành cho hồ sơ lưu trữ trong nước. */
export function toEhrJsonVi(plan: CarePlan) {
  const en = toEhrJson(plan);
  const vi = (code: string | null, text: string) => (text ? translateVi(code, text).text : text);
  return {
    luoc_do: en.schema,
    ma_ke_hoach_cham_soc: en.care_plan_id,
    ngay_lap: en.created_at,
    cap_nhat: en.updated_at,
    dieu_duong_phu_trach: en.responsible_nurse,
    thong_tin_nguoi_benh: {
      ho_va_ten: en.patient_info.patient_name,
      ma_nguoi_benh: en.patient_info.patient_id,
      tuoi: en.patient_info.age,
      gioi_tinh: plan.patient.gender === 'male' ? 'Nam' : plan.patient.gender === 'female' ? 'Nữ' : 'Khác',
      chieu_cao_cm: en.patient_info.height_cm,
      can_nang_kg: en.patient_info.weight_kg,
      chi_so_bmi: en.patient_info.bmi,
      khoa: en.patient_info.ward,
      giuong: en.patient_info.bed,
      ngay_nhap_vien: en.patient_info.admission_date,
      chan_doan_y_khoa: en.patient_info.medical_diagnoses,
      di_ung: en.patient_info.allergies,
    },
    danh_muc_cham_soc_dieu_duong: en.nursing_care_entries.map((e) => ({
      muc_do_uu_tien: e.priority,
      trang_thai: e.status === 'active' ? 'Đang theo dõi' : 'Đã giải quyết',
      chan_doan_nanda_i: {
        ma_so: e.nanda_diagnosis.code,
        ten_chan_doan: vi(e.nanda_diagnosis.code, e.nanda_diagnosis.label),
        nhan_goc: e.nanda_diagnosis.label,
        linh_vuc: e.nanda_diagnosis.domain,
        phan_lop: e.nanda_diagnosis.class,
        dac_diem_xac_dinh: e.nanda_diagnosis.defining_characteristics,
        yeu_to_lien_quan: e.nanda_diagnosis.related_factors,
      },
      ket_qua_dau_ra_noc: {
        ma_so: e.noc_outcome.code,
        ten_ket_qua: vi(e.noc_outcome.code, e.noc_outcome.label),
        nhan_goc: e.noc_outcome.label,
        linh_vuc: e.noc_outcome.domain,
        phan_lop: e.noc_outcome.class,
        ma_thang_do: e.noc_outcome.scale_code,
        diem_ban_dau: e.noc_outcome.baseline_rating,
        diem_muc_tieu: e.noc_outcome.target_rating,
        diem_hien_tai: e.noc_outcome.post_intervention_rating,
        muc_thay_doi: e.noc_outcome.change_score,
        chi_so_do_luong: e.noc_outcome.indicators.map((i) => ({
          ma_chi_so: i.indicator_code, ten_chi_so: i.name, diem_so: i.score,
          ma_thang_do: i.scale_code, trang_tai_lieu: i.source_page,
        })),
        lich_su_danh_gia: e.noc_outcome.assessment_history.map((a) => ({
          id: a.id, thoi_diem: a.assessed_at, nguoi_danh_gia: a.assessor, diem_so: a.score,
          ma_thang_do: a.scale_code, ghi_chu: a.notes,
          diem_chi_so: a.indicator_ratings.map((i) => ({
            ma_chi_so: i.indicator_code, diem_so: i.score, ma_thang_do: i.scale_code,
          })),
        })),
      },
      can_thiep_dieu_duong_nic: e.nic_interventions.map((n) => ({
        ma_so: n.code,
        ten_can_thiep: vi(n.code, n.label),
        nhan_goc: n.label,
        hoat_dong_dieu_duong: n.activities_selected,
      })),
      ghi_chu: e.notes,
    })),
  };
}

export function ehrJsonString(plan: CarePlan, lang: Lang): string {
  return JSON.stringify(lang === 'vi' ? toEhrJsonVi(plan) : toEhrJson(plan), null, 2);
}

// ---------------------------------------------------------------------------
// Nhập JSON (chấp nhận định dạng EHR của bản v1 và v2)
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
const num = (v: any): number | null => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));
const str = (v: any): string => (v == null ? '' : String(v));
const strArr = (v: any): string[] => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

/** Bilingual import: reconstruct EN source labels via nhan_goc; preserve user-entered clinical text verbatim. */
export function toCanonicalEhr(raw: any): any {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid JSON');
  if (raw.patient_info && Array.isArray(raw.nursing_care_entries)) return raw;
  if (!raw.thong_tin_nguoi_benh || !Array.isArray(raw.danh_muc_cham_soc_dieu_duong)) throw new Error('Unknown schema');
  const p = raw.thong_tin_nguoi_benh;
  if (typeof p !== 'object' || Array.isArray(p)) throw new Error('Invalid patient');
  return {
    schema: raw.luoc_do, care_plan_id: raw.ma_ke_hoach_cham_soc,
    created_at: raw.ngay_lap, updated_at: raw.cap_nhat, responsible_nurse: raw.dieu_duong_phu_trach,
    patient_info: {
      patient_name: p.ho_va_ten, patient_id: p.ma_nguoi_benh, age: p.tuoi,
      gender: p.gioi_tinh, height_cm: p.chieu_cao_cm, weight_kg: p.can_nang_kg,
      ward: p.khoa, bed: p.giuong, admission_date: p.ngay_nhap_vien,
      medical_diagnoses: p.chan_doan_y_khoa, allergies: p.di_ung,
    },
    nursing_care_entries: raw.danh_muc_cham_soc_dieu_duong.map((e: any) => {
      if (!e || typeof e !== 'object' || Array.isArray(e)) throw new Error('Invalid entry');
      const n = e.chan_doan_nanda_i ?? {};
      const o = e.ket_qua_dau_ra_noc ?? {};
      return {
        priority: e.muc_do_uu_tien, status: e.trang_thai === 'Đã giải quyết' ? 'resolved' : 'active',
        nanda_diagnosis: {
          code: n.ma_so, label: n.nhan_goc,
          defining_characteristics: n.dac_diem_xac_dinh, related_factors: n.yeu_to_lien_quan,
        },
        noc_outcome: {
          code: o.ma_so, label: o.nhan_goc, scale_code: o.ma_thang_do,
          baseline_rating: o.diem_ban_dau, target_rating: o.diem_muc_tieu,
          post_intervention_rating: o.diem_hien_tai,
          indicators: Array.isArray(o.chi_so_do_luong) ? o.chi_so_do_luong.map((i: any) => ({
            indicator_code: i.ma_chi_so, name: i.ten_chi_so, score: i.diem_so, scale_code: i.ma_thang_do, source_page: i.trang_tai_lieu,
          })) : [],
          assessment_history: Array.isArray(o.lich_su_danh_gia) ? o.lich_su_danh_gia.map((a: any) => ({
            id: a.id, assessed_at: a.thoi_diem, assessor: a.nguoi_danh_gia, score: a.diem_so,
            scale_code: a.ma_thang_do, notes: a.ghi_chu,
            indicator_ratings: Array.isArray(a.diem_chi_so) ? a.diem_chi_so.map((i: any) => ({
              indicator_code: i.ma_chi_so, score: i.diem_so, scale_code: i.ma_thang_do,
            })) : [],
          })) : [],
        },
        nic_interventions: Array.isArray(e.can_thiep_dieu_duong_nic)
          ? e.can_thiep_dieu_duong_nic.map((i: any) => ({
              code: i.ma_so, label: i.nhan_goc, activities_selected: i.hoat_dong_dieu_duong,
            })) : [],
        notes: e.ghi_chu,
      };
    }),
  };
}

export function fromEhrJson(raw: any, existing: CarePlan[]): CarePlan {
  raw = toCanonicalEhr(raw);
  if (!raw.patient_info || typeof raw.patient_info !== 'object' || Array.isArray(raw.patient_info) || !Array.isArray(raw.nursing_care_entries)) {
    throw new Error('invalid care plan');
  }
  const pi = raw.patient_info;
  const g = str(pi.gender).toLowerCase();
  const now = new Date().toISOString();
  const code = str(raw.care_plan_id) || nextPlanCode(existing);
  return {
    id: uid('plan'),
    code: existing.some((p) => p.code === code) ? nextPlanCode(existing) : code,
    createdAt: str(raw.created_at) || now,
    updatedAt: now,
    nurse: str(raw.responsible_nurse),
    patient: {
      name: str(pi.patient_name),
      mrn: str(pi.patient_id),
      age: num(pi.age),
      gender: g === 'female' || g === 'nữ' ? 'female' : g === 'male' || g === 'nam' ? 'male' : 'other',
      heightCm: num(pi.height_cm),
      weightKg: num(pi.weight_kg),
      ward: str(pi.ward),
      bed: str(pi.bed),
      admissionDate: str(pi.admission_date),
      medicalDiagnoses: strArr(pi.medical_diagnoses),
      allergies: strArr(pi.allergies),
    },
    entries: [...raw.nursing_care_entries]
      .sort((a: any, b: any) => (num(a.priority) ?? 0) - (num(b.priority) ?? 0))
      .map((e: any): CareEntry => {
        if (!e || typeof e !== 'object' || Array.isArray(e)) throw new Error('Invalid entry');
        const nd = e.nanda_diagnosis ?? {};
        const no = e.noc_outcome ?? {};
        if (!nd.code || !nd.label || !no.code || !no.label) throw new Error('Missing catalog source labels');
        return {
          id: uid('entry'),
          status: e.status === 'resolved' ? 'resolved' : 'active',
          nanda: { code: correctedNandaCode(str(nd.code), str(nd.label)), label: str(nd.label) },
          definingCharacteristics: strArr(nd.defining_characteristics),
          relatedFactors: strArr(nd.related_factors),
          noc: {
            code: str(no.code),
            label: str(no.label),
            scaleCode: str(no.scale_code) || '01',
            baseline: num(no.baseline_rating) ?? 1,
            target: num(no.target_rating) ?? 5,
            current: num(no.post_intervention_rating),
            indicators: (Array.isArray(no.indicators) ? no.indicators : []).map((i: any) => ({
              id: uid('ind'),
              code: str(i.indicator_code),
              name: str(i.name),
              score: num(i.score),
              scaleCode: str(i.scale_code) || undefined,
              sourcePage: str(i.source_page) || undefined,
            })),
            assessments: Array.isArray(no.assessment_history) ? no.assessment_history.map((a: any): NocAssessment => ({
              id: str(a.id) || uid('assessment'), assessedAt: str(a.assessed_at),
              assessor: str(a.assessor), score: num(a.score) ?? 1, scaleCode: str(a.scale_code), notes: str(a.notes),
              indicatorRatings: (Array.isArray(a.indicator_ratings) ? a.indicator_ratings : []).map((i: any) => ({
                code: str(i.indicator_code), score: num(i.score), scaleCode: str(i.scale_code),
              })),
            })) : [],
          },
          nic: (Array.isArray(e.nic_interventions) ? e.nic_interventions : []).map((n: any) => ({
            code: str(n.code),
            label: str(n.label),
            activities: strArr(n.activities_selected),
          })),
          notes: str(e.notes),
        };
      }),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
