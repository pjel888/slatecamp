# Round-Trip Strategy

The system should support safe back-and-forth between Supabase and local files.

## The round-trip

```text
EXPORT
Supabase -> local article bundle

NORMALIZE
original.md -> normalized.md + ui-blocks.json

EDIT
human/Codex/Kimi edits normalized.md or structured question files

COMPOSE
normalized.md + ui-blocks.json -> candidate.md

DIFF
candidate.md vs original.md

STALE CHECK
fetch current Supabase content and compare hash to original_hash

PUSH
if unchanged and approved, update Supabase
```

## Why not edit Supabase directly

Direct editing is risky because:

```text
- custom UI syntax can break
- linked questions can drift from articles
- component data can be lost
- stale content conflicts can overwrite recent changes
- there is no local diff review
```

## Key principle

`original.md` is the exact source snapshot.

`normalized.md` is the review/edit surface.

`ui-blocks.json` preserves anything removed or transformed from the edit surface.

`candidate.md` is the recomposed article that can be diffed and pushed.

## Push should be explicit

Do not push by default. A push command should require an explicit apply flag, such as:

```bash
pnpm content-audit:push --article <article_id> --apply
```

Dry run should be the default behavior.
