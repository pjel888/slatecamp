# Admin Feature Inventory

**Last Updated:** 2026-04-27

## Legend

| Status | Meaning |
|--------|---------|
| Complete | Implemented and functional |
| Partial | Core exists but has known gaps |
| Stubbed | Surface exists but logic is incomplete |
| Unknown | Cannot verify from code |

| Risk | Meaning |
|------|---------|
| Critical | Security or data integrity risk |
| High | Significant functional or UX risk |
| Medium | Moderate risk |
| Low | Minor risk |

---

## 1. Dashboard

| Field | Detail |
|-------|--------|
| **Feature** | Admin Dashboard |
| **Purpose** | Operational overview: stats, coverage alerts, quick actions, recent activity |
| **Route** | `/admin` |
| **Components** | `NeedsAttentionCard`, `StatCard`, `DashboardMetricCard`, `SubjectDistributionBar`, `ActionCard`, `EventBadge` |
| **Data** | `getAdminDashboardData()`, `getContentBySubject()`, `getCriticalCoverageGap()`, `getNeedsAttentionData()` |
| **Actions** | `src/lib/actions/admin/dashboard.ts` |
| **Auth** | `canReviewContent()` (layout) |
| **Status** | Complete |
| **Evidence** | `src/app/admin/page.tsx`, `src/lib/actions/admin/dashboard.ts` |
| **Risk** | Low |
| **Notes** | Dashboard data is cached with `unstable_cache`. Recent activity shows `actor_id` initials (may show UUID initials like "55"). |

## 2. Knowledge Browser

| Field | Detail |
|-------|--------|
| **Feature** | Knowledge Browser |
| **Purpose** | Browse all wiki articles and taxonomy tree |
| **Route** | `/admin/knowledge` |
| **Components** | `ContentEditorIndex` |
| **Data** | `getContentEditorIndexData()` |
| **Actions** | `src/lib/actions/admin/content.ts` |
| **Auth** | `canManageContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/knowledge/page.tsx` |
| **Risk** | Low |

## 3. Article Editor (Unified Editor)

| Field | Detail |
|-------|--------|
| **Feature** | Article Editor |
| **Purpose** | Full-bleed editor for wiki articles with taxonomy linking, EI prompts, questions |
| **Route** | `/admin/knowledge/[id]` |
| **Components** | `UnifiedContentEditor`, `ArticleDetailClient`, `ArticlePanel`, `QuestionsPanel`, `OutlinePanel`, `EIPromptsPanel`, `SaveAllBar`, `DirtyStateProvider` |
| **Data** | `getArticleFull()`, `getArticleTaxonomyNodes()`, `getAllEIPromptsForArticle()`, `getQuestionsByArticleId()`, `getTaxonomyNodesInfo()` |
| **Actions** | `src/lib/actions/admin/content.ts`, `src/lib/actions/admin/wiki.ts` |
| **Auth** | `canManageContent() \|\| canReviewContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/knowledge/[id]/page.tsx`, `src/components/admin/unified-editor/` |
| **Risk** | Medium |
| **Notes** | Reviewers see read-only view. Autosave every 10s. Concurrent-edit conflict warning. `DirtyStateProvider` updates `document.title` during render (side effect). |

## 4. Create Article

| Field | Detail |
|-------|--------|
| **Feature** | Create Article |
| **Purpose** | New article with full-bleed unified editor |
| **Route** | `/admin/knowledge/new` |
| **Components** | `UnifiedContentEditor`, `Breadcrumb` |
| **Data** | Taxonomy nodes from Supabase |
| **Actions** | None directly (client-side editor saves) |
| **Auth** | `canManageContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/knowledge/new/page.tsx` |
| **Risk** | Low |

## 5. Question Bank

| Field | Detail |
|-------|--------|
| **Feature** | Question Bank |
| **Purpose** | Browse questions grouped by article with pagination |
| **Route** | `/admin/knowledge/questions` |
| **Components** | `QuestionsTableClient`, `ContentEditorIndex` |
| **Data** | `getContentEditorIndexData()`, `getQuestionsGroupedByArticle()` |
| **Actions** | `src/lib/actions/admin/content.ts`, `src/lib/actions/admin/question-queries.ts` |
| **Auth** | `canManageContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/knowledge/questions/page.tsx` |
| **Risk** | Medium |
| **Notes** | Fixed 300px taxonomy tree sidebar, no mobile collapse. |

