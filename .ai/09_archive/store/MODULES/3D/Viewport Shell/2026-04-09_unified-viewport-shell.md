# Unified Viewport Shell — Implementation Plan

**Created:** 2026-04-09
**Status:** APPROVED — Ready for implementation
**Prompt Source:** `.ai/prompts/2026-04-09_unified-viewport-shell-prompt.json`
**Target Spec:** `.ai/docs/01-product/008-3d-lab-feature-specification.md` (Section 12A)

---

## 1. Codebase Audit — Per-Template Layout Assembly (PHASE_1)

### 1.1 Parametric Template (~100 modules)

**File:** `src/features/3d-lab/templates/ParametricScene.tsx`
**Container:** `LabPanelLayout` (CSS grid)

| Slot | Component | Width | Collapse |
|------|-----------|-------|----------|
| Left | `GenericControlPanel` (embedded) | 240px | `PanelCollapseHandle` via `LabPanelLayout` |
| Right | `ComplianceReportPanel` (embedded, conditional on multi-law violations) | 280px | `PanelCollapseHandle` via `LabPanelLayout` |
| Viewport Controls | None | — | — |
| Mobile | GenericControlPanel has `max-sm:` bottom sheet styling. ComplianceReportPanel: `max-md:hidden` | — | — |

### 1.2 Exploded Assembly (~30 modules)

**File:** `src/features/3d-lab/templates/ExplodedAssembly.tsx`
**Container:** No shared container — custom absolute positioning

| Slot | Component | Width | Collapse |
|------|-----------|-------|----------|
| Left | None | — | — |
| Right | Custom `motion.div` info panel (AnimatePresence) | w-64, absolute top-4 right-4 | Close (X) button |
| Viewport Controls | Explode slider (bottom center, 0-100%) | — | — |
| Mobile | No specific handling | — | — |

### 1.3 Cutaway Section (~40 modules)

**File:** `src/features/3d-lab/templates/CutawaySection.tsx`
**Container:** No shared container — custom absolute positioning

| Slot | Component | Width | Collapse |
|------|-----------|-------|----------|
| Left | None | — | — |
| Right | Custom annotation panel (layer list with color swatches) | w-64, absolute right-4 top-4 | None |
| Viewport Controls | Cut depth slider (bottom-left) | — | — |
| Mobile | No specific handling | — | — |

### 1.4 Floor Plan Walkthrough (~25 modules)

**File:** `src/features/3d-lab/templates/FloorPlanWalkthrough.tsx`
**Container:** Uses `GenericControlPanel` directly (not LabPanelLayout)

| Slot | Component | Width | Collapse |
|------|-----------|-------|----------|
| Left | `GenericControlPanel` (240px) | 240px | Reset button only |
| Right | Legend overlay (absolute right-4 top-4) | — | — |
| Viewport Controls | ViolationBar (bottom center, red alert) | — | — |
| Mobile | GenericControlPanel moves to `bottom-0 max-h-[50vh] rounded-t-lg` on `max-sm:` | — | — |

### 1.5 Animated Sequence (~12 modules)

**File:** `src/features/3d-lab/templates/AnimatedSequence.tsx`
**Container:** No shared container — custom absolute positioning

| Slot | Component | Width | Collapse |
|------|-----------|-------|----------|
| Left | None | — | — |
| Right | Step info panel (absolute top-4 right-4, w-64) | w-64 | None |
| Viewport Controls | Timeline bar (bottom center): play/pause, step nav, slider | — | — |
| Mobile | No specific handling | — | — |

### 1.6 Calculator Template (4 modules)

**File:** `src/features/3d-lab/templates/CalculatorTemplate.tsx`
**Container:** Custom 3-column grid (320px + 1fr + 340px)

| Slot | Component | Width | Collapse |
|------|-----------|-------|----------|
| Left | CHB/Drywall/Flooring/PaintInputPanel (per toolType) | 320px on lg | Accordion collapse on mobile |
| Right | ResultRow + AssumptionsAccordion + ExportActions | 340px on lg | — |
| Viewport Controls | FloatingCameraBar (perspective, isometric, plan presets), Net/Buy toggle | — | — |
| Mobile | Single column stack; input panel as accordion | — | — |

