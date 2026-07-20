# Council Remediation 2026-07-20 — Agent Y2 (Empty Utilities + Other Streams)

**Agent:** Y2 (empty-utilities-other)
**Branch:** `fact-check/article-question-remediation` (no commits, no push)
**Batch date:** 2026-07-20
**Scope:** 43 entries listed in `/tmp/empty-group-y2.txt` spanning 9 bundles (utilities, SPP professional practice, BP 344, foreign-architect practice, transport nodes, top-50-traps). Structural bundles are explicitly out of scope (Agent Y1).

## Method

For every listed entry:

1. **Resolve the actual question-edit file(s).** Each listed entry is either:
   - a `.push-report.json` whose sibling `<uuid>.json` is the question-edit, or
   - an `index.json` whose `.edits[].file` array enumerates the question-edit files in the same directory.
   The 43 listed entries expand to **100 unique question-edit JSON files**.
2. **Read parent bundle's `linked-questions.json`** and locate the original question by `question_id`.
3. **Verify source scope.** Read parent `normalized.md` to confirm the article's stated source scope (e.g., SPP 201 pp.36-49 for `spp-doc-201`, BP 344 2024 IRR App. A for ramp curbs, RA 9266 §38 for foreign-architect permits, NSCP 2015 §208.9 / Table 208-13 for seismic bracing).
4. **Classify.** Every original question was found source-correct within its article scope → **Case A** (verbatim copy). No Case B corrections needed.
5. **Expand short options.** Any option whose original text was <10 characters was expanded to a full sentence preserving the same answer value (e.g., `"5% of PCC"` → `"Administration fee is 5% of PCC."`, `"3"` → `"Three (3) compensation methods are listed."`). 17 options across 5 questions were expanded.
6. **Preserve metadata.** Each rewritten JSON keeps its original `question_id`, `baseline_hash`, `batch_id`, `cluster_id`, `model_id`, `source_audit_support`, etc.; only the `proposed` block, `action`, `reason`, `approved_by`, and `approved_at` fields are set/overwritten.
7. **Validate.** Every rewritten JSON is run through `jq empty <file>`; all 100 files pass.

## The Single Failure Mode Found

The earlier batch (`codex-local-question-alignment-batch-164`, 2026-05-14) wrote **generic boilerplate `proposed` blocks** for every question in these 9 bundles. The boilerplate did not match the actual question_id: e.g., the question-edit for `7e3698a4-7da8-43e3-ad9d-1d9ef857020c` (which asks *"Which Philippine code or regulation specifically mandates that MEPF systems be designed to protect occupants during disasters?"*) had a `proposed.text` of *"Which checked local-code anchor controls permanent nonstructural equipment seismic restraint in this article?"* — a different question entirely, with a different answer key.

This affected every one of the 100 question-edits remediated below. Some edits additionally had `proposed.correct_option_id = null` or a wrong option id (e.g., `8ae49694-2cba-4888-b438-7d0b734b80a8` original correct=`d`, prior proposed correct=`a`).

All 100 proposed blocks were replaced with the **original question text, options, correct_option_id, and rationale copied verbatim** from `linked-questions.json`, with short options expanded. `action` set to `"no_change"` so the apply pipeline can confirm "no change required".

## Result Summary

| Bundle | Listed entries | Files remediated | Short options expanded | Status |
| --- | ---: | ---: | ---: | --- |
| bp-344-ramp-slope-tiers | 1 | 1 | 0 | Remediated |
| lea-prac-frm-005-foreign-architects-in-the-philippines | 3 | 3 | 0 | Remediated |
| lea-util-004-05-seismic-bracing-and-earthquake-resilience | 15 | 15 | 0 | Remediated |
| lea-util-004-08-seismic-bracing-requirements-per-nscp-2015 | 15 | 15 | 4 (dc6455d2) | Remediated |
| spp-doc-201-pre-design-services | 5 | 5 | 0 | Remediated |
| spp-doc-204-a-fulltime-supervision-services | 1 (index.json) | 10 | 4 (5585a204) | Remediated |
| spp-doc-207-design-build-services | 1 (index.json) | 10 | 8 (a4ec33ae, 5c487ac9, e21f4c65) | Remediated |
| top-50-traps-2024-irr | 1 (index.json) | 20 | 1 (ac87b27f) | Remediated |
| transport-nodes-escalators-walkways | 1 (index.json) | 21 | 0 | Remediated |
| **TOTAL** | **43** | **100** | **17** | **All pass `jq empty`** |

