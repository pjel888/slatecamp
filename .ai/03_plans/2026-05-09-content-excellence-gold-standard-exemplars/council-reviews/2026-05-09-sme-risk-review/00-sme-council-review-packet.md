# SlateCamp SME Council Packet — Remaining Exemplar Risks (2026-05-09)

Read and apply `.ai/CONTENT_EXCELLENCE_GOAL.md` and `.ai/00_system/slatecamp-learning-material-depth-protocol.md` before producing any content artifact.

You are acting as the SlateCamp SME council for Philippine LEA/ALE learning materials. Treat the review standard as if a candidate may rely on this for board-exam preparation.

## Source hierarchy

1. Primary truth: `vitruvius-connection/001_Raw-Source-Layer/` raw PDFs/originals.
2. Search/OCR support only: `vitruvius-connection/002_Raw-Conversion-Layer/`.
3. Discovery/context only: `vitruvius-connection/003_Canonical-Knowledge-Layer/`.
4. Never approve a legal/code value from 002/003 alone.

## What you must review as SME

Review the exemplar packs under:

`.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars`

Focus on these unresolved classes:

1. OCR/text-extraction blockers: `npcp-c1`, `npcp-c2`, `vitruvius-c1` were previously `NOT_FOUND_BY_TEXT` / `NEEDS_REVIEW`. A deterministic PyMuPDF + rendered page evidence pass has now found the text in raw PDFs. Decide whether these can be promoted to `FOUND_VERBATIM` / `SUPPORTED` for calibration.
2. Source/provenance risks:
   - `02-ra9266...`: `authority_host_unverified` in source pack, but local raw PDF hash matches the approved source pack hash; content conflict flag is false.
   - `06-pd1096...`: claim ledger currently names `source-pack-pd-1096-rirr`, but actual source pack is `source-pack-pd-1096-irr`; source pack itself records local-vs-official hash mismatch, while the exemplar uses the full raw DPWH Official 2004 RIRR PDF with its own SHA256 and page locators.
   - `09-uap...`: two-source UAP pack; current conflict says no conflict detected by script.
3. All claim ledgers have `sme_review.status = pending`. Philip has requested this LLM council to act as SME for these calibration artifacts. Decide final calibration status and direct-publication hold status.

## Required SME output

Return a concise review memo with:

- Verdict per risky pack: `PASS_FOR_CALIBRATION`, `PASS_WITH_FIXES`, or `BLOCK`.
- Exact fixes required before calibration acceptance.
- OCR/text extraction approval or rejection for the three claims.
- Any legal/code citation corrections.
- Whether direct publication should remain `HOLD_FOR_DIRECT_PUBLICATION`.
- Any council disagreement-worthy concern.

Do **not** edit files. This review is read-only; Hermes will synthesize and apply accepted fixes.

# Current pack inventory

