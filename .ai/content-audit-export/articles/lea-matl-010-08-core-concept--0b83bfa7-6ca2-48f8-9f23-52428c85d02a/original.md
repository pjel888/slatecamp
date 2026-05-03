## What You Need to Know for the LEA

Earthwork volume computation determines the cubic meters of soil to be excavated (cut) or filled in grading, road construction, and foundation work. Two primary methods are used: (1) trapezoidal (average end area) formula for simplicity, and (2) prismoidal formula for higher accuracy. In the Philippines, road and building projects commonly use these methods per DPWH Blue Book specifications.

## Core Concept

Earthwork volume is calculated from cross-sectional areas at measured stations (e.g., every 10 or 20 meters along a road centerline). The trapezoidal formula is: _V = (L/2) × (A₁ + A₂)_ for a single section, where L is the distance between cross-sections and A₁, A₂ are the areas. For multiple sections at regular intervals: _V = (L/2) × [(A₁ + Aₙ) + 2(A₂ + A₃ + ... + Aₙ₋₁)]_.

The prismoidal formula is more accurate, particularly for parabolic or irregular sections: _V = (L/3) × [(A₁ + Aₙ) + 4(even-numbered areas) + 2(odd-numbered areas)]_. The prismoidal method typically yields 2–8% lower volumes than the trapezoidal method for the same data, particularly on undulating terrain.

In the Philippines, standard practice uses the trapezoidal method for preliminary estimates and the prismoidal method for final billing and payment. The formula constants (L/2 vs. L/3) reflect the different integration approaches.

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

<Example>
**Scenario 1: Road section with two cross-sections 20 meters apart; Cut area A₁ = 50 m², Cut area A₂ = 60 m²**

**Step 1: Apply trapezoidal formula for single interval**

V = (L/2) × (A₁ + A₂) = (20/2) × (50 + 60) = 10 × 110 = 1,100 m³

**Answer: 1,100 m³ cut volume**
</Example>

<Example>
**Scenario 2: Road grading with 5 cross-sections at 15 m intervals; Areas: A₁ = 40 m², A₂ = 52 m², A₃ = 58 m², A₄ = 45 m², A₅ = 35 m²**

**Step 1: Apply trapezoidal formula for multiple sections**

V = (L/2) × [(A₁ + A₅) + 2(A₂ + A₃ + A₄)]

V = (15/2) × [(40 + 35) + 2(52 + 58 + 45)]

V = 7.5 × [75 + 2(155)]

V = 7.5 × [75 + 310]

V = 7.5 × 385 = 2,887.5 m³

**Step 2: Apply prismoidal formula for verification (higher accuracy)**

V = (L/3) × [(A₁ + A₅) + 4(A₂ + A₄) + 2(A₃)]

V = (15/3) × [(40 + 35) + 4(52 + 45) + 2(58)]

V = 5 × [75 + 4(97) + 116]

V = 5 × [75 + 388 + 116]

V = 5 × 579 = 2,895 m³

**Comparison**: Trapezoidal = 2,887.5 m³; Prismoidal = 2,895 m³ (differ by ~0.3%, both reasonable)

**Answer: ~2,890 m³ (trapezoidal for simplicity, prismoidal for accuracy)**
</Example>

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

<Tip>
**Memory aid**: Trapezoidal = (L/2) × [first + last + 2(middles)]. Prismoidal = (L/3) × [first + last + 4(even stations) + 2(odd stations, excluding first and last)]. When in doubt, use trapezoidal; it's simpler and acceptable for most LEA-level problems.
</Tip>

## Common Mistakes

<WikiMistakeCard mistake="Confusing the trapezoidal formula constant L/2 with L/3 (prismoidal)" correction="Trapezoidal uses L/2. Prismoidal uses L/3. If you can't remember which, stick with trapezoidal for simplicity." />

<WikiMistakeCard mistake="Forgetting to divide the first and last terms by 2 in the trapezoidal formula" correction="The formula is (L/2) × [(A₁ + Aₙ) + 2(sum of middle areas)]. The first and last are NOT doubled; only the middle areas are." />

<WikiMistakeCard mistake="Using incorrect numbering for even/odd stations in the prismoidal formula" correction="Stations are numbered 1, 2, 3, ..., n. Even stations: 2, 4, 6, ... Odd stations: 3, 5, 7, ... (exclude 1 and n)." />

<WikiMistakeCard mistake="Not separating cut and fill volumes" correction="Cut and fill are tracked independently. Do not mix them in one calculation." />

<WikiMistakeList mistakes={["Applying a swell factor without being asked (swell only applies if loose excavated volume is the deliverable)", "Using area measurements in the wrong units (ensure all areas are in m²)", "Forgetting that L is the interval between sections, not the total length", "Confusing prismoidal accuracy (typically 2–8% lower than trapezoidal) as a defect rather than expected behavior"]} />