# Source File Manifest Schema — Phase 0.5A.1

**Date:** 2026-05-05
**Scope:** Define the required and optional fields for the `source-manifest.csv` that inventories all local source files in `vitruvius-connection/`.
**Status:** Planning document plus generated Phase 0.5A.2 manifest format. The generated manifest is read-only evidence, not source approval.

---

## 1. Purpose

The source file manifest is the **single source of truth** for every local source file in `vitruvius-connection/`. It records identity, provenance, verification status, and usage permissions. No file may be used for grounding without a complete manifest entry.

---

## 2. Field Definitions

### 2.1 Required Fields (All Entries)

| Field | Type | Description | Example |
|---|---|---|---|
| `source_file_id` | String | Stable unique identifier for this physical manifest row/file | `sf-0001-bp344-irr-2024-pdf` |
| `source_id` | String | Stable document/source identity per `source-id-naming-convention.md`; may repeat across related physical files until source-level grouping creates one approved source record | `bp344-irr-ncda-2024` |
| `source_drop_state` | Enum | Intake state per `source-drop-intake-protocol.md`: `DROPPED_UNREVIEWED`, `HASHED`, `METADATA_DETECTED`, `PROVENANCE_REVIEW_NEEDED`, `OFFICIAL_WEB_MATCH_NEEDED`, `HUMAN_VERIFICATION_NEEDED`, `VERIFIED_SOURCE_CANDIDATE`, `REJECTED_DO_NOT_USE` | `HASHED` |
| `local_file_path` | String | Repo-relative path to the file | `vitruvius-connection/01_original_pdfs/bp344/bp344-irr-2024-ncda.pdf` |
| `original_pdf_path` | String | Path to the original PDF (same as `local_file_path` for PDFs; reference for derived text) | `vitruvius-connection/01_original_pdfs/bp344/bp344-irr-2024-ncda.pdf` |
| `derived_text_path` | String | Path to extracted/derived text file; null if not yet extracted | `vitruvius-connection/02_extracted_text/bp344/bp344-irr-2024-ncda.md` |
| `source_title` | String | Full official title of the document | `Implementing Rules and Regulations of Republic Act No. 7277, as Amended by Republic Act No. 9442 and Republic Act No. 10754` |
| `document_code` | String | Short document family code | `bp344` |
| `law_code` | String | Specific law or rule citation | `RA 7277 / RA 9442 / RA 10754` |
| `issuing_body` | String | Official body that issued or administers the document | `NCDA` |
| `publisher` | String | Entity that published the PDF (may differ from issuing body) | `Official Gazette` |
| `jurisdiction` | String | Geographic or legal jurisdiction | `Philippines` |
| `version_year` | String | Year of this version/edition | `2024` |
| `effective_date` | ISO Date | Date the document took effect | `2010-04-15` |
| `publication_date` | ISO Date | Date the document was published (may differ from effective date) | `2009-12-18` |
| `file_type` | Enum | `pdf`, `markdown`, `txt`, `html`, `docx`, `other` | `pdf` |
| `original_file_sha256` | String | SHA-256 hash of the original file | `a1b2c3d4...` |
| `derived_text_sha256` | String | SHA-256 hash of the derived text file; null if not extracted | `e5f6g7h8...` |
| `page_count` | Integer | Total pages in the original document | `142` |
| `extraction_method` | String | Tool or method used for text extraction | `pymupdf` |
| `extraction_tool_version` | String | Version of the extraction tool | `1.23.5` |
| `extraction_quality` | Enum | `excellent`, `good`, `fair`, `poor`, `unusable` | `good` |
| `has_page_locators` | Boolean | Does the derived text preserve or map page numbers? | `true` |
| `has_section_locators` | Boolean | Does the derived text preserve or map section/rule numbers? | `true` |
| `has_table_preservation` | Boolean | Are tables preserved as structured text or flagged? | `true` |
| `has_formula_preservation` | Boolean | Are formulas/equations preserved or flagged? | `false` |
| `official_url_candidate` | URL | Best-known official web URL for this document | `https://www.officialgazette.gov.ph/...` |
| `official_web_match_status` | Enum | `verified_match`, `presumed_match`, `unverified`, `no_official_url_found` | `verified_match` |
| `verification_status` | Enum | `unverified`, `spot_checked`, `page_verified`, `fully_verified`, `expert_reviewed` | `spot_checked` |
| `risk_tier` | Enum | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | `HIGH` |
| `allowed_use` | Enum | See Section 3 | `GROUNDING_CANDIDATE` |
| `notes` | String | Human observations, anomalies, warnings | `Page 87 table partially garbled; flagged in extraction report` |

