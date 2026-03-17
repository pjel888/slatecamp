# Plan: 3D Lab Module Expansion — 146 Missing ALE Modules

**Status:** Draft
**Created:** 2026-03-17
**Scope:** Expand MODULE_REGISTRY from 40 → 186 entries and create config files for all modules with `status: 'ready'` or `status: 'built'`.

---

## Context

The ALE concepts document (`prompts/EVERY_ALE_CONCEPTS_THAT_BELONGS_TO_3D.md.md`) identifies **186 interactive 3D modules** across all 13 subject areas. The current registry has **40 entries**. Of those 40, only **9 have config files** (the rest are `status: 'planned'`). This plan covers:

1. Adding the ~146 missing registry entries (metadata only — fast)
2. Creating config files for priority modules (geometry builders, violations, presets — slow)

---

## Current Registry Coverage

| Subject | Registry Now | ALE Doc Target | Gap |
|---------|-------------|---------------|-----|
| PD 1096 (Building Code) | 6 | 28 | **22** |
| RA 9514 (Fire Code) | 4 | 18 | **14** |
| BP 344 (Accessibility) | 3 | 14 | **11** |
| History of Architecture | 4 | 33 | **29** |
| NSCP (Structural) | 4 | 16 | **12** |
| NPCP (Plumbing) | 3 | 14 | **11** |
| PEC (Electrical) | 3 | 10 | **7** |
| PMEC (Mechanical) | 2 | 8 | **6** |
| Building Materials | 3 | 12 | **9** |
| Construction Assemblies | 0 | 15 | **15** |
| Specifications | 2 | 2 | 0 |
| Estimating | 2 | 2 | 0 |
| Prof Practice | 2 | 2 | 0 |
| Planning | 2 | 9 | **7** |
| Housing Laws | 0 | 4 | **4** |
| **Total** | **40** | **~186** | **~146** |

---

## Execution Strategy

### Phase 1: Registry Expansion (metadata only)
**Effort:** Low — purely additive, no runtime code
**Approach:** Add all ~146 missing `ModuleRegistryEntry` objects to `moduleRegistry.ts` with `status: 'planned'`. Also add new subject area entries for "construction-assemblies" and "housing-laws" to `SUBJECT_AREAS`.

This is a single task that can be done in one pass through the ALE document, mapping each concept to an `id`, `title`, `templateType`, `subject`, `codeRef`, and `description`.

### Phase 2: Config Files for Priority Modules (P1–P20)
**Effort:** High — each config requires geometry builders, parameter defs, violations, presets
**Approach:** Build configs in priority order. Each config file is ~100–300 lines of geometry math.

### Phase 3: Config Files for Remaining Modules (batched by template type)
**Effort:** Very high — 100+ config files
**Approach:** Batch by template type so similar geometry patterns can be reused.

---

## Phase 1 Tasks: Registry Expansion

### Task 1.1: Add new subject areas to SUBJECT_AREAS
Add entries for subjects not yet in the array:
- `construction-assemblies` (label: "Construction Assemblies", count: 15)
- `housing-laws` (label: "Housing Laws (PD 957/BP 220)", count: 4)

Update existing counts to match ALE doc targets.

**Files:** `src/app/dashboard/3d-lab/_config/moduleRegistry.ts`

### Task 1.2: Add PD 1096 registry entries (22 new)
Add entries for concepts from ALE Section 1:
- `ceiling-height-configurator` (parametric) — Room heights by ventilation type
- `development-controls-pso` (parametric) — PSO/TGFA/AMBF calculator
- `court-requirements` (parametric) — Court dimensions scaling with height
- `window-openings` (parametric) — Window-to-floor area ratio
- `vent-shaft-dimensions` (parametric) — Vent shaft cross-section requirements
- `firewall-construction` (cutaway) — Firewall section with fire ratings
- `construction-types-comparison` (exploded) — 5 construction types side-by-side
- `parking-dimensions` (floorplan) — Vehicle type parking layouts
- `mezzanine-clearances` (cutaway) — Mezzanine height requirements
- `setback-visualizer` (floorplan) — R-1/R-2/R-3 setback rules
- `carport-abutment` (parametric) — Carport height and material rules
- Plus ~11 more from the detailed ALE breakdown