## 6. Question Editor

| Field | Detail |
|-------|--------|
| **Feature** | Question Editor |
| **Purpose** | Edit standard questions with article context sidebar |
| **Route** | `/admin/knowledge/questions/[id]` |
| **Components** | `QuestionEditor`, `ArticlePreview` |
| **Data** | `getQuestion()`, `getArticleFull()` |
| **Actions** | `src/lib/actions/admin/question-queries.ts`, `src/lib/actions/admin/content.ts` |
| **Auth** | `canManageContent() \|\| canReviewContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/knowledge/questions/[id]/page.tsx` |
| **Risk** | Low |

## 7. Create Question

| Field | Detail |
|-------|--------|
| **Feature** | Create Question |
| **Purpose** | Create new standard question |
| **Route** | `/admin/knowledge/questions/new` |
| **Components** | `QuestionEditor`, `Breadcrumb` |
| **Data** | Taxonomy nodes, primary article mappings |
| **Actions** | `src/lib/actions/admin/content.ts` |
| **Auth** | `canManageContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/knowledge/questions/new/page.tsx` |
| **Risk** | Low |

## 8. Design Problem Bank

| Field | Detail |
|-------|--------|
| **Feature** | Design Problem Bank |
| **Purpose** | List all architectural design problems |
| **Route** | `/admin/knowledge/questions/design-problems` |
| **Components** | `Card`, `Button` |
| **Data** | `getAdminDesignProblems()` |
| **Actions** | `src/lib/actions/admin/design-problems.ts` |
| **Auth** | `canManageContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/knowledge/questions/design-problems/page.tsx` |
| **Risk** | Low |

## 9. Design Problem Editor

| Field | Detail |
|-------|--------|
| **Feature** | Design Problem Editor |
| **Purpose** | Edit questions within a design problem |
| **Route** | `/admin/knowledge/questions/design-problems/[id]` |
| **Components** | `DesignProblemEditor` |
| **Data** | `getAdminDesignProblem()` |
| **Actions** | `src/lib/actions/admin/design-problems.ts` |
| **Auth** | `canManageContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/knowledge/questions/design-problems/[id]/page.tsx` |
| **Risk** | Low |

## 10. Scenario Question Bank

| Field | Detail |
|-------|--------|
| **Feature** | Scenario Question Bank |
| **Purpose** | List all design scenarios |
| **Route** | `/admin/knowledge/questions/scenarios` |
| **Components** | `Card`, `Button` |
| **Data** | `getAdminDesignScenarios()` |
| **Actions** | `src/lib/actions/admin/design-scenarios.ts` |
| **Auth** | `canManageContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/knowledge/questions/scenarios/page.tsx` |
| **Risk** | Low |

## 11. Scenario Editor

| Field | Detail |
|-------|--------|
| **Feature** | Scenario Editor |
| **Purpose** | Edit questions within a design scenario |
| **Route** | `/admin/knowledge/questions/scenarios/[id]` |
| **Components** | `DesignScenarioEditor` |
| **Data** | `getAdminDesignScenario()` |
| **Actions** | `src/lib/actions/admin/design-scenarios.ts` |
| **Auth** | `canManageContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/knowledge/questions/scenarios/[id]/page.tsx` |
| **Risk** | Low |

## 12. Quality Analytics

| Field | Detail |
|-------|--------|
| **Feature** | Quality Analytics |
| **Purpose** | Question bank quality metrics: rationale/citation coverage, difficulty distribution |
| **Route** | `/admin/knowledge/analytics` |
| **Components** | `StatCard`, `DashboardMetricCard`, `CoverageProgress`, `Breadcrumb` |
| **Data** | `getQuestionsForAnalytics()` |
| **Actions** | `src/lib/actions/admin/question-queries.ts` |
| **Auth** | Implicit via layout |
| **Status** | Complete |
| **Evidence** | `src/app/admin/knowledge/analytics/page.tsx` |
| **Risk** | Low |

## 13. Bulk Question Import

