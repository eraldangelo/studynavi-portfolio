# StudyNavi

StudyNavi is a consultant-facing Next.js application used to run a guided study-planning wizard and generate downloadable study-plan PDFs for students.

Production deployment uses **Firebase App Hosting**.

## What This Repo Contains

- Next.js App Router frontend (`src/app`, `src/components`)
- Wizard state + orchestration hook (`src/hooks/study/use-study-wizard.ts`)
- Server API route for AI brief generation (`src/app/api/ai/brief-info/route.ts`)
- PDF generation pipeline (`src/lib/pdf/*`)
- Destination fee/config logic (`src/services/*`, `src/lib/*`)

## Documentation Map

- Deep architecture and business logic: `docs/blueprint.md`
- Destination computation invariants: `docs/COUNTRY_LOGIC_CONTRACT.md`
- Release and rollback: `docs/RELEASE_RUNBOOK.md`
- Incident handling: `docs/INCIDENT_RUNBOOK.md`
- Operations handover: `docs/OPERATIONS_HANDOVER.md`
- Smoke checklist: `docs/SMOKE_TEST.md`
- Security and support docs: `docs/SECURITY.md`, `docs/SUPPORT.md`
- Access governance: `docs/ACCESS_GOVERNANCE.md`
- Resilience/recovery governance: `docs/RESILIENCE_GOVERNANCE.md`

## Quick Start (Local)

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` at repo root using `.env.local.example` as source.

3. Set required values:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_FIREBASE_*`
- `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` (required when Firebase App Check is enforced for Auth / `identitytoolkit`)
- one server-side Firebase admin option:
  - `FIREBASE_SERVICE_ACCOUNT`, or
  - `GOOGLE_APPLICATION_CREDENTIALS`
- optional hardening vars:
  - `STUDYNAVI_STAFF_EMAIL_DOMAIN` (default: `example.com`)
  - `NEXT_PUBLIC_STUDYNAVI_STAFF_EMAIL_DOMAIN` (default: `example.com`)
  - `STUDYNAVI_CLAIMS_CUTOVER_MODE` (`bridge` or `strict`, default: `bridge`)
  - `NEXT_PUBLIC_STUDYNAVI_CLAIMS_CUTOVER_MODE` (`bridge` or `strict`, default: `bridge`)
  - `STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE` (default: `false`, temporary migration bridge only)
  - `NEXT_PUBLIC_STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE` (default: `false`, UI compatibility bridge flag)
  - `STUDYNAVI_REQUIRE_STAFF_CLAIM_FOR_CORRECTIONS` (default: `true`)
  - `STUDYNAVI_SESSION_SECRET` (required in production; server-trusted session HMAC key)
  - `STUDYNAVI_SESSION_TTL_SECONDS` (default: `43200`)
  - `STUDYNAVI_SESSION_REQUIRE_TURNSTILE_PROOF` (default: `true`; captcha proof required for manual session minting)
  - `TURNSTILE_EXPECTED_ACTION` (default: `login`)
  - `TURNSTILE_ALLOWED_HOSTNAMES` (comma-separated hostnames)
  - `TRUST_PROXY_MODE` (`auto` | `managed` | `cloudflare` | `none`; default `auto`)
  - `RUNTIME_ALERT_ALLOWED_SOURCES` (comma-separated source prefixes, default: `pdf.`)
  - `CSP_ENABLE_STRICT_REPORT_ONLY` (default: `true` in production, `false` in dev/test; set `false` in production only for emergency rollback)
  - `CSP_ENABLE_STRICT_ENFORCE` (default: `false`; enable only after strict report-only triage is clean)

4. Run local dev:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Deployment (Primary Path)

StudyNavi production uses Firebase App Hosting project `your-firebase-project-id` with:
- source backend: `studio` (`us-central1`)
- traffic backend: `studio-asia` (`asia-southeast1`)

```bash
firebase apphosting:rollouts:create studio -b main -f --project your-firebase-project-id --non-interactive
```

After rolling out `studio`, sync the same build to `studio-asia`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/release/sync-studio-asia-rollout.ps1
```

Production URL:
- `https://your-app.example.com/`

Staging support (repo-managed):
- staging rollout workflow: `.github/workflows/firebase-app-hosting-staging-rollout.yml`
- manual promotion workflow: `.github/workflows/promote-to-production.yml`

## Integration Contract (Pathfinder SSO)

The StudyNavi login contract used by Pathfinder is intentionally stable:
- login route remains `/login`
- SSO token input remains `ssoToken` (query or hash)
- redirect target remains `next`
- additional parameters (including `source`) are preserved
- sign-in path remains Firebase custom-token sign-in (`signInWithCustomToken`)

## Testing and Quality Gates

Core commands:

```bash
npm run verify
npm run test:e2e:smoke
npm run verify:smoke
```

Useful extended checks:

```bash
npm run check:java
npm run test:e2e:regression
npm run test:rules
npm run ops:check:drift
npm run ops:check:drift:cloud
npm run test:contract:pathfinder
npm run check:claims-cutover
npm run check:claims-cutover:cloud
npm run check:recovery-drill
npm run ci:local
npm run doctor
```

Note: emulator-backed rules tests (`npm run test:rules`) require Java 17+; Temurin 21 is the recommended baseline.

## Git Hook Notes

- `pre-push` runs a lightweight local gate (`npm run prepush:local`) with Node memory cap.
- Tune memory if needed:
  - `STUDYNAVI_PREPUSH_NODE_MEM_MB=6144 git push`
- Force full local gate (heavy):
  - `STUDYNAVI_PREPUSH_MODE=full git push`
- CI/promotion workflows remain the authoritative heavy blockers.

CI/automation workflows live under `.github/workflows/` (quality gate, rollout, advisory security, uptime, regression, label sync, stale handling).

## Known Limitations / Future Extensions

- PDF behavior is intentionally constrained for stability:
  - review/download output must preserve current business format
  - non-genuine multi-recommendation body rendering remains an extension point (see `docs/blueprint.md`)
- Destination computation logic is intentionally explicit by country to keep rules auditable; adding new destinations requires updating destination-specific logic + regression coverage.
- Wizard validation remains intentionally permissive in selected areas; tightening validation should be done with regression-test updates and rollout caution.
- Fees updater assumes Firestore `fees/*` document contract stays stable; schema changes require coordinated updates to calculator and updater paths.
- `hosted.app` DNS behavior can vary by resolver path; if users report `NXDOMAIN` while backend health is normal, follow `docs/INCIDENT_RUNBOOK.md` DNS remediation steps.
- Turnstile proof is validated server-side and bound to client fingerprint/hostname, but Firebase Auth still completes client-side sign-in (`signInWithEmailAndPassword`) by design to preserve existing Pathfinder-compatible login/SSO flow.
- Protected page access now enforces a server-trusted session cookie at the proxy boundary before protected content renders. `AuthGuard` remains as a secondary client UX fallback.

## Troubleshooting (Quick)

- `Missing OPENAI_API_KEY`:
  - confirm `.env.local` is in repo root
  - restart dev server after changes
- PDF download remains disabled:
  - confirm review step prerequisites are met
  - for non-genuine flow, ensure required recommendation fields are completed per current rules
- Runtime/API errors in production:
  - check logs for `[runtime-alert]`
  - run `npm run postdeploy:check`
- Login rejects valid credentials:
  - confirm App Hosting env includes `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` in both `BUILD` and `RUNTIME` availability
  - confirm Firebase App Check web app config has `recaptchaEnterpriseConfig.siteKey` for StudyNavi app ID `your-firebase-app-id`



