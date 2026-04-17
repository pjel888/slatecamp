---
name: slatecamp-r3f-api-master
description: >
  SlateCamp's R3F API Master — memorized the complete React Three Fiber, drei, Three.js,
  and Zustand API at production depth. Every hook signature, every drei component prop,
  every Three.js class method, every edge case. Activate for ALL 3D coding: writing R3F
  components, using drei helpers, constructing BufferGeometry/materials, Zustand stores
  for 3D state, Canvas configuration, useFrame loops, pointer events in 3D, custom
  shaderMaterial, extend(), TypeScript typing for Three.js. Trigger on: "useFrame",
  "useThree", "useGLTF", "Canvas", "drei", "OrbitControls", "Html", "Line", "Text",
  "Edges", "Outlines", "Instances", "Environment", "shaderMaterial", "extend",
  "invalidate", "BufferGeometry", "MeshStandardMaterial", "Vector3", "zustand",
  "R3F event", "onClick mesh", "dispose", "primitive", "attach".
---

# SlateCamp — R3F API Master Reference

## The Mastery Standard

You write code that:
- Compiles on first paste — zero TypeScript errors, zero runtime warnings
- Handles every edge case — null checks, disposal, unmount cleanup, SSR guards
- Follows Poimandres conventions — the people who built R3F, drei, and Zustand
- Performs at enterprise level — no allocations in render loops, no re-render cascades
- Is typed exhaustively — no `any`, explicit return types, discriminated unions

---

## React Three Fiber Core API

### Canvas Props (Complete)

```tsx
<Canvas
  // RENDERING
  gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
  dpr={[1, 2]}                    // Device pixel ratio [min, max]
  shadows                          // Enable shadow maps (shorthand for shadows={true})
  shadows="soft"                   // PCFSoftShadowMap
  frameloop="demand"               // 'always' | 'demand' | 'never'
  flat                             // Disables tone mapping (for UI/diagram scenes)
  linear                           // Disables color management (sRGB encoding)
  orthographic                     // Use OrthographicCamera instead of Perspective

  // CAMERA
  camera={{
    position: [3, 2, 5],
    fov: 45,                       // PerspectiveCamera only
    near: 0.1,
    far: 1000,
    zoom: 1,                       // OrthographicCamera only
  }}

  // SIZING
  style={{ background: '#F2F0EB' }}
  resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}

  // EVENTS
  onCreated={(state) => {}}        // Called after canvas is created
  onPointerMissed={() => {}}       // Click outside any mesh

  // PERFORMANCE
  performance={{ min: 0.5, max: 1, debounce: 200 }}
  events={undefined}               // Custom event layer

  // REACT 18 CONCURRENCY
  // Canvas renders in a concurrent-safe way by default in React 18
>
```

### useThree — Complete State Selectors

```tsx
// CRITICAL: Always use selectors to prevent re-renders
const camera = useThree(s => s.camera)
const gl = useThree(s => s.gl)                    // WebGLRenderer
const scene = useThree(s => s.scene)
const size = useThree(s => s.size)                // { width, height }
const viewport = useThree(s => s.viewport)        // { width, height, factor, distance }
const raycaster = useThree(s => s.raycaster)
const pointer = useThree(s => s.pointer)          // { x, y } normalized [-1, 1]
const clock = useThree(s => s.clock)              // THREE.Clock
const invalidate = useThree(s => s.invalidate)    // Trigger frame in demand mode
const advance = useThree(s => s.advance)          // Advance one frame in 'never' mode
const setSize = useThree(s => s.setSize)
const setDpr = useThree(s => s.setDpr)
const setEvents = useThree(s => s.setEvents)
const get = useThree(s => s.get)                  // Get current state snapshot
const performance = useThree(s => s.performance)  // { current, min, max, regress }

// ❌ NEVER do this — subscribes to ALL state changes
const state = useThree()

// ✅ Always select specific fields
const { camera, gl } = useThree(s => ({ camera: s.camera, gl: s.gl }))
```

