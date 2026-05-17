# Claude Code Council Review

# Review Memo — SlateCamp Gold-Standard Exemplar Pack

**Scope:** `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/` (five exemplars + index/validation/manifest), measured against `.ai/CONTENT_EXCELLENCE_GOAL.md` and the source-verification gates. Read-only; no edits.

---

## Verdict

**PASS as a calibration floor. NOT yet gold-standard award-grade.**

The pack already does what calibration sets must do: it sets a topic-task framing, surfaces traps, links every claim to a local 001-layer PDF, hashes the PDFs, and records page locators. That alone puts it ahead of typical AI-generated review-center material.

But three structural issues prevent it from being held up as the SlateCamp world-class exemplar:

1. **Citation granularity drops below the directive.** `CONTENT_EXCELLENCE_GOAL.md` mandates `Document → IRR → Rule/Section`. Article inlines mostly comply; **source ledgers do not** — they only record `Document + PDF pages used`, never the structured Rule/Section/Item/Table/Appendix that the article asserts. A ledger that cannot independently regenerate the citation is not a ledger.
2. **At least three claims are asserted in articles whose direct-extraction evidence is `not found by text extraction`** (NPCP "FIXTURE UNIT" definition, NPCP Section 311.4 prohibition, Vitruvius "ARCHITECTURE depends on Order…"). The articles still quote/paraphrase as if extracted. This violates Gate B of the accuracy-gates doc and is the highest-risk defect in the pack.
3. **Schema drift from the contract**: the JSON ledger schema in `04-source-verification-and-accuracy-gates.md` (`source_status`, `claims[].claim_class`, `source_pack_id`, structured `locator`, `conflict_status`) is **not used** by any of the five ledgers. Known conflict classes for BP 344 / PD 1096 / RA 9514 packs (`local_webpage_pdf_vs_official_download_pdf_hash_mismatch`, `official_source_blocked`, etc.) are silently absent from the exemplar ledgers and reviewer memos.

Status today: `PASS_FOR_CALIBRATION` is correct. Not award-grade until the items below are closed.

---

## Top 10 Recommendations (Prioritized)

| # | Recommendation | Why |
|---|---|---|
| 1 | **Fix the RA 9514 article's "Rule 10, Chapter 2, Division 2" line.** RA 9514 2019 RIRR is organized as Rule → Division → Section. There is no "Chapter 2" inside Rule 10. The article inserts it twice. This is exactly the section-number-style error the directive says will fail a student. | Highest single accuracy defect in the pack. |
| 2 | **Downgrade every quote whose ledger reads `not found by text extraction`** until a visual page-image check is logged. Affects NPCP fixture-unit definition, NPCP §311.4 prohibition, Vitruvius six-principle list. Either paraphrase with `⚠️ NEEDS VERIFICATION — visual confirmation pending` or replace with confirmed extracts. | Articles currently assert quoted statute text the local extraction did not return. |
| 3 | **Replace the freeform `source-ledger.md` files with the structured schema from §04 gates** (`claim_id`, `claim_class`, `source_pack_id`, `locator{rule,division,section,item,table,appendix,page}`, `extraction_status`, `conflict_class`, `document_version_date`, `linked_question_ids`). Backfill all five. | Without the structured schema, validation cannot be machine-checked, conflicts cannot propagate, and a `PASS` decision is human-trust only. |
| 4 | **Surface inherited conflict classes.** BP 344 ledger must reference `source-pack-bp-344-2024-revised-irr` and the `local_webpage_pdf_vs_official_download_pdf_hash_mismatch` conflict. Reviewer memo must list it under "Remaining risks." Same protocol for any later PD 1096 / RA 9514 / RA 9266 exemplar. | Validation today says PASS while the pack carries documented unresolved conflicts. |
| 5 | **Rewrite cross-citing distractor rationales.** NPCP Q1 distractor A explanation appeals to a Fire Code lux value to explain a plumbing flow rate. BP 344 Q2 distractor B says only "common distractor when stem specifically points to…" instead of explaining why 1:12 is actually a real special-case answer. Distractors must be falsified from the same source family the correct answer used. | A distractor rationale that requires a second law to dismiss it is teaching the wrong reasoning. |
| 6 | **De-template the reviewer memos.** All five "Why it passes for calibration" sections are identical bullet copy. Each topic has different risks (NPCP has heavy OCR drift; Vitruvius has translation-edition risk; RA 9266 has IRR vintage risk; BP 344 has conflict-class risk; RA 9514 has organizational-naming risk). Make memos topic-specific. | Templated memos give reviewers nothing to verify. |
| 7 | **Add an explicit `document_version_date`/edition field** to every ledger. BP 344 2024 Revised IRR vs prior; RA 9514 2019 Revised IRR (RA 9514 itself is 2008); PD 1096 RIRR 2004 (not the 1977 IRR); NPCP edition; Vitruvius (Morgan, 1914). Article wording must say which edition governs. | Version drift is the second-largest source of wrong answers in Philippine review-center materials. |
| 8 | **Expand the calibration set with seven topics covering the underrepresented LEA domains.** See "New-Exemplar Topics" below. The current set covers accessibility, professional practice, fire/life safety, plumbing utilities, theory — it is missing the highest-yield single domain (PD 1096 development controls) and structures. |
| 9 | **Codify the source-layer hierarchy in writing files** so future workers cannot accidentally treat 002/003 layers as authoritative. Add the directive language under "Writing-Files Directive Language" below to `.ai/CONTENT_EXCELLENCE_GOAL.md`, the content-production AGENTS.md, and any prompt under `.ai/08_prompts/` that produces learner-facing material. |
| 10 | **Convert the validation report from a single PASS line to a per-gate matrix (Gates A–J below).** The current `validation-report.md` reports "PASS" with no errors, but it does not check Gate B (extraction-found vs not-found), Gate D (conflict-class disclosure), or Gate I (Rule/Chapter/Division naming sanity). | Cannot keep claiming PASS while machine-checkable defects exist. |

