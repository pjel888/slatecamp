# Official / Cited Source Anchor Audit

Generated: 2026-05-09T10:22:03Z
Updated: 2026-05-09T10:52:04Z

## Remote official/cited anchors
- `bp344_ncda_official_gazette_pdf`
  - url: `https://ncda.gov.ph/wp-content/uploads/2024/08/amended-IRR-BP-344-Official-Gazette.pdf`
  - final_url: `https://ncda.gov.ph/wp-content/uploads/2024/08/amended-IRR-BP-344-Official-Gazette.pdf`
  - status: `200`
  - content_type: `application/pdf`
  - bytes: `8925701`
  - sha256: `7c4a75a5190897f20844ec8981711c5453954504d609568a292dea9e6888fa76`
  - page_count: `16`; matched_pages: `[]`
- `ra9266_architectureboard_pdf`
  - url: `https://www.architectureboard.com.ph/wp-content/uploads/2019/09/1.2-04_IRR_RA9266-coded.pdf`
  - final_url: `https://www.architectureboard.com.ph/wp-content/uploads/2019/09/1.2-04_IRR_RA9266-coded.pdf`
  - status: `200`
  - content_type: `application/pdf`
  - bytes: `273080`
  - sha256: `9c725f42e14fe5b43359bbe9edc7f4c96bff15e49f4357492622e2d24dc6a1cd`
  - page_count: `29`; matched_pages: `[7, 24, 25, 26, 27]`
- `ra9266_lawphil_act_html`
  - url: `https://lawphil.net/statutes/repacts/ra2004/ra_9266_2004.html`
  - final_url: `https://lawphil.net/statutes/repacts/ra2004/ra_9266_2004.html`
  - status: `200`
  - content_type: `text/html`
  - bytes: `54543`
  - sha256: `28dc7672ad927101f1ee1fe8e2fc59565280c1403314278f0f735739471b2f5d`

## Local source-layer anchors
- `bp344_local_ncda_webpage_pdf`
  - path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf`
  - bytes: `1529007`
  - sha256: `63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953`
  - page_count: `78`; matched_pages: `[2, 7, 10, 26]`
- `ra9514_local_bfp_rirr_pdf`
  - path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9514/RA9514-RIRR-rev-2019.pdf`
  - bytes: `23959491`
  - sha256: `ace1e9fbbeb67d294171ed743d46eda2a4c199b9bb642862bab8524b80754266`
  - page_count: `448`; matched_pages: `[94, 95, 113, 134, 142, 148, 154, 161, 164, 168]`
- `pd1096_local_dpwh_official_rirr_pdf`
  - path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).pdf`
  - bytes: `12275787`
  - sha256: `ca465dd26cb1c4a235fd63d01b19c7239a73920f3753b7807cc8e98a3ac33bc6`
  - page_count: `368`; matched_pages: `[81, 83, 84, 113, 114, 128, 138, 345, 348, 350]`
- `ra9266_local_prboa_irr_pdf`
  - path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9266/RA-9266 IRR Architecture Act of 2004.pdf`
  - bytes: `94234`
  - sha256: `d0ce03b572f40560647359abf8e3a38c14bbf9b1b1436389a6d9148eb6fd0574`
  - page_count: `24`; matched_pages: `[5, 20, 21]`

## Blocked remote attempts
- `https://bfp.gov.ph/wp-content/uploads/2019/10/RA-9514-IRR-2019.pdf` — HTTP 403 during 2026-05-09 source audit; local BFP-published PDF in 001_Raw-Source-Layer used with hash and PyMuPDF text extraction.
- `https://bfp.gov.ph/wp-content/uploads/2020/10/RA9514-RIRR-rev-2019.pdf` — HTTP 403 during 2026-05-09 source audit; local BFP-published PDF in 001_Raw-Source-Layer used with hash and PyMuPDF text extraction.
- `https://www.dpwh.gov.ph/dpwh/sites/default/files/laws_codes_orders/PD%201096%20IRR.pdf` — HTTP 200 anti-bot/noindex HTML body, not PDF; local DPWH Official PDF used with hash and PyMuPDF text extraction.
- `https://www.dpwh.gov.ph/DPWH/files/nbc/PD_1096_NBCP_IRR.pdf` — HTTP 200 anti-bot/noindex HTML body, not PDF; local DPWH Official PDF used with hash and PyMuPDF text extraction.

## Invalid remote attempts excluded from source evidence
- `https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/48533` — INVALID_RA9266_ANCHOR: 2026-05-09 final council review found this eLibrary URL resolves to a BOC Customs Memorandum Order page, not RA 9266. It is excluded from RA 9266 source evidence; ArchitectureBoard PDF and Lawphil RA 9266 Act HTML remain the remote anchors.

## Reconciliation decisions
- `source-pack-bp-344-2024-revised-irr`: Use the 2024 NCDA / Official Gazette BP 344 amended IRR as current governing anchor. Local NCDA webpage PDF hash differs from official downloadable PDF; both contain the ramp terms searched, and the official downloadable PDF SHA256 is recorded. Conflict is documented/reconciled for calibration; direct publication still requires human SME and roundtrip.
- `source-pack-ra-9514-rirr`: Quarantine and rebuild corrupted RA 9514 chunks. Previous chunks pointed to BP 344. Rebuilt chunks from BFP-published 2019 RIRR local source-layer PDF/markdown; remote BFP URLs were blocked by 403 but local PDF is non-empty, hashable, text-extractable, and publisher metadata identifies BFP.
- `source-pack-pd-1096-irr`: Rebuild weak table-artifact chunks from DPWH Official 2004 Revised IRR markdown/PDF. DPWH public URLs returned anti-bot HTML, so local DPWH Official PDF hash and text extraction are the source anchor.
- `source-pack-ra-9266-irr`: Rebuild chunks around Section 38 Temporary/Special Permits. Add ArchitectureBoard downloadable IRR PDF hash and Lawphil RA 9266 Act HTML as remote anchors; local PRBoA IRR PDF remains a local source-layer copy. The tested Supreme Court eLibrary URL was invalid for RA 9266 and is recorded only as an invalid remote attempt, not as evidence.