### 2.2 Optional Fields

| Field | Type | Description | Example |
|---|---|---|---|
| `acquisition_date` | ISO Date | When the file was obtained | `2026-05-01` |
| `acquisition_method` | String | How the file was obtained | `download_from_official_gazette` |
| `acquired_by` | String | Person or system that acquired the file | `philip` |
| `language` | String | Document language | `en` |
| `translation_of` | String | `source_id` of the original language version if this is a translation | `bp344-irr-ncda-2024` |
| `supersedes` | String | `source_id` of the previous version this document replaces | `bp344-irr-ncda-2009` |
| `superseded_by` | String | `source_id` of the newer version that replaces this | `null` |
| `license_status` | String | Copyright or public domain status | `public_domain_government` |
| `ai_processing_allowed` | Boolean | Whether this file may be sent to AI providers for processing | `true` |
| `chunk_count` | Integer | Number of chunks created from this source (populated at source-pack time) | `145` |
| `source_pack_id` | String | ID of the source pack this file belongs to (populated at source-pack time) | `sp-bp344-irr-v1` |
| `amendment_status` | Enum | `current`, `amended_in_part`, `fully_superseded`, `draft_amendment_pending`, `unknown` | `amended_in_part` |
| `date_assigned_current` | ISO Date | Required if `source_id` uses `current`; records when and why current was assigned | `2026-05-05` |

---

## 3. Allowed Use Values

The `allowed_use` field is the **usage permission gate**. It defines what operations are permitted for this file.

| Value | Code | Definition | Grounding Allowed? |
|---|---|---|---|
| **Discovery only** | `DISCOVERY_ONLY` | File may be listed, searched, and referenced in planning documents only. No content may be read or used. | No |
| **Authoring context only** | `AUTHORING_CONTEXT_ONLY` | File may be read by humans for context while writing or editing. AI may not use it for fact-checking or grounding. | No |
| **Grounding candidate** | `GROUNDING_CANDIDATE` | File may be used for AI grounding and fact-checking, but has not yet been promoted to canonical. Changes based on this file should still be reviewed. | Yes, with review |
| **Canonical after review** | `CANONICAL_AFTER_REVIEW` | File is a canonical source. AI may ground on it. Facts supported by this source may be treated as verified after human review. | Yes |
| **Do not use** | `DO_NOT_USE` | File is rejected. It must not be used for any purpose. | No |

### Promotion Rules

- `DISCOVERY_ONLY` → `AUTHORING_CONTEXT_ONLY`: File has complete metadata and hash, and provenance is sufficiently understood for human-only context. A hash alone is not enough.
- `AUTHORING_CONTEXT_ONLY` → `GROUNDING_CANDIDATE`: File has passed provenance review and at least `spot_checked` verification.
- `GROUNDING_CANDIDATE` → `CANONICAL_AFTER_REVIEW`: File has passed full verification and has been reviewed by an SME or admin.
- Any state → `DO_NOT_USE`: File is found to be corrupt, misidentified, or unsuitable.

---

## 4. Validation Rules

### 4.1 Required Fields by File Type

| File Type | Required Fields | Notes |
|---|---|---|
| `pdf` | All required fields except `derived_text_path`, `derived_text_sha256`, `extraction_method`, `extraction_tool_version`, `extraction_quality`, `has_page_locators`, `has_section_locators`, `has_table_preservation`, `has_formula_preservation` | These may be null until extraction is performed |
| `markdown`, `txt` (derived text) | All required fields; `original_pdf_path` must point to a valid PDF entry | Derived text must reference its original |
| `html`, `docx`, `other` | All required fields; `extraction_method` and `extraction_quality` may be `N/A` | Treat as original format, not derived |

### 4.2 Allowed Status Combinations

| `official_web_match_status` | `verification_status` | Valid? | Notes |
|---|---|---|---|
| `no_official_url_found` | `unverified` | Yes | Default for files with no official web presence |
| `no_official_url_found` | `spot_checked` | Yes | Human verified without official web match |
| `unverified` | `unverified` | Yes | Pending comparison |
| `unverified` | `spot_checked` | No | Cannot be spot-checked if official match is unverified |
| `presumed_match` | `spot_checked` | Yes for Low/Medium/High only | Not sufficient for Critical-risk grounding; Critical requires `verified_match` or `expert_reviewed` |
| `verified_match` | `spot_checked` | Yes | Official match confirmed; spot-checked locally |
| `verified_match` | `fully_verified` | Yes | Ideal state |

