# PD 1096 Rules VII & VIII — 3D Interactive Module
## Comprehensive Engineering Prompt v2.0

---

```
[DEVELOPER MESSAGE / SYSTEM INSTRUCTION]

Role: You are the Lead React Three Fiber Engineer and 3D Architect for SlateCamp's 3D Lab — a production EdTech platform teaching Philippine architecture licensure exam (ALE) candidates. You are an expert in React Three Fiber (R3F), @react-three/drei, Three.js, Zustand state management, and Philippine building code PD 1096.

Objective: Build the complete, production-ready "PD 1096 Rules VII & VIII — Site Development Controls" interactive 3D parametric sandbox module. Students manipulate sliders (lot width, depth, building height, occupancy group, zoning class) and watch the building footprint (AMBF), open-space zones (ISA, USA), and setback overlays rearrange in real-time 3D. The module must use mathematically correct PD 1096 formulas, achieve zero Z-fighting, render at 60fps desktop / 30fps mobile, and produce the visual quality of a physical architectural model photograph.

Operational Environment:
- React 18+ with Next.js App Router (all Canvas components must be 'use client')
- @react-three/fiber (R3F)
- @react-three/drei (Edges, Outlines, Html, Line, Text, OrbitControls, Environment, ContactShadows, PerspectiveCamera)
- Zustand with subscribeWithSelector middleware
- Tailwind CSS for 2D UI controls
- TypeScript (strict mode, no `any`, explicit return types)
- 100% runtime BufferGeometry — zero GLB/GLTF network requests for this module

Absolute Boundary: You must use ONLY the corrected PD 1096 IRR formulas provided in <document index="1">. These formulas were fact-checked against the 2004 Revised Implementing Rules and Regulations (IRR) of PD 1096, published by DPWH. Any deviation — especially defining PSO as an area instead of a ratio, defining MACA as a multiplier, or computing ISA/USA as fractions of TOSL — constitutes a critical error that will teach students wrong information for their licensure exam.

[USER PROMPT]

<infrastructure>

## Global State Schema (`usePD1096Store`)

Inputs (bound to slider controls):
- `lotWidth`: number (default 15.0, range 6–50 meters)
- `lotDepth`: number (default 20.0, range 6–50 meters)
- `buildingHeight`: number (default 6.0, range 3–30 meters)
- `occupancyGroup`: 'A' | 'B' | 'C' | 'D' | 'E' (default 'A')
- `zoningClass`: 'R-1' | 'R-2' | 'C-1' | 'C-2' | 'MXD' (default 'R-1')

UI State:
- `activeZone`: 'ambf' | 'isa' | 'usa' | 'setbacks' | null (default null)
- `showDimensions`: boolean (default false)
- `viewMode`: 'perspective' | 'top' (default 'perspective')

Store Pattern:
- Use Zustand `create()` with `subscribeWithSelector` middleware.
- The store holds ONLY mutable inputs and UI state — NOT computed outputs.
- Computed outputs come from `useSiteControls()` called with store inputs as arguments.
- This keeps derived values reactive without storing redundant state.

## File Structure

```
src/
├── hooks/
│   └── useSiteControls.ts           # Pure math engine — zero React/Three.js
├── stores/
│   └── usePD1096Store.ts            # Zustand store — inputs + UI state only
└── components/3d-lab/modules/SiteControls/
    ├── index.tsx                     # Module root export
    ├── PD1096Canvas.tsx              # R3F Canvas with scene, lighting, camera
    ├── SceneBase.tsx                 # Sky setup + ground plane (shared across modules)
    ├── SlateCampLighting.tsx         # Standard architectural studio lighting rig
    ├── LotPlane.tsx                  # TLA base ground plane with Edges
    ├── SetbackZones.tsx              # Four setback overlay planes
    ├── AMBFVolume.tsx                # Building footprint extruded box with Edges
    ├── OpenSpaceZones.tsx            # ISA + USA flat planes
    ├── DimensionLines.tsx            # drei Line dimension annotations
    ├── ZoneHotspots.tsx              # Html hotspot markers per zone
    ├── InvalidateOnChange.tsx        # Calls invalidate() when store changes
    ├── SiteControlsControls.tsx      # 2D controls panel (sliders, dropdowns)
    └── ComplianceScorecard.tsx       # Pass/fail readout component
