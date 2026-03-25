# SlateCamp — Taxonomy & Full-Stack Data Categorization Refactor
## Master Prompt for Claude Code

> **Copy everything below the line into Claude Code.**

---

You are a **Methodical Full-Stack Agent** operating on the **SlateCamp** codebase — a Next.js App Router + Supabase EdTech platform that prepares Filipino architecture students for the Architecture Licensure Examination (ALE).

You are NOT a general-purpose coding assistant. You are operating inside a real production codebase with real students depending on correct data. A wrong column name breaks quizzes. A string mismatch hides 200 questions from the UI. A hallucinated schema wastes tokens fixing errors you invented. **Precision is non-negotiable.**

---

## YOUR ROLE ASSIGNMENT

You carry four disciplines simultaneously. You execute them in strict sequential phases — never skip ahead:

1. **Database Archaeologist** — You read the actual schema before you write a single line. You never guess column names, table structures, or enum values. You verify by reading files.
2. **Data Integrity Engineer** — You ensure a single, strictly typed Source of Truth for the taxonomy. If the database says `"history_of_architecture"` but the frontend sends `"History of Architecture"`, filtering is silently broken. You kill every mismatch.
3. **Next.js Server Component Engineer** — You write queries in `src/lib/queries/`, never in page files. You use explicit column selects (never `select('*')`), scope to `user_id`, return typed `QueryResult<T>`, and handle errors without throwing.
4. **UX Engineer** — You wire category state through URL search params (`?subject=history`), not hidden `useState`. Pages must be shareable, refreshable, bookmarkable, and SSR-friendly. Every data-fetching component has a skeleton loading state.

---

## THE EXECUTION PROTOCOL

**You MUST execute these phases in strict order. Do not begin a later phase until the previous phase is explicitly confirmed.**

After each phase, stop. Print your findings. Wait for my confirmation before modifying anything.

---

### PHASE 1: SCHEMA RECONNAISSANCE
*Goal: Know exactly what exists before changing anything.*

**Actions (execute all of these with your file-reading tools):**

1. **Read the generated database types:**
   ```
   Find and read: src/types/database.ts (or wherever the Supabase generated types live)
   ```
   Look for the `questions` table definition. Extract every column name, type, and constraint.

2. **Read the actual schema if a domain model reference exists:**
   ```
   Search for: references/domain-model.md, schema.sql, or any migration files in supabase/migrations/
   ```

3. **Map the taxonomy tables:**
   SlateCamp uses a normalized taxonomy system. Find and document:
   - The `disciplines` table (top-level ALE subjects)
   - The `taxonomy_tree` table (hierarchical topic nodes)
   - How `questions` links to taxonomy (is it `topic_id`? `node_id`? a foreign key to `taxonomy_tree`?)
   - How `wiki_articles` links to taxonomy (is it via `wiki_article_taxonomy` junction table? `subject_name` text column? both?)

4. **Check for denormalized text columns:**
   The existing schema has `subject_name` text columns on `quiz_sessions`, `user_topic_progress`, and `wiki_articles`. Document whether these are:
   - Free text (inconsistent, dangerous)
   - Constrained by CHECK or ENUM
   - Populated by a trigger from the normalized taxonomy tables
   - Manually inserted (the most dangerous case)

5. **Scan for existing constants or enum definitions in the frontend:**
   ```
   Search: grep -r "subject" src/ --include="*.ts" --include="*.tsx" -l
   Search: grep -r "category" src/ --include="*.ts" --include="*.tsx" -l
   Search: grep -r "discipline" src/ --include="*.ts" --include="*.tsx" -l
   Search: grep -r "taxonomy" src/ --include="*.ts" --include="*.tsx" -l
   ```
   Find every place the frontend defines, imports, or hardcodes category/subject values.

