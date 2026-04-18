# Resilience and Governance

Purpose: make recovery, rollback, and survivability procedures measurable and repeatable.

## 1) Recovery Assets

- Fees backup: `npm run backup:fees`
- Fees restore: `npm run restore:fees -- --file <backup.json> [--apply]`
- Release rollback helper: `scripts/release/rollback.ps1`
- Recovery drill validator: `npm run check:recovery-drill`

## 2) Required Drill Frequency

- Quarterly minimum for production operations.
- Mandatory after major auth/session/cutover changes.

## 3) Standard Drill Procedure

1. Validate drill assets:

```bash
npm run check:recovery-drill
```

2. Generate fresh backup snapshot:

```bash
npm run backup:fees
```

3. Execute restore dry-run against backup:

```bash
npm run restore:fees -- --file backups/fees/<backup-file>.json
```

4. Review rollback plan for current candidate commit:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/release/rollback.ps1 -TargetCommit <hash>
```

5. Execute post-restore validation checklist:
   - login + protected routes
   - wizard destination computations
   - PDF preview/download
   - fees updater read/write
   - Pathfinder SSO contract smoke
   - dual-backend deployment parity (`studio` and `studio-asia` on same auth/session posture)

## 4) Acceptance Criteria

A drill is successful only when all are true:

- `npm run check:recovery-drill` passes
- restore dry-run succeeds with no schema contract errors
- rollback plan is reproducible and understood by on-call operator
- post-restore validation steps pass
- results and evidence are recorded in incident/release notes

## 5) Rollback Triggers

Trigger rollback for:

- login/session outage
- broken protected-page boundary
- PDF generation failures at scale
- fees write corruption or major contract drift
- Pathfinder SSO compatibility regression

## 6) Secret Rotation Discipline

Rotate immediately on exposure suspicion:

- `OPENAI_API_KEY`
- `BRAVE_SEARCH_API_KEY`
- `TURNSTILE_SECRET_KEY`
- `STUDYNAVI_SESSION_SECRET`
- Firebase service account credentials

Post-rotation minimum:

1. update secrets in App Hosting
2. roll out source backend + sync asia backend
3. run `npm run postdeploy:check`
4. run login + session smoke

## 7) Monitoring Baseline

Required production monitoring controls:

- Uptime check for StudyNavi public URL
- Alert policies:
  - `StudyNavi PDF failures spike`
  - `StudyNavi API failures spike`

Verification commands:

```bash
npm run postdeploy:check
npm run ops:check:drift
npm run ops:check:drift:cloud
```
