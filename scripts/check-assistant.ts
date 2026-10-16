import { CUES, CUE_BY_ID, DIAGNOSIS_RULES, SAMPLE_NOTES } from '../src/data/diagnosisKnowledge';
import { NANDA_ITEMS, NOC_ITEMS, NIC_ITEMS } from '../src/data/taxonomy';
import { analyzeNote, pesStatement, rankDiagnoses } from '../src/lib/diagnosisAssistant';

function assert(c: unknown, reason: string): asserts c { if (!c) throw Error(reason); }

const nanda = new Set(NANDA_ITEMS.map((x) => x.code));
const noc = new Set(NOC_ITEMS.map((x) => x.code));
const nic = new Set(NIC_ITEMS.map((x) => x.code));

// 1. Tham chiếu hợp lệ
assert(new Set(CUES.map((c) => c.id)).size === CUES.length, 'Trùng mã dấu hiệu');
assert(new Set(DIAGNOSIS_RULES.map((r) => r.code)).size === DIAGNOSIS_RULES.length, 'Trùng quy tắc chẩn đoán');
for (const r of DIAGNOSIS_RULES) {
  assert(nanda.has(r.code), 'NANDA không có trong danh mục: ' + r.code);
  for (const a of r.actual ?? []) assert(DIAGNOSIS_RULES.some((x) => x.code === a), 'Thiếu chẩn đoán hiện tại ' + a);
  if (r.kind === 'risk') assert(Object.keys(r.signs).length === 0, 'Chẩn đoán nguy cơ không dùng dấu hiệu: ' + r.code);
  else assert(Object.keys(r.signs).length > 0, 'Thiếu dấu hiệu: ' + r.code);
  const ids = [...Object.keys(r.signs), ...Object.keys(r.factors), ...Object.keys(r.against ?? {}), ...(r.requires ?? []), ...(r.redFlag?.when ?? [])];
  for (const l of [...r.noc, ...r.nic]) ids.push(...(l.when ?? []));
  for (const id of ids) assert(CUE_BY_ID.has(id), `Dấu hiệu không tồn tại "${id}" trong ${r.code}`);
  assert(r.noc.length >= 1 && r.nic.length >= 2, 'Thiếu NOC/NIC: ' + r.code);
  for (const l of r.noc) assert(noc.has(l.code), `NOC ${l.code} không có trong danh mục (${r.code})`);
  for (const l of r.nic) assert(nic.has(l.code), `NIC ${l.code} không có trong danh mục NIC 8 (${r.code})`);
  assert(r.goal.length > 30, 'Thiếu mục tiêu mẫu: ' + r.code);
}
for (const c of CUES) assert(DIAGNOSIS_RULES.some((r) => c.id in r.signs || c.id in r.factors), 'Dấu hiệu không dùng: ' + c.id);

// 2. Phân tích ghi chép
const top = (text: string, n = 6) => {
  const a = analyzeNote(text);
  return { a, ranked: rankDiagnoses(a.detections.map((d) => d.cueId)).filter((s) => !s.supersededBy).slice(0, n).map((s) => s.rule.code) };
};
const neg = analyzeNote('Người bệnh không sốt, không khó thở. Chưa có loét tỳ đè.');
assert(!neg.detections.some((d) => ['fever', 'dyspnea', 'pressure_injury'].includes(d.cueId)), 'Không nhận diện phủ định');
assert(neg.negated.some((d) => d.cueId === 'fever'), 'Thiếu danh sách phủ định');
const plain = analyzeNote('benh nhan sot 39 do c, kho tho, spo2 88%, dau vet mo 8/10');
for (const id of ['fever', 'dyspnea', 'hypoxemia', 'pain_severe']) assert(plain.detections.some((d) => d.cueId === id), 'Ghi chép không dấu thiếu ' + id);
const vitals = analyzeNote('M 112 l/p, HA 85/50, NT 30, Nhiệt độ: 35.4, ĐH 3.1 mmol/L, Braden 11, Morse 60, GCS 13');
for (const id of ['tachycardia', 'hypotension', 'tachypnea', 'hypothermia_cue', 'hypoglycemia', 'low_braden', 'high_morse', 'fluctuating_consciousness'])
  assert(vitals.detections.some((d) => d.cueId === id), 'Chỉ số sinh tồn thiếu ' + id);

// 3. Tình huống mẫu
const [pneumonia, postOp, stroke] = SAMPLE_NOTES.map((s) => top(s.text));
assert(pneumonia.ranked[0] === '00031' || pneumonia.ranked[0] === '00030', 'Viêm phổi: chẩn đoán hô hấp phải đứng đầu, có ' + pneumonia.ranked);
for (const c of ['00031', '00007', '00303']) assert(pneumonia.ranked.concat(top(SAMPLE_NOTES[0].text, 12).ranked).includes(c), 'Viêm phổi thiếu ' + c);
assert(postOp.ranked[0] === '00132', 'Hậu phẫu: Đau cấp phải đứng đầu, có ' + postOp.ranked);
for (const c of ['00344', '00400']) assert(top(SAMPLE_NOTES[1].text, 12).ranked.includes(c), 'Hậu phẫu thiếu ' + c);
for (const c of ['00103', '00312', '00085', '00366', '00039']) assert(top(SAMPLE_NOTES[2].text, 12).ranked.includes(c), 'Đột quỵ thiếu ' + c);
assert(stroke.ranked.length > 0, 'Đột quỵ không có gợi ý');

// Nguy cơ bị thay bằng chẩn đoán hiện tại tương ứng
const sup = rankDiagnoses(['pressure_injury', 'bedrest', 'low_braden']);
assert(sup.find((s) => s.rule.code === '00304')?.supersededBy === '00312', 'Nguy cơ tỳ đè phải nhường cho tổn thương tỳ đè đã có');
// Đau mạn được ưu tiên hơn đau cấp khi đau kéo dài
const chronic = rankDiagnoses(['pain_chronic', 'pain_report', 'sleep_disturbance']);
assert(chronic[0]?.rule.code === '00133', 'Đau kéo dài phải gợi ý Đau mạn tính');
assert(pesStatement(rankDiagnoses(['pain_report', 'pain_moderate', 'post_op'])[0]).includes('liên quan đến sau phẫu thuật'), 'Câu PES sai');

console.log(`check:assistant OK — ${CUES.length} dấu hiệu, ${DIAGNOSIS_RULES.length} chẩn đoán; viêm phổi → ${pneumonia.ranked.join(', ')}; hậu phẫu → ${postOp.ranked.join(', ')}; đột quỵ → ${stroke.ranked.join(', ')}`);
