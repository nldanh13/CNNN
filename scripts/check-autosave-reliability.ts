import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import {
  readPlanDraft, writePlanDraft, parkPlanDraft, removePlanDraft,
  PENDING_DRAFT_PREFIX, PARKED_DRAFT_PREFIX,
} from '../src/store/pendingPlanDraft';
import type { CarePlan } from '../src/types';

const memory = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => { memory.set(key, value); },
  removeItem: (key: string) => { memory.delete(key); },
}});

const draftKey = PENDING_DRAFT_PREFIX + 'test-account-a';
const parkedKey = PARKED_DRAFT_PREFIX + 'test-account-a';
const dummy: CarePlan = {
  id: 'test-plan', code: 'K-TEST', nurse: '', createdAt: '2026-10-18',
  updatedAt: '2026-10-18',
  patient: {
    name: 'Bệnh nhân mô phỏng', mrn: '', age: null, gender: 'other',
    heightCm: null, weightKg: null, ward: '', bed: '',
    admissionDate: '', medicalDiagnoses: [], allergies: [],
  },
  entries: [],
};

assert.ok(writePlanDraft(draftKey, [dummy], 4));
assert.equal(readPlanDraft(draftKey)?.baseRevision, 4);
assert.equal(readPlanDraft(draftKey)?.plans[0].id, dummy.id);
assert.ok(writePlanDraft(draftKey, [], 4), 'Empty draft represents deleting all plans');
assert.deepEqual(readPlanDraft(draftKey)?.plans, [], 'Zero-plan draft must survive reload');
assert.ok(parkPlanDraft(draftKey, parkedKey, { version: 1, plans: [], baseRevision: 4, savedAt: '' }));
assert.deepEqual(readPlanDraft(parkedKey)?.plans, []);
assert.ok(writePlanDraft(draftKey, [dummy], 5));
assert.equal(parkPlanDraft(draftKey, parkedKey, { version: 1, plans: [], baseRevision: 5, savedAt: '' }), false,
  'Existing parked edits must never be silently overwritten');
assert.deepEqual(readPlanDraft(parkedKey)?.plans, []);
memory.set(parkedKey, '{corrupt-archive');
assert.equal(parkPlanDraft(draftKey, parkedKey, { version: 1, plans: [], baseRevision: 5, savedAt: '' }), false,
  'Even a corrupted parked archive must never be silently overwritten');
assert.equal(memory.get(parkedKey), '{corrupt-archive');
assert.ok(removePlanDraft(draftKey));
assert.equal(readPlanDraft(draftKey), null);
assert.equal(memory.get(parkedKey), '{corrupt-archive', 'Parking must retain unreadable archive bytes');
memory.set(draftKey, '{corrupt');
assert.throws(() => readPlanDraft(draftKey), /Bản nháp/, 'Corrupt journal must not be treated as empty');
assert.equal(memory.get(draftKey), '{corrupt', 'Corrupt journal must not be overwritten by read');

const hook = readFileSync('src/store/usePatientPlans.ts', 'utf8');
const gate = readFileSync('src/components/PatientCloudGate.tsx', 'utf8');
const layout = readFileSync('src/components/Layout.tsx', 'utf8');
const planPage = readFileSync('src/pages/PlansPage.tsx', 'utf8');
const planEditor = readFileSync('src/pages/PlanEditorPage.tsx', 'utf8');
const deleteDialog = readFileSync('src/components/DeletePlanDialog.tsx', 'utf8');
const status = readFileSync('src/components/PlanSyncStatus.tsx', 'utf8');
assert.ok(hook.includes('const differs = dirtyCache ||'), 'Zero-plan pending deletion must prompt recovery');
assert.ok(hook.includes('journal?.plans ?? cached'), 'Use the durable journal ahead of legacy cache');
assert.ok(hook.includes('migrationKind === \'legacy\'') && hook.includes(': legacyPlans;'),
  'Pending changes must represent the entire snapshot, not merge away deletions');
assert.ok(hook.includes('legacyRevision !== revisionRef.current'),
  'Do not blindly replay pending writes against a newer server version');
assert.ok(hook.includes('statusRef.current !== \'ready\''),
  'Queued writes must stop when a conflict is detected');
assert.ok(hook.includes("if (cloud && status !== 'ready')"),
  'Retry must not erase pending drafts while resolving a conflict');
assert.ok(hook.includes('window.setTimeout(submit, 650)'), 'Rapid keystrokes must be debounced');
assert.ok(hook.includes('window.addEventListener(\'online\', retry)'),
  'Retry pending changes when connectivity returns');
assert.ok(hook.includes('parkPlanDraft(draftKey, parkedKey'),
  'Dismissing a pending prompt must safely park unsynced edits');
assert.ok(hook.includes('reviewParkedDraft'), 'A parked draft must remain accessible for reconciliation');
assert.ok(gate.includes('giữ bản nháp trên máy'), 'User must see safe conflict option');
assert.ok(layout.includes('<PlanSyncStatus />'), 'Status should be visible on edit and list pages');
assert.ok(status.includes('Thử lưu lại'), 'Failed saves must expose retry UI');
assert.ok(!planPage.includes('planSyncMessage.includes('),
  'Status actions must be based on typed state, not text substring heuristics');
// Deletion must only be initiated after explicit confirmation on BOTH patient pages.
assert.ok(deleteDialog.includes('onConfirm: (plan: CarePlan) => void') &&
  deleteDialog.includes('onClick={() => onConfirm(plan)}') &&
  deleteDialog.includes('onClick={onClose}') && deleteDialog.includes('autoFocus'),
  'Deletion confirmation must offer safe cancellation and explicit approval');
assert.ok(deleteDialog.includes('plan.patient.name.trim()') &&
  deleteDialog.includes('{plan.code}') &&
  deleteDialog.includes('plan.entries.length'),
  'Deletion dialog must identify the exact patient plan and its scope');
assert.ok(planPage.includes('onClick={onRequestDelete}') &&
  planPage.includes('<DeletePlanDialog') &&
  planPage.includes('deletePlan(selected.id)') &&
  !planPage.includes('deletePlan(p.id)'),
  'Patient list must not delete on first click');
assert.ok(planEditor.includes('onClick={() => setDeleteReviewOpen(true)}') &&
  planEditor.includes('<DeletePlanDialog') &&
  planEditor.includes('plan={deleteReviewOpen ? plan : null}') &&
  planEditor.includes('deletePlan(selected.id)') &&
  planEditor.includes('if (editing.fromAssistant && plan.entries.length === 0 && !plan.patient.name.trim())') &&
  planEditor.split('deletePlan(plan.id)').length === 2,
  'Plan editor must not delete on first click');
assert.ok(planPage.includes('run: () => upsertPlan(selected)') &&
  planEditor.includes('upsertPlan(selected); navigate('),
  'Existing delete undo must be preserved after confirmation');

console.log('OK: pending drafts including empty deletions survive; stale/conflicting writes blocked; safe offline UX.');
