import { NIC7_LEGACY_LABELS, RETIRED_NIC7 } from '../src/data/nicMigration';
import { translateVi } from '../src/lib/translate';
import { newPlan, newEntry, toEhrJson, toEhrJsonVi, fromEhrJson } from '../src/lib/carePlan';
import { validateCareEntry, resetNocOnChange, resetEntryForDiagnosisChange } from '../src/lib/carePlanSafety';
import { NANDA_ITEMS, NOC_ITEMS, NIC_ITEMS } from '../src/data/taxonomy';
import { save } from '../src/store/storage';
import type { CareEntry } from '../src/types';
import { recordNocAssessment, effectiveIndicatorScale } from '../src/lib/nocAssessment';
import { REVIEWED_NNN_LINKS, reviewedLinksFor, NNN_SOURCES } from '../src/data/evidence';

function assert(c: unknown, m: string) { if (!c) throw new Error(m); }
function throws(f: () => unknown) { try { f(); } catch { return true; } return false; }
const nd = NANDA_ITEMS[0], no = NOC_ITEMS[0], ni = NIC_ITEMS[0];
const entry: CareEntry = {
  ...newEntry(), nanda: {code:nd.code,label:nd.label},
  definingCharacteristics:['Sign'], relatedFactors:['Factor'],
  noc:{code:no.code,label:no.label,scaleCode:'01',baseline:2,target:4,current:3,
    indicators:[{id:'i',code:'sample',name:'Sample indicator',score:3}]},
  nic:[{code:ni.code,label:ni.label,activities:['Observe patient']}],
  notes:'Clinical note',
};
assert(validateCareEntry(entry).length===0,'Valid entry rejected');
const newNic = NIC_ITEMS.find(x => x.code === '8070');
assert(newNic && translateVi(newNic.code,newNic.label).text === 'Hỗ trợ truy cập hồ sơ bệnh án điện tử','NIC 8 mới chưa có nhãn Việt');
const legacyActive = NIC_ITEMS.find(x => NIC7_LEGACY_LABELS[x.code]);
assert(legacyActive, 'Không có mục NIC7 có bí danh');
assert(validateCareEntry({...entry,nic:[{code:legacyActive.code,label:NIC7_LEGACY_LABELS[legacyActive.code],activities:[]}]}).length===0,
  'Kế hoạch có nhãn NIC7 cũ bị từ chối');
const retired = Object.entries(RETIRED_NIC7)[0];
assert(retired && validateCareEntry({...entry,nic:[{code:retired[0],label:retired[1].label,activities:[]}]}).length===0,
  'Không mở được kế hoạch đã lưu mã NIC7 ngừng dùng');
assert(!NIC_ITEMS.some(x=>x.code===retired[0]),'Mã NIC7 ngừng dùng phải bị ẩn khỏi danh mục đang hoạt động');