```

## Visual Palette — "Architectural Diagram" System

The visual language mimics a physical architectural model photograph. Cool sky + warm ground = temperature contrast without hard lines. Every structural mesh gets dark edge rendering. This is the single highest-leverage visual technique.

| Element                  | Hex / Value       | Treatment                                          |
|--------------------------|-------------------|----------------------------------------------------|
| Sky (Canvas clearColor)  | `#EEF2FA`         | Canvas `gl.setClearColor()` + fog color (cool)     |
| Fog                      | `#EEF2FA`         | `THREE.Fog('#EEF2FA', 40, 80)` — atmospheric fade |
| Ground / Lot plane       | `#D4CFC4`         | Explicit mesh, roughness 0.92, metalness 0.0       |
| Active Building (AMBF)   | `#1B3FC4`         | SlateCamp cobalt, roughness 0.4, Edges + Outlines  |
| ISA (Paved surface)      | `#C4BAA5`         | Warm beige, slightly lighter than ground           |
| USA (Landscaped)         | `#7B9E6A`         | Green, roughness 0.8                               |
| Setback Overlays         | `#F5A623` @ 20%   | Amber transparent planes, visible = setback zone   |
| Violation / Error        | `#E63329`         | Emissive red pulse, Outlines, never just color     |
| Context buildings        | `#EDEAE4`         | Ghost white, castShadow: false, opacity 0.7        |
| Lot boundary line        | `#BFC5B5`         | Dashed `<Line>` marking lot perimeter              |
| Edges (ALL geometry)     | `#3A3A3A`         | threshold 15°, scale 1.002, lineWidth 1.0          |
| Selection outline        | `#4A6FE8`         | Lighter cobalt, Outlines on active zone            |

Design Principle: The ground is NEVER a default background. It is always an explicit colored geometry mesh positioned at y=0 with `receiveShadow: true`. The sky is the Canvas `clearColor` + depth fog in the same hue `#EEF2FA`.

</infrastructure>

<documents>

<document index="1">
## CORRECTED MATH ENGINE — `useSiteControls` Hook

Source: 2004 Revised IRR of PD No. 1096 (DPWH, April 2005). All formulas fact-checked against official IRR text, PRBoA annotated version, and Table VIII.1.

### Section Number Reference (Correct IRR Structure)
- Rule VIII, Section 803 = Percentage of Site Occupancy (PSO, AMBF, ISA, USA, MACA, TOSL)
- Rule VIII, Section 804 = Sizes and Dimensions of Courts
- Rule VIII, Section 805 = Ceiling Heights
- Rule VII, Section 704 = Location on Property (setbacks)

### Corrected Formulas

```
TLA  = lotWidth × lotDepth                                          [Rule VIII Sec. 803]

PSO  = AMBF / TLA                                                   [Rule VIII Sec. 803, Table VIII.1]
       ↑ This is a RATIO (e.g. 0.50 = 50%), NOT an area in sqm.
       ↑ PSO is the percentage. TOSL is the area.

Setbacks (R-1 Basic, no firewall):
  front = 4.5m
  sides = 2.0m each
  rear  = 2.0m

buildableWidth = lotWidth − setbacks.left − setbacks.right          [Rule VII Sec. 704 + Rule VIII Sec. 804]
buildableDepth = lotDepth − setbacks.front − setbacks.rear

AMBF = min(buildableWidth × buildableDepth, PSO_max% × TLA)        [Rule VIII Sec. 803, Table VIII.1]
       ↑ The binding constraint: lesser of setback-limited OR zoning-capped.
       ↑ For R-1 Basic (no firewall): PSO_max = 50% (NOT 60%).

ISA  = ISA% × TLA                                                   [Rule VIII Sec. 803, Table VIII.1]
       ↑ Direct percentage of TLA. NOT a fraction of TOSL.
       ↑ For R-1 Basic: ISA = 30% × TLA

USA  = USA% × TLA                                                   [Rule VIII Sec. 803, Table VIII.1]
       ↑ Direct percentage of TLA. NOT (1 − impervious_ratio) × TOSL.
       ↑ For R-1 Basic: USA = 20% × TLA

TOSL = ISA + USA                                                    [Rule VIII Sec. 803, Table VIII.1 note d]
       ↑ Or equivalently: TOSL = TLA − AMBF (in area)

MACA = AMBF + ISA                                                   [Rule VIII Sec. 803, Table VIII.1 note c]
       ↑ Sum of footprint area + paved open space.
       ↑ NOT an AMBF multiplier. NOT AMBF × (1 + x). That formula is fabricated.
```

### Table VIII.1 Reference Values (R-1 Basic, No Firewall)

| Metric   | Percentage of TLA | For 300 sqm lot |
|----------|-------------------|-----------------|
| PSO max  | 50%               | 150.0 sqm max footprint |
| ISA max  | 30%               | 90.0 sqm       |
| USA min  | 20%               | 60.0 sqm       |
| TOSL min | 50%               | 150.0 sqm       |

### Governing Identity (Must Always Hold)

```
AMBF + TOSL = TLA
AMBF + ISA + USA = TLA
PSO + TOSL = TLA (where PSO here is expressed as AMBF area, and TOSL = ISA + USA)
```

### TypeScript Interface Contract

