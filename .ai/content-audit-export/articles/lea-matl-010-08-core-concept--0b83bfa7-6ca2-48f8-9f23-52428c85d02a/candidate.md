## What You Need to Know for the LEA

Earthwork volume questions are source-safe when they stay inside the stated geometry, end areas, grid areas, and elevations. The local Estimating Excavation source uses cubic-yard formulas, so keep the units visible: square feet times feet gives cubic feet, then divide by 27 to convert to cubic yards.

## Core Concept

For an average end area prism, compute the average of the two end areas, multiply by the length, then divide by 27 when the inputs are in feet:

Volume (CY) = {[(Area 1 + Area 2) / 2] x Length} / 27

Use the same source discipline for grid cut and fill. Compare the average proposed elevation (APE) with the average existing elevation (AEE). If APE is higher than AEE, the grid requires fill. If AEE is higher than APE, the grid requires cut. The volume is the elevation difference times the grid area, divided by 27 for cubic yards.

## How It Is Tested

Expect short calculation items. For two end areas of 150 sq ft and 475 sq ft over a 50 ft length, the volume is [(150 + 475) / 2] x 50 / 27 = 578.7 cu yd. For a 50 ft x 50 ft grid with 0.77 ft average fill depth across 9 squares, the volume is 0.77 x 2,500 x 9 / 27 = 641.7 cu yd.

## Common Mistakes

Do not skip the division by 27 when the source problem asks for cubic yards. Do not add swell, shrinkage, borrow, or haul assumptions unless the item provides those factors. Do not treat a cut formula as fill; the sign comes from which average elevation is higher.

## Sources Checked

Primary local source: Estimating Excavation raw PDF, checked first by local PyMuPDF extraction before using the refined markdown locators. Supporting locators: refined markdown lines 1120-1260, 1580-1605, and 1980-1992; raw PDF pages 42, 45, 49-50, and 56.

## Scenario Enrichment Status

eligible-deferred: earthwork volume is scenario-eligible, but no Real World Scenario section was added in Batch 082 because source-audited correctness and linked-question safety were the controlling gates.
