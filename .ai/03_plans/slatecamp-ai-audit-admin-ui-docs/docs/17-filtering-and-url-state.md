# Filtering and URL State

## Principle

Filters should be encoded in the URL query string so admins can bookmark/share filtered views.

## Common filters

```text
q
status
phase
severity
risk_type
target_type
needs_review
has_open_findings
has_sources
page
page_size
sort
```

## Example URLs

```text
/admin/ai-audit/articles?status=not_checked
/admin/ai-audit/articles?severity=critical&has_open_findings=true
/admin/ai-audit/questions?risk_type=answer_key_mismatch
/admin/ai-audit/findings?status=open&severity=high
```

## Search

Use debounced search for client UX, but query server-side.

## Sorting

Default sorts:

- Articles: highest severity/open findings first, then last updated.
- Questions: open findings/high severity first, then updated.
- Findings: critical/open first, then created date descending.
- Runs: started date descending.

## Clear filters

Always include a visible `Clear filters` action.
