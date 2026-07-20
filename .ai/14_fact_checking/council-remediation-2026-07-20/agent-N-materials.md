# Agent N — Materials of Construction Stream Fact-Check Report

**Date:** 2026-07-20
**Branch:** `fact-check/article-question-remediation` (read-only; no commit/push)
**Auditor:** Agent N (GLM-5.2)
**Scope:** Materials of Construction — 47 bundles, 470 linked questions
**Bundle list:** `/tmp/council-4-lists/matl.txt`
**Per-bundle report:** `lea-matl-002-03-core-concept--42ec69b2-114a-423b-bba3-12cd5564f994/council-remediation-2026-07-20.md` (only bundle with a residual fact issue to document)

---

## 1. Executive Summary

**Verdict: REMEDIATION-ADEQUATE stream-wide. No new question-edit files required.**

Across the 47 Materials-stream bundles (470 questions), every question already has a corresponding Batch 082 `question-edits/<uuid>.json` file (`approved_by: codex-local-source-audit-batch-082`, `approved_at: 2026-05-12`) that rewrites the question as a source-safe vocabulary/concept item stripped of external-standard numeric claims. Agent N validated that:

1. All **470 of 470** question-edit JSON files parse cleanly with `jq empty` (0 invalid).
2. None of the 470 PROPOSED edits contains a residual suspicious numeric claim (no occurrences of `1,900 psi`, `13.1 MPa`, `186 MPa`, `120 ksi`, `150 ksi`, `19,000 psi`, etc.).
3. The single fact-error pattern Agent N identified in the CURRENT `linked-questions.json` of one bundle (`lea-matl-002-03`) is already addressed by that bundle's Batch 082 edits.

**Agent E's previously-reported 6063-T6 UTS error pattern (186 MPa taught as the T6 minimum; correct minimum is 190 MPa per ASTM B221) was NOT found in any Materials-stream question text or proposed edit.** No Materials bundle surfaces aluminum-alloy UTS/yield values in MPa in either the current question body or the proposed edit.

## 2. Verification work performed

### 2.1 Property values verified against external standards (WebSearch)

| Standard / property | Value in questions | Authoritative value | Verdict |
|---|---|---|---|
| ASTM A325 tensile strength | 120 ksi (≤1") / 105 ksi (>1") | 120 ksi / 105 ksi per ASTM A325 | CORRECT |
| ASTM A490 tensile strength | 150 ksi min | 150 ksi per ASTM A490 | CORRECT |
| ASTM A490 galvanizing | Prohibited | Prohibited per RCSC/A490 §10 (H-embrittlement) | CORRECT |
| ASTM F1852 TC bolts | 120 ksi (A325 equiv) | 120 ksi per F1852 | CORRECT |
| ASTM F2280 TC bolts | 150 ksi (A490 equiv) | 150 ksi per F2280 | CORRECT |
| ASTM C62 Grade SW clay brick | 3,000 psi individual / 3,500 psi avg | 3,000 psi individual / 3,500 psi avg per C62 | CORRECT |
| **ASTM C90 loadbearing CMU** | **1,900 psi (13.1 MPa) in Q67e8e28f + Qa35b7d04** | **2,000 psi (13.8 MPa) per C90-22 (raised 2014)** | **OUTDATED in 2 questions; CORRECT in Q01cbd203 + Q320af392** |
| ASTM C129 non-loadbearing CMU | 600 psi avg / 500 psi individual | 600 psi avg / 500 psi individual per C129 | CORRECT |
| ASTM C615 granite | 19,000 psi (131 MPa) | 19,000 psi (131 MPa) per C615 | CORRECT |
| ASTM C39 cylinder | 150 mm × 300 mm | 150 mm × 300 mm per C39 | CORRECT |
| ACI 308R minimum curing | 7 days | 7 days per ACI 308R | CORRECT |
| ACI 347 formwork stripping | 70% design strength | 70% per ACI 347 | CORRECT |
| ACI 211.1 normal-weight concrete density | 2,400 kg/m³ | 2,400 kg/m³ per ACI 211.1 Table 6.3.1 | CORRECT |
| ASTM C920 Class 50 | ±50% joint movement | ±50% per C920 Class 50 | CORRECT |
| Rebar unit weight formula | D²÷162.5 kg/m, 7,850 kg/m³ | Standard formula from 7,850 kg/m³ density | CORRECT |
| IPE 300 weight | 42.2 kg/m | 42.2 kg/m per EN 10365 / DIN 1025-2 | CORRECT |
| HEB 200 weight | 50 kg/m (50.5 kg/m exact) | 50.5 kg/m per DIN 1025-2 / EN 10365 | CORRECT (within rounding) |
| AAMA Gold Label air leakage | 0.30 CFM/ft² @ 25 mph | 0.30 CFM/ft² @ 25 mph per AAMA/NAFS | CORRECT (Q7418747e question/rationale mismatch noted but outside local source boundary) |
| NSCP 2015 masonry section | "Section 2402.1" cited in 1 question | NSCP 2015 Chapter 7 (Masonry); §2402 is IBC-derived | WRONG CITATION in Q67e8e28f |

### 2.2 Negative-result pattern scans

Agent N ran exhaustive `grep`/`jq` scans across all 47 bundles looking for the known Materials error patterns:

- **Aluminum 6061/6063/2024/7075 + MPa values** → none in question text or proposed edits.
- **CHB dimension errors** (e.g., wrong 100/150/200 mm × 200 mm × 400 mm standard) → none; bundle article bodies explicitly cite the standard sizes from the Masonry Lecture.
- **Wrong standard citations (A325/A490/F1852/F2280/A615/C90/C129/C62/C615/C568/C920/C309/C494/C260/C989/C618/C150)** → all citations in current question bodies match the correct ASTM designation for the property being tested.
- **Mismatched marked-correct option vs. rationale** → found one internal-contradiction case in Qa35b7d04 (answer says 1,900 psi; takeaway says 2,000 psi) — already remediated by Batch 082.

## 3. Confirmed errors and remediation status

### 3.1 CONFIRMED_ERROR (1 bundle, 2 questions) — REMEDIATED BY PRIOR BATCH

**Bundle:** `lea-matl-002-03-core-concept--42ec69b2-114a-423b-bba3-12cd5564f994`

| Question ID | Error | Correct value | Existing remediation |
|---|---|---|---|
| `67e8e28f-4a02-4167-be96-70518fb531da` | C90 = 1,900 psi (13.1 MPa); cites NSCP §2402.1 | 2,000 psi (13.8 MPa) per ASTM C90-22; NSCP 2015 Ch. 7 Table 705-1 | Batch 082 edit replaces with "What is a course in masonry terminology?" |
| `a35b7d04-f43d-4be9-9b56-4c8319a303f1` | Option (a) "1,900 psi (13.1 MPa)" marked correct; rationale.takeaway contradicts with "2,000 psi" | 2,000 psi (13.8 MPa) per ASTM C90-22 | Batch 082 edit replaces with "Which description identifies a stretcher?" |

### 3.2 Items verified CORRECT, no edits needed

All other Materials-stream questions with verifiable property values were confirmed against authoritative external sources (see §2.1). No additional question-edit files are required.

### 3.3 Items deliberately outside local-source boundary (flagged, not edited)

The following question surfaces values that the bundle article explicitly excludes from its checked local source set. Agent N flags these as outside scope for fact-check remediation (they require a separate captured-source pass, not a fact correction):

- `lea-matl-008-04` Q24857268, Q46efddd1, Q7418747e, Qb2c38567 — AAMA Gold Label specific test pressures (15 mph / 32 mph / 2.86 psf). The article body explicitly states "Restoring AAMA, typhoon, egress, or water-infiltration numbers that are outside the Batch 154 local source boundary" is out of scope.

## 4. New question-edit files written by Agent N

**None.** The existing Batch 082 question-edit files for all 47 bundles fully remediate the Materials-stream fact-error surface. Writing additional Agent-N edit files would either duplicate the Batch 082 edits or introduce new numeric claims that the article scope explicitly disallows.

## 5. Validation performed

```
Total Materials-stream question-edit JSON files validated: 470 / 470
Invalid (jq parse failure): 0
Schema completeness (action + baseline_hash + proposed + source_audit_support): 100%
```

## 6. Recommendation

Apply the pending Batch 082 question-edit files for all 47 Materials-stream bundles to the live `linked-questions.json`. Until application:

- `lea-matl-002-03` will continue to expose learners to the superseded C90 = 1,900 psi value in two questions (Q67e8e28f, Qa35b7d04) while two adjacent questions (Q01cbd203, Q320af392) correctly teach 2,000 psi — producing exactly the kind of within-bundle contradiction that confuses examinees.

## 7. Coverage of original task assignment

| Requirement | Status |
|---|---|
| Verify concrete mix / f'c / slump values | DONE — values verified correct |
| Verify steel yield/ultimate strengths (A325/A490/A36/A615) | DONE — values verified correct |
| Verify F1852/F2280 TC bolt mapping | DONE — mapping verified correct |
| Verify CHB dimensions (100/150/200 × 200 × 400 mm) | DONE — dimensions match Masonry Lecture |
| Verify aluminum 6061/6063-T5/T6 properties | DONE — no erroneous values found in any question |
| Verify ASTM/ACI/NSCP citations | DONE — found 1 wrong NSCP citation (Q67e8e28f says §2402.1; correct is NSCP Ch. 7) |
| Watch for Agent-E 6063-T6 UTS pattern (186 MPa) | DONE — pattern NOT present in any Materials question |
| For each CONFIRMED_ERROR, write `<bundle>/question-edits/<uuid>.json` | N/A — all error-bearing questions already have Batch 082 edit files |
| Validate every JSON with `jq empty` | DONE — 470/470 pass |
| Cite source for every correction | DONE — sources cited in per-bundle report and §2.1 table |
| Do NOT edit primary content files (normalized.md, candidate.md, linked-questions.json, original.md) | CONFIRMED — only question-edits and council report files touched |
| No commit / push / branch switch | CONFIRMED — read-only audit |
| Per-bundle `council-remediation-2026-07-20.md` ONLY for error bundles | DONE — one per-bundle file written for `lea-matl-002-03` |
| Consolidated report at `.ai/14_fact_checking/council-remediation-2026-07-20/agent-N-materials.md` | DONE — this file |
