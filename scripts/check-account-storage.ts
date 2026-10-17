import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { backupJson, parseBackup } from '../src/lib/backup';
import type { CarePlan } from '../src/types';

const read = (file: string) => readFileSync(file, 'utf8');
const sql = read('supabase/migrations/20261017000300_account_patient_workspaces.sql');
const repository = read('src/cloud/patientWorkspace.ts');
const store = read('src/store/usePatientPlans.ts');
const app = read('src/App.tsx');
const plans = read('src/pages/PlansPage.tsx');
const settings = read('src/pages/SettingsPage.tsx');
const assistant = read('src/pages/AssistantPage.tsx');
const deploy = read('.github/workflows/deploy-pages.yml');

assert.ok(sql.includes('references auth.users(id) on delete cascade'), 'Workspaces must belong to Auth users');
assert.ok(sql.includes('enable row level security') && sql.includes('force row level security'),
  'Workspace requires forced RLS');
assert.ok(sql.includes('grant select on public.cnnn_patient_workspaces to authenticated'),
  'Only signed-in users should be able to SELECT');
assert.ok(sql.includes('using (user_id = (select auth.uid()))'), 'RLS must bind to verified JWT identity');
assert.ok(sql.includes('security definer') && sql.includes('set search_path ='), 'RPC requires controlled server context');
assert.ok(sql.includes("v_user uuid := (select auth.uid())"), 'RPC must use Auth UID, not client-provided UID');
assert.ok(sql.includes("revoke all on function public.cnnn_save_patient_workspace(bigint, jsonb) from public, anon"),
  'No anonymous RPC writes');
assert.ok(sql.includes('jsonb_array_length(p_plans) > 3') && sql.includes('cnnn_workspace_max_three'),
  'Three-patient quota must be enforced by server');
assert.ok(sql.includes('p_expected_revision') && sql.includes('raise exception \'Workspace changed on another device\''),
  'Concurrent writes must fail instead of overwriting');
assert.ok(!sql.includes('drop table') && !sql.includes('delete from public.cnnn_backup_snapshots'),
  'Deployment must not destroy legacy backups');

assert.ok(repository.includes("VITE_PATIENT_CLOUD_ENABLED === 'true'"),
  'Feature must stay off until SQL is applied');
assert.ok(repository.includes("Authorization: 'Bearer ' + session.access_token"),
  'All patient data requests require the user JWT');
assert.ok(repository.includes("'rpc/cnnn_save_patient_workspace'"), 'Save through revision checked server RPC');
assert.ok(store.includes('save(pendingKey, true)') && store.includes('save(pendingKey, false)'),
  'Preserve unsynced changes across connection failures');
assert.ok(store.includes('findPreviousAccountPlans(session)') &&
          store.includes('readPlans(carePlanStorageKey(true, uid))'),
  'Keep existing account data and historical snapshots migratable');
assert.ok(app.includes('<PatientCloudGate />'), 'Prevent plan edits before the account workspace loads');
assert.ok(plans.includes('MAX_PATIENTS') && assistant.includes('MAX_PATIENTS'));
assert.ok(!plans.includes('PlanBackupButtons') && !settings.includes('PlanBackupButtons') &&
          !settings.includes('CloudBackupPanel'), 'No backup/restore UI remains');
assert.ok(deploy.includes('vars.VITE_PATIENT_CLOUD_ENABLED'));
assert.ok(!deploy.includes('vars.VITE_TOTP_MFA_ENABLED'),
  'Do not enable MFA contrary to owner decision');

const sample: CarePlan = {
  id:'plan-demo', code:'DEMO', createdAt:'2026-10-17T00:00:00Z', updatedAt:'2026-10-17T00:00:00Z',
  nurse:'', patient:{name:'Bệnh nhân mô phỏng',mrn:'',age:null,gender:'other',heightCm:null,
    weightKg:null,ward:'',bed:'',admissionDate:'',medicalDiagnoses:[],allergies:[]}, entries:[],
};
assert.equal(parseBackup(backupJson([sample]))[0].id, sample.id,
  'Legacy backup data must remain readable for migration');
console.log('OK: opt-in server-authorized account autosave, hard quota of 3 and safe legacy migration.');
