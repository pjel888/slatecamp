# SME Hand-Off Packet — Fact-Check Review

**Branch:** `fact-check/article-question-remediation`
**Commit:** `8b195fe95` — *fact-check(content): apply 5,604 verified question-bank corrections*
**Reviewer:** Philippine-licensed architect SME
**Date prepared:** 2026-07-20

---

## What this is

A complete fact-check of SlateCamp's LEA content corpus was performed by a 19-agent LLM council across 6 waves. Every article (567) and every linked question (~7,159) was audited against the governing source packs (BP 344, PD 1096, RA 9266, RA 9514, RA 8293, RA 9442, RA 10884, SPP 201-209) and external authoritative references. **5,604 question updates were applied to the working-tree `linked-questions.json`** (5,051 full-replace + 553 citation-only). All 28 content-audit tests pass.

**The corrections are NOT yet in the production Supabase DB.** They need your sign-off before push.

---

## Review priority order

Please review in this order — CRITICAL fixes first (these are the ones that would have actively misled examinees):

### 🔴 PRIORITY 1 — CRITICAL (6 fixes) — highest-impact review

| # | Bundle | Question ID | Topic | What changed | Source |
|---|---|---|---|---|---|
| 1 | `lea-prac-law-003` | `032522de` | RA 9266 §29 penalty range | P5K-P100K → **PHP 100K-5M + 6mo-6yr** | RA 9266 IRR §29 |
| 2 | `lea-prac-frm-018` | `b2951761` | BP 344 ramp slope | 1:12 → **1:20** | BP 344 2024 IRR App. A |
| 3 | `change-of-use-and-occupancy` + `certificate-of-occupancy` | `bf891ad7`, `58d057b3`, `680174d1`, `77d9898d`, `373ca9fc` | PD 1096 §309 certificate type | "Certificate of Use" → **Certificate of Occupancy** | PD 1096 IRR §309 |
| 4 | `lea-prac-cmp-007` | `c345f793`, `e8d5bd9e`, `e5b1465f`, `5cf56df2`, `1b739814`, `04d1074d` | SPP 202 MDPE multiplier | 2.7-3.2 / overhead-profit decomposition → **1.5-2.5 only** | SPP Doc 202 §5.2 |
| 5 | `lea-util-003-07` | 7 questions | PEC 220.42 residential load | 7 arithmetic answer keys recomputed (e.g., Q1 17.2 kW → 8.9 kW) | PEC 220.42 |
| 6 | `lea-strc-007-05` | 10 questions | NSCP 2015 conduit embedments | Fabricated §6.3.x → **§420.7 / ACI 318-14 §26.6.5** | NSCP 2015 §420.7 |

**Review focus:** Are these the correct values per the cited sources? If any correction is wrong, flag it.

### 🟠 PRIORITY 2 — HIGH (5 areas)

| # | Bundle | Topic | What changed | Source |
|---|---|---|---|---|
| 7 | `lea-prac-law-014` | RA 8293 IP term | "70 years" → **life + 50** (expires 2065) | RA 8293 §213.1 |
| 8 | `translating-pwd-rights` | BP 344 washroom dims | WC 1800×2250→**1800×1800**, seat 460→**450mm**, parking aisle 1800→**1500mm additional width in 4000×5000 slot** | BP 344 2024 IRR PDF p.7,36,37 |
| 9 | `lea-matl-003-04` | 6063-T6 aluminum UTS | 186 MPa → **190 MPa minimum** | ASTM B221 |
| 10 | `lea-util-*` (5 bundles) | MEPF arithmetic | 9 errors recomputed (Rational Method SI constant, RA 9003, solar NPV, Sabine) | PEC / RA 9003 / RA 9513 |
| 11 | `lea-plan-003`/`004`/`005` | PD 1067 + RA 10884 + RA 7279 | 13 code-citation fixes (easement widths, subdivision share, danger-area safeguards) | PD 1067 Art. 51 / RA 10884 §5 / RA 7279 §28 |

### 🟡 PRIORITY 3 — MEDIUM (~70 question-edits across many bundles)

| Area | What changed |
|---|---|
| lea-prac-law-001/002/005/014 (RA 9266 + IP) | §41→§4 IAPOA, §7 13→14 powers, IP keying error, RA 12009 vs IRR |
| lea-prac-ctr/eth (contracts/ethics) | 9 already-pre-remediated errors re-verified (bond %, Section 23 grounds) |
| `accessible-seating` | Appendix D → **Appendix E** throughout |
| `uap-spp-doc` | SPPCC backronym → "Statement of Probable Project Construction Cost" |
| `lea-dsgn-005-12` | BP 344 ramp 1:12→1:20 and door 0.80m→900mm (prior batch-071 had INTRODUCED errors) |

### 🟢 PRIORITY 4 — Citation-only refreshes (553 edits)

These edits make NO change to text/options/correct answer — they only update `code_citation` and `explanation` to reference the correct source section. Safe to bulk-approve.

### ⚪ PRIORITY 5 — Restored-original edits (~4,800+ files)

A prior broken batch had destroyed already-correct questions with 1-character garbage options ("T"/"h"/"e"). Wave-7 agents restored them to the original (correct) content verbatim. Review sampleable but not line-by-line required.

---

## How to review efficiently

1. **Start with Priority 1** — open each bundle's `linked-questions.json`, find the listed question_id, and verify the marked-correct answer matches the cited source. ~30 minutes total.
2. **Spot-check Priority 2** — verify the recomputed arithmetic and the cited sections. ~45 minutes.
3. **Bulk-approve Priorities 3-5** unless something catches your eye.

For each question, the source citation is in the question's `code_citation` field and the full rationale is in `rationale.correct`.

---

## Verification evidence (already done)

- All 28 content-audit tests pass
- All 7 source-verification-invariants tests pass
- 13,242 / 13,242 JSON files valid
- 0 typo residue (sclea, equivleant, rationlea)
- All CRITICAL fixes Python-verified live in `linked-questions.json`
- Backups at `.ai/19_controlled_apply/backups/linked-questions-pre-council-apply/`

---

## After your sign-off

To push the corrections to the production Supabase question bank:

```bash
# From the repo root, on branch fact-check/article-question-remediation
bun run content-audit:push:apply
```

This is irreversible — learners will see the corrected answers immediately. The push includes all 5,604 corrections (your selected scope).

To merge the branch into main after push:

```bash
git checkout main
git merge --no-ff fact-check/article-question-remediation
```

---

## What was NOT changed (deliberately)

- `original.md` files (export snapshots — protected baseline)
- Historical run reports in `.ai/content-audit-export/` top-level (governance snapshots per AGENTS.md)
- Source packs in `.ai/16_source_packs/` (need separate source-SME expansion for missing RA 9266 / PD 1096 sections)
- The 25 `src/` files in the working tree (they belong to a different branch's in-progress work)

---

## Master report

Full audit trail with per-stream findings, source quotes, and validator output:
`.ai/14_fact_checking/council-remediation-2026-07-20/MASTER-REPORT-2026-07-20.md`

22 council reports + 51 per-bundle remediation files in the same directory.
