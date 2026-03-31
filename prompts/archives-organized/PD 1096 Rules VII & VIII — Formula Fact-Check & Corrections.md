# PD 1096 Rules VII & VIII — Formula Fact-Check & Corrections

## Executive Summary

This report fact-checks every formula and section-number citation in the `pd1096-rules-7-8-implementation-plan.md` file against the authoritative **2004 Revised Implementing Rules and Regulations (IRR) of P.D. No. 1096**, published by the DPWH. The source of truth is the official IRR text (DPWH, April 2005 publication), cross-validated against the Professional Regulatory Board of Architecture (PRBoA) annotated version and multiple authoritative Philippine architecture education sources.[^1][^2][^3]

Several formulas are **correct in their mathematical logic** but contain **wrong section number citations**. A smaller number contain **substantive formula errors** that would produce incorrect results in the 3D engine or mislead students. All corrections are enumerated below with precise IRR citations.

***

## Critical Finding: Section Number Misattributions

The most pervasive error class in the plan is assigning formulas to the **wrong section numbers**. The 2004 Revised IRR structure is:[^3][^1]

- **Rule VIII, Section 803** = Percentage of Site Occupancy (PSO, AMBF, ISA, USA, MACA, TOSL)
- **Rule VIII, Section 804** = Sizes and Dimensions of Courts (setbacks/yards for non-R-1 uses)
- **Rule VIII, Section 805** = Ceiling Heights
- **Rule VIII, Section 806** = Sizes and Dimensions of Rooms
- **Rule VIII, Section 808** = Window Openings
- **Rule VII, Section 704** = Location on Property (setbacks, building footprint rules)

The plan inverts several of these. Below is the complete correction table.

***

## Formula-by-Formula Audit

### TLA (Total Lot Area)

**Implementation plan states:**
> `TLA = lotWidth × lotDepth` — cited to *IRR Rule VIII, Sec. 805*

**Verdict: FORMULA CORRECT — CITATION WRONG**

The formula \(\text{TLA} = \text{lot width} \times \text{lot depth}\) is mathematically correct as a rectangular-lot simplification. However, **Section 805 is Ceiling Heights** — it contains no area formula. TLA is referenced as a baseline in **Rule VIII, Section 803** (Percentage of Site Occupancy) where Table VIII.1 defines all area development controls as percentages of TLA.[^4][^1][^3]

**Corrected citation:** `IRR Rule VIII, Sec. 803` (Table VIII.1 header: *"% of Total Lot Area (TLA)"*)

***

### PSO (Percentage of Site Occupancy)

**Implementation plan defines PSO as:**
> `PSO = TLA − AMBF` — cited as *IRR Rule VIII, Sec. 804*

**Verdict: FORMULA WRONG — CITATION WRONG**

The IRR defines PSO differently. Per Rule VIII, Section 803 of the 2004 Revised IRR:[^3]

> *"Maximum Allowable PERCENTAGE OF SITE OCCUPANCY (PSO) — Maximum Allowable Building Footprint (AMBF) divided by Total Lot Area (TLA)."*[^2]

PSO is a **ratio/percentage**, not an area value. The correct formula is:

\[\text{PSO} = \frac{\text{AMBF}}{\text{TLA}}\]

or equivalently expressed as a decimal/percentage of TLA (e.g., 50% for R-1 without firewall). The value `TLA − AMBF` is actually the **TOSL** (see below), not PSO. Additionally, **Section 804 is Sizes and Dimensions of Courts**, not site occupancy.[^5][^1][^3]

**Corrected formula:** `PSO = AMBF / TLA` (a ratio, not an area in sqm)

**Corrected citation:** `IRR Rule VIII, Sec. 803`

> **Note for the implementation plan:** The variable labeled `pso` in `SiteControlOutputs` is described as *"sqm of open space"* — this is actually the **TOSL** value (a sqm area), not the PSO (a dimensionless percentage). This naming error will confuse students and violates the IRR terminology. Rename the variable or fix the description.

***

### AMBF (Allowable Maximum Building Footprint)

**Implementation plan states:**
> `AMBF = buildableWidth × buildableDepth` (constrained by `TLA × maxLotCoverage`) — cited to *IRR Rule VIII, Sec. 803*

