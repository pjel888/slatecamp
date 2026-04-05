# PD 1096 Rules VII & VIII — Complete Technical Reference
## Philippine National Building Code (2004 Revised IRR)

***

## Executive Summary

Presidential Decree No. 1096, the 1977 National Building Code of the Philippines (NBCP), governs the design, construction, use, and maintenance of all buildings in the country. Its 2004 Revised Implementing Rules and Regulations (IRR), published by the DPWH on 01, 08, and 15 April 2005, is the authoritative operative document. **Rule VII** (Sections 701–709 plus Guidelines) classifies all buildings by occupancy and establishes their allowable bulk, height, and floor area. **Rule VIII** (Sections 801–811 plus Guidelines) governs light, ventilation, and the spatial open-space metrics — PSO, ISA, USA, TOSL, and MACA — that are central to both architectural board-exam review and parametric 3D site modeling.[^1][^2]

***

## Part I — Rule VII: Classification and General Requirements

### Section 701 — Occupancy Classification

All buildings are classified into **10 occupancy groups (A through J)** subdivided into **25 divisions**. The classification determines applicable setbacks, PSO limits, BHL, TGFA, FLAR, firewall rules, and fire-resistive construction requirements.[^3]

| **Group** | **Name** | **Key Divisions / Examples** |
|-----------|----------|------------------------------|
| A | Residential Dwellings | Div. 1: Single-family, churches, parks, golf courses; Div. 2: Duplex/townhouses, convents, ≤10-person dormitories, clinics, preschools ≤16 classrooms |
| B | Residentials, Hotels & Apartments | Multiple dwelling units, hotels, apartel, row houses — each accommodating **>10 persons** |
| C | Education & Recreation | Colleges, universities, libraries, civic centers, churches (larger scale) |
| D | Institutional | Div. 1: Jails, mental sanitaria (restrained inmates); Div. 2: Hospitals, nursing homes (non-ambulatory, >5 persons); Div. 3: Nursing homes (ambulatory), children's homes (>5 persons) |
| E | Business & Mercantile | Div. 1: Filling stations, storage garages; Div. 2: Retail stores, offices, restaurants <100 persons; Div. 3: Aircraft hangars, open parking garages |
| F | Industrial | Ice plants, power plants, creameries, factories using non-combustible/non-explosive materials |
| G | Storage & Hazardous | Div. 1: Highly flammable materials; Div. 2: Flammable/dry cleaning; Div. 3: Woodworking/combustible; Div. 4: Repair garages; Div. 5: Aircraft repair hangars |
| H | Assembly (< 1,000 load) | Div. 1: Assembly with stage, <1,000 occupants; Div. 2: Without stage, ≥300; Div. 3: Without stage, <300; Div. 4: Stadia, amusement parks |
| I | Assembly (≥ 1,000 load) | Assembly building with stage and an occupant load of **1,000 or more** |
| J | Accessory | Div. 1: Agricultural structures; Div. 2: Private garages, carports, fences >1.80 m, swimming pools, towers; Div. 3: Courts, mausoleums, zoo structures, vaults |

[^3]

#### Zoning Class Alignment
Each occupancy group also maps to a **zoning classification** as assigned by the LGU's duly-approved Comprehensive Land Use Plan (CLUP) and Zoning Ordinance (ZO). Common zoning labels referenced throughout Rules VII and VIII are:[^3]

- **Residential:** R-1 (Low Density), R-2 (Medium Density), R-3 (High Density), R-4 (Townhouse), R-5 (Condominium)
- **Commercial:** C-1/Com-1 (Neighborhood), C-2/Com-2 (Municipal/City), C-3/Com-3 (Metropolitan)
- **Industrial:** I-1/Ind-1 (Light), I-2/Ind-2 (Medium), I-3/Ind-3 (Heavy/Hazardous)
- **Institutional (GI/I), Cultural, Utility/Transportation/Services (UTS), Parks & Recreation, Agricultural/Agro-Industrial/Tourism, Cemetery, Planned Unit Development (PUD)**[^3]

***

### Section 702 — Change in Use

No change in the character of occupancy shall be made that places a building in a **more hazardous division or group** without full compliance with the requirements for that division/group. A change to a **less hazardous** use may be approved by the Building Official.[^3]

***