**Files:** `src/app/dashboard/3d-lab/_config/moduleRegistry.ts`

### Task 1.3: Add RA 9514 registry entries (14 new)
- `occupant-load-calculator` (floorplan) — OLF by use type
- `exit-door-mechanics` (animated) — Door swing, width, panic hardware
- `stairwell-enclosure` (cutaway) — Fire-rated stairwell section
- `fire-suppression-systems` (cutaway) — Sprinkler/standpipe building section
- `smoke-control-systems` (animated) — Pressurization and downdraft
- `fire-detection-layout` (floorplan) — Detector placement and spacing
- `standpipe-classes` (cutaway) — Class I/II/III comparison
- Plus ~7 more from ALE Section 2

**Files:** `src/app/dashboard/3d-lab/_config/moduleRegistry.ts`

### Task 1.4: Add BP 344 Accessibility entries (11 new)
- `wheelchair-maneuvering` (parametric) — Turning circles and corridor widths
- `accessible-toilet-detailed` (cutaway) — Full 2024 IRR cubicle with grab bars
- `tactile-block-types` (exploded) — Directional/warning/positional blocks
- `accessible-door-clearances` (parametric) — Door approach clearances
- `accessible-elevator-cab` (parametric) — 2024 cab dimensions
- `ramp-tactile-warnings` (parametric) — Tactile block placement on ramps
- Plus ~5 more from ALE Section 4

**Files:** `src/app/dashboard/3d-lab/_config/moduleRegistry.ts`

### Task 1.5: Add History of Architecture entries (29 new)
From ALE Section 7:
- 5 classical orders as individual detailed models (tuscan, doric, ionic, corinthian, composite)
- `superposition-demo` (animated) — Colosseum-style stacking
- `colossal-order` (exploded) — Multi-storey column
- 9 structural evolution periods (egyptian-post-lintel, greek-peristyle, roman-arch-vault, byzantine-pendentive, romanesque-barrel-vault, gothic-flying-buttress, renaissance-dome, modernism-five-points, contemporary-parametric)
- 5 world landmark cutaways (pantheon, hagia-sophia, notre-dame, florence-cathedral, guggenheim-bilbao)
- `bahay-kubo` (exploded) — Already in registry
- `earthquake-baroque` (cutaway) — Paoay Church section
- Plus ~5 more Philippine heritage

**Files:** `src/app/dashboard/3d-lab/_config/moduleRegistry.ts`

### Task 1.6: Add NSCP Structural entries (12 new)
- `lrfd-load-combinations` (animated) — 7 load combo overlays
- `dead-live-load-toggles` (parametric) — Load values by occupancy
- `soil-profile-cutaway` (cutaway) — SA through SF soil columns
- `wind-load-analysis` (parametric) — Pressure distribution on faces
- `rc-cover-requirements` (cutaway) — Rebar cover by exposure
- `rebar-sizes-catalog` (exploded) — Philippine standard sizes
- `steel-connections` (exploded) — Bolted vs welded joints
- `structural-systems-comparison` (parametric) — R-factor comparison
- Plus ~4 more from ALE Section 3

**Files:** `src/app/dashboard/3d-lab/_config/moduleRegistry.ts`

### Task 1.7: Add NPCP Plumbing entries (11 new)
- `pipe-slope-visualization` (cutaway) — Slope by pipe diameter
- `septic-tank-design` (parametric) — Bedroom-count slider
- `water-supply-riser-detailed` (cutaway) — Full traced pipe diagram
- `backflow-prevention` (exploded) — Air gaps, vacuum breakers, RPZ
- `fixture-unit-values` (parametric) — DFU by fixture type
- `trap-seal-depth` (cutaway) — 51–102mm seal range
- `vent-pipe-routing` (cutaway) — Vent diameter and slope rules
- `grease-trap` (cutaway) — Commercial kitchen grease trap
- Plus ~3 more

**Files:** `src/app/dashboard/3d-lab/_config/moduleRegistry.ts`

