# PRD — 3D Lab Runtime/Memory Performance Remediation

## Goal
Make `/dashboard/3d-lab` measurable and lighter, and determine whether it can rejoin the full frontend performance suite.

## Acceptance criteria
1. Reports 27–32 exist under `.ai/00_performance`.
2. Route-isolated dev and built measurements for `/dashboard/3d-lab` exist or are explicitly blocked with logs.
3. 3D chunk profile before/after JSON exists.
4. Metadata/full-config split is implemented if safe, or blocker is documented with exact reason.
5. Dashboard metric discrepancy is reconciled.
6. Authenticated built-app fixture attempt is documented without secrets.
7. `perf:snapshot` exists if practical.
8. Regression gate update reflects the 3D route status.
9. Required verification commands are run and logged.
10. Full `bun run perf:frontend` is attempted and not falsely marked green if it fails.
