# SlateCamp Unified Wall Configurator — Innovation Research Document

**Module:** `unified-wall-configurator.ts`
**Date:** April 9, 2026
**Prepared for:** Philip, Founder — SlateCamp
**Purpose:** Research-backed innovation roadmap to elevate the Unified Wall Configurator from a layered cross-section viewer into a structurally accurate, construction-faithful interactive wall assembly learning tool.

---

## Current State Assessment

The Unified Wall Configurator currently implements a layered wall cross-section with 7 core types (CHB, drywall, plywood, cement board, brick, solid concrete, existing wall) and a finish layer stack (plaster, skim coat, primer, paint). The module lets students toggle layers on/off, change paint colors, and see total build-out thickness. There are 3 violation rules, 4 annotations, and 7 scenario presets.

**What works well:** The layer stacking concept is sound — students see how a wall is built up from core to finish. The cost estimator integration is valuable. The 7 core types cover the Philippine construction landscape well. The mortar pattern (running bond with bed joints and head joints) for CHB and brick adds visual realism.

**What needs improvement:**

The module's primary weakness is **structural fidelity**. Every wall type is rendered as a solid box with optional mortar lines on the face. This means:

- **Drywall partitions show no studs, tracks, or framing.** A drywall wall is fundamentally a frame system — metal C-studs at 400mm or 600mm spacing, top and bottom U-tracks, gypsum board screwed to the flanges, with insulation in the cavity. The current module shows a single solid box labeled "Drywall (Studs + Board)" which teaches nothing about framing.
- **CHB walls show no reinforcement.** Philippine CHB construction requires vertical rebar at specified intervals (typically 800–1200mm), horizontal rebar in bond beams, and grout in reinforced cells. The current module shows mortar lines but no reinforcement — the single most important structural element in seismic-zone masonry.
- **No cavity/insulation representation.** None of the wall types show what's inside the wall — insulation, air gaps, vapor barriers, or MEP routing through stud knockouts.
- **No structural connections.** The wall floats in space with no connection to columns, beams, or foundations — all of which are critical for ALE comprehension.
- **Fire resistance and acoustic ratings are absent.** These are frequently tested on the ALE and are the primary engineering justification for choosing one wall type over another.

---

## Innovation 1: Structurally Accurate Drywall Framing System

### The Problem

The current drywall representation is a single 100mm-thick box. Real drywall construction is a framed system with discrete components visible in a cross-section or cutaway view. Students who see a solid box learn nothing about how a drywall wall is actually built — and this knowledge is directly tested on the ALE.

### The Construction Reality

A standard non-load-bearing drywall partition consists of:

- **Bottom track (U-channel):** A U-shaped galvanized steel channel fixed to the floor slab. Standard web sizes: 64mm (2½"), 92mm (3⅝"), or 150mm (6") depending on partition height and requirements. Flange height: 32mm (1¼"). The track is fixed to the floor with power-actuated fasteners or concrete anchors at 600mm maximum spacing.
- **Top track (U-channel):** Identical to the bottom track, fixed to the ceiling slab or beam above. May be a slip/deflection track in multi-story buildings to allow for structural movement.
- **C-studs (vertical framing):** C-shaped galvanized steel members inserted into the tracks. Standard spacing: 400mm (16") or 600mm (24") on center. Standard web depths match the track: 64mm, 92mm, or 150mm. Flange width: 32mm (1¼") typical for non-structural. Each stud has pre-punched knockouts (38mm × 114mm) at 610mm intervals along the web centerline for routing electrical conduit and plumbing.
- **Horizontal bridging/bracing:** Flat strap or channel bridging running horizontally through the stud knockouts at 1200mm maximum vertical intervals to prevent stud rotation and increase wall rigidity.
- **Gypsum board (drywall sheets):** 12.5mm (½") or 15.9mm (⅝") Type X gypsum board screwed to both faces of the framing. Standard sheet size: 1220mm × 2440mm (4' × 8'). Screws at 300mm on center along edges, 400mm on center in the field. Type X gypsum contains glass fibers for enhanced fire resistance.
- **Insulation (optional):** Fiberglass batt or mineral wool insulation in the stud cavity for acoustic and thermal performance. Typical thickness matches stud depth: 64mm or 92mm.
- **Joint treatment:** Paper tape and joint compound (3 coats) over all gypsum board joints and screw heads, sanded smooth for a Level 4 or Level 5 finish.

### Proposed 3D Representation

The drywall wall type should render as a **cutaway assembly** showing:

1. The bottom and top tracks as U-channel profiles at the floor and ceiling.
2. C-studs at the user-selected spacing (400mm or 600mm parameter), showing the C-profile cross-section with the web, flanges, and lip return.
3. Stud knockouts as visible punched holes in the stud webs.
4. Gypsum board on the front face (semi-transparent when in cutaway mode) to reveal the framing behind.
5. Optional insulation batts shown as a textured fill between studs.
6. Optional horizontal bridging straps through the knockouts.

This transforms the drywall preset from "a box" into "a wall you understand how to build."

### New Parameters Required

- `studSpacing`: dropdown — 400mm (16" o.c.) or 600mm (24" o.c.)
- `studDepth`: dropdown — 64mm (2½"), 92mm (3⅝"), 150mm (6")
- `gypsumThickness`: dropdown — 12.5mm (½") or 15.9mm (⅝" Type X)
- `gypsumLayers`: dropdown — Single layer or Double layer
- `showInsulation`: toggle
- `showBridging`: toggle

### Sources

- ClarkDietrich Building Systems — Structural and drywall stud specifications, flange widths, limiting heights, deflection requirements. URL: https://www.clarkdietrich.com/products/structural-studs
- US Frame Factory — Drywall metal studs comprehensive guide: gauge specifications, punch dimensions, stud nomenclature (e.g., 362S162-33), common sizes, pricing. URL: https://usframefactory.com/drywall-metal-studs-nonstructural-metal-framing/
- US Frame Factory — Metal stud nomenclature system: web width, flange designation, gauge in mils. URL: https://usframefactory.com/metal-stud-nomenclature-for-framing/
- Dimensions.com — Steel wall framing C-studs: stud sizes 92mm/140mm, spacings 305mm/406mm/610mm, punch size 102mm × 38mm. URL: https://www.dimensions.com/element/steel-wall-framing-c-studs
- Cunmac — Metal stud and track framing overview: C-stud manufactured from galvanized steel coil via cold rolling, cut lengths 2.4m–4.2m in 600mm increments. URL: https://cunmac.com/2022/11/metal-stud-and-track-framing/
- ASTM C645 — Standard Specification for Nonstructural Steel Framing Members (referenced in multiple sources)
- ASTM C955 — Standard Specification for Load-Bearing (Transverse and Axial) Steel Studs, Runners (Tracks), and Bracing or Bridging

---

## Innovation 2: CHB Reinforcement and Grouting Visualization

### The Problem

The current CHB representation shows mortar joint lines (bed joints and head joints in a running bond pattern) on the face of a solid box, but shows no internal structure. In Philippine construction, CHB walls are reinforced masonry systems — the reinforcement (vertical rebar + horizontal rebar + grout) is what provides seismic resistance. A CHB wall without reinforcement is non-compliant in any Philippine seismic zone. This is a critical ALE topic.

### The Construction Reality

A standard reinforced CHB wall in the Philippines consists of:

- **Concrete hollow blocks:** Standard Philippine size is 150mm × 200mm × 400mm (6" × 8" × 16") for load-bearing walls, or 100mm × 200mm × 400mm (4" × 8" × 16") for non-load-bearing partitions. Load-bearing blocks must have minimum compressive strength of 5.41 MPa (800 psi) per individual unit, or 6.89 MPa (1000 psi) average of 5 units, per PNS ASTM C90.
- **Mortar:** Class A (1:2 cement:sand), Class B (1:3), or Class C (1:4) depending on application. 10mm bed joints and head joints. Mortar type per NSCP requirements.
- **Vertical reinforcement:** 10mm or 12mm deformed bars (fy = 275 MPa or 414 MPa) placed in the hollow cells of the CHB at 800mm–1200mm intervals as specified by the structural engineer. Additional vertical bars at each side of every opening (doors, windows) and at wall ends/corners.
- **Horizontal reinforcement:** 10mm bars placed in bond beams (horizontally grouted courses) at every 3rd or 4th course (600mm or 800mm vertical intervals). Continuous bond beam at the top of the wall (lintel/ring beam level).
- **Grout:** Concrete fill in the cells containing reinforcement. Mix approximately 1:3:2 (cement:sand:gravel) with a slump of 200–250mm for workability in narrow cells.
- **Stiffener columns:** Small reinforced concrete columns at maximum 4.0m horizontal intervals along the wall length and at every corner/intersection. These are the primary seismic-resisting elements.
- **Stiffener beams:** Reinforced concrete beams at the top of the wall connecting stiffener columns. Together with the columns, they form a frame that confines the masonry.
- **Dowels:** L-shaped rebar connecting the CHB wall to adjacent RC columns and beams, typically matching the wall reinforcement diameter.

### Proposed 3D Representation

The CHB wall type should render with a **section cut mode** that reveals:

1. Individual CHB units in the running bond pattern (not just mortar lines on a solid face, but actual 3D blocks with visible hollow cells).
2. Vertical rebar in the hollow cells at the user-selected spacing.
3. Grout fill in the reinforced cells (different color from the block — concrete gray vs. block gray).
4. Horizontal bond beam courses at the specified interval, showing the horizontal rebar embedded in the grouted course.
5. Stiffener columns at wall ends (partial — showing the connection detail).
6. L-shaped dowels connecting to adjacent structure.

The exploded/cutaway view reveals the internal structure; the normal view shows the external face with mortar pattern and plaster layers as currently implemented.

### New Parameters Required

- `rebarSpacing`: slider — 600mm to 1200mm, step 200mm (vertical rebar interval)
- `rebarDiameter`: dropdown — 10mm, 12mm, 16mm
- `bondBeamInterval`: dropdown — Every 3rd course (600mm), Every 4th course (800mm)
- `showReinforcement`: toggle — reveals/hides the rebar and grout
- `showStiffenerColumns`: toggle
- `chbSize`: dropdown — 100mm (4" non-bearing), 150mm (6" bearing)
- `chbClass`: dropdown — Load-bearing (PNS ASTM C90) or Non-load-bearing (PNS ASTM C129)

### Sources

- Allied Concrete Products Philippines — CHB construction standards: PNS ASTM C90/C129, NSCP 2015 seismic provisions, fire resistance ratings (1-hour unfilled, up to 4-hour solidly grouted for 150mm CHB), STC 45-50 acoustic performance. URL: https://www.alliedconcreteph.com/insights/why-concrete-hollow-blocks-for-construction
- Cebu City Government / DPWH — Structural notes: stiffener columns at every 4.0m max spacing, CHB vertical and horizontal reinforcement schedules, bond beam details, minimum 750 psi for load-bearing blocks. URL: https://www.cebucity.gov.ph/wp-content/uploads/2020/12/101.pdf
- Scribd — CHB Construction Standards Philippines: mortar mix proportions (Class A 1:2 to Class D 1:5), material quantities per sq.m. (12.5 pcs/sqm for 150×200×400mm CHB), reinforcement schedules, seismic resistance requirements. URL: https://www.scribd.com/document/867465638/CHB
- Mackunhardware — DIY CHB wall construction: vertical rebar 10-12mm at 80-120cm intervals, mortar 1:4 cement:sand, running bond pattern, grout filling every 2-3 courses. URL: https://mackunhardware.com/blogs/mh-articles/diy-guide-how-to-build-a-hollow-block-wall-in-the-philippines
- BFP Region 8 — Typical masonry section details: stiffener columns every 3.0m, right-angle reinforcement at corners (920mm long), dowel requirements at CHB-to-column connections. URL: https://region8.bfp.gov.ph/wp-content/uploads/2021/05/S5.pdf

---

## Innovation 3: Fire Resistance Rating System

### The Problem

Fire resistance is one of the most important engineering properties of a wall assembly and is frequently tested on the ALE. The current module has zero fire rating information. Students cannot compare wall types by their fire performance, which is a primary selection criterion in real Philippine practice governed by RA 9514 (Fire Code).

### The Data

Fire resistance ratings (per ASTM E119 testing) for common wall assemblies:

| Wall Assembly | Fire Rating | Notes |
|---|---|---|
| 150mm CHB, unfilled, unplastered | 1 hour | Standard non-bearing partition |
| 150mm CHB, partially grouted | 2 hours | Grouted at reinforced cells only |
| 150mm CHB, solidly grouted | 4 hours | All cells filled with grout |
| 100mm CHB, unfilled | 30 minutes | Non-bearing partition only |
| Single layer ½" gypsum on metal studs, no insulation | 30 minutes | Bare minimum partition |
| Single layer ⅝" Type X gypsum each side, metal studs | 1 hour | Standard commercial partition |
| Double layer ⅝" Type X gypsum each side, metal studs | 2 hours | Fire-rated corridor wall |
| 200mm brick masonry, unplastered | 2 hours | Solid clay brick |
| 150mm solid concrete wall | 2 hours | Depends on aggregate type |
| 150mm solid concrete wall, plastered both sides | 3 hours | Plaster adds protection |
| 12mm plywood on wood studs | 0 minutes (not rated) | Combustible assembly |
| Cement board on metal studs | 1 hour (with Type X backing) | Typical exterior partition |

### Proposed Implementation

A **Fire Rating Badge** displayed on the compliance report panel showing the current assembly's estimated fire resistance rating in hours. The rating updates dynamically as the student changes wall type, adds layers, and modifies assembly parameters. The badge color-codes: red (< 1 hour), amber (1 hour), green (2+ hours), blue (4 hours).

A **fire rating violation** that fires when the assembly's fire rating is below the RA 9514 requirement for the selected occupancy type. New parameter: `occupancyType` (residential, commercial, hospital, assembly, industrial) which determines the minimum required fire rating.

### Sources

- NCMA TEK 7-1D — Fire Resistance Ratings of Concrete Masonry Assemblies. Covers ASTM E119 testing methodology, equivalent thickness calculation for fire rating determination, and prescriptive fire resistance tables per aggregate type. URL: https://leebp.com/wp-content/uploads/NCMA-Tek-7-1B-Fire-Resistance-Ratings-of-Concrete-Masonry-Assemblies.pdf
- CMHA — Fire Resistance Ratings of Concrete Masonry Assemblies. Detailed calculation procedures, ΔSTC for drywall additions, and control joint fire protection methods. URL: https://www.cmha.org/resource/tek-07-01d/
- American Gypsum — Fire Safety Information: ASTM E119 testing methodology explanation, Type X gypsum definition, and assembly vs. product fire rating distinction. URL: https://www.americangypsum.com/resource-center/literature/fire-safety-information
- Allied Concrete Products PH — CHB fire ratings: 150mm unfilled = 1 hour, solidly grouted = up to 4 hours. URL: https://www.alliedconcreteph.com/insights/why-concrete-hollow-blocks-for-construction
- CGC/USG — Fire performance: ASTM E119 time-temperature curve, hose stream test requirements, Type X vs Type C gypsum definitions, ASTM E84 flame spread classification. URL: https://www.usg.com/content/usgcom/en_CA_east/products/performance-applications/fire-performance.html

---

## Innovation 4: Acoustic Performance (STC Rating) System

### The Problem

Sound Transmission Class (STC) is the standard single-number metric for comparing the acoustic performance of wall assemblies. The IBC requires a minimum STC of 50 for unit-to-unit multifamily partitions. Philippine building practice follows similar requirements. The current module shows no acoustic data — a significant gap for ALE preparation and real-world design decision-making.

### The Data

| Wall Assembly | STC Rating | Subjective Experience |
|---|---|---|
| Single ½" drywall each side, wood studs, no insulation | 33 | "Paper thin" — loud speech easily heard |
| Single ½" drywall each side, metal studs, no insulation | 35–39 | Loud speech audible |
| Single ½" drywall each side, metal studs, fiberglass batt | 39–44 | Loud speech heard but not intelligible |
| Single ⅝" drywall each side, metal studs, mineral wool | 45–50 | Loud speech barely audible |
| Double ⅝" drywall each side, metal studs, mineral wool | 50–55 | Loud speech not audible |
| Staggered stud wall, double drywall, insulation | 55–60 | Most sounds inaudible |
| 150mm CHB wall, unplastered | 45 | Moderate isolation |
| 150mm CHB wall, plastered both sides | 48–50 | Good residential isolation |
| 150mm CHB wall, solidly grouted, plastered | 50–55 | Excellent isolation |
| 200mm brick masonry, plastered | 50–55 | Excellent isolation |
| 150mm solid concrete | 47–50 | Good — dense mass |

### Proposed Implementation

An **STC Rating Badge** alongside the fire rating badge. Computed dynamically based on the current assembly configuration. The STC calculation considers: core material weight (heavier = higher STC), cavity insulation (adds 6–10 STC points), air gaps / cavity depth (deeper = higher STC), gypsum board mass and layers, and surface sealing (plaster adds 2–3 STC points).

The STC indicator could use a color scale: red (STC < 35 — privacy unacceptable), amber (STC 35–44), green (STC 45–50 — residential standard), blue (STC 50+ — commercial/multifamily standard).

### Sources

- Wikipedia — Sound Transmission Class: comprehensive overview of STC ratings, testing methodology (ASTM E90, ASTM E413), common wall assembly ratings, and the IBC minimum STC 50 requirement for multifamily. URL: https://en.wikipedia.org/wiki/Sound_transmission_class
- National Gypsum — Understanding Acoustical Wall Designs: 6 variables affecting STC (mass, insulation, decoupling, depth, damping, sealing). URL: https://www.nationalgypsum.com/ngconnects/blog/acoustics/understanding-acoustical-wall-designs-variables-affect-stc-ratings
- CMHA — Sound Transmission Class Ratings for Concrete Masonry Walls: calculation equations based on wall weight, ΔSTC for drywall additions with/without furring spaces, and sound absorbing material effects. URL: https://www.masonryandhardscapes.org/resource/tek-13-01d/
- Commercial Acoustics — STC Calculator and ratings: standard drywall STC 33, insulated drywall 45–50, CMU 50–55, staggered stud 55–60. URL: https://commercial-acoustics.com/resources/stc-calculator/
- Acoustical Surfaces — STC rating explanation and common assembly values. URL: https://www.acousticalsurfaces.com/blog/acoustics-education/sound-transmission-class-stc-rating/

---

## Innovation 5: MEP Integration — Conduit, Boxes, and Piping Through Walls

### The Concept

Real walls contain more than just structural elements and finishes — they conceal electrical conduit, outlet/switch boxes, plumbing pipes, and sometimes HVAC ductwork. This integration is a major source of ALE questions: "What is the minimum wall depth to accommodate plumbing supply lines?" "Where should electrical boxes be positioned in a drywall partition?" "Why are 150mm (6") studs used in bathroom partitions?"

The answer to the last question is the innovation: **6" studs are required in bathroom walls because standard plumbing supply and drain lines cannot fit within a 3⅝" stud cavity.** This is the kind of practical construction knowledge that the 3D model can teach visually.

### Proposed Implementation

- An **"MEP Layer" toggle** that reveals electrical conduit routed through stud knockouts, outlet boxes mounted between studs, and (for bathroom preset) plumbing supply/drain lines.
- New presets: "Bathroom Wall (6" studs + plumbing)" and "Standard Office (3⅝" studs + electrical)."
- Outlet box positioning visualization showing the standard mounting height (1200mm from floor for switches, 300mm for convenience outlets, per Philippine electrical code practice).
- Conduit routing through CHB walls showing the need for chasing (cutting channels into the block face) vs. drywall's stud-knockout routing — visually demonstrating why drywall is faster for electrical installation.

---

## Innovation 6: Progressive Build Animation — Construction Sequence

### The Concept

The current module shows the finished wall assembly. But understanding *the sequence of construction* is critical for ALE materials and methods questions: "What comes after the CHB is laid?" "When is primer applied relative to skim coat?" "Can you plaster directly on drywall?"

### Proposed Implementation

A **"Build Sequence" mode** that animates the wall assembly from foundation to finish, one step at a time. The student sees:

1. Foundation/floor slab (context — the wall's bearing surface)
2. Bottom track placement (drywall) or first course mortar bed (CHB)
3. Vertical framing or block coursing
4. Reinforcement and grouting (CHB) or insulation (drywall)
5. Board attachment or plaster application
6. Skim coat
7. Primer
8. Paint

Each step pauses with an annotation explaining the material, its purpose, typical cure time, and code requirements. The student controls the pace (next/previous buttons). This is the "AnimatedSequence" template pattern already in the SlateCamp 3D Lab — the wall configurator could support a hybrid mode that switches between parametric sandbox and animated build sequence.

---

## Innovation 7: Exploded Layer View with Material Callouts

### The Concept

The current module stacks layers against the wall core, which makes individual layers hard to distinguish (especially the thin skim/primer/paint layers). An exploded view would separate each layer with a gap, showing the material name, thickness, and purpose in a clear diagram format.

### Proposed Implementation

An **"Explode" slider** (0–100%) that progressively separates the layers from the core outward. At 0%, the assembly is compact (current view). At 100%, each layer floats with a visible gap and a dimension line showing its thickness. This is the "ExplodedAssembly" template pattern — the wall configurator could adopt this as a view mode.

Each layer, when exploded, shows:
- Layer name (e.g., "Plaster — 12.7mm")
- Material description (e.g., "Cement-sand plaster, 1:3 mix, cured 7 days")
- Function (e.g., "Levels surface, protects CHB from moisture")
- Applicable code reference if any

---

## Innovation 8: Waterproofing and Moisture Barrier Layers

### The Concept

Waterproofing is critical in Philippine construction due to the tropical climate. Bathroom walls, exterior walls, and below-grade walls require specific moisture protection. The current module has no waterproofing layer.

### Proposed Implementation

New parameters:
- `wallLocation`: dropdown — Interior, Exterior, Bathroom/Wet Area, Below Grade
- `showWaterproofing`: toggle

When waterproofing is active, new layers appear in the correct position:
- **Exterior walls:** Weather-resistant barrier (WRB) membrane behind the cladding or plaster. Shown as a thin colored layer.
- **Bathroom/wet area walls:** Waterproofing membrane applied over plaster before tile installation. Shown extending from floor level to 1800mm (shower area height).
- **Below-grade walls:** Bituminous or cementitious waterproofing on the earth-facing side, with drainage mat and filter fabric. Shown as distinct layers.

This teaches students that waterproofing position relative to other layers is not arbitrary — it must be on the wet side for below-grade and the dry side for bathroom wet areas (behind the tile but over the substrate).

---

## Innovation 9: Wall-to-Structure Connection Details

### The Concept

Walls don't exist in isolation — they connect to RC columns, beams, slabs, and other walls. The connection detail is one of the most commonly tested construction detail topics on the ALE, particularly for CHB walls where dowels, L-bars, and bond beams are the primary connectors.

### Proposed Implementation

An optional **"Connection Detail" view** showing:
- CHB-to-RC column: L-shaped dowels embedded in the column at every 3rd course, extending into the CHB wall.
- CHB-to-floor slab: Vertical rebar dowels extending from the slab into the wall's hollow cells.
- Drywall-to-floor: Bottom track fastened to slab with power-actuated fasteners.
- Drywall-to-ceiling: Top track with deflection gap (for multi-story movement accommodation).
- Wall corner detail: Interlocking CHB courses at corners, or double-stud/channel framing for drywall corners.

This would be shown as a partial detail — a 600mm × 600mm zoomed view of the connection point, similar to a construction detail drawing but rendered in 3D.

---

## Innovation 10: Enhanced Cost Estimation with BOM (Bill of Materials)

### The Concept

The existing cost estimator provides a total cost figure. A more detailed **Bill of Materials (BOM)** showing individual material quantities and unit costs would be significantly more valuable — especially for ALE estimating questions which require students to compute material quantities (e.g., "How many CHB are needed for a 5m × 3m wall?").

### The Data

Standard Philippine material quantities per square meter:

| Material | Quantity per sq.m. | Unit |
|---|---|---|
| 150mm × 200mm × 400mm CHB | 12.5 pieces | pcs/sqm |
| 100mm × 200mm × 400mm CHB | 12.5 pieces | pcs/sqm |
| Mortar (1:3 mix for CHB) | 0.02 cu.m. (approx.) | cu.m./sqm |
| Plaster (12.7mm thick, 1:3 mix) | 0.013 cu.m. | cu.m./sqm |
| 12.5mm gypsum board | 1.0 sheets (1.22m × 2.44m per 2.98 sqm) | sheets/sqm |
| Metal stud (at 600mm o.c.) | 1.67 pcs per linear meter of wall | pcs/lm |
| Screw (for gypsum board) | ~24 pcs/sqm (300mm edge, 400mm field) | pcs/sqm |
| Paint coverage | 8–10 sqm per liter (per coat) | sqm/L |
| Primer coverage | 10–12 sqm per liter | sqm/L |
| Skim coat coverage | 4–6 sqm per bag (25kg) | sqm/bag |

### Proposed Implementation

A **BOM panel** (separate from the 3D viewport, in the right-side panel or a slide-out drawer) that lists:
- Each material with: quantity, unit, estimated unit cost, and subtotal.
- Waste factor (typically 5–10% for CHB, 10–15% for gypsum board due to cuts).
- Labor component (per Philippine construction wage rates).
- Total estimated cost with breakdown: materials, labor, overhead.

The BOM updates in real-time as the student changes wall dimensions, type, and layer configuration. This directly prepares students for ALE estimating questions.

### Sources

- Scribd — CHB material quantities per sq.m.: 12.5 pcs for 150×200×400mm CHB, mortar quantities by class, reinforcement requirements by bar diameter. URL: https://www.scribd.com/document/443219827/CHB

---

## Innovation 11: International Wall Type Comparison

### The Concept

Similar to the stairway configurator's international code comparison, the wall configurator could show how Philippine wall construction compares to international standards — particularly wood-frame construction (dominant in North America but rare in the Philippines), steel frame construction, and European masonry traditions.

This teaches students *why* Philippine construction is predominantly CHB + RC frame: seismic requirements in the Pacific Ring of Fire, termite resistance, typhoon resistance, tropical moisture management, and local material availability. These are ALE professional practice questions.

---

## Innovation 12: Wall Performance Comparison Dashboard

### The Concept

A unified performance comparison showing all critical metrics for the current wall assembly side-by-side:

| Metric | Current Value | Rating |
|---|---|---|
| Fire Resistance | 2 hours | ★★★☆ |
| Acoustic (STC) | 48 | ★★★☆ |
| Cost per sqm | ₱2,850 | ★★★☆ |
| Construction Speed | 3 days/10sqm | ★★☆☆ |
| Moisture Resistance | Moderate | ★★☆☆ |
| Seismic Performance | Excellent (reinforced) | ★★★★ |
| Thermal Insulation | Low (R-2.5) | ★★☆☆ |

The student can compare two wall types side-by-side by selecting a "Compare with..." option. This teaches the engineering trade-offs that determine wall type selection in Philippine practice.

---

## Prioritization Matrix

| Priority | Innovation | ALE Impact | Visual Impact | Feasibility | Est. Effort |
|---|---|---|---|---|---|
| **1** | Drywall Framing System (studs + tracks) | ★★★★★ | ★★★★★ | ★★★☆☆ | High |
| **2** | CHB Reinforcement Visualization | ★★★★★ | ★★★★★ | ★★★☆☆ | High |
| **3** | Fire Resistance Rating System | ★★★★☆ | ★★★☆☆ | ★★★★★ | Low |
| **4** | STC Acoustic Rating System | ★★★★☆ | ★★★☆☆ | ★★★★★ | Low |
| **5** | Exploded Layer View | ★★★☆☆ | ★★★★★ | ★★★★☆ | Medium |
| **6** | Enhanced BOM / Cost Estimation | ★★★★☆ | ★★☆☆☆ | ★★★★☆ | Medium |
| **7** | Progressive Build Animation | ★★★★☆ | ★★★★☆ | ★★★☆☆ | Medium |
| **8** | MEP Integration Layer | ★★★☆☆ | ★★★★☆ | ★★☆☆☆ | High |
| **9** | Waterproofing Layers | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | Medium |
| **10** | Wall-to-Structure Connections | ★★★★☆ | ★★★★☆ | ★★☆☆☆ | High |
| **11** | Performance Comparison Dashboard | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | Medium |
| **12** | International Comparison | ★★☆☆☆ | ★★☆☆☆ | ★★★★☆ | Low |

### Recommended Phasing

**Phase 1 — Visual Fidelity + Performance Data (Highest Impact):**
1. Drywall framing system (studs, tracks, board — the biggest visual gap)
2. CHB reinforcement visualization (rebar, grout, bond beams)
3. Fire resistance rating badge (data layer, no geometry change)
4. STC acoustic rating badge (data layer, no geometry change)

**Phase 2 — Assembly Understanding:**
5. Exploded layer view mode
6. Enhanced BOM with material quantities
7. Progressive build animation mode

**Phase 3 — Advanced Features:**
8. MEP integration layer
9. Waterproofing and moisture barriers
10. Wall-to-structure connection details
11. Performance comparison dashboard
12. International wall type comparison

---

## Appendix: Complete Source URLs

### Drywall Framing
1. https://www.clarkdietrich.com/products/structural-studs
2. https://usframefactory.com/drywall-metal-studs-nonstructural-metal-framing/
3. https://usframefactory.com/metal-stud-nomenclature-for-framing/
4. https://www.dimensions.com/element/steel-wall-framing-c-studs
5. https://cunmac.com/2022/11/metal-stud-and-track-framing/
6. https://www.usgme.com/default/drywall-studs-c-shape.html

### CHB Construction (Philippines)
7. https://www.alliedconcreteph.com/insights/why-concrete-hollow-blocks-for-construction
8. https://www.cebucity.gov.ph/wp-content/uploads/2020/12/101.pdf
9. https://www.scribd.com/document/867465638/CHB
10. https://www.scribd.com/document/443219827/CHB
11. https://mackunhardware.com/blogs/mh-articles/diy-guide-how-to-build-a-hollow-block-wall-in-the-philippines
12. https://region8.bfp.gov.ph/wp-content/uploads/2021/05/S5.pdf

### Fire Resistance
13. https://leebp.com/wp-content/uploads/NCMA-Tek-7-1B-Fire-Resistance-Ratings-of-Concrete-Masonry-Assemblies.pdf
14. https://www.cmha.org/resource/tek-07-01d/
15. https://www.americangypsum.com/resource-center/literature/fire-safety-information
16. https://www.usg.com/content/usgcom/en_CA_east/products/performance-applications/fire-performance.html
17. https://flameoffcoatings.com/finish-rating-on-drywall

### Acoustic Performance (STC)
18. https://en.wikipedia.org/wiki/Sound_transmission_class
19. https://www.nationalgypsum.com/ngconnects/blog/acoustics/understanding-acoustical-wall-designs-variables-affect-stc-ratings
20. https://www.masonryandhardscapes.org/resource/tek-13-01d/
21. https://commercial-acoustics.com/resources/stc-calculator/
22. https://www.acousticalsurfaces.com/blog/acoustics-education/sound-transmission-class-stc-rating/
23. https://soundproofist.com/2018/03/29/all-walls-are-not-alike/
24. https://www.soundproofingcompany.com/soundproofing_101/understanding-stc-and-stc-ratings
25. https://www.secondskinaudio.com/wall-assemblies-stc/

---

*Document prepared by SlateCamp AI Research Pipeline — April 9, 2026*
*All code references and material specifications should be verified against current NSCP 2015 (7th Edition), PNS ASTM C90:2019, and RA 9514 IRR before production deployment.*
