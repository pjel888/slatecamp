# Stairway Learning Workbench — Prototype Strategy

Date: 2026-05-13
Status: required before final visual implementation
Purpose: make the UI direction visible and testable before production coding.

## 1. Honest confidence statement

The strategy is strong, but no one should claim the final UI will be amazing without a visual prototype and browser validation.

The current document set is enough to prevent the major architectural and UX mistakes:

- cramped generic sidebars;
- all controls exposed equally;
- viewport blocked by explanatory cards;
- law/comfort/source states mixed together;
- computation duplicated in UI components;
- premature source-backed legal claims.

But the final visual quality still requires a prototype pass.

## 2. Prototype goal

Create 2–3 disposable HTML or app-local mockup variants before production build.

The prototype must answer:

1. Does the viewport still feel dominant?
2. Do 400px side panels solve the cramped-sidebar problem?
3. Can Scenario + Core Geometry fit cleanly without scrolling fatigue?
4. Does the right panel explain violations without becoming a wall of text?
5. Does the learner immediately see active laws, failing dimension, and next fix?
6. Does the design still work on a 13-inch laptop viewport?
7. Does the mobile/bottom-sheet path keep the model usable?

## 3. Required prototype variants

### Variant A — Instrument Panel Workbench

Design stance:
- professional tool interface;
- compact but not cramped;
- resembles a clean architecture/code compliance instrument panel.

Layout:
- left: Scenario + Core Geometry cards;
- center: large 3D viewport;
- right: Diagnosis + Critical Fixes;
- bottom: compact status chip row.

Best for:
- production Phase 1 because it is closest to current architecture.

Risk:
- can become too utilitarian if cards are overpacked.

### Variant B — Teaching Studio

Design stance:
- calmer, more guided, stronger educator presence.

Layout:
- left: learning step and current control group;
- center: large viewport with minimal labels;
- right: explanation + selected element + one checkpoint.

Best for:
- Learn/Diagnose modes.

Risk:
- may feel too slow for power users in Sandbox.

### Variant C — Diagnosis First

Design stance:
- violation-first workflow for exam prep.

Layout:
- left: scenario/preset and limited controls;
- center: model;
- right: ranked fix queue and law conflict explanation.

Best for:
- Challenge/Diagnose mode.

Risk:
- could make the module feel like an error dashboard instead of a learning lab.

## 4. Recommended winner strategy

Do not choose only one variant for the final product.

Use a hybrid:

- Sandbox mode: Variant A, Instrument Panel Workbench.
- Learn mode: Variant B, Teaching Studio.
- Diagnose/Challenge modes: Variant C, Diagnosis First.

This maps visual density to learner intent:

- exploring = full control;
- learning = guided sequence;
- diagnosing = focused issue queue;
- challenge = minimal hints.

## 5. Prototype content requirements

Each prototype must include realistic SlateCamp content, not placeholder lorem ipsum.

Required fake-but-realistic states:

1. Passing baseline stair.
2. Riser violation.
3. Tread violation.
4. Required-exit scenario activating stricter RA 9514 status.
5. Accessible-route scenario activating BP 344-related checks.
6. Comfort warning only.
7. Cross-law conflict warning.
8. Source audit pending state.

## 6. Prototype viewport sizes

Each variant must be checked at:

- desktop wide: 1440 × 900;
- 13-inch laptop approximation: 1280 × 800 or content height around 750px;
- tablet: 1024 × 768;
- mobile: 390 × 844.

Failure condition:
- If the model becomes visually secondary on desktop or laptop, the variant fails.
- If the right panel requires excessive scrolling before showing the first critical fix, the variant fails.
- If mobile bottom sheet hides the stair during normal adjustment, the variant fails.

## 7. Prototype interaction requirements

At minimum, the prototype must simulate:

- mode tab switch;
- accordion open/close;
- slider value crossing pass/fail threshold;
- law condition toggle changing active chips;
- selected element changing right-panel inspector;
- mobile/bottom-sheet tab switch.

No production logic is required in the prototype. The goal is layout and interaction validation.

## 8. Visual direction rules

Use SlateCamp’s product language:

- precise;
- architectural;
- calm;
- premium;
- code-auditor trustworthy;
- not playful toy-like;
- not over-dark sci-fi;
- not generic SaaS dashboard.

Preferred references:

- Linear-like precision for spacing and state hierarchy;
- Apple/BMW-like restraint for 3D product focus;
- Notion/Mintlify-like source readability for legal notes;
- avoid heavy dark neon developer-tool aesthetics.

## 9. Prototype deliverable paths

Recommended disposable prototype folder:

`.ai/03_plans/stairway-workbench-prototypes/`

Files:

- `variant-a-instrument-panel.html`
- `variant-b-teaching-studio.html`
- `variant-c-diagnosis-first.html`
- `prototype-comparison.md`

If the team wants production-adjacent prototypes later, promote the winning direction into Storybook or a route-local dev mock, but do not mix prototype markup into production components.

## 10. Prototype acceptance checklist

A prototype direction is approved only if:

- [ ] viewport remains dominant on desktop;
- [ ] panels are readable without cramped control dumping;
- [ ] first critical fix is visible without deep scrolling;
- [ ] legal, comfort, comparison, and source-pending states are visually distinct;
- [ ] scenario change clearly changes active law chips;
- [ ] dimension change clearly updates diagnosis;
- [ ] mobile path keeps model and controls usable;
- [ ] the design supports Learn, Diagnose, Compare, Sandbox, and Challenge modes;
- [ ] Philip can look at it and say which direction feels right before production build.

## 11. Final planning verdict

The planning strategy is now complete enough to guide both:

1. Phase 1 production implementation, and
2. a prototype/visual exploration pass.

However, visual excellence cannot be guaranteed from documents alone. The next safest step before coding the final UI is to create the prototype variants, compare them, and then implement the winning hybrid in production.