### 1.7 Wall Configurator (1 module)

**File:** `src/features/3d-lab/templates/WallConfiguratorTemplate.tsx`
**Container:** `LabPanelLayout` (CSS grid)

| Slot | Component | Width | Collapse |
|------|-----------|-------|----------|
| Left | `ConfigPanel` (5-step wizard) | 320px | `PanelCollapseHandle` via `LabPanelLayout` |
| Right | `BOMPanel` (bill of materials) | 340px | `PanelCollapseHandle` via `LabPanelLayout` |
| Viewport Controls | None | — | — |
| Mobile | Both panels hidden (`max-md:hidden` in LabPanelLayout) | — | — |

### 1.8 DevControlsModule (bespoke, 55+ files)

**File:** `src/features/3d-lab/DevControlsModule/dashboard/DevControlsLabV2.tsx`
**Container:** Custom CSS Grid (5 columns: left + handle + 1fr + handle + right)

| Slot | Component | Width | Collapse |
|------|-----------|-------|----------|
| Left | `InputPanel` (3-tab: lot/building/settings) | 480px | `PanelCollapseHandle` + `usePanelState` (localStorage persisted) |
| Right | `OutputPanel` (priority-ordered CollapsibleSections) | 300px | `PanelCollapseHandle` + `usePanelState` |
| Viewport Controls | `ViewportToolbar`, `KpiBar`, `ViolationBanner`, `CameraPresetBar` | — | — |
| Mobile | Complete layout swap: grid hidden, flex shown + `BottomSheet` with `MobileSheetContent` | — | — |

---

## 2. Divergence Summary

### Panel/Container Components in Use (7+)

| # | Component | Used By | Type |
|---|-----------|---------|------|
| 1 | `LabPanelLayout` | Parametric, WallConfigurator | CSS grid with collapse handles |
| 2 | `GenericControlPanel` | Parametric (embedded), FloorPlan | Sidebar with sliders, grouped params |
| 3 | `ComplianceReportPanel` | Parametric (embedded) | Multi-law compliance cards |
| 4 | Custom absolute panels | Exploded, Cutaway, Animated | Per-template `motion.div` / `div` |
| 5 | `DevControlsLabV2` grid | DevControlsModule | 5-column CSS grid |
| 6 | Calculator 3-column grid | CalculatorTemplate | Custom grid layout |
| 7 | `ConfigPanel` / `BOMPanel` | WallConfigurator | Wizard + BOM containers |
| 8 | `ControlPanel` | Legacy templates | Floating overlay (absolute) |
| 9 | `InfoPanel` | Hotspot-triggered | Centered bottom overlay (Framer Motion) |
| 10 | `LabMetaPanel` | Misc | Glassmorphism card wrapper |

### Collapse/Minimize Implementations (5)

| # | Mechanism | Used By |
|---|-----------|---------|
| 1 | `PanelCollapseHandle` in `LabPanelLayout` grid | Parametric, WallConfigurator |
| 2 | `PanelCollapseHandle` + `usePanelState` + grid-template-columns animation | DevControlsModule |
| 3 | Close (X) button | ExplodedAssembly |
| 4 | No collapse at all | CutawaySection, AnimatedSequence |
| 5 | Accordion collapse on mobile | CalculatorTemplate |

### Controls Only in DevControlsModule

- `CameraPresetBar` / `ViewportToolbar`
- `KpiBar` (key performance indicators)
- `ViolationBanner`
- `TourOverlay`

### Controls Only in CalculatorTemplate

- `FloatingCameraBar` (perspective, isometric, plan presets)

### Controls Scaffolded but Unwired

