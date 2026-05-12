# 21 — LI Module Content Ideas: Hotspot-Centered Learning Modules

## Design Principles

1. **LI handles guided educational discovery.** PI handles parametric engineering exploration. They serve different learner jobs.
2. **Hotspots are the primary interaction.** Students click parts of the 3D model to learn.
3. **Every hotspot links to a source card.** Source-verified citations are the backbone.
4. **Simple over complex.** No sliders, no compliance panels, no violation indicators. Just: see the model, click what interests you, learn.
5. **Modules should not duplicate PI content.** If PI already has a parametric module for a topic, LI should cover it differently — through hotspots and spatial discovery, not parameter manipulation.

## PI/LI Division of Labor

| Topic | PI (Parametric) | LI (Hotspot Learning) |
|-------|----------------|----------------------|
| **BP 344 Ramp** | Slider adjusts slope/width → violation indicators show compliance | Hotspots on ramp surface, handrail, landing, edge curb → click for info + quiz |
| **Egress Stair** | Sliders for riser/tread/width/occupant load → compliance panel | Hotspots on riser, tread, handrail, landing, door → info modals comparing codes |
| **Site-Lot Comparator** | Sliders for lot dimensions → compliance overlay | Hotspots on setbacks, open space, road ROW → comparison modals |
| **Occupant Load** | Sliders for area/type/load factor → exit count computation | Hotspots on floor area, exit doors, aisles → info modals explaining formulas |
| **Wall Assembly** | *(No PI module yet)* | **LI-native**: Hotspots on each wall layer (CHB, mortar, plaster, paint) |
| **Roof Assembly** | *(No PI module yet)* | **LI-native**: Hotspots on truss, purlins, sheathing, roofing, insulation |
| **Foundation System** | *(No PI module yet)* | **LI-native**: Hotspots on footing, column, tie beam, slab, waterproofing |

## Module 1: BP 344 Accessible Ramp — Hotspot Learning (P0, MVP)

**Module ID**: `bp344-ramp-hotspots`
**Template**: `learning`
**Category**: ACCESSIBILITY (cat-02)

### What the student sees
A 3D accessible ramp model with 8 hotspots on key elements.

### Hotspots

| # | Hotspot ID | Position | Type | Content |
|---|-----------|----------|------|---------|
| 1 | `ramp-surface` | Center of ramp run | **Info** | "Ramp Surface: Minimum clear width is 1200mm. Gradient must not be steeper than 1:20. Source: BP 344 IRR Appendix A, A.1 (2024)" |
| 2 | `ramp-slope-quiz` | Midpoint of ramp | **Quiz** | "What is the maximum general slope allowed for an accessible ramp? A) 1:8 B) 1:12 C) 1:15 D) 1:20" → Correct: D |
| 3 | `landing-platform` | Top landing | **Info** | "Terminal Level Area: Minimum 1800mm at upper and lower ends. Intermediate landings required for ramps longer than 10.50m. Source: BP 344 IRR p.2" |
| 4 | `handrail-left` | Left handrail midpoint | **Info** | "Dual Handrails: Required on both sides at 700mm AND 900mm from ramp surface. Two rails serve different user heights. Source: BP 344 IRR p.2" |
| 5 | `handrail-compare` | Right handrail midpoint | **Comparison** | "Handrail Height by Code: PD 1096: 800-900mm | BP 344: 700mm + 900mm (dual) | RA 9514: 800-1000mm" |
| 6 | `edge-curb` | Side edge of ramp | **Info** | "Raised Edge: Minimum height 100mm on both sides. Prevents wheelchair from slipping off the ramp. Source: BP 344 IRR p.2" |
| 7 | `tactile-warning` | Ramp head/foot | **Info** | "Tactile Warning Blocks: 600mm deep, installed 300mm from head and foot of ramp. Also at center of each landing. Source: BP 344 IRR p.3" |
| 8 | `vehicular-traffic` | Lower end of ramp | **Quiz** | "When must a ramp have a railing across its full width? A) Always B) When rise > 200mm leading to vehicular area C) When longer than 6m D) Only on exterior ramps" → Correct: B |

### Layers (Secondary Feature)
- Ramp Surface (default: visible)
- Handrails (default: visible)
- Edge Curb (default: visible)
- Landing Platform (default: visible)
- Tactile Warning (default: visible)
- Foundation (default: hidden)

