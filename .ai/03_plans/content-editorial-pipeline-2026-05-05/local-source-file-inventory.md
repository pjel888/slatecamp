# Local Source File Inventory — Phase 0.5A Evidence

**Date:** 2026-05-05
**Scope:** Find, classify, and inventory all local source/reference/PDF-derived files in the SlateCamp repo. Treat existence as evidence, not as canonicality.
**Status:** Evidence-only planning document. No implementation. No source pack creation.

---

## 1. Search Methodology

Searches performed:
- `glob **/vitruvius-connection/**` — folder exists and latest Phase 0.5A.2 runtime check found 2,551 visible files.
- `find vitruvius-connection -maxdepth 3 -print` — confirmed two visible top-level copied folders: `002_Raw-Conversion-Layer/` and `003_Canonical-Knowledge-Layer/`.
- Generated hash inventory found 47 PDF files, 1,840 Markdown files, and 664 JSON/sidecar files.
- `glob **/.ai/16_source_packs/**` — no files found.
- `glob **/001_Raw-Source-Layer/**` — no files found.
- `glob **/.ai/content-audit-export/source-packs/**` — no files found.
- `grep vitruvius` across repo — no matches found.
- Manual inspection of `.ai/content-audit-export/articles/*/sources.json` — 567 exported article-bundle citation metadata files.
- Live read-only check of `public.wiki_article_sources` — 1,110 total citation rows, 0 verified, 0 populated URLs.

**Count note:** `567` is the number of article-bundle `sources.json` files. `1,110` is the number of exported/live citation rows inside `wiki_article_sources`. Neither count represents approved source files.

---

## 2. Local Source File Inventory Table

| local_file_path | original_pdf_available | derived_text_available | source_title | issuing_body | law/document_code | version/date | file_hash_sha256 | text_hash_sha256 | page_count | extraction_method | extraction_quality | official_web_match_status | canonical_candidate | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `.ai/content-audit-export/articles/*/sources.json` (567 files) | No | No (metadata only) | Per-article citation metadata | N/A | N/A | N/A | N/A | N/A | N/A | Supabase export | N/A | Not applicable | `DB_EXPORT_CITATION_METADATA` | Discovery seed only; export of `wiki_article_sources`; labels only, no text excerpts, no claim locators |
| `DATABASE_SCHEMA.sql` | No | No | Database schema definition | SlateCamp | N/A | 2026-04-29 (audit date) | N/A | N/A | N/A | N/A | N/A | Not applicable | `NOT_A_SOURCE` | Schema truth, not content source |
| `supabase/migrations/20260321_wiki_dsgn013_01.sql` | No | No | Migration creating `wiki_article_sources` | SlateCamp | N/A | 2026-03-21 | N/A | N/A | N/A | N/A | N/A | Not applicable | `NOT_A_SOURCE` | Schema migration, not content |
| `supabase/migrations/20260321_wiki_dsgn013_02.sql` | No | No | Migration creating `taxonomy_sources` | SlateCamp | N/A | 2026-03-21 | N/A | N/A | N/A | N/A | N/A | Not applicable | `NOT_A_SOURCE` | Schema migration, not content |
| `src/types/supabase.ts` | No | No | Generated TypeScript types | SlateCamp | N/A | Generated | N/A | N/A | N/A | N/A | N/A | Not applicable | `NOT_A_SOURCE` | Type definitions, not content |
| `vitruvius-connection/002_Raw-Conversion-Layer/` | Partial / unverified | Yes | Raw conversion-layer files | Mixed / not yet reconciled | Mixed / not yet reconciled | Unknown | See `local-source-file-hashes.json` | See `local-source-file-hashes.json` | Unknown | Unknown / sidecar-dependent | Unreviewed | Not checked | `LOCAL_DERIVED_TEXT_UNVERIFIED` / `LOCAL_UNKNOWN_PROVENANCE` | 1,375 visible files. Includes 47 PDFs, derived Markdown, and sidecar JSON; source-level grouping and verification still required. |
| `vitruvius-connection/003_Canonical-Knowledge-Layer/` | No original PDFs in this layer | Yes | Vitruvius canonical working-layer Markdown | Mixed / not yet reconciled | Mixed / not yet reconciled | Unknown | See `local-source-file-hashes.json` | See `local-source-file-hashes.json` | N/A | Markdown/frontmatter parse only | Unreviewed | Not checked | `LOCAL_DERIVED_TEXT_UNVERIFIED` | 1,176 visible files. Named/organized as a Vitruvius canonical working layer, but not independently trusted or SlateCamp-verified source truth. |

---

## 3. Classification Summary

| Classification | Count | Files |
|---|---|---|
| `LOCAL_OFFICIAL_PDF_VERIFIED` | 0 | None |
| `LOCAL_OFFICIAL_PDF_UNVERIFIED` | 0 | None in this generated classification; the visible PDFs are treated conservatively until source identity/provenance is reconciled |
| `LOCAL_DERIVED_TEXT_VERIFIED` | 0 | None |
| `LOCAL_DERIVED_TEXT_UNVERIFIED` | 1,840 | Visible Markdown/text files under the conversion and canonical working layers; not original sources |
| `DB_EXPORT_CITATION_METADATA` | 567 | `sources.json` bundle exports; discovery seeds only, not sources |
| `LOCAL_UNKNOWN_PROVENANCE` | 711 | 47 visible PDFs plus 664 JSON/sidecar files needing provenance review and source-level pairing |
| `DO_NOT_USE_FOR_GROUNDING` | ~50+ | Schema files, migration files, type files, config files |

