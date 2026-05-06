# Manual Workflow

The MVP should be useful before AI integrations exist.

## Manual finding flow

```text
Admin opens article/question
  ↓
Clicks Create finding
  ↓
Chooses severity and risk type
  ↓
Writes finding summary and suspect text
  ↓
Saves
  ↓
System creates ai_audit_findings row
  ↓
System upserts ai_audit_status_cache
  ↓
Dashboard updates counts/status
```

## Confirm/reject flow

```text
Admin reviews open finding
  ↓
Clicks Confirm or Reject
  ↓
Adds note
  ↓
System updates finding status
  ↓
System creates ai_review_decisions row
  ↓
System recomputes target status cache
```

## Mark reviewed flow

```text
Admin opens target detail
  ↓
Clicks Mark reviewed
  ↓
Adds note
  ↓
System creates ai_review_decisions row
  ↓
If no open high-risk findings: status becomes passed/human_review
  ↓
If open findings remain: status stays needs_human_review
```

## Approve flow

```text
Admin opens target detail
  ↓
Checks open findings
  ↓
Clicks Approve
  ↓
Adds required note if open findings remain
  ↓
System creates ai_review_decisions row
  ↓
Status cache becomes approved
```

## Important

Approval in this MVP means internal audit approval. It does not mutate/publish content.
