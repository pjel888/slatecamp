# Landing Page Final Messaging Gate

**Date:** 2026-05-07
**Status:** Superseded by Atlas/resource-positioning correction; retained as historical messaging gate and implementation checklist
**Branch:** `feat/modal-standardization-kimi26`
**Primary plan:** `.ai/03_plans/2026-05-07-landing-page-platform-positioning-plan.md`
**Primary audit:** `.ai/02_audits/2026-05-05-landing-page-audit.md`
**Research inputs:**
- `.ai/13_research/landing-brand-positioning-2026-05-07/strategy-packet.md`
- `.ai/13_research/reddit-sentiment-landing-positioning-2026-05-07/sentiment-and-platform-positioning-report.md`
- `.ai/13_research/filipino-consumer-brand-positioning-2026-05-07/brand-cue-and-exam-buyer-psychology-report.md`

---

## 1. Gate verdict

**HISTORICAL / SUPERSEDED VERDICT:** This file is no longer the go/no-go source for hero copy or hero visual direction. Use `.ai/03_plans/2026-05-07-slatecamp-atlas-landing-master-plan.md` for the current direction. This file remains useful only for legal, route, CTA, signup-gating, and implementation checklist details.

The previous messaging gate is **superseded** by the Atlas/resource-positioning correction in `.ai/03_plans/2026-05-07-slatecamp-atlas-landing-master-plan.md`. Keep this document as a checklist for legal, route, CTA, gating, and implementation details, but do not treat `study companion` as the final hero category.

Updated positioning:

> **SlateCamp is an architecture knowledge atlas: source-backed resources, visual explanations, quizzes, 3D labs, and practical tools for school, board-review season, and practice context.**

Brand-cue rule:

> **Use Philippine specificity as proof, scope, SEO, and trust. Do not use it as the first emotional prestige cue in the hero.**

Public exam-name rule:

> **In user-facing landing-page copy, spell out `Licensure Examination for Architects` instead of using `LEA`. Use `LEA` only in metadata keywords, internal implementation notes, or after the full phrase if space is genuinely constrained.**

Free-resource gating rule:

> **It is acceptable — and strategically preferred — for most free resources to require account creation and live inside the dashboard. The landing page should still show public previews, but CTAs may truthfully route to signup/dashboard as `free after signup` or `start with a free account`. This supports onboarding, analytics, ads/remarketing audiences, and product learning. Do not imply an ungated public Wiki or public 3D Lab exists unless it does.**

Ecosystem stance:

> **Review centers teach. SlateCamp helps students check what stuck, repair mistakes, and plan the next study session.**

University stance:

> **SlateCamp supports architecture instruction. It does not replace instructors, review centers, official sources, or licensed professional judgment.**

---

## 2. Final hero copy

### 2.1 Preferred hero set

**Eyebrow:**

> Architecture learning platform

**Headline:**

> Your architecture study companion.

**Subheadline:**

> Source-backed resources, quizzes, 3D labs, and free tools for architecture school, Licensure Examination for Architects readiness, and professional practice.

**Local trust line:**

> Built around Philippine codes, board-review realities, and the way architecture students actually study.

**Primary CTA:**

> Get Your Free Readiness Score

**Secondary CTA:**

> Explore Free Tools

**Optional tertiary link if layout supports it:**

> Browse Free Knowledge Resources

### 2.2 Hero supporting proof pills

Use proof language that explains the offer, not internal methodology.

Preferred pills:

1. Source-backed explanations
2. Licensure Examination for Architects readiness map
3. Interactive 3D lab
4. Free architecture tools

Avoid first-scroll pills:

- SRS
- SM-2
- IRT-calibrated
- EMA-weighted
- Taxonomy heatmap
- Active recall
- Cognitive-first

These can appear later in deeper “how it works” copy if translated into user language.

### 2.3 Hero accessibility label

Replace the current `aria-label='Professional LEA review platform.'` with:

> Architecture learning platform for school, Licensure Examination for Architects readiness, and practice.