**Verdict: PARTIALLY CORRECT — NEEDS IMPORTANT CLARIFICATION**

The concept of taking the **lesser of** (setback-bounded area vs. PSO-bounded area) is architecturally correct and reflects real practice. The IRR Rule VIII Section 803 is the **correct citation** for this formula.[^6][^4][^3]

However, the plan uses the term `maxLotCoverage` and equates it to the PSO percentage. In the IRR, this value comes from **Table VIII.1** and depends on:
- The **zoning classification** (R-1, R-2, C-1, etc.)
- Whether the building has **firewalls** (the "e" vs "f" variant in Table VIII.1)

For R-1 (single-detached, no firewall): PSO = **50%** of TLA, not 60% as coded in the plan's validation test. See the corrected validation table below.[^5][^3]

**Corrected formula logic:**

\[\text{AMBF} = \min(\text{buildableWidth} \times \text{buildableDepth},\ \text{PSO\%} \times \text{TLA})\]

**Corrected citation:** `IRR Rule VIII, Sec. 803, Table VIII.1` ✓ (already correct in the plan)

***

### MACA (Maximum Allowable Construction Area)

**Implementation plan states:**
> `MACA = AMBF × (1 + allowable_additional_coverage)` — cited to *IRR Rule VIII, Sec. 808*

**Verdict: FORMULA COMPLETELY WRONG — CITATION COMPLETELY WRONG**

This is the most critical formula error in the entire plan. The 2004 Revised IRR, Rule VIII, Section 803 defines MACA explicitly in the notes to Table VIII.1:[^3]

> *"PSO + ISA = MACA (Maximum Allowable Construction Area)"*[^2][^3]

MACA is simply the **sum of the building footprint area and the paved open space area** — it is **not** a multiplier on AMBF. There is no "additional coverage allowance" concept in the IRR. The formula used in the plan is fabricated and has no basis in PD 1096 or its IRR.

Furthermore, **Section 808 is Window Openings** — it contains no construction area formula.[^1]

**Corrected formula:**

\[\text{MACA} = \text{AMBF (PSO)} + \text{ISA}\]

Where ISA is expressed as its sqm area value (= ISA% × TLA from Table VIII.1).

**Corrected citation:** `IRR Rule VIII, Sec. 803, Table VIII.1 (note c)`

***

### TOSL (Total Open Space within Lot)

**Implementation plan states:**
> `TOSL = ISA + USA` — cited to *IRR Rule VIII, Sec. 806*

**Verdict: FORMULA CORRECT — CITATION WRONG**

The formula `TOSL = ISA + USA` is correct and matches the IRR verbatim. The 2004 IRR Table VIII.1 notes confirm: *"TOSL d (ISA + USA)"*.[^3]

However, **Section 806 is Sizes and Dimensions of Rooms** — it has nothing to do with open space. The correct citation is Section 803.[^1]

The plan must also add the key IRR identity: **`PSO + TOSL = TLA`**. This is the governing accounting equation, explicitly stated in Table VIII.1 note (d):[^3]

> *"PSO + TOSL = TLA (Total Lot Area)"*

**Corrected citation:** `IRR Rule VIII, Sec. 803, Table VIII.1 (note d)`

***

### ISA (Impervious Surface Area)

**Implementation plan states:**
> `ISA = TOSL × impervious_ratio` — cited to *IRR Rule VIII*

**Verdict: FORMULA STRUCTURALLY WRONG**

The IRR does not define ISA as a fraction of TOSL. ISA is defined as a **direct percentage of TLA** — independent of TOSL:[^3]

> *"Maximum Allowable IMPERVIOUS SURFACE AREA (ISA) — percentage of the maximum allowable floor area of any paved, tiled or hardscaped surface at the ground floor in relation to the TLA."*[^2]

From Table VIII.1 (R-1 without firewall, "basic"): ISA = **30% of TLA**. Expressing ISA as a fraction of TOSL is a derived reformulation that works mathematically only for fixed ratios, but it misrepresents the code's structure and will produce incorrect results when TOSL varies (e.g., due to lot type, firewall status).[^3]

**Corrected formula:**

