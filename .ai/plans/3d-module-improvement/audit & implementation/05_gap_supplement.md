# 05 — Gap Supplement: Missing Specifications

**Supplements:** `01_master_architecture.md`, `02_phase_tracker.md`, `03_regulatory_ledger.md`, `04_ux_ui_gatekeeper.md`
**Purpose:** Fills the six architectural gaps not covered in existing documents. Read this alongside the master architecture — it does not supersede it.
**Status:** ACTIVE — read before implementing Phase 3, Wave 1, or any new template type.

---

## GAP 1 — DOM Overlay System: Component API Specifications

Phase 3 in `02_phase_tracker.md` lists the files to create but does not specify their APIs. This section provides the concrete TypeScript contracts.

### `useOverlayStore.ts`

```ts
import { create } from 'zustand'
import * as THREE from 'three'

export interface OverlayItem {
  id: string
  worldPosition: THREE.Vector3    // Set by scene component each frame
  type: 'label' | 'hotspot' | 'violation' | 'dimension' | 'area-tag'
  payload: LabelPayload | HotspotPayload | ViolationPayload | DimensionPayload
  visible: boolean                // Scene can hide without removing
  zIndex?: number                 // Stacking order (default: 10)
}

export interface LabelPayload {
  text: string
  subtext?: string
  codeRef?: string               // e.g., "PD 1096 IRR Rule VIII"
}

export interface HotspotPayload {
  title: string
  body: string
  codeRef?: string
  isOpen: boolean
}

export interface ViolationPayload {
  law: string
  section: string
  message: string
  severity: 'error' | 'warning'
}

export interface DimensionPayload {
  value: number                  // Always in meters internally
  unit: 'mm' | 'm'
  label?: string                 // e.g., "MIN. CLEAR WIDTH"
  isViolating: boolean
}

interface OverlayStore {
  items: Map<string, OverlayItem>
  cameraRef: THREE.Camera | null

  // Scene components call these
  upsertItem: (item: OverlayItem) => void
  removeItem: (id: string) => void
  clearAll: () => void
  setCameraRef: (camera: THREE.Camera) => void

  // UI components call these
  openHotspot: (id: string) => void
  closeHotspot: (id: string) => void
  closeAllHotspots: () => void
}

export const useOverlayStore = create<OverlayStore>((set, get) => ({
  items: new Map(),
  cameraRef: null,

  upsertItem: (item) => set(s => {
    const next = new Map(s.items)
    next.set(item.id, item)
    return { items: next }
  }),

  removeItem: (id) => set(s => {
    const next = new Map(s.items)
    next.delete(id)
    return { items: next }
  }),

  clearAll: () => set({ items: new Map() }),
  setCameraRef: (camera) => set({ cameraRef: camera }),

  openHotspot: (id) => set(s => {
    const item = s.items.get(id)
    if (!item || item.type !== 'hotspot') return s
    const next = new Map(s.items)
    next.set(id, {
      ...item,
      payload: { ...(item.payload as HotspotPayload), isOpen: true }
    })
    return { items: next }
  }),

  closeHotspot: (id) => set(s => {
    const item = s.items.get(id)
    if (!item || item.type !== 'hotspot') return s
    const next = new Map(s.items)
    next.set(id, {
      ...item,
      payload: { ...(item.payload as HotspotPayload), isOpen: false }
    })
    return { items: next }
  }),

  closeAllHotspots: () => set(s => {
    const next = new Map(s.items)
    next.forEach((item, id) => {
      if (item.type === 'hotspot') {
        next.set(id, { ...item, payload: { ...(item.payload as HotspotPayload), isOpen: false } })
      }
    })
    return { items: next }
  }),
}))
```

### `useWorldToScreen.ts`

