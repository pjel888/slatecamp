# 06 — Vizcode Competitive Implementation Plan

**Created:** 2026-04-08
**Purpose:** Exact implementation roadmap to match and exceed every Vizcode module with interactive 3D parametric versions. This is the build plan — architecture prerequisites are in `01–05`.
**Prerequisite:** Architecture Phases P0–P3 must be complete before any module in this plan is built.
**Rule:** Every module in this plan maps to a Vizcode static infographic and must deliver the same information PLUS parametric interactivity, live violation feedback, and ALE quiz integration.

---

## The Competitive Framing

Vizcode delivers **static isometric infographics** — beautiful, well-designed, but frozen. A student reads the value and memorizes it.

SlateCamp delivers **parametric 3D simulators** — the student manipulates the value, crosses the violation threshold, sees the red flash, and understands *why* the limit exists. Retention is not from reading. It is from the moment of violation.

**Every module in this plan must produce that moment.**

---

## Vizcode Coverage Map → SlateCamp Module

| Vizcode Card | Law | SlateCamp Module ID | Template | Status |
|---|---|---|---|---|
| Firewall Extensions (above roof, edges, eaves) | PD 1096 Rule 8 | MOD-104 | `parametric` | Build |
| Room Minimum Dimensions | PD 1096 Rule 8 | MOD-102 | `parametric` | Verify built |
| Setbacks (FLAR) | PD 1096 Rule 7 | MOD-103 | `parametric` | Verify built |
| BHL Envelope | PD 1096 Rule 7 | MOD-105 | `parametric` | Verify built |
| Staircase Rise/Run | PD 1096 Rule 8 | MOD-101 | `parametric` | Build |
| Ramp + Zocalo | BP 344 Section A | MOD-202 | `parametric` | Build |
| Parks & Playground Density (Medium Cost) | PD 957 Sec 1.C.1 | MOD-405 | `parametric` | Build |
| Parks & Playground Density (Economic/Soc) | BP 220 Sec 5.C.1 | MOD-407 | `parametric` | Build |
| Saleable vs Non-Saleable Ratio | PD 957 | MOD-401 | `parametric` | Build |
| High-Rise Building Definition | RA 9514 Rule 3 | MOD-301 | `parametric` | Build |
| Unpaved Surface Area + Vegetation | GBC Section 14 | MOD-501 | `parametric` | Build |

**Beyond Vizcode — modules they don't have:**
- Travel Distance (MOD-302), Sprinkler Coverage (MOD-304), Exit Width (MOD-308), Number of Exits (MOD-309), Accessible Toilet (MOD-205), Wheelchair Turning (MOD-201), Elevator Cab (MOD-208), Tactile Paving (MOD-203), Corridor Width (MOD-209), Fire Zone Classification (MOD-303), Rowhouse Cluster (MOD-403), Road Hierarchy (MOD-404), WWR Configurator (MOD-502), Shading Device (MOD-503), Natural Ventilation (MOD-504)

---

## Part A — Modules That Directly Match Vizcode

These 11 modules are the minimum viable competitive set. Each one targets a specific Vizcode card.

---

### MOD-104: Firewall Extensions
**Vizcode card:** PD 1096 Rule 8 — "Maximum Extension of Abutments or Firewalls"
**Vizcode delivers:** Static isometric building showing 0.40m / 0.60m / 0.30m labels.
**SlateCamp delivers:** Parametric building where each extension is a slider. Pulling below the minimum triggers a violation overlay. The student cannot miss what 0.40m means because they feel the boundary.

**Template:** `parametric`
**Camera preset:** `isometric-building`
**Lighting preset:** `diagram`

**Parameters:**
| ID | Label | Min | Max | Default | Code Min | Law |
|----|-------|-----|-----|---------|----------|-----|
| `parapet_above_roof` | Parapet Above Roof | 0.10m | 1.00m | 0.40m | 0.40m | PD 1096 IRR Rule VIII |
| `from_outermost_edges` | From Outermost Edges | 0.20m | 1.20m | 0.60m | 0.60m | PD 1096 IRR Rule VIII |
| `under_eaves` | Under Eaves | 0.10m | 0.80m | 0.30m | 0.30m | PD 1096 IRR Rule VIII |