\[\text{ISA} = \text{ISA\%} \times \text{TLA}\]

Where ISA% comes from **Table VIII.1** based on zoning classification and firewall status.

**Corrected citation:** `IRR Rule VIII, Sec. 803, Table VIII.1`

***

### USA (Unpaved Surface Area)

**Implementation plan states:**
> `USA = TOSL × (1 − impervious_ratio)` — cited to *IRR Rule VIII*

**Verdict: FORMULA STRUCTURALLY WRONG (same issue as ISA)**

Like ISA, the IRR defines USA as a **direct percentage of TLA**, not a fraction of TOSL:[^3]

> *"Maximum Allowable Unpaved Surface Area (USA) — portion of the lot that shall remain unpaved and reserved for softscaping/planting."*[^2]

From Table VIII.1 (R-1 without firewall): USA = **20% of TLA**.[^5][^3]

**Corrected formula:**

\[\text{USA} = \text{USA\%} \times \text{TLA}\]

Where USA% comes from **Table VIII.1**.

Also note: the relationship `USA = TOSL − ISA` is a correct derived formula (valid as a check), but the primary definition is the TLA-based percentage.

**Corrected citation:** `IRR Rule VIII, Sec. 803, Table VIII.1`

***

### Buildable Width and Depth (Setback Derivations)

**Implementation plan states:**
> `buildableWidth = lotWidth − setbacks.left − setbacks.right` — cited to *IRR Rule VII*
> `buildableDepth = lotDepth − setbacks.front − setbacks.rear` — cited to *IRR Rule VII*

**Verdict: FORMULA CORRECT — CITATION NEEDS SPECIFICITY**

These derived formulas are mathematically sound and consistent with how the IRR intends setbacks to work. The correct specific citation is **Rule VII, Section 704** (Location on Property) for building footprint and firewall rules, and/or **Rule VIII, Section 804, Table VIII.2** for the setback values themselves.[^7][^8][^9][^1]

**Corrected citation:** `IRR Rule VII, Sec. 704 and IRR Rule VIII, Sec. 804, Tables VIII.2 & VIII.3`

***

### Setback Identity in the Compliance Scorecard

**Implementation plan cites setbacks as:**
> *Rule VII Sec. 704* — used in ComplianceScorecard

**Verdict: CORRECT** — Section 704 (Location on Property) is indeed where building footprint and setback rules live in Rule VII.[^7][^1]

***

## Setback Values Audit (computeSetbacks function)

The `computeSetbacks()` function in the plan uses lot area thresholds and fixed meter values. These are checked against **Table VIII.2** (Minimum Setbacks for Residential Buildings) and **Table VIII.3** (Setbacks for Commercial, Industrial, Institutional Buildings) of Rule VIII, Section 804.[^3]

### Group A (Residential) Setbacks

The plan codes two branches for Group A:
- **≤ 200 sqm:** `{ front: 2.0, rear: 2.0, left: 1.5, right: 1.5 }`
- **> 200 sqm:** `{ front: 4.5, rear: 2.0, left: 2.0, right: 2.0 }`

**Verdict: PARTIALLY CORRECT — MISSING CRITICAL CONTEXT**

Per **Table VIII.2** of the 2004 Revised IRR, for **R-1 (Basic)** use:[^3]
- Front: **4.50 m**
- Side: **2.00 m** (each side)
- Rear: **2.00 m**

There is no IRR provision that reduces R-1 setbacks to 2.0m front / 1.5m sides based solely on lot area ≤ 200 sqm. The ≤ 200 sqm branch values do not appear in Table VIII.2. The **2.0m front** and **1.5m side** values in the plan appear to reference the old (pre-2004) IRR or may be confused with values applicable to R-2/R-3 lots.

However, the IRR does contain a **variance provision** for very narrow/shallow lots (Section 803.4.e) that can waive TOSL requirements, and Section 708 of PD 1096 itself states that Group A dwellings shall be at least 2 meters from the property line — this is the absolute minimum under the base Code (not the revised IRR). For the standard 2004 IRR application, R-1 setbacks are as in Table VIII.2 above, regardless of lot area below 200 sqm.[^10]

**Corrected R-1 setbacks (2004 IRR Table VIII.2, Basic R-1, no firewall):**

