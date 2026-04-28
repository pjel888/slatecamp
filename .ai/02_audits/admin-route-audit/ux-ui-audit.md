# UX/UI Audit

**Last Updated:** 2026-04-27

## Heuristic Review

### 1. Visibility of System Status

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| No `aria-live` regions for async updates (save, import, publish) | `UnifiedContentEditor`, `QuestionImporter`, `PipelineClient` | Medium | `src/components/admin/unified-editor/SaveAllBar.tsx`, `src/components/admin/QuestionImporter.tsx` |
| `SMEReviewQueue` shows plain text "Loading review queue..." with no skeleton | `SMEReviewQueue` | Medium | `src/components/admin/SMEReviewQueue.tsx` |
| `DirtyStateProvider` updates `document.title` during render (side effect in render path) | Unified Editor | Medium | `src/components/admin/unified-editor/DirtyStateProvider.tsx` |
| Activity list shows UUID initials (e.g., "55") instead of user names | Dashboard | Low | `src/app/admin/page.tsx` |

### 2. Match Between System and Real-World Admin Language

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| "Knowledge Base" vs "Wiki" terminology is inconsistent | Navigation, routes | Low | `src/app/admin/_components/AdminShell.tsx`, `src/app/admin/wiki/page.tsx` |
| "Pulse" vs "Activity" vs "Audit" — three different log-like concepts | Navigation | Low | `src/app/admin/_components/AdminShell.tsx` |

### 3. User Control and Freedom

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| `DeleteArticleModal` has no close button (`showCloseButton={false}`) | Article Editor | Medium | `src/components/admin/DeleteArticleModal.tsx` |
| `DirtyStateProvider` warns on `beforeunload` but uses browser default message | Unified Editor | Low | `src/components/admin/unified-editor/DirtyStateProvider.tsx` |

### 4. Consistency and Standards

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| Loading skeletons inconsistent — some use `Skeleton`, others custom `animate-pulse` | Multiple `loading.tsx` | Medium | `src/app/admin/dashboard/loading.tsx`, `src/app/admin/settings/loading.tsx` |
| Pagination inconsistent — some tables have it, others don't | `QuestionsTableClient` vs `ContentSearchClient` | Medium | `src/components/admin/QuestionsTableClient.tsx`, `src/app/admin/search/_components/ContentSearchClient.tsx` |
| `AssetList` search input is native `<input>` without label; other search inputs use `SearchInput` component | Asset Manager | Low | `src/components/admin/AssetList.tsx` |
| `QuestionQualityBadges` uses `✓`/`✗` symbols with no `aria-label` | Question Bank | Low | `src/components/admin/QuestionQualityBadges.tsx` |

### 5. Error Prevention

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| Pipeline publish action has confirm dialog — good | Pipeline | Informational | `src/app/admin/pipeline/_components/PipelineCard.tsx` |
| Bulk delete has confirm dialog — good | Question Bank | Informational | `src/components/admin/BulkActionBar.tsx` |
| `AdminRoleManager` has UUID pattern validation — good | Settings | Informational | `src/components/admin/settings/AdminRoleManager.tsx` |

### 6. Recognition Rather Than Recall

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| Command palette (`Cmd+K`) provides quick navigation — good | AdminShell | Informational | `src/app/admin/_components/AdminShell.tsx` |
| Sidebar search responds to `/` key — good | AdminShell | Informational | `src/app/admin/_components/AdminShell.tsx` |
| No keyboard shortcut documentation in Unified Editor | Unified Editor | Low | `src/components/admin/unified-editor/UnifiedContentEditor.tsx` |

### 7. Flexibility and Efficiency

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| `QuestionsTableClient` fixed 300px sidebar with no collapse — unusable on tablet | Question Bank | High | `src/components/admin/QuestionsTableClient.tsx` |
| Content Search has no pagination — hard 20-item limit | Search | High | `src/app/admin/search/_components/ContentSearchClient.tsx` |
| `AssetList` status filter uses unstyled `<select>` | Asset Manager | Low | `src/components/admin/AssetList.tsx` |

### 8. Minimalism

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| Admin dashboard has many cards and sections — may overwhelm new admins | Dashboard | Low | `src/app/admin/page.tsx` |
| AdminShell navigation has 6 groups with many nested items — dense | Navigation | Low | `src/app/admin/_components/AdminShell.tsx` |

### 9. Error Diagnosis and Recovery

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| Admin error boundary has "Try again" and "Back to Admin" — good | Error Boundary | Informational | `src/app/admin/error.tsx` |
| `PanelErrorBoundary` isolates panel crashes — good | Unified Editor | Informational | `src/components/admin/unified-editor/PanelErrorBoundary.tsx` |
| `SaveAllBar` shows offline detection and conflict warnings — excellent | Unified Editor | Informational | `src/components/admin/unified-editor/SaveAllBar.tsx` |

### 10. Help and Documentation