---

## Current-Exemplar Fixes (Item-Level)

**01 BP 344 ramp**
- Add `conflict_class: local_webpage_pdf_vs_official_download_pdf_hash_mismatch` to ledger and risks.
- Q2 distractor B explanation: explain that 1:12 is the real IRR special-case answer for ramps under length conditions, *and* that the stem deliberately asks for the *general* gradient — that is the trap. As written, the rationale teaches "1:12 is a distractor," which is partially false outside this specific stem.
- Add structured locator `Appendix A → Section ... → Item ...` (current ledger only logs PDF pages 2/7/8).

**02 RA 9266 foreign architect**
- Article cites "Section 38" but does not specify whether it is the IRR section number or the Act section number; in RA 9266 IRR the numbering shadows the Act. Make this explicit.
- Add `linked_question_ids` so any answer-key change re-triggers the gate.

**03 RA 9514 means of egress**
- Remove "Chapter 2" from both `Source:` lines in `exemplar-article.md`. The 2019 RIRR uses Rule → Division → Section. This is the most damaging single error in the pack.
- Confirm the 915 mm and 10.7 lux figures against the BFP-published official PDF in addition to the local extraction; the source-pack `RA9514_RIRR_2019` is currently flagged `official_source_blocked`.
- Q3 distractor C explanation ("plausible lighting distractor") — name the actual standard it conflates with (e.g., illumination level commonly tabled in workplace lighting standards) so the student leaves with a real distinguisher.

**04 NPCP fixture units / venting**
- Two of four extraction queries returned `not available`. The article still quotes "shall not use a vent pipe as a soil or waste pipe" verbatim. Either re-extract with OCR cleanup (the snippet shows OCR drift like "FIXTlJRl: liN IT") or paraphrase with `⚠️ NEEDS VERIFICATION` and a visual page check.
- Q1 distractor A rationale must not borrow the 10.7 lux value from another law to dismiss a plumbing flow rate. Replace with a plumbing-domain falsification.

**05 Vitruvius principles vs departments**
- The Order/Arrangement/Eurythmy/Symmetry/Propriety/Economy six-principle list is not in the extracted snippets; only Eurythmy and Symmetry definitions plus the departments list were extracted. The list is correct in the Morgan translation, but the ledger must show it via a confirming page-image check, not assertion. Log Morgan, 1914 translation explicitly.

---

## New-Exemplar Topic Recommendations (LEA-yield × source verifiability)

Source folder paths confirmed in `vitruvius-connection/001_Raw-Source-Layer/`.

