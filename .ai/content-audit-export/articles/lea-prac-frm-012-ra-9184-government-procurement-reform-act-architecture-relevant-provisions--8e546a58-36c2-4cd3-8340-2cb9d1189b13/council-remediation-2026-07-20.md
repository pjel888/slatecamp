# Council Remediation 2026-07-20 — lea-prac-frm-012 (RA 9184 Government Procurement)

Agent: U (lea-prac-cmp + lea-prac-frm streams)
Bundle: `lea-prac-frm-012-ra-9184-government-procurement-reform-act-architecture-relevant-provisions--8e546a58-36c2-4cd3-8340-2cb9d1189b13`

## Summary

1 CONFIRMED_ERROR remediated. The article body is accurate (RA 9184 principles, BAC 5–7 members, competitive bidding default, consulting-services scope). The error was a single linked question whose prior Batch 102 edit was a no-op.

## Confirmed Error

### `ea9acfef-f13f-479b-a870-49260aa9365a` — RA 12009 vs IRR of RA 9184 conflation

- **Baseline stem:** "How does the latest Revised IRR of RA 9184 enhance procurement, and what should architects do in response?"
- **Baseline options:** every option references "RA 12009" as if it were an IRR of RA 9184.
- **Baseline rationale:** "The Updated 2016 Revised IRR of RA 9184 (as of July 2024) enhances digital processes via PhilGEPS..."
- **Why it is wrong:**
  1. RA 12009 (New Government Procurement Act, signed 20 July 2024) is a NEW STATUTE that REVISED/REPEALED RA 9184 — it is not an IRR of RA 9184. Conflating a statute with an IRR is a category error.
  2. The "(as of July 2024)" date in the rationale is the signing date of RA 12009, not an IRR update date. The 2016 IRR of RA 9184 was last amended March 2021.
  3. The stem and options describe different instruments, making the question incoherent.
- **Prior Batch 102 edit:** no-op (only `code_citation` + `explanation`, no `text`/`options`/`correct_option_id`). Batch 102 did not fix the incoherent stem.
- **Sources:**
  - RA 9184 (local raw: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9184/RA 9184 - Government Procurement Reform Act.pdf`, sha256 `c7cdc5c6...`)
  - RA 12009 full text: https://lawphil.net/statutes/repacts/ra2024/ra_12009_2024.html ("AN ACT REVISING REPUBLIC ACT NO. 9184...")
  - GPPB official page: https://www.gppb.gov.ph/new-government-procurement-act-or-republic-act-no-12009/

## Remediation

- **Edit file:** `question-edits/ea9acfef-f13f-479b-a870-49260aa9365a.json`
- **Action:** `replace`
- **New stem:** asks for the source-safe framing of RA 12009 relative to RA 9184 and what architects should do.
- **New correct_option_id:** `b` (RA 12009 is a successor statute that revises RA 9184; track the new law, its IRR, and PhilGEPS).
- **Validated:** `jq empty` passes.

## Minor noted issue (NOT remediated — answer key is correct)

### `6af33353-e679-4fbe-88af-857bdd40811c` — stem parenthetical "(Updated 2024)"

- The stem reads "What is the primary purpose of RA 9184 & 2016 Revised IRR (Updated 2024)?" The "(Updated 2024)" parenthetical is imprecise (the 2016 IRR was last amended March 2021; the 2024 development was RA 12009). The marked-correct answer (b) "establish the legal framework for government procurement of goods, services, and infrastructure" is factually correct and the question remains answerable. Noted as a wording imprecision, not a confirmed answer-key error. No edit written.

## Bundles verified clean (no errors)

The other 8 frm-012 questions (BAC role, governing principles, scope-change handling, collusion, documentation, consulting-contract scope, informal-arrangement prohibition, three-methods framing) all have correct answer keys aligned to the article body and RA 9184. The article's BAC membership claim ("at least five and not more than seven members") matches RA 9184 Section 11.2.
