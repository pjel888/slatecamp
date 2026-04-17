# Loading and Responsiveness Audit

**Last Updated:** 2026-04-16

## Findings
- Loading coverage exists across most route surfaces, but perceived responsiveness still depends on client-work and data-fetch density.
- Admin editors, analytics views, quiz shells, and 3D Lab modules are the most likely responsiveness chokepoints.
- `useLabTelemetry`, `useGuidedSequence`, quiz stores, and timer stores show heavy client-side orchestration.

## Practical priorities
1. audit expensive client trees on dashboard/admin/3D routes
2. audit duplicate fetches in action/query consumers
3. keep route loading coverage aligned with real async boundaries
