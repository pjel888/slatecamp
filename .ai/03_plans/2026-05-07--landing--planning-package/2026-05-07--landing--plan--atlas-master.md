# SlateCamp Atlas Landing Master Plan

> **For Hermes:** Planning-only artifact. Do not implement production code from this document until Philip approves the Atlas direction and the current rejected/unwanted code diff is cleaned or isolated.

**Goal:** Rebuild the landing-page direction around SlateCamp as an architecture knowledge atlas/resource platform, with Licensure Examination for Architects readiness as a pathway rather than the entire brand identity.

**Architecture:** Use a single hero visual system — the SlateCamp Atlas Field — to unify three compatible directions: Atlas/resource, fear-to-clarity, and companion/Pokedex-style field guide. Keep the first viewport calm, then prove the offer through resources, quizzes, 3D Lab, tools, readiness, confidence, and practical next steps below the fold.

**Tech Stack:** Existing Next.js 16 / React 19 / Tailwind / R3F / Three / Drei / Framer Motion, with `maath` approved for smooth damped motion in the R3F hero.

---

## 1. Final strategic positioning

### Replace the main public category

Do not lead with:

> SlateCamp is a study tool.

Lead with:

> **SlateCamp is an architecture knowledge atlas.**

Expanded:

> **A source-backed architecture knowledge atlas with resources, visual explanations, quizzes, 3D labs, and practical tools for school, board-review season, and practice context.**

### Keep board-review conversion, but demote it from brand ceiling

Licensure Examination for Architects readiness is still the highest-intent conversion pathway, but the homepage should not look like only an exam app.

Use:

> Taking the boards? Use the atlas to find weak topics, repair missed concepts, and return to your review system with a clearer plan.

### User-value relationship

Use:

> SlateCamp maps architecture knowledge so students can look up what matters, see what it means, test what stuck, and repair weak spots with a calmer next step.

Avoid:

- replacement or only-source framing;
- public comparison with adjacent institutions or competitors;
- official-source implications;
- pass guarantees.

---

## 2. The three directions now become one page system

Philip confirmed the three directions all fit. Treat them as layers:

1. **Atlas / Resource** — homepage hero and brand category.
2. **Fear-to-Clarity** — board-review pathway section and campaign copy.
3. **Companion / Pokedex-style field guide** — personal resource-map section and onboarding metaphor.

This prevents false choice. The landing page can feel broad and premium first, then specific and conversion-oriented as the user scrolls.

---

## 3. Preferred hero specification

### Name

> **SlateCamp Atlas Field**

### First viewport copy

**Eyebrow:**

> Architecture knowledge atlas

**Headline:**

> Navigate architecture knowledge with confidence.

**Support:**

> Source-backed resources, visual explanations, quizzes, 3D labs, and practical tools for school, boards, and practice.

**Primary CTA:**

> Open the atlas

**Quiet secondary CTA:**

> Get a free readiness check

**Microcopy:**

> Built around Philippine codes and board-review realities. Educational resource only.

### Alternate sharper headline set

Keep these as A/B variants, not all at once:

1. `Your architecture knowledge atlas.`
2. `Learn architecture with a map, not a pile of PDFs.`
3. `The atlas that turns scattered architecture review into a map.`
4. `Stop getting lost in scattered reviewers.`

### Hero visual

One transparent Three.js visual system:

- floating sheet stack;
- topic constellation;
- dotted blueprint field;
- knowledge-route line;
- subtle amber weak-topic cue;
- calm blue/emerald organized state;
- DOM labels outside canvas.

No black card. No mini dashboard. No knobs. No public configuration panel.

### Interaction

Default:

- one-time organization animation;
- subtle cursor parallax;
- ambient drift;
- scroll cue only if it does not crowd first viewport.

Avoid:

- sample-lot buttons;
- setback sliders in hero;
- many controls;
- orbit controls;
- dense canvas labels;
- WebGL text carrying critical copy.

---

## 4. Recommended page narrative

### Section 1 — Hero: Architecture Knowledge Atlas

Purpose: Category creation and emotional first impression.

Must answer immediately:

- What is SlateCamp? An architecture knowledge atlas.
- Who is it for? Architecture students, reviewees, and early practice workflows.
- Why trust it? Source-backed, visual, Philippine code/review-aware.
- What should I do? Open atlas or get free readiness check.

### Section 2 — Four Atlas Pillars

Purpose: Explain the offer without mechanism jargon.

Pillars:

1. **Knowledge Resources** — source-backed guides, code explainers, field notes.
2. **Quizzes** — diagnostics, drills, simulations, mistake repair.
3. **3D Lab** — spatial/code concepts made visible.
4. **Free Tools** — practical calculators and utilities.

### Section 3 — Taking the Boards?

Purpose: High-intent conversion.

Copy direction:

> The danger is not having weak spots. It is discovering them too late.

Then immediately give control:

> Start with a free readiness check and turn uncertainty into a next study action.

