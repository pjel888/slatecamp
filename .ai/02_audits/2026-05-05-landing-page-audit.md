# SlateCamp Landing Page Audit

**Date:** 2026-05-05
**Branch:** `feat/modal-standardization-kimi26`
**Audit file:** `.ai/02_audits/2026-05-05-landing-page-audit.md`
**Status:** Historical audit plus supersession notice. For landing implementation, use the Atlas master plan first: `.ai/03_plans/2026-05-07-slatecamp-atlas-landing-master-plan.md`. Use this audit only for background, legal/claim checks, and prior research context.
**Primary purpose:** Give reviewers enough product, brand, UX, conversion, and implementation context to critique the SlateCamp landing page intelligently without needing to rediscover the app from scratch.
**2026-05-07 Atlas correction:** Philip clarified SlateCamp should be positioned more as a resource than a study tool. `Architecture knowledge atlas` is now the preferred category language because it fits SlateCAMP/Camp/Trail brand metaphors and avoids mechanism-first study-tool framing. New master plan: `.ai/03_plans/2026-05-07-slatecamp-atlas-landing-master-plan.md`. Research packet: `.ai/13_research/landing-atlas-resource-positioning-2026-05-07/atlas-positioning-and-technical-research.md`.
**2026-05-07 addendum:** Expanded with target-market copy critique, supplementary-reviewer positioning, ethical fear-marketing guidance, Reddit sentiment, and broader architecture-resource/platform positioning.
**2026-05-07 strategy packet:** `.ai/13_research/landing-brand-positioning-2026-05-07/strategy-packet.md`
**2026-05-07 Reddit/platform packet:** `.ai/13_research/reddit-sentiment-landing-positioning-2026-05-07/sentiment-and-platform-positioning-report.md`
**2026-05-07 brand-cue/exam-buyer packet:** `.ai/13_research/filipino-consumer-brand-positioning-2026-05-07/brand-cue-and-exam-buyer-psychology-report.md`
**2026-05-07 final messaging gate:** `.ai/03_plans/2026-05-07-landing-page-final-messaging-gate.md`
**2026-05-07 interactive/gated-free addendum:** Hero should consider an NBCP/PD 1096 setbacks/buildable-envelope 3D card; Wiki, quiz, and 3D previews should be interactive; most free resources may be dashboard-gated by design for onboarding/data/ads, with honest `free after signup` copy.

---

## 0. Read This First

This is not only a visual audit. It is a positioning, product-story, conversion, UX, accessibility, and reviewer-briefing document for the SlateCamp public landing page.

The central conclusion is simple:

> The hero has found the brand. The body now needs to prove the promise.

The landing page is strongest when it presents SlateCamp as the readiness engine for the Philippine Licensure Examination for Architects (LEA), not as another quiz bank or generic study app.

The next iteration should not restart the hero. It should rebuild the page body around one persuasive loop:

1. Take LEA-mapped practice.
2. Get source-backed explanations.
3. Every answer updates your Readiness Score.
4. Weak subjects and topics become your next study path.
5. Repeat until exam-day risk is visible and manageable.

Everything on the page should support that loop.

### 0.0A 2026-05-07 interactive proof and gated-free acquisition addendum

Philip's latest direction updates the implementation brief before code:

1. **Hero visual:** Consider replacing the generic hero/dashboard visual with an interactive Setback Explorer: a compact Three.js / React Three Fiber card showing lot setbacks and buildable envelope under the National Building Code of the Philippines / PD 1096 IRR. Controls should include zoning class/type, RROW or sample road width, lot dimensions, and building/use type only if source-backed.
2. **Wiki as a main feature:** The Wiki / Code Atlas / Field Guide should be highlighted as one of the core landing-page features, ideally through a mini searchable/tabbed article preview with source trail and related quiz/3D links.
3. **Quiz preview:** Include a mock question interaction with answer selection and slide-to-submit style delight, but keep a standard accessible submit path. The result should show explanation, source/resource link, and readiness impact.
4. **3D Lab proof:** Setbacks are the strongest public 3D demo because visitors can immediately see code becoming space: `setback input → lot/buildable envelope changes`.
5. **Gated-free strategy:** It is acceptable and intentional for most free resources to be dashboard-protected. The public landing page should preview value, then onboard users into a free account for data collection, ads/remarketing, analytics, and retention. Use honest copy such as `free after signup`, `create a free account`, or `preview`; do not imply an ungated public Wiki/3D Lab if the actual route is protected.
6. **Exam-name copy:** In public landing-page copy, prefer `Licensure Examination for Architects` over `LEA`. Keep `LEA` for metadata/keywords, internal notes, or after first spelling out the full phrase.

Legal/source caveat: any exact setback values shown in public must reuse verified source-backed PD 1096/NBCP logic and include educational-only disclaimers. Do not imply project-specific code compliance advice.


### 0.1 2026-05-07 target-market copy addendum

The next landing-page pass must speak less like a learning-science SaaS product and more like a calm, reliable LEA companion.

Target candidates do not primarily care about SRS, SM-2, IRT, EMA, taxonomy heatmaps, active recall, or quizzing methodology. Those mechanisms can remain in product architecture, tooltips, deeper explainers, and reviewer notes, but they should not carry the conversion story.

What the target user cares about is simpler and more emotional:

- Am I ready?
- Am I behind?
- What did I miss?
- Can I trust this answer?
- What should I study tonight?
- Will I discover my weak topics too late?
- Can this help beside JPT, CDEP, or my review center without replacing them?

The strongest user-facing translation is:

> SlateCamp helps LEA candidates stop studying blind.

Recommended positioning:

> SlateCamp is the LEA readiness companion that turns practice, code review, and review-center lessons into a live map of what you know, what you missed, and exactly what to fix next.

Review-center relationship:

> Review centers teach. SlateCamp measures.

This is important. SlateCamp should not publicly position itself as the primary review center replacement. In the Philippine LEA market, review centers own human instruction, structure, mentorship, batch accountability, and topnotcher credibility. SlateCamp should sit beside that system as the candidate’s always-on digital buddy: the place to test what stuck after lecture, repair mistakes with source-backed explanations, and decide the next topic.

Internal metaphor:

> SlateCamp is the candidate’s LEA Pokédex.

Public copy should usually use safer language such as `LEA Field Guide`, `Code Atlas`, `study companion`, or `readiness map` unless trademark/legal clearance is obtained.

Ethical fear-marketing rule:

> The danger is not having weak spots. It is discovering them too late.

Fear copy is acceptable only when it immediately gives the user control: a free diagnostic, a visible weak-topic map, a source-backed explanation, and a next session. Do not shame retakers, imply guaranteed passing, invent urgency, or attack review centers.

Competitor context:

Vizcode is the closest visible competitor in the code-visualization lane. Captured pages position Vizcode as a visual learning platform for Philippine architectural codes, with Code Library, visual diagrams, Isolation Mode, Comparative Mode, Game Mode, QUBI AI Chat, topnotcher testimonials, partner/org signals, and paid plans shown at PHP 799, PHP 999, and PHP 1499. SlateCamp should not attack Vizcode by name. The better move is to give away strategically useful reference/code/field-guide value for free, then win on interactive 3D understanding and personalized readiness guidance.

The free SlateCamp layer should therefore aim to include free-after-signup Code Atlas / Field Guide access, sample source-backed questions, free diagnostic score, and selected 3D interactive examples. Paid SlateCamp should sell ongoing control: live readiness tracking, full weak-topic maps, guided Camp Trails, simulations, and personalized next actions.

Detailed strategy packet:

- `.ai/13_research/landing-brand-positioning-2026-05-07/strategy-packet.md`

Everything on the page should support the revised loop:

1. Name the real fear: studying without knowing if it is working.
2. Give a calm first step: get a free Readiness Score.
3. Show the loop: question → explanation → source/3D/Wiki → score update → next topic.
4. Respect the review center: lectures teach; SlateCamp measures what stuck.
5. Convert fear into a plan, not panic.

### 0.2 2026-05-07 Reddit sentiment and platform-positioning addendum

The Reddit research changes the landing-page brief in one important way: SlateCamp should not be too tightly coupled to the board exam as a whole-company identity.

Licensure Examination for Architects readiness remains the highest-intent acquisition pathway. It is urgent, emotional, and clearly tied to the Readiness Score. But the broader public category should be:

> **A source-backed architecture learning platform for school, boards, and practice.**

Use `Philippine architecture learning resource center` as an SEO/about/scope phrase, not necessarily as the hero’s first prestige cue. The page should feel premium and global-caliber first, then prove that SlateCamp is built around Philippine codes, LEA readiness, architecture-school realities, and local practice needs.

Reasons:

1. **Legal safety:** SlateCamp must not sound like an official PRC/PRBoA source, a guaranteed-pass system, or a substitute for licensed professional judgment.
2. **Market expansion:** Architecture students, apprentices, educators, reviewees, and practicing architects all need credible local architecture references and tools.
3. **University partnership:** Schools are more likely to consider a resource/diagnostic/interactive-lab platform than a product framed only as a board-exam cram tool.
4. **Durable brand:** LEA can be the wedge; architecture knowledge can be the platform.

The landing page must clearly state the four product pillars:

1. **Knowledge Resources** — source-backed articles, code explainers, visual guides, Wiki / Code Atlas / Field Guide pages.
2. **Quizzes** — diagnostics, drills, simulations, mistake repair, and readiness tracking.
3. **3D Lab** — interactive spatial/code understanding for rules that are hard to learn from text alone, with setbacks/buildable envelope as the highest-impact landing demo.
4. **Free Tools** — paint, tile/flooring, drywall, CHB, lot/buildability, occupancy/egress, and future practical calculators.

Reddit sentiment supports this direction:

- Review-center users ask for organization, pacing, explanations, mock exams, schedule fit, and reassurance — not SRS/IRT jargon.
- Vizcode appears useful to some users for code verification/compare, but others see it against a backdrop of free Google Drive, Discord, YouTube, and shared resources.
- Broader architecture threads ask for books, code sources, setbacks, permit computations, professional-practice boundaries, workstation guidance, and practical architecture tools.

Updated public thesis:

> **SlateCamp is your architecture study companion: source-backed resources, quizzes, 3D labs, and practical tools for school, boards, and practice.**

LEA pathway thesis:

> **Taking the boards? SlateCamp turns review into a readiness map so you know what stuck and what to fix next.**

University/educator thesis:

> **Built to support architecture schools, review groups, and self-study — without replacing your instructor or review center.**

Implementation implication: the first two scrolls must prove the umbrella offer before diving into feature depth. `Get Your Free Readiness Score` remains the primary LEA CTA, but the page should also expose `Explore Knowledge Resources` and `Open Free Tools` so non-LEA visitors immediately understand why SlateCamp matters.

### 0.3 2026-05-07 Filipino brand-cue and exam-buyer psychology addendum

Further research supports delaying final landing implementation until the brand-cue pass is incorporated. The working decision is:

> **Use “Philippine” as a scope/trust/SEO qualifier, not as the first emotional brand cue.**

Why:

1. Filipino consumers can value local relevance while still using global polish, perceived quality, innovation, and brand reputation as trust signals.
2. SlateCamp is closer to education SaaS / knowledge software than to a patriotic local physical product; a too-local first impression can feel less premium, less aspirational, or too government/directory-like.
3. Board-exam buyers are reassurance-driven. They evaluate proof, reputation, testimonials, schedule fit, value, materials, and confidence. They do not need the hero to sound like a local catalog; they need it to feel reliable and high-quality.
4. Philippine specificity still matters for legal scope, SEO, LEA relevance, local codes, university partnerships, and user trust. It should appear in the subheadline, trust line, metadata, source/disclaimer language, and deeper proof sections.

Recommended line set before implementation:

- Eyebrow: `Architecture learning platform`
- Hero: `Your architecture study companion.`
- Subheadline: `Source-backed resources, quizzes, 3D labs, and free tools for architecture school, LEA readiness, and professional practice.`
- Local trust line: `Built around Philippine codes, board-review realities, and the way architecture students actually study.`
- Review-center line: `Review centers teach. SlateCamp helps you check what stuck, repair mistakes, and plan the next study session.`
- University line: `Built to support architecture classes and review groups, not replace instructors.`

The final messaging gate is now finalized in `.ai/03_plans/2026-05-07-landing-page-final-messaging-gate.md`. Use that file as the authoritative copy brief before implementation. It locks the hero, metadata, disclaimers, university section, review-center companion section, and A/B-ready headline set around this decision.

---

## 1. Evidence Base

This audit is based on direct inspection of the current repository and live local page.

### 1.1 Files inspected

Landing composition:
- `src/components/landing/LandingPageContent.tsx`
- `src/components/landing/LandingPageFallback.tsx`

Marketing sections:
- `src/components/marketing/MarketingNav.tsx`
- `src/components/marketing/HeroSection.tsx`
- `src/components/marketing/HeroHeadline.tsx`
- `src/components/marketing/SocialProofBar.tsx`
- `src/components/marketing/BentoFeatureGrid.tsx`
- `src/components/marketing/QuestionsSection.tsx`
- `src/components/marketing/ThreeDLabSection.tsx`
- `src/components/marketing/AnalyticsSection.tsx`
- `src/components/marketing/WikiSection.tsx`
- `src/components/marketing/HowItWorksSection.tsx`
- `src/components/marketing/ComparisonSection.tsx`
- `src/components/marketing/FinalCtaSection.tsx`
- `src/components/marketing/LandingPrimitives.tsx`