| Priority | Topic | Why high-yield | Source file |
|---|---|---|---|
| P0 | **PD 1096 Rule VII — Allowable Maximum Building Footprint, PSO, TGFA, AMBF, Setbacks** | Highest-frequency LEA topic; calibrates dimensional/computational reasoning. | `001-Laws/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).pdf`, `Rule 7 _ 8.pdf`, `RULE VII_701 OCCUPANCY CLASSIFIED.pdf`, `RULE VII_Table VII-1 Occupancy Table.pdf` |
| P0 | **PD 1096 Rule VIII — Light & Ventilation, Court & Yard Ratios** | Central to plan-reading; underrepresented in current set. | `001-Laws/PD-1096/PD 1096 IRR - Rules 7 and 8 Light Ventilation and Development Controls.pdf`, `RULE VIII - LIGHT & VENTILATION.pdf` |
| P0 | **UAP SPP Document 202 — Regular Architectural Services / Scope** | Professional Practice domain leader; pairs with exemplar 02 to test scope vs procedure. | `001-Laws/UAP/SPP 202.pdf` |
| P1 | **NSCP 2015 — Occupancy categories / live-load tables** | Only structures coverage in current set is zero. | `006 -Structural/National Structural Code of the Philippines 2015.pdf` |
| P1 | **BP 220 — Socialized & Economic Housing Minimum Lot/Floor Areas** | Numeric tables, repeatedly tested. | `001-Laws/BP-220/` |
| P1 | **PD 957 (with HLURB IRR) — Subdivision standards: open space, ROW** | High-yield for planning items. | `001-Laws/PD-957/`, `001-Laws/HLURB-DHSUD/` |
| P2 | **PD 1067 Water Code — Easements (3 m / 20 m / 40 m)** | Trap-rich numeric memorization. | `001-Laws/PD-1067/` |
| P2 | **RA 9266 IRR — Architect-of-Record vs Consulting Architect (paired with foreign-architect)** | Tests definition discrimination, the same gate as exemplar 05's principles vs departments. | `001-Laws/RA-9266/RA-9266 IRR Architecture Act of 2004.pdf` |
| P2 | **Civil Code Art. 1723 (RA 386) — Engineer/Architect liability for collapse** | Already implicit in RA 9266 ledger; high-yield in Professional Practice. | `001-Laws/RA-386/` |
| P3 | **DOH Hospital Planning Standards** | Building-Type planning domain coverage. | `001-Laws/DOH/` |
| P3 | **RA 11285 Energy Efficiency / BERDE green-building basics** | Emerging exam domain. | `001-Laws/RA-11285/`, `001-Laws/BERDE/` |

A complete calibration set should reach **12 exemplars** spanning: PD 1096 (×2), BP 344, RA 9514, RA 9266, BP 220 or PD 957, NSCP, UAP SPP, PD 1067, NPCP/utilities, theory/history, and one secondary-source (textbook) exemplar to demonstrate how a non-statutory claim is handled.

---

## Source-Ledger Required Fields

Replace freeform markdown ledgers with one ledger JSON per exemplar carrying:

- `article_id`, `pack_id`, `linked_question_ids[]`
- `source_status` ∈ `READY_SOURCE_PACK | LOCAL_RAW_NEEDS_RECONCILIATION | OFFICIAL_BLOCKED | LOCAL_RAW_ONLY`
- `source_pack_id` (link to `.ai/16_source_packs/...` when applicable)
- `source_family`, `document_code`, `document_title`, `document_version_date`, `edition_or_translation`
- `relative_pdf_path`, `pdf_sha256`, `pdf_page_count`, `source_hierarchy_tier ∈ 1..6`
- `claims[]`:
  - `claim_id`, `claim_text`, `claim_class ∈ {LEGAL_DIMENSION, LEGAL_SCOPE, LEGAL_PROCESS, TECHNICAL_STANDARD, HISTORICAL_FACT, THEORY_CONCEPT, EXAM_STRATEGY}`
  - `article_location` (heading + line range)
  - structured `locator: { rule, division, chapter, section, item, paragraph, table, appendix, page }`
  - `extraction_method`, `extraction_query`, `extracted_text_excerpt`
  - `extraction_status ∈ {FOUND_VERBATIM, FOUND_PARAPHRASED, NOT_FOUND_BY_TEXT, OCR_DRIFT}`
  - `visual_verification: { performed: bool, by, date }`
  - `conflict_class` (inherited from source pack if any)
  - `status ∈ {SUPPORTED, NEEDS_REVIEW, REMOVE_OR_REWRITE}`
- `sme_review: { status, reviewer_id, date, notes }`