### 4.3 Grounding Gates

A file may be used for grounding **only if**:

1. `allowed_use` is `GROUNDING_CANDIDATE` or `CANONICAL_AFTER_REVIEW`.
2. `verification_status` is at least `spot_checked`.
3. `original_file_sha256` is not null.
4. If derived text is used, `derived_text_sha256` is not null.
5. If derived text is used for Critical/High-risk legal-code content, `extraction_quality` is `excellent` or the extraction has documented expert-reviewed correction.
6. If derived text is used for Medium/Low-risk content, `extraction_quality` is at least `good` after spot checks.
7. If `risk_tier` is `CRITICAL`, `official_web_match_status` must be `verified_match` or `verification_status` must be `expert_reviewed` / equivalent human sign-off. `presumed_match` is not sufficient for Critical-risk grounding.
8. If `source_id` contains the segment `current`, `date_assigned_current` must be populated and `notes` must contain evidence justifying the label. `allowed_use` must not be `CANONICAL_AFTER_REVIEW` while `current` remains in the ID unless a human review explicitly accepts the current-label exception.
9. If `official_web_match_status` is `presumed_match` for High-risk legal/code content, notes must document an exhaustive official-source search and explain why `verified_match` is unavailable. Otherwise High-risk grounding requires `verified_match` or human review.

If any condition is false, the file is **quarantined** for grounding purposes.

---

## 5. Manifest Format

### 5.1 CSV Format

- Encoding: UTF-8
- Delimiter: comma (`,`)
- Quote character: double quote (`"`)
- Header row: required, using exact field names from Section 2. Generated inventory manifests may include `source_file_id` and `source_drop_state` to distinguish physical file rows from source identities.
- Empty values: empty string or `null` (unquoted)
- Arrays: pipe-separated (`|`) within a single cell
- Booleans: `true` / `false`

### 5.2 JSON Format (Optional Mirror)

A JSON mirror (`source-manifest.json`) may be generated for programmatic access. It must:

- Contain the same data as the CSV.
- Use the same field names.
- Represent each row as an object in a top-level array.
- Use `null` for missing values.

---

## 6. Example Manifest Row

```csv
source_file_id,source_id,source_drop_state,local_file_path,original_pdf_path,derived_text_path,source_title,document_code,law_code,issuing_body,publisher,jurisdiction,version_year,effective_date,publication_date,file_type,original_file_sha256,derived_text_sha256,page_count,extraction_method,extraction_tool_version,extraction_quality,has_page_locators,has_section_locators,has_table_preservation,has_formula_preservation,official_url_candidate,official_web_match_status,verification_status,risk_tier,allowed_use,notes
sf-0001-bp344-irr-2024-pdf,bp344-irr-ncda-2024,HASHED,vitruvius-connection/01_original_pdfs/bp344/bp344-irr-2024-ncda.pdf,vitruvius-connection/01_original_pdfs/bp344/bp344-irr-2024-ncda.pdf,vitruvius-connection/02_extracted_text/bp344/bp344-irr-2024-ncda.md,"Implementing Rules and Regulations of Republic Act No. 7277, as Amended by Republic Act No. 9442 and Republic Act No. 10754",bp344,RA 7277 / RA 9442 / RA 10754,NCDA,Official Gazette,Philippines,2024,2010-04-15,2009-12-18,pdf,a1b2c3d4...,e5f6g7h8...,142,pymupdf,1.23.5,good,true,true,true,false,https://www.officialgazette.gov.ph/...,verified_match,spot_checked,HIGH,GROUNDING_CANDIDATE,Page 87 table partially garbled; flagged in extraction report
```

---

## 7. Document Relationships

| Document | Relationship |
|---|---|
| `source-drop-intake-protocol.md` | Defines the workflow that populates this manifest |
| `source-id-naming-convention.md` | Defines how `source_id` values are constructed |
| `local-source-file-inventory.md` | Uses this schema to record current local file state |
| `source-pack-readiness-report.md` | References this manifest for gate checks |

---

*End of Phase 0.5A.1 Source File Manifest Schema*
