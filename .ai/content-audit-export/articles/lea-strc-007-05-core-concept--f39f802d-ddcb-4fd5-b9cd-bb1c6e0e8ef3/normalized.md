## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define embedded conduits and identify common types (electrical, plumbing, HVAC)
- Explain the NSCP limitations on conduit placement within structural members
- State the maximum conduit size relative to member thickness
- Describe proper coordination between structural and MEP trades

Embedded conduits (for electrical, mechanical, or plumbing services) weaken concrete sections by reducing cross-sectional area and creating stress concentrations. The LEA tests your mastery of size and spacing limits to protect structural integrity. Critical limits: max 1/3 of slab/beam thickness, max 4% of column cross-section, min 3 diameters spacing between conduits, and supplemental reinforcement requirements.

## Core Concept
<ArticleMedia id="media-lea-strc-007-05-core-concept" a type="image" caption="Embedded Conduits in Concrete — Placement Rules and Sleeve Details" description="Beam and slab cross-sections showing: (1) Conduit placement zones avoiding tension regions; (2) Maximum conduit size (≤1/3 member depth); (3) Horizontal and vertical spacing requirements; (4) Sleeve details at beam penetrations; (5) Grouping limitations. Areas where conduits are prohibited (compression zones, plastic hinge regions) highlighted in red." suggestedAsset="Diagram or reference image" status="placeholder" />

Embedded conduits—electrical, HVAC, plumbing ducts, and utility sleeves—must not compromise structural capacity. NSCP 2015 Chapter 4, Section 406.3 sets maximum cross-sectional area limits and spacing rules. The underlying principle: the void from an embedded pipe reduces the concrete's ability to carry load and creates a weak plane. Larger conduits or too many conduits in a small region can lead to local crushing, cracking, or shear transfer failure.

Two design approaches: (1) limit conduit size/area to avoid weakening, or (2) provide supplemental reinforcement to compensate. Most designs use approach (1)—sizing limits that ensure the structure remains safe without redesign.

## Key Provisions

### Conduit Size Limits (NSCP 2015 Section 406.3)

| **Member Type** | **Maximum Conduit Size** | **Expression** | **Notes** |
|---|---|---|---|
| Slabs (one-way or two-way) | 1/3 of slab thickness | h/3 | Largest single conduit; applies to solid slabs only |
| Beams | 1/3 of beam depth | h/3 | Same rule as slabs; for rectangular beams |
| Joist/Ribbed slabs | 1/4 of rib width | w_rib/4 | Tighter limit due to slender ribs |
| Columns | 4% of cross-sectional area | 0.04 × A_column | For circular or rectangular columns |
| Walls | 1/3 of wall thickness | t/3 | Similar to slabs; applied to wall thickness |

**Example — Slab:** 150 mm solid slab → max conduit diameter = 150/3 = 50 mm.
**Example — Column:** 400 mm × 400 mm column (A = 160,000 mm²) → max area = 0.04 × 160,000 = 6,400 mm² → max circular conduit dia ≈ 90 mm.

### Conduit Spacing Requirements (NSCP 2015 Section 406.3)

| **Spacing Criterion** | **Minimum Clear Distance** | **Application** |
|---|---|---|
| Between adjacent conduits | 3 diameters (center-to-center) | Prevents local failure zone from merging |
| From surface (clear cover) | 25–40 mm (per cover requirements) | Standard concrete cover |
| From reinforcement | 10–20 mm clear (varies) | Avoid bar interference |
| Within same cross-section | Check cumulative area | Multiple small pipes count together |

**Spacing Rule:** If spacing is less than 3 diameters, treat multiple conduits as a single larger equivalent void.

### Reinforcement for Conduit Openings (NSCP 2015 Section 406.3)

If conduits exceed the size limits, reinforcement around the opening can compensate:

| **Condition** | **Reinforcement Required** | **Notes** |
|---|---|---|
| Within size limits (no supplemental) | None required (already counted in design) | Standard design suffices |
| Larger than limits | Add reinforcement perpendicular to pipe axis (verify exact ratio and area definition in NSCP 2015 Section 406.3) |
| Cover-exposed pipes | 40 mm concrete cover minimum | For exterior or weather-exposed elements |

**Example:** A 100 mm conduit in a 200 mm slab (exceeds h/3 = 67 mm limit) requires: (1) reduction to ≤67 mm, OR (2) supplemental reinforcement around the opening area.

### Cover Requirements for Embedded Pipes (NSCP 2015 Chapter 4, Section 406.3 and durability provisions)

Pipes exposed to weather or embedded near exposed surfaces require standard concrete cover (see Article LEA-STRC-007-01 for cover details):

| **Condition** | **Minimum Cover to Pipe (mm)** |
|---|---|
| Exposed to weather | 50 mm (bars ≥20 mm equivalent rule) |
| Interior (protected) | 40 mm (standard beam/column cover) |
| Cast against earth | 75 mm (if pipe touching soil) |

## Philippine Practice Context

Electrical conduits (PVC, 16–25 mm) in floor slabs are ubiquitous in Philippine buildings. Contractors often run multiple conduits along a single beam without spacing them adequately or checking cumulative area, leading to weak spots and cracking during construction or service. Larger utility sleeves (50–100 mm) for HVAC ducts in beams must be carefully detailed with reinforcement; many contractors simply cut holes without consulting the engineer, creating localized shear and flexural failures.

## How It's Tested

1. **Direct conduit limit:** "A 200 mm deep beam has conduits embedded. What is the maximum diameter per NSCP?" (Answer: 200/3 ≈ 67 mm; difficulty 0.3)

2. **Column area calculation:** "A 300 mm × 300 mm column allows what maximum area of embedded pipes per NSCP?" (Answer: 0.04 × 90,000 = 3,600 mm²; difficulty 0.5)

3. **Spacing rule:** "Two 25 mm conduits are embedded in a slab. What is the minimum clear distance between their centerlines?" (Answer: 3 × 25 = 75 mm on center; difficulty 0.5)

4. **Cumulative area and reinforcement:** "A beam (500 mm deep) has four 40 mm conduits. Is this within limits? If not, what compensation is required?" (Answer: exceeds h/3 = 167 mm; requires reinforcement or downsizing; difficulty 0.7)

[SLATECAMP_UI_BLOCK:ui_0001 component="Tip" status="preserved"]

## Related Articles

See also: **Concrete Cover** (lea-strc-007-01) for how conduits affect cover requirements, **Construction Joints** (lea-strc-007-06) for how conduits cross joints, and **Concrete Materials** (lea-strc-006-01) for how conduits affect concrete placement.

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]

[SLATECAMP_UI_BLOCK:ui_0002 component="WikiMistakeList" status="preserved"]