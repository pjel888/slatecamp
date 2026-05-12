# 20 — Appendix: File Inventory

## Comprehensive File Inventory

### Routes / Pages

| Path | Purpose | PI Relevance | LI Relevance | Change? | Risk |
|------|---------|-------------|-------------|---------|------|
| `src/app/dashboard/3d-lab/page.tsx` | Dashboard entry point | Core PI dashboard | LI modules appear here | Low — dashboard already renders LabBrowser | Low |
| `src/app/dashboard/3d-lab/layout.tsx` | ExploreLayout wrapper | PI layout | Same layout | None | None |
| `src/app/dashboard/3d-lab/loading.tsx` | Dashboard loading | PI loading | Same | None | None |
| `src/app/dashboard/3d-lab/error.tsx` | Dashboard error | PI error | Same | None | None |
| `src/app/dashboard/3d-lab/[moduleId]/page.tsx` | Module page | PI module entry | LI module entry | None — resolves same way | None |
| `src/app/dashboard/3d-lab/[moduleId]/loading.tsx` | Module loading | PI loading | Same | None | None |

### Dashboard / Card Components

| Path | Purpose | PI Relevance | LI Relevance | Change? | Risk |
|------|---------|-------------|-------------|---------|------|
| `src/features/3d-lab/components/LabBrowser.tsx` | Dashboard orchestrator | PI browser | Add mode filter + chip UI | **Yes** — add filter chips and mode filtering | Low |
| `src/features/3d-lab/components/ModuleCard.tsx` | Module card component | PI cards | Add LI badge | **Yes** — add `'learning'` to TEMPLATE_META | Low |
| `src/features/3d-lab/components/ModuleList.tsx` | Category module list | PI list | Same (filtered by category) | None (mode filter at parent level) | None |
| `src/features/3d-lab/components/CategoryGrid.tsx` | Category grid | PI categories | Same | None | None |
| `src/features/3d-lab/components/shell/LabBrowserShell.tsx` | Dashboard shell | PI shell | Same | None | None |

### Viewport / 3D Components

| Path | Purpose | PI Relevance | LI Relevance | Change? | Risk |
|------|---------|-------------|-------------|---------|------|
| `src/features/3d-lab/components/shell/LabViewportFrame.tsx` | R3F Canvas host | Core PI Canvas | LI reuses same Canvas | None | None |
| `src/features/3d-lab/components/CanvasWrapper.tsx` | Per-module scene config | PI wrapper | LI reuses same | None | None |
| `src/features/3d-lab/components/shell/ViewportShell.tsx` | Universal layout shell | PI layout | LI layout (different config) | None — config-driven | None |
| `src/features/3d-lab/components/ModuleViewer.tsx` | Module orchestrator | PI orchestrator | LI orchestrator | None — handles all template types | None |
| `src/features/3d-lab/components/LabViewport.tsx` | Legacy scene router | PI scenes | May route LI scenes | Low — but LI likely uses template path, not legacy | Low |
| `src/features/3d-lab/components/GlobalCanvasPortal.tsx` | SceneTunnel system | PI portal | Same portal | None | None |
| `src/features/3d-lab/components/rendering/SceneConfig.tsx` | Camera/lights config | PI config | LI config (simpler) | None | None |
| `src/features/3d-lab/components/rendering/SceneBase.tsx` | Scene base setup | PI base | Same | None | None |
| `src/features/3d-lab/components/rendering/StudioLighting.tsx` | Studio lights | PI lighting | Same | None | None |
| `src/features/3d-lab/components/rendering/GroundPlane.tsx` | Ground plane | PI ground | Same | None | None |
| `src/features/3d-lab/components/rendering/AssetPreloader.tsx` | Asset preloading | PI preloading | Available for LI GLBs | None | None |

### Controls / Sidebar Components