| Field | Detail |
|-------|--------|
| **Feature** | Bulk Question Import |
| **Purpose** | Import questions from CSV/JSON |
| **Route** | `/admin/knowledge/import` |
| **Components** | `QuestionImporter`, `Breadcrumb` |
| **Data** | None |
| **Actions** | None directly (importer handles client-side) |
| **Auth** | `canManageContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/knowledge/import/page.tsx` |
| **Risk** | Low |
| **Notes** | Error table caps at 10 rows with no expand. Template download buttons are plain `<button>`s. |

## 14. Publishing Pipeline

| Field | Detail |
|-------|--------|
| **Feature** | Publishing Pipeline |
| **Purpose** | Kanban board tracking articles through draft → in_review → approved → published |
| **Route** | `/admin/pipeline` |
| **Components** | `PipelineClient`, `PipelineCard`, `SectionHeader` |
| **Data** | `getPipelineArticles()` |
| **Actions** | `src/lib/actions/admin/pipeline.ts` |
| **Auth** | Implicit via layout |
| **Status** | Complete |
| **Evidence** | `src/app/admin/pipeline/page.tsx` |
| **Risk** | Low |
| **Notes** | Confirm dialog for publish action. Optimistic updates with `useTransition`. |

## 15. SME Review Queue

| Field | Detail |
|-------|--------|
| **Feature** | SME Review Queue |
| **Purpose** | Queue for SME validation and routing articles to publication |
| **Route** | `/admin/reviews` |
| **Components** | `SMEReviewQueue` |
| **Data** | None directly (client component handles it) |
| **Actions** | None directly |
| **Auth** | Implicit via layout |
| **Status** | Partial |
| **Evidence** | `src/app/admin/reviews/page.tsx` |
| **Risk** | Medium |
| **Notes** | No skeleton — just text "Loading review queue...". Missing empty state illustration. |

## 16. Content Search

| Field | Detail |
|-------|--------|
| **Feature** | Content Search |
| **Purpose** | Global search across questions, articles, and taxonomy nodes |
| **Route** | `/admin/search` |
| **Components** | `ContentSearchClient` |
| **Data** | Client-side Supabase queries |
| **Actions** | None |
| **Auth** | Implicit via layout |
| **Status** | Partial |
| **Evidence** | `src/app/admin/search/page.tsx` |
| **Risk** | High |
| **Notes** | No pagination (hard 20-item limit). `ilike` with `%term%` will be slow at scale. No highlighting of matched terms. |

## 17. Taxonomy Editor

| Field | Detail |
|-------|--------|
| **Feature** | Taxonomy Editor |
| **Purpose** | Manage discipline → subject → topic hierarchy |
| **Route** | `/admin/taxonomy` |
| **Components** | `TaxonomyEditor` |
| **Data** | `getTaxonomyNodes()` |
| **Actions** | `src/lib/actions/admin/taxonomy.ts` |
| **Auth** | Implicit via layout |
| **Status** | Complete |
| **Evidence** | `src/app/admin/taxonomy/page.tsx` |
| **Risk** | Low |
| **Notes** | Lacks ARIA tree semantics. Delete uses optimistic UI with rollback. |

## 18. Coverage Map

| Field | Detail |
|-------|--------|
| **Feature** | Coverage Map |
| **Purpose** | Visual heatmap of content coverage per taxonomy node |
| **Route** | `/admin/taxonomy/coverage` |
| **Components** | `StatCard`, `Card`, `EmptyState`, `SectionHeader` |
| **Data** | `fetchCoverageData()` |
| **Actions** | `src/lib/actions/admin/coverage.ts` |
| **Auth** | Implicit via layout |
| **Status** | Complete |
| **Evidence** | `src/app/admin/taxonomy/coverage/page.tsx` |
| **Risk** | Low |

## 19. 3D Asset Manager

| Field | Detail |
|-------|--------|
| **Feature** | 3D Asset Manager |
| **Purpose** | Upload and manage 3D model files |
| **Route** | `/admin/assets` |
| **Components** | `AssetList`, `AssetUploader` |
| **Data** | `getAssets()` |
| **Actions** | `src/lib/actions/admin/assets.ts` |
| **Auth** | Implicit via layout |
| **Status** | Complete |
| **Evidence** | `src/app/admin/assets/page.tsx` |
| **Risk** | Low |
| **Notes** | `AssetList` search input has no `<label>`. No empty state component. |

