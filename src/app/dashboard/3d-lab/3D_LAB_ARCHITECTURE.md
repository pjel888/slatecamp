# 3D Lab — Architecture Reference

_Generated: 2026-03-31 | Source: rigorous codebase audit of `src/app/dashboard/3d-lab/`_

---

## Executive Summary

The SlateCamp 3D Lab is a purpose-built, interactive 3D learning environment for Philippine professional architecture licensure exam preparation. It visualizes building codes, architectural history, construction assemblies, and compliance rules as parametric, real-time 3D scenes.

The module is built entirely on **React Three Fiber (R3F)** over **Three.js**, with **Zustand** providing state management and a custom invalidation bridge that eliminates wasteful per-frame re-rendering. All geometry is **procedurally generated at runtime** from declarative `GeometryInstruction[]` arrays — no GLTF/GLB model files are bundled into the application. External pre-authored 3D models (where used) are fetched from Cloudflare R2 CDN at runtime.

The architecture follows a **template-driven module system**: 187 individual module configuration files map to five reusable scene templates. A central `MODULE_REGISTRY` acts as the routing table, mapping module slugs to their template type and metadata. New content is added by creating a module config file — no new scene or rendering code is required.

**Current operational scope:**
- 187 registered modules spanning 15 Philippine architecture subject areas
- 5 reusable scene templates
- 2 legacy bespoke scenes (FAR Playground, Classical Orders)
- 1 generic GLTF model viewer (Workspace)
- Demand-based rendering: Canvas only renders on state change, not on every animation frame

---

## Technology Stack

### Direct Dependencies

| Package | Version | Role |
|---------|---------|------|
| `three` | 0.183.2 | Core WebGL 3D rendering engine. Provides scene graph, geometries, materials, lighting, cameras, loaders, and the WebGL renderer. |
| `@react-three/fiber` | 9.5.0 | React renderer for Three.js. Exposes JSX intrinsics (`<mesh>`, `<boxGeometry>`, `<ambientLight>`) and hooks (`useFrame`, `useThree`). Manages the render loop and Canvas lifecycle. |
| `@react-three/drei` | 10.7.7 | Pre-built R3F abstractions. Used for: `OrbitControls`, `ContactShadows`, `Html` (DOM-in-3D), `Environment`, `Float`, `GLTFLoader`-based helpers. |
| `zustand` | 5.0.12 | Lightweight React state container. Manages parametric values, hotspot state, quiz mode, and the R3F invalidation bridge. Actions call `invalidateFn()` directly to queue Canvas re-renders without triggering React re-renders. |

### Transitive Dependencies (installed via `@react-three/drei`)

| Package | Version | Role |
|---------|---------|------|
| `maath` | 0.10.8 | 3D math utilities: vectors, matrices, quaternions, easing functions. |
| `camera-controls` | 3.1.2 | Advanced orbital camera control system underlying `OrbitControls`. |
| `troika-three-text` | 0.52.4 | SDF-based high-quality 3D text rendering. |
| `troika-three-utils` | 0.52.4 | Utilities supporting Troika text rendering. |
| `three-mesh-bvh` | 0.8.3 | Bounding Volume Hierarchy acceleration for spatial queries and raycasting. |
| `three-stdlib` | 2.36.1 | Extended Three.js utilities, including DRACO decompression integration. |
| `draco3d` | 1.4.1 | DRACO 3D mesh compression codec. Enables loading compressed GLTF files. |
| `meshoptimizer` | 1.0.1 | Mesh compression library used during GLTF optimization. |
| `fflate` | 0.8.2 | Fast DEFLATE compression; used for loading `.gltf.gz`-style assets. |
| `detect-gpu` | 5.0.56 | GPU capability detection for performance-adaptive rendering. |
| `stats-gl` | 2.4.2 | WebGL performance stats overlay (GPU frame time, draw calls). |
| `stats.js` | 0.17.0 | Frame rate and memory monitoring. |
| `@monogrid/gainmap-js` | 3.4.0 | AVIF/JPEG-XL gainmap HDR image support for environment maps. |
| `meshline` | 3.3.1 | Thin line rendering for wireframes and diagram overlays. |
| `glsl-noise` | 0.0.0 | GLSL noise functions for procedural shader effects. |
| `@use-gesture/react` | 10.3.1 | Gesture recognition (pan, pinch, rotate) for touch/pointer interaction. |
| `suspend-react` | 0.1.3 | React Suspense utilities for lazy-loading 3D assets. |
| `hls.js` | 1.5.17 | HTTP Live Streaming support for video textures. |
| `@mediapipe/tasks-vision` | 0.10.17 | MediaPipe computer-vision tasks (gesture/pose detection for interactive scenes). |

