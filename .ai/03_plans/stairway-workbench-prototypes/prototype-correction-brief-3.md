# Stairway Workbench Prototype Correction Brief 3 — Remove Stair-Type Dropdown

Date: 2026-05-13

## Philip correction

A stair-type/scenario dropdown in the default left sidebar creates decision fatigue.

The learner should not be asked to choose stair type before understanding the baseline. The module should select the active instructional context and let the learner adjust only the few dimensions needed to see cause and effect.

## Corrected rule

Default left sidebar must not contain:

- stair type dropdowns;
- scenario dropdowns;
- law-set selectors;
- project-type selectors;
- occupancy/egress toggles;
- visible advanced options.

Default left sidebar may contain only:

1. fixed lesson/context label;
2. riser height;
3. tread depth;
4. stair width;
5. handrail height;
6. safe/reset action;
7. one More/Study Cases action that opens a modal.

## Where the removed choices go

Stair type, required-exit status, BP 220 housing, accessibility, and law comparison belong in:

- guided lesson cards;
- explicit challenge prompts;
- click-triggered modals;
- later advanced study flows.

They do not belong in the default control sidebar.

## New prototype

Primary corrected prototype:

`variant-f-zero-decision-fatigue.html`

Supersedes Variant E.
