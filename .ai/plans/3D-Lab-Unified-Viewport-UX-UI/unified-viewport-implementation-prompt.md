# UNIFIED VIEWPORT UX IMPLEMENTATION PROMPT
**For:** Ralph Loop (Codebase AI)
**Source plan:** `unified-viewport-ux-audit-and-implementation-plan.md` v3.0
**Operation:** CREATE spec + EXECUTE implementation across Phases 0–10
**Nothing deferred.**

---

## BLOCK 0 — DOC LIFECYCLE PROTOCOL

Execute before anything else.

### PHASE 0: DISCOVER
Scan:
- `.ai/docs/01-product/` — any file matching `3d-lab`, `viewport`, `shell`, `toolbar`
- `.ai/docs/02-architecture/` — shell layout docs, store schemas, R3F patterns
- `.ai/docs/03-design/` — design token docs, glass morphism patterns, CSS variable registry

Output:
```
<doc_discovery>
  spec_file: [path or NONE FOUND]
  architecture_refs: [list]
  design_refs: [list]
  state_files_read: [.ai/state/current-task.md, .ai/state/memory.md]
</doc_discovery>
```

HALT if a found spec contradicts Phase 0 tasks. Surface the conflict before proceeding.

### PHASE 1: READ & BASELINE
Read `.ai/state/current-task.md` and `.ai/state/memory.md`. If a spec exists, read it fully and produce:
```
<spec_baseline>
  file: [path]
  existing_sections: [list of H2s]
  key_decisions_already_made: [list]
  known_gaps: [⚠️ flags]
</spec_baseline>
```

If no spec exists, note it — PHASE 2 creates it at `.ai/docs/01-product/###-3d-lab-viewport-shell-specification.md`.

---

## BLOCK 1 — SYSTEM CONTEXT

You are executing against the SlateCamp 3D Lab — a React Three Fiber educational visualization system built on Next.js 14 App Router, Zustand, Tailwind CSS, and Shadcn UI. The `.ai/docs` folder is the single source of truth. Read before writing. Write back after executing. No filler.

---

## BLOCK 2 — OBJECTIVE

Implement the complete Unified Viewport UX plan (v3.0) across all ten phases. Output is:
1. A created/updated spec at `.ai/docs/01-product/###-3d-lab-viewport-shell-specification.md`
2. All implementation artifacts described per phase
3. Updated state files

This is a full CREATE + EXECUTE operation. Nothing is deferred. Every phase has acceptance criteria — meet them all.

---

## BLOCK 3 — IMPLEMENTATION PIPELINE

Execute phases in strict order. Do not begin a phase until the prior phase's acceptance criteria pass `bun run type-check`.

---

### PHASE 0A — Camera Controls + Scene Toolbar (SHIP FIRST — Immediate)

**Priority:** Highest. These two bars must exist in EVERY 3D module unconditionally. This is the #1 user-visible fix.

**What to build:**

**Task 0.1 — `SceneToolbar.tsx`**
- Path: `src/features/3d-lab/components/shell/SceneToolbar.tsx`
- Absolute position: `top-4 left-4 z-20`
- 6 buttons: Grid (G), Dimensions (D), X-ray (X), Layers (L), Screenshot (P), Fullscreen (F)
- Styling: `bg-[var(--viewport-overlay-bg)] backdrop-blur-sm rounded-lg p-1`
- Toggle buttons (Grid/Dims/X-ray/Layers): persist active state with filled icon variant
- Action buttons (Screenshot/Fullscreen): 200ms flash on click, never stay highlighted
- Tooltip per button: label + shortcut key, 400ms hover delay
- Disabled state: 40% opacity
- Error handling: if Screenshot/Fullscreen fails (browser block, iframe deny), show warning toast — never fail silently
- Icons (Lucide): `Grid3x3`, `Ruler`, `Eye`, `Layers`, `Camera`, `Maximize2`

**Task 0.2 — `useViewportShellStore` additions**
Add to the existing store:
- `gridVisible: boolean` (default: false)
- `dimensionsVisible: boolean` (default: false)
- `xrayMode: boolean` (default: false)
- `layersPanelOpen: boolean` (default: false)
- Toggle actions for each

