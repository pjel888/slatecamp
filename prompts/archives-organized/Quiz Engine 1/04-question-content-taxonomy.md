# SlateCamp Quiz Engine — Document 4: Question Content Spec & Taxonomy Map

> **Purpose:** Defines the exact structure of a question object, how questions map to the ALE taxonomy, difficulty calibration, the adaptive question selection algorithm, and content quality standards. An AI reads this to understand what data fills the quiz shell and how to select the right questions for each mode.
>
> **Companion docs:** Doc 3 (Schema/API — where questions are stored), Doc 5 (Mastery Engine — how answers update mastery)

---

## 1. The Question Object

Every question in SlateCamp follows this exact data structure. This is the canonical shape — any question that doesn't conform is invalid.

```typescript
// src/types/question.ts

export interface Question {
  // Identity
  question_id: string;               // UUID primary key
  external_id: string | null;        // For imported questions (e.g., from review centers)

  // Taxonomy placement
  discipline_id: string;             // FK → disciplines (Area A, B, or C)
  topic_id: string;                  // FK → taxonomy_tree (e.g., "B1-concrete")
  subtopic_id: string | null;        // FK → taxonomy_tree (deeper level, optional)
  taxonomy_breadcrumb: string;       // Computed: "Structural Design > RC Design > Beam Design"

  // Content
  stem: string;                      // The question text (supports markdown subset: bold, italic, code)
  stem_html: string | null;          // Pre-rendered HTML (for performance)
  image_url: string | null;          // Supabase Storage URL for diagrams/images
  image_alt_text: string | null;     // Required if image_url present (accessibility)
  image_caption: string | null;      // Optional caption below image

  // Options
  options: QuestionOption[];          // Exactly 4 options (A–D)
  correct_option_id: string;         // FK to the correct option

  // Feedback
  rationale: string;                 // Why the correct answer is correct (40–80 words target)
  rationale_extended: string | null;  // Deep explanation (80–200 words, for "Learn more")
  wrong_answer_rationales: Record<string, string>;  // Per-option: why this wrong answer is wrong
  wiki_article_id: string | null;    // FK → wiki_articles (linked knowledge base article)
  code_reference: string | null;     // e.g., "PD 1096, Rule VII, Section 805"

  // Difficulty & Metadata
  difficulty_level: number;          // 1–5 scale (1=easy, 5=very hard)
  bloom_level: BloomLevel;           // Bloom's taxonomy level
  ale_frequency: AleFrequency;       // How often this topic appears on the actual ALE
  estimated_time_seconds: number;    // Average time to answer (for time estimates)
  discrimination_index: number;      // IRT parameter: how well this Q separates strong/weak students

  // Status
  is_active: boolean;
  is_verified: boolean;              // Reviewed by subject matter expert
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;                        // UUID
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;                      // Option text
  is_correct: boolean;
  distractor_type: DistractorType | null;  // For wrong answers: why this distractor was chosen
}

export type BloomLevel =
  | 'remember'     // Recall a fact
  | 'understand'   // Explain a concept
  | 'apply'        // Use knowledge in a new situation
  | 'analyze'      // Break down and examine
  | 'evaluate'     // Judge or assess
  | 'create';      // Design or synthesize (rare in MCQ)

export type AleFrequency =
  | 'very-high'    // Appears every exam (≥80% probability)
  | 'high'         // Appears most exams (50–80%)
  | 'moderate'     // Appears some exams (20–50%)
  | 'low'          // Appears rarely (<20%)
  | 'emerging';    // New topic, limited exam history

export type DistractorType =
  | 'common-misconception'    // Student confuses this with the correct answer
  | 'adjacent-value'          // Numerically close (e.g., 2.40m vs 2.70m)
  | 'different-context'       // Correct for a different scenario (e.g., non-habitable vs habitable)
  | 'partial-truth'           // Contains some correct elements but is incomplete
  | 'plausible-fabrication';  // Sounds right but is entirely wrong
```

### 1.1 Client-Facing Question (Stripped)