```ts
import { useCallback } from 'react'
import * as THREE from 'three'
import { useOverlayStore } from '../stores/useOverlayStore'

interface ScreenPosition {
  x: number          // pixels from left
  y: number          // pixels from top
  visible: boolean   // false if behind camera or outside frustum
}

export function useWorldToScreen() {
  const cameraRef = useOverlayStore(s => s.cameraRef)

  return useCallback((
    worldPosition: THREE.Vector3,
    containerWidth: number,
    containerHeight: number
  ): ScreenPosition => {
    if (!cameraRef) return { x: 0, y: 0, visible: false }

    const projected = worldPosition.clone().project(cameraRef)

    // Frustum check — z > 1 means behind camera
    if (projected.z > 1) return { x: 0, y: 0, visible: false }

    // NDC [-1, 1] → pixel coordinates
    const x = (projected.x * 0.5 + 0.5) * containerWidth
    const y = (-projected.y * 0.5 + 0.5) * containerHeight

    // Margin check — hide items near edge to prevent clipping
    const margin = 40
    const visible =
      x > margin &&
      x < containerWidth - margin &&
      y > margin &&
      y < containerHeight - margin

    return { x, y, visible }
  }, [cameraRef])
}
```

### `CameraSync.tsx` (the ONLY new R3F-side component)

```tsx
'use client'

// NULL-RENDER component. Mounts inside <Canvas>.
// Writes camera ref to useOverlayStore every frame.
// This is the ENTIRE bridge between 3D and DOM overlay system.

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useOverlayStore } from '../../stores/useOverlayStore'

export function CameraSync() {
  const camera = useThree(s => s.camera)
  const setCameraRef = useOverlayStore(s => s.setCameraRef)

  useEffect(() => {
    setCameraRef(camera)
    return () => setCameraRef(null)
  }, [camera, setCameraRef])

  return null  // Renders nothing
}
```

### `DOMOverlayLayer.tsx`

```tsx
'use client'

// Sibling to <Canvas>. Reads overlay items from store,
// projects their world positions to screen coords,
// and renders Tailwind-styled overlays at those positions.
// Updates via requestAnimationFrame to stay in sync with renderer.

import { useEffect, useRef, useState } from 'react'
import { useOverlayStore } from '../../stores/useOverlayStore'
import { useWorldToScreen } from '../../hooks/useWorldToScreen'
import { LabelOverlay } from './LabelOverlay'
import { HotspotCard } from './HotspotCard'
import { ViolationBadge } from './ViolationBadge'
import { DimensionLabel } from './DimensionLabel'

interface DOMOverlayLayerProps {
  className?: string
}

export function DOMOverlayLayer({ className }: DOMOverlayLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const items = useOverlayStore(s => s.items)
  const worldToScreen = useWorldToScreen()
  const [, forceUpdate] = useState(0)

  // Sync with render loop via rAF
  useEffect(() => {
    let rafId: number
    const loop = () => {
      forceUpdate(n => n + 1)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const container = containerRef.current
  const w = container?.clientWidth ?? 0
  const h = container?.clientHeight ?? 0

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-live="polite"            // Accessible announcements for screen readers
    >
      {Array.from(items.values()).map(item => {
        if (!item.visible) return null
        const { x, y, visible } = worldToScreen(item.worldPosition, w, h)
        if (!visible) return null

        const style: React.CSSProperties = {
          position: 'absolute',
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
          pointerEvents: item.type === 'hotspot' ? 'auto' : 'none',
        }

        switch (item.type) {
          case 'label':
            return <LabelOverlay key={item.id} style={style} payload={item.payload as any} />
          case 'hotspot':
            return <HotspotCard key={item.id} id={item.id} style={style} payload={item.payload as any} />
          case 'violation':
            return <ViolationBadge key={item.id} style={style} payload={item.payload as any} />
          case 'dimension':
            return <DimensionLabel key={item.id} style={style} payload={item.payload as any} />
          default:
            return null
        }
      })}
    </div>
  )
}
```

### `HotspotCard.tsx` (pointer-events: auto — only interactive overlay)

