# SlateCamp Unified Wall Configurator — Technical Feature Implementation Plan

**Module:** `unified-wall-configurator.ts`
**Version:** 2.0 — Structurally Faithful Architecture
**Date:** April 9, 2026
**Status:** Planning — No code changes yet
**Author:** SlateCamp Engineering

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [Current Architecture Audit](#2-current-architecture-audit)
3. [Architectural Principles — The Laws of This Module](#3-architectural-principles)
4. [Target Architecture — The Multi-Core System](#4-target-architecture)
5. [The Core Type Registry — Polymorphic Geometry](#5-the-core-type-registry)
6. [The Geometry Pipeline](#6-the-geometry-pipeline)
7. [The Performance Engineering Layer](#7-the-performance-engineering-layer)
8. [The Computation Engine](#8-the-computation-engine)
9. [The Violation and Compliance System](#9-the-violation-and-compliance-system)
10. [The Annotation and Information Layer](#10-the-annotation-and-information-layer)
11. [The Interaction System](#11-the-interaction-system)
12. [View Modes](#12-view-modes)
13. [State Management Architecture](#13-state-management-architecture)
14. [Feature Implementation Registry](#14-feature-implementation-registry)
15. [File and Module Structure](#15-file-and-module-structure)
16. [Do's and Don'ts — The Hard Rules](#16-dos-and-donts)
17. [Testing and Validation Protocol](#17-testing-and-validation-protocol)
18. [Glossary](#18-glossary)

---

## 1. Purpose and Scope

This document is the single source of truth for all technical decisions related to the Unified Wall Configurator module. It governs the existing layered cross-section system and every planned enhancement — from drywall framing visualization to fire resistance rating computation.

**The core challenge of this module is fundamentally different from the stairway configurator.** The stairway configurator has one geometry type (a straight-run stair) with multiple laws. The wall configurator has **seven completely different geometry types** (CHB, drywall, plywood, cement board, brick, solid concrete, existing wall) each requiring a **different internal structure** — and they share a common finish layer system. This is a polymorphic geometry problem: the geometry pipeline must branch per core type while maintaining a unified interface.

**The governing question:** "When a student selects 'Drywall Partition,' do they see a wall assembly that matches what they would see on a Philippine construction site — metal studs, tracks, gypsum board, screws — or do they see a gray box?"

---

## 2. Current Architecture Audit

### 2.1 What Exists Today

The module is a single `ParametricSceneConfig` (~605 lines) containing:

**Parameters** — 9 inputs in 4 groups: Dimensions (wallLength, wallHeight), Wall Type (coreType dropdown with 7 options), Treatment Sides (sides dropdown), and Finish Layers (showPlaster, showSkimCoat, showPrimer, showPaint toggles + paintColor dropdown).

**Core Type Configuration** — A `CORE_CONFIGS` record mapping each `CoreType` to a `CoreConfig` object containing: thickness, color, label, mortar pattern flag, mortar spacing, and plaster support flag. This is the polymorphic dispatch mechanism — geometry decisions branch on `coreType`.

**Geometry Builder** — Produces: a ground plane, a wall core body (single box), mortar pattern lines (horizontal bed joints + vertical head joints in running bond for CHB/brick), and finish layers (plaster, skim coat, primer, paint) stacked outward from the core face using a `frontOffset`/`backOffset` accumulator. Also produces a thickness edge indicator.

**Violations** — 3 rules: height below 2400mm minimum, CHB thickness informational note, and brick height > 3600mm engineering review.

**Annotations** — 4 hotspots: wall height, core thickness, finish layer stack callout, and total build-out.

**Presets** — 7 scenarios covering all core types.

### 2.2 Structural Assessment

**The core geometry is the problem.** Every wall type — including drywall (a framed system), CHB (a unit masonry system), and brick (a masonry system) — is rendered as a **single solid box** with optional face decoration (mortar lines). The interior structure (studs, rebar, grout, insulation, hollows) is completely absent.

**The layer system is sound but limited.** The `addLayer()` helper with `frontOffset`/`backOffset` accumulation is a good pattern. However, it only produces full-face boxes. It cannot express partial layers (waterproofing that stops at 1800mm) or perforated layers.

**No performance data.** Fire resistance, acoustic (STC), thermal (R-value), and cost data are absent.

### 2.3 What Works Well and Must Be Preserved

- The **CoreType → CoreConfig dispatch pattern** is architecturally correct.
- The **layer stacking with offset accumulation** is a sound pattern.
- The **paint color system** with named colors mapping to hex values is user-friendly.
- The **"Both Sides" vs "1 Side" treatment** correctly models the real-world decision.

---

## 3. Architectural Principles — The Laws of This Module

### Principle 1: Core Types Are Polymorphic — Geometry Branches, Interface Unifies

Each core type has a completely different internal geometry but shares a common external interface (layer system, dimension parameters, violation system, annotation system). The geometry pipeline must branch per core type and delegate to type-specific sub-builders. Downstream systems are core-type-agnostic — they read from `ComputedWallState`.

*Why:* Adding a new core type (e.g., AAC Block) should require only a new registry entry and a new geometry sub-builder. Everything else works automatically.

### Principle 2: Structural Elements Are First-Class Geometry

Studs, tracks, rebar, grout, knockouts, bridging, and block cells are rendered as 3D geometry — not texture maps, not decals, not face lines. When a student orbits the wall, they see the C-profile of a stud, the hollow cells of a CHB, and the rebar running through grouted cells.

*Why:* A student who sees individual studs at 600mm spacing with gypsum board screwed to the flanges has a construction-site-level understanding that no flat box can provide.

### Principle 3: Detail is LOD-Gated

Three levels of detail depending on view mode:

- **Overview (default):** Simplified representative geometry. Not every individual block for a 5m wall.
- **Section Cut:** Full detail on the cut plane — individual block cells, rebar, stud C-profiles, insulation.
- **Detail View:** Zoomed-in to a single connection or element with full parametric detail.

*Why:* A 5m × 3m CHB wall contains ~187 blocks. Rendering each as a hollow 3D object would produce ~10,000+ triangles just for the core. LOD keeps the overview fast while providing detail where the student is looking.

### Principle 4: Performance Data Is Computed, Not Hard-Coded

Fire resistance, STC, R-value, and cost are computed from the current assembly configuration using formula-based estimators. When the student adds insulation, the STC increases by 6–10 points in real-time. When they switch to double-layer gypsum, the fire rating jumps from 30 minutes to 1 hour.

### Principle 5: Existing ParametricSceneConfig Interface Is Sacred

All changes must be backward-compatible. The module remains a single config object. New geometry types are expressed through the existing `GeometryInstruction` type system (extended if needed, never replaced).

### Principle 6: The Layer System Is Universal

The finish layer system applies identically to all core types that support it. The layer stacking logic lives in a shared utility, not duplicated per core type.

### Principle 7: Mobile Performance Is Non-Negotiable

30fps sustained on a Realme C55. Aggressive LOD, instanced geometry, and demand-mode rendering.

---

## 4. Target Architecture — The Multi-Core System

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PARAMETER LAYER                              │
│  Wall dimensions, core type selector, finish toggles, view mode     │
│  + Advanced: stud spacing, rebar interval, insulation, MEP          │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      COMPUTATION ENGINE                             │
│                                                                     │
│  ┌───────────────┐  ┌────────────────┐  ┌────────────────────┐     │
│  │ Assembly       │  │ Performance    │  │ Material           │     │
│  │ Resolver       │  │ Estimator      │  │ Quantity (BOM)     │     │
│  │                │  │                │  │                    │     │
│  │ • total thick  │  │ • fire rating  │  │ • CHB count/sqm   │     │
│  │ • layer stack  │  │ • STC rating   │  │ • stud count       │     │
│  │ • compliance   │  │ • R-value      │  │ • board sheets     │     │
│  │               │  │ • cost/sqm     │  │ • mortar volume    │     │
│  └───────┬───────┘  └───────┬────────┘  └────────┬───────────┘     │
│          ▼                  ▼                     ▼                  │
│  ┌──────────────────────────────────────────────────┐               │
│  │              ComputedWallState                   │               │
│  └──────────────────────┬───────────────────────────┘               │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
          ┌───────────────┼────────────────┬──────────────┐
          ▼               ▼                ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────────┐
│  GEOMETRY    │ │  VIOLATION   │ │ ANNOTATION │ │  VIEW MODE       │
│  PIPELINE    │ │  SYSTEM      │ │ LAYER      │ │  SYSTEM          │
│              │ │              │ │            │ │                  │
│  DISPATCH    │ │ PD 1096      │ │ Hotspots   │ │ Overview         │
│  by core     │ │ NSCP         │ │ Dim lines  │ │ Section Cut      │
│  type:       │ │ RA 9514      │ │ Fire badge │ │ Exploded         │
│              │ │ Fire req     │ │ STC badge  │ │ Build Sequence   │
│  • CHB       │ │ STC req      │ │ BOM panel  │ │ Detail View      │
│  • Drywall   │ │              │ │            │ │                  │
│  • Brick     │ │              │ │            │ │                  │
│  • Generic   │ │              │ │            │ │                  │
│  + Shared    │ │              │ │            │ │                  │
│    Layer     │ │              │ │            │ │                  │
│    Builder   │ │              │ │            │ │                  │
└──────────────┘ └──────────────┘ └────────────┘ └──────────────────┘
```

### The Key Design: CoreTypeGeometryBuilder Interface

Each core type implements a builder contract:

- `buildOverview(state)` → instructions at simplified LOD
- `buildSectionCut(state, cutConfig)` → instructions at full structural detail
- `buildDetailView(state, focusConfig)` → instructions at zoomed connection-level detail
- `getPerformanceInputs()` → data for fire/STC/R-value calculation

The geometry pipeline dispatches to the correct builder based on `coreType`, calls the method matching the current view mode, then appends shared finish layer instructions.

---

## 5. The Core Type Registry — Polymorphic Geometry

### 5.1 Extended Registry Structure

The existing `CORE_CONFIGS` is extended with structural metadata:

- `structuralSystem`: `'unit-masonry'` | `'framed'` | `'panel'` | `'monolithic'` — determines which sub-builder handles this type
- `isLoadBearing`: boolean or `'configurable'` — affects violation rules
- `supportsInsulation`, `supportsWaterproofing`, `supportsMEP` — capability flags for parameter visibility gating
- `hasInternalCavity` — whether the type has a cavity (drywall stud cavity, CHB hollow cells)
- Base performance data: `baseFireRatingMinutes`, `baseSTC`, `baseRValue`, `baseCostPerSqm`
- Material quantities: `unitsPerSqm` (12.5 for CHB, ~50 for brick, null for non-unit types), `mortarVolumePerSqm`

### 5.2 Geometry Characteristics Per Core Type

| Core Type | System | Key Geometry | Internal Detail | LOD Challenge |
|---|---|---|---|---|
| **CHB** | Unit masonry | Blocks in running bond, hollow cells | Vertical/horizontal rebar, grout, bond beams | High (12.5 blocks/sqm) |
| **Drywall** | Framed | C-studs + U-tracks + gypsum board | Knockouts, insulation, bridging | Medium (studs are simple extrusions) |
| **Plywood** | Panel | Plywood sheets on light frame | Wood/metal studs, sheet joints | Medium |
| **Cement Board** | Panel | HardieFlex on metal studs | Same as drywall with different board | Medium |
| **Brick** | Unit masonry | Bricks in running bond | Mortar joints, wall ties | High (50 bricks/sqm) |
| **Solid Concrete** | Monolithic | Cast-in-place RC slab | Rebar mesh, formwork tie holes | Low (simple box + rebar) |
| **Existing Wall** | Generic | Simplified solid box | None — represents unknown internals | None (simplest type) |

---

## 6. The Geometry Pipeline

### 6.1 Design Rules

**Rule: GeometryInstructions remain the only output.** No direct Three.js in the builder.

**Rule: Dispatch is explicit and exhaustive.** A TypeScript exhaustive `switch` on `coreType` — no `default` fallback. Missing cases are compile-time errors.

**Rule: Finish layers are built by a shared utility.** `buildFinishLayers(state, instructions)` appends layers to any core type's array. Sub-builders never build finish layers.

**Rule: IDs are semantic.** `core-chb-block-{i}`, `struct-stud-{i}`, `struct-rebar-v-{i}`, `layer-front-plaster`, etc.

### 6.2 Instanced Geometry Pattern

A new `GeometryInstruction` variant for repeated elements:

```
InstancedGeometryInstruction {
  id: string
  type: 'instanced'
  shapeType: 'box' | 'cylinder'
  shapeArgs: number[]
  positions: [number, number, number][]
  rotations?: [number, number, number][]
  color: string
  opacity?: number
  transparent?: boolean
}
```

8 drywall studs = 1 instanced instruction = 1 draw call. 45 CHB blocks in the representative section = 1 instanced instruction = 1 draw call.

**Backward-compatible:** Existing modules producing only single instructions continue to work unchanged. The renderer detects `type: 'instanced'` and uses `<Instances>`.

### 6.3 Representative Section Strategy

For unit masonry (CHB, brick), rendering every block in a 5m wall is prohibitive. Instead:

- **~80% of the wall** renders as a simplified solid box with mortar face lines (current behavior).
- **~20% (representative section)** renders individual blocks/bricks with full internal detail (cells, rebar, grout).
- The section boundary is a visible vertical edge where solid meets detail.
- The representative section is 3 blocks wide (~1200mm for CHB, ~600mm for brick).
- Total: ~38 block instances instead of ~187 = manageable draw call count.

### 6.4 Drywall Sub-Builder Output

1. Bottom U-track: box at floor level
2. Top U-track: box at ceiling level
3. C-studs: instanced boxes at `studSpacing` intervals
4. Gypsum board front: flat box (semi-transparent in cutaway)
5. Gypsum board back: same (if both sides)
6. Insulation batts: instanced boxes between studs (optional)
7. Horizontal bridging: instanced thin bars through knockouts (optional)

### 6.5 CHB Sub-Builder Output

1. Simplified wall body (majority of width)
2. Representative section blocks: instanced geometry
3. Mortar joints in representative section: thin instanced boxes
4. Vertical rebar: instanced cylinders at rebar spacing (optional)
5. Horizontal rebar: instanced cylinders in bond beam courses (optional)
6. Grout fill: boxes in reinforced cells, contrasting color (optional)
7. Bond beam course indicators: highlighted horizontal bands

---

## 7. The Performance Engineering Layer

### 7.1 Performance Budget

| Metric | Overview Budget | Section Cut Budget | Hard Fail |
|---|---|---|---|
| GeometryInstruction count | < 100 | < 200 | > 400 |
| Triangle count (rendered) | < 20,000 | < 35,000 | > 60,000 |
| Draw calls per frame | < 30 | < 50 | > 80 |
| Computation time | < 1 ms | < 2 ms | > 5 ms |
| Geometry generation time | < 5 ms | < 10 ms | > 20 ms |
| FPS (laptop) | 60 | 60 | < 45 |
| FPS (mobile target) | 30 | 30 | < 20 |

### 7.2 Instancing Budget

| Element | Max Instances | Tris/Instance | Total |
|---|---|---|---|
| Drywall studs | 16 | 12 | 192 |
| CHB blocks (rep. section) | 45 | 12 | 540 |
| Vertical rebar | 12 | 24 | 288 |
| Horizontal rebar | 5 | 24 | 120 |
| Brick units (rep. section) | 100 | 12 | 1,200 |
| Insulation batts | 16 | 12 | 192 |
| **Structural subtotal** | | | **~2,500** |

Combined with finish layers (~72 tris), ground plane (12), and indicators: ~3,000 total. Well within 20K overview budget.

### 7.3 Critical: Demand Rendering

Use `frameloop="demand"` + `invalidate()` on parameter change, dropdown change, toggle change, view mode change, and camera interaction. Between interactions: zero GPU cost.

---

## 8. The Computation Engine

### 8.1 Design

Pure functions only. No Three.js, no React, no store. Produces `ComputedWallState` from raw parameters.

### 8.2 ComputedWallState Structure

Contains: all raw parameters (passthrough), resolved assembly (core thickness, layer stack with cumulative offsets, total thickness, wall area), core-type-specific structural data (CHBStructural or DrywallStructural or GenericStructural), performance metrics (fire rating minutes + label, STC rating, R-value, cost per sqm + total cost), BOM entries (material, quantity, unit, unit cost, subtotal), and violation results.

### 8.3 Performance Estimation Formulas

**Fire Resistance:** Base rating from core type/thickness + bonus for gypsum layers + bonus for grouting + bonus for plaster. CHB 150mm unfilled = 60 min. Solidly grouted = 240 min. Single ⅝" Type X gypsum each side = 60 min. Double = 120 min.

**STC:** Base from core type/weight + insulation bonus (6–10 points) + surface seal bonus (2–3 points). CHB 150mm = STC 45. Drywall 92mm, single ½" no insulation = STC 35.

**Cost:** Material cost from BOM + labor rate per core type + overhead factor. Material costs from constants file (updateable when prices change).

### 8.4 BOM Computation

Standard Philippine quantities per sqm: CHB 150×200×400 = 12.5 pcs/sqm. Mortar ≈ 0.02 cum/sqm. Gypsum board = 1 sheet per 2.98 sqm. Studs at 600mm = 1.67 pcs/lm. Screws ≈ 24 pcs/sqm. Paint = 8–10 sqm/L/coat. Primer = 10–12 sqm/L.

Waste factors: CHB 5–10%, gypsum board 10–15%, mortar 10%.

---

## 9. The Violation and Compliance System

### 9.1 Violation Rules (Expanded from 3 to 12+)

| Rule | Law | Severity |
|---|---|---|
| Height < 2400mm habitable | PD 1096 Rule VII §708 | warning |
| Height < 2100mm service | PD 1096 Rule VII §708 | warning |
| CHB bearing < 150mm | NSCP 2015 §702.1 | error |
| CHB non-bearing < 100mm | NSCP 2015 §702.1 | error |
| Brick > 3600mm without review | NSCP 2015 §705.2 | warning |
| Fire rating < occupancy requirement | RA 9514 IRR | error |
| STC < 50 for multifamily | IBC/PH practice | warning |
| CHB rebar spacing > 1200mm | NSCP 2015 | warning |
| CHB no reinforcement in seismic zone | NSCP 2015 | error |
| CHB length > 4000mm without stiffener | NSCP structural notes | warning |
| Single ½" gypsum where 1-hour required | ASTM E119 | warning |
| Plaster on incompatible core (drywall) | Construction practice | info |

### 9.2 Color Resolution

Same severity cascade as stairway configurator: RA 9514 → NSCP → PD 1096 → Performance warnings → Info.

---

## 10. The Annotation and Information Layer

### 10.1 Viewport Sanctity Rule

Same as stairway configurator. No text boxes in viewport. Performance badges (fire, STC, R-value, cost) go in the compliance report panel. The viewport shows only geometry, violation colors, small dimension pills, and dimension lines.

### 10.2 Performance Badges — Panel Placement

Fire rating, STC, R-value, and cost badges are HTML components in the right panel, not in the viewport. Each shows icon + value + status color + tap-to-expand detail.

---

## 11. The Interaction System

### 11.1 View Modes

| Mode | Geometry | Purpose |
|---|---|---|
| **Overview** | Full wall, simplified core | Assembly understanding |
| **Section Cut** | Representative section with full internal detail | Structural learning |
| **Exploded** | Layers separated with gaps (slider 0–100%) | Layer identification |
| **Build Sequence** | Progressive construction animation | Construction sequence |
| **Detail View** | Zoomed connection/element | Screw patterns, mortar joints, rebar |

### 11.2 Core-Type-Dependent Parameter Visibility

Parameters dynamically show/hide based on selected core type. Stud parameters only show for framed types (drywall, plywood, cement board). Rebar parameters only show for masonry/concrete (CHB, solid concrete). Plaster only shows for types that support it. This is implemented via `visibleWhen` predicates on parameters or via UI-level gating.

---

## 12. View Modes

### Camera Presets

| View | Position | Purpose |
|---|---|---|
| Default 3/4 | [7, 2.5, 5.5] | Overall assembly |
| Front Elevation | [0, H/2, 8] | Face pattern, layer visibility |
| Side Section | [L/2+2, H/2, 0] | Cross-section at wall end |
| Top Plan | [0, H+3, 0] | Footprint, total thickness |
| Detail | Computed per element | Connection-level detail |

---

## 13. State Management Architecture

Single Zustand store with `subscribeWithSelector`. Parameters slice (all raw values including new structural params). Computed slice (ComputedWallState, recomputed on any param change). UI slice (view mode, selected element, section cut position).

---

## 14. Feature Implementation Registry

### Phase 1 — Structural Fidelity

1. Constants extraction to dedicated file
2. Computation engine with ComputedWallState
3. Extended CoreTypeRegistry with structural metadata
4. Instanced geometry instruction type (backward-compatible extension)
5. Drywall framing sub-builder (studs, tracks, boards, insulation)
6. CHB reinforcement sub-builder (rebar, grout, bond beams, representative section)
7. Shared finish layer builder (refactored from existing addLayer)
8. Fire resistance badge (panel component)
9. STC acoustic badge (panel component)

### Phase 2 — Assembly Understanding

10. Exploded layer view mode
11. Section cut view mode
12. Enhanced BOM panel
13. Progressive build animation
14. Core-type-dependent parameter visibility

### Phase 3 — Advanced Features

15. MEP integration layer
16. Waterproofing layers
17. Wall-to-structure connection details
18. Performance comparison dashboard
19. International wall type comparison
20. Violation presets (same pattern as stairway)

---

## 15. File and Module Structure

```
src/app/dashboard/3d-lab/_config/modules/10-materials/
├── unified-wall-configurator.ts          # Main config export
├── wall-constants.ts                     # PH code constants (NSCP, PD 1096)
├── wall-constants-performance.ts         # Fire, STC, R-value, cost data
├── wall-constants-international.ts       # IBC, ASTM references (UNVERIFIED)
├── wall-computation.ts                   # Pure computation engine
├── wall-core-registry.ts                 # Extended CoreTypeRegistry
├── wall-geometry.ts                      # Main geometry dispatcher
├── wall-geometry-chb.ts                  # CHB sub-builder
├── wall-geometry-drywall.ts              # Drywall sub-builder
├── wall-geometry-brick.ts                # Brick sub-builder
├── wall-geometry-generic.ts              # Generic sub-builder
├── wall-geometry-layers.ts               # Shared finish layer builder
├── wall-violations.ts                    # Violation rules
├── wall-annotations.ts                   # Annotations
├── wall-presets.ts                       # Presets
├── wall-bom.ts                           # BOM computation
└── wall-types.ts                         # TypeScript types
```

---

## 16. Do's and Don'ts — The Hard Rules

### Do's

1. **DO** use instanced geometry for all repeated elements (studs, blocks, rebar, bricks, batts).
2. **DO** implement LOD — overview vs. section cut vs. detail. Never full detail in overview.
3. **DO** use the representative section for unit masonry — 3 blocks wide, not every block.
4. **DO** keep computation pure. No Three.js, no React, no store.
5. **DO** gate parameter visibility by core type.
6. **DO** use the shared layer builder for all core types.
7. **DO** compute fire/STC/cost dynamically from assembly config.
8. **DO** preserve existing CORE_CONFIGS data — extend, don't replace.
9. **DO** test each core type independently.
10. **DO** use `frameloop="demand"` with explicit `invalidate()`.
11. **DO** follow Viewport Sanctity — badges go in panel, not viewport.
12. **DO** make core type dispatch a TypeScript exhaustive switch.
13. **DO** dispose geometry on unmount.
14. **DO** test worst-case: 10m × 4m CHB, both sides, all layers, reinforcement, section cut.

### Don'ts

1. **DON'T** render every CHB block in a full-width wall — use representative section.
2. **DON'T** create separate instructions per stud — use instanced pattern.
3. **DON'T** embed structural metadata in geometry builder — it belongs in CoreTypeRegistry.
4. **DON'T** hard-code fire/STC/R-value as lookup tables — compute from assembly.
5. **DON'T** duplicate layer logic per core type — use shared builder.
6. **DON'T** show all parameters for all core types — hide irrelevant ones.
7. **DON'T** use `<Html>` overlays for performance badges — they go in the panel.
8. **DON'T** allocate Three.js objects in `useFrame` or geometry builder.
9. **DON'T** use `setState` inside `useFrame`.
10. **DON'T** forget "Existing Wall" — it must remain the simplest type.
11. **DON'T** modify `ParametricSceneConfig` interface — extend `GeometryInstruction` union if needed.
12. **DON'T** skip testing "Both Sides" — it doubles layer instructions.
13. **DON'T** render section cut detail when view mode is overview.
14. **DON'T** put Peso costs in computation engine — put in updateable constants file.

---

## 17. Testing and Validation Protocol

### 17.1 Computation Tests

- All 7 core types produce valid `ComputedWallState`.
- Fire rating: CHB 150mm unfilled = 60 min, solidly grouted = 240 min.
- STC: Drywall 92mm, single ½", no insulation = 35. With fiberglass = 43.
- BOM: 5m × 3m CHB = 188 blocks (12.5 × 15 sqm, rounded up).
- Layer stack: both sides plaster + skim + primer + paint = correct offsets.

### 17.2 Geometry Validation

- All 7 core types produce valid instruction arrays.
- Instanced instructions have correct position array lengths.
- No ID collisions. Instruction count within budget per view mode.
- Switching coreType produces completely different instructions.

### 17.3 Performance Testing

- Worst case: 10m × 4m CHB, both sides, all layers, reinforcement, section cut. 30fps mobile.
- Fast-switch: cycle through all 7 core types rapidly. No frame drops, no leaks.
- Slider drag: wallLength 1000–10000mm continuously. Smooth at 60fps desktop, 30fps mobile.

### 17.4 Visual Regression

Screenshots for all 7 presets plus: CHB with reinforcement (section cut), drywall with framing (section cut), exploded view at 50% and 100%, both sides vs 1 side.

### 17.5 Code Accuracy Audit

Licensed PH architect/SE reviews: CHB dimensions, rebar spacing defaults, fire values, STC values, material quantities, cost estimates. All values verified against NSCP 2015, PNS ASTM C90, RA 9514 IRR.

---

## 18. Glossary

| Term | Definition |
|---|---|
| **CoreType** | One of 7 wall types: CHB, drywall, plywood, cement board, brick, solid concrete, existing wall. |
| **CoreTypeRegistry** | Data structure mapping each CoreType to its properties, structural metadata, and performance data. |
| **ComputedWallState** | Central immutable data object from the computation engine with all derived metrics and compliance. |
| **Representative Section** | A partial-width detailed strip of a unit masonry wall showing full internal structure while the rest is simplified. The LOD strategy for high-unit-count walls. |
| **Instanced Geometry** | A geometry instruction where one shape is placed at multiple positions. One draw call regardless of count. |
| **Section Cut** | View mode revealing internal structure on one side of a vertical cut plane. |
| **Bond Beam** | Horizontally grouted/reinforced CHB course. Provides seismic resistance at 600–800mm intervals. |
| **Stiffener Column** | Small RC column within CHB wall at max 4.0m intervals. Primary seismic element. |
| **C-Stud** | C-shaped galvanized steel vertical framing member in drywall. Depths: 64/92/150mm. Spacing: 400/600mm. |
| **U-Track** | U-shaped steel channel forming top/bottom rails of a drywall partition. C-studs insert into tracks. |
| **Type X Gypsum** | Fire-rated gypsum with glass fibers. ⅝" provides 1-hour fire resistance in assemblies per ASTM E119. |
| **STC** | Sound Transmission Class. Single-number airborne sound rating per ASTM E90/E413. Higher = better. IBC min STC 50 for multifamily. |
| **BOM** | Bill of Materials. Complete list of materials, quantities, and costs for the current assembly. |
| **Finish Layer Stack** | Surface treatment sequence: plaster → skim coat → primer → paint. Shared across all supporting core types. |

---

*This document is the technical authority for the Unified Wall Configurator module. All implementation decisions must be traceable to a section in this plan.*

*Last updated: April 9, 2026*
