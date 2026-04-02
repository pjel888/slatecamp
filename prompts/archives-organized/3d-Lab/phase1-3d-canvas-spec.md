# Phase 1 Calculator Suite — 3D Canvas Implementation Specification

**Document type:** Technical implementation spec — R3F component architecture, geometry, materials, Zustand subscriptions, performance contracts  
**Date:** April 2026  
**Status:** Build-ready  
**Prerequisite reading:** `3d-calculator-suite-final.md` (formulas + scope), `formulas.md` (formula audit trail)

---

## 1. Governing Rendering Constraints

All three Phase 1 calculators share a single rendering contract extracted from the product spec. Every component in this document must satisfy every rule below or it does not ship.

| Rule | Constraint | Enforcement |
|---|---|---|
| Geometry scope | Only render geometry that directly drives the formula | Code review gate |
| Real-time feedback | Every input change updates 3D + material count simultaneously | Zustand → `invalidate()` pipeline |
| Progressive detail | Default view clean; toggles reveal layers (framing, cross-section) | Zustand `viewMode` enum |
| Mobile-first perf | 30fps target, <50 draw calls | `frameloop="demand"`, `invalidate()` on input change only |
| No text in canvas | All labels, counts, dimensions rendered as DOM overlays | drei `<Html>` or external DOM panel |
| Interaction | Tap to select surfaces, drag to position openings, pinch to zoom, orbit to rotate | drei `<OrbitControls>`, R3F pointer events |
| No over-engineering | No advanced lighting, PBR textures, physics, or realism beyond geometric accuracy | Flat materials only (`MeshBasicMaterial` / `MeshStandardMaterial` with `flat` Canvas) |

### Canvas Configuration (Shared)

```tsx
<Canvas
  frameloop="demand"
  flat
  orthographic
  camera={{ position: [5, 5, 5], zoom: 80, near: 0.1, far: 100 }}
  gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
  dpr={[1, 1.5]}
  style={{ background: '#F2F0EB' }}
  onCreated={(state) => {
    state.gl.setClearColor('#F2F0EB')
  }}
>
```

**Rationale:**

- `frameloop="demand"` — scene is static until user changes an input; renders only on `invalidate()`.
- `flat` — disables tone mapping; calculators are diagrams, not arch-viz.
- `orthographic` — eliminates perspective distortion; material estimation requires accurate proportional representation.
- `dpr={[1, 1.5]}` — capped at 1.5× to protect mobile GPU; no visual benefit above this for flat-shaded geometry.

---

## 2. Shared R3F Component Tree

All three tools share a common Canvas shell. Tool-specific scene content is injected as children.

```
<CalculatorCanvasShell>              // 'use client' wrapper
├── <Canvas>                         // Shared config above
│   ├── <ambientLight />             // intensity={0.6}
│   ├── <directionalLight />         // position={[5, 8, 3]}, intensity={0.8}, no shadows
│   ├── <CalculatorOrbitControls />   // drei OrbitControls with constrained polar angle
│   ├── <Suspense fallback={null}>
│   │   └── <ToolSpecificScene />    // FlooringScene | PaintScene | DrywallScene
│   └── </Suspense>
│   └── <SceneInvalidator />         // Subscribes to Zustand, calls invalidate()
└── </Canvas>
```

### Shared Component Interfaces

```ts
/** Props accepted by every tool-specific scene component */
interface BaseSceneProps {
  /** Triggers invalidate() upstream — passed from SceneInvalidator */
  onSceneReady?: () => void
}

/** Shared orbit controls config */
interface CalculatorOrbitControlsProps {
  enablePan: boolean          // true — user can pan
  enableZoom: boolean         // true — pinch-to-zoom
  enableRotate: boolean       // true — orbit
  minPolarAngle: number       // Math.PI * 0.1 — prevent flipping under floor
  maxPolarAngle: number       // Math.PI * 0.45 — prevent looking straight down (keeps 3D depth)
  minZoom: number             // 30
  maxZoom: number             // 200
  enableDamping: boolean      // true
  dampingFactor: number       // 0.1
  makeDefault: boolean        // true
}
```

### SceneInvalidator Component

This component is the sole bridge between Zustand state and R3F rendering. It subscribes to the tool's Zustand store and calls `invalidate()` whenever any input changes.

```tsx
'use client'

import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

/**
 * Subscribes to a Zustand store's version counter.
 * When any calculator input changes, the store increments `inputVersion`.
 * This component detects that change and calls invalidate() exactly once.
 *
 * This is the ONLY place invalidate() is called in response to user input.
 */
function SceneInvalidator({ useStore }: { useStore: () => { inputVersion: number } }) {
  const invalidate = useThree((s) => s.invalidate)
  const inputVersion = useStore((s) => s.inputVersion)

  useEffect(() => {
    invalidate()
  }, [inputVersion, invalidate])

  return null
}
```

### Lighting (Shared — Minimal)

No shadows. Two lights only. The goal is uniform readability, not realism.

```tsx
function CalculatorLighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 3]} intensity={0.8} />
    </>
  )
}
```

**Draw call cost:** 0 (lights do not generate draw calls).

---

## 3. Zustand Store Architecture

Each calculator has its own Zustand store. All stores share a common pattern: input slice, computed slice, UI slice, and a version counter for invalidation.

### Store Pattern (Shared)

```ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface BaseCalculatorStore {
  /** Incremented on every input mutation. SceneInvalidator watches this. */
  inputVersion: number

  /** UI state — does not trigger 3D re-render */
  viewMode: 'default' | 'deductions' | 'waste'
  resultMode: 'net' | 'buy'
  hoveredSurface: string | null
}
```

**Critical performance rule:** Zustand selectors must be granular. A 3D mesh component subscribes only to the specific values it needs (e.g., `roomLengthMm`, `roomWidthMm`), never the entire store. This prevents React reconciliation cascades across the scene graph.

```tsx
// ✅ CORRECT — granular selector, re-renders only when this value changes
const roomLength = useFlooringStore((s) => s.roomLengthMm)

// ❌ WRONG — subscribes to entire store, re-renders on ANY change
const store = useFlooringStore()
```

### 3.1 Flooring Store

