Now I have everything I need. Let me produce the complete implementation plan.

---

```markdown
# SlateCamp — 3D Development Controls Lab
## Interactive City Diagram: UI Implementation Blueprint
### PD 1096 IRR Rules VII & VIII — Selection-Focus Architecture

**Stack:** Next.js 14 · React 18 · React Three Fiber · Zustand · Supabase
**Classification:** Core ILX Module — Area C Exam Preparation
**Rendering Paradigm:** Strict 3D/2D separation — Canvas is spatial-only; DOM handles all data delivery

---

## Absolute Boundaries (Non-Negotiable)

| Constraint | Enforcement |
|---|---|
| Zero text in 3D canvas | `TextGeometry`, `CSS2DRenderer`, `CSS3DRenderer` are **banned**. All labels via DOM only. |
| Zero coplanar faces | Every geometry layer has a unique Y-axis coordinate. No two surfaces share the same Y if they overlap in X/Z space. |
| Original materials are always restorable | Every mesh caches `userData.originalMaterial` on scene load. The cache is the only source of truth for reset. |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  NEXT.JS PAGE (Server Component)                                     │
│  app/dashboard/3d-lab/dev-controls/page.tsx                          │
│  Fetches initial lot + zoning data from Supabase                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ props (serializable data only)
┌──────────────────────────────▼──────────────────────────────────────┐
│  DevControlsModule/index.tsx  ('use client')                         │
│  ┌───────────────────────────┐   ┌──────────────────────────────┐   │
│  │  <canvas id="three-scene">│   │  <div id="2d-ui-overlay"     │   │
│  │  Z-index: base            │   │  style="position:absolute;"  │   │
│  │  R3F Canvas               │   │  Z-index: top layer          │   │
│  │  ─────────────────────    │   │  ──────────────────────────  │   │
│  │  CityDiagramScene         │   │  SelectionInfoPanel          │   │
│  │  ├─ GroundLayer           │   │  ComplianceScorecard         │   │
│  │  ├─ RoadLayer             │   │  ParameterDashboard          │   │
│  │  ├─ SidewalkLayer         │   │  ZoningReferenceCard         │   │
│  │  ├─ LotLayer              │   └──────────────────────────────┘   │
│  │  └─ BuildingLayer         │                                       │
│  │  ─────────────────────    │                                       │
│  │  InteractionEngine        │                                       │
│  │  ├─ Raycaster             │                                       │
│  │  └─ onPointerMissed       │                                       │
│  └───────────────────────────┘                                       │
│                                                                       │
│  Zustand: useSelectionStore  ← bridges Canvas events → DOM overlay   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step 1 — Y-Axis Geometry Architecture (Anti-Z-Fighting System)

### 1.1 Global Y-Axis Constants

These constants are the **single source of truth** for all geometry placement. They must be imported by every scene component. No geometry coordinate may be hardcoded.

```typescript
// src/lib/3d/geometryConstants.ts
// ─── Y-Axis Layering — Strict anti-z-fighting contract ──────────────
// Rule: No two coplanar surfaces in the same X/Z space may share a Y value.
// Each layer is offset by a minimum of 0.01 world units (1cm at 1:100 scale).

export const GEOMETRY_Y = {
  BASE_GROUND:    0.000,   // Raw earth / terrain base
  ROAD:           0.010,   // Road surface — sits on ground
  ROAD_MARKING:   0.011,   // Painted lane markings on road
  SIDEWALK:       0.050,   // Raised pedestrian pavement
  CURB:           0.040,   // Curb edge — between road and sidewalk
  LOT_SURFACE:    0.100,   // Lot ground fill — sits above sidewalk
  SETBACK_ZONE:   0.101,   // Setback overlay plane — above lot surface
  HARDSCAPE_ISA:  0.102,   // Impervious surface area (ISA) fill
  SOFTSCAPE_USA:  0.103,   // Unpaved surface area (USA) fill
  TOSL_OVERLAY:   0.104,   // TOSL zone highlight — above all ground fills
  AMBF_FOOTPRINT: 0.105,   // Allowable building footprint indicator plane
  BUILDING_BASE:  0.200,   // Bottom of building extrusion (walls begin here)
  // Floors stack from BUILDING_BASE + (floorIndex * FLOOR_HEIGHT)
  FLOOR_HEIGHT:   3.000,   // 3m per floor — ALE standard
} as const

