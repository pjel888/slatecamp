# Topography and Slope Analysis
**An Immersive LEA Review Module**

---

## Learning Goal

After reading this article, you should be able to:

Interpret contour maps to calculate slope percentages and identify buildable areas; apply slope categories (< 15% buildable, 15-25% challenging, > 25% constrained) to site planning decisions; calculate cut and fill volumes using the average-end-area method; and determine drainage patterns and erosion control requirements from topographic data.

## The Real-World Scenario (The Hook)

You are the project architect for a 3-storey school building on a 5,000 sq.m. hillside lot in Baguio City. The site slopes from elevation 1,520 m at the northwest corner down to 1,505 m at the southeast corner over a horizontal distance of 120 meters. Before you can even begin your floor plan, you need to determine the site's average slope percentage, identify which zones are buildable and which require retaining walls, and compute the cut-and-fill volumes to present a balanced earthwork strategy that minimizes hauling costs — all while complying with the NSCP foundation requirements and local geohazard restrictions on steep-slope construction.

---

## Core Concepts

- **Topography and Contour Analysis:** Topography is the three-dimensional shape of the land surface, represented on plans through contour lines (lines of equal elevation). Contour interval is the vertical distance between adjacent contour lines. Closely spaced contours indicate steep slopes; widely spaced contours indicate gentle terrain. Reading contour maps is a foundational LEA skill for site planning — the architect must be able to determine slope direction, identify ridges and valleys, locate drainage paths, and assess buildability from a topographic survey.

- **Slope Analysis:** Slope is the ratio of vertical rise to horizontal run, expressed as a percentage (%), a ratio (e.g., 1:4), or degrees. Different slope ranges have different buildability implications:
  - **0–5%:** Easily buildable; minimal grading required; may need attention to drainage (too flat can cause ponding)
  - **5–15%:** Buildable with moderate grading; standard foundation systems; good natural drainage
  - **15–25%:** Challenging; requires stepped foundations, retaining walls, or split-level design
  - **25–40%:** Difficult; significant earthwork, retaining structures, and erosion control required
  - **>40%:** Generally unbuildable for conventional structures; slope stabilization or specialized engineering required

- **Cut-and-Fill Earthwork:** The process of reshaping terrain by removing soil from high areas (cut) and depositing it in low areas (fill) to create level building pads, roads, and drainage channels. The goal is to **balance cut and fill volumes** (cut ≈ fill) so that no soil needs to be imported or exported from the site, minimizing cost and environmental impact.

- **Buildability Limits:** The constraints imposed by terrain, soil conditions, and regulations that determine whether a site can be safely and economically developed. These include maximum allowable slopes for construction, foundation depth requirements, retaining wall necessities, and geohazard zone restrictions. Philippine practice must also account for seismic stability of slopes (NSCP) and flood/landslide hazard mapping (PHIVOLCS, MGB).

---

## The Hard Data (Cheat Sheet)

| Parameter | Value / Standard | Source / Basis |
|---|---|---|
| **Slope Formula** | Slope (%) = (Rise / Run) × 100 | Universal surveying/engineering standard |
| **Slope as Ratio** | Rise : Run (e.g., 1:4 means 1 unit vertical per 4 units horizontal = 25%) | Universal standard |
| **Slope in Degrees** | θ = arctan(Rise / Run) | Trigonometric conversion |
| **0–5% Slope** | Easily buildable; minimal grading; watch for poor drainage if too flat | Site planning practice |
| **5–15% Slope** | Buildable with moderate grading; ideal range for most building types | Site planning practice |
| **15–25% Slope** | Requires stepped/split-level foundations, retaining walls | Site planning practice |
| **25–40% Slope** | Difficult; major earthwork and retaining structures needed | Site planning practice |
| **>40% Slope (>22°)** | Generally unbuildable; high landslide risk; often classified as geohazard zone | MGB/PHIVOLCS hazard maps |
| **>50% Slope** | Classified as Environmentally Critical Area (steep slopes) under Proclamation 2146 | Proc. 2146; EIS System |
| **BP 344 Maximum Ramp Slope** | 1:12 (8.33%) for accessibility | BP 344 (Accessibility Law) |
| **PD 1096 Minimum Lot Grading** | Lots must be graded to drain surface water away from buildings and toward approved collection/discharge points | PD 1096 RIRR, Rule XIX (Site Development) |
| **Retaining Wall Requirement** | Required when cut or fill height exceeds 1.5 m or when adjacent property would be affected by the grading | Standard engineering practice; local building codes |
| **Cut-and-Fill Balance Goal** | Cut volume ≈ Fill volume (net zero earthwork) to minimize hauling | Earthwork economy principle |
| **Soil Swell Factor** | Excavated soil increases in volume by 20–40% (clay ≈ 30%; sand/gravel ≈ 20%; rock ≈ 40–60%) | Earthwork engineering |
| **Soil Shrinkage Factor** | Compacted fill decreases from loose volume by 10–20% | Earthwork engineering |
| **Maximum Fill Height without Engineering** | Generally 1.5 m of uncontrolled fill; beyond this, engineered (compacted) fill with testing is required | Geotechnical practice |

