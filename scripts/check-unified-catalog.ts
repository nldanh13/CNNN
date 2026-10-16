/**
 * Regression guard: exactly three canonical NNN catalogs and one set of codes
 * across Library, clinical search, NIC Reader and care-plan validation.
 */
import { strict as assert } from 'node:assert';
import { dataHub, NNN_SYSTEMS } from '../src/data/dataHub';
import { SHARED_CATALOG } from '../src/data/sharedCatalog';
import { searchSystem } from '../src/lib/search';
import { NIC8_SOURCE, nic8Titles } from '../src/data/nic8Reader';

assert.deepEqual(NNN_SYSTEMS, ['nanda', 'noc', 'nic']);
assert.equal(dataHub.revision, SHARED_CATALOG.revision);
const expected = { nanda: 277, noc: 540, nic: 614 };
for (const system of NNN_SYSTEMS) {
  const list = dataHub.listLibrary(system);
  assert.equal(list.length, expected[system], system + ' size changed');
  assert.equal(dataHub.searchClinical(system, '').length, list.length);
  assert.equal(dataHub.searchLibrary(system, '').length, list.length);
  assert.equal(searchSystem(system, '').length, list.length);
  for (const term of list) {
    assert.strictEqual(dataHub.getTerm(system, term.code), term,
      system + ':' + term.code + ' does not resolve to the canonical instance');
    const translation = SHARED_CATALOG.entries.find(
      row => row.system === system && row.code === term.code);
    assert.ok(translation, 'Missing canonical translation row');
    assert.equal(dataHub.getTranslation(system, term.code), translation.labelVi);
  }
}
assert.equal(dataHub.getTerm('nanda', '00097')?.code, '00097');
assert.equal(dataHub.getTerm('nic', '9999'), undefined);
assert.equal(NIC8_SOURCE.length, dataHub.listLibrary('nic').length);
assert.deepEqual(
  NIC8_SOURCE.map(x => x.code).sort(),
  dataHub.listLibrary('nic').map(x => x.code).sort(),
  'NIC Reader must not contain an independent set of terms',
);
for (const item of NIC8_SOURCE) {
  assert.equal(nic8Titles(item).en, dataHub.getTerm('nic', item.code)?.label);
  assert.equal(nic8Titles(item).vi, dataHub.getTranslation('nic', item.code));
}
console.log('OK: one NANDA, one NOC, one NIC; reader and clinical search use canonical codes.');
