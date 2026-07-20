# Agent U — Consolidated Report — lea-prac-cmp + lea-prac-frm streams

**Date:** 2026-07-20
**Agent:** U (council-6 group A)
**Scope:** 31 bundles — 11 `lea-prac-cmp` (compensation/fees) + 20 `lea-prac-frm` (firm forms / CPD / government practice)
**Branch:** `fact-check/article-question-remediation` (no branch switch, commit, or push performed)

## Headline result

- **3 CONFIRMED_ERRORS remediated** across 3 bundles (frm-009, frm-012, frm-013).
- **28 bundles verified clean** — either already fully remediated by prior Batch 101/102/105/106 source-audit passes, or source-safe on inspection.
- **All 310 question-edit JSON files in scope pass `jq empty`.**

The prior batch-105 MDPE/multiplier/fee-percentage remediation across the cmp stream is **confirmed correct**. The MDPE multiplier range is consistently stated as **1.5–2.5** (SPP Doc 202 §5.2), and the wrong 2.8/3.0/3.5 decomposition is absent from every article body and every proposed edit (it survives only as an explicitly-rejected distractor option in cmp-006/cmp-008). The UAP Doc 401-402 cumulative payment milestones (PHP 25,000 mobilization; SD 15%; DD 35%; CD 85%; remaining 15%) are consistently and correctly applied.

## Confirmed errors remediated

