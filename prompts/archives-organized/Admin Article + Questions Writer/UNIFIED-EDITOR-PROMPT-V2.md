# Prompt — Paste this entire block into Claude Code

```
Read these files in this exact order before writing any code:

1. UNIFIED-CONTENT-EDITOR-UX-PLAN.md — The primary source of truth. This is a 650-line UX implementation plan covering every component, every state, every edge case, every keyboard shortcut. Follow it exactly.

2. UNIFIED-CONTENT-EDITOR.md — The data model, query logic, save behavior, and implementation phases. Use this for the technical architecture.

3. ADMIN-CONSOLE-AUDIT-V2.md — The ground truth of the current admin console. This tells you exactly what exists: 19 routes, 10 admin components, 7 portal components, 11 query functions, 6 server actions. Read Sections 6 (Component Inventory) and 7 (Server Actions) completely.

Then read the actual source files:

COMPONENTS — inventory before building anything:
- src/components/ui/ — List every file. These are your UI primitives. USE THEM.
- src/components/shared/ — List every file. These are shared components. USE THEM.
- src/components/portal/ — List every file (PortalLayout, PortalSidebar, PortalTopbar, CommandPalette, CodeBlock, CopyButton, StickyTOC). USE THEM.
- src/components/admin/ — List every file. Key ones:
  - AdminMDXEditor.tsx — YOU WILL REUSE THIS. Do not rebuild CodeMirror. Import and wrap it.
  - AdminMDXEditorLoader.tsx — The dynamic import loader for AdminMDXEditor.
  - QuestionEditor.tsx — Read it to understand the current question editing pattern, but do NOT reuse it for the unified editor. Build the new QuestionInlineEditor from scratch following the UX plan.

SERVER ACTIONS — read the actual signatures:
- src/lib/actions/admin/questions.ts — Read createQuestion and deleteQuestions. Note: createQuestion validates options.length === 4.
- src/lib/actions/admin/wiki.ts — Read updateWikiArticle and createWikiArticle.
- src/lib/actions/admin/question-queries.ts — Read getQuestions, getQuestion, getQuestionsForAnalytics.
- src/lib/actions/admin/wiki-queries.ts — Read getArticles, getArticle.
- src/lib/actions/ei-prompts.ts — Read getEIPromptsForArticle, submitEIResponse.

SCHEMA — verify column names:
- Read the wiki_articles table columns: article_id, title, slug, content, status, ale_tests_you, updated_note, subject_label, difficulty_label, reviewed_by, reviewer_comments, created_at, updated_at
- Read the questions table columns: question_id, topic_id, text, options (JSONB), correct_option_id, rationale, explanation, code_citation, difficulty, difficulty_rating, discrimination_rating, prompt_image_url, model_id, is_assessment, application_context, practice_context, created_at, updated_at
- Read the wiki_article_taxonomy junction: article_id, node_id, is_primary
- Read the wiki_ei_prompts table: prompt_id, article_id, node_id, insert_after_heading, prompt_text, reveal_text, options, sort_order, is_active, status, reviewed_by, reviewed_at, reviewer_notes, created_at, updated_at

DESIGN SYSTEM:
- src/app/globals.css — CSS variables and Campfire tokens
- CLAUDE.md — Project conventions

---

CRITICAL RULES:

1. THE UX PLAN IS LAW. UNIFIED-CONTENT-EDITOR-UX-PLAN.md defines every interaction, every state, every edge case. Do not deviate. If something in the technical plan contradicts the UX plan, the UX plan wins.

2. REUSE AdminMDXEditor. Import it from src/components/admin/AdminMDXEditor.tsx (or via AdminMDXEditorLoader.tsx for dynamic import). Do NOT fork it. Do NOT rebuild CodeMirror. Wrap it in the ArticlePanel component as the UX plan describes.

3. USE EXISTING COMPONENTS. Every Button, Badge, Card, Input, Select, Dialog, Tabs, Tooltip, Skeleton, EmptyState, SectionHeader, SearchInput, TaxonomyPicker comes from src/components/ui/ or src/components/shared/. Search the directory before creating anything.

4. THE DATA JOIN IS THROUGH TAXONOMY. Articles and questions connect via wiki_article_taxonomy → taxonomy_tree ← questions. There is NO article_id column on the questions table. The query is:
   SELECT q.* FROM questions q
   JOIN wiki_article_taxonomy wat ON q.topic_id = wat.node_id
   WHERE wat.article_id = :article_id

5. CREATE NEW COMPONENTS IN src/components/admin/unified-editor/. The UX plan specifies these files:
   - UnifiedContentEditor.tsx — Root client component, three-column layout
   - DirtyStateProvider.tsx — Context for tracking unsaved changes (exact interface in UX plan Section "Dirty State Provider")
   - ContentBar.tsx — Sticky top bar with title, status, save all
   - OutlinePanel.tsx — Left 200px column with headings + question counts
   - ArticlePanel.tsx — Center ~55% with Editor/Preview/Diff tabs wrapping AdminMDXEditor
   - QuestionsPanel.tsx — Right ~45% with Questions/EI Prompts tabs
   - QuestionCard.tsx — Collapsed + expanded states (exact specs in UX plan Section "Component 4")
   - QuestionInlineEditor.tsx — All 17 fields in Core/Details/Metadata groups
   - EIPromptsPanel.tsx — EI prompt list
   - EIPromptCard.tsx — Individual EI prompt editor with heading validation
   - SaveAllBar.tsx — Save summary + error panel for partial failures
   - index.ts — Re-exports

6. CREATE NEW SERVER ACTIONS IN src/lib/actions/admin/content.ts:
   - getArticleTaxonomyNodes(articleId) — SELECT node_id, is_primary FROM wiki_article_taxonomy WHERE article_id = :articleId
   - getQuestionsByNodeIds(nodeIds) — SELECT * FROM questions WHERE topic_id = ANY(:nodeIds) ORDER BY created_at DESC
   - getTaxonomyNodeInfo(nodeId) — SELECT node_id, name, ale_id, level FROM taxonomy_tree WHERE node_id = :nodeId
   Also check if updateQuestion(id, data) already exists. If not, create it following the pattern in questions.ts.

7. SAVE ALL uses Promise.allSettled (NOT Promise.all). The UX plan Section "Component 6: Save All System" defines the exact flow: parallel execution, partial failure handling, per-item error reporting, retry button.

8. DIRTY STATE is tracked per-item via React context. The UX plan defines the exact TypeScript interface. Implement it exactly as specified.

9. QUESTION EDITOR must support 4 options (matching createQuestion validation). The existing QuestionEditor uses 5 — do NOT copy that bug. The unified editor uses 4 options with A/B/C/D labels.

10. DO NOT use native alert(), confirm(), or prompt(). The audit flagged this as a known issue. Use the existing Dialog component from src/components/ui/ for all confirmations and error displays.

11. beforeunload warning must fire when isAnythingDirty is true. Test on: browser back, sidebar nav, tab close, page refresh.

12. Independent error boundaries per panel. Article panel error must NOT crash questions panel. The UX plan shows the exact error UI.

---

ROUTE:

Create /admin/content/[id]/page.tsx as a Server Component:
- Auth: canManageContent() guard
- Fetch: article, taxonomy nodes, questions (via node join), EI prompts
- Pass all data to UnifiedContentEditor client component
- Handle notFound() for invalid article IDs

Also create /admin/content/new/page.tsx for new articles:
- Empty editor, no questions panel until first save + taxonomy link
- After save, router.replace to /admin/content/[new_id]

Add navigation entry points (from UX plan Section "Navigation Entry Points"):
- Article list: "Edit with Questions →" button per row
- Question list: "View in context →" link per question
- Admin sidebar: "Content Editor" item under Content group

---

EXECUTION:

Follow the 7 phases from UNIFIED-CONTENT-EDITOR.md:

Phase 1 — Route + data layer + shell with three columns at correct proportions
Phase 2 — Article panel wrapping AdminMDXEditor + Diff tab
Phase 3 — Questions panel (collapsed/expanded cards, all 17 fields, Core/Details/Metadata groups)
Phase 4 — EI prompts tab with heading validation
Phase 5 — Save All system with dirty state tracking + partial failure handling
Phase 6 — Outline panel with click-to-scroll + question count badges
Phase 7 — Polish: beforeunload, loading states, error boundaries, keyboard shortcuts (⌘S, Escape, ⌘K)

For each phase:
1. Build what the UX plan describes
2. Use ONLY existing components
3. Run bun run build
4. Do not proceed if build fails
5. Commit: feat: unified editor phase N — [description]

Start Phase 1 now.
```
