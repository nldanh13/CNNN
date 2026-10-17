# CNNN — Security hardening & private-data migration

**Status:** phase 1 prepared on a GitHub branch. Not an independent security audit, not a certified clinical data store. The original NANDA-I/NOC/NIC catalog, NIC source, and code are already present in the PUBLIC GitHub repo / static deployment. A client-only login CANNOT keep those resources confidential.

## Architecture and truth-in-advertising

| Category | Current security status | Next secure destination |
|---|---|---|
| Supabase Auth identity | Email/password, confirmation email, per-tab session. CAPTCHA **optional** once configured. | Add TOTP MFA with secure AAL2 checks and tested recovery. |
| Browser care plans | Unencrypted `localStorage` keyed by UID. Prevents accidental mixing in UI but **not local-device access**. | Encrypt local drafts with a user-controlled secret OR stop persisting identifying fields locally. |
| Per-account cloud backups | JWT-protected Supabase RLS snapshots; manual upload only. | Two-account adversarial test; quota migration. Real patient data prohibited. |
| Shared NANDA-I / NOC / NIC | Catalog and licensed NIC details tracked in **public repository**, included in the public JS build. | Separate *private licensed content* into private backend storage and serve via authenticated authorization checks per request. |
| GitHub Pages | Public static hosting. HTML meta CSP only, no per-user authorization or HTTP response-header control. | Keep only public frontend, serve confidential data through authenticated API; consider hosting with full server-side security headers. |

**Do not change/delete existing local or cloud records as part of the security rollout.** No automatic migration of backups. No new duplicate taxonomy lists.

## Actions for project owner — in safe order

### A. Protect administrators now (no deployment required)

1. On GitHub and Supabase owner accounts, enable 2FA; preferably hardware security key/passkey. Keep recovery codes off-device. Review collaborators and revoke unknown GitHub apps and tokens.
2. GitHub → Settings → Rules → Rulesets: protect `main`, require PRs and the **Unified NNN data integrity** check, restrict force-push and deletion. Avoid committing secrets. Enable GitHub security/dependency alerts and code scanning where available.
3. Supabase → Authentication: **Confirm email ON**. Review Bot and Abuse Protection / rate limits, SMTP and URL allowlist. Limit session/token lifetime in accordance with actual usage. Do not reuse admin passwords.
4. In Supabase SQL Editor, verify RLS and 3 owner-only policies on `cnnn_backup_snapshots`. A table's RLS flags and policy count are only a *configuration check*, NOT proof that account B cannot access A.

### B. Cloudflare Turnstile for login / signup / recovery

This code integrates the Turnstile widget with the three GoTrue HTTP endpoints (sends `captcha_token`). It is **inactive until configured**; it does not silently block existing users.

1. Create a Turnstile widget at Cloudflare, allowed hostname `nldanh13.github.io`. Keep its **SECRET** safe; the public **site key** may be put in the website.
2. GitHub → CNNN → Settings → Secrets and variables → Actions → **Variables** → set `VITE_TURNSTILE_SITE_KEY` to the **PUBLIC site key only**, never the secret.
3. Deploy from `main`; open `https://nldanh13.github.io/CNNN/`, verify that the challenge loads on **all 3 forms** (login, registration, recovery) and can be completed. Test in a fresh/private browser.
4. **Only after the challenge works**, Supabase → Authentication → Bot and Abuse Protection → enable CAPTCHA, select Cloudflare Turnstile, and enter the **SECRET** key *only in Supabase*. Confirm sign-up/login/reset still work. If any route fails, disable CAPTCHA at Supabase until investigated; do not expose the secret in GitHub.
5. Keep Supabase server-side abuse and rate controls active. CAPTCHA is one control, not a guarantee of one human/one account. One verified email identifies **one email account**, not one human. For stronger controls use invitation/identity verification with a clear privacy policy; do not silently collect national IDs.

