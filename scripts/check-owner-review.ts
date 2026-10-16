import { strict as assert } from 'node:assert';
import { SHARED_CATALOG, OWNER_REVIEW, TRANSLATION_REVIEW } from '../src/data/sharedCatalog';
import { dataHub } from '../src/data/dataHub';
import { translateVi } from '../src/lib/translate';
import { NIC8_SOURCE, translationCoverage } from '../src/data/nic8Reader';

// A project-owner attestation is distinct from publisher certification and
// distinct from whether detailed content has been translated.
assert.equal(OWNER_REVIEW?.status, 'confirmed-by-project-owner');
assert.equal(dataHub.ownerReview, OWNER_REVIEW);
assert.match(OWNER_REVIEW.recordedAt, /^\d{4}-\d{2}-\d{2}$/);
assert.equal(SHARED_CATALOG.entries.length, 1431);
assert.equal(TRANSLATION_REVIEW.draft, 1431, 'Original translation provenance must not be erased');
for (const row of SHARED_CATALOG.entries) {
  const term = dataHub.getTerm(row.system, row.code);
  assert.equal(term?.label, row.label);
  assert.equal(dataHub.getTranslation(row.system, row.code), row.labelVi);
  const vi = translateVi(row.code, row.label);
  assert.equal(vi.text, row.labelVi);
  assert.equal(vi.curated, true, 'Owner-reviewed catalog label must not show a machine-draft badge');
}
assert.equal(NIC8_SOURCE.length, 614);
assert.equal(translationCoverage().en, 1);
assert.equal(translationCoverage().vi, 1);
assert.ok(SHARED_CATALOG.entries.filter(x => x.system === 'nic').every(x =>
  (x as typeof x & { englishLabelStatus?: string }).englishLabelStatus ===
  'provisional—verify-against-official-NIC8-English'
), 'Owner review must not silently change publisher verification status');
console.log('OK: owner review is recorded, three catalogs remain canonical, NIC detail coverage remains explicit.');