### useFrame — The Render Loop

```tsx
// Basic — delta is time since last frame in seconds
useFrame((state, delta) => {
  meshRef.current.rotation.y += delta * 0.5
})

// Priority — lower runs first (-1 before 0 before 1)
useFrame((state, delta) => {
  // Physics step BEFORE rendering
}, -1)

// Access full state
useFrame(({ clock, camera, pointer, scene, gl }) => {
  // clock.elapsedTime — total seconds since start
  // clock.getDelta() — DO NOT USE, useFrame already provides delta
})

// Conditional frame work
useFrame((state, delta) => {
  if (!meshRef.current) return  // ALWAYS null-check refs
  // ...
})
```

**useFrame rules:**
- NEVER call `setState` inside useFrame
- NEVER allocate objects (`new Vector3()`) inside useFrame
- ALWAYS null-check refs before accessing `.current`
- ALWAYS multiply movement by `delta` for frame-rate independence

### useLoader — Asset Loading with Cache

```tsx
// Basic (auto-cached by URL)
const texture = useLoader(THREE.TextureLoader, '/textures/concrete.jpg')
const gltf = useLoader(GLTFLoader, '/models/stairway.glb')

// Multiple assets in parallel
const [tex1, tex2] = useLoader(THREE.TextureLoader, ['/a.jpg', '/b.jpg'])

// With Draco decoder
const gltf = useLoader(GLTFLoader, '/model.glb', (loader) => {
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('/draco/')
  loader.setDRACOLoader(dracoLoader)
})

// Preload (call at module level, outside components)
useLoader.preload(GLTFLoader, '/models/stairway.glb')
```

---

## drei Components — Enterprise Patterns

### Html — The 3D-to-DOM Bridge

```tsx
<Html
  position={[1, 2, 0]}           // 3D world position
  center                          // Center the HTML element
  distanceFactor={8}              // Scale with distance from camera
  occlude                          // Hide when behind geometry (expensive)
  occlude="blending"              // Fade instead of hide
  transform                        // Apply 3D transforms to the HTML element
  sprite                           // Always face camera (billboard)
  style={{ pointerEvents: 'auto' }} // CRITICAL: enable clicks
  portal={{ current: domNode }}    // Render into a different DOM node
  zIndexRange={[100, 0]}          // Z-index range for CSS stacking
  prepend                          // Prepend to portal instead of append
  as="div"                         // HTML element type
  wrapperClass="html-wrapper"     // CSS class on wrapper div
  className="my-tooltip"          // CSS class on content div
>
  <div>Your HTML content</div>
</Html>
```

**Html gotchas:**
- `pointerEvents: 'auto'` is REQUIRED for clicks — default is 'none'
- `occlude` is expensive — use only when absolutely necessary
- `distanceFactor` affects BOTH size and interaction area
- Html content does NOT participate in R3F's event system — use DOM events

### Edges — Architectural Wireframe Overlay

```tsx
// Auto-extracts edges from parent geometry
<mesh>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="#E8E8E8" />
  <Edges
    threshold={15}                // Crease angle in degrees (default: 15)
    color="#1B3FC4"               // Edge color
    lineWidth={1}                 // Edge width (pixels, WebGL ignores > 1)
    scale={1.001}                 // Slight scale to prevent z-fighting
  />
</mesh>

// Manual geometry
<Edges geometry={customGeometry} color="black" />
```

### Outlines — Inverted Hull Outlines

```tsx
<mesh>
  <boxGeometry />
  <meshStandardMaterial />
  <Outlines
    thickness={0.05}              // Outline thickness (world units)
    screenspace={false}           // Thickness independent of zoom
    color="black"
    opacity={1}
    transparent={false}
    angle={Math.PI}               // Crease angle (0 = no crease)
  />
</mesh>
```

