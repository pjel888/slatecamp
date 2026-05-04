# Commercial Clearances
## Learning Goal

After reading this article, you should be able to:

Calculate minimum commercial clearances — aisle width by occupant load, counter clearance, queuing space, and service counter accessibility — under PD 1096 and BP 344; apply egress width requirements for mercantile, business, and assembly occupancies; and determine minimum unobstructed width for retail display areas and service counters.

### LEA Board Exam Dual-Context Study Resource — US (IBC/ADA) vs. Philippine (PD 1096 / RA 9514 / BP 344)

---

## Section 1: Accuracy Audit

> The original draft contained several factual errors and misconceptions that could cost you points on the board exam. Each is flagged and corrected below.

### Confirmed Errors in the Original Draft

- **CRITICAL — Unit Conversion Error (Original Line 59 & Q1 Answer):**
  The original states _"91 cm = 915 mm"_ and repeats this in the Active Recall Drill answer (Q1). This is **wrong**.
  - **Correct conversion:** 91 cm = **910 mm** (1 cm = 10 mm; 91 × 10 = 910).
  - 915 mm = 91.5 cm. This is a completely different dimension.
  - On LEA, a unit conversion error like this directly invalidates a calculation answer.

- **MISLEADING — Retail Aisle Threshold: ">60 seats" vs. ">50 seats" (Original Lines 31, 56, 65):**
  The original inconsistently uses both ">50 seats" (in the Hard Data table, Line 31) and ">60 seats" (in LEA Exam Traps, Line 56, and Active Recall, Line 65).
  - **Verified threshold per RA 9514 RIRR (2019), Rule 8:** The aisle width scaling is referenced from the Fire Code's means-of-egress provisions and assembly/mercantile occupancy aisle requirements. The foundational seating threshold in Philippine fire code practice (aligned with NFPA 101 provisions adopted by RA 9514) uses **50 seats** as the key threshold — consistent with Line 31 of the original.
  - The ">60 seats" figure appearing in Lines 56 and 65 is **inconsistent with the code reference** used in the same document. The correct, consistent threshold is **>50 seats**.
  - **Fix:** All references standardized to **>50 seats** throughout.

- **OVERSTATED — DENR DAO 2003-30 Relevance to Office Workstations (Original Lines 15, 21, 57, 77):**
  The original claims EIS is triggered by ">1,000 sqm" offices and frames this as a _workstation_ design issue. This is **misleading on two counts:**
  1. **DAO 2003-30 covers Environmentally Critical Projects (ECPs):** These are heavy industries, resource extractive industries, major infrastructure, and golf courses — **not standard commercial office buildings**. A regular office building (including one >1,000 sqm) does NOT automatically trigger an EIS.
  2. If a commercial building is located in an Environmentally Critical Area (ECA), it falls under Group II NECP and may require an IEE or IEE Checklist — but this is still **not an EIS**, and it is NOT triggered by workstation dimensions.
  - **Fix:** Remove the implied link between workstation design and EIS. The correct framing is: PD 1096 governs occupancy loads and general clearances; DENR DAO 2003-30 governs major industrial/infrastructure environmental impact, not typical commercial interiors.

- **IMPRECISE — PD 1096 Table 602-A "Min Aisle 1.12m" (Original Lines 21, 40):**
  The claim that PD 1096 Table 602-A mandates a 1.12 m minimum aisle for Business Occupancy office areas requires contextual precision.
  - **Verified from research data:** 1.12 m (1120 mm) is cited as the minimum corridor width for **business/office occupancy** under PD 1096. This is consistent with RA 9514's egress corridor requirement for hospitals (1120 mm door) and matches the Fire Code's industrial corridor minimum.
  - **The nuance:** 1.12 m is an egress/exit corridor minimum, not necessarily a workstation circulation aisle minimum (which is an ergonomic/design standard, not directly codified). Make this distinction clear.

- **WRONG PERCENTAGE — ADA Accessible Dining Tables (Original Lines 36, 52, 58):**
  The original states 10% accessible tables (BP 344), but never compares this to US ADA standards.
  - **US ADA 2010, Section 226.1:** At least **5%** of seating spaces shall comply with Section 902 (accessible dining surfaces).
  - **BP 344 IRR (Amended):** At least **10%** of tables must be accessible.
  - These are **different percentages** between jurisdictions — a critical distinction for LEA questions that test US vs. PH code selection. The original fails to flag this cross-context discrepancy.