Product and design context:
- `DESIGN.md`
- `.ai/00_system/slatecamp-authoritative-reference.md`
- `package.json`
- Dashboard route surface under `src/app/dashboard/`

### 1.2 Live page checks performed

Local URL:
- `http://localhost:3000/`

Observed page metadata:
- Title: `SlateCamp — Know Your LEA Readiness Before Exam Day`
- Main route: `/`
- Body height observed: `6736px`
- Viewport height observed during one pass: `633px`

Confirmed current implementation state:
- Hero uses `/images/dashboard/Dashboard-BG-Image.png` as a decorative background image.
- Hero background is applied at `opacity-70`.
- Hero has a soft page-background gradient overlay.
- Hero three-card stack has been removed.
- Previous `SlateCamp Dashboard` hero mockup has been removed.
- Current hero headline: `Know you'll win.`
- Current hero subheadline: `One readiness engine for the LEA — adaptive quizzing, syllabus-mapped content, and a score that never lies.`
- Current hero stats:
  - `Syllabus-mapped to the LEA`
  - `Real-time Readiness Score`
  - `Source-backed explanations`
- Current page sequence has ten major sections after nav.
- Browser console check did not surface JavaScript errors during this audit pass.

### 1.3 Independent review inputs

Two independent reviewer passes were used as inputs:
- Conversion strategy and brand positioning review.
- UX, accessibility, and content-architecture review.

Both agreed on the main diagnosis:
- The hero is directionally strong.
- The body currently reads too much like a feature catalog.
- Readiness Score should become the page centerpiece.
- Questions, Wiki, and Analytics should be framed as one closed learning loop.
- 3D Lab is promising but currently less conversion-critical than Readiness Score.

---

## 2. Current Product Context

### 2.1 What SlateCamp is

SlateCamp is a Philippine LEA prep platform. It is a pre-launch MVP built with Next.js App Router and Supabase. The repository uses Bun-first tooling. The product is specifically for the Licensure Examination for Architects, not a generic exam-prep market.

SlateCamp's strongest strategic identity is:

> A readiness engine for Philippine architecture board exam candidates.

This matters because the LEA is high-stakes, broad, and anxiety-producing. Candidates do not only need more study material. They need to know whether their preparation is actually working.

### 2.2 What the current app appears to contain

The current app surface, based on live route and component inspection, includes or references:
- Dashboard home.
- LEA quiz and practice flows.
- Question bank.
- Review, Camp, and Storm style study modes in marketing copy.
- Readiness Score.
- Analytics and subject breakdowns.
- Taxonomy heatmap concepts.
- Spaced repetition and SM-2 language.
- IRT-calibrated scoring language.
- Wiki/reference layer.
- Personal notes workspace.
- 3D Lab.
- CampTrails.
- Flash/flashcard practice.
- Design/Area C tools.
- Assessment and score reveal flows.
- Code updates.
- Upgrade/pricing surfaces.
- Professional/studio/pod surfaces in the dashboard tree.
- Admin/developer/supporting operational surfaces in the repository.

This breadth is impressive. But the landing page should not market breadth first.

The buyer does not buy breadth. The buyer buys certainty.

### 2.3 Current product promise expressed by the page

The current public page is trying to promise:

> SlateCamp helps LEA candidates know where they stand before exam day through adaptive practice, source-backed explanations, and a Readiness Score.

That is the right promise.

The issue is that the page sometimes drifts into:

> SlateCamp has a lot of study features.

That weaker frame makes the product easier to compare with generic quiz platforms, PDFs, notes repositories, or review-center handouts.

---

## 3. Brand Context

### 3.1 Design-system direction

`DESIGN.md` defines SlateCamp as:

> A calm, work-focused review platform for Philippine LEA candidates.

The design standard emphasizes:
- Study-first layouts.
- Signal-first use of color and visual weight.
- Legibility by default.
- Dense but breathable screens.
- Calm under pressure.
- Evidence over inspiration.

This is exactly the right brand posture for a board-exam platform. Candidates are already anxious. The interface should not add panic, gimmicks, fake urgency, or ornamental complexity.

### 3.2 Brand personality currently visible on the landing page

Current positive signals:
- The hero landscape background supports the `Camp` identity.
- The headline `Know you'll win.` is emotionally direct.
- The LEA eyebrow anchors the page in a specific professional exam.
- The cobalt CTA and clean typography make the product feel serious.
- The bento cards inject personality without making the entire page playful.
- The Philippine flag in the logo reinforces local specificity.

Current risks:
- Some visual treatments are more expressive than the design standard's calm-study language.
- Several sections use jargon before translating the benefit.
- The bento grid is visually energetic but creates high early cognitive load.
- The page sometimes feels like a SaaS feature showcase instead of an exam-readiness argument.

### 3.3 Brand north star

The strongest brand sentence is:

> SlateCamp helps LEA candidates stop studying blind.

This phrase should guide the next page revision.

It is clear, emotionally relevant, and specific to a real pain:
- Students do not know if they are ready.
- They do not know which topics are weak.
- They do not know which mistakes matter.
- They often discover gaps too late.

SlateCamp's job is to turn that uncertainty into a measurable, actionable study path.

---

## 4. Current Landing Page Map

Current composition in `LandingPageContent.tsx`:

1. `MarketingNav`
2. `HeroSection`
3. `SocialProofBar`
4. `BentoFeatureGrid`
5. `QuestionsSection`
6. `ThreeDLabSection`
7. `AnalyticsSection`
8. `WikiSection`
9. `HowItWorksSection`
10. `ComparisonSection`
11. `FinalCtaSection`
12. `MarketingFooter`

### 4.1 What this order communicates now

The page currently communicates:

1. SlateCamp is for the LEA.
2. You can know you will win.
3. It has syllabus mapping, Readiness Score, and source-backed explanations.
4. It has multiple features.
5. It has questions.
6. It has 3D Lab.
7. It has analytics.
8. It has a Wiki.
9. Here is how it works.
10. It compares favorably to review centers.
11. Start or continue.

This is coherent, but it is not yet inevitable.

### 4.2 What the order should communicate

The stronger story is:

1. You are preparing for a high-stakes exam.
2. Most candidates study with too little feedback.
3. SlateCamp gives you a live readiness signal.
4. That signal comes from LEA-mapped questions.
5. Wrong answers become source-backed learning moments.
6. The system identifies weak topics and tells you what to fix next.
7. Review centers teach; SlateCamp measures.
8. Start free by getting your Readiness Score.

This is a conversion argument, not a feature tour.

---

## 5. Executive Diagnosis

### 5.1 What is already working

The landing page has the ingredients of a strong launch story:
- Specific market: Philippine LEA candidates.
- Strong emotional promise: certainty before exam day.
- Clear product mechanism: practice, explanations, analytics, readiness scoring.
- Distinctive brand asset: camp-like hero background with calm atmosphere.
- Serious product credibility: source-backed explanations and code citations.
- Broad app capability: questions, Wiki, 3D, analytics, notes, spaced repetition.

