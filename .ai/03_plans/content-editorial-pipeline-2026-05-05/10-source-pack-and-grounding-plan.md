# Source Pack and Grounding Plan

## Objective

Make "source-grounded" operational, not rhetorical. Every legal/code/dimensional/formula/answer-key claim must trace to an approved source pack or be marked `source_needed`.

## Source hierarchy

1. Local primary PDFs in `001_Raw-Source-Layer/`.
2. Existing verified structured sources from Supabase exports.
3. Existing verified article claims only when explicitly marked as original-preserved.
4. Official web sources only as fallback when local PDFs are absent.
5. Model memory is never a source.

## Required source packs

Create source packs for:

- PD 1096 and 2004 Revised IRR
- BP 344 2024 Revised IRR
- RA 9266 and IRR
- RA 9514 and revised IRR
- BP 220
- PD 957
- SPP documents
- Contracts/specifications references
- History/theory references where available

## Source pack artifact shape

Each source pack should include:

```json
{
  "source_pack_id": "pd1096-irr-2004-v1",
  "title": "PD 1096 2004 Revised IRR",
  "source_type": "primary_pdf",
  "file_path": "001_Raw-Source-Layer/...",
  "version_label": "2004 Revised IRR",
  "extraction_method": "pymupdf|pdfminer|manual_ocr",
  "chunks": [
    {
      "chunk_id": "pd1096-rule-viii-sec-805",
      "section_label": "Rule VIII, Section 805",
      "page_start": 123,
      "page_end": 124,
      "text": "...",
      "hash": "sha256..."
    }
  ]
}
```

## Grounding rules

- Every number must cite a source chunk or remain unchanged from original.
- Every legal section reference must cite a source chunk.
- Every penalty, formula, minimum standard, classification, and answer key must cite a source chunk.
- Retrieval results are not enough; the exact source text excerpt must be captured.
- The source pack version/hash used by each AI run must be recorded.

## Source readiness gate

Before any rewrite proposal on high/critical articles:

- Approved source pack exists.
- Source pack extraction quality is marked usable.
- Claim extraction can attach claims to source chunk IDs or mark `source_needed`.
- Reviewer can inspect source excerpts in the review packet.

## Open planning decisions

- Whether source packs live under `.ai/16_source_packs/` or inside `.ai/content-audit-export/source-packs/`.
- Whether source chunks are committed to git or generated from primary PDFs on demand.
- How to handle copyrighted/non-public references.
