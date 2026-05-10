# Validation Report - Content Excellence Gold-Standard Exemplar Packs

Generated: 2026-05-09
Updated: 2026-05-09T10:35:18Z

## Structural checks

- Exemplar directories checked: 9
- Required files per exemplar: 5
- Total MCQs: 27
- Total ledgered claims: 32
- JSON parse check: PASS
- Claim-ledger schema presence: PASS
- Not-found extraction cannot be marked SUPPORTED: PASS
- Conflict/provenance disclosure present: PASS

## Gate matrix

- Gate A: Source hierarchy tier <= 2 for legal/code claims — PASS for calibration.
- Gate B: Text-extraction failures resolved or flagged — PASS. NPCP `npcp-c1`, NPCP `npcp-c2`, and Vitruvius `vitruvius-c1` are now `FOUND_VERBATIM` / `SUPPORTED` for calibration after PyMuPDF extraction plus rendered-page visual checks.
- Gate C: Structured locator fields present in `claim-ledger.json` — PASS for calibration.
- Gate D: Conflict/provenance class disclosed — PASS for calibration.
- Gate E: Distractor rationales source-family faithful — PASS for corrected sampled issues; LLM council SME calibration review complete; licensed-human SME still required for release.
- Gate F: Article assertions do not contradict linked question keys — PASS by manual/sample review.
- Gate G: Anti-slop lint — PASS for created/edited exemplar markdown.
- Gate H: Question keys linked to ledger claim IDs — PASS where directly applicable.
- Gate I: Rule/Division/Section vocabulary sanity — PASS for corrected RA 9514 exemplar.
- Gate J: Document version/edition declared — PASS for calibration.

## Known hold reasons

- LLM council SME calibration review is complete for all packs; licensed-human SME review remains required before learner-facing release.
- These are not normalized article bundles and must not be pasted directly into Supabase.
- Source/provenance repair is complete for BP 344, RA 9514, PD 1096, and RA 9266 calibration packs. Direct learner-facing publication still requires licensed-human SME release approval and roundtrip conversion.

## Errors

- None.

## SME council closeout

- Council review folder: `council-reviews/2026-05-09-sme-risk-review/`.
- Synthesis: `council-reviews/2026-05-09-sme-risk-review/04-sme-council-synthesis.md`.
- OCR/text evidence: `ocr-visual-evidence.generated/ocr-text-extraction-resolution.generated.md`.
- Final calibration decision: all 9 packs remain `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION` after applied fixes.