| Yard | Value |
|------|-------|
| Front | 4.50 m |
| Side (left) | 2.00 m |
| Side (right) | 2.00 m |
| Rear | 2.00 m |

The `> 200 sqm` branch values `{ front: 4.5, rear: 2.0, left: 2.0, right: 2.0 }` are correct for R-1 basic. The `≤ 200 sqm` branch with reduced values is **not code-compliant** under the 2004 IRR and should be removed or replaced with the same standard R-1 values.

### Commercial (Group C/D) Setbacks

The plan codes:
- `{ front: 4.5, rear: 2.0, left: 2.0, right: 2.0 }` for occupancy groups C and D

**Verdict: WRONG APPROACH — COMMERCIAL SETBACKS ARE RROW-DEPENDENT**

Per **Table VIII.3** of the 2004 Revised IRR, commercial setbacks are determined by the **Road Right-of-Way (RROW) width** of the fronting street, not by a flat value:[^3]

| RROW Width | Front | Side | Rear |
|------------|-------|------|------|
| 30.00 m and above | 8.00 m | 5.00 m | 5.00 m |
| 25.00 to 29.00 m | 6.00 m | 5.00 m | 5.00 m |
| 20.00 to 24.00 m | 5.00 m | 3.00 m | 3.00 m |
| 10.00 to 19.00 m | 5.00 m | 2.00 m | 2.00 m |
| Below 10.00 m | 5.00 m | 2.00 m | 2.00 m |

The `LotInputs` interface must include an `rrowWidth` parameter for commercial/industrial occupancies. Without it, no code-accurate setback can be computed for these groups. Using `front: 4.5` for commercial is not correct under the 2004 IRR.

### Industrial (Group E) Setbacks

The plan codes:
- `{ front: 8.0, rear: 3.0, left: 3.0, right: 3.0 }`

**Verdict: PARTIALLY CORRECT**

The 8.0m front setback corresponds to an RROW of 30m and above in Table VIII.3. The 3.0m sides and rear match the 20–29m RROW range. These values are internally inconsistent — they mix values from different RROW width bands. Without specifying the RROW, this table lookup cannot be hardcoded accurately. The same RROW-based approach used for commercial must also be applied to industrial.

***

## Validation Identity Check (TLA = AMBF + ISA + USA)

**Implementation plan states:**
> Engine checks `TLA === AMBF + ISA + USA`

**Verdict: WRONG IDENTITY — CORRECT IRR IDENTITY IS DIFFERENT**

The 2004 Revised IRR Table VIII.1 notes explicitly state the governing identity as:[^3]

> *"PSO + TOSL = TLA"*

Since `TOSL = ISA + USA` and `AMBF = PSO × TLA` (in area), the correct area identity is:

\[\text{AMBF} + \text{TOSL} = \text{TLA}\]

or equivalently:

\[\text{AMBF} + \text{ISA} + \text{USA} = \text{TLA}\]

So the identity check as coded (`AMBF + ISA + USA = TLA`) is **mathematically equivalent** and numerically correct — **but only if** ISA and USA are the full respective area values allocated to those uses within the lot, not just the minimums from the table. In practice, ISA and USA will only equal `TOSL × ratio` if the entire TOSL is consumed by those two components. The engine should check `AMBF + TOSL = TLA` where `TOSL = TLA − AMBF`, which trivially holds if TOSL is computed as `TLA − AMBF`. The more meaningful compliance check is whether the actual ISA and USA areas **satisfy the minimum and maximum thresholds** from Table VIII.1.

***

## Corrected Validation Test (300 sqm R-1 Lot)

The plan's validation test uses 60% as the max lot coverage for R-1. This is wrong. Per Table VIII.1 of the 2004 Revised IRR, **R-1 without firewall (Basic)** = **50% PSO** (not 60%). The correct values are:[^5][^3]

