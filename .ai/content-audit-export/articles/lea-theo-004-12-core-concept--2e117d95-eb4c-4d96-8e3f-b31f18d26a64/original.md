## What You Need to Know for the LEA

<Callout>
Thermal comfort in Philippine buildings is measured against **ASHRAE 55** standards, which include an **adaptive comfort model** allowing higher interior setpoints (26–29°C) when natural ventilation and occupant control are available. This model contradicts the fixed 23–25°C setpoint of mechanical buildings and reduces cooling energy by 40–60%. Fanger's **PMV-PPD model** quantifies thermal sensation mathematically; understanding both models enables design that achieves occupant comfort while aligning with BERDE certification and Philippine Green Building Code mandates.
</Callout>

## Core Concept

### Thermal Comfort Definition and Variables

**Thermal comfort** is defined as "the condition of mind that expresses satisfaction with the thermal environment." It is subjective; identical conditions produce comfort for some occupants and discomfort for others depending on adaptation, expectation, acclimatization, and control.

<Tip>
**Memory Aid: "CRAMEC"**—Clothing, Radiant temperature, Activity (metabolic), Mean radiant, Environmental conditions, Control. These six variables determine comfort; changing any one impacts comfort sensation. Natural ventilation excels by enabling occupant control and adapting to local conditions.
</Tip>

Six primary variables determine thermal sensation:
1. **Dry-bulb temperature** (°C): Indoor air temperature
2. **Relative humidity** (%): Moisture content of air; affects evaporative cooling potential
3. **Mean radiant temperature** (°C): Average temperature of surrounding surfaces (walls, windows, floor); differs from air temperature when solar-heated or cold
4. **Air velocity** (m/s): Movement of air across skin; enhances evaporative cooling and thermal sensation change
5. **Metabolic rate** (met): Energy expenditure from physical activity; 1.0 met = seated rest
6. **Clothing insulation** (clo): Thermal resistance of garments; 1.0 clo = business suit; 0.5 clo = tropical light clothing

In the **Philippine context**, typical design conditions:
- Dry-bulb: 33–36°C exterior (Coronas Type I dry season peak); 28–32°C with passive cooling
- Relative humidity: 60–75% exterior; 55–70% interior with ventilation
- Mean radiant temperature: 35–42°C if sun-exposed; 28–32°C if shaded
- Air velocity: 0.5–1.5 m/s natural ventilation; 0.05–0.2 m/s mechanical minimum
- Metabolic rate: 1.0–1.3 met typical office/school occupancy
- Clothing: 0.3–0.5 clo tropical attire (short sleeves, light fabric)

<Note>
Occupants in naturally ventilated buildings adapt clothing and behavior. In mechanical air-conditioned buildings, occupants wear business formal (1.0 clo); in naturally ventilated tropical buildings, light tropical clothing (0.3–0.4 clo) is standard. This behavioral adaptation reduces metabolic heat load by 30–40%, enabling comfort at higher temperatures (27–29°C vs. 24°C).
</Note>

### Fanger's PMV-PPD Model

**PMV (Predicted Mean Vote)** is a thermal sensation index developed by P.O. Fanger (1970). It ranges from −3 (cold) to +3 (hot), with 0 representing thermal neutrality.

**PMV Calculation**:
PMV = (0.303e^(−0.036M) + 0.028) × L

Where:
- M = metabolic rate (W/m²; convert from met: 1 met = 58.2 W/m²)
- L = thermal load (W/m²)—complex function of temperature, humidity, air velocity, clothing, radiant temperature

**L** is computed as:
L = (M − W) − (C + R + E_res + E_skin)

Where:
- M = metabolic heat generation
- W = external work (typically 0)
- C = convective heat exchange (air movement and temperature)
- R = radiative heat exchange (mean radiant temperature)
- E_res = latent heat in respiration
- E_skin = evaporative cooling at skin

**Example: Philippine Office Scenario (Manila, Apr, 2:00 PM)**:
- Dry-bulb: 35°C
- Mean radiant: 38°C (sun-exposed window area)
- Relative humidity: 65%
- Air velocity: 0.3 m/s (weak mechanical ventilation)
- Metabolic rate: 1.2 met (desk work + minimal movement)
- Clothing: 0.4 clo (lightweight tropical shirt)

