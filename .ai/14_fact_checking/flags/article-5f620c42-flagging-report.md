# Flagging Report: BP 344 Elevator Dimensions

**Article ID:** `5f620c42-ef55-4c0e-824b-49f0ff9d47e6`
**Slug:** `bp-344-elevator-dimensions`
**Review Date:** 2026-05-02
**Reviewer:** Hermes Agent (automated fact-check)

---

## 1. SOURCES MISSING (CRITICAL)

**Severity:** HIGH

sources.json has `source_count: 0` and an empty `sources: []` array. The article cites `[file:4]` (BP 344) extensively but provides no verifiable source references with page numbers or section anchors.

**Action needed:** Populate sources.json with references to the 2024 Revised IRR PDF (Section 8, Elevators, pages 41-43).

---

## 2. SECTION NUMBER FORMAT MISMATCH

**Severity:** LOW

The article references "Sec 8.4", "Sec 8.5", "Sec 8.6", "Sec 8.7.a", "Sec 8.7.c", "Sec 8.7.d", "Sec 8.8.b", "Sec 8.9", "Sec 8.10", "Sec 8.11", "Sec 8.12". The 2024 Revised IRR uses section "8. Elevators" with numbered list items, not sub-letter designations. For example:

| Article Reference | Actual Source Label |
|---|---|
| Sec 8.4 (30m distance) | "8. Elevators" — listed in body text without sub-section number |
| Sec 8.5 (car dimensions) | "8. Elevators" — described without "Sec 8.5" |
| Sec 8.6 (handrails) | Sub-items under "handrails" list, not separate section |
| Sec 8.7.a (COP height) | Sub-item under "elevator controls" |
| Sec 8.7.c (Braille on jambs) | Sub-item "3." under elevator controls |
| Sec 8.7.d (button size) | Sub-item "4." under elevator controls |
| Sec 8.8.b (voice synthesizer) | Sub-item "2." under "audio, visual, and tactile guide" |
| Sec 8.9 (emergency visual) | Body paragraph under audio-visual section |
| Sec 8.10 (power outage) | Body paragraph |
| Sec 8.11 (lobby space) | Body paragraph: "Elevators lobbies shall have a minimum clear space of at least 1800 x 1800mm" |
| Sec 8.12 (through-type) | Body paragraph about through-type elevators |

While the section numbers don't match the source document's structure, the actual dimensional values are all correct.

**Action needed:** Update section references to match the actual 2024 IRR document structure.

---

## 3. "UPDATED FROM 1100mm" CLAIM UNVERIFIABLE

**Severity:** LOW

**Article claims:** "Elevator Car Width (Accessible Car): 1200mm clear — Updated from older 1100mm reviewers"

The 2024 IRR source specifies 1200mm width but does not mention a previous 1100mm value or indicate that this was an update. The previous BP 344 IRR or PD 1096 might have had 1100mm, but the 2024 Revised IRR document itself does not contain this comparison.

**Action needed:** Either verify the 1100mm claim from an older version of BP 344, or rephrase to note this is inferred from common knowledge rather than stated in the 2024 IRR.

---

## 4. "UPDATED FROM 800mm" DOOR CLAIM UNVERIFIABLE

**Severity:** LOW

**Article claims:** "Clear Door Opening: 900mm clear — Updated from 800mm in older materials"

Same issue as #3. The 2024 IRR specifies 900mm but doesn't state it was updated from 800mm.

**Action needed:** Verify against older sources or rephrase.

---

## 5. VERIFIED CLAIMS (No Action Needed)

All dimensional claims confirmed accurate against the 2024 Revised IRR (Section 8, Elevators, pages 41-43):

- Car dimensions: 1200mm wide x 1400mm deep ✓
- Clear door opening: 900mm ✓
- Max distance from entrance: 30 meters ✓
- COP height: 900mm on center ✓
- Braille on jambs: 1200mm AFF, both side jambs ✓
- Button diameter: min 20mm ✓
- Button depression: max 1mm ✓
- Handrail height: 900mm ✓
- Handrails on: both sides + rear wall ✓
- Handrail gap from wall: max 150mm ✓
- Lobby turning space: 1800mm x 1800mm ✓
- Voice synthesizer: required ✓
- Emergency visual communication: two-way visual system required ✓
- Power outage operation: must remain operable ✓
- Through-type preferred ✓
- Braille placed to the left of buttons ✓

---

## Summary of Issues

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | sources.json empty — no verifiable source references | HIGH | OPEN |
| 2 | Section number format doesn't match 2024 IRR document structure | LOW | OPEN |
| 3 | "Updated from 1100mm" claim not verifiable in 2024 IRR text | LOW | OPEN |
| 4 | "Updated from 800mm" door claim not verifiable in 2024 IRR text | LOW | OPEN |

**Total questions flagged for update:** 4