### Source Cards Used
- `sc-bp344-ramp-slope-width-2024-p2` (verified: AI-extracted, pending human approval)
- `sc-bp344-ramp-landing-handrail-edge-2024-p2`
- `sc-bp344-ramp-tactile-traffic-2024-p3`
- `sc-bp344-handrails-general-2024-p7`
- `sc-pd1096-projections-opening-protection-2004-p81` (for comparison hotspot)

### Camera Presets
- Isometric overview
- Side view (shows slope)
- Plan view (shows width)
- Tactile warning close-up

### What Makes This Different From PI's Ramp Module
- **PI**: Adjust slope slider → see violation indicator → check compliance panel
- **LI**: Click ramp surface → read requirement → take quiz → see source card
- PI is for engineering "what if" exploration. LI is for spatial discovery and memorization.

---

## Module 2: BP 344 Accessible Toilet Room — Hotspot Learning (P0)

**Module ID**: `bp344-toilet-hotspots`
**Template**: `learning`
**Category**: ACCESSIBILITY (cat-02)

### Hotspots

| # | Hotspot | Type | Content |
|---|---------|------|---------|
| 1 | `water-closet` | **Info** | "Water Closet: Centerline 450-500mm from adjacent wall. Seat height 450-500mm. Source: BP 344 IRR p.36" |
| 2 | `grab-bar-rear` | **Info** | "Rear Grab Bar: 900mm long, mounted 750-850mm above floor. Source: BP 344 IRR p.36" |
| 3 | `grab-bar-side` | **Info** | "Side Grab Bar: 1050mm minimum length. Mounted 750-850mm above floor. Must extend 300mm beyond front of WC. Source: BP 344 IRR p.36" |
| 4 | `clear-floor-space` | **Info** | "Clear Floor Space: 1500mm x 1500mm minimum in front of water closet. Source: BP 344 IRR p.36" |
| 5 | `door-swing` | **Quiz** | "Should the toilet door swing into or out of the compartment? A) Into B) Out of C) Either direction D) Depends on room size" → Correct: B |
| 6 | `turning-circle` | **Info** | "Turning Space: 1500mm diameter turning circle required within the toilet room. Source: BP 344 IRR" |
| 7 | `lavatory` | **Info** | "Lavatory: Rim at 800mm max height. Knee clearance 700mm high x 750mm wide x 500mm deep. Source: BP 344 IRR p.38" |
| 8 | `accessories` | **Info** | "Accessories: Soap dispenser, mirror, towel at accessible heights (900-1200mm). Source: BP 344 IRR" |

### Source Cards Used
- `sc-bp344-accessible-toilet-compartment-grab-bars-2024-p36`
- `sc-bp344-accessible-toilet-turning-accessories-2024-p37`
- `sc-bp344-accessible-lavatory-urinal-2024-p38`

---

## Module 3: Egress Stair Cross-Code Comparison — Hotspot Learning (P0)

**Module ID**: `egress-stair-hotspots`
**Template**: `learning`
**Category**: VERTICAL (cat-08) or FIRE_CODE (cat-03)

### Concept
A single 3D stair model. Each hotspot shows how different codes specify different requirements for the same element.

### Hotspots

| # | Hotspot | Type | Content |
|---|---------|------|---------|
| 1 | `stair-riser` | **Comparison** | "Maximum Riser Height: PD 1096: 200mm (dwellings) | BP 344: 150mm (accessible) | RA 9514: 180mm" |
| 2 | `stair-tread` | **Comparison** | "Minimum Tread Depth: PD 1096: 250mm | RA 9514: 280mm (new stairs)" |
| 3 | `stair-width` | **Comparison** | "Minimum Stair Width: PD 1096: 750mm (dwellings) | BP 344: 1200mm (accessible route) | RA 9514: 900mm (egress)" |
| 4 | `stair-width-quiz` | **Quiz** | "A stair serving 200 occupants per floor needs a minimum width of: A) 750mm B) 900mm C) 1120mm D) 1200mm" → Answer depends on code and occupancy |
| 5 | `handrail-height` | **Comparison** | "Handrail Height: PD 1096: 800-900mm | BP 344 (ramps): 700mm + 900mm dual | RA 9514: 800-1000mm" |
| 6 | `landing` | **Info** | "Landings: Required at top and bottom. Intermediate landings at max 3.6m vertical intervals per PD 1096. Source: PD 1096 §1207" |
| 7 | `guardrail` | **Info** | "Guardrails required when stair is open on sides. Height: 1000mm minimum. Opening between balusters: max 100mm sphere. Source: PD 1096" |
| 8 | `exit-door` | **Info** | "Exit Door: Must swing in direction of egress travel. Minimum clear width: 900mm for accessibility, 800mm general. Source: PD 1096 §1007, BP 344 p.31" |

