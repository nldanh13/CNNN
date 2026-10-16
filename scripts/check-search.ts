import { strict as assert } from 'node:assert';
import { searchSystem } from '../src/lib/search';
import { normalize } from '../src/lib/utils';
import { SHARED_CATALOG } from '../src/data/sharedCatalog';

assert.equal(normalize('Đau Cấp Tính'), 'dau cap tinh');
assert.equal(searchSystem('nanda', '00132')[0]?.code, '00132');
assert.equal(searchSystem('nanda', 'dau cap tinh')[0]?.code, '00132');
assert.equal(searchSystem('noc', '2102')[0]?.code, '2102');
assert.equal(searchSystem('nic', '3330')[0]?.code, '3330');
assert.equal(searchSystem('nanda', 'not-a-real-diagnosis').length, 0);
assert.equal(SHARED_CATALOG.entries.length, 1431);
for (const system of ['nanda','noc','nic'] as const) {
  const row = SHARED_CATALOG.entries.find(e => e.system === system && e.translationMethod === 'code-dictionary');
  if (row) assert.ok(searchSystem(system,row.labelVi).some(item => item.code === row.code));
}
console.log('OK: search by exact code, accentless Vietnamese, and source terms.');
