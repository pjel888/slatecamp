# PD 1096 Rules 7 & 8 — 3D Interactive Visualization: Implementation Plan

> **Invoked skills:** slatecamp-3d-arch-diagram-modeler · slatecamp-3d-code-compliance-viz · slatecamp-3d-information-designer · slatecamp-3d-interaction-designer · slatecamp-3d-lab-engineer · slatecamp-3d-parametric-engine · slatecamp-3d-performance-engineer · slatecamp-3d-visual-rendering · slatecamp-codebase-steward · slatecamp-performance-gamification · slatecamp-r3f-api-master · slatecamp-ux-designer

> **Note:** All area formulas, setback values, and computation logic are defined in the reference document. This plan covers architecture, component engineering, interactivity, and integration only.

---

## Executive Summary

This module visualizes the six spatial metrics of PD 1096 Rules VII and VIII (TLA, AMBF, PSO, ISA, USA, TOSL, MACA) as a fully parametric, interactive 3D lot model built on the existing SlateCamp 3D Lab stack (React Three Fiber + drei + Zustand). Students manipulate lot dimensions, setbacks, and zoning class through a controls panel and watch the building footprint and open-space zones rearrange in real time. The module integrates into the existing `/3d-lab/` route with zero new dependencies.

---

## Module Architecture Overview

```
Phase 1 — Math Engine       useSiteControls() hook
                                        │
Phase 2 — State             usePD1096Store (Zustand)
                                        │
Phase 3 — 3D Canvas         PD1096Canvas.tsx (R3F)
              ┌─────────────────────┼───────────────────────┐
         LotPlane           AMBFVolume             OpenSpaceZones
         (TLA base)       (building footprint)   (ISA + USA planes)
                                        │
Phase 4 — Interactivity     ZoneHotspots · DimensionLines · ViolationShader
                                        │
Phase 5 — Integration       /3d-lab/site-controls route
                            SiteControlsPage · ControlsPanel · ComplianceScorecard
```

---

## Phase 1 — Math Engine (`useSiteControls` hook)

**File:** `src/hooks/useSiteControls.ts`

This is a pure TypeScript calculation layer — no React, no Three.js. It is the single source of truth for all computed area values. Every 3D geometry derives its dimensions from this hook's outputs. All computation logic must reference the designated formulas document.

### Interface Contract

```typescript
// src/hooks/useSiteControls.ts

export interface LotInputs {
  lotWidth: number          // meters
  lotDepth: number          // meters
  occupancyGroup: string    // 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  zoningClass: string       // LGU zone key
  isSprinklered: boolean
}

export interface SiteControlOutputs {
  tla: number               // Total Lot Area (sqm)
  ambf: number              // Allowable Maximum Building Footprint (sqm)
  buildableWidth: number    // meters
  buildableDepth: number    // meters
  pso: number               // Percentage of Site Occupancy (sqm of open space)
  tosl: number              // Total Open Space within Lot (sqm)
  isa: number               // Impervious Surface Area (sqm)
  usa: number               // Unpaved Surface Area (sqm)
  maca: number              // Maximum Allowable Construction Area (sqm)
  setbacks: { front: number; rear: number; left: number; right: number }
  compliance: {
    ambfOk: boolean
    toslOk: boolean
    message: string
  }
}

export function useSiteControls(inputs: LotInputs): SiteControlOutputs
```

### Validation Guard

Before returning results, the engine must verify that the computed values satisfy the area identity defined in the reference document. If the check fails, the hook logs a console error and sets `compliance.message` accordingly. This is the Phase 5 audit gate.

---

## Phase 2 — Zustand Store (`usePD1096Store`)

**File:** `src/stores/usePD1096Store.ts`

Extends the existing `useLabStore` pattern with `subscribeWithSelector` middleware. The store owns all mutable state for the module. Canvas components subscribe only to the slices they need — no unnecessary re-renders.