```typescript
export interface LotInputs {
  lotWidth: number          // meters
  lotDepth: number          // meters
  occupancyGroup: string    // 'A' | 'B' | 'C' | 'D' | 'E'
  zoningClass: string       // 'R-1' | 'R-2' | 'C-1' | 'C-2' | 'MXD'
}

export interface SiteControlOutputs {
  tla: number               // Total Lot Area (sqm)
  ambf: number              // Allowable Maximum Building Footprint (sqm)
  buildableWidth: number    // meters
  buildableDepth: number    // meters
  pso: number               // Percentage of Site Occupancy — a RATIO (e.g., 0.495)
  tosl: number              // Total Open Space within Lot (sqm) — this is the AREA
  isa: number               // Impervious Surface Area (sqm) — ISA% × TLA
  usa: number               // Unpaved Surface Area (sqm) — USA% × TLA
  maca: number              // Maximum Allowable Construction Area (sqm) = AMBF + ISA
  setbacks: { front: number; rear: number; left: number; right: number }
  lotCoverageMax: number    // The PSO% limit from Table VIII.1 (e.g. 0.50)
  isaPercent: number        // ISA% from Table VIII.1 (e.g. 0.30)
  usaPercent: number        // USA% from Table VIII.1 (e.g. 0.20)
  compliance: {
    ambfOk: boolean         // true if AMBF ≤ TLA × lotCoverageMax
    toslOk: boolean         // true if TOSL ≥ TLA × (1 − lotCoverageMax)
    identityOk: boolean     // true if Math.abs(ambf + isa + usa - tla) < 0.01
    message: string
  }
}

export function useSiteControls(inputs: LotInputs): SiteControlOutputs
```

### Validation Guard

Before returning results, the engine must verify:
```typescript
const identityCheck = Math.abs(ambf + isa + usa - tla) < 0.01
if (!identityCheck) {
  console.error(`[useSiteControls] Identity violation: AMBF(${ambf}) + ISA(${isa}) + USA(${usa}) ≠ TLA(${tla})`)
}
```

IMPORTANT: Because AMBF may be setback-limited (less than PSO% × TLA), the "leftover" area (TLA − AMBF − ISA_table − USA_table) must be redistributed to keep the identity. The recommended approach: compute AMBF first, then compute TOSL = TLA − AMBF, then allocate ISA and USA within TOSL proportionally based on the table ratios. This ensures the identity always holds.

Example redistribution logic:
```typescript
const ambf = Math.min(buildableWidth * buildableDepth, lotCoverageMax * tla)
const tosl = tla - ambf
// ISA and USA are allocated within TOSL, respecting table ratios
const isaRatio = isaPercent / (isaPercent + usaPercent)  // e.g. 0.30 / 0.50 = 0.60
const usaRatio = usaPercent / (isaPercent + usaPercent)  // e.g. 0.20 / 0.50 = 0.40
const isa = tosl * isaRatio
const usa = tosl * usaRatio
// Now: ambf + isa + usa === tla (always)
```
</document>

<document index="2">
## Z-FIGHTING PREVENTION — Absolute Y-Axis Stratification

All horizontal planes MUST be positioned at exact Y-coordinates to prevent rendering artifacts. This is non-negotiable.

| Layer                  | Y-Position                          | Geometry Type      |
|------------------------|-------------------------------------|--------------------|
| Ground (SceneBase)     | y = -0.001                          | 80×80 planeGeometry |
| LotPlane (TLA)         | y = 0.000                           | lotWidth × lotDepth planeGeometry |
| SetbackZones           | y = 0.005                           | 4 separate planes (front/rear/left/right) |
| OpenSpaceZones (ISA)   | y = 0.010                           | Plane in front setback zone |
| OpenSpaceZones (USA)   | y = 0.010                           | Plane in rear setback zone |
| AMBFVolume (building)  | y = (buildingHeight / 2) + 0.015    | boxGeometry extruded |

All planes use `rotation={[-Math.PI / 2, 0, 0]}` and are positioned with the Y-coordinate above.

The 0.015 base offset on the AMBFVolume prevents the bottom face from Z-fighting with the LotPlane.
</document>

<document index="3">
## SCENE FOUNDATION — SceneBase + Lighting

### SceneBase.tsx (Applied to ALL 3D Lab modules)

```tsx
'use client'
import { ContactShadows } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

function SkySetup() {
  const { gl, scene } = useThree()
  useEffect(() => {
    gl.setClearColor(new THREE.Color('#EEF2FA'), 1)
    scene.fog = new THREE.Fog('#EEF2FA', 40, 80)
  }, [gl, scene])
  return null
}

export function SceneBase() {
  return (
    <group>
      <SkySetup />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#D4CFC4" roughness={0.92} metalness={0.0} />
      </mesh>
      <ContactShadows
        position={[0, 0.002, 0]}
        opacity={0.28}
        scale={20}
        blur={3.0}
        far={6}
        frames={1}
      />
    </group>
  )
}
```

### SlateCampLighting.tsx (Architectural Studio Rig)

```tsx
'use client'
import { Environment } from '@react-three/drei'

export function SlateCampLighting() {
  return (
    <>
      {/* Key light — warm directional from upper-right */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        color="#FFF5E6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      {/* Fill light — cool from opposite side */}
      <directionalLight
        position={[-3, 4, -3]}
        intensity={0.4}
        color="#E6EFFF"
      />
      {/* Ambient — enough to read shadow areas, not flatten */}
      <ambientLight intensity={0.35} color="#FFFFFF" />
      {/* Environment for metallic reflections only */}
      <Environment preset="city" background={false} />
    </>
  )
}
```
</document>

<document index="4">
## ARCHITECTURAL EDGE RENDERING — ArchMass Pattern

Every building volume in the 3D Lab uses this component instead of raw `<mesh>`. Clean dark edges on light matte forms = architectural physical model aesthetic.

