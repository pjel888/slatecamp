# Roundtrip Concurrency Plan

## Objective

Prevent manual editors, AI proposal scripts, pull/export runs, compose runs, and push runs from clobbering each other.

## Collision scenarios

1. AI edits `normalized.md` while a human edits the same file.
2. Re-export with `--overwrite true` after local edits wipes changes.
3. Compose generates `candidate.md` from stale `ui-blocks.json` hash.
4. Push applies after remote Supabase content changed.
5. Two agents create question edits for the same question.

## Locking policy

Each article can have an `editorial/lock.json`:

```json
{
  "article_id": "...",
  "locked_by": "agent-or-human",
  "purpose": "diagnosis|proposal|local_apply|review|push",
  "created_at": "ISO timestamp",
  "expires_at": "ISO timestamp",
  "input_hashes": {}
}
```

## Ownership policy

- Only one writer/apply process may touch an article at a time.
- Multiple read-only analysis passes may run concurrently.
- Question edit files are one-file-per-question and must include baseline hashes.
- Re-export is allowed before edits or after explicit reconciliation only.

## Merge policy

If two proposals exist:

- compare input hashes,
- prefer source-backed high-risk correction over style improvement,
- require human review when both alter same section,
- never auto-merge answer-key changes.

## Required preflight checks

Before any local mutation:

- lock absent or owned by current process,
- local baseline is fresh enough,
- `original.md` hash matches metadata,
- `normalized.md` hash matches `ui-blocks.json`,
- no unresolved prior proposal for same article.
