# Live DB Schema Delta — Phase 1A Evidence

**Date:** 2026-05-05
**Scope:** Compare local/repo schema assumptions against live Supabase evidence.
**Status:** Read-only planning document; no schema changes applied.

---

## Methodology

This document compares three sources of schema truth:

1. **Local migration files** (`supabase/migrations/`) — what the repo believes the schema should be.
2. **`DATABASE_SCHEMA.sql`** — the strongest schema snapshot in the repo.
3. **Live Supabase evidence** — what Philip observed on 2026-05-05 via read-only inspection.

---

## Migration Chronology Comparison

### Local Migration Files (repo)

The repo contains migration files. Key files relevant to this audit:

| Migration File | Description | Local Status |
|---|---|---|
| `20260501085339_create_ai_audit_admin_tables.sql` | Creates `ai_audit_runs`, `ai_audit_items`, `ai_audit_findings`, `ai_change_proposals`, `ai_review_decisions`, `ai_audit_status_cache` + views + RLS | Present in repo |
| `20260505145349_restrict_ai_audit_admin_access.sql` | Revokes authenticated SELECT on audit views; grants to service_role only | Present in repo |
| `20260505132000_create_user_exam_date_preferences` | User exam date preferences (unrelated to audit) | Present in repo |

### Live Applied Migrations (Supabase)

**Live endpoint observed by Philip:** `20260505132000_create_user_exam_date_preferences`

| Migration File | Live Applied? | Evidence |
|---|---|---|
| `20260505132000_create_user_exam_date_preferences` | **Yes** | Visible as last applied migration |
| `20260501085339_create_ai_audit_admin_tables.sql` | **Uncertain** | Philip did not report seeing it in the live applied list, but the audit overview views may imply it was applied |
| `20260505145349_restrict_ai_audit_admin_access.sql` | **No** | Philip explicitly did **not** see this in live applied migrations |

**Critical observation:** The live migration endpoint (`20260505132000...`) is **earlier** than the local `restrict_ai_audit_admin_access` migration (`20260505145349...`). This means:
- The restriction migration has **not been applied to live Supabase** as of 2026-05-05.
- If `create_ai_audit_admin_tables` **was** applied earlier, the audit views may still be granting `SELECT` to `authenticated` users.

---

## Table Presence Comparison

### Local Schema Assumptions (from `DATABASE_SCHEMA.sql` and migrations)

The following tables are defined in local files:

| Table | Defined In | RLS? |
|---|---|---|
| `ai_audit_runs` | `20260501085339_create_ai_audit_admin_tables.sql` | Yes |
| `ai_audit_items` | `20260501085339_create_ai_audit_admin_tables.sql` | Yes |
| `ai_audit_findings` | `20260501085339_create_ai_audit_admin_tables.sql` | Yes |
| `ai_change_proposals` | `20260501085339_create_ai_audit_admin_tables.sql` | Yes |
| `ai_review_decisions` | `20260501085339_create_ai_audit_admin_tables.sql` | Yes |
| `ai_audit_status_cache` | `20260501085339_create_ai_audit_admin_tables.sql` | Yes |
| `taxonomy_sources` | `DATABASE_SCHEMA.sql` | Not specified |

### Live Public Table Evidence

**Philip's observation:** "User did not see obvious public `ai_audit_*` tables in the live public table list."

| Table | Live Visible? | Interpretation |
|---|---|---|
| `ai_audit_runs` | **Not confirmed visible** | May not exist live, or may exist but were not in the table list Philip inspected |
| `ai_audit_items` | **Not confirmed visible** | Same as above |
| `ai_audit_findings` | **Not confirmed visible** | Same as above |
| `ai_change_proposals` | **Not confirmed visible** | Same as above |
| `ai_review_decisions` | **Not confirmed visible** | Same as above |
| `ai_audit_status_cache` | **Not confirmed visible** | Same as above |
| `taxonomy_sources` | **Visible** | Confirmed live; row count = 0 |

**Important caveat:** Philip inspected a "live public table list." If the AI audit tables were created in a different schema (e.g., `auth`, `storage`, or a custom schema), they would not appear in the public table list. However, the migration explicitly creates them in `public`.

---

## Deterministic Live Verification Query Required