Calculation (simplified): PMV ≈ +1.8 (warm discomfort)

**PPD (Predicted Percentage of Dissatisfied)** is the percentage of occupants predicted to be thermally dissatisfied at a given PMV:

PPD = 100 − 95 × e^(−0.03353×PMV^4 − 0.2179×PMV^2)

- PMV = 0: PPD = 5% (near-neutral; inherent biological variation)
- PMV = +1.8: PPD ≈ 50% (half of occupants uncomfortable)
- PMV = +3.0: PPD ≈ 98% (nearly universal discomfort)

**ASHRAE 55 Acceptable Range**: PMV between −0.5 and +0.5 (corresponding to PPD < 10%) is considered acceptable for sedentary activity in heated or cooled buildings.

<Warn>
**Critical Distinction**: The fixed mechanical building standard (PMV ±0.5, requiring 24–25°C) does NOT apply to naturally ventilated buildings with occupant control. ASHRAE 55 allows PMV ±1.0 to ±1.5 in naturally ventilated spaces. Applying fixed-setpoint logic to naturally ventilated buildings over-cools, wasting energy. Understand which standard applies to your design context.
</Warn>

### The Adaptive Comfort Model

The **adaptive model** recognizes that thermal comfort is not fixed but **adapts** to local conditions through:

1. **Physiological adaptation**: Acclimatization; occupants in warm climates develop lower sweat thresholds and altered heart rate responses
2. **Psychological adaptation**: Expectation; occupants in naturally ventilated buildings expect and tolerate variability that would be unacceptable in mechanical systems
3. **Behavioral adaptation**: Personal control; ability to open windows, adjust clothing, or relocate modifies comfort tolerance

**Adaptive Comfort Equation (ASHRAE 55)**:
T_comfort = 13.5 + 0.31 × T_mean_out

Where:
- T_comfort = comfortable indoor temperature (°C)
- T_mean_out = mean outdoor temperature (°C); calculated as rolling 7–30 day average

**Application to Philippine Coronas Types**:

**Coronas Type I (Dry Season Peak, Apr–May)**:
- T_mean_out = 34°C (7-day average)
- T_comfort = 13.5 + 0.31 × 34 = **24.0°C** (mechanical systems)
- **Adaptive model adjustment**: T_comfort_adapt = 24.0 + 3.5 = **27.5°C** (naturally ventilated)
- Implication: If buildings achieve natural ventilation with occupant control, 27.5°C is acceptable. Cooling load reduction ~35% vs. selead mechanical buildings.

**Coronas Type II (Year-Round Wet, No Dry Season)**:
- T_mean_out = 28–32°C (perpetually), (rolling average)
- T_comfort = 13.5 + 0.31 × 30 = **22.8°C** (mechanical)
- **Adaptive adjustment**: T_comfort_adapt = **26.3°C** (naturally ventilated)
- Implication: Year-round availability of cool exterior air limits adaptive potential; mechanical systems become more necessary, but adaptive margin still saves 25–30% cooling energy.

**Coronas Type IV (Distributed Rainfall)**:
- T_mean_out = 27–31°C (year-round, moderate)
- T_comfort_adapt = **26.0°C** achievable (naturally ventilated)
- Optimal for mixed-mode design (mechanical backup + natural primary)

### Relative Humidity and Tropical Challenges

The **Philippine tropical climate** creates persistent humidity (60–85% exterior; 55–75% interior). High humidity reduces evaporative cooling effectiveness and increases heat stress perception.

**Operative Temperature (T_op)**: A combined metric accounting for air temperature and radiant effects:
T_op = (h_c × T_air + h_r × T_mean_rad) / (h_c + h_r)

Where h_c and h_r are convective and radiant heat transfer coefficients.

In tropical buildings:
- With air movement (1.0 m/s): h_c ≈ 5 W/m²K; T_op ≈ 0.6 × T_air + 0.4 × T_mean_rad
- This means air movement reduces mean radiant temperature impact by 40%; critical for solar-exposed facades