Sources: [Supabase Auth CAPTCHA](https://supabase.com/docs/guides/auth/auth-captcha), [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/get-started/).

### C. Run the ADDITIVE quota migration in Supabase

The original RLS migration should already exist. Open **SQL Editor** and execute:

`supabase/migrations/20261017000200_limit_account_backups.sql`

This adds a **10 immutable snapshots/account** cap through an RLS-aware trigger with a per-user transaction lock. It does NOT delete existing rows. Accounts already over the quota must delete old backups before inserting another. Do not rerun the original `CREATE POLICY` migration; run only the new file.

Check the trigger:

```sql
select tgname, tgenabled
from pg_trigger
where tgrelid = 'public.cnnn_backup_snapshots'::regclass
  and not tgisinternal;
```

Test account isolation with **dummy data only**:
- A uploads one demo backup and sees it.
- B logs in on another browser and cannot list, fetch, modify or delete A's snapshot, even when B knows A's snapshot UUID. RLS failures may be empty results or permission errors.
- Unauthenticated requests cannot list or add data.
- A can still export to a local JSON backup; B's browser UI never sees A's local plans.
- A creates at most 10 snapshots, sees the quota error on #11, deletes one and can create another.
- Logout/login flow, password reset, invalid/expired session, mobile navigation continue to work.

`SERVICE_ROLE` / SQL Editor as admin **bypasses ordinary user RLS**: do not use admin queries as the A/B test.

### D. The private library: cannot be solved by hiding a menu

Current public GitHub repository includes `shared-data/nnn-catalog.json` and `shared-data/nic8-licensed-es-source.json`. NIC Reader imports the source statically. **Anyone can fetch already published copies or website bundles**. Neither CAPTCHA, MFA, private route, robots.txt, code obfuscation, RLS on backup table nor making the GitHub repo private will retract copies already published. Authorization only works when content is stored *server side* and the API authenticates the caller.

**Required separate migration, not automatically started:**
1. Review the licensing / legal rights to distribute content; classify entries as public metadata vs licensed restricted detail. Keep exactly 3 canonical NANDA/NOC/NIC identifiers.
2. Preserve an encrypted offline archive, Git revision and test backups. Create a **separate private content source**/restricted backend. Use Supabase DB tables in an access-restricted schema or private storage with Edge Function API; an Edge Function must validate JWT and authorization on every request and enforce quotas/pagination. Service-role secrets may exist only in secure backend secrets, never in Vite, GitHub Pages or public repository.
3. Adapt the frontend to fetch private definitions and activities on demand, but **remove imports and build artifacts for restricted content entirely**. Confirm by scanning built `dist` files and testing anonymous requests.
4. Only after feature parity/tests, remove restricted files from the public HEAD, rewrite public Git history when appropriate (risky/destructive), revoke leaked credentials, consider licensing/takedown notices and cached copies. Existing copies remain outside your control.
5. Even with the correct architecture, authorized users can screenshot/copy displayed text. Do not promise absolute no-copy protection.

Do not delete source files or force-push history before the new backend and legal review are ready; doing so today will break NIC Reader and cannot undo old exposure.

### E. Frontend browser security

- Release now has fail-closed **production** behavior when Auth config is missing. In `dev`, local-only mode still works.
- HTML `Content-Security-Policy` meta, no-referrer policy, `.gitignore` for private paths, and a tracked-file credential scanner provide **partial** defense in depth. This meta tag is weaker than actual server-delivered headers (e.g. does not enforce frame-ancestors); GitHub Pages does not grant fine-grained per-request security headers.
- Supabase login access/refresh tokens are held in per-tab `sessionStorage`. XSS can still steal tokens. Use a thoroughly reviewed backend session model (HttpOnly secure cookies) for high-risk healthcare deployments. Do not claim this phase has eliminated XSS/theft risk.
- Cloud backup is for non-identifying training plans only. There is no certified electronic medical record storage, automatic sync, encrypted local database, support impersonation tool or complete data-deletion UI.

## Validation

Automated `npm run check:security`, existing account tests, cloud-backup checks, `npm run typecheck` and `npm run build` must all pass. GitHub CI does **not** test your private Supabase project or Cloudflare CAPTCHA without the owner completing the steps above.

**Rollout rule:** Activate Cloudflare CAPTCHA only after site-key deployment and a successful manual authentication test. Do not promote any confidential library-protection claim until restricted content has actually moved behind authenticated server APIs.
