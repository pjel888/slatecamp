# 05 — LI Feature PRD (Learning Interactivity)

## Product Summary

LI (Learning Interactivity) is a new interaction mode for the 3D Lab that provides simpler, guided 3D learning experiences. Unlike PI's parameter-heavy engineering controls, LI focuses on interactive exploration through layer/state toggles, making 3D models accessible for students who need to understand construction assemblies, material layers, or system components without manipulating numeric parameters.

## User Problem

Current 3D Lab modules are powerful but complex. A student studying wall sections, ramp layers, or building assemblies must navigate dual sidebars full of sliders and compliance panels when all they really need is to toggle layers on/off to see what's inside. The parametric interface creates unnecessary cognitive overhead for pure learning exploration.

## Goals

1. Provide a simpler 3D interactive experience for educational content
2. Allow content authors to create 3D modules without configuring parameter systems
3. Reuse existing 3D Lab infrastructure (Canvas, ViewportShell, registry)
4. Give students clear visual distinction between exploration (PI) and learning (LI) modes
5. Support future enhancements: annotations, guided steps, quizzes, hotspots
6. Keep PI fully intact with zero regression

## Non-Goals

- Replace or redesign PI
- Add complex annotation/hotspot systems (deferred)
- Add guided tour/narration (deferred)
- Add in-canvas quizzes (deferred)
- Support parametric controls in LI (by design)
- Change the 3D Lab entitlement model
- Support LI on a separate route

## Target Users

- LEA candidates studying construction assemblies, material layers, and building systems
- Students who find parametric controls intimidating
- Content authors who want to create simpler 3D learning modules
- Instructors who want to use 3D models for classroom demonstration

## User Stories

**MVP:**
1. As a student, I can open an LI module from the 3D Lab dashboard and see a clear LI badge
2. As a student, I can view an interactive 3D model with simple layer toggle controls
3. As a student, I can toggle individual layers/components on/off to explore the model structure
4. As a student, I can orbit/pan/zoom the 3D model freely
5. As a student, I can identify LI vs PI modules on the dashboard by their badge labels

**Future:**
6. As a student, I can follow guided step-by-step assembly/disassembly sequences
7. As a student, I can view educational annotations on model parts
8. As a student, I can answer quiz questions about the model layers
9. As a student, I can compare two states of the model side by side
10. As a content author, I can create an LI module by defining layers and their geometry

## MVP Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| FR-1 | Dashboard displays PI/LI badges on module cards | P0 |
| FR-2 | Dashboard supports filtering by mode (PI/LI/All) | P1 |
| FR-3 | LI modules render in a simplified layout (viewport + compact controls) | P0 |
| FR-4 | LI modules support orbit/pan/zoom camera controls | P0 |
| FR-5 | LI modules support layer visibility toggles | P0 |
| FR-6 | Layer toggles control mesh visibility in the 3D scene | P0 |
| FR-7 | At least one sample LI module is available | P0 |
| FR-8 | LI modules use the shared Canvas (no duplicate WebGL context) | P0 |
| FR-9 | PI modules render identically to current behavior | P0 |
| FR-10 | LI modules have a title and code reference in the viewport header | P1 |
| FR-11 | LI modules can reset camera to default position | P1 |
| FR-12 | LI module configs follow existing static TS module pattern | P1 |

### Non-Functional Requirements

| ID | Requirement |
|----|------------|
| NFR-1 | LI viewport renders at 60fps on mid-range devices (same as PI) |
| NFR-2 | LI module config loading is no slower than PI module config loading |
| NFR-3 | LI module page initial load matches PI performance characteristics |
| NFR-4 | LI components follow existing code conventions and patterns |
| NFR-5 | LI changes do not increase bundle size by more than 5KB gzipped (excluding first LI config) |

### Accessibility Requirements

| ID | Requirement |
|----|------------|
| AR-1 | Layer toggles must be keyboard-navigable (Tab + Space/Enter) |
| AR-2 | Layer toggle labels must be associated with inputs via `htmlFor`/`id` |
| AR-3 | Layer toggle state must be communicated to screen readers |
| AR-4 | LI viewport must respect `prefers-reduced-motion` |
| AR-5 | Color must not be the only indicator of toggle state |

### Performance Requirements

| ID | Requirement |
|----|------------|
| PR-1 | LI viewport uses same adaptive DPR as PI (1-2) |
| PR-2 | LI scene components use `React.memo` where appropriate |
| PR-3 | LI layer meshes dispose on unmount |
| PR-4 | LI module config is dynamically imported (not bundled with PI) |

## LI MVP Scope

The smallest useful LI implementation:

1. **Type changes**: Add `mode: 'PI' | 'LI'` to `ModuleRegistryEntry`, add `'learning'` to `TemplateType`
2. **Shell config**: LI template defaults with right panel only (280px), no left sidebar, status bar
3. **Scene renderer**: `LearningSceneRenderer` — renders geometry based on layer visibility state
4. **Layer toggles**: `LearningLayerToggles` — checkbox list in right sidebar
5. **Module card**: PI/LI badges
6. **Dashboard filter**: Mode tabs or filter chips
7. **One sample module**: e.g., BP 344 ramp component layers

## Out-of-Scope Items (Future)

- Guided step-by-step sequences
- Educational annotations/hotspots
- In-canvas quiz questions
- Comparison mode (side-by-side states)
- Narration or audio
- Animation timeline
- Saved views
- Progress tracking in LI
- Mobile-specific LI layout changes
- Supabase integration for LI content
- Content authoring admin UI for LI

## Acceptance Criteria

### Dashboard
- Module cards show "Parametric" or "Learning" badge
- Cards are filterable by mode
- PI cards are visually unchanged
- Clicking LI card navigates to LI module

### LI Module Page
- Viewport renders with single right sidebar (no left sidebar)
- Layer toggles are visible in the right sidebar
- Toggling a layer shows/hides the corresponding mesh
- Camera controls work (orbit, pan, zoom)
- Camera reset button works
- Grid/dim/xray toggles work identically to PI

### PI Preservation
- All PI modules render identically
- All PI tests pass
- All PI routes work without redirects
- No visual regressions in PI module cards

### Sample LI Module
- At least one LI module is accessible from the dashboard
- The module demonstrates layer toggling with at least 3 layers
- The module has a title, description, and code reference

## Success Metrics (Qualitative)

- LI modules feel distinctly simpler than PI modules
- Students can immediately understand how to use layer toggles
- Content authors express interest in creating more LI modules
- No PI users report confusion or regression
- Dashboard visually communicates the PI/LI distinction clearly
