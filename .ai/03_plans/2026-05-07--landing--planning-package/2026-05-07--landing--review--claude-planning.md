The `Write` tool isn't enabled in this context, and `ExitPlanMode` isn't either. Returning the plan inline as you requested.

---

# SlateCamp Landing Page — Implementation Plan (Compiled Review)

**Branch:** `feat/landing-3d-hero-best-representation`
**Gates:**
- `.ai/03_plans/2026-05-07-landing-page-final-messaging-gate.md`
- `.ai/03_plans/2026-05-07-hero-3d-interactive-diagram-plan.md`

## Context — why this work is needed

The current page treats SlateCamp as a board-exam-only readiness SaaS. The hero ("Know you'll win"), metadata ("only LEA prep platform built by a licensed architect"), bento grid (`Active Recall`, `IRT-Calibrated`, `EMA-Weighted`, `SM-2 Algorithm`, `Lucky Guess Detector`), `ComparisonSection` ("The old way. The better way."), and `SocialProofBar` ("Readiness Score powered by IRT") collectively violate the 2026-05-07 messaging gate: mechanism-first jargon above fold, review-center-replacement framing, unverified authority claims, `LEA` shorthand, generic dashboard background image, and 1-in-3-don't-pass fear with no immediate control.

The repo already has the right pieces — verified PD 1096 setbacks/zoning engine (`src/lib/pd1096/`) and R3F primitives (`WebGLErrorBoundary`, `CanvasLoadingOverlay`, `LoadingProgress`, `SceneInvalidator`) — but none are wired into marketing.

## 1) Highest-impact changes (ranked)

### TIER-1
1. **Replace hero visual with the Code Envelope Explorer.** Today the hero stages `/images/dashboard/Dashboard-BG-Image.png`. Phase A: static SVG/CSS isometric of Rule VIII 750mm eave/canopy/awning clearance + setback bands + buildable envelope. Phase B: dynamic-imported R3F canvas with `Eaves` / `Setbacks` layer toggles and plan/iso view, wrapped in `WebGLErrorBoundary` with `<Canvas frameloop="demand" dpr={[1,1.5]} fallback={…}>`. **Source guard:** setbacks come from `RESIDENTIAL_SETBACKS` / `COMMERCIAL_SETBACK_BANDS` in `src/lib/pd1096/zoningTables.ts`. The 750mm eave rule is **not** in the canonical engine — render as a labeled IRR Rule VIII educational overlay.
2. **Rewrite hero copy + strip rough-notation in `HeroHeadline.tsx`.** Headline → `Your architecture study companion.`, subhead per gate §2.1, eyebrow → `Architecture learning platform`, `aria-label` per §2.3, replace `STATS` with the four pills (Source-backed explanations / Licensure Examination for Architects readiness map / Interactive 3D lab / Free architecture tools), add secondary CTA `Explore Free Tools` → `ROUTES.calculators.root`. The rough-notation `useEffect` in `HeroHeadline` is tied to "Know you'll win" tokens — strip the entire effect/refs block.
3. **Replace metadata in `src/app/page.tsx`** verbatim per gate §3 (title, description, OG, Twitter, keywords). Drop `built by a licensed architect`, `spaced repetition architecture exam`, `LEA practice test`, `how to pass LEA Philippines`. Spell out `Licensure Examination for Architects`.
4. **Reframe `BentoFeatureGrid.tsx` to four pillars.** Cards `Active Recall`, `IRT-Calibrated`, `EMA-Weighted`, `Taxonomy heatmap`, `SM-2 Algorithm`, `Lucky Guess Detector`, `Trust the camp` quote, `1 in 3` stat block all violate §2.2/§5/§10. Replace with Knowledge Resources / Quizzes / 3D Lab / Free Tools.
5. **Convert `ComparisonSection.tsx` to companion stance.** Headline `The old way. The better way.` and the `₱15,000 – ₱30,000` / `Metro Manila-heavy` rows attack review centers — gate §8 forbids. Replace with the gate §8.2 copy (`Review centers teach. SlateCamp helps you check what stuck.`) and a four-bullet "after lecture / after mock exams / during self-study / before exam day" grid.

### TIER-2
6. **`WikiSection.tsx` → Knowledge Resources** with a tabbed/searchable mini article preview, source trail, related-quiz/3D links. CTA `Browse Free Knowledge Resources` routes to `ROUTES.auth.register` with honest `free after signup` copy.
7. **`QuestionsSection.tsx`** — drop `2,400+ questions … verified by licensed architects` (unverified count + authority claim). Reframe per gate §5.2. If a slide-to-submit interaction is added, keep an accessible `Submit answer` button as fallback.
8. **`ThreeDLabSection.tsx`** — reframe to "see spatial rules, not just numbers"; reuse the same setbacks motif as the hero for coherence.

