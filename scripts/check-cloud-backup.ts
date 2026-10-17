import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { backupJson, parseBackup } from '../src/lib/backup';
import type { CarePlan } from '../src/types';

const read = (p: string) => readFileSync(p, 'utf8');
const sql = read('supabase/migrations/20261017000100_cnnn_account_backups.sql').toLowerCase();
const api = read('src/cloud/backupRepository.ts');
const ui = read('src/components/CloudBackupPanel.tsx');
const settings = read('src/pages/SettingsPage.tsx');
const deploy = read('.github/workflows/deploy-pages.yml');

assert.ok(sql.includes('references auth.users(id) on delete cascade'));
assert.ok(sql.includes('enable row level security'));
assert.ok(sql.includes('force row level security'));
assert.ok(sql.includes('revoke all on table public.cnnn_backup_snapshots from public, anon, authenticated'));
assert.ok(sql.includes('grant select, insert, delete on table public.cnnn_backup_snapshots to authenticated'));
assert.ok(!sql.includes('grant update on table public.cnnn_backup_snapshots to authenticated'));
for (const action of ['select', 'insert', 'delete']) {
  assert.ok(sql.includes('for ' + action + ' to authenticated'), action + ' ownership policy missing');
}
assert.ok((sql.match(/\(select auth\.uid\(\)\) = user_id/g) || []).length >= 3);
assert.ok(!sql.includes('for all to anon'), 'Anon must not access backups');
assert.ok(sql.includes('constraint cnnn_backup_size'), 'Snapshot size must be bounded');
assert.ok(api.includes("VITE_CLOUD_BACKUP_ENABLED === 'true'"), 'Cloud backup must be opt-in');
assert.ok(api.includes("Authorization: 'Bearer ' + session.access_token"));
assert.ok(!api.includes('service_role') && !api.includes('supabase_secret_'));
assert.ok(ui.includes('restored.filter(p => !existingIds.has(p.id))'),
  'Restore must not overwrite local plans with the same ID');
assert.ok(ui.includes('window.confirm('), 'Uploads and restores require consent');
assert.ok(settings.includes('<CloudBackupPanel />'));
assert.ok(deploy.includes('vars.VITE_CLOUD_BACKUP_ENABLED'));

const sample: CarePlan = {
  id: 'plan-demo-1', code: 'KHCS-DEMO', createdAt: '2026-10-17T00:00:00.000Z',
  updatedAt: '2026-10-17T00:00:00.000Z', nurse: '',
  patient: { name: 'Người bệnh giả định', mrn: '', age: null, gender: 'other',
    heightCm: null, weightKg: null, ward: '', bed: '', admissionDate: '',
    medicalDiagnoses: [], allergies: [] }, entries: [],
};
const parsed = parseBackup(backupJson([sample]));
assert.equal(parsed.length, 1);
assert.equal(parsed[0].id, sample.id);
console.log('OK: owner-scoped, opt-in snapshots and backward-compatible backup format.');
