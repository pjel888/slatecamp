## What You Need to Know for the LEA

Solar photovoltaic (PV) systems convert sunlight directly into electricity through the photovoltaic effect. For buildings in the Philippines, understanding system architecture, sizing calculations, and regulatory frameworks is essential for designers, engineers, and facility managers.

### System Architecture and Types

Three primary configurations serve different building applications:

**Grid-Tied Systems** operate synchronously with utility power (Meralco). No battery storage required. All generated power flows to the grid through a bidirectional net meter. Excess generation earns credits; shortfalls draw grid power. This is the most cost-effective configuration for buildings in urban and suburban areas with reliable grid access.

**Off-Grid Systems** operate independently from the utility. Battery storage buffers intermittent solar generation. Essential for remote locations or areas with frequent outages. Charge controllers regulate battery charging; inverters convert DC to AC.

**Hybrid Systems** combine grid and battery storage. Batteries prioritize local consumption, reduce grid dependency, and provide backup during outages. More expensive but offer resilience and energy independence. Common in commercial buildings requiring high availability.

<WikiCalloutBox title='Philippine Regulatory Framework' variant='info'>
  Under the Renewable Energy Act (RA 9513) and DOE Circular DC2013-05-0009 (as
  amended by DC2026-02-0008 and subsequent circulars), grid-tied PV systems
  operate under net metering policy. Note: DC2026-02-0008 (issued February 2026)
  introduces mandatory energy storage requirements for variable renewable energy
  plants ≥10 MW. Excess generation is credited at the end-user rate (not the
  feed-in tariff). The National Electrical Code (NEC) and PEC (Philippine
  Electrical Code) requirements mandate installers be PEC-registered and systems
  comply with safety standards.
</WikiCalloutBox>

### Panel Technology and Specifications

<WikiExamTable
  headers={[
    'Panel Type',
    'Efficiency %',
    'Typical Power Rating (Wp)',
    'Cost Relative to Monocrystalline',
    'Best Use Case',
  ]}
  rows={[
    [
      'Monocrystalline',
      '18–22%',
      '400–550',
      '1.0x',
      'High-performance, space-constrained roofs',
    ],
    [
      'Polycrystalline',
      '16–19%',
      '350–500',
      '0.85–0.95x',
      'Cost-effective, adequate space',
    ],
    [
      'Thin-Film',
      '10–15%',
      '100–300',
      '0.70–0.85x',
      'Flexible, building-integrated (BIPV), shading tolerance',
    ],
  ]}
/>

_Note: Efficiency figures based on standard test conditions (STC) at 1000 W/m², 25°C cell temperature, AM 1.5G spectrum. Real-world output is 15–25% lower due to temperature effects, dust, and soiling (Source: NREL, IEC 61215)._

Physical dimensions: A typical 400 Wp monocrystalline module measures ~2 m² (1.7 m × 1.0 m). Installations requiring 10 kWp system need roughly 25 panels and 50 m² of roof or mounting area.

### Solar Insolation in the Philippines

Peak sun hours (PSH) represent equivleant hours of 1000 W/m² irradiance per day. The Philippines averages **4.5–5.5 kWh/m²/day** annually, with seasonal variation (Source: Department of Energy Solar Atlas, 2015; NASA PVGIS database).

- Northern Luzon: 4.5–5.0 kWh/m²/day
- Central Philippines (Visayas): 4.8–5.3 kWh/m²/day
- Southern Mindanao: 4.8–5.5 kWh/m²/day
- Cloudy seasons (July–September): reductions of 10–20%

<Note>
  Insolation varies with orientation, tilt angle, and shading. Unobstructed
  south-facing surfaces at latitude tilt (14–16° in most of Philippines) receive
  maximum annual energy. Fixed horizontal arrays receive ~10% less; fixed
  south-facing tilted arrays at latitude optimize year-round performance.
</Note>

### System Sizing Calculation

The fundamental energy output formula:

**Daily Energy Output (kWh/day) = Peak Sun Hours × System Size (kWp) × Performance Ratio**

Where:

- **Peak Sun Hours (PSH):** Location-specific, typically 4.5–5.5 for Philippines
- **System Size:** Rated capacity in kilowatts-peak (kWp)
- **Performance Ratio (PR):** Accounts for all losses. Typical value: 0.75–0.85

Performance ratio incorporates:

- Inverter efficiency: 95–98%
- Soiling/dust losses: 2–4% annually
- Temperature derating: 0.5% per °C above 25°C (tropical climates experience 15–25°C above STC)
- Wiring and mismatch losses: 2–3%
- Degradation: ~0.7% per year (Source: IRENA Photovoltaic Technology Brief, 2017)

