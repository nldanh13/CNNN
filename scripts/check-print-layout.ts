import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { optionalPrintMetric, splitClinicalPrintNotes } from '../src/components/printNotes';

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

const view = readFileSync('src/components/PrintView.tsx', 'utf8');
const css = readFileSync('src/components/PrintView.css', 'utf8');
for (const heading of [
  'THÔNG TIN NGƯỜI BỆNH', 'NỘI DUNG KẾ HOẠCH CHĂM SÓC',
  'Chẩn đoán điều dưỡng', 'Mục tiêu và kết quả mong đợi',
  'Can thiệp và hoạt động chăm sóc', 'Lượng giá và ghi chú',
]) assert.ok(view.includes(heading), 'Missing clinical hierarchy: ' + heading);
assert.ok(!view.includes('<table'), 'Do not restore cramped NANDA/NOC/NIC table');
assert.ok(view.includes('splitClinicalPrintNotes(entry.notes)'), 'Assistant notes must be shown in clinical sections');
assert.ok(view.includes("entry.noc.assessments ?? []"), 'Old plans must still render without assessments');
assert.ok(view.includes('(a.indicatorRatings ?? [])'), 'Old assessments may have no indicator ratings');
assert.ok(view.includes('plan.entries.map'), 'Do not lose diagnoses in new print layout');
assert.ok(view.includes('entry.nic.map'), 'Do not lose NIC items');
assert.ok(view.includes('entry.relatedFactors.map'), 'Do not lose related/risk factors');
assert.ok(css.includes('@page') && css.includes('A4 portrait'));
assert.ok(css.includes('break-after: avoid') && css.includes('break-inside: auto'),
  'A4 layout should keep headings and allow long plan pages to flow');
assert.ok(css.includes('font-size: 9.2pt'), 'Printed text must remain legible');
console.log('OK: A4 clinical print hierarchy, separate assistant notes and no misleading empty fields.');
