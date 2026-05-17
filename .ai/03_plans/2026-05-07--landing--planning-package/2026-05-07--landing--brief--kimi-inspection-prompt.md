# Kimi inspection request — SlateCamp current landing hero

You are Kimi acting as an external senior landing-page UX/UI and Three.js hero reviewer.

Repository: `/Users/philiplewis/slatecamp`
Branch: `feat/landing-3d-hero-best-representation`

IMPORTANT:
- Research/review only. Do not edit files.
- The user is angry because the current hero feels bad and implementation happened before enough design research.
- Be blunt, specific, and actionable.
- Focus on above-the-fold, hero copy, nav, CTA hierarchy, 3D visual integration, and public landing suitability.

Current browser/vision evidence from local `http://localhost:3000/`:
- The hero has top nav, centered secondary nav, eyebrow, huge headline, two support paragraphs, Dashboard CTA, Explore Free Tools CTA, reassurance line, 3D setback demo, one slider plus preset buttons, and four feature cards all visible above/near first fold.
- The 3D object appears dark/black, visually heavy, and does not blend with the dotted-grid + image background.
- The 3D scene feels like an embedded tool/demo thumbnail, not an art-led floating architectural object.
- The secondary nav visually competes with the hero and feels inserted into the hero zone.
- Dashboard appears both in top nav and hero CTA.
- Copy is too dense and mechanism/product-explanation heavy.
- User wants: artistic + 3D, dotted lines, frosted translucent backgrounds, small rounded corners, excellence, creative direction based on references like infinitefield.xyz, matter.com, save.design, atuin.media/en, oci.madebybuzzworthy.com.
- User wants SlateCamp as an architecture knowledge/resource platform and supplementary buddy/Pokedex beside JPT/CDEP/review centers — not a primary reviewer center, not a learning-science/SRS pitch.

Attached files to inspect:
- `src/components/landing/LandingPageContent.tsx`
- `src/components/marketing/MarketingNav.tsx`
- `src/components/marketing/HeroSection.tsx`
- `src/components/marketing/hero/HeroCodeEnvelopeExplorer.tsx`
- `src/components/graphics/tokens.ts`
- `.ai/02_audits/2026-05-05-landing-page-audit.md`
- `.ai/03_plans/2026-05-07-landing-hero-3d-repair-brief.md`
- `DESIGN.md`

Return a concise markdown report with:
1. Severe current problems, ranked P0/P1/P2.
2. The correct creative direction for the hero.
3. Whether Framer Motion, GSAP, Remotion, R3F/Three.js, or plain CSS should be used, and why.
4. What to remove from above-the-fold.
5. What the 3D object should be visually and behaviorally.
6. Concrete acceptance criteria for a repaired hero.
7. Any warnings against overbuilding.
