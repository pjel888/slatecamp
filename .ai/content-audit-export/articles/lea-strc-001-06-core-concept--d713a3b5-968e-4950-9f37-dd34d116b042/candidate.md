

## Board Exam Quick Check

Before memorizing details from this topic, state the exam task in one sentence: what is being classified, measured, approved, or restricted? Then identify the controlling rule named by the item and avoid importing requirements from a different law, table, or occupancy condition.

**Common mistake:** treating a familiar keyword in **Lea Strc 001 06 Core Concept** as enough to answer. In LEA-style questions, first anchor the question to the exact code, scope, and condition being tested, then choose the option that follows that rule.

**Retrieval prompt:** What fact in the question tells you which rule set applies, and what option would become wrong if the scope changed?
## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define static determinacy and distinguish determinate from indeterminate structures
- Calculate the degree of indeterminacy (n) for beams and frames
- Explain the effect of support settlement on determinate vs. indeterminate structures
- Recognize that determinacy and stability are separate properties

This topic distinguishes between statically determinate and statically indeterminate structures. The LEA tests whether you understand how support conditions and member arrangements determine which structures can be fully analyzed using equilibrium equations alone. You will NOT be tested on analysis methods (moment distribution, stiffness methods); focus on the concept of static determinacy.

## Core Concept
<ArticleMedia id="media-lea-strc-001-06-core-concept" type="image" caption="Static Determinacy — Determinate vs Indeterminate Comparison" description="Comparative diagram showing determinate structures (simply supported beam with 2 reactions, n=0; cantilever with 3 reactions, n=0) alongside indeterminate structures (fixed-ended beam with 4 reactions, n=1; continuous beam with 4 supports, n=3). Each structure labeled with reaction count, degree of indeterminacy, and whether settlement causes force redistribution." suggestedAsset="Diagram or reference image" status="placeholder" />

**Static Determinacy** is the property of a structure that depends on whether the support reactions and internal forces can be completely determined using only the three equations of static equilibrium in 2D:

- ΣFx = 0 (sum of horizontal forces)
- ΣFy = 0 (sum of vertical forces)
- ΣM = 0 (sum of moments about any point)

**Statically Determinate Structures:**
These structures have exactly as many unknowns (reactions and internal forces) as there are equations of equilibrium. All reactions and internal forces can be found from equilibrium equations alone, without knowing material properties (E, I, etc.) or considering deformations. Analysis is straightforward and yields unique, definitive results.

Examples:
- A simply supported beam (2 reactions; can be solved with ΣFy and ΣM)
- A cantilever beam (3 reactions; can be solved with ΣFx, ΣFy, ΣM)
- A simple truss with pin-jointed members (equilibrium at each joint)

The key advantage of determinate structures: if the support settles by a small amount, internal forces do NOT change (forces depend only on applied loads and geometry, not on support movement).

**Statically Indeterminate Structures:**
These structures have MORE unknowns than equilibrium equations can solve. Additional equations (from deformation compatibility and material properties) are required. The degree of indeterminacy (n) is the number of extra unknowns beyond the three equilibrium equations.

Examples:
- A continuous beam with 3+ supports (redundant supports create extra unknowns)
- A fixed-ended beam (4 reactions: Hx, Hy, M at each end, but only 3 equilibrium equations)
- A frame with rigid joints (internal moments at joints are unknown)

The key consequence of indeterminate structures: if a support settles, internal forces WILL change even without a change in applied load. This makes indeterminate structures sensitive to support movements and requires careful design for thermal expansion and foundation movement.

**Degree of Indeterminacy (n):**
For a structure: n = number of unknown reactions + unknown internal forces − number of equilibrium equations.

For simple structures: n = r − 3, where r = number of unknown reaction components.

A structure with n = 0 is determinate. A structure with n > 0 is indeterminate. Negative n indicates an unstable structure (insufficient constraints).

## Key Provisions

