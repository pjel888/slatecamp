---
name: slatecamp-3d-information-designer
description: >
  SlateCamp's 3D Information Designer — decides WHAT information students see, WHEN they
  see it, WHERE in 3D space, and HOW it transfers to memory. Activate for: quiz integration
  in 3D scenes, hotspot content writing, progressive disclosure sequences, guided discovery
  paths, cognitive load management, annotation hierarchy, code reference placement, tooltip
  content, learning objective mapping per module, in-canvas quiz placement, rationale
  display, score/feedback integration, tour narrative design, microlearning within 3D.
  Trigger on: "what should the hotspot say", "quiz in 3D", "in-canvas quiz", "learning
  path in 3D", "guided tour content", "annotation text", "progressive disclosure",
  "cognitive load 3D", "information hierarchy", "3D onboarding".
---

# SlateCamp — 3D Information Design Guide

## The Information Design Mandate

A 3D model with no information design is a screensaver. A 3D model with bad information
design is worse — it overwhelms, confuses, and wastes the student's limited study time.

**Your job:** Ensure every 3D Lab module delivers exactly the right information, at the
right time, in the right place, in the right amount — so the student LEARNS, not just LOOKS.

**The information design tests:**
1. **Mayer's Coherence:** Is every piece of information essential to the learning objective?
2. **Cognitive Load:** Can the student process this information given what else is on screen?
3. **Retrieval:** Will the student be able to recall this information during the LEA?
4. **Feedback:** Does the student know if they understood correctly?

---

## Information Architecture of a 3D Module

Every 3D Lab module has four information layers, revealed progressively:

```
Layer 0: THE MODEL (always visible)
  The 3D geometry itself IS information. Shape, proportion, spatial
  relationships communicate before any label appears.

Layer 1: ORIENTATION LABELS (visible on load)
  2-4 persistent labels that name the major elements.
  Student knows WHAT they're looking at within 3 seconds.

Layer 2: EXPLORATION HOTSPOTS (visible on orbit/interaction)
  4-8 hotspot dots appear as the student explores.
  Each reveals a single concept: code requirement, dimension, or principle.
  Student discovers information through spatial exploration.

Layer 3: DEEP KNOWLEDGE (revealed on demand)
  Code citations, full explanations, wiki links, related quiz questions.
  Only shown when the student explicitly requests it (click, tap).
  Never auto-displayed. Never interrupts exploration.
```

### Anti-Pattern: Information Dump on Load

```
❌ Model loads with 12 hotspots visible, a side panel of text,
   dimension lines everywhere, and a quiz prompt.
   → Student is overwhelmed → closes the module → never returns.

✅ Model loads clean. Two labels: "Stairway" and "Handrail."
   Student orbits. Hotspot dots fade in on elements they look at.
   Student taps one → sees one piece of information → processes it.
   → Student feels in control → explores more → learns more.
```

---

## Hotspot Content Design

### The Anatomy of a Perfect Hotspot

```
┌─────────────────────────────────────┐
│ [CATEGORY BADGE: REQUIREMENT]       │  ← Context (what kind of info)
│                                     │
│ Minimum Tread Depth                 │  ← Title (what this is about)
│                                     │
│ The horizontal depth of each step   │  ← Explanation (plain language)
│ must be at least 250mm to provide   │
│ safe footing.                       │
│                                     │
│ ┌─────────────────────────────┐     │
│ │  ≥ 250 mm                   │     │  ← Dimension callout
│ └─────────────────────────────┘     │
│                                     │
│ PD 1096 Section 4.08               │  ← Code citation
│                                     │
│ [Quiz: What is the minimum ▸]       │  ← Optional quiz trigger
│ [Read in Wiki →]                    │  ← Deep link to Wiki article
└─────────────────────────────────────┘
```

### Content Writing Rules for Hotspots

**Rule 1: One concept per hotspot.**
Not "This stairway has a riser height of 180mm which complies with PD 1096 maximum of
200mm and the tread depth is 270mm which meets the minimum of 250mm."

Instead: Two separate hotspots — one for riser, one for tread.

