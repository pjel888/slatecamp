# Current SlateCamp Field Map

Use this field map for the first implementation. It was verified from the connected Supabase generated TypeScript types.

Codex should still inspect the repository, but it should not guess `id`, `stem`, or `answer_key` for the main content tables.

## Articles

Table: `public.wiki_articles`

Primary target ID:

```text
article_id
```

Important columns:

```text
article_id
title
slug
content
subject_label
difficulty_label
status
reviewed_at
reviewed_by
reviewer_comments
created_at
updated_at
```

## Normal questions

Table: `public.questions`

Primary target ID:

```text
question_id
```

Important columns:

```text
question_id
article_id
topic_id
text
options
correct_option_id
explanation
rationale
code_citation
question_type
difficulty
updated_at
```

## Design scenario questions

Table: `public.design_scenario_questions`

Primary target ID:

```text
question_id
```

Important columns:

```text
question_id
scenario_id
question_number
question_stem
options
correct_answer_index
rationale
code_citation
question_type
difficulty_rating
discrimination_rating
created_at
```

## Design scenarios

Table: `public.design_scenarios`

Important columns:

```text
scenario_id
title
brief
building_type
difficulty
```

## Article sources

Table: `public.wiki_article_sources`

Important columns:

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

## Admin helpers

Generated Supabase types show these helper functions exist:

```text
has_admin_role()
is_super_admin()
can_review_content()
check_user_admin_role(p_user_id)
```

Use the existing admin route guard first. For RLS, prefer the existing helper function that the current codebase already uses.

## Target type convention for audit module

Use:

```text
wiki_article
question
design_scenario_question
source
other
```

Examples:

```text
wiki_articles.article_id      -> target_type = wiki_article, target_id = article_id
questions.question_id         -> target_type = question, target_id = question_id
design_scenario_questions.question_id -> target_type = design_scenario_question, target_id = question_id
```
