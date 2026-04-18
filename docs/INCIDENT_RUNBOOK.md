# Incident Runbook

Purpose: reduce mean time to detect and recover for production issues.

## 1) Severity Model

- `SEV-1`: Core flows unusable (login blocked, wizard broken, PDF generation unavailable).
- `SEV-2`: Partial degradation (one destination flow affected, fees updater save failures).
- `SEV-3`: Non-blocking defects (copy issues, minor UI glitches, performance warnings).

## 2) First 10 Minutes

1. Confirm impact scope:
   - all users or specific role
   - all destinations or specific country
2. Capture evidence:
   - timestamp (UTC)
   - route
   - user role
   - console/server error message
3. Assign incident owner and start timeline notes.
4. Check alert state:
   - `StudyNavi PDF failures spike`
   - `StudyNavi API failures spike`

## 3) Diagnostic Checklist

- Auth
  - `/login` renders
  - protected routes redirect correctly
- Wizard/Computation
  - step navigation works
  - country-specific dependent rows render as expected
- PDF
  - preview loads at review step
  - download action triggers and completes
- Fees Updater
  - load/save/edit/cancel functions work

Known DNS failure mode (`hosted.app` NXDOMAIN, observed on 2026-03-26):

- Symptom:
  - browser shows `DNS_PROBE_FINISHED_NXDOMAIN` for StudyNavi URL
  - app appears down even when no rollout/deploy changes happened
- Why this happens:
  - resolver path can fail on a specific delegated zone such as `us-central1.hosted.app`
  - backend can still be healthy while some resolvers return `NXDOMAIN`
- Quick checks:
  - `nslookup your-app.example.com`
  - `nslookup your-app.example.com 8.8.8.8`
  - `curl -I https://your-app.example.com/`
- If broken:
  - verify backend health first (`firebase apphosting:backends:list`)
  - if resolver-specific failure is confirmed, switch user-facing URL to healthy backend hostname
  - update Firebase Hosting redirect (`firebase.json`) and redeploy hosting
  - update postdeploy base URL (`scripts/postdeploy-check.js`)
  - communicate temporary DNS workaround to users (Cloudflare/Google DNS + cache flush)

Known login failure mode (App Check enforced on Firebase Auth):

- Symptom:
  - valid users report login failure with UI message `Invalid email or password`
  - browser/network response from Firebase Auth includes `Firebase App Check token is invalid` (`401`)
- Why this happens:
  - Firebase App Check enforcement includes `identitytoolkit.googleapis.com`
  - StudyNavi build/runtime is missing `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY`, or App Check web app config drifted
- Quick checks:
  - confirm `apphosting.yaml` contains `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` with `availability: [BUILD, RUNTIME]`
  - confirm deployed app ID `your-firebase-app-id` has `recaptchaEnterpriseConfig.siteKey` in Firebase App Check config
  - hard-refresh or use incognito after rollout (to avoid stale bundle)
- If broken:
  - patch env/config drift, trigger new App Hosting rollout, then retest login

Known claims cutover failure mode (strict mode enabled before claim migration completed):

- Symptom:
  - staff users lose access to staff/admin-only routes and report lists
  - support/admin endpoints return `403` unexpectedly
- Quick checks:
  - run `npm run check:claims-cutover:cloud`
  - verify `STUDYNAVI_CLAIMS_CUTOVER_MODE`
  - verify bridge flags in App Hosting runtime config
- If broken:
  - temporarily set `STUDYNAVI_CLAIMS_CUTOVER_MODE=bridge`
  - if needed, enable temporary bridge flags
  - re-issue missing authoritative claims and revert bridge flags back to `false`

Known CSP strict-enforce failure mode:

- Symptom:
  - third-party integrations fail after deploy (blocked script/style/frame/connect)
- Quick checks:
  - inspect `/api/csp-report` logs for repeated violations
  - confirm `CSP_ENABLE_STRICT_ENFORCE` and `CSP_ENABLE_STRICT_REPORT_ONLY` values
- If broken:
  - set `CSP_ENABLE_STRICT_ENFORCE=false`
  - keep report-only enabled for triage and patching

## 4) Containment Options

1. Fast revert (preferred for SEV-1/SEV-2):
   - revert last bad commit on `main`
   - redeploy via App Hosting rollout
2. Feature flag fallback:
   - disable non-critical feature flags if available
3. Temporary traffic message:
   - notify internal users of degraded feature path

## 5) Recovery Validation

Run the required checks from `docs/SMOKE_TEST.md` plus:

- destination sanity (AU/CA/NZ/IE)
- PDF preview + download
- fees updater save path

Close incident only after successful smoke and stakeholder confirmation.

## 6) Postmortem Requirements

- root cause summary
- trigger and detection gap
- corrective action (code/process/test)
- due date + owner

