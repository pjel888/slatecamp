# SlateCamp — Wiki Article Components Implementation
## Match the HTML Prototype Exactly. 5 New Components + Layout + MDX Wiring.

---

## SOURCE FILES

- **`slatecamp-wiki-article-prototype.html`** — The visual target. 793 lines of exact CSS + HTML + JS showing every component, every color, every spacing value. THIS IS THE SPEC.
- **`wiki-article-mdx-template.md`** — The MDX content structure showing how components are used in articles, plus the component registry.

**Open the HTML prototype in a browser tab to reference throughout this build.** Every pixel, every spacing value, every color comes from that file.

---

## WHAT EXISTS vs WHAT'S NEW

| Component | Status | Notes |
|---|---|---|
| `WikiCalloutBox` | ✅ EXISTING | Verify it matches prototype (3 variants: most-tested, ale-watch, version-alert) |
| `WikiChangedPill` | ✅ EXISTING | The `⟳ 2024 UPDATED` inline pill |
| `WikiMistakeList` / `WikiMistakeCard` | ✅ EXISTING | Verify matches prototype mistake-card design |
| `ElaborativeInterrogation` | ✅ EXISTING | Needs update — prototype shows MCQ mode + open-ended mode + "already answered" state |
| **`KeyValues`** | 🆕 NEW | Stat cards strip (4 values in a grid row) |
| **`Tabs` / `Tab`** | 🆕 NEW | Tabbed content panels with DM Mono tab bar |
| **`Accordion` / `AccordionItem`** | 🆕 NEW | Collapsible sections with chevron animation |
| **`FormulaBlock`** | 🆕 NEW | Dark code-style formula display (like a code block but for math) |
| **`InlineQuiz`** | 🆕 NEW | Self-contained MCQ with A/B/C/D letters, correct/wrong states, rationale reveal |

Additionally, the **Wiki Article page layout** needs to match the prototype:
- 3-column grid (content center, TOC sidebar right)
- Hero section (tags, title, updated date, ALE banner)
- Hero divider between hero and content
- Article typography (h2, h3, p, table styling)
- Right sidebar (Practice CTA, Related, Sources popover, On This Page)

---

## EXACT COMPONENT APIS (From the MDX Template — This Is How Authors Use Them)

These are the exact prop signatures. Your React components MUST accept these exact props:

```mdx
<!-- KeyValues: array of { value, label } objects -->
<KeyValues items={[
  { value: "40%", label: "Total Weight" },
  { value: "150", label: "MCQ Questions" },
  { value: "10h", label: "Exam Duration" },
  { value: "Day 2", label: "Full Exam Day" }
]} />

<!-- Tabs + Tab: defaultTab string, each Tab has label + value -->
<Tabs defaultTab="codes">
  <Tab label="Codes & Laws" value="codes">
    <!-- MDX content including tables goes here -->
  </Tab>
  <Tab label="Technical Subjects" value="technical">
    <!-- More content -->
  </Tab>
</Tabs>

<!-- Accordion + AccordionItem: title string, children are content -->
<Accordion>
  <AccordionItem title="Memorize the formulas (AMBF, PSO, TGFA, FLAR)">
    You do not have time to derive them during the exam.
  </AccordionItem>
  <AccordionItem title="Tab your copy before exam day">
    Color-coded tabs by section save 30-60 seconds per lookup.
  </AccordionItem>
</Accordion>

<!-- FormulaBlock: label string, steps array with variable/operator/operands/comment/divides -->
<FormulaBlock label="Development Controls Chain" steps={[
  { variable: "AMBF", operator: "=", operands: ["TLA", "PSO%"], comment: "Allowable Maximum Building Footprint" },
  { variable: "TGFA", operator: "=", operands: ["AMBF", "floors"], comment: "Total Gross Floor Area" },
  { variable: "FLAR", operator: "=", operands: ["TGFA", "TLA"], comment: "Floor-to-Lot Area Ratio", divides: true }
]} />

<!-- InlineQuiz: question, options array, rationale string -->
<InlineQuiz
  question="What percentage of the total ALE weight does Design carry?"
  options={[
    { text: "25%", is_correct: false },
    { text: "30%", is_correct: false },
    { text: "40%", is_correct: true },
    { text: "50%", is_correct: false }
  ]}
  rationale="Design carries 40% of the total ALE weight."
/>

<!-- EXISTING — ElaborativeInterrogation has TWO modes -->
<!-- MCQ mode -->
<ElaborativeInterrogation
  promptId="ei-weight-math"
  type="mcq"
  question="A student scores 60% in Design. What average do they need elsewhere?"
  options={[
    { text: "70%", is_correct: false },
    { text: "77%", is_correct: true },
    { text: "85%", is_correct: false },
    { text: "63%", is_correct: false }
  ]}
  revealText="Because Design carries 40%, underperformance creates a massive deficit..."
/>

<!-- Open-ended mode -->
<ElaborativeInterrogation
  promptId="ei-architect-constraints"
  type="open"
  question="What are the first three constraints you check?"
  placeholder="Write your answer here."
  revealText="The three governing constraints are: (1) PSO%, (2) setback requirements, (3) FLAR range..."
/>

<!-- EXISTING — WikiCalloutBox has 3 types -->
<WikiCalloutBox type="most-tested">Content here</WikiCalloutBox>
<WikiCalloutBox type="ale-watch">Content here</WikiCalloutBox>
<WikiCalloutBox type="version-alert">Content here</WikiCalloutBox>

<!-- EXISTING — WikiMistakeList -->
<WikiMistakeList mistakes={[
  {
    number: 1,
    title: "Using the old corridor width",
    wrongValue: "1,200 mm",
    correctValue: "1,500 mm",
    explanation: "The 2024 IRR raised this.",
    sourceRef: "2024"
  }
]} />
```

