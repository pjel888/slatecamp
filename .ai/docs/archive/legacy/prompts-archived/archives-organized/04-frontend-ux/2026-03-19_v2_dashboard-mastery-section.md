# SlateCamp Dashboard — Subject Mastery Section Replacement
## Replace Resume Card + Focus Areas with Radar Chart + Progress Bars

---

## ROLE

You are simultaneously a Senior Next.js/React Engineer, an educational data visualization specialist, and a UX designer who understands that a Licensure Exam student's #1 need is INSTANT VISIBILITY into where they're strong and where they're weak. You build data visualizations that are honest, scannable in under 3 seconds, and beautiful.

---

## TASK

Replace two cards in the dashboard's middle row with a subject mastery visualization section:

1. **Replace "Continue where you left off" card** (column 2 of the 4-col grid) → **Radar/Spider Chart** showing mastery across all ALE subjects as a shape
2. **Replace "Your next focus areas" card** (column 3 of the 4-col grid) → **Subject Mastery Progress Bars** showing exact percentage per subject with color-coded status

**Keep "Recent Activity" (column 4) exactly as-is.** Don't touch it.

**Relocate the "Resume Session" functionality** — the "Continue where you left off" card has important functionality (resuming an in-progress quiz). Do NOT delete this. Move it to a compact banner ABOVE the mastery section or integrate it into the hero area as a small persistent prompt. The student must still be able to resume their session with one click.

---

## CONTEXT

### Current Dashboard Grid Structure

The middle row lives inside a grid with class `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`:

```
Column 1: Today's Article + Your Notes + 3D Lab (gold sidebar, stacked)
Column 2: "Continue where you left off" ← REPLACE WITH RADAR CHART
Column 3: "Your next focus areas"       ← REPLACE WITH PROGRESS BARS
Column 4: "Recent Activity"             ← KEEP AS-IS
```

### Tech Stack
- Next.js (App Router), TypeScript, Tailwind CSS
- Supabase (PostgreSQL) for all data
- No chart library currently installed

### Design System Tokens (MUST follow)
```
Cobalt Blue:     #1B3FC4   (primary, active states, chart primary fill)
Signal Green:    #1B7A3C   (mastered: ≥70%)
Camp Orange:     #E8853A   (developing: 40-69%)
Signal Red:      #E63329   (at-risk: <40%)
Cream:           #F2F0EB   (card alt bg, chart grid lines)
Ink:             #1A2332   (text primary)
Ink Mid:         #555555   (text secondary)
Ink Light:       #6B6B6B   (labels)
Border:          #E8E4DC   (card borders, chart grid)

Fonts:
  Headings:      Syne 800 (via font-[family-name:var(--font-syne)])
  Body/UI:       Inter 400-600 (default)
  Labels:        DM Mono 500 uppercase tracked (via font-[family-name:var(--font-dm-mono)])
  Numbers:       Inter tabular-nums (NEVER Syne for data numbers)
```

---

## TOOLS YOU MUST USE

### Step 0: Pre-Flight Checks (BEFORE writing any code)

1. **File System** — Read these files:
   ```
   package.json                              → Check if recharts is installed
   src/app/dashboard/page.tsx                 → Find the grid and the two cards to replace
   src/app/dashboard/layout.tsx               → Understand the shell structure
   ```
   Also search for:
   ```bash
   grep -rn "Continue where you left off" src/ --include="*.tsx"
   grep -rn "next focus areas" src/ --include="*.tsx"
   grep -rn "subject" src/app/dashboard/ --include="*.tsx" -l
   ```

2. **Supabase MCP** — Run these queries to understand the data:
   ```sql
   -- What subjects exist?
   SELECT DISTINCT subject FROM questions ORDER BY subject;
   
   -- How is mastery tracked? Check for a mastery/progress table
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name ILIKE '%mastery%' OR table_name ILIKE '%progress%' OR table_name ILIKE '%topic%';
   
   -- Check quiz_sessions or responses for per-subject data
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'quiz_responses' OR table_name = 'quiz_sessions'
   ORDER BY table_name, ordinal_position;
   
   -- Sample: per-subject accuracy for the current user
   -- (adjust table/column names based on what you find above)
   SELECT 
     q.subject,
     COUNT(*) as total_answers,
     SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END) as correct,
     ROUND(AVG(CASE WHEN qr.is_correct THEN 1.0 ELSE 0.0 END) * 100) as mastery_pct
   FROM quiz_responses qr
   JOIN questions q ON q.id = qr.question_id
   GROUP BY q.subject
   ORDER BY mastery_pct DESC;
   ```

3. **If recharts is NOT in package.json** — Install it:
   ```bash
   npm install recharts
   ```
   Recharts is lightweight (~45KB gzipped), tree-shakeable, and the standard for React data viz. It has a built-in `RadarChart` component that does exactly what we need.

