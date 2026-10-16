// Run with `npm run check:nanda`. Regression checks for NANDA-I codes.
import { NANDA_ITEMS } from '../src/data/taxonomy';
import { NANDA_LABEL_MAPPINGS } from '../src/data/reference';
import { correctedNandaCode, migrateCarePlans, NANDA_CODE_FIXES } from '../src/lib/nandaCodeMigration';
import type { CarePlan } from '../src/types';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}
assert(NANDA_ITEMS.length === 277, `Expected 277 NANDA-I entries; got ${NANDA_ITEMS.length}`);
assert(new Set(NANDA_ITEMS.map((item) => item.code)).size === 277, 'NANDA-I codes must be unique');
for (const fix of NANDA_CODE_FIXES) {
  const matched = NANDA_ITEMS.filter((item) => item.label === fix.label);
  assert(matched.length === 1, `Expected one diagnosis for ${fix.label}`);
  assert(matched[0].code === fix.newCode, `Source code mismatch for ${fix.label}`);
  assert(correctedNandaCode(fix.oldCode, fix.label) === fix.newCode, `Migration failed: ${fix.label}`);
  assert(correctedNandaCode(fix.newCode, fix.label) === fix.newCode, `Migration not idempotent: ${fix.label}`);
}
for (const mapping of NANDA_LABEL_MAPPINGS) {
  assert(NANDA_ITEMS.some((item) => item.label === mapping.new_label_2024_2026 && item.code === mapping.new_code),
    `Bad rename mapping: ${mapping.new_label_2024_2026}`);
}
// Code-only replacement would corrupt valid diagnoses that shared an old code.
assert(correctedNandaCode('00404', 'Risk for occupational illness') === '00404', 'Migration changed an unrelated diagnosis');
assert(correctedNandaCode('00480', 'Risk for chronic inadequate self-esteem') === '00480', 'Migration changed an unrelated diagnosis');

const oldPlan = {
  entries: NANDA_CODE_FIXES.map((fix) => ({ nanda: { code: fix.oldCode, label: fix.label } })),
} as CarePlan;
const migrated = migrateCarePlans([oldPlan])[0];
assert(migrated !== oldPlan, 'Migration did not update the plan');
assert(migrated.entries.every((entry, index) => entry.nanda.code === NANDA_CODE_FIXES[index].newCode), 'Migration codes incorrect');
assert(oldPlan.entries[0].nanda.code === NANDA_CODE_FIXES[0].oldCode, 'Migration modified input');
assert(migrateCarePlans([migrated])[0] === migrated, 'Repeated migration should not change a corrected plan');
console.log(`OK: ${NANDA_ITEMS.length} unique NANDA-I codes, ${NANDA_LABEL_MAPPINGS.length} mappings, ${NANDA_CODE_FIXES.length} fixes.`);