### Section 703 — Mixed Occupancy

When a building houses more than one occupancy, the **most restrictive requirement** applies to the entire structure, unless:[^3]
- In a one-storey building, each portion conforms to its own occupancy requirements; or
- Minor accessory uses do not occupy more than **10% of any floor** and not more than 10% of the basic area permitted for the major occupancy.[^3]

Occupancy separations are classified as **1-hour, 2-hour, 3-hour, or 4-hour fire-resistive** depending on the combination of groups involved.[^3]

***

### Section 704 — Location on Property and Firewall Provisions

#### 704.4 — AMBF Determination (Three-Way Check)

The Allowable Maximum Building Footprint (AMBF) must be determined by comparing **three independent limits** and adopting the **most restrictive (smallest)**:[^1]

1. **Setback-based AMBF** — from Tables VIII.2 and VIII.3 (see Rule VIII below)
2. **PSO-based AMBF** — from Rule VIII Table VIII.1: \(\text{AMBF}_{PSO} = \text{PSO\%} \times \text{TLA}\)
3. **TOSL-based AMBF** — from applicable TOSL minimum: \(\text{AMBF}_{TOSL} = (1 - \text{TOSL\%}) \times \text{TLA}\)

> **Canonical formula:** \(\text{AMBF} = \min(\text{AMBF}_{setback},\; \text{AMBF}_{PSO},\; \text{AMBF}_{TOSL})\)[^1]

#### 704.4c — Firewall Rules by Zoning Class

| **Zoning** | **Firewall Status** |
|------------|---------------------|
| R-1 | Absolutely **no firewalls** at any property line; abutment up to 3.20 m for carport support only, ≤ 7.00 m or 50% of side PL, whichever is shorter |
| R-2 | Firewall on **maximum 1 side** only, up to 80% of total side PL length; no front/rear firewalls |
| R-3 (type a) | Firewall on **two sides**, max 85% of each side PL, max 65% of total perimeter; max 2-storey firewall |
| R-3 (type b) | Firewall on **1 side + rear PL**, max 90% of side and rear PLs; max 2-storey on side, 3.20 m max on rear |
| R-4 | Firewall on **both sides** per unit, up to 85% of each side PL, max 50% of total perimeter; max 3-storey |
| R-5 (type a) | Firewall on **two sides**, up to 75% of each side PL, max 50% of perimeter; max 8-storey |
| R-5 (type b) | Firewall on **1 side + rear**, up to 65% of side PL and 50% of rear PL, max 60% of perimeter; max 8-storey side, 14 m rear |
| C/I/G with sprinklers | Up to **70% of total perimeter** with full sprinkler system; prescribed front setbacks must be maintained |

[^1]

***

### Section 705 — Allowable Floor Areas (Table VII.1 — TGFA)

The **Total Gross Floor Area (TGFA)** is the primary area limit for floor generation, computed from the **number of permitted storeys multiplied by the PSO percentage of TLA**. TGFA values vary by lot type (Interior/Rear, Inside/Regular, Corner, Through, Corner-Through) and by firewall status.[^4]

**Selected TGFA values from Table VII.1:**

| **Zone** | **Condition** | **Inside/Regular Lot** | **Corner Lot** | **Through Lot** |
|----------|---------------|----------------------|---------------|----------------|
| R-2 Basic | Without FW | 3 floors × 70% TLA | 3 floors × 75% TLA | 3 floors × 75% TLA |
| R-2 Max | Without FW | 5 floors × 70% TLA | 5 floors × 75% TLA | 5 floors × 75% TLA |
| R-3 Basic | Without FW | 3 floors × 70% TLA | 3 floors × 70% TLA | 3 floors × 70% TLA |
| Com-1 | Without FW | 5 floors × 75% TLA | 5 floors × 80% TLA | 5 floors × 80% TLA |
| Com-1 | With FW + Sprinklers | 5 floors × 85% TLA | 5 floors × 90% TLA | 5 floors × 90% TLA |
| Com-2 | Without FW | 12 floors × 75% TLA | 12 floors × 80% TLA | 12 floors × 80% TLA |
| Com-2 | With FW + Sprinklers | 12 floors × 85% TLA | 12 floors × 90% TLA | 12 floors × 90% TLA |
| Com-3 | Without FW | 30 floors × 75% TLA | 30 floors × 80% TLA | 30 floors × 80% TLA |
| Com-3 | With FW + Sprinklers | 30 floors × 85% TLA | 30 floors × 90% TLA | 30 floors × 90% TLA |
| Ind-2 | Without FW | BHL × 75% TLA | BHL × 80% TLA | BHL × 80% TLA |
| Ind-2 | With FW + Sprinklers | BHL × 85% TLA | BHL × 90% TLA | BHL × 90% TLA |