```ts
interface FlooringInputs {
  roomMode: 'rectangle' | 'polygon-simple'
  roomLengthMm: number
  roomWidthMm: number
  floorPolygonPoints: [number, number][]
  exclusions: Array<{
    id: string
    xMm: number
    yMm: number
    widthMm: number
    heightMm: number
  }>
  tileLengthMm: number
  tileWidthMm: number
  groutJointMm: number
  pattern: 'straight' | 'brick' | 'diagonal' | 'herringbone-lite'
  wastePercent: number
  boxCoverageSqm: number | null
  orientationDeg: number
  includeSparePercent: number
}

interface FlooringComputed {
  grossAreaSqm: number
  exclusionAreaSqm: number
  netAreaSqm: number
  effectiveModuleAreaSqm: number
  rawTileCount: number
  adjustedTileCount: number
  roundedTileCount: number
  boxesToBuy: number | null
  cutTileCountApprox: number
  /** Grid layout data consumed by the 3D scene */
  tileGrid: TileGridCell[]
}

interface TileGridCell {
  /** Column index */
  col: number
  /** Row index */
  row: number
  /** World-space X position (meters) */
  x: number
  /** World-space Z position (meters) */
  z: number
  /** Width in meters (tile + grout) */
  w: number
  /** Depth in meters (tile + grout) */
  d: number
  /** Whether this tile is cut at an edge or exclusion */
  isCut: boolean
  /** Whether this tile is inside an exclusion (should not render) */
  isExcluded: boolean
  /** Offset for brick pattern (meters) */
  offsetX: number
}

interface FlooringStore extends BaseCalculatorStore, FlooringInputs {
  computed: FlooringComputed
  setInput: <K extends keyof FlooringInputs>(key: K, value: FlooringInputs[K]) => void
  addExclusion: (exclusion: FlooringInputs['exclusions'][number]) => void
  removeExclusion: (id: string) => void
  recompute: () => void
}
```

**Subscription map (which 3D component reads what):**

| 3D Component | Subscribed selectors | Re-render trigger |
|---|---|---|
| `<FloorPlane>` | `roomLengthMm`, `roomWidthMm` | Room dimensions change |
| `<ExclusionZones>` | `exclusions` | Exclusion added/removed/moved |
| `<TileGrid>` | `computed.tileGrid` | Any input that affects grid layout |
| `<PatternArrow>` | `orientationDeg`, `pattern` | Pattern or orientation change |

### 3.2 Paint Store

```ts
interface PaintInputs {
  inputMode: 'room' | 'wall-by-wall'
  roomLengthMm: number
  roomWidthMm: number
  wallHeightMm: number
  wallSegments: Array<{
    id: string
    lengthMm: number
    heightMm: number
  }>
  openings: Array<{
    id: string
    type: 'door' | 'window'
    widthMm: number
    heightMm: number
    /** Wall index or ID this opening belongs to */
    wallId: string
    /** Horizontal offset from wall start (mm) */
    xOffsetMm: number
    /** Vertical offset from floor (mm) */
    yOffsetMm: number
  }>
  includeCeiling: boolean
  ceilingAreaOverrideSqm: number | null
  substrateType: 'new-concrete' | 'repaint' | 'exterior'
  coatsTopcoat: number
  coatsPrimer: number
  topcoatCoverageSqmPerLiter: number
  primerCoverageSqmPerLiter: number
  wastePercent: number
  canSizesAvailable: number[]
  selectedColorHex: string
}

interface PaintComputed {
  grossWallAreaSqm: number
  openingAreaSqm: number
  netWallAreaSqm: number
  ceilingAreaSqm: number
  basePaintableAreaSqm: number
  topcoatCoats: number
  primerCoats: number
  adjustedTopcoatAreaSqm: number
  topcoatLiters: number
  primerLiters: number | null
  topcoatCanSuggestion: Array<{ sizeLiters: number; quantity: number }>
  primerCanSuggestion: Array<{ sizeLiters: number; quantity: number }> | null
  /** Per-wall breakdown for hover highlighting */
  wallAreas: Array<{
    wallId: string
    grossSqm: number
    openingsSqm: number
    netSqm: number
  }>
}

interface PaintStore extends BaseCalculatorStore, PaintInputs {
  computed: PaintComputed
  setInput: <K extends keyof PaintInputs>(key: K, value: PaintInputs[K]) => void
  addOpening: (opening: PaintInputs['openings'][number]) => void
  removeOpening: (id: string) => void
  recompute: () => void
}
```

**Subscription map:**

| 3D Component | Subscribed selectors | Re-render trigger |
|---|---|---|
| `<RoomShell>` | `roomLengthMm`, `roomWidthMm`, `wallHeightMm`, `inputMode` | Room dimensions change |
| `<WallSurface>` (×4) | `selectedColorHex`, `hoveredSurface` | Color or hover change |
| `<OpeningCutouts>` | `openings` | Opening added/removed/repositioned |
| `<CeilingSurface>` | `includeCeiling`, `roomLengthMm`, `roomWidthMm` | Ceiling toggle or dims change |

### 3.3 Drywall Store

```ts
interface DrywallInputs {
  wallLengthMm: number
  wallHeightMm: number
  openings: Array<{
    id: string
    type: 'door' | 'window' | 'pass-through'
    widthMm: number
    heightMm: number
    xOffsetMm: number
    yOffsetMm: number
  }>
  studSpacingMm: number
  boardLengthMm: number
  boardWidthMm: number
  boardLayersPerSide: number
  sidesBoarded: 'one-side' | 'two-side'
  boardOrientation: 'vertical' | 'horizontal'
  wastePercent: number
  includeCornerStudAllowance: boolean
  cornerStudExtraCount: number
  includeOpeningFramingAllowance: boolean
  extraStudsPerOpening: number
  trackStockLengthMm: number
}

interface DrywallComputed {
  grossWallAreaSqm: number
  openingAreaSqm: number
  netWallAreaSqm: number
  boardedFaceCount: number
  boardLayersPerSide: number
  totalBoardedAreaSqm: number
  boardAreaSqm: number
  rawBoardCount: number
  adjustedBoardCount: number
  roundedBoardCount: number
  baseStudCount: number
  cornerAllowanceCount: number
  openingExtraStudCount: number
  finalStudCount: number
  topTrackLengthMm: number
  bottomTrackLengthMm: number
  totalTrackLengthMm: number
  headerTrackLengthMm: number
  trackPiecesToBuy: number
  /** Pre-computed stud X positions for 3D rendering (meters) */
  studPositionsM: number[]
  /** Pre-computed board placement rects for 3D rendering */
  boardPlacements: Array<{
    id: string
    xM: number
    yM: number
    wM: number
    hM: number
    face: 'front' | 'back'
    isCut: boolean
  }>
}

interface DrywallStore extends BaseCalculatorStore, DrywallInputs {
  computed: DrywallComputed
  /** 'frame' shows studs+tracks only; 'boarded' overlays panels */
  drywallViewMode: 'frame' | 'boarded'
  setInput: <K extends keyof DrywallInputs>(key: K, value: DrywallInputs[K]) => void
  addOpening: (opening: DrywallInputs['openings'][number]) => void
  removeOpening: (id: string) => void
  toggleDrywallView: () => void
  recompute: () => void
}
```

