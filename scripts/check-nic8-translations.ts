import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

interface SourceEntry { code: string; definitionEs: string; activitiesEs: string[] }
interface TranslationEntry {
  code: string;
  definitionEn: string; definitionVi: string;
  activitiesEn: string[]; activitiesVi: string[];
  translationStatus: string;
}
const origin = JSON.parse(readFileSync('shared-data/nic8-licensed-es-source.json', 'utf8')) as {
  schema: string; entries: SourceEntry[];
};
const layer = JSON.parse(readFileSync('shared-data/nic8-translations.json', 'utf8')) as {
  schema: string; sourceLanguage: string; canonicalLanguage: string; secondaryLanguage: string;
  entries: TranslationEntry[];
};
assert.equal(origin.schema, 'clinicalnnn.nic8-licensed-source/v1');
assert.equal(layer.schema, 'clinicalnnn.nic8-translations/v1');
assert.equal(layer.sourceLanguage, 'es');
assert.equal(layer.canonicalLanguage, 'en');
assert.equal(layer.secondaryLanguage, 'vi');
const source = new Map(origin.entries.map(item => [item.code, item]));
const codes = new Set<string>();
for (const translated of layer.entries) {
  assert.ok(!codes.has(translated.code), 'Trùng mã dịch: ' + translated.code);
  codes.add(translated.code);
  const original = source.get(translated.code);
  assert.ok(original, 'Không tìm thấy mã NIC 8: ' + translated.code);
  for (const language of ['En', 'Vi'] as const) {
    const definition = translated[`definition${language}`];
    const activities = translated[`activities${language}`];
    assert.ok(typeof definition === 'string' && definition.trim().length > 0,
      'Định nghĩa chưa dịch: ' + translated.code + '/' + language);
    assert.ok(Array.isArray(activities) && activities.length === original.activitiesEs.length,
      'Số hoạt động không khớp: ' + translated.code + '/' + language);
    assert.ok(activities.every(value => typeof value === 'string' && value.trim().length),
      'Hoạt động rỗng: ' + translated.code + '/' + language);
  }
  assert.match(translated.translationStatus, /draft|reviewed/, 'Thiếu trạng thái thẩm định');
}
const completed = layer.entries.length;
console.log(`OK: ${completed}/${origin.entries.length} mã có đủ định nghĩa và hoạt động Anh–Việt, căn chỉnh với nguyên bản.`);
if (process.argv.includes('--require-complete')) {
  assert.equal(completed, origin.entries.length, 'Chưa hoàn chỉnh bản dịch tất cả các mã NIC 8');
}
