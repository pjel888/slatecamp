## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define deflection limits for beams, slabs, and cantilevers
- State the typical span-to-depth ratios for deflection control
- Distinguish between immediate (elastic) and long-term (creep + shrinkage) deflection
- Explain why deflection limits are separate from strength requirements

Minimum slab and beam thickness are code minimums to control deflection without explicit calculation. The LEA tests your mastery of four support conditions and the distinction between solid slabs, ribbed/joist sections, and beams.

## Core Concept
[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-strc-007-03-core-concept", type="image", caption="Deflection Limits — NSCP Span-to-Depth Ratios", description="Reference diagram showing NSCP minimum thickness (h) for deflection control: (1) Simply supported — L/16; (2) One end continuous — L/18.5; (3) Both ends continuous — L/21; (4) Cantilever — L/8. Comparison of immediate vs long-term deflection (creep + shrinkage). Single-span beam with deflected shape showing Δallowable (L/360 for roofs, L/240 for floors).", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

Deflection limits are based on span-to-depth ratios ($L/h$). The NSCP provides minimum thickness tables (Table 9.5.1) to avoid computing deflections when members meet these minimums.

The ratios follow physics: longer spans require thicker sections; continuous members are stiffer than simply supported ones, allowing for thinner sections.

**Two Critical Distinctions:**

1. **Solid slabs** (full depth casting) vs. **ribbed slabs and beams** (discrete sections).
2. **Four support conditions:** simply supported, one end continuous, both ends continuous, and cantilever.

Grade 60 ($f_y = 420\text{ MPa}$) is the standard reference for these tables.

## Key Provisions

### One-Way Member Minimum Total Depth ($h$)

(Based on $f_y = 420\text{ MPa}$, NSCP Table 9.5.1)

| **Support Condition** | **Solid Slab ($h_{min}$)** | **Ribbed Slab/Beam ($h_{min}$)** | **Typical Application** |
| --------------------- | -------------------------- | -------------------------------- | ---------------------------------------------- |
| Simply supported | $L/20$ | $L/16$ | Single span |
| One end continuous | $L/24$ | $L/18.5$ | First interior span |
| Both ends continuous | $L/28$ | $L/21$ | Interior spans |
| Cantilever | $L/10$ | $L/8$ | Overhang/balcony |

### Joist Slab Top Slab Thickness ($t$)

Per **NSCP 2015 Section 409.9.2.2**, the concrete slab over ribs must satisfy:

- **Thickness ($t$):** At least $1/12$ of the clear spacing between ribs.
- **Absolute Minimum:** Not less than **$50\text{ mm}$**.

### Two-Way Slab Minimum Thickness ($h$)

(For slabs supported on all four sides)

| **Condition** | **Thickness Formula** | **Notes** |
| ------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| All four sides simply supported | $L_n / (24 + \beta_s)$ | $L_n$ = longer clear span; $\beta_s$ = short/long span ratio |
| All four sides continuous | $L_n / (30 + \beta_s)$ | Stiffer condition |
| Two-way slabs with beams | NSCP Table 9.5.2(c) | Depends on beam stiffness ratio ($\alpha_m$) |

## Philippine Practice Context

- **Solid Slabs:** One-way solid slabs ($100\text{--}150\text{ mm}$) are the standard for residential buildings.
- **Design Waste:** Practitioners often default to $L/20$ without checking continuity ($L/24$ or $L/28$), leading to unnecessary dead load.
- **Cantilevers:** Balconies are frequently designed at $L/10$; deflection limits at ends are strictly enforced per NSCP for serviceability.

## How It's Tested

1. **Direct recall:** "A one-way solid slab is simply supported over $5\text{ m}$. Minimum thickness?"
 - Answer: $L/20 = 250\text{ mm}$.
2. **Interior span:** "Interior span of a $6\text{ m}$ continuous ribbed joist. Minimum depth?"
 - Answer: $L/21 = 286\text{ mm}$.
3. **The Top Slab Rule:** "A joist slab has clear rib spacing of $600\text{ mm}$. Minimum top slab thickness?"
 - Answer: $600 / 12 = 50\text{ mm}$. (Matches NSCP minimum).

## Related Articles

See also: **Concrete Materials** (lea-strc-006-01) for the modulus that affects deflection, **Flexural Theory** (lea-strc-006-03) for how bending relates to deflection, and **Beam Types** (lea-strc-001-04) for how support conditions affect deflection patterns.

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0002 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: These are frequently tested traps. Memorize them to avoid losing easy points on exam day.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0003 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[ \n \"Simply supported slab = $L/16$ — WRONG. $L/16$ is for beams; slab = $L/20$.\", \n \"Using ACI's 40 mm top slab rule — WRONG. NSCP 2015 requires 50 mm minimum for Philippine projects.\", \n \"Assuming cantilever slabs are $L/8$ — WRONG. Solid cantilever is $L/10$; ribbed/beam is $L/8$.\", \n \"Ignoring $f_y$ modifiers — WRONG. Higher $f_y$ requires adjusted ratios per code.\" \n]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]