**Subscription map:**

| 3D Component | Subscribed selectors | Re-render trigger |
|---|---|---|
| `<StudArray>` | `computed.studPositionsM`, `wallHeightMm` | Spacing or length change |
| `<TrackBars>` | `wallLengthMm`, `openings` (for bottom track door deduction) | Length or openings change |
| `<OpeningVoids>` | `openings` | Openings change |
| `<BoardPanels>` | `computed.boardPlacements`, `drywallViewMode` | Board layout or view toggle |
| `<OpeningFraming>` | `openings`, `includeOpeningFramingAllowance` | Openings or framing toggle |

---

## 4. Material Palette (Shared)

All three tools draw from one flat-color material palette. Materials are cached once and reused across components via a shared module. No textures. No PBR maps.

```ts
// lib/calculator-materials.ts

import * as THREE from 'three'

/** Cached materials — created once, never disposed during app lifecycle */
export const CALC_MATERIALS = {
  // --- Flooring ---
  floorBase: new THREE.MeshBasicMaterial({ color: '#E8E4DE', side: THREE.DoubleSide }),
  tileFull: new THREE.MeshStandardMaterial({ color: '#D4C9B8', roughness: 0.9, metalness: 0 }),
  tileCut: new THREE.MeshStandardMaterial({ color: '#E8A87C', roughness: 0.9, metalness: 0 }),
  tileExcluded: new THREE.MeshBasicMaterial({ color: '#3A3A3A', transparent: true, opacity: 0.3 }),
  groutGap: new THREE.MeshBasicMaterial({ color: '#9E9E9E' }),
  exclusionZone: new THREE.MeshBasicMaterial({ color: '#2C2C2C', transparent: true, opacity: 0.6 }),

  // --- Paint ---
  wallPaintable: new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.95, metalness: 0 }),
  wallPaintableHover: new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.95, metalness: 0, emissive: '#444444' }),
  openingVoid: new THREE.MeshBasicMaterial({ color: '#1A1A1A', transparent: true, opacity: 0.4 }),
  ceilingSurface: new THREE.MeshStandardMaterial({ color: '#F5F5F5', roughness: 0.95, metalness: 0 }),

  // --- Drywall ---
  studMetal: new THREE.MeshStandardMaterial({ color: '#A8A8A8', roughness: 0.6, metalness: 0.3 }),
  trackMetal: new THREE.MeshStandardMaterial({ color: '#909090', roughness: 0.6, metalness: 0.3 }),
  boardFront: new THREE.MeshStandardMaterial({ color: '#F0EDE6', roughness: 0.95, metalness: 0 }),
  boardBack: new THREE.MeshStandardMaterial({ color: '#E6E2DA', roughness: 0.95, metalness: 0 }),
  boardCut: new THREE.MeshStandardMaterial({ color: '#E8A87C', roughness: 0.95, metalness: 0 }),
  headerTrack: new THREE.MeshStandardMaterial({ color: '#7A7A7A', roughness: 0.6, metalness: 0.3 }),

  // --- Shared ---
  edgeLines: new THREE.LineBasicMaterial({ color: '#333333', linewidth: 1 }),
  selectionHighlight: new THREE.MeshBasicMaterial({ color: '#FFD700', transparent: true, opacity: 0.25 }),
} as const

/**
 * Update the paintable wall color at runtime.
 * Mutates the existing material — does NOT create a new one.
 * Call invalidate() after calling this.
 */
export function setPaintableWallColor(hex: string): void {
  CALC_MATERIALS.wallPaintable.color.set(hex)
  CALC_MATERIALS.wallPaintableHover.color.set(hex)
}
```

**Draw call accounting:** Each unique material/geometry pair = 1 draw call. By reusing cached materials, instanced geometry, and merging where possible, the budget stays within 50.

---

## 5. Tool 1 — Flooring / Tile Layout Visualizer: 3D Scene

### 5.1 Required Visual Elements (from spec)

- Floor plane at room dimensions
- Exclusion zones as dark cutouts
- Individual tiles at correct proportions with grout gaps
- Cut tiles along edges highlighted in contrasting color
- Pattern orientation arrow

**Explicitly excluded:** grout thickness in 3D, adhesive layer, edge trims, wall tiles.

### 5.2 Component Tree

```
<FlooringScene>
├── <FloorPlane />                  // Room footprint — thin BoxGeometry
├── <ExclusionZones />              // Group of dark cutout boxes
│   └── <ExclusionBox /> (×N)       // Per exclusion
├── <TileGridInstanced />           // InstancedMesh — all full tiles in one draw call
├── <CutTileGridInstanced />        // InstancedMesh — all cut tiles in one draw call (different material)
├── <PatternOrientationArrow />     // Simple line arrow on floor
└── <FlooringDOMOverlays />         // drei <Html> for dimension labels (outside canvas preferred)
```

### 5.3 Geometry Specification

| Component | Three.js Geometry | Dimensions | Material |
|---|---|---|---|
| `FloorPlane` | `BoxGeometry` | `(roomLengthM, 0.005, roomWidthM)` | `floorBase` |
| `ExclusionBox` | `BoxGeometry` | `(exclWidthM, 0.02, exclHeightM)` | `exclusionZone` |
| `TileGridInstanced` | `InstancedMesh` + `PlaneGeometry` | Per-tile: `(tileWidthM, tileLengthM)` | `tileFull` |
| `CutTileGridInstanced` | `InstancedMesh` + `PlaneGeometry` | Per-cut-tile: `(tileWidthM, tileLengthM)` | `tileCut` |
| `PatternOrientationArrow` | drei `<Line>` | 3-point arrow polyline | `edgeLines` |

