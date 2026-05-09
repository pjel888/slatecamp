# LLM Council Review Synthesis - Gold-Standard Exemplar Packs

Date: 2026-05-09

## Council sources

- Claude Code: `council-reviews/01-claude-review.md`
- OpenCode: `council-reviews/02-opencode-review.md`
- Command Code: `council-reviews/03-commandcode-review.md`

## Consensus accepted

1. The first five exemplars were a useful calibration floor, not yet award-grade.
2. Source ledgers needed claim-level structure: `claim_id`, `claim_class`, locator, extraction status, conflict class, and linked question IDs.
3. OCR/text-extraction failures must not be hidden. NPCP and Vitruvius claims now carry `NEEDS_REVIEW` until visual verification/SME review.
4. RA 9514 source vocabulary needed correction: use Rule → Division → Section; do not insert “Chapter 2.”
5. Distractor rationales must be source-family faithful. BP 344 Q2 and NPCP Q1 were corrected.
6. The pack needed broader coverage: PD 1096, BP 220, PD 957, and UAP SPP were added.
7. Writing prompts need an explicit link to `vitruvius-connection/` and the source-layer hierarchy.

## Recommendations not adopted verbatim

- Command Code called RA 9184 “green building.” That was not adopted because RA 9184 is government procurement, not the green-building law.
- Council suggestions to publish or promote exemplars were not adopted. All packs remain calibration-only and `HOLD_FOR_DIRECT_PUBLICATION` until roundtrip + SME review.

## Applied file changes

- Added `claim-ledger.json` to all five original exemplar folders.
- Added four new exemplar folders: `09-uap-spp201-pre-design-and-service-boundaries`, `07-bp220-parks-playgrounds-road-pavement`, `08-pd957-license-to-sell-registration-gate`, `09-uap-spp201-pre-design-and-service-boundaries`.
- Added source reference docs under `.ai/00_system/`.
- Updated README/index/validation artifacts to reflect nine packs and the new gates.
