---
name: route-audit
description: Audit a route subtree and its linked dependencies
---

Use when:
- auditing a route area such as `/admin`, `/developer`, `/dashboard`, or `/quiz`

Do not use when:
- the task is purely data-layer or env-only

Required inputs:
- route subtree

Read first:
- nearest `AGENTS.md`
- `.ai/00_system/ROUTE_SURFACE_MAP.md`
- `.ai/00_system/VALIDATION_MATRIX.md`

Expected outputs:
- route structure summary
- dependency/risk notes
- documentation gaps
- validation approach

Evidence requirement:
- cite route files, linked components, and linked actions/queries