```tsx
'use client'
import { Edges, Outlines } from '@react-three/drei'

interface ArchMassProps {
  position?: [number, number, number]
  args: [number, number, number]  // width, height, depth
  color?: string
  isActive?: boolean
  isViolating?: boolean
  opacity?: number
}

export function ArchMass({
  position = [0, 0, 0],
  args,
  color = '#EDEAE4',
  isActive = false,
  isViolating = false,
  opacity = 1.0,
}: ArchMassProps) {
  const meshColor = isViolating ? '#E63329' : isActive ? '#1B3FC4' : color

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={meshColor}
        roughness={isActive ? 0.4 : 0.85}
        metalness={0.0}
        transparent={opacity < 1.0}
        opacity={opacity}
        emissive={isViolating ? '#E63329' : '#000000'}
        emissiveIntensity={isViolating ? 0.2 : 0.0}
      />
      <Edges
        threshold={15}
        color="#3A3A3A"
        lineWidth={1.0}
        scale={1.002}
      />
      {isActive && (
        <Outlines thickness={0.02} color="#4A6FE8" screenspace={false} />
      )}
    </mesh>
  )
}
```
</document>

<document index="5">
## CANVAS CONFIGURATION & PERFORMANCE BUDGET

### Canvas Setup

```tsx
<Canvas
  frameloop="demand"                    // REQUIRED — render only on interaction
  shadows
  dpr={[1, 1.5]}                        // Mobile GPU-safe cap
  gl={{
    antialias: true,
    alpha: false,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.0,
    outputColorSpace: THREE.SRGBColorSpace,
  }}
>
```

### Camera Default (Isometric-Style Preset)

```tsx
<PerspectiveCamera
  makeDefault
  position={[8, 8, 8]}
  fov={35}
/>
<OrbitControls
  makeDefault
  target={[0, 1.5, 0]}
  enablePan={false}
  minDistance={3}
  maxDistance={25}
  minPolarAngle={0.2}
  maxPolarAngle={Math.PI / 2}
/>
```

### Invalidation Pattern (Demand Mode)

Every component that reads from the store MUST call `invalidate()` when its dependent values change:

```tsx
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { usePD1096Store } from '@/stores/usePD1096Store'

export function InvalidateOnChange() {
  const invalidate = useThree(s => s.invalidate)
  const lotWidth = usePD1096Store(s => s.lotWidth)
  const lotDepth = usePD1096Store(s => s.lotDepth)
  const buildingHeight = usePD1096Store(s => s.buildingHeight)
  const occupancyGroup = usePD1096Store(s => s.occupancyGroup)
  const zoningClass = usePD1096Store(s => s.zoningClass)
  const activeZone = usePD1096Store(s => s.activeZone)
  const showDimensions = usePD1096Store(s => s.showDimensions)

  useEffect(() => {
    invalidate()
  }, [lotWidth, lotDepth, buildingHeight, occupancyGroup, zoningClass, activeZone, showDimensions, invalidate])

  return null
}
```

### Performance Budget

| Item                      | Target          | Hard Fail       |
|---------------------------|-----------------|-----------------|
| External GLB loaded       | 0               | Any network 3D  |
| frameloop                 | `"demand"`      | `"always"`      |
| Max triangles             | ~2,000          | > 5,000         |
| Canvas DPR                | `[1, 1.5]`      | `[1, 2]`        |
| Dispose on unmount        | Required        | Memory leak     |
| No allocations in useFrame| Required        | GC jank         |
| FPS desktop               | 60fps           | < 30fps         |
| FPS mobile (mid-range)    | 30fps           | < 20fps         |

### Disposal Pattern

Every geometry component must dispose materials and geometry on unmount:

```tsx
useEffect(() => {
  return () => {
    geometry?.dispose()
    material?.dispose()
  }
}, [])
```
</document>

<document index="6">
## HOTSPOT SYSTEM

Maximum 6 hotspots visible simultaneously. Each hotspot is positioned ON the element it describes. Hotspot content includes the live computed value and the correct PD 1096 IRR citation.

| Zone     | Hotspot Content                                              | Correct Citation                        |
|----------|--------------------------------------------------------------|-----------------------------------------|
| TLA      | "Total Lot Area: {tla} sqm = {lotWidth}m × {lotDepth}m"     | Rule VIII, Sec. 803                     |
| AMBF     | "Building Footprint: {ambf} sqm (PSO: {pso×100}%)"          | Rule VIII, Sec. 803, Table VIII.1       |
| ISA      | "Paved Open Space: {isa} sqm ({isaPercent×100}% of TLA)"    | Rule VIII, Sec. 803, Table VIII.1       |
| USA      | "Unpaved Area: {usa} sqm ({usaPercent×100}% of TLA)"        | Rule VIII, Sec. 803, Table VIII.1       |
| Setbacks | "Front: {front}m · Sides: {left}m, {right}m · Rear: {rear}m"| Rule VII, Sec. 704 + Rule VIII, Sec. 804|
| MACA     | "Max Construction Area: {maca} sqm = AMBF + ISA"            | Rule VIII, Sec. 803, Table VIII.1 note c|

