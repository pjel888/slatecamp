<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# admin

## Purpose

Admin panel UI components for content management: MDX article editing, question editing, taxonomy navigation, wiki article curation, asset uploads, audit logging, SME review queues, and unified content editing. Uses the PortalLayout shell from `@/components/portal`. All client-side forms with Supabase integrations via server actions.

## Key Files

| File | Description |
|------|-------------|
| `AdminMDXEditor.tsx` | Rich MDX editor for wiki articles with live preview, formatting toolbar, and component insertion. `'use client'` |
| `AdminMDXEditorLoader.tsx` | Lazy loader/suspense boundary for AdminMDXEditor (heavy dependency). |
| `ApproveDialog.tsx` | Confirmation dialog for approving content (questions, articles) in review queue. `'use client'` |
| `ArticlePreviewTab.tsx` | Preview tab showing rendered article output alongside editor. `'use client'` |
| `ArticlePropertiesPanel.tsx` | Side panel for article metadata: title, slug, discipline, status, tags, SEO fields. `'use client'` |
| `AssetDetailView.tsx` | Detailed view of a single asset: preview, metadata, usage references, delete action. `'use client'` |
| `AssetList.tsx` | Gallery of uploaded assets: thumbnail preview, file size, upload date, delete action. Filter by type. `'use client'` |
| `AssetUploader.tsx` | File upload component for GLB/FBX 3D models and images. Progress tracking, storage bucket selection, file size validation. `'use client'` |
| `AuditLogViewer.tsx` | Read-only table of user actions: who changed what, when, old to new values. Filter by user/table/date range. `'use client'` |
| `BulkActionBar.tsx` | Floating action bar for bulk operations on selected items (approve, reject, delete). `'use client'` |
| `ComponentToolbar.tsx` | Toolbar for inserting MDX components (callouts, formulas, widgets) into the editor. `'use client'` |
| `NeedsAttentionCard.tsx` | Dashboard card highlighting items needing review or action. |
| `QuestionEditor.tsx` | Multi-field form: question text, topic dropdown, options (5 default), correct answer selector, difficulty slider, rationale textarea. `'use client'` |
| `QuestionImporter.tsx` | CSV/JSON upload dialog. Validates headers, batch inserts questions. Shows progress bar and error summary. `'use client'` |
| `QuestionPreviewPanel.tsx` | Live preview of question as it would appear in quiz context. `'use client'` |
| `QuestionQualityBadges.tsx` | Quality indicator badges for questions (reviewed, needs-work, approved). |
| `QuestionQuickPreview.tsx` | Compact inline question preview for list views. |
| `RequestChangesDialog.tsx` | Dialog for requesting changes on reviewed content with comment field. `'use client'` |
| `SMEReviewQueue.tsx` | Workflow for SME approvals: pending questions/articles grouped by status. Approve/reject with comment. `'use client'` |
| `TaxonomyEditor.tsx` | Hierarchical tree view: expand/collapse nodes, rename, add child, delete. `'use client'` |

## Subdirectories

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `preview/` | Mode-specific article preview renderers | 2 files |
| `settings/` | Admin settings components | 1 file |
| `unified-editor/` | Unified content editor system (article + questions + EI prompts in one view) | 12 files |

### preview/

| File | Description |
|------|-------------|
| `CampModePreview.tsx` | Article preview rendered in Camp mode styling. `'use client'` |
| `StormModePreview.tsx` | Article preview rendered in Storm mode styling. `'use client'` |

### settings/

| File | Description |
|------|-------------|
| `RoleSelect.tsx` | Role selection dropdown for admin user management. `'use client'` |

### unified-editor/

| File | Description |
|------|-------------|
| `UnifiedContentEditor.tsx` | Main unified editor shell: manages panels (article, questions, EI prompts, outline) in a resizable layout. `'use client'` |
| `ContentEditorIndex.tsx` | Entry point/index for the unified editor. Orchestrates data loading and panel state. `'use client'` |
| `ArticlePanel.tsx` | Article editing panel within unified editor. `'use client'` |
| `QuestionsPanel.tsx` | Questions editing panel within unified editor. `'use client'` |
| `EIPromptsPanel.tsx` | Elaborative Interrogation prompts panel within unified editor. `'use client'` |
| `OutlinePanel.tsx` | Article outline/TOC panel within unified editor. `'use client'` |
| `ContentBar.tsx` | Top content bar with article selector and navigation within unified editor. `'use client'` |
| `SaveAllBar.tsx` | Save status bar: tracks dirty state across all panels, save-all action. `'use client'` |
| `DirtyStateProvider.tsx` | Context provider tracking unsaved changes across unified editor panels. `'use client'` |
| `PanelErrorBoundary.tsx` | Error boundary wrapper for individual panels to prevent full editor crash. `'use client'` |
| `types.ts` | TypeScript interfaces for unified editor (panel config, dirty state, etc.). |
| `index.ts` | Barrel exports for unified editor components. |

## For AI Agents

### Working In This Directory

1. **Portal layout.** The admin panel uses `PortalLayout` from `@/components/portal` as its shell. Admin-specific nav items and accent colors are configured in `src/app/admin/layout.tsx`.

2. **Server actions.** Database operations use server actions from `@/lib/actions/admin/` (assets, coverage, dashboard, wiki-queries, bulk). Do NOT use Supabase client directly in components.

3. **Unified editor architecture.** The unified-editor/ subdirectory is a self-contained editing system. `DirtyStateProvider` wraps all panels and tracks unsaved changes. `SaveAllBar` aggregates dirty state. `PanelErrorBoundary` isolates panel errors. Edit these components as a unit.

4. **Error handling.** Wrap server action calls in try/catch. Show user-facing error messages via toast or in-form feedback. Log errors to console for debugging.

5. **Form state.** Use React `useState` for form fields. Debounce onChange if making real-time API calls. Disable submit while saving.

6. **Type safety.** Define interfaces for Supabase table shapes (Question, TaxonomyNode, WikiArticle). Use TypeScript strict mode.

7. **No custom styling.** Use Slatecamp tokens and shadcn/ui components (Button, Input, Textarea, Dialog, Card).

8. **Accessibility.** Label all form inputs. Use semantic HTML (form, fieldset, legend). Test with keyboard navigation.

### Common Patterns

**Server action fetch + state:**
```tsx
const [items, setItems] = useState<Question[]>([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  const fetch = async () => {
    setLoading(true)
    try {
      const data = await getQuestions()
      setItems(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  fetch()
}, [])
```

**Form submission with validation:**
```tsx
const handleSave = async () => {
  if (!text.trim() || !topicId) {
    alert('Please fill required fields')
    return
  }
  setIsSaving(true)
  try {
    await upsertQuestion({ id, text, topic_id: topicId, ... })
    // Success feedback
  } finally {
    setIsSaving(false)
  }
}
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/actions/admin/*` | Server actions: assets, coverage, dashboard, wiki-queries, bulk |
| `@/components/portal` | PortalLayout shell (consumed by admin layout.tsx) |
| `@/components/ui/*` | Button, Input, Textarea, Dialog, Card, Badge, Checkbox, Resizable |
| `@/lib/utils` | cn() for conditional classes |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | Hooks: useState, useEffect, useCallback, useContext | ^19.2.4 |
| **next** | useRouter, usePathname for navigation | 16.1.6 |
| **@phosphor-icons/react** | Icons: Plus, Trash, PencilSimple, etc. | ^1.4.14 |
| **lucide-react** | Icons in some admin components | ^0.577.0 |

<!-- MANUAL: -->