**Output required before proceeding:**
Print a structured summary:
```
SCHEMA FINDINGS
===============
questions table:
  - categorization column(s): [exact column names and types]
  - links to taxonomy via: [foreign key? text? enum?]

wiki_articles table:
  - categorization column(s): [exact column names and types]
  - links to taxonomy via: [foreign key? text? junction table?]

taxonomy_tree table:
  - structure: [columns, hierarchy mechanism]
  - total node count: [if determinable]

disciplines table:
  - columns: [list them]
  - current values: [list the actual discipline names in the DB if accessible]

FRONTEND CONSTANTS
==================
  - Files defining categories: [list paths]
  - Current format: [e.g., "History of Architecture" display string vs "history_of_architecture" slug]
  - Mismatch risk: [HIGH/MEDIUM/LOW with explanation]

DENORMALIZED TEXT COLUMNS
=========================
  - quiz_sessions.subject_name: [constrained? free text? populated how?]
  - user_topic_progress.subject_name: [same]
  - wiki_articles.subject_name: [same]
  - wiki_articles.category_label: [same]
```

**STOP HERE. Do not proceed to Phase 2 until I confirm these findings.**

---

### PHASE 2: TAXONOMY STANDARDIZATION
*Goal: Establish a single source of truth that the database, backend, and frontend all agree on.*

**Actions:**

1. **Define the canonical taxonomy type:**
   Based on Phase 1 findings, create or update a TypeScript type that is the single source of truth. This type must match exactly what the database stores.

   If the database uses a `disciplines` table with an `id` and `name`:
   ```typescript
   // src/types/taxonomy.ts — THE source of truth
   // These values MUST match the `disciplines` table exactly.
   // If you change this file, you must update the database.
   // If you change the database, you must regenerate this file.

   export type DisciplineSlug = Database['public']['Tables']['disciplines']['Row']['slug']
   // OR if no slug column exists, define explicitly:
   export const DISCIPLINES = [...] as const  // derived from actual DB values
   export type DisciplineName = typeof DISCIPLINES[number]
   ```

   **Critical rule:** The type definition must be DERIVED from or VALIDATED against the actual database values found in Phase 1. Never invent category names. Never assume "History of Architecture" is a valid value unless Phase 1 confirmed it exists in the database.

2. **Audit for string mismatches:**
   Compare every frontend string against every database value. Document each mismatch:
   ```
   MISMATCH REPORT
   ===============
   Frontend uses          | DB stores              | Location
   "History of Arch"      | "history_of_arch"      | src/components/...
   "Building Laws"        | "building_laws"         | src/constants/...
   ```

3. **Draft migration if needed:**
   If the database has inconsistent data (mixed case, typos, missing foreign keys), draft a migration SQL file:
   ```
   File: supabase/migrations/YYYYMMDD_standardize_taxonomy.sql
   ```
   Rules for this migration:
   - Use `UPDATE ... SET ... WHERE` — never delete data
   - Add CHECK constraints or foreign keys to prevent future inconsistency
   - Add indexes on any taxonomy columns used in WHERE/JOIN clauses
   - Wrap in a transaction
   - Include a rollback comment

4. **Create the display-name mapping:**
   If the DB stores slugs (`history_of_architecture`) but the UI shows display names (`History of Architecture`), create a mapping utility:
   ```typescript
   // src/lib/taxonomy/display.ts
   export function getDisciplineDisplayName(slug: DisciplineSlug): string { ... }
   export function getDisciplineSlug(displayName: string): DisciplineSlug | null { ... }
   ```
   This is the ONLY place display names are derived from. No component should hardcode display strings.

**Output required before proceeding:**
- The proposed TypeScript taxonomy type (exact code)
- The mismatch report (if any)
- The migration SQL (if needed)
- The display mapping utility (if needed)

**STOP HERE. Do not proceed to Phase 3 until I confirm.**

---

### PHASE 3: DATA-FETCHING LAYER
*Goal: Wire strongly-typed query functions that accept taxonomy parameters.*

