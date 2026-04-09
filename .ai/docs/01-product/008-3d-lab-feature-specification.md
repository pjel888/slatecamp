# 3D Lab Feature Specification

**Last Updated:** 2026-04-10
**Status:** Active — Codebase Source of Truth  
**Version:** 4.0 (Comprehensive Codebase-Derived Specification)
**Audit Source:** `.ai/plans/3d-lab-feature-specification-plan-2026-04-08.md`

> This document is the authoritative specification for SlateCamp's 3D Lab feature.
> Every claim is derived from and verified against the live codebase as of 2026-04-10.
> No fabricated paths, types, or interfaces. If something is unknown, it is marked NEEDS VERIFICATION.

---

## Table of Contents

1. [Overview & Principles](#1-overview--principles)
2. [Technology Stack](#2-technology-stack)
3. [Route & File Architecture](#3-route--file-architecture)
4. [Template System (7 Templates)](#4-template-system-7-templates)
5. [Module Complete Catalogue (209 Modules)](#5-module-complete-catalogue-209-modules)
6. [Component Architecture](#6-component-architecture)
7. [State Management (12 Stores)](#7-state-management-12-stores)
8. [Data Flow & API Contract](#8-data-flow--api-contract)
9. [Database Schema](#9-database-schema)
10. [Rendering & Performance Architecture](#10-rendering--performance-architecture)
11. [Asset Pipeline](#11-asset-pipeline)
12. [Interaction & UX Patterns](#12-interaction--ux-patterns)
12A. [Unified Viewport Shell](#12a-unified-viewport-shell)
12B. [Stairway Configurator](#12b-stairway-configurator)
12C. [Wall Configurator v2](#12c-wall-configurator-v2)
13. [Regulatory Compliance Engine](#13-regulatory-compliance-engine)
14. [Pedagogical Integration](#14-pedagogical-integration)
15. [Hook & Utility Inventory](#15-hook--utility-inventory)
16. [Failure Handling](#16-failure-handling)
17. [Accessibility](#17-accessibility)
18. [Identity-Locked Components](#18-identity-locked-components)
19. [Known Open Decisions & Technical Debt](#19-known-open-decisions--technical-debt)
20. [Feature History & Evolution](#20-feature-history--evolution)

---

## 1. Overview & Principles

### Purpose

The 3D Lab is SlateCamp's interactive spatial learning tool for Filipino architecture licensure exam (LEA) preparation. It provides 209 3D-interactive modules spanning 16 categories aligned to the 7 LEA board subject areas. Users manipulate parametric building components, explore exploded assemblies, walk through floor plans, and observe animated construction sequences -- all while receiving real-time regulatory compliance feedback against Philippine building codes (PD 1096, BP 344, RA 9514, NSCP).

### LEA Exam Context

The LEA (Licensure Examination for Architects) covers 7 subject areas. The 3D Lab maps every module to one of these subjects via a 16-category taxonomy:

| LEA Subject | Categories | Module Count |
|-------------|-----------|-------------|
| Building Laws & Codes | BUILDING_CODE (30), ACCESSIBILITY (14), FIRE_CODE (22), SITE_DEV (4) | **70** |
| Structural Engineering | STRUCTURAL (17) | **17** |
| Building Utilities | PLUMBING (14), ELECTRICAL (10), MECHANICAL (6), VERTICAL (4) | **34** |
| Building Materials & Construction | CONSTRUCTION (14), MATERIALS (14) | **28** |
| Architecture | ARCH_HISTORY (22), PH_HERITAGE (10) | **32** |
| Urban Planning & Housing | PLANNING (18) | **18** |
| Professional Practice & Specs | PROF_PRACTICE (4), ESTIMATING (6) | **10** |
| **Total** | **16 categories** | **209** |

### Governing Principles

1. **Config-driven modules** -- Every module is a TypeScript config object conforming to a discriminated union type (`ModuleConfig`). No bespoke code per module except 4 legacy scenes.
2. **Regulatory compliance** -- All dimensional values in modules carry `LegalCitation` metadata linking to specific code sections. Violations are detected in real-time via `ViolationRule.check()` functions.
3. **Parametric constraints** -- Modules enforce code-mandated minimums and maximums. Slider ranges are derived from building codes, not arbitrary UX choices.
4. **Spatial learning** -- The system teaches through 3D manipulation, not static content. Users learn by adjusting parameters and observing spatial consequences.
5. **Procedural geometry** -- All 3D content is generated programmatically from `GeometryInstruction[]` arrays. No external GLB/GLTF files are used by the 209 modules.
6. **Demand rendering** -- The R3F Canvas uses `frameloop="demand"` and only re-renders when state changes, preserving battery and GPU resources.

### Key Differentiators

- **Only LEA prep platform with interactive 3D building code visualization** -- competitors use static diagrams or text-only
- **Real-time violation detection** -- adjusting a riser height beyond PD 1096 limits triggers immediate visual + textual feedback
- **Procedural geometry at scale** -- 209 modules with zero external 3D assets; all geometry is code-defined
- **Config-driven extensibility** -- adding a new module requires only a TypeScript config file and a registry entry

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| 3D Renderer | Three.js | ^0.183.2 | WebGL rendering engine |
| React 3D Bridge | @react-three/fiber | ^9.5.0 | React reconciler for Three.js |
| 3D Helpers | @react-three/drei | ^10.7.7 | OrbitControls, OrthographicCamera, PerformanceMonitor, useGLTF |
| Portal System | tunnel-rat | ^0.1.2 | Scene content portaling (SceneTunnel) |
| State Management | Zustand | ^5.0.12 | 12 stores for lab state |
| Framework | Next.js | 16.1.6 | App Router, dynamic imports, SSR |
| UI | React | ^19.2.4 | Component rendering |
| Type Definitions | @types/three | ^0.183.1 | TypeScript types for Three.js |
| DRACO Decoder | Built-in (drei) | -- | GLB/GLTF compression (configured but unused by current modules) |

**Note:** `@use-gesture/react` is used by `SlideToSubmit` (identity-locked, not part of 3D Lab) and is NOT a dependency of the 3D Lab feature itself.

---

## 3. Route & File Architecture

### Routes

| Route | File | Type | Description |
|-------|------|------|-------------|
| `/dashboard/3d-lab` | `src/app/dashboard/3d-lab/page.tsx` | Server Component | Lab browser -- category grid or flat gallery |
| `/dashboard/3d-lab/[moduleId]` | `src/app/dashboard/3d-lab/[moduleId]/page.tsx` | Server Component | Module detail viewer |

Both routes are auth-gated (require login) and tier-gated (require `pro` tier or `bypass3dGate` flag).

### `src/app/dashboard/3d-lab/` Directory

```
src/app/dashboard/3d-lab/
  [moduleId]/
    page.tsx                      # Server Component — module detail page
  error.tsx                       # Error boundary
  layout.tsx                      # Dashboard layout wrapper
  loading.tsx                     # Loading skeleton
  page.tsx                        # Server Component — lab browser page
```

### `src/features/3d-lab/` Directory (Primary Feature Code)

```
src/features/3d-lab/
  _config/                        # Re-export shims (legacy paths)
    taxonomy.ts                   # Re-export of config/taxonomy.ts
  _constants/
    nbcp.ts                       # Re-export of constants/nbcp.ts
  _stores/                        # Re-export shims (legacy paths)
    createModuleStore.ts
    labStore.ts
    nbcpStore.ts
    useWallLabStore.ts
  _types/
    templates.ts                  # Re-export of types/templates.ts
  components/
    index.ts                      # Barrel exports (20 components)
    CanvasWrapper.tsx              # R3F canvas wrapper with SceneTunnel
    CategoryGrid.tsx              # Category selection grid (16 LEA-aligned)
    GlobalCanvasPortal.tsx         # tunnel-rat SceneTunnel singleton
    InfoPanel.tsx                  # Hotspot info panel
    LabBrowser.tsx                 # Gallery orchestrator
    LabTopBar.tsx                  # Module top bar with back nav
    LabViewport.tsx                # Template router / scene switcher
    ModuleCard.tsx                 # Gallery card component
    ModuleContextCard.tsx          # Context scenario card overlay
    ModuleList.tsx                 # Module list within a category
    ModuleViewer.tsx               # Module detail page client component
    OnboardingFlow.tsx             # First-time user onboarding
    overlays/
      CameraSync.tsx              # Syncs R3F camera -> overlay store
      DimensionLabel.tsx           # DOM overlay for dimension values
      DOMOverlayLayer.tsx          # 2D DOM overlay system
      HotspotCard.tsx              # DOM hotspot card
      LabelOverlay.tsx             # Text label overlay
      PartTooltip.tsx              # Part tooltip for exploded views
      ViolationBadge.tsx           # Violation indicator badge
    rendering/
      AssetPreloader.tsx           # Preloads GLB/texture assets (prepared, unused)
      GroundPlane.tsx              # Ground plane mesh
      SceneBase.tsx                # Sky, fog, tone mapping, ground
      SceneConfig.tsx              # Camera, controls, lighting config
      StudioLighting.tsx           # 4-preset lighting rig
    shell/
      CameraNavigationBar.tsx      # 17-button grouped camera nav (modes, views, zoom)
      CommandPalette.tsx           # Ctrl+K command search overlay
      CompassRose.tsx              # Site planning compass widget
      FirstTimeTooltip.tsx         # New user onboarding hints
      GuidedTour.tsx               # Multi-stop walkthrough system
      KpiBar.tsx                   # Simplified metrics display
      LabBrowserShell.tsx          # Browser page shell/layout
      LabEmptyState.tsx            # Empty state component
      LabMetaPanel.tsx             # Metadata side panel
      LabModuleShell.tsx           # Module detail shell/layout (legacy, replaced by ViewportShell)
      LabOverlayLayer.tsx          # Overlay container
      LabViewportFrame.tsx         # R3F Canvas host with WebGLErrorBoundary
      LayersPanel.tsx              # Layer toggles with pin/unpin
      SceneGround.tsx              # GridHelper + GizmoHelper (XZ grid + axis indicator)
      SceneToolbar.tsx             # Top-left 6-button toolbar (Grid/Dims/X-ray/Layers/Screenshot/Fullscreen)
      ViewportContextMenu.tsx      # Right-click context menu
      ViewportSkeleton.tsx         # Loading state placeholder
      ViewportToast.tsx            # Non-blocking warning notifications
      WebGLRecovery.tsx            # GPU crash recovery UI
    templates/
      ArchMass.tsx                 # Architectural massing helper
      CalculatorLighting.tsx       # (deprecated) Calculator lighting
      ComplianceReportPanel.tsx    # Compliance report UI
      ControlPanel.tsx             # Parametric control panel
      FocusModeToggle.tsx          # Focus mode toggle
      GenericControlPanel.tsx      # Generic parameter controls
      GeometryMesh.tsx             # Declarative geometry renderer
      HotspotAnnotation.tsx        # R3F hotspot annotation
      HotspotQuestion.tsx          # Quiz question hotspot
      HumanSilhouette.tsx          # 1.7m human scale reference
      InfoPanel.tsx                # Template info panel
      LabPanelLayout.tsx           # Panel layout wrapper
      LabViewport.tsx              # Template viewport wrapper
      ModuleViewer.tsx             # Template module viewer
      PostModuleCTA.tsx            # Post-module call-to-action
      SceneEmptyState.tsx          # Scene-level empty state
      SceneErrorBoundary.tsx       # Scene-level error boundary
      ViolationIndicator.tsx       # Violation indicator mesh
      Library/
        CategoryGrid.tsx           # Template library category grid
        LabBrowser.tsx             # Template library browser
        ModuleCard.tsx             # Template library module card
        ModuleList.tsx             # Template library module list
    stairway/                        # Stairway configurator UI components (19 files)
      index.ts                     # Barrel exports
      ChildSafetyPanel.tsx         # Children's safety assessment panel
      ClickInspectPopover.tsx      # Click-to-inspect detail popover
      ComparisonPanel.tsx          # International code comparison panel
      ComparisonToggle.tsx         # Comparison mode toggle
      ComplianceLawCard.tsx        # Per-law compliance status card
      ComplianceSummaryBadge.tsx   # Compliance summary badge
      DimensionSlider.tsx          # Dimension parameter slider
      EgressCalculatorPanel.tsx    # Evacuation calculator panel
      EvacuationControls.tsx       # Evacuation simulation controls
      FixButton.tsx                # Auto-fix violation button
      HandrailDetailPanel.tsx      # Handrail detail panel
      LawActivationDot.tsx         # Law compliance indicator dot
      MaterialSelectorPanel.tsx    # Material selection panel
      NosingDetailPanel.tsx        # Nosing detail panel
      PresetChip.tsx               # Preset selection chip
      PresetChipStrip.tsx          # Horizontal preset strip
      ViewportComfortGauge.tsx     # Blondel comfort gauge overlay
      ViolationRow.tsx             # Single violation display row
      WallConfigurator/
        AreaSummaryBar.tsx         # Wall area summary
        BOMPanel.tsx               # Bill of materials panel
        ConfigPanel.tsx            # Wall config panel
        SponsorPalette.tsx         # Sponsor paint color palette
        steps/
          ColorSponsorStep.tsx     # Step 5: Color & sponsor selection
          CoreTypeStep.tsx         # Step 1: Core type selection
          FinishTypeStep.tsx       # Step 4: Finish type
          GeometryStep.tsx         # Step 2: Wall geometry
          TreatmentStep.tsx        # Step 3: Treatment/lason
  config/
    camera-presets.ts              # 5 named camera presets
    dashboard-visibility.ts        # DASHBOARD_VISIBLE_IDS (4 modules)
    taxonomy.ts                    # 16-category LEA-aligned taxonomy
    constants/
      bp-344.ts                    # BP 344 Accessibility constants
      index.ts                     # Constants barrel export
      nscp.ts                      # NSCP structural constants
      pd-1096.ts                   # PD 1096 building code constants
      ra-9514.ts                   # RA 9514 fire code constants
    modules/
      01-building-code/            # 30 module configs
      02-accessibility/            # 14 module configs
      03-fire-code/                # 22 module configs
      04-structural/               # 17 module configs
      05-plumbing/                 # 14 module configs
      06-electrical/               # 10 module configs
      07-mechanical/               #  6 module configs
      08-vertical/                 #  4 module configs + 12 stairway support files
        stairway-configurator.ts   # Main stairway module config (geometry builder)
        stairway-computation.ts    # Pure computation engine (compliance, comfort)
        stairway-computation.test.ts # Unit tests (Blondel, pitch, egress)
        stairway-types.ts          # StairParams, ComputedStairState, ComplianceResult
        stairway-constants.ts      # PD 1096, BP 220/344, RA 9514 thresholds
        stairway-constants-international.ts # IBC 2024, ADA, IRC (UNVERIFIED)
        stairway-geometry-l-shape.ts # L-stair geometry with turnDirection
        stairway-geometry-u-shape.ts # U-stair geometry
        stairway-nosing.ts         # Extruded-profile nosing at tread midpoint
        stairway-materials.ts      # Material colors per core type
        stairway-egress.ts         # Evacuation calculator, occupancy-based width
        stairway-click-targets.ts  # Click-to-inspect geometry regions
        stairway-presets.ts        # Violation presets (residential, commercial, etc.)
      09-construction/             # 14 module configs
      10-materials/                # 14 module configs + 19 wall v2 support files
        wall-types.ts              # CoreType, StructuralSystem, WallViewMode
        wall-types-comparison.ts   # Comparison mode types
        wall-core-registry.ts      # 7 wall types with structural metadata + performance
        wall-constants.ts          # NSCP, PD 1096 thresholds
        wall-constants-performance.ts # Fire/STC/cost/R-value data (UNVERIFIED)
        wall-constants-international.ts # IBC, ASTM, EN standards (UNVERIFIED)
        wall-geometry.ts           # Main geometry orchestrator
        wall-geometry-chb.ts       # CHB representative section + instanced blocks
        wall-geometry-drywall.ts   # Studs, tracks, gypsum layers
        wall-geometry-brick.ts     # Brick unit + mortar pattern
        wall-geometry-generic.ts   # Fallback for unknown core types
        wall-geometry-layers.ts    # Shared finish layer stacking
        wall-geometry-mep.ts       # Electrical/mechanical conduit runs
        wall-geometry-connections.ts # Corner/edge assembly details
        wall-computation.ts        # Pure function producing ComputedWallState
        wall-build-steps.ts        # Build sequence animation frames
        wall-section-assembly.ts   # Assembly instructions
        wall-violations.ts         # 12 expanded violation rules
        wall-presets.ts            # 12 presets (residential, commercial, etc.)
      11-arch-history/             # 22 module configs
      12-ph-heritage/              # 10 module configs
      13-planning/                 # 18 module configs
      14-prof-practice/            #  4 module configs
      15-estimating/               #  6 module configs
      16-site-dev/                 #  4 module configs
    registry/
      index.ts                     # ALL_MODULES aggregator + helpers
      cat-01.ts through cat-16.ts  # Per-category registry entries
  constants/
    nbcp.ts                        # NBCP constants
    nbcp.test.ts                   # NBCP calculator tests
    scene-colors.ts                # Scene color palette
  DevControlsModule/               # Bespoke site-development-controls module (55+ files)
    index.tsx                      # Entry point
    canvas/                        # R3F scene components
    dashboard/                     # UI panels and controls
    hooks/                         # Module-specific hooks
    stores/                        # Module-specific stores
  hooks/
    useAnimationComplete.ts        # useFrame with completion detection
    useCameraSnap.ts               # Camera animation to presets + zoom-to-fit
    useCameraTransition.ts         # Smooth camera transitions between positions
    useCollaborationPresence.ts    # User presence indicators (cursors, selections)
    useDragDrop.ts                 # File upload + object dragging
    useInvalidateOnChange.ts       # Store invalidate bridge
    useModuleInvalidate.ts         # Module-specific invalidation
    useModuleLifecycle.ts          # Store reset on unmount
    useNBCPInvalidateOnChange.ts   # NBCP-specific invalidation
    useSelectionModel.ts           # Multi-select state management
    useTemplateContent.tsx         # Builds ViewportShellContent per template type
    useUndoRedo.ts                 # History state + revert functionality
    useViewportShortcuts.ts        # Keyboard shortcuts (G/D/X/L/P/F, Ctrl+Z, Ctrl+K)
    useWorldToScreen.ts            # World -> screen projection
  scenes/
    ClassicalOrders/               # Legacy bespoke scene
    FARPlayground/                 # Legacy bespoke scene
    NBCPEnvelope/                  # Legacy bespoke scene
  stores/
    createModuleStore.ts           # Factory: per-module Zustand store
    legacyLabStore.ts              # Legacy parametric + hotspot store
    nbcpStore.ts                   # NBCP-specific store
    useLabNavigationStore.ts       # Navigation (sequence, explore mode)
    useLabProgressStore.ts         # Progress (visited, quiz, compliance)
    useLabStore.ts                 # Combined facade over 3 focused stores
    useLabViewStore.ts             # View UI (panel, hotspot, toggles)
    useOverlayStore.ts             # DOM overlay item management
    useWallLabStore.ts             # Wall configurator wizard state
  templates/
    AnimatedSequence.tsx           # Animated sequence template
    AnimatedSequenceScene.tsx      # R3F scene for animated sequences
    CalculatorTemplate.tsx         # Calculator template
    CutawaySection.tsx             # Cutaway section template
    CutawaySectionScene.tsx        # R3F scene for cutaway sections
    ExplodedAssembly.tsx           # Exploded assembly template
    ExplodedAssemblyScene.tsx      # R3F scene for exploded views
    FloorPlanScene.tsx             # R3F scene for floor plans
    FloorPlanWalkthrough.tsx       # Floor plan walkthrough template
    ParametricScene.tsx            # Parametric scene template
    ParametricSceneRenderer.tsx    # R3F renderer for parametric scenes
    WallConfiguratorRenderer.tsx   # R3F renderer for wall configurator
    WallConfiguratorTemplate.tsx   # Wall configurator template
  types/
    templates.ts                   # Core type system (ModuleConfig, registry types)
  utils/
    nbcpCalculator.ts              # NBCP FAR/BHL calculator
    nbcpCalculator.test.ts         # Calculator tests
    registryLoader.ts              # Dynamic registry import loader
```

### `src/components/r3f/` (Shared R3F Primitives)

```
src/components/r3f/
  CanvasLoadingOverlay.tsx         # Loading overlay for Canvas
  GeometrySwitch.tsx               # Geometry type switcher
  index.ts                         # Barrel exports
  LoadingProgress.tsx              # Loading progress indicator
  SceneInvalidator.tsx             # Scene invalidation helper
  useDisposeOnUnmount.ts           # WebGL resource disposal hook
  useRegisterInvalidate.ts         # Register invalidate callback
  useWebGLMemoryMonitor.ts         # WebGL memory monitoring
  WebGLErrorBoundary.tsx           # Error boundary for WebGL context
```

### `src/components/3d/` (Legacy)

```
src/components/3d/
  Workspace.tsx                    # Legacy GLTF model viewer (~500 lines, fallback path)
```

---

## 4. Template System (7 Templates)

The 3D Lab uses a template-driven architecture. Each module config declares a `templateType` that routes it to the corresponding template component. Templates are loaded via `next/dynamic` with `ssr: false`.

### Template Overview

| Template | File | Config Type | Module Count | Purpose |
|----------|------|-------------|-------------|---------|
| `parametric` | `templates/ParametricScene.tsx` | `ParametricSceneConfig` | ~100 | Slider-driven parametric 3D models with violation detection |
| `cutaway` | `templates/CutawaySection.tsx` | `CutawaySectionConfig` | ~40 | Layer-by-layer section cut views |
| `exploded` | `templates/ExplodedAssembly.tsx` | `ExplodedAssemblyConfig` | ~30 | Exploded view with labeled parts and explosion slider |
| `floorplan` | `templates/FloorPlanWalkthrough.tsx` | `FloorPlanConfig` | ~25 | 2D/3D floor plan with rooms, paths, fixtures |
| `animated` | `templates/AnimatedSequence.tsx` | `AnimatedSequenceConfig` | ~12 | Step-by-step animated construction sequences |
| `calculator` | `templates/CalculatorTemplate.tsx` | `CalculatorConfig` | 4 | Estimating calculator (flooring/paint/drywall/chb) |
| `wall-configurator` | `templates/WallConfiguratorTemplate.tsx` | `ParametricSceneConfig` | 1 | 5-step wall assembly configurator |

### Template-to-Module Routing

The `LabViewport` component acts as the template router. It uses a switch statement on `registryEntry.templateType` to dispatch to the correct template component:

```mermaid
flowchart TD
    A[LabViewport] --> B{templateType}
    B -->|parametric| C[ParametricScene]
    B -->|exploded| D[ExplodedAssembly]
    B -->|floorplan| E[FloorPlanWalkthrough]
    B -->|cutaway| F[CutawaySection]
    B -->|animated| G[AnimatedSequence]
    B -->|calculator| H[CalculatorTemplate]
    B -->|wall-configurator| I[WallConfiguratorTemplate]
    B -->|far-calculator| J[FARPlayground - legacy]
    B -->|classical-orders| K[ClassicalOrders - legacy]
    B -->|site-dev-controls| L[DevControlsModule - bespoke]
```

### Config Type Definitions

**Source:** `src/features/3d-lab/types/templates.ts`

The `ModuleConfig` discriminated union:

```typescript
type ModuleConfig =
  | ({ templateType: 'parametric' } & ParametricSceneConfig)
  | ({ templateType: 'exploded' } & ExplodedAssemblyConfig)
  | ({ templateType: 'floorplan' } & FloorPlanConfig)
  | ({ templateType: 'cutaway' } & CutawaySectionConfig)
  | ({ templateType: 'animated' } & AnimatedSequenceConfig)
  | ({ templateType: 'calculator' } & CalculatorConfig)
  | ({ templateType: 'wall-configurator' } & ParametricSceneConfig)
```

#### ParametricSceneConfig

```typescript
interface ParametricSceneConfig {
  id: string
  title: string
  description: string
  subject: string
  parameters: ParameterDef[]
  geometry: (params: Record<string, number | boolean | string>) => GeometryInstruction[]
  violations?: ViolationRule[]
  annotations?: AnnotationDef[]
  presets?: Preset[]
  camera?: CameraConfig
  scale?: number
  contextScenario?: string
  leaQuestionCount?: number
  leaQuestionType?: string
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  hasChallengeMode?: boolean
  showHumanScale?: boolean
}
```

#### ExplodedAssemblyConfig

```typescript
interface ExplodedAssemblyConfig {
  id: string
  title: string
  description: string
  subject: string
  parts: AssemblyPart[]
  parameters?: ParameterDef[]
  comparisonMode?: boolean
  annotations?: AnnotationDef[]
  presets?: Preset[]
  camera?: CameraConfig
  scale?: number
  contextScenario?: string
  leaQuestionCount?: number
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  hasChallengeMode?: boolean
  showHumanScale?: boolean
}
```

#### FloorPlanConfig

```typescript
interface FloorPlanConfig {
  id: string
  title: string
  description: string
  subject: string
  rooms: RoomDef[]
  paths?: PathDef[]
  fixtures?: FixtureDef[]
  parameters?: ParameterDef[]
  violations?: ViolationRule[]
  annotations?: AnnotationDef[]
  presets?: Preset[]
  camera?: CameraConfig
  planSize?: [number, number]
  scale?: number
  contextScenario?: string
  leaQuestionCount?: number
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  hasChallengeMode?: boolean
}
```

#### CutawaySectionConfig

```typescript
interface CutawaySectionConfig {
  id: string
  title: string
  description: string
  subject: string
  layers: LayerDef[]
  cutAxis?: 'x' | 'y' | 'z'
  parameters?: ParameterDef[]
  annotations?: AnnotationDef[]
  presets?: Preset[]
  camera?: CameraConfig
  scale?: number
  contextScenario?: string
  leaQuestionCount?: number
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  hasChallengeMode?: boolean
}
```

#### AnimatedSequenceConfig

```typescript
interface AnimatedSequenceConfig {
  id: string
  title: string
  description: string
  subject: string
  steps: SequenceStep[]
  parameters?: ParameterDef[]
  annotations?: AnnotationDef[]
  presets?: Preset[]
  camera?: CameraConfig
  loop?: boolean
  autoPlaySpeed?: number
  scale?: number
  contextScenario?: string
  leaQuestionCount?: number
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  hasChallengeMode?: boolean
}
```

#### CalculatorConfig

```typescript
type CalculatorToolType = 'flooring' | 'paint' | 'drywall' | 'chb'

interface CalculatorConfig {
  id: string
  title: string
  description: string
  subject: string
  toolType: CalculatorToolType
  camera?: { position: Vector3Tuple; zoom?: number; near?: number; far?: number }
  scale?: number
  sponsorData?: { name: string; logoUrl?: string; presets?: Record<string, number | string> }
  contextScenario?: string
  leaQuestionCount?: number
  leaQuestionType?: string
}
```

### Supporting Types

```typescript
interface ParameterDef {
  key: string
  label: string
  type: 'slider' | 'toggle' | 'dropdown'
  min?: number; max?: number; step?: number
  default: number | boolean | string
  unit?: string
  options?: Array<{ value: string; label: string }>
  group?: string
  decimals?: number
  /** Progressive disclosure level — controls sidebar grouping visibility */
  disclosureLevel?: 'essential' | 'advanced' | 'expert'
  /** Optional visibility predicate — parameter hidden when this returns false.
   *  Receives current param values. Used for core-type-dependent parameter panels. */
  visibleWhen?: (params: Record<string, number | boolean | string>) => boolean
}

interface ViolationRule {
  id: string
  check: (params: Record<string, number | boolean | string>) => boolean
  field: string
  message: string
  codeCitation?: string
  severity: 'error' | 'warning' | 'info'
  position?: (params: Record<string, number | boolean | string>) => Vector3Tuple
}

interface AnnotationDef {
  id: string
  label: string
  description: string
  codeCitation?: string
  position: (params: Record<string, number | boolean | string>) => Vector3Tuple
  visibleWhen?: (params: Record<string, number | boolean | string>) => boolean
}

type GeometryType =
  | 'box' | 'cylinder' | 'plane' | 'line' | 'ring' | 'sphere' | 'cone'
  | 'extruded-profile'   // 2D cross-section extruded along axis (nosing, handrails)
  | 'instanced'           // InstancedMesh rendering (CHB blocks, brick patterns)

interface GeometryInstruction {
  id: string
  type: GeometryType
  position: Vector3Tuple
  rotation?: Vector3Tuple
  scale?: Vector3Tuple
  args: number[]
  color: string
  opacity?: number
  transparent?: boolean
  label?: string
  // ── Extruded-profile fields (type === 'extruded-profile') ──
  profilePoints?: [number, number][]  // 2D cross-section points
  extrudeDepth?: number               // Extrusion depth in scene units
  // ── Instanced geometry fields (type === 'instanced') ──
  instancedShape?: 'box' | 'cylinder' | 'sphere'
  instancedShapeArgs?: number[]
  instancedPositions?: Vector3Tuple[]
  instancedRotations?: Vector3Tuple[]
  instancedColors?: string[]
}

interface CameraConfig {
  position: Vector3Tuple
  target?: Vector3Tuple
  fov?: number
  near?: number
  far?: number
}

type ValueClassification = 'code-mandated' | 'code-derived' | 'pedagogical' | 'ux-arbitrary'

interface LegalCitation {
  law: string
  section: string
  article?: string
  description: string
  value?: string
  classification: ValueClassification
  verified?: string
}
```

#### Viewport Shell Config Types <!-- added: 2026-04-10 -->

```typescript
interface SidebarConfig {
  defaultCollapsed?: boolean
  width?: number           // Panel width in px
  title?: string           // Panel header title
  mobileTabLabel?: string  // Tab label in mobile bottom sheet
}

interface ViewportShellConfig {
  leftSidebar?: boolean | SidebarConfig
  rightSidebar?: boolean | SidebarConfig
  statusBar?: boolean
  mobileBottomSheetTabs?: string[]
}

type ViewMode = 'perspective' | 'orthographic' | 'isometric' | 'top-down'

interface ViewportCapabilities {
  cameraPresets?: boolean | CameraPreset[]
  viewModes?: ViewMode[]
  crossSection?: boolean | CrossSectionConfig
  explodedView?: boolean
  humanScale?: boolean
  focusMode?: boolean
  resetCamera?: boolean
  defaultCamera?: { position: Vector3Tuple; target?: Vector3Tuple; fov?: number }
  floatingToolbar?: FloatingToolbarConfig
  kpiMetrics?: boolean
  cameraPresetBar?: boolean
  compassRose?: boolean
  tourStops?: Array<{ id: string; title: string; description: string; cameraPosition?: Vector3Tuple; spotlightElement?: string }>
}

interface FloatingToolbarConfig {
  position: 'top-left' | 'top-right'
  items: FloatingToolbarItem[]
}

interface FloatingToolbarItem {
  id: string
  icon: string           // Lucide icon name
  label: string
  shortcut?: string
  type: 'toggle' | 'action'
  storeBinding?: string  // Store field this toggles (validated at runtime in dev)
}

interface ViewportShellContent {
  leftSidebarContent?: React.ReactNode
  rightSidebarContent?: React.ReactNode
  canvasContent: React.ReactNode
  statusBarContent?: React.ReactNode
  toolbarExtras?: React.ReactNode
}
```

---

## 5. Module Complete Catalogue (209 Modules)

### Visibility Mechanism

**Source:** `src/features/3d-lab/config/dashboard-visibility.ts`

The `DASHBOARD_VISIBLE_IDS` constant is a `ReadonlySet<string>` controlling which modules appear on the public `/dashboard/3d-lab` route:

```typescript
export const DASHBOARD_VISIBLE_IDS: ReadonlySet<string> = new Set([
  'site-development-controls',
  'stairway-configurator',
  'calculator-flooring',
  'unified-wall-configurator',
])
```

- **When populated** (current state: 4 modules): `LabBrowser` renders a simplified flat grid showing only allowlisted modules
- **When empty**: `LabBrowser` falls back to full 16-category drill-down (all 209 modules visible)
- All modules remain accessible via admin routes regardless of this setting

### Status Definitions

| Status | Count | Meaning |
|--------|-------|---------|
| `built` | 6 | Fully functional with bespoke logic (4 calculator modules + stairway-configurator + unified-wall-configurator) |
| `ready` | 203 | Config complete, template-driven, ready for dashboard activation |
| `planned` | 0 | None currently |

### Module Registry Entry Type

**Source:** `src/features/3d-lab/types/templates.ts`

```typescript
interface ModuleRegistryEntry {
  id: string
  title: string
  templateType: TemplateType
  subject: string
  categoryId?: CategoryKey
  launchPhase?: 1 | 2 | 3
  codeRef?: string
  priority?: number
  status: 'built' | 'ready' | 'planned'
  description?: string
  thumbnail?: string
  contextScenario?: string
  leaQuestionCount?: number
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  assets?: { models?: string[]; textures?: string[] }
}
```

### Summary by Category

| Category | ID | Module Count | Phase | LEA Subject |
|----------|----|-------------|-------|-------------|
| BUILDING_CODE | 01 | 30 | 1 | Building Laws & Codes |
| ACCESSIBILITY | 02 | 14 | 1 | Building Laws & Codes |
| FIRE_CODE | 03 | 22 | 1 | Building Laws & Codes |
| STRUCTURAL | 04 | 17 | 1 | Structural Engineering |
| PLUMBING | 05 | 14 | 1 | Building Utilities |
| ELECTRICAL | 06 | 10 | 2 | Building Utilities |
| MECHANICAL | 07 | 6 | 2 | Building Utilities |
| VERTICAL | 08 | 4 | 2 | Building Utilities |
| CONSTRUCTION | 09 | 14 | 2 | Building Materials & Construction |
| MATERIALS | 10 | 14 | 2 | Building Materials & Construction |
| ARCH_HISTORY | 11 | 22 | 1 | Architecture |
| PH_HERITAGE | 12 | 10 | 1 | Architecture |
| PLANNING | 13 | 18 | 2 | Urban Planning & Housing |
| PROF_PRACTICE | 14 | 4 | 3 | Professional Practice & Specs |
| ESTIMATING | 15 | 6 | 3 | Professional Practice & Specs |
| SITE_DEV | 16 | 4 | 3 | Building Laws & Codes |
| **TOTAL** | | **209** | | |

**Note:** Registry files `cat-17.ts` and `cat-18.ts` exist as empty placeholders for future categories (Specialized Concrete, Topography & Landscape).

### Template Type Distribution

| Template Type | Count |
|---------------|-------|
| `parametric` | ~100 |
| `cutaway` | ~40 |
| `exploded` | ~30 |
| `floorplan` | ~25 |
| `animated` | ~12 |
| `calculator` | 4 |
| `wall-configurator` | 1 |

### Complete Module Catalogue

#### Category 01: PD 1096 -- National Building Code (30 modules)

| # | Module ID | Template | Status | Phase | Notes |
|---|-----------|----------|--------|-------|-------|
| 1 | `attic-requirements` | parametric | ready | 1 | |
| 2 | `balcony-guardrail` | parametric | ready | 1 | |
| 3 | `batch-compliance-verifier` | parametric | ready | 3 | Wave 4 addition |
| 4 | `building-height-limits` | parametric | ready | 1 | |
| 5 | `ceiling-height-configurator` | parametric | ready | 1 | |
| 6 | `corridor-width-calculator` | parametric | ready | 1 | |
| 7 | `court-requirements` | parametric | ready | 1 | |
| 8 | `daylighting-room-depth` | parametric | ready | 3 | |
| 9 | `development-controls-pso` | parametric | ready | 1 | |
| 10 | `exit-door-mechanics` | animated | ready | 1 | |
| 11 | `exit-width-calculator` | parametric | ready | 1 | |
| 12 | `garage-ventilation` | parametric | ready | 1 | |
| 13 | `light-ventilation-openings` | parametric | ready | 1 | |
| 14 | `lot-area-calculator` | parametric | ready | 3 | |
| 15 | `mezzanine-clearances` | cutaway | ready | 1 | |
| 16 | `mixed-occupancy-separator` | cutaway | ready | 1 | |
| 17 | `mounting-heights` | parametric | ready | 1 | |
| 18 | `natural-ventilation-rules` | parametric | ready | 1 | |
| 19 | `nbcp-envelope` | parametric | ready | 1 | |
| 20 | `occupancy-classification` | parametric | ready | 1 | |
| 21 | `occupant-load-calculator` | floorplan | ready | 1 | |
| 22 | `open-space-requirements` | parametric | ready | 1 | |
| 23 | `ramp-gradient-building` | parametric | ready | 1 | |
| 24 | `room-size-minimums` | parametric | ready | 1 | |
| 25 | `saleable-area-ratio` | parametric | ready | 2 | |
| 26 | `shading-device-design` | parametric | ready | 3 | |
| 27 | `site-development-controls` | parametric | ready | 1 | **DASHBOARD ACTIVE** |
| 28 | `skylight-requirements` | parametric | ready | 1 | |
| 29 | `usa-botanist-calculator` | parametric | ready | 3 | |
| 30 | `vent-shaft-dimensions` | parametric | ready | 1 | |

#### Category 02: BP 344 -- Accessibility Law (14 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `accessible-bathing` | cutaway | ready | 1 |
| 2 | `accessible-corridor-widths` | parametric | ready | 1 |
| 3 | `accessible-counter-heights` | parametric | ready | 1 |
| 4 | `accessible-door-clearances` | parametric | ready | 1 |
| 5 | `accessible-elevator-cab` | parametric | ready | 1 |
| 6 | `accessible-parking` | floorplan | ready | 1 |
| 7 | `accessible-signage` | parametric | ready | 1 |
| 8 | `accessible-stair-handrails` | parametric | ready | 1 |
| 9 | `accessible-toilet-detailed` | cutaway | ready | 1 |
| 10 | `ramp-accessible-toilet` | parametric | ready | 1 |
| 11 | `ramp-tactile-warnings` | parametric | ready | 1 |
| 12 | `reach-range-sphere` | parametric | ready | 1 |
| 13 | `tactile-block-types` | exploded | ready | 1 |
| 14 | `wheelchair-maneuvering` | parametric | ready | 1 |

#### Category 03: RA 9514 -- Fire Code & Life Safety (22 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `construction-types-comparison` | exploded | ready | 1 |
| 2 | `egress-simulation` | animated | ready | 1 |
| 3 | `emergency-lighting-layout` | floorplan | ready | 1 |
| 4 | `fire-alarm-system` | floorplan | ready | 1 |
| 5 | `fire-detection-layout` | floorplan | ready | 1 |
| 6 | `fire-door-ratings` | cutaway | ready | 1 |
| 7 | `fire-exit-layout` | floorplan | ready | 1 |
| 8 | `fire-extinguisher-placement` | floorplan | ready | 1 |
| 9 | `fire-rated-barrier` | parametric | ready | 1 |
| 10 | `fire-resistance-ratings` | parametric | ready | 1 |
| 11 | `fire-suppression-overview` | cutaway | ready | 1 |
| 12 | `fire-travel-distance` | floorplan | ready | 1 |
| 13 | `fire-zone-classification` | floorplan | ready | 1 |
| 14 | `firewall-construction` | cutaway | ready | 1 |
| 15 | `horizontal-exit-design` | floorplan | ready | 1 |
| 16 | `number-of-exits` | parametric | ready | 1 |
| 17 | `refuge-area-design` | floorplan | ready | 1 |
| 18 | `smoke-control-systems` | animated | ready | 1 |
| 19 | `smoke-partition-requirements` | cutaway | ready | 1 |
| 20 | `sprinkler-layout` | floorplan | ready | 1 |
| 21 | `stairwell-enclosure` | cutaway | ready | 1 |
| 22 | `standpipe-classes` | cutaway | ready | 1 |

#### Category 04: NSCP -- Structural Engineering (17 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `base-shear-calculator` | parametric | ready | 1 |
| 2 | `beam-stress-diagram` | parametric | ready | 1 |
| 3 | `column-interaction-diagram` | parametric | ready | 1 |
| 4 | `concrete-density-values` | parametric | ready | 1 |
| 5 | `dead-live-load-toggles` | parametric | ready | 1 |
| 6 | `lrfd-load-combinations` | animated | ready | 1 |
| 7 | `near-source-factors` | parametric | ready | 1 |
| 8 | `rc-cover-requirements` | cutaway | ready | 1 |
| 9 | `rebar-sizes-catalog` | exploded | ready | 1 |
| 10 | `seismic-parameter-map` | parametric | ready | 1 |
| 11 | `seismic-zone-map` | parametric | ready | 1 |
| 12 | `soil-profile-cutaway` | cutaway | ready | 1 |
| 13 | `steel-connections` | exploded | ready | 1 |
| 14 | `structural-load-path` | animated | ready | 1 |
| 15 | `structural-systems-comparison` | parametric | ready | 1 |
| 16 | `superposition-demo` | animated | ready | 1 |
| 17 | `wind-load-analysis` | parametric | ready | 1 |

#### Category 05: NPCP -- Plumbing Code (14 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `backflow-prevention` | exploded | ready | 1 |
| 2 | `building-sewer-minimum` | cutaway | ready | 1 |
| 3 | `drainage-system-cutaway` | cutaway | ready | 1 |
| 4 | `fixture-unit-values` | parametric | ready | 1 |
| 5 | `grease-trap-detail` | cutaway | ready | 1 |
| 6 | `hot-water-system` | cutaway | ready | 1 |
| 7 | `pipe-slope-visualization` | cutaway | ready | 1 |
| 8 | `plumbing-fixture-cutaway` | cutaway | ready | 1 |
| 9 | `septic-tank-design` | parametric | ready | 1 |
| 10 | `storm-drainage-system` | cutaway | ready | 1 |
| 11 | `trap-seal-depth` | cutaway | ready | 1 |
| 12 | `vent-pipe-routing` | cutaway | ready | 1 |
| 13 | `water-meter-assembly` | exploded | ready | 1 |
| 14 | `water-supply-riser` | cutaway | ready | 1 |

#### Category 06: PEC -- Electrical Code (10 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `circuit-conductor-sizing` | cutaway | ready | 2 |
| 2 | `electrical-room-context` | parametric | ready | 2 |
| 3 | `elevator-dimensions` | parametric | ready | 2 |
| 4 | `emergency-power-system` | floorplan | ready | 2 |
| 5 | `gfci-protection-zones` | floorplan | ready | 2 |
| 6 | `grounding-system` | cutaway | ready | 2 |
| 7 | `illumination-levels` | floorplan | ready | 2 |
| 8 | `lighting-layout` | floorplan | ready | 2 |
| 9 | `outlet-spacing-room` | floorplan | ready | 2 |
| 10 | `panel-board-layout` | cutaway | ready | 2 |

#### Category 07: PMEC -- Mechanical Code (6 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `air-changes-per-hour` | animated | ready | 2 |
| 2 | `cross-ventilation-analysis` | animated | ready | 2 |
| 3 | `hvac-duct-layout` | floorplan | ready | 2 |
| 4 | `machine-room-layout` | floorplan | ready | 2 |
| 5 | `refrigeration-cycle` | animated | ready | 2 |
| 6 | `split-ac-cutaway` | cutaway | ready | 2 |

#### Category 08: Vertical Circulation & Transport (4 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `elevator-hoistway` | cutaway | ready | 2 |
| 2 | `escalator-section` | cutaway | ready | 2 |
| 3 | `handrail-requirements` | parametric | ready | 2 |
| 4 | `stairway-configurator` | parametric | built | 2 | **DASHBOARD ACTIVE** — bespoke multi-file module (16 config files, 19 UI components) |

#### Category 09: Construction Methods & Sequences (14 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `beam-construction-sequence` | animated | ready | 2 |
| 2 | `chb-wall-construction` | animated | ready | 2 |
| 3 | `column-construction-sequence` | animated | ready | 2 |
| 4 | `construction-sequence-foundation` | animated | ready | 2 |
| 5 | `formwork-assembly` | exploded | ready | 2 |
| 6 | `foundation-types` | exploded | ready | 2 |
| 7 | `lintel-over-opening` | cutaway | ready | 2 |
| 8 | `roof-truss-fink` | exploded | ready | 2 |
| 9 | `roof-truss-howe` | exploded | ready | 2 |
| 10 | `roof-truss-king-post` | exploded | ready | 2 |
| 11 | `roof-truss-pratt` | exploded | ready | 2 |
| 12 | `roof-truss-queen-post` | exploded | ready | 2 |
| 13 | `roof-truss-warren` | exploded | ready | 2 |
| 14 | `slab-construction-sequence` | animated | ready | 2 |

#### Category 10: Building Materials (14 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `bond-pattern-comparison` | exploded | ready | 2 |
| 2 | `chb-block-types` | exploded | ready | 2 |
| 3 | `concrete-aggregate-visualizer` | parametric | ready | 2 |
| 4 | `concrete-mix-proportions` | parametric | ready | 2 |
| 5 | `lumber-sizes` | exploded | ready | 2 |
| 6 | `mortar-joint-types` | cutaway | ready | 2 |
| 7 | `plastering-layers` | cutaway | ready | 2 |
| 8 | `rebar-catalog` | exploded | ready | 2 |
| 9 | `standard-material-sheets` | exploded | ready | 2 |
| 10 | `steel-sections-catalog` | exploded | ready | 2 |
| 11 | `unified-wall-configurator` | wall-configurator | built | 2 | **DASHBOARD ACTIVE** — v2 multi-file architecture (19 config files) |
| 12 | `wall-section-assembly` | exploded | ready | 2 |
| 13 | `wall-types-comparison` | cutaway | ready | 2 |
| 14 | `waterproofing-systems` | cutaway | ready | 2 |

#### Category 11: History of Architecture (22 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `byzantine-pendentive` | cutaway | ready | 1 |
| 2 | `classical-orders-comparison` | exploded | ready | 1 |
| 3 | `colossal-order` | exploded | ready | 1 |
| 4 | `composite-order` | exploded | ready | 1 |
| 5 | `contemporary-parametric` | cutaway | ready | 1 |
| 6 | `corinthian-order` | exploded | ready | 1 |
| 7 | `doric-order` | exploded | ready | 1 |
| 8 | `egyptian-post-lintel` | cutaway | ready | 1 |
| 9 | `florence-cathedral-dome` | cutaway | ready | 1 |
| 10 | `gothic-ribbed-vault` | exploded | ready | 1 |
| 11 | `gothic-structural-system` | cutaway | ready | 1 |
| 12 | `greek-peristyle-temple` | exploded | ready | 1 |
| 13 | `guggenheim-bilbao` | cutaway | ready | 1 |
| 14 | `hagia-sophia-section` | cutaway | ready | 1 |
| 15 | `ionic-order` | exploded | ready | 1 |
| 16 | `modernism-five-points` | exploded | ready | 1 |
| 17 | `notre-dame-section` | cutaway | ready | 1 |
| 18 | `pantheon-cutaway` | cutaway | ready | 1 |
| 19 | `renaissance-dome-construction` | cutaway | ready | 1 |
| 20 | `roman-arch-vault` | cutaway | ready | 1 |
| 21 | `romanesque-barrel-vault` | cutaway | ready | 1 |
| 22 | `tuscan-order` | exploded | ready | 1 |

#### Category 12: Philippine Vernacular & Heritage (10 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `art-deco-manila` | cutaway | ready | 1 |
| 2 | `bahay-kubo` | exploded | ready | 1 |
| 3 | `bahay-na-bato` | exploded | ready | 1 |
| 4 | `earthquake-baroque-church` | cutaway | ready | 1 |
| 5 | `ifugao-house` | exploded | ready | 1 |
| 6 | `ivatan-stone-house` | exploded | ready | 1 |
| 7 | `locsin-cultural-center` | cutaway | ready | 1 |
| 8 | `manila-cathedral-section` | cutaway | ready | 1 |
| 9 | `san-agustin-church` | cutaway | ready | 1 |
| 10 | `vigan-heritage-house` | exploded | ready | 1 |

#### Category 13: Urban Planning, Zoning & Housing (18 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `building-typology-commercial` | parametric | ready | 2 |
| 2 | `building-typology-institutional` | parametric | ready | 2 |
| 3 | `building-typology-residential` | parametric | ready | 2 |
| 4 | `clup-zoning-overlay` | floorplan | ready | 2 |
| 5 | `erosion-control-fence` | parametric | ready | 2 |
| 6 | `fault-line-setback` | floorplan | ready | 2 |
| 7 | `housing-lot-minimums` | parametric | ready | 2 |
| 8 | `housing-open-space` | parametric | ready | 2 |
| 9 | `lot-frontage-requirements` | parametric | ready | 2 |
| 10 | `pd957-vs-bp220-comparison` | floorplan | ready | 2 |
| 11 | `road-hierarchy-standards` | parametric | ready | 2 |
| 12 | `rowhouse-cluster` | parametric | ready | 2 |
| 13 | `shoreline-setback` | floorplan | ready | 2 |
| 14 | `site-circulation-analysis` | floorplan | ready | 2 |
| 15 | `subdivision-layout-bp220` | floorplan | ready | 2 |
| 16 | `subdivision-layout-pd957` | floorplan | ready | 2 |
| 17 | `water-code-easements` | floorplan | ready | 2 |
| 18 | `zoning-setback-overlay` | floorplan | ready | 2 |

#### Category 14: Professional Practice & Specs (4 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `contract-document-hierarchy` | exploded | ready | 3 |
| 2 | `csi-masterformat-explorer` | parametric | ready | 3 |
| 3 | `door-schedule-configurator` | parametric | ready | 3 |
| 4 | `project-delivery-methods` | animated | ready | 3 |

#### Category 15: Estimating & Quantity Surveying (6 modules)

| # | Module ID | Template | Status | Phase | Notes |
|---|-----------|----------|--------|-------|-------|
| 1 | `calculator-chb` | calculator | built | 3 | |
| 2 | `calculator-drywall` | calculator | built | 3 | |
| 3 | `calculator-flooring` | calculator | built | 3 | **DASHBOARD ACTIVE** |
| 4 | `calculator-paint` | calculator | built | 3 | |
| 5 | `earthwork-volume` | parametric | ready | 3 | |
| 6 | `quantity-takeoff-room` | parametric | ready | 3 | |

#### Category 16: Site Development & Parking (4 modules)

| # | Module ID | Template | Status | Phase |
|---|-----------|----------|--------|-------|
| 1 | `carport-abutment-rules` | parametric | ready | 3 |
| 2 | `parking-layout` | floorplan | ready | 3 |
| 3 | `parking-slot-dimensions` | parametric | ready | 3 |
| 4 | `solar-orientation-painter` | parametric | ready | 3 |

---

## 6. Component Architecture <!-- updated: 2026-04-10 -->

### Component Tree

```mermaid
flowchart TD
    A[ThreeDLabPage<br/>Server Component] --> B{Auth + Tier Check}
    B -->|No Access| C[Locked State<br/>Upgrade CTA]
    B -->|Has Access| D[LabBrowserShell]
    D --> E[LabBrowser]
    E --> F{DASHBOARD_VISIBLE_IDS<br/>populated?}
    F -->|Yes| G[Flat Grid<br/>4 ModuleCards]
    F -->|No| H[CategoryGrid<br/>16 categories]
    H -->|Select category| I[ModuleList]
    I --> J[ModuleCard x N]
    G --> K[Navigate to /3d-lab/moduleId]
    J --> K

    L[LabModulePage<br/>Server Component] --> M{Module exists?}
    M -->|No| N[notFound / redirect]
    M -->|Yes| O{Auth + Tier Check}
    O -->|No| P[Redirect to /3d-lab]
    O -->|Yes| Q[ModuleViewer]
    Q --> R[loadModuleConfig<br/>dynamic import]
    R --> S[LabModuleShell + LabTopBar]
    S --> T{isBespoke?}
    T -->|Yes| U[LabViewport directly]
    T -->|No| V[LabViewportFrame<br/>WebGLErrorBoundary + Canvas]
    V --> W[LabViewport]
    U --> W
    W --> X{Template Router}
    X -->|parametric| X1[ParametricScene]
    X -->|exploded| X2[ExplodedAssembly]
    X -->|floorplan| X3[FloorPlanWalkthrough]
    X -->|cutaway| X4[CutawaySection]
    X -->|animated| X5[AnimatedSequence]
    X -->|calculator| X6[CalculatorTemplate]
    X -->|wall-configurator| X7[WallConfiguratorTemplate]
```

### Overlay / HUD System

```mermaid
flowchart TD
    A[CanvasWrapper] --> B[SceneTunnel.In]
    B --> C[SceneConfig]
    C --> D[CameraSync]
    D -->|writes camera ref| E[useOverlayStore]
    E -->|items Map| F[DOMOverlayLayer]
    F --> G[LabelOverlay]
    F --> H[HotspotCard]
    F --> I[ViolationBadge]
    F --> J[DimensionLabel]
    F --> K[PartTooltip]
```

### Component Inventory

| Component | File | Type | Responsibility |
|-----------|------|------|----------------|
| `ThreeDLabPage` | `src/app/dashboard/3d-lab/page.tsx` | Server | Auth gate, tier check, renders LabBrowser |
| `LabModulePage` | `src/app/dashboard/3d-lab/[moduleId]/page.tsx` | Server | Auth gate, module validation, renders ModuleViewer |
| `LabBrowser` | `components/LabBrowser.tsx` | Client | Gallery orchestrator -- flat grid or category drill-down |
| `CategoryGrid` | `components/CategoryGrid.tsx` | Client | 16-category selection grid |
| `ModuleList` | `components/ModuleList.tsx` | Client | Module list within a category |
| `ModuleCard` | `components/ModuleCard.tsx` | Client | Gallery card with template type badge |
| `ModuleViewer` | `components/ModuleViewer.tsx` | Client | Module loader + session manager |
| `LabViewport` | `components/LabViewport.tsx` | Client | Template router / scene switcher |
| `CanvasWrapper` | `components/CanvasWrapper.tsx` | Client | R3F canvas wrapper with SceneTunnel |
| `GlobalCanvasPortal` | `components/GlobalCanvasPortal.tsx` | Client | tunnel-rat SceneTunnel singleton |
| `SceneConfig` | `components/rendering/SceneConfig.tsx` | Client | Camera, controls, lighting, environment |
| `SceneBase` | `components/rendering/SceneBase.tsx` | Client | Sky color, fog, tone mapping, ground plane |
| `StudioLighting` | `components/rendering/StudioLighting.tsx` | Client | 4-preset lighting rig |
| `DOMOverlayLayer` | `components/overlays/DOMOverlayLayer.tsx` | Client | 2D DOM overlay projection system |
| `CameraSync` | `components/overlays/CameraSync.tsx` | Client | Syncs R3F camera to overlay store |
| `WebGLErrorBoundary` | `src/components/r3f/WebGLErrorBoundary.tsx` | Client (class) | Catches render errors + WebGL context loss |
| `LabBrowserShell` | `components/shell/LabBrowserShell.tsx` | Client | Browser page layout wrapper |
| `LabModuleShell` | `components/shell/LabModuleShell.tsx` | Client | Module detail layout with top bar |
| `LabViewportFrame` | `components/shell/LabViewportFrame.tsx` | Client | R3F Canvas host with WebGLErrorBoundary + DOMOverlayLayer |
| `LabTopBar` | `components/LabTopBar.tsx` | Client | Navigation bar with back button |
| `OnboardingFlow` | `components/OnboardingFlow.tsx` | Client | First-time user tutorial overlay |
| `ModuleContextCard` | `components/ModuleContextCard.tsx` | Client | Professional scenario context card |
| `Workspace` | `src/components/3d/Workspace.tsx` | Client | Legacy GLTF viewer (fallback) |
| `ViewportShell` | `components/shell/ViewportShell.tsx` | Client | Unified layout shell -- CSS grid with collapsible sidebars |
| `ViewportSidebar` | `components/shell/ViewportSidebar.tsx` | Client | Single sidebar container for all modules |
| `ViewportHeader` | `components/shell/ViewportHeader.tsx` | Client | Unified top bar (absorbs LabTopBar) |
| `ViewportToolbar` | `components/shell/ViewportToolbar.tsx` | Client | Config-driven floating toolbar |
| `ViewportBottomSheet` | `components/shell/ViewportBottomSheet.tsx` | Client | Mobile tab-based sidebar replacement |
| `ViewportStatusBar` | `components/shell/ViewportStatusBar.tsx` | Client | Optional compliance/dimension strip |
| `PanelCollapseButton` | `components/shell/PanelCollapseButton.tsx` | Client | Single collapse handle for all sidebars |
| `CameraNavigationBar` | `components/shell/CameraNavigationBar.tsx` | Client | 17-button grouped camera nav (modes, views, zoom) |
| `CommandPalette` | `components/shell/CommandPalette.tsx` | Client | Ctrl+K command search overlay |
| `CompassRose` | `components/shell/CompassRose.tsx` | Client | Site planning compass widget |
| `FirstTimeTooltip` | `components/shell/FirstTimeTooltip.tsx` | Client | New user onboarding hints |
| `GuidedTour` | `components/shell/GuidedTour.tsx` | Client | Multi-stop walkthrough system |
| `KpiBar` | `components/shell/KpiBar.tsx` | Client | Simplified metrics display |
| `LayersPanel` | `components/shell/LayersPanel.tsx` | Client | Layer toggles with pin/unpin |
| `SceneGround` | `components/shell/SceneGround.tsx` | Client | GridHelper + GizmoHelper (XZ grid + axis indicator) |
| `SceneToolbar` | `components/shell/SceneToolbar.tsx` | Client | Top-left 6-button toolbar (Grid/Dims/X-ray/Layers/Screenshot/Fullscreen) |
| `ViewportContextMenu` | `components/shell/ViewportContextMenu.tsx` | Client | Right-click context menu |
| `ViewportSkeleton` | `components/shell/ViewportSkeleton.tsx` | Client | Loading state placeholder |
| `ViewportToast` | `components/shell/ViewportToast.tsx` | Client | Non-blocking warning notifications |
| `WebGLRecovery` | `components/shell/WebGLRecovery.tsx` | Client | GPU crash recovery UI |
| `ViewportComfortGauge` | `components/stairway/ViewportComfortGauge.tsx` | Client | Blondel comfort gauge overlay for stairway |
| `EgressCalculatorPanel` | `components/stairway/EgressCalculatorPanel.tsx` | Client | Evacuation calculator panel |
| `ComplianceLawCard` | `components/stairway/ComplianceLawCard.tsx` | Client | Per-law compliance status card |
| `MaterialSelectorPanel` | `components/stairway/MaterialSelectorPanel.tsx` | Client | Stairway material selection panel |
| `ClickInspectPopover` | `components/stairway/ClickInspectPopover.tsx` | Client | Click-to-inspect detail popover |

### Bespoke & Complex Modules

| Module | File Path | Description |
|--------|-----------|-------------|
| `DevControlsModule` | `src/features/3d-lab/DevControlsModule/` | Site development controls (55+ files, most complex module) — uses ViewportShell header + own internal CSS grid |
| `stairway-configurator` | `src/features/3d-lab/config/modules/08-vertical/stairway-*.ts` + `components/stairway/` | Stairway configurator (16 config files, 19 UI components) — 4-law compliance, L/U-shape, egress calculator |
| `unified-wall-configurator` | `src/features/3d-lab/config/modules/10-materials/wall-*.ts` | Wall configurator v2 (19 config files) — 7 core types, instanced geometry, performance dashboard |
| `FARPlayground` | `src/features/3d-lab/scenes/FARPlayground/` | FAR calculator playground (legacy bespoke scene) |
| `ClassicalOrders` | `src/features/3d-lab/scenes/ClassicalOrders/` | Classical orders comparison (legacy bespoke scene) |
| `NBCPEnvelope` | `src/features/3d-lab/scenes/NBCPEnvelope/` | NBCP building envelope (legacy bespoke scene) |

---

## 7. State Management (12 Stores) <!-- updated: 2026-04-10 -->

### Store 1: `useLabNavigationStore`

**File:** `src/features/3d-lab/stores/useLabNavigationStore.ts`

```typescript
interface LabNavigationState {
  currentSequenceIndex: number
  exploreMode: ExploreMode           // 'guided' | 'free'
  guidedSequenceComplete: boolean

  advanceSequence: () => void
  setExploreMode: (mode: ExploreMode) => void
  setGuidedSequenceComplete: (complete: boolean) => void
  resetNavigation: () => void
}
```

### Store 2: `useLabProgressStore`

**File:** `src/features/3d-lab/stores/useLabProgressStore.ts`

```typescript
interface LabProgressState {
  visitedHotspotIds: Set<string>
  answeredQuestionIds: Set<string>
  correctQuestionIds: Set<string>
  parametricValues: Record<string, number>
  complianceState: ComplianceState   // 'compliant' | 'at-limit' | 'violation'
  quizResults: QuizResult[]

  markHotspotVisited: (id: string) => void
  addQuizResult: (result: QuizResult) => void
  setParametricValue: (controlId: string, value: number) => void
  setComplianceState: (state: ComplianceState) => void
  resetProgress: () => void
}
```

### Store 3: `useLabViewStore`

**File:** `src/features/3d-lab/stores/useLabViewStore.ts`

```typescript
interface LabViewState {
  activeHotspotId: string | null
  panelMode: PanelMode               // 'none' | 'info' | 'question' | 'quiz'
  questionAnswered: boolean
  selectedOptionId: string | null
  crossSectionEnabled: boolean
  explodedViewEnabled: boolean
  quizModeActive: boolean

  openHotspot: (id: string) => void
  closePanel: (markVisited?: boolean) => void
  openQuestion: () => void
  selectOption: (optionId: string) => void
  toggleCrossSection: () => void
  toggleExplodedView: () => void
  enterQuizMode: () => void
  exitQuizMode: () => void
  resetCamera: () => void
  resetView: () => void
}
```

### Store 4: `useLabStore` (Combined Facade)

**File:** `src/features/3d-lab/stores/useLabStore.ts`

Combined selector hook merging all 3 focused stores into the original `useLabStore` API. Provides `resetSession()` which calls `resetView()`, `resetProgress()`, and `resetNavigation()`. Also has static `setState` and `getState` methods for legacy compatibility.

Usage:
```typescript
// Selector-based (preferred)
const parametricValues = useLabStore((s) => s.parametricValues)

// Static access
useLabStore.getState().resetSession()
```

### Store 5: `legacyLabStore`

**File:** `src/features/3d-lab/stores/legacyLabStore.ts`

```typescript
interface LabState {
  lotArea: number                    // Default: 500
  far: number                       // Default: 2.5
  bhl: number                       // Default: 15
  setbackFront: number              // Default: 3
  setbackSide: number               // Default: 2
  activeHotspotId: string | null
  isQuizMode: boolean
  quizTargetPartId: string | null
  invalidateFn: (() => void) | null

  setParam: (key: ParametricKey, val: number) => void
  setActiveHotspot: (id: string | null) => void
  setQuizMode: (active: boolean, targetId?: string) => void
  setInvalidateFn: (fn: (() => void) | null) => void
  resetParametric: () => void
}
```

Legacy store with hardcoded NBCP defaults. Used by legacy bespoke scenes. Not yet fully replaced by focused stores.

### Store 6: `useOverlayStore`

**File:** `src/features/3d-lab/stores/useOverlayStore.ts`

```typescript
interface OverlayStore {
  items: Map<string, OverlayItem>
  cameraRef: THREE.Camera | null

  upsertItem: (item: OverlayItem) => void
  removeItem: (id: string) => void
  clearAll: () => void
  setCameraRef: (camera: THREE.Camera | null) => void
  openHotspot: (id: string) => void
  closeHotspot: (id: string) => void
  closeAllHotspots: () => void
}
```

Overlay item types: `label`, `hotspot`, `violation`, `dimension`, `area-tag`.

Overlay item payloads:
```typescript
interface LabelPayload { text: string; subtext?: string; codeRef?: string }
interface HotspotPayload { title: string; body: string; codeRef?: string; isOpen: boolean }
interface ViolationPayload { law: string; section: string; message: string; severity: 'error' | 'warning' }
interface DimensionPayload { value: number; unit: 'mm' | 'm'; label?: string; isViolating: boolean }
```

### Store 7: `useWallLabStore`

**File:** `src/features/3d-lab/stores/useWallLabStore.ts`

```typescript
interface WallLabState {
  step: WizardStep                   // 1-5
  completedSteps: Set<number>
  coreType: CoreType                 // 'chb' | 'drywall' | 'plywood' | 'cement-board' | 'brick' | 'solid-concrete' | 'existing-wall'
  coreThicknessMM: number
  coreMoistureResistant: boolean
  lengthM: number                    // Default: 5
  heightM: number                    // Default: 3
  sides: SideCount                   // 1 | 2
  layers: Layer[]
  lason: LasonConfig
  finishType: FinishType
  tileConfig: TileConfig
  tilePattern: string
  selectedColorHex: string
  selectedColorName: string
  activeSponsorId: string | null     // 'boysen' | 'davies' | 'island'
  topcoatCoats: number
  paintCoverageSqmPerL: number
  invalidateFn: (() => void) | null
  // ... 15+ action methods
}
```

### Store 8: `createModuleStore` (Factory)

**File:** `src/features/3d-lab/stores/createModuleStore.ts`

```typescript
interface ModuleStoreState {
  params: Record<string, number | boolean | string>
  activeAnnotation: string | null
  invalidateFn: (() => void) | null
  resetOnUnmount: boolean

  setParam: (key: string, value: number | boolean | string) => void
  setParams: (patch: Record<string, number | boolean | string>) => void
  setActiveAnnotation: (id: string | null) => void
  setInvalidateFn: (fn: (() => void) | null) => void
  reset: () => void
}
```

Factory function `createModuleStore(defaults, options)` produces per-module Zustand stores with parameter management and optional unmount reset.

### Store 9: `useDevControlsStore`

**File:** `src/features/3d-lab/DevControlsModule/stores/useDevControlsStore.ts`

Used by the bespoke Site Development Controls module. Contains lot parameters, zoning settings, building dimensions, and compliance state specific to the DevControls module.

### Store 10: `useSelectionStore`

**File:** `src/features/3d-lab/DevControlsModule/stores/useSelectionStore.ts`

Selection state for DevControls module -- tracks which lot zones, layers, and building elements are currently selected/highlighted.

### Store 11: `useViewportShellStore`

**File:** `src/features/3d-lab/stores/useViewportShellStore.ts`

```typescript
interface ViewportShellState {
  // Sidebar state
  leftSidebarCollapsed: boolean
  rightSidebarCollapsed: boolean

  // View mode
  activeViewMode: ViewMode  // 'perspective' | 'orthographic' | 'isometric' | 'top-down'

  // Camera
  activeCameraPreset: string | null

  // Navigation mode
  navMode: 'orbit' | 'pan' | 'look'

  // Mobile
  mobileActiveTab: string
  bottomSheetOpen: boolean

  // Scene toolbar state
  gridVisible: boolean            // Default: true
  dimensionsVisible: boolean      // Default: false
  xrayMode: boolean               // Default: false
  layersPanelOpen: boolean        // Default: false

  // Selection state
  selectedIds: Set<string>
  hoveredId: string | null

  // Invalidation bridge
  invalidateFn: (() => void) | null

  // Actions — UI only (no invalidate)
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  setMobileTab: (tab: string) => void
  setBottomSheetOpen: (open: boolean) => void
  toggleLayersPanel: () => void

  // Actions — scene-affecting toolbar toggles (calls invalidate)
  toggleGrid: () => void
  toggleDimensions: () => void
  toggleXray: () => void

  // Selection actions — UI only, no invalidate
  selectElement: (id: string) => void
  toggleSelect: (id: string) => void
  clearSelection: () => void
  boxSelect: (ids: string[]) => void
  setHoveredId: (id: string | null) => void

  // Navigation mode action
  setNavMode: (mode: 'orbit' | 'pan' | 'look') => void

  // Actions — scene-affecting (calls invalidate)
  setViewMode: (mode: ViewMode) => void
  setCameraPreset: (presetId: string | null) => void
  snapToPreset: (preset: 'front' | 'top' | 'left' | 'right' | 'rear' | 'iso' |
    'iso-ne' | 'iso-nw' | 'iso-se' | 'iso-sw' | 'zoom-to-fit' | 'zoom-in' |
    'zoom-out' | 'reset' | 'perspective') => void

  setInvalidateFn: (fn: (() => void) | null) => void
  reset: () => void
}
```

Shell-specific state for sidebar collapse, view mode, camera preset, scene toolbar toggles, element selection, and mobile tab. UI-only actions (sidebar, layers panel, selection) do NOT call invalidate(). Scene-affecting actions (view mode, camera preset, grid/dimensions/xray toggles, nav mode) MUST call invalidate().

### Store 12: `nbcpStore`

**File:** `src/features/3d-lab/stores/nbcpStore.ts`

NBCP-specific Zustand store for the NBCP Envelope module. Contains lot parameters, setback values, and zoning data specific to the NBCP envelope visualization.

---

## 8. Data Flow & API Contract

### Module Load Flow

```mermaid
sequenceDiagram
    participant User
    participant Server as LabModulePage (Server)
    participant Auth as getAdminAwareProfile()
    participant Registry as config/registry
    participant Client as ModuleViewer (Client)
    participant Loader as loadModuleConfig()
    participant Store as useLabStore

    User->>Server: GET /dashboard/3d-lab/[moduleId]
    Server->>Registry: getModuleById(moduleId)
    alt Module not found
        Server-->>User: 404 notFound()
    end
    Server->>Auth: getAdminAwareProfile() + getFeatureFlags()
    alt No access
        Server-->>User: redirect to /dashboard/3d-lab
    end
    Server->>Client: Render ModuleViewer(modelId)
    Client->>Store: resetSession()
    Client->>Loader: dynamic import(config/modules/{category}/{id})
    Loader-->>Client: ModuleConfig object
    Client->>Client: setState(config, loading=false)
    Client->>Client: Check localStorage for onboarding/context
    Client->>Client: Render LabModuleShell + LabViewport
```

### Module Config Loading

**Source:** `src/features/3d-lab/components/ModuleViewer.tsx`

The `loadModuleConfig()` function resolves module IDs to file paths using a precomputed `MODULE_PATHS` map derived from `ALL_MODULES` and `ASSET_TAXONOMY`:

```typescript
const loadModuleConfig = (moduleId: string): Promise<any> => {
  const path = MODULE_PATHS[moduleId] ?? moduleId
  return import(`@/features/3d-lab/config/modules/${path}`).then(
    (mod) => Object.values(mod)[0],
  )
}
```

### API / Action Routes

The 3D Lab currently has **no dedicated API routes**. All data flows through:

1. **Static config files** -- Module configs are TypeScript files dynamically imported at runtime
2. **Supabase queries** -- Auth via `getAdminAwareProfile()`, feature flags via `getFeatureFlags()`
3. **Client-side stores** -- All interaction state is client-only (Zustand)
4. **Telemetry** -- `useLabTelemetry({ moduleSlug })` hook (fires analytics events)

### Tables Touched

| Table | Operation | Trigger |
|-------|-----------|---------|
| `profiles` | SELECT | Auth check on page load |
| `feature_flags` | SELECT | Feature gate check |
| `models_3d` | Not actively queried | Legacy table -- module data now in TypeScript config |

---

## 9. Database Schema

### `models_3d` Table

The `models_3d` table is a **legacy artifact**. Module data has been migrated to TypeScript config files in `src/features/3d-lab/config/modules/`. The table still exists and has RLS policies but is not actively queried by the 3D Lab frontend.

```sql
-- Inferred from migrations 004, 006, 007, 012, 20260324, 20260408
CREATE TABLE public.models_3d (
  model_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT,
  slug        TEXT,
  url         TEXT,
  status      VARCHAR(20) DEFAULT 'draft'
              CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
  metadata    JSONB DEFAULT '{}'::jsonb,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_by  UUID REFERENCES auth.users(id),
  updated_by  UUID REFERENCES auth.users(id),
  lea_question_count INTEGER,
  lea_question_type  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_models_3d_status ON models_3d(status);

-- RLS
CREATE POLICY "Admins can manage models_3d" ON public.models_3d -- admin-only access

-- Audit trigger
CREATE TRIGGER audit_models_3d
  AFTER INSERT OR UPDATE OR DELETE ON public.models_3d -- fires audit log

-- Foreign key reference
-- camp_trail_nodes.model_id -> models_3d.model_id ON DELETE SET NULL
```

---

## 10. Rendering & Performance Architecture

### Canvas Configuration

**Source:** `src/features/3d-lab/components/shell/LabViewportFrame.tsx`

| Property | Value | Source |
|----------|-------|--------|
| `frameloop` | `"demand"` | Performance optimization -- only re-renders on invalidate |
| `dpr` | `[1, dpr]` where dpr starts at 1.5 (desktop) or 1.25 (mobile) | Adaptive via PerformanceMonitor |
| `shadows` | `true` | Shadow mapping enabled |
| `gl.antialias` | `true` | Anti-aliasing enabled |
| `gl.alpha` | `false` | No alpha channel (opaque background) |
| `gl.stencil` | `false` | Stencil buffer disabled (saves memory) |
| `gl.depth` | `true` | Depth buffer enabled |
| `camera` | `{ position: [6, 6, 6], fov: 35 }` | Fallback defaults |
| `gl.toneMapping` | `ACESFilmicToneMapping` | Set by SceneBase |
| `gl.outputColorSpace` | `SRGBColorSpace` | Set by SceneBase |

### PerformanceMonitor

The `PerformanceMonitor` from `@react-three/drei` dynamically adjusts DPR to maintain frame rate:
- `flipflops={3}` prevents DPR oscillation
- On decline: DPR decremented by 0.5 (floor: 1.0)
- On incline: DPR incremented by 0.5 (ceiling: 2.0 desktop, 1.25 mobile)
- Mobile detection: `window.matchMedia('(max-width: 768px)')` evaluated once on mount

### Lighting Presets

**Source:** `src/features/3d-lab/components/rendering/StudioLighting.tsx`

| Preset | Ambient | Key Intensity | Key Color | Fill Intensity | Fill Color | Shadows | Use Case |
|--------|---------|--------------|-----------|---------------|------------|---------|----------|
| `studio` | 0.35 | 1.2 | `#FFF5E6` (warm) | 0.4 | `#E6EFFF` (cool) | Yes | Default -- architectural viz |
| `clinical` | 0.70 | 1.0 | `#FFFFFF` | 0.6 | `#FFFFFF` | No | Detail inspection |
| `dramatic` | 0.10 | 2.0 | `#FFF5E6` (warm) | 0.1 | `#E6EFFF` (cool) | Yes | Presentation / hero |
| `flat` | 0.60 | 0.8 | `#FFFFFF` | 0 | -- | No | Calculator / diagram |

Shadow configuration: `shadow-mapSize={1024}`, `shadow-bias={-0.0001}`

### Camera Presets

**Source:** `src/features/3d-lab/config/camera-presets.ts`

| Preset | Position | FOV | Target | Use Case |
|--------|----------|-----|--------|----------|
| `front` | [0, 2, 8] | 35 | [0, 0, 0] | Facade / elevation |
| `top` | [0, 12, 0.01] | 45 | [0, 0, 0] | Plan / layout |
| `isometric` | [6, 6, 6] | 35 | [0, 0, 0] | Default lab view |
| `close-up` | [2, 2, 3] | 28 | [0, 0.5, 0] | Hotspot detail |
| `wide` | [10, 8, 10] | 50 | [0, 0, 0] | Site context |

### Scene Environment

**Source:** `src/features/3d-lab/components/rendering/SceneBase.tsx`

- **Sky color (clear color):** `#F2F0EB` (warm off-white)
- **Ground color:** `#f1f5f9` (slate-100)
- **Ground plane:** 80x80 unit plane, `MeshStandardMaterial`, roughness 0.92, metalness 0.0
- **Shadow disc:** 24-unit diameter circle (circleGeometry args=[12, 64]), 8% opacity, `depthWrite: false`
- **Fog:** Linear fog matching sky color, near=40, far=80
- **Tone mapping:** `ACESFilmicToneMapping`
- **Color space:** `SRGBColorSpace`

### SceneConfig System

**Source:** `src/features/3d-lab/components/rendering/SceneConfig.tsx`

Templates override only the values they need:

| Prop | Default | Description |
|------|---------|-------------|
| `cameraPosition` | `[6, 6, 6]` | Camera position |
| `cameraFov` | `35` | Perspective FOV |
| `orthographic` | `false` | Use orthographic camera |
| `cameraZoom` | `1` | Orthographic zoom |
| `minPolarAngle` | `0` | OrbitControls min polar |
| `maxPolarAngle` | `Math.PI / 1.75` | OrbitControls max polar |
| `minDistance` | `3` | OrbitControls min zoom distance |
| `maxDistance` | `Infinity` | OrbitControls max zoom distance |
| `showGround` | `true` | Show ground plane |
| `disableLighting` | `false` | Disable StudioLighting |
| `lightingPreset` | `'studio'` | Lighting preset |
| `disableSceneBase` | `false` | Disable SceneBase |
| `clearColor` | `undefined` | Override canvas clear color |
| `flat` | `false` | Flat shading (NoToneMapping) |

### Performance Optimizations

1. **Demand frameloop** -- Canvas only re-renders when `invalidate()` is called
2. **Invalidation bridge** -- Each store calls `invalidateFn?.()` after state changes
3. **Animation completion** -- `useAnimationComplete` stops useFrame after animation settles
4. **Dynamic imports** -- All template components are `next/dynamic` with `ssr: false`
5. **Registry code-splitting** -- `registryLoader.ts` uses dynamic import per category
6. **tunnel-rat** -- `SceneTunnel` avoids Canvas re-mount on scene changes
7. **WebGL memory monitor** -- `useWebGLMemoryMonitor` tracks GPU memory
8. **Disposal lifecycle** -- `useDisposeOnUnmount` cleans up Three.js resources
9. **Adaptive DPR** -- PerformanceMonitor adjusts DPR based on frame rate
10. **Mobile DPR cap** -- Mobile devices capped at 1.25x DPR

---

## 11. Asset Pipeline

### Current State

The 3D Lab does **not** use external GLB/GLTF files for any of the 209 modules. All geometry is generated procedurally via TypeScript config files that define `GeometryInstruction[]` arrays.

### Geometry Generation Pattern

Each module config exports a `geometry()` function that returns an array of `GeometryInstruction` objects:

```typescript
interface GeometryInstruction {
  id: string
  type: 'box' | 'cylinder' | 'plane' | 'line' | 'ring' | 'sphere' | 'cone'
  position: Vector3Tuple
  rotation?: Vector3Tuple
  scale?: Vector3Tuple
  args: number[]           // Constructor args per geometry type
  color: string
  opacity?: number
  transparent?: boolean
  label?: string
}
```

The `GeometryMesh` component in `src/features/3d-lab/components/templates/GeometryMesh.tsx` renders these instructions as Three.js meshes with `MeshStandardMaterial`.

### Asset Manifest (Prepared but Unused)

The `ModuleRegistryEntry` type includes an optional `assets` field for future preloading:

```typescript
assets?: {
  models?: string[]     // GLTF/GLB/DRACO paths
  textures?: string[]   // Texture image paths
}
```

No modules currently populate this field. The `AssetPreloader` component exists at `src/features/3d-lab/components/rendering/AssetPreloader.tsx` but has no active consumers.

### DRACO Decoder

DRACO decoder path is configured globally in `LabViewportFrame.tsx`:
```typescript
useGLTF.setDecoderPath('/draco/')
```
The `/public/draco/` directory must contain the Draco WASM decoder files. This is configured for future use but no current modules use GLTF assets.

### Legacy GLTF Viewer

The `Workspace` component (`src/components/3d/Workspace.tsx`, ~500 lines) supports loading external GLB models via `useGLTF`, but no current lab modules route to it. It serves as a fallback path in `LabViewport`.

---

## 12. Interaction & UX Patterns <!-- updated: 2026-04-10 -->

### Implemented Interactions

| Interaction | Template(s) | Implementation |
|-------------|-------------|----------------|
| **Parametric sliders** | parametric, all | `GenericControlPanel` + `createModuleStore` |
| **Toggle parameters** | parametric | `ParameterDef.type: 'toggle'` |
| **Dropdown selection** | parametric | `ParameterDef.type: 'dropdown'` |
| **Explode slider** | exploded | Per-part `explodeOffset` interpolation |
| **Step-through animation** | animated | `SequenceStep[]` with auto-play |
| **Layer reveal** | cutaway | Per-layer visibility along cut axis |
| **Violation indicators** | parametric | `ViolationRule.check()` + `ViolationBadge` overlay |
| **Annotations** | parametric, exploded | `AnnotationDef` + `LabelOverlay` / `HotspotCard` |
| **Compliance scoring** | DevControls | `ComplianceScorecard` + `ComplianceSummary` |
| **Presets** | parametric | `Preset[]` with bulk parameter assignment |
| **Human silhouette** | parametric | `HumanSilhouette` (1.7m scale reference) |
| **Orbit controls** | all | drei `OrbitControls` with configurable limits |
| **Camera presets** | DevControls | `CameraPresetBar` (5 named presets) |
| **Wizard steps** | wall-configurator | 5-step wizard (CoreType -> Geometry -> Treatment -> Finish -> Color) |
| **Sponsor palettes** | wall-configurator | `SponsorPalette` (Boysen, Davies, Island Paints) |
| **BOM (Bill of Materials)** | wall-configurator | `BOMPanel` with material quantity estimates |
| **Onboarding** | all | `OnboardingFlow` (localStorage-gated) |
| **Context scenario** | all | `ModuleContextCard` (per-module localStorage-gated) |
| **Hotspot quiz** | via stores | `enterQuizMode()` / `exitQuizMode()` + `QuizResult` tracking |
| **Guided sequence** | via stores | `advanceSequence()` / `setExploreMode('guided' | 'free')` |
| **Dimension labels** | via overlays | `DimensionLabel` DOM overlay with violation state |
| **Post-module CTA** | all | `PostModuleCTA` shown after module completion |
| **Viewport Chrome** | all | `ViewportShell` + `ViewportToolbar` -- config-driven toolbar, unified sidebars, mobile bottom sheet |
| **Scene Toolbar** | all | `SceneToolbar` -- 6-button floating toolbar (Grid/Dims/X-ray/Layers/Screenshot/Fullscreen) |
| **Camera Navigation Bar** | all | `CameraNavigationBar` -- 17-button grouped nav (modes, standard views, isometric, zoom) |
| **Grid + Axis Gizmo** | all | `SceneGround` -- XZ plane GridHelper (20x20, 0.6 opacity) + GizmoHelper (RGB xyz, bottom-right) |
| **Command Palette** | all | `CommandPalette` -- Ctrl+K search overlay for modules, presets, actions |
| **Right-click Context Menu** | all | `ViewportContextMenu` -- context menu on right-click (OrbitControls right-click disabled) |
| **Keyboard Shortcuts** | all | `useViewportShortcuts` -- G/D/X/L/P/F for toolbar, Ctrl+Z for undo, Ctrl+K for command palette |
| **Layers Panel Pin/Unpin** | all | `LayersPanel` -- persistent layer panel toggled via SceneToolbar L button |
| **Camera Snap** | all | `useCameraSnap` -- animated transitions to 15 named camera presets |
| **Navigation Modes** | all | `navMode` in ViewportShellStore -- orbit/pan/look (3 modes) |
| **Element Selection** | all | `selectedIds` + `hoveredId` in ViewportShellStore -- click/shift-click/box-select |
| **Undo/Redo** | all | `useUndoRedo` -- history state + revert functionality |
| **GPU Crash Recovery** | all | `WebGLRecovery` -- graceful GPU crash handling with retry UI |
| **Loading Skeleton** | all | `ViewportSkeleton` -- placeholder during module loading |
| **Toast Notifications** | all | `ViewportToast` -- non-blocking warning/info messages |
| **Guided Tour** | per-module | `GuidedTour` -- multi-stop walkthrough with `tourStops` in ViewportCapabilities |
| **First-Time Tooltip** | all | `FirstTimeTooltip` -- new user onboarding hints |
| **Compass Rose** | site planning | `CompassRose` -- orientation widget for site planning modules |
| **Stairway Comfort Gauge** | stairway | `ViewportComfortGauge` -- Blondel comfort gauge overlay |
| **Stairway Click-to-Inspect** | stairway | `ClickInspectPopover` -- click geometry regions for detail |
| **Stairway Egress Calculator** | stairway | `EgressCalculatorPanel` -- occupancy-based evacuation width |
| **Wall View Modes** | wall-configurator | Overview/section-cut/exploded/build-sequence/compare |
| **Wall Performance Dashboard** | wall-configurator | Fire/STC/cost/R-value metric badges |

### Not Yet Implemented (Scaffolded in Types)

| Feature | Evidence |
|---------|----------|
| Challenge mode (find violations) | `hasChallengeMode` in config types, no UI implementation |
| Learning phases (guided/faded/sandbox/challenge) | `supportedPhases` in config types, no progression system |
| Asset preloading | `assets.models[]` and `assets.textures[]` in registry, no consumers |
| Collaboration presence | `useCollaborationPresence` hook exists, no server-side backing |
| Drag-drop file upload | `useDragDrop` hook exists, no upload endpoint |

**Note:** Camera presets and tours are now available in all modules via `CameraNavigationBar` (15 named presets) and `GuidedTour` (per-module `tourStops`). Camera presets are no longer DevControls-only.

### Mobile Touch

OrbitControls handles touch natively via `touch-action: none` on the canvas container. All modules now use `ViewportBottomSheet` for mobile layouts (replacing the DevControls-only `BottomSheet`). Sidebar content is delivered as tabs in the bottom sheet on screens below `md` breakpoint.

---

## 12A. Unified Viewport Shell <!-- updated: 2026-04-10 -->

### Overview

The Unified Viewport Shell is a slot-based layout system implemented in April 2026. The shell owns ALL viewport containers (header, sidebars, toolbar, bottom sheet, scene toolbar, camera navigation). Templates inject CONTENT into named slots -- they never create their own containers. 213 modules (209 template + 4 calculator) now route through ViewportShell.

### Shell Components (26 files in `src/features/3d-lab/components/shell/`)

#### Core Shell (7 files — layout structure)

| Component | File | Replaces |
|-----------|------|----------|
| `ViewportShell` | `shell/ViewportShell.tsx` | `LabModuleShell` |
| `ViewportSidebar` | `shell/ViewportSidebar.tsx` | `LabPanelLayout` panels |
| `ViewportHeader` | `shell/ViewportHeader.tsx` | `LabTopBar` (absorbs) |
| `ViewportToolbar` | `shell/ViewportToolbar.tsx` | DevControls' ViewportToolbar, Calculator's FloatingCameraBar |
| `ViewportBottomSheet` | `shell/ViewportBottomSheet.tsx` | DevControls' BottomSheet |
| `ViewportStatusBar` | `shell/ViewportStatusBar.tsx` | New |
| `PanelCollapseButton` | `shell/PanelCollapseButton.tsx` | All divergent collapse buttons |

#### Viewport UX (13 files — toolbar, camera, overlays) <!-- added: 2026-04-10 -->

| Component | File | Purpose |
|-----------|------|---------|
| `CameraNavigationBar` | `shell/CameraNavigationBar.tsx` | 17-button grouped camera nav: 3 modes (orbit/pan/look) + 5 standard views + 5 isometric + 3 zoom + reset |
| `CommandPalette` | `shell/CommandPalette.tsx` | Ctrl+K command search overlay for modules, presets, actions |
| `CompassRose` | `shell/CompassRose.tsx` | Site planning compass widget |
| `FirstTimeTooltip` | `shell/FirstTimeTooltip.tsx` | New user onboarding hints |
| `GuidedTour` | `shell/GuidedTour.tsx` | Multi-stop walkthrough system driven by `tourStops` in ViewportCapabilities |
| `KpiBar` | `shell/KpiBar.tsx` | Simplified metrics display for compliance scores |
| `LayersPanel` | `shell/LayersPanel.tsx` | Layer toggles with pin/unpin (persistent via SceneToolbar L button) |
| `SceneGround` | `shell/SceneGround.tsx` | R3F component: GridHelper (XZ plane, 20x20, 0.6 opacity) + GizmoHelper (axis indicator, bottom-right, RGB labels) |
| `SceneToolbar` | `shell/SceneToolbar.tsx` | Top-left 6-button floating toolbar: **G**rid / **D**imensions / **X**-ray / **L**ayers / **P**hotograph / **F**ullscreen |
| `ViewportContextMenu` | `shell/ViewportContextMenu.tsx` | Right-click context menu (right-click disabled on OrbitControls) |
| `ViewportSkeleton` | `shell/ViewportSkeleton.tsx` | Loading state placeholder during module load |
| `ViewportToast` | `shell/ViewportToast.tsx` | Non-blocking warning/info notifications |
| `WebGLRecovery` | `shell/WebGLRecovery.tsx` | GPU crash recovery UI with retry |

#### Legacy Shell (6 files — pre-ViewportShell, still referenced)

| Component | File | Status |
|-----------|------|--------|
| `LabBrowserShell` | `shell/LabBrowserShell.tsx` | Active — browser page layout |
| `LabEmptyState` | `shell/LabEmptyState.tsx` | Active — empty state |
| `LabMetaPanel` | `shell/LabMetaPanel.tsx` | Active — metadata side panel |
| `LabModuleShell` | `shell/LabModuleShell.tsx` | **Deprecated** — replaced by ViewportShell |
| `LabOverlayLayer` | `shell/LabOverlayLayer.tsx` | Active — overlay container |
| `LabViewportFrame` | `shell/LabViewportFrame.tsx` | Active — R3F Canvas host |

### New Types (`src/features/3d-lab/types/templates.ts`)

- `ViewportShellConfig` -- declares which layout slots a module uses (leftSidebar, rightSidebar, statusBar, mobileBottomSheetTabs)
- `ViewportCapabilities` -- declares which toolbar controls a module supports (cameraPresets, viewModes, crossSection, explodedView, humanScale, resetCamera)
- `ViewportShellContent` -- what templates return: leftSidebarContent, rightSidebarContent, canvasContent, statusBarContent, toolbarExtras
- `TEMPLATE_SHELL_DEFAULTS` -- convention-over-configuration defaults per template type

### New Store: `useViewportShellStore` (Store 11)

**File:** `src/features/3d-lab/stores/useViewportShellStore.ts`

State: leftSidebarCollapsed, rightSidebarCollapsed, activeViewMode, activeCameraPreset, mobileActiveTab, bottomSheetOpen, invalidateFn

UI-only actions (no invalidate): toggleLeftSidebar, toggleRightSidebar, setMobileTab, setBottomSheetOpen
Scene-affecting actions (calls invalidate): setViewMode, setCameraPreset

### Content Builder Hook: `useTemplateContent`

**File:** `src/features/3d-lab/hooks/useTemplateContent.tsx`

Builds ViewportShellContent per template type. Creates stable module stores, resolves template defaults, and returns sidebar + canvas + toolbar content for each template type.

### Extracted Sidebar Components

| Component | Template | Purpose |
|-----------|----------|---------|
| `ExplodedPartsSidebar` | exploded | Parts list with active part detail |
| `ExplodeSliderControl` | exploded | Compact explode slider for toolbar |
| `CutawayLayersSidebar` | cutaway | Layer list with visibility tied to cut depth |
| `CutDepthSliderControl` | cutaway | Compact cut depth slider for toolbar |
| `FloorPlanLegendSidebar` | floorplan | Room legend + violation summary |
| `AnimatedStepsSidebar` | animated | Step list with playback controls |

### Layout Architecture

Desktop: CSS Grid (DevControls-proven pattern)
```
[left-sidebar] [left-handle 20px] [viewport 1fr] [right-handle 20px] [right-sidebar]
```
Panel collapse: `grid-template-columns` CSS transition (200ms cubic-bezier).

Mobile (< md): Flex column with ViewportBottomSheet replacing sidebars as tabs.

### Default Layout Matrix (from `TEMPLATE_SHELL_DEFAULTS`)

| Template | Left Sidebar | Right Sidebar | View Modes | Camera Presets |
|----------|-------------|---------------|------------|----------------|
| parametric | Yes (320px, Controls) | Yes (300px, Controls) | perspective, isometric | Yes |
| exploded | No | Yes (300px, Parts) | perspective, isometric | Yes |
| cutaway | No | Yes (300px, Layers) | perspective, isometric | Yes |
| floorplan | No | Yes (300px, Legend) | top-down, perspective | Yes |
| animated | No | Yes (300px, Steps) | perspective, isometric | Yes |
| calculator | Yes (340px, Inputs) | Yes (340px, Results) | orthographic, perspective | Yes |
| wall-configurator | Yes (340px, Configure) | Yes (320px, Materials) | perspective, isometric | Yes |

All templates share a common `DEFAULT_FLOATING_TOOLBAR` with 4 items: Grid (G), Dimensions (D), Screenshot (P), Fullscreen (F).

### Migration Status

All 213 modules route through ViewportShell:
- 6/7 templates: full shell with sidebars + toolbar
- Calculator (4 modules): ViewportShell header, own internal 3-column layout
- DevControls (1 module): ViewportShell header, own internal CSS grid

### Performance Contract

- Shell is 100% DOM-rendered -- zero Three.js scene objects (except `SceneGround` which renders inside the R3F Canvas)
- Sidebar collapse: 200ms CSS transition, 0 JS frames
- Controls that don't affect 3D scene MUST NOT call invalidate()
- Camera transitions: self-terminating via `useAnimationComplete` and `useCameraSnap`
- OrbitControls constraints: `minPolarAngle: 0.1`, `maxPolarAngle: π/2 - 0.05`, `minDistance: 1`, `maxDistance: 500`
- Right-click disabled on OrbitControls (reserved for `ViewportContextMenu`)

---

## 12B. Stairway Configurator <!-- added: 2026-04-10 -->

### Overview

The Stairway Configurator is a bespoke parametric module (`stairway-configurator`) that provides comprehensive stairway design and compliance checking against 4 Philippine building codes simultaneously. It supports straight, L-shape, and U-shape stair types with real-time Blondel comfort analysis, egress calculation, and international code comparison.

**Dashboard Status:** ACTIVE (one of 4 visible modules)

### Architecture

The stairway configurator is implemented as a multi-file extension within `src/features/3d-lab/config/modules/08-vertical/`:

| File | Purpose | Lines |
|------|---------|-------|
| `stairway-configurator.ts` | Main module config with full geometry builder | ~1400 |
| `stairway-computation.ts` | Pure computation engine (compliance, comfort, pitch) | ~700 |
| `stairway-computation.test.ts` | Unit tests (Blondel, pitch, egress, state) | ~200 |
| `stairway-types.ts` | Type definitions | ~170 |
| `stairway-constants.ts` | PD 1096, BP 220/344, RA 9514 code thresholds | ~380 |
| `stairway-constants-international.ts` | IBC 2024, ADA, IRC constants (**UNVERIFIED**) | ~140 |
| `stairway-geometry-l-shape.ts` | L-stair geometry with `turnDirection` | ~190 |
| `stairway-geometry-u-shape.ts` | U-stair geometry | ~220 |
| `stairway-nosing.ts` | Extruded-profile nosing at tread midpoint | ~100 |
| `stairway-materials.ts` | Material colors per core type | ~70 |
| `stairway-egress.ts` | Evacuation calculator, occupancy-based width | ~90 |
| `stairway-click-targets.ts` | Click-to-inspect geometry regions | ~90 |
| `stairway-presets.ts` | Violation presets (residential, commercial, etc.) | ~180 |

### Key Types

```typescript
type StairTypeConfig =
  | { type: 'straight' }
  | { type: 'l-shape'; turnDirection: 'left' | 'right'; risersBeforeTurn: number }
  | { type: 'u-shape'; risersBeforeTurn: number }

interface ComputedStairState {
  // Raw parameters
  projectType: string
  isAccessibleRoute: boolean
  isExitStair: boolean
  stairWidth: number
  riserHeight: number
  treadDepth: number
  headroom: number
  handrailHeight: number
  numRisers: number

  // Stair type + derived metrics
  stairType: StairTypeConfig
  twoRPlusT: number          // Blondel comfort (2R + T)
  rPlusT: number             // R + T sum
  comfortStatus: ComfortZoneStatus
  pitchAngle: number
  pitchStatus: PitchStatus

  // Per-law compliance (4 laws simultaneously)
  riserCompliance: ComplianceResult   // PD 1096, BP 220, BP 344, RA 9514
  treadCompliance: ComplianceResult
  widthCompliance: ComplianceResult
  headroomCompliance: ComplianceResult
  handrailCompliance: ComplianceResult

  // Resolved violation colors
  riserColor: string | null
  treadColor: string | null
  widthColor: string | null

  // International comparison (IBC, ADA, IRC)
  internationalDeltas: InternationalComparisonDelta[]
}
```

### UI Components (19 files in `src/features/3d-lab/components/stairway/`)

| Component | Purpose |
|-----------|---------|
| `ViewportComfortGauge` | Blondel comfort gauge overlay (2R+T) |
| `EgressCalculatorPanel` | Evacuation width calculator by occupancy |
| `ComplianceLawCard` | Per-law compliance status card |
| `ComplianceSummaryBadge` | Aggregate compliance badge |
| `ClickInspectPopover` | Click-to-inspect detail popover |
| `ComparisonPanel` | International code comparison panel |
| `ComparisonToggle` | Toggle for comparison mode |
| `ChildSafetyPanel` | Children's safety assessment |
| `HandrailDetailPanel` | Handrail graspability and height |
| `NosingDetailPanel` | Nosing profile detail |
| `MaterialSelectorPanel` | Material selection (concrete, steel, wood) |
| `DimensionSlider` | Parametric dimension slider |
| `EvacuationControls` | Evacuation simulation controls |
| `FixButton` | Auto-fix violation to nearest compliant value |
| `LawActivationDot` | Law compliance indicator dot |
| `PresetChip` / `PresetChipStrip` | Preset selection chips |
| `ViolationRow` | Single violation display row |

### Unit Tests

**File:** `stairway-computation.test.ts`

- `computeBlondelComfort`: 5 test cases (comfortable, stretched, cramped, boundaries)
- `computePitch`: 4 test cases (ramp-like, comfortable, steep, ladder-like)
- `computeStairState`: 4 preset validation tests + stair type parsing
- `computeEgressRequirements`: 9 test cases (occupancy types, PD 1096 override, width qualification)

### Geometry

Uses `extruded-profile` GeometryType for nosing detail. L-shape and U-shape geometries have separate builder files that produce `GeometryInstruction[]` arrays with landing platforms and turn geometry.

### Data Verification

- PD 1096, BP 220, BP 344, RA 9514 constants: **Verified**
- IBC 2024, ADA, IRC international constants: **UNVERIFIED** — marked in source comments

---

## 12C. Wall Configurator v2 <!-- added: 2026-04-10 -->

### Overview

The Wall Configurator v2 is a complete multi-file rewrite of the original wall configurator module (`unified-wall-configurator`). It introduces structural fidelity with per-core-type geometry builders, instanced mesh rendering for masonry patterns, performance metrics (fire rating, STC, cost, R-value), and 5 view modes.

**Dashboard Status:** ACTIVE (one of 4 visible modules)

### Architecture

The wall v2 is implemented as 19 support files within `src/features/3d-lab/config/modules/10-materials/`:

#### Type System & Registry

| File | Purpose |
|------|---------|
| `wall-types.ts` | `CoreType`, `StructuralSystem`, `WallViewMode`, `CoreTypeRegistryEntry` |
| `wall-types-comparison.ts` | Comparison mode types |
| `wall-core-registry.ts` | 7 wall types with structural metadata + performance baselines |

#### Constants & Data

| File | Purpose |
|------|---------|
| `wall-constants.ts` | NSCP, PD 1096 thresholds |
| `wall-constants-performance.ts` | Fire/STC/cost/R-value data (**UNVERIFIED**) |
| `wall-constants-international.ts` | IBC, ASTM, EN standards (**UNVERIFIED**) |

#### Geometry Builders (Sub-specialized)

| File | Purpose |
|------|---------|
| `wall-geometry.ts` | Main geometry orchestrator — dispatches to per-core-type builders |
| `wall-geometry-chb.ts` | CHB representative section + instanced blocks |
| `wall-geometry-drywall.ts` | Studs, tracks, gypsum layers |
| `wall-geometry-brick.ts` | Brick unit + mortar pattern |
| `wall-geometry-generic.ts` | Fallback for unknown core types |
| `wall-geometry-layers.ts` | Shared finish layer stacking |
| `wall-geometry-mep.ts` | Electrical/mechanical conduit runs |
| `wall-geometry-connections.ts` | Corner/edge assembly details |

#### Computation & Features

| File | Purpose |
|------|---------|
| `wall-computation.ts` | Pure function producing `ComputedWallState` (~600 lines) |
| `wall-build-steps.ts` | Build sequence animation frames |
| `wall-section-assembly.ts` | Assembly instructions |
| `wall-violations.ts` | 12 expanded violation rules (fire rating, STC, thickness, etc.) |
| `wall-presets.ts` | 12 presets (residential, commercial, PHI standard, etc.) |

### Key Types

```typescript
type CoreType = 'chb' | 'drywall' | 'plywood' | 'cement-board' | 'brick' | 'solid-concrete' | 'existing-wall'
type StructuralSystem = 'unit-masonry' | 'framed' | 'panel' | 'monolithic' | 'generic'
type WallViewMode = 'overview' | 'section-cut' | 'exploded' | 'build-sequence' | 'compare'

interface CoreTypeRegistryEntry {
  // Identification
  thickness: number
  color: string
  label: string
  hasMortarPattern: boolean

  // Structural metadata
  structuralSystem: StructuralSystem
  isLoadBearing: boolean | 'configurable'
  supportsInsulation: boolean
  supportsWaterproofing: boolean
  supportsMEP: boolean

  // Performance data (UNVERIFIED)
  baseFireRatingMinutes: number
  baseSTC: number
  baseRValue: number
  baseCostPerSqm: number    // Philippine Peso

  // Quantity data
  unitsPerSqm: number | null    // 12.5 for CHB, ~50 for brick
  mortarVolumePerSqm: number | null
}
```

### View Modes

| Mode | Description |
|------|-------------|
| `overview` | Standard 3D wall assembly view |
| `section-cut` | Cross-section revealing internal layers |
| `exploded` | Layers separated for inspection |
| `build-sequence` | Step-by-step construction animation |
| `compare` | Side-by-side comparison of two core types |

### Instanced Geometry

The wall configurator uses the `instanced` GeometryType for CHB block patterns and brick layouts. `wall-geometry-chb.ts` generates `instancedPositions`, `instancedRotations`, and `instancedColors` arrays for efficient rendering of repetitive masonry units via `InstancedMesh`.

### Backward Compatibility

- `ParametricSceneConfig` interface is UNCHANGED
- All 209 existing modules are unaffected
- The `visibleWhen` field on `ParameterDef` enables adaptive parameter visibility per core type
- The wall configurator still uses template type `'wall-configurator'` and routes through `WallConfiguratorTemplate`

### Data Verification

- NSCP, PD 1096 structural constants: **Verified**
- Fire rating, STC, cost, R-value performance data: **UNVERIFIED** — marked in source
- IBC, ASTM, EN international constants: **UNVERIFIED** — marked in source

---

## 13. Regulatory Compliance Engine

### Regulatory Codes Covered

**Source:** `src/features/3d-lab/config/constants/`

| Code | File | Scope |
|------|------|-------|
| PD 1096 | `constants/pd-1096.ts` | National Building Code of the Philippines -- room minimums, ceiling heights, firewalls, staircases, light/ventilation, courts, occupancy, FAR/BHL |
| BP 344 | `constants/bp-344.ts` | Accessibility Law -- ramps, toilets, corridors, doors, signage, parking |
| RA 9514 | `constants/ra-9514.ts` | Fire Code -- fire travel distance, exits, sprinklers, fire doors, fire ratings |
| NSCP | `constants/nscp.ts` | National Structural Code -- seismic parameters, wind loads, soil profiles |

### How Violations Are Detected

Each module config can include `violations: ViolationRule[]`:

```typescript
interface ViolationRule {
  id: string
  check: (params: Record<string, number | boolean | string>) => boolean
  field: string
  message: string
  codeCitation?: string
  severity: 'error' | 'warning' | 'info'
  position?: (params: Record<string, number | boolean | string>) => Vector3Tuple
}
```

The `check()` function is evaluated on every parameter change. When it returns `true`, the violation is active.

### How Violations Are Displayed

1. **ViolationBadge** (DOM overlay) -- positioned in screen space via `DOMOverlayLayer`, showing law, section, and message
2. **ViolationIndicator** (R3F mesh) -- in-scene 3D indicator at the violation world position
3. **ComplianceReportPanel** -- summary panel listing all active violations
4. **ComplianceScorecard** -- aggregate compliance score (DevControls module)

### Legal Citation System

**Source:** `src/features/3d-lab/types/templates.ts`

```typescript
type ValueClassification = 'code-mandated' | 'code-derived' | 'pedagogical' | 'ux-arbitrary'

interface LegalCitation {
  law: string              // e.g. 'PD 1096'
  section: string          // e.g. 'IRR Rule VIII §801'
  article?: string
  description: string
  value?: string           // e.g. '2.70 m minimum'
  classification: ValueClassification
  verified?: string        // Verification date
}
```

Classification levels:
- **code-mandated**: Value directly stated in law (e.g., "minimum ceiling height 2.70m")
- **code-derived**: Calculated from code requirements (e.g., "minimum window area = 10% of floor area")
- **pedagogical**: Chosen for learning effectiveness (e.g., default room dimensions for visualization)
- **ux-arbitrary**: Pure UX decision (e.g., slider step sizes)

### Example: PD 1096 Constants

```typescript
export const PD_1096 = {
  ROOM_MIN_AREA: { habitable: 6.0, kitchen: 3.0, bathroom: 1.2, laundry: 1.5 },  // sqm
  ROOM_MIN_DIMENSION: { habitable: 2.0, kitchen: 1.5, bathroom: 0.9, laundry: 0.9 },  // m
  CEILING_HEIGHT: { habitable: 2.7, mezzanine: 1.8, basement: 2.4 },  // m
  FIREWALL: { parapetAboveRoof: 0.40, fromOutermostEdge: 0.60, underEaves: 0.30 },  // m
  STAIRCASE: { maxRiser: 0.20, minDoorWidth: 0.90, minDoorHeight: 2.00, maxDoorWidth: 1.20 },  // m
  LIGHT_VENT: { minWindowToFloorRatio: 0.10, maxRoomDepthToWindowHeadRatio: 2.5 },
  // ... additional constants
}
```

---

## 14. Pedagogical Integration

### Current Integration Points

1. **Telemetry** -- `useLabTelemetry({ moduleSlug })` fires analytics events on module open, interactions, and completion
2. **Quiz results** -- `QuizResult` objects tracked in `useLabProgressStore` with `questionId`, `correct`, `timeMs`
3. **LEA question mapping** -- Each module config has optional `leaQuestionCount` and `leaQuestionType` fields linking to estimated LEA exam coverage
4. **Context scenarios** -- `contextScenario` field provides professional context framing for each module
5. **Guided sequences** -- `useLabNavigationStore` supports guided vs. free explore modes

### Not Yet Connected to SRS

The 3D Lab does **not** currently feed into the SRS (Spaced Repetition System) at `src/lib/srs/`. The quiz results tracked in `useLabProgressStore` are client-side only and are not persisted to the database or fed into the IRT/SM-2 engines.

### Scaffolded but Unimplemented

- `supportedPhases: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>` -- defined in config types but no progression system built
- `hasChallengeMode` -- defined but no "find the violation" challenge UI exists
- `leaQuestionCount` / `leaQuestionType` -- mapped per module but not used for adaptive learning

### Readiness Score Connection

The 3D Lab is not currently a vector in the readiness score computation (`src/lib/readiness-score.ts`). Lab interactions do not affect the 6-vector readiness calculation.

---

## 15. Hook & Utility Inventory

### Hooks (`src/features/3d-lab/hooks/`) — 14 hooks

| Hook | File | Signature | Description |
|------|------|-----------|-------------|
| `useAnimationComplete` | `hooks/useAnimationComplete.ts` | `(callback, isComplete) => { reset }` | Wraps useFrame with completion detection for demand frameloop |
| `useCameraSnap` | `hooks/useCameraSnap.ts` | `() => void` | Camera animation to 15 named presets + zoom-to-fit |
| `useCameraTransition` | `hooks/useCameraTransition.ts` | `(target, duration?) => void` | Smooth camera transitions between positions |
| `useCollaborationPresence` | `hooks/useCollaborationPresence.ts` | `() => PresenceState` | User presence indicators (cursors, selections) — **scaffolded, no server** |
| `useDragDrop` | `hooks/useDragDrop.ts` | `() => DragState` | File upload + object dragging — **scaffolded, no endpoint** |
| `useInvalidateOnChange` | `hooks/useInvalidateOnChange.ts` | `() => void` | Registers R3F invalidate callback into store |
| `useModuleInvalidate` | `hooks/useModuleInvalidate.ts` | `() => void` | Module-specific invalidation bridge |
| `useModuleLifecycle` | `hooks/useModuleLifecycle.ts` | `(useStore, resetOnUnmount?) => void` | Calls store.reset() on unmount when resetOnUnmount is true |
| `useNBCPInvalidateOnChange` | `hooks/useNBCPInvalidateOnChange.ts` | `() => void` | NBCP-specific invalidation bridge |
| `useSelectionModel` | `hooks/useSelectionModel.ts` | `() => SelectionState` | Multi-select state management (click, shift-click, box-select) |
| `useTemplateContent` | `hooks/useTemplateContent.tsx` | `(config, entry) => ViewportShellContent` | Builds ViewportShellContent per template type with stable module stores |
| `useUndoRedo` | `hooks/useUndoRedo.ts` | `() => { undo, redo, canUndo, canRedo }` | History state + revert functionality |
| `useViewportShortcuts` | `hooks/useViewportShortcuts.ts` | `() => void` | Keyboard shortcuts: G/D/X/L/P/F for toolbar, Ctrl+Z undo, Ctrl+K command palette |
| `useWorldToScreen` | `hooks/useWorldToScreen.ts` | `() => (worldPos, w, h) => ScreenPosition` | Projects THREE.Vector3 to screen coordinates with margin check |

### Hooks (`src/components/r3f/`)

| Hook | File | Signature | Description |
|------|------|-----------|-------------|
| `useDisposeOnUnmount` | `r3f/useDisposeOnUnmount.ts` | `() => void` | Disposes WebGL resources on component unmount |
| `useRegisterInvalidate` | `r3f/useRegisterInvalidate.ts` | `() => void` | Registers invalidate for demand frameloop |
| `useWebGLMemoryMonitor` | `r3f/useWebGLMemoryMonitor.ts` | `() => void` | Monitors WebGL memory usage |

### Hooks (`src/features/3d-lab/DevControlsModule/hooks/`)

| Hook | File | Signature | Description |
|------|------|-----------|-------------|
| `useKeyboardShortcuts` | `DevControlsModule/hooks/useKeyboardShortcuts.ts` | `() => void` | Keyboard shortcuts for DevControls |
| `usePanelState` | `DevControlsModule/hooks/usePanelState.ts` | `() => PanelState` | Panel collapse/expand state |

### Utilities

| Utility | File | Description |
|---------|------|-------------|
| `nbcpCalculator` | `utils/nbcpCalculator.ts` | NBCP FAR/BHL computation engine (with tests at `nbcpCalculator.test.ts`) |
| `registryLoader` | `utils/registryLoader.ts` | Dynamic category-scoped registry import with caching |

### Registry Helper Functions

**Source:** `src/features/3d-lab/config/registry/index.ts`

| Function | Signature | Description |
|----------|-----------|-------------|
| `getModuleById` | `(id: string) => ModuleRegistryEntry \| undefined` | Find module by ID |
| `getModulesByCategory` | `(categoryKey: CategoryKey) => ModuleRegistryEntry[]` | Filter by category |
| `getModulesByTemplate` | `(templateType: TemplateType) => ModuleRegistryEntry[]` | Filter by template type |
| `getModulesByPhase` | `(phase: 1 \| 2 \| 3) => ModuleRegistryEntry[]` | Filter by launch phase |

### Taxonomy Helper Functions

**Source:** `src/features/3d-lab/config/taxonomy.ts`

| Function | Signature | Description |
|----------|-----------|-------------|
| `getCategoryById` | `(id: string) => CategoryDef \| undefined` | Get category by 2-digit ID |
| `getCategoryKeyById` | `(id: string) => CategoryKey \| undefined` | Get category key by 2-digit ID |

---

## 16. Failure Handling

| Component | Loading | Error | Empty | WebGL Failure |
|-----------|---------|-------|-------|---------------|
| `ThreeDLabPage` | `loading.tsx` skeleton | `error.tsx` boundary | Locked state (no access) | -- |
| `ModuleViewer` | CircleNotch spinner + "Loading Module..." | Error message + "Return to Lab Browser" link | -- | -- |
| `LabViewport` | `LoadingSpinner` per template (via `next/dynamic`) | Falls through to `Workspace` fallback | -- | -- |
| `CanvasWrapper` | `CanvasLoadingOverlay` (visible until ready) | -- | -- | -- |
| `WebGLErrorBoundary` | -- | Retry UI: "3D Render Error" with retry button | -- | "3D Context Lost" with retry button; handles `webglcontextlost`/`webglcontextrestored` events |
| `SceneErrorBoundary` | -- | Template-level error boundary | -- | -- |
| `LabBrowser` | -- | -- | `LabEmptyState` (if no modules) | -- |
| `registryLoader` | -- | Returns `[]` on import failure | -- | -- |

### Missing Failure States (Identified Gaps)

- `DOMOverlayLayer`: No error boundary for overlay projection failures
- `LabViewportFrame`: No explicit offline state detection
- `ModuleContextCard`: No error state if module metadata is malformed
- Template scenes: Individual template scenes rely on `SceneErrorBoundary` but no per-template recovery

---

## 17. Accessibility

### Current Implementation

- **OrbitControls**: Touch support via `touch-action: none` on canvas container
- **DOMOverlayLayer**: `aria-live="polite"` on overlay container for screen reader announcements
- **Hotspot interactions**: Hotspot cards have `pointerEvents: 'auto'` enabling mouse/touch interaction
- **Loading states**: Text labels accompany spinner animations ("Initializing...", "Loading Module...")
- **Error states**: Clear text descriptions with retry buttons

### Gaps

- No keyboard navigation for 3D scene (orbit, zoom, pan are mouse/touch only)
- No keyboard shortcuts for template interactions (except DevControlsModule which has `useKeyboardShortcuts`)
- No ARIA labels on parametric sliders within the 3D context
- No reduced motion support for animated sequences
- Screen reader support limited to overlay text; 3D geometry has no semantic description
- No high-contrast mode for 3D scenes

---

## 18. Identity-Locked Components

The 3D Lab feature itself does **not** contain identity-locked components as defined in `.ai/rules/identity_preservation_lock.md`. The `SlideToSubmit` component (which is identity-locked) is not part of the 3D Lab -- it belongs to the quiz-v2 system.

However, the following 3D Lab components should be treated as **migration-sensitive** due to their hardcoded visual values:

| Component | Concern |
|-----------|---------|
| `SceneBase` | Hardcoded sky color `#F2F0EB`, ground color `#f1f5f9` |
| `StudioLighting` | Hardcoded light colors `#FFF5E6`, `#E6EFFF` |
| `LabViewportFrame` | Hardcoded background `bg-[#F8F7F5]` |
| `ModuleViewer` | Hardcoded background `bg-[#F8F7F5]` |
| `WebGLErrorBoundary` | Uses design system tokens correctly |

**Note:** The hardcoded hex values in SceneBase, StudioLighting, and LabViewportFrame are intentional -- they are 3D scene rendering values, not UI surface colors. They do not need to use CSS custom properties because they are passed to WebGL, not to the DOM.

---

## 19. Known Open Decisions & Technical Debt <!-- updated: 2026-04-10 -->

| Location | Description | Tag |
|----------|-------------|-----|
| `CategoryGrid.tsx:62` | `TODO: Re-enable phase locking before production launch` | DECISION: Phase-based access control disabled |
| `legacyLabStore.ts` | Legacy store with hardcoded NBCP defaults, not yet fully replaced by focused stores | TECH DEBT |
| `cat-17.ts`, `cat-18.ts` | Empty placeholder categories (Specialized Concrete, Topography & Landscape) | DECISION: Whether to populate or remove |
| `ModuleViewer.tsx:200` | `isBespoke` check hardcoded to `site-development-controls` only | TECH DEBT: Should be data-driven |
| `LabViewport.tsx:156-158` | Legacy scene routing hardcoded for `far-calculator`, `classical-orders` | TECH DEBT: Should be registered in module registry |
| `models_3d` table | Legacy DB table no longer actively used by frontend | TECH DEBT: Evaluate deprecation/removal |
| `ModuleViewer.tsx:78` | `config` typed as `any` | TECH DEBT: Should use discriminated union |
| `useLabStore.ts` | Combined facade re-subscribes to all 3 stores on every render | PERF: Consider memoization or selector optimization |
| `DASHBOARD_VISIBLE_IDS` | Only 4 of 209 modules visible | DECISION: Rollout strategy for remaining modules |
| `_stores/`, `_types/`, `_config/` | Shadow directories with re-exports -- duplicate navigation paths | TECH DEBT: Consolidate to single path |
| `LabModuleShell` | No longer used by any active rendering path -- all modules route through ViewportShell | TECH DEBT: Remove after confirming no external imports |
| `LabPanelLayout` | Competing layout system -- ViewportShell + ViewportSidebar is the replacement | TECH DEBT: Remove after confirming no external imports |
| Calculator template | Uses ViewportShell header but keeps own internal 3-column layout | DECISION: Full migration deferred -- complex per-toolType input panels |
| DevControlsModule panels | Uses ViewportShell header but keeps own 55+ file internal layout; now has `SharedToolbarBridge` + `CameraSnapBridge` for integration | DECISION: Full sidebar migration deferred -- high risk |
| Human scale toggle | Button in ViewportToolbar is a no-op placeholder | TODO: Wire to HumanSilhouette visibility |
| Bottom sheet gesture | Simple expand/collapse toggle implemented | NEEDS PRODUCT INPUT: Native iOS-style drag or keep toggle? |
| `crossSectionEnabled` | Previously not wired to template renderer | RESOLVED: Wired to ViewportToolbar toggle (2026-04-09) |
| `explodedViewEnabled` | Previously not wired to template renderer | RESOLVED: Wired to ViewportToolbar toggle (2026-04-09) |
| `stairway-constants-international.ts` | IBC 2024, ADA, IRC stairway constants | **UNVERIFIED**: Needs expert review before production use |
| `wall-constants-performance.ts` | Fire rating, STC, cost/sqm, R-value data | **UNVERIFIED**: Needs expert review before production use |
| `wall-constants-international.ts` | IBC, ASTM, EN wall standards | **UNVERIFIED**: Needs expert review before production use |
| `useCollaborationPresence` | Hook scaffolded but no server-side backing | SCAFFOLDED: Needs WebSocket or real-time backend |
| `useDragDrop` | Hook scaffolded but no upload endpoint | SCAFFOLDED: Needs API route for file uploads |
| `DevControlsModule/dashboard/ViewportToolbar.tsx` | Deleted — merged into shared `SceneToolbar` | RESOLVED: Removed (2026-04-10) |

### Coverage Gaps (Content, not Code)

| Gap Area | Notes |
|----------|-------|
| Environmental/Sustainability | No modules for green building, LEED, energy efficiency |
| Acoustics | No sound transmission, noise control modules |
| Interior Design | No interior finishes, furniture layout, color theory |
| Cost Engineering | Limited to basic quantity takeoff -- no cost estimation, scheduling |
| Geotechnical Engineering | Only `soil-profile-cutaway` -- no deep foundation, retaining walls |
| Advanced Structural | No prestressed concrete, steel detailing, connection design |
| MEP Coordination | No clash detection, combined services coordination |
| Landscape Architecture | Cat-18 (Topography & Landscape) is empty placeholder |
| Specialized Concrete | Cat-17 (Specialized Concrete) is empty placeholder |

---

## 20. Feature History & Evolution

### Git Timeline (3D Lab Commits)

| Date | Commit | Description |
|------|--------|-------------|
| 2026-04-10 | `cef69d3` | fix(3d-lab): add grid + axis gizmo to DevControls, add pin/unpin to LayersPanel |
| 2026-04-10 | `5d5499f` | feat(3d-lab): implement unified viewport UX — toolbars, camera nav, header, overlays |
| 2026-04-10 | `3a674ef` | feat(wall-configurator): implement v2 multi-file architecture with structural fidelity |
| 2026-04-09 | `3abdcb3` | feat(stairway-configurator): Phase 4 — wire 3D rendering + unit tests |
| 2026-04-09 | `9c4f8af` | feat(stairway-configurator): Phase 3 — L/U-shape geometry, egress calculator, children's safety, materials |
| 2026-04-09 | `9366fb2` | fix(3d-lab): move useTemplateContent before early returns in ModuleViewer |
| 2026-04-09 | `e671c28` | feat(stairway-configurator): Phase 2 features — nosing detail, comparison mode, handrail graspability |
| 2026-04-09 | `05ac37d` | feat(stairway-configurator): Phase 2 foundation — GeometryType unification, extruded-profile, camera hook, click-to-inspect |
| 2026-04-09 | `8236ff1` | fix(stairway-configurator): correct IRC handrail constant in international deltas |
| 2026-04-09 | `aaed8ad` | feat(stairway-configurator): add UI component shells + comfort gauge overlay |
| 2026-04-09 | `629c8ea` | feat(stairway-configurator): add Blondel comfort, historical annotations, uniformity sim |
| 2026-04-09 | `6b41d77` | feat(stairway-configurator): refactor geometry builder + add violation presets |
| 2026-04-09 | `9239d4e` | feat(stairway-configurator): add types, constants, and computation engine |
| 2026-04-09 | `69166909` | fix(3d-lab): resolve architect review — hooks ordering + full shell coverage |
| 2026-04-09 | `56ab427` | feat(3d-lab): migrate DevControlsModule to ViewportShell header (Phase 5) |
| 2026-04-09 | `087a096` | feat(3d-lab): migrate WallConfigurator to ViewportShell (Phase 4) |
| 2026-04-09 | `b815d39` | feat(3d-lab): migrate FloorPlan and AnimatedSequence to ViewportShell (Phase 3) |
| 2026-04-09 | `786b6d0` | feat(3d-lab): migrate Exploded and Cutaway templates to ViewportShell (Phase 2B) |
| 2026-04-09 | `8139ef7` | feat(3d-lab): migrate ParametricScene to ViewportShell (Phase 2) |
| 2026-04-09 | `0895408` | feat(3d-lab): add Unified Viewport Shell foundation (Phase 1) |
| 2026-04-08 | `31ac84f` | refactor: global ALE -> LEA terminology migration |
| 2026-04-08 | `33b420b` | feat: complete Wave 4 -- egress sim + batch verifier |
| 2026-04-07 | `15b488e` | refactor: migrate Cat 01 + Cat 03 to shared constants |
| 2026-04-07 | `68c5a1f` | feat: add LegalCitation type, shared constants, audit script |
| 2026-04-07 | `ec07ede` | feat: complete Wave 4 -- 5 new modules |
| 2026-04-06 | `b10b728` | feat: complete Wave 2+3 -- 7 new modules, 13 verified |
| 2026-04-06 | `205e8f2` | feat: complete Wave 1 -- verify 11 modules, build 2 new |
| 2026-04-06 | `257eafa` | fix: repair 3 broken modules |
| 2026-04-06 | `c3b63ab` | feat: add asset preloading and loading progress (P6) |
| 2026-04-06 | `011887d` | feat: add animation completion detection (P7) |
| 2026-04-06 | `2ecf755` | refactor: normalize templates with error boundaries (P9) |
| 2026-04-06 | `c84a249` | refactor: add focused stores and lifecycle hook (P5) |
| 2026-04-06 | `9ee93d9` | refactor: split useLabStore and add lifecycle management (P5) |
| 2026-04-06 | `77560de` | feat: implement 2D DOM overlay system (P3) |
| 2026-04-06 | `83f7b23` | feat: add WebGL error boundary and disposal lifecycle (P2) |
| 2026-04-06 | `14b1053` | refactor: add configurable lighting presets (P4) |
| 2026-04-06 | `acb46ef` | refactor: extract SceneConfig from CanvasWrapper (P1) |
| Earlier | Various | Design system cleanup, Storybook init, wall configurator, calculator system |
| Earlier | `1354bc7` | feat: implement unified 3D wall configurator engine |
| Earlier | `339efef` | feat: simplify dashboard to show only 2 active modules |

### Evolution Summary

1. **Initial Build:** Legacy GLTF viewer with `Workspace` component and `models_3d` DB table. Modules were database-driven with external GLB assets.

2. **Template Architecture (P1-P9):** Major architecture refactor spanning 9 phases:
   - P1: SceneConfig extraction from CanvasWrapper, PerformanceMonitor
   - P2: WebGL error boundary and disposal lifecycle
   - P3: 2D DOM overlay system (replaced in-canvas Html)
   - P4: Configurable lighting presets (StudioLighting)
   - P5: Store splitting (useLabStore -> 3 focused stores + lifecycle hook)
   - P6: Asset preloading and loading progress
   - P7: Animation completion detection for demand frameloop
   - P9: Template normalization with error boundaries

3. **Module Content Buildout (Waves 1-4):** Rapid expansion from ~50 to 209 modules:
   - Wave 1: Verify 11 existing modules, build 2 new
   - Wave 2+3: 7 new modules, 13 verified
   - Wave 4: 5 new modules (egress simulation, batch compliance verifier)

4. **Regulatory Track:** LegalCitation type system, shared constants (PD 1096, BP 344, RA 9514, NSCP), audit infrastructure

5. **Terminology Migration:** ALE -> LEA naming standardization across entire codebase (2026-04-08)

6. **Unified Viewport Shell (Phase 1-5):** Slot-based layout system replacing per-template containers:
   - Phase 1: Shell foundation (ViewportShell, ViewportSidebar, ViewportHeader, ViewportToolbar)
   - Phase 2: ParametricScene migration
   - Phase 2B: Exploded + Cutaway migration
   - Phase 3: FloorPlan + AnimatedSequence migration
   - Phase 4: WallConfigurator migration
   - Phase 5: DevControlsModule header migration (internal layout kept)

7. **Stairway Configurator (Phases 1-4):** Complete multi-phase build:
   - Phase 1: Types, constants, computation engine (2026-04-09)
   - Phase 2: GeometryType unification (`extruded-profile`), nosing, comparison mode, handrail graspability
   - Phase 3: L/U-shape geometry, egress calculator, children's safety, materials
   - Phase 4: Wire 3D rendering + unit tests — DASHBOARD ACTIVE

8. **Wall Configurator v2:** Complete multi-file architecture rewrite (2026-04-10):
   - 19 wall-*.ts support files with per-core-type geometry builders
   - Instanced geometry for masonry patterns
   - Performance dashboard (fire/STC/cost/R-value)
   - 5 view modes (overview, section-cut, exploded, build-sequence, compare)

9. **Viewport UX Expansion (2026-04-10):** 13 new shell components:
   - SceneToolbar (6-button floating toolbar with keyboard shortcuts)
   - CameraNavigationBar (17-button grouped nav with 15 presets)
   - CommandPalette (Ctrl+K search), ViewportContextMenu (right-click)
   - SceneGround (GridHelper + GizmoHelper), LayersPanel (pin/unpin)
   - GuidedTour, FirstTimeTooltip, CompassRose, KpiBar
   - WebGLRecovery, ViewportToast, ViewportSkeleton

10. **Current State:** 209 modules defined across 16 categories, 4 visible on dashboard, 7 template types, 12 Zustand stores, 14 hooks, 26 shell components, procedural geometry pipeline with `extruded-profile` and `instanced` geometry types, config-driven architecture fully operational.

---

*End of specification. This document was generated from exhaustive codebase traversal. All file paths, type definitions, and counts are verified against source code as of 2026-04-10.*
