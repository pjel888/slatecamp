# Copy and Microcopy

## Page title

```text
AI Audit Control Center
```

## Subtitle

```text
Track factual review status for articles, questions, sources, findings, and admin decisions.
```

## Empty states

### No audit records

```text
No audit records yet.
Start by reviewing articles manually or preparing a static audit run. AI integrations will be added later.
```

### No findings

```text
No findings match the current filters.
```

### No open findings for target

```text
No open findings for this item.
```

## Status labels

| Internal | Label |
|---|---|
| `not_checked` | Not checked |
| `passed` | Passed |
| `flagged` | Flagged |
| `needs_source_check` | Needs source check |
| `likely_wrong` | Likely issue |
| `confirmed_wrong` | Confirmed issue |
| `correction_proposed` | Correction proposed |
| `validated` | Validated |
| `needs_human_review` | Needs human review |
| `approved` | Approved |
| `published` | Published |
| `rejected` | Rejected |
| `failed` | Failed |

## Buttons

- `Create finding`
- `View details`
- `Mark reviewed`
- `Approve`
- `Confirm finding`
- `Reject finding`
- `Resolve finding`
- `Reopen`
- `Clear filters`

## Future AI button language

If shown disabled:

```text
Run AI scan — coming soon
```

Do not show enabled AI actions in this implementation pass.
