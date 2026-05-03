## What You Need to Know for the LEA

## Learning Goal

Diagram the electrical distribution hierarchy — from utility transformer to main service panel to subpanels to branch circuits to loads — and identify PEC requirements for conductor sizing, overcurrent protection, voltage drop, and panel location at each level.
## The Distribution Hierarchy

Every building's electrical system follows a standardized flow:

1. **Utility Transformer (Primary → Secondary)**
   - Input: 13.8 kV from Meralco or local utility
   - Output: 220/380V, 60 Hz
   - Rated in kVA (kilowatt-apparent power)

2. **Main Switchgear**
   - Houses the main disconnect and overcurrent protection
   - Meralco service entrance requirement per PEC Article 2.6.1
   - Must include main circuit breaker, metering equipment, and grounding provisions

3. **Panelboards (Distribution Panels)**
   - _Lighting Panelboard_: 20A branches for general lighting
   - _Power Panelboard_: 30A–50A branches for equipment and heavy loads
   - _Subpanels_: Secondary distribution points for large buildings

4. **Branch Circuits**
   - Final circuits to outlets, fixtures, and equipment
   - Typically 15A or 20A (lighting), 20A–50A (power)

---

## Transformer Sizing & Selection

<Note>
A transformer's kVA rating must match or exceed the building's calculated demand load. Undersizing causes excessive heating; oversizing wastes energy and cost.
</Note>

### Load Calculation Formula

**Apparent Power (kVA) = (Connected Load × Demand Factor) ÷ 1000**

<Example>
Office building in Manila with:
- 150 kW connected lighting + HVAC + equipment
- Demand factor: 0.8 (PEC Table 2.6.2)
- Power factor: 0.95 lag (typical)

**Calculation:**
- Demand Load = 150 kW × 0.8 = 120 kW
- kVA = 120 ÷ 0.95 = 126.3 kVA → Select 150 kVA transformer (next standard size)

Transformer rating: **150 kVA, 13.8 kV ÷ 220/380 V, 60 Hz**
</Example>

### Standard Transformer Ratings (PEC Section 4.2.1)
Available sizes: 15, 30, 50, 75, 100, 150, 200, 300, 500 kVA

---

## Single-Line Diagram Components

A single-line diagram shows the electrical distribution path using standardized symbols:

| Component | Symbol Meaning | PEC Reference |
|-----------|---|---|
| Transformer (2-winding) | Two circles with line | Article 3.1 |
| Circuit Breaker (CB) | Circle with line/switch | Article 2.9.2 |
| Disconnect Switch | Rotary or knife switch symbol | Article 2.9.1 |
| Panelboard | Rectangle with internal lines | Article 2.8.1 |
| Bus Duct (Busway) | Three parallel lines | Article 4.1.3 |
| Grounding (GND) | Three horizontal lines | Article 5.3 |

<Tip>
Always include the voltage level, breaker rating, and conductor size on the single-line diagram. This ensures field crews can verify installation correctness.
</Tip>

---

## Voltage Drop Calculations

Voltage drop is the loss of voltage along conductors due to resistance. The PEC permits a maximum 3% drop in branch circuits and 5% combined feeder + branch (Article 2.5.4).

### Single-Phase Voltage Drop Formula

**Vd = (2 × K × I × L) / CM**

Where:
- **Vd** = Voltage drop (volts)
- **K** = Copper resistivity constant = 10.8 (ohm-cmil/ft at 60°C)
- **I** = Current (amperes)
- **L** = Conductor length (feet)
- **CM** = Conductor size (circular mils)

<Warn>
Voltage drop must be calculated for feeders supplying motor loads. Motors operating below 85% of rated voltage suffer reduced torque and increased current draw, risking burnout.
</Warn>

### Practical Example: Feeder Sizing for Power Panel

