import { CUE_BY_ID, CUES, DIAGNOSIS_RULES, LINK_VI, type Cue, type DiagnosisRule, type LinkSuggestion } from '../data/diagnosisKnowledge';
import { findNanda, findNic, findNoc } from '../data/taxonomy';
import { normalize } from './utils';

/** Khóa sessionStorage chuyển mục kế hoạch đã điền sẵn sang trang kế hoạch. */
export const PREFILL_KEY = 'clinicalnnn.assistant.prefill';

// ---------------------------------------------------------------------------
// Phân tích ghi chép tự do
// ---------------------------------------------------------------------------

export interface Detection {
  cueId: string;
  /** Đoạn văn hoặc giá trị đã kích hoạt dấu hiệu, ví dụ "SpO2 89%". */
  evidence: string;
}

export interface NoteAnalysis {
  detections: Detection[];
  /** Cụm từ bị bỏ qua vì đứng sau từ phủ định ("không sốt"). */
  negated: Detection[];
}

const VI_MARKS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const NEGATIONS = ['không có', 'không', 'chưa có', 'chưa', 'hết', 'phủ nhận', 'ko', 'k có', 'loại trừ'];
const NEGATIONS_PLAIN = NEGATIONS.map(normalize);
/** Từ khóa vốn đã mang nghĩa phủ định thì không xét phủ định phía trước. */
const STARTS_NEGATED = /^(không|chưa|khong|chua)\s/;

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Ranh giới từ cho cả chữ có dấu tiếng Việt. */
function wordRegex(keyword: string) {
  return new RegExp(`(^|[^\\p{L}\\p{N}])(${escapeRegExp(keyword)})(?=$|[^\\p{L}\\p{N}])`, 'gu');
}

function clauseBefore(text: string, index: number) {
  const start = Math.max(0, index - 24);
  const slice = text.slice(start, index);
  const cut = Math.max(slice.lastIndexOf(','), slice.lastIndexOf('.'), slice.lastIndexOf(';'), slice.lastIndexOf('\n'));
  return slice.slice(cut + 1);
}

function isNegated(before: string, plain: boolean) {
  const words = (plain ? NEGATIONS_PLAIN : NEGATIONS);
  const b = before.trimEnd();
  return words.some((w) => b === w || b.endsWith(' ' + w) || new RegExp(`(^|\\s)${escapeRegExp(w)}\\s+\\S*$`).test(b));
}

function snippet(text: string, index: number, length: number) {
  return text.slice(index, index + length).trim();
}

function num(s: string) {
  return Number(s.replace(',', '.'));
}

