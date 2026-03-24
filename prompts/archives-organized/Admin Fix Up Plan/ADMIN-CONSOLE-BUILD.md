# SlateCamp Admin Console — Complete Build Instructions

> Give this entire file to Claude Code. It contains everything needed to build the admin console from security hardening through the full MDX editor.

---

## Context

You are building the admin console for SlateCamp, a Philippine EdTech platform for Architecture Licensure Examination (ALE) preparation. The admin console lives at `/admin/*` in a Next.js App Router application with Supabase (PostgreSQL), Tailwind CSS, and Shadcn UI.

Read these files before starting:
- `ADMIN-AUDIT-REPORT.md` — Full codebase audit of existing admin functionality
- `ADMIN-CONSOLE-PLAN.md` — Architecture plan this prompt is based on

The admin console already exists with basic routes. You are upgrading it — not rebuilding from scratch. Preserve all existing functionality while improving it.

---

## Tech Stack (non-negotiable)

- **Framework:** Next.js App Router (Server Components default, `'use client'` only when needed)
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Auth:** Supabase Auth (Google OAuth), roles via `user_roles` table
- **Styling:** Tailwind CSS + Shadcn UI components (already installed in `src/components/ui/`)
- **State:** Zustand for client-side state, Server Actions for mutations
- **MDX Editor:** `@uiw/react-codemirror` with `@codemirror/lang-markdown` (install these)
- **MDX Preview:** Client-side compilation with `@mdx-js/mdx` `evaluate()` function + existing component map

---

## Design System (follow exactly)

- **Fonts:** Syne (headings, font-display font-extrabold), DM Mono (labels/eyebrows, font-mono uppercase tracking-widest text-[9px]), Inter (body, font-sans)
- **Primary color:** Cobalt Blue `#1B3FC4`
- **Admin header:** Dark navy `#0F1F5C`
- **Backgrounds:** `#F8F7F5` (page), `#FFFFFF` (cards)
- **Signal colors:** Green `#1B7A3C` (clean/success), Red `#E63329` (critical issues, functional only), Amber `#F5A623` (warnings)
- **Card pattern:** `bg-card border border-border rounded-xl p-4`
- **Eyebrow pattern:** `font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground`
- **Stat numbers:** `font-mono tabular-nums`
- **No emojis, no confetti, no gamification.** The admin console is a professional tool.

---

## Build Order

Execute these in exact order. Do not skip ahead. Run `bun run build` after each phase to confirm zero errors before proceeding to the next.

---

### PHASE 0: Security Hardening

Fix all security issues identified in ADMIN-AUDIT-REPORT.md Section 9 before touching any UI.

#### 0.1 Auth Guards on Server Actions

Add `canManageContent()` authorization check at the top of every admin server action. Add Zod schema validation for all inputs. Files:

- `src/lib/actions/admin/questions.ts` — `createQuestion()` and `deleteQuestions()`
- `src/lib/actions/admin/wiki.ts` — `updateWikiArticle()` and `createWikiArticle()`

Pattern to follow:
```typescript
'use server'
import { canManageContent } from '@/lib/admin/roles'
import { z } from 'zod'

const CreateQuestionSchema = z.object({
  topic_id: z.string().uuid(),
  text: z.string().min(1),
  options: z.array(z.object({ id: z.string(), text: z.string() })).min(2),
  correct_option_id: z.string().min(1),
  rationale: z.string().optional(),
  difficulty: z.number().min(0).max(1).optional(),
  code_citation: z.string().optional(),
  explanation: z.string().optional(),
})

export async function createQuestion(data: unknown) {
  if (!(await canManageContent())) {
    return { error: 'Unauthorized' }
  }
  const validated = CreateQuestionSchema.parse(data)
  const supabase = createAdminClient()
  // ... rest of function
}
```

#### 0.2 Remove Hardcoded Admin Emails

First, verify the `user_roles` table contains a `super_admin` entry for `philipjonlewis@gmail.com`. If not, write a migration to insert it.

Then remove all hardcoded email checks from:
- `src/lib/admin/roles.ts` — remove the `adminEmails` fallback array in `getUserRole()`
- `src/lib/admin/is-admin.ts` — remove `isAdminByEmail()` function or make it query `user_roles` only
- `src/lib/admin/get-admin-profile.ts` — remove `@slatecamp.com` domain check
- `src/app/dashboard/developer/layout.tsx` — replace hardcoded email/domain checks with `getUserRole()` from `user_roles`

#### 0.3 Unify RLS Policies