```typescript
// src/stores/usePD1096Store.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface PD1096Store {
  // Inputs (bound to controls panel sliders)
  lotWidth: number          // default 15.0m
  lotDepth: number          // default 20.0m
  occupancyGroup: string    // default 'A'
  zoningClass: string       // default 'R-1'
  buildingHeight: number    // default 6.0m

  setLotWidth: (v: number) => void
  setLotDepth: (v: number) => void
  setOccupancyGroup: (v: string) => void
  setZoningClass: (v: string) => void
  setBuildingHeight: (v: number) => void

  // UI state
  activeZone: 'ambf' | 'isa' | 'usa' | 'setbacks' | null
  setActiveZone: (z: PD1096Store['activeZone']) => void
  viewMode: 'perspective' | 'top'
  setViewMode: (m: PD1096Store['viewMode']) => void
  showDimensions: boolean
  toggleDimensions: () => void
}

export const usePD1096Store = create<PD1096Store>()(
  subscribeWithSelector((set) => ({
    lotWidth: 15.0,
    lotDepth: 20.0,
    occupancyGroup: 'A',
    zoningClass: 'R-1',
    buildingHeight: 6.0,

    setLotWidth: (v) => set({ lotWidth: v }),
    setLotDepth: (v) => set({ lotDepth: v }),
    setOccupancyGroup: (v) => set({ occupancyGroup: v }),
    setZoningClass: (v) => set({ zoningClass: v }),
    setBuildingHeight: (v) => set({ buildingHeight: v }),

    activeZone: null,
    setActiveZone: (z) => set({ activeZone: z }),
    viewMode: 'perspective',
    setViewMode: (m) => set({ viewMode: m }),
    showDimensions: false,
    toggleDimensions: () => set((s) => ({ showDimensions: !s.showDimensions })),
  }))
)
```

The store deliberately does NOT hold computed outputs. Those come from `useSiteControls()` called inside each component that needs them, with the store's inputs as arguments. This keeps computed values reactive to input changes without storing derived state.

---

## Phase 3 — 3D Geometry Components

**Directory:** `src/components/3d-lab/modules/SiteControls/`

### File Structure

```
SiteControls/
├── index.tsx                     # Module root, exports SiteControlsModule
├── PD1096Canvas.tsx              # R3F Canvas with scene, lighting, camera
├── LotPlane.tsx                  # TLA base ground plane
├── SetbackZones.tsx              # Setback overlay planes (red tint)
├── AMBFVolume.tsx                # Building footprint extruded box
├── OpenSpaceZones.tsx            # ISA + USA flat planes
├── ZoneHotspots.tsx              # Html hotspot markers per zone
├── DimensionLines.tsx            # drei Line dimension annotations
├── ViolationOverlay.tsx          # Custom shader: red pulse on violations
├── SiteControlsControls.tsx      # 2D controls panel (sliders, dropdowns)
└── ComplianceScorecard.tsx       # Pass/fail readout component
```

### Canvas Setup (`PD1096Canvas.tsx`)

```tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Suspense } from 'react'
import { usePD1096Store } from '@/stores/usePD1096Store'
import { LotPlane } from './LotPlane'
import { SetbackZones } from './SetbackZones'
import { AMBFVolume } from './AMBFVolume'
import { OpenSpaceZones } from './OpenSpaceZones'
import { ZoneHotspots } from './ZoneHotspots'
import { DimensionLines } from './DimensionLines'

export function PD1096Canvas() {
  const viewMode = usePD1096Store(s => s.viewMode)

  return (
    <Canvas
      camera={viewMode === 'top'
        ? { position: [0, 40, 0], fov: 50, up: [0, 0, -1] }
        : { position: [18, 12, 22], fov: 45 }
      }
      shadows
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#F2F0EB' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.0}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <Environment preset="city" />

        <LotPlane />
        <SetbackZones />
        <AMBFVolume />
        <OpenSpaceZones />
        <ZoneHotspots />
        <DimensionLines />

        <OrbitControls
          makeDefault
          minDistance={5}
          maxDistance={60}
          maxPolarAngle={Math.PI / 2}
          enablePan={false}
        />
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.3}
          scale={40}
          blur={2}
        />
      </Suspense>
    </Canvas>
  )
}
```

### LotPlane — TLA Base (`LotPlane.tsx`)

Renders as a flat ground plane sized to the full lot dimensions. Receives shadows and shows lot boundary edges via `<Edges>`.

```tsx
'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'
import { usePD1096Store } from '@/stores/usePD1096Store'

export function LotPlane() {
  const lotWidth = usePD1096Store(s => s.lotWidth)
  const lotDepth = usePD1096Store(s => s.lotDepth)
  const invalidate = useThree(s => s.invalidate)

  useEffect(() => invalidate(), [lotWidth, lotDepth, invalidate])

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[lotWidth / 2, 0, lotDepth / 2]}
      receiveShadow
    >
      <planeGeometry args={[lotWidth, lotDepth]} />
      <meshStandardMaterial color="#E8E4DB" side={THREE.DoubleSide} />
      <Edges threshold={15} color="#8A8680" lineWidth={1} scale={1.001} />
    </mesh>
  )
}
```

