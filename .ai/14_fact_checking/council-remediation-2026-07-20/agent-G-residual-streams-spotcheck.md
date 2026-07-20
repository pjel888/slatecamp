# Agent G - Residual Streams Spot-Check (Utilities & Structural)

**Date:** 2026-07-20
**Auditor:** Agent G
**Scope:** Article-level spot-check of residual streams not covered by Agents C, D, E, F: residential electrical load computation (PEC), NSCP concrete embedments, escalator specifications. Verify every arithmetic value, code citation, and dimension against PEC 220.42 / NSCP 2015 § 420.7 / Salvan.

---

## Headline Findings

- **Bundles spot-checked:** 3
- **CONFIRMED_ERROR questions found:** 21 (across three error clusters G1, G2, G3)
  - G1: 7 arithmetic errors (lea-util-003-07)
  - G2: 10 citation errors (lea-strc-007-05)
  - G3: 4 escalator speed errors (lea-util-002-07)
- **Article body errors:** 0

---

## CONFIRMED_ERROR Questions - Full List

### G1. lea-util-003-07 - Residential Load Computation Arithmetic: 7 errors

Each of the 7 questions contains an arithmetic error in the demand-load computation chain. All recomputed independently by Agent G and re-verified by Agent J (no discrepancies). The errors trace to wrong PEC 220.42 demand-factor tiers and to carry-through mistakes.

| Q | Question ID | Original value | Correct value | Root cause |
|---|---|---|---|---|
| Q1 | `705ce4dd-594b-4812-8ecc-09a075b9b90c` | 17.2 kW | **8.9 kW** | wrong demand-factor tier applied to range load |
| Q2 | `661764c3-d7a9-43fb-bef4-662aa28d99e4` | 4,600 VA | **4,400 VA** | wrong tier on dryer load |
| Q3 | `3b341a32-f51c-4426-98d1-f00b2fcd399c` | 1.35 | **1.25** | wrong demand factor |
| Q4 | `56093fda-9f27-483b-a526-efcac8952184` | 21,360 VA | **18,360 VA** | wrong tier carry-through |
| Q5 | `89f0062e-92dc-411c-9f07-7c02ed8b32f0` | 58,500 VA | **51,500 VA** | wrong tier on general lighting |
| Q6 | `16a4cdf8-648e-4735-8f4d-ccbb9edb522d` | 18,800 VA | **9,650 VA** | used wrong PEC 220.42 tier structure (100%/40%) instead of NEC Table 220.42 tiers (100%/35%/25%) |
| Q7 | `37255c0a-4467-48c3-a0ae-4836fd46b83b` | 115.6 A | **108.3 A** | I = P/(√3 × V × PF) recomputed on corrected VA |

### G2. lea-strc-007-05 - NSCP 2015 Citation: 10 errors

All 10 questions cited fabricated code sections "NSCP 2015 § 6.3.x". NSCP 2015 Chapter 6 is **Wood Design** and contains no embedment rules. The real rules live in **NSCP 2015 § 420.7** (mirroring ACI 318-14 § 26.6.5) and **§ 426.8**. The questions also tested shortcuts (h/3, 4%, 3× diameter, w_rib/4) that the article body's "Common Mistakes" section explicitly forbids.

| Q | Question ID |
|---|---|
| Q1 | `0d8debcf-c39f-428d-a756-cde40a1b307a` |
| Q2 | `6c765e0f-401b-4fa7-a331-0d6952b16166` |
| Q3 | `09117f07-7332-47ae-94e9-75f9effee9f2` |
| Q4 | `7f446ec1-b5d6-4c76-ad7e-7bb8a6cff5a7` |
| Q5 | `02cea262-5a75-4808-86e3-051379a503c3` |
| Q6 | `b38842a0-af75-4746-88ed-282a67f96db1` |
| Q7 | `e080685f-fe5e-42bf-86e1-5cbaa5663de9` |
| Q8 | `99438c76-e9fc-4436-8ecf-208de1f1d5e1` |
| Q9 | `a7ddfea1-6c8b-4cba-967e-f0662ac042a9` |
| Q10 | `0219dc35-4e33-4ce0-b077-c008de043af6` |

### G3. lea-util-002-07 - Escalator Speed Basis: 4 errors

The article body (Salvan regulatory extract) uses **38 m/min** for the maximum rated speed along the incline. The four quiz questions used 0.5 m/s and 0.65 m/s inconsistently, contradicting both the article body and each other.

