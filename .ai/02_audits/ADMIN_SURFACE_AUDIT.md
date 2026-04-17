# ADMIN_SURFACE_AUDIT

## Scope

- `src/app/admin/`
- relevant supporting components and libs
- permissions and workflow assumptions visible in route/layout/action code

## Summary

`/admin` is one of the highest-risk Codex work surfaces in the repo.
It is broad, route-dense, and operationally consequential.
It spans content creation, content browsing, review, taxonomy, assets, preview, pipeline, audit, activity, and question management.

## Evidence anchors

- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/knowledge/page.tsx`
- `src/app/admin/pipeline/page.tsx`
- `src/lib/actions/admin/dashboard.ts`
- `src/lib/actions/admin/content.ts`
- `src/lib/admin/roles.ts`

## Observed

- admin access is enforced at layout level through `getUser()`, `canReviewContent()`, and `getUserRole()`
- the admin dashboard already aggregates meaningful operational metrics and a “needs attention” view
- knowledge/editor flows depend on a large, coordination-heavy action layer
- publishing and review workflows are present, but the docs do not yet give Codex one concise operational model

## Top findings

- `CEX-ADM-001` `/admin` route/workflow shape is broad and high-impact but under-documented for future Codex work
- `CEX-ADM-002` permission assumptions are distributed across layout, roles, entitlements, and admin actions
- `CEX-ADM-003` `/admin/audit` and `/admin/activity` do not mean the same thing operationally
- `CEX-ADM-004` admin data access spans browser reads, route guards, user-session reads, and service-role paths

## Additional evidence from deeper pass

- role resolution is transitional and multi-source
- audit views can fall back to synthesized rows, which changes their trust level
- content and asset workflows include operational rules that are embedded in actions rather than surfaced in docs

## Recommended artifacts

- `ADMIN_SURFACE_PLAN.md`
- `ROUTE_SURFACE_MAP.md`
- `VALIDATION_MATRIX.md`
- refresh `src/app/admin/AGENTS.md` with sharper local guidance
