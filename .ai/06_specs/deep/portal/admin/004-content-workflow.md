# Content Workflow

**Analysis Date:** 2026-04-06

## Overview

Complete content lifecycle from creation to publication, including versioning, audit trails, and asset management.

**Source:** `src/lib/wiki/` (lifecycle), `src/lib/audit/`, `src/app/admin/`

## Article Lifecycle

```
1. Creation (draft)
   └─ /admin/knowledge/new/
   
2. Editing
   └─ /admin/knowledge/[id]/
   └─ Auto-save draft
   
3. Submit for Review
   └─ Triggers SME notification
   
4. SME Review
   └─ /admin/reviews/
   └─ Approve / Request Changes / Reject
   
5. Publish
   └─ /admin/knowledge/[id]/
   └─ Revalidates /dashboard/wiki cache
```

**Source:** `src/lib/wiki/` (wiki article lifecycle)

## Question Lifecycle

```
1. Creation
   └─ /admin/knowledge/questions/new/
   └─ Context: optionally pre-loaded from article
   
2. Metadata Tagging
   └─ IRT parameters (difficulty, discrimination)
   └─ Bloom's level
   └─ LEA area
   └─ Topic assignment
   
3. Rationale Writing
   └─ Per-option rationales
   └─ Code citations
   
4. SME Review
   └─ /admin/reviews/
   
5. Publish
   └─ Available in quiz sessions
```

**Source:** `src/lib/actions/admin/content.ts`

## Audit Trail

All content changes logged in `audit_logs`:
```typescript
{
  action: 'article_update' | 'question_create' | 'taxonomy_edit' | ...;
  entity_type: 'article' | 'question' | 'taxonomy_node' | ...;
  entity_id: string;
  user_id: string;
  changes: Record<string, { from: any; to: any }>;
  timestamp: string;
}
```

Deep-linked from `/admin/audit/` to the relevant content editor.

**Source:** `src/lib/audit/`, `src/app/admin/audit/`

## 3D Asset Pipeline

```
Upload (GLB/GLTF)
  └─ /admin/assets/
  
Hotspot Configuration
  └─ Attach hotspots to geometry
  
Compliance Rules
  └─ Link PD 1096 rules to model
  
Module Assembly
  └─ Combine geometry + hotspots + rules = module
  
Publish
  └─ Available in /dashboard/3d-lab/
```

**Source:** `src/app/admin/assets/`

---

*Content workflow: 2026-04-06*
