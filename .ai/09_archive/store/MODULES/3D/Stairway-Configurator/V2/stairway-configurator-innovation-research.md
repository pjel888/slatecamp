# SlateCamp Stairway Configurator — Innovation Research Document

**Module:** `stairway-configurator.ts`
**Date:** April 9, 2026
**Prepared for:** Philip, Founder — SlateCamp
**Purpose:** Research-backed innovation roadmap to elevate the Stairway Configurator from a multi-law compliance checker into the most comprehensive interactive stair learning tool in Southeast Asian EdTech.

---

## Current State Assessment

The Stairway Configurator already implements a multi-law parallel compliance architecture that is genuinely novel in the EdTech space. The current feature set includes:

- **Parametric 3D geometry** — treads, risers, handrails, landings, headroom plane, and width deficit indicators, all driven by slider parameters.
- **Four Philippine laws evaluated in parallel** — PD 1096 (NBCP), BP 220 (Housing), BP 344 (Accessibility), and RA 9514 (Fire Code), each with independent rule evaluation.
- **Severity-ordered violation coloring** — RA 9514 Evacuation Red > BP 344 Access Blue > PD 1096 Code Slate > BP 220 Housing Amber > Pass Green.
- **Ghost geometry overlays** — BP 344 dual-height handrails (700 mm and 900 mm) with 300 mm extensions, visible only when the accessible route toggle is active.
- **Cross-law conflict warnings** — flagging when a stair passes one law but violates another on the same dimension (e.g., BP 220 riser passes at 240 mm but exceeds PD 1096's 200 mm max).
- **Width deficit indicator planes** — translucent gap-fill planes showing how much wider the stair must be.
- **Scenario presets** — Standard House, BP 220 Housing, Public Hall, Exit Stair.
- **Four supported learning phases** — guided, faded, sandbox, and challenge modes.

**The gap:** The configurator answers "Is this stair legal?" but does not yet fully answer "Is this stair *safe*, *comfortable*, *accessible*, and *buildable* — and do I understand *why* each code exists?" The innovations below push toward that deeper understanding, which is what separates ALE topnotchers from passing candidates.

---

## Innovation 1: Blondel Comfort Formula — Real-Time Ergonomic Gauge

### The Concept

The Blondel formula (2R + T) is one of the most important stair design concepts globally, and it appears directly on the ALE. It was developed by François Blondel, director of the Royal Academy of Architecture in Paris, around 1672. Blondel established that a comfortable stairway requires two risers plus one tread to equal an average human stride length. The comfort range is **600–650 mm** (approximately 24–26 inches), with an ideal value of **630 mm**.

The formula works because of biomechanics: when R = 0 (flat ground), the stride is approximately 630 mm. When the going (tread) = 0 (a ladder), the rung spacing is approximately 315 mm — exactly half the stride. The linear relationship between the two creates the 2R + T constant.

### What This Means for the Module

The current configurator validates code compliance (legal minimums and maximums) but does not evaluate *ergonomic quality*. A stair can be fully compliant with PD 1096 and still feel terrible to walk on. Adding a Blondel comfort gauge teaches students that:

- Code compliance is a **floor**, not a **ceiling** for design quality.
- The relationship between riser and tread is not independent — changing one should change the other.
- A 2R + T value below 600 mm creates a cramped, shuffling gait (short steps).
- A 2R + T value above 650 mm creates an exhausting, high-stepping motion (overstriding).
- The pitch angle of the stair is a direct consequence of the R/T relationship.

### Proposed Implementation

1. **Comfort arc/gauge** — A visual indicator in the 3D viewport (or sidebar) showing the current 2R + T value on a color-gradient scale: red zones at both extremes, green zone at 600–650 mm, with the ideal 630 mm marked.
2. **Stair pitch angle visualization** — A translucent slope plane along the stringer with the angle displayed (e.g., "32°"). Comfortable residential stairs typically fall between 25°–35°. Steeper than 42° enters "steep stair" territory; shallower than 20° is a ramp.
3. **Stride ghost** — An optional overlay showing simplified footfall positions on the treads to visualize where a human foot would land at the current geometry. When the 2R + T value is outside the comfort range, the stride ghost visually shows the foot overshooting or undershooting the tread.
4. **Secondary comfort formula check** — R + T = 430–450 mm (a simpler secondary validation used in European practice).

### ALE Relevance

The 2R + T formula appears in ALE Building Technology questions, typically phrased as: "Given a riser height of 175 mm, what is the ideal tread depth?" or "Calculate 2R + T for the following stairway. Is it within the comfort range?" This is already referenced in the `slatecamp-3d-information-designer` skill as a dynamic quiz question template.

### Sources

- Blondel, François. *Cours d'Architecture* (1675–1683). The original treatise establishing the stride-to-step relationship. Blondel recognized that the horizontal stride on flat ground (~24 inches / 610 mm) must be reduced by twice the vertical rise to maintain comfortable locomotion.
- "Understanding the geometry of a comfortable staircase" — Practical Architecture. Explains the derivation of the Blondel equation and its graphical interpretation as a linear constraint on the rise/going design space. URL: https://www.practicalarchitecture.com/blog/the-geometry-of-a-comfortable-staircase
- "What Is the Stair Formula? Explaining 2R + T" — Engineer Fix. Covers the comfort zone (25–27 inches), the relationship to human stride biomechanics, and worked examples. URL: https://engineerfix.com/what-is-the-stair-formula-explaining-2r-t/
- "How to Calculate Staircase Dimensions and Designs" — ArchDaily. References Neufert's *Architects' Data* alongside the Blondel formula for international practice. URL: https://www.archdaily.com/892647/how-to-make-calculations-for-staircase-designs
- Springer: "Ergonomic Aspects of the Architectural Designing of the Stairs in the Spaces for the Great Public Gathering." Covers the biomechanical basis of Blondel's work and its application to crowd movement on stairs. URL: https://link.springer.com/chapter/10.1007/978-3-319-20687-5_45
- Blondel comfort range per international practice: 2R + G ≈ 590–650 mm (EasyStair lexicon). URL: https://easystair.net/en/lexicon
- Home Project Calculator — Blondel's rule as 2R + G ≈ 600–640 mm. URL: https://homeprojectcalculator.com/staircase-calculator/

---

## Innovation 2: International Code Comparison Mode — "The World View"

### The Concept

Philippine building codes did not emerge in a vacuum — PD 1096 draws from the Uniform Building Code (UBC), and BP 344 aligns with international accessibility frameworks. Teaching students *how* Philippine codes compare to the IBC, ADA, and other international standards deepens their understanding of *why* the Philippine values exist and where they sit on the global spectrum.

### Key International Stair Standards — Comparative Data

| Dimension | PD 1096 (PH) | BP 220 (PH Housing) | IBC 2024 (USA) | ADA/ANSI A117.1 (USA) | IRC (US Residential) |
|---|---|---|---|---|---|
| **Max riser height** | 200 mm | 250 mm | 178 mm (7") | 180 mm (7") | 196 mm (7¾") |
| **Min tread depth** | 200 mm | 200 mm | 279 mm (11") | 280 mm (11") | 254 mm (10") |
| **Min headroom** | 2,000 mm | 2,000 mm | 2,032 mm (80") | — | 2,032 mm (80") |
| **Handrail height** | 800–900 mm | — | 864–965 mm (34–38") | 864–965 mm (34–38") | 864–965 mm (34–38") |
| **Min width (residential)** | 750 mm | 600 mm | 914 mm (36") | — | 914 mm (36") |
| **Min width (commercial, <50 occ)** | 900 mm | — | 914 mm (36") | — | — |
| **Min width (commercial, >50 occ)** | 1,100 mm | — | 1,118 mm (44") | — | — |
| **Min accessible stair width** | 1,200 mm (BP 344) | — | — | 1,220 mm (48") | — |
| **Max vertical rise between landings** | 3,600 mm | — | 3,658 mm (12') | — | 3,658 mm (12') |
| **RA 9514 exit max riser** | 180 mm | — | 178 mm (IBC egress) | — | — |
| **Handrail extension (top)** | — | — | 305 mm (12") horiz. | 305 mm (12") horiz. | — |
| **Handrail extension (bottom)** | — | — | 1 tread depth + slope | 1 tread depth + 305 mm horiz. | — |
| **Dimensional uniformity tolerance** | — | — | 9.5 mm (⅜") max variance | — | 9.5 mm (⅜") |
| **Nosing max projection** | — | — | — | 38 mm (1½") | 32 mm (1¼") |
| **Nosing radius of curvature** | — | — | — | 13 mm (½") max | — |
| **Guard spacing (child safety)** | — | — | 102 mm (4") max | — | 102 mm (4") max |
| **Children's handrail** | — | — | — | 711 mm (28") max recommended | — |

### Key Observations for Teaching

1. **PD 1096 is more permissive on risers and treads than IBC.** PD 1096 allows 200 mm risers and 200 mm treads; IBC limits risers to 178 mm and requires 279 mm treads. This reflects PD 1096's accommodation of Philippine spatial constraints (smaller lots, narrower buildings) while IBC assumes American building footprints.
2. **RA 9514 exit stair requirements (180 mm max riser) are nearly identical to IBC egress requirements (178 mm).** This is not a coincidence — the Fire Code's IRR aligns with international life-safety standards.
3. **BP 344 is actually *more demanding* on handrail height variation than ADA.** BP 344 requires dual-height handrails (700 mm + 900 mm) for accessible routes; ADA requires only a single handrail at 864–965 mm, with the children's dual-height being a *recommendation*, not a requirement.
4. **IBC has explicit dimensional uniformity requirements** (max 9.5 mm / ⅜" variance between any two risers or treads in a flight) that are implied but less explicitly codified in PD 1096. This is a major practical concern in Philippine construction.
5. **Nosing profile requirements are highly specified in ADA/IBC** (max projection 38 mm, max radius 13 mm, riser slope max 30° from vertical) but largely unspecified in PD 1096/BP 344. This is an area where Philippine practice follows international convention without a specific local code section.

### Proposed Implementation

- **"Compare Mode" toggle** in the parameter panel with checkboxes for IBC, ADA, and IRC.
- When active, **ghost geometry overlays** appear showing what the stair would need to look like under the selected international code — e.g., deeper treads at 279 mm (IBC) shown as translucent extensions beyond the current PD 1096 tread.
- A **comparison scorecard** in the sidebar showing the current stair's compliance status across all selected codes simultaneously.
- **Annotation callouts** explaining the key differences (e.g., "IBC requires 279 mm min tread vs. PD 1096's 200 mm — this reflects different assumptions about average building footprint size").

### Sources

- IBC 2024, Section 1011.5.2 — Riser height (178 mm max, 102 mm min) and tread depth (279 mm min). URL: https://codes.iccsafe.org/s/IBC2024P1/chapter-10-means-of-egress/IBC2024P1-Ch10-Sec1011.5.2
- "IBC Stairs Code & Requirements" — Upside Innovations. Comprehensive summary of IBC stair dimensions, headroom, landings, and guards. URL: https://upsideinnovations.com/blog/ibc-stairs-code/
- "IBC Commercial Stair Codes EXPLAINED" — Building Code Trainer. Width calculations (0.3" per occupant non-sprinklered, 0.2" per occupant sprinklered, min 44" or 36" for <50 occupants). URL: https://buildingcodetrainer.com/commercial-stair-codes-explained/
- "Safety Codes: What's the Difference Between IBC and OSHA Stairs?" — ErectaStep. IBC vs OSHA comparison including space requirements. URL: https://www.erectastep.com/blog/safety-codes-whats-the-difference-between-ibc-and-osha-stairs/
- "Maximum Stair Riser Height & Minimum Stair Tread Depth Code" — Lapeyre Stair. References Templer's 1976 research on misstep rates below 279 mm tread depth. URL: https://www.lapeyrestair.com/blog/stair-riser-height-tread-depth/
- U.S. Access Board — Chapter 5: Stairways. ADA stairway guide covering handrail extensions, nosing profiles, children's handrails, and visual contrast. URL: https://www.access-board.gov/ada/guides/chapter-5-stairways/
- "ADA Requirements for Stairs: Standards and Compliance" — Accessibility Checker. Comprehensive ADA stair checklist. URL: https://www.accessibilitychecker.org/blog/ada-requirements-for-stairs-standards-and-compliance/

---

## Innovation 3: Nosing Profile Cross-Section View

### The Concept

The tread nosing is one of the most code-regulated and least-understood stair elements. It is the leading edge of the tread — the part that projects beyond the riser face — and it has specific geometric requirements for safety and accessibility. Current configurator geometry uses flat box primitives for treads, which does not capture nosing detail.

### Code Requirements for Nosing Profiles

**ADA Section 504.5 (Nosings):**
- Maximum radius of curvature at the leading edge: **13 mm (½")**
- Maximum nosing projection beyond the riser: **38 mm (1½")**
- Risers may slope under the tread at a maximum of **30° from vertical**
- Risers cannot be open (openings must not allow a sphere > 13 mm / ½" to pass through)

**IBC Section 1011.5.5 (Nosing and Riser Profile):**
- Nosings shall not project more than **32 mm (1¼")** beyond the tread below (slightly stricter than ADA)
- The riser may slope under the nosing at max **30° from vertical**
- Leading edge of nosing must have a radius no greater than **13 mm (½")**

**IBC Section 504.6 (Visual Contrast on Stair Nosings, 2024):**
- A visual contrast marking must be applied to the **leading 25–51 mm (1–2")** of the tread or landing, measured horizontally from the nosing
- The contrast strip must visually contrast with the remainder of the tread

**California Title 24 / CBC 11B-504.4.1 (Contrasting Stripe):**
- Interior stairs: upper approach and lower tread must have a contrasting stripe
- Exterior stairs: upper approach and **all treads** must have a contrasting stripe
- Stripe width: **51–102 mm (2–4")**, placed within 25 mm (1") of the nosing
- The stripe must be at least as slip-resistant as the rest of the tread
- Grooves do not satisfy this requirement — color contrast is required

**Philippine Practice:**
- PD 1096 and BP 344 do not specify nosing profile dimensions with the same granularity as ADA/IBC.
- In practice, Philippine architects follow adapted IBC/ADA nosing profiles as industry convention.
- The ALE tests awareness of nosing requirements primarily through materials and methods questions ("Which nosing detail is correct?").

### Proposed Implementation

1. **Cross-section view mode** — When the student clicks on a single tread (or activates a "Detail View" button), the camera transitions to a side-section view showing a single riser-tread junction at enlarged scale.
2. **Parametric nosing profile** — New parameters for nosing projection (0–40 mm), leading edge radius (0–20 mm), riser undercut angle (0–45°), and contrast strip presence/width.
3. **Violation coloring on nosing geometry** — Nosing projection > 38 mm turns red; radius > 13 mm turns red; riser angle > 30° turns red.
4. **Contrast strip rendering** — A colored band on the leading edge of each tread, toggled by an "Accessibility Features" checkbox, with correct width per code.

### Sources

- ADA Section 504.5 Nosings — ada-compliance.com. URL: http://www.ada-compliance.com/ada-compliance/504-stairways
- "Contrasting Stair Nosing: IBC 504.6 Compliance Guide" — Upside Innovations. URL: https://upsideinnovations.com/blog/contrasting-stair-nosing/
- California Building Code 11B-504.4.1 — Contrasting stripe requirements (UpCodes). URL: https://up.codes/s/contrasting-stripe
- "ADA & OSHA Guidelines for Commercial Stairways" — Nystrom. Covers tactile warning strips, photoluminescent treads, and contrast requirements. URL: https://blog.nystrom.com/rise-above-the-risks-ada-osha-guidelines-commercial-stairways
- The Building Code Forum — Discussion on ANSI A117.1 Section 504.5 applicability and contrasting stripe requirements. URL: https://www.thebuildingcodeforum.com/forum/threads/accessible-stairs-contrasting-markings-on-the-stair-nosings.8088/

---

## Innovation 4: Dimensional Uniformity Simulation — "Construction Tolerance Mode"

### The Concept

Both IBC and ADA mandate that the difference between the largest and smallest riser height (or tread depth) in any flight **cannot exceed 9.5 mm (⅜")**. PD 1096 has an implied uniformity requirement, but it is less numerically explicit. In real Philippine construction, formwork inconsistencies create non-uniform risers — and this is one of the most common causes of stair falls.

The Templer research (1976) demonstrated that missteps increase dramatically when stair geometry is inconsistent, even when average dimensions are within code limits. The human body calibrates its gait to the first 2–3 steps and then operates on autopilot — a single step that deviates disrupts this rhythm and causes a stumble.

### Proposed Implementation

1. **"Construction Tolerance" toggle** in the parameter panel.
2. **Tolerance range slider** — 0 mm (perfect) to 20 mm (sloppy formwork). Default: 5 mm.
3. **Per-step random variation** — When tolerance mode is active, each riser and tread receives a random perturbation within the tolerance range (seeded for reproducibility).
4. **Individual violation highlighting** — Steps that deviate beyond the 9.5 mm threshold from the smallest/largest in the flight are individually highlighted in violation color, while others remain neutral.
5. **"Worst pair" callout** — An annotation showing the two most discrepant steps and the actual difference between them.
6. **ALE teaching point** — Students learn that a stair with an average riser of 185 mm can still be non-compliant if individual risers vary from 178 mm to 195 mm (difference: 17 mm > 9.5 mm tolerance).

### Sources

- IBC 2024, Section 1011.5.4 — Dimensional uniformity: "The tolerance between the largest and smallest riser height or between the largest and smallest tread depth shall not exceed ⅜ inch (9.5 mm) in any flight of stairs." Referenced in multiple sources including:
  - Upside Innovations IBC Stairs Code. URL: https://upsideinnovations.com/blog/ibc-stairs-code/
  - Dock Step IBC Code. URL: https://dockstep.com/blog/ibc-stairs-code-requirements/
- Templer, John A. (1976). Study on misstep rates and stair geometry, referenced in Lapeyre Stair's analysis. URL: https://www.lapeyrestair.com/blog/stair-riser-height-tread-depth/
- Standard Stair Sizes and Dimensions Guide — Acadia Stairs. URL: https://www.acadiastairs.com/feeds/blog/stair-size

---

## Innovation 5: Evacuation Flow Simulation — Making RA 9514 Visceral

### The Concept

The current RA 9514 layer checks static dimensions: max riser 180 mm, min width 900 mm, max vertical rise 3,000 mm. But the *purpose* of exit stair requirements is crowd flow during evacuation. Stair geometry directly determines evacuation capacity — wider treads allow faster descent, steeper stairs slow crowds, and landing frequency determines where bottlenecks form.

The IBC calculates required stair width based on occupant load: **0.3 inches per occupant** for non-sprinklered buildings and **0.2 inches per occupant** for sprinklered buildings, with a minimum of 44 inches (1,118 mm) or 36 inches (914 mm) for loads under 50. This capacity-based approach is more nuanced than PD 1096's flat minimums.

### Proposed Implementation

1. **"Evacuation Sim" button** that, when pressed, launches a simplified 2D flow visualization overlaid on the stair.
2. **Abstract "person dots"** flow down the stair at a rate determined by the current geometry. The flow rate formula would approximate pedestrian flow research (e.g., Fruin's Level of Service model for stairs).
3. **Interactive cause-and-effect:**
   - Narrow the width → dots slow down and density increases (visualized as closer spacing / color shift to yellow/red).
   - Increase the riser → dots move more cautiously (slower speed).
   - Add too many risers without a landing → dots halt at the 3,000 mm violation point with a "LANDING REQUIRED" callout and a queuing backlog above.
4. **Occupant load input** — A new parameter for "People evacuating" (e.g., 50, 100, 200) that determines how many dots flow through, making the capacity constraint visible.
5. **Historical context annotation** — "The Cocoanut Grove fire (Boston, 1942) killed nearly 500 people, partly due to non-compliant exits and stairways. Today's exit stair width minimums stem from this disaster."

### Sources

- "IBC Commercial Stair Codes EXPLAINED" — Building Code Trainer. Width calculation methodology: 0.3"/occupant (non-sprinklered) and 0.2"/occupant (sprinklered). URL: https://buildingcodetrainer.com/commercial-stair-codes-explained/
- "What is the maximum stair riser height in U.S. building codes?" — MeltPlan. References the Cocoanut Grove fire as a catalyst for modern stair codes, and 1970s–80s slip-and-fall litigation driving dimensional uniformity requirements. URL: https://www.meltplan.com/blogs/what-is-the-maximum-stair-riser-height-and-required-handrail-height-in-u-s-building-codes
- IBC Section 1011.2 — Width determination based on occupant load and sprinkler status. Referenced across multiple sources.

---

## Innovation 6: Handrail Graspability Detail

### The Concept

The configurator currently shows handrails as simple cylinders with a fixed radius. But handrail cross-section profiles are remarkably specific in code requirements and are frequently tested on professional licensing exams. The graspability of a handrail is a safety-critical design decision that goes beyond simple height placement.

### Code Requirements for Handrail Cross-Sections

**ADA Section 505.7 (Cross Section):**
- **Circular handrails:** outside diameter of **32–51 mm (1¼"–2")**
- **Non-circular handrails:** must have rounded edges, a total cross-section perimeter of **100–159 mm (4"–6¼")**, and a maximum cross-section dimension of **57 mm (2¼")**
- Perimeter > 159 mm: must provide a graspable finger recess area

**ADA Section 505.5 (Clearance):**
- Minimum clearance between handrail and adjacent wall/surface: **38 mm (1½")**
- This clearance allows fingers to fully wrap around the gripping surface

**ADA Section 505.6 (Gripping Surface):**
- Continuous and unobstructed on top and sides along full length
- Bottom obstructions (support connections) must not exceed **20%** of the handrail length
- Handrails must not rotate within their fittings

**ADA Section 505.10 (Extensions):**
- Top: extend horizontally at least **305 mm (12")** beginning directly above the first riser nosing
- Bottom: continue at the slope of the stair flight for a horizontal distance at least equal to **one tread depth** beyond the last riser nosing

**IBC Section 1012.3 (Handrail Gripping Surfaces):**
- Type I (circular): outside diameter **32–51 mm (1¼"–2")**
- Type II: perimeter **102–159 mm (4"–6¼")**

**BP 344 IRR (Philippine Accessibility):**
- Dual-height rails at **700 mm** and **900 mm** above nosing
- Extensions: **300 mm** beyond first and last step
- Less prescriptive on cross-section profiles than ADA/IBC

### Proposed Implementation

1. **Cross-section popup** — Clicking on a handrail triggers a 2D cross-section view showing the profile shape, outside diameter, wall clearance, and code compliance status.
2. **Profile selector** — Choose between circular (with diameter slider), oval, and rectangular-with-rounded-edges profiles.
3. **Graspability indicator** — Visual feedback showing whether the profile allows a full "power grip" (wrapping fingers completely around) vs. a "hook grip" (resting on top without full wrap). Profiles outside the 32–51 mm range fail the power grip test.
4. **Wall clearance visualization** — When a wall is adjacent, show the 38 mm clearance zone.
5. **Extension length annotation** — Display the required top and bottom extensions with dimension callouts, comparing BP 344's 300 mm with ADA's 305 mm + tread depth.

### Sources

- ADA Section 505 Handrails — ada-compliance.com. URL: http://www.ada-compliance.com/ada-compliance/505-handrails
- "A Quick Overview of ADA Handrail Requirements" — Keylink. URL: https://keylinkonline.com/blog/a-quick-overview-of-ada-handrail-requirements
- "Understanding ADA Handrail Requirements" — Simplified Building. URL: https://www.simplifiedbuilding.com/railing/ada-handrail/installation
- "ADA Requirements for Handrails: Standards and Compliance" — Accessibility Checker. URL: https://www.accessibilitychecker.org/blog/ada-requirements-for-handrails-standards-and-compliance/
- "VIVA Railings — ADA Handrail Requirements." URL: https://vivarailings.com/blog/ada-handrail-requirements
- U.S. Access Board — Chapter 5: Stairways. Handrail extension details and children's handrail recommendations. URL: https://www.access-board.gov/ada/guides/chapter-5-stairways/
- "Handrail Extension Code Requirements" — Wagner Companies. URL: https://wagnercompanies.com/resources/blog/company/handrail-extension-code-requirements

---

## Innovation 7: Children's Handrail and Guard Spacing

### The Concept

Stair safety for children involves distinct requirements that go beyond standard adult accessibility. The ADA Access Board and IBC both address child safety through guard spacing maximums and recommended children's handrails. This creates an opportunity to teach students about universal design — the principle that good design serves all users, not just the "standard" adult.

### Key Requirements

**ADA Advisory (Recommended, not required):**
- In facilities primarily serving children, a **second handrail at 711 mm (28") maximum** above stair nosings is advisable.
- A **minimum vertical clearance of 229 mm (9")** between upper and lower handrails to prevent child entrapment.

**IBC Guard Requirements:**
- Guards required along all open-sided walking surfaces, minimum **1,067 mm (42")** high.
- Maximum spacing in guards: **102 mm (4")** — preventing a child's head from passing through (the "4-inch sphere rule").
- Solid risers required for IBC stairs to prevent foot entrapment (openings must not allow a **13 mm / ½" sphere** to pass through).

**Philippine Applicability:**
- BP 344 mandates the dual-height handrail (700 mm + 900 mm) which effectively covers the children's height consideration, though framed as an accessibility requirement rather than a child safety requirement.
- PD 1096 has guard requirements but with less explicit child-specific dimensioning.

### Proposed Implementation

1. **"Primary Users" parameter** — Add options: General, Children (schools, daycare), Elderly (healthcare, senior housing), Mixed.
2. **Children mode:** Activates ghost geometry for the 711 mm secondary handrail, shows the 102 mm guard spacing check, and highlights open risers as violations.
3. **Elderly mode:** Emphasizes lower riser heights (< 170 mm recommended), deeper treads, and contrast strip visibility.
4. **Entrapment check visualization** — A 102 mm sphere rendered at each guard opening to show pass/fail.

### Sources

- U.S. Access Board — Chapter 5: Stairways. Children's handrail recommendation (28" max, 9" clearance). URL: https://www.access-board.gov/ada/guides/chapter-5-stairways/
- IBC guard spacing requirements (4" sphere rule) referenced in multiple stair code summaries:
  - Upside Innovations: URL: https://upsideinnovations.com/blog/ibc-stairs-code/
  - Dock Step: URL: https://dockstep.com/blog/ibc-stairs-code-requirements/

---

## Innovation 8: Stair Types Beyond Straight-Run

### The Concept

The current configurator models a straight-run stair only. The ALE tests knowledge of L-shaped (quarter-turn), U-shaped (half-turn/switchback), spiral, and winder stairs. Each type has distinct code implications:

- **L-shaped:** Introduces landing dimension requirements. Per IBC, landing depth must be at least equal to stair width or 1,219 mm (48"), whichever is less.
- **U-shaped (switchback):** Introduces handrail continuity requirements — per ADA, inside handrails on switchback stairs must be continuous between flights. Also introduces the "door on landing" constraint: a door opening onto a landing cannot reduce the usable depth below 50% of the required width.
- **Winder stairs:** Treads must have a minimum depth of 254 mm (10") at the walk line intersection, with a minimum of 152 mm (6") at the narrowest point (IBC). Winder stairs are generally not permitted on accessible routes.
- **Spiral stairs:** Minimum clear tread depth of 171 mm (6¾") at 305 mm (12") from the narrow edge (IBC). Maximum riser height of 241 mm (9½"). Not permitted as a required means of egress in most occupancies.

### Proposed Implementation (Phased)

**Phase 1 (Near-term):** Add L-shaped stair option. This requires a landing platform at the turn point with the correct dimension rules, and the handrail must navigate the corner.

**Phase 2 (Mid-term):** Add U-shaped (switchback) option. This introduces the interior continuous handrail, the second flight descending parallel to the first, and the intermediate landing.

**Phase 3 (Long-term):** Add winder and spiral as separate sub-modules, each with their own unique code constraints and parametric controls.

### Sources

- IBC Section 1011.6 — Stairway landings (depth ≥ width or 48", whichever is less). Referenced in Building Code Trainer. URL: https://buildingcodetrainer.com/commercial-stair-codes-explained/
- IBC winder tread requirements: "Winder treads shall have a minimum tread depth of 11 inches (279 mm) between the vertical planes of the foremost projection of adjacent treads at the intersections with the walkline and a minimum tread depth of 10 inches (254 mm) within the clear width of the stair." — UpCodes. URL: https://up.codes/s/stair-treads-and-risers
- ADA Section 505.3 — Handrail continuity at switchback and dogleg stairs. URL: http://www.ada-compliance.com/ada-compliance/505-handrails
- IBC Section 1011.10 — Spiral stairways (6¾" min tread at 12" from narrow edge, 9½" max riser, 26" min clear width). Referenced in Lapeyre Stair. URL: https://www.lapeyrestair.com/blog/stair-riser-height-tread-depth/

---

## Innovation 9: The "Why" Layer — Historical and Research Context

### The Concept

Building codes are not arbitrary — every number traces back to a disaster, a research study, or a biomechanical principle. Teaching students *why* each code value exists transforms rote memorization into deep understanding. This is the layer that turns a compliance tool into a *learning* tool.

### Key Historical and Research Anchors

| Code Value | Origin |
|---|---|
| **2R + T comfort formula** | François Blondel, 1672 — discovered the stride-to-step relationship by studying the average human stride on flat ground (~610 mm) and ladder rung spacing (~305 mm). |
| **279 mm (11") min tread depth (IBC)** | John Templer research, 1976 — demonstrated that misstep rates increase sharply below approximately 279 mm tread depth. This study directly informed the IBC's adoption of the 11" minimum. |
| **Exit stair width minimums** | Cocoanut Grove fire, Boston, 1942 — 492 deaths, partly due to non-compliant exits, locked doors, and inadequate stairway width. Led to fundamental reforms in exit stair requirements. |
| **Dimensional uniformity (⅜" tolerance)** | 1970s–80s slip-and-fall litigation — inconsistent riser heights in constructed stairs were identified as a major fall cause, driving IBC reforms to mandate dimensional uniformity. |
| **Handrail height 864–965 mm (34–38")** | Ergonomic studies on wrist/elbow height — the range accommodates the 5th to 95th percentile adult wrist height, allowing a natural "resting grip" on the handrail without hunching or reaching. |
| **102 mm (4") guard spacing** | Child head entrapment prevention — the 4" maximum is based on the size of a young child's head, preventing entrapment between guard elements that could lead to strangulation. |
| **ADA handrail extensions** | Transition safety research — the 12" horizontal extension at the top and tread-depth extension at the bottom allow users (especially those with mobility impairments) to stabilize before transitioning between the stair slope and the level landing surface. |

### Proposed Implementation

1. **"History" toggle** — A layer that overlays brief contextual annotations on the 3D model.
2. **Annotation placement:**
   - At the riser: "Blondel, 1672 — the stride relationship"
   - At the tread depth: "Templer, 1976 — misstep threshold"
   - At the exit width: "Post-Cocoanut Grove, 1942 — crowd crush prevention"
   - At the handrail: "Ergonomic — 5th–95th percentile wrist height"
   - At the guard: "Child safety — the 4-inch sphere rule"
3. **Tap-to-expand** — Each annotation expands to a 2–3 sentence explanation and a source citation.
4. **ALE teaching point** — History questions occasionally appear on the ALE in the "Theory of Architecture" and "Professional Practice" areas. Understanding the *rationale* behind codes, not just the numbers, is a topnotcher differentiator.

### Sources

- MeltPlan — References Cocoanut Grove fire, 1970s–80s litigation, and ADA adoption as catalysts for stair code reforms. URL: https://www.meltplan.com/blogs/what-is-the-maximum-stair-riser-height-and-required-handrail-height-in-u-s-building-codes
- Practical Architecture — Blondel's derivation and the graphical interpretation of the comfort equation. URL: https://www.practicalarchitecture.com/blog/the-geometry-of-a-comfortable-staircase
- Lapeyre Stair — Templer's 1976 research on misstep rates. URL: https://www.lapeyrestair.com/blog/stair-riser-height-tread-depth/
- Springer — Ergonomic aspects of stairs in public gathering spaces, Blondel's biomechanical basis. URL: https://link.springer.com/chapter/10.1007/978-3-319-20687-5_45

---

## Innovation 10: Material and Slip Resistance Layer

### The Concept

Different tread materials have different slip resistance ratings (coefficient of friction). OSHA and IBC reference slip resistance as a stair safety requirement. ADA Section 504.4 requires stair treads to comply with floor surface requirements (§302), which include slip resistance. Philippine practice commonly uses granite, polished marble, concrete, ceramic tile, or wood — each with dramatically different wet/dry slip coefficients.

### Proposed Implementation

1. **"Material" selector** — Choose between: Polished Marble, Honed Granite, Ceramic Tile (matte), Concrete (textured), Wood (sealed), Steel (diamond plate).
2. **Visual texture change** — The tread material appearance changes in the 3D model (color, roughness, reflectivity via PBR material properties).
3. **Slip resistance indicator** — A badge or icon on each material option showing "Dry: Safe / Wet: Caution" or "Dry: Safe / Wet: Danger" based on typical coefficient of friction values.
4. **Contrast strip requirement interaction** — When a low-contrast material is selected (e.g., light gray granite on light gray concrete risers), the contrast strip violation fires, teaching that material choice and code compliance are interdependent.
5. **ALE teaching point** — Material selection questions appear in the "Building Technology" and "Construction Materials" areas of the ALE.

### Sources

- ADA Section 504.4 — Tread Surface (references §302 floor surface requirements including slip resistance). URL: http://www.ada-compliance.com/ada-compliance/504-stairways
- Nystrom — EcoTread, Vision Impairment Lines, and Safe-T-Lume photoluminescent treads as practical material solutions. URL: https://blog.nystrom.com/rise-above-the-risks-ada-osha-guidelines-commercial-stairways

---

## Prioritization Matrix

Ranked by ALE impact × implementation feasibility × learning value:

| Priority | Innovation | ALE Impact | Feasibility | Learning Value | Estimated Effort |
|---|---|---|---|---|---|
| **1** | Blondel Comfort Formula Gauge | ★★★★★ | ★★★★★ | ★★★★★ | Low — pure computation + UI overlay |
| **2** | Nosing Profile Cross-Section View | ★★★★☆ | ★★★★☆ | ★★★★★ | Medium — new camera mode + detail geometry |
| **3** | International Code Comparison Mode | ★★★★☆ | ★★★★☆ | ★★★★★ | Medium — ghost geometry + comparison data |
| **4** | Dimensional Uniformity Simulation | ★★★☆☆ | ★★★★★ | ★★★★☆ | Low — per-step random perturbation |
| **5** | Evacuation Flow Visualization | ★★★★☆ | ★★★☆☆ | ★★★★★ | High — particle system + flow model |
| **6** | Historical "Why" Layer | ★★★☆☆ | ★★★★★ | ★★★★★ | Low — annotation content only |
| **7** | Handrail Graspability Detail | ★★★☆☆ | ★★★★☆ | ★★★★☆ | Medium — cross-section popup + profile geometry |
| **8** | Children's Handrail & Guards | ★★☆☆☆ | ★★★★☆ | ★★★★☆ | Medium — new parameter + ghost geometry |
| **9** | Material & Slip Resistance Layer | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ | Medium — PBR materials + data table |
| **10** | Stair Types (L-shape, U-shape) | ★★★★★ | ★★☆☆☆ | ★★★★★ | High — major geometry rework |

### Recommended Phasing

**Phase 1 — Quick Wins (1–2 weeks each):**
1. Blondel Comfort Formula Gauge
2. Historical "Why" Layer (annotation-only, no geometry)
3. Dimensional Uniformity Simulation

**Phase 2 — Depth Features (2–4 weeks each):**
4. Nosing Profile Cross-Section View
5. International Code Comparison Mode
6. Handrail Graspability Detail

**Phase 3 — Flagship Features (4–8 weeks each):**
7. Evacuation Flow Visualization
8. Children's Handrail & Guards
9. Material & Slip Resistance Layer
10. Stair Types (L-shape, U-shape)

---

## Appendix A: Complete International Stair Code Reference Table

| Code | Max Riser | Min Tread | Headroom | Handrail Height | Min Width (Residential) | Min Width (Commercial) | Max Vertical Rise | Landing Depth | Uniformity Tolerance |
|---|---|---|---|---|---|---|---|---|---|
| PD 1096 (PH) | 200 mm | 200 mm | 2,000 mm | 800–900 mm | 750 mm | 900 mm (1,100 mm >50 occ) | 3,600 mm | ≥ width | — |
| BP 220 (PH Housing) | 250 mm | 200 mm | 2,000 mm | — | 600 mm | — | — | — | — |
| RA 9514 (PH Fire) | 180 mm | 200 mm | — | — | 900 mm | 900 mm | 3,000 mm | — | — |
| BP 344 (PH Access) | — | — | — | 700 + 900 mm | 1,200 mm | 1,200 mm | — | — | — |
| IBC 2024 (USA) | 178 mm | 279 mm | 2,032 mm | 864–965 mm | 914 mm | 914 mm (1,118 mm >50 occ) | 3,658 mm | ≥ width or 1,219 mm | 9.5 mm |
| IRC (US Residential) | 196 mm | 254 mm | 2,032 mm | 864–965 mm | 914 mm | — | 3,658 mm | — | 9.5 mm |
| ADA/A117.1 (USA) | 180 mm | 280 mm | — | 864–965 mm | 1,220 mm (accessible) | 1,220 mm (accessible) | — | — | — |
| Blondel Comfort Zone | — | — | — | — | — | — | — | — | — |
| *(2R + T)* | *600–650 mm ideal range; pitch angle 25°–35° for comfortable residential stairs* | | | | | | | | |

---

## Appendix B: Source URLs — Complete List

### International Building Code (IBC)
1. https://upsideinnovations.com/blog/ibc-stairs-code/
2. https://up.codes/s/stair-treads-and-risers
3. https://codes.iccsafe.org/s/IBC2024P1/chapter-10-means-of-egress/IBC2024P1-Ch10-Sec1011.5.2
4. https://www.amezz.com/ibc-stairs-code.htm
5. https://www.erectastep.com/blog/safety-codes-whats-the-difference-between-ibc-and-osha-stairs/
6. https://dockstep.com/blog/ibc-stairs-code-requirements/
7. https://stairzone.com/article/required-minimum-width-for-industrial-stairs-everything-you-need-to-know/
8. https://buildingcodetrainer.com/commercial-stair-codes-explained/
9. https://www.meltplan.com/blogs/what-is-the-maximum-stair-riser-height-and-required-handrail-height-in-u-s-building-codes
10. https://www.lapeyrestair.com/blog/stair-riser-height-tread-depth/

### ADA / Accessibility
11. https://www.access-board.gov/ada/guides/chapter-5-stairways/
12. http://www.ada-compliance.com/ada-compliance/ada-stairs.html
13. https://keylinkonline.com/blog/a-quick-overview-of-ada-handrail-requirements
14. https://www.simplifiedbuilding.com/railing/ada-handrail/installation
15. https://vivarailings.com/blog/ada-handrail-requirements
16. https://amstep.com/ada-stair-compliance/
17. https://www.accessibilitychecker.org/blog/ada-requirements-for-stairs-standards-and-compliance/
18. https://www.accessibilitychecker.org/blog/ada-requirements-for-handrails-standards-and-compliance/
19. http://www.ada-compliance.com/ada-compliance/505-handrails
20. http://www.ada-compliance.com/ada-compliance/504-stairways
21. https://wagnercompanies.com/resources/blog/company/handrail-extension-code-requirements

### Nosing / Contrast Requirements
22. https://upsideinnovations.com/blog/contrasting-stair-nosing/
23. https://www.thebuildingcodeforum.com/forum/threads/accessible-stairs-contrasting-markings-on-the-stair-nosings.8088/
24. https://up.codes/s/contrasting-stripe
25. https://amstep.com/california-title-24/
26. https://blog.nystrom.com/rise-above-the-risks-ada-osha-guidelines-commercial-stairways

### Blondel Formula / Ergonomics
27. https://www.practicalarchitecture.com/blog/the-geometry-of-a-comfortable-staircase
28. https://engineerfix.com/what-is-the-stair-formula-explaining-2r-t/
29. https://www.archdaily.com/892647/how-to-make-calculations-for-staircase-designs
30. https://link.springer.com/chapter/10.1007/978-3-319-20687-5_45
31. https://easystair.net/en/lexicon
32. https://homeprojectcalculator.com/staircase-calculator/
33. https://hopific.com/how-to-calculate-stairs-in-architecture/
34. https://www.acadiastairs.com/feeds/blog/stair-size
35. https://fsm.how/building-maintenance/how-to-layout-staircase-calculations/

---

*Document prepared by SlateCamp AI Research Pipeline — April 9, 2026*
*All code references should be verified against current IRR texts before production deployment.*
