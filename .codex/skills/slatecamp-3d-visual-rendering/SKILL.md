---
name: slatecamp-3d-visual-rendering
description: >
  SlateCamp's 3D Visual Rendering Expert — enterprise-grade rendering for the 3D Lab.
  Owns the complete visual pipeline: lighting rigs (key/fill/ambient), PBR material
  configuration, shadow systems, architectural edge rendering (Edges/Outlines), x-ray
  transparency modes, Environment presets, custom GLSL shaders for code violation overlays
  and dimension highlights, color management (ACESFilmicToneMapping), scene composition,
  ground planes, ContactShadows, camera presets. Trigger on: "lighting", "shadow",
  "material", "PBR", "roughness", "metalness", "environment", "HDR", "tone mapping",
  "edge rendering", "wireframe", "x-ray mode", "transparency", "custom shader",
  "violation overlay", "contact shadow", "scene composition", "it looks bad",
  "make it look better", "visual quality", "professional look".
---

# SlateCamp — 3D Visual Rendering Guide

## The Visual Standard

SlateCamp's 3D Lab is not a game, not a product configurator, and not an arch-viz
portfolio piece. It is a **professional educational diagram tool.** The visual language
is: clean, precise, readable, trustworthy.

**The rendering philosophy:**
- **Clarity over beauty** — every visual choice serves readability
- **Consistent over impressive** — all 186 modules share one visual language
- **Restrained over flashy** — the SlateCamp Design Standard applies to 3D too
- **Performant over photorealistic** — 30fps mobile is non-negotiable

---

## Standard Lighting Rig

Every SlateCamp 3D module uses this base lighting setup:

```tsx
function SlateCampLighting() {
  return (
    <>
      {/* Key light — warm directional from upper-right */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0005}       // Prevents shadow acne
        shadow-normalBias={0.02}    // Prevents peter-panning
        color="#FFF5E6"             // Slightly warm
      />

      {/* Fill light — cool from opposite side */}
      <directionalLight
        position={[-3, 4, -3]}
        intensity={0.4}
        color="#E6EFFF"             // Slightly cool
      />

      {/* Ambient — low, just enough to see shadow areas */}
      <ambientLight intensity={0.35} color="#FFFFFF" />

      {/* Environment for reflections (metallic materials) */}
      <Environment preset="city" background={false} />
    </>
  )
}
```

### Lighting Rules

| Rule | Rationale |
|---|---|
| Key light from upper-right | Architectural convention — matches how drawings are lit |
| Warm key / cool fill | Adds depth without looking theatrical |
| Ambient ≤ 0.4 | Higher = flat. Shadows must be readable |
| Shadow map 2048×2048 | 1024 = pixelated. 4096 = wasteful for diagrams |
| shadow-bias = -0.0005 | Prevents shadow acne on flat surfaces (floors, walls) |

### Per-Module Lighting Overrides

| Module Type | Override |
|---|---|
| Floor plan (top-down) | Disable directional shadow, use ContactShadows only |
| Cross-section | Add rim light from behind to highlight cut edge |
| Exploded assembly | Increase ambient to 0.5 — shadows confuse separated parts |
| Historical building | Warmer key light, add subtle fog for atmosphere |

---

## Material System — Architectural Precision

### The SlateCamp Material Library

