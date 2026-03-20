# SlateCamp — 3D Visual Learning Research: Integration Analysis
**Report type:** UX Research × Product Architecture Integration Analysis  
**Research source:** 3D & Visual Learning UX Research Brief (March 2026)  
**Architecture reference:** Product Architecture v2.1  
**Author:** Claude, Product Architect  
**Date:** March 2026

---

## Executive Summary

The UX researcher's report is **the most operationally actionable document produced for the 3D Lab to date**. It validates the existing architecture decisions, then extends them with 14 specific UX patterns and interaction requirements that are not currently captured in the product architecture. Most critically, it establishes the pedagogical rationale that should govern every build decision for the 3D Lab from here forward.

The headline finding: **the 3D Lab is not supplementary**. For subjects like Building Codes (PD 1096, RA 9514, BP 344) and Structural Systems, the research confirms it is the most direct path to the kind of understanding that actually transfers to exam performance. This reframes the 3D Lab's position in the product — not a "nice to have" that comes after Camp Trail, but a first-class feature that earns its place in the core study loop.

**The research validates 5 existing architecture decisions and introduces 9 new requirements. 4 new schema additions are needed.**

---

## Part 1 — Where the Research Validates the Architecture

These are the existing architecture decisions the research confirms with direct evidence. No changes needed — but the research gives you the language to explain *why* these are right.

### ✅ 1.1 The 3-Phase Progression (Guided → Faded → Sandbox)

**Architecture says:** Worked Example Progression — Guided tour → Faded example → Full problem-solving (Phase 2 enhancement)

**Research confirms:** Sweller (1988) Worked Example Effect (d=0.57) + Expertise Reversal Effect. Novices learn faster from examples than problems. As expertise develops, this reverses — experts need problems. The exact sequence the architecture already planned matches the research perfectly. The ALE reviewee is a novice on most code topics — they need Phase 1 before Phase 3.

**Critical clarification from research:** The architecture treats this as a Phase 2 enhancement. The research argues it should be the foundation for every module from day one — not a feature added later. Every module that ships should already follow this arc, even if faded and sandbox phases are simplified.

**What this means for build:** Don't ship Phase 1 modules without at least a stub Phase 2 (faded example). A partially interactive model is more educationally valid than a passive guided tour alone.

---

### ✅ 1.2 Hotspot-Based In-Canvas Quizzing

**Architecture says:** "In-canvas quizzing: Hotspot-based questions that test spatial knowledge directly on the model."

**Research confirms:** Testing Effect (Roediger & Karpicke, 2006) — retrieval practice after 3D exposure produces stronger encoding than re-reading. In-canvas questions are not a nice UX touch; they are the mechanism that converts passive 3D viewing into actual learning.

**Critical clarification from research:** The interaction sequence matters. The architecture says hotspot questions exist but doesn't specify the order. The research is explicit:
1. Hotspot pulsates → student taps
2. Question appears → student answers
3. Correct value appears with code citation

**Never show the label first, then ask the question.** That's passive reading, not retrieval. The testing effect only fires when the student has to generate the answer before seeing it. This is an implementation constraint that must be in the build spec.

---

### ✅ 1.3 Code-Cited Hotspots Linking to the Wiki

**Architecture says:** "Code-cited hotspots: every hotspot links directly back to the Wiki"

**Research confirms:** Dual-Channel Processing (Mayer, 2001, d=0.60–0.90) — retention is significantly higher when visual and verbal information are processed simultaneously. The hotspot system (visual model + text citation) is pedagogically correct because it engages both cognitive channels simultaneously.

**Critical clarification from research:** The citation must appear adjacent to the model — never on a separate screen or after a navigation step. The split-view layout (model left, code right on desktop; model top, code below on mobile) is specified by research as the optimal configuration. This is a layout constraint, not just a feature description.

---

### ✅ 1.4 The Top 10 Module Priority List

**Architecture says:** 10 priority modules listed (PD 1096 stairway, RA 9514, BP 344, Classical Orders, etc.)

