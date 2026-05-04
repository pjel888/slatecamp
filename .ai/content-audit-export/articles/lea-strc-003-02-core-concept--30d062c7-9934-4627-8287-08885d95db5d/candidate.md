## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define key material properties: strength, stiffness, ductility, and toughness
- Distinguish between elastic and plastic deformation
- Explain how Poisson's ratio relates axial and lateral strain
- Describe how material properties influence structural design choices

Material properties are the language of structural behavior. Ductility, brittleness, elasticity, toughness, and creep define how materials respond to load, time, and environment. Master the sharp distinctions between them, and you can predict failure modes with precision.

## Core Concept
<ArticleMedia id="media-lea-strc-003-02-core-concept" type="image" caption="Material Properties Comparison — Steel, Concrete, and Timber" alt="Three-column comparison table visual: Steel (E=200 GPa, ductile, isotropic), Concrete (E~4700√f'c, brittle in tension, orthotropic), Timber (E varies by species/grain, anisotropic, viscoelastic). Each column shows stress-strain curve shape, Poisson's ratio, thermal expansion coefficient, and typical failure mode illustration." suggestedAsset="Diagram or reference image" status="placeholder" />

Material properties describe how materials deform, store energy, and resist damage. These properties are independent of shape or size; they belong to the material itself, not the structure. Understanding this distinction is critical: a steel beam can be designed to fail in ductile or brittle modes depending on geometry and loading. The steel itself is ductile.

**Ductility** is the capacity to draw a material into wire through tensile loading. It measures permanent deformation at rupture, expressed as percent elongation or percent reduction in area. Ductile materials yield before breaking, signaling danger with visible distortion. High ductility = high percent elongation after rupture.

**Malleability** is the capacity to hammer a material into sheets without breaking. It is deformation under compression, not tension. This distinction is essential: ductility = drawing into wire (tension); malleability = hammering into sheets (compression). A material can be ductile and not malleable, though most ductile metals are both.

**Brittleness** is the opposite of ductility. Brittle materials fracture with little or no plastic deformation, offering no warning. Percent elongation at rupture is very low (often under 5%). Cast iron, concrete, and glass are brittle. Brittle materials fail suddenly; they do not yield.

**Elasticity** is the property to return to original dimensions upon unloading. It is reversibility. The elastic limit (from Article -01) is the stress boundary of elasticity. Beyond this, permanent deformation occurs, and the material is no longer purely elastic. Elasticity is a yes/no property in the range from origin to elastic limit.

**Toughness** is resistance to fracture under impact or shock loading. It is the ability to absorb energy without breaking. Toughness requires both strength (high yield stress) and ductility (capacity for plastic deformation). High strength alone is brittle; high ductility alone is soft. Toughness is the product: **strength + ductility = toughness**. The area under the entire stress-strain curve (from origin to rupture) represents toughness quantitatively.

**Creep** is time-dependent permanent deformation under sustained constant load at elevated temperature. Unlike yielding (instantaneous plastic flow), creep accumulates over days, months, or years. Metals creep significantly only above about 40% of their absolute melting temperature. At room temperature, structural steel does not creep. Concrete creeps at any temperature under sustained load due to its porous structure and viscous matrix. Creep rate depends on stress level, temperature, and material composition.

## Key Provisions

### Material Properties at a Glance

| Property | Definition | Measurement | Warning Sign |
|----------|-----------|-------------|--------------|
| **Ductility** | Capacity to draw into wire; permanent elongation at rupture | Percent elongation (%ΔL) or percent reduction in area (%RA) | Large plastic region on stress-strain diagram |
| **Malleability** | Capacity to hammer into sheets; permanent deformation under compression | Compression test without fracture | Distinct from ductility; compression behavior |
| **Brittleness** | Fracture with little or no plastic deformation | Very low percent elongation (&lt;5%) | Sudden failure; no yield plateau; stress-strain curve drops sharply |
| **Elasticity** | Return to original dimensions upon complete unloading | Linear stress-strain up to elastic limit | Reversibility; zero permanent strain within elastic range |
| **Toughness** | Resistance to fracture under impact; energy absorption capacity | Area under stress-strain curve (elastic + plastic regions) | Material survives shock without breaking |
| **Creep** | Time-dependent permanent deformation under sustained load at elevated temperature | Strain over time (hours, days, years) | Progressive elongation under constant load and heat |

