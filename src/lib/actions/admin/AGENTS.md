<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# actions/admin

## Purpose

Admin-only server actions for content management, user role administration, and dashboard analytics. All mutations require role authorization via `canManageContent()` or `canManageUsers()` before execution. Uses `createAdminClient()` (service role) for privileged writes and `createClient()` for authenticated reads.

## Key Files

| File | Description |
|------|-------------|
| **assets.ts** | 3D model asset CRUD: `getAssets()`, `getAsset(id)`, upload, update, delete. Reads from `models_3d` table. |
| **bulk.ts** | Bulk delete operations: `bulkDeleteQuestions(ids)`, `bulkDeleteArticles(ids)`. Revalidates admin paths after deletion. |
| **content.ts** | MDX preview compilation via `next-mdx-remote`, content index page query, article listing with metadata. |
| **coverage.ts** | Taxonomy coverage analysis: maps taxonomy nodes to question counts and article presence. Exports `CoverageCellData` and `CoverageLevel` types. |
| **dashboard.ts** | Admin dashboard stats: `getAdminStats()` (question/wiki/asset counts), `getAdminDashboardData()` (full dashboard with audit logs). |
| **pipeline.ts** | Article publishing pipeline: `getPipelineArticles()`, `updateArticleStatus()` (draft/review/published transitions). |
| **question-queries.ts** | Question library queries: `getQuestions()`, `getQuestionsForAnalytics()`. Ensures `options` is always an array. |
| **questions.ts** | Question mutations: `deleteQuestions(ids)`, create/update questions with Zod validation. Uses admin client for writes. |
| **roles.ts** | User role management: `getAdminUsers()`, `assignRole()`, `removeRole()`. Requires `canManageUsers()` (super_admin only). |
| **taxonomy.ts** | Taxonomy node CRUD: `getTaxonomyNodes()`, `updateTaxonomyNode()`. Zod-validated name updates. |
| **wiki-queries.ts** | Wiki article queries with coverage: `getArticlesWithCoverage()` joins articles with taxonomy mappings and question counts. |
| **wiki.ts** | Wiki article mutations: `updateWikiArticle()`, `createWikiArticle()`, `deleteWikiArticle()`. Zod-validated, audit-logged. |

## For AI Agents

### Working In This Directory

1. **Authorization is mandatory.** Every mutation must call `canManageContent()` or `canManageUsers()` before DB writes.
2. **Use `createAdminClient()`** for privileged writes (service role key). Use `createClient()` for authenticated reads.
3. **Revalidate paths** after mutations: `revalidatePath('/admin/questions')`, `revalidatePath('/admin/content')`, etc.
4. **Zod validation** before any insert/update. Parse with `.safeParse()` and return structured errors.
5. **Coverage queries** are read-only (no `'use server'` needed for pure query files like `coverage.ts`, `question-queries.ts`, `wiki-queries.ts`).

### Common Patterns

**Authorized mutation:**
```typescript
'use server'

import { canManageContent } from '@/lib/admin/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export const myAdminAction = async (id: string) => {
  const authorized = await canManageContent()
  if (!authorized) return { error: 'Unauthorized' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('table_name')
    .update({ field: 'value' })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { error: null }
}
```

## Dependencies

### Internal

- `@/lib/admin/roles` -- `canManageContent()`, `canManageUsers()` authorization checks
- `@/lib/supabase/server` -- `createClient()` for authenticated reads
- `@/lib/supabase/admin` -- `createAdminClient()` for service-role writes
- `@/lib/audit/audit-queries` -- `AuditLog` type for dashboard data
- `@/types/ceo` -- shared types

### External

- `next/cache` -- `revalidatePath`
- `next-mdx-remote/serialize` -- MDX compilation (content.ts)
- `remark-gfm` -- GitHub-flavored markdown
- `zod` -- input validation
