import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { carePlanStorageKey, LEGACY_PLAN_KEY } from '../src/store/planScope';

assert.equal(carePlanStorageKey(false, null), LEGACY_PLAN_KEY);
assert.equal(carePlanStorageKey(false, 'user-1'), LEGACY_PLAN_KEY);
assert.equal(carePlanStorageKey(true, null), null, 'Guest must not access account plans');
assert.equal(carePlanStorageKey(true, ''), null);
assert.equal(carePlanStorageKey(true, 'alice'), LEGACY_PLAN_KEY + '.user.alice');
assert.notEqual(carePlanStorageKey(true, 'alice'), carePlanStorageKey(true, 'bob'));

const auth = readFileSync('src/auth/supabaseAuth.ts', 'utf8');
const context = readFileSync('src/store/AppContext.tsx', 'utf8');
const app = readFileSync('src/App.tsx', 'utf8');
const page = readFileSync('src/pages/AccountPage.tsx', 'utf8');
const settings = readFileSync('src/pages/SettingsPage.tsx', 'utf8');
assert.ok(auth.includes("sessionStorage.setItem(SESSION_KEY"), 'Sessions must be per tab');
assert.ok(!auth.includes('service_role') && !auth.includes('VITE_SUPABASE_SERVICE'), 'Never ship backend secret');
assert.ok(context.includes('carePlanStorageKey(auth.enabled'), 'Care plans must be account-scoped');
assert.ok(!context.includes('save(KEYS.plans, plans)'), 'Global plan write is not permitted in account mode');
assert.ok(app.includes('auth.enabled && !auth.user'), 'Login guard missing');
assert.ok(page.includes('Đăng ký tài khoản') && page.includes('Quên mật khẩu'), 'Missing account actions');
assert.ok(settings.includes('<AccountSettings />'), 'Settings must include account management');
console.log('OK: auth screens/guard and per-account local draft isolation.');
