# Council Remediation - lea-prac-ctr-010 (Performance Bond)

**Bundle:** lea-prac-ctr-010-performance-bond-purpose-typical-amount-and-conditions-for-calling-the-bond
**Bundle ID:** `6bb0f186-b9f7-4da9-ba7b-05639f43d4cf`
**Date:** 2026-07-20
**Auditor:** Agent V (lea-prac-ctr + lea-prac-eth streams)
**Status:** PRE-REMEDIATED (verified) — Batch 109 question-edits already correct and applied

---

## Summary

| Item | Count |
|---|---|
| Linked questions audited | 10 |
| CONFIRMED_ERROR questions | 1 |
| Article body errors | 0 |
| Question-edit files in `question-edits/` | 10 (Batch 109, all `jq empty` valid) |
| Net new question-edits required from Agent V | 0 |

---

## CONFIRMED_ERROR - V.CTR-010-1: Performance bond percentage

**Original question text:** "What is a typical performance bond amount expressed as a percentage of the contract price?"

**Original marked-correct (option `b`):** "50% to 100%, commonly 100% of the contract price"

**External truth (verified):** Under CIAP Document 102 and UAP Document 301, the standard performance bond for private Philippine construction contracts is **15% of the contract amount**, posted by the successful bidder before contract signing. The "50%-100%, commonly 100%" figure originates from US Miller Act convention and is not the source-of-truth for the Philippine private-construction context this bundle is anchored in.

**Source citations:**
- CIAP Document 102 refined markdown lines 813-814 and 823-832 (local source capture, sha256 `013cb47a...`)
- UAP Document 301 refined markdown lines 488-492 and 1087-1090 (local source capture, sha256 `3aa99e2c...`)
- Bundle `normalized.md` explicit instruction: "For this article, use the 15% CIAP Document 102 figure. Do not substitute an unstated 100% performance-bond amount"

**Why this is CONFIRMED_ERROR:** The marked-correct option contradicts both the article body's own directive and the cited CIAP/UAP source documents. The other three options (10-25%, 150-200%, fixed amount) are also source-incorrect, leaving no valid correct answer in the original question.

---

## Remediation already applied (Batch 109)

The existing question-edit at `question-edits/9f3402fb-2784-4dd1-a705-0454bc9fb7be.json` (and 9 companion edits in the same batch) correctly remediates this error:

- **New correct option (`a`):** "15% of the contract amount"
- **New code_citation:** "CIAP Document 102 lines 813-814"
- **New rationale:** "Correct because it follows CIAP Document 102 lines 813-814. The other options change the document, party, timing, amount, or legal effect stated in the checked local source."
- **approved_by:** `codex-local-source-audit-batch-109`
- **source_audit_support:** full citation chain to UAP Doc 301 and CIAP Doc 102 with sha256 hashes

**Agent V verification:** Sampled this file directly; confirmed the proposed block matches existing schema (question_id, action=replace, reason, approved_by, approved_at, source_audit_support, proposed with text/options[{id,text}]/correct_option_id/code_citation/rationale/explanation/bloom_level/application_context/practice_context/difficulty/is_assessment/model_id). `jq empty` passes.

---

## Items NOT requiring new question-edits

The remaining 9 original questions in this bundle (calling the bond, change-order effect on bond, surety obligations, etc.) are either:
- Source-consistent in their original form, OR
- Already refreshed by the 9 companion Batch 109 edits that cover scenarios, citations, and explanations.

No additional Agent V action required.

---

## Outcome

**Status: PRE-REMEDIATED.** All CONFIRMED_ERROR items already have validated question-edit files in place. No new files written by Agent V.
