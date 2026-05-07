# Source Drop Intake Protocol — Phase 0.5A.1

**Date:** 2026-05-05
**Scope:** Define how local source files must be added, inventoried, hashed, classified, and quarantined before source-pack creation.
**Status:** Planning document only. No implementation. No source pack creation. No file mutation.

---

## 1. Purpose

This protocol governs the intake of local source files (primarily official PDFs and their derived text extractions) into the SlateCamp repository. It exists because:

- The repo now has local intake files visible in `vitruvius-connection/`, but zero approved source candidates.
- `vitruvius-connection/` is an intake/quarantine folder, not a canonical source-pack folder.
- Files must not be treated as canonical until they pass a rigorous provenance and verification pipeline.
- The editorial pipeline doctrine is: **AI proposes. Code validates. Sources decide. Humans approve high-risk changes.**
- Without this protocol, source files risk being used for grounding before their trustworthiness is established.

---

## 2. Source States

Every file entering `vitruvius-connection/` must progress through the following states. No file may skip states. No file may be used for grounding until it reaches at least `VERIFIED_SOURCE_CANDIDATE`.

| State | Code | Definition | Who Promotes | Exit Criteria |
|---|---|---|---|---|
| **Dropped, unreviewed** | `DROPPED_UNREVIEWED` | File has been placed in `vitruvius-connection/` but has not been inspected. | N/A — initial state | File is noticed by inventory pass. |
| **Hashed** | `HASHED` | SHA-256 hash of the original file has been computed and recorded. | Inventory script or human | Hash recorded in manifest; file is byte-identifiable. |
| **Metadata detected** | `METADATA_DETECTED` | Document title, code, issuing body, version/year, and page count have been extracted or manually entered. | Inventory script or human | All required metadata fields populated in manifest. |
| **Provenance review needed** | `PROVENANCE_REVIEW_NEEDED` | The origin of the file is known but not yet verified against an official source. | Automatic — metadata exists but official match is unverified | Official web candidate URL identified. |
| **Official web match needed** | `OFFICIAL_WEB_MATCH_NEEDED` | An official web candidate URL exists but has not been compared to the local file. | Human or script | Spot-check comparison performed; match status recorded. |
| **Human verification needed** | `HUMAN_VERIFICATION_NEEDED` | Automatic checks are insufficient; an SME or admin must confirm accuracy. | Automatic — match is partial, or file is high-risk | Human signs off on verification notes. |
| **Verified source candidate** | `VERIFIED_SOURCE_CANDIDATE` | File has passed hash, metadata, provenance, and verification checks. Ready for source-pack planning, not automatic source-pack creation. | Human or script | All checklist items passed; status explicitly set; `allowed_use` is at least `GROUNDING_CANDIDATE`. Critical-risk files require `verified_match` or `expert_reviewed`. |
| **Rejected — do not use** | `REJECTED_DO_NOT_USE` | File is corrupt, misidentified, infringing, or otherwise unsuitable for any use. | Human or script | Rejection reason recorded; file moved to `99_rejected_or_unverified/`. |

### State Machine Rules

1. **Forward only.** A file may only move to a later state or to `REJECTED_DO_NOT_USE`. It may not revert to an earlier state without explicit annotation.
2. **Grounding gate.** No file in any state before `VERIFIED_SOURCE_CANDIDATE` may be used for:
   - AI grounding
   - Fact-checking
   - Claim-to-chunk mapping
   - Source-pack creation
3. **Rejection is terminal.** Once `REJECTED_DO_NOT_USE`, a file must be moved to `99_rejected_or_unverified/` and must never be used.
4. **Batch preparation allowed; final promotion is human-gated.** A script may prepare promotion packets for multiple files when deterministic criteria are met, but promotion to `VERIFIED_SOURCE_CANDIDATE` always requires explicit human approval. For Low/Medium-risk files, an admin may approve. For High/Critical-risk files, SME/admin verification is required. Automated official-web spot-checks may support the promotion packet, but they do not replace human approval for High/Critical content.

### State-to-Allowed-Use Mapping

| Intake State | Maximum Allowed Use Before Promotion | Minimum Allowed Use to Exit State |
|---|---|---|
| `DROPPED_UNREVIEWED` | `DO_NOT_USE` | `DISCOVERY_ONLY` after file is detected |
| `HASHED` | `DISCOVERY_ONLY` | `DISCOVERY_ONLY` |
| `METADATA_DETECTED` | `DISCOVERY_ONLY` | `AUTHORING_CONTEXT_ONLY` only if metadata is complete |
| `PROVENANCE_REVIEW_NEEDED` | `AUTHORING_CONTEXT_ONLY` | `AUTHORING_CONTEXT_ONLY` |
| `OFFICIAL_WEB_MATCH_NEEDED` | `AUTHORING_CONTEXT_ONLY` | `AUTHORING_CONTEXT_ONLY` |
| `HUMAN_VERIFICATION_NEEDED` | `AUTHORING_CONTEXT_ONLY` | `GROUNDING_CANDIDATE` only after required verification |
| `VERIFIED_SOURCE_CANDIDATE` | `GROUNDING_CANDIDATE` or `CANONICAL_AFTER_REVIEW` | `GROUNDING_CANDIDATE`; `CANONICAL_AFTER_REVIEW` requires final human review |
| `REJECTED_DO_NOT_USE` | `DO_NOT_USE` | None — terminal |

