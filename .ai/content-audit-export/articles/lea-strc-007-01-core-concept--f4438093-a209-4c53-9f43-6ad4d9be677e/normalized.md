## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define concrete cover as the distance from rebar surface to the nearest concrete surface
- State the minimum cover requirements for different exposure conditions
- Explain the three functions of cover: fire protection, corrosion protection, and bond
- Identify when cover must be increased (e.g., corrosive environment, fire rating)

Concrete cover protects reinforcement from corrosion and fire. The LEA tests your mastery of NSCP/ACI cover requirements across three conditions: cast-in-place (most common), precast, and prestressed concrete. The top three tested values are 75mm for footings, 40mm for beams and columns, and 20mm for slabs.

## Core Concept

Concrete cover is the distance from the outer concrete surface to the center of the nearest reinforcing bar or prestressing strand. It serves two critical functions: protection of steel from environmental exposure (corrosion risk) and from fire (thermal insulation).

NSCP provisions separate cover requirements by three categories:

1. _Cast-in-place concrete_ (most common in Philippine projects): exposure condition (earth, weather, interior) determines cover.
2. _Precast concrete_: stricter requirements for factory-controlled conditions; cover depends on bar size and exposure.
3. _Prestressed concrete_: highest requirements due to high-strength steel sensitivity to corrosion.

The basic principle: harsher environment = greater cover. Concrete cast against soil requires maximum cover (75mm) because soil moisture is relentless. Beams and columns in normal interior buildings require 40mm. Slabs and walls in non-exposed conditions require minimum 20mm.

## Key Provisions

### Cast-in-Place Concrete — Non-Prestressed (NSCP 6.7.1)

| **Exposure/Element** | **Bar Size** | **Minimum Cover (mm)** | **Common Application** |
|---|---|---|---|
| Cast against earth (footings, piles) | All sizes | 75 | Spread footings, pile caps |
| Exposed to weather — bars ≥20mm | ≥20mm | 50 | Exposed beams, spandrels |
| Exposed to weather — bars ≤16mm | ≤16mm | 40 | Exposed slabs, walls (thin bars) |
| Interior (not exposed) — slabs, walls, joists | ≤32mm | 20 | Interior slabs, walls |
| Interior (not exposed) — beams, columns | Primary reinforcement | 40 | Building frames |
| Interior (not exposed) — shell structures | ≥20mm | 20 | Shells, domes |
| Interior (not exposed) — shell structures | ≤16mm | 15 | Thin shells |

### Precast Concrete — Non-Prestressed (NSCP 6.7.2)

Precast elements, produced in controlled factory conditions, may permit reduced cover in non-exposed conditions:

| **Exposure/Element** | **Bar Size** | **Minimum Cover (mm)** | **Notes** |
|---|---|---|---|
| Exposed to weather — walls | ≤32mm | 20 | Factory surface quality |
| Exposed to weather — other | 20–32mm | 40 | More exposed surfaces |
| Exposed to weather — other | ≤16mm | 30 | |
| Not exposed — slabs, walls | ≤32mm | 15 | Reduced for internal use |
| Not exposed — beams, columns | Primary reinforcement | db (min 15, max 40mm) | Based on bar diameter |
| Not exposed — shell structures | ≤16mm | 10 | Thin shells |

### Prestressed Concrete (NSCP 6.7.3)

Prestressed tendons require maximum protection because prestressing steel is extremely susceptible to corrosion and stress corrosion cracking:

| **Exposure/Element** | **Condition** | **Minimum Cover to Strand (mm)** |
|---|---|---|
| Cast against earth | All | 75 |
| Exposed to weather — wall panels | Slabs, walls | 25 |
| Exposed to weather — other members | Beams, columns | 40 |
| Not exposed — slabs, walls | Interior | 20 |
| Not exposed — beams, columns | Interior | 40 |

## Philippine Practice Context

In Philippine concrete design, footing cover (75mm) is the most frequently tested requirement. The harsh tropical environment—salt spray and high humidity—demands strict compliance. Designers often round up in practice. Interior beams in typical Manila residential buildings use 40mm cover. Slabs in air-conditioned office buildings often use 20mm (minimum interior).

## How It's Tested

1. **Direct recall:** "What is the minimum cover for reinforcement in a spread footing cast against earth?" (Answer: 75mm; difficulty 0.3)

2. **Exposure scenario:** "A cantilever balcony spandrel is exposed to weather. Bars are 20mm diameter. What cover is required?" (Answer: 50mm for ≥20mm bars in weather exposure; difficulty 0.5)

3. **Precast vs. cast-in-place:** "Compare cover requirements for a 20mm bar in an interior beam: precast vs. cast-in-place." (Answer: precast db (min 15, max 40mm) vs. cast-in-place 40mm; difficulty 0.7)

4. **Prestressed member selection:** "A prestressed hollow-core slab is fully enclosed indoors. What cover to strand?" (Answer: 40mm; difficulty 0.5)

[SLATECAMP_UI_BLOCK:ui_0001 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: Footing = 75mm, Beam/Column = 40mm, Slab = 20mm. Memorize this "three-number rule" first. Then layer: weather exposure adds 10mm (40→50); precast interior halves it (20→10–15). Prestressed is always 25–50mm.
- **Exam relevance:** High — expect at least one question on this topic per LEA set.



[/SLATECAMP_UI_BLOCK]


## Related Articles

See also: **Deformed Bars** (lea-strc-006-02) for rebar that requires cover, **Hooks** (lea-strc-007-02) for how hooks interact with cover, and **Concrete Materials** (lea-strc-006-01) for concrete quality affecting cover durability.

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: These are frequently tested traps. Memorize them to avoid losing easy points on exam day.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0002 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[ \"Footing cover = 40mm or 50mm — WRONG. Always 75mm for cast against earth (ERR-STRC-020).\", \"All interior beams = 20mm cover — WRONG. Interior beams require 40mm; only slabs/walls get 20mm.\", \"Precast cover = same as cast-in-place — WRONG. Precast interior allows 15mm slabs, 10mm shells, and db-based (max 40mm) for beams.\", \"Prestressed equals 75mm — WRONG. Prestressed exposed = 50mm, fully enclosed interior = 40mm, protected = 25mm.\", \"Bar size irrelevant to cover — WRONG. Exposed weather bars ≥20mm = 50mm, but ≤16mm = 40mm only.\" ]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]