| Path | Purpose | PI Relevance | LI Relevance | Change? | Risk |
|------|---------|-------------|-------------|---------|------|
| `src/features/3d-lab/components/shell/ViewportHeader.tsx` | Viewport header | PI header | Same | None | None |
| `src/features/3d-lab/components/shell/ViewportSidebar.tsx` | Sidebar container | PI sidebars | LI right sidebar | None | None |
| `src/features/3d-lab/components/shell/ViewportStatusBar.tsx` | Status bar | PI status | LI status | None | None |
| `src/features/3d-lab/components/shell/SceneToolbar.tsx` | Floating toolbar | PI toolbar | Same | None | None |
| `src/features/3d-lab/components/shell/LayersPanel.tsx` | Layers floating panel | PI layers | LI layers (mirrored) | None — children slot | None |
| `src/features/3d-lab/components/shell/CameraNavigationBar.tsx` | Camera presets | PI camera | Same | None | None |
| `src/features/3d-lab/components/shell/PanelCollapseButton.tsx` | Sidebar collapse | PI collapse | Same | None | None |
| `src/features/3d-lab/components/shell/ViewportBottomSheet.tsx` | Mobile bottom sheet | PI mobile | Same | None | None |
| `src/features/3d-lab/components/shell/CompassRose.tsx` | Compass widget | PI compass | Available | None | None |
| `src/features/3d-lab/components/shell/FirstTimeTooltip.tsx` | Onboarding tooltip | PI tooltip | Same | None | None |
| `src/features/3d-lab/components/shell/WebGLRecovery.tsx` | WebGL recovery | PI recovery | Same | None | None |
| `src/features/3d-lab/components/templates/GenericControlPanel.tsx` | PI param controls | Core PI | NOT used by LI | None | None |
| `src/features/3d-lab/components/templates/ComplianceReportPanel.tsx` | PI compliance | Core PI | NOT used by LI | None | None |
| `src/features/3d-lab/components/templates/SourceCompliancePanel.tsx` | PI source truth | Core PI | NOT used by LI | None | None |
| `src/features/3d-lab/components/templates/GeometryMesh.tsx` | Geometry rendering | PI geometry | **LI geometry** | None | None |
| `src/features/3d-lab/components/templates/InstancedMesh.tsx` | Instanced rendering | PI instancing | Available for LI | None | None |

### Hooks / State

| Path | Purpose | PI Relevance | LI Relevance | Change? | Risk |
|------|---------|-------------|-------------|---------|------|
| `src/features/3d-lab/hooks/useTemplateContent.tsx` | Central template dispatch | PI dispatch | **LI dispatch** | **Yes** — add `case 'learning'` | Medium |
| `src/features/3d-lab/stores/useLabStore.ts` | Combined store | PI state | LI may use subset | None — LI uses createModuleStore | None |
| `src/features/3d-lab/stores/useViewportShellStore.ts` | Shell state | PI shell | Same shell state | None | None |
| `src/features/3d-lab/stores/createModuleStore.ts` | Module store factory | PI module state | **LI module state** | None — generic factory | None |
| `src/features/3d-lab/stores/useLabViewStore.ts` | View state | PI view | Same | None | None |
| `src/features/3d-lab/stores/useLabProgressStore.ts` | Progress/params | PI param state | Not used by LI | None | None |
| `src/features/3d-lab/stores/useLabNavigationStore.ts` | Navigation state | PI nav | Not used by LI | None | None |
| `src/features/3d-lab/hooks/useCameraSnap.ts` | Camera snap | PI camera | Same | None | None |
| `src/components/r3f/useRegisterInvalidate.ts` | R3F invalidation | PI invalidation | Same | None | None |
| `src/components/r3f/useDisposeOnUnmount.ts` | Dispose on unmount | PI cleanup | Same | None | None |
| `src/components/r3f/useWebGLMemoryMonitor.ts` | WebGL memory | PI memory | Same | None | None |

### Data / Config