<Example>
A 50 A feeder runs 200 feet from main switchgear to a power panelboard serving motor loads. Circuit design:
- Current: 50 A
- Distance: 200 ft (one-way, so actual drop distance = 2 × 200 = 400 ft)
- Copper conductor size: #6 AWG = 26,240 CM (PEC Table 8.1)

**Calculation:**
- Vd = (2 × 10.8 × 50 × 400) / 26,240
- Vd = 432,000 / 26,240
- Vd = **16.46 volts**

**Percentage drop:**
- % Vd = (16.46 ÷ 220) × 100 = 7.48%

**Finding:** This exceeds the 5% limit. Solution: Upgrade to #4 AWG (41,740 CM)
- Vd = (2 × 10.8 × 50 × 400) / 41,740 = 10.33 V = 4.69% ✓ Acceptable

**Final feeder specification: 50 A circuit breaker with #4 AWG copper, 3 conductors (phase, neutral, ground)**
</Example>

---

## Panelboard Design & Rating

<WikiExamTable headers={["Panelboard Type", "Typical Current Rating", "Branch Protection", "Application"]} rows={[["Lighting Panel (LP)", "100–200 A", "15–20 A breakers", "General lighting, outlet circuits"], ["Power Panel (PP)", "200–400 A", "30–50 A breakers", "Equipment, HVAC, motors"], ["Distribution Panel (DP)", "400–1000 A", "Varies; main only", "Large buildings, secondary distribution"], ["Subpanel", "50–200 A", "20–50 A breakers", "Remote areas, satellite distribution"]]} />

<Callout type="success">
Panelboard selection must account for future load growth. PEC Article 2.8.3 requires minimum 25% spare capacity for additions.
</Callout>

---

## Bus Duct / Busway Systems

For large commercial or industrial buildings, bus duct (busway) distributes power more efficiently than individual feeders:

**Advantages:**
- Higher current capacity in compact space
- Easy tap-off points for subpanels and equipment
- Lower installation labor
- Better heat dissipation

**Design considerations:**
- Rated in amperes (500 A, 800 A, 1200 A typical)
- Copper vs. aluminum construction affects cost and ampacity
- Requires proper support every 1.5 m per PEC Article 4.1.3
- Segregate power and lighting busways to avoid interference

<WikiMistakeCard mistake="Installing a single 1000 A busway to supply both main distribution and lighting panels" correction="Use separate busways: one for main feeders (3-phase power), one for lighting distribution (1-phase or balanced 3-phase with neutral)" />

---

## Power Factor & Correction

Power factor (PF) is the ratio of real power (kW) to apparent power (kVA). Low PF increases utility bills and equipment losses.

**Power Factor Definition:**
- **PF = kW ÷ kVA** (ranges 0 to 1.0)
- 0.95 lagging = good industrial standard per PEC Article 1.3.2
- Below 0.85 triggers utility penalty charges in the Philippines

### Capacitor Bank Sizing for Correction

**Reactive Power (kVAR) to correct from PF₁ to PF₂:**

**kVAR = kW × (tan θ₁ − tan θ₂)**

Where θ is the angle for each power factor from trigonometric tables.

<Example>
Factory with 200 kW inductive load at 0.80 PF wants to improve to 0.95 PF.

**Calculation:**
- tan(36.87° for 0.80 PF) = 0.75
- tan(18.19° for 0.95 PF) = 0.33
- kVAR = 200 × (0.75 − 0.33) = 200 × 0.42 = 84 kVAR

**Install capacitor bank: 80–90 kVAR rated**
- Three phase, 380 V, 60 Hz
- Stages: 20 kVAR × 4 units (allows incremental correction)
</Example>

<Note>
Never over-correct with capacitors; this creates leading power factor, equally penalized. Automated power factor controllers adjust capacitor stages to maintain 0.95–0.99 PF during load variations.
</Note>

---

## Service Entrance & Metering Requirements

Per Meralco standards and PEC Article 2.6:

1. **Location Requirements**
   - Accessible from public way
   - Not concealed in walls or ducts
   - Clear working space: 1 m width, 1.5 m height (PEC Article 2.6.1)

2. **Components in Service Entrance Cabinet**
   - Metering socket (provided by utility)
   - Main disconnect switch or circuit breaker
   - Ground fault protection (if required)
   - Grounding electrode connection

3. **Conductor Requirements**
   - Feeder from utility pole to service entrance: Min. #4 AWG copper per Meralco Technical Memorandum 97-005
   - Service neutral: Same size as feeder or per load calculation
   - Equipment ground: #6 AWG or larger per PEC Table 5.6.1

4. **Grounding Electrode System**
   - Driven ground rod: ⅝" diameter, 2.4 m length minimum
   - Resistance test: ≤5 ohms per PEC Section 5.3.4
   - Rod installation in high-resistivity soil: Use multiple rods spaced 2.4 m apart

<Tip>
In Metro Manila, install the grounding electrode in the moist subsurface (below water table) if possible. Urban fill and dry topsoil often exceed 5-ohm target; deep rods are cost-effective insurance.
</Tip>

---

## Circuit Breaker Sizing & Coordination

Circuit breakers protect conductors and equipment from overcurrent (short circuit and overload).

### Sizing Rules (PEC Article 2.9.2)

1. **Overcurrent Device Rating ≥ Conductor Ampacity**
   - Example: #4 AWG copper (90°C insulation) = 85 A ampacity → use 85 A or next standard breaker

2. **Breaker ≥ 125% of Continuous Load**
   - A continuous load running >3 hours (HVAC, water pump, etc.) requires breaker sized at ≥1.25 × I
   - Example: 64 A pump running continuously → 64 × 1.25 = 80 A breaker (next standard size)

3. **Coordination with Upstream Protection**
   - Each panelboard breaker must clear before the feeder breaker
   - Time-current curves ensure selective tripping

<WikiMistakeList mistakes={["Selecting a breaker based only on load current, ignoring continuous duty uplift", "Using a single large breaker for a panelboard without subdividing branches", "Installing breakers without testing selective coordination in high-power installations"]} />

---

## Worked Example: Complete Building Distribution System

<Example>
**Project: 10-story office building, Makati, Metro Manila**

**Given Data:**
- Connected load: 800 kW (mixed lighting, HVAC, equipment)
- Demand factor: 0.75 (PEC Table 2.6.2)
- Power factor: 0.90 lagging (existing motors, typical)
- Utility supply: Meralco, 13.8 kV / 220-380 V
- Main switchgear location: Ground floor electrical room
- Longest feeder run: 120 m to top floor subpanel

**Step 1: Transformer Sizing**
- Demand Load = 800 × 0.75 = 600 kW
- kVA = 600 ÷ 0.90 = **667 kVA** → Select 750 kVA (next standard)

**Step 2: Service Entrance Feeder**
- Secondary current from 750 kVA transformer @ 220 V:
  - I = (750 × 1000) ÷ (1.732 × 220) = 750,000 ÷ 381.04 = 1,968 A (three-phase)

This exceeds standard single feeder capacity (>500 A). Solution: Use dual 1000 A feeders or install bus duct system.

**Choose: 1000 A bus duct (aluminum, ¾" × 2¼" profile)**
- Two feeders: 2 × #500 MCM copper per phase from transformer
- Feeder breaker: 1000 A (upstream of bus duct)

**Step 3: Main Switchgear**
- Main disconnect: 1000 A switch, 3-pole
- Transformer secondary neutral: #500 MCM (same as phase)
- Ground: #4 AWG copper to 2 rods in parallel (5 Ω target)

