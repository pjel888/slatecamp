# Landing Hero Copy + UI Improvement Research

**Date:** 2026-05-08
**Branch:** `feat/landing-3d-hero-best-representation`
**Scope:** Research/planning plus follow-up implementation note.
**Philip decision after research:** Keep the H1 `Know you’ll win.` exactly. Apply improvements only to the surrounding support copy, trust language, hero bridge, and Atlas Index.
**Primary files inspected:**
- `src/components/marketing/HeroSection.tsx`
- `src/components/landing/LandingPageContent.tsx`
- `src/components/marketing/SocialProofBar.tsx`
- `src/components/marketing/BentoFeatureGrid.tsx`
- `src/components/marketing/QuestionsSection.tsx`
- `src/components/marketing/AnalyticsSection.tsx`
- `src/components/marketing/ComparisonSection.tsx`

---

## 1. Current hero state

Current first-fold messaging:

- **Eyebrow:** `Architecture knowledge atlas`
- **Headline:** `Know you’ll win.`
- **Support:** `SlateCamp turns scattered architecture review into a calmer map: find the topic, understand the idea, check what stayed, and choose what to fix next.`
- **Primary CTA:** `Open the atlas`
- **Secondary CTA:** `Find a topic`
- **Trust line:** `Use beside school, books, mentors, notes, review materials, and self-study. SlateCamp is an independent educational resource; verify current requirements with primary documents and qualified professionals.`
- **Hero bridge:** `Source-backed references · Visual explanations · Clear next pass`
- **Right-side index:** Find / Check / See / Revisit

Current visual direction is strong and should be preserved:

- Board 2 leads: editorial typography, atlas framing, right-side index.
- Board 1 supports: atmospheric terrain/image, cursor halftone wake, subtle white atlas field.
- Board 3 stays below the hero: product proof sections after first fold.

---

## 2. Core diagnosis

The visual system now feels close to the approved premium atlas direction. The remaining weakness is **copy precision**.

The hero needs to speak more directly to the actual user psychology:

- Students and LEA reviewees are not buying SRS, active recall, quizzing methods, IRT, or a dashboard.
- They are buying comfort, orientation, reliability, and a calmer answer to: **“What should I study next?”**
- SlateCamp should not sound like a review-center replacement or pass-guarantee product.
- SlateCamp should feel like a reliable supplementary field guide beside school, review centers, books, notes, mentors, codals/code documents, and self-study.

The current H1, `Know you’ll win.`, is memorable and emotionally strong, but it carries two risks:

1. **Legal/claim risk:** It can be read as a board-exam outcome promise.
2. **Positioning risk:** It sounds closer to review-center confidence marketing than a calm architecture knowledge atlas.

The rest of the hero is responsible, but the H1 is the largest and earliest claim. It frames the page before the disclaimer can soften it.

---

## 3. Recommended strategic shift

Move from:

> **Outcome certainty** — “you’ll win”

To:

> **Study clarity** — “you’ll know what to fix next”

This preserves the emotional promise without implying licensure success, official authority, or review-center replacement.

Best public promise:

> SlateCamp helps architecture learners turn scattered review into a clearer map of what to find, understand, check, and revisit next.

Best emotional enemy:

> Studying hard but still not knowing what is weak, what matters, or what to repair next.

Best ethical fear line:

> The danger is not having weak spots. The danger is discovering them too late.

But this fear line should generally live below the hero or in the board-review pathway section, not as the main H1.

---

## 4. Hero copy options

### Option A — Best overall balance

**Eyebrow:**
`For architecture students and LEA reviewees`

**H1:**
`Review with a clearer map.`

**Support:**
`SlateCamp helps turn scattered architecture topics into a calmer study path: find the topic, understand the idea, check weak spots, and know what to revisit next — beside your school, books, mentors, review materials, and review center.`

**Primary CTA:**
`Find a topic`

**Secondary CTA:**
`See how SlateCamp works`

**Trust line:**
`SlateCamp is an independent educational resource, not an official source or review-center replacement. Use it beside primary documents, qualified professionals, school materials, and review-center guidance.`

**Why it works:**
Clear, safe, audience-specific, and aligned with the atlas metaphor.

---

### Option B — Strongest emotional relief

**Eyebrow:**
`A calmer field guide for architecture review`

**H1:**
`Less panic. Clearer next steps.`

**Support:**
`When architecture review feels scattered, SlateCamp helps you organize topics, understand concepts, and spot what needs another look — so your next study session feels more focused and less overwhelming.`