A file in `VERIFIED_SOURCE_CANDIDATE` state with `allowed_use = AUTHORING_CONTEXT_ONLY` remains blocked from grounding. Both axes must pass: intake state **and** allowed-use status.

---

## 3. Core Principles

### 3.1 Original PDFs must be retained

The original PDF is the **source of truth** for local PDF-derived legal/code material. Extracted text is a derivative artifact. If the original PDF is deleted, the chain of trust is broken and the derived text must be reclassified as `LOCAL_DERIVED_TEXT_UNVERIFIED` / `DO_NOT_USE_FOR_GROUNDING` until the original source is restored and re-hashed.

- Original PDFs must be stored in `01_original_pdfs/` under the appropriate document-code folder.
- A file without a retained original PDF and recorded `original_file_sha256` cannot pass the grounding gate.
- If a PDF is obtained from an official website, the download URL and date must be recorded.
- If a PDF is obtained via email, FOI request, or other non-web means, the acquisition method and date must be recorded.
- If the original is genuinely unavailable, the derived text may be classified only as `DISCOVERY_ONLY` or `AUTHORING_CONTEXT_ONLY`; it cannot become `GROUNDING_CANDIDATE` or `CANONICAL_AFTER_REVIEW`.

### 3.2 Extracted text is a grounding artifact, not the source itself

- Extracted text files live in `02_extracted_text/`.
- They must reference their original PDF by filename and hash.
- They must never be edited to "fix" extraction errors without creating a new extraction report in `03_extraction_reports/`.
- If extraction quality is poor, the extracted text must be flagged as `unusable` or `fair` and not used for grounding.

### 3.3 No source file can be used for grounding until manifest, hash, provenance, and verification status exist

This is the **grounding gate**. A file must have:

1. An entry in `00_manifest/source-manifest.csv`.
2. A recorded `original_file_sha256`.
3. A recorded `derived_text_sha256` (if extracted text exists).
4. A `verification_status` of at least `spot_checked`.
5. A `risk_tier` assignment.
6. An `allowed_use` value of at least `GROUNDING_CANDIDATE`.

Without all six, the file is **quarantined**.

---

## 4. Recommended `vitruvius-connection/` Folder Structure

When source files arrive, they must be organized as follows:

```
vitruvius-connection/
  00_manifest/
    source-manifest.csv
    source-manifest.schema.md
  01_original_pdfs/
    pd1096/
    bp344/
    ra9266/
    ra9514/
    spp-contracts/
    prc-programs/
  02_extracted_text/
    pd1096/
    bp344/
    ra9266/
    ra9514/
    spp-contracts/
    prc-programs/
  03_extraction_reports/
    pd1096/
    bp344/
    ra9266/
    ra9514/
    spp-contracts/
    prc-programs/
  04_verification_notes/
    pd1096/
    bp344/
    ra9266/
    ra9514/
    spp-contracts/
    prc-programs/
  99_rejected_or_unverified/
```

### Folder Definitions

| Folder | Purpose | Contents |
|---|---|---|
| `00_manifest/` | Central inventory | `source-manifest.csv` (the single source of truth for all local files) and `source-manifest.schema.md` (this schema document) |
| `01_original_pdfs/` | Original document storage | Unmodified PDFs, organized by document code |
| `02_extracted_text/` | Derived text artifacts | Markdown, plain text, or structured text extracted from PDFs |
| `03_extraction_reports/` | Extraction metadata | Per-file reports: tool used, settings, errors, quality assessment, page-by-page notes |
| `04_verification_notes/` | Human verification records | Spot-check notes, official web comparison logs, SME sign-offs |
| `99_rejected_or_unverified/` | Quarantine and rejection | Files that failed verification, were misidentified, or are awaiting review |

### Subfolder Rules

- Document-code subfolders (e.g., `pd1096/`, `bp344/`) must be created only when the first file for that code arrives.
- Files must never be placed directly in `vitruvius-connection/` — they must go into the appropriate numbered folder and document-code subfolder.
- If a file's document code is unknown, it must be placed in `99_rejected_or_unverified/` with a note requesting classification.

---

## 5. Future Read-Only Inventory Pass Outputs

When a script or human performs a full inventory of `vitruvius-connection/`, it must produce the following artifacts:

| Artifact | Purpose | Location |
|---|---|---|
| `local-source-file-inventory.generated.md` | Human-readable inventory summary | `.ai/03_plans/content-editorial-pipeline-2026-05-05/` or plan pack root |
| `local-source-file-manifest.generated.csv` | Machine-readable manifest (same schema as `source-manifest.csv`) | `vitruvius-connection/00_manifest/` |
| `local-source-file-hashes.json` | JSON map of file paths to SHA-256 hashes | `vitruvius-connection/00_manifest/` |
| `local-source-file-classification.md` | Per-file classification and state | `.ai/03_plans/content-editorial-pipeline-2026-05-05/` or plan pack root |
| `local-source-file-gaps.md` | List of missing fields, unverified files, and blocked actions | `.ai/03_plans/content-editorial-pipeline-2026-05-05/` or plan pack root |

