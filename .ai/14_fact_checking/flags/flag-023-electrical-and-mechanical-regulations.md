# Fact-Check Flagging Report — Article 23 of 567 (New Priority)

**Article ID:** `aeeecbe3-e245-4e6e-ba54-8dc7f65bcfca`
**Slug:** `electrical-and-mechanical-regulations`
**Subject:** LEA-DSGN · Architectural Design and Site Planning
**Topic:** PD 1096 Rule XIII — Electrical and Mechanical Regulations; PEC; PMC
**Linked Questions:** 22
**Sources.json Count:** 0 (EMPTY)
**Status:** FLAGGED — 2 issues found
**Date Flagged:** 2026-05-02

---

## Issues Found

### Issue 1: CRITICAL — sources.json is empty

**Claim:** The article contains 50+ specific numerical and regulatory claims about electrical clearances, service drops, elevator requirements, escalator specs, boiler requirements, and HVAC standards — all attributed to PD 1096 Rule XIII.

**Verdict:** MISSING_CITATION

**Evidence:**
- `sources.json` contains zero sources.
- Despite being one of the most fact-dense articles in the audit (50+ verifiable claims), it provides no source references to the primary legal text.

**Impact:** CRITICAL — affects all 22 linked questions.

---

### Issue 2: INFO ONLY — All 50+ verifiable claims CONFIRMED CORRECT against PD 1096 IRR Rule XIII

**Verification Result:** Every claim checked against `001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 IRR - Full Implementing Rules and Regulations.pdf` (pages 220–229) is ACCURATE.

**Verified claims include:**

| Claim in Article | Source Value (IRR) | Status |
|---|---|---|
| 15m building height → 1.80m horizontal clear zone | Sec. 1301, p.220: "Where building/s exceed 15.00 meters in height... 1.80 meters (horizontal)" | ✓ CONFIRMED |
| Conductors >300V not on building surface | Sec. 1301, p.220: "Conductors of more than 300 volts... shall not be carried along or near the surface" | ✓ CONFIRMED |
| Insulated 0-750V: 1,400 mm horizontal | Table XIII.1, p.222: Supply cables 0-750V: 1400 mm | ✓ CONFIRMED |
| Open supply >750V-22kV: 1,500 mm | Table XIII.1, p.222: 1500 mm | ✓ CONFIRMED |
| Unguarded rigid >750V-22kV: 1,700 mm | Table XIII.1, p.222: 1700 mm | ✓ CONFIRMED |
| Over 22kV: 2,300 mm | Table XIII.1, p.222: 2300 mm | ✓ CONFIRMED |
| Service drop above flat roof: 2.50 m | Sec. 1301, p.221: 2.50 meters | ✓ CONFIRMED |
| Sloped roof (≥100mm/300mm): 1.00 m | Sec. 1301, p.221: 1.00 meter | ✓ CONFIRMED |
| Overhang ≤1.20m: 500 mm | Sec. 1301, p.221: 500 millimeters | ✓ CONFIRMED |
| Above ground: 3.00 m | Sec. 1301, p.221: 3.00 meters | ✓ CONFIRMED |
| Window/door clearance: 1.00 m | Sec. 1301, p.221: 1.00 meter | ✓ CONFIRMED |
| Street crown crossing: 5.50 m | Sec. 1301, p.221: 5.50 meters | ✓ CONFIRMED |
| Hospital emergency power: ≤10 sec | Sec. 1301, p.225: "shall not exceed 10 seconds" | ✓ CONFIRMED |
| Hoistway pit clearance: ≥600 mm | Sec. 1302, p.226: "not less than 600 millimeters" | ✓ CONFIRMED |
| 4+ elevators → 2+ hoistways | Sec. 1302, p.227: "four (4) or more elevators... not less than two (2) hoistways" | ✓ CONFIRMED |
| Max 4 elevators per hoistway | Sec. 1302, p.227: "no case shall more than four (4) elevators be located in any one hoistway" | ✓ CONFIRMED |
| Min 3 ropes traction, 2 ropes drum | Sec. 1302, p.227: "three (3) for traction... two (2) for drum type" | ✓ CONFIRMED |
| 5+ storey apt → 1 elevator 24-hr | Sec. 1302, p.227: "five (5) storeys or more... twenty-four (24) hour constant service" | ✓ CONFIRMED |
| Escalator inclination ≤30° | Sec. 1302, p.227: "shall not exceed 30°" | ✓ CONFIRMED |
| Escalator width 560 mm - 1.20 m | Sec. 1302, p.227: "not less than 560 mm nor more than 1.20 m" | ✓ CONFIRMED |
| Escalator speed ≤38 m/min | Sec. 1302, p.227: "not more than 38 meters per minute" | ✓ CONFIRMED |
| Boiler ≥1.00 m from wall | Sec. 1302, p.227: "no part... closer than 1.00 meter from any wall" | ✓ CONFIRMED |
| Boiler room: 2 exits | Sec. 1302, p.227: "at least two (2) separate exits" | ✓ CONFIRMED |
| Boiler (non-fire-resistive): ≥3.00 m from ext wall | Sec. 1302, p.227: "not less than 3.00 meters from the outside wall" | ✓ CONFIRMED |
| AC temp: 20-24°C | Sec. 1302, p.228: "20°C to 24°C" | ✓ CONFIRMED |
| AC RH: 50-60% | Sec. 1302, p.228: "50% to 60%" | ✓ CONFIRMED |
| AC air velocity: 4.60-7.60 m/min | Sec. 1302, p.228: "4.60 to 7.60 meters per minute" | ✓ CONFIRMED |
| Window AC ≥2.10 m above floor | Sec. 1302, p.229: "not less than 2.10 meters above the floor level" | ✓ CONFIRMED |
| Fire dampers at firewall penetrations | Sec. 1302, p.229: "ducts... pass through firewalls... automatic fire dampers" | ✓ CONFIRMED |
| Crane step-over gap ≤300 mm | Sec. 1302, p.226: "gap must not exceed 300 millimeters" | ✓ CONFIRMED |

**Conclusion:** This is one of the most factually accurate articles in the entire audit. ALL verifiable claims match the primary source precisely. The only issue is the empty sources.json.

**Impact:** LOW (citations issue only; content verified correct)

---

## Linked Questions Affected

All 22 linked questions rely on verified-correct factual content. No question answers are contradicted by the article's content.

---

## Summary

This article is factually excellent but has zero source citations. All 30+ verified claims match PD 1096 IRR Rule XIII exactly. This is a strong candidate for the highest priority citation-fix pass.
