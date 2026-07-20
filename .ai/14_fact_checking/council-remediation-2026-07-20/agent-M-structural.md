# Agent M - Structural Stream Fact-Check (Council Remediation 2026-07-20)

**Date:** 2026-07-20
**Auditor:** Agent M (ZCode / GLM-5.2)
**Branch:** `fact-check/article-question-remediation`
**Scope:** 45 structural bundles (`/tmp/council-4-lists/strc.txt`), 450 linked questions, all 45 question-edit directories.

---

## 1. Headline Verdict

**NO new CONFIRMED_ERROR questions found.**

The structural stream has been **thoroughly pre-remediated** by the source-audit pipeline (Batches 139-164 local-first). All 45 bundles have a complete 10/10 set of `question-edits/*.json` files that already correct every error pattern flagged in the task brief. After independent recomputation of every numeric answer, verification of every NSCP/code citation, and confirmation of internal consistency between article bodies and answer keys, **zero new question-edits are required**.

| Metric | Count |
|---|---|
| Bundles audited | 45 |
| Linked questions checked | 450 |
| Existing question-edits verified | 450 / 450 |
| Question-edit JSON files validated with `jq empty` | **500 / 500** (includes `.push-report.json` sidecars) |
| New CONFIRMED_ERROR | **0** |
| New question-edits written | 0 |
| Per-bundle remediation files written | 0 (none needed) |

---

## 2. Methodology

Per the Agent-M brief, the following was done for every bundle:

1. **Read `normalized.md`** (article body) — extracted all stated formulas and numeric values.
2. **Read `linked-questions.json`** — identified numeric-bearing questions and code citations.
3. **Recomputed arithmetic** for every numeric answer (independent `python3` calculation).
4. **Verified NSCP citations** against published NSCP 2015 structure (web-confirmed: Chapter 2 = Earthquake §208; Chapter 4 = Concrete §424, Table 407.3.1.1; Chapter 6 = Wood §605/§615/§622).
5. **Checked each existing question-edit** to confirm the proposed block uses correct formulas, correct NSCP citations, and that `correct_option_id` aligns with the rationale.
6. **Validated every JSON** with `jq empty`.

---

## 3. Numeric Arithmetic Recomputation (all PASS)

All numeric answers in the linked-questions were recomputed independently. **Every marked-correct answer is actually correct.** Selected examples:

### 3.1 lea-strc-004-02 (Base shear V = Z·I·C·W)
Article body cites NSCP 2015 §208.4.4.1 / Table 208-3 with Z = 0.20 (Zone 2) and Z = 0.40 (Zone 4). Existing edit `09f7ddea` changed the stem from "Zone 2" to "Zone 4" so the 240 kN answer is now consistent: 0.40 × 1.0 × 0.12 × 5000 = **240 kN ✓**.

### 3.2 lea-strc-007-03 (NSCP Table 9.5.1 / Table 424.2.2 deflection limits)
All 9 numeric questions recomputed against NSCP/ACI minimum-thickness ratios for Grade 60 steel:

| Support condition | Solid slab | Beam/ribbed |
|---|---|---|
| Simply supported | L/20 | L/16 |
| One-end continuous | L/24 | L/18.5 |
| Both-end continuous | L/28 | L/21 |
| Cantilever | L/10 | L/8 |

- Q `7ac3ba8b` (interior cont. slab, 6 m): 6000/28 = **214 mm ✓**
- Q `94abda41` (cont. ribbed, 7 m): 7000/21 = **333 mm ✓**
- Q `d37a4ca3` (ribbed cantilever, 3 m): 3000/8 = **375 mm ✓**
- Q `f88b1cee` (slab cantilever, 2.5 m, G60): 2500/10 = **250 mm ✓**
- Q `994be8d3` (simply slab, 5 m, 225 mm proposed): 5000/20 = 250 mm → non-compliant ✓
- Q `d80bfbfb` (simply slab, 4 m, 200 mm proposed): 4000/20 = 200 mm → compliant ✓

The one question with a Grade-40 stem (Q `425007a6`) was already replaced in batch-164 by a Section 424.2.1 serviceability question, eliminating the would-be (0.4 + fy/100000) = 0.8 adjustment-factor issue.

### 3.3 lea-strc-009-03 (Timber ASD mechanics)
All formulas confirmed against Hibbeler/Pytel mechanics sources:

- Q `ba6d4d7a` (80 × 250 beam): S = bh²/6 = 80·250²/6 = **833,333 mm³ ✓**
- Q `2d840f08` (M = Fb·S, Fb = 11 MPa, S = 1.2e6 mm³): 11·1.2e6/1e6 = **13.2 kN·m ✓**
- Q `335c9bff` (fb = M/S, M = 18 kN·m, S = 8e5 mm³): 18e6/8e5 = **22.5 MPa ✓**
- Q `dc29ab94` (rectangular shear fv = 3V/(2A), b=60, h=280, V=20 kN): 3·20000/(2·16800) = **1.786 MPa ✓** (correctly FAILS against Fv = 1.3 MPa)
- Q `010599cc` (effective Fb with adjustment 0.90): 10·0.90 = **9.0 MPa ✓**