### Task 1.8: Add PEC Electrical entries (7 new)
- `outlet-spacing-room` (floorplan) — 1.8m coverage ring rule
- `mounting-heights` (parametric) — Outlet/switch/panel heights
- `circuit-conductor-sizing` (cutaway) — Panel with wire sizing
- `illumination-heatmap` (floorplan) — Lux levels by room type
- `gfci-protection-zones` (floorplan) — Kitchen/bath/outdoor zones
- `emergency-power-layout` (floorplan) — Generator and ATS placement
- `electrical-room-context` (parametric) — Full room with all elements

**Files:** `src/app/dashboard/3d-lab/_config/moduleRegistry.ts`

### Task 1.9: Add PMEC Mechanical entries (6 new)
- `air-changes-per-hour` (animated) — ACH by room type with airflow
- `elevator-hoistway` (cutaway) — Cab dimensions and pit depth
- `escalator-section` (cutaway) — 30° inclination, draft curtain
- `machine-room-layout` (floorplan) — Equipment placement
- `cross-ventilation` (animated) — Natural airflow patterns
- `refrigeration-cycle` (animated) — Compressor-condenser-evaporator

**Files:** `src/app/dashboard/3d-lab/_config/moduleRegistry.ts`

### Task 1.10: Add Building Materials entries (9 new)
- `chb-block-types` (exploded) — 4"/5"/6"/8" at actual scale
- `bond-pattern-comparison` (exploded) — Running/stack/Flemish/English
- `standard-material-sheets` (exploded) — Plywood/gypsum dimensions
- `rebar-catalog` (exploded) — 8mm through 36mm with weights
- `steel-sections-catalog` (exploded) — W-shapes, channels, angles
- `lumber-sizes` (exploded) — Standard Philippine lumber dimensions
- `concrete-aggregate-visualizer` (parametric) — Aggregate/cement/water ratios
- `waterproofing-systems` (cutaway) — Membrane/cementitious/crystalline/liquid
- `mortar-joint-types` (cutaway) — Concave/V/flush/raked/struck

**Files:** `src/app/dashboard/3d-lab/_config/moduleRegistry.ts`

### Task 1.11: Add Construction Assemblies entries (15 new)
New subject area — `construction-assemblies`:
- `wall-types-comparison` (cutaway) — Solid CHB/cavity/veneer/curtain/drywall
- `foundation-types` (exploded) — Isolated/combined/strip/mat/pile
- `roof-truss-fink` (exploded) — Fink truss with purlin details
- `roof-truss-pratt` (exploded) — Pratt truss
- `roof-truss-howe` (exploded) — Howe truss
- `roof-truss-warren` (exploded) — Warren truss
- `roof-truss-king-post` (exploded) — King post (short spans)
- `roof-truss-queen-post` (exploded) — Queen post (medium spans)
- `column-construction-sequence` (animated) — Rebar to formwork to pour
- `beam-construction-sequence` (animated) — Shoring to rebar to pour
- `slab-construction-sequence` (animated) — Formply to rebar to MEP to pour
- `chb-wall-construction` (animated) — Layout to mortar to grout
- `formwork-assembly` (exploded) — Formply/props/stringers
- `plastering-layers` (cutaway) — Scratch coat + finish coat
- `lintel-over-opening` (cutaway) — Reinforced lintel detail

**Files:** `src/app/dashboard/3d-lab/_config/moduleRegistry.ts`

### Task 1.12: Add Planning & Housing Law entries (11 new)
- `clup-zoning-overlay` (floorplan) — Comprehensive land use plan zones
- `subdivision-layout-pd957` (floorplan) — Open market lot/road dimensions
- `subdivision-layout-bp220` (floorplan) — Socialized housing dimensions
- `pd957-vs-bp220-comparison` (floorplan) — Side-by-side layouts
- `water-code-easements` (floorplan) — Waterway/shoreline/fault setbacks
- `building-typology-residential` (parametric) — Spatial program diagram
- `building-typology-commercial` (parametric) — Area allocation
- `building-typology-institutional` (parametric) — Classroom/clinic blocks
- `building-typology-assembly` (parametric) — Seating/stage/lobby
- `building-typology-industrial` (parametric) — Production/storage/office
- `building-typology-transportation` (parametric) — Terminal/platform/concourse