### Section 4 — Knowledge Atlas Proof

Purpose: Make the resource/library credible and tangible.

Show a mini resource preview:

- topic card;
- source trail label;
- related quiz;
- related 3D example;
- related tool;
- “open full resource after signup” if gated.

### Section 5 — Quiz/Repair Loop

Purpose: Translate quiz system into plain student benefit.

Narrative:

1. Answer a question.
2. See why it is right/wrong.
3. Jump to the resource or 3D visual.
4. Weak topic updates.
5. Next study action appears.

Do not lead with active recall/SRS/IRT/EMA.

### Section 6 — 3D Lab and Tools

Purpose: Prove SlateCamp is more than articles and quizzes.

Use examples:

- setbacks/buildable envelope below the fold;
- accessibility/spatial rules;
- occupancy/egress;
- paint/tile/CHB/drywall calculators.

Legal boundary:

> For study, estimating, and visualization only. Verify current requirements with official sources and qualified professionals.

### Section 7 — Personal Field Guide

Purpose: Make SlateCamp feel useful in the user’s real architecture-learning life without naming adjacent institutions or turning the page into comparison copy.

Copy emphasis:

> Keep your architecture knowledge mapped: what to read, what to see, what to test, and what to repair next.

### Section 8 — Final CTA

Primary:

> Open the atlas

Secondary:

> Get a free readiness check

---

## 5. Implementation plan — after approval only

### Task 0: Isolate unwanted branch state

**Objective:** Prevent current rejected/unwanted code from being committed accidentally.

**Files:** none yet.

**Steps:**

1. Inspect working tree with `git status --short`.
2. Decide with Philip whether to discard, stash, or move rejected changes to a worktree patch file.
3. Do not commit current modified production files until they are reviewed against this plan.

### Task 1: Update marketing constants/copy map

**Objective:** Centralize Atlas copy and avoid stale study-tool language.

**Likely files:**

- `src/components/marketing/HeroSection.tsx`
- `src/components/marketing/HeroHeadline.tsx`
- `src/app/page.tsx`
- `src/components/landing/LandingPageFallback.tsx`

**Acceptance:**

- First viewport says `Architecture knowledge atlas` or approved equivalent.
- No first-scroll SRS/active-recall/IRT/EMA/taxonomy jargon.
- Metadata uses resource/atlas/platform language.

### Task 2: Build hero visual as Atlas Field, not Setback Explorer

**Objective:** Replace the rejected mini-tool hero with an abstract architecture-evocative Three.js atlas.

**Likely file:**

- `src/components/marketing/hero/HeroCodeEnvelopeExplorer.tsx` or renamed successor.

**Implementation guidance:**

- Use existing R3F/Drei/Three stack.
- Use `palette` from `@/components/graphics/tokens`.
- Keep canvas transparent.
- Keep labels in DOM.
- Use instancing or memoized geometry for nodes/sheets.
- Use no postprocessing in first pass.
- Use `maath` damp helpers for smooth, premium R3F motion where it improves the Atlas Field feel.

**Acceptance:**

- No black container.
- No public knobs/sliders/preset buttons.
- No z-fighting planes.
- Reduced-motion fallback exists.
- Canvas has useful `role="img"` / `aria-label`.

### Task 3: Move feature density below the fold

**Objective:** Keep first viewport premium and calm.

**Likely files:**

- `src/components/landing/LandingPageContent.tsx`
- `src/components/marketing/BentoFeatureGrid.tsx`
- `src/components/marketing/SocialProofBar.tsx`

**Acceptance:**

- No four-pillar cards in first viewport.
- Trust strip does not masquerade as social proof unless it has real proof.
- First two scrolls explain atlas pillars cleanly.

### Task 4: Add or revise Knowledge Atlas proof section

**Objective:** Make resource positioning tangible.

**Likely files:**

- `src/components/marketing/WikiSection.tsx`
- possible new `src/components/marketing/KnowledgeAtlasSection.tsx`

**Acceptance:**

- User can understand SlateCamp has a resource layer, not just quizzes.
- Shows source trail / related quiz / related 3D / related tool concept.
- Gating copy is honest if full resources require signup.

### Task 5: Add board-review pathway section

**Objective:** Preserve conversion for Licensure Examination for Architects candidates.

**Likely files:**

- `src/components/marketing/HowItWorksSection.tsx`
- possible new `src/components/marketing/ReadinessPathwaySection.tsx`

**Acceptance:**

- Fear copy ends in control.
- Uses full exam name where appropriate.
- No pass guarantee or prediction claim.

### Task 6: Add personal field-guide/value section

**Objective:** Show what changes for the user after SlateCamp becomes part of their architecture-learning routine.

**Likely files:**

- `src/components/marketing/ComparisonSection.tsx`
- possible new `src/components/marketing/CompanionProofSection.tsx`

**Acceptance:**

- Does not mention adjacent institutions or competitors.
- Does not attack or replace any existing learning path.
- Focuses on user transformation: less guessing, clearer next steps, more reliable knowledge.