**Task 0.3 — `CameraNavigationBar.tsx`**
- Path: `src/features/3d-lab/components/shell/CameraNavigationBar.tsx`
- Absolute position: `bottom-3 left-1/2 -translate-x-1/2 z-20`
- 6 buttons: Orbit (always active/highlighted), Front (1), Top (2), Iso (3), Zoom-to-Fit (Z/Home), Reset (R)
- No separate Pan button — pan via middle-click/two-finger (industry standard)
- Orbit button: persistent `bg-[var(--viewport-overlay-active)] text-white` — it is always the active mode
- Camera snap buttons (Front/Top/Iso/Zoom-to-Fit): 200ms flash on click, one-shot actions
- Styling: same glass morphism as SceneToolbar
- Icons (Lucide): `Rotate3d`, `PanelTop`, `CircleDot`, `Box`, `Focus`, `RotateCcw`

**Task 0.4 — Camera state in store**
Add:
- `snapToPreset: (preset: 'front' | 'top' | 'iso' | 'zoom-to-fit' | 'reset') => void`
- Executes 600ms ease-out camera animation, then invalidates scene

**Task 0.5 — Wire camera snapping**
- Animate camera to preset position using OrbitControls
- Disable user input during 600ms snap animation
- `zoomToCursor: true`, `enableDamping: true`, `dampingFactor: 0.08`
- `minPolarAngle: 0.1`, `maxPolarAngle: Math.PI / 2 - 0.05`
- Touch: `ONE: THREE.TOUCH.ROTATE`, `TWO: THREE.TOUCH.DOLLY_PAN`

**Task 0.6 — Mount both in `ViewportShell.tsx`**
```tsx
{/* ALWAYS visible — no config gate, no opt-in */}
<SceneToolbar />
<CameraNavigationBar />
```
These render for ALL modules. Unconditional.

**Task 0.7 — CSS variables in `globals.css`**
```css
--viewport-overlay-bg: oklch(0% 0 0 / 0.6);
--viewport-overlay-text: oklch(100% 0 0 / 0.7);
--viewport-overlay-active: oklch(100% 0 0 / 0.2);
```

**Task 0.8 — `SceneGround.tsx`**
- Path: `src/features/3d-lab/components/shell/SceneGround.tsx`
- drei `<Grid>` on XZ plane, 20m × 20m, fading edges, always ON by default
- Major lines (1m): `var(--viewport-overlay-text)` at 10% opacity
- Minor lines (0.25m): 5% opacity, only when zoomed in
- Grid toggled off by `gridVisible` state (for clean screenshots)
- Axis gizmo (bottom-right): 48×48px, XYZ colored axes, non-interactive. Use drei `<GizmoHelper>` + `<GizmoViewport>`
- Sky gradient background: top `oklch(0.95 0.01 240)` → bottom `oklch(0.97 0.005 80)`

**Task 0.9 — Per-module default camera**
Extend `ViewportCapabilities` with:
```typescript
defaultCamera?: {
  position: [number, number, number]
  target: [number, number, number]
  fov?: number
}
```
Reset button snaps to this value. Fall back to a global default if not declared.

**Task 0.10 — Accessibility baseline**
- All toolbar buttons: `aria-label` with full label + shortcut
- `prefers-reduced-motion`: disable 600ms snap animation, use instant cut instead
- WCAG 1.4.1: icon-only buttons must not rely on color alone — use shape + label
- WCAG 2.5.1: minimum 44×44px touch target on all toolbar buttons

**Task 0.11 — Mobile gesture mapping**
- DPR cap: 1.0 on mobile, 1.0–1.5 on tablet
- One-finger drag = orbit; two-finger pinch = zoom; two-finger drag = pan
- Long-press 500ms = element info popup
- Bottom camera bar touch targets ≥ 44px

