# SlateCamp Camp Landing Redesign Context

## Task Statement
Redesign and implement the SlateCamp landing page as a polished educational SaaS landing page with an interactive, lightweight 3D camp diorama narrative.

## Desired Outcome
- Home page remains a credible product landing page first.
- Hero includes a tasteful R3F/Three camp scene with campfire, mountains, trail, trees, lake, tent/cabin, and shore.
- Sections cover hero, interactive camp map/journey, features, how it works, use cases, social proof/trust placeholder, final CTA, and footer.
- Preserve existing app architecture, routes, SEO metadata, auth-aware CTA routing, and core SlateCamp LEA positioning.
- Provide responsive behavior, reduced-motion support, WebGL fallback, semantic HTML, and keyboard-accessible hotspot equivalents.

## Known Facts / Evidence
- `src/app/page.tsx` is a Server Component route that renders `LandingPageContent` inside `Suspense` with `LandingPageFallback`.
- The app is Next.js 16.2.3, React 19.2.5, Tailwind CSS 4, TypeScript, and already depends on `three`, `@react-three/fiber`, and `@react-three/drei`.
- Existing design tokens live in `DESIGN.md` and `src/app/globals.css`.
- Existing marketing composition lives under `src/components/landing` and `src/components/marketing`.
- `MarketingNav` already handles auth state through `getUserIfPresent`.
- `getUserIfPresent` is already used by `LandingPageContent`; preserve CTA behavior.
- GitNexus impact checks for `LandingPageContent`, `LandingPageFallback`, `HeroSection`, and `MarketingNav` returned LOW risk.
- Worktree is already dirty with unrelated admin/developer/entitlement changes; avoid touching those files.

## Constraints
- Use Bun for scripts.
- No new dependency unless necessary; R3F/drei/three already installed.
- Keep R3F hooks inside Canvas children.
- Use procedural/lightweight geometry, no heavy model assets.
- Respect `prefers-reduced-motion`; keep all important text in HTML.
- Keep WebGL failure fallback usable.
- Keep edits reviewable and scoped.

## Unknowns / Open Questions
- Whether full repo lint/build are currently clean given existing unrelated dirty worktree.
- Whether GitNexus index is fully up to date for new landing files that do not yet exist.
- Exact visual quality requires browser verification after implementation.

## Likely Codebase Touchpoints
- `src/components/landing/LandingPageContent.tsx`
- `src/components/landing/LandingPageFallback.tsx`
- New landing-specific camp components under `src/components/landing/`
- `src/components/marketing/MarketingNav.tsx`
- Possibly `src/components/landing/index.ts`
