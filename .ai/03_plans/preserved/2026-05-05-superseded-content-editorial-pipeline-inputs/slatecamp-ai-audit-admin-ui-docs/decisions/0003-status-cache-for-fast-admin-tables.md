# Decision 0003: Use Status Cache

## Decision

Create `ai_audit_status_cache` to store latest audit state per target.

## Rationale

Admin tables need to show thousands of rows with current status. Computing latest status from all logs on every page load would be inefficient and complex.

## Consequences

- Mutations must update/recompute cache.
- Missing cache rows are treated as `not_checked`.
- Status cache improves table performance and simplifies filters.

## Status

Accepted.
