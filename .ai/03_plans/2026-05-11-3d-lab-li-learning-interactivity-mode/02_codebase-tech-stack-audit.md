# 02 — Codebase Tech Stack Audit

## Framework & Language

| Area | Finding | Evidence / Path | LI Implication |
|------|---------|-----------------|----------------|
| Framework | Next.js 16.2.3 (App Router) | `package.json` | Same framework; no new deps needed |
| Language | TypeScript (non-strict mode) | `tsconfig.json` — `strict: false, noImplicitAny: false, strictNullChecks: false` | Non-strict TS means less friction for iterative type additions |
| React | React 19.2.5 | `package.json` | RSC by default; LI viewport content is client-side |
| Runtime | Bun | `package.json` scripts use `bun` | Same |

## Package Manager & Build

| Area | Finding | Evidence / Path | LI Implication |
|------|---------|-----------------|----------------|
| Package manager | Bun (`bun.lock`) | `bun.lock` | Same |
| Build tool | Turbopack | `next.config.ts` — `turbopack { root: ... }` | Same |
| Bundler config | Webpack excludes for test files | `src/features/3d-lab/config/module-paths.ts` — `webpackExclude: /\.(test|spec)\.(ts|tsx)$/` | LI module configs follow same pattern |

## Routing System

| Area | Finding | Evidence / Path | LI Implication |
|------|---------|-----------------|----------------|
| App Router | File-based routing with dynamic segments | `src/app/dashboard/3d-lab/[moduleId]/page.tsx` | LI modules use same `[moduleId]` route |
| Route constants | Centralized in `src/lib/routes.ts` | `ROUTES.lab.root`, `ROUTES.lab.module(id)` | LI modules link via same helpers |
| Layout | `ExploreLayout` wrapper | `src/app/dashboard/3d-lab/layout.tsx` | Same layout for LI |
| Redirects | Legacy wall-configurator → unified | `src/app/dashboard/3d-lab/[moduleId]/page.tsx` line 21 | No LI-specific redirects needed |

## UI Framework & Component System

| Area | Finding | Evidence / Path | LI Implication |
|------|---------|-----------------|----------------|
| Component library | shadcn/ui (base-nova style) | `components.json` — `"style": "base-nova"` | Same component toolkit available |
| Icons | Phosphor Icons + Lucide | Imported throughout; `@phosphor-icons/react` | Same icon set |
| Animation | Framer Motion | `package.json` | Available for LI if needed |
| Rich text | Tiptap + CodeMirror | `package.json` | Not relevant to LI MVP |
| Charts | Recharts | `package.json` | Not relevant to LI MVP |

## Styling System

| Area | Finding | Evidence / Path | LI Implication |
|------|---------|-----------------|----------------|
| CSS framework | Tailwind CSS v4.2.4 | `package.json`; no `tailwind.config.*` file | Same; v4 CSS-based config |
| PostCSS | `@tailwindcss/postcss` plugin | `postcss.config.mjs` | Same |
| Design tokens | CSS variables in `globals.css` | `src/app/globals.css` | LI inherits same tokens |
| Custom classes | `bg-surface-light`, `bg-card`, `text-muted-foreground`, etc. | Used throughout | LI uses same conventions |
| Animations | `tw-animate-css` | `package.json` | Same |

## 3D Rendering Stack

| Area | Finding | Evidence / Path | LI Implication |
|------|---------|-----------------|----------------|
| 3D library | React Three Fiber (`@react-three/fiber`) | `package.json`; imported in 130+ files | LI uses same R3F stack |
| Drei helpers | `@react-three/drei` | Used for OrbitControls, Html, Line, Edges, Environment, etc. | LI uses same |
| Three.js | `three` (core) | `package.json`; `Vector3`, `Color`, `MathUtils` used throughout | LI uses same |
| Canvas host | `LabViewportFrame` | `src/features/3d-lab/components/shell/LabViewportFrame.tsx` | LI reuses this; NO duplicate Canvas |
| Scene composition | `SceneTunnel` (portal pattern) | `src/features/3d-lab/components/GlobalCanvasPortal.tsx` | LI scene content portals through same tunnel |
| Per-module scene config | `CanvasWrapper` → `SceneConfig` | `src/features/3d-lab/components/CanvasWrapper.tsx` | LI uses same wrapper pattern |
| DRACO | `useGLTF.setDecoderPath('/draco/')` | `LabViewportFrame.tsx` line 15 | LI inherits DRACO support |
| Performance | `PerformanceMonitor` with adaptive DPR | `LabViewportFrame.tsx` line 179 | LI inherits same |
| Asset preloading | `AssetPreloader` | `src/features/3d-lab/components/rendering/AssetPreloader.tsx` | Available for LI if needed |
| GLTF loading | `useGLTF` from drei | Used in Workspace, some scenes | LI can use if loading GLB models |
| Geometry generation | `GeometryInstruction` system (box, cylinder, plane, etc.) | `src/features/3d-lab/types/templates.ts` | LI can use programmatic geometry |
| Template mesh renderers | `GeometryMesh`, `InstancedMesh`, `ArchMass` | `src/features/3d-lab/components/templates/` | LI can reuse these |