### Notably Absent

The following packages are **not installed** and represent deliberate scope boundaries:

- `@react-three/postprocessing` — No bloom, SSAO, depth-of-field, or other post-process effects.
- `@react-three/cannon` / `cannon-es` / `@dimforge/rapier3d-compat` — No physics simulation (Rapier types present via `@types/three` but runtime unused).
- `leva` — No debug GUI panel (replaced by custom `ControlPanel` components).
- `@theatre/r3f` — No timeline-based animation sequencer.
- `r3f-perf` — No in-scene performance profiler (stats-gl fills this role).

### Build Configuration

**Next.js config** (`next.config.ts`): No custom webpack loaders for 3D assets. There are no bundled `.gltf`, `.glb`, `.hdr`, or `.exr` files. External models are loaded at runtime via `fetch` from Cloudflare R2. Turbopack is enabled for development.

**TypeScript** (`tsconfig.json`): Target `ES2017`. Single path alias `@/*` → `./src/*`. No dedicated 3D module aliases.

---

## Directory Structure

```
src/
├── app/dashboard/3d-lab/              # Primary 3D Lab module (Next.js route)
│   ├── page.tsx                       # Route entry point
│   ├── layout.tsx                     # Layout wrapper
│   ├── error.tsx                      # Error boundary
│   ├── loading.tsx                    # Route-level loading state
│   ├── AGENTS.md                      # Agent orchestration documentation
│   │
│   ├── src/features/3d-lab/components/ # Shared UI + rendering components
│   │   ├── CanvasWrapper.tsx           # R3F Canvas setup — lighting, controls, demand render
│   │   ├── LabViewport.tsx             # Module router — dispatches to legacy/template/GLTF
│   │   ├── ModuleViewer.tsx            # Shell: wraps scene with LabTopBar + OnboardingFlow
│   │   ├── ModuleGallery.tsx           # Module browsing / selection UI
│   │   ├── GeometryMesh.tsx            # Geometry factory: GeometryElement + InstructionMesh
│   │   ├── HotspotAnnotation.tsx       # 3D-anchored HTML annotation with quiz integration
│   │   ├── ViolationIndicator.tsx      # Code-compliance visual indicator
│   │   ├── HumanSilhouette.tsx         # Scale reference figure
│   │   └── templates/ParametricSceneRenderer.tsx # Geometry rendering engine for ParametricScene
│   │
│   ├── src/features/3d-lab/config/     # Module configuration layer
│   │   ├── registry/                   # Central registry + subject-area slices
│   │   └── modules/                    # (187 files) One .ts config file per module
│   │       ├── stairway-code-compliance.ts
│   │       ├── fire-travel-distance.ts
│   │       ├── ramp-accessible-toilet.ts
│   │       └── ...                    # ~184 more module configs
│   │
│   ├── src/features/3d-lab/constants/  # Shared constants
│   │   └── nbcpCodes.ts                # NBCP building code numeric constants
│   │
│   ├── src/features/3d-lab/hooks/      # Custom React hooks
│   │   ├── useInvalidateOnChange.ts    # Registers R3F invalidate fn into Zustand
│   │   └── ...                        # 2 additional invalidation variants
│   │
│   ├── src/features/3d-lab/scenes/     # Bespoke legacy scene implementations
│   │   ├── ClassicalOrders/
│   │   │   ├── ClassicalOrders.tsx    # UI wrapper
│   │   │   └── ClassicalOrdersScene.tsx # R3F scene
│   │   ├── FARPlayground/
│   │   │   ├── FARPlayground.tsx      # UI wrapper
│   │   │   ├── FARScene.tsx           # R3F scene (FAR/BHL parametric)
│   │   │   └── FARControlPanel.tsx    # Parameter sliders
│   │   └── NBCPEnvelope/
│   │       ├── NBCPEnvelope.tsx       # UI wrapper
│   │       ├── NBCPScene.tsx          # R3F scene (NBCP envelope compliance)
│   │       ├── NBCPControlPanel.tsx   # Parameter sliders
│   │       └── NBCPTelemetry.tsx      # Analytics tracking
│   │
│   ├── src/features/3d-lab/stores/     # Zustand store definitions
│   │   ├── legacyLabStore.ts          # Compatibility-only store for FAR/ClassicalOrders
│   │   ├── nbcpStore.ts               # NBCP-specific computed envelope state
│   │   └── createModuleStore.ts       # Factory for per-module parameter stores
│   │
│   ├── src/features/3d-lab/templates/  # Reusable scene templates (5 types)
│   │   ├── ParametricScene.tsx         # Slider-driven procedural geometry
│   │   ├── ExplodedAssembly.tsx        # Animated part explosion
│   │   ├── CutawaySectionScene.tsx     # Cross-section with layer fading
│   │   ├── AnimatedSequenceScene.tsx   # Step-by-step fade-in sequence
│   │   └── FloorPlanWalkthrough.tsx    # 2D-to-3D spatial navigation
│   │
│   ├── src/features/3d-lab/types/      # TypeScript type definitions
│   │   └── templates.ts                # TemplateType, ModuleConfig, GeometryInstruction, ViolationRule, etc.
│   │
│   └── src/features/3d-lab/utils/      # Utility functions
│       ├── nbcpCalculator.ts           # NBCP envelope geometry calculations
│       └── nbcpCalculator.test.ts      # Unit tests
│
├── components/3d/
│   └── Workspace.tsx                  # Standalone GLTF model viewer (legacy / cloud-model path)
│
└── components/3d-lab/                 # UI shell components (non-rendering)
    ├── InfoPanel.tsx                  # Side panel for hotspot details
    ├── LabTopBar.tsx                  # Top navigation bar
    ├── ModuleContextCard.tsx          # Module metadata display
    └── OnboardingFlow.tsx             # First-run guidance overlay
```