```tsx
'use client'

import { useOverlayStore } from '../../stores/useOverlayStore'
import type { HotspotPayload } from '../../stores/useOverlayStore'

interface HotspotCardProps {
  id: string
  style: React.CSSProperties
  payload: HotspotPayload
}

export function HotspotCard({ id, style, payload }: HotspotCardProps) {
  const openHotspot = useOverlayStore(s => s.openHotspot)
  const closeHotspot = useOverlayStore(s => s.closeHotspot)

  return (
    <div style={style}>
      {/* Trigger sphere */}
      <button
        onClick={() => payload.isOpen ? closeHotspot(id) : openHotspot(id)}
        aria-expanded={payload.isOpen}
        aria-label={payload.title}
        className="w-7 h-7 rounded-full bg-[#1E3A5F] border-2 border-white shadow-lg
                   flex items-center justify-center cursor-pointer
                   hover:bg-[#2a4f82] transition-colors
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F5A623]"
      >
        <span className="text-white font-mono text-[10px] font-bold">i</span>
      </button>

      {/* Expanded card — rendered above the sphere */}
      {payload.isOpen && (
        <div
          className="absolute bottom-9 left-1/2 -translate-x-1/2 w-56
                     bg-white dark:bg-[#1A1A2E] rounded-lg shadow-xl
                     border border-gray-100 dark:border-gray-800 p-3 z-50"
          role="tooltip"
        >
          <p className="font-sans text-xs font-semibold text-[#1A1A2E] dark:text-white mb-1">
            {payload.title}
          </p>
          <p className="font-sans text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
            {payload.body}
          </p>
          {payload.codeRef && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded bg-[#1E3A5F]/10
                             font-mono text-[9px] text-[#1E3A5F] dark:text-blue-400">
              {payload.codeRef}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
```

### `ViolationBadge.tsx`

```tsx
'use client'

import type { ViolationPayload } from '../../stores/useOverlayStore'

interface ViolationBadgeProps {
  style: React.CSSProperties
  payload: ViolationPayload
}

export function ViolationBadge({ style, payload }: ViolationBadgeProps) {
  const isError = payload.severity === 'error'
  return (
    <div
      style={style}
      role="alert"
      aria-label={`${payload.severity}: ${payload.message}`}
      className={`px-2 py-1 rounded text-[10px] font-mono font-semibold shadow-md
                  whitespace-nowrap
                  ${isError
                    ? 'bg-[#E74C3C] text-white'
                    : 'bg-[#F5A623] text-[#1A1A2E]'
                  }`}
    >
      {payload.message}
    </div>
  )
}
```

### `DimensionLabel.tsx`

```tsx
'use client'

import type { DimensionPayload } from '../../stores/useOverlayStore'

interface DimensionLabelProps {
  style: React.CSSProperties
  payload: DimensionPayload
}

export function DimensionLabel({ style, payload }: DimensionLabelProps) {
  const displayValue = payload.unit === 'mm'
    ? `${Math.round(payload.value * 1000)} mm`
    : `${payload.value.toFixed(2)} m`

  return (
    <div
      style={style}
      className={`flex flex-col items-center gap-0.5
                  ${payload.isViolating ? 'text-[#E74C3C]' : 'text-[#1A1A2E] dark:text-white'}`}
    >
      {payload.label && (
        <span className="font-mono text-[8px] uppercase tracking-widest opacity-70">
          {payload.label}
        </span>
      )}
      <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded
                        bg-white/90 dark:bg-black/80 shadow-sm
                        ${payload.isViolating ? 'ring-1 ring-[#E74C3C]' : ''}`}>
        {displayValue}
      </span>
    </div>
  )
}
```

---

## GAP 2 — UX Interaction Standards (3D-Specific)

These standards are not in `04_ux_ui_gatekeeper.md` and must be followed by every module builder.

### 2.1 Camera Presets (`camera-presets.ts`)

Every module config specifies a `cameraPreset`. This file is created in Phase 8 but its values must be agreed now so Wave 1 configs can reference them.

```ts
// src/features/3d-lab/config/camera-presets.ts

export type CameraPresetId =
  | 'isometric-building'   // 3/4 view, typical for building massing
  | 'isometric-site'       // Higher elevation for site plans
  | 'top-down'             // Pure plan view (orthographic preferred)
  | 'front-elevation'      // Direct front face, parallel projection
  | 'section-cut'          // Side view for cross-sections
  | 'interior-room'        // Low angle, inside a room
  | 'detail-closeup'       // Tight on a joint, connection, or detail

