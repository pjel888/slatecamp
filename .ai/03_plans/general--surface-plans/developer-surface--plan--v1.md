# DEVELOPER_SURFACE_PLAN

## Objective

Turn `/developer` into a stronger support surface for future engineering and Codex work by clarifying what is real runtime truth versus mock or static documentation.

## Linked findings

- `CEX-DEV-001`
- `CEX-DEV-002`
- `CEX-DEV-003`

## Scope

- developer route structure
- status/tools/architecture surfaces
- observability/documentation gaps

## Non-goals

- implementing new runtime dashboards in this run

## Dependencies

- `ROUTE_SURFACE_MAP.md`
- `DATA_BOUNDARY_MAP.md`
- `VALIDATION_MATRIX.md`

## Sequence

1. identify real vs mock-backed developer pages
2. document trust labels and intended purpose
3. plan future runtime-backed inspection surfaces

## Risks

- over-trusting mock-backed status pages

## Acceptance criteria

- future Codex sessions can tell which `/developer` pages are reliable runtime inspection surfaces and which are documentation/demo layers

## Open questions

- which developer pages should be upgraded to true runtime-backed observability first?
