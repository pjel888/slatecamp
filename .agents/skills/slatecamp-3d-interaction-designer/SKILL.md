---
name: slatecamp-3d-interaction-designer
description: >
  SlateCamp's 3D Interaction Designer — UX patterns for interactive 3D educational models.
  Activate for: hotspot systems, annotation overlays, cross-section clipping planes,
  parametric sliders with code violation feedback, exploded view animations, guided tour
  narratives, camera choreography, in-canvas quizzing, dimension lines, measurement tools,
  mobile touch patterns (pinch/orbit/tap), tooltip placement, and orbit control constraints.
  Trigger on: "hotspot", "annotation", "cross-section", "clipping plane", "parametric
  slider", "exploded view", "guided tour", "camera animation", "in-canvas quiz",
  "3D tooltip", "touch 3D", "dimension line", "3D UX", "interaction type".
---

# SlateCamp — 3D Interaction Design Guide

## The Interaction Design Philosophy

The 3D Lab is not a model viewer. It is a **learning instrument.** Every interaction
must serve a learning objective, not demonstrate technical capability.

**The Three Tests for every interaction:**
1. **Mayer's Coherence:** Does this interaction serve the learning objective, or is it decoration?
2. **Hattie's Feedback:** Does the interaction produce specific, corrective, feed-forward feedback?
3. **The LEA Test:** Will this interaction help a student answer an LEA question correctly?

If any test fails, the interaction doesn't ship.

---

## Interaction Type Taxonomy

Every 3D Lab module uses one or more of these interaction patterns:

| Type | Description | Interactivity Level | Best For |
|---|---|---|---|
| Orbit + Annotate | Free orbit with hotspot overlays | Level 1–2 | Code dimension exploration |
| Parametric Sandbox | Slider controls that modify geometry in real-time | Level 3 | Code limits, proportions |
| Cross-Section | Clipping planes reveal internal structure | Level 2 | Wall assemblies, MEP systems |
| Exploded Assembly | Parts separate to show construction layers | Level 2 | Building assemblies, connections |
| Guided Tour | Scripted camera sequence with narration points | Level 1 | Complex system walkthroughs |
| Floor Plan Navigation | Top-down view with path highlighting | Level 2 | Egress, circulation, travel distance |
| Side-by-Side Compare | Toggle or swipe between two models | Level 2 | Historical orders, before/after |
| In-Canvas Quiz | Questions embedded in the 3D scene | Level 3 | Active recall during exploration |

---

## Hotspot System — Complete Implementation

### Architecture

```
HotspotManager (manages visibility, focus state)
├── HotspotMarker (individual dot + tooltip)
├── HotspotPanel (side panel for detailed info)
└── HotspotNavigation (prev/next controls)
```

### Production Hotspot Component

