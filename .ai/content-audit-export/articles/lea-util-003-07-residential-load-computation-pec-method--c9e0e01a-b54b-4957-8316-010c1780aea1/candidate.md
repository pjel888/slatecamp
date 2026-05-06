

## Board Exam Quick Check

Before memorizing details from this topic, state the task in one sentence: what concept is being identified, compared, sequenced, or applied? Then anchor your answer to the article's stated scope and avoid importing details from a different topic.

**Common mistake:** treating a familiar keyword in **Lea Util 003 07 Residential Load Computation Pec Method** as enough to answer. For exam practice, first identify the exact concept being asked, then choose the option that matches that concept.
## What You Need to Know for the LEA

## Learning Goal

Calculate residential electrical loads using the PEC optional method (Section 2.20) — general lighting, small-appliance, laundry, fixed appliances, HVAC, cooking equipment — determine total demand load, and size the service entrance conductors and main disconnect.
## Residential Load Computation (PEC Method)

### Step-by-Step Calculation

<ArticleMedia id="media-lea-util-003-07-residential-load-computa" type="image" caption="Residential Load Calculation Workflow — Connected Load to Service Size" description="Step-by-step workflow diagram: Lighting (2 VA/sqm × area) + Small appliance circuits (3 × 1500 VA) + Laundry (1500 VA) + Fixed appliances → Total Connected Load → Apply demand factor (first 10,000 VA at 100%, remainder at 40% per PEC 220.42) → Demand Load → Service current calculation at 220V → Wire size and main breaker selection. Example 12,300 VA house yielding 10.92 kW demand shown." suggestedAsset="Diagram or reference image" status="placeholder" />


**Step 1: Calculate Connected Load**
Sum all permanently installed equipment:
- Lighting: floor area (sqm) × 2 VA/sqm (minimum, PEC 210.11(B))
- Small appliance circuits: 3 × 1,500 VA = 4,500 VA (PEC 210.11(C)(1))
- Laundry: 1 × 1,500 VA = 1,500 VA (PEC 210.11(C)(2))
- Water heater: nameplate rating
- Air conditioning/heating: nameplate rating
- Convenience outlets: 180 VA per outlet (Meralco standard, first outlet only counts in computation)

**Step 2: Apply Residential Demand Factor (PEC 220.42)**

| Load Range | Demand Factor |
|---|---|
| First 10,000 VA | 100% |
| Remainder | 40% |

**Step 3: Add Motor Loads Separately (PEC 430.24)**

For motors, demand = 125% of largest motor + 100% of all other motors.

### Worked Example: Residential House

A residential dwelling has:
- Floor area: 150 sqm
- Lighting: 150 × 2 = 300 VA
- Small appliance circuits: 3 × 1,500 = 4,500 VA
- Laundry circuit: 1,500 VA
- Water heater: 3,000 VA (single phase, 220V)
- Air conditioner: 2,000 VA
- **Total Connected Load: 12,300 VA**

Applying demand factor:
- First 10,000 VA @ 100% = 10,000 VA
- Remaining 2,300 VA @ 40% = 920 VA
- **Demand Load: 10,920 VA = 10.92 kW**

Current (single phase, 220V, assuming unity PF):
<Callout>
**I = P / (V × PF) = 10,920 / (220 × 1.0) = 49.6 A**
</Callout>

Wire size: Use 14 AWG (minimum 2.5 mm²) for branch circuits under 20 A; main service requires 35–50 A capacity depending on entrance type (per PEC 230.79 and Meralco regulations).

<Note>
The demand factor of 40% for the remainder reflects actual usage patterns: kitchens, heating, and entertainment equipment do not all operate at rated capacity simultaneously.
</Note>

---

## Commercial Load Computation (PEC Method)

### Step-by-Step Calculation

**Step 1: Lighting Load**

PEC 220.12 specifies minimum lighting demand by occupancy:

| Occupancy Type | VA per sqm |
|---|---|
| Office space | 5 VA/sqm |
| Retail | 7.5 VA/sqm |
| Warehouse | 1 VA/sqm |
| Corridors/common area | 1 VA/sqm |

**Step 2: Receptacle (Convenience Outlet) Load**

- Each 180 VA per outlet (Meralco standard, PEC 220.14(I))
- Typical office: 1 outlet per 2.5 sqm minimum

**Step 3: Motor and Equipment Load**

Sum all nameplate ratings for HVAC, water pumps, elevators, etc.

**Step 4: Apply Commercial Demand Factor (PEC 220.43)**

Commercial buildings typically use 100% demand for the first 5 kW, then 75% for the remainder. However, specific demand factors vary by building type and are found in PEC Article 220 schedules. For computation purposes, many designers use 80–90% demand factor conservatively.

### Worked Example: Small Commercial Office

A 400 sqm office building has:
- Lighting: 400 sqm × 5 VA/sqm = 2,000 VA
- Receptacles: 400 / 2.5 = 160 outlets × 180 VA = 28,800 VA
- Water heater: 5,000 VA (three phase, 380V)
- Small air handler motor: 3,700 W (nameplate)
- **Total Connected Load: 39,500 VA**

Applying commercial demand factor (85% conservative estimate):
- Demand Load = 39,500 × 0.85 = 33,575 VA = 33.575 kW

Current (three phase, 380V, 0.85 PF typical for commercial):
<Callout>
**P = √3 × V × I × PF**
**I = P / (√3 × V × PF) = 33,575 / (1.732 × 380 × 0.85) = 33,575 / 559.7 = 59.99 A ≈ 60 A**
</Callout>