---

## STRUCTURAL RULES (Enforced by the Page, Not by MDX Content)

These are NOT in the MDX content. They are handled by `page.tsx` and the `WikiArticleHero` component:

1. **Hero section** (title, tags, updated date, ALE banner) — rendered from Supabase `wiki_articles` columns, NOT from MDX
2. **Horizontal divider** after hero, before article content — rendered by `page.tsx`
3. **Sources** — popover in the right sidebar, NOT in article body
4. **`---` before every `## H2`** — content author adds this in the MDX, renders as `<hr>` section dividers

### DB Columns That Feed the Hero

| Column | Renders As |
|---|---|
| `title` | Blue article title (Inter 700, 30px, cobalt) |
| `subject_label` (proposed) | Tag pill: "ALE-DSGN-014 · ARCHITECTURAL DESIGN" |
| `difficulty_label` (proposed) | Tag pill: "FOUNDATIONAL" |
| `updated_at` | Gray text: "Updated March 21, 2026" |
| `ale_tests_you` (proposed) | Blue banner: "THE ALE TESTS YOU TO: ..." |
| `sources` (proposed JSONB) | Sidebar popover items |

**If these columns don't exist yet on `wiki_articles`, flag them in the output but do NOT run schema migrations.** The frontend can use placeholder values until the columns are added.

---

## FULL COMPONENT REGISTRY (Target State)

```typescript
const wikiComponents = {
  // EXISTING — verify they exist and match prototype styling
  WikiCalloutBox,
  WikiChangedPill,
  WikiPartHeader,
  WikiMistakeList,
  WikiMistakeCard,
  Note, Warn, Tip, Example, Callout,
  ElaborativeInterrogation,

  // NEW — build in this prompt
  KeyValues,          // stat cards strip
  Tabs,               // container with tab bar
  Tab,                // individual tab panel
  Accordion,          // collapsible container
  AccordionItem,      // individual collapsible item
  FormulaBlock,       // dark code-style formula display
  InlineQuiz,         // self-contained MCQ with rationale reveal
}
```

---

## TOOLS

- **File System** — Read ALL existing wiki components and the wiki page before building.
- **grep** — Find existing components, MDX processing, and Supabase queries.
- **Browser (Chrome MCP)** — Reference the HTML prototype for exact visual specifications.

---

## PHASE 1: Codebase Audit