```tsx
import * as THREE from 'three'

// Factory function — ensures consistent material creation
export function createArchMaterial(
  type: keyof typeof ARCH_MATERIALS,
  overrides?: Partial<THREE.MeshStandardMaterialParameters>
): THREE.MeshStandardMaterial {
  const base = ARCH_MATERIALS[type]
  return new THREE.MeshStandardMaterial({ ...base, ...overrides })
}

const ARCH_MATERIALS = {
  // STRUCTURAL
  concrete_raw: {
    color: '#B8B4A8', roughness: 0.92, metalness: 0.0,
  },
  concrete_finished: {
    color: '#D4CFC5', roughness: 0.75, metalness: 0.0,
  },
  rebar: {
    color: '#555555', roughness: 0.3, metalness: 0.85,
  },
  structural_steel: {
    color: '#7A7A7A', roughness: 0.25, metalness: 0.9,
  },

  // MASONRY
  chb_block: {
    color: '#9A9A8E', roughness: 0.88, metalness: 0.0,
  },
  chb_plastered: {
    color: '#C4BAA5', roughness: 0.82, metalness: 0.0,
  },
  brick: {
    color: '#B5704D', roughness: 0.9, metalness: 0.0,
  },

  // FINISHES
  paint_white: {
    color: '#F2F0EB', roughness: 0.45, metalness: 0.0,
  },
  tile_ceramic: {
    color: '#E8E4DB', roughness: 0.35, metalness: 0.05,
  },
  timber: {
    color: '#C49B6A', roughness: 0.78, metalness: 0.0,
  },

  // GLASS
  glass_clear: {
    color: '#E8EDF2', roughness: 0.05, metalness: 0.0,
    transparent: true, opacity: 0.3,
  },

  // MEP
  pipe_water: {
    color: '#3B82F6', roughness: 0.3, metalness: 0.65,
  },
  pipe_drain: {
    color: '#6B7280', roughness: 0.35, metalness: 0.6,
  },
  duct_hvac: {
    color: '#C4C4C4', roughness: 0.25, metalness: 0.75,
  },
  conduit_elec: {
    color: '#EAB308', roughness: 0.3, metalness: 0.55,
  },
  pipe_fire: {
    color: '#EF4444', roughness: 0.3, metalness: 0.65,
  },

  // SPECIAL
  violation_highlight: {
    color: '#E63329', roughness: 0.5, metalness: 0.0,
    emissive: '#E63329', emissiveIntensity: 0.3,
  },
  compliant_highlight: {
    color: '#1B7A3C', roughness: 0.5, metalness: 0.0,
    emissive: '#1B7A3C', emissiveIntensity: 0.15,
  },
  selected_highlight: {
    color: '#1B3FC4', roughness: 0.5, metalness: 0.0,
    emissive: '#1B3FC4', emissiveIntensity: 0.2,
  },
  ghost: {
    color: '#E8E8E8', roughness: 0.5, metalness: 0.0,
    transparent: true, opacity: 0.15, depthWrite: false,
  },
} as const
```

---

## Edge Rendering — Architectural Diagram Clarity

The most important visual technique for SlateCamp. Architectural diagrams use edges
to communicate structure — not photorealism.

### Pattern 1: Edges on Every Mesh (Diagram Style)

```tsx
function ArchitecturalMesh({
  geometry,
  material,
  edgeColor = '#333333',
  edgeThreshold = 15,
  ...props
}: ArchMeshProps) {
  return (
    <mesh geometry={geometry} {...props}>
      <primitive object={material} attach="material" />
      <Edges
        threshold={edgeThreshold}
        color={edgeColor}
        lineWidth={1}
        scale={1.002}              // Prevent z-fighting
      />
    </mesh>
  )
}
```

### Pattern 2: Selective Edges (Key Elements Only)

```tsx
// Show edges only on structural elements, not on finishes
scene.traverse((child) => {
  if ((child as THREE.Mesh).isMesh) {
    const mesh = child as THREE.Mesh
    if (mesh.name.startsWith('str_')) {
      // Add Edges component programmatically via geometry
      const edgeGeom = new THREE.EdgesGeometry(mesh.geometry, 15)
      const edgeMat = new THREE.LineBasicMaterial({ color: '#333333' })
      const edges = new THREE.LineSegments(edgeGeom, edgeMat)
      mesh.add(edges)
    }
  }
})
```

### Pattern 3: Outline Selection (Highlight Active Element)

```tsx
<mesh
  ref={meshRef}
  onClick={() => setSelected(true)}
>
  <boxGeometry />
  <meshStandardMaterial color="#E8E8E8" />
  {selected && (
    <Outlines
      thickness={0.03}
      color="#1B3FC4"              // Cobalt selection outline
      screenspace={false}
    />
  )}
</mesh>
```

---

## X-Ray / Transparency Modes

### Global X-Ray Toggle