**Geometry:** Blender base model — simple gabled residential building. Three parametric meshes extend/retract as sliders move: parapet plate above ridge, side wall extension at outermost edges, wall stub under eave overhang.

**Violations:** Each parameter below its minimum → corresponding mesh turns `#E74C3C`, `ViolationBadge` appears with citation.

**Hotspots (3):**
- `hs-parapet` → "The parapet is the vertical wall extension above the roof ridge. At minimum 0.40m, it prevents fire spreading over the roof from an adjacent building."
- `hs-edges` → "The 0.60m extension from the outermost wall edges prevents fire wrapping around the building corners."
- `hs-eaves` → "The firewall must extend 0.30m below the eave overhang to close the gap between wall and roof."

**ALE Quiz (3 questions):**
1. What is the minimum height of a firewall parapet above the roof? → 0.40m
2. A firewall measuring 0.55m from the outermost edges is: → Non-compliant (below 0.60m minimum)
3. The purpose of the firewall extension under the eaves is to: → Prevent fire from entering through the gap between the wall and roof overhang

---

### MOD-102: Minimum Room Dimensions
**Vizcode card:** PD 1096 Rule 8 — Room requirements
**Vizcode delivers:** Static diagram showing minimum areas per room type.
**SlateCamp delivers:** Interior room with draggable walls. Student resizes the room and sees live area calculations. Dropping below minimum triggers violation with the specific room-type rule.

**Template:** `parametric`
**Camera preset:** `interior-room`
**Lighting preset:** `diagram`

**Parameters:**
| ID | Label | Min | Max | Default | Code Min | Law |
|----|-------|-----|-----|---------|----------|-----|
| `room_width` | Room Width | 1.5m | 10m | 2.0m | Varies per type | PD 1096 IRR VIII §801 |
| `room_depth` | Room Depth | 1.5m | 10m | 3.0m | Varies per type | PD 1096 IRR VIII §801 |
| `ceiling_height` | Ceiling Height | 1.5m | 4.0m | 2.7m | 2.7m habitable | PD 1096 IRR VII §701 |
| `room_type` | Room Type | — | — | `habitable` | — | Select control |

**Room type selector** (not a slider — dropdown):
| Type | Min Area | Min Dimension |
|------|----------|---------------|
| Habitable | 6.0 sqm | 2.0m |
| Kitchen | 3.0 sqm | 1.5m |
| Toilet/Bath | 1.2 sqm | 0.9m |
| Laundry | 1.5 sqm | 0.9m |

**Live computation overlay (DOM):**
- Current area: `{width × depth} sqm`
- Required minimum: `{roomType.minArea} sqm`
- Status badge: Green COMPLIANT / Red VIOLATION

**Geometry:** Box room, floor plane, ceiling plane. Width and depth driven by sliders via `BufferGeometry` recompute each frame.

---

### MOD-103: FLAR & Setback Configurator
**Vizcode card:** PD 1096 Rule 7 — Setbacks
**SlateCamp advantage:** Already partially built. Verify it uses `SceneConfig`, DOM overlays, and shared constants. If yes, advance to Wave 1. If not, refactor first.

**Key interaction not in Vizcode:** Street-side selector (front/rear/side) with different setback values per face. Violation zone shaded red when building footprint crosses setback line.

---

### MOD-105: Building Height Limit Envelope
**Vizcode card:** PD 1096 Rule 7 — BHL
**SlateCamp advantage:** Already built. Verify architecture compliance then advance.

**Key interaction not in Vizcode:** Adjustable road right-of-way width slider that drives the BHL angular plane computation in real time. Student sees the envelope shrink as the road widens.

---

