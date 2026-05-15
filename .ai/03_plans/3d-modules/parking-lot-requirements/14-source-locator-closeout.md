# Parking Lot Requirements — Source Locator Closeout Pass

Status: PARTIAL GO FOR SOURCE-CARDED PLANNING; NO CODE IMPLEMENTATION YET.

This pass replaced TBD rows in `05-source-locator-workbook.csv` with raw-PDF locators where available. Evidence pages were extracted to `13-source-locator-extracted-pages.md`; machine search output is in `source-search-raw-results.json`.

## Located source cards

1. BP 344 accessible parking quantity table — located at PDF pp. 8–9, Section A.6 Parking / Table A.6.1.
2. BP 344 accessible parking geometry — located at PDF pp. 9–10, Fig. A.6.1: 4000 mm x 5000 mm accessible slot; 1200 mm front walkway; route/location rules.
3. PD 1096 parking stall dimensions — located at PDF p. 97 / internal p. 94 of 267, Rule VIII Section 804 item 4(b): 2.50 m x 5.00 m perpendicular/diagonal; 2.15 m x 6.00 m parallel.
4. BP 220 stall dimensions — located at PDF p. 39: 2.5 m x 5.0 m perpendicular/diagonal; 2.15 m x 6.0 m parallel.
5. BP 220 off-site language — located at PDF p. 41; ambiguous wording preserved for SME review.
6. PD 957 off-site applicability/distance language — located at PDF p. 32; ambiguous wording preserved for SME review.
7. RA 9514 parking-structure fire-safety scope — located at PDF pp. 190–191; context-only/deferred from geometric MVP.

## Not yet releasable

- PD 1096 90-degree aisle width: no reliable raw-text locator found for the existing draft 6.00 m value. Keep fail-closed. Do not show a learner-facing PASS/FAIL for aisle width until a figure/table/source is located.
- BP 220 Table 3 exact ratio rows: table is located but needs table-specific extraction/SME cleanup before formula encoding.
- LGU overlay: optional and not selected. Do not generalize.

## UI implications

- The right sidebar Sources tab must show source status per rule: LOCATED, PARTIAL, SOURCE PENDING, CONTEXT ONLY.
- The Checks tab must fail closed for `PARK-PD1096-AISLE-90`: label as REVIEW / SOURCE PENDING, not violation/compliant.
- BP 344 geometry should use 4000 mm x 5000 mm as the current-source candidate. If older 3.70 m appears in legacy code, show it only in a conflict/source-review modal, not as the active compliance target.
- RA 9514 should appear as a scope warning: “parking structures may trigger Fire Code checks,” not as an MVP geometric rule.