### 5.4 Component Props & Rendering Logic

```ts
interface FloorPlaneProps {
  lengthM: number   // roomLengthMm / 1000
  widthM: number    // roomWidthMm / 1000
}
// Renders: <mesh position={[lengthM/2, 0, widthM/2]}>
//            <boxGeometry args={[lengthM, 0.005, widthM]} />
//          </mesh>

interface ExclusionZonesProps {
  exclusions: FlooringInputs['exclusions']
}
// For each exclusion: position at (xMm/1000, 0.01, yMm/1000),
// BoxGeometry sized to (widthMm/1000, 0.02, heightMm/1000).
// Rendered slightly above floor plane (Y=0.01) to prevent z-fighting.

interface TileGridInstancedProps {
  cells: TileGridCell[]       // from computed.tileGrid, filtered to !isCut && !isExcluded
  tileWidthM: number
  tileLengthM: number
}
// Implementation:
// - Single InstancedMesh with PlaneGeometry(tileWidthM, tileLengthM)
// - Rotated to lie flat: rotation.x = -Math.PI / 2
// - For each cell: set instance matrix via dummy Object3D
//   dummy.position.set(cell.x + cell.offsetX, 0.006, cell.z)
//   dummy.updateMatrix()
//   instancedMesh.setMatrixAt(index, dummy.matrix)
// - instancedMesh.instanceMatrix.needsUpdate = true
// - Max instance count: pre-allocate to (maxRoomArea / minTileArea) or 10,000

interface CutTileGridInstancedProps {
  cells: TileGridCell[]       // from computed.tileGrid, filtered to isCut && !isExcluded
  tileWidthM: number
  tileLengthM: number
}
// Same implementation as TileGridInstanced but uses tileCut material.
// Cut tiles are rendered at the SAME geometry size as full tiles for MVP.
// The visual distinction is the contrasting material color only.
// True cut-shape clipping is out of scope for V1.

interface PatternOrientationArrowProps {
  pattern: FlooringInputs['pattern']
  orientationDeg: number
  roomCenterX: number
  roomCenterZ: number
}
// Renders a drei <Line> as a simple arrow:
// - Shaft: from room center, length 0.3m, rotated by orientationDeg
// - Head: two short lines at 30° from shaft end
// - Y position: 0.015 (above tiles)
```

### 5.5 Draw Call Budget

| Element | Draw calls | Notes |
|---|---|---|
| Floor plane | 1 | Single mesh |
| Exclusion zones (up to 5) | 5 | One mesh each (low count, no instancing needed) |
| Full tile instances | 1 | Single InstancedMesh |
| Cut tile instances | 1 | Single InstancedMesh |
| Pattern arrow | 1 | Single Line |
| Ambient light | 0 | — |
| Directional light | 0 | — |
| **Total** | **9** | Well within 50 budget |

### 5.6 Pattern Layout Logic (CPU-side, feeds tileGrid)

The Zustand `recompute()` method generates `tileGrid` on input change. The 3D scene does not compute layout — it only reads the pre-computed grid.

```ts
/**
 * Generates tile grid cells for the 3D scene.
 * Called inside Zustand recompute(), NOT inside a React component or useFrame.
 */
function generateTileGrid(inputs: FlooringInputs): TileGridCell[] {
  const roomLM = inputs.roomLengthMm / 1000
  const roomWM = inputs.roomWidthMm / 1000
  const moduleW = (inputs.tileLengthMm + inputs.groutJointMm) / 1000
  const moduleD = (inputs.tileWidthMm + inputs.groutJointMm) / 1000

  const cols = Math.ceil(roomLM / moduleW)
  const rows = Math.ceil(roomWM / moduleD)
  const cells: TileGridCell[] = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const baseX = c * moduleW
      const baseZ = r * moduleD

      // Brick pattern offset: every other row shifts by half tile width
      let offsetX = 0
      if (inputs.pattern === 'brick' && r % 2 === 1) {
        offsetX = moduleW / 2
      }

      const x = baseX + offsetX
      const z = baseZ

      // Determine if tile extends beyond room boundary → cut tile
      const isCut =
        (x + moduleW > roomLM) ||
        (z + moduleD > roomWM) ||
        (inputs.pattern === 'brick' && offsetX > 0 && x < 0)

      // Determine if tile overlaps any exclusion → excluded
      const isExcluded = inputs.exclusions.some((ex) => {
        const exX = ex.xMm / 1000
        const exZ = ex.yMm / 1000
        const exW = ex.widthMm / 1000
        const exH = ex.heightMm / 1000
        // AABB overlap test
        return (
          x + moduleW > exX &&
          x < exX + exW &&
          z + moduleD > exZ &&
          z < exZ + exH
        )
      })

      cells.push({ col: c, row: r, x, z, w: moduleW, d: moduleD, isCut, isExcluded, offsetX })
    }
  }

  return cells
}
```

**Diagonal and herringbone patterns:** For V1 MVP, `diagonal` and `herringbone-lite` use the same straight/brick grid engine but apply a 45° rotation offset to `orientationDeg` and increase waste percent. True angled tile clipping geometry is out of scope. The pattern arrow rotates to indicate the orientation; the tiles themselves remain axis-aligned in the preview. This is a deliberate accuracy trade-off documented in the assumptions accordion.

---

## 6. Tool 2 — Paint Visualizer with Room Preview: 3D Scene

### 6.1 Required Visual Elements (from spec)

- Room shell (4 walls + optional ceiling)
- Door/window cutouts as dark rectangles
- Color-coded surfaces: paintable wall (user-selected color), excluded opening (gray), ceiling (lighter shade)
- Cross-section toggle showing coating layers with labeled thickness
- Real-time surface highlighting when user hovers result rows

**Explicitly excluded:** roller-stroke simulation, texture absorption, lighting-based finish realism, exterior facades.

### 6.2 Component Tree

```
<PaintScene>
├── <RoomShell>                        // Group — walls + ceiling
│   ├── <WallSurface wallId="north" /> // PlaneGeometry, vertical
│   ├── <WallSurface wallId="east" />
│   ├── <WallSurface wallId="south" />
│   ├── <WallSurface wallId="west" />
│   └── <CeilingSurface />             // Conditional — PlaneGeometry, horizontal
├── <OpeningCutouts>                   // Group — dark rectangles inset into walls
│   └── <OpeningRect /> (×N)           // Per opening
├── <WallEdges>                        // EdgesGeometry outlines on each wall
├── <HoverHighlight />                 // Transparent overlay on hovered surface
└── <CoatingCrossSection />            // Conditional — toggle-activated layer stack
```