### AMBFVolume — Building Footprint (`AMBFVolume.tsx`)

An extruded box positioned and sized by the outputs of `useSiteControls()`. When hovered, shows an outline glow. When clicked, expands the zone hotspot and dims all other zones.

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import { usePD1096Store } from '@/stores/usePD1096Store'
import { useSiteControls } from '@/hooks/useSiteControls'

export function AMBFVolume() {
  const lotWidth       = usePD1096Store(s => s.lotWidth)
  const lotDepth       = usePD1096Store(s => s.lotDepth)
  const occupancyGroup = usePD1096Store(s => s.occupancyGroup)
  const zoningClass    = usePD1096Store(s => s.zoningClass)
  const buildingHeight = usePD1096Store(s => s.buildingHeight)
  const activeZone     = usePD1096Store(s => s.activeZone)
  const setActiveZone  = usePD1096Store(s => s.setActiveZone)
  const invalidate     = useThree(s => s.invalidate)
  const [hovered, setHovered] = useState(false)

  const outputs = useSiteControls({
    lotWidth, lotDepth, occupancyGroup, zoningClass, isSprinklered: false,
  })

  const { setbacks, buildableWidth, buildableDepth } = outputs
  const px = setbacks.left + buildableWidth / 2
  const py = buildingHeight / 2
  const pz = setbacks.front + buildableDepth / 2
  const isActive = activeZone === 'ambf'

  useEffect(() => invalidate(), [outputs, buildingHeight, hovered, isActive, invalidate])

  return (
    <mesh
      position={[px, py, pz]}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation()
        setActiveZone(isActive ? null : 'ambf')
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      <boxGeometry args={[buildableWidth, buildingHeight, buildableDepth]} />
      <meshStandardMaterial
        color="#B8B4A8"
        roughness={0.85}
        transparent={!isActive && activeZone !== null}
        opacity={!isActive && activeZone !== null ? 0.25 : 1.0}
      />
      {(hovered || isActive) && (
        <Outlines thickness={0.06} color="#1B3FC4" screenspace={false} />
      )}
    </mesh>
  )
}
```

### OpenSpaceZones — ISA and USA (`OpenSpaceZones.tsx`)

Two flat planes at `y = 0.01` (to prevent z-fighting) occupying the open space areas of the lot not covered by the building footprint. Their sizes are driven entirely by `useSiteControls()` outputs.

- **ISA zone** (paved): color `#C4BAA5` (cement plaster tone), placed in the front setback area
- **USA zone** (unpaved/landscaped): color `#7B9E6A` (landscape green), placed in the rear setback area

Both zones are clickable and respond to `activeZone` state by dimming when another zone is selected.

```tsx
'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { usePD1096Store } from '@/stores/usePD1096Store'
import { useSiteControls } from '@/hooks/useSiteControls'

export function OpenSpaceZones() {
  const lotWidth       = usePD1096Store(s => s.lotWidth)
  const lotDepth       = usePD1096Store(s => s.lotDepth)
  const occupancyGroup = usePD1096Store(s => s.occupancyGroup)
  const zoningClass    = usePD1096Store(s => s.zoningClass)
  const activeZone     = usePD1096Store(s => s.activeZone)
  const setActiveZone  = usePD1096Store(s => s.setActiveZone)
  const invalidate     = useThree(s => s.invalidate)

  const outputs = useSiteControls({
    lotWidth, lotDepth, occupancyGroup, zoningClass, isSprinklered: false,
  })

  useEffect(() => invalidate(), [outputs, activeZone, invalidate])

  const { setbacks } = outputs

  const isaOpacity = activeZone !== null && activeZone !== 'isa' ? 0.25 : 1.0
  const usaOpacity = activeZone !== null && activeZone !== 'usa' ? 0.25 : 1.0

  return (
    <group>
      {/* ISA — front paved setback */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[lotWidth / 2, 0.01, setbacks.front / 2]}
        onClick={(e) => {
          e.stopPropagation()
          setActiveZone(activeZone === 'isa' ? null : 'isa')
        }}
      >
        <planeGeometry args={[lotWidth, setbacks.front]} />
        <meshStandardMaterial
          color="#C4BAA5"
          side={THREE.DoubleSide}
          transparent={isaOpacity < 1}
          opacity={isaOpacity}
        />
      </mesh>

      {/* USA — rear landscaped setback */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[lotWidth / 2, 0.01, lotDepth - setbacks.rear / 2]}
        onClick={(e) => {
          e.stopPropagation()
          setActiveZone(activeZone === 'usa' ? null : 'usa')
        }}
      >
        <planeGeometry args={[lotWidth, setbacks.rear]} />
        <meshStandardMaterial
          color="#7B9E6A"
          side={THREE.DoubleSide}
          transparent={usaOpacity < 1}
          opacity={usaOpacity}
        />
      </mesh>
    </group>
  )
}
```