**Humidity Impact on Evaporative Cooling**:
At relative humidity 75%, evaporative cooling potential is **reduced by ~50%** compared to 50% RH. This explains why Coronas Type I dry-season (Apr–May, RH 40–50%) allows better passive cooling than Type II monsoon season (Dec–Feb, RH 80–90%).

### Indoor Air Quality and Thermal Comfort Interaction

The **Philippine Green Building Code** and **ASHRAE 55** both specify minimum outdoor air rates:

- **ASHRAE 62.1**: 7.5 L/s per person (or 0.3 L/s per m² floor) for office buildings
- **BERDE Standard**: ≥6 air changes per hour (ACH) in naturally ventilated buildings; ≥2 ACH for mechanically ventilated (with ≥80% outdoor air)

**Carbon Dioxide (CO₂) as Comfort Indicator**:
- &lt;600 ppm: Good indoor air quality; no cognitive impairment
- 600–1,000 ppm: Acceptable; minor cognitive effects
- >1,000 ppm: Poor; decision-making ability declines 15–50%

In naturally ventilated buildings achieving 8+ ACH, CO₂ levels remain &lt;500 ppm without active fans. This supports dual benefit: thermal comfort via air movement + air quality via constant outdoor air renewal.

### ASHRAE 55 Compliance Framework

**Category I (Most Stringent)**: PMV between −0.5 and +0.5 (±2K heating/cooling tolerance)
- Applicable to hospital patient rooms, elderly care facilities
- Requires mechanical systems; natural ventilation cannot achieve category I in tropical climates

**Category II (Standard)**: PMV between −1.0 and +1.0 (±3K tolerance)
- Applicable to offices, schools, residences
- Achievable with mechanical system (setpoint 24–25°C) or naturally ventilated building with adaptive model

**Category III (Relaxed)**: PMV between −1.5 and +1.5 (±4K tolerance)
- Applicable to temporary or part-time occupancy (parking garages, warehouses, shops)
- Easily achieved with natural ventilation in tropical climates

**Philippine Application**:
- Public schools (frequent occupancy variation): Category III acceptable; natural ventilation sufficient
- Hospitals (continuous occupancy, critical function): Category I required; mechanical systems mandatory
- Office buildings (flexible occupancy, adaptive workforces): Category II achievable via mixed-mode (natural primary + mechanical backup)

### Thermal Comfort and Energy Efficiency Trade-off

Achieving ASHRAE 55 Category II in a selead mechanical building (T = 24°C, RH 50–55%) requires:
- Cooling capacity: 80–120 W/m² floor area (tropical climate peak)
- Annual cooling energy: 25–35 kWh/m²/year
- Operational cost: ~3,000–5,000 PHP/m²/year (at 8 PHP/kWh)

The **same building, naturally ventilated** with adaptive comfort (T = 27°C, RH 60–70%, ≥6 ACH):
- Cooling capacity: 0 W/m² (no mechanical system; occasional fans for air circulation)
- Annual cooling energy: 2–5 kWh/m²/year (fans only; no refrigeration)
- Operational cost: ~200–500 PHP/m²/year

**Savings**: 80–90% energy reduction; 2,500–4,500 PHP/m² annual operational cost savings. Over a 20-year building lifespan, this exceeds 50 million PHP for a 10,000 m² building—sufficient to fund premium natural ventilation design (louvers, thermal mass, advanced windows).

### BERDE Certification and Thermal Comfort Integration

BERDE awards points for thermal comfort strategies:

- **Passive Design**: ≥3 points for buildings achieving natural ventilation ≥6 ACH, no mechanical cooling required
- **Thermal Comfort**: ≥2 points for ASHRAE 55 adaptive model compliance with occupant survey validation
- **Daylighting & Views**: ≥3 points for daylight autonomy ≥55%, connected to occupant psychological comfort
- **Indoor Air Quality**: ≥3 points for CO₂ monitoring, ≥2.5 ACH outdoor air, no synthetic odor/formaldehyde

A naturally ventilated building in a Coronas Type I climate with effective daylighting can accumulate **≥12 points in the Comfort & Well-being category**, translating to faster BERDE certification and marketing advantage.

