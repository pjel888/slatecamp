---
name: slatecamp-content-optimizer
description: >
  Rewrite and optimize SlateCamp LEA wiki articles and linked questions at scale for maximum learning retention, comprehension, and exam performance. Combines technical accuracy verification (via SME standards), learning science design (retrieval practice, cognitive load, transfer), and human voice (real-world scenarios, practice stories, relatable stakes). Designed for batch processing 500+ articles and 7000+ questions. Use when the user asks to rewrite, edit, improve, or finalize any SlateCamp content after the flagging pass is complete.
version: 2.0.0
author: Philip Echavez Lewis / SlateCamp
---

# SlateCamp Content Optimizer

## Mandatory Prerequisites

**Before any rewrite or edit:**
1. Run `skill_view(name='slatecamp-content-audit-flagging')` if available, or read the master tracker at `.ai/14_fact_checking/article-flagging-pass-tracker.md`
2. Read the article's flag report in `.ai/14_fact_checking/flags/` if one exists
3. Load the `lea-subject-matter-expert` skill and verify all technical claims against the flag findings
4. Read the article bundle: `normalized.md`, `linked-questions.json`, `sources.json`, `article-metadata.json`

**Never skip the accuracy check.** A beautifully written wrong fact costs a student the exam.

---

## The Three-Layer System

Every article rewrite goes through three layers in sequence.

### Layer 1: Technical Accuracy (SME)

Before you restructure or polish a single word, verify:

- Every dimensional value (ceiling height, stair width, ramp slope) matches the current IRR
- Every section number (Sec. 805, Rule VII, Art. 1723) is correctly cited
- Every penalty range, eligibility requirement, and legal deadline is exact
- Linked questions do not contradict the article text

**If a flag report exists:** resolve every HIGH and CRITICAL flag before touching the article structure. For MEDIUM and LOW flags, correct them as you rewrite but do not let them block progress.

**If the article's `sources.json` is empty (universal finding):** note it in a comment section at the bottom of the article and rely on the SME skill's knowledge. Do not fabricate citations.

### Layer 2: Learning Design (Retention + Transfer)

Apply these defaults in order:

**Structure:**
- One concept per section. If the article covers 5 concepts, it has 5 sections plus intro and review.
- Each section: Explanation → Concrete Example → Why It Matters → Quick Check
- Put the exam-relevant point at the start of each section. Learners scanning for answers should find them fast.
- End the article with a practice section.

**Cognitive load:**
- Short paragraphs: 2-4 sentences maximum.
- Define every technical term the first time it appears. Put the definition in parentheses or a short clause right after the term.
- Numbers without anchors are forgettable. Always tie a dimension to something human: "2.40m (just tall enough for a 1.80m person to raise their arm without touching the ceiling)."
- Use tables ONLY for comparison tasks. For reference data, use bullet lists with labels.

**Retrieval and transfer:**
- Every major section ends with one check-for-understanding question the learner can answer in their head.
- Include a "Common Misunderstanding" block per section when the topic has a known trap.
- End the article with 3-5 practice questions: 2 recall, 2 apply, 1 transfer.

### Layer 3: Human Voice (Real Stakes + Relatable Context)

This is what separates SlateCamp content from generic reviewer materials. Every article needs at least two of the following:

**1. The "You Are Here" scenario**
Place the learner in a real situation. Use second person ("you").
> "You are designing a 5-storey commercial building in Baguio. The building official flags your stair width. Are you sure 900mm is enough for a mercantile occupancy? Let's check Rule XII..."

**2. The "This Actually Happens" moment**
Describe a real consequence of getting it wrong.
> "An architect in Manila once submitted plans with 1.50m corridors for an office building. The building official rejected them on the spot. The code requires 1.80m for corridors serving more than 10 occupants. That rejection cost the client two weeks and the architect a reputation hit."

