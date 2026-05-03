# Performance and Reliability

## Performance principle

Optimize the user-perceived bottleneck first. Do not micro-optimize before identifying the slow path.

## Common web-app checks

- Bundle size and route-level code splitting.
- Database query count and indexes.
- Server response time and caching behavior.
- Image/media optimization.
- Client state churn and unnecessary re-rendering.
- Blocking work on first load.
- Third-party scripts and network waterfalls.

## Reliability checks

- Clear error boundaries.
- Retry only where safe and bounded.
- Idempotency for side-effect operations.
- Durable data writes.
- Observability for critical flows.
- Graceful degradation when external services fail.

## Report format

For each issue:

```text
Finding:
Evidence:
Impact:
Fix:
Verification:
```
