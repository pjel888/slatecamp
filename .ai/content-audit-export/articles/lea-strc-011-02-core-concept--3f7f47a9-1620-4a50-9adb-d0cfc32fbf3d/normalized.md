## What You Need to Know for the LEA

## Learning Goal

By the end of this article, you will be able to:

- Distinguish between shallow and deep foundations
- Identify the four shallow foundation types: isolated, strip, combined, and mat
- Explain the floating foundation concept
- Apply foundation selection criteria based on soil bearing capacity, settlement, and cost

---
## Core Concept
A foundation is the structural system that transfers building load from the superstructure to the soil. Foundation selection is governed by three factors: _soil bearing capacity_, _allowable settlement_, and _site constraints_ (depth to groundwater, adjacent structures, available space).

**Foundation Classification by Depth:**

_Shallow Foundations_ are characterized by a depth-to-width ratio (Df/B) less than 1, typically placed at depths ≤ 2–3 m below grade, though actual depth depends on footing width and soil conditions. Load transfer occurs through direct bearing pressure on the soil immediately below the footing. Common types include:
- _Isolated footing_: A single footing supporting one column. Economical for low to moderate loads on firm soils.
- _Strip footing (wall footing)_: A continuous footing supporting a linear load (wall). Width (B) is constant; length extends indefinitely. Settlement is calculated as continuous rather than isolated.
- _Mat (raft) foundation_: A large, continuous reinforced concrete slab covering the entire building footprint (or a major portion). Used when isolated or strip footings would be too numerous or when bearing capacity is marginal. Mats provide stiffness and reduce differential settlement.
- _Combined footing_: A single footing supporting two or more columns, typically aligned in a line. Used to reduce eccentric loading or when column spacing precludes independent footings.

_Deep Foundations_ are placed below the zone of significant stress distribution and transfer loads via friction along the shaft or bearing at depth. Actual depth varies based on soil profile and competent stratum location, typically ≥ 3 m but may be deeper or shallower depending on site conditions. Load is transferred via friction along the shaft or bearing at depth. Piles and caissons are the primary deep foundation elements (taxonomy detailed in LEA-STRC-011-01). Deep foundations are selected when:
- No competent shallow bearing stratum exists.
- Soil bearing capacity at shallow depth is insufficient.
- Settlement tolerance is very strict.
- Presence of deep fill or compressible layers mandates bypass.

**Floating Foundations:**

A _floating foundation_ is a specialized deep mat or plate placed at sufficient depth that the weight of excavated soil removed equals (or nearly equals) the weight of the superstructure. The net pressure increase on the soil is minimal, theoretically reducing settlement to near zero. Floating foundations are most practical for low-rise, light structures (e.g., low-cost housing, small multi-story buildings) in compressible clay. They are not viable for tall, heavy structures.

**Foundation Selection Criteria:**

| **Criterion** | **Shallow** | **Deep** |
|---|---|---|
| Depth to competent soil | < 2–3 m | > 3 m; no shallow option available |
| Bearing capacity required | High; firm soil present | Lower soil; friction and tip compensate |
| Settlement tolerance | Moderate (50–75 mm typical) | Lower; friction piles exhibit time-dependent settlement |
| Cost | Lower (smaller concrete volume) | Higher (drilling, deeper excavation, pile caps) |
| Construction time | Shorter | Longer (drilling, curing, driving) |
| Soil compatibility | Limited (requires firm soil) | Broader (works in soft clay, loose sand, heterogeneous profiles) |

**Concrete Cover (Reference Only):**

Footing concrete cast against earth requires 50 mm minimum cover to reinforcement per PD 1096 2004 IRR Rule VIII Section 805 (or verify against current NSCP 2015 requirements). This value is controlled by LEA-STRC-007-01 (Concrete Cover and Protection) and is referenced here only for completeness.

## Key Provisions

