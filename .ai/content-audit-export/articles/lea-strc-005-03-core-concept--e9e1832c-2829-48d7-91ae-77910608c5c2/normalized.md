## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Explain the ASD method: F_actual ≤ F_allowable = F_y / Ω
- Define the safety factor (Ω) and distinguish it from LRFD's φ and load factors
- Apply ASD to stress checks in steel, timber, and masonry
- Identify which NSCP edition uses ASD

ASTM A36 is the most common structural steel in the Philippines. Under the Allowable Stress Design (ASD) method, the allowable stresses for A36 are: shear 0.40_F_y (99 MPa), axial compression 0.60_F_y, and bending 0.66_F_y (164 MPa). A36 has _F_y = 248 MPa and _F_u = 400 MPa. You must memorize these allowable stress fractions and understand which applies to each stress type.

## Core Concept

The ASD method divides the yield strength _F_y_ by a safety factor (factor of safety) to obtain an allowable stress. This allowable stress is compared directly to the applied stress (not factored loads). For example, if a steel member carries a working load that produces a bending stress of 150 MPa, the designer checks whether 150 MPa ≤ allowable bending stress (164 MPa for A36).

The NSCP refers to ASD as the "Working Stress Design" method. It is less commonly used in the Philippines than LRFD (load and resistance factor design, used in reinforced concrete), but it remains the baseline method for structural steel in many building codes and is tested on the LEA.

A36 steel has a nominal yield strength _F_y_ = 248 MPa (36 ksi, hence the name). The ultimate tensile strength _F_u_ = 400 MPa. Different stress types (bending, shear, compression) receive different allowable stress fractions because they have different ductility and failure characteristics. Bending (flexure) is the most ductile and receives the highest allowable stress fraction (0.66_F_y_). Shear is less ductile and receives a lower fraction (0.40_F_y_). Axial compression also receives 0.60_F_y_ because buckling and member stability are concerns.

The safety factors embedded in these allowable stresses are generally 1.5 to 1.67 (reciprocals of 0.60–0.66), reflecting acceptable uncertainty in loads, material properties, and construction variability under working conditions.

## Key Provisions

### A36 Steel Material Properties

| Property | Value |
|---|---|
| Yield Strength (_F_y_) | 248 MPa (36 ksi) |
| Ultimate Tensile Strength (_F_u_) | 400 MPa (58 ksi) |
| Modulus of Elasticity (_E_) | 200,000 MPa |
| Poisson's Ratio (_ν_) | 0.30 |
| Shear Modulus (_G_) | 77,000 MPa |

### A36 Allowable Stresses (ASD Method)

| Stress Type | Allowable Stress Formula | Allowable Stress Value | Fraction of _F_y_ |
|---|---|---|---|
| Shear (horizontal and vertical) | _F_v = 0.40_F_y_ | 99 MPa (14.4 ksi) | 0.40 |
| Axial compression (short columns, elastic) | _F_c = 0.60_F_y_ | 149 MPa (21.6 ksi) | 0.60 |
| Bending (compact sections) | _F_b = 0.66_F_y_ | 164 MPa (23.8 ksi) | 0.66 |
| Bearing on steel | _F_p = 1.0_F_y_ | 248 MPa | 1.0 |

### Common Error: Bending vs. Compression

A critical error in practice is confusing the bending allowable (0.66_F_y_) with the compression allowable (0.60_F_y_). Bending receives a _higher_ allowable stress (0.66 vs. 0.60) because the stress distribution in a bent beam is non-uniform; the outer fibers are the most stressed, but the interior fibers carry less stress. In contrast, axial compression subjects the entire cross-section to uniform stress, and buckling risk adds conservatism. Always verify: _Bending = 0.66F_y_, Compression = 0.60_F_y_.

## Philippine Practice Context

Most structural steel design in the Philippines uses LRFD (ASD is less common in modern practice), but ASD remains relevant for rehabilitation projects, smaller buildings, and code-reference questions. Design offices in Metro Manila often cross-check designs using both LRFD and ASD. The Bureau of Internal Revenue (BIR) building in Makati and many commercial structures in Cebu were designed with A36 under ASD rules. Understanding A36 allowable stresses is essential for engineers reviewing older designs or working with heritage structures. City engineers frequently encounter A36 specs in submitted plans.

## How It's Tested

**Pattern 1:** Given an applied stress (bending, shear, or compression) and asked whether the member is safe. The question specifies which stress type, and the answer requires comparing the applied stress to the allowable value.

**Pattern 2:** Given A36 properties and asked to calculate an allowable stress from the fraction. For example, "Calculate the allowable bending stress for A36."

**Pattern 3:** A statement about allowable stress fractions (e.g., "bending is 0.60_F_y_"), with false options that swap values. Careful reading of the correct answer is required.

[SLATECAMP_UI_BLOCK:ui_0001 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memorize the A36 allowable stress fractions:** _Shear: 0.40F_y = 99 MPa_ _Compression: 0.60F_y = 149 MPa_ _Bending: 0.66F_y = 164 MPa_ Bending is always higher than compression. If you see 0.60 for bending, that is a trap answer. Always confirm which stress type is being asked about. **A36 Properties:** _F_y = 248 MPa, F_u = 400 MPa, E = 200,000 MPa. Use these for calculations.
- **Exam relevance:** High — expect at least one question on this topic per LEA set.



[/SLATECAMP_UI_BLOCK]


## Related Articles

See also: **ASD vs LRFD** (lea-strc-003-04) for the comparison of design philosophies, **Required Strength** (lea-strc-005-01) for the LRFD alternative, and **Stress-Strain** (lea-strc-003-01) for the yield strength that defines allowable stress.

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: These are frequently tested traps. Memorize them to avoid losing easy points on exam day.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0002 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Confusing bending allowable 0.66Fy with compression allowable 0.60Fy; bending is higher because the stress distribution is non-uniform.\", \"Using shear allowable 0.40Fy for bending; shear is the lowest fraction because it is the least ductile under monotonic loading.\", \"Forgetting that A36 Fy = 248 MPa, not 250 or 255 MPa; precision matters in code citations.\", \"Applying allowable stresses from a different steel grade (e.g., A992) to A36; always confirm the material grade first.\", \"Misremembering the fraction: writing 0.65 or 0.67 instead of 0.66 for bending; the exact value is 0.66.\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]