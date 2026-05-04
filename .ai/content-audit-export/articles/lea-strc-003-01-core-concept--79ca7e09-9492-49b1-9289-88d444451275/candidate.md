## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define stress as force per unit area and strain as deformation per unit length
- Identify the five critical points on a stress-strain diagram: proportional limit, elastic limit, yield point, ultimate strength, and rupture
- Distinguish elastic region from plastic region behavior
- Explain the significance of the Modulus of Elasticity (E) as the slope of the elastic region
- Recall standard A36 steel properties: Fy = 248 MPa, Fu = 400 MPa, E = 200,000 MPa

The stress-strain diagram is the foundation of material behavior analysis. Master the five critical points—proportional limit, elastic limit, yield point, ultimate strength, and rupture—and you own the entire conversation about how materials fail.

## Core Concept
<ArticleMedia id="media-lea-strc-003-01-core-concept" type="image" caption="Stress-Strain Diagram — Five Critical Points" alt="Engineering stress-strain curve for A36 steel showing five critical points: (1) Proportional Limit — end of linear elastic region; (2) Elastic Limit — max stress without permanent deformation; (3) Yield Point — upper and lower yield plateau; (4) Ultimate Strength — maximum stress; (5) Rupture — fracture point. Modulus of Elasticity E shown as slope of elastic region. Elastic vs plastic regions clearly labeled." suggestedAsset="Diagram or reference image" status="placeholder" />

Stress measures the internal force per unit area within a material. Strain measures the deformation per unit original length. When you plot stress against strain, the resulting curve tells you everything about how a material responds to loading.

The stress-strain relationship is not linear throughout the entire range. Different regions exhibit fundamentally different behavior. Early on, the material obeys Hooke's Law (stress ∝ strain). As load increases, this linearity breaks down at specific identifiable points. The diagram captures these transitions with precision.

Stress = Force / Original Area (units: MPa or psi). Strain = Change in Length / Original Length (dimensionless). The 45-degree reference lines on stress-strain diagrams help you identify critical ratios and proportions between different material states.

## Key Provisions

### The Five Critical Points on the Stress-Strain Diagram

| Point | Definition | Behavior After |
|-------|-----------|-----------------|
| **Proportional Limit** | Highest stress where stress-strain relationship remains linear (Hooke's Law holds exactly) | Deviation begins; nonlinearity enters |
| **Elastic Limit** | Highest stress the material can sustain and still return to zero strain upon complete unloading | Permanent deformation begins; point of no return for true elasticity |
| **Yield Point** | Stress at which the material undergoes plastic (permanent) deformation with continued loading at constant or decreasing stress | Material flows; strain increases without proportional stress increase |
| **Ultimate Strength (UTS)** | Maximum stress the material can sustain during the entire loading process | Maximum load capacity reached; necking or localized failure begins |
| **Rupture (Breaking Point)** | Stress at which complete material separation occurs | Material separates into pieces; zero carrying capacity |

### Material Regions and Slopes

**Elastic Region** (from origin to elastic limit): Stress-strain curve is nearly linear. Slope = Modulus of Elasticity (E). The material recovers fully when unloaded.

**Plastic Region** (from elastic limit to rupture): Permanent deformation accumulates. The curve flattens or slopes downward. Unloading follows a line parallel to the original elastic slope.

**Yield Plateau** (present in some ductile metals): A horizontal or near-horizontal section where strain increases at constant stress. This is the yield point region, characteristic of structural steel.

### Practical Thresholds for Steel (A36)

| Property | Value |
|----------|-------|
| Yield Strength (Fy) | 248 MPa |
| Ultimate Strength (Fu) | 400 MPa |
| Modulus of Elasticity (E) | 200,000 MPa |

These are fixed reference values. A36 steel always has E = 200,000 MPa regardless of application or mill. The ratio Fu/Fy ≈ 1.6 for A36, a signature proportion in structural design.

## Philippine Practice Context

The NSCP (National Structural Code of the Philippines) uses stress-strain diagrams to define design capacities for both ASD and LRFD methods. The yield point defines the dividing line between working-level design (ASD) and strength-level design (LRFD). Understanding this diagram is non-negotiable for Philippine engineering licensure.

## How It's Tested

**Pattern 1: Point Identification.** You are given a stress-strain diagram with five labeled points. Questions ask which point represents the elastic limit, yield point, or ultimate strength. These require memorization and conceptual clarity.

**Pattern 2: Interpretation of Unloading.** The diagram shows a point within the plastic region. A problem states the material is unloaded from that point. Questions ask: (a) what the unloading slope equals (answer: E), (b) what permanent strain remains (answer: the horizontal distance), (c) what residual stress exists (answer: zero, once fully unloaded).

**Pattern 3: Comparative Analysis.** Two stress-strain diagrams are shown—one ductile, one brittle. Questions ask to identify which is which, or to explain why one has a large plastic region and the other does not.

<Tip>The slope of the elastic region IS the Modulus of Elasticity. The slope of the unloading line (even from deep in the plastic region) also equals E. This parallelism is your memory anchor: elastic behavior is reversible, even if permanent strain remains.</Tip>

## Related Articles

See also: **Material Properties** (lea-strc-003-02) for how materials deform and store energy, **Modulus** (lea-strc-003-03) for a deeper look at elastic moduli, and **Internal Forces** (lea-strc-001-05) for the loads that create stress.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

<WikiMistakeList mistakes={["Confusing proportional limit with elastic limit. The proportional limit marks where Hooke's Law stops holding mathematically. The elastic limit marks where the material stops returning to zero strain. These are close but distinct.","Assuming the yield point and elastic limit are the same thing. They are not. The elastic limit comes first; permanent deformation begins there. The yield point (in materials with a yield plateau) comes after, marked by a horizontal or near-flat region.","Misreading the stress axis. Stress is force divided by original (not current) area. This is engineering stress, not true stress. Confusion here leads to wrong numerical answers.","Treating E as variable across steel grades. E = 200,000 MPa for all structural steel grades. Only Fy and Fu change. Grade 50 and A36 have the same E.","Thinking rupture and ultimate strength are the same. Ultimate strength (UTS) is the peak of the curve. Rupture is where the material breaks completely. The difference between them represents necking and final fracture."] />