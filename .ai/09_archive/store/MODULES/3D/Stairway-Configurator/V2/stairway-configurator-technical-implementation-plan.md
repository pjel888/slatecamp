# SlateCamp Stairway Configurator — Technical Feature Implementation Plan

**Module:** `stairway-configurator.ts`
**Version:** 2.0 — Unified Architecture
**Date:** April 9, 2026
**Status:** Planning — No code changes yet
**Author:** SlateCamp Engineering

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [Current Architecture Audit](#2-current-architecture-audit)
3. [Architectural Principles — The Laws of This Module](#3-architectural-principles)
4. [Target Architecture — The Unified System](#4-target-architecture)
5. [The Computation Engine](#5-the-computation-engine)
6. [The Geometry Pipeline](#6-the-geometry-pipeline)
7. [The Violation System](#7-the-violation-system)
8. [The Annotation and Information Layer](#8-the-annotation-and-information-layer)
9. [The Interaction System](#9-the-interaction-system)
10. [The Comparison and Overlay Engine](#10-the-comparison-and-overlay-engine)
11. [Camera and View System](#11-camera-and-view-system)
12. [Performance Contract](#12-performance-contract)
13. [State Management Architecture](#13-state-management-architecture)
14. [Feature Implementation Registry](#14-feature-implementation-registry)
15. [File and Module Structure](#15-file-and-module-structure)
16. [Do's and Don'ts — The Hard Rules](#16-dos-and-donts)
17. [Testing and Validation Protocol](#17-testing-and-validation-protocol)
18. [Glossary](#18-glossary)

---

## 1. Purpose and Scope

This document is the single source of truth for all technical decisions related to the Stairway Configurator module. It governs the existing multi-law parallel compliance system and every planned enhancement — from the Blondel comfort gauge to L-shaped stair configurations.

**Who reads this:** Anyone who touches the stairway configurator code — whether writing geometry, adding violation rules, designing annotations, or optimizing performance.

**What this is NOT:** This is not a code file. It contains zero runnable code. It is a decision framework, an architecture map, and a constraint set that all future code must satisfy.

**The governing question for every decision:** "Does this help a Filipino architecture student understand stair standards well enough to answer the ALE correctly — and does it run at 30fps on a Realme C55?"

---

## 2. Current Architecture Audit

### 2.1 What Exists Today

The stairway configurator is implemented as a single `ParametricSceneConfig` object exported from `stairway-configurator.ts`. This config is consumed by a generic parametric module renderer that interprets the config into a 3D scene. The config contains five sections:

**Parameters** — 10 user-controlled inputs organized into two groups: Project Classification (4 parameters: projectType dropdown, isAccessibleRoute toggle, isExitStair toggle, isHighOccupancy toggle) and Stair Geometry (6 parameters: stairWidth, riserHeight, treadDepth, headroom, handrailHeight, numRisers — all sliders with mm units).

**Geometry Builder** — A function that takes all parameter values and returns an array of `GeometryInstruction` objects. Each instruction describes a primitive (box or cylinder) with position, rotation, dimensions, color, and optional opacity/transparency. The function produces: a base platform, N treads, N risers, 2 primary handrails, a top landing, a headroom clearance plane, BP 344 ghost handrails (conditional), BP 344 handrail extensions (conditional), and width deficit indicator planes (conditional).

**Violation Rules** — 22 rules organized by law (PD 1096 base, BP 220 housing, BP 344 accessibility, RA 9514 fire code, plus cross-law conflict warnings). Each rule has an id, a field it monitors, a check predicate, a message, a code citation, a severity level, and a position function.

**Annotations** — 8 labeled hotspots with conditional visibility (BP 344 annotations only visible when accessible route is active).

**Presets** — 4 scenario presets (Standard House, BP 220 Housing, Public Hall, Exit Stair).

### 2.2 What Works Well

- The **parallel rule-set pattern** is architecturally sound — each law evaluates independently and conflicts are flagged, never averaged. This is the correct mental model for Philippine multi-law compliance and must be preserved.
- The **severity-ordered color system** (RA 9514 > BP 344 > PD 1096 > BP 220) provides clear visual hierarchy.
- The **conditional overlay pattern** (BP 344 ghost handrails appearing only when the accessible route toggle is active) is a good progressive disclosure mechanism.
- The **cross-law conflict warnings** are a pedagogically unique feature — no other tool teaches students that passing one law while violating another on the same dimension is a real-world scenario that requires project classification verification.

### 2.3 Current Limitations and Technical Debt

**Geometry is primitive-only.** All geometry is assembled from boxes and cylinders via `GeometryInstruction`. This works for the current straight-run stair but cannot express: nosing profiles, rounded handrail cross-sections, contrast strips, winder treads, L-shaped landings, stringer detail, or material-differentiated surfaces.

**No computation layer.** The `geometry()` function mixes computation with geometry construction. Values like `strictestMinWidth()` are inline utility functions, not part of a separable computation engine. The Blondel formula (2R+T), pitch angle, stringer length, and other derived values are either computed ad-hoc in geometry or not computed at all.

**Violation rules are statically positioned.** Each rule has a hardcoded position function. When the module grows to support different stair types (L-shape, U-shape), these positions will need to be dynamically computed based on stair configuration.

**No view modes.** The module has one camera angle and one geometry representation. There is no cross-section view, no detail view for nosing profiles, no plan view, and no side elevation view.

**No sub-element interaction.** Clicking on a specific tread, riser, or handrail does nothing. The module is a "look and adjust sliders" tool, not an "explore by clicking" tool.

**Single stair type.** Only straight-run stairs. The geometry builder assumes a linear progression of treads with no turns, landings mid-flight, or winder geometry.

---

## 3. Architectural Principles — The Laws of This Module

These principles are non-negotiable. Every feature, every optimization, every refactor must satisfy all of them simultaneously.

### Principle 1: Computation and Geometry Are Separate Systems

The computation engine calculates derived values (2R+T, pitch angle, stringer length, compliance status per law, strictest applicable threshold per dimension). The geometry pipeline consumes computed values to produce 3D geometry. **They never call each other.** Data flows in one direction: Parameters → Computation → Geometry.

*Why:* The computation results are needed by the violation system, the annotation system, the comparison overlay, and the quiz integration — not just geometry. If computation is embedded in geometry, these systems can't access the values without duplicating logic.

### Principle 2: Every Number Traces to a Code Citation

No magic numbers. Every threshold, limit, minimum, and maximum in the system must be defined as a named constant with a code citation comment. These constants are the single source of truth for Philippine and international building codes within this module.

*Why:* A wrong number in this module means a student memorizes the wrong code value and fails the ALE. Every constant must be auditable.

### Principle 3: Laws Evaluate in Parallel, Never Merge

Each law (PD 1096, BP 220, BP 344, RA 9514, IBC, ADA) evaluates the same geometry independently and produces its own compliance result. When two laws disagree, the system flags the conflict. It never averages, reconciles, or "picks" a winner.

*Why:* In Philippine practice, multiple laws genuinely overlap and sometimes conflict. The student must learn to identify which laws apply to their project and resolve conflicts through project classification — not through a tool that hides the conflict.

### Principle 4: Progressive Disclosure Governs Information Density

On load: the 3D model and basic orientation labels. On interaction: violation colors and dimension annotations. On demand: code citations, historical context, quiz questions, international comparisons. **Never show everything at once.**

*Why:* Cognitive load management (Mayer's Coherence Principle). The 3D scene's information density must never exceed what a student can process while maintaining spatial awareness of the model.

### Principle 5: Mobile Performance Is a First-Class Constraint

Every feature must pass the performance contract (Section 12) before shipping. A feature that is pedagogically brilliant but drops the frame rate below 30fps on target hardware does not ship — it gets optimized or redesigned.

*Why:* SlateCamp's median user is on a mid-range Android phone. If the module stutters, the student abandons it.

### Principle 6: The Config Pattern Is the Extension Pattern

New features are added by extending the `ParametricSceneConfig` type and the functions that consume it — not by building parallel systems. The stairway configurator remains a single config object that a generic renderer interprets. This ensures every stairway feature is available to the guided, faded, sandbox, and challenge learning phases.

*Why:* The parametric module renderer is shared across all 3D Lab modules. Module-specific rendering logic creates maintenance debt that scales with the number of modules.

### Principle 7: Geometry Instructions Must Be Serializable

Every `GeometryInstruction` must be a plain object with no functions, class instances, or closures. Functions live in the builder. Instructions are data.

*Why:* Serializable instructions can be sent to web workers for off-main-thread geometry construction, cached, diffed for change detection, and logged for debugging. This is critical as geometry complexity increases with new stair types.

---

## 4. Target Architecture — The Unified System

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PARAMETER LAYER                              │
│  User inputs (sliders, toggles, dropdowns)                         │
│  + Preset snapshots                                                 │
│  + Stair type selector (straight, L-shape, U-shape)                │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ Raw parameter values (Record<string, Value>)
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      COMPUTATION ENGINE                             │
│  Pure functions, zero side effects                                  │
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │ Derived       │ │ Compliance   │ │ Comparison   │               │
│  │ Metrics       │ │ Evaluator    │ │ Engine       │               │
│  │               │ │              │ │              │               │
│  │ • 2R+T        │ │ • PD 1096    │ │ • IBC delta  │               │
│  │ • pitch angle │ │ • BP 220     │ │ • ADA delta  │               │
│  │ • stringer L  │ │ • BP 344     │ │ • IRC delta  │               │
│  │ • total rise  │ │ • RA 9514    │ │              │               │
│  │ • total run   │ │ • conflicts  │ │              │               │
│  │ • comfort     │ │              │ │              │               │
│  │   zone status │ │              │ │              │               │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘               │
│         │                │                │                         │
│         ▼                ▼                ▼                         │
│  ┌─────────────────────────────────────────────┐                   │
│  │           ComputedStairState                │                   │
│  │  (single immutable object per frame)        │                   │
│  └──────────────────────┬──────────────────────┘                   │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┬──────────────┐
          ▼               ▼               ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌────────────────┐
│  GEOMETRY    │ │  VIOLATION   │ │ ANNOTATION │ │  INTERACTION   │
│  PIPELINE    │ │  SYSTEM      │ │ LAYER      │ │  SYSTEM        │
│              │ │              │ │            │ │                │
│ • Stair body │ │ • Per-law    │ │ • Hotspots │ │ • Click-to-    │
│ • Handrails  │ │   evaluation │ │ • Dim.     │ │   inspect      │
│ • Landings   │ │ • Cross-law  │ │   lines    │ │ • View modes   │
│ • Ghost      │ │   conflicts  │ │ • History  │ │ • Guided tour  │
│   overlays   │ │ • Color      │ │   layer    │ │ • Quiz         │
│ • Nosing     │ │   resolution │ │ • Comfort  │ │   integration  │
│   detail     │ │              │ │   gauge    │ │ • Evacuation   │
│ • Comparison │ │              │ │            │ │   sim          │
│   ghosts     │ │              │ │            │ │                │
└──────────────┘ └──────────────┘ └────────────┘ └────────────────┘
```

### The Key Insight: ComputedStairState

The central data structure is `ComputedStairState` — a single immutable object produced by the computation engine from raw parameters. Every downstream system reads from this object. No downstream system ever re-derives a value that the computation engine should have provided.

This object contains: all raw parameters (passthrough), all derived metrics (2R+T, pitch angle, stringer length, total rise, total run, comfort zone status, stair type configuration), all per-law compliance results (pass/fail per dimension per law, applicable thresholds, violation messages), all cross-law conflict flags, all international comparison deltas (IBC/ADA/IRC differences per dimension), and the resolved color map (which color each geometry element should display based on the most severe active violation).

---

## 5. The Computation Engine

### 5.1 Design Rules

**Rule: Pure functions only.** Every computation function takes parameters in, returns a result. No side effects. No DOM access. No Three.js imports. No store reads. These functions could run in a web worker, in a test harness, or on a server.

**Rule: Named constants for every code value.** Every building code threshold is a named constant defined in a `stair-code-constants.ts` file. The constant name encodes the law and the dimension. Example: `PD1096_MAX_RISER_HEIGHT_MM = 200`. International codes get their own constant blocks: `IBC_MAX_RISER_HEIGHT_MM = 178`.

**Rule: Computation functions are organized by concern, not by law.** A function like `computeRiserCompliance(riserHeight, projectType, overlays)` evaluates ALL applicable laws for the riser dimension and returns a result per law. This prevents the "scatter" problem where PD 1096 riser logic is in one file, BP 220 riser logic in another, and RA 9514 riser logic in a third.

**Rule: The ComputedStairState is computed once per parameter change.** When any parameter changes, the entire computation runs. This is cheap (pure math, no allocation of 3D objects) and ensures consistency. Do not attempt to incrementally update only the "affected" computations — the interdependencies are too complex and the cost is negligible.

### 5.2 Derived Metrics — Complete List

| Metric | Formula / Logic | Unit | Purpose |
|---|---|---|---|
| `twoRPlusT` | 2 × riserHeight + treadDepth | mm | Blondel comfort formula |
| `comfortStatus` | 600 ≤ twoRPlusT ≤ 650 → 'comfortable'; outside → 'uncomfortable' | enum | Comfort gauge display |
| `pitchAngle` | atan2(riserHeight, treadDepth) | degrees | Slope indicator, stair type classification |
| `pitchStatus` | < 20° → 'ramp-like'; 20–35° → 'comfortable'; 35–42° → 'steep'; > 42° → 'ladder-like' | enum | Pitch classification display |
| `totalRise` | numRisers × riserHeight | mm | Total vertical travel |
| `totalRun` | (numRisers − 1) × treadDepth | mm | Total horizontal travel |
| `stringerLength` | √(totalRise² + totalRun²) | mm | Physical stringer dimension |
| `rPlusT` | riserHeight + treadDepth | mm | Secondary comfort check (430–450 mm ideal) |
| `landingRequired` | totalRise > maxVerticalRise(applicableLaw) | boolean | Landing insertion flag |
| `strictestMinWidth` | max(all applicable law minimums) | mm | Width comparison reference |
| `widthDeficit` | strictestMinWidth − stairWidth (if positive) | mm | Gap plane dimension |
| `uniformityViolation` | (future) max deviation among per-step heights > 9.5 mm | boolean | Tolerance mode flag |

### 5.3 Compliance Evaluator Structure

Each dimension (riser, tread, width, headroom, handrail, vertical rise) gets a compliance evaluation function that returns a result per applicable law:

```
ComputeRiserCompliance(riserHeight, projectClassification) → {
  pd1096: { applies: boolean, passes: boolean, limit: number, message: string }
  bp220:  { applies: boolean, passes: boolean, limit: number, message: string }
  ra9514: { applies: boolean, passes: boolean, limit: number, message: string }
  ibc:    { applies: boolean, passes: boolean, limit: number, message: string }  // comparison mode
  ada:    { applies: boolean, passes: boolean, limit: number, message: string }  // comparison mode
  conflicts: ConflictFlag[]
}
```

This structure allows the violation system, the annotation system, and the comparison overlay to all read from the same evaluation result without re-computing.

### 5.4 International Code Constants

Store these separately from Philippine code constants in a `international-code-constants.ts` file. The comparison engine reads from both sets. When "Compare Mode" is inactive, the international constants are never evaluated — the computation engine skips them entirely (performance).

---

## 6. The Geometry Pipeline

### 6.1 Design Rules

**Rule: Geometry instructions are the ONLY output of the geometry builder.** The geometry builder never creates Three.js objects directly. It returns an array of `GeometryInstruction` objects that the generic renderer interprets. This is the existing pattern and it must be preserved.

**Rule: Extend GeometryInstruction, don't replace it.** New geometry types (nosing profiles, contrast strips, cross-section detail geometry) require new instruction types. Add them as new `type` values to the discriminated union, not as parallel systems.

**Rule: Conditional geometry uses the overlay pattern.** Ghost geometry (BP 344 handrails, IBC comparison treads, evacuation dots) is included in the instruction array only when its activation condition is met. The geometry builder checks the parameter state and includes or excludes instructions accordingly. The renderer does not perform filtering.

**Rule: Geometry IDs are stable and hierarchical.** Every instruction has an `id` that is unique within the scene and follows a naming convention: `{element}-{index}-{qualifier}`. Examples: `tread-0`, `riser-5`, `handrail-L`, `bp344-rail-900-R`, `nosing-3-contrast`. These IDs are used by the interaction system for click targeting and by the annotation system for anchor positioning. IDs must not change when unrelated parameters change.

**Rule: No new THREE.Geometry allocation inside the geometry builder.** The geometry builder returns plain instruction objects. The renderer creates Three.js geometry from those instructions. This separation ensures the geometry builder can run in a web worker (future optimization).

### 6.2 New Instruction Types Required

The current system supports two types: `box` and `cylinder`. The following new types are needed for planned features:

| Type | Purpose | Required Properties |
|---|---|---|
| `box` | (existing) Rectangular prisms — treads, risers, landings, planes | position, args [w,h,d], color, opacity?, transparent? |
| `cylinder` | (existing) Handrails, circular elements | position, rotation, args [rT,rB,h,seg], color, opacity?, transparent? |
| `extruded-profile` | Nosing cross-section, handrail cross-section | profilePoints (2D), extrudePath (3D), color |
| `line-segment` | Dimension lines, stride visualization | points, color, lineWidth, dashed? |
| `arc-indicator` | Pitch angle arc, comfort gauge arc | center, radius, startAngle, endAngle, color |
| `particle-field` | Evacuation flow dots | emitterPosition, count, velocity, color |
| `clipping-group` | Cross-section view geometry grouping | clippingPlane, children (other instructions) |

**Important:** Add new types conservatively. Every new type requires a corresponding renderer implementation. If a new feature can be expressed with existing types (box + cylinder), use existing types. Only introduce a new type when the existing types genuinely cannot express the geometry.

### 6.3 Stair Type Abstraction

The current geometry builder assumes a straight-run stair. To support L-shape and U-shape configurations, introduce a `StairTypeConfig` abstraction:

```
StairTypeConfig =
  | { type: 'straight' }
  | { type: 'l-shape', turnDirection: 'left' | 'right', risersBeforeTurn: number }
  | { type: 'u-shape', risersBeforeTurn: number }
```

The geometry builder branches on stair type early and delegates to type-specific sub-builders. Each sub-builder produces standard `GeometryInstruction` arrays. The violation system, annotation system, and interaction system are type-agnostic — they read from `ComputedStairState`, not from the geometry builder.

**Phasing:** Straight-run is the only supported type in Phase 1 and Phase 2. L-shape is Phase 3. U-shape is Phase 3+. The abstraction is introduced in Phase 1 so that the architecture is ready, even though only the straight-run branch is implemented.

### 6.4 Nosing Geometry Strategy

The nosing cross-section view is a **detail view** — it is NOT rendered in the main 3D scene at normal zoom. At normal zoom, treads remain box primitives (performance). When the student activates "Detail View" or clicks on a tread, the camera zooms to a single riser-tread junction and the renderer substitutes the box tread with a higher-detail `extruded-profile` instruction that includes the nosing radius, projection, riser undercut angle, and contrast strip.

This two-tier geometry approach (low-detail in overview, high-detail in detail view) prevents the polygon count from exploding when the number of risers is high.

### 6.5 Comparison Ghost Geometry

When "Compare Mode" is active, the geometry builder adds translucent ghost geometry showing what the stair would look like under the selected international code. Ghost instructions follow this pattern:

- Same position as the corresponding real element.
- Dimensions adjusted to the international code's required value (e.g., IBC tread at 279 mm instead of the current 200–350 mm slider value).
- Color: a dedicated comparison color (distinct from all law colors and the neutral palette).
- Opacity: 0.15–0.25 (visible but clearly secondary to the real geometry).
- ID prefix: `compare-{code}-{element}` (e.g., `compare-ibc-tread-0`).

Ghost geometry is **additive** — it appears alongside the real geometry, not instead of it. The student sees both the current geometry and the international standard simultaneously.

---

## 7. The Violation System

### 7.1 Design Rules

**Rule: Violations are evaluated from ComputedStairState, not from raw parameters.** The violation system reads pre-computed compliance results from the computation engine. It never re-evaluates code limits.

**Rule: One violation rule per law per dimension.** There is exactly one rule for "PD 1096 riser height" and exactly one rule for "RA 9514 riser height." Rules are not merged across laws. This is the existing pattern and it is correct.

**Rule: Violation positions are computed relative to the geometry they annotate.** Position functions receive the full parameter set (or `ComputedStairState`) and return 3D coordinates. When the stair type changes (L-shape, U-shape), position functions must account for the new geometry layout.

**Rule: Severity is a property of the law, not the dimension.** A riser violation from RA 9514 is always `error` severity because RA 9514 is life-safety. A riser that passes BP 220 but triggers a PD 1096 conflict is `warning` severity. Severity mapping: RA 9514 → `error`, BP 344 → `error`, PD 1096 → `error`, BP 220 → `error`, cross-law conflicts → `warning`, comfort formula → `info`.

### 7.2 New Violation Categories

The following new violation categories are needed for planned features:

| Category | Severity | Color | Trigger |
|---|---|---|---|
| **Comfort formula** | `info` | New — Comfort Amber | 2R+T outside 600–650 mm range |
| **Dimensional uniformity** | `warning` | PD 1096 Slate | Max per-step deviation > 9.5 mm (tolerance mode) |
| **Nosing projection** | `error` | Law color of active code | Nosing > 38 mm (ADA) or > 32 mm (IBC) in compare mode |
| **Nosing radius** | `error` | Law color | Radius > 13 mm in detail view |
| **Landing required** | `error` | Law color | Total vertical rise exceeds law's max without intermediate landing |
| **International comparison** | `info` | Comparison color | Current value passes PH law but would fail IBC/ADA |

**Important:** The `info` severity level is new. It is used for pedagogical feedback that is NOT a code violation but IS educationally valuable. Info-severity items appear with a distinct visual treatment (e.g., dashed border, muted color) that is clearly distinguishable from error and warning.

### 7.3 Color Resolution — The Priority Cascade

Each geometry element displays ONE color — the most severe active violation's law color. The resolution cascade:

1. If RA 9514 violation is active on this element → Evacuation Red `#E74C3C`
2. Else if BP 344 violation is active → Access Blue `#3498DB`
3. Else if PD 1096 violation is active → Code Slate `#4A7FAD`
4. Else if BP 220 violation is active → Housing Amber `#F5A623`
5. Else if comfort formula is outside range → (new) Comfort info indicator (not a color override — a separate UI element)
6. Else → Neutral (pass)

**Critical decision:** The comfort formula does NOT override element colors. It is displayed as a **separate gauge element**, not as a tread/riser color. This prevents visual conflict with the law-based color system. A tread can be green (legally compliant) while the comfort gauge shows amber (ergonomically suboptimal). This teaches students that code compliance and comfort are independent dimensions.

---

## 8. The Annotation and Information Layer

### 8.1 Annotation Hierarchy

Annotations follow the 4-layer progressive disclosure model from the Information Designer skill:

**Layer 0 — The Model.** Always visible. The 3D geometry itself communicates scale, proportion, and spatial relationships.

**Layer 1 — Orientation Labels.** Visible on load. Maximum 3–4 persistent labels: "Riser," "Tread," "Handrail," "Landing." These disappear when the student begins interacting (orbit or slider change).

**Layer 2 — Code Annotations.** Visible when violations are active or when the student hovers/taps an element. These show the specific code value and law citation. Maximum 4–6 simultaneously visible.

**Layer 3 — Deep Knowledge.** Visible on explicit demand (click/tap on an annotation). This reveals: full code citation text, historical context ("Blondel, 1672"), link to Wiki article, and "Quiz me on this" trigger. Only 1 deep-knowledge panel open at a time.

### 8.2 Annotation Types

| Type | Visual | Trigger | Content |
|---|---|---|---|
| **Dimension line** | Thin line with value label between two points | Always visible when relevant | "185 mm" |
| **Violation callout** | Badge with law color and message | When violation is active | "PD 1096: Max 200 mm" |
| **Comfort gauge** | Arc/dial widget in corner of viewport | Always visible (when feature enabled) | "2R+T = 620 mm ✓" |
| **Pitch indicator** | Angle arc at stringer with degree label | Always visible (when feature enabled) | "32°" |
| **History hotspot** | Small dot with "i" icon, expands on tap | On demand (Layer 3) | "Blondel, 1672 — stride relationship" |
| **Comparison delta** | Ghost annotation near ghost geometry | When Compare Mode is active | "IBC requires 279 mm (current: 250 mm)" |
| **Quiz anchor** | Pulse dot with "?" icon, opens quiz | On demand (Layer 3) | Dynamic quiz question |

### 8.3 Annotation Positioning Rules

**Rule: Annotations must not overlap the geometry they describe.** Position annotations offset from the element, connected by a thin leader line.

**Rule: Annotations must not overlap each other.** When multiple annotations would overlap, collapse the lower-priority ones. Priority order: active violation > dimension line > comfort gauge > comparison delta > history hotspot.

**Rule: Annotations must reposition when the camera moves.** Use drei's `<Html>` component with `sprite` mode for camera-facing labels. For dimension lines, use `<Line>` components that are computed from geometry positions.

**Rule: Annotations inherit their position from the element they annotate.** Annotation position functions take `ComputedStairState` as input and return 3D coordinates relative to the annotated element. When stair type changes (L-shape), annotation positions automatically adjust because they are computed from the same state.

### 8.4 The Comfort Gauge — Special Annotation

The Blondel comfort gauge is a persistent viewport-space UI element (not anchored to 3D geometry). It is rendered as an HTML overlay using drei's `<Html>` component with `transform={false}` — it stays in the corner of the viewport regardless of camera position.

The gauge displays:
- The current 2R+T value in mm.
- A visual indicator (arc, bar, or dial) showing where the value falls within the 600–650 mm comfort range.
- A secondary R+T value (430–450 mm ideal).
- A pitch angle readout in degrees.
- A comfort status label: "Comfortable," "Too Steep," "Too Shallow."

The gauge updates reactively when riserHeight or treadDepth parameters change. It does NOT update on camera movement or other parameter changes (optimization).

---

## 9. The Interaction System

### 9.1 Interaction Modes

The stairway configurator supports multiple interaction modes that can coexist:

| Mode | Active By Default | Activation | Description |
|---|---|---|---|
| **Orbit** | Yes | Always | Camera orbit/pan/zoom via OrbitControls |
| **Slider Adjust** | Yes | Always | Parameter sliders in side panel |
| **Click-to-Inspect** | Yes | Click/tap any element | Shows element-specific annotation popover |
| **Detail View** | No | Button or double-click tread | Zooms to single tread cross-section |
| **Compare Mode** | No | Toggle in panel | Shows international code ghost overlays |
| **Tolerance Mode** | No | Toggle in panel | Activates per-step variation simulation |
| **Evacuation Sim** | No | Button in RA 9514 section | Runs crowd flow animation |
| **Guided Tour** | No | "Tour" button | Scripted camera + narration sequence |
| **History Layer** | No | Toggle in panel | Shows historical context hotspots |
| **Quiz Mode** | No | "Quiz" button or tour checkpoint | In-canvas quiz questions |

### 9.2 Click-to-Inspect System

When a student clicks/taps a 3D element, the system:

1. Identifies the element by its `GeometryInstruction.id` (via raycasting).
2. Looks up the element in a **click-target registry** that maps element ID patterns to annotation content. Example: any ID matching `tread-*` triggers the tread annotation; any ID matching `handrail-*` triggers the handrail annotation.
3. Displays a popover at the click point containing: the element name, the current dimension value, the applicable code limits (per law), the compliance status, and a "Learn more" link to the deep-knowledge layer.

**Rule: Click-to-inspect NEVER conflicts with orbit.** Use `e.stopPropagation()` on mesh click handlers. If the click is a drag (orbit gesture), do not trigger inspect. Distinguish click from drag by tracking `onPointerDown` and `onPointerUp` positions — if they differ by more than 5px, it was a drag.

### 9.3 Detail View Transition

When "Detail View" is activated (double-click tread or dedicated button):

1. The camera smoothly animates (lerp over 0.8s) to a side-section view of a single riser-tread junction, positioned at the midpoint of the stair.
2. The selected tread's `GeometryInstruction` is replaced with a higher-detail instruction that includes nosing profile geometry.
3. New annotations appear for nosing-specific dimensions: projection distance, leading edge radius, riser undercut angle, contrast strip width.
4. Non-selected treads dim to 30% opacity (visual focus on the detail).
5. A "Back to Overview" button appears.
6. OrbitControls are constrained to a tight range around the detail view (prevent the student from orbiting to a meaningless angle).

**Performance note:** Only ONE tread is rendered at high detail. All others remain boxes. This keeps the polygon count constant regardless of which tread is selected.

### 9.4 Evacuation Simulation Interaction

The evacuation flow visualization is a **one-shot animation**, not a persistent state. When activated:

1. A parameter appears for "People evacuating" (dropdown: 25, 50, 100, 200).
2. The simulation runs for a fixed duration (e.g., 10 seconds of simulated time at 2x speed).
3. Abstract dots flow down the stair, with speed and density determined by current geometry.
4. If a bottleneck occurs (width too narrow for load, or no landing at 3,000 mm), dots visually pile up at the bottleneck point.
5. After the simulation, a summary appears: "Estimated evacuation time: X seconds. Bottleneck at: [location]."
6. The simulation can be replayed with different geometry (change slider, re-run sim).

**Performance constraint:** The particle system must use instanced rendering (drei `<Instances>`) — NOT individual mesh objects per dot. Maximum 200 instances. Use `useFrame` for animation, but only while the simulation is running — deactivate the frame loop callback when idle.

### 9.5 Guided Tour System

The guided tour is a sequence of stops, each with: a camera position, a narration text, optional highlighted elements, optional enabled sliders, and optional quiz questions. The tour follows the 4–6 stop maximum from the Information Designer skill.

**Rule: Tours are defined as data, not as components.** A tour is an array of `TourStop` objects in the config file. The tour engine (a shared system across all modules) reads the array and drives the camera, narration, and highlighting. Module-specific tour content lives in the config; tour behavior lives in the engine.

**Rule: The student controls pace.** Each stop has a "Continue" button. Auto-advance is never used. Auto-advance violates Mayer's Segmenting Principle and frustrates students who read at different speeds.

---

## 10. The Comparison and Overlay Engine

### 10.1 Design Rules

**Rule: Comparison is always additive, never subtractive.** When Compare Mode is active, the real geometry remains unchanged. Ghost geometry is ADDED to the scene to show the international code's requirements. The student sees both simultaneously.

**Rule: Each international code has its own ghost color.** These colors are distinct from all law colors and from each other: IBC → a cool gray-blue, ADA → a warm gray-gold, IRC → a neutral gray. Ghost colors are defined in the same color constant file as law colors.

**Rule: Ghost geometry is ONLY generated for dimensions that differ.** If the current stair's riser height is 175 mm and IBC's max is 178 mm, the difference is negligible — no ghost riser is generated. Only generate ghost geometry when the current value is outside the international code's limits OR when the dimensional difference is large enough to be visually meaningful (> 20 mm threshold for linear dimensions, > 2° for angles).

**Rule: Comparison deltas are shown as annotations, not as geometry dimensions.** A ghost tread does not have its own dimension line. Instead, a single comparison annotation near the ghost tread reads: "IBC requires ≥ 279 mm (current: 250 mm, Δ +29 mm)."

### 10.2 Comparison Scorecard

When Compare Mode is active, the compliance report panel adds an "International Comparison" section below the Philippine law cards. This section shows a row per international code with a summary: "IBC 2024: 3 of 6 dimensions would pass" with individual pass/fail indicators per dimension.

The scorecard reads from `ComputedStairState.internationalComparison` — it does NOT re-evaluate compliance. The computation engine has already done the work.

---

## 11. Camera and View System

### 11.1 Predefined Views

The module supports the following camera presets, accessible via view buttons or keyboard shortcuts:

| View | Camera Position | Look-At | Purpose |
|---|---|---|---|
| **Default (3/4)** | [3, 3, 3] | [0, totalRise/2, -totalRun/2] | Overview of entire stair |
| **Side Elevation** | [3, totalRise/2, 0] | [0, totalRise/2, 0] | Riser/tread proportions, pitch angle |
| **Front View** | [0, totalRise/2, 3] | [0, totalRise/2, 0] | Width, handrail height |
| **Top Plan** | [0, totalRise+2, -totalRun/2] | [0, 0, -totalRun/2] | Plan view for landing layout |
| **Detail (Nosing)** | Computed per selected tread | Selected tread midpoint | Cross-section detail |
| **Under-stair** | [0, -0.5, -totalRun/2] | [0, totalRise/2, -totalRun/2] | Stringer, headroom clearance |

### 11.2 Camera Transition Rules

**Rule: All camera transitions are animated.** Never snap the camera. Use lerp (linear interpolation) over 0.6–1.0 seconds. The student must maintain spatial awareness during transitions.

**Rule: OrbitControls are always active except during transitions.** During a camera transition, disable orbit temporarily to prevent the student from fighting the animation. Re-enable immediately after the transition completes.

**Rule: Constrain orbit in Detail View.** When in the nosing detail view, limit orbit to ±30° azimuth and ±20° elevation from the detail camera angle. This prevents the student from orbiting to a position where the cross-section is invisible.

**Rule: Reset to Default View is always one click away.** A "Reset Camera" button (or double-click empty space) returns to the default 3/4 view.

---

## 12. Performance Contract

Every feature must satisfy these budgets. No exceptions.

### 12.1 Hard Limits

| Metric | Budget | Hard Fail |
|---|---|---|
| GeometryInstruction count | < 200 instructions | > 500 |
| Triangle count (rendered) | < 30,000 | > 50,000 |
| Draw calls per frame | < 50 | > 100 |
| Time to compute `ComputedStairState` | < 2 ms | > 10 ms |
| Time to generate GeometryInstruction array | < 5 ms | > 20 ms |
| Sustained FPS (M1 MacBook Air) | 60 fps | < 45 fps |
| Sustained FPS (Realme C55 / Samsung A14) | 30 fps | < 20 fps |
| Total module JS bundle (excluding shared Three.js) | < 150 KB | > 300 KB |
| Peak JS heap during interaction | < 80 MB | > 150 MB |

### 12.2 Per-Feature Impact Budget

New features are pre-allocated performance impact budgets:

| Feature | Max Draw Calls Added | Max Triangles Added | Max Instructions Added |
|---|---|---|---|
| Blondel comfort gauge | 0 (HTML overlay) | 0 | 0 (viewport-space) |
| Nosing detail view | +2 (one detail tread) | +500 | +3 |
| Compare Mode (IBC) | +20 (ghost geometry) | +2,000 | +40 |
| Tolerance Mode | 0 (recolor existing) | 0 | 0 |
| Evacuation Sim | +1 (instanced particles) | +400 | +1 |
| History Layer | 0 (HTML overlays) | 0 | 0 |
| L-shape stair | +15 (landing + turn) | +3,000 | +30 |
| Handrail cross-section | +1 (detail popup) | +200 | +2 |

### 12.3 Optimization Strategies Pre-Approved for Use

The following optimization techniques are approved and should be used as needed:

**On-demand rendering (`frameloop="demand"`).** The stairway configurator is a static scene that only changes when parameters change. Use demand mode and trigger frames via `invalidate()` on parameter change, camera movement, and animation ticks. Idle GPU cost: near zero.

**Instanced geometry for repeated elements.** Treads are repeated N times with the same geometry but different positions. Use drei's `<Instances>` component. 20 treads = 1 draw call instead of 20.

**HTML overlays for non-3D UI.** The comfort gauge, comparison scorecard, quiz popups, and history annotations are HTML elements positioned in viewport space via drei's `<Html>`. They consume zero GPU draw calls.

**Geometry merging for static elements.** The base platform and top landing are always the same material and never individually interactive — they could be merged into a single mesh. The stringers (when added) are static and could be merged with the stair body.

**LOD for detail view.** At normal zoom, treads are boxes (6 faces = 12 triangles each). In detail view, one tread is high-poly (nosing profile ≈ 50 triangles). All others remain boxes. Net triangle increase for detail view: ~38 triangles.

### 12.4 Optimization Strategies Prohibited

**Do NOT use `occlude` on Html elements.** Occlusion testing is expensive (extra GPU readback per frame per element). Annotations should use visibility logic based on camera angle and element selection, not GPU occlusion queries.

**Do NOT allocate Three.js objects inside the geometry builder.** The geometry builder returns plain instruction objects. The renderer allocates Three.js objects. This prevents the builder from triggering GC pressure on parameter changes.

**Do NOT use `useFrame` for static annotations.** Annotations that don't animate should not subscribe to the render loop. Use `useEffect` triggered by parameter changes instead.

**Do NOT use `WebGLRenderTarget` or post-processing.** The stairway configurator does not need bloom, SSAO, or outline post-processing. These effects consume significant GPU bandwidth on mobile. The edge-based architectural visual language (Edges component, transparent planes) achieves the SlateCamp visual standard without post-processing.

---

## 13. State Management Architecture

### 13.1 The Zustand Store

All stairway configurator state lives in a single Zustand store with `subscribeWithSelector` middleware. The store is divided into slices:

**Parameters slice** — All raw user-controlled values. Updated by slider/toggle/dropdown interactions in the UI panel.

**Computed slice** — The `ComputedStairState` object. Updated by a subscriber that watches the parameters slice and re-runs the computation engine on any change.

**UI slice** — Active view mode, selected element ID, active overlays (compare, tolerance, history), tour state (current stop, running/paused), quiz state, evacuation sim state.

### 13.2 Subscription Rules

**Rule: Canvas-internal components subscribe to specific fields, never the whole store.** Use `useLabStore(s => s.computed.twoRPlusT)` not `useLabStore()`. This prevents re-rendering the entire Canvas when unrelated state changes.

**Rule: The computation engine runs outside React.** Use `useLabStore.subscribe(s => s.parameters, recompute)` at the store level. The `recompute` function runs the full computation engine and writes the result to the `computed` slice. This ensures computation happens once per parameter change, regardless of how many components read the computed values.

**Rule: UI state changes that don't affect geometry use `invalidate()` sparingly.** Changing the active annotation does not require a re-render of the 3D scene. Only changes that affect visible geometry (parameter changes, overlay toggles, view mode changes) should call `invalidate()`.

### 13.3 Data Flow Summary

```
User drags slider
  → Store: parameters.riserHeight = 195
  → Subscriber: detects parameter change
  → Computation engine: recomputes ComputedStairState
  → Store: computed = newComputedState
  → Canvas components: re-render (geometry builder reads new computed values)
  → Violation system: reads new compliance results, updates violation annotations
  → Comfort gauge: reads new twoRPlusT, updates display
  → Renderer: calls invalidate() → frame renders
```

---

## 14. Feature Implementation Registry

Every planned feature is registered here with its dependencies, phase, and integration points.

### Phase 1 — Quick Wins

| Feature | Files Affected | Dependencies | Notes |
|---|---|---|---|
| **Blondel Comfort Gauge** | computation engine, annotation layer | None — can ship independently | HTML overlay, no geometry changes |
| **Historical "Why" Layer** | annotation config, UI toggle | None | Content-only, new annotation entries |
| **Dimensional Uniformity Toggle** | computation engine, geometry builder (per-step color) | New parameter: toleranceRange | Recolors existing geometry, no new shapes |
| **Stair type abstraction** | geometry builder, types | None | Introduce `StairTypeConfig` with only `straight` implemented |
| **Computation/geometry separation** | Refactor existing code | None — prerequisite for everything | Extract computation into pure functions |

### Phase 2 — Depth Features

| Feature | Files Affected | Dependencies | Notes |
|---|---|---|---|
| **Nosing Profile Detail View** | geometry builder, view system, new instruction type | Phase 1 stair type abstraction | New `extruded-profile` type, camera transition |
| **International Code Comparison** | computation engine, geometry builder, UI panel | Phase 1 computation separation | New constants file, ghost geometry |
| **Handrail Graspability Detail** | geometry builder, annotation layer | Phase 2 nosing (same detail view pattern) | Cross-section popup |
| **Click-to-Inspect System** | interaction system, annotation layer | Phase 1 stable element IDs | Raycasting + popover |

### Phase 3 — Flagship Features

| Feature | Files Affected | Dependencies | Notes |
|---|---|---|---|
| **Evacuation Flow Sim** | new particle system, interaction system | Phase 1 computation separation | Instanced particles, animation loop |
| **Children's Handrail & Guards** | geometry builder, violation system, annotation layer | Phase 2 comparison engine pattern | New user group parameter |
| **Material & Slip Resistance** | geometry builder (PBR materials), annotation layer | None | Material selector, texture changes |
| **L-Shape Stair** | geometry builder (major), computation engine, all downstream | Phase 1 stair type abstraction | Landing geometry, handrail turn |
| **U-Shape Stair** | geometry builder (major), computation engine, all downstream | Phase 3 L-shape | Switchback geometry, continuous interior handrail |

---

## 15. File and Module Structure

### 15.1 Target Directory Layout

```
src/app/dashboard/3d-lab/_config/modules/08-vertical/
├── stairway-configurator.ts           # Main config export (ParametricSceneConfig)
├── stairway-computation.ts            # Pure computation engine
├── stairway-constants.ts              # All PH code constants (named, cited)
├── stairway-constants-international.ts # IBC, ADA, IRC constants
├── stairway-geometry.ts               # Geometry builder (consumes ComputedStairState)
├── stairway-geometry-straight.ts      # Straight-run sub-builder
├── stairway-geometry-l-shape.ts       # (Phase 3) L-shape sub-builder
├── stairway-geometry-u-shape.ts       # (Phase 3+) U-shape sub-builder
├── stairway-violations.ts             # Violation rule definitions
├── stairway-annotations.ts            # Annotation definitions
├── stairway-presets.ts                # Preset scenarios
├── stairway-tour.ts                   # Guided tour stop definitions
├── stairway-quiz.ts                   # Dynamic quiz question generators
├── stairway-comparison.ts             # International comparison evaluator
└── stairway-types.ts                  # TypeScript types specific to this module
```

### 15.2 Naming Conventions

| Convention | Example | Rule |
|---|---|---|
| Constants | `PD1096_MAX_RISER_HEIGHT_MM` | SCREAMING_SNAKE_CASE, law prefix, unit suffix |
| Computation functions | `computeRiserCompliance()` | camelCase, starts with `compute` |
| Geometry sub-builders | `buildStraightRunGeometry()` | camelCase, starts with `build` |
| Violation IDs | `pd1096-max-riser` | kebab-case, law prefix |
| Annotation IDs | `riser-height` | kebab-case, element name |
| Geometry instruction IDs | `tread-0`, `bp344-rail-900-L` | kebab-case, element-index-qualifier |
| Color constants | `LAW.RA_9514`, `NEUTRAL.TREAD` | Object property, law or role name |

### 15.3 Import Rules

**Rule: The main config file (`stairway-configurator.ts`) imports from the other files and assembles the final `ParametricSceneConfig`.** It is the only file that external code imports.

**Rule: The computation engine imports ONLY from constants files.** No Three.js imports. No R3F imports. No store imports. Pure math.

**Rule: The geometry builder imports from the computation engine types and constants.** It does NOT import computation functions — it receives `ComputedStairState` as input.

**Rule: No circular imports.** The dependency graph is a DAG: constants → computation → types ← geometry ← config. Violations, annotations, presets, and tour all depend on types and constants only.

---

## 16. Do's and Don'ts — The Hard Rules

### Do's

1. **DO** define every code threshold as a named constant with a citation comment.
2. **DO** keep computation functions pure — no side effects, no DOM, no Three.js.
3. **DO** use `useMemo` for geometry derived from parameters — recompute only when dependencies change.
4. **DO** use `useRef` + mutation for any value that changes every frame (animation, camera lerp).
5. **DO** use `frameloop="demand"` and explicit `invalidate()` — this module is mostly static.
6. **DO** use drei `<Instances>` for repeated geometry (treads, risers, dots).
7. **DO** use drei `<Html>` for all text annotations, gauges, and UI overlays in the viewport.
8. **DO** use `e.stopPropagation()` on every mesh click handler.
9. **DO** distinguish click from drag (track pointer down/up delta) before triggering inspect.
10. **DO** animate all camera transitions (lerp 0.6–1.0s).
11. **DO** test on a throttled connection (Chrome DevTools → 4G preset) and a low-end device.
12. **DO** dispose geometry and materials on component unmount.
13. **DO** use the existing `ParametricSceneConfig` pattern — extend it, don't bypass it.
14. **DO** write TypeScript with zero `any` types and explicit return types on all functions.
15. **DO** keep annotation content concise — max 2 sentences per hotspot, one number per dimension callout.

### Don'ts

1. **DON'T** call `setState` inside `useFrame` — this causes 60 re-renders per second.
2. **DON'T** allocate `new THREE.Vector3()` or any Three.js object inside `useFrame` or the geometry builder.
3. **DON'T** use `occlude` on `<Html>` components — it's too expensive for mobile.
4. **DON'T** use post-processing effects (bloom, SSAO, outline passes) — they murder mobile FPS.
5. **DON'T** embed computation logic in the geometry builder — separate them.
6. **DON'T** merge violation rules across laws — each law evaluates independently.
7. **DON'T** auto-advance the guided tour — the student controls pacing.
8. **DON'T** show all annotations simultaneously — progressive disclosure, max 4–6 visible.
9. **DON'T** use hardcoded pixel positions for annotations — compute from geometry.
10. **DON'T** create a separate rendering system for new stair types — extend the existing instruction set.
11. **DON'T** put code citation text in variables named with abbreviations — spell out the law name.
12. **DON'T** average or merge compliance results across laws — if two laws disagree, flag the conflict.
13. **DON'T** render high-detail nosing geometry on all treads simultaneously — use LOD (one detail tread at a time).
14. **DON'T** use `useThree()` without a selector — always `useThree(s => s.camera)`.
15. **DON'T** import Three.js in the computation engine — it must remain pure.
16. **DON'T** forget to call `invalidate()` after parameter changes in demand mode — the scene won't update.
17. **DON'T** use magic numbers anywhere — if it's a threshold, it's a named constant with a citation.

---

## 17. Testing and Validation Protocol

### 17.1 Computation Engine Tests

Every computation function gets unit tests. Test cases must cover:

- **Boundary values:** riser at exactly 200 mm (PD 1096 max), at 201 mm (violation), at 199 mm (pass).
- **Law applicability:** BP 220 rules fire only when projectType is bp220_socialized or bp220_economic.
- **Overlay stacking:** When both isAccessibleRoute AND isExitStair are active, the strictest applicable limit is used.
- **Cross-law conflicts:** When riser is 210 mm on a BP 220 project, PD 1096 would fail but BP 220 passes — conflict flag is raised.
- **Comfort formula:** 2R+T at 599 (below range), 600 (boundary), 625 (mid-range), 650 (boundary), 651 (above range).
- **International comparison:** Same parameters evaluated against IBC, ADA, IRC — delta values are correct.

### 17.2 Geometry Instruction Validation

Every geometry builder run is validated before rendering:

- All instruction IDs are unique within the array.
- All positions are finite numbers (no NaN, no Infinity).
- All color values are valid hex strings.
- Box dimensions are all positive.
- Cylinder radii are positive and heights are positive.
- Total instruction count is within budget (< 200 for straight run, < 300 for L-shape).

### 17.3 Visual Regression Testing

Before any release, capture screenshots at each preset scenario and compare against baseline images:

- Standard House (default parameters, all overlays off).
- BP 220 Housing (BP 220 project type).
- Public Hall (accessible route + high occupancy active).
- Exit Stair (exit stair + high occupancy active).
- Violation State (riser at 210 mm on commercial project).
- BP 344 Overlay Active (dual-height ghost handrails visible).
- Compare Mode Active (IBC ghost treads visible).
- Detail View (nosing cross-section of middle tread).

### 17.4 Performance Testing

Run on two target devices:

**Laptop baseline:** M1 MacBook Air, Chrome, 1440×900 viewport. Must sustain 60fps during slider drag (continuous parameter changes). Measure with `r3f-perf` or Chrome DevTools Performance panel.

**Mobile target:** Realme C55 or Samsung Galaxy A14, Chrome, full-screen viewport. Must sustain 30fps during slider drag. Test with Chrome remote debugging (chrome://inspect). If actual device is unavailable, use Chrome DevTools → Performance → CPU 6x slowdown as approximation.

### 17.5 Code Accuracy Audit

Before production: a licensed Philippine architect (or ALE subject matter expert) reviews every named constant, every violation rule message, and every code citation string. This review is documented in a sign-off checklist. No code value ships without SME verification.

**Specific verification items:**
- All PD 1096 section numbers are correct for the current IRR edition.
- All BP 344 dimensions reflect the 2024 Revised IRR (not the original 1982 law or older IRRs).
- All RA 9514 values reflect the current IRR as enforced by BFP.
- All IBC values reflect the 2024 edition (Section 1011).
- All ADA values reflect the 2010 ADA Standards for Accessible Design.

---

## 18. Glossary

| Term | Definition |
|---|---|
| **ComputedStairState** | The central immutable data object produced by the computation engine from raw parameters. Contains all derived metrics, compliance results, and comparison deltas. |
| **GeometryInstruction** | A plain serializable object describing a single 3D primitive (box, cylinder, etc.) with position, dimensions, color, and metadata. |
| **ParametricSceneConfig** | The top-level config type consumed by the generic 3D Lab module renderer. Contains parameters, geometry builder, violations, annotations, presets, and camera config. |
| **Parallel Rule-Set Pattern** | The architecture where each law evaluates the same geometry independently and conflicts are flagged rather than resolved. |
| **Ghost Geometry** | Translucent overlay geometry that appears when an optional layer (BP 344, Compare Mode) is active. Shows what the stair would look like under different code requirements. |
| **Demand Mode** | R3F `frameloop="demand"` — the canvas only renders when explicitly told to via `invalidate()`. Saves battery and GPU on mobile when the scene is not changing. |
| **Detail View** | A camera-close cross-section view of a single stair element (tread nosing, handrail profile) that reveals high-detail geometry not visible in the overview. |
| **Comfort Gauge** | A viewport-space UI element displaying the Blondel 2R+T value, pitch angle, and comfort status. Not anchored to 3D geometry. |
| **Violation Color Resolution** | The priority cascade that determines which single color an element displays when multiple violations from different laws are active simultaneously. |
| **Stair Type Abstraction** | The config structure that allows the module to support straight-run, L-shape, and U-shape stairs through type-specific geometry sub-builders while keeping all other systems (violations, annotations, interactions) type-agnostic. |
| **Click-Target Registry** | A mapping from geometry instruction ID patterns to annotation content, used by the click-to-inspect interaction system. |
| **Tour Stop** | A data object defining one step in the guided tour: camera position, narration text, highlighted elements, optional quiz question. |
| **Tolerance Mode** | A simulation where per-step riser/tread dimensions are randomly perturbed within a user-controlled range, teaching dimensional uniformity requirements. |

---

*This document is the technical authority for the Stairway Configurator module. All implementation decisions must be traceable to a section in this plan. If a decision is not covered here, raise it for discussion and add it to this document before implementing.*

*Last updated: April 9, 2026*
