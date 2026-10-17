import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { SHARED_CATALOG } from '../src/data/sharedCatalog';
import { translateVi } from '../src/lib/translate';
import { NIC8_SOURCE, nic8Text } from '../src/data/nic8Reader';

const source = (file: string) => readFileSync(file, 'utf8');
const library = source('src/pages/LibraryPage.tsx');
const reader = source('src/pages/NicReaderPage.tsx');
const plans = source('src/pages/PlansPage.tsx');
const account = source('src/pages/AccountPage.tsx');
const assistant = source('src/pages/AssistantPage.tsx');
const codeGuide = source('src/components/CodeExplanationPanel.tsx');

assert.ok(!library.includes('Bản dịch dự thảo'), 'Remove repeated draft labels from catalog list');
assert.ok(!library.includes('translationReview.draft'), 'Do not show aggregate extraction warnings on library');
assert.ok(!reader.includes('<Stat label='), 'Technical coverage stats should not crowd Reader screen');
assert.ok(reader.includes('text.fallback') && reader.includes('tiếng Tây Ban Nha'),
  'Language fallback must remain visible when the requested translation is unavailable');
assert.ok(plans.includes('Lưu trữ & quyền riêng tư') && plans.includes('t.backup.notice'),
  'Plan privacy notice must remain accessible');
assert.ok(account.includes('Lưu trữ & quyền riêng tư') && account.includes('Không nhập dữ liệu nhận dạng người bệnh thật'),
  'Account privacy warning must remain accessible');
assert.ok(assistant.includes('s.redFlag'), 'Clinical red flags must not be removed');
assert.ok(codeGuide.includes('t.guide.copyrightNotice') && codeGuide.includes('<details'),
  'Guidance provenance must remain accessible');

assert.equal(SHARED_CATALOG.entries.length, 1431);
for (const entry of SHARED_CATALOG.entries) {
  const label = translateVi(entry.code, entry.label);
  assert.equal(label.text, entry.labelVi);
  assert.equal(label.curated, true, 'Owner-reviewed catalog label should not show draft badge');
}
const fallback = NIC8_SOURCE.find(item => item.code !== '0140' && nic8Text(item, 'vi').fallback);
assert.ok(fallback, 'NIC 8 missing translations must still be detected');

console.log('OK: less visual noise, all 1431 labels preserved, privacy and contextual safety notes retained.');