| # | Bundle | Question ID | Defect | Remedy |
|---|--------|-------------|--------|--------|
| 1 | lea-prac-frm-009 | `16cb431b-a7d6-4bec-a18d-ae15134aecaf` | Asserted an unsupported CPD credit hierarchy ("structured learning awards highest credits") with `code_citation: RA 10912` despite the article explicitly disclaiming exact credit hierarchy from RA 9266 IRR alone. Prior Batch 102 edit was a no-op. | Replaced with source-supported RA 9266 IRR §28 question (who develops the CPD program). |
| 2 | lea-prac-frm-012 | `ea9acfef-f13f-479b-a870-49260aa9365a` | Stem said "latest Revised IRR of RA 9184" but every option referenced "RA 12009." RA 12009 (NGPA, signed 20 July 2024) is a NEW STATUTE that revised/repealed RA 9184, NOT an IRR. Conflating a statute with an IRR; rationale's "(as of July 2024)" misattributes the RA 12009 signing date to an IRR update. Prior Batch 102 edit was a no-op. | Replaced with a stem that correctly frames RA 12009 as the successor statute. |
| 3 | lea-prac-frm-013 | `ff5ec4f4-22ad-4200-9032-7a2977f8406b` | Fabricated a "three pillars of COA audit = regularity, legality, economy" doctrine that is not an official COA framework (official = 3 audit types / 3 E's of performance audit). `code_citation: RA 9266` is wrong — COA authority is 1987 Const. Art. IX-D + PD 1445. Article body itself warns against this. Prior Batch 102 edit was a no-op that admitted the doctrine was unsourced. | Replaced with source-backed RA 7160 COA-inspection-access question for LGU-funded work. |

### Edit files written (all validated with `jq empty`)

- `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/lea-prac-frm-009-cpd-activity-types-for-architects--939408a5-777b-437f-ad59-555132f8714a/question-edits/16cb431b-a7d6-4bec-a18d-ae15134aecaf.json`
- `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/lea-prac-frm-012-ra-9184-government-procurement-reform-act-architecture-relevant-provisions--8e546a58-36c2-4cd3-8340-2cb9d1189b13/question-edits/ea9acfef-f13f-479b-a870-49260aa9365a.json`
- `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/lea-prac-frm-013-coa-audit-compliance-for-publicly-funded-architectural-projects--9c859ffb-8b3a-4feb-b484-6700d3867e5c/question-edits/ff5ec4f4-22ad-4200-9032-7a2977f8406b.json`

### Per-bundle remediation notes written

- `…/lea-prac-frm-009-…/council-remediation-2026-07-20.md`
- `…/lea-prac-frm-012-…/council-remediation-2026-07-20.md`
- `…/lea-prac-frm-013-…/council-remediation-2026-07-20.md`

## Bundles verified clean (28)

### cmp stream (11/11 clean)

All cmp articles and their question-edits are correct and source-safe. The Batch 105 remediation fully addressed the MDPE/percentage/payment-schedule issues.

- **lea-prac-cmp-002** (Project Group Classification) — Group 1–10 definitions aligned with SPP 202. No fee % claims.
- **lea-prac-cmp-003** (PCC definition) — SPP 202 §7.17 inclusions/exclusions correct. The unsupported "DD accuracy band ±15–20%" baseline question was already replaced by Batch 105 with a source-supported PCC-inclusion question.
- **lea-prac-cmp-004** (Schedule of Payments) — correctly uses UAP Doc 401-402 Article 3.02 cumulative milestones (15%/35%/85%) + Article 7.08 (remaining 15% = 10% Art. 1723 liability + 5% construction phase). Explicitly rejects the unsourced 20/20/30/5/25 schedule.
- **lea-prac-cmp-005** (Percentage of PCC core concept) — correct six-phase framework, PCC exclusions, group definitions.
- **lea-prac-cmp-006** (MDPE Formula) — **MDPE multiplier range 1.5–2.5 correctly stated** in 3 separate edits (`a91d6194`, `2dfa755c`, `9e391e7d`). The wrong 2.8–3.5 appears only as a rejected distractor. M = multiplier for overhead + reasonable profit (no decomposition). All 10 questions have full Batch 105 replacement edits.
- **lea-prac-cmp-008** (MDPE vs Percentage decision matrix) — multiplier 1.5–2.5 correct; the baseline computation question with "Group 5 at 10.75%" and "multiplier of 2.4" was already replaced by Batch 105.
- **lea-prac-cmp-009** (Lump Sum / Fixed Fee) — correctly rejects unsupported 10–20% contingency and 2.2 multiplier.
- **lea-prac-cmp-010** (Per Diem / Retainer / Honorarium) — correct service-pattern distinctions from SPP 202.
- **lea-prac-cmp-011** (Reimbursable Expenses) — correct 50.0-km UAP Standards locator; keeps reimbursables separate from the MDPE multiplier.
- **lea-prac-cmp-012** (Repetitive Designs) — correctly uses Group 6 / Group 7 classification; no invented reduced-fee percentages.
- **lea-prac-cmp-013** (Abandoned Projects) — 90%-of-work non-implementation rule and 6-month suspension doubling rule correctly attributed to SPP 202.

### frm stream (17/20 clean; 3 remediated above)

- **lea-prac-frm-001** (Sole Proprietorship) — RA 9266 §25 + DTI/BOA/PRC registration correct.
- **lea-prac-frm-002** (Partnership) — RA 9266 §37, 75% RLA composition, SEC + Board registration correct.
- **lea-prac-frm-003** (Corporate Practice) — RA 9266 §37, 75% RLA composition across all owner/shareholder/member/incorporator/director/executive-officer categories correct.
- **lea-prac-frm-004** (Joint Venture) — project-based definition, RA 9266 §38 foreign-permit gate, Filipino counterpart rule correct.
- **lea-prac-frm-005** (Foreign Architects) — RA 9266 §38 special/temporary permit, Filipino counterpart AOR rule correct. (The 13 files in question-edits include 3 `.push-report.json` artifacts; exactly 10 actual question-edit files match the 10 questions.)
- **lea-prac-frm-006** (ASEAN MRA) — correctly distinguishes recognition from practice authority; RA 9266 §38 still controls.
- **lea-prac-frm-008** (CPD Requirements) — source-safe; correctly avoids stating exact unit totals (deferred to current CPD guidelines).
- **lea-prac-frm-010** (CPD Provider Accreditation) — the "3-year accreditation validity" answer in `ee299893` is **externally verifiable as correct** per PRC Revised Guidelines (Feb 2025) / RA 10912 IRR, so no edit was needed despite the article's local-source disclaimer.
- **lea-prac-frm-011** (Government Architects) — correct source map: RA 9266 (professional responsibility), RA 9184 (procurement), RA 11201 (DHSUD, verified), Civil Code Art. 1723, RA 7160 (LGU funds).
- **lea-prac-frm-014** (BIM) — correctly defers LOD/IFC/ISO 19650 specifics; keeps RA 9266 instruments-of-service anchors.
- **lea-prac-frm-015** (Data Privacy RA 10173) — honestly source-limited (no local RA 10173 primary); keeps claims within RA 9266 anchors; does not fabricate DPO/NPC/breach-deadline details.
- **lea-prac-frm-016** (BERDE) — PHILGBC, Stage 1/Stage 2, no premature certification claims. Correct.
- **lea-prac-frm-017** (Environmental Laws / EIA) — PD 1586, DAO 2003-30, Category A/B/C/D, ECC/CNC pathways all correct.
- **lea-prac-frm-018** (Universal Design BP 344 / RA 7277) — BP 344 + 2024 Revised IRR correct. Notes 1:20 gradient claim (cross-stream; BP 344 detail handled by accessibility agents).
- **lea-prac-frm-019** (Project Management) — clean.
- **lea-prac-frm-020** (Technical Specifications) — RA 9266 IRR specs scope + RA 9184 performance-spec/no-brand-name rule correct.
- **lea-prac-frm-021** (Quantity Surveying) — RA 9266 IRR BOM/cost-estimate scope correct; explicitly rejects unsourced ±20%/±5% accuracy bands.

## Verification approach

1. Read each `normalized.md` (31 articles) and confirmed fee/multiplier/percentage/RA-citation claims against SPP Doc 202, UAP Doc 401-402, RA 9266, RA 9184, RA 11201, RA 7160, and (for CPD) RA 10912/CPD Council.
2. Compared each `linked-questions.json` baseline against the corresponding `question-edits/*.json` proposed block; flagged any question where (a) the baseline had no full-text replacement AND (b) the baseline answer key asserted an unsupported or wrong fact.
3. WebSearch-verified: MDPE multiplier range (1.5–2.5 confirmed), CPD units (60/3 yrs) and provider accreditation validity (3 yrs confirmed), RA 12009 status (new statute revising RA 9184), RA 11201 (DHSUD), COA audit frameworks (no "three pillars = regularity/legality/economy" doctrine).
4. Validated all 310 question-edit JSON files with `jq empty` — 0 invalid.

## Governing-source confirmations

- **MDPE multiplier 1.5–2.5 (SPP Doc 202 §5.2):** confirmed present and correct in cmp-006/cmp-008 articles and edits. The 2.8/3.0/3.5/overhead-profit decomposition is NOT present in any article body or proposed edit.
- **Phase payment milestones:** cmp-004 correctly uses UAP Doc 401-402 Article 3.02 cumulative milestones (SD 15% / DD 35% / CD 85% / remaining 15%) and Article 7.08 (15% = 10% Art. 1723 + 5% construction phase). The task's "SPP 202 ~15/15/50/5/15 per-phase slice" framing and the UAP 401-402 cumulative-milestone framing measure different things (work allocation vs invoicing); both are correctly attributed in the corpus and do not conflict.
- **Fee percentages (G1=6%, G2=7%, G3=8%, G4=10%, G5=10%, G6=80-60-40%, G7=100-60-30%, G8=15%, G9=150%):** no article body in scope asserts these numeric Group percentages — the cmp articles deliberately avoid stating fee rates unless supplied by the exam fact pattern. cmp-012 correctly frames G6/G7 as classification (not fee %) issues. No errors to flag.

## Noted non-blocking observations (no edits written)

- **frm-012 `6af33353`** stem parenthetical "(Updated 2024)" is imprecise (the 2016 IRR was last amended March 2021; 2024 = RA 12009). The marked-correct answer is factually correct; the question remains answerable. Wording nit only.
- **frm-018** mentions a "1:20 gradient limit for accessible ramps" under the 2024 Revised BP 344 IRR, explicitly contrasting the "old 1:12" answer. This is a strong factual claim about the 2024 IRR; cross-stream BP 344 accessibility agents (C/S) are the primary owners. Noted for their attention; out of my scope's core fee/multiplier/RA-citation focus.

## Rules complied with

- No primary content files (`normalized.md`, `linked-questions.json`) edited — question-edits only.
- No branch switch, commit, or push.
- Every correction cites a source (SPP section, RA section, or URL).
- No documentation `.md` files created outside the two required artifact types (per-bundle `council-remediation-2026-07-20.md` for error bundles, and this consolidated report).
