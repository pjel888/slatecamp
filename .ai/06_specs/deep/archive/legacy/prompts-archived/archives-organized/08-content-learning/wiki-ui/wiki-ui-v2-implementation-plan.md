# Wiki UI v2 Components — Implementation Plan for Claude Code

**Reference file:** `slatecamp-wiki-article-prototype.html` (attached)
**Goal:** Build 6 new React components + update 2 existing ones so the live wiki renders EXACTLY like the HTML prototype.
**Scope:** Article content components only. Right sidebar changes are OUT OF SCOPE.
**Stack:** Next.js App Router, React Server Components where possible, "use client" only when interactivity is required, Tailwind CSS, TypeScript.

**CRITICAL:** The HTML prototype is the pixel-perfect reference. Every color, font-size, padding, border-radius, and spacing value must match. Do not improvise. Do not use Shadcn defaults. Extract values from the prototype CSS.

---

## Design Tokens (already in the codebase, verify they exist)

These CSS custom properties must be available globally. If they are not, add them to `globals.css`:

```css
--cobalt: #1B3FC4;
--cobalt-light: #EEF3FD;
--cobalt-muted: #3B5BD6;
--gold: #F5A623;
--gold-light: #FFF8E6;
--gold-dark: #D4900C;
--red: #E63329;
--red-light: #FFF0EF;
--green: #1B7A3C;
--green-light: #EDFAF4;
--ink: #1A1A1A;
--ink-2: #3D3D3A;
--ink-3: #737370;
--ink-4: #A8A8A5;
--cream: #F2F0EB;
--warm-white: #F8F7F5;
--border: #E0DED8;
--border-light: #ECEAE4;
```

---

## Task 1: `WikiArticleHero.tsx` — Update existing component

### What to change

1. **Title color:** Change the article title `<h1>` to `text-[#1B3FC4]` (cobalt blue). Currently it's dark ink.

2. **Add `<hr>` divider AFTER the hero, BEFORE article content.** This is the horizontal line between the hero section and the article body. Add it as the last element inside the hero component:

```tsx
{/* Last element inside WikiArticleHero, after the ALE banner */}
<hr className="border-t border-[#E0DED8] mt-7 mb-8" />
```

CSS spec from prototype:
```
border: none; border-top: 1px solid #E0DED8; margin: 28px 0 32px;
```

---

## Task 2: `KeyValues.tsx` — NEW client component

**File:** `src/components/wiki/KeyValues.tsx`
**Directive:** `'use client'` is NOT needed. This is a pure presentational component.

### Props

```typescript
interface KeyValuesProps {
  items: { value: string; label: string }[]
}
```

### MDX usage

```mdx
<KeyValues items={[
  { value: "40%", label: "Total Weight" },
  { value: "150", label: "MCQ Questions" },
  { value: "10h", label: "Exam Duration" },
  { value: "Day 2", label: "Full Exam Day" }
]} />
```

### Exact CSS (from prototype)

```
Container:
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))
  gap: 12px
  margin: 20px 0 24px

Each card:
  background: #FFFFFF
  border: 1px solid #E0DED8
  border-radius: 10px
  padding: 16px
  text-align: center

Number:
  font-family: 'Inter', sans-serif
  font-size: 28px
  font-weight: 700
  color: #1B3FC4 (cobalt)
  line-height: 1
  margin-bottom: 4px

Label:
  font-size: 11px
  font-family: 'DM Mono', monospace
  color: #737370 (ink-3)
  text-transform: uppercase
  letter-spacing: 0.06em
```

### Tailwind implementation