- **INCOMPLETE — The "Average Person" Fallacy:**
  The original makes no mention of the fundamental anthropometric design principle: **never design for the "average" person**. Commercial spaces must accommodate a range of users (typically the 5th–95th percentile), and Filipino anthropometric data differs significantly from the US data that underlies many international standards. This omission weakens the ergonomic foundation of the article.

- **MISSING — Cross-Cultural Anthropometric Comparison:**
  The original uses Philippine code dimensions (BP 344 knee clearance: 700 mm H) and US code dimensions (ADA knee clearance: 27" / 685 mm H) without explaining _why_ they differ — i.e., that Filipino users are shorter on average (PH male mean stature: 167.0 cm vs. US male mean: 175.5 cm), which affects seated dimensions and table height standards.

---

## Section 2: The Revised Educational Article

### The Scenario That Makes This Real

You're the architect of a mixed-use building in BGC: tech company offices on floors 3–8, a retail marketplace on the ground floor, and a restaurant on the second floor. During plan review, the building official flags three separate violations — one per floor. **All three come down to clearances.**

A security guard cannot wheel his injured colleague through a retail aisle. A wheelchair user cannot get her knees under a dining table. An office corridor is too narrow to evacuate 80 employees in under 4 minutes. You knew the measurements. But did you know _which code_ applies to each space, and _why_ the dimensions are what they are?

**That is what this module answers.**

---

### Core Framework: The "ORD" System

[SLATECAMP_UI_BLOCK:ui_0001 component="LawCallout" status="preserved"]
Extracted summary:
- Props: code="pd1096", section="Rule VII - Commercial Clearances"
- Text: O-R-D = Office / Retail / Dining — the three commercial clearance domains.
[/SLATECAMP_UI_BLOCK]

| Domain | PH Governing Law | US Governing Standard | Core Design Rule |
|--------|-----------------|----------------------|-----------------|
| **Office (O)** | PD 1096, Table 602-A | IBC / OSHA 1910.37 | Min egress corridor = **1.12 m** (PH) / **44 in / 111.8 cm** (US) |
| **Retail (R)** | RA 9514 RIRR (2019), Rule 8 | IBC §1030 / NFPA 101 | Aisle scales with seat count: **76 → 91 → 122 cm** |
| **Dining (D)** | BP 344 IRR (Amended), Sec. 7 | ADA 2010, §226 + §902 | **10% tables** (PH) / **5% seating spaces** (US) accessible |

---

### Part A: The Anthropometric Foundation — Why Filipino Bodies Change the Math

> 🛑 **Stop & Think:** If an American code says a knee clearance of **27 inches (685 mm)** is sufficient, can the Philippines simply adopt that dimension? Or does the difference in body size matter?

The answer is nuanced — and critical for the exam.

#### The "Average Person" Fallacy

**Never design for the average.** The 50th-percentile male Filipino worker stands **167.0 cm** tall — but your building must serve both the 5th-percentile female (143.0 cm) and the 95th-percentile male (178.0 cm). A single "average" dimension fails both extremes.

Design rule: Use the **5th percentile for reach** (can the shortest person access it?) and the **95th percentile for clearance** (can the largest person fit through?).

#### Key Cross-Cultural Anthropometric Differences (Filipino vs. US)

Data sources: Del Prado-Lu (2007) for Filipino manufacturing workers (n=1,805); NC State Ergonomics Center / NHANES-ANSUR for US population.

| Dimension | PH male 95th% | US male 95th% | Gap | Design Impact |
|-----------|--------------|--------------|-----|--------------|
| Standing Height (Stature) | 178.0 cm | 186.7 cm | **−8.7 cm** | US door/ceiling clearances are generous for Filipinos |
| Eye Height (Standing) | 166.0 cm | 174.3 cm | **−8.3 cm** | Signage & display heights can be slightly lower in PH |
| Sitting Height | 92.0 cm | 97.2 cm | **−5.2 cm** | Overhead clearances in seated workstations differ |
| Popliteal Height (Seat-to-Floor) | 47.0 cm | 47.6 cm | **≈0** | Chair seat height: very similar between populations |
| Knee Height (Sitting) | 55.9 cm | 61.6 cm | **−5.7 cm** | Filipino users need _less_ knee clearance than US standards assume |

[SLATECAMP_UI_BLOCK:ui_0002 component="LawCallout" status="preserved"]
Extracted summary:
- Props: code="bp344"
- Text: 🛑 Stop & Think: If Filipinos have a smaller sitting knee height (PH 95th% mlea = 55.9 cm vs. US = 61.6 cm), why does BP 344 set knee clearance at 700 mm H while ADA sets it at 27 inches (685 mm) H? Which is _more generous_?
[/SLATECAMP_UI_BLOCK]

**Answer:** BP 344's 700 mm (70 cm) is _slightly more generous_ in height than ADA's 685 mm, despite Filipino users being shorter. This is because BP 344 is designed to accommodate **wheelchair users** whose knee height (with footrests) may differ from ambulatory users, and because the Philippine standard takes a conservative approach to clearance. The key design implication: when building for mixed Filipino and international users, default to the _more restrictive_ (larger clearance) dimension.

**Practical implication for BP 344 compliance:** A Filipino user at the 95th percentile male knee height of 55.9 cm (559 mm) has ample clearance under a 700 mm H table. A wheelchair user may require the full 700 mm. Design to the **wheelchair user's needs**, not the ambulatory majority.

---

### Part B: Office Workstations — PD 1096 vs. IBC/OSHA

#### The Philippine Standard

PD 1096 (National Building Code) governs commercial/office occupancy through its classification of **Business Occupancy**. The key spatial requirement is:

- **Minimum egress corridor/aisle width (Business Occupancy): 1.12 m (1,120 mm / ~44 in)**
  — per PD 1096 provisions consistent with RA 9514 egress requirements for business-type occupancies.

This is an **egress requirement**, not a workstation dimension code. PD 1096 does not specify individual workstation dimensions such as desk height, monitor distance, or task chair height — those are governed by ergonomic best practices (DOLE guidelines, OSHS standards) rather than the building code.

> **DENR DAO 2003-30 Clarification:** This administrative order governs Environmental Impact Statements (EIS) for **Environmentally Critical Projects** — heavy industries, major infrastructure, mining, and large reclamation projects. A commercial office building **does not trigger an EIS** under DAO 2003-30, regardless of floor area. Ordinary commercial buildings may need an Environmental Compliance Certificate (ECC) only if located in an Environmentally Critical Area (ECA), and even then typically require an Initial Environmental Examination (IEE), not a full EIS. **Do not link DAO 2003-30 to office workstation design in LEA answers.**

#### The US Standard

- **IBC §1005 / OSHA 1910.37:** Minimum egress corridor = **44 inches (111.8 cm / 1,118 mm)** for commercial occupancies.
- **ADA 2010:** Minimum accessible route width = **36 inches (914 mm)**; passing spaces (for two wheelchair users) = **60 inches (1,524 mm)**.
- **Workstation ergonomics (US):** Governed by OSHA ergonomic guidelines and ANSI/HFES 100 — desk height typically **29–30 inches (73.7–76.2 cm)**; adjustable sit-stand desks recommended.

#### US vs. PH Office Clearance Comparison

| Parameter | US Standard | PH Standard |
|-----------|------------|------------|
| Min egress corridor (commercial) | **44 in / 111.8 cm** (IBC) | **1.12 m / 112 cm** (PD 1096) |
| Accessible route min | **36 in / 91.4 cm** (ADA) | **90 cm / 900 mm** (BP 344) |
| Standard desk height | **29–30 in / 73.7–76.2 cm** (ANSI) | **72–75 cm** (metric ergonomic best practice) |
| Workstation code authority | IBC + OSHA + ANSI/HFES 100 | PD 1096 (spatial) + DOLE OSHS (health/safety) |

> 🛑 **Stop & Think:** A client asks you to design a 500 sqm office in Makati. They insist on 90 cm corridors to maximize rentable area. Which Philippine code provision do you cite when you tell them the minimum is 1.12 m?

**Answer:** PD 1096, Business Occupancy egress corridor requirements. You would cite the applicable table or provision for Business Occupancy under the National Building Code and RA 9514 means-of-egress provisions.

---

### Part C: Retail Aisle Widths — RA 9514 vs. IBC

[SLATECAMP_UI_BLOCK:ui_0003 component="Callout" status="preserved"]
Extracted summary:
- Props: variant="tip", title="Mnemonic"
- Text: "Seven–Nine–One-Two" = 76 cm → 91 cm → 122 cm Think of it as a runway widening as the crowd grows: small crowd, small runway; big crowd, wide runway.
[/SLATECAMP_UI_BLOCK]

#### The Philippine Standard: RA 9514 RIRR (2019), Rule 8

The Fire Code of the Philippines (RA 9514) and its 2019 Revised Implementing Rules and Regulations (RIRR) govern aisle widths in retail/assembly occupancies through means-of-egress provisions. The core retail aisle progression:

| Condition | Min Aisle Width | Imperial equivalent |
|-----------|----------------|--------------------:|
| Base / ≤50 seats, one side | **76 cm (760 mm)** | ~30 in |
| >50 seats, one side | **91 cm (910 mm)** | ~36 in |
| >50 seats, both sides | **122 cm (1,220 mm)** | ~48 in |
| Additional per linear meter toward exits | **+2.5 cm (25 mm)** per meter | +1 in/m |

> **Unit conversion drill:** 91 cm = **910 mm** (NOT 915 mm — that was the original draft's error). Commit this: 91 × 10 = 910.

> 🛑 **Stop & Think:** A café has 80 fixed seats arranged on one side of a central aisle, with 12 meters of aisle leading to the exit. What is the minimum aisle width?

**Step-by-step:**
1. Seats > 50, one side → **base = 91 cm**
2. Length adjustment: 12 m × 2.5 cm = **30 cm**
3. **Total minimum = 91 + 30 = 121 cm**
4. Because both-sides threshold (122 cm) applies for aisles with seating on both sides, and this scenario is one side, 121 cm is the calculated minimum.

[SLATECAMP_UI_BLOCK:ui_0004 component="Note" status="preserved"]
Extracted summary:
- Props: (none)
- Text: Exam note: Always state your threshold and show the calculation. Partial credit often depends on methodology.
[/SLATECAMP_UI_BLOCK]

#### The US Standard: IBC §1030 / NFPA 101

The IBC governs assembly occupancy aisle widths through Section 1030 (Egress from Assembly Occupancies):

| Condition | Min Aisle Width | Metric equivalent |
|-----------|----------------|------------------:|
| Stepped aisles, seating both sides | **48 in (121.9 cm)** | 1,219 mm |
| Stepped aisles, seating one side | **36 in (91.4 cm)** | 914 mm |
| Level/ramped, seating both sides | **42 in (106.7 cm)** | 1,067 mm |
| Level/ramped, seating one side | **36 in (91.4 cm)** | 914 mm |
| Exception: &lt;50 seats | **36 in (91.4 cm)** | 914 mm |
| Exception: &lt;15 seats | **30 in (76.2 cm)** | 762 mm |

[SLATECAMP_UI_BLOCK:ui_0005 component="LawCallout" status="preserved"]
Extracted summary:
- Props: code="ra9514", title="RA 9514's RIRR draws heavily from NFPA 101 and IBC frameworks."
- Text: Key insight: The IBC's _stepped-aisle, both-sides_ minimum of 48 in (122 cm) closely mirrors PH's 122 cm both-sides retail aisle requirement. This is not coincidence — RA 9514's RIRR draws heavily from NFPA 101 and IBC frameworks.
[/SLATECAMP_UI_BLOCK]

#### US vs. PH Retail Aisle Comparison

| Context | Standard | ≤50 Seats | >50 Seats (one side) | >50 Seats (both sides) |
|---------|----------|-----------|---------------------|----------------------|
| **PH** | RA 9514 RIRR Rule 8 | 76 cm / 760 mm | **91 cm / 910 mm** | **122 cm / 1,220 mm** |
| **US** | IBC §1030 / NFPA 101 | 36 in / 91.4 cm (or 30 in for &lt;15 seats) | 36 in / 91.4 cm | 42–48 in / 107–122 cm |

[SLATECAMP_UI_BLOCK:ui_0006 component="Note" status="preserved"]
Extracted summary:
- Props: (none)
- Text: Anthropometric note: RA 9514's 76 cm base aisle accommodates a Filipino mlea at the 95th percentile shoulder breadth of 49.4 cm passing another person at 95th percentile (49.4 cm) — combined = ~99 cm. The 76 cm base is for _single-file flow_ (one side of aisle with no opposing pedestrian traffic). The 122 cm both-sides dimension enables two-way flow with slight lateral clearance.
[/SLATECAMP_UI_BLOCK]

---

### Part D: Dining Tables & Accessible Seating — BP 344 vs. ADA

This is the domain where US and Philippine codes **diverge most significantly** — both in percentage requirements and exact dimensions. Know both cold.

#### The Philippine Standard: BP 344 IRR (Amended), Section 7

BP 344 (Accessibility Law of the Philippines) and its amended IRR mandate:

- **Percentage of accessible tables: At least 10%** of all dining tables must be accessible.
- **Table height: 750 mm** (75 cm) above finished floor.
- **Knee clearance:**
  - Height: **700 mm** (70 cm) minimum
  - Depth: **480 mm** (48 cm) minimum
  - Width: **800 mm** (80 cm) minimum
- **Approach/circulation path width to accessible tables: 900 mm** (90 cm) minimum clear width.
- **Restaurant/dining circulation path: 1,500 mm** (150 cm) minimum (per 2024 updated IRR provisions).

[SLATECAMP_UI_BLOCK:ui_0007 component="Callout" status="preserved"]
Extracted summary:
- Props: variant="tip", title="Mnemonic"
- Text: "7-8-4-8" → **7**00 mm H / **8**00 mm W / **4**80 mm D / table at **7**50 mm → "Seven-Eight, Four-Eight, Seven-Fifty"
[/SLATECAMP_UI_BLOCK]

#### The US Standard: ADA 2010, §226 + §902

ADA 2010, Section 226.1:
- **Percentage of accessible seating spaces: At least 5%** of all seating spaces (and standing spaces) at dining surfaces.
- **Dispersion requirement (§226.2):** Accessible seating must be dispersed throughout the facility.

ADA 2010, Section 902 (technical requirements for accessible dining surfaces):
- **Table/surface height: 28–34 inches (710–865 mm)** above finished floor.
- **Knee clearance (§306.3):**
  - Height: **27 inches (685 mm)** minimum
  - Width: **30 inches (760 mm)** minimum
  - Depth: **19 inches (483 mm)** minimum at the 27-inch height level
- **ADA accessible counter max height: 34 inches (864 mm)**

[SLATECAMP_UI_BLOCK:ui_0008 component="Callout" status="preserved"]
Extracted summary:
- Props: variant="tip", title="Mnemonic"
- Text: The ADA knee clearance mnemonic: "27-30-19" (Height-Width-Depth in inches). Note the depth of 19 in = 483 mm (not 480 mm — a slight variance from BP 344's 480 mm, but essentially equivleant).
[/SLATECAMP_UI_BLOCK]

#### US (ADA) vs. PH (BP 344) Dining Comparison

| Parameter | US: ADA 2010 §226/§902 | PH: BP 344 IRR Sec. 7 |
|-----------|----------------------|----------------------|
| % Accessible seating required | **5%** of seating/standing spaces | **10%** of tables |
| Table surface height | **28–34 in / 710–865 mm** | **750 mm** (fixed) |
| Knee clearance height | **27 in / 685 mm** | **700 mm** |
| Knee clearance width | **30 in / 760 mm** | **800 mm** |
| Knee clearance depth | **19 in / 483 mm** | **480 mm** |
| Approach/aisle width | **36 in / 914 mm** (accessible route) | **900 mm** (approach to table) |
| Circulation path (dining) | **36 in / 914 mm** min accessible route | **1,500 mm** (restaurant circulation) |

[SLATECAMP_UI_BLOCK:ui_0009 component="LawCallout" status="preserved"]
Extracted summary:
- Props: code="bp344"
- Text: 🛑 Stop & Think: A restaurant has 40 dining tables in the Philippines. How many must be accessible per BP 344? How many would be required if the same restaurant operated in the US under ADA?
[/SLATECAMP_UI_BLOCK]

**PH (BP 344):** 40 × 10% = **4 tables** minimum accessible.
**US (ADA §226.1):** At least 5% of _seating spaces_ (not tables). If each table seats 4: 40 × 4 = 160 seats → 5% = **8 seating spaces minimum** (can be at 2 tables if each has 4 accessible seats, or dispersed).

[SLATECAMP_UI_BLOCK:ui_0010 component="LawCallout" status="preserved"]
Extracted summary:
- Props: code="bp344"
- Text: Critical LEA trap: The question may give you tables OR seats. BP 344 is table-based (10%); ADA is seating-space-based (5%). Using the wrong percentage or unit for the wrong code is a full-point deduction.
[/SLATECAMP_UI_BLOCK]

#### Why Filipino Anthropometrics Affect Dining Table Design

Filipino users at the 5th percentile female have a knee height (sitting) of **42.2 cm (422 mm)** — well below BP 344's 700 mm knee clearance. This means BP 344's clearance is sufficient for essentially all Filipino users. However, wheelchair users (whose footrest height and thigh clearance requirements drive the dimension) require the full 700 mm. The code is designed for the **wheelchair user's envelope**, not the ambulatory Filipino.

The 750 mm table height is slightly lower than the ADA's upper limit of 865 mm, reflecting a slight accommodation for shorter Filipino stature — the seated elbow rest height for Filipino males is approximately 22.2 cm above seat height. With a seat at ~45 cm, elbow height ≈ 67 cm — placing the optimal work surface at ~72–75 cm, very close to BP 344's 750 mm.

---

## Section 3: Board Prep Cheat Sheet

### Master Reference Table: US IBC/ADA vs. PH Code

| Dimension / Requirement | **US Standard** | **PH Standard** | Source |
|------------------------|----------------|----------------|--------|
| **Office/Egress Corridor Min** | 44 in / **111.8 cm** | **1.12 m / 112 cm** | IBC / PD 1096 |
| **Accessible Route Min** | 36 in / **91.4 cm** | **90 cm / 900 mm** | ADA / BP 344 |
| **Retail Aisle: ≤50 seats** | 30–36 in / **76–91 cm** | **76 cm / 760 mm** | IBC §1030 / RA 9514 R8 |
| **Retail Aisle: >50 seats, one side** | 36 in / **91.4 cm** | **91 cm / 910 mm** | IBC §1030 / RA 9514 R8 |
| **Retail Aisle: >50 seats, both sides** | 42–48 in / **107–122 cm** | **122 cm / 1,220 mm** | IBC §1030 / RA 9514 R8 |
| **Aisle length increment** | Varies by IBC calc | **+2.5 cm/m** toward exit | RA 9514 |
| **% Accessible dining seating** | **5%** seating spaces | **10%** of tables | ADA §226 / BP 344 Sec. 7 |
| **Dining table height** | 28–34 in / **710–865 mm** | **750 mm** | ADA §902 / BP 344 |
| **Knee clearance: Height** | 27 in / **685 mm** | **700 mm** | ADA §306 / BP 344 |
| **Knee clearance: Width** | 30 in / **760 mm** | **800 mm** | ADA §306 / BP 344 |
| **Knee clearance: Depth** | 19 in / **483 mm** | **480 mm** | ADA §306 / BP 344 |
| **Accessible counter max height** | 34 in / **864 mm** | **750 mm** (service) | ADA §904 / BP 344 |
| **Standard desk height** | 29–30 in / **73.7–76.2 cm** | **72–75 cm** | ANSI/HFES / Metric ergonomic practice |
| **EIS trigger for offices** | NEPA process (major federal projects) | **NOT triggered** for standard offices | DENR DAO 2003-30 |

---

### Critical Numbers to Memorize (Philippine Context)

| Code | Key Number | What It Means |
|------|-----------|--------------|
| RA 9514, Rule 8 | **76 cm** | Base retail aisle (≤50 seats) |
| RA 9514, Rule 8 | **91 cm (= 910 mm)** | Retail aisle >50 seats, one side |
| RA 9514, Rule 8 | **122 cm** | Retail aisle >50 seats, both sides |
| RA 9514, Rule 8 | **+2.5 cm/m** | Aisle width increment toward exits |
| BP 344, Sec. 7 | **10%** | Tables accessible in dining areas |
| BP 344, Sec. 7 | **750 mm** | Dining table height |
| BP 344, Sec. 7 | **700 mm H** | Knee clearance height |
| BP 344, Sec. 7 | **800 mm W** | Knee clearance width |
| BP 344, Sec. 7 | **480 mm D** | Knee clearance depth |
| BP 344, Sec. 7 | **900 mm** | Approach width to accessible tables |
| PD 1096, Table 602-A | **1.12 m** | Min egress aisle, business occupancy |

---

### Mnemonics

**Mnemonic 1 — Retail Aisle Progression: "Seven-Nine-Twelve, Add Two-Point-Five"**
- **7**6 cm (≤50 seats, one side)
- **9**1 cm (>50 seats, one side) — remember: 91 cm = 910 mm, not 915!
- **12**2 cm (>50 seats, both sides)
- **+2.5 cm** per meter of aisle length toward exits

Visualize a funnel: as the crowd (and aisle length) increases, the exit funnel widens. Small crowd → 76. Big crowd one side → 91. Both sides feeding → 122.

**Mnemonic 2 — BP 344 Dining Knee Clearance: "Seven-Eight, Four-Eight, Seven-Fifty"**
- **700** mm H (seven hundred)
- **800** mm W (eight hundred)
- **480** mm D (four-eighty)
- **750** mm table height (seven-fifty)

**Mnemonic 3 — US vs. PH Accessible Dining %: "ADA is Half of BP"**
- ADA = **5%** seating spaces
- BP 344 = **10%** tables (double the ADA percentage)
- "The Philippines requires _twice_ the accessible dining commitment of the US."

**Mnemonic 4 — ORD Framework:**
- **O**ffice → **O**ut the door (egress corridor: 1.12 m PH / 44 in US)
- **R**etail → **R**amp it up (76 → 91 → 122 cm as seats increase)
- **D**ining → **D**ouble (10% PH vs 5% US accessible tables)

---

## Section 4: Knowledge Check — MCQ Board Exam Simulator

> Instructions: Select the single best answer. No looking ahead. Time yourself — LEA gives approximately 90 seconds per question.

---

### Question 1

**A fire safety inspector is reviewing plans for a ground-floor restaurant in Quezon City with 65 fixed seats arranged on both sides of a single central aisle. The aisle runs 8 meters from the farthest seat to the nearest exit. What is the minimum required aisle width under RA 9514 RIRR (2019), Rule 8?**

A) 76 cm
B) 91 cm
C) 122 cm
D) 142 cm

