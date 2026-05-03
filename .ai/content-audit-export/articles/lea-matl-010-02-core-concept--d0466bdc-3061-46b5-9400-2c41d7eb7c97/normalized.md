## What You Need to Know for the LEA
## Learning Goal

Calculate CHB quantities by wall area, accounting for openings (doors, windows), bond pattern, and waste factor, and compute mortar volume and reinforcing steel requirements for reinforced masonry walls.
## Core Concept

CHB quantity is determined by wall surface area and block size. In the Philippines, standard CHB sizes are 4 inches (100 mm), 6 inches (150 mm), and 8 inches (200 mm) in thickness, with a consistent nominal height of 8 inches (200 mm) and length of 16 inches (400 mm). Each block occupies approximately 0.16 m² of wall face area (including the 10 mm mortar joint).

The fundamental formula is: _Number of CHB = Wall area (m²) ÷ 0.16 m² per block_. However, practical estimation uses a shortcut: approximately 12.5 blocks per square meter for standard 6-inch (150 mm) or 8-inch (200 mm) CHB. This accounts for the mortar joint thickness (10 mm standard). When openings (windows, doors) exist, subtract their area from the gross wall area before calculating.

Mortar volume (cement-sand mix for bedding and joints) is estimated at 0.03 to 0.05 m³ per cubic meter of masonry wall, or approximately 1 bag of cement (40 kg) and 0.12 m³ of sand per 100 blocks. Grout (for cavity fill or solid grouting) is calculated separately based on wall thickness and grout design.

## Key Provisions

| Parameter | Value / Standard | LEA Relevance |
|-----------|------------------|------------------|
| Standard CHB thickness | 4" (100 mm), 6" (150 mm), 8" (200 mm) | Affects wall thermal and acoustic properties; impacts cost |
| CHB nominal height | 8" (200 mm) | With 10 mm joint = 210 mm per course |
| CHB nominal length | 16" (400 mm) | With 10 mm joint = 410 mm per block face |
| Blocks per m² (standard) | ~12.5 pcs/m² | Used for quick estimation across all sizes |
| Mortar joint thickness | 10 mm (standard) | Included in block spacing calculations |
| Mortar requirement | ~0.04 m³ per m³ of masonry OR 1 bag + 0.12 m³ sand per 100 blocks | Scales with block count |
| Minimum compressive strength (PH) | 2.0 MPa (loadbearing) | Per PNS ASTM C90:2019 |
| DPWH Item 1046 | Standard Specification for Masonry Works | Governs public work specifications |
| Wall opening deduction | Full area of window/door openings | Subtract openings from gross wall area |

## Worked Examples