---

## Crucial Formulas & Computations

### 1. Slope Calculation

**Percentage Slope:**
```
Slope (%) = (Rise / Run) × 100
```

**Slope as Ratio:**
```
Slope Ratio = 1 : (Run / Rise)
```

**Slope in Degrees:**
```
θ = arctan(Rise / Run)
```

**Example:**
A site drops 15 meters over a horizontal distance of 120 meters.
```
Slope (%) = (15 / 120) × 100 = 12.5%
Slope Ratio = 1 : (120 / 15) = 1:8
θ = arctan(15 / 120) = arctan(0.125) = 7.13°
```
At **12.5% slope**, this site is in the "buildable with moderate grading" range (5–15%). Standard foundations are feasible, but the architect should consider stepped floor levels or a split-level design to work with the natural grade rather than against it.

### 2. Cut-and-Fill Volume (Average End Area Method)

The most common method for computing earthwork volumes between cross-sections.

**Formula:**
```
V = [(A₁ + A₂) / 2] × L
```

Where:
- **V** = Volume of earthwork between two cross-sections (m³)
- **A₁** = Cross-sectional area of cut or fill at Station 1 (m²)
- **A₂** = Cross-sectional area of cut or fill at Station 2 (m²)
- **L** = Horizontal distance between the two stations (m)

**Example:**
A road cut between two stations 20 m apart:
- Station 1: Cut area = 12.0 m²
- Station 2: Cut area = 18.0 m²

```
V_cut = [(12.0 + 18.0) / 2] × 20 = [30.0 / 2] × 20 = 15.0 × 20 = 300.0 m³
```

The cut volume between these two stations is **300.0 m³** (bank/in-place volume).

### 3. Swell and Shrinkage Adjustment

**Swell (for hauling/trucking estimates):**
```
V_loose = V_bank × (1 + Swell Factor)
```

**Shrinkage (for compacted fill estimates):**
```
V_compacted = V_loose × (1 − Shrinkage Factor)
```

**Example:**
300 m³ of clay excavation (swell factor = 0.30, shrinkage factor = 0.15):
```
V_loose = 300 × 1.30 = 390 m³  (volume in trucks)
V_compacted = 390 × (1 − 0.15) = 390 × 0.85 = 331.5 m³  (volume after compaction as fill)
```

**Key insight for LEA:** If you cut 300 m³ (bank) and need to fill 300 m³ (compacted), you do NOT have a balanced site. The 300 m³ bank cut only produces ~331.5 m³ compacted fill after swell and shrinkage — but if the required compacted fill is 350 m³, you have a deficit and must import soil. Always account for swell/shrinkage in earthwork balancing.

### 4. Grid Method for Volume Computation (Simplified)

For sites with regular grid survey points:

**Formula:**
```
V = (Grid Area) × Σ[(h₁ + h₂ + h₃ + ... + hₙ) / n]
```

Where each **h** = height of cut or fill at each grid point, and **n** = number of grid points per cell.

For a rectangular grid with 4 corner points per cell:
```
V_cell = (Grid Spacing)² × [(h₁ + h₂ + h₃ + h₄) / 4]
```

**Example:**
Grid spacing = 10 m × 10 m. One grid cell with cut heights at corners: 1.2 m, 0.8 m, 1.5 m, 1.0 m.
```
V_cell = (10)² × [(1.2 + 0.8 + 1.5 + 1.0) / 4] = 100 × [4.5 / 4] = 100 × 1.125 = 112.5 m³
```

Sum all grid cells across the site for total cut and fill volumes.

---

## LEA Exam Traps and Common Mistakes

- **Trap 1: Confusing percentage slope with degree slope.** A 100% slope ≠ 90°. A **100% slope = 45°** (rise equals run). A **50% slope = 26.6°**. The LEA may present slopes in one format and ask for conversion to another. Always remember: Slope (%) = tan(θ) × 100, so θ = arctan(Slope% / 100).

- **Trap 2: Forgetting swell and shrinkage in cut-and-fill balancing.** Students often assume that 500 m³ of cut directly produces 500 m³ of usable fill. It does not. Excavated soil swells (increases in volume when loosened) and then shrinks when compacted. A "balanced" site on paper (equal cut and fill areas) may actually have a soil deficit or surplus in practice. The LEA tests this concept.

