# Operations Handover

Purpose: transfer ongoing StudyNavi ownership with enforceable run procedures, not tribal knowledge.

## 1) Critical Runtime Facts

- Runtime: Node.js 20
- Emulator semantic rules tests require Java 17+ (Temurin 21 recommended)
- Hosting: Firebase App Hosting
- Production URL: `https://your-app.example.com/`
- Main branch: `main`

## 2) Required Secrets and Config

Secrets:

- `OPENAI_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT`
- `BRAVE_SEARCH_API_KEY`
- `TURNSTILE_SECRET_KEY`
- `STUDYNAVI_SESSION_SECRET`

Public/runtime env contracts:

- `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` (BUILD + RUNTIME)
- `STUDYNAVI_SESSION_TTL_SECONDS`
- `STUDYNAVI_SESSION_REQUIRE_TURNSTILE_PROOF`
- `STUDYNAVI_CLAIMS_CUTOVER_MODE` (`bridge` or `strict`)
- `STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE`
- `NEXT_PUBLIC_STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE`
- `CSP_ENABLE_STRICT_REPORT_ONLY`
- `CSP_ENABLE_STRICT_ENFORCE`

## 3) Daily/Release Control Surface

- Server session boundary: `/api/auth/session` + `__studynavi_session` cookie + `src/proxy.ts`
- Claims governance: `docs/ACCESS_GOVERNANCE.md`
- Audit logs: `src/lib/server/audit-log.ts`
- Drift checks: `scripts/check-ops-drift.js`
- CSP reports: `/api/csp-report`
- Recovery drills: `scripts/release/validate-recovery-drill.js`
- Pathfinder contract checks: `scripts/contract-tests-pathfinder.ts`

## 4) Mandatory Quality Gates

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

Promotion-only cloud gates:

```bash
npm run ops:check:drift:cloud
npm run check:claims-cutover:cloud
```

## 5) Operational Cadence

- Weekly:
  - review privileged audit logs
  - run `npm run ops:check:drift`
- Monthly:
  - run cloud drift + claims inventory checks
  - review bridge dependency counts
- Quarterly:
  - execute restore/rollback drill checklist
  - rehearse CSP strict-enforce in staging

## 5.1) Deployment Discipline (Do Not Skip)

- Always deploy `studio` first (Git-connected source backend).
- Always sync `studio-asia` immediately after `studio` rollout.
- Required operator commands:

```bash
firebase apphosting:rollouts:create studio -b main --project your-firebase-project-id --force
```

```powershell
powershell -ExecutionPolicy Bypass -File scripts/release/sync-studio-asia-rollout.ps1
```

- Production acceptance requires both backends updated, not just one.

## 6) High-Risk Areas

- Firebase Auth + App Check integration
- server session minting and proxy-protected routes
- fees updater writes (`fees/*`)
- PDF generation path and recovery
- runtime alert ingestion and monitoring
- claims bridge drift between `bridge` and `strict` modes

## 7) Release/Promotion Entry Criteria

- All mandatory quality gates pass.
- No unresolved SEV-1/SEV-2 incidents.
- Pathfinder contract gate passes.
- Drift cloud checks pass for target project.
- Claims cutover cloud check has no blocker failures.

## 8) Key Docs

- `docs/README.md`
- `docs/RELEASE_RUNBOOK.md`
- `docs/INCIDENT_RUNBOOK.md`
- `docs/ACCESS_GOVERNANCE.md`
- `docs/RESILIENCE_GOVERNANCE.md`
- `docs/SMOKE_TEST.md`
- `docs/SUPPORT.md`

