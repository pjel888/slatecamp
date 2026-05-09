# 04 — Implementation Handoff Plan

Date: 2026-05-08
Status: ready for production implementation planning, no code changes in this artifact

## Definition of done for the production pass

The production implementation is done only when:

1. the public landing hero is Board 2-led editorial atlas, not WebGL-led;
2. Board 1 atmosphere exists only as supportive visual depth;
3. Board 3 product proof appears below the hero as truthful product paths;
4. target-market copy leads with assurance, clarity, reliability, and less pangangapa;
5. public copy avoids mechanism-first language and outcome guarantees;
6. route/CTA wording is honest for logged-out and logged-in users;
7. full browser QA passes across desktop, laptop, tablet, mobile, reduced motion, and WebGL-denied states;
8. tests/lint/typecheck/build pass or documented pre-existing blockers are isolated.

## Current branch reality

The branch contains a committed prototype:

- `e966e4328 feat(landing): checkpoint atlas hero prototype before composition pass`

That prototype is useful as reference, but it is not the final approved composition.

Implementation must treat it as disposable/refactorable. Do not preserve it just because it already passes tests.

## Likely affected files

### Core route and landing shell

- `src/app/page.tsx`
  - metadata and category copy
  - ensure no old mechanism-first value proposition remains

- `src/components/landing/LandingPageContent.tsx`
  - section order
  - logged-in/logged-out CTA routing
  - home-specific nav behavior

- `src/components/landing/LandingPageFallback.tsx`
  - must match the main landing composition enough to avoid fallback drift

### Hero and nav

- `src/components/marketing/HeroSection.tsx`
  - main rewrite target
  - Board 2 DOM-led hero layout
  - use selected headline: `Find where it fits. Know what to revisit.`
  - keep critical copy in DOM

- `src/components/marketing/hero/AtlasFieldHero.tsx`
  - refactor into Board 1 atmosphere only, or replace with simpler atmospheric layer
  - remove floating product labels if they read as UI pills
  - keep WebGL optional and non-critical

- `src/components/marketing/MarketingNav.tsx`
  - hide secondary nav on home if it crowds first viewport
  - ensure no duplicate Dashboard CTA above fold

- `src/components/marketing/LandingPrimitives.tsx`
  - possible shared editorial primitives: section number, coordinate line, source note, path row

### Product proof sections

- `src/components/marketing/BentoFeatureGrid.tsx`
  - likely replace bento emphasis with indexed path field or move bento lower if retained

- `src/components/marketing/WikiSection.tsx`
  - make this the strongest Board 2 proof: field guide, source-aware notes, related topics

- `src/components/marketing/QuestionsSection.tsx`
  - copy: practice checks what stayed; mappings where available
  - avoid absolute claims such as every miss becoming a guaranteed repair path

- `src/components/marketing/ThreeDLabSection.tsx`
  - remove or demote `Setback Explorer` language unless intentionally below-fold
  - add access/entitlement-safe caveat
  - avoid `full lab after signup` unless product entitlement proves it

- `src/components/marketing/AnalyticsSection.tsx`
  - readiness signals as study guidance, not prediction

- `src/components/marketing/HowItWorksSection.tsx`
  - align to find → understand → check → revisit

- `src/components/marketing/ComparisonSection.tsx`
  - keep value transformation, avoid adjacent-institution attack language

- `src/components/marketing/SocialProofBar.tsx`
  - use reassurance/trust strip, not unsupported social proof

- `src/components/marketing/FinalCtaSection.tsx`
  - one final CTA, route-honest microcopy

- `src/components/marketing/MarketingFooter.tsx`
  - trust boundary copy

### Legacy/prototype cleanup

- `src/components/marketing/hero/HeroCodeEnvelopeExplorer.tsx`
  - no longer hero direction
  - either delete if unused, or rename/refactor into below-fold visual-tool proof

