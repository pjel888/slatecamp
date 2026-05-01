# Schema: manifest.json

```json
{
  "export_version": "1.0.0",
  "export_run_id": "string",
  "generated_at": "string",
  "supabase_project_ref": "string | optional",
  "article_count": 0,
  "question_count": 0,
  "source_count": 0,
  "component_count": 0,
  "hash_algorithm": "sha256",
  "articles": [
    {
      "article_id": "string",
      "folder": "string",
      "title": "string",
      "slug": "string",
      "original_content_hash": "sha256:string",
      "linked_question_count": 0,
      "source_count": 0,
      "ui_block_count": 0,
      "parser_status": "string"
    }
  ]
}
```