### 6.3 Geometry Specification

| Component | Three.js Geometry | Dimensions | Material |
|---|---|---|---|
| `WallSurface` (north/south) | `PlaneGeometry` | `(roomLengthM, wallHeightM)` | `wallPaintable` (color mutated via `setPaintableWallColor`) |
| `WallSurface` (east/west) | `PlaneGeometry` | `(roomWidthM, wallHeightM)` | `wallPaintable` |
| `CeilingSurface` | `PlaneGeometry` | `(roomLengthM, roomWidthM)` | `ceilingSurface` |
| `OpeningRect` | `PlaneGeometry` | `(openingWidthM, openingHeightM)` | `openingVoid` |
| `WallEdges` | `EdgesGeometry` wrapping each wall's `PlaneGeometry` | — | `edgeLines` |
| `HoverHighlight` | `PlaneGeometry` matching hovered wall | Same as hovered wall | `selectionHighlight` |
| `CoatingCrossSection` | Stacked `BoxGeometry` layers | Exaggerated thickness (0.01–0.03m per layer for visibility) | Unique `MeshBasicMaterial` per layer |

### 6.4 Component Props & Rendering Logic

```ts
interface WallSurfaceProps {
  wallId: 'north' | 'east' | 'south' | 'west'
  widthM: number
  heightM: number
  position: [number, number, number]
  rotation: [number, number, number]
}
// Each wall is a PlaneGeometry positioned and rotated to form a box-less room.
// Walls face INWARD (the user views the room interior).
// North wall: position=[lengthM/2, heightM/2, widthM], rotation=[0, Math.PI, 0]
// South wall: position=[lengthM/2, heightM/2, 0], rotation=[0, 0, 0]
// East wall:  position=[lengthM, heightM/2, widthM/2], rotation=[0, -Math.PI/2, 0]
// West wall:  position=[0, heightM/2, widthM/2], rotation=[0, Math.PI/2, 0]
//
// Pointer events:
//   onPointerEnter → set hoveredSurface = wallId
//   onPointerLeave → set hoveredSurface = null
//   onClick → select surface (future: assign different paint product per surface)

interface OpeningRectProps {
  opening: PaintInputs['openings'][number]
  wallPosition: [number, number, number]
  wallRotation: [number, number, number]
  wallWidthM: number
}
// Positioned relative to its parent wall.
// Rendered at Z-offset of +0.001 from wall surface to prevent z-fighting.
// OpeningRect sits ON the wall plane, visually "punching" a dark hole.
// True CSG boolean subtraction is NOT used — too expensive. The dark material
// provides sufficient visual cue at the calculator's diagram fidelity level.

interface CeilingSurfaceProps {
  lengthM: number
  widthM: number
  heightM: number
  visible: boolean
}
// PlaneGeometry(lengthM, widthM) at position=[lengthM/2, heightM, widthM/2]
// rotation=[-Math.PI/2, 0, 0] — facing downward

interface HoverHighlightProps {
  wallId: string | null
  wallDimensions: Record<string, { widthM: number; heightM: number; position: [number, number, number]; rotation: [number, number, number] }>
}
// When hoveredSurface !== null, renders a semi-transparent plane matching
// the hovered wall's geometry at Z-offset +0.002 from wall surface.

interface CoatingCrossSectionProps {
  visible: boolean
  substrateType: PaintInputs['substrateType']
  coatsTopcoat: number
  coatsPrimer: number
}
// Shown when user toggles cross-section view.
// Renders a small (0.3m × 0.3m) stack of thin BoxGeometry layers:
//   - Substrate base (concrete gray, 0.03m thick)
//   - Primer layer(s) (white, 0.01m each)
//   - Topcoat layer(s) (user-selected color, 0.015m each)
// Positioned beside the room, not inside it.
// Each layer labeled via drei <Html> or external DOM overlay.
```

### 6.5 Wall-by-Wall Mode

In `wall-by-wall` input mode, the room is not necessarily rectangular. The scene renders individual wall planes positioned sequentially along the X-axis (a "flattened" view) rather than attempting to reconstruct an arbitrary room shape. This keeps the 3D scene simple and avoids polygon soup.

```
wall-by-wall layout (top view):
  Wall A ——— Wall B ——— Wall C ——— Wall D
  (each at its own length, all at same height)
  Arranged in a line with small gaps between them.
```

### 6.6 Draw Call Budget

| Element | Draw calls | Notes |
|---|---|---|
| 4 wall planes | 4 | Could merge to 1 via BufferGeometryUtils.mergeGeometries, but hover interaction requires per-wall meshes |
| Ceiling plane | 1 | Conditional |
| Openings (up to 8) | 8 | One plane each |
| Wall edge outlines (4) | 4 | LineSegments from EdgesGeometry |
| Hover highlight | 1 | Conditional |
| Cross-section layers (up to 5) | 5 | Conditional |
| Lights | 0 | — |
| **Total (worst case)** | **23** | Within 50 budget |

### 6.7 Color Update Flow

When the user picks a new paint color:

1. DOM color picker dispatches `setInput('selectedColorHex', '#RRGGBB')`.
2. Store calls `setPaintableWallColor(hex)` — mutates existing material, no new allocation.
3. Store increments `inputVersion`.
4. `SceneInvalidator` detects `inputVersion` change, calls `invalidate()`.
5. R3F renders one frame — walls show new color.

Total cost: one material color mutation + one render frame. Zero garbage collection pressure.

---

## 7. Tool 3 — Drywall / Partition Estimator: 3D Scene

### 7.1 Required Visual Elements (from spec)

- Metal stud lines at chosen spacing
- Top and bottom tracks as horizontal bars
- Opening voids with trimmer/king stud framing
- Board panels overlaid on selected faces with panel edges marked
- Cut boards along edges highlighted
- Toggle: frame-only view ↔ boarded view

**Explicitly excluded:** screws, joint compound, corner beads, realistic section depth, stud flanges.

### 7.2 Component Tree

