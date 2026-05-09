# 03 — Product Truth Audit: What the Landing May Actually Show

Date: 2026-05-08
Status: source inspection summary, no implementation

## Purpose

The landing must stop inventing fake product screenshots and generic feature cards. It should reference what SlateCamp actually does inside the dashboard.

This audit summarizes inspected product surfaces and identifies truth-safe claims.

## Inspected source areas

Dashboard/app:

- `src/app/dashboard/page.tsx`
- `src/app/dashboard/layout.tsx`
- `src/components/dashboard/HeroCommandBar.tsx`
- `src/components/dashboard/HeatmapSection.tsx`

Wiki:

- `src/app/dashboard/wiki/page.tsx`
- `src/app/dashboard/wiki/layout.tsx`
- `src/app/dashboard/wiki/[articleId]/page.tsx`
- wiki navigation/article components

Quiz:

- `src/app/dashboard/quiz/page.tsx`
- `src/app/dashboard/quiz/_components/QuizHubContent.tsx`
- `src/components/testing/hub/ReviewHub.tsx`
- quiz setup/results/session components via search

3D Lab:

- `src/app/dashboard/3d-lab/page.tsx`
- `src/features/3d-lab/components/LabBrowser.tsx`
- `src/features/3d-lab/components/ModuleCard.tsx`
- `src/features/3d-lab/components/shell/LabModuleShell.tsx`
- 3D Lab registry/config files via search

Marketing currently under critique:

- `src/components/marketing/HeroSection.tsx`
- `src/components/marketing/hero/AtlasFieldHero.tsx`
- `src/components/marketing/QuestionsSection.tsx`
- `src/components/marketing/ThreeDLabSection.tsx`
- other marketing sections via search

## Real product primitives

### 1. Dashboard overview

The real dashboard is not a fake mega-board. It contains:

- readiness score ring
- greeting/user context
- weekly stats
- study activity heatmap
- streak/progress surfaces
- transition/results prompts depending on state

Truth-safe framing:

- "Track readiness and study activity in your dashboard."
- "See weak areas and recent study context when you practice."

Avoid:

- implying an exact marketing mockup is the real dashboard
- fake large readiness jumps
- fake "tonight's repair list" if that exact component does not exist

### 2. Wiki / knowledge resources

The real wiki/article experience includes:

- taxonomy-linked articles
- subject and difficulty metadata
- read time and update note
- learning purpose / what the topic tests
- article rendering
- headings/navigation
- related topics
- previous/next sibling navigation
- source sidebar via `getArticleSources`
- read tracking
- wrong-answer banner when opened from quiz context
- practice link from article context

Truth-safe framing:

- "Find plain-language explanations and related topics."
- "Use source notes where verified."
- "Move from a missed topic back to the related article when mappings exist."
- "Use the wiki as a field guide beside school notes, review materials, and primary documents."

Avoid:

- claiming every article has fully verified source locators if not audited
- saying it is official
- saying it replaces PRC/PRBoA/current code verification

### 3. Quiz/practice

The real quiz hub and session system are substantial.

Actual features include:

- quiz hub with practice modes
- in-progress session resume
- completed sessions
- weak nodes from user mastery
- focus review queues
- readiness score context
- design scenarios
- endurance setup
- immediate/deferred feedback depending on mode
- answer confidence tracking
- rationale in applicable modes
- wiki article URLs when topic mappings exist
- results page with score, readiness before/after/delta, review questions, recommendations

Truth-safe framing:

- "Use practice to check what stayed with you."
- "Missed answers can point back to explanations and related topics when mappings are available."
- "Different practice modes serve different intents: quick checks, focused review, simulations, endurance."

Avoid:

- "Every missed answer becomes a next step" as an absolute
- leading with SRS/active recall/algorithmic mechanisms
- making the marketing preview look like the actual quiz UI if it is only illustrative

### 4. Analytics/readiness