## 01-bp344-accessible-ramp-geometry
- Claim ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/01-bp344-accessible-ramp-geometry/claim-ledger.json`
- Article: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/01-bp344-accessible-ramp-geometry/exemplar-article.md`
- Question set: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/01-bp344-accessible-ramp-geometry/exemplar-question-set.json`
- Source ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/01-bp344-accessible-ramp-geometry/source-ledger.md`
- Reviewer memo: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/01-bp344-accessible-ramp-geometry/reviewer-memo.md`
- Pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`
- Source status: `LOCAL_RAW_NEEDS_RECONCILIATION`
- SME review: `pending`
- Claims:
  - `bp344-ramp-c1` [LEGAL_DIMENSION] `SUPPORTED` / `FOUND_VERBATIM` / conflict `local_webpage_pdf_vs_official_download_pdf_hash_mismatch` — Accessible ramps have minimum clear width 1200 mm and general gradient not steeper than 1:20. Locator: Appendix A / Accessible Ramps / Items 1-2 / PDF p.2
  - `bp344-ramp-c2` [LEGAL_DIMENSION] `SUPPORTED` / `FOUND_VERBATIM` / conflict `local_webpage_pdf_vs_official_download_pdf_hash_mismatch` — A 1:15 accessible ramp row permits 10.50 m maximum length, 700 mm maximum rise, and 10 m landing interval. Locator: Appendix A / Accessible Ramps / Table A.1.1 / PDF p.2
  - `bp344-ramp-c3` [LEGAL_DIMENSION] `SUPPORTED` / `FOUND_VERBATIM` / conflict `local_webpage_pdf_vs_official_download_pdf_hash_mismatch` — Accessible ramps longer than 10.50 m require intermediate landings at least 1800 mm long. Locator: Appendix A / Accessible Ramps / Item 10 / PDF p.2
  - `bp344-ramp-c4` [LEGAL_DIMENSION] `SUPPORTED` / `FOUND_VERBATIM` / conflict `local_webpage_pdf_vs_official_download_pdf_hash_mismatch` — Handrails are required for accessible ramps with changes in grade higher than 170 mm and installed at 900 mm and 700 mm. Locator: Appendix A / Handrails and Grab Bars / PDF p.7
  - `bp344-ramp-c5` [EXAM_STRATEGY] `EXAM_STRATEGY_NO_SOURCE_NEEDED` / `NOT_SOURCE_REQUIRED` / conflict `local_webpage_pdf_vs_official_download_pdf_hash_mismatch` — For exam strategy, check width, slope, landing trigger, then handrails. Locator: n/a
## 02-ra9266-foreign-architect-temporary-permit
- Claim ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/02-ra9266-foreign-architect-temporary-permit/claim-ledger.json`
- Article: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/02-ra9266-foreign-architect-temporary-permit/exemplar-article.md`
- Question set: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/02-ra9266-foreign-architect-temporary-permit/exemplar-question-set.json`
- Source ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/02-ra9266-foreign-architect-temporary-permit/source-ledger.md`
- Reviewer memo: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/02-ra9266-foreign-architect-temporary-permit/reviewer-memo.md`
- Pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`
- Source status: `LOCAL_RAW_NEEDS_RECONCILIATION`
- SME review: `pending`
- Claims:
  - `ra9266-foreign-c1` [LEGAL_PROCESS] `SUPPORTED` / `FOUND_VERBATIM` / conflict `authority_host_unverified` — A foreign architect must secure the required temporary/special permit before practicing architecture in the Philippines. Locator: RA 9266 IRR / Section 38 / PDF locator in source-ledger.md
  - `ra9266-foreign-c2` [EXAM_STRATEGY] `EXAM_STRATEGY_NO_SOURCE_NEEDED` / `NOT_SOURCE_REQUIRED` / conflict `authority_host_unverified` — The exam trap is separating foreign-architect authorization from ordinary employment or consultancy permission. Locator: n/a