| Store Field | Location | Status |
|-------------|----------|--------|
| `crossSectionEnabled` | `useLabViewStore` | No UI toggle, no clipping plane implementation |
| `explodedViewEnabled` | `useLabViewStore` | No UI toggle; ExplodedAssembly has its own separate slider |
| `resetCamera` | `useLabViewStore` action | No button in any standard template |
| `showHumanScale` | Config field on some modules | No universal toggle UI |

### Controls Missing Entirely

- View mode switcher (perspective/orthographic/isometric) — except Calculator's FloatingCameraBar
- Universal camera presets across all templates
- Cross-section clipping plane (THREE.Plane)
- Human scale toggle
- Screenshot/export

---

## 3. Architecture Decision — Unified Viewport Shell

### Principles

1. **Slot-based composition** — Shell provides containers, templates provide content only
2. **Config-driven layout** — Modules declare slots + capabilities via `ViewportShellConfig` + `ViewportCapabilities`
3. **Single source of chrome** — ONE `ViewportSidebar`, ONE `PanelCollapseButton`, ONE `ViewportToolbar`
4. **Convention over configuration** — Template-type defaults; modules override only when needed
5. **DOM-rendered chrome** — All shell UI outside R3F Canvas (zero WebGL cost)

### Decision Drivers

1. **Maintenance cost** — 7+ panel implementations means 7x the bugs, 7x the styling drift
2. **UX consistency** — Users see different collapse buttons, different panel styling per module
3. **Mobile gap** — Only DevControlsModule and FloorPlan have proper mobile layouts; 5 templates have none

### Key Architectural Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Shell position in hierarchy | Replaces `LabModuleShell` | Shell must own the grid layout to control all containers |
| Grid vs. Flexbox | CSS Grid (DevControls pattern) | DevControls proved grid prevents R3F canvas overflow; 1fr viewport absorbs space correctly |
| Panel collapse animation | `grid-template-columns` transition (200ms) | DevControls proved this is smooth; pure CSS, no React re-renders of Canvas |
| State management | New `useViewportShellStore` for UI state; keep `useLabViewStore` for scene toggles | Separation of concerns: sidebar collapsed = UI-only (no invalidate); crossSection = scene-affecting (invalidate) |
| Toolbar position | DOM overlay (bottom-center of canvas area) | Zero WebGL cost; accessible; consistent with DevControls' ViewportToolbar |
| Mobile strategy | Bottom sheet with tabs (DevControls pattern) | Proven pattern; sidebars become tabs; drag handle for resize |
| Camera presets | Extract from `camera-presets.ts` (already 5 presets) | Reuse existing config; add animated transitions via OrbitControls |

---

## 4. New TypeScript Interfaces

### ViewportShellConfig (layout slots)

```typescript
interface ViewportShellConfig {
  leftSidebar?: boolean | {
    defaultCollapsed?: boolean
    width?: number  // default: 280
    title?: string
    mobileTabLabel?: string  // default: 'Info'
  }
  rightSidebar?: boolean | {
    defaultCollapsed?: boolean
    width?: number  // default: 320
    title?: string
    mobileTabLabel?: string  // default: 'Controls'
  }
  statusBar?: boolean
  mobileBottomSheetTabs?: string[]  // auto-derived from sidebars if omitted
}
```

### ViewportCapabilities (toolbar controls)

```typescript
interface ViewportCapabilities {
  cameraPresets?: boolean | CameraPreset[]  // true = use default 5 presets
  viewModes?: Array<'perspective' | 'orthographic' | 'isometric' | 'top-down'>
  crossSection?: boolean | { axis: 'x' | 'y' | 'z'; range: [number, number] }
  explodedView?: boolean
  humanScale?: boolean
  focusMode?: boolean
  resetCamera?: boolean  // default: true
  measurementTool?: boolean  // future
}
```

### ViewportShellContent (what templates return)

```typescript
interface ViewportShellContent {
  leftSidebarContent?: ReactNode
  rightSidebarContent?: ReactNode
  canvasContent: ReactNode  // R3F scene — always required
  statusBarContent?: ReactNode
  toolbarExtras?: ReactNode  // template-specific toolbar additions
}
```