The client never receives `correct_option_id`, `rationale`, or `wrong_answer_rationales` until after submission. The server strips these fields.

```typescript
// What the client receives during active quizzing
export interface QuestionForClient {
  question_id: string;
  position: number;                   // 1-indexed
  stem: string;
  image_url: string | null;
  image_alt_text: string | null;
  taxonomy_breadcrumb: string;
  difficulty_label: 'Easy' | 'Medium' | 'Hard';  // Computed from difficulty_level
  options: Array<{
    id: string;
    letter: 'A' | 'B' | 'C' | 'D';
    text: string;
    // is_correct NOT included — server reveals after submit
  }>;
}
```

---

## 2. ALE Taxonomy Map

The complete hierarchy that drives the topic picker, question tagging, heatmap, and mastery tracking.

### 2.1 Area A — History, Theory, Planning, Practice (30% of ALE)

```
disciplines/area-a
├── A1 · History of Architecture
│   ├── A1.1 · Ancient Architecture (Egyptian, Greek, Roman)
│   ├── A1.2 · Medieval Architecture (Byzantine, Romanesque, Gothic)
│   ├── A1.3 · Renaissance & Baroque
│   ├── A1.4 · Modern Architecture (Art Nouveau → Postmodern)
│   ├── A1.5 · Contemporary Architecture
│   └── A1.6 · Philippine Architecture (pre-colonial → contemporary)
├── A2 · Theory of Architecture
│   ├── A2.1 · Elements of Architecture (space, form, line, texture)
│   ├── A2.2 · Principles of Design (balance, rhythm, proportion, scale)
│   ├── A2.3 · Perception & Visual Psychology
│   ├── A2.4 · Tropical Architecture & Climate-Responsive Design
│   └── A2.5 · Masters of Architecture (biographies + works)
├── A3 · Architectural Practice & Laws
│   ├── A3.1 · RA 9266 (Architecture Act of 2004)
│   ├── A3.2 · UAP SPP Documents 201–209
│   ├── A3.3 · Code of Ethical Conduct
│   ├── A3.4 · PD 1096 (National Building Code — general provisions)
│   ├── A3.5 · RA 9514 (Fire Code — general provisions)
│   ├── A3.6 · BP 344 (Accessibility Law)
│   ├── A3.7 · Contract Documents & Specifications
│   └── A3.8 · Quantity Surveying & Estimating
└── A4 · Planning
    ├── A4.1 · General Principles of Planning
    ├── A4.2 · Urban & Regional Planning
    ├── A4.3 · Housing & Human Settlements (PD 957, BP 220)
    └── A4.4 · Site Planning & Landscape Architecture
```

### 2.2 Area B — Structural Design, Materials, Utilities (30% of ALE)

```
disciplines/area-b
├── B1 · Structural Design
│   ├── B1.1 · Timber Design (NSCP provisions)
│   ├── B1.2 · Reinforced Concrete Design (beams, columns, slabs, footings)
│   ├── B1.3 · Structural Steel Design
│   ├── B1.4 · Seismic Design & Load Combinations (NSCP 2015)
│   └── B1.5 · Composite & Advanced Structures
├── B2 · Building Materials & Construction
│   ├── B2.1 · Civil Works & Earthworks
│   ├── B2.2 · Concrete & Masonry (CHB, hollow blocks, mix design)
│   ├── B2.3 · Carpentry & Joinery
│   ├── B2.4 · Structural Steel Works
│   ├── B2.5 · Waterproofing, Damproofing, Insulation
│   ├── B2.6 · Glass & Glazing
│   └── B2.7 · Painting, Hardware, Fenestration
└── B3 · Utilities
    ├── B3.1 · Sanitary & Plumbing Systems
    ├── B3.2 · HVAC & Mechanical Systems
    ├── B3.3 · Electrical & Power Systems
    ├── B3.4 · Acoustics & Illumination Engineering
    ├── B3.5 · Fire Protection & Suppression Systems
    └── B3.6 · Communication & High-Tech Systems
```

