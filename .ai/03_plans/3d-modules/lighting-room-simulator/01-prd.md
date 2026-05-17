# PRD — Lighting Room Simulator

## Goal

Build a 3D Lab module that teaches lighting design fundamentals through a live 3D room simulator. Learners manipulate lighting parameters (lumens, wattage, fixture type, beam angle, color temperature) and see the visual result on room surfaces in real-time. The room acts as a "light laboratory" — change a parameter, see the light change.

## Non-goals

- No photorealistic global illumination renderer. We use Three.js MeshStandardMaterial + PointLight/SpotLight — good enough to show meaningful differences.
- No IES photometric file support in v0.
- No multi-room or multi-fixture layouts in v0 (single room, single ceiling fixture).
- No daylight/sunlight simulation in v0.
- No Supabase writes or migrations in planning phase.
- No learner-facing "COMPLIANT" / "VIOLATION" labels until source rules are human-approved.
- No claim that SlateCamp's 3D rendering is a professional lighting design tool.
- No generic `ComplianceReportPanel` assumption for v0; current stairway compliance grouping is law-prefix-specific and does not cover PEC/DOE/PGBC source statuses.
- No assumption that `ParametricSceneConfig.geometry()` can emit live lights; v0 needs the architecture bridge in `14-lighting-architecture-bridge.md`.

## Primary users

1. **LEA examinees** learning Building Utilities — Electrical / Illumination topics.
2. **Architecture students** who need to understand the relationship between lamp specs (watts, lumens), room dimensions, and resulting illuminance.
3. **Reviewers/educators** explaining why a 60W incandescent in a large conference room fails the lux requirement.

## Learning outcomes

A learner can:
- **See** how lumens, not watts, determine brightness — change a 60W incandescent (800 lm) to a 9W LED (800 lm) and see identical output.
- **Understand** illuminance (lux) as lumens distributed over area: `lux = lumens / m²`.
- **Recognize** that distance from the light source affects illuminance (inverse square law).
- **Compare** lamp types by efficacy: incandescent (~12 lm/W), fluorescent (~60 lm/W), LED (~100 lm/W).
- **Identify** when a room is under the selected teaching target, while seeing whether that target is source-approved, source-pending, or pedagogical.
- **See** beam angle effects: narrow spot vs. wide flood on the same ceiling fixture.
- **Understand** color temperature (2700K warm → 6500K cool) and how it affects room perception.
- **Calculate** lighting power density (LPD = total watts / floor area) and recognize energy code limits.

## Proposed module identity

- **Module ID**: `lighting-room-simulator`
- **Title**: `Lighting Room Simulator`
- **Category**: `ELECTRICAL` (06-electrical)
- **Subject**: `pec` (Philippine Electrical Code)
- **Template type**: `parametric` — the geometry() function generates the room + light fixture dynamically based on parameters
- **Visibility**: hidden QA route first; dashboard QA preview only after source-locator pass
- **Learner release**: blocked until source approval and formula tests pass
- **Launch phase**: 2 (Technical)

## 3D Scene Design

### The Room (Cutaway View)
- **Floor**: 4m × 4m plane, light-colored to show illumination clearly (light grey/beige)
- **Ceiling**: 4m × 4m plane at 2.7m height (standard Philippine ceiling per PD 1096), white
- **Walls**: Two walls forming an L-shape (e.g., back wall + left wall), so the user can orbit and see the light hitting both walls and floor. The other two walls are "open" for the cutaway effect.
- **Grid overlay**: Optional 1m grid on floor for spatial reference
- **Human scale figure**: Optional 1.7m silhouette for scale reference (existing `showHumanScale` feature)

### The Light Fixture
- **Position**: Center of ceiling at [2, 2.7, 2] in a 4m×4m room
- **Geometry**: Simple 3D cylinder/box representing a ceiling-mounted fixture (recessed downlight or surface-mount troffer based on parameter)
- **Three.js light**: The fixture contains a PointLight or SpotLight whose intensity, color, and angle are driven by module parameters

### Visual Feedback
- **Brightness**: The room surfaces visibly brighten/dim as lumens change
- **Beam pattern**: A SpotLight creates a visible cone on the floor/walls; changing beam angle widens/narrows the spread
- **Color temperature**: Warm (2700K → orange-tinted light) to Cool (6500K → blue-tinted light)
- **Source-aware review indicators**: When illuminance falls below the selected teaching target, the scene may dim or show restrained review styling. Do not use `Violation` language or destructive red until a source card is SME-approved.

## Module Parameters (Left Sidebar Controls)

### Group: Light Source

