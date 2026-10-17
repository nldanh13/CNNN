/**
 * Deployment security guard. Prevent accidental introduction of credentials
 * and confidential directories into the public CNNN repository.
 *
 * This DOES NOT make already published taxonomy data private. That requires
 * moving protected content behind authenticated server-side APIs and purging
 * the public build/history wherever legally and operationally possible.
 */
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const forbidden = tracked.filter(path =>
  /^(private-data|dist-private|secrets)\//i.test(path)
  || /(^|\/)\.env(\..*)?$/i.test(path) && !path.endsWith('.env.example')
  || /\.(?:pem|p12|pfx|key)$/i.test(path),
);
assert.deepEqual(forbidden, [], 'Confidential files are tracked in public git repository: ' + forbidden.join(', '));

const checked = tracked.filter(path =>
  /^(src|scripts|shared-data|\.github)\//.test(path)
  && /\.(?:ts|tsx|js|jsx|json|ya?ml|sql)$/.test(path)
);
const sensitivePatterns = [
  /sb_secret_[A-Za-z0-9_-]{10,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:SUPABASE_SERVICE_ROLE_KEY|DATABASE_PASSWORD)\s*[:=]\s*["']?[^\s"'$<{]{12,}/i,
];
for (const path of checked) {
  const source = readFileSync(path, 'utf8');
  for (const regex of sensitivePatterns) {
    assert.ok(!regex.test(source), 'Potential secret detected in ' + path + ' (value suppressed)');
  }
}

const app = readFileSync('src/App.tsx', 'utf8');
const index = readFileSync('index.html', 'utf8');
const auth = readFileSync('src/auth/supabaseAuth.ts', 'utf8');
const gate = readFileSync('src/pages/AccountPage.tsx', 'utf8');
const deploy = readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
const migration = readFileSync('supabase/migrations/20261017000200_limit_account_backups.sql', 'utf8');

assert.ok(app.includes('import.meta.env.PROD && !auth.enabled'), 'Production must fail closed without Auth config');
assert.ok(index.includes('Content-Security-Policy') && index.includes('object-src \'none\''), 'Missing HTML-level CSP');
assert.ok(index.includes('name="referrer" content="no-referrer"'), 'Do not leak recovery fragments by referrer');
assert.ok(auth.includes('captcha_token'), 'Supabase Auth must receive server-verified CAPTCHA token');
assert.ok(gate.includes('TurnstileChallenge') && gate.includes('turnstileSiteKey && !captchaToken'),
  'Auth forms must require CAPTCHA when a site key is configured');
assert.ok(deploy.includes('vars.VITE_TURNSTILE_SITE_KEY'), 'Deploy must include public CAPTCHA site key');
assert.ok(migration.includes('security invoker') && migration.includes('existing_count >= 10'),
  'Quota trigger must not bypass RLS and must bound rows per account');

// Intentional risk to resolve in a later, separate migration. DO NOT hide this.
const legacy = tracked.filter(p => /^(shared-data\/nnn-catalog\.json|shared-data\/nic8-licensed-es-source\.json)$/.test(p));
if (legacy.length) {
  console.warn('PUBLIC CONTENT EXPOSURE: catalog and/or NIC source are still tracked in this public repo.');
  console.warn('Move protected content behind authorized server APIs before claiming library confidentiality.');
}
console.log('OK: production Auth guard, CAPTCHA integration, backup quota, and basic credential scanning.');