```tsx
function useXRayMode(scene: THREE.Group, enabled: boolean, targetSystem?: string) {
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return
      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial

      if (!enabled) {
        // Restore original opacity
        mat.transparent = false
        mat.opacity = 1.0
        mat.depthWrite = true
        return
      }

      if (targetSystem && mesh.name.startsWith(targetSystem)) {
        // Highlighted system: full opacity
        mat.transparent = false
        mat.opacity = 1.0
        mat.depthWrite = true
      } else {
        // Everything else: ghost
        mat.transparent = true
        mat.opacity = 0.12
        mat.depthWrite = false
      }
    })
  }, [scene, enabled, targetSystem])
}
```

### Layer Isolation (For Exploded Views)

```tsx
function useLayerIsolation(
  scene: THREE.Group,
  activeLayerId: string | null
) {
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return
      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial

      if (activeLayerId === null) {
        // No isolation — show everything
        mat.transparent = false
        mat.opacity = 1.0
        return
      }

      if (mesh.userData.layerId === activeLayerId) {
        mat.transparent = false
        mat.opacity = 1.0
      } else {
        mat.transparent = true
        mat.opacity = 0.2
      }
    })
  }, [scene, activeLayerId])
}
```

---

## Custom Shaders for SlateCamp

### Violation Pulse Shader

Pulses a mesh between normal and red when a code violation is active:

```tsx
const ViolationPulseMaterial = shaderMaterial(
  {
    uBaseColor: new THREE.Color('#E8E8E8'),
    uViolationColor: new THREE.Color('#E63329'),
    uViolation: 0.0,               // 0.0 = compliant, 1.0 = violating
    uTime: 0.0,
  },
  // Vertex
  /*glsl*/`
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vViewDir = normalize(-mvPos.xyz);
      gl_Position = projectionMatrix * mvPos;
    }
  `,
  // Fragment
  /*glsl*/`
    uniform vec3 uBaseColor;
    uniform vec3 uViolationColor;
    uniform float uViolation;
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      // Simple hemisphere lighting
      float light = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))) * 0.4 + 0.6;

      // Violation pulse: smooth sine wave
      float pulse = smoothstep(0.0, 1.0, sin(uTime * 4.0) * 0.5 + 0.5);
      float intensity = uViolation * mix(0.3, 0.7, pulse);

      // Mix base with violation
      vec3 color = mix(uBaseColor, uViolationColor, intensity);

      // Fresnel edge glow when violating
      float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
      color += uViolationColor * fresnel * uViolation * 0.3;

      gl_FragColor = vec4(color * light, 1.0);
    }
  `
)

extend({ ViolationPulseMaterial })
```

### Dimension Line Shader (Dashed with Depth)

