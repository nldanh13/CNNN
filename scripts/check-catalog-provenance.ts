import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { CATALOG_QUALITY_SUMMARY, termTranslationProvenance } from '../src/data/catalogProvenance';
import { SHARED_CATALOG } from '../src/data/sharedCatalog';
import { EDITION_AUDIT } from '../src/data/editionAudit';

const sum = CATALOG_QUALITY_SUMMARY.reduce((s, row) => s + row.count, 0);
assert.equal(sum, SHARED_CATALOG.entries.length);
assert.equal(sum, 1431, 'Unexpected canonical data size: review catalog revisions before changing statuses');

for (const system of ['nanda', 'noc', 'nic'] as const) {
  const summary = CATALOG_QUALITY_SUMMARY.find(row => row.system === system);
  assert.ok(summary, 'Missing audit for ' + system);
  const entries = SHARED_CATALOG.entries.filter(row => row.system === system);
  assert.equal(summary.count, entries.length);
  assert.equal(summary.unreviewed, entries.filter(row => row.translationStatus?.includes('unreviewed')).length);
  assert.equal(summary.edition, EDITION_AUDIT.find(row => row.system === system)?.installedEdition);
  for (const row of entries) {
    const provenance = termTranslationProvenance(system, row.code);
    assert.ok(provenance && provenance.system === system);
    assert.equal(provenance.method, row.translationMethod ?? 'unknown');
    assert.equal(provenance.unreviewed, row.translationStatus?.includes('unreviewed') ?? false);
  }
}
assert.equal(CATALOG_QUALITY_SUMMARY.reduce((sum, row) => sum + row.unreviewed, 0), 1431,
  'Translation statuses should not be promoted without independent review evidence');
assert.equal(CATALOG_QUALITY_SUMMARY.find(row => row.system === 'noc')?.editionStatus, 'older',
  'NOC 6 must remain explicitly marked as older in this edition');
assert.equal(termTranslationProvenance('nic', 'invalid'), null);

const library = readFileSync('src/pages/LibraryPage.tsx', 'utf8');
const reader = readFileSync('src/pages/NicReaderPage.tsx', 'utf8');
const references = readFileSync('src/pages/ReferencesPage.tsx', 'utf8');
const ci = readFileSync('.github/workflows/nnn-data-integrity.yml', 'utf8');
const deps = readFileSync('.github/dependabot.yml', 'utf8');

assert.ok(library.includes('quality.unreviewed') && library.includes('translationAudit?.unreviewed'),
  'Library must explain translation status at system and code level');
assert.ok(library.includes('quality.editionStatus'), 'Library must show older edition where relevant');
assert.ok(references.includes('CATALOG_QUALITY_SUMMARY'), 'References must expose auditable review counts');
assert.ok(reader.includes('bản dịch dự thảo chưa thẩm định'), 'Detailed NIC text must not be portrayed as official Vietnamese');
assert.ok(ci.includes('npm audit --omit=dev --audit-level=high') &&
  ci.includes('npm audit --audit-level=high'), 'CI must audit production and development dependencies');
assert.ok(deps.includes('package-ecosystem: npm') &&
  deps.includes('package-ecosystem: github-actions'),
  'Dependabot should track package ecosystem and workflow vulnerabilities');
console.log('OK: 1431 reviewed-status checks, edition provenance and dependency auditing.');
