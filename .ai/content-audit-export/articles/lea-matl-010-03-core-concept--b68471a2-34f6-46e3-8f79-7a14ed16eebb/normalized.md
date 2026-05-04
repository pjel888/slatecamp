## What You Need to Know for the LEA
## Learning Goal

Calculate rebar quantities by linear meter weight conversion for given bar diameters or bar number designation, using standard steel density (7,850 kg/m³) and applicable waste factors for reinforced concrete elements.
## Core Concept

Rebar weight is calculated using the relationship between the bar's cross-sectional area and steel density. The universal formula is: _Weight per meter (kg/m) = (Diameter in mm)² ÷ 162.5_. This formula accounts for steel density (7,850 kg/m³) and converts circular cross-section geometry into a practical tool.

The derivation: cross-sectional area = πD²/4 (in mm²). Weight per meter = (πD²/4) × (1,000 mm) × (7,850 kg/m³) ÷ (10⁶ mm³/m³) = D² × π × 7,850 ÷ (4 × 10⁶). Simplifying: D² ÷ 162.5 (approximately). Once you know kg/m, multiply by the total length required.

In Philippine projects, the quantity takeoff lists total meters of each rebar size, often cross-referenced with reinforcement drawings. The weight is then summed across all diameters to calculate total steel cost. Standard 12-meter rebar lengths are common in the Philippines, with lapped splices accounting for additional waste (typically 1.3 to 1.5× the design length).


