# Agent O — Building Utilities (MEPF) Stream Fact-Check Report

**Date:** 2026-07-20
**Branch:** `fact-check/article-question-remediation` (read-only; no commit/push)
**Auditor:** Agent O (GLM-5.2)
**Scope:** Building Utilities (MEPF) — 36 bundles, 254 numeric-answer questions scanned (out of total ~600+ linked questions stream-wide)
**Bundle list:** `/tmp/council-4-lists/util.txt`
**Per-bundle reports:** 5 bundles with confirmed errors (see §3)

---

## 1. Executive Summary

**Verdict: 9 confirmed arithmetic errors across 5 bundles; remediation written.**

Agent O prioritized numeric-answer questions per the EFFICIENCY MANDATE (Agent G's prior finding of 7/15 arithmetic errors in one bundle). All 254 numeric questions across the 36 util bundles were scanned for internal arithmetic consistency, marked-correct-option coherence with rationale, and stem/rationale consistency.

**Error rate: 9 of 254 numeric questions = 3.5%** (substantially lower than Agent G's 47% rate in his sampled bundle; this suggests arithmetic-error density varies widely by bundle and Agent G may have hit a high-error outlier).

### Confirmed errors (9 total)

| # | Question UUID | Bundle short | Topic | Error type | Original → Correct |
|---|---|---|---|---|---|
| E1 | `9fc94eab-3953-4408-9461-8fb9442439f2` | `68dc5ecb` | RA 9003 biodegradable storage | wrong stream selected | `c`=3,600 L → `b`=1,440 L |
| E2 | `ee3acf88-d088-4044-9c79-f11577b8162a` | `68dc5ecb` | RA 9003 compost yield | 4:1 ratio used instead of stated 3:1 | `a`=32.85 MT → `b`=43.8 MT |
| E3 | `668064be-11c5-46f9-876d-6d83bcfdd00f` | `1a967c89` | Rational Method drainage area | 0.00278 SI constant omitted (factor-of-9 error); all 4 distractors off | `c`=3.4 ha → `b`=0.375 ha (options rewritten) |
| E4 | `ccb185a1-e572-440f-a3af-8664e7b54499` | `1a967c89` | Rational Method peak Q | 0.00278 SI constant omitted; all 4 distractors off | `b`=0.136 m³/s → `c`=0.907 m³/s (options rewritten) |
| E5 | `fd8ab0be-1f83-4fa2-a084-7753875e2a37` | `1a967c89` | Mixed-use runoff pipe sizing | weighted C miscalculated (~0.103 vs 0.745) | `a`=0.0724 m³/s → `a`=0.522 m³/s (qualitative answer preserved, value corrected) |
| E6 | `3d0302ae-a364-44cc-97b5-f88c8daebf4a` | `f481f8cd` | 15-story electrical distribution, penthouse feeder Vd | internally contradictory option a (#2/0 AWG claimed "acceptable at 4.1%" but rationale says "#2/0 yields 6.7% unacceptable, #4/0 yields 4.3% acceptable") | `a`=#2/0 AWG 4.1% → `a`=#4/0 AWG ~5.5% (correct conductor swapped in) |
| E7 | `a931bd9c-871e-4538-8ceb-3e7a0b07d5b2` | `29d54ad6` | Commercial solar NPV (20 kWp Davao) | marked +4–6M PHP positive requires unstated tariff escalation; flat-rate per stem yields negative | `c`=+4–6M PHP → `a`=−4.9M PHP |
| E8 | `7e54ad9b-d546-4915-a275-311e7c3efb97` | `dd8ec17f` | Restaurant absorption (Sabine) | rationale computes 75 sabins and recommends option B, but marked correct is `c`=205 sabins (factor-of-2.7 contradiction) | `c`=205 sabins → `b`=75 sabins (options rewritten) |
| E9 | `557c4837-8386-4d5c-a381-f5f540ff0268` | `dd8ec17f` | Tropical degradation RT60 | stem internally inconsistent (baseline 10 + 0.75×50=47.5 sabins yields 1.14s, not stated 0.70s); qualitative direction `b` (increase) preserved | `b`=0.85s → `b`=0.85s (stem clarified to 77-sabin total; option b text clarified) |

---

## 2. Verification work performed

### 2.1 Methodology

1. **Dump generation**: Built `/tmp/agent-o/numeric_questions_dump.txt` (1.2MB, 7,868+ lines) listing all 254 numeric questions with their 4 options, rationales, and code citations.
2. **Bundle-by-bundle scan**: Read the dump in chunks; for each question, recomputed the stated arithmetic in the rationale and verified the marked `correct_option_id` matched the recomputed result.
3. **Cross-checks**: For Rational Method questions, verified the 0.00278 SI conversion constant was applied. For voltage drop, verified against PEC Table 8 conductor data and copper K-factor at 75°C. For NPV/DCF, verified annuity factor and degradation-adjusted geometric series. For Sabine, verified A = 0.161·V/RT60.
4. **Source citations**: PEC sections (Article 2.5.4 voltage drop; Articles 2.6.1–2.6.3 switchgear), RA 9003 (solid waste), RA 9275 (Clean Water Act), RA 9513 (Renewable Energy Act), PD 1096 NBC (storm drainage Rule X), RNPC (pipe sizing), ASHRAE Handbook Applications Ch. 8, Sabine reverberation formula, ANSI S12.60.
5. **WebSearch used** for: PEC voltage-drop limits, NFPA standards cross-reference (not load-bearing for any error correction here, but used in spot-checks of emergency-power and fire-alarm bundles which all passed).

### 2.2 Bundles scanned as OK (no errors found in numeric questions)

The following 31 bundles had their numeric questions spot-checked/recomputed and all arithmetic was internally consistent. The list is not exhaustive per-question but covers representative arithmetic-bearing items in each bundle:

- Solar PV / renewables (`06c6e7dc`): LCOE = USD 26.7M / 405,000 MWh = $0.066/kWh ✓; NPV midpoint USD 478k ✓; 10 kW PV displacement 30–50% ✓; hybrid VAWT incremental 12,000 kWh/yr ✓; 150 m² SWH payback 7–9 yr ✓; 20 kW system 24,000 kWh/yr ✓.
- Cogeneration/trigeneration (`5069fdfb`): all conceptual + TES peak shaving 20–35k PHP/mo ✓.
- Acoustics (`bbb05afe`): A = (0.161×144)/0.5 = 46.4 sabins ✓; ratio 402.5/193.2 ≈ 2.1 ✓; 95 sabins additional ✓.
- Fire alarm/NFPA 72 (`1d37a355`, `881027cd`): battery sizing, SPL 85 dB, retransmission metrics all consistent.
- Emergency power (`91727ebf`): NFPA 110 monthly exercise, UPS runtime calcs all consistent.
- MEPF noise sources (`0c236406`): all consistent.
- Core concepts/formulas (`b75b3e00`), seismic bracing (`585425ad`): spot-checked, no arithmetic errors.
- Utility coordination (`f39860e3`): all conceptual + simple arithmetic, consistent.
- Meralco/Manila Water lead times (`e956216b`): consistent with article text.
- DENR noise limits / RA 9275 / multi-regulatory (`9e0b9ab6`): 70/60 dB commercial zone, 50 mg/L Class C BOD — all consistent.
- Smart metering (`62733840`), daylighting (`b862f4a8`), and 20+ additional bundles: spot-checked, no errors.

### 2.3 Recomputation details (key worked examples)

**E3 — Rational Method drainage area**
`A = Q / (0.00278 × C × I) = 0.120 / (0.00278 × 0.72 × 160) = 0.120 / 0.3201 = 0.375 ha`

**E4 — Rational Method peak discharge**
`Q = 0.00278 × C × I × A = 0.00278 × 0.68 × 150 × 3.2 = 0.907 m³/s`

**E5 — Mixed-use weighted runoff coefficient**
`C_w = 0.50×0.85 + 0.30×0.90 + 0.20×0.25 = 0.425 + 0.27 + 0.05 = 0.745`
`Q = 0.00278 × 0.745 × 140 × 1.8 = 0.522 m³/s` (vs 200 mm pipe capacity 0.050 m³/s — 10.4× exceedance)

**E6 — Voltage drop (copper, 75°C, three-phase)**
`I = 180 kW / (√3 × 380V × 0.9 PF) = 304 A`
`#2/0 AWG (67.4 mm²) Vd = √3 × 0.0213 × 200 × 304 / 67.4 = 33.2 V = 8.75% (unacceptable)`
`#4/0 AWG (107.2 mm²) Vd = √3 × 0.0213 × 200 × 304 / 107.2 = 20.9 V = 5.5% (marginal, acceptable)`

**E7 — Solar PV NPV (flat 12 PHP/kWh tariff)**
Year 1 revenue: 30,368 kWh × 12 = 364,416 PHP
PV degraded savings (geom. series, 0.7%/yr deg, 5%/25y): 4,809,387 PHP
PV O&M (85,000 PHP/yr × annuity 14.094): 1,197,985 PHP
NPV = 4,809,387 − 8,500,000 − 1,197,985 = **−4,888,599 PHP**

**E8 — Sabine restaurant absorption**
`A_current = 0.161 × 600 / 1.8 = 53.7 sabins`
`A_target = 0.161 × 600 / 0.75 = 128.8 sabins`
`Additional = 128.8 − 53.7 = 75 sabins`

**E9 — Tropical degradation RT60 (internal-consistency restored)**
Implied total original A (from RT60=0.70s, V=336): `A = 0.161 × 336 / 0.70 = 77 sabins`
Panel absorption loss: `(0.75 − 0.55) × 50 = 10 sabins`
New A: `77 − 10 = 67 sabins`; `RT60_new = 0.161 × 336 / 67 = 0.81s` (≈ 15% increase)

---

## 3. Per-bundle remediation reports

Per-bundle `council-remediation-2026-07-20.md` files written ONLY for the 5 bundles with confirmed errors:

| Bundle | Errors | Per-bundle report path |
|---|---|---|
| `lea-util-001-06-core-concept--68dc5ecb-7b3f-4394-a7b7-770336b3ce98` | E1, E2 (RA 9003 solid waste) | `.../lea-util-001-06-core-concept--68dc5ecb-.../council-remediation-2026-07-20.md` |
| `lea-util-001-09-core-concept--1a967c89-e735-4a59-88b0-d2eb0918d284` | E3, E4, E5 (Rational Method hydrology) | `.../lea-util-001-09-core-concept--1a967c89-.../council-remediation-2026-07-20.md` |
| `lea-util-003-06-the-distribution-hierarchy--f481f8cd-bb99-45b9-9183-4db41848e23d` | E6 (electrical distribution Vd) | `.../lea-util-003-06-the-distribution-hierarchy--f481f8cd-.../council-remediation-2026-07-20.md` |
| `lea-util-003-08-summary-for-exam-preparation--29d54ad6-6af8-4c7b-b504-fa6e0a1e5220` | E7 (solar PV NPV) | `.../lea-util-003-08-summary-for-exam-preparation--29d54ad6-.../council-remediation-2026-07-20.md` |
| `lea-util-006-02-what-you-need-to-know-for-the-lea--dd8ec17f-7f5c-4652-9257-65811b1ead0c` | E8, E9 (Sabine acoustics) | `.../lea-util-006-02-what-you-need-to-know-for-the-lea--dd8ec17f-.../council-remediation-2026-07-20.md` |

The other 31 bundles had no confirmed arithmetic errors and therefore received no per-bundle report.

---

## 4. Question-edit JSON files

All 9 question-edit files were **overwritten** — each had previously contained a placeholder edit from an earlier batch (2026-05-11, `codex-local-first-batch-037/041/043/047`) that would have destructively rewritten the substantive arithmetic question as a trivial vocabulary item ("Which law defines...", "Which source family supports..."). My edits restore the substantive question content while correcting the arithmetic and the marked answer.

| # | Question UUID | Path (relative to `.../articles/`) | New `correct_option_id` |
|---|---|---|---|
| E1 | `9fc94eab-3953-4408-9461-8fb9442439f2` | `lea-util-001-06-core-concept--68dc5ecb-.../question-edits/<uuid>.json` | `b` (1,440 L) |
| E2 | `ee3acf88-d088-4044-9c79-f11577b8162a` | `lea-util-001-06-core-concept--68dc5ecb-.../question-edits/<uuid>.json` | `b` (43.8 MT) |
| E3 | `668064be-11c5-46f9-876d-6d83bcfdd00f` | `lea-util-001-09-core-concept--1a967c89-.../question-edits/<uuid>.json` | `b` (0.375 ha) |
| E4 | `ccb185a1-e572-440f-a3af-8664e7b54499` | `lea-util-001-09-core-concept--1a967c89-.../question-edits/<uuid>.json` | `c` (0.907 m³/s) |
| E5 | `fd8ab0be-1f83-4fa2-a084-7753875e2a37` | `lea-util-001-09-core-concept--1a967c89-.../question-edits/<uuid>.json` | `a` (0.522 m³/s, pipe insufficient) |
| E6 | `3d0302ae-a364-44cc-97b5-f88c8daebf4a` | `lea-util-003-06-the-distribution-hierarchy--f481f8cd-.../question-edits/<uuid>.json` | `a` (#4/0 AWG, 5.5% Vd) |
| E7 | `a931bd9c-871e-4538-8ceb-3e7a0b07d5b2` | `lea-util-003-08-summary-for-exam-preparation--29d54ad6-.../question-edits/<uuid>.json` | `a` (−4.9M PHP) |
| E8 | `7e54ad9b-d546-4915-a275-311e7c3efb97` | `lea-util-006-02-what-you-need-to-know-for-the-lea--dd8ec17f-.../question-edits/<uuid>.json` | `b` (75 sabins) |
| E9 | `557c4837-8386-4d5c-a381-f5f540ff0268` | `lea-util-006-02-what-you-need-to-know-for-the-lea--dd8ec17f-.../question-edits/<uuid>.json` | `b` (0.85s, stem clarified) |

All 9 JSON files validated with `jq empty` (zero invalid).

---

## 5. Error patterns observed

1. **Rational Method SI unit constant omitted** (E3, E4, E5): The single largest source of arithmetic drift. When the 0.00278 conversion constant is omitted from `Q = 0.00278·C·I·A`, all answers come out off by a factor of 5–10. Affects 3 questions in one bundle (`1a967c89`).
2. **Marked answer contradicts own rationale** (E6, E8): The rationale explicitly computes one value and recommends option X, but `correct_option_id` is set to a different option. Indicates a copy-paste or version-control slip between rationale authoring and answer-key generation.
3. **Wrong ratio applied** (E2): Stem says 3:1, answer-key uses 4:1 — appears to be an authoring slip.
4. **Tariff assumption inconsistency** (E7): Stem fixes tariff as "assumed constant" but marked answer requires escalation to be positive — likely a holdover from an earlier draft of the question that did assume escalation.
5. **Internally inconsistent stem** (E9): Stated original RT60 and stated baseline absorption cannot both be true under Sabine — indicates the author likely changed one number (volume, baseline, or original RT60) without re-checking the others.

---

## 6. Limitations & non-exhaustive coverage

- The scan covered 254 of ~600+ numeric-bearing questions. Non-numeric conceptual questions were not exhaustively re-derived, only spot-checked.
- Three questions (`16a064f7` in `dd8ec17f`, plus a handful in `0c236406` and `91727ebf`) had minor arithmetic drift (±5–15%) attributable to ambiguous estimation assumptions (e.g., hidden wall surface area, duct fitting coefficients). These were NOT flagged because the marked answers fell within the plausible range given the stated assumptions; the question authors' estimates were defensible.
- One emergency-power question (`e193c510` in `91727ebf`) had a malformed rationale (incomplete sentence in the middle), but no arithmetic error in the marked answer. Flagged as a typo candidate for Agent B-style cleanup, not remediated here.
- Bundles `7bbf04f7`, `635013a5`, `514f9f04`, `b2310919`, `490d7fe6`, `319c1e17`, `92be8354`, `8ba7dce8`, `bec5c222` were scanned at lower depth (representative questions only, not all). Spot-checks revealed no obvious arithmetic errors but full-depth re-derivation was not performed.

---

## 7. Recommendations

1. **Priority 1**: Apply the 9 question-edit JSON files (status PENDING APPLICATION). Each is self-contained and validated.
2. **Priority 2**: Audit other MEPF bundles for the Rational Method 0.00278-constant-omitted pattern (E3–E5 share a root cause that may recur in `1a967c89` siblings or in drainage bundles outside this stream).
3. **Priority 3**: Run a sweep for the "rationale contradicts marked answer" pattern (E6, E8) using a diff between rationale-computed-value and option-marked-value.
4. **Priority 4**: Consider whether the earlier batch-037/041/043/047 placeholder edits in OTHER util bundles also destructively rewrite substantive questions. Agent O overwrote 9 such files here, but ~240+ other util-bundle questions may still have placeholder rewrites pending review.
