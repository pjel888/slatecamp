## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Identify the five beam types by support configuration
- Distinguish simply supported, cantilever, continuous, overhanging, and propped cantilever beams
- Explain where positive and negative moments occur in each beam type
- Match beam types to real Philippine construction applications

This topic covers beam types and their classification by support conditions. The LEA tests whether you can identify and distinguish different beam configurations. You will NOT be tested on shear and moment diagram construction or analysis; focus on beam type definitions and support characteristics.

## Core Concept
<ArticleMedia id="media-lea-strc-001-04-core-concept" a type="image" caption="Beam Types — Five Configurations Comparison" description="Side-by-side diagram comparing five beam types: Simply Supported (hinge+roller at ends, single span), Cantilever (fixed at one end, free at other), Continuous (3+ supports, multiple spans), Overhanging (supports with ends extending beyond), and Propped Cantilever (fixed end + prop at free end). Each beam shown with support symbols, deflected shape under gravity, and positive/negative moment region labels." suggestedAsset="Diagram or reference image" status="placeholder" />

A **beam** is a structural member subjected primarily to loads perpendicular to its length, acting to create internal bending and shear. Beams are classified by their support conditions, which determine how loads are transmitted to supports and how the beam behaves.

**Simply Supported Beam (Simple Beam):**
- Supported on two hinges or a hinge and roller at the ends
- Spans freely between two supports; no overhang
- Reactions occur only at the supports; no moment reactions at supports (hinges/rollers allow rotation)
- Bends downward under gravity loads with maximum deflection typically at midspan
- Example: A floor beam resting on two columns

**Cantilever Beam:**
- Fixed at one end; free at the other
- The fixed end provides horizontal, vertical, and moment reactions
- The free end (cantilevered end) has no support, allowing deflection and rotation
- Typically bends upward near the fixed end due to the moment, then downward toward the free end
- Example: A balcony slab, a diving board, a wall-mounted shelf

**Continuous Beam (Multi-Span Beam):**
- Supported at three or more points, spanning across multiple supports
- Each span between supports behaves differently
- Develops both positive and negative bending moments (sagging and hogging)
- More complex load distribution than simple beams; intermediate supports reduce deflection
- Example: A floor system spanning across multiple columns in a building

**Overhanging Beam (Beam with Overhang):**
- Supported by two or more supports with one or both ends extending (overhanging) beyond the supports
- Combines characteristics of simple and cantilever beams
- The overhang can create uplift forces at one support while downward loads act on the other
- Example: A canopy frame where the roof extends beyond the supporting columns

**Propped Cantilever (Cantilever with Additional Support):**
- A cantilever beam with an additional support (prop) at the free end
- The prop may be a hinge, roller, or another intermediate support
- Reduces deflection compared to a pure cantilever
- Example: A retaining wall with a strut at the top

Each beam type has distinct behavior under loading: the support conditions dictate how internal forces develop and how the structure deforms.

## Key Provisions

| Beam Type | Support Condition | Reactions | Characteristics | Typical Use |
|-----------|----------|-----------|---------|------------|
| **Simply Supported** | Hinge + Roller or Hinge + Hinge at ends | 2 reactions (hinges) or 1+1 (hinge + roller) | Single span; maximum deflection at midspan | Floor beams; bridge spans |
| **Cantilever** | Fixed at one end; free at the other | 3 reactions at fixed end (Hx, Hy, M) | Single overhang; large deflection at free end | Balconies; shelves; roof canopies |
| **Continuous** | 3+ supports; multiple spans | Reactions at each support; includes negative moments | Multi-span; lower deflection; complex load path | Multi-bay buildings; long structures |
| **Overhanging** | 2+ supports with overhang(s) beyond | Reactions vary by configuration | Combined simple + cantilever behavior | Canopies; exterior load paths |
| **Propped Cantilever** | Fixed at one end; additional support (prop) at free end | 3+ reactions | Intermediate stiffness; reduced deflection vs. pure cantilever | Large cantilevers; stabilized overhangs |

## Philippine Practice Context

In Philippine building design, simply supported beams are standard in floor systems with multiple columns. Cantilever balconies and slab overhangs are common in residential and commercial buildings, often required by architectural design. Continuous beams are the norm in multi-story frames, where the NSCP requires design for both positive and negative moments. Propped cantilevers appear in long-span architectural features where lateral stiffness must be maintained. Understanding beam type is essential for interpreting structural drawings and design calculations submitted to building officials.

## How It's Tested

1. **Identification:** "A beam fixed at one end and free at the other is called ___." — tests definition recall.
2. **Comparison:** "Which beam type allows rotation at all supports?" — tests understanding of support constraints.
3. **Load Path:** "In a continuous beam spanning across three columns, what is the typical location of maximum negative moment?" — tests conceptual understanding (answer: over intermediate columns).
4. **Application:** "A canopy structure extends 3 m beyond its supporting columns. Classify this beam type and explain why the columns must resist overturning forces." — tests synthesis of support type and loading behavior.

<Tip>**Beam type quick reference — by support count and location:**
- **1 fixed end = Cantilever**
- **2 ends, not fixed = Simply Supported**
- **3+ supports = Continuous**
- **2+ supports + overhang = Overhanging**
- **Cantilever + prop = Propped Cantilever**</Tip>

## Related Articles

See also: **Supports** (lea-strc-001-03) for the foundations of beam classification, **Static Determinacy** (lea-strc-001-06) for determinate vs. indeterminate beam analysis, and **Load Distribution** (lea-strc-001-05) for how loads travel through beams.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

<WikiMistakeList mistakes={["Confusing simply supported with cantilever: Simply supported has no moment reactions at ends (hinges/rollers); cantilever has a large moment reaction at the fixed end. The fixed-end condition is the key distinction.","Treating continuous and simple beams identically: A continuous beam's interior spans develop negative moments over intermediate supports; a simply supported beam develops only positive moments. Ignoring this causes under-design at critical locations.","Underestimating cantilever deflection: Cantilever deflection is often much larger than a simply supported span of the same length due to the fixed-end condition. Never ignore cantilever stiffness checks.","Misidentifying overhang behavior: An overhanging beam is NOT a simple beam everywhere; the overhang acts as a cantilever and can create uplift (negative reactions) at the opposite support if the cantilever load is large enough."]} />