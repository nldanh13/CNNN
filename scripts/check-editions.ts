import { EDITION_AUDIT, OLDER_EDITION_ROWS } from '../src/data/editionAudit';
import { readFileSync, existsSync } from 'node:fs';
function ok(c: boolean, reason: string) { if (!c) throw new Error(reason); }
ok(EDITION_AUDIT.length === 3, 'Expected three taxonomies');
const rows = Object.fromEntries(EDITION_AUDIT.map((r) => [r.system, r]));
ok(rows.nanda.installedCount === 277 && rows.nanda.latestCount === 277 && rows.nanda.status === 'current', 'NANDA-I catalog status mismatch');
ok(rows.noc.installedCount === 540 && rows.noc.latestCount === 612 && rows.noc.status === 'older', 'NOC edition status mismatch');
ok(rows.nic.installedCount === 614 && rows.nic.latestCount === 614 && rows.nic.status === 'current', 'NIC edition status mismatch');
ok(OLDER_EDITION_ROWS.length === 1, 'Missing warnings for old editions');
ok(EDITION_AUDIT.every((r) => /^https:\/\//.test(r.publisherUrl)), 'Missing official publisher references');
console.log('OK: accurate edition/source status; no unverified catalog replacements');

const filesWithNavigation = ['src/App.tsx', 'src/components/Layout.tsx', 'src/components/CommandPalette.tsx', 'src/pages/HomePage.tsx', 'src/pages/SettingsPage.tsx', 'src/pages/LibraryPage.tsx'];
for (const filename of filesWithNavigation) {
  const source = readFileSync(filename, 'utf8');
  ok(!source.includes('#/migration') && !source.includes("navigate('/migration')") && !source.includes('MigrationPage') && !source.includes('t.nav.migration') && !source.includes('t.migration.'), 'Migration UI reference still present in ' + filename);
}
ok(!existsSync('src/pages/MigrationPage.tsx'), 'Removed migration page is still present');