### 5.2 What is not yet working

The page has not fully organized those ingredients into one persuasive sequence.

The body currently feels like:

> Here are many things SlateCamp has.

It should feel like:

> Here is the problem. Here is the learning loop. Here is the proof. Here is why to start today.

### 5.3 The highest-leverage improvement

Do not start by redesigning individual cards.

First, rewrite the landing page's information architecture around the readiness loop.

The strongest next iteration is not a more decorative page. It is a clearer page.

---

## 6. Core Positioning Recommendation

### 6.1 Primary category

SlateCamp should own this category:

> The readiness engine for the Philippine LEA.

Not:
- A quiz bank.
- A notes app.
- A wiki.
- A 3D learning tool.
- A cheaper review center.
- A dashboard.

All of those may be true or partially true, but they are not the highest-value market position.

### 6.2 Primary user problem

The user problem is not simply lack of material.

The user problem is uncertainty:
- Am I ready?
- Which subjects are weak?
- Am I wasting time reviewing what I already know?
- Are my mistakes based on memory, code confusion, spatial misunderstanding, or exam stamina?
- Will I find out too late?

### 6.3 Primary product answer

SlateCamp's answer:

> Every practice session becomes a readiness signal.

That signal becomes:
- A score.
- A subject map.
- A weak-topic list.
- A next study action.
- A way to measure progress before exam day.

### 6.4 Suggested core landing-page thesis

Use this thesis as the internal filter for revisions:

> SlateCamp turns LEA practice into a live readiness map, so candidates know where they stand, what they missed, and exactly what to fix next.

---

## 7. Recommended Page Narrative

### 7.1 Current body story

Current body story:

1. We have feature tiles.
2. We have questions.
3. We have 3D Lab.
4. We have analytics.
5. We have Wiki.
6. Here is how it works.
7. We are better than the old way.

### 7.2 Recommended body story

Recommended body story:

1. Stop studying blind.
2. Take LEA-mapped practice.
3. Every answer teaches, with source-backed explanations.
4. Every session updates your Readiness Score.
5. Your weak topics become your next study path.
6. The Wiki and 3D Lab help you repair gaps deeply.
7. Review centers teach; SlateCamp measures.
8. Start free and get your Readiness Score.

### 7.3 Recommended order

Best next structure:

1. Hero.
2. Trust strip.
3. Readiness-loop section: `Stop studying blind`.
4. Question proof section.
5. Readiness Score centerpiece.
6. Source-backed explanation and Wiki section.
7. Study modes and spaced repetition.
8. 3D Lab as supporting differentiator.
9. Review-center comparison.
10. Pricing/free-start reassurance.
11. Final CTA.

### 7.4 Why this order is better

This order teaches the user how to value the product before asking them to admire the feature set.

It also makes the CTA more meaningful. `Get Your Free Readiness Score` becomes the natural next step, not just a signup label.

---

## 8. Section-by-Section Audit

## 8.1 Marketing Navigation

### Current state

The nav includes:
- Logo.
- Features.
- How it works.
- Tools.
- Pricing.
- About.
- Contact.
- Login or dashboard CTA depending on auth state.
- Join Free for logged-out users.

### What works

- The nav is clear and conventional.
- Auth-aware CTA is useful.
- Fixed nav keeps orientation stable.
- The logo and Philippine flag are distinctive.

### Issues

1. `Join Free` is useful, but less differentiated than `Get Your Free Readiness Score`.
2. On the landing page, the nav sends users to `Features` first, reinforcing feature-tour framing.
3. Mobile hides most navigation links, which may be fine for conversion but should be intentionally reviewed.

### Recommendation

For acquisition, prefer:
- Primary nav CTA: `Get Readiness Score` or `Start Free`.
- Hero CTA: `Get Your Free Readiness Score`.

The nav can remain simple, but the page's main CTA should consistently sell the outcome.

---

## 8.2 Hero Section

### Current state

Hero content:
- Eyebrow: `Licensure Examination for Architects`
- Headline: `Know you'll win.`
- Subheadline: `One readiness engine for the LEA — adaptive quizzing, syllabus-mapped content, and a score that never lies.`
- CTA: authenticated users see dashboard action; logged-out users see readiness-score action.
- Supporting reassurance: `Free to start · No credit card required`
- Three proof bullets: syllabus mapping, real-time Readiness Score, source-backed explanations.
- Background: `/images/dashboard/Dashboard-BG-Image.png`, decorative, opacity 70, page-bg gradient overlay.
- Removed: previous three-card stack.
- Removed: previous dashboard mockup.

### What works

1. The hero is the strongest current section.
2. The background finally makes `SlateCamp` feel like a brand, not only a software dashboard.
3. Removing the three cards reduced clutter.
4. Removing the dashboard mockup gave the headline more authority.
5. `Know you'll win.` is memorable and emotionally direct.
6. The subheadline names the category well: readiness engine.
7. The proof bullets match the correct strategic pillars.

### Strategic read

The hero now sells confidence. That is correct for this market.

LEA candidates do not only want more lectures. They want to reduce uncertainty. The headline speaks to that emotional state.

### Issues

1. The CTA placement is slightly detached from the headline/subheadline block.
   - The user's eye reads left, then must travel to the CTA.
   - The CTA remains visible, but it could feel more connected to the copy.

2. Small-text contrast needs verification.
   - `Free to start` and the hero stats are small.
   - The background is decorative but visually detailed.
   - Contrast may be acceptable in some viewport states and weak in others.

3. Rough-notation animation should be checked against reduced-motion preferences.
   - Some motion-safe classes exist, but the rough-notation effect is custom.
   - Reduced-motion behavior should be verified directly.

4. The subheadline uses `score that never lies`.
   - Emotionally strong.
   - Also high-claim language.
   - If reviewers are strict, they may prefer a version that is confident but less absolute.

### Recommendation

Keep the hero direction.

Only refine:
- CTA proximity and alignment.
- Text contrast over background.
- Motion preference handling.
- Exact claim language if legal/brand reviewers think `never lies` is too absolute.

### Possible refined hero copy

Option A, close to current:

> Know you'll win.
> One readiness engine for the LEA: adaptive practice, source-backed explanations, and a score that shows where you stand.

Option B, more problem-aware:

> Stop studying blind.
> SlateCamp turns every LEA practice session into a Readiness Score, so you know what to fix before exam day.

Option C, preserve emotional headline and clarify mechanism:

> Know you'll win.
> Practice with LEA-mapped questions, learn from cited explanations, and watch your readiness improve subject by subject.

---

## 8.3 SocialProofBar

### Current state

The strip says:
- Built for the Philippine LEA.
- Every question mapped to the LEA syllabus.
- Readiness Score powered by IRT.

### What works

