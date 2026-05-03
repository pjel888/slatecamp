# Site Planning Accessible Routes vs Open Space
## Learning Goal

After reading this article, you should be able to:

Reconcile the competing demands of accessible routes (BP 344 accessible path requirements: maximum slope 1:20, minimum width 1.20 m, passing spaces every 30 m) with open space and landscaping requirements under PD 1096 and local ordinances; calculate minimum accessible route length vs open space area; and identify when accessible routes may deviate from the shortest path.
---
### BP 344 × PD 1096 Interface: Fitting Accessibility into Required Yards, Courts & PSO

---

## REAL-WORLD HOOK

You are standing at the gate of a freshly staked commercial lot in Quezon City — 500 sq.m., 20 m wide front, 25 m deep. The sun hits the bare concrete lot line. Your client wants to push the building footprint to the maximum allowed by zoning. But the accessibility consultant just flagged: *there is no ramp to the entrance, no accessible parking, no dropped sidewalk at the RROW, and the front yard is a sheer 150 mm curb all the way across.* The Building Official will not sign off on the Occupancy Permit. Where do the ramp, the parking bay, and the curb cut go — and do any of them eat into your PSO? This module resolves that exact conflict.

---

## CORE MNEMONIC FRAMEWORK

### "**T-POTS-FLAB**" — The PSO Calculation Chain

| Letter | Term | What It Means |
|--------|------|---------------|
| **T** | **TLA** — Total Lot Area | Raw area in sq.m. from TCT/survey |
| **P** | **PSO** — Percentage of Site Occupancy | % of TLA the building footprint may cover |
| **O** | **TOSL** — Total Open Space on Lot | = TLA − Footprint; must ≥ (1 − PSO) × TLA |
| **T** | **TOSL components** | Required yards + courts + supplementary setbacks |
| **S** | **Setbacks** | Front, side, rear yards (mandatory open space) |
| **F** | **FLAR** — Floor-to-Lot Area Ratio | Controls total GFA, not just footprint |
| **L** | **AMBF** — Allowable Maximum Building Footprint | = TLA × PSO (converted to sq.m.) |
| **A** | **Actual footprint** | Must ≤ AMBF |
| **B** | **BHL** — Building Height Limit | Governs number of floors |

> **Memory cue:** *"The PSO chain goes T-POTS-FLAB — Total, Percentage, Open, Totals, Setbacks, FLAR, Limit, Actual, Building."*

---

## SECTION 1: PSO CALCULATION CHAIN IN FULL

### Step-by-Step Logic (PD 1096 Rule VIII)

```
Step 1:  Identify TLA (from lot title or survey plan)
Step 2:  Identify Zone + Occupancy → find allowable PSO %
Step 3:  AMBF = TLA × PSO  ← building footprint must stay within this
Step 4:  TOSL = TLA − AMBF  ← everything NOT building
Step 5:  Check TOSL ≥ sum of required yards (front + sides + rear) + courts
Step 6:  Apply FLAR limit → max GFA = TLA × FLAR
Step 7:  GFA / AMBF = number of floors (rough check before detailed stacking)
Step 8:  Apply BHL (zoning + CAAP height restrictions)
```

### PSO by Zone and Occupancy (PD 1096 Rule VIII, Table VIII.1)

| Zone | Occupancy Group | PSO (Max) | Implied Min TOSL |
|------|----------------|-----------|-----------------|
| R-1 (Low-density Res.) | Residential (Group A/B) | 50% | 50% |
| R-2 (Medium-density Res.) | Residential (Group A/B) | 60% | 40% |
| R-3 (High-density Res.) | Residential (Group B) | 70% | 30% |
| C-1 (Neighbourhood Comm.) | Commercial (Group E) | 70% | 30% |
| C-2 (Community Comm.) | Commercial (Group E) | 80% | 20% |
| C-3 (Regional Comm.) | Commercial (Group E) | 90% | 10% |
| I-1 (Light Industry) | Industrial (Group F) | 70% | 30% |
| I-2 (Medium Industry) | Industrial (Group F) | 80% | 20% |

