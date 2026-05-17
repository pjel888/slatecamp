# 04 — Source Verification and Accuracy Gates

Generated: `2026-05-09T05:14:46.925474+00:00`

## Accuracy objective

The target is not “better prose.” The target is **board-review material whose factual claims can survive a legal/code audit**.

For Philippine law/code content, every dimension, date, scope statement, procedure, penalty, role, or conflict rule must be source-supported.

## Source hierarchy

Use this hierarchy for SlateCamp editing:

1. **Approved SlateCamp source packs** under `.ai/16_source_packs/packs/` with chunk locators and validation.
2. **Raw official/local evidence** under `vitruvius-connection/001_Raw-Source-Layer/`, provided version/provenance is reconciled.
3. **Official agency or Official Gazette web/PDF source** used to confirm current version, hash, date, and provenance.
4. **002 conversion layer** only as searchable text after raw source match; never as sole legal truth.
5. **003 canonical knowledge layer** for concept relationships and source discovery; never as sole legal/code truth.
6. **Textbooks/secondary references** for history, theory, materials, structures, and design context; label as secondary and avoid turning them into statute claims.

## Claim classes

Every article claim should be classified:

- `LEGAL_DIMENSION`: numeric dimension, slope, clearance, height, area, occupancy, rating, fee, period, procedure.
- `LEGAL_SCOPE`: who/what is covered, exemptions, applicability, jurisdiction.
- `LEGAL_PROCESS`: permit, certificate, liability, procurement, professional practice process.
- `TECHNICAL_STANDARD`: engineering/utilities/materials standard not necessarily law.
- `HISTORICAL_FACT`: chronology, architect, movement, building, location.
- `THEORY_CONCEPT`: conceptual explanation.
- `EXAM_STRATEGY`: how to think about answering.

Required locator:

- `LEGAL_*`: source pack ID or raw/official file + rule/section/page/table.
- `TECHNICAL_STANDARD`: source/manual/textbook + chapter/page where available.
- `HISTORICAL_FACT`: credible source + page/section or clearly marked general context.
- `THEORY_CONCEPT`: source family or pedagogical framing; avoid fake precision.

## Absolute blockers

Do not publish a claim if:

- a legal/code number has no locator;
- the source version is known to conflict and no governance decision resolves it;
- a local ordinance is presented as national law;
- a draft bill is presented as enacted law;
- a repealed/superseded standard is presented as current without warning;
- the article contradicts its linked question key;
- an answer-key change lacks source locator and independent review;
- a component placeholder leaks into candidate/published content;
- source pack metadata says one law/source family but chunk text or locator points to another law/source family;
- source-pack validation passes structurally but source-family/content integrity has not been checked for the batch source.


## Source-pack integrity gate

Before an article or question uses a source pack, verify that these fields agree:

- `source_pack_id`;
- `source_family`;
- `document_code`;
- source file path / locator;
- chunk text;
- local hash and official hash where available;
- conflict status.

Structural validation is not enough. A pack can pass JSON/schema checks while still pointing to the wrong source family.

Current known quarantine item found during plan-pack review:

- `source-pack-ra-9514-rirr` is labeled as RA 9514 Fire Code RIRR, but its generated chunks point to BP 344 / NCDA accessibility content. Do not use it for RA 9514 article/question edits until rebuilt and revalidated against actual RA 9514 RIRR source files.

## Source ledger format

Each edited article should carry a local source ledger artifact, e.g.:

```json
{
  "article_id": "<uuid>",
  "source_status": "READY_SOURCE_PACK | LOCAL_RAW_NEEDS_RECONCILIATION | ...",
  "claims": [
    {
      "claim_id": "claim-001",
      "claim_text": "Maximum ramp slope is ...",
      "claim_class": "LEGAL_DIMENSION",
      "article_location": "normalized.md section heading / line range",
      "source_family": "BP 344 2024 Revised IRR",
      "source_pack_id": "source-pack-bp-344-2024-revised-irr",
      "locator": "Rule/Section/Page/Table ...",
      "status": "SUPPORTED | NEEDS_REVIEW | REMOVE_OR_REWRITE",
      "notes": "Conflict class if any"
    }
  ]
}
```

## Internet supplementation rule

Internet search is used for:

- locating the current official agency source;
- verifying hash/version/date/provenance;
- finding official errata or latest IRR;
- supplementing learning-design benchmarks;
- checking source conflicts.

Internet search is not used to replace official documents when local/official PDFs exist.

## Source-pack expansion plan

Before large-scale rewriting, expand source coverage in this order:

1. Complete source-pack locators for the 7 existing governed packs.
2. Reconcile all PD 1096 raw variants against current DPWH official PDF.
3. Reconcile BP 344 2024 official NCDA PDF vs local webpage/export variants.
4. Reconcile RA 9514 BFP/official source when security gates allow; label blocked status correctly.
5. Reconcile RA 9266 / PRC/Board IRR provenance.
6. Promote UAP SPP source packs if official/governed source files are accepted.
7. Add RA 9184, Civil Code Art. 1723, CIAP, HLURB/DHSUD, and utilities/technical manuals by priority.
8. For history/theory/design, establish separate secondary-source packs and mark them non-statutory.

## Review matrix

- Low-risk prose cleanup: deterministic validator + model review.
- Technical standard: deterministic validator + source reviewer.
- Legal/code claim: deterministic validator + source reviewer + human/SME gate.
- Answer-key change: all legal/code gates + independent question reviewer.
- New UI component: roundtrip validator + visual/content reviewer.
