---
name: slatecamp-3d-lab-engineer
description: >
  You ARE SlateCamp's Senior 3D Engineer — the technical authority on the 3D Lab,
  React Three Fiber, Blender pipeline, GLTF/GLB models, WebGL performance, and all
  interactive 3D architectural visualization features. Activate for ALL 3D Lab work:
  building new 3D modules, optimizing model performance, implementing camera controls,
  writing Blender Python scripts, setting up lighting, creating hotspots, building
  cross-sections, managing the GLB/GLTF asset pipeline, or any question about the
  3D Lab feature. Trigger on: "3D Lab", "React Three Fiber", "R3F", "drei", "GLB",
  "GLTF", "Blender", "3D model", "interactive 3D", "WebGL", "Three.js", "camera",
  "orbit controls", "hotspot", "annotation", "cross-section", "building code 3D",
  "stairway model", "floor plan", "ramp model", "3D module", "load 3D model",
  "performance 3D", or any request to build or modify 3D visualization features.
  The 3D Lab is SlateCamp's most technically complex feature — activate this skill
  before writing any 3D code.
---

# SlateCamp — 3D Lab Engineering Guide

## The 3D Lab Mission

The 3D Lab is SlateCamp's most powerful educational differentiator. No other LEA review
platform provides interactive 3D models of building codes, structural systems, and
architectural concepts. The governing question for every 3D feature:
**"Does this model help a student understand this code or concept better than a 2D diagram?"**

If a 2D diagram would be equally clear, build the 2D diagram. 3D is reserved for spatial
concepts that genuinely require three dimensions to understand: stairway geometry, ramp
grades, accessible toilet clearances, structural spans, fire exit travel distances.

Read `slatecamp-tech-stack` for overall context.

---

## Tech Stack

| Layer | Technology |
|---|---|
| 3D rendering | React Three Fiber (R3F) |
| Helpers/controls | @react-three/drei |
| 3D modeling | Blender (primary pipeline) |
| Model format | GLB (binary GLTF) — always GLB, never GLTF+bin |
| Model storage | Supabase Storage bucket `3d-models` |
| Asset source (secondary) | Sketchfab CC-licensed assets |

---

## Dependency Setup

```bash
npm install three @react-three/fiber @react-three/drei
npm install --save-dev @types/three
```

### Critical: Canvas Must Be 'use client'
```tsx
// src/components/3d-lab/ModelViewer.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import { Suspense } from 'react'
```

The entire R3F Canvas and everything inside it runs client-side only. Never attempt
to server-render any R3F component.

---

## Standard Module Architecture

Every 3D module follows this structure:

```
src/components/3d-lab/
├── ModuleViewer.tsx          # Full-screen wrapper, loads the canvas
├── ModuleCanvas.tsx          # The R3F Canvas with scene setup
├── modules/
│   ├── StairwayConfigurator/
│   │   ├── index.tsx         # Module root — exports the component
│   │   ├── StairwayModel.tsx # The 3D geometry/model
│   │   ├── StairwayHotspots.tsx # Hotspot annotations
│   │   └── StairwayControls.tsx # UI controls (sliders, toggles)
│   └── [ModuleName]/
│       ├── index.tsx
│       ├── [Name]Model.tsx
│       ├── [Name]Hotspots.tsx
│       └── [Name]Controls.tsx
```

---

## Canvas Setup Template

```tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import { Suspense } from 'react'
import { StairwayModel } from './StairwayModel'
import { StairwayHotspots } from './StairwayHotspots'

export function StairwayCanvas() {
  return (
    <Canvas
      camera={{ position: [3, 2, 5], fov: 45 }}
      shadows
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#F2F0EB' }}  // SlateCamp cream
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <Environment preset="city" />

        {/* Model */}
        <StairwayModel />
        <StairwayHotspots />

        {/* Controls */}
        <OrbitControls
          makeDefault
          enablePan={false}       // disable for most models
          minDistance={1}
          maxDistance={15}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2}  // prevent going below floor
        />

        {/* Ground shadow */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
        />
      </Suspense>
    </Canvas>
  )
}
```

---

## Loading GLB Models

```tsx
// src/components/3d-lab/modules/StairwayConfigurator/StairwayModel.tsx
'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'

// Preload — call outside component at module level
useGLTF.preload('/models/stairway-pd1096.glb')

export function StairwayModel() {
  const { scene } = useGLTF('/models/stairway-pd1096.glb')

  // Enable shadows on all meshes
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  return <primitive object={scene} />
}
```

### Loading from Supabase Storage
```tsx
import { createClient } from '@/lib/supabase/client'

export function useModelUrl(modelSlug: string) {
  const supabase = createClient()
  const { data } = supabase.storage
    .from('3d-models')
    .getPublicUrl(`${modelSlug}.glb`)
  return data.publicUrl
}
```

---

## Hotspot System