```tsx
'use client'

import { Html } from '@react-three/drei'
import { useState, useRef, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface Hotspot {
  id: string
  position: [number, number, number]
  label: string
  description: string
  codeReference?: string       // "PD 1096 Sec. 4.08"
  dimension?: string           // "Min. 1,100mm"
  category: 'requirement' | 'dimension' | 'violation' | 'info'
}

interface HotspotMarkerProps {
  hotspot: Hotspot
  isActive: boolean
  onActivate: (id: string) => void
}

export function HotspotMarker({ hotspot, isActive, onActivate }: HotspotMarkerProps) {
  const invalidate = useThree(s => s.invalidate)

  const handleClick = useCallback(() => {
    onActivate(hotspot.id)
    invalidate()
  }, [hotspot.id, onActivate, invalidate])

  const categoryColors = {
    requirement: '#1B3FC4',  // Cobalt — code requirements
    dimension: '#F5A623',    // Gold — measurements
    violation: '#E63329',    // Red — code violations (functional only)
    info: '#6B7280',         // Gray — general info
  }

  return (
    <Html
      position={hotspot.position}
      center
      distanceFactor={8}
      occlude                    // Hide when behind geometry
      style={{ pointerEvents: 'auto' }}
    >
      <div className="relative select-none" onClick={handleClick}>
        {/* Pulsing dot */}
        <div
          className="w-5 h-5 rounded-full border-2 border-white shadow-lg cursor-pointer
                     flex items-center justify-center transition-transform duration-200
                     hover:scale-125"
          style={{ backgroundColor: categoryColors[hotspot.category] }}
        >
          {/* Inner pulse ring — only on active */}
          {isActive && (
            <div
              className="absolute w-5 h-5 rounded-full animate-ping opacity-40"
              style={{ backgroundColor: categoryColors[hotspot.category] }}
            />
          )}
        </div>

        {/* Always-visible label */}
        <div className="absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap">
          <span className="font-mono text-[10px] font-medium text-white
                          bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded">
            {hotspot.label}
          </span>
        </div>

        {/* Expanded tooltip — only when active */}
        {isActive && (
          <div className="absolute left-7 top-6 w-64 bg-white border border-gray-200
                         rounded-lg shadow-xl p-4 z-50 pointer-events-auto">
            {/* Category badge */}
            <span
              className="font-mono text-[8px] font-medium uppercase tracking-widest
                        px-1.5 py-0.5 rounded-sm text-white mb-2 inline-block"
              style={{ backgroundColor: categoryColors[hotspot.category] }}
            >
              {hotspot.category}
            </span>

            {/* Title */}
            <p className="font-sans text-sm font-medium text-gray-900 mt-1">
              {hotspot.label}
            </p>

            {/* Description */}
            <p className="font-sans text-xs text-gray-600 leading-relaxed mt-1">
              {hotspot.description}
            </p>

            {/* Dimension callout */}
            {hotspot.dimension && (
              <div className="mt-2 px-2 py-1.5 bg-amber-50 rounded border border-amber-100">
                <p className="font-mono text-xs font-medium text-amber-900">
                  {hotspot.dimension}
                </p>
              </div>
            )}

            {/* Code reference */}
            {hotspot.codeReference && (
              <p className="font-mono text-[10px] text-gray-400 mt-2">
                {hotspot.codeReference}
              </p>
            )}
          </div>
        )}
      </div>
    </Html>
  )
}
```

### Hotspot Placement Rules (Mayer's Spatial Contiguity)

- Hotspot dot is placed ON the element it describes (not offset to a legend)
- Tooltip opens adjacent to the dot — never overlapping the element
- Maximum 6 hotspots visible simultaneously — more causes cognitive overload
- Hotspots can be grouped by category with a filter toggle
- On mobile: tap opens tooltip, tap elsewhere closes. No hover.

---

## Parametric Sandbox — Code Violation Feedback

This is SlateCamp's highest-value interaction type: Level 3 Interactivity.

### Architecture

```
ParametricModule
├── ControlPanel (sliders, outside canvas)
│   ├── ParameterSlider
│   └── ViolationIndicator
├── Canvas
│   ├── ParametricGeometry (regenerates from parameters)
│   ├── DimensionLabels (Html annotations showing current values)
│   └── ViolationHighlight (red overlay on non-compliant elements)
└── CodeReferencePanel (shows relevant code sections)
```

### Parametric Slider with Code Bounds

