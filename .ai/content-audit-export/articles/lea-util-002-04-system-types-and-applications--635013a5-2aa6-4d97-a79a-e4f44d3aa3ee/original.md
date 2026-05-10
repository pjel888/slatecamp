

## Board Exam Quick Check

Before memorizing details from this topic, state the exam task in one sentence: what is being classified, measured, approved, or restricted? Then identify the controlling rule named by the item and avoid importing requirements from a different law, table, or occupancy condition.

**Common mistake:** treating a familiar keyword in **Lea Util 002 04 System Types And Applications** as enough to answer. In LEA-style questions, first anchor the question to the exact code, scope, and condition being tested, then choose the option that follows that rule.

**Retrieval prompt:** What fact in the question tells you which rule set applies, and what option would become wrong if the scope changed?
## What You Need to Know for the LEA

## Learning Goal

Distinguish HVAC system types (split-type, window-type, packaged units, VRF/VRV, chilled water, central plant) by their configuration, capacity range, energy efficiency, and appropriateness for different Philippine building typologies and budgets.
## System Types and Applications

### Split-Type Air Conditioning

[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-util-002-04-system-types-and-applica", type="image", caption="HVAC System Types Comparison — Split, VRF, Chilled Water, Packaged", description="Four-panel diagram comparing HVAC configurations: Panel 1 — Split-type (indoor unit + outdoor condenser, 0.75-5 TR); Panel 2 — VRF/VRV (single outdoor unit serving multiple indoor zones, 4-80 TR, individual zone control); Panel 3 — Chilled water (central chiller, fan-coil units, cooling tower, ≥50 TR); Panel 4 — Packaged rooftop unit (2-15 TR, single enclosure). Capacity ranges and typical applications labeled.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]


Split systems separate indoor and outdoor components. Indoor units mount on walls, ceilings, or floors; outdoor condenser units sit outside. They operate at 220V/60Hz in the Philippine electrical grid.

_Capacity range:_ 0.75 TR to 5 TR per indoor unit (source: ASHRAE Equipment Selection Guidelines)
_Typical COP:_ 2.8–3.5 (source: Energy Efficiency Labeling Scheme, Philippine Energy Efficiency and Conservation Act)

**Advantages:**
- Lowest upfront cost among ducted systems
- Flexible indoor unit placement
- Simple installation in existing buildings
- Individual room temperature control

**Disadvantages:**
- Multiple outdoor units in large buildings (aesthetic and space impact)
- Higher refrigerant charge per ton (compared to chilled water systems)
- Limited zoning for multi-room applications

**Best for:** Residential, small offices, retail shops, low-rise buildings (≤3 stories)