| Metric | Plan Value | Corrected Value | Basis |
|--------|-----------|-----------------|-------|
| Max PSO (R-1, no FW) | 60% | **50%** | Table VIII.1, R-1 basic ("e") |
| Max ISA (R-1, no FW) | 30% of TOSL | **30% of TLA** = 90 sqm | Table VIII.1 |
| Min USA (R-1, no FW) | 70% of TOSL | **20% of TLA** = 60 sqm | Table VIII.1 |
| TOSL | 151.5 sqm | **50% of TLA** = 150 sqm | PSO + TOSL = TLA |
| AMBF (PSO basis) | 180 sqm | **150 sqm** (50% × 300) | Table VIII.1 |
| Effective AMBF | 148.5 sqm | **148.5 sqm** (setback-limited, still applies) | min(148.5, 150) |
| MACA | not in test | **148.5 + 90 = 238.5 sqm** | Sec. 803 note c |

The corrected identity: 148.5 (AMBF) + 90 (ISA) + 60 (USA min) ≤ 300 sqm TLA. TOSL = 300 − 148.5 = 151.5 sqm (actual), which is greater than the 50% minimum requirement of 150 sqm, so the lot passes TOSL compliance.

***

## Hotspot Content Table Corrections

| Zone | Plan Citation | Corrected Citation | Notes |
|------|--------------|--------------------|-------|
| AMBF | Rule VIII, Sec. 803 | **Rule VIII, Sec. 803, Table VIII.1** ✓ | Correct section, should specify table |
| ISA | Rule VIII, Sec. 806 | **Rule VIII, Sec. 803, Table VIII.1** | Sec. 806 = Room Sizes — wrong |
| USA | Rule VIII, Sec. 806 | **Rule VIII, Sec. 803, Table VIII.1** | Sec. 806 = Room Sizes — wrong |
| TOSL | Rule VIII, Sec. 806 | **Rule VIII, Sec. 803, Table VIII.1** | Sec. 806 = Room Sizes — wrong |
| Setbacks | Rule VII, Sec. 704 | **Rule VII, Sec. 704 + Rule VIII, Sec. 804, Tables VIII.2/VIII.3** ✓ | Should add Sec. 804 reference |

***

## Complete Corrected Formula Reference

```
TLA  = lot width × lot depth                                     (Rule VIII Sec. 803)

PSO  = AMBF / TLA   [a percentage, e.g. 50% for R-1 no FW]      (Rule VIII Sec. 803, Table VIII.1)

AMBF = min(buildableWidth × buildableDepth, PSO% × TLA)          (Rule VIII Sec. 803, Table VIII.1)

buildableWidth = lotWidth − setbacks.left − setbacks.right       (Rule VII Sec. 704,
buildableDepth = lotDepth − setbacks.front − setbacks.rear        Rule VIII Sec. 804, Table VIII.2/VIII.3)

ISA  = ISA% × TLA   [from Table VIII.1, e.g. 30% for R-1]       (Rule VIII Sec. 803, Table VIII.1)

USA  = USA% × TLA   [from Table VIII.1, e.g. 20% for R-1]       (Rule VIII Sec. 803, Table VIII.1)

TOSL = ISA + USA   [or equivalently: TOSL = TLA − AMBF]         (Rule VIII Sec. 803, Table VIII.1 note d)

MACA = AMBF + ISA   [i.e., PSO + ISA]                           (Rule VIII Sec. 803, Table VIII.1 note c)

Key identities:
  PSO + TOSL = TLA      (governing IRR identity)
  TOSL = ISA + USA
  MACA = PSO + ISA = AMBF + ISA
```

***

## Glossary Variable Naming Issue

The `SiteControlOutputs` interface comments label `pso` as *"sqm of open space"*. Under the IRR, PSO is a **dimensionless percentage**, not an area. The area of open space is **TOSL** (in sqm). These must not be conflated in student-facing UI or in the hook's output type. The recommended fix:

- Keep `pso: number` as the percentage/ratio (e.g., `0.50` for 50%)
- Add/keep `tosl: number` as the area in sqm
- The Compliance Scorecard label *"TLA identity: AMBF + ISA + USA"* is architecturally intelligible but should be updated to reflect the IRR's primary identity: *"PSO + TOSL = TLA"*

***

## Summary of Errors