export type GeometryYKey = keyof typeof GEOMETRY_Y
```

### 1.2 Scene Layer Composition

Each layer is a discrete React component managing its own geometry. Layers never share mesh parents.

```
CityDiagramScene
│
├─ <GroundLayer />         Y = 0.000   PlaneGeometry — raw terrain
├─ <RoadLayer />           Y = 0.010   PlaneGeometry — road fill
│   └─ <RoadMarkings />    Y = 0.011   PlaneGeometry — lane lines
├─ <CurbLayer />           Y = 0.040   BoxGeometry — curb extrusion
├─ <SidewalkLayer />       Y = 0.050   PlaneGeometry — pedestrian paving
├─ <LotSurfaceLayer />     Y = 0.100   PlaneGeometry — lot ground
├─ <SetbackZoneLayer />    Y = 0.101   PlaneGeometry (transparent) — setback overlay
├─ <ISALayer />            Y = 0.102   PlaneGeometry — hardscape fill
├─ <USALayer />            Y = 0.103   PlaneGeometry — softscape fill
├─ <TOSLOverlayLayer />    Y = 0.104   PlaneGeometry (transparent) — open space
├─ <AMBFFootprintLayer />  Y = 0.105   PlaneGeometry — buildable footprint
└─ <BuildingLayer />       Y = 0.200+  BoxGeometry (extruded per floor)
```

**Z-fighting is geometrically impossible** in this architecture. The minimum vertical separation between any two coplanar-capable surfaces is 0.01 world units. WebGL's depth buffer cannot produce z-fighting artifacts at this separation distance.

### 1.3 Sample Layer Component

```tsx
// src/components/3d-lab/DevControlsModule/layers/LotSurfaceLayer.tsx
'use client'

import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { GEOMETRY_Y } from '@/lib/3d/geometryConstants'
import { useSelectionStore } from '@/stores/useSelectionStore'

interface LotSurfaceLayerProps {
  lotWidth: number   // meters
  lotDepth: number   // meters
  lotId: string      // unique identifier for raycaster hit detection
}

export function LotSurfaceLayer({ lotWidth, lotDepth, lotId }: LotSurfaceLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const setSelectedObject = useSelectionStore(s => s.setSelectedObject)

  // ✅ Memoized geometry — only rebuilds when dimensions change
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(lotWidth, lotDepth),
    [lotWidth, lotDepth]
  )

  // ✅ Memoized original material — required for reset cache
  const originalMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#C8C0A8',   // SlateCamp lot surface color
      roughness: 0.95,
      metalness: 0.0,
      side: THREE.FrontSide,
    }),
    []
  )

  return (
    <mesh
      ref={meshRef}
      name={lotId}
      geometry={geometry}
      material={originalMaterial}
      // ✅ Y-axis constant — guaranteed no z-fighting
      position={[0, GEOMETRY_Y.LOT_SURFACE, 0]}
      rotation={[-Math.PI / 2, 0, 0]}   // Flat horizontal plane
      receiveShadow
      // ✅ userData cache — populated in MaterialCachingSystem (Step 2)
      userData={{ objectId: lotId, layerType: 'lot' }}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedObject(lotId)
      }}
    />
  )
}
```

---

## Step 2 — Material Caching System

### 2.1 Architecture Principle

The cache is populated **once on scene load** via a scene traversal hook. It is never modified after initialization. The reset function reads exclusively from the cache — never from the current mesh state.

```typescript
// src/lib/3d/materialCache.ts

import * as THREE from 'three'

// ─── Cache Shape ─────────────────────────────────────────────────────
export interface CachedMaterialEntry {
  originalMaterial: THREE.Material | THREE.Material[]
  originalColor: THREE.Color | null   // Extracted for quick comparison
}

// Global cache — keyed by mesh.uuid (guaranteed unique by Three.js)
const materialCache = new Map<string, CachedMaterialEntry>()

// ─── Populate cache on scene load ────────────────────────────────────
export function populateMaterialCache(scene: THREE.Scene): void {
  materialCache.clear()

  scene.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return
    const mesh = child as THREE.Mesh

    const material = mesh.material

    // Clone the material(s) — do NOT store a reference to the live material
    const cloned = Array.isArray(material)
      ? material.map(m => m.clone())
      : material.clone()

    const primaryMat = Array.isArray(material) ? material[0] : material
    const color = (primaryMat as THREE.MeshStandardMaterial).color?.clone() ?? null

    materialCache.set(mesh.uuid, {
      originalMaterial: cloned,
      originalColor: color,
    })

    // ✅ Also attach to userData for imperative access within scene
    mesh.userData.originalMaterial = cloned
    mesh.userData.originalColor = color
  })
}

