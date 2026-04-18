# Support

## Primary Contact

- Owner: `erald.mangubat@example.com`

## Before Requesting Help

Please include:
- Branch/commit hash
- Route and user flow affected
- Destination context (AU/CA/NZ/IE)
- Console/server error output
- Screenshot or short recording (if UI issue)

## Fast Self-Checks

Run:

```bash
npm run verify:smoke
npm run test:e2e:regression
npm run postdeploy:check
npm run test:contract:pathfinder
npm run ops:check:drift
npm run check:claims-cutover
npm run check:recovery-drill
```

Release operator cloud checks:

```bash
npm run ops:check:drift:cloud
npm run check:claims-cutover:cloud
```

## Incident Paths

- Release/deploy issues: `docs/RELEASE_RUNBOOK.md`
- Runtime outage/degradation: `docs/INCIDENT_RUNBOOK.md`
- Country-computation expectations: `docs/COUNTRY_LOGIC_CONTRACT.md`

## Login Emergency Triage (Turnstile/App Check/Session)

If users report:

- `Unable to establish secure session. Please refresh and sign in again.`
- `auth/firebase-app-check-token-is-invalid`
- `POST /api/auth/session -> 403`

run this sequence:

1. Confirm Turnstile verifies:
   - browser network should show `POST /api/turnstile/verify` -> `200`.
2. Confirm server session minting:
   - browser network should show `POST /api/auth/session` -> `200`.
3. If `studio` works but `studio-asia` fails, backend sync is stale:

```powershell
firebase apphosting:rollouts:create studio -b main --project your-firebase-project-id --force
powershell -ExecutionPolicy Bypass -File scripts/release/sync-studio-asia-rollout.ps1
```

4. Retest in Incognito to bypass stale cookies/cache.

Noise note:
- Turnstile console warnings like `xr-spatial-tracking`, PAT challenge, codec parse warnings, and preload warnings are expected third-party noise and not primary auth blockers by themselves.

## Local Works, Live Fails (Fast Interpretation)

Most common cause: deployment/environment drift, not UI logic.

- local dev uses `.env.local`
- live backends use App Hosting env + Secret Manager + rollout state
- `studio` and `studio-asia` can drift if Asia sync is skipped

If local login succeeds but live fails, treat as rollout parity/config drift first:

```powershell
firebase apphosting:rollouts:create studio -b main --project your-firebase-project-id --force
powershell -ExecutionPolicy Bypass -File scripts/release/sync-studio-asia-rollout.ps1
```


