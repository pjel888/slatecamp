# SME Review Queue

**Analysis Date:** 2026-04-06

## Overview

The SME (Subject Matter Expert) Review Queue at `/admin/reviews/` manages content awaiting expert validation before publication.

**Source:** `src/app/admin/reviews/`, `src/lib/wiki/` (lifecycle)

## Workflow States

```
draft → submitted → in_review → approved → published
                  ↘           ↗
                   rejected → draft
```

| State | Description | Who Acts |
|-------|-------------|---------|
| draft | Work in progress | Content creator |
| submitted | Queued for review | SME |
| in_review | SME actively reviewing | SME |
| approved | SME verified | SME |
| rejected | Changes requested | SME |
| published | Live in student wiki | Admin/SME |

## Review Interface

SME review items deep-link to unified editors:
- `/admin/knowledge/[id]` — For article reviews
- `/admin/knowledge/questions/[id]` — For question reviews

Review actions:
- **Approve** — Move to approved (ready to publish)
- **Request Changes** — Return to draft with feedback
- **Reject** — Mark as rejected with reason

**Source:** `src/app/admin/reviews/` (ReviewQueue component)

## Review Criteria

SME reviews verify:
- Factual accuracy against source materials
- Code citation correctness (NBCP, PRC references)
- Appropriate Bloom's taxonomy level
- ALE alignment
- Clear, unambiguous question wording
- Per-option rationales (correct + distractors)

## Notifications

Review submissions trigger notifications to assigned SMEs.

---

*SME review queue: 2026-04-06*