**Answer: D — 142 cm**

**Rationale:**
- Step 1: Seats > 50, on **both sides** → base width = **122 cm**
- Step 2: Length adjustment = 8 m × 2.5 cm/m = **20 cm**
- Step 3: Total = 122 + 20 = **142 cm**

**Trap avoided:** Option B (91 cm) applies to >50 seats on ONE side only. Option C (122 cm) ignores the length increment. Option A (76 cm) is the base for ≤50 seats. The both-sides + length-increment combo is the most commonly missed calculation on LEA.

---

### Question 2

**An architect in Manila is designing an accessible dining area per BP 344 IRR. The restaurant has 30 dining tables. Which of the following correctly describes the minimum BP 344 compliance requirements?**

A) 2 tables accessible; knee clearance 685 mm H × 760 mm W × 480 mm D; table height 750 mm
B) 3 tables accessible; knee clearance 700 mm H × 800 mm W × 480 mm D; table height 750 mm
C) 2 tables accessible; knee clearance 700 mm H × 800 mm W × 480 mm D; table height 720 mm
D) 2 tables accessible; knee clearance 700 mm H × 800 mm W × 480 mm D; table height 750 mm

**Answer: B — 3 tables accessible; knee clearance 700 mm H × 800 mm W × 480 mm D; table height 750 mm**

