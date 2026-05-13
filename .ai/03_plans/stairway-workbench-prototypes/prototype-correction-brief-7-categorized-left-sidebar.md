# Stairway Workbench Correction Brief 7 — Categorized Left Sidebar

Date: 2026-05-13

## Philip correction

The left sidebar should be categorized, not a flat list.

Remove:
- top explanatory copy such as `Inputs` and `Default context is fixed`;
- risers-in-flight control for now;
- Safe Preset;
- Study Cases.

## Corrected left sidebar structure

Topmost card:

### Stair information

Read-only compact information only:
- stair count / step count;
- total height / total rise;
- total run / depth;
- comfort value `2R + T`;
- pitch angle;
- width.

This card is informational, not a decision area.

### Step body

One category/card containing:
1. riser height;
2. tread depth;
3. clear stair width.

These belong together because they define the basic stair body and are the most board-vital dimensional checks.

### Headroom clearance

Standalone control/card.

### Handrail height

Standalone control/card.

## Prototype

`variant-j-categorized-left-sidebar.html`

This supersedes Variant I for the left sidebar. The right sidebar remains the accepted law-card / violation-pill direction for now.
