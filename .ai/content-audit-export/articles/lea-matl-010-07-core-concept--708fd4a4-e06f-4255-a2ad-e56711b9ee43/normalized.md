## What You Need to Know for the LEA
## Learning Goal

Calculate structural steel weight using standard section properties — W-shape weight per meter, plate weight (kg = thickness × width × length × density) — and estimate total tonnage for a given steel frame layout.
## Core Concept

Structural steel weight is determined by cross-sectional area and steel density (7,850 kg/m³). The formula is: _Weight per unit length (kg/m) = Cross-sectional area (mm²) × Steel density (7,850 kg/m³) ÷ 10⁶_. Manufacturers publish these values in weight tables for each standard section size.

Common sections in the Philippines:

- H-beams (HEA, HEB, HEM): 150 × 150 to 400 × 400 mm heights, 20–150 kg/m
- I-beams (IPE): 100 to 600 mm heights, 8–100 kg/m
- Channels (C-sections): 50 to 300 mm heights, 5–60 kg/m
- Angles (L-sections): various sizes, 1.5–20 kg/m

Total structural steel weight is calculated by summing individual member weights: _Total weight = Sum of (length × unit weight) for all members_.

## Key Provisions

| Steel Section | Height × Width (mm) | Weight (kg/m) | Typical Uses | LEA Relevance |
|---|---|---|---|---|
| H-beam HEA 150 | 150 × 150 | 26 | Light columns | Smaller structures |
| H-beam HEB 200 | 200 × 200 | 50 | Medium columns, beams | Standard residential |
| H-beam HEB 300 | 300 × 300 | 117 | Heavy columns | Large commercial |
| I-beam IPE 200 | 200 height | 22.4 | Secondary beams | Intermediate spans |
| I-beam IPE 300 | 300 height | 42.2 | Primary beams | Standard commercial |
| I-beam IPE 400 | 400 height | 66.3 | Long spans | Heavy-duty structures |
| Channel C100 | 100 height | 5.9 | Bracing, secondary | Light members |
| Steel density | 7,850 kg/m³ | Constant | All calculations | Fundamental constant |
| Waste factor | 5–7% (cutting/fabrication) | Typical | Adds to weight | Minor impact |

## Worked Examples

[SLATECAMP_UI_BLOCK:ui_0001 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Scenario 1: Building frame with 4 columns, each 5 m tall, H-beam HEB 200 (50 kg/m)** **Step 1: Calculate total length of steel** Total length = 4 columns × 5 m = 20 m **Step 2: Apply unit weight** Total weight = 20 m × 50 kg/m = 1,000 kg = 1.0 MT **Step 3: Add 5% waste for fabrication** Total with waste = 1,000 × 1.05 = 1,050 kg **Answer: 1,050 kg total structural steel**
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0002 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Scenario 2: Building floor frame: 8 beams at 7 m each (IPE 300, 42.2 kg/m) plus 12 secondary bracing members at 4 m each (IPE 200, 22.4 kg/m)** **Step 1: Calculate primary beam weight** Primary beams: 8 × 7 m × 42.2 kg/m = 2,352.8 kg **Step 2: Calculate secondary bracing weight** Secondary: 12 × 4 m × 22.4 kg/m = 1,075.2 kg **Step 3: Sum and add waste (5%)** Total: 2,352.8 + 1,075.2 = 3,428 kg With 5% waste: 3,428 × 1.05 = 3,599.4 kg ≈ 3.6 MT **Answer: 3.6 MT total structural steel required**
[/SLATECAMP_UI_BLOCK]

## Quick Reference: Common Steel Section Weights

| Section | Designation | Height (mm) | Weight (kg/m) | Common Use |
|---|---|---|---|---|
| H-beam | HEA 150 | 150 | 26 | Light columns |
| H-beam | HEB 200 | 200 | 50 | Standard columns, beams |
| H-beam | HEB 300 | 300 | 117 | Heavy members |
| I-beam | IPE 200 | 200 | 22.4 | Secondary beams |
| I-beam | IPE 300 | 300 | 42.2 | Primary beams |
| I-beam | IPE 400 | 400 | 66.3 | Long-span beams |
| Channel | C100 | 100 | 5.9 | Bracing, secondary |
| Angle | L50×50 | 50 | 1.5 | Light connections |

## Philippine Construction Context

In the Philippines, structural steel is supplied by major mills and distributors: Consteel, Megasteel, Niconsteel, and imports from Japan and Europe. Sections follow international standards (IPE, HEA/HEB for European-type; W-beams for American-type). Structural engineers typically specify sections using design standards: NSCP 2015 references AISC or Eurocode methods.

Fabrication shops (Conestoga, Herdez, local welding shops) use published weight tables from suppliers. Steel pricing fluctuates with global markets but typically ranges from 30,000–50,000 pesos per metric ton. Fabrication labor is 2,000–5,000 pesos per ton depending on complexity.

## How It's Tested

On the LEA, structural steel questions focus on:

1. **Member weight lookup**: Given section designation, find weight per meter from a provided table.

2. **Total weight calculation**: Length × weight per meter for a single member.

3. **Multi-member assemblies**: Sum weights from different section types and lengths.

4. **Waste factor**: Add 5–7% to total fabrication weight.

5. **Tonnage conversion**: Convert kg to MT for ordering/costing.

6. **Cost estimation**: Total weight (MT) × unit price = material cost.

[SLATECAMP_UI_BLOCK:ui_0003 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memory aid**: Common sections—HEB 200 = 50 kg/m, IPE 300 = 42 kg/m, IPE 400 = 66 kg/m. These are anchor values for quick estimation. Always look up section weights from provided tables rather than memorizing all.
[/SLATECAMP_UI_BLOCK]

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0004 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Using rebar formula (D²÷162.5) for structural steel", correction="Structural steel has published weight tables by section type. Look up the weight per meter for the specific I-beam, H-beam, or channel size."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0005 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Forgetting that structural steel must include all members: columns, beams, bracing", correction="For a complete frame, identify and sum the weights of columns (vertical), primary beams (horizontal primary), and secondary members (bracing, connections)."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0006 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Not converting total weight to metric tons (MT) for quotations", correction="Steel suppliers quote in pesos per MT or per kg. Ensure unit consistency: 1 MT = 1,000 kg."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0007 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Omitting waste factor for cutting and fabrication", correction="Add 5–7% waste to account for cutting, welding, and handling losses during fabrication."
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0008 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Confusing IPE (I-beam) with HEA/HEB (H-beam)—different shapes, different weights\", \"Using weight from one section type when the drawing specifies another\", \"Forgetting that long members may be spliced; account for additional connection material\", \"Not accounting for different weight values for different grades of steel (if specified)\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

## Related Articles

See also within Estimating Quantities and Material Computation: **lea-matl-010-01-core-concept**, **lea-matl-010-02-core-concept**, **lea-matl-010-03-core-concept**, **lea-matl-010-04-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.


[SLATECAMP_UI_BLOCK:ui_e001 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **ALE Exam Tip — Calculate structural steel weight using standard section pro:** This topic is heavily tested in Area B. Focus on mastering material classifications, key property values (compressive strength, R-value, unit weight), and estimating formulas. Create comparison tables to distinguish similar materials (e.g., cement Types I–V, glass types, insulation types). Practice computational problems for concrete volume, board foot, CHB count, and paint coverage — these are reliable exam items.
[/SLATECAMP_UI_BLOCK]