export interface CameraPreset {
  id: CameraPresetId
  position: [number, number, number]   // Three.js world units
  target: [number, number, number]     // OrbitControls target
  fov: number                          // 0 = orthographic
  minDistance: number
  maxDistance: number
  minPolarAngle: number                // radians
  maxPolarAngle: number                // radians
  enablePan: boolean
  dampingFactor: number
}

export const CAMERA_PRESETS: Record<CameraPresetId, CameraPreset> = {
  'isometric-building': {
    id: 'isometric-building',
    position: [8, 6, 8],
    target: [0, 0, 0],
    fov: 45,
    minDistance: 3,
    maxDistance: 25,
    minPolarAngle: 0.2,
    maxPolarAngle: Math.PI / 2.2,      // Never go below horizon
    enablePan: true,
    dampingFactor: 0.05,
  },
  'isometric-site': {
    id: 'isometric-site',
    position: [15, 12, 15],
    target: [0, 0, 0],
    fov: 40,
    minDistance: 8,
    maxDistance: 60,
    minPolarAngle: 0.1,
    maxPolarAngle: Math.PI / 2.4,
    enablePan: true,
    dampingFactor: 0.05,
  },
  'top-down': {
    id: 'top-down',
    position: [0, 20, 0.001],          // Slight offset prevents gimbal lock
    target: [0, 0, 0],
    fov: 0,                            // Orthographic
    minDistance: 5,
    maxDistance: 50,
    minPolarAngle: 0,
    maxPolarAngle: 0.3,                // Lock near top-down
    enablePan: true,
    dampingFactor: 0.08,
  },
  'front-elevation': {
    id: 'front-elevation',
    position: [0, 2, 12],
    target: [0, 2, 0],
    fov: 0,                            // Orthographic
    minDistance: 4,
    maxDistance: 25,
    minPolarAngle: Math.PI / 2 - 0.1,
    maxPolarAngle: Math.PI / 2 + 0.1,  // Lock horizontal
    enablePan: true,
    dampingFactor: 0.08,
  },
  'section-cut': {
    id: 'section-cut',
    position: [-12, 2, 0],
    target: [0, 2, 0],
    fov: 0,
    minDistance: 4,
    maxDistance: 25,
    minPolarAngle: Math.PI / 2 - 0.1,
    maxPolarAngle: Math.PI / 2 + 0.1,
    enablePan: true,
    dampingFactor: 0.08,
  },
  'interior-room': {
    id: 'interior-room',
    position: [3, 1.4, 3],
    target: [0, 1.2, 0],
    fov: 60,
    minDistance: 1,
    maxDistance: 10,
    minPolarAngle: 0.5,
    maxPolarAngle: Math.PI / 1.8,
    enablePan: false,                  // Prevents user escaping room bounds
    dampingFactor: 0.04,
  },
  'detail-closeup': {
    id: 'detail-closeup',
    position: [0.8, 0.6, 0.8],
    target: [0, 0.3, 0],
    fov: 50,
    minDistance: 0.2,
    maxDistance: 3,
    minPolarAngle: 0.2,
    maxPolarAngle: Math.PI / 1.8,
    enablePan: true,
    dampingFactor: 0.04,
  },
}
```

### 2.2 Camera Animation on Module Load

**Rule:** Every module performs a camera ease-in on first mount. This serves as an implicit "you can orbit this" affordance.

```ts
// Pattern: use useSpring from @react-spring/three (already in R3F ecosystem)
// OR: use lerp in useFrame for 60 frames then suspend