### Source Cards Used
- `sc-fire-new-stairs-dimensional-2019-p101`
- `sc-fire-new-stair-width-2019-p102`
- `sc-fire-stair-handrails-guards-2019-p103-p104`
- `sc-fire-egress-min-width-number-exits-2019-p95`
- `sc-bp344-stairs-accessible-route-2024-p19-p21`
- `sc-pd1096-projections-opening-protection-2004-p81`

---

## Module 4: Wall Assembly — Material Layer Exploration (P1, LI-Native)

**Module ID**: `wall-assembly-layers`
**Template**: `learning`
**Category**: MATERIALS (cat-10)

### Concept
No PI module exists for this. LI is the primary vehicle. A CHB wall section that students can peel back layer by layer AND click hotspots on each layer to learn about materials.

### Hotspots

| # | Hotspot | Type | Content |
|---|---------|------|---------|
| 1 | `chb-block` | **Info** | "CHB (Concrete Hollow Block): Standard size 100x200x400mm. Laid in running bond pattern. Source: NSCP / ASTM C90" |
| 2 | `mortar-joint` | **Info** | "Mortar Joint: 10mm thickness. Mix: 1 part cement to 3 parts sand. Horizontal and vertical joints filled. Source: ASTM C270" |
| 3 | `rebar-vertical` | **Info** | "Vertical Reinforcement: 10mm or 12mm deformed bars at max 600mm spacing. Installed through CHB cores. Source: NSCP" |
| 4 | `rebar-horizontal` | **Info** | "Horizontal Reinforcement: 10mm bars at every 3rd course. Tied to vertical bars. Source: NSCP" |
| 5 | `plaster-coat` | **Info** | "Plaster: 15-20mm cement-sand plaster on both faces. Mix 1:3 or 1:4. Applied in two coats. Source: ASTM C926" |
| 6 | `paint-finish` | **Info** | "Paint Finish: Latex or enamel over properly cured plaster. Minimum 14 days curing before painting." |
| 7 | `waterproofing` | **Quiz** | "Where would you apply a waterproofing layer in this wall assembly? A) Over CHB B) Between plaster coats C) Under plaster on exterior face D) Over paint" → Correct: C |
| 8 | `insulation-layer` | **Info** | "Insulation (optional): Rigid foam board between furring strips. R-value varies by material. Required for air-conditioned spaces per GBC." |

### Why This Is LI-Native
- No parameters to adjust — it's about understanding what's inside
- Layer toggles show construction sequence (toggle layers from inside out)
- Hotspots teach material properties and installation methods
- Quiz hotspots test material knowledge
- PI has no equivalent module

---

## Module 5: Foundation System — Component Exploration (P1, LI-Native)

**Module ID**: `foundation-system`
**Template**: `learning`
**Category**: CONSTRUCTION (cat-09)

### Hotspots

| # | Hotspot | Type | Content |
|---|---------|------|---------|
| 1 | `footing` | **Info** | "Isolated Footing: Supports single column. Width and depth calculated from soil bearing capacity and column load. Minimum 600mm thick. Source: NSCP §15" |
| 2 | `column` | **Info** | "Column: Vertical load-bearing element. Minimum dimension 200mm for reinforced concrete. Tied to footing with dowel bars. Source: NSCP §10" |
| 3 | `tie-beam` | **Info** | "Tie Beam: Connects footings at grade level. Minimum 150x300mm. Prevents differential settlement. Source: NSCP" |
| 4 | `slab-on-grade` | **Info** | "Slab on Grade: 100-150mm reinforced concrete slab. Underlain by gravel base and vapor barrier. Source: NSCP" |
| 5 | `waterproofing-membrane` | **Info** | "Waterproofing: Applied between slab and finish floor. Prevents moisture rising through concrete. Bituminous or sheet membrane." |
| 6 | `gravel-base` | **Quiz** | "What is the purpose of the gravel base under the slab? A) Structural support B) Drainage and capillary break C) Insulation D) Leveling" → Correct: B |
| 7 | `rebar-cage` | **Info** | "Reinforcement Cage: Vertical bars with ties at specified spacing. Clear cover: 75mm for footings cast against earth, 40mm for columns. Source: NSCP §20" |