- It immediately reinforces specificity.
- It summarizes three credibility pillars.
- It is compact and does not interrupt the page.

### Issue

This is not actually social proof. It is a trust strip.

There are no testimonials, user counts, pass outcomes, institutional logos, or public reviewer endorsements in the current strip.

That is not necessarily bad for a pre-launch product. But it should be named and treated correctly.

### Recommendation

Call this internally a `TrustStrip`, not social proof, until real proof exists.

Possible trust-strip items:
- Philippine LEA-specific.
- Syllabus-mapped practice.
- Source-backed explanations.
- Readiness Score by subject.
- Free diagnostic to start.

If claims are not yet operationally verified, avoid `Every question` language. Use `LEA-mapped question bank` or `questions mapped to LEA topics`.

---

## 8.4 BentoFeatureGrid

### Current state

The bento grid includes:
- Review Mode: active recall, zero pressure.
- `1 in 3` pass/fail risk statistic with PRC source note.
- Analytics: readiness quantified, taxonomy heatmap, IRT/EMA language.
- Brand quote: `Trust the camp... eliminate the doubt.`
- 3D Lab card.
- Every answer tracked.
- Answers that cite their sources.
- Personalized learning.

### What works

- Visually memorable.
- Strong brand energy.
- Gives the page a modern product feel.
- Contains many correct ingredients: active recall, readiness, source-backed answers, personalization.
- The `1 in 3` card introduces real stakes.

### Main issue

It appears too early and asks the user to decode too many concepts at once.

Before the user fully understands the readiness loop, the grid introduces:
- Review Mode.
- Analytics.
- Pass-rate risk.
- Taxonomy heatmap.
- IRT.
- EMA.
- 3D Lab.
- Answer tracking.
- Source citations.
- Personalization.

That is a high cognitive load immediately after the hero.

### Strategic problem

The grid says:

> Look how many product capabilities exist.

The landing page should first say:

> Here is why you need a readiness engine.

### Recommendation

Do one of these:

Option 1: Move bento lower.
- Use it after the readiness loop has been explained.
- Let it become a feature showcase after comprehension is established.

Option 2: Replace it with a readiness-loop section.
- One clear visual sequence:
  - Answer question.
  - See cited explanation.
  - Score updates.
  - Weak topic recommended.

Option 3: Keep the bento but add a strong intro above it.
- Heading: `Stop studying blind.`
- Subcopy: `SlateCamp turns each answer into a readiness signal, then tells you exactly what to fix next.`

### Reviewer note

The bento grid is not bad. It is just doing the wrong job too early.

---

## 8.5 QuestionsSection

### Current state

Key claims and content:
- `2,400+ questions built for the LEA. Every single one.`
- Not recycled PDFs.
- Not scraped notes.
- Written to the LEA syllabus.
- Verified by licensed architects.
- Tagged to PD 1096 provisions.
- Feature chips: image/diagram questions, code-cited explanations, all 7 LEA subjects, IRT difficulty.
- Mockup: PD 1096 ceiling-height question with answer options, explanation, and citation.

### What works

This is one of the strongest conversion sections.

Why:
- It shows actual product behavior.
- It names a real law/code context.
- It demonstrates answer feedback.
- It shows that wrong answers become learning moments.
- It makes `source-backed` concrete.

### Risks

1. Claim support.
   - `2,400+ questions` must match the actual public product scope.
   - Repo context references a much larger corpus of roughly 7,159 questions in internal documentation. The landing page may intentionally use a launch-safe public count, but reviewers should confirm.

2. `Every question... verified by licensed architects` is strong.
   - If literally true, keep it and prepare evidence.
   - If not fully true, soften it.

3. `tagged to its exact PD 1096 provision` cannot apply to every subject.
   - Some LEA topics are not PD 1096-based.
   - Better phrasing: `tagged to its source topic, code provision, or syllabus area`.

4. Example accuracy.
   - The mockup cites PD 1096 § 808 for ceiling heights. If this appears in production marketing, verify exact section and current code wording before launch.

### Recommendation

Move or connect this section earlier as proof of the core loop.

Suggested section framing:

> Every answer teaches. Every mistake updates your map.

Suggested proof sequence:
- User answers a question.
- Answer is marked wrong or correct.
- Explanation cites the source.
- Related topic opens.
- Readiness Score updates.

---

## 8.6 ThreeDLabSection

### Current state

The section promises:
- Architecture is spatial.
- Rotate, cut away, and explore structures.
- Concepts click through spatial understanding.

The mockup currently shows:
- A blueprint/site-plan style SVG.
- Corner lot layout.
- Setback dimensions.
- Building footprint.
- Main street/side street.

### What works

- This is architecture-specific.
- It differentiates SlateCamp from generic test-prep tools.
- The blueprint visual is attractive and on-brand for architecture.
- It supports spatial cognition as a learning principle.

### Main issue

The copy promises 3D interaction, but the visual proof reads as a 2D blueprint.

That creates a trust gap:
- The section says `rotate` and `cut away`.
- The visible artifact says `flat site-plan diagram`.

### Recommendation

Either upgrade the proof or reduce the prominence.

Upgrade path:
- Show a true 3D model or pseudo-3D cutaway.
- Add a `drag to rotate` affordance if interactive.
- Show an exploded assembly or section cut.
- Connect the model to a quiz/wiki citation.

Repositioning path:
- Move 3D Lab after Readiness Score and Wiki.
- Frame it as a supporting study mode, not a core conversion argument.

### Reviewer note

3D Lab may become a major differentiator. But the landing page should not overpromise it visually before the proof is ready.

---

## 8.7 AnalyticsSection

### Current state

Key copy:
- `Stop guessing. Your Readiness Score tells you exactly where you stand.`
- `Not a grade. A GPS.`
- Live subject-by-subject mastery data.
- Score tiers:
  - 85 to 100: exam ready.
  - 60 to 84: getting there.
  - Below 60: at risk.
- Mockup includes 75%, getting there, questions answered, streak, subject bars.

### What works

This is the strategic center of the product.

The Readiness Score answers the user's real anxiety:
- Am I ready?
- What is weak?
- What do I do next?

The phrase `Not a grade. A GPS.` is strong. It translates analytics into user benefit.

### Main issue

This section arrives too late and is treated like one feature among many.

The Readiness Score should be the page's `aha` moment.

### Recommendation

Promote the analytics concept earlier.

The section should show not only score display but next action.

Add visible elements like:
- Weakest subject.
- Weakest topic.
- Recommended next session.
- Risk level.
- Change over time.
- Explanation of why the score moved.

Example content:

> Readiness Score: 74%
> Risk: Getting there
> Pulling you down: Building Technology, Firewalls, Utilities
> Next session: 15 targeted questions on PD 1096 fire-safety provisions

### Reviewer-facing language

Readiness Score should not be a feature. It should be the product promise.

---

## 8.8 WikiSection

### Current state