**Asset storage:** No 3D model files are committed to the repository. Pre-authored models are hosted on Cloudflare R2 and fetched at runtime by `Workspace.tsx` via URL. The seed data schema is defined in `src/data/seed/models_3d.json`.

---

## Core Architecture

### 1. Scene Initialization

Every template-driven and legacy scene is wrapped by `CanvasWrapper` (`src/features/3d-lab/components/CanvasWrapper.tsx`). This component owns the WebGL context lifecycle and establishes the baseline rendering configuration:

```
Canvas (R3F)
  frameloop = "demand"          ← Only renders when invalidate() is called
  dpr = [1, 1.5]                ← Adaptive device pixel ratio (mobile/desktop)
  camera = { position, fov }    ← Perspective camera; default pos [6,6,6], fov 35
  shadows = false               ← Shadow maps disabled globally

  ├── InvalidateRegistrar       ← Internal component; registers useThree().invalidate
  │                                into Zustand labStore.invalidateFn on mount
  │
  ├── ambientLight              ← intensity 0.6 (global fill)
  ├── directionalLight          ← position [10, 10, 5], intensity 1.2 (key light)
  │
  ├── OrbitControls             ← makeDefault=true; configurable polar/distance limits
  │
  ├── ContactShadows            ← position [0, -0.01, 0], opacity 0.25, scale 20
  │   (optional, showGround)       blur 2, far 5 (ground contact depth cue)
  │
  └── Suspense                  ← Lazy-load boundary; fallback=null
        └── {children}          ← Scene or template content
```

