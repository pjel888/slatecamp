# Council Remediation — 2026-07-20

Bundle: `lea-util-003-07-residential-load-computation-pec-method--c9e0e01a-b54b-4957-8316-010c1780aea1`
Agent: Agent J (question-edit remediation writer)
Status: **APPLIED**

## Source finding remediated

- **ERROR G1 (CRITICAL)** (from Agent G, residual streams): 7 of 15 marked-correct answers failed basic arithmetic. The model-generated rationales themselves admitted several errors. Each value was independently recomputed by Agent J before writing.

## Independent recomputation (Agent J, 2026-07-20)

All seven corrections match Agent G's values. Detailed work shown for each.

### Q1 `705ce4dd` — additional demand load
- Max apparent power at 75 A, 380 V 3-phase: S = sqrt(3) x V x I = 1.732 x 380 x 75 = **49,362 VA**
- Max real power at 0.89 PF: P_max = S x PF = 49,362 x 0.89 = **43,932 W (~43.9 kW)**
- Additional = 43.9 - 35 = **8.9 kW** (matches Agent G)
- Original "17.2 kW" used an incorrect denominator. CONFIRMED.

### Q6 `661764c3` — warehouse connected load
- Lighting 600 sqm x 1 VA/sqm = 600 VA
- 10 receptacles x 180 VA = 1,800 VA
- 2 kW motor = 2,000 VA
- Total = 600 + 1,800 + 2,000 = **4,400 VA** (matches Agent G). CONFIRMED.

### Q9 `3b341a32` — diversity factor
- Diversity factor = (12 + 10 + 9.5 + 8.5) / 32 = 40 / 32 = **1.25** (matches Agent G). CONFIRMED.

### Q10 `56093fda` — residential connected load
- Lighting 180 x 2 = 360; small appliance 3 x 1,500 = 4,500; laundry 1,500; water heater 3,500; AC 2,200; outlets 35 x 180 = 6,300
- Total = 360 + 4,500 + 1,500 + 3,500 + 2,200 + 6,300 = **18,360 VA** (matches Agent G; the original rationale itself admitted this). CONFIRMED.

### Q11 `89f0062e` — commercial connected load
- Lighting 500 x 5 = 2,500; 200 receptacles x 180 = 36,000; water heater 8,000; HVAC motor 5,000
- Total = 2,500 + 36,000 + 8,000 + 5,000 = **51,500 VA** (matches Agent G; the original rationale itself admitted this). CONFIRMED.

### Q12 `16a4cdf8` — PEC 220.42 tiered demand (the most important fix)
- The original rationale used a wrong tier structure ("first 10,000 @ 100%, rest @ 40%").
- PEC 220.42 (mirroring NEC Table 220.42) dwelling demand factors: **first 3,000 VA @ 100%, next 117,000 VA (3,001-120,000) @ 35%, remainder above 120,000 @ 25%**.
- For 22,000 VA: 3,000 + (19,000 x 0.35) = 3,000 + 6,650 = **9,650 VA** (matches Agent G). CONFIRMED.

### Q13 `37255c0a` — three-phase feeder current
- I = P / (sqrt(3) x V x PF) = 62,000 / (1.732 x 380 x 0.87) = 62,000 / **572.6** = **108.3 A** (matches Agent G)
- The original rationale computed the denominator as 537.0 (arithmetic error), giving the wrong 115.6 A. CONFIRMED.

## Discrepancies with Agent G

**None.** All seven council-recomputed values equal Agent G's listed corrections.

## Question-edit files written (status APPLIED)

| Question UUID | Council Q# | Error | Correction |
| --- | --- | --- | --- |
| `705ce4dd-594b-4812-8ecc-09a075b9b90c` | Q1 | G1 | 17.2 kW -> **8.9 kW** |
| `661764c3-d7a9-43fb-bef4-662aa28d99e4` | Q6 | G1 | 4,600 VA -> **4,400 VA** |
| `3b341a32-f51c-4426-98d1-f00b2fcd399c` | Q9 | G1 | 1.35 -> **1.25** |
| `56093fda-9f27-483b-a526-efcac8952184` | Q10 | G1 | 21,360 VA -> **18,360 VA** |
| `89f0062e-92dc-411c-9f07-7c02ed8b32f0` | Q11 | G1 | 58,500 VA -> **51,500 VA** |
| `16a4cdf8-648e-4735-8f4d-ccbb9edb522d` | Q12 | G1 | 18,800 VA -> **9,650 VA** (PEC 220.42 tiered demand) |
| `37255c0a-4467-48c3-a0ae-4836fd46b83b` | Q13 | G1 | 115.6 A -> **108.3 A** |

All JSON validated with `jq empty`. No edits were made to `normalized.md`, `candidate.md`, `original.md`, or `linked-questions.json`.
