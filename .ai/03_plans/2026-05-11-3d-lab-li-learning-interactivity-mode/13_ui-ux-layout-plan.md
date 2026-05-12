# 13 — UI/UX Layout Plan

## Current PI Layout Summary

```
┌──────────────────────────────────────────────────────────┐
│ ViewportHeader (title · code ref · progress · back)      │
├─────────────┬────────┬──────────────────┬──────┬─────────┤
│ Left Sidebar│ Handle │                  │Handle│ Right   │
│ Controls    │  20px  │   3D Viewport    │ 20px │ Sidebar │
│ ~320px      │        │                  │      │ ~300px  │
│             │        │  SceneToolbar    │      │ Details │
│ Params      │        │  CameraPresetBar │      │         │
│ Sliders     │        │  LayersPanel     │      │ Complnc │
│ Dropdowns   │        │                  │      │ Parts   │
│ Presets     │        │                  │      │ Steps   │
├─────────────┴────────┴──────────────────┴──────┴─────────┤
│ ViewportStatusBar                                       │
└──────────────────────────────────────────────────────────┘
```

- Dual sidebars, both active
- Left: structured controls with groups
- Right: compliance, source truth, parts, or steps
- Viewport center with toolbar overlays
- Status bar at bottom

## LI Layout Goals

1. **Simpler than PI** — not just "PI with hidden sidebars"
2. **Viewport-dominant** — the 3D model is the hero
3. **Compact controls** — toggles accessible but not imposing
4. **Purpose-built** — LI layout feels intentional, not like something is missing
5. **Consistent shell** — reuses ViewportShell infrastructure

## Layout Options

### Option A: Viewport + Right Panel (RECOMMENDED)

```
┌──────────────────────────────────────────────────────┐
│ ViewportHeader (title · code ref · back)             │
├──────────────────────────────────┬───────────────────┤
│                                  │ Right Sidebar     │
│         3D Viewport              │ 280px             │
│                                  │                   │
│   SceneToolbar (top-left)        │ Layers            │
│   CameraPresetBar (bottom)       │ ☑ Ramp Surface    │
│   LayersPanel (floating)         │ ☑ Handrail        │
│                                  │ ☐ Edge Curb       │
│                                  │ ☑ Landing         │
│                                  │                   │
├──────────────────────────────────┴───────────────────┤
│ ViewportStatusBar                                    │
└──────────────────────────────────────────────────────┘
```

**Pros**: Simple, uses existing ViewportShell config (`leftSidebar: false`), layer toggles accessible without blocking viewport, familiar pattern

**Cons**: None significant for MVP

### Option B: Viewport + Bottom Control Tray

```
┌──────────────────────────────────────────────────────┐
│ ViewportHeader                                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│                  3D Viewport                         │
│                                                      │
│                                                      │
├──────────────────────────────────────────────────────┤
│ Bottom Tray: Layer Toggles (horizontal chip layout)   │
└──────────────────────────────────────────────────────┘
```

**Pros**: Maximizes viewport space, mobile-friendly

**Cons**: Requires new shell component, limited space for layer labels/descriptions, not great for many layers

### Option C: Viewport + Floating Layer Controls

```
┌──────────────────────────────────────────────────────┐
│ ViewportHeader                                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│           3D Viewport                                │
│                                                      │
│                    ┌──────────┐                      │
│                    │ Layers   │  ← Floating panel    │
│                    │ ☑ ...    │                      │
│                    │ ☑ ...    │                      │
│                    └──────────┘                      │
├──────────────────────────────────────────────────────┤
│ ViewportStatusBar                                    │
└──────────────────────────────────────────────────────┘
```

**Pros**: Viewport-dominant, feels modern/light

**Cons**: Overlaps viewport content, same as existing LayersPanel (which we already have), need dismiss behavior

### Option D: Split View with Lesson Panel

```
┌──────────────────────────┬───────────────────────────┐
│ ViewportHeader           │                           │
├──────────────────────────┼───────────────────────────┤
│                          │ Lesson Panel              │
│     3D Viewport          │                           │
│                          │ Context text              │
│                          │ Layer exploration guide   │
│                          │ Layer toggles             │
│                          │                           │
├──────────────────────────┴───────────────────────────┤
│ ViewportStatusBar                                    │
└──────────────────────────────────────────────────────┘
```

