# Stairway Workbench Prototype Correction Brief 4 — Preserve Existing Right Sidebar Content

Date: 2026-05-13

## Philip correction

The right sidebar should not become a new generic list of code rows. It should use the existing right-sidebar compliance content, redesigned and relayouted.

Specifically, the right sidebar should already show the four existing law categories:

1. RA 9514 — Fire Code
2. BP 344 — Accessibility
3. PD 1096 — NBCP
4. BP 220 — Housing

Violations should appear inside the relevant law category/card or in the compact existing-style violation summary, consistent with the current behavior. The redesign target is layout, density, hierarchy, and no-scroll fit — not replacing the underlying compliance model.

## Corrected rule

Default right sidebar:

- keep the four law categories visible;
- keep active/pass/fail behavior tied to existing violation logic;
- show violations in-place inside the law category that produced them;
- preserve conflict/violation summary behavior;
- use modals for deeper explanations/source detail;
- do not reduce the right sidebar to only four dimension rows.

Default left sidebar:

- still remains low-decision: core dimension controls only;
- no stair-type/scenario dropdown;
- study cases/other legal conditions can open through modal/guided flows.

## New primary prototype

`variant-g-existing-law-categories-relayout.html`

This supersedes Variant F because F misunderstood the right sidebar requirement.
