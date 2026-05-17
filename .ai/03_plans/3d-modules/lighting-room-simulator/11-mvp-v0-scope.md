# MVP v0 Scope — Lighting Room Simulator

## Scope Boundary

v0 is a **single-room, single-fixture 3D light laboratory**. One room. One ceiling light. Parameters change → you see the result in 3D.

## v0 Includes

### 3D Scene
- [ ] 4m×4m room with floor, ceiling, back wall, left wall (cutaway Sims-style)
- [ ] Ceiling light fixture (simple cylinder geometry)
- [ ] Three.js PointLight or SpotLight at fixture position, intensity driven by lumens, owned by the selected architecture bridge path
- [ ] Room surfaces use MeshStandardMaterial (responds to scene lighting)
- [ ] Orbit controls (rotate, zoom, pan)
- [ ] Optional 1m floor grid toggle
- [ ] Optional beam cone visualization toggle
- [ ] 3 required camera presets using current keys (`iso-nw`, `front`, `top`); `perspective` fallback optional

### Left Sidebar Controls
- [ ] Lamp Type dropdown (Incandescent / Fluorescent / LED)
- [ ] Wattage slider (5–200W)
- [ ] Lumens slider (200–12000 lm)
- [ ] Beam Angle slider (15–120°)
- [ ] Color Temperature slider (2700K–6500K)
- [ ] Mounting Height slider (2.1–3.6m)
- [ ] Room Type dropdown (Office / Drafting / Reading / Corridor / Custom)
- [ ] Room Width slider (2–8m)
- [ ] Room Depth slider (2–8m)

### Computed Outputs (Read-only)
- [ ] Illuminance (lux) at work plane — `lumens / area` simplified
- [ ] Lighting Power Density (W/m²) — `wattage / area`
- [ ] Lamp Efficacy (lm/W) — `lumens / wattage`
- [ ] Source-aware target indicator: room type target vs computed illuminance

### Presets
- [ ] Standard Office (300 lux teaching target, LED, 4m×4m, 4800 lm)
- [ ] Drafting Studio (750 lux, LED, 4m×4m)
- [ ] Old Incandescent Office (1200 lm from 100W)
- [ ] Corridor Minimum (150 lux teaching target, 2m×6m, 1800 lm)
- [ ] Under Target Demo (under-lit office)
- [ ] Same Lumens Comparison (1200 lm LED vs 1200 lm incandescent)

### Source-Gated Review Rules
- [ ] Office illuminance < 300 lux → review until source-approved
- [ ] Drafting illuminance < 750 lux → review until source-approved
- [ ] Reading illuminance < 500 lux → review until source-approved
- [ ] Corridor illuminance < 150 lux → review until source-approved
- [ ] LPD over approved threshold → review until source-approved

### Source Truth
- [ ] All lux targets tagged with source family (DOE for v0 located targets, PEC deferred until primary locator, or pedagogical)
- [ ] Source-pending labels on unverified values
- [ ] Fail-closed: no `COMPLIANT`, `VIOLATION`, `PASS`, or `FAIL` legal label until source-approved

## v0 Explicitly Excludes

- Multi-fixture layouts (future: lumen method calculator)
- IES photometric files
- Daylight / window light simulation
- Room Cavity Ratio calculations (future v1)
- Coefficient of Utilization / Light Loss Factor inputs (future v1)
- Full lumen method N = (E×A)/(Φ×CU×LLF) calculation (future v1)
- Quiz/Wiki deep links (requires stable preset IDs first)
- Challenge mode
- Multi-room comparison
- Real-time shadow maps (too expensive for mobile)

## Implementation Approach

1. **Pure calculation functions first**: `computeLightingState()` as testable function → lux, LPD, efficacy, beam coverage. Follow `stairway-computation.ts` pattern (pure computation engine, no React dependency).
2. **Custom panel component**: `LightingRoomLeftPanel.tsx` following `StairwayWorkbenchPanels.tsx` pattern — InspectorSection cards with InlineInfoItem computed values FIRST, then LabSlider controls.
3. **Architecture bridge first**: Choose module-specific `LightingRoomScene` or a typed `LightInstruction` extension per `14-lighting-architecture-bridge.md`.
4. **Registration in useTemplateContent.tsx**: Special path `if (cfg.id === 'lighting-room-simulator')` with 286px-320px left sidebar, 386px right sidebar, and `disableLighting: true` if the module scene owns its lights.
5. **ParametricSceneConfig plus custom scene**: Existing `geometry()` can generate room surfaces + fixture; live lights require custom scene logic or a renderer extension.
6. **LightingRoomChecksPanel**: Use a custom source-gated right panel; do not rely on the current stairway `ComplianceReportPanel`.
7. **No new dependencies**: Uses existing Three.js, R3F, drei, `createModuleStore`, `LabSlider`, and local/shared inspector patterns.
8. **Hidden QA route**: `/dashboard/3d-lab/lighting-room-simulator` should be QA-gated via registry/dashboard visibility and source status; direct route access must be treated as internal until release-gated.

## File Structure (Planned)

```
src/features/3d-lab/
├── config/
│   ├── modules/06-electrical/
│   │   ├── lighting-room-simulator.ts          ← Module config (parameters, geometry, violations, presets)
│   │   ├── lighting-computation.ts             ← Pure computation engine (computeLightingState, etc.)
│   │   └── lighting-computation.test.ts        ← Deterministic formula tests (lux, LPD, efficacy, violations)
│   └── registry/
│       └── cat-06.ts                           ← Add registry entry for lighting-room-simulator
├── components/templates/
│   ├── LightingRoomPanels.tsx                  ← Custom left and source-gated right panels
│   └── LightingRoomScene.tsx                   ← Accepted v0 custom scene under architecture bridge Option A
└── hooks/
    └── useTemplateContent.tsx                  ← Add special path for lighting-room-simulator
```

## Dependencies

- **Reuse**: `ParametricSceneConfig`, `createModuleStore`, `LabSlider`, `CanvasWrapper`, `SceneErrorBoundary`, source-compliance patterns, stairway inspector layout patterns
- **Do not assume direct reuse**: `InspectorSection` and `InlineInfoItem` are private to `StairwayWorkbenchPanels.tsx`; `ComplianceReportPanel` is stairway-law-specific; `ParametricSceneRenderer` does not emit live lights.
- **New**: kelvin-to-RGB utility (~30-line function), Three.js light-to-lumens visual calibration, `computeLightingState()` computation engine, `LightingRoomChecksPanel`, and either `LightingRoomScene` or a typed light-instruction renderer extension.
