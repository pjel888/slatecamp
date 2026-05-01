# Linked Questions and Sources

Article export is incomplete without linked questions and sources.

## Article-question link

Use:

```text
questions.article_id = wiki_articles.article_id
```

Each article bundle must include all linked questions.

## Normal question fields to export

From `questions`:

```text
question_id
article_id
topic_id
text
options
correct_option_id
correct_value
accepted_answers
value_tolerance
question_type
rationale
explanation
code_citation
bloom_level
application_context
practice_context
difficulty
difficulty_rating
discrimination_rating
is_assessment
model_id
prompt_image_url
created_at
updated_at
```

## Why question links matter

If article content changes later, linked questions may need review. Exporting questions in the same bundle makes it possible to detect:

```text
- answer key mismatch
- article-question contradiction
- outdated rationale
- unsupported code citation
- multiple correct answers
- no valid answer
```

This milestone does not perform those checks; it preserves the data needed for them.

## Source link

Use:

```text
wiki_article_sources.article_id = wiki_articles.article_id
```

Export source fields:

```text
source_id
article_id
label
url
description
source_type
is_verified
sort_order
created_at
updated_at
```

## Taxonomy link

Use:

```text
wiki_article_taxonomy.article_id = wiki_articles.article_id
wiki_article_taxonomy.node_id = taxonomy_tree.node_id
```

Export taxonomy context because it helps later classify article type and component fit.