**Pros**: Educational context alongside model, explicit guided feel

**Cons**: Reduces viewport space significantly, adds content authoring complexity, over-engineered for MVP

## Recommended MVP Layout: Option A

Viewport + compact right sidebar (280px) with layer toggles.

### Why:
- Uses existing ViewportShell with `leftSidebar: false` + `rightSidebar: { width: 280 }`
- Zero new shell components needed
- Familiar pattern to current users (PI uses one or two sidebars)
- Layer toggles have enough space for labels + descriptions
- Does NOT feel like "PI with missing left panel" — it's intentionally asymmetric

### Component Tree:
```
ViewportShell (shellConfig: { leftSidebar: false, rightSidebar: { width: 280 } })
├── ViewportHeader
├── [Desktop Grid]
│   ├── Viewport Center
│   │   ├── LabViewportFrame (Canvas)
│   │   │   └── CanvasWrapper → LearningSceneRenderer
│   │   ├── SceneToolbar (overlay)
│   │   ├── CameraNavigationBar (overlay)
│   │   └── LayersPanel → LearningLayerToggles (mirrored)
│   └── Right Sidebar (280px)
│       └── LearningLayerToggles
└── ViewportStatusBar
```

## Responsive Behavior

LI inherits ViewportShell's mobile responsive behavior:
- **Desktop**: CSS Grid with viewport + right sidebar
- **Mobile (≤768px)**: Flex column with canvas + bottom sheet
  - Bottom sheet tabs: "Layers" (from right sidebar)
  - Inherits existing mobile layout from ViewportShell

No mobile-specific LI code needed for MVP.

## Empty / Loading / Error States

| State | UI |
|-------|-----|
| Loading | `LabViewportFrame` shows loading state; `ModuleViewer` shows spinner |
| Error | `ModuleViewer` shows error with retry button |
| No layers defined | Right sidebar shows "No layers configured" |
| All layers hidden | Canvas shows message "All layers hidden" |

## Accessibility

- Layer toggles: `<label>` with `htmlFor` pairing, keyboard focusable
- Canvas: `WebGLErrorBoundary` provides fallback for WebGL-unavailable
- Screen reader: Right sidebar has `role="complementary"` region
- Focus order: Header → Sidebar → Canvas → Status Bar
- Keyboard shortcuts: ViewportShell shortcuts (L for layers panel, G for grid, etc.) still work

## Keyboard Interaction

| Key | Action |
|-----|--------|
| Tab | Move focus between sidebar and canvas |
| Space/Enter | Toggle focused layer checkbox |
| L | Toggle LayersPanel overlay (existing shortcut) |
| G | Toggle grid (existing) |
| D | Toggle dimensions (existing) |
| Mouse scroll | Orbit/zoom in viewport |

## Visual Hierarchy

1. **3D Model** — dominant visual element (viewport center)
2. **Layer Toggles** — secondary, in right sidebar and LayersPanel overlay
3. **Header** — tertiary, module context
4. **Toolbar overlays** — minimal, low-opacity UI

## How PI/LI Distinction Appears in UI

| Element | PI Appearance | LI Appearance |
|---------|--------------|---------------|
| Dashboard card | Template badge (Parametric/Exploded/etc.) | "Learning" badge |
| Module page | Dual sidebars | Single right sidebar |
| Viewport header | Title + code ref + progress | Title + code ref (no hotspot progress) |
| Scene toolbar | Grid/Dim/Xray + template extras | Grid/Dim/Xray only |
| Layers panel | Grid/Dim/Xray + module layers | Grid/Dim/Xray + layer toggles |

## Anti-Pattern to Avoid

**Do NOT make LI look like "PI with the left panel removed."**

LI should feel intentionally designed, not broken. Specifically:
- Right sidebar should be well-populated with layer toggles
- The title in the right sidebar should say "Layers" (not "Details" or "Controls")
- No "collapsed left panel" artifacts (no left handle visible when collapsed)
- The layout should feel balanced (viewport + right panel)

The `ViewportShell` already handles this correctly: when `leftSidebar: false`, no left handle or collapsed indicator renders.
