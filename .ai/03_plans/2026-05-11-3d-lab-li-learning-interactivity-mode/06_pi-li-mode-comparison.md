# 06 — PI/LI Mode Comparison

## Detailed Comparison Table

| Dimension | PI (Parametric Interactivity) | LI (Learning Interactivity) |
|-----------|------------------------------|---------------------------|
| **Purpose** | Explore code compliance through parametric manipulation | Learn construction/assembly through layer exploration |
| **User mental model** | Engineer tweaking parameters to see effects | Student peeling back layers to understand structure |
| **Layout** | Dual sidebars (left: controls, right: details) | Single sidebar (right: layer toggles) |
| **Viewport usage** | Full R3F Canvas with shared infrastructure | Same shared Canvas via SceneTunnel |
| **Left sidebar** | Controls panel with sliders/dropdowns/toggles/presets | Hidden (or minimal title only) |
| **Right sidebar** | Compliance report, source truth, part list, step list | Layer toggle list with labels and descriptions |
| **Controls** | Parameter sliders (min/max/step), dropdowns, toggles, presets | Checkbox toggles for layer visibility |
| **Data model** | `ParameterDef[]` + `geometry()` generator + `ViolationRule[]` | `LearningLayer[]` with geometry + visibility state |
| **Interactivity** | Continuous parameter adjustment → live geometry update | Discrete layer toggle → show/hide mesh |
| **State** | `Record<string, number \| boolean \| string>` (per-module store) | `Record<string, boolean>` (layer visibility map) |
| **Routing** | `/dashboard/3d-lab/[moduleId]` | Same route, mode resolved from registry |
| **Dashboard card** | Template type badge + status badge | Same + "Learning" mode badge |
| **Performance concerns** | Geometry regeneration on every param change | Static geometry, show/hide only (lower cost) |
| **Testing concerns** | Param math, compliance logic, geometry generation | Layer toggle state, visibility control |
| **Content authoring** | Define parameters, geometry function, violations, annotations | Define layers with geometry and metadata |
| **Code compliance** | Real-time violation checking with citations | Static code reference in header; no live checking |
| **Presets** | Named parameter sets for quick configuration | N/A (no parameters) |
| **Progressive disclosure** | `disclosureLevel`: essential/advanced/expert | N/A — all layers visible in toggle list |
| **Source truth** | Source-backed compliance panel | N/A |
| **LEA questions** | Hotspot questions, quiz mode | Deferred to future |
| **Annotations** | Position-based with visibility predicates | Deferred to future |
| **Future extensibility** | Additional parameter types, more complex geometry | Guided steps, annotations, quizzes, compare mode |

## What Should Be Shared

| Component/System | Shared? | How |
|-----------------|---------|-----|
| LabViewportFrame (Canvas) | **Yes** | Single Canvas host; LI portals through SceneTunnel |
| CanvasWrapper | **Yes** | LI configures simpler camera/lighting |
| ViewportShell | **Yes** | LI passes different shellConfig (right panel only) |
| ViewportShellContent | **Yes** | LI fills same slots (canvasContent, rightSidebarContent, etc.) |
| SceneToolbar | **Yes** | Grid/Dim/Xray toggles work identically |
| LayersPanel | **Yes** | Generic layers at top, LI-specific layers below |
| CameraNavigationBar | **Yes** | Same camera preset bar |
| ViewportHeader | **Yes** | Title, code ref, back button |
| ModuleRegistryEntry | **Yes** | Extended with `mode` field |
| Module config pattern | **Yes** | Static TS, dynamic import |
| Entitlement gate | **Yes** | Same `threeDLabFull` key |
| Dashboard page | **Yes** | Enhanced with PI/LI badges and filters |
| Test infrastructure | **Yes** | Same Vitest/Playwright |

## What Should Be Mode-Specific (PI Only)

| Component/System | Why PI-Specific |
|-----------------|-----------------|
| GenericControlPanel | Parameter sliders — not relevant to LI |
| ComplianceReportPanel | Violation reporting — PI only |
| SourceCompliancePanel | Source truth — PI only |
| ParametricSceneRenderer | Dynamic geometry regeneration — not needed for LI |
| ViolationRule[] checks | Code compliance logic — PI only |
| ParameterDef type | Slider/dropdown/toggle definitions — PI only |
| Preset system | Parameter preset sets — PI only |

## What Should Be Mode-Specific (LI Only)

| Component/System | Why LI-Specific |
|-----------------|-----------------|
| LearningSceneRenderer | Layer visibility-based scene rendering |
| LearningLayerToggles | Checkbox UI for layer visibility |
| LearningLayerDef type | Layer definition with geometry, label, description |
| LI mode badge | Visual indicator on dashboard cards |
| LI shell config | Right panel only, no left sidebar |

## What Should NOT Be Shared

1. **State stores** — PI's `parametricValues` and LI's layer visibility should be separate module stores (via `createModuleStore`)
2. **Control panels** — PI's `GenericControlPanel` and LI's `LearningLayerToggles` serve different UX models
3. **Scene renderers** — PI's `ParametricSceneRenderer` generates geometry; LI's scene shows/hides pre-defined geometry
4. **Compliance system** — PI has live violation checking; LI has static code reference only
5. **The "half-empty PI" anti-pattern** — LI should NEVER be PI with hidden sidebars; it should be purpose-built

## Decision Matrix

| Decision | PI | LI |
|----------|----|----|
| Layout | Dual sidebars | Single right sidebar |
| Controls | Parameters | Layer toggles |
| Geometry | Generated from params | Static, show/hide |
| Compliance | Live checking | Code reference only |
| Content depth | Deep technical | Accessible educational |
| Target user | Advanced student | Any student |
