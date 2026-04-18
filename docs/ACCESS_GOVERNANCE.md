# Access Governance

Purpose: keep StudyNavi RBAC claims-authoritative while giving operators a controlled migration/cutover path.

## 1) Role Authority Model

Authoritative claims:

- `admin: true` -> admin + staff authority
- `staff: true` -> staff authority
- `support: true` -> staff authority

Legacy compatibility bridge (temporary, controlled):

- claim: `legacy_staff_email_fallback: true`
- verified staff-domain email
- runtime bridge enabled

Cutover mode (`STUDYNAVI_CLAIMS_CUTOVER_MODE`):

- `bridge` (default): claims-first + bridge allowed when bridge flags are enabled
- `strict`: bridge hard-disabled even if bridge flags are accidentally set

Bridge flags:

- `STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE`
- `NEXT_PUBLIC_STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE`

## 2) Where Role Truth Is Enforced

- API authorization: `src/lib/server/api-auth.ts`
- Session role minting: `src/app/api/auth/session/route.ts`
- Firestore rules: `firebase/firestore.rules`
- Storage rules: `firebase/storage.rules`
- Client read-only visibility helpers: `src/components/report-bug/RecentReports.tsx`

## 3) Migration Readiness Checks

Repo contract checks:

```bash
npm run check:claims-cutover
```

Cloud inventory checks (requires Firebase Admin credentials):

```bash
npm run check:claims-cutover:cloud
```

Cloud check output includes:

- total users scanned
- users with authoritative claims (`admin`/`staff`/`support`)
- users with legacy bridge claim
- users that are legacy-only (bridge claim without authoritative claim)

## 4) Cutover Procedure (Bridge -> Strict)

1. Ensure claim issuance is complete for staff/support/admin accounts.
2. Run `npm run check:claims-cutover:cloud` until `legacyOnly=0`.
3. Keep bridge flags `false` in App Hosting env.
4. Set `STUDYNAVI_CLAIMS_CUTOVER_MODE=strict`.
5. Deploy to staging and run:
   - `npm run test:contract:pathfinder`
   - `npm run test:rules`
   - `npm run verify:smoke`
6. Promote to production only after staging is clean.

## 5) Rollback Procedure (Strict -> Bridge)

Use only if claims issuance is wrong or missing and staff access is blocked:

1. Set `STUDYNAVI_CLAIMS_CUTOVER_MODE=bridge`.
2. If needed, temporarily set:
   - `STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE=true`
   - `NEXT_PUBLIC_STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE=true`
3. Roll out and verify staff/admin endpoints recover.
4. Re-issue missing claims and return bridge flags to `false`.

## 6) Access Review Cadence

- Weekly: review all admin/staff/support claim holders.
- Weekly: review privileged audit logs for unexpected elevation.
- Monthly: run cloud cutover check and track legacy-only count trend.
- Quarterly: prove strict mode readiness in staging.

## 7) Acceptance Criteria

Cutover-ready means all are true:

- `legacyOnly=0` in cloud claims inventory
- bridge flags are `false` in App Hosting runtime config
- `STUDYNAVI_CLAIMS_CUTOVER_MODE=strict` passes staging smoke/regression/contract/rules tests
- no Pathfinder SSO regression observed in staging

