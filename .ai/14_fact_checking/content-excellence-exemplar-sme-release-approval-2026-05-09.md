# Content Excellence Exemplar Packs - SME Release Approval and Source Reconciliation

Generated: 2026-05-09T08:11:10Z

## Purpose

This file is the human SME release-approval packet for the nine source-grounded SlateCamp exemplar packs in:

`.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/`

It records what a licensed-human SME must approve before any of these calibration exemplars are converted into learner-facing SlateCamp wiki articles or question edits. It also records the follow-up search performed inside `vitruvius-connection/001_Raw-Source-Layer/` to resolve or narrow the remaining source/provenance issues.

## Current release status

Status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`

Calibration status is strong:

- 9 exemplar packs exist.
- 27 MCQs exist.
- 32 ledgered claims exist.
- All source-required factual claims are `SUPPORTED` for calibration; non-source exam-strategy claims are explicitly classified as `EXAM_STRATEGY_NO_SOURCE_NEEDED`.
- No active claim remains `NEEDS_REVIEW` or `REMOVE_OR_REWRITE`.
- No supported claim still has unresolved `NOT_FOUND_BY_TEXT` or `OCR_DRIFT` extraction status.
- Claude, OpenCode, and CommandCode SME-style council review files exist and were synthesized.
- PyMuPDF extraction plus rendered-page visual evidence resolved the previous NPCP and Vitruvius OCR/text-extraction risks.

Direct publication remains held because calibration approval is not the same as learner-facing release approval.

## Required licensed-human SME approval before release

A licensed-human SME should approve the following items before any pack is converted into a public article/question set:

1. Source identity
   - Confirm the governing source version for each legal/code topic.
   - Confirm that the raw source file in `vitruvius-connection/001_Raw-Source-Layer/` is acceptable as the citation anchor.
   - Confirm whether a source-pack hash mismatch is harmless version drift or requires source-pack rebuild.

2. Claim accuracy
   - Review every claim in each `claim-ledger.json`.
   - Confirm dimensional values, law/IRR section numbers, table references, and scope statements.
   - Confirm that UAP service-fee statements are scoped to the exact UAP document/article where they appear.

3. Question accuracy
   - Review every item in each `exemplar-question-set.json`.
   - Confirm answer keys, rationales, distractors, and cited locators.
   - Confirm that distractors are plausible but not misleading.

4. Release boundary
   - Approve conversion from calibration pack to normal SlateCamp roundtrip article/question artifacts.
   - Do not paste exemplar markdown directly into Supabase.
   - Use the content roundtrip path: local article bundle, normalized/candidate composition, dry run, then approved push.

5. Publication decision
   - Decide whether each pack is approved for learner-facing use as written, approved with edits, or held.
   - Record SME name, license/credential basis if appropriate, approval date, and scope of approval.

## Source search method

Search root:

`vitruvius-connection/001_Raw-Source-Layer/`

Method:

- Located candidate PDFs by source family folder and filename search.
- Computed SHA256 hashes for every relevant candidate PDF.
- Opened PDFs with PyMuPDF to confirm page counts, metadata titles, and first-page text samples where extractable.
- Compared those findings against the exemplar source ledgers and existing source-pack manifests under `.ai/16_source_packs/packs/`.

## Per-pack release approval matrix

### 01 - BP 344 accessible ramp geometry

Current pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`

Primary exemplar source found in Vitruvius:

- Path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf`
- SHA256: `63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953`
- Page count: 78
- PDF title metadata: `2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 | National Council on Disability Affairs`
- First-page provenance signal: the extracted first page includes NCDA downloadable-file text and a link to `https://ncda.gov.ph/wp-content/uploads/2024/08/amended-IRR-BP-344-Official-Gazette.pdf`.

Other BP 344 PDF found:

- Path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/BP-344 IRR Accessibility Law DPWH.pdf`
- SHA256: `7fe6c2de016c0640002029b089c0468a6e0bcb5856be722c93acc97fadf19618`
- Page count: 62
- Relevance: older/non-2024 DPWH accessibility IRR source, not the governing 2024 exemplar source.

Source-pack issue:

- Existing source-pack official hash: `7c4a75a5190897f20844ec8981711c5453954504d609568a292dea9e6888fa76`
- Search result: this hash was not found inside `vitruvius-connection/`.

Release decision needed:

- SME can approve the local NCDA 2024 PDF as the release citation anchor, or require re-acquisition of the direct Official Gazette PDF matching the source-pack official hash.
- The old 62-page DPWH file should not replace the 2024 NCDA/Official Gazette source for this exemplar.

Resolution status: partial. The correct 2024 local source is identified and claim support is intact, but the source-pack official-download hash mismatch is not fully closed inside Vitruvius because the official-hash file is not present locally.

### 02 - RA 9266 foreign architect temporary permit

Current pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`