### Line / QuadraticBezierLine / CubicBezierLine

```tsx
import { Line } from '@react-three/drei'

// Polyline
<Line
  points={[[0, 0, 0], [1, 1, 0], [2, 0, 0]]}
  color="#1B3FC4"
  lineWidth={2}                   // Pixels (works in WebGL!)
  dashed={false}
  dashSize={0.1}
  gapSize={0.05}
  vertexColors={[[1, 0, 0], [0, 1, 0], [0, 0, 1]]}  // Per-vertex colors
/>

// Bezier curves
<QuadraticBezierLine
  start={[0, 0, 0]}
  mid={[0.5, 1, 0]}              // Control point
  end={[1, 0, 0]}
  color="red"
  lineWidth={1}
  segments={20}
/>
```

### Text — SDF Text Rendering (troika-3d-text)

```tsx
import { Text } from '@react-three/drei'

<Text
  position={[0, 1, 0]}
  fontSize={0.15}
  color="#1B3FC4"
  anchorX="center"                // 'left' | 'center' | 'right'
  anchorY="middle"                // 'top' | 'top-baseline' | 'middle' | 'bottom-baseline' | 'bottom'
  font="/fonts/Inter-Regular.woff"
  maxWidth={2}                    // Line wrap width
  textAlign="center"
  outlineWidth={0.01}
  outlineColor="white"
>
  PD 1096 Sec 4.08
</Text>
```

### Environment — IBL Lighting

```tsx
<Environment
  preset="city"                   // 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night'
  background={false}              // Show as background
  blur={0}                        // Background blur (0-1)
  intensity={1}                   // Light intensity multiplier
  ground={{                       // Ground projection
    height: 15,
    radius: 60,
    scale: 1000,
  }}
/>

// Custom HDR
<Environment files="/hdr/studio.hdr" />
```

### ContactShadows — Ground Shadows Without Shadow Maps

```tsx
<ContactShadows
  position={[0, 0, 0]}
  opacity={0.4}
  scale={10}                      // Shadow ground plane size
  blur={2}                        // Shadow blur
  far={4}                         // Maximum shadow distance
  resolution={256}                // Shadow map resolution
  color="#000000"
  frames={1}                      // Bake shadow on first frame only (perf!)
/>
```

### Instances — Batched Draw Calls

```tsx
<Instances limit={1000} range={1000}>
  <boxGeometry />
  <meshStandardMaterial />
  {positions.map((pos, i) => (
    <Instance
      key={i}
      position={pos}
      rotation={rotations[i]}
      scale={scales[i]}
      color={colors[i]}           // Per-instance color
    />
  ))}
</Instances>
```

### Detailed — Level of Detail

```tsx
<Detailed distances={[0, 20, 50]}>
  <HighPoly />                    // Distance 0-20
  <MedPoly />                     // Distance 20-50
  <LowPoly />                    // Distance 50+
</Detailed>
```

### PerformanceMonitor — Adaptive Quality

```tsx
<PerformanceMonitor
  onIncline={() => setDpr(2)}
  onDecline={() => setDpr(1)}
  onChange={({ factor }) => setDpr(Math.round(0.5 + 1.5 * factor))}
  flipflops={3}
  onFallback={() => setDpr(1)}
  bounds={(fps) => (fps > 50 ? 'incline' : fps < 30 ? 'decline' : 'idle')}
>
  <Scene />
</PerformanceMonitor>
```

---

## Three.js Core Classes — Quick Reference

### Geometry Construction (BufferGeometry)

