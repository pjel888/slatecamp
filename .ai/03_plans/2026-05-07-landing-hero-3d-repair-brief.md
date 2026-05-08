# Landing hero + Three.js repair brief — 2026-05-07

**Supersession note:** This brief is superseded for current hero direction by `.ai/03_plans/2026-05-07-slatecamp-atlas-landing-master-plan.md`. Keep this only for historical rejected-state context; do not implement a setback-slider/mini-tool hero from this file.

## Problem

The current public landing above-the-fold is not acceptable as a first impression:

- The fixed secondary nav overlaps the hero eyebrow and the 3D visual.
- The hero is too dense: three CTAs, four proof pills, two paragraphs, four pillar cards, and a full 3D control panel appear too early.
- The Three.js proof is trapped inside a black app-like container, making it feel like a tool/dashboard instead of a blended premium hero visual.
- The 3D scene contains too many controls for a landing page: presets, eave projection, quick buttons, toggle, stats, disclaimer.
- The setback/buildable planes overlap visually and create noisy chart-junk.
- The copy sells mechanisms and interface complexity instead of assurance, comfort, reliability, and “study buddy / architecture Pokedex” positioning.

## Independent critique used

Kimi/OpenCode reviewed the source and agreed with the main diagnosis:

- Remove the secondary nav on the home page or it will continue colliding with the hero.
- Simplify the hero to a single landing-page story.
- Strip the black Three.js containment and let the scene float on the existing hero background.
- Reduce controls to one slider.
- Remove overlapping buildable-envelope mesh and nonessential labels/badges.
- Adapt scene colors for a light/background-image hero.

Browser visual inspection confirmed:

- The secondary nav is visually sitting inside/on top of the hero demo.
- The right-side black explorer dominates the first viewport.
- Important CTA and supporting copy are too low.
- The 3D visual feels like a full interface, not a calm proof moment.

## Reference lessons

From Stripe-style landing hierarchy:

- Compact nav; do not spend the first screen on chrome.
- One dominant message, short subcopy, two CTAs maximum.
- Product proof should suggest capability without making the user decode a full dashboard.

From Three.js presentation patterns:

- 3D can be visually rich, but UI and text must remain calm.
- Controls should be minimal and purposeful.
- Avoid labels, panels, and overlays that compete with the visual.

## Fix direction

### 1. Navigation

- Add `showSecondaryNav?: boolean` to `MarketingNav`.
- Default stays `true` for other marketing pages.
- Home page passes `showSecondaryNav={false}`.
- This clears the above-the-fold collision immediately.

### 2. Hero composition

- Increase hero top clearance for the primary fixed nav.
- Increase dashboard background image opacity to 75% per Philip’s direction.
- Reduce hero content density:
  - two CTAs only
  - two proof chips only
  - shorter assurance-oriented support copy
- Keep the four pillars but visually push them below the main hero proof.

### 3. Three.js hero proof

Replace the tool-like explorer with a simple floating “setback width” story:

- Fixed study case: R-1 sample lot using existing PD 1096 computation engine.
- One slider only: `Building width`.
- Slider states:
  1. **Comfortably inside setbacks** — building width is inside buildable width.
  2. **Setback violation** — building width exceeds buildable width but remains inside the lot.
  3. **Beyond lot line** — building width exceeds the lot width.
- Remove sample-lot radios, eave projection, quick buttons, toggle, buildable stats, and heavy disclaimer.
- Remove black container and dark canvas background.
- Remove buildable envelope mesh and tiny HTML in-canvas labels.
- Keep simple amber setback bands and a clear building mass.
- Scene floats over the existing hero background with transparent WebGL.

## Acceptance criteria

- The `Architecture learning platform` eyebrow is not covered by nav.
- No black container surrounds the hero 3D element.
- The hero 3D canvas is transparent/floating.
- Background image opacity is 75%.
- The hero explorer has exactly one interactive control.
- The visual demonstrates width increasing → setback violation → lot-line violation.
- No overlapping buildable-envelope plane.
- Above-the-fold is calmer and more reassuring.
- Copy continues positioning SlateCamp as a supplementary companion, not a review-center replacement.