### MOD-101: Staircase Geometry Configurator
**Vizcode card:** PD 1096 Rule 8 — Stairway
**SlateCamp advantage:** Already built as flagship module. Verify then advance.

**Key interaction not in Vizcode:** Cross-code mode toggle (PD 1096 only / + BP 344 / + RA 9514) that overlays the most restrictive limit from each applicable law. Students see the multi-code resolution in action.

---

### MOD-202: Ramp + Zocalo
**Vizcode card:** BP 344 Section A — "Minimum Height of Zocalo at Both Sides"
**Vizcode delivers:** Static isometric ramp showing 100mm zocalo label.
**SlateCamp delivers:** Fully parametric ramp where slope, width, length, and zocalo height are all live sliders. Landing auto-generates when run exceeds 10.50m (per BP 344 IRR).

**Template:** `parametric`
**Camera preset:** `isometric-building`
**Lighting preset:** `diagram`

**Parameters:**
| ID | Label | Min | Max | Default | Code Limit | Law |
|----|-------|-----|-----|---------|------------|-----|
| `slope_ratio` | Slope (1:X) | 1:20 | 1:6 | 1:12 | 1:12 max | BP 344 IRR |
| `clear_width` | Clear Width | 0.90m | 3.0m | 1.20m | 0.90m min | BP 344 IRR |
| `run_length` | Ramp Run | 1.0m | 20.0m | 6.0m | 10.50m max before landing | BP 344 IRR |
| `zocalo_height` | Zocalo Height | 0.05m | 0.30m | 0.10m | 0.10m min | BP 344 IRR |
| `handrail_height` | Handrail Height | 0.60m | 1.10m | 0.90m | 0.70m + 0.90m | BP 344 IRR |

**Auto-behavior:** When `run_length` exceeds 10.50m, a landing (1800mm × full width) auto-inserts at the midpoint and a `LabelOverlay` reads: "Landing required — run exceeds 10.50m (BP 344 IRR)."

**Geometry (hybrid pipeline):**
- Base GLB: handrail posts, zocalo edge strips — from Blender
- Parametric: ramp surface, landing platform — from `BufferGeometry` driven by sliders

**Hotspots (4):**
- `hs-zocalo` → "The zocalo is the raised curb edge on both sides of the ramp. At minimum 100mm, it prevents wheelchair wheels from slipping off the edge."
- `hs-slope` → "1:12 means 1 unit rise for every 12 units run. This is the maximum gradient a standard wheelchair user can self-propel."
- `hs-landing` → "Landings provide rest points. Required at top, bottom, and every 10.50m of ramp run."
- `hs-handrail` → "BP 344 requires handrails at 700mm and 900mm to serve both seated (wheelchair) and standing users."

**ALE Quiz (3 questions):**
1. What is the maximum ramp gradient under BP 344? → 1:12
2. At what ramp run length is an intermediate landing required? → 10.50m
3. The minimum height of the zocalo on both sides of a ramp is: → 100mm

---

### MOD-405: Parks & Playground Density — PD 957
**Vizcode card:** PD 957 Section 1.C.1 — Medium Cost & Open Market parks allocation table
**Vizcode delivers:** Static infographic with isometric subdivision + table showing density vs. % allocation.
**SlateCamp delivers:** Live subdivision model. Student adjusts density (lots/hectare) with a slider. The park allocation % updates in real time. The park zone in the site model grows/shrinks to match.

**Template:** `parametric`
**Camera preset:** `isometric-site`
**Lighting preset:** `diagram`

**Parameters:**
| ID | Label | Min | Max | Default | Law |
|----|-------|-----|-----|---------|-----|
| `density` | Density (lots/ha) | 1 | 100 | 20 | PD 957 Sec 1.C.1 |
| `gross_area_ha` | Gross Area (ha) | 1.0 | 10.0 | 2.0 | PD 957 Sec 1.C.1 |

**Computed outputs (DOM overlay):**
- Park allocation %: looked up from density table (step function, not linear)
- Required park area: `gross_area_ha × allocation_pct` in sqm
- Mandatory trigger: highlight when `gross_area_ha >= 1.0` ("Parks mandatory for projects ≥ 1 hectare")