---

## 4. Key Finding: Files Visible, But Zero Approved Source Candidates

**Evidence:** `vitruvius-connection/` now contains 2,551 visible files across `002_Raw-Conversion-Layer/` and `003_Canonical-Knowledge-Layer/`: 47 PDFs, 1,840 Markdown files, and 664 JSON/sidecar files. Generated SHA-256 hashes are recorded in `local-source-file-hashes.json`. No `001_Raw-Source-Layer/` folder or `.ai/16_source_packs/` folder is visible.

**Implication:** The visibility blocker is resolved, but the repo still has **zero approved source candidates** capable of grounding factual claims. Visible files must be grouped by source identity, matched to official sources or human/SME verified, and promoted through the intake gate before use.

---

## 5. Future Inventory Fields (Required for `vitruvius-connection/`)

When the `vitruvius-connection/` folder is populated with PDF-derived markdown files, each file MUST be inventoried with these fields.

**The canonical schema is now defined in `source-file-manifest-schema.md`.** The fields below are a summary; refer to that document for the full CSV schema, validation rules, and grounding gates.

### Required Fields (Summary)
- `source_file_id` — unique row/physical-file ID for generated manifests.
- `source_id` — stable document/source identity per `source-id-naming-convention.md`; may repeat across related physical files until source-level grouping is complete.
- `local_file_path` — repo-relative path.
- `original_pdf_path` — path to the original PDF.
- `derived_text_path` — path to extracted text.
- `source_title` — full official title.
- `document_code`, `law_code`, `issuing_body`, `publisher`, `jurisdiction`.
- `version_year`, `effective_date`, `publication_date`.
- `file_type`, `original_file_sha256`, `derived_text_sha256`.
- `page_count`, `extraction_method`, `extraction_tool_version`, `extraction_quality`.
- `has_page_locators`, `has_section_locators`, `has_table_preservation`, `has_formula_preservation`.
- `official_url_candidate`, `official_web_match_status`, `verification_status`.
- `risk_tier`, `allowed_use`, `notes`.

### Provenance Checklist for Each File
Before a file can be classified as `LOCAL_DERIVED_TEXT_VERIFIED` or higher:
- [ ] Original PDF retained with hash.
- [ ] Extraction metadata recorded (tool, date, operator).
- [ ] Official web source identified and URL recorded.
- [ ] Sample pages spot-checked against official source.
- [ ] Section headings preserved in extraction.
- [ ] Page numbers preserved or mappable.
- [ ] Tables/formulas preserved or flagged.

---

## 6. `vitruvius-connection/` Folder Status

**Current status:** `POPULATED INTAKE FOLDER — FILES VISIBLE, NOT VERIFIED`

**Visible contents:**
- `002_Raw-Conversion-Layer/` — 1,375 files, including PDFs, derived Markdown, and sidecar JSON.
- `003_Canonical-Knowledge-Layer/` — 1,176 canonical working-layer Markdown/JSON files.
- 2,551 files total; all hashable in this runtime.

**Caution:** These files are still intake/quarantine evidence. They are not SlateCamp-approved source truth until provenance verification is complete.

**Required before treating as canonical:**
1. Provenance documented (original PDF, extraction metadata).
2. Hash of original file recorded.
3. Official web confirmation OR human verification by SME/admin.
4. Extraction quality assessed.
5. Classification assigned per this inventory and `source-drop-intake-protocol.md`.

**Recommended folder structure:** Defined in `source-drop-intake-protocol.md`, Section 4.

---

## 7. Safe Actions Now

- Use the generated manifest and hashes as read-only evidence.
- Prepare source-level grouping/reconciliation packets from the visible PDFs, Markdown, sidecars, and canonical pages.
- Identify official URL candidates and human/SME verification needs.
- Keep using `source-file-manifest-schema.md`, `source-drop-intake-protocol.md`, and `source-id-naming-convention.md` as the gate rules.
- Do NOT treat any visible file as canonical until it passes the provenance checklist and reaches `VERIFIED_SOURCE_CANDIDATE` per `source-drop-intake-protocol.md`.

## 8. Blocked Actions

- Building source packs from local files before source-level verification.
- Claim-to-chunk mapping before at least one source is approved.
- Automated fact-checking against local sources before official-web or human/SME verification.
- Using any file in `vitruvius-connection/` for AI grounding while it remains unverified intake material.

---

## 9. Related Documents

| Document | Purpose |
|---|---|
| `source-drop-intake-protocol.md` | Defines intake workflow, source states, quarantine rules, and folder structure |
| `source-file-manifest-schema.md` | Defines the full CSV manifest schema, validation rules, and grounding gates |
| `source-id-naming-convention.md` | Defines `source_id` and chunk ID formats |
| `source-pack-readiness-report.md` | Gate verdict; references this inventory |

---

*End of Phase 0.5A Local Source File Inventory*