```tsx
'use client'

import { useLabStore } from '@/stores/useLabStore'

interface CodeBound {
  min?: number
  max?: number
  label: string
  codeRef: string
}

interface ParameterSliderProps {
  param: string
  label: string
  unit: string
  min: number
  max: number
  step: number
  codeBound: CodeBound
}

export function ParameterSlider({
  param, label, unit, min, max, step, codeBound
}: ParameterSliderProps) {
  const value = useLabStore(s => s.parameters[param])
  const setParameter = useLabStore(s => s.setParameter)

  const isViolation =
    (codeBound.min !== undefined && value < codeBound.min) ||
    (codeBound.max !== undefined && value > codeBound.max)

  return (
    <div className="px-4 py-3">
      {/* Label row */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[9px] font-medium uppercase tracking-widest
                        text-muted-foreground">
          {label}
        </span>
        <span className={`font-mono text-sm font-medium tabular-nums
          ${isViolation ? 'text-[#E63329]' : 'text-foreground'}`}>
          {(value * 1000).toFixed(0)}{unit}
        </span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setParameter(param, parseFloat(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-primary
                   [&::-webkit-slider-thumb]:cursor-pointer"
      />

      {/* Code bound indicator */}
      <div className="flex items-center gap-1.5 mt-1">
        {isViolation ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-[#E63329]" />
            <span className="font-mono text-[10px] text-[#E63329]">
              Violates {codeBound.codeRef}: {codeBound.label}
            </span>
          </>
        ) : (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-[#1B7A3C]" />
            <span className="font-mono text-[10px] text-[#1B7A3C]">
              Compliant — {codeBound.codeRef}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
```

### Real-Time Violation Highlight in 3D

```tsx
function ViolationOverlay({ isViolating, meshRef }: ViolationProps) {
  const invalidate = useThree(s => s.invalidate)

  useEffect(() => {
    if (!meshRef.current) return
    const mesh = meshRef.current
    const material = mesh.material as THREE.MeshStandardMaterial

    if (isViolating) {
      material.emissive.setHex(0xE63329)
      material.emissiveIntensity = 0.3
    } else {
      material.emissive.setHex(0x000000)
      material.emissiveIntensity = 0
    }
    invalidate()
  }, [isViolating, meshRef, invalidate])

  return null
}
```

---

## Cross-Section / Clipping Planes

For revealing internal structure (wall assemblies, pipe runs, toilet clearances).

### Implementation

```tsx
'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useLabStore } from '@/stores/useLabStore'

export function ClippingPlaneController() {
  const clipPosition = useLabStore(s => s.clipPosition)
  const clipAxis = useLabStore(s => s.clipAxis)  // 'x' | 'y' | 'z'
  const { gl, invalidate } = useThree()

  const plane = useMemo(() => {
    const normal = new THREE.Vector3(
      clipAxis === 'x' ? -1 : 0,
      clipAxis === 'y' ? -1 : 0,
      clipAxis === 'z' ? -1 : 0,
    )
    return new THREE.Plane(normal, clipPosition)
  }, [clipAxis]) // Only recreate when axis changes

  useEffect(() => {
    plane.constant = clipPosition
    invalidate()
  }, [clipPosition, plane, invalidate])

  useEffect(() => {
    gl.localClippingEnabled = true
    gl.clippingPlanes = [plane]

    return () => {
      gl.localClippingEnabled = false
      gl.clippingPlanes = []
    }
  }, [gl, plane])

  return null
}
```

### Cross-Section Slider UI

```tsx
<ParameterSlider
  param="clipPosition"
  label="Section Cut"
  unit="m"
  min={-2}
  max={2}
  step={0.01}
  codeBound={{ label: 'Free range', codeRef: '' }}
/>
```

### Stencil-Capped Cross Sections

For solid-looking cross sections (showing material fill instead of hollow):

```tsx
// Apply to all materials in the scene
scene.traverse((child) => {
  if ((child as THREE.Mesh).isMesh) {
    const mesh = child as THREE.Mesh
    const mat = mesh.material as THREE.MeshStandardMaterial
    mat.clippingPlanes = [plane]
    mat.clipShadows = true
    mat.side = THREE.DoubleSide  // Show back faces at cut
  }
})
```

---

## Exploded View Animation

For showing construction layers (CHB wall, structural connections).