```tsx
const geometry = new THREE.BufferGeometry()

// Positions (required) — 3 floats per vertex
const positions = new Float32Array([
  0, 0, 0,   1, 0, 0,   0.5, 1, 0,  // Triangle
])
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

// Normals (required for lighting)
const normals = new Float32Array([
  0, 0, 1,   0, 0, 1,   0, 0, 1,
])
geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))

// UVs (required for textures)
const uvs = new Float32Array([
  0, 0,   1, 0,   0.5, 1,
])
geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

// Indexed geometry (share vertices) — reduces memory
const indices = new Uint16Array([0, 1, 2])
geometry.setIndex(new THREE.BufferAttribute(indices, 1))

// Compute derived data
geometry.computeBoundingBox()
geometry.computeBoundingSphere()
geometry.computeVertexNormals()  // Auto-calculate from face normals

// Cleanup
geometry.dispose()  // ALWAYS dispose when done
```

### Material System

```tsx
// Architectural materials
const concrete = new THREE.MeshStandardMaterial({
  color: '#B8B4A8',
  roughness: 0.9,
  metalness: 0.0,
  side: THREE.FrontSide,          // FrontSide | BackSide | DoubleSide
})

const glass = new THREE.MeshPhysicalMaterial({
  color: '#E8EDF2',
  roughness: 0.05,
  metalness: 0.0,
  transmission: 0.9,              // Glass transparency
  thickness: 0.5,                 // Refraction thickness
  ior: 1.5,                       // Index of refraction
  transparent: true,
})

const steel = new THREE.MeshStandardMaterial({
  color: '#8A8A8A',
  roughness: 0.2,
  metalness: 0.9,
})

// Clipping planes support
material.clippingPlanes = [plane]
material.clipShadows = true

// Disposal
material.dispose()
material.map?.dispose()           // Dispose textures too
```

### Custom Shader Materials in R3F

```tsx
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

const ViolationMaterial = shaderMaterial(
  // Uniforms
  {
    uColor: new THREE.Color('#E8E8E8'),
    uViolationColor: new THREE.Color('#E63329'),
    uViolationAmount: 0.0,
    uTime: 0,
  },
  // Vertex shader
  /*glsl*/`
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  /*glsl*/`
    uniform vec3 uColor;
    uniform vec3 uViolationColor;
    uniform float uViolationAmount;
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      // Simple directional lighting
      float light = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))) * 0.5 + 0.5;

      // Pulse violation color
      float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
      float violationIntensity = uViolationAmount * pulse;

      vec3 color = mix(uColor, uViolationColor, violationIntensity);
      gl_FragColor = vec4(color * light, 1.0);
    }
  `
)

extend({ ViolationMaterial })

// Usage in JSX
<mesh>
  <boxGeometry />
  <violationMaterial
    key={ViolationMaterial.key}  // Enables hot reload
    uColor="#E8E8E8"
    uViolationAmount={isViolating ? 1.0 : 0.0}
    ref={materialRef}
  />
</mesh>

// Animate in useFrame
useFrame(({ clock }) => {
  if (materialRef.current) {
    materialRef.current.uTime = clock.elapsedTime
  }
})
```

---

## Zustand for 3D State — Complete Patterns

### Store with Selectors (Prevents Canvas Re-renders)

```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface LabStore {
  // Parameters
  parameters: Record<string, number>
  setParameter: (key: string, value: number) => void

  // UI state
  activeHotspot: string | null
  setActiveHotspot: (id: string | null) => void
  explodeAmount: number
  setExplodeAmount: (amount: number) => void

  // Build/tour state
  buildStep: number
  nextStep: () => void
  prevStep: () => void
  resetBuild: () => void

  // System visibility (MEP toggles)
  visibleSystems: string[]
  toggleSystem: (id: string) => void
}