**Density → Allocation lookup table (from PD 957 Sec 1.C.1):**
```ts
const PD957_PARKS_TABLE = [
  { maxDensity: 20,  pct: 0.035 },
  { maxDensity: 25,  pct: 0.040 },
  { maxDensity: 35,  pct: 0.050 },
  { maxDensity: 50,  pct: 0.060 },
  { maxDensity: 65,  pct: 0.070 },
  { maxDensity: Infinity, pct: 0.090 },
]
```

**Geometry:** Top-down isometric site grid. Lot units use `<Instances>` (never individual meshes). Park zone is a distinct colored plane that scales in real time. Trees (`<Instances>`) populate the park zone.

**Key interaction not in Vizcode:** Side-by-side mode showing PD 957 (Medium Cost) vs. BP 220 (Economic/Socialized) density tables simultaneously with a toggle — same density slider drives both columns.

---

### MOD-407: Parks & Playground Density — BP 220
**Vizcode card:** BP 220 Rule 2 — Economic & Socialized Housing parks allocation
**Same structure as MOD-405 but uses BP 220 Section 5.C.1 table:**

```ts
const BP220_PARKS_TABLE = [
  { maxDensity: 150, pct: 0.035 },
  { maxDensity: 160, pct: 0.040 },
  { maxDensity: 175, pct: 0.050 },
  { maxDensity: 200, pct: 0.060 },
  { maxDensity: 225, pct: 0.070 },
  { maxDensity: Infinity, pct: 0.090 },
]
```

**Key interaction not in Vizcode:** Economic Housing and Socialized Housing share the same density table under BP 220. The module shows this explicitly — two columns, same values, with a tooltip explaining why they're identical.

---

### MOD-401: Saleable vs. Non-Saleable Area Ratio
**Vizcode card:** PD 957 — Saleable 70% / Non-saleable 30% for ≥1 hectare
**Vizcode delivers:** Static isometric subdivision with labeled zones.
**SlateCamp delivers:** Site model where student drags a boundary between saleable and non-saleable zones. When saleable exceeds 70%, the saleable zone turns red. When non-saleable drops below 30%, violation fires.

**Template:** `parametric`
**Camera preset:** `isometric-site`

**Parameters:**
| ID | Label | Min | Max | Default | Code Limit | Law |
|----|-------|-----|-----|---------|------------|-----|
| `gross_area_ha` | Gross Area (ha) | 0.5 | 10.0 | 2.0 | ≥1ha triggers rule | PD 957 |
| `saleable_pct` | Saleable % | 50% | 90% | 70% | 70% max | PD 957 |

**Computed:**
- Non-saleable % = 100 - saleable_pct
- Mandatory indicator: "This rule applies only to projects ≥ 1 hectare" (visible when gross_area < 1.0)

