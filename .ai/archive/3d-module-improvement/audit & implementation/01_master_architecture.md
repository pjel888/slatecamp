# 01 — Master Architecture Reference

**Source:** Segmented from `3DMI-audit_and_implementation.md` (v4 Final)
**Purpose:** Immutable rules, inventory, patterns, and constraints. Read before every phase. Do NOT modify during implementation — update `02_phase_tracker.md` instead.

---

## ABSOLUTE RULE: 2D DOM-Only Text Rendering

**NO text, labels, tooltips, annotations, or pop-ups may EVER be rendered inside the 3D Canvas.**

- **BANNED:** drei `<Html>`, drei `<Text>`, any component inside `<Canvas>` that renders readable text
- **REQUIRED:** 2D DOM overlays via `Vector3.project(camera)` → CSS positioning
- **Pattern:** Scene components write world positions to `useOverlayStore`. Sibling DOM `<DOMOverlayLayer>` projects + renders React/Tailwind UI.
- **Only R3F-side component:** `<CameraSync>` (null-render, writes camera ref to store)

---

## Module Inventory

### Template Types (`src/features/3d-lab/types/templates.ts`)

| Template | Entry | Scene | Store | Configs |
|----------|-------|-------|-------|---------|
| `parametric` | `ParametricScene.tsx` | `ParametricSceneRenderer.tsx` | `createModuleStore()` | ~120 |
| `exploded` | `ExplodedAssembly.tsx` | `ExplodedAssemblyScene.tsx` | `createModuleStore()` | ~25 |
| `floorplan` | `FloorPlanWalkthrough.tsx` | `FloorPlanScene.tsx` | `createModuleStore()` | ~15 |
| `cutaway` | `CutawaySection.tsx` | `CutawaySectionScene.tsx` | `createModuleStore()` | ~10 |
| `animated` | `AnimatedSequence.tsx` | `AnimatedSequenceScene.tsx` | `createModuleStore()` | ~10 |
| `calculator` | `CalculatorTemplate.tsx` | Per-tool scenes | Per-tool stores | 4 |
| `wall-configurator` | `WallConfiguratorTemplate.tsx` | `WallConfiguratorRenderer.tsx` | `useWallLabStore` | 1 |

### Standalone Scenes

| Scene | Canvas Pattern | Store |
|-------|---------------|-------|
| NBCP Envelope (`scenes/NBCPEnvelope/`) | CanvasWrapper + tunnel | `nbcpStore.ts` |
| FAR Playground (`scenes/FARPlayground/`) | CanvasWrapper + tunnel | `legacyLabStore.ts` |
| Classical Orders (`scenes/ClassicalOrders/`) | CanvasWrapper + tunnel | `useLabStore.ts` |
| DevControls (`DevControlsModule/`) | **Own Canvas** | `useDevControlsStore.ts` |

### Infrastructure Status

| File | Status |
|------|--------|
| `components/CanvasWrapper.tsx` | **BROKEN** — ignores 15/16 props |
| `components/shell/LabViewportFrame.tsx` | OK — hardcoded config, no error boundary |
| `components/rendering/SceneBase.tsx` | OK — hardcoded colors |
| `components/rendering/StudioLighting.tsx` | OK — not configurable |
| `components/ModuleViewer.tsx` | OK — no load cancellation |
| `stores/useLabStore.ts` | NEEDS SPLITTING (192 lines, 23 actions) |
| `src/lib/three-utils.ts` | OK — `disposeObject()` never called in modern lab |

---

## Reusable Components (Preserve)

| Component | Quality | Migration Note |
|-----------|---------|---------------|
| `GenericControlPanel` | **Excellent** | Keep as-is |
| `LabPanelLayout` | **Excellent** | Keep — adopt in more templates |
| `useRegisterInvalidate` | **Excellent** | Keep as-is |
| `GeometryMesh/GeometryElement` | Good | Keep as-is |
| `CanvasLoadingOverlay` | Good | Upgrade to progress tracking (P6) |
| `SceneInvalidator` | Good | Keep for calculators |
| `OnboardingFlow` | Good | Keep as-is |
| `ModuleContextCard` | Good | Keep as-is |
| `ComplianceReportPanel` | Good | Keep as-is |
| `HotspotAnnotation` | Needs migration | Rewrite as `HotspotCard.tsx` DOM overlay (P3) |
| `ViolationIndicator` | Needs migration | Rewrite as `ViolationBadge.tsx` DOM overlay (P3) |
| `HumanSilhouette` | Needs migration | Remove `<Html>` label; emit as overlay item (P3) |

**Undocumented drei usage:** `<Environment preset="city" />` in `NBCPEnvelope.tsx:33`. No other module uses this. Decision needed in P1/P4.