**3. The "Why This Number" explanation**
Never leave a number unexplained. Connect it to human scale or physics.
> "Why 74 degrees Celsius for ordinary sprinkler activation? Because that is just above the highest temperature a habitable room reaches naturally. A room at 72 degrees is dangerously hot for occupants already. The sprinkler activates before the room reaches survivability limits."

**4. The "Contractor Will Try" warning**
For practice articles, warn about real-world pushback.
> "Your contractor will tell you 1.80m corridors are wasteful. They will suggest 1.20m to save floor area. Do not accept it. Show them Table XII.1 of PD 1096 IRR. They need to design for code, not for their convenience."

**5. A relatable hook or a memorable analogy**
> "Think of the TGFA formula the way you think about packing a balikbayan box. You have a fixed container size (the lot). You can only fill it up to a certain percentage (PSO). And you can stack things only up to a certain height (FLAR x AMBF)."

---

## Formatting Rules

### No Em Dashes

Em dashes ( — ) are an AI tell. Never use them. Use these alternatives instead:

| Instead of em dash | Use |
|---|---|
| "Rule VII -- which covers occupancy -- is..." | "Rule VII (which covers occupancy) is..." |
| "Three materials -- wood, steel, concrete -- are..." | "Three materials are common: wood, steel, and concrete." |
| "The architect -- tired and hungry -- signed..." | "The architect, tired and hungry, signed..." |
| "One thing matters -- accuracy." | "One thing matters: accuracy." |

When you need a strong break between clauses, use a period or colon. When you need a parenthetical aside, use commas or parentheses. When you need emphasis, use bold or a separate sentence.

### Voice Guidelines