```tsx
'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useLabStore } from '@/stores/useLabStore'

interface ExplodedPart {
  meshName: string
  explodeDirection: [number, number, number]  // Normalized direction
  explodeDistance: number                       // Maximum distance
  order: number                                // Sequence order (0 = first)
}

export function ExplodedAssembly({
  scene,
  parts,
}: { scene: THREE.Group; parts: ExplodedPart[] }) {
  const explodeAmount = useLabStore(s => s.explodeAmount)  // 0 to 1
  const invalidate = useThree(s => s.invalidate)
  const originalPositions = useRef<Map<string, THREE.Vector3>>(new Map())

  // Store original positions on mount
  useEffect(() => {
    parts.forEach(part => {
      const mesh = scene.getObjectByName(part.meshName)
      if (mesh) {
        originalPositions.current.set(part.meshName, mesh.position.clone())
      }
    })
  }, [scene, parts])

  // Apply explode transform
  useEffect(() => {
    parts.forEach(part => {
      const mesh = scene.getObjectByName(part.meshName)
      const original = originalPositions.current.get(part.meshName)
      if (!mesh || !original) return

      const dir = new THREE.Vector3(...part.explodeDirection)
      const offset = dir.multiplyScalar(explodeAmount * part.explodeDistance)
      mesh.position.copy(original).add(offset)
    })
    invalidate()
  }, [explodeAmount, scene, parts, invalidate])

  return null
}
```

### Explode Slider

```tsx
<div className="px-4 py-3">
  <span className="font-mono text-[9px] font-medium uppercase tracking-widest
                  text-muted-foreground">
    Assembly View
  </span>
  <input
    type="range"
    min={0}
    max={1}
    step={0.01}
    value={explodeAmount}
    onChange={(e) => setExplodeAmount(parseFloat(e.target.value))}
    className="w-full mt-1"
  />
  <div className="flex justify-between mt-0.5">
    <span className="font-mono text-[9px] text-muted-foreground">Assembled</span>
    <span className="font-mono text-[9px] text-muted-foreground">Exploded</span>
  </div>
</div>
```

---

## Dimension Lines and Measurement Display

Showing real-world dimensions in the 3D scene:

```tsx
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'

interface DimensionLineProps {
  start: [number, number, number]
  end: [number, number, number]
  label: string
  offset?: number          // Perpendicular offset from the measured edge
  isViolating?: boolean
}

export function DimensionLine({
  start, end, label, offset = 0.3, isViolating = false
}: DimensionLineProps) {
  const color = isViolating ? '#E63329' : '#1B3FC4'

  // Calculate midpoint for label placement
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 + offset,
    (start[2] + end[2]) / 2,
  ]

  return (
    <group>
      {/* Dimension line */}
      <Line
        points={[start, end]}
        color={color}
        lineWidth={1.5}
        dashed={isViolating}
        dashSize={0.05}
        gapSize={0.03}
      />

      {/* End caps */}
      {[start, end].map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}

      {/* Label */}
      <Html position={mid} center>
        <div className={`font-mono text-[10px] font-medium px-1.5 py-0.5 rounded
                        ${isViolating
                          ? 'bg-red-50 text-red-900 border border-red-200'
                          : 'bg-blue-50 text-blue-900 border border-blue-200'
                        }`}>
          {label}
        </div>
      </Html>
    </group>
  )
}
```

---

## Camera Choreography

### Orbit Control Constraints per Module Type

```tsx
// For single-object inspection (stairway, ramp, toilet)
<OrbitControls
  makeDefault
  enablePan={false}
  minDistance={1.5}
  maxDistance={10}
  minPolarAngle={0.2}        // Don't go fully top-down
  maxPolarAngle={Math.PI / 2} // Don't go below floor
/>

// For floor plan view (egress, travel distance)
<OrbitControls
  makeDefault
  enableRotate={false}         // Lock to top-down
  enablePan={true}
  minDistance={5}
  maxDistance={30}
/>

// For guided tour (camera is scripted)
<OrbitControls enabled={!isTourActive} />
```

### Animated Camera Transitions