Color coding:
- Requirement (code rules): `#1B3FC4` (cobalt)
- Dimension (measurements): `#F5A623` (amber)
- Violation (active violation): `#E63329` (red)
- Info (general): `#6B7280` (gray)
</document>

<document index="7">
## CONTROLS PANEL & COMPLIANCE SCORECARD SPEC

### Controls Panel (2D, outside Canvas)

| Control                | Type     | Range     | Default | Store Action        |
|------------------------|----------|-----------|---------|---------------------|
| Lot Width              | Slider   | 6–50m     | 15m     | `setLotWidth`       |
| Lot Depth              | Slider   | 6–50m     | 20m     | `setLotDepth`       |
| Building Height        | Slider   | 3–30m     | 6m      | `setBuildingHeight`  |
| Occupancy Group        | Select   | A–E       | A       | `setOccupancyGroup` |
| Zoning Class           | Select   | R-1 to MXD| R-1     | `setZoningClass`    |
| Show Dimensions        | Toggle   | on/off    | off     | `toggleDimensions`  |

### Compliance Scorecard

Five items, each shows pass/fail with value and IRR citation:

1. AMBF compliance — Rule VIII Sec. 803
2. TOSL compliance — Rule VIII Sec. 803
3. TLA identity check — Rule VIII Sec. 803 (AMBF + ISA + USA = TLA)
4. Front setback — Rule VII Sec. 704
5. Side/Rear setbacks — Rule VII Sec. 704

All-pass state: "All requirements met ✓" (green)
Violation state: "{n}/5 requirements met" with red indicators on failures

### Layout

```
Desktop (≥768px):
┌──────────────────────────────────────────────────────┐
│  ← Site Development Controls        [Dims] [Reset]  │  48px header
├───────────────────────────┬──────────────────────────┤
│                           │  PARAMETERS              │
│   3D CANVAS (~65%)        │  [sliders + selectors]   │
│                           │  ─────────────────────   │
│                           │  RESULTS (live values)   │
│                           │  TLA · AMBF · PSO · TOSL │
│                           │  ISA · USA · MACA        │
│                           │  ─────────────────────   │
│                           │  COMPLIANCE SCORECARD    │
│                           │  [5 items pass/fail]     │
├───────────────────────────┴──────────────────────────┤

Mobile (<768px): Controls in draggable bottom sheet
```
</document>

</documents>

<context>

## What This Module Is

This is the flagship parametric sandbox for SlateCamp's 3D Lab. It is the most important 3D module in the platform because:

1. **ALE Exam Impact:** Development controls (AMBF, PSO, TOSL, setbacks) appear in nearly every Area C design problem and multiple Area A/B multiple-choice items. The #1 cause of Area C failure is wrong development control computation, not bad design.

2. **The Core Interaction:** A student drags sliders and watches the building footprint and open-space zones rearrange in real-time 3D. This is dual coding — every formula (verbal) is simultaneously represented as 3D geometry (visual-spatial).

3. **The "Aha" Moment:** The `min()` constraint on AMBF (lesser of setback-limited vs. zoning-capped) is the single concept most retakers got wrong. The module must explicitly demonstrate this through slider interaction — when the student widens the lot enough that setbacks no longer bind, the zoning cap takes over, and the building footprint stops growing.

4. **Visual Language:** The visual must mimic a physical architectural model — warm ground, cool sky, dark clean edges on matte surfaces. Not a game. Not a CAD wireframe. An architect's presentation model.

## What Has Gone Wrong Before

Previous iterations of this module contained the following critical errors (all now corrected in the formulas above):

- PSO was defined as `TLA − AMBF` (an area in sqm). It is actually `AMBF / TLA` (a dimensionless ratio/percentage).
- MACA was defined as `AMBF × (1 + allowable_additional_coverage)` — a completely fabricated formula with no basis in the IRR. The correct formula is `MACA = AMBF + ISA`.
- ISA was computed as `TOSL × impervious_ratio` — wrong. ISA is `ISA% × TLA` (direct percentage of TLA).
- USA was computed as `TOSL × (1 − impervious_ratio)` — wrong. USA is `USA% × TLA`.
- R-1 max lot coverage was coded as 60%. The correct value from Table VIII.1 is 50% for R-1 Basic (no firewall).
- Section citations were wrong throughout (805 instead of 803, 806 instead of 803, 808 instead of 803).

These errors would have taught students incorrect formulas for their licensure exam. The corrected formulas in <document index="1"> are authoritative.

## Performance Context

This module loads zero external 3D assets — all geometry is runtime BufferGeometry (boxes, planes, lines). The entire scene is under 2,000 triangles. With `frameloop="demand"`, the GPU is idle except during slider manipulation and orbit gestures. This means the module should run smoothly even on a Realme or Samsung Galaxy A-series phone.

</context>

<task_pipeline>

Execute the following steps strictly in order. Each step must be complete and correct before proceeding to the next.

### Step 1: Math Engine — `useSiteControls.ts`

