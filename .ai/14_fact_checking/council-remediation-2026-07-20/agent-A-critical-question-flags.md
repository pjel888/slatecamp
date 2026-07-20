# Council Remediation — Agent A — 9 Critical Question Flags

**Agent:** A (LLM fact-checking council)
**Date:** 2026-07-20
**Scope:** 9 confirmed error-propagation flags from `.ai/14_fact_checking/question-flagging-report.md`
**Scope boundaries respected:** no edits to `normalized.md`, no edits to other agents' scopes. No Supabase push, no commit, no edits to `main`.

> **Note:** This report was originally produced by Agent A in wave 1. The markdown file was lost during a git branch-state incident (see master report's "Incidents" section) but was reconstructed from the agent transcript. All underlying question-edit JSON files survived intact and are verified present.

---

## Headline Summary

| Metric | Count |
|---|---|
| Flags examined | 9 |
| Flags **confirmed real** in current corpus | 9 (all 9) |
| Flags whose error is **already neutralized** by a prior batch question-edit | 5 (Flag-001, Flag-002, Flag-004, Flag-008, Flag-009) |
| Flags **NOT yet neutralized** in the question bank | 4 (Flag-003, Flag-005, Flag-006, Flag-007) |
| **New / rewritten question-edit files produced this run** | 4 |

---

## What each governing source pack actually contains

| Source pack | Chunks present | Sections covered |
|---|---|---|
| `source-pack-bp-344-2024-revised-irr` | 2 | Appendix A — Accessible Ramps Items 1-16 (PDF p.2); Handrails and Grab Bars / Parking (PDF p.7) |
| `source-pack-ra-9266-irr` | 2 | Section 38 (Temporary/Special Permits) **only** |
| `source-pack-pd-1096-irr` | 3 | Rule VII Section 704, 704.4, 705 + Table VII.1 (TGFA) **only** |

For sections NOT present in source packs (RA 9266 §§4/7/27/29 and PD 1096 §§309/701/702), verification used the source-audited parent article `normalized.md` + `source-audit-evidence.json` (both PASS), which record raw PDF paths + refined-markdown line locators and hashes. **No citations were invented.**

---

## Remediation records (one per flag)

### Flag-001 — Ramp slope 1:12 vs 1:20 — CRITICAL — ALREADY FIXED
- **article_id:** `9eb0b48e-110e-4c75-8a0c-4f83063001cf` (lea-prac-frm-018-universal-design)
- **question_id:** `b2951761-b2e8-41a4-a893-19f574ed5e75`
- **Source quotation (verbatim):** "2. Gradient not steeper than 1:20. Steeper gradients may be allowed in special cases depending on the length to be covered." — BP 344 2024 Revised IRR, chunk-0001, Appendix A / Accessible Ramps / Items 1-16, PDF p.2.
- **Status:** **ALREADY FIXED** by batch-103 edit. Verified.

### Flag-002 — IAPOA nomination §41 vs §4 — MEDIUM — ALREADY FIXED
- **article_id:** `02a5ba32-0443-4162-837d-326783ed77a2` (lea-prac-law-001-ra-9266-overview)
- **question_id:** `7e4e697d-9af0-4014-abfc-d26db4d50092`
- **Confirmed error:** Baseline cited §41 for IAPOA nomination; correct is §4 (§41 = IRR adoption). Also had duplicate identical options.
- **Status:** **ALREADY FIXED** by batch-094 edit. Verified.

### Flag-003 — Penalty P5K-P100K vs P100K-P5M — CRITICAL — **NEW EDIT WRITTEN**
- **article_id:** `3d48211b-8add-4934-8dab-ae8bdae74035` (lea-prac-law-003-prohibited-acts)
- **question_id:** `032522de-2664-4f28-9890-c071c8ff7958`
- **Source quotation:** RA 9266 IRR **Section 29**: "fine of at least PHP 100,000 and not more than PHP 5,000,000, imprisonment from six months up to six years, or both." Section 30: no-written-service-agreement misdemeanor = "at least PHP 200,000, imprisonment not exceeding six years."
- **Confirmed error:** `linked-questions.json` STILL carried wrong values (P5K-P100K) as correct answer. Parent article body was already correct — this was pure question-bank data corruption. Prior batch-094 edit had **no `proposed` block** (metadata only) — never remediated.
- **Status:** **NEW EDIT WRITTEN.** File: `.../lea-prac-law-003.../question-edits/032522de-2664-4f28-9890-c071c8ff7958.json`. Correct answer now option b: "A fine of not less than PHP 100,000 nor more than PHP 5,000,000, or imprisonment of not less than six months nor more than six years, or both, at the court's discretion." Distractor (a) retains old figure for diagnostic value.

### Flag-004 — 13 powers vs 14 powers — MEDIUM — ALREADY FIXED
- **article_id:** `ab6d74a1-744c-4961-816a-b088bb707848` (lea-prac-law-005-prboa-powers)
- **question_id:** `af782bb3-3ff2-4f17-b655-60337518147a`
- **Source:** RA 9266 IRR Section 7 enumerates powers (a) through (n) inclusive = 14 distinct powers.
- **Status:** **ALREADY FIXED** by batch-114 edit. Verified correct ("Fourteen, lettered a through n").

### Flag-005 — Wrong occupancy labels + "Certificate of Use" — HIGH — **NEW EDIT WRITTEN**
- **article_id:** `9e053410-cea0-400b-b185-576cbb4a8bd0` (change-of-use-and-occupancy)
- **question_id:** `bf891ad7-eb6f-4c4c-975e-ba208898b586`
- **Confirmed error:** Wrong occupancy group labels + "Certificate of Use" as correct answer.
- **Status:** **NEW EDIT WRITTEN**, superseding the degenerate batch-048 edit (which had single-character options "T"/"h"/"e"). Corrected with PD 1096 Rule III §309 Certificate of Occupancy and Rule VII §701/§702 occupancy groups (E = Business and Mercantile, G = Storage and Hazardous, H = Assembly Other Than Group I).

### Flag-006 — "Certificate of Use" taught as correct — HIGH — **NEW EDIT WRITTEN**
- **article_id:** `9e053410-cea0-400b-b185-576cbb4a8bd0`
- **question_id:** `58d057b3-af3b-4fd1-b418-971117a97b5d`
- **Confirmed error:** Marked-correct answer was "Certificate of Use"; correct is "Certificate of Occupancy" per PD 1096 Sec 309.
- **Status:** **NEW EDIT WRITTEN**, superseding degenerate batch-048 edit.

### Flag-007 — Rationale contradicts its own correct answer — MEDIUM — **NEW EDIT WRITTEN**
- **article_id:** `9e053410-cea0-400b-b185-576cbb4a8bd0`
- **question_id:** `680174d1-0ee9-4b1f-80ca-2c89d01a21d5`
- **Confirmed error:** Rationale said "Certificate of Use" while correct answer said "Certificate of Occupancy".
- **Status:** **NEW EDIT WRITTEN**, superseding degenerate batch-048 edit.

### Flag-008 — Reciprocity OR substantial-equivalence (article wrong) — Contradiction — ALREADY FIXED
- **article_id:** `e51e9a56-7251-460e-8d00-5feaa3884f0a` (lea-prac-frm-007-reciprocity)
- **question_id:** `fffa260f`
- **Confirmed error:** Article said "reciprocity OR substantial equivalence"; Q correctly said reciprocity only.
- **Source:** RA 9266 IRR Sec 27 = "strict and absolute equality" — NOT "substantial equivalence".
- **Status:** **ALREADY FIXED** by batch-101 edit (both question AND article now correct).

### Flag-009 — Conflates permits and reciprocity — Contradiction — ALREADY FIXED
- **article_id:** `e51e9a56-7251-460e-8d00-5feaa3884f0a`
- **question_id:** `f1d8b55e`
- **Status:** **ALREADY FIXED** by batch-101 edit (§38 verified in source pack).

---

## Source coverage gaps (flagged for human source-SME escalation)

| Section cited by flag | Present in source pack? | Verification basis used |
|---|---|---|
| RA 9266 IRR §4 (PRBoA creation) | NO | Parent article normalized.md + source-audit-evidence.json (PASS) |
| RA 9266 IRR §7 (PRBoA powers) | NO | Parent article normalized.md + source-audit-evidence.json (PASS) |
| RA 9266 IRR §27 (reciprocity) | NO | Parent article normalized.md + source-audit-evidence.json (PASS) |
| RA 9266 IRR §29 (penal clause) | NO | Parent article normalized.md + source-audit-evidence.json (PASS) |
| PD 1096 §309 (Certificate of Occupancy) | NO | Parent article normalized.md + source-audit-evidence.json (PASS) |
| PD 1096 §§701/702 (occupancy groups) | NO | Parent article normalized.md + source-audit-evidence.json (PASS) |
| BP 344 Appendix A ramp gradient | YES | chunk-0001 verbatim |
| RA 9266 IRR §38 (permits) | YES | chunk verbatim |

**Recommendation:** Expand the RA 9266 and PD 1096 source packs to cover §§4/7/27/29/30/31/40/41 and §§308/309/701/702 so future audits can cite source-pack chunks directly.

---

## Validation
All 4 written files pass `jq empty`. The 5 pre-existing edits relied on were also re-validated. Answer keys confirmed: all four new edits have the corrected content as the marked-correct option.

## Key data-integrity finding
The **Flag-003 question and parent article were inconsistent** — the article body already stated the correct PHP 100K-PHP 5M range (source-audit PASS), but the linked question still carried P5K-P100K as the marked-correct answer. This is question-bank data corruption independent of the article. The three batch-048 edits in change-of-use were also degenerate (single-character options), suggesting that batch produced unusable output that the flagging run correctly caught.