### 2.4 Hero visual requirement: interactive NBCP setbacks card

The hero should not rely on a generic dashboard mockup if implementation capacity allows a stronger proof artifact. The recommended hero-side visual is an interactive **Setback Explorer**: a compact Three.js / React Three Fiber card that visualizes the buildable envelope after applying setbacks under the National Building Code of the Philippines / PD 1096 IRR.

**Why this belongs in the hero:**

- It immediately proves that SlateCamp is not just a quiz bank.
- It turns a high-friction Philippine code topic into something visible.
- It gives architecture students, board-review candidates, and early practitioners a shared reason to care.
- It differentiates SlateCamp against static code libraries and PDF/reference competitors.

**Minimum interaction spec:**

1. User can switch zoning class or simplified zoning type.
2. User can switch building/use type if the current computation engine supports it; otherwise label this as a future control and keep the live demo to verified zoning/RROW inputs.
3. User can adjust lot width/depth or choose a sample lot.
4. Card shows front/rear/left/right setbacks and the remaining buildable envelope.
5. The 3D mass/lot preview updates visually as controls change.
6. Provide a static fallback image/state for low-power devices, reduced motion, or WebGL failure.

**Source/legal guardrail:**

- Public copy may say `National Building Code of the Philippines / PD 1096 setback visualizer` only if the numeric logic uses verified source-backed tables.
- Existing code already has relevant PD 1096 infrastructure in `src/lib/pd1096/computationEngine.ts`, `src/lib/pd1096/zoningTables.ts`, and `src/features/3d-lab/DevControlsModule/dashboard/splits/SetbackControls.tsx`; implementation should reuse or extract from those rather than hardcoding marketing-only numbers.
- Before exposing exact setback values publicly, verify the source trail against PD 1096 IRR Rule VII Sec. 704 and Rule VIII Sec. 804 / Tables VIII.2-VIII.3, or show the card as a clearly labeled educational preview.
- Add disclaimer copy near the card or footer: `For study and visualization only. Verify current requirements with the official code, local ordinances, and a qualified professional.`

**Acquisition/data guardrail:**

- It is acceptable to require signup for full free resources, quizzes, 3D Lab, and saved tools.
- Keep public CTAs honest: `Start free`, `Create a free account`, `Preview`, or `Free after signup` are safer than implying everything is instantly open with no account.
- Data collection for analytics, ads, and onboarding must stay privacy-policy/consent compliant; do not use dark-pattern copy or hide account requirements.

**Hero microcopy option:**

> Try a setback. Watch the buildable envelope change.

---

## 3. SEO and metadata gate

### 3.1 Page title

Use:

> SlateCamp | Architecture Study Companion for Licensure Examination for Architects and Practice

Rationale:

- It keeps the page premium and broad.
- It includes the full Licensure Examination for Architects phrase for intent, clarity, and search.
- It avoids leading with “Philippine” as the emotional cue.

### 3.2 Meta description

Use:

> Source-backed architecture resources, quizzes, 3D labs, and free tools for Philippine codes, Licensure Examination for Architects readiness, architecture school, and practice.

Length note: expanded intentionally to include the full exam phrase.

### 3.3 Open Graph

**OG title:**

> SlateCamp | Your Architecture Study Companion

**OG description:**

> Study with source-backed resources, quizzes, 3D labs, and free tools built around Philippine codes, Licensure Examination for Architects readiness, and architecture practice.

Length note: expanded intentionally to include the full exam phrase.

### 3.4 Twitter card

**Twitter title:**

> SlateCamp | Your Architecture Study Companion

**Twitter description:**

> Resources, quizzes, 3D labs, and free tools for architecture school, Licensure Examination for Architects readiness, and practice.

Length note: expanded intentionally to include the full exam phrase.

### 3.5 Keyword direction

Keep Philippine and Licensure Examination for Architects terms in metadata, but remove mechanism-first terms from the primary keyword list unless they remain important for long-tail search.

Preferred keyword groups:

- Licensure Examination for Architects exam prep
- Licensure Examination for Architects reviewer Philippines
- Licensure Examination for Architects
- architecture learning platform Philippines
- Philippine architecture codes
- NBCP reviewer
- PD 1096 reviewer
- BP 344 reviewer
- RA 9266 reviewer
- architecture quiz app Philippines
- architecture calculators Philippines
- architecture school resources
- architecture 3D learning
- SlateCamp

Demote or remove from primary keywords:

- spaced repetition architecture exam
- active recall architecture exam
- cognitive-first review platform

---

## 4. First two scrolls: required information architecture

The first two scrolls must let a new visitor answer four questions quickly:

1. What is this?
2. Is it for someone like me?
3. What do I get for free?
4. How does it help if I am preparing for the Licensure Examination for Architects?

Required sequence:

1. Hero: premium architecture study companion.
2. Proof line: Philippine codes and board-review realities.
3. Primary CTA: free Readiness Score.
4. Secondary CTA: Free Tools or Knowledge Resources.
5. Four pillars: Knowledge Resources, Quizzes, 3D Lab, Free Tools.
6. Licensure Examination for Architects pathway: taking the boards, get a readiness map.
7. Companion stance: review centers teach, SlateCamp measures and reinforces.
8. Legal-safe trust note: educational resource, source-backed, verify current requirements.

---

## 5. Four-pillar copy

### 5.1 Knowledge Resources

**Label:**

> Knowledge Resources

**Headline:**

> Stop hunting through scattered PDFs.

**Body:**

> Use source-backed explainers, code guides, field notes, and visual references built around architecture school, Philippine codes, and Licensure Examination for Architects review.

**Proof bullets:**

- Code explainers for common board-review topics
- Field-guide style pages for fast orientation
- Source-linked references where available
- Built to connect school, review, and practice

**CTA:**

> Browse Free Knowledge Resources

### 5.2 Quizzes

**Label:**

> Quizzes

**Headline:**

> Know what stuck after lecture.

**Body:**

> Practice with diagnostics, drills, simulations, and explanations that turn missed answers into the next topic to repair.

**Proof bullets:**

- Free Readiness Score entry point
- Weak-topic map after practice
- Explanations tied back to resources
- Review mode, drills, and simulations as separate pathways

**CTA:**

> Get Your Free Readiness Score

### 5.3 3D Lab

**Label:**

> 3D Lab

**Headline:**

> See spatial rules, not just numbers.

**Body:**

> Explore interactive 3D examples for code, space, circulation, accessibility, and building concepts that are hard to learn from text alone.

**Proof bullets:**

- Interactive examples for visual learners
- Code and spatial concepts made visible
- Useful for school, review, and practice context
- Strong free-layer differentiator against static code libraries

**CTA:**

> Preview the 3D Lab

### 5.4 Free Tools

**Label:**

> Free Tools

**Headline:**

> Practical calculators, free from day one.

**Body:**

> Use calculators and utilities for estimates, quick checks, and study context: paint, tiles, CHB, drywall, lot/buildability, occupancy, egress, and more as they are released.

**Proof bullets:**

- Useful even before board review
- Useful after board review
- Strong acquisition surface for students and professionals
- Clear educational boundaries, not project-specific professional advice

**CTA:**

> Open Free Tools

---

## 6. Required interactive proof sections

The next landing page should not only describe features. It should let visitors touch the product idea in three small, safe previews before asking for signup. These previews are conversion proof, not decoration.

### 6.1 Wiki / Knowledge Resource preview

**Purpose:** Make the Wiki/Code Atlas feel like a main product surface, not a secondary documentation page.

**Recommended interaction:**

- A searchable or tabbed mini article card for a high-interest topic such as setbacks, occupancy, accessibility, or fire exits.
- Show a short explanation, a source trail label, and related resources.
- Include a `Browse Free Knowledge Resources` CTA. Public page may show a preview; the full Wiki/Code Atlas can be dashboard-gated after signup by design.

**Copy angle:**

