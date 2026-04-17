# SlateCamp Wiki Article MDX Template

> This is the MDX that produces the prototype HTML.
> Components marked `NEW` need to be built as React components and registered in the MDX component map.
> Components marked `EXISTING` are already in the codebase.

---

## The MDX content (what goes in the Supabase `content` column)

```mdx
<KeyValues items={[
  { value: "40%", label: "Total Weight" },
  { value: "150", label: "MCQ Questions" },
  { value: "10h", label: "Exam Duration" },
  { value: "Day 2", label: "Full Exam Day" }
]} />

You are about to spend three to six months preparing for the ALE. Before you open a single code book, understand this: one subject carries more weight than any other, occupies an entire exam day by itself, and has ended more Licensure Exam attempts than all the others combined.

This is that subject.

This article orients you before the review begins. It explains what Design actually tests, how the exam format works, and the mental model that separates passers from retakers.

---

## Why Design decides the exam

The ALE scores three subject clusters. Two of them share Day 1. Design gets Day 2 entirely to itself.

| Cluster | Subjects | Weight |
|---|---|---|
| Day 1 AM | History and Theory, Planning, Professional Practice | 30% |
| Day 1 PM | Structural Design, Building Materials, Utilities | 30% |
| Day 2 | **Architectural Design and Site Planning** | **40%** |

The passing standard is a weighted average of **70%** across all subjects, with no individual subject falling below **50%**.

A student who scores 60% in Design needs roughly 77% across every other subject to reach 70% overall. A student who scores 80% in Design can average 63% on everything else and still pass.

Design does not contribute to the exam. It governs the outcome.

<WikiCalloutBox type="most-tested">
Design carries **40%** of the total ALE weight. **150 MCQ questions over 10 hours** on Day 2. No other subject comes close.
</WikiCalloutBox>

<ElaborativeInterrogation
  promptId="ei-weight-math"
  type="mcq"
  question="A student scores 60% in Design. What approximate average do they need across ALL other subjects to still reach the 70% passing threshold?"
  options={[
    { text: "70% across all other subjects", is_correct: false },
    { text: "77% across all other subjects", is_correct: true },
    { text: "85% across all other subjects", is_correct: false },
    { text: "63% across all other subjects", is_correct: false }
  ]}
  revealText="Because Design carries 40% of the total weight, underperformance here creates a massive deficit. At 60% in Design, you contribute 24 points (60 x 0.4) toward the 70-point target. The remaining 60% of weight must produce 46 points, meaning you need 46 / 0.6 = 76.7%, roughly 77%. This is why Design performance is the single biggest predictor of pass/fail outcomes."
/>

---

## What Design actually measures

Design is the integration subject. It tests whether you can apply multiple codes, standards, and spatial principles simultaneously to a written design scenario, the way a licensed architect does on a live project.

Every other ALE subject feeds into it.

<Tabs defaultTab="codes">
  <Tab label="Codes & Laws" value="codes">

| Subject | What it contributes |
|---|---|
| **PD 1096** (National Building Code) | Development controls (AMBF, PSO, TGFA, FLAR, BHL), setbacks, parking, occupancy |
| **RA 9514** (Fire Code) | Egress requirements, travel distances, fire safety provisions |
| **BP 344** (Accessibility Law) | Accessible design dimensions for doors, corridors, washrooms |

  </Tab>
  <Tab label="Technical Subjects" value="technical">

| Subject | What it contributes |
|---|---|
| **Structural conceptualization** | Appropriate structural system for a given height, span, and seismic zone |
| **Building utilities** | MEP room sizing, fixture counts, ventilation requirements |
| **Planning principles** | Site analysis, orientation, circulation, land use decisions |

  </Tab>
  <Tab label="How They Integrate" value="integration">

On exam day, a single question might require PD 1096 setback values, RA 9514 egress distances, and BP 344 corridor widths applied simultaneously to determine whether a floor plan is compliant.

A student who studies these subjects in separate notebooks misses the point. Design is where they all converge.

  </Tab>
</Tabs>

---

## The 2009 format shift

Before 2009, Design was a drafting exam. You drew floor plans, site plans, sections, and elevations by hand.

That exam no longer exists. *PRBoA Resolution No. 2009-14* (September 2009) replaced it with a non-drafting, multiple-choice format.

**The current format**

| Parameter | Value |
|---|---|
| Question format | Multiple choice (MCQ) |
| Total questions | **150** |
| Duration | **10 hours** (8:00 AM to 6:00 PM) |
| Scenario structure | 6 to 10 design briefs, each generating 15 to 25 questions |
| Open book | **Rules VII and VIII of the 2004 Revised IRR of PD 1096 only** |
| Answer method | OMR sheet |

<WikiCalloutBox type="ale-watch">
Students who prepare for Design by practicing hand-drafting or CAD are training for an exam that was retired in 2009. The current exam tests applied knowledge: your ability to compute, apply codes, and make spatial judgments from a written brief.
</WikiCalloutBox>

---

## The open-book rule

You may bring one reference into the exam room on Day 2: a printed copy of **Rules VII and VIII** of the 2004 Revised IRR of PD 1096. Nothing else.

This is both an advantage and a trap.

<Accordion>
  <AccordionItem title="Memorize the formulas (AMBF, PSO, TGFA, FLAR)">
    You do not have time to derive them from the text during the exam. These formulas must be automatic.
  </AccordionItem>
  <AccordionItem title="Memorize the table structures">
    Know that setbacks are in Rule VII Section 707, that light and ventilation is in Rule VIII Section 806. Navigate by section number, not by reading.
  </AccordionItem>
  <AccordionItem title="Tab your copy before exam day">
    Color-coded tabs by section save 30 to 60 seconds per lookup. Across 150 questions, that adds up to an hour.
  </AccordionItem>
  <AccordionItem title="Use the book for verification, not initial computation">
    Compute from memory first, then confirm. Students who look up every value run out of time.
  </AccordionItem>
</Accordion>

Every code provision outside Rules VII and VIII (BP 344 dimensions, RA 9514 travel distances, parking ratios, occupancy loads, stair dimensions) must live in your head.

---

## Think like the architect of record

Every question in the Design exam is a professional decision that a licensed architect makes on a live project. You are not a student answering a test. You are the architect of record.

<FormulaBlock label="Development Controls Chain" steps={[
  { variable: "AMBF", operator: "=", operands: ["TLA", "PSO%"], comment: "Allowable Maximum Building Footprint" },
  { variable: "TGFA", operator: "=", operands: ["AMBF", "floors"], comment: "Total Gross Floor Area" },
  { variable: "FLAR", operator: "=", operands: ["TGFA", "TLA"], comment: "Floor-to-Lot Area Ratio (verify vs Table VII.G.2)", divides: true }
]} />

The exam does not test whether you can recall a number. It tests whether you can apply that number correctly in the context of a specific building, on a specific site, in a specific zone.

<ElaborativeInterrogation
  promptId="ei-architect-constraints"
  type="open"
  question="A client asks you to maximize the floor area of a 4-storey commercial building on a C-1 lot. What are the first three constraints you check before even sketching a layout? Why those three?"
  placeholder="Write your answer here. There is no single correct answer, but the explanation below will help you calibrate your thinking."
  revealText="The three governing constraints for maximizing floor area are: (1) PSO% for the C-1 zone, which caps the building footprint as a percentage of total lot area; (2) setback requirements from Rule VII, which reduce the buildable area from all property edges; and (3) FLAR range from Table VII.G.2, which caps the total gross floor area relative to lot size. You check these before sketching because they define the maximum envelope. Any layout that exceeds these limits is non-compliant regardless of how well it functions. The architect of record solves constraints before solving the design."
/>

<WikiCalloutBox type="ale-watch">
The most dangerous misconception about Design: that it rewards creativity. It does not. The ALE rewards correct, code-compliant, spatially logical solutions. A beautiful plan that violates setback requirements fails. A plain plan that meets every provision passes.
</WikiCalloutBox>

---

## Common mistakes

<WikiMistakeList mistakes={[
  {
    number: 1,
    title: "Using the old corridor width",
    wrongValue: "1,200 mm",
    correctValue: "1,500 mm",
    explanation: "The 2024 IRR raised this. Most older review materials still show the wrong value.",
    sourceRef: "2024"
  },
  {
    number: 2,
    title: "Making the cubicle rectangular",
    wrongValue: "1,700 x 1,800 mm",
    correctValue: "1,800 x 1,800 mm",
    explanation: "The 2024 cubicle is a square. The old asymmetric plan is superseded.",
    sourceRef: "2024"
  }
]} />

---

## Check yourself

<InlineQuiz
  question="What percentage of the total ALE weight does Architectural Design and Site Planning carry?"
  options={[
    { text: "25%", is_correct: false },
    { text: "30%", is_correct: false },
    { text: "40%", is_correct: true },
    { text: "50%", is_correct: false }
  ]}
  rationale="Design carries 40% of the total ALE weight, making it the single heaviest subject. Day 1 AM and Day 1 PM each carry 30%."
/>

<InlineQuiz
  question="Which reference material are you allowed to bring into the Design exam?"
  options={[
    { text: "The full National Building Code (PD 1096)", is_correct: false },
    { text: "Rules VII and VIII of the 2004 Revised IRR of PD 1096", is_correct: true },
    { text: "BP 344 and RA 9514", is_correct: false },
    { text: "No reference materials allowed", is_correct: false }
  ]}
  rationale="Only Rules VII and VIII of the 2004 Revised IRR of PD 1096. Not the full code, not BP 344, not RA 9514, not your notes. Tab your copy before exam day."
/>

---

## How to use this subject

The subtopics are sequenced to build from foundation to execution. This subtopic orients you. The ones that follow give you the knowledge.

| Order | Subtopic | What it gives you |
|---|---|---|
| 01 | Subject Overview and Strategy | Orientation, exam format, mental model |
| 02 | Anthropometrics and Human Dimensions | The human body as the source of every dimension |
| 03 | Design Process and Methodology | How architects solve design problems |
| 04 | Environmental Design | Orientation, ventilation, tropical considerations |
| 05 | Site Planning and Analysis | Reading a site: slope, access, context |
| 06 | National Building Code Application | Rules VII and VIII, the open-book material |
| 07 | Parking Design | Slot computation, driveway dimensions, loading |
| 08 | Fire Safety, Egress and Life Safety | RA 9514: travel distances, exit widths, occupant loads |
| 09 | Accessibility Standards (BP 344) | Accessible design dimensions. Memorize. |
| 10 | Graphic Presentation | Drawing conventions, symbols, graphic language |
| 11-14 | Building Type Design | Spatial DNA of each building type |
| 15 | Subject Mastery and Connections | Key values, common mistakes, practice questions |

Read them in order on the first pass. After that, use the code subtopics as reference libraries you return to when practicing design scenarios.
```

