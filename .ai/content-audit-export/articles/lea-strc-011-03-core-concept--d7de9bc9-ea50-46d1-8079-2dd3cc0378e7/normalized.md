## What You Need to Know for the LEA

## Learning Goal

By the end of this article, you will be able to:

- Classify soil by type (clay, silt, sand, gravel) and estimate bearing capacity from SPT N-values
- Define Proctor compaction and verify fill compliance from field density data
- Distinguish immediate, primary consolidation, and secondary settlement
- Explain how groundwater and soil compressibility affect foundation design

---
## Core Concept
<ArticleMedia id="media-lea-strc-011-03-core-concept" type="image" caption="Geotechnical Investigation — Soil Profile and Bearing Capacity" alt="Diagram of a geotechnical boring log showing: (1) Soil profile layers (topsoil, clay, sand, weathered rock, bedrock); (2) Standard Penetration Test (SPT) N-values at each depth; (3) Groundwater table elevation; (4) Soil classification per USCS; (5) Allowable bearing capacity calculated from soil properties. Boring location plan on site map showing required number of borings per structure type." suggestedAsset="Diagram or reference image" status="placeholder" />
Geotechnical engineering characterizes soil, predicts its behavior under load, and specifies construction practices to achieve stable foundations. Five core topics unite this field:

**1. Soil Classification and Properties:**

Soil is classified by grain size and plasticity. Classification systems include USCS (Unified Soil Classification System):
- _Clay_: Fine-grained soil (< 0.005 mm) with significant cohesion and plasticity. Exhibits strength gain with compaction and age. Highly compressible; consolidation settlement is significant and time-dependent.
- _Silt_: Fine-grained soil (0.005–0.075 mm) with intermediate plasticity and compressibility. Often exhibits poor drainage.
- _Sand_: Coarse-grained soil (0.075–4.75 mm) with negligible cohesion. Strength depends on density and confining pressure. Low compressibility; immediate settlement dominates.
- _Gravel_: Coarse-grained soil (> 4.75 mm). High strength and low compressibility.

Plasticity Index (PI = LL − PL, where LL is liquid limit, PL is plastic limit) quantifies clay behavior. High PI clays are highly compressible and problematic for foundations.

**2. Fill and Fill Compaction:**

_Fill_ is soil brought to a site for raising grades, backfilling, or material replacement. Fill quality is crucial; poor fill causes differential settlement, cracking, and foundation failure.

_Compaction_ is the process of densifying soil by mechanical means (rollers, tampers, vibrators) to increase bearing capacity, reduce permeability, and minimize future settlement. Compaction is measured by:
- _Dry unit weight_ (γd, in kN/m³): mass of solids per unit volume, excluding water.
- _Moisture content_ (w, in %): water mass as a percentage of solids mass.
- _Standard Proctor Test_: lab test determining the moisture-unit weight relationship. Maximum dry unit weight (γd max) occurs at optimum moisture content (OMC). Specification: "90% Proctor density at OMC ± 2%" means compacted fill must achieve 90% of the lab-determined maximum.
- _Field density test_ (sand replacement, nuclear density gauge): on-site verification that fill has been compacted to specification (typically 90–95% Proctor).

**3. Standard Penetration Test (SPT) and Bearing Capacity:**

The _Standard Penetration Test_ (SPT) is a field test in which a 63.5 kg hammer falls 76 cm and drives a 50 mm split-spoon sampler into the soil. The number of blows required to advance 300 mm is the _SPT N-value_. SPT N-values correlate with soil density and approximate bearing capacity:
- N < 4: very loose/very soft (clay); bearing capacity 50–100 kN/m² (poor).
- 4 ≤ N < 10: loose/soft; bearing capacity 100–200 kN/m² (marginal).
- 10 ≤ N < 30: medium dense/medium stiff; bearing capacity 200–400 kN/m² (acceptable).
- 30 ≤ N < 50: dense/stiff; bearing capacity 400–800 kN/m² (good).
- N ≥ 50: very dense/very stiff; bearing capacity > 800 kN/m² (excellent).

SPT is used to estimate bearing capacity, select foundation depth, and assess liquefaction potential.

**4. Consolidation and Settlement Types:**

Settlement is the downward movement of a structure due to soil compression. Three types exist:

- _Immediate (elastic) settlement_: occurs during or immediately after loading, due to elastic compression of soil solids and air expulsion, before pore water drains. Significant in sandy soils; minor in clay.
- _Primary consolidation settlement_: occurs over months to years as pore water is expelled from clay under load. The rate decreases with time (logarithmic pattern). This is the dominant settlement type in soft clay.
- _Secondary consolidation (creep)_: occurs over years to decades after primary consolidation is complete, due to viscous deformation of soil solids. Minor but can be important for very long-term structures.

