# Source Ledger - BP 344 Accessible Ramp Geometry

## Source document

- Document ID: `BP344_2024_IRR`
- Relative path: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf`
- SHA256: `63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953`
- PDF page count: 78
- Locator set: `bp344_ramps`
- PDF pages used: 2, 7, 8

## Verification status

- Local PDF present: yes
- Text extraction method: PyMuPDF via `uvx --from pymupdf`
- Source tier: primary/local source layer
- SME release status: LLM council SME review complete for calibration on 2026-05-09; direct publication remains held pending licensed-human SME clearance and source/provenance reconciliation.

## Extracted evidence snippets

- Query: `Minimum clear width of 1200 mm`
  - PDF page: 2
  - Evidence excerpt: Changes in level shall require a ramp except when served by a dropped sidewalk, curb ramp, an elevator, or other mechanical device. Accessible ramps shall have the following facilities and features: 1. Minimum clear width of 1200 mm 2. Gradient not steeper than 1:20. Steeper gradients may be allowed in special cases depending on the length to be covered. Maximum Slope Maximum Length Maximum Rise Interval for Landing 1:20 – – 15m 1:15 10.50m 700mm 10m Table A.1.1.: Accessible Ramps Fig. A.1.1: Plan of Ramp 3000mm Wide or More 1. For accessible ramps 3000 mm or more in width, provide intermediate handrails at the center. The use of double “J-type” handrail supports is recommended. 10. Accessible ramps with a total length longer than 10.50m shall be provided with intermediate landings with a minimum length of 1800 mm. 1. Landing served by a
- Query: `Gradient not steeper than 1:20`
  - PDF page: 2
  - Evidence excerpt: Changes in level shall require a ramp except when served by a dropped sidewalk, curb ramp, an elevator, or other mechanical device. Accessible ramps shall have the following facilities and features: 1. Minimum clear width of 1200 mm 2. Gradient not steeper than 1:20. Steeper gradients may be allowed in special cases depending on the length to be covered. Maximum Slope Maximum Length Maximum Rise Interval for Landing 1:20 – – 15m 1:15 10.50m 700mm 10m Table A.1.1.: Accessible Ramps Fig. A.1.1: Plan of Ramp 3000mm Wide or More 1. For accessible ramps 3000 mm or more in width, provide intermediate handrails at the center. The use of double “J-type” handrail supports is recommended. 10. Accessible ramps with a total length longer than 10.50m shall be provided with intermediate landings with a minimum length of 1800 mm. 1. Landing served by a
- Query: `Handrails shall be required`
  - PDF page: 7
  - Evidence excerpt: Handrails shall be required for accessible ramps for changes in grade higher than 170 mm. Handrails shall be installed on both sides of ramps and stairs. Handrails may be provided at dropped sidewalks but shall not be installed beyond the width of any crossing so as not to obstruct pedestrian traffic. Handrails shall be installed at 900 mm and 700 mm above ramps and stairs. Fig. A.5.1: Handrail Detail for Ramps Railings for protection shall be installed at a height of 1100 mm minimum, measured from the top of the rail to the finished floor for stairs, ramps, balconies, landings or porches that are more than 750 mm above adjacent grade. These shall be installed in addition to the handrails required for accessible ramps (Appendix A, Minimum Requirements for Accessibility, Section C Buildings & Structures, Item 2 Ramps). (per NBC Rule XII Ge
- Query: `Handrails attached to walls`
  - PDF page: 8
  - Evidence excerpt: Handrails attached to walls shall have a minimum clear distance of 50 mm from the wall. Handrails on ledges shall have a minimum clear distance of 40 mm. Handrails shall be continuous throughout the entire length and around landings less than 2100 mm in length, except where it is intersected by an alternative path of travel or has an entry door leading into it. Handrails shall be made of slip-resistant material and shall have a continuous gripping surface without any sharp edges or projections. The upper handrail extensions, at the top and bottom of stairs and ramps, shall be marked with the destination in Braille accompanied by written characters. Handrails shall remain unobstructed. Placing any objects on top of handrails that are not an essential part of the handrail design or do not serve a safety purpose is strictly prohibited. 6. Pa

## Claim-control notes

- Claims in `exemplar-article.md` are limited to the listed PDF locators.
- If this exemplar is converted into a live article, use the roundtrip protocol and create a normal article bundle. Do not paste this pack directly into Supabase.


## Structured claim ledger

- Machine-checkable file: `claim-ledger.json`
- Council-applied requirement: every factual claim must carry `claim_class`, `locator`, `extraction_status`, `conflict_class`, linked question IDs, and SME status.

## SME council reconciliation notes

- Raw 2024 BP 344 PDF p.2 confirms the exemplar wording: minimum clear width 1200 mm; gradient not steeper than 1:20; steeper gradients may be allowed in special cases depending on length; Table A.1.1 lists 1:20 with 15 m landing interval and 1:15 with 10.50 m maximum length, 700 mm maximum rise, and 10 m landing interval.
- Raw PDF p.7 confirms handrails are required for accessible ramps for changes in grade higher than 170 mm and installed at 900 mm and 700 mm above ramps/stairs.
- A council concern about a 1:12 accessible-ramp maximum was checked against the 2024 raw PDF and not adopted for this exemplar; the only `1:12` occurrence found in the 2024 PDF concerns a swimming-pool transfer-wall clear transfer space, not the accessible-ramp table.
- Source/provenance reconciliation is closed for calibration: the NCDA local webpage PDF and NCDA Official Gazette downloadable PDF differ by hash, but both are documented anchors; direct publication remains held for licensed-human SME release approval and roundtrip conversion.

## 2026-05-09 source-pack repair closeout

- Reconciliation status: NCDA 2024 local webpage PDF and NCDA Official Gazette downloadable PDF differ by hash, but both are NCDA/Official Gazette anchors for the current 2024 IRR. The official remote PDF SHA256 `7c4a75a5190897f20844ec8981711c5453954504d609568a292dea9e6888fa76` is recorded in `source-anchor-audit.generated.json`; the local source-layer PDF SHA256 remains `63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953`.
- Source-pack status: `source-pack-bp-344-2024-revised-irr` governed chunks rebuilt around accessible ramps and handrails.
- Remaining hold: licensed-human SME release approval and roundtrip conversion only.
