import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { SHARED_CATALOG } from '../src/data/sharedCatalog';

interface LicensedNic8Item {
  code: string;
  titleEs: string;
  definitionEs: string;
  activitiesEs: string[];
  titleEn: string | null;
  definitionEn: string | null;
  activitiesEn: string[] | null;
  titleVi: string | null;
  definitionVi: string | null;
  activitiesVi: string[] | null;
  source: { file: string; edition: number; epubPath: string };
  translationStatus: string;
}
interface LicensedNic8Source {
  schema: string;
  sourceLanguage: string;
  canonicalLanguage: string;
  secondaryLanguage: string;
  entries: LicensedNic8Item[];
}
const source = JSON.parse(readFileSync('shared-data/nic8-licensed-es-source.json','utf8')) as LicensedNic8Source;
assert.equal(source.schema, 'clinicalnnn.nic8-licensed-source/v1');
assert.equal(source.sourceLanguage, 'es');
assert.equal(source.canonicalLanguage, 'en');
assert.equal(source.secondaryLanguage, 'vi');
assert.equal(source.entries.length, 614);
const catalog = new Map(SHARED_CATALOG.entries.filter(x => x.system === 'nic').map(x => [x.code,x]));
const unique = new Set<string>();
let activities = 0;
for (const entry of source.entries) {
  assert.match(entry.code, /^\d{4}$/, 'Invalid NIC code');
  assert.ok(!unique.has(entry.code), 'Duplicate NIC code: '+entry.code);
  unique.add(entry.code);
  const matched = catalog.get(entry.code);
  assert.ok(matched, 'Missing NIC catalog code: '+entry.code);
  assert.ok(entry.titleEs.trim() && entry.definitionEs.trim(), 'Missing Spanish source: '+entry.code);
  assert.ok(Array.isArray(entry.activitiesEs), 'Missing activities array: '+entry.code);
  assert.ok(entry.activitiesEs.every(s => typeof s === 'string' && s.trim().length > 0), 'Empty activity: '+entry.code);
  assert.equal(entry.titleEs, (matched as typeof matched & {sourceLabelEs?: string}).sourceLabelEs,
    'Spanish source title differs from NIC catalog: '+entry.code);
  assert.equal(entry.source.edition, 8);
  assert.equal(entry.source.file, 'NIC.epub');
  assert.ok(entry.source.epubPath);
  assert.ok(entry.definitionEn === null || typeof entry.definitionEn === 'string');
  assert.ok(entry.definitionVi === null || typeof entry.definitionVi === 'string');
  activities += entry.activitiesEs.length;
}
assert.equal(unique.size, 614);
assert.equal(activities, 16051);
console.log('OK: licensed NIC 8 source has 614 definitions, 16,051 activities, unique codes and catalog linkage.');
