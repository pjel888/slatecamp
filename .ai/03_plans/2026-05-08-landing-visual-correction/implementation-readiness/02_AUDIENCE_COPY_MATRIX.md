# 02 — Audience Copy Matrix and Final Hero Language

Date: 2026-05-08
Status: implementation input, no production code

## Core audience finding

SlateCamp's target users do not primarily care about learning-science vocabulary or quizzing methods.

They care about:

- assurance
- comfort
- reliability
- less pangangapa
- knowing where to start
- knowing what matters
- knowing what to revisit
- understanding before panic-memorizing
- having one reliable place to return to when notes, codes, recordings, and mock-board results feel scattered

## What language fails

Do not lead with:

- SRS
- active recall
- spaced repetition
- adaptive algorithm
- mastery engine
- diagnostics engine
- taxonomy analytics
- AI-powered learning platform
- pass probability
- guaranteed readiness
- official syllabus
- primary instruction replacement

These terms may describe internal mechanisms, but they do not answer the student's real fear: "Saan ako magsisimula, at ano ang kailangan kong balikan?"

## Positioning rule

SlateCamp is not the user's primary teacher.

The safer and more useful positioning is:

> School, mentors, books, lectures, and board-review materials teach. SlateCamp helps you find the topic, understand where it fits, check what stayed, and return to weak areas with a calmer next step.

Public copy should use:

- architecture knowledge atlas
- field guide
- source-aware resources
- visual explanations
- practice checks
- weak-topic signals
- review with less pangangapa
- clearer next step

Public copy should avoid:

- public Pokedex/Pokédex reference
- competitor/institution comparison
- official affiliation implication
- pass guarantees
- shame-based fear

## Final hero copy recommendation

### Selected headline

> **Find where it fits. Know what to revisit.**

Why this wins:

- `Find where it fits` carries the atlas/field-guide idea.
- `Know what to revisit` speaks directly to board-season anxiety.
- It avoids mechanism language.
- It works for school, boards, apprenticeship, and practice context.
- It is calm but useful.

### Recommended eyebrow

> **Architecture knowledge atlas**

Alternate if more explicit scope is needed below the fold:

> **Architecture field guide for school, boards, and practice**

### Recommended support copy

> SlateCamp organizes architecture topics, source-aware references, visual explanations, practice paths, and weak-topic signals so scattered review feels like a map again.

### Recommended CTA pair

Primary:

> **Open the atlas**

Secondary:

> **Find a topic**

If no public atlas/topic route exists, implementation must route honestly:

- logged-out primary CTA → signup/account creation with `Start free` or `Open the atlas after signup` wording
- logged-in primary CTA → dashboard wiki/resource entry point
- secondary CTA → public tools or public topic/search surface if available

## Ethical fear-to-clarity matrix

### Fear: "I do not know where to start."

Good copy:

> When everything feels scattered, start with a map.

Proof:

- wiki/resource index
- subject/topic paths
- related articles
- source notes where verified

Avoid:

> Start now or you will fail.

### Fear: "I might discover weak spots too late."

Good copy:

> Weak spots are easier to handle when you find them early.

Proof:

- practice checks
- weak-topic signals
- recent activity/readiness context

Avoid:

> Do not risk your future.

### Fear: "Mock boards shook my confidence."

Good copy:

> A missed answer should become a next step, not just a red mark.

Proof:

- explanations
- related topics
- review questions
- recommendations where available

Avoid:

> Low mock scores mean you are not ready.

### Fear: "My notes and reviewers are scattered."

Good copy:

> Turn scattered materials into a clearer route through the topic.

Proof:

- field-guide pages
- connected references
- search/browse behavior
- source-aware metadata

Avoid:

> You need more reviewers.

### Fear: "I memorized, but I still do not understand."

Good copy:

> See the rule, understand the concept, then memorize what matters.

Proof:

- visual explanations
- diagrams / 3D where available
- plain-language concept pages

Avoid:

> Memorization is useless.

### Fear: "Can I trust this?"

Good copy:

> Source-aware where verified. Always check current requirements with primary documents and qualified professionals.

Proof:

- source sidebar
- update notes
- boundary section

Avoid:

> Official. Approved. Exam-certified.

## Page copy architecture

### Above the fold

Use:

- architecture knowledge atlas
- find where it fits
- know what to revisit
- source-aware resources
- visual explanations
- practice paths
- weak-topic signals
- scattered review becomes a map

Avoid:

- feature inventory as the main headline
- hero stats
- long disclaimers
- multiple proof pills
- named mechanisms

### Problem section

Headline territory:

> Review does not feel hard only because there is too much to study. It feels hard because everything is scattered.

Bullets:

- codes and tables blur together
- recordings and PDFs pile up
- familiar topics still feel uncertain
- mock boards expose gaps late
- you need a next step, not another pile of files

### Product path section

Use verbs:

- Find
- Check
- See
- Revisit

Do not use mechanism labels as primary navigation.

### Trust section

Required copy ideas:

- supplementary architecture resource
- not official
- no pass guarantees
- visual/tool access depends on actual product availability/account access
- verify current requirements with primary authorities and qualified professionals

## Current source-copy watchouts for implementation

The implementation pass should specifically review:

- `HeroSection.tsx` — current hero support copy is safe but feature-inventory heavy.
- `BentoFeatureGrid.tsx` — current copy risks becoming a feature-grid thesis.
- `ThreeDLabSection.tsx` — `Setback Explorer` and `full lab after signup` need entitlement-safe wording.
- `AnalyticsSection.tsx` — fear language should stay agency-giving, not repetitive.
- `Pricing` constants — avoid product-tier jargon becoming public positioning.
- `HeroCodeEnvelopeExplorer.tsx` — do not preserve rejected hero concept as public hero language.