```tsx
export function KeyValues({ items }: KeyValuesProps) {
  return (
    <div className="not-prose grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 my-5">
      {items.map((item, i) => (
        <div key={i} className="bg-white border border-[#E0DED8] rounded-[10px] p-4 text-center">
          <div className="font-inter text-[28px] font-bold text-[#1B3FC4] leading-none mb-1">
            {item.value}
          </div>
          <div className="font-mono text-[11px] text-[#737370] uppercase tracking-[0.06em]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Task 3: `Tabs.tsx` + `Tab.tsx` — NEW client component

**File:** `src/components/wiki/Tabs.tsx`
**Directive:** `'use client'` — requires useState for active tab.

### Props

```typescript
interface TabsProps {
  defaultTab?: string
  children: React.ReactNode
}

interface TabProps {
  label: string
  value: string
  children: React.ReactNode
}
```

### MDX usage

```mdx
<Tabs defaultTab="codes">
  <Tab label="Codes & Laws" value="codes">
    | table content here |
  </Tab>
  <Tab label="Technical Subjects" value="technical">
    | table content here |
  </Tab>
</Tabs>
```

### Exact CSS (from prototype)

```
Container (.tabs):
  margin: 20px 0 24px
  border: 1px solid #E0DED8
  border-radius: 10px
  overflow: hidden
  background: #FFFFFF

Tab bar (.tabs-bar):
  display: flex
  border-bottom: 1px solid #E0DED8
  background: #F2F0EB (cream)

Tab button (inactive):
  font-size: 12px
  font-family: 'DM Mono', monospace
  font-weight: 500
  padding: 10px 20px
  border: none
  background: none
  color: #737370 (ink-3)
  cursor: pointer
  border-bottom: 2px solid transparent
  margin-bottom: -1px
  transition: all 0.15s

Tab button (active):
  color: #1B3FC4 (cobalt)
  border-bottom-color: #1B3FC4
  background: #FFFFFF

Tab panel:
  padding: 18px 20px
```

### Implementation notes

- Children are `<Tab>` components. Extract `value` from each child to build the tab bar.
- Use `React.Children.toArray` + type checking to iterate.
- Only render the panel whose `value` matches the active tab.
- MDX renders markdown inside `<Tab>` children, so the panel content will include rendered tables, paragraphs, etc.

---

## Task 4: `Accordion.tsx` + `AccordionItem.tsx` — NEW client component

**File:** `src/components/wiki/Accordion.tsx`
**Directive:** `'use client'` — requires useState for open/closed state.

### Props

```typescript
interface AccordionProps {
  children: React.ReactNode
}

interface AccordionItemProps {
  title: string
  children: React.ReactNode
}
```

### MDX usage

```mdx
<Accordion>
  <AccordionItem title="Memorize the formulas (AMBF, PSO, TGFA, FLAR)">
    You do not have time to derive them from the text during the exam.
  </AccordionItem>
  <AccordionItem title="Tab your copy before exam day">
    Color-coded tabs save 30-60 seconds per lookup.
  </AccordionItem>
</Accordion>
```

### Exact CSS (from prototype)

```
Container (.accordion):
  margin: 16px 0 20px
  border: 1px solid #E0DED8
  border-radius: 10px
  overflow: hidden

Item (.accordion-item):
  border-bottom: 1px solid #ECEAE4
  last-child: border-bottom: none

Trigger button (.accordion-trigger):
  width: 100%
  display: flex
  justify-content: space-between
  align-items: center
  padding: 14px 18px
  background: #FFFFFF
  border: none
  cursor: pointer
  font-size: 14px
  font-weight: 600
  color: #1A1A1A (ink)
  text-align: left
  transition: background 0.15s
  hover: background: #F2F0EB (cream)

Chevron (.chevron):
  font-size: 12px
  color: #A8A8A5 (ink-4)
  transition: transform 0.2s
  when open: transform: rotate(180deg)

Content (when open):
  padding: 0 18px 16px

Content paragraph:
  font-size: 13px
  color: #3D3D3A (ink-2)
  margin-bottom: 8px
