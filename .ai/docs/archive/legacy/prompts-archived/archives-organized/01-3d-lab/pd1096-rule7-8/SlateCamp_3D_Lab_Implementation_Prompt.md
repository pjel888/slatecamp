# SlateCamp 3D Lab — UX/UI Overhaul Implementation Prompt

---

## [DEVELOPER MESSAGE / SYSTEM INSTRUCTION]

**Domain Expertise:** Ground your response in advanced **frontend engineering with 3D web application specialization**, utilizing current best practices in **React 18, Next.js 14 App Router, React Three Fiber (R3F), Zustand state management, Tailwind CSS utility-first styling, Shadcn UI component composition, and drei helper library for R3F**. You are also grounded in **3D CAD/architectural software UX patterns** (Blender, SketchUp, Figma, AutoCAD, Cinema 4D, OnShape) and **dashboard information architecture** (progressive disclosure, KPI-first hierarchy, collapsible panels).

**Objective:** Your core directive is to **implement a complete UX/UI overhaul of the SlateCamp 3D Development Controls Lab** — transforming a functional but information-overloaded three-panel interface into a professional-grade, industry-standard 3D application layout with tabbed input panels, priority-ordered collapsible output panels, viewport-attached toolbars, a persistent KPI bar, floating layer overlays, a responsive mobile bottom sheet, and full keyboard shortcuts — all while preserving existing computation engine logic, Zustand state, and R3F 3D scene rendering untouched.