## 20. Asset Detail

| Field | Detail |
|-------|--------|
| **Feature** | Asset Detail |
| **Purpose** | View individual 3D asset metadata |
| **Route** | `/admin/assets/[id]` |
| **Components** | `AssetDetailView`, `Breadcrumb` |
| **Data** | `getAsset(id)` |
| **Actions** | `src/lib/actions/admin/assets.ts` |
| **Auth** | `canManageContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/assets/[id]/page.tsx` |
| **Risk** | Low |

## 21. 3D Models Registry

| Field | Detail |
|-------|--------|
| **Feature** | 3D Models Registry |
| **Purpose** | Browse all registered 3D Lab modules by subject/category |
| **Route** | `/admin/3d-models` |
| **Components** | `ModelRegistryPage`, `ModelRegistryTree`, `ModelConfigDetail` |
| **Data** | Static config (client-side tree) |
| **Actions** | None |
| **Auth** | `canReviewContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/3d-models/page.tsx` |
| **Risk** | Low |

## 22. Audit Log

| Field | Detail |
|-------|--------|
| **Feature** | Audit Log |
| **Purpose** | View all admin actions (super admin only) |
| **Route** | `/admin/audit` |
| **Components** | `AuditLogViewer` |
| **Data** | None directly (client component) |
| **Actions** | None |
| **Auth** | `isSuperAdmin()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/audit/page.tsx` |
| **Risk** | Medium |
| **Notes** | No `aria-expanded` on expandable rows. Search is client-side filter only. Hard limit 100 rows. No pagination. |

## 23. Activity Feed

| Field | Detail |
|-------|--------|
| **Feature** | Activity Feed |
| **Purpose** | Recent audit logs across the platform (last 50 entries) |
| **Route** | `/admin/activity` |
| **Components** | `EventBadge`, `EmptyState`, `Card`, `SectionHeader` |
| **Data** | Direct Supabase query to `audit_logs` |
| **Actions** | None |
| **Auth** | `isAdmin()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/activity/page.tsx` |
| **Risk** | Low |
| **Notes** | Last 50 entries only. No pagination. |

## 24. Draft Preview

| Field | Detail |
|-------|--------|
| **Feature** | Draft Preview |
| **Purpose** | Replicates student wiki view for unsaved editor drafts |
| **Route** | `/admin/preview/[previewId]` |
| **Components** | `WikiArticle`, `WikiHeader`, `WikiRightSidebar`, `TeachBackPrompt` |
| **Data** | `admin_draft_previews`, article metadata, taxonomy mappings |
| **Actions** | `src/lib/actions/admin/ei-prompts.ts`, `src/lib/actions/admin/teach-back.ts` |
| **Auth** | `canManageContent() \|\| canReviewContent()` |
| **Status** | Complete |
| **Evidence** | `src/app/admin/preview/[previewId]/page.tsx` |
| **Risk** | Low |
| **Notes** | No loading.tsx (intentional). AdminShell chrome is bypassed. |

## 25. Admin Settings / Role Manager

| Field | Detail |
|-------|--------|
| **Feature** | Admin Settings / Role Manager |
| **Purpose** | Manage admin user roles and permissions |
| **Route** | `/admin/settings` |
| **Components** | `AdminRoleManager`, `RoleSelect`, `SectionHeader` |
| **Data** | `getAdminUsers()` |
| **Actions** | `src/lib/actions/admin/roles.ts` |
| **Auth** | `isSuperAdmin()` |
| **Status** | Partial |
| **Evidence** | `src/app/admin/settings/page.tsx` |
| **Risk** | High |
| **Notes** | Super-admin only. CEO cannot access. No audit log for role changes. Falls back to `profiles.role` if `user_roles` is unavailable. |

## Evidence

- All routes: `src/app/admin/`
- All actions: `src/lib/actions/admin/`
- All components: `src/components/admin/`
- Admin shell: `src/app/admin/_components/AdminShell.tsx`
- Role helpers: `src/lib/admin/roles.ts`