// Preferred — simple lerp, no extra dependency:
useFrame(({ camera }, delta) => {
  if (animationComplete) return

  camera.position.lerp(targetPosition, delta * 2.5)
  camera.lookAt(targetLookAt)

  if (camera.position.distanceTo(targetPosition) < 0.01) {
    setAnimationComplete(true)
    // useFrame stops running (frameloop="demand" resumes idle)
  }
})
```

**Duration target:** 600–800ms to resting position. Never instant snap, never longer than 1 second.

### 2.3 Hotspot Interaction Rules

| Rule | Standard |
|------|----------|
| Trigger | Click only (not hover — hover is unreliable on touch) |
| Trigger size | 28×28px minimum in screen space (enforced via CSS `min-w-7 min-h-7`) |
| Max simultaneous open hotspots | 1 — opening a new one closes all others |
| Close behavior | Click the sphere again, or click anywhere on the 2D overlay layer |
| Max hotspots per module | 8 — beyond this, consider a BuildStep walkthrough instead |
| Hotspot position budget | Update world position each frame only if geometry is parametric. For static geometry, write position once on mount. |
| Accessibility | Each hotspot sphere is a `<button>` with `aria-expanded` and `aria-label` |

### 2.4 Parametric Slider Standards

| Rule | Standard |
|------|----------|
| Position | Always in `GenericControlPanel` or `LabPanelLayout` sidebar — never floating over 3D |
| Unit display | Show value in **mm** for dimensions < 2m, **m** for ≥ 2m — toggleable |
| Min/max markers | Show code minimum and maximum as tick marks on the slider track |
| Real-time update | Geometry updates on every slider move (no debounce) — but use `useMemo` to prevent over-computation |
| Violation feedback | Trigger immediately when value crosses threshold — do NOT wait for release |
| Visual connection | When a slider is focused/dragging, the corresponding 3D dimension label pulses (ring-2 ring-[#1E3A5F]) |
| Default value | Always the code-minimum value (most educational — shows the boundary condition) |
| Reset button | Every parametric module has a "Reset to minimum" button |

### 2.5 Mobile UX Standards

| Concern | Standard |
|---------|----------|
| Canvas container | `touch-action: none` on the Canvas container div (prevents page scroll during orbit) |
| Orbit on mobile | One-finger orbit enabled. Two-finger pinch = zoom. Two-finger pan disabled (conflicts with scroll) |
| OrbitControls config mobile | `enableDamping={false}` on mobile (damping causes lag on low-power devices) |
| DPR on mobile | `dpr={[1, 1.25]}` — never exceed 1.25 on mobile |
| Control panel on mobile | Bottom sheet pattern. Collapsed by default. Drag-up to expand. |
| Hotspot tap targets | Minimum 44×44px in screen space (Apple HIG / WCAG 2.5.5) |
| Canvas minimum height | `min-h-[280px]` on mobile to prevent unusably small 3D viewport |
| Canvas aspect ratio | `aspect-[4/3]` on mobile, unconstrained on desktop |

**Mobile detection pattern** (no user-agent sniffing — use pointer type):
```ts
const isTouchPrimary = window.matchMedia('(pointer: coarse)').matches
```

### 2.6 Progressive Disclosure on Module Load

```
Frame 1-30:   Camera animating to resting position
Frame 30:     Static geometry fully visible, no annotations
Frame 30+300ms: First coach mark appears: "Drag to orbit"
Frame 30+1500ms: Coach mark fades
Frame 30+2000ms: Hotspot spheres fade in (staggered, 100ms apart)
User first interaction: All coach marks immediately hide
```

This is handled by `OnboardingFlow` (already exists — keep as-is per master architecture).

---

## GAP 3 — Module Config Authoring Guide

No document explains how to write a new module config. Every Wave builder needs this.

### The Anatomy of a Module Config

```ts
// src/features/3d-lab/config/modules/pd-1096/mod-101-staircase.ts

import { PD_1096 } from '../../constants/pd-1096'
import type { ParametricModuleConfig } from '../../../types/templates'

