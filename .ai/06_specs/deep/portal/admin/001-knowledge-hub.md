# Knowledge Hub

**Analysis Date:** 2026-04-06

## Overview

The Knowledge Hub (`/admin/knowledge/`) is the unified content management interface for SlateCamp. It consolidates wiki articles and assessment questions into a single, taxonomy-driven browsing experience.

**Source:** `src/app/admin/AGENTS.md`, `src/app/admin/knowledge/`

## Architecture

Two content types under one interface:
- **Articles** — Wiki content with MDX rendering
- **Questions** — Assessment items with rationales

## Routes

| Route | Purpose |
|-------|---------|
| `/admin/knowledge` | Central hub — search/filter articles + questions |
| `/admin/knowledge/[id]` | Split-pane article editor |
| `/admin/knowledge/questions` | Question bank browser |
| `/admin/knowledge/questions/[id]` | Context-aware question editor |
| `/admin/knowledge/new` | New article creation |
| `/admin/knowledge/questions/new` | New question creation |

**Source:** `src/app/admin/knowledge/`

## Split-Pane Editor

Article editor (`/admin/knowledge/[id]`):
- Left pane: TipTap MDX editor
- Right pane: Linked questions + metadata
- Live preview
- Taxonomy assignment panel
- Publication status

**Source:** `src/components/admin/unified-editor/SplitPaneEditor.tsx`

## Context-Aware Question Editor

Question editor (`/admin/knowledge/questions/[id]`):
- Source article shown in reference pane
- Question metadata: difficulty, discrimination, Bloom level
- Option-level rationales
- Code citations
- ALE area tagging

**Source:** `src/components/admin/unified-editor/QuestionEditor.tsx`

## Knowledge Browser

Filters both articles and questions simultaneously:
- Taxonomy tree navigation
- Status filters (draft, published, archived)
- Difficulty filters
- Search across both content types
- "Unassigned" filter for orphaned content

**Source:** `src/app/admin/knowledge/_components/KnowledgeBrowser.tsx`

## SME Review Workflow

Articles and questions submitted for review:
1. **Draft** — Work in progress
2. **Submit for Review** — Queued in SME review queue
3. **Approve** — Ready for publication
4. **Publish** — Live in student wiki

**Source:** `src/app/admin/reviews/`

## Server Actions

```typescript
// src/lib/actions/admin/content.ts
createArticle()
updateArticle()
publishArticle()
createQuestion()
updateQuestion()
submitForReview()
approveContent()
rejectContent()
```

**Source:** `src/lib/actions/admin/content.ts`

## Cache Revalidation

After mutations:
```typescript
revalidatePath('/admin/knowledge')
revalidatePath('/dashboard/wiki')
```

---

*Knowledge hub: 2026-04-06*