[SLATECAMP_UI_BLOCK:ui_0001 component="Callout" status="preserved"]
Extracted summary:
- Props: variant="lea-watch", title="always check both."
- Text: PSO is a site coverage limit (footprint only). It is NOT the same as FLAR, which controls total floor area. A building with 60% PSO and 4 floors may have a FLAR of 2.4 — always check both.
[/SLATECAMP_UI_BLOCK]

---

## SECTION 2: REQUIRED YARDS AND COURTS

### Minimum Setbacks by Zone (PD 1096 Rule VIII, Section 804)

| Zone | Front Yard | Side Yard (each) | Rear Yard | Notes |
|------|-----------|-----------------|-----------|-------|
| R-1 | 4.50 m | 2.00 m | 2.00 m | Both sides required |
| R-2 | 4.50 m | 2.00 m | 2.00 m | Party wall allowed one side with BO approval |
| R-3 | 4.50 m | 2.00 m | 2.00 m | Corner lot: both exposed sides = front yard setback |
| C-1 | 4.50 m | — (0) | 2.00 m | No side yard required; rear 2.00 m |
| C-2 | 3.00 m | — (0) | 2.00 m | Reduced front setback for urban commercial |
| C-3 | None req'd | — (0) | — (0) | Subject to RROW reservation + BHL |

[SLATECAMP_UI_BLOCK:ui_0002 component="Callout" status="preserved"]
Extracted summary:
- Props: variant="lea-watch", title="Trap Leart"
- Text: "No side yard required" in commercial zones does NOT mean you can build party walls without fire-rating. The Fire Code still governs. BP 344 accessible route must still reach the entrance regardless of setback rules.
[/SLATECAMP_UI_BLOCK]

### Courts for Light and Ventilation (PD 1096 Rule VIII, Section 805)

| Court Type | Min Size | Served Floor Area | Notes |
|-----------|----------|-------------------|-------|
| Inner court (≤ 2 floors) | 3.00 × 3.00 m | Rooms facing it | Passageway min 1.20 m to street |
| Inner court (3–5 floors) | 5.00 × 5.00 m | Rooms facing it | Passageway min 1.20 m to street |
| Inner court (> 5 floors) | 10% of floor area | — | Passageway min 1.80 m |
| Outer court | ≥ half of required yard | Rooms facing it | Opens to street/yard |

---

## SECTION 3: WHERE ACCESSIBLE FEATURES LAND ON THE SITE

### The Golden Rule (BP 344 × PD 1096 Interface)

> **Accessible features placed in required yards, courts, or open space are PERMITTED — provided:**
> 1. They do not enclose space (i.e., no roof/walls creating habitable area)
> 2. They remain open to the sky or are open-sided structures
> 3. They serve circulation functions only
> 4. They do not reduce the usable open space below the required minimum

**What does NOT count toward building footprint (AMBF):**
- Open ramps (no roof, no walls)
- Curb ramps / dropped sidewalks at the property line
- Accessible parking bays (paved but uncovered)
- Tactile ground surface indicators (TGSI)
- Wheelchair turning areas (paved)

**What DOES count toward building footprint (AMBF):**
- A covered ramp with a permanent roof structure
- A carport over accessible parking
- An enclosed ramp lobby attached to the building
- Any roofed walkway connecting to the building entrance

[SLATECAMP_UI_BLOCK:ui_0003 component="Callout" status="preserved"]
Extracted summary:
- Props: variant="lea-watch", title="it may push the footprint over AMBF. Freestanding canopies may or may not count"
- Text: A canopy or porte-cochère over the accessible drop-off / accessible parking counts as building footprint if it is structurally attached to the building — it may push the footprint over AMBF. Freestanding canopies may or may not count depending on local BO interpretation; always verify.
[/SLATECAMP_UI_BLOCK]

---

## SECTION 4: ACCESSIBLE ROUTE THROUGH THE REQUIRED FRONT YARD

### The Geometry of Compliance

The typical sequence from **RROW → building entrance** follows this path:

```
RROW (public sidewalk)
    │
    ▼
[DROPPED SIDEWALK / CURB RAMP at property line]
    │  ← at grade with RROW, no raised curb across accessible path
    ▼
[FRONT YARD ACCESSIBLE PATH]
    │  ← min 1200 mm wide, level or slope ≤1:20 (5%), TGSI on both edges
    ▼
[ACCESSIBLE PARKING BAY]   ← 4000 mm wide + 1800 mm side aisle (BP 344)
    │  (may be in front yard — uncovered version stays within PSO)
    ▼
[RAMP if entrance is elevated]
    │  ← slope ≤1:12, width ≥1200 mm, handrails both sides
    ▼
[BUILDING ENTRANCE at grade with accessible path]
```

### Dropped Sidewalk / Curb Cut at Property Line

| Feature | BP 344 Requirement | Notes |
|---------|-------------------|-------|
| Width at RROW | Min 1200 mm | Flush with both sidewalk and lot paving |
| Slope (curb cut ramp) | Max 1:12 (8.3%) | Sides flared at 1:10 max |
| Cross-slope | Max 1:50 (2%) | Must drain without ponding |
| Detectable warning (TGSI) | Required at top of curb cut | Color contrasted, 300 mm deep strip |
| Location | At pedestrian crossing alignment | Must align with opposing curb cut |

### Key Dimensions for the Front Yard Accessible Route

| Element | Minimum Dimension | Standard |
|---------|-----------------|----------|
| Accessible path width | 1200 mm | BP 344 |
| Turning radius / turning space | 1500 × 1500 mm | BP 344 |
| Ramp width (clear) | 1200 mm | BP 344 |
| Ramp slope | ≤ 1:12 (8.3%) | BP 344 |
| Ramp landing at top/bottom | 1500 mm min (direction of travel) | BP 344 |
| Landing at direction change | 1500 × 1500 mm | BP 344 |
| Handrail height (ramp) | 700–900 mm AFF | BP 344 |
| Handrail extension beyond top/bottom | 300 mm horizontal | BP 344 |
| Cross-slope of accessible route | Max 1:50 (2%) | BP 344 |

---

## SECTION 5: ACCESSIBLE PARKING IN THE SITE

### Parking Stall Dimensions (BP 344)

| Type | Stall Width | Stall Length | Side Aisle | Total Width Needed |
|------|------------|-------------|-----------|-------------------|
| Standard parking | 2500 mm | 5000 mm | — | 2500 mm |
| Accessible parking (van/WC) | 4000 mm | 5000 mm | 1800 mm (marked) | 4000 mm stall + 1800 mm aisle shared |
| Accessible parking (alternate) | 3700 mm + 1800 mm aisle | 5000 mm | Shared with adjacent accessible stall | Min 2 stalls share 1 aisle |

[SLATECAMP_UI_BLOCK:ui_0004 component="Callout" status="preserved"]
Extracted summary:
- Props: variant="lea-watch", title="Trap Leart"
- Text: The 1800 mm aisle is an access aisle, not a traffic lane. It is part of the accessible stall system, not the drive aisle. Two adjacent accessible stalls may share ONE 1800 mm aisle between them.
[/SLATECAMP_UI_BLOCK]

### Required Number of Accessible Parking Spaces

| Total Parking Spaces | Min Accessible Spaces | Notes |
|---------------------|----------------------|-------|
| 1–25 | 1 | At least 1 always |
| 26–50 | 2 | |
| 51–75 | 3 | |
| 76–100 | 4 | |
| 101–150 | 5 | |
| 151–200 | 6 | |
| 201+ | 2% of total | Rounded up |

> Accessible parking must be on the **shortest accessible route** to the accessible entrance. Not just "somewhere in the lot."

### Accessible Parking Signage

| Sign | Height of Mounting | Standard |
|------|--------------------|----------|
| ISA post sign | 1800 mm to bottom of sign | BP 344 |
| Painted ISA on pavement | Min 1500 × 1500 mm | BP 344 |
| Reserved sign | "RESERVED FOR PWDs" + ISA | Both post + painted |

---