`CanvasWrapper` is `memo`-wrapped. A loading overlay (spinner) is displayed until `onCreated` fires, signalling that the WebGL context is ready.

### 2. The Demand Rendering System

The central performance optimization is the **Zustand–R3F invalidation bridge**:

```
UI event (slider change, hotspot click)
  │
  ▼
Zustand action (setParam / setActiveHotspot / setQuizMode)
  │  set({ ...newState })
  │  get().invalidateFn?.()     ← Direct call, no React re-render
  │
  ▼
invalidateFn (= useThree().invalidate, registered on mount)
  │
  ▼
R3F Canvas queues one render frame
  │
  ▼
useFrame hooks fire in 3D components
  │  Read Zustand store values
  │  Lerp transforms toward targets
  │  Call invalidate() again if still animating (drives animation)
  │  Stop calling invalidate() when settled (stops render loop)
  │
  ▼
WebGL frame rendered → GPU output
```

**Effect:** Zero per-frame renders when the scene is idle. The render loop only runs during active animation or user interaction.

### 3. Module Routing (`LabViewport`)

`LabViewport` (`src/features/3d-lab/components/LabViewport.tsx`) is the central dispatch point that maps a `modelId` string to its rendering path:

```
modelId
  │
  ├── 'far-calculator'      → <FARPlayground />          (legacy, dynamic SSR:false)
  ├── 'classical-orders'    → <ClassicalOrders />         (legacy, dynamic SSR:false)
  │
  ├── getModuleById(modelId)  ← looks up MODULE_REGISTRY
  │   → registryEntry found
  │     → <TemplateModuleWrapper moduleId templateType>
  │         │
  │         └── loadModuleConfig(moduleId)
  │               import('@/features/3d-lab/config/modules/${moduleId}')  ← webpack chunk per file
  │               Object.values(mod)[0]                     ← extracts the config export
  │               │
  │               ├── templateType 'parametric'  → <ParametricScene config />
  │               ├── templateType 'exploded'    → <ExplodedAssembly config />
  │               ├── templateType 'floorplan'   → <FloorPlanWalkthrough config />
  │               ├── templateType 'cutaway'     → <CutawaySection config />
  │               └── templateType 'animated'    → <AnimatedSequence config />
  │
  └── no registry entry → <Workspace model parameters hotspots />  (GLTF fallback)
```

All template components and `Workspace` are loaded via `next/dynamic` with `ssr: false`. This prevents Three.js (which requires `window`/`document`) from executing during server-side rendering.

Module config files are webpack-chunked individually — only the chunk for the active module is fetched from the CDN when a user opens that module.

### 4. Asset Pipeline

#### Path A: Procedural Geometry (template-driven modules)

No file I/O occurs. Geometry is constructed entirely in JavaScript at render time:

```
ModuleConfig
  └── geometry(params) → GeometryInstruction[]
        │
        ▼
  GeometryMesh / InstructionMesh
        │
        ├── 'box'      → <boxGeometry args={[w, h, d]} />
        ├── 'cylinder' → <cylinderGeometry args={...} />
        ├── 'plane'    → <planeGeometry args={...} />
        ├── 'sphere'   → <sphereGeometry args={...} />
        ├── 'cone'     → <coneGeometry args={...} />
        ├── 'ring'     → <ringGeometry args={...} />
        └── 'line'     → meshline rendering
              │
              ▼
        <mesh>
          <{type}Geometry />
          <meshStandardMaterial color opacity transparent />
        </mesh>
              │
              ▼
        Three.js scene graph → WebGL draw call
```

