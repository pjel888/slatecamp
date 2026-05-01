# Content Hash and Diff Policy

Hashes make the round-trip safe.

## Required hashes

For each article:

```text
original_content_hash
normalized_content_hash
candidate_content_hash
ui_blocks_hash
linked_questions_hash
sources_hash
export_run_id
exported_at
```

## Hash algorithm

Use a stable hash such as SHA-256.

Record the algorithm:

```json
{
  "hash_algorithm": "sha256"
}
```

## Stale check

Before pushing:

```text
current_supabase_hash == original_content_hash
```

If false, abort.

## Diff report

`diff-report.json` should include:

```text
article_id
old_hash
new_hash
summary
changed_line_count
inserted_line_count
deleted_line_count
ui_blocks_preserved_count
ui_blocks_changed_count
safe_to_push
warnings
```

A human-readable markdown diff can also be generated:

```text
diff-report.md
```
