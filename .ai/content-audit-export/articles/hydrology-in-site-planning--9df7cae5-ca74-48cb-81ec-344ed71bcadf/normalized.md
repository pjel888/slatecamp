# Hydrology in Site Planning
## Learning Goal
After reading this article, you should be able to:

Analyze site hydrology for stormwater management and drainage design: calculate runoff using the Rational Method (Q = CiA); apply minimum pipe sizes and slope for site drainage; determine detention/retention volume requirements; and identify flood zone restrictions and 100-year floodplain development limitations.
**An Immersive LEA Review Module**

---

## The Real-World Scenario (The Hook)

You are designing a 1.5-hectare commercial development in Quezon City on gently sloping terrain that drains toward an existing creek 80 meters to the south. The lot is currently 70% pervious (grass and soil), but post-development impervious coverage will jump to 85% due to buildings, parking, and concrete pathways. Your site plan must demonstrate that your stormwater management system — including surface grading, swleas, and drainage infrastructure — will not increase peak runoff to the creek beyond pre-development levels, or the DENR-EMB and the local government will reject your development application.

---

## Core Concepts

[SLATECAMP_UI_BLOCK:ui_0053 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memory Aid: "S-S-S = Slope, Swale, Storm."** Slope (min 1-2% away from buildings), Swale (shallow vegetated channels, side slopes max 3:1, longitudinal 1-5%), Storm (Rational Method Q = C × i × A).
[/SLATECAMP_UI_BLOCK]


- **Hydrology in Site Planning** governs how water moves across, into, and away from a development site. The architect must manage three interrelated systems: (1) surface drainage — directing sheet flow and channeled flow away from structures; (2) subsurface drainage — managing the water table and subgrade moisture; and (3) stormwater management — controlling peak runoff volumes and quality before discharge into public waterways.

- **Surface Drainage and Grading:** The most fundamental tool. All paved and unpaved surfaces must be graded to direct water away from buildings toward collection points (catch basins, swleas, or drainage channels). Minimum surface slopes of **1–2%** are required to prevent ponding near structures, while maximum slopes depend on surface material and erosion potential.

- **Swleas:** Shallow, vegetated channels designed to convey, slow, and filter stormwater runoff. Unlike pipes and concrete channels, swleas reduce peak flow velocity, promote infiltration into the ground, and filter sediment and pollutants. They are a core component of Low-Impact Development (LID) and are especially effective in Philippine tropical conditions where intense but short-duration rainfall is common.

- **The Rational Method (Q = CiA):** The standard formula for estimating peak stormwater runoff from small drainage areas (&lt;20 hectares), widely used in Philippine site planning and drainage design. This formula directly links land development decisions (imperviousness → runoff coefficient C) to downstream flood impact.

---

## The Hard Data (Cheat Sheet)

[SLATECAMP_UI_BLOCK:ui_0054 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Application Scenario:** 1.5 ha QC development. Qpre = 0.4×100×1.5 = 60 L/s. Qpost = 0.85×100×1.5 = 127.5 L/s. Need 67.5 L/s detention storage to maintain pre-development peak flow.
[/SLATECAMP_UI_BLOCK]


| Parameter | Value / Standard | Source |
|---|---|---|
| **Storm Drainage System** | Required as part of sanitary/site engineering; must be separate from the sanitary sewer system | PD 1096 RIRR 2004, Rule IX (Sanitation) |
| **Minimum Surface Slope (near buildings)** | 1–2% away from building foundations to prevent ponding | Standard site engineering practice |
| **Maximum Surface Slope (unpaved/grass)** | 25% (4:1) before erosion control measures are required; 33% (3:1) with stabilization | Grading/earthwork standards |
| **Swlea Side Slopes** | Maximum 3:1 (horizontal : vertical) for mowable/maintainable swleas | LID design standards |
| **Swlea Longitudinal Slope** | 1–5% (optimal); `1% causes ponding, `5% causes erosion | Stormwater management practice |
| **Swlea Flow Velocity** | Should not exceed 1.0 m/s to prevent erosion in vegetated swleas | Hydraulic engineering standards |
| **Easement from Rivers/Creeks** | 3 m (urban), 20 m (agricultural), 40 m (forest) — no structures or obstructions | PD 1067 (Water Code), Art. 51 |
| **Flood Control Areas** | DPWH may declare flood control areas; activities that obstruct flow or increase flood levels are prohibited | PD 1067 (Water Code), Art. 53–54 |
| **Design Storm for Drainage** | Typically 10-year return period for commercial sites; 25-year for critical infrastructure; 5-year for residential | DPWH Design Guidelines; Local drainage standards |
| **DENR Water Quality Discharge** | Stormwater discharge must not degrade receiving water body quality; sediment basins may be required | DENR DAO 2016-08 (Water Quality Guidelines) |
| **Runoff Coefficients (C values)** | See Computations section below | Rational Method reference tables |

---

## Crucial Formulas & Computations

[SLATECAMP_UI_BLOCK:ui_0055 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **LEA Exam Pattern — Easement Distinction:** PD 1067 easement from rivers/creeks: 3 m (urban), 20 m (agricultural), 40 m (forest). No structures allowed within easement.
[/SLATECAMP_UI_BLOCK]


### 1. The Rational Method (Peak Runoff Estimation)

**Formula:**
```
Q = C × i × A
```

Where:
- **Q** = Peak runoff (cubic meters per second, m³/s) [or cubic feet per second in imperial]
- **C** = Runoff coefficient (dimensionless, 0 to 1.0) — represents the fraction of rainfall that becomes runoff
- **i** = Rainfall intensity (mm/hr or in/hr) — for the design storm duration equal to the time of concentration
- **A** = Drainage area (hectares) [use conversion factor: 1 ha = 10,000 m²]

**Metric conversion note:** When using metric units (i in mm/hr, A in hectares), apply:
```
Q (m³/s) = (C × i × A) / 360
```

**Common Runoff Coefficients (C) for Philippine Conditions:**

| Surface Type | C Value |
|---|---|
| Concrete / Asphalt pavement | 0.85–0.95 |
| Rooftops (impervious) | 0.90–0.95 |
| Gravel / Compacted earth | 0.50–0.70 |
| Grass / Lawns (flat, &lt;2% slope) | 0.10–0.20 |
| Grass / Lawns (steep, >7% slope) | 0.25–0.35 |
| Parks / Open space (mixed) | 0.15–0.30 |
| Dense residential | 0.60–0.75 |
| Commercial / Industrial | 0.75–0.95 |

**Example:**
A 1.0-hectare commercial lot in Quezon City. Post-development: 60% impervious (C = 0.90), 40% grass (C = 0.20). Design storm intensity for 10-year return period = 150 mm/hr.

**Step 1: Calculate weighted C:**
```
C_weighted = (0.60 × 0.90) + (0.40 × 0.20) = 0.54 + 0.08 = 0.62
```

**Step 2: Calculate peak runoff Q:**
```
Q = (0.62 × 150 × 1.0) / 360 = 93.0 / 360 = 0.258 m³/s
```

**Step 3: Compare to pre-development Q:**
Pre-development (100% grass, flat): C = 0.15
```
Q_pre = (0.15 × 150 × 1.0) / 360 = 22.5 / 360 = 0.0625 m³/s
```

The development increases peak runoff by over **4×** — from 0.0625 to 0.258 m³/s. This demonstrates why stormwater detention/retention is critical: the site plan must include swleas, detention basins, or retention ponds to attenuate the 0.196 m³/s increase before discharge to the creek.

### 2. Swlea Sizing (Manning's Equation for Open Channel Flow)

**Formula:**
```
Q = (1/n) × A × R^(2/3) × S^(1/2)
```

Where:
- **Q** = Flow capacity (m³/s)
- **n** = Manning's roughness coefficient (0.03–0.05 for grass-lined swleas)
- **A** = Cross-sectional area of flow (m²)
- **R** = Hydraulic radius = A / P (P = wetted perimeter)
- **S** = Longitudinal slope of swlea (m/m)

This formula is used to verify that a designed swlea can convey the peak runoff calculated from the Rational Method without overtopping.

---

## LEA Exam Traps and Common Mistakes

- **Trap 1: Confusing storm drainage with sanitary sewer systems.** PD 1096 RIRR Rule IX (Sanitation) covers both — but storm drainage (rainwater) and sanitary sewage (wastewater) are **separate systems** in Philippine practice. Never combine them. The LEA will test whether you know that stormwater must be managed independently.

- **Trap 2: Ignoring the runoff coefficient increase from development.** A common LEA scenario gives pre-development and post-development land-use data and asks you to calculate the change in peak runoff. Students who forget to calculate a **weighted C** for mixed surfaces (impervious + pervious) will get the wrong answer. Always calculate a weighted average when surface types are mixed.

- **Trap 3: Citing PD 1096 as the governing law for waterway easements.** The setback from rivers, creeks, and coastlines is governed by **PD 1067 (Water Code of the Philippines), Article 51** — not by PD 1096. The Water Code specifies 3 m (urban), 20 m (agricultural), 40 m (forest). PD 1096 setbacks are building-to-property-line requirements, which are completely different.

---


[SLATECAMP_UI_BLOCK:ui_0056 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: ⚠️ Design storm return period: 5-year (residential), 10-year (commercial/mall), 25-year (critical infrastructure). Know which applies to which project type.
[/SLATECAMP_UI_BLOCK]

## Active Recall Questions

### Question 1
Using the Rational Method, calculate the peak stormwater runoff (Q) for a 2-hectare site with a weighted runoff coefficient of 0.70 and a design storm rainfall intensity of 120 mm/hr.

A. 0.47 m³/s  
B. 0.58 m³/s  
C. 168.0 m³/s  
D. 0.33 m³/s  

> **Answer: A. 0.47 m³/s**  
> Using Q = (C × i × A) / 360 = (0.70 × 120 × 2.0) / 360 = 168 / 360 = 0.467 ≈ **0.47 m³/s**. Option C (168.0) is the numerator before dividing by 360 — a common error when students forget the metric conversion factor. Option B and D result from incorrect C or A values.

### Question 2
Under PD 1067 (Water Code of the Philippines), what is the minimum easement from the banks of rivers and streams in **agricultural areas** where no structures may be built?

A. 3 meters  
B. 10 meters  
C. 20 meters  
D. 40 meters  

> **Answer: C. 20 meters**  
> Article 51 of PD 1067 establishes the following easement zones from river/stream banks: 3 meters in urban areas, 20 meters in agricultural areas, and 40 meters in forest areas. These are no-build zones subject to the easement of public use. Option A (3 m) is for urban areas; Option D (40 m) is for forest areas.

### Question 3
A site planner converts a 100% grass lot (C = 0.15) into a 100% paved parking lot (C = 0.90). By what factor does the peak stormwater runoff increase, assuming the same storm event?

A. 2 times  
B. 4 times  
C. 6 times  
D. 9 times  

> **Answer: C. 6 times**  
> Since Q = C × i × A, and both i and A remain constant, the ratio of post-development to pre-development runoff is simply C_post / C_pre = 0.90 / 0.15 = **6.0 times**. This dramatically illustrates why full imperviousness without detention/retention is unacceptable. The LEA uses this type of ratio question to test conceptual understanding of the Rational Method without requiring full computation.

---

## Cross‑References

**Microclimate Analysis**, **Topography And Slope Analysis**, **Geological Hazards**, **Flora And Fauna In Site Development**