export const MOD_101_STAIRCASE: ParametricModuleConfig = {
  // ─── Identity ───────────────────────────────────────────────────────────────
  id: 'mod-101-staircase',
  template: 'parametric',
  title: 'Staircase Geometry Configurator',
  subtitle: 'PD 1096 IRR Rule VIII §801',
  categoryId: 'pd-1096',
  tags: ['stairs', 'egress', 'PD1096', 'rule8'],

  // ─── Camera ─────────────────────────────────────────────────────────────────
  cameraPreset: 'isometric-building',   // Must be a valid CameraPresetId

  // ─── Parameters ─────────────────────────────────────────────────────────────
  // Each parameter MUST have a citation if classification is 'code-mandated'
  parameters: [
    {
      id: 'rise',
      label: 'Riser Height',
      unit: 'mm',
      min: 100,
      max: 250,
      default: PD_1096.STAIRS.RISE_MAX,    // Import from shared constants — never hardcode
      step: 5,
      citation: {
        law: 'PD 1096',
        section: 'IRR Rule VIII §801',
        description: 'Maximum riser height for main stairs',
        value: '200mm max',
        classification: 'code-mandated',
        verified: '2026-04-08',
      },
    },
    {
      id: 'run',
      label: 'Tread Depth',
      unit: 'mm',
      min: 250,
      max: 400,
      default: PD_1096.STAIRS.RUN_MIN,
      step: 5,
      citation: {
        law: 'PD 1096',
        section: 'IRR Rule VIII §801',
        description: 'Minimum tread depth',
        value: '250mm min',
        classification: 'code-mandated',
        verified: '2026-04-08',
      },
    },
  ],

  // ─── Violations ─────────────────────────────────────────────────────────────
  // Checked in real-time. Each violation MUST cite the law.
  violations: [
    {
      id: 'rise-exceeds-max',
      parameterId: 'rise',
      condition: 'greaterThan',
      threshold: PD_1096.STAIRS.RISE_MAX,
      severity: 'error',
      message: `Riser exceeds 200mm max`,
      citation: { law: 'PD 1096', section: 'IRR Rule VIII §801', classification: 'code-mandated' },
    },
    {
      id: 'run-below-min',
      parameterId: 'run',
      condition: 'lessThan',
      threshold: PD_1096.STAIRS.RUN_MIN,
      severity: 'error',
      message: `Tread below 250mm min`,
      citation: { law: 'PD 1096', section: 'IRR Rule VIII §801', classification: 'code-mandated' },
    },
  ],

  // ─── Hotspots ───────────────────────────────────────────────────────────────
  // worldPosition is a RELATIVE anchor — the scene renderer places these
  // relative to the parametric geometry origin
  hotspots: [
    {
      id: 'hs-rise',
      title: 'Riser Height',
      body: 'The vertical face of each step. PD 1096 limits this to 200mm maximum to prevent tripping.',
      codeRef: 'PD 1096 IRR Rule VIII §801',
      anchorId: 'riser-face-01',     // Scene renderer finds the named mesh anchor
    },
  ],

  // ─── Meta ────────────────────────────────────────────────────────────────────
  difficultyLevel: 'medium',          // 'easy' | 'medium' | 'hard'
  hasQuiz: true,
  estimatedMinutes: 5,
}
```

### Rules for New Config Authors

1. **Never hardcode a dimension.** Import from `config/constants/{law}.ts`.
2. **Every `code-mandated` parameter must have a `citation` with `verified` date.**
3. **`default` must equal the code minimum** (not the "typical" value — students learn the boundary).
4. **Add a `violation` for every min and max.** If a parameter has both a min and max, it needs two violation rules.
5. **`cameraPreset` must come from `CAMERA_PRESETS` — no custom positions in module configs.**
6. **Register the config** in `config/registry/cat-{categoryId}.ts` after creating it.

---

## GAP 4 — Shared Constants File Structure

`03_regulatory_ledger.md` specifies the files to create but not their internal structure.

### `pd-1096.ts` (canonical pattern for all law constant files)

```ts
// src/features/3d-lab/config/constants/pd-1096.ts
// SOURCE: PD 1096 National Building Code of the Philippines, IRR
// VERIFIED: 2026-04-08
// DO NOT modify values without re-verifying against law text.

