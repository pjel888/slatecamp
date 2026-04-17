# Plan: Document 3D Lab PRD & Technical Specification

**Created:** 2026-04-08
**Status:** COMPLETE
**Output:** `.ai/docs/01-product/008-3d-lab.md`

## Objective

Write a comprehensive Product Requirements Document and Technical Specification for SlateCamp's 3D Lab feature, replacing the outdated 008-3d-lab.md with exhaustive, codebase-verified content.

## Steps

1. [x] Explore codebase: stores, templates, hooks, rendering, registry, taxonomy
2. [x] Verify module counts: 209 modules, 16 categories, 7 template types
3. [x] Read all 9 stores, 6 hooks, overlay system, rendering pipeline
4. [ ] Write PRD with 19 sections + appendix to `.ai/docs/01-product/008-3d-lab.md`
5. [ ] Archive this plan to `.ai/archive/plans/document_3d_lab_plan.md`
6. [ ] Commit

## Key Facts Verified

- 209 module configs across 16 categories
- 7 template types: parametric (73), cutaway (50), exploded (37), floorplan (29), animated (15), calculator (4), wall-configurator (1)
- 9 Zustand stores: createModuleStore, useLabStore (facade), useLabNavigationStore, useLabProgressStore, useLabViewStore, useOverlayStore, useWallLabStore, nbcpStore, legacyLabStore
- 6 custom hooks: useAnimationComplete, useInvalidateOnChange, useModuleInvalidate, useModuleLifecycle, useNBCPInvalidateOnChange, useWorldToScreen
- Single Canvas via LabViewportFrame + SceneTunnel (tunnel-rat)
- Zero Html inside Canvas — all overlays via DOMOverlayLayer + useOverlayStore
- SceneConfig with 4 lighting presets (studio, clinical, dramatic, flat)
- WebGLErrorBoundary (class component) for context loss recovery
- AssetPreloader + LoadingProgress for asset loading UX
- PerformanceMonitor with flipflops=3, mobile DPR cap 1.25
- Dynamic imports via next/dynamic with ssr: false for all templates
- Telemetry via useLabTelemetry (disorientation, idle, linger, expert signals)
- Tier gating: pro tier required, bypass3dGate flag available
- 4 standalone/bespoke scenes: NBCP Envelope, FAR Playground, Classical Orders, DevControls