> Find the rule, see the explanation, then jump into the quiz or 3D example that reinforces it.

### 6.2 Quiz preview with slide-style answer interaction

**Purpose:** Show the readiness loop instead of merely claiming quizzes exist.

**Recommended interaction:**

- Show one mock board-style question tied to a Wiki topic.
- Let the visitor pick an answer.
- Use a slide-to-submit style affordance for delight, but do not make dragging the only submit path. Keep an accessible `Submit answer` button or keyboard fallback.
- After submit, reveal a concise explanation, source/resource link, and `Readiness impact` micro-panel such as `Weak topic found: Setbacks`.

**Copy angle:**

> Every missed answer should become a next step, not just a red mark.

### 6.3 3D setbacks / buildable-envelope preview

**Purpose:** Make 3D Lab the signature differentiator. This is the highest-impact interactive card and should be considered for the hero visual itself.

**Recommended interaction:**

- Visualize a lot, required setbacks, and buildable envelope in a compact Three.js card.
- Controls: zoning class/type, RROW or sample road width, lot dimensions, optional building/use type if source-backed.
- Output: per-side setbacks, buildable width/depth, and a clear `study only` source/disclaimer line.
- Link the preview to signup/dashboard for the full 3D Lab, or to a homepage anchor for the preview. A protected dashboard route is acceptable by design.

**Copy angle:**

> Setbacks are easier to understand when the lot shrinks in front of you.

---

## 7. Licensure Examination for Architects pathway section

### 7.1 Section purpose

This section keeps the emotional board-exam wedge without making the entire brand board-exam-only.

### 7.2 Recommended copy

**Eyebrow:**

> Taking the boards?

**Headline:**

> Turn review into a readiness map.

**Body:**

> SlateCamp helps you see what you know, what you missed, and what to fix next before weak topics surprise you too late.

**Loop bullets:**

1. Answer Licensure Examination for Architects-style questions.
2. Read the explanation and source-linked topic.
3. See your weak subjects and topics update.
4. Repair the gap with resources, 3D examples, or another drill.
5. Come back with a clearer plan for tonight’s study session.

**Fear-marketing line:**

> The danger is not having weak spots. The danger is discovering them too late.

**Control line directly after fear copy:**

> Start with a free Readiness Score and turn that uncertainty into a study plan.

**CTA:**

> Get Your Free Readiness Score

### 7.3 Avoid

- Guaranteed pass language
- “Predict your PRC result”
- “Official Licensure Examination for Architects platform”
- “Replace your review center”
- Shame language toward retakers
- Unverified passing-rate or topnotcher claims

---

## 8. Review-center companion section

### 8.1 Section purpose

Position SlateCamp beside JPT, CDEP, APR, TopLab, school review groups, mentors, and self-review communities without attacking or replacing them.

### 8.2 Recommended copy

**Eyebrow:**

> Built beside your review system

**Headline:**

> Review centers teach. SlateCamp helps you check what stuck.

**Body:**

> Use SlateCamp after lectures, mock exams, and self-study sessions to test retention, repair mistakes, and choose the next topic. It is the always-on companion beside your instructor, mentor, or review center.

**Proof bullets:**

- After lecture: check if the topic stayed with you
- After mock exams: identify which misses were patterns, not accidents
- During self-study: choose tonight’s highest-value topic
- Before exam day: reduce surprise by making weak spots visible

**CTA:**

> Test What Stuck

### 8.3 Legal/tone guardrail

Do not name JPT, CDEP, APR, TopLab, or any review center in public comparison copy unless a partnership, citation, or legal review supports it. The public copy should say `review centers`, `review groups`, `lectures`, and `instructors` generically.

---

## 9. University and educator section

### 9.1 Section purpose

Make SlateCamp partnership-safe for architecture programs without promising institutional relationships or outcome guarantees.

### 8.2 Recommended copy

**Eyebrow:**

> For architecture programs and review groups

**Headline:**

> Support instruction with resources, diagnostics, and interactive labs.

