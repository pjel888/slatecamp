# Wiki Knowledge Base

**Analysis Date:** 2026-04-06

## Overview

The SlateCamp Wiki is an expert-linked knowledge base covering all ALE (Architectural Licensure Examination) subjects. Every claim in study materials links to verified expert sources (Philippine Building Code, PRC syllabi, standard references). The wiki is the authoritative content layer that powers both study and quiz question sourcing.

**Source:** `src/components/wiki/` (54 files + widgets/ subdir), `src/lib/wiki-markdown.ts`

## Content Structure

### Wiki Articles

```typescript
interface WikiArticle {
  article_id: string;
  slug: string;
  title: string;
  content: string;           // MDX content
  created_at: string;
  updated_at: string;
  // Wiki hero metadata (v1 spec)
  ale_tests_you?: string | null;
  updated_note?: string | null;
  subject_label?: string | null;
  difficulty_label?: 'Foundational' | 'Intermediate' | 'Advanced' | null;
}
```

**Source:** `src/types/app.ts` (lines 83–95)

### Wiki Categories

```typescript
interface WikiCategory {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  children?: WikiCategory[];  // Recursive for nested categories
}
```

**Source:** `src/types/app.ts` (lines 572–582)

### Wiki Pages (v5.0)

```typescript
interface WikiPage {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  markdown_content: string;
  tags: string[];
  is_free: boolean;
  is_deprecated: boolean;
  deprecated_by: string | null;
  deprecated_note: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  wiki_categories?: WikiCategory;
}
```

**Source:** `src/types/app.ts` (lines 584–599)

## Article Metadata (ALE Spec)

Articles include specialized metadata for ALE preparation:

| Field | Description |
|-------|-------------|
| `ale_tests_you` | Which ALE sub-exams this article covers |
| `difficulty_label` | Foundational / Intermediate / Advanced |
| `bloom_level` | Bloom's taxonomy level (from taxonomy node) |
| `prc_area` | PRC exam area designation |
| `exam_frequency` | How often this topic appears on the exam |
| `code_citation` | Relevant building code section (e.g., "NBCP Rule 7.3") |

**Source:** `src/types/app.ts` (TaxonomyNode interface, lines 22–44)

## Wiki Routes

| Route | Purpose |
|-------|---------|
| `/dashboard/wiki` | Article browser and search |
| `/dashboard/wiki/[slug]` | Article detail view |

**Source:** `src/app/dashboard/wiki/`

## Rendering Pipeline

1. **Content stored:** MDX in `markdown_content` column
2. **Parsing:** `wiki-markdown.ts` processes MDX, extracts citations
3. **Rendering:** `src/components/wiki/ArticleViewer.tsx` renders with callouts, tables, widgets
4. **Citation extraction:** Links extracted to verify source backing
5. **Sanitization:** `DOMPurify.sanitize()` before `dangerouslySetInnerHTML`

**Source:** `src/lib/wiki-markdown.ts`, `src/components/wiki/`

## Callout Types

Wiki articles support structured callout blocks:
- **Principle** — Architectural principle or code requirement
- **Misconception** — Common misunderstanding to correct
- **Example** — Worked example or case study
- **Note** — Supplementary information
- **Warning** — Critical safety or compliance note

**Source:** `src/components/wiki/widgets/` (BP344 and DSGN013 widgets)

## Linked Questions

Articles are linked to assessment questions via `topic_id`. When editing an article in the admin Knowledge Hub:
- Left pane: MDX editor for article content
- Right pane: Linked questions displayed alongside
- Deep linking: `/admin/knowledge/[id]` shows both article and its questions

**Source:** `src/app/admin/knowledge/[id]/`

## SME Review Workflow

Articles follow a publication pipeline:

```
draft → review → approved → published
```

- **draft:** Initial creation, not visible to students
- **review:** Submitted for SME (Subject Matter Expert) review
- **approved:** SME verified, ready for publication
- **published:** Live in the student wiki

**Source:** `src/lib/wiki/` (lifecycle management), `src/app/admin/reviews/`

## Search

Fuzzy search powered by Fuse.js:
- Searches title, content, tags
- Ranks by relevance
- Filters by category, difficulty, deprecated status

**Source:** `src/components/wiki/SearchBar.tsx`, `src/lib/actions/wiki/`

## Widgets

Special embedded components in wiki articles:

| Widget | Purpose |
|--------|---------|
| **BP344 Widget** | Philippine Building Code (PD 1096) calculator widgets |
| **DSGN013 Widget** | Architectural design computation widgets |

Located in: `src/components/wiki/widgets/`

## Admin Knowledge Hub

Unified content management interface:
- `/admin/knowledge/` — Central hub, filters both articles and questions
- `/admin/knowledge/[id]/` — Split-pane article editor
- `/admin/knowledge/questions/` — Question bank browser
- `/admin/knowledge/questions/[id]/` — Question editor with article context pane
- `/admin/knowledge/new/` — New article creation
- `/admin/knowledge/questions/new/` — New question creation

**Source:** `src/app/admin/knowledge/`

---

*Wiki knowledge base analysis: 2026-04-06*