**Rationale:**
- BP 344 requires **10%** of tables accessible: 30 × 10% = **3 tables** (not 2 — a partial or rounded-down answer fails compliance).
- Knee clearance per BP 344 Sec. 7: **700 mm H × 800 mm W × 480 mm D** (Option A's 685 mm H is the ADA dimension, not BP 344).
- Table height per BP 344: **750 mm** (not 720 mm).

**Trap avoided:** Option A uses ADA dimensions (685 mm = 27 inches) — this is the US standard. The LEA tests Philippine codes unless explicitly stated otherwise. Option D gets the dimensions right but uses 2 tables (10% of 30 = 3, not 2).

---

### Question 3 — US vs. PH Standard Selection

**An international hotel chain is opening two identically sized restaurants — one in New York City (USA) and one in Makati City (Philippines) — each with 200 dining seats arranged at 50 four-seat tables. A consultant advises that "both locations require 5 accessible tables each." Is this advice correct, and which jurisdiction requires more accessible seating?**

A) Correct — both ADA and BP 344 require 5% of tables, so 5 accessible tables per location.
B) Incorrect — ADA requires 5% of seating _spaces_ (~10 seats), while BP 344 requires 10% of tables (5 tables); both locations effectively require 5 tables but for different reasons.
C) Incorrect — ADA requires at least 5% of seating spaces (~10 spaces), while BP 344 requires 10% of tables (5 tables); the Philippines requires more accessible tables.
D) Incorrect — ADA requires 10% of seating spaces (~20 spaces), while BP 344 requires 5% of tables (3 tables); the US requires more.