Key copy:
- Every code provision, every principle.
- Organized like an encyclopedia.
- Cited like a reference.
- Maps every LEA topic to its source: PD 1096, RA 9266, NBCP, and more.
- Personal notes workspace.
- Linked to questions.

### What works

- Strong credibility layer.
- Correctly addresses code/reference anxiety.
- Useful for professional exam prep where exact provisions matter.
- Personal notes workspace adds study ownership.

### Main issue

`Organized like an encyclopedia` may position the Wiki as a static library.

SlateCamp should position the Wiki as part of mistake recovery.

Stronger framing:

> Every wrong answer leads back to the source.

The Wiki is not valuable because it is a library. It is valuable because it closes the loop between question, explanation, source, and next practice.

### Recommendation

Rewrite Wiki positioning around learning recovery:
- Wrong answer.
- Cited explanation.
- Open source-backed article.
- Add note.
- Practice related questions.
- Readiness improves.

---

## 8.9 HowItWorksSection

### Current state

Steps:
1. Choose your mode.
2. Answer questions.
3. Master the material.

### What works

- Simple.
- Easy to scan.
- Explains basic usage.

### Main issue

It describes the interface before the transformation.

`Choose your mode` is not the first thing a skeptical visitor needs to understand. The first thing they need to understand is how SlateCamp turns practice into readiness.

### Recommendation

Reframe steps around the readiness engine:

1. Take a short LEA diagnostic.
2. Every answer updates your readiness map.
3. Review the exact topics pulling your score down.
4. Repeat with adaptive practice until your risk is visible and manageable.

If only three steps are desired:

1. Practice with LEA-mapped questions.
2. Learn from source-backed explanations.
3. Follow your Readiness Score to the next weak topic.

---

## 8.10 ComparisonSection

### Current state

The comparison contrasts traditional review centers with SlateCamp across:
- Cost.
- Schedule.
- Performance feedback.
- Content.
- Personalization.
- Availability.
- Readiness signal.

It includes the important caveat:

> SlateCamp isn't against review centers, many students use both.

### What works

This respectful positioning is smart.

Many Philippine candidates may already trust review centers, be enrolled in one, or rely on mentors. SlateCamp should not insult that choice.

### Main issue

`The old way. The better way.` is sharper than necessary and slightly generic.

A stronger strategic frame:

> Review centers teach. SlateCamp measures.

That is not hostile. It clarifies the complement.

### Recommendation

Position SlateCamp as the missing measurement layer:
- Review centers provide lectures.
- SlateCamp shows what you retained.
- Review centers provide mock exams.
- SlateCamp provides topic-level readiness.
- Review centers follow a schedule.
- SlateCamp adapts daily.
- Review centers say keep studying.
- SlateCamp says what to fix next.

---

## 8.11 FinalCtaSection

### Current state

Headline:
- `The exam doesn't wait for you to feel ready.`

Logged-in subcopy:
- `Your Readiness Score is waiting. Keep building toward it.`

Logged-out subcopy:
- `SlateCamp shows you exactly where you stand, what to fix, and when you're genuinely ready. Start free — no card needed.`

CTA:
- Uses auth-aware label from page.

### What works

- Strong urgency without sounding manipulative.
- Returns to readiness.
- Good friction reducer: free, no card.

### Issues

- Final CTA should resolve the anxiety, not only state it.
- It could benefit from a secondary action for users not ready to register.

### Recommendation

Possible final CTA:

> Know where you stand before exam day.
> Start with LEA-mapped questions, get your Readiness Score, and focus only on what still needs work.

Primary button:
- `Get Your Free Readiness Score`

Secondary button:
- `Try Sample Questions`

---

## 9. Feature Proof Matrix

This matrix maps feature claims to user anxiety and recommended proof.

| Feature / claim | User anxiety it answers | Current proof | Needed proof |
|---|---|---|---|
| Readiness Score | `Am I ready?` | Analytics mockup, score tiers | Show weak topic and next recommended session |
| LEA-mapped questions | `Am I studying the right things?` | Question section and chips | Clarify exact source/topic mapping, verify counts |
| Source-backed explanations | `Can I trust the answer?` | PD 1096 mockup explanation | Show source trail from question to Wiki |
| Wiki | `Where do I review the provision?` | Wiki mockup | Reframe as mistake recovery, not static library |
| Spaced repetition | `Will I forget this?` | Feature check item | Translate SM-2 into plain benefit |
| 3D Lab | `How do I understand spatial topics?` | Blueprint mockup | True 3D/cutaway proof or reduced prominence |
| Review modes | `How do I study today?` | Bento and How It Works | Clarify mode names and when to use each |
| IRT calibration | `Is the score fair?` | Chips | Explain difficulty-adjusted scoring in plain language |
| PRC pass-rate risk | `Why should I care now?` | `1 in 3` card | Add source link or footnote, verify exact statistic |
| Free start | `Is there friction?` | Hero and final CTA | Keep near every major CTA |

---

## 10. Claims and Credibility Audit

Because SlateCamp prepares students for a professional board exam, claims need unusually high discipline.

### 10.1 Claims that should be verified before public launch

1. `2,400+ questions`
   - Confirm public database count and free/premium availability.
   - Internal repo references around 7,159 linked questions in content workflows, so the marketing number may be conservative or stale.

2. `Every question mapped to the LEA syllabus`
   - Verify all public questions have syllabus/topic mapping.
   - If not, use `LEA-mapped question bank`.

3. `Verified by licensed architects`
   - Confirm review workflow, reviewer qualifications, and scope.
   - If partial, use `reviewed against source materials` or `built with licensed-architect review` only if accurate.

4. `Tagged to its exact PD 1096 provision`
   - This cannot apply to all subjects.
   - Prefer `tagged to the relevant source, code provision, or topic`.

5. `Readiness Score powered by IRT`
   - Confirm actual algorithm in current product.
   - If still planned or partial, soften to `difficulty-aware readiness scoring`.

6. `PRC official results, 2024 to 2025`
   - Add source link or footnote.
   - Confirm the `1 in 3` phrasing is accurate across selected exam sittings.

7. `Free forever · Premium from ₱299/month`
   - Confirm final pricing before public launch.

8. `Every code provision, every principle`
   - Strong and broad.
   - Consider `Key LEA code provisions and principles` if corpus is not complete.

### 10.2 Preferred claim style

Use confident but auditable language:
- Specific.
- Source-linked where possible.
- Avoid absolute claims unless fully true.
- Prefer product behavior over hype.

Good:
- `Practice with LEA-mapped questions and source-backed explanations.`
- `See which subjects are pulling your readiness down.`
- `Track readiness by subject and topic.`

Riskier:
- `Every question is verified by licensed architects.`
- `A score that never lies.`
- `Every code provision, every principle.`

---

## 11. Accessibility Audit

### 11.1 Current strengths