### Default Layout Matrix

| Template | Left Sidebar | Right Sidebar | Toolbar | View Modes | Status Bar |
|----------|-------------|---------------|---------|------------|------------|
| `parametric` | No | Yes (320px) — sliders | Camera + reset | perspective, isometric | Yes (violations) |
| `exploded` | No | Yes (280px) — parts legend | Camera + explode toggle | perspective, isometric | No |
| `cutaway` | No | Yes (280px) — layers | Camera + cross-section | perspective, isometric | No |
| `floorplan` | No | Yes (280px) — room info | Camera presets | top-down, perspective | Yes (egress) |
| `animated` | No | Yes (280px) — step controls | Camera + play controls | perspective, isometric | No |
| `calculator` | Yes (320px) — inputs | Yes (340px) — results | Camera (minimal) | orthographic, perspective | Yes (BOM) |
| `wall-configurator` | Yes (320px) — wizard | Yes (340px) — BOM | Camera + reset | perspective, isometric | Yes (area) |

---

## 5. New Component Architecture

### Component Tree

```
ViewportShell (REPLACES LabModuleShell)
├── ViewportHeader (ABSORBS LabTopBar)
│   ├── Back button
│   ├── Module title + code reference
│   └── Quick actions (focus mode, settings)
├── CSS Grid Layout (DevControls pattern: left + handle + 1fr + handle + right)
│   ├── ViewportSidebar[side="left"] (if config.leftSidebar)
│   │   ├── Panel header + title
│   │   ├── {leftSidebarContent} ← template injects here
│   │   └── PanelCollapseButton (built-in)
│   ├── PanelCollapseHandle[side="left"]
│   ├── Viewport Area (1fr)
│   │   ├── LabViewportFrame (Canvas — UNCHANGED)
│   │   ├── ViewportToolbar (floating, bottom-center)
│   │   │   ├── Group 1: View Modes
│   │   │   ├── Group 2: Camera Presets
│   │   │   ├── Group 3: Scene Toggles (cross-section, explode, human scale)
│   │   │   └── Group 4: Actions (reset camera, focus mode)
│   │   └── ViewportStatusBar (optional, bottom)
│   ├── PanelCollapseHandle[side="right"]
│   └── ViewportSidebar[side="right"] (if config.rightSidebar)
│       ├── Panel header + title
│       ├── {rightSidebarContent} ← template injects here
│       └── PanelCollapseButton (built-in)
└── ViewportBottomSheet (mobile only, replaces both sidebars)
    ├── Tab bar (derived from sidebar configs)
    └── Tab content (sidebar content, one per tab)
```

### New Files

| File | Replaces/Absorbs |
|------|-----------------|
| `src/features/3d-lab/components/shell/ViewportShell.tsx` | `LabModuleShell` |
| `src/features/3d-lab/components/shell/ViewportHeader.tsx` | Part of `LabTopBar` |
| `src/features/3d-lab/components/shell/ViewportSidebar.tsx` | `LabPanelLayout` panels, all custom panel containers |
| `src/features/3d-lab/components/shell/ViewportToolbar.tsx` | DevControls' `ViewportToolbar` + Calculator's `FloatingCameraBar` |
| `src/features/3d-lab/components/shell/ViewportBottomSheet.tsx` | DevControls' `BottomSheet` + `MobileSheetContent` |
| `src/features/3d-lab/components/shell/ViewportStatusBar.tsx` | Compliance summary, area bars |
| `src/features/3d-lab/components/shell/PanelCollapseButton.tsx` | All divergent collapse buttons |
| `src/features/3d-lab/stores/useViewportShellStore.ts` | DevControls' `usePanelState` (eventually) |

### New Store: useViewportShellStore