```bash
# 1. Find existing wiki components
find src/ -path "*wiki*" -name "*.tsx" | sort
grep -rn "WikiCalloutBox\|WikiChangedPill\|WikiMistakeList\|WikiMistakeCard\|ElaborativeInterrogation" src/ --include="*.tsx" -l | sort

# 2. Find the wiki article page and layout
find src/app -path "*wiki*" -name "page.tsx" -o -name "layout.tsx" | sort

# 3. Find how MDX content renders
grep -rn "MDXRemote\|compileMDX\|serialize\|mdx\|dangerouslySetInnerHTML\|content" src/app/*wiki* --include="*.tsx" | head -15

# 4. Find the MDX components map (where components are registered)
grep -rn "components.*=" src/ --include="*.tsx" | grep -i "wiki\|mdx\|callout\|quiz" | head -15

# 5. Find existing component directory structure  
find src/components -type d | sort
ls -la src/components/wiki/ 2>/dev/null || ls -la src/components/Wiki/ 2>/dev/null

# 6. Read each existing wiki component
for f in $(find src/components -path "*wiki*" -name "*.tsx" 2>/dev/null); do
  echo "=== $f ==="
  head -5 "$f"
  echo "---"
done

# 7. Find global CSS / design tokens
find src/ -name "globals.css" -o -name "design-tokens*" | head -3
grep -n "cobalt\|--ink\|--cream\|--border" src/app/globals.css 2>/dev/null | head -20

# 8. Check if Tailwind config has SlateCamp tokens
grep -n "cobalt\|signalRed\|signalGreen\|cream\|warmWhite" tailwind.config.* 2>/dev/null | head -15

# 9. Read the wiki article page component fully
cat src/app/dashboard/wiki/*/page.tsx 2>/dev/null || find src/app -path "*wiki*article*" -name "page.tsx" -exec cat {} \;
```

**Output:** Complete map of existing components, their styling, the MDX rendering pipeline, and the page layout.

**STOP.** "Phase 1 Complete. [X] existing components found. Wiki renders via [MDXRemote/compileMDX/dangerouslySetInnerHTML]. Reply 'Proceed.'"

---

## PHASE 2: Build the 5 New Components