- `tests/vitest/components/marketing/hero-code-envelope-explorer.test.tsx`
  - delete/replace if component is removed or renamed

- `tests/vitest/components/marketing/landing-page-surface.test.tsx`
  - update expectations to Board 2-led editorial atlas

### Public acquisition copy sweep

Include:

- `src/app/about/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/pricing/page.tsx`
- `src/app/pricing/pricing-content.tsx`
- `src/lib/constants/pricing.ts`
- `src/lib/constants/site.ts`
- `src/components/marketing/FaqSection.stories.tsx`
- `src/components/marketing/HeroHeadline.tsx`
- `src/components/marketing/LogoMarquee.tsx`
- `src/components/marketing/TestimonialShowcase.tsx`

These were touched by the prototype and must not drift from the corrected positioning.

## Proposed component architecture

### Option A — preferred first implementation

- `HeroSection.tsx` owns the Board 2 DOM editorial layout.
- `AtlasFieldHero.tsx` becomes `AtlasAtmosphere` or similar, rendered as decorative background/ambient layer.
- Product paths become an indexed row/field component, not cards.
- Landing primitives expose:
  - `SectionIndex`
  - `CoordinateNote`
  - `PathRow`
  - `BoundaryNote`

Benefits:

- lower risk than rebuilding the whole page system
- keeps existing routes and tests close
- makes the rejected prototype clearly subordinate

### Option B — stronger refactor if time permits

- Create new marketing components:
  - `EditorialAtlasHero.tsx`
  - `AtlasAtmosphere.tsx`
  - `LandingProblemField.tsx`
  - `ProductPathField.tsx`
  - `TrustBoundaryField.tsx`
- Retire or move older bento/hero mini-tool components.

Benefits:

- cleaner long-term architecture
- less risk of old hero code leaking into the new direction

Risk:

- bigger diff; must be reviewed carefully.

## CTA routing rules

Primary CTA:

- public label: `Open the atlas` or `Start free`
- logged-out route: signup/register if atlas is gated
- logged-in route: dashboard wiki/resource entry point

Secondary CTA:

- `Find a topic` only if it goes to a real topic/search/resource route
- `Open free tools` only if it goes to public tools/calculators

Avoid:

- `Get a free readiness check` unless a real diagnostic/readiness route is the destination
- `Create a free account for the full lab` unless entitlement/access supports it

## Copy implementation contract

Use:

- architecture knowledge atlas
- field guide
- source-aware / source notes where verified
- visual explanations where available
- practice paths
- weak-topic signals
- less pangangapa
- clearer next step

Avoid in public hero/acquisition copy:

- SRS
- active recall
- adaptive algorithm
- pass probability
- official
- guaranteed readiness
- primary instruction replacement
- public Pokedex language
- named competitors or institutions

## Technical implementation contract

WebGL/Three/R3F should be optional.

If using R3F:

- critical copy remains DOM
- use `frameloop="demand"` where possible
- cap DPR, e.g. `[1, 1.5]`
- no postprocessing stack in first pass
- no public Leva controls
- no canvas-only text necessary for comprehension
- preflight WebGL support before mounting Canvas
- graceful static fallback with same layout dimensions
- reduced-motion state should not mount animated canvas if avoidable

## Implementation order

1. Refactor hero hierarchy first.
2. Hide/adjust home secondary nav.
3. Convert product proof to indexed path fields.
4. Rewrite copy using selected headline/support/CTA contract.
5. Sweep public acquisition pages and pricing constants.
6. Update/replace tests to assert new direction and forbidden copy.
7. Run automated gates.
8. Run browser QA matrix.
9. Independent review.
10. Commit/push implementation in logical groups.

## Implementation blockers now resolved

- final headline selected
- static composition artifact created
- file-level implementation map defined
- product-truth caveats defined
- copy/legal guardrails defined
- QA matrix defined
- current prototype status classified as disposable/reference code