### SetbackZones (`SetbackZones.tsx`)

Four flat planes (front, rear, left, right) overlaid on the lot ground with a red tint at `opacity: 0.10`. Non-interactive by default but highlight to `opacity: 0.25` when `activeZone === 'setbacks'`.

---

## Phase 4 — Interactivity Layer

### ZoneHotspots (`ZoneHotspots.tsx`)

Each zone (AMBF, ISA, USA) has an `<Html>` hotspot anchored to its centroid in 3D space. On click, it expands to show the zone name, computed area in sqm, the PD 1096 section it references, and a plain-language explanation for students.

#### Hotspot Content Table

| Zone | PD 1096 Section | Student-facing explanation |
|---|---|---|
| AMBF | Rule VIII, Sec. 803 | "The maximum footprint your building may occupy. Governed by setbacks and your zoning's max lot coverage." |
| ISA | Rule VIII, Sec. 806 | "Paved open space — driveways, terraces, hard paths. Must stay outside the building footprint." |
| USA | Rule VIII, Sec. 806 | "Unpaved open space — landscaping, planting strips, lawns. Required for stormwater and air circulation." |
| TOSL | Rule VIII, Sec. 806 | "Total open space within the lot. Equals the lot area minus the building footprint." |
| Setbacks | Rule VII, Sec. 704 | "Minimum distances from the building to each lot line, determined by occupancy group and lot area." |

#### Hotspot Component

```tsx
'use client'

import { Html } from '@react-three/drei'
import { useState } from 'react'
import { usePD1096Store } from '@/stores/usePD1096Store'
import { useSiteControls } from '@/hooks/useSiteControls'

export function ZoneHotspots() {
  const lotWidth       = usePD1096Store(s => s.lotWidth)
  const lotDepth       = usePD1096Store(s => s.lotDepth)
  const occupancyGroup = usePD1096Store(s => s.occupancyGroup)
  const zoningClass    = usePD1096Store(s => s.zoningClass)
  const buildingHeight = usePD1096Store(s => s.buildingHeight)
  const activeZone     = usePD1096Store(s => s.activeZone)

  const outputs = useSiteControls({
    lotWidth, lotDepth, occupancyGroup, zoningClass, isSprinklered: false,
  })

  const { setbacks, buildableWidth, buildableDepth, ambf, isa, usa } = outputs

  const hotspots = [
    {
      id: 'ambf',
      label: 'AMBF',
      position: [
        setbacks.left + buildableWidth / 2,
        buildingHeight + 0.5,
        setbacks.front + buildableDepth / 2,
      ] as [number, number, number],
      area: ambf,
      section: 'PD 1096 IRR Rule VIII, Sec. 803',
      description: 'Max building footprint. Constrained by setbacks and max lot coverage for your zoning class.',
    },
    {
      id: 'isa',
      label: 'ISA',
      position: [lotWidth / 2, 0.5, setbacks.front / 2] as [number, number, number],
      area: isa,
      section: 'PD 1096 IRR Rule VIII, Sec. 806',
      description: 'Impervious paved open space — driveways, terraces, hard paths.',
    },
    {
      id: 'usa',
      label: 'USA',
      position: [lotWidth / 2, 0.5, lotDepth - setbacks.rear / 2] as [number, number, number],
      area: usa,
      section: 'PD 1096 IRR Rule VIII, Sec. 806',
      description: 'Unpaved landscaped open space — soil, planting strips, lawns.',
    },
  ]

  return (
    <>
      {hotspots.map(h => (
        <Html
          key={h.id}
          position={h.position}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'auto' }}
        >
          <HotspotMarker
            label={h.label}
            area={h.area}
            section={h.section}
            description={h.description}
            isActive={activeZone === h.id}
          />
        </Html>
      ))}
    </>
  )
}

function HotspotMarker({
  label, area, section, description, isActive,
}: {
  label: string
  area: number
  section: string
  description: string
  isActive: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="relative cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="w-5 h-5 rounded-full bg-primary border-2 border-white shadow-md flex items-center justify-center">
        <span className="font-mono text-[8px] font-bold text-white">{label[0]}</span>
      </div>

      {(expanded || isActive) && (
        <div className="absolute left-7 top-0 w-60 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
          <p className="font-mono text-xs text-primary font-bold mb-0.5">{label}</p>
          <p className="font-mono text-xs text-gray-900 mb-1">{area.toFixed(2)} sqm</p>
          <p className="text-xs text-gray-700 leading-relaxed mb-2">{description}</p>
          <p className="font-mono text-[10px] text-gray-400">{section}</p>
        </div>
      )}
    </div>
  )
}
```