## Key Facts and Testable Items

<WikiExamTable headers={["Thermal Variable", "Philippine Tropical Context", "ASHRAE 55 Requirement", "BERDE Application"]} rows={[["**Dry-Bulb Temperature**", "33–36°C exterior (Type I peak); 27–30°C interior achievable", "23–25°C (mechanical) or 26–29°C (adaptive natural)", "Passive design ≥3 points if ≤27°C without fans"], ["**Relative Humidity**", "60–85% exterior; 55–75% interior typical", "30–65% acceptable; >70% discomfort", "Dehumidification credit if RH < 60%"], ["**Mean Radiant Temperature**", "35–42°C (sun-exposed surfaces); 28–32°C (shaded)", "Within ±5K of air temperature", "Solar shading credit; operative temperature reduction"], ["**Air Velocity**", "0.5–1.5 m/s (natural ventilation); 0.1 m/s (mechanical minimum)", "0.1–0.5 m/s acceptable sedentary", "Natural ventilation ≥6 ACH = ±1.5 m/s fluctuation"], ["**Metabolic Rate**", "1.0–1.3 met (office/school); 1.5–2.0 met (active retail)", "1.0 met assumed (seated)", "Adjusted for occupancy type; reduced load in low-activity zones"], ["**Clothing Insulation**", "0.3–0.5 clo (tropical); 0.7–1.0 clo (mechanical-cooled)", "0.5–0.7 clo assumed", "Behavioral adaptation; occupants wear lighter clothing in naturally ventilated spaces"], ["**PMV Index**", "+1.5 to +2.0 (mechanical building, 24°C) vs. +0.3 (naturally ventilated, 27°C, 1.0 m/s)", "−0.5 to +0.5 (Category I); −1.0 to +1.0 (Category II)", "Thermal comfort credit if PMV remains Category II"], ["**Adaptive Comfort T_comfort**", "27.5°C (Type I, 34°C mean outdoor) vs. 24.0°C (fixed mechanical)", "Linear relationship: T_comfort = 13.5 + 0.31 × T_mean_out", "Mixed-mode design enables 3–4K temperature flexibility"], ["**CO₂ Levels**", "&lt;500 ppm (naturally ventilated ≥8 ACH) vs. 700–1,000 ppm (selead offices)", "&lt;1,000 ppm acceptable; &lt;600 ppm optimal", "Air quality credit if CO₂ < 600 ppm without active exhaust"], ["**Thermal Discomfort PPD**", "PPD ≈ 5–10% (adaptive natural, 27°C) vs. PPD ≈ 20–25% (selead mechanical, 24°C in hot climates)", "&lt;10% (Category I) to &lt;30% (Category III)", "Thermal comfort validation via occupant survey; &lt;20% dissatisfaction = credit"]]} />

## How It's Tested on the LEA


<ExamTip>1. **PMV Calculation**: A Manila office building (2:00 PM, Apr, dry season) has: T_air = 34°C, T_mean_rad = 36°C, RH = 60%, air velocity = 0.2 m/s, met = 1.2, clo = 0.4. Calculate PMV using simplified Fanger method. Is this acceptable under ASHRAE 55 Category II? Propose design solution.</ExamTip>


<ExamTip>2. **Adaptive Comfort Application**: For a Coronas Type II school (year-round wet climate, T_mean_out rolling = 29°C), calculate T_comfort using ASHRAE adaptive model. Propose natural ventilation design to achieve this temperature. Compare cooling energy vs. fully mechanical system (24°C setpoint).</ExamTip>


<ExamTip>3. **Thermal Comfort Scenario Analysis**: Redesign a selead office building (currently PMV = +1.8) to meet Category II (PMV between −1.0 and +1.0). Specify: (a) window additions for shading, (b) ventilation strategy, (c) interior temperature setpoint, (d) clothing adaptation. Estimate energy reduction %.</ExamTip>


<ExamTip>4. **BERDE Thermal Credit Design**: For a residential project aiming for BERDE certification, design the envelope and ventilation system to achieve: (a) ≥6 ACH natural ventilation, (b) operative temperature ≤27°C 95% of occupancy hours, (c) CO₂ < 600 ppm. Show calculation of cooling load reduction vs. mechanical baseline.</ExamTip>


