<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Calculators

## Purpose
Free interactive 3D material estimation tool suite for architecture professionals. Four production calculators (flooring, paint, drywall, CHB wall) with Zustand state management, React Three Fiber 3D visualization, and real-time cost/material estimates. Public-facing SEO pages with no auth required.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Index page listing calculator tools with status badges |
| `layout.tsx` | Minimal layout (no dashboard sidebar, standalone metadata) |
| `_stores/types.ts` | `BaseCalculatorStore` interface and factory for Zustand stores |
| `_stores/{flooring,paint,drywall,chb}Store.ts` | Tool-specific Zustand stores (inputs, computed, view modes) |
| `_lib/*-engine.ts` | Calculation engines (flooring, paint, drywall, CHB) with material/waste logic |
| `_lib/__tests__/*-engine.test.ts` | Jest test suites for engines |
| `_lib/{input-validation,unit-conversion,freemium,calculator-materials}.ts` | Shared utilities |
| `{flooring,paint,drywall,chb}/page.tsx` | Tool entry pages |
| `{flooring,paint,drywall,chb}/_components/{*Calculator,*Scene,*InputPanel}.tsx` | Client components (UI + R3F scenes) |
| `_components/{ResultRow,EstimationDisclaimer,CanvasEmptyState,SponsorCard,ExportActions,AssumptionsAccordion,FloatingCameraBar}.tsx` | Shared calculator UI components |

## For AI Agents
### Working In This Directory
- **Public pages** — no auth gate, SEO-friendly metadata on layout
- **Three-tier state:** Zustand store (inputs + view modes) → engine (calculations) → components (display)
- **R3F constraint:** 60 FPS target. Watch `inputVersion` in stores to trigger Scene re-renders
- **Freemium logic:** Some features behind paywall; see `_lib/freemium.ts` for gate checks
- **Unit handling:** All engines use standard units (mm for dimensions, kg for materials); conversion layer in `_lib/unit-conversion.ts`
- **Always test engines** with unit tests before deploying calculation changes
- **Metadata on layout, not page** — page.tsx has no metadata export
- **Export/sponsor cards** — keep BOM export and sponsor promotions in top-level components

### Working With Sub-Directories
Each tool (flooring, paint, drywall, chb) follows identical pattern:
1. `page.tsx` — Server component entry point
2. `_components/{ToolCalculator, ToolScene, ToolInputPanel}` — Client triple (Zustand inputs, R3F scene, result display)
3. Scenes are wrapped in Canvas with InvalidationBoundary to catch input mutations

## Dependencies
### Internal
- `@/components/layouts/SharedPageLayout` — Not used; calculators have standalone layout
- `@/lib/constants/site` — `siteConfig`
- `@phosphor-icons/react/dist/ssr` — Icons
- React Three Fiber, Three.js (3D scenes)
- Zustand (state management)
- Tailwind CSS 4 (Campfire tokens)

<!-- MANUAL: -->
