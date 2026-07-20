# Council Remediation - lea-prac-eth-006 (Obligations to Fellow Architects)

**Bundle:** lea-prac-eth-006-obligations-to-fellow-architects-non-poaching-non-interference-and-professional-cou
**Bundle ID:** `bceaa05b-1eaa-4369-a29c-fbd8aef6937b`
**Date:** 2026-07-20
**Auditor:** Agent V (lea-prac-ctr + lea-prac-eth streams)
**Status:** PRE-REMEDIATED (verified) — Batch 112 question-edits already correct and applied

---

## Summary

| Item | Count |
|---|---|
| Linked questions audited | 10 |
| CONFIRMED_ERROR questions | 4 (citation framework + invented percentage formulas) |
| Article body errors | 0 (normalized.md correctly anchors to UAP Code Section 5-c/5-e/5-f/5-g/5-k) |
| Question-edit files in `question-edits/` | 10 (Batch 112, all `jq empty` valid) |
| Net new question-edits required from Agent V | 0 |

---

## CONFIRMED_ERROR - V.ETH-006-1: Wrong source-citation framework

**Original pattern:** Multiple questions in `linked-questions.json` cite **"Article VI, Rule 7.4"** and "Article VI" framing for fellow-architect obligations (e.g., "Under Article VI, Rule 7.4, what credit may the architect claim if 75% of the original floor area remains unchanged?").

**External truth (verified):** The UAP Code of Ethical Conduct organizes duties by **Section number**, not "Article VI, Rule 7.4". Fellow-architect obligations live in **Section 5** with lettered sub-rules:
- Section 5-c: do not seek commissions known to be previously endowed to another architect
- Section 5-e: notify the previous architect and confirm termination + compensation before assuming an assigned commission
- Section 5-f: notify the original architect for additions/rehabilitation/remodeling; limit public claims to the work actually done when the original mass/design is substantially maintained
- Section 5-g: no knowingly false or malicious injury to another architect's reputation
- Section 5-k: technical information sharing and unity in the fellowship of the profession

The "Article VI, Rule 7.4" framework appears to come from a different code (likely a PD 1096 National Building Code reference or a mis-remembered PRBoA document). It is not the UAP Code of Ethical Conduct structure that this bundle's `normalized.md` is anchored to.

**Source citations:**
- UAP Code of Ethical Conduct refined markdown lines 85-101 (local source capture)
- Bundle `normalized.md` Section 5 enumeration (verified lines 7-40 of normalized.md)

---

## CONFIRMED_ERROR - V.ETH-006-2: Invented percentage-credit formulas

**Original pattern:** Multiple questions invent specific percentage-credit formulas not in the source:
- "An architect performs 35% of renovation work on a structure where 65% of the original design remains in place..."
- "if 75% of the original floor area remains unchanged..."
- "completes 40% of a renovation project... describe 'our design approach'..."

**External truth (verified):** Section 5-f of the UAP Code says only that **"if the greater mass, area, or design of the original structure is substantially maintained, the new architect should limit advertising or claims only to the extent of work done to the structure."** The Code contains **no numerical percentage threshold**. The bundle `normalized.md` Exam Traps section explicitly warns: "Using exact percentage-credit math not found in the source."

**Why this is CONFIRMED_ERROR:** The original questions test invented numeric thresholds (35/65, 75%, 40%) that the UAP Code does not state. Examinees learning from these questions would internalize fabricated rules.

---

## Remediation already applied (Batch 112)

The 10 existing question-edit files in this bundle (approved_by `codex-local-source-audit-batch-112`) correctly:
- Re-cite to **UAP Code of Ethics lines 85-101** with proper Section 5-c/5-e/5-f/5-g/5-k mapping
- Drop the "Article VI, Rule 7.4" framing entirely
- Explicitly defer exact-percentage-credit questions ("How should exact percentage-credit questions be handled in Batch 112?" → correct answer: "Avoid them; the source gives no numerical formula")
- Preserve the source-backed rule: notify the previous architect + limit public claims to actual work done when original mass/design is substantially maintained

**Agent V verification:** Sampled batch directly; all 10 files pass `jq empty`. Schema matches convention.

---

## Items NOT requiring new question-edits

All 10 original questions in this bundle are either source-consistent or already refreshed by Batch 112 edits.

---

## Outcome

**Status: PRE-REMEDIATED.** All CONFIRMED_ERROR items already have validated question-edit files in place. No new files written by Agent V.