```
<DrywallScene>
├── <FrameGroup>                         // Always visible
│   ├── <TopTrack />                     // BoxGeometry — horizontal bar
│   ├── <BottomTrackSegments />          // BoxGeometry segments (deducting door widths)
│   ├── <StudArray />                    // InstancedMesh — all studs in one draw call
│   ├── <OpeningVoids>                   // Group — dark rectangles at opening positions
│   │   └── <OpeningVoid /> (×N)
│   ├── <OpeningFraming>                 // Group — king/trimmer/header studs per opening
│   │   └── <OpeningFrame /> (×N)
│   │       ├── <KingStud left />        // BoxGeometry
│   │       ├── <KingStud right />
│   │       ├── <TrimmerStud left />
│   │       ├── <TrimmerStud right />
│   │       └── <HeaderTrack />          // BoxGeometry
│   └── <CornerStuds />                 // Conditional — extra studs at wall ends
├── <BoardGroup>                         // Conditional — visible only in 'boarded' mode
│   ├── <FrontBoardsInstanced />         // InstancedMesh — front face boards
│   ├── <BackBoardsInstanced />          // InstancedMesh — back face boards (if two-side)
│   └── <CutBoardHighlights />           // Separate InstancedMesh for cut boards
└── <WallEdgeOutline />                  // EdgesGeometry — wall boundary wireframe
```

### 7.3 Geometry Specification

| Component | Three.js Geometry | Dimensions | Material |
|---|---|---|---|
| `TopTrack` | `BoxGeometry` | `(wallLengthM, 0.025, 0.07)` | `trackMetal` |
| `BottomTrackSegment` | `BoxGeometry` | `(segmentLengthM, 0.025, 0.07)` | `trackMetal` |
| `StudArray` (instanced) | `InstancedMesh` + `BoxGeometry` | Per stud: `(0.035, wallHeightM - 0.05, 0.07)` | `studMetal` |
| `OpeningVoid` | `PlaneGeometry` | `(openingWidthM, openingHeightM)` | `openingVoid` |
| `KingStud` | `BoxGeometry` | `(0.035, wallHeightM - 0.05, 0.07)` | `studMetal` |
| `TrimmerStud` | `BoxGeometry` | `(0.035, openingHeightM, 0.07)` | `studMetal` |
| `HeaderTrack` | `BoxGeometry` | `(openingWidthM + 0.14, 0.025, 0.07)` | `headerTrack` |
| `FrontBoardsInstanced` | `InstancedMesh` + `PlaneGeometry` | Per board: `(boardWidthM, boardLengthM)` or cut dims | `boardFront` |
| `BackBoardsInstanced` | `InstancedMesh` + `PlaneGeometry` | Same as front | `boardBack` |
| `CutBoardHighlights` | `InstancedMesh` + `PlaneGeometry` | Cut board dims | `boardCut` |
| `WallEdgeOutline` | `EdgesGeometry` wrapping a `PlaneGeometry(wallLengthM, wallHeightM)` | — | `edgeLines` |

### 7.4 Component Props & Rendering Logic

```ts
interface StudArrayProps {
  positions: number[]        // X positions in meters, from computed.studPositionsM
  wallHeightM: number
  studDepthM: number         // 0.07 (70mm standard)
  studWidthM: number         // 0.035 (35mm flange)
}
// Single InstancedMesh.
// For each position: dummy.position.set(posX, wallHeightM/2, 0)
// BoxGeometry(studWidthM, wallHeightM - 0.05, studDepthM)
// The -0.05 accounts for top+bottom track thickness.

interface TopTrackProps {
  wallLengthM: number
  wallHeightM: number
  trackDepthM: number        // 0.07
  trackHeightM: number       // 0.025
}
// position=[wallLengthM/2, wallHeightM - trackHeightM/2, 0]

interface BottomTrackSegmentsProps {
  wallLengthM: number
  openings: DrywallInputs['openings']
  trackDepthM: number
  trackHeightM: number
}
// Generates segments between door openings.
// Door openings produce gaps in the bottom track.
// Window and pass-through openings do NOT interrupt the bottom track.
// Algorithm:
//   1. Collect all door opening x-ranges: (xOffsetMm, xOffsetMm + widthMm)
//   2. Sort by xOffset ascending
//   3. Generate BoxGeometry segments for the gaps between doors

interface OpeningFrameProps {
  opening: DrywallInputs['openings'][number]
  wallHeightM: number
  studDepthM: number
  studWidthM: number
}
// King studs: full height, positioned at opening edges ± studWidth
// Trimmer studs: from floor to opening header height, inset from king studs
// Header track: spans opening width + 2× studWidth overhang, at top of opening

interface BoardGroupProps {
  placements: DrywallComputed['boardPlacements']
  visible: boolean            // false when drywallViewMode === 'frame'
}
// Three InstancedMesh groups:
//   1. Full boards on front face → boardFront material
//   2. Full boards on back face → boardBack material
//   3. Cut boards on either face → boardCut material
// Board orientation:
//   - Vertical: PlaneGeometry(boardWidthM, boardLengthM), boards stand tall
//   - Horizontal: PlaneGeometry(boardLengthM, boardWidthM), boards lie sideways
// Boards positioned at Z = ±(studDepthM/2 + 0.001) for front/back faces
```

### 7.5 Board Placement Pre-computation (CPU-side)

```ts
/**
 * Generates board placement rects for the 3D scene.
 * Called in Zustand recompute(), NOT in a render loop.
 */
function generateBoardPlacements(inputs: DrywallInputs): DrywallComputed['boardPlacements'] {
  const wallLM = inputs.wallLengthMm / 1000
  const wallHM = inputs.wallHeightMm / 1000
  const boardWM = inputs.boardWidthMm / 1000
  const boardLM = inputs.boardLengthMm / 1000
  const faces: Array<'front' | 'back'> =
    inputs.sidesBoarded === 'two-side' ? ['front', 'back'] : ['front']

  const placements: DrywallComputed['boardPlacements'] = []
  let id = 0

  for (const face of faces) {
    if (inputs.boardOrientation === 'vertical') {
      // Boards placed side by side horizontally, full height
      const cols = Math.ceil(wallLM / boardWM)
      for (let c = 0; c < cols; c++) {
        const x = c * boardWM + boardWM / 2
        const y = wallHM / 2
        const isCut = (c === cols - 1 && wallLM % boardWM !== 0) ||
                      wallHM > boardLM  // Board shorter than wall
        placements.push({
          id: `board-${id++}`,
          xM: Math.min(x, wallLM - boardWM / 2),
          yM: y,
          wM: boardWM,
          hM: boardLM,
          face,
          isCut,
        })
      }
    } else {
      // Horizontal: boards stacked in rows
      const rows = Math.ceil(wallHM / boardWM)
      const cols = Math.ceil(wallLM / boardLM)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * boardLM + boardLM / 2
          const y = r * boardWM + boardWM / 2
          const isCut = (c === cols - 1 && wallLM % boardLM !== 0) ||
                        (r === rows - 1 && wallHM % boardWM !== 0)
          placements.push({
            id: `board-${id++}`,
            xM: Math.min(x, wallLM - boardLM / 2),
            yM: Math.min(y, wallHM - boardWM / 2),
            wM: boardLM,
            hM: boardWM,
            face,
            isCut,
          })
        }
      }
    }
  }

  return placements
}
```

