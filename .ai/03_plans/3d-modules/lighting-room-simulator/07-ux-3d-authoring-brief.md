# UX/3D Authoring Brief — Lighting Room Simulator

**Updated 2026-05-15**: Rewritten against stairway-code-compliance production patterns in `useTemplateContent.tsx`, `StairwayWorkbenchPanels.tsx`, `LabSlider`, `InspectorSection`, `InlineInfoItem`.

## Learning Model

**Primary mode**: guided learner insight → parameter-driven exploration → visual feedback → source-aware check.

The learner changes a lighting parameter (lamp type, wattage, beam angle) and immediately sees the visual consequence in a realistic 3D room. The module teaches through:
1. **Direct perception**: "I see the room get brighter when lumens increase"
2. **Quantitative reinforcement**: Computed lux, LPD, efficacy displayed alongside the visual
3. **Source-aware checks**: Review/pass/fail language depends on source-card approval. Source-pending values never render as legal violations.

## 3D Scene Authoring

### Room Construction
- **Floor**: 4m × 4m (default), light grey (#e5e5e5) to show light falloff clearly. 1m grid overlay optional.
- **Ceiling**: 4m × 4m, white (#ffffff), at 2.7m height (PD 1096 standard). Contains the light fixture at center [2, 2.7, 2].
- **Back Wall**: 4m × 2.7m, positioned at z=4, warm white/beige to show warm vs cool light differences.
- **Left Wall**: 4m × 2.7m, positioned at x=0, same material as back wall.
- **Open sides**: Right wall (x=4) and front wall (z=0) are absent — creating the "Sims cutaway" view.
- **Materials**: MeshStandardMaterial with roughness 0.8 to diffuse light naturally (not mirror-like).

### Light Fixture
- **Ceiling fixture model**: Simple cylinder (r=0.15m, h=0.08m) at ceiling center, representing a recessed downlight or surface-mount fixture.
- **Three.js light source**: PointLight placed slightly below the fixture (at [2, 2.60, 2]) so it illuminates the room surfaces.
- **Intensity**: Dynamically mapped from lumens. Calibration baseline: 4800 lumens (Standard Office teaching target) → visually adequate room illumination with MeshStandardMaterial. This is visual calibration, not measured lux.
- **Color**: Mapped from color temperature slider (2700K warm → 6500K cool) using kelvin-to-RGB conversion.
- **Beam cone visualization** (optional toggle): Transparent cone from the fixture showing the beam spread angle. Toggle on/off via floating toolbar.

### Visual Feedback
- **Light falloff**: Visible gradient on floor and walls as distance from fixture increases — demonstrates inverse square law visually.
- **Beam spread**: Changing the beam angle parameter narrows/widens the visible cone and changes the lit area on the floor.
- **Color temperature**: Warm (2700K) → orange-tinted room; Cool (6500K) → blue-tinted room.
- **Under-target overlay**: When the selected target is not met, the room visibly dims and may show a subtle review overlay. Destructive red is allowed only after source approval makes the check a real functional non-compliance state.

### Scene Layout (Top-Down)
```
        Back Wall (z=4)
    ┌─────────────────────┐
    │                     │
    │     ● Light         │
    │   (ceiling center)  │
 L  │                     │  Open
 W  │                     │  Side
 a  │                     │
 l  │                     │
 l  ├─────────────────────┤
    │    Front Open       │
    └─────────────────────┘
        z=0 (open)
```

## Camera Presets

| Preset | Position | Target | FOV | Purpose |
|--------|----------|--------|-----|---------|
| `iso-nw` | [6, 4.5, 6] | [2, 1.0, 2] | 35 | Default — shows floor, back wall, left wall, and light fixture |
| `front` | [2, 1.5, 7] | [2, 1.5, 2] | 40 | Face-on to the room interior — good for seeing light on back wall |
| `top` | [2, 8, 2.01] | [2, 0, 2] | 50 | Plan view — shows beam spread pattern on floor |
| `perspective` | [6, 4.5, 6] | [2, 1.0, 2] | 35 | Free exploration fallback using current camera preset contract |

Note: OrbitControls enabled by default. User can freely orbit. Camera presets are snap points.

## Panel Architecture

### Registration Pattern (match stairway)

In `useTemplateContent.tsx`, register a special path for `lighting-room-simulator`. Do not assume `ParametricSceneRenderer` can emit lights; follow `14-lighting-architecture-bridge.md`.

```typescript
if (cfg.id === 'lighting-room-simulator') {
  return {
    shellConfig: {
      ...shellConfig,
      leftSidebar: { width: 286, title: cfg.title, mobileTabLabel: 'Controls' },
      rightSidebar: { width: 386, title: 'Compliance', mobileTabLabel: 'Compliance' },
    },
    capabilities,
    content: {
      canvasContent: canvasWrapper(
        <ParametricSceneRenderer config={cfg} useStore={useStore} hideOverlays />,
        { disableLighting: true },  // Module scene owns its own teaching light
      ),
      leftSidebarContent: (
        <LightingRoomLeftPanel embedded useStore={useStore} />
      ),
      rightSidebarContent: (
        <LightingRoomChecksPanel embedded useStore={useStore} />
      ),
    },
  }
}
```

### Left Sidebar (286px) — `LightingRoomLeftPanel`

**Pattern**: Read-only computed values FIRST (education before control), then slider groups. Uses `InspectorSection`, `InlineInfoItem`, `LabSlider` — same building blocks as stairway.

```
┌──────────────────────────────────────────┐ ← 286px
│ LIGHTING INFORMATION                     │ ← InspectorSection, DM Mono 10.5px uppercase
│                                          │
│  ⓘ Target status       At target        │ ← InlineInfoItem (info icon → label → ··· → value)
│  ⓘ Average illuminance 300 lux          │
│  ⓘ Lumens needed       4,800 lm         │
│  ⓘ Lighting power dens 3.0 W/m²         │
│  ⓘ Lamp efficacy        100 lm/W        │
│  ⓘ Room area            16 m²           │
│  ⓘ Light source height  2.70 m          │
│  ⓘ Beam floor coverage  Ø3.1m (90°)     │
│  ⓘ Color temperature    4000K (neutral) │
│──────────────────────────────────────────│
│ LIGHT SOURCE                             │ ← InspectorSection
│  Lamp type    ───●───  LED               │ ← LabSlider or dropdown
│  Wattage      ───●───  48 W             │ ← LabSlider with source-aware review state
│  Lumens       ───●───  4,800 lm         │
│──────────────────────────────────────────│
│ FIXTURE                                  │ ← InspectorSection
│  Beam angle   ───●───  90°              │
│  Color temp   ───●───  4000K            │
│──────────────────────────────────────────│
│ ROOM                                     │ ← InspectorSection
│  Room type    ───●───  Office            │
│  Room width   ───●───  4.0 m            │
│  Room depth   ───●───  4.0 m            │
└──────────────────────────────────────────┘
```

### Right Sidebar (386px) — `LightingRoomChecksPanel`

Uses a lighting-specific source-gated checks panel. The generic stairway `ComplianceReportPanel` is not sufficient because its law registry is hard-coded to RA 9514, BP 344, PD 1096, and BP 220 and renders legal pass/fail language.

```
┌─ SOURCE CHECKS ──────────────────────────┐ ← 386px
│ TEACHING TARGET                          │
│  ● Office average lux ≥ 300     At target│
│  ● Source status       Located, pending  │
│                                          │
│ ENERGY / LPD                             │
│  ● Office LPD ≤ located limit    Review  │
│                                          │
│ RA 9514 FIRE CODE                        │
│  ● Exit path ≥ 10.7 lux        Context   │
│                                          │
│ LEARNER FIX                              │
│  ⓘ Increase lumens to 4,800 lm           │ ← one prioritized repair action
└──────────────────────────────────────────┘
```

## Component Inventory (Reuse vs New)

### Reuse (from existing codebase)
| Component | Source | Purpose |
|-----------|--------|---------|
| `InspectorSection` pattern | StairwayWorkbenchPanels | Section card pattern; currently private, so either extract shared primitive or duplicate locally in `LightingRoomPanels.tsx` |
| `InlineInfoItem` pattern | StairwayWorkbenchPanels | Read-only value pattern; currently private, so either extract shared primitive or duplicate locally in `LightingRoomPanels.tsx` |
| `LabSlider` | `components/controls/LabSlider` | Slider with label, info, violation state |
| `SourceCompliancePanel` pattern | `components/templates/SourceCompliancePanel` | Source-gated status inspiration |
| `ParametricSceneRenderer` | `templates/ParametricSceneRenderer` | Renders geometry from config; cannot render live lights without bridge work |
| `SceneErrorBoundary` | `components/templates/SceneErrorBoundary` | Error boundary for canvas |
| `CanvasWrapper` | `components/CanvasWrapper` | R3F Canvas wrapper |
| `createModuleStore` | `stores/createModuleStore` | Zustand store with params state |

### New (must build)
| Component | File | Purpose |
|-----------|------|---------|
| `LightingRoomLeftPanel` | `components/templates/LightingRoomPanels.tsx` | Custom left sidebar with computed values + sliders |
| `LightingRoomChecksPanel` | `components/templates/LightingRoomPanels.tsx` or sibling file | Source-gated right sidebar checks and fix cards |
| `LightingRoomScene` or typed light extension | TBD by `14-lighting-architecture-bridge.md` | Owns live PointLight/SpotLight behavior |
| `lighting-room-simulator.ts` | `config/modules/06-electrical/lighting-room-simulator.ts` | Module config (parameters, geometry, violations) |
| Special path in `useTemplateContent.tsx` | Add `if (cfg.id === 'lighting-room-simulator')` block | Register custom panels |

## Interaction States

### Default View
- Room loads with Standard Office preset (LED, 4800lm, 4m×4m, 4000K)
- Left sidebar shows computed illuminance = 300 lux and target status = At target
- Right sidebar shows target met in the teaching model and source status separately
- Room is brightly lit in neutral white

### Under-Target Review View
- User changes to Incandescent + 40W → illuminance drops below 300 lux
- Left sidebar: illuminance value moves to review/below-target styling
- 3D scene: room goes dim; source-pending state uses warning/review styling, not destructive red
- Right sidebar: one fix card explains how many lumens are needed

### Beam Angle Exploration
- User narrows beam from 90° → 30°
- 3D scene: beam cone tightens, bright circle on floor shrinks
- Left sidebar: "Beam floor coverage" updates (e.g., Ø3.1m → Ø1.0m)
- Demonstrates: narrow beam = bright spot, rest of room dark

### Color Temperature Shift
- User moves from 4000K → 2700K (warm)
- 3D scene: room takes on orange/yellow tint
- Left sidebar: "Color temperature" shows "2700K (warm white)"
- User moves to 6500K (cool)
- 3D scene: room takes on blue/white tint

### Lamp Type Comparison
- Preset: "Incandescent vs LED Same Lumens"
- Both produce 1200 lumens
- Incandescent: 100W, efficacy 12 lm/W
- LED: 12W, efficacy 100 lm/W
- Room looks identical (same lumens)
- Left sidebar shows dramatically different wattage and efficacy

## Typography & Visual Tokens

Follow stairway patterns exactly:
- **Section titles**: DM Mono, 10.5px, uppercase, `tracking-[0.12em]`, `text-muted-foreground`
- **Computed values**: DM Mono, 12px, `tabular-nums`, `text-foreground`, font-medium
- **Labels**: System font, 11px, `font-medium`, `text-foreground`
- **Slider labels**: System font, with `labelInfoTitle`/`labelInfoDescription` info popovers
- **Separators**: `divide-y divide-border/60` between slider rows
- **Panel background**: `bg-muted/25` with `p-1.5`
- **Section cards**: `rounded-lg bg-card shadow-sm`

## Accessibility

- All control labels readable at 13-inch MacBook scale
- Slider values displayed alongside slider handles
- Color temperature changes also indicated by numeric K value
- Under-target states use both visual treatment and text; destructive red is reserved for source-approved non-compliance and is never the only signal
- Info popovers on every computed value explain the formula
- Keyboard navigation for all sliders and dropdowns
