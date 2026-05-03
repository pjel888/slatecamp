## What You Need to Know for the LEA

Reverberation time (RT60) is the duration required for sound to decay by 60 decibels after the source stops. In Philippine building design—particularly in educational, commercial, and religious spaces—controlling reverberation is critical for speech intelligibility, acoustic comfort, and regulatory compliance with standards referenced in the National Building Code.

### Core Concepts

**Reverberation Time Fundamentals**

RT60 is measured in seconds and depends on three variables: room volume (V), total surface absorption (A), and material properties. The relationship follows the _Sabine Formula_, developed in 1898 and still the industry standard for preliminary acoustic design:

$$RT60 = 0.161 \times \frac{V}{A}$$

Where:
- V = room volume in cubic meters (m³)
- A = total absorption in sabins (m² sabins)
- 0.161 is a constant derived from the speed of sound and logarithmic decay

The constant 0.161 equals (0.161 = ln(10)/55.3), as documented in Beranek's _Concert Hall Acoustics_ and confirmed in ISO 3382-1:2009 measurement standards.

**Absorption Calculation**

Total absorption is calculated by summing the products of surface area and absorption coefficient for each material:

$$A = \sum_{i=1}^{n} S_i \times \alpha_i$$

Where:
- S_i = surface area of material type _i_ (m²)
- α_i = absorption coefficient of material type _i_ (dimensionless, 0–1)

The absorption coefficient represents the fraction of incident sound energy absorbed by a material. Values vary by frequency; design typically uses the Noise Reduction Coefficient (NRC), which is the arithmetic mean of absorption at 250 Hz, 500 Hz, 1000 Hz, and 2000 Hz, per ASTM C423.

<WikiCalloutBox title="Sabine vs. Eyring Formula" variant="info">
The Sabine Formula assumes low to moderate absorption (average α < 0.3). For highly absorptive rooms, use the _Eyring Formula_:

$$RT60 = 0.161 \times \frac{V}{-S \times \ln(1 - \bar{\alpha})}$$

Where ā is the mean absorption coefficient across all surfaces and S is total surface area. The Eyring Formula is more accurate for conference rooms, recording studios, and anechoic chambers common in Philippine media production facilities.
</WikiCalloutBox>

**Absorption Coefficients in Philippine Context**

The following NRC values are typical for materials readily available in the Philippines (from ASTM C423 and manufacturer datasheets):

<WikiExactTable headers={["Material", "NRC Range", "Common Philippines Product"]} rows={[["Concrete (painted)", "0.01–0.02", "Standard cast-in-place or precast"], ["Concrete (unpainted)", "0.03–0.05", "Bare structural"], ["Glass (window)", "0.03–0.06", "Float or tempered glazing"], ["Ceramic tile", "0.01–0.02", "Glazed floor/wall tile"], ["Carpet (dense)", "0.30–0.50", "Industrial or commercial"], ["Curtain (heavy fabric)", "0.40–0.75", "Velvet or wool blend"], ["Acoustic tile (standard)", "0.70–0.90", "Suspended ceiling panels (80mm)"], ["Acoustic foam (50mm open-cell)", "0.60–0.85", "Melamine or polyurethane"], ["Plywood (on studs, 50mm air gap)", "0.15–0.30", "3–4mm veneer over cavity"], ["Gypsum board (mounted on studs)", "0.10–0.15", "Standard 13mm thickness"]]}/>

**Optimal RT60 Targets by Room Type**

Design targets balance speech clarity, music intelligibility, and acoustic comfort. These follow ISO 3382-1 and Guidelines from the Acoustical Society of America (ASA):