```tsx
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function useCameraTransition() {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const isAnimating = useRef(false)

  const transitionTo = useCallback((
    position: [number, number, number],
    lookAt: [number, number, number],
  ) => {
    targetPos.current.set(...position)
    targetLookAt.current.set(...lookAt)
    isAnimating.current = true
  }, [])

  useFrame((_, delta) => {
    if (!isAnimating.current) return

    camera.position.lerp(targetPos.current, delta * 3)
    const dist = camera.position.distanceTo(targetPos.current)

    if (dist < 0.01) {
      camera.position.copy(targetPos.current)
      isAnimating.current = false
    }
  })

  return transitionTo
}
```

---

## Mobile 3D Touch Patterns

SlateCamp's primary device is a 6" Android phone. Touch interactions:

| Gesture | Action | Implementation |
|---|---|---|
| One-finger drag | Orbit rotate | OrbitControls (default) |
| Two-finger pinch | Zoom | OrbitControls (default) |
| Single tap on hotspot | Open tooltip | onClick on Html element |
| Single tap on empty space | Close all tooltips | onPointerMissed on Canvas |
| Long press on element | Show dimension info | Custom timer + state |
| Two-finger drag | Pan (when enabled) | OrbitControls.enablePan |

### Close-on-Miss Pattern

```tsx
<Canvas
  onPointerMissed={() => {
    // Close all active hotspots
    setActiveHotspot(null)
  }}
>
```

### Touch Target Sizes

All interactive 3D elements must have a minimum touch area of 44×44px when projected
to screen space. For hotspot dots, use `distanceFactor` in Html to maintain consistent
screen size regardless of zoom level.

---

## In-Canvas Quizzing

The highest-value interaction: students answer questions while looking at the model.

```tsx
function InCanvasQuiz({ question, position }: QuizProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  return (
    <Html position={position} center>
      <div className="w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-primary mb-2">
          Quick Check
        </p>
        <p className="font-sans text-sm text-gray-900 mb-3">
          {question.text}
        </p>
        {question.choices.map(choice => (
          <button
            key={choice.id}
            onClick={() => {
              setSelected(choice.id)
              setRevealed(true)
            }}
            disabled={revealed}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs mb-1.5
              font-sans transition-colors
              ${revealed && choice.id === question.correctId
                ? 'bg-green-50 border border-green-200 text-green-900'
                : revealed && choice.id === selected
                  ? 'bg-red-50 border border-red-200 text-red-900'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
          >
            {choice.text}
          </button>
        ))}
        {revealed && (
          <p className="font-sans text-[11px] text-gray-600 mt-2 leading-relaxed">
            {question.rationale}
          </p>
        )}
      </div>
    </Html>
  )
}
```

---

## Module Layout Template

Every 3D Lab module uses this layout:

```
┌────────────────────────────────────────────────┐
│  [←] Module Title              [?] [⚙] [🔲]  │  ← Header bar
├──────────────────────┬─────────────────────────┤
│                      │  EYEBROW: Parameters    │
│                      │  Slider: Rise Height    │
│                      │  Slider: Run Depth      │
│    3D Canvas         │  Slider: Width          │  ← Desktop: side panel
│    (fills space)     │                         │
│                      │  ─────────────────────  │
│                      │  EYEBROW: Code Ref      │
│                      │  PD 1096 Sec. 4.08      │
│                      │  [Link to Wiki →]       │
├──────────────────────┴─────────────────────────┤
│  Mobile: bottom sheet with controls            │  ← Mobile: bottom sheet
└────────────────────────────────────────────────┘
```

On mobile (< 768px): Controls collapse to a draggable bottom sheet overlay.
The 3D canvas is always full-width on mobile.

---

## Reference Files

| File | When to Read |
|---|---|
| `references/interaction-recipes.md` | Copy-paste patterns for each interaction type |
| `references/module-specs.md` | Interaction specs for all 10 priority modules |
| `references/mobile-3d-patterns.md` | Mobile-specific touch interaction patterns |
| `references/camera-presets.md` | Camera position/FOV presets per module type |