**Task 0.12 — Overlay typography tokens**
All viewport overlay text uses `DM Mono`, minimum 10px, with `text-shadow: 0 1px 2px oklch(0% 0 0 / 0.6)` for legibility against bright geometry.

**Task 0.13 — OrbitControls cursor behavior**
- Default: `cursor-grab`
- While orbit-dragging (LMB held): `cursor-grabbing`
- While panning (MMB held): `cursor-move`
- During snap animation: `cursor-wait` (600ms)
- Hovering interactive element: `cursor-pointer`
```tsx
<div className="cursor-grab active:cursor-grabbing">
  {/* canvas content */}
</div>
```

**Task 0.14 — Interaction response time targets**
These are hard perf requirements. Enforce via `console.warn` in dev mode when exceeded:
- Toolbar button response: < 50ms
- Camera snap start: < 100ms
- Slider to scene update: < 16ms (1 frame)
- Panel open/close: < 150ms
- Scene initialization target: < 3s

**Task 0.15 — WebGL context loss recovery**
- Listen for `webglcontextlost` on the canvas element
- Show full-screen overlay: "3D scene crashed. [Reload Scene] [Report Issue]"
- Auto-attempt context restore on `webglcontextrestored`
- Do not silently fail

**Task 0.16 — Loading states for scene init**
- 0–500ms: Skeleton screen matching viewport + sidebar layout
- 500ms–2s: Canvas with ground grid first, then progressive geometry
- 2s+: Named progress indicator "Loading wall geometry... 67%" with Cancel button
- Operations > 2s must have a Cancel button

**Deprecate `ViewportToolbar.tsx`**
The existing bottom-center view-mode toolbar is fully replaced by SceneToolbar + CameraNavigationBar. Remove or clearly deprecate it at the end of Phase 0.

**Acceptance Criteria — Phase 0:**
- [ ] SceneToolbar visible in every 3D module (no module exempt)
- [ ] CameraNavigationBar visible in every 3D module
- [ ] Both use CSS variable glass morphism
- [ ] Keyboard shortcuts G/D/X/L/P/F and 1/2/3/Z/R/Home work
- [ ] Camera snaps correctly to Front/Top/Iso
- [ ] Reset snaps to per-module default camera
- [ ] Screenshot downloads PNG
- [ ] Fullscreen toggles browser API
- [ ] WebGL context loss shows recovery overlay
- [ ] Skeleton loading screen on init
- [ ] Ground grid + axis gizmo in every scene
- [ ] Old `ViewportToolbar` removed/deprecated
- [ ] `bun run type-check` passes

---

### PHASE 1 — Header Redesign (Low effort, High visual impact)

**Task 1.1 — Restyle `ViewportHeader.tsx`**

Token swap — exact replacements:
| Before | After |
|--------|-------|
| `bg-camp-black` | `bg-card` |
| `border-white/5` | `border-b border-border` |
| `text-white/60` | `text-muted-foreground` |
| `text-white/90` (title) | `text-foreground` |
| `text-white/40` (back) | `text-muted-foreground` |
| `text-white/30` (code ref) | `text-muted-foreground/60` |
| Height `h-9` (36px) | `h-10` (40px) |
| Back button arrow | Lucide `ArrowLeft` |

No hardcoded hex or opacity values in the header after this task.

**Task 1.2 — Add Settings icon**
- Rightmost position in header, before progress indicator
- Lucide `Settings` icon button
- Opens a dropdown/popover with module-level settings (dimensions display, grid, layers)

**Acceptance Criteria — Phase 1:**
- [ ] Header background is `bg-card`, not `bg-camp-black`
- [ ] All text uses design system tokens
- [ ] Settings icon visible right side
- [ ] No hardcoded colors
- [ ] `bun run type-check` passes

---

### PHASE 2 — Sidebar Width Standardization (Low effort, Medium impact)

**Task 2.1 — Update `TEMPLATE_SHELL_DEFAULTS` in `templates.ts`**

Apply these width targets:

| Template | Left | Right |
|----------|------|-------|
| parametric | 320px | 300px |
| exploded | none | 300px |
| cutaway | none | 300px |
| floorplan | none | 300px |
| animated | none | 300px |
| calculator | 340px | 340px |
| wall-configurator (v1 via TEMPLATE_SHELL_DEFAULTS only) | 340px | 320px |

No sidebar narrower than 300px after this task.

**Task 2.2 — Update `useTemplateContent.tsx` overrides**
Locate and update the dynamic width overrides (the unified wall configurator hardcoded 260px left / 320px right, and any parametric-with-compliance or floorplan-with-left overrides):
- Wall configurator v2 override: left → 340px, right → 320px
- Parametric with compliance override: left → 340px
- Floorplan with left panel override: left → 340px

**Acceptance Criteria — Phase 2:**
- [ ] No sidebar narrower than 300px anywhere
- [ ] Complex 2-panel modules: left ≥ 320px
- [ ] Right panels: 300–320px range
- [ ] `bun run type-check` passes

---

### PHASE 3 — Unified Floating Toolbar (Medium effort, High impact)

**Task 3.1 — Extend `ViewportCapabilities` in `templates.ts`**

Add:
```typescript
floatingToolbar?: FloatingToolbarConfig
kpiMetrics?: boolean
cameraPresetBar?: boolean
```

`FloatingToolbarConfig`:
```typescript
{
  position: 'top-left' | 'top-right'
  items: FloatingToolbarItem[]
}
```

`FloatingToolbarItem`:
```typescript
{
  id: string
  icon: string           // Lucide icon name
  label: string
  shortcut?: string
  type: 'toggle' | 'action'
  storeBinding?: string  // validated at runtime in dev mode — not compile-time typed
}
```

Include inline ADR comment about `storeBinding` runtime validation vs. compile-time type safety tradeoff.

**Task 3.2 — `FloatingToolbar.tsx`**
- Path: `src/features/3d-lab/components/shell/FloatingToolbar.tsx`
- Port from DevControls `ViewportToolbar.tsx` pattern
- Position: top-left, glass morphism
- Config-driven from `FloatingToolbarConfig`
- Default items for all modules: Grid (G), Dimensions (D), Screenshot (P), Fullscreen (F)
- Module-specific items (X-ray, Layers) opt-in via config

**Task 3.3 — `CameraPresetBar.tsx`**
- Path: `src/features/3d-lab/components/shell/CameraPresetBar.tsx`
- Port from DevControls `FloatingCameraBar` (NOT `CameraPresetBar` mobile/legacy — use the viewport overlay variant)
- Position: bottom-center, glass morphism
- Default presets: Orbit, Plan, Front, Iso
- Additional presets per module via config

**Task 3.4 — Retire old `ViewportToolbar`**
The old bottom-center toolbar coexists during Phase 3 transition only. At end of Phase 3:
1. Move view mode buttons → camera preset bar (bottom-center)
2. Move scene toggles (cross-section, exploded view) → floating toolbar as module-specific items
3. Move template extras (explode slider, cut depth) → popover attached to floating toolbar item
4. REMOVE old `ViewportToolbar` entirely

**Task 3.5 — Wire into `ViewportShell.tsx`**
```tsx
{capabilities.floatingToolbar && (
  <FloatingToolbar config={capabilities.floatingToolbar} />
)}
{capabilities.cameraPresetBar && (
  <CameraPresetBar presets={capabilities.cameraPresets} />
)}
```

**Keyboard shortcut ownership note:** When shared FloatingToolbar is active, it owns G/D/P/F. DevControls' private `useKeyboardShortcuts.ts` handles these same keys — in Phase 4, that overlap must be removed from the private handler.

**Task 3.6 — Enable for all template types in `TEMPLATE_SHELL_DEFAULTS`**
Every template type gets `floatingToolbar` config with the 4 default items and `cameraPresetBar: true`.

**Acceptance Criteria — Phase 3:**
- [ ] All parametric/exploded/cutaway/animated modules show floating toolbar
- [ ] All modules show camera preset bar
- [ ] Config-driven (not per-module hardcoded)
- [ ] G/D/P/F keyboard shortcuts work everywhere
- [ ] Old `ViewportToolbar` removed
- [ ] `bun run type-check` passes