<ExamTip>5. **Humidity and Comfort Integration**: A Coronas Type II climate has RH 75% exterior. Natural ventilation alone cannot reduce interior humidity below 65%. Design a hybrid system combining natural ventilation (primary), desiccant dehumidification (supplementary), and thermal mass. Specify control strategy and annual energy impact.</ExamTip>


## Common Mistakes

<WikiMistakeCard mistake="Applying Fixed-Setpoint ASHRAE 55 to Tropical Naturally Ventilated Buildings" correction="Assuming 24°C is required everywhere." context="Adaptive model allows 26–29°C in naturally ventilated spaces; this mistake over-specifies cooling and increases costs." />

<WikiMistakeCard mistake="Ignoring Mean Radiant Temperature" correction="Calculating comfort based on dry-bulb temperature alone ignores solar-exposed windows and surfaces." context="A window at 40°C in shade-free space can elevate PMV by 0.5–1.0 despite 27°C air temperature." />

<WikiMistakeList mistakes={["Underestimating Humidity Impact on Evaporative Cooling. Monsoon season (Type II, RH 80%) reduces evaporative potential by 60–70% vs. dry season. Designs assuming uniform ventilation effectiveness across seasons fail during wet months.", "Neglecting Behavioral Adaptation. Assuming occupants wear business attire (1.0 clo) in tropical naturally ventilated buildings. Reality: 0.3–0.4 clo in tropical light clothing reduces metabolic heat load by 30–40%, supporting higher comfort temperatures.", "Over-Reliance on Air Movement for Comfort. Using high-velocity fans (>2.0 m/s) to achieve comfort at 29°C. This creates draft discomfort and psychological malaise; better to design for 27–28°C with moderate ventilation (0.5–1.0 m/s).", "Ignoring CO₂ Impact on Cognitive Performance. Meeting ASHRAE 62.1 outdoor air rates (7.5 L/s per person) but allowing CO₂ to exceed 1,000 ppm in poorly ventilated zones. Decision-making ability declines; this affects productivity despite thermal comfort."]} />


## Key Terms

**Thermal Comfort** — Psychological condition expressing satisfaction with thermal environment; subjective and dependent on physiological, psychological, and behavioral adaptation.

**PMV (Predicted Mean Vote)** — Numerical index of thermal sensation (−3 to +3); calculated from metabolic rate, clothing, air temperature, humidity, air velocity, and radiant temperature.

**PPD (Predicted Percentage Dissatisfied)** — Percentage of occupants predicted to be thermally dissatisfied at given PMV; ranges 5% (PMV = 0) to >95% (PMV = ±3).

**Operative Temperature (T_op)** — Combined metric accounting for air temperature and radiant effects; used when mean radiant temperature differs significantly from air temperature.

**Adaptive Comfort Model** — ASHRAE 55 framework recognizing that thermal comfort tolerance increases with outdoor temperature in naturally ventilated buildings; allows higher indoor setpoints.

**Mean Radiant Temperature (T_mean_rad)** — Average temperature of surrounding surfaces (walls, windows, floor); affects thermal sensation independently of air temperature.

**Metabolic Rate** — Heat production from physical activity; 1.0 met = seated rest (58.2 W/m²); increases with activity level.

**Clothing Insulation (Clo)** — Thermal resistance of garments; 1.0 clo = business suit; tropical light clothing = 0.3–0.5 clo.

**Relative Humidity (RH)** — Moisture content of air as percentage of saturation; affects evaporative cooling effectiveness and thermal sensation.

**Category I/II/III Compliance** — ASHRAE 55 classification levels; Category I most stringent (PMV ±0.5), Category III most relaxed (PMV ±1.5).

**Mixed-Mode Design** — Building system combining natural ventilation (primary) and mechanical backup (seasonal or occupancy-triggered); achieves thermal comfort with 40–60% energy reduction vs. fully mechanical.

**BERDE Thermal Comfort Credit** — Points awarded for passive design, ASHRAE 55 compliance, daylighting, and indoor air quality; pathway to green certification in tropical contexts.