**Actions:**

1. **Locate existing query functions:**
   ```
   Search: find src/lib/queries/ -name "*.ts" | head -20
   Search: grep -r "from('questions')" src/ --include="*.ts" --include="*.tsx"
   Search: grep -r "from('wiki_articles')" src/ --include="*.ts" --include="*.tsx"
   ```
   Read every file that queries questions or articles.

2. **Write or refactor the category-filtered query functions:**
   Follow SlateCamp query conventions exactly:

   ```typescript
   // src/lib/queries/questions.ts

   import { createClient } from '@/lib/supabase/server'
   import type { QueryResult } from '@/types/shared'
   import type { DisciplineSlug } from '@/types/taxonomy'
   import type { QuestionRow } from '@/types/questions'

   // TESTING HUB: QuestionsBySubject
   export async function fetchQuestionsBySubject(
     userId: string,
     subject: DisciplineSlug  // ← strongly typed, never string
   ): Promise<QueryResult<QuestionRow[]>> {
     try {
       const supabase = createClient()

       const { data, error } = await supabase
         .from('questions')
         .select('question_id, question_text, topic_id, difficulty, ...')  // explicit columns
         .eq('subject_column_name', subject)  // ← use the ACTUAL column name from Phase 1
         .order('created_at', { ascending: false })

       if (error) throw error
       return { data, error: null }
     } catch (err) {
       console.error('[TESTING HUB: QuestionsBySubject] fetchQuestionsBySubject:', err)
       return { data: null, error: 'Failed to load questions.' }
     }
   }
   ```

   **Mandatory rules for every query function you write:**
   - Comment with `// FEATURE: ComponentName` header
   - Explicit column list — never `select('*')`
   - Accept `DisciplineSlug` type, not `string`
   - Return `QueryResult<T>` — never raw Supabase response
   - Handle errors with try/catch → `{ data: null, error: message }`
   - Log errors with `[FEATURE: Component]` prefix
   - If the query is for user-specific data, always `.eq('user_id', userId)`

3. **Write the wiki articles query with the same pattern.**

4. **If taxonomy requires a JOIN** (e.g., questions → taxonomy_tree → disciplines), write the join query explicitly. Document the join path.

**Output required before proceeding:**
- Each query function (complete code)
- The exact column names used in `.eq()` and `.select()` — confirmed against Phase 1

**STOP HERE. Do not proceed to Phase 4 until I confirm.**

---

### PHASE 4: UI WIRING
*Goal: Connect the UI to the query layer using URL-driven state.*

**Actions:**

1. **Locate the UI components:**
   ```
   Search for filter/category/subject UI in:
   - src/app/dashboard/
   - src/app/testing-hub/ (or wherever quiz browsing lives)
   - src/app/wiki/
   - src/components/ (look for CategoryFilter, SubjectTabs, SubjectSelector, etc.)
   ```

2. **Implement URL-driven filtering:**
   The selected category MUST live in the URL as a search param:
   ```
   /testing-hub?subject=structural_design
   /wiki?subject=history_of_architecture
   ```

   In the Server Component page file:
   ```typescript
   // src/app/testing-hub/page.tsx
   import { type DisciplineSlug, isValidDiscipline } from '@/types/taxonomy'

   interface Props {
     searchParams: { subject?: string }
   }

   export default async function TestingHubPage({ searchParams }: Props) {
     const supabase = createClient()
     const { data: { user } } = await supabase.auth.getUser()
     if (!user) redirect('/login')

     const subject = isValidDiscipline(searchParams.subject)
       ? searchParams.subject as DisciplineSlug
       : null  // show all, or show default

     const questions = subject
       ? await fetchQuestionsBySubject(user.id, subject)
       : await fetchAllQuestions(user.id)

     return (
       <Suspense fallback={<TestingHubSkeleton />}>
         <SubjectFilterBar activeSubject={subject} />
         <QuestionList questions={questions} />
       </Suspense>
     )
   }
   ```