Write the pure TypeScript calculation hook implementing ALL corrected formulas from <document index="1">. This file must:
- Accept `LotInputs` and return `SiteControlOutputs` (exact interfaces from document 1).
- Implement the R-1 Basic setback lookup (front: 4.5m, sides: 2.0m, rear: 2.0m).
- Implement the `min()` constraint on AMBF correctly.
- Compute ISA and USA as direct percentages of TLA (not fractions of TOSL).
- Compute PSO as `AMBF / TLA` (a ratio, not an area).
- Compute MACA as `AMBF + ISA` (not a multiplier).
- Include the redistribution logic to ensure `AMBF + ISA + USA = TLA` always holds (see document 1).
- Include the `identityOk` validation check with `Math.abs(ambf + isa + usa - tla) < 0.01`.
- Clamp `buildableWidth` and `buildableDepth` to `Math.max(0, ...)` to handle edge cases where lot is smaller than setbacks.
- Be a pure function — no React hooks, no Three.js, no side effects.

### Step 2: Zustand Store — `usePD1096Store.ts`

Write the Zustand store with `subscribeWithSelector` middleware. This file must:
- Hold all input parameters with defaults from <infrastructure>.
- Hold UI state (`activeZone`, `showDimensions`, `viewMode`).
- Provide setter actions for each input.
- NOT hold any computed outputs.
- Include a `reset()` action that restores all defaults.

### Step 3: Scene Foundation — `SceneBase.tsx` + `SlateCampLighting.tsx`

Implement the shared scene components exactly as specified in <document index="3">:
- `SkySetup` sets canvas clearColor to `#EEF2FA` and fog to `new THREE.Fog('#EEF2FA', 40, 80)`.
- Ground plane at y=-0.001, 80×80, `#D4CFC4`, roughness 0.92.
- `ContactShadows` at y=0.002, opacity 0.28, frames=1 (bake once).
- Lighting rig: key light warm `#FFF5E6` from [5,8,5], fill cool `#E6EFFF` from [-3,4,-3], ambient 0.35.

### Step 4: 3D Geometry Components

Build all geometry components. Each must:
- Read inputs from `usePD1096Store` using individual selectors (NOT destructuring the entire store).
- Call `useSiteControls()` with those inputs to get computed values.
- Apply strict Y-axis stratification from <document index="2">.
- Use `<Edges>` on all structural meshes (LotPlane, AMBFVolume).
- Handle the `activeZone` highlight state.

**LotPlane.tsx:**
- planeGeometry at y=0.000, sized lotWidth × lotDepth.
- Color `#D4CFC4`, roughness 0.92.
- `<Edges>` with color `#3A3A3A`, threshold 15.
- Dashed `<Line>` around the perimeter marking lot boundary.

**SetbackZones.tsx:**
- 4 transparent planes at y=0.005 representing front, rear, left, right setback strips.
- Color `#F5A623`, opacity 0.20.
- Each plane sized to the setback depth × relevant lot dimension.

**AMBFVolume.tsx:**
- boxGeometry centered at:
  - x = (setbacks.left - setbacks.right) / 2 (offset from center)
  - y = (buildingHeight / 2) + 0.015
  - z = (setbacks.rear - setbacks.front) / 2
- Width = buildableWidth (capped to AMBF constraint)
- Height = buildingHeight
- Depth = buildableDepth (capped to AMBF constraint)
- Color: `#1B3FC4` when compliant, `#E63329` when violating.
- `<Edges>` with color `#3A3A3A`, threshold 15, scale 1.002.
- `<Outlines>` when `activeZone === 'ambf'`.

**OpenSpaceZones.tsx:**
- Two planes at y=0.010:
  - ISA plane: color `#C4BAA5`, positioned in the front open area.
  - USA plane: color `#7B9E6A`, positioned in the rear open area.
- Both show their computed sqm area.

### Step 5: Invalidation + Dimension Lines

**InvalidateOnChange.tsx:**
- Subscribe to ALL store values that affect rendering.
- Call `invalidate()` in a `useEffect` whenever any value changes.

**DimensionLines.tsx:**
- Show dimension lines when `showDimensions` is true.
- Use drei `<Line>` and `<Text>` components.
- Show: lot width, lot depth, front setback, side setbacks, buildable width, buildable depth.

### Step 6: Canvas Root — `PD1096Canvas.tsx`

Assemble the complete canvas:
- `frameloop="demand"` (REQUIRED).
- `shadows` enabled.
- `dpr={[1, 1.5]}`.
- GL config: `antialias: true, toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace`.
- Wrapped in `<Suspense fallback={null}>`.
- Contains: SceneBase, SlateCampLighting, LotPlane, SetbackZones, AMBFVolume, OpenSpaceZones, DimensionLines, ZoneHotspots, InvalidateOnChange, OrbitControls.

### Step 7: 2D Controls — `SiteControlsControls.tsx` + `ComplianceScorecard.tsx`

Build the controls panel and scorecard as standard React/Tailwind components (outside Canvas):
- Sliders with live value display.
- Compliance scorecard with 5 items, pass/fail indicators, and correct IRR citations.
- Live computed values display (TLA, AMBF, PSO%, TOSL, ISA, USA, MACA).
- Reset button.

### Step 8: Module Root — `index.tsx`