**Files:** `src/app/dashboard/3d-lab/_config/moduleRegistry.ts`

### Task 1.13: Add Professional Practice entries (0 new — already at target)
The 2 existing entries (`project-delivery-methods` and `contract-document-hierarchy`) match the ALE doc. No action needed.

---

## Phase 2 Tasks: Priority Config Files (P11–P20)

P1–P10 already have configs. The next 10 highest-impact modules to build configs for:

### Task 2.1: `nbcp-envelope` config migration
The legacy `NBCPEnvelope` scene exists but isn't in the template system. Create a config file at `_config/modules/nbcp-envelope.ts` using the `ParametricSceneConfig` format with PSO/TGFA/AMBF parameters.

### Task 2.2: `ceiling-height-configurator` config
Parametric room model with ventilation type toggle, multi-storey mode, and PD 1096 Rule VIII compliance.

### Task 2.3: `development-controls-pso` config
Parametric lot model with zoning classification dropdown, PSO/TGFA/AMBF calculation, setback visualization.

### Task 2.4: `occupant-load-calculator` config
Floor plan with use-type dropdown, area input, dynamic occupant count and exit requirements.

### Task 2.5: `wheelchair-maneuvering` config
Parametric corridor/room with turning circle overlay, corridor width presets, BP 344 2024 IRR dimensions.

### Task 2.6: `construction-types-comparison` config
Exploded assembly comparing 5 construction types (Type I–V) with fire resistance ratings.

### Task 2.7: `chb-block-types` config
Exploded view of 4"/5"/6"/8" CHB blocks at actual scale with mortar joints and laying factors.

### Task 2.8: `pipe-slope-visualization` config
Cutaway building section showing pipe slopes by diameter (1% for ≥100mm, 2% for ≤75mm).

### Task 2.9: `exit-door-mechanics` config
Animated door model showing swing direction, clear width, panic hardware activation.

### Task 2.10: `seismic-parameter-map` config (P8 — already in registry)
Interactive Philippine map with Zone 2/4, soil profiles, near-source factors. This is the existing P8 priority module that still needs its config.

---

## Phase 3: Remaining Configs (batched by template)

### Task 3.1: Parametric configs batch (~45 modules)
All remaining `templateType: 'parametric'` modules. These share the same geometry builder pattern — a function that takes params and returns `GeometryInstruction[]`.

### Task 3.2: Exploded assembly configs batch (~35 modules)
All remaining `templateType: 'exploded'` modules. These define `AssemblyPart[]` with `explodeOffset` vectors.

### Task 3.3: Floor plan configs batch (~25 modules)
All remaining `templateType: 'floorplan'` modules. These define rooms, paths, and fixtures.

### Task 3.4: Cutaway configs batch (~25 modules)
All remaining `templateType: 'cutaway'` modules. These define `LayerDef[]` with depth values.

### Task 3.5: Animated sequence configs batch (~15 modules)
All remaining `templateType: 'animated'` modules. These define `SequenceStep[]` with geometry per step.

---

## Verification

After each phase:
1. `npx tsc --noEmit` — zero new errors
2. Gallery page loads and shows all modules grouped by subject
3. Modules with configs render correctly in the viewer
4. Modules without configs show graceful fallback (existing GLTF Workspace)

---

## Dependencies

- Phase 1 has no dependencies — pure registry metadata
- Phase 2 depends on Phase 1 (entries must exist before configs reference them)
- Phase 3 depends on Phase 2 (patterns established in P11–P20 inform batch work)

## Notes

- Each config file is self-contained (~100–300 lines). No cross-config dependencies.
- The gallery automatically picks up new registry entries — no routing changes needed.
- Status flow: `planned` → `ready` (config written) → `built` (tested + polished)
- The `ModuleGallery` already groups by subject and shows status badges, so `planned` modules appear as "coming soon" cards.