---

### PHASE 4 — Shared Component Extraction from DevControls (Medium effort, High impact)

**Strategy:** DevControls keeps its CSS Grid layout. Extract its toolbar/bar components as shared imports. Visual consistency is achieved without layout migration risk.

**Task 4.1 — Extract `FloatingToolbar` as shared component**
Move DevControls' `ViewportToolbar.tsx` pattern → `src/features/3d-lab/components/shell/FloatingToolbar.tsx`. DevControls imports from shared location.

**Task 4.2 — Extract `CameraPresetBar` as shared component**
Move DevControls' `FloatingCameraBar` pattern → `src/features/3d-lab/components/shell/CameraPresetBar.tsx`. Both DevControls and ViewportShell import the same component.

**Task 4.3 — Extract `KpiBar` as shared component**
- Path: `src/features/3d-lab/components/shell/KpiBar.tsx`
- Config-driven: modules declare which metrics to show
- Position: above camera preset bar
- Style: glass morphism
- DevControls passes its 5 KPI metrics; other modules declare their own

**Task 4.4 — Update DevControls imports**
Replace DevControls' private toolbar/bar imports with shared component imports. CSS Grid layout stays unchanged.

**Acceptance Criteria — Phase 4:**
- [ ] `FloatingToolbar`, `CameraPresetBar`, `KpiBar` exist in `shell/`
- [ ] DevControls imports from shared, not private copies
- [ ] ViewportShell renders shared components
- [ ] DevControls layout unchanged (still on its CSS Grid)
- [ ] No visual regression in DevControls
- [ ] `bun run type-check` passes

---

### PHASE 5 — Bottom Toolbar Unification (Medium effort, Polish)

**Task 5.1 — Retire `ViewportToolbar` pattern**
Confirmed: floating toolbar (top-left) owns scene controls; camera preset bar (bottom-center) owns navigation. Template-specific controls (explode slider, cut depth) are attached to floating toolbar or bottom bar. Old pattern is dead.

**Task 5.2 — Standardize dark glass morphism**
All floating viewport UI uses CSS variables (already added in Phase 0). No hardcoded `bg-black/60` or `backdrop-blur` inline values. All overlays must reference:
- `var(--viewport-overlay-bg)`
- `var(--viewport-overlay-text)`
- `var(--viewport-overlay-active)`

Visual rule: **Sidebars + header = solid light theme. Floating overlays = dark glass.** These must not be mixed.

**Acceptance Criteria — Phase 5:**
- [ ] All floating overlays use dark glass morphism via CSS variables
- [ ] All solid panels use light theme consistently
- [ ] No mixed styles
- [ ] `bun run type-check` passes

---

### PHASE 6 — Selection Model + Context Menus (Medium effort, High impact)

**Task 6.1 — `useSelectionModel.ts`**
- Path: `src/features/3d-lab/hooks/useSelectionModel.ts`
- Single click = select (blue outline + 5% fill)
- Double click = enter group / drill into component
- Ctrl+Click = toggle multi-select
- Shift+Click = range select
- Tab = cycle overlapping elements at cursor
- Escape = deselect all
- Box select (LMB drag on empty space) = select fully enclosed elements
- Hover state: 10% primary overlay tint
- Pre-select: stronger tint on mousedown before release
- Active in multi-select: brighter outline vs passive selected

Add to `useViewportShellStore`:
- `selectedIds: Set<string>`
- `hoveredId: string | null`
- `selectElement(id)`, `toggleSelect(id)`, `clearSelection()`, `boxSelect(ids)`

**Task 6.2 — `ViewportContextMenu.tsx`**
- Path: `src/features/3d-lab/components/shell/ViewportContextMenu.tsx`
- Right-click on element: View Details / Highlight in Panel / Copy Value / Hide Element
- Right-click on empty viewport: Reset Camera / Zoom-to-Fit / Toggle Grid / Screenshot
- Appear < 100ms from right-click
- Max 10–12 items, grouped with dividers
- Destructive actions at bottom with separator
- Keyboard shortcut shown per item
- Escape or click-away dismisses
- Style: `bg-card border-border shadow-lg rounded-md` (solid, not glass — readability)

