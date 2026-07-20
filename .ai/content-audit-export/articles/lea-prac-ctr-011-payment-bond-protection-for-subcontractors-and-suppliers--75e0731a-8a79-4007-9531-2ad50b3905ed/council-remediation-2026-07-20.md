# Council Remediation - lea-prac-ctr-011 (Payment Bond)

**Bundle:** lea-prac-ctr-011-payment-bond-protection-for-subcontractors-and-suppliers
**Bundle ID:** `75e0731a-8a79-4007-9531-2ad50b3905ed`
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

## CONFIRMED_ERROR - V.CTR-011-1: Payment bond percentage

**Original question text:** "What is a typical payment bond amount as a percentage of the contract price?"

**Original marked-correct (option `b`):** "50% to 100%, commonly 100% of the contract price"

**External truth (verified):** Under CIAP Document 102 and UAP Document 301, the standard payment bond (sometimes called a "labor and materials bond") for Philippine private construction is **15% of the contract amount**, posted alongside the performance bond to protect subcontractors and suppliers. The "50%-100%, commonly 100%" figure is a US Miller Act convention and does not reflect the Philippine source-of-truth.

**Source citations:**
- CIAP Document 102 refined markdown lines 813-814 (local source capture, sha256 `013cb47a...`)
- UAP Document 301 refined markdown lines 488-492 (local source capture, sha256 `3aa99e2c...`)
- Standard triplet under UAP Doc 301 / CIAP Doc 102: Performance Bond 15% + Payment Bond 15% + Guarantee Bond 30% (the 60% aggregate combination bond is also recognized)

**Why this is CONFIRMED_ERROR:** The marked-correct option contradicts the bundle's governing sources. The other three options (5-10%, 200%, fixed amount) are also source-incorrect, leaving no valid correct answer in the original question.

---

## Remediation already applied (Batch 109)

The 10 existing question-edit files in this bundle (approved_by `codex-local-source-audit-batch-109`) correctly:
- Reset the payment bond amount to **15% of the contract amount** with code_citation "CIAP Document 102 lines 813-814"
- Replace the US-import "100%" framing with the CIAP/UAP figure
- Add source_audit_support blocks citing both CIAP Doc 102 and UAP Doc 301 with sha256 hashes

**Agent V verification:** Sampled the batch directly; all 10 files pass `jq empty`. Schema matches existing convention.

---

## Items NOT requiring new question-edits

The remaining 9 original questions in this bundle (subcontractor/supplier protection scope, change-order effects on bond, dual-breach scenarios) are either source-consistent or already refreshed by the 9 companion Batch 109 edits.

---

## Outcome

**Status: PRE-REMEDIATED.** All CONFIRMED_ERROR items already have validated question-edit files in place. No new files written by Agent V.
