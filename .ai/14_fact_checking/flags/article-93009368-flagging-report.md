# Fact-Check Flagging Report — Article 5 of 568 (Priority 4)

**Article ID:** `93009368-9041-46e0-b93b-8786100311be`
**Slug:** `pd-1096-rule-xii-egress-and-corridors`
**Subject:** LEA-DSGN · Architectural Design and Site Planning
**Topic:** PD 1096 — Rule XII, Section 1207 — Stairs, Exits, and Occupant Loads
**Linked Questions:** 41
**Sources.json Count:** 0 (EMPTY — no cited sources in structured sources.json)
**Status:** FLAGGED — 1 issue found
**Date Flagged:** 2026-05-02
**Flagged By:** Hermes AI (Kimi 2.6)
**Method:** Read-only analysis verified against actual PD 1096 2004 Revised IRR text extracted from local PDFs in `001_Raw-Source-Layer/001-Laws/PD-1096/`.

Primary sources accessed:
- `PD 1096 IRR - Full Implementing Rules and Regulations.pdf` (432 pages)
  - Page 196-197: Section 1207(1) Occupant Loads & Table XII.1
  - Page 197-198: Section 1207(2) Exits — number, width, arrangement, distance
  - Page 198: Section 1207(3) Doors
  - Page 199: Section 1207(4) Corridors & Exterior Exit Balconies
  - Page 199-200: Section 1207(5) Stairways (width, rise/run, landings, handrails)
  - Page 201: Section 1207(7) Horizontal Exits; Section 1207(8) Exit Enclosures
  - Page 196: Section 1207(1)(d) Changes in Elevation; Section 1207(1)(c) Posting of Room Capacity

---

## Summary

This is a **thorough and accurate** article covering Rule XII, Section 1207 of PD 1096. **All 50+ individual rules, dimensions, and thresholds** have been verified against the actual IRR text and match exactly.

**1 issue found:** MISSING_CITATION (HIGH) — empty `sources.json`.

---

## Flag 1: MISSING CITATIONS / EMPTY SOURCES

**Category:** MISSING_CITATION
**Impact:** HIGH
**Location:** `sources.json`
**Issue:** `sources.json` shows `"source_count": 0, "sources": []` despite the article citing `[web:XX]` tags throughout (referring to an external web citations file) and ending with a detailed "Audit Log" section.

**Note:** The article uses extensive `[web:20]`, `[web:22]`, `[web:24]`, `[web:26]`, `[web:27]`, `[web:29]` citation tags throughout the body, suggesting an external citations file exists. These citations have not been verified against their original web sources in this pass. However, the numerical claims have all been verified against the primary source (IRR PDF) and are correct.

**Recommended Action:** Populate `sources.json` with PD 1096 and IRR Rule XII, Section 1207 references.

---

## Verified Correct Claims

### Table XII.1 — Occupant Load Factors — ALL VERIFIED

| Occupancy | Unit Area (sq.m) | Min 2 Exits | IRR Page | Status |
|-----------|:----------------:|:-----------:|:--------:|:------:|
| Dwellings | 28.00 | 10 | 196 | ✓ |
| Hotels | 18.60 | 10 | 196 | ✓ |
| Apartments | 18.60 | 10 | 196 | ✓ |
| Dormitories | 18.60 | 10 | 196 | ✓ |
| Classrooms | 1.80 | 50 | 196 | ✓ |
| Conference Rooms | 1.40 | 50 | 196 | ✓ |
| Exhibit Rooms | 1.40 | 50 | 196 | ✓ |
| Gymnasia | 1.40 | 50 | 196 | ✓ |
| School Shops | 4.60 | 50 | 196 | ✓ |
| Vocational Institutions | 4.60 | 50 | 196 | ✓ |
| Laboratories | 4.60 | 50 | 196 | ✓ |
| Hospitals, Sanitaria | 8.40 | 5 | 196 | ✓ |
| Nursing Homes | 7.40 | 5 | 196 | ✓ |
| Children's Homes | 7.40 | 5 | 196 | ✓ |
| Homes for the Aged | 7.40 | 5 | 196 | ✓ |
| Nurseries for Children | 3.25 | 6 | 196 | ✓ |
| Offices | 9.30 | 30 | 197 | ✓ |
| Stores — Basement | 2.80 | 50 | 197 | ✓ |
| Stores — Ground Floor | 2.80 | 50 | 197 | ✓ |
| Stores — Upper Floors | 5.60 | 10 | 197 | ✓ |
| Drinking Establishments | 1.40 | 30 | 197 | ✓ |
| Kitchens (Commercial) | 18.60 | 50 | 197 | ✓ |
| Aircraft Hangars | 46.50 | 10 | 197 | ✓ |
| Parking Garages | 18.60 | 30 | 197 | ✓ |
| Warehouses | 28.00 | 30 | 197 | ✓ |
| Mechanical Equipment Rooms | 28.00 | 30 | 197 | ✓ |
| Garages | 9.30 | 10 | 197 | ✓ |
| Auditoriums, Theaters, Churches | 0.65 | 50 | 197 | ✓ |
| Dance Floors, Reviewing Stands, Stadia | 0.65 | 50 | 197 | ✓ |

### Exit Requirements — ALL VERIFIED