**Acceptance Criteria — Phase 6:**
- [ ] All selection gestures work (click, double, ctrl, tab, box)
- [ ] Blue outline selection feedback visible
- [ ] Status bar shows selection count + type summary
- [ ] Right-click element → element menu
- [ ] Right-click empty → navigation menu
- [ ] Context menu < 100ms
- [ ] `bun run type-check` passes

---

### PHASE 7 — Error States + Undo/Redo + Status Bar (Medium effort, High polish)

**Task 7.1 — Error State Taxonomy (4-level)**
1. **Inline validation:** Red border + helper text on invalid slider/input. Extend `GenericControlPanel` slider rendering.
2. **Warning toast:** Bottom-right, auto-dismiss 5s. Create `ViewportToast.tsx` using shadcn Sonner.
3. **Blocking dialog:** For destructive actions (Reset All, Clear Scene). Use shadcn `AlertDialog`. Destructive button is NEVER the default.
4. **System error:** WebGL context loss + canvas crash. Handled in Task 0.15. This task adds the remaining 4 recovery paths:
   - Disorientation: Home/Fit/Undo Camera always accessible
   - Invisible constraint: "why did this snap" tooltip history
   - Hidden-by-filter: visibility debugger (show hidden element count in status bar)
   - Performance degradation: auto-detect + suggest quality reduction via toast

**Task 7.2 — `useUndoRedo.ts`**
- Path: `src/features/3d-lab/hooks/useUndoRedo.ts`
- Zustand middleware wrapping `setParam` calls with history
- Max 50 history entries (configurable)
- Ctrl+Z = undo, Ctrl+Shift+Z = redo
- < 200ms per undo/redo
- Each entry: `{ params: Record<string, value>, timestamp, description }`
- Undo/redo buttons in header (near Settings icon) with count badges

**Task 7.3 — Status Bar content spec**
Extend `ViewportStatusBar.tsx`:
- Left: `[Module mode] · [Active constraint/law] · [Units: metric]`
- Center: `[Selection: "3 elements (2 Walls, 1 Door)"]`
- Right (dev mode only, toggleable via Settings): `[FPS: 60] · [Triangles: 12.4K]`
- FPS: `useFrame` sampling, updated every 500ms
- Triangle count: `renderer.info`
- Selection summary: from `useViewportShellStore.selectedIds`

**Acceptance Criteria — Phase 7:**
- [ ] Warning toasts for non-critical errors (auto-dismiss 5s)
- [ ] Blocking dialog for Reset All (destructive button not default)
- [ ] Ctrl+Z undoes last param change < 200ms
- [ ] Ctrl+Shift+Z redoes
- [ ] Status bar: mode, units, selection count in all modules
- [ ] `bun run type-check` passes

---

### PHASE 8 — Onboarding + Progressive Disclosure (Medium effort, High educational impact)

**Task 8.1 — 3-Part Onboarding Framework**

**Part 1 — First-time tooltip:**
- Show once on first module open: "Orbit: drag | Pan: middle-click | Zoom: scroll" + toolbar note
- Dismiss after 5s or any interaction
- Track `hasSeenViewportOnboarding` in localStorage

**Part 2 — `GuidedTour.tsx`:**
- Path: `src/features/3d-lab/components/shell/GuidedTour.tsx`
- Config-driven: `tourStops: TourStop[]` in `ViewportCapabilities`
- Each stop: camera position, spotlight element, narration text, optional quiz
- Progress dots, Back/Next/Skip
- Store completion per module in localStorage
- Target: 70%+ completion rate

**Part 3 — Contextual first-use tooltips:**
- First panel section open → tooltip explaining it
- First code violation → spotlight with explanation
- First slider interaction → "Tip: type a number for exact values"
- Track per-feature in localStorage, max 3 tips per session to avoid fatigue

