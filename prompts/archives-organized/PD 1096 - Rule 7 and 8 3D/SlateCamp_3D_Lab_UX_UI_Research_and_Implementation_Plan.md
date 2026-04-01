# SlateCamp 3D Lab — UX/UI Research & Implementation Plan

**Module:** Site Development Controls — 3D Lab  
**Current Stack:** Next.js 14 · React Three Fiber · Zustand · Tailwind · Shadcn  
**Design System:** SlateCamp Design System v1 (Rams Standard)  
**Date:** April 2026  
**Version:** 2.0 — UX Overhaul  

---

## Executive Summary

The current 3D Lab interface works functionally but suffers from six systemic UX problems: information overload from unstructured side panels, no clear visual hierarchy between input controls and output metrics, missing viewport toolbars, inconsistent information density across left and right panels, no progressive disclosure, and a compliance scorecard that competes with the 3D viewport for attention rather than supporting it.

This document provides a comprehensive research-backed redesign plan grounded in industry-standard 3D software UX patterns (Blender, SketchUp, Figma, AutoCAD, Cinema 4D, OnShape), dashboard information architecture best practices, and SlateCamp's own design system principles (Rams Standard, Coach Interface philosophy, Mayer's learning principles).

---

# Part I — UX Research & Audit

## 1. Current State Audit

### 1.1 Current Layout Analysis

The current 3D Lab uses a three-column layout:

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back          Site Development Controls        0 of 0 hotspots│
├────────────┬─────────────────────────────┬───────────────────────┤
│            │                             │                       │
│  LEFT      │                             │  RIGHT                │
│  PANEL     │     3D VIEWPORT             │  PANEL                │
│  (inputs)  │                             │  (outputs)            │
│            │                             │                       │
│  ~25% w    │     ~50% w                  │  ~25% w               │
│            │                             │                       │
├────────────┴─────────────────────────────┴───────────────────────┤
│  [Orbit] [Plan] [Front] [Iso] [Dims]  ← viewport mode bar       │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 Identified UX Problems

#### Problem 1: Information Overload — Left Panel
The left panel currently contains **19+ discrete controls and data sections** in a single scrollable column:

- Presets (5 buttons)
- Lot Parameters (3 sliders + values)
- Lot Summary (2 values)
- Zoning Classification (dropdown + "Custom FLAR" link)
- Table VIII.1 Reference (6 rows)
- Floor Area Ratios section (slider + 8 computed values)
- Building Height Limit section (slider + 3 computed values)
- Firewall toggle
- Proposed Building section (3 sliders + values)

**Diagnosis:** This is approximately 3-4 screens worth of scrolling on a 1080p display. Users must scroll past controls they've already set to reach controls they need. There is no grouping hierarchy — every section has equal visual weight. This violates both Mayer's Coherence Principle and the Rams Standard ("as little design as possible").

#### Problem 2: Information Overload — Right Panel
The right panel contains **13+ output sections**:

- Layer Visibility (8 toggle checkboxes)
- TLA/AMBF/PSO/TOSL summary (4 metric cards)
- BHL display
- AMBF Three-Way Check (3 computation rows + binding indicator)
- Area Closure Identity (stacked bar + equation)
- Compliance Scorecard (8+ individual check items)
- Zone Legend
- Code Reference

**Diagnosis:** The right panel has no collapsible sections. Every piece of information is presented simultaneously at equal visual weight. The Compliance Scorecard alone contains 8 items, each with Required/Actual values and code references — this is approximately 400+ words of text competing for attention alongside the 3D viewport.

#### Problem 3: Missing Viewport Toolbar
Industry-standard 3D applications (Blender, SketchUp, AutoCAD, Cinema 4D, OnShape) universally provide a **viewport-attached toolbar** for view manipulation, rendering modes, and display options. The current 3D Lab only has a bottom bar with 5 view preset buttons (Orbit, Plan, Front, Iso, Dims). Missing:

- Zoom controls (for non-mouse users)
- Display mode toggles (wireframe, solid, x-ray)
- Measurement/dimension tool
- Screenshot/export
- Fullscreen toggle
- Grid toggle
- Gizmo/axis indicator

#### Problem 4: Layer Visibility Is Misplaced
Layer visibility toggles (Setback Zones, AMBF Envelope, TOSL Overlay, Floor Slabs, BHL Ceiling, FLAR Ceiling, Road & Grid, Context Buildings, Firewall Markers) are positioned at the top of the right panel — above the metrics. In industry-standard 3D tools:

- Layer controls are part of the **viewport** or an **overlay panel** attached to the viewport
- They are never grouped with output metrics
- They are considered **view controls**, not **data displays**

#### Problem 5: No Progressive Disclosure
All information is visible simultaneously. There is no:

- Collapsible/expandable sections
- Step-by-step guided mode
- Tab-based organization within panels
- Summary vs. detail toggle
- "Show more" / "Show less" for advanced parameters

This contradicts our own Information Design Guide which mandates 4-layer progressive disclosure (Model → Orientation Labels → Exploration → Deep Knowledge).

#### Problem 6: Compliance Scorecard Competes with Viewport
The Compliance Scorecard is the most information-dense element on screen, displaying 8+ pass/fail checks with code references. It occupies approximately 40% of the right panel's vertical space. When violations exist (red "FAIL" badges), the visual urgency of the scorecard **pulls attention away from the 3D viewport** where the student should be learning spatial relationships.

