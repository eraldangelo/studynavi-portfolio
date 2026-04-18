# StudyNavi Portfolio Tour

Purpose: quick walkthrough of what StudyNavi solves and how it is engineered.

## Problem and Product

StudyNavi helps education consultants produce consistent, country-specific study plan computations and downloadable guides (PDF) with reduced manual error.

## Architecture Snapshot

- Frontend: Next.js App Router + TypeScript
- Compute engine: destination-specific financial modules (AU/CA/NZ/IE)
- PDF engine: worker-backed generation with preview reuse and performance metrics
- Data: Firestore-backed fee configuration editors
- Hosting: Firebase App Hosting

## High-Impact Engineering Decisions

- Split smoke vs regression testing for fast confidence + deeper safety.
- Added deterministic fixtures for rates/fees to avoid flaky logic tests.
- Enforced `<250` file-length policy for maintainability.
- Added runtime alert channel and policy templates for PDF/API failure spikes.

## Tradeoffs Made

- Kept some destination UI patterns duplicated intentionally to reduce cross-country logic coupling risk.
- Chose advisory unused-export checks over blocking mode to avoid noisy failures while tracking cleanup.
- Used workflow environment gating for deploy discipline; required-reviewers feature depends on plan limits.

## Reliability Proof Points

- Regression scripts lock country invariants and scholarship/payment edge cases.
- Playwright smoke validates auth, wizard, PDF flow, and payment due guardrails.
- Playwright regression validates destination-specific rendering and fees-updater persistence.
- Post-deploy endpoint checks verify production health quickly.

## Operations Readiness

- Release and incident runbooks are documented.
- Rollback helper script exists for safe revert flow.
- Backup script captures current Firestore fees docs before risky edits.
- Dependabot + stale/label workflows keep maintenance overhead controlled.

## What This Demonstrates

- Business-logic preservation while refactoring aggressively.
- Practical CI/CD and monitoring discipline.
- Maintainability focus (modularization, policy checks, documentation).