**Body:**

> SlateCamp can support architecture classes, review groups, and self-study with source-backed references, diagnostic quizzes, 3D explainers, and practical tools. It is built to reinforce instruction, not replace instructors.

**Proof bullets:**

- Source-backed topic pages for local code and review context
- Diagnostic practice for identifying weak topics
- 3D explainers for spatial and code concepts
- Practical calculators for school and early practice workflows
- Future instructor-aligned modules if a partnership is signed

**CTA:**

> Explore Educator Use Cases

### 9.3 Avoid

- “Trusted by universities” unless signed
- “Partnered with schools” unless signed
- “Official school resource” unless contracted
- “Improves board passing rate” unless verified by defensible data

---

## 10. Legal-safe trust and disclaimer copy

### 10.1 Short homepage disclaimer

Use near the footer or trust section:

> SlateCamp is an educational study platform. It is not an official PRC, PRBoA, university, review-center, or government source. Always verify current code requirements, exam rules, and project decisions with the official source or a qualified professional.

### 10.2 Calculator disclaimer

Use near the tools section or individual calculators:

> Calculators are for study, estimating, and educational reference. They are not a substitute for signed professional computations, site-specific design judgment, or current authority requirements.

### 10.3 Source-backed claim rule

Allowed:

- Source-backed explanations
- Built around Philippine codes
- Licensure Examination for Architects readiness pathway
- Educational references and calculators
- Helps identify weak topics

Needs verification before use:

- Exact number of source-backed articles
- Exact question-bank size
- Exact PRC result statistics
- “Built by a licensed architect”
- Topnotcher/testimonial claims
- University or review-center partner claims
- Any “most accurate,” “best,” “only,” or “guaranteed” claim

Avoid unless legally cleared and sourced:

- Official PRC/PRBoA language
- Pass guarantee
- Predict your board result
- Replace review center
- Licensed professional advice

---

## 11. A/B-ready headline sets

### Variant A: Companion umbrella, preferred default

**Eyebrow:** Architecture learning platform

**Headline:** Your architecture study companion.

**Subheadline:** Source-backed resources, quizzes, 3D labs, and free tools for architecture school, Licensure Examination for Architects readiness, and professional practice.

**Best for:** broadest positioning, university safety, premium/global-caliber first impression.

### Variant B: Assurance and uncertainty

**Eyebrow:** Architecture learning platform

**Headline:** Know what you understand, what you missed, and what to do next.

**Subheadline:** SlateCamp turns architecture review into source-backed resources, quizzes, 3D examples, free tools, and a clearer Licensure Examination for Architects readiness map.

**Best for:** board-review anxiety and conversion.

### Variant C: Anti-resource-overload

**Eyebrow:** Architecture learning platform

**Headline:** Learn architecture with a map, not a pile of PDFs.

**Subheadline:** Organize codes, topics, quizzes, 3D explainers, and practical tools into one study companion for school, boards, and practice.

**Best for:** students overwhelmed by scattered reviewers, Google Drive folders, Discord links, and YouTube resources.

### Variant D: Licensure Examination for Architects-forward pathway, not whole brand

**Eyebrow:** Architecture learning platform

**Headline:** Taking the boards? Stop studying blind.

**Subheadline:** Get a free readiness score, find weak topics, and repair missed concepts with source-backed resources, quizzes, 3D labs, and tools.

**Best for:** paid acquisition or Licensure Examination for Architects-specific campaign pages, not the default homepage if the broader umbrella is the priority.

### Variant E: School-to-practice bridge

**Eyebrow:** Architecture learning platform

**Headline:** From studio to boards to practice, keep architecture knowledge within reach.

**Subheadline:** Use source-backed resources, quizzes, 3D labs, and free tools built around Philippine codes and real study workflows.

**Best for:** university and professional-practice positioning.

---

## 12. Implementation mapping

### 12.1 Files to modify first

1. `src/app/page.tsx`
   - Replace metadata title, description, OG title, OG description, Twitter title, Twitter description, and keywords.