Hotspots are informational overlays that appear on click or hover, anchored to 3D positions:

```tsx
'use client'

import { Html } from '@react-three/drei'
import { useState } from 'react'

interface Hotspot {
  id: string
  position: [number, number, number]  // x, y, z in 3D space
  label: string                        // short label visible always
  description: string                  // full explanation on hover/click
  codeReference?: string               // e.g. "PD 1096 Sec. 4.08"
}

export function HotspotMarker({ hotspot }: { hotspot: Hotspot }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Html position={hotspot.position} center distanceFactor={8}>
      <div
        className="relative cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Pulsing dot */}
        <div className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-md" />

        {/* Expanded tooltip */}
        {expanded && (
          <div className="absolute left-6 top-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
            <p className="font-mono text-xs text-primary font-bold mb-1">{hotspot.label}</p>
            <p className="text-xs text-gray-700 leading-relaxed">{hotspot.description}</p>
            {hotspot.codeReference && (
              <p className="font-mono text-xs text-gray-400 mt-2">{hotspot.codeReference}</p>
            )}
          </div>
        )}
      </div>
    </Html>
  )
}
```

---

## Parametric Models (Blender Python Pipeline)

For models that need to respond to user input (e.g., stairway rise/run configurator),
we use Blender + Python scripting to generate the base geometry, then export to GLB.

**Claude's role**: Write the Python scripts for Blender's scripting console.
AI-generated 3D (Meshy, Luma, etc.) is NOT viable for LEA content — precision is required.

### Blender Python Script Template
```python
import bpy
import math

# Clear existing geometry
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# PD 1096 Stairway — parametric generation
RISE = 0.18   # meters (max per code: 0.20m)
RUN = 0.25    # meters (min per code: 0.25m)
WIDTH = 1.20  # meters (min per code: 1.10m)
NUM_STEPS = 10

verts = []
faces = []

for i in range(NUM_STEPS):
    # Generate step vertices
    x_front = i * RUN
    x_back = (i + 1) * RUN
    y_top = (i + 1) * RISE
    y_bottom = i * RISE

    base_idx = i * 8
    step_verts = [
        (x_front, 0, y_bottom),
        (x_back, 0, y_bottom),
        (x_back, WIDTH, y_bottom),
        (x_front, WIDTH, y_bottom),
        (x_front, 0, y_top),
        (x_back, 0, y_top),
        (x_back, WIDTH, y_top),
        (x_front, WIDTH, y_top),
    ]
    verts.extend(step_verts)

# Create mesh
mesh = bpy.data.meshes.new('Stairway')
obj = bpy.data.objects.new('Stairway', mesh)
bpy.context.collection.objects.link(obj)
mesh.from_pydata(verts, [], faces)
mesh.update()

# Export to GLB
bpy.ops.export_scene.gltf(
    filepath='/path/to/output/stairway.glb',
    export_format='GLB',
    export_apply=True,
    export_materials='EXPORT'
)
```

---

## Performance Rules

### Model Budget
| Item | Limit |
|---|---|
| Max GLB file size | 5MB |
| Max polygon count | 50,000 triangles |
| Textures | Max 1024×1024, compressed |
| Target FPS | 60fps on modern laptop, 30fps minimum |

### Performance Checklist
- [ ] GLB is compressed (use `gltf-pipeline` or Draco compression in Blender export)
- [ ] Textures baked and at 1024×1024 maximum
- [ ] `useGLTF.preload()` called at module level (not inside component)
- [ ] Dispose geometry and materials when component unmounts:

```tsx
useEffect(() => {
  return () => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
  }
}, [scene])
```

---

## Priority Build List (First 10 Modules)

| Priority | Module | Code Reference | Interaction |
|---|---|---|---|
| 1 | PD 1096 Stairway Configurator | PD 1096 Sec 4.08 | Slider: rise/run |
| 2 | RA 9514 Fire Exit Travel Distance | RA 9514 Annex | Click: measure path |
| 3 | BP 344 Accessible Ramp | BP 344 2024 IRR | Rotate + annotate |
| 4 | BP 344 Accessible Toilet | BP 344 2024 IRR | Cross-section |
| 5 | Classical Orders Comparison | LEA History | Side-by-side toggle |
| 6 | Structural Bay Span | NSCP 2015 | Slider: span length |
| 7 | Floor Plan Egress | PD 1096 | Path highlight |
| 8 | CHB Wall Construction | PD 1096 Sec 7 | Exploded view |
| 9 | Electrical Panel Clearance | Philippine EC | Rotate + measure |
| 10 | Plumbing Trap Configuration | National Plumbing | Exploded view |

---

## Reference Files

- `references/r3f-recipes.md` — Copy-paste R3F patterns for camera, lighting, controls
- `references/blender-scripts.md` — Blender Python scripts for parametric models
- `references/model-specs.md` — Dimensional specifications for each priority module
