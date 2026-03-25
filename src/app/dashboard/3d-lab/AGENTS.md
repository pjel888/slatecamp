<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# 3d-lab

## Purpose

3D Interactive Lab for spatial learning of architectural concepts using React Three Fiber (R3F) and Three.js. Features a gallery of 187 module configurations covering building codes, structural systems, architectural history, accessibility requirements, fire safety, plumbing, electrical, and more. Each module is rendered as an interactive 3D scene with control panels, hotspot annotations, and informational overlays. Access is tier-gated (Camp+ subscribers or admin bypass).

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Full-viewport layout (`h-full w-full`) -- no SharedPageLayout, since R3F Canvas needs the full height chain |
| `page.tsx` | Server Component -- checks auth + tier access, renders `ModuleGallery` (no model param) or `ModuleViewer` (with `?model=` param) |
| `error.tsx` | Error boundary for 3D rendering failures |
| `loading.tsx` | Skeleton loading state |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `_components/` | 15 client components: CanvasWrapper, ControlPanel, GenericControlPanel, GeometryMesh, HotspotAnnotation, HotspotQuestion, HumanSilhouette, InfoPanel, LabViewport, ModuleGallery, ModuleViewer, PostModuleCTA, ViolationIndicator, FocusModeToggle |
| `_config/` | Module registry (57K, central index) + `modules/` folder with 187 individual module configs |
| `_config/modules/` | 187 TypeScript module definition files (e.g., `accessible-bathing.ts`, `fire-travel-distance.ts`, `classical-orders-comparison.ts`) |
| `_constants/` | NBCP (National Building Code of the Philippines) constants and test file |
| `_hooks/` | 3 hooks: `useInvalidateOnChange`, `useModuleInvalidate`, `useNBCPInvalidateOnChange` |
| `_scenes/` | 3 custom interactive scenes: `ClassicalOrders`, `FARPlayground`, `NBCPEnvelope` |
| `_stores/` | Zustand stores: `createModuleStore` (generic), `labStore` (lab state), `nbcpStore` (NBCP envelope state) |
| `_templates/` | 5 reusable scene templates: AnimatedSequence, CutawaySection, ExplodedAssembly, FloorPlanWalkthrough, ParametricScene (each with a scene renderer) |
| `_types/` | TypeScript type definitions for templates (`templates.ts`, 12K) |
| `_utils/` | NBCP calculator utilities with tests |

## For AI Agents

### Working In This Directory

- **Performance target:** 60 FPS minimum. All R3F components must be optimized for rendering performance. Avoid unnecessary re-renders, use `useMemo`/`useCallback` for geometries and materials.
- **Tier gating:** Access requires Camp+ subscription or admin bypass. The check uses `getFeatureFlags()` and `hasTierAccess()` from `@/lib/admin/feature-flags`. The `bypass3dGate` flag allows admin override.
- **Module architecture:** Each module is a TypeScript config file in `_config/modules/` that defines metadata (title, category, description), control panel parameters, hotspots, and scene configuration. The `moduleRegistry.ts` indexes all 187 modules.
- **Template system:** Modules use one of 5 templates (AnimatedSequence, CutawaySection, ExplodedAssembly, FloorPlanWalkthrough, ParametricScene) that provide reusable 3D rendering patterns. Custom scenes (ClassicalOrders, FARPlayground, NBCPEnvelope) exist for complex interactive visualizations.
- **Layout constraint:** The layout uses `h-full w-full` without `SharedPageLayout` because the R3F Canvas requires an unbroken height chain from the viewport. Using padding or `min-h-full` collapses the 3D viewport to zero.
- **Control panels:** `GenericControlPanel` (13K) provides a data-driven UI for adjusting module parameters. `ControlPanel` is the legacy version.
- **URL-based navigation:** Gallery view (no query params) vs. viewer mode (`?model=moduleId`). No nested routes -- everything is query-param driven from a single `page.tsx`.

### Testing Requirements

- Verify tier-gating: free users should see upgrade prompt, Camp+ users see gallery
- Test module gallery rendering with search and filtering
- Verify individual module viewer loads 3D scene correctly
- Test NBCP calculator utilities (existing tests in `_utils/nbcpCalculator.test.ts` and `_constants/nbcp.test.ts`)
- Confirm hotspot interactions work (click to show annotation/question)
- Performance: ensure 60 FPS in module viewer on standard hardware

### Common Patterns

- **Module config pattern:** Each module in `_config/modules/` exports a config object with `id`, `title`, `category`, `template`, `controls`, `hotspots`, and scene-specific data
- **Store pattern:** `createModuleStore` creates a Zustand store per module instance for managing control state
- **Scene rendering:** Templates receive module config and render appropriate Three.js geometry with R3F primitives
- **Hotspot system:** `HotspotAnnotation` renders clickable 3D markers, `HotspotQuestion` shows quiz overlays at hotspot locations

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/admin/feature-flags` | `getFeatureFlags`, `hasTierAccess` for tier gating |
| `@/lib/admin/get-admin-profile` | `getAdminAwareProfile` for auth + profile |
| `@/lib/constants/routes` | `ROUTES.LOGIN`, `ROUTES.THREE_D_LAB`, `ROUTES.SETTINGS_BILLING` |
| `@/components/graphics/icons/Icon` | `SCIcon` wrapper for consistent icon rendering |
| `@/components/ui/button` | shadcn Button for upgrade CTA |

### External

| Package | Purpose |
|---------|---------|
| `three` | 3D rendering engine |
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | Helper components (OrbitControls, Environment, etc.) |
| `zustand` | Module and lab state management |
| `@phosphor-icons/react` | Icons in control panels and UI |

<!-- MANUAL: -->
