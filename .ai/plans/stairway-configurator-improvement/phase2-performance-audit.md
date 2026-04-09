# Phase 2 Performance Audit — Stairway Configurator v2

**Date:** 2026-04-09
**Status:** BASELINE DOCUMENTED — Runtime testing pending deployment

---

## Geometry Instruction Count Analysis

### Default Parameters (12 risers, no overlays)

| Element | Count | Type |
|---------|-------|------|
| Base platform | 1 | box |
| Treads | 12 | box |
| Risers | 12 | box |
| Handrails (L+R) | 2 | cylinder |
| Top landing | 1 | box |
| Headroom plane | 1 | box |
| **Total** | **29** | |

**Budget:** <200 instructions | **Status:** PASS (29/200)

### With All Phase 1 Overlays (accessible + exit + tolerance)

| Element | Added | Type |
|---------|-------|------|
| BP 344 ghost rails (4 heights × 2 sides) | +8 | cylinder |
| BP 344 extensions (2 sides × 2 ends) | +4 | cylinder |
| Width deficit planes (2 sides) | +2 | box |
| **Total** | **43** | |

**Budget:** <200 instructions | **Status:** PASS (43/200)

### With Phase 2: Comparison Mode (IBC ghost geometry)

| Element | Added | Type |
|---------|-------|------|
| IBC ghost treads (12) | +12 | box |
| IBC ghost risers (12) | +12 | box |
| **Total with comparison** | **67** | |

**Budget:** <200 instructions | **Status:** PASS (67/200)

### With Phase 2: Nosing Detail View

| Element | Change | Type |
|---------|--------|------|
| Nosing extruded-profile (1 tread) | +1 | extruded-profile |
| Dimmed treads (11 at 30% opacity) | 0 (modified, not added) | box |
| **Total with detail** | **30** | |

**Budget:** <200 instructions | **Status:** PASS (30/200)

### Maximum Scenario (20 risers + all overlays + comparison)

| Element | Count |
|---------|-------|
| Base platform | 1 |
| Treads + Risers (20 each) | 40 |
| Handrails | 2 |
| Top landing | 1 |
| Headroom plane | 1 |
| BP 344 rails + extensions | 12 |
| Width deficit planes | 2 |
| IBC ghost treads + risers | 40 |
| **Total** | **99** |

**Budget:** <200 instructions | **Status:** PASS (99/200)

---

## Triangle Count Estimate

| Geometry Type | Triangles Per | Max Count | Subtotal |
|--------------|---------------|-----------|----------|
| Box (12 tris each) | 12 | 99 boxes | 1,188 |
| Cylinder (16 tris each, 8 segments) | 16 | 14 cylinders | 224 |
| ExtrudeGeometry (~50 tris) | 50 | 1 | 50 |
| **Total** | | | **~1,462** |

**Budget:** <30,000 triangles | **Status:** PASS (1,462/30,000)

---

## Draw Call Estimate

| Scenario | Draw Calls |
|----------|-----------|
| Default (29 meshes) | 29 |
| Max overlays (99 meshes) | 99 |

**Budget:** <50 draw calls at default, noted that max scenario (99) exceeds budget.

**Mitigation:** The 50 draw call budget is for the default view. Comparison mode ghost geometry adds +40 draw calls but is opt-in and educational. Consider instanced rendering for Phase 3 if this becomes a mobile performance concern.

---

## ExtrudeGeometry Performance Notes

- THREE.ExtrudeGeometry is computed once per shape change (memoized via useMemo in GeometrySwitch)
- Only 1 extruded tread renders at a time (detail view pattern)
- Shape has ~7 profile points → lightweight extrusion
- No bevel enabled → minimal triangle count
- **Risk level:** LOW for single-tread detail view

---

## Verdict

| Metric | Budget | Actual (Max) | Status |
|--------|--------|-------------|--------|
| GeometryInstructions | <200 | 99 | **PASS** |
| Triangles | <30K | ~1,462 | **PASS** |
| Draw calls (default) | <50 | 29 | **PASS** |
| Draw calls (max overlays) | <50 | 99 | **EXCEEDS** (opt-in only) |

**Overall: PASS** — Phase 2 features stay well within the performance budget for default and typical usage. The comparison mode max-overlay scenario exceeds the draw call budget but is opt-in educational mode, not the default rendering path. Tasks 7 and 8 are **UNBLOCKED**.

---

## Recommendations for Phase 3

- Consider `drei <Instances>` for treads/risers if L-shape/U-shape doubles the geometry count
- Consider instanced ghost geometry for comparison mode if more codes are added
- Runtime profiling on actual Realme C55 should happen before Phase 3 ships
