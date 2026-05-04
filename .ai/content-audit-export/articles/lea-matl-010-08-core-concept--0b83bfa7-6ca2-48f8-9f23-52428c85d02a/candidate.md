## What You Need to Know for the LEA
## Learning Goal

Calculate roofing material quantities — area coverage per sheet, side lap and end lap allowances, ridge length, fascia/gutter lengths, fastener count — for corrugated GI sheets and other roofing systems on sloped roofs.
## Core Concept

Earthwork volume is calculated from cross-sectional areas at measured stations (e.g., every 10 or 20 meters along a road centerline). The trapezoidal formula is: _V = (L/2) × (A₁ + A₂)_ for a single section, where L is the distance between cross-sections and A₁, A₂ are the areas. For multiple sections at regular intervals: _V = (L/2) × [(A₁ + Aₙ) + 2(A₂ + A₃ + ... + Aₙ₋₁)]_.

The prismoidal formula is more accurate, particularly for parabolic or irregular sections: _V = (L/3) × [(A₁ + Aₙ) + 4(even-numbered areas) + 2(odd-numbered areas)]_. The prismoidal method typically yields 2–8% lower volumes than the trapezoidal method for the same data, particularly on undulating terrain.

In the Philippines, standard practice uses the trapezoidal method for preliminary estimates and the prismoidal method for final billing and payment. The formula constants (L/2 vs. L/3) reflect the different integration approaches.


<ArticleMedia id="media-roofing-quantity-diagram" layout="single" type="image" status="placeholder"
  alt="Diagram showing corrugated GI sheet coverage calculation with side lap, end lap, and slope allowance on a roof plan"
  caption="Future diagram: roofing quantity estimation — GI sheet coverage, laps, and slope allowance"
  suggestedAsset="Roof plan with sheet layout and lap allowance callouts"
  placementIntent="Visualizes roofing material quantity estimation" />

## Key Provisions

| Formula | Application | Accuracy | LEA Relevance |
|---|---|---|---|
| Trapezoidal: V = (L/2)(A₁ + A₂) | Single section, two cross-areas | Lower | Basic calculation |
| Trapezoidal: V = (L/2)[(A₁ + Aₙ) + 2(sum of middle areas)] | Multiple sections, regular intervals | Moderate | Standard site use |
| Prismoidal: V = (L/3)[(A₁ + Aₙ) + 4(even) + 2(odd)] | Multiple sections, higher precision | High | Final billing |
| Cut volume | Excavation of existing material | Positive | Cost driver |
| Fill volume | Placement of new material | Positive | Material sourcing |
| Section interval (L) | Distance between stations (10–30 m) | Standard | Per project specs |
| Shrinkage factor | 1.1–1.3 (volume increase after excavation) | 10–30% | Adjustment for loose soil |
| Swell/compaction | Site-dependent; clay swells more | Varies | Material behavior |
| DPWH Blue Book | Item specifications, earthwork method | Standard | Governs public works |

## Worked Examples

[SLATECAMP_UI_BLOCK:ui_0001 component="Example" status="preserved"]

[SLATECAMP_UI_BLOCK:ui_0002 component="Example" status="preserved"]


<ArticleMedia id="media-roofing-estimation-example" layout="single" type="image" status="placeholder"
  alt="Step-by-step roofing estimation example showing roof area, GI sheet coverage with end and side laps, ridge length, and fastener count"
  caption="Future diagram: roofing estimation worked example — sheet coverage, laps, ridge, and fasteners"
  suggestedAsset="Step-by-step illustrated calculation example"
  placementIntent="Provides practical example of roofing material estimation" />
## Quick Reference: Earthwork Formula Table

| Method | Formula | Suitable For | Notes |
|---|---|---|---|
| Trapezoidal (1 section) | V = (L/2)(A₁ + A₂) | Two adjacent cross-sections | Simple, common |
| Trapezoidal (n sections) | V = (L/2)[(A₁ + Aₙ) + 2Σmiddle] | Multiple regular sections | Industry standard |
| Prismoidal | V = (L/3)[(A₁ + Aₙ) + 4(even) + 2(odd)] | High-precision estimates | Better accuracy 2–8% lower |
| Average end area | V = L × avg(A₁, A₂) | Simplified approximation | Quick estimates |

## Philippine Construction Context

In the Philippines, earthwork is a major cost component for road construction, building sites, and land development. The DPWH Blue Book specifies the trapezoidal method for progress billing and the prismoidal method for final payment on significant projects (Item 202, Earthwork). Large projects (highways, reclamation) use prismoidal exclusively for precision.

Standard cross-section intervals are 20 meters for highways and 10–15 meters for complex terrain (mountainous, undulating). Surveyors measure areas at each station using theodolites and GPS. Cut and fill are tracked separately: cut is the excavated material, and fill is the imported or reused material for embankments.

Climate: Philippines' rainy season affects excavation costs (increased equipment wear, slower work) and soil conditions (saturated clay swells more). Material sourcing from borrow pits or quarries involves haul distances that impact costs significantly.

## How It's Tested

On the LEA, earthwork volume questions focus on:

1. **Two-section volume**: Given L and two cross-sectional areas, calculate volume using V = (L/2)(A₁ + A₂).

2. **Multiple sections (trapezoidal)**: Given multiple area measurements at regular intervals, apply the standard trapezoidal formula.

3. **Multiple sections (prismoidal)**: Apply the prismoidal formula with careful attention to even/odd area numbering.

4. **Cut vs. fill**: Identify and sum cut areas separately from fill areas.

5. **Shrinkage/swell adjustment**: Apply a swell factor (1.1–1.3) if loose excavated soil volume is needed.

6. **Cost estimation**: Volume × unit cost per m³ = earthwork cost.

[SLATECAMP_UI_BLOCK:ui_0003 component="Tip" status="preserved"]

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0004 component="WikiMistakeCard" status="preserved"]

[SLATECAMP_UI_BLOCK:ui_0005 component="WikiMistakeCard" status="preserved"]

[SLATECAMP_UI_BLOCK:ui_0006 component="WikiMistakeCard" status="preserved"]

[SLATECAMP_UI_BLOCK:ui_0007 component="WikiMistakeCard" status="preserved"]

[SLATECAMP_UI_BLOCK:ui_0008 component="WikiMistakeList" status="preserved"]

## Related Articles

See also within Estimating Quantities and Material Computation: **lea-matl-010-01-core-concept**, **lea-matl-010-02-core-concept**, **lea-matl-010-03-core-concept**, **lea-matl-010-04-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.