```typescript
interface ViewportShellState {
  // Sidebar state
  leftSidebarCollapsed: boolean
  rightSidebarCollapsed: boolean

  // View mode
  activeViewMode: 'perspective' | 'orthographic' | 'isometric' | 'top-down'

  // Camera
  activeCameraPreset: string | null  // null = free orbit

  // Mobile
  mobileActiveTab: string
  bottomSheetHeight: number  // percentage 30-70

  // Actions (UI-only — do NOT call invalidate)
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  setMobileTab: (tab: string) => void
  setBottomSheetHeight: (pct: number) => void

  // Actions (scene-affecting — MUST call invalidate)
  setViewMode: (mode: ViewportShellState['activeViewMode']) => void
  setCameraPreset: (presetId: string | null) => void

  // Reset
  reset: () => void
}
```

---

## 6. Migration Path (5 Phases)

### Phase 1 — Shell Foundation (LOW RISK)

**Goal:** Build ViewportShell + ViewportSidebar + PanelCollapseButton + ViewportToolbar (reset only).
**Scope:** Ship to 4 DASHBOARD_VISIBLE modules only. Feature-flagged opt-in.

**New files to create:**
- `components/shell/ViewportShell.tsx`
- `components/shell/ViewportSidebar.tsx`
- `components/shell/ViewportToolbar.tsx`
- `components/shell/ViewportBottomSheet.tsx`
- `components/shell/ViewportStatusBar.tsx`
- `components/shell/ViewportHeader.tsx`
- `components/shell/PanelCollapseButton.tsx`
- `stores/useViewportShellStore.ts`

**Files to modify:**
- `types/templates.ts` — add `ViewportShellConfig` + `ViewportCapabilities`
- `components/ModuleViewer.tsx` — conditionally use ViewportShell
- `components/LabViewport.tsx` — templates return `ViewportShellContent`

**Estimated LOC:** ~800 new, ~100 modified
**Rollback:** Feature flag off → falls back to `LabModuleShell`

### Phase 2 — Standard Template Migration (MEDIUM RISK)

**Goal:** Migrate ParametricScene, ExplodedAssembly, CutawaySection to shell slots.
**Scope:** Replace GenericControlPanel containers, add camera presets + view modes.

**Files to modify:**
- `templates/ParametricScene.tsx` — return ViewportShellContent instead of LabPanelLayout
- `templates/ExplodedAssembly.tsx` — move info panel to right sidebar slot
- `templates/CutawaySection.tsx` — move annotation panel to right sidebar slot
- Wire `crossSectionEnabled` → THREE.Plane clipping in CutawaySection

**Files deprecated after this phase:**
- `LabModuleShell` (replaced by ViewportShell)
- `LabPanelLayout` (replaced by ViewportSidebar)
- `FocusModeToggle` (merged into ViewportToolbar)

**Estimated LOC:** ~300 modified
**Rollback:** Revert template files; ViewportShell still works with remaining templates via fallback

### Phase 3 — Remaining Templates (MEDIUM RISK)

**Goal:** Migrate FloorPlan, AnimatedSequence, CalculatorTemplate.
**Scope:** Add human scale toggle, wire explodedViewEnabled.

**Files to modify:**
- `templates/FloorPlanWalkthrough.tsx`
- `templates/AnimatedSequence.tsx`
- `templates/CalculatorTemplate.tsx`

**Estimated LOC:** ~250 modified

### Phase 4 — WallConfigurator Migration (MEDIUM RISK)

**Goal:** Move ConfigPanel and BOMPanel content into ViewportSidebar slots.
**Scope:** 5-step wizard becomes right sidebar content. BOM becomes left sidebar or status bar.

**Files to modify:**
- `templates/WallConfiguratorTemplate.tsx`
- `components/templates/WallConfigurator/ConfigPanel.tsx` — becomes slot content only
- `components/templates/WallConfigurator/BOMPanel.tsx` — becomes slot content only

**Estimated LOC:** ~150 modified

### Phase 5 — DevControlsModule Migration (HIGH RISK)

**Goal:** Extract dashboard panels into shell sidebar slots. Deprecate usePanelState.
**Scope:** Extract CameraPresetBar into shared ViewportToolbar. InputPanel/OutputPanel become slot content.

