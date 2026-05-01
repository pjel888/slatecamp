# Required Supabase Queries

Use repo conventions for Supabase access. These are conceptual query needs.

## Fetch article batch

```sql
select
  article_id,
  title,
  slug,
  content,
  subject_label,
  difficulty_label,
  status,
  read_time,
  reviewed_at,
  reviewed_by,
  reviewer_comments,
  created_at,
  updated_at,
  updated_by,
  updated_note
from public.wiki_articles
order by updated_at desc;
```

## Fetch questions by article

```sql
select *
from public.questions
where article_id = :article_id
order by created_at asc;
```

## Fetch sources by article

```sql
select *
from public.wiki_article_sources
where article_id = :article_id
order by sort_order asc, created_at asc;
```

## Fetch taxonomy by article

```sql
select
  wat.article_id,
  wat.node_id,
  wat.is_primary,
  wat.sort_order,
  tt.name,
  tt.subject_area,
  tt.prc_area,
  tt.node_type,
  tt.lea_id
from public.wiki_article_taxonomy wat
left join public.taxonomy_tree tt on tt.node_id = wat.node_id
where wat.article_id = :article_id
order by wat.sort_order asc;
```

## Fetch current article before push

```sql
select article_id, content, updated_at
from public.wiki_articles
where article_id = :article_id;
```
