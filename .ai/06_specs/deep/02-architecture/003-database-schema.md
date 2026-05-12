# Database Schema Reference

**Status:** Active
**Version:** 1.0
**Last Updated:** 2026-04-06
**Source-of-Truth:** `DATABASE_SCHEMA.sql` (root), `supabase/migrations/`

---

## Overview

SlateCamp uses **Supabase PostgreSQL** with Row-Level Security (RLS) on all user-facing tables.

| Metric | Value |
|--------|-------|
| Total tables | 51 |
| Tables with RLS | 50 |
| RLS policies | 89+ |
| Migrations | 60 |

---

## Key Tables

### Core User & Auth

| Table | Purpose |
|-------|---------|
| `users` | User accounts, profiles |
| `profiles` | Extended user metadata |
| `sessions` | User sessions |

### Quiz & Testing

| Table | Purpose |
|-------|---------|
| `quiz_sessions` | Quiz/testing session records |
| `quiz_interactions` | Individual question responses |
| `question_attempts` | Per-question attempt history |

### Mastery & SRS

| Table | Purpose |
|-------|---------|
| `node_mastery` | Mastery level per taxonomy node (IRT-calculated) |
| `srs_schedules` | SM-2 spaced repetition schedules |
| `readiness_scores` | Historical readiness score snapshots |
| `blindspot_queue` | Current blindspot queue (3 weakest + grey nodes) |

### Content

| Table | Purpose |
|-------|---------|
| `questions` | Question bank with IRT parameters |
| `articles` | Wiki articles |
| `taxonomy_nodes` | Subject → topic → subtopic hierarchy |
| `question_taxonomy` | Question-to-node mappings |
| `content_versions` | Version history for articles/questions |

### Admin & Workflow

| Table | Purpose |
|-------|---------|
| `audit_logs` | Content change audit trail |
| `review_queue` | SME review queue items |
| `publish_queue` | Publishing pipeline |

### Analytics

| Table | Purpose |
|-------|---------|
| `competence_signals` | Micro-signal tracking |
| `session_analytics` | Session-level analytics |

### Payments

| Table | Purpose |
|-------|---------|
| `subscriptions` | LemonSqueezy/Payrex subscriptions |
| `payments` | Payment records |

---

## Key Relationships

```
users
  └── profiles (1:1)
  └── quiz_sessions (1:N)
        └── quiz_interactions (1:N)
              └── question_attempts (1:N)
  └── node_mastery (1:N per user, per taxonomy node)
  └── srs_schedules (1:N)
  └── readiness_scores (1:N)

taxonomy_nodes (hierarchical)
  └── node_mastery (1:N)
  └── questions (N:N via question_taxonomy)
  └── articles (1:N)

questions
  └── question_taxonomy (N:N)
  └── quiz_interactions (1:N)
```

---

## IRT Parameters

Questions carry IRT parameters stored in `questions` table:

| Column | Description |
|--------|-------------|
| `difficulty` (b) | Item difficulty parameter |
| `discrimination` (a) | Item discrimination parameter |

These feed into the IRT 2PL model in `src/lib/srs/irt.ts`.

---

## Row-Level Security

**89+ RLS policies** enforce data isolation:

| Scope | Policy Type |
|-------|------------|
| User owns their data | `auth.uid() = user_id` |
| Admin manages content | `auth.role() = 'admin'` |
| Public content | No RLS (articles, questions marked public) |
| CEO views aggregates | `auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'ceo')` |

Always test RLS with `supabase.rpc('has_rls_test_role')` before assuming access.

---

## Migrations

**60 migrations** in `supabase/migrations/`. Each migration is numbered and timestamped.

Never modify existing migrations. Create new migrations for schema changes:

```bash
# Create new migration
npx supabase migration new add_new_table
```

---

## Query Patterns

### Explicit Column Selection (Required)

```typescript
// ✅ CORRECT — explicit columns
const { data } = await supabase
  .from('quiz_sessions')
  .select('id, user_id, mode, started_at, completed_at, score')

// ❌ WRONG — select *
const { data } = await supabase
  .from('quiz_sessions')
  .select('*')
```

### RLS-Safe Queries

```typescript
// Server-side (service role) — bypasses RLS
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Client-side — RLS enforced
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

## Related Documents

- `02-architecture/001-system-architecture.md` — Overall architecture
- `05-reference/001-rls-patterns.md` — RLS policy patterns (verified against migrations)
- `src/lib/srs/irt.ts` — IRT 2PL implementation
- `src/lib/srs/sm2.ts` — SM-2 implementation

---

*Canonical reference: `DATABASE_SCHEMA.sql` in project root. Consult before any database work.*