Write migration `20260324_unify_rls_admin_patterns.sql`. Replace all RLS policies that use `raw_app_meta_data ->> 'role' = 'admin'` or JWT claim checks with `has_admin_role()`. Tables affected:
- `feature_flags`
- `taxonomy_cross_references`
- `taxonomy_sources`
- `taxonomy_prerequisites`
- `wiki_ei_prompts`
- `topic_teach_back_criteria`
- `notification_log`
- `audit_logs`

Pattern: DROP the old policy, CREATE new policy using `has_admin_role()`.

#### 0.4 Migrate QuestionEditor to Server Actions

Refactor `src/components/admin/QuestionEditor.tsx` to stop using `createClient()` (browser/anon) for direct `.insert()`, `.update()`, `.delete()`. Instead, call server actions that have auth checks. Create new server actions `updateQuestion()` and `deleteQuestion()` if they don't exist.

#### 0.5 Attribution Columns

Write migration `20260324_add_attribution_columns.sql`:
```sql
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
ALTER TABLE public.wiki_articles ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.wiki_articles ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
ALTER TABLE public.models_3d ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.models_3d ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
```

Update all admin server actions to populate `created_by` on insert and `updated_by` on update using the authenticated user's ID.

#### 0.6 Protect Debug Endpoint

Delete `src/app/api/debug-taxonomy/route.ts` if it exists, or add a `canManageContent()` guard.

#### 0.7 Junction Table RLS

Write migration adding admin mutation RLS to `wiki_article_taxonomy`:
```sql
CREATE POLICY "Admins can manage wiki_article_taxonomy"
  ON public.wiki_article_taxonomy FOR ALL
  USING (has_admin_role()) WITH CHECK (has_admin_role());
```

**Run `bun run build` and confirm zero errors before continuing.**

---

### PHASE 1: Admin Dashboard Redesign

Redesign `src/app/admin/dashboard/page.tsx` to be a correction-priority command center.

#### Dashboard Data

Create or update `src/lib/actions/admin/dashboard.ts` to fetch:
- Total counts: questions, wiki_articles (by status: published/draft), taxonomy_tree nodes
- Content health: count of articles and questions by verification status if such fields exist, otherwise just by status
- Recent audit log entries (last 20) from `audit_logs` table with actor info
- Quick links to each admin section

#### Dashboard UI

The dashboard should show:
1. **Stats row** — 4 cards showing: Total Questions, Total Articles, Published Articles, Draft Articles. Each card uses the eyebrow + stat number pattern from the design system.
2. **Recent Activity** — table/list of last 20 audit log entries showing: timestamp (relative, e.g. "2 hours ago"), actor email, event type (CREATE/UPDATE/DELETE), table name, and a link to the affected record.
3. **Quick Actions** — card with links to: Manage Questions, Manage Articles, Taxonomy Tree, Import Questions, Audit Log.

Use Server Component for data fetching. No client-side state needed for this page.

---

### PHASE 2: MDX Article Editor

This is the most complex phase. Build a split-pane MDX editor with CodeMirror on the left and a live preview on the right.

#### 2.1 Install Dependencies

```bash
bun add @uiw/react-codemirror @codemirror/lang-markdown @codemirror/language-data @mdx-js/mdx
```

#### 2.2 Article List Page — `src/app/admin/articles/page.tsx`

If `/admin/wiki` already exists, you can either rename/redirect or keep both. The article list should show:
- All articles from `wiki_articles` table
- Columns: ale_id (from taxonomy junction), title, status (published/draft badge), word count, updated_at
- Click row → navigate to `/admin/articles/[id]`
- Search/filter by title or status
- "New Article" button

Use Server Component for the page, Client Component for the interactive list with search/filter.

#### 2.3 Article Editor Page — `src/app/admin/articles/[id]/page.tsx`

Server Component page that fetches the article and passes it to the client editor:

```typescript
export default async function ArticleEditorPage({ params }: { params: { id: string } }) {
  if (!(await canManageContent())) redirect('/admin')
  const article = await getArticle(params.id)
  if (!article) notFound()
  return <AdminMDXEditor article={article} />
}
```

#### 2.4 AdminMDXEditor Component — `src/components/admin/AdminMDXEditor.tsx`

This is a `'use client'` component. It has three sections:

**A) Component Insertion Toolbar**

A horizontal toolbar above the editor with grouped buttons. Each button inserts a template snippet at the cursor position in CodeMirror.

Group the buttons into dropdown menus or button groups:

**Callouts:** Note, Warn, Tip, ExamTip, Example, Callout
**Legal:** LawCallout (with sub-options for code: nbcp, bp344, ra9514, bp220, pd957, irr)
**Interactive:** InlineQuiz, KeyValues, FormulaBlock, Tabs, Accordion
**Exam:** WikiMistakeCard, WikiCalloutBox, AlertBox, ComparisonTable, ProcessFlow, AuthorityContent
**Structure:** WikiPartHeader, WikiChangedPill