```

### Implementation notes

- Each `AccordionItem` manages its own open/closed state independently (multiple can be open at once).
- Use a `▼` character or a Lucide `ChevronDown` icon for the chevron.
- Content is hidden with conditional rendering or `hidden` attribute, not CSS `display:none` (for MDX content hydration).

---

## Task 5: `FormulaBlock.tsx` — NEW component

**File:** `src/components/wiki/FormulaBlock.tsx`
**Directive:** No `'use client'` needed. Pure presentational.

### Props

```typescript
interface FormulaStep {
  variable: string
  operator: string
  operands: string[]
  comment: string
  divides?: boolean
}

interface FormulaBlockProps {
  label: string
  steps: FormulaStep[]
}
```

### MDX usage

```mdx
<FormulaBlock label="Development Controls Chain" steps={[
  { variable: "AMBF", operator: "=", operands: ["TLA", "PSO%"], comment: "Allowable Maximum Building Footprint" },
  { variable: "TGFA", operator: "=", operands: ["AMBF", "floors"], comment: "Total Gross Floor Area" },
  { variable: "FLAR", operator: "=", operands: ["TGFA", "TLA"], comment: "Floor-to-Lot Area Ratio", divides: true }
]} />
```

### Exact CSS (from prototype)

```
Container (.formula):
  background: #1A1A2E
  border-radius: 10px
  padding: 20px 24px
  margin: 16px 0 24px

Label (.formula-label):
  font-size: 9px
  font-family: 'DM Mono', monospace
  text-transform: uppercase
  letter-spacing: 0.12em
  color: #7BA7F5
  margin-bottom: 12px

Each row (.formula-row):
  display: flex
  align-items: center
  gap: 8px
  margin-bottom: 8px
  flex-wrap: wrap

Variable (.formula-var):
  font-family: 'DM Mono', monospace
  font-size: 14px
  color: #F5C842
  font-weight: 500

Operator (.formula-op):
  font-family: 'DM Mono', monospace
  font-size: 14px
  color: #888888

Comment (.formula-desc):
  font-size: 12px
  color: #888888
  margin-left: 8px
```

### Implementation notes

- Render each step as a row: `VARIABLE = OPERAND1 x OPERAND2  // comment`
- If `divides` is true, use `÷` instead of `x` between operands.
- The operator between operands is always multiplication (`x`) unless `divides` is specified.

---

## Task 6: `InlineQuiz.tsx` — NEW client component

**File:** `src/components/wiki/InlineQuiz.tsx`
**Directive:** `'use client'` — requires useState for selection and reveal.

### Props

```typescript
interface InlineQuizProps {
  question: string
  options: { text: string; is_correct: boolean }[]
  rationale: string
}
```

### MDX usage

```mdx
<InlineQuiz
  question="What percentage of the total ALE weight does Design carry?"
  options={[
    { text: "25%", is_correct: false },
    { text: "30%", is_correct: false },
    { text: "40%", is_correct: true },
    { text: "50%", is_correct: false }
  ]}
  rationale="Design carries 40% of the total ALE weight. Day 1 AM and Day 1 PM each carry 30%."
/>
```

### Exact CSS (from prototype)