All components go in `src/components/wiki/` (create directory if it doesn't exist). All are **client components** (`'use client'`) because they have interactive state (tabs, accordion toggle, quiz selection).

### CRITICAL: Match the HTML Prototype Exactly

Every CSS value below is extracted from the prototype HTML. Do NOT approximate. The prototype file is the source of truth for colors, font sizes, padding, border-radius, and spacing.

---

### Component 1: `KeyValues`

**Prototype reference:** Lines 136–139 (CSS), Lines 328–345 (HTML)

```
Grid of stat cards. 4 columns on desktop, 2 on mobile. White bg, 1px border, rounded 10px.
Number: Inter 700 28px cobalt. Label: DM Mono 11px uppercase tracked ink-3.
```

Create: `src/components/wiki/KeyValues.tsx`

```typescript
'use client'

interface KeyValueItem {
  value: string
  label: string
}

export function KeyValues({ items }: { items: KeyValueItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
      {items.map((item, i) => (
        <div key={i} className="bg-white border border-[#E0DED8] rounded-[10px] p-4 text-center">
          <div className="font-inter text-[28px] font-bold text-[#1B3FC4] leading-none mb-1">
            {item.value}
          </div>
          <div className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.06em] text-[#737370]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

### Component 2: `Tabs` + `Tab`

**Prototype reference:** Lines 82–89 (CSS), Lines 418–448 (HTML), Lines 712–720 (JS)

```
Container: 1px border, rounded 10px, white bg, overflow hidden.
Tab bar: cream bg, border-bottom, flex row.
Tab button: DM Mono 12px 500wt, 10px 20px padding, 2px bottom border (transparent default, cobalt active).
Active tab: cobalt text, cobalt bottom border, white bg.
Panel: 18px 20px padding. Hidden until active.
```

Create: `src/components/wiki/Tabs.tsx`

```typescript
'use client'
import { useState, Children, isValidElement, type ReactNode } from 'react'

interface TabProps {
  label: string
  value: string
  children: ReactNode
}

export function Tab({ children }: TabProps) {
  return <>{children}</>
}

interface TabsProps {
  defaultTab: string
  children: ReactNode
}

export function Tabs({ defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Extract Tab children
  const tabs: { label: string; value: string; content: ReactNode }[] = []
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.props.value) {
      tabs.push({
        label: child.props.label,
        value: child.props.value,
        content: child.props.children,
      })
    }
  })

  return (
    <div className="my-5 border border-[#E0DED8] rounded-[10px] overflow-hidden bg-white">
      {/* Tab Bar */}
      <div className="flex border-b border-[#E0DED8] bg-[#F2F0EB]">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`
              font-[family-name:var(--font-dm-mono)] text-[12px] font-medium
              py-[10px] px-5 border-b-2 -mb-px transition-all duration-150
              ${activeTab === tab.value
                ? 'text-[#1B3FC4] border-[#1B3FC4] bg-white'
                : 'text-[#737370] border-transparent hover:text-[#1A1A1A]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Panel */}
      {tabs.map((tab) => (
        <div
          key={tab.value}
          className={`p-[18px_20px] ${activeTab === tab.value ? 'block' : 'hidden'}`}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
```

---

### Component 3: `Accordion` + `AccordionItem`

**Prototype reference:** Lines 92–101 (CSS), Lines 482–519 (HTML), Lines 722–728 (JS)

```
Container: 1px border, rounded 10px, overflow hidden.
Item: border-bottom (last child none).
Trigger: full width flex between, 14px 18px padding, white bg, hover cream.
  Text: 14px 600wt ink. Chevron: 12px ink-4, rotates 180° on open.
Content: hidden default, 0 18px 16px padding when open. Text: 13px ink-2.
```

Create: `src/components/wiki/Accordion.tsx`

```typescript
'use client'
import { useState, Children, isValidElement, type ReactNode } from 'react'

interface AccordionItemProps {
  title: string
  children: ReactNode
}

export function AccordionItem({ title, children }: AccordionItemProps) {
  // Rendered by parent Accordion — this component is a data carrier
  return <>{children}</>
}

export function Accordion({ children }: { children: ReactNode }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const items: { title: string; content: ReactNode }[] = []
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.props.title) {
      items.push({ title: child.props.title, content: child.props.children })
    }
  })

  return (
    <div className="my-4 border border-[#E0DED8] rounded-[10px] overflow-hidden">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i} className={i < items.length - 1 ? 'border-b border-[#ECEAE4]' : ''}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex justify-between items-center py-[14px] px-[18px] bg-white hover:bg-[#F2F0EB] transition-colors duration-150 text-left"
            >
              <span className="text-[14px] font-semibold text-[#1A1A1A]">{item.title}</span>
              <span className={`text-[12px] text-[#A8A8A5] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`px-[18px] pb-4 ${isOpen ? 'block' : 'hidden'}`}>
              <div className="text-[13px] text-[#3D3D3A] leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

---

### Component 4: `FormulaBlock`

**Prototype reference:** Lines 127–133 (CSS), Lines 530–556 (HTML)

```
Container: bg #1A1A2E, rounded 10px, 20px 24px padding.
Label: DM Mono 9px uppercase tracked, color #7BA7F5.
Row: flex, gap 8px, wrap.
Variable: DM Mono 14px 500wt, color #F5C842 (gold).
Operator: DM Mono 14px, color #888.
Comment: 12px, color #888.
Result: DM Mono 14px 500wt, color #6EC99A (green).
```

Create: `src/components/wiki/FormulaBlock.tsx`

```typescript
interface FormulaStep {
  variable: string
  operator: string
  operands: string[]
  comment?: string
  divides?: boolean
}

export function FormulaBlock({ label, steps }: { label: string; steps: FormulaStep[] }) {
  return (
    <div className="bg-[#1A1A2E] rounded-[10px] py-5 px-6 my-4">
      <div className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-[#7BA7F5] mb-3">
        {label}
      </div>
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="font-[family-name:var(--font-dm-mono)] text-[14px] font-medium text-[#F5C842]">
            {step.variable}
          </span>
          <span className="font-[family-name:var(--font-dm-mono)] text-[14px] text-[#888]">
            {step.operator}
          </span>
          {step.operands.map((op, j) => (
            <span key={j}>
              <span className="font-[family-name:var(--font-dm-mono)] text-[14px] font-medium text-[#F5C842]">
                {op}
              </span>
              {j < step.operands.length - 1 && (
                <span className="font-[family-name:var(--font-dm-mono)] text-[14px] text-[#888] mx-1">
                  {step.divides ? '÷' : '×'}
                </span>
              )}
            </span>
          ))}
          {step.comment && (
            <span className="text-[12px] text-[#888] ml-2">
              {'// '}{step.comment}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

### Component 5: `InlineQuiz`

**Prototype reference:** Lines 104–121 (CSS), Lines 628–680 (HTML), Lines 776–788 (JS)

```
Container: 1px cobalt border, rounded 10px, overflow hidden.
Header: cobalt bg, 12px 18px padding. Icon: 20px circle rgba white 20%. Text: DM Mono 12px white uppercase.
Body: 20px padding, white bg.
Question: 14px 600wt ink, mb 14px.
Options: flex column gap 8px. Each: flex, 10px 14px padding, 1px border, rounded 8px.
  Letter: 22px circle, 1.5px border, DM Mono 11px 600wt center.
  Hover: cobalt border + cobalt-light bg.
  Selected: cobalt border + cobalt-light bg.
  Correct: green border + green-light bg. Letter: green bg white text.
  Wrong: red border + red-light bg. Letter: red bg white text.
Rationale: mt 14px, 14px 16px padding, green-light bg, rounded 8px. 13px ink-2.
```

Create: `src/components/wiki/InlineQuiz.tsx`

```typescript
'use client'
import { useState } from 'react'

interface QuizOption {
  text: string
  is_correct: boolean
}

interface InlineQuizProps {
  question: string
  options: QuizOption[]
  rationale: string
}

export function InlineQuiz({ question, options, rationale }: InlineQuizProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)

  const letters = ['A', 'B', 'C', 'D', 'E', 'F']

  const handleSelect = (index: number) => {
    if (answered) return
    setSelectedIndex(index)
    setAnswered(true)
  }

  const getOptionClasses = (opt: QuizOption, index: number) => {
    const base = 'flex items-start gap-[10px] py-[10px] px-[14px] border rounded-lg transition-all duration-150 text-[13px] text-[#3D3D3A] cursor-pointer'

    if (!answered) {
      return `${base} border-[#E0DED8] hover:border-[#1B3FC4] hover:bg-[#EEF3FD]`
    }

    if (opt.is_correct) return `${base} border-[#1B7A3C] bg-[#EDFAF4]`
    if (index === selectedIndex && !opt.is_correct) return `${base} border-[#E63329] bg-[#FFF0EF]`
    return `${base} border-[#E0DED8] opacity-50`
  }

  const getLetterClasses = (opt: QuizOption, index: number) => {
    const base = 'w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center text-[11px] font-semibold shrink-0 mt-px font-[family-name:var(--font-dm-mono)]'

    if (!answered) return `${base} border-[#E0DED8] text-[#3D3D3A]`
    if (opt.is_correct) return `${base} bg-[#1B7A3C] text-white border-[#1B7A3C]`
    if (index === selectedIndex && !opt.is_correct) return `${base} bg-[#E63329] text-white border-[#E63329]`
    return `${base} border-[#E0DED8] text-[#A8A8A5]`
  }

  return (
    <div className="my-6 border border-[#1B3FC4] rounded-[10px] overflow-hidden">
      {/* Header */}
      <div className="bg-[#1B3FC4] py-3 px-[18px] flex items-center gap-[10px]">
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] text-white font-bold">
          ?
        </div>
        <div className="font-[family-name:var(--font-dm-mono)] text-[12px] font-medium text-white uppercase tracking-[0.1em]">
          Quick Check
        </div>
      </div>

      {/* Body */}
      <div className="p-5 bg-white">
        <div className="text-[14px] font-semibold text-[#1A1A1A] mb-[14px] leading-[1.5]">
          {question}
        </div>

        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={getOptionClasses(opt, i)}
              disabled={answered}
            >
              <span className={getLetterClasses(opt, i)}>
                {letters[i]}
              </span>
              <span>{opt.text}</span>
            </button>
          ))}
        </div>

        {/* Rationale */}
        {answered && (
          <div className="mt-[14px] py-[14px] px-4 bg-[#EDFAF4] rounded-lg text-[13px] text-[#3D3D3A] leading-relaxed">
            <strong className="text-[#1B7A3C]">
              Correct: {letters[options.findIndex(o => o.is_correct)]}.
            </strong>{' '}
            {rationale}
          </div>
        )}
      </div>
    </div>
  )
}
```

**STOP.** "Phase 2 Complete. 5 new components built. Reply 'Proceed' for layout and wiring."

---

## PHASE 3: Article Page Layout + Hero

### 3a. Read the existing wiki page

```bash
# Find the exact page file
find src/app -path "*wiki*" -name "page.tsx" | sort
# Read it
cat [found_path]
```

### 3b. Update the page layout to match prototype

The prototype uses a 3-column CSS grid: `grid-template-columns: 1fr min(720px, 100%) 280px`

**Key layout elements from the prototype:**

```
┌──────────────────────────────────────────────────────────────┐
│ Breadcrumb: 13px ink-3, links, "›" separator                │
├──────────────────────────────────────────────────────────────┤
│ Hero Section:                                                │
│   Tags: [ALE-DSGN-014 · ARCH DESIGN] [FOUNDATIONAL] [~8min]│
│   Title: Inter 700, 30px, cobalt, tracking -0.02em          │
│   Updated: 12px ink-4                                        │
│   ALE Banner: cobalt-light bg, 3px cobalt left border       │
├──────────────────────────────────────────────────────────────┤
│ ─── hero-divider (1px solid border) ───                      │
├────────────────────────────────┬─────────────────────────────┤
│ Article Content (720px max)    │ Right Sidebar (280px)       │
│                                │   [Practice CTA button]     │
│   - h2: Inter 700, 22px, ink  │   Related articles          │
│   - h3: 16px 600wt            │   Feedback (👍👎🔗)         │
│   - p: 15px ink-2, max 65ch   │   Sources (popover)         │
│   - tables: wiki-table style  │   On This Page (TOC)        │
│   - MDX components inline     │                             │
│                                │                             │
└────────────────────────────────┴─────────────────────────────┘
```

**Article typography CSS (from prototype lines 51–58):**
- `h2`: Inter 700, 22px, ink, tracking -0.01em, mb 16px
- `h3`: 16px, 600wt, ink, mt 28px mb 12px
- `p`: ink-2 (#3D3D3A), mb 16px, max-width 65ch
- `strong`: ink, 600wt
- `table`: wiki-table styling (DM Mono uppercase headers on cream bg)

**Section dividers:** `<hr>` between each `## H2` — 1px solid border-light, mt 40px mb 36px