[^4]

***

### Section 707 — Maximum Height of Buildings (Table VII.2 — BHL)

The **Building Height Limit (BHL)** is set by use/occupancy type. Values from the 2004 Revised IRR:[^5]

| **Zone / Use** | **Storeys** | **Meters** |
|----------------|-------------|------------|
| Residential 1 (R-1) | 3 | 10.00 m |
| Residential 2 (R-2) Basic | 3 | 10.00 m |
| Residential 2 (R-2) Maximum | 5 | 15.00 m |
| Residential 3 (R-3) Basic | 3 | 10.00 m |
| Residential 3 (R-3) Maximum | 12 | 36.00 m |
| Residential 4 (R-4) Townhouses | 3 | 10.00 m |
| Residential 5 (R-5) Condominiums | 12 – 18 | 36.00 – 54.00 m |
| Commercial 1 (Com-1) | 5 (approx.) | 15.00 m |
| Commercial 2 (Com-2) | 6 | 18.00 m |
| Commercial 3 (Com-3) | up to 48 | ~180.00 m |
| Parks/Open Recreational | – | 15.00 m (or complement major zone BHL) |
| PUD at Reclamation near Airport | 3 | 15.00 m |
| PUD at Reclamation Area | 3 – 10 | 30.00 m |
| PUD at Coastal Area | up to 48 | up to 135.00 m |

[^5]

***

### Table VII.G.1 — Floor to Lot Area Ratio (FLAR)

The **FLAR** (identical to Floor Area Ratio/FAR) is the ratio of total GFA to TLA. It serves as the primary determinant of building bulk. The formula is:[^3]

\[\text{GFA} = \text{TLA} \times \text{FLAR}\]

| **Zone** | **FLAR Range** | **At BHL** |
|----------|----------------|------------|
| R-1 | 1.50 | 3 storeys / 10.00 m |
| R-2 Basic | 1.30 – 1.50 | 3 storeys / 10.00 m |
| R-2 Maximum | 2.10 – 3.00 | 5 storeys / 15.00 m |
| R-3 Basic | 1.80 – 2.10 | 3 storeys / 10.00 m |
| R-3 Maximum | 7.10 – 8.10 | 12 storeys / 36.00 m |
| R-4 (Individual Townhouse) | 1.60 – 1.80 | 3 storeys / 10.00 m |
| R-5 (Condominiums) | 6.00 – 9.00 | 18 storeys / 54.00 m |
| Com-1 | 1.70 – 3.00 | 5 storeys / 15.00 m |
| Com-2 | 3.60 – 9.00 | 15 storeys / 45.00 m |
| Com-3 | 9.00 – 34.00 | 60 storeys / 180.00 m |
| Ind-1 | 1.50 – 2.50 | — |
| Ind-2 | 2.50 – 3.00 | — |
| Ind-3 | 3.00 – 5.00 | — |
| Institutional | 2.50 | — |
| Cultural | 3.50 | — |
| Utility/Transportation/Services | 2.00 – 3.00 | — |
| Parks & Open Recreational | 0.50 – 1.00 | — |
| Agricultural/Agro-Industrial/Tourism | 1.80 – 2.20 | — |
| PUD at Reclamation near Airport | 6.00 | — |
| PUD at Reclamation Area | 6.00 – 12.00 | — |
| PUD at Coastal Area | 12.00 – 18.00 | — |
| PUD at Inland Area | 9.00 – 34.00 | up to 60 storeys / 180 m |
| Cemetery | 0.80 | — |

[^3]

***

### Table VII.G.2 — GFA to TGFA Conversion Multiplier

Because certain areas (parking, service areas, etc.) are **excluded** from GFA but included in TGFA, a multiplier converts between the two:[^6][^7]

