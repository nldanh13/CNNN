import { strict as assert } from 'node:assert';
import { NIC8_SOURCE, NIC8_TOTAL_ACTIVITIES, findNic8, nic8Text, nic8Titles, translationCoverage } from '../src/data/nic8Reader';

assert.equal(NIC8_SOURCE.length, 614);
assert.equal(NIC8_TOTAL_ACTIVITIES, 16051);
assert.equal(findNic8('0140')[0]?.code, '0140', 'Search by exact NIC code');
assert.ok(findNic8('mecanica corporal').some(item => item.code === '0140'), 'Search by accentless Spanish source');
assert.ok(findNic8('Body mechanics').some(item => item.code === '0140'), 'Search by English label');
const target = NIC8_SOURCE.find(item => item.code === '0140')!;
assert.ok(nic8Titles(target).en.length > 0);
assert.equal(nic8Text(target, 'en').fallback, false);
assert.equal(nic8Text(target, 'vi').fallback, false);
assert.equal(nic8Text(target, 'en').activities.length, target.activitiesEs.length);
const incomplete = NIC8_SOURCE.find(item => item.code !== '0140' && item.definitionEn === null)!;
if (incomplete) {
  assert.equal(nic8Text(incomplete, 'en').fallback, true);
  assert.equal(nic8Text(incomplete, 'vi').fallback, true);
  assert.deepEqual(nic8Text(incomplete, 'en').activities, incomplete.activitiesEs);
}
const coverage = translationCoverage();
assert.ok(coverage.en >= 1 && coverage.en <= NIC8_SOURCE.length);
assert.ok(coverage.vi >= 1 && coverage.vi <= NIC8_SOURCE.length);
console.log('OK: NIC8 full-text search, deep-link lookup, aligned translation and explicit source fallback.');
