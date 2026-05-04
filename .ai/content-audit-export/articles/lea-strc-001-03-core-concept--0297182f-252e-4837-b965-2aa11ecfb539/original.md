## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Identify the three support types (hinge, roller, fixed) by symbol and constraint
- State how many degrees of freedom each support restrains
- Count reaction components for each support type
- Explain why roller supports are used in long-span structures

This topic covers the three main types of supports (boundary conditions) that anchor structures and constrain their motion. The LEA tests whether you can identify each support type and understand what degrees of freedom it restrains. You will NOT be tested on reaction calculation; focus on recognition and constraint definitions.

## Core Concept

A **support** is a constraint that prevents a structure (or part of a structure) from moving in one or more directions. Supports restrain displacement and may develop reaction forces or moments. Every support type can be defined by which **degrees of freedom** it prevents. In 2D analysis, there are three possible degrees of freedom at any point: horizontal translation (x), vertical translation (y), and rotation about z.

**Hinge Support (Pin Support):**
- Prevents translation in BOTH horizontal and vertical directions (restrains x and y)
- ALLOWS rotation freely
- Develops TWO reaction components: horizontal (Hx) and vertical (Hy)
- Symbol: A pin or dot inside a circle, or a bracket with a pin at the corner
- Example: A beam resting on a pin at one end

**Roller Support:**
- Prevents translation in ONE direction only (typically vertical; restrains y)
- ALLOWS horizontal translation and rotation freely
- Develops ONE reaction component: the one perpendicular to the rolling surface (typically vertical, Hy)
- Symbol: A circle over a line with small rollers or wheels underneath
- Example: A bridge beam on elastomeric bearing pads that allow thermal expansion

**Fixed Support (Cantilever Support):**
- Prevents translation in BOTH directions (restrains x and y)
- PREVENTS rotation; restrains rotational degree of freedom
- Develops THREE reaction components: horizontal (Hx), vertical (Hy), and moment (M)
- Symbol: A solid filled square or cross-hatching at the support
- Example: A cantilever beam fixed into a wall

The choice of support type affects the structure's ability to move and distribute loads, determining whether it is statically determinate or indeterminate.

## Key Provisions

| Support Type | Degrees of Freedom Restrained | Reaction Components | Symbol | Typical Use |
|--------------|------|---------|--------|------------|
| **Hinge (Pin)** | Horizontal + Vertical (2 DOF) | Hx, Hy | Circle with dot/pin | Beam ends; simple supports |
| **Roller** | One direction only; typically vertical (1 DOF) | Hy (or Hx perpendicular to roll) | Circle over line + wheels | Bridge expansion; thermal movement |
| **Fixed** | Horizontal + Vertical + Rotation (3 DOF) | Hx, Hy, M | Solid square or hatching | Cantilever walls; embedded columns |

## Philippine Practice Context

In Philippine structural design, supports are drawn on construction plans and detailed in connection design. Hinge supports are common in simple beam bridges and portal frames. Roller supports are critical in long-span structures where thermal expansion and earthquake-induced movement must be accommodated. Fixed supports anchor cantilever slabs and wall-frame junctions. The support type must be clearly indicated in drawings and design notes; ambiguity in support conditions leads to calculation errors and construction misunderstandings.

## How It's Tested

1. **Identification:** "A circular symbol with a dot and two small wheels beneath it represents ___." — tests symbol recognition.
2. **Constraint Recognition:** "Which support allows horizontal movement?" — tests understanding of degrees of freedom.
3. **Reaction Count:** "How many reaction components are developed at a fixed support?" — tests counting of reactions.
4. **Application:** "A 10 m span bridge beam is supported on a hinge at one end and a roller at the other. Why is the roller used instead of another hinge?" — tests conceptual understanding of expansion.

<Tip>**Quick memory rule: HOT supports.**
- **H**inge = 2 reactions (Hx, Hy); allows rotation
- **O**ne reaction = Roller; allows both translation and rotation in free direction
- **T**hree reactions = fixed (Two translations + roTation); allows nothing

Or: Hinge = **H**old 2; Roller = **R**estrains 1; Fixed = **F**ixes 3.</Tip>


## Related Articles

See also: **Beam Types** (lea-strc-001-04) for how supports define beam classification, **Static Determinacy** (lea-strc-001-06) for how support count affects solvability, and **Bearing Wall Systems** (lea-strc-002-01) for how walls function as supports.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

<WikiMistakeList mistakes={["Confusing hinge and roller: Both allow rotation, but hinge restrains BOTH x and y (develops Hx and Hy), while roller restrains ONLY ONE direction (typically y; develops only Hy).","Forgetting the moment reaction at fixed supports: A fixed support develops NOT just Hx and Hy but also a MOMENT M. This is essential for cantilever analysis.","Drawing roller supports on the wrong surface: A roller perpendicular to a horizontal surface restrains vertical movement. A roller perpendicular to a vertical surface restrains horizontal movement. Orientation matters.","Thinking support type determines if structure is stable: Three hinges or hinges in a collinear pattern do not stabilize a structure. Proper support arrangement, not just type, ensures stability."]} />