---

## Patterns to Preserve

| Pattern | Why |
|---------|-----|
| `frameloop="demand"` + invalidation bridge | Zero GPU when idle |
| `createModuleStore(defaults)` factory | Per-module isolation |
| `SceneTunnel` (tunnel-rat) | Single Canvas, multiple sources |
| Segmented registry with `import()` | 193 configs out of bundle |
| `next/dynamic` with `ssr: false` | Client-only R3F code-splitting |
| `GeometryInstruction[]` declarative geometry | No GLTF — procedural from config |
| Config-driven modules | New module = config + registry entry |

---

## Template Structural Comparison

### Store Creation Bugs

| Template | Deps | Bug? |
|----------|------|------|
| ParametricScene | `[config.id]` | ESLint disable |
| **ExplodedAssembly** | **`[]`** | **YES — stale state** |
| CutawaySection | `[config.id]` | ESLint disable |
| **AnimatedSequence** | **`[]`** | **YES — stale state** |
| FloorPlanWalkthrough | `[config.id]` | ESLint disable |

### Layout Patterns

| Template | Layout | Overlays |
|----------|--------|----------|
| ParametricScene | **LabPanelLayout** | None |
| ExplodedAssembly | Absolute | Slider + info panel |
| CutawaySection | Absolute | Annotation panel + cut slider |
| AnimatedSequence | Absolute | Timeline + step info |
| FloorPlanWalkthrough | Absolute | Control panel + legend + violation |
| WallConfiguratorTemplate | **LabPanelLayout** | None |
| CalculatorTemplate | Custom 3-col grid | FloatingCameraBar |

### Error/Loading: 0/7 templates have error boundaries. Only CalculatorTemplate has empty state.

---

## Backwards Compatibility Contract

### Immutable APIs

| API | Location |
|-----|----------|
| `createModuleStore(defaults)` | `stores/createModuleStore.ts` |
| `ModuleStoreState` interface | `stores/createModuleStore.ts` |
| `TemplateType` union | `types/templates.ts` |
| `ModuleRegistryEntry` | `types/templates.ts` |
| `SceneTunnel` | `components/GlobalCanvasPortal.tsx` |
| `useRegisterInvalidate()` | `src/components/r3f/` |
| `SceneInvalidator` | `src/components/r3f/` |
| `ASSET_TAXONOMY` | `config/taxonomy.ts` |
| `GenericControlPanel` props | `components/templates/` |
| `LabPanelLayout` props | `components/templates/` |

### Identity Lock (NEVER TOUCH)

- `SlideToSubmit.tsx` — gesture physics, colors, animation timing
- `GestureCaptureZone.tsx` — gesture capture wrapper
- `src/lib/quiz/haptics.ts` — haptic feedback

### DevControls Independence

`DevControlsModule/` has own Canvas. **ALL phases MUST leave it untouched.** Reference implementation only.

### Read-Only During Architecture Phases

- `src/features/3d-lab/config/modules/**/*` (193 configs)
- `src/features/3d-lab/config/registry/**/*`
- `src/features/3d-lab/config/taxonomy.ts`

---

## Store Audit Summary

| Store | Lines | Invalidation | Selective? | Lifecycle Cleanup? |
|-------|-------|-------------|-----------|-------------------|
| `createModuleStore` | 47 | Per-action ALL | NO — `setActiveAnnotation` over-invalidates | None |
| `useLabStore` | 192 | NONE (pure UI) | N/A — correct | None |
| `useWallLabStore` | 425 | Selective | **YES — best pattern** | None |
| `useNBCPStore` | 90 | Atomic | N/A | None |
| `useDevControlsStore` | 425 | Aggressive | NO — over-invalidates UI actions | None |
| `legacyLabStore` | 67 | Per-action ALL | No | None |

**ZERO stores call `reset()` on unmount.** All state persists across navigation.

**Recommended pattern:** Per-action invalidation (useWallLabStore pattern). Only geometry-affecting actions call `invalidateFn?.()`.

---

## R3F Best Practices (Research Summary)

- **R3F auto-disposes declarative JSX** — `useDisposeOnUnmount` only for imperative objects
- **`disposeObject()` on cached GLTF is DANGEROUS** — clone scene or use `dispose={null}`
- **ImageBitmap leak** — add `texture.source.data.close?.()` to `disposeObject()`
- **WebGL context loss needs event listeners**, not just error boundaries
- **PerformanceMonitor needs `flipflops={3}`** to prevent DPR oscillation
- **`<Html>` BANNED** — creates separate React renderer per element
- **Single Canvas validated** — tunnel-rat correct for route-level switching
- **KTX2 textures** reduce VRAM 10x
- **`useProgress` from drei** for loading progress (not custom)
