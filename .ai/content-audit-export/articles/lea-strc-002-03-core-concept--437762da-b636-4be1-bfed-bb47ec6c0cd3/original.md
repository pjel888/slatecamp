

## Board Exam Quick Check

Before memorizing details from this topic, state the exam task in one sentence: what is being classified, measured, approved, or restricted? Then identify the controlling rule named by the item and avoid importing requirements from a different law, table, or occupancy condition.

**Common mistake:** treating a familiar keyword in **Lea Strc 002 03 Core Concept** as enough to answer. In LEA-style questions, first anchor the question to the exact code, scope, and condition being tested, then choose the option that follows that rule.

**Retrieval prompt:** What fact in the question tells you which rule set applies, and what option would become wrong if the scope changed?
## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define a moment-resisting frame (MRF) and explain its load path
- Distinguish between ordinary, intermediate, and special MRFs
- Explain why rigid beam-column connections are essential for MRF behavior
- Describe the advantages and disadvantages of MRFs compared to shear walls

Moment-resisting frames are classified into three categories based on their seismic design level: Ordinary (OMRF), Intermediate (IMRF), and Special (SMRF). Each category has specific detailing requirements and a seismic response modification factor (R factor). Understanding these categories is critical for seismic design in the Philippines.

## Core Concept
[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-strc-002-03-core-concept", type="image", caption="Moment-Resisting Frame — Rigid Connection Behavior", description="Diagram showing a moment-resisting frame under lateral load with: (1) rigid beam-column connections with moment diagrams at joints; (2) deflected shape showing double curvature in beams and columns; (3) comparison of OMRF (R=3), IMRF (R=4.5-5.5), and SMRF (R=8-8.5) detailing requirements including connection reinforcement and confinement zones.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

A **moment-resisting frame (MRF)** is a structural system in which beams and columns are rigidly connected, allowing the frame to resist lateral loads through bending moments at the joints. Unlike braced frames (which use diagonal members), moment-resisting frames rely on the rigidity of connections to develop moment capacity.

The three MRF categories are defined by the NSCP based on seismic hazard and design philosophy:

**Ordinary Moment-Resisting Frames (OMRF, R = 3 for steel OMF per NSCP Table 208-11A)** are designed for regions with lower seismic demand or for use in non-critical structures. OMRF connections are not specially detailed for ductility—they may be welded or bolted, but without enhanced confinement or reinforcement. OMRF provides moderate lateral stiffness and limited energy dissipation. R = 3.5 reflects this lower capability.

**Intermediate Moment-Resisting Frames (IMRF/IMRF, R = 5.5 concrete / 4.5 steel per NSCP Table 208-11A/Sec 418)** are designed with intermediate seismic detailing. Connections are more robust than OMRF, with some reinforcement requirements and welding controls. IMRF is used in moderate seismic zones. R = 5.5 reflects improved ductility and strength.

**Special Moment-Resisting Frames (SMRF, R = 8.0)** are designed for high seismic demand regions like Seismic Zone 4 in the Philippines. SMRF requires extensive detailing: full-penetration welds at beam-column connections, restricted steel grades, confining transverse reinforcement in concrete columns, and plastic hinge detailing in beams. R = 8.0 reflects high ductility, capacity for energy dissipation, and predictable inelastic behavior.

The R factor (response modification factor) represents how much the frame can be designed for reduced forces compared to elastic response, because the frame is allowed to deform inelastically and dissipate energy. Higher R values mean more ductility and greater lateral flexibility are accepted.

## Key Provisions

| Frame Type | R Factor | Connection Detailing | Seismic Zone Typical | Ductility | Lateral Stiffness |
|----------|----------|----------------------|----------------------|-----------|-------------------|
| **OMRF** | 3.5 | Minimal; may lack enhancement | Low-moderate | Limited | Moderate |
|IMRF | 5.5 (concrete) / 4.5 (steel) | Intermediate; some reinforcement | Moderate | Good | Moderate-High |
| **SMRF** | 8.0 | Extensive; full-penetration welds, confined reinforcement | High (Zone 2) | Excellent | Can be tuned |

**R Factor Definition:** The response modification factor allows the design force to be reduced from the elastic (full-strength) demand. A structure with R = 8.0 may be designed for 1/8 the elastic shear force if it meets SMRF detailing requirements and accepts larger inelastic deformations.

**Seismic Zone 2 (Most Severe):** In the Philippines' most seismic zone, SMRF is the standard for moment-resisting frame design in buildings where lateral system is a moment frame.

## Philippine Practice Context

NSCP 2015 Table 208-11A (R factors), Sec 408 (steel general), Sec 418 (concrete MRF) define these frame types explicitly. In Seismic Zone 4 (covering most of the Philippines except Palawan except Busuanga, Tawi-Tawi, and Sulu which are Zone 2), SMRF is required for multi-story buildings relying on moment resistance. Office towers, commercial buildings, and high-occupancy structures use SMRF. OMRF is rarely used in the Philippines due to the high seismic hazard nationally.

## How It's Tested

**Remember-level:** Identify the R factor for OMRF, IMRF, and SMRF from a frame description.

**Understand-level:** Explain why SMRF detailing is more stringent than OMRF, and how this relates to energy dissipation.

**Apply-level:** Given a 8-story office building in Seismic Zone 2, justify why SMRF is required and what design force reduction is allowed due to the R factor.

[SLATECAMP_UI_BLOCK:ui_0002 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memory aid:** O=3.5, I=5.5, S=8.0. SMRF (Special) gets the highest R because it's **specially** detailed for maximum ductility. Think: "Special demands special detailing."
[/SLATECAMP_UI_BLOCK]

## Related Articles

See also: **Bearing Wall Systems** (lea-strc-002-01) for comparison with wall systems, **Trusses** (lea-strc-002-05) for a different lateral system, and **Static Determinacy** (lea-strc-001-06) for how rigid frames affect determinacy.

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: These are frequently tested traps. Memorize them to avoid losing easy points on exam day.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0004 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Confusing R factor with safety factor—R is a reduction factor allowing smaller design forces due to ductility, not a safety multiplier\",\"Assuming IMRF and SMRF are equivleant; IMRF has less stringent detailing and lower R (5.5 vs 8.0)\",\"Using OMRF (R=3.5) in Seismic Zone 2 because it is cheaper—NSCP requires SMRF in high-seismic areas\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]