| Key | Label | Type | Range | Default | Unit |
|-----|-------|------|-------|---------|------|
| `lampType` | Lamp Type | dropdown | incandescent, fluorescent, LED | LED | — |
| `wattage` | Power (Wattage) | slider | 5–200 | 48 | W |
| `lumens` | Light Output (Lumens) | slider | 200–12000 | 4800 | lm |
| `efficacy` | Efficacy | computed | — | — | lm/W |

### Group: Fixture

| Key | Label | Type | Range | Default | Unit |
|-----|-------|------|-------|---------|------|
| `beamAngle` | Beam Angle | slider | 15–120 | 90 | ° |
| `colorTemp` | Color Temperature | slider | 2700–6500 | 4000 | K |
| `mountingHeight` | Mounting Height | slider | 2.1–3.6 | 2.7 | m |

### Group: Room

| Key | Label | Type | Range | Default | Unit |
|-----|-------|------|-------|---------|------|
| `roomType` | Room Type Preset | dropdown | office, reading, drafting, corridor, lobby, custom | office | — |
| `roomWidth` | Room Width | slider | 2–8 | 4 | m |
| `roomDepth` | Room Depth | slider | 2–8 | 4 | m |

### Group: Computed Outputs (Read-only)

| Key | Label | Computation |
|-----|-------|-------------|
| `illuminance` | Illuminance at Task Plane | lumens / roomArea (simplified) |
| `lpd` | Lighting Power Density | wattage / roomArea |
| `efficacyDisplay` | Lamp Efficacy | lumens / wattage |

### Inter-parameter relationships

- **Wattage ↔ Lumens**: Linked by lamp type efficacy. Changing lamp type recalculates lumens from wattage (or vice versa). Default link: changing wattage auto-calculates lumens.
- **Room Type Preset**: Sets illuminance target and auto-suggests lumens based on room area. For example, selecting "Drafting" sets target 750 lux and calculates required lumens for the room size.
- **Mounting Height**: Affects illuminance at floor level (inverse square: intensity ∝ 1/d²).

## Presets

| Preset ID | Label | Values |
|-----------|-------|--------|
| `office-standard` | Standard Office (300 lux teaching target) | lampType=LED, wattage=48, lumens=4800, beamAngle=90, colorTemp=4000K, roomType=office, roomWidth=4, roomDepth=4 |
| `drafting-studio` | Drafting Studio (750 lux teaching target) | lampType=LED, wattage=120, lumens=12000, beamAngle=90, colorTemp=5000K, roomType=drafting, roomWidth=4, roomDepth=4 |
| `old-incandescent` | Old Incandescent Office | lampType=incandescent, wattage=100, lumens=1200, beamAngle=120, colorTemp=2700K, roomType=office, roomWidth=4, roomDepth=4 |
| `corridor-minimum` | Corridor (150 lux teaching target) | lampType=fluorescent, wattage=30, lumens=1800, beamAngle=120, colorTemp=4000K, roomType=corridor, roomWidth=2, roomDepth=6 |
| `under-target-demo` | Under Target Office | lampType=incandescent, wattage=40, lumens=480, beamAngle=60, colorTemp=2700K, roomType=office, roomWidth=4, roomDepth=4 |
| `same-lumens-led` | Same Lumens — LED | lampType=LED, wattage=12, lumens=1200, beamAngle=90, colorTemp=4000K, roomType=office, roomWidth=4, roomDepth=4 |
| `same-lumens-incandescent` | Same Lumens — Incandescent | lampType=incandescent, wattage=100, lumens=1200, beamAngle=90, colorTemp=2700K, roomType=office, roomWidth=4, roomDepth=4 |

## Violation Rules (Source-pending until verified)

| ID | Field | Severity | Check | Message | Code Citation |
|----|-------|----------|-------|---------|---------------|
| `office-target-review` | roomType/illuminance | review until source-approved | roomType=office && illuminance < 300 | Below the selected office teaching target | `SRC-DOE-ILLUM-001` / pending |
| `drafting-target-review` | roomType/illuminance | review until source-approved | roomType=drafting && illuminance < 750 | Below the selected drafting/drawing teaching target | `SRC-DOE-ILLUM-004` / located, pending SME |
| `corridor-target-review` | roomType/illuminance | review until source-approved | roomType=corridor && illuminance < 150 | Below the selected corridor teaching target | `SRC-DOE-ILLUM-003` / located, pending SME |
| `reading-target-review` | roomType/illuminance | review until source-approved | roomType=reading && illuminance < 500 | Below the selected reading/proofreading task target | `SRC-DOE-ILLUM-002` / located, pending SME |
| `lpd-review` | lpd | review until source-approved | lpd > approved limit | LPD above selected source/pedagogical threshold | `SRC-PGBC-LPD-001` / located, pending SME |

## UX acceptance criteria

