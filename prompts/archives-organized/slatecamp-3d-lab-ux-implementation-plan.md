# SlateCamp 3D Lab — UX & Visual System Implementation Plan
### Hero Feature · All 186 Modules · Priority: `site-development-controls`

---

## 01 · Core Visual Language: Sky & Ground Delineation System

Both reference images (SEQUENCE.DENSE, architectural site model) achieve their architectural quality through **temperature contrast**, not hard lines. Cool sky + warm ground reads immediately as "architectural physical model" — the same palette studio photographers use for physical model photography.

### The Palette

| Role | Hex | Treatment |
|---|---|---|
| **Sky** | `#EEF2FA` | Canvas `clearColor` + fog color (cool blue-white) |
| **Ground plane** | `#D4CFC4` | Explicit colored `<mesh>` geometry with `receiveShadow` |
| **Context buildings** | `#EDEAE4` | Ghost white, `castShadow: false`, Edges only |
| **Active / proposed** | `#1B3FC4` | SlateCamp cobalt, roughness 0.4, Edges + Outlines on select |
| **Site boundary** | `#BFC5B5` | Dashed `<Line>` marking lot perimeter |
| **Setback zone** | `#F5A623` @ 20% opacity | Amber wireframe box, dashed Edges |
| **Violation** | `#E63329` | Red emissive pulse, Outlines |
| **Open space (PSO)** | `#2ECC71` @ 20% opacity | Green hatched plane, no roof mesh |

> **The design principle:** The ground is never a default background. It is always an explicit colored geometry mesh. The sky is the Canvas `clearColor` + depth fog in the same hue, which produces natural atmospheric recession without additional shaders.

### `SceneBase.tsx` — Applied Globally to All 186 Modules

```tsx
// SceneBase.tsx — universal across all modules
import { ContactShadows } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

function SkySetup() {
  const { gl, scene } = useThree()
  useEffect(() => {
    gl.setClearColor(new THREE.Color('#EEF2FA'), 1)  // sky
    scene.fog = new THREE.Fog('#EEF2FA', 40, 80)     // atmospheric recession
  }, [gl, scene])
  return null
}

export function SceneBase() {
  return (
    <group>
      <SkySetup />

      {/* Ground plane — explicit warm stone geometry, not just a shadow receiver */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color="#D4CFC4"   // warm travertine/stone
          roughness={0.92}
          metalness={0.0}
        />
      </mesh>

      {/* Soft contact shadow layered on top of ground */}
      <ContactShadows
        position={[0, 0.002, 0]}
        opacity={0.28}
        scale={20}
        blur={3.0}
        far={6}
        frames={1}   // bake once — zero runtime cost
      />
    </group>
  )
}
```

### Standard Lighting Rig — Architectural Studio

```tsx
export function SlateCampLighting() {
  return (
    <>
      {/* Key light — warm directional from upper-right (architectural convention) */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        color="#FFF5E6"          // slightly warm
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

      {/* Fill light — cool from opposite side, adds depth */}
      <directionalLight
        position={[-3, 4, -3]}
        intensity={0.4}
        color="#E6EFFF"          // slightly cool
      />

      {/* Ambient — enough to read shadow areas, not enough to flatten */}
      <ambientLight intensity={0.35} color="#FFFFFF" />

      {/* Environment for metallic material reflections only */}
      <Environment preset="city" background={false} />
    </>
  )
}
```

---

## 02 · Architectural Diagram Language: Edges + Material Hierarchy

The SEQUENCE.DENSE poster and the site model reference both achieve their aesthetic through **one technique**: clean dark edges on light matte forms. This is the highest-leverage single change across all existing modules.

### `ArchMass` — Reusable Building Volume Component

