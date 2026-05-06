# Live Read-Only Source/Admin Verification Checks — Phase 0.5

**Date:** 2026-05-05T10:50:59Z  
**Scope:** Read-only live Supabase verification of source/admin contradictions after Phase 0.5A.1.  
**Commands:** `bunx supabase db query --linked --file <sql> --output json`; `bunx supabase migration list --linked`.  
**Mutation status:** No writes. No migrations applied. No Supabase data mutated.

---

## 1. `wiki_article_sources` Verification / URL State

### Query

```sql
select
  count(*) as total_sources,
  count(*) filter (where is_verified = true) as verified_sources,
  count(*) filter (where url is not null and length(trim(url)) > 0) as populated_urls,
  count(*) filter (where url is null or length(trim(url)) = 0) as missing_urls
from public.wiki_article_sources;
```

### Result

```json
[
  {
    "missing_urls": 1110,
    "populated_urls": 0,
    "total_sources": 1110,
    "verified_sources": 0
  }
]
```

### Interpretation

`wiki_article_sources` remains `DISCOVERY_SEED_ONLY`.

Reason:

- 1,110 total rows.
- 0 verified rows.
- 0 populated URLs.
- 1,110 missing URLs.

These rows can support discovery and gap analysis only. They cannot ground legal/code claims, article rewrites, or question-bank edits.

---

## 2. `taxonomy_sources` Contradiction

### Query

```sql
select count(*) as taxonomy_sources_count
from public.taxonomy_sources;
```

### Result

```json
[
  {
    "taxonomy_sources_count": 0
  }
]
```

### Interpretation

The contradiction remains live.

If comments/docs claim `taxonomy_sources` provides complete node-source coverage, that claim is false against the live database. The table exists but has zero rows and cannot support source grounding.

---

## 3. Live `ai_audit_*` Table Existence

### Query

```sql
select
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name like 'ai\_audit\_%' escape '\'
order by table_name;
```

### Result

```json
[]
```

### Interpretation

No public `ai_audit_*` tables exist live.

Admin AI audit integration remains blocked as live-ready infrastructure. Any admin AI audit table design should be treated as repo-local/planned unless a later live migration creates and verifies the required tables, columns, grants, and RLS policies.

---

## 4. Applied Migration Boundary

### Command

```bash
bunx supabase migration list --linked
```

### Relevant Result

```txt
20260505132000 | 20260505132000 | 2026-05-05 13:20:00
20260505145349 |                | 2026-05-05 14:53:49
```

### Interpretation

- `20260505132000_create_user_exam_date_preferences` appears applied locally and remotely.
- `20260505145349_restrict_ai_audit_admin_access` exists locally but is absent remotely.

Keep classification:

```txt
Admin AI audit = repo-local/planned infrastructure, not live-ready infrastructure.
```

---

## 5. Gate Impact

These live checks do not unlock Phase 1B.

Current implications:

- `wiki_article_sources`: discovery seed only.
- `taxonomy_sources`: zero-row contradiction remains a blocker.
- `ai_audit_*`: no live public tables; admin audit integration remains blocked.
- AI audit restriction migration: local only, not remote-applied.
- Source-pack creation: still blocked because no source file has reached `VERIFIED_SOURCE_CANDIDATE`.

---

## 6. Updated Status Note

As of Phase 0.5A.1, the source-drop intake protocol is complete as a planning gate, but no local source files exist in the intake directory and no source file has reached `VERIFIED_SOURCE_CANDIDATE`. Source-pack creation, embeddings, source-grounded rewriting, and Phase 1B remain blocked until at least one source passes intake, provenance review, and official-web or human verification.

---

*End of live read-only source/admin verification checks.*
