# Fact-Check Flagging Report — Article 6 of 568 (Priority 5)

**Article ID:** `f61a5716-97a1-41d5-8863-a2fc5fd4115f`
**Slug:** `fire-extinguishing-systems`
**Subject:** LEA-DSGN · Structural Design, Utilities & Materials
**Topic:** PD 1096 — Rule XII, Section 1212 — Fire-Extinguishing Systems
**Linked Questions:** 41
**Sources.json Count:** 0 (EMPTY — no cited sources in structured sources.json)
**Status:** FLAGGED — 4 issues found
**Date Flagged:** 2026-05-02
**Flagged By:** Hermes AI (Kimi 2.6)
**Method:** Read-only analysis verified against actual PD 1096 2004 Revised IRR text extracted from local PDFs in `001_Raw-Source-Layer/001-Laws/PD-1096/`.

Primary sources accessed:
- `PD 1096 IRR - Full Implementing Rules and Regulations.pdf` (432 pages)
  - Page 213: Section 1212(1) — When fire-extinguishing systems required
  - Page 213-214: Section 1212(2) — Dry standpipes (construction, size, number, location, Siamese, outlets)
  - Page 214-215: Section 1212(3) — Wet standpipes (construction, size, outlets, water supply, tanks, pumps)

---

## Summary

This article covers PD 1096 Section 1212 and is **mostly accurate** but contains **1 factual error** about dry standpipe area thresholds. Most numerical values verified correct against the IRR.

**4 issues found:** 1 FACTUAL_ERROR (HIGH), 1 MISSING_CITATION (HIGH), 2 TERMINOLOGY_ERROR (LOW).

---

## Flag 1: FACTUAL_ERROR — Dry Standpipe Area Threshold

**Category:** LEGAL_INACCURACY
**Impact:** HIGH
**Location:** Line 49
**Claim:** "Applicability threshold: Any building 4+ storeys where any floor above the 3rd floor is **≤ 950 m from the ground**"
**Correct:** "where the **area of any floor** above the 3rd floor **is 950 sq. meters or less**" (the 950 is floor area in sq.m, not distance from ground)

**Evidence:**
- IRR page 213, Sec. 1212(2)(c): "Every building four (4) or more storeys in height where the **area of any floor above the third (3rd) floor is 950 sq. meters or less**, shall be equipped with at least one (1) dry standpipe"
- Article misstates "950 m from the ground" — this is a distance unit, while the code specifies floor area (sq.m)

**Impact:** This error could mislead candidates into thinking the threshold is about building distance from ground rather than floor area. However, the article's parenthetical "in the Philippine context, essentially all mid-rise buildings" is directionally correct (most mid-rise floors are under 950 sq.m), so the practical conclusion is still valid.

**Recommended Action:** Correct to: "where any floor above the 3rd floor has a **floor area of 950 sq.m or less**"

---

## Flag 2: MISSING CITATIONS / EMPTY SOURCES

**Category:** MISSING_CITATION
**Impact:** HIGH
**Location:** `sources.json`
**Issue:** `sources.json` shows `"source_count": 0, "sources": []`.

---

## Flag 3 (a & b): TERMINOLOGY_ERROR — "equivleant"

**Category:** TERMINOLOGY_ERROR
**Impact:** LOW
**Locations:**
- Line 107: "equivleant range"
- Line 186: "equivleant"
**Correct:** "equivalent"

---

## Verified Correct Claims

### Section 1212(1) — When Fire-Extinguishing Systems Required

| Claim | IRR Source | Status |
|-------|-----------|:------:|
| ≥ 200 sq.m per floor + OL > 20 for habitation | Page 213, Sec. 1212(1)(a) | ✓ |
| Dressing rooms/workshops: OL > 10 | Page 213, Sec. 1212(1)(b) | ✓ |
| Assembly halls: OL > 500 + exits > 30 m from dispersal | Page 213, Sec. 1212(1)(b) | ✓ |
| Storage of photographic/x-ray/inflammable films | Page 213, Sec. 1212(1)(c) | ✓ |

### Section 1212(2) — Dry Standpipes

| Claim | IRR Source | Status |
|-------|-----------|:------:|
| Required for buildings 4+ storeys | Page 213, Sec. 1212(2) | ✓ |
| Wrought iron or galvanized steel | Page 213, Sec. 1212(2)(a) | ✓ |
| Test pressure: 20 kg/sq.cm | Page 213 | ✓ |
| Design flow: 900 L/min | Page 213, Sec. 1212(2)(b) | ✓ |
| Floor outlet: 63 mm | Page 214, Sec. 1212(2)(f) | ✓ |
| Outlet height: max 1.20 m above floor | Page 214 | ✓ |
| Roof outlet: 2-way 63 mm | Page 214 | ✓ |
| Siamese: 100mm→2-way, 125mm→3-way, 150mm→4-way | Page 214, Sec. 1212(2)(e) | ✓ |
| Siamese height: 300 mm to 1.20 m above grade | Page 214 | ✓ |
| Sign: "CONNECTION TO DRY STANDPIPE", 25 mm letters | Page 214, Sec. 1212(2)(g) | ✓ |

### Section 1212(3) — Wet Standpipes

| Claim | IRR Source | Status |
|-------|-----------|:------:|
| Flow: 190 L/min at 2.0 kg/sq.cm | Page 214, Sec. 1212(3)(b) | ✓ |
| Outlet size: 38 mm valve | Page 215, Sec. 1212(3)(e) | ✓ |
| Outlet height: 300 mm to 1.20 m above floor | Page 215 | ✓ |
| Supply main: street main ≥ 100 mm | Page 215, Sec. 1212(3)(g) | ✓ |
| Gravity/pressure tanks: 1,500 L/min for ≥ 10 min | Page 215, Sec. 1212(3)(h) | ✓ |
| Fire pump: min 1,000 L/min | Page 215, Sec. 1212(3)(i) | ✓ |
| Fire pump: min 2 kg/sq.cm | Page 215 | ✓ |
| Fire pump supply main: ≥ 100 mm | Page 215 | ✓ |

---

## Linked Questions Review

41 questions linked. The content is mostly accurate except for the floor area/distance error noted above. Questions about the Siamese sizing sequence, wet/dry outlet sizes, and sprinkler travel distance bonus should be consistent with verified values.

---

## Conclusion

**Risk Assessment:** MEDIUM — The factual error about "950 m from the ground" vs "950 sq.m floor area" is significant for exam preparation if a question tests understanding of this threshold. However, the practical implication (most mid-rise buildings qualify) is directionally correct. Most other claims are verified.

---

*Report generated: 2026-05-02*
*Primary source: PD 1096 2004 Revised IRR, extracted from `001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 IRR - Full Implementing Rules and Regulations.pdf`*