**Operational Environment:**
- **Stack:** Next.js 14 App Router · React 18 · TypeScript · React Three Fiber · @react-three/drei · Zustand · Tailwind CSS · Shadcn UI · Lucide React icons
- **Design System:** SlateCamp Design System v1 (Rams Standard) — Cobalt `#1B3FC4`, Signal Red `#E63329`, Signal Green `#1B7A3C`, Signal Gold `#F5A623`, Camp Orange `#E8853A`, Trail Purple `#534AB7`, Cream `#F2F0EB`, Warm White `#F8F7F5`
- **Typography:** Display: Syne (700–800), Hero: GeistSans, Body/UI: Inter, Mono: JetBrains Mono / DM Mono
- **Regulatory Domain:** PD 1096 2004 Revised IRR — Rules VII (Sections 701–709) & VIII (Sections 801–811)
- **Target Devices:** Desktop ≥1280px, Tablet ≥768px, Mobile (Samsung Galaxy A54 reference — mid-range Android, 6.4" display, 4G)
- **Performance Target:** ≥30fps on mobile, ≤200ms UI animations, no layout shift on panel collapse
- **Accessibility:** WCAG 2.1 AA minimum

**Absolute Boundary:** **DO NOT modify, refactor, rewrite, or in any way alter the existing computation engine (`computeDevControls()`, `computeAMBF()`, `computeTGFA()`, `computeBHL()`, `computeAMVB()`), the Zustand store schema (`useDevControlsStore`), or any R3F 3D scene geometry/material/lighting code.** The UX overhaul is a **layout, panel, component, and interaction layer** that wraps around the existing engine. All data flows remain the same — you are reorganizing how data is DISPLAYED and CONTROLLED, not how it is COMPUTED or RENDERED in 3D. If you believe a computation or store change is required, halt and state the dependency explicitly.

---

## [USER PROMPT]

<infrastructure>

### Global State (Zustand Store — DO NOT MODIFY SCHEMA)

The existing `useDevControlsStore` contains all parameters and computed values. The store shape includes but is not limited to:

```typescript
interface DevControlsState {
  // Input parameters (driven by sliders/inputs)
  lotWidth: number          // meters
  lotDepth: number          // meters
  rrowWidth: number         // meters
  zoningClass: string       // e.g., "R-1", "R-2", "C-1", "C-2", "C-3"
  customFlar: boolean
  flarApplied: number       // ratio
  bhlApplied: { floors: number; height: number; source: 'zone' | 'custom' }
  footprintWidth: number    // meters
  footprintDepth: number    // meters
  numberOfFloors: number
  floorToFloorHeight: number // meters
  firewallEnabled: boolean

  // Computed values (READ-ONLY for UI — produced by computation engine)
  tla: number               // Total Lot Area (sqm)
  frontage: number          // meters
  ambf: number              // Allowable Maximum Building Footprint (sqm)
  pso: number               // Percentage of Site Occupancy (%)
  tosl: number              // Total Open Space within Lot (sqm)
  isa: number               // Impervious Surface Area (sqm)
  usa: number               // Unpaved Surface Area (sqm)
  maca: number              // Maximum Allowable Construction Area (sqm)
  tgfa: number              // Total Gross Floor Area (sqm)
  gfa: number               // Gross Floor Area (sqm)
  amvb: number              // Allowable Maximum Volume of Building (cu.m)
  proposedHeight: number    // meters
  proposedGfa: number       // sqm
  farProposed: number       // ratio

  // AMBF Three-Way Check results
  ambfBySetbacks: number
  ambfByPso: number
  ambfByTosl: number
  ambfBinding: 'setbacks' | 'pso' | 'tosl'

  // Compliance check results
  complianceChecks: ComplianceCheck[]
  overallCompliance: 'pass' | 'violation'

  // Table VIII.1 reference values (by zoning class)
  tableRef: {
    pso: string; isa: string; usa: string;
    tosl: string; bhl: string; flar: string;
  }

  // Layer visibility state
  layers: {
    setbackZones: boolean; ambfEnvelope: boolean;
    toslOverlay: boolean; floorSlabs: boolean;
    bhlCeiling: boolean; flarCeiling: boolean;
    roadGrid: boolean; contextBuildings: boolean;
    firewallMarkers: boolean;
  }

  // Actions
  setParameter: (key: string, value: any) => void
  setLayer: (key: string, visible: boolean) => void
  setAllLayers: (visible: boolean) => void
  loadPreset: (preset: string) => void
  resetToDefaults: () => void
}

interface ComplianceCheck {
  id: string              // e.g., "ambf", "tosl", "isa", "usa", "bhl", "tgfa", "amvb", "ftf", "area_identity"
  label: string           // e.g., "Building Footprint (AMBF)"
  status: 'pass' | 'fail'
  required: string        // e.g., "136.0 sqm"
  actual: string          // e.g., "72.0 sqm"
  excess?: string         // e.g., "Excess: 184.0 sqm"
  codeRef: string         // e.g., "PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1"
}
```

### Current File Structure (Relevant UI Files)

```
src/
├── app/dashboard/3d-lab/
│   ├── page.tsx                           # Route page
│   └── components/
│       ├── DevControlsLab.tsx             # Main lab wrapper (3-column layout)
│       ├── LeftPanel.tsx                   # Current single-scroll left panel
│       ├── RightPanel.tsx                  # Current single-scroll right panel
│       ├── Canvas3D.tsx                    # R3F Canvas + scene (DO NOT MODIFY)
│       ├── ViewModeBar.tsx                 # Bottom view preset buttons
│       ├── PresetButtons.tsx              # Scenario preset chips
│       ├── LotConfigurator.tsx            # Lot sliders (width/depth/rrow)
│       ├── ZoningSelector.tsx             # Zoning dropdown + Table VIII.1
│       ├── FlarSection.tsx                # FLAR slider + details
│       ├── BhlSection.tsx                 # BHL slider + details
│       ├── ProposedBuildingSection.tsx     # Building dimension sliders
│       ├── FirewallSection.tsx            # Firewall toggle
│       ├── LayerVisibility.tsx            # Layer toggle checkboxes
│       ├── KpiSummary.tsx                 # TLA/AMBF/PSO/TOSL chips
│       ├── AmbfThreeWayCheck.tsx          # AMBF three-way binding display
│       ├── AreaClosureIdentity.tsx        # Stacked bar visualization
│       ├── ComplianceScorecard.tsx        # Full pass/fail scorecard
│       ├── CodeReference.tsx              # PD 1096 reference info
│       └── ZoneLegend.tsx                 # Color legend for zones
├── stores/
│   └── useDevControlsStore.ts             # Zustand store (DO NOT MODIFY)
├── lib/
│   └── devControlsEngine.ts               # Computation engine (DO NOT MODIFY)
└── components/ui/                          # Shadcn UI components
    ├── button.tsx
    ├── slider.tsx
    ├── tabs.tsx
    ├── collapsible.tsx
    ├── dropdown-menu.tsx
    ├── tooltip.tsx
    ├── badge.tsx
    └── ...
```

### Design Tokens (CSS Variables — extend, do not replace)

```css
/* Existing tokens — preserved */
--primary: #1B3FC4;        /* Cobalt Blue */
--signal-red: #E63329;
--signal-green: #1B7A3C;
--signal-gold: #F5A623;
--camp-orange: #E8853A;
--cream: #F2F0EB;
--warm-white: #F8F7F5;

/* NEW tokens to add for this overhaul */
--panel-width-left: 240px;
--panel-width-right: 280px;
--panel-padding: 16px;
--section-gap: 12px;
--kpi-bar-height: 72px;
--viewport-toolbar-height: 40px;
--status-bar-height: 32px;
--viewport-toolbar-bg: rgba(0, 0, 0, 0.6);
--viewport-toolbar-text: #ffffff;
--viewport-toolbar-hover: rgba(255, 255, 255, 0.1);
--kpi-bar-bg: var(--card);
--kpi-bar-border: var(--border);
--panel-collapse-handle: var(--muted-foreground);
--layer-overlay-bg: rgba(0, 0, 0, 0.85);
--violation-border: #E63329;
--violation-banner-bg: rgba(230, 51, 41, 0.05);
--panel-collapse-duration: 200ms;
--panel-collapse-easing: cubic-bezier(0.4, 0, 0.2, 1);
--section-collapse-duration: 200ms;
--camera-transition-duration: 500ms;
--layer-fade-duration: 200ms;
```

### Keyboard Shortcuts to Implement

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
| `L` | Open/close layers overlay |
| `F` | Fullscreen viewport |
| `P` | Screenshot |

</infrastructure>

<documents>

<document index="1" title="UX/UI Research & Implementation Plan — Full Specification">

## PROPOSED DESKTOP LAYOUT (≥1280px)

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
│  collaps │ │          (maximized ~60-65%)             │ │  collaps   │
│          │ │                                          │ │            │
│  TABBED: │ │                         ┌─────────┐      │ │  PRIORITY: │
│  📐 Lot  │ │                         │  AXIS   │      │ │  1.Status  │
│  🏗 Build │ │                         │  GIZMO  │      │ │  2.AMBF    │
│  ⚙ Settng│ │                         └─────────┘      │ │  3.Area    │
│          │ ├──────────────────────────────────────────┤ │  4.Detail  │
│          │ │  KPI BAR: TLA 300 │ AMBF 136 │ PSO 45.3%│ │  5.CodeRef │
│          │ │  [Orbit] [Plan] [Front] [Iso] [Fullscr]  │ │            │
│          │ └──────────────────────────────────────────┘ │            │
├──────────┴──────────────────────────────────────────────┴────────────┤
│  STATUS: R-1 Low-Density Residential · FLAR 2.20 · BHL 5F/15m       │
└──────────────────────────────────────────────────────────────────────┘
```

## LEFT PANEL — TAB 1: 📐 LOT (Site Parameters)

Contains: Presets (6 buttons), Lot Dimensions (3 sliders: width/depth/rrow + computed area/frontage), Zoning Classification (dropdown + Table VIII.1 reference card).

## LEFT PANEL — TAB 2: 🏗 BUILDING (Proposed Building & Code Limits)

Contains: FLAR section (slider + collapsible detail showing FLAR applied/GFA allowable/TGFA FLAR/TGFA BHL/TGFA governing/Max floors), BHL section (slider + collapsible detail showing BHL applied/source/AMVB/Proposed height), Proposed Building (3 sliders: width/depth/floors + floor-to-floor height), Firewall section.

## LEFT PANEL — TAB 3: ⚙ SETTINGS

Contains: Display toggles (ground plane, axis gizmo, dimension labels, wireframe mode), Units selector, Snap setting, Export buttons (screenshot, export report).

## RIGHT PANEL — 5 COLLAPSIBLE SECTIONS (Priority-ordered)

### Section 1: COMPLIANCE STATUS (always visible, never collapses)
- Overall status badge: "PASS" (green) or "VIOLATION" (red)
- Summary: "5 of 8 PASS" with progress bar
- Violation count: "3 violations found"
- Left-border turns red (#E63329, 4px) when violations exist

### Section 2: AMBF THREE-WAY CHECK (expanded by default)
- 3 computation rows: By Setbacks, By PSO, By TOSL
- Binding constraint highlighted with "BINDING" badge
- Summary line: "AMBF = min(setback, PSO) = 136.0 sqm (45.3% of TLA)"
- Collapsible with chevron

### Section 3: AREA CLOSURE IDENTITY (expanded by default)
- Stacked horizontal bar: [AMBF][ISA][USA] with brand colors
- Equation: "136 + 90 + 74 = 300 sqm"
- VERIFIED badge when identity holds
- Collapsible with chevron

### Section 4: DETAILED SCORECARD (COLLAPSED by default)
- When collapsed: shows compact grid of ✓/✗ icons for each check
  e.g., "AMBF ✓  TOSL ✓  ISA ✓  USA ✓  BHL ✗  TGFA ✗  AMVB ✗  FTF ✓  AREA ✓"
- When expanded: full current scorecard with Required/Actual/Excess/Code Ref per item
- Badge in header: "(3 ⚠)" showing violation count

### Section 5: CODE REFERENCE (COLLAPSED by default)
- When collapsed: "PD 1096 Rules VII & VIII — 2004 Revised IRR"
- When expanded: full code reference info

## VIEWPORT TOOLBAR (Floating, Top-Left of 3D Canvas)

Position: `absolute top-4 left-4`, `z-index: 10`
Background: `bg-black/60 backdrop-blur-sm rounded-lg`
Buttons: icon-only with tooltips on hover

| Button | Icon | Action | Shortcut |
|---|---|---|---|
| Grid | Grid3x3 (lucide) | Toggle ground grid visibility | G |
| Dimensions | Ruler (lucide) | Toggle dimension labels in 3D | D |
| X-ray | Eye (lucide) | Toggle transparent building mode | X |
| Layers | Layers (lucide) | Open/close layers dropdown overlay | L |
| Screenshot | Camera (lucide) | Capture viewport as PNG | P |
| Fullscreen | Maximize2 (lucide) | Toggle fullscreen viewport | F |

## KPI BAR (Viewport-Attached Bottom)

Position: Inside the viewport wrapper, at the bottom, above the view mode buttons.
Two rows:
- Row 1: 5 KPI chips — TLA (sqm), AMBF (sqm), PSO (%), TOSL (sqm), BHL (floors)
- Row 2: View mode buttons — Orbit, Plan, Front, Iso, Fullscreen

KPI chip design:
- Label: `font-mono text-[8px] uppercase tracking-widest text-muted-foreground`
- Value: `font-mono text-base font-bold tabular-nums`
- Unit: `text-[10px] text-muted-foreground` attached to value
- Background: `bg-card/80 backdrop-blur-sm`
- Min-width: 56px

## LAYERS OVERLAY (Floating, Anchored to Layers toolbar button)

Position: Below viewport toolbar, `absolute top-14 left-4`, `z-index: 20`
Background: `bg-popover border border-border rounded-lg shadow-xl`
Width: 220px
Contains:
- 9 layer checkboxes (using existing layer state from store)
- Divider
- "Show All" / "Hide All" buttons
Behavior: Opens on Layers button click, closes on click outside or Layers button again

## AXIS GIZMO (Top-Right of Viewport)

Implementation: drei `GizmoHelper` + `GizmoViewport`
Position: Top-right corner of Canvas
Click face to snap to orthographic view

## STATUS BAR (Bottom of Full Screen)

Position: Full-width bar below the three-column layout
Height: 32px
Content: "R-1 Low-Density Residential · FLAR 2.20 · BHL 5F/15m"
Typography: `font-mono text-xs text-muted-foreground`
Background: `bg-muted/50 border-t border-border`

## MOBILE LAYOUT (< 768px)

```
┌──────────────────────────┐
│  ← Back    Dev Controls  │
├──────────────────────────┤
│                          │
│    3D VIEWPORT           │
│    (full width, 60vh)    │
│                          │
│  ┌────────────────────┐  │
│  │ KPI: TLA AMBF PSO  │  │
│  │ [Orbit][Plan][Iso]  │  │
│  └────────────────────┘  │
├──────────────────────────┤
│  ┌────────────────────┐  │
│  │ BOTTOM SHEET        │  │
│  │ ═══ Drag handle     │  │
│  │                     │  │
│  │ [📐 Lot] [🏗 Build] │  │
│  │ [📊 Results] [⚙]   │  │
│  │                     │  │
│  │ (scrollable content)│  │
│  └────────────────────┘  │
└──────────────────────────┘
```

Bottom sheet has 3 snap positions:
1. **Peek** (80px): Only drag handle + tab buttons visible, viewport maximized
2. **Half** (50vh): Tabs + compact content visible, viewport at 50vh
3. **Full** (85vh): Full scrollable content, viewport at minimum 15vh (still visible)

4 tabs in mobile bottom sheet:
- 📐 Lot (= desktop Tab 1)
- 🏗 Building (= desktop Tab 2)
- 📊 Results (= desktop right panel sections 1-4)
- ⚙ Settings (= desktop Tab 3)

## COMPONENT SPECIFICATIONS

### CollapsibleSection Component

```tsx
interface CollapsibleSectionProps {
  title: string                    // e.g., "AMBF THREE-WAY CHECK"
  badge?: React.ReactNode          // Optional right-aligned badge
  defaultOpen?: boolean            // Default: false
  persistKey?: string              // localStorage key for persist
  children: React.ReactNode
}
```

Design:
- Header: clickable row with chevron (ChevronDown lucide, 14px) + title (font-mono text-[9px] uppercase tracking-widest) + optional badge
- Chevron rotates -90° when collapsed
- Content: animated with max-height + overflow-hidden, 200ms ease-out
- Divider: 1px border-border below header
- Section gap: 12px between sections

### UnifiedSlider Component

```tsx
interface UnifiedSliderProps {
  label: string                    // e.g., "LOT WIDTH"
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  unit: string                     // e.g., "m", "sqm", "%"
  isViolating?: boolean            // Red value + track when true
  contextLine?: string             // e.g., "Zone: 1.50" or "⚠ Exceeds BHL (5 storeys)"
  contextLineType?: 'info' | 'warning' | 'error'
}
```

Design:
- Row 1: Label (font-mono text-[9px] uppercase tracking-widest text-muted-foreground) | Value (font-mono text-sm font-medium tabular-nums, red if isViolating)
- Row 2: Slider track (4px height, rounded, Cobalt fill for active, red gradient past violation point)
- Row 3 (conditional): Context line (text-[11px], color by type: info=muted, warning=amber, error=red)
- Thumb: 16px circle, white fill, Cobalt border, `shadow-sm`

### KpiChip Component

```tsx
interface KpiChipProps {
  label: string         // e.g., "TLA"
  value: string         // e.g., "300"
  unit: string          // e.g., "sqm"
  isViolating?: boolean
}
```

### ComplianceSummary Component (new — replaces full scorecard at top)

```tsx
interface ComplianceSummaryProps {
  totalChecks: number
  passCount: number
  failCount: number
  overallStatus: 'pass' | 'violation'
}
```

### CompactScorecardGrid Component (new — collapsed view of detailed scorecard)

```tsx
interface CompactScorecardGridProps {
  checks: ComplianceCheck[]
}
// Renders a tight 3-column grid: "AMBF ✓  TOSL ✓  ISA ✓" etc.
// ✓ = text-green-600, ✗ = text-red-600
// font-mono text-[11px]
```

### ViewportToolbar Component (new)

```tsx
interface ViewportToolbarProps {
  onGridToggle: () => void
  onDimsToggle: () => void
  onXrayToggle: () => void
  onLayersToggle: () => void
  onScreenshot: () => void
  onFullscreen: () => void
  gridActive: boolean
  dimsActive: boolean
  xrayActive: boolean
  layersOpen: boolean
}
```

### LayersOverlay Component (new)

```tsx
interface LayersOverlayProps {
  layers: Record<string, boolean>
  onToggleLayer: (key: string, visible: boolean) => void
  onShowAll: () => void
  onHideAll: () => void
  onClose: () => void
}
```

### BottomSheet Component (new — mobile only)

```tsx
interface BottomSheetProps {
  children: React.ReactNode
  snapPoints: [number, number, number]  // [peek, half, full] in vh
  defaultSnap?: number                   // index
}
```

## INTERACTION SPECIFICATIONS

| Interaction | Behavior | Duration | Easing |
|---|---|---|---|
| Panel collapse | Width animates 240/280px → 0px, viewport fills | 200ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Section collapse | max-height transition + chevron 90° rotate | 200ms | ease-out |
| Slider drag | Real-time value update + 3D rAF update | Continuous | — |
| Layer toggle | Geometry opacity 0↔1 | 200ms | ease-in-out |
| View preset | Camera lerp to target position/lookAt | 500ms | easeInOutCubic |
| Minimize UI (both panels) | Simultaneous left+right collapse | 200ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Layers overlay open | Fade in + scale from 0.95 | 150ms | ease-out |
| Layers overlay close | Fade out + scale to 0.95 | 100ms | ease-in |
| Bottom sheet drag (mobile) | Spring physics, snap to nearest point | ~300ms | spring(1, 80, 10) |
| Violation banner appear | Slide up from bottom + fade in | 300ms | ease-out |

</document>

<document index="2" title="SlateCamp Design System — Component Standards">

## SECTION HEADER EYEBROW STANDARD

All section titles throughout both panels follow this exact pattern:
```
font-family: 'JetBrains Mono', 'DM Mono', monospace
font-size: 9px (text-[9px])
font-weight: 500 (font-medium)
text-transform: uppercase
letter-spacing: 3px (tracking-widest)
color: var(--muted-foreground)
```

## PASS/FAIL BADGE

```
PASS: bg-green-50 text-green-800 border border-green-200 rounded px-2 py-0.5
FAIL: bg-red-50 text-red-800 border border-red-200 rounded px-2 py-0.5
font-family: monospace, text-[9px], font-medium
```
NEVER use solid fill backgrounds. Always subtle tint.

## VIOLATION BANNER (Viewport Overlay)

Position: Viewport overlay, bottom-left, above KPI bar
```
bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg
p-4, max-width: 400px
```
Icon: Solid red circle (●) — not an alert triangle
Title: font-mono text-[9px] uppercase tracking-widest text-red-900
Body: text-xs text-red-800
Code ref: font-mono text-[10px] text-red-400
Never auto-dismisses. Stays until violation is resolved by slider change.

## PANEL COLLAPSE HANDLE

```
Position: absolute, centered vertically on the panel edge facing the viewport
Width: 16px, Height: 48px
Background: bg-muted/80 hover:bg-muted rounded-full
Icon: ChevronLeft (14px) for left panel, ChevronRight for right panel
Reverses direction when collapsed
Transition: background 150ms, transform 200ms
```

## CARD / SECTION CONTAINER

```
Background: transparent (sections are separated by dividers, not card borders)
Divider: 1px solid var(--border)
Padding: var(--panel-padding) = 16px
Gap between sections: var(--section-gap) = 12px
```
Exception: Table VIII.1 reference card uses `bg-muted/30 rounded-md p-3 border border-border`

## SCROLL BEHAVIOR

Left panel tabs: NO scroll within individual tabs (content must fit)
Right panel: Scroll allowed on the panel itself, individual sections collapse to manage height
Mobile bottom sheet: Scroll within the bottom sheet content area

## DARK MODE

All new components must work in both light and dark modes.
Use Tailwind semantic classes (bg-card, bg-muted, text-foreground, text-muted-foreground, border-border) — never hardcoded hex values for backgrounds or text.
Exception: Viewport toolbar bg is always dark (rgba(0,0,0,0.6)) regardless of theme.
Exception: Signal colors (red, green, gold) are the same in both modes.

</document>

<document index="3" title="Existing Components to Preserve, Wrap, or Refactor">

## PRESERVE INTACT (move to new location, do not modify internal logic)

| Component | Current Location | New Location |
|---|---|---|
| `PresetButtons` | LeftPanel | InputPanel → Tab 1 (Lot) |
| `LotConfigurator` | LeftPanel | InputPanel → Tab 1 (Lot) — wrap sliders in UnifiedSlider |
| `ZoningSelector` | LeftPanel | InputPanel → Tab 1 (Lot) |
| `FlarSection` | LeftPanel | InputPanel → Tab 2 (Building) — make detail collapsible |
| `BhlSection` | LeftPanel | InputPanel → Tab 2 (Building) — make detail collapsible |
| `ProposedBuildingSection` | LeftPanel | InputPanel → Tab 2 (Building) — wrap sliders in UnifiedSlider |
| `FirewallSection` | LeftPanel | InputPanel → Tab 2 (Building) |
| `AmbfThreeWayCheck` | RightPanel | OutputPanel → Section 2 — wrap in CollapsibleSection |
| `AreaClosureIdentity` | RightPanel | OutputPanel → Section 3 — wrap in CollapsibleSection |
| `ComplianceScorecard` | RightPanel | OutputPanel → Section 4 (expanded state) — wrap in CollapsibleSection |
| `CodeReference` | RightPanel | OutputPanel → Section 5 — wrap in CollapsibleSection |
| `ViewModeBar` | Below viewport | KpiBar → Row 2 (merge into new component) |
| `Canvas3D` | Center column | Center column (DO NOT TOUCH) |

## REMOVE FROM CURRENT LOCATION

| Component | Reason |
|---|---|
| `LayerVisibility` | Moves to floating LayersOverlay attached to viewport toolbar |
| `KpiSummary` | Moves to KpiBar (viewport-attached bottom) |
| `ZoneLegend` | Moves inside CollapsibleSection in Code Reference, or as tooltip |

## CREATE NEW

| Component | Description |
|---|---|
| `DevControlsLabV2` | New main wrapper — replaces DevControlsLab |
| `InputPanel` | New tabbed left panel with collapse |
| `OutputPanel` | New priority-ordered right panel with collapse |
| `ViewportWrapper` | Div wrapper around Canvas3D for toolbar/overlay positioning |
| `ViewportToolbar` | Floating toolbar top-left of viewport |
| `KpiBar` | KPI chips + view mode buttons at viewport bottom |
| `LayersOverlay` | Floating layer toggles, anchored to toolbar |
| `StatusBar` | Full-width bottom bar with zone/FLAR/BHL info |
| `CollapsibleSection` | Reusable collapsible section with chevron + persist |
| `UnifiedSlider` | Standardized slider with violation state |
| `KpiChip` | Compact metric display chip |
| `ComplianceSummary` | Summary badge for section 1 |
| `CompactScorecardGrid` | Compact ✓/✗ grid for collapsed scorecard |
| `ViolationBanner` | Viewport overlay for FLAR/BHL violations |
| `PanelCollapseHandle` | Edge-mounted collapse toggle |
| `BottomSheet` | Mobile bottom sheet with snap points |
| `useKeyboardShortcuts` | Custom hook for all keyboard shortcuts |
| `usePanelState` | Custom hook for panel collapse/tab state with localStorage |

</document>

</documents>

<context>

## Business Context

SlateCamp is a Philippine EdTech platform preparing architecture students for the Architecture Licensure Examination (ALE). The 3D Development Controls Lab is our flagship interactive learning module — it teaches PD 1096 building code compliance through parametric 3D visualization.

## Current Problem

The Lab works functionally but has six identified UX problems:
1. **Left panel** has 19+ controls in a single scroll — 3-4 screens of scrolling on 1080p
2. **Right panel** has 13+ output sections with no collapse — all information at equal visual weight
3. **No viewport toolbar** — missing industry-standard 3D controls (grid, dims, x-ray, screenshot, fullscreen)
4. **Layer controls misplaced** — at top of right panel instead of attached to viewport
5. **No progressive disclosure** — everything visible simultaneously, contradicts Mayer's Coherence Principle
6. **Compliance scorecard competes with viewport** — 8+ detailed checks pull attention from 3D scene

## What Must Be Preserved

- All computation logic in `useDevControlsStore` and `devControlsEngine.ts`
- All R3F 3D scene code in `Canvas3D.tsx` (geometry, materials, lighting, cameras)
- The pedagogical effectiveness of AMBF Three-Way Check and Area Closure Identity visualizations
- All existing preset functionality
- All Zustand state management patterns

## What Must Change

- Layout proportions (viewport from ~50% to ≥60%)
- Panel organization (tabs, collapsible sections, progressive disclosure)
- Information hierarchy (summary-first, detail-on-demand)
- Viewport controls (toolbar, KPI bar, axis gizmo, layer overlay)
- Mobile experience (bottom sheet with snap points)
- Keyboard shortcuts for power users
- Accessibility (ARIA labels, focus order, contrast)

</context>

<task_pipeline>

Execute the following phases strictly in order. Each phase must be fully complete before starting the next. After each phase, output a verification checklist confirming all tasks in that phase are done.

### PHASE 1: STRUCTURAL LAYOUT (Foundation)

1. **Create `DevControlsLabV2.tsx`** — New main wrapper component replacing the three-column layout.
   - CSS Grid layout: `grid-template-columns: var(--panel-width-left) 1fr var(--panel-width-right)`
   - Full-height: `h-[calc(100vh-var(--header-height))]`
   - Responsive: At `<768px`, switch to single-column with bottom sheet

2. **Create `ViewportWrapper.tsx`** — A `div` wrapper around `Canvas3D` with `position: relative; overflow: hidden;` to anchor floating toolbar, KPI bar, axis gizmo, layer overlay, and violation banners.

3. **Create `PanelCollapseHandle.tsx`** — Edge-mounted toggle on each panel.
   - Left panel: ChevronLeft when open, ChevronRight when collapsed. Right edge of left panel.
   - Right panel: ChevronRight when open, ChevronLeft when collapsed. Left edge of right panel.
   - Animation: width `var(--panel-width-left/right)` → `0px` in 200ms.

4. **Create `usePanelState.ts` hook** — Manages left/right panel collapsed state + active left panel tab.
   - Persists to `localStorage` key `slatecamp-3dlab-panels`
   - Provides: `leftCollapsed`, `rightCollapsed`, `activeTab`, `toggleLeft()`, `toggleRight()`, `toggleBoth()`, `setActiveTab()`

5. **Create `StatusBar.tsx`** — Full-width bottom bar.
   - Reads from store: zoningClass, flarApplied, bhlApplied
   - Format: "R-1 Low-Density Residential · FLAR 2.20 · BHL 5F/15m"

6. **Verify Phase 1:** Layout renders at correct proportions, panels collapse/expand with animation, viewport fills space when panels collapse, status bar shows live data.

### PHASE 2: INPUT PANEL (Left Panel Tabs)

7. **Create `InputPanel.tsx`** — Tabbed left panel container.
   - Uses Shadcn `Tabs` component
   - 3 tabs: 📐 Lot, 🏗 Building, ⚙ Settings
   - Tab trigger design: icon + short label, `font-mono text-[9px] uppercase`
   - Tab content fills remaining panel height with no scroll (exception: Settings may scroll)

8. **Create Tab 1 content** — Move `PresetButtons`, `LotConfigurator`, `ZoningSelector` into Tab 1.
   - Wrap LotConfigurator sliders in new `UnifiedSlider` component
   - Preserve `ZoningSelector` dropdown + Table VIII.1 reference card exactly

9. **Create Tab 2 content** — Move `FlarSection`, `BhlSection`, `ProposedBuildingSection`, `FirewallSection` into Tab 2.
   - Make FLAR Details and BHL Details into `CollapsibleSection` (collapsed by default)
   - Wrap building dimension sliders in `UnifiedSlider` with violation states
   - Show `⚠ Exceeds BHL (5 storeys)` context line when floors > bhlApplied.floors

10. **Create Tab 3 content** — New Settings tab with display toggles, units, snap, export buttons.

11. **Create `UnifiedSlider.tsx`** — Standardized slider following spec:
    - Label row: mono eyebrow + right-aligned value (red if violating)
    - Slider: 4px track, Cobalt fill, 16px white thumb
    - Context line: conditional, typed as info/warning/error
    - Touch target: ≥44px on mobile

12. **Create `CollapsibleSection.tsx`** — Reusable collapsible with:
    - Chevron rotation animation
    - max-height transition (200ms)
    - localStorage persistence via `persistKey` prop
    - Optional badge in header

13. **Verify Phase 2:** All existing inputs work in their new tab locations, FLAR/BHL details collapse, sliders show violations, no scroll needed within Tab 1 or Tab 2 on 1080p display.

### PHASE 3: OUTPUT PANEL (Right Panel Hierarchy)

14. **Create `OutputPanel.tsx`** — Priority-ordered right panel.
    - 5 sections in strict order: ComplianceSummary → AmbfThreeWayCheck → AreaClosureIdentity → DetailedScorecard → CodeReference
    - Scrollable panel body

15. **Create `ComplianceSummary.tsx`** — Section 1 (always visible, never collapses).
    - Overall badge: "PASS" or "VIOLATION"
    - Count: "5 of 8 PASS"
    - Progress bar: green fill for pass ratio
    - Left-border: red 4px when status is 'violation'

16. **Wrap existing `AmbfThreeWayCheck` in CollapsibleSection** (defaultOpen: true)

17. **Wrap existing `AreaClosureIdentity` in CollapsibleSection** (defaultOpen: true)

18. **Create `CompactScorecardGrid.tsx`** — Collapsed view of detailed scorecard.
    - 3-column grid: "AMBF ✓  TOSL ✓  BHL ✗" etc.
    - ✓ green, ✗ red, font-mono text-[11px]

19. **Wrap existing `ComplianceScorecard` in CollapsibleSection** (defaultOpen: false).
    - Collapsed header shows CompactScorecardGrid + badge "(3 ⚠)"
    - Expanded shows existing full scorecard

20. **Wrap `CodeReference` in CollapsibleSection** (defaultOpen: false)

21. **Remove `LayerVisibility` from right panel** (will be in viewport overlay, Phase 4)

22. **Remove `KpiSummary` from right panel** (will be in KPI bar, Phase 4)

23. **Verify Phase 3:** Right panel shows 5 sections in priority order, sections 4-5 are collapsed by default, compliance summary shows correct counts, existing visualizations (AMBF check, area closure) render identically.

### PHASE 4: VIEWPORT ENHANCEMENTS

24. **Create `ViewportToolbar.tsx`** — Floating toolbar top-left of viewport.
    - 6 icon buttons with Lucide icons
    - Glass-morphism: `bg-black/60 backdrop-blur-sm rounded-lg p-1 flex gap-1`
    - Each button: `w-8 h-8 rounded-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors`
    - Active state: `bg-white/20 text-white`
    - Tooltips on hover (Shadcn Tooltip)

25. **Create `LayersOverlay.tsx`** — Floating panel below toolbar.
    - Opens when Layers button is clicked
    - 9 checkboxes using existing `layers` state from store
    - "Show All" / "Hide All" buttons at bottom
    - Close on click outside (use `useClickOutside` pattern)
    - Animation: fade + scale from 0.95, 150ms

26. **Create `KpiBar.tsx`** — Viewport-attached bottom bar.
    - Row 1: 5 KpiChip components reading from store
    - Row 2: View mode buttons (refactored from existing ViewModeBar)
    - Background: `bg-card/80 backdrop-blur-sm border-t border-border`
    - Position: absolute bottom-0 within ViewportWrapper

27. **Create `KpiChip.tsx`** — Compact metric chip.

28. **Add Axis Gizmo** — drei `GizmoHelper` + `GizmoViewport` inside Canvas3D's JSX (this is the ONE place we add to Canvas3D — a non-destructive addition, not a modification).
    - Position: top-right corner
    - Click to snap to view

29. **Create `ViolationBanner.tsx`** — Viewport overlay for FLAR/BHL violations.
    - Position: bottom-left of viewport, above KPI bar
    - Shows when `overallCompliance === 'violation'`
    - Content from relevant failed checks
    - Never auto-dismisses

30. **Verify Phase 4:** Toolbar renders above 3D scene, Layers overlay opens/closes, KPI bar shows live metrics, axis gizmo renders in Canvas, violation banner appears only on violations.

### PHASE 5: KEYBOARD SHORTCUTS & INTERACTIONS

31. **Create `useKeyboardShortcuts.ts` hook** — Registers all keyboard shortcuts.
    - Uses `useEffect` with `keydown` listener
    - Only active when no text input is focused (`document.activeElement.tagName !== 'INPUT'`)
    - Maps all shortcuts from the keyboard shortcuts table

32. **Implement all keyboard shortcuts** per the table in infrastructure section.

33. **Implement panel collapse animations** — CSS transitions:
    - `transition: width var(--panel-collapse-duration) var(--panel-collapse-easing)`
    - Viewport grid column adjusts: `grid-template-columns: 0px 1fr var(--panel-width-right)` when left collapsed

34. **Implement section collapse animations** — Shadcn `Collapsible` or custom:
    - `transition: max-height var(--section-collapse-duration) ease-out`
    - Chevron: `transition: transform 200ms ease-out; transform: rotate(-90deg)` when collapsed

35. **Verify Phase 5:** All 14 keyboard shortcuts work, animations are smooth at 200ms, no layout shift during collapse.

### PHASE 6: MOBILE BOTTOM SHEET

36. **Create `BottomSheet.tsx`** — Draggable bottom sheet for mobile.
    - 3 snap points: peek (80px), half (50vh), full (85vh)
    - Drag handle: 40px wide, 4px height, rounded, centered, `bg-muted-foreground/30`
    - Touch: drag handle area is grabbable, content area scrolls normally
    - Spring physics for snap animation

37. **Create mobile-responsive `DevControlsLabV2`** — At `<768px`:
    - Replace side panels with bottom sheet
    - 4 tabs in bottom sheet: Lot, Building, Results (right panel sections 1-4), Settings
    - Viewport: full-width, min-height 40vh
    - KPI bar still attached to viewport bottom but horizontal-scroll for small screens

38. **Touch-optimize sliders** — Ensure 44px touch targets, thumb size 20px on mobile.

39. **Verify Phase 6:** Bottom sheet snaps correctly on touch devices, all tabs contain correct content, viewport always visible at ≥40vh, sliders are touch-friendly.

### PHASE 7: ACCESSIBILITY & POLISH

40. **Add ARIA labels** to all interactive elements:
    - Panel collapse buttons: `aria-label="Collapse left panel"` / `aria-expanded`
    - Collapsible sections: `role="region"` + `aria-labelledby` + `aria-expanded`
    - Sliders: `aria-label` with name and current value
    - Toolbar buttons: `aria-label` with action name
    - Layer checkboxes: `aria-label` with layer name

41. **Set focus order:** Left panel → Viewport → Right panel → Status bar.
    - Skip links if needed
    - Focus ring: `ring-2 ring-primary ring-offset-2`

42. **Color contrast audit:** Verify all text meets WCAG 2.1 AA (4.5:1 body, 3:1 large text).

43. **Dark mode verification:** Test every new component in dark mode. Fix any hardcoded colors.

44. **Performance check:**
    - Panel collapse must NOT trigger R3F re-render (use `React.memo` / `useMemo` on Canvas)
    - Layer toggles use opacity/visibility, not mount/unmount
    - All animations use CSS transitions (GPU-accelerated), not JS-driven

45. **Verify Phase 7:** VoiceOver/TalkBack can navigate all controls, dark mode works, ≥30fps on Samsung Galaxy A54 equivalent.

</task_pipeline>

<split_step_verification>

Before generating code for each phase, verify with high confidence:

1. **Data availability:** All Zustand store fields referenced in the component exist in the `DevControlsState` interface defined in `<infrastructure>`. If a field is referenced that does not exist, HALT and state what is missing.

2. **Component existence:** All existing components listed in the "Preserve" table exist in the file structure defined in `<infrastructure>`. If a component is referenced that does not exist, HALT and state what is missing.

3. **Design token existence:** All CSS variables referenced exist in the design tokens block in `<infrastructure>`. If a token is missing, HALT and state what needs to be added.

4. **No engine modification:** Verify that NO line of code written touches computation functions, Zustand store actions, or R3F Canvas scene code beyond the ONE permitted addition (GizmoHelper).

5. **No missing imports:** Every component file must import from existing Shadcn UI, Lucide React, drei, or R3F packages only. No new npm dependencies unless absolutely required (state which and why).

If ANY verification fails, output the specific failure, what data is missing, and what assumptions would need to be made to proceed. Do NOT silently assume values.

</split_step_verification>

<output_format>

For each phase, output:

### Phase N: [Title]

**Files Created/Modified:**
```
path/to/file1.tsx  — [CREATE | MODIFY]
path/to/file2.tsx  — [CREATE | MODIFY]
```

**Full File Contents:**
For each file, output the COMPLETE file content — no placeholders, no `// ...rest of component`, no truncation. Every import, every line of JSX, every Tailwind class.

**Verification Checklist:**
- [ ] Task N.1 complete: [description]
- [ ] Task N.2 complete: [description]
- [ ] No computation engine code modified
- [ ] No Zustand store schema modified
- [ ] All referenced store fields exist
- [ ] Dark mode compatible
- [ ] WCAG 2.1 AA compliant

**Phase N Summary:**
One paragraph describing what was accomplished and what the user should see when testing.

---

Repeat for all 7 phases.

</output_format>

[TRAILING NEGATIVE CONSTRAINTS]

CRITICAL RESTRICTIONS:

* DO NOT modify, refactor, or rewrite `useDevControlsStore.ts`, `devControlsEngine.ts`, or `Canvas3D.tsx` (except adding GizmoHelper as specified).
* DO NOT change any computation formula — `computeAMBF()`, `computeTGFA()`, `computeBHL()`, `computeAMVB()`, `computeDevControls()` are sacred.
* DO NOT use any CSS framework other than Tailwind CSS. No styled-components, no CSS modules, no Emotion.
* DO NOT install new npm packages without explicit justification. The stack is: Next.js 14, React 18, R3F, drei, Zustand, Tailwind, Shadcn, Lucide React.
* DO NOT use hardcoded color hex values for backgrounds, text, or borders in light/dark mode contexts. Use Tailwind semantic classes (`bg-card`, `text-foreground`, `border-border`) or CSS variables.
* DO NOT output partial code, placeholder comments like `// ...rest`, or truncated files. Every file must be COMPLETE and PRODUCTION-READY.
* DO NOT add decorative elements, animations, or gamification debris. Every pixel must earn its place (Rams Standard).
* DO NOT break the existing data flow: sliders → Zustand store → computation engine → computed values → UI display. The data pipeline direction is inviolable.
* DO NOT create separate CSS or JS files for components. All styling is Tailwind utility classes. All logic is inline in .tsx files.
* MUST ensure viewport occupies ≥60% of desktop screen width when both panels are open.
* MUST ensure no more than 8 visible controls per left-panel tab without scrolling on 1080p.
* MUST ensure right panel shows ≤5 visible sections (sections 4-5 collapsed by default).
* MUST ensure all animations are ≤200ms (exception: camera transitions at 500ms).
* MUST ensure all touch targets are ≥44px on mobile.
* MUST ensure final output is exclusively valid TypeScript/React code with zero type errors.