**Answer: C**

**Rationale:**
- **US/ADA (§226.1):** At least **5% of seating spaces** must be accessible. With 200 seats: 5% = **10 seating spaces** minimum. With 4 seats per table, this could be satisfied with as few as 3 tables (12 accessible seats > 10 minimum), but the requirement is seats/spaces, not tables.
- **PH/BP 344 (Sec. 7):** At least **10% of tables** must be accessible. With 50 tables: 10% = **5 tables** minimum.
- **Comparison:** PH requires **5 accessible tables** (clear table count); US requires **10 accessible seating spaces** (at minimum 3 tables worth). In practice, the Philippines mandates a higher explicit table count (5 vs. potentially 3). The consultant's blanket "5 tables each" statement is incorrect because the ADA's 5% is seating-space-based, not table-based.

**Exam takeaway:** When the question says "US vs. PH code" — immediately note that ADA uses **5% / seating spaces** and BP 344 uses **10% / tables**. These are different metrics requiring separate calculations.

---

### Quick Verification Drill

Before your exam, verify these without looking:

| Prompt | Answer |
|--------|--------|
| 91 cm in millimeters? | **910 mm** (NOT 915) |
| BP 344 % accessible tables? | **10%** |
| ADA % accessible seating spaces? | **5%** |
| BP 344 knee clearance depth? | **480 mm** |
| BP 344 knee clearance height? | **700 mm** |
| ADA knee clearance height? | **27 in / 685 mm** |
| RA 9514 base retail aisle (≤50 seats)? | **76 cm / 760 mm** |
| RA 9514 aisle >50 seats, one side? | **91 cm / 910 mm** |
| RA 9514 both-sides threshold? | **122 cm / 1,220 mm** |
| PD 1096 min business occupancy aisle? | **1.12 m / 1,120 mm** |
| Does DAO 2003-30 apply to offices? | **No — it covers ECPs (heavy industry, infrastructure)** |
| PH male mean stature? | **167.0 cm** (vs. US 175.5 cm) |
| Filipino female 5th% stature? | **143.0 cm** |