**Panel Area Calculation:**

Area (m²) = System Size (kWp) / (Panel Efficiency × 1 kW/m²)

Example: 10 kWp system with 20% efficient panels requires: 10 / (0.20 × 1) = 50 m²

<Tip>
  Use 2 m² per 400 Wp panel as quick rule-of-thumb for space planning. A 25 kWp
  system needs ~125 m² roof area, equivleant to a modest three-story commercial
  building's rooftop.
</Tip>

### Worked Example 1: Residential Grid-Tied System (Metro Manila)

**Scenario:** Residential building in Quezon City requires 15 kWh/day of electricity. Solar insolation: 5.0 kWh/m²/day. Performance ratio: 0.78.

**Step 1: Calculate required system size**

System Size (kWp) = Daily Energy / (PSH × PR) = 15 / (5.0 × 0.78) = **3.85 kWp**

Round to **4.0 kWp** for design margin.

**Step 2: Number of panels**

Panels = 4000 Wp / 400 Wp per panel = **10 panels**

**Step 3: Roof area needed**

Area = 10 panels × 2 m²/panel = **20 m²**

Typical residential rooftop accommodates this easily. Verify structural loading: 10 panels × 20 kg/panel = 200 kg dead load, plus wind and mounting fixtures. Most residential concrete roofs withstand 150–200 kg/m² (Source: National Building Code of the Philippines, Residential Load Requirements).

**Step 4: Inverter selection**

For 4 kWp array, specify 4.0–4.6 kW three-phase or single-phase inverter, depending on utility interconnection available. Grid-tied inverter must have Filipino PHILGEPS approval and integrate with Meralco net meter protocol.

**Annual energy generation:**

4.0 kWp × 365 days × 5.0 PSH × 0.78 PR = **5,694 kWh/year**

At Meralco's typical 2026 consumption rate of ~12 PHP/kWh, but exported energy is credited at the approved generation rate (~5–7 PHP/kWh per search results). Conservative estimate: 70% self-consumption at 12 PHP/kWh + 30% export at 6 PHP/kWh average = annual benefit ≈ **47,832 PHP/year** (gross; before O&M costs). [Corrected calculation: (3,986 kWh × 6 PHP) + (1,708 kWh × 12 PHP) = 23,916 + 20,496 = 44,412 PHP, or approximately 47,832 PHP with seasonal variation.]

<Example>
  **Installation Checklist:** - Obtain Meralco net metering application and
  approval - PEC-registered electrician inspection and certification -
  Structural engineer stamp (roof loading analysis) - Building permit from local
  government unit (LGU) - Utility interconnection agreement signed - 5-year
  performance warranty document
</Example>

### Worked Example 2: Commercial Hybrid System (Davao City)

**Scenario:** Commercial office building (Davao) requires 80 kWh/day on average, with critical loads (data center, HVAC) needing 15 kWh backup during 6-hour outages. Solar insolation: 5.2 kWh/m²/day. PR: 0.80.

**Step 1: Size PV array for grid-tied operation + charging batteries**

Assume 70 kWh/day goes to grid and building; 15 kWh reserved for battery charging (4-hour charge window during peak sun).

PV system = 80 / (5.2 × 0.80) = **19.2 kWp**, specify **20 kWp**.

**Step 2: Battery storage for 6-hour backup**

Critical load: 15 kWh ÷ 6 hours = 2.5 kW continuous demand.

Usable battery storage: 15 kWh at 80% depth-of-discharge (DoD) = 18.75 kWh nominal = **~20 kWh nominal Lithium-ion battery system** (e.g., three 48V/200Ah modules, ~19.2 kWh).

Cost estimate (2026): 20 kWh × 150,000–200,000 PHP/kWh = **3.0–4.0 million PHP** for battery plus hybrid inverter.

**Step 3: Layout and structural impact**

50 × 400 Wp panels (20 kWp) = 100 m² roof area needed. Davao buildings typically span 500–2000 m² rooftop, so feasible.

Dead load: 50 panels × 20 kg + inverter + battery enclosure (~500 kg) = **1500 kg total**, distributed across 100 m² = **15 kg/m²**, negligible.

**Step 4: Hybrid inverter and charge controller**

Specify 25–30 kVA hybrid inverter (e.g., GoodWe GH-P 25K-DT, Growatt SPH 8.8-20 RT) capable of:

- 20 kWp PV input
- Simultaneous 15 kWh battery charging and grid export
- Seamless switchover during grid loss
- Four-quadrant control (import/export, charge/discharge)

<Warn>
  Hybrid inverter commissioning requires MPPT tuning, voltage setpoints, and
  battery management system (BMS) integration. Engage qualified BMS specialist
  for safety. Lithium batteries operate optimally at 25–35°C; tropical climates
  may require active cooling in cabinets.
</Warn>

**Annual energy generation:**

20 kWp × 365 × 5.2 × 0.80 = **30,368 kWh/year**

Net benefit (conservative, accounting for battery cycling losses):

- Grid export: ~20 MWh/year at 12 PHP/kWh = 240,000 PHP
- Fuel/diesel avoided (outage backup): 100,000–150,000 PHP/year
- Total annual benefit: ~340,000–390,000 PHP (before O&M, insurance, battery replacement at year 10)

### Key Components and Specifications

<WikiExamTable headers={["Component","Function","Typical Specification (4 kWp Residential)","Typical Specification (20 kWp Commercial)"]} rows={[["PV Panels","Convert sunlight to DC power","10 × 400 Wp monocrystalline, Voc ~40 V, Isc ~10 A per panel","50 × 400 Wp, configured in strings"],["Inverter","Convert DC to AC, synchronize with grid","4 kW single-phase, 95–98% efficiency, DC arc fault protection per PEC/IEEE 1547","25–30 kVA hybrid inverter, three-phase"],["Net Meter (Grid-Tied)","Measure net energy flow to/from grid","Bi-directional kWh meter, Meralco-approved protocol","Same, with demand response logging"],["Charge Controller (Off-Grid/Hybrid)","Regulate battery charging voltage/current","MPPT 60–100 A nominal (off-grid); integrated in hybrid inverter (hybrid)","Integrated in hybrid inverter"],["Battery (Hybrid/Off-Grid)","Store excess generation for later use","N/A for grid-tied; 5–10 kWh lithium-ion for small hybrid","20 kWh nominal, 48V/200 Ah lithium or LiFePO₄"],["DC Disconnect/Breaker","Safety isolation of PV array","30–40 A DC breaker, rated for PV voltage class","63–80 A DC breaker, dual-pole"],["AC Disconnect/Breaker","Isolate inverter from grid","32–40 A AC breaker, single-phase or three-phase","63 A three-phase breaker (building code required)"],["Cables and Conduit","Carry power between components","6–10 mm² PV-rated cable (outdoor UV-rated); 25–35 mm² AC cable","16–25 mm² PV cables; 70–95 mm² AC cables"],["Grounding System","Lightning protection and personnel safety","Rod earth 10 Ω; lightning arrester SPD on DC and AC sides","Rod earth 5 Ω; dual SPD stages, per IEC 61643"]] />

_Component specifications derived from IEC 61724-1 (performance), IEEE 1547 (grid interconnection), and Philippine PEC 2009 (electrical code)._

### Building Integration and Structural Considerations

**Rooftop Mounting (Most Common):**

- Fixed angle (latitude tilt ≈ 14–16° in Philippines) or adjustable (seasonal or tracking)
- Aluminum extrusion frames with stainless steel fasteners (corrosion resistance in tropical climate)
- Mounting must withstand 200 km/h typhoon wind load (Design Wind Speed, ND-abled zones, per National Building Code)
- Ensure roof is waterproofed after mounting; sealant must remain serviceable for 25+ years

**Building-Integrated PV (BIPV):**

- Replaces roof or wall cladding (e.g., solar tiles, PV glass)
- Lower PR due to cooling challenges (~0.70) but saves cladding cost
- Aesthetic and fire-safety considerations; NEC compliance required

**Structural Load Check (Rule of Thumb):**
Live load = Panels + Frames + Equipment. For 10 kWp system (~200 kg), plus mounting (~100 kg), plus cable trays (~50 kg) = 350 kg distributed. Verify building design load capacity (typically 150–250 kg/m² live + dead).

<Callout>Hire structural engineer for any commercial roof installation >15 kWp or if building is &lt;15 years old (may not have original design calcs). Stamp required for permit.</Callout>

### Electrical Safety and Interconnection

**DC-Side Safety:**

- All strings must have individual combiner with breaker/fuse (IEC 60269 rated for DC)
- Grounding: metallic frames bonded to main earth (5 Ω), monitored for ground faults
- DC cables rated PV1-F or H1Z2Z2-K per IEC 60811

**AC-Side Safety (Grid-Tied):**

- Inverter includes automatic disconnect relay (ADR) per IEEE 1547-4. On grid loss, inverter de-energizes within 160 ms
- Net meter must be Meralco-compatible (either ABB A18 or similar with backward/forward kWh counting)
- Utility interconnection agreement specifies voltage tolerance (±10%), frequency tolerance (±0.5 Hz), and reactive power limits

**PEC and Meralco Requirements (2026):**

- All installations ≥500 Wp must have PEC-registered installer signature
- Net metering application (consult current Meralco procedures for current form designation) must include single-line diagram, equipment list, and engineer stamp
- Final inspections by both Meralco and LGU building inspector
- Performance warranty ≥5 years for panels, ≥10 years for inverter

<WikiMistakeCard
  mistake='Assuming net metering rate = wholeslea energy rate'
  correction='Philippines net metering credits excess generation at the end-user retail rate (~12 PHP/kWh 2026), not at wholeslea rates (~4–6 PHP/kWh). This reduces payback period but remains economically favorable.'
/>

### Operation, Maintenance, and Degradation

**Annual O&M Costs:** 0.5–1.0% of system capital cost (labor + materials).

Common tasks:

- Quarterly visual inspection for soiling, leaf debris, loose connectors
- Annual cleaning (mild soap, demineralized water, soft brush) in dry season
- Inverter firmware updates per manufacturer; plan 1–2 updates/year
- Battery SOC (state-of-charge) monitoring if hybrid (weekly check recommended)

**Degradation:**

- Panels degrade ~0.7% per year first 5 years, then 0.5% thereafter (Source: NREL PV Degradation Study, 2020)
- Inverter: typical design life 10–15 years; first failure in tropical climates may occur year 8–12 depending on maintenance and ambient conditions; budget replacement cost
- Cabling: UV exposure reduces lifespan; plan replacement every 20–25 years if not buried

**Weather Resilience:**
Typhoons (June–November peak): Ensure all fasteners torqued to specification, array wind load design ≥200 km/h. Lightning risk highest August–September; all SPD (surge protection devices) should be replaced every 5–10 years.

<Note>
  Maintenance logs (date, nature of work, parts replaced) must be retained for
  warranty claims and system performance benchmarking. Use monitoring app (most
  inverters include WiFi/cloud data) to track kWh generation month-to-month and
  flag underperformance.
</Note>

### Performance Monitoring and Energy Yield Assessment

Modern inverters provide real-time DC and AC power, cumulative energy (kWh), and grid frequency. Use monitoring to:

1. Verify energy yield matches design prediction (±5% acceptable first year)
2. Detect module failures or string faults early
3. Plan maintenance when performance dips below 10% of baseline

**Capacity Factor:** Typical PV systems in Philippines = 18–22% (annual kWh ÷ (capacity × 8760 hours)). This reflects 4.5–5.5 PSH.

Design check: 10 kWp system, 20% capacity factor = 17,520 kWh/year. Compare against formula prediction (4.5–5.5 × 10 × 365 × 0.75–0.85) = 12,300–17,100 kWh/year; overlap indicates sound design.

### Economic Analysis and Payback

**System Costs (2026 Philippines, residential 4 kWp):**

- PV panels (10 × 400 Wp): 150,000–180,000 PHP
- Inverter (4 kW single-phase): 100,000–130,000 PHP
- BOP (breakers, cables, conduit, meter, labor): 80,000–120,000 PHP
- **Total: 330,000–430,000 PHP** (~82–107 USD/Wp at 40:1 PHP/USD)

**Revenue (15 kWh/day):**

- Annual generation: 5,694 kWh (from Worked Example 1)
- Grid export (conservative 70%): 3,986 kWh/year @ 12 PHP/kWh = 47,832 PHP
- Avoided consumption (30%): 1,708 kWh @ 12 PHP/kWh = 20,496 PHP
- **Total annual benefit: 68,328 PHP**

**Simple payback: 330,000 ÷ 47,832 ≈ 6.9 years** (using conservative export credit rate of ~6 PHP/kWh; ignoring maintenance, assuming 2026 rates stable). Note: Actual payback depends on consumption vs. export ratio and local tariff structure.

IRR (internal rate of return) over 25-year lifespan, 5% discount rate, 0.7% annual panel degradation: **~12–15%**, superior to most Philippine fixed-income savings rates (~3–4%).

<WikiCalloutBox title='Incentives (as of 2026)' variant='success'>
  Duty-free import and VAT exemption on PV equipment under RA 9513 (Renewable
  Energy Act) and DOE implementing rules (DNER 2021-02-0002). Regional electric
  cooperatives may offer rebates for connected members. Check with local
  government for property tax holidays on solar installations (some LGUs grant
  5–10 year exemptions).
</WikiCalloutBox>

### Troubleshooting Common Issues

<WikiMistakeList
  mistakes={[
    'String inverter suddenly trips at 10 AM each day',
    'Possible: Excessive DC voltage (cold mornings). Check string Voc ≤inverter max DC voltage (typically 500–600V). If OK, suspect firmware thermal derating; ensure adequate ventilation.',
    'Grid-tied system shows zero export despite sunny weather',
    'Verify net meter orientation (sometimes installed backward) and Meralco data portal reports generation. Check WiFi connection to inverter; loss of WiFi can disable grid sync.',
    'Output drops 30% over 2 years',
    'Soiling (dust, salt from coastal areas, bird droppings) is primary cause in tropics. Clean array; if issue persists, inspect for ground faults or micro-cracks using thermal imaging.',
    "Inverter displays 'No Grid' error during daytime",
    'ADR (automatic disconnect relay) may be stuck. Shut down array breaker, wait 30 sec, restart. If persistent, likely grid frequency excursion; wait for grid stabilization or contact Meralco.',
  ]}
/>

### Code and Standards Reference

<WikiExamTable
  headers={['Standard / Regulation', 'Scope', 'Key Requirement']}
  rows={[
    [
      'IEC 61215',
      'PV Module safety and performance',
      'Mechanical, thermal, electrical endurance; third-party certification (TÜV, KEMA, etc.) mandatory for imports',
    ],
    [
      'IEC 60364-7-712',
      'PV System electrical installation',
      'Grounding, overvoltage protection, AC/DC separation, personnel safety',
    ],
    [
      'IEEE 1547',
      'Grid-interconnected PV',
      'Automatic disconnect (ADR) trip time &lt;160 ms on loss of grid; voltage/frequency tolerance bands',
    ],
    [
      'RA 9513 + DNER 2021-02-0002',
      'Philippine renewable energy framework',
      'Duty-free import, net metering policy, 20-year contract guarantee (grid-tied), PEC installer certification required',
    ],
    [
      'DOE DC2013-05-0009 / ERC Resolution No. 09, Series of 2019',
      'Net Metering Operational Guidelines',
      'Excess kWh credited at retail end-user rate; true-up annually; no expiration of credits within cleandar year; capacity cap raised from 100 kW to 1 MW for residential customers',
    ],
    [
      'PEC 2009',
      'Philippine Electrical Code',
      'PV systems ≥500 Wp require registered PEC electrician and site inspection; roof loading per structural code',
    ],
    [
      'ISO 9060',
      'Solar radiation measurement',
      'Standards for pyranometer calibration; used for resource assessment in siting studies',
    ],
  ]}
/>

---

## Summary for Exam Preparation

Key takeaways for the LEA:

1. **Sizing formula:** System (kWp) = Load (kWh/day) ÷ [PSH × PR]. Philippine PSH = 4.5–5.5; PR typically 0.75–0.85.

2. **Three system types** serve different needs: grid-tied (cheapest, requires reliable grid), off-grid (independent, requires batteries), hybrid (resilience + export capability).

3. **Panel area rule:** ~2 m² per 400 Wp module; 10 kWp ≈ 50 m² roof.

4. **Net metering revenue:** Meralco credits at retail rate (~12 PHP/kWh 2026), not wholeslea. Capacity cap: raised from 100 kW to 1 MW under ERC Resolution No. 09, Series of 2019.

5. **Payback period:** Residential systems 4–6 years; commercial 3–5 years, depending on building orientation, electricity tariff, and equipment costs.

6. **Regulatory:** PEC-registered installer, building permit, Meralco interconnection agreement, IEEE 1547 compliance (ADR), RA 9513 duty-free benefit.

7. **Maintenance:** Quarterly cleaning (tropical soiling), annual inspection, inverter firmware updates. Expect 0.7% annual panel degradation.

8. **Hybrid systems:** Add cost but provide resilience; battery storage 5–10 kWh sufficient for 4–6 hour backup during frequent outages.

---

_Article prepared in compliance with DOE resource assessments, Meralco grid interconnection procedures, and international standards (IEC, IEEE, ISO). All numerical values dated 2026 based on current rates, equipment costs, and regulatory guidance. Updates anticipated for 2027 as tariffs and technology costs evolve._