## 03-ra9514-means-of-egress-width-and-count
- Claim ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/03-ra9514-means-of-egress-width-and-count/claim-ledger.json`
- Article: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/03-ra9514-means-of-egress-width-and-count/exemplar-article.md`
- Question set: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/03-ra9514-means-of-egress-width-and-count/exemplar-question-set.json`
- Source ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/03-ra9514-means-of-egress-width-and-count/source-ledger.md`
- Reviewer memo: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/03-ra9514-means-of-egress-width-and-count/reviewer-memo.md`
- Pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`
- Source status: `OFFICIAL_BLOCKED_LOCAL_RAW_USED`
- SME review: `pending`
- Claims:
  - `ra9514-egress-c1` [LEGAL_SCOPE] `SUPPORTED` / `FOUND_VERBATIM` / conflict `official_source_blocked; prior source-pack integrity issue requires quarantine/rebuild before publication` — Buildings designed for human occupancy require exits sufficient for prompt and safe escape. Locator: Rule 10 / Division 2 / General Requirements / PDF p.89
  - `ra9514-egress-c2` [LEGAL_DIMENSION] `SUPPORTED` / `FOUND_VERBATIM` / conflict `official_source_blocked; prior source-pack integrity issue requires quarantine/rebuild before publication` — General means-of-egress width must not be less than 915 mm unless occupancy divisions allow otherwise. Locator: Rule 10 / Division 2 / Section 10.2.5.2(F) / PDF p.95
  - `ra9514-egress-c3` [LEGAL_DIMENSION] `SUPPORTED` / `FOUND_VERBATIM` / conflict `official_source_blocked; prior source-pack integrity issue requires quarantine/rebuild before publication` — Number of means of egress must not be less than two, with thresholds of three for occupant load over 500 to 1000 and four over 1000. Locator: Rule 10 / Division 2 / Section 10.2.5.2(G) / PDF p.95
  - `ra9514-egress-c4` [TECHNICAL_STANDARD] `SUPPORTED` / `FOUND_VERBATIM` / conflict `official_source_blocked; prior source-pack integrity issue requires quarantine/rebuild before publication` — Means of egress illumination must be continuous and not less than 10.7 lux at required points. Locator: Rule 10 / Division 2 / Section 10.2.5.11 / PDF p.113
## 04-npcp-fixture-unit-and-venting
- Claim ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/04-npcp-fixture-unit-and-venting/claim-ledger.json`
- Article: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/04-npcp-fixture-unit-and-venting/exemplar-article.md`
- Question set: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/04-npcp-fixture-unit-and-venting/exemplar-question-set.json`
- Source ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/04-npcp-fixture-unit-and-venting/source-ledger.md`
- Reviewer memo: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/04-npcp-fixture-unit-and-venting/reviewer-memo.md`
- Pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`
- Source status: `LOCAL_RAW_ONLY_NEEDS_EDITION_CHECK`
- SME review: `pending`
- Claims:
  - `npcp-c1` [TECHNICAL_STANDARD] `NEEDS_REVIEW` / `NOT_FOUND_BY_TEXT` / conflict `edition/provenance not yet reconciled` — One fixture unit is equivalent to 28.3 liters per minute or 1 cubic foot per minute. Locator: Definitions / Fixture Unit / PDF p.24
  - `npcp-c2` [LEGAL_PROCESS] `NEEDS_REVIEW` / `NOT_FOUND_BY_TEXT` / conflict `edition/provenance not yet reconciled` — Section 311.4 prohibits using a vent pipe as a soil or waste pipe, or a soil/waste pipe as a vent, except as provided. Locator: Section 311.4 / PDF p.44
  - `npcp-c3` [TECHNICAL_STANDARD] `SUPPORTED` / `FOUND_VERBATIM` / conflict `edition/provenance not yet reconciled` — A loop or circuit vent connects downstream of the last fixture connection on a horizontal soil or waste branch. Locator: Definitions / Loop or Circuit Vent / PDF p.29
## 05-vitruvius-principles-and-departments
- Claim ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/05-vitruvius-principles-and-departments/claim-ledger.json`
- Article: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/05-vitruvius-principles-and-departments/exemplar-article.md`
- Question set: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/05-vitruvius-principles-and-departments/exemplar-question-set.json`
- Source ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/05-vitruvius-principles-and-departments/source-ledger.md`
- Reviewer memo: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/05-vitruvius-principles-and-departments/reviewer-memo.md`
- Pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`
- Source status: `LOCAL_RAW_ONLY_THEORY_TEXT`
- SME review: `pending`
- Claims:
  - `vitruvius-c1` [THEORY_CONCEPT] `NEEDS_REVIEW` / `NOT_FOUND_BY_TEXT` / conflict `translation/edition must be declared when used for theory claims` — Architecture depends on Order, Arrangement, Eurythmy, Symmetry, Propriety, and Economy. Locator: Book I / Chapter II / page locator in source-ledger.md
  - `vitruvius-c2` [THEORY_CONCEPT] `SUPPORTED` / `FOUND_VERBATIM` / conflict `translation/edition must be declared when used for theory claims` — Architecture consists of three departments: building, dialling, and mechanics. Locator: Book I / Chapter III / source-ledger page locator
  - `vitruvius-c3` [EXAM_STRATEGY] `EXAM_STRATEGY_NO_SOURCE_NEEDED` / `NOT_SOURCE_REQUIRED` / conflict `translation/edition must be declared when used for theory claims` — For exam category distinction, do not mix principles with departments. Locator: n/a