### TIER-3
9. **`AnalyticsSection.tsx`, `HowItWorksSection.tsx`** — translate analytics + the `Camp / Storm / Review` step copy out of mechanism-speak into readiness-map language.
10. **`SocialProofBar.tsx`, `LandingPageFallback.tsx`, `MarketingFooter.tsx`, `FinalCtaSection.tsx`** — `SocialProofBar` currently reads `Readiness Score powered by IRT`; soften. `LandingPageFallback` imports `LogoMarquee`/`TestimonialShowcase` (not in the live page) and uses `Join the Camp — Free` — must mirror live tree or Suspense flicker exposes stale copy. Footer needs the gate §10.1 short disclaimer.

## 2) Implementation sequence (5 phases)

**Phase 1 — Copy + metadata only (no visuals).** `src/app/page.tsx` metadata, hero copy, `HeroHeadline` strip rough-notation, `SocialProofBar`, `BentoFeatureGrid` text-only first pass, `QuestionsSection`/`WikiSection`/`ThreeDLabSection`/`AnalyticsSection`/`HowItWorksSection`/`ComparisonSection`/`FinalCtaSection`, `LandingPageFallback` parity, `MarketingFooter` disclaimer.

**Phase 2 — Hero static visual (Code Envelope Explorer Phase A).** Create `src/components/marketing/hero/HeroCodeEnvelope.tsx`, `HeroCodeEnvelopeFallback.tsx` (static SVG isometric), `heroCodeEnvelopeData.ts` (presets sourced from `src/lib/pd1096/zoningTables.ts`). Replace background-image stage with the new component rendering the fallback as default.

**Phase 3 — R3F progressive enhancement (Phase B).** Create `HeroCodeEnvelopeCanvas.tsx` (`'use client'`, `dynamic(...{ ssr: false })`) and `HeroCodeEnvelopeScene.tsx` (primitives only). Wrap in `WebGLErrorBoundary`. Honor `prefers-reduced-motion`. Mobile stays on fallback by default. **Do not import** `CanvasWrapper`, `NBCPEnvelope`, `DevControlsLabV2`, `useNBCPStore`, `useDevControlsStore` — hero state stays local.

**Phase 4 — Reshuffle section order in `LandingPageContent.tsx`** (and mirror in `LandingPageFallback`) per gate §4: Nav → Hero → SocialProofBar → BentoFeatureGrid → LEA pathway block → WikiSection (Knowledge) → ThreeDLabSection → QuestionsSection → AnalyticsSection → ComparisonSection (companion) → HowItWorksSection → FinalCtaSection → Footer.

**Phase 5 — Verification + cleanup.** Full triage per acceptance criteria.

## 3) Pitfalls

- **Rough-notation refs blow up if you only swap the headline string.** `winRef.current` will be null. Strip the entire `useEffect` + refs in `HeroHeadline.tsx`.
- **`LandingPageFallback.tsx` divergence.** It imports `LogoMarquee` + `TestimonialShowcase` that the live page doesn't render and uses `Join the Camp — Free`. Suspense will briefly show stale copy unless updated in Phase 1.
- **Don't import 3D Lab shell into the hero.** `useNBCPStore`/`useDevControlsStore`/`CanvasWrapper` are dashboard infra; the 3D plan §8 explicitly forbids reuse.
- **750mm eaves rule is not in the canonical engine.** No matches for `eaves|canopies|awnings|750` in `src/lib/pd1096/`. Render as labeled Rule VIII educational overlay; only setbacks are engine-backed.
- **`BentoFeatureGrid` `1 in 3` stat is fear marketing without immediate control.** Either drop it or pair directly with the free Readiness Score CTA card.
- **`ComparisonSection` cost row.** Removing `₱15,000 – ₱30,000` shrinks the table. Replace with the §8.2 four-bullet companion grid; don't backfill new attack-adjacent rows.
- **CTA honesty.** Wiki + 3D Lab routes are dashboard-gated. Use `free after signup` / `preview` / `create a free account`. `ROUTES.calculators.root` (`/tools`) is genuinely public, so `Open Free Tools` is honest.
- **`MarketingNav` anchors.** `#features` and `#how-it-works` are referenced in `SECONDARY_NAV_LINKS`; preserve the IDs after Phase 4 reshuffle.
- **Mandatory blast-radius triad** before edits per root `CLAUDE.md` §19: GitNexus impact, code-review-graph minimal context + impact radius, ChunkHound corroboration. Marketing tree is low-risk but `LandingPageFallback`, `MarketingNav`, `ROUTES` are imported elsewhere.
- **No raw `[SLATECAMP_UI_BLOCK:...]` placeholders** must reach production.
- **Storybook check.** No marketing stories in scope today, but if any are added run `bun run check:storybook`.