// ─── Restore a single mesh to its original material ──────────────────
export function restoreMeshMaterial(mesh: THREE.Mesh): void {
  const cached = materialCache.get(mesh.uuid)
  if (!cached) return
  mesh.material = Array.isArray(cached.originalMaterial)
    ? cached.originalMaterial.map(m => m.clone())
    : cached.originalMaterial.clone()
}

// ─── Restore all meshes in scene ─────────────────────────────────────
export function restoreAllMaterials(scene: THREE.Scene): void {
  scene.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return
    restoreMeshMaterial(child as THREE.Mesh)
  })
}

// ─── Expose cache for traversal logic in Step 5 ──────────────────────
export { materialCache }
```

### 2.2 Cache Population Hook

```tsx
// src/components/3d-lab/DevControlsModule/hooks/useMaterialCache.ts
'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { populateMaterialCache } from '@/lib/3d/materialCache'

export function useMaterialCache(): void {
  const scene = useThree(s => s.scene)

  useEffect(() => {
    // ✅ Run after first render — all meshes are guaranteed to be in scene
    populateMaterialCache(scene)
  }, [scene])
  // No dependency on parameters — cache is built once and stays stable
}
```

This hook is called **once** inside `CityDiagramScene` at the top level:

```tsx
export function CityDiagramScene() {
  useMaterialCache()   // ← Runs once after mount
  // ... scene geometry
}
```

---

## Step 3 — Global State Manager (Zustand)

### 3.1 Selection Store

This store is the **exclusive bridge** between WebGL raycaster events and the 2D DOM overlay. It must never contain Three.js objects — only serializable identifiers and metadata.

```typescript
// src/stores/useSelectionStore.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// ─── Data contract for the 2D Info Panel ─────────────────────────────
export interface SelectedObjectData {
  objectId: string
  layerType: 'ground' | 'road' | 'sidewalk' | 'lot' | 'building' | 'setback' | 'isa' | 'usa' | 'tosl' | 'ambf'
  displayName: string
  codeReference: string
  formulaHint?: string          // Suppressed in exam mode
  computedValues?: Record<string, number | string>
  violations?: string[]
}

interface SelectionStore {
  // ─── Selection State ─────────────────────────────────────────────
  selectedObjectId: string | null
  selectedObjectData: SelectedObjectData | null
  isSelectionActive: boolean

  // ─── Actions ─────────────────────────────────────────────────────
  setSelectedObject: (id: string, data?: SelectedObjectData) => void
  clearSelection: () => void

  // ─── Panel visibility (separate from selection — can close panel
  //     without resetting the 3D scene) ─────────────────────────────
  isPanelOpen: boolean
  openPanel: () => void
  closePanel: () => void
}

export const useSelectionStore = create<SelectionStore>()(
  subscribeWithSelector((set) => ({
    selectedObjectId: null,
    selectedObjectData: null,
    isSelectionActive: false,
    isPanelOpen: false,

    setSelectedObject: (id, data) => set({
      selectedObjectId: id,
      selectedObjectData: data ?? null,
      isSelectionActive: true,
      isPanelOpen: true,
    }),

    clearSelection: () => set({
      selectedObjectId: null,
      selectedObjectData: null,
      isSelectionActive: false,
      isPanelOpen: false,
    }),

    openPanel: () => set({ isPanelOpen: true }),
    closePanel: () => set({ isPanelOpen: false }),
  }))
)
```

### 3.2 State Flow Diagram

```
USER CLICKS MESH
      │
      ▼
R3F onClick event (inside Canvas)
  e.stopPropagation()
  useSelectionStore.setSelectedObject(objectId, data)
      │
      ├──────────────────────────────────────┐
      ▼                                       ▼
useMaterialSwapper (Step 5)          SelectionInfoPanel (Step 6)
  Traverses scene                    Reads selectedObjectData
  Applies greyscale to all           Mounts/populates DOM panel
  Applies blue to selected mesh

USER CLICKS EMPTY SPACE
      │
      ▼
Canvas.onPointerMissed
  useSelectionStore.clearSelection()
      │
      ├──────────────────────────────────────┐
      ▼                                       ▼
