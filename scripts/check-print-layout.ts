import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { isRiskDiagnosisLabel, optionalPrintMetric, shouldPrintDiagnosticStatement, splitClinicalPrintNotes } from '../src/components/printNotes';

const notes = [
  'Mục tiêu đề xuất: Trong thời gian nằm viện, da vùng tỳ đè nguyên vẹn.',
  'Câu chẩn đoán: Nguy cơ tổn thương do tỳ đè ở người lớn.',
  '(Gợi ý từ Trợ lý chẩn đoán, đã được điều dưỡng xem xét.)',
  'Theo dõi người bệnh hằng ngày.',
].join('\n');
const parsed = splitClinicalPrintNotes(notes);
assert.equal(parsed.goal, 'Trong thời gian nằm viện, da vùng tỳ đè nguyên vẹn.');
assert.equal(parsed.diagnosticStatement, 'Nguy cơ tổn thương do tỳ đè ở người lớn.');
assert.deepEqual(parsed.provenance, ['(Gợi ý từ Trợ lý chẩn đoán, đã được điều dưỡng xem xét.)']);
assert.deepEqual(parsed.other, ['Theo dõi người bệnh hằng ngày.']);
assert.equal(splitClinicalPrintNotes('ghi chú riêng').other[0], 'ghi chú riêng');
assert.equal(splitClinicalPrintNotes('').goal, null);
assert.equal(optionalPrintMetric(null, 'cm'), null, 'Missing height must not print dangling cm');
assert.equal(optionalPrintMetric(0, 'kg'), null, 'Zero weight must not print as a vital sign');
assert.equal(optionalPrintMetric(0.5, 'kg'), '0,5 kg', 'Existing entered weight must not be silently modified');
assert.equal(optionalPrintMetric(160, 'cm'), '160 cm');

const diagnosisLabel = 'Nguy cơ tổn thương do tỳ đè ở người lớn';
const factors = [
  'Thang Braden ≤ 18 (nguy cơ tỳ đè)',
  'Da thường xuyên ẩm (mồ hôi, nước tiểu, phân)',
];
assert.equal(isRiskDiagnosisLabel(diagnosisLabel), true,
  'Vietnamese accented risk diagnosis must be detected without ASCII word-boundary bug');
assert.equal(isRiskDiagnosisLabel('Nguy cơ: tổn thương da'), true);
assert.equal(isRiskDiagnosisLabel('Nguy cơ\u00A0tổn thương da'), true,
  'Unicode whitespace should work in risk labels');
assert.equal(isRiskDiagnosisLabel('Suy giảm tính toàn vẹn da'), false);
assert.equal(shouldPrintDiagnosticStatement(
  'Nguy cơ tổn thương do tỳ đè ở người lớn, yếu tố nguy cơ: thang Braden ≤ 18 (nguy cơ tỳ đè); da thường xuyên ẩm (mồ hôi, nước tiểu, phân).',
  diagnosisLabel, factors,
), false, 'Do not duplicate title and risk factors already printed below');
assert.equal(shouldPrintDiagnosticStatement(diagnosisLabel + '.', diagnosisLabel, factors), false,
  'Do not print diagnosis title twice');
assert.equal(shouldPrintDiagnosticStatement(
  'Nguy cơ tổn thương do tỳ đè ở người lớn, yếu tố nguy cơ: da thường xuyên ẩm (mồ hôi, nước tiểu, phân).',
  diagnosisLabel, factors,
), true, 'Keep statement if it does not match all recorded risk factors');
assert.equal(shouldPrintDiagnosticStatement(
  'Nguy cơ tổn thương do tỳ đè ở người lớn, yếu tố nguy cơ: thang Braden ≤ 18 (nguy cơ tỳ đè); da thường xuyên ẩm (mồ hôi, nước tiểu, phân). Cần kiểm tra mỗi ca trực.',
  diagnosisLabel, factors,
), true, 'Keep any additional clinical detail');
assert.equal(shouldPrintDiagnosticStatement(
  'Suy giảm tính toàn vẹn da, có đỏ da kéo dài hơn 30 phút.',
  'Suy giảm tính toàn vẹn da', [],
), true, 'Do not hide non-risk diagnostic statements with clinical findings');
assert.equal(shouldPrintDiagnosticStatement(null, diagnosisLabel, factors), false);

const view = readFileSync('src/components/PrintView.tsx', 'utf8');
const css = readFileSync('src/components/PrintView.css', 'utf8');
for (const heading of [
  'THÔNG TIN NGƯỜI BỆNH', 'NỘI DUNG KẾ HOẠCH CHĂM SÓC',
  'Chẩn đoán điều dưỡng', 'Mục tiêu và kết quả mong đợi',
  'Can thiệp và hoạt động chăm sóc', 'Lượng giá và ghi chú',
]) assert.ok(view.includes(heading), 'Missing clinical hierarchy: ' + heading);
assert.ok(!view.includes('<table'), 'Do not restore cramped NANDA/NOC/NIC table');
assert.ok(view.includes('splitClinicalPrintNotes(entry.notes)'), 'Assistant notes must be shown in clinical sections');
assert.ok(view.includes('isRiskDiagnosisLabel(name)') && view.includes('shouldPrintDiagnosticStatement('),
  'A4 rendering must use risk identification and safe note de-duplication');
assert.ok(view.includes("entry.noc.assessments ?? []"), 'Old plans must still render without assessments');
assert.ok(view.includes('(a.indicatorRatings ?? [])'), 'Old assessments may have no indicator ratings');
assert.ok(view.includes('plan.entries.map'), 'Do not lose diagnoses in new print layout');
assert.ok(view.includes('entry.nic.map'), 'Do not lose NIC items');
assert.ok(view.includes('entry.relatedFactors.map'), 'Do not lose related/risk factors');
assert.ok(css.includes('@page') && css.includes('A4 portrait'));
assert.ok(css.includes('break-after: avoid') && css.includes('break-inside: auto'),
  'A4 layout should keep headings and allow long plan pages to flow');
assert.ok(css.includes('font-size: 9pt'), 'Printed text must remain legible after A4 pagination tuning');
console.log('OK: A4 clinical print hierarchy, separate assistant notes and no misleading empty fields.');