\[\text{TGFA} = \text{GFA} \times \text{Multiplier}\]

- **Residential buildings:** ~33% excluded → Multiplier = **1.50**
- **Commercial buildings:** ~20–25% excluded → Multiplier = **1.25 – 1.33**

The multiplier varies by specific occupancy type. In exam-oriented review materials, the standard figures used are 1.5 for residential and 1.25–1.33 for commercial.[^7][^6]

***

### Allowable Maximum Volume of Building (AMVB)

The **AMVB** caps the three-dimensional volume a building may occupy. It is derived as follows:[^8]

1. **Establish the building footprint prism:** \(\text{Initial AMVB} = \text{AMBF} \times \text{BHL (meters)}\)
2. **Apply the angular plane** originating from the **center of the RROW**: this reduces the initially computed volume, particularly for upper floors near the street frontage
3. **Final AMVB** = Initial AMVB − Volume above the angular plane

The angular plane is expressed as:

\[\tan(\theta) = \frac{H}{S + \frac{1}{2} \cdot \text{RROW}}\]

where \(H\) is building height at any given setback \(S\), and RROW is the road right-of-way width. The angle \(\theta\) varies by zone and RROW — for C-3 along a 14 m RROW, the reference angular plane produces \(\theta \approx 69.5°\).[^8]

#### OFB and OLBP

- **OFB (Outermost Face of the Building):** The vertical projection of the outermost faces of the AMBF prism, from grade to BHL[^8]
- **OLBP (Outermost Limit of Building Projection):** The farthest allowed projection beyond the OFB, applicable to balconies, overhangs, or other appendages; subject to Rule X (building projections over public streets)[^8]

***

## Part II — Rule VIII: Light and Ventilation

### Section 801 — General Requirements

Every building shall be designed, constructed, and equipped to provide adequate **light and ventilation**. All buildings must face a street, public alley, or approved private street. No building shall be altered to reduce required windows below minimums, nor enlarged to reduce courts or yards below prescribed dimensions.[^1]

***

### Section 802 — Measurement of Site Occupancy

Site occupancy is measured **at ground level**, exclusive of courts, yards, and light wells. Courts, yards, and light wells shall be measured clear of all wall projections, except roof leaders, wall copings, sills, or fire escapes not exceeding **1.20 meters** in width.[^1]

***

### Section 803 — Percentage of Site Occupancy (PSO) and Open Space Metrics

This is the definitional core of the Rule. Section 803 establishes the **five interrelated development control metrics**:[^1]

#### Canonical Definitions

| **Abbreviation** | **Full Name** | **Definition** |
|-----------------|---------------|----------------|
| **TLA** | Total Lot Area | Total area of the lot (length × width) in sqm |
| **PSO** | Percentage of Site Occupancy | Maximum allowable % of TLA that the building footprint (at ground level) may cover |
| **AMBF** | Allowable Maximum Building Footprint | Area at grade occupied by the building; AMBF = PSO% × TLA when PSO governs |
| **ISA** | Maximum Allowable Impervious Surface Area | Maximum % of TLA that may be covered by paved/tiled hardscaped open area |
| **USA** | Minimum Unpaved Surface Area | Minimum % of TLA that must remain exposed soil and planted/softscaped |
| **TOSL** | Total Open Space within Lot | TOSL = ISA + USA (total ground-level open space; the portion of TLA not occupied by the building) |
| **MACA** | Maximum Allowable Construction Area | MACA = PSO (area) + ISA |

[^1]

#### Area Closure Identity

The master identity that drives all site area calculations:[^1]

\[\text{TLA} = \text{AMBF} + \text{TOSL}\]

Since \(\text{TOSL} = \text{ISA} + \text{USA}\), this expands to:

\[\text{TLA} = \text{AMBF} + \text{ISA} + \text{USA}\]

And since \(\text{MACA} = \text{AMBF} + \text{ISA}\):

\[\text{TLA} = \text{MACA} + \text{USA}\]

These three identities are the **fundamental closure equations** for any Rule VIII calculation and should always be verified as a consistency check in parametric models.[^1]

***

### Table VIII.1 — Complete PSO/ISA/USA/TOSL Reference Table

All values are **% of TLA**. Superscript **e** = without firewall; superscript **f** = with firewall.[^2][^1]