- **First load**: Shows a calm, well-lit office room (Standard Office preset).
- **Left sidebar** (286px — matching stairway module width): Uses custom `LightingRoomLeftPanel` component (not GenericControlPanel). Read-only computed values FIRST (illuminance, LPD, efficacy, room area, beam coverage, color temp) using `InlineInfoItem` with info popovers. Then slider controls grouped into Light Source, Fixture, Room sections using `InspectorSection` cards with `LabSlider`. Follows stairway `StairwayWorkbenchPanels` pattern exactly.
- **Right sidebar** (386px — matching stairway compliance width): Uses a lighting-specific, source-gated checks panel. The current generic `ComplianceReportPanel` is not sufficient because it only recognizes stairway law prefixes and renders pass/fail legal language.
- **Panel registration**: Custom panels registered via special path in `useTemplateContent.tsx` (`if (cfg.id === 'lighting-room-simulator')`). Scene lighting must follow `14-lighting-architecture-bridge.md`; `lightingPreset: 'clinical'` alone is not acceptable because it adds bright ambient/key/fill lights.
- **Orbit camera**: Default `iso-nw` view showing floor + 2 walls + ceiling. User can orbit freely.
- **Camera presets**: `iso-nw` (default), `front`, `top`, and `perspective` using the current camera preset keys.
- **Real-time feedback**: Slider changes immediately update the 3D light and computed values. No "Apply" button needed.
- **Beam cone visualization**: Optional transparent cone showing the light beam spread from the fixture.
- **No-scroll**: Controls fit on 13-inch MacBook-class displays without scrolling.
- **Source-aware color**: Source-pending under-target states use review/warning styling. Destructive red is reserved for approved functional non-compliance states.
- **Source status**: Always visible in DOM, not hidden in the canvas.
- **Typography**: DM Mono for values and section titles (matching stairway pattern). Section titles: 10.5px uppercase tracking. Values: 12px tabular-nums.

## Technical acceptance criteria for future implementation

- **Custom panel component**: `LightingRoomLeftPanel` in `src/features/3d-lab/components/templates/LightingRoomPanels.tsx` following `StairwayWorkbenchPanels.tsx` pattern — InspectorSection cards, InlineInfoItem rows for computed values, LabSlider for controls.
- **Registration**: Special path in `src/features/3d-lab/hooks/useTemplateContent.tsx` for `lighting-room-simulator` with 286px-320px left sidebar, 386px right sidebar, source-gated checks, and explicit scene-light behavior from `14-lighting-architecture-bridge.md`.
- Pure calculation functions with deterministic tests before 3D rendering (lux calculation, LPD, efficacy, beam coverage).
- `geometry()` function may generate room (floor + ceiling + 2 walls), fixture model, and optional beam cone visualization, but live `PointLight` / `SpotLight` must be handled by a module-specific scene component or a typed renderer extension.
- Three.js PointLight/SpotLight parameters driven by module state — intensity mapped from lumens, color from colorTemp — only after the architecture bridge decision is implemented.
- Lumens → Three.js intensity mapping calibrated to produce visibly meaningful differences across the slider range.
- Stable preset IDs before any Wiki/Quiz deep links.
- Browser QA captures at least: default office, drafting studio, under-lit violation, and incandescent-vs-LED comparison states.
- Mobile: orbit controls via touch, bottom sheet for parameter controls.

## 3D Template: Parametric Scene Config (Draft)

```typescript
// Conceptual config shape for the lighting-room-simulator
// Follows stairway-code-compliance pattern in useTemplateContent.tsx:
// - Special path for cfg.id === 'lighting-room-simulator'
// - Custom LightingRoomLeftPanel (286px left sidebar)
// - Lighting-specific source-gated checks panel (386px right sidebar)
// - Explicit module-light scene path; do not rely on clinical preset alone

const config: ParametricSceneConfig = {
  id: 'lighting-room-simulator',
  title: 'Lighting Room Simulator',
  description: 'Interactive 3D room where you control lighting parameters and see the visual result.',
  subject: 'pec',
  parameters: [ /* wattage, lumens, beamAngle, colorTemp, roomType, roomWidth, roomDepth */ ],
  geometry: (params) => [
    // Floor plane
    // Ceiling plane
    // Back wall + Left wall (L-shape cutaway)
    // Ceiling fixture model (cylinder)
    // Beam cone visualization (optional, toggleable)
    // Source-aware review overlay when under-lit; no destructive red until approved
  ],
  violations: [ /* source-gated review checks via computeLightingState() */ ],
  annotations: [ /* informational labels in 3D space */ ],
  presets: [ /* Standard Office, Drafting Studio, etc. */ ],
  camera: {
    position: [6, 4.5, 6],
    target: [2, 1.0, 2],
    fov: 35,
    zoomToFit: { position: [6, 4.5, 6], target: [2, 1.0, 2], zoom: 50 },
    resetPreset: 'iso-nw',
    presets: {
      'iso-nw': { position: [6, 4.5, 6], target: [2, 1.0, 2], fov: 35 },
      front: { position: [2, 1.5, 7], target: [2, 1.5, 2], fov: 40 },
      top: { position: [2, 8, 2.01], target: [2, 0, 2], fov: 50 },
      perspective: { position: [6, 4.5, 6], target: [2, 1.0, 2], fov: 35 },
    }
  },
  scale: 1,
  contextScenario: 'You are designing the lighting for a 16m² office. Use the simplified teaching model to reach the selected target lux while watching energy use and source status.',
  leaQuestionCount: 4,
  leaQuestionType: 'code compliance',
  supportedPhases: ['guided', 'sandbox'],
  hasChallengeMode: false,  // Future: "achieve target lux with max LPD constraint"
}
```

