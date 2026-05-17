# SlateCamp landing hero artistic 3D direction brief — 2026-05-07

**Status:** Research-first / no-code approval brief
**Branch:** `feat/landing-3d-hero-best-representation`
**Scope:** Home landing above-the-fold, nav behavior, hero copy, and hero 3D direction.
**Do not implement until Philip approves this direction.**

---

## 1. Direct diagnosis

The current landing hero is not acceptable as a first impression.

### P0 issues

1. **The hero is overloaded.** The first viewport tries to show nav, secondary nav, eyebrow, headline, two paragraphs, two CTAs, microcopy, a 3D demo, preset buttons, a slider, and four pillar cards. This reads like a dashboard/tool page, not a premium landing hero.
2. **The Three.js visual is visually wrong for the current hero.** It appears dark/black, heavy, CAD-like, and pasted over the dotted-grid/image background instead of floating inside it.
3. **The 3D visual is still too much of a tool.** Even after simplifying, the preset buttons, labels, and explanatory controls make the hero feel like users must operate a mini-app before understanding the promise.
4. **The secondary nav competes with the hero.** It does not belong in the same visual zone as the headline and 3D proof. It makes the top feel cramped.
5. **CTA hierarchy is confused.** `Dashboard` appears in the nav and again as hero CTA for logged-in users.
6. **Copy is too dense and too explanatory.** Users do not care about SRS, active recall, quizzing methods, or platform mechanism labels. They care about assurance, comfort, reliability, organized knowledge, and knowing what to fix next.

### Strategic positioning correction

SlateCamp should be framed first as a resource, not as a study tool:

> **An architecture knowledge atlas / resource platform — the student’s architecture field guide and supplementary review buddy beside review centers, school, books, notes, mentors, and self-study.**

Philip's language correction: `Atlas` is especially strong because it fits the SlateCAMP brand. Camp implies a journey; atlas implies the map of the territory.

Not:

- a primary review center
- an official PRC/PRBoA source
- a pass-guarantee system
- a learning-science/SRS product
- a generic SaaS dashboard

---

## 2. Reference research synthesis

### Infinite Field — one expressive WebGL object

Useful lessons:

- One memorable 3D/canvas form can define the whole hero.
- The visual works because the page gives it space.
- Copy density is extremely low.
- The 3D object is atmospheric and identity-forming, not a control-heavy widget.

SlateCamp translation:

- Use one floating architectural study object, not a full 3D Lab tool.
- Let dotted fields and negative space carry the atmosphere.
- The 3D should feel like a living architecture diagram, not a boxed app.

### Matter — intelligence over the physical world

Useful lessons:

- Real-world/physical background plus subtle analytical overlays creates authority.
- The hero leads with a short thesis, not feature lists.
- Thin labels, bounding boxes, and technical overlays make the brand feel serious.

SlateCamp translation:

- The dotted-grid/image background is already a strong base; increase image presence around 75% but protect text with a controlled overlay/scrim.
- Use thin architectural annotation lines and spatial interpretation cues.
- Make SlateCamp feel like it “reads” architecture and turns it into usable knowledge.

### Save.design — technical creative workspace

Useful lessons:

- Strong concise headline + short support line + primary/secondary CTA works.
- Rounded/frosted surfaces can feel technical and premium if restrained.
- Product-world visuals are stronger than generic SaaS cards.

SlateCamp translation:

- Use frosted translucent surfaces sparingly for microcopy/control treatment.
- Do not let abstract art obscure what SlateCamp actually does.
- Keep the hero mood high-end, but action path clear.

### Atuin — large 3D object + typography overlap

Useful lessons:

- A single sculptural 3D element overlapping the headline can feel creative, custom, and memorable.
- A minimal header preserves the hero composition.
- Pill/outline typography can create a distinctive technical/architectural motif.

SlateCamp translation:

- The 3D object may partially enter the headline field if it feels intentional and not cluttered.
- Use small outline/pill emphasis only for one key word or micro-label, not everything.
- Header must be visually quiet.

### OCI / Made by Buzzworthy — code/zoning confidence

Useful lessons:

- Code and zoning can be made premium with drawing-sheet language: thin rules, white cards, grid discipline, technical labels.
- Fear-to-assurance copy works: “guiding your project with confidence.”
- Compliance should feel like strategy and clarity, not bureaucracy.

SlateCamp translation:

- Strong copy territory: “Understand the rule before it becomes a mistake.” / “Know what stuck before exam week.”
- Use architecture-native visual language: document cards, plan lines, dashed boundaries, numbered sections, code-atlas labels.
- Make SlateCamp feel reliable and calming.

