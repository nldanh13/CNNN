import { NANDA_ITEMS, NOC_ITEMS, NIC_ITEMS } from '../src/data/taxonomy';
import { CURATED_EXPLANATIONS, explainNnnCode } from '../src/data/nnnExplanations';
import { NNN_SOURCES } from '../src/data/evidence';
import { readFileSync } from 'node:fs';
function assert(c: unknown, reason: string): void { if (!c) throw Error(reason); }
const groups = {nanda: NANDA_ITEMS, noc: NOC_ITEMS, nic: NIC_ITEMS} as const;
let all = 0; let special = 0;
for (const system of ['nanda','noc','nic'] as const) {
  const items=groups[system];
  const exists=new Set(items.map(x=>x.code));
  for (const code of Object.keys(CURATED_EXPLANATIONS[system] ?? {})) {
    assert(exists.has(code), 'Orphan curated explanation: '+system+' '+code);
    special++;
  }
  for (const item of items) {
    for (const lang of ['vi','en'] as const) {
      const guide = explainNnnCode(system,item.code,item.label,lang);
      assert(guide.summary.length>65, 'Insufficient summary '+system+' '+item.code);
      assert(guide.reasoning.length>45, 'Missing reasoning '+system+' '+item.code);
      assert(guide.assessment.length>=3, 'Missing observation prompts '+system+' '+item.code);
      assert(guide.use.length>40, 'Missing usage logic '+system+' '+item.code);
      assert(guide.level==='editorial'||guide.level==='source-reviewed','Unknown provenance label');
      if (guide.sourcePdfPage != null) assert(system==='nanda'&&guide.sourcePdfPage>10, 'Bad source PDF page');
    }
    all++;
  }
  assert(Boolean(NNN_SOURCES[system].title), 'Missing source edition metadata');
}
assert(all===277+540+614, 'Unexpected taxonomy total');
assert(special>=30, 'Insufficient curated examples');
assert(explainNnnCode('nanda','00004','Risk for infection','vi').summary.includes('không có nghĩa người bệnh đã nhiễm khuẩn'), 'Risk explanation should distinguish actual versus risk');
const library=readFileSync('src/pages/LibraryPage.tsx','utf8');
const form=readFileSync('src/components/EntryForm.tsx','utf8');
const picker=readFileSync('src/components/TaxonomyPicker.tsx','utf8');
const standards=readFileSync('src/pages/StandardsPage.tsx','utf8');
assert(library.includes('<CodeExplanationPanel')&&form.includes('<CodeExplanationPanel')&&picker.includes('shortNnnExplanation'), 'Explanation UI not integrated');
assert(standards.includes('<NnnReasoningWorkflow'), 'Missing reasoning workflow');
console.log(`OK: explanations for ${all} unique NNN catalog entries, ${special} curated guides, VI/EN fallbacks, source disclosure and UI wiring`);