**Step 4: Top Floor Subpanel (120 m run)**
- Demand on subpanel: 120 kW (25% of building, estimated)
- Subpanel current: (120 × 1000) ÷ (1.732 × 380) = 182 A @ 380 V three-phase
- Feeder sizing: Use #4/0 AWG copper (195 A ampacity @ 90°C)
- Breaker: 200 A
- Voltage drop check:
  - Using 3-phase formula: Vd = (√3 × K × I × L) ÷ CM
  - Vd = (1.732 × 10.8 × 182 × 400) ÷ (107,200) = 1,275 ÷ 107,200 = **1.19 V** (0.31% of 380 V) ✓

**Step 5: Power Factor Correction**
- Current PF = 0.90, target = 0.95
- Reactive power: kVAR = 600 × (tan 25.84° − tan 18.19°) = 600 × 0.30 = **180 kVAR**
- Install: 3 × 60 kVAR capacitor stages, auto-controlled, 380 V, 60 Hz

**Final System Summary:**
| Component | Rating | Specification |
|-----------|--------|---|
| Transformer | 750 kVA | 13.8 kV ÷ 220/380 V, 60 Hz, 3-phase |
| Service Feeder | 1000 A | Bus duct, 2 × #500 MCM Cu per phase |
| Main Breaker | 1000 A | 3-pole, 380 V |
| Subpanel Feeder (Top Floor) | 200 A | #4/0 AWG Cu, 3-phase + neutral + ground |
| Subpanel Rating | 200 A | 380 V, 3-phase |
| Capacitor Bank | 180 kVAR | 3-stage auto, 60 kVAR each, 380 V |
| Grounding | 2 rods | ⅝" × 2.4 m, parallel, ≤5 Ω |

</Example>

---

## Key PEC References for Distribution Design

<WikiCalloutBox title="PEC 2021 Article Summary" variant="info">
- **Article 2.5.4:** Voltage drop limits (3% branch, 5% combined feeder + branch)
- **Article 2.6.1–2.6.3:** Service entrance requirements, location, clearances, grounding
- **Article 2.8.1–2.8.3:** Panelboard construction, ratings, spare capacity (minimum 25%)
- **Article 2.9.2–2.9.3:** Circuit breaker sizing and coordination (125% continuous load)
- **Article 4.1.3:** Bus duct support spacing (1.5 m maximum)
- **Article 4.2.1:** Transformer ratings and kVA standards
- **Article 5.3.4:** Grounding electrode resistance testing (≤5 ohms)
</WikiCalloutBox>

---

## Common Design Pitfalls & Corrections

<WikiMistakeList mistakes={["Undersizing the main transformer by assuming nameplate load instead of demand load with demand factor", "Selecting bus duct rating equal to transformer capacity instead of reviewing actual panelboard demand", "Installing capacitors without auto-control, leading to leading PF during light loads and utility penalties", "Routing feeder conductors through single steel conduit without accounting for inductive reactance increase", "Neglecting voltage drop on long runs, causing motor stall and equipment malfunction", "Using undersized grounding electrode system in coastal areas (high soil resistivity requires multiple rods)"]} />

---

## Summary Checklist

- [ ] Calculate demand load using PEC demand factors
- [ ] Select transformer kVA (connected load ÷ demand factor ÷ PF)
- [ ] Size service entrance feeder (Meralco approval + PEC feeder tables)
- [ ] Design main switchgear with required disconnect, metering, grounding
- [ ] Calculate and verify voltage drop for all feeders (max 5% combined)
- [ ] Size panelboards with 25% spare capacity
- [ ] Select circuit breakers at 125% continuous load minimum
- [ ] Coordinate breaker selectivity (upstream/downstream curves)
- [ ] Size power factor correction capacitors; install auto-control
- [ ] Install grounding electrode system; test for ≤5 ohm resistance
- [ ] Produce single-line diagram with all voltages, breaker ratings, conductor sizes
- [ ] Submit design to Meralco and local authority for approval

\<Callout type="info">
The PEC (Philippine Electrical Code) 2021 Edition mandates that all commercial buildings receive power through a proper metering and service entrance, with calculated feeder sizes and coordinated protection devices.
</Callout>