### Kimi inspection summary

Kimi agreed the current hero is ship-blocked:

- Secondary nav collides with the hero.
- Above-the-fold is a feature dump.
- The black/dark 3D mass is visually hostile in the light hero.
- Four pillar cards must leave the first viewport.
- Preset buttons and labels make the hero feel like a tool.
- R3F/Three.js should stay for the spatial artifact.
- Framer Motion should be used sparingly for DOM entrance/microinteractions.
- GSAP and Remotion should not be used for this interactive hero.

Full Kimi output: `.ai/03_plans/2026-05-07-kimi-current-landing-inspection.md`

---

## 3. Creative direction

### North star

> **A premium architectural knowledge field: dotted lines, frosted massing, and one calm interactive proof that SlateCamp turns confusing rules into visible knowledge.**

The hero should feel like an architectural atlas coming alive — not a dashboard, not a review-center flyer, not a CAD tool, not a black video embed. After deeper reference analysis, the hero is no longer constrained to a literal building/lot model; abstract magical Three.js is acceptable if it evokes architecture and shows exam chaos becoming organized knowledge. See `.ai/03_plans/2026-05-07-reference-sites-deep-design-analysis-addendum.md`.

### Visual language

- Existing dotted-grid and background image stay.
- Background image opacity target: about **75%**, with a readable overlay/scrim so text remains legible.
- The hero 3D should be **transparent-canvas**, floating in the same atmospheric field.
- Materials: frosted/translucent white, soft blueprint blue, pale amber warning glow, subtle graphite linework.
- Geometry: abstract spatial system first — dotted topic fields, floating sheet stacks, translucent planes, blueprint auroras, review constellations, or architecture-evocative fragments. A literal setback/lot model is only one optional later product-proof module, not the default hero constraint.
- Corners: small rounded corners for DOM surfaces; do not make the whole hero bubbly.
- Avoid all black containers in the light hero.

### Interaction story

One emotional story only:

1. Review knowledge begins scattered, noisy, and hard to prioritize.
2. SlateCamp organizes it into a visible architecture field: subjects, rules, resources, quizzes, tools, and weak-area signals.
3. The student leaves the hero with a clear next action: look up, understand, test, repair.

The story should be legible in three seconds. Avoid controls unless the chosen concept truly needs one; default to ambient/cursor/scroll response rather than a mini-app.

---

## 4. Proposed above-the-fold composition

### Header/nav

- Keep primary header compact.
- Remove or relocate the secondary nav from the first viewport. If secondary nav is required by product direction, place it below the hero or make it a non-overlapping post-hero anchor bar.
- Do not let nav cover or visually crowd the eyebrow/headline.

### Left column

Only these elements:

1. Eyebrow: `Architecture knowledge atlas` or `Architecture knowledge resource platform`
2. Headline: one short atlas/assurance-led line.
3. Support: one short sentence.
4. Primary CTA.
5. Optional quiet microcopy under CTA.

No feature cards, no long review-center paragraph, no two-button cluster unless the secondary CTA is a text link.

### Right column

- One abstract R3F/Three.js architecture-knowledge visual system.
- No card background.
- No black/dark canvas unless the entire hero is intentionally designed as a dark cinematic section.
- No preset buttons or dense in-hero controls.
- Default interaction: ambient motion, cursor parallax, or scroll-responsive organization of knowledge fragments. Use a slider only if the chosen concept requires it; the hero must not feel like a mini tool.

### Below first viewport

Move these below the fold:

- Knowledge Resources / Quizzes / 3D Lab / Free Tools pillars
- Review-center relationship explanation
- detailed proof/trust bars
- disclaimers beyond one microcopy line
- feature previews

---

## 5. Copy direction

### Hero copy candidates

Candidate A — strongest fear-to-assurance:

- Eyebrow: `Architecture knowledge resource platform`
- Headline: `Stop studying blind.`
- Support: `SlateCamp helps you find what stuck, what slipped, and what to repair next — with source-backed guides, quizzes, 3D labs, and practical tools.`
- CTA: `Start free`
- Microcopy: `Use beside your review center, school, books, notes, and mentors.`

Candidate B — knowledge-resource emphasis:

- Eyebrow: `Architecture knowledge resource platform`
- Headline: `Architecture knowledge you can actually rely on.`
- Support: `A calm field guide for school, board-review season, and practice — built around explanations, visuals, quizzes, and tools.`
- CTA: `Explore SlateCamp`
- Microcopy: `Free after signup · No card required`