| Issue | Location | Severity | Evidence |
|-------|----------|----------|----------|
| No onboarding or guided tour for new admins | Admin surface | Medium | Not found |
| No inline help text for complex fields (e.g., Bloom level, IRT difficulty) | Question Editor | Low | `src/components/admin/QuestionEditor.tsx` |

---

## Navigation Review

### AdminShell Navigation Groups

| Group | Items | Notes |
|-------|-------|-------|
| Overview | Dashboard | — |
| Knowledge Base | Browser, Question Bank (All, Design Problems, Scenarios, Create New, Import, Quality Analytics) | Dense — 7 items under one group |
| Structure | Taxonomy (Tree Editor, Coverage Map), 3D Assets, 3D Models Registry | — |
| Quality | Review Queue, Publishing Pipeline, Content Search | — |
| Pulse | Audit Log, Pulse Feed | "Pulse Feed" = `/admin/activity`; naming inconsistency |
| Settings | Settings | Only one item — could be merged or expanded |

### Breadcrumbs
- Present on most pages via `Breadcrumb` component
- Good: consistent pattern

### Mobile Navigation
- `MobileNav` renders as `Sheet` (slide-out drawer) on `<lg`
- Desktop sidebar is `hidden lg:block`
- Good: responsive pattern exists

---

## Form and Table Review

### Tables

| Table | Sort | Filter | Pagination | Bulk Actions | Empty State | Notes |
|-------|------|--------|------------|--------------|-------------|-------|
| QuestionsTableClient | Yes | Yes (taxonomy tree) | Yes | Yes | No | Fixed 300px sidebar |
| AuditLogViewer | No | Yes (client-side) | No | No | No | Hard limit 100 |
| AdminRoleManager | No | No | No | No | Yes | Minimal table |
| AssetList | No | Yes (search, status) | No | No | No | Raw text empty state |
| PipelineClient | Yes (by title) | Yes (by status) | No | No | No | Kanban, not table |

### Forms

| Form | Validation | Confirmation | Error Feedback | Loading State | Notes |
|------|------------|--------------|----------------|---------------|-------|
| QuestionEditor | Yes (Zod) | For delete | Toast | Yes | Good |
| Article Editor | Yes | For delete | Toast + banner | Yes | Excellent (autosave, conflict detection) |
| TaxonomyEditor | Inline | For delete | Toast | Optimistic | Good |
| AssetUploader | Yes | No | Inline | Simulated progress | Good |
| QuestionImporter | Yes (CSV/JSON) | No | Error table (caps at 10) | Yes | Good |
| AdminRoleManager | UUID pattern | For revoke | Inline | No | Minimal |

---

## Modals and Drawers

| Modal/Drawer | Close Button | Focus Trap | Backdrop Click | Escape Key | Notes |
|--------------|--------------|------------|----------------|------------|-------|
| DeleteArticleModal | **No** | Yes (Dialog) | Yes | Yes | Missing close button |
| QuestionQuickPreview | Yes | No (Popover) | Yes | Yes | Not a dialog |
| ArticleQuestionImporter | Yes | Yes | Yes | Yes | Good |
| RoleAssignmentModal (CEO) | Yes | Yes | Yes | Yes | Good |
| Pipeline publish confirm | Yes | Yes | Yes | Yes | Good |

---

## Responsive Behavior

| Surface | < lg | lg+ | Critical Issue |
|---------|------|-----|----------------|
| Dashboard | 2-col stats | 4-col stats | No |
| QuestionsTableClient | Fixed 300px sidebar | Fixed 300px sidebar | **Yes — overflows** |
| Unified Editor | Stacks to 1-col, outline hidden | 3-col | No |
| QuestionEditor | Stacks at md | 2-col | No |
| AssetList | 1-col grid | 3-col grid | No |
| TaxonomyEditor | Indentation may overflow | Tree view | Minor |

---

## Severity-Ranked Recommendations

### Critical
1. **Add pagination to Content Search** — hard 20-item limit is a functional ceiling.
2. **Fix QuestionsTableClient mobile layout** — fixed 300px sidebar makes tablet use impossible.

### High
3. **Standardize loading skeletons** — use `Skeleton` component everywhere.
4. **Add empty state components** — `AssetList`, `AuditLogViewer`, `SMEReviewQueue` use raw text.
5. **Add keyboard shortcut docs to Unified Editor** — power users need discoverability.

### Medium
6. **Add close button to DeleteArticleModal**.
7. **Add skeleton to SMEReviewQueue**.
8. **Add `aria-live` regions for async actions**.
9. **Fix `DirtyStateProvider` render side effect**.
10. **Add inline help for complex fields** in Question Editor.

### Low
11. **Add `<label>` to AssetList search input**.
12. **Add `aria-label` to QuestionQualityBadges**.
13. **Rename "Pulse" to "Activity"** for consistency.
14. **Show user names instead of UUID initials** in dashboard activity.

## Evidence

- AdminShell: `src/app/admin/_components/AdminShell.tsx`
- Components: `src/components/admin/`
- Loading states: `src/app/admin/*/loading.tsx`
- Error boundary: `src/app/admin/error.tsx`
