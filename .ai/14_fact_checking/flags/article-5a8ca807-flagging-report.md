# Flagging Report: BP 344 Ramp Slope Tiers

**Article ID:** `5a8ca807-31d5-4a32-933a-c6b83517c6de`
**Slug:** `bp-344-ramp-slope-tiers`
**Review Date:** 2026-05-02
**Reviewer:** Hermes Agent (automated fact-check)

---

## 1. SOURCES MISSING (CRITICAL)

**Severity:** HIGH

sources.json has `source_count: 0` and an empty `sources: []` array. Article cites `[file:2]` throughout (presumably BP 344 Appendix A) but provides no verifiable source references.

**Action needed:** Populate sources.json with references to the 2024 Revised IRR PDF (Section 1: Accessible Ramps, Appendix A, Table A.1.1, pages 1-3).

---

## 2. SECTION NUMBER FORMAT MISMATCH

**Severity:** LOW

The article references section numbers that don't match the 2024 IRR document structure:

| Article Reference | Actual Source Location |
|---|---|
| "Appendix A, 1.2.a" | "1. Accessible Ramps" — no "1.2.a" exists |
| "Sec A.1.2" (slope) | The ramp section uses numbered items, not "A.1.2" |
| "Sec A.1.1 & A.1.2.d-e" (landings) | Landing specs use items "10." and "11." under the ramp section |
| "Sec A.1.2.f, Sec 5" (handrails) | Handrail specs use item "12." under the ramp section |
| "A.1.2.h" (edge protection) | Edge protection uses item "14." |
| "A.1.2.i" (tactile) | Tactile uses items "15." and sub-items |

The dimensional values are all correct; only the reference labels need updating.

---

## 3. ALL DIMENSIONAL CLAIMS VERIFIED

**Severity:** NONE

All key values confirmed against Table A.1.1 and ramp specifications in the 2024 Revised IRR (pages 1-3):

**Slope tiers (Table A.1.1):**
- 1:20 — max length not limited, landing interval 15m ✓
- 1:15 — max length 10.50m, max rise 700mm, landing interval 10m ✓
- 1:12 — allowed only for existing buildings/renovations where 1:15 not feasible ✓

**Ramp components:**
- Minimum clear width: 1200mm ✓
- Intermediate landings: min 1800mm length ✓
- Level area at upper/lower ends: min 1800mm ✓
- Dual handrails: 700mm and 900mm heights ✓
- Handrail extensions: 300mm at upper and lower ends ✓
- Raised edges: min 100mm high ✓
- Tactile warning strips: 600mm depth, 300mm from head/foot ✓
- Handrail grip diameter: 30-40mm (stated in article, not found in source) — see Flag #4

**The article correctly distinguishes:**
- GOLD = 1:20 (preferred for new work)
- MAX = 1:15 (steepest for new work)
- RENO = 1:12 (existing/renovation only)

---

## 4. HANDRAIL GRIP DIAMETER NOT IN SOURCE

**Severity:** LOW

**Article claims:** "Grip diameter: Round cross-section between 30mm and 40mm (1 3/16"–1 37/64") for full grip (Sec A.1.2.f, Sec 5)"

The 2024 Revised IRR source does not specify grip diameter. The handrail section (items "12." and "13.") mentions only height (700mm and 900mm) and extensions (300mm). This value may come from PD 1096, RA 9266, or referenced standards, not from BP 344.

**Action needed:** Either (a) verify grip diameter from PD 1096 IRR or another source, or (b) cite the correct source document.

---

## 5. HANDRAIL TRIGGER THRESHOLD (170mm) NOT IN SOURCE

**Severity:** MEDIUM

**Article claims:** "Handrails required on both sides of accessible ramps with a change in grade greater than 170mm"

The source (2024 IRR) states handrails are required on both sides of accessible ramps without specifying a 170mm threshold. This threshold may come from PD 1096 or another referenced code.

**Action needed:** Verify the 170mm threshold from PD 1096 IRR or remove the claim.

---

## Summary of Issues

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | sources.json empty — no verifiable source references | HIGH | OPEN |
| 2 | Section number format doesn't match 2024 IRR structure | LOW | OPEN |
| 3 | Handrail grip diameter (30-40mm) not found in BP 344 source | LOW | OPEN |
| 4 | Handrail trigger threshold (170mm) not found in BP 344 source | MEDIUM | OPEN |

**Total questions flagged for update:** 4