### 2.3 Area C — Architectural Design & Site Planning (40% of ALE)

```
disciplines/area-c
├── C1 · Residential Design
├── C2 · Commercial & Business Design
├── C3 · Industrial & Agricultural Design
├── C4 · Public & Government Buildings
├── C5 · Transportation & Service Facilities
└── C6 · Complex Multi-Building Projects

(Area C questions are primarily design scenarios with development control computations:
 TGFA, AMBF, PSO, FLAR, BHL, ISA, USA, TOSL, MACA, parking requirements, setbacks)
```

### 2.4 Taxonomy-to-Question Distribution Targets

To mirror the actual ALE, the question bank should maintain these proportions:

| Area | ALE Weight | Target Question % | Min Questions per Topic |
|---|---|---|---|
| Area A | 30% | 30% | 50 per leaf node |
| Area B | 30% | 30% | 50 per leaf node |
| Area C | 40% | 40% | 80 per leaf node (higher weight) |

**Within each area, high-frequency topics get more questions:**
- Very High frequency topics: 100+ questions per topic
- High frequency: 60–100
- Moderate frequency: 30–60
- Low frequency: 15–30

---

## 3. Difficulty Calibration

### 3.1 The 5-Level Scale

| Level | Label | Target Accuracy | Description |
|---|---|---|---|
| 1 | Easy | 90–95% | Direct recall. "What is the minimum ceiling height?" |
| 2 | Medium-Easy | 80–90% | Recall with one distinguishing factor. "For habitable vs non-habitable?" |
| 3 | Medium | 70–80% | Application. "Given this building type, what ceiling height applies?" |
| 4 | Medium-Hard | 55–70% | Analysis. "Which of these scenarios violates PD 1096 Section 805?" |
| 5 | Hard | 40–55% | Synthesis/evaluation. Multi-step problem combining multiple code provisions. |

### 3.2 Difficulty Assignment Rules

- **Level 1–2:** Bloom's Remember/Understand. Single fact. Single source.
- **Level 3:** Bloom's Apply. Requires context application. Often has a "trap" distractor.
- **Level 4:** Bloom's Analyze. Requires comparing/contrasting. Multiple code sections.
- **Level 5:** Bloom's Evaluate/Create. Multi-step computation or design judgment.

### 3.3 Adaptive Difficulty Algorithm

```typescript
// src/lib/quiz/adaptive-difficulty.ts

interface AdaptiveState {
  recentWindow: boolean[];  // Last 5 answers: true=correct, false=wrong
  currentAccuracy: number;  // Running accuracy over the session
  targetAccuracy: number;   // 0.85 (the 85% rule from Wilson et al., 2019)
  currentDifficulty: number; // 1–5, starts at user's mastery-based estimate
}

function getNextDifficulty(state: AdaptiveState): number {
  const windowAccuracy = state.recentWindow.filter(Boolean).length / state.recentWindow.length;

  if (windowAccuracy >= 0.90) {
    // Too easy — increase difficulty
    return Math.min(5, state.currentDifficulty + 1);
  } else if (windowAccuracy <= 0.60) {
    // Too hard — decrease difficulty
    return Math.max(1, state.currentDifficulty - 1);
  } else {
    // In the sweet spot (60–90%, targeting 85%) — stay
    return state.currentDifficulty;
  }
}
```

---

## 4. Question Selection by Mode

Each mode has a different question selection strategy:

| Mode | Topics | Difficulty | Selection Logic |
|---|---|---|---|
| Camp | Trail-assigned | Adaptive (targets 85%) | Questions from trail day's topic, weighted by user's mastery gap |
| Chill | Random (all topics) | Mixed (uniform) | Pure random sampling, no weighting |
| Subject | User-selected (1 subject) | Adaptive | Questions from selected subject, adaptive difficulty |
| Focused | Blindspot algorithm | Adaptive (starts easier) | Questions from user's weakest topics, difficulty starts low and ramps |
| Custom | User-selected (multi) | User-selected or mixed | Questions from selected topics at selected difficulty |
| Storm | All topics | Exam-weighted | Mirrors ALE distribution: 30% A, 30% B, 40% C with realistic difficulty curve |
| Full Exam | All topics | Exam-weighted | Same as Storm but 200 questions, exact ALE proportions |
| Extended | All topics or user-selected | Mixed | Large pool, mixed difficulty for stamina training |