**Research confirms:** The research creates a formal visual impact classification:
- **CRITICAL:** PD 1096 stairways, RA 9514 travel distance, BP 344 accessibility, PD 1096 setbacks
- **HIGH:** NSCP structural bays, Classical Orders, MEPFS systems  
- **MEDIUM:** PD 957 subdivision
- **LOW:** Professional Practice fees, ethics, legislation

The architecture's top 10 list is essentially correct in terms of priorities. The research adds the important filter: "Can a student understand this without seeing it? If yes → Wiki is sufficient. If no → 3D Lab is necessary." Professional Practice topics should be Wiki infographics, not 3D models — and the architecture never planned 3D for those topics anyway.

**One insight the research adds:** The Classical Orders module needs a fundamentally different interaction pattern from code compliance modules. It's not about dimensions and compliance — it's about visual identity discrimination training. This is detailed in Part 2 below.

---

### ✅ 1.5 React Three Fiber + Parametric Sliders

**Architecture says:** React Three Fiber, @react-three/drei, Zustand for 3D state, parametric sandbox with sliders

**Research confirms:** "Active Manipulation Beats Passive Viewing" (Petersen, Petkakis & Makransky, 2022) — students who actively manipulate 3D models show significantly better spatial understanding and retention than students who watch. The parametric sandbox is pedagogically superior to a video walkthrough of the same content.

**Slider-based controls specifically validated for mobile:** The research recommends sliders (not drag-on-model) for parametric controls on mobile devices. Drag-on-model is too imprecise on small screens. This aligns with the existing technical decision.

---

## Part 2 — Where the Research Extends the Architecture

These are new requirements the research introduces that are not currently in the product architecture. Each needs to be added to the 3D Lab spec.

---

### 🆕 2.1 Dual-Coding Layout Specification

**What's new:** The architecture says code citations link to the Wiki, but doesn't specify layout. The research specifies the layout as a constraint:

- **Desktop:** Split-panel — model left, code text right. Both visible simultaneously.
- **Mobile:** Stacked — model on top, code text directly below in the same scroll view.
- **Never:** Separate pages, modal overlays that hide the model, or navigation away from the model to read the code.

**Why it matters:** Mayer's Contiguity Principle — when words and pictures are separated across screens, cognitive load of maintaining both in working memory increases dramatically, reducing comprehension. The layout is not aesthetic preference; it is a cognitive load decision.

**Product architecture update needed:** Add layout specification to Section 4.5 (3D Lab) as a hard UX constraint.

---

### 🆕 2.2 Signaling — Animated Attention Guidance

**What's new:** During guided tours, the model must actively direct the student's attention to the dimension being explained — not leave them scanning a complex model looking for the relevant part.

**Specific pattern:**
- Animated arrows pointing to the dimension being discussed
- Pulsing outlines around the active element
- All other elements visually dimmed or greyed during the explanation

**Research basis:** Signaling Principle (Mayer & Fiorella, 2014) — adding visual cues that direct attention to the critical element significantly reduces cognitive load and improves comprehension. "Like a professor pointing at the board."

**Build implication:** The guided tour is not just a camera flythrough. It requires an attention-guidance layer — a timeline-based highlight system that can be authored per model. The Blender Python scripting pipeline needs to support exporting annotation keyframes alongside the model geometry.

---

### 🆕 2.3 Focus Mode — Progressive Disclosure Toggle

**What's new:** Models must not reveal all dimensions and elements simultaneously. A "Focus Mode" toggle should:
1. Highlight one dimension at a time
2. Grey out or hide all other elements
3. Guided tour always starts in Focus Mode
4. Student can unlock "Full View" after completing the guided tour

**Research basis:** Split-Attention Effect (Cognitive Load Theory) — when a model shows beams, columns, slabs, reinforcement, connection types, and load paths simultaneously, working memory overloads and the student understands nothing. Progressive disclosure is not a UX preference; it is a cognitive load management mechanism.

**Build implication:** The NSCP structural bay model and BP 344 accessible toilet model are the most at-risk for this anti-pattern. Both have multiple interacting dimensions. The Focus Mode system needs to be a reusable component in the 3D Lab framework, not built per-module.

---

### 🆕 2.4 Human Scale Reference — Person Silhouette