| **Zone / Land Use** | **PSO (e)** | **PSO (f)** | **ISA** | **USA** | **TOSL** |
|---------------------|------------|------------|--------|--------|---------|
| **R-1** (Low Density Residential) | 55% | N/A (no FW) | 30% | 15% | 45% |
| **R-2 Basic** (Medium Density, single-family, BHL 10 m) | 55% | 60% | 30% | 10% | 40% |
| **R-2 Maximum** (multiple family, BHL 15 m) | 60% | 70% | 20% | 10% | 30% |
| **R-3 Basic** (High Density, single-family, BHL 10 m) | 60% | 70% | 20% | 10% | 30% |
| **R-3 Maximum** (multiple family, BHL 36 m) | 65% | 70% | 20% | 15–10% | 35–30% |
| **R-4** (Townhouse, individual lot) | 70% | 80% | 20–10% | 10% | 30–20% |
| **R-5** (Condominium) | 70% | 80% | 20–10% | 10% | 30–20% |
| **Com-1** (Neighborhood Commercial) | 65% | 75% | 20% | 15–5% | 35–25% |
| **Com-2** (Municipal/City Commercial) | 75% | 85% | 20–10% | 5% | 25–15% |
| **Com-3** (Metropolitan Commercial) | 80% | 90% | 15–5% | 5% | 20–10% |
| **Ind-1** (Light Industrial) | 70% | 80% | 15–5% | 15% | 30–20% |
| **Ind-2** (Medium Industrial) | 70% | 80% | 15–5% | 15% | 30–20% |
| **Ind-3** (Heavy/Hazardous Industrial) | 70% | 80% | 15–5% | 15% | 30–20% |
| **Institutional** | 50% | 60% | 20% | 30–20% | 50–40% |
| **Cultural** | 60% | 70% | 20% | 20–10% | 40–30% |
| **Utility/Transportation/Services** | 50% | 60% | 40–30% | 10% | 50–40% |
| **Parks & Open Recreational** | 20% | — | — | 30% | 50%+ |
| **PUD near Airport (Reclamation)** | 70% | 80% | 10% | 10% | 20–30% |
| **PUD at Coastal Area** | 70% | — | 15% | 15% | 30% |
| **PUD at Inland Area** | 70% | 85% | 10% | 20–5% | 30–15% |
| **Cemetery** | — | 60% | 30% | 10% | — |
| **Sidewalks/Arcades at RROW** | — | — | 22.22% of RROW width | 11.11% | 33.33% |

[^1]

> **Note on R-1:** Group A buildings (R-1) must follow the **minimum yard standards in Table VIII.2** to comply with the TOSL requirement. Table VIII.1 does not directly assign PSO to R-1; rather, compliance is achieved through setback enforcement.[^1]

***

### Computation Sequence — Step-by-Step

The standard order of computation for a PD 1096 Rule VII–VIII compliance check is:[^9][^1]

1. **Determine TLA:** \(\text{TLA} = \text{lotWidth} \times \text{lotDepth}\)
2. **Determine applicable zoning class** from approved CLUP/ZO
3. **Look up PSO%, ISA%, USA% from Table VIII.1** for the zoning class and firewall status
4. **Compute setback-based buildable area (Table VIII.2 / VIII.3):**
   \[\text{AMBF}_{setback} = (\text{lotWidth} - s_L - s_R) \times (\text{lotDepth} - s_F - s_{Rear})\]
5. **Compute PSO-based AMBF:**
   \[\text{AMBF}_{PSO} = \text{PSO\%} \times \text{TLA}\]
6. **Compute TOSL-based AMBF:**
   \[\text{AMBF}_{TOSL} = (1 - \text{TOSL\%}) \times \text{TLA} = \text{AMBF}_{PSO} \text{ (since TOSL = 100\% − PSO\%)}\]
7. **Take the most restrictive:**
   \[\text{AMBF} = \min(\text{AMBF}_{setback},\; \text{AMBF}_{PSO})\]
8. **Compute open-space areas:**
   \[\text{TOSL} = \text{TLA} - \text{AMBF}\]
   \[\text{ISA} = \text{ISA\%} \times \text{TLA}\]
   \[\text{USA} = \text{TLA} - \text{AMBF} - \text{ISA}\]
