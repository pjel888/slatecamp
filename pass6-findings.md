# PASS 6 Cross-Linking Check — Findings

## FINDING 1: Ceiling Height Cascade is CODIFIED, not a "reviewer heuristic"
**Source:** Rule VIII Sec. 805 (extracted from RULE VIII - LIGHT & VENTILATION.pdf)
**Actual text:** "Habitable rooms provided with artificial ventilation shall have ceiling heights not less than 2.40 meters... provided that for buildings of more than one (1) storey, the minimum ceiling height of the first storey shall be 2.70 meters and that for the second story 2.40 meters and the succeeding stories shall have an unobstructed typical head-room clearance of not less than 2.10 meters above the finished floor. Above-stated rooms with natural ventilation shall have ceiling heights of not less than 2.70 meters."

**Article that says it wrong:** pd-1096-rule-viii-light-and-ventilation--cb947ab1/normalized.md
Lines 69 and 177-178 claim the cascade is a "reviewer pattern" not in code. This is INCORRECT.
**Fix:** Correct to state the cascade IS explicitly in Sec. 805.

## FINDING 2: Setbacks "Quick PSO Reference" table has WRONG values
**Source:** pd-1096-rule-vii-area-metrics--85bcd328/normalized.md (Table VIII.1 verified values)
**Article with errors:** pd-1096-rule-viii-setbacks-and-easements--859b1a7f/normalized.md
Lines 510-518 show a "Quick PSO Reference" table with wrong values:
- Com-1 PSO: says 80/80 → SHOULD be 70/80 (from verified Table VIII.1)
- Institutional TOSL: says "40 / 50" but should be 50 / 40 (without firewall TOSL=50%, with firewall TOSL=40%)
- Column headers and data structure are garbled/misaligned

## FINDING 3: Occupancy Group Labels in Egress Article Table XII.1
**Source:** The PD 1096 Occupancy article (from source RULE VII_701 OCCUPANCY CLASSIFIED.pdf) defines:
- Group C = Education and Recreation
- Group E = Business and Mercantile
- Group H = Assembly (less than 1000)
- Group I = Assembly (1000 or more)

The Egress article Table XII.1 uses different group labels:
- "EDUCATIONAL & LABORATORIES (Group E)" → should be Group C
- "INSTITUTIONAL (Group H)" → should be Group D
- "BUSINESS & MERCANTILE (Group F)" → should be Group E
- "INDUSTRIAL & STORAGE (Groups G, I)" → garbled
- "ASSEMBLY (Group C)" → should be Groups H/I

Note: Table XII.1 in the IRR may use its own cross-reference groupings different from Sec. 701. Since the actual Table XII.1 in the IRR PDF is a graphic image and can't be extracted as text, I will flag this but make minimal changes — adding a caution note rather than changing values that might come from the actual table.

## FINDING 4: Handrail height inconsistency across articles
**PD 1096 Rule XII (Egress article):** Line 357: Handrail height = 800-900 mm above tread nosing
**BP 344 Ramp article:** Line 135: Dual handrails at 700 mm and 900 mm
**BP 344 Accessible Washrooms:** Line 137: Mentions "dual handrails at 700mm and 900mm"
**PD 1096 Rules:** 800-900mm for stairs (Rule XII)
**BP 344:** 700/900mm dual for accessible ramps
These are NOT conflicting — they apply to different situations. PD 1096 covers general stair handrails, BP 344 covers accessible ramp handrails. This is correct.

## FINDING 5: BP 344 Accessible Washroom — Guardrail height reference to PD 1096
Line 137: "Guard rails in PD 1096 (Rule XII, 1100mm min)" — This is correct based on the egress article guard-rail provision.

## FINDING 6: Area Metrics Section Reference issue
**Height Limits article**, Line 440: cites "PSO, TOSL, AMBF formulas | Rule VIII, Sec. 802–803"
**Area Metrics article** consistently cites Sec. 803 for PSO/AMBF/TOSL.
Section 802 may not exist as a standalone section in Rule VIII for these metrics. The full reference should be Sec. 803.

## FINDING 7: Table VII.1 vs VIII.1 cross-reference
**Height Limits:** Line 40: PSO cited to "Rule VIII, Sec. 803; Table VII.1 / Table VIII.1"
**Area Metrics:** Lines 122-130 clarify that Table VIII.1 provides firewall-based PSO, Table VII.1 provides lot-type-based PSO.
**Issue:** The Height Limits article doesn't make this distinction clear enough.

## FINDING 8: BP 344 Ramp — Landing interval inconsistency
Line 51: "Landing interval: 10.00 m between landings" for 1:15
But Line 68-69 explains: "10.50 m = absolute max run, 10.00 m = interval for intermediate landing even if not at max rise"
This is self-consistent in the article (both values appear with explanation), so no fix needed.

## FINDING 9: Conflicting Section number references
**Light & Ventilation article** cites Sections 804-809 which are correct.
**Setbacks article** heavily uses [web:2] etc. references that are not consistent with the [file:xx] format used by other articles. This is a citation format inconsistency.

## FINDING 10: BP 344 vs PD 1096 Conflicts article — Corridor width statements
Line 67: "your provided PD 1096 text does NOT show a numeric 1.10 m corridor width"
But the Egress article (Rule XII, Section 1207) DOES state "Every corridor or exit balcony shall not be less than 1.10 meters in width" (line 291).
This is a cross-reference issue — the conflicts article was written without knowing what the egress article says.

## FINDING 11: Table VIII.1 Quick Reference non-residential PSO — missing values
The Setbacks article Quick PSO Reference (lines 514-518) has some values that don't match the verified Area Metrics article Table VIII.1:
- R-1 and R-2 show "—" for PSO when they should have values
- Commercial 2 has garbled dual-column entries
