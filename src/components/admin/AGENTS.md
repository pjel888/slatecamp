<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# admin

## Purpose

Admin panel UI components for content management: question editing, taxonomy navigation, wiki article curation, asset uploads, and audit logging. All client-side forms with Supabase integrations. Intended for SME (subject matter expert) review queues and content authors.

## Key Files

| File | Description |
|------|-------------|
| `AdminNav.tsx` | Navigation rail: Dashboard, Questions, Wiki, 3D Assets, Taxonomy, Audit Log, Reviews. Uses pathname-based active state. |
| `QuestionEditor.tsx` | Multi-field form: question text, topic dropdown, options (5 default), correct answer selector, difficulty slider (1–5), rationale textarea. Save/delete/cancel actions. |
| `QuestionList.tsx` | Paginated table of questions: filter by topic/status, sort by difficulty/created date. Click row to edit. |
| `QuestionImporter.tsx` | CSV/JSON upload dialog. Validates headers, batch inserts questions. Shows progress bar and error summary. |
| `TaxonomyEditor.tsx` | Hierarchical tree view: expand/collapse nodes, rename, add child, delete. Real-time Supabase sync. |
| `WikiEditor.tsx` | Rich text editor for wiki articles. Integrates TipTap for formatting (bold, code, headings). Citation link insertion. |
| `WikiArticleList.tsx` | Search/filter wiki articles. Shows author, last edited, approval status. Inline edit or view article. |
| `AssetUploader.tsx` | File input for GLB/FBX 3D models. Progress tracking, storage bucket selection. Validates file size. |
| `AssetList.tsx` | Gallery of uploaded assets: thumbnail preview, file size, upload date, delete action. Filter by type. |
| `AuditLogViewer.tsx` | Read-only table of user actions: who changed what, when, old→new values. Filter by user/table/date range. |
| `SMEReviewQueue.tsx` | Workflow for SME approvals: pending questions/articles grouped by status. Approve/reject with comment. |

## Subdirectories

None.

## For AI Agents

### Working In This Directory

1. **Supabase client pattern.** Import `createClient()` from `@/lib/supabase/client`. Call it once per component; cache if making multiple requests.

2. **Error handling.** Wrap Supabase calls in try/catch. Show user-facing error messages via toast or in-form feedback. Log errors to console for debugging.

3. **Form state.** Use React `useState` for form fields. Debounce onChange if making real-time API calls. Disable submit while saving.

4. **Type safety.** Define interfaces for Supabase table shapes (Question, TaxonomyNode, WikiArticle). Use TypeScript strict mode.

5. **No custom styling.** Use Campfire tokens and shadcn/ui components (Button, Input, Textarea, Dialog, Card).

6. **Accessibility.** Label all form inputs. Use semantic HTML (form, fieldset, legend). Test with keyboard navigation.

### Common Patterns

**Supabase fetch + state:**
```tsx
const [items, setItems] = useState<Question[]>([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  const fetch = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
      if (error) throw error
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
    const { data, error } = await supabase
      .from('questions')
      .upsert({ id, text, topic_id: topicId, ... })
    if (error) throw error
    // Success feedback
  } finally {
    setIsSaving(false)
  }
}
```

**Hierarchical tree rendering:**
```tsx
const renderNode = (node: TaxonomyNode, depth: number) => (
  <div key={node.id} style={{ paddingLeft: `${depth * 16}px` }}>
    <button onClick={() => toggleExpand(node.id)}>
      {expandedIds.has(node.id) ? '▼' : '▶'}
    </button>
    <span>{node.name}</span>
    {expandedIds.has(node.id) && node.children?.map(child => renderNode(child, depth + 1))}
  </div>
)
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/supabase/client` | Supabase client for all database operations |
| `@/components/ui/*` | Button, Input, Textarea, Dialog, Card, Badge |
| `@/lib/utils` | cn() for conditional classes |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **@supabase/supabase-js** | Database client (questions, wiki, taxonomy, assets) | ^2.98.0 |
| **@phosphor-icons/react** | Icons: Plus, Trash, PencilSimple, etc. | ^1.4.14 |
| **react** | Hooks: useState, useEffect, useCallback | ^19.2.4 |
| **next** | useRouter, usePathname for navigation | 16.1.6 |

<!-- MANUAL: -->
