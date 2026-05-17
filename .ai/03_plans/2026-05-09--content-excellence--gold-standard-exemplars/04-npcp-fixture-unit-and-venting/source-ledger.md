# Source Ledger - National Plumbing Code Fixture Units and Venting

## Source document

- Document ID: `NPCP_REVISED`
- Relative path: `vitruvius-connection/001_Raw-Source-Layer/005-Utilities/Revised National Plumbing Code of the Philippines.pdf`
- SHA256: `c4ec30ec3ffe3b39513a033ebc2cfa614bd201d25c5578e1847e7f359fed3f5d`
- PDF page count: 225
- Locator set: `npcp_fixture_unit_venting`
- PDF pages used: 24, 29, 44

## Verification status

- Local PDF present: yes
- Text extraction method: PyMuPDF via `uvx --from pymupdf`
- Source tier: primary/local source layer
- SME release status: LLM council SME review complete for calibration on 2026-05-09; direct publication remains held pending licensed-human SME clearance and source/provenance reconciliation.

## Extracted evidence snippets

- Query: `207.8 FIXTURE UNIT`
  - PDF page: 24
  - Resolution: OCR/text extraction gap resolved by PyMuPDF line-window extraction plus rendered-page visual check.
  - Evidence excerpt: 207.8 FIXTURE UNIT - is an arbitrary quantity in terms of which the load-producing effects or water requirements on the plumbing system of different kinds of plumbing fixtures are expressed in some arbitrarily chosen scale. One fixture unit is equivalent to a rate of flow at 28.3 liters per minute (1 cu. ft./minute).
  - Rendered-page evidence: `../ocr-visual-evidence.generated/npcp-c1-pdf-page-24.png`
- Query: `One fixture unit is equivalent`
  - PDF page: 24
  - Evidence excerpt: 107.ll ... :07.12 207.13 - - :.07.14 207. 15 ~07 . 16 .... .. 108.1 Revised National Plumbing Co<le o1 the Philippines ft'IXTlJRl: StJJ•J'LY - a water supply pipe connecting the fixture with the fh.ture branch. fi'IXTli RE liN IT - is an arbitrary quantity in terms of which the load- producing efTects or water requirements on the plumbing system of different kinds of plumbing fixtures are cxpres~cd in some arbitrarily chosen scale. One fixture unit is equivalent to a rate of flow at 28.3 liters per minute ( l cu. ft./minute). FLOOD LEVF..L - the level in a fixture at which water begins to overflow ovc:r the top or rim of the fixture. FLOOD LEVEL RIM -is the top edge of a receptacle from where water overflows. FLOODEU - a fixture is flooded when the liquid therein rises to the flood level rim. FLOOR AREA - the area included within surround
- Query: `LOOP OR CIRCUIT VENT`
  - PDF page: 29
  - Evidence excerpt: *213.11 .. 213.12 213.13 213.14 ••• 214.1 214.2 •• •• 214.3 ••• •• 214.4 ••• ... 214.5 Definitions WCAL VENT - a pipe or shaft to convey foul air from a plumbing fixture or a room to the outer air. LOOP OR CIRCUIT VENT - a vertical vent connection on a horizontal soil or waste pipe branch at a point downstream of the last fixture cormection and turning to a horizontal line above the highest overflow level of the highest fixture connected thereat; the tenninus connected to the stack vent in the case of loop venting or to the vent stack nearby in the case of circuit venting. LOT - a single area of land legally recorded or validated by other means acceptable to the Administrative Authority where a building is situated or site of any work regulated by this Code, together with the yard, court, and unoccupied space legally required for the buil
- Query: `311.4 no vent pipe shall be used as a soil or waste pipe`
  - PDF page: 44
  - Resolution: OCR/text extraction gap resolved by PyMuPDF line-window extraction plus rendered-page visual check.
  - Evidence excerpt: 311.4 Except as hereinafter provided in Sections 812, 813 and 814 of this Code, no vent pipe shall be used as a soil or waste pipe, nor shall any soil or waste pipe be used as a vent. Also, single drainage and venting systems with unvented branch lines are prohibited.
  - Rendered-page evidence: `../ocr-visual-evidence.generated/npcp-c2-pdf-page-44.png`

## Claim-control notes

- Claims in `exemplar-article.md` are limited to the listed PDF locators.
- If this exemplar is converted into a live article, use the roundtrip protocol and create a normal article bundle. Do not paste this pack directly into Supabase.


## Structured claim ledger

- Machine-checkable file: `claim-ledger.json`
- Council-applied requirement: every factual claim must carry `claim_class`, `locator`, `extraction_status`, `conflict_class`, linked question IDs, and SME status.

## OCR/text extraction resolution

- Resolution file: `../ocr-visual-evidence.generated/ocr-text-extraction-resolution.generated.md`.
- Council decision: `npcp-c1` and `npcp-c2` are approved as `FOUND_VERBATIM` / `SUPPORTED` for calibration after visual PDF confirmation.
- Publication boundary: edition/provenance remains to be reconciled before direct learner-facing publication.
