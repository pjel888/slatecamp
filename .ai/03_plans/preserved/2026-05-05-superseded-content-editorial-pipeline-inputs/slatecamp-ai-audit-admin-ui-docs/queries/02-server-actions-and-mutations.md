# Server Actions and Mutations

Use the existing SlateCamp pattern for server actions, route handlers, RPCs, or API routes.

## Required mutations

### Create manual finding

Inputs:

```ts
type CreateManualFindingInput = {
  targetType: 'wiki_article' | 'question' | 'design_scenario_question'
  targetId: string
  articleId?: string | null
  questionId?: string | null
  severity: 'low' | 'medium' | 'high' | 'critical'
  riskType: string
  findingSummary: string
  suspectText?: string | null
  rationaleSummary?: string | null
  recommendedNextStep?: string | null
}
```

Behavior:

1. Insert `ai_audit_findings` row.
2. Upsert `ai_audit_status_cache` for the target.
3. Insert `ai_review_decisions` with decision `note` or `mark_needs_review`.

### Update finding status

Inputs:

```ts
type UpdateFindingStatusInput = {
  findingId: string
  status: 'open' | 'confirmed' | 'rejected' | 'resolved' | 'superseded'
  notes?: string
}
```

Behavior:

1. Update finding.
2. Insert review decision.
3. Recompute affected target status cache.

### Mark target reviewed

Inputs:

```ts
type MarkReviewedInput = {
  targetType: 'wiki_article' | 'question' | 'design_scenario_question'
  targetId: string
  notes?: string
}
```

Behavior:

1. Upsert status cache with `latest_phase = human_review`.
2. Set `latest_status` to `passed` or `needs_human_review` depending on open findings.
3. Insert review decision.

### Approve target

Inputs:

```ts
type ApproveTargetInput = {
  targetType: 'wiki_article' | 'question' | 'design_scenario_question'
  targetId: string
  notes?: string
}
```

Behavior:

- Should be allowed only if there are no open/confirmed high-risk findings, unless admin explicitly overrides with notes.
- Upsert status cache with `latest_phase = approved`, `latest_status = approved`.
- Insert review decision.

## Recompute status cache helper

Create a helper function in app code:

```ts
async function recomputeAuditStatusCache(targetType: string, targetId: string) {
  // Load open/confirmed findings.
  // Determine highest severity.
  // Count findings.
  // Set needs_source_check, needs_correction, needs_human_review.
  // Upsert ai_audit_status_cache.
}
```

## Do not expose raw mutation endpoints publicly

Every mutation must require admin access.
