# 03 — Question Editing Rules

## Principle

Linked questions are exported with articles for context, but `linked-questions.json` is read-only working data. Do not edit it directly.

Question changes must be proposed through per-question edit files and pushed with the question push script.

## Question edit location

Create:

```text
.ai/content-audit-export/articles/<article-folder>/question-edits/<question_id>.json
```

## Minimum edit file shape

```json
{
  "question_id": "<question_id>",
  "baseline_hash": "sha256:<hash from linked-questions.json or push dry-run>",
  "reason": "Why this question needs to change, with source/evidence summary.",
  "approved_by": "<reviewer id or name>",
  "approved_at": "2026-05-01T00:00:00.000Z",
  "proposed": {
    "text": "Updated question text",
    "explanation": "Updated explanation",
    "code_citation": "Updated code/source citation"
  }
}
```

The script also accepts `update` or `fields`, but `proposed` is preferred for clarity.

## Allowed update fields

The current question push script allows only these fields:

- `topic_id`
- `text`
- `options`
- `correct_option_id`
- `correct_value`
- `accepted_answers`
- `value_tolerance`
- `question_type`
- `rationale`
- `explanation`
- `code_citation`
- `bloom_level`
- `application_context`
- `practice_context`
- `difficulty`
- `difficulty_rating`
- `discrimination_rating`
- `is_assessment`
- `model_id`
- `prompt_image_url`

Unknown fields are ignored by the push script and should not be used as review notes.

## Answer-key changes

Changing any of these is high risk:

- `correct_option_id`
- `correct_value`
- `accepted_answers`
- `value_tolerance`
- `options`

Requirements for answer-key changes:

1. Cite the source that proves the answer.
2. Explain why the old answer was wrong or incomplete.
3. Check whether the article correction also needs to change.
4. Include `approved_by` and `approved_at`.
5. Run dry-run before apply.

## Question push commands

Dry-run:

```bash
bun run content-audit:push-question:dry-run -- --question-id <question_id>
```

Apply after review:

```bash
bun run content-audit:push-question:apply -- --question-id <question_id>
```

The question push script:

- Finds the exported question in `linked-questions.json`.
- Requires a matching `question-edits/<question_id>.json`.
- Fetches the remote question from Supabase.
- Compares the remote hash with the exported/edit baseline.
- Refuses stale remote updates.
- Updates only allowed fields plus `updated_at`.

## Do not couple article and question pushes

Article push commands update `wiki_articles.content` only. They do not update linked questions.

Question push commands update `questions` only. They do not update article content, sources, or taxonomy.

If both article and question changes are needed, review and push them as separate operations with separate reports.