_Consolidation_ is the process of pore water expulsion and soil volume reduction under constant load. The coefficient of consolidation (cv) quantifies the rate of consolidation; low cv values (typical in soft clay) indicate slow settlement that continues for years.

**5. Bearing Capacity Calculation (Overview):**

Bearing capacity (qult) is the maximum stress the soil can support before failure (shear failure or excessive settlement). Ultimate bearing capacity is the stress at which the soil fails; allowable bearing capacity (qa) is qult divided by a safety factor (typically 2–3). Bearing capacity depends on:
- _Soil cohesion_ (c): clay strength; higher c means higher bearing capacity.
- _Soil friction angle_ (φ, phi): sand/gravel strength angle; higher φ (30–45° typical) means higher bearing capacity.
- _Footing depth_ (Df): deeper footings have higher bearing capacity (depth factor).
- _Footing size_ (B, width): larger footings can support higher loads, but bearing capacity per unit area may decrease due to stress distribution.
- _Groundwater level_: saturated soil has lower effective stress and lower bearing capacity.

Bearing capacity is calculated via empirical correlations with SPT N-values or theoretical formulas (Terzaghi, Meyerhof, Hansen). No shortcut; analysis is required for each site.

## Key Provisions

| **Soil Type** | **Typical Bearing Capacity (kN/m²)** | **Compressibility** | **Drainage** | **SPT Typical N** | **Foundation Implication** |
|---|---|---|---|---|---|
| Clay (soft) | 50–150 | Very high | Poor | < 4 | Piles required; time-dependent settlement |
| Clay (stiff) | 200–400 | High | Poor | 10–20 | Shallow footing possible; monitor settlement |
| Silt | 100–250 | High | Poor to fair | 5–15 | Marginal for shallow; prefer deep |
| Sand (loose) | 100–300 | Moderate | Good | < 10 | Shallow footing with wide base or deep pile |
| Sand (dense) | 400–800 | Low | Good | > 20 | Shallow footing viable; minimal settlement |
| Gravel | 600–1200 | Low | Excellent | > 30 | Excellent bearing; shallow footing ideal |

| **Compaction Standard** | **Application** | **Field Verification** |
|---|---|---|
| 90% Proctor, OMC ± 2% | Structural fill (building pad, embankment) | Sand replacement test, nuclear gauge |
| 95% Proctor, OMC ± 2% | High-performance fill (near structures, utility trenches) | Field density test required every 1–2 m |
| 100% Proctor (lab max) | Critical structures (rare); typically not required | Lab-determined maximum; field verification |

| **Settlement Type** | **Timeframe** | **Soil Type** | **Magnitude** | **Design Implication** |
|---|---|---|---|---|
| Immediate | Hours to days | Sand; gravel | 10–50 mm typical | Occurs quickly; may be acceptable for tolerant structures |
| Primary consolidation | Months to years | Clay; silt | 50–200+ mm typical | Slow; building may crack if differential settlement > 50–80 mm |
| Secondary consolidation | Years to decades | Clay | 5–50% of primary | Minor; important for very long-term structures |

## Philippine Practice Context
Metro Manila buildings almost universally encounter soft alluvial clay with SPT N < 10 to depths of 15–40 m. Bearing capacity is typically 50–150 kN/m², mandating piles or deep mats. Compaction standards for building pad fill are 90% Proctor (some contractors claim 95%, but verification is inconsistent). Settlement of 50–100 mm over 2–5 years is common in large buildings on piles. Soil liquefaction is a concern in Mindanao and coastal zones during earthquakes (N < 15, saturated sand). SPT boring is standard; Cone Penetration Test (CPT) is becoming more common for refined analysis.

## How It's Tested
1. **Soil Classification and Bearing Capacity:** Given an SPT boring log with N = 8 at 5 m depth in clay and N = 25 at 12 m in sand, classify the soils and estimate bearing capacity at each layer.
2. **Compaction Specification and Verification:** A building pad requires 90% Proctor compaction at OMC ± 2%. Standard Proctor test gives γd max = 18 kN/m³ at w = 12%. A field density test on the finished pad reads γd = 16.2 kN/m³ and w = 11.8%. Verify compliance.
3. **Consolidation Settlement Prediction:** Soft clay (H = 8 m, cv = 1 m²/year) underlies a mat foundation. Calculate primary consolidation settlement time to 90% completion and assess risk of cracking if differential settlement is 50 mm.

[SLATECAMP_UI_BLOCK:ui_0001 component="Tip" status="preserved"]

## Related Articles

See also: **Foundations** (lea-strc-011-02) for how soil properties drive foundation selection, **Piles** (lea-strc-011-01) for deep foundation soil-structure interaction, and **Earthquake Fundamentals** (lea-strc-004-01) for liquefaction and seismic soil behavior.

## Common Mistakes
[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]

[SLATECAMP_UI_BLOCK:ui_0002 component="WikiMistakeList" status="preserved"]