---

## Component Registry (what needs to exist in WikiArticle.tsx)

```typescript
// In your MDXRemote components prop:
const wikiComponents = {
  // EXISTING — already registered
  WikiCalloutBox,
  WikiChangedPill,
  WikiPartHeader,
  WikiMistakeList,
  WikiMistakeCard,
  Note, Warn, Tip, Example, Callout,
  ElaborativeInterrogation,

  // NEW — need to be built
  KeyValues,          // stat cards strip (value + label)
  Tabs,               // container with tab bar
  Tab,                // individual tab panel
  Accordion,          // collapsible container
  AccordionItem,      // individual collapsible item
  FormulaBlock,       // dark code-style formula display
  InlineQuiz,         // self-contained MCQ with rationale reveal
}
```

---

## Structural Rules (enforced by the renderer, not by content)

These are NOT in the MDX content. They are handled by the page layout and WikiArticleHero component:

1. **Hero section** (title, tags, updated date, ALE banner) — rendered from DB columns
2. **Horizontal divider** after hero, before article content — `<hr>` in page.tsx
3. **Sources** — popover in the right sidebar, not in article body. Stored as a JSON column or related table.
4. **`---` before every `## H2`** — content author responsibility, enforced by production bible

---

## DB Columns That Feed the Hero (not in MDX content)

| Column | Renders as |
|---|---|
| `title` | Blue article title (Inter 700, cobalt) |
| `subject_label` | Tag pill: "ALE-DSGN-014 · ARCHITECTURAL DESIGN AND SITE PLANNING" |
| `difficulty_label` | Tag pill: "FOUNDATIONAL" |
| `updated_note` | Gray text: "Updated March 21, 2026" |
| `ale_tests_you` | Blue banner: "THE ALE TESTS YOU TO: Identify key concepts..." |
| `sources` (proposed) | JSON array feeding the sidebar popover |

