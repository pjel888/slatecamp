<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-31 -->

# admin

## Purpose

Admin control room for content and system management. Gated by role check (`canReviewContent()`). Admins manage the entire knowledge lifecycle: creating/editing/deleting wiki articles and questions, managing taxonomy, reviewing content submissions, and auditing system activity.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Admin landing page. Public, unauthenticated. Google OAuth sign-in button. |
| `layout.tsx` | Admin layout wrapper. Protects all routes except `/admin` root. Checks `canReviewContent()`. Renders the `AdminShell` with sidebar nav. |
| `_components/AdminShell.tsx` | Centralized sidebar navigation and layout shell for all admin portals. |

## Subdirectories (Knowledge Hub)

| Directory | Purpose |
|-----------|---------|
| `knowledge/` | **The Unified Knowledge Base.** Central hub for all content management. Consolidates legacy "Articles" and "Questions" silos. |
| `knowledge/[id]/` | **Unified Content Editor.** Integrated split-pane MDX editor for wiki articles, showing linked questions and metadata side-by-side. |
| `knowledge/questions/` | **Question Bank.** Unified view of the assessment bank, utilizing the same taxonomy-driven browser as the main knowledge hub. |
| `knowledge/questions/[id]/` | **Context-Aware Question Editor.** Moderation interface for questions that automatically loads the linked source article in a reference pane. |
| `knowledge/new/` | Creation flow for new wiki articles. |
| `knowledge/questions/new/` | Creation flow for new questions, pre-loading article context if a topic is provided. |

## Subdirectories (Management)

| Directory | Purpose |
|-----------|---------|
| `dashboard/` | High-level overview. Stats (questions, wiki, coverage gaps), quick actions, and recent activity feed. |
| `taxonomy/` | Global taxonomy management. View/edit the discipline tree structure and ALE IDs. |
| `reviews/` | SME Review Queue. Content submitted for approval, deep-linked to unified editors. |
| `audit/` | Audit Log. Deep-linked history of every change made to the knowledge base. |
| `assets/` | 3D Asset Management. Catalog and preview models used in the 3D Lab scenes. |

## For AI Agents

### Working In This Directory

- **Unified Architecture**: Do NOT use legacy `/admin/articles` or `/admin/questions` for new features. Use `/admin/knowledge`.
- **Taxonomy First**: All content (articles and questions) is filtered via the global taxonomy tree.
- **Context-Awareness**: When editing a question, always provide the source article context. When editing an article, show the linked questions.
- **Data Revalidation**: Always call `revalidatePath('/admin/knowledge')` after any mutation to ensure cache consistency.

### Common Patterns

- **Deep Linking**: Audit logs and Review items must link to `/admin/knowledge/[id]` or `/admin/knowledge/questions/[id]`.
- **Hybrid Search**: The Knowledge Browser search filters both articles and questions simultaneously.
- **Safety Net**: Use the "Unassigned" filter in the knowledge hub to find content not yet mapped to the taxonomy.

## Dependencies

### Internal

- `@/lib/admin/roles` — `canReviewContent()` for authorization.
- `@/lib/actions/admin/content` — Primary server actions for the unified Knowledge Base.
- `@/components/admin/unified-editor/` — The core component library for the split-pane editing experience.
- `@/app/admin/knowledge/questions/_components/QuestionsTableClient` — The unified question listing component.

<!-- MANUAL: All legacy routes (/admin/articles, /admin/content, /admin/questions) now redirect to /admin/knowledge. -->