2. `src/components/landing/LandingPageContent.tsx`
   - Reorder or insert sections so the first two scrolls show the hero promise, one hero-side interactive Setback Explorer, the four pillars, and the Licensure Examination for Architects pathway without becoming a crowded feature catalog.
   - Confirm CTA props and section anchors line up with the route map below.

3. `src/components/landing/LandingPageFallback.tsx`
   - Update fallback copy so users do not briefly see stale board-exam-only or old CTA language while the Suspense fallback renders.

4. `src/components/marketing/HeroSection.tsx`
   - Replace eyebrow copy.
   - Replace `aria-label`.
   - Replace hero proof pills in `STATS`.
   - Add or expose secondary CTA if the layout allows it.
   - Replace the generic hero visual with an interactive or safely degraded NBCP/PD 1096 setbacks/buildable-envelope card if performance allows.

5. `src/components/marketing/HeroHeadline.tsx`
   - Replace the headline with `Your architecture study companion.`
   - Add or align subheadline if this component owns the subheadline text.

6. `src/components/marketing/SocialProofBar.tsx`
   - Replace old mechanism or “every question” proof claims with softer trust-strip language unless exact claims are verified.

7. `src/components/marketing/BentoFeatureGrid.tsx`
   - Replace mechanism-first cards with four-pillar offer clarity.
   - Remove first-scroll jargon such as `Active Recall`, `IRT-Calibrated`, `EMA-Weighted`, and `Taxonomy heatmap` unless translated.

8. `src/components/marketing/QuestionsSection.tsx`
   - Reframe as diagnostics, drills, simulations, explanations, and mistake repair.
   - Remove or verify any “every question,” “expert verified,” exact-count, or prediction-style claims.

9. `src/components/marketing/AnalyticsSection.tsx`
   - Translate analytics into readiness-map language: what is strong, weak, and next.

10. `src/components/marketing/HowItWorksSection.tsx`
    - Translate methodology into user benefits. Keep SRS/IRT/EMA out of first-scroll copy.

11. `src/components/marketing/ComparisonSection.tsx`
    - Reframe from “review center replacement” or generic comparison into companion stance.

12. `src/components/marketing/WikiSection.tsx`
    - Reframe as `Knowledge Resources` or `Code Atlas / Field Guide`.
    - Add a compact interactive preview: mini article/search/topic card, source trail label, related quiz/3D/resource links.

13. `src/components/marketing/ThreeDLabSection.tsx`
    - Reframe 3D as spatial/code understanding, not novelty.
    - Prioritize the setbacks/buildable-envelope demo as the signature card; reuse `src/lib/pd1096` tables/computation where possible.

14. `src/components/marketing/MarketingNav.tsx`
    - Align nav anchors/labels with the final pillars and CTA route map.

15. `src/components/marketing/FinalCtaSection.tsx`
    - Keep Readiness Score CTA but include broader companion promise.

16. `src/components/marketing/MarketingFooter.tsx`
    - Add short educational/source/legal disclaimer if not already present.

### 12.2 Possible new sections/components

Only add new components if existing sections cannot absorb the new copy cleanly.

Preferred additions:

- `src/components/marketing/HeroSetbackExplorerCard.tsx`
- `src/components/marketing/InteractiveWikiPreview.tsx`
- `src/components/marketing/InteractiveQuizPreview.tsx`
- `src/components/marketing/FreeToolsSection.tsx`
- `src/components/marketing/CompanionProofSection.tsx`
- `src/components/marketing/EducatorSupportSection.tsx`
- `src/components/marketing/LegalTrustSection.tsx`

Implementation should stay lean. Do not build a large new marketing framework just to change copy. Exception: the hero-side Setback Explorer is allowed to be a real interactive proof component because it materially changes conversion, differentiation, and product comprehension.

### 12.3 CTA route map

Use existing routes unless the implementation creates a public route intentionally.