[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-rebar-weight-chart", layout="single", type="image", status="placeholder", alt="Reference chart showing rebar sizes (10mm through 40mm or #3 through #14) with nominal diameter, area, and weight per linear meter", caption="Future chart: rebar size reference — diameter, cross-sectional area, and weight per linear meter", suggestedAsset="Reference table with rebar size cross-section illustrations", placementIntent="Provides quick reference for rebar weight conversion"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

## Key Provisions

| Rebar Size (mm) | Weight per Meter (kg/m) | Typical Uses | LEA Relevance |
|---|---|---|---|
| 10 | 0.61 | Ties, shrinkage/temperature reinforcement | Foundational calculations |
| 12 | 0.88 | Light slabs, beams | Common in residential structures |
| 16 | 1.58 | Beams, columns, heavy slabs | Major structural elements |
| 20 | 2.46 | Columns, beams, walls | Primary reinforcement |
| 25 | 3.85 | Large columns, girders | Heavy structural use |
| 32 | 6.31 | Major columns, special applications | Rare in standard buildings |
| Standard bar length (PH) | 12 m | Supplied by manufacturers (Pag-asa, Capitol Steel, Vulcan) | Basis for waste calculation |
| Unit weight of steel | 7,850 kg/m³ | Used in formula derivation | Fundamental constant |
| Splice/waste factor | 1.30–1.50 | Accounts for lap splices and cutting waste | Increases design length by 30–50% |
| DPWH Blue Book | Item specifications | Governs public works projects | Standard for specifications |

## Worked Examples

[SLATECAMP_UI_BLOCK:ui_0002 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Scenario 1: Slab reinforcement requiring 500 meters of 12 mm rebar** **Step 1: Determine unit weight for 12 mm rebar** Using the formula: Weight per meter = D² ÷ 162.5 = (12)² ÷ 162.5 = 144 ÷ 162.5 = 0.886 kg/m ≈ 0.88 kg/m **Step 2: Calculate total weight** Total weight = Length × weight per meter = 500 m × 0.88 kg/m = 440 kg **Step 3: Convert to number of standard bars (12 m per bar, no waste)** Number of bars = 500 m ÷ 12 m/bar = 41.67 bars ≈ 42 bars (round up) **Step 4: Estimate cost (assum
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0003 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Scenario 2: Column reinforcement requiring 300 meters of 20 mm rebar plus splices (30% waste factor for lapping)** **Step 1: Design length with splice waste** Design length = 300 m (per drawing) Total length with 30% waste: 300 m × 1.30 = 390 m **Step 2: Determine weight per meter for 20 mm rebar** Weight per meter = (20)² ÷ 162.5 = 400 ÷ 162.5 = 2.462 kg/m ≈ 2.46 kg/m **Step 3: Calculate total weight** Total weight = 390 m × 2.46 kg/m = 959.4 kg ≈ 960 kg **Step 4: Number of standard 12 m bars
[/SLATECAMP_UI_BLOCK]


[SLATECAMP_UI_BLOCK:ui_0004 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-rebar-estimation-example", layout="single", type="image", status="placeholder", alt="Step-by-step rebar estimation example showing bar sizing, weight conversion, spacing, lap splice, and total tonnage calculation for a reinforced concrete beam", caption="Future diagram: rebar estimation worked example — sizing, weight, spacing, and lap splice", suggestedAsset="Step-by-step illustrated calculation example", placementIntent="Provides practical example of rebar quantity estimation"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]
## Quick Reference: Rebar Weight Calculation Table

| Diameter (mm) | Weight per Meter (kg/m) | Weight per 12 m Bar (kg) | Common Applications |
|---|---|---|---|
| 10 | 0.61 | 7.3 | Ties, temperature reinforcement |
| 12 | 0.88 | 10.6 | Slab reinforcement, light beams |
| 16 | 1.58 | 18.9 | Beam and column reinforcement |
| 20 | 2.46 | 29.5 | Primary column/beam reinforcement |
| 25 | 3.85 | 46.2 | Heavy columns, major beams |
| 32 | 6.31 | 75.7 | Special structural applications |

## Philippine Construction Context

In the Philippines, rebar is supplied by major manufacturers including Pag-asa Steel, Capitol Steel, and Vulcan Products. Standard bar length is 12 meters. The market commonly trades rebar by the metric ton (MT) or by piece count (pcs). Prices fluctuate with global steel prices but typically range from 45–70 pesos per kilogram depending on market conditions and bar size.

Design standards reference NSCP 2015 for reinforcement detailing and ASTM A615 (or local equivalent PNS) for material properties. Splice lengths are typically 40–50 bar diameters (i.e., 20 mm rebar = 800–1,000 mm splice length). For concrete structures with high durability requirements (coastal areas, industrial environments), deformed rebar with improved bond is specified.

Climate and corrosion: In high-humidity and coastal areas, galvanized rebar or epoxy-coated rebar is increasingly specified, which raises material costs by 15–25%.

## How It's Tested

On the LEA, rebar questions focus on:

1. **Unit weight calculation**: Given diameter, calculate kg/m using D² ÷ 162.5 formula.

2. **Total weight estimation**: Length (m) × unit weight (kg/m) = total kg.

3. **Bar count**: Total length ÷ 12 m per bar = number of bars (round up).

4. **Splice waste adjustment**: Design length × splice factor (1.30–1.50) = total length required.

5. **Cost estimation**: Total weight (kg) × unit price (pesos/kg) = material cost.

6. **Mixed sizes**: Sum weights from multiple diameters used in the same project.

[SLATECAMP_UI_BLOCK:ui_0005 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memory aid**: The formula D² ÷ 162.5 is universal for all rebar sizes. The constant 162.5 encodes steel density and unit conversions. For quick estimation, remember key weights: 12 mm ≈ 0.9 kg/m, 16 mm ≈ 1.6 kg/m, 20 mm ≈ 2.5 kg/m. Standard bars are 12 meters long.
[/SLATECAMP_UI_BLOCK]

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0006 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Using 160 or other approximations instead of 162.5 in the denominator", correction="Always use 162.5 for accuracy. Approximations like 160 introduce 1–2% error across large projects."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0007 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Forgetting to apply the splice/waste factor", correction="Design length on drawings does NOT include splice waste. Multiply by 1.30–1.50 depending on the specified lap length and cutting waste."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0008 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Using the weight per bar instead of weight per meter when the total length is given", correction="When you have total meters of rebar, use weight per meter directly: Total meters × kg/m. Do NOT divide by 12 first."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0009 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Assuming all bar diameters weigh the same per meter", correction="Weight per meter depends on diameter squared (D²). A 20 mm bar weighs approximately 4 times more per meter than a 10 mm bar."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0010 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Confusing diameter in inches vs. millimeters (use mm in the formula)\", \"Forgetting that standard Philippine bar length is 12 m, not 6 m or other lengths\", \"Adding waste factor to weight instead of to length (waste applies to length, then calculate weight)\", \"Double-counting rebar by including splice waste AND standard 5% site waste\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

## Related Articles

See also within Estimating Quantities and Material Computation: **lea-matl-010-01-core-concept**, **lea-matl-010-02-core-concept**, **lea-matl-010-04-core-concept**, **lea-matl-010-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.