### 7.6 View Mode Toggle

The `drywallViewMode` state controls visibility:

| Mode | Visible components | Hidden components |
|---|---|---|
| `frame` | FrameGroup (studs, tracks, opening framing, voids) | BoardGroup |
| `boarded` | FrameGroup + BoardGroup (boards overlaid on frame) | — |

Toggle is controlled by a DOM button, not an in-canvas interaction. The DOM dispatches `toggleDrywallView()`, which flips the enum and increments `inputVersion`.

### 7.7 Draw Call Budget

| Element | Draw calls | Notes |
|---|---|---|
| Top track | 1 | Single mesh |
| Bottom track segments (up to 3) | 3 | One mesh per segment |
| Stud array (instanced) | 1 | Single InstancedMesh |
| Opening voids (up to 3) | 3 | One plane each |
| Opening framing (up to 3 × 5 pieces) | 15 | Could be optimized with instancing in V2 |
| Corner studs (up to 2) | 2 | — |
| Front boards (instanced) | 1 | Conditional |
| Back boards (instanced) | 1 | Conditional |
| Cut board highlights (instanced) | 1 | Conditional |
| Wall edge outline | 1 | — |
| Lights | 0 | — |
| **Total (worst case, boarded, 3 openings)** | **29** | Within 50 budget |

---

## 8. Interaction Patterns (All Tools)

### 8.1 Orbit Controls Configuration

```tsx
<OrbitControls
  makeDefault
  enablePan={true}
  enableZoom={true}
  enableRotate={true}
  minPolarAngle={Math.PI * 0.05}
  maxPolarAngle={Math.PI * 0.45}
  minAzimuthAngle={-Infinity}
  maxAzimuthAngle={Infinity}
  minZoom={30}
  maxZoom={200}
  enableDamping={true}
  dampingFactor={0.1}
  // Touch behavior:
  // - 1 finger drag = orbit
  // - 2 finger pinch = zoom
  // - 2 finger drag = pan
  touches={{
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN,
  }}
/>
```

### 8.2 Surface Selection (Paint tool only)

```tsx
// On each WallSurface mesh:
onPointerEnter={(e) => {
  e.stopPropagation()
  usePaintStore.getState().setHoveredSurface(wallId)
}}
onPointerLeave={() => {
  usePaintStore.getState().setHoveredSurface(null)
}}
onClick={(e) => {
  e.stopPropagation()
  // Future: per-wall paint product assignment
}}
```

### 8.3 Opening Positioning (Future V2 — not V1)

The spec mentions "drag to position openings." For V1, opening positions are set via numeric inputs in the DOM panel. Drag-to-position requires `@react-three/drei` `<DragControls>` or custom raycaster logic and is deferred to V2 to stay within MVP complexity.

### 8.4 Mobile Touch Summary

| Gesture | Action |
|---|---|
| Single-finger drag | Orbit camera |
| Two-finger pinch | Zoom |
| Two-finger drag | Pan |
| Single tap on surface | Select (Paint: highlight wall) |
| Single tap on empty | Deselect |

---

## 9. DOM Overlay Strategy

The spec mandates: **"No text in canvas — material counts, labels, dimensions as DOM overlays."**

All textual information is rendered outside the `<Canvas>` as standard React DOM components. The 3D scene communicates with the DOM via Zustand:

- **Result breakdown panel** (right side / mobile bottom) reads from `computed` slice.
- **Dimension labels** — if needed near geometry, use drei `<Html>` sparingly (max 4 labels visible at once to prevent DOM thrash).
- **Assumptions accordion** reads from `computed.assumptions[]`.
- **Hover info** — when `hoveredSurface` changes, the DOM panel highlights the corresponding result row.

drei `<Html>` usage rules:
- Max 4 concurrent `<Html>` elements in any scene.
- Each `<Html>` uses `occlude={false}` (no occlusion testing — saves GPU queries).
- Each `<Html>` uses `transform` and `distanceFactor={0}` for screen-space sizing.
- `<Html>` elements must not contain interactive form controls — only labels.

---

## 10. Performance Contract Summary

| Metric | Target | Measured by |
|---|---|---|
| Draw calls per frame | <50 | `renderer.info.render.calls` via dev overlay |
| Triangle count (per tool) | <5,000 | `renderer.info.render.triangles` |
| JS heap during session | <80MB | Chrome DevTools / Android profiler |
| Time to first render | <2s | No GLB loading; all geometry is procedural |
| Frame time after input change | <33ms (30fps) | `stats-gl` or `useFrame` delta measurement |
| React re-renders per input | ≤3 components | React DevTools Profiler |
| Zustand subscriptions per component | 1–2 selectors max | Code review |
| InstancedMesh allocation | Pre-allocated max count; no re-allocation on input | Code review |
| Material creation | 0 at runtime; all cached in `CALC_MATERIALS` | Code review |

### Performance Monitoring (Development Only)

```tsx
// Conditionally included via environment variable
{process.env.NODE_ENV === 'development' && (
  <StatsGl className="stats-panel" />
)}
```

---

## 11. File Structure