### 1.3 What's Working Well

- **Color coding** for pass/fail is clear and consistent
- **AMBF Three-Way Check** visualization is unique and pedagogically effective
- **Area Closure Identity** stacked bar is an excellent spatial representation
- **Preset buttons** provide quick scenario loading
- **View mode bar** at bottom is clean and well-positioned
- **Layer visibility** concept is correct (toggle-based)
- **FLAR slider** with zone range indicator is well-designed
- **BHL slider** with computed vs. custom indicator works
- **Violation warnings** (red text) provide clear feedback

---

## 2. Industry Research — 3D Software UI Patterns

### 2.1 Universal Layout Pattern (The Standard)

After benchmarking Blender, Cinema 4D, 3DS Max, Maya, SketchUp, OnShape, Fusion 360, and Figma, a clear universal pattern emerges:

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER BAR  (app name, file, mode selector, global actions) │
├──────┬───────────────────────────────────────────┬──────────┤
│      │  VIEWPORT TOOLBAR                         │          │
│  T   │  (view manipulation, display modes,       │  P       │
│  O   │   measurement, screenshot)                │  R       │
│  O   │                                           │  O       │
│  L   │                                           │  P       │
│      │     3D VIEWPORT                           │  E       │
│  P   │     (largest possible area)               │  R       │
│  A   │                                           │  T       │
│  L   │                                           │  I       │
│  E   │                                           │  E       │
│  T   │                                           │  S       │
│  T   │                                           │          │
│  E   ├───────────────────────────────────────────┤  /       │
│      │  STATUS BAR / TIMELINE / INFO BAR         │  I       │
│      │  (measurements, status, coordinates)      │  N       │
│      │                                           │  S       │
├──────┴───────────────────────────────────────────┴──────────┤
│  OPTIONAL: Bottom panel (console, timeline, spreadsheet)     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Key Patterns Observed

#### Pattern 1: Viewport Gets Maximum Space
In every benchmarked application, the 3D viewport occupies **60-75% of total screen area**. Side panels are narrow (200-300px each) and collapsible. Our current 3D Lab gives the viewport approximately 50% — the panels are too wide.

#### Pattern 2: Left = Tools/Inputs, Right = Properties/Outputs
This is universal. The left side contains active tools (selection, transformation, creation). The right side contains passive properties (dimensions, materials, computed values). Our current layout aligns with this pattern — left for inputs, right for outputs — but needs better organization within each panel.

#### Pattern 3: Viewport-Attached Controls
View manipulation controls are **always** attached to or overlaid on the viewport, never in a separate panel. This includes: view presets (top, front, side, perspective), display mode toggles, zoom controls, axis gizmos, and grid toggles.

#### Pattern 4: Collapsible Sections with Icons
Properties panels in Blender, C4D, and OnShape use **icon-labeled collapsible sections**. Each section has a small icon + label header that can be collapsed. This allows users to have all sections visible at a glance while only expanding what they need.

#### Pattern 5: Tab-Based Panel Organization
When a panel has too many sections, industry tools use **tabs** at the top of the panel. Blender uses icon tabs in the Properties panel. C4D uses text tabs. Figma uses a single panel with mode-dependent content. This prevents the "infinite scroll" problem.

#### Pattern 6: Status Bar for Live Metrics
A persistent status bar at the bottom of the viewport shows real-time metrics: cursor position, selected element properties, measurement values. In our context, this would be the ideal location for TLA/AMBF/PSO/TOSL live summary values.

#### Pattern 7: Floating Overlays for Contextual Info
Modern tools (Figma, OnShape) use floating overlays/panels for information that is contextual — needed sometimes but not always. Layer controls, measurement results, and quick-reference data use floating panels that can be opened/closed without affecting the main layout.

### 2.3 Dashboard Information Architecture Patterns

From the dashboard research, these patterns apply to our information-dense right panel:

- **KPI Cards at the top:** The 3-5 most important numbers should be visible without scrolling — in our case: TLA, AMBF, PSO, TOSL, BHL
- **Progressive disclosure:** Summary first, details on demand. The Compliance Scorecard should show a single overall status (e.g., "3 of 8 checks pass") with expandable detail
- **Color as signal, not decoration:** Red/green only for pass/fail states. Everything else is neutral
- **Group related metrics:** AMBF Three-Way Check and Area Closure Identity are related — group them
- **No more than 5-6 cards in initial view:** Our right panel has 13+ sections — this must be reduced to ~5 visible groups

---

## 3. Figma UI3 Lessons Applied

Figma's 2024 UI3 redesign provides directly applicable lessons:

1. **Fixed panels beat floating panels** for power users who spend hours in the tool. Floating panels "cramped the canvas" and "slowed people down." Our panels should be fixed but **collapsible**.

2. **Minimize UI mode** — a single toggle that collapses both side panels, giving the viewport 100% width. Essential for focused exploration.

3. **Clean hierarchy leaves room for growth** — "Before the redesign, we found ourselves playing Tetris while fitting in new features." Our panel redesign must leave logical space for future parameters (e.g., parking computation, easement zones).

