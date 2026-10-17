import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

const api = readFileSync('src/cloud/backupRepository.ts', 'utf8');
const panel = readFileSync('src/components/CloudBackupPanel.tsx', 'utf8');
const sql = readFileSync('supabase/migrations/20261017000100_cnnn_account_backups.sql', 'utf8');

const start = api.indexOf('export async function canReadCloudBackupId(');
assert.ok(start > 0, 'Read-only RLS probe must be exported');
const fn = api.slice(start);
assert.ok(fn.includes("request<Array<{ id: string }>>(session, 'GET',"),
  'RLS probe must use the current authenticated session and GET only');
assert.ok(fn.includes("'select=id&id=eq.'"), 'RLS probe must query ID only, never patient payload');
assert.ok(!fn.includes("&user_id=eq."), 'RLS probe must not fake account isolation with a client-side owner filter');
assert.ok(!fn.includes("'DELETE'"), 'RLS probe must not delete anything');
assert.ok(fn.includes("return rows.length > 0"), 'Probe should distinguish visible from filtered record');
assert.ok(panel.includes('canReadCloudBackupId(session, probeId)'),
  'RLS check should be available inside opt-in account settings');
assert.ok(panel.includes('<details') && panel.includes('Kiểm tra quyền truy cập dữ liệu'),
  'RLS check should be collapsed under advanced details, not shown as a noisy banner');
assert.ok(sql.includes('for select to authenticated') && sql.includes('(select auth.uid()) = user_id'),
  'Server policy still needs to filter owner by JWT');
console.log('OK: read-only cross-account RLS test and owner-scoped database policy.');