/** Nhận diện chỉ số đo được: SpO₂, nhiệt độ, nhịp thở, mạch, huyết áp, điểm đau, đường huyết, thang điểm. */
function detectMeasurements(raw: string): Detection[] {
  const t = normalize(raw);
  const out: Detection[] = [];
  const add = (cueId: string, evidence: string) => out.push({ cueId, evidence });
  let m: RegExpExecArray | null;

  const spo2 = /sp\s*o\s*2\s*[:=]?\s*(\d{2,3})\s*%?/g;
  while ((m = spo2.exec(t))) {
    const v = num(m[1]);
    if (v > 0 && v < 92) add('hypoxemia', `SpO₂ ${v}%`);
  }
  const temp = /(?:nhiet do|nhiet|t°|t0|to)\s*[:=]?\s*(3[3-9](?:[.,]\d)?|4[0-2](?:[.,]\d)?)|(3[3-9](?:[.,]\d)?|4[0-2](?:[.,]\d)?)\s*(?:°\s*c|do\s*c|°)/g;
  while ((m = temp.exec(t))) {
    const v = num(m[1] ?? m[2]);
    if (v >= 38) add('fever', `Nhiệt độ ${v} °C`);
    else if (v < 36) add('hypothermia_cue', `Nhiệt độ ${v} °C`);
  }
  const rr = /(?:nhip tho|tan so tho|\bnt|\brr)\s*[:=]?\s*(\d{1,2})\b/g;
  while ((m = rr.exec(t))) {
    const v = num(m[1]);
    if (v > 24) add('tachypnea', `Nhịp thở ${v} lần/phút`);
    else if (v > 0 && v < 12) add('bradypnea', `Nhịp thở ${v} lần/phút`);
  }
  const hr = /(?:\bmach|nhip tim|tan so tim|\bhr|\bm)\s*[:=]?\s*(\d{2,3})\b/g;
  while ((m = hr.exec(t))) {
    const v = num(m[1]);
    if (v > 100 && v < 250) add('tachycardia', `Mạch ${v} lần/phút`);
  }
  const bp = /(?:huyet ap|\bha|\bbp)\s*[:=]?\s*(\d{2,3})\s*\/\s*(\d{2,3})/g;
  while ((m = bp.exec(t))) {
    const sys = num(m[1]);
    const dia = num(m[2]);
    if (sys < 90) add('hypotension', `HA ${sys}/${dia} mmHg`);
    else if (sys >= 140 || dia >= 90) add('hypertension', `HA ${sys}/${dia} mmHg`);
  }
  const pain = /(?:dau[^.;,\n\d]{0,30}?|vas|nrs|diem dau)\s*[:=]?\s*(\d{1,2})\s*\/\s*10/g;
  while ((m = pain.exec(t))) {
    const v = num(m[1]);
    if (v >= 1 && v <= 10) {
      add('pain_report', `Điểm đau ${v}/10`);
      if (v >= 4) add('pain_moderate', `Điểm đau ${v}/10`);
      if (v >= 7) add('pain_severe', `Điểm đau ${v}/10`);
    }
  }
  const glucose = /(?:duong huyet|duong mau|glucose|glycemie|\bdmm|\bdh)\s*[:=]?\s*(\d{1,3}(?:[.,]\d+)?)/g;
  while ((m = glucose.exec(t))) {
    const v = num(m[1]);
    const mgdl = v > 40;
    const mmol = mgdl ? v / 18 : v;
    const label = `Đường huyết ${v} ${mgdl ? 'mg/dL' : 'mmol/L'}`;
    if (mmol > 10) add('hyperglycemia', label);
    else if (mmol > 0 && mmol < 3.9) add('hypoglycemia', label);
  }
  const braden = /braden\s*[:=]?\s*(\d{1,2})/g;
  while ((m = braden.exec(t))) if (num(m[1]) <= 18) add('low_braden', `Braden ${m[1]}`);
  const morse = /morse\s*[:=]?\s*(\d{1,3})/g;
  while ((m = morse.exec(t))) if (num(m[1]) >= 45) add('high_morse', `Morse ${m[1]}`);
  const gcs = /(?:gcs|glasgow)\s*[:=]?\s*(\d{1,2})/g;
  while ((m = gcs.exec(t))) if (num(m[1]) < 15) add('fluctuating_consciousness', `GCS ${m[1]}`);
  const age = /(\d{2,3})\s*tuoi/g;
  while ((m = age.exec(t))) if (num(m[1]) >= 65 && num(m[1]) < 120) add('age_65', `${m[1]} tuổi`);
  const bmi = /bmi\s*[:=]?\s*(\d{1,2}(?:[.,]\d)?)/g;
  while ((m = bmi.exec(t))) if (num(m[1]) < 18.5) add('low_bmi', `BMI ${m[1]}`);
  return out;
}

/**
 * Nhận diện dấu hiệu trong ghi chép tiếng Việt (có dấu hoặc không dấu).
 * Bỏ qua cụm từ đứng sau từ phủ định trong cùng mệnh đề.
 */