**Task 8.2 — Progressive Disclosure for sidebar content**
Add `disclosureLevel: 'essential' | 'advanced' | 'expert'` to `ParameterDef`:
```typescript
disclosureLevel?: 'essential' | 'advanced' | 'expert'
```
- **Essential** (always visible): core type, primary params, dimensions
- **Advanced** (collapsed by default, expand on click): structural params, performance options
- **Expert** (behind Settings gear): debug overlays, raw computation values, formula display

`GenericControlPanel` groups by disclosure level. "Show Advanced" toggle at bottom of Essential. Settings panel reveals Expert.

**Acceptance Criteria — Phase 8:**
- [ ] First-time viewport tooltip shows once per user
- [ ] Per-module guided tour (6 stops) works
- [ ] Tour stops control camera + spotlight elements
- [ ] Contextual tooltips on first use of key features
- [ ] Sidebar shows Essential by default, Advanced on toggle, Expert in Settings
- [ ] `bun run type-check` passes

---

### PHASE 9 — Command Palette + Measurements Box + Compass + Drag-and-Drop (Medium effort, Power-user)

**Task 9.1 — `CommandPalette.tsx`**
- Path: `src/features/3d-lab/components/shell/CommandPalette.tsx`
- Trigger: Ctrl+K or F3
- Fuzzy search across: module names (186), parameter labels, preset names, camera presets, keyboard shortcuts
- Results grouped: Modules / Parameters / Presets / Actions
- Recent commands: last 5
- Highlighting on match
- Style: shadcn `CommandDialog` (cmdk-based)
- Enter = execute, Escape = dismiss

**Task 9.2 — Measurements Box (SketchUp pattern)**
- After slider interaction, show small input at bottom of viewport
- Auto-focus, type number + Enter = set exact value, Escape = dismiss without change
- Shows current value with unit label
- Only appears within 500ms window after slider release
- Extend `GenericControlPanel` slider with "click to type exact value" mode

**Task 9.3 — Compass Rose / North Arrow**
- Only for modules declaring `compassRose: true` in `ViewportCapabilities`
- Small indicator in viewport corner opposite axis gizmo
- Shows North direction relative to camera, rotates as camera orbits
- Click to snap to North-facing view

**Task 9.4 — `useDragDrop.ts`**
- Path: `src/features/3d-lab/hooks/useDragDrop.ts`
- Visual drop target: green highlight (valid), red (invalid)
- Snap-into-place animation on successful drop (200ms)
- Escape to cancel mid-drag
- Ghost element follows cursor
- Initial use: drag preset chips onto viewport to apply

**Acceptance Criteria — Phase 9:**
- [ ] Ctrl+K opens command palette with fuzzy search
- [ ] Typing exact value after slider works
- [ ] Compass rose in site planning modules
- [ ] Drag-and-drop hook with visual feedback
- [ ] `bun run type-check` passes

---

### PHASE 10 — Full DevControls Migration + Collaboration Foundation (High effort, Platform)

**Task 10.1 — Full DevControls migration to `ViewportShell`**
Now that Phases 0–9 have proven ViewportShell's capability, migrate DevControls from its CSS Grid to ViewportShell:
- Left sidebar: 480px (InputPanel, 3 tabs)
- Right sidebar: 300px (OutputPanel, 5 sections)
- Floating toolbar: shared `SceneToolbar` + DevControls-specific items (X-ray, Layers)
- Camera presets: shared `CameraNavigationBar`
- KPI bar: shared `KpiBar` with 5 DevControls metrics
- Guided tour: shared `GuidedTour` with 6 DevControls stops
- Status bar: shared `ViewportStatusBar` with zone/FLAR/BHL

This is the proof that ViewportShell can handle the most complex module. No visual regression permitted.

