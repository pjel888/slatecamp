<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# wiki

## Purpose

Wiki article lifecycle management with role-based review workflow. Handles article creation, status transitions (draft -> pending_review -> approved -> published), reviewer assignment, and content updates. Supports SME (Subject Matter Expert) review queue.

## Key Files

| File | Description |
|------|-------------|
| **wiki-actions.ts** | Server actions for wiki CRUD with review workflow: `createArticle()`, `updateArticle()`, `deleteArticle()`, `submitForReview()`, `approveArticle()`, `requestChanges()`, `publishArticle()`. Role-gated via `canReviewContent()` and `getUserRole()`. |

## For AI Agents

### Working In This Directory

1. **Review workflow.** Articles follow: `draft` -> `pending_review` -> `changes_requested` or `approved` -> `published` -> `archived`.
2. **Role gates.** Creating requires auth. Reviewing requires `canReviewContent()`. Status fields track `reviewed_by`, `reviewed_at`, `reviewer_comments`.
3. **Separate from admin wiki actions.** `@/lib/actions/admin/wiki.ts` handles admin-panel CRUD. This module handles the review workflow and SME queue.
4. **Article interface.** `WikiArticle` type includes `id`, `title`, `content`, `discipline_id`, `author_id`, `status`, review metadata, timestamps.

### Common Patterns

**Creating an article:**
```typescript
import { createArticle } from '@/lib/wiki/wiki-actions'

const result = await createArticle({
  title: 'Article Title',
  content: 'MDX content...',
  discipline_id: disciplineId,
})
```

## Dependencies

### Internal

- `@/lib/supabase/server` -- `createClient()` for DB access
- `@/lib/admin/roles` -- `canReviewContent()`, `getUserRole()` for authorization

### External

- `next/cache` -- `revalidatePath`
