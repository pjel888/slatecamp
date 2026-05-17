# ADMIN_SURFACE_PLAN

## Objective

Prepare `/admin` for safer future Codex work by documenting its workflow, validation, and role assumptions clearly before major implementation changes.

## Linked findings

- `CEX-ADM-001`
- `CEX-ADM-002`
- `CEX-ADM-003`
- `CEX-ADM-004`

## Scope

- admin route structure
- content/review/publishing workflows
- permission and entitlement assumptions
- documentation/readiness gaps

## Non-goals

- admin feature implementation
- role-policy changes

## Dependencies

- `VALIDATION_MATRIX.md`
- `ROUTE_SURFACE_MAP.md`
- `DATA_BOUNDARY_MAP.md`

## Sequence

1. document current workflow and route clusters
2. document role/access assumptions
3. document manual validation expectations
4. keep admin AGENTS aligned with those docs

## Risks

- documenting admin flows without tracing action-layer dependencies

## Acceptance criteria

- future Codex sessions can locate the right admin routes, actions, and validation path without re-mapping the whole subtree

## Open questions

- which admin subflows should eventually get route-local runbooks beyond the current audit?
