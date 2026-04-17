# Current Performance Risk Register

**Last Updated:** 2026-04-16

## Observed performance-sensitive areas
1. **3D learning surfaces**
   - Evidence: `src/features/3d-lab/`, `src/features/wall-configurator/`, related tests and config modules
   - Risk: geometry/rendering-heavy code and feature breadth raise runtime and maintenance risk

2. **Large route surface with many loading states**
   - Evidence: 125 pages, 96 loading files under `src/app/`
   - Risk: route-level performance and loading experience are easy to let drift without targeted review

3. **Large shared component surface**
   - Evidence: 716 files under `src/components/`
   - Risk: bundle and rendering regressions can hide inside broadly reused UI code

4. **Large actions/query logic surface**
   - Evidence: 146 files under `src/lib/actions/`, large `src/lib/queries/` and shared logic areas
   - Risk: data-fetch waterfalls and server-action coupling can grow quietly

## Current limitation
This repo now has clear performance-sensitive zones, but it does not yet have a single current benchmark ledger or centralized performance dashboard inside `.ai`.

## Recommended next steps
- keep feature/performance audits for 3D and route-heavy surfaces under `00_performance/`
- record real benchmark evidence here when profiling is performed
- avoid vague “performance” roadmap items without subsystem-level evidence