**Primary CTA:**
`Start with a topic`

**Secondary CTA:**
`Explore the atlas`

**Trust line:**
`Use SlateCamp as supplementary study support beside school, books, mentors, notes, review materials, and review centers. It is independent and not an official or guaranteed path to licensure.`

**Why it works:**
Most empathetic and student-centered. Slightly less premium/editorial than Option A.

---

### Option C — Safest direct replacement for current H1

**Eyebrow:**
`Architecture knowledge atlas`

**H1:**
`Know what to fix next.`

**Support:**
`SlateCamp turns scattered architecture review into a calmer map: find the topic, understand the idea, check what stuck, and choose the next weak spot to repair.`

**Primary CTA:**
`Open the atlas`

**Secondary CTA:**
`Find a topic`

**Trust line:**
`Use beside school, books, mentors, notes, review materials, review centers, and self-study. SlateCamp is independent educational support, not an official source or pass guarantee.`

**Why it works:**
Keeps the punch of `Know you’ll win.` while removing pass-guarantee risk.

---

### Option D — Most board-season specific

**Eyebrow:**
`For Filipino architecture students and LEA reviewees`

**H1:**
`Make board-season review feel less scattered.`

**Support:**
`Use SlateCamp beside your review center, books, notes, mentors, and self-study to find architecture topics, review key ideas, and see what needs more attention next.`

**Primary CTA:**
`Find your next topic`

**Secondary CTA:**
`Browse the atlas`

**Trust line:**
`Independent educational resource only. SlateCamp is not official, not a review center, and not a promise of exam results.`

**Why it works:**
Highest LEA conversion clarity, but less broad as a long-term architecture knowledge platform headline.

---

## 5. Recommended ranking

1. **Option C — `Know what to fix next.`**
   - Best if Philip wants to preserve the current short, bold, high-impact H1 treatment.
   - Strongest direct evolution from `Know you’ll win.`
   - Clear, safe, memorable.

2. **Option A — `Review with a clearer map.`**
   - Best overall strategic balance.
   - Most aligned with atlas/resource positioning and supplementary review-center stance.

3. **Option B — `Less panic. Clearer next steps.`**
   - Best emotional student-first hook.
   - Useful if the page should lean harder into comfort and fear relief.

4. **Option D — `Make board-season review feel less scattered.`**
   - Best for active LEA reviewee conversion.
   - Use only if the hero should prioritize board-season acquisition over broader architecture-resource positioning.

Recommended first experiment:

> **Know what to fix next.**

This is the cleanest replacement because it keeps the large hero’s confidence but changes the promise from outcome certainty to actionable clarity.

---

## 6. Subheadline improvements

Current:

> SlateCamp turns scattered architecture review into a calmer map: find the topic, understand the idea, check what stayed, and choose what to fix next.

Issues:

- Strong concept, but slightly dense.
- `check what stayed` is poetic but less immediately clear than `check what stuck` or `check what you retained`.
- It does not explicitly name the supplementary role beside review materials/review centers until the smaller disclaimer.

Recommended version for Option C:

> SlateCamp turns scattered architecture review into a calmer map: find the topic, understand the idea, check what stuck, and choose the next weak spot to repair.

Alternative with stronger audience fit:

> Use SlateCamp beside school, review materials, books, and mentors to map confusing architecture topics, check what stuck, and choose what to review next.

Alternative with broader atlas tone:

> Source-backed references, visual explanations, practice checks, and weak-topic signals in one calmer map for school, board season, and practice context.

---

## 7. CTA improvements

Current CTAs:

- `Open the atlas`
- `Find a topic`

Assessment:

- `Open the atlas` is beautiful and on-brand, but slightly abstract.
- `Find a topic` is more concrete and may better answer the user’s immediate need.

Recommended CTA pairs:

### If keeping atlas-first brand
- Primary: `Open the atlas`
- Secondary: `Find a topic`

### If improving conversion clarity
- Primary: `Find a topic`
- Secondary: `See how SlateCamp works`

### If signup is required and must be explicit
- Primary: `Create a free account`
- Secondary: `Preview a topic first`

### If broad resource positioning is desired
- Primary: `Explore the free atlas`
- Secondary: `Try a practice check`

Recommended for next pass:

- Keep `Open the atlas` if routed users land in a meaningful atlas/wiki/dashboard path.
- Consider changing secondary from `Find a topic` to `Preview a topic` if logged-out users are gated.
- If conversion is more important than poetry, make `Find a topic` the primary CTA.

