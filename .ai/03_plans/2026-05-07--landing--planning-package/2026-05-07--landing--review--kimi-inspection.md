[0m
> ​Sisyphus - Ultraworker · kimi-k2.6
[0m
# Kimi Review: SlateCamp Landing Hero
**Branch:** `feat/landing-3d-hero-best-representation`
**Scope:** Above-the-fold only. No file edits.

---

## 1. Severe Current Problems

### P0 — Ship-blocking
1. **Secondary nav collides with the hero.** `MarketingNav` renders a `h-28` secondary nav by default, and `LandingPageContent.tsx` never passes `showSecondaryNav={false}`. The result is a crowded chrome bar sitting *inside* the hero zone, pushing the eyebrow and 3D visual down and creating claustrophobia immediately.
2. **Above-the-fold is a feature dump, not a hero.** In one viewport the user sees: eyebrow, headline, **two** paragraphs, **two** CTAs, a reassurance line, a 3D control panel, **three** preset buttons, a slider, a status badge, **and** four feature cards. This is a dashboard, not a landing page. It destroys hierarchy and signals "tool" instead of "platform."
3. **The 3D object is visually hostile.** The building mass uses `palette.inkPrimary` (`#1A2332`) — an opaque, heavy black void — on a light-grey lot slab (`#F5F5F5`). It looks like an embedded CAD thumbnail fighting the dotted-grid background, not a floating architectural study model. The red violation lines and blue guide lines add to the "engineering software" vibe.
4. **Copy sells mechanisms, not assurance.** "Visual guides, cited explanations, quizzes, and practical tools in one calm place" is a feature list dressed as a sentence. It tells the user *what* the product has, not *why* they will feel less anxious about the LEA.

### P1 — Serious
5. **"Dashboard" appears twice above the fold.** Once in the top nav CTA ("Dashboard") and once implicitly via the hero primary CTA for logged-in users. This is confusing and reduces the perceived specificity of the product.
6. **Four pillar cards (`PLATFORM_PILLARS`) destroy the hero grid.** They turn the bottom of the hero into a bento feature tour before the user has even understood the promise. They must leave the first viewport.
7. **3D preset buttons are chrome.** "Safe width," "Cross setback," "Beyond lot" are training wheels for a landing page. The slider alone should tell the story; these buttons add UI density and imply the user needs a tutorial to understand the visual.
8. **Background image + gradient + orb + dotted grid + noise + dark 3D = visual mud.** There are too many competing layers. The background image is decorative but the gradient overlay is too weak to guarantee text contrast, and the dark 3D object sits on top like a hole in the page.

### P2 — Polish
9. **Headline is soft.** "Your architecture study companion" is accurate but forgettable. The audit already identified stronger options ("Know you'll win," "Stop studying blind") that convert fear into confidence.
10. **Reassurance line hedges.** "Free after signup where needed" sounds like a Terms of Service clause, not a friction reducer.
11. **3D scene lacks reduced-motion rigor.** The `motion-safe` classes are on the text, but the R3F scene has no equivalent static fallback for users who prefer reduced motion.

---

## 2. Correct Creative Direction for the Hero

The hero must feel like an **architectural atelier** — quiet, spatial, and materially aware — not a SaaS dashboard or a review-center LMS.

**Vibe:** A single floating study model resting in negative space. Think Mies van der Rohe sketch, not AutoCAD screenshot. The references you cited (infinitefield.xyz, matter.com, save.design) share a common language: **restraint, generous whitespace, frosted/translucent materials, and dotted linework.**

**Composition:**
- **Left:** Calm, large typography. One headline, one subheadline, one button. Nothing else.
- **Right:** The 3D artifact floats alone. No container, no panel, no background card. It breathes.
- **Background:** The landscape image stays but must be quieter (lower contrast, higher blur/overlay). The dotted grid should feel like graph paper, not a UI element.

**Color & Material:**
- Building mass: **Translucent frosted white** or very light grey (`rgba(255,255,255,0.7)`), not opaque black. It should feel like a ghosted massing model.
- Lot boundaries: **Dotted or dashed lines**, extremely faint (`opacity: 0.25`), architectural parti style.
- Setback violations: A **subtle warm glow or outline shift** (amber/cobalt), not aggressive CAD red.
- No solid ground plane slab. The lot is implied by lines.

**Copy Tone:**
- Stop describing features. Start naming the emotional state.
- Bad: "A reliable buddy for architecture school..."
- Good: "Know you'll win." / "Stop studying blind."

---

## 3. Technology Choice

| Tech | Verdict | Reason |
|------|---------|--------|
| **R3F / Three.js** | ✅ **Keep** | You need a transparent WebGL canvas with a custom architectural mesh. This is the right tool. Do not replace it with CSS 3D transforms — you will lose the material quality. |
| **Framer Motion** | ⚠️ **Sparingly** | Use only if you need orchestrated entrance timing (staggered text, slider fade-in). For simple hover/fade, use CSS. |
| **GSAP** | ❌ **Reject** | Overkill for a single hero. Adds bundle weight and complexity for scroll-triggered nonsense you do not need. |
| **Remotion** | ❌ **Reject** | This is for video generation. Completely inappropriate. |
| **Plain CSS** | ✅ **Default** | Text animations, layout, and hover states should be CSS-first. The `motion-safe` Tailwind variants are already in place — use them. |

**Rule:** The 3D is the only "heavy" thing allowed in the hero. Everything else must be DOM/CSS.

---

## 4. What to Remove from Above-the-Fold

Remove **all** of the following from the first viewport:

1. **Secondary nav** on the home route.
2. **Second support paragraph** in `HeroSection` ("Use it beside your review center...").
3. **"Explore Free Tools" secondary CTA.** One primary CTA only. If you must have a secondary action, make it a quiet text link below the button, not a second button.
4. **The four `PLATFORM_PILLARS` cards.** They are a feature catalog. Move them to a "What you get" section below the fold, or delete them from the landing page entirely (the bento grid already covers this).
5. **3D preset buttons** ("Safe width", "Cross setback", "Beyond lot").
6. **The long reassurance line.** Replace with a single microcopy string: "Free after signup · No card required."
7. **The thick grey lot slab mesh.** Replace with dotted lines or remove entirely.
8. **Buildable envelope mesh and thick setback lines** from the 3D scene.

---

## 5. What the 3D Object Should Be

**Visually:**
- A **single translucent mass** (the building) floating slightly above an invisible ground plane.
- **Dotted or dashed rectangular lot boundary** on the "floor," very faint.
- **Subtle contact shadow** beneath the mass so it feels grounded, not hovering in space.
- **No solid colors.** The mass should be frosted glass / white-translucent. When the slider pushes it past the setback, it should emit a **soft amber edge glow** or shift to a faint warm tint — not flash red.
- **No labels, no HTML overlays, no stats badges** inside or on top of the canvas. The 3D object is a visual poem, not a UI component.

**Behaviorally:**
- **Static camera.** No orbit, no zoom, no pan. The user should not be able to "look around" because this is not a product demo; it is a proof of spatial intelligence.
- **One control:** the width slider. As the slider moves, the building mass grows horizontally. The only feedback is the visual change of the mass relative to the dotted lot lines and the subtle glow.
- **No animation loop waste.** Keep `frameloop='demand'` and invalidate only on slider change.

---

## 6. Concrete Acceptance Criteria

- [ ] **Secondary nav is absent** on `LandingPageContent.tsx` (`showSecondaryNav={false}` passed to `MarketingNav`).
- [ ] **Hero grid is spacious.** Left column contains: eyebrow (1 line), headline (max 2 lines), subheadline (max 2 lines), **one** primary CTA button, **one** microcopy trust line (≤10 words). Nothing else.
- [ ] **Right column contains only the R3F `<Canvas>`**. No surrounding divs with borders, backgrounds, or padding that create a "panel" effect.
- [ ] **3D building material is light and translucent.** Hex value must not be `#1A2332` or similar dark opaque color. Use `rgba(255,255,255,0.6–0.85)` or equivalent `meshPhysicalMaterial` with `transmission`.
- [ ] **Lot is dotted lines only.** No `boxGeometry` slab for the lot surface. Remove the grey floor plate.
- [ ] **Setback/violation indicators are subtle.** Dotted lines at low opacity; violation state uses glow/outline, not `#D64545` fill.
- [ ] **Canvas is transparent.** `alpha: true`, clear color matches page background or is fully transparent. No black or dark canvas background.
- [ ] **Slider is the sole interactive control.** It sits **below** the canvas or to the left, never overlaid on the 3D scene.
- [ ] **Hero top padding accounts for primary nav only.** `pt-24` or `pt-28`, not `pt-44`.
- [ ] **Headline is emotionally direct.** Either "Know you'll win." or "Stop studying blind." — not "Your architecture study companion."
- [ ] **No feature cards, no pillar lists, no secondary CTA button** in the first viewport.
- [ ] **Text contrast passes WCAG AA** over the background image (verify with a contrast checker).
- [ ] **Reduced motion:** If `prefers-reduced-motion` is active, the 3D scene is static (no idle rotation, no ambient drift).

---

## 7. Warnings Against Overbuilding

1. **This is a visual metaphor, not a tool.** Do not add zoning class toggles, eave projection controls, storey height inputs, or buildable-area statistics to the hero. The repair brief from 2026-05-07 is correct: one slider, one story. Resist the urge to "finish" the parametric engine here.
2. **No post-processing.** Do not add `EffectComposer`, bloom, DOF, or SSAO to the R3F scene. It will look like a video game, kill mobile performance, and violate the "calm" design standard.
3. **No scroll-jacking or scroll-triggered animations.** Do not install GSAP ScrollTrigger or Framer Motion scroll variants. The page scrolls normally. The hero is static after entrance.
4. **Do not add a second 3D scene elsewhere on the page.** The `ThreeDLabSection` already exists. Fix this one hero scene first.
5. **Do not redesign the entire landing page.** Scope lock to the hero and nav only. The body sections (Bento, Questions, etc.) are a separate problem.
6. **Art comes from restraint, not effects.** The "excellence" you want is achieved by removing elements, not adding shaders. If the 3D object requires more than ~150 lines of R3F code, it is too complex.

**Bottom line:** The hero currently looks like a dashboard widget. It needs to look like a thought. Remove 70% of the elements, lighten the 3D object, and let the negative space do the work.
