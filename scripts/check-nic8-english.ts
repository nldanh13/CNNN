import { strict as assert } from 'node:assert';
import { SHARED_CATALOG } from '../src/data/sharedCatalog';

const items = SHARED_CATALOG.entries.filter(item => item.system === 'nic');
assert.equal(items.length, 614, 'NIC 8 catalog must contain 614 interventions');
assert.equal(new Set(items.map(item => item.code)).size, 614, 'NIC 8 codes must be unique');
for (const item of items) {
  assert.ok(item.label.trim(), 'Missing English title: ' + item.code);
  assert.ok(item.labelVi.trim(), 'Missing Vietnamese title: ' + item.code);
  assert.equal(item.sourceLanguage, 'en', 'English must be the primary catalog language: ' + item.code);
  assert.ok((item as typeof item & { englishLabelStatus?: string }).englishLabelStatus,
    'English title must carry a review status: ' + item.code);
  assert.ok((item as typeof item & { sourceLabelEs?: string }).sourceLabelEs,
    'Missing Spanish source title: ' + item.code);
}
console.log('OK: NIC 8 English-first title schema, 614 unique codes and Spanish provenance.');
