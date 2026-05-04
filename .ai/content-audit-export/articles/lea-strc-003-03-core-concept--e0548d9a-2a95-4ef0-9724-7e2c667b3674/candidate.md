## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define the three elastic moduli: Young's modulus (E), shear modulus (G), and bulk modulus (K)
- State the relationship between E, G, and Poisson's ratio (ν): G = E / [2(1+ν)]
- Recall standard values: E_steel = 200,000 MPa, E_concrete = 4,700√(f'c)
- Explain what each modulus measures in terms of material resistance to deformation

The moduli—elasticity, rigidity, resilience, and toughness—are slope-based and energy-based measures of stiffness and energy capacity. Memorize their definitions and standard values. These appear in every calculation: deflection, lateral stability, foundation design.

## Core Concept
<ArticleMedia id="media-lea-strc-003-03-core-concept" type="image" caption="Modulus of Elasticity — Slope of the Stress-Strain Curve" description="Graphical illustration showing Modulus of Elasticity (E) as the slope of the linear-elastic region of the stress-strain curve. Three materials compared: steel (steepest slope, E=200 GPa), concrete (intermediate, E~4700√f'c), and timber (shallowest, E varies by grade). Shows how higher E means stiffer material — less strain for same stress." suggestedAsset="Diagram or reference image" status="placeholder" />

A modulus is a measure of a material's resistance to deformation under a specific type of stress. Unlike strength (which measures capacity to resist failure), moduli measure the slope of response: how much deformation results from a unit of stress. Moduli are properties of the material, not the member. A stiff material has a high modulus; a soft material has a low modulus.

**Modulus of Elasticity (E)** is the slope of the linear (elastic) portion of the stress-strain diagram. It is defined as E = σ / ε within the proportional limit. Units: MPa or psi. The higher the E, the stiffer the material and the less it deforms elastically. E is the fundamental input to all deflection calculations.

For structural steel of any grade: **E = 200,000 MPa (200 GPa or 29,000 ksi)**. This value is constant across all structural steel grades. The grade designation (A36, Grade 50, etc.) specifies Fy and Fu, but not E.

For normal-weight concrete: **Ec = 4,700√f'c (in MPa)**, where f'c is the 28-day compressive strength in MPa. This relationship reflects that stiffer (stronger) concrete is also less porous.

**Modulus of Rigidity (G)**, also called Shear Modulus, measures resistance to shear (angular) deformation. G relates shear stress τ to shear strain γ: G = τ / γ. For steel: **G ≈ 77,000 MPa** or **G = E / (2(1 + ν))** where ν is Poisson's ratio (≈ 0.30 for steel). G is roughly 0.38E for most metals.

**Modulus of Resilience (ER)** is the maximum stress energy stored per unit volume without permanent deformation. It is the area under the stress-strain curve up to the yield point (elastic region only), expressed as energy density. Mathematically: **ER = Fy² / (2E)**. Units: MPa (or energy per volume). Resilience quantifies the "spring-back" capacity. A resilient material stores energy and returns it upon unloading.

**Modulus of Toughness (ET)** is the total energy absorbed per unit volume from zero stress to rupture (the entire area under the stress-strain curve). Unlike resilience (elastic region only), toughness includes the plastic region. Toughness is always much larger than resilience because it includes strain hardening and plastic deformation. No simple formula; it must be calculated by integrating the stress-strain curve.

## Key Provisions

### Standard Modulus Values

| Material | Modulus of Elasticity | Modulus of Rigidity | Notes |
|----------|----------------------|-------------------|-------|
| **Structural Steel (all grades)** | E = 200,000 MPa | G ≈ 77,000 MPa | E is constant; Fy and Fu vary by grade |
| **Concrete (normal weight)** | Ec = 4,700√f'c MPa | Not typically used | For f'c = 25 MPa: Ec ≈ 23,500 MPa |
| **Aluminum (6061-T6)** | E ≈ 69,000 MPa | G ≈ 26,000 MPa | Lower stiffness than steel |
| **Wood (parallel to grain)** | E ≈ 10,000–15,000 MPa | Variable | Highly orthotropic; different G perpendicular to grain |

### Calculation of Resilience

The modulus of resilience is calculated as the elastic strain energy density:

**ER = Fy² / (2E)**

For A36 steel with Fy = 248 MPa:
- ER = (248)² / (2 × 200,000)
- ER = 61,504 / 400,000
- ER ≈ 0.154 MPa

This means A36 steel can store 0.154 MPa of elastic energy per unit volume before yielding. Upon unloading, this energy is fully recovered as elastic spring-back.

### Poisson's Ratio and Lateral Strain

When a material is loaded in one direction, it typically contracts in the perpendicular directions. Poisson's ratio (ν) quantifies this lateral-to-longitudinal strain ratio: ν = lateral strain / longitudinal strain.

- **Steel:** ν ≈ 0.30
- **Concrete:** ν ≈ 0.17–0.20
- The relationship between E, G, and ν: **G = E / (2(1 + ν))**

For steel: G = 200,000 / (2 × 1.30) = 200,000 / 2.60 ≈ 77,000 MPa.

## Philippine Practice Context

The NSCP mandates the use of Ec = 4,700√f'c for normal-weight concrete deflection calculations. Lightweight concrete uses a different formula with a correction factor λ < 1. The modulus of elasticity directly governs allowable deflection (typically L/240 for floors). Engineers must verify that deflection δ = ML² / (EI) does not exceed code limits, making E the controlling stiffness input.

## How It's Tested

**Pattern 1: Direct Calculation.** Concrete with f'c = 30 MPa is given. Calculate Ec using the formula. Answer: Ec = 4,700√30 ≈ 25,700 MPa. Verify against bounds (4,000–5,000 times f'c for typical concrete).

