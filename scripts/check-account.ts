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
assert.ok(app.includes('return <LandingPage />') && app.includes("section === 'dang-nhap'") && app.includes("section === 'dang-ky'"),
  'Guests should see the landing page first, with dedicated sign-in and sign-up routes');
assert.ok(page.includes('Đăng ký tài khoản') && page.includes('Quên mật khẩu'), 'Missing account actions');
assert.ok(settings.includes('<AccountSettings />'), 'Settings must include account management');
assert.ok(auth.includes("window.location.origin + window.location.pathname"),
  'Auth email callbacks should preserve the GitHub Pages /CNNN/ base path');
assert.ok(auth.includes("'signup?redirect_to=' + encodeURIComponent(redirect)"),
  'Signup emails must specify a redirect URL instead of relying on Supabase default Site URL');
assert.ok(auth.includes("'recover?redirect_to=' + encodeURIComponent(redirect)"),
  'Password recovery emails must return to the same project path');
assert.ok(auth.includes("window.history.replaceState(null, ''"),
  'Auth callback fragment should be removed from the browser URL');
console.log('OK: auth screens/guard and per-account local draft isolation.');