### 3c. Build the WikiArticleHero component

This is the hero section above the content. Fed from DB columns, NOT from MDX.

```typescript
// src/components/wiki/WikiArticleHero.tsx

interface WikiArticleHeroProps {
  title: string
  subjectLabel: string     // "ALE-DSGN-014 · ARCHITECTURAL DESIGN AND SITE PLANNING"
  difficultyLabel: string  // "FOUNDATIONAL"
  readTime?: string        // "~8 min read"
  updatedDate: string      // "Updated March 21, 2026"
  aleTestsYou: string      // "Identify key concepts and apply them..."
}
```

Match prototype hero section exactly (lines 33–48 CSS, lines 237–249 HTML).

### 3d. Build the WikiSidebar component

Right sidebar with: Practice CTA, Related articles, Feedback, Sources popover, Table of Contents.

Match prototype sidebar exactly (lines 155–162 CSS, lines 255–318 HTML).

**STOP.** "Phase 3 Complete. Layout and hero built. Reply 'Proceed' for MDX wiring."

---

## PHASE 4: MDX Component Registration

### 4a. Find the MDX components map

```bash
grep -rn "components\s*=\|wikiComponents\|mdxComponents" src/ --include="*.tsx" | head -10
```

### 4b. Register all components

In the file that provides components to MDXRemote (or wherever the component map lives):

