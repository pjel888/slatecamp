# 05 — QA and Acceptance Gates

Date: 2026-05-08
Status: implementation verification contract

## Acceptance scoring

Before production implementation is accepted:

- Hero not carded: **pass/fail**
- No right-side hero 3D module: **pass/fail**
- Positioning clarity within five seconds: **≥ 9/10**
- Hero visual quality: **≥ 9/10**
- Legal/product safety: **≥ 9/10**
- Technical reliability: **≥ 9/10**
- Mobile first viewport: **≥ 8/10**
- Copy fit for target market: **≥ 9/10**
- Reduced-motion/WebGL-denied experience: **≥ 8/10**

## Automated command gates

Run after implementation:

```bash
bun run type-check
bun run lint
bunx vitest run tests/vitest/components/marketing/landing-page-surface.test.tsx
bun run build
```

If a dedicated hero/product-path test is added, run it explicitly too.

If `HeroCodeEnvelopeExplorer` survives as a below-fold proof component, update and run its test. If removed, delete the stale test.

## Browser QA matrix

Use Playwright/browser inspection for:

- desktop wide
- 13-inch laptop height
- tablet width
- mobile 375/390px
- logged-out home
- logged-in home if auth state can be simulated safely
- reduced motion
- forced WebGL denied
- keyboard tab navigation
- full scroll

For each viewport/state, verify:

- page returns 200
- H1 is visible above fold
- selected headline appears exactly or intentionally close: `Find where it fits. Know what to revisit.`
- primary CTA visible above fold
- no secondary nav overlap or clipping
- no huge blank colored sections
- no invisible/reveal-hidden content
- no console errors
- no hydration errors
- no WebGL uncaught errors
- product proof appears below hero, not inside hero card
- trust boundary appears before final CTA/footer

## Copy/legal sweep

Sweep public landing/acquisition files for these terms and classify any match:

```bash
git grep -n -i -E 'SRS|spaced repetition|active recall|IRT|adaptive algorithm|pass probability|guarantee|guaranteed readiness|official|certified|certify|outcome prediction|prediction|mastery engine|diagnostics engine|AI-powered|primary instruction|Pokedex|Pokédex|Setback Explorer|review center|JPT|CDEP|TopLab|APR' -- src/app/page.tsx src/app/about src/app/contact src/app/pricing src/components/marketing src/lib/constants/site.ts src/lib/constants/pricing.ts
```

Expected outcome:

- no mechanism-first terms in public acquisition copy
- no public internal Pokedex metaphor
- no named adjacent-institution/competitor terms
- no guarantee/official implication
- any `Setback Explorer` match is intentionally below-fold or removed
- any `review center` phrase is boundary-safe and not competitor-comparison/attack copy; prefer avoiding the exact phrase in public if possible

## Route honesty checks

Verify CTA destinations:

- `Open the atlas` logged-out → honest signup/free account or public preview
- `Open the atlas` logged-in → dashboard wiki/resource surface
- `Find a topic` → actual search/topic/resource route
- `Open free tools` → public tools/calculator route
- no CTA promises full visual lab access unless account/entitlement permits it

## Accessibility gates

- all critical hero copy is DOM text
- Canvas is decorative or properly labelled
- no essential information is Canvas-only
- focus rings visible
- keyboard order: nav → hero primary CTA → secondary CTA → first below-fold controls/links
- mobile tap targets at least 40px, 44px preferred
- no tiny metadata required for comprehension on mobile

## Performance gates

- no heavy idle animation loop if WebGL is used
- reduced-motion fallback renders without animated Canvas
- forced WebGL-denied fallback looks intentional
- hero does not layout shift when fallback appears
- no postprocessing stack in first pass unless explicitly approved
- no public debug controls

## Independent review prompts

### Design/brand reviewer

Check whether the implementation truly feels like an editorial architecture atlas and not a SaaS dashboard, hero card, bento feature tour, or WebGL demo.

### Copy/legal reviewer

Check whether public copy leads with assurance, clarity, and source-aware support; reject mechanism-first, official, guaranteed, or primary-instruction-replacement claims.

### Technical QA reviewer

Check route honesty, fallback behavior, WebGL/reduced-motion, mobile nav, console errors, and tests.

## Readiness failure conditions

Implementation is not accepted if:

- hero has a rounded 3D/card module
- Board 1 atmosphere becomes the protagonist
- category is unclear in five seconds
- hero copy leads with product mechanisms
- public copy implies official authority or guaranteed outcomes
- visual lab access is overstated
- browser QA shows blank/clipped sections
- reduced-motion or WebGL-denied state throws errors
- tests pass but visual QA fails
