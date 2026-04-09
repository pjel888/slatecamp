# Phase 3 Performance Audit — Stairway Configurator v2

**Date:** 2026-04-09
**Status:** BASELINE DOCUMENTED

---

## Geometry Instruction Count by Stair Type

### Straight Run (12 risers, default params)

| Element | Count |
|---------|-------|
| Base platform | 1 |
| Treads + Risers | 24 |
| Handrails (L+R) | 2 |
| Top landing | 1 |
| Headroom plane | 1 |
| **Total** | **29** |

### L-Shape (12 risers, 6 before turn)

| Element | Count |
|---------|-------|
| Base platform | 1 |
| Flight 1 treads + risers (6 each) | 12 |
| Intermediate landing | 1 |
| Flight 2 treads + risers (6 each) | 12 |
| Top landing | 1 |
| Handrails flight 1 (L+R) | 2 |
| Handrails flight 2 (L+R) | 2 |
| Headroom plane | 1 |
| **Total** | **32** |

### U-Shape (12 risers, 6 before turn)

| Element | Count |
|---------|-------|
| Base platform | 1 |
| Flight 1 treads + risers (6 each) | 12 |
| Intermediate landing | 1 |
| Flight 2 treads + risers (6 each) | 12 |
| Top landing | 1 |
| Outer handrails (2) | 2 |
| Interior handrail segments (2) | 2 |
| Headroom plane | 1 |
| **Total** | **32** |

### Maximum Scenario (U-shape, 20 risers, all overlays + comparison)

| Element | Count |
|---------|-------|
| Base geometry (U-shape 20 risers) | ~52 |
| BP 344 ghost rails + extensions | 12 |
| Width deficit planes | 2 |
| IBC ghost treads + risers | 40 |
| Children's ghost handrail | 2 |
| Evacuation dots (capped) | 200 |
| **Total** | **~308** |

**Note:** Evacuation dots at 200 exceed the 200 instruction budget. The evacuation simulation is opt-in educational mode. Without evacuation, max is ~108.

---

## Budget Summary

| Metric | Budget | Default | Max (no evac) | Max (with evac) | Status |
|--------|--------|---------|---------------|-----------------|--------|
| Instructions | <200 | 29-32 | ~108 | ~308 | PASS (default), EXCEEDS (evac mode) |
| Triangles | <30K | ~500 | ~2K | ~2.4K | **PASS** |
| Draw calls | <50 | 29-32 | ~108 | ~308 | PASS (default), EXCEEDS (overlays) |

**Mitigation for evacuation mode:** Dots use simple sphere instructions. Future optimization: convert to drei `<Instances>` for 1 draw call. Currently capped at 200 dots.

---

## Verdict

**PASS for default and typical usage.** L-shape and U-shape stay well within budget. Opt-in educational features (evacuation, comparison mode) exceed draw call budget but are toggle-gated and non-default.

Phase 4 should consider instanced rendering for evacuation particles and comparison ghost geometry.
