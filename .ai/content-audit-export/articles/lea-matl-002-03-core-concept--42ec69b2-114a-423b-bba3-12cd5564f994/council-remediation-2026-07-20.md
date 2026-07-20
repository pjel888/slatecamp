# Council Remediation 2026-07-20 — Bundle Audit (Agent N, Materials)

**Bundle:** `lea-matl-002-03-core-concept--42ec69b2-114a-423b-bba3-12cd5564f994`
**Article slug:** `lea-matl-002-03-core-concept` (Masonry — units, vocabulary, CHB sizes)
**Auditor:** Agent N (Materials of Construction stream)
**Branch:** `fact-check/article-question-remediation` (read-only audit; no commit/push)
**Verdict:** REMEDIATION-ADEQUATE — no new question-edit files required; existing Batch 082 edits already address the residual fact-error pattern identified in this audit.

---

## 1. Why this bundle was examined

This bundle is the only Materials-stream bundle whose CURRENT `linked-questions.json` body contains verifiable external-standard numeric claims about ASTM C90 / NSCP 2015 loadbearing CMU compressive strength. Two of the ten questions carry the pre-2014 1,900 psi (13.1 MPa) value and a non-existent NSCP 2015 section citation.

## 2. Fact-check findings

### 2.1 CONFIRMED_FACT_ERROR (in current `linked-questions.json`, prior to edit application)

**Question `67e8e28f-4a02-4167-be96-70518fb531da`**
- Current text quotes "8 × 8 × 16 inch CHB ... 12 MPa ... design requires minimum 13.1 MPa."
- Current rationale.correct cites "NSCP 2015 Section 2402.1 specifies minimum net area compressive strength of 13.1 MPa (1900 psi) for loadbearing blocks, matching ASTM C90."
- Errors:
  1. **Outdated ASTM C90 value.** 1,900 psi (13.1 MPa) is the pre-2014 minimum. The 2014 revision (carried in ASTM C90-16 and reaffirmed in **ASTM C90-22**) raised the minimum average net area compressive strength to **2,000 psi (13.8 MPa)** for all weight classifications. See ASTM STP1577 (doi.org/10.1520/STP157720130160), CMHA TEK 001, MasonryInfo, and Ernest Maier "FAQ on Block" (citing C90-22 = 2,000 net psi).
  2. **Non-existent NSCP 2015 section citation.** NSCP 2015 masonry provisions are in **Chapter 7 (Masonry), Table 705-1** ("Specified Compressive Strength of Masonry, f'm"). "Section 2402.1" derives from the International Building Code (IBC), not NSCP 2015.

**Question `a35b7d04-f43d-4be9-9b56-4c8319a303f1`**
- Current text asks "ASTM C90 specifies a minimum net area compressive strength of ___ psi (___ MPa)."
- Current option (a) "1,900 psi (13.1 MPa)" is marked `correct_option_id: "a"`.
- Current rationale.correct repeats "ASTM C90 loadbearing units must achieve minimum 1,900 psi (13.1 MPa)."
- Current rationale.takeaway CONTRADICTS the answer: it says "ASTM C90 loadbearing = **2,000 psi**" — i.e., the takeaway already uses the correct current value while the answer key retains the superseded value. Internal inconsistency.
- Errors: same as Q67e8e28f — outdated pre-2014 ASTM C90 value.

### 2.2 CONFIRMED_CORRECT (no edit needed)

**Question `01cbd203-5490-4c8c-acab-8a7467a1a6b3`** correctly states "ASTM C62 clay brick minimum is 3,000 psi (20.7 MPa) average, compared to 2,000 psi (13.8 MPa) for C90 concrete blocks." — matches current ASTM C62 Grade SW (3,000 psi individual / 3,500 psi avg for weathering grade) and current ASTM C90-22.

**Question `320af392-aa3a-437d-81dd-e87e461b6931`** correctly states "C90 (loadbearing) requires 2,000 psi minimum." — matches current ASTM C90-22.

