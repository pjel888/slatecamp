## What You Need to Know for the LEA
## Learning Goal

Calculate concrete volume in cubic meters from building dimensions, convert to mix design proportions to determine cement bags, sand, and gravel quantities, and apply waste factors (5-10%) for construction estimating.
## Core Concept

Concrete volume is the three-dimensional space the concrete will occupy. The simplest method is length × width × height in meters. For mix computation, once you know the total volume, you apply the ACI 211.1 proportioning method to determine how much cement, fine aggregate (sand), coarse aggregate (gravel), water, and admixtures are needed per cubic meter. The ACI method uses absolute volumes, meaning the sum of volumes of individual materials equals the target concrete volume.

The ACI 211.1 procedure starts with your concrete strength requirement (f'c in MPa). For a given strength, you determine the water-cement ratio (W/C), then estimate the water content needed for workability. From these, the cement content follows. Coarse aggregate and fine aggregate volumes fill the remaining space.

In the Philippines, concrete design typically targets f'c = 20 MPa (A4-type), 24 MPa (A3-type), or 27.5 MPa (A2-type) for buildings per NSCP 2015. Standard cement bags are 40 kg. The unit weight of concrete (after curing) is typically 2,400 kg/m³ for normal-weight concrete.


[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-concrete-volume-diagram", layout="single", type="image", status="placeholder", alt="Diagram showing concrete volume calculation: length × width × height on a building element with mix proportion conversion example", caption="Future diagram: concrete volume calculation and mix proportion conversion", suggestedAsset="Illustration of volume measurement with mix proportion workflow", placementIntent="Visualizes the concrete quantity estimation process"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

## Key Provisions

| Parameter | Value / Standard | LEA Relevance |
|-----------|------------------|------------------|
| Standard cement bag (PH) | 40 kg | Directly affects number of bags required per m³ |
| Unit weight of concrete | 2,400 kg/m³ (normal weight) | Used to convert volume to weight for transportation cost |
| ACI design method | ACI 211.1 (absolute volume) | Basis for all Philippine mix designs |
| Typical f'c (residential) | 20 MPa | Determines W/C ratio and cement content |
| Typical f'c (commercial) | 24 MPa | Requires higher cement, lower W/C |
| Water-cement ratio (W/C) | 0.45–0.65 | Lower W/C = higher strength, more cement |
| Standard slump | 75–100 mm (stiff) to 150–180 mm (loose) | Affects water content estimate |
| Mortar joint thickness | 10 mm | Used in CHB and masonry calculations |
| DPWH reference | Blue Book, Item specifications | Governs public work concrete mixes |

## Worked Examples

[SLATECAMP_UI_BLOCK:ui_0002 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Scenario 1: Ground floor slab, 50 m² × 0.10 m thick, f'c = 20 MPa, normal weight, 100 mm slump** **Step 1: Calculate volume** V = 50 m² × 0.10 m = 5 m³ **Step 2: Apply ACI 211.1 proportioning (f'c = 20 MPa, water content ≈ 170 L/m³, W/C = 0.55 for 20 MPa)** Water needed: 170 L/m³ (or 170 kg/m³) Cement content: Water ÷ W/C = 170 ÷ 0.55 = 309 kg/m³ Coarse aggregate (gravel): ~850 kg/m³ Fine aggregate (sand): ~650 kg/m³ Check: 170 (water) + 309 (cement) + 850 (coarse) + 650 (fine) = 1,979 kg/m³ ≈
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0003 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Scenario 2: Concrete footing 2 m × 2 m × 0.5 m deep, f'c = 24 MPa, 150 mm slump** **Step 1: Calculate volume** V = 2 m × 2 m × 0.5 m = 2 m³ **Step 2: ACI 211.1 proportioning (f'c = 24 MPa, water ≈ 180 L/m³, W/C = 0.50)** Cement content: 180 ÷ 0.50 = 360 kg/m³ Using standard coarse aggregate = 800 kg/m³, fine aggregate = 640 kg/m³ **Step 3: Sclea for 2 m³** Cement: 360 kg/m³ × 2 m³ = 720 kg = 18 bags (exactly) Water: 180 kg/m³ × 2 m³ = 360 kg = 360 liters Coarse aggregate: 800 kg/m³ × 2 m³ = 1,
[/SLATECAMP_UI_BLOCK]


[SLATECAMP_UI_BLOCK:ui_0004 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-concrete-estimation-example", layout="single", type="image", status="placeholder", alt="Step-by-step worked example of concrete volume calculation and mix proportioning for a slab, beam, and column with formulas and results", caption="Future diagram: concrete estimation worked example — slab, beam, and column calculation", suggestedAsset="Step-by-step illustrated calculation example", placementIntent="Provides practical example of concrete quantity estimation"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]
## Quick Reference: Concrete Mix Computation Table

| f'c (MPa) | W/C | Cement (kg/m³) | Water (L/m³) | Coarse Agg (kg/m³) | Fine Agg (kg/m³) | Bags per m³ |
|-----------|-----|---------------|--------------|--------------------|------------------|------------|
| 20 | 0.55 | 309 | 170 | 850 | 650 | 7.7–7.8 |
| 24 | 0.50 | 360 | 180 | 800 | 640 | 9.0 |
| 27.5 | 0.45 | 400 | 180 | 780 | 620 | 10.0 |

## Philippine Construction Context

In the Philippines, the most common design strength is f'c = 20 MPa for residential buildings and f'c = 24 MPa for commercial structures, as specified in NSCP 2015. The majority of projects use 40 kg Portland cement bags manufactured by Lafarge Holcim (formerly Holcim PH), Phesco, or other local suppliers. Ready-mix concrete suppliers (e.g., Holcim RMC, Vulcan, SMIC) also provide pre-designed mixes.

Standard slump tolerance in the Philippines is 75–100 mm for stiff concrete (slabs, pavements) and 150–180 mm for loose concrete (columns, beams). Climate considerations: high humidity and rainfall in monsoon regions require careful curing and may increase water content slightly. For coastal projects, marine-grade concrete with lower W/C and fly ash addition is common.

## How It's Tested

On the LEA, you will encounter:

1. **Volume-only problems**: Given dimensions in meters, calculate cubic meters, then scale a single ingredient (cement, water, aggregate). Often tested as "How many bags of cement for a 10 m × 5 m × 0.15 m slab at 7.8 bags/m³?"

2. **Mix design scaling**: Given a base mix (e.g., 1:2:3 ratio or 300 kg/m³ cement) and total volume, calculate total amounts.

3. **Cost estimation**: Volume × unit cost per m³ or per bag.

4. **Aggregate quantity**: Given coarse-to-fine ratio or percentages, calculate tons needed.

5. **Wastage adjustment**: Calculate concrete needed accounting for 5–10% waste.

[SLATECAMP_UI_BLOCK:ui_0005 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memory aid for ACI quick estimate**: For f'c = 20 MPa, use ~310 kg/m³ cement and ~170 L/m³ water. For f'c = 24 MPa, increase cement to ~360 kg/m³. Always round cement bags up to the nearest whole bag.
[/SLATECAMP_UI_BLOCK]

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0006 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Using 50 kg as the standard cement bag weight", correction="The Philippine standard is 40 kg per bag, not 50 kg. Using 50 kg will underestimate the number of bags needed."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0007 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Forgetting to convert liters to cubic meters when calculating water", correction="Water content is given in L/m³ (which equals kg/m³ for water density = 1.0), but when mixing, ensure total volume accounts include water volume."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0008 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Using weight-based mix ratios (1:2:3 by weight) without converting to volumes", correction="ACI 211.1 uses absolute volumes. Always convert weight ratios to volume by dividing by material density."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0009 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Confusing slump (workability) with the actual concrete thickness required\", \"Not accounting for aggregate gradation and its effect on paste volume\", \"Forgetting that total concrete weight includes all four ingredients (cement, water, coarse, fine)\", \"Using the same mix design for both structural and non-structural elements\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

## Related Articles

See also within Estimating Quantities and Material Computation: **lea-matl-010-02-core-concept**, **lea-matl-010-03-core-concept**, **lea-matl-010-04-core-concept**, **lea-matl-010-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.

