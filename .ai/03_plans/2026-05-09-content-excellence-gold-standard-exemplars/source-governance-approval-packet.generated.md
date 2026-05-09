# Source Governance Approval Packet

Generated: 2026-05-09T10:35:18Z

## Scope

Target source-governance repair for four law/code packs used by the gold-standard exemplar set:

- `source-pack-bp-344-2024-revised-irr`
- `source-pack-ra-9514-rirr`
- `source-pack-pd-1096-irr`
- `source-pack-ra-9266-irr`

## Source decisions

- BP 344: current anchor is the 2024 NCDA / Official Gazette amended IRR. Local NCDA webpage PDF hash differs from the downloadable Official Gazette PDF, but both are recorded; ramp/handrail terms are verified in the local source-layer PDF.
- RA 9514: BFP remote URLs were blocked by HTTP 403. The local BFP-published 2019 RIRR PDF is non-empty, hashed, and text-extractable; corrupted BP 344 chunks were replaced.
- PD 1096: DPWH public URLs returned anti-bot/noindex HTML. The local DPWH Official 2004 Revised IRR PDF is hashed/text-extractable and used as governing source-layer anchor.
- RA 9266: ArchitectureBoard IRR PDF is verified remotely with Section 38 evidence; Lawphil RA 9266 Act HTML is supplementary; local PRBoA PDF remains local source-layer copy.

## Repair outputs

- Rebuilt source-pack chunks and manifests under `.ai/16_source_packs/packs/`.
- Updated claim ledgers and source ledgers for packs 01, 02, 03, and 06.
- Updated `remaining-risk-inventory.generated.json`, `validation-report.md`, and `sme-risk-review-closeout.generated.md`.
- Source evidence audit: `official-source-evidence.generated/source-anchor-audit.generated.json`.

## Release boundary

No active unresolved claim risk remains in the repaired target packs for calibration. Status remains `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`; direct learner-facing publication remains held pending licensed-human SME release approval and SlateCamp roundtrip conversion.

## 2026-05-09 final council correction

- OpenCode final SME review detected that the tested Supreme Court eLibrary URL in the source audit resolved to a BOC Customs Memorandum Order page, not RA 9266.
- Correction applied: the eLibrary page is now recorded only as an invalid remote attempt and is excluded from RA 9266 evidence.
- RA 9266 remains source-grounded through the ArchitectureBoard IRR PDF (`9c725f42e14fe5b43359bbe9edc7f4c96bff15e49f4357492622e2d24dc6a1cd`), Lawphil RA 9266 Act HTML, and the local PRBoA IRR PDF.
