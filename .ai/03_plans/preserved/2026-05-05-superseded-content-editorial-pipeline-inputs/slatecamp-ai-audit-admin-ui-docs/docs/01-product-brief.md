# Product Brief: AI Audit Workflow Dashboard

## Product name

SlateCamp AI Audit Control Center

## Route

```text
/admin/ai-audit
```

## Purpose

SlateCamp needs a permanent admin module to manage the factual quality workflow for licensure-exam content. The system will eventually receive AI-generated flags, source-backed checks, corrections, and validation results. The first implementation should create the operational dashboard and logging foundation.

## Why this comes before AI integration

If AI is connected before the workflow/logging layer exists, results become hard to review, repeat, or trust. The dashboard should exist first so future AI workers can write structured results into stable tables.

The admin dashboard should support:

- status monitoring,
- phase tracking,
- findings logging,
- manual review,
- correction proposal tracking,
- audit run history,
- future AI import results.

## Primary users

- SlateCamp admin/owner.
- Future content reviewer.
- Future expert reviewer.
- Future AI pipeline operator.

## Primary jobs to be done

1. See all articles/questions and their audit state.
2. Find content that has never been audited.
3. Identify items with open issues.
4. Track which phase each article/question has finished.
5. Log manual findings before AI integration exists.
6. Review and resolve findings.
7. Prepare a clean structure for future AI workers.

## MVP success condition

An admin can open `/admin/ai-audit`, see the full content audit status of SlateCamp, manually flag issues, mark items reviewed, and inspect a history of audit actions without any AI provider integration.