- Hero background image is decorative and `aria-hidden`.
- Hero section has an accessible label.
- Main page sections use semantic `section` elements.
- Some sections use `aria-labelledby`.
- Primary CTA has visible focus styles in hero and final CTA.
- Comparison has a mobile card variant.
- Motion-safe classes are used in several places.

### 11.2 Risks and checks

1. Color contrast over atmospheric hero background.
   - Check hero subheadline.
   - Check `Free to start` reassurance.
   - Check hero stat bullets.

2. Low-contrast small text in cards.
   - White/40 labels.
   - White/55 body copy.
   - Black/40 labels on amber cards.
   - Gray-400 text over pale backgrounds.

3. Decorative separators.
   - Social proof dots are text characters.
   - Consider hiding from screen readers or using CSS separators.

4. Hover affordances on non-clickable cards.
   - Bento cards move on hover.
   - If not clickable, hover motion can imply interactivity.
   - Either remove hover movement or make cards meaningfully clickable.

5. Rough-notation reduced-motion behavior.
   - Verify custom annotation respects `prefers-reduced-motion`.

6. Mockup semantics.
   - Static mockups should either be decorative with equivalent text nearby or have accessible labels.
   - Avoid fake UI controls being interpreted as real controls.

7. SVG labeling.
   - The 3D/site-plan SVG has an accessible label.
   - Confirm whether this is helpful or too detailed for screen readers.

8. Mobile nav discoverability.
   - Below `sm`, most nav links are hidden.
   - Confirm this is intentional and does not block access to Pricing/About/Contact for mobile visitors.

### 11.3 Accessibility recommendation

Before external launch, run a focused accessibility QA pass:
- Contrast checks across hero and all card text.
- Keyboard navigation from nav through final CTA.
- Reduced-motion test.
- Screen reader scan for separator noise and fake-control confusion.
- Mobile tap target check.

---

## 12. Mobile and Responsive Audit

### 12.1 Current strengths

- Sections generally collapse to one column.
- Grid layouts have responsive breakpoints.
- Typography uses clamps in key places.
- Comparison table becomes mobile cards.
- CTA sizes appear tap-friendly.

### 12.2 Risks

1. Page length.
   - At about 6736px observed body height, the page is long.
   - Long is acceptable if the story compounds, but risky if it feels like feature browsing.

2. Hero fold.
   - Hero min-height is 600px.
   - CTA visibility on phone heights should be verified.

3. Bento linear order.
   - When cards stack, the reading sequence must still tell the story.
   - Current bento order may feel scattered on mobile.

4. Repeated vertical padding.
   - Several sections use large `py-24` spacing.
   - This may feel elegant on desktop and exhausting on mobile.

5. Headline annotations.
   - Rough annotations should not clip or become awkward on narrow screens.

### 12.3 Mobile recommendation

Mobile should compress around the readiness loop:
- Hero.
- CTA.
- Trust strip.
- One clear explanation of readiness score.
- Question proof.
- Source-backed explanation.
- Final CTA.

Feature depth can follow, but the first few scrolls must be decisive.

---

## 13. Conversion Audit

### 13.1 Primary conversion objective

Best primary action:

> Get Your Free Readiness Score

This is superior to:
- Join Free.
- Sign Up.
- Start Now.
- Explore Features.
- Go to Dashboard, for logged-out visitors.

Why:
- It sells the outcome.
- It differentiates SlateCamp.
- It names the product mechanism.
- It reduces the burden of account creation.

### 13.2 Secondary conversion actions

Useful secondary CTAs:
- `Try 10 Sample Questions`
- `See a Sample Explanation`
- `Start a Free Diagnostic`
- `See How the Score Works`

### 13.3 CTA placement recommendation

Repeat the primary CTA after high-intent moments:
- Hero.
- After the readiness-loop explanation.
- After the question proof.
- After the analytics/Readiness Score section.
- After comparison.
- Final CTA.

Do not overdo button density. But do not let the user scroll through multiple strong proof sections without an action.

### 13.4 Conversion blockers

1. If the body reads as a feature catalog, users may delay action.
2. If `Readiness Score` appears too late, users may not understand the CTA.
3. If claims feel absolute but unsupported, skeptical reviewers may lose trust.
4. If 3D Lab promise and visual proof mismatch, it can reduce credibility.
5. If the mobile page is too long before a second CTA, drop-off may increase.

---

## 14. Content Architecture Recommendations

### 14.1 Replace feature-first framing with problem-first framing

Current first body idea:
- Features.

Recommended first body idea:
- Stop studying blind.

Possible section:

> Stop studying blind.
> Most candidates know how many hours they studied. Few know which topics are still pulling them below passing readiness. SlateCamp turns each answer into a signal, then shows what to fix next.

### 14.2 Show the product loop visually

A single loop could outperform several separate sections:

1. Question answered.
2. Explanation appears with source citation.
3. Related Wiki article opens.
4. Readiness Score updates.
5. Next weak topic recommended.

This loop can absorb the strongest parts of Questions, Wiki, and Analytics.

### 14.3 Treat technical methods as proof, not headline copy

Translate terms:

| Technical term | User-benefit translation |
|---|---|
| IRT | Your score accounts for question difficulty. |
| SM-2 | Weak topics return before you forget them. |
| Taxonomy heatmap | A topic map of strengths and weaknesses. |
| EMA weighting | Recent performance updates your score faster. |
| Adaptive quizzing | Practice adjusts to what you miss. |

### 14.4 Clarify study modes

If Review, Camp, and Storm are real modes, define them cleanly:
- Review: no-pressure active recall.
- Camp: tracked practice and improvement.
- Storm: exam simulation or endurance mode.

If names are changing or not yet final, avoid overcommitting in marketing copy.

---

## 15. Suggested Revised Landing Outline

### Version A: Minimal reordering

1. Hero.
2. Trust strip.
3. Analytics/Readiness Score section.
4. Questions section.
5. Wiki/source-backed explanations.
6. 3D Lab.
7. How It Works.
8. Comparison.
9. Final CTA.

### Version B: Stronger narrative rebuild

1. Hero: `Know you'll win.`
2. Trust strip: LEA-specific, source-backed, readiness-scored.
3. Problem section: `Stop studying blind.`
4. Product loop: question -> explanation -> source -> score -> next topic.
5. Readiness Score centerpiece.
6. Question bank proof.
7. Wiki and notes as recovery layer.
8. 3D Lab as architecture-specific depth.
9. How It Works.
10. Review-center comparison.
11. Final CTA.

### Version C: Conversion-first pre-launch page

1. Hero.
2. Diagnostic CTA.
3. Readiness Score explainer.
4. Sample question proof.
5. Source-backed explanation proof.
6. What you get free.
7. Review-center complement.
8. Final CTA.

Use Version B for best long-term brand page. Use Version C if conversion speed matters more than showcasing all features.

---

## 16. Recommended Copy System