## SECTION 6: WORKED SITE PLAN EXAMPLE

### Problem Setup

> **Lot:** 20 m (front) × 25 m (deep) = **500 sq.m. TLA**
> **Zone:** C-2 (Community Commercial) → **PSO = 80%**, Front setback = 3.00 m, Rear setback = 2.00 m, No side setback required
> **Program:** 3-storey commercial building with accessible entrance at ground level

### Step 1 — Calculate AMBF and TOSL

```
AMBF  = 500 × 0.80 = 400 sq.m.  ← max building footprint
TOSL  = 500 − 400 = 100 sq.m.   ← minimum open space on lot
```

### Step 2 — Required Yard Areas

```
Front yard:  20 m wide × 3.00 m deep = 60 sq.m.
Rear yard:   20 m wide × 2.00 m deep = 40 sq.m.
Side yards:  None required (C-2)
──────────────────────────────────────────────────
Total required yard area: 100 sq.m.  ← exactly equals TOSL (tight!)
```

### Step 3 — Place Accessible Features in the Front Yard (60 sq.m.)

```
┌──────────────────────────────────────────────────────┐
│                 RROW / PUBLIC SIDEWALK               │
│         ← 20,000 mm lot frontage →                  │
├─────┬──────────────────────────────────────┬─────────┤ ← PROPERTY LINE
│     │  DROPPED SIDEWALK / CURB CUT         │         │
│     │  (1500 mm wide, flush with RROW)     │         │
│     │                                      │         │
│ 1.5m│  ACCESSIBLE PATH (1200 mm wide)      │         │
│ SET │  TGSI strips on edges                │  3000 mm│
│ BAC │                                      │  FRONT  │
│  K  │  ACCESSIBLE PARKING BAY              │  YARD   │
│     │  4000 mm wide × 5000 mm long         │         │
│     │  + 1800 mm ACCESS AISLE (shared)     │         │
│     │  [UNCOVERED → does NOT count as AMBF]│         │
│     │                                      │         │
│     │  RAMP (1200 mm wide × 1500 mm rise)  │         │
│     │  Slope 1:12, handrails both sides    │         │
│     │  Landing 1500×1500 at base and top   │         │
├─────┴──────────────────────────────────────┴─────────┤ ← BUILDING FACE
│                 BUILDING FOOTPRINT                   │
│              = 400 sq.m. (80% PSO)                   │
│              20 m × 20 m                             │
│                                                      │
├──────────────────────────────────────────────────────┤ ← REAR FACE
│                 REAR YARD (2.00 m)                   │
│              20 m × 2 m = 40 sq.m.                  │
└──────────────────────────────────────────────────────┘
```

### Step 4 — Verify PSO is Not Violated

| Item | Area | Counts toward Footprint? |
|------|------|--------------------------|
| Building footprint | 400 sq.m. | YES |
| Open ramp (no roof) | ~10 sq.m. | **NO** |
| Accessible parking bay (uncovered) | ~22 sq.m. | **NO** |
| Curb cut / dropped sidewalk | ~3 sq.m. | **NO** |
| **Effective building footprint** | **400 sq.m.** | = AMBF ✓ |
| **PSO check** | 400/500 = 80% | ✓ AT LIMIT |

[SLATECAMP_UI_BLOCK:ui_0005 component="LawCallout" status="preserved"]
Extracted summary:
- Props: code="bp344", title="because they are open, uncovered circulation features. The site is"
- Text: Conclusion: The accessible ramp, parking bay, and dropped sidewalk fit within the 3.00 m front yard and do not push the PSO over 80% — because they are open, uncovered circulation features. The site is BP 344 + PD 1096 compliant.
[/SLATECAMP_UI_BLOCK]

---

## SECTION 7: CONFLICT RESOLUTION TABLE