export function analyzeNote(raw: string): NoteAnalysis {
  const detections: Detection[] = [];
  const negated: Detection[] = [];
  if (!raw.trim()) return { detections, negated };
  const plain = !VI_MARKS.test(raw);
  const text = plain ? normalize(raw) : raw.toLowerCase();

  for (const c of CUES) {
    for (const kw of c.keywords) {
      const keyword = plain ? normalize(kw) : kw.toLowerCase();
      const re = wordRegex(keyword);
      let m: RegExpExecArray | null;
      let found = false;
      while ((m = re.exec(text))) {
        const index = m.index + m[1].length;
        const evidence = snippet(raw, index, keyword.length);
        if (!STARTS_NEGATED.test(keyword) && isNegated(clauseBefore(text, index), plain)) {
          negated.push({ cueId: c.id, evidence });
          continue;
        }
        detections.push({ cueId: c.id, evidence });
        found = true;
        break;
      }
      if (found) break;
    }
  }
  detections.push(...detectMeasurements(raw));

  // Mỗi dấu hiệu chỉ giữ một bằng chứng, ưu tiên chỉ số đo được.
  const byCue = new Map<string, Detection>();
  for (const d of detections) {
    const prev = byCue.get(d.cueId);
    if (!prev || /\d/.test(d.evidence)) byCue.set(d.cueId, d);
  }
  const kept = new Set(byCue.keys());
  return {
    detections: [...byCue.values()],
    negated: negated.filter((d, i, all) => !kept.has(d.cueId) && all.findIndex((x) => x.cueId === d.cueId) === i),
  };
}

// ---------------------------------------------------------------------------
// Xếp hạng chẩn đoán
// ---------------------------------------------------------------------------

export type Confidence = 'high' | 'medium' | 'low';

export interface MatchedCue {
  cue: Cue;
  weight: number;
}

export interface RankedLink extends LinkSuggestion {
  label: string;
  /** true khi điều kiện `when` thỏa hoặc không có điều kiện. */
  relevant: boolean;
}

export interface DiagnosisSuggestion {
  rule: DiagnosisRule;
  label: string;
  score: number;
  /** 0–100, dùng cho thanh mức phù hợp. */
  relevance: number;
  confidence: Confidence;
  matchedSigns: MatchedCue[];
  matchedFactors: MatchedCue[];
  /** Dấu hiệu quan trọng chưa ghi nhận, nên đánh giá thêm để khẳng định/loại trừ. */
  toVerify: Cue[];
  /** Có chẩn đoán hiện tại tương ứng đã đủ bằng chứng (chỉ với chẩn đoán nguy cơ). */
  supersededBy?: string;
  redFlag?: string;
  noc: RankedLink[];
  nic: RankedLink[];
}

const PRIORITY_BOOST = { 1: 1.3, 2: 1.1, 3: 1 } as const;
/** Vấn đề đang xảy ra thường được ưu tiên hơn nguy cơ cùng mức. */
const KIND_BOOST = { problem: 1, risk: 0.85, promotion: 0.8 } as const;

function collect(weights: Record<string, number>, selected: Set<string>) {
  const matched: MatchedCue[] = [];
  for (const [id, weight] of Object.entries(weights)) {
    const cue = CUE_BY_ID.get(id);
    if (cue && selected.has(id)) matched.push({ cue, weight });
  }
  return matched.sort((a, b) => b.weight - a.weight);
}

const sum = (xs: MatchedCue[]) => xs.reduce((s, x) => s + x.weight, 0);

function rankLinks(system: 'noc' | 'nic', links: LinkSuggestion[], selected: Set<string>): RankedLink[] {
  return links
    .map((l, i) => ({
      ...l,
      label: (system === 'noc' ? findNoc(l.code) : findNic(l.code))?.label ?? l.code,
      relevant: !l.when || l.when.some((c) => selected.has(c)),
      i,
    }))
    .sort((a, b) => Number(b.relevant) - Number(a.relevant) || a.i - b.i)
    .map(({ i: _i, ...rest }) => rest);
}