9. **Compute MACA:**
   \[\text{MACA} = \text{AMBF} + \text{ISA}\]
10. **Verify closure:**
    \[\text{AMBF} + \text{ISA} + \text{USA} = \text{TLA}\]
11. **Compute GFA:**
    \[\text{GFA} = \text{TLA} \times \text{FLAR}\]
12. **Compute TGFA:**
    \[\text{TGFA} = \text{GFA} \times \text{Multiplier}_{VII.G.2}\]
    or equivalently: \(\text{TGFA} = \text{BHL (storeys)} \times \text{PSO\% based AMBF}\) (Table VII.1 approach)
13. **Compute initial AMVB:**
    \[\text{AMVB}_{initial} = \text{AMBF} \times \text{BHL (meters)}\]
14. **Apply angular plane** to reduce AMVB to final value[^8]

***

### Notes on ISA and USA: Code vs. Ratio Convention

The **2004 Revised IRR Table VIII.1** expresses ISA and USA as **absolute percentages of TLA** — not as fractions of TOSL. This is an important distinction from certain exam-review simplifications that define ISA as a "fraction of TOSL":[^1]

- **Code (canonical):** ISA% and USA% are direct % of TLA. For example, for R-2 Basic without firewall: ISA = 30% of TLA, USA = 10% of TLA, TOSL = 40% of TLA
- **Exam-review shorthand:** ISA% is sometimes expressed as a fraction of TOSL (e.g., ISA/TOSL = 75% for R-2 Basic, since 30/40 = 75%)

For a parametric engine, **the canonical code approach** (both ISA and USA as % of TLA) is more robust and avoids compounding rounding errors.[^1]

***

### Section 804 — Setbacks / Courts and Yards

#### Table VIII.2 — Minimum Setbacks for Residential Buildings

| **Type** | **Front (m)** | **Side (m)** | **Rear (m)** |
|----------|--------------|-------------|-------------|
| R-1 | 4.50 | 2.00 | 2.00 |
| R-2 Basic | 3.00 | 2.00 \*\* | 2.00 |
| R-2 Maximum | 8.00 \* | 2.00 \*\* | 2.00 |
| R-3 Basic | 3.00 | 2.00 | 2.00 \*\*\* |
| R-3 Maximum | 8.00 \* | 2.00 | 2.00 \*\*\* |
| R-4 (Individual) | 4.50 | optional | optional \*\*\* |
| R-5 | 6.00 | 3.00 (optional) | 3.00 |

Notes:
- \* Total at grade = 3.00 m + 5.00 m = 8.00 m (partial parking accommodation); upper floors revert to 3.00 m minimum
- \*\* Setback required on **one side only**
- \*\*\* Abutments on two sides and rear may be allowed subject to Section 804.10 conditions[^1]

#### Table VIII.3 — Setbacks for Commercial, Industrial, Institutional, and Recreational Buildings

| **RROW Width** | **Front (m)** | **Side (m)** | **Rear (m)** |
|----------------|--------------|-------------|-------------|
| ≥ 30.00 m | 8.00 | 5.00 | 5.00 |
| 25.00 – 29.00 m | 6.00 | 3.00 | 3.00 |
| 20.00 – 24.00 m | 5.00 | 3.00 | 3.00 |
| 10.00 – 19.00 m | 5.00 | 2.00 | 2.00 |
| Below 10.00 m | 5.00 | 2.00 | 2.00 |

[^1]

#### Section 804.6 — Incremental Setbacks for Tall Buildings

For buildings of more than **two (2) storeys**, the minimum width of the rear or side court shall be increased at the rate of **300 mm for each additional storey** up to the **14th storey**. For buildings exceeding 14 storeys, the required width is computed on the basis of 14 storeys.[^1]

\[\text{Incremental setback (n storeys)} = \text{base court width} + 0.30 \times (n - 2), \quad \text{for } 2 < n \leq 14\]

***

### Section 805 — Ceiling Heights

| **Condition** | **Minimum Height** |
|---------------|-------------------|
| Artificial ventilation (1st storey) | 2.70 m |
| Artificial ventilation (2nd storey) | 2.40 m |
| Artificial ventilation (3rd storey and above) | 2.10 m clear head-room |
| Natural ventilation (all storeys) | 2.70 m |
| Mezzanine (above and below) | 1.80 m |

