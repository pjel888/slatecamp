# 02 — Vitruvius Source Layer Summary

Generated: `2026-05-09T05:14:46.925474+00:00`

## Source-layer crawl summary

`vitruvius-connection/` exists and was crawled locally.

- Total files: **2902**.
- Total size: **9.52 GB**.
- Extension counts: `{'.md': 1842, '.json': 664, '.pdf': 388, '[no_ext]': 4, '.ppt': 1, '.xlsx': 1, '.docx': 1, '.doc': 1}`.

By layer:

- `001_Raw-Source-Layer`: 350 files, 54 dirs, 5,989.0 MB, extensions {'.pdf': 341, '[no_ext]': 3, '.md': 2, '.ppt': 1, '.xlsx': 1, '.docx': 1}
- `002_Raw-Conversion-Layer`: 1375 files, 182 dirs, 3,643.3 MB, extensions {'.md': 664, '.json': 664, '.pdf': 47}
- `003_Canonical-Knowledge-Layer`: 1176 files, 17 dirs, 120.8 MB, extensions {'.md': 1176}

## Layer interpretation

### `001_Raw-Source-Layer`

Use this as the **first local evidence layer** for legal/code/source truth. It contains raw PDFs and original files, including laws, IRRs, textbooks, manuals, and planning references.

It includes major law/code folders such as:

- `BERDE`: 1 files, 1 PDFs
- `BP-220`: 1 files, 1 PDFs
- `BP-344`: 2 files, 2 PDFs
- `CHED`: 1 files, 1 PDFs
- `CIAP`: 1 files, 1 PDFs
- `DENR`: 2 files, 2 PDFs
- `DEPED`: 1 files, 1 PDFs
- `DOE`: 1 files, 1 PDFs
- `DOH`: 5 files, 3 PDFs
- `DPWH`: 2 files, 2 PDFs
- `EO`: 7 files, 7 PDFs
- `HB-3391`: 1 files, 1 PDFs
- `HB-5207`: 1 files, 1 PDFs
- `HLURB-DHSUD`: 16 files, 16 PDFs
- `LGU`: 56 files, 56 PDFs
- `PD-1067`: 3 files, 3 PDFs
- `PD-1096`: 15 files, 15 PDFs
- `PD-1151`: 1 files, 1 PDFs
- `PD-1185`: 1 files, 1 PDFs
- `PD-1216`: 1 files, 1 PDFs
- `PD-1517`: 1 files, 1 PDFs
- `PD-856`: 2 files, 2 PDFs
- `PD-9514`: 1 files, 1 PDFs
- `PD-957`: 4 files, 4 PDFs
- `PRC`: 6 files, 6 PDFs
- `RA-10066`: 1 files, 1 PDFs
- `RA-11201`: 2 files, 2 PDFs
- `RA-11285`: 1 files, 1 PDFs
- `RA-11361`: 1 files, 1 PDFs
- `RA-1378`: 4 files, 3 PDFs
- `RA-386`: 2 files, 2 PDFs
- `RA-4566`: 1 files, 1 PDFs
- `RA-4726`: 1 files, 1 PDFs
- `RA-6969`: 1 files, 1 PDFs
- `RA-7160`: 1 files, 1 PDFs
- `RA-7279`: 1 files, 1 PDFs
- `RA-7899`: 1 files, 1 PDFs
- `RA-7920`: 0 files, 0 PDFs
- `RA-9003`: 1 files, 1 PDFs
- `RA-9184`: 4 files, 4 PDFs
- `RA-9257`: 1 files, 1 PDFs
- `RA-9266`: 2 files, 2 PDFs
- `RA-9279`: 1 files, 1 PDFs
- `RA-9285`: 1 files, 1 PDFs
- `RA-9514`: 1 files, 1 PDFs
- `SB-2982`: 1 files, 1 PDFs
- `UAP`: 21 files, 21 PDFs
- `test`: 6 files, 3 PDFs

### `002_Raw-Conversion-Layer`

Use this for searchable text and extraction convenience only after the matching raw file/version is identified. OCR/markdown conversion can introduce text drift, missing tables, or misread dimensions.

### `003_Canonical-Knowledge-Layer`

Use this as a concept/source/relationship graph and working knowledge layer. Do not let it silently redefine statute/code truth. For legal/code claims, the final grounding must trace back to an official/raw/approved source pack.

## Governed source-pack status

Current `.ai/16_source_packs` validation report says production source packs exist and pass validation.

- Source packs: **7**.
- Chunks: **12**.
- Approval record: `user_governance_human_sme_approval_this_run`.

Packs:

- `source-pack-ra-11285` — RA 11285: 2 chunks; conflict `none_detected_by_script`
- `source-pack-ra-11201` — RA 11201: 2 chunks; conflict `raw_source_matches_official_but_conversion_layer_hash_mismatch`
- `source-pack-dc2019-11-0014` — DC2019-11-0014: 0 chunks; conflict `none_detected_by_script`
- `source-pack-bp-344-2024-revised-irr` — BP 344 2024 Revised IRR: 2 chunks; conflict `local_webpage_pdf_vs_official_download_pdf_hash_mismatch`
- `source-pack-pd-1096-irr` — PD 1096 IRR: 2 chunks; conflict `local_version_vs_current_dpwh_download_hash_mismatch`
- `source-pack-ra-9514-rirr` — RA 9514 RIRR: 2 chunks; conflict `official_source_blocked`
- `source-pack-ra-9266-irr` — RA 9266 IRR: 2 chunks; conflict `authority_host_unverified`

Planning implication:

- These packs can anchor the first legal/code pilot, but they are not sufficient for all 567 articles.
- Some packs retain documented conflict classes; conflict does not necessarily block use if governance approved it, but it must remain visible in the article/question ledger.
- For source families not in `.ai/16_source_packs`, the plan must first reconcile `001_Raw-Source-Layer` files against official sources before making factual edits.

## Known source-risk classes to preserve

- `raw_source_matches_official_but_conversion_layer_hash_mismatch` — raw file can be official even if OCR/conversion hash differs.
- `local_webpage_pdf_vs_official_download_pdf_hash_mismatch` — compare content/locators before use.
- `local_version_vs_current_dpwh_download_hash_mismatch` — current agency PDF may supersede local version.
- `official_source_blocked` — security-gated official source is not the same as official absence.
- `authority_host_unverified` — local source exists but official host/provenance remains unclear.

Detailed machine-readable crawl: `artifacts/vitruvius-source-inventory.generated.json` and `artifacts/source-pack-status.generated.json`.