Primary exemplar source found in Vitruvius:

- Path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9266/RA-9266 IRR Architecture Act of 2004.pdf`
- SHA256: `d0ce03b572f40560647359abf8e3a38c14bbf9b1b1436389a6d9148eb6fd0574`
- Page count: 24
- PDF title metadata: `Microsoft Word - The IRR of RA 9266.doc`
- First-page signal: Republic of the Philippines, Professional Regulation Commission, Board of Architecture, Implementing Rules and Regulations of RA 9266.

Duplicate same-hash source found:

- Path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9266/IRR of RA 9266.pdf`
- SHA256: `d0ce03b572f40560647359abf8e3a38c14bbf9b1b1436389a6d9148eb6fd0574`
- Page count: 24

Source-pack issue:

- Existing source-pack has no `official_file_hashes` entry and records `authority_host_unverified`.

Release decision needed:

- SME should confirm the PRC/Board of Architecture IRR file is acceptable as the governing source for release.
- If a stricter provenance chain is required, obtain an official PRC or Board-hosted copy and record its hash.

Resolution status: partial. Vitruvius confirms two local duplicate copies with the same hash and PRC/Board source identity in extracted text, but no official external host hash exists in the local source pack.

### 03 - RA 9514 means of egress width, count, and illumination

Current pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`

Primary exemplar source found in Vitruvius:

- Path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9514/RA9514-RIRR-rev-2019.pdf`
- SHA256: `ace1e9fbbeb67d294171ed743d46eda2a4c199b9bb642862bab8524b80754266`
- Page count: 448
- Relevance: 2019 Revised IRR used by the exemplar source ledger.

Older or separate fire-code file found:

- Path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-9514/PD 9514 - Fire Code of the Philippines.pdf`
- SHA256: `dd64bf1dfa1bc6e448241caab79582dbb9683ba002b43696889d7410a35884f0`
- Page count: 475
- PDF title metadata: `Microsoft Word - RA9514 IRR as of June 26, 2009`
- Relevance: older 2009 IRR/source family, not the 2019 RIRR exemplar source.

Source-pack issue found:

- Existing `.ai/16_source_packs/packs/source-pack-ra-9514-rirr/manifest.json` lists local hash `63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953`, which is the BP 344 2024 PDF hash, not the RA 9514 2019 RIRR hash.

Release decision needed:

- Rebuild or correct `source-pack-ra-9514-rirr` before using the source pack for learner-facing publication.
- The exemplar itself should continue citing `RA9514-RIRR-rev-2019.pdf` with SHA256 `ace1e9f...`.

Resolution status: source issue identified. The Vitruvius search explains the source-pack integrity problem: the active exemplar source is present and correct locally, but the existing source-pack manifest is wrong and should be quarantined or rebuilt before publication.

### 04 - National Plumbing Code fixture units and venting

Current pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`

Primary exemplar source found in Vitruvius:

- Path: `vitruvius-connection/001_Raw-Source-Layer/005-Utilities/Revised National Plumbing Code of the Philippines.pdf`
- SHA256: `c4ec30ec3ffe3b39513a033ebc2cfa614bd201d25c5578e1847e7f359fed3f5d`
- Page count: 225

Duplicate same-hash source found:

- Path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-1378/188541488-Revised-National-Plumbing-Code-of-the-Philippines.pdf`
- SHA256: `c4ec30ec3ffe3b39513a033ebc2cfa614bd201d25c5578e1847e7f359fed3f5d`
- Page count: 225

Other nearby plumbing materials found:

- `National-Plumbing-Code-of-the-Philippines_annotated.pdf`, SHA256 `c583fcd5edf9f32e95c64c5c6cd26941336d1c767b7d79710b966cae73d9c324`, 57 pages, secondary/annotated support only.
- Multiple reviewer/textbook PDFs, secondary support only.

Release decision needed:

- SME should confirm that the 225-page Revised National Plumbing Code PDF is the governing edition/version to use for public release.
- If a PRC/NAMPAP official provenance chain is required, obtain and hash that official file before publication.

Resolution status: partial. The exact source PDF exists twice in Vitruvius with identical hash, which strengthens local provenance. Edition/governing-status approval remains a human SME gate.

### 05 - Vitruvius principles and departments

Current pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`

