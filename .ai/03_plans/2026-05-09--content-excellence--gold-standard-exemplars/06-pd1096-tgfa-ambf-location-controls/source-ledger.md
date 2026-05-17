# Source Ledger - PD 1096 Rule VII: TGFA, AMBF, and Location Controls

## Source document(s)

- Source-pack ID: `source-pack-pd-1096-irr` (corrected from erroneous `source-pack-pd-1096-rirr`; raw PDF title remains “The 2004 Revised IRR of P.D. No. 1096”).

- Document ID: `PD1096_RIRR_2004`
- Relative path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).pdf`
- SHA256: `ca465dd26cb1c4a235fd63d01b19c7239a73920f3753b7807cc8e98a3ac33bc6`
- PDF page count: 368
- Source tier: primary/local source layer

## Verification status

- Text extraction method: PyMuPDF via `uvx --from pymupdf`
- SME release status: LLM council SME review complete for calibration on 2026-05-09; direct publication remains held pending licensed-human SME clearance and source/provenance reconciliation.
- Structured claim ledger: `claim-ledger.json`

## Extracted evidence snippets

- Query: `SECTION 704. Location on Property`
  - PDF page: 81
  - Evidence excerpt: ate occupancy separations in buildings of mixed occupancy; Provided, that, where any occupancy separation is required, the minimum shall be a “One-Hour Fire-Resistive Occupancy Separation”; and where the occupancy separation is horizontal, structural members supporting the separation shall be protected by an equivalent fire-resistive construction. SECTION 704. Location on Property 1. General a. No building shall be constructed unless it adjoins or has direct access to a public space, yard or street on at least one of its sides. b. For the purpose of this Section, the centerline of an adjoining street or alley shall be considered an adjacent property line. c. Eaves over required windows shall not be less than 750 millimeters from the side and rear property lines. 2. Fire Resistance of Walls Exterior walls shall have fire resistance and opening protection in accordance with the requirement
- Query: `No building shall be constructed unless it adjoins`
  - PDF page: 81
  - Evidence excerpt: occupancy; Provided, that, where any occupancy separation is required, the minimum shall be a “One-Hour Fire-Resistive Occupancy Separation”; and where the occupancy separation is horizontal, structural members supporting the separation shall be protected by an equivalent fire-resistive construction. SECTION 704. Location on Property 1. General a. No building shall be constructed unless it adjoins or has direct access to a public space, yard or street on at least one of its sides. b. For the purpose of this Section, the centerline of an adjoining street or alley shall be considered an adjacent property line. c. Eaves over required windows shall not be less than 750 millimeters from the side and rear property lines. 2. Fire Resistance of Walls Exterior walls shall have fire resistance and opening protection in accordance with the requirements set forth by the Secretary. Projections beyond
- Query: `Eaves over required windows shall not be less than 750 millimeters`
  - PDF page: 81
  - Evidence excerpt: ent fire-resistive construction. SECTION 704. Location on Property 1. General a. No building shall be constructed unless it adjoins or has direct access to a public space, yard or street on at least one of its sides. b. For the purpose of this Section, the centerline of an adjoining street or alley shall be considered an adjacent property line. c. Eaves over required windows shall not be less than 750 millimeters from the side and rear property lines. 2. Fire Resistance of Walls Exterior walls shall have fire resistance and opening protection in accordance with the requirements set forth by the Secretary. Projections beyond the exterior wall shall not exceed beyond a point one-third the distance from an assumed vertical plane located where the fire- resistive protection of openings is first required to the location on property whichever is the least restrictive. Distance shall be measure
- Query: `SECTION 705. Allowable Floor Areas`
  - PDF page: 83
  - Related table page: PDF p.84 (`Table VII.1. Allowable Maximum Total Gross Floor Area (TGFA)`)
  - Evidence excerpt: ction for up to 70% of the total perimeter of the property lines provided that the prescribed setbacks, yards and courts fronting the Road Right-Of-Way (RROW) are first fully complied with; and provided further that all the applicable stipulations of the Fire Code, particularly on the number, type and locations of fire exits are strictly followed. SECTION 705. Allowable Floor Areas 1. General. The Allowable Maximum Total Gross Floor Area (TGFA) of any proposed building/structure shall only be as allowed under this Rule. 2. TGFA Limitation. In Table VII.1. hereafter, the percentages (%) indicated in the third (3rd) through eighth (8th) columns, but excluding the multiplier numbers 3, 5, 12, 18, and 30 (which represent the number of storeys/floors), are the percentages of the Total Lot Area (TLA) that may be used to initially determine the Allowable Maximum TGFA for a proposed building/str
- Query: `Allowable Maximum Total Gross Floor Area`
  - PDF page: 83
  - Evidence excerpt: roperty lines provided that the prescribed setbacks, yards and courts fronting the Road Right-Of-Way (RROW) are first fully complied with; and provided further that all the applicable stipulations of the Fire Code, particularly on the number, type and locations of fire exits are strictly followed. SECTION 705. Allowable Floor Areas 1. General. The Allowable Maximum Total Gross Floor Area (TGFA) of any proposed building/structure shall only be as allowed under this Rule. 2. TGFA Limitation. In Table VII.1. hereafter, the percentages (%) indicated in the third (3rd) through eighth (8th) columns, but excluding the multiplier numbers 3, 5, 12, 18, and 30 (which represent the number of storeys/floors), are the percentages of the Total Lot Area (TLA) that may be used to initially determine the Allowable Maximum TGFA for a proposed building/structure.
- Query: `Allowable Maximum Building Footprint`
  - PDF page: 81
  - Evidence excerpt: wable floor areas for a single building, and when the buildings so considered, house different occupancies or are of different types of construction, the area shall be that allowed for the most restrictive occupancy or construction. 4. Building Footprint and Firewall Requirements a. The following rules shall be observed in the determination of the Allowable Maximum Building Footprint (AMBF) for buildings and related habitable structures. If the stated rules are compared with (1) Rule VIII Table VIII.1.- Reference Table on Percentage of Site Occupancy and Maximum Allowable Construction Area (MACA); (2) Rule VIII Tables VIII.2. and VIII.3. (setbacks, yards and courts); or (3) with the applicable stipulations under this Rule and with the

## Claim-control notes

- Claims in `exemplar-article.md` are limited to the listed raw source locators.
- If this exemplar is converted into a live article, use the roundtrip protocol and create a normal article bundle. Do not paste this pack directly into Supabase.

## SME council reconciliation notes

- `pd1096-c2` was rechecked against the raw DPWH PDF. PDF p.81 visibly places “Eaves over required windows shall not be less than 750 millimeters from the side and rear property lines” under Rule VII, Section 704.1(c), so the Rule VII locator is retained and made more precise.
- `pd1096-c4` was reworded to frame AMBF as a footprint / percentage-of-site-occupancy control distinct from TGFA, with firewall conditions affecting the allowable footprint under Rule VII / Rule VIII cross-checks.
- Source/provenance reconciliation is closed for calibration; direct publication remains held for licensed-human SME release approval and roundtrip conversion.

## 2026-05-09 source-pack repair closeout

- Reconciliation status: DPWH public URLs returned anti-bot/noindex HTML, not PDF. The local DPWH Official 2004 Revised IRR PDF is the governing source-layer anchor at SHA256 `ca465dd26cb1c4a235fd63d01b19c7239a73920f3753b7807cc8e98a3ac33bc6`.
- Source-pack status: `source-pack-pd-1096-irr` governed chunks rebuilt around Rule VII Sections 704 and 705, including AMBF/TGFA locators.
- Remaining hold: licensed-human SME release approval and roundtrip conversion only.
