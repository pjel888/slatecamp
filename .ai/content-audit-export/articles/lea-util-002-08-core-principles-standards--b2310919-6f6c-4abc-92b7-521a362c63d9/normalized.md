

## Board Exam Quick Check

Before memorizing details from this topic, state the exam task in one sentence: what is being classified, measured, approved, or restricted? Then identify the controlling rule named by the item and avoid importing requirements from a different law, table, or occupancy condition.

**Common mistake:** treating a familiar keyword in **Lea Util 002 08 Core Principles Standards** as enough to answer. In LEA-style questions, first anchor the question to the exact code, scope, and condition being tested, then choose the option that follows that rule.

**Retrieval prompt:** What fact in the question tells you which rule set applies, and what option would become wrong if the scope changed?
## What You Need to Know for the LEA

## Learning Goal

Identify core mechanical HVAC principles — sensible and latent heat, refrigeration cycle, coefficient of performance (COP), psychrometric chart interpretation — and apply these principles to calculate cooling loads for Philippine buildings.
## Core Principles & Standards

### PD 1096 Elevator Requirements

PD 1096 establishes minimum elevator requirements for Philippine buildings:

- No general PD 1096 mandate for elevators in all buildings 5+ stories; required only for specific occupancies per Rule III Sec. 301 (e.g., 5+ storey residential with 24-hr service)
- Buildings 13+ stories: minimum _two_ elevators; additional elevators required based on building height and occupant load
- Elevator car dimensions per industry practice (not PD 1096 minimum): typically 1.1 m × 1.4 m × 2.2 m
- Access compliance per BP 344 (Magna Carta for Persons with Disabilities): at least one accessible elevator per building

Operating parameters for Philippine installations use 220 V / 60 Hz electrical supply at sea level or standard atmospheric conditions.

### Occupant Load & Population Determination

Elevator sizing begins with occupant load, calculated from building area and occupancy type per PD 1096:

- Office buildings: 1 person per 9.3 m² gross floor area per Table 1206-A
- Retail/commercial: 1 person per 5 m² gross floor area
- Educational institutions: 1 person per 7 m² gross floor area
- Residential: number of dwelling units × occupants per unit (typically 3–5 persons)

Population for elevator traffic analysis = total occupant load of floors served by the elevator (excluding ground floor in many cases, or partial depending on building design).

---

## Elevator Traffic Analysis Formulas

### Round Trip Time (RTT)

[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-util-002-08-core-principles-standard", type="image", caption="Elevator Traffic Analysis — Round Trip Time, Interval, Handling Capacity Diagram", description="Visual workflow of elevator traffic analysis: Population determination from floor area → Round Trip Time (RTT) calculation with formula components (height, speed, stops, door times) → Interval (INT=RTT/Ne) → Handling Capacity (HC=300×CC×trips/5min÷Population). Acceptable ranges: INT 25-40s (office), HC ≥12%. Example calculation for 10-story Philippine office annotated.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]


Round Trip Time represents the time for an elevator to depart the main floor, make one stop at another floor, and return to the main floor.

$$\text{RTT} = 2 \times [H + (S \times n)] / V + t_s + t_d + t_c$$

Where:
- _H_ = height difference between main floor and highest served floor (m)
- _S_ = average floor-to-floor height (m; typically 3.6–4.0 m in Philippine office buildings)
- _n_ = average number of stops (typically 60 % of total floors for traffic analysis)
- _V_ = elevator speed (m/s)
- _t_s_ = door opening/closing time (typically 8–10 seconds total; use 9 s)
- _t_d_ = average door dwell time per stop (typically 2–3 seconds; use 2.5 s)
- _t_c_ = passenger transfer time per stop (typically 6–8 seconds; use 7 s per stop)

Simplified approximation (most commonly used):

$$\text{RTT} = 2H/V + 2 \times S \times n \times (t_c + t_d) / V + t_s$$

For practical design, use empirical values: RTT for a mid-rise office building typically ranges from 60 to 120 seconds.

### Interval (INT) & Handling Capacity (HC)

**Interval (INT):** Time between successive elevator arrivals at the main floor.

$$\text{INT} = \text{RTT} / N_e$$

Where _N_e_ = number of elevators.

Acceptable interval for office buildings: 25–40 seconds. Residential buildings: 40–60 seconds.

**Handling Capacity (HC):** Percentage of occupants that can be transported in a 5-minute period.

$$\text{HC} = \frac{300 \times \text{CC} \times \text{trips/5 min}}{\text{Population}}$$

Where:
- CC = car capacity (persons); typical 1,000 kg car ≈ 13 persons
- trips/5 min = number of round trips in 5 minutes = 300 / RTT
- Population = total occupant load served

Minimum acceptable HC: 12 % for office buildings (ASHRAE/IGCC guidance).

---

## Computational Examples

### Example 1: 10-Story Philippine Office Building