Primary exemplar source found in Vitruvius:

- Path: `vitruvius-connection/001_Raw-Source-Layer/002-History/Vitruvius - 10 Books of Architecture.pdf`
- SHA256: `e63f78260563ae36c5f1f85a07371df3d5740dfb13f5fc77453d88632238e020`
- Page count: 376
- Declared edition/translation in source ledger: Morris Hicky Morgan translation, Harvard University Press, 1914.

Release decision needed:

- SME should approve the translation boundary for theory claims.
- Any learner-facing article should name the translation when quoting or closely paraphrasing wording.

Resolution status: resolved for calibration and likely sufficient for release if the SME accepts the Morgan translation boundary.

### 06 - PD 1096 TGFA, AMBF, and location controls

Current pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`

Primary exemplar source found in Vitruvius:

- Path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).pdf`
- SHA256: `ca465dd26cb1c4a235fd63d01b19c7239a73920f3753b7807cc8e98a3ac33bc6`
- Page count: 368
- PDF title metadata: `Microsoft Word - NBCP Title Page.doc`
- First-page signal: The National Building Code of the Philippines, 2004 Revised IRR of PD 1096, Department of Public Works and Highways.

Related PD 1096 files found:

- `PD 1096 IRR - Full Implementing Rules and Regulations.pdf`, SHA256 `8e98d8afd4b5972ba5a82d33a65e59e800cd41661b764a0dfc4112d29697b341`, 432 pages, metadata `IRR - NATIONAL BUILDING CODE COMPLETE.pdf`, first-page signal: official text, 2005 revised edition.
- `Philippines_02_IRR_of_NBC_of_the_Philippines.pdf`, same SHA256 `8e98d8...`, 432 pages.
- `PD 1096 RIRR 2004 - Revised IRR (Architecture Board).pdf`, SHA256 `15176ec14a361d821d2106cea302b6d837578ba021f4045a7c7f169f31af5dd3`, 259 pages, annotated PRBoA source.
- `PD 1096 - National Building Code.pdf`, `PD 1096 - National Building Code Full Text (Malacanang Edition).pdf`, and compact duplicates, all primary law text rather than IRR development-control tables.

Source-pack issue:

- Existing `source-pack-pd-1096-irr` local hash is `8e98d8...`, while this exemplar uses the 368-page DPWH 2004 RIRR hash `ca465d...`.
- Existing source-pack official hash `a482d1103bf96a6cbf23148bd3796ec7923396633f281a31c6fbdb8da5a02f9a` was not found inside `vitruvius-connection/`.

Release decision needed:

- SME should approve whether this exemplar should cite the 368-page DPWH 2004 RIRR (`ca465d...`) or the 432-page official-text/2005 revised edition (`8e98d8...`).
- If the exemplar stays with the 368-page DPWH file, the source-pack should be rebuilt or given a separate source-pack ID so the pack hash matches the actual cited source.

Resolution status: narrowed. Vitruvius contains both local PD 1096 IRR versions. This is version/source-pack alignment, not an unresolved claim-support issue.

### 07 - BP 220 parks, playgrounds, and road pavement

Current pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`

Primary exemplar source found in Vitruvius:

- Path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-220/Revised_IRR_BP220_2008.pdf`
- SHA256: `7392741260c227647afe39de283f3efa979465692da8905e59be8857c8651614`
- Page count: 75

Release decision needed:

- SME should confirm the 2008 revised IRR is the governing edition for the tested BP 220 standards.

Resolution status: resolved for local source identity. No competing BP 220 PDF was found in the raw law folder.

### 08 - PD 957 license to sell registration gate

Current pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`

Primary exemplar source found in Vitruvius:

- Path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-957/PD 957 IRR - Subdivision and Condominium IRR.pdf`
- SHA256: `1f9ab17a816885cfdbafafc03e3e9b64470a737447129a32a459836d6773f9ea`
- Page count: 68

Duplicate same-hash sources found:

- `PD 957 - Subdivision _ Condominium Buyer_s Act.pdf`, SHA256 `1f9ab17a816885cfdbafafc03e3e9b64470a737447129a32a459836d6773f9ea`, 68 pages.
- `PD 957 - Subdivision and Condominium Buyers Protective Decree.pdf`, SHA256 `1f9ab17a816885cfdbafafc03e3e9b64470a737447129a32a459836d6773f9ea`, 68 pages.

Other PD 957 file found:

- `PD 957 - Subdivision Law Illustrated Slides (Pedro Santos Jr).pdf`, SHA256 `b6511b7fbd56f7b34afdbcfbb786dd2e6d7147d634f45890f3bec63812ed5aa9`, 34 pages, secondary/illustrated support only.

Release decision needed:

- SME should confirm that the 68-page IRR file is the governing source for the license-to-sell provisions used by the exemplar.

Resolution status: resolved for local source identity. Three local files point to the same 68-page source hash.

### 09 - UAP SPP 201 pre-design and service boundaries

Current pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`

Primary exemplar sources found in Vitruvius:

- Path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/SPP 201.pdf`
- SHA256: `d3b76a26515c2eb4d584096ce60843b75c357f18b0767b72508d765eb554ef93`
- Page count: 59

- Path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document 401-402.pdf`
- SHA256: `5775329aa0feb1ca49b54543d1bfad1f93e137a1755d5d51fe1e1658e3b2f43f`
- Page count: 10

Related UAP source found:

- `UAP Document Standards of Professional Practice.pdf`, SHA256 `af3b0fd1b232443881cbb79d3b2ed2a9a93ecb34677cdbd3b2acddbcdb7d2b3b`, 69 pages.
- `Standards of Professional Practice2.pdf`, SHA256 `5529c01f4b74c0c2292cabbddf99663a2385e3c9ab2de6d6c7801bbe92fcc39e`, 69 pages.
- `1979 UAP Documents.pdf`, SHA256 `54d42c8d39cb6c1e8622ef21a65e63cb09d90c302ca905efa95442614e5f0b5b`, 85 pages.

Release decision needed:

- SME should approve the two-source structure: SPP 201 for pre-design services, UAP Document 401-402 Article 7.08 for the 85 percent, 10 percent, and 5 percent suspended/abandoned-work compensation allocation.
- The 85/10/5 statement must remain scoped to Article 7.08 and must not be generalized to all UAP fee allocations.

Resolution status: resolved for local source identity and scope, pending human SME approval.

## Remaining source/provenance decisions for human release approval

The Vitruvius source search solved or narrowed the source questions, but it did not eliminate every release gate.

Open decisions:

1. BP 344
   - Decide whether the NCDA 2024 PDF with embedded Official Gazette download link is sufficient, or require direct Official Gazette PDF re-download and hash reconciliation.

2. RA 9266
   - Decide whether the local PRC/Board of Architecture IRR PDF is sufficient, or require a fresh official-host copy.

3. RA 9514
   - Rebuild or correct `source-pack-ra-9514-rirr` before relying on the source pack. The existing manifest currently carries a BP 344 hash, not the RA 9514 2019 RIRR hash.

4. NPCP
   - Decide whether the 225-page Revised National Plumbing Code PDF is the governing edition for release. Local duplicate identity is confirmed.

5. PD 1096
   - Decide which local IRR version is the release anchor for TGFA/AMBF: the 368-page DPWH 2004 RIRR (`ca465d...`) currently used by the exemplar, or the 432-page official-text/2005 revised edition (`8e98d8...`). Rebuild source-pack metadata if the 368-page file remains the selected anchor.

6. BP 220, PD 957, UAP, Vitruvius
   - Local source identity is sufficient for calibration. Human SME still needs to approve release conversion and question wording.

## Recommended SME review workflow

1. Give the SME this file plus the root exemplar index:
   - `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/exemplar-index.json`

2. For each pack, ask the SME to review:
   - `exemplar-article.md`
   - `exemplar-question-set.json`
   - `claim-ledger.json`
   - `source-ledger.md`
   - `reviewer-memo.md`

3. Ask the SME to record one of these release decisions per pack:
   - `APPROVED_FOR_ROUNDTRIP_CONVERSION`
   - `APPROVED_WITH_MINOR_EDITS`
   - `HOLD_PENDING_SOURCE_REACQUISITION`
   - `HOLD_PENDING_FACTUAL_REVISION`

4. After SME approval, convert through the normal content-audit roundtrip workflow. Do not paste exemplar markdown or JSON directly into Supabase.

## Bottom line

The exemplar pack set is ready for licensed-human SME review. The remaining work is release governance, not calibration content repair.

Best current release stance:

`GO_FOR_LICENSED_HUMAN_SME_REVIEW`
`HOLD_FOR_LEARNER_FACING_PUBLICATION_UNTIL_SOURCE_DECISIONS_AND_ROUNDTRIP_CONVERSION_PASS`