## 06-pd1096-tgfa-ambf-location-controls
- Claim ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/06-pd1096-tgfa-ambf-location-controls/claim-ledger.json`
- Article: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/06-pd1096-tgfa-ambf-location-controls/exemplar-article.md`
- Question set: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/06-pd1096-tgfa-ambf-location-controls/exemplar-question-set.json`
- Source ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/06-pd1096-tgfa-ambf-location-controls/source-ledger.md`
- Reviewer memo: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/06-pd1096-tgfa-ambf-location-controls/reviewer-memo.md`
- Pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`
- Source status: `LOCAL_RAW_NEEDS_RECONCILIATION`
- SME review: `pending`
- Claims:
  - `pd1096-c1` [LEGAL_SCOPE] `SUPPORTED` / `FOUND_VERBATIM` / conflict `source_pack_conflict_status_unknown_for_this_new_pack` — No building shall be constructed unless it adjoins or has direct access to a public space, yard, or street on at least one side. Locator: Rule VII / Section 704 / PDF p.81
  - `pd1096-c2` [LEGAL_DIMENSION] `SUPPORTED` / `FOUND_VERBATIM` / conflict `source_pack_conflict_status_unknown_for_this_new_pack` — Eaves over required windows shall not be less than 750 mm from side and rear property lines. Locator: Rule VII / Section 704 / PDF p.81
  - `pd1096-c3` [LEGAL_PROCESS] `SUPPORTED` / `FOUND_VERBATIM` / conflict `source_pack_conflict_status_unknown_for_this_new_pack` — Allowable Maximum Total Gross Floor Area shall only be as allowed under Rule VII. Locator: Rule VII / Section 705 / PDF p.83
  - `pd1096-c4` [EXAM_STRATEGY] `SUPPORTED` / `FOUND_PARAPHRASED` / conflict `source_pack_conflict_status_unknown_for_this_new_pack` — AMBF is a footprint/firewall control separate from TGFA. Locator: Rule VII / Section 704.4 / PDF p.81
## 07-bp220-parks-playgrounds-road-pavement
- Claim ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/07-bp220-parks-playgrounds-road-pavement/claim-ledger.json`
- Article: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/07-bp220-parks-playgrounds-road-pavement/exemplar-article.md`
- Question set: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/07-bp220-parks-playgrounds-road-pavement/exemplar-question-set.json`
- Source ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/07-bp220-parks-playgrounds-road-pavement/source-ledger.md`
- Reviewer memo: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/07-bp220-parks-playgrounds-road-pavement/reviewer-memo.md`
- Pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`
- Source status: `LOCAL_RAW_ONLY`
- SME review: `pending`
- Claims:
  - `bp220-c1` [LEGAL_SCOPE] `SUPPORTED` / `FOUND_VERBATIM` / conflict `none_detected_by_script` — Basic needs are listed in descending order: water, movement/circulation, storm drainage, solid/liquid waste disposal, park/playground, power. Locator: Rule II / Basic Needs / PDF p.9
  - `bp220-c2` [LEGAL_DIMENSION] `SUPPORTED` / `FOUND_VERBATIM` / conflict `none_detected_by_script` — At 150 lots/dwelling units per hectare and below, parks/playgrounds allocation is 3.5% of gross area. Locator: Rule II / Table 1 / PDF p.12
  - `bp220-c3` [LEGAL_DIMENSION] `SUPPORTED` / `FOUND_VERBATIM` / conflict `none_detected_by_script` — Parks/playgrounds area shall not be less than 100 square meters. Locator: Rule II / Table 1 note / PDF p.12
  - `bp220-c4` [TECHNICAL_STANDARD] `SUPPORTED` / `FOUND_VERBATIM` / conflict `none_detected_by_script` — Road pavement may use asphalt minimum 50 mm or concrete minimum 150 mm with 20.7 MPa at 28 days. Locator: Rule II / Section 5.b.3.4 / PDF p.17