### 3.4 lea-strc-011-03 (MSE backfill compaction)
Q `379760b9`: field 17.2 / lab 18.0 = **95.6 % ≥ 95 %**; moisture 12 % within 11 %+2 = 13 % boundary → satisfies criterion ✓.

### 3.5 lea-strc-012-01 (Wind classification, NSCP §207)
All six classification questions recomputed:
- Q `662044b0` (h = 20 m > 18 m): not low-rise ✓
- Q `c13d8387` (85 m / 25 m): ratio **3.4 < 4 → not flexible ✓**
- Q `853c8d7f` (22 m, freq 1.3 Hz): 22 > 18 m AND 22 < 4·28 = 112 AND 1.3 > 1.0 Hz → not low-rise, not flexible → general procedure ✓
- Q `6500b2df` (h = 12 m ≤ 18 m AND ≤ 50 m): low-rise ✓

---

## 4. NSCP Citation Verification (all PASS)

Cross-checked against published NSCP 2015 7th Edition chapter/section structure (web-verified).

### 4.1 Citations in current `question-edits/*.json` proposed blocks

| Bundle cluster | Citation in proposed block | Verdict |
|---|---|---|
| lea-strc-004-02 (seismic zones) | NSCP 2015 Vol. I §208.4.4.1 and Table 208-3 | **CORRECT** — Chapter 2 Earthquake Loads; Z=0.20 Zone 2, Z=0.40 Zone 4 |
| lea-strc-007-03 (deflection) | NSCP 2015 Vol. I §424.1, §424.2, Tables 424.2.2 & 424.2.4.1.3 | **CORRECT** — Chapter 4 Concrete serviceability |
| lea-strc-009-01 (decay/termite) | NSCP 2015 Vol. I §605 | **CORRECT** — Chapter 6 Wood "Decay and Termite Protection" |
| lea-strc-009-02 (timber stress) | NSCP 2015 Vol. I Table 615.2-1 & §622 | **CORRECT** — visually graded Philippine woods; machine-graded lumber rules |
| lea-strc-012-01 (wind) | NSCP 2015 Vol. I §207 definitions and wind-map notes | **CORRECT** — Chapter 2 Wind Loads |

### 4.2 Citations in `normalized.md` article bodies (direct grep)

Every NSCP reference inside an article body was inspected. All are accurate and properly bounded:

- `Section 208.4.4.1`, `Table 208-3` (lea-strc-004-02) ✓
- `Section 424.2`, `Section 424.2.2`, `Section 424.2.4`, `Table 424.2.2`, `Table 424.2.4.1.3` (lea-strc-007-03) ✓
- `Section 605.3` (lea-strc-009-01) ✓
- `Section 622.1`, `Section 622.2`, `Section 622.6`, `Table 615.2` (lea-strc-009-02) ✓

### 4.3 Critical pattern from Agent G — fabricated "NSCP 2015 §6.3.x" citations

Agent G previously flagged 10 fabricated citations in `lea-strc-007-05` (Pipe Embedments) pointing to NSCP Chapter 6 (Wood) for embedment rules. **Agent M confirms: this pattern does NOT appear anywhere in the structural stream.** No article body or question-edit in the 45 strc bundles cites "NSCP §6.3" or any Chapter 6 section for concrete/steel/embedment rules.

---

## 5. Pattern from Agent G — Material Property Values

Agent G flagged one wrong value: `lea-matl-003-04` Aluminum 6063-T6 UTS "186 MPa" (should be 190 MPa min, 186 is for T5 temper). **That article is in the materials stream (matl-), not the structural stream (strc-)**, so it is out of scope here. No equivalent material-property error appears in any strc bundle.

Material properties referenced in strc article bodies (and verified correct):

- **ACI 318 / NSCP concrete cover** (lea-strc-007-01): 75 mm cast-against-earth; 50 mm for #6+ bars exposed; 40 mm for #5– exposed; 20 mm protected slabs/walls ≤36 mm bars ✓ (web-confirmed via ACI 318 and UpCodes §1808.8.2)
- **Standard hooks** (lea-strc-007-02): 180° = 4 db ≥ 65 mm; 90° = 12 db; stirrup 90°/16 mm bars = 6 db; closed ties = 135° + 6 db ≥ 75 mm ✓
- **Column ties** (lea-strc-007-04): 10 mm ties for ≤32 mm bars; 12 mm for 36–57 mm/bundled; spacing min(16 db, 48 dt, least dim); 150 mm clear lateral support; spirals ≥10 mm, 25–75 mm clear, 1.5 extra turns ✓
- **Wall/diaphragm reinforcement** (lea-strc-007-06): ρ ≥ 0.0025 each way, spacing ≤ 450 mm ✓ (ACI 318 Ch. 18)
- **LRFD combination** (lea-strc-003-04): Pu = 1.2PD + 1.6PL ✓ (ASCE 7 / ACI 318)

