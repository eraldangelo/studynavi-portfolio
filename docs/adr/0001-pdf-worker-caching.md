# ADR 0001: PDF Worker + Cache Strategy

## Status

Accepted

## Context

PDF generation was blocking UI responsiveness and repeating expensive asset/load work for preview and download paths.

## Decision

- Move PDF generation workload to worker-backed flow.
- Cache destination assets in memory using shared promise cache.
- Reuse generated preview for download when input fingerprint is unchanged.
- Keep previous preview visible while refreshed preview builds in background.

## Consequences

Positive:
- Lower perceived latency and smoother UI.
- Reduced duplicate compute and asset fetch overhead.
- Fewer “stuck/broken loading” moments during review step.

Tradeoffs:
- More moving parts (worker client/types, fingerprint logic).
- Requires regression coverage for preview/download equivalence and timing budgets.