```typescript
import { KeyValues } from '@/components/wiki/KeyValues'
import { Tabs, Tab } from '@/components/wiki/Tabs'
import { Accordion, AccordionItem } from '@/components/wiki/Accordion'
import { FormulaBlock } from '@/components/wiki/FormulaBlock'
import { InlineQuiz } from '@/components/wiki/InlineQuiz'
// Import existing components too:
import { WikiCalloutBox } from '@/components/wiki/WikiCalloutBox'
import { WikiMistakeList } from '@/components/wiki/WikiMistakeList'
import { ElaborativeInterrogation } from '@/components/wiki/ElaborativeInterrogation'

const wikiComponents = {
  // EXISTING
  WikiCalloutBox,
  WikiChangedPill,
  WikiMistakeList,
  WikiMistakeCard,
  ElaborativeInterrogation,
  // NEW
  KeyValues,
  Tabs,
  Tab,
  Accordion,
  AccordionItem,
  FormulaBlock,
  InlineQuiz,
}
```

Pass this to MDXRemote:
```typescript
<MDXRemote source={content} components={wikiComponents} />
```

### 4c. Add article content CSS

The prototype's article typography must be applied globally to the wiki content area. Add to `globals.css` or a wiki-specific stylesheet:

```css
/* Wiki Article Typography — from prototype */
.wiki-article h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1A1A1A;
  margin: 0 0 16px;
  letter-spacing: -0.01em;
}

.wiki-article h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  margin: 28px 0 12px;
}

.wiki-article p {
  color: #3D3D3A;
  margin-bottom: 16px;
  max-width: 65ch;
  line-height: 1.7;
}

.wiki-article strong { color: #1A1A1A; font-weight: 600; }
.wiki-article em { font-style: italic; color: #3D3D3A; }

.wiki-article hr {
  border: none;
  border-top: 1px solid #ECEAE4;
  margin: 40px 0 36px;
}

/* Wiki Table */
.wiki-article table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0 24px;
  font-size: 14px;
}

.wiki-article th {
  font-size: 10px;
  font-family: var(--font-dm-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #A8A8A5;
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1.5px solid #E0DED8;
  background: #F2F0EB;
}

.wiki-article td {
  padding: 11px 14px;
  border-bottom: 1px solid #ECEAE4;
  color: #3D3D3A;
  vertical-align: top;
  line-height: 1.5;
}

.wiki-article tr:last-child td { border-bottom: none; }
.wiki-article td strong { color: #1A1A1A; }
```