export const PD_1096 = {
  // IRR Rule VII — Ceiling Heights
  CEILING: {
    HABITABLE_MIN: 2.70,      // §701 — meters
    MEZZANINE_MIN: 1.80,      // §702
    BASEMENT_MIN: 2.40,       // §703
  },

  // IRR Rule VIII §801 — Room Requirements
  ROOMS: {
    HABITABLE_AREA_MIN: 6.0,  // sqm
    HABITABLE_DIM_MIN: 2.0,   // meters — min dimension
    KITCHEN_AREA_MIN: 3.0,
    KITCHEN_DIM_MIN: 1.5,
    TOILET_AREA_MIN: 1.2,
    TOILET_DIM_MIN: 0.9,
    LAUNDRY_AREA_MIN: 1.5,
    LAUNDRY_DIM_MIN: 0.9,
  },

  // IRR Rule VIII — Stairs
  STAIRS: {
    RISE_MAX: 0.200,           // meters
    RISE_MIN: 0.100,
    RUN_MIN: 0.250,
    WIDTH_MIN_PUBLIC: 1.100,   // 1,100mm for public buildings
    WIDTH_MIN_PRIVATE: 0.750,  // 750mm for private residential
    HEADROOM_MIN: 2.100,
    HANDRAIL_HEIGHT: 0.900,
  },

  // IRR Rule VIII — Firewalls
  FIREWALLS: {
    PARAPET_ABOVE_ROOF_MIN: 0.400,
    FROM_OUTERMOST_EDGES_MIN: 0.600,
    UNDER_EAVES_MIN: 0.300,
  },

  // IRR Rule VII — Site Development Controls
  // NOTE: These are general references. AMBF/PSO/TOSL etc.
  // are zoning-dependent and computed by the DevControls module.
  SITE: {
    ISA_MAX_RESIDENTIAL: 0.90,    // 90% of lot — verify per zoning
    USA_MIN_RESIDENTIAL: 0.10,    // 10% of lot
  },
} as const

// Type exports for use in configs
export type PD1096StairsKey = keyof typeof PD_1096.STAIRS
```

---

## GAP 5 — New Template Architecture Specs

`02_phase_tracker.md` Wave 4 creates `simulation` and `site-planner` templates with zero architectural specification. These are complex enough to need pre-specs before Wave 4 starts.

### Template: `simulation`

**Use cases:** MOD-301 Egress Simulation, MOD-503 Natural Ventilation Simulation.

**Core challenge:** Agent-based or particle-based real-time simulation inside R3F without exceeding GPU budget.

```ts
interface SimulationModuleConfig extends BaseModuleConfig {
  template: 'simulation'

  // Simulation parameters (same structure as parametric)
  parameters: ParameterDef[]

  // Simulation-specific
  simulation: {
    type: 'agent' | 'particle' | 'fluid'
    maxAgents: number         // HARD CAP: 100 for egress, 500 for particles
    stepDuration: number      // milliseconds per simulation tick
    autoStart: boolean
  }

  // Floor plan definition (same as floorplan template)
  floorPlan: FloorPlanDef
}
```

**Performance contract:**
- `frameloop="always"` only while simulation is running. Switch to `"demand"` on pause/complete.
- Agent meshes must use `<Instances>` — never individual `<mesh>` per agent.
- Cap: 100 agents for egress (Snapdragon 665 validated). 500 particles for ventilation (points-based, not meshes).
- Show `PerformanceMonitor` — if FPS drops below 30, auto-reduce agent count and show warning.

**UI layout:** Same as `ParametricScene` + `LabPanelLayout`. Add a `SimulationControlBar` (play/pause/reset/speed) mounted as a DOM overlay at bottom of Canvas.

### Template: `site-planner`

**Use cases:** MOD-402 Lot Sizer, MOD-404 Road Hierarchy.

**Core challenge:** Large-scale site (up to 10 hectares) without exceeding memory budget.

```ts
interface SitePlannerModuleConfig extends BaseModuleConfig {
  template: 'site-planner'

  parameters: ParameterDef[]

  sitePlanner: {
    maxHectares: number           // HARD CAP: 10
    defaultZone: ZoneType         // 'residential' | 'commercial' | 'industrial'
    showRoadHierarchy: boolean
    showLotSubdivision: boolean
    showDensityHeatmap: boolean
  }
}
```

**Performance contract:**
- LOD strategy: full detail within 20m of camera, simplified geometry beyond.
- Never render individual lot meshes beyond 200 units. Use `<Instances>` for lot mass.
- Max texture size: 512×512 for ground textures. No HDR environment.
- Use `frameloop="demand"` — site plans are static until parameter changes.

### Template: `measurement`

**Use cases:** MOD-201 Wheelchair Turning Circle, MOD-204 Reach Sphere.

**Concept:** A floor plan view where the student places a parametric clearance volume (cylinder, sphere, box) and checks it against fixed obstacles. No animation — pure spatial compliance checking.

```ts
interface MeasurementModuleConfig extends BaseModuleConfig {
  template: 'measurement'

