# Implementation Handoff Spec - Lighting Room Simulator

This file is for the later implementation pass. It turns the improved planning pack into a concrete build target without starting code in this audit pass.

## Hard Rules

1. No learner-facing legal pass/fail from source-pending or located-but-unapproved values.
2. Pure calculation engine before React and Three.js rendering.
3. Presets must satisfy formula tests.
4. Use existing 3D Lab components and patterns before adding new abstractions.
5. No new dependencies in v0.
6. The visual lighting gradient is approximate and cannot be described as measured lux.
7. Do not rely on `ParametricSceneRenderer` alone for live light behavior unless a typed light extension has been implemented.

## Planned Files

| File | Responsibility |
|---|---|
| `src/features/3d-lab/config/modules/06-electrical/lighting-computation.ts` | Pure calculations, source-display guards, preset validation helpers. |
| `src/features/3d-lab/config/modules/06-electrical/lighting-computation.test.ts` | Formula, preset, and source-status tests. |
| `src/features/3d-lab/config/modules/06-electrical/lighting-room-simulator.ts` | Parametric scene config, geometry, annotations, presets, checks. |
| `src/features/3d-lab/components/templates/LightingRoomPanels.tsx` | Custom left inspector panel and/or source-gated right checks panel. |
| `src/features/3d-lab/components/templates/LightingRoomScene.tsx` | Accepted v0 owner for live `PointLight` / `SpotLight` behavior under architecture bridge Option A. |
| `src/features/3d-lab/hooks/useTemplateContent.tsx` | Special path registration mirroring stairway. |
| `src/features/3d-lab/config/registry/cat-06.ts` | Hidden/QA module registry entry when ready. |

## Computation Contract

Inputs:

```typescript
interface LightingRoomParams {
  lampType: 'incandescent' | 'fluorescent' | 'led'
  wattage: number
  lumens: number
  beamAngle: number
  colorTemp: number
  mountingHeight: number
  roomType: 'office' | 'drafting' | 'reading' | 'corridor' | 'custom'
  roomWidth: number
  roomDepth: number
}
```

Outputs:

```typescript
interface LightingRoomState {
  roomArea: number
  averageLux: number
  targetLux: number | null
  lumensNeededForTarget: number | null
  lpd: number
  efficacy: number
  beamDiameterAtFloor: number
  colorTempLabel: 'warm' | 'neutral' | 'cool'
  targetStatus: 'target-met' | 'below-target' | 'source-pending' | 'custom'
  sourceStatusByCheck: Record<string, SourceStatus>
}
```

Required formulas:

- `roomArea = roomWidth * roomDepth`
- `averageLux = lumens / roomArea`
- `lumensNeededForTarget = targetLux * roomArea`
- `lpd = wattage / roomArea`
- `efficacy = lumens / wattage`
- `beamDiameterAtFloor = 2 * mountingHeight * tan(beamAngle / 2)`

Rounding:
- average lux: nearest integer
- LPD: one decimal
- efficacy: nearest integer
- room area: one decimal if needed
- beam diameter: one decimal meters

## v0 Presets

These values must be reflected in PRD, formula seeds, and implementation.

| Preset | Room | Lumens | Watts | Expected simplified average |
|---|---:|---:|---:|---:|
| Standard Office | 4m x 4m | 4800 lm | 48 W LED | 300 lux |
| Drafting Studio | 4m x 4m | 12000 lm | 120 W LED | 750 lux |
| Old Incandescent Office | 4m x 4m | 1200 lm | 100 W incandescent | 75 lux |
| Corridor Minimum | 2m x 6m | 1800 lm | 30 W fluorescent | 150 lux |
| Under Target Demo | 4m x 4m | 480 lm | 40 W incandescent | 30 lux |
| Same Lumens LED | 4m x 4m | 1200 lm | 12 W LED | 75 lux |
| Same Lumens Incandescent | 4m x 4m | 1200 lm | 100 W incandescent | 75 lux |

## Special Path Registration

Mirror stairway:

- left sidebar: 286px if content fits; otherwise 320px maximum with no page scroll.
- right sidebar: 386px.
- left content: `LightingRoomLeftPanel embedded useStore={useStore}`.
- right content: compliance/source-aware checks panel.
- canvas: `ParametricSceneRenderer` with `hideOverlays`.
- canvas wrapper: `disableLighting: true` if module-specific scene owns lights. Do not use `lightingPreset: 'clinical'` as the "no competing lights" mechanism.

Use a source-gated `LightingRoomChecksPanel`; do not assume `ComplianceReportPanel` works for PEC/DOE/PGBC because its current law registry is stairway-specific.

## Left Panel Details

Use:
- `InspectorSection`
- `InlineInfoItem`
- `LabSlider`
- existing popover pattern

Top section rows:
- Target status
- Average lux
- Lumens needed
- Current lumens
- LPD
- Efficacy
- Room area
- Beam coverage
- Color temperature

Control sections:
- Light source
- Fixture
- Room
- Presets

Control count rule:
- No default section should expose more than four primary controls without grouping.

## Right Panel Details

Default:
- summary badge
- one prioritized fix
- check cards

Check card fields:
- source family
- check label
- current value
- target value
- source status
- learner-safe status label
- action/fix if below target

Source detail:
- hidden behind action
- source id and status visible
- no long quotes in default view

## 3D Scene Details

Geometry:
- floor
- ceiling
- back wall
- left wall
- fixture body
- optional beam cone
- optional grid
- optional human scale

Lighting:
- module light driven by params
- global scene lighting stays neutral and low enough not to erase parameter changes
- visual intensity mapping can be tuned, but must be documented as visual calibration

Visual states:
- target met: stable neutral room
- below target source-pending: dimmer room plus review/warning panel state
- approved below target: dimmer room plus functional red in panel and subtle scene accent
- beam exploration: cone and floor footprint update
- color temperature: material tint/lighting color updates plus text label

## Test Plan For Later Code Pass

Unit:
- formulas
- rounding
- presets
- source guard
- target status

Integration:
- module config loads through module path
- registry entry resolves
- special path renders custom panels
- right panel receives check/source state

Visual:
- default office
- drafting
- under target
- same lumens
- beam angle
- color temperature
- mobile bottom sheet

Accessibility:
- slider keyboard input
- labels and units
- source status text
- color-independent state text

## Definition Of Done For Hidden QA

- Formula tests pass.
- Module route renders without console errors.
- Required screenshots captured.
- Source-pending states fail closed.
- README and release checklist updated with evidence.

## Definition Of Done For Learner Release

- Source cards approved.
- UX first-run flow verified.
- SME validates legal/source language.
- Visual QA passes at desktop and mobile.
- No known P0/P1 conflicts remain open.
