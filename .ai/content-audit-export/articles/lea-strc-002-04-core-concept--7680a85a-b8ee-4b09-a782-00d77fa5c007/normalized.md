

## Board Exam Quick Check

Before memorizing details from this topic, state the exam task in one sentence: what is being classified, measured, approved, or restricted? Then identify the controlling rule named by the item and avoid importing requirements from a different law, table, or occupancy condition.

**Common mistake:** treating a familiar keyword in **Lea Strc 002 04 Core Concept** as enough to answer. In LEA-style questions, first anchor the question to the exact code, scope, and condition being tested, then choose the option that follows that rule.

**Retrieval prompt:** What fact in the question tells you which rule set applies, and what option would become wrong if the scope changed?
## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define a bearing wall and distinguish it from a shear wall
- Identify the two functions of a bearing wall (gravity + lateral)
- Recognize bearing wall reinforcement and detailing requirements
- Explain load distribution from slab to bearing wall to foundation

Walls are classified by their structural function: bearing, non-bearing, parapet, retaining, and specialty walls. Each type has distinct design criteria, materials, and load paths. Bearing wall classifications use specific NSCP thresholds to separate load-bearing from non-load-bearing roles.

## Core Concept
[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-strc-002-04-core-concept", type="image", caption="Wall Types — Bearing, Non-Bearing, Parapet, and Retaining", description="Building cross-section diagram identifying four wall types: bearing wall (supporting slab loads above), non-bearing/curtain wall (self-weight only, attached to frame), parapet wall (extending above roofline with anchorage detail), and retaining wall (resisting lateral earth pressure with counterfort/buttress options). Load paths shown for each type.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

A **bearing wall** is a wall that supports vertical (gravity) loads from above in addition to its own weight. NSCP 2015 classifies bearing walls in seismic design tables (Table 208-11); specific superimposed load thresholds require verification from Volume 2 material sections. These thresholds are critical—below them, walls are considered non-bearing.

A **non-bearing wall** (or curtain wall, infill wall) carries only its own weight. Non-bearing walls do not contribute to the lateral system and are often attached to the structural frame as cladding or partition.

A **parapet wall** is the portion of a wall that extends above the roofline. Parapets can be bearing or non-bearing. Parapet walls are vulnerable to wind and must be anchored to the roof or floor below to resist out-of-plane forces and prevent collapse.

A **retaining wall** resists lateral earth pressure and holds soil on a slope. Retaining walls must be designed for the active and passive earth pressure, and may include structural elements like counterforts (inner face, in tension) or buttresses (outer face, in compression) to increase bending capacity.

A **specialty wall** includes shear walls (lateral load resistance), cavity walls (for weather resistance with a minimum air space), and other purpose-built walls (veneered walls, precast walls, etc.).

## Key Provisions

| Wall Type | Primary Load | Design Load Threshold (NSCP) | Typical Materials | Critical Design Consideration |
|-----------|--------------|------|------------------|-----|
| **Bearing – Light-frame** | Gravity + own weight | > 1.45 kN/m (100 plf) superimposed load | Steel/wood studs | Stud capacity, foundation anchorage |
| **Bearing – Masonry/Concrete** | Gravity + own weight | > 2.90 kN/m (200 plf) superimposed load | Masonry, RC | Compression capacity, axial load limits |
| **Non-Bearing** | Own weight only | ≤ thresholds above | Any (typically lightweight) | Lateral attachment to frame, wind resistance |
| **Parapet** | Own weight + wind | Extends above roofline | Masonry, RC | Out-of-plane anchoring to roof/floor |
| **Retaining** | Earth pressure | Active/passive pressure | RC, masonry, soil nails | Overturning, sliding, base capacity |
| **Cavity Wall** | Varies | > 2.90 kN/m if bearing (masonry) | Masonry with air space | Minimum air space: 50.8 mm (2 inches) per typical international standards (verify local practice) |

**Bearing Wall Load Thresholds (NSCP 2015 Section 202):**
- Metal/wood stud wall bearing status: superimposed load > 1.45 kN/m (100 plf) = bearing wall
- Masonry/concrete wall bearing status: superimposed load > 2.90 kN/m (200 plf) = bearing wall

**Cavity Wall Air Space Limits:**
- Minimum: 50.8 mm (2 inches) per typical standards
- Maximum: not specified in NSCP

## Philippine Practice Context

In the Philippines, bearing masonry walls are standard in residential construction and low-rise commercial buildings. Non-bearing curtain walls are common in frame structures where the frame carries all gravity loads. Retaining walls appear frequently in hillside developments and terraced sites. Cavity wall construction is employed in high-end residential and commercial projects for superior weather resistance. NSCP Section 202, 430 (RC walls), and 507 (masonry) govern design.

## How It's Tested

**Remember-level:** Identify whether a wall is bearing or non-bearing based on superimposed load and wall material.

**Understand-level:** Explain why bearing wall thresholds differ between light-frame (1.45 kN/m) and masonry (2.90 kN/m) walls.

**Apply-level:** Given a 5-story residential building with 2.0 kN/m load on each wood stud wall, classify the wall and specify design requirements.

[SLATECAMP_UI_BLOCK:ui_0002 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memory aid:** Light-frame 1.45, masonry 2.90. Think "light is half" — stud threshold is exactly half the masonry threshold (1.45 = 2.90/2). These convert from 100 plf and 200 plf. Cavity walls: "51 to 114" — remember the range by rounding (50–100 ≈ 51–114).
[/SLATECAMP_UI_BLOCK]

## Related Articles

See also: **Bearing Wall Systems** (lea-strc-002-01) for the complete structural system, **Shear Walls** (lea-strc-002-02) for lateral-force-resisting walls, and **Masonry Construction** (lea-strc-010-01) for masonry bearing wall details.

## Common Mistakes
[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: These are frequently tested traps. Memorize them to avoid losing easy points on exam day.
[/SLATECAMP_UI_BLOCK]

<WikiMistakeList mistakes={["Using the wrong bearing wall threshold — light-frame is 1.45 kN/m (100 plf), masonry is 2.90 kN/m (200 plf). Using older values of 0.5/1.0 kN/m is an outdated error.","Treating bearing and non-bearing walls identically in design — bearing walls require compression design, foundation anchoring","Ignoring cavity wall air space limits; walls with gaps < 51mm or > 114mm violate NSCP"]} />