| Formula/Item | Error Type | Severity |
|---|---|---|
| PSO definition (`TLA − AMBF`) | Wrong formula (should be `AMBF / TLA`) | 🔴 Critical |
| MACA formula (`AMBF × (1 + x)`) | Wrong formula (should be `AMBF + ISA`) | 🔴 Critical |
| ISA formula (`TOSL × ratio`) | Wrong structure (should be `ISA% × TLA`) | 🟠 Major |
| USA formula (`TOSL × (1 − ratio)`) | Wrong structure (should be `USA% × TLA`) | 🟠 Major |
| R-1 setbacks ≤ 200 sqm branch | Unsupported by 2004 IRR | 🟠 Major |
| Commercial setbacks (flat values) | Must be RROW-dependent | 🟠 Major |
| TLA citation (Sec. 805) | Wrong section | 🟡 Moderate |
| PSO citation (Sec. 804) | Wrong section | 🟡 Moderate |
| ISA/USA/TOSL citations (Sec. 806) | Wrong section | 🟡 Moderate |
| MACA citation (Sec. 808) | Wrong section | 🟡 Moderate |
| R-1 max lot coverage as 60% | Wrong value (should be 50%) | 🟠 Major |
| PSO variable labeled "sqm of open space" | Wrong unit/definition | 🟡 Moderate |

---

## References

1. [2004 Revised IRR](https://www.architectureboard.com.ph/wp-content/uploads/2019/09/1.12-PD1096_-2004revIRR_PRBoA-unofcl-versnw08annotns.pdf)

2. [National Building Code - Philippines - Rule 8. Light and Ventilation](https://philarchitecturenotes.weebly.com/rule-8-light-and-ventilation.html) - Group A buildings or Residential 1 (R-!) uses shall follow the minimum yard standards in Table VIII....

3. [Building Code: Occupancy & Parking Rules | PDF - Scribd](https://www.scribd.com/document/311772766/Rule-Vii-Classification-General-Requirements-of-All-Bl) - Rule Vii - Classification & General Requirements of All Bl… - Free download ... construction. SECTIO...

4. [AMBF Calculation Based on TOSL for Commercial Use ...](https://www.studocu.com/ph/document/saint-louis-university-philippines/architecture/ambf-calculation-based-on-tosl-for-commercial-use-pd-1096/141746214) - Share free summaries, lecture notes, exam prep and more!!

5. [c) GFA (Gross Floor Area) Allowed ABOVE GRADE ONLY at 451.5 ...](https://www.facebook.com/BuildingCode.Ph/posts/development-potential-computation-maximum-permissible-attaining-a-nbcp-compliant/966044130073160/) - ... Rule VII Section 804.4; and 3) Rule VII.1. Reference Table of ... 1096, the 1977 NBCP in its 200...

6. [Determining the AMBF & PSO for R-2 Zoned Properties in PD 1096](https://www.studocu.com/ph/document/university-of-pangasinan/bs-architecture/determining-the-ambf-pso/58578723) - The following rules shall be observed in the determination of the Allowable Maximum Building Footpri...

7. [What are the provisions under the 2004 Revised IRR of PD No ...](https://www.facebook.com/BuildingCode.Ph/posts/what-are-the-provisions-under-the-2004-revised-irr-of-pd-no-1096-from-wwwdpwhgov/3831450083532536/) - Rules VII and VIII (under Chapters 7 & 8) of P.D. No. 1096, the 1977 National Building Code of the P...

8. [Minimum Setbacks For Residential | PDF | Building - Scribd](https://www.scribd.com/document/482290628/MINIMUM-SETBACKS-FOR-RESIDENTIAL) - SECTION 804. Sizes and Dimensions of Courts. 1. Minimum sizes of courts and yards and their least di...

9. [Setbacks: Presidential Decree No. 1216 | PDF | Easement - Scribd](https://www.scribd.com/document/434472346/06-Setbacks) - 1) front setback for a R-1 dwelling MUST be 4.5 meters (m) deep, and the ... Section 804. 19 pages. ...

10. [eCodal - PD No 1096 | National Building Code of the Philippines](https://sites.google.com/view/e-codal/commercial/special-commercial-laws/pd-no-1096-national-building-code-of-the-philippines) - February 19, 1977 PRESIDENTIAL DECREE NO. 1096 ADOPTING A NATIONAL BUILDING CODE OF THE PHILIPPINES ...