```
Container (.quiz):
  margin: 24px 0
  border: 1px solid #1B3FC4 (cobalt)
  border-radius: 10px
  overflow: hidden

Header (.quiz-header):
  background: #1B3FC4 (cobalt)
  padding: 12px 18px
  display: flex
  align-items: center
  gap: 10px

Header icon (.quiz-header-icon):
  width: 20px, height: 20px
  background: rgba(255,255,255,0.2)
  border-radius: 50%
  display: flex, align-items: center, justify-content: center
  font-size: 11px, color: white, font-weight: 700
  Content: "?"

Header text (.quiz-header-text):
  font-size: 12px
  font-family: 'DM Mono', monospace
  font-weight: 500
  color: white
  text-transform: uppercase
  letter-spacing: 0.1em
  Content: "Quick Check"

Body (.quiz-body):
  padding: 20px
  background: #FFFFFF

Question (.quiz-question):
  font-size: 14px
  font-weight: 600
  color: #1A1A1A (ink)
  margin-bottom: 14px
  line-height: 1.5

Options container (.quiz-options):
  display: flex
  flex-direction: column
  gap: 8px

Each option (.quiz-option):
  display: flex
  align-items: flex-start
  gap: 10px
  padding: 10px 14px
  border: 1px solid #E0DED8
  border-radius: 8px
  cursor: pointer
  transition: all 0.15s
  font-size: 13px
  color: #3D3D3A (ink-2)
  hover: border-color: #1B3FC4, background: #EEF3FD

Option letter circle (.quiz-option-letter):
  width: 22px, height: 22px
  border-radius: 50%
  border: 1.5px solid #E0DED8
  display: flex, align-items: center, justify-content: center
  font-size: 11px, font-weight: 600
  flex-shrink: 0
  font-family: 'DM Mono', monospace

CORRECT state (.quiz-option.correct):
  border-color: #1B7A3C (green)
  background: #EDFAF4 (green-light)
  .quiz-option-letter: background: #1B7A3C, color: white, border-color: #1B7A3C

WRONG state (.quiz-option.wrong):
  border-color: #E63329 (red)
  background: #FFF0EF (red-light)
  .quiz-option-letter: background: #E63329, color: white, border-color: #E63329

Rationale (.quiz-rationale):
  margin-top: 14px
  padding: 14px 16px
  background: #EDFAF4 (green-light)
  border-radius: 8px
  font-size: 13px
  color: #3D3D3A (ink-2)
  line-height: 1.6
  HIDDEN by default, shown after answer
  strong: color: #1B7A3C (green)
```

### Behavior

1. User clicks an option.
2. Component locks (no more clicks).
3. The correct option gets green styling. If user picked wrong, their pick gets red styling. All other wrong options stay neutral.
4. Rationale fades in below the options.
5. Option letters are A, B, C, D derived from index.

---

## Task 7: `WikiMistakeList.tsx` / `WikiMistakeCard.tsx` — UPDATE existing components

The existing `WikiMistakeList` and `WikiMistakeCard` must be restyled to match the prototype. The props interface from the MDX template stays the same.

### Exact CSS for the new mistake card design (from prototype)

```
Card container (.mistake-card):
  border: 1px solid #E63329 (red)
  border-radius: 10px
  overflow: hidden
  margin: 12px 0

Card header (.mistake-card-head):
  background: #E63329 (red)
  padding: 10px 16px
  display: flex
  align-items: center
  gap: 10px

  Number (.mistake-card-num):
    font-family: 'DM Mono', monospace
    font-size: 11px
    font-weight: 500
    color: rgba(255,255,255,0.7)

  Title (.mistake-card-title):
    font-size: 13px
    font-weight: 600
    color: white

Card body (.mistake-card-body):
  padding: 14px 16px
  background: #FFFFFF
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 12px

Wrong value column:
  Label: font-size: 9px, font-family: 'DM Mono', font-weight: 500, uppercase, letter-spacing: 0.08em, color: #E63329, margin-bottom: 3px. Text: "STUDENTS WRITE"
  Value: font-size: 16px, font-weight: 700, color: #E63329, text-decoration: line-through

Correct value column:
  Label: same styling but color: #1B7A3C. Text: "CORRECT (2024 IRR)" or similar from sourceRef
  Value: font-size: 16px, font-weight: 700, color: #1B7A3C

Explanation (.mistake-card-explain):
  grid-column: 1 / -1
  font-size: 13px
  color: #737370 (ink-3)
  line-height: 1.5
  padding-top: 4px
  border-top: 1px solid #ECEAE4
```

---

## Task 8: `ElaborativeInterrogation.tsx` — UPDATE existing component

This component already exists and is already registered. It needs to be restyled to match the prototype. It handles two modes: MCQ and open-ended.

### Exact CSS for EI component (from prototype)