## 4) Acceptance criteria

**Copy + metadata**
1. Hero uses `Your architecture study companion.` (or a documented gate §11 A/B variant).
2. First-scroll copy contains zero of: `SRS`, `SM-2`, `IRT-Calibrated`, `EMA-Weighted`, `Active Recall`, `Taxonomy heatmap`, `Lucky Guess Detector`, `cognitive-first`. Mechanism words appear only in deeper sections, translated.
3. Public exam references spell out `Licensure Examination for Architects`. `LEA` only in metadata keywords.
4. Removed: `built by a licensed architect`, `only LEA prep platform`, `2,400+ questions`, `verified by licensed architects`, `Trust the camp` quote. `1 in 3` stat removed or paired with immediate-control CTA.
5. `ComparisonSection` reads as companion stance; cost + Metro Manila rows removed.
6. `LandingPageFallback` matches `LandingPageContent` section set + CTAs.

**Visual proof**
7. Hero shows a Rule VIII / setback visual (static minimum). No `Dashboard-BG-Image.png`.
8. Setback values trace to `RESIDENTIAL_SETBACKS` / `COMMERCIAL_SETBACK_BANDS`. 750mm eave is labeled IRR Rule VIII educational preview.
9. Disclaimer `For study and visualization only. Verify…` near hero card or footer.
10. `WikiSection` shows interactive (or at minimum tabbed) preview, not the static firewall card.

**CTAs + routing**
11. Primary CTA → `ROUTES.auth.register` (logged-out) or dashboard (logged-in).
12. Secondary CTA `Explore Free Tools` → `ROUTES.calculators.root`.
13. Wiki/3D Lab CTAs use honest `free after signup` / `preview` copy.

**Technical + a11y**
14. R3F canvas wraps in `WebGLErrorBoundary`, uses `frameloop="demand"`, dynamic-imports with `ssr: false`, fallback verified WebGL-disabled.
15. `prefers-reduced-motion` disables camera animation + flourishes.
16. Hero state changes reachable by keyboard with visible focus.
17. No `[SLATECAMP_UI_BLOCK:...]` placeholders in rendered HTML.

**Build gates**
18. `bun run type-check`, `bun run lint`, `bun run build` clean.
19. If PD 1096 logic touched: `bun test src/lib/pd1096/__tests__/computationEngine.test.ts` clean.

## Files (paths only)

**Modify:** `src/app/page.tsx` · `src/components/landing/LandingPageContent.tsx` · `src/components/landing/LandingPageFallback.tsx` · `src/components/marketing/HeroSection.tsx` · `HeroHeadline.tsx` · `BentoFeatureGrid.tsx` · `QuestionsSection.tsx` · `ThreeDLabSection.tsx` · `WikiSection.tsx` · `AnalyticsSection.tsx` · `HowItWorksSection.tsx` · `ComparisonSection.tsx` · `FinalCtaSection.tsx` · `SocialProofBar.tsx` · `MarketingFooter.tsx`

**Create (Phase 2 + 3):** `src/components/marketing/hero/{HeroCodeEnvelope,HeroCodeEnvelopeFallback,HeroCodeEnvelopeCanvas,HeroCodeEnvelopeScene}.tsx` · `heroCodeEnvelopeData.ts`

**Reuse (do not modify):** `src/lib/pd1096/zoningTables.ts` (`RESIDENTIAL_SETBACKS`, `COMMERCIAL_SETBACK_BANDS`, `CITATIONS`) · `src/lib/pd1096/computationEngine.ts` (only if controls strip added) · `src/components/r3f/{WebGLErrorBoundary,CanvasLoadingOverlay,LoadingProgress,SceneInvalidator}.tsx` · `src/components/marketing/{FeatureSectionLayout,LandingPrimitives}.tsx` · `src/lib/routes.ts`

---

Note: the plan-mode workflow expected me to write `/Users/philiplewis/.claude/plans/slatecamp-landing-page-implementation-compiled-bee.md` and then call `ExitPlanMode`, but neither tool is enabled in this context. If you want this persisted to that path, run me again outside plan mode (or with Write enabled) and I'll save it verbatim.
