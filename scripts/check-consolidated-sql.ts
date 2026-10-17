import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

const unified = readFileSync('supabase/CNNN_DATABASE_ALL_IN_ONE.sql', 'utf8');
const sql = unified.split('\n').filter(line => !line.trim().startsWith('--')).join('\n');
const lower = sql.toLowerCase();

assert.equal((sql.match(/^begin;$/gmi) ?? []).length, 1, 'One atomic transaction required');
assert.equal((sql.match(/^commit;$/gmi) ?? []).length, 1, 'Transaction must commit once');
assert.ok(!/\bdrop\s+table\b/i.test(sql), 'Must not drop any existing data table');
assert.ok(!/\btruncate\b/i.test(sql), 'Must not truncate existing data');
assert.ok(!/\bdelete\s+from\b/i.test(sql), 'Must not delete existing data');
// UPDATE inside the saved RPC definition is expected; it is not executed by this setup query.
assert.ok(lower.includes('create table if not exists public.cnnn_backup_snapshots'));
assert.ok(lower.includes('create table if not exists public.cnnn_patient_workspaces'));
assert.ok(lower.includes('cnnn_workspace_max_three') && lower.includes('jsonb_array_length(p_plans) > 3'));
assert.ok(lower.includes('force row level security'));
assert.ok(lower.includes('cnnn_enforce_backup_quota'));
assert.ok(lower.includes('cnnn_save_patient_workspace'));
assert.ok(lower.includes('user_id = (select auth.uid())'));
assert.ok(lower.includes('revoke all on function public.cnnn_save_patient_workspace(bigint, jsonb) from public, anon'));
assert.ok(lower.includes('p_expected_revision') && lower.includes("errcode = '40001'"));
for (const name of [
  'cnnn_snapshots_select_own', 'cnnn_snapshots_insert_own',
  'cnnn_snapshots_delete_own', 'cnnn_workspace_read_own',
]) assert.ok(lower.includes('drop policy if exists "' + name + '"') ||
  lower.includes('drop policy if exists ' + name), 'Idempotent policy missing: ' + name);

console.log('OK: CNNN all-in-one query is repeatable, keeps old rows and enforces account/RLS rules.');
