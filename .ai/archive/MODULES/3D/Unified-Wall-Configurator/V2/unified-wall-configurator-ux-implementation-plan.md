# SlateCamp Unified Wall Configurator — UX & UI Implementation Plan

**Module:** Unified Wall Configurator 2.0
**Date:** April 9, 2026
**Status:** Planning
**Design Authority:** SlateCamp UX

---

## Table of Contents

1. [The UX Thesis](#1-the-ux-thesis)
2. [Research Foundation — Why Trade-Off Learning Works](#2-research-foundation)
3. [The Viewport Sanctity Rule](#3-the-viewport-sanctity-rule)
4. [Screen Layout Architecture](#4-screen-layout-architecture)
5. [The Core Type Selector — The Primary Decision Point](#5-the-core-type-selector)
6. [The Performance Dashboard — Fire, Sound, Cost, Thermal](#6-the-performance-dashboard)
7. [The BOM Panel — Material Takeoff as Learning](#7-the-bom-panel)
8. [Adaptive Parameter Panel — Show Only What Matters](#8-adaptive-parameter-panel)
9. [Interaction Flow Map](#9-interaction-flow-map)
10. [3D Viewport UX — Structural Fidelity as Pedagogy](#10-3d-viewport-ux)
11. [View Mode System](#11-view-mode-system)
12. [Annotation System UX — The No-Block Protocol](#12-annotation-system-ux)
13. [The Comparison Mode — Side-by-Side Trade-Offs](#13-the-comparison-mode)
14. [Mobile Responsive Strategy](#14-mobile-responsive-strategy)
15. [Component Library Integration](#15-component-library-integration)
16. [Microinteractions and Transitions](#16-microinteractions-and-transitions)
17. [Onboarding and First-Run Experience](#17-onboarding-and-first-run-experience)
18. [Accessibility](#18-accessibility)
19. [UX Metrics and Success Criteria](#19-ux-metrics-and-success-criteria)

---

## 1. The UX Thesis

**The wall configurator teaches construction methodology by making the invisible visible — and teaches professional judgment by making trade-offs quantifiable.**

This module serves two learning goals simultaneously:

**Goal 1 — Construction Understanding:** When a student selects "CHB" they see blocks, rebar, grout, and bond beams — the actual construction methodology used on 90% of Philippine buildings. When they select "Drywall" they see metal studs, tracks, gypsum board, and insulation. The 3D model IS the lesson. The student learns how each wall type is built by seeing its internal structure.

**Goal 2 — Professional Decision-Making:** When a student compares CHB to drywall, they see that CHB has a 2-hour fire rating but costs ₱3,200/sqm, while drywall has a 1-hour rating but costs ₱1,800/sqm and installs 3× faster. The performance dashboard makes these trade-offs explicit and quantitative. This is the professional judgment that separates a licensed architect from a student — and it's exactly what the ALE tests in professional practice questions.

**The UX serves three user modes:**

| Mode | User Intent | UX Priority |
|---|---|---|
| **Explorer** | "I want to see what's inside different wall types" | Switching core types is instant. Internal structure is revealed through section cut. The 3D model changes dramatically per type. |
| **Estimator** | "I need accurate material quantities and costs for a takeoff" | BOM panel shows exact quantities. Changing dimensions updates costs in real-time. Export/screenshot for project use. |
| **Student** | "I need to learn wall types for the ALE" | Performance dashboard compares fire/STC/cost. Presets demonstrate key scenarios. Quiz integration tests recall of construction details. |

---

## 2. Research Foundation — Why Trade-Off Learning Works

### 2.1 Decision Matrix Pedagogy (Pugh, 1981; NN/g, 2024)

Stuart Pugh's decision matrix method — comparing options against criteria to identify the best solution — is one of the most widely used decision-making frameworks in engineering education. The Nielsen Norman Group's adaptation for UX confirms that structured comparison against weighted criteria produces better decisions than intuitive preference. In architecture education, students must learn to justify wall type selection based on fire resistance, acoustic performance, cost, construction speed, and seismic behavior. The wall configurator's performance dashboard IS a decision matrix — it presents the criteria and the scores for the current assembly, allowing students to internalize the trade-offs through repeated comparison.

**Application:** The performance dashboard shows 4–6 metrics simultaneously for the current wall type. The comparison mode lets students see two types side-by-side. This trains the analytical reasoning pattern that the ALE tests: "Given a hospital corridor, which wall assembly provides the required fire rating at the lowest cost?"

### 2.2 Contrasting Cases for Construction Understanding (Schwartz & Martin, 2004)

Research on contrasting cases demonstrates that presenting two related but different examples side-by-side helps students identify the critical features that distinguish them. For wall construction: a CHB wall and a drywall partition look identical from the outside (both are painted walls) but have completely different internal structures, fire ratings, costs, and acoustic properties. The 3D section cut, which reveals internals, combined with the performance dashboard, which quantifies differences, creates a powerful contrasting case.

**Application:** Presets include paired comparisons: "CHB Standard" vs. "Drywall Equivalent." The student sees two walls of the same dimensions and finish — but radically different internals and performance metrics.

### 2.3 Productive Failure Applied to Cost Estimation (Kapur, 2014)

Students consistently underestimate wall assembly costs because they forget finish layers, reinforcement, or labor. The BOM panel is designed as a productive failure mechanism: the student sees the "core only" cost, then watches it climb as they add plaster, skim coat, primer, paint, and reinforcement. The growing cost IS the lesson — each layer adds cost, and skipping a layer has consequences (moisture penetration without plaster, poor adhesion without primer).

**Application:** The BOM starts collapsed to show only the total. Expanding it reveals each material's contribution. Students who explore the BOM learn that a "₱3,200/sqm CHB wall" is actually: ₱800 blocks + ₱600 mortar + ₱500 rebar/grout + ₱400 plaster + ₱200 skim + ₱150 primer + ₱150 paint + ₱400 labor.

### 2.4 Spatial Contiguity Principle (Mayer, 2001)

People learn better when corresponding text and visuals are presented near each other rather than far apart. For the wall configurator, this means: the dimension label for "stud spacing: 600mm" should appear near the studs in the 3D model (as a small dimension line), not in a detached panel. Performance badges (fire rating, STC) should appear in the compliance panel adjacent to the viewport — not hidden behind a navigation tab.

**Application:** The three-panel layout places controls (left), the 3D model (center), and the performance/compliance data (right) in a single view. The student never needs to navigate away from the model to see compliance data or performance metrics.

### 2.5 Cognitive Load and the 7-Core-Type Challenge (Sweller, 1988)

Seven core types × 4–6 structural parameters per type × 5 finish layers = massive parameter space. Without careful information architecture, the student drowns in options. The adaptive parameter panel (hiding parameters irrelevant to the selected core type) is the primary cognitive load management strategy.

**Application:** When CHB is selected, the student sees only CHB-relevant parameters (rebar spacing, bond beam interval, block size). Stud-related parameters are invisible. When they switch to Drywall, stud parameters appear and CHB parameters disappear. The UI adapts to the content domain of each wall type.

---

## 3. The Viewport Sanctity Rule

**Identical to the Stairway Configurator UX Plan — enforced identically.**

**No text boxes inside the 3D viewport.** The viewport renders geometry, violation colors, dimension lines, and small marker dots only. Text content lives in the side panels.

**No camera-following labels larger than a badge.** Only small circular markers (≤ 12px) and minimal numeric pills (≤ 60px) are permitted inside the viewport.

**No tooltip panels inside the viewport.** Click/hover detail appears in the compliance report panel (right side).

**Dimension lines are lines, not labels.** Thin lines with small drei `<Text>` values. No backgrounds, no borders, no card styling.

**The enforcement component** (`<ViewportContent>` wrapper with dev-mode warnings) is shared between all 3D Lab modules, not duplicated per module.

---

## 4. Screen Layout Architecture

### 4.1 Desktop Layout (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER: Module title · Breadcrumb · View mode buttons               │
├────────────┬──────────────────────────────────┬──────────────────────┤
│            │                                  │                      │
│  LEFT      │       3D VIEWPORT                │  RIGHT               │
│  PANEL     │                                  │  PANEL               │
│  (280px)   │  The wall assembly lives here.   │  (340px)             │
│            │  Structure is the pedagogy.       │                      │
│  ┌────────┐│  Studs, blocks, rebar visible    │  ┌────────────────┐ │
│  │ Core   ││  in section cut mode.            │  │ PERFORMANCE    │ │
│  │ Type   ││                                  │  │ DASHBOARD      │ │
│  │ Picker ││                                  │  │ 🔥 2hr 🔊 STC48│ │
│  ├────────┤│                                  │  │ 🌡 R-2.5 ₱3.2k│ │
│  │ Params ││                                  │  ├────────────────┤ │
│  │ (adapt-││                                  │  │ COMPLIANCE     │ │
│  │  ive)  ││                                  │  │ REPORT         │ │
│  ├────────┤│                                  │  ├────────────────┤ │
│  │ Finish ││                                  │  │ BOM PANEL      │ │
│  │ Layers ││                                  │  │ (collapsible)  │ │
│  ├────────┤│                                  │  │                │ │
│  │ Presets││                                  │  │ CHB: 188 pcs   │ │
│  └────────┘│                                  │  │ Mortar: 0.3m³  │ │
│            │                                  │  │ Rebar: 24 pcs  │ │
│            │                                  │  │ Total: ₱48,000 │ │
│            │                                  │  └────────────────┘ │
├────────────┴──────────────────────────────────┴──────────────────────┤
│  BOTTOM BAR (opt): View mode selector · Tour · Quiz · Compare toggle │
└──────────────────────────────────────────────────────────────────────┘
```

**Key differences from Stairway layout:**

1. **The right panel has three stacked sections** instead of one: Performance Dashboard (top, always visible), Compliance Report (middle), and BOM Panel (bottom, collapsible). The student scans top-to-bottom: performance → compliance → cost.
2. **The left panel's parameter section is adaptive** — it changes content based on the selected core type. This is the biggest UX difference from the stairway configurator where all parameters are always visible.
3. **The core type picker is a dedicated component** at the top of the left panel, above the parameters. It's not a regular dropdown buried in a parameter group — it's the primary decision point and deserves visual prominence.

### 4.2 Panel Collapse Behavior

Same as stairway: panels are collapsible, transitions are animated (200ms), the 3D viewport smoothly resizes, and camera angle is preserved during collapse.

---

## 5. The Core Type Selector — The Primary Decision Point

### 5.1 Why This Needs Special Treatment

The core type dropdown is not just another parameter — it's the most important decision in the module. It changes: the 3D geometry completely, which parameters are visible, which violations apply, the performance metrics, the BOM, and the cost. It is the equivalent of choosing a building material, which is a foundational architectural decision.

### 5.2 Design: Visual Card Selector

Instead of a plain dropdown, the core type selector is a **horizontal scrollable card strip** showing all 7 types as small visual cards:

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ ■■■■■■■  │ │ │ │ │ │  │ │ ═══════  │ │ ██████   │ ...
│  CHB     │ │ Drywall  │ │ Plywood  │ │ Cement   │
│  150mm   │ │  100mm   │ │  75mm    │ │  Board   │
│  ₱3.2k   │ │  ₱1.8k   │ │  ₱1.2k   │ │  ₱2.1k   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

Each card shows:
- A tiny schematic icon representing the wall type (block pattern for CHB, stud lines for drywall, etc.)
- The type name
- The core thickness
- The estimated cost per sqm (at default finish layers)

The active card is elevated with a brand-color border. Clicking a card instantly switches the core type, triggering a full geometry rebuild and parameter panel adaptation.

### 5.3 Transition Animation

When the student switches core types:
1. The 3D model cross-fades over 400ms (old geometry fades to 20% opacity while new geometry fades in from 20% to 100%). This is smoother than an instant snap and communicates that the geometry is fundamentally different.
2. The parameter panel smoothly transitions: irrelevant parameters slide up and collapse (200ms), relevant parameters slide down and appear (200ms, staggered by 50ms per parameter).
3. The performance dashboard values animate from old to new using a counting animation (e.g., fire rating counter goes from "1 hr" to "2 hr" over 300ms).
4. The BOM panel updates with a brief highlight flash on changed items.

---

## 6. The Performance Dashboard — Fire, Sound, Cost, Thermal

### 6.1 The Design

The performance dashboard is the **top section of the right panel** — always visible, never collapsed. It shows 4 metrics in a compact 2×2 grid:

```
┌─────────────────────┬─────────────────────┐
│ 🔥 FIRE RESISTANCE  │ 🔊 ACOUSTIC (STC)   │
│    2 hours          │    STC 48           │
│    ████████████░░   │    ████████████░░   │
│    RA 9514: 2hr ✓   │    IBC min 50: ✗    │
├─────────────────────┼─────────────────────┤
│ ₱  COST PER SQM     │ 🌡 THERMAL (R-VALUE) │
│    ₱3,200           │    R-2.5            │
│    ████████░░░░░░   │    ████░░░░░░░░░░   │
│    Budget: ₱3,500 ✓ │    Low insulation    │
└─────────────────────┴─────────────────────┘
```

Each metric cell shows:
- An icon for the metric category
- The current computed value (large, prominent)
- A mini progress bar showing where the value falls on a good-to-bad scale
- A requirement check (e.g., "RA 9514: 2hr ✓" in green or "IBC min 50: ✗" in red)

### 6.2 Color Coding

Each progress bar uses a universal 3-color scale:
- **Red zone:** Below minimum acceptable (fire < 1hr, STC < 35, cost > budget)
- **Amber zone:** Meets minimum but not ideal (fire 1hr, STC 35–49)
- **Green zone:** Meets or exceeds target (fire ≥ 2hr, STC ≥ 50)

### 6.3 Tap-to-Expand

Tapping a metric cell expands it to show the calculation breakdown:

```
🔥 FIRE RESISTANCE: 2 hours
├─ Base (150mm CHB, unfilled):      1 hour
├─ + Partial grout at rebar cells:  +30 min
├─ + Plaster both sides:            +30 min
└─ = Total:                         2 hours
  Requirement: RA 9514 → 2 hours for commercial ✓
```

This teaches students HOW the rating is computed — not just the final number. Each line item corresponds to a design choice they control.

### 6.4 Dynamic Updates

All 4 metrics update reactively when any parameter changes. The values animate between old and new states using a counting transition (300ms). When a metric crosses a threshold (e.g., fire rating drops below the requirement), the cell flashes the violation color briefly (200ms) to draw attention.

---

## 7. The BOM Panel — Material Takeoff as Learning

### 7.1 The Design

The BOM panel is the **bottom section of the right panel**, collapsed by default to show only a summary line:

```
┌───────────────────────────────────────┐
│  📋 BILL OF MATERIALS    ₱48,000 ▾   │  ← collapsed: total only
└───────────────────────────────────────┘
```

Expanded:

```
┌───────────────────────────────────────┐
│  📋 BILL OF MATERIALS         ▴       │
├───────────────────────────────────────┤
│  CORE — CHB 150mm                     │
│  ├ CHB Blocks (150×200×400)  188 pcs  │
│  │                     @ ₱18 = ₱3,384 │
│  ├ Mortar (1:3)         0.30 cu.m.    │
│  │                    @ ₱3.5k = ₱1,050│
│  ├ Rebar 10mm           24 pcs (6m)   │
│  │                     @ ₱85 = ₱2,040 │
│  └ Grout                0.15 cu.m.    │
│                       @ ₱4.0k = ₱600  │
├───────────────────────────────────────┤
│  FINISH — Front Side                  │
│  ├ Plaster (1:3)        0.20 cu.m.    │
│  │                    @ ₱3.5k = ₱700  │
│  ├ Skim Coat            3.0 bags      │
│  │                    @ ₱350 = ₱1,050 │
│  ├ Primer               1.5 liters    │
│  │                    @ ₱200 = ₱300   │
│  └ Paint                1.5 liters    │
│                       @ ₱250 = ₱375   │
├───────────────────────────────────────┤
│  LABOR                                │
│  ├ Mason + Helper       2 days        │
│  │                  @ ₱1.8k = ₱3,600  │
│  └ Painter              1 day         │
│                       @ ₱900 = ₱900   │
├───────────────────────────────────────┤
│  Waste Factor (10%)            ₱1,310 │
│  ─────────────────────────────────────│
│  TOTAL                       ₱15,309  │
│  Per sq.m.                     ₱1,021 │
└───────────────────────────────────────┘
```

### 7.2 Pedagogical Design

The BOM is grouped by construction stage (Core → Finish → Labor → Waste), not by material type. This teaches the construction sequence: you buy blocks first, then mortar, then rebar — that's the core. Then plaster, skim, primer, paint — that's the finish. Then you need masons and painters — that's labor. Then account for breakage and waste.

Each line item shows: material name, quantity with unit, unit cost, and line total. Students can mentally trace from the 3D model (where they see the layers) to the BOM (where they see the cost of each layer).

### 7.3 Real-Time Updates

When the student changes wall dimensions (length × height), all quantities recalculate instantly. When they toggle a finish layer off, its BOM entry disappears and the total decreases. This instant feedback loop teaches cost sensitivity: "If I skip the skim coat, I save ₱1,050 — but the paint finish will be rougher."

### 7.4 Philippine Price Accuracy Note

Material prices are stored in a separate constants file (`wall-constants-performance.ts`) and are flagged as approximate with a last-updated date. A small disclaimer at the bottom of the BOM reads: "Prices are approximate Metro Manila rates as of [date]. Actual prices vary by region and supplier."

---

## 8. Adaptive Parameter Panel — Show Only What Matters

### 8.1 The Core Problem

The wall configurator has ~20+ parameters when all core types' options are counted. Showing all of them simultaneously would overwhelm the student and violate Sweller's cognitive load principles. The solution: **the parameter panel adapts its content based on the selected core type.**

### 8.2 Parameter Visibility Matrix

| Parameter Group | CHB | Drywall | Plywood | Cement Board | Brick | Concrete | Existing |
|---|---|---|---|---|---|---|---|
| **Dimensions** (length, height) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Structural — Masonry** (rebar spacing, diameter, bond beam, CHB size, stiffener, grouting) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Structural — Framing** (stud spacing, stud depth, gypsum thickness, gypsum layers, insulation, bridging) | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Structural — RC** (rebar mesh spacing, rebar diameter) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Finish Layers** (plaster, skim, primer, paint, color) | ✅ | ✅* | ✅* | ✅* | ✅ | ✅ | ✅ |
| **Treatment Sides** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*Plaster toggle is hidden for drywall/plywood/cement board (not applicable — replaced by gypsum board joint treatment).

### 8.3 Transition Animation

When the student switches core types:
- Parameters that are no longer applicable **slide up and collapse** (200ms ease-out, staggered).
- Parameters that are newly applicable **slide down and expand** (200ms ease-in, staggered by 50ms offset).
- Parameters that remain (dimensions, finish layers, sides) stay in place — no animation.

This creates a smooth "breathing" effect where the panel reshapes itself for the new context. The student never sees a jarring snap.

### 8.4 Structural Parameter Group — Accordion

For each core type, the structural parameters are grouped under a collapsible "Structure" accordion section. The header shows the structural system name: "Masonry Reinforcement" for CHB, "Metal Framing" for drywall, "Reinforcement Mesh" for concrete. The accordion is expanded by default for first-time exploration and remembers its state per session.

---

## 9. Interaction Flow Map

### 9.1 First-Time Flow

```
1. Module loads → Default "Standard CHB Room" preset
   → Model shows CHB wall with plaster + primer + paint
   → Performance dashboard: 🔥 1hr | 🔊 STC 45 | ₱ 3,200/sqm | 🌡 R-1.8
   → Toast: "Select a wall type or try Section Cut to see inside"

2. Student taps "Section Cut" view button
   → Camera transitions to 3/4 section view (~800ms)
   → Representative section reveals: CHB blocks with hollow cells,
     mortar joints, vertical rebar in grouted cells
   → Student sees the REAL construction of a CHB wall for the first time

3. Student taps "Drywall" in the core type card selector
   → Geometry cross-fades to drywall framing (400ms)
   → Left panel: CHB params collapse, drywall params appear (200ms)
   → Performance dashboard: values animate to 🔥 1hr | 🔊 STC 35 | ₱ 1,800/sqm
   → Student sees: metal studs, tracks, gypsum board — completely different structure

4. Student expands BOM panel
   → Sees material breakdown: studs, boards, screws, insulation, finish layers
   → Understands the cost composition of a drywall partition

5. Student toggles "Show Insulation"
   → Insulation batts appear between studs in the 3D model
   → STC rating in dashboard jumps from 35 → 43 (animated counting)
   → BOM: insulation line item appears, total cost increases
   → Student learns: insulation improves acoustics but adds cost
```

### 9.2 Comparison Flow

```
1. Student clicks "Compare" button (or preset: "CHB vs Drywall")
   → Screen splits: left viewport shows CHB, right viewport shows Drywall
     (or: single viewport with ghost overlay of the comparison type)
   → Performance dashboard shows both types side-by-side
   → BOM shows both types with a delta column

2. Student reads comparison:
   → Fire: CHB 2hr vs Drywall 1hr → CHB wins
   → STC: CHB 48 vs Drywall 43 → CHB wins
   → Cost: CHB ₱3,200 vs Drywall ₱1,800 → Drywall wins
   → Speed: CHB 3 days vs Drywall 1 day → Drywall wins

3. Student understands the trade-off:
   → "CHB is better for fire and sound but costs more and takes longer"
   → This is the professional judgment the ALE tests
```

### 9.3 Estimator Flow

```
1. Student enters project dimensions: 5m × 3m wall
2. Selects core type: CHB 150mm
3. Configures finish: plaster + skim + primer + paint (both sides)
4. Adds reinforcement: rebar at 800mm, bond beams every 3rd course
5. Expands BOM → sees complete material list with quantities and costs
6. Screenshots BOM for project reference (or exports if feature exists)
```

---

## 10. 3D Viewport UX — Structural Fidelity as Pedagogy

### 10.1 Visual Hierarchy Inside the Viewport

| Priority | Signal | Visual Treatment |
|---|---|---|
| **1** | Core structure (blocks, studs, rebar) | Solid opaque geometry, core type's base color |
| **2** | Finish layers | Semi-transparent overlays, layer-specific colors |
| **3** | Violation color on affected elements | Solid color override on violating geometry |
| **4** | Dimension value pills | Small monospace pills (≤ 60px) at measurement points |
| **5** | Selection highlight | Bright outline pulse via Edges component |
| **6** | Ghost geometry (comparison, waterproofing) | 15–25% opacity overlays |

### 10.2 Color System for Wall Types

Each core type has a dedicated base color that the student learns to associate with the material:

| Core Type | Base Color | Hex | Rationale |
|---|---|---|---|
| CHB | Warm gray | `#a8a29e` | Matches real concrete block |
| Drywall / Gypsum | Off-white | `#f5f5f4` | Matches real gypsum board |
| Plywood | Warm brown | `#c2956b` | Matches natural plywood |
| Cement Board | Cool gray | `#d6d3d1` | Matches HardieFlex |
| Brick | Burnt orange | `#b45309` | Matches red/orange brick |
| Solid Concrete | Dark gray | `#78716c` | Matches poured concrete |
| Existing Wall | Light neutral | `#e7e5e4` | Intentionally generic |

These colors are already defined in the current `CORE_CONFIGS` — preserve them exactly.

### 10.3 Structural Element Colors

Structural sub-elements within the core type use accent colors to distinguish them from the core body:

| Element | Color | Hex | Used In |
|---|---|---|---|
| Metal stud | Steel silver | `#94a3b8` | Drywall, plywood, cement board |
| Metal track | Steel silver (darker) | `#64748b` | Drywall, plywood, cement board |
| Rebar | Dark steel | `#374151` | CHB, concrete |
| Grout fill | Concrete gray | `#6b7280` | CHB (in cells containing rebar) |
| Insulation (fiberglass) | Pink | `#fda4af` | Drywall (between studs) |
| Insulation (mineral wool) | Yellow | `#fde047` | Drywall (between studs) |
| Bond beam | Highlighted gray | `#9ca3af` | CHB (grouted course) |
| Mortar joint | Slightly darker than core | Per `CORE_CONFIGS` | CHB, brick |

### 10.4 Section Cut Visual Treatment

When section cut is active:
- The wall to the right of the cut plane renders at **overview LOD** — simplified solid with mortar face pattern.
- The wall to the left (representative section) renders at **full structural detail** — individual blocks with hollow cells visible, studs with C-profile, rebar in grouted cells.
- The cut boundary is a clean vertical edge with a subtle 2px white outline to clearly delineate where simplified meets detailed.
- Non-structural elements (finish layers) are rendered semi-transparent on the detailed side to avoid obscuring the structural core.

---

## 11. View Mode System

### 11.1 View Mode Buttons

A horizontal button strip in the header or at the top of the viewport:

```
[ Overview ] [ Section Cut ] [ Exploded ] [ Build ] [ Compare ]
```

Only one mode is active at a time. The active button has a filled background; inactive buttons are outlined.

### 11.2 View Mode Descriptions

**Overview:** The default state. The wall at full scale, core rendered as a simplified body with mortar face decoration (current behavior). Finish layers visible as stacked transparent boxes. Good for overall assembly understanding and cost estimation.

**Section Cut:** The primary learning mode. Reveals internal structure through a vertical cut plane. Students see the actual construction components: studs, blocks, rebar, grout, insulation. The camera transitions to a 3/4 angle that best reveals the exposed cross-section.

**Exploded:** A slider (0–100%) separates layers from the core outward with visible gaps. Each exploded layer shows a floating label with: layer name, thickness, and material description. Good for understanding the finish sequence and identifying individual layers.

**Build:** A step-through animation showing the construction sequence from foundation to finish. Each step pauses with an annotation. The student controls pace with "Next Step" / "Previous Step" buttons. Steps follow the real construction sequence for the selected core type.

**Compare:** Activates the comparison mode (Section 13). Shows two wall types side-by-side with a shared performance dashboard highlighting differences.

---

## 12. Annotation System UX — The No-Block Protocol

### 12.1 Annotation Placement Rules

Same as stairway configurator. All annotations follow the Viewport Sanctity Rule. Violation messages, code citations, material descriptions, and performance data live in the right panel. The viewport shows only small dimension value pills and thin dimension lines.

### 12.2 Wall-Specific Dimension Annotations

| Annotation | Position | Content |
|---|---|---|
| Wall height | Left edge, vertical line | "3000 mm" |
| Wall length | Bottom, horizontal line | "5000 mm" |
| Core thickness | Top edge or side, horizontal | "150 mm" |
| Total build-out | Right edge, horizontal | "Total: 182 mm" |
| Stud spacing | Between two studs, mid-height | "600 mm o.c." (section cut only) |
| Rebar spacing | Between two rebar, mid-height | "800 mm o.c." (section cut only) |
| Layer thickness | At each layer in exploded view | "Plaster: 12.7 mm" |

### 12.3 Performance Badges — Always in the Panel

Fire rating, STC, R-value, and cost are NEVER displayed as floating elements in the viewport. They live permanently in the performance dashboard (top of right panel). This is non-negotiable.

---

## 13. The Comparison Mode — Side-by-Side Trade-Offs

### 13.1 Implementation Options

**Option A — Split Viewport:** Two 3D viewports side by side, each showing a different wall type. Cameras are synced (orbiting one orbits both). Performance dashboard shows both types in a comparison table.

**Option B — Ghost Overlay:** Single viewport. The selected wall type renders solid. The comparison type renders as ghost geometry (20% opacity) overlaid at the same position. Performance dashboard shows both with delta values.

**Recommended: Option A for desktop (enough screen space), Option B for mobile (single viewport preserves model size).**

### 13.2 Comparison Dashboard

When comparison mode is active, the performance dashboard transforms:

```
┌─────────────────────────────────────────────┐
│  COMPARE: CHB 150mm vs Drywall 92mm         │
├──────────────┬──────────────┬───────────────┤
│  Metric      │  CHB         │  Drywall      │
├──────────────┼──────────────┼───────────────┤
│  🔥 Fire     │  2 hours  ✓  │  1 hour   ⚠  │
│  🔊 STC      │  48       ✓  │  43       ⚠  │
│  ₱ Cost/sqm  │  ₱3,200   ⚠  │  ₱1,800   ✓  │
│  🌡 R-Value   │  R-1.8    ⚠  │  R-3.2    ✓  │
│  ⏱ Speed     │  3 days   ⚠  │  1 day    ✓  │
│  ⚡ Seismic   │  Excellent ✓  │  Moderate ⚠  │
├──────────────┼──────────────┼───────────────┤
│  WINNER      │  3 / 6       │  3 / 6       │
│              │  Durability  │  Economy      │
└──────────────┴──────────────┴───────────────┘
```

The ✓ and ⚠ indicators show which type wins on each metric. The summary row counts wins. This is the decision matrix pedagogical pattern applied to wall type selection.

### 13.3 Paired Comparison Presets

Pre-built comparison presets for the most pedagogically valuable comparisons:

| Preset | Type A | Type B | Learning Point |
|---|---|---|---|
| "CHB vs Drywall" | CHB 150mm | Drywall 92mm | Fire/acoustic vs cost/speed trade-off |
| "Bearing vs Non-Bearing CHB" | CHB 150mm bearing | CHB 100mm partition | Structural sizing |
| "Single vs Double Gypsum" | 1-layer drywall | 2-layer drywall | Fire rating jump |
| "With vs Without Insulation" | Drywall, no insulation | Drywall + fiberglass | STC improvement |
| "Brick vs CHB" | Brick 200mm | CHB 150mm | Material tradition vs standard practice |

---

## 14. Mobile Responsive Strategy

### 14.1 Mobile Layout (< 768px)

```
┌──────────────────────────────┐
│  HEADER: Title · ≡ Menu      │
├──────────────────────────────┤
│  CORE TYPE CARD STRIP        │  ← Horizontal scroll, always visible
│  [CHB] [Drywall] [Plywood]..│
├──────────────────────────────┤
│  VIEW MODE: [Overview][Cut]  │
├──────────────────────────────┤
│                              │
│     3D VIEWPORT              │  ← Full width, ~50% height
│     (full width)             │
│                              │
├──────────────────────────────┤
│  ─── PERFORMANCE (always) ───│  ← Compact: 🔥 2hr | 🔊 48 | ₱ 3.2k
├──────────────────────────────┤
│  ─── DETAILS (swipe up) ────│  ← Bottom sheet with tabs:
│  [Params] [BOM] [Compliance] │    [Params] [BOM] [Compliance]
└──────────────────────────────┘
```

**Key mobile decisions:**

1. **Core type card strip stays above the viewport** — it's the primary decision point and must be always accessible.
2. **Performance dashboard is compressed to a single line** below the viewport — always visible, shows 3 key values.
3. **Details live in a tabbed bottom sheet** with three tabs: Parameters, BOM, Compliance. The student swipes up to access; swipes down to dismiss.
4. **Comparison mode on mobile uses ghost overlay** (Option B) — not split viewport.

---

## 15. Component Library Integration

### 15.1 Existing Components to Reuse

Same as stairway configurator: `<Toggle>`, `<Slider>`, `<Select>`, `<Card>`, `<Badge>`, `<Tooltip>`, `<Accordion>`, `<Sheet>`, `<Drawer>`, `<Button>`, `<ScrollArea>`.

### 15.2 New Components to Create

| Component | Purpose | Add to Storybook |
|---|---|---|
| `<CoreTypeCard>` | Single wall type selector card with icon, name, thickness, cost | Yes |
| `<CoreTypeCardStrip>` | Horizontal scrollable strip of CoreTypeCards | Yes |
| `<PerformanceDashboard>` | 2×2 grid of performance metric cells with progress bars | Yes |
| `<PerformanceMetricCell>` | Single metric: icon, value, progress bar, requirement check | Yes |
| `<BOMPanel>` | Collapsible bill of materials with grouped line items | Yes |
| `<BOMLineItem>` | Single material: name, quantity, unit cost, subtotal | Yes |
| `<BOMGroupHeader>` | Section header (Core, Finish, Labor) with subtotal | Yes |
| `<ComparisonDashboard>` | Side-by-side performance comparison table with win indicators | Yes |
| `<ViewModeButtonStrip>` | Horizontal toggle group for view modes | Yes |
| `<AdaptiveParameterGroup>` | Parameter group that shows/hides based on core type | Yes |
| `<LayerStackDiagram>` | Small schematic showing layer order in the panel (not viewport) | Yes |

### 15.3 Shared with Stairway Configurator

The following new components are defined in the stairway UX plan and should be shared:

- `<ComplianceLawCard>` — per-law compliance card (NSCP, PD 1096, RA 9514)
- `<ViolationRow>` — single violation within a law card
- `<PassRow>` — single passing check
- `<ComplianceSummaryBadge>` — ALL PASS / N ISSUES badge
- `<DimensionSlider>` — slider with threshold markers
- `<FixButton>` — animated fix action
- `<LawActivationDot>` — colored dot showing active law

These are defined once, used across both modules.

---

## 16. Microinteractions and Transitions

### 16.1 Timing Table

| Action | Feedback | Timing |
|---|---|---|
| Core type card tap | Geometry cross-fade | 400ms |
| Core type card tap | Parameter panel adapts | 200ms per param group |
| Core type card tap | Performance values animate | 300ms counting |
| Core type card tap | BOM items update | 200ms highlight flash |
| Slider drag | 3D model + BOM + perf update | < 16ms (every frame) |
| Toggle finish layer | Layer appears/disappears | 250ms opacity |
| Toggle finish layer | BOM line item appears/disappears | 200ms slide |
| Toggle finish layer | Cost total updates | 300ms counting |
| View mode switch | Camera transition | 600–800ms ease-out |
| View mode switch | Geometry LOD change | 300ms |
| BOM expand | Panel slides open | 250ms ease-out |
| Comparison activate | Split viewport or ghost overlay | 400ms |
| Performance threshold cross | Metric cell flash | 200ms |

---

## 17. Onboarding and First-Run Experience

### 17.1 First-Run Hints

Same lightweight approach as the stairway configurator — no modals, no multi-step wizards.

1. **On load:** Toast: "Tap a wall type above, or try Section Cut to see inside the wall."
2. **On first section cut:** Brief highlight pulse on the exposed structural elements.
3. **On first core type switch:** The performance dashboard briefly glows to draw attention to the changing values.
4. **On first BOM expand:** A tooltip: "This shows every material and its cost for this wall."
5. **After 3 interactions:** No more hints.

---

## 18. Accessibility

Same as stairway configurator: WCAG 2.1 AA compliance, keyboard navigation, screen reader support, reduced motion, and 48px touch targets. The right panel provides a complete text-based representation of all performance and BOM data, making the 3D viewport supplementary.

---

## 19. UX Metrics and Success Criteria

### 19.1 Engagement Metrics

| Metric | Target | Measurement |
|---|---|---|
| Core types explored per session | ≥ 3 of 7 types | Analytics: core type switch events |
| Section cut activation rate | > 60% of users | Analytics: view mode events |
| BOM panel expansion rate | > 40% of users | Analytics: BOM expand events |
| Performance dashboard read rate | > 80% (proxy: scroll position) | Analytics: panel visibility tracking |
| Comparison mode usage | > 25% of users | Analytics: compare activation |
| Session duration | 4–10 minutes | Analytics: time on module |
| Return rate | > 35% within 7 days | Analytics: revisit tracking |

### 19.2 Learning Metrics

| Metric | Target | Measurement |
|---|---|---|
| Wall type recall | > 70% can name 4+ types after 1 session | Quiz: "Name 4 wall types used in PH construction" |
| Construction understanding | > 60% can describe drywall framing after section cut | Quiz: "What are the structural elements in a drywall partition?" |
| Performance trade-off reasoning | > 50% can explain CHB vs drywall trade-offs | Quiz: scenario-based selection question |
| Material quantity recall | > 40% can estimate CHB count per sqm | Quiz: "How many 150mm CHB per square meter?" |
| Fire rating knowledge | > 60% can match wall types to fire ratings | Quiz: matching exercise |

### 19.3 Estimator Metrics

| Metric | Target | Measurement |
|---|---|---|
| BOM accuracy check | Students verify BOM against manual calculation | Quiz: "Calculate CHB count for a 4m × 3m wall" |
| Cost estimation confidence | Students trust the tool's cost output | Survey: "How confident are you in this cost estimate?" |
| Export/screenshot rate | > 15% of users screenshot or export BOM | Analytics: screenshot/export events |

---

## Appendix: Research Sources

1. Pugh, S. (1981). Concept selection: A method that works. *Proceedings of the International Conference on Engineering Design (ICED)*, 497–506. (Decision matrix method)
2. Nielsen Norman Group (2024). Using Prioritization Matrices to Inform UX Decisions. URL: https://www.nngroup.com/articles/prioritization-matrices/
3. Schwartz, D. L. & Martin, T. (2004). Inventing to prepare for future learning. *Cognition and Instruction*, 22(2), 129–184. (Contrasting cases)
4. Kapur, M. (2014). Productive failure in learning math. *Cognitive Science*, 38(5), 1008–1022.
5. Mayer, R. E. (2001). *Multimedia Learning*. Cambridge University Press. (Spatial contiguity, coherence, signaling principles)
6. Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science*, 12(2), 257–285. (Cognitive load management for parameter-heavy interfaces)

---

*This document governs all UX decisions for the Unified Wall Configurator. The model teaches construction. The dashboard teaches trade-offs. The BOM teaches estimation. The comparison teaches professional judgment.*

*Last updated: April 9, 2026*