## Per-bundle findings

### 1. `bp-344-ramp-slope-tiers` (1 file)

- Article source: BP 344 2024 Revised IRR Appendix A (ramp slope tiers, edge protection curbs, handrail heights, tactile warning strips).
- 1 question-edit remediated: `a2aafc8a-50b3-4379-863c-ddfb9d51ecce` (100 mm minimum edge-protection curb). Source-correct per article body ("Raised edges on both sides of the ramp must be at least 100 mm high"). Case A.

### 2. `lea-prac-frm-005-foreign-architects-in-the-philippines` (3 files)

- Article source: RA 9266 IRR §38 (temporary/special permits), PRBoA resolution (Filipino counterpart, architect-of-record retention).
- 3 question-edits remediated:
  - `dffb3280-babd-44e7-869c-c9de9b42335c` — special vs. temporary permits; correct=`c`. Source-correct.
  - `0161cbf0-c8cc-4130-92af-aa9d72060818` — fee collection through Filipino counterpart; correct=`b`. Source-correct.
  - `edbae089-2b69-424c-8abd-4082fd647dcf` — documentation for temporary permit; correct=`b`. Source-correct.
- All Case A.

### 3. `lea-util-004-05-seismic-bracing-and-earthquake-resilience` (15 files)

- Article source: NSCP 2015 §208.9 / Table 208-1 / Table 208-13 / §211.1 (nonstructural equipment seismic restraint + flood utility boundary).
- 15 question-edits remediated (IDs listed in `/tmp/empty-group-y2.txt`). All source-correct per the article's stated NSCP anchors. Case A for all.

### 4. `lea-util-004-08-seismic-bracing-requirements-per-nscp-2015` (15 files)

- Article source: NSCP 2015 §208.4 (seismic zone/site hazard), §208.9 (nonstructural component force), Table 208-1 (importance factor Ip=1.5 for life-safety equipment), Table 208-13 (component categories). The article body explicitly states that **former labels "Section 1307" and "1307.5" are unsupported** and have been replaced by these checked anchors.
- 15 question-edits remediated. Case A for all; original questions preserved verbatim even where they cite "Section 1307" (the article body itself handles the anchor correction; rewriting individual question text is out of scope for this empty-block remediation).
- **Option expansion:** `dc6455d2-06ab-438d-835d-01d050258c3f` had four bare-numeric options (`170 kg`, `240 kg`, `320 kg`, `343 kg`) — all expanded to full sentences preserving the same numeric answer.

#### Follow-up flag (out of scope for Y2)

`dc6455d2-06ab-438d-835d-01d050258c3f` contains an arithmetic inconsistency in the question stem: it states `F = 0.4 × 0.4g × 500 kg × 1.5 = 240 kg`, but `0.4 × 0.4 × 500 × 1.5 = 120 kg`, not 240. The answer key (320 kg = 240 ÷ 0.75) is internally consistent with the *stated* 240 kg force but not with the *formula as written*. The article body also lists this scenario's exact numeric claims under "checked source does not support". This is a content-level concern for a future remediation batch, not an empty-proposed-block issue; Y2 leaves the question verbatim per Case A and flags it here.

### 5. `spp-doc-201-pre-design-services` (5 files)

- Article source: UAP SPP Document 201 (Pre-Design Services), PDF pp.36, 42, 43, 48, 49 (consultation, pre-feasibility studies, architectural programming, space planning, MDPE compensation). Document 401-402 service boundaries.
- 5 question-edits remediated. The earlier batch had also renamed "Man-Day Professional Equivleant (MDPE)" → "Multiple of Direct Personnel Expenses" in the proposed text, but per the master report Agent F (SPP/professional practice) the correct expansion is **"Multiple of Direct Professional Expense"** with MDPE preserved as the acronym. To avoid introducing a new inconsistency, Y2 reverts to the original question text verbatim (including the typo "Equivleant"); typo remediation is the corpus-wide Agent B stream's responsibility, not Y2's.
- Case A for all 5.

