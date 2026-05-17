# Stairway Workbench Prototype Correction Brief 2 — No-Scroll Sidebars

Date: 2026-05-13
Status: authoritative correction after Philip review

## Philip's correction

The previous A–D prototypes are rejected.

The corrected design direction is not:
- mode-heavy;
- violation-dashboard-first;
- overdesigned teaching panels;
- dense sidebars;
- scrolling sidebars;
- left-sidebar decision fatigue.

## New non-negotiables

1. Sidebars should avoid scrolling as much as possible across 3D Lab modules.
2. For the stairway configurator, target zero sidebar scrolling at normal desktop/laptop heights.
3. Left sidebar should contain only essential sliders/inputs.
4. Left sidebar should not contain long explanations, teaching copy, law copy, dense cards, or advanced options by default.
5. Right sidebar should show codes/compliance/violations live while the user plays with sliders.
6. Right sidebar should be compact and status-driven, not a text-heavy report.
7. Detailed code explanation may open in popup modals when a card/row is clicked.
8. Pop-up modals are acceptable for detail; sidebar cramming is not.
9. Reduce visible options to avoid decision fatigue.
10. Design for a 13-inch MacBook Pro content height; no-scroll is a key success criterion.

## Corrected layout model

### Left sidebar: Controls only

Visible controls only:
- Riser height
- Tread depth
- Stair width
- Handrail height
- Optional scenario selector / compact code context selector
- Reset / safe preset

Everything else should be hidden behind one compact `More controls` popover/modal, not expanded in the sidebar.

### Center: 3D viewport

Dominant and spacious.

### Right sidebar: Code status and violations only

Visible rows:
- Overall status
- Active code chips
- Riser rule row
- Tread rule row
- Width rule row
- Handrail rule row
- Headroom / landing compact row if needed
- Violations list, only when failures exist

Each row can be clicked to open a detail modal with:
- full explanation;
- source audit state;
- law applicability;
- correction guidance;
- future citation text after source audit.

## New prototype target

Create:

`variant-e-no-scroll-code-sidebar.html`

Purpose:
A corrected best-shot prototype for the actual desired default UI.

It must prove:
- no sidebar scrolling;
- left controls are minimal;
- right codes/violations are compact and live;
- details move to modal;
- the stair remains the main object;
- no mode forcing.