**Rule 2: Plain language FIRST, code language SECOND.**
```
✅ "Each step must be at least 250mm deep for safe footing."
   → PD 1096 Sec 4.08: Min. tread depth = 250mm

❌ "Per PD 1096 Sec 4.08, minimum tread depth shall be 250mm."
   (Code language is a barrier for students still learning the code)
```

**Rule 3: The dimension callout is the most memorable element.**
Students remember numbers attached to visual elements. The dimension callout box
(with the value and unit in monospace) is the #1 retrieval cue for the LEA.

**Rule 4: Personalization tone (Mayer's Principle #10).**
```
✅ "You'd measure this from the nosing to the next nosing."
✅ "Think of this as the 'comfort zone' — your foot needs at least 250mm."

❌ "The measurement is taken from nosing to nosing."
   (Formal, distant — lower retention)
```

---

## Quiz Integration in 3D Scenes

### Three Quiz Placement Strategies

**Strategy 1: Post-Exploration Quiz**
Student explores the model freely → reaches a natural stopping point → quiz appears
as a bottom sheet or side panel with questions about what they just saw.

Best for: First-time exploration of a new module. Don't interrupt discovery.

**Strategy 2: Checkpoint Quiz (Guided Tour)**
During a guided tour, after each narration stop, a quick-check question appears
before the student can advance to the next stop.

Best for: Structured learning sessions, Camp Trail integration.

```
Tour Stop 1: "This is the riser height."
  → Quiz: "What is the maximum riser height per PD 1096?"
  → [150mm] [200mm] [250mm] [300mm]
  → Answer + rationale
  → Tour advances to Stop 2

Tour Stop 2: "This is the tread depth."
  → Quiz: "What is the minimum tread depth?"
  ...
```

**Strategy 3: In-Situ Challenge**
The quiz question is spatially anchored TO the element it tests. The student
must look at the element while answering.

Best for: Parametric modules where the visual is the clue.

```tsx
// Question appears at the stairway riser position
<InCanvasQuiz
  position={[0.5, 0.3, 0]}  // At the riser face
  question={{
    text: "Is this riser height compliant with PD 1096?",
    choices: [
      { id: 'a', text: 'Yes — within the 200mm maximum' },
      { id: 'b', text: 'No — exceeds the 200mm maximum' },
    ],
    correctId: currentRise <= 0.200 ? 'a' : 'b',  // Dynamic!
    rationale: currentRise <= 0.200
      ? `${(currentRise * 1000).toFixed(0)}mm is within the PD 1096 maximum of 200mm.`
      : `${(currentRise * 1000).toFixed(0)}mm exceeds the PD 1096 maximum of 200mm by ${((currentRise - 0.200) * 1000).toFixed(0)}mm.`,
  }}
/>
```

### Dynamic Quiz Questions (Parametric)

The most powerful quiz type: questions that change based on the current model state.

```typescript
interface DynamicQuizQuestion {
  id: string
  generateQuestion: (params: Record<string, number>) => {
    text: string
    choices: { id: string; text: string }[]
    correctId: string
    rationale: string
  }
  triggerCondition: (params: Record<string, number>) => boolean
  position: [number, number, number]
}

const STAIRWAY_DYNAMIC_QUESTIONS: DynamicQuizQuestion[] = [
  {
    id: 'riser-compliance',
    generateQuestion: (params) => {
      const rise = params.rise * 1000
      const isCompliant = rise <= 200
      return {
        text: `The current riser height is ${rise.toFixed(0)}mm. Does this comply with PD 1096?`,
        choices: [
          { id: 'yes', text: 'Yes — compliant' },
          { id: 'no', text: 'No — non-compliant' },
        ],
        correctId: isCompliant ? 'yes' : 'no',
        rationale: isCompliant
          ? `Correct. ${rise.toFixed(0)}mm ≤ 200mm maximum.`
          : `Correct. ${rise.toFixed(0)}mm exceeds the 200mm max by ${(rise - 200).toFixed(0)}mm. Adjust the riser to comply.`,
      }
    },
    triggerCondition: () => true,  // Always available
    position: [0.5, 0.3, 0.3],
  },
  {
    id: 'comfort-formula',
    generateQuestion: (params) => {
      const twoRplusT = (2 * params.rise + params.run) * 1000
      return {
        text: `Calculate 2R + T for the current stairway. Is it within the comfort range (600-650mm)?`,
        choices: [
          { id: 'a', text: `${twoRplusT.toFixed(0)}mm — within range` },
          { id: 'b', text: `${twoRplusT.toFixed(0)}mm — outside range` },
          { id: 'c', text: `${(twoRplusT + 50).toFixed(0)}mm — within range` },
          { id: 'd', text: `${(twoRplusT - 30).toFixed(0)}mm — outside range` },
        ],
        correctId: (twoRplusT >= 600 && twoRplusT <= 650) ? 'a' : 'b',
        rationale: `2R + T = 2(${(params.rise * 1000).toFixed(0)}) + ${(params.run * 1000).toFixed(0)} = ${twoRplusT.toFixed(0)}mm. Comfort range is 600-650mm.`,
      }
    },
    triggerCondition: (params) => params.rise > 0 && params.run > 0,
    position: [1.0, 0.8, 0.3],
  },
]
```

---

## Guided Tour Narrative Design

### Tour Structure (Per Module)

```
TOUR DURATION: 3-5 minutes maximum (attention budget)
STOPS: 4-6 maximum
PACING: Student controls advancement (Mayer's Segmenting)
VOICE: SlateCamp brand — confident companion, not lecturer

Tour Narrative Arc:
1. ORIENT     → "Here's what you're looking at" (5-10 sec)
2. IDENTIFY   → "These are the key elements" (name 2-3 things)
3. EXPLAIN    → "Here's why this matters for the code" (2-3 stops)
4. TEST       → "Can you spot the issue?" (1 quiz question)
5. CONNECT    → "This links to [Wiki topic] and [related module]"
```

### Example Tour Script: PD 1096 Stairway

```typescript
const STAIRWAY_TOUR: TourStop[] = [
  {
    id: 'orient',
    camera: { position: [4, 3, 4], lookAt: [0, 0.5, 0] },
    title: 'The Stairway',
    narration: "This is a residential stairway built to PD 1096 standards. Every dimension you see here is governed by law — not preference.",
    duration: 8,
    highlightMeshes: [],
  },
  {
    id: 'riser',
    camera: { position: [1, 0.5, 2], lookAt: [0.3, 0.3, 0] },
    title: 'Riser Height',
    narration: "The vertical face of each step — the riser — can't exceed 200mm. This protects against tripping. Adjust the slider to see what happens when you push past the limit.",
    duration: 10,
    highlightMeshes: ['riser_face'],
    enableSlider: 'rise',
  },
  {
    id: 'tread',
    camera: { position: [1.5, 1.5, 1], lookAt: [0.5, 0.3, 0] },
    title: 'Tread Depth',
    narration: "The horizontal surface — the tread — must be at least 250mm. That's the minimum your foot needs to land safely. The nosing adds a little extra.",
    duration: 10,
    highlightMeshes: ['tread_surface'],
    enableSlider: 'run',
  },
  {
    id: 'quiz',
    camera: { position: [3, 2, 3], lookAt: [0, 0.5, 0] },
    title: 'Quick Check',
    narration: null,  // Quiz replaces narration
    quiz: {
      text: "If a stairway has a 190mm riser and a 240mm tread, which dimension violates PD 1096?",
      choices: [
        { id: 'a', text: 'The riser (190mm)' },
        { id: 'b', text: 'The tread (240mm)' },
        { id: 'c', text: 'Both violate' },
        { id: 'd', text: 'Neither violates' },
      ],
      correctId: 'b',
      rationale: "The riser (190mm) is within the 200mm maximum. But the tread (240mm) is below the 250mm minimum. Both limits matter.",
    },
    duration: 30,  // More time for quiz
  },
  {
    id: 'connect',
    camera: { position: [4, 3, 4], lookAt: [0, 0.5, 0] },
    title: 'Go Deeper',
    narration: "That's the foundation. For the full code requirements including handrails, headroom, and landing dimensions — visit the Wiki article.",
    links: [
      { type: 'wiki', label: 'PD 1096 Stairways', slug: 'pd-1096-stairways' },
      { type: 'quiz', label: 'Practice Questions', topicId: 'stairway-codes' },
      { type: '3d-lab', label: 'Try the Ramp Module', slug: 'bp344-ramp' },
    ],
    duration: 10,
  },
]
```

---

## Cognitive Load Budget Per Module

Research-backed limits for simultaneous information in a 3D scene:

| Information Type | Maximum On-Screen | Rationale |
|---|---|---|
| Orientation labels | 2-4 | Miller's 7±2 reduced for spatial context |
| Visible hotspot dots | 4-6 | More dots = selection paralysis |
| Open tooltip/panel | 1 | One concept at a time |
| Dimension lines | 3-4 | More = visual noise |
| Quiz question | 1 | Focus attention completely |
| System toggles (MEP) | 5-6 | Grouped as chunked categories |
| Narration text | 2-3 sentences | Working memory constraint |

**The Load Test:** If you squint at the screen and can't tell what you should look at
first → the scene has too much information visible simultaneously.

---

## Module Learning Objective Mapping

Every module MUST start with a learning objective before any content is created:

```typescript
interface ModuleLearningObjective {
  moduleSlug: string
  primaryObjective: string        // "After completing this module, the student can..."
  bloomLevel: 1 | 2 | 3 | 4     // Target Bloom's taxonomy level
  aleQuestionTypes: string[]      // Types of LEA questions this prepares for
  keyValues: string[]             // The 3-5 numbers the student should memorize
  prerequisiteKnowledge: string[] // What the student should know before this module
  successCriteria: string         // How we know the module worked
}

const STAIRWAY_MODULE_OBJECTIVE: ModuleLearningObjective = {
  moduleSlug: 'pd1096-stairway',
  primaryObjective: 'Identify compliant vs. non-compliant stairway dimensions per PD 1096 Section 4.08',
  bloomLevel: 3,  // Apply
  aleQuestionTypes: [
    'Given dimensions, identify which violates code',
    'Calculate 2R+T comfort formula',
    'Identify minimum width by occupancy type',
  ],
  keyValues: [
    '200mm max riser height',
    '250mm min tread depth',
    '1,100mm min width (public)',
    '900mm min width (residential)',
    '2,100mm min headroom',
  ],
  prerequisiteKnowledge: [
    'Basic PD 1096 awareness',
    'Concept of occupancy classification',
  ],
  successCriteria: 'Student correctly answers 3/3 in-module quiz questions without using the model as reference',
}
```

---

## Feedback Design in 3D Context

### Immediate Visual Feedback

When a student answers a quiz question while looking at the model:

**Correct answer:**
- The relevant element briefly pulses green (0.5s)
- The dimension line turns green
- Rationale appears with the confirming value
- "That's right" in brand voice (not "Amazing!" — no toxic positivity)

**Wrong answer:**
- The relevant element briefly pulses cobalt blue (not red — not punishing)
- The correct dimension appears with visual emphasis
- Rationale explains WHY the selected answer was wrong
- "Here's what the code says" (corrective, not evaluative)

### Score Integration

After completing a module's quiz sequence:
```
┌──────────────────────────────────┐
│  MODULE COMPLETE                 │
│                                  │
│  PD 1096 Stairways: 2/3         │
│                                  │
│  ✓ Riser height                  │
│  ✓ Width requirement             │
│  ✗ Tread depth (reviewed)        │
│                                  │
│  This updates your heatmap.      │
│                                  │
│  [Return to Lab ←]  [Wiki →]    │
└──────────────────────────────────┘
```

Score feeds directly into the Readiness Score engine via the same
quiz_session tracking as Camp Mode and Storm Mode sessions.

---

## Reference Files

| File | When to Read |
|---|---|
| `references/hotspot-content-templates.md` | Pre-written hotspot content for all 10 priority modules |
| `references/quiz-question-bank-3d.md` | Quiz questions designed for in-canvas and post-exploration placement |
| `references/tour-scripts.md` | Complete guided tour scripts for priority modules |
| `references/learning-objectives-matrix.md` | Full learning objective mapping for all 186 3D Lab modules |
| `references/cognitive-load-audit.md` | Audit checklist for information density in 3D scenes |