| Situation | PD 1096 Rule | BP 344 Rule | Resolution |
|-----------|-------------|-------------|------------|
| Ramp in required front yard | Yard must remain open / unbuilt | Ramp needed to reach entrance | Open ramp allowed — serves access, not habitable |
| Covered ramp (with roof) in front yard | Roofed area = footprint | Covered ramp acceptable | Count roof area toward AMBF; verify PSO not exceeded |
| Accessible parking in front setback | Open space; parking generally not in setback | Parking must be nearest to entrance | Check local zoning ord.; many LGUs allow parking in front yard of commercial lots |
| Curb cut across lot line | Property line must not encroach RROW | BP 344 requires flush connection | Curb cut within lot boundary, flush with RROW grade; no encroachment |
| Wide corridor for wheelchair (1200 mm) in court | Court minimum dimension fixed | Min 1200 mm accessible path required | Accessible path through court is allowed; must not reduce court area below minimum |
| Ramp replacing staircase as only means of egress | Ramps allowed as exit (Fire Code/PD 1096) | Ramps required for accessible egress | Ramp as exit permitted; must meet both BP 344 slope (1:12) AND Fire Code width |

---

## SECTION 8: COURTS AND ACCESSIBLE ROUTES

**Can an accessible route pass through an inner court?**

- **Yes**, but the accessible path (min 1200 mm wide) must fit within the court without reducing the court dimensions below the required minimum.
- The mandatory passageway from court to street (min 1200–1800 mm per PD 1096) can double as the accessible route **if it meets BP 344 width and slope requirements.**
- Passageway must be level or have a slope ≤ 1:20 to count as accessible without a ramp.

---

## REASON FOR THE LAW

> **Why must accessible features be allowed in required open spaces?**
>
[SLATECAMP_UI_BLOCK:ui_0006 component="LawCallout" status="preserved"]
Extracted summary:
- Props: code="bp344", title="often barely enough for the required yards. If every ramp, curb cut, and accessi"
- Text: Philippine lots are small. A 60% PSO rule leaves only 40% of the lot as open space — often barely enough for the required yards. If every ramp, curb cut, and accessible parking bay were counted as building footprint, developers would be mathematically forced to eliminate accessibility features to stay within PSO limits. The law recognizes that accessibility infrastructure is circulation, not construction — it occupies the ground plane but does not enclose habitable space. Requiring it to fit wit
[/SLATECAMP_UI_BLOCK]

---

## TRAP LEARTS (MASTER LIST)

> **🚨 TRAP 1 — PSO vs FLAR Confusion**
> PSO limits footprint. FLAR limits total floor area. A 70% PSO + FLAR 2.8 on a 1000 sq.m. lot = max footprint 700 sq.m. × 4 floors = 2800 sq.m. GFA. Don't confuse the two.

> **🚨 TRAP 2 — "No Setback" Does NOT Mean No Accessible Route**
> C-3 zones may have no required front yard. BP 344 still requires an accessible route from the RROW. The accessible entrance may be directly at the RROW level — but it must still be accessible (no step, level transition, TGSI at door threshold).

> **🚨 TRAP 3 — Accessible Parking Width**
> Exam distractors often list "3000 mm" or "3500 mm" as accessible parking stall width. The correct BP 344 standard is **4000 mm** stall + **1800 mm** side aisle. Never confuse with standard stall (2500 mm).

> **🚨 TRAP 4 — Ramp Landing at Property Line**
> The 1500 × 1500 mm landing at the base of the ramp must be entirely within the lot — it cannot encroach into the RROW. If the lot is deep enough, this is easy. On shallow lots, the ramp must be designed to land inside the lot boundary.

> **🚨 TRAP 5 — Courts vs Yards**
> Courts provide light/ventilation for interior rooms. Required yards are peripheral setbacks. Accessible paths can pass through either, but the path width must not shrink the court or yard below its minimum required dimension.

---

## ACTIVE RECALL DRILL

**Q1.** A 400 sq.m. lot in a C-2 zone has a PSO of 80%. What is the AMBF?
> **A:** 400 × 0.80 = **320 sq.m.**

**Q2.** Does an open (uncovered) accessible ramp in the front yard count toward building footprint?
> **A:** **No.** Open ramps serve circulation and do not enclose habitable space; they are classified as open space, not building footprint.

