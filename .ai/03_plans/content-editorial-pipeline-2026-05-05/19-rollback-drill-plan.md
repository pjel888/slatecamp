# Rollback Drill Plan

## Objective

Prove rollback works before trusting any apply step.

## Drill scope

Use a low-risk pilot article in a non-production-safe context or with explicit approval. The drill should test the full backup and restore procedure without risking learner-facing corruption.

## Required backup metadata

Before apply:

- article ID
- slug
- current Supabase content hash
- current Supabase content backup path
- candidate hash
- run ID
- reviewer approval record

## Drill procedure

1. Select a safe article.
2. Pull current Supabase content.
3. Save backup with hash.
4. Apply a trivial approved change through normal dry-run/apply gates.
5. Verify remote changed as expected.
6. Restore from backup using the documented path.
7. Verify remote hash matches original backup.
8. Record the drill in `rollback-drill-report.md`.

## Rollback blockers

No apply step should be allowed if:

- backup failed,
- backup hash missing,
- restore procedure untested,
- remote verification cannot run,
- service-role credentials are unavailable in a safe execution context.

## Planning note

This plan defines the drill. It does not authorize running it.