<WikiExactTable headers={["Room Type", "Optimal RT60 (seconds)", "Notes"]} rows={[["Classroom/lecture hall", "0.6–0.8", "Speech clarity prioritized; < 0.6s risks acoustic harshness"], ["Office (open plan)", "0.5–0.8", "Moderate absorption to reduce noise propagation"], ["Library/study space", "0.4–0.6", "Quiet, low-echo environment"], ["Multipurpose hall (speech + music)", "0.9–1.2", "Compromise between speech and light music"], ["Auditorium/concert hall", "1.5–2.2", "Supports musical resonance and blend"], ["Church/chapel", "1.5–3.0", "Longer reverberation enhances liturgical music"], ["Recording studio (dry)", "0.2–0.4", "Minimal reflections for post-production control"], ["Restaurant/cafeteria", "0.6–0.9", "Moderate absorption to manage noise"]]}/>

### Common Acoustic Problems and Mitigation

**Flutter Echo**

Flutter echo occurs when parallel reflective surfaces (e.g., two opposite concrete walls) create a repeating bouncing pattern. Symptoms include a "chirping" or "machine gun" sound when clapping in an empty room.

_Mitigation:_ Apply absorption to one wall (e.g., curtains, textile, acoustic panels) or use angled surfaces. Even 25% coverage of one parallel surface at 500–2000 Hz typically eliminates flutter echo.

**Room Modes and Standing Waves**

In rectangular rooms, wavelengths matching room dimensions create resonances at specific frequencies:

$$f_n = \frac{c}{2} \sqrt{\left(\frac{n_x}{L_x}\right)^2 + \left(\frac{n_y}{L_y}\right)^2 + \left(\frac{n_z}{L_z}\right)^2}$$

Where c = speed of sound (343 m/s at 20°C per ISO 9613-1), n = mode number (1, 2, 3…), and L = room dimensions.

_Mitigation:_ Avoid cubic room proportions. Use 1:1.6:2.5 or 1:1.4:2.1 aspect ratios. Place bass traps (porous absorbers with air-gap backing) at room corners where modal energy concentrates.

**Acoustic Focusing**

Curved reflective surfaces (domes, curved ceilings) focus sound to a focal point, creating dead spots and distorted sound. Common in Philippine churches with barrel-vault ceilings and amphitheater-style auditoria.

_Mitigation:_ Diffuse rather than absorb by applying uneven surface textures, or apply selective absorption to concave surfaces.

<Warn>
Do not treat room modes with pure absorption alone; modal energy is distributed over the entire room volume. Bass traps work by combining depth (150–300mm) with trapped air space, not surface coverage.
</Warn>

### Worked Example 1: Classroom Design

**Scenario:** A 12 m × 8 m × 3.5 m classroom (336 m³) in a public school in Metro Manila requires a reverberation time of 0.7 seconds for clear speech intelligibility. Specify absorption treatment.

**Step 1: Target Absorption**

Using Sabine Formula, rearrange to solve for A:

$$A = \frac{0.161 \times V}{RT60} = \frac{0.161 \times 336}{0.7} = \frac{54.1}{0.7} = 77.3 \text{ m}^2 \text{ sabins}$$

**Step 2: Calculate Natural (Baseline) Absorption**

Typical classroom materials:
- Concrete floor: 12 m × 8 m = 96 m² × 0.02 = 1.9 sabins
- Concrete walls (two 12 m walls): 2 × 12 m × 3.5 m = 84 m² × 0.02 = 1.7 sabins
- Concrete walls (two 8 m walls): 2 × 8 m × 3.5 m = 56 m² × 0.02 = 1.1 sabins
- Painted concrete ceiling: 12 m × 8 m = 96 m² × 0.02 = 1.9 sabins
- Glass windows: estimate 10 m² × 0.05 = 0.5 sabins
- Wooden chairs and desks: estimate 2.0 sabins

_Total baseline absorption: 1.9 + 1.7 + 1.1 + 1.9 + 0.5 + 2.0 = 9.1 sabins_

**Step 3: Calculate Required Additional Absorption**

$$A_{required} = 77.3 - 9.1 = 68.2 \text{ m}^2 \text{ sabins}$$

**Step 4: Treatment Specification**

Option A — Distribute carpet and curtains:
- Replace 60 m² of concrete floor with commercial carpet (α = 0.40):
  - Absorption: 60 m² × 0.40 = 24 sabins
