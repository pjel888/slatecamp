# Dashboard UX Specification

## Page title

```text
AI Audit Control Center
```

## Page subtitle

```text
Monitor article and question audit readiness, findings, correction proposals, and human review status.
```

## Top summary cards

Show at minimum:

1. Total Articles
2. Not Checked
3. Needs Source Check
4. Likely / Confirmed Issues
5. Open Findings
6. Needs Human Review
7. Approved
8. Questions Flagged

Suggested layout:

```text
[Total Articles] [Not Checked] [Needs Source Check] [Likely Wrong]
[Open Findings] [Needs Human Review] [Approved] [Questions Flagged]
```

## Main tabs

```text
Overview | Articles | Questions | Findings | Runs
```

## Overview content

The overview should include:

- Summary cards.
- Status distribution chart or stacked status bar if existing chart components exist.
- Recent findings table.
- Recent audit runs table.
- High priority queue list.

## High priority queue

Show the top unresolved items based on:

1. Critical severity.
2. High severity.
3. Confirmed wrong.
4. Answer key risk.
5. Needs human review.
6. Oldest open finding.

## Empty state

If no audit data exists yet:

```text
No AI audit records yet.
Start by creating a manual finding or running a static audit preparation pass.
```

Buttons:

- `View Articles`
- `View Questions`
- `Create Manual Finding`

## UX tone

Use clear operational language:

- "Needs source check"
- "Likely issue"
- "Confirmed issue"
- "Ready for review"
- "Approved"

Avoid vague labels like:

- "Maybe okay"
- "AI says yes"
- "Done"