## 08-pd957-license-to-sell-registration-gate
- Claim ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/08-pd957-license-to-sell-registration-gate/claim-ledger.json`
- Article: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/08-pd957-license-to-sell-registration-gate/exemplar-article.md`
- Question set: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/08-pd957-license-to-sell-registration-gate/exemplar-question-set.json`
- Source ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/08-pd957-license-to-sell-registration-gate/source-ledger.md`
- Reviewer memo: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/08-pd957-license-to-sell-registration-gate/reviewer-memo.md`
- Pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`
- Source status: `LOCAL_RAW_ONLY`
- SME review: `pending`
- Claims:
  - `pd957-c1` [LEGAL_PROCESS] `SUPPORTED` / `FOUND_VERBATIM` / conflict `none_detected_by_script` — No owner or dealer shall sell any disposable subdivision lot or condominium unit in the registered project without a license to sell issued by the Board. Locator: Rule IV / Section 11 / PDF p.47
  - `pd957-c2` [LEGAL_PROCESS] `SUPPORTED` / `FOUND_VERBATIM` / conflict `none_detected_by_script` — The license to sell is issued within two weeks from registration of each project after proper application and requirements. Locator: Rule IV / Section 11 / PDF p.47
  - `pd957-c3` [LEGAL_PROCESS] `SUPPORTED` / `FOUND_VERBATIM` / conflict `none_detected_by_script` — Application evidence includes public-offering materials such as circulars, prospectuses, brochures, advertisements, or communications. Locator: Rule IV / application documentary requirement excerpt / PDF p.43