Candidate C — Pokedex metaphor translated safely:

- Eyebrow: `Code atlas · quiz buddy · practical toolbelt`
- Headline: `Your architecture field guide.`
- Support: `Look up the rule, see what it means, test what stuck, and know what to fix next.`
- CTA: `Open the field guide`
- Microcopy: `Built to support review centers — not replace them.`

### Copy rules

- Do not lead with SRS, active recall, adaptive algorithms, or quizzing methodology.
- Do not imply official authority or guaranteed passing.
- Fear marketing must always hand control back to the user.
- Review-center line should be supportive, not competitive.

---

## 6. Technology decision

### Use

- **R3F/Three.js** for the abstract architecture-evocative hero system. It does not need to be a literal floating architectural model; it can be a magical knowledge field, sheet stack, constellation, blueprint aurora, or other spatial metaphor.
- **Framer Motion** for tasteful DOM entrance, subtle stagger, and microinteractions. It is already installed (`framer-motion`).
- **CSS/Tailwind** for layout, hover, opacity, background layers, and reduced-motion variants.

### Do not use for this hero

- **Remotion** for the interactive hero. Remotion is for rendered video assets, not a live interactive landing proof. It could be considered later for social/video assets or a non-interactive background reel, but not now.
- **GSAP** unless a future scroll narrative truly requires it. It is unnecessary for this repair.

### Performance posture

- The 3D hero should be the only heavy above-the-fold element.
- Use `frameloop="demand"` where possible.
- No post-processing stack unless explicitly justified.
- Provide a reduced-motion/static fallback.

---

## 7. Acceptance criteria

### Visual

- No black container around the 3D visual.
- No dark opaque building mass in the light hero.
- Canvas is transparent and visually blends into the dotted-grid/background image.
- Background image is stronger than current, target ~75%, while copy remains readable.
- 3D object is larger, calmer, and more premium.
- No overlapping/z-fighting planes.
- Dotted/dashed guide lines replace slab-heavy geometry.

### Interaction

- Default to no explicit hero controls: ambient organization, cursor parallax, or one-time scattered-to-mapped motion.
- If a control is approved later, it must be a single purposeful interaction, not a mini tool.
- No preset buttons, toggles, radios, stats grid, eave controls, or mini dashboard.
- The primary story is scattered architecture knowledge → organized atlas → clear next action.
- Reduced-motion users get a static/non-drifting visual.

### Above-the-fold

- Secondary nav does not overlap or crowd the hero.
- Hero has one primary CTA and no duplicated Dashboard CTA.
- No four feature cards in the first viewport.
- Support copy is short enough to read at a glance.
- CTA and headline are visible on a 13-inch MacBook Pro viewport.

### Positioning/copy

- Uses `architecture knowledge atlas` / `architecture knowledge resource platform` framing.
- Positions SlateCamp as a resource and map first, not merely a study tool.
- Includes supplementary-review-center relationship without sounding defensive.
- No SRS/active-recall/quizzing-method jargon above the fold.
- No pass guarantees or official-source implication.

### Verification after implementation

- Browser visual QA at first viewport and full scroll.
- Console check.
- DOM landing tests.
- `bun run type-check`
- `bun run lint`
- `bun run build` after handling dev-server guard.
- Independent review with a different model/tool.

---

## 8. Recommended implementation scope after approval

Only after approval:

1. Rebuild `HeroCodeEnvelopeExplorer.tsx` as a floating frosted/dotted R3F object.
2. Simplify `HeroSection.tsx` above-the-fold content and move pillar cards below the hero.
3. Fix `MarketingNav`/`LandingPageContent` so secondary nav does not crowd `/` first viewport.
4. Remove duplicate Dashboard CTA from hero when Dashboard exists in nav.
5. Update tests to assert one slider, no preset buttons, no black/dark container, correct hero copy, and nav non-overlap behavior.
6. Run validation and visual QA.

---

## 9. Decision needed

Recommended direction for approval:

> **Proceed with the Atlas direction before implementation: SlateCamp as an `Architecture knowledge atlas`, with a transparent R3F `SlateCamp Atlas Field` visual — floating sheet stack + review constellation + dotted blueprint field. No black container, no mini-tool controls, no feature cards above the fold. Use existing R3F/Drei/Three/Framer stack first; consider `maath` only if motion smoothing needs it. Do not use Remotion, Spline, GSAP, Theatre.js, or postprocessing for the first live hero pass.**