Templates for each component (insert at cursor):

```
Note       → <Note>\n  Content here\n</Note>
Warn       → <Warn>\n  Warning content here\n</Warn>
Tip        → <Tip>\n  Tip content here\n</Tip>
ExamTip    → <ExamTip>\n  Exam strategy tip here\n</ExamTip>
Example    → <Example>\n  Example content here\n</Example>

LawCallout → <LawCallout code="nbcp" section="">\n  Provision text\n</LawCallout>

InlineQuiz → <InlineQuiz\n  question="Your question"\n  options={[\n    { text: "Option A", is_correct: false },\n    { text: "Option B", is_correct: true },\n    { text: "Option C", is_correct: false },\n    { text: "Option D", is_correct: false }\n  ]}\n  rationale="Explanation"\n/>

KeyValues  → <KeyValues items={[\n  { value: "40%", label: "Label" },\n  { value: "60%", label: "Label" }\n]} />

FormulaBlock → <FormulaBlock\n  label="Formula Name"\n  steps={["Step 1", "Step 2"]}\n/>

Tabs → <Tabs defaultTab="tab1">\n  <Tab label="Tab 1" value="tab1">\n    Content\n  </Tab>\n  <Tab label="Tab 2" value="tab2">\n    Content\n  </Tab>\n</Tabs>

Accordion → <Accordion>\n  <AccordionItem title="Title">\n    Content\n  </AccordionItem>\n</Accordion>

WikiMistakeCard → <WikiMistakeCard\n  number={1}\n  title="Common Mistake"\n  wrongValue="Wrong"\n  correctValue="Correct"\n  explanation="Why"\n  sourceRef="PD 1096 Sec. X"\n/>

WikiCalloutBox → <WikiCalloutBox type="most-tested">\n  Content\n</WikiCalloutBox>

AlertBox → <AlertBox type="requirement">\n  Content\n</AlertBox>

ComparisonTable → <ComparisonTable>\n\n| Column 1 | Column 2 |\n|----------|----------|\n| A | B |\n\n</ComparisonTable>

ProcessFlow → <ProcessFlow>\n\n1. Step one\n2. Step two\n3. Step three\n\n</ProcessFlow>

AuthorityContent → <AuthorityContent>\n  Legal authority text\n</AuthorityContent>

WikiPartHeader → <WikiPartHeader partNumber={1} title="Part Title" subtitle="Optional subtitle" />

WikiChangedPill → <WikiChangedPill oldValue="previous value" />
```

**B) Split Pane — Left: CodeMirror Editor**

Use `@uiw/react-codemirror` with these extensions:
- `markdown()` from `@codemirror/lang-markdown` for syntax highlighting
- `EditorView.lineWrapping` for line wrapping
- Light theme that matches the admin console design

The editor should:
- Be a controlled component with the article's `content` as initial value
- Have a ref so the toolbar can insert text at cursor position via `view.dispatch()`
- Take up 50% of the width

**C) Split Pane — Right: Live Preview**

Use `evaluate` from `@mdx-js/mdx` to compile MDX on the client side and render it with the same components students see.

```typescript
import { evaluate } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import remarkGfm from 'remark-gfm'
```

Import your base MDX components from the wiki. You'll need to export `baseMdxComponents` from `src/components/wiki/WikiArticle.tsx` (or create a shared file like `src/components/wiki/mdx-components.ts` that both the WikiArticle renderer and the admin editor import from).

The preview should:
- Debounce compilation (300ms after last keystroke)
- Show compilation errors gracefully (not crash, show the error message)
- Wrap in the same `wiki-prose` CSS class used in the student-facing wiki
- Scroll independently from the editor
- Take up 50% of the width

**D) Article Metadata Bar**

Above the split pane, show:
- Article title (editable input)
- Article slug (auto-generated from title, but editable)
- Status badge (published/draft) with toggle
- ale_id from taxonomy junction (read-only, shown as DM Mono label)
- Word count (computed from content)
- Last updated timestamp
- Save button (calls `updateWikiArticle` server action)
- Back to list link

**E) Save Flow**

The Save button should:
1. Call the `updateWikiArticle` server action (which now has auth + Zod validation from Phase 0)
2. Show a brief "Saved" confirmation flash
3. Revalidate the article list page
4. Update `updated_by` with the current user's ID

#### 2.5 Shared MDX Components Export

Create `src/components/wiki/mdx-components-shared.ts` that exports the component map used by both:
- The student-facing `WikiArticle.tsx` renderer (server-side, `next-mdx-remote`)
- The admin editor live preview (client-side, `@mdx-js/mdx` `evaluate()`)