---

## Module 6: Roof Assembly — Layer Exploration (P1, LI-Native)

**Module ID**: `roof-assembly-layers`
**Template**: `learning`
**Category**: MATERIALS (cat-10) or CONSTRUCTION (cat-09)

Hotspots on truss members, purlins, sheathing, underlayment, roofing material, insulation, ceiling. Comparison hotspot for different roofing materials (GI sheet vs clay tile vs concrete tile). Quiz hotspot on minimum roof slope by material.

---

## Module 7: Building Height Comparative (P0)

**Module ID**: `building-height-comparison`
**Template**: `learning`
**Category**: BUILDING_CODE (cat-01)

### Concept
A 3D building mass showing height envelope, grade plane, and measurement points. Hotspots show how PD 1096 §707 defines BHL, what's included/excluded from height, the 3.00m tolerance rule, and how fire zones affect height limits.

### Hotspots
- `bhl-definition`: Info — "Building Height Limit measured from highest adjoining sidewalk or ground surface..."
- `grade-plane`: Info — "Establishing grade: the reference plane from which height is measured"
- `tower-exception`: Info — "Towers, spires, and steeples may exceed BHL..."
- `tolerance-quiz`: Quiz — "The height measured from the lowest adjoining surface shall not exceed the maximum by more than: A) 1.00m B) 2.00m C) 3.00m D) 5.00m" → C
- `fire-zone-comparison`: Comparison — "Maximum BHL by Fire Zone: Zone 1: 15m | Zone 2: 15m | Zone 3: 18m | Zone 4: 24m | Zone 5: 36m"

---

## Content Priority Summary

| Module | Priority | Type | Source Cards Ready? |
|--------|----------|------|--------------------|
| BP 344 Ramp Hotspots | **P0 (MVP)** | Hotspot Learning | ✅ Yes (3 cards) |
| BP 344 Toilet Hotspots | **P0 (MVP)** | Hotspot Learning | ✅ Yes (3 cards) |
| Egress Stair Comparison | **P0 (MVP)** | Hotspot Learning | ✅ Yes (5 cards) |
| Building Height | **P0** | Hotspot Learning | Partial (`concept-building-height` enriched) |
| Wall Assembly | **P1** | LI-Native | ❌ Needs creation |
| Foundation System | **P1** | LI-Native | ❌ Needs creation |
| Roof Assembly | **P1** | LI-Native | ❌ Needs creation |

## Total Source Cards Available for LI

From the truth handoff (`43_final_preimplementation_truth_handoff/source-cards/`), 34 source cards exist. LI-relevant cards:

| Card | Module |
|------|--------|
| `sc-bp344-ramp-slope-width-2024-p2` | Ramp |
| `sc-bp344-ramp-landing-handrail-edge-2024-p2` | Ramp |
| `sc-bp344-ramp-tactile-traffic-2024-p3` | Ramp |
| `sc-bp344-handrails-general-2024-p7` | Ramp, Stair |
| `sc-bp344-doors-clear-level-hardware-2024-p31-p33` | Ramp (doors) |
| `sc-bp344-corridors-turnabout-2024-p35` | Ramp (route) |
| `sc-bp344-stairs-accessible-route-2024-p19-p21` | Stair |
| `sc-bp344-accessible-toilet-compartment-grab-bars-2024-p36` | Toilet |
| `sc-bp344-accessible-toilet-turning-accessories-2024-p37` | Toilet |
| `sc-bp344-accessible-lavatory-urinal-2024-p38` | Toilet |
| `sc-fire-new-stairs-dimensional-2019-p101` | Stair |
| `sc-fire-new-stair-width-2019-p102` | Stair |
| `sc-fire-stair-handrails-guards-2019-p103-p104` | Stair |
| `sc-fire-egress-min-width-number-exits-2019-p95` | Stair |
| `sc-fire-occupant-load-general-2019-p95` | Stair |
| `sc-fire-egress-capacity-table1-2019-p94` | Stair |
| `sc-pd1096-height-rrow-2004-p92` | Building Height |
| `sc-pd1096-pso-isa-usa-tosl-table-viii1-2004-p120` | Site/Building |

**18 of 34 source cards are directly usable for LI hotspot modules.** The remaining 16 cover site-lot, PD 957, fire assembly, and green building topics that are partially LI-relevant.
