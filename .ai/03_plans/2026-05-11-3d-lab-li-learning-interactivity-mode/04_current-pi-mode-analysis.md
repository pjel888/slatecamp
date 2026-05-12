# 04 — Current PI Mode Analysis

## Definition of PI (Parametric Interactivity)

PI is the existing 3D Lab interaction paradigm. It is characterized by:

1. **Parameter-driven geometry**: The 3D scene is generated procedurally from slider/dropdown/toggle values
2. **Dual sidebar layout**: Left sidebar for controls, right sidebar for details/compliance
3. **Compliance checking**: Real-time violation detection with code citations
4. **Professional context**: Scenario descriptions, LEA question counts, source truth integration
5. **Heavy interactivity**: Multiple parameters, presets, progressive disclosure levels, cross-section/exploded view toggles

## What Makes Current 3D Lab PI

The current 3D Lab IS PI. There is no mode distinction today. Every module uses the same underlying system. However, the template type system provides different flavors of PI:

| Template Type | PI Characteristic |
|---------------|-------------------|
| `parametric` | Slider-driven geometry, compliance panels, presets |
| `exploded` | Explode slider, part selection, assembly exploration |
| `cutaway` | Cut depth slider, layer visibility by depth |
| `floorplan` | Room/zone visualization, path tracing, fixture placement |
| `animated` | Step sequence, playback controls, construction phases |
| `calculator` | Orthographic view, input/output panels, material estimation |
| `wall-configurator` | Wall assembly configuration, BOM, performance panels |

All share the PI DNA: sidebars with structured controls, data-driven rendering, compliance/code reference display.

## Current PI Layout

```
┌─────────────────────────────────────────────────────┐
│ ViewportHeader (title, code ref, back, progress)     │
├──────────┬────────┬──────────────────┬──────┬────────┤
│ Left     │ Handle │                  │Handle│ Right  │
│ Sidebar  │        │   3D Viewport    │      │Sidebar │
│ 280-480px│ 20px   │   (Canvas)       │ 20px │280-340p│
│          │        │                  │      │        │
│ Controls │        │  SceneToolbar    │      │Details │
│ Presets  │        │  CameraBar       │      │Complian│
│ Params   │        │  LayersPanel     │      │Parts   │
│          │        │                  │      │Steps   │
├──────────┴────────┴──────────────────┴──────┴────────┤
│ ViewportStatusBar                                   │
└─────────────────────────────────────────────────────┘
```

## Current PI State Model

Per-module state (via `createModuleStore`):
```typescript
Record<string, number | boolean | string>  // parameter defaults
```

Global lab state (via `useLabProgressStore`):
```typescript
{
  parametricValues: Record<string, number>
  complianceState: ComplianceState
  visitedHotspotIds: Set<string>
  answeredQuestionIds: Set<string>
  quizResults: QuizResult[]
}
```

Viewport shell state (via `useViewportShellStore`):
```typescript
{
  leftSidebarCollapsed: boolean
  rightSidebarCollapsed: boolean
  gridVisible: boolean
  dimensionsVisible: boolean
  xrayMode: boolean
  layersPanelOpen: boolean
  navMode: 'orbit' | 'pan'
  activeInteraction: 'orbiting' | 'panning' | null
}
```

## Current PI Control Model

Controls vary by template type but follow patterns:
- **Sliders**: Numeric range with step, unit display, code min/max markers
- **Dropdowns**: Enumerated options mapped to parameter values
- **Toggles**: Boolean parameters for feature visibility
- **Presets**: Named parameter value sets for quick configuration
- **Progressive disclosure**: Parameters grouped by `disclosureLevel` (essential/advanced/expert)

All controls feed into the `createModuleStore` which is consumed by scene renderers.

## Current PI Data Requirements

Each PI module config requires:
- `ParameterDef[]` — control definitions
- `geometry()` — generator function mapping params → geometry instructions
- `ViolationRule[]` — compliance checks
- `AnnotationDef[]` — labeled annotations
- `Preset[]` — parameter presets
- `CameraConfig` — initial camera position
- Optional: `SourceTruthConfig`, `contextScenario`, `leaQuestionCount`

## Current PI Route/Card Assumptions

- Route: `/dashboard/3d-lab/[moduleId]` — no mode parameter
- Card: `ModuleCard` renders template type badge + status badge
- Card link: `ROUTES.lab.module(module.id)` — resolves to `[moduleId]`
- No concept of "PI" in routing or cards — everything is just "3D Lab"

## PI Behavior That Must Be Preserved

1. **All existing PI module configs** — must load and render identically
2. **All existing PI routes** — must continue working without redirects
3. **All existing PI scene renderers** — parametric, exploded, cutaway, floorplan, animated, calculator, wall-configurator
4. **Dual sidebar layout** — left for controls, right for details
5. **Compliance panels** — SourceCompliancePanel, ComplianceReportPanel
6. **Parameter system** — sliders, dropdowns, toggles, presets, progressive disclosure
7. **Violation indicators** — real-time code violation highlighting
8. **Preset system** — named parameter sets
9. **Source truth integration** — source-backed compliance
10. **Module card appearance** — template type badges + status badges
11. **Dashboard visibility** — DASHBOARD_VISIBLE_IDS control
12. **Entitlement gating** — threeDLabFull key

## PI Regression Risks

| Risk | Likelihood | Impact |
|------|-----------|--------|
| TypeScript union changes break PI config imports | Medium | High |
| Shell config changes alter PI sidebar behavior | Low | Medium |
| Module card badge changes confuse PI module display | Low | Low |
| State store changes affect PI parametric values | Low | High |
| Route changes break PI deep links | Low | High |
| Canvas changes affect PI scene rendering | Low | High |
| Dependency updates affect R3F/Drei behavior | Low | High |

## PI Backward Compatibility Requirements

1. **All existing `ModuleRegistryEntry` items must default to `mode: 'PI'`**
2. **All existing template types must remain in `TemplateType` union**
3. **All existing `TEMPLATE_SHELL_DEFAULTS` entries must be preserved**
4. **All existing `useTemplateContent` cases must run identically**
5. **All existing module configs must import and parse without changes**
6. **All existing routes must resolve identically**
7. **All existing tests must pass without modifications**
8. **No visual changes to PI module cards or dashboard**

## Recommended Guardrails

1. **Feature flag**: Use a config flag `ENABLE_LI_MODE` (default `false`) to gate LI rendering, so PI is never affected during development
2. **Type safety**: Make `mode` optional with default `'PI'` in all resolvers
3. **Test suite**: Run full 3D Lab test suite before any LI merge
4. **Visual regression**: Compare screenshots of existing modules before/after changes
5. **Separate branch**: Implement LI in a feature branch with no PI changes
6. **Code review checklist**: Require sign-off that no PI code paths were modified
7. **Rollback plan**: Revert LI-specific additions via git revert; no PI migration needed