## 09-uap-spp201-pre-design-and-service-boundaries
- Claim ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/09-uap-spp201-pre-design-and-service-boundaries/claim-ledger.json`
- Article: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/09-uap-spp201-pre-design-and-service-boundaries/exemplar-article.md`
- Question set: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/09-uap-spp201-pre-design-and-service-boundaries/exemplar-question-set.json`
- Source ledger: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/09-uap-spp201-pre-design-and-service-boundaries/source-ledger.md`
- Reviewer memo: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/09-uap-spp201-pre-design-and-service-boundaries/reviewer-memo.md`
- Pack status: `PASS_FOR_CALIBRATION_HOLD_FOR_DIRECT_PUBLICATION`
- Source status: `LOCAL_RAW_ONLY`
- SME review: `pending`
- Claims:
  - `uap-c1` [LEGAL_SCOPE] `SUPPORTED` / `FOUND_VERBATIM` / conflict `two-source-pack; no conflict detected by script` — SPP 201 covers Pre-design Services including consultation, pre-feasibility studies, architectural programming, and space planning. Locator: SPP 201 / pp.36, 42, 43, 48, 49
  - `uap-c2` [LEGAL_SCOPE] `SUPPORTED` / `FOUND_VERBATIM` / conflict `two-source-pack; no conflict detected by script` — Consultation involves oral/written advice, direction, conferences, evaluations, and appraisals whether or not the client pursues the project. Locator: SPP 201 / Consultation / PDF p.42
  - `uap-c3` [LEGAL_SCOPE] `SUPPORTED` / `FOUND_VERBATIM` / conflict `two-source-pack; no conflict detected by script` — Document 401-402 does not cover Fulltime Construction Supervision, Project/Construction Management, Pre-Design Services, allied services, Design-Build, or construction agreement work. Locator: UAP Document 401-402 / Article 5-6 excerpt / PDF p.1
  - `uap-c4` [LEGAL_SCOPE] `SUPPORTED` / `FOUND_VERBATIM` / conflict `two-source-pack; no conflict detected by script` — Contract Documents Phase equals 85% of the work, with remaining 15% split between Article 1723 liability and construction-phase service. Locator: UAP Document 401-402 / PDF p.8

# Deterministic OCR/Text extraction resolution evidence

## OCR/Text fix proposal: npcp-c1
- Pack: `04-npcp-fixture-unit-and-venting`
- Claim: One fixture unit is equivalent to 28.3 liters per minute or 1 cubic foot per minute.
- Raw PDF: `vitruvius-connection/001_Raw-Source-Layer/005-Utilities/Revised National Plumbing Code of the Philippines.pdf`
- SHA256: `c4ec30ec3ffe3b39513a033ebc2cfa614bd201d25c5578e1847e7f359fed3f5d`
- Locator: Definitions — Fixture Unit, PDF p.24
- Proposed status: `FOUND_VERBATIM` and `SUPPORTED` after rendered-page visual check

### PDF p.24
- Rendered image: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/ocr-visual-evidence.generated/npcp-c1-pdf-page-24.png`
```text
fh.ture branch.
fi'IXTli RE liN IT - is an arbitrary quantity in terms of which the load-
producing efTects or water requirements on the plumbing system of different
kinds of plumbing fixtures are cxpres~cd in some arbitrarily chosen scale.
One fixture unit is equivalent to a rate of flow at 28.3 liters per minute ( l cu.
ft./minute).
FLOOD LEVF..L - the level in a fixture at which water begins to overflow
ovc:r the top or rim of the fixture.
FLOOD LEVEL RIM -is the top edge of a receptacle from where water
overflows.
FLOODEU - a fixture is flooded when the liquid therein rises to the flood
level rim.
FLOOR AREA - the area included within surrounding walls of a building
```

## OCR/Text fix proposal: npcp-c2
- Pack: `04-npcp-fixture-unit-and-venting`
- Claim: Section 311.4 prohibits using a vent pipe as a soil or waste pipe, or a soil/waste pipe as a vent, except as provided.
- Raw PDF: `vitruvius-connection/001_Raw-Source-Layer/005-Utilities/Revised National Plumbing Code of the Philippines.pdf`
- SHA256: `c4ec30ec3ffe3b39513a033ebc2cfa614bd201d25c5578e1847e7f359fed3f5d`
- Locator: Section 311.4, PDF p.44
- Proposed status: `FOUND_VERBATIM` and `SUPPORTED` after rendered-page visual check