4. **Toolbars float at the bottom** of all Figma products. Our view mode bar is already at the bottom — this is correct. We should enhance it.

---

# Part II — Proposed UX Architecture

## 4. New Layout Architecture

### 4.1 Desktop Layout (≥1280px)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Back   Site Development Controls   [LAB|EXAM]   [?] [⚙] [🔲]    │
├──────────┬──────────────────────────────────────────────┬────────────┤
│          │ ┌──────────────────────────────────────────┐ │            │
│  INPUT   │ │  VIEWPORT TOOLBAR (floating top-left)    │ │  OUTPUT    │
│  PANEL   │ │  [Grid] [Dims] [X-ray] [Layers▾] [📷]   │ │  PANEL     │
│          │ │                                          │ │            │
│  240px   │ │                                          │ │  280px     │
│  fixed   │ │          3D VIEWPORT                     │ │  fixed     │
│  collaps │ │          (maximized)                     │ │  collaps   │
│          │ │                                          │ │            │
│          │ │                         ┌─────────┐      │ │            │
│          │ │                         │  AXIS   │      │ │            │
│          │ │                         │  GIZMO  │      │ │            │
│          │ └──────────────────────────────────────────┘ │            │
│          │ ┌──────────────────────────────────────────┐ │            │
│          │ │  KPI BAR: TLA 300 │ AMBF 136 │ PSO 45.3%│ │            │
│          │ │  [Orbit] [Plan] [Front] [Iso] [Fullscr]  │ │            │
│          │ └──────────────────────────────────────────┘ │            │
├──────────┴──────────────────────────────────────────────┴────────────┤
│  STATUS: R-1 Low-Density Residential · FLAR 2.20 · BHL 5F/15m       │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 Key Architectural Changes

| Change | Before | After | Rationale |
|---|---|---|---|
| **Viewport width** | ~50% | ~60-65% | Industry standard; model is the primary learning object |
| **Panel width** | ~25% each | 240px left, 280px right | Fixed pixel widths prevent panels from stealing viewport space |
| **Panel collapse** | Not possible | Toggle buttons on panel edges | Allows fullscreen viewport exploration |
| **KPI bar** | Embedded in right panel | Viewport-attached bottom bar | Always visible, never scrolled past |
| **Layer controls** | Top of right panel | Viewport overlay dropdown | They're view controls, not data |
| **Status bar** | None | Bottom of screen | Persistent context (zone, FLAR, BHL) |
| **Viewport toolbar** | Bottom bar only | Top-left floating + bottom bar | Industry-standard viewport controls |

### 4.3 Minimize UI Mode

A single keyboard shortcut (Tab or Ctrl+M) or button toggles both panels, giving the viewport 100% width. This is critical for:

- Focused 3D exploration
- Screenshot/presentation mode
- Mobile/tablet fallback
- Students who want to study the geometry without UI distraction

---

## 5. Input Panel Redesign (Left Panel)

### 5.1 Tab-Based Organization

Replace the single scrollable column with **3 tabs**:

```
┌─────────────────────────┐
│  [📐 Lot] [🏗 Build] [⚙]│  ← Icon tabs
├─────────────────────────┤
│                         │
│  Tab content area       │
│  (no scroll needed      │
│   within each tab)      │
│                         │
└─────────────────────────┘
```

#### Tab 1: 📐 Lot (Site Parameters)

```
LOT PARAMETERS
┌─────────────────────────┐
│  PRESETS                 │
│  [R-1 Sub] [R-2 Row]    │
│  [C-1 Com] [Narrow]     │
│  [Max Ht]  [Reset]      │
├─────────────────────────┤
│  LOT DIMENSIONS          │
│  Width    ═══●═══  20.0m │
│  Depth    ═══●═══  15.0m │
│  RROW     ═══●═══  10.0m │
│                          │
│  Area:     300.0 sq.m.   │
│  Frontage: 20.0 m        │
├─────────────────────────┤
│  ZONING         [CUSTOM] │
│  [R-1 Low-Density Res ▾] │
│                          │
│  ┌─ TABLE VIII.1 ──────┐ │
│  │ PSO   N/A (setback)  │ │
│  │ ISA   30% of TLA     │ │
│  │ USA   15% of TLA     │ │
│  │ TOSL  45% of TLA     │ │
│  │ BHL   3F / 10m       │ │
│  │ FLAR  2.20 (1.5–1.5) │ │
│  └──────────────────────┘ │
└──────────────────────────┘
```

#### Tab 2: 🏗 Building (Proposed Building)

