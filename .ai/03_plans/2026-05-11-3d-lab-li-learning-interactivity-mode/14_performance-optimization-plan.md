# 14 — Performance Optimization Plan

## Current Performance Findings

### Positive Findings
- Single `LabViewportFrame` Canvas per module page (no duplicate WebGL contexts)
- `PerformanceMonitor` with adaptive DPR (1-2 desktop, 1-1.25 mobile)
- `frameloop="demand"` — Canvas only renders when needed
- Dynamic imports for all 3D components (`ssr: false`)
- `React.memo` on `CanvasWrapper`
- `InstancedMesh` for repeated geometry (used in parametric renderers)
- DRACO mesh compression support for GLB/GLTF
- `useDisposeOnUnmount` for cleanup
- Module-scoped Zustand stores with selector pattern
- Webpack exclude for test files in dynamic imports

### Areas to Monitor
- No texture preloading pipeline (not needed for LI MVP — programmatic geometry)
- No formal performance regression tests
- No bundle size monitoring for new template variants
- Scene regeneration in parametric renderers (not applicable to LI — static geometry)

## 3D Renderer / Canvas Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Adding LI creates second Canvas | **Zero** — LI reuses single Canvas via SceneTunnel | N/A | No action needed |
| LI geometry adds draw calls | Low — LI has simpler geometry than parametric scenes | Low | Same PerformanceMonitor handles it |
| SceneTunnel overhead for LI | Negligible | None | Already proven with 7 template types |

### Conclusion: Canvas architecture is already safe for LI addition.

## Asset / Model Loading Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LI module config increases page JS | Low — configs are dynamically imported | Low | Configs are ~1-5KB each |
| LI uses large GLB models | Low — MVP uses programmatic geometry | Low | If GLBs added later, use existing DRACO + preloading |
| LI config import time | Low — same pattern as PI configs | Low | Dynamic import with Suspense |

### Recommendation: LI MVP uses programmatic geometry (GeometryInstruction). No GLB loading needed.

## Texture / Material Risks

- **None for MVP**: LI uses programmatic geometry with solid colors via `GeometryInstruction.color`
- **If textures added later**: Follow existing pattern in calculators (cached materials in `calculator-materials.ts`)

## Memory Cleanup / Disposal

| Pattern | Already Implemented? | LI Adoption |
|---------|---------------------|-------------|
| `useDisposeOnUnmount` | Yes | LI scene renderer uses same |
| Module store cleanup on unmount | Yes (ModuleViewer resetSession) | LI inherits |
| Canvas disposal | Handled by R3F | No LI-specific concern |
| SceneTunnel cleanup | Handled by GlobalCanvasPortal | No LI-specific concern |

## Scene Graph Update Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Many layers → many meshes → draw call overhead | Medium | LI modules should have <20 layers; each layer ~1-5 meshes; total <100 draw calls (well within budget) |
| Frequent toggle → frequent scene graph updates | Low | Toggles are user-initiated (not continuous); demand-loop invalidates only on change |
| Layer visibility React reconciliation | Low | Conditional rendering (remove from tree when hidden) is efficient with small mesh counts |

## React Rerender Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Layer toggle updates trigger full scene rerender | Low | Zustand selector pattern isolates subscriptions; scene renderer only re-renders toggled layer's mesh |
| ViewportShell re-renders on layer state change | None | ViewportShell doesn't subscribe to module store |
| Toolbar re-renders | None | SceneToolbar subscribes to ViewportShellStore, not module store |

## State Management Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Module store grows with many layers | Low | Store has ~N boolean entries for N layers; N is small (<20 for MVP) |
| Multiple Zustand subscriptions | Low | LI uses same pattern as PI (createModuleStore → single store per module) |
| Store not cleaned up | Low | ModuleViewer calls resetSession on unmount |

## Bundle Size Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| New template variant adds bundle weight | Low | LearningSceneRenderer + LearningLayerToggles are dynamically imported |
| Type additions | Negligible | Types are compile-time only |
| LI module config | <5KB per config | Dynamically imported |

Estimated LI addition: ~5-10KB gzipped (components + types), well under the 5KB threshold.

## Lazy Loading Strategy

LI follows the exact same pattern as existing templates:

```typescript
// In useTemplateContent or LabViewport
const LearningSceneRenderer = dynamic(
  () => import('@/features/3d-lab/components/learning/LearningSceneRenderer'),
  { ssr: false, loading: () => <LoadingSpinner /> }
)
```

## Caching Strategy

- No cross-module caching needed for LI (each module has independent state)
- SceneTunnel and Canvas are already cached at the LabViewportFrame level
- Module configs are cached by Webpack (dynamic import with stable module IDs)

## Preloading Strategy

- No preloading needed for LI MVP (configs are small, geometry is programmatic)
- If GLB models added later, use existing `AssetPreloader` component

## Model Compression Strategy

- LI MVP uses programmatic geometry — no compression needed
- If GLB models added later, DRACO compression is already configured (`setDecoderPath('/draco/')`)

## Asset Naming / Location Strategy

LI module configs follow existing pattern:
```
src/features/3d-lab/config/modules/[category-folder]/[module-id].ts
```
Example: `src/features/3d-lab/config/modules/02-accessibility/bp344-ramp-layers.ts`

## How Shared Viewport Architecture Affects Performance

The shared `LabViewportFrame` Canvas is a performance **win** for LI:
- Only one WebGL context regardless of mode
- Adaptive DPR handles any scene complexity
- `frameloop="demand"` means LI's static scenes render only on user interaction
- `SceneTunnel` composition has negligible overhead

## Performance Testing Recommendations

### Automated
- Add LI module to existing performance scripts (`.ai/00_performance/scripts/3d-lab-*.mjs`)
- Run `perf:3d:*` scripts with LI module loaded
- Compare frame times: LI should match or exceed PI performance

### Manual
- Test on mid-range Android device (target: 60fps)
- Test layer toggle latency (should be instant — no geometry regeneration)
- Test with all layers visible vs all hidden (should have similar frame times)

### Bundle Analysis
- Compare bundle size before/after LI addition
- Verify LI components are code-split

## MVP Performance Checklist

- [ ] LI scene renderer uses `React.memo`
- [ ] LI components are dynamically imported (`ssr: false`)
- [ ] LI module config is dynamically imported
- [ ] Layer toggles use Zustand selectors (no unnecessary re-renders)
- [ ] Meshes dispose on unmount
- [ ] No duplicate Canvas or WebGL context
- [ ] `frameloop="demand"` used (inherited from LabViewportFrame)
- [ ] Bundle size increase <5KB gzipped (excluding first LI config)
- [ ] Layer toggle response is instant (<16ms)
- [ ] Zero performance regression in PI modules