[^1]

***

### Section 806 — Room Sizes

| **Room Type** | **Minimum Floor Area** | **Minimum Dimension** |
|---------------|----------------------|----------------------|
| Rooms for human habitation | 6.00 sqm | 2.00 m |
| Kitchen | 3.00 sqm | 1.50 m |
| Bath/toilet | 1.20 sqm | 900 mm |

[^1]

***

### Section 807 — Air Space Requirements

| **Space Type** | **Min. Air Space / Person** | **Min. Floor Area / Person** |
|----------------|---------------------------|------------------------------|
| Schoolrooms | 3.00 cu. m | 1.00 sqm |
| Workshops, factories, offices | 12.00 cu. m | — |
| Habitable rooms | 14.00 cu. m | — |

[^1]

***

### Section 808 — Window Openings

- **All habitable rooms:** Total free opening area ≥ **10% of floor area**, minimum **1.00 sqm**[^1]
- **Toilets, bathrooms, laundry rooms:** Opening area ≥ 1/20 of floor area, minimum **240 sq. mm**[^1]
- **Eaves/canopies over required windows:** Not less than **750 mm from side and rear property lines**[^1]
- **Emergency egress windows:** Minimum clear width of **820 mm** and height of **1.00 m**; sill not more than **820 mm from floor**[^1]
- **Firewalls:** Absolutely **no openings** are allowed on any firewall or abutment, except permitted vent wells[^1]

***

### Section 809 — Vent Shafts

- Minimum cross-sectional area: **1.00 sqm per meter of shaft height**, never less than 1.00 sqm total[^1]
- Minimum dimension: **600 mm**[^1]

***

### Section 811 — Artificial Ventilation (Table VIII.4 — Air Changes)

When artificial ventilation is required, minimum air changes per hour (ACH) are prescribed in Table VIII.4 by room type and ceiling height. Selected examples:[^1]

| **Space Type** | **ACH at 2.40 m ceiling** | **ACH at 3.00 m ceiling** | **Min Cu.m/min/person** |
|----------------|--------------------------|--------------------------|------------------------|
| Apartment | 3 | 2 | 0.29 |
| Restaurant/Kitchen | 5 | 3¾ | 0.34 |
| Hospital Room | 6 | 4½ | 0.29 |
| Office | 4 | 3 | 0.29 |
| Theater | 3 | 2 | 0.14 |
| Gambling Room | 6 | 6 | 0.57 |

[^1]

***

## Part III — Cross-Rule Formula Summary

### Master Relationships (All Canonical)

\[\text{TLA} = \text{AMBF} + \text{TOSL}\]

\[\text{TOSL} = \text{ISA} + \text{USA}\]

\[\text{MACA} = \text{AMBF} + \text{ISA} = \text{TLA} - \text{USA}\]

\[\text{PSO\%} = \frac{\text{AMBF}}{\text{TLA}} \times 100\]

\[\text{GFA} = \text{TLA} \times \text{FLAR}\]

\[\text{TGFA} = \text{GFA} \times \text{Multiplier}_{VII.G.2} \approx \text{Storeys} \times \text{AMBF}\]

\[\text{AMVB}_{initial} = \text{AMBF} \times \text{BHL (m)}\]

\[\text{AMVB}_{final} = \text{AMVB}_{initial} - \text{Volume above angular plane}\]

[^8][^3][^1]

***

### Implementation Plan Notes (Corrections and Clarifications)

The implementation plan in the query uses a **pedagogically sound** and largely correct set of formulas. The following clarifications align it precisely with the 2004 Revised IRR:

1. **AMBF is the minimum of setback-based area AND PSO-based coverage** — the plan correctly implements `AMBF = min(ambfSetback, ambfCoverage)`[^1]
2. **ISA and USA should be expressed as % of TLA, not as % of TOSL** — the plan's `isaRatio` (fraction of TOSL) is a pedagogical shortcut, not the canonical IRR form. The code's Table VIII.1 gives ISA% and USA% directly relative to TLA[^1]
3. **R-1 does not have a PSO value in Table VIII.1** — it is governed purely by setback/yard minimums in Table VIII.2; no `maxLotCoverageRatio` from zoning alone is applicable without setback computation[^1]
4. **Firewall status changes PSO significantly** — plans that omit the `e/f` firewall toggle are incomplete; differences can be 5–15 percentage points[^1]
5. **MACA = AMBF + ISA (not just PSO alone)** — the plan's formula `maca = psoArea + ISA` is correct[^1]
6. **The closure identity `TLA = AMBF + ISA + USA` is the correct consistency check** — this is confirmed by the official IRR Note (d): "PSO + TOSL = TLA"[^1]