**Geometry:** Site plan split into two zones with live-updating areas. Zone colors: Saleable = `#C8A8E0` (light purple, Vizcode's palette), Non-saleable = `#E0C8F0` with tree/park instances.

---

### MOD-301: High-Rise Building Definition
**Vizcode card:** RA 9514 Rule 3 — High-Rise Building (≥15m)
**Vizcode delivers:** Static orange building with ≥15m arrow.
**SlateCamp delivers:** Parametric building where student adjusts height with a slider. When height crosses 15m, the building changes classification: "Low-Rise" → "High-Rise" with a classification badge update and an animated highlight. Additional fire code requirements for high-rise appear as a checklist overlay.

**Template:** `parametric`
**Camera preset:** `isometric-building`
**Lighting preset:** `diagram`

**Parameters:**
| ID | Label | Min | Max | Default | Threshold | Law |
|----|-------|-----|-----|---------|-----------|-----|
| `building_height` | Building Height (m) | 3.0m | 60.0m | 12.0m | 15.0m | RA 9514 IRR Rule 3 |
| `storey_height` | Floor-to-Floor (m) | 2.7m | 5.0m | 3.3m | — | Pedagogical |

**Computed:**
- Number of storeys: `Math.floor(building_height / storey_height)`
- Classification: `height >= 15.0 ? 'High-Rise' : 'Low-Rise'`
- High-rise requirements appear as checklist overlay when classification = High-Rise: automatic sprinklers, fire command center, pressurized stairwells, emergency generator

**Key interaction not in Vizcode:** The 15m threshold is measured from the lowest level of fire department vehicle access to the floor of the highest occupiable storey — not the roof. The module shows this measurement correctly (subgrade parking floors don't count). The student can toggle a basement and see the measured height stay the same.

**ALE Quiz (2 questions):**
1. Under RA 9514, a high-rise building is defined as one where the floor of the topmost storey is at least: → 15 meters from the lowest level of fire department vehicle access
2. A building with a basement parking level and 5 floors above grade, with each floor at 3.5m, is classified as: → High-Rise (5 × 3.5 = 17.5m)

---

### MOD-501: Unpaved Surface Area + Vegetation
**Vizcode card:** GBC Chapter 2 — Unpaved Surface Area, 50% indigenous vegetation
**Vizcode delivers:** Static green building with USA/ISA labels and "50% of USA = indigenous species" callout.
**SlateCamp delivers:** Lot model with live USA calculation. Student adjusts impervious coverage and sees USA update. A vegetation slider controls % of USA planted with indigenous species. Below 50% triggers GBC violation.

**Template:** `parametric`
**Camera preset:** `isometric-site`
**Lighting preset:** `diagram`

**Parameters:**
| ID | Label | Min | Max | Default | Code Limit | Law |
|----|-------|-----|-----|---------|------------|-----|
| `lot_area_sqm` | Lot Area (sqm) | 100 | 5000 | 400 | — | — |
| `isa_pct` | Impervious Surface % | 10% | 95% | 70% | Per zoning | PD 1096 |
| `indigenous_pct` | Indigenous Vegetation % of USA | 0% | 100% | 50% | 50% min | GBC Sec 14.2 |

**Computed:**
- USA = lot_area × (1 - isa_pct)
- Required indigenous area = USA × 0.50
- Actual indigenous area = USA × indigenous_pct

**Geometry:** Lot plan with three zones: building footprint (grey), paved surfaces (dark grey), USA (green gradient — saturated where indigenous, desaturated where non-indigenous). `<Instances>` for tree/shrub assets that populate the indigenous zone.

**Key interaction not in Vizcode:** The module shows the NBC USA (from PD 1096) and GBC USA (50% indigenous planting requirement) as two separate but related layers — students see how the two laws interact on the same lot.

---

## Part B — Beyond Vizcode: Modules They Don't Have

These modules expand the catalogue to areas where Vizcode has no coverage. Each one is a unique SlateCamp advantage.

---

### MOD-302: Egress Travel Distance
**Why it beats Vizcode:** Vizcode has no egress diagram. This is one of the highest-frequency ALE Area C topics.

**Template:** `floorplan`
**Camera preset:** `top-down`

**Interaction:** Student draws a floor plan (or selects from preset floor plan templates). The module traces the path from the farthest occupied point to the nearest exit using a pathfinding algorithm. The path length updates live. When it exceeds the RA 9514 limit for the selected occupancy, the path turns red.

**Parameters:**
- Occupancy type selector (Assembly, Business, Mercantile, Educational, Residential)
- Sprinkler toggle (changes the allowed distance: 46m → 61m for most occupancies)
- Dead-end corridor toggle (shows 6m maximum pocket)

**Computed:** Path length in meters, maximum allowed distance, compliance status, occupancy load.

---

### MOD-304: Sprinkler Head Coverage
**Template:** `floorplan`
**Camera preset:** `top-down`

Student places sprinkler heads on a ceiling plan and sees coverage circles. Gaps in coverage trigger a red overlay. Toggle between hazard classifications (Light, Ordinary, Extra) changes the maximum coverage radius per head.

---

### MOD-201: Wheelchair Turning Circle
**Template:** `measurement`
**Camera preset:** `top-down`

Student places a 1.80m diameter turning circle in a room plan. The circle is dragged to any position. When it intersects a wall, counter, or fixture, the intersection zone turns red. Room presets: toilet compartment, kitchen, bedroom, corridor junction.

---

### MOD-205: Accessible Toilet Compartment
**Template:** `measurement`
**Camera preset:** `interior-room`

Full accessible toilet room with all BP 344 dimensions: grab bars at 850mm, turning circle, knee clearance, door swing direction, fixture heights. Student can toggle each element on/off and see which BP 344 provisions apply. Parametric compartment width and depth — violation highlights when any clearance is violated.

---

### MOD-208: Elevator Cab Dimensions
**Template:** `parametric`
**Camera preset:** `isometric-building`

Elevator cab interior with parametric width, depth, and control panel height. Violation when internal dimensions drop below 1.10m × 1.40m (BP 344 IRR). Control panel height violations when outside 0.70m–1.20m reach range. Distance-from-entrance slider (violation at 30.00m).

---

### MOD-308: Exit Width Calculator
**Template:** `parametric`
**Camera preset:** `front-elevation`

Parametric door/corridor cross-section. Occupant load slider drives the required minimum exit width calculation. Student sees the mathematical relationship between occupant load and door width in real time.

---

### MOD-502: Window Wall Ratio (WWR) Configurator
**Template:** `parametric`
**Camera preset:** `front-elevation`

Building facade with parametric window openings. WWR percentage updates live. GBC compliance status updates. Toggle between cardinal orientations (N/S/E/W) with different solar gain implications.

---

## Part C — Implementation Sequence

### Sequence Logic

1. **Verify existing modules first** (no new code until existing code is confirmed solid)
2. **Direct Vizcode competitors second** (the 11 modules in Part A — these are the market parity requirement)
3. **Beyond-Vizcode modules third** (Part B — these are the differentiators)

### Sprint 1 — Vizcode Parity (Weeks 1–3)
**Depends on:** Architecture P0–P3 complete

| Week | Task |
|------|------|
| W1 | Verify MOD-101 (Staircase), MOD-103 (Setback), MOD-105 (BHL) against new architecture. Refactor if non-compliant. |
| W1 | Build MOD-104 (Firewall Extensions) — simplest new Vizcode competitor. GLB base model in Blender + 3 parametric sliders. |
| W2 | Build MOD-202 (Ramp + Zocalo) — hybrid pipeline. Blender handrails + BufferGeometry ramp surface. Auto-landing logic. |
| W2 | Build MOD-102 (Room Dimensions) — pure BufferGeometry box room, dropdown room type, live area computation. |
| W3 | Build MOD-405 (PD 957 Parks) + MOD-407 (BP 220 Parks) — share 90% of the same component, differ only in lookup table. |
| W3 | Build MOD-401 (Saleable Ratio) + MOD-301 (High-Rise Definition) |

**Sprint 1 exit gate:** All 11 Vizcode-equivalent modules render, respond to sliders, fire violations at correct thresholds, show DOM overlay labels, and pass `bun run type-check`.

### Sprint 2 — Beyond Vizcode, Tier 1 (Weeks 4–6)

| Week | Task |
|------|------|
| W4 | Build MOD-302 (Travel Distance) — floorplan template, pathfinding algorithm, occupancy toggle |
| W4 | Build MOD-304 (Sprinkler Coverage) — ceiling plan, coverage radius circles per hazard class |
| W5 | Build MOD-201 (Wheelchair Turning) + MOD-205 (Accessible Toilet) — measurement template |
| W5 | Build MOD-208 (Elevator Cab) + MOD-308 (Exit Width Calculator) |
| W6 | Build MOD-502 (WWR Configurator) + MOD-501 (USA Vegetation) refine |
| W6 | QA sprint: every module tested on mobile (Snapdragon 665 target), all violations verified against law text |

### Sprint 3 — Beyond Vizcode, Tier 2 (Weeks 7–9)

| Week | Task |
|------|------|
| W7 | Build MOD-203 (Tactile Paving), MOD-209 (Corridor Width), MOD-303 (Fire Zone Classification) |
| W8 | Build MOD-403 (Rowhouse Cluster), MOD-404 (Road Hierarchy) — site-planner template |
| W9 | Build MOD-306 (Smoke Enclosure), MOD-305 (Fire Escape) |
| W9 | Full catalogue QA — regulatory citations audit (`bun run audit:citations`) |

---

## Part D — Per-Module Production Checklist

Run this before marking any module DONE.

```
GEOMETRY
[ ] BufferGeometry recomputes correctly on every slider change
[ ] No geometry allocation inside useFrame
[ ] useDisposeOnUnmount called on all imperative geometry objects
[ ] GLB (if used): loaded via useGLTF, scene cloned, dispose={null}
[ ] <Instances> used for any repeated mesh (lots, parking stalls, trees)

VIOLATIONS
[ ] Every code-mandated parameter has a violation rule
[ ] Violation fires at the EXACT threshold (not ±1)
[ ] Violation badge appears as DOM overlay (not inside Canvas)
[ ] Violation badge cites the specific law section
[ ] ViolationBadge color: error = #E74C3C, warning = #F5A623

ANNOTATIONS
[ ] Zero <Html> or <Text> inside Canvas
[ ] All labels rendered via DOMOverlayLayer
[ ] Hotspot spheres are <button> elements with aria-expanded
[ ] Dimension labels show mm for values < 2m, m for ≥ 2m

PARAMETRIC
[ ] All min/max values imported from shared constants (pd-1096.ts etc.)
[ ] Every code-mandated value has a LegalCitation object with verified date
[ ] Default value = code minimum (not typical practice value)
[ ] Reset button returns all sliders to defaults

PERFORMANCE
[ ] frameloop="demand" — no unnecessary renders when idle
[ ] 60fps confirmed on mid-range device (or DPR adapted by PerformanceMonitor)
[ ] Module switch does not grow gl.info.memory.geometries

MOBILE
[ ] touch-action: none on canvas container
[ ] Orbit does not scroll page (test on Android Chrome + iOS Safari)
[ ] All hotspot tap targets ≥ 44×44px
[ ] Control panel collapses to bottom sheet on mobile
[ ] DPR capped at 1.25 on mobile

QUIZ
[ ] Minimum 2 ALE questions per module
[ ] Each question tests a specific code value from this module
[ ] Wrong answer rationale cites the law section

REGISTRATION
[ ] Module config created in config/modules/{law}/
[ ] Module registered in config/registry/cat-{id}.ts
[ ] Module config imports from shared constants — no inline hardcoded values
[ ] bun run type-check passes
[ ] bun run build passes
```

---

## Part E — The SlateCamp Advantage Statement (Per Module)

Every module page must answer: **"Why is this better than Vizcode?"**

| Vizcode | SlateCamp |
|---------|-----------|
| You read that the max riser is 200mm | You drag the riser to 210mm and the staircase turns red |
| You see that the park allocation at density 25 is 4% | You move the density slider from 20 to 21 and watch the allocation jump |
| You memorize that a ramp needs a landing at 10.50m | You extend the ramp past 10.50m and the landing auto-generates |
| You copy the 0.40m firewall parapet value | You shrink the parapet below 0.40m and see the violation badge appear |
| You read that ≥15m = high-rise | You drag the building height past 15m and watch the classification change live |

**This is the product. Not the 3D. Not the Blender models. The moment of violation.**

---

*Read alongside `01_master_architecture.md` (architectural rules) and `05_gap_supplement.md` (component APIs). Architecture phases P0–P3 are prerequisites for all modules in this plan.*
