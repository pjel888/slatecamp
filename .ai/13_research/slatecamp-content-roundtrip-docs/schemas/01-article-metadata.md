# Schema: article-metadata.json

```json
{
  "article_id": "string",
  "title": "string",
  "slug": "string",
  "subject_label": "string | null",
  "difficulty_label": "string | null",
  "status": "string | null",
  "read_time": "string | null",
  "created_at": "string",
  "updated_at": "string",
  "reviewed_at": "string | null",
  "reviewed_by": "string | null",
  "source_count": 0,
  "linked_question_count": 0,
  "taxonomy_count": 0,
  "original_content_hash": "sha256:string",
  "normalized_content_hash": "sha256:string | null",
  "candidate_content_hash": "sha256:string | null",
  "ui_blocks_hash": "sha256:string | null",
  "exported_at": "string",
  "export_run_id": "string",
  "parser_status": "not_started | passed | warnings | failed",
  "content_complexity": "plain_markdown | markdown_with_ui | unknown"
}
```