---

## 6. Article Body Formula Spot-Check (all PASS)

Formulas stated explicitly in strc article bodies were checked against mechanics references:

| Article | Formula | Verdict |
|---|---|---|
| lea-strc-003-01 (stress-strain) | "stress proportional to strain in early straight portion" (Hooke) | ✓ |
| lea-strc-003-03 (modulus) | Young modulus E = stress/strain slope; G = shear stress/shear strain; K = volumetric | ✓ |
| lea-strc-005-01 (required strength) | Required strength = load effect demand from applicable factored combinations | ✓ |
| lea-strc-009-03 (timber ASD) | fb = M/S; S = bh²/6; I = bh³/12; fv = 3V/(2A); 1 MPa = 1 N/mm² | ✓ |
| lea-strc-002-05 (trusses) | Zero-force rules: 2 non-collinear @ unloaded joint; 3 with 2 collinear | ✓ |

---

## 7. Baseline `linked-questions.json` — Note on Superseded Citations

While the **baseline** `linked-questions.json` of several bundles still contains fabricated citations (left over from the original LLM generation pass), every such citation has been **superseded** by the corresponding `question-edits/*.json` file. Examples:

| Bundle | Baseline citation (FABRICATED) | Remediated in edit with (CORRECT) |
|---|---|---|
| lea-strc-004-02 | "NSCP 2015, Section 5.1 / 5.2" | NSCP 2015 Vol. I, §208.4.4.1 and Table 208-3 |
| lea-strc-007-03 | "NSCP 2015 Table 9.5.1" / "Table 409-1" | NSCP 2015 Vol. I, §424.1, §424.2, Tables 424.2.2 and 424.2.4.1.3 |
| lea-strc-009-01 | "Philippine Building Code §2401/2402", "NatCor", "ASEAN TCS 4-2019" | NSCP 2015 Vol. I, §605 |
| lea-strc-009-02 | "Philippine Building Code §2401", "NatCor Timber Grading", "ASEAN TCS 1-2019" | NSCP 2015 Vol. I, Table 615.2-1 and §622 |
| lea-strc-012-01 | "NBCP 2015 207.x; ASCE 7-22 / IBC 2021" | NSCP 2015 Vol. I, §207 definitions and wind-map notes |

The baseline JSONs are the pre-remediation snapshot. They are not learner-facing; the `question-edits/` directory is the live correction layer. No further action needed.

---

## 8. Conclusion

The structural stream is **clean**. Every numeric answer recomputes correctly, every formula stated is correct, every NSCP citation in current question-edits is accurate (Chapter 2 Earthquake §208, Chapter 2 Wind §207, Chapter 4 Concrete §424, Chapter 6 Wood §605/§615/§622), and all 500 existing question-edit JSON files are syntactically valid. The pre-existing error patterns flagged by Agents G (fabricated NSCP §6.3.x) and the fabricated baseline citations (Section 5.1/5.2, Table 9.5.1/409-1, NatCor/ASEAN TCS/Philippine Building Code §2401) have all been superseded by the batch-139-through-164 source-audit remediation already present in the corpus.

**No new question-edits written. No per-bundle remediation files needed.**

---

## Sources Consulted

- NSCP 2015 7th Edition Vol. I (Association of Structural Engineers of the Philippines) — verified via local OCR captures referenced in `source-audit-evidence.json` and cross-checked against publicly available chapter listings.
- ACI 318-14 (mirrored by NSCP 2015 Chapter 4) — concrete cover, hooks, ties, serviceability
- NSCP 2015 §208.4.4.1 and Table 208-3 — seismic zone factors (Z=0.20 Zone 2, Z=0.40 Zone 4) — verified via Scribd "Section 208 Earthquake Loads" extracts
- NSCP 2015 §207 — wind load definitions (basic wind speed, exposure categories, low-rise h ≤ 18 m, flexible f < 1 Hz) — verified via Scribd "Chapter 6 NSCP 2015 Wood" ASEP presentation and Studocu extracts
- NSCP 2015 §605 (Decay and Termite Protection), §615, §622 (Machine-Graded Lumber) — verified via ASEP NSCP 2015 Chapter 6 WOOD presentation
- Hibbeler, *Mechanics of Materials* — fb = M/S, fv = 3V/(2A) for rectangular sections
- UpCodes §1808.8.2 (Concrete Cover) — confirmed ACI 318 cover values
- WebSearch verifications (July 2026): NSCP 2015 seismic zone map / Table 208-3 / Section 208; ACI 318 Table 9.5(a) / 7.3.1.1 minimum thickness ratios; NSCP Chapter 6 wood section 605.
