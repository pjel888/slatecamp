# Stairway Workbench Prototype Correction Brief 5 — Law Cards with Violation Pills

Date: 2026-05-13

## Philip correction

Remove left-sidebar actions for now:
- no Safe Preset;
- no Study Cases.

Right sidebar correction:
- keeping the four law categories is good;
- do not show fake fixed quadrants/check boxes as if each law only has four possible violations;
- research the existing violation model;
- use violation pills as compact entry points;
- clicking a violation pill opens a modal showing all violations/checks for that law.

## Research from current code

Current `stairway-configurator.ts` violation rules already include more than four checks per law/system:

- PD 1096: maximum riser, minimum tread, minimum headroom, maximum vertical rise, minimum width, handrail height range.
- BP 220: maximum riser, minimum tread, minimum width.
- BP 344: minimum width, handrail upper-height/accessibility overlay.
- RA 9514: maximum riser, minimum width, minimum tread, maximum vertical rise.
- Cross-law conflicts: BP 220 vs PD 1096 riser, BP 220 vs PD 1096 width, RA 9514 vs PD 1096 exit-riser strictness.
- Non-law/detail learning checks: Blondel comfort, uniformity tolerance, nosing projection/radius, handrail grip diameter, wall clearance.

Therefore the right sidebar must not use a hard 2x2 quadrant layout. It needs a scalable law-card + pill pattern.

## Corrected pattern

Each law card shows:
- law title;
- compact pass/issue badge;
- flexible pill row/wrap for active/common checks;
- hidden/overflow-safe density, not fixed quadrants;
- click target to modal.

Modal shows:
- all checks for that law;
- active violations;
- source/citation status;
- correction guidance;
- affected geometry/parameter.

## New primary prototype

`variant-h-law-cards-violation-pills.html`

This supersedes Variant G because G still implied a fixed four-check quadrant structure.
