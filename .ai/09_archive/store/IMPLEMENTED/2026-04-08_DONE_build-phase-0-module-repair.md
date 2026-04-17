# Build Phase 0: Repair Broken Existing Modules

**Status:** COMPLETE
**Date:** 2026-04-08
**Author:** Claude (ralplan consensus)

---

## Root Cause Analysis

### Primary Issue: `pointer-events-none` chain blocking all template panel interactions

**LabViewportFrame** (line 84) wraps all children in `pointer-events-none`:
```tsx
<div className="relative z-10 pointer-events-none h-full w-full">
  {children}
</div>
```

This was designed to let Canvas pointer events pass through while overlays float above. However, ALL template-driven modules render their control panels (GenericControlPanel, ConfigPanel, BOMPanel, FlooringInputPanel) inside this wrapper, making them completely unclickable.

**Why Site Development Controls was unaffected:** It's bespoke — rendered WITHOUT LabViewportFrame, in a plain `<div>` with its own Canvas.

### Per-Module Diagnosis

| Module | Template | Root Cause | Symptom |
|--------|----------|-----------|---------|
| Stairway Configurator | `parametric` → LabPanelLayout | Panels in pointer-events-none chain | 3D renders but sliders/buttons dead |
| Unified Wall Configurator | `wall-configurator` → LabPanelLayout | Panels in pointer-events-none chain | 3D renders but wizard steps dead |
| Flooring/Tile Visualizer | `calculator` → custom 3-panel | Panels dead + store defaults to 0x0 room | Empty viewport, no interaction |

---

## Fixes Applied

### Fix 1: LabPanelLayout — restore panel interactivity
**File:** `src/features/3d-lab/components/templates/LabPanelLayout.tsx`
- Added `pointer-events-auto` to root grid div (restores left/right panel clicks)
- Added `pointer-events-none` to center viewport div (preserves Canvas event pass-through)

### Fix 2: CalculatorTemplate — restore panel interactivity
**File:** `src/features/3d-lab/templates/CalculatorTemplate.tsx`
- Added `pointer-events-auto` to root layout div (restores input/result panel clicks)
- Added `pointer-events-none` to center canvas panel div (preserves Canvas event pass-through)

### Fix 3: FloatingCameraBar — restore interactivity inside canvas panel
**File:** `src/components/calculators/FloatingCameraBar.tsx`
- Added `pointer-events-auto` to floating bar container (it sits inside the pointer-events-none canvas panel)

### Fix 4: FlooringStore — set default room dimensions
**File:** `src/app/calculators/_stores/flooringStore.ts`
- Changed `roomLengthMm: 0` → `roomLengthMm: 4000` (4m typical room)
- Changed `roomWidthMm: 0` → `roomWidthMm: 3000` (3m typical room)
- Pre-computed initial `computed` state from `DEFAULT_INPUTS` so tile grid renders on load

---

## Verification

- [x] `bun run type-check` — passes clean
- [x] Zero `<Html>` gate — only DevControlsModule (exempt bespoke scene)
- [x] Identity lock — SlideToSubmit, GestureCaptureZone, haptics.ts untouched
- [x] DevControls independence — DevControlsModule untouched
- [x] No modifications to 193 module configs (read-only during architecture phases)

---

## Pointer-Events Architecture (Post-Fix)

```
LabViewportFrame
├── Canvas (absolute, z-0) ← receives orbit/drag events directly
├── DOMOverlayLayer (absolute, pointer-events-none)
└── Children wrapper (relative, z-10, pointer-events-none)
    └── Template (LabPanelLayout or CalculatorTemplate)
        ├── Left Panel (pointer-events-auto via grid root) ← clickable
        ├── Center Viewport (pointer-events-none) ← pass-through to Canvas
        └── Right Panel (pointer-events-auto via grid root) ← clickable
```
