# ADR 0002: Scholarship Type `first_year_only`

## Status

Accepted

## Context

Business requires three scholarship behaviors:
- `upfront`
- `next_semester`
- `first_year_only`

For `first_year_only`, deduction applies to one academic year only even when program duration is multi-year.

## Decision

- Add `first_year_only` as a scholarship type in payment details UI.
- In shared financial computation:
  - Compute annual scholarship first.
  - Apply total scholarship as one-year-only for `first_year_only`.
  - Apply initial-payment deduction cadence similar to upfront behavior.
- Clamp scholarship deductions to prevent negative totals.
- Cap percentage-based scholarship at 99% to match business offering.

## Consequences

Positive:
- Business behavior is explicit and test-locked.
- Prevents invalid negative totals from extreme inputs.

Tradeoffs:
- Slightly more branching in core scholarship compute.
- Requires matrix regression coverage across AU/CA/NZ/IE and payment types.