```tsx
// ArchMass.tsx — replace ALL raw <mesh> calls for building volumes
import { Edges, Outlines } from '@react-three/drei'
import * as THREE from 'three'

interface ArchMassProps {
  geometry: THREE.BufferGeometry
  color?: string
  isActive?: boolean        // true = cobalt, Outlines on select
  isContext?: boolean       // true = ghost white, no castShadow
  isViolating?: boolean     // true = violation red pulse
}

export function ArchMass({
  geometry,
  color = '#EDEAE4',
  isActive = false,
  isContext = false,
  isViolating = false,
  ...props
}: ArchMassProps) {
  const meshColor = isViolating ? '#E63329' : isActive ? '#1B3FC4' : color

  return (
    <mesh
      geometry={geometry}
      castShadow={!isContext}
      receiveShadow
      {...props}
    >
      <meshStandardMaterial
        color={meshColor}
        roughness={isActive ? 0.4 : 0.85}
        metalness={0.0}
        transparent={isContext}
        opacity={isContext ? 0.7 : 1.0}
        emissive={isViolating ? '#E63329' : '#000000'}
        emissiveIntensity={isViolating ? 0.2 : 0.0}
      />

      {/* Edges — the single most important visual technique */}
      <Edges
        threshold={15}
        color="#3A3A3A"
        lineWidth={1.0}
        scale={1.002}    // prevents z-fighting
      />

      {/* Selection outline — cobalt, only on active element when selected */}
      {isActive && (
        <Outlines thickness={0.02} color="#4A6FE8" screenspace={false} />
      )}
    </mesh>
  )
}
```

### Material Rules Summary

| Element | Color | Roughness | castShadow | Edges |
|---|---|---|---|---|
| Active/proposed building | `#1B3FC4` | 0.4 | true | `#3A3A3A` |
| Context buildings | `#EDEAE4` | 0.85 | **false** | `#3A3A3A` |
| Ground plane | `#D4CFC4` | 0.92 | — | none |
| Violation element | `#E63329` | 0.5 | true | `#3A3A3A` |
| Setback wireframe | `#F5A623` @ 20% | — | false | dashed |

---

## 03 · Priority Implementation: `site-development-controls`

> **This is the flagship model.** It must do what no 2D diagram can: show AMBF, PSO, setbacks, building height limits, and GFA simultaneously in one interactive 3D scene. The student drags sliders and watches the massing respond to Philippine code limits in real time.

### Zone Color Coding

| Zone | Color | Material | Code concept |
|---|---|---|---|
| Buildable mass | `#1B3FC4` | Solid cobalt, 0.6 opacity, Edges | AMBF-compliant building |
| Required setback | `#F5A623` @ 20% | Amber wireframe, dashed Edges | Front/side/rear setback |
| Violation zone | `#E63329` | Emissive red pulse, Outlines | Mass exceeds AMBF/setback |
| Lot/site | `#D4CFC4` | Warm stone, lot boundary dashed line | Lot area (PSO denominator) |
| Open space required | `#2ECC71` @ 20% | Green hatched plane, no roof | PSO percentage |
| Context buildings | `#EDEAE4` | Ghost white, Edges only | Adjacent properties |
| Sky | `#EEF2FA` | Canvas clearColor + fog near=40 far=80 | Atmospheric depth |

### Parametric Controls

| Parameter | Slider range | Code bound | Violation trigger |
|---|---|---|---|
| Lot area (m²) | 50–2000 | — | None (input) |
| Building footprint % | 10–90% | AMBF ≤ 60% (residential) | `footprint / lot > AMBF` |
| Number of floors | 1–10 | Varies by zone / BHL | BHL ceiling exceeded |
| Front setback (m) | 0–10 | PD 1096 min 3.0m | `setback < 3.0m` |
| Side setback (m) | 0–5 | Min 2.0m (firewall rules) | `setback < 2.0m` |
| Floor-to-floor height (m) | 2.4–5.0 | Min 2.7m habitable | `height < 2.7m` |

### Computed HUD Outputs (live, update on every slider change)

```tsx
// Computed values — recalculate on every parameter change
const TGFA = floorArea * numberOfFloors                           // m²
const AMBF = (buildingFootprint / lotArea) * 100                 // %
const PSO  = ((lotArea - buildingFootprint) / lotArea) * 100     // %
const BHL  = numberOfFloors * floorHeight                        // m
const ISA  = lotArea - buildingFootprint - setbackArea           // m²
```

