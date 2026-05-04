## What You Need to Know for the LEA

## Learning Goal

By the end of this article, you will be able to:

- Define high-strength bolted connections and distinguish them from common bolts
- Identify the two load transfer mechanisms: bearing-type and slip-critical
- Explain the role of bolt pretension in slip-critical connections
- State standard bolt grades (A325, A490) and their approximate strengths

---
## Core Concept
<ArticleMedia id="media-lea-strc-008-02-core-concept" type="image" caption="High-Strength Bolted Connections — Bearing and Slip-Critical Types" alt="Detail diagram of bolted steel connections: (1) Bolt types (A325, A490) with head markings; (2) Bearing-type connection — bolt shank bears against plate, threads may be in shear plane (N) or excluded (X); (3) Slip-critical connection — pretensioned bolt provides clamping force; (4) Edge distance, bolt spacing, and gauge requirements; (5) Gusset plate connection at truss joint with bolt layout pattern." suggestedAsset="Diagram or reference image" status="placeholder" />
High-strength bolted connections use A325 or A490 bolts to transmit shear and tension across steel-to-steel interfaces via friction or bearing. A307 bolts (general-purpose, Fu = 414 MPa) are not high-strength; they rely on loose bolts and bearing. A325 bolts (Fu = 825 MPa) are the AISC standard for structural work; A490 bolts (Fu = 1,035 MPa) serve extreme-load applications. Bolt holes fall into three categories: (1) standard holes (nominal diameter + 1.6 mm clearance, tightest fit), (2) oversized holes (+ 3.2 mm clearance, for rapid assembly), and (3) slotted holes (long slots for field adjustment). Minimum edge distance (distance from fastener center to member edge) depends on bolt diameter, steel grade, and edge condition: typical values range 32–40 mm for standard holes in A36 steel. Holes are typically drilled or punched; punching is faster but must respect hole-diameter-to-thickness ratios to avoid tearing. Pretensioning (applying initial bolt tension before loading) is mandatory for high-strength bolts under AISC 360; this clamping action ensures friction grip and prevents slipping until the bolt is in direct bearing. Pretension targets are specified in kN and must be verified by turn-of-nut or calibrated wrench methods. Bolt spacing (center-to-center distances between bolts) must be at least 2.67 times the bolt diameter to allow tool access and prevent tearout; maximum spacing in tension is constrained by buckling of the connected elements. The connection design must account for net section (area after hole deduction) in tension; shear capacity in bearing depends on bolt fu, hole geometry, and steel thickness.

## Key Provisions

| Bolt Grade | Nominal Fu (MPa) | Nominal Fy (MPa) | Min Pretension (kN) – M24 | Typical Application |
|---|---|---|---|---|
| A307 | 414 | 248 | None required | Loose bolts; bearing design; secondary work |
| A325 | 825 | 655 | 378 | Friction-grip primary connections; AISC standard |
| A490 | 1,035 | 860 | 480 | Heavy industrial; offshore; extreme loads |

**Minimum Edge Distance (AISC J3.2):**

| Bolt Diameter | Rolled/Sheared Edge (mm) | Flame-Cut Edge (mm) |
|---|---|---|
| M16 | 32 | 38 |
| M20 | 38 | 44 |
| M24 | 44 | 50 |
| M27 | 50 | 56 |

**Bolt Hole Types (AISC J3.3):**

| Hole Type | Diameter Clearance | Use Case | Advantage |
|---|---|---|---|
| Standard | d_bolt + 1.6 mm | Primary connections; friction grip | Tight fit; maximum clamping area |
| Oversized | d_bolt + 3.2 mm | Field assembly; retrofit | Faster driving; tolerates misalignment |
| Slotted (short) | d_bolt + 1.6 mm × 3 d_bolt | Buswork; load reversals | Allows minor rotation |
| Slotted (long) | d_bolt + 1.6 mm × (4 d_bolt to 6 d_bolt) | Seismic frames; thermal movement | Permits significant adjustment |

**Bolt Spacing & Clearance:**

| Parameter | Minimum Value | rationale |
|---|---|---|
| Pitch (bolt to bolt, along member) | 2.67 d_bolt | Tool access; tear-out prevention |
| Gage (bolt to bolt, across member) | 2.0 d_bolt | Standard practice; allows wrench swing |
| Edge distance (edge to bolt center) | Per J3.2 table | Prevents tearout and edge deformation |

**Pretension Verification Methods:**

| Method | Accuracy | Field Practicality | Notes |
|---|---|---|---|
| Turn-of-nut (calibrated wrench) | ±5% | Excellent | AISC standard; suits production bolting |
| Direct tension indicator (DTI) washer | ±10% | Good | Visual; colored dots indicate tension threshold |
| Ultrasonic measurement | ±3% | Limited | Lab or critical inspection only |

## Philippine Practice Context
Philippine projects increasingly adopt A325 high-strength bolts for fabricated and field-assembled connections to match international standards (ISO 4016, ISO 7089). The tropical salt-fog environment necessitates A325/A490 grade bolts with cadmium-plate or zinc-flake coatings to resist corrosion; loose A307 bolts are avoided because rust expansion causes preload loss. Minimum edge distances for rolled-edge steel must be respected in fabrication drawings; flame-cut edges (common in field repairs) require +6 mm buffer per AISC J3.2. Bolting crews are trained in turn-of-nut methods and DTI washers; ultrasonic verification is reserved for critical inspections on major infrastructure (LRT extensions, bridge projects).

## How It's Tested

**Pattern 1 — Bolt Grade and Pretension Recognition:**
"A primary moment connection in a high-rise building frame specifies A325 bolts. What is the minimum pretension (in kN) for an M24 bolt, and why is pretensioning mandatory?"
_Tests recall: A325 pretension ~378 kN per AISC J3.1. Pretensioning maintains friction grip, resisting slip until bearing is engaged._

**Pattern 2 — Edge Distance Verification:**
"A C-section channel is bolted to a gusset plate. The bolt diameter is M20, and the member has a rolled edge. What is the minimum distance from the bolt center to the edge of the channel?"
_Tests AISC J3.2 lookup: M20 rolled edge = 38 mm. Candidate must reference the table and explain that insufficient edge distance causes tearout._

**Pattern 3 — Hole Geometry and Spacing:**
"Five M24 bolts are arranged in a single line on a tension member. The spacing between adjacent bolts (pitch) is 60 mm. Is this acceptable? Calculate the required minimum pitch."
_Tests J3.3 spacing rule: minimum pitch = 2.67 d = 2.67 × 24 = 64 mm. 60 mm < 64 mm → non-compliant. Tearout risk._

[SLATECAMP_UI_BLOCK:ui_0001 component="Tip" status="preserved"]

## Related Articles

See also: **Steel Members** (lea-strc-008-01) for the members being connected, **Structural Design Capacity** (lea-strc-005-02) for connection capacity checks, and **ASD vs LRFD** (lea-strc-003-04) for the design method applied to bolts.

## Common Mistakes
[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]

[SLATECAMP_UI_BLOCK:ui_0002 component="WikiMistakeList" status="preserved"]