- Install heavy curtains on two 8 m walls (full height, 3.5 m):
  - Area: 2 × 8 m × 3.5 m = 56 m²
  - Absorption: 56 m² × 0.50 = 28 sabins
- Install 80 mm acoustic tile on 15 m² of ceiling (e.g., around an existing soffit):
  - Absorption: 15 m² × 0.80 = 12 sabins

_Total treatment absorption: 24 + 28 + 12 = 64 sabins_ (shortfall of 4.2 sabins; acceptable, as RT60 will be ~0.72 s)

Option B — Ceiling treatment (simpler):
- Install suspended acoustic ceiling (80 mm, NRC 0.80) over entire room:
  - Absorption: 96 m² × 0.80 = 76.8 sabins
- Add 1.5 m² of bass traps in corners (NRC 0.85):
  - Absorption: 1.5 m² × 0.85 = 1.3 sabins

_Total treatment absorption: 76.8 + 1.3 = 78.1 sabins_ (target exceeded; RT60 ≈ 0.65 s)

**Recommendation:** Option A is cost-effective for limited budgets; Option B provides uniform absorption and eliminates flutter echo between parallel concrete walls. In Philippine schools, Option A is more common due to capital constraints.

### Worked Example 2: Multipurpose Auditorium Retrofit

**Scenario:** A 25 m × 18 m × 8 m auditorium (3,600 m³) used for lectures, cultural events, and occasional concerts currently has RT60 ≈ 2.8 seconds (too long for speech). Target is 1.1 seconds to balance speech clarity and musical performance.

**Step 1: Current State Assessment**

Measure RT60 at 1000 Hz using a sound level meter and impulsive source (starting pistol, balloon burst). Recorded average: 2.8 seconds (per ISO 3382-1).

**Step 2: Required Absorption Reduction**

Current absorption (reverse Sabine):

$$A_{current} = \frac{0.161 \times 3600}{2.8} = \frac{579.6}{2.8} = 206.9 \text{ m}^2 \text{ sabins}$$

Target absorption:

$$A_{target} = \frac{0.161 \times 3600}{1.1} = \frac{579.6}{1.1} = 527.0 \text{ m}^2 \text{ sabins}$$

_Additional absorption needed: 527.0 - 206.9 = 320.1 m² sabins_

**Step 3: Treatment Strategy**

The room has a wooden stage (reflective), concrete walls, and a timber roof:

- Retrofit walls: Cover 300 m² of concrete walls with 50 mm acoustic foam (NRC 0.70):
  - Absorption: 300 m² × 0.70 = 210 sabins
- Stage treatment: Apply fabric drapes behind and above stage (150 m²) with heavy curtain material (NRC 0.55):
  - Absorption: 150 m² × 0.55 = 82.5 sabins
- Ceiling diffusers: Install 50 m² of wooden diffusing panels (NRC 0.25) to maintain some reflectivity for distributed sound:
  - Absorption: 50 m² × 0.25 = 12.5 sabins

_Total added absorption: 210 + 82.5 + 12.5 = 305 sabins_

**Step 4: Verification**

New total absorption: 206.9 + 305 = 511.9 sabins

New RT60:
$$RT60 = \frac{0.161 \times 3600}{511.9} = \frac{579.6}{511.9} = 1.13 \text{ seconds}$$

_Result: Within target (1.1 ± 0.1 s). The room now supports both speech and light musical performance._

**Implementation note:** In Philippine auditoriums, this retrofit typically requires installing absorptive panels on wooden frames, which can be removed for special events requiring longer reverberation (e.g., symphony concerts). Temporary installation is cost-effective.

<WikiMistakeCard mistake="Assuming doubled absorption doubles the RT60 reduction" correction="Absorption and RT60 are inversely proportional. Doubling absorption reduces RT60 by half. A room with RT60 = 2.0 s and total absorption A = 100 sabins will have RT60 ≈ 1.0 s if absorption increases to A = 200 sabins."/>

### Practical Design Considerations for Philippines

**Climate and Material Durability**