```
BUILDING PARAMETERS
┌─────────────────────────┐
│  FLOOR AREA RATIO        │
│  FLAR    ═══●═══  2.20  │
│  Zone: 1.50              │
│  ⚠ Outside zone range   │
│                          │
│  ┌─ FLAR DETAILS ──▾──┐ │
│  │ FLAR applied   2.20 │ │
│  │ GFA allowable  660  │ │
│  │ TGFA (FLAR)    990  │ │
│  │ TGFA (BHL)     680  │ │ 
│  │ TGFA (govern)  680  │ │
│  │ Max floors     5F   │ │
│  └─────────────────────┘ │
├─────────────────────────┤
│  BUILDING HEIGHT LIMIT   │
│  BHL  ═══●═══  5F/15.0m │
│  Computed: 3F (zone: 3F) │
│  ⚠ Custom BHL            │
│                          │
│  ┌─ BHL DETAILS ──▾───┐ │
│  │ BHL applied  custom │ │
│  │ AMVB      2040 cu.m │ │
│  │ Prop. ht    36.0m   │ │
│  └─────────────────────┘ │
├─────────────────────────┤
│  PROPOSED BUILDING       │
│  Width   ═══●═══  12.0m │
│  Depth   ═══●═══   6.0m │
│  Floors  ═══●═══   12   │
│  ⚠ Exceeds BHL (5 stys) │
│  Flr-Flr ═══●═══  3.0m │
├─────────────────────────┤
│  FIREWALL (§704.4C)      │
│  Not permitted for R-1   │
└──────────────────────────┘
```

#### Tab 3: ⚙ Settings

```
VIEW SETTINGS
┌─────────────────────────┐
│  DISPLAY                 │
│  ☑ Ground plane          │
│  ☑ Axis gizmo            │
│  ☑ Dimension labels      │
│  ☐ Wireframe mode        │
├─────────────────────────┤
│  UNITS                   │
│  [Metric ▾]              │
│                          │
│  SNAP                    │
│  ☑ Snap sliders to 0.5m │
├─────────────────────────┤
│  EXPORT                  │
│  [📷 Screenshot]         │
│  [📄 Export Report]      │
└──────────────────────────┘
```

### 5.2 Collapsible Detail Sections

Within each tab, detail sections (FLAR Details, BHL Details) are **collapsed by default** with a chevron toggle. Primary information is always visible; secondary computations are one click away. This reduces the perceived complexity from 19+ sections to ~6 visible sections per tab.

### 5.3 Slider Design Standard

All sliders follow a unified standard:

```
┌──────────────────────────────────┐
│  LABEL                    VALUE  │  ← Eyebrow label + right-aligned value
│  ═════════●══════════════        │  ← Slider track
│  Zone: 1.50     ⚠ Outside range │  ← Context line (optional, contextual)
└──────────────────────────────────┘
```

- **Label:** `font-mono text-[9px] uppercase tracking-widest text-muted-foreground`
- **Value:** `font-mono text-sm font-medium tabular-nums` — red if violating, default otherwise
- **Slider track:** 4px height, rounded, cobalt fill for active range
- **Thumb:** 16px circle, white fill, cobalt border, subtle shadow
- **Context line:** Only appears when relevant (violation, custom override, zone reference)

---

## 6. Output Panel Redesign (Right Panel)

### 6.1 Information Hierarchy (Priority Order)

The right panel is reorganized into 5 collapsible sections with a strict priority hierarchy:

```
Priority 1: COMPLIANCE STATUS        (always visible — the "score")
Priority 2: AMBF THREE-WAY CHECK     (always visible — the core pedagogical tool)
Priority 3: AREA CLOSURE IDENTITY    (always visible — spatial verification)
Priority 4: DETAILED SCORECARD       (collapsed by default — detail on demand)
Priority 5: CODE REFERENCE           (collapsed by default — reference material)
```

### 6.2 New Right Panel Structure

```
┌──────────────────────────────┐
│  COMPLIANCE STATUS  VIOLATION │  ← Overall status badge
│  ┌────────────────────────┐  │
│  │  5 of 8 PASS           │  │  ← Summary number
│  │  ██████████░░░  62.5%  │  │  ← Progress bar
│  │  3 violations found     │  │  ← Detail count
│  └────────────────────────┘  │
├──────────────────────────────┤
│  ▼ AMBF THREE-WAY CHECK      │  ← Collapsible, open by default
│  ┌────────────────────────┐  │
│  │ By Setbacks  BINDING    │  │
│  │ (W+L+R)(D+F+Rear)     │  │
│  │              136.0 sqm  │  │
│  ├────────────────────────┤  │
│  │ By PSO                  │  │
│  │ PSO% × TLA  136.0 sqm  │  │
│  ├────────────────────────┤  │
│  │ By TOSL                 │  │
│  │ (1-TOSL%) × TLA ± PSO  │  │
│  │              136.0 sqm  │  │
│  └────────────────────────┘  │
│  AMBF = min(…) = 136.0 sqm  │
│  (45.3% of TLA)             │
├──────────────────────────────┤
│  ▼ AREA CLOSURE IDENTITY     │  ← Collapsible, open by default
│  ┌────────────────────────┐  │
│  │ [■ AMBF][■ ISA][■ USA] │  │  ← Stacked bar
│  │ 136 + 90 + 74 = 300 sqm│  │
│  │                VERIFIED │  │
│  └────────────────────────┘  │
├──────────────────────────────┤
│  ▶ DETAILED SCORECARD (3 ⚠)  │  ← Collapsed by default
│    AMBF ✓  TOSL ✓  ISA ✓    │  ← Compact summary when collapsed
│    USA ✓   BHL ✗  TGFA ✗    │
│    AMVB ✗  FTF ✓  AREA ✓    │
├──────────────────────────────┤
│  ▶ CODE REFERENCE             │  ← Collapsed by default
│    PD 1096 Rules VII & VIII   │
│    2004 Revised IRR           │
└──────────────────────────────┘
```