### Core Scene Component

```tsx
// SiteDevControlsScene.tsx
import { useLabStore } from '@/stores/useLabStore'
import { useThree } from '@react-three/fiber'
import { Line } from '@react-three/drei'

export function SiteDevControlsScene() {
  const { lotArea, footprintPct, floors, frontSetback, sideSetback, floorHeight }
    = useLabStore(s => s.parameters)
  const invalidate = useThree(s => s.invalidate)

  // Derived geometry dimensions (assuming square lot for simplicity)
  const lotSide       = Math.sqrt(lotArea)
  const footprintSide = lotSide * Math.sqrt(footprintPct / 100)
  const buildingH     = floors * floorHeight
  const totalH        = buildingH

  // Violation checks
  const ambfViolation   = (footprintPct / 100) > 0.60
  const frontViolation  = frontSetback < 3.0
  const sideViolation   = sideSetback < 2.0
  const heightViolation = floorHeight < 2.7

  return (
    <group>
      {/* Lot boundary */}
      <Line
        points={[
          [-lotSide/2, 0.01, -lotSide/2],
          [ lotSide/2, 0.01, -lotSide/2],
          [ lotSide/2, 0.01,  lotSide/2],
          [-lotSide/2, 0.01,  lotSide/2],
          [-lotSide/2, 0.01, -lotSide/2],
        ]}
        color="#BFC5B5"
        lineWidth={1.5}
        dashed
        dashSize={0.3}
        gapSize={0.15}
      />

      {/* Setback wireframe boxes */}
      <SetbackBox
        lotSide={lotSide}
        frontSetback={frontSetback}
        sideSetback={sideSetback}
        isViolating={frontViolation || sideViolation}
      />

      {/* Building mass */}
      <group position={[0, totalH / 2, 0]}>
        <ArchMass
          geometry={buildingGeometry(footprintSide, totalH)}
          isActive
          isViolating={ambfViolation || heightViolation}
        />
      </group>

      {/* PSO open space fill */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[lotSide, lotSide]} />
        <meshStandardMaterial
          color="#2ECC71"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
```

### Violation Feedback System

```tsx
// ViolationBanner.tsx — appears in side panel when any code limit is breached
export function ViolationBanner({ violations }: { violations: string[] }) {
  if (violations.length === 0) return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-100">
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <span className="font-mono text-[10px] text-green-800 uppercase tracking-widest">
        Code compliant
      </span>
    </div>
  )

  return (
    <div className="space-y-1.5">
      {violations.map(v => (
        <div key={v} className="flex items-start gap-2 px-3 py-2 rounded-lg
                               bg-red-50 border border-red-100">
          <div className="w-2 h-2 rounded-full bg-red-500 mt-0.5 shrink-0" />
          <span className="font-mono text-[10px] text-red-800 leading-relaxed">{v}</span>
        </div>
      ))}
    </div>
  )
}
```

---

## 04 · Guided Step-Through Mode (Inspired by SEQUENCE.DENSE)

The SEQUENCE.DENSE poster presents a 6-step narrative that builds a concept sequentially. The `site-development-controls` model must do the same — a guided tour that builds the scene one development control at a time, before the sandbox opens.

| Step | Label | What appears | Learning objective |
|---|---|---|---|
| **00** | Locate | Raw ground plane + lot boundary dashed line | Read the lot area |
| **01** | Setbacks | Amber wireframe setback boxes + dimensions | Understand margin constraints |
| **02** | AMBF | Max footprint slab extruded, AMBF % in HUD | Footprint as % of lot |
| **03** | Build height | Building extrudes floor by floor, BHL ceiling plane | TGFA and vertical limits |
| **04** | Open space | PSO green fill, context buildings appear | Relate built to open |
| **05** | Sandbox | All sliders unlocked, violation detection active, in-canvas quiz | Active exploration |