---

## 8. Right-side Atlas Index improvements

Current right-side index is conceptually strong and should remain. It is a better fit than any carded product mockup.

Risk:

- Some labels are still abstract: `See what stayed`, `Choose the next pass`.
- The index looks like it could be clickable, but it is not clear whether it is navigation, explanation, or ornament.

Recommended rewrite:

1. **01 / Find**
   **Find the topic**
   `Open architecture subjects with related ideas and verified source notes where available.`

2. **02 / Understand**
   **See the idea clearly**
   `Use explanations and visuals when rules, forms, or spatial concepts need more than text.`

3. **03 / Check**
   **Spot weak areas**
   `Use practice and topic signals as a calm check, not another reason to panic.`

4. **04 / Revisit**
   **Choose what to review next**
   `Turn scattered study into a clearer next step beside your notes, mentors, and review center.`

UI recommendation:

- Keep it as a lean editorial table of contents.
- Do not turn it into a carded product panel.
- If clickable, add subtle arrows/hover states and route to corresponding sections.
- If not clickable, make it visually less button-like and more index-like.

---

## 9. Trust bridge improvements

Current trust line is accurate but slightly long and legalistic for the hero.

Recommended hero version:

> Use beside your school, review center, books, notes, mentors, and official code documents. SlateCamp is independent educational support, not a review-center replacement, official source, or pass guarantee.

Alternative shorter version:

> Built to support — not replace — your school, review center, books, mentors, notes, and official documents.

Recommendation:

- Use the shorter trust line in the hero.
- Keep the fuller official-source/professional-verification disclaimer in the footer, comparison/trust section, or tool-specific sections.

---

## 10. First-scroll transition improvements

Current order:

1. Hero
2. `SocialProofBar`
3. `BentoFeatureGrid`

This is structurally correct. Product proof stays below the fold.

Suggested `SocialProofBar` refinement:

Current:

- `Built around Philippine codes, visual explanations, and practical tools`
- `Useful for school, boards, and practice with clear educational boundaries`
- `A calmer map for scattered architecture knowledge`

Recommended:

- `References where verified`
- `Visual explanations when text is not enough`
- `Practice signals for the next pass`

Alternative more audience-specific:

- `Beside school, review centers, books, and mentors`
- `Philippine code and board-review context`
- `A clearer next study step`

Purpose:

- Make the first-scroll proof bar feel like a continuation of the hero, not a detached trust strip.
- Keep the language outcome-led rather than mechanism-led.

---

## 11. UI guardrails for implementation

Preserve:

- Full-field atmospheric hero.
- Cursor halftone wake.
- White/light atlas field geometry.
- Editorial typography-led composition.
- Right-side Atlas Index.
- Product proof below hero.
- Two CTAs maximum.
- Short trust bridge.

Avoid:

- Adding a right-side app card/dashboard preview.
- Adding more CTA buttons.
- Reintroducing SRS, active recall, IRT, adaptive quizzing, taxonomy heatmaps, or method-first language.
- Publicly naming JPT, CDEP, APR, TopLab, or other review centers unless legally approved.
- Claiming official-source status, pass probability, prediction, or guaranteed outcomes.
- Making the first fold more crowded.

---

## 12. Recommended next implementation pass

Minimal safe copy pass:

1. Replace H1:
   - From: `Know you’ll win.`
   - To: `Know what to fix next.`

2. Replace support line:
   - To: `SlateCamp turns scattered architecture review into a calmer map: find the topic, understand the idea, check what stuck, and choose the next weak spot to repair.`

3. Replace trust line:
   - To: `Use beside your school, review center, books, notes, mentors, and official code documents. SlateCamp is independent educational support, not a review-center replacement, official source, or pass guarantee.`

4. Refine Atlas Index:
   - `See what stayed` → `Spot weak areas`
   - `Choose the next pass` → `Choose what to review next`
   - Consider adding `Understand` as the second step if the flow becomes `Find / Understand / Check / Revisit`.

5. Run verification:
   - Focused landing test.
   - Type-check/lint.
   - Public-copy grep for restricted language.
   - Browser first-fold visual QA.
   - Mobile and 13-inch viewport check.

---

## 13. Final recommendation

The hero is visually strong enough now. The next improvement should be a **copy precision pass**, not another visual direction change.

Use this as the next hero thesis:

> **Know what to fix next.**
> SlateCamp turns scattered architecture review into a calmer map: find the topic, understand the idea, check what stuck, and choose the next weak spot to repair.

This keeps the emotional force of the current H1 while aligning better with:

- target-user anxiety,
- assurance and comfort,
- supplementary/reviewer-buddy positioning,
- legal safety,
- atlas/resource-platform direction,
- and the current visual system.
---

## 14. Copy brevity correction — 2026-05-08 follow-up

Philip correctly flagged that the implemented hero support copy had become too wordy for first-fold marketing.

External copywriting reference checked:

- Nielsen Norman Group, `How Users Read on the Web`: users scan rather than read word-for-word; improved web writing should be concise, scannable, objective, use one idea per paragraph, and cut word count. NN/g reports `58%` better usability for concise text and `124%` better usability when concise, scannable, and objective writing are combined.

Applied rule for the hero:

- Keep the approved H1 `Know you’ll win.`.
- Do not explain all audience contexts in the hero.
- Replace long “whether you’re...” framing with a four-beat scannable outcome line.
- Replace the long “use beside school/books...” disclaimer with a short legal-safe microcopy line.
- Keep supplementary positioning visible without turning the hero into a paragraph.

Implemented hero copy:

- Support line: `Find the topic. See the rule. Check what stuck. Know what to revisit.`
- Microcopy: `Supplementary support — verify primary sources.`

Word-count reduction:

- Previous support + microcopy: `66` words.
- New support + microcopy: `19` words.
- Reduction: about `71%`.

Rationale:

- The hero now sells the feeling and action path, not the full product explanation.
- Product proof is handled by the Supplementary Atlas Preview directly below.
- Legal/supplementary boundaries remain present, but no longer dominate the hero.

---

## 15. Target-market clarity correction — 2026-05-08 follow-up

Philip rejected the short four-beat hero line because it still assumed internal product context:

> `Find the topic. See the rule. Check what stuck. Know what to revisit.`

This fails for a first-time Filipino architecture student because it does **not** answer the basic acquisition question: **What is SlateCamp?** It also uses phrases that sound obvious to the builder but vague to a new visitor:

- `source-aware notes` — unclear public phrase; say `wiki notes`, `code explainers`, or `references`.
- `clear repair path` / `repair the gap` — unclear without naming missed questions, confusing code provisions, or subjects.
- `check what stuck` — acceptable only after the page has already explained quizzes/practice questions.
- `know what to revisit` — too abstract in the hero; say `know the next subject to review` or `see missed questions and weaker topics`.
- `weak-topic signals` — mechanism-language; say `weaker topics`, `missed questions`, or `subjects that need more work`.

### Audience correction

The target user is not buying an edtech method. Filipino architecture students and LEA reviewees are buying:

- assurance during a stressful school or board-review season;
- comfort that architecture knowledge is organized and searchable;
- reliable notes, code explainers, questions, visuals, and tools in one place;
- a supplementary buddy beside school, books, mentors, codals, review materials, and self-study;
- a calmer way to know what subject needs attention next.

### Public positioning correction

Do **not** position SlateCamp as a primary review-center replacement. Do **not** make the hero sound like a learning-science product pitch. The hero must plainly state the product category before using the atlas metaphor.

Implemented hero copy after this correction:

- Eyebrow: `For Filipino architecture students and LEA reviewees`
- H1: `Know you’ll win.`
- Support line: `SlateCamp is a supplementary architecture learning resource: wiki notes, code explainers, quizzes, 3D visuals, and tools for school, board review, and self-study.`
- Microcopy: `Use it beside your books, notes, mentors, and review materials.`
- Bridge: `Wiki notes · Visual explainers · Practice questions`

Right-side Atlas Index was also rewritten from abstract mechanism labels to concrete product/use labels:

- `Knowledge Wiki` → `Find architecture topics`
- `Practice Questions` → `Answer board-style questions`
- `3D Lab` → `See forms and rules`
- `Study Direction` → `Know the next subject to review`

### New audit rule

Before future landing copy is accepted, a first-time visitor must be able to answer in five seconds:

1. SlateCamp is a supplementary architecture learning resource.
2. It is for Filipino architecture students and LEA reviewees.
3. It contains wiki notes, code explainers, quizzes, 3D visuals, and tools.
4. It is used beside existing school/review materials, not instead of them.
5. It gives comfort by making scattered architecture review more organized and actionable.