### Ductility vs. Malleability (Critical Distinction)

Ductility and malleability are often confused. They are not synonymous.

- **Ductility = Tension-based.** A ductile material draws into wire without breaking. Steel, aluminum, copper are ductile. Percent elongation measures ductility.
- **Malleability = Compression-based.** A malleable material hammers into sheets without cracking. Gold and lead are highly malleable. Pure iron can be cold-worked into sheets (malleable) and also drawn into wire (ductile). Cast iron is neither ductile nor malleable; it cracks under both tension and compression without warning.

### Temperature Effects on Creep

Creep is insignificant in structural steel at room temperature. Creep becomes significant in:

- **Concrete:** Immediate + time-dependent deformation under sustained load. Standard assumption: creep strain = 2 × immediate elastic strain over long term (time-dependent amplification factor ≈ 2–3, depending on age, humidity, and member size).
- **Steel at elevated temperature:** Above ~400°C under sustained load, creep becomes observable.
- **Prestressed concrete:** Creep reduces prestress over time (stress relaxation in the tendon + concrete creep strains combine).

## Philippine Practice Context

The NSCP permits service-level deformations up to span/240 for floors and span/180 for roofs. Creep in concrete under sustained load is explicitly included in long-term deflection calculations, using the effective modulus approach: Ec,eff = Ec / (1 + λ × φ), where φ is the creep coefficient and λ accounts for load type. Philippine engineers must distinguish between immediate (elastic) and time-dependent (creep) deformations in design.

## How It's Tested

**Pattern 1: Property Definition and Identification.** You are given material descriptions or material names. Questions ask: "Which property does this describe?" or "Which material exhibits this behavior?" Ductility vs. malleability vs. brittleness are common discriminators.

**Pattern 2: Stress-Strain Interpretation.** You are given two stress-strain diagrams. One shows a large plastic region; one shows sudden fracture. Questions ask to identify which is ductile, which is brittle, and to justify the answer in terms of percent elongation or yield capacity.

**Pattern 3: Toughness and Energy.** Questions ask: "Why is a ductile, strong material tougher than a brittle strong material?" or "How does the area under the stress-strain curve relate to toughness?" These test conceptual understanding of the link between stress-strain shape and energy absorption.

**Pattern 4: Creep and Time.** Concrete under sustained load is loaded to a constant stress (e.g., 0.4 f'c). Questions ask for the long-term deformation, time-dependent amplification, or the distinction between immediate and creep strains. A concrete beam deflects immediately upon loading, then continues to deflect slowly over years.

<Tip>Ductility = wire. Malleability = sheet. If you cannot draw it into wire, it is not ductile. If you cannot hammer it into a sheet, it is not malleable. Toughness = area under the curve. Creep = time. Remember: creep requires sustained load AND elevated (or moderately elevated) temperature; room-temperature creep in steel is negligible, but concrete creeps at any temperature.</Tip>

## Related Articles

See also: **Stress-Strain** (lea-strc-003-01) for the diagram that defines these properties, **Modulus** (lea-strc-003-03) for stiffness measures, and **Concrete Materials** (lea-strc-006-01) for concrete-specific properties.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

<WikiMistakeList mistakes={["Confusing ductility with malleability. Ductility is drawing into wire (tension); malleability is hammering into sheets (compression). A material must be tested separately for each property. Gold is malleable but less ductile than copper.","Treating ductility and toughness as synonymous. Ductility is capacity for plastic elongation. Toughness is energy absorption. A material can be ductile but not tough if it has low strength. A material can be strong but brittle (high strength, zero ductility, zero toughness).","Assuming brittleness means low strength. Brittle materials can be very strong (high-strength concrete, glass) but offer no warning before failure. Brittleness = no plastic flow, not weakness.","Thinking creep is instantaneous. Creep is permanent deformation over time under sustained load. It is not yielding (which is immediate). Concrete creeps significantly at room temperature; structural steel does not creep at room temperature.","Omitting creep in concrete deflection calculations. Long-term deflection = immediate elastic deflection × (1 + time-dependent amplification factor). Ignoring creep leads to underestimated total deflection and possible code violations.","Confusing percent elongation with ductility. Percent elongation IS the measurement of ductility, but the concept is broader: the ability to permanently deform and absorb energy. A material with 20% elongation is more ductile than one with 5%."] />