---

## WHAT TO BUILD

### Component 1: `SubjectRadarChart`

A radar/spider chart showing mastery percentage across all ALE subjects. Each axis is one subject. The filled area shows the student's current mastery "shape."

**Why this matters (educational psychology):** A radar chart gives INSTANT pattern recognition — the student sees their mastery SHAPE in under 1 second. A lopsided shape screams "you have weak areas" far more viscerally than a list of numbers. This is called "preattentive processing" — the brain detects asymmetry before conscious analysis begins.

**Spec:**

```tsx
interface SubjectMastery {
  subject: string          // "Building Technology", "Structural Design", etc.
  shortLabel: string       // "Bldg Tech", "Structural", etc. (for chart axis)
  mastery: number          // 0-100 percentage
  questionsAnswered: number
}
```

**Visual requirements:**
- Chart fills its container (responsive)
- Grid lines: `#E8E4DC` (Border color), 4 concentric rings at 25%, 50%, 75%, 100%
- Axis lines: `#E8E4DC`
- Axis labels: Inter 11px, `#555555`, positioned outside the chart
- Data area fill: `#1B3FC4` at 15% opacity (Cobalt Blue translucent)
- Data area stroke: `#1B3FC4` at 100%, 2px width
- Data points: `#1B3FC4` solid circles, 4px radius
- The 70% ring should be subtly emphasized (dashed or slightly darker) — this is the "passing" threshold
- Animate on mount: the data shape should grow from center outward (300ms, ease-out)

**Empty state (no quiz data):**
```
Show the radar grid with all axes labeled but NO data shape.
Center text: "Take your first quiz to see your mastery shape"
Link: "Start a quiz →" pointing to /dashboard/testing
```

**Recharts implementation hint:**
```tsx
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
```

### Component 2: `SubjectMasteryBars`

Progress bars for each ALE subject showing exact mastery percentage with color-coded status.

**Why this matters:** The radar chart shows the SHAPE (fast pattern recognition). The bars show the NUMBERS (precise diagnosis). Together, they give both System 1 (intuitive) and System 2 (analytical) processing of the same data. This is dual-coding theory applied to data visualization.

**Spec:**

Each bar row contains:
- Subject name (Inter 13px, `#555555`)
- Progress bar track: `#F2F0EB` (Cream), 6px height, rounded-full
- Progress bar fill: color based on mastery level, rounded-full, smooth width transition
- Percentage number: Inter 13px tabular-nums, `#1A2332`, right-aligned

**Color coding (same as Readiness Score):**
```
≥ 70%:  Signal Green  #1B7A3C  (mastered)
40-69%: Camp Orange   #E8853A  (developing)
< 40%:  Signal Red    #E63329  (at-risk)
0%:     Border gray   #E8E4DC  (unexplored — no questions answered)
```

**Bar animation:** Each bar grows from 0% to target width on mount, staggered by 80ms per bar (total cascade ≤ 400ms). CSS transition or Recharts animation.

**Below the bars, show a summary line:**
```
"3 of 7 subjects above passing" or "All subjects explored" 
in Inter 12px, #6B6B6B
```

**Empty state:** Show all 7 subject names with empty gray tracks (0% fill). Text: "Your mastery bars fill as you answer questions."

### Component 3: `ResumeSessionBanner` (Relocated)

The "Continue where you left off" functionality must NOT disappear. Move it to a compact, dismissible banner.

**Placement options (pick the one that fits the current layout best):**
1. **Option A:** Inline banner at the TOP of the mastery section (above the radar + bars), spanning both columns. Small, compact: one line with session info + "Continue →" button.
2. **Option B:** Inside the hero/greeting area, below the motivational text. A small cobalt-tinted card.
3. **Option C:** A persistent floating prompt attached to the bottom of the sidebar.

**Recommended: Option A.** It keeps the resume action near the student's study data.

```tsx
// Compact banner — only shows when there's an active session
<div className="col-span-2 flex items-center justify-between gap-3 rounded-lg bg-[#EEF2FC] border border-[#1B3FC4]/10 px-4 py-2.5">
  <div className="flex items-center gap-2">
    <div className="flex items-center justify-center w-6 h-6 rounded bg-[#1B3FC4] text-white text-xs font-bold">
      ▶
    </div>
    <div>
      <span className="text-sm font-medium text-[#1A2332]">Resume Camp Mode</span>
      <span className="text-xs text-[#6B6B6B] ml-2">Question 1 of 10 · ~12 min</span>
    </div>
  </div>
  <a href="/dashboard/testing?session=..." className="px-4 py-1.5 bg-[#1B3FC4] text-white text-sm font-medium rounded-md hover:bg-[#1535A8] transition-colors">
    Continue →
  </a>
</div>
```

