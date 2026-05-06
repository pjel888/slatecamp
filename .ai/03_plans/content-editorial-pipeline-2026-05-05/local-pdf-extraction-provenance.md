# Local PDF Extraction Provenance — Phase 0.5A Evidence

**Date:** 2026-05-05
**Scope:** Document extraction readiness and required evidence for any future local PDF-derived files. Assess whether claim-level citation would be safe given current extraction state.
**Status:** Evidence-only planning document. No extraction performed. No files mutated.

---

## 1. Current Extraction State

| Dimension | Status | Evidence |
|---|---|---|
| Original PDFs retained locally | **NONE** | `glob **/*.pdf` returned 0 files |
| Derived text files from PDFs | **NONE** | No markdown/text files from PDF extraction found |
| Extraction metadata recorded | **NONE** | No extraction logs, configs, or provenance files found |
| OCR outputs | **NONE** | No OCR artifacts found |
| Table preservation | **N/A** | No extracted files to assess |
| Formula preservation | **N/A** | No extracted files to assess |
| Page-to-chunk mapping | **N/A** | No extracted files to assess |

---

## 2. Required Extraction Evidence

For any future PDF-derived file to be considered for source-pack material, the following evidence MUST be documented:

### 2.1 Original File Retention
- [ ] Original PDF retained in known location (e.g., `vitruvius-connection/pdfs/` or `.ai/16_source_packs/raw/`).
- [ ] `file_hash_sha256` computed and recorded.
- [ ] File size and page count recorded.
- [ ] Original filename preserved (or renamed with documented rationale).

### 2.2 Extraction Method Documentation
- [ ] Tool identified (pymupdf, pdfminer.six, Adobe Acrobat, manual OCR, etc.).
- [ ] Tool version recorded.
- [ ] Extraction date recorded.
- [ ] Operator/process recorded (human name or script identifier).
- [ ] Parameters recorded (OCR language, image resolution, table detection enabled, etc.).

### 2.3 Text Fidelity Checks
- [ ] **Direct text vs OCR:** Was the PDF text-based or image-based? If image-based, OCR confidence scores should be recorded.
- [ ] **Section headings preserved:** Do extracted files retain original section headings (Rule VIII, Section 805, etc.)?
- [ ] **Page numbers preserved:** Are original page numbers mappable to extracted text positions?
- [ ] **Tables preserved:** Are tabular data extracted as structured text, Markdown tables, or flagged as images?
- [ ] **Formulas preserved:** Are mathematical/formula expressions preserved or flagged?
- [ ] **Annotations removed:** Are highlights, comments, and annotations stripped or flagged?
- [ ] **Headers/footers removed:** Are running headers, footers, and page numbers cleanly separated from body text?

### 2.4 Chunk-to-Source Mapping
- [ ] Can any claim in the extracted text be mapped back to a specific page and section?
- [ ] Is there a deterministic way to generate a locator (e.g., "PD 1096 Rule VIII, Sec 805, p.123")?
- [ ] Are section boundaries clearly delineated in the extracted text?

---

## 3. Claim-Level Citation Safety Assessment

| File Type | Citation Safe? | Reason |
|---|---|---|
| Direct text extraction from official text-based PDF | **Conditional** | Safe IF extraction method is documented, headings/pages preserved, and spot-checked against original |
| OCR extraction from scanned PDF | **High risk** | OCR errors can alter numbers, section references, and legal text; requires human verification |
| Third-party transcription (unverified) | **Unsafe** | Unknown fidelity; may contain paraphrase or error |
| Copy-paste from unofficial mirror | **Unsafe** | Mirrors may be outdated, edited, or incomplete |
| Extraction without section/page preservation | **Unsafe** | Cannot generate claim locators; cannot verify |

---

## 4. Flagged Risk: Philippine Legal Document Extraction

Philippine building codes and laws (PD 1096, BP 344, RA 9514, RA 9266) present specific extraction risks:

| Risk | Impact | Mitigation |
|---|---|---|
| **Section number errors** | Wrong section citation in exam prep causes student failure | Require human spot-check of all section references |
| **Dimensional value errors** | Wrong numbers (setbacks, widths, heights) cause wrong answers | Require independent verification of all numeric tables |
| **Amended vs original text** | Using outdated IRR version | Record version date; verify against latest official amendment |
| **Mixed English/Filipino text** | OCR or extraction may garble mixed text | Record language mix; flag unclear passages |
| **Table fragmentation** | Long tables split across pages may lose continuity | Preserve table context; flag page-break artifacts |

---

## 5. Files Where Claim-Level Citation Would Be Unsafe

**Current state: ALL local files are unsafe for claim-level citation because no extracted source text exists.**

Specifically unsafe:
- Any future file without documented extraction method.
- Any future file without original PDF hash.
- Any future file without section/page preservation.
- Any future file that has not been spot-checked against official source.
- Any file from `vitruvius-connection/` that has not passed the provenance checklist in `local-source-file-inventory.md`.

---

## 6. Extraction Readiness Checklist

Before any PDF extraction work begins:

- [ ] Official PDF source identified and downloaded.
- [ ] Official web URL recorded.
- [ ] Copyright/provider-boundary classification decided (see `source-pack-schema-readiness.md`).
- [ ] Extraction tool chosen and documented.
- [ ] Output format decided (Markdown, JSON chunks, plain text).
- [ ] Section-boundary detection strategy defined.
- [ ] Table/formula handling strategy defined.
- [ ] Human verification capacity confirmed.
- [ ] Spot-check sample size defined (recommend: minimum 5% of pages or 10 pages, whichever is larger).

---

## 7. What Claude Should Review Next

1. Should extraction be performed incrementally (one law at a time) or in parallel?
2. Is OCR acceptable for any source, or should only text-based PDFs be used?
3. Should there be a mandatory "extraction quality gate" that blocks a file from source-pack use until a human has spot-checked it?
4. **Minimum extraction quality by risk:** Critical-risk and High-risk legal/code content require `excellent` extraction quality or expert-reviewed correction before grounding. `good` extraction quality may be acceptable only for Medium/Low-risk content after spot checks. Anything below `good` is not grounding-safe.
