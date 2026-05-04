## What You Need to Know for the LEA

## Learning Goal

By the end of this article, you will be able to:

- Define Philippine timber stress groups: Group I (highest strength) through Group IV
- Identify which stress group a given species belongs to
- Explain how stress group affects allowable bending and compression values
- State the basis for stress group classification (testing of small clear specimens)

---
## Core Concept
Philippine timber stress groups rank species by bending and compression capacity, with Group I (highest strength) and Group IV (lowest strength) as the extremes. Within each group, species show similar allowable stresses under the Allowable Stress Design method. Timber products fall into three main categories: solid sawn lumber, fiberboard (density >160 but &lt;497 kg/m³), and hardboard (density ≥497 kg/m³). Grading is not cosmetic—it is a mechanical classification tied to defect tolerance, knot size, slope-of-grain limits, and moisture content. A timber element graded as "Select Structural" (best grade) has stricter knot and defect limits than "No. 2 Common" (standard grade), and allowable stresses differ accordingly. Lumber dimensions follow nominal (timber size as marketed) and actual (true milled size) conventions: a nominal 2×4 is actually 1.5" × 3.5" (38 × 89 mm). The distinction is critical in design calculations. Fiberboard and hardboard are engineered products with uniform density and are not interchangeable with solid lumber—they are specified by density range and intended use (sheathing, subflooring, acoustic backing). Unit weight for Philippine hardwood timber ranges from 5–12 kN/m³; fiberboard (1.6–5.0 kN/m³) and hardboard have specified densities for non-structural uses.

## Key Provisions

### Philippine Timber Stress Groups

<WikiExamTable headers={["Stress Group", "Bending Capacity", "Example Species"]} rows={[  ["I (Highest)", "Very High", "Yakal, Molave, Malabayabas, Sasalit"], ["II", "High", "Apitong, Narra, Tindalo, Guijo, Ipil"] ["III", "Moderate", "Lauan, Tanguile, Red Lauan"], ["IV (Lowest)", "Lower", "White Lauan, Almaciga"] ]} />

### Lumber Grade Definitions
- _Select Structural_: Highest quality. Minimal knots, tight grain, tight wane. Used for exposed, high-stress applications.
- _No. 1 Common_: Good quality. Larger knots permitted. Suitable for standard structural use.
- _No. 2 Common_: Standard grade. Defects more visible. Allowable stresses reduced. General-purpose framing and non-exposed use.
- _Construction Grade_: Lowest quality. High knot frequency, larger checks permitted. Limited to temporary or lightly loaded applications.

### Dimension Definitions
- _Nominal_: Timber size as marketed (e.g., 2×4, 4×12). Used for material orders.
- _Actual_: True milled size after surfacing (e.g., 2×4 nominal = 1.5" × 3.5" actual). Used for all design calculations.
- _Adjustment_: Design tables account for moisture content (green vs. dry). Green timber (≥19% moisture) has lower allowable stresses than kiln-dried (≤15%).

### Wood Product Density Classifications
  ["Solid Lumber", "Varies by species", "Beams, joists, columns, primary structure"]
  ]}
/>

### Allowable Stress Selection Logic
- _Step 1_: Identify species and stress group (I, II, III, IV).
- _Step 2_: Identify grade (Select Structural, No. 1, No. 2, Construction).
- _Step 3_: Identify moisture condition (green or dry). Apply adjustment factor if required.
- _Step 4_: Look up allowable bending (Fb) and horizontal shear (Fv) stresses from Philippine timber design manual or NatCor supplement.

## Philippine Practice Context
Philippine lumber grading is governed by the National Timber Code and referenced by the Philippine Building Code. Yakal (Group I) commands premium allowable stresses due to high density and strength; Lauan and Red Lauan (Group III) are more economical and widely available. Fiberboard and hardboard are imported engineered products or locally manufactured; their use in structural design is limited to non-primary-load paths (infill, backing, insulation). Field verification of grade markings is common practice in Philippine construction—unmarked or undocumented timber is often reclassified by visual inspection or reduced to the lowest safe grade by the engineer.

## How It's Tested

### Pattern 1: Stress Group Identification
"A timber lintel is designed from Narra. Which stress group applies?"
- Answer: Group II (Narra is classified as Group II).
- Takeaway: Species determines group; grade refinement comes next.

### Pattern 2: Dimension Conversion
"A beam is specified as nominal 6×12 lumber, actual dimensions 5.5" × 11.5". Which dimension set is used in the section modulus calculation?"
- Answer: Actual dimensions (5.5" × 11.5") are used in all structural calculations.
- Takeaway: Nominal is for purchasing; actual is for design.

### Pattern 3: Product Suitability
"Can fiberboard (density 250 kg/m³) be used as a primary load-bearing beam in a multi-story building?"
- Answer: No. Fiberboard is an infill/backing product, not a primary structural element. Solid lumber or engineered lumber (LVL, glulam) must be used.
- Takeaway: Product category, not just density, determines application scope.

<Tip>Group I = highest capacity (Yakal, Molave); Group IV = lowest (White Lauan, Red Balau). Always verify the specific group from the design manual or code supplement.</Tip>

## Related Articles

See also: **Timber Durability** (lea-strc-009-01) for complementary wood properties, **Timber ASD** (lea-strc-009-03) for how stress group values enter design, and **Stress-Strain** (lea-strc-003-01) for the material behavior foundation.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

<WikiMistakeList mistakes={[ "Using nominal dimensions in design calculations. Nominal 2×4 is 1.5×3.5; actual dimensions are required.", "Confusing Narra (Group II) with Yakal or Molave (Group I) and applying wrong allowable stresses.", "Treating fiberboard and hardboard as interchangeable with solid lumber. Density alone does not qualify them for primary structural duty.", "Ignoring moisture adjustment factors. Green lumber (≥19% MC) may have 10–15% lower allowable stresses than kiln-dried.", "Applying allowable stresses from a different species group without re-verifying the table." ]} />