**What's new:** Every model that involves human-scale dimensions (stairways, ramps, corridors, door widths, toilet clearances) must include a person silhouette at 1.7m height.

**Why it matters:** This is what no PDF or flashcard can replicate. When a student sets a door width to 700mm, the person silhouette barely fits — the visual makes the code rationale self-evident. This builds spatial calibration — the ability to "feel" whether a dimension is right — not just memorize it.

**Research basis:** Scale cognition research — spatial learning requires metric calibration. Students who only memorize dimensions without visual scale reference cannot evaluate whether a configuration is plausible, which is exactly what ALE analytical questions require.

**Build implication:** Person silhouette is a standard 3D asset (human mesh at 1.7m) that should be included as a default layer in all building-scale models. One asset, referenced across all modules.

---

### 🆕 2.5 Context Narration — 2-Sentence Scenario Opening

**What's new:** Each module opens with a short professional scenario — not just "explore this stairway." Examples:

- "You're reviewing plans for a 4-story commercial building in Quezon City. The building inspector has flagged the fire exit stairway. Here's what they found."
- "A client has submitted building permit plans for a new mall in Makati. The fire marshal requires you to verify all travel distance calculations before approval."

**Research basis:** Context-dependent memory (Tulving, 1983) — narrative encoding improves recall vs. isolated fact learning. Numbers embedded in a professional scenario are remembered; abstract dimensions are forgotten. This also mirrors how the ALE's hardest analytical questions are framed — "as an architect in this scenario, what applies?"

**Build implication:** Each module needs a 2-sentence scenario authored by the SME alongside the model. This is a content addition, not a technical one — but it needs to be formalized as a required field in the module authoring process.

**Schema implication:** `models_3d.metadata JSONB` can store this, or a dedicated `context_scenario TEXT` column should be added.

---

### 🆕 2.6 Challenge Mode — Error-Based Learning

**What's new:** Beyond the sandbox phase, modules should have a "Challenge Mode" — a deliberately non-compliant building presented to the student, asking them to find all violations.

- "Find 3 code violations in this stairway"
- "This floor plan has been flagged by the Fire Marshal. Identify all travel distance violations"
- "These plans will fail the building permit. Find everything that's wrong."

**Research basis:** Error-Based Learning (Metcalfe, 2017) — students learn better from making and correcting errors than from observing correct examples. The ALE's hardest analytical questions use exactly this format: identifying non-compliance in a given scenario. Challenge Mode directly trains for this question type.

**Relationship to existing architecture:** The architecture mentions "parametric sandbox with slider-based controls" but doesn't specify Challenge Mode as a distinct mode. Challenge Mode is pre-configured non-compliant states, not student-configured ones — a different interaction entirely.

---

### 🆕 2.7 Exam Question Count Metadata

**What's new:** Every module card in the 3D Lab should display: "This module covers approximately X questions per ALE sitting, typically appearing as [question type]."

After completing the sandbox or challenge mode, a direct link surfaces to a Camp Mode session filtered to that exact topic.

**Research basis:** Transfer of learning — learning is most effective when training conditions match test conditions. ALE candidates are entirely exam-motivated. Content without a visible connection to the board exam reads as "interesting enrichment," not "study material." Explicit exam relevance framing changes how students allocate study time.

**Build implication:** Two additions needed:
1. Module metadata: `ale_question_count INTEGER` (estimated questions per sitting)
2. Post-module CTA: "Answer X questions on this topic in Camp Mode" — a deep link into the quiz engine filtered to `topic_id`

This is the bridge between the 3D Lab and the Quiz Engine — currently not specified in the architecture.

---

### 🆕 2.8 Mobile-First Specific UX Decisions

**What's new:** The architecture says React Three Fiber is mobile-capable but doesn't specify the mobile UX. The research specifies concrete decisions:

1. **Default view on mobile:** Flat "exploded diagram" view (top-down or isometric fixed angle) — not a full 3D orbit that requires two-finger rotation
2. **3D View button:** An explicit toggle to enable full orbit when the student wants it
3. **Controls:** Sliders for parametric inputs, not drag-on-model
4. **Orientation prompt:** "Rotate your phone for the best view" for landscape-benefiting models (floor plans, structural bays)

