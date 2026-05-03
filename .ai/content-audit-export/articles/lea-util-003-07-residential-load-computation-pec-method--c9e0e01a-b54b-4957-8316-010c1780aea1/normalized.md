## What You Need to Know for the LEA

## Learning Goal

Calculate residential electrical loads using the PEC optional method (Section 2.20) — general lighting, small-appliance, laundry, fixed appliances, HVAC, cooking equipment — determine total demand load, and size the service entrance conductors and main disconnect.
## Residential Load Computation (PEC Method)

### Step-by-Step Calculation

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
[SLATECAMP_UI_BLOCK:ui_0003 component="Callout" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **I = P / (V × PF) = 10,920 / (220 × 1.0) = 49.6 A**
[/SLATECAMP_UI_BLOCK]

Wire size: Use 14 AWG (minimum 2.5 mm²) for branch circuits under 20 A; main service requires 35–50 A capacity depending on entrance type (per PEC 230.79 and Meralco regulations).

[SLATECAMP_UI_BLOCK:ui_0004 component="Note" status="preserved"]
Extracted summary:
- Props: (none)
- Text: The demand factor of 40% for the remainder reflects actual usage patterns: kitchens, heating, and entertainment equipment do not all operate at rated capacity simultaneously.
[/SLATECAMP_UI_BLOCK]

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
[SLATECAMP_UI_BLOCK:ui_0005 component="Callout" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **P = √3 × V × I × PF** **I = P / (√3 × V × PF) = 33,575 / (1.732 × 380 × 0.85) = 33,575 / 559.7 = 59.99 A ≈ 60 A**
[/SLATECAMP_UI_BLOCK]

Three-phase service requires 60 A capacity; wire minimum 4 mm² copper per phase (PEC 230.79 and Meralco standard).

[SLATECAMP_UI_BLOCK:ui_0006 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: For three-phase loads, use √3 = 1.732. Power factor (PF) is typically 0.85–0.90 for commercial buildings due to motor and ballast loads.
[/SLATECAMP_UI_BLOCK]

---

## Key Formulas & Conventions

### Single-Phase Power & Current
[SLATECAMP_UI_BLOCK:ui_0007 component="Callout" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **P = V × I (watts)** **I = P / (V × PF) (amperes)**
[/SLATECAMP_UI_BLOCK]

Example: 220V single phase, 5 kW load, PF = 0.95:
- I = 5,000 / (220 × 0.95) = 5,000 / 209 = 23.9 A

### Three-Phase Power & Current
[SLATECAMP_UI_BLOCK:ui_0008 component="Callout" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **P = √3 × V × I × PF (watts)** **I = P / (√3 × V × PF) (amperes)**
[/SLATECAMP_UI_BLOCK]

Example: 380V three phase, 15 kW load, PF = 0.90:
- I = 15,000 / (1.732 × 380 × 0.90) = 15,000 / 591.4 = 25.4 A per phase

### Motor Load Demand (PEC 430.24)
[SLATECAMP_UI_BLOCK:ui_0009 component="Callout" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Motor Demand = 1.25 × (Largest Motor) + 1.0 × (All Others)**
[/SLATECAMP_UI_BLOCK]

If feeder supplies motors rated 5 kW, 3 kW, and 2 kW:
- Motor demand = 1.25 × 5 + 1.0 × (3 + 2) = 6.25 + 5 = 11.25 kW

---

## Inverse Computation: Working Backward from Allowable Current

Sometimes an electrician knows the maximum available supply current and must size the installation:

**Given:** 60 A, three-phase, 380V service with 0.90 PF

**Find:** Maximum allowable demand load

[SLATECAMP_UI_BLOCK:ui_0010 component="Callout" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **P = √3 × V × I × PF = 1.732 × 380 × 60 × 0.90 = 35,846 W = 35.85 kW**
[/SLATECAMP_UI_BLOCK]

This means the building's demand load cannot exceed 35.85 kW without exceeding supply capacity or requiring service upgrade.

---

## Load Computation Verification Checklist

[SLATECAMP_UI_BLOCK:ui_0011 component="WikiExamTable" status="preserved"]
Extracted summary:
- Props: headers="{["Verification Point", "Standard Reference", "Check"]}", rows="{[["Lighting load minimum", "PEC 210.11(B)", "2 VA/sqm residential, per occupancy commercial"], ["Receptacle load", "Meralco + PEC 220.14", "180 VA per outlet, first outlet counted"], ["Demand factor applied", "PEC 220.42 or 220.43", "Residential 40% above 10 kVA, commercial per schedule"], ["Motor sizing", "PEC 430.24", "125% largest + 100% others"], ["Service entrance wire", "PEC 230.79 + Meralco", "Min 3.5 mm² (12 AWG) branch, 4 mm² (10 AWG) main"], ["Power factor assumption", "Meralco rates", "0.95 residential, 0.85–0.90 commercial"], ["Three-phase multiplier", "IEEE 141 / PEC", "√3 = 1.732 used consistently"]]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

---

[SLATECAMP_UI_BLOCK:ui_0001 component="Callout" status="preserved"]
Extracted summary:
- Props: 
- Text: **Demand Factor = Maximum Demand / Total Connected Load**
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0002 component="Callout" status="preserved"]
Extracted summary:
- Props: 
- Text: **Diversity Factor = Sum of Individual Maximum Demands / Maximum System Demand**
[/SLATECAMP_UI_BLOCK]

## Common Mistakes & Corrections

[SLATECAMP_UI_BLOCK:ui_0012 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[{"mistake": "Using connected load as demand load without applying demand factor", "correction": "Always apply PEC demand factors: residential 40% for amount over 10 kVA, commercial per schedule"}", mistake=true, Forgetting=true, to=true, multiply=true, three-phase=true, current=true, by=true, correction=true, Three-phase=true, formula=true, I="P"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

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

[SLATECAMP_UI_BLOCK:ui_0013 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: Meralco demand charges apply monthly based on the highest 15-minute average power draw recorded. Load computation directly affects your utility bill and service plan classification.
[/SLATECAMP_UI_BLOCK]

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


[SLATECAMP_UI_BLOCK:ui_e001 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **ALE Exam Tip — Calculate residential electrical loads using the PEC optiona:** Building Utilities carries the heaviest weight in Area B. Focus on code-specific values (PEC ampacities, Revised Plumbing Code fixture units, NFPA spacing requirements) and regulatory triggers (when is a fire alarm mandatory? when is seismic bracing required?). Practice load computations and system sizing problems which appear regularly on the exam.
[/SLATECAMP_UI_BLOCK]