---



---



---

## Exam Tip

LEA Swipe: The minimum aisle width for mercantile occupancies is 900 mm for counters (if non-accessible) and 1.20 m for accessible routes. Queuing space = 900 mm per person in line. Service counters must have a 760-860 mm high section for wheelchair users.

## Cross‑References

**Ceiling Heights And Room Sizes**, **Residential Clearances**, **Pd 1096 Rule Xii Egress And Corridors**, **Accessible Seating In Assembly Areas**

## Verified Sources

- **RA 9514 RIRR (2019)**, Rule 8: Aisle widths by occupancy load and seating configuration. [RA 9514 IRR — IIBH.org PDF](https://www.iibh.org/kijun/pdf/Philippines_04_IRR_of_Fire_Code_of_the_Philippines_2008_IRR.pdf)
- **BP 344 IRR (Amended)**, Section 7.3: Dining accessibility — table height, knee clearance, accessible percentage. [BP 344 IRR — DPWH Official](https://www.dpwh.gov.ph/dpwh/sites/default/files/laws_codes_orders/amended_irr_bp_344_official_gazette_2.pdf)
- **ADA 2010 Standards**, §226 (Dining Surfaces) and §306/§902 (Knee Clearance / Technical): [ADA.gov — 2010 Standards](https://www.ada.gov/law-and-regs/design-standards/2010-stds/)
- **PD 1096 (National Building Code of the Philippines)**: Business Occupancy egress corridor provisions, Table 602-A.
- **DENR DAO 2003-30 Revised Procedural Manual**: EIS coverage — ECPs and NECPs in ECAs. [Revised Procedural Manual — Osaka University Archive](https://greenaccess.law.osaka-u.ac.jp/wp-content/uploads/2019/03/EIA-Revised-Procedural-Manual-Main-Document.pdf)
- **Del Prado-Lu, J.L. (2007)**: "Anthropometric measurement of Filipino manufacturing workers." _International Journal of Industrial Ergonomics_, 37(6), 497–503. (n=1,805 Filipino manufacturing workers)
- **NC State Ergonomics Center**: US Anthropometric Data Tables (based on NHANES/ANSUR surveys of US civilian population).
- **IBC §1030 / NFPA 101 (2015)**: Assembly occupancy aisle width provisions. [Tennessee Fire Marshal — IBC Assembly Correction Reference](https://www.tn.gov/content/dam/tn/commerce/documents/fire_prevention/posts/Assembly-Correction-List.pdf)
- **Access-Board.gov**: ADA Chapter 9 Built-In Elements — §902 Dining Surfaces. [Access Board — Chapter 9](https://www.access-board.gov/ada/chapter/ch09/)

---

_Module complete. Review errors in Section 1 before your next practice exam. If you scored 3/3 on the Knowledge Check without hints, you are board-ready on this topic._