[SLATECAMP_UI_BLOCK:ui_0002 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: A 200 m² residential unit in Metro Manila requires cooling for living, bedrooms, and kitchen. Cooling load is estimated at 400 BTU/hr per m² (residential lower end, source: ASHRAE 90.1). Total load: 200 m² × 400 BTU/hr per m² = 80,000 BTU/hr. Convert to TR: 80,000 ÷ 12,000 = 6.67 TR. Specification: Two 3.5 TR split units (7 TR combined capacity) with load diversity allowing simultaneous operation. Unit selection: 3.5 TR ≈ 41,600 BTU/hr per unit (conversion: 3.5 × 12,000 = 42,000 BTU/hr), matchin
[/SLATECAMP_UI_BLOCK]

### Variable Refrigerant Flow (VRF/VRV) Systems

VRF systems vary refrigerant flow to multiple indoor units from a single outdoor condenser. Systems scale from 4 TR to 80+ TR outdoor capacity with individual zone control.

_Seasonal Energy Efficiency Ratio (SEER):_ 13–18 SEER (source: Philippine Energy Efficiency Standards, EER ≈ SEER ÷ 3.41)
_COP range:_ 3.2–4.1 (source: ASHRAE Standards database)

**Advantages:**
- High part-load efficiency (excellent for tropical intermittent cooling)
- Single outdoor unit reduces visual clutter and installation complexity
- Individual zone control and humidity management
- Simultaneous heating/cooling in different zones (limited Philippine application but valuable for data centers with warm back-end areas)

**Disadvantages:**
- High upfront capital cost (30–50% premium over split systems)
- Requires specialized technician training for commissioning and repair
- Refrigerant line length limitations (up to 150 m per ASHRAE 15 standards for R-410A systems in tropical zones)

**Best for:** Medium-rise buildings (4–12 stories), office complexes, hotels, hospitals, mixed-use developments

[SLATECAMP_UI_BLOCK:ui_0003 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: A 5-story office building in Makati, 4,000 m² (800 m² per floor), requires 4,000 × 500 BTU/hr per m² = 2,000,000 BTU/hr total cooling load (commercial office, tropical, source: ASHRAE 90.1 Annex A). Convert: 2,000,000 ÷ 12,000 = 167 TR. Specify: Two 80 TR outdoor VRF units (160 TR combined) with load diversity (~95% diversity factor for offices, source: PD 1058). Indoor units: 20 units at 8 TR each, distributed across floors for zone control. VRF advantage: Part-load efficiency at 50% capacity =
[/SLATECAMP_UI_BLOCK]

### Chilled Water Systems

Central chiller cools water circulated to fan-coil units throughout the building. Typically applied at ≥50 TR total cooling demand.

_Chiller types:_ Centrifugal (20–1000+ TR, COP 4.0–5.5), Screw (10–200 TR, COP 3.5–4.5), Reciprocating (5–100 TR, COP 3.0–4.0) (source: ASHRAE Equipment Selection Guide)
_Condenser approach:_ Air-cooled condenser 5–8 K above ambient; water-cooled condenser 3–5 K (source: ASHRAE Design Standards)

**Advantages:**
- Centralized mechanical room simplifies maintenance
- Excellent scalability for campus or large complex buildings
- Flexible to accommodate future expansions
- High efficiency at full-load operation

**Disadvantages:**
- Highest capital cost (equipment, piping, controls, structural support)
- Requires dedicated mechanical room, pump room, cooling tower space
- Commissioning complexity and longer project timeline
- Condensate and pipe leak risks in tropical high-humidity environments

**Best for:** Large buildings (≥300,000 m²), multi-building complexes, data centers, hospitals with critical cooling zones

[SLATECAMP_UI_BLOCK:ui_0004 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: Philippine tropical humidity (70–90% RH year-round, source: Philippine Atmospheric Geophysical and Astronomical Services Administration, PAGASA) demands extra attention to condensate drainage and dehumidification in chilled water systems. Design condensate lines with continuous slope ≥1:100 and secondary drain pans under all coils.
[/SLATECAMP_UI_BLOCK]

### Package (Rooftop) Units

Single enclosure containing compressor, condenser, and evaporator. Common capacities: 2–15 TR. Operates as plug-and-play equipment mounted on roofs or ground.

_Typical EER:_ 8–11 EER (source: Energy Efficiency Labeling Scheme)
_COP:_ 2.8–3.2

**Advantages:**
- Simplest installation (single outdoor/ductwork connection)
- No indoor mechanical space required
- Factory-tested and pre-charged

**Disadvantages:**
- Exposed to typhoons, salt spray (coastal areas), and sun degradation (shorter equipment life: 8–10 years vs. 12–15 years for sheltered split systems)
- Moderate efficiency (lower COP than VRF or chiller at part load)
- Noise transmission to occupied spaces below

**Best for:** Small commercial buildings (≤300 m²), restaurants, small clinics, buildings with limited indoor space

### Window-Type and Mini-Split Units

Window units mount through walls; mini-splits are compact versions of split systems for tight spaces.

_Capacity:_ 0.5–2 TR per unit
_COP:_ 2.5–3.0

**Disadvantages:**
- Limited to small spaces
- Installation creates thermal bridging; seasonal removal needed in cooler months (rare in Philippines)

**Best for:** Small rooms, temporary spaces, supplementary cooling for hard-to-reach zones

## Cooling Load Estimation and Selection Criteria

### Load Calculation Methods

[SLATECAMP_UI_BLOCK:ui_0005 component="WikiCalloutBox" status="preserved"]
Extracted summary:
- Props: title="Cooling Load Estimation Formula", variant="info"
- Text: _Q_ = _U_ × _A_ × Δ_T_ + (sensible load from occupants, equipment, infiltration, solar gain) Where _Q_ = cooling load (BTU/hr), _U_ = overall heat transfer coefficient (BTU/hr·ft²·°F), _A_ = area (ft²), Δ_T_ = temperature difference (°F) For quick estimate in commercial buildings (tropical): _Q_ (BTU/hr) ≈ Floor Area (m²) × 500 BTU/hr per m² (source: ASHRAE 90.1 Annex A, adjusted for Philippine cooling-dominant climate) For residential: _Q_ ≈ Floor Area × 400 BTU/hr per m² (source: PD 1058, Sect
[/SLATECAMP_UI_BLOCK]

**Design Conditions (Philippine Standard, source: PD 1058, Clause 5.1):**
- Outdoor dry-bulb: 32–34°C (90–93°F) year-round in lowlands
- Indoor design: 24–26°C (75–79°F) for comfort
- Relative humidity: 50–60% RH indoor target (source: ASHRAE 55 Thermal Comfort Standard)

[SLATECAMP_UI_BLOCK:ui_0006 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: Bangko Sentral ng Pilipinas office annex in Fort Bonifacio, 3,000 m², ground floor with high solar exposure. Load breakdown (source: ASHRAE fundamentals handbook): - Envelope (walls, roof, windows): 150 kW sensible - Internal gains (occupants at 100 W/person × 300 = 30 kW, equipment/lighting at 15 W/m² × 3,000 m² = 45 kW): 75 kW sensible - Ventilation (ASHRAE 62.1: 15 CFM/person × 300 occupants × 60 min/hr = 270,000 CFM = 450 m³/min, moisture load per tropical conditions): 35 kW sensible + laten
[/SLATECAMP_UI_BLOCK]

### System Selection Decision Matrix

[SLATECAMP_UI_BLOCK:ui_0007 component="WikiExamTable" status="preserved"]
Extracted summary:
- Props: headers="{[\"Building Type\", \"Typical Area (m²)\", \"Recommended System Type\", \"Capacity Range\", \"Estimated First Cost per TR (PHP)\", \"Typical COP / Payback\"]}", rows="{[[\"Small Residential (1–2-room)\", \"50–150\", \"Split Type (0.75–1.5 TR)\", \"0.75–1.5 TR\", \"₱40,000–50,000\", \"3.0 / N/A (no payback expected)\"], [\"Medium Residential (3–4-room)\", \"150–300\", \"Split Type (2–3 TR dual/multi)\", \"2–3 TR\", \"₱35,000–45,000\", \"3.2 / N/A\"], [\"Retail / Small Office\", \"300–1,000\", \"Split Type (4–6 TR multi-unit) or VRF entry-level\", \"4–10 TR\", \"₱32,000–38,000 (split) / ₱48,000–55,000 (VRF)\", \"3.2 (split) / 3.8 (VRF) / 6–8 years (VRF)\"], [\"Medium Office / Hotel\", \"1,000–5,000\", \"VRF or Chilled Water\", \"25–80 TR\", \"₱45,000–52,000 (VRF) / ₱50,000–62,000 (chiller)\", \"3.8 (VRF) / 4.5 (chiller) / 5–7 years\"], [\"Large Office / Hospital / Complex\", \"≥5,000\", \"Chilled Water (centrifugal)\", \"≥100 TR\", \"₱55,000–70,000\", \"4.5–5.5 / 4–6 years\"], [\"Data Center\", \"Varies (focused load)\", \"Chilled Water (precision) or VRF (small)\", \"Variable\", \"₱80,000–120,000 (precision critical)\", \"4.5+ (efficiency required)\"]] }"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

_First cost estimates (source: Philippine construction cost indices, 2024–2025, market survey from HVAC contractors in NCR and Visayas)_
_Payback calculated assuming electricity cost of ₱12–15 per kWh and 80% annual operating hours (source: Meralco tariff average)_

## Refrigerant Standards and Phaseout Timeline

[SLATECAMP_UI_BLOCK:ui_0008 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-util-002-04-system-types-and-applica", type="image", caption="Refrigeration Cycle Diagram — Compressor, Condenser, Expansion, Evaporator", description="Standard vapor-compression refrigeration cycle showing: compressor (increases refrigerant pressure/temperature), condenser (rejects heat), expansion valve (drops pressure), evaporator (absorbs heat). R-32 (GWP=675) and R-410A (GWP=2088) phaseout timelines per Kigali Amendment annotated. COP formula and typical values (2.8-4.1) shown for each HVAC system type.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

### Current Refrigerants in the Philippines

**R-410A (Blend, GWP = 2,088, source: UNEP Ozone Secretariat):**
- Phaseout deadline: 2030 in high-income countries; 2040 in developing countries per Kigali Amendment (Philippines classified as Article 5 country)
- Dominant in existing systems (2010–2025)
- 220V/60Hz applications: Requires synthetic POE (polyol ester) oil; not compatible with mineral oil from R-22

**R-32 (Pure HFC, GWP = 675, source: UNEP Ozone Secretariat, latest assessment 2024):**
- Emerging standard for new systems (2020 onwards)
- ~10–15% higher efficiency than R-410A (source: Daikin technical bulletin, R-32 efficiency comparison)
- Flammable (A2L classification per ISO 817); requires enhanced safety protocols but addresses GWP concerns
- Growing availability in Philippines; recommended for new installations

**R-22 (HCFC, being phased out, GWP = 1,810):**
- Banned in manufacture and import since 2015 in developed countries; Philippines phase-out: 2040 (source: Ozone Layer Protection Act, RA 8749)
- Existing systems continue operating; servicing with recovered/recycled refrigerant permitted
- Do not use in new systems

[SLATECAMP_UI_BLOCK:ui_0009 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: R-32 flammability requires: (1) installer certification per ISO 5149; (2) charge size limits (≤2 kg for 220V residential units without secondary containment); (3) proper location away from ignition sources per PD 1058. Do not retrofit R-410A systems with R-32 without manufacturer approval and system redesign.
[/SLATECAMP_UI_BLOCK]

### Energy Efficiency Ratings

[SLATECAMP_UI_BLOCK:ui_0010 component="WikiCalloutBox" status="preserved"]
Extracted summary:
- Props: title="COP and EER Conversion", variant="info"
- Text: _Coefficient of Performance (COP)_ = Cooling output (kW) ÷ Input power (kW) _Energy Efficiency Ratio (EER)_ = Cooling output (BTU/hr) ÷ Input power (watts) Conversion: _COP_ = _EER_ ÷ 3.412 (source: ASHRAE Fundamentals Handbook, SI units standard) Example: 3.5 COP = 3.5 × 3.412 ≈ 11.9 EER
[/SLATECAMP_UI_BLOCK]

**Philippine Energy Efficiency Standards (source: Energy Efficiency Labeling Scheme, Republic Act 11285 implementing rules, 2023):**
- Minimum EER: 9.5 EER for split systems ≤24,000 BTU/hr (≈2 TR)
- Minimum SEER: 13 SEER for VRF systems (seasonal, accounting for part-load operation)
- equivalent COP targets: 2.8 COP (split) / 3.8 COP (VRF) to meet minimum standards

[SLATECAMP_UI_BLOCK:ui_0011 component="Example" status="preserved"]
Extracted summary:
- Props: (none)
- Text: A 5 TR split unit operating 8 hours/day, 365 days/year at design load (25°C outdoor, 28°C indoor design): Annual cooling output = 5 TR × 12,000 BTU/hr × 8 hr/day × 365 days = 175.2 million BTU/year = 51.4 MWh/year Input power at 3.2 COP = 51.4 MWh ÷ 3.2 = 16.1 MWh/year electrical consumption Annual cost (₱12.50/kWh average Meralco): 16.1 MWh × ₱12,500/MWh = ₱201,250/year (verification: 5 TR × 3.517 kW = 17.585 kW input at full load × 8 × 365 = 51.3 MWh, consistent with COP calculation) Savings u
[/SLATECAMP_UI_BLOCK]

## Tropical Climate Considerations

### High Humidity and Condensate Management

Philippine climate: 70–90% RH year-round, 32–34°C daily highs (source: PAGASA climate classification).

**Design requirements (source: PD 1058, Section 6.3):**
1. Indoor coil approach temperature ≥2°C above dew point to prevent coil freeze at part load
2. Condensate drain slope ≥1:100 (minimum 1 cm drop per meter) with P-trap and secondary pan
3. Dehumidification priority: Select units with separate sensible/latent capacity ratings to manage moisture even at setpoint

**Latent load in tropical regions:** ~30–40% of total cooling load (vs. 20% in temperate climates). Account in system sizing.

[SLATECAMP_UI_BLOCK:ui_0012 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: In high-humidity zones (provinces near coasts, high-altitude areas with localized moisture), specify drain pan beneath all indoor units with 25 mm depth minimum and outlet to condensate collection. Failure risk: Water damage, mold growth, unit freeze-off in 6–12 months without proper drainage.
[/SLATECAMP_UI_BLOCK]

### Outdoor Unit Placement and Typhoon Resilience

Outdoor units must withstand wind speeds ≥200 km/h (Category 5 typhoon, source: Philippine Atmospheric Geophysical and Astronomical Services Administration, PAG-ASA Typhoon Classification).

**Specifications:**
- Mount on vibration isolators rated for 1.5× equipment weight minimum
- Ensure structural bracing to building frame, not solely on roof membrane
- Keep minimum 1 meter clearance from edges and obstacles (air intake/discharge unobstructed)
- Coastal areas (salt spray): Select stainless steel casing or copper coil protection; aluminum fins corrode within 3–5 years in marine environments (source: ASHRAE durability standard for coastal applications)

### Refrigerant Line Insulation

Tropical ambient (32–34°C) and high humidity (80%+ RH) cause rapid condensation on uninsulated suction lines.

**Specification (source: PD 1058, Section 5.4):**
- Suction line insulation: 25 mm minimum, closed-cell foam with vapor barrier wrap
- Discharge line: 6 mm insulation to prevent heat loss and protect personnel
- Tracer heating for R-32 systems in high-humidity zones (risk of liquid flood-back on startup)

[SLATECAMP_UI_BLOCK:ui_0013 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: Uninsulated suction lines in Philippines condense within 5–10 minutes of startup; water ingress into compressor causes acid formation and bearing failure within weeks. Never operate split or VRF systems without full-length insulated lineset.
[/SLATECAMP_UI_BLOCK]

## Selection Workflow and Design Checklist

[SLATECAMP_UI_BLOCK:ui_0014 component="WikiCalloutBox" status="preserved"]
Extracted summary:
- Props: title="HVAC System Selection Process", variant="info"
- Text: 1. Establish design cooling load: _Q_ (BTU/hr or kW) using ASHRAE method or quick estimate (400–600 BTU/hr per m² commercial, 300–400 residential) 2. Verify building type, orientation, occupancy pattern (continuous vs. intermittent) 3. Compare system types by life-cycle cost: [Capital cost + (Energy cost × system lifespan)] ÷ system lifespan 4. Select refrigerant: R-32 (new), R-410A (retrofit/legacy), R-22 (existing systems only; no new charge) 5. Verify COP/EER meets Philippine Energy Efficienc
[/SLATECAMP_UI_BLOCK]

### Design Checklist (Quick Reference)

- [ ] Cooling load calculated (BTU/hr, kW, and TR)
- [ ] System type selected (split, VRF, chiller, package) matching area and load
- [ ] Capacity oversizing factor applied (10–20% to account for part-load efficiency and future expansion; source: ASHRAE design practice)
- [ ] Refrigerant type specified (R-32 recommended; R-410A acceptable legacy choice)
- [ ] COP/EER target verified against Philippine Energy Efficiency Standards
- [ ] Condensate drainage detailed (slope, secondary pan, overflow)
- [ ] Outdoor unit structural bracing and typhoon tie-down confirmed
- [ ] Suction line insulation 25 mm foam + vapor barrier specified
- [ ] Electrical supply verified: 220V/60Hz single-phase (residential) or 3-phase (commercial); breaker and wiring capacity confirmed per PD 1058 Section 7
- [ ] Mechanical room or outdoor space dimensions confirm equipment access for maintenance
- [ ] Post-installation commissioning plan documented (leak test, charge verification, performance rating)

---

## Inverse Computation: Sizing from Specified Setpoint and Demand

If indoor setpoint and outdoor temperature are given, work backward to verify system undersizing or oversizing risk:

**Given:** Indoor setpoint _T_in = 24°C, outdoor ambient _T_out = 33°C, floor area _A_ = 500 m², occupancy _N_ = 50 persons, equipment load _Q_eq = 10 kW
**Find:** Required system capacity in TR

_Sensible load (envelope + infiltration):_
_Q_sens_ = 500 m² × 500 BTU/hr per m² ÷ 3.412 ≈ 73.3 kW (for 500 BTU/hr per m² commercial; source: ASHRAE 90.1)

_Occupant load (sensible):_
_Q_occ,sens_ = 50 persons × 100 W per person (office activity, source: ASHRAE 62.1 Table 6.2.2.1) = 5 kW

_Total sensible (rounded):_
_Q_sens,total_ ≈ 73 + 10 + 5 = 88 kW ≈ 25 TR

_Latent load (humidity control for 70% → 60% RH, tropical climate):_
_Q_lat_ ≈ 15 kW (30–40% of sensible in Philippines; source: PD 1058 tropical design)

_Grand total:_
_Q_total_ ≈ 88 + 15 = 103 kW ≈ 29 TR

**System selection:** Specify 30 TR capacity (two 15 TR split units, or one 30 TR VRF outdoor + 4 indoor units at 7.5 TR each). Verify COP ≥3.2 for 88 kW sensible load; latent capacity must handle 15 kW simultaneous moisture removal at 60% RH target (achievable with modern ERV [Energy Recovery Ventilation] integrated or standalone dehumidifier if relying on unit alone).

---

## Key Takeaways

1. **Split-type systems** dominate residential and small commercial; lowest cost, adequate for ≤5 TR.
2. **VRF systems** offer superior part-load efficiency and zone control; recommended for medium-to-large buildings (25–80 TR) with payback in 5–8 years.
3. **Chilled water systems** provide centralized cooling for large complexes; highest capital cost but best scalability and efficiency (COP 4.5–5.5).
4. **Tropical climate design** requires explicit latent load sizing (30–40% of total), continuous condensate drainage, and typhoon-resistant outdoor unit bracing.
5. **Refrigerant transition:** R-32 is emerging standard (lower GWP = 675); R-410A acceptable for retrofit; R-22 phased out in new systems.
6. **Philippine standards** enforce minimum 9.5 EER (split) / 13 SEER (VRF) and mandate PD 1058 compliance for all installations.
7. **Sizing rule of thumb:** Commercial 500 BTU/hr per m² = ~1.47 kW per m², residential 400 BTU/hr per m² = ~1.17 kW per m² (quick estimate before detailed load calc).
8. **Commissioning critical:** All systems require leak test, charge verification, and performance rating per PD 1058 Section 8 before handover.

## Related Articles

See also within HVAC and Mechanical Systems: **lea-util-002-03-core-concept**, **lea-util-002-05-core-concept**, **lea-util-002-06-core-concept**, **lea-util-002-07-core-concept**.

> **Overview:** See **overview-building-utilities-mepf** for the full curriculum structure and study strategy. See **mastery-building-utilities-mepf** for connections across topics.