### PDF p.44
- Rendered image: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/ocr-visual-evidence.generated/npcp-c2-pdf-page-44.png`
```text
Revised National Plumbing Code of the Philippines
311.2
No drainage or vent p1pmg shall be drilled and tapped for making
connections thereto, and no cast iron soil pipe shall be threaded.
311.3
No waste connection shall be made to a closet bend or stub of a water closet
or similar fixtures.
311 .4
Except as hereinafter provided in Sections 812, 813 and 814 of this Code, no
vent pipe shall be used as a soil or waste pipe, nor shall any soil or waste
pipe be used as a vent. Also, single drainage and venting systems with
unvented branch lines are prohibited.
311.5
No fitting, fixture and piping connections, appliance, device or method of
instailation which obstmcts or retards the flow of water, sewage or air in the
excreta and storm drainage and venting systems in an amount greater than
the normal frictional resistance to flow, shall be used unless it is indicated as
acceptable in this Code or approved by the Administrative Authority as
having the desirable nnd acceptable function and of ultimate benefit to the
proper and continuous functioning of the plumbing system.
The
enlargement of a 76-mm closet bend or stub to 1 02-mm diameter shall not
be considered as an obstruction.
311.6
Except for necessary use of gate & check valves. where inter-membering or
mixing of dissimilar metals occurs, the points of connection shall be
con tined to exposed or accessible locations.
311.7
All valves. pipes and fittings shall be installed in correct relationship to the
direction of flow.
Section 312-INDEPENDENT SYSTEM
The drainage system of each new building and of new work installed in any
existing building shall be separate and independent from that of any other
building and whe-n available, every building shall have an independent connection
with a private or public sewer.
```

## OCR/Text fix proposal: vitruvius-c1
- Pack: `05-vitruvius-principles-and-departments`
- Claim: Architecture depends on Order, Arrangement, Eurythmy, Symmetry, Propriety, and Economy.
- Raw PDF: `vitruvius-connection/001_Raw-Source-Layer/002-History/Vitruvius - 10 Books of Architecture.pdf`
- SHA256: `e63f78260563ae36c5f1f85a07371df3d5740dfb13f5fc77453d88632238e020`
- Locator: Book I, Chapter II, PDF pp.33-36; principle list begins p.33 and definitions continue through p.36
- Proposed status: `FOUND_VERBATIM` and `SUPPORTED` after rendered-page visual check

### PDF p.33
- Rendered image: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/ocr-visual-evidence.generated/vitruvius-c1-pdf-page-33.png`
```text
undoubtedly show myself of very considerable importance not
only to builders but also to all scholars.
CHAPTER
II
THE FUNDAMENTAL PRINCIPLES OF ARCHITECTURE
1. ARCHITECTURE
depends
on Order
(in Greek Ta'), Ar-
rangement (in Greek 8ta0e<n?), Eurythmy, Symmetry, Propriety,
and Economy (in Greek oiKovopta)*
2. Order gives due measure to the members of a work con-
sidered separately, and symmetrical agreement to the proportions
of the whole.
It
is an adjustment according to quantity
(in
Greek TTOO-OTT;?). By this I mean the selection of modules from
the members of the work itself and, starting from these individual
parts of members, constructing the whole work to correspond.
Arrangement
includes
the putting
of
things
in
their proper
places and the elegance of effect which
```

