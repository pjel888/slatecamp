# Ralph Context Snapshot — Landing Page Focus Fix

## Task statement
User is dissatisfied with the SlateCamp landing page. Specific complaints: a “current waypoint” card/interaction does not make sense, a pause motion control is unnecessary, and the page needs sharper UX/UI focus.

## Desired outcome
Landing page should feel production-ready, calm, purposeful, and product-real: no confusing waypoint UI, no decorative pause control, clear educational startup value proposition, strong 3D background without unnecessary interaction chrome, verified in browser.

## Known facts/evidence
- Landing page is implemented under `src/components/landing/` and `src/app/page.tsx`.
- Prior iteration introduced a full-screen 3D scene and a visible “Pause motion” button.
- User explicitly rejects current waypoint-style affordances and pause control.
- SlateCamp UX guidance: coach-like, honest, purposeful, calm; every screen needs one primary job.

## Constraints
- Use Bun for scripts.
- Run GitNexus impact before editing functions/symbols.
- Follow Next.js App Router and design-system guidance.
- Keep changes MVP-focused and avoid new dependencies.
- Verify with browser, typecheck, lint, build, and diff checks.

## Unknowns/open questions
- Whether current local dev server matches latest working tree; inspect live page and source before editing.
- Whether any remaining waypoint copy exists in fallback/scene/content components.

## Likely codebase touchpoints
- `src/components/landing/CampLandingPage.tsx`
- `src/components/landing/HeroCampScene.tsx`
- `src/components/landing/CampSceneCanvas.tsx`
- `src/components/landing/LandingPageContent.tsx`
- `src/components/landing/LandingPageFallback.tsx`
- `src/components/marketing/MarketingNav.tsx`
