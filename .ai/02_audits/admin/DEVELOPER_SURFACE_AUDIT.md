# DEVELOPER_SURFACE_AUDIT

## Scope

- `src/app/developer/`
- supporting internal tooling/data providers

## Summary

`/developer` is the highest-leverage future Codex surface in the repo because it can become the runtime truth layer for internal inspection.
Right now it is useful, but it mixes:
- real runtime-backed inspection
- static documentation tables
- mock-backed status views

That makes it helpful, but not yet fully trustworthy.

## Evidence anchors

- `src/app/developer/page.tsx`
- `src/app/developer/layout.tsx`
- `src/app/developer/architecture/page.tsx`
- `src/app/developer/tools/db/page.tsx`
- `src/app/developer/tools/logs/page.tsx`
- `src/app/developer/status/database/page.tsx`
- `src/lib/actions/dev/db-viewer.ts`
- `src/lib/mocks/status.ts`
- `src/lib/audit/audit-queries.ts`
- `src/lib/logging/server.ts`
- `src/lib/entitlements/get-viewer-entitlements.ts`

## Observed

- developer portal access is entitlement-gated
- DB browser and logs pages use real runtime-backed queries
- database status page is mock-backed
- architecture page hardcodes package/version and architecture data that can drift from the repo

## Top findings

- `CEX-DEV-001` `/developer` does not cleanly distinguish mock/demo truth from runtime truth
- `CEX-DEV-002` the strongest Codex-enablement surface is present but underused as an observability layer
- `CEX-DEV-003` architecture and status pages can drift because some values are static rather than generated

## Additional evidence from deeper pass

- `status/database` is mock-backed through `src/lib/mocks/status.ts`
- `tools/db` and `tools/logs` are runtime-backed and should be treated as higher-trust inspection surfaces
- `developer/layout.tsx` entitlement-gates the portal, so Codex should not assume this surface is universally visible

## Recommended artifacts

- `DEVELOPER_SURFACE_PLAN.md`
- `VALIDATION_MATRIX.md`
- `ROUTE_SURFACE_MAP.md`
- future developer-surface truth labels or runtime indicators in a later implementation-approved run
