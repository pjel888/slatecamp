# 01 — Executive Summary

## Problem Statement

The 3D Lab feature currently offers a single interaction paradigm: parametric controls with dual sidebars, slider-driven geometry, compliance panels, and violation indicators. This works well for technical, code-compliance exploration (e.g., stairway rise/run, setback calculations), but it doesn't serve simpler educational use cases where a student needs to toggle layers, explore assembly sequences, or compare states of a 3D model.

There is no way to have a lighter, guided learning experience in the 3D Lab. Every module must use the full parametric layout even when the learning goal is simpler. This creates unnecessary complexity for content authors and students.

## Current State Summary

- 3D Lab at `/dashboard/3d-lab/[moduleId]` with 187 modules across 16 categories
- 7 template types: `parametric`, `exploded`, `cutaway`, `floorplan`, `animated`, `calculator`, `wall-configurator`
- All modules use `ViewportShell` with dual sidebars + viewport center
- `LabViewportFrame` provides a single shared R3F Canvas via `SceneTunnel`
- `CanvasWrapper` configures per-module camera/lights/ground
- Module cards show template type badges (Parametric, Exploded, Cutaway, etc.)
- DASHBOARD_VISIBLE_IDS controls which modules appear on the public dashboard (currently 5)
- State management via Zustand stores (useLabStore, useViewportShellStore, module-scoped stores)
- No concept of "interaction mode" exists in code or data

## Proposed Solution

Add a **mode** classification (`mode: 'PI' | 'LI'`) to the existing module registry entry. Introduce a new `'learning'` template type alongside the existing ones. LI modules use a simplified shell config, a dedicated LI scene renderer, and compact layer/state toggle controls instead of dual sidebars.

Key design decisions:
1. **Data-driven mode resolution** (not route-level) — no URL structure changes
2. **Shared viewport** — reuse `LabViewportFrame` + `SceneTunnel` pattern
3. **Shared shell** — reuse `ViewportShell` with LI-specific config
4. **Backward compatible** — all existing modules default to PI
5. **New template type** — `'learning'` added to `TemplateType` union

## Why LI Should Be a Separate Mode

- PI and LI serve different user mental models (engineer vs learner)
- PI's dual sidebars are inappropriate for simpler learning experiences
- LI should not be a "stripped-down PI" — it should be purpose-built
- Mode distinction enables future dashboard filtering, analytics, and content strategy
- Adding LI as a new template type reuses existing infrastructure cleanly

## Why PI Must Remain Unchanged

- PI is the primary value proposition of the 3D Lab
- PI modules represent significant content investment (187 planned modules)
- PI has high technical complexity (parametric geometry, compliance panels, source truth)
- Any regression in PI would break the core 3D Lab experience
- The existing architecture already supports adding new template types without touching PI

## Recommended Implementation Approach

Add LI as a new template type variant to the existing template-driven architecture. The `useTemplateContent` hook already switches on `templateType` to produce `ViewportShellContent`. Adding a `'learning'` case to this switch is the minimal, safe extension.

## Recommended MVP

1. Type changes: add `mode` field, add `'learning'` templateType
2. LI shell defaults: compact right panel (280px), no left sidebar, status bar
3. LI scene renderer: `LearningSceneRenderer` using shared CanvasWrapper
4. Layer toggle component: `LearningLayerToggles` with checkbox-style UI
5. One sample LI module: e.g., BP 344 ramp layers or wall section layers
6. Dashboard badges: PI/LI labels on ModuleCard
7. Dashboard filter: mode tabs or chips
8. All existing modules: default to PI, zero change

## Non-Goals

- No route restructuring
- No changes to PI template types (parametric, exploded, etc.)
- No changes to ViewportShell or LabViewportFrame internals
- No guided tour, annotations, hotspots, or quizzes in MVP LI
- No mobile-specific LI layout (inherits ViewportShell mobile behavior)
- No Supabase database changes (all module config is static TypeScript)
- No entitlement changes (PI and LI share the same `threeDLabFull` gate)

## Decision Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mode separation | `mode` field on registry entry | Clearer than overloading templateType |
| Template type | New `'learning'` type | Fits existing switch-based architecture |
| Route strategy | No route change | Data-driven resolution is simpler |
| Viewport sharing | Reuse LabViewportFrame | Already shared via SceneTunnel |
| Shell config | LI-specific defaults | ViewportShell already supports config per type |
| Card labels | PI/LI badges + filter | Incremental addition to ModuleCard |
| Backward compat | All existing → PI | Zero migration risk |

## Risk Summary

| Risk | Level | Mitigation |
|------|-------|------------|
| TypeScript union changes break existing consumers | Medium | Add `mode` as optional with default; test exhaustively |
| LI feels like "broken PI" rather than distinct mode | Low | Dedicated layout, avoid half-empty dual sidebars |
| Performance regression from additional template variant | Low | Dynamic imports; LI scene is simpler than parametric |
| Scope creep during implementation | Medium | Strict MVP definition; defer annotations/quizzes/hotspots |
| Content authoring confusion between PI/LI | Low | Clear docs; mode is explicit in config |

## Estimated Complexity by Area

| Area | Complexity | Reason |
|------|------------|--------|
| Dashboard | Low | Badge addition + filter chips, ~3 files |
| Routing | Zero | No route changes needed |
| Viewport sharing | Low | Already shared; LI just adds new template case |
| Data model | Low | Add `mode` field, add template type variant |
| LI controls | Medium | New component; layer toggle state management |
| Scene renderer | Medium | New R3F scene; simpler than parametric |
| Testing | Medium | New component tests, PI regression suite |
| Performance | Low | LI scenes are simpler than parametric |
| Documentation | Low | Update AGENTS.md, module catalog |

## Recommended Implementation Order

See document 17 for full roadmap. Summary:

1. Type/model changes (no behavioral impact)
2. Dashboard badge/filter support
3. LI shell config + template defaults
4. LI scene renderer + layer toggle component
5. First LI sample module
6. Testing and QA
7. Polish and documentation
