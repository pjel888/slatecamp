# Council Remediation 2026-07-20 — lea-prac-frm-009 (CPD Activity Types for Architects)

Agent: U (lea-prac-cmp + lea-prac-frm streams)
Bundle: `lea-prac-frm-009-cpd-activity-types-for-architects--939408a5-777b-437f-ad59-555132f8714a`

## Summary

1 CONFIRMED_ERROR remediated. The article body is source-safe; the error was in a linked question whose prior Batch 102 edit was a no-op that preserved an unsupported answer key.

## Confirmed Error

### `16cb431b-a7d6-4bec-a18d-ae15134aecaf` — unsupported CPD credit hierarchy

- **Baseline question:** "Which CPD activity type typically awards the highest credit units?" with marked-correct answer (c) "Structured learning with formal courses."
- **Why it is wrong:** The article body explicitly states "this batch does not treat their exact credit hierarchy as source-primary from RA 9266 IRR alone" and "Do not claim an exact credit hierarchy unless the current CPD guideline or CPD law source is in hand." The only checked local source is RA 9266 IRR (Section 28), which establishes CPD purpose, the IAPOA program role, and Board provider accreditation — NOT which activity type earns the highest credit units. The baseline `code_citation` "RA 10912" references a law not present in the local source packet for this bundle.
- **Prior Batch 102 edit:** no-op (kept answer key, only added a code_citation/explanation noting "credit hierarchy source-limited"). The prior edit acknowledged the gap but did not fix the question.
- **Source:** RA 9266 IRR Section 28 (local raw: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9266/RA-9266 IRR Architecture Act of 2004.pdf`, sha256 `d0ce03b5...`).

## Remediation

- **Edit file:** `question-edits/16cb431b-a7d6-4bec-a18d-ae15134aecaf.json`
- **Action:** `replace`
- **New stem:** tests the source-supported rule — which entity RA 9266 IRR Section 28 entrusts with developing the CPD program (IAPOA/UAP), with other entities becoming providers upon Board accreditation.
- **New correct_option_id:** `a`
- **Validated:** `jq empty` passes.

## Bundles verified clean (no errors)

All other frm-009 questions (9 of 10) have full Batch 102 replacement edits aligned to the article body and the RA 9266 IRR source. No additional errors found.