| Characteristic | Determinate | Indeterminate |
|---|---|---|
| **Unknowns vs. Equations** | Unknowns = Equilibrium equations | Unknowns > Equilibrium equations |
| **Solvability** | Equilibrium alone solves reactions and forces | Deformation compatibility required |
| **Material Properties** | Analysis is independent of E, I, A | Analysis depends on E, I, A |
| **Support Settlement** | Internal forces unchanged by small support movement | Internal forces change with support movement |
| **Example: Beam** | Simply supported (2 reactions) | Continuous with 3+ supports; fixed-ended |
| **Example: Frame** | Pinned-joint truss (if properly supported) | Rigid-frame with rigid joints |
| **Degree of Indeterminacy** | n = 0 | n = 1, 2, 3... (or higher) |

## Counting Unknowns for Beams

For a beam or frame, count:
- At each support: pinned (hinge) = 2 unknowns (Hx, Hy); roller = 1 unknown (Hy); fixed = 3 unknowns (Hx, Hy, M)
- Internal forces at internal pins or hinges: each additional pin = additional unknown to resolve

**Simply Supported Beam:** 2 support reactions → r = 3 effective unknowns (2 forces + 1 moment equation satisfied by geometry) → n = 0 (determinate)
**Cantilever Beam:** 1 fixed support → r = 3 → n = 3 − 3 = 0 (determinate)
**Fixed-Ended Beam:** 2 fixed supports → r = 4 (VyA, MA, VyB, MB) → n = 4 − 3 = 1 (one time indeterminate)
**Continuous Beam (4 supports):** r = 6+ (2 end reactions + 2 per interior support) → n = 3 (three times indeterminate; use proper beam formula 3(m-1) where m=spans)

## Philippine Practice Context

In Philippine structural design, most buildings use continuous beams and rigid frames, which are indeterminate. This provides structural redundancy—if one load path fails, others remain active. However, indeterminate design requires careful attention to support settlement and thermal expansion. The NSCP 2015 requires analysis of indeterminate structures using approved methods including elastic analysis or finite element methods (Section 103). Determinate structures (such as simply supported beams or simple trusses) are used when simplicity is desired, but they offer no load-path redundancy.

## How It's Tested

1. **Identification:** "A simply supported beam is statically ___ (determinate/indeterminate)." — tests definition.
2. **Degree Counting:** "How many degrees of indeterminacy does a continuous beam with 4 supports have?" — tests calculation (n = 4 − 3 = 1).
3. **Consequence Recognition:** "A support in a determinate structure settles 5 mm. How are internal forces affected?" — tests understanding (unchanged) vs. indeterminate (changed).
4. **Analysis Method Implication:** "Which analysis method is required for a fixed-ended beam?" — tests understanding that indeterminate requires more than equilibrium.

<Tip>**Quick Rule — Beam Determinacy:**
- **Simply Supported = Determinate** (2 unknowns, 3 equations, geometry stable)
- **Cantilever = Determinate** (3 unknowns, 3 equations; perfect match)
- **Continuous or Fixed-Ended = Indeterminate** (more than 3 unknowns)
- **Degree n = r − 3** (for unknowns r at supports; ignore joint unknowns if properly accounted)</Tip>

## Related Articles

See also: **Supports** (lea-strc-001-03) for how reaction components affect determinacy counts, **Beam Types** (lea-strc-001-04) for examples of determinate and indeterminate beams, and **Structural Systems** (lea-strc-002-01 through lea-strc-002-06) for how system choice affects determinacy.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

<WikiMistakeList mistakes={["Confusing determinacy with stability: A structure can be stable but indeterminate (continuous beam). It can also be determinate but unstable (three collinear supports). Determinacy and stability are separate properties.","Forgetting to count all unknowns: A fixed support has 3 unknowns (Hx, Hy, M), not just 1. A hinge has 2 unknowns. Miscounting leads to wrong determinacy assessment.","Assuming indeterminate structures are better: Indeterminate structures have redundancy, which is good. But they are also sensitive to support movement and thermal effects. Determinate structures are simpler to analyze but have no redundancy.","Ignoring the constraint that n = 0 is stable only if geometry is proper: Three hinges that are collinear form an unstable structure (n = 0 mathematically, but mechanism forms). Geometry and support arrangement matter.","Using the wrong equilibrium equations: In 3D, there are 6 equations of equilibrium. In 2D, there are 3. Applying 3D equations to a 2D problem leads to false indeterminacy counts."]} />