| Q | Question ID | Error | Correction |
|---|---|---|---|
| Q3 | `9e245b4c-642a-4c53-ae0e-5da0c725bbcc` | scenario speed 0.5 m/s | **38 m/min** (article body basis) |
| Q5 | `c4812c99-1489-410e-9115-c72127ed9448` | "standard speed" 0.5 m/s | **38 m/min (~0.63 m/s)** |
| Q8 | `bee7cf46-7744-4c1e-996b-8127526de640` | "maximum speed" 0.65 m/s | **38 m/min (~0.63 m/s)** rated-speed limit |
| Q11 | `28c18317-7373-497a-a4cd-ed0bcd826d94` | 0.5 m/s / 0.65 m/s option comparison | **30 m/min / 38 m/min** basis |

---

## APPLIED (Agent J - question-edit remediation, 2026-07-20)

**Agent:** J (question-edit remediation writer for the LLM fact-checking council)
**Date:** 2026-07-20
**Scope:** Write / re-stamp question-edit files for verified errors G1 (7 files), G2 (10 files), G3 (4 files). Recompute every G1 arithmetic value independently before writing. Cite PEC 220.42 / NSCP 2015 § 420.7 / ACI 318-14 § 26.6.5 / Salvan in every rationale. Do NOT edit `normalized.md`, `candidate.md`, `linked-questions.json`, or `original.md`. Do NOT switch branches / commit / push.

### Files written / re-stamped

#### G1 (7 newly written)

| Question ID | File | Corrected value (Agent J re-verified) |
|---|---|---|
| `705ce4dd-594b-4812-8ecc-09a075b9b90c` | `.../lea-util-003-07-.../question-edits/705ce4dd-594b-4812-8ecc-09a075b9b90c.json` | 8.9 kW (matched Agent G) |
| `661764c3-d7a9-43fb-bef4-662aa28d99e4` | `.../lea-util-003-07-.../question-edits/661764c3-d7a9-43fb-bef4-662aa28d99e4.json` | 4,400 VA (matched Agent G) |
| `3b341a32-f51c-4426-98d1-f00b2fcd399c` | `.../lea-util-003-07-.../question-edits/3b341a32-f51c-4426-98d1-f00b2fcd399c.json` | 1.25 (matched Agent G) |
| `56093fda-9f27-483b-a526-efcac8952184` | `.../lea-util-003-07-.../question-edits/56093fda-9f27-483b-a526-efcac8952184.json` | 18,360 VA (matched Agent G) |
| `89f0062e-92dc-411c-9f07-7c02ed8b32f0` | `.../lea-util-003-07-.../question-edits/89f0062e-92dc-411c-9f07-7c02ed8b32f0.json` | 51,500 VA (matched Agent G) |
| `16a4cdf8-648e-4735-8f4d-ccbb9edb522d` | `.../lea-util-003-07-.../question-edits/16a4cdf8-648e-4735-8f4d-ccbb9edb522d.json` | 9,650 VA (matched Agent G; root cause was wrong PEC 220.42 tier structure — corrected to NEC Table 220.42 tiers 100%/35%/25%) |
| `37255c0a-4467-48c3-a0ae-4836fd46b83b` | `.../lea-util-003-07-.../question-edits/37255c0a-4467-48c3-a0ae-4836fd46b83b.json` | 108.3 A (matched Agent G; I = P/(√3 × V × PF) on corrected VA) |

**Arithmetic re-verification:** All 7 of Agent G's values were recomputed independently by Agent J. **Zero discrepancies.** All 7 matched.

#### G2 (10 re-stamped)

A prior batch-164 question-alignment remediation had already rewritten all 10 questions to cite NSCP 2015 § 420.7 / § 426.8 and had removed the h/3, 4%, 3× diameter, w_rib/4 shortcuts. Agent J re-verified each question, then applied a surgical jq batch update to:

- re-stamp `approved_by` → "council-agent-J-question-remediation (re-stamped; original: codex-local-question-alignment-batch-164)"
- append the council-remediation marker to `reason` (citing Agent G ERROR G2 and the fabricated-§ 6.3.x exclusion)
- append "; ACI 318-14 § 26.6.5 equivalence." to each `code_citation`
- add the fabricated-§ 6.3.x exclusion to `excluded_claims`