[SLATECAMP_UI_BLOCK:ui_0001 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Scenario 1: Residential wall, 6-inch CHB, 30 m² gross area with two 1.5 m × 1.2 m windows and one 1.0 m × 2.1 m door** **Step 1: Calculate net wall area** Gross wall area = 30 m² Window opening 1: 1.5 m × 1.2 m = 1.8 m² Window opening 2: 1.5 m × 1.2 m = 1.8 m² Door opening: 1.0 m × 2.1 m = 2.1 m² Total openings = 1.8 + 1.8 + 2.1 = 5.7 m² Net wall area = 30 – 5.7 = 24.3 m² **Step 2: Calculate CHB quantity** CHB quantity = 24.3 m² × 12.5 pcs/m² = 303.75 pcs Round up to 304 blocks (add 5% waste: 
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0002 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Scenario 2: Commercial building, 4-story structure with 8-inch (200 mm) CHB on ground floor, 45 m² per floor (multiple walls) with 3 doors (1.0 m × 2.1 m each) and 6 windows (1.2 m × 1.5 m each)** **Step 1: Calculate total gross area for ground floor walls** Total wall area: 45 m² (given for floor perimeter) Door openings: 3 × (1.0 × 2.1) = 3 × 2.1 = 6.3 m² Window openings: 6 × (1.2 × 1.5) = 6 × 1.8 = 10.8 m² Total openings: 6.3 + 10.8 = 17.1 m² Net area: 45 – 17.1 = 27.9 m² **Step 2: Calculat
[/SLATECAMP_UI_BLOCK]

## Quick Reference: CHB Estimation Table

| Wall Thickness | Net Area (m²) | CHB per m² | Total CHB (5% waste) | Mortar Bags | Mortar Sand (m³) |
|---|---|---|---|---|---|
| 4" (100 mm) | 25 | 12.5 | 329 | 3 | 0.40 |
| 6" (150 mm) | 30 | 12.5 | 394 | 4 | 0.47 |
| 8" (200 mm) | 40 | 12.5 | 525 | 5 | 0.63 |
| Combined (100m² net) | 100 | 12.5 | 1,313 | 13 | 1.58 |

## Philippine Construction Context

In the Philippines, the most common CHB type is the 6-inch hollow block (150 mm), used extensively in residential and light commercial construction. Major manufacturers include Holcim Philippines (Auro brand), Vulcan Products, Filinvest Concrete, and Allied Concrete Products. All products must comply with PNS ASTM C90:2019 for structural performance.

Standard mortar in the Philippines uses 1 part cement to 4-5 parts sand (1:4 to 1:5 by volume), with the ratio depending on exposure conditions. For wet environments (kitchens, bathrooms), 1:3 mortar is preferred. The DPWH Blue Book specifies Item 1046 requirements for public works masonry, including testing and workmanship standards.

Climate consideration: In high-humidity coastal areas and regions with heavy rainfall, moisture-resistant CHB (with reduced water absorption) may be specified. Alternatively, mortar may include hydrophobic admixtures.

## How It's Tested

On the LEA, masonry questions focus on:

1. **Straight quantity calculation**: Given wall area and openings, calculate blocks needed using the 12.5 pcs/m² factor.

2. **Waste adjustment**: Quantity × (1 + waste %) for typical 5–10% site waste.

3. **Mortar scaling**: Number of blocks ÷ 100 × 1 bag (or equivalent) for mortar cement and sand.

4. **Multi-story scaling**: Same per-floor calculation, then multiply by number of floors.

5. **Mixed opening types**: Subtract doors, windows, and other voids from gross area; calculate net area cleanly.

6. **Cost per unit**: CHB cost/block × total blocks for material budgeting.

[SLATECAMP_UI_BLOCK:ui_0003 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memory aid**: For any wall thickness and opening arrangement, use 12.5 blocks per m² as your standard. Always subtract openings FIRST, then multiply by 12.5. Always add 5% waste unless otherwise specified.
[/SLATECAMP_UI_BLOCK]

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0004 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Using 16 blocks per m² instead of 12.5 blocks per m²", correction="The standard 12.5 pcs/m² accounts for the 10 mm mortar joint and is universal across 4-inch, 6-inch, and 8-inch CHB. Using 16/m² over-estimates."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0005 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Forgetting to subtract window and door openings from the gross wall area", correction="Always calculate net wall area = gross area – total opening area. Then apply 12.5 pcs/m² to the net area only."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0006 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Not adding waste percentage", correction="Site waste is typically 5–10%; multiply the block count by 1.05 or 1.10 unless the problem specifies zero waste."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0007 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Using different CHB pcs/m² for different thicknesses (4\\", correction="All standard CHB sizes have the same face area (16\\", m=true, per=true, block=true, Thickness=true, does=true, not=true, affect=true, quantity=true, of=true, wall=true
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0008 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Mixing net area and gross area—always subtract openings before multiplying by 12.5\", \"Calculating mortar based on weight instead of volume (use m³ for sand, bags for cement)\", \"Double-counting openings or including the same opening twice\", \"Forgetting that CHB mortar requires both cement AND sand (do not calculate cement only)\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

## Related Articles

See also within Estimating Quantities and Material Computation: **lea-matl-010-01-core-concept**, **lea-matl-010-03-core-concept**, **lea-matl-010-04-core-concept**, **lea-matl-010-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.


[SLATECAMP_UI_BLOCK:ui_e001 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **LEA Exam Tip — Calculate CHB quantities by wall area, accounting for openin:** This topic is heavily tested in Area B. Focus on mastering material classifications, key property values (compressive strength, R-value, unit weight), and estimating formulas. Create comparison tables to distinguish similar materials (e.g., cement Types I–V, glass types, insulation types). Practice computational problems for concrete volume, board foot, CHB count, and paint coverage — these are reliable exam items.
[/SLATECAMP_UI_BLOCK]