```tsx
// useGuidedTour.ts
import { useLabStore } from '@/stores/useLabStore'

const TOUR_STEPS = [
  { id: 'locate',    label: 'Locate',     visible: ['lot'] },
  { id: 'setbacks',  label: 'Setbacks',   visible: ['lot', 'setbacks'] },
  { id: 'ambf',      label: 'AMBF',       visible: ['lot', 'setbacks', 'footprint'] },
  { id: 'height',    label: 'Build height', visible: ['lot', 'setbacks', 'building'] },
  { id: 'openspace', label: 'Open space', visible: ['lot', 'setbacks', 'building', 'pso', 'context'] },
  { id: 'sandbox',   label: 'Sandbox',    visible: ['all'] },
] as const

export function useGuidedTour() {
  const step = useLabStore(s => s.tourStep)
  const setStep = useLabStore(s => s.setTourStep)
  const currentStep = TOUR_STEPS[step]

  return {
    currentStep,
    canGoNext: step < TOUR_STEPS.length - 1,
    canGoPrev: step > 0,
    goNext: () => setStep(Math.min(step + 1, TOUR_STEPS.length - 1)),
    goPrev: () => setStep(Math.max(step - 1, 0)),
    isSandbox: currentStep.id === 'sandbox',
    isVisible: (layer: string) =>
      currentStep.visible.includes('all') ||
      currentStep.visible.includes(layer as never),
  }
}
```

---

## 05 · Module Layout Template

All 3D Lab modules use this layout. Desktop = side panel. Mobile ≤768px = draggable bottom sheet. Canvas is always full-bleed.

```
┌──────────────────────────────────────────────────────┐
│  ← Module title                  [?] [Grid] [Reset]  │  ← 48px header
├───────────────────────────┬──────────────────────────┤
│                           │  PARAMETERS              │
│                           │  ─────────────────────   │
│   3D CANVAS               │  Lot area      [slider]  │
│                           │  Footprint %   [slider]  │
│   Sky:    #EEF2FA         │  Floors        [slider]  │
│   Ground: #D4CFC4         │  Front setback [slider]  │
│                           │  ─────────────────────   │
│                           │  RESULTS                 │
│                           │  TGFA  PSO  AMBF  BHL    │
│                           │  ─────────────────────   │
│                           │  CODE REFERENCE          │
│                           │  PD 1096 Rule 7 & 8      │
│                           │  [→ Open Wiki]           │
├───────────────────────────┴──────────────────────────┤
│  Mobile: Draggable bottom sheet with all controls    │
└──────────────────────────────────────────────────────┘
```

### Camera Default: Isometric-Style Preset

```tsx
// Matches the SEQUENCE.DENSE 3/4 elevated view
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
  maxPolarAngle={Math.PI / 2}   // no below-floor
/>
```

### Hotspot System (6 Maximum Per View)

```tsx
const HOTSPOT_COLORS = {
  requirement: '#1B3FC4',   // cobalt — code requirements
  dimension:   '#F5A623',   // amber — measurements
  violation:   '#E63329',   // red — violations (functional only)
  info:        '#6B7280',   // gray — general info
} as const

// Hotspot placement rule: dot is ON the element it describes.
// Maximum 6 visible simultaneously — more = cognitive overload.
// Mobile: single tap opens tooltip, tap canvas to dismiss.
```

---

## 06 · Performance Requirements

| Metric | Target | Hard fail |
|---|---|---|
| First meaningful render | < 3s on 4G | > 5s |
| Sustained FPS | 60fps desktop / 30fps mobile | < 20fps |
| GLB file size | < 2MB per module | > 5MB |
| Triangle count | < 30K per module | > 50K |
| GPU draw calls | < 50 per frame | > 100 |
| frameloop | `"demand"` always | `"always"` |

```tsx
// Canvas setup — all 3D Lab modules
<Canvas
  frameloop="demand"                  // render only on interaction
  gl={{
    antialias: true,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.0,
    outputColorSpace: THREE.SRGBColorSpace,
  }}
>
  <PerformanceMonitor
    onDecline={() => setDpr(0.75)}   // adaptive DPR for low-end devices
    onIncline={() => setDpr(1.0)}
  />
```