### Task 7: Validate and review

**Commands after implementation:**

- `bun run test:dom -- tests/vitest/components/marketing/landing-page-surface.test.tsx tests/vitest/components/marketing/hero-code-envelope-explorer.test.tsx`
- `bun run type-check`
- `bun run lint`
- Kill dev server before build if needed: `lsof -ti :3000 | xargs kill -9`
- `bun run build`

**Manual QA:**

- first viewport at 13-inch laptop height;
- mobile first two scrolls;
- reduced motion;
- WebGL fallback;
- console errors;
- no hidden stale copy in fallback/nav/footer/metadata.

---

## 6. CTA route and gating map

Implementation must not invent a CTA that routes nowhere.

### `Open the atlas`

Preferred behavior:

- If a public knowledge preview route exists, route to the public atlas/resources anchor or page.
- If full resources are dashboard-gated, route logged-out users to signup with honest copy: `Open the atlas after creating a free account` or `Preview the atlas`.
- Route logged-in users to the dashboard Wiki/knowledge resource entry point.

### `Get a free readiness check`

Preferred behavior:

- Route logged-out users to registration if registration leads into a diagnostic/readiness path.
- If the post-register flow does not yet launch a diagnostic, soften CTA to `Start free` until the flow exists.
- Route logged-in users to the quiz/readiness path, not generic dashboard if a more precise route exists.

### `Explore tools` / `Open free tools`

Preferred behavior:

- Route public tools directly if available.
- If saved/full tools are gated, say `Use free tools after signup` or `Preview tools`.

### Gating rule

Gating is allowed, but hidden gating is not. Public copy must use one of:

- `preview`
- `free after signup`
- `create a free account`
- `start free`

Avoid implying a fully public Wiki/3D Lab/tools route if the actual surface is protected.

---

## 7. Expanded implementation acceptance criteria

### Stale-copy scan

Before implementation is considered ready, scan landing code, fallback, metadata, nav, tests, and docs touched by the implementation for stale first-scroll phrases:

- `study tool` as primary category
- `readiness engine` as homepage hero category
- `score that never lies`
- `Know you'll win`
- `SRS`
- `IRT`
- `EMA`
- `active recall`
- `taxonomy heatmap`
- `Setback Explorer` as hero default
- public `Pokedex` / `Pokédex`
- public institution/competitor comparison names unless explicitly approved

### Legal/claim criteria

- No pass guarantee.
- No official PRC/PRBoA/government-source implication.
- No unverified article/question/source/partnership/licensed-reviewer counts.
- `source-backed` is softened or verified for the specific surface using it.
- Calculator/3D/tool copy says educational/reference only where relevant.

### Accessibility criteria

- Critical copy is DOM text, not canvas-only text.
- Canvas wrapper has useful `role="img"` and `aria-label`.
- Reduced-motion fallback is tested.
- Hero contrast remains readable over the background.
- Fake visual labels are not exposed as interactive controls.

### Performance criteria

- Hero is the only heavy above-the-fold visual.
- No first-pass postprocessing stack.
- No excessive DPR.
- No second above-the-fold WebGL scene.
- Mobile fallback works.
- If `maath` is used, document the motion role it serves and keep the bundle/performance budget disciplined.

---

## 8. Package decision

### Default

Do not add new dependencies for the first approved implementation.

Already available:

- `three`
- `@react-three/fiber`
- `@react-three/drei`
- `@use-gesture/react`
- `framer-motion`

### Approved hero motion helper

Use `maath` for premium R3F damped interpolation where it improves the Atlas Field motion quality.

### Do not add now

- GSAP
- Remotion for live hero
- Spline runtime
- Theatre.js
- Leva in public UI
- Postprocessing stack in first pass
- Canvas text library unless DOM labels fail

Reason:

> The landing page becomes great through concept, hierarchy, copy, and execution discipline — not by stacking animation packages.

---

## 9. Approval gate

Before implementation, Philip should approve these decisions:

1. Homepage category: `Architecture knowledge atlas`.
2. Hero headline: `Navigate architecture knowledge with confidence.` or chosen variant.
3. Hero visual: `SlateCamp Atlas Field` using floating sheet stack + review constellation + dotted blueprint field.
4. CTA pair: `Open the atlas` + `Get a free readiness check`.
5. Package policy: existing R3F/Drei/Three/Framer stack with `maath` approved for hero motion; no GSAP/Remotion/Spline for live hero.
6. Rejected branch state handling before production edits.

---

## 10. Definition of done

The landing-page redesign is successful only if a first-time visitor can say:

1. SlateCamp is an architecture knowledge atlas/resource, not just a quiz app.
2. It helps me navigate architecture knowledge for school, boards, and practice.
3. It is built around Philippine code/review realities but does not pretend to be official.
4. It makes my architecture knowledge feel mapped, reliable, and easier to act on.
5. It gives me a clear first action: open the atlas or get a free readiness check.