Philip should run this single read-only query against live Supabase before any admin AI audit integration assumption is treated as live-ready:

```sql
select
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name like 'ai\_audit\_%' escape '\\'
order by table_name;
```

Expected interpretation:

- **Zero rows:** repo/admin AI audit tables are not live in `public`; admin AI audit integration is blocked.
- **Rows returned:** tables exist; then verify whether `20260505145349_restrict_ai_audit_admin_access.sql` is applied and inspect grants/RLS before Phase 1B.

---

## Distinguishing Local from Live

| Question | Local Repo | Live Supabase | Risk |
|---|---|---|---|
| Do `ai_audit_*` tables exist? | Yes — defined in migration | **Uncertain** — not visible in public table list | Plans that assume live audit tables may fail |
| Are audit views restricted to service_role? | Yes — `20260505145349...` migration | **No** — restriction migration not applied | If tables exist live, authenticated users may still have access |
| Is `taxonomy_sources` populated? | Schema exists | **0 rows** despite table comment claiming completeness | Source-grounded editorial pipeline cannot use this table |
| Is `seed_ai_audit_status_cache()` safe to call? | Yes — defined in migration | **Uncertain** — if tables don't exist, function would fail | Do not run live without confirming table existence |

---

## Schema Delta Register

| Delta | Local Evidence | Live Evidence | Severity |
|---|---|---|---|
| `admin-ai-audit-current-state.md` assumes audit tables are usable live | Admin routes/actions map to audit tables | Live public table visibility is unconfirmed | `HIGH_RISK`; document is conditional on live table verification |
| `ai_audit_*` tables may not exist live | Migration file present | Not visible in public table list | `HIGH_RISK` |
| `restrict_ai_audit_admin_access` not applied | Migration file present | Not in applied migration list | `HIGH_RISK` |
| `taxonomy_sources` empty despite comment | `DATABASE_SCHEMA.sql` defines table | 0 rows live; comment claims "v5.0 COMPLETE" | `BLOCKER` for source-grounded pipeline and separate data-integrity investigation |
| `wiki_ei_prompts` empty | Table defined in schema | 0 rows live | `MEDIUM_RISK` (feature may be unused) |
| `design_questions` empty | Table defined in schema | 0 rows live | `LOW_RISK` (may be legacy table) |

---

## What Remains Safe for Phase 1A

- Documenting local schema assumptions from `DATABASE_SCHEMA.sql` and migration files.
- Treating live table visibility as **unconfirmed** rather than **absent** for `ai_audit_*` tables.
- Using the live count of `taxonomy_sources = 0` as evidence of a contradiction.

## What Blocks Phase 1B

- **Unconfirmed `ai_audit_*` table existence live.** Any Phase 1B script that writes to or reads from `ai_audit_runs`, `ai_audit_items`, etc. must first verify table existence. The `admin-ai-audit-current-state.md` document maps 10 admin routes and Server Actions that depend on these tables.
- **Missing restriction migration.** If `ai_audit_*` tables exist live but the restriction migration has not been applied, authenticated learners may have broader access than intended. This is a security issue.
- **`taxonomy_sources` emptiness.** The source-grounded editorial pipeline (`10-source-pack-and-grounding-plan.md`) assumes verified source URLs exist. A table with 0 rows cannot fulfill this role, regardless of what the table comment claims.
- **`wiki_article_sources` substitution undecided.** Live count shows 1,110 article-scoped source rows, but Phase 0.5 must decide whether these rows are verified enough to substitute for any part of `taxonomy_sources` or whether they are merely article metadata links.

## What Claude Should Review Next

1. **Confirm `ai_audit_*` table existence live.** Run a targeted Supabase query or schema inspection to determine whether these tables actually exist in the live public schema.
2. **If tables exist:** Determine whether `20260505145349_restrict_ai_audit_admin_access.sql` should be applied immediately to close the permission gap.
3. **If tables do not exist:** Determine whether the admin AI audit UI is using a different storage mechanism (e.g., local JSON, different tables, or the features are stubbed).
4. **Investigate `taxonomy_sources` comment.** Determine where the "v5.0 COMPLETE: all 66 source URLs populated" comment originates and why the row count is 0.
5. **Update `admin-ai-audit-current-state.md`** if live table non-existence changes the assessment of admin audit surface readiness.