High humidity (average 75–85% RH in Metro Manila) accelerates degradation of foam and cellulose-based absorbers. Specify:
- Melamine foam instead of polyurethane for long-term stability.
- Moisture-resistant curtain materials (synthetic blends, treated wool).
- Acoustic panels with Class A fire rating per ASTM E84 (required in schools and public buildings per NBC).

**Cost Optimization**

Labor costs in the Philippines favor modular solutions (suspended ceilings, panel systems) over spray-applied coatings. Comparative costs (2024 Metro Manila pricing):
- Suspended acoustic ceiling: ₱1,200–₱1,800/m²
- Spray-applied polyurea: ₱1,500–₱2,500/m² (requires skilled application)
- Fabric-wrapped panels: ₱800–₱1,400/m² (aesthetically flexible, modular)
- Curtain system with hardware: ₱600–₱1,000/m²

**Compliance References**

- No prescriptive RT60 requirements in National Building Code (NBC) Section 103; acoustic design follows international standards (ISO 3382) and performance-based NBC human comfort provisions.
- Local ordinances and NBC Rule VII recommend noise control measures for schools adjacent to major roads.

<Tip>
In renovation projects, acoustic performance can be dramatically improved with a suspended ceiling retrofit. A 0.9 m air gap with 80 mm acoustic tile typically provides 15–20 dB attenuation of impact noise from floors above, per ISO 140-8.
</Tip>

### Inverse Problem: Designing for a Target RT60

Given a desired reverberation time and room volume, calculate the _total absorption coefficient_ required:

$$\bar{\alpha} = 1 - e^{\left(-\frac{0.161 \times V}{RT60 \times S}\right)}$$

(Eyring rearrangement)

Or using Sabine directly:

$$A_{total} = \frac{0.161 \times V}{RT60}$$

Then allocate absorption to material selections that fit budget and aesthetics.

**Quick Reference: Inverse Sabine Lookup**

For common classroom and office scenarios:

<WikiExactTable headers={["Volume (m³)", "Target RT60 (s)", "Required A (sabins)"]} rows={[["200 (small office)", "0.6", "54"], ["336 (typical classroom)", "0.7", "77"], ["500 (medium conference)", "0.7", "115"], ["1000 (large meeting room)", "0.8", "201"], ["3600 (auditorium, Example 2)", "1.1", "527"], ["5000 (concert hall)", "1.8", "445"]]}/>

<Example>
A 500 m³ office building conference room requires RT60 = 0.7 s. From the lookup table, A_target = 115 sabins. If the room has concrete walls and ceiling (baseline ≈ 10 sabins) and carpet covering 200 m² (α = 0.40, contributing 80 sabins), then 115 - 80 - 10 = 25 sabins of additional treatment is required. Install 50 m² of 50 mm acoustic foam (NRC 0.50) to provide approximately 25 sabins, or use wall-mounted fabric panels in a modular arrangement.
</Example>

### Key Equations Summary

| Equation | Use Case |
|----------|----------|
| RT60 = 0.161V/A | Sabine: initial design, low-to-moderate absorption |
| RT60 = 0.161V/[−S·ln(1−ā)] | Eyring: high-absorption rooms, precision retrofits |
| A = Σ(Si × αi) | Calculate total absorption from material schedules |
| ā = (α₂₅₀ + α₅₀₀ + α₁₀₀₀ + α₂₀₀₀) / 4 | NRC (Noise Reduction Coefficient) |
| A_required = (0.161 × V / RT60_target) − A_existing | Design gap analysis |

---

**References and Standards**

- Beranek, L. L. (1996). _Concert Hall Acoustics_. Acoustical Society of America.
- ISO 3382-1:2009. _Acoustics — Measurement of Room Acoustic Parameters._
- ASTM C423-23. _Standard Test Method for Sound Absorption and Sound Absorption Coefficients._
- National Building Code (PD 1096, 2004 Revised IRR), Section 103.
- Sabine, W. C. (1900). "Collected Papers on Acoustics." _Harvard University Press_.
- Knudsen, V. O., & Harris, C. M. (1978). _Acoustical Designing in Architecture_. Acoustical Society of America.