Every numeric claim in a learner-facing article must be reachable to a `claim_id` whose `extraction_status` is `FOUND_VERBATIM` or whose `visual_verification.performed=true`.

---

## Validation Gates (Replace Single-PASS Report)

| Gate | Check | Current pack |
|---|---|---|
| A | Source hierarchy tier ≤ 2 for every legal/code claim | PASS |
| B | Every quoted phrase has `extraction_status=FOUND_VERBATIM` OR a logged visual check | **FAIL** (NPCP ×2, Vitruvius ×1) |
| C | Locator granularity = `Document → IRR/Rule → Section/Item → Page` (article + structured ledger) | **FAIL** (ledgers are page-only) |
| D | Conflict-class disclosure when source pack carries one | **FAIL** (BP 344, RA 9514) |
| E | Distractors falsified from the same source family as the correct answer | **FAIL** (NPCP Q1, BP 344 Q2) |
| F | Article assertions do not contradict linked question key | PASS |
| G | Anti-slop lint (banned phrases) | PASS |
| H | Question key cites a `claim_id` from the ledger | not implemented |
| I | Rule/Chapter/Division/Section vocabulary matches the actual document organization | **FAIL** (RA 9514 article inserts "Chapter 2") |
| J | Document version/edition declared in article and ledger | **FAIL** (article inlines yes, ledgers no) |

`validation-report.md` should report each gate with a count and the offending file paths, not a single line.

---

## Writing-Files Directive Language (drop into `.ai/CONTENT_EXCELLENCE_GOAL.md`, content-production AGENTS.md, all prompts under `.ai/08_prompts/` that produce learner-facing material)

> **Source-layer rule for SlateCamp content production.** When producing or editing any learning artifact for LEA/ALE candidates, the only law/code/source ground truth is `vitruvius-connection/001_Raw-Source-Layer/` (raw PDFs of laws, IRRs, manuals, textbooks). The `002_Raw-Conversion-Layer/` (markdown/JSON conversions) is for **search and locator discovery only** — never as the citation target. The `003_Canonical-Knowledge-Layer/` is for **concept relationships and topic discovery only** — never as legal/code authority. Approved source packs under `.ai/16_source_packs/` rank above raw 001 only when their conflict status is resolved and SME-approved. The official agency PDF (DPWH for PD 1096, NCDA for BP 344, BFP for RA 9514, PRC for RA 9266) is the authority for version currency; if it disagrees with the local 001 file, log a `conflict_class` and stop.
>
> **Workflow.** (1) Use 003 to locate the relevant concept; (2) use 002 to find candidate locator strings (Rule/Section/Item); (3) open the matching 001 PDF and run text extraction (or visual page check) for every claim; (4) cite `Document → IRR → Rule/Division → Section/Item → Page` in the article and record the structured locator + `extraction_status` in the source ledger; (5) if extraction fails for a quoted phrase, paraphrase and mark `⚠️ NEEDS VERIFICATION` until visual verification is logged. (6) Inherit any `conflict_class` from `.ai/16_source_packs/` into the ledger and reviewer memo.
>
> **Never:** quote 002/003 text as the law; paste pack content directly into Supabase; promote a calibration exemplar to a live article without the roundtrip pipeline; let templated reviewer memos hide topic-specific risks.

---

## Risks / What Not To Do

- **Do not promote any of the five exemplars to live Supabase rows.** Status `HOLD_FOR_DIRECT_PUBLICATION` is correct.
- **Do not re-quote phrases whose `extraction_status` is `NOT_FOUND_BY_TEXT`** without a logged visual page check. Three such phrases currently exist in the pack.
- **Do not introduce organizational vocabulary the source itself does not use** (e.g., "Chapter 2" inside RA 9514 Rule 10). One offence already in pack.
- **Do not let a distractor rationale appeal to a different law** to falsify the wrong option. Two such offences already in pack.
- **Do not declare the validation report PASS** while Gates B, C, D, E, I, J are not enforced. Today's report is technically true (no schema errors) but materially incomplete.
- **Do not let templated reviewer memos persist.** They make per-topic risks invisible to a future SME.
- **Do not wait for source-pack expansion** before fixing the five existing exemplars; the defects above are intrinsic to the artifacts, not to source coverage.

---

End of memo.

## Raw status

```json
{
  "tool": "claude-code",
  "started_at": "2026-05-09T07:01:20Z",
  "duration_seconds": 331.09,
  "returncode": 0
}
```

## stderr

```text

```
