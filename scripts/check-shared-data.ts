import { strict as assert } from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { SHARED_CATALOG } from '../src/data/sharedCatalog';
import { NANDA_ITEMS, NOC_ITEMS, NIC_ITEMS } from '../src/data/taxonomy';
import { translateVi } from '../src/lib/translate';

const pack=SHARED_CATALOG;
assert.equal(pack.schema,'clinicalnnn.shared-catalog/v1');
assert.equal(pack.locale,'vi');
assert.equal(pack.entries.length,1431);
assert.equal(pack.editions.nic,'8th Edition (2024)');
assert.equal(pack.totals.nic,614);
import { NIC8_NEW_CODES, NIC7_LEGACY_LABELS, RETIRED_NIC7 } from '../src/data/nicMigration';
const seen=new Set<string>();
let inherited=0,draft=0;
for (const r of pack.entries) {
  assert.match(r.code,/^\d{4,5}$/);
  assert.ok(r.labelVi.trim().length>0 && r.label.trim().length>0,'Missing Vietnamese source label');
  assert.ok(!seen.has(r.system+':'+r.code),'Duplicate code: '+r.system+':'+r.code);
  seen.add(r.system+':'+r.code);
  assert.equal(translateVi(r.code,r.label).text,r.labelVi,'Translation mismatch '+r.code);
  if(r.system==='nic'){
    assert.equal(r.sourceLanguage,'en','NIC8 primary labels must be English');
    assert.ok(typeof (r as typeof r & { sourceLabelEs?: string }).sourceLabelEs === 'string', 'Missing original Spanish title: '+r.code);
    assert.equal((r as typeof r & { englishLabelStatus?: string }).englishLabelStatus,
      'provisional—verify-against-official-NIC8-English', 'Missing NIC8 English verification status: '+r.code);
    assert.ok(['inherited-nic7-unreviewed','translated-draft-unreviewed'].includes(r.translationStatus??''),'Thiếu trạng thái kiểm duyệt NIC8');
    if(r.translationStatus==='inherited-nic7-unreviewed')inherited++; else draft++;
  }
  assert.ok(!('fullText' in r)&&!('activities' in r)&&!('sections' in r),'Book content in shared catalog');
}
assert.equal(pack.totals.nanda,NANDA_ITEMS.length);
assert.equal(pack.totals.noc,NOC_ITEMS.length);
assert.equal(pack.totals.nic,NIC_ITEMS.length);
assert.equal(inherited,554);
assert.equal(draft,60);
assert.equal(NIC8_NEW_CODES.length,60);
assert.equal(Object.keys(RETIRED_NIC7).length,11);
assert.equal(Object.keys(NIC7_LEGACY_LABELS).length,565);
assert.equal(NIC_ITEMS.length,614);
assert.ok(Object.keys(RETIRED_NIC7).every(code=>!NIC_ITEMS.some(r=>r.code===code)));
for(const code of NIC8_NEW_CODES)assert.ok(NIC_ITEMS.some(r=>r.code===code),'Thiếu mã NIC8 mới '+code);
assert.equal(existsSync('private-data/nnn-reference.json'),false,'No copyrighted source pack in current tree');
const app=readFileSync('src/pages/LibraryPage.tsx','utf8');
assert.ok(!app.includes('PrivateBookDetail')&&!app.includes('PrivateReferenceManager'));
const vite=readFileSync('vite.config.ts','utf8');
assert.ok(!vite.includes('localBookDevPlugin'));
const detail=readFileSync('src/components/CodeExplanationPanel.tsx','utf8');
assert.ok(!detail.includes('drive.google.com')&&!detail.includes('source.url'),'No source book links in detail UI');
console.log('OK: 1.431 nhãn Việt, NIC 8: 614, số lượng/mã/ấn bản thống nhất; web không tích hợp trình đọc sách.');
