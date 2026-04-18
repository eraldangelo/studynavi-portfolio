# ADR 0003: Split Smoke vs Regression Testing

## Status

Accepted

## Context

Single broad E2E suite increased feedback time and created coupling between fast confidence checks and deeper scenario coverage.

## Decision

- Keep smoke suite intentionally small and fast (`e2e/smoke.spec.ts`).
- Move deeper destination/fees-updater flows to `e2e/regression.spec.ts`.
- Run:
  - Smoke in standard quality gate (`verify:smoke`).
  - Regression nightly and on `release-*` tags.
- Keep computational matrix checks in script regressions (`scripts/regression-*.ts`).

## Consequences

Positive:
- Faster developer feedback on core health.
- Better isolation when deeper tests fail.
- Cleaner release risk management.

Tradeoffs:
- More test entry points to maintain.
- Requires documentation discipline to avoid suite-scope confusion.
