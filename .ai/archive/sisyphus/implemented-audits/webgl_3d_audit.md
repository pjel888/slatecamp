# WebGL & 3D Architecture Audit: 2026-04-04

## 📊 Executive Summary
The 3D architecture is currently bifurcated between a highly optimized "New Lab" framework and a legacy "Workspace" viewer that suffers from **VRAM accumulation** and **CPU-bound render loop bottlenecks**. The primary threat to long-term session stability is the **Disposal Gap** in `Workspace.tsx`, where 3D models are swapped in React state without explicit GPU resource cleanup, leading to certain tab crashes as VRAM is exhausted. Additionally, **Transient Object Allocation** inside `useFrame` loops in parametric scenes (FAR/NBCP) creates significant garbage collection (GC) pressure that jitter frame delivery.

## 🧠 VRAM Leaks & Garbage Collection
| Severity | Location (File/Line) | Memory Leak Mechanism | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | `src/components/3d/Workspace.tsx:112` | **Implicit Resource Retention**: `DynamicModel` replaces the `scene` Group in React state when the URL changes. Three.js geometries and materials are not automatically disposed of by React's unmount cycle. Frequent model swapping will orphan hundreds of MBs in VRAM. | **Recursive Disposal**: Implement a `useEffect` cleanup function that traverses the `scene` graph and explicitly calls `.dispose()` on all geometries, materials, and textures before nullifying the state. |
| **HIGH** | `src/components/3d-lab/DevControlsModule/canvas/DevControlsCanvas.tsx:64` | **Background Color Leak**: Instantiating a `new THREE.Color()` inside `useEffect` and assigning it to `scene.background` without a cleanup handler. While small, this pattern of untracked object instantiation outside the R3F lifecycle leads to heap bloat. | **Primitive Initialization**: Use R3F's `<color attach="background" args={[SCENE.SKY_COLOR]} />` to allow the framework to handle the lifecycle and disposal. |
| **MED** | `src/app/dashboard/3d-lab/_components/CanvasWrapper.tsx:100` | **WebGL Context Proliferation**: Multiple `<Canvas>` instances are mounted across different routes without a shared context strategy. This forces the browser to manage multiple WebGL contexts, which is resource-intensive and can lead to "lost context" errors. | **Shared Canvas / Tunneling**: Implement a single, persistent global Canvas (e.g., using `tunnel-rat`) and "portal" scene content into it to maintain a single WebGL context across navigation. |

## ⚡ Render Loop (useFrame) Bottlenecks
| Severity | Location (File/Line) | CPU/GPU Blocking Flaw | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **HIGH** | `src/app/dashboard/3d-lab/_scenes/FARPlayground/FARScene.tsx:68` | **Object Allocation in Loop**: `animRef.current = { w: nw, h: nh }` creates a new object every frame. At 60fps, this generates 60 objects per second per scene, triggering frequent GC pauses that cause "micro-stutter" during animations. | **Ref Mutation**: Mutate existing ref properties directly (e.g., `animRef.current.w = nw`) instead of re-assigning the entire object. Pre-allocate all vectors and objects outside the `useFrame` scope. |
| **HIGH** | `src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPScene.tsx:50` | **State Fetching & Allocation**: Calls `useNBCPStore.getState()` and creates a `target` object literal inside `useFrame`. This is a dual-blocking issue: overhead of store access and immediate object garbage creation. | **Transient Store Access**: Subscribe to specific store primitives via refs or use a more efficient data path to feed the render loop. Pre-allocate the `target` structure as a persistent ref. |
| **MED** | `src/app/dashboard/3d-lab/_templates/CutawaySectionScene.tsx:66` | **Material Update Thrashing**: Setting `matRef.current.needsUpdate = true` on every frame inside `useFrame` while animating opacity. This forces Three.js to re-evaluate the shader program status every frame, adding unnecessary CPU overhead. | **Uniform-Based Animation**: Only set `needsUpdate` when the material properties actually change (e.g., when the animation starts or finishes), or use a custom shader with a `uOpacity` uniform that doesn't trigger a program check. |

## 🧊 Draw Calls & Geometry Optimization
| Severity | Location (File/Line) | Inefficiency Mechanism | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **HIGH** | `src/components/3d/Workspace.tsx:150` | **Unoptimized Asset Delivery**: GLB models are loaded via raw `GLTFLoader` without a DRACO or KTX2 decoder. This leads to massive network payloads and slow GPU upload times (blocked main thread during parsing). | **DRACO/KTX2 Pipeline**: Implement `useGLTF` from `@react-three/drei` and configure it with a DRACO decoder worker to compress meshes and textures, reducing TTI (Time to Interaction). |
| **HIGH** | `src/app/dashboard/3d-lab/_scenes/FARScene.tsx:100-150` | **Individual Mesh Proliferation**: Property lines, setbacks, and floor plates are rendered as independent `<mesh>` components with their own geometries. This creates a high draw-call-to-complexity ratio (15+ draw calls for simple boxes). | **Geometry Merging / Instancing**: Use `InstancedMesh` for repeated elements like floor plates and setback zones. Merge property boundary geometries into a single BufferGeometry to reduce draw calls to 1. |
| **MED** | `src/components/3d/Workspace.tsx:165` | **Static Scene Energy Drain**: Legacy `Workspace` canvas does not use `frameloop="demand"`. It renders at 60fps even when the scene is static and the user is not interacting, draining device batteries. | **Demand-Based Rendering**: Apply `frameloop="demand"` to all Canvas instances and implement the `invalidate` bridge to only render frames when state changes or animations are active. |

## 🗺️ Strategic Implementation Roadmap
1. **Phase 1: FPS Stabilization (The Render Loop)**
   - Eliminate all object and array allocations (`{}`, `[]`) inside `useFrame` across all scenes.
   - Refactor `FARScene` and `NBCPScene` to mutate primitive ref values directly.
   - Move `useStore.getState()` calls out of the high-frequency loop where possible.

2. **Phase 2: VRAM Leak Plugging**
   - Implement a standardized `dispose` utility that recursively cleans up 3D objects.
   - Refactor `Workspace.tsx` to use `useGLTF` (Drei) for managed caching and disposal, or add explicit `useEffect` cleanup to `DynamicModel`.
   - Implement `frameloop="demand"` on the legacy `Workspace` canvas.

3. **Phase 3: Asset & Payload Compression**
   - Configure a global DRACO decoder for all GLB/GLTF assets.
   - Convert repeated scene elements (Floor plates, markers) to `InstancedMesh` to reduce draw calls.
   - Implement a "Global Canvas" portal system to prevent context re-initialization during navigation.