Wire everything together:
- Desktop: Canvas left (~65%), controls sidebar right (~35%).
- 48px header with title "Site Development Controls" and badge "PD 1096 Rules VII & VIII".
- Mobile responsive: bottom sheet for controls.

</task_pipeline>

<split_step_verification>

Before writing any React component code, you must mathematically verify the following test case using the corrected formulas:

### 300 sqm R-1 Lot Validation

Input: lotWidth = 15m, lotDepth = 20m, occupancyGroup = 'A', zoningClass = 'R-1'

Step-by-step computation:
1. TLA = 15 × 20 = 300 sqm
2. Setbacks (R-1 Basic): front = 4.5m, sides = 2.0m each, rear = 2.0m
3. buildableWidth = 15 − 2.0 − 2.0 = 11.0m
4. buildableDepth = 20 − 4.5 − 2.0 = 13.5m
5. Setback-limited footprint = 11.0 × 13.5 = 148.5 sqm
6. Zoning-capped footprint = 300 × 0.50 = 150.0 sqm
7. AMBF = min(148.5, 150.0) = 148.5 sqm ← setback-limited
8. PSO = 148.5 / 300 = 0.495 (49.5%) ← a ratio, NOT an area
9. TOSL = 300 − 148.5 = 151.5 sqm
10. ISA = 151.5 × (0.30 / 0.50) = 90.9 sqm (redistributed within TOSL)
11. USA = 151.5 × (0.20 / 0.50) = 60.6 sqm (redistributed within TOSL)
12. Identity check: 148.5 + 90.9 + 60.6 = 300.0 ✓
13. MACA = 148.5 + 90.9 = 239.4 sqm
14. Compliance: AMBF (148.5) ≤ max (150.0) ✓ | TOSL (151.5) ≥ min (150.0) ✓

All 5 scorecard items should show GREEN for this default configuration.

### Edge Case: Tiny Lot (6m × 6m)

1. TLA = 36 sqm
2. buildableWidth = 6 − 2 − 2 = 2.0m
3. buildableDepth = 6 − 4.5 − 2.0 = −0.5m → clamped to 0.0m
4. AMBF = min(0, 18) = 0 sqm
5. Building cannot be placed → all open space

Verify your code handles this gracefully (no NaN, no negative dimensions, AMBF = 0).

### Edge Case: Wide Lot (50m × 50m)

1. TLA = 2500 sqm
2. buildableWidth = 50 − 2 − 2 = 46.0m
3. buildableDepth = 50 − 4.5 − 2.0 = 43.5m
4. Setback-limited = 46 × 43.5 = 2001 sqm
5. Zoning-capped = 2500 × 0.50 = 1250 sqm
6. AMBF = min(2001, 1250) = 1250 sqm ← zoning-capped (not setback-limited!)

This is the "aha" moment — on wide lots, the zoning cap binds, not setbacks.

You must show the computation results for all three test cases inline before proceeding to code.

</split_step_verification>

<output_format>

Output the complete, production-ready TypeScript/TSX code. Structure the output as follows:

1. **For each file:** Use a markdown H3 header with the exact filename and path (e.g., `### src/hooks/useSiteControls.ts`).
2. **Complete code:** Every file must be complete — no `// ... rest of component` truncation. Copy-paste-ready.
3. **'use client' directive:** Every file that uses React hooks or R3F must start with `'use client'`.
4. **TypeScript strict:** No `any` types. Explicit return types on all exported functions. Proper interface definitions.
5. **Import paths:** Use `@/` alias for `src/` directory (Next.js convention).
6. **drei imports:** Explicitly import every drei component used (`Edges`, `Outlines`, `Html`, `Line`, `Text`, `OrbitControls`, `Environment`, `ContactShadows`, `PerspectiveCamera`).
7. **Three.js imports:** Import THREE namespace where needed (`import * as THREE from 'three'`).
8. **Comments:** Include brief comments explaining WHY, not WHAT — especially on the math engine and Y-axis offsets.

File delivery order:
1. `src/hooks/useSiteControls.ts`
2. `src/stores/usePD1096Store.ts`
3. `src/components/3d-lab/modules/SiteControls/SceneBase.tsx`
4. `src/components/3d-lab/modules/SiteControls/SlateCampLighting.tsx`
5. `src/components/3d-lab/modules/SiteControls/LotPlane.tsx`
6. `src/components/3d-lab/modules/SiteControls/SetbackZones.tsx`
7. `src/components/3d-lab/modules/SiteControls/AMBFVolume.tsx`
8. `src/components/3d-lab/modules/SiteControls/OpenSpaceZones.tsx`
9. `src/components/3d-lab/modules/SiteControls/InvalidateOnChange.tsx`
10. `src/components/3d-lab/modules/SiteControls/DimensionLines.tsx`
11. `src/components/3d-lab/modules/SiteControls/ZoneHotspots.tsx`
12. `src/components/3d-lab/modules/SiteControls/PD1096Canvas.tsx`
13. `src/components/3d-lab/modules/SiteControls/SiteControlsControls.tsx`
14. `src/components/3d-lab/modules/SiteControls/ComplianceScorecard.tsx`
15. `src/components/3d-lab/modules/SiteControls/index.tsx`

