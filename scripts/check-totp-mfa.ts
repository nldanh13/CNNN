import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { verifiedTotpFactors, getJwtAal, requiresTotp } from '../src/auth/mfa';

function jwt(aal: 'aal1' | 'aal2') {
  const enc = (v: object) => Buffer.from(JSON.stringify(v)).toString('base64url');
  return enc({ alg: 'none' }) + '.' + enc({ aal }) + '.signature';
}
const verified = { id: 'factor-test', factor_type: 'totp' as const, status: 'verified' as const };
const unverified = { id: 'factor-new', factor_type: 'totp' as const, status: 'unverified' as const };
assert.equal(getJwtAal(jwt('aal1')), 'aal1');
assert.equal(getJwtAal(jwt('aal2')), 'aal2');
assert.equal(getJwtAal('bad-token'), 'aal1');
assert.equal(verifiedTotpFactors({ factors: [unverified] }).length, 0);
assert.equal(verifiedTotpFactors({ factors: [unverified, verified] }).length, 1);
assert.equal(requiresTotp({ factors: [verified] }, jwt('aal1')), true);
assert.equal(requiresTotp({ factors: [verified] }, jwt('aal2')), false);
assert.equal(requiresTotp({ factors: [unverified] }, jwt('aal1')), false);
assert.equal(requiresTotp({ factors: [] }, jwt('aal1')), false);

const api = readFileSync('src/auth/supabaseAuth.ts', 'utf8');
const ctx = readFileSync('src/auth/AuthContext.tsx', 'utf8');
const app = readFileSync('src/App.tsx', 'utf8');
const settings = readFileSync('src/components/MfaSettings.tsx', 'utf8');
const gate = readFileSync('src/components/MfaGate.tsx', 'utf8');
const workflow = readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
const check = ['factors', "'POST'", "factor_type: 'totp'", "'/challenge'", "'/verify'"];
for (const s of check.slice(0, 3)) assert.ok(api.includes(s));
assert.ok(api.includes("'/challenge', 'POST'"), 'MFA factor must be challenged by Supabase');
assert.ok(api.includes("'/verify', 'POST'"), 'MFA code must be verified by Supabase');
assert.ok(api.includes("const user = await request<AccountUser>('user', 'GET'"),
  'Auth must read factors from the server');
assert.ok(ctx.includes('commit(next);'), 'Verified AAL2 token must replace AAL1 session');
assert.ok(app.includes("import.meta.env.VITE_TOTP_MFA_ENABLED === 'true'"),
  'MFA must be opt-in until account recovery is configured');
assert.ok(app.includes('requiresTotp(auth.user, auth.session.access_token)'),
  'Enrolled user must face TOTP gate after AAL1 password login');
assert.ok(gate.includes('auth.verifyMfa(factorId, code.trim())'));
assert.ok(settings.includes('await auth.verifyMfa(enrollment.id, code)'));
assert.ok(!settings.includes('sessionStorage') && !settings.includes('localStorage'),
  'MFA secret must not persist in browser storage');
assert.ok(workflow.includes('vars.VITE_TOTP_MFA_ENABLED'));
console.log('OK: verified TOTP gate, AAL2 session upgrade, and opt-in MFA enrollment.');