export const useLabStore = create<LabStore>()(
  subscribeWithSelector((set, get) => ({
    parameters: { rise: 0.180, run: 0.270, width: 1.200 },
    setParameter: (key, value) =>
      set(s => ({ parameters: { ...s.parameters, [key]: value } })),

    activeHotspot: null,
    setActiveHotspot: (id) => set({ activeHotspot: id }),

    explodeAmount: 0,
    setExplodeAmount: (amount) => set({ explodeAmount: amount }),

    buildStep: 0,
    nextStep: () => set(s => ({ buildStep: s.buildStep + 1 })),
    prevStep: () => set(s => ({ buildStep: Math.max(0, s.buildStep - 1) })),
    resetBuild: () => set({ buildStep: 0 }),

    visibleSystems: ['structural'],
    toggleSystem: (id) => set(s => ({
      visibleSystems: s.visibleSystems.includes(id)
        ? s.visibleSystems.filter(sys => sys !== id)
        : [...s.visibleSystems, id],
    })),
  }))
)

// ✅ Inside Canvas — subscribe with selector, minimal re-renders
function StairwayModel() {
  const rise = useLabStore(s => s.parameters.rise)
  const run = useLabStore(s => s.parameters.run)
  // Only re-renders when rise or run changes
}

// ✅ Subscribe outside React (for imperative updates)
useLabStore.subscribe(
  s => s.parameters.rise,
  (rise) => { console.log('Rise changed:', rise) }
)
```

---

## R3F Event System

```tsx
<mesh
  onClick={(e) => {
    e.stopPropagation()           // Prevent event from reaching meshes behind
    console.log(e.point)          // THREE.Vector3 — world-space intersection
    console.log(e.distance)       // Distance from camera
    console.log(e.face)           // Intersected face
    console.log(e.faceIndex)      // Face index
    console.log(e.uv)             // UV coordinates at intersection
    console.log(e.object)         // The mesh that was hit
  }}
  onPointerOver={(e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }}
  onPointerOut={(e) => {
    document.body.style.cursor = 'auto'
  }}
  onDoubleClick={(e) => {}}
  onPointerDown={(e) => {}}
  onPointerUp={(e) => {}}
  onPointerMove={(e) => {}}
  onContextMenu={(e) => {}}       // Right-click
  onWheel={(e) => {}}
/>
```

**Event gotchas:**
- ALWAYS `e.stopPropagation()` to prevent event leaking to objects behind
- Events fire on the NEAREST mesh first, then propagate outward
- Transparent objects STILL receive events (use `raycast={null}` to disable)
- `onPointerMissed` is on Canvas, not on mesh — fires when clicking empty space

---

## TypeScript Patterns for Three.js

```typescript
// Ref typing
const meshRef = useRef<THREE.Mesh>(null)
const groupRef = useRef<THREE.Group>(null)
const materialRef = useRef<THREE.MeshStandardMaterial>(null)

// GLTF result typing
interface GLTFResult extends GLTF {
  nodes: {
    stairway_main: THREE.Mesh
    handrail_left: THREE.Mesh
  }
  materials: {
    Concrete: THREE.MeshStandardMaterial
    Metal: THREE.MeshStandardMaterial
  }
}

const { nodes, materials } = useGLTF('/model.glb') as GLTFResult

// Scene traversal with type guards
scene.traverse((child) => {
  if ((child as THREE.Mesh).isMesh) {
    const mesh = child as THREE.Mesh
    // Now TypeScript knows this is a Mesh
  }
})

// Extending R3F's JSX namespace
declare global {
  namespace JSX {
    interface IntrinsicElements {
      violationMaterial: ReactThreeFiber.Object3DNode<
        typeof ViolationMaterial & THREE.ShaderMaterial,
        typeof ViolationMaterial
      >
    }
  }
}
```

---

## Reference Files

| File | When to Read |
|---|---|
| `references/drei-full-api.md` | Complete drei component reference with every prop |
| `references/threejs-class-methods.md` | Three.js class methods frequently used in SlateCamp |
| `references/r3f-event-patterns.md` | Advanced event handling patterns for interactive 3D |
| `references/zustand-3d-patterns.md` | Zustand middleware and subscription patterns for 3D |
| `references/typescript-threejs.md` | TypeScript patterns for Three.js and R3F |
