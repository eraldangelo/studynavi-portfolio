# Security Policy

## Supported Versions

StudyNavi follows a rolling-release model on `main`. Security fixes are applied to the latest deployed version.

## Reporting a Vulnerability

Please do not open public GitHub issues for security findings.

Report privately to:
- Email: `erald.mangubat@example.com`
- Subject: `StudyNavi Security Report`

Include:
- Affected endpoint/file/flow
- Reproduction steps
- Expected vs actual behavior
- Potential impact
- Optional mitigation suggestion

## Response Expectations

- Initial acknowledgment target: within 2 business days
- Triage target: within 5 business days
- Fix timeline: depends on severity and exploitability

## Secret Handling Rules

- Never commit `.env.local`, service account JSON, or private keys.
- Use Firebase App Hosting secrets for runtime credentials.
- Rotate compromised credentials immediately.

## Scope Notes

- In-scope: application code in this repository, API routes, deployment workflow configuration.
- Out-of-scope: social engineering, physical access attacks, third-party service outages.

## Recent Hardening Snapshot (2026-04-07)

- Firestore/Storage bug-report rules were tightened:
  - report documents require authenticated access
  - report image uploads are user-scoped (`reports/{uid}/...`) and type/size restricted
- Bug report submission now enforces signed-in identity and stores actor metadata (`createdByUid`, `createdByEmail`).
- Login SSO token ingestion now prefers URL hash token over query token to reduce accidental token leakage in logs/referrer surfaces.
- Dependency hardening:
  - removed unused `firebase-functions` package
  - pinned `next` / `eslint-config-next` to `16.1.7`
  - upgraded `jspdf` to `4.2.1`
  - added overrides for `node-forge`, `fast-xml-parser`, `dompurify`
- `npm audit --omit=dev` residual is low-severity transitive Firebase/Google chain (`@tootallnate/once`); no high/critical app-level production advisories remain.

## Recent Hardening Snapshot (2026-04-08)

- Protected API routes now require server-verified Firebase ID tokens (`Authorization: Bearer <idToken>`):
  - `/api/chat`
  - `/api/ai/brief-info`
  - `/api/chat/corrections` (staff/admin only)
- AI-costing routes now use shared persistent rate limiting (`__rateLimits`) to work across instances.
- Turnstile verification endpoint now enforces:
  - timeout/retry-safe upstream calls
  - hostname validation
  - action validation (`login` by default)
  - per-client rate limits
- Report privacy tightened:
  - report documents/screenshots are now staff-or-owner readable
  - report creation requires owner UID consistency
- School/provider rendering hardening:
  - removed risky raw HTML rendering for school names
  - outbound school website URLs are protocol-validated (`http`/`https` only)
- Production safety guardrails:
  - E2E auth/mock bypass flags are hard-blocked in production runtime even if env is mis-set
  - TypeScript build errors are no longer ignored in `next.config.ts`

## Recent Hardening Snapshot (2026-04-09)

- Login redirect hardening:
  - `next` redirect targets now accept only internal relative paths (open-redirect patterns are rejected).
- Request identity hardening:
  - server request IP derivation now uses strict IP parsing and explicit proxy trust mode (`TRUST_PROXY_MODE`).
- Runtime alert endpoint hardening:
  - `/api/runtime-alert` now requires authenticated caller context and per-user rate limiting.
  - runtime alert sources are restricted to allowed prefixes (`RUNTIME_ALERT_ALLOWED_SOURCES`, default `pdf.`).
- Firestore report-create hardening:
  - strict create-shape/value checks now block status/email spoofing and unknown fields.
- Auth response normalization:
  - invalid token failures return `401`; auth infrastructure/runtime failures return `503`.
- Turnstile verification tightening:
  - expected action now requires exact match when configured.
  - cross-site origin checks and challenge timestamp freshness checks added.
- SSRF hardening:
  - Brave excerpt fetch now restricts targets to public HTTP(S) hosts and blocks localhost/private/reserved/internal targets.
- Rules assurance:
  - semantic emulator-based rules tests added under `tests/rules/semantic-rules.test.ts`.

## Recent Hardening Snapshot (2026-04-08)

- Browser policy hardening:
  - added baseline CSP via `src/proxy.ts`.
  - CSP still keeps `'unsafe-inline'` for scripts/styles because current Next.js runtime + Turnstile/Maps integrations inject inline bootstrap/style paths.
  - optional stricter rollout mode is available via `CSP_ENABLE_STRICT_REPORT_ONLY=true` to measure breakage risk before enforced tightening.
  - added production HSTS (`Strict-Transport-Security`).
  - protected routes now emit `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`.
