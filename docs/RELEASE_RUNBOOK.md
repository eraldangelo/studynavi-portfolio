# Release Runbook

Purpose: deterministic, auditable staging -> production promotion for StudyNavi on Firebase App Hosting.

## 0) Backend Topology (Important)

- `studio` (`us-central1`) is the source backend connected to GitHub.
- `studio-asia` (`asia-southeast1`) serves production traffic and must be synced after each `studio` rollout.
- Do not assume `studio` rollout automatically updates `studio-asia`.

## 1) Preconditions

- Release ref is `main` or `release-*`.
- Required runtime secrets exist in App Hosting Secret Manager:
  - `OPENAI_API_KEY`
  - `FIREBASE_SERVICE_ACCOUNT`
  - `BRAVE_SEARCH_API_KEY`
  - `TURNSTILE_SECRET_KEY`
  - `STUDYNAVI_SESSION_SECRET`
- Runtime cutover controls are explicit in `apphosting.yaml`:
  - `STUDYNAVI_CLAIMS_CUTOVER_MODE`
  - `STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE`
  - `CSP_ENABLE_STRICT_REPORT_ONLY`
  - `CSP_ENABLE_STRICT_ENFORCE`

## 2) Required Validation Gates

Run locally before pushing release candidates:

```bash
npm run verify
npm run test:e2e:smoke
npm run test:e2e:regression
npm run test:rules
npm run test:contract:pathfinder
npm run ops:check:drift
npm run check:claims-cutover
npm run check:recovery-drill
```

Cloud-enforced checks for release/promotion operators:

```bash
npm run ops:check:drift:cloud
npm run check:claims-cutover:cloud
```

## 3) Staging Rollout

Workflow: `.github/workflows/firebase-app-hosting-staging-rollout.yml`

1. Push to `staging` or dispatch manually with `DEPLOY_STUDIO_STAGING`.
2. Verify job enforces:
   - `npm run verify:smoke`
   - `npm run test:contract:pathfinder`
   - cloud-state drift gate (`npm run ops:check:drift:cloud`)
3. Rollout job deploys staging backend.
4. Run `npm run postdeploy:check` against staging URL.

## 4) Production Promotion

Workflow: `.github/workflows/promote-to-production.yml`

1. Dispatch workflow with:
   - `release_ref`: `main` or `release-*`
   - `deploy_confirmation`: `PROMOTE_STAGING_TO_PROD`
2. Verify job enforces:
   - `npm run verify`
   - `npm run test:contract:pathfinder`
   - `npm run ops:check:drift:cloud`
   - `npm run check:claims-cutover:cloud`
3. Promote job creates App Hosting production rollout for selected ref.

## 4.1) Live Operator Rollout (Dual Backend, Verified 2026-04-09)

Use this when you need immediate production sync outside GitHub Actions:

1. Roll out Git commit to source backend:

```bash
firebase apphosting:rollouts:create studio -b main --project your-firebase-project-id --force
```

2. Sync source build to Asia backend:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/release/sync-studio-asia-rollout.ps1
```

Optional explicit source build:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/release/sync-studio-asia-rollout.ps1 -SourceBuildId build-2026-04-09-009
```

3. Validate both login endpoints return updated CSP/session behavior:

- `https://staging.your-app.example.com/login`
- `https://your-app.example.com/login`

4. Run postdeploy checks:

```bash
npm run postdeploy:check
```

## 4.2) Secret Rotation + Rollout Sequence (Auth-Critical)

Use this sequence whenever rotating auth-critical secrets (`TURNSTILE_SECRET_KEY`, `STUDYNAVI_SESSION_SECRET`, `FIREBASE_SERVICE_ACCOUNT`):

1. Add a new secret version in project Secret Manager (same secret name, new version).
2. Roll out source backend (`studio`) to pick up the latest secret version:

```bash
firebase apphosting:rollouts:create studio -b main --project your-firebase-project-id --force
```

3. Sync source build to `studio-asia`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/release/sync-studio-asia-rollout.ps1
```

4. Validate login/session on both endpoints:
- `POST /api/turnstile/verify` should return `200` for a solved captcha.
- `POST /api/auth/session` should return `200` after Firebase sign-in.
- no recurring `auth/firebase-app-check-token-is-invalid` during normal login.

5. Run postdeploy checks:

```bash
npm run postdeploy:check
```

Important:
- updating Secret Manager versions without rollout is not considered complete for production cutover.
- keep `studio` and `studio-asia` on parity before declaring incident closed.

## 5) Pathfinder Compatibility Gate

`npm run test:contract:pathfinder` is mandatory for staging and production release paths.

Covered contract:

- `/login` entry semantics
- `next` preservation and sanitization
- `source` parameter handling
- `ssoToken` extraction behavior
- custom-token login + server-session establishment contract

## 6) CSP Cutover Discipline

Default production posture:

- `CSP_ENABLE_STRICT_REPORT_ONLY=true`
- `CSP_ENABLE_STRICT_ENFORCE=false`

Strict cutover steps:

1. Collect CSP reports from `/api/csp-report`.
2. Triage and fix recurring violations.
3. Enable `CSP_ENABLE_STRICT_ENFORCE=true` in staging.
4. Re-run required gates and manual smoke.
5. Promote when runtime integrations remain stable.

Rollback:

- Set `CSP_ENABLE_STRICT_ENFORCE=false`
- keep report-only enabled to continue triage

## 7) Restore / Rollback Drill Discipline

Quarterly minimum:

1. Run recovery drill validation:

```bash
npm run check:recovery-drill
```

2. Run fees backup + dry-run restore:

```bash
npm run backup:fees
npm run restore:fees -- --file backups/fees/<backup-file>.json
```

3. Review rollback plan output:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/release/rollback.ps1 -TargetCommit <hash>
```

## 8) Incident Rollback Procedure

1. Revert bad commit(s) with a new commit (no history rewrite).
2. Trigger rollout for reverted ref.
3. Re-run Asia sync:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/release/sync-studio-asia-rollout.ps1
```

3. Validate:
   - login/session flow
   - protected pages
   - wizard/fees/PDF flows
   - Pathfinder SSO contract (`npm run test:contract:pathfinder`)
4. Close incident only after smoke + stakeholder confirmation.