### 2.3 Bundle-level observation

The bundle's CURRENT linked-questions.json is internally inconsistent on the C90 value: two questions teach 1,900 psi, two questions teach 2,000 psi, against the same standard. This is exactly the kind of confusion a council remediation should resolve.

## 3. Existing remediation status

All 10 questions in this bundle already have a `question-edits/<uuid>.json` file created by the **Batch 082 local source-audit pass** (`approved_by: codex-local-source-audit-batch-082`, `approved_at: 2026-05-12T05:45:00+08:00`). Each proposed edit:

- Strips all numeric property-value claims from question text, options, rationale, and explanation.
- Replaces the question with a pure source-safe masonry vocabulary/concept item (bed, course, wythe, bond, stretcher, header, CHB sizes, CHB use).
- Aligns with the article body's scope statement (normalized.md lines 13-15): *"If a question asks for compressive strength, ASTM grade, or code capacity and that exact source is not provided, do not invent the value."*

Specifically:

| Question ID | Current (linked-questions.json) | Proposed (Batch 082 edit) | Resolves error? |
|---|---|---|---|
| `67e8e28f` | C90 13.1 MPa / NSCP §2402.1 (OUTDATED) | "What is a course in masonry terminology?" | YES — numeric claim removed |
| `a35b7d04` | C90 = 1,900 psi (13.1 MPa) (OUTDATED) | "Which description identifies a stretcher?" | YES — numeric claim removed |
| `01cbd203` | C90 = 2,000 psi (CORRECT) | "Which description best matches masonry in the checked source?" | YES — already correct, vocabulary-scoped |
| `320af392` | C90 = 2,000 psi (CORRECT) | "Which brick bond alternates courses of stretchers and headers?" | YES — already correct, vocabulary-scoped |
| other 6 questions | Various masonry vocabulary | Vocabulary (header, bed, wythe, CHB sizes, etc.) | YES — no fact issues |

## 4. Verdict

**REMEDIATION-ADEQUATE.** The Batch 082 question-edit files for this bundle already fully remediate the C90 1,900 psi / NSCP §2402.1 errors identified in Section 2.1. Once those proposed edits are applied, the bundle will contain zero external-standard numeric property claims, eliminating the ASTM C90-22 vs. pre-2014 inconsistency.

**No additional question-edit files are required from Agent N for this bundle.**

## 5. Recommendation

Apply the pending Batch 082 question-edit files for this bundle (and the other 46 Materials-stream bundles) to the live `linked-questions.json`. Until application, the current `linked-questions.json` will continue to expose learners to the superseded 1,900 psi value in Q67e8e28f and Qa35b7d04.

## 6. Sources cited

- **ASTM C90-22**, *Standard Specification for Loadbearing Concrete Masonry Units* (current edition; minimum average net area compressive strength = 2,000 psi / 13.8 MPa).
- ASTM STP1577, *STP157720130160*, "Recent Changes to ASTM C90" — documents the 2014 revision raising the minimum from 1,900 psi to 2,000 psi. https://doi.org/10.1520/STP157720130160
- Concrete Masonry & Hardscape Association (CMHA) TEK 001, "Concrete Masonry Unit Properties." https://www.cmha.org/resource/cmu-tec-001/
- Ernest Maier, "FAQ on Block" — "The minimum average net compressive strength per ASTM C90, as of the 2022 edition, is 2,000 net psi. Previous editions of C90 indicated 1,900 net psi." https://ernestmaier.com/faq-on-block/
- MasonryInfo, "How should specified net compressive strength (f'm) be specified?" https://www.masonryinfo.org/wp-content/uploads/2024/02/How-should-specified-net-compressive-strength-fm-be-specified.pdf
- **NSCP 2015 (NSCP 101-15)** Volume I, Chapter 7 (Masonry), Table 705-1 — masonry provisions; the cited "Section 2402.1" is IBC-derived, not NSCP.