### PDF p.34
- Rendered image: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/ocr-visual-evidence.generated/vitruvius-c1-pdf-page-34.png`
```text
Invention, on the other hand, is the solving of intricate problems
and the discovery of new principles by means of brilliancy and
versatility. These are the departments belonging under Arrange-
ment.
3. Eurythmy is beauty and fitness in the adjustments of the
members.
This is found when the members of a work are of a
height suited to their breadth, of a breadth suited to their length,
and, in a word, when they all correspond symmetrically.
4. Symmetry is a proper agreement between the members of
the work itself, and relation between the different parts and the
whole general scheme, in accordance with a certain part selected
as standard.
Thus in the human body there is a kind of sym-
metrical harmony between forearm, foot, palm, finger, and other
small parts; and so it is with perfect buildings.
In the case of
temples, symmetry may be calculated from the thickness of a
column, from a triglyph, or even from a module; in the ballista,
from the hole or from what the Greeks call the Tre/sfr/oT??; in a
ship, from the space between the
tholepins
(BiaTrrjyfia) ; and in
other things, from various members.
5. Propriety
is that perfection of style which comes when a
work is authoritatively constructed on approved principles.
It
arises
from
prescription
(Greek
```

### PDF p.35
- Rendered image: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/ocr-visual-evidence.generated/vitruvius-c1-pdf-page-35.png`
```text
cules, will be Doric, since the virile strength of these gods makes
daintiness entirely inappropriate to their houses.
In temples to
Venus, Flora, Proserpine, Spring-Water, and the Nymphs, the
Corinthian order will be found to have peculiar significance, be-
cause these are delicate divinities and so its rather slender out-
lines, its flowers, leaves, and ornamental volutes will lend propriety
where it is due. The construction of temples of the Ionic order to
Juno, Diana, Father Bacchus, and the other gods of that kind,
will be in keeping with the middle position which they hold ; for
the building of such will be an appropriate combination of the
severity of the Doric and the delicacy of the Corinthian.
6. Propriety arises from usage when buildings having magnif-
icent interiors are provided with elegant entrance-courts to cor-
respond; for there will be no propriety in the spectacle of an ele-
gant interior approached by a low, mean entrance.
Or, if dentils
be carved in the cornice of the Doric entablature or triglyphs rep-
resented in the Ionic entablature over the cushion-shaped capi-
tals of the columns, the
effect will be spoilt by the transfer of
the peculiarities of the one order of building to the other, the
usage in each class having been fixed long ago.
7.
Finally, propriety will be due to natural causes
if, for ex-
ample, in the case of all sacred precincts we select very healthy
neighbourhoods with suitable springs of water in the places where
the fanes are to be built, particularly in the case of those to Aes-
culapius and to Health, gods by whose healing powers great num-
bers of the sick are apparently cured.
For when their diseased
treated with waters from health-giving springs, they
will the
more speedily grow well. The result will be that the divinity will
stand in higher esteem and find his dignity increased, all owing
to the nature of his site. There will also be natural propriety in
using an eastern light for bedrooms and libraries, a western light
in winter for baths and winter apartments, and a northern light
for picture galleries and other places in which a steady light
is
```

### PDF p.36
- Rendered image: `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/ocr-visual-evidence.generated/vitruvius-c1-pdf-page-36.png`
```text
[BOOK I
needed; for that quarter of the sky grows neither light nor dark
with the course of the sun, but remains steady and unshifting all
day long.
8. Economy denotes the proper management of materials and
of site, as well as a thrifty balancing of cost and common sense in
the construction of works.
This will be observed
if, in the first
place, the architect does not demand things which cannot be
found or made ready without great expense. For example: it is
not everywhere that there is plenty of pitsand, rubble, fir, clear
is no pitsand,
we must use the kinds washed up by rivers or by the sea; the lack
of fir and clear fir may be evaded by using cypress, poplar, elm,
or pine; and other problems we must solve in similar ways.
9. A second stage in Economy is reached when we have to plan
the different kinds of dwellings suitable for ordinary household-
ers, for great wealth, or for the high position of the statesman. A
house in town obviously calls for one form of construction; that
into which stream the products of country estates requires an-
other; this will not be the same in the case of money-lenders and
still different for the opulent and luxurious; for the powers under
whose deliberations the commonwealth is guided dwellings are to
be provided according to then
1 special needs: and, in a word, the
proper form of economy must be observed in building houses for
each and every class.
CHAPTER
III
THE DEPARTMENTS OP ARCHITECTURE
1. THERE are three departments of architecture: the art of
building, the making of time-pieces, and the construction of ma-
chinery.
Building is, in its turn, divided into two parts, of which
the first is the construction of
fortified towns and of works for
general use in public places, and the second is the putting up of
structures for private individuals. There are three classes of pub-
```


# Additional visual spot-check notes already performed

- NPCP fixture unit page visibly contains: “207.8 FIXTURE UNIT … One fixture unit is equivalent to a rate of flow at 28.3 liters per minute (1 cu. ft./minute).”
- NPCP Section 311.4 page visibly contains: “Except as hereinafter provided in Sections 812, 813 and 814 of this Code, no vent pipe shall be used as a soil or waste pipe, nor shall any soil or waste pipe be used as a vent. Also, single drainage and venting systems with unvented branch lines are prohibited.”
- Vitruvius Book I Chapter II page visibly contains: “ARCHITECTURE depends on Order … Arrangement … Eurythmy, Symmetry, Propriety, and Economy.”
- Vitruvius later page visibly defines Economy and begins Chapter III with: “There are three departments of architecture: the art of building, the making of time-pieces, and the construction of machinery.”
