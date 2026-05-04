## What You Need to Know for the LEA

## Learning Goal

Distinguish Group C (theater with proscenium stage) from Group H (assembly without stage), calculate seating area at 0.9 sqm/seat, apply egress width at 7.6 mm/person, and verify compliance with stage minimum dimensions and accessibility standards.

|---

## Core Concept

[SLATECAMP_UI_BLOCK:ui_0001 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: The LEA frequently tests theater vs. assembly classification. The single deciding factor is the presence of a **fixed proscenium stage** — not seating capacity. A 1,200-seat concert hall WITH a fixed proscenium stage is still Group C (Theater), not Group H.
[/SLATECAMP_UI_BLOCK]

Theater and performance venue classification is a **critical LEA trap** per **ERR-DSGN-005**. The distinction hinges on the _presence of a stage_:

- **Group C (Theater with Proscenium Stage):** Traditional theaters, playhouses, and concert halls with a raised stage platform and backstage area. Typical capacities are 50–500 seats.
- **Group H (Large Assembly):** Stadiums, arenas, concert halls without a dedicated stage, amphitheaters, and sports complexes. Typical capacities are 500+ seats; these may have temporary or multi-purpose stages.

This classification difference is significant because Group C uses education/recreation egress standards, while Group H uses assembly egress standards with different occupant load calculations and larger exit aggregate widths. The LEA frequently presents mixed descriptions, requiring students to identify whether a venue is Group C (if a fixed proscenium stage exists) or Group H (if it features flexible staging).

[SLATECAMP_UI_BLOCK:ui_0002 component="KeyValues" status="preserved"]
Extracted summary:
- Props: items="{[\n  {label:\"Seating area per person\", value:\"0.9 sqm\"}", label=true, Minimum=true, proscenium=true, stage=true, value=true, m=true, Main=true, aisle=true, width=true, RA=true, minimum=true
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

### Space Program Standards

Below are the standards per **RA 9514** and theater design practice:

**Seating:**

- **Fixed theater seating:** 0.9 sqm per person, which includes seat and aisle allowance.
- **Row spacing (front-to-front):** 850–1,050 mm, with 900 mm being typical for comfort.
- **Aisle width:** **1.1 m minimum** per RA 9514 2019 IRR Division 10 Section 1005.

**Stage (Proscenium Theater):**

- **Minimum proscenium stage:** **9.0 m wide × 12.0 m deep**.
- **Backstage support:** 30–50% of the stage area, including wings, fly loft, and storage.
- **Dressing rooms:** 1 per 10 performers, with a minimum of 3 sqm per room.
- **Technical control:** 1.5–2.0% of total GFA for lighting and sound booths.

**Emergency Egress:**

- **Minimum exits:** 2 exits required from the seating area at any occupancy > 0 per RA 9514 Section 7.1.
- **Exit width aggregate:** Occupancy × 7.6 mm/person per RA 9514 2019 IRR assembly standards.
- **Travel distance:** 60 m if sprinklered or 45 m if unsprinklered.
- **Stairwell:** Maximum riser of 200 mm and minimum tread of 250 mm.

**Occupant Load Calculation:**

- **Seating area:** 0.9 sqm per person, which already accounts for seated occupancy and aisle circulation.
- **Stage/backstage:** Typically 1 per 25 sqm for technical crew.
- **Lobby/support:** 1 per 1.4 sqm per RA 9514 2019 IRR Division 3 Table 10.2.

---

## Key Provisions

### Occupancy Classification (Group C vs. Group H)

| Feature | Group C (Theater) | Group H (Assembly) |
|:------------------- |:----------------------------------------------------- |:---------------------------------------------------- |
| **Stage** | Fixed proscenium stage required | No stage OR multipurpose stage |
| **Typical Capacity** | 50–500 seats | 500–5,000+ seats |
| **Examples** | Playhouse, symphony hall | Arena, stadium, amphitheater |
| **Egress Rule** | 2 exits minimum | 2 exits minimum |
| **Exit Width Rate** | 7.6 mm/person | 7.6 mm/person |

### Seating Layout & Dimensions (RA 9514)

| Parameter | Requirement | Notes |
|:------------------- |:--------------------------------------- |:------------------------------------------------------- |
| Fixed seating area | 0.9 sqm per seat | Includes seat width + circulation |
| Row spacing | 850–1,050 mm | Typically 900 mm |
| Main aisle width | **1.1 m minimum** | Per RA 9514 Section 7.1 |
| Side/emergency aisle | **1.1 m minimum** | Must accommodate two-way traffic |

### Accessibility & Inclusion (BP 344)

- **Accessible seating:** Minimum 1 per 50 seats or 2% of total, whichever is greater.
- **Wheelchair space:** 1.5 m × 2.0 m per space, allowing for companion seating.
- **Accessible parking stall:** **3.7 m × 5.0 m** per BP 344 2024 Revised IRR.
- **Ramp gradient:** **1:20 maximum** per BP 344 2024 Revised IRR Part 2 Section 206.
[SLATECAMP_UI_BLOCK:ui_0003 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-dsgn-004-07-core-concept", type="image", caption="Theater Typology — Proscenium, Thrust, and Arena Stage Configurations", description="Comparison diagram of three theater stage types: proscenium (framed stage, 0.9 sqm/seat), thrust (stage extends into audience), and arena (surrounded). Shows stage minimum dimensions, seating angles, and egress requirements per RA 9514.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

---

## Philippine Practice Context

### Community Theater (Group C, 200 Seats)

- **Seating Area:** 200 seats × 0.9 sqm = **180 sqm**.
- **Stage:** 9.0 m × 12.0 m proscenium.
- **Emergency Egress:** 200 occupants require 1,520 mm aggregate exit width.
- **Parking:** 200 occupants ÷ 50 sqm/stall (assembly standard per PD 1096 Rule XIX Appendix A Table IX) ≈ **4 stalls minimum**.

### Concert Hall (Group C, 500 Seats)

- **Seating Area:** 500 seats × 0.9 sqm = **450 sqm**.
- **Occupant Load:** 500 (seats) + 8 (backstage) + 5 (lobby) = **513 occupants**.
- **Emergency Egress:** 513 occupants × 7.6 mm ≈ **3.9 m aggregate width**.
- **Parking:** 513 occupants ÷ 50 sqm/stall ≈ **10 spaces minimum**.

---

## How It's Tested

**Occupancy Classification Trap (Difficulty 0.7):**
"A concert hall has 1,200 seats and a flexible stage. What occupancy group applies?"

- **Answer:** If it has a fixed proscenium stage, it is **Group C**. If it has a multipurpose or no stage, it is **Group H**.

**Seating Occupancy Pattern (Difficulty 0.7):**
"A 250-seat theater allocates 0.9 sqm per seat. How much floor area is required for the seating area?"

- **Answer:** 250 × 0.9 sqm = **225 sqm minimum**.

**Egress Analysis Pattern (Difficulty 0.9):**
"A 400-seat theater has two 1.0 m wide exit doors. Verify compliance."

| **Answer:** Required width = 400 × 7.6 mm = 3,040 mm (3.04 m). Since 2.0 m is available, it is **NON-COMPLIANT**.

[SLATECAMP_UI_BLOCK:ui_0004 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: number="{1}", title="Group C vs Group H Trap", wrongValue="Use seating capacity alone to classify", correctValue="Check for a fixed proscenium stage — that's the deciding factor", explanation="A 200-seat community theater with a fixed stage is Group C. A 1,200-seat arena with flexible staging is Group H. The LEA often includes stage descriptions to test this distinction."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0005 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memory aid for stage minimums:** Think "9 × 12 = 108" — the minimum proscenium stage is 9.0 m wide × 12.0 m deep (108 sqm). For seating: 0.9 sqm per seat is roughly 1 sqm, making mental math fast under exam pressure.
[/SLATECAMP_UI_BLOCK]

---

**Exam Tip — ERR-DSGN-005:** The presence of a proscenium stage determines Group C vs Group H classification. Stadiums and arenas without fixed stages = Group H, regardless of seating capacity.
[SLATECAMP_UI_BLOCK:ui_0006 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-dsgn-004-07-core-concept", type="image", caption="Theater Seating and Egress — Sightlines, Row Spacing, and Exit Distribution", description="Theater seating plan showing: minimum row spacing (850mm), seat width (500-550mm), sightline angles (max 30° to top of stage), and exit distribution at 7.6 mm/person. Proscenium stage minimum dimensions and BP 344 accessible seating zones shown.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

## Cross-References

See **LEA-DSGN-005-10** (Multi-Purpose Halls) for Group C vs Group H distinction, **LEA-DSGN-008-01** (Fire Egress) for seating egress calculations, and **LEA-DSGN-007-08** (Human Factors) for sightline standards.

## Common Mistakes

---