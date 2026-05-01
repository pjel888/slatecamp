# Content Hash and Diff Policy

Hashes make the round-trip safe.

## Required hashes

For each article:

```text
content_hash
original_content_hash
normalized_content_hash
candidate_content_hash
ui_blocks_hash
linked_questions_hash
sources_hash
export_run_id
exported_at
hash_algorithm
```

## Hash algorithm

Use SHA-256 and record it as:

```json
{
  "hash_algorithm": "sha256"
}
```

Hash string values are stored with a `sha256:` prefix.

## Stale check

Before pushing:

```text
current_supabase_hash == original_content_hash
```

If false, abort and write `conflict-report.json`.

## Diff report

`diff-report.json` includes:

```text
article_id
old_hash
new_hash
original_hash
normalized_hash
candidate_hash
changed
changed_line_count
inserted_line_count
deleted_line_count
ui_blocks_original_count
ui_blocks_candidate_count
ui_blocks_changed_count
ui_blocks_count
unresolved_placeholders_count
preserved_blocks_count
changed_text_summary
changed_ui_blocks_summary
locally_safe_to_push
safe_to_push
blockers
warnings
summary
```

A human-readable markdown summary is also generated:

```text
diff-report.md
```

Diff can only mark a bundle locally safe. The push command must still perform the live Supabase stale check before any mutation.
