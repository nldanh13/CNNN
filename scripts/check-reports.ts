import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');
const form = read('src/components/DataIssueReport.tsx');
const page = read('src/pages/ReportsPage.tsx');
const app = read('src/App.tsx');
const settings = read('src/pages/SettingsPage.tsx');
const contract = read('src/reports/ReportRepository.ts');
const hub = read('src/reports/index.ts');
const supabase = read('src/reports/supabaseRepository.ts');
const api = read('src/reports/apiRepository.ts');
const sql = read('supabase/migrations/20261017_create_data_reports.sql');

assert.ok(form.includes('repository.submit('), 'Feedback must submit through repository');
assert.ok(form.includes("toast('Đã gửi báo cáo thành công.')"), 'Submission confirmation required');
assert.ok(form.indexOf('await repository.submit(') < form.indexOf("toast('Đã gửi báo cáo thành công.')"),
  'Do not confirm before server accepts submission');
assert.ok(!form.includes('makeDataReportIssueUrl('), 'Do not redirect user to public GitHub Issues');
assert.ok(form.includes('consent'), 'User must attest no patient data');
assert.ok(page.includes('repository.listMine('), 'Report history is required');
assert.ok(page.includes('repository.isAdmin('), 'Admin entry must be checked');
assert.ok(page.includes('repository.listAll(') && page.includes('repository.updateStatus('),
  'Admin moderation must be offered');
assert.ok(page.includes('cnnn-data-reports'), 'Exportable format is required');
assert.ok(app.includes("case 'reports':"), 'Reports route must be registered');
assert.ok(settings.includes('href="#/reports"'), 'Users need an entry point');
assert.ok(contract.includes('export interface ReportRepository'), 'Provider-neutral contract required');
assert.ok(hub.includes("provider === 'api'") && hub.includes("provider === 'supabase'"),
  'Two interchangeable storage providers must exist');
assert.ok(api.includes('/reports/mine') && api.includes('/reports/me/admin'),
  'Portable API contract must be implemented');
assert.ok(!supabase.includes('service_role'), 'No service-role secret in browser client');
assert.ok(supabase.includes('Authorization:') && supabase.includes('identity.accessToken'),
  'Supabase REST requests require signed-in bearer token');
assert.ok(sql.includes('alter table public.data_reports enable row level security'));
assert.ok(sql.includes('alter table public.report_admins enable row level security'));
assert.ok(sql.includes('grant update(status, admin_note) on public.data_reports to authenticated'));
assert.ok(sql.includes('for select to authenticated'));
assert.ok(sql.includes('for insert to authenticated'));
assert.ok(sql.includes('for update to authenticated'));
assert.ok(!sql.includes('grant all on public.data_reports to anon'),
  'Public write permissions are forbidden');
assert.ok(sql.includes('user_id = (select auth.uid())'), 'Admin authorization must bind to auth uid');
console.log('OK: provider-neutral reporting, protected user/admin flows and SQL migration guardrails.');