**STOP.** "Phase 4 Complete. Components registered. Reply 'Proceed' for verification."

---

## PHASE 5: Verification

### Component existence:
```bash
ls -la src/components/wiki/
# Should show: KeyValues.tsx, Tabs.tsx, Accordion.tsx, FormulaBlock.tsx, InlineQuiz.tsx
# Plus existing: WikiCalloutBox.tsx, WikiMistakeList.tsx, ElaborativeInterrogation.tsx, etc.
```

### TypeScript:
```bash
npx tsc --noEmit
# Zero errors
```

### Visual verification against prototype:

Load a wiki article that uses the MDX template content. Compare each component against the HTML prototype:

| Component | Prototype Ref | Check |
|---|---|---|
| KeyValues | 4 stat cards in a row, cobalt numbers, DM Mono labels | |
| Tabs | 3 tabs, DM Mono bar, cream bg, cobalt active state | |
| Accordion | 4 collapsible items, chevron rotates, one open at a time | |
| FormulaBlock | Dark bg, gold variables, gray operators, green results | |
| InlineQuiz | Cobalt header, ABCD letters, green/red states, rationale reveal | |
| WikiCalloutBox (most-tested) | Cobalt-light bg, 3px left border, DM Mono label | |
| WikiCalloutBox (ale-watch) | Red-light bg, 3px red left border | |
| ElaborativeInterrogation (MCQ) | Gradient header, option letters, correct/wrong states, reveal | |
| ElaborativeInterrogation (open) | Textarea, submit button, reveal on submit | |
| Hero section | Tags + title + date + ALE banner | |
| Hero divider | 1px solid line between hero and content | |
| Sidebar | Practice CTA, Related, Sources popover, TOC | |
| Tables | DM Mono headers, cream bg, proper spacing | |
| Section dividers | 1px solid between each h2 section | |

**STOP.** "Phase 5 Complete. All components match the prototype."

---

## WHAT NOT TO DO

- **Don't use Syne for article body text.** The prototype uses Inter for everything in the article content. Syne is for the landing page and dashboard headings only.
- **Don't add shadows to wiki components.** The prototype uses borders only — no box-shadows anywhere.
- **Don't use rounded-lg or rounded-xl generically.** The prototype specifies `rounded-[10px]` on most containers and `rounded-lg` (8px) on options/buttons. Be exact.
- **Don't make InlineQuiz write to the database.** It's a self-contained article widget — no Server Action, no analytics event. It's for self-check only, not graded.
- **Don't put Sources in the article body.** Sources are in the right sidebar as a popover. Not inline.
- **Don't skip the hero divider.** The 1px line between hero and content is a specific design fix Philip requested.
- **Don't approximate colors.** `#1A1A1A` is ink, `#3D3D3A` is ink-2, `#737370` is ink-3, `#A8A8A5` is ink-4. These are NOT interchangeable. Check the prototype's `:root` variables.

---

*Execute Phase 1 now. Audit the existing wiki codebase.*