| Rule | Claim | IRR Source | Status |
|------|-------|-----------|:------:|
| Baseline minimum exits | 1 per building/floor | Page 197, Sec. 1207(2)(a) | ✓ |
| > 10 OL above 1st storey | 2 exits | Page 197 | ✓ |
| Any floor above 2nd storey | 2 exits | Page 197 | ✓ |
| Basement/cellar non-service | 2 exits | Page 197 | ✓ |
| Mezzanine > 185 sq.m or > 18 m | 2 stairways | Page 197 | ✓ |
| OL 500-999 | 3 exits | Page 197 | ✓ |
| OL 1,000+ | 4 exits | Page 198 | ✓ |
| Exit width formula | OL ÷ 165 = width (m) | Page 197, Sec. 1207(2)(b) | ✓ |
| Stacking 50% from 1st floor above | ✓ | Page 197 | ✓ |
| Stacking 25% from 2nd floor above | ✓ | Page 197 | ✓ |
| Exit separation: 2 exits | ≥ 1/5 perimeter | Page 198, Sec. 1207(2)(c) | ✓ |
| Exit separation: 3+ exits | Reasonable distance apart | Page 198 | ✓ |
| Travel distance (no sprinklers) | 45.00 m | Page 198, Sec. 1207(2)(d) | ✓ |
| Travel distance (with sprinklers) | 60.00 m | Page 198 | ✓ |

### Door Requirements — ALL VERIFIED

| Rule | Claim | IRR Source | Status |
|------|-------|-----------|:------:|
| Min door width | 900 mm | Page 198, Sec. 1207(3)(c) | ✓ |
| Min door height | 2.00 m | Page 198 | ✓ |
| Max door leaf width | 1.20 m | Page 198, Sec. 1207(3)(d) | ✓ |
| Min clear width at 90° | 700 mm | Page 198, Sec. 1207(3)(c) | ✓ |
| Door swing when OL ≥ 50 | Outward | Page 198, Sec. 1207(3)(a) | ✓ |
| Double-acting door OL limit | Not > 100 | Page 198 | ✓ |
| Double-acting view panel | ≥ 1,300 sq.cm | Page 198 | ✓ |

### Corridor Requirements — ALL VERIFIED

| Rule | Claim | IRR Source | Status |
|------|-------|-----------|:------:|
| Min corridor width | 1.10 m | Page 199, Sec. 1207(4)(a) | ✓ |
| Trim/door reduction limit | ≤ 200 mm | Page 199, Sec. 1207(4)(b) | ✓ |
| Door reduction limit | ≤ 1/2 corridor width | Page 199 | ✓ |
| Max dead-end corridor | 6.00 m | Page 199, Sec. 1207(4)(d) | ✓ |
| Corridor fire-resistance | 1-hour minimum | Page 199, Sec. 1207(4)(e) | ✓ |

### Stairway Requirements — ALL VERIFIED

| Rule | Claim | IRR Source | Status |
|------|-------|-----------|:------:|
| Width when OL > 50 | 1.10 m | Page 199, Sec. 1207(5)(a) | ✓ |
| Width when OL ≤ 50 | 0.90 m | Page 199 | ✓ |
| Private stairs (OL < 10) | 0.75 m | Page 199 | ✓ |
| Handrail/trim reduction limit | ≤ 100 mm | Page 199 | ✓ |
| Max riser height | 200 mm | Page 199, Sec. 1207(5)(b) | ✓ |
| Min tread depth (run) | 250 mm | Page 199 | ✓ |
| Max variation per flight | 5 mm | Page 199 | ✓ |
| Landing depth | = stair width | Page 200, Sec. 1207(5)(e) | ✓ |
| Max landing depth | 1.20 m (straight run) | Page 200 | ✓ |
| Max vertical rise between landings | 3.60 m | Page 200, Sec. 1207(5)(g) | ✓ |
| Min headroom | 2.00 m | Page 201, Sec. 1207(5)(l) | ✓ |
| Door onto landing reduction | ≤ 100 mm | Page 200, Sec. 1207(5)(e) | ✓ |
| Handrails: both sides | ✓ | Page 200, Sec. 1207(5)(h) | ✓ |
| Intermediate handrail: > 3.00 m wide | Every 3.00 m | Page 200 | ✓ |
| Handrail height | 800-900 mm | Page 200 | ✓ |
| ≤ 1.10 m wide: one handrail | ✓ | Page 200 | ✓ |
| < 4 risers: no handrail | ✓ | Page 200 | ✓ |

### Other Requirements — ALL VERIFIED

| Rule | Claim | IRR Source | Status |
|------|-------|-----------|:------:|
| Horizontal exit FR rating | ≥ 1-hour | Page 201, Sec. 1207(7) | ✓ |
| Dispersion area: ambulatory | 0.30 sq.m/person | Page 201 | ✓ |
| Dispersion area: non-ambulatory | 1.90 sq.m/person | Page 201 | ✓ |
| Elevation change < 300 mm, OL≥10 | Must be ramp | Page 196, Sec. 1207(1)(d) | ✓ |
| Exception: Group A | Steps allowed | Page 196 | ✓ |
| Room capacity posting threshold | OL > 50 | Page 196, Sec. 1207(1)(c) | ✓ |

---

## Conclusion

This article is **factually accurate and well-structured**. All claims verified against the actual IRR text. The only issue is the empty `sources.json`.

**Risk Assessment:** LOW — Article is safe for candidates to study.

**Recommended Action:** Populate `sources.json` with PD 1096 Rule XII, Section 1207 references.

---

*Report generated: 2026-05-02*
*Primary source: PD 1096 2004 Revised IRR, extracted from `001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 IRR - Full Implementing Rules and Regulations.pdf`*