### 6.3 Compliance Status — Redesigned

The current scorecard is detailed but overwhelming. The new design uses **summary-first, detail-on-demand**:

**Collapsed state (default):**
Shows a single overall status badge with counts. Each check is a small icon (✓ or ✗) in a tight grid. Student gets the gestalt at a glance.

**Expanded state (on click):**
Shows the full current scorecard with Required/Actual values and code references — identical to current design, but now only visible on demand.

### 6.4 Violation-Driven Attention

When violations exist:

- The Compliance Status section gets a subtle red left-border (4px, `#E63329`)
- The violated items in the compact grid pulse once (subtle animation, 1 cycle)
- A "FLAR LIMIT EXCEEDED" banner (already exists) moves from the right panel to a **viewport overlay** at the bottom of the 3D scene — this is where the spatial violation lives, so the feedback should be spatially co-located

---

## 7. Viewport Enhancements

### 7.1 Viewport Toolbar (Floating, Top-Left)

```
┌────────────────────────────────────────┐
│  [📐] [📏] [👁] [⬛] [📷] [⛶]        │
│  Grid  Dims X-ray Layers Screenshot Full│
└────────────────────────────────────────┘
```

- **Grid toggle:** Shows/hides ground grid
- **Dimension labels:** Shows/hides measurement annotations in 3D
- **X-ray mode:** Transparent building envelope to see setback volumes
- **Layers dropdown:** Opens a floating panel with all layer toggles (moved from right panel)
- **Screenshot:** Captures current viewport as PNG
- **Fullscreen:** Expands viewport to full browser window

Implementation: Floating `div` positioned `absolute top-4 left-4` within the Canvas wrapper, `z-index: 10`, glass-morphism background (`bg-black/60 backdrop-blur-sm`), icon buttons with tooltips.

### 7.2 KPI Bar (Viewport-Attached Bottom)

Replace the current view mode bar with a combined KPI + View Mode bar:

```
┌───────────────────────────────────────────────────────────────┐
│  TLA          AMBF         PSO          TOSL         BHL     │
│  300 sqm      136 sqm      45.3%        164 sqm      5F     │
│  ─────────────────────────────────────────────────────────────│
│  [⊙ Orbit] [⊞ Plan] [⊟ Front] [◇ Iso] [⊕ Dims]             │
└───────────────────────────────────────────────────────────────┘
```

**Design rationale:** The 5 key metrics (TLA, AMBF, PSO, TOSL, BHL) are the "vital signs" of the development controls computation. They must be visible at all times, regardless of panel scroll position. Attaching them to the viewport bottom ensures this. The view mode buttons remain below, creating a natural two-tier footer.

### 7.3 Axis Gizmo

Add a 3D axis orientation gizmo (top-right corner of viewport):

```
      Y
      |
      |
      +--- X
     /
    Z
```

- Standard R3F implementation using drei's `GizmoHelper` + `GizmoViewport`
- Click on axis face to snap to orthographic view (top, front, right)
- Provides spatial orientation feedback — critical for students learning 3D setback relationships

### 7.4 Layer Controls Overlay

Layer visibility toggles move from the right panel to a **floating overlay** triggered by the Layers button in the viewport toolbar:

```
┌─ LAYERS ────────────────────┐
│  ☑ Setback Zones            │
│  ☑ AMBF Envelope            │
│  ☐ TOSL Overlay             │
│  ☑ Floor Slabs              │
│  ☐ BHL Ceiling              │
│  ☐ FLAR Ceiling             │
│  ☐ Road & Grid              │
│  ☐ Context Buildings        │
│  ☐ Firewall Markers         │
│  ───────────────────────────│
│  [Show All] [Hide All]      │
└─────────────────────────────┘
```

Position: Anchored below the viewport toolbar, floating above the 3D scene. Glass-morphism background. Closes on click outside.

---

## 8. Mobile Adaptation (< 768px)

### 8.1 Mobile Layout