```
Container (.ei):
  margin: 28px 0
  border: 1px solid #E0DED8
  border-radius: 12px
  overflow: hidden
  background: #FFFFFF

Header (.ei-header):
  display: flex
  align-items: center
  gap: 10px
  padding: 14px 20px
  background: linear-gradient(135deg, #EEF3FD 0%, #E8EEFF 100%)
  border-bottom: 1px solid #E0DED8

  Icon (.ei-header-icon):
    width: 28px, height: 28px
    border-radius: 8px
    background: #1B3FC4
    display: flex, align-items: center, justify-content: center
    color: white, font-size: 14px
    MCQ mode: 💡
    Open mode: ✍️

  Label (.ei-header-label):
    font-size: 10px
    font-family: 'DM Mono', monospace
    text-transform: uppercase
    letter-spacing: 0.1em
    color: #1B3FC4
    font-weight: 500
    MCQ mode: "Think About It"
    Open mode: "Reflect"

  Subtitle (.ei-header-title):
    font-size: 13px
    color: #3D3D3A
    MCQ: "Test your understanding before moving on"
    Open: "Write your thinking before seeing the explanation"

Body (.ei-body):
  padding: 20px

Question (.ei-question):
  font-size: 15px
  font-weight: 600
  color: #1A1A1A
  margin-bottom: 16px
  line-height: 1.5

=== MCQ OPTIONS ===

Options container (.ei-options):
  display: flex
  flex-direction: column
  gap: 8px

Each option (.ei-option):
  display: flex
  align-items: flex-start
  gap: 12px
  padding: 12px 16px
  border: 1.5px solid #E0DED8
  border-radius: 10px
  cursor: pointer
  transition: all 0.15s
  font-size: 14px
  color: #3D3D3A
  line-height: 1.45
  hover (not disabled): border-color: #3B5BD6, background: #EEF3FD

Option letter (.ei-option-letter):
  width: 24px, height: 24px
  border-radius: 50%
  border: 1.5px solid #E0DED8
  display: flex, align-items: center, justify-content: center
  font-size: 12px, font-weight: 600
  flex-shrink: 0
  font-family: 'DM Mono', monospace

CORRECT: border-color: #1B7A3C, background: #EDFAF4
  letter: background: #1B7A3C, color: white, border-color: #1B7A3C
WRONG: border-color: #E63329, background: #FFF0EF
  letter: background: #E63329, color: white, border-color: #E63329
DISABLED (other wrong options): opacity: 0.5, cursor: default

=== OPEN-ENDED MODE ===

Textarea (.ei-textarea):
  width: 100%
  min-height: 80px
  padding: 12px 14px
  border: 1.5px solid #E0DED8
  border-radius: 10px
  font-family: 'Inter', sans-serif
  font-size: 14px
  color: #1A1A1A
  resize: vertical
  focus: border-color: #1B3FC4
  placeholder color: #A8A8A5

Submit button (.ei-submit):
  padding: 8px 20px
  background: #1B3FC4
  color: white
  border: none
  border-radius: 8px
  font-size: 13px
  font-weight: 600
  cursor: pointer
  hover: background: #3B5BD6
  disabled: background: #A8A8A5, cursor: not-allowed
  After submit: background changes to #1B7A3C, text changes to "Submitted"

Submit row: display: flex, justify-content: flex-end, margin-top: 10px

=== REVEAL TEXT (both modes) ===

Reveal (.ei-reveal):
  margin-top: 16px
  padding: 16px 18px
  background: #F2F0EB (cream)
  border-radius: 10px
  HIDDEN by default, shown after answer/submit

  Label (.ei-reveal-label):
    font-size: 9px
    font-family: 'DM Mono', monospace
    text-transform: uppercase
    letter-spacing: 0.1em
    color: #1B3FC4
    margin-bottom: 6px
    font-weight: 500
    MCQ: "Why This Matters"
    Open: "How an architect of record thinks about this"

  Text (.ei-reveal-text):
    font-size: 14px
    color: #3D3D3A
    line-height: 1.65

=== ALREADY ANSWERED STATE ===

Banner (.ei-answered):
  display: flex (hidden by default, show when existingResponse is present)
  align-items: center
  gap: 8px
  padding: 10px 14px
  background: #EDFAF4
  border-radius: 8px
  font-size: 12px
  color: #1B7A3C
  margin-bottom: 12px

  Icon: "✓" at font-size: 14px
  Text: font-family: 'DM Mono', font-size: 11px
  Content: "You answered this on {date}"
```