| Path | Purpose | PI Relevance | LI Relevance | Change? | Risk |
|------|---------|-------------|-------------|---------|------|
| `src/features/3d-lab/types/templates.ts` | Core type definitions | PI types | **LI types** | **Yes** — add LI types + extend unions | Medium |
| `src/types/3d-lab.ts` | Legacy types | PI types | Not modified | None | None |
| `src/features/3d-lab/config/registry/index.ts` | Module registry | PI registry | LI registry entries | None — uses category files | None |
| `src/features/3d-lab/config/registry/cat-*.ts` | Category registries | PI entries | **LI entries** | **Yes** — add LI module entries | Low |
| `src/features/3d-lab/config/module-paths.ts` | Dynamic import paths | PI paths | LI paths | None — pattern is generic | None |
| `src/features/3d-lab/config/dashboard-visibility.ts` | Dashboard visibility | PI visibility | **LI visibility** | **Yes** — add LI module IDs | None |
| `src/features/3d-lab/config/taxonomy.ts` | Category taxonomy | PI taxonomy | Same taxonomy | None | None |
| `src/features/3d-lab/config/modules/*/` (187 files) | Module configs | PI configs | **LI configs** | **Yes** — new LI config files | Low |
| `src/features/3d-lab/config/constants/` | Code constants | PI constants | Same | None | None |

### Styles

| Path | Purpose | PI Relevance | LI Relevance | Change? | Risk |
|------|---------|-------------|-------------|---------|------|
| `src/app/globals.css` | Global styles + Tailwind | PI styles | Same | None — LI uses existing tokens | None |

### Tests

| Path | Purpose | PI Relevance | LI Relevance | Change? | Risk |
|------|---------|-------------|-------------|---------|------|
| `src/features/3d-lab/**/*.test.ts` (15 files) | Existing tests | PI tests | Must still pass | Only add new tests | None |
| `e2e/authenticated-demo-3d-lab.spec.ts` | E2E tests | PI E2E | **LI E2E** | **Yes** — add LI test cases | Low |
| **NEW** `components/learning/*.test.ts` | LI unit tests | N/A | **LI tests** | **New files** | None |
| **NEW** `config/modules/*/...li-module.test.ts` | LI config test | N/A | **LI test** | **New file** | None |

### Docs

| Path | Purpose | PI Relevance | LI Relevance | Change? | Risk |
|------|---------|-------------|-------------|---------|------|
| `src/features/3d-lab/AGENTS.md` | Feature context | PI docs | **Update with LI** | **Yes** | Low |
| `src/app/dashboard/3d-lab/AGENTS.md` | Route context | PI docs | **Update with LI** | **Yes** | Low |
| `src/app/dashboard/3d-lab/3D_LAB_ARCHITECTURE.md` | Architecture doc | PI arch | **Update with LI** | **Yes** | Low |
| `src/app/dashboard/3d-lab/3D_LAB_MODULE_CATALOG.md` | Module catalog | PI catalog | **Add LI entry** | **Yes** | Low |

### Other (No Changes Needed)

| Path | Purpose |
|------|---------|
| `src/lib/routes.ts` | Route constants |
| `src/lib/entitlements/feature-keys.ts` | Entitlement keys |
| `src/lib/entitlements/get-viewer-entitlements.ts` | Entitlement resolution |
| `src/lib/actions/lab.ts` | Server actions |
| `src/components/r3f/*` | Shared R3F utilities |
| `src/lib/three-utils.ts` | Three.js utilities |
| `package.json` | Dependencies / scripts |
| `tsconfig.json` | TypeScript config (may need LI path alias) |
| `next.config.ts` | Next.js config |
| `middleware.ts` | Auth middleware |

---

## Files Summary

| Category | Total | Will Change | New Files | Risk Level |
|----------|-------|-------------|-----------|------------|
| Routes/Pages | 6 | 0 | 0 | None |
| Dashboard/Card | 5 | 2 | 0 | Low |
| Viewport/3D | 19 | 0 | 0 | None |
| Controls/Sidebar | 15 | 0 | 0 | None |
| Hooks/State | 11 | 1 | 0 | Medium |
| Data/Config | 200+ | 4 | 2+ | Low-Medium |
| Styles | 1 | 0 | 0 | None |
| Tests | 16 | 1 | 3+ | Low |
| Docs | 4 | 4 | 0 | Low |
| Other | 8 | 0 | 0 | None |
| **Total** | **285+** | **12** | **5+** | **Low-Medium** |

**Key**: Only 12 existing files need modification. Only 5+ new files created. 270+ files untouched. This is an exceptionally low-touch implementation.
