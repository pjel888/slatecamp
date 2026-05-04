## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Identify the five types of internal forces: tension, compression, shear, bending, and torsion
- Describe the structural effect of each internal force type
- Distinguish between axial forces (tension/compression) and moments (bending/torsion)
- Explain where shear is highest in a simply supported beam
- Recognize that shear and bending are related but distinct phenomena

This topic covers the five types of internal forces that develop within structural members under loading. The LEA tests whether you can identify, define, and distinguish internal forces conceptually. You will NOT be tested on stress calculations, strain relationships, or material-specific formulas (like the timber shear formula); focus on force type definitions and their structural effects.

## Core Concept

When loads are applied to a structure, they cause internal forces to develop within the structural members. Cutting a member at any cross-section and examining the internal actions reveals forces and moments that keep the separated portions in equilibrium. Five types of internal forces are fundamental to structural behavior:

**Tension (T):**
A pulling force that acts along the longitudinal axis of a member, pulling the two cut sections apart. The fibers of the member are being stretched. Example: Cables in a suspension bridge, the lower chord of a truss, steel rods in a tie-down system. Under tension, the member tries to elongate.

**Compression (C):**
A pushing force that acts along the longitudinal axis, pushing the two cut sections together. The fibers are being squeezed. Example: Columns supporting a building, the upper chord of a truss, studs in a wall frame. Under compression, the member tries to shorten. Compression is critical because it can lead to buckling if the member is slender.

**Shear (V):**
A force that acts perpendicular (transverse) to the longitudinal axis of the member, tending to slide one portion past the adjacent portion. If two halves of a member are cut by a horizontal plane and one half tends to move up or down relative to the other, shear is present. Example: A beam loaded perpendicular to its length develops shear. Shear forces create a sliding tendency; large shear can cause the member to split along the grain (in timber) or fail by diagonal cracking (in concrete).

**Bending (Moment, M):**
A couple (moment) that acts to bend or flex the member. Bending causes one face to be in compression and the opposite face to be in tension along the length of the member. A pure bending moment has no net force but creates rotation and curvature. Example: Any loaded beam experiences bending. The upper fibers may be in compression (curved downward); the lower fibers in tension (stretched). Bending causes flexural stress that varies across the section.

**Torsion (T or τ):**
A twisting moment that acts about the longitudinal axis, causing the member to rotate or twist. Torsion develops when loads are applied off-center or when a member is twisted by external forces. Example: A drive shaft, a beam with eccentric loading, a building corner with asymmetric load paths. Torsion causes shear stress on the surface of the member; the interior experiences lower stress.

Each internal force type has distinct causes and effects on the structure. Tension and compression are axial; shear is transverse; bending and torsion are moments. A structural member may experience more than one type simultaneously (e.g., a loaded beam experiences both shear and bending).

## Key Provisions

| Internal Force | Direction | Effect | Symbol | Typical Location |
|---|----------|--------|--------|------------|
| **Tension** | Axial (pulling) | Elongation; fiber stretching | T | Cable members; ties; lower chord truss |
| **Compression** | Axial (pushing) | Shortening; fiber squeezing; buckling risk | C | Columns; upper chord truss; studs |
| **Shear** | Transverse (perpendicular to length) | Sliding tendency; diagonal cracking (concrete); grain splitting (timber) | V | Beam ends; near supports |
| **Bending** | Moment; perpendicular load | Curvature; compression on one face, tension on opposite | M | Loaded beams; span center (positive M), supports (negative M) |
| **Torsion** | Moment; about longitudinal axis | Twisting; shear stress on member surface | T or τ | Eccentric loading; skew structures; drive shafts |

## Shear as an Internal Force Concept

Shear (V) is the internal force concept owned here. Shear represents the internal action at a section that prevents one portion of the member from sliding past the adjacent portion. In a loaded beam, shear force is highest at the supports and decreases toward midspan. The magnitude and direction of shear at any section must be determined by free-body diagram equilibrium; shear values are not assigned arbitrarily.

**Note:** Shear strength formulas (e.g., timber shear formula 3V/2A) and stress/strain relationships are covered in other articles and are NOT part of this topic. Similarly, stress calculations and material-specific shear capacity checks are separate.

## Philippine Practice Context

In Philippine structural design, engineers identify internal forces through free-body diagrams and load path tracing. Reinforced concrete design accounts for tension (longitudinal steel), compression (concrete), shear (stirrups), and bending (flexure). Steel design manages tension (plates, welds), compression (buckling of columns and plate elements), shear (bolts, welds), bending (beam sections), and torsion (corner braces). Timber design addresses compression (parallel to grain), tension (perpendicular grain splitting), shear (grain splitting), bending (MOE checks), and torsion (less common but present in skew structures).

## How It's Tested

1. **Identification:** "At the support of a loaded beam, which internal force is typically largest?" — tests understanding of shear distribution.
2. **Effect Matching:** "Which internal force causes one face of a beam to go into compression and the opposite face into tension?" — tests bending concept.
3. **Cause and Effect:** "A beam with off-center loading develops what type of internal force?" — tests torsion understanding.
4. **Conceptual Application:** "In a cable-supported structure, the cables experience primarily ___." — tests tension concept application.

<Tip>**Internal forces — five types remembered by location and effect:**
- **Tension & Compression = axial** (along the member length; pulling or pushing)
- **Shear = transverse** (perpendicular; sliding)
- **Bending = moment** (curves the member)
- **Torsion = twisting moment** (rotates about the axis)

**Shear is highest at supports; bending is highest at midspan (for simply supported beams).**</Tip>


## Related Articles

See also: **Force Properties** (lea-strc-001-01) for the fundamentals, **Beam Types** (lea-strc-001-04) for where internal forces develop, and **Stress** (lea-strc-003-01) for how internal forces translate to material stress.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

<WikiMistakeList mistakes={["Treating bending and shear as the same thing: Shear is a transverse force; bending is a moment. They are related (shear causes bending to vary) but distinct. A beam can have shear with zero moment at one section and moment with zero shear at another.","Confusing torsion with bending: Torsion twists the member about its axis; bending curves it perpendicular to the axis. A twisted beam and a bent beam have opposite failure modes.","Assuming all axial force is tension: Compression is equally important; columns are critical structural elements that must be designed for compressive strength and buckling resistance. Compression is not a weakness; it is a load type.","Forgetting that tension cannot reverse in some materials: Concrete and masonry have low or zero tensile strength. A structural element that experiences tension in concrete design requires reinforcement; plain concrete cannot carry tension alone.","Ignoring shear in design: Shear forces create diagonal cracks in concrete and grain splitting in timber. Shear must be checked; it is not a secondary effect."]} />