**Files to modify:**
- `DevControlsModule/dashboard/DevControlsLabV2.tsx` — replace with ViewportShell
- `DevControlsModule/dashboard/InputPanel.tsx` — becomes left sidebar content
- `DevControlsModule/dashboard/OutputPanel.tsx` — becomes right sidebar content
- `DevControlsModule/dashboard/ViewportWrapper.tsx` — ViewportToolbar/KpiBar merge into shell
- `DevControlsModule/hooks/usePanelState.ts` — deprecated, replaced by useViewportShellStore

**Estimated LOC:** ~400 modified
**Risk:** 55+ file module with complex interactions. Requires thorough testing.
**Rollback:** Feature flag per module

### Excluded from Migration

Legacy bespoke scenes (`FARPlayground`, `ClassicalOrders`, `NBCPEnvelope`) keep their existing layout. They route through LabViewport before the template system and don't use LabPanelLayout.

---

## 7. Component Deprecation Plan

| Component | Replaced By | Remove After |
|-----------|-------------|-------------|
| `LabModuleShell` | `ViewportShell` | Phase 2 |
| `LabPanelLayout` | `ViewportSidebar` (x2) + grid in `ViewportShell` | Phase 2 |
| `GenericControlPanel` container | `ViewportSidebar` + slot content | Phase 2 (content preserved) |
| `ComplianceReportPanel` container | `ViewportSidebar` or `ViewportStatusBar` | Phase 2 (content preserved) |
| `ControlPanel` | `ViewportSidebar` + slot content | Phase 2 |
| `InfoPanel` | `ViewportSidebar` + slot content | Phase 2 |
| `LabMetaPanel` | `ViewportSidebar` (left) | Phase 2 |
| `FocusModeToggle` | `ViewportToolbar` button | Phase 2 |
| `PanelCollapseHandle` | `PanelCollapseButton` (built into ViewportSidebar) | Phase 2 |
| DevControls `dashboard/` panels | `ViewportSidebar` slots | Phase 5 (content preserved) |
| `usePanelState` hook | `useViewportShellStore` | Phase 5 |

**Process:** Mark `@deprecated` JSDoc → add `console.warn` in dev → remove after all consumers migrate.

---

## 8. Performance Contract

| Metric | Target |
|--------|--------|
| Toolbar render | < 2ms paint time |
| Sidebar collapse animation | 200ms CSS transition, 0 JS frames |
| Shell total DOM nodes | < 80 |
| Shell JS bundle | < 15KB gzipped |
| Continuous useFrame loops from shell | Zero (only during animated camera transitions) |
| Mobile bottom sheet drag | 60fps (CSS transform) |
| Scene-affecting controls | MUST call `invalidate()` |
| UI-only controls (sidebar collapse, tab switch) | MUST NOT call `invalidate()` |

---

## 9. Open Questions (Needs Product Input)

- [ ] Bottom sheet drag gesture: native-feel (iOS-style) or simple expand/collapse toggle?
- [ ] Cross-section cut surface fill: colored fills on cut surface or transparent?
- [ ] Should BOM panel in WallConfigurator be left sidebar or status bar?
- [ ] CAGE integration for in-canvas quiz — flag only, don't assume

---

## 10. Acceptance Criteria

1. [ ] ALL 7 template types use `ViewportShell` — zero direct sidebar/panel container creation
2. [ ] ONE `PanelCollapseButton` component used everywhere — `grep` for old panel imports returns 0
3. [ ] `ViewportToolbar` appears in ALL modules with config-driven controls
4. [ ] `crossSectionEnabled` wired to THREE.Plane clipping with UI toggle
5. [ ] `explodedViewEnabled` wired to UI toggle in exploded template
6. [ ] Camera presets (5) available in all modules via toolbar
7. [ ] Mobile: sidebars collapse to bottom sheet tabs on < 768px
8. [ ] DevControlsModule uses ViewportShell (Phase 5)
9. [ ] Zero Three.js scene objects added by shell
10. [ ] Shell JS bundle < 15KB gzipped