Only render this banner when there IS an active/incomplete session. When no session is active, this space collapses and the radar + bars fill the area.

---

## CARD WRAPPER STYLING

Both the radar chart and progress bars live inside cards that match the existing dashboard card style:

```tsx
// Card container
<div className="flex flex-col bg-white border border-[#E8E4DC] rounded-lg overflow-hidden h-full">
  {/* Card header */}
  <div className="px-4 py-3 border-b border-[#E8E4DC]">
    <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.15em] text-[#6B6B6B]">
      Subject Mastery
    </span>
    <h3 className="text-[15px] font-semibold text-[#1A2332] mt-0.5">
      Your ALE Coverage
    </h3>
  </div>
  {/* Card body — flex-1 so it fills available space */}
  <div className="flex-1 p-4 min-h-0">
    {/* Chart or bars here */}
  </div>
</div>
```

**DM Mono eyebrow + Inter heading** — this matches the pattern used in Today's Article card and other dashboard cards.

---

## GRID LAYOUT CHANGE

The current grid is `grid-cols-4`. The new layout for columns 2-3:

**If the resume banner is showing:**
```
Col 2-3 combined:
┌──────────────────────────────────────┐
│ Resume Banner (col-span-2, compact)  │
├──────────────────┬───────────────────┤
│ Radar Chart      │ Progress Bars     │
│ (spider shape)   │ (7 bars + colors) │
└──────────────────┴───────────────────┘
```

**If no active session:**
```
Col 2-3 combined:
┌──────────────────┬───────────────────┐
│ Radar Chart      │ Progress Bars     │
│ (spider shape)   │ (7 bars + colors) │
│ (taller now)     │ (taller now)      │
└──────────────────┴───────────────────┘
```

**Implementation:** Wrap columns 2-3 in a sub-grid or nested flex:
```tsx
{/* Columns 2-3: Subject Mastery Zone */}
<div className="lg:col-span-2 flex flex-col gap-2">
  {/* Resume banner — conditionally rendered */}
  {hasActiveSession && <ResumeSessionBanner session={activeSession} />}
  
  {/* Mastery visualizations — side by side */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 min-h-0">
    <SubjectRadarChart data={subjectMastery} />
    <SubjectMasteryBars data={subjectMastery} />
  </div>
</div>
```

This means the outer grid becomes effectively: `[col1: Today's Article] [col2-3: Mastery Zone (span 2)] [col4: Recent Activity]`. Add `lg:col-span-2` to the mastery wrapper div.

---

## DATA FETCHING

Query Supabase for per-subject mastery. The exact query depends on your schema, but the pattern is:

```tsx
// In the dashboard page server component or via a hook
async function getSubjectMastery(userId: string): Promise<SubjectMastery[]> {
  const { data, error } = await supabase
    .from('quiz_responses')
    .select(`
      is_correct,
      questions!inner(subject)
    `)
    .eq('user_id', userId)

  if (error || !data) return getDefaultSubjects() // Return empty state

  // Aggregate by subject
  const bySubject = new Map<string, { correct: number; total: number }>()
  
  for (const row of data) {
    const subject = row.questions.subject
    const existing = bySubject.get(subject) || { correct: 0, total: 0 }
    existing.total++
    if (row.is_correct) existing.correct++
    bySubject.set(subject, existing)
  }

  return ALL_ALE_SUBJECTS.map(s => ({
    subject: s.name,
    shortLabel: s.shortLabel,
    mastery: bySubject.has(s.name) 
      ? Math.round((bySubject.get(s.name)!.correct / bySubject.get(s.name)!.total) * 100)
      : 0,
    questionsAnswered: bySubject.get(s.name)?.total || 0
  }))
}

// The 7 ALE subjects — always show all 7 even if 0 questions answered
const ALL_ALE_SUBJECTS = [
  { name: 'Building Technology', shortLabel: 'Bldg Tech' },
  { name: 'Structural Design', shortLabel: 'Structural' },
  { name: 'Utilities (MEPFS)', shortLabel: 'Utilities' },
  { name: 'History of Architecture', shortLabel: 'History' },
  { name: 'Architectural Design', shortLabel: 'Arch Design' },
  { name: 'Professional Practice', shortLabel: 'Prof Practice' },
  { name: 'Building Laws & Codes', shortLabel: 'Laws & Codes' },
]
```

**IMPORTANT:** Always show all 7 subjects. If a student hasn't answered questions in a subject, show it at 0% with the gray `#E8E4DC` color. The empty tracks are informative — they show the student WHERE they haven't started yet.

**ALSO IMPORTANT:** Query the actual database schema FIRST. The table names and column names above are GUESSES. Run the schema queries from the pre-flight section to get the real names, then adapt.

