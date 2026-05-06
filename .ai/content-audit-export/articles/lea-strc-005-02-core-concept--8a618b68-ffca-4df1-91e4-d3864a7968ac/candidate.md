

## Board Exam Quick Check

Before memorizing details from this topic, state the exam task in one sentence: what is being classified, measured, approved, or restricted? Then identify the controlling rule named by the item and avoid importing requirements from a different law, table, or occupancy condition.

**Common mistake:** treating a familiar keyword in **Lea Strc 005 02 Core Concept** as enough to answer. In LEA-style questions, first anchor the question to the exact code, scope, and condition being tested, then choose the option that follows that rule.

**Retrieval prompt:** What fact in the question tells you which rule set applies, and what option would become wrong if the scope changed?
## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Explain the fundamental design inequality: Required Strength ≤ Design Capacity
- Distinguish between nominal strength (Rn) and design strength (φRn)
- Define the capacity reduction factor (φ) and identify common values
- Compare LRFD capacity check with ASD allowable stress check

Strength reduction factors (φ) are multipliers applied to material strength to account for variability in construction quality, material properties, and analysis methods. They range from 0.70 to 0.90 depending on the failure mode and reinforcement type. You must memorize the complete φ factor table and understand which factor applies to each structural situation.

## Core Concept
<ArticleMedia id="media-lea-strc-005-02-core-concept" type="image" caption="Structural Design Capacity Check — Demand vs Capacity Comparison" description="Flowchart showing the structural design verification process: (1) Determine required strength U (demand from factored loads); (2) Determine nominal strength Rn (material-specific capacity); (3) Apply resistance factor φ (LRFD) or safety factor FS (ASD); (4) Verify φRn ≥ U. Illustrated with beam section showing stress distribution at nominal capacity." suggestedAsset="Diagram or reference image" status="placeholder" />

Once the required strength _U_ is determined from load combinations, the structural member must be designed to have a nominal strength _S_n_ that, when multiplied by φ, equals or exceeds _U_. This is expressed as:

φ_S_n ≥ U

The strength reduction factor φ is less than 1, meaning the nominal strength must be larger than the required strength to account for uncertainty in materials, workmanship, and calculations. Different failure modes have different φ values because some failure modes are more ductile (allow warning before failure) while others are brittle.

The NSCP uses higher φ factors (0.90) for ductile modes like flexure, where steel reinforcement yields and bends before concrete crushes. This gives a visual warning that failure is near. Shear and torsion receive φ=0.85 when minimum shear reinforcement spacing s ≤ d/2 (or d/4 for perpendicular reinforcement) per NSCP 2015 Sec 5.3.11(b), otherwise φ=0.75. Axial compression, particularly in tied columns, has the lowest φ (0.70) because the mode is brittle, reinforcement does not yield as warning, and construction quality has a large influence on strength.

Bearing on concrete also receives φ = 0.70 because it is less forgiving than flexure. Post-tensioned anchorage zones receive φ = 0.85 because the failure mechanism in these zones is partly ductile and partly governed by bearing.

## Key Provisions

### Strength Reduction Factors (NSCP)

| Failure Mode | Reinforcement Type / Condition | φ Factor |
|---|---|---|
| Flexure without axial load | All cases | 0.90 |
| Axial tension | All cases | 0.90 |
| Tension with flexure | All cases | 0.90 |
| Shear and torsion | Minimum shear reinforcement spacing s ≤ d/2 | 0.85 |
| Axial compression | Spiral reinforcement | 0.75 |
| Axial compression | Tied reinforcement | 0.70 |
| Bearing on concrete | All cases | 0.70 |
| Anchorage zones in post-tensioned members | All cases | 0.85 |

### Ductility Hierarchy

Strength reduction factors reflect a hierarchy from most ductile to least ductile behavior:

- **φ = 0.90** — Flexure and tension. Steel yields with visible deformation before concrete crushes. Provides maximum warning of distress.
- **φ = 0.85** — Shear and torsion. Failure occurs more suddenly. Anchorage in post-tensioned members benefits from partial ductility in the surrounding concrete.
- **φ = 0.75** — Axial compression in spirally reinforced columns. Spiral confinement allows some post-peak strength and ductility.
- **φ = 0.70** — Axial compression in tied columns, and bearing on concrete. Tied columns have less confinement than spiral columns, and bearing failure is abrupt.

## Philippine Practice Context

Philippine design offices commonly encounter both spirally reinforced columns (in tall buildings with tight lateral spacing) and tied columns (in most ordinary construction). The distinction between φ = 0.75 (spiral) and φ = 0.70 (tied) is critical and often checked during design reviews. Many engineers pre-compute charts for _φP_n_ (capacity) versus eccentricity to accelerate column design. Government agencies in Manila require φ factor tables in all submitted calculations, and code inspectors verify that the correct factor was applied to the failure mode being checked.

## How It's Tested

**Pattern 1:** Given a failure mode (flexure, shear, compression, bearing) and asked to select the correct φ factor. Questions are straightforward recall of the table.

**Pattern 2:** Given a scenario (e.g., "a column designed with rectangular ties and reinforcement"), identify the φ factor and explain why it differs from spiral columns.

**Pattern 3:** Provided nominal strength _S_n_, required strength _U_, and asked whether the design is safe. This requires calculating φ_S_n_ and comparing to _U_.

<Tip>
**Memorize the φ hierarchy:**

FLEXURE 0.90 (ductile, steel yields) → SHEAR 0.85 (less ductile) → SPIRAL 0.75 (confined compression) → TIE/BEARING 0.70 (brittle, least ductile).

For axial compression, remember: **SPIRAL = 0.75, TIED = 0.70** (spiral allows more ductility because the steel helix prevents core bursting; ties are less effective).

For any mode not listed, confirm the specific provision in the NSCP—do not guess.
</Tip>

## Related Articles

See also: **Required Strength** (lea-strc-005-01) for the demand side of the inequality, **ASD vs LRFD** (lea-strc-003-04) for the design philosophy, and **Stress-Strain** (lea-strc-003-01) for the material properties underlying capacity.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

<WikiMistakeList mistakes={["Forgetting that φ differs by reinforcement type for axial compression; spiral is 0.75, tied is 0.70, not both 0.70.", "Applying φ = 0.90 to shear; shear uses φ = 0.85 because the failure is more sudden and less ductile.", "Using φ = 0.85 for bearing; bearing on concrete uses φ = 0.70, the same as tied columns.", "Confusing the requirement φSn ≥ U with Sn ≥ φU (the factor multiplies strength, not load).", "Omitting φ from the capacity check entirely and comparing nominal strength directly to required strength; the LRFD method requires the φ multiplication."]} />