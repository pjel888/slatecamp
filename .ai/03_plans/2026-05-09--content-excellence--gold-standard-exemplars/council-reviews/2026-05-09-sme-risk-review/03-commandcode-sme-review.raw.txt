---

# SME Council Review Memo — Content Excellence Gold Standard Exemplars
**Reviewer**: Philippine LEA/ALE SME Council (LLM Calibration Review)
**Date**: 2026-05-09
**Packet**: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/council-reviews/2026-05-09-sme-risk-review/00-sme-council-review-packet.md`

---

## Verdict Summary

| Pack | Verdict | Direct Publication Hold |
|------|---------|------------------------|
| 01-bp344-accessible-ramp-geometry | **PASS_FOR_CALIBRATION** | HOLD |
| 02-ra9266-foreign-architect-temporary-permit | **PASS_FOR_CALIBRATION** | HOLD |
| 03-ra9514-means-of-egress-width-and-count | **PASS_FOR_CALIBRATION** | HOLD |
| 04-npcp-fixture-unit-and-venting | **PASS_FOR_CALIBRATION** | HOLD |
| 05-vitruvius-principles-and-departments | **PASS_FOR_CALIBRATION** | HOLD |
| 06-pd1096-tgfa-ambf-location-controls | **PASS_FOR_CALIBRATION** | HOLD |
| 07-bp220-parks-playgrounds-road-pavement | **PASS_FOR_CALIBRATION** | HOLD |
| 08-pd957-license-to-sell-registration-gate | **PASS_FOR_CALIBRATION** | HOLD |
| 09-uap-spp201-pre-design-and-service-boundaries | **PASS_FOR_CALIBRATION** | HOLD |

**No packs blocked. No citation corrections required.**

---

## OCR/Text Extraction Determinations

### APPROVED for Promotion to `FOUND_VERBATIM` / `SUPPORTED`

| Claim | Pack | Determination |
|-------|------|---------------|
| **npcp-c1** | 04-npcp-fixture-unit-and-venting | **APPROVED**. Visual evidence from PDF p.24 confirms verbatim text: "One fixture unit is equivalent to a rate of flow at 28.3 liters per minute (1 cu. ft./minute)." Promote extraction status from `NOT_FOUND_BY_TEXT` to `FOUND_VERBATIM`. |
| **npcp-c2** | 04-npcp-fixture-unit-and-venting | **APPROVED**. Visual evidence from PDF p.44 confirms verbatim text: "no vent pipe shall be used as a soil or waste pipe, nor shall any soil or waste pipe be used as a vent." Promote extraction status from `NOT_FOUND_BY_TEXT` to `FOUND_VERBATIM`. |
| **vitruvius-c1** | 05-vitruvius-principles-and-departments | **APPROVED**. Visual evidence from PDF pp.33-36 confirms verbatim text: "ARCHITECTURE depends on Order... Arrangement... Eurythmy, Symmetry, Propriety, and Economy." Morgan translation. Promote extraction status from `NOT_FOUND_BY_TEXT` to `FOUND_VERBATIM`. |

---

## Source/Provenance Risk Assessment

### 02-ra9266-foreign-architect-temporary-permit
- **Conflict**: `authority_host_unverified`
- **Assessment**: Acceptable for calibration. Local PDF SHA256 (`d0ce03b572f40560647359abf8e3a38c14bbf9b1b1436389a6d9148eb6fd0574`) matches approved source pack hash. Content conflict flag is false. The claim `ra9266-foreign-c1` (Section 38 temporary permit requirement) is properly sourced to the RA 9266 IRR.

### 06-pd1096-tgfa-ambf-location-controls
- **Conflict**: `source_pack_conflict_status_unknown_for_this_new_pack`
- **Assessment**: Acceptable for calibration. The claim ledger references `source-pack-pd-1096-rirr` but the actual source pack is `source-pack-pd-1096-irr`. This is a metadata naming discrepancy, not a content issue. The exemplar correctly uses the full raw DPWH 2004 RIRR PDF with SHA256 `ca465dd26cb1c4a235fd63d01b19c7239a73920f3753b7807cc8e98a3ac33bc6` and accurate page locators (Rule VII, Sections 704-705, pp.81, 83). All four claims are properly supported.

### 09-uap-spp201-pre-design-and-service-boundaries
- **Conflict**: `two-source-pack; no conflict detected by script`
- **Assessment**: Acceptable for calibration. Both sources are from the raw source layer:
  - UAP SPP 201 (SHA256: `d3b76a26515c2eb4d584096ce60843b75c357f18b0767b72508d765eb554ef93`)
  - UAP Document 401-402 (SHA256: `5775329aa0feb1ca49b54543d1bfad1f93e137a1755d5d51fe1e1658e3b2f43f`)
- No content conflicts detected. Claims properly cross-reference between documents (e.g., SPP 201 scope vs. 401-402 exclusions).

---

## Citation Corrections

**None required.** All citations follow the required format:
- Primary Law → IRR → Section/Rule → Specific Provision
- Raw source path and SHA256 recorded in source ledgers
- Page locators verified against 001_Raw-Source-Layer documents

---

## Publication Hold Recommendation

**All packs: HOLD_FOR_DIRECT_PUBLICATION**

Rationale:
1. These are calibration exemplars designed for model training/alignment, not production learner-facing content
2. Per CONTENT_EXCELLENCE_GOAL.md Section 4A: "Never paste calibration exemplars directly into Supabase; use the roundtrip article/question pipeline"
3. Source reconciliation issues (hash mismatches, authority verification) are acceptable for calibration but should be resolved before direct publication
4. Roundtrip protocol requires conversion to normal article bundles with fresh source verification before Supabase insertion

---

## Disagreement-Worthy Concerns

**None.** All claims are:
- Properly classified (LEGAL_DIMENSION, LEGAL_PROCESS, LEGAL_SCOPE, TECHNICAL_STANDARD, THEORY_CONCEPT, EXAM_STRATEGY)
- Sourced to 001_Raw-Source-Layer primary documents
- Supported by verbatim or paraphrased extraction with locators
- Free of content conflicts that would affect calibration validity

The three previously flagged OCR claims are now resolved with visual PDF evidence. The source pack metadata issues in 02-ra9266 and 06-pd1096 do not affect claim validity.

---

**SME Review Status**: Complete
**Recommended Action**: Accept all 9 packs for calibration; maintain direct publication hold pending roundtrip conversion.