### Behavior

**MCQ mode** (when `options` array is non-empty):
1. Show header with 💡 icon, "Think About It" label.
2. Show question text.
3. Show option buttons with A/B/C/D letters.
4. On click: lock all options, mark correct green, mark wrong red, dim others, show reveal.
5. If `existingResponse` is present: show "already answered" banner, pre-apply the answer state, show reveal immediately.

**Open-ended mode** (when `options` array is empty):
1. Show header with ✍️ icon, "Reflect" label.
2. Show question text.
3. Show textarea with placeholder.
4. Show "Show Explanation" button aligned right.
5. On click: lock textarea (readonly, opacity 0.7), change button to "Submitted" (green), show reveal.
6. If `existingResponse` is present: show "already answered" banner, pre-fill textarea with their response, show reveal.

---

## Component Registry Check

After building all components, verify `WikiArticle.tsx` has these in the `baseMdxComponents` object:

```typescript
// Wiki UI spec-v2 components
KeyValues,        // Task 2
Tabs,             // Task 3
Tab,              // Task 3
Accordion,        // Task 4
AccordionItem,    // Task 4
FormulaBlock,     // Task 5
InlineQuiz,       // Task 6
```

These are already imported in the current `WikiArticle.tsx`. Just verify the imports resolve after the files are created.

---

## Implementation Sequence

| Step | Task | File | Risk |
|---|---|---|---|
| 1 | Verify design tokens in globals.css | `globals.css` | Zero |
| 2 | Update WikiArticleHero (blue title + hr divider) | `WikiArticleHero.tsx` | Low |
| 3 | Build KeyValues | `KeyValues.tsx` | Zero |
| 4 | Build Tabs + Tab | `Tabs.tsx` | Medium (MDX children) |
| 5 | Build Accordion + AccordionItem | `Accordion.tsx` | Low |
| 6 | Build FormulaBlock | `FormulaBlock.tsx` | Zero |
| 7 | Build InlineQuiz | `InlineQuiz.tsx` | Low |
| 8 | Restyle WikiMistakeList/WikiMistakeCard | `WikiMistakeList.tsx`, `WikiMistakeCard.tsx` | Medium |
| 9 | Restyle ElaborativeInterrogation | `ElaborativeInterrogation.tsx` | Medium |
| 10 | Test with live article `ale-dsgn-014-01` | Browser | Must match prototype |

---

## Verification

After implementation, open `/dashboard/wiki/ale-dsgn-014-01` and verify:

1. Blue title with horizontal divider below the hero
2. KeyValues strip shows 4 stat cards (40%, 150, 10h, Day 2) in cobalt blue
3. Tabs switch between "Codes & Laws", "Technical Subjects", "How They Integrate" with tables inside
4. Accordion items expand/collapse independently with chevron rotation
5. FormulaBlock shows dark background with yellow variables and gray operators
6. EI MCQ prompt shows options, click reveals correct/wrong + explanation
7. EI open-ended prompt shows textarea, submit reveals explanation
8. Mistake cards show red header with wrong (strikethrough) vs correct (green) side by side
9. InlineQuiz shows cobalt header with "Quick Check", MCQ options, rationale reveal
10. All spacing, colors, fonts, border-radius values match the HTML prototype exactly

---

*Reference: `slatecamp-wiki-article-prototype.html`*
*DB article already contains all MDX content: `ale-dsgn-014-01`*
*WikiArticle.tsx already has all imports registered*