```tsx
// Always call invalidate() on parameter change — never rely on continuous render
const invalidate = useThree(s => s.invalidate)
useEffect(() => { invalidate() }, [parameter, invalidate])
```

---

## 07 · Implementation Phases

| Phase | What ships | Priority | Est. effort |
|---|---|---|---|
| **1 · Scene foundation** | `SceneBase` with sky `#EEF2FA`, ground `#D4CFC4`, fog, standard lighting, ContactShadows. Applied globally to all modules. | **P1 · Now** | 1–2 days |
| **2 · Edge language** | `ArchMass` component with `<Edges>`. Replace all raw `<mesh>` calls in existing modules. Context buildings ghosted. | **P1 · Now** | 2–3 days |
| **3 · site-dev-controls** | Full parametric model: lot, setbacks, AMBF, BHL, TGFA, PSO. All sliders. Real-time violation detection. 6-step guided tour. | **P1 · Now** | 5–7 days |
| **4 · Hotspot system** | `HotspotMarker` with category colors. Applied to all P1 modules. Max 6 per view. Mobile tap pattern. | **P2 · Next** | 2 days |
| **5 · In-canvas quiz** | `InCanvasQuiz` component. 1 question per module step, placed at point of maximum cognitive readiness. | **P2 · Next** | 2 days |
| **6 · Performance pass** | `frameloop="demand"` on all modules. `PerformanceMonitor` adaptive DPR. GLB Draco compression. Triangle budget enforcement. | **P3 · Parallel** | 3 days |

---

## 08 · Quality Gate Checklist

Run before any 3D module ships:

### Visual
- [ ] Canvas `clearColor` = `#EEF2FA` (sky)
- [ ] Ground plane visible, `#D4CFC4`, `receiveShadow: true`
- [ ] Depth fog color = `#EEF2FA`, near=40, far=80
- [ ] `<Edges>` on all structural geometry, color `#3A3A3A`, threshold 15°
- [ ] Context buildings: `castShadow: false`, opacity 0.7
- [ ] No pure black shadows (ambient intensity ≥ 0.35)
- [ ] `ACESFilmicToneMapping` + `SRGBColorSpace` on Canvas

### Interaction
- [ ] `frameloop="demand"` — no continuous render
- [ ] `invalidate()` called on every slider change and orbit gesture
- [ ] Violation feedback: geometry turns red AND violation banner appears in panel
- [ ] Maximum 6 hotspots visible simultaneously
- [ ] All interactive elements ≥ 44px touch target

### Performance
- [ ] First meaningful render < 3s on simulated 4G
- [ ] Sustained ≥ 30fps on mid-range Android (Realme, Samsung A series)
- [ ] GLB < 2MB, triangles < 30K per module
- [ ] Skeleton loading state rendered before 3D canvas loads
- [ ] Controls collapse to bottom sheet at < 768px viewport width

### Educational
- [ ] Every hotspot is positioned ON the element it describes
- [ ] Code references (PD 1096, RA 9514, BP 344) are attached to specific elements
- [ ] Wiki link present for every code reference shown
- [ ] Guided tour available before sandbox mode
- [ ] In-canvas quiz placed at point of maximum cognitive readiness

---

## Reference Colors (Quick Copy)

```
Sky (canvas / fog):       #EEF2FA
Ground plane:             #D4CFC4
Active / proposed:        #1B3FC4   (SlateCamp cobalt)
Context buildings:        #EDEAE4
Site / lot boundary:      #BFC5B5
Edges (all geometry):     #3A3A3A
Violation:                #E63329   (SlateCamp alert red)
Compliant:                #2ECC71   (SlateCamp trail green)
Setback zone (amber):     #F5A623   (20% opacity fill)
Open space (green):       #2ECC71   (20% opacity fill)
Selection outline:        #4A6FE8   (lighter cobalt)
Hotspot — requirement:    #1B3FC4
Hotspot — dimension:      #F5A623
Hotspot — violation:      #E63329
Hotspot — info:           #6B7280
```