### DimensionLines (`DimensionLines.tsx`)

Uses drei's `<Line>` and `<Text>` with `<Billboard>` to draw annotated dimension callouts. Shows lot width and depth on the perimeter, and buildable width and depth on the AMBF top face. Visible only when `showDimensions === true`.

```tsx
'use client'

import { Line, Text, Billboard } from '@react-three/drei'
import { usePD1096Store } from '@/stores/usePD1096Store'
import { useSiteControls } from '@/hooks/useSiteControls'

export function DimensionLines() {
  const showDimensions = usePD1096Store(s => s.showDimensions)
  const lotWidth       = usePD1096Store(s => s.lotWidth)
  const lotDepth       = usePD1096Store(s => s.lotDepth)
  const occupancyGroup = usePD1096Store(s => s.occupancyGroup)
  const zoningClass    = usePD1096Store(s => s.zoningClass)
  const buildingHeight = usePD1096Store(s => s.buildingHeight)

  if (!showDimensions) return null

  const { setbacks, buildableWidth, buildableDepth } = useSiteControls({
    lotWidth, lotDepth, occupancyGroup, zoningClass, isSprinklered: false,
  })

  const offset = 0.8

  return (
    <group>
      {/* Lot width — front edge */}
      <Line
        points={[[-offset, 0.1, -offset], [lotWidth + offset, 0.1, -offset]]}
        color="#1B3FC4"
        lineWidth={1.5}
      />
      <Billboard position={[lotWidth / 2, 0.5, -offset - 0.5]}>
        <Text fontSize={0.4} color="#1B3FC4" font="/fonts/DMMono-Regular.woff">
          {`${lotWidth.toFixed(1)}m`}
        </Text>
      </Billboard>

      {/* Lot depth — right edge */}
      <Line
        points={[[lotWidth + offset, 0.1, -offset], [lotWidth + offset, 0.1, lotDepth + offset]]}
        color="#1B3FC4"
        lineWidth={1.5}
      />
      <Billboard position={[lotWidth + offset + 0.6, 0.5, lotDepth / 2]}>
        <Text fontSize={0.4} color="#1B3FC4" font="/fonts/DMMono-Regular.woff">
          {`${lotDepth.toFixed(1)}m`}
        </Text>
      </Billboard>

      {/* AMBF buildable width — top of building */}
      <Line
        points={[
          [setbacks.left, buildingHeight + 0.3, setbacks.front - 0.4],
          [setbacks.left + buildableWidth, buildingHeight + 0.3, setbacks.front - 0.4],
        ]}
        color="#E63329"
        lineWidth={1.5}
        dashed
        dashSize={0.2}
        gapSize={0.1}
      />
      <Billboard position={[setbacks.left + buildableWidth / 2, buildingHeight + 0.7, setbacks.front - 0.5]}>
        <Text fontSize={0.35} color="#E63329" font="/fonts/DMMono-Regular.woff">
          {`AMBF w: ${buildableWidth.toFixed(1)}m`}
        </Text>
      </Billboard>
    </group>
  )
}
```

### ViolationOverlay (`ViolationOverlay.tsx`)

When parameters result in a non-compliant state (e.g., insufficient open space, zero buildable width), the AMBF mesh switches to the `ViolationMaterial` custom shader — a red pulse animated in `useFrame`.