Three-phase service requires 60 A capacity; wire minimum 4 mm² copper per phase (PEC 230.79 and Meralco standard).

<Tip>
For three-phase loads, use √3 = 1.732. Power factor (PF) is typically 0.85–0.90 for commercial buildings due to motor and ballast loads.
</Tip>

---

## Key Formulas & Conventions

### Single-Phase Power & Current
<Callout>
**P = V × I (watts)**
**I = P / (V × PF) (amperes)**
</Callout>

Example: 220V single phase, 5 kW load, PF = 0.95:
- I = 5,000 / (220 × 0.95) = 5,000 / 209 = 23.9 A

### Three-Phase Power & Current
<Callout>
**P = √3 × V × I × PF (watts)**
**I = P / (√3 × V × PF) (amperes)**
</Callout>

Example: 380V three phase, 15 kW load, PF = 0.90:
- I = 15,000 / (1.732 × 380 × 0.90) = 15,000 / 591.4 = 25.4 A per phase

### Motor Load Demand (PEC 430.24)
<Callout>
**Motor Demand = 1.25 × (Largest Motor) + 1.0 × (All Others)**
</Callout>

If feeder supplies motors rated 5 kW, 3 kW, and 2 kW:
- Motor demand = 1.25 × 5 + 1.0 × (3 + 2) = 6.25 + 5 = 11.25 kW

---

## Inverse Computation: Working Backward from Allowable Current

Sometimes an electrician knows the maximum available supply current and must size the installation:

**Given:** 60 A, three-phase, 380V service with 0.90 PF

**Find:** Maximum allowable demand load

<Callout>
**P = √3 × V × I × PF = 1.732 × 380 × 60 × 0.90 = 35,846 W = 35.85 kW**
</Callout>

This means the building's demand load cannot exceed 35.85 kW without exceeding supply capacity or requiring service upgrade.

---

## Load Computation Verification Checklist

<WikiExamTable headers={["Verification Point", "Standard Reference", "Check"]} rows={[["Lighting load minimum", "PEC 210.11(B)", "2 VA/sqm residential, per occupancy commercial"], ["Receptacle load", "Meralco + PEC 220.14", "180 VA per outlet, first outlet counted"], ["Demand factor applied", "PEC 220.42 or 220.43", "Residential 40% above 10 kVA, commercial per schedule"], ["Motor sizing", "PEC 430.24", "125% largest + 100% others"], ["Service entrance wire", "PEC 230.79 + Meralco", "Min 3.5 mm² (12 AWG) branch, 4 mm² (10 AWG) main"], ["Power factor assumption", "Meralco rates", "0.95 residential, 0.85–0.90 commercial"], ["Three-phase multiplier", "IEEE 141 / PEC", "√3 = 1.732 used consistently"]]} />

---

<Callout>
**Demand Factor = Maximum Demand / Total Connected Load**
</Callout>

<Callout>
**Diversity Factor = Sum of Individual Maximum Demands / Maximum System Demand**
</Callout>

## Common Mistakes & Corrections

<WikiMistakeList mistakes={[{"mistake": "Using connected load as demand load without applying demand factor", "correction": "Always apply PEC demand factors: residential 40% for amount over 10 kVA, commercial per schedule"}, {"mistake": "Forgetting to multiply three-phase current by √3", "correction": "Three-phase formula: I = P / (√3 × V × PF). Single phase: I = P / (V × PF)"}, {"mistake": "Assuming all receptacles count as 180 VA each", "correction": "Meralco practice counts only the first outlet; additional outlets in same room may share load allocation"}, {"mistake": "Not applying 125% multiplier to largest motor in feeder circuit", "correction": "PEC 430.24 requires 1.25 × largest motor + 1.0 × all others for feeder demand"}, {"mistake": "Using power factor of 1.0 for commercial calculations", "correction": "Commercial PF typically 0.85–0.90 due to motors, transformers, and ballasts. Use 0.95 minimum for residential"}]} />

---

## Philippine Context: Meralco Standard Loads

Meralco (Manila Electric Company) defines standard appliance loads for billing classification:

| Appliance / Load | Standard Rating |
|---|---|
| Residential receptacle | 180 VA |
| Lighting (general area) | 2–7 VA/sqm (by space type) |
| Air conditioner (window, 1 HP) | 1,200 VA |
| Water heater (electric, typical) | 3,000 VA |
| Refrigerator | 600 VA |
| Clothes iron | 1,000 VA |
| Electric fan | 100 VA |
| Three-phase motor (per 0.75 kW) | 750 W nameplate |

<Warn>
Meralco demand charges apply monthly based on the highest 15-minute average power draw recorded. Load computation directly affects your utility bill and service plan classification.
</Warn>

---

## Next Steps

- Verify demand factors against the specific PEC Article 220 schedule for your building occupancy
- Confirm motor and equipment nameplates match your load calculation
- Have a licensed electrician (Master Electrician or Professional Electrician under PEC) review calculations before submitting to Bureau of Fire Protection or local building authority
- Coordinate with Meralco early for large buildings (>50 kW) to confirm service availability and transformer sizing

---

## Related Articles

- LEA-UTIL-003-01: Voltage and Frequency Standards in the Philippines
- LEA-UTIL-003-02: Wire Sizing and Ampacity Tables
- LEA-UTIL-003-06: Power Factor and Reactive Power
- LEA-UTIL-003-08: Service Entrance and Meter Installation