Important: Some components are client components. For the preview, you may need to handle this carefully. Components that use `useState` or `useEffect` will work fine since the preview runs client-side. Server-only components (if any) will need stubs or simplified versions for the preview.

The widget registry components (bp344, dsgn013) can be excluded from the preview for now — they're complex interactive widgets that are rarely edited. Show a placeholder block for them in the preview.

#### 2.6 New Article Page

Create `/admin/articles/new/page.tsx` that renders `<AdminMDXEditor />` without an existing article (empty editor). Save should call `createWikiArticle` server action.

---

### PHASE 3: Question Manager Upgrade

#### 3.1 Question List — `src/app/admin/questions/page.tsx`

Upgrade the existing question list:
- Show all questions with columns: stem (truncated), ale_id/topic, difficulty, status, updated_at
- Add filters: by taxonomy node (dropdown), by status
- Add search by stem text
- Click row → inline expand (not navigate to new page)

#### 3.2 Inline Question Editor

When a question row is clicked, it expands in-place showing:
- Stem (textarea)
- 4 choices (text inputs with radio buttons for correct answer)
- Rationale (textarea)
- Code citation (text input)
- Difficulty (number input or slider, 0-1)
- Save / Cancel buttons
- Delete button (with confirmation)

All mutations go through server actions with auth checks (from Phase 0).

#### 3.3 Question Import

Keep the existing `QuestionImporter` component. No changes needed unless it's broken.

---

### PHASE 4: Taxonomy Tree Upgrade

#### 4.1 Taxonomy Tree — `src/app/admin/taxonomy/page.tsx`

Upgrade the existing `TaxonomyEditor`:
- Render the full taxonomy tree from `taxonomy_tree` table
- Each node shows: name, ale_id, article count, question count
- Click a node → side panel shows all editable properties
- Properties panel includes: ale_id, name, parent_id, sort_order, level, node_type, exam_frequency, prc_area, bloom_level, difficulty, is_leaf, description
- Save changes via server action

#### 4.2 Taxonomy Node Detail

When a node is selected, the detail panel also shows:
- Linked articles (from `wiki_article_taxonomy` junction)
- Linked questions (from `questions.topic_id`)
- Click an article → navigate to the article editor
- Click a question → navigate to the question (or expand inline)

#### 4.3 Taxonomy Server Actions

Create `src/lib/actions/admin/taxonomy.ts` with:
- `updateTaxonomyNode(nodeId, data)` — auth check + Zod validation
- `getTaxonomyTree()` — already exists, verify it returns all needed columns

---

### PHASE 5: Final Polish

#### 5.1 Admin Navigation

Update `src/components/admin/AdminNav.tsx` to include all sections:
- Dashboard
- Articles (replacing or alongside Wiki)
- Questions
- Taxonomy
- Assets
- Audit Log
- Reviews

Highlight the active route. Use icons for each nav item.

#### 5.2 Loading States

Every admin page should have a `loading.tsx` with skeleton loaders matching the page layout.

#### 5.3 Error Boundaries

Verify `src/app/admin/error.tsx` catches and displays errors gracefully. Each sub-route can optionally have its own error boundary.

#### 5.4 Responsive Considerations

The admin console is primarily used on desktop (13" MacBook). Ensure it works at `xl` (1280px) and above. Mobile admin is not a priority but shouldn't be completely broken.

#### 5.5 Type Safety

After all schema changes, regenerate types:
```bash
bunx supabase gen types typescript --local > src/types/database.ts
```

Ensure all new server actions and queries use the generated types.

---

## Critical Rules

1. **Never use `createClient()` (browser) for admin mutations.** Always use server actions with `createAdminClient()` (service role) AND auth checks.
2. **Every server action must start with an auth check.** `canManageContent()` for content mutations, `isSuperAdmin()` for user management.
3. **Every mutation input must be Zod-validated.** Never pass `data: any` to the database.
4. **Use `(select auth.uid())` in RLS policies** on high-traffic tables (wrapped in subselect for performance).
5. **All admin mutations must populate `updated_by`** with the authenticated user's ID.
6. **The MDX editor preview must use the same component map as the student wiki.** Create a shared export, don't duplicate.
7. **CodeMirror must be lazy-loaded** with `next/dynamic` and `ssr: false` since it doesn't support server rendering.
8. **Follow existing code patterns.** Look at how existing admin components are structured before writing new ones. Match the conventions.
9. **Run `bun run build` after each phase.** Do not proceed to the next phase if the build fails.
10. **Do not delete or rename existing working routes without creating redirects.** If `/admin/wiki` becomes `/admin/articles`, keep both working.