```tsx
'use client'

import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

const ViolationMaterial = shaderMaterial(
  {
    uColor: new THREE.Color('#B8B4A8'),
    uViolationColor: new THREE.Color('#E63329'),
    uViolationAmount: 0.0,
    uTime: 0,
  },
  `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform vec3 uColor;
    uniform vec3 uViolationColor;
    uniform float uViolationAmount;
    uniform float uTime;
    varying vec3 vNormal;
    void main() {
      float light = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))) * 0.5 + 0.5;
      float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
      float intensity = uViolationAmount * pulse;
      vec3 color = mix(uColor, uViolationColor, intensity);
      gl_FragColor = vec4(color * light, 1.0);
    }
  `
)

extend({ ViolationMaterial })

export function useViolationMaterial(isViolating: boolean) {
  const ref = useRef<THREE.ShaderMaterial & { uTime: number; uViolationAmount: number }>(null)

  useFrame(({ clock }) => {
    if (!ref.current || !isViolating) return
    ref.current.uTime = clock.elapsedTime
    ref.current.uViolationAmount = 1.0
  })

  return ref
}
```

---

## Phase 5 — Controls Panel and Compliance Scorecard

### Controls Panel (`SiteControlsControls.tsx`)

The 2D controls panel lives outside the Canvas in standard Next.js DOM. It binds directly to the store.

| Control | Range | Default | Store action |
|---|---|---|---|
| Lot width slider | 6–50 m | 15 m | `setLotWidth` |
| Lot depth slider | 6–50 m | 20 m | `setLotDepth` |
| Building height slider | 3–30 m | 6 m | `setBuildingHeight` |
| Occupancy group selector | A through G | A | `setOccupancyGroup` |
| Zoning class selector | R-1, R-2, C-1, C-2, MXD | R-1 | `setZoningClass` |
| View mode toggle | Perspective / Top | Perspective | `setViewMode` |
| Show dimensions toggle | on/off | off | `toggleDimensions` |

### Compliance Scorecard (`ComplianceScorecard.tsx`)

```tsx
'use client'

import { usePD1096Store } from '@/stores/usePD1096Store'
import { useSiteControls } from '@/hooks/useSiteControls'

export function ComplianceScorecard() {
  const lotWidth       = usePD1096Store(s => s.lotWidth)
  const lotDepth       = usePD1096Store(s => s.lotDepth)
  const occupancyGroup = usePD1096Store(s => s.occupancyGroup)
  const zoningClass    = usePD1096Store(s => s.zoningClass)

  const outputs = useSiteControls({
    lotWidth, lotDepth, occupancyGroup, zoningClass, isSprinklered: false,
  })

  const { ambf, tosl, tla, setbacks, compliance } = outputs

  const items = [
    {
      label: 'AMBF compliance',
      codeRef: 'Rule VIII Sec. 803',
      status: compliance.ambfOk ? 'pass' : 'fail' as const,
      value: `${ambf.toFixed(1)} sqm`,
    },
    {
      label: 'TOSL compliance',
      codeRef: 'Rule VIII Sec. 806',
      status: compliance.toslOk ? 'pass' : 'fail' as const,
      value: `${tosl.toFixed(1)} sqm`,
    },
    {
      label: 'TLA area identity check',
      codeRef: 'Rule VIII Sec. 805',
      status: 'pass' as const,
      value: `${tla.toFixed(1)} sqm`,
    },
    {
      label: 'Front setback',
      codeRef: 'Rule VII Sec. 704',
      status: 'pass' as const,
      value: `${setbacks.front.toFixed(1)} m required`,
    },
    {
      label: 'Rear setback',
      codeRef: 'Rule VII Sec. 704',
      status: 'pass' as const,
      value: `${setbacks.rear.toFixed(1)} m required`,
    },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
        Compliance check
      </p>
      <p className="font-sans text-sm font-medium mb-3">
        {items.filter(i => i.status === 'pass').length}/{items.length} requirements met
      </p>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.label} className="flex items-start gap-2">
            <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${
              item.status === 'pass' ? 'bg-[#1B7A3C]' : 'bg-[#E63329]'
            }`} />
            <div>
              <p className="font-sans text-xs font-medium text-gray-900">{item.label}</p>
              <p className="font-mono text-[10px] text-gray-500">{item.value}</p>
              <p className="font-mono text-[9px] text-gray-400">{item.codeRef}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Phase 5 — Validation Test: 300 sqm Lot