---

## PHASED EXECUTION

### PHASE 1: Pre-Flight — Read Files, Query Schema, Install Recharts

1. Read `package.json` — check for `recharts`
2. If not installed: `npm install recharts`
3. Read `src/app/dashboard/page.tsx` — find the grid and the two target cards
4. Grep for any existing subject mastery data fetching
5. Run Supabase schema queries — find the correct table/column names for quiz responses and subjects
6. Run a sample aggregation query to see what the data looks like

Output: Confirm schema, confirm recharts availability, confirm the exact code location of the two cards to replace.

**STOP.** "Phase 1 Complete. Schema mapped, recharts ready, target cards located. Reply 'Proceed.'"

### PHASE 2: Build the Data Layer

1. Create the `SubjectMastery` type definition
2. Create the `ALL_ALE_SUBJECTS` constant (verify names match DB)
3. Create `getSubjectMastery()` server function (or hook, depending on current data fetching pattern)
4. Wire it into the dashboard page's data fetching

Test: Log the output to verify the query returns correct per-subject percentages.

**STOP.** "Phase 2 Complete. Data layer returns mastery per subject. Reply 'Proceed.'"

### PHASE 3: Build the Radar Chart Component

1. Create `components/dashboard/SubjectRadarChart.tsx`
2. Use Recharts `RadarChart` with SlateCamp colors
3. Handle empty state (no data)
4. Ensure responsive sizing
5. Add mount animation

**STOP.** "Phase 3 Complete. Radar chart renders with real data. Reply 'Proceed.'"

### PHASE 4: Build the Progress Bars Component

1. Create `components/dashboard/SubjectMasteryBars.tsx`
2. Build 7 bar rows with color-coded fills
3. Handle empty state
4. Add staggered width animation on mount
5. Add summary line below bars

**STOP.** "Phase 4 Complete. Progress bars render with real data. Reply 'Proceed.'"

### PHASE 5: Build Resume Banner + Grid Integration

1. Create `components/dashboard/ResumeSessionBanner.tsx` (compact version)
2. Modify the dashboard grid: wrap columns 2-3 in a `lg:col-span-2` div
3. Place the resume banner (conditional) + mastery grid inside
4. Remove the old "Continue where you left off" card
5. Remove the old "Your next focus areas" card
6. Verify the grid doesn't break — column 1 and column 4 are untouched

**STOP.** "Phase 5 Complete. Dashboard middle row replaced. Reply 'Proceed.'"

### PHASE 6: Visual QA

Verify at all viewports:
- [ ] Radar chart renders with correct data at 1440px desktop
- [ ] Progress bars show all 7 subjects with correct colors
- [ ] Colors match: green ≥70%, orange 40-69%, red <40%, gray 0%
- [ ] Resume banner appears when active session exists
- [ ] Resume banner disappears when no active session
- [ ] "Continue →" link works and resumes the session
- [ ] Empty state shows correctly when no quiz data exists
- [ ] Radar chart short labels are readable (not overlapping)
- [ ] Progress bar numbers are Inter tabular-nums (not Syne)
- [ ] Card headers use DM Mono eyebrow + Inter heading
- [ ] Responsive: stacks to single column below md
- [ ] Column 1 (Today's Article sidebar) is completely untouched
- [ ] Column 4 (Recent Activity) is completely untouched
- [ ] No TypeScript errors
- [ ] No console errors

**STOP.** "Phase 6 Complete. Subject mastery section shipped."

---

## WHAT NOT TO DO

- **Don't delete the resume session functionality.** Relocate it to the compact banner. A student mid-quiz must be able to resume.
- **Don't touch column 1 (Today's Article / Notes / 3D Lab).** That's a separate concern.
- **Don't touch column 4 (Recent Activity).** That stays.
- **Don't use Syne for ANY numbers** in the charts or bars. All data numbers are Inter with tabular-nums.
- **Don't use Chart.js or D3.** Use Recharts — it's React-native, tree-shakeable, and has a built-in RadarChart.
- **Don't make the radar chart interactive/clickable.** It's read-only data visualization. Clicking a subject to drill down is a future feature, not this sprint.
- **Don't invent subjects.** Use exactly the subjects that exist in the database. If the DB has 6 subjects instead of 7, show 6. Query first, code second.
- **Don't hardcode mastery percentages.** All data comes from the database query. The only hardcoded values are the ALL_ALE_SUBJECTS fallback list (for showing empty tracks when a subject has 0 questions answered).
- **Don't over-animate.** The radar shape grows in once (300ms). The bars grow in once (staggered, 400ms total). That's it. No continuous animation.

---

*Execute Phase 1 now. Read the files, query the schema, install recharts if needed.*