Parametric values (from Zustand store or slider state) are passed into `geometry(params)` on each re-render, producing updated `GeometryInstruction[]`. This drives real-time morphing without any file loading.

#### Path B: External GLTF Models (`Workspace.tsx`)

Used only for pre-authored models served from Cloudflare R2:

```
model.url (Cloudflare R2 CDN)
  │
  ▼
GLTFLoader.load(url)
  │
  ▼
scene.traverse(child)
  └── if child.isMesh:
        child.material = MeshStandardMaterial (clone)
        if name matches 'envelope'|'finish': material.transparent = true
  │
  ▼
<primitive object={gltf.scene} />  → Three.js scene graph
  │
  ▼
WebGL output
```

X-Ray opacity is controlled post-load via `scene.traverse` — the material on every matched mesh is updated when the opacity slider changes.

### 5. Animation System

All scene animations use the same pattern: **`useFrame` + `THREE.MathUtils.lerp`**:

```typescript
// Canonical pattern (from NBCPScene, FARScene, ExplodedAssembly, CutawaySection)
useFrame((state, delta) => {
  const target = readFromStore()         // target value
  const current = ref.current.value      // current rendered value

  const next = THREE.MathUtils.lerp(current, target, 0.12)
  ref.current.value = next

  applyToThreeObject(next)               // e.g., scale.set(), material.opacity

  if (Math.abs(next - target) > THRESHOLD) {
    state.invalidate()                   // keep animating — queue next frame
  }
  // When settled: no invalidate() call → render loop stops
})
```

The lerp factor `0.12` produces a ~400ms settle time at 60 fps (exponential ease-out). `delta`-time is used in `AnimatedSequenceScene` for frame-rate-independent fade speeds.

**Violation-driven color changes** (NBCPScene, FARScene): Building mesh color is updated inside `useFrame` by reading `ViolationRule[]` results from the store. No React re-render required.

### 6. HTML-in-3D Overlay System

`@react-three/drei`'s `<Html>` component projects a DOM element into 3D space:

```
<Html
  distanceFactor={N}    ← label scales with camera distance
  occlude={false}       ← not hidden by geometry
  position={[x, y, z]} ← 3D anchor point
>
  <div>                 ← standard DOM; pointer-events managed manually
    {annotation content}
  </div>
</Html>
```

Used by: `HotspotAnnotation`, `NBCPScene` (height/area labels, BHL status), `FARScene` (dimension labels), `CutawaySectionScene` (layer labels).

The outer `Html` wrapper uses `pointerEvents='none'`; interactive content inside uses `pointerEvents='auto'`. This prevents the DOM overlay from interfering with OrbitControls mouse events.

---

## Component Inventory

### Rendering Infrastructure

| Component | File | Responsibility |
|-----------|------|----------------|
| `CanvasWrapper` | `src/features/3d-lab/components/CanvasWrapper.tsx` | R3F Canvas host. Establishes WebGL context, lighting, OrbitControls, ContactShadows, demand rendering via `InvalidateRegistrar`. |
| `InvalidateRegistrar` | Inside `CanvasWrapper.tsx` | Internal R3F component. Calls `useInvalidateOnChange()` to register the R3F `invalidate` function into Zustand on mount. |
| `LabViewport` | `src/features/3d-lab/components/LabViewport.tsx` | Module router. Dispatches `modelId` to legacy scene, template wrapper, or GLTF Workspace. |
| `TemplateModuleWrapper` | Inside `LabViewport.tsx` | Async loader. Fetches module config via webpack dynamic import, then renders the appropriate template component. |

### Scene Templates