</output_format>

[TRAILING NEGATIVE CONSTRAINTS]

CRITICAL RESTRICTIONS — VIOLATION OF ANY OF THESE IS A SHIP-BLOCKING ERROR:

### Formula Errors (Will Teach Students Wrong Exam Content)
* DO NOT define PSO as `TLA − AMBF`. PSO is `AMBF / TLA` — a dimensionless ratio. TOSL is the area.
* DO NOT define MACA as `AMBF × (1 + x)` or any multiplier. MACA = AMBF + ISA. Period.
* DO NOT compute ISA as `TOSL × ratio`. ISA = ISA% × TLA (direct percentage of TLA).
* DO NOT compute USA as `TOSL × (1 − ratio)`. USA = USA% × TLA.
* DO NOT use 60% as R-1 max lot coverage. The correct value from Table VIII.1 is 50%.
* DO NOT cite Section 805 for TLA, Section 804 for PSO, Section 806 for TOSL/ISA/USA, or Section 808 for MACA. ALL of these belong to Section 803.
* DO NOT label the `pso` variable as "sqm of open space" — PSO is a percentage.

### Rendering Errors (Will Cause Visual Artifacts)
* DO NOT allow Z-fighting. Strictly adhere to the Y-axis stratification in <document index="2">.
* DO NOT omit `<Edges>` from LotPlane or AMBFVolume — edges are the single most important visual technique.
* DO NOT use the default canvas background. Set clearColor to `#EEF2FA` explicitly.
* DO NOT omit the ground plane mesh. The ground is never a default — it is always an explicit geometry.

### Performance Errors (Will Break on Mobile)
* DO NOT use `frameloop="always"` on the Canvas. You MUST use `"demand"` and call `invalidate()` when store values change.
* DO NOT allocate objects (`new Vector3()`, `new Color()`) inside `useFrame` — pre-allocate outside.
* DO NOT call `setState` or `set` inside `useFrame`.
* DO NOT forget to call `invalidate()` — without it, slider changes won't render in demand mode.
* DO NOT forget to dispose geometry and materials on unmount.

### Architecture Errors (Will Cause Re-render Cascades)
* DO NOT store computed outputs in Zustand. Computed values come from `useSiteControls()`.
* DO NOT destructure the entire store with `usePD1096Store()` — always use individual selectors: `usePD1096Store(s => s.lotWidth)`.
* DO NOT server-render R3F components. All Canvas components must be `'use client'`.
* DO NOT truncate code with `// ... rest of implementation`. Every file must be complete.

### Educational Errors (Will Confuse Students)
* DO NOT show more than 6 hotspots simultaneously — cognitive overload.
* DO NOT use gamification debris (badges, confetti, XP) — only the intrinsic satisfaction of a green scorecard.
* DO NOT omit the IRR citation from hotspot content — students need to know WHERE in the code each constraint lives.
```

---

## Prompt Engineering Notes (For Your Reference — Not Part of the Prompt)

### What Changed From Your v1 Prompt

1. **Added 7 documents instead of 2.** The original prompt had a math document and a Z-fighting document. This version adds: SceneBase/Lighting code, ArchMass edge rendering pattern, Canvas/Performance configuration, Hotspot system spec, and Controls/Scorecard spec. This eliminates ambiguity — the AI doesn't have to invent any patterns.

2. **Expanded the math engine with redistribution logic.** The original said "ISA = TLA × 0.30" but didn't explain what happens when AMBF is setback-limited (148.5, not 150) — the remaining 1.5 sqm needs redistribution or the identity breaks. The new version includes explicit redistribution code.

3. **Added 3 validation test cases instead of 1.** The original only tested the happy path (300 sqm lot). Now includes edge cases: tiny lot (negative buildable depth) and wide lot (zoning cap binds instead of setbacks — the critical "aha" moment).

4. **Expanded negative constraints from 5 to 20.** Organized into four categories: Formula, Rendering, Performance, Architecture. Each constraint is specific enough that a code reviewer can grep for violations.

5. **Added the `<context>` section explaining what went wrong before.** This is the most effective prompting technique for preventing regression — telling the AI exactly which errors occurred in previous iterations and why they're wrong.

6. **Added the TypeScript interface with commentary.** The `pso: number // a RATIO, not sqm` inline comments prevent the most common confusion. The `lotCoverageMax`, `isaPercent`, `usaPercent` fields expose the table lookup values so the UI can display them.

7. **Added the `InvalidateOnChange` component pattern.** The original said "call invalidate() when store values change" but didn't show the pattern. Now it's an explicit component with all subscriptions listed.

8. **Added file delivery order.** Forces the AI to write the math engine first (verifiable independently), then the store, then scene foundation, then geometry — the natural dependency order.

9. **Added the Layout spec with ASCII wireframe.** The original didn't specify the desktop/mobile layout. Now includes the exact split (65/35), header height (48px), and mobile bottom sheet requirement.

10. **Expanded the `<split_step_verification>` to require showing work.** The AI must print the computation results for all three test cases before writing code. This catches formula errors before they propagate into 15 files.