**Given Data:**
- Total gross floor area: 8,000 m²
- Occupancy: office (1 person per 10 m²)
- Floor-to-floor height: 3.8 m
- Building height from G/F to top floor: 36 m
- Elevator speed: 1.75 m/s (typical mid-rise design speed)
- Car capacity (CC): 1,000 kg = 13 persons
- Average stops in 5-minute analysis: 60 % of 10 floors = 6 stops
- Door times + transfer time per stop: 2.5 s (dwell) + 7 s (transfer) = 9.5 s per stop

**Step 1: Calculate Population**

Total occupant load = 8,000 m² ÷ 10 m²/person = 800 persons

Assuming 85 % capacity during peak hour (morning arrival): Population = 800 × 0.85 = 680 persons (use for analysis)

**Step 2: Calculate Round Trip Time (RTT)**

Using simplified formula:

$$\text{RTT} = \frac{2 \times 36 \text{ m}}{1.75 \text{ m/s}} + 6 \times 9.5 \text{ s} + 9 \text{ s (doors)}$$

$$\text{RTT} = 41.1 \text{ s} + 57 \text{ s} + 9 \text{ s} = 107.1 \text{ s} \approx 107 \text{ s}$$

**Step 3: Determine Number of Elevators**

Required Interval = 30 s (mid-range for office buildings)

$$N_e = \text{RTT} / \text{INT} = 107 \text{ s} / 30 \text{ s} = 3.57 \approx 4 \text{ elevators}$$

Verify with 4 elevators: Actual INT = 107 / 4 = 26.75 s ✓ (acceptable)

**Step 4: Verify Handling Capacity**

Trips per 5 minutes = 300 s / 107 s = 2.80 trips

$$\text{HC} = \frac{300 \times 13 \times 2.80}{680} = \frac{10,920}{680} = 16.06 \%$$

HC = 16.06 % > 12 % minimum ✓

**Conclusion:** 4 elevators of 1,000 kg capacity are required for this 10-story office building in the Philippines.

### Example 2: 20-Story Commercial/Mixed-Use Building

**Given Data:**
- Total gross floor area: 18,000 m² (office + retail)
- Office area: 14,000 m² (1 person per 10 m²) = 1,400 persons
- Retail area: 4,000 m² (1 person per 5 m²) = 800 persons
- Total population: 2,200 persons; peak (85 %) = 1,870 persons
- Floor-to-floor height: 4.0 m
- Building height: 76 m (G/F to roof)
- Elevator speed: 2.5 m/s (high-rise classification per PD 1096 guidance for >15 stories)
- Car capacity: 1,000 kg = 13 persons
- Average stops: 60 % of 20 = 12 stops
- Dwell + transfer per stop: 2.5 s + 8 s = 10.5 s per stop

**Step 1: Calculate RTT**

$$\text{RTT} = \frac{2 \times 76 \text{ m}}{2.5 \text{ m/s}} + 12 \times 10.5 \text{ s} + 9 \text{ s}$$

$$\text{RTT} = 60.8 \text{ s} + 126 \text{ s} + 9 \text{ s} = 195.8 \text{ s} \approx 196 \text{ s}$$

**Step 2: Determine Number of Elevators**

Target Interval = 32 s (office/commercial blend)

$$N_e = 196 \text{ s} / 32 \text{ s} = 6.125 \approx 7 \text{ elevators}$$

Verify: Actual INT = 196 / 7 = 28 s ✓ (excellent)

**Step 3: Verify HC**

Trips per 5 min = 300 / 196 = 1.53 trips

$$\text{HC} = \frac{300 \times 13 \times 1.53}{1,870} = \frac{5,967}{1,870} = 3.19 \% \text{ (UNACCEPTABLE)}$$

**Decision:** Increase car capacity or number of elevators.

_Option A:_ Add one more elevator: 8 elevators → HC = 5,967 / 1,870 × (8/7) = 3.64 % (still low)

_Option B:_ Use larger cars (1,250 kg = 16 persons for 1–2 units) mixed with standard 1,000 kg cars.

_Option C:_ Use 8 elevators with 2 high-speed express runs (skipping lower floors during peak times).

Practical solution: 8 elevators total (6 standard 1,000 kg for main office floors, 2 express 1,250 kg serving high-rise + retail).

---

## Inverse Computation & Iterative Design

When the required number of elevators is not immediately acceptable, use inverse analysis:

**Determine Minimum HC Requirement:**

If HC_min = 12 %, solve for required car capacity or trips/5 min:

$$\text{CC}_{\text{required}} = \frac{\text{HC}_{\min} \times \text{Population} \times \text{RTT}}{300 \times 300}$$

**Adjust RTT by Speed:**

For buildings with inadequate interval, re-design using higher-speed elevators:
- Replace 1.75 m/s with 2.5 m/s → reduces RTT by ~15 %
- Replace 2.5 m/s with 3.5 m/s (advanced traction) → reduces RTT by additional ~10 %

**Adjust Population by Occupancy Diversity:**

Not all floors reach peak occupancy simultaneously. Apply demand diversity factor (typically 0.75–0.85) to reduce effective population.

---

## Elevator Types & Philippine Context

