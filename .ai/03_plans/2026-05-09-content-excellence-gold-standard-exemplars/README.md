# Content Excellence Gold-Standard Exemplar Packs

Read and apply `.ai/CONTENT_EXCELLENCE_GOAL.md` before producing any content artifact.

Updated: 2026-05-09

## Purpose

This pack calibrates future SlateCamp article and question production against the content-excellence directive. It is not a Supabase-ready article bundle and must not be pushed as-is. It is a local editorial standard showing the desired combination of source locators, board-review teaching, psychometric question writing, and reviewer discipline.

## Source rule

Primary evidence comes from `vitruvius-connection/001_Raw-Source-Layer/` PDFs. Use `vitruvius-connection/002_Raw-Conversion-Layer/` for search only and `003_Canonical-Knowledge-Layer/` for discovery only. The generated source/evidence files record PDF paths, SHA256 hashes, page counts, page previews, query snippets, claim-level extraction status, and rendered-page visual evidence for OCR-sensitive claims.

See also: `.ai/00_system/vitruvius-source-reference.md`.

## Nine exemplar topics

- `01-bp344-accessible-ramp-geometry`: legal/code dimensional standard.
- `02-ra9266-foreign-architect-temporary-permit`: professional-practice legal gate.
- `03-ra9514-means-of-egress-width-and-count`: fire/life-safety code reasoning.
- `04-npcp-fixture-unit-and-venting`: utilities definition plus system rule.
- `05-vitruvius-principles-and-departments`: theory/history category distinction.
- `06-pd1096-tgfa-ambf-location-controls`: NBCP development controls and area metrics.
- `07-bp220-parks-playgrounds-road-pavement`: economic/socialized-housing subdivision standards.
- `08-pd957-license-to-sell-registration-gate`: subdivision/condominium buyer-protection licensing.
- `09-uap-spp201-pre-design-and-service-boundaries`: professional-service classification and agreement boundaries.

## File pattern per exemplar

Each exemplar directory contains:

- `exemplar-article.md`: learner-facing article excerpt calibrated to the directive.
- `exemplar-question-set.json`: three source-linked MCQs with rationales and distractor explanations.
- `source-ledger.md`: human-readable local PDF locator evidence.
- `claim-ledger.json`: machine-checkable claim ledger with claim class, source status, extraction status, conflict class, linked questions, and SME status.
- `reviewer-memo.md`: calibration verdict, quality notes, and unresolved risks.

## Release status

Status: `PASS_FOR_CALIBRATION`, `HOLD_FOR_DIRECT_PUBLICATION`.

Reason: The artifacts are source-verified against local PDFs and LLM-council reviewed for calibration, but they are not normalized article bundles, not composed through `content-audit:compose`, and not licensed-human-SME-signed for learner-facing release.


## SME risk-review closeout

- Completed: 2026-05-09.
- Council folder: `council-reviews/2026-05-09-sme-risk-review/`.
- OCR evidence folder: `ocr-visual-evidence.generated/`.
- Result: all nine packs are accepted for calibration after fixes; direct publication remains held.
