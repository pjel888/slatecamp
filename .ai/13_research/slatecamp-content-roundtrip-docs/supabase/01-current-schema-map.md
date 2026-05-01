# Current Supabase Schema Map

Use the actual generated DB types in the repo if present. The important current tables for this workflow are below.

## `wiki_articles`

Key fields:

```text
article_id: string
content: string
title: string
slug: string
subject_label: string | null
difficulty_label: string | null
status: string | null
read_time: string | null
reviewed_at: string | null
reviewed_by: string | null
reviewer_comments: string | null
updated_at: string
updated_by: string | null
updated_note: string | null
created_at: string
created_by: string | null
```

## `questions`

Key fields:

```text
question_id: string
article_id: string | null
topic_id: string
text: string
options: json
correct_option_id: string
rationale: json | null
explanation: string | null
code_citation: string | null
question_type: string | null
updated_at: string
```

## `wiki_article_sources`

Key fields:

```text
source_id: string
article_id: string
label: string
url: string | null
description: string | null
source_type: enum/string
is_verified: boolean
sort_order: number
```

## `wiki_article_taxonomy`

```text
article_id: string
node_id: string
is_primary: boolean | null
sort_order: number
```

## `taxonomy_tree`

```text
node_id: string
name: string
subject_area: string
prc_area: string | null
node_type: enum/string
lea_id: string | null
```