```tsx
const DimensionLineMaterial = shaderMaterial(
  {
    uColor: new THREE.Color('#1B3FC4'),
    uDashSize: 0.05,
    uGapSize: 0.03,
    uOpacity: 1.0,
  },
  /*glsl*/`
    varying float vLineDistance;
    attribute float lineDistance;
    void main() {
      vLineDistance = lineDistance;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /*glsl*/`
    uniform vec3 uColor;
    uniform float uDashSize;
    uniform float uGapSize;
    uniform float uOpacity;
    varying float vLineDistance;
    void main() {
      float totalSize = uDashSize + uGapSize;
      float modVal = mod(vLineDistance, totalSize);
      if (modVal > uDashSize) discard;
      gl_FragColor = vec4(uColor, uOpacity);
    }
  `
)
```

---

## Ground Plane & Scene Composition

### Standard SlateCamp Scene Base

```tsx
function SceneBase({ showGrid = false }: { showGrid?: boolean }) {
  return (
    <group>
      {/* Invisible ground for shadow receiving */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.001, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <shadowMaterial opacity={0.15} />
      </mesh>

      {/* Contact shadow (softer alternative) */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.35}
        scale={12}
        blur={2.5}
        far={4}
        frames={1}                  // Bake once
      />

      {/* Optional grid for technical diagrams */}
      {showGrid && (
        <gridHelper
          args={[10, 20, '#CCCCCC', '#E8E8E8']}
          position={[0, 0.001, 0]}
        />
      )}
    </group>
  )
}
```

### Camera Presets per Module Type

```tsx
const CAMERA_PRESETS = {
  // Single object inspection (stairway, ramp, toilet)
  inspection: {
    position: [3, 2, 5] as const,
    fov: 45,
    orbitTarget: [0, 0.5, 0] as const,
    minDistance: 1.5,
    maxDistance: 10,
  },
  // Floor plan (top-down)
  floorPlan: {
    position: [0, 15, 0] as const,
    fov: 50,
    orbitTarget: [0, 0, 0] as const,
    minDistance: 5,
    maxDistance: 30,
  },
  // Wall section (side view)
  wallSection: {
    position: [5, 1.5, 0] as const,
    fov: 35,
    orbitTarget: [0, 1.5, 0] as const,
    minDistance: 2,
    maxDistance: 8,
  },
  // Isometric (3/4 view)
  isometric: {
    position: [5, 5, 5] as const,
    fov: 35,
    orbitTarget: [0, 0.5, 0] as const,
    minDistance: 3,
    maxDistance: 15,
  },
} as const
```

---

## Color Management

```tsx
// In your app entry point or Canvas setup
THREE.ColorManagement.enabled = true

// Canvas with correct color space
<Canvas
  gl={{
    antialias: true,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.0,
    outputColorSpace: THREE.SRGBColorSpace,
  }}
  flat={false}     // Keep tone mapping (removes for UI-only scenes)
  linear={false}   // Keep sRGB color management
>
```

**SlateCamp color management rules:**
- `ACESFilmicToneMapping` for all 3D scenes (prevents washed-out colors)
- `toneMappingExposure: 1.0` default (adjust per-scene if needed)
- When using SlateCamp brand colors in materials, they display correctly because
  ColorManagement auto-converts hex to linear space
- For `flat` scenes (2D overlays, UI diagrams): set `flat` on Canvas

---

## Visual Quality Checklist

Before any 3D module ships:

```
LIGHTING
[ ] Key light casts shadows (shadow-mapSize 2048)
[ ] Fill light from opposite side
[ ] Ambient ≤ 0.4
[ ] No pure black shadows (ambient prevents this)
[ ] Shadow bias configured (no acne, no peter-panning)

MATERIALS
[ ] All materials use createArchMaterial() or ARCH_MATERIALS constants
[ ] Roughness/metalness values are physically plausible
[ ] No default MeshBasicMaterial on any visible mesh
[ ] Glass uses MeshPhysicalMaterial with transmission
[ ] Ghost/transparent materials have depthWrite: false

EDGES
[ ] Structural elements have Edges or Outlines
[ ] Edge threshold ≈ 15° (shows only hard edges, not smooth surfaces)
[ ] Selected elements have Outlines in Cobalt (#1B3FC4)
[ ] Edge colors are darker than face colors (never lighter)

COMPOSITION
[ ] Ground shadow present (ContactShadows or shadowMaterial)
[ ] Camera default position shows the model's most informative angle
[ ] Scene background is #F2F0EB (SlateCamp cream) or transparent
[ ] No geometry clipping at near/far planes

COLOR
[ ] ColorManagement.enabled = true
[ ] Tone mapping is ACESFilmicToneMapping
[ ] Brand colors (#1B3FC4, #E63329, #1B7A3C, #F5A623) used correctly
[ ] Violation = #E63329, Compliant = #1B7A3C, Selected = #1B3FC4
[ ] No red for low scores or failure states (Signal Red = functional only)
```

---

## Reference Files

| File | When to Read |
|---|---|
| `references/lighting-rigs.md` | Pre-built lighting setups per module type |
| `references/material-presets.md` | Complete PBR material library with texture maps |
| `references/shader-library.md` | Custom GLSL shaders for SlateCamp visual effects |
| `references/post-processing.md` | Post-processing pipeline for polished rendering |
| `references/camera-compositions.md` | Camera angle presets and scene composition rules |