```
┌──────────────────────────┐
│  ← Back    Dev Controls  │
├──────────────────────────┤
│                          │
│    3D VIEWPORT           │
│    (full width)          │
│    (60vh height)         │
│                          │
│  ┌────────────────────┐  │
│  │ KPI: TLA AMBF PSO  │  │
│  │ [Orbit][Plan][Iso]  │  │
│  └────────────────────┘  │
├──────────────────────────┤
│  ┌────────────────────┐  │
│  │ BOTTOM SHEET        │  │
│  │ Drag handle ═══     │  │
│  │                     │  │
│  │ [📐 Lot] [🏗 Build] │  │
│  │ [📊 Results] [⚙]   │  │
│  │                     │  │
│  │ (tab content)       │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

### 8.2 Mobile-Specific Decisions

- **Bottom sheet:** All controls and outputs collapse into a draggable bottom sheet with 4 tabs (Lot, Building, Results, Settings)
- **Results tab:** Contains AMBF check, closure identity, and scorecard (mobile replaces right panel)
- **Snap points:** Bottom sheet has 3 positions: peek (KPI bar visible), half (tabs + compact content), full (scrollable detail)
- **Viewport:** Always visible above the bottom sheet at minimum 40vh
- **Touch:** One-finger orbit, two-finger zoom/pan, tap for tooltips

---

# Part III — UI Component Specifications

## 9. Component Design Standards

### 9.1 Section Header Component

```
┌────────────────────────────────────┐
│  ▼ SECTION TITLE          [badge] │
│  ──────────────────────────────────│
│                                    │
│  Section content                   │
│                                    │
└────────────────────────────────────┘
```

- **Chevron:** 12px, rotates 90° on collapse, `transition-transform duration-200`
- **Title:** `font-mono text-[9px] uppercase tracking-widest text-muted-foreground`
- **Badge:** Optional, right-aligned. Uses status colors (green/red/amber)
- **Divider:** 1px `border-border`, full width, 8px below title
- **Collapse animation:** `max-height` transition, 200ms ease-out

### 9.2 KPI Card Component (Metric Chip)

```
┌──────────┐
│  TLA     │  ← Label: font-mono text-[8px] uppercase
│  300sqm  │  ← Value: font-mono text-lg font-bold tabular-nums
└──────────┘
```

- Compact: 56px width minimum, 48px height
- Background: transparent (on KPI bar) or `bg-muted/50` (in panels)
- Value color: default foreground, or violation red when relevant
- Unit: attached to value, `text-[10px] text-muted-foreground`

### 9.3 Pass/Fail Badge Component

```
PASS  →  ┌──────┐  bg-green-50 text-green-800 border-green-200
         │ PASS │  font-mono text-[9px] font-medium
         └──────┘

FAIL  →  ┌──────┐  bg-red-50 text-red-800 border-red-200
         │ FAIL │  font-mono text-[9px] font-medium
         └──────┘
```

- Border-radius: 4px
- Padding: `px-2 py-0.5`
- Never use fill (solid) backgrounds — keep them subtle, light tints

### 9.4 Violation Banner Component

For serious violations (FLAR exceeded, BHL exceeded):

```
┌──────────────────────────────────────────────┐
│  ● FLAR LIMIT EXCEEDED                       │
│  Proposed GFA (864 sqm) exceeds allowable    │
│  TGFA (680 sqm) at FLAR 2.20.               │
│  Maximum compliant floors: 5F.               │
│  ─── PD 1096 IRR Sec. 705, Table VII.6.1    │
└──────────────────────────────────────────────┘
```

- Position: **Viewport overlay**, bottom-left, above KPI bar
- Background: `bg-red-50/90 backdrop-blur-sm border border-red-200`
- Icon: Solid red circle (●) — functional, not decorative
- Auto-dismiss: Never. Stays until violation is resolved.
- Mobile: Full-width toast at top of bottom sheet

---

## 10. Interaction Patterns

### 10.1 Panel Collapse

```
User clicks panel edge toggle (◀ or ▶)
  → Panel animates to 0px width (200ms ease-out)
  → Viewport expands to fill space
  → Toggle arrow reverses direction
  → Keyboard shortcut: [ for left panel, ] for right panel
  → Tab or Ctrl+M for both panels
```

### 10.2 Section Collapse/Expand

```
User clicks section header chevron or title
  → Content area animates max-height from 0 to auto (200ms ease-out)
  → Chevron rotates 90° (collapsed) or 0° (expanded)
  → Other sections remain unchanged (accordion behavior NOT used)
  → Collapse state persisted to localStorage
```

### 10.3 Slider Interaction

```
User drags slider thumb
  → Value updates in real-time (optimistic)
  → 3D viewport updates on requestAnimationFrame
  → If value enters violation range:
    → Value text turns red
    → Context line appears with warning
    → Slider track changes to red gradient past violation point
  → On release: final computation triggers, scorecard updates
```

### 10.4 Layer Toggle

```
User clicks layer checkbox (in floating overlay)
  → Corresponding 3D geometry fades in/out (200ms opacity transition)
  → Checkbox state updates immediately
  → Viewport invalidates (R3F frameloop="demand")
  → Layer state persisted to localStorage
```

### 10.5 View Preset Transition

```
User clicks view preset button (Orbit, Plan, Front, Iso)
  → Camera lerps to target position (500ms, easeInOutCubic)
  → OrbitControls target lerps to scene center
  → Active button gets Cobalt fill, others get outline
  → Plan view disables orbit rotation (top-down only)