## State Management

| Area | Finding | Evidence / Path | LI Implication |
|------|---------|-----------------|----------------|
| Global state | Zustand | `package.json` | Same |
| Lab navigation | `useLabNavigationStore` | `src/features/3d-lab/stores/useLabNavigationStore.ts` | LI can use (or not) |
| Lab progress | `useLabProgressStore` | `src/features/3d-lab/stores/useLabProgressStore.ts` | LI may use for layer toggle state |
| Lab view | `useLabViewStore` | `src/features/3d-lab/stores/useLabViewStore.ts` | LI uses for camera/view state |
| Viewport shell | `useViewportShellStore` | `src/features/3d-lab/stores/useViewportShellStore.ts` | LI uses for grid/dim/xray toggles |
| Module-scoped | `createModuleStore` | `src/features/3d-lab/stores/createModuleStore.ts` | LI creates its own module store with layer defaults |
| Parametric values | `parametricValues: Record<string, number>` in progress store | PI-specific | LI does NOT use this; uses separate layer state |

## Data / Config Organization

| Area | Finding | Evidence / Path | LI Implication |
|------|---------|-----------------|----------------|
| Module registry | 187 entries in `ALL_MODULES` | `src/features/3d-lab/config/registry/index.ts` | LI modules added to same registry |
| Module configs | Dynamic imports by category folder | `src/features/3d-lab/config/module-paths.ts` | LI configs follow same pattern |
| Category taxonomy | 16 LEA-aligned categories | `src/features/3d-lab/config/taxonomy.ts` | LI modules use same categories |
| Dashboard visibility | `DASHBOARD_VISIBLE_IDS` Set | `src/features/3d-lab/config/dashboard-visibility.ts` | LI modules can be added to same set |
| Types | `src/types/3d-lab.ts`, `src/features/3d-lab/types/templates.ts` | Two type files | LI types extend same files |

## Asset Handling

| Area | Finding | Evidence / Path | LI Implication |
|------|---------|-----------------|----------------|
| 3D models | GLB/GLTF via `useGLTF` | DRACO configured in LabViewportFrame | LI can use GLB models or programmatic geometry |
| Textures | Referenced in asset preloading manifest | `ModuleRegistryEntry.assets` | LI uses same if needed |
| Admin upload | `AssetUploader` for `.glb`/`.gltf` | `src/components/admin/AssetUploader.tsx` | Same upload path |
| Static assets | `/public/` directory | Standard Next.js | LI models served from public |

## Test Frameworks

| Area | Finding | Evidence / Path | LI Implication |
|------|---------|-----------------|----------------|
| Unit/component | Vitest 4.1.5 | `package.json`, `vitest.config.ts` | LI tests use Vitest |
| E2E | Playwright 1.59.1 | `package.json`, `playwright.config.ts` | LI E2E tests use Playwright |
| Component stories | Storybook 8.6.17 | `.storybook/`, `*.stories.tsx` files | LI components can have stories |
| 3D Lab tests | 15 test files in `src/features/3d-lab/` | E.g., `stairway-geometry.test.ts` | LI adds tests to same location |
| E2E 3D Lab | `e2e/authenticated-demo-3d-lab.spec.ts` | 3 tests: reach dashboard, reach module, invalid slug | LI adds E2E cases |

## Lint / Format

| Area | Finding | Evidence / Path | LI Implication |
|------|---------|-----------------|----------------|
| Linter | ESLint 9 (flat config) | `eslint.config.mjs` | Same |
| Type check | `bun run type-check` | `package.json` scripts | Run after LI type changes |

## Relevant Config Files

| File | Relevance to LI |
|------|-----------------|
| `package.json` | Scripts for testing, building |
| `next.config.ts` | No LI-specific changes needed |
| `tsconfig.json` | Extensive 3d-lab path aliases; may need LI path additions |
| `components.json` | shadcn/ui config — no LI changes |
| `middleware.ts` | Auth/entitlement gates — no LI changes |
| `vercel.json` | Deployment — no LI changes |

## Observed Conventions Relevant to LI

1. **Server Components by default, client at leaves** — LI viewport is client-side
2. **Dynamic imports for heavy 3D components** (`dynamic(() => import(...), { ssr: false })`) — LI follows same
3. **`'use client'` directive** on all interactive components — LI follows same
4. **Zustand stores with selector pattern** — LI follows same
5. **Template type switch in `useTemplateContent`** — LI adds new case
6. **Module config as static TS objects with dynamic import** — LI configs follow same
7. **Shell content pattern** — `ViewportShellContent` interface with `canvasContent`, `leftSidebarContent`, `rightSidebarContent` — LI follows same
8. **Test file naming** — `*.test.ts` co-located with source — LI follows same
9. **Documentation in AGENTS.md files** — LI updates relevant AGENTS.md