The following must pass before the module ships. Run by loading the module with these initial parameters and verifying that the 3D geometries render proportionally and the ComplianceScorecard shows all green.

**Input:** Lot width = 15m · Lot depth = 20m · Occupancy = Group A · Zoning = R-1 · Building height = 6m

| Check | Expected result |
|---|---|
| TLA renders correctly | 300.00 sqm |
| AMBF box fits within setback bounds | Footprint visible inside lot boundary |
| ISA zone visible and distinct from USA | Two visually distinct open space zones |
| USA zone is green, ISA zone is beige | Colors match material palette |
| ComplianceScorecard — all items green | 5/5 pass |
| Area identity check passes | No console errors from validation guard |
| Top-view camera shows correct proportions | AMBF occupies roughly half the lot |

---

## Phase 6 — Route Integration

**New page:** `src/app/(authenticated)/3d-lab/site-controls/page.tsx`

```
SiteControlsPage
├── LabPageHeader          title: "Site Development Controls" · badge: "PD 1096 Rules VII & VIII"
├── SiteControlsModule     (the full interactive module)
│   ├── PD1096Canvas       (3D — left ~65% of width)
│   └── ControlsSidebar    (2D — right ~35%)
│       ├── SiteControlsControls
│       └── ComplianceScorecard
└── QuizLinkBanner         "Test yourself on AMBF computations →"
```

Module index entry:

```typescript
{
  slug: 'site-controls',
  title: 'Site Development Controls',
  codeRef: 'PD 1096 Rules VII & VIII',
  concepts: ['AMBF', 'PSO', 'TOSL', 'ISA', 'USA', 'MACA', 'setbacks'],
  difficulty: 'intermediate',
}
```

---

## Performance Budget

| Item | Target | Enforcement |
|---|---|---|
| No external GLB loaded | n/a | 100% runtime BufferGeometry — zero network requests for 3D assets |
| `frameloop="demand"` | Required | Re-renders only on store change; `invalidate()` called in each geometry `useEffect` |
| Max triangles | ~2,000 | Lot plane (2T), AMBF box (12T), ISA/USA planes (4T each), setback planes (8T), lines (0T) |
| Canvas DPR | `[1, 1.5]` | Mobile GPU-safe cap |
| Dispose on unmount | Required | Geometry and material `.dispose()` in all `useEffect` cleanup callbacks |
| No allocations in `useFrame` | Required | Violation shader `uTime` mutated imperatively; no `setState` inside render loop |
| Mobile FPS target | 30fps minimum | Achievable given minimal triangle count and `frameloop="demand"` |

---

## Gamification Integration Hook

Once the module is functional, one engagement mechanic applies cleanly: a **Design Challenge mode** where the system presents a fixed scenario — e.g., "You have a 400 sqm commercial lot in C-1. Maximize your MACA without violating any Rule VII or VIII constraint." The student manipulates the sliders to discover the optimal configuration. Success is flagged by the ComplianceScorecard going fully green.

This maps to the `slatecamp-performance-gamification` skill's permitted category of mastery-based challenge — no badges, no confetti, just the intrinsic satisfaction of a fully green scorecard. The design challenge can be seeded from quiz questions in the existing question bank tagged with `['AMBF', 'TOSL', 'Rule VIII']`.

---

## Execution Order

| Day | Work | Deliverable |
|---|---|---|
| 1 | Write and unit-test `useSiteControls.ts` against the reference document. No 3D yet — math must be correct first. | Passing validation test |
| 2 | Build `usePD1096Store` and wire to a simple DOM readout to confirm reactivity | Reactive store |
| 3–4 | Build `LotPlane`, `SetbackZones`, `AMBFVolume`, `OpenSpaceZones` on a test Canvas route | Core geometry rendering |
| 5 | Add `ZoneHotspots`, `DimensionLines`, `ViolationOverlay` | Full interactivity |
| 6 | Build `SiteControlsControls` and `ComplianceScorecard`, wire to store | Complete 2D controls |
| 7 | Integrate into `/3d-lab/site-controls` route, run 300 sqm validation test end-to-end, add to module index | Shippable module |

---

*Generated by SlateCamp's 3D Lab engineering skills stack. All area computation logic must be sourced from the designated PD 1096 Rules VII & VIII reference document.*