```

---

# Part IV — Implementation Plan

## 11. Phased Implementation

### Phase 1: Structure & Layout (Week 1-2)

**Goal:** New three-column layout with correct proportions and panel collapse.

| Task | Priority | Effort | Dependencies |
|---|---|---|---|
| Implement new panel width constraints (240px / 280px) | P0 | 2h | None |
| Add panel collapse toggles (left/right) | P0 | 4h | None |
| Add Minimize UI mode (Tab/Ctrl+M) | P1 | 2h | Panel collapse |
| Move viewport from ~50% to ~60-65% width | P0 | 1h | Panel widths |
| Add viewport wrapper for toolbar/overlay positioning | P0 | 2h | None |
| Implement tab system for left panel (Lot/Building/Settings) | P0 | 6h | None |
| Status bar component at bottom | P1 | 2h | None |

**Estimated effort:** ~19 hours

### Phase 2: Input Panel Reorganization (Week 2-3)

**Goal:** Tab-based left panel with collapsible sections and unified slider design.

| Task | Priority | Effort | Dependencies |
|---|---|---|---|
| Refactor left panel into 3 tabs | P0 | 8h | Tab system from Phase 1 |
| Move Lot Parameters to Tab 1 | P0 | 2h | Tab refactor |
| Move FLAR/BHL/Building to Tab 2 | P0 | 4h | Tab refactor |
| Create Settings tab | P1 | 3h | Tab refactor |
| Implement collapsible detail sections (FLAR Details, BHL Details) | P0 | 4h | None |
| Unify slider component design | P1 | 4h | None |
| Add violation state to sliders (red track, warning text) | P1 | 3h | Unified slider |
| Persist collapse/tab state to localStorage | P2 | 2h | Collapsible sections |

**Estimated effort:** ~30 hours

### Phase 3: Output Panel Redesign (Week 3-4)

**Goal:** Priority-ordered right panel with summary-first compliance scorecard.

| Task | Priority | Effort | Dependencies |
|---|---|---|---|
| Redesign Compliance Status as summary badge | P0 | 4h | None |
| Create compact scorecard grid (✓/✗ icons) | P0 | 4h | None |
| Make Detailed Scorecard collapsible (collapsed by default) | P0 | 3h | None |
| Implement collapsible sections for all right panel groups | P0 | 4h | None |
| Add red left-border on violation state | P1 | 1h | None |
| Move Code Reference to collapsed section | P1 | 2h | None |
| Remove Layer Visibility from right panel | P0 | 2h | Phase 4 (Layers overlay) |

**Estimated effort:** ~20 hours

### Phase 4: Viewport Enhancements (Week 4-5)

**Goal:** Viewport toolbar, KPI bar, axis gizmo, and layer overlay.

| Task | Priority | Effort | Dependencies |
|---|---|---|---|
| Create viewport toolbar component (floating top-left) | P0 | 6h | Viewport wrapper from Phase 1 |
| Implement Grid toggle | P1 | 2h | Toolbar |
| Implement Dimension labels toggle | P1 | 2h | Toolbar |
| Implement X-ray mode | P2 | 4h | Toolbar |
| Implement Layers dropdown overlay | P0 | 6h | Toolbar + Layer removal from Phase 3 |
| Implement Screenshot button | P2 | 3h | Toolbar |
| Implement Fullscreen toggle | P1 | 2h | Toolbar |
| Create KPI bar (TLA/AMBF/PSO/TOSL/BHL) | P0 | 4h | None |
| Merge KPI bar with view mode bar | P0 | 3h | KPI bar |
| Add GizmoHelper axis indicator (top-right viewport) | P1 | 2h | drei |
| Move violation banners to viewport overlay | P1 | 3h | Viewport wrapper |

**Estimated effort:** ~37 hours

### Phase 5: Mobile Adaptation (Week 5-6)

**Goal:** Responsive bottom sheet with tab navigation for mobile.

| Task | Priority | Effort | Dependencies |
|---|---|---|---|
| Create bottom sheet component (draggable, 3 snap points) | P0 | 8h | None |
| Implement 4-tab navigation in bottom sheet | P0 | 4h | Bottom sheet |
| Move Results panel content to Results tab | P0 | 4h | Bottom sheet + Phase 3 |
| Responsive viewport height (40vh min) | P0 | 2h | None |
| Touch-optimized slider components | P1 | 4h | None |
| Test on mid-range Android (Realme, Samsung A series) | P0 | 4h | All mobile tasks |

**Estimated effort:** ~26 hours

### Phase 6: Polish & Performance (Week 6-7)

**Goal:** Animations, transitions, performance optimization, and accessibility.

| Task | Priority | Effort | Dependencies |
|---|---|---|---|
| Panel collapse animation (200ms ease-out) | P1 | 2h | Phase 1 |
| Section collapse animation (max-height) | P1 | 2h | Phase 2-3 |
| Camera transition easing (500ms) | P1 | 2h | Phase 4 |
| Layer fade-in/out animation (200ms opacity) | P1 | 2h | Phase 4 |
| ARIA labels on all interactive elements | P0 | 4h | All phases |
| Keyboard navigation (Tab order, panel shortcuts) | P0 | 4h | All phases |
| Color contrast audit (WCAG 2.1 AA) | P0 | 2h | All phases |
| Performance profiling (target: 30fps on mid-range mobile) | P0 | 4h | All phases |
| Dark mode verification for all new components | P1 | 4h | All phases |

**Estimated effort:** ~26 hours

---

## 12. Total Effort Estimate

| Phase | Effort | Timeline |
|---|---|---|
| Phase 1: Structure & Layout | 19h | Week 1-2 |
| Phase 2: Input Panel Reorganization | 30h | Week 2-3 |
| Phase 3: Output Panel Redesign | 20h | Week 3-4 |
| Phase 4: Viewport Enhancements | 37h | Week 4-5 |
| Phase 5: Mobile Adaptation | 26h | Week 5-6 |
| Phase 6: Polish & Performance | 26h | Week 6-7 |
| **Total** | **158h** | **~7 weeks** |

---

## 13. Design Tokens — New Components

### 13.1 Colors (Additions)

```css
--viewport-toolbar-bg: rgba(0, 0, 0, 0.6);
--viewport-toolbar-text: #ffffff;
--viewport-toolbar-hover: rgba(255, 255, 255, 0.1);
--kpi-bar-bg: var(--card);
--kpi-bar-border: var(--border);
--panel-collapse-handle: var(--muted-foreground);
--layer-overlay-bg: rgba(0, 0, 0, 0.85);
--violation-border: #E63329;
--violation-banner-bg: rgba(230, 51, 41, 0.05);
```

### 13.2 Spacing (Additions)

```css
--panel-width-left: 240px;
--panel-width-right: 280px;
--panel-padding: 16px;
--section-gap: 12px;
--kpi-bar-height: 72px;
--viewport-toolbar-height: 40px;
--status-bar-height: 32px;
```

### 13.3 Animation Tokens

```css
--panel-collapse-duration: 200ms;
--panel-collapse-easing: cubic-bezier(0.4, 0, 0.2, 1);
--section-collapse-duration: 200ms;
--camera-transition-duration: 500ms;
--layer-fade-duration: 200ms;
```

---

## 14. Success Metrics

| Metric | Current (Estimated) | Target | How to Measure |
|---|---|---|---|
| Viewport screen area ratio | ~50% | ≥60% | Pixel measurement |
| Visible sections without scroll (right panel) | 13+ | ≤5 | Count |
| Visible controls without scroll (left panel) | 19+ | ≤8 per tab | Count |
| Time to find specific control | ~8s (scrolling) | <3s (tab switch) | User testing |
| Compliance status comprehension | Requires reading 8 items | Glance at summary badge | User testing |
| Mobile usable | Partially (panels overflow) | Fully functional bottom sheet | Device testing |
| Viewport FPS (mobile) | Untested | ≥30fps | stats-gl |
| WCAG 2.1 AA compliance | Partial | Full | Automated audit |

---

## 15. Design Review Checklist

Before shipping each phase, verify:

**Layout:**
- [ ] Viewport occupies ≥60% of screen width on desktop
- [ ] Panels are 240px (left) and 280px (right)
- [ ] Both panels collapse individually and together
- [ ] KPI bar is always visible regardless of panel scroll

**Information Hierarchy:**
- [ ] No more than 8 items visible per tab without scrolling
- [ ] Compliance summary is a single badge/number at top
- [ ] Detail sections are collapsed by default
- [ ] Layer controls are in viewport overlay, not data panel

**Interaction:**
- [ ] All animations are 200ms or less (except camera: 500ms)
- [ ] Sliders show violation state in real-time
- [ ] Collapse states persist across sessions
- [ ] Keyboard shortcuts work (Tab, [, ], Ctrl+M)

**Accessibility:**
- [ ] All interactive elements have ARIA labels
- [ ] Tab order is logical (left panel → viewport → right panel)
- [ ] Color is never the only indicator
- [ ] Touch targets are ≥44px on mobile

**Performance:**
- [ ] ≥30fps on Samsung Galaxy A54 (reference device)
- [ ] Panel collapse doesn't trigger 3D re-render
- [ ] Layer toggle uses opacity animation, not geometry removal

**Brand:**
- [ ] Uses SlateCamp Design System tokens (Cobalt, Signal Red, etc.)
- [ ] Rams Standard: every element earns its place
- [ ] Coach Interface: honest, calm, purposeful
- [ ] No gamification debris

---

## Appendix A: Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Tab` or `Ctrl+M` | Toggle all panels (Minimize UI) |
| `[` | Toggle left panel |
| `]` | Toggle right panel |
| `1` | Switch to Orbit view |
| `2` | Switch to Plan view |
| `3` | Switch to Front view |
| `4` | Switch to Isometric view |
| `D` | Toggle dimension labels |
| `G` | Toggle grid |
| `X` | Toggle X-ray mode |
| `L` | Open layers overlay |
| `F` | Fullscreen viewport |
| `P` | Screenshot |

