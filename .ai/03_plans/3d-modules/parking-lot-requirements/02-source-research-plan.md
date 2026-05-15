# Source Research Plan — Parking Lot Requirements

## Source hierarchy

1. Local raw source PDFs/files under `vitruvius-connection/001_Raw-Source-Layer/`.
2. Official government or standards-body web captures saved into the raw source layer when local source is missing.
3. Converted Markdown under `002_Raw-Conversion-Layer/` only for search/OCR assistance after raw source is identified.
4. International standards only as comparative references unless adopted by Philippine law or project brief.
5. Existing code and existing SlateCamp content are not legal truth.

## Local sources already identified

| Source family | Raw source candidate | Known SHA/status from `vitruvius-source-reference.md` | Parking relevance |
|---|---|---|---|
| PD 1096 / NBCP | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).pdf` | SHA256 `ca465dd26cb1c4a235fd63d01b19c7239a73920f3753b7807cc8e98a3ac33bc6` | Baseline parking, occupancy, garages, open spaces, development controls, Rule XIX references to verify. |
| BP 344 / Accessibility | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf` | SHA256 `63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953` | Accessible parking quantity table, stall/access aisle requirements, route and signage rules. |
| BP 220 | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-220/Revised_IRR_BP220_2008.pdf` | SHA256 `7392741260c227647afe39de283f3efa979465692da8905e59be8857c8651614` | Economic/socialized housing parking ratios and stall dimensions. Converted text shows 2.5m x 5.0m and 2.15m x 6.0m rows, but raw PDF locator is still required. |
| PD 957 | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-957/PD 957 IRR - Subdivision and Condominium IRR.pdf` | SHA256 `1f9ab17a816885cfdbafafc03e3e9b64470a737447129a32a459836d6773f9ea` | Condominium/subdivision parking and circulation; may refer back to NBCP and off-site parking constraints. |
| RA 9514 / Fire Code | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9514/RA9514-RIRR-rev-2019.pdf` | SHA256 `ace1e9fbbeb67d294171ed743d46eda2a4c199b9bb642862bab8524b80754266` | Parking garage fire/life-safety context, exits, fire protection, hazard/occupancy interface. |
| LGU ordinances | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/LGU/` | 56 PDFs visible in source reference inventory | Local parking ratios may be stricter or contextual; must be modeled as local overlay, not universal national rule. |

## Converted-text findings to verify against raw PDFs

These findings are useful search leads only. They are not approved source cards yet.

- BP 344 converted text has section `6. Parking`, Table A.6.1, accessible parking slot count bands, and accessible parking transfer-space language.
- BP 220 converted text has `Parking Requirements (Amended per Board Res. No. 824, Series of 2008)`, one slot per eight living units, average automobile slot dimensions of `2.5m x 5.0m` for perpendicular/diagonal and `2.15m x 6.0m` for parallel, driveway-as-parking condition, off-site parking within `100m`, and local ordinance compliance note.
- PD 957 converted text contains circulation, loading/unloading setbacks, conformity to NBCP parking requirements, open spaces including parking, and off-site parking notes in illustrated material.
- PD 1096 converted text contains parking/garage occupancy references and likely Rule XIX leads, but exact parking dimensional table must be verified from raw PDF pages.

## International / local standards comparison targets

These are comparison sources to research and capture later. Do not treat as Philippine legal truth without adoption evidence.

| Standard/reference | Why check it | Expected use in module |
|---|---|---|
| ITE / Parking Generation and parking design references | Parking demand and geometric vocabulary | Background note; not pass/fail unless project context says so. |
| AASHTO / geometric design references | Vehicle maneuvering, turning radii, aisle circulation concepts | Comparative geometry vocabulary and turning templates. |
| ADA Standards / accessible parking | Accessible stall/access aisle concepts | Compare with BP 344; avoid importing ADA numbers into Philippine compliance. |
| ISO/BS/EN accessible built-environment references | International accessibility contrast | Teaching comparison only. |
| Local LGU zoning ordinances | Actual local parking ratios and exceptions | Optional overlay selector after source capture. |
| Developer/subdivision guidelines from DHSUD/HLURB | Housing and subdivision context | Check against BP 220/PD 957 raw texts. |

## Research tasks

1. Inventory raw PDFs in PD 1096, BP 344, BP 220, PD 957, RA 9514, and LGU folders.
2. Hash and page-count every raw candidate used.
3. Extract text around parking-related pages with PyMuPDF from the repo shell.
4. Record each locator in `05-source-locator-workbook.csv`.
5. For each rule, classify: `DIMENSION`, `COUNT_RATIO`, `DISTANCE`, `APPLICABILITY`, `DESIGN_QUALITATIVE`, `LOCAL_OVERLAY`, or `FIRE_LIFE_SAFETY_CONTEXT`.
6. Resolve conflicts and precedence. If local ordinance is stricter, module must display stricter-overlay behavior instead of silently overriding national rules.
7. Capture international references only after official/local source locator work is stable.
8. Produce source cards before implementation.

## Research no-go conditions

- No exact page/table/section locator for a legal value.
- Converted Markdown contradicts raw PDF extraction.
- Existing code cites a section that cannot be found in raw source.
- International source numbers are being used as Philippine compliance values.
- LGU ordinance values are generalized as national rules.