### 4.1 Question Freshness Rules

- **Never repeat a question within the same session**
- **Avoid questions answered correctly in last 7 days** (spaced repetition — let them forget slightly before retesting)
- **Prioritize questions answered incorrectly in last 14 days** (targeted reinforcement)
- **For Focused Review: ONLY select from questions previously answered incorrectly** (or from topics with <50% mastery)

---

## 5. Rationale Quality Standards

The rationale is the most important piece of content in the quiz engine. A good rationale turns a wrong answer into a learning moment. A bad rationale gets skipped.

### 5.1 Structure (Every Rationale)

```
[1 sentence] Why the correct answer is correct, with source citation.
[1 sentence] The key distinction being tested.
[1 sentence] Common confusion this question exploits (if applicable).
```

**Target length:** 40–80 words for `rationale`. 80–200 words for `rationale_extended`.

### 5.2 Wrong-Answer-Specific Rationale

For each distractor, `wrong_answer_rationales` must explain why THAT specific option is wrong:

```json
{
  "option_a_id": "2.10m is the minimum for mezzanine floor clearance (PD 1096 Section 806), not habitable rooms.",
  "option_b_id": "2.40m is the minimum for non-habitable rooms like storage and utility areas. The exam frequently tests this distinction.",
  "option_d_id": "3.00m is the standard commercial ceiling height, not the minimum residential requirement."
}
```

### 5.3 Anti-Patterns (Never Do This)

- ❌ "The answer is C." (No explanation)
- ❌ 200+ word rationale for a Level 1 question (Overexplaining simple facts)
- ❌ Rationale that doesn't address why the specific wrong answer is wrong
- ❌ "This is a common exam question." (Not a rationale)
- ❌ Rationale that uses different terminology than the question stem (Causes confusion)

---

## 6. Content Quality Assurance

### 6.1 Every Question Must Pass These Checks

| Check | Requirement |
|---|---|
| Taxonomy tag | Assigned to correct discipline → topic → subtopic |
| Difficulty level | Calibrated against accuracy data (or SME estimate for new questions) |
| Stem clarity | One clear question. No double-barreled stems. No negative phrasing without emphasis ("Which is NOT..."). |
| Option quality | 4 options. No "All of the above" / "None of the above." All options are plausible. Parallel grammatical structure. |
| Correct answer | Verified by SME. Cites primary source (law, code, standard). |
| Rationale | Present. 40–80 words. Cites source. Addresses the specific distinction being tested. |
| Wrong-answer rationales | Present for all 3 distractors. Explains why each specific wrong choice is wrong. |
| Image (if present) | alt_text filled. Image loads under 200KB. Renders correctly at 280px max-height. |
| Code reference | If question cites a law/code: exact section number verified. |
| is_verified | Set to true only after SME review. |

### 6.2 Question Import Pipeline

```
Raw question (from SME, review center, or AI generation)
  ↓
[Step 1] Format validation (stem, 4 options, correct answer, rationale)
  ↓
[Step 2] Taxonomy assignment (discipline + topic + subtopic)
  ↓
[Step 3] Difficulty estimation (SME assigns 1–5, later refined by student data)
  ↓
[Step 4] Distractor analysis (each wrong option gets a distractor_type tag)
  ↓
[Step 5] Rationale quality check (meets 40–80 word standard, wrong-answer-specific)
  ↓
[Step 6] Code reference verification (if applicable — section numbers checked)
  ↓
[Step 7] SME sign-off (is_verified = true)
  ↓
[Step 8] is_active = true → question enters the live pool
```