**Task 10.2 — Collaboration presence foundation**
- Path: `src/features/3d-lab/hooks/useCollaborationPresence.ts`
- Cursor position broadcast via Supabase Realtime (presence channel)
- User avatar + colored cursor indicator in viewport
- Live status text: "Angela is editing Level 2 North Wing"
- Lock indicators on actively-edited elements
- Permission levels: Owner/Admin, Editor, Reviewer, Viewer
- Initially read-only (viewers see cursors, can't edit)
- Full collaborative editing is a separate project — this is the presence infrastructure layer only

**Acceptance Criteria — Phase 10:**
- [ ] DevControls renders through `ViewportShell` with all features preserved
- [ ] No visual regression vs current DevControls
- [ ] Collaboration presence shows user cursors
- [ ] Lock indicators on actively-edited elements
- [ ] `bun run type-check` passes

---

## BLOCK 4 — PERFORMANCE BUDGET

Enforce as hard constraints. Emit `console.warn` in dev mode when breached.

| Metric | Mobile (<768px) | Tablet (768–1023px) | Desktop (≥1024px) |
|--------|-----------------|--------------------|--------------------|
| DPR | 1.0 | 1.0–1.5 | 1.0–2.0 |
| Max triangles | 50,000 | 100,000 | 200,000 |
| Max draw calls | 30 | 50 | 80 |
| Frame loop | demand | demand | demand |
| Shadows | OFF | optional | ON |
| Contact shadows | OFF | OFF | ON |
| Target FPS | 30 | 45 | 60 |

Use `PerformanceMonitor` from drei for adaptive DPR degradation on mobile.

---

## BLOCK 5 — HARD CONSTRAINTS

- **DO NOT** begin Phase 1+ without Phase 0 acceptance criteria passing `bun run type-check`
- **DO NOT** overwrite existing spec content — extend only; mark superseded sections with `<!-- superseded: YYYY-MM-DD -->`
- **DO NOT** fabricate file paths, type names, or store field names — read the codebase
- **DO NOT** use hardcoded hex/opacity values in any viewport overlay styling — use CSS variables
- **DO NOT** add a Pan mode button — pan is always middle-click/two-finger, no exceptions
- **DO NOT** make DevControls opt into SceneToolbar or CameraNavigationBar — they are unconditional in ViewportShell (Phase 0) and DevControls gets them via shared component import (Phase 4)
- **DO NOT** close without updating `.ai/state/` files
- **DO NOT** close without producing `<session_delta>`

---

## BLOCK 6 — POST-UPDATE PROTOCOL

After all phases complete:

1. Update/create spec at `.ai/docs/01-product/###-3d-lab-viewport-shell-specification.md`
2. Update `.ai/state/current-task.md`: mark all 10 phases complete, add any spawned items to Backlog
3. Update `.ai/state/memory.md`: append decisions made, constraints locked in, open questions surfaced
4. Output:

```
<session_delta>
  spec_file: [path] — [CREATED | UPDATED]
  sections_added: [list]
  sections_modified: [list]
  sections_unchanged: [list]
  state_current_task_changes: [summary]
  state_memory_additions: [summary]
  architecture_impacts: [list or NONE]
  open_items_spawned: [list or NONE]
</session_delta>
```

5. Git commit:
```
docs(3d-lab-viewport): create unified viewport shell specification — phases 0-10
feat(3d-lab): implement unified viewport UX — SceneToolbar, CameraNavigationBar, header redesign, sidebar standardization, floating toolbar, shared component extraction, selection model, error states, undo/redo, onboarding, command palette, DevControls migration, collaboration presence
```

---

## BLOCK 7 — VERIFICATION CHECKLIST

Before closing, confirm:

```
<verification_result>
  all_phase_acceptance_criteria_met: ✅ | ❌ [which phases failed]
  type_check_passes: ✅ | ❌
  css_variables_only_in_overlays: ✅ | ❌
  no_hardcoded_colors: ✅ | ❌
  no_pan_mode_button: ✅ | ❌
  scene_toolbar_unconditional: ✅ | ❌
  camera_nav_unconditional: ✅ | ❌
  old_viewport_toolbar_removed: ✅ | ❌
  state_files_updated: ✅ | ❌
  changelog_updated: ✅ | ❌
  architecture_impacts_flagged: ✅ | N/A
</verification_result>
```