assert(validateCareEntry({...entry,noc:{...entry.noc,baseline:7}}).length>0,'Invalid score accepted');
assert(validateCareEntry({...entry,nic:[]}).length>0,'Missing NIC accepted');
const reset = resetNocOnChange(entry.noc,{code:NOC_ITEMS[1].code,label:NOC_ITEMS[1].label});
assert(reset.scaleCode===''&&reset.current===null&&reset.indicators.length===0,'Stale NOC data');
assert(resetNocOnChange(entry.noc,{code:no.code,label:no.label})===entry.noc,'Same NOC changed');
const cleared = resetEntryForDiagnosisChange(entry,{code:NANDA_ITEMS[1].code,label:NANDA_ITEMS[1].label});
assert(cleared.nic.length===0&&cleared.noc.code===''&&cleared.notes===''&&cleared.relatedFactors.length===0,'Stale diagnosis data');
assert(resetEntryForDiagnosisChange(entry,entry.nanda)===entry,'Same NANDA changed');
const plan = newPlan([]);
plan.patient.name='Test Example';
plan.patient.mrn='TEST-001';
plan.patient.gender='female';
plan.patient.medicalDiagnoses=['Text should stay unchanged'];
plan.entries=[entry];
for(const raw of [toEhrJson(plan),toEhrJsonVi(plan)]){
  const p=fromEhrJson(raw,[]);
  assert(p.patient.name===plan.patient.name&&p.patient.gender==='female','Patient fields lost');
  assert(p.patient.medicalDiagnoses[0]===plan.patient.medicalDiagnoses[0],'Free-text lost');
  assert(p.entries[0].nanda.label===nd.label&&p.entries[0].noc.label===no.label,'Source labels lost');
  assert(p.entries[0].nic[0].label===ni.label&&p.entries[0].nic[0].activities[0]===entry.nic[0].activities[0],'Activities lost');
  assert(p.entries[0].definingCharacteristics[0]==='Sign','Evidence lost');
  assert(p.entries[0].noc.indicators[0].name==='Sample indicator'&&p.entries[0].noc.indicators[0].score===3,'NOC indicator lost');
  assert(p.entries[0].notes===entry.notes&&p.entries[0].status===entry.status,'Other fields lost');
}
plan.entries[0]={...entry,status:'resolved'};
assert(fromEhrJson(toEhrJsonVi(plan),[]).entries[0].status==='resolved','VI resolved state lost');
assert(throws(()=>fromEhrJson({garbage:true},[])),'Accepted bad schema');
assert(throws(()=>fromEhrJson({patient_info:{},nursing_care_entries:[null]},[])),'Accepted bad entry');
// Repeated NOC assessments are snapshots, do not alter earlier observations.
assert(REVIEWED_NNN_LINKS.length === 0, 'Unreviewed clinical links were pre-populated');
assert(reviewedLinksFor(entry).length === 0, 'Suggested an unreviewed NNN link');
assert(Object.values(NNN_SOURCES).every((x) => x.title.length > 5), 'Thiếu metadata ấn bản');
assert(Object.values(NNN_SOURCES).every((x) => !('url' in x)), 'Không được đóng gói đường dẫn sách');
assert(effectiveIndicatorScale(undefined, '14') === '14', 'Legacy indicator scale fallback broken');
const withIndicatorScale: CareEntry = {
  ...entry, noc: { ...entry.noc, assessments: [],
    indicators: [{ ...entry.noc.indicators[0], scaleCode: '14', sourcePage: 'NOC p. 14', score: null }] },
};
const once = recordNocAssessment(withIndicatorScale, {
  score: 2, assessor: 'Nurse A', notes: 'First observation',
  assessedAt: '2026-10-14T08:00:00.000Z', indicatorScores: { sample: 1 },
});
const twice = recordNocAssessment(once, {
  score: 4, assessor: 'Nurse B', notes: 'Second observation',
  assessedAt: '2026-10-15T08:00:00.000Z', indicatorScores: { sample: 5 },
});
assert(once.noc.current === 2 && twice.noc.current === 4, 'Current NOC score not updated');
assert((twice.noc.assessments ?? []).length === 2, 'Assessment history not retained');
assert(once.noc.assessments?.[0].score === 2 && twice.noc.assessments?.[0].score === 2, 'Historical scores changed');
assert(twice.noc.assessments?.[1].assessor === 'Nurse B', 'Assessor missing');
assert(twice.noc.assessments?.[0].indicatorRatings[0].scaleCode === '14', 'Indicator scale snapshot lost');
assert(twice.noc.assessments?.[0].indicatorRatings[0].score === 1, 'Indicator snapshot changed');
assert(withIndicatorScale.noc.current === 3 && withIndicatorScale.noc.assessments?.length === 0, 'Modified input');
assert(throws(() => recordNocAssessment(entry, { score: 0, assessor: '', notes: '' })), 'Invalid assessment rating accepted');
const third = recordNocAssessment(twice, {score: 3, assessor: 'Nurse C', notes: ''});
assert(third.noc.assessments?.[2].indicatorRatings[0].score === null, 'Previous indicator score was incorrectly carried forward');
const assessedPlan = { ...plan, entries: [twice] };
for (const exported of [toEhrJson(assessedPlan), toEhrJsonVi(assessedPlan)]) {
  const restored = fromEhrJson(exported, []);
  const restoredNoc = restored.entries[0].noc;
  assert(restoredNoc.current === 4 && restoredNoc.assessments?.length === 2, 'Assessment history round-trip failed');
  assert(restoredNoc.assessments?.[0].notes === 'First observation', 'Assessment notes lost');
  assert(restoredNoc.assessments?.[1].assessedAt === '2026-10-15T08:00:00.000Z', 'Time lost');
  assert(restoredNoc.indicators[0].scaleCode === '14' && restoredNoc.indicators[0].sourcePage === 'NOC p. 14', 'Indicator provenance lost');
}
const changedNoc = resetNocOnChange(twice.noc, {code:NOC_ITEMS[1].code,label:NOC_ITEMS[1].label});
assert(changedNoc.assessments?.length === 0, 'Old outcome history leaked to a new NOC');

const globalStorage=globalThis as {localStorage?: Storage};
const previous=globalStorage.localStorage;
try {globalStorage.localStorage={setItem(){throw Error('quota')}} as unknown as Storage;
  assert(!save('test',[]),'Storage error swallowed');
} finally {if(previous)globalStorage.localStorage=previous; else delete globalStorage.localStorage;}
console.log('OK: VI/EN JSON round-trip, validation, reset, storage error');