- **Trap 3: Treating steep slopes as merely a design inconvenience.** In Philippine regulatory context, slopes greater than 50% (approximately 27°) are classified as Environmentally Critical Areas under Proclamation No. 2146, triggering ECC requirements. The Mines and Geosciences Bureau (MGB) may also classify steep, geologically unstable slopes as no-build zones. The LEA answer for "Can you build on a 45% slope?" is not just "it's expensive" — it may be "you need an ECC" or "it's prohibited."

---

## Active Recall Questions

### Question 1
A site has an elevation change of 8 meters over a horizontal distance of 50 meters. What is the slope expressed as a **percentage** and as a **ratio**?

A. 16%, 1:6.25  
B. 6.25%, 1:16  
C. 16%, 1:8  
D. 8%, 1:50  

> **Answer: A. 16%, 1:6.25**  
> Slope (%) = (Rise / Run) × 100 = (8 / 50) × 100 = **16%**. Slope ratio = 1 : (Run / Rise) = 1 : (50 / 8) = **1:6.25**. Option B reverses the percentage and ratio. Option C incorrectly calculates the ratio as 1:8 (using only the rise). Option D divides rise by total distance rather than computing rise/run properly. At 16%, this site is in the "challenging" buildability range requiring stepped foundations or retaining walls.

### Question 2
Using the Average End Area Method, calculate the cut volume between two stations **25 meters apart**, where Station A has a cut cross-section of 10 m² and Station B has a cut cross-section of 14 m².

A. 250 m³  
B. 300 m³  
C. 350 m³  
D. 600 m³  

> **Answer: B. 300 m³**  
> V = [(A₁ + A₂) / 2] × L = [(10 + 14) / 2] × 25 = [24 / 2] × 25 = 12 × 25 = **300 m³**. Option A (250) results from using only A₁ (10 × 25). Option C (350) results from using only A₂ (14 × 25). Option D (600) results from adding A₁ + A₂ without dividing by 2 and then multiplying by L. Always average the two end areas first, then multiply by the distance between stations.

### Question 3
An architect excavates 400 m³ (bank volume) of clay soil with a swell factor of 30% and a compaction shrinkage factor of 15%. What is the **compacted fill volume** that this excavated material will produce?

A. 400.0 m³  
B. 442.0 m³  
C. 520.0 m³  
D. 340.0 m³  

> **Answer: B. 442.0 m³**  
> Step 1: Loose volume = 400 × 1.30 = 520 m³. Step 2: Compacted volume = 520 × (1 − 0.15) = 520 × 0.85 = **442.0 m³**. Option A assumes no volume change. Option C is the loose volume (before compaction). Option D incorrectly subtracts 15% from the bank volume. The correct sequence is: Bank → Swell → Loose → Compact → Compacted fill. This 442 m³ result means the 400 m³ cut produces more compacted fill than the original bank volume — because swell outweighs shrinkage in clay. If your fill requirement is only 400 m³, you have a 42 m³ surplus to dispose of.

---

<LawCallout code="pd1096" section="Rule VIII - Site Development">


Per the NSCP, foundations on sloping sites must be designed for the actual soil conditions at each foundation level. Stepped footings are required where slope exceeds 15%. Retaining walls are mandatory where cut or fill slopes exceed 2H:1V. Geotechnical investigation is required for any building on slopes >25%.


</LawCallout>

<Tip >

Remember the slope buildability ranges: 0-5% (easy), 5-15% (moderate), 15-25% (challenging/stepped foundations), 25-40% (difficult/retaining walls), >40% (generally unbuildable). On exam problems, classify the slope first, then identify the required foundation approach.

</Tip>

<ExamTip >

Cut-and-fill balance problems on the LEA typically give you a site cross-section with elevations at regular intervals. Calculate the average elevation, then determine cut and fill areas. The goal is cut ≈ fill to minimize hauling costs. Watch for questions that test whether you know that material compaction reduces fill volume by approximately 15-25%.

</ExamTip>

---



<ArticleMedia type="image" caption="Contour Map Interpretation — Slope Calculation and Buildable Zone Analysis" alt="Annotated contour map showing: contour interval and index contours, slope calculation using Rise/Run × 100 formula, buildable zones (<15% green), challenging zones (15-25% yellow), constrained zones (>25% red), cut-and-fill volume estimation using average-end-area method, and building pad grading with 2% minimum drainage slope." />
## Cross‑References

**Microclimate Analysis**, **Hydrology In Site Planning**, **Geological Hazards**, **Excavation Foundation And Veneer**