Actual analytics include many signals:

- readiness
- subject mastery
- weak topics
- pacing/stamina
- difficulty/mastery
- confidence calibration
- session history
- streak/study calendar
- simulation trajectory

Truth-safe framing:

- "See signals that help you decide what to review next."
- "Use weak-topic analytics to focus your next session."
- "Readiness is a learning signal, not a guarantee."

Avoid:

- pass probability
- guaranteed readiness
- exact score predictions
- implying the score certifies exam readiness

### 5. 3D Lab

The real 3D Lab is gated by entitlement.

Actual facts from inspection:

- `/dashboard/3d-lab` redirects unauthenticated users to login.
- If entitlement is missing, users see a lock/gate message.
- `LabBrowser` has a current dashboard visible set via `DASHBOARD_VISIBLE_IDS`.
- Current visible modules appear limited.
- Registry contains many module entries, but registry/roadmap is not the same as shipped availability.
- The current allowlisted/built reality should not be overstated.

Truth-safe framing:

- "Explore available visual tools and 3D Lab modules depending on access."
- "3D examples help make spatial rules easier to see."
- "The lab is educational and should be checked against primary documents."

Avoid:

- "full 3D Lab free after signup"
- "hundreds of interactive modules available" if most are registry/roadmap entries
- implying the landing SVG/card is the real 3D Lab

## Current marketing mismatches

### QuestionsSection

Problem:

- Uses a hard-coded quiz preview that may not match real quiz UI or flow.
- Says "Every missed answer should become a next step" — emotionally good but product-absolute if read literally.
- It shows a fake preview card rather than drawing from actual quiz hub behavior.

Correction principle:

- Talk about checking what stayed, explanations, related topics, and weak areas.
- If showing UI, reference actual ReviewHub/session/results behavior.
- Do not make fake preview look like a screenshot.

### ThreeDLabSection

Problem:

- Uses a static SVG in a dark rounded card.
- Calls this a 3D Lab preview, but the actual lab is gated and not this SVG.
- CTA "Create a free account for the full lab" risks overpromising because entitlement gates access.

Correction principle:

- Do not represent 3D as another card/module.
- Do not claim full lab access unless entitlement/product flow supports it.
- Use 3D either as an atmospheric brand layer or show actual available lab modules later with accurate access copy.

### Hero

Problem:

- The hero turned into a right-side 3D module in a framed card with labels.
- This violates the external reference pattern and Philip's stated preference.

Correction principle:

- Hero should be an integrated visual field/environment.
- No carded 3D container.
- No floating UI pills as main visual device.

### Analytics/readiness mockups

Problem:

- Marketing cards may imply exact dashboard surfaces that do not exist in that form.

Correction principle:

- Use product-truth language: readiness score, weak topics, analytics, recommendations.
- Avoid exact fake dashboards unless explicitly labeled conceptual.

## Truth-safe content library for future landing

Safe nouns:

- knowledge atlas
- field guide
- wiki articles
- related topics
- source notes
- visual explanations
- practice sessions
- weak topics
- readiness signals
- study activity
- analytics
- 3D Lab / visual tools, with access caveat
- dashboard
- article-to-practice paths

Safe verbs:

- find
- browse
- revisit
- understand
- check
- compare
- trace
- return to
- clarify
- organize
- focus
- choose the next useful step

Risky verbs:

- guarantee
- predict
- certify
- master
- replace
- unlock the full lab for free
- prove readiness
- ensure passing

## Landing design implication

The landing should not be a sequence of fake app previews.

Better structure:

1. Atmospheric atlas/world hero.
2. Audience problem in human language.
3. Real product map: Wiki / Practice / 3D Lab / Analytics, stated truthfully.
4. Actual dashboard/product primitives shown later, preferably as restrained editorial screenshots or diagrams, not exaggerated mockups.
5. Trust/boundaries/access section.
6. CTA with clear free/account/plan boundaries.