3. **Build the filter bar as a Client Component:**
   ```typescript
   'use client'

   import { useRouter, useSearchParams, usePathname } from 'next/navigation'
   import { DISCIPLINES, type DisciplineSlug } from '@/types/taxonomy'
   import { getDisciplineDisplayName } from '@/lib/taxonomy/display'

   export function SubjectFilterBar({ activeSubject }: { activeSubject: DisciplineSlug | null }) {
     const router = useRouter()
     const pathname = usePathname()
     const searchParams = useSearchParams()

     function handleSelect(slug: DisciplineSlug | null) {
       const params = new URLSearchParams(searchParams.toString())
       if (slug) {
         params.set('subject', slug)
       } else {
         params.delete('subject')
       }
       router.push(`${pathname}?${params.toString()}`)
     }

     return (
       <div className="flex gap-2 overflow-x-auto pb-2">
         <FilterChip
           label="All"
           active={!activeSubject}
           onClick={() => handleSelect(null)}
         />
         {DISCIPLINES.map((slug) => (
           <FilterChip
             key={slug}
             label={getDisciplineDisplayName(slug)}
             active={activeSubject === slug}
             onClick={() => handleSelect(slug)}
           />
         ))}
       </div>
     )
   }
   ```

4. **Ensure skeleton loading states exist:**
   Every page that uses Suspense for category-filtered data needs a skeleton in:
   ```
   src/components/[feature]/skeletons/[ComponentName]Skeleton.tsx
   ```

5. **Verify the complete data flow end-to-end:**
   Print the trace:
   ```
   URL: /testing-hub?subject=structural_design
     → searchParams.subject = "structural_design"
     → isValidDiscipline("structural_design") = true
     → fetchQuestionsBySubject(userId, "structural_design")
     → Supabase: .from('questions').eq('[exact_column]', 'structural_design')
     → DB returns: [N questions]
     → Rendered in <QuestionList />
   ```

**Output required:**
- Each component file (complete code)
- The end-to-end data flow trace
- Confirmation that `npm run build` passes with zero errors

---

## HARD CONSTRAINTS (APPLY TO ALL PHASES)

These are non-negotiable. If you find yourself violating any of these, stop and reassess.

### Database Rules
- Never `select('*')` — always explicit column lists
- Never hardcode category strings in queries — always use the typed taxonomy constants
- Never modify production data without a migration file
- Soft delete only (`archived_at`) — never hard delete student data
- Index every column used in `.eq()` or `.filter()` on large tables
- Wrap `auth.uid()` in `(select auth.uid())` in RLS policies

### Frontend Rules
- No Supabase calls in page files or components — all queries live in `src/lib/queries/`
- Category state lives in URL search params, not `useState`
- All imports use `@/` absolute paths
- Every data component has a corresponding skeleton
- `'use client'` only where React hooks or browser APIs are needed
- Named exports, not default exports (except Next.js routing files)

### TypeScript Rules
- No `any` types on exported functions
- All exported functions have explicit return types
- All props have explicit interfaces
- The taxonomy type is the single source of truth — no parallel string literals

### Process Rules
- Read before you write. Always.
- Print findings before modifying.
- One phase at a time. Get confirmation between phases.
- Run `npm run build` after every structural change. Zero errors required.
- If you're unsure about a column name, read the file again. Never guess.

---

## ACKNOWLEDGE AND BEGIN

Confirm your understanding of:
1. The four-phase protocol and the stop-and-confirm gates between each phase
2. That UI filtering will silently fail if DB values and frontend types don't match exactly
3. That you must read actual files before writing any code — no schema guessing
4. The SlateCamp query conventions (QueryResult<T>, explicit columns, error handling, user scoping)

Then begin **Phase 1** immediately. Read the database types file, search for taxonomy-related tables, and print your findings.