- SSRF hardening uplift:
  - Brave excerpt fetch now validates redirect chains (manual redirect mode).
  - each redirect hop is re-validated for public-network-only targets.
  - non-standard ports are blocked, response content-type is restricted, and response body size is capped.
- Claims-first posture tightening:
  - server/client/rules now prioritize explicit claims (`admin`, `staff`, `support`) as authority.
  - legacy staff-domain compatibility is now gated behind explicit claim bridge (`legacy_staff_email_fallback=true`) plus optional runtime bridge flags:
    - `STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE`
    - `NEXT_PUBLIC_STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE`
  - chat-corrections mutation endpoints now require explicit staff/admin claim by default (`STUDYNAVI_REQUIRE_STAFF_CLAIM_FOR_CORRECTIONS=true`).
- Injection hardening:
  - removed raw HTML rendering fallback from modal utility paths.
  - external links in modal content now allow only explicit `http(s)` URLs.
- API abuse/correctness hardening:
  - request-body size caps added for `/api/chat` and `/api/ai/brief-info`.
  - malformed JSON now returns explicit 4xx responses in protected JSON endpoints (`/api/ai/brief-info`, `/api/chat/corrections`, `/api/runtime-alert`, `/api/turnstile/verify`).
- Turnstile trust-chain increment:
  - proof cookie is signed with hostname+fingerprint binding and validated on reuse before upstream verification.
  - server-session creation can require valid turnstile proof (`STUDYNAVI_SESSION_REQUIRE_TURNSTILE_PROOF=true`) except explicit Pathfinder SSO source handoff.
- Ops drift hardening:
  - added `npm run ops:check:drift` (`scripts/check-ops-drift.js`) for repo + cloud drift checks (TTL/App Check/alerts when auth is available).
  - added scheduled workflow `.github/workflows/ops-drift-check.yml`.

## Recent Hardening Snapshot (2026-04-09)

- Server-trusted protected-page boundary:
  - server issues/verifies `__studynavi_session` httpOnly cookie via `/api/auth/session`.
  - proxy now blocks unauthenticated protected routes before page render and redirects to `/login?next=...`.
  - `/login` auto-redirects authenticated session holders to sanitized internal `next` target.
- Session/auth governance:
  - session cookie TTL is configurable (`STUDYNAVI_SESSION_TTL_SECONDS`).
  - production requires `STUDYNAVI_SESSION_SECRET`.
  - session create/delete emits structured audit logs.
- CSP migration:
  - enforced CSP now includes reporting endpoint (`/api/csp-report`).
  - strict CSP report-only mode defaults to `true` in production and `false` in non-production (set `CSP_ENABLE_STRICT_REPORT_ONLY=true` locally to rehearse stricter policy safely).
- Release posture:
  - staging rollout and manual promotion workflows added:
    - `.github/workflows/firebase-app-hosting-staging-rollout.yml`
    - `.github/workflows/promote-to-production.yml`

## Remaining Boundary (Design Constraint)

- Firebase Auth sign-in is still client-initiated (`signInWithEmailAndPassword` / `signInWithCustomToken`) to preserve current Pathfinder contract and StudyNavi login UX.
- Full claims-only enforcement still depends on claims hygiene in Firebase Auth (assignment/revocation operations are outside this repo and documented in ops runbooks).

## Operational Cutover Controls (2026-04-09)

- Claims cutover:
  - `STUDYNAVI_CLAIMS_CUTOVER_MODE=bridge|strict`
  - strict mode hard-disables legacy bridge fallback.
  - readiness checks:
    - `npm run check:claims-cutover`
    - `npm run check:claims-cutover:cloud`
- CSP cutover:
  - `CSP_ENABLE_STRICT_REPORT_ONLY` for staged violation collection.
  - `CSP_ENABLE_STRICT_ENFORCE` for strict enforcement after report triage.
  - CSP reports are ingested at `/api/csp-report`.
- Drift and release enforcement:
  - repo + cloud drift modes are separated (`ops:check:drift`, `ops:check:drift:cloud`).
  - staging/promotion workflows include Pathfinder contract and cloud drift gating.
- Recovery discipline:
  - `npm run check:recovery-drill` validates restore/rollback drill assets and dry-run restore path.

## Recent Hardening Snapshot (2026-04-09, Login Reliability Follow-up)

- Turnstile proof validation now uses a stable request binding suitable for App Hosting proxy hops (instead of edge-IP-derived binding).
- Turnstile proof cookie behavior was tuned for live auth flow stability:
  - proof cookie now uses `SameSite=Lax` with host+binding+TTL signature validation still enforced server-side.
- Login client explicitly sends credentials on Turnstile verification request to avoid browser variance on cookie attach.
- Deployment discipline updated to require dual-backend sync (`studio` -> `studio-asia`) per release to prevent stale auth config drift.