### Inventory Pass Rules

1. **Read-only.** The inventory pass must not modify, move, or rename any file in `vitruvius-connection/`.
2. **Idempotent.** Running the inventory pass twice must produce the same outputs (modulo timestamps).
3. **Append-only.** If outputs already exist, the new pass must create a new timestamped version rather than overwriting.
4. **Git-tracked.** All generated artifacts should be committed to the repo so the inventory state is versioned.

---

## 6. Intake Workflow (Step-by-Step)

### Step 1: File Drop

- A PDF or text file is placed in `vitruvius-connection/01_original_pdfs/<document-code>/` or `02_extracted_text/<document-code>/`.
- The file is automatically in state `DROPPED_UNREVIEWED`.

### Step 2: Inventory Pass

- A script or human runs the inventory pass.
- The file is detected, its path recorded, and its hash computed.
- State promoted to `HASHED`.

### Step 3: Metadata Detection

- The script or human extracts or enters metadata:
  - `source_title`
  - `document_code`
  - `law_code`
  - `issuing_body`
  - `publisher`
  - `jurisdiction`
  - `version_year`
  - `effective_date`
  - `publication_date`
  - `page_count`
- State promoted to `METADATA_DETECTED`.

### Step 4: Provenance Review

- The script or human identifies an official web candidate URL (if any).
- State promoted to `PROVENANCE_REVIEW_NEEDED`.

### Step 5: Official Web Match

- The local file is compared to the official web source.
- Match status recorded: `verified_match`, `presumed_match`, `unverified`, `no_official_url_found`.
- State promoted to `OFFICIAL_WEB_MATCH_NEEDED` if match is pending, or `HUMAN_VERIFICATION_NEEDED` if match is partial.

### Step 6: Human Verification (if required)

- An SME or admin reviews the file and the match evidence.
- Verification notes recorded in `04_verification_notes/<document-code>/`.
- State promoted to `VERIFIED_SOURCE_CANDIDATE` or `REJECTED_DO_NOT_USE`.

### Step 7: Source-Pack Creation (future)

- Only files in `VERIFIED_SOURCE_CANDIDATE` may be chunked and packaged into a source pack.
- Source-pack creation is governed by `10-source-pack-and-grounding-plan.md`.

---

## 7. Quarantine Rules

| Condition | Quarantine Action |
|---|---|
| File has no manifest entry | Flag in `local-source-file-gaps.md`; do not use |
| File has no hash | Flag; do not use |
| File has no metadata | Flag; do not use |
| File has no official web candidate and no human verification | Flag; do not use for grounding; may use for `DISCOVERY_ONLY` |
| Extraction quality is `poor` or `unusable` | Flag; do not use extracted text; retain original PDF |
| `allowed_use` is `DO_NOT_USE` | Move to `99_rejected_or_unverified/` |
| `risk_tier` is `HIGH` or `CRITICAL` | Require human verification before any use |

---

## 8. What is Safe Now

- Defining the folder structure in planning docs; do not create new intake subfolders until Philip explicitly approves or finalized source files are ready to be added.
- Writing this protocol and the related schema/convention documents.
- Running read-only inventory passes (they will produce empty or zero-count outputs, which is valid evidence).
- Planning source-pack schemas and chunking strategies.

## 9. What Remains Blocked

- Using any file in `vitruvius-connection/` for AI grounding.
- Creating source packs from local files.
- Running claim-to-chunk mapping.
- Editing articles or questions based on local sources.
- Any mutation of Supabase based on local source content.

## 10. What Should Happen Once Finalized Files Arrive

1. **Place files** in the correct `vitruvius-connection/` subfolder as part of the source-drop process; retain original PDFs for all grounding candidates.
2. **Run inventory pass** to produce the five generated artifacts.
3. **Review gaps** in `local-source-file-gaps.md`.
4. **Promote files** through the state machine per Section 2.
5. **Do NOT use** any file for grounding until it reaches `VERIFIED_SOURCE_CANDIDATE`; Critical-risk files require `verified_match` or `expert_reviewed`.
6. **Only then** proceed to source-pack creation per `10-source-pack-and-grounding-plan.md`.

---

## 11. Document Relationships

| Document | Relationship |
|---|---|
| `source-file-manifest-schema.md` | Defines the fields in `source-manifest.csv` |
| `source-id-naming-convention.md` | Defines how `source_id` and chunk IDs are constructed |
| `local-source-file-inventory.md` | Records the current local file state (zero files) |
| `source-pack-readiness-report.md` | Gate verdict; references this protocol for unblock criteria |
| `10-source-pack-and-grounding-plan.md` | Defines how verified source candidates become source packs |
| `local-pdf-extraction-provenance.md` | Defines extraction quality standards and tool requirements |

---

*End of Phase 0.5A.1 Source Drop Intake Protocol*
