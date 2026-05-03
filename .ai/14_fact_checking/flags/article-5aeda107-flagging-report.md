# Flagging Report: BP 344 Tactile and Visual Alarms

**Article ID:** `5aeda107-bc0d-4d0d-ab40-44e13fd95478`
**Slug:** `bp-344-tactile-and-visual-alarms`
**Review Date:** 2026-05-02
**Reviewer:** Hermes Agent (automated fact-check)

---

## 1. SOURCES MISSING (CRITICAL)

**Severity:** HIGH

sources.json has `source_count: 0` and an empty `sources: []` array. Article cites `[file:2]` throughout but provides no verifiable source references with page numbers.

**Action needed:** Populate sources.json with references to the 2024 Revised IRR PDF — specifically Appendix A (Tactile Floor Surfaces, Table A.7.2, Table A.7.3), Section 8 (Elevators), and Section 6 (Toilets and Baths).

---

## 2. SECTION NUMBER FORMAT MISMATCH

**Severity:** LOW

The article references section numbers that don't match the 2024 IRR's actual structure:

| Article Reference | Actual Source Location |
|---|---|
| A.7.2.e (50% contrast) | "Tactile floor surfaces shall have a minimum luminance contrast of 50% from adjacent floor finishes" — no sub-letter designation |
| A.7.11 (placement rules) | Tactile path placement is described in the "Tactile Floor Surfaces" section with numbered items, not "A.7.11" |
| A.7.11.vii (ramp tactile) | Ramp tactile items are under the ramp section (item "15.") and tactile path section |
| A.7.11.iv (stair tactile) | Stair tactile items under "Staircases" sub-section |
| A.7.11.vi (escalator tactile) | Escalator tactile items under "Escalators" sub-section |
| A.7.11.v (elevator) described as "Elevators" sub-section | |
| A.7.11.viii (toilet) | Described as "Accessible Toilets" sub-section |
| Table A.7.2 | ✓ Confirmed in source |
| Table A.7.3 | ✓ Confirmed in source |

---

## 3. ARTICLE HAS UNUSUAL META-STRUCTURE

**Severity:** LOW

This article is unusual in that it:
1. References its own draft and describes "what I changed or tightened compared to your draft" (lines 192-208)
2. Uses language like "Your [section] is mostly correct but missed two clarifications"
3. Describes its own corrections (e.g., "Corrected ramp tactile placement to match the 2024 wording")

This suggests the article may have been generated/modified by an AI assistant and the meta-commentary about the editing process was not fully cleaned up before publication.

**Action needed:** Review and remove meta-commentary describing the edit process. The article should present information directly without referencing its own draft history.

---

## 4. "1500mm AFF TO CENTER, MIN 30% CONTRAST" FOR SIGNAGE NOT EXPLICITLY SOURCED

**Severity:** LOW

The article states: "The amended text you summarized as 'max 1500 mm AFF to center, min 30% contrast' is consistent with global practice, and aligns conceptually with Appendix A's emphasis on tactile readability and contrast; your numbers are reasonable exam anchors even though the exact 1500 mm/30% pair is not spelled out as a single line in the snippet."

This is an explicit acknowledgment that these values are not directly stated in the source. The article should either find the correct source or flag these as inferred values.

---

## 5. VERIFIED CLAIMS (No Action Needed)

The following claims were confirmed against the 2024 Revised IRR:

**Tactile block specifications (Table A.7.2):**
- All three types: 300mm x 300mm block size ✓
- Directional: 34mm wide parallel bars ✓
- Warning: 35mm diameter truncated domes in square grid ✓
- Positional: 23mm diameter truncated domes in staggered pattern ✓
- Raised element height: 5mm ✓

**Luminance contrast:**
- Tactile floor surfaces: min 50% from adjacent floor finishes ✓
- Escalator elements (steps, comb plates, approach, belt, handrails): min 30% ✓
- Floor surfaces: min 30% from adjacent walls ✓

**Tactile placement:**
- Warning blocks: 600mm depth, 300mm setback from hazard ✓
- Ramps: at head, foot, and center of each landing ✓
- Stairs: 600mm depth, 300mm from start/end ✓
- Escalators: 600mm depth, 300mm before landing plate ✓
- Elevator path: terminates at control panel with 300mm setback ✓
- Toilet path: leads to tactile information map ✓

**Braille and signage:**
- Floor indicators on both jambs at 1200mm AFF ✓
- Braille to left of elevator buttons ✓
- COP height: 900mm on center ✓
- Button diameter: min 20mm ✓
- Button depression: max 1mm ✓

**Emergency systems:**
- Toilet emergency call button: 400-600mm AFF ✓
- Strobe alarm: max 2 flashes/second (NFPA 72) ✓
- Voice synthesizer in elevators ✓
- Two-way visual emergency communication ✓

---

## Summary of Issues

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | sources.json empty — no verifiable source references | HIGH | OPEN |
| 2 | Section number format doesn't match 2024 IRR structure | LOW | OPEN |
| 3 | Meta-commentary about draft/edit process not cleaned up | LOW | OPEN |
| 4 | 1500mm/30% signage values explicitly acknowledged as not in source | LOW | OPEN |

**Total questions flagged for update:** 4