function evaluate(rule: DiagnosisRule, selected: Set<string>) {
  const matchedSigns = collect(rule.signs, selected);
  const matchedFactors = collect(rule.factors, selected);
  const signScore = sum(matchedSigns);
  const factorScore = sum(matchedFactors);
  const penalty = Object.entries(rule.against ?? {}).reduce((s, [id, w]) => s + (selected.has(id) ? w : 0), 0);

  let evidence: number;
  let qualifies: boolean;
  let confidence: Confidence;
  if (rule.kind === 'risk') {
    evidence = factorScore - penalty;
    qualifies = evidence >= 3 || matchedFactors.some((m) => m.weight === 3);
    confidence = evidence >= 6 ? 'high' : evidence >= 4 ? 'medium' : 'low';
  } else {
    const strongSign = matchedSigns.some((m) => m.weight >= 2);
    evidence = signScore + factorScore * 0.5 - penalty;
    qualifies = strongSign && signScore - penalty >= 2;
    const keySign = matchedSigns.some((m) => m.weight === 3);
    confidence = keySign && signScore >= 5 ? 'high' : signScore >= 3 && evidence >= 3.5 ? 'medium' : 'low';
  }
  if (rule.requires && !rule.requires.some((id) => selected.has(id))) qualifies = false;
  return { matchedSigns, matchedFactors, evidence, qualifies, confidence };
}

/** Xếp hạng chẩn đoán NANDA-I phù hợp với tập dấu hiệu đã chọn. */
export function rankDiagnoses(selectedIds: Iterable<string>): DiagnosisSuggestion[] {
  const selected = new Set(selectedIds);
  if (!selected.size) return [];
  const evaluated = DIAGNOSIS_RULES.map((rule) => ({ rule, ...evaluate(rule, selected) }));
  const qualified = new Set(evaluated.filter((e) => e.qualifies).map((e) => e.rule.code));

  const out: DiagnosisSuggestion[] = [];
  for (const e of evaluated) {
    if (!e.qualifies) continue;
    const { rule } = e;
    const score = Math.max(0, e.evidence) * PRIORITY_BOOST[rule.priority] * KIND_BOOST[rule.kind];
    const pool = rule.kind === 'risk' ? rule.factors : rule.signs;
    const toVerify = Object.entries(pool)
      .filter(([id, w]) => w >= 2 && !selected.has(id))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id]) => CUE_BY_ID.get(id))
      .filter((c): c is Cue => Boolean(c));
    out.push({
      rule,
      label: findNanda(rule.code)?.label ?? rule.code,
      score,
      relevance: Math.round(100 * (1 - Math.exp(-score / 5))),
      confidence: e.confidence,
      matchedSigns: e.matchedSigns,
      matchedFactors: e.matchedFactors,
      toVerify,
      supersededBy: rule.actual?.find((code) => qualified.has(code)),
      redFlag: rule.redFlag && rule.redFlag.when.some((c) => selected.has(c)) ? rule.redFlag.text : undefined,
      noc: rankLinks('noc', rule.noc, selected),
      nic: rankLinks('nic', rule.nic, selected),
    });
  }
  return out.sort((a, b) =>
    Number(Boolean(a.supersededBy)) - Number(Boolean(b.supersededBy)) || b.score - a.score || a.rule.priority - b.rule.priority);
}

export function ruleVi(code: string) {
  return DIAGNOSIS_RULES.find((r) => r.code === code)?.vi;
}

export function linkVi(system: 'noc' | 'nic', code: string) {
  return LINK_VI.get(system + ':' + code);
}

/** Câu chẩn đoán theo cấu trúc P – E – S dùng cho hồ sơ. */
export function pesStatement(s: DiagnosisSuggestion): string {
  const lower = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
  const factors = s.matchedFactors.map((m) => lower(m.cue.vi));
  const signs = s.matchedSigns.map((m) => lower(m.cue.vi));
  if (s.rule.kind === 'risk') {
    return `${s.rule.vi}, yếu tố nguy cơ: ${factors.join('; ') || '(cần ghi rõ yếu tố nguy cơ)'}.`;
  }
  if (s.rule.kind === 'promotion') {
    return `${s.rule.vi}, biểu hiện: ${signs.join('; ')}.`;
  }
  return `${s.rule.vi} liên quan đến ${factors.join('; ') || '(cần xác định yếu tố liên quan)'}, biểu hiện bởi ${signs.join('; ')}.`;
}
