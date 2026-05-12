# Custom Polygon Lot Plotting — UX/UI Guide & Implementation Plan

**Feature:** Advanced Surveyor-Mode Lot Generation
**Module:** Development Controls Calculator (LotConfigurator)
**Design System Version:** SlateCamp Design System v1 (Rams Standard)
**Date:** April 2026

---

## Table of Contents

1. [UX Strategy & Design Intent](#1-ux-strategy--design-intent)
2. [Information Architecture Changes](#2-information-architecture-changes)
3. [Mode Toggle — The Pivotal UX Decision](#3-mode-toggle--the-pivotal-ux-decision)
4. [Basic Lot Mode — Preserve & Polish](#4-basic-lot-mode--preserve--polish)
5. [Surveyor Mode — Complete UX Specification](#5-surveyor-mode--complete-ux-specification)
6. [Boundary Tagging — The Critical Compliance Bridge](#6-boundary-tagging--the-critical-compliance-bridge)
7. [3D Viewport Feedback Loop](#7-3d-viewport-feedback-loop)
8. [Closure Feedback System](#8-closure-feedback-system)
9. [States: Empty, Loading, Error, Success](#9-states-empty-loading-error-success)
10. [Mobile Adaptation](#10-mobile-adaptation)
11. [Component Specifications](#11-component-specifications)
12. [Interaction Choreography](#12-interaction-choreography)
13. [Accessibility Audit](#13-accessibility-audit)
14. [Implementation Phases by UX Impact](#14-implementation-phases-by-ux-impact)
15. [Design Review Checklist](#15-design-review-checklist)

---

## 1. UX Strategy & Design Intent

### The Problem This Feature Solves

ALE Area C design problems provide students with lot descriptions in **Philippine surveyor notation** (technical bearings from TCT/OCT documents). Students currently must manually plot these lots on graph paper, compute area by hand, then mentally translate that shape into setback envelopes, AMBF, and PSO. This manual process is the #1 source of computational errors in Area C.

The LotConfigurator's Surveyor Mode eliminates this bottleneck by letting students input bearings and distances directly, see the lot rendered in real time, and watch compliance computations apply automatically to the actual lot shape.

### Design Principles for This Feature

These principles extend the SlateCamp Coach Interface philosophy to a tool-heavy parametric module:

**1. Progressive Complexity.** The Basic Lot mode remains the default. Surveyor Mode is discovered, not imposed. A student who only needs a quick rectangular lot should never encounter surveyor complexity.

**2. Input Mirrors the Source Document.** The bearing input fields must map 1:1 to how bearings appear on a Philippine TCT/OCT title: `N 65° 30' 00" E, 45.00 m.` If a student can read their title, they can fill the form. No mental translation required.

**3. Continuous Visual Feedback.** The 3D viewport updates on every keystroke. The polygon rebuilds live. The closure gap renders as a visible dashed line. The student never has to "submit" and wait — they see consequences immediately.

**4. Honest Errors.** When the polygon doesn't close, we say so — with the exact error in meters and a visual gap line. No hiding imprecision behind rounded numbers. Surveyors and architects respect precision.

**5. The Boundary Tag is the Bridge.** Tagging each edge as Front/Rear/Side is what makes the compliance engine work on irregular lots. This action must feel important, not like an afterthought checkbox.

### Strategic UX Improvement Opportunity

The existing Basic Lot mode currently presents bare number inputs with no visual hierarchy. This feature introduction is the right moment to **elevate the entire LotConfigurator panel** — better card structure, proper eyebrow labels, a summary footer — so that the Basic mode also benefits. The Surveyor Mode doesn't just add new UI; it raises the quality floor for the entire module.

---

## 2. Information Architecture Changes

### Before: Current IA

```
3D Lab Module
├── Canvas (3D viewport)
└── Side Panel
    └── Lot Parameters
        ├── Width input
        ├── Depth input
        └── (implicit) Area display
```

### After: Proposed IA

```
3D Lab Module
├── Canvas (3D viewport)
│   ├── Lot polygon mesh
│   ├── Boundary edge lines (color-coded)
│   ├── Dimension labels
│   ├── Setback overlay
│   └── Closure gap indicator (surveyor mode only)
│
└── Side Panel (desktop) / Bottom Sheet (mobile)
    └── LotParametersPanel
        ├── Mode Toggle [Basic | Surveyor]
        ├── [A] BasicLotInputs (when mode = basic)
        │   ├── Width input
        │   └── Depth input
        │
        ├── [B] SurveyorLotInputs (when mode = surveyor)
        │   ├── Segment list (sortable)
        │   │   └── SegmentInputCard × N
        │   │       ├── BearingInput (N/S + °/'/'' + E/W)
        │   │       ├── Distance input
        │   │       └── BoundaryTagSelector
        │   ├── Add Segment button
        │   ├── Presets dropdown (Sample Lots)
        │   └── ClosureStatusBadge
        │
        └── LotSummaryFooter (shared by both modes)
            ├── Area (sq.m.)
            ├── Perimeter (m) — surveyor mode only
            └── Segment count — surveyor mode only
```

### Key IA Decision: The Summary Footer Is Shared

Both modes display a `LotSummaryFooter` with the computed area. In Basic mode it shows `Area: W × D = X sq.m.` In Surveyor mode it shows `Area: X sq.m. | Perimeter: Y m | Segments: N`. This shared footer creates visual continuity between modes and reinforces that both modes feed the same compliance engine downstream.

---

## 3. Mode Toggle — The Pivotal UX Decision

### Design: Segmented Control, Not Tabs

The mode switch is a **segmented control** (two-button toggle), not browser-style tabs. This is a binary state switch, not a tabbed navigation — the user is choosing a mode for the same tool, not navigating between different content areas.

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ┌──────────────────┬───────────────────────┐    │
│  │   ▦ Basic Lot    │   ◎ Surveyor Plot     │    │
│  └──────────────────┴───────────────────────┘    │
│                                                  │
│  [Mode-specific content area]                    │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Segmented Control Specifications

```
Container:
  height: 36px
  border-radius: 8px
  background: bg-muted (#F2F0EB in light, dark equivalent)
  padding: 2px
  width: 100% of parent panel

Active segment:
  background: bg-card (white in light, card surface in dark)
  border-radius: 6px
  shadow: 0 1px 3px rgba(0,0,0,0.08)
  text: font-mono text-[11px] font-medium text-foreground
  icon: 14×14px, color-foreground

Inactive segment:
  background: transparent
  text: font-mono text-[11px] font-medium text-muted-foreground
  icon: 14×14px, color-muted-foreground

Transition:
  background slides with 200ms ease-out (spring feel)
```

### Icons

The Basic Lot segment uses a small grid/rectangle icon (▦) suggesting a simple shape. The Surveyor Plot segment uses a compass/crosshair icon (◎) suggesting precision measurement. Both icons are 14×14px from Lucide, rendered in the mono font color to avoid over-signaling.

### Behavioral Rules

- **Default on load:** Basic Lot. Always. The user must actively choose Surveyor Mode.
- **State preservation on toggle:** Switching from Basic → Surveyor does NOT reset the rectangle values. Switching from Surveyor → Basic does NOT delete the segment data. Both states persist independently in the Zustand store.
- **Recompute on toggle:** `setMode()` triggers `recompute()`, which rebuilds `computedPolygon` from whichever mode is active. The 3D viewport reads `computedPolygon` and renders accordingly.
- **No confirmation dialog:** Switching modes is non-destructive (both states persist). No "Are you sure?" friction.
- **URL parameter (future):** `?lotMode=surveyor` for deep-linking into surveyor mode from curriculum content.

### Why This Improves the Existing UX

The current Lot Parameters section has no header or mode concept — it's just two floating inputs. Adding the segmented control creates a proper panel identity: the panel now has a title-level element (the mode toggle IS the panel identity) and a clear content area below it. This is structurally cleaner even if a student never touches Surveyor Mode.

---

## 4. Basic Lot Mode — Preserve & Polish

The existing Basic Lot inputs must remain functionally identical. However, we take this opportunity to align them with SlateCamp's card and typography patterns.

### Current State (What Exists)

Two bare number inputs with inline labels. No card structure, no eyebrow, no summary.

### Improved State (After This Feature Ships)

```
┌─────────────────────────────────────────────────────┐
│  ┌────────────────────┬────────────────────────┐    │
│  │   ▦ Basic Lot      │   ◎ Surveyor Plot      │    │
│  └────────────────────┴────────────────────────┘    │
│                                                     │
│  LOT DIMENSIONS                    ← eyebrow label  │
│                                                     │
│  Width (frontage)                                   │
│  ┌─────────────────────────────────┐                │
│  │  15.00                        m │                │
│  └─────────────────────────────────┘                │
│                                                     │
│  Depth                                              │
│  ┌─────────────────────────────────┐                │
│  │  25.00                        m │                │
│  └─────────────────────────────────┘                │
│                                                     │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│                                                     │
│  LOT SUMMARY                       ← eyebrow label  │
│  Area       375.00 sq.m.                            │
│  Frontage   15.00 m                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### What Changed (Visual Only, Zero Behavior Change)

1. **Eyebrow label** `LOT DIMENSIONS` added above inputs → `font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground`
2. **Input labels above fields** (not inline): "Width (frontage)" and "Depth" → `font-sans text-xs text-muted-foreground`
3. **Unit suffix inside input** → Right-aligned `m` in muted text, not a separate element
4. **Summary footer** with eyebrow `LOT SUMMARY` → Area and Frontage displayed as `font-mono text-sm tabular-nums`
5. **Subtle divider** between inputs and summary → `border-b border-dashed border-border`

### Critical Constraint

The width and depth values, the field names in the Zustand store (`rectangle.width`, `rectangle.depth`), and the computational output must remain byte-identical to the current implementation. These changes are purely presentational.

---

## 5. Surveyor Mode — Complete UX Specification

This is the highest-complexity new interaction surface. Every design decision here must balance precision data entry with real-time visual feedback.

### 5.1 Panel Layout — Surveyor Mode Active

```
┌─────────────────────────────────────────────────────┐
│  ┌────────────────────┬────────────────────────┐    │
│  │   ▦ Basic Lot      │   ◎ Surveyor Plot  ●   │    │
│  └────────────────────┴────────────────────────┘    │
│                                                     │
│  LOT BOUNDARY SEGMENTS              ← eyebrow      │
│  Enter bearings from your lot title ← helper text   │
│                                                     │
│  ┌─ 1 ──────────────────────────────────────┐ ⠿    │
│  │  [N ▾] [65]° [30]' [00]" [E ▾]  45.00 m │       │
│  │  ┌─FRONT─┐ ┌─REAR──┐ ┌─LEFT──┐ ┌─RIGHT─┐│       │
│  │  │  ●    │ │  ○    │ │  ○    │ │  ○    ││       │
│  │  └───────┘ └───────┘ └───────┘ └───────┘│       │
│  └──────────────────────────────────────────┘       │
│                                                     │
│  ┌─ 2 ──────────────────────────────────────┐ ⠿    │
│  │  [S ▾] [25]° [00]' [00]" [E ▾]  30.00 m │       │
│  │  ┌─FRONT─┐ ┌─REAR──┐ ┌─LEFT──┐ ┌─RIGHT─┐│       │
│  │  │  ○    │ │  ○    │ │  ●    │ │  ○    ││       │
│  │  └───────┘ └───────┘ └───────┘ └───────┘│       │
│  └──────────────────────────────────────────┘       │
│                                                     │
│  ┌─ 3 ──────────────────────────────────────┐ ⠿    │
│  │  ...                                     │       │
│  └──────────────────────────────────────────┘       │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │  ＋  Add Segment                        │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌ Sample Lots ▾ ┐                                  │
│                                                     │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│                                                     │
│  CLOSURE STATUS                     ← eyebrow      │
│  ┌──────────────────────────────────────────┐       │
│  │  ● Closed — error: 0.02m    ☐ Bowditch  │       │
│  └──────────────────────────────────────────┘       │
│                                                     │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│                                                     │
│  LOT SUMMARY                        ← eyebrow      │
│  Area        675.32 sq.m.                           │
│  Perimeter   120.00 m                               │
│  Segments    5                                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5.2 The Segment Input Card — Detailed Anatomy

Each `SegmentInputCard` is a compact, self-contained unit representing one boundary leg. This is the most interaction-dense component in the feature.

```
┌──────────────────────────────────────────────────┐
│ ⠿  1                                          ✕  │  ← drag handle, index, delete
│                                                  │
│  BEARING                            DISTANCE     │  ← eyebrow row
│  [N ▾] [65]° [30]' [00]" [E ▾]    [45.00] m    │  ← input row
│                                                  │
│  BOUNDARY TYPE                                   │  ← eyebrow
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌───────┐           │
│  │FRONT │ │ REAR │ │ LEFT │ │ RIGHT │           │  ← pill selector
│  │  ●   │ │  ○   │ │  ○   │ │  ○    │           │
│  └──────┘ └──────┘ └──────┘ └───────┘           │
└──────────────────────────────────────────────────┘
```

**Card styling:**

```
Container:
  background: bg-card
  border: 1px solid border
  border-left: 3px solid [boundary-tag-color]   ← dynamic accent
  border-radius: 0 8px 8px 0
  padding: 12px 12px 12px 14px
  margin-bottom: 8px

When selected (synced with 3D viewport highlight):
  border-left: 3px solid [boundary-tag-color]
  box-shadow: 0 0 0 1px [boundary-tag-color]/20
  background: bg-card

Drag handle:
  ⠿ icon, 16×16px, text-muted-foreground
  cursor: grab / grabbing
  touch target: 44×44px minimum
```

### 5.3 The Bearing Input — Micro-Interaction Design

The bearing input is the most technically unusual form component in SlateCamp. It must feel natural to someone reading a Philippine lot title.

**Layout: Inline Segmented Fields**

```
[N ▾]  [65] ° [30] ' [00] "  [E ▾]
 ↑       ↑       ↑      ↑       ↑
 base   deg     min    sec     turn
```

**Field specifications:**

| Field | Type | Width | Allowed Values | Keyboard |
|---|---|---|---|---|
| Base direction | Dropdown (N/S) | 40px | `N`, `S` | Click/tap only |
| Degrees | Number input | 40px | 0–90 | Numeric, step=1 |
| Minutes | Number input | 36px | 0–59 | Numeric, step=1 |
| Seconds | Number input | 36px | 0–59 | Numeric, step=1 |
| Turn direction | Dropdown (E/W) | 40px | `E`, `W` | Click/tap only |

**Behavioral rules:**

- **Auto-advance on complete input:** When degrees field reaches 2 digits (or the value is ≥10), focus auto-advances to minutes. Same for minutes → seconds. This mimics calculator-style data entry and dramatically speeds up lot plotting.
- **Degree symbol, minute mark, second mark rendered as inline labels** between fields: `°`, `'`, `"` in `font-mono text-[10px] text-muted-foreground`. These are NOT editable — they are visual separators.
- **N/S and E/W dropdowns** are minimal selects styled as compact pills, not full dropdown menus. On mobile, they use the native picker. On desktop, they cycle on click (N→S, S→N) for speed.
- **Tab order:** Base → Degrees → Minutes → Seconds → Turn → Distance → [next segment's Base]. The user can tab through an entire lot description without touching the mouse.
- **Validation:** Degrees cannot exceed 90. Minutes and seconds cannot exceed 59. If a student enters 95°, the field shows `signal-red` border and the 3D viewport ignores that segment until corrected.

**Distance input:**

```
Width: 72px
Type: number input
Step: 0.01
Suffix: "m" (right-aligned, muted)
Min: 0.01
Font: font-mono text-sm tabular-nums
```

### 5.4 Segment Reordering — Drag-and-Drop

Segments are **ordered** — the sequence defines the polygon walk. Reordering must be possible because users might enter segments out of order from their title, or realize they need to swap two legs.

**Implementation:** `@dnd-kit/sortable` (the established React drag-and-drop library).

**Behavior:**

- Grab the ⠿ handle → card lifts with subtle shadow → drop zone indicators appear between cards.
- On drop, `reorderSegments(fromIndex, toIndex)` fires → polygon recomputes → 3D viewport updates.
- On mobile, long-press (300ms) activates drag mode. Visual cue: card slightly scales up (1.02) and gains a deeper shadow.
- During drag, the 3D viewport shows the polygon in a "preview" state with reduced opacity, updating in real time as the user hovers over different drop positions.

### 5.5 Adding and Removing Segments

**Add Segment button:**

```
Style: secondary button (border, no fill)
  bg-transparent border border-dashed border-border
  hover:bg-muted hover:border-solid
  font-mono text-[11px] text-muted-foreground
  ＋ icon, 14px

Behavior:
  - Appends a new segment with defaults:
    bearing: N 0° 0' 0" E
    distance: 10.00 m
    boundaryTag: 'front'
  - Scrolls the segment list to show the new card
  - Auto-focuses the degrees field of the new segment
  - recompute() fires immediately
```

**Delete segment (✕ button):**

```
Position: top-right of segment card
Icon: ✕, 12px, text-muted-foreground
Touch target: 44×44px (invisible padding)
Hover: text-signal-red

Behavior:
  - If segments.length > 3: removes immediately (no confirmation)
  - If segments.length === 3: shows inline warning
    "Minimum 3 segments required for a polygon."
    Button becomes disabled.
  - recompute() fires after removal
```

### 5.6 Sample Lot Presets

For students who want to experiment without a real TCT, or for testing during development.

```
Trigger: "Sample Lots" dropdown below the Add Segment button
Style: ghost button with caret → opens dropdown menu

Presets:
  • "Square Lot (10×10m)" → 4 segments, regular rectangle
  • "Parallelogram Lot" → 4 segments from Appendix A of impl plan
  • "L-Shaped Lot" → 6 segments, irregular
  • "Triangular Lot" → 3 segments, equilateral

Behavior:
  - Selecting a preset REPLACES current segments (confirmation if segments exist)
  - Confirmation: inline banner at top of segment list:
    "Replace current segments with sample lot?"
    [Replace] [Cancel]
  - After loading, polygon renders immediately as closed
```

---

## 6. Boundary Tagging — The Critical Compliance Bridge

This is the most architecturally important UX element. Without correct boundary tags, the compliance engine cannot apply the right setback distance to the right edge. The UX must make this step feel consequential and understandable.

### 6.1 The Boundary Tag Selector

Each segment card contains a **pill-style radio group** for the boundary type:

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  FRONT   │ │   REAR   │ │   LEFT   │ │  RIGHT   │
│    ●     │ │    ○     │ │    ○     │ │    ○     │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Pill styling:**

```
Unselected pill:
  bg-muted border border-border rounded-md
  font-mono text-[9px] font-medium uppercase
  text-muted-foreground
  height: 28px
  min-width: 56px
  cursor: pointer

Selected pill (per tag color):
  FRONT:  bg-[#1B3FC4]/10 border-[#1B3FC4] text-[#1B3FC4]
  REAR:   bg-[#E63329]/10 border-[#E63329] text-[#E63329]
  LEFT:   bg-[#F5A623]/10 border-[#F5A623] text-[#F5A623]
  RIGHT:  bg-[#F5A623]/10 border-[#F5A623] text-[#F5A623]
```

### 6.2 Boundary Tag Color System

These colors flow from the segment card's left-border accent, through the 2D pill selection, to the 3D viewport edge lines. Consistent color = consistent mental model.

| Tag | Color | Hex | Usage |
|---|---|---|---|
| FRONT (road) | Cobalt Blue | `#1B3FC4` | Primary brand color — road edge is the most important |
| REAR | Signal Red | `#E63329` | Opposite of front — functional contrast |
| LEFT SIDE | Signal Gold | `#F5A623` | Lateral boundary — amber warm tone |
| RIGHT SIDE | Signal Gold | `#F5A623` | Same as left — sides share a color identity |

### 6.3 Card Left-Border Accent

The segment card's left border dynamically changes to the selected boundary tag's color. This creates an instant visual scan: glance at the left edge of each card and see the boundary classification at a glance.

```tsx
// Dynamic left border based on boundaryTag
const borderColors: Record<BoundaryTag, string> = {
  front:      'border-l-[#1B3FC4]',
  rear:       'border-l-[#E63329]',
  left_side:  'border-l-[#F5A623]',
  right_side: 'border-l-[#F5A623]',
}

<div className={`
  bg-card border border-border rounded-r-xl
  border-l-[3px] ${borderColors[segment.boundaryTag]}
  p-3
`}>
```

### 6.4 3D Viewport ↔ Boundary Tag Sync

When a boundary tag changes in the UI panel:

1. The segment card's left border updates instantly.
2. `recompute()` fires → `LotEdge.boundaryTag` updates.
3. In the 3D viewport, `BoundaryEdgeLines` re-renders with the new color on that edge.
4. The `SetbackOverlay` recalculates (setback distance may differ per boundary type).

When a user clicks an edge line in the 3D viewport:

1. The corresponding segment card scrolls into view and highlights (subtle pulse).
2. The boundary tag selector in that card receives focus — inviting the user to change it.
3. This bidirectional sync (panel ↔ viewport) is the core interaction loop.

### 6.5 Validation: Boundary Tag Completeness

The compliance engine needs at least one `front` edge to compute front setbacks. The system warns (but does not block) if:

- No segment is tagged `front` → Amber warning below segment list: "No front boundary tagged. Front setback will default to the longest edge."
- No segment is tagged `rear` → Amber warning: "No rear boundary tagged. Rear setback will default to the edge opposite the front."
- All segments tagged the same → Amber warning: "All segments have the same boundary tag. Setback computation requires at least front and rear designations."

These are inline warnings, NOT blocking modals. Students can proceed — the compliance engine will use intelligent defaults (longest edge = front, opposite edge = rear).

---

## 7. 3D Viewport Feedback Loop

### 7.1 What the Viewport Shows

The 3D viewport for the LotConfigurator renders these layers (bottom to top):

| Layer | Y Position | Content | When Visible |
|---|---|---|---|
| Ground plane | 0.000 | Light neutral surface | Always |
| Lot polygon mesh | 0.001 | Filled polygon, `#E8E4DB` (cream) | When ≥3 segments |
| Setback zone | 0.005 | Semi-transparent red overlay | When polygon is closed |
| Buildable area | 0.006 | Semi-transparent blue overlay | When polygon is closed |
| Boundary edge lines | 0.020 | Color-coded lines per boundary tag | When ≥2 segments |
| Dimension labels | 0.150 | Distance value per edge (Html) | Toggle: on by default |
| Boundary tag labels | 0.300 | "FRONT", "REAR", etc. (Html) | Toggle: on by default |
| Closure gap line | 0.020 | Dashed line from last vertex to origin | When polygon is NOT closed |
| Vertex markers | 0.030 | Small circles at each computed vertex | When ≥2 segments |

### 7.2 Real-Time Polygon Preview

The polygon updates on every input change. This means:

- User types `6` in the degrees field → azimuth recalculates → polygon vertex moves → mesh re-renders.
- Latency budget: **< 16ms** from input change to visual update (one frame at 60fps).
- The `recompute()` function must be fast enough to run synchronously in an input handler. For up to 20 segments, this is trivial (pure math, no allocation-heavy operations).

### 7.3 Open Polygon Rendering (Before Closure)

When the polygon is NOT closed (closure error > tolerance), the viewport shows:

- **Solid lines** for all entered segments (color-coded by boundary tag).
- **Dashed line** from the last computed vertex back to the origin, in `text-muted-foreground` (#9B9B9B).
- **Gap distance label** at the midpoint of the dashed line: `"Gap: 2.45m"` in a red-bordered pill.
- **No filled polygon mesh** — the shape is rendered as an open polyline only. No area computation displayed. This visual absence reinforces "your shape isn't complete yet."

### 7.4 Closed Polygon Rendering

When closed (closure error < tolerance):

- Filled polygon mesh appears (cream fill).
- Setback overlay activates (red tint for setback zone, blue tint for buildable area).
- Gap line disappears.
- Summary footer shows computed area and perimeter.

### 7.5 Camera Behavior

The LotConfigurator uses a **plan-view-biased** camera preset:

```tsx
<OrbitControls
  makeDefault
  enablePan={true}
  minDistance={5}
  maxDistance={80}
  // Start with a slightly angled view so the lot looks 3D
  // but close to plan view for precision work
  minPolarAngle={0}
  maxPolarAngle={Math.PI / 2.2}  // prevent going under ground
/>
```

**Initial camera position:** Computed from the lot's bounding box — camera centers on the lot centroid, pulls back enough to show the entire polygon with 20% padding.

**Auto-reframe on significant change:** When the bounding box changes by more than 30%, the camera smoothly transitions (lerp over 500ms) to re-center. This prevents the polygon from drifting off-screen as the user adds segments.

### 7.6 Edge Selection Interaction

Clicking a boundary edge line in the 3D viewport:

1. Edge line thickens (lineWidth: 2 → 4).
2. The boundary tag label for that edge gains a white background with shadow (elevated).
3. The corresponding segment card in the panel scrolls into view and highlights.
4. `selectedEdgeId` state updates in the store, syncing panel and viewport.

Clicking empty space (Canvas `onPointerMissed`) deselects any active edge.

---

## 8. Closure Feedback System

Closure is the moment of truth. The student needs clear, honest, immediate feedback about whether their lot "closes" — and what to do if it doesn't.

### 8.1 The ClosureStatusBadge Component

```
Three states:

1. OPEN (error > tolerance)
┌─────────────────────────────────────────────┐
│  ●  Gap: 2.45m                              │
│     The polygon does not close.             │
│     Check your bearings and distances.      │
└─────────────────────────────────────────────┘
  Badge dot: signal-red
  Background: bg-red-50 dark:bg-red-950/20
  Border: border-red-200 dark:border-red-800
  Text: font-sans text-xs

2. CLOSED WITHIN TOLERANCE (error < tolerance)
┌─────────────────────────────────────────────┐
│  ●  Closed — error: 0.02m (1:6000)         │
│     ☐ Apply Bowditch adjustment             │
└─────────────────────────────────────────────┘
  Badge dot: signal-green
  Background: bg-green-50 dark:bg-green-950/20
  Border: border-green-200 dark:border-green-800
  Text: font-sans text-xs
  Ratio: font-mono text-[10px] text-muted-foreground

3. ADJUSTED (Bowditch applied)
┌─────────────────────────────────────────────┐
│  ●  Adjusted — original error: 0.02m       │
│     Bowditch (Compass Rule) applied.        │
└─────────────────────────────────────────────┘
  Badge dot: primary (cobalt)
  Background: bg-blue-50 dark:bg-blue-950/20
  Border: border-blue-200 dark:border-blue-800
```

### 8.2 The Bowditch Toggle

Appears only when the polygon is closed within tolerance. It is a checkbox (not a toggle switch) because it's a secondary refinement, not a primary action.

```
☐ Apply Bowditch adjustment
  font-sans text-xs text-muted-foreground
  Checkbox: 16×16px, standard Shadcn checkbox
```

When checked:

- `setAutoAdjust(true)` → `recompute()` fires with adjusted vertices.
- The 3D polygon shifts subtly (vertices move by fractions of a meter).
- The closure error in the badge updates to show the original error.
- The summary footer area value may shift by a tiny amount (0.01-0.1 sq.m.).

### 8.3 Closure Error Thresholds

| Error / Perimeter Ratio | Status | Color | Action |
|---|---|---|---|
| < 1/10,000 | Excellent | Green | Auto-close, no badge needed |
| < 1/5,000 | Good (survey standard) | Green | Bowditch offered |
| < 1/1,000 | Acceptable | Amber | Bowditch recommended |
| ≥ 1/1,000 | Unacceptable | Red | "Check your inputs" |

---

## 9. States: Empty, Loading, Error, Success

### 9.1 Empty State — Surveyor Mode First Visit

When a student first switches to Surveyor Mode, there are no segments yet.

```
┌─────────────────────────────────────────────────────┐
│  ┌────────────────────┬────────────────────────┐    │
│  │   ▦ Basic Lot      │   ◎ Surveyor Plot  ●   │    │
│  └────────────────────┴────────────────────────┘    │
│                                                     │
│          ◎                                          │
│    Plot your exact lot                              │
│    from your land title.                            │
│                                                     │
│    Enter bearing and distance                       │
│    for each boundary segment.                       │
│                                                     │
│    [＋ Add First Segment]          ← primary button  │
│                                                     │
│    or load a  [Sample Lot ▾]       ← ghost link     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Empty state rules (per SlateCamp UX Designer skill):**

- Never "No data found." or blank screen.
- Honest observation + clear next step: "Plot your exact lot from your land title."
- Two entry paths: manual entry (primary) and sample lot (secondary).
- The compass icon (◎) centers the empty state visually.

### 9.2 Loading State

The geometry computation is synchronous and < 1ms for any reasonable segment count, so there is no loading state for the polygon itself. However, if a Sample Lot preset loads with a brief data fetch (future: loading from a saved lot), use a skeleton:

```
Skeleton: 3 segment card placeholders
  bg-muted rounded-xl h-[80px] animate-pulse
  Staggered animation-delay: 0ms, 40ms, 80ms
```

### 9.3 Error States

**Per-field validation errors:**

| Field | Validation | Error Display |
|---|---|---|
| Degrees | > 90 | Red border + "Max 90°" below field |
| Minutes | > 59 | Red border + "Max 59'" below field |
| Seconds | > 59 | Red border + 'Max 59"' below field |
| Distance | ≤ 0 | Red border + "Must be > 0" below field |
| Distance | > 10,000 | Red border + "Check value" below field |

**Polygon-level errors:**

| Condition | Display |
|---|---|
| < 3 segments | Summary footer: "Add at least 3 segments to form a polygon." |
| Self-intersecting | Amber banner above closure badge: "Polygon edges cross each other. Check segment order." |
| Zero-area polygon | Amber banner: "All points are collinear. The polygon has no area." |

**Error styling (per design system):**

```
Field errors:
  border: border-signal-red
  message: font-sans text-[11px] text-signal-red mt-1

Banner errors:
  bg-amber-50 dark:bg-amber-950/20
  border border-amber-200 dark:border-amber-800
  rounded-lg p-3
  font-sans text-xs text-amber-900 dark:text-amber-200
```

### 9.4 Success State

When the polygon is closed and boundary tags are complete:

- ClosureStatusBadge shows green.
- Summary footer displays area, perimeter, and segment count.
- The 3D viewport shows the full polygon with setback overlay.
- No celebration animation (per anti-gamification rule). The successful polygon IS the reward — the student can now see their lot in 3D with compliance overlays.

---

## 10. Mobile Adaptation

### 10.1 Device Context

SlateCamp's median user is on a 6–6.5" mid-range Android. The LotConfigurator module follows the standard 3D Lab mobile layout: **full-width canvas on top, draggable bottom sheet for controls**.

### 10.2 Mobile Layout

```
┌────────────────────────────────┐
│                                │
│                                │
│        3D Canvas               │
│        (full width, ~55vh)     │
│                                │
│                                │
├────────────────────────────────┤
│  ═══ drag handle ═══           │  ← bottom sheet handle
│                                │
│  ┌────────────┬───────────┐    │
│  │ ▦ Basic    │ ◎ Survey  │    │
│  └────────────┴───────────┘    │
│                                │
│  [Segment cards — scrollable]  │
│                                │
│  [＋ Add Segment]              │
│                                │
│  [Closure + Summary]           │
│                                │
└────────────────────────────────┘
```

### 10.3 Mobile-Specific Adjustments

**Bottom sheet behavior:**

- Default: collapsed, showing only the mode toggle and first segment.
- Drag up: expands to ~70% of screen height.
- Full expand: 90% of screen height (canvas becomes a thin strip).
- Collapse gesture: drag handle down, or swipe down from sheet header.

**Bearing input on mobile:**

The inline bearing fields become too cramped on < 375px width screens. On mobile, the bearing row wraps to two lines:

```
Line 1: [N ▾]  [65]° [30]' [00]" [E ▾]
Line 2: Distance: [45.00] m
```

The N/S and E/W selectors use the **native mobile picker** (not custom dropdowns) for better touch targets and familiar behavior.

**Segment reordering on mobile:**

Long-press (300ms) on the drag handle activates drag mode. Haptic feedback on drag start if available. Drop zones are rendered as 4px-high cobalt lines between cards.

**Touch targets audit:**

| Element | Minimum Touch Area | Notes |
|---|---|---|
| N/S dropdown | 44×36px | Meets minimum |
| Degree/minute/second fields | 40×36px | Borderline — add 4px horizontal padding |
| E/W dropdown | 44×36px | Meets minimum |
| Boundary tag pills | 56×28px | Meets width, HEIGHT IS 28px — add 8px vertical padding for 36px hit area |
| Delete segment ✕ | 44×44px | Invisible padding around 12px icon |
| Drag handle ⠿ | 44×44px | Invisible padding around 16px icon |
| Add Segment button | Full width × 44px | Meets minimum |

---

## 11. Component Specifications

### 11.1 Component Tree

```
LotParametersPanel
├── ModeToggle (segmented control)
├── [mode === 'rectangle']
│   └── BasicLotInputs
│       ├── WidthInput
│       └── DepthInput
├── [mode === 'surveyor']
│   └── SurveyorLotInputs
│       ├── EmptyState (when segments.length === 0)
│       ├── SortableSegmentList (when segments.length > 0)
│       │   └── SegmentInputCard × N
│       │       ├── DragHandle
│       │       ├── SegmentIndex
│       │       ├── BearingInput
│       │       │   ├── BaseDirectionSelect (N/S)
│       │       │   ├── DegreesInput
│       │       │   ├── MinutesInput
│       │       │   ├── SecondsInput
│       │       │   └── TurnDirectionSelect (E/W)
│       │       ├── DistanceInput
│       │       ├── BoundaryTagSelector
│       │       └── DeleteButton
│       ├── AddSegmentButton
│       ├── SampleLotsDropdown
│       └── ClosureStatusBadge
└── LotSummaryFooter
```

### 11.2 Key Component Props Interfaces

```typescript
// ModeToggle
interface ModeToggleProps {
  mode: LotMode
  onModeChange: (mode: LotMode) => void
}

// SegmentInputCard
interface SegmentInputCardProps {
  segment: LotSegment
  index: number
  isSelected: boolean           // synced with 3D viewport edge selection
  onUpdate: (patch: Partial<LotSegment>) => void
  onDelete: () => void
  canDelete: boolean            // false when segments.length <= 3
}

// BearingInput
interface BearingInputProps {
  bearing: SurveyorBearing
  onChange: (bearing: SurveyorBearing) => void
  hasError: boolean
}

// BoundaryTagSelector
interface BoundaryTagSelectorProps {
  value: BoundaryTag
  onChange: (tag: BoundaryTag) => void
}

// ClosureStatusBadge
interface ClosureStatusBadgeProps {
  closure: ClosureResult | null
  autoAdjust: boolean
  onAutoAdjustChange: (v: boolean) => void
}

// LotSummaryFooter
interface LotSummaryFooterProps {
  mode: LotMode
  area: number | null           // null when polygon invalid
  perimeter?: number
  segmentCount?: number
  width?: number                // rectangle mode only
  depth?: number                // rectangle mode only
}
```

### 11.3 Typography Map (Applied Design System Tokens)

| Element | Font | Class |
|---|---|---|
| Section eyebrow (LOT DIMENSIONS, etc.) | DM Mono | `font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground` |
| Input label (Width, Degrees, etc.) | Inter | `font-sans text-xs text-muted-foreground` |
| Input value | DM Mono | `font-mono text-sm tabular-nums text-foreground` |
| Segment index | DM Mono | `font-mono text-[10px] font-medium text-muted-foreground` |
| Boundary tag pill text | DM Mono | `font-mono text-[9px] font-medium uppercase` |
| Closure status text | Inter | `font-sans text-xs` |
| Summary stat value | DM Mono | `font-mono text-sm font-medium tabular-nums` |
| Summary stat label | Inter | `font-sans text-xs text-muted-foreground` |
| Error message | Inter | `font-sans text-[11px] text-signal-red` |
| Helper text | Inter | `font-sans text-xs text-muted-foreground` |

---

## 12. Interaction Choreography

### 12.1 Complete User Flow: Entering a Lot from a Land Title

This is the primary use case. A student has their TCT/OCT document and wants to plot it.

```
Step 1: Student opens LotConfigurator module in 3D Lab.
        → Sees Basic Lot mode (default) with width/depth inputs.
        → Canvas shows a simple rectangle.

Step 2: Student clicks "Surveyor Plot" in the mode toggle.
        → Panel transitions to Surveyor Mode.
        → Empty state appears: "Plot your exact lot from your land title."
        → Canvas clears the rectangle, shows empty ground plane.

Step 3: Student clicks "Add First Segment."
        → First segment card appears with defaults.
        → Degrees field auto-focused.
        → Canvas shows a single dot at origin.

Step 4: Student reads their title: "N. 65° 30' E., 45.00 m."
        → Types: N (already selected), 65, 30, 00, E (already selected), 45
        → Each field auto-advances on complete entry.
        → Canvas shows a single line extending NE from origin.

Step 5: Student clicks "+ Add Segment" and enters the second bearing.
        → "S. 25° 00' E., 30.00 m."
        → Canvas now shows two connected lines.
        → A dashed line appears from the endpoint back to origin.
        → "Gap: 52.3m" label visible.

Step 6: Student enters all remaining segments (3rd, 4th, maybe 5th).
        → With each addition, the polygon shape becomes clearer.
        → The gap line shortens with each segment.

Step 7: Last segment entered. Gap shrinks to 0.02m.
        → ClosureStatusBadge turns green: "Closed — error: 0.02m"
        → Filled polygon mesh appears instantly.
        → Student sees their actual lot shape for the first time in 3D.

Step 8: Student assigns boundary tags.
        → Clicks each segment card, selects Front/Rear/Left/Right.
        → Edge lines in viewport change color as tags are assigned.
        → Setback overlay appears once tags are set.
        → Left border accent on each card matches the tag color.

Step 9: Student reviews the summary footer.
        → Area: 675.32 sq.m.
        → Perimeter: 120.00 m
        → Compares with title area to verify accuracy.

Step 10: Student proceeds to compliance computations.
         → AMBF, PSO, TGFA automatically computed using polygon area
            and per-edge setback distances from boundary tags.
         → The student sees the buildable envelope on their real lot shape.
```

### 12.2 Edge Click → Panel Scroll Sync

When a user clicks an edge in the 3D viewport:

1. **Frame 0:** Edge click detected via R3F `onClick` on the `<Line>` mesh.
2. **Frame 1:** `setSelectedEdgeId(segmentId)` fires in the store.
3. **Frame 2:** Edge line re-renders with `lineWidth: 4`, tag label gains shadow.
4. **Frame 3:** In the panel, `SegmentInputCard` with matching ID receives `isSelected=true`.
5. **Frame 4:** `scrollIntoView({ behavior: 'smooth', block: 'center' })` triggers.
6. **Frame 5:** Card highlights with a subtle scale-up or border glow (200ms transition).

Total time: < 100ms from click to visual response in both viewport and panel.

### 12.3 Keyboard Shortcuts (Desktop Only)

| Key | Action | Context |
|---|---|---|
| `Tab` | Advance to next input field | Within segment card |
| `Enter` | Add new segment | When focused on last field of last segment |
| `Delete` / `Backspace` | Delete focused segment | When drag handle is focused |
| `Escape` | Deselect edge / close dropdown | Global within module |
| `1–4` | Quick-set boundary tag | When segment card is focused (1=Front, 2=Rear, 3=Left, 4=Right) |

---

## 13. Accessibility Audit

### 13.1 WCAG 2.1 AA Compliance Checklist

| Requirement | Status | Implementation |
|---|---|---|
| 4.5:1 contrast ratio (text) | ✅ | All text uses `text-foreground` or `text-muted-foreground` per design system |
| 3:1 contrast ratio (UI) | ✅ | Boundary tag colors against `bg-card` all exceed 3:1 |
| 44×44px touch targets | ⚠️ | Bearing sub-fields (40px wide) need 4px horizontal padding buffer |
| Color not sole indicator | ✅ | Boundary tags use color + text label ("FRONT", "REAR", etc.) |
| Focus visible | ✅ | All inputs use browser-native focus ring + `focus-visible:ring-2 ring-primary` |
| Screen reader | ✅ | See aria labeling below |
| Keyboard navigable | ✅ | Full tab order defined; shortcuts documented |

### 13.2 ARIA Labeling

```tsx
// Mode toggle
<div role="radiogroup" aria-label="Lot input mode">
  <button role="radio" aria-checked={mode === 'rectangle'}>Basic Lot</button>
  <button role="radio" aria-checked={mode === 'surveyor'}>Surveyor Plot</button>
</div>

// Segment card
<fieldset aria-label={`Boundary segment ${index + 1}`}>
  <legend className="sr-only">Segment {index + 1}: bearing and distance</legend>
  ...
</fieldset>

// Bearing input
<div role="group" aria-label="Surveyor bearing">
  <select aria-label="Base direction (North or South)">...</select>
  <input aria-label="Degrees" type="number" />
  <input aria-label="Minutes" type="number" />
  <input aria-label="Seconds" type="number" />
  <select aria-label="Turn direction (East or West)">...</select>
</div>

// Boundary tag selector
<div role="radiogroup" aria-label="Boundary type">
  <button role="radio" aria-checked={tag === 'front'}>Front (Road)</button>
  <button role="radio" aria-checked={tag === 'rear'}>Rear</button>
  <button role="radio" aria-checked={tag === 'left_side'}>Left Side</button>
  <button role="radio" aria-checked={tag === 'right_side'}>Right Side</button>
</div>

// Closure status (live region)
<div aria-live="polite" aria-label="Polygon closure status">
  {closure.isClosed ? `Polygon closed, error ${closure.closureErrorMeters.toFixed(2)} meters` :
   `Polygon open, gap ${closure.closureErrorMeters.toFixed(2)} meters`}
</div>

// Summary footer
<dl aria-label="Lot summary">
  <dt>Area</dt><dd>{area} square meters</dd>
  <dt>Perimeter</dt><dd>{perimeter} meters</dd>
</dl>
```

### 13.3 Reduced Motion

For users with `prefers-reduced-motion: reduce`:

- Disable the camera auto-reframe lerp — snap immediately.
- Disable the segment card drag animation — snap on drop.
- Disable the closure badge state transition — change instantly.
- Keep the polygon mesh updates instant (they already are — no animation).

---

## 14. Implementation Phases by UX Impact

This section reorders the technical implementation plan from the companion document by **user-facing impact**, ensuring that each phase delivers a testable, demonstrable improvement.

### Phase 1: Foundation — Mode Toggle + Basic Mode Polish (Day 1–2)

**What ships:**

- `LotParametersPanel` with `ModeToggle` segmented control.
- `BasicLotInputs` extracted from existing code with improved typography (eyebrows, labels, summary footer).
- Zustand store extended with `mode` and `setMode()`.

**What the student sees:**

- The Lot Parameters panel looks cleaner and more intentional.
- A "Surveyor Plot" option appears in the toggle but switches to an empty state (coming soon).
- Basic Lot behavior is pixel-identical to before (zero regression).

**UX validation:** Screenshot diff the Basic Lot output before/after. Must be functionally identical.

### Phase 2: Geometry Library + Store (Day 2–4)

**What ships:**

- `bearing.ts`, `polygon.ts`, `bowditch.ts` — pure math library.
- Zustand store extended with `surveyor` state, `addSegment`, `updateSegment`, `removeSegment`, `recompute`.
- Unit tests for all geometry functions.

**What the student sees:** Nothing yet. This is invisible infrastructure.

**UX validation:** Feed a known TCT lot description through the functions. Computed area must match title area within 0.1%.

### Phase 3: The First Visible Polygon (Day 4–6)

**What ships:**

- `LotPolygonMesh` component renders any polygon on the ground plane.
- `BoundaryEdgeLines` renders color-coded edges.
- Surveyor Mode panel with `SurveyorLotInputs`, `SegmentInputCard`, `BearingInput`.
- Live polygon preview in 3D viewport as segments are entered.

**What the student sees:**

- Switch to Surveyor Mode → add segments → see the lot shape appear in real time.
- Edge lines colored by boundary tag.
- Dashed closure gap line when polygon is open.

**UX validation:** Enter the Appendix A parallelogram lot. The polygon should visually match and close.

### Phase 4: Closure + Summary + Polish (Day 6–8)

**What ships:**

- `ClosureStatusBadge` with green/amber/red states.
- Bowditch adjustment toggle.
- `LotSummaryFooter` showing area, perimeter, segment count.
- Edge click → panel scroll sync.
- Keyboard shortcuts.
- `SetbackOverlay` for the setback zone visualization.

**What the student sees:**

- Full feedback loop: enter bearings → see polygon → check closure → review area → see setbacks.
- Click an edge in 3D → corresponding segment card highlights.
- Boundary tags directly affect the setback overlay colors and distances.

**UX validation:** Complete the full user flow from Section 12.1. Every step should feel responsive and clear.

### Phase 5: Compliance Bridge + Presets (Day 8–11)

**What ships:**

- `lot-bridge.ts` — adapter connecting polygon data to compliance engine.
- `inset.ts` — polygon offset for setback computation on irregular shapes.
- AMBF, PSO, TGFA computations working on polygon area.
- Sample Lot presets dropdown.
- Segment reordering via drag-and-drop.

**What the student sees:**

- Development Controls (AMBF, PSO, TGFA) now compute correctly for irregular lots.
- Can load sample lots to experiment.
- Can reorder segments by dragging.

**UX validation:** Compare rectangular lot compliance values before/after. Must be identical. Test irregular lot setbacks against hand-calculated values.

### Phase 6: Mobile + Edge Cases + Accessibility (Day 11–14)

**What ships:**

- Bottom sheet adaptation for mobile.
- Mobile bearing input layout (two-line wrap).
- Long-press drag on mobile.
- Self-intersecting polygon detection.
- ARIA labeling and screen reader testing.
- Reduced motion support.
- Error states for all edge cases.

**What the student sees:**

- Full feature works on a 6" phone.
- Errors are caught and explained clearly.
- Screen readers can navigate the segment list and understand the form.

**UX validation:** Run the full flow on a Samsung Galaxy A15. Every touch target must be hittable. VoiceOver/TalkBack must announce segment content.

---

## 15. Design Review Checklist

Before this feature ships, validate every item:

**Purpose:**

- [ ] Does the Surveyor Mode serve the core learning objective (ALE Area C lot plotting)?
- [ ] Can a student identify what to do next within 5 seconds of switching to Surveyor Mode?
- [ ] Does the empty state provide a clear first action?

**Hierarchy:**

- [ ] Is the mode toggle the dominant navigational element in the panel?
- [ ] Is the Add Segment button visually secondary to the segment cards?
- [ ] Is the Closure Status Badge prominent enough to notice but not anxiety-inducing?

**Consistency with SlateCamp Design System:**

- [ ] All eyebrows use `font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground`?
- [ ] All numeric values use `font-mono tabular-nums`?
- [ ] Card anatomy follows the standard pattern (eyebrow → title → content → footer)?
- [ ] Left-border accent cards used for action cards (segment cards)?
- [ ] Signal colors used correctly: red = functional error only, gold = in-progress, green = success, cobalt = primary action?
- [ ] No gamification debris: no confetti on close, no badges, no streaks?

**States:**

- [ ] Empty state present and helpful (not "No data found")?
- [ ] Loading state present (skeleton) for any async operations?
- [ ] Error states present for all validation scenarios?
- [ ] Error messages are honest and actionable ("Check your bearings" not "Error 4012")?

**Backward Compatibility:**

- [ ] Basic Lot mode produces identical compliance values as before?
- [ ] Switching modes does not reset the other mode's data?
- [ ] The 3D viewport renders rectangles identically to the pre-feature state?

**Accessibility:**

- [ ] 4.5:1 contrast ratio met on all text?
- [ ] 44×44px touch targets met on all interactive elements?
- [ ] Color is never the sole indicator (boundary tags have text labels)?
- [ ] ARIA labels on all form groups and live regions?
- [ ] Keyboard navigation covers the full flow?
- [ ] Reduced motion preference respected?

**Performance:**

- [ ] Polygon recomputation < 16ms for 20 segments?
- [ ] No allocations inside `useFrame` loops?
- [ ] All geometry constructed via `useMemo` with correct deps?
- [ ] Geometry disposed on unmount?

**Mobile:**

- [ ] Full flow works on a 6" Android phone?
- [ ] Bottom sheet collapses/expands smoothly?
- [ ] Bearing input fields are usable at 375px width?
- [ ] Long-press drag works for segment reordering?

---

*This UX/UI guide is the companion document to the Custom Polygon Lot Plotting Technical Implementation Plan. The technical plan defines WHAT is built. This document defines HOW it feels, looks, and behaves for the student.*

*End of UX/UI guide.*