**Context:** The primary SlateCamp user is on a mid-range Android phone (Realme/Samsung A-series, 6" screen, 4G). Full 3D orbit on a small screen is janky and frustrating. A flat diagram you can interact with via sliders is more educationally effective and more technically reliable on lower-end devices.

**Build implication:** The React Three Fiber implementation needs two rendering modes: a fixed-angle 2D-ish view for mobile default, and a full orbit mode for desktop-default/mobile-optional.

---

### 🆕 2.9 Classical Orders — Discrimination-First Pattern

**What's new:** The Classical Orders module needs a completely different interaction architecture from all code compliance modules. It's not about parametric exploration or compliance checking — it's about **visual discrimination training**.

**Specific interaction pattern:**
1. Five columns simultaneously, side-by-side with labeled distinctive features
2. "Spot the Order" quiz — single column shown, student identifies it
3. Progressive difficulty: easy (very different orders) → medium (Doric vs. Tuscan) → hard (photograph of real building column)
4. Wrong answer feedback highlights the distinguishing feature: "The capital gives it away — look at the volutes"
5. "Match the description" faded example — drag descriptions to correct columns

**Research basis:** Discrimination learning / Signal detection theory — visual similarity increases error rates without explicit comparison training. Students confuse Doric and Tuscan because they've never seen them side by side. The discriminating features become obvious when presented in direct comparison.

**Build implication:** The Classical Orders module is not a "parametric model" in the same sense as the stairway or travel distance modules. It requires a comparison layout with multiple objects visible simultaneously — a different component entirely. This should be scoped separately in the build backlog.

---

## Part 3 — 3D Lab's Integration Across the Whole Product Architecture

This is the critical section — how the 3D Lab connects to every other system in SlateCamp. The research introduces requirements that affect multiple parts of the architecture beyond the 3D Lab itself.

---

### 3.1 3D Lab → Core Analytics Loop (Most Important Integration)

**Current architecture:** The Core Loop runs: `user_interactions → user_node_mastery → Readiness Score → Heatmap`

**The research's explicit requirement:** "Every completed 3D Lab module + hotspot quiz should write to `user_interactions` and update `user_node_mastery` for the relevant `topic_id`."

**The UX rationale:** If 3D Lab interactions don't feed the Heatmap and Readiness Score, students perceive it as optional enrichment rather than core study. The moment the Heatmap shows a node moving from grey to amber after a 3D Lab session, the module becomes part of the core study loop.

**How this works with the current schema:**

`user_interactions` has: `question_id UUID NOT NULL REFERENCES questions(question_id)` — meaning every interaction must reference a question in the question bank.

**This creates a design decision:** How do 3D Lab in-canvas questions get represented in the question bank?

**Recommended approach:** In-canvas hotspot questions should be registered as questions in the `questions` table with `application_context = 'design_application'` and a `model_id` reference (already on `questions`). When a student answers a hotspot question, it writes to `user_interactions` exactly like a Camp Mode question — same flow, same mastery update, same Readiness Score contribution.

This means:
1. The `questions.model_id` field (already exists in schema) links a question to its 3D model
2. In-canvas quiz questions are authored in the `questions` table during content production
3. The completion of a 3D session with in-canvas quizzing writes to `user_interactions` — changing the heatmap node state
4. The 3D Lab becomes a genuine mastery-contributing activity, not a sidecar

**Mastery weight consideration:** The research suggests "a small visual-learning bonus weight" — students who see the concept in 3D AND answer questions correctly have demonstrated deeper understanding. This could be implemented as a `source_type` column on `user_interactions` (`'quiz' | '3d_lab' | 'assessment'`) with a weight multiplier applied during EMA calculation.

---

### 3.2 3D Lab → Camp Trail Integration

**Current architecture:** Camp Trail `trail_steps` has `step_type: 'lab'` and `model_id UUID REFERENCES models_3d`. 3D Lab sessions are prescribed as trail steps.

**The research adds:** The specific interaction phase matters for trail step prescription. A Day 1 trail step on PD 1096 stairways should prescribe Phase 1 (Guided Tour). A Day 7 step on the same module should prescribe Phase 2 (Faded). A Day 14 step should prescribe Phase 3 (Sandbox/Challenge Mode).

**Schema implication:** `trail_steps` needs to know which phase of the 3D Lab to launch. Currently there is no `lab_phase` column on `trail_steps`. This connects directly to the Phase 2 `interaction_mode` column identified in the DB Audit.

```sql
-- Needed on trail_steps for 3D-specific prescription:
ALTER TABLE public.trail_steps
    ADD COLUMN lab_phase TEXT DEFAULT 'guided'
    CHECK (lab_phase IN ('guided', 'faded', 'sandbox', 'challenge'));
```

This enables a trail to prescribe "Day 1: Stairway Configurator — Guided Tour" and later "Day 8: Stairway Configurator — Faded Example" as distinct steps targeting the same model but different phases.

---

### 3.3 3D Lab → Blindspot Protocol Integration

**Currently:** Blindspot Protocol generates queues from Red/Grey nodes in `user_node_mastery`. It targets quiz questions.

**The research implies:** If a node stays Red after quiz remediation, a 3D Lab session on that topic should be surfaced as a Blindspot recommendation — because some concepts simply cannot be fixed by answering more questions; they need spatial engagement.

**Specific pattern:** When Blindspot Protocol generates a queue for a node that has an associated 3D module (checkable via `spatial_hotspots.node_id → taxonomy_tree`), the dashboard should show:
> "Your weakest node: Fire Code Travel Distance. Before answering more questions, see it in the 3D Lab first."

This creates a routing rule in the Blindspot Protocol: **quiz-first for concept recall gaps, 3D Lab-first for spatial comprehension gaps.** The distinction requires knowing which topics have 3D modules available — queryable via `spatial_hotspots.node_id`.

---

### 3.4 3D Lab → Wiki Integration

**Current architecture:** "Every hotspot links directly back to the Wiki"

**The research adds:** This link should be bidirectional. From within a Wiki article on PD 1096 stairway dimensions, there should be a prominent "See this in the 3D Lab" CTA that deep-links to the relevant model.

The connection exists via `wiki_article_taxonomy.node_id` → `spatial_hotspots.node_id`. When rendering a Wiki article, the application can query: `SELECT model_id FROM spatial_hotspots WHERE node_id = $primary_node_id` and render a 3D Lab CTA if a model exists.

**Elaborative Interrogation connection:** The research-specified EI_PROMPT tags (mid-article "Why?" questions) and the 3D Lab are complementary:
- EI_PROMPT trains causal reasoning about the code in text form
- 3D Lab trains spatial application of the same concept

For high-visual-impact topics (CRITICAL/HIGH in the research's classification), the ideal learning path is: Wiki article with EI prompts → 3D Lab Guided Tour → Camp Mode questions. This sequence should be explicitly prescribed in Camp Trail steps for those topics.

---

### 3.5 3D Lab → Assessment Quiz

**The research highlights:** ALE topnotchers "drew diagrams, mapped processes, visualized the code." This is the behavior SlateCamp's 3D Lab trains.

**Current architecture:** The 35-item assessment quiz drives the Trail Recommendation Engine. It identifies which subjects are weakest.

**The research implication:** The trail recommendation for students who score Red on Building Technology or Building Laws should explicitly route them to 3D Lab modules as a priority intervention — not just more quiz questions. A student who scores 20% on stairway/accessibility questions likely has a spatial comprehension gap, not just a recall gap.

**Specific trail recommendation logic addition:** When assessment identifies a Red node that has a corresponding 3D module, the recommended trail should front-load the 3D Lab step before the quiz steps for that topic:

```
Day 1 — PD 1096 Stairways:
  Step 1: 3D Lab — Stairway Configurator (Guided) [lab, step_type: 'lab', lab_phase: 'guided']
  Step 2: Wiki — PD 1096 Section 7: Stairways [wiki]
  Step 3: Camp Mode — 10 questions targeting stairway nodes [quiz]
```

This is pedagogically more effective than leading with quiz questions on a topic the student has never visualized.

---

## Part 4 — Schema Additions Required

The research introduces 4 schema additions not yet in the database or product architecture.

### 4.1 `models_3d` — Context Scenario and Exam Metadata

```sql
ALTER TABLE public.models_3d
    ADD COLUMN context_scenario        TEXT,           -- 2-sentence professional scenario
    ADD COLUMN ale_question_count      INTEGER,        -- estimated questions per ALE sitting
    ADD COLUMN ale_question_type       TEXT,           -- e.g. 'code compliance', 'dimensional recall', 'visual identification'
    ADD COLUMN supported_phases        TEXT[] DEFAULT '{guided}',  -- which phases are built
    ADD COLUMN has_challenge_mode      BOOLEAN DEFAULT false;
```

### 4.2 `spatial_hotspots` — Phase and Interaction Type

```sql
ALTER TABLE public.spatial_hotspots
    ADD COLUMN phase          TEXT DEFAULT 'guided'
                              CHECK (phase IN ('guided', 'faded', 'sandbox', 'challenge')),
    ADD COLUMN question_id    UUID REFERENCES public.questions(question_id),
    -- links hotspot to a question in the question bank for mastery tracking
    ADD COLUMN reveal_order   INTEGER DEFAULT 1;    -- sequence within the guided tour
    -- controls progressive disclosure order
```

### 4.3 `trail_steps` — 3D Phase Prescription

```sql
ALTER TABLE public.trail_steps
    ADD COLUMN lab_phase TEXT DEFAULT 'guided'
    CHECK (lab_phase IN ('guided', 'faded', 'sandbox', 'challenge'));
```

### 4.4 `user_interactions` — Source Type for Weight Differentiation

```sql
ALTER TABLE public.user_interactions
    ADD COLUMN source_type TEXT DEFAULT 'quiz'
    CHECK (source_type IN ('quiz', '3d_lab', 'assessment'));
    -- enables EMA weight differentiation for 3D Lab interactions
```

---

## Part 5 — Anti-Pattern Checklist for 3D Lab Build

The research provides 4 anti-patterns to check every module against before shipping. These should be part of the content review workflow.

| Anti-Pattern | Detection Test | Fix |
|---|---|---|
| Too Much At Once | Does the model show more than 3 labeled dimensions simultaneously in default state? | Add Focus Mode. Reveal one layer at a time. |
| Beautiful But Uninteractive | Can the student change any parameter in the model? If no → it's a render, not a 3D Lab module. | Add at minimum one slider. Interaction is non-negotiable. |
| No Exam Connection | Does the module display estimated ALE question count and link to Camp Mode questions? | Add `ale_question_count` metadata and post-module CTA. |
| Labels Replace Learning | Are all dimension labels visible before the student has answered any questions? | Move to post-answer reveal. Hide labels until student interaction. |

---

## Part 6 — Updated 3D Lab Specification Summary

Incorporating all research findings into a single updated specification:

### Module Architecture (Every module must have)
- **Context scenario** — 2-sentence professional scenario at module open
- **ALE question count** — displayed prominently on module card
- **Phase 1: Guided Tour** — animated attention guidance, Focus Mode on, no interaction required
- **Phase 2: Faded Example** — one parameter pre-configured wrong OR one parameter to supply
- **Phase 3: Full Sandbox** — all parameters open, real-time compliance feedback
- **Challenge Mode** — pre-configured non-compliant model, student finds violations
- **Human scale reference** — person silhouette at 1.7m for all human-scale models
- **Post-module CTA** — "Answer questions on this topic in Camp Mode"

### Hotspot Architecture (Every hotspot must have)
- **Testing-effect sequence** — question first, answer second (never label first)
- **Dual-coding layout** — code text adjacent to model, not behind a tap or navigation
- **Compliance feedback** — non-compliant state shows: Signal Red + current value vs required value + consequence text
- **Question bank registration** — every in-canvas question registered in `questions` table with `source_type: '3d_lab'`

### Mobile Architecture
- **Default view** — flat exploded diagram or top-down plan view
- **Full 3D toggle** — explicit opt-in button for full orbit
- **Controls** — sliders only, no drag-on-model
- **Orientation prompt** — for models that benefit from landscape

### Classical Orders Exception
- **Pattern** — side-by-side comparison, not parametric
- **Interaction** — discrimination quiz (Spot the Order), progressive difficulty
- **Feedback** — highlights distinguishing feature on wrong answer

---

## Part 7 — Priority Additions to the Product Architecture Document

These are the specific updates needed in the Product Architecture v2.1 to incorporate the research:

**Section 4.5 (3D Lab) — Add:**
1. Dual-coding layout specification (split-panel desktop, stacked mobile)
2. Focus Mode toggle as a required component
3. Human scale reference (person silhouette) as a required default asset
4. Context narration as a required module element
5. Challenge Mode as a distinct interaction phase
6. Exam question count metadata as a required field
7. Mobile-specific rendering modes (fixed-angle default, full-orbit opt-in)
8. Classical Orders exception pattern
9. Anti-pattern checklist as part of content review gate

**Section 10 (Database Schema) — Add:**
1. `models_3d` additions: `context_scenario`, `ale_question_count`, `ale_question_type`, `supported_phases`, `has_challenge_mode`
2. `spatial_hotspots` additions: `phase`, `question_id`, `reveal_order`
3. `trail_steps` addition: `lab_phase`
4. `user_interactions` addition: `source_type`

**Section 5 (Progression Mechanics) — Add:**
1. Blindspot Protocol routing rule: spatial comprehension gaps → 3D Lab before quiz

**Section 6 (Camp Trail) — Update:**
1. Trail step prescription for 3D Lab should specify `lab_phase` (guided/faded/sandbox/challenge)
2. Trail design for high-visual-impact topics should front-load 3D Lab before quiz steps

---

## Part 8 — Build Priority Recommendations

Given the research's impact classification and the current schema state:

### Build First (CRITICAL visual impact + existing schema support)
1. **PD 1096 Stairway Configurator** — highest ALE frequency, most common Building Technology question. Full 4-phase arc (guided, faded, sandbox, challenge). Human silhouette. Focus Mode.
2. **RA 9514 Fire Code Travel Distance** — floor plan-based, excellent test of parametric understanding. Top-down view works well on mobile.
3. **BP 344 Accessible Toilet + Ramp** — most dimension-dense code in the ALE. Focus Mode is critical here — never show all clearances simultaneously.

### Build Second (CRITICAL + slightly more complex)
4. **PD 1096 Setbacks + AMBF Calculator** — pure site geometry. Parametric site model with AMBF/PSO/TGFA calculated in real time. Unique to Philippines — no competitor has this.

### Build Third (HIGH visual impact)
5. **Classical Orders** — completely different component architecture. Scope separately. Discrimination-first, not parametric.
6. **NSCP Structural Bay** — progressive disclosure is critical. Start with skeleton frame only, add one layer at a time.

### Build Last (MEDIUM visual impact)
7. **PD 957 Subdivision** — site-level, area calculations. Less urgent than individual building elements.

### Don't Build as 3D (LOW visual impact)
- Professional Practice fees, SPP documents, ethics — use Wiki infographics instead. The research explicitly identifies these as low visual-learning impact.

---

## Part 9 — The Governing Question Applied to the 3D Lab

Every module, interaction decision, and UX pattern must pass:

> "Does this make a student more likely to win their board exam?"

The research provides the answer framework:

**Yes, if the module:**
- Targets a CRITICAL or HIGH visual-impact topic
- Uses the 3-phase learning arc
- Writes to `user_node_mastery` via `user_interactions`
- Includes in-canvas questions with testing-effect sequence
- Shows exam question count and links to Camp Mode
- Has real Philippine code dimensions at real scale

**No, if the module:**
- Covers a text-based topic (fees, ethics, legislation)
- Is visually beautiful but not interactable
- Does not connect to the Heatmap or Readiness Score
- Shows all dimensions at once without progressive disclosure
- Appears as optional "enrichment" disconnected from the core study loop

---

*3D Visual Learning Research Integration Analysis · March 2026 · SlateCamp Internal*  
*Research source: UX Research Brief — 3D & Visual Learning (March 2026)*  
*Architecture reference: Product Architecture v2.1*