### Hydraulic Elevators
- Speed: up to 1.0 m/s per PD 1096
- Cost: low; installation rapid
- Height limitation: typically ≤6 stories; 18 m
- Energy: higher consumption (up to 15 kWh per 100 trips)
- Common in Philippine provincial buildings and small commercial structures

### Traction Elevators (Roped)
- Speed: 1.0–3.5 m/s depending on machine room and control system
- Height: unlimited
- Energy: moderate (8–10 kWh per 100 trips)
- Dominant in metro Manila high-rise (≥10 stories)
- Requires dedicated machine room (adds ~20–25 m² per installation)

### Machine-Room-Less (MRL) Traction
- Speed: 1.0–2.5 m/s
- Advantage: eliminates rooftop machine room; reduces structural cost
- Growing adoption in Philippine Metro Manila due to land premium
- Energy: similar to traction; slight premium for compact motor control
- Regulations: must comply with ASME A17.1 and local electrical codes (NEC-PH for 220 V / 60 Hz installations)

---

## Minimum Car Dimensions & Accessibility

Per PD 1096 and BP 344:

| Parameter | Minimum Requirement | Typical Philippine Office |
|-----------|-------------------|--------------------------|
| Width (door side) | 1.1 m | 1.15 m |
| Depth (perpendicular) | 1.4 m | 1.5 m |
| Car height (interior) | 2.2 m | 2.4 m |
| Door width | 0.8 m | 0.85 m |
| Door height | 2.0 m | 2.1 m |
| Handrails | Required | Both sides, stainless steel |
| Sill height | ≤0.025 m | ≤0.025 m |

At least one elevator must accommodate a wheelchair (2.4 m × 1.8 m car minimum). Emergency communication required per PD 1096 2004 IRR Rule XVIII Sec. 1807 (Machine Rooms & Safety Devices).

---

## Load & Design Verification

[SLATECAMP_UI_BLOCK:ui_0002 component="WikiExamTable" status="preserved"]
Extracted summary:
- Props: headers="{[\"Design Step\", \"Formula / Method\", \"Philippine Reference\"]}", rows="{[[\"1. Occupant Load\", \"1 person per 10 m² (office)\", \"PD 1096 Table 1206-A\"], [\"2. Peak Population\", \"Occupant Load × 0.85 (during 15-min peak)\", \"Industry Standard\"], [\"3. RTT Calculation\", \"2H/V + n×(t_c+t_d) + t_s\", \"ASHRAE 26.1\"], [\"4. Interval Design\", \"RTT / N_e ≤ 40 s (office)\", \"ASME A17.1\"], [\"5. HC Verification\", \"(300 × CC × trips) / Population ≥ 12%\", \"IGCC Elevator Performance\"]]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

---

## Common Design Mistakes & Corrections

[SLATECAMP_UI_BLOCK:ui_0003 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Confusing occupant load (area-based) with peak population (85% of occupant load); this inflates elevator count unnecessarily\", \"Using only one RTT estimate without sensitivity analysis for speed variation; a 0.5 m/s speed change alters RTT by 20–30%\", \"Forgetting to include door times and dwell times in RTT; these account for 40–60% of total RTT in dense office buildings\", \"Treating all floors equally in 'average stops'; high-rise buildings must weight express vs. local service differently\", \"Selecting elevator capacity based only on weight limit (1,000 kg) without verifying persons capacity (13 persons) or HC performance\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

---

## Design Checklist

[SLATECAMP_UI_BLOCK:ui_0004 component="Callout" status="preserved"]
Extracted summary:
- Props: variant="info"
- Text: Before finalizing elevator design: ✓ Confirm occupant load per PD 1096 occupancy type and floor area ✓ Define peak-hour population (typically 85 % of occupant load) ✓ Calculate RTT with realistic speed, stop count, and dwell times ✓ Size number of elevators to achieve 25–40 s interval (office) or 40–60 s (residential) ✓ Verify HC ≥ 12 % for office; ≥ 8 % for residential (or higher based on client service level) ✓ Confirm car dimensions meet PD 1096 minimums and BP 344 accessibility ✓ Select elev
[/SLATECAMP_UI_BLOCK]

---

## Summary

Elevator traffic analysis bridges occupant load and mechanical system design. The core workflow—population → RTT → interval → number of elevators—requires careful attention to floor-to-floor height, speed classification, and dwell time. In Philippine buildings, PD 1096 mandates elevators for 5+ story buildings; start with occupancy type to establish population, then size the system to achieve acceptable interval (25–40 s office, 40–60 s residential) and handling capacity (≥12 % office). Always verify with realistic car capacities (typically 13 persons for 1,000 kg) and document the design basis for permit review.

## Related Articles

See also within HVAC and Mechanical Systems: **lea-util-002-03-core-concept**, **lea-util-002-04-core-concept**, **lea-util-002-05-core-concept**, **lea-util-002-06-core-concept**.

> **Overview:** See **overview-building-utilities-mepf** for the full curriculum structure and study strategy. See **mastery-building-utilities-mepf** for connections across topics.