| **Foundation Type** | **Typical Depth Df** | **Bearing Mechanism** | **Settlement Behavior** | **Soil Requirements** |
|---|---|---|---|---|
| Isolated footing | 0.75–1.5 m | Direct bearing | Elastic + immediate; minimal if soil is firm | Firm sand, stiff clay; low-compressibility soils |
| Strip footing | 0.75–2.0 m | Direct bearing | Continuous load; settlement reduces with length | Firm to moderate soils |
| Combined footing | 1.0–2.0 m | Direct bearing; eccentric reduction | Moderate; depends on soil uniformity | Moderate to firm soils |
| Mat (raft) foundation | 1.0–3.0 m (shallow to intermediate) | Distributed bearing across slab | Reduced differential settlement; higher uniformity | Weak to moderate soils; heterogeneous profiles |
| Floating foundation | 2.0–4.0 m | Excavation weight ≈ structure weight | Minimal (near zero if designed correctly) | Compressible clay; light structures only |
| Pile/caisson foundation | > 3 m (variable) | Friction and/or tip bearing | Time-dependent; friction piles exhibit settlement; end-bearing more stable | Any soil profile; mandatory in soft alluvial deposits |

## Philippine Practice Context
In Metro Manila and coastal alluvial plains, shallow footings are viable only in small, low-rise projects on elevated or well-compacted sites. The majority of urban construction employs pile or mat foundations to bypass soft clay layers 15–50 m deep. Floating foundations are rare but appear in low-cost housing schemes (60 sq.m. max) in controlled subsurface conditions. Mindanao volcanic regions often allow shallower foundations due to firmer upper soils. Typhoon-prone areas use mats and deep foundations for lateral stability combined with architectural overturning resistance.

## How It's Tested
1. **Foundation Type Selection:** Given a site with soft clay to 30 m depth and bearing capacity 50 kN/m², select the foundation type and justify based on bearing capacity and settlement criteria.
2. **Mat vs. Isolated Footing:** A 20-column building on marginal soil compares a mat foundation to 20 isolated footings. Analyze differential settlement and load distribution advantages of the mat.
3. **Floating Foundation Viability:** For a 3-story residential building (500 kN total), soil depth 4 m with excavated soil weight 4000 kN, determine if a floating foundation is viable and calculate net pressure increase.

[SLATECAMP_UI_BLOCK:ui_0001 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memory Aid:** Shallow footings are direct pushers—they shove load straight down into soil. Deep piles and caissons are deep anchors—they hang onto the soil with friction or grip a firm layer with their tip. Mats are load-spreaders—they flatten pressure across a wide area to reduce settlement. Floating foundations are weight-balancers—they remove as much soil weight as they place in structure.
- **Exam relevance:** High — expect at least one question on this topic per LEA set.



[/SLATECAMP_UI_BLOCK]


## Related Articles

See also: **Piles** (lea-strc-011-01) for deep foundation details, **Geotechnical Engineering** (lea-strc-011-03) for soil properties governing selection, and **Concrete Materials** (lea-strc-006-01) for footing concrete requirements.

## Common Mistakes
[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: These are frequently tested traps. Memorize them to avoid losing easy points on exam day.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0002 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Assuming shallow foundations are always cheaper; deep foundations are often mandatory in soft soil and eliminate costly settlement repair later.\",\"Confusing floating foundation with a raft foundation; floating requires Df and excavation weight to nearly equal structure weight; ordinary mats are intermediate supports, not floating.\",\"Treating combined footing and mat as equivalent; combined footings support 2–4 columns; mats cover the entire footprint and provide greater stiffness and load distribution.\",\"Placing mats at arbitrary depth; mat depth is selected to balance bearing capacity and settlement. Deeper mats reduce pressure but increase cost. Optimization is required.\",\"Omitting the role of groundwater and compressibility in foundation selection; soft, saturated clays mandate deep foundations and settlement monitoring, not shortcuts to shallow systems.\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]