## Release posture

Implementation may proceed as hidden QA after the P0 closeout in `16-p0-source-locator-and-architecture-closeout.md`. Learner release still requires `SOURCE_READY` and SME approval for every displayed legal source card. PEC must not appear as a v0 source-backed law card until a primary PEC locator is added.

## LEA Coverage (Research Findings)

The lighting module aligns with the **Utilities** paper (30% of Day 1) under **"Acoustics and Illumination"**:

> *"The psycho-physics of acoustics and lighting; Acoustical treatment and corrections." Ability to identify and apply different important aspects of lighting as these relate to planning and design principles for buildings/structures and their grounds; and relate the psychological and physiological effects of such utility systems on building occupants."*

**Sub-topics explicitly tested:**
- Electrical power and lighting supply, distribution, and fixtures
- Climate/lighting/security controls
- Psycho-physics of lighting (physiological effects of light on occupants)
- Code provisions for lighting

### Source Law Families

| Law | Topic | Key Sections |
|-----|-------|--------------|
| PD 1096 (NBC) | Light and Ventilation | Rule VIII §801–811 (window area 10%, ceiling heights, room sizes) |
| RA 9514 (Fire Code) | Exit illumination | IRR §10.2.5.11 (min 10.7 lux at floor level) |
| DOE Energy Code v2008 | Illuminance targets & LPD limits | Tables 3.1, 3.4 |
| Philippine Green Building Code | Maximum LPD | Table 11 |
| PEC (Electrical Code) | Illumination requirements | Deferred from v0 source-backed display until primary locator is obtained |

### Key LEA Values Students Must Know

| Value | Source |
|-------|--------|
| 10.7 lux minimum exit illumination | RA 9514 Fire Code |
| 300 lux standard classroom | DOE Energy Code |
| 500 lux reading/proofreading localized task target | DOE Energy Code |
| 300–750 lux general office | DOE Energy Code |
| Incandescent ~15 lm/W (efficacy) | Standard reference |
| Fluorescent ~80 lm/W (efficacy) | Standard reference |
| LED ~80–100 lm/W (efficacy) | Current standard |
| LPD office max 10.8 W/m² | Green Building Code |
| LPD school max 12.9 W/m² | Green Building Code |

### Key Formulas (LEA Tested)

1. **Illuminance**: `E = Φ ÷ A` (lux = lumens / m²)
2. **Lumen Method**: `N = (E × A) ÷ (Φ × CU × LLF)`
3. **Room Cavity Ratio**: `RCR = 5 × hrc × (L + W) ÷ (L × W)`
4. **Lighting Power Density**: `LPD = Total Watts ÷ Area` (W/m²)
5. **Inverse Square Law**: `E = I ÷ d²`
6. **Cosine Law**: `E = (I × cos θ) ÷ d²`
7. **Efficacy**: `lm/W = Lumens ÷ Wattage`

⚠️ **Critical caveat**: PD 1096 Rule VIII does NOT prescribe specific lux levels for different room types. It prescribes window area ratios (10%), ceiling heights (2.7m/2.4m), and room sizes. The v0 lux teaching targets use the DOE source family; PEC remains deferred from source-backed display until a primary locator is obtained. The module must clearly attribute each requirement to its correct law family.

## References

- PEC Rule 9.50.4 — deferred reference until primary locator is obtained
- PD 1096 (National Building Code of the Philippines) Rule VIII — Light and Ventilation
- RA 9514 Fire Code IRR §10.2.5.11 — Exit Illumination
- Philippine DOE Guidelines on Energy Conserving Design of Buildings v2008 — Tables 3.1, 3.4
- Philippine Green Building Code Table 11 — Maximum Allowed LPD
- IESNA Lighting Handbook (international reference for efficacy/CRI benchmarks)
- Existing SlateCamp modules: `illumination-levels`, `lighting-layout` (2D floor plan precedents)