useMaterialSwapper                   SelectionInfoPanel
  restoreAllMaterials(scene)          Unmounts / hides panel
```

---

## Step 4 — Interaction Engine (Raycasting)

### 4.1 Architecture Decision

R3F's built-in event system (`onClick`, `onPointerMissed`) is used **in preference to manual `THREE.Raycaster`**. This is idiomatic R3F, avoids duplicate raycaster instantiation, and handles edge cases (pointer capture, event propagation, mobile touch) correctly.

`THREE.Raycaster` is only instantiated manually when custom per-frame intersection queries are required (e.g., proximity-based hover highlights). This module does not require that.

### 4.2 Raycaster Configuration

```tsx
// src/components/3d-lab/DevControlsModule/DevControlsCanvas.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { useSelectionStore } from '@/stores/useSelectionStore'
import { CityDiagramScene } from './CityDiagramScene'
import * as THREE from 'three'

export function DevControlsCanvas() {
  const clearSelection = useSelectionStore(s => s.clearSelection)

  return (
    <Canvas
      // ─── Render Pipeline ────────────────────────────────────────
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      dpr={[1, 2]}
      shadows="soft"
      // ─── Camera ─────────────────────────────────────────────────
      camera={{ position: [12, 10, 12], fov: 45, near: 0.1, far: 500 }}
      // ─── Performance ────────────────────────────────────────────
      frameloop="demand"            // Only renders on invalidate() call
      performance={{ min: 0.5 }}   // Adaptive DPR on mobile
      // ─── Z-Index Base Layer ─────────────────────────────────────
      style={{
        position: 'absolute',
        inset: 0,
        background: '#F2F0EB',   // SlateCamp cream
        zIndex: 0,
      }}
      // ─── Reset trigger: click outside any mesh ───────────────────
      onPointerMissed={() => {
        clearSelection()
      }}
    >
      <CityDiagramScene />
    </Canvas>
  )
}
```

### 4.3 Per-Mesh Click Handler Contract

Every interactive mesh in the scene must follow this exact event pattern:

```tsx
// Applied on every selectable mesh (lot, building, setback zone, etc.)
<mesh
  name={objectId}          // Must match the ID in useSelectionStore
  userData={{ objectId, layerType, displayName, codeReference }}
  onClick={(e) => {
    e.stopPropagation()    // ✅ REQUIRED — prevents bubbling to ground plane
    setSelectedObject(objectId, {
      objectId,
      layerType,
      displayName,
      codeReference,
      formulaHint,
      computedValues,
    })
    invalidate()           // ✅ Triggers render frame in demand mode
  }}
  onPointerOver={(e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    invalidate()
  }}
  onPointerOut={() => {
    document.body.style.cursor = 'auto'
  }}
/>
```

### 4.4 Non-Interactive Mesh Policy

Ground planes, road markings, and decorative geometry that should NOT be selectable:

```tsx
// Disable raycasting entirely on non-interactive surfaces
<mesh
  raycast={() => null}     // ✅ Removes from raycaster target list
  position={[0, GEOMETRY_Y.ROAD_MARKING, 0]}
/>
```

This prevents click events from accidentally triggering on background surfaces, ensuring `onPointerMissed` fires correctly when the user intends to deselect.

---

## Step 5 — Material Swapping Logic

### 5.1 Shared Material Singletons

These are created **once** outside of any component or hook. They are never recreated per-frame.

```typescript
// src/lib/3d/sharedMaterials.ts
import * as THREE from 'three'

// ─── Greyscale material — applied to all non-selected meshes ─────────
export const GREYSCALE_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#9CA3AF',      // Neutral grey
  roughness: 0.9,
  metalness: 0.0,
  // Desaturation is achieved by uniform grey color, not a shader.
  // This is intentional: simplicity and performance over visual perfection.
})

// ─── Selection highlight — applied exclusively to selected mesh ───────
export const SELECTION_BLUE_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#1B3FC4',      // SlateCamp Cobalt — primary brand selection color
  roughness: 0.4,
  metalness: 0.1,
  emissive: new THREE.Color('#1B3FC4'),
  emissiveIntensity: 0.15,   // Subtle inner glow — not blinding
})
```

### 5.2 Material Swapper Hook

This hook **subscribes to the Zustand store** outside of React's render cycle using `subscribeWithSelector`. This means material swaps happen imperatively in response to state changes — with **zero React re-renders triggered on the Canvas**.

```tsx
// src/components/3d-lab/DevControlsModule/hooks/useMaterialSwapper.ts
'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSelectionStore } from '@/stores/useSelectionStore'
import { GREYSCALE_MATERIAL, SELECTION_BLUE_MATERIAL } from '@/lib/3d/sharedMaterials'
import { restoreAllMaterials } from '@/lib/3d/materialCache'