***

## Part IV — Glossary of Development Control Terms

| **Term** | **Full Name** | **Rule Reference** |
|----------|---------------|-------------------|
| TLA | Total Lot Area | Rule VIII §802 |
| PSO | Percentage of Site Occupancy | Rule VIII §803 |
| AMBF | Allowable Maximum Building Footprint | Rule VII §704.4 |
| TOSL | Total Open Space within Lot | Rule VIII §803.3b |
| ISA | Maximum Allowable Impervious Surface Area | Rule VIII §803.3b.i |
| USA | Minimum Unpaved Surface Area | Rule VIII §803.3b.ii |
| MACA | Maximum Allowable Construction Area | Rule VIII Table VIII.1 |
| TGFA | Total Gross Floor Area | Rule VII §705 |
| GFA | Gross Floor Area | Rule VII §705 |
| FLAR | Floor to Lot Area Ratio (= FAR) | Rule VII Table VII.G.1 |
| BHL | Building Height Limit | Rule VII §707 |
| AMVB | Allowable Maximum Volume of Building | Rule VII Guidelines |
| RROW | Road Right-of-Way | Rule VIII §804 |
| OFB | Outermost Face of the Building | Rule VII Guidelines |
| OLBP | Outermost Limit of Building Projection | Rule VII Guidelines |

---

## References

1. [Building Light & Ventilation Regulations in the Philippines](https://studylib.net/doc/25211679/pd1096-rule-viii.pdf) - Philippine building code on light, ventilation, site occupancy, open spaces, and zoning requirements...

2. [Building Light & Ventilation Regulations - Philippines](https://studylib.net/doc/26101872/irr-rule-viii---light-and-ventilation) - Philippine building code on light, ventilation, site occupancy, and open space. Legal guidelines for...

3. [Zoning Classifications and Occupancy Rules | PDF | Building - Scribd](https://www.scribd.com/document/685030628/Pd1096-Rule-7-and-8-Nbcp) - building bulk. Table VII.G.1. Reference Table of Floor to Lot Area Ratio (FLAR) Designations/Rights....

4. [SECTION 705. Allowable Floor Areas - Architects Online Review](https://alereviewers.wordpress.com/architectural-practice/pd1096/classification-and-general-requirements-of-all-buildings-by-use-or-occupancy/allowable-floor-areas/) - Table VII.1. Allowable Maximum Total Gross Floor Area (TGFA) Based on the Allowed Percentage of Site...

5. [2. Building Height Limit (BHL) Determination and Guidelines](https://www.studocu.com/ph/document/bulacan-state-university/architecture/2-building-height-limit-bhl-determination-and-guidelines/126987892) - Share free summaries, lecture notes, exam prep and more!!

6. [TGFA Calculation and Zoning Guidelines | PDF - Scribd](https://www.scribd.com/document/520899451/409747576-Table-VII-MULTIPLIER-nbcp-rule-7-docx) - It lists the percentage of excluded floor areas for each type, and provides a multiplier to convert ...

7. [TGFA and GFA Conversion Guidelines | PDF - Scribd](https://www.scribd.com/document/409747576/Table-VII-MULTIPLIER-docx) - It lists the percentage of excluded floor areas for each type, and the corresponding multiplier to a...

8. [Guidelines for Building Bulk & Development Controls in ...](https://www.studocu.com/ph/document/polytechnic-university-of-the-philippines/bs-civil-engineering/rule-vii-guidelines-1-1/60977529) - The 2004 Revised IRR of P. No. 1096 (as published by the DPWH on 01, 08 & 15 April 2005) Note: Excep...

9. [Development Controls | PDF | Civil Engineering | Building Technology](https://fr.scribd.com/document/557027975/DEVELOPMENT-CONTROLS-2) - This document defines various development controls (DC) that regulate the physical development of pr...