---

## Appendix B: References

### Industry Benchmarks
- Blender 4.x — Multi-panel layout, Properties tabs, viewport overlays
- Cinema 4D — Tab-based properties, detachable toolbars, viewport toolbars
- SketchUp — Dialog trays, customizable toolbars, Getting Started toolbar
- OnShape — Floating side panels, parts outline, two-column properties
- Figma UI3 — Fixed panels, Minimize UI, clean hierarchy, floating bottom toolbar
- 3DS Max — Multi-panel layout, ribbon interface, status bar

### UX Research Sources
- Creative Navy — "CAD Software UX Design Patterns & Benchmarking" (2023)
- Hank Grebe — "UX Design: The Viewport Module" — viewport-attached controls
- Mayer's Multimedia Learning Principles — spatial contiguity, coherence
- Figma Blog — "Our Approach to Designing UI3" (2024) — fixed vs. floating panels
- Muzli — Dashboard design patterns: KPI cards, progressive disclosure, grouping

### SlateCamp Internal
- SlateCamp Design System v1 (Rams Standard)
- 3D Interaction Design Guide
- 3D Visual Rendering Guide  
- 3D Information Design Guide
- PD 1096 Rules VII & VIII UX Implementation Plan
- Lot Plotting UX/UI Guide

---

*Document prepared by SlateCamp UX Design + 3D Lab Engineering*  
*April 2026*