### 16.1 Core messages

Primary message:

> Know where you stand before exam day.

Problem message:

> Stop studying blind.

Mechanism message:

> Every answer updates your readiness map.

Trust message:

> LEA-mapped questions. Source-backed explanations. Subject-by-subject readiness.

Comparison message:

> Review centers teach. SlateCamp measures.

CTA message:

> Get Your Free Readiness Score.

### 16.2 Copy to avoid or review carefully

Avoid overusing:
- `Every` unless literally true.
- `Never lies` unless brand/legal approves.
- `Better way` if it sounds dismissive of review centers.
- Technical terms without benefit translation.
- Generic SaaS terms like `analytics dashboard` without exam context.

---

## 17. Implementation Priority

### P0: Keep and protect

Do not lose these:
- Current hero background direction.
- `Know you'll win.` brand confidence.
- LEA specificity.
- Readiness Score positioning.
- Source-backed explanation proof.
- Respectful review-center stance.

### P1: Narrative architecture

- Reorder body around readiness loop.
- Promote Readiness Score earlier.
- Connect Questions, Wiki, and Analytics into one system.
- Make `Get Your Free Readiness Score` the recurring acquisition CTA.

### P2: Credibility and claim cleanup

- Verify all numeric claims.
- Verify source/citation claims.
- Clarify question counts.
- Add proof or soften absolute wording.
- Add source handling for PRC statistic.

### P3: UX/accessibility polish

- Contrast pass.
- Reduced-motion pass.
- Mobile fold and page-length pass.
- Hover affordance cleanup.
- Screen reader separator and mockup semantics.

### P4: Feature proof upgrades

- Upgrade 3D Lab proof or move lower.
- Add next-action analytics mockup.
- Show source trail from question to Wiki.
- Add diagnostic/free-start flow proof if available.

---

## 18. Reviewer Questions

Send these questions with the audit when asking for outside feedback.

### 18.1 Positioning questions

1. After reading the hero, can you say what SlateCamp is in one sentence?
2. Does `readiness engine for the LEA` feel clear, valuable, and differentiated?
3. Does `Know you'll win.` feel motivating, too confident, or appropriately bold?
4. Does the page feel LEA-specific enough, or could it be mistaken for generic test prep?
5. Is the review-center comparison respectful enough for the Philippine exam-prep context?

### 18.2 Conversion questions

1. Is `Get Your Free Readiness Score` the right primary CTA?
2. At what point in the page did you feel ready to click?
3. Which section most increased trust?
4. Which section felt least necessary before signup?
5. What objection did the page fail to answer?

### 18.3 Product clarity questions

1. Do you understand what the Readiness Score measures?
2. Do you understand how questions, explanations, Wiki, and analytics connect?
3. Does the page make clear what is free versus premium?
4. Are the study modes understandable?
5. Does 3D Lab feel like a core differentiator or a distraction?

### 18.4 Credibility questions

1. Which claims need proof before you believe them?
2. Does `verified by licensed architects` feel credible as written?
3. Does `1 in 3` need a visible source link?
4. Are the code citations convincing?
5. Does any copy feel like hype rather than evidence?

### 18.5 UX/accessibility questions

1. Is any text hard to read over the hero background?
2. Does the page feel too long on mobile?
3. Do any cards appear clickable when they are not?
4. Is the CTA visible enough at key moments?
5. Do animations feel helpful, distracting, or unnecessary?

---

## 19. Acceptance Criteria for the Next Landing Iteration

A strong next iteration should satisfy these criteria:

1. A first-time visitor can explain SlateCamp as a premium architecture learning platform / study companion within 10 seconds, with LEA readiness visible as the strongest pathway.
2. The first two scrolls clearly show the four pillars: Knowledge Resources, Quizzes, 3D Lab, and Free Tools.
3. The page clearly explains the readiness loop before listing secondary features.
4. Readiness Score appears as the central LEA pathway promise, not the whole product identity.
5. Questions, Wiki, 3D Lab, Free Tools, and Analytics feel connected.
6. The primary CTA is consistently outcome-based.
7. Numeric and authority claims are verified or softened.
8. Hero small-text contrast passes review.
9. Reduced-motion behavior is verified.
10. Mobile page order is coherent when sections stack.
11. 3D Lab visibly proves 3D value within the broader four-pillar offer.
12. The review-center comparison feels complementary, not hostile.
13. The final CTA resolves anxiety by offering a concrete first step.

---

## 20. Bottom Line

SlateCamp does not need a generic prettier landing page.

It needs a sharper argument.

The current hero is directionally strong because it understands the emotional job: candidates want confidence before exam day. But after the 2026-05-07 brand-cue research, the final public hero should avoid sounding too narrowly LEA-only or too local-directory-like. SlateCamp should feel like a premium architecture study companion first, then prove its Philippine-code and LEA relevance.

The rest of the page should now prove how SlateCamp creates that confidence:
- practice creates signal,
- signal creates focus,
- focus creates readiness.

Reviewer-facing summary:

> The landing page has a strong emotional job: reduce uncertainty and give students a concrete next step. The final public framing should now broaden from LEA-only readiness engine to premium architecture study companion: source-backed resources, quizzes, 3D labs, and free tools for school, boards, and practice. Use Philippine specificity as proof/scope/SEO, not as the first prestige cue. Keep `Get Your Free Readiness Score` as the strongest LEA pathway, but make the first two scrolls prove the four-pillar platform. The body should not feel like `we have quizzes, Wiki, analytics, and 3D`; it should feel like `you are not alone with scattered PDFs, reviewer notes, code confusion, and uncertainty — SlateCamp organizes what you need and tells you what to do next.`

---

## 21. Quick Revision Brief for Designers and Builders

If the next task is implementation, use this brief:

1. Do not implement final copy until the brand-cue messaging gate is finalized.
2. Keep current premium visual direction, but revise public hero wording away from LEA-only and away from local-directory language.
3. Use a hero direction like `Your architecture study companion.`
4. Use Philippine specificity in the subheadline/trust line/metadata/proof, not necessarily the hero headline.
5. Keep primary CTA as `Get Your Free Readiness Score` for logged-out users.
6. Add `Explore Knowledge Resources` and `Open Free Tools` as broader product CTAs.
7. Rename or internally treat SocialProofBar as a trust strip.
8. Add a new readiness-loop / `Stop studying blind` section before feature showcase.
9. Make four pillars explicit in the first two scrolls: Knowledge Resources, Quizzes, 3D Lab, Free Tools.
10. Reframe Wiki as source-backed mistake recovery and resource center.
11. Make 3D Lab visibly prove interactive spatial/code value.
12. Reframe comparison around `Review centers teach. SlateCamp helps you check what stuck.`
13. Add university-safe copy: supports classes/review groups, does not replace instructors.
14. Run type-check, lint, browser console, mobile visual, contrast, and reduced-motion checks before calling it done.