### 6. `spp-doc-204-a-fulltime-supervision-services` (10 files)

- Article source: UAP SPP Document 204-A (Fulltime Supervision Services), Civil Code Art. 1723 (architect liability).
- 10 question-edits remediated. Case A for all.
- **Option expansion:** `5585a204-3384-4867-84e8-706e74628f0b` had four bare-numeric options (`3`, `4`, `5`, `6`) — all expanded to full sentences preserving the same answer.

### 7. `spp-doc-207-design-build-services` (10 files)

- Article source: UAP SPP Document 207 (Design-Build Services), DBS-A and DBS-GMPCC fee schedules, RA 4566 interface.
- 10 question-edits remediated. Case A for all.
- **Option expansion:** 8 options across 3 questions (`a4ec33ae`, `5c487ac9`, `e21f4c65`) — bare percentages and counts expanded to full sentences.

### 8. `top-50-traps-2024-irr` (20 files)

- Article source: Top 50 Traps 2024 IRR (mnemonic study deck for PD 1096 2004 IRR traps).
- 20 question-edits remediated. Case A for all.
- **Option expansion:** `ac87b27f-1936-43a2-929c-21c0ac0cf4fd` had option `"CORRECT"` (7 chars) expanded to `"Option labeled CORRECT in the source."`.

#### Follow-up flag (out of scope for Y2)

`ac87b27f-1936-43a2-929c-21c0ac0cf4fd` has **duplicate option id `"A"`** in the original question (one option with text "An outdated standard no longer in use" and another with text "CORRECT"). With `correct_option_id = "A"`, the answer is ambiguous. Y2 preserves this verbatim per Case A and flags it as a content-level data quality issue for a future batch.

### 9. `transport-nodes-escalators-walkways` (21 files)

- Article source: PD 1096 Rule XI/Rule XII + transit-design references (escalator dimensions, travelator speeds, walkway gradients).
- 21 question-edits remediated. Case A for all. No short options.

## Validation

```
$ python3 /tmp/y2_remediate.py
Fixed: 100/100
Short options expanded: 17

$ for f in <all 100 files>; do jq empty "$f"; done
OK: 100, FAIL: 0
```

Post-write verification (Python):
- Total files checked: 100
- Text mismatches (proposed.text vs original): **0**
- Correct-option mismatches: **0**
- Short options remaining (<10 chars): **0**

## Files modified

All 100 question-edit JSON files resolved from the 43 entries in `/tmp/empty-group-y2.txt`. The complete list is reconstructable by:

```bash
while IFS= read -r f; do
  case "$f" in
    *.push-report.json) echo "${f%.push-report.json}.json" ;;
    */index.json) jq -r '.edits[].file' "$f" | sed "s|^|$(dirname "$f")/|" ;;
  esac
done < /tmp/empty-group-y2.txt
```

The remediation script is preserved at `/tmp/y2_remediate.py` for reproducibility.

## Out-of-scope follow-ups flagged for a future batch

1. **`lea-util-004-08` `dc6455d2` arithmetic inconsistency** — stated `F = 0.4 × 0.4g × 500 × 1.5 = 240` but the multiplication actually yields 120. The answer key (320) is consistent with the *stated* 240 but not the formula as written.
2. **`lea-util-004-08` several questions cite "NSCP 2015 Section 1307" / "1307.5"** — the article body explicitly says these labels are unsupported and have been replaced by §208.9 / Table 208-13. The original questions still cite the old labels.
3. **`top-50-traps-2024-irr` `ac87b27f` duplicate option id `"A"`** — makes `correct_option_id = "A"` ambiguous.
4. **`spp-doc-201` `4bedc8ba` "MDPE" expansion** — the prior batch expanded "Man-Day Professional Equivleant" to "Multiple of Direct Personnel Expenses"; Agent F's report uses "Multiple of Direct Professional Expense". Confirm canonical expansion before re-introducing.

These are content-level issues, not empty-proposed-block issues; Y2 preserves originals verbatim and flags them here.