**Q3.** What is the minimum width of an accessible parking stall under BP 344?
> **A:** **4000 mm** stall width, plus a **1800 mm** access aisle.

**Q4.** A 5-storey building has an inner court. What is the minimum inner court size?
[SLATECAMP_UI_BLOCK:ui_0007 component="LawCallout" status="preserved"]
Extracted summary:
- Props: code="nbcp", title="5 floors (PD 1096 Rule VIII)."
- Text: A: 5.00 × 5.00 m for buildings 3–5 floors (PD 1096 Rule VIII).
[/SLATECAMP_UI_BLOCK]

**Q5.** What is the maximum slope of a curb ramp (dropped sidewalk) at the property line?
> **A:** **1:12 (8.3%)** for the ramp run; flanking sides max **1:10**; cross-slope max **1:50**.

**Q6.** A covered carport is built over the accessible parking bay. Does it count toward the AMBF?
> **A:** **Yes.** A permanent roofed structure — even over a parking bay — counts as building footprint and must be included in the PSO calculation.

**Q7.** What is the minimum accessible path width through a required yard or court?
[SLATECAMP_UI_BLOCK:ui_0008 component="LawCallout" status="preserved"]
Extracted summary:
- Props: code="bp344"
- Text: A: 1200 mm (BP 344 minimum passageway width).
[/SLATECAMP_UI_BLOCK]

**Q8.** In what zone is no front yard setback required under PD 1096?
[SLATECAMP_UI_BLOCK:ui_0009 component="LawCallout" status="preserved"]
Extracted summary:
- Props: code="bp344"
- Text: A: C-3 (Regional Commercial). However, BP 344 accessible entry requirements still apply.
[/SLATECAMP_UI_BLOCK]

**Q9.** A 500 sq.m. lot in R-3 zone has PSO = 70%. The required rear yard is 2.00 m, and both side yards are 2.00 m. The lot is 20 m × 25 m. Does the TOSL cover all required yards?
> **A:** AMBF = 500 × 0.70 = 350 sq.m. TOSL = 150 sq.m. Required yards: front (4.5 m × 20 m = 90 sq.m.) + rear (2 m × 20 m = 40 sq.m.) + 2 sides (2 × 2 m × 25 m = 100 sq.m.) = **230 sq.m.** TOSL (150) < required yards (230). **The PSO must be reduced further, or lot coverage recalculated** — this lot cannot fit all required setbacks at 70% PSO.

**Q10.** What is the minimum landing dimension at the top and bottom of a ramp?
[SLATECAMP_UI_BLOCK:ui_0010 component="LawCallout" status="preserved"]
Extracted summary:
- Props: code="bp344"
- Text: A: 1500 mm in the direction of travel (BP 344). At a change of direction, 1500 × 1500 mm.
[/SLATECAMP_UI_BLOCK]

---

## PROTÉGÉ EFFECT CHALLENGE

> **Your task:** Teach this concept to a first-year architecture student who believes that "every square meter of ramp takes away from the allowable building footprint."
>
> Without using this module, explain in 5 bullet points:
> 1. What PSO measures and what it does NOT measure
> 2. Why an open ramp is treated as open space, not building
> 3. How the curb cut at the property line connects to BP 344 requirements
> 4. Where, exactly on the site plan, accessible parking must be located
> 5. What changes if a canopy is added over the accessible route
>
> If you can explain all five clearly without notes, you understand this module. If you hesitate on any point, return to that section.

---

*Module 8 | BP 344 × PD 1096 Site Planning Interface | Philippine LEA Review Series*

---



---

## Exam Tip

ALE Swipe: Accessible route requirements: max slope 1:20, min width 1.20 m, passing spaces every 30 m (1.50 m × 1.50 m minimum). Open space minimum = 30% of lot area (PD 1096). When these conflict, the accessible route width requirement governs — you cannot reduce path width to meet open space minimums.

## Cross‑References

**Site Exterior Circulation**, **Wheelchair Maneuvering And Parking**, **Accessible Seating In Assembly Areas**, **Pd 1096 Rule Viii Setbacks And Easements**