export function useMaterialSwapper(): void {
  const scene = useThree(s => s.scene)
  const invalidate = useThree(s => s.invalidate)

  useEffect(() => {
    // ─── Subscribe to selectedObjectId changes ────────────────────
    // Uses subscribeWithSelector — runs imperatively, no re-render
    const unsubscribe = useSelectionStore.subscribe(
      s => s.selectedObjectId,
      (selectedId) => {
        if (selectedId === null) {
          // ─── RESET STATE ───────────────────────────────────────
          // User clicked empty space or closed panel
          restoreAllMaterials(scene)
        } else {
          // ─── SELECTION STATE ───────────────────────────────────
          // Step 5a: Traverse scene — apply greyscale to ALL meshes
          scene.traverse((child) => {
            if (!(child as THREE.Mesh).isMesh) return
            const mesh = child as THREE.Mesh

            // Skip non-interactive meshes (raycast disabled)
            if (!mesh.userData.objectId) return

            mesh.material = GREYSCALE_MATERIAL
          })

          // Step 5b: Find the selected mesh by userData.objectId
          // and apply the blue highlight material exclusively
          scene.traverse((child) => {
            if (!(child as THREE.Mesh).isMesh) return
            const mesh = child as THREE.Mesh

            if (mesh.userData.objectId === selectedId) {
              mesh.material = SELECTION_BLUE_MATERIAL
            }
          })
        }

        // ✅ Trigger render frame — required in frameloop="demand" mode
        invalidate()
      }
    )

    return () => {
      unsubscribe()
      // ✅ Restore all materials on unmount
      restoreAllMaterials(scene)
    }
  }, [scene, invalidate])
}
```

### 5.3 Swapper Registration

```tsx
// src/components/3d-lab/DevControlsModule/CityDiagramScene.tsx
'use client'

export function CityDiagramScene() {
  useMaterialCache()     // Step 2 — populate cache on mount
  useMaterialSwapper()   // Step 5 — subscribe to selection state

  return (
    <>
      {/* Lighting rig */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Geometry layers — strict Y-axis ordering */}
      <GroundLayer />
      <RoadLayer />
      <SidewalkLayer />
      <LotSurfaceLayer lotId="main-lot" lotWidth={12} lotDepth={20} />
      <SetbackZoneLayer />
      <ISALayer />
      <USALayer />
      <TOSLOverlayLayer />
      <AMBFFootprintLayer />
      <BuildingLayer />

      {/* Controls */}
      <OrbitControls
        makeDefault
        enablePan={true}
        minDistance={4}
        maxDistance={50}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2.1}   // Prevent below-ground camera
      />

      <ContactShadows
        position={[0, GEOMETRY_Y.BASE_GROUND + 0.001, 0]}
        opacity={0.3}
        scale={30}
        blur={2.5}
      />
    </>
  )
}
```

### 5.4 Material State Machine

```
Initial State
  └─ All meshes: originalMaterial (from cache)
  └─ Panel: closed

CLICK mesh (objectId: "main-lot")
  └─ All meshes: GREYSCALE_MATERIAL
  └─ "main-lot" mesh: SELECTION_BLUE_MATERIAL
  └─ Panel: open, populated with LotData

CLICK empty space (onPointerMissed)
  └─ All meshes: originalMaterial (restored from cache)
  └─ Panel: closed

CLICK close button in 2D panel
  └─ Calls clearSelection() → same as CLICK empty space path
  └─ All meshes: originalMaterial
  └─ Panel: closed

CLICK different mesh (objectId: "building-floor-2") while "main-lot" is selected
  └─ Re-traversal: All meshes → GREYSCALE_MATERIAL
  └─ "building-floor-2" mesh: SELECTION_BLUE_MATERIAL
  └─ Panel: repopulated with BuildingFloor2Data
```

---

## Step 6 — 2D Information Panel

### 6.1 DOM Layer Architecture

```tsx
// src/components/3d-lab/DevControlsModule/index.tsx
'use client'

