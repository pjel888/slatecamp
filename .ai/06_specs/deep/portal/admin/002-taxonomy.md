# Taxonomy Management

**Analysis Date:** 2026-04-06

## Overview

Global taxonomy tree management at `/admin/taxonomy/`. The taxonomy is the backbone of SlateCamp's content organization — all articles and questions are filtered via the discipline → subject → topic hierarchy.

**Source:** `src/app/admin/taxonomy/`, `src/types/app.ts`

## Taxonomy Structure

```typescript
interface TaxonomyNode {
  node_id: string;
  discipline_id: string;
  parent_id: string | null;   // null = root (discipline level)
  level: number;             // 0 = discipline, 1 = subject, 2 = topic
  name: string;
  subject_area: string;
  slug?: string | null;
  is_leaf: boolean;          // true = topic (no children)
  // ALE metadata (v5.0)
  ale_id?: string | null;
  description?: string | null;
  exam_frequency?: string | null;
  bloom_level?: string | null;
  difficulty?: number | null; // 0.0–1.0
  prc_area?: string | null;
  // Mastery data (when joined)
  mastery?: number;
  last_encountered?: string | null;
  children?: TaxonomyNode[];  // Recursive
}
```

**Source:** `src/types/app.ts` (lines 22–44)

## Hierarchy Levels

| Level | Name | `is_leaf` | Example |
|-------|------|-----------|---------|
| 0 | Discipline | false | Architecture |
| 1 | Subject | false | Building Laws |
| 2 | Topic | true | Building Setbacks (NBCP Rule 7) |

## ALE Metadata

Taxonomy nodes carry ALE-specific metadata:
- **ale_id** — Official ALE designation
- **exam_frequency** — How often this appears on the board exam
- **bloom_level** — Bloom's taxonomy cognitive level
- **prc_area** — PRC exam area
- **difficulty** — Estimated difficulty (0.0–1.0)

## Orphan Detection

The "Unassigned" filter in the Knowledge Hub shows content not yet mapped to the taxonomy tree. This ensures all content has a home in the ALE subject structure.

## CRUD Operations

Taxonomy edits via server actions in `src/lib/actions/admin/taxonomy.ts`:
- Create node
- Update node metadata
- Move node (reparent)
- Delete node (with content reassignment)
- Bulk ALE ID assignment

---

*Taxonomy management: 2026-04-06*
