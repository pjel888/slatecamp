# Council Remediation - lea-prac-eth-008 (Grounds for Suspension/Revocation)

**Bundle:** lea-prac-eth-008-grounds-for-suspension-and-revocation-of-the-certificate-of-registration
**Bundle ID:** `4b4de57e-db7f-44d9-98f7-a0a1fe6e2428`
**Date:** 2026-07-20
**Auditor:** Agent V (lea-prac-ctr + lea-prac-eth streams)
**Status:** PRE-REMEDIATED (verified) — Batch 113 question-edits already correct and applied

---

## Summary

| Item | Count |
|---|---|
| Linked questions audited | 10 |
| CONFIRMED_ERROR questions | 3 (Section 23 sub-letter mislabeling) |
| Article body errors | 0 (normalized.md correctly enumerates all six 23(a)-23(f) grounds) |
| Question-edit files in `question-edits/` | 10 (Batch 113, all `jq empty` valid) |
| Net new question-edits required from Agent V | 0 |

---

## CONFIRMED_ERROR - V.ETH-008-1: Section 23(b) mislabeled as "aiding unauthorized practice"

**Original question text:** "Under RA 9266 Section 23-b, an architect 'aids unauthorized practice' when the architect takes which action?"

**External truth (verified RA 9266 IRR Section 23 verbatim):**

| Letter | Ground (verbatim) |
|---|---|
| **23(a)** | Signing or permitting use of architect's name/seal on documents not prepared by the architect or not under immediate supervision |
| **23(b)** | Paying money, except regular fees, to secure a certificate of registration |
| **23(c)** | Falsely impersonating a practitioner or practicing under an assumed/fictitious/corporate name other than the registered name |
| **23(d)** | Aiding or abetting the practice of architecture by a person not duly authorized to practice architecture in the Philippines |
| **23(e)** | Openly soliciting projects by undertaking architectural services without a valid service agreement guaranteeing compensation |
| **23(f)** | Violating RA 9266, its IRR, the Code of Ethical Conduct, or the Standards of Professional Practice |

**Error:** "Aiding unauthorized practice" is ground **23(d)**, not 23(b). 23(b) concerns paying money (bribery) to secure a certificate of registration. The original question stem mis-cites the sub-letter.

**Source citations:**
- RA 9266 IRR Section 23 (verified verbatim against lawph / PRBoA published IRR)
- Batch 154 source capture refined markdown (sha256 `bdc987f6...`)

---

## CONFIRMED_ERROR - V.ETH-008-2: Section 23(c) mislabeled as "improper solicitation"

**Original question text:** "RA 9266 Section 23-c addresses improper solicitation. Which scenario represents a violation of this section?"

**Error:** "Improper solicitation" / no-service-agreement exploitation is ground **23(e)**, not 23(c). 23(c) concerns practicing under a fictitious or assumed name. The original question stem mis-cites the sub-letter.

---

## CONFIRMED_ERROR - V.ETH-008-3: Section 24 reinstatement characterized as "retake exam mandatory"

**Original question text:** "An architect's registration is revoked for repeatedly sealing work not personally prepared. According to Section 24 of the IRR, what is required for the architect to reregister?"

**Original marked-correct (option `b`):** "Retaking and passing the licensure examination; waiting two years does not guarantee reinstatement without demonstrating remediation"

**External truth (verified):** Section 24 says the Board **may**, after two years from revocation and upon application for reasons deemed proper and sufficient, reinstate the validity of a revoked certificate. **The Board may also, in its discretion, exempt the applicant from taking another examination.** Retaking the licensure exam is therefore NOT categorically required; reinstatement is discretionary and exam-exemptible.

**Error:** The original marked-correct answer overstates the exam requirement as mandatory. The remediation question (Q4 in array order) correctly captures the discretionary, exam-exemptible nature of Section 24.

---

## Remediation already applied (Batch 113)

The 10 existing question-edit files in this bundle (approved_by `codex-local-source-audit-batch-113`) correctly:

| Batch-113 file stem | Topic | Correctly cites |
|---|---|---|
| `edc79348` | Sealing documents not self-prepared | **23(a)** (lines 592-599) |
| `b38b4c8d` | Fictitious name | **23(c)** (lines 604-607) |
| `f7d55217` | Aiding unauthorized practice | (lines 608-610 — correctly 23(d) by content, not "23-b") |
| `b10b3f85` | Service agreement / solicitation | **23(e)** (lines 612-614) |
| `b3d6f710` | Reinstatement under Section 24 | Discretionary, exam-exemptible (lines 626-630) |
| `652b4908` | Notice + hearing requirement | (lines 592-595) |
| `b8567397` | Board motu proprio power | (lines 622-624) |
| `5d63ff24` | Written sworn charges | (lines 622-624) |
| `b72282c0` | Detailed evidence rules deferred | (lines 622-624) |
| `fd15b249` | Avoid automatic-reinstatement claim | (lines 626-630) |

**Agent V verification:** Sampled batch directly. The earlier confirmation that "aiding unauthorized practice" maps to 23(d) is reflected in the question content (option text: "Aiding or abetting the practice of architecture by a person not duly authorized in the Philippines"), even where the option label uses the generic letter `a` for the correct answer rather than restating "23(d)" in the option text. This is consistent with normal MCQ style (letter label = correct option, not statutory sub-letter).

All 10 files pass `jq empty`. Schema matches convention.

---

## Items NOT requiring new question-edits

All 10 original questions in this bundle are either source-consistent or already refreshed by Batch 113 edits.

---

## Outcome

**Status: PRE-REMEDIATED.** All CONFIRMED_ERROR items already have validated question-edit files in place. No new files written by Agent V.
