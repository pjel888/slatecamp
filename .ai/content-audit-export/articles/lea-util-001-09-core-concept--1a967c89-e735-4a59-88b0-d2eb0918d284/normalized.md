## What You Need to Know for the LEA

## Learning Goal

Design rainwater harvesting systems — calculate catchment area, gutter/downspout sizing per PNS 1980, first-flush diversion, storage tank volume based on rainfall data, and filtration — for Philippine residential and commercial projects.
## Core Concept

Rainwater harvesting systems intercept precipitation at the point of collection (typically building roofs), treat or divert initial contaminated runoff, and store or reuse clean water. Stormwater management systems handle excess runoff that cannot be harvested, ensuring controlled drainage to prevent flooding and property damage. Both systems use the **Rational Method** to estimate peak discharge rates.

[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-util-001-09-core-concept", type="image", caption="Rainwater Harvesting System — Catchment, First-Flush, Storage, and Filtration", description="System diagram showing: roof catchment area, gutter and downspout collection, first-flush diversion device (first 0.75mm rainfall diverted), cistern storage tank with freeboard (150mm), pump, filtration unit, and distribution to non-potable uses. Storm drain overflow connection labeled. Rational Method formula Q=C×I×A illustrated.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]


The Rational Method formula is:

[SLATECAMP_UI_BLOCK:ui_0002 component="Callout" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Q = C × I × A** Where: - **Q** = peak discharge rate (m³/s) - **C** = runoff coefficient (dimensionless, 0–1) - **I** = rainfall intensity (mm/hr) - **A** = drainage area (hectares)
[/SLATECAMP_UI_BLOCK]
Extracted summary:
- Props: (none)
- Text: **Q = C × I × A** Where: - **Q** = peak discharge rate (m³/s) - **C** = runoff coefficient (dimensionless, 0–1) - **I** = rainfall intensity (mm/hr) - **A** = drainage area (hectares)

For rainwater harvesting, cistern sizing determines storage volume based on catchment area and target rainfall capture. The basic equation is:

[SLATECAMP_UI_BLOCK:ui_0003 component="Callout" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **V_cistern = A_roof × P × C_runoff** Where: - **V_cistern** = usable storage volume (m³) - **A_roof** = roof catchment area (m²) - **P** = design rainfall depth (mm) - **C_runoff** = roof runoff coefficient (typically 0.75–0.90 for concrete/tile)
[/SLATECAMP_UI_BLOCK]
Extracted summary:
- Props: (none)
- Text: **V_cistern = A_roof × P × C_runoff** Where: - **V_cistern** = usable storage volume (m³) - **A_roof** = roof catchment area (m²) - **P** = design rainfall depth (mm) - **C_runoff** = roof runoff coefficient (typically 0.75–0.90 for concrete/tile)

**Philippine Rainfall Context:**
Annual rainfall in the Philippines ranges from 2000 to 3000 mm (PAGASA climatic data), with monsoon seasons producing intensities of 100–200 mm/hr during peak events. Roof catchment coefficients typically vary: 0.85 for concrete or tile roofs (hydrology standards), 0.70 for asphalt shingles, and 0.55 for gravel-covered roofs.

**First-Flush Diversion:**
The first 0.5–1.0 mm of rainfall washes accumulated dust, bird droppings, and atmospheric deposits from roof surfaces. Many codes recommend first-flush diversion devices that bypass this initial runoff volume, protecting cistern water quality. The diverted volume equals:

[SLATECAMP_UI_BLOCK:ui_0004 component="Callout" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **V_first_flush = A_roof × D_first** (where D_first ≈ 0.75 mm typical)
[/SLATECAMP_UI_BLOCK]
Extracted summary:
- Props: (none)
- Text: **V_first_flush = A_roof × D_first** (where D_first ≈ 0.75 mm typical)

**Stormwater Drainage Sizing:**
Storm drain pipes must accommodate peak runoff under design storm conditions. The *Revised Plumbing Code of the Philippines* (and adopted standards per _PD 1096_) specifies minimum slopes (0.5–1.0% for storm lines) and pipe sizing based on Manning's equation or manufacturer data. Pipe diameter selection ensures velocity stays within acceptable bounds (0.6–3.0 m/s, per code standards) to prevent sedimentation and erosion.

### Worked Example 1: Cistern Sizing for a Residential Roof

**Given:**
- Roof catchment area: 120 m²
- Design monthly rainfall: 150 mm
- Roof surface: concrete tile, C_runoff = 0.85
- First-flush device installed (0.75 mm diversion)

**Find:** Effective cistern volume required

**Solution:**

Step 1: Calculate gross harvested volume:
V_gross = 120 m² × 150 mm × (1000 mm/m)⁻¹ × 0.85
V_gross = 120 × 0.150 × 0.85 = 15.3 m³

Step 2: Account for first-flush loss:
V_first_flush = 120 m² × 0.75 mm × (1000 mm/m)⁻¹ = 0.09 m³

Step 3: Effective usable volume:
V_cistern = 15.3 − 0.09 = **15.21 m³ ≈ 15 m³**

Standard tank selections would be 15 or 20 m³ (_tank availability per equipment standards_).

### Worked Example 2: Storm Drain Sizing Using Rational Method

**Given:**
- Drainage catchment area: 2.5 hectares
- Peak rainfall intensity: 120 mm/hr (10-year return period, per PD 1096)
- Land use: mixed residential and commercial
- Runoff coefficient: 0.65 (mixed development, PD 1096 Table reference)

**Find:** Peak discharge to design the storm drain diameter

**Solution:**

Step 1: Apply Rational Method:
Q = C × I × A
Q = 0.65 × 120 mm/hr × 2.5 ha

Convert units (1 ha = 10,000 m², 1 mm/hr = 0.2778 m³/(s·ha·mm/hr)):
Q = 0.65 × (120/3600) m/s/mm·mm × 2.5 ha
Q = 0.65 × 0.0333 m/s × 2.5 = **0.054 m³/s** = 54 liters/s

Step 2: Select pipe diameter using Manning's equation or nomograph (adopted per Revised Plumbing Code):
For V = 1.2 m/s (mid-range velocity) and S = 0.75% slope:
A_pipe = Q / V = 0.054 / 1.2 = 0.045 m²

From pipe tables: 250 mm diameter PVC storm pipe delivers ~0.050 m³/s at 0.75% slope.

**Selection:** 250 mm diameter storm drain at 0.75% slope (**Revised Plumbing Code Table reference for pipe capacity**)

## Key Provisions

| Property / Requirement | Value | Standard/Code | LEA Relevance |
|---|---|---|---|
| Annual Philippine rainfall (range) | 2000–3000 mm | PD 1096 (National Building Code) | Basis for design storm frequency and runoff intensity |
| Peak rainfall intensity (10-yr return) | 100–200 mm/hr (regional variation) | PAGASA climatic data | Input to Rational Method (I parameter) |
| Roof runoff coefficient (concrete/tile) | 0.85 | Revised National Plumbing Code | Determines effective harvest volume |
| Roof runoff coefficient (asphalt shingle) | 0.70 | Revised National Plumbing Code | Lower efficiency for non-rigid roofing |
| Roof runoff coefficient (gravel-covered) | 0.55 | Revised National Plumbing Code | Reduced by surface friction and absorption |
| First-flush diversion (typical depth) | 0.5–1.0 mm | Green Building Code (RA 9729 IRR) | Protects cistern by removing initial dirty runoff |
| Storm drain minimum slope | 0.5% (1:200) | Revised National Plumbing Code / PD 1096 Rule IX Sec 904 | Prevents stagnation and sedimentation |
| Storm drain velocity range (acceptable) | 0.6–3.0 m/s | Revised Plumbing Code | Maintains flow without scouring or silting |
| Storm drain pipe (minimum sizing) | 75–100 mm (residential) | Revised Plumbing Code Table | Prevents clogging; applied per area and intensity |
| Cistern freeboard (minimum) | 150 mm | General recommendation | Accommodates splash and cleaning access |
| Design storm recurrence | 10–25 years | PAGASA/local ordinance guidance | Standard for stormwater sizing in urban areas |

## Philippine Construction Context

The Philippines experiences two distinct monsoon seasons: the Southwest (May–October) and Northeast (November–April) monsoonal cycles. Metro Manila and coastal regions average 2000 mm annually; Cordillera and southeastern slopes exceed 4000 mm. The *PD 1096 Building Code for the Philippines* mandates that stormwater drainage systems accommodate peak runoff from a 10-year return storm, while cistern design typically targets monthly rainfall capture for reuse (WASH reduction). The _Revised Plumbing Code of the Philippines_ specifies minimum pipe slopes, velocity ranges, and diameters to prevent standing water and blockage common in tropical climates. Roof catchment efficiency varies with construction material: concrete or clay tile roofs (common in residential buildings) achieve 0.85 runoff coefficients; asbestos-cement or corrugated metal (informal settlements) may grade to 0.70–0.75. First-flush diversion is increasingly adopted in water-stressed regions as a cost-effective pre-treatment step before cistern storage.

## How It's Tested

**Pattern 1: Rational Method Calculation (Intermediate)**
- Scenario: A commercial parking lot drains to a detention basin. Given catchment area, rainfall intensity, and runoff coefficient, calculate peak discharge.
- Tested concept: Proper unit conversion (hectares to m², mm/hr to m/s), correct coefficient selection per land use.

**Pattern 2: Cistern Volume Sizing (Foundational)**
- Scenario: Residential rooftop with given area and monthly rainfall. Apply harvesting formula with runoff coefficient and first-flush loss.
- Tested concept: Linear scaling of area × rainfall × coefficient; accounting for contamination diversion.

**Pattern 3: Storm Drain Diameter Selection (Intermediate)**
- Scenario: Given design discharge Q, select pipe diameter ensuring velocity within code limits and slope provided.
- Tested concept: Relationship Q = V × A; application of pipe capacity tables per Revised Plumbing Code.

**Pattern 4: Monsoon/Rainfall Frequency Analysis (Advanced)**
- Scenario: Design a cistern for a region with seasonal variation. If wet season averages 500 mm/month and dry season 50 mm/month, determine required storage to maintain supply.
- Tested concept: Multi-month water balance; recognition of seasonal patterns specific to Philippine climate.

[SLATECAMP_UI_BLOCK:ui_0005 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memory Aids:** - **Q = CIA:** Discharge equals runoff Coefficient times rainfall Intensity times Area. Coefficient &lt;1 because not all rain becomes runoff (infiltration, evaporation). - **Roof Concrete = 0.85:** High runoff; asphalt shingle or gravel lower the coefficient. - **First-flush = dirty water:** Roughly 1 mm depth of initial rainfall carries roof debris. Divert before storage. - **Storm drain slope ≥ 0.5%:** Steep enough to flow; too steep (>2%) causes erosion. - **Velocity 0.6–3.0
[/SLATECAMP_UI_BLOCK]
Extracted summary:
- Props: (none)
- Text: **Memory Aids:** - **Q = CIA:** Discharge equals runoff Coefficient times rainfall Intensity times Area. Coefficient &lt;1 because not all rain becomes runoff (infiltration, evaporation). - **Roof Concrete = 0.85:** High runoff; asphalt shingle or gravel lower the coefficient. - **First-flush = dirty water:** Roughly 1 mm depth of initial rainfall carries roof debris. Divert before storage. - **Storm drain slope ≥ 0.5%:** Steep enough to flow; too steep (>2%) causes erosion. - **Velocity 0.6–3.0

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0006 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Forgetting to convert units in Rational Method (e.g., using mm/hr directly without converting to m/s or using hectares without converting to m²).", correction="Always apply unit conversion: 1 ha = 10,000 m²; I (mm/hr) ÷ 3,600 = I (m/s) or use 0.2778 × mm/hr × ha factor."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]
Extracted summary:
- Props: mistake="Forgetting to convert units in Rational Method (e.g., using mm/hr directly without converting to m/s or using hectares without converting to m²).", correction="Always apply unit conversion: 1 ha = 10,000 m²; I (mm/hr) ÷ 3,600 = I (m/s) or use 0.2778 × mm/hr × ha factor."
- Text: (none detected)

ed"]
[SLATECAMP_UI_BLOCK:ui_0007 component="Note" status="preserved"]
Extracted summary:
- Props: (none)
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0008 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Selecting storm drain pipe diameter without checking velocity, then finding either dry, sluggish pipes or erosive, noisy flow.", correction="Always verify velocity is 0.6–3.0 m/s using Q = V × A. Adjust slope or diameter to stay within range."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]
Extracted summary:
- Props: mistake="Selecting storm drain pipe diameter without checking velocity, then finding either dry, sluggish pipes or erosive, noisy flow.", correction="Always verify velocity is 0.6–3.0 m/s using Q = V × A. Adjust slope or diameter to stay within range."
- Text: (none detected)

[SLATECAMP_UI_BLOCK:ui_0009 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Assuming roof runoff coefficient is the same for all materials; it varies by surface (tile 0.85, shingle 0.70, gravel 0.55).\", \"Using annual rainfall directly as monthly cistern input, ignoring seasonal monsoon variation.\", \"Confusing 10-year return period (PD 1096 standard) with design life; recurrence and design life are independent.\", \"Forgetting freeboard (150 mm air gap) when calculating usable cistern volume.\", \"Applying a flat 1.0 m/s design velocity without checking code minimums; some regions require ≥ 0.75 m/s.\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]
Extracted summary:
- Props: mistakes="{[\"Assuming roof runoff coefficient is the same for all materials; it varies by surface (tile 0.85, shingle 0.70, gravel 0.55).\", \"Using annual rainfall directly as monthly cistern input, ignoring seasonal monsoon variation.\", \"Confusing 10-year return period (PD 1096 standard) with design life; recurrence and design life are independent.\", \"Forgetting freeboard (150 mm air gap) when calculating usable cistern volume.\", \"Applying a flat 1.0 m/s design velocity without checking code minimums; some regions require ≥ 0.75 m/s.\"]}"
- Text: (none detected)

## Related Articles

See also within Plumbing and Sanitary Systems: **lea-util-001-06-core-concept**, **lea-util-001-07-core-concept**, **lea-util-001-08-core-concept**.

> **Overview:** See **overview-building-utilities-mepf** for the full curriculum structure and study strategy. See **mastery-building-utilities-mepf** for connections across topics.