**Do:**
- Use "you" for the learner (second person, direct)
- Use short declarative sentences for key points
- End sections with a clear takeaway
- Write like a senior architect explaining to a junior colleague who is smart but inexperienced
- Use contractions (it's, doesn't, can't) -- real people use them
- Vary sentence length for rhythm

**Do not:**
- Use em dashes
- Start sentences with "Interestingly," "Notably," "It is worth noting that"
- Use "In today's fast-paced world" or any generic opener
- Use "comprehensive guide," "revolutionary," "game-changing"
- Overuse "delve," "explore," "navigate" as metaphors
- End with motivational filler like "you've got this" or "keep pushing" (save that for the Topnotcher skill)
- Use passive voice when active is clearer ("the code requires" not "it is required by the code")
- Use "utilize" when "use" works

### The 30-Second Title Test

Your title should tell a learner in 5 words whether this article is relevant to them. Good titles:

- "Minimum Ceiling Heights (PD 1096 Sec. 805)"
- "Ramp Slope Requirements Under BP 344"
- "DAE Requirements: What Counts as Diversified Experience"
- "Signing and Sealing Rules (RA 9266 Sec. 33)"

---

## Article Templates by Type

### Template A: Law/Code Article

Use for topics with a clear legal basis (PD 1096 sections, RA 9266, BP 344, RA 9514).

```
# Title

## Why This Matters for the LEA
One paragraph explaining how this topic appears on the exam and how much weight it carries.

## The Legal Basis
The exact law, section, and provision. Quote the relevant text if it is short.

## Key Requirements (numbered or bulleted)

**[Term 1]**
- Exact code value
- Why this value exists (human scale, safety rationale)
- Example in practice

**[Term 2]**
- Same pattern

## What the Exam Tests
The specific questions format: computation, recall of exact value, or application scenario.

## Common Misunderstandings
- [Misconception]: [Correction]
- [Misconception]: [Correction]

## Practice
1. Recall question
2. Apply question
3. Transfer question
```

### Template B: Concept/Knowledge Article

Use for historical periods, theory concepts, planning theories, and non-code topics.

```
# Title

## Learning Goal
What the learner should be able to do after reading.

## The Core Idea
One paragraph that defines the concept in plain language.

## Why It Matters for the LEA
How this topic appears on the exam. Frequency, question type, weight.

## Breakdown
### [First concept]
Explanation → example → why it matters

### [Second concept]
Same pattern

## How This Connects to Other Topics
Cross-reference to related articles.

## What the Exam Tests
Typical question format. Known traps.

## Practice
1-2 recall, 2 apply, 1 transfer question.
```

### Template C: Practice/Professional Article

Use for RA 9266 practice topics, SPP documents, ethical obligations, contracts.

```
# Title

## Why This Matters for Your Future Practice
One paragraph connecting this topic to a real architectural career scenario.

## The Legal Framework
Which law or SPP document governs this.

## Key Rules
1. [Rule] — explanation + why it exists
2. [Rule] — same pattern

## The "Your First Job" Scenario
A concrete hypothetical: you are in your first year as an architect, this situation happens, what do you do?

## The Exam Angle
How PRBoA tests this. Typical MCQ format.

## Common Misunderstandings
Practice-specific traps.

## Practice
```

---

## Question Optimization Protocol

Every linked question in `linked-questions.json` also needs a pass.

### Fix 1: Answer Length Parity

This is critical. **Scan every question's options. If the correct answer is consistently the longest option, rewrite the distractors to match in length.**

Rule of thumb:
- All four options should be within 10-15 characters of each other
- If one option has a parenthetical or example that makes it longer, add similar parentheticals to other options
- If the correct answer needs extra explanation, move the explanation to the rationale (not the option text)

**Example of the problem:**
```
A. PD 1096
B. RA 9266
C. The National Building Code of the Philippines (PD 1096) as amended by subsequent laws and its 2004 Revised IRR
D. BP 344
```
Option C is obviously the answer because it is the longest. Fix by making all options equally specific or equally terse.

**Fixed:**
```
A. PD 1096 and its 2004 Revised IRR
B. RA 9266 and its Implementing Rules
C. BP 344 and its 2024 Revised IRR
D. RA 9514 and its fire code rules
```
Now the answer (A) is the same length as the distractors. The learner must actually know the content.

### Fix 2: Distractor Quality

Every distractor must be **plausibly wrong** — based on a real mistake, not a random wrong number.

Good distractors for a question about minimum ceiling height:
- 2.10m (this is the minimum for mezzanines and corridors — a real confusion point)
- 2.70m (this is the minimum for schools and hotels — adjacent code value)
- 3.00m (this is a common misconception from old reviewer materials)

Bad distractors:
- 1.50m (no one would ever think this is correct)
- 15.00m (obviously wrong, wastes the learner's time)

### Fix 3: Avoid Pattern Leaks

Common patterns that signal the correct answer:
- Correct answer is always a specific law number vs. vague other options
- Correct answer uses more precise language
- Correct answer is the only one with a qualifier like "in most cases" or "typically"
- Correct answer is the only one without a qualifier like "always" or "never"
- Options A, B, C are exact values, D is "all of the above" (biased toward D)
- Options include "none of the above" or "all of the above" (avoid these entirely)

**Check every question for these leaks before considering it done.**

---

## Scale Protocol: 500+ Articles

Batch processing at this scale needs a systematic approach.

### Priority Order

1. **Critical errors first** — articles with CONFIRMED_INCORRECT or CRITICAL flags (wrong facts that will make students fail). These need the full three-layer rewrite.
2. **High-impact law/code articles** — PD 1096, RA 9266, BP 344, RA 9514 articles with HIGH flags. Medium-depth rewrite.
3. **Remaining flagged articles** — articles with missing citations only, non-critical typos. Light rewrite: add human voice elements and practice sections, fix typos.
4. **Clean articles (PASSED)** — verify accuracy is still current, then add human voice layer and practice sections. Quickest pass.
5. **Questions** — batch audit for answer length parity across all 7000+ questions.

### Batch Tagging

When working on a batch, maintain a batch tracker:
- Batch size: 10-20 articles per session
- Track: article ID, priority tier, before/after state
- Note any patterns discovered across the batch (common errors, recurring misconceptions)

### Efficiency Rules

- If an article has only a MISSING_CITATION flag and all content is verified correct, you do not need to rewrite it from scratch. Add the human voice elements, add a practice section, note the empty sources.json, and move on.
- If an article has CRITICAL flags, pause and fix those facts before any restructuring. The structure is built around the facts.
- Group articles by subject area (all BP 344 articles together, all PD 1096 articles together). This builds momentum: you recall the code provisions once and apply them across multiple articles.

---

## Verification Rubric

Before marking an article rewrite as complete, check:

| Criterion | Pass Standard |
|---|---|
| Accuracy | All facts, values, and legal references verified against SME skill. All CRITICAL and HIGH flags resolved. |
| Cognitive Load | No section longer than 4 paragraphs. Terms defined on first use. Numbers anchored to human scale. |
| Retrieval | At least one check-for-understanding prompt per major section. 3-5 practice questions at the end. |
| Human Voice | At least two of: "You Are Here" scenario, "This Actually Happens" moment, "Why This Number" explanation, "Contractor Will Try" warning, or a relatable analogy. |
| Formatting | No em dashes. No AI filler phrases. Active voice. Second person. Short paragraphs. |
| Questions | Answer length parity checked and fixed. Distractors are plausibly wrong. No pattern leaks. |
| Sources | Empty sources.json noted (do not fabricate). If a source can be cited from SME knowledge, add it. |
| Title | Passes the 30-second test. Learner knows immediately if this article is relevant. |

---

## Reference Files

| File | Path |
|---|---|
| Flagging tracker | `.ai/14_fact_checking/article-flagging-pass-tracker.md` |
| Flag reports | `.ai/14_fact_checking/flags/` |
| Article bundles | `.ai/content-audit-export/articles/{slug}--{id}/` |
| MDX component registry | `src/components/wiki/mdx-components-shared.ts` |
| Widget registry | `src/components/wiki/widgets/registry.ts` |
| Wiki index/barrel | `src/components/wiki/index.ts` |

---

## Wiki UI Component System

SlateCamp wiki articles are rendered as MDX. The following custom components are available for embedding interactive and structured content directly into article markdown. Use them to replace plain text with richer, more engaging formats.

### How These Work

These are JSX tags you write directly into the article's `normalized.md`. They are registered in `mdx-components-shared.ts` and rendered by the wiki MDX engine at display time. No special build step needed.

### Callout Blocks (not-prose)

Use these for emphasis, warnings, tips, and legal citations. They break up long prose and draw the reader's eye.

| Tag | Variant | Use For |
|---|---|---|
| `<Tip>` | Green, lightbulb icon | Study tips, mnemonics, memory aids |
| `<Example>` | Cobalt, book icon | Concrete examples and worked scenarios |
| `<Warn>` or `<Warning>` | Amber, warning icon | Common mistakes, traps, things to watch out for |
| `<Note>` | Blue, info icon | Supplementary info, clarifications |
| `<ExamTip>` | Cobalt border, target icon | Direct exam strategy (e.g., "This appears 2-3 times per cycle") |
| `<AlertBox type="requirement">` | Cobalt | Key code requirements, mandatory rules |
| `<AlertBox type="warning">` | Amber | Important warnings |
| `<AlertBox type="danger">` | Red | Critical errors that will fail a student |
| `<AuthorityContent>` | Gray italic | Direct legal citations, section quotes |

**Usage:**
```md
<Tip>Think "11-20-25" for public stairs: 1,100mm width, 200mm riser, 250mm tread.</Tip>

<Warn>A common mistake is using the 1,100mm standard for residential stairs. Group A dwellings can use 900mm minimum (Table VIII.5).</Warn>

<ExamTip>Ceiling height questions appear in approximately 3 out of every 5 LEA cycles. Know the 2.40m rule cold.</ExamTip>
```

### Law Callout (Color-Coded by Code)

Use `<LawCallout>` when citing a specific law provision. It auto-colors based on the code type, making legal citations visually scannable.

| Code Value | Law | Color |
|---|---|---|
| `nbcp` | PD 1096 (NBCP) | Cobalt |
| `bp344` | BP 344 (Accessibility) | Emerald |
| `ra9514` | RA 9514 (Fire Code) | Red |
| `bp220` | BP 220 (Housing) | Amber |
| `pd957` | PD 957 (Subdivisions) | Gray |
| `irr` | Revised IRR | Orange |

**Usage:**
```md
<LawCallout code="nbcp" section="Sec. 805">
  Every habitable room shall have a ceiling height of not less than 2.40 meters.
</LawCallout>

<LawCallout code="bp344" section="Section 5.2">
  Ramps shall have a maximum slope of 1:12 and a minimum clear width of 1,200mm.
</LawCallout>
```

### Interactive Learning Blocks

These components make the article active instead of passive. Use them strategically.

| Component | What It Does | When to Use |
|---|---|---|
| `<InlineQuiz question="..." options={...} rationale="...">` | Inline multiple-choice question. 4 options, immediate feedback. | After explaining a key concept. Gives the learner instant feedback. |
| `<ElaborativeInterrogation promptId="..." question="..." options={...} answer="...">` | "Why does this work?" question that requires explanation. | For deeper understanding checks. Teaches reasoning, not recall. |
| `<RevealBlock prompt="..." label="...">` | Drag-to-reveal blur on answer content. | Place over an answer, example solution, or key fact. Forces active recall. |
| `<PrequestionGate topicId="..." topicName="...">` | Questions the learner must answer before they can read the article. | For mastery-oriented articles where pre-testing boosts retention. |
| `<TeachBackPrompt topicId="..." topicName="...">` | Asks the learner to explain the topic in their own words. | At the end of articles. The Feynman technique, built in. |
| `<KeyValues items={...}>` | Key-value grid. Displays stats, dimensions, or code values in a visual card layout. | For quick-reference data: ceiling heights by occupancy, PSO by zone, etc. |

**Usage:**
```md
<InlineQuiz
  question="What is the minimum ceiling height for a habitable room under PD 1096?"
  options={[
    { text: "2.10 m", is_correct: false },
    { text: "2.40 m", is_correct: true },
    { text: "2.70 m", is_correct: false },
    { text: "3.00 m", is_correct: false },
  ]}
  rationale="Section 805 of PD 1096 IRR requires 2.40m minimum for habitable rooms. 2.10m is the minimum for mezzanines and corridors."
/>

<KeyValues items={[
  { value: "2.40 m", label: "Habitable rooms" },
  { value: "2.10 m", label: "Mezzanines" },
  { value: "2.70 m", label: "Schools" },
  { value: "3.00 m", label: "Assembly halls" },
]} />
```

### Structural Components

| Component | Use For |
|---|---|
| `<Tabs>` / `<Tab label="...">` | Tabbed content. Switch between "By the Code" / "In Practice" / "Common Errors" views. |
| `<Accordion>` / `<AccordionItem title="...">` | Expandable sections. Good for detailed explanations the learner can optionally read. |
| `<ProcessFlow>` | Ordered list with timeline-style vertical connector. Perfect for multi-step processes (permit process, design phases). |
| `<ComparisonTable>` | Table with styled blue header and alternating rows. Use for comparing code provisions side by side. |
| `<FormulaBlock label="..." steps={...}>` | Step formula display with monospace formatting. Perfect for AMBF, PSO, TGFA calculations. |
| `<SubjectSnapshot items={...}>` | Compact metadata bar showing exam weight, question count, difficulty, etc. |
| `<WikiChangedPill>` | Small "Updated" badge for recently changed content. |
| `<WikiPartHeader section="..." part="..." title="...">` | Section header for multi-part articles. |
| `<WikiMistakeCard>` / `<WikiMistakeList>` | Callout card/list for common student mistakes. |
| `<Mermaid chart="...">` | Mermaid.js flowchart, sequence diagram, or mind map. Use for visual concept maps. |

**Usage:**
```md
<Tabs>
  <Tab label="By the Code">
    PD 1096 requires 2.40m for habitable rooms...
  </Tab>
  <Tab label="In Practice">
    A common scenario in residential design...
  </Tab>
  <Tab label="Common Errors">
    Students often confuse mezzanine height with habitable room height...
  </Tab>
</Tabs>

<ProcessFlow>
1. **Secure Zoning Clearance** from the local planning office
2. **Submit Architectural Plans** to the OBO for initial review
3. **Structural Review** by the building official's structural engineer
4. **Fire Safety Evaluation** from the BFP
5. **Permit Issuance** once all agencies approve
</ProcessFlow>
```

### Widgets (Lazy-Loaded Interactive Tools)

These are heavier interactive tools registered in `src/components/wiki/widgets/registry.ts`. They are loaded on demand only when the article uses them. Currently available:

| Tag | What It Does |
|---|---|
| `<AccessibilityChangesTable>` | Side-by-side comparison of BP 344 old vs. 2024 IRR changes |
| `<DoorConfigurator>` | Interactive door width/clearance configurator |
| `<CorridorVisualizer>` | Visual corridor width checker with occupancy flow |
| `<CubicleChecker>` | Accessible toilet cubicle dimension checker |
| `<GrabBarExplainer>` | Interactive grab bar placement visualizer |
| `<RecallDrill>` | Spaced-recall drill widget for BP 344 dimensions |
| `<BedroomPlanView>` | Interactive bed placement and clearance checker |
| `<BedSizeComparator>` | Compare bed sizes side by side |
| `<WorkstationCalculator>` | Workspace dimension calculator |
| `<DimensionDrill>` | Drill for DSGN-013 dimension standards |
| `<BodyDimensionExplorer>` | Explore anthropometric data ranges |
| `<ReachEnvelopeDiagram>` | Interactive reach range visualization |
| `<BodyDimensionDrill>` | Drill for body dimension standards |
| `<DHRatioExplorer>` | Depth-to-height ratio explorer for spatial quality |
| `<ProportionComparator>` | Compare room proportions side by side |
| `<SpatialQualityDrill>` | Drill for spatial quality concepts |
| `<Lab3DWidget>` | Embedded 3D Lab interactive model |
| `<PHBuildingSetbacks>` | Philippine setback rules visualization |

**Usage:**
```md
<RecallDrill />
```

### When to Use Each Component

| Context | Recommended Components |
|---|---|
| Citing a code provision | `<LawCallout>` |
| Announcing a study memory aid | `<Tip>` |
| Warning about a common mistake | `<Warn>` |
| Showing a concrete scenario | `<Example>` |
| Testing comprehension mid-article | `<InlineQuiz>` |
| Testing deeper understanding | `<ElaborativeInterrogation>` |
| Forcing recall before revealing | `<RevealBlock>` |
| Presenting code data at a glance | `<KeyValues>` |
| Showing a step-by-step formula | `<FormulaBlock>` |
| Walking through a multi-step process | `<ProcessFlow>` |
| Comparing old vs. new provisions | `<Tabs>` or `<ComparisonTable>` |
| Visualizing a concept relationship | `<Mermaid>` |
| Exam strategy note | `<ExamTip>` |
| Quick-reference subject stats | `<SubjectSnapshot>` |

---

## Common Pitfalls

- **Skipping the accuracy check.** It is tempting to jump straight to rewriting. Do not. A wrong fact polished into beautiful prose is worse than a dry article with correct facts.
- **Making the human voice section too long.** The hypothetical scenario should be 2-3 paragraphs, not a short story. It is seasoning, not the main dish.
- **Adding too many practice questions.** 3-5 is enough. More than 5 and the learner skips them.
- **Forgetting the 30-second title test.** Learners scan. If your title does not tell them what they need, they will not read the article.
- **Consistent answer length on questions but not checking for other pattern leaks.** Fixing the length alone is not enough. Check every pattern listed in Fix 3.
- **Over-optimizing a single article while the batch waits.** Stick to the priority order. A B-tier article with 90% optimization is better than one A+ article and 19 untouched ones.
