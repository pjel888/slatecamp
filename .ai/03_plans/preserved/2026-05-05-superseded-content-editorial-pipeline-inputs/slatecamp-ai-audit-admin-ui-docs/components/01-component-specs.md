# Component Specifications

Reuse existing SlateCamp UI components. These names are suggestions; Codex should adapt to the codebase.

## Page components

```text
AiAuditDashboardPage
AiAuditArticlesPage
AiAuditQuestionsPage
AiAuditFindingsPage
AiAuditRunsPage
AiAuditTargetDetailDrawer
```

## Reusable components

```text
AuditStatusBadge
AuditPhaseBadge
AuditPhaseStepper
AuditSeverityBadge
AuditFindingStatusBadge
AuditSummaryCard
AuditFiltersBar
AuditDataTable
AuditNextActionButton
ManualFindingDialog
ReviewDecisionDialog
AuditTimeline
```

## AuditStatusBadge

Inputs:

```ts
status: AuditStatus
```

Visual mapping:

- gray: `not_checked`, `skipped`
- green: `passed`, `validated`, `approved`, `published`
- yellow: `needs_source_check`, `needs_human_review`
- orange: `likely_wrong`, `correction_proposed`, `flagged`
- red: `confirmed_wrong`, `failed`, critical issues
- blue: `queued`, `running`

## AuditPhaseStepper

Show:

```text
Static → Flag → Source → Correct → Validate → Review
```

For MVP, AI future phases can be shown but disabled or pending.

## ManualFindingDialog

Fields:

- Target selector or hidden target context.
- Severity.
- Risk type.
- Finding summary.
- Suspect text.
- Rationale/notes.
- Recommended next step.

Validation:

- target required,
- severity required,
- finding summary required,
- risk type required.

## ReviewDecisionDialog

Fields:

- Decision.
- Notes.
- Optional status to set.

Use for confirming/rejecting/resolving findings and marking targets reviewed.

## AuditTimeline

Timeline item fields:

```ts
type TimelineItem = {
  id: string
  type: 'run' | 'item' | 'finding' | 'proposal' | 'decision' | 'status'
  label: string
  description?: string
  timestamp: string
  actor?: string
  status?: string
}
```
