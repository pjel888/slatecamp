# Schema: linked-questions.json

```json
{
  "article_id": "string",
  "question_count": 0,
  "questions": [
    {
      "question_id": "string",
      "article_id": "string | null",
      "topic_id": "string",
      "text": "string",
      "options": {},
      "correct_option_id": "string",
      "correct_value": "number | null",
      "accepted_answers": ["string"],
      "value_tolerance": "number | null",
      "question_type": "string | null",
      "rationale": {},
      "explanation": "string | null",
      "code_citation": "string | null",
      "bloom_level": "string | null",
      "application_context": "string | null",
      "practice_context": ["string"],
      "difficulty": "number | null",
      "difficulty_rating": "number | null",
      "discrimination_rating": "number | null",
      "is_assessment": "boolean | null",
      "created_at": "string",
      "updated_at": "string",
      "content_hash": "sha256:string"
    }
  ]
}
```