```
src/
├── components/
│   └── calculators/
│       ├── shared/
│       │   ├── CalculatorCanvasShell.tsx      // Canvas wrapper with shared config
│       │   ├── CalculatorLighting.tsx          // ambientLight + directionalLight
│       │   ├── CalculatorOrbitControls.tsx     // Constrained OrbitControls
│       │   ├── SceneInvalidator.tsx            // Zustand → invalidate() bridge
│       │   └── calculator-materials.ts         // Cached material palette
│       │
│       ├── flooring/
│       │   ├── FlooringScene.tsx               // Root scene component
│       │   ├── FloorPlane.tsx
│       │   ├── ExclusionZones.tsx
│       │   ├── TileGridInstanced.tsx
│       │   ├── CutTileGridInstanced.tsx
│       │   ├── PatternOrientationArrow.tsx
│       │   └── flooring-grid-generator.ts      // generateTileGrid() — pure function
│       │
│       ├── paint/
│       │   ├── PaintScene.tsx                  // Root scene component
│       │   ├── RoomShell.tsx                   // Positions 4 WallSurface + CeilingSurface
│       │   ├── WallSurface.tsx
│       │   ├── CeilingSurface.tsx
│       │   ├── OpeningCutouts.tsx
│       │   ├── HoverHighlight.tsx
│       │   ├── CoatingCrossSection.tsx
│       │   └── WallEdges.tsx
│       │
│       └── drywall/
│           ├── DrywallScene.tsx                // Root scene component
│           ├── FrameGroup.tsx                  // Composes studs + tracks + openings
│           ├── StudArray.tsx                   // InstancedMesh
│           ├── TopTrack.tsx
│           ├── BottomTrackSegments.tsx
│           ├── OpeningVoids.tsx
│           ├── OpeningFraming.tsx
│           ├── CornerStuds.tsx
│           ├── BoardGroup.tsx                  // Composes front + back + cut boards
│           ├── BoardsInstanced.tsx             // Shared InstancedMesh for boards
│           ├── WallEdgeOutline.tsx
│           └── drywall-board-generator.ts      // generateBoardPlacements() — pure function
│
├── stores/
│   ├── flooring-store.ts
│   ├── paint-store.ts
│   └── drywall-store.ts
│
└── lib/
    └── calculator-engine/
        ├── flooring-formulas.ts                // Pure computation functions
        ├── paint-formulas.ts
        ├── drywall-formulas.ts
        └── shared-utils.ts                     // Unit conversion, rounding, polygon area
```

---

## 12. Implementation Checklist

### Flooring (Ship first)

- [ ] `FlooringScene` renders floor plane at correct dimensions from store
- [ ] `ExclusionZones` renders dark cutouts at correct positions
- [ ] `TileGridInstanced` renders full tiles via InstancedMesh
- [ ] `CutTileGridInstanced` renders cut tiles in contrasting color
- [ ] `PatternOrientationArrow` renders for all 4 patterns
- [ ] `generateTileGrid()` produces correct cell layout for straight and brick patterns
- [ ] Diagonal and herringbone set waste percent and orientation arrow only (no angled geometry)
- [ ] Store `recompute()` updates all computed values + tileGrid on any input change
- [ ] `SceneInvalidator` triggers exactly one frame per input change
- [ ] Draw calls ≤ 9
- [ ] 30fps on mid-range Android after input change

### Paint (Ship second)

- [ ] `PaintScene` renders 4-wall room shell at correct dimensions
- [ ] `CeilingSurface` toggles visibility based on `includeCeiling`
- [ ] `OpeningCutouts` renders dark rectangles at correct wall-relative positions
- [ ] `WallEdges` renders edge outlines on all walls
- [ ] `setPaintableWallColor()` updates wall color without creating new material
- [ ] Hover highlighting works: pointer enter/leave updates `hoveredSurface`
- [ ] DOM result panel highlights corresponding row on hover
- [ ] `CoatingCrossSection` renders exaggerated layer stack when toggled
- [ ] Wall-by-wall mode renders flattened wall sequence
- [ ] Draw calls ≤ 23
- [ ] 30fps on mid-range Android after input change

### Drywall (Ship third)

- [ ] `StudArray` renders via InstancedMesh at computed positions
- [ ] `TopTrack` renders at correct wall length and height
- [ ] `BottomTrackSegments` correctly deducts door opening widths
- [ ] `OpeningVoids` renders dark rectangles at correct positions
- [ ] `OpeningFraming` renders king studs, trimmer studs, and header per opening
- [ ] `CornerStuds` renders when `includeCornerStudAllowance` is true
- [ ] `BoardGroup` renders front and optionally back face boards
- [ ] Cut boards highlighted in contrasting color
- [ ] View mode toggle switches between frame-only and boarded view
- [ ] `generateBoardPlacements()` handles vertical and horizontal orientation
- [ ] Draw calls ≤ 29
- [ ] 30fps on mid-range Android after input change

---

## 13. Assumptions & Known Limitations

These are documented transparently in each tool's assumptions accordion:

### Flooring

1. Diagonal and herringbone patterns display as axis-aligned grids with adjusted waste percentages; true angled tile geometry is not rendered in V1.
2. Cut tiles are highlighted by material color only; actual cut shapes (partial tiles) are not geometrically clipped.
3. Exclusion overlap uses AABB (axis-aligned bounding box) testing; rotated exclusions are not supported.
4. Polygon room mode uses the shoelace formula for area but renders only rectangular rooms in 3D; polygon room preview is V2.

### Paint

1. Opening cutouts are rendered as dark planes overlaid on walls, not as true CSG boolean subtractions. Visual fidelity is diagram-level, not photorealistic.
2. Cross-section coating layers use exaggerated thickness (10–30mm per layer) for visibility; actual paint film thickness (~0.05mm) is not representable at scene scale.
3. Wall-by-wall mode renders a flattened wall sequence, not a reconstructed irregular room shape.

### Drywall

1. Stud flanges and web geometry are simplified to rectangular boxes; C-channel cross-section profiles are not modeled.
2. Board panel edges are marked by instance boundaries only; actual panel joint lines (tapered edges, butt joints) are not rendered.
3. Opening framing uses simplified king/trimmer/header assembly; cripple studs and sill plates are not modeled in V1.
4. Board-to-opening intersection clipping is not computed; boards that overlap openings are not geometrically trimmed.

---

*This document is the technical implementation specification for all Phase 1 3D canvas scenes. It references and must remain consistent with `3d-calculator-suite-final.md` (product spec + formulas) and the SlateCamp 3D rendering, performance, and interaction design skill files.*