| Template | File | Mechanism |
|----------|------|-----------|
| `ParametricScene` | `src/features/3d-lab/templates/ParametricScene.tsx` | Wraps `CanvasWrapper` + `ParametricSceneRenderer`. Slider values drive `geometry(params)` → `GeometryInstruction[]` re-evaluation on each render. |
| `ExplodedAssembly` | `src/features/3d-lab/templates/ExplodedAssembly.tsx` | Parts lerp position from `basePos` to `basePos + explodeOffset * explodeValue`. Supports comparison mode (side-by-side groups). Hover/select emissive highlights. |
| `CutawaySection` | `src/features/3d-lab/templates/CutawaySectionScene.tsx` | Layer meshes fade opacity as `cutPosition` crosses their depth. Uses `useFrame` lerp + `material.needsUpdate = true`. |
| `AnimatedSequence` | `src/features/3d-lab/templates/AnimatedSequenceScene.tsx` | Geometries within each step fade in together when `currentStep` index is reached. Delta-time-based fade speed. |
| `FloorPlanWalkthrough` | `src/features/3d-lab/templates/FloorPlanWalkthrough.tsx` | 2D floor plan rendered in 3D space with navigable egress path overlays. |

### Bespoke Scenes

| Scene | Files | Description |
|-------|-------|-------------|
| `NBCPEnvelope` | `src/features/3d-lab/scenes/NBCPEnvelope/` | National Building Code envelope compliance. 1 unit = 20m (scale 0.05). Renders lot plate, setback zones, neighboring lots, floor plates, BHL reference, building envelope mesh. Building color reflects `ViolationRule[]` state. |
| `FARPlayground` | `src/features/3d-lab/scenes/FARPlayground/` | Floor-to-Area Ratio parametric calculator. 1 unit = 12.5m (scale 0.08). Computes floors from `maxFloorAreaM2 / footprintAreaM2`. |
| `ClassicalOrders` | `src/features/3d-lab/scenes/ClassicalOrders/` | Static exploded comparison of Doric, Ionic, and Corinthian column orders. |

### Geometry & Annotation Primitives

| Component | File | Responsibility |
|-----------|------|----------------|
| `GeometryMesh` | `src/features/3d-lab/components/GeometryMesh.tsx` | Renders a `GeometryInstruction` as a Three.js mesh. `GeometryElement` maps type string to JSX geometry intrinsic; `InstructionMesh` wraps it with `meshStandardMaterial`. |
| `HotspotAnnotation` | `src/features/3d-lab/components/HotspotAnnotation.tsx` | 3D-anchored interactive annotation. Uses `<Html distanceFactor={8}>`. Inactive: 4px dot. Active: 224px card with description and wiki link. Quiz mode: amber variant. |
| `HumanSilhouette` | `src/features/3d-lab/components/HumanSilhouette.tsx` | Scale reference figure (1.7m human silhouette) for spatial context in compliance scenes. |
| `ViolationIndicator` | `src/features/3d-lab/components/ViolationIndicator.tsx` | Visual marker rendered at violation positions in the 3D scene. |

### State Management

| Store | File | State |
|-------|------|-------|
| `useLabStore` | `src/features/3d-lab/stores/legacyLabStore.ts` | Compatibility-only parametric + hotspot store for the remaining FAR Playground / Classical Orders scenes. It is not a route-local shim and should not be used by new registry modules. Tracks `lotArea`, `far`, `bhl`, `setbackFront`, `setbackSide`, `activeHotspotId`, `isQuizMode`, `quizTargetPartId`, and `invalidateFn`. All mutating actions call `invalidateFn()` immediately after `set()`. |
| `useNBCPStore` | `src/features/3d-lab/stores/nbcpStore.ts` | NBCP-specific computed values: buildable envelope dimensions, lot type, violation array. |
| `createModuleStore` | `src/features/3d-lab/stores/createModuleStore.ts` | Factory function returning a Zustand store instance scoped to a single module's parameter definitions. |

### Hooks

| Hook | File | Responsibility |
|------|------|----------------|
| `useInvalidateOnChange` | `src/features/3d-lab/hooks/useInvalidateOnChange.ts` | Reads `useThree().invalidate` and writes it to `useLabStore.setInvalidateFn`. Called once inside `InvalidateRegistrar` (inside Canvas). Bridges R3F's render API to Zustand. |