**Pattern 2: Ratio and Relationship.** Given E and ν (or G), verify the relationship G = E / (2(1 + ν)). For steel: G = 200,000 / (2 × 1.30) ≈ 77,000 MPa. Check: 77,000 / 200,000 ≈ 0.385, or roughly 38% of E.

**Pattern 3: Resilience Calculation.** For A36 steel (Fy = 248 MPa, E = 200,000 MPa), calculate resilience: ER = (248)² / (2 × 200,000) ≈ 0.154 MPa. Interpret: the maximum elastic strain energy the material can store per unit volume.

**Pattern 4: Deflection Comparison.** Two beams: one steel (E = 200,000 MPa), one concrete (Ec ≈ 25,000 MPa). Same span, same load, same I. Which deflects more? Concrete: δ ∝ 1/E, so the concrete beam deflects (200,000 / 25,000) = 8 times more than the steel beam. Materials with lower E are more flexible.

<Tip>Remember: E is in the denominator of deflection formulas. Lower E = more deflection. Steel (high E) is stiffer than concrete (lower E). Resilience = elastic energy only. Toughness = total energy (elastic + plastic). Every problem involving deflection, lateral stability, or buckling contains a hidden E.</Tip>

## Related Articles

See also: **Stress-Strain** (lea-strc-003-01) for where modulus appears as slope, **Material Properties** (lea-strc-003-02) for the broader context, and **ASD vs LRFD** (lea-strc-003-04) for how modulus affects design methods.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

<WikiMistakeList mistakes={["Assuming E varies by steel grade. E = 200,000 MPa for all structural steel grades. Only Fy and Fu vary. This is tested repeatedly.","Forgetting the √f'c in the concrete modulus formula. Ec = 4,700√f'c, not 4,700 × f'c. The square root is non-negotiable. For f'c = 25 MPa: Ec = 4,700 × 5 = 23,500 MPa (not 117,500 MPa).","Confusing Modulus of Resilience (elastic energy only, up to yield) with Modulus of Toughness (total energy, to rupture). Resilience uses the formula ER = Fy² / (2E). Toughness is always larger and requires integrating the entire stress-strain curve.","Using the wrong definition of Poisson's ratio. Poisson's ratio is lateral strain / longitudinal strain, not lateral stress / longitudinal stress. For steel, ν ≈ 0.30, meaning lateral strain is 30% of longitudinal strain.","Misapplying the G = E / (2(1 + ν)) relationship. For steel with ν = 0.30: G = E / 2.60, not E / 2.30 or other variations. The denominator is 2(1 + ν) = 2 × 1.30 = 2.60.","Treating moduli as constants across all concrete strengths. Ec depends on f'c. A 40 MPa concrete is stiffer than 25 MPa concrete: Ec(40) / Ec(25) = √40 / √25 = 6.32 / 5 ≈ 1.27×. The modulus increases with strength."] />