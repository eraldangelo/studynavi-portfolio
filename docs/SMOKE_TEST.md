# StudyNavi Smoke Test

Use this before commit/release to catch regressions quickly after feature work or refactors.

## 1) Automated Smoke (Required)

Run from project root:

```bash
npm run verify:smoke
```

Optional full local CI mirror:

```bash
npm run ci:local
```

Optional maintenance check:

```bash
npm run doctor
npm run ops:check:drift
npm run test:contract:pathfinder
npm run check:claims-cutover
npm run check:recovery-drill
```

Pass criteria:

- No TypeScript errors
- No ESLint errors
- Secret scan passes (`npm run check:secrets`)
- Regression suite passes (`npm run test:regression`)
- Playwright smoke suite passes (`npm run test:e2e:smoke`, included in `npm run verify:smoke`)
- Java preflight passes for emulator-backed rules testing (`npm run check:java`)
- Smoke suite remains intentionally small/fast (5 core browser tests).
- Deeper browser checks run separately via `npm run test:e2e:regression` (nightly + release tags).
- PDF smoke perf checks pass:
  - preview timing metrics are emitted
  - preview/download remain within configured smoke budgets
  - download path confirms preview reuse when fingerprint is unchanged
- Next build succeeds
- Modal content validation passes (`npm run check:modals`)
- File-length policy passes (`npm run check:file-lengths`)

Notes:
- Regression checks are intentionally lightweight and target high-risk logic in country computations and wizard PDF triggers.
- Regression also includes deterministic golden-value snapshots against fixture rates/fees so totals do not drift silently.
- Regression includes payment-type + scholarship edge guardrails for manual/deposit behavior across AU/CA/NZ/IE.
- In GitHub, `Quality Gate` should be green before rollout.

## 2) Manual Core Flow Smoke (Required)

## 2.1 Authentication

- Login page renders correctly.
- Unauthenticated access to protected pages is blocked server-side and redirects to `/login?next=...`.
- Successful login lands on `/`.
- Logout returns user to login.
- Pathfinder SSO handoff (`/login?next=...&source=pathfinder&ssoToken=...`) still signs in and redirects to `next`.
- Live chain check on both backends:
  - `POST /api/turnstile/verify` -> `200`
  - `POST /api/auth/session` -> `200`
  - no recurring `Captcha proof is required.` in server logs for valid login attempts

## 2.2 Wizard Navigation + Persistence

- Step header renders and updates as user moves through steps.
- Next/Previous navigation works.
- Page refresh preserves current answers from local storage.
- Complete flow reaches the computation/review state without runtime errors.

## 2.3 School / Program / Modals

- School and program sections render and accept selections.
- Info modal opens and closes correctly.
- Destination-specific modal content appears for selected country.

## 2.4 Financials + Destination Logic

- Payment details card renders and updates totals.
- Computation sheet values update when destination or payment type changes.
- Manual and tuition-deposit payment types must keep "Payment due" non-negative and consistent with entered values.
- Country-specific dependent logic is correct:
  - Australia: spouse/child dependent visa split
  - New Zealand: school-age vs non-school-age dependent visa split
  - Canada: spouse OWP, child visitor/study permit, age-tier medical rows
  - Ireland: no dependent rows in initial expenses section

## 2.5 PDF Generation

- PDF generation action is enabled only when required fields are complete.
- Generated PDF includes expected sections and does not throw client errors.

## 2.6 Fees Updater

- `/fees-updater` loads and category switching works.
- Save/edit/cancel controls work for each country editor.
- Updated values refresh from Firestore after save.

## 2.7 Supporting Pages + APIs

- `/partnerschools`, `/report-problem`, and `/isam-training` render.
- AI chat endpoint handles method validation and response errors gracefully.
- Turnstile verification rejects invalid token payloads.

## 3) Access Smoke Matrix

Validate at least:

- Unauthenticated visitor
- Authenticated consultant/staff account
- Authenticated admin/operations account (if available)

Minimum checks:

- protected route redirect behavior
- data visibility by account type
- edit permissions on Fees Updater

## 4) Latest Verified Run

Date: 2026-04-07

Automated results:

- `npm run verify:smoke` -> PASS
- `npm run verify` -> PASS
- `npm run typecheck` -> PASS
- `npm run lint` -> PASS
- `npm run test:regression` -> PASS
- `npm run test:e2e:smoke` -> PASS
- `npm run build` -> PASS
- `npm run check:modals` -> PASS
- `npm run check:file-lengths` -> PASS
- `npm audit --omit=dev` -> low-severity transitive advisory only (`@tootallnate/once` chain)

Routes confirmed during build:

- `/`
- `/_not-found`
- `/api/ai/brief-info`
- `/api/chat`
- `/api/chat/corrections`
- `/api/report-bug`
- `/api/report-bug/recent`
- `/api/turnstile/verify`
- `/fees-updater`
- `/icon.png`
- `/isam-training`
- `/login`
- `/partnerschools`
- `/report-problem`

Local runtime smoke (`http://127.0.0.1:8080`):

- `GET /` -> `200`
- `GET /login` -> `200`
- `GET /fees-updater` -> `200`
- `GET /partnerschools` -> `200`
- `GET /report-problem` -> `200`
- `GET /api/chat` -> `405` (expected; POST-only)
- `POST /api/turnstile/verify` with invalid token -> `403` (expected)
- `POST /api/auth/session` without auth -> `401` (expected)
- Login HTML check -> no `Firebase failed to initialize` banner

Hosting note:

- Production deployment target is Firebase App Hosting.
- Use `docs/RELEASE_RUNBOOK.md` for rollout and rollback steps.