  parameters: ParameterDef[]

  measurement: {
    clearanceShape: 'cylinder' | 'sphere' | 'box'
    defaultClearanceDimensions: { radius?: number; width?: number; depth?: number; height?: number }
    obstacles: ObstacleDef[]      // Fixed geometry (toilet, counter, wall)
    checkCollision: boolean       // Show red when clearance volume intersects obstacle
  }
}
```

---

## GAP 6 — Dark Mode Strategy for 3D Scene (F-16 Deferred — Now Specified)

F-16 was deferred in the audit findings. It needs a decision before Wave 1 ships, because retrofitting dark mode across 50+ module configs later is expensive.

### Decision

**The 3D scene uses its own independent color scheme, not inherited from the app's dark/light mode toggle.** Reason: the 3D scene is always rendered against a neutral background for maximum legibility of geometry and annotations. Forcing it to flip between light/dark would reduce clarity.

**The DOM overlay layer DOES follow dark mode** — hotspot cards, violation badges, dimension labels all use `dark:` Tailwind classes.

### 3D Scene: Two Modes

| Mode | Background | Ground | Ambient | Use when |
|------|-----------|--------|---------|----------|
| `diagram` | `#F8F9FA` (Off-white) | `#EDEDE8` | Flat, no shadows | Default for all code compliance modules |
| `architectural` | `#E8E8E0` (warm grey) | `#D8D8CE` | Studio 3-light rig | Complex buildings, massing modules |

These map to the lighting `preset` in `SceneConfig` from Phase 4. Module configs specify `lightingPreset: 'diagram' | 'architectural'`. Default is `'diagram'`.

**What this means for `scene-colors.ts`:**

```ts
// src/features/3d-lab/constants/scene-colors.ts

export const SCENE_COLORS = {
  diagram: {
    background: '#F8F9FA',
    ground: '#EDEDE8',
    groundLine: '#D8D8D0',
    fog: undefined,
  },
  architectural: {
    background: '#E8E8E0',
    ground: '#D8D8CE',
    groundLine: '#C8C8BC',
    fog: { color: '#E8E8E0', near: 20, far: 60 },
  },

  // Geometry palette — shared across both modes
  geometry: {
    concrete: '#B8B4A8',
    rebar: '#555555',
    chb: '#9A9A8E',
    glass: '#C8D8E0',
    steel: '#8A8A8A',
    soil: '#8B7355',
    grass: '#7AAF6A',
    asphalt: '#6A6A6A',
    paint_default: '#F2F0EB',
    water: '#6BA3BE',
  },

  // Compliance states — same in both modes
  compliance: {
    compliant: '#2ECC71',
    warning: '#F5A623',
    violation: '#E74C3C',
    neutral: '#9B9B9B',
    highlight: '#1E3A5F',
  },
} as const
```

---

## How This Supplements the Existing Documents

| Gap | Relevant Existing Doc | What This Adds |
|-----|-----------------------|----------------|
| DOM Overlay APIs | 01_master_architecture.md (mandate only) | Full TypeScript contracts + component code |
| UX interaction standards | 04_ux_ui_gatekeeper.md (gates only) | Concrete rules for camera, hotspots, sliders, mobile |
| Camera presets | 02_phase_tracker.md (P8 task only) | Full preset registry with values |
| Module config authoring | None | Full annotated example + authoring rules |
| Shared constants structure | 03_regulatory_ledger.md (file list only) | `const` object pattern with types |
| New template specs | 02_phase_tracker.md (wave task only) | Config interfaces + performance contracts |
| Dark mode strategy | F-16 deferred in 04 | Decision + `scene-colors.ts` implementation |

---

*Read alongside `01_master_architecture.md`. Do NOT modify `01–04` documents based on this supplement — update `02_phase_tracker.md` tasks only.*