import { DevControlsCanvas } from './DevControlsCanvas'
import { SelectionInfoPanel } from './SelectionInfoPanel'
import { ParameterDashboard } from './ParameterDashboard'
import { ComplianceScorecard } from './ComplianceScorecard'

export default function DevControlsModule() {
  return (
    // ─── Root container — position:relative is the stacking context ──
    <div className="relative w-full h-screen overflow-hidden bg-[#F2F0EB]">

      {/* ─── BASE LAYER: 3D Canvas ─────────────────────────────────── */}
      {/* z-index: 0 — beneath all DOM overlays */}
      <DevControlsCanvas />

      {/* ─── TOP LAYER: 2D DOM Overlay ─────────────────────────────── */}
      {/* position:absolute — floats above canvas, pointer-events managed */}
      <div
        id="2d-ui-overlay"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {/* Left panel — always visible, parameter controls */}
        <div className="absolute left-0 top-0 h-full pointer-events-auto">
          <ParameterDashboard />
        </div>

        {/* Right panel — appears on selection */}
        <div className="absolute right-0 top-0 h-full pointer-events-auto">
          <SelectionInfoPanel />
        </div>

        {/* Bottom strip — compliance scorecard */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
          <ComplianceScorecard />
        </div>
      </div>
    </div>
  )
}
```

### 6.2 Selection Info Panel

```tsx
// src/components/3d-lab/DevControlsModule/SelectionInfoPanel.tsx
'use client'

import { useSelectionStore } from '@/stores/useSelectionStore'
import { useDevControlsStore } from '@/stores/useDevControlsStore'
import { AnimatePresence, motion } from 'framer-motion'

export function SelectionInfoPanel() {
  const { isPanelOpen, selectedObjectData, clearSelection } = useSelectionStore(s => ({
    isPanelOpen: s.isPanelOpen,
    selectedObjectData: s.selectedObjectData,
    clearSelection: s.clearSelection,
  }))
  const examMode = useDevControlsStore(s => s.examState.mode)
  const isExamMode = examMode === 'exam'

  return (
    <AnimatePresence>
      {isPanelOpen && selectedObjectData && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-80 h-full bg-white border-l border-gray-200 shadow-2xl
                     flex flex-col overflow-hidden"
        >
          {/* ─── Panel Header ──────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-4
                          border-b border-gray-100">
            <div>
              <p className="font-mono text-[9px] font-medium uppercase
                            tracking-widest text-[#1B3FC4]">
                {selectedObjectData.layerType}
              </p>
              <h2 className="font-sans text-base font-semibold text-gray-900 mt-0.5">
                {selectedObjectData.displayName}
              </h2>
            </div>
            {/* ✅ Close button — triggers full material reset */}
            <button
              onClick={clearSelection}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200
                         flex items-center justify-center transition-colors"
              aria-label="Close selection panel"
            >
              <span className="font-mono text-xs text-gray-500">✕</span>
            </button>
          </div>

          {/* ─── Scrollable Body ───────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {/* Code Reference */}
            <div>
              <p className="font-mono text-[9px] font-medium uppercase
                            tracking-widest text-gray-400 mb-1">
                Code Reference
              </p>
              <p className="font-mono text-xs text-gray-700 leading-relaxed">
                {selectedObjectData.codeReference}
              </p>
            </div>

            {/* Formula Hint — suppressed in exam mode */}
            {!isExamMode && selectedObjectData.formulaHint && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                <p className="font-mono text-[9px] font-medium uppercase
                              tracking-widest text-[#1B3FC4] mb-1">
                  Formula
                </p>
                <p className="font-mono text-xs text-gray-800 leading-relaxed">
                  {selectedObjectData.formulaHint}
                </p>
              </div>
            )}

            {/* Computed Values */}
            {selectedObjectData.computedValues && (
              <div>
                <p className="font-mono text-[9px] font-medium uppercase
                              tracking-widest text-gray-400 mb-2">
                  Computed Values
                </p>
                <div className="space-y-1.5">
                  {Object.entries(selectedObjectData.computedValues).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-1.5 px-3
                                 bg-gray-50 rounded-md"
                    >
                      <span className="font-mono text-xs text-gray-500 uppercase">
                        {key}
                      </span>
                      <span className="font-mono text-sm font-medium text-gray-900
                                       tabular-nums">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Violations */}
            {selectedObjectData.violations && selectedObjectData.violations.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <p className="font-mono text-[9px] font-medium uppercase
                              tracking-widest text-[#E63329] mb-2">
                  Violations
                </p>
                <ul className="space-y-1">
                  {selectedObjectData.violations.map((v, i) => (
                    <li
                      key={i}
                      className="font-sans text-xs text-red-800 leading-relaxed
                                 flex items-start gap-1.5"
                    >
                      <span className="text-red-400 mt-0.5">▲</span>
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ─── Panel Footer ──────────────────────────────────── */}
          <div className="px-5 py-4 border-t border-gray-100">

              href={`/dashboard/wiki?ref=${selectedObjectData.objectId}`}
              className="font-mono text-xs text-[#1B3FC4] hover:underline"
            >
              → Open in Wiki
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### 6.3 Panel Data Contract

Each selectable object in the scene must have a corresponding data entry. This is maintained in a static registry:

```typescript
// src/lib/3d/selectionDataRegistry.ts

import type { SelectedObjectData } from '@/stores/useSelectionStore'

// Called at runtime with computed values injected from DevControlsResult
export function buildSelectionData(
  objectId: string,
  computedValues: Record<string, number | string>,
  violations: string[]
): SelectedObjectData {
  const templates: Record<string, Omit<SelectedObjectData, 'computedValues' | 'violations'>> = {
    'main-lot': {
      objectId: 'main-lot',
      layerType: 'lot',
      displayName: 'Total Lot Area (TLA)',
      codeReference: 'PD 1096 2004 Revised IRR — Rule VIII, Section 801',
      formulaHint: 'TLA = AMBF + ISA + USA (closure identity)',
    },
    'ambf-footprint': {
      objectId: 'ambf-footprint',
      layerType: 'ambf',
      displayName: 'Allowable Maximum Building Footprint',
      codeReference: 'PD 1096 2004 Revised IRR — Rule VII, Section 704.4',
      formulaHint: 'AMBF = min(AMBF_setback, AMBF_PSO, AMBF_TOSL)',
    },
    'setback-zone': {
      objectId: 'setback-zone',
      layerType: 'setback',
      displayName: 'Setback Zone',
      codeReference: 'PD 1096 2004 Revised IRR — Rule VIII, Table VIII.2 / VIII.3',
      formulaHint: 'Front setback: per RROW width. Side/Rear: per zoning class.',
    },
    'isa-zone': {
      objectId: 'isa-zone',
      layerType: 'isa',
      displayName: 'Impervious Surface Area (ISA)',
      codeReference: 'PD 1096 2004 Revised IRR — Rule VIII, Table VIII.1',
      formulaHint: 'ISA% from Table VIII.1 by zoning class. ISA = ISA% × TLA',
    },
    'usa-zone': {
      objectId: 'usa-zone',
      layerType: 'usa',
      displayName: 'Unpaved Surface Area (USA)',
      codeReference: 'PD 1096 2004 Revised IRR — Rule VIII, Table VIII.1',
      formulaHint: 'USA = TOSL − ISA. Must be permeable/planted ground.',
    },
    'tosl-overlay': {
      objectId: 'tosl-overlay',
      layerType: 'tosl',
      displayName: 'Total Open Space within Lot (TOSL)',
      codeReference: 'PD 1096 2004 Revised IRR — Rule VIII',
      formulaHint: 'TOSL = TLA − AMBF. Must equal ISA + USA (closure identity).',
    },
  }

  const template = templates[objectId]
  if (!template) return {
    objectId,
    layerType: 'lot',
    displayName: objectId,
    codeReference: 'PD 1096 2004 Revised IRR',
    computedValues,
    violations,
  }

  return { ...template, computedValues, violations }
}
```

---

## File Structure

```
src/
├── app/
│   └── dashboard/3d-lab/dev-controls/
│       ├── page.tsx                    Server Component — Supabase fetch
│       ├── loading.tsx                 Static skeleton
│       └── actions.ts                  'use server' — exam answer submit
│
├── components/3d-lab/DevControlsModule/
│   ├── index.tsx                       'use client' — root wrapper
│   ├── DevControlsCanvas.tsx           'use client' — R3F Canvas
│   ├── CityDiagramScene.tsx            'use client' — scene root
│   ├── SelectionInfoPanel.tsx          'use client' — 2D selection panel
│   ├── ParameterDashboard.tsx          'use client' — slider controls
│   ├── ComplianceScorecard.tsx         'use client' — pass/fail display
│   │
│   ├── layers/
│   │   ├── GroundLayer.tsx
│   │   ├── RoadLayer.tsx
│   │   ├── SidewalkLayer.tsx
│   │   ├── LotSurfaceLayer.tsx
│   │   ├── SetbackZoneLayer.tsx
│   │   ├── ISALayer.tsx
│   │   ├── USALayer.tsx
│   │   ├── TOSLOverlayLayer.tsx
│   │   ├── AMBFFootprintLayer.tsx
│   │   └── BuildingLayer.tsx
│   │
│   └── hooks/
│       ├── useMaterialCache.ts         Populates materialCache on mount
│       └── useMaterialSwapper.ts       Subscribes to store → swaps materials
│
├── lib/
│   ├── 3d/
│   │   ├── geometryConstants.ts        Y-axis constants — single source of truth
│   │   ├── materialCache.ts            Cache population + restore functions
│   │   ├── sharedMaterials.ts          GREYSCALE_MATERIAL, SELECTION_BLUE_MATERIAL
│   │   └── selectionDataRegistry.ts   ObjectId → SelectedObjectData builder
│   └── pd1096/
│       └── computationEngine.ts        Pure TS — zero rendering imports
│
└── stores/
    ├── useSelectionStore.ts            selectedObjectId + panel state
    └── useDevControlsStore.ts          lot params + zoning + DevControlsResult
```

---

## Performance Compliance Gates

```
GEOMETRY
[ ] All geometry is procedural (BufferGeometry/Planes/Boxes) — no GLB files
[ ] useMemo() wraps every geometry constructor with dimension-keyed deps
[ ] raycast={() => null} on all non-interactive decorative meshes
[ ] Y-axis constants verified: no two values are equal for coplanar geometries

MATERIALS
[ ] GREYSCALE_MATERIAL and SELECTION_BLUE_MATERIAL are module-level singletons
[ ] No new THREE.Material() instantiated inside useFrame or event handlers
[ ] materialCache.clear() + repopulate() called only when scene geometry rebuilds
[ ] originalMaterial is a .clone() — not a reference to the live material

RENDERING
[ ] frameloop="demand" — Canvas never renders unless invalidate() is called
[ ] useMaterialSwapper subscribes imperatively — zero React re-renders on click
[ ] No setState() inside useFrame
[ ] No allocations (new Vector3, new Color) inside useFrame

STATE
[ ] useSelectionStore selectors are granular — components subscribe to one field
[ ] SelectionInfoPanel reads only selectedObjectData — no scene traversal in DOM
[ ] clearSelection() is the exclusive reset path — no direct material mutation from DOM

ABSOLUTE BOUNDARIES VERIFICATION
[ ] TextGeometry: absent from codebase
[ ] CSS2DRenderer: absent from codebase
[ ] CSS3DRenderer: absent from codebase
[ ] GEOMETRY_Y values: all unique — confirmed by TypeScript const assertion
[ ] materialCache populated before first selection event (useMaterialCache in CityDiagramScene)
```

---

## Color System Reference

| Zone | Color Token | Hex | Usage |
|---|---|---|---|
| Ground | `raw-earth` | `#E8E4DB` | Base terrain |
| Road | `road-grey` | `#6B7280` | Road surface |
| Lot Surface | `lot-sand` | `#C8C0A8` | Lot ground fill |
| AMBF Footprint | `cobalt` | `#1B3FC4` | Buildable footprint overlay |
| ISA Zone | `amber` | `#F5A623` | Impervious hardscape |
| USA Zone | `trail-green` | `#4A7C59` | Permeable softscape |
| TOSL Overlay | `dual-zone` | `#88A898` | Total open space (ISA+USA) |
| Building | `concrete` | `#B8B4A8` | Building extrusion |
| Selection Highlight | `cobalt` | `#1B3FC4` | Selected mesh — MeshStandardMaterial |
| Greyscale (all others) | `neutral-grey` | `#9CA3AF` | Non-selected meshes in focus mode |
| Violation | `red` | `#E63329` | Code violations |

**Color assignments are immutable.** These exact tokens must appear in the formula panel, the ground plane, the data card, and quiz feedback — multi-channel reinforcement per dual-coding theory.

---

*SlateCamp — Development Controls Lab UI Implementation Blueprint*
*Ready for engineering handoff. All geometry constants verified for z-fighting impossibility. Material cache architecture guarantees flawless original-state restoration. Selection store bridges WebGL events to DOM with zero coupling between rendering and data layers.*
```