| Question ID | File |
|---|---|
| `0d8debcf-c39f-428d-a756-cde40a1b307a` | `.../lea-strc-007-05-.../question-edits/0d8debcf-c39f-428d-a756-cde40a1b307a.json` |
| `6c765e0f-401b-4fa7-a331-0d6952b16166` | `.../lea-strc-007-05-.../question-edits/6c765e0f-401b-4fa7-a331-0d6952b16166.json` |
| `09117f07-7332-47ae-94e9-75f9effee9f2` | `.../lea-strc-007-05-.../question-edits/09117f07-7332-47ae-94e9-75f9effee9f2.json` |
| `7f446ec1-b5d6-4c76-ad7e-7bb8a6cff5a7` | `.../lea-strc-007-05-.../question-edits/7f446ec1-b5d6-4c76-ad7e-7bb8a6cff5a7.json` |
| `02cea262-5a75-4808-86e3-051379a503c3` | `.../lea-strc-007-05-.../question-edits/02cea262-5a75-4808-86e3-051379a503c3.json` |
| `b38842a0-af75-4746-88ed-282a67f96db1` | `.../lea-strc-007-05-.../question-edits/b38842a0-af75-4746-88ed-282a67f96db1.json` |
| `e080685f-fe5e-42bf-86e1-5cbaa5663de9` | `.../lea-strc-007-05-.../question-edits/e080685f-fe5e-42bf-86e1-5cbaa5663de9.json` |
| `99438c76-e9fc-4436-8ecf-208de1f1d5e1` | `.../lea-strc-007-05-.../question-edits/99438c76-e9fc-4436-8ecf-208de1f1d5e1.json` |
| `a7ddfea1-6c8b-4cba-967e-f0662ac042a9` | `.../lea-strc-007-05-.../question-edits/a7ddfea1-6c8b-4cba-967e-f0662ac042a9.json` |
| `0219dc35-4e33-4ce0-b077-c008de043af6` | `.../lea-strc-007-05-.../question-edits/0219dc35-4e33-4ce0-b077-c008de043af6.json` |

#### G3 (4 newly written)

| Question ID | File | Speed basis applied |
|---|---|---|
| `9e245b4c-642a-4c53-ae0e-5da0c725bbcc` | `.../lea-util-002-07-.../question-edits/9e245b4c-642a-4c53-ae0e-5da0c725bbcc.json` | 38 m/min (article body, Salvan) |
| `c4812c99-1489-410e-9115-c72127ed9448` | `.../lea-util-002-07-.../question-edits/c4812c99-1489-410e-9115-c72127ed9448.json` | 38 m/min (~0.63 m/s) |
| `bee7cf46-7744-4c1e-996b-8127526de640` | `.../lea-util-002-07-.../question-edits/bee7cf46-7744-4c1e-996b-8127526de640.json` | 38 m/min rated-speed limit |
| `28c18317-7373-497a-a4cd-ed0bcd826d94` | `.../lea-util-002-07-.../question-edits/28c18317-7373-497a-a4cd-ed0bcd826d94.json` | 30 m/min / 38 m/min comparison basis |

**Speed-basis decision:** Article body (line 19, Salvan extract) uses **38 m/min**. The council brief offered "0.5 m/s (30 m/min) per Salvan" as an alternative, but the article body itself uses 38 m/min. Per the directive to "align the questions to the article body", 38 m/min was chosen as the single consistent speed basis across all four questions.

### Source citations used in rationales

- PEC 220.42 = NEC Table 220.42 demand-factor tiers (100%/35%/25% for first 3 kVA, next 34 kVA, remainder)
- NSCP 2015 § 420.7 (embedments; OCR page 463); § 426.8 (pipe coordination; OCR page 508)
- ACI 318-14 § 26.6.5 (embedment-rule equivalence)
- Salvan, Architectural Utilities 2 — escalator rated speed 38 m/min maximum along incline

### JSON validation

All 21 modified/written JSON files pass `jq empty`:
- G1: 7 files (newly written)
- G2: 10 files (re-stamped via jq batch)
- G3: 4 files (newly written)

### Per-bundle council-remediation files

- `.../lea-util-003-07-.../council-remediation-2026-07-20.md` — created with status APPLIED (G1, includes full arithmetic re-verification).
- `.../lea-strc-007-05-.../council-remediation-2026-07-20.md` — created with status APPLIED (G2, includes batch-164 history).
- `.../lea-util-002-07-.../council-remediation-2026-07-20.md` — created with status APPLIED (G3).

**Errors G1, G2, G3 are now APPLIED.** Total question-edits for Agent G scope: 21 (11 newly written + 10 re-stamped).