- `Get Your Free Readiness Score`: `ROUTES.auth.register` for logged-out users; route logged-in users toward the dashboard quiz/readiness path. If the post-register flow does not immediately lead to a readiness diagnostic, soften the CTA to `Start Free` or `Create a Free Account`.
- `Explore Free Tools` / `Open Free Tools`: `ROUTES.calculators.root` (`/tools`) when the tool is public; otherwise `ROUTES.auth.register` with copy such as `Use free tools after signup`.
- `Browse Free Knowledge Resources`: public preview may be an in-page anchor (`#knowledge-resources`), but the full Wiki/Code Atlas can intentionally route to `ROUTES.auth.register` / `ROUTES.wiki.root` because dashboard-gated free resources support onboarding, analytics, ads, and retention.
- `Preview the 3D Lab`: public hero/section preview stays on-page; full 3D Lab can route through signup to `ROUTES.lab.root` (`/dashboard/3d-lab`). Protected access is acceptable as long as copy says `preview`, `free account`, or `after signup`.
- `Explore Educator Use Cases`: route to `/contact` or an in-page educator section. Do not imply a partnership portal exists.

### 12.4 Above-the-fold density rule

The first two scrolls must be clear, not crowded. Priority order:

1. Hero promise and local trust line.
2. Primary CTA plus one broad secondary CTA.
3. Four-pillar clarity.
4. Licensure Examination for Architects readiness pathway.
5. Companion stance.
6. Legal disclaimer compactly near the trust/footer/tools area, not as a heavy fear-inducing block above the fold.

### 12.5 Public-copy guardrails from reviewer pass

- Treat this final messaging gate as authoritative over older board-exam-first audit sections.
- Use `professional practice` sparingly in public hero copy. Prefer `practice context`, `professional practice context`, or `early practice workflows` when disclaimers are not nearby.
- Keep `future instructor-aligned modules if partnered` as internal roadmap wording unless there is a signed partnership or a live educator feature.
- Do not apply `source-backed` to a specific page, article count, question count, or section unless that specific claim is verified.
- Validate that fallback, nav, social proof, and footer copy do not preserve old mechanism-first or board-exam-only positioning.

---

## 13. Implementation acceptance criteria

The landing implementation passes this messaging gate only if:

1. The hero uses the preferred headline or a clearly documented A/B variant.
2. The first two scrolls show a meaningful interactive proof surface, preferably the NBCP/PD 1096 setbacks/buildable-envelope card, plus the four pillars: Knowledge Resources, Quizzes, 3D Lab, Free Tools.
3. Philippine specificity appears as proof/trust/SEO/scope, not as the first emotional headline.
4. Licensure Examination for Architects readiness remains visible through the free Readiness Score pathway.
5. The page does not position SlateCamp as a review-center replacement.
6. The page includes university/educator-compatible support language.
7. The page includes legal-safe educational/source/calculator boundaries.
8. First-scroll copy avoids SRS/IRT/EMA/active-recall jargon or translates it into user language.
9. Claims about counts, official status, partnerships, pass rates, and licensed authorship are verified or softened.
10. Primary CTA remains clear for board-review candidates; secondary CTA exposes free tools or resources for non-board-review visitors.
11. User-facing landing copy spells out `Licensure Examination for Architects` instead of relying on `LEA` shorthand.
12. The quiz preview has an accessible submit path; slide-to-submit may be used as enhancement, not the only control.
13. The setbacks visualizer does not expose unverified code dimensions or imply professional/code-compliance advice.
14. Free-resource CTAs are honest about signup/dashboard gating where applicable; gating is treated as acquisition/onboarding strategy, not a product flaw.

---

## 14. Bottom line for the implementer

Do not build a prettier version of the old board-exam-only landing page.

Build this:

> A premium architecture study companion that feels world-class first, proves Philippine relevance second, and gives anxious students a concrete path from scattered resources to a clearer next study session.

The homepage should make SlateCamp feel useful before, during, and after the Licensure Examination for Architects, while still making `Get Your Free Readiness Score` the strongest conversion doorway for board-review candidates.