### Module Configuration System

| File | Role |
|------|------|
| `src/features/3d-lab/config/registry/index.ts` | Exports the module registry and subject areas. Registry entries contain `id`, `title`, `templateType`, `subject`, `codeRef`, `priority`, `status`, and `supportedPhases`. `getModuleById(id)` is the lookup function used by `LabViewport`. |
| `src/features/3d-lab/config/modules/*.ts` (×187) | One file per module. Exports a single `ModuleConfig` object matching the `templateType` discriminated union. Fetched as individual chunks on demand. |

### Module Configuration Schema

Each module config file exports a typed `ModuleConfig` whose shape depends on `templateType`:

```
ModuleConfig (discriminated union on templateType)
  ├── 'parametric': ParametricSceneConfig
  │     ├── parameters: ParameterDef[]    ← auto-generates slider UI
  │     ├── geometry(params) → GeometryInstruction[]
  │     ├── violations?: ViolationRule[]
  │     ├── annotations?: AnnotationDef[]
  │     └── hotspots?: HotspotDef[]
  │
  ├── 'exploded': ExplodedAssemblyConfig
  │     ├── parts: PartDef[]              ← position, basePos, explodeOffset, material
  │     └── groups?: string[]             ← for comparison mode
  │
  ├── 'cutaway': CutawaySectionConfig
  │     └── layers: LayerDef[]            ← depth, material, label, codeRef
  │
  ├── 'animated': AnimatedSequenceConfig
  │     └── steps: StepDef[]             ← array of GeometryInstruction[] with timing
  │
  └── 'floorplan': FloorPlanConfig
        └── rooms, paths, scale, egress  ← floor plan geometry definitions
```

### Subject Area Registry

The `SUBJECT_AREAS` constant in `moduleRegistry.ts` defines 15 top-level subject categories:

| ID | Label | Module Count |
|----|-------|-------------|
| `pd-1096` | PD 1096 (National Building Code) | 28 |
| `ra-9514` | RA 9514 (Fire Code) | 18 |
| `history` | History of Architecture | 33 |
| `nscp` | NSCP (Structural Code) | 16 |
| `construction` | Construction Assemblies | 15 |
| `bp-344` | BP 344 (Accessibility) | 14 |
| `npcp` | NPCP (Plumbing Code) | 14 |
| `materials` | Building Materials | 12 |
| `planning` | Urban Planning & Design | 9 |
| `pec` | PEC (Electrical Code) | 10 |
| `pmec` | PMEC (Mechanical Code) | 8 |
| `housing` | Housing Laws (PD 957/BP 220) | 4 |
| `specs` | Specifications | 2 |
| `estimating` | Estimating | 2 |
| `prof-practice` | Professional Practice | 2 |

### Module Learning Phases

Modules declare their supported learning progression via `supportedPhases`:

| Phase | Description |
|-------|-------------|
| `guided` | Instructor-led walkthrough with annotated hotspots |
| `faded` | Partial hints; student completes missing parameters |
| `sandbox` | Open exploration; all controls unlocked |
| `challenge` | Timed compliance verification; no hints |

---

## Data Flow Summary

```
User interaction (slider / hotspot click / step advance)
        │
        ▼
Zustand store action
  set({ paramKey: newValue })
  get().invalidateFn?.()         ← bypasses React reconciler
        │
        ▼
R3F Canvas queues render (frameloop="demand")
        │
        ▼
useFrame fires in active scene component
  reads store values
  lerps Three.js object transforms (scale, position, opacity)
  updates material.color / material.opacity
  calls invalidate() if still moving
        │
        ▼
Three.js WebGL renderer executes draw calls
        │
        ▼
<Html> overlays project 3D positions to screen coordinates
  (HotspotAnnotation labels, dimension callouts, compliance status)
        │
        ▼
Frame rendered to screen
```

---

_End of document. All data verified against source files as of 2026-03-31._
