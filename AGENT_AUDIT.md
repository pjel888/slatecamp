
# FILE: .\AGENTS.md

<!-- Generated: 2026-03-24 | Updated: 2026-04-02 -->

# SlateCamp

## Purpose

SlateCamp is a high-performance, discipline-agnostic study engine for professional licensure exams. Built with Next.js 16.1.6 (App Router), React 19, Supabase (PostgreSQL), and Three.js for 3D spatial learning. The "Campfire" design system provides a warm, research-backed aesthetic. All mastery calculations use the IRT 2-parameter logistic model. The platform serves 4 portals: Dashboard (student-facing), Admin (content management), CEO (business analytics), and Developer (internal docs and tooling).

For a comprehensive architecture overview, see `GLOBAL-CODEBASE-AUDIT-REPORT.md`.

## Key Files

| File | Description |
|------|-------------|
| `CLAUDE.md` | Core system prompt -- design system tokens, voice guide, absolute constraints, tech stack |
| `GLOBAL-CODEBASE-AUDIT-REPORT.md` | Full codebase audit report with architecture, route map, component inventory |
| `DATABASE_SCHEMA.sql` | Authoritative relational schema -- consult before any DB work |
| `package.json` | Dependencies and scripts (bun as package manager) |
| `next.config.ts` | Next.js config -- Turbopack, server actions (4MB limit), image remotes |
| `middleware.ts` | Supabase auth session refresh + pathname header injection |
| `tailwind.config.ts` | Tailwind v4 CSS-first config with typography plugin |
| `vercel.json` | Cron jobs: blindspot-scan (daily 4pm UTC), compute-signals (daily 4:30pm UTC) |
| `components.json` | shadcn/ui configuration |
| `tsconfig.json` | TypeScript config with `@/` path alias to `src/` |
| `eslint.config.mjs` | ESLint flat config |
| `globals.css` | Tailwind v4 CSS-first theme with Campfire design tokens |
| `bun.lock` | Bun lockfile -- never edit manually |
| `UI-CONSOLIDATION-IMPLEMENTATION-PLAN.md` | Active UI consolidation plan |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | All application source code (see `src/AGENTS.md`) |
| `supabase/` | Database migrations (60) and seed SQL scripts (see `supabase/AGENTS.md`) |
| `scripts/` | Dev tooling -- custom dev server, DB inspection, seeding (see `scripts/AGENTS.md`) |
| `public/` | Static assets -- icons, OG images, widget modules (see `public/AGENTS.md`) |
| `prompts/` | Archived PRDs, specs, and implementation guides (reference only) |
| `docs/` | Planning documents and specs |
| `.claude/` | Agent definitions, skills, and documentation for AI-assisted development |

## Codebase Stats

| Metric | Value |
|--------|-------|
| Total .tsx files | ~1044 |
| Pages (App Router) | 137 across 4 portals |
| Server action files | 116 (in `src/lib/actions/`) |
| Zustand stores | 5 (in `src/stores/`) |
| React Contexts | 10 |
| Database tables | 51 (50 with RLS) |
| RLS policies | 89+ |
| Database migrations | 60 |
| Production dependencies | 56 |
| Dev dependencies | 8 |
| Env variables | 19 (6 `NEXT_PUBLIC_*`, 11 server-only, 2 config) |

## For AI Agents

### Working In This Directory

- **Read `CLAUDE.md` first** -- it defines the Campfire design system, voice guide, and absolute constraints
- **Read `DATABASE_SCHEMA.sql`** before any database-related work -- never hallucinate tables or foreign keys
- **Use `bun`** as the package manager (not npm/yarn/pnpm)
- **Arrow functions only** -- never use `function` declarations
- **Font:** Inter only (loaded via `next/font/google`) -- Syne for display headings, DM Mono for code/data values
- **Minimum text size:** 8px
- **No generic gamification** -- no confetti, badges, virtual currency, or empty streaks
- **4 portals:** Dashboard (`/dashboard`), Admin (`/admin`), CEO (`/ceo`), Developer (`/developer`)
- **Server Components by default** -- only add `'use client'` when interactivity is needed (target <40% client ratio)
- **Always use design tokens** -- never hardcode hex colors in Tailwind classes or inline styles
- **Use `Promise.all()`** for independent queries -- never sequential `await` chains in page.tsx files
- **Use explicit column selects** -- never `select('*')` in Supabase queries
- **All server action files must include `"use server"` directive** at the top
- **Wrap server actions in try/catch** -- never let raw Supabase errors propagate to client

### Campfire Design System (Quick Reference)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| Camp Cobalt | `#1B3FC4` | `text-primary` / `bg-primary` | Primary actions, nav, links, active states |
| Camp Orange | `#E8853A` | — | Progress celebration, warm CTAs (sparingly) |
| Emerald | `#2D9F6F` | `text-success` | Success, mastery, correct answers |
| Warm Red | `#D64545` | `text-destructive` | Error, critical -- always with context |
| Amber | `#D4951A` | `text-warning` | Warning, developing skill |
| Surface Light | `#F8F7F5` | `bg-background` | Page background (warm white) |
| Ink Primary | `#1A2332` | `text-foreground` | Main text |
| Border | `#D4DAE3` | `border-border` | Default borders |
| Ink Secondary | `#4A5568` | `text-text-secondary` | Secondary text |
| Ink Tertiary | `#8896A7` | `text-muted-foreground` | Muted text, placeholders |
| Cobalt Light | `#EEF2FC` | `bg-primary-50` | Light primary backgrounds |
| Cobalt Dark | `#1535A8` | `text-primary-700` | Dark primary text/accents |

- **Border radius:** `rounded-sm` (buttons/inputs), `rounded-md` (cards), `rounded-lg` (modals) -- never `rounded-xl`+
- **Shadows:** `shadow-sm` on hover, `shadow-md` dropdowns, `shadow-lg` modals -- never `shadow-xl`+ on non-modal
- **Transitions:** max 300ms, default `duration-150 ease-out` -- never `bounce`/`spring` easing
- **Use `<Card>` component** from `@/components/ui/card` -- never ad-hoc card divs
- **Sanitize HTML** -- always use `DOMPurify.sanitize()` before `dangerouslySetInnerHTML`

### Portal Architecture

| Portal | Pages | Key Features |
|--------|-------|-------------|
| Dashboard | 33 | Wiki, Testing Hub (7 modes), Analytics (8 visualizations), Notes, 3D Lab, Camp Trails, Assessment |
| Admin | 27 | Articles CRUD, Questions CRUD + Import, Taxonomy Editor, Coverage Map, Publishing Pipeline, SME Review |
| CEO | 4 | Command Center (MRR/ARR), Financials (P&L), Behavioral Insights, Team Management |
| Developer | 21 | Design System Catalog, API Reference, Architecture Docs, Dev Tools, Status Dashboard |

### Data Fetching Patterns

- **Server Components** fetch data directly via server actions or Supabase queries
- **Query modules** live in `src/lib/queries/` -- prefer these over inline queries in page.tsx
- **Server Actions** in `src/lib/actions/` handle all mutations (create, update, delete)
- Use **Suspense boundaries** for independent data sections (see analytics page for gold standard)
- **Loading skeletons** via `loading.tsx` -- 87/105 pages have loading states

### Pedagogical Engine

| Component | Location | Notes |
|-----------|----------|-------|
| IRT 2PL Model | `src/lib/srs/irt.ts` | `P(θ) = 1 / (1 + exp(-a * (θ - b)))` |
| SM-2 SRS | `src/lib/srs/sm2.ts` | Standard SM-2 with ease floor at 1.3 |
| SRS Updates | `src/lib/srs/update.ts` | Quality derivation + schedule updates |
| Readiness Score | `src/lib/readiness-score.ts` | 330-line anti-inflation 6-vector computation |
| Blindspot Queue | `src/lib/srs/blindspot.ts` | 3 weakest nodes + unexplored grey nodes |
| Testing Actions | `src/lib/actions/testing.ts` | Session creation, interaction saving, 7 modes |
| Quiz Actions | `src/lib/actions/quiz.ts` | Legacy quiz flow with SRS integration |

### Testing Requirements

- `bun run lint` -- ESLint checks
- `bun run type-check` -- TypeScript strict mode
- `bun run build` -- Full production build

### Common Patterns

- Server Components by default; `'use client'` only when interactivity is needed
- Supabase auth via middleware session refresh
- Server Actions in `src/lib/actions/` for all mutations
- Zustand stores in `src/stores/` for client state
- shadcn/ui + Tailwind v4 CSS variables for theming
- IRT 2-parameter logistic model for all mastery/readiness calculations
- Portal shell pattern: each portal uses `PortalLayout` from `@/components/portal`
- 3D scenes use `frameloop="demand"` and `dpr={[1,1.5]}` for performance
- Wiki widgets lazy-loaded via content-aware widget registry
- Quiz sessions auto-save every 10 seconds with localStorage + server sync

## Dependencies

### External (Key)

- `next` 16.1.6 -- App Router, Server Components, Server Actions
- `react` 19.2.4 -- Latest React with RSC support
- `typescript` 5.9.3 -- Strict mode
- `tailwindcss` 4.2.2 -- CSS-first config with Campfire design tokens
- `@supabase/supabase-js` 2.100.0 + `@supabase/ssr` 0.9.0 -- Database and auth
- `@react-three/fiber` 9.5.0 + `three` 0.183.2 -- 3D spatial learning (60 FPS target)
- `zustand` 5.0.12 -- Client state management
- `@base-ui/react` 0.9.5 + `shadcn` 4.1.0 -- UI primitives
- `@anthropic-ai/sdk` 0.78.0 -- AI contextual tutor (Temperature 0.0, citation-required)
- `stripe` 20.4.1 + `payrex-node` 1.7.3 -- Payment processing
- `framer-motion` 12.38.0 -- Structural animations (max 300ms transitions)
- `recharts` 3.8.0 -- Analytics charts
- `@tiptap/*` 3.20.4 (13 extensions) -- Rich text editor for notes
- `zod` -- Schema validation
- `lucide-react` 0.577.0 + `@phosphor-icons/react` 2.1.10 -- Icon libraries

<!-- MANUAL: -->


---


# FILE: .ai\skills\supabase-postgres-best-practices\AGENTS.md

# Postgres Best Practices

**Version 1.0.0**
Supabase
January 2026

> This document is optimized for AI agents and LLMs. Rules are prioritized by performance impact.

---

## Abstract

Comprehensive Postgres performance optimization guide for developers using Supabase and Postgres. Contains performance rules across 8 categories, prioritized by impact from critical (query performance, connection management) to incremental (advanced features). Each rule includes detailed explanations, incorrect vs. correct SQL examples, query plan analysis, and specific performance metrics to guide automated optimization and code generation.

---

## Table of Contents

1. [Query Performance](#query-performance) - **CRITICAL**
   - 1.1 [Add Indexes on WHERE and JOIN Columns](#11-add-indexes-on-where-and-join-columns)
   - 1.2 [Choose the Right Index Type for Your Data](#12-choose-the-right-index-type-for-your-data)
   - 1.3 [Create Composite Indexes for Multi-Column Queries](#13-create-composite-indexes-for-multi-column-queries)
   - 1.4 [Use Covering Indexes to Avoid Table Lookups](#14-use-covering-indexes-to-avoid-table-lookups)
   - 1.5 [Use Partial Indexes for Filtered Queries](#15-use-partial-indexes-for-filtered-queries)

2. [Connection Management](#connection-management) - **CRITICAL**
   - 2.1 [Configure Idle Connection Timeouts](#21-configure-idle-connection-timeouts)
   - 2.2 [Set Appropriate Connection Limits](#22-set-appropriate-connection-limits)
   - 2.3 [Use Connection Pooling for All Applications](#23-use-connection-pooling-for-all-applications)
   - 2.4 [Use Prepared Statements Correctly with Pooling](#24-use-prepared-statements-correctly-with-pooling)

3. [Security & RLS](#security-rls) - **CRITICAL**
   - 3.1 [Apply Principle of Least Privilege](#31-apply-principle-of-least-privilege)
   - 3.2 [Enable Row Level Security for Multi-Tenant Data](#32-enable-row-level-security-for-multi-tenant-data)
   - 3.3 [Optimize RLS Policies for Performance](#33-optimize-rls-policies-for-performance)

4. [Schema Design](#schema-design) - **HIGH**
   - 4.1 [Choose Appropriate Data Types](#41-choose-appropriate-data-types)
   - 4.2 [Index Foreign Key Columns](#42-index-foreign-key-columns)
   - 4.3 [Partition Large Tables for Better Performance](#43-partition-large-tables-for-better-performance)
   - 4.4 [Select Optimal Primary Key Strategy](#44-select-optimal-primary-key-strategy)
   - 4.5 [Use Lowercase Identifiers for Compatibility](#45-use-lowercase-identifiers-for-compatibility)

5. [Concurrency & Locking](#concurrency-locking) - **MEDIUM-HIGH**
   - 5.1 [Keep Transactions Short to Reduce Lock Contention](#51-keep-transactions-short-to-reduce-lock-contention)
   - 5.2 [Prevent Deadlocks with Consistent Lock Ordering](#52-prevent-deadlocks-with-consistent-lock-ordering)
   - 5.3 [Use Advisory Locks for Application-Level Locking](#53-use-advisory-locks-for-application-level-locking)
   - 5.4 [Use SKIP LOCKED for Non-Blocking Queue Processing](#54-use-skip-locked-for-non-blocking-queue-processing)

6. [Data Access Patterns](#data-access-patterns) - **MEDIUM**
   - 6.1 [Batch INSERT Statements for Bulk Data](#61-batch-insert-statements-for-bulk-data)
   - 6.2 [Eliminate N+1 Queries with Batch Loading](#62-eliminate-n1-queries-with-batch-loading)
   - 6.3 [Use Cursor-Based Pagination Instead of OFFSET](#63-use-cursor-based-pagination-instead-of-offset)
   - 6.4 [Use UPSERT for Insert-or-Update Operations](#64-use-upsert-for-insert-or-update-operations)

7. [Monitoring & Diagnostics](#monitoring-diagnostics) - **LOW-MEDIUM**
   - 7.1 [Enable pg_stat_statements for Query Analysis](#71-enable-pgstatstatements-for-query-analysis)
   - 7.2 [Maintain Table Statistics with VACUUM and ANALYZE](#72-maintain-table-statistics-with-vacuum-and-analyze)
   - 7.3 [Use EXPLAIN ANALYZE to Diagnose Slow Queries](#73-use-explain-analyze-to-diagnose-slow-queries)

8. [Advanced Features](#advanced-features) - **LOW**
   - 8.1 [Index JSONB Columns for Efficient Querying](#81-index-jsonb-columns-for-efficient-querying)
   - 8.2 [Use tsvector for Full-Text Search](#82-use-tsvector-for-full-text-search)

---

## 1. Query Performance

**Impact: CRITICAL**

Slow queries, missing indexes, inefficient query plans. The most common source of Postgres performance issues.

### 1.1 Add Indexes on WHERE and JOIN Columns

**Impact: CRITICAL (100-1000x faster queries on large tables)**

Queries filtering or joining on unindexed columns cause full table scans, which become exponentially slower as tables grow.

**Incorrect (sequential scan on large table):**

```sql
-- No index on customer_id causes full table scan
select * from orders where customer_id = 123;

-- EXPLAIN shows: Seq Scan on orders (cost=0.00..25000.00 rows=100 width=85)
```

**Correct (index scan):**

```sql
-- Create index on frequently filtered column
create index orders_customer_id_idx on orders (customer_id);

select * from orders where customer_id = 123;

-- EXPLAIN shows: Index Scan using orders_customer_id_idx (cost=0.42..8.44 rows=100 width=85)
-- Index the referencing column
create index orders_customer_id_idx on orders (customer_id);

select c.name, o.total
from customers c
join orders o on o.customer_id = c.id;
```

For JOIN columns, always index the foreign key side:

Reference: https://supabase.com/docs/guides/database/query-optimization

---

### 1.2 Choose the Right Index Type for Your Data

**Impact: HIGH (10-100x improvement with correct index type)**

Different index types excel at different query patterns. The default B-tree isn't always optimal.

**Incorrect (B-tree for JSONB containment):**

```sql
-- B-tree cannot optimize containment operators
create index products_attrs_idx on products (attributes);
select * from products where attributes @> '{"color": "red"}';
-- Full table scan - B-tree doesn't support @> operator
```

**Correct (GIN for JSONB):**

```sql
-- GIN supports @>, ?, ?&, ?| operators
create index products_attrs_idx on products using gin (attributes);
select * from products where attributes @> '{"color": "red"}';
-- B-tree (default): =, <, >, BETWEEN, IN, IS NULL
create index users_created_idx on users (created_at);

-- GIN: arrays, JSONB, full-text search
create index posts_tags_idx on posts using gin (tags);

-- BRIN: large time-series tables (10-100x smaller)
create index events_time_idx on events using brin (created_at);

-- Hash: equality-only (slightly faster than B-tree for =)
create index sessions_token_idx on sessions using hash (token);
```

Index type guide:

Reference: https://www.postgresql.org/docs/current/indexes-types.html

---

### 1.3 Create Composite Indexes for Multi-Column Queries

**Impact: HIGH (5-10x faster multi-column queries)**

When queries filter on multiple columns, a composite index is more efficient than separate single-column indexes.

**Incorrect (separate indexes require bitmap scan):**

```sql
-- Two separate indexes
create index orders_status_idx on orders (status);
create index orders_created_idx on orders (created_at);

-- Query must combine both indexes (slower)
select * from orders where status = 'pending' and created_at > '2024-01-01';
```

**Correct (composite index):**

```sql
-- Single composite index (leftmost column first for equality checks)
create index orders_status_created_idx on orders (status, created_at);

-- Query uses one efficient index scan
select * from orders where status = 'pending' and created_at > '2024-01-01';
-- Good: status (=) before created_at (>)
create index idx on orders (status, created_at);

-- Works for: WHERE status = 'pending'
-- Works for: WHERE status = 'pending' AND created_at > '2024-01-01'
-- Does NOT work for: WHERE created_at > '2024-01-01' (leftmost prefix rule)
```

**Column order matters** - place equality columns first, range columns last:

Reference: https://www.postgresql.org/docs/current/indexes-multicolumn.html

---

### 1.4 Use Covering Indexes to Avoid Table Lookups

**Impact: MEDIUM-HIGH (2-5x faster queries by eliminating heap fetches)**

Covering indexes include all columns needed by a query, enabling index-only scans that skip the table entirely.

**Incorrect (index scan + heap fetch):**

```sql
create index users_email_idx on users (email);

-- Must fetch name and created_at from table heap
select email, name, created_at from users where email = 'user@example.com';
```

**Correct (index-only scan with INCLUDE):**

```sql
-- Include non-searchable columns in the index
create index users_email_idx on users (email) include (name, created_at);

-- All columns served from index, no table access needed
select email, name, created_at from users where email = 'user@example.com';
-- Searching by status, but also need customer_id and total
create index orders_status_idx on orders (status) include (customer_id, total);

select status, customer_id, total from orders where status = 'shipped';
```

Use INCLUDE for columns you SELECT but don't filter on:

Reference: https://www.postgresql.org/docs/current/indexes-index-only-scans.html

---

### 1.5 Use Partial Indexes for Filtered Queries

**Impact: HIGH (5-20x smaller indexes, faster writes and queries)**

Partial indexes only include rows matching a WHERE condition, making them smaller and faster when queries consistently filter on the same condition.

**Incorrect (full index includes irrelevant rows):**

```sql
-- Index includes all rows, even soft-deleted ones
create index users_email_idx on users (email);

-- Query always filters active users
select * from users where email = 'user@example.com' and deleted_at is null;
```

**Correct (partial index matches query filter):**

```sql
-- Index only includes active users
create index users_active_email_idx on users (email)
where deleted_at is null;

-- Query uses the smaller, faster index
select * from users where email = 'user@example.com' and deleted_at is null;
-- Only pending orders (status rarely changes once completed)
create index orders_pending_idx on orders (created_at)
where status = 'pending';

-- Only non-null values
create index products_sku_idx on products (sku)
where sku is not null;
```

Common use cases for partial indexes:

Reference: https://www.postgresql.org/docs/current/indexes-partial.html

---

## 2. Connection Management

**Impact: CRITICAL**

Connection pooling, limits, and serverless strategies. Critical for applications with high concurrency or serverless deployments.

### 2.1 Configure Idle Connection Timeouts

**Impact: HIGH (Reclaim 30-50% of connection slots from idle clients)**

Idle connections waste resources. Configure timeouts to automatically reclaim them.

**Incorrect (connections held indefinitely):**

```sql
-- No timeout configured
show idle_in_transaction_session_timeout;  -- 0 (disabled)

-- Connections stay open forever, even when idle
select pid, state, state_change, query
from pg_stat_activity
where state = 'idle in transaction';
-- Shows transactions idle for hours, holding locks
```

**Correct (automatic cleanup of idle connections):**

```ini
-- Terminate connections idle in transaction after 30 seconds
alter system set idle_in_transaction_session_timeout = '30s';

-- Terminate completely idle connections after 10 minutes
alter system set idle_session_timeout = '10min';

-- Reload configuration
select pg_reload_conf();
# pgbouncer.ini
server_idle_timeout = 60
client_idle_timeout = 300
```

For pooled connections, configure at the pooler level:

Reference: https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT

---

### 2.2 Set Appropriate Connection Limits

**Impact: CRITICAL (Prevent database crashes and memory exhaustion)**

Too many connections exhaust memory and degrade performance. Set limits based on available resources.

**Incorrect (unlimited or excessive connections):**

```sql
-- Default max_connections = 100, but often increased blindly
show max_connections;  -- 500 (way too high for 4GB RAM)

-- Each connection uses 1-3MB RAM
-- 500 connections * 2MB = 1GB just for connections!
-- Out of memory errors under load
```

**Correct (calculate based on resources):**

```sql
-- Formula: max_connections = (RAM in MB / 5MB per connection) - reserved
-- For 4GB RAM: (4096 / 5) - 10 = ~800 theoretical max
-- But practically, 100-200 is better for query performance

-- Recommended settings for 4GB RAM
alter system set max_connections = 100;

-- Also set work_mem appropriately
-- work_mem * max_connections should not exceed 25% of RAM
alter system set work_mem = '8MB';  -- 8MB * 100 = 800MB max
select count(*), state from pg_stat_activity group by state;
```

Monitor connection usage:

Reference: https://supabase.com/docs/guides/platform/performance#connection-management

---

### 2.3 Use Connection Pooling for All Applications

**Impact: CRITICAL (Handle 10-100x more concurrent users)**

Postgres connections are expensive (1-3MB RAM each). Without pooling, applications exhaust connections under load.

**Incorrect (new connection per request):**

```sql
-- Each request creates a new connection
-- Application code: db.connect() per request
-- Result: 500 concurrent users = 500 connections = crashed database

-- Check current connections
select count(*) from pg_stat_activity;  -- 487 connections!
```

**Correct (connection pooling):**

```sql
-- Use a pooler like PgBouncer between app and database
-- Application connects to pooler, pooler reuses a small pool to Postgres

-- Configure pool_size based on: (CPU cores * 2) + spindle_count
-- Example for 4 cores: pool_size = 10

-- Result: 500 concurrent users share 10 actual connections
select count(*) from pg_stat_activity;  -- 10 connections
```

Pool modes:
- **Transaction mode**: connection returned after each transaction (best for most apps)
- **Session mode**: connection held for entire session (needed for prepared statements, temp tables)

Reference: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler

---

### 2.4 Use Prepared Statements Correctly with Pooling

**Impact: HIGH (Avoid prepared statement conflicts in pooled environments)**

Prepared statements are tied to individual database connections. In transaction-mode pooling, connections are shared, causing conflicts.

**Incorrect (named prepared statements with transaction pooling):**

```sql
-- Named prepared statement
prepare get_user as select * from users where id = $1;

-- In transaction mode pooling, next request may get different connection
execute get_user(123);
-- ERROR: prepared statement "get_user" does not exist
```

**Correct (use unnamed statements or session mode):**

```sql
-- Option 1: Use unnamed prepared statements (most ORMs do this automatically)
-- The query is prepared and executed in a single protocol message

-- Option 2: Deallocate after use in transaction mode
prepare get_user as select * from users where id = $1;
execute get_user(123);
deallocate get_user;

-- Option 3: Use session mode pooling (port 5432 vs 6543)
-- Connection is held for entire session, prepared statements persist
-- Many drivers use prepared statements by default
-- Node.js pg: { prepare: false } to disable
-- JDBC: prepareThreshold=0 to disable
```

Check your driver settings:

Reference: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pool-modes

---

## 3. Security & RLS

**Impact: CRITICAL**

Row-Level Security policies, privilege management, and authentication patterns.

### 3.1 Apply Principle of Least Privilege

**Impact: MEDIUM (Reduced attack surface, better audit trail)**

Grant only the minimum permissions required. Never use superuser for application queries.

**Incorrect (overly broad permissions):**

```sql
-- Application uses superuser connection
-- Or grants ALL to application role
grant all privileges on all tables in schema public to app_user;
grant all privileges on all sequences in schema public to app_user;

-- Any SQL injection becomes catastrophic
-- drop table users; cascades to everything
```

**Correct (minimal, specific grants):**

```sql
-- Create role with no default privileges
create role app_readonly nologin;

-- Grant only SELECT on specific tables
grant usage on schema public to app_readonly;
grant select on public.products, public.categories to app_readonly;

-- Create role for writes with limited scope
create role app_writer nologin;
grant usage on schema public to app_writer;
grant select, insert, update on public.orders to app_writer;
grant usage on sequence orders_id_seq to app_writer;
-- No DELETE permission

-- Login role inherits from these
create role app_user login password 'xxx';
grant app_writer to app_user;
-- Revoke default public access
revoke all on schema public from public;
revoke all on all tables in schema public from public;
```

Revoke public defaults:

Reference: https://supabase.com/blog/postgres-roles-and-privileges

---

### 3.2 Enable Row Level Security for Multi-Tenant Data

**Impact: CRITICAL (Database-enforced tenant isolation, prevent data leaks)**

Row Level Security (RLS) enforces data access at the database level, ensuring users only see their own data.

**Incorrect (application-level filtering only):**

```sql
-- Relying only on application to filter
select * from orders where user_id = $current_user_id;

-- Bug or bypass means all data is exposed!
select * from orders;  -- Returns ALL orders
```

**Correct (database-enforced RLS):**

```sql
-- Enable RLS on the table
alter table orders enable row level security;

-- Create policy for users to see only their orders
create policy orders_user_policy on orders
  for all
  using (user_id = current_setting('app.current_user_id')::bigint);

-- Force RLS even for table owners
alter table orders force row level security;

-- Set user context and query
set app.current_user_id = '123';
select * from orders;  -- Only returns orders for user 123
create policy orders_user_policy on orders
  for all
  to authenticated
  using (user_id = auth.uid());
```

Policy for authenticated role:

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security

---

### 3.3 Optimize RLS Policies for Performance

**Impact: HIGH (5-10x faster RLS queries with proper patterns)**

Poorly written RLS policies can cause severe performance issues. Use subqueries and indexes strategically.

**Incorrect (function called for every row):**

```sql
create policy orders_policy on orders
  using (auth.uid() = user_id);  -- auth.uid() called per row!

-- With 1M rows, auth.uid() is called 1M times
```

**Correct (wrap functions in SELECT):**

```sql
create policy orders_policy on orders
  using ((select auth.uid()) = user_id);  -- Called once, cached

-- 100x+ faster on large tables
-- Create helper function (runs as definer, bypasses RLS)
create or replace function is_team_member(team_id bigint)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.team_members
    where team_id = $1 and user_id = (select auth.uid())
  );
$$;

-- Use in policy (indexed lookup, not per-row check)
create policy team_orders_policy on orders
  using ((select is_team_member(team_id)));
create index orders_user_id_idx on orders (user_id);
```

Use security definer functions for complex checks:
Always add indexes on columns used in RLS policies:

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations

---

## 4. Schema Design

**Impact: HIGH**

Table design, index strategies, partitioning, and data type selection. Foundation for long-term performance.

### 4.1 Choose Appropriate Data Types

**Impact: HIGH (50% storage reduction, faster comparisons)**

Using the right data types reduces storage, improves query performance, and prevents bugs.

**Incorrect (wrong data types):**

```sql
create table users (
  id int,                    -- Will overflow at 2.1 billion
  email varchar(255),        -- Unnecessary length limit
  created_at timestamp,      -- Missing timezone info
  is_active varchar(5),      -- String for boolean
  price varchar(20)          -- String for numeric
);
```

**Correct (appropriate data types):**

```sql
create table users (
  id bigint generated always as identity primary key,  -- 9 quintillion max
  email text,                     -- No artificial limit, same performance as varchar
  created_at timestamptz,         -- Always store timezone-aware timestamps
  is_active boolean default true, -- 1 byte vs variable string length
  price numeric(10,2)             -- Exact decimal arithmetic
);
-- IDs: use bigint, not int (future-proofing)
-- Strings: use text, not varchar(n) unless constraint needed
-- Time: use timestamptz, not timestamp
-- Money: use numeric, not float (precision matters)
-- Enums: use text with check constraint or create enum type
```

Key guidelines:

Reference: https://www.postgresql.org/docs/current/datatype.html

---

### 4.2 Index Foreign Key Columns

**Impact: HIGH (10-100x faster JOINs and CASCADE operations)**

Postgres does not automatically index foreign key columns. Missing indexes cause slow JOINs and CASCADE operations.

**Incorrect (unindexed foreign key):**

```sql
create table orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  total numeric(10,2)
);

-- No index on customer_id!
-- JOINs and ON DELETE CASCADE both require full table scan
select * from orders where customer_id = 123;  -- Seq Scan
delete from customers where id = 123;          -- Locks table, scans all orders
```

**Correct (indexed foreign key):**

```sql
create table orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  total numeric(10,2)
);

-- Always index the FK column
create index orders_customer_id_idx on orders (customer_id);

-- Now JOINs and cascades are fast
select * from orders where customer_id = 123;  -- Index Scan
delete from customers where id = 123;          -- Uses index, fast cascade
select
  conrelid::regclass as table_name,
  a.attname as fk_column
from pg_constraint c
join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
where c.contype = 'f'
  and not exists (
    select 1 from pg_index i
    where i.indrelid = c.conrelid and a.attnum = any(i.indkey)
  );
```

Find missing FK indexes:

Reference: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK

---

### 4.3 Partition Large Tables for Better Performance

**Impact: MEDIUM-HIGH (5-20x faster queries and maintenance on large tables)**

Partitioning splits a large table into smaller pieces, improving query performance and maintenance operations.

**Incorrect (single large table):**

```sql
create table events (
  id bigint generated always as identity,
  created_at timestamptz,
  data jsonb
);

-- 500M rows, queries scan everything
select * from events where created_at > '2024-01-01';  -- Slow
vacuum events;  -- Takes hours, locks table
```

**Correct (partitioned by time range):**

```sql
create table events (
  id bigint generated always as identity,
  created_at timestamptz not null,
  data jsonb
) partition by range (created_at);

-- Create partitions for each month
create table events_2024_01 partition of events
  for values from ('2024-01-01') to ('2024-02-01');

create table events_2024_02 partition of events
  for values from ('2024-02-01') to ('2024-03-01');

-- Queries only scan relevant partitions
select * from events where created_at > '2024-01-15';  -- Only scans events_2024_01+

-- Drop old data instantly
drop table events_2023_01;  -- Instant vs DELETE taking hours
```

When to partition:
- Tables > 100M rows
- Time-series data with date-based queries
- Need to efficiently drop old data

Reference: https://www.postgresql.org/docs/current/ddl-partitioning.html

---

### 4.4 Select Optimal Primary Key Strategy

**Impact: HIGH (Better index locality, reduced fragmentation)**

Primary key choice affects insert performance, index size, and replication
efficiency.

**Incorrect (problematic PK choices):**

```sql
-- identity is the SQL-standard approach
create table users (
  id serial primary key  -- Works, but IDENTITY is recommended
);

-- Random UUIDs (v4) cause index fragmentation
create table orders (
  id uuid default gen_random_uuid() primary key  -- UUIDv4 = random = scattered inserts
);
```

**Correct (optimal PK strategies):**

```sql
-- Use IDENTITY for sequential IDs (SQL-standard, best for most cases)
create table users (
  id bigint generated always as identity primary key
);

-- For distributed systems needing UUIDs, use UUIDv7 (time-ordered)
-- Requires pg_uuidv7 extension: create extension pg_uuidv7;
create table orders (
  id uuid default uuid_generate_v7() primary key  -- Time-ordered, no fragmentation
);

-- Alternative: time-prefixed IDs for sortable, distributed IDs (no extension needed)
create table events (
  id text default concat(
    to_char(now() at time zone 'utc', 'YYYYMMDDHH24MISSMS'),
    gen_random_uuid()::text
  ) primary key
);
```

Guidelines:
- Single database: `bigint identity` (sequential, 8 bytes, SQL-standard)
- Distributed/exposed IDs: UUIDv7 (requires pg_uuidv7) or ULID (time-ordered, no
  fragmentation)
- `serial` works but `identity` is SQL-standard and preferred for new
  applications
- Avoid random UUIDs (v4) as primary keys on large tables (causes index
  fragmentation)
[Identity Columns](https://www.postgresql.org/docs/current/sql-createtable.html#SQL-CREATETABLE-PARMS-GENERATED-IDENTITY)

---

### 4.5 Use Lowercase Identifiers for Compatibility

**Impact: MEDIUM (Avoid case-sensitivity bugs with tools, ORMs, and AI assistants)**

PostgreSQL folds unquoted identifiers to lowercase. Quoted mixed-case identifiers require quotes forever and cause issues with tools, ORMs, and AI assistants that may not recognize them.

**Incorrect (mixed-case identifiers):**

```sql
-- Quoted identifiers preserve case but require quotes everywhere
CREATE TABLE "Users" (
  "userId" bigint PRIMARY KEY,
  "firstName" text,
  "lastName" text
);

-- Must always quote or queries fail
SELECT "firstName" FROM "Users" WHERE "userId" = 1;

-- This fails - Users becomes users without quotes
SELECT firstName FROM Users;
-- ERROR: relation "users" does not exist
```

**Correct (lowercase snake_case):**

```sql
-- Unquoted lowercase identifiers are portable and tool-friendly
CREATE TABLE users (
  user_id bigint PRIMARY KEY,
  first_name text,
  last_name text
);

-- Works without quotes, recognized by all tools
SELECT first_name FROM users WHERE user_id = 1;
-- ORMs often generate quoted camelCase - configure them to use snake_case
-- Migrations from other databases may preserve original casing
-- Some GUI tools quote identifiers by default - disable this

-- If stuck with mixed-case, create views as a compatibility layer
CREATE VIEW users AS SELECT "userId" AS user_id, "firstName" AS first_name FROM "Users";
```

Common sources of mixed-case identifiers:

Reference: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS

---

## 5. Concurrency & Locking

**Impact: MEDIUM-HIGH**

Transaction management, isolation levels, deadlock prevention, and lock contention patterns.

### 5.1 Keep Transactions Short to Reduce Lock Contention

**Impact: MEDIUM-HIGH (3-5x throughput improvement, fewer deadlocks)**

Long-running transactions hold locks that block other queries. Keep transactions as short as possible.

**Incorrect (long transaction with external calls):**

```sql
begin;
select * from orders where id = 1 for update;  -- Lock acquired

-- Application makes HTTP call to payment API (2-5 seconds)
-- Other queries on this row are blocked!

update orders set status = 'paid' where id = 1;
commit;  -- Lock held for entire duration
```

**Correct (minimal transaction scope):**

```sql
-- Validate data and call APIs outside transaction
-- Application: response = await paymentAPI.charge(...)

-- Only hold lock for the actual update
begin;
update orders
set status = 'paid', payment_id = $1
where id = $2 and status = 'pending'
returning *;
commit;  -- Lock held for milliseconds
-- Abort queries running longer than 30 seconds
set statement_timeout = '30s';

-- Or per-session
set local statement_timeout = '5s';
```

Use `statement_timeout` to prevent runaway transactions:

Reference: https://www.postgresql.org/docs/current/tutorial-transactions.html

---

### 5.2 Prevent Deadlocks with Consistent Lock Ordering

**Impact: MEDIUM-HIGH (Eliminate deadlock errors, improve reliability)**

Deadlocks occur when transactions lock resources in different orders. Always
acquire locks in a consistent order.

**Incorrect (inconsistent lock ordering):**

```sql
-- Transaction A                    -- Transaction B
begin;                              begin;
update accounts                     update accounts
set balance = balance - 100         set balance = balance - 50
where id = 1;                       where id = 2;  -- B locks row 2

update accounts                     update accounts
set balance = balance + 100         set balance = balance + 50
where id = 2;  -- A waits for B     where id = 1;  -- B waits for A

-- DEADLOCK! Both waiting for each other
```

**Correct (lock rows in consistent order first):**

```sql
-- Explicitly acquire locks in ID order before updating
begin;
select * from accounts where id in (1, 2) order by id for update;

-- Now perform updates in any order - locks already held
update accounts set balance = balance - 100 where id = 1;
update accounts set balance = balance + 100 where id = 2;
commit;
-- Single statement acquires all locks atomically
begin;
update accounts
set balance = balance + case id
  when 1 then -100
  when 2 then 100
end
where id in (1, 2);
commit;
-- Check for recent deadlocks
select * from pg_stat_database where deadlocks > 0;

-- Enable deadlock logging
set log_lock_waits = on;
set deadlock_timeout = '1s';
```

Alternative: use a single statement to update atomically:
Detect deadlocks in logs:
[Deadlocks](https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS)

---

### 5.3 Use Advisory Locks for Application-Level Locking

**Impact: MEDIUM (Efficient coordination without row-level lock overhead)**

Advisory locks provide application-level coordination without requiring database rows to lock.

**Incorrect (creating rows just for locking):**

```sql
-- Creating dummy rows to lock on
create table resource_locks (
  resource_name text primary key
);

insert into resource_locks values ('report_generator');

-- Lock by selecting the row
select * from resource_locks where resource_name = 'report_generator' for update;
```

**Correct (advisory locks):**

```sql
-- Session-level advisory lock (released on disconnect or unlock)
select pg_advisory_lock(hashtext('report_generator'));
-- ... do exclusive work ...
select pg_advisory_unlock(hashtext('report_generator'));

-- Transaction-level lock (released on commit/rollback)
begin;
select pg_advisory_xact_lock(hashtext('daily_report'));
-- ... do work ...
commit;  -- Lock automatically released
-- Returns immediately with true/false instead of waiting
select pg_try_advisory_lock(hashtext('resource_name'));

-- Use in application
if (acquired) {
  -- Do work
  select pg_advisory_unlock(hashtext('resource_name'));
} else {
  -- Skip or retry later
}
```

Try-lock for non-blocking operations:

Reference: https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS

---

### 5.4 Use SKIP LOCKED for Non-Blocking Queue Processing

**Impact: MEDIUM-HIGH (10x throughput for worker queues)**

When multiple workers process a queue, SKIP LOCKED allows workers to process different rows without waiting.

**Incorrect (workers block each other):**

```sql
-- Worker 1 and Worker 2 both try to get next job
begin;
select * from jobs where status = 'pending' order by created_at limit 1 for update;
-- Worker 2 waits for Worker 1's lock to release!
```

**Correct (SKIP LOCKED for parallel processing):**

```sql
-- Each worker skips locked rows and gets the next available
begin;
select * from jobs
where status = 'pending'
order by created_at
limit 1
for update skip locked;

-- Worker 1 gets job 1, Worker 2 gets job 2 (no waiting)

update jobs set status = 'processing' where id = $1;
commit;
-- Atomic claim-and-update in one statement
update jobs
set status = 'processing', worker_id = $1, started_at = now()
where id = (
  select id from jobs
  where status = 'pending'
  order by created_at
  limit 1
  for update skip locked
)
returning *;
```

Complete queue pattern:

Reference: https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE

---

## 6. Data Access Patterns

**Impact: MEDIUM**

N+1 query elimination, batch operations, cursor-based pagination, and efficient data fetching.

### 6.1 Batch INSERT Statements for Bulk Data

**Impact: MEDIUM (10-50x faster bulk inserts)**

Individual INSERT statements have high overhead. Batch multiple rows in single statements or use COPY.

**Incorrect (individual inserts):**

```sql
-- Each insert is a separate transaction and round trip
insert into events (user_id, action) values (1, 'click');
insert into events (user_id, action) values (1, 'view');
insert into events (user_id, action) values (2, 'click');
-- ... 1000 more individual inserts

-- 1000 inserts = 1000 round trips = slow
```

**Correct (batch insert):**

```sql
-- Multiple rows in single statement
insert into events (user_id, action) values
  (1, 'click'),
  (1, 'view'),
  (2, 'click'),
  -- ... up to ~1000 rows per batch
  (999, 'view');

-- One round trip for 1000 rows
-- COPY is fastest for bulk loading
copy events (user_id, action, created_at)
from '/path/to/data.csv'
with (format csv, header true);

-- Or from stdin in application
copy events (user_id, action) from stdin with (format csv);
1,click
1,view
2,click
\.
```

For large imports, use COPY:

Reference: https://www.postgresql.org/docs/current/sql-copy.html

---

### 6.2 Eliminate N+1 Queries with Batch Loading

**Impact: MEDIUM-HIGH (10-100x fewer database round trips)**

N+1 queries execute one query per item in a loop. Batch them into a single query using arrays or JOINs.

**Incorrect (N+1 queries):**

```sql
-- First query: get all users
select id from users where active = true;  -- Returns 100 IDs

-- Then N queries, one per user
select * from orders where user_id = 1;
select * from orders where user_id = 2;
select * from orders where user_id = 3;
-- ... 97 more queries!

-- Total: 101 round trips to database
```

**Correct (single batch query):**

```sql
-- Collect IDs and query once with ANY
select * from orders where user_id = any(array[1, 2, 3, ...]);

-- Or use JOIN instead of loop
select u.id, u.name, o.*
from users u
left join orders o on o.user_id = u.id
where u.active = true;

-- Total: 1 round trip
-- Instead of looping in application code:
-- for user in users: db.query("SELECT * FROM orders WHERE user_id = $1", user.id)

-- Pass array parameter:
select * from orders where user_id = any($1::bigint[]);
-- Application passes: [1, 2, 3, 4, 5, ...]
```

Application pattern:

Reference: https://supabase.com/docs/guides/database/query-optimization

---

### 6.3 Use Cursor-Based Pagination Instead of OFFSET

**Impact: MEDIUM-HIGH (Consistent O(1) performance regardless of page depth)**

OFFSET-based pagination scans all skipped rows, getting slower on deeper pages. Cursor pagination is O(1).

**Incorrect (OFFSET pagination):**

```sql
-- Page 1: scans 20 rows
select * from products order by id limit 20 offset 0;

-- Page 100: scans 2000 rows to skip 1980
select * from products order by id limit 20 offset 1980;

-- Page 10000: scans 200,000 rows!
select * from products order by id limit 20 offset 199980;
```

**Correct (cursor/keyset pagination):**

```sql
-- Page 1: get first 20
select * from products order by id limit 20;
-- Application stores last_id = 20

-- Page 2: start after last ID
select * from products where id > 20 order by id limit 20;
-- Uses index, always fast regardless of page depth

-- Page 10000: same speed as page 1
select * from products where id > 199980 order by id limit 20;
-- Cursor must include all sort columns
select * from products
where (created_at, id) > ('2024-01-15 10:00:00', 12345)
order by created_at, id
limit 20;
```

For multi-column sorting:

Reference: https://supabase.com/docs/guides/database/pagination

---

### 6.4 Use UPSERT for Insert-or-Update Operations

**Impact: MEDIUM (Atomic operation, eliminates race conditions)**

Using separate SELECT-then-INSERT/UPDATE creates race conditions. Use INSERT ... ON CONFLICT for atomic upserts.

**Incorrect (check-then-insert race condition):**

```sql
-- Race condition: two requests check simultaneously
select * from settings where user_id = 123 and key = 'theme';
-- Both find nothing

-- Both try to insert
insert into settings (user_id, key, value) values (123, 'theme', 'dark');
-- One succeeds, one fails with duplicate key error!
```

**Correct (atomic UPSERT):**

```sql
-- Single atomic operation
insert into settings (user_id, key, value)
values (123, 'theme', 'dark')
on conflict (user_id, key)
do update set value = excluded.value, updated_at = now();

-- Returns the inserted/updated row
insert into settings (user_id, key, value)
values (123, 'theme', 'dark')
on conflict (user_id, key)
do update set value = excluded.value
returning *;
-- Insert only if not exists (no update)
insert into page_views (page_id, user_id)
values (1, 123)
on conflict (page_id, user_id) do nothing;
```

Insert-or-ignore pattern:

Reference: https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT

---

## 7. Monitoring & Diagnostics

**Impact: LOW-MEDIUM**

Using pg_stat_statements, EXPLAIN ANALYZE, metrics collection, and performance diagnostics.

### 7.1 Enable pg_stat_statements for Query Analysis

**Impact: LOW-MEDIUM (Identify top resource-consuming queries)**

pg_stat_statements tracks execution statistics for all queries, helping identify slow and frequent queries.

**Incorrect (no visibility into query patterns):**

```sql
-- Database is slow, but which queries are the problem?
-- No way to know without pg_stat_statements
```

**Correct (enable and query pg_stat_statements):**

```sql
-- Enable the extension
create extension if not exists pg_stat_statements;

-- Find slowest queries by total time
select
  calls,
  round(total_exec_time::numeric, 2) as total_time_ms,
  round(mean_exec_time::numeric, 2) as mean_time_ms,
  query
from pg_stat_statements
order by total_exec_time desc
limit 10;

-- Find most frequent queries
select calls, query
from pg_stat_statements
order by calls desc
limit 10;

-- Reset statistics after optimization
select pg_stat_statements_reset();
-- Queries with high mean time (candidates for optimization)
select query, mean_exec_time, calls
from pg_stat_statements
where mean_exec_time > 100  -- > 100ms average
order by mean_exec_time desc;
```

Key metrics to monitor:

Reference: https://supabase.com/docs/guides/database/extensions/pg_stat_statements

---

### 7.2 Maintain Table Statistics with VACUUM and ANALYZE

**Impact: MEDIUM (2-10x better query plans with accurate statistics)**

Outdated statistics cause the query planner to make poor decisions. VACUUM reclaims space, ANALYZE updates statistics.

**Incorrect (stale statistics):**

```sql
-- Table has 1M rows but stats say 1000
-- Query planner chooses wrong strategy
explain select * from orders where status = 'pending';
-- Shows: Seq Scan (because stats show small table)
-- Actually: Index Scan would be much faster
```

**Correct (maintain fresh statistics):**

```sql
-- Manually analyze after large data changes
analyze orders;

-- Analyze specific columns used in WHERE clauses
analyze orders (status, created_at);

-- Check when tables were last analyzed
select
  relname,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
from pg_stat_user_tables
order by last_analyze nulls first;
-- Increase frequency for high-churn tables
alter table orders set (
  autovacuum_vacuum_scale_factor = 0.05,     -- Vacuum at 5% dead tuples (default 20%)
  autovacuum_analyze_scale_factor = 0.02     -- Analyze at 2% changes (default 10%)
);

-- Check autovacuum status
select * from pg_stat_progress_vacuum;
```

Autovacuum tuning for busy tables:

Reference: https://supabase.com/docs/guides/database/database-size#vacuum-operations

---

### 7.3 Use EXPLAIN ANALYZE to Diagnose Slow Queries

**Impact: LOW-MEDIUM (Identify exact bottlenecks in query execution)**

EXPLAIN ANALYZE executes the query and shows actual timings, revealing the true performance bottlenecks.

**Incorrect (guessing at performance issues):**

```sql
-- Query is slow, but why?
select * from orders where customer_id = 123 and status = 'pending';
-- "It must be missing an index" - but which one?
```

**Correct (use EXPLAIN ANALYZE):**

```sql
explain (analyze, buffers, format text)
select * from orders where customer_id = 123 and status = 'pending';

-- Output reveals the issue:
-- Seq Scan on orders (cost=0.00..25000.00 rows=50 width=100) (actual time=0.015..450.123 rows=50 loops=1)
--   Filter: ((customer_id = 123) AND (status = 'pending'::text))
--   Rows Removed by Filter: 999950
--   Buffers: shared hit=5000 read=15000
-- Planning Time: 0.150 ms
-- Execution Time: 450.500 ms
-- Seq Scan on large tables = missing index
-- Rows Removed by Filter = poor selectivity or missing index
-- Buffers: read >> hit = data not cached, needs more memory
-- Nested Loop with high loops = consider different join strategy
-- Sort Method: external merge = work_mem too low
```

Key things to look for:

Reference: https://supabase.com/docs/guides/database/inspect

---

## 8. Advanced Features

**Impact: LOW**

Full-text search, JSONB optimization, PostGIS, extensions, and advanced Postgres features.

### 8.1 Index JSONB Columns for Efficient Querying

**Impact: MEDIUM (10-100x faster JSONB queries with proper indexing)**

JSONB queries without indexes scan the entire table. Use GIN indexes for containment queries.

**Incorrect (no index on JSONB):**

```sql
create table products (
  id bigint primary key,
  attributes jsonb
);

-- Full table scan for every query
select * from products where attributes @> '{"color": "red"}';
select * from products where attributes->>'brand' = 'Nike';
```

**Correct (GIN index for JSONB):**

```sql
-- GIN index for containment operators (@>, ?, ?&, ?|)
create index products_attrs_gin on products using gin (attributes);

-- Now containment queries use the index
select * from products where attributes @> '{"color": "red"}';

-- For specific key lookups, use expression index
create index products_brand_idx on products ((attributes->>'brand'));
select * from products where attributes->>'brand' = 'Nike';
-- jsonb_ops (default): supports all operators, larger index
create index idx1 on products using gin (attributes);

-- jsonb_path_ops: only @> operator, but 2-3x smaller index
create index idx2 on products using gin (attributes jsonb_path_ops);
```

Choose the right operator class:

Reference: https://www.postgresql.org/docs/current/datatype-json.html#JSON-INDEXING

---

### 8.2 Use tsvector for Full-Text Search

**Impact: MEDIUM (100x faster than LIKE, with ranking support)**

LIKE with wildcards can't use indexes. Full-text search with tsvector is orders of magnitude faster.

**Incorrect (LIKE pattern matching):**

```sql
-- Cannot use index, scans all rows
select * from articles where content like '%postgresql%';

-- Case-insensitive makes it worse
select * from articles where lower(content) like '%postgresql%';
```

**Correct (full-text search with tsvector):**

```sql
-- Add tsvector column and index
alter table articles add column search_vector tsvector
  generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''))) stored;

create index articles_search_idx on articles using gin (search_vector);

-- Fast full-text search
select * from articles
where search_vector @@ to_tsquery('english', 'postgresql & performance');

-- With ranking
select *, ts_rank(search_vector, query) as rank
from articles, to_tsquery('english', 'postgresql') query
where search_vector @@ query
order by rank desc;
-- AND: both terms required
to_tsquery('postgresql & performance')

-- OR: either term
to_tsquery('postgresql | mysql')

-- Prefix matching
to_tsquery('post:*')
```

Search multiple terms:

Reference: https://supabase.com/docs/guides/database/full-text-search

---

## References

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://wiki.postgresql.org/wiki/Performance_Optimization
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security


---


# FILE: .claude\skills\supabase-postgres-best-practices\AGENTS.md

# Postgres Best Practices

**Version 1.0.0**
Supabase
January 2026

> This document is optimized for AI agents and LLMs. Rules are prioritized by performance impact.

---

## Abstract

Comprehensive Postgres performance optimization guide for developers using Supabase and Postgres. Contains performance rules across 8 categories, prioritized by impact from critical (query performance, connection management) to incremental (advanced features). Each rule includes detailed explanations, incorrect vs. correct SQL examples, query plan analysis, and specific performance metrics to guide automated optimization and code generation.

---

## Table of Contents

1. [Query Performance](#query-performance) - **CRITICAL**
   - 1.1 [Add Indexes on WHERE and JOIN Columns](#11-add-indexes-on-where-and-join-columns)
   - 1.2 [Choose the Right Index Type for Your Data](#12-choose-the-right-index-type-for-your-data)
   - 1.3 [Create Composite Indexes for Multi-Column Queries](#13-create-composite-indexes-for-multi-column-queries)
   - 1.4 [Use Covering Indexes to Avoid Table Lookups](#14-use-covering-indexes-to-avoid-table-lookups)
   - 1.5 [Use Partial Indexes for Filtered Queries](#15-use-partial-indexes-for-filtered-queries)

2. [Connection Management](#connection-management) - **CRITICAL**
   - 2.1 [Configure Idle Connection Timeouts](#21-configure-idle-connection-timeouts)
   - 2.2 [Set Appropriate Connection Limits](#22-set-appropriate-connection-limits)
   - 2.3 [Use Connection Pooling for All Applications](#23-use-connection-pooling-for-all-applications)
   - 2.4 [Use Prepared Statements Correctly with Pooling](#24-use-prepared-statements-correctly-with-pooling)

3. [Security & RLS](#security-rls) - **CRITICAL**
   - 3.1 [Apply Principle of Least Privilege](#31-apply-principle-of-least-privilege)
   - 3.2 [Enable Row Level Security for Multi-Tenant Data](#32-enable-row-level-security-for-multi-tenant-data)
   - 3.3 [Optimize RLS Policies for Performance](#33-optimize-rls-policies-for-performance)

4. [Schema Design](#schema-design) - **HIGH**
   - 4.1 [Choose Appropriate Data Types](#41-choose-appropriate-data-types)
   - 4.2 [Index Foreign Key Columns](#42-index-foreign-key-columns)
   - 4.3 [Partition Large Tables for Better Performance](#43-partition-large-tables-for-better-performance)
   - 4.4 [Select Optimal Primary Key Strategy](#44-select-optimal-primary-key-strategy)
   - 4.5 [Use Lowercase Identifiers for Compatibility](#45-use-lowercase-identifiers-for-compatibility)

5. [Concurrency & Locking](#concurrency-locking) - **MEDIUM-HIGH**
   - 5.1 [Keep Transactions Short to Reduce Lock Contention](#51-keep-transactions-short-to-reduce-lock-contention)
   - 5.2 [Prevent Deadlocks with Consistent Lock Ordering](#52-prevent-deadlocks-with-consistent-lock-ordering)
   - 5.3 [Use Advisory Locks for Application-Level Locking](#53-use-advisory-locks-for-application-level-locking)
   - 5.4 [Use SKIP LOCKED for Non-Blocking Queue Processing](#54-use-skip-locked-for-non-blocking-queue-processing)

6. [Data Access Patterns](#data-access-patterns) - **MEDIUM**
   - 6.1 [Batch INSERT Statements for Bulk Data](#61-batch-insert-statements-for-bulk-data)
   - 6.2 [Eliminate N+1 Queries with Batch Loading](#62-eliminate-n1-queries-with-batch-loading)
   - 6.3 [Use Cursor-Based Pagination Instead of OFFSET](#63-use-cursor-based-pagination-instead-of-offset)
   - 6.4 [Use UPSERT for Insert-or-Update Operations](#64-use-upsert-for-insert-or-update-operations)

7. [Monitoring & Diagnostics](#monitoring-diagnostics) - **LOW-MEDIUM**
   - 7.1 [Enable pg_stat_statements for Query Analysis](#71-enable-pgstatstatements-for-query-analysis)
   - 7.2 [Maintain Table Statistics with VACUUM and ANALYZE](#72-maintain-table-statistics-with-vacuum-and-analyze)
   - 7.3 [Use EXPLAIN ANALYZE to Diagnose Slow Queries](#73-use-explain-analyze-to-diagnose-slow-queries)

8. [Advanced Features](#advanced-features) - **LOW**
   - 8.1 [Index JSONB Columns for Efficient Querying](#81-index-jsonb-columns-for-efficient-querying)
   - 8.2 [Use tsvector for Full-Text Search](#82-use-tsvector-for-full-text-search)

---

## 1. Query Performance

**Impact: CRITICAL**

Slow queries, missing indexes, inefficient query plans. The most common source of Postgres performance issues.

### 1.1 Add Indexes on WHERE and JOIN Columns

**Impact: CRITICAL (100-1000x faster queries on large tables)**

Queries filtering or joining on unindexed columns cause full table scans, which become exponentially slower as tables grow.

**Incorrect (sequential scan on large table):**

```sql
-- No index on customer_id causes full table scan
select * from orders where customer_id = 123;

-- EXPLAIN shows: Seq Scan on orders (cost=0.00..25000.00 rows=100 width=85)
```

**Correct (index scan):**

```sql
-- Create index on frequently filtered column
create index orders_customer_id_idx on orders (customer_id);

select * from orders where customer_id = 123;

-- EXPLAIN shows: Index Scan using orders_customer_id_idx (cost=0.42..8.44 rows=100 width=85)
-- Index the referencing column
create index orders_customer_id_idx on orders (customer_id);

select c.name, o.total
from customers c
join orders o on o.customer_id = c.id;
```

For JOIN columns, always index the foreign key side:

Reference: https://supabase.com/docs/guides/database/query-optimization

---

### 1.2 Choose the Right Index Type for Your Data

**Impact: HIGH (10-100x improvement with correct index type)**

Different index types excel at different query patterns. The default B-tree isn't always optimal.

**Incorrect (B-tree for JSONB containment):**

```sql
-- B-tree cannot optimize containment operators
create index products_attrs_idx on products (attributes);
select * from products where attributes @> '{"color": "red"}';
-- Full table scan - B-tree doesn't support @> operator
```

**Correct (GIN for JSONB):**

```sql
-- GIN supports @>, ?, ?&, ?| operators
create index products_attrs_idx on products using gin (attributes);
select * from products where attributes @> '{"color": "red"}';
-- B-tree (default): =, <, >, BETWEEN, IN, IS NULL
create index users_created_idx on users (created_at);

-- GIN: arrays, JSONB, full-text search
create index posts_tags_idx on posts using gin (tags);

-- BRIN: large time-series tables (10-100x smaller)
create index events_time_idx on events using brin (created_at);

-- Hash: equality-only (slightly faster than B-tree for =)
create index sessions_token_idx on sessions using hash (token);
```

Index type guide:

Reference: https://www.postgresql.org/docs/current/indexes-types.html

---

### 1.3 Create Composite Indexes for Multi-Column Queries

**Impact: HIGH (5-10x faster multi-column queries)**

When queries filter on multiple columns, a composite index is more efficient than separate single-column indexes.

**Incorrect (separate indexes require bitmap scan):**

```sql
-- Two separate indexes
create index orders_status_idx on orders (status);
create index orders_created_idx on orders (created_at);

-- Query must combine both indexes (slower)
select * from orders where status = 'pending' and created_at > '2024-01-01';
```

**Correct (composite index):**

```sql
-- Single composite index (leftmost column first for equality checks)
create index orders_status_created_idx on orders (status, created_at);

-- Query uses one efficient index scan
select * from orders where status = 'pending' and created_at > '2024-01-01';
-- Good: status (=) before created_at (>)
create index idx on orders (status, created_at);

-- Works for: WHERE status = 'pending'
-- Works for: WHERE status = 'pending' AND created_at > '2024-01-01'
-- Does NOT work for: WHERE created_at > '2024-01-01' (leftmost prefix rule)
```

**Column order matters** - place equality columns first, range columns last:

Reference: https://www.postgresql.org/docs/current/indexes-multicolumn.html

---

### 1.4 Use Covering Indexes to Avoid Table Lookups

**Impact: MEDIUM-HIGH (2-5x faster queries by eliminating heap fetches)**

Covering indexes include all columns needed by a query, enabling index-only scans that skip the table entirely.

**Incorrect (index scan + heap fetch):**

```sql
create index users_email_idx on users (email);

-- Must fetch name and created_at from table heap
select email, name, created_at from users where email = 'user@example.com';
```

**Correct (index-only scan with INCLUDE):**

```sql
-- Include non-searchable columns in the index
create index users_email_idx on users (email) include (name, created_at);

-- All columns served from index, no table access needed
select email, name, created_at from users where email = 'user@example.com';
-- Searching by status, but also need customer_id and total
create index orders_status_idx on orders (status) include (customer_id, total);

select status, customer_id, total from orders where status = 'shipped';
```

Use INCLUDE for columns you SELECT but don't filter on:

Reference: https://www.postgresql.org/docs/current/indexes-index-only-scans.html

---

### 1.5 Use Partial Indexes for Filtered Queries

**Impact: HIGH (5-20x smaller indexes, faster writes and queries)**

Partial indexes only include rows matching a WHERE condition, making them smaller and faster when queries consistently filter on the same condition.

**Incorrect (full index includes irrelevant rows):**

```sql
-- Index includes all rows, even soft-deleted ones
create index users_email_idx on users (email);

-- Query always filters active users
select * from users where email = 'user@example.com' and deleted_at is null;
```

**Correct (partial index matches query filter):**

```sql
-- Index only includes active users
create index users_active_email_idx on users (email)
where deleted_at is null;

-- Query uses the smaller, faster index
select * from users where email = 'user@example.com' and deleted_at is null;
-- Only pending orders (status rarely changes once completed)
create index orders_pending_idx on orders (created_at)
where status = 'pending';

-- Only non-null values
create index products_sku_idx on products (sku)
where sku is not null;
```

Common use cases for partial indexes:

Reference: https://www.postgresql.org/docs/current/indexes-partial.html

---

## 2. Connection Management

**Impact: CRITICAL**

Connection pooling, limits, and serverless strategies. Critical for applications with high concurrency or serverless deployments.

### 2.1 Configure Idle Connection Timeouts

**Impact: HIGH (Reclaim 30-50% of connection slots from idle clients)**

Idle connections waste resources. Configure timeouts to automatically reclaim them.

**Incorrect (connections held indefinitely):**

```sql
-- No timeout configured
show idle_in_transaction_session_timeout;  -- 0 (disabled)

-- Connections stay open forever, even when idle
select pid, state, state_change, query
from pg_stat_activity
where state = 'idle in transaction';
-- Shows transactions idle for hours, holding locks
```

**Correct (automatic cleanup of idle connections):**

```ini
-- Terminate connections idle in transaction after 30 seconds
alter system set idle_in_transaction_session_timeout = '30s';

-- Terminate completely idle connections after 10 minutes
alter system set idle_session_timeout = '10min';

-- Reload configuration
select pg_reload_conf();
# pgbouncer.ini
server_idle_timeout = 60
client_idle_timeout = 300
```

For pooled connections, configure at the pooler level:

Reference: https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT

---

### 2.2 Set Appropriate Connection Limits

**Impact: CRITICAL (Prevent database crashes and memory exhaustion)**

Too many connections exhaust memory and degrade performance. Set limits based on available resources.

**Incorrect (unlimited or excessive connections):**

```sql
-- Default max_connections = 100, but often increased blindly
show max_connections;  -- 500 (way too high for 4GB RAM)

-- Each connection uses 1-3MB RAM
-- 500 connections * 2MB = 1GB just for connections!
-- Out of memory errors under load
```

**Correct (calculate based on resources):**

```sql
-- Formula: max_connections = (RAM in MB / 5MB per connection) - reserved
-- For 4GB RAM: (4096 / 5) - 10 = ~800 theoretical max
-- But practically, 100-200 is better for query performance

-- Recommended settings for 4GB RAM
alter system set max_connections = 100;

-- Also set work_mem appropriately
-- work_mem * max_connections should not exceed 25% of RAM
alter system set work_mem = '8MB';  -- 8MB * 100 = 800MB max
select count(*), state from pg_stat_activity group by state;
```

Monitor connection usage:

Reference: https://supabase.com/docs/guides/platform/performance#connection-management

---

### 2.3 Use Connection Pooling for All Applications

**Impact: CRITICAL (Handle 10-100x more concurrent users)**

Postgres connections are expensive (1-3MB RAM each). Without pooling, applications exhaust connections under load.

**Incorrect (new connection per request):**

```sql
-- Each request creates a new connection
-- Application code: db.connect() per request
-- Result: 500 concurrent users = 500 connections = crashed database

-- Check current connections
select count(*) from pg_stat_activity;  -- 487 connections!
```

**Correct (connection pooling):**

```sql
-- Use a pooler like PgBouncer between app and database
-- Application connects to pooler, pooler reuses a small pool to Postgres

-- Configure pool_size based on: (CPU cores * 2) + spindle_count
-- Example for 4 cores: pool_size = 10

-- Result: 500 concurrent users share 10 actual connections
select count(*) from pg_stat_activity;  -- 10 connections
```

Pool modes:
- **Transaction mode**: connection returned after each transaction (best for most apps)
- **Session mode**: connection held for entire session (needed for prepared statements, temp tables)

Reference: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler

---

### 2.4 Use Prepared Statements Correctly with Pooling

**Impact: HIGH (Avoid prepared statement conflicts in pooled environments)**

Prepared statements are tied to individual database connections. In transaction-mode pooling, connections are shared, causing conflicts.

**Incorrect (named prepared statements with transaction pooling):**

```sql
-- Named prepared statement
prepare get_user as select * from users where id = $1;

-- In transaction mode pooling, next request may get different connection
execute get_user(123);
-- ERROR: prepared statement "get_user" does not exist
```

**Correct (use unnamed statements or session mode):**

```sql
-- Option 1: Use unnamed prepared statements (most ORMs do this automatically)
-- The query is prepared and executed in a single protocol message

-- Option 2: Deallocate after use in transaction mode
prepare get_user as select * from users where id = $1;
execute get_user(123);
deallocate get_user;

-- Option 3: Use session mode pooling (port 5432 vs 6543)
-- Connection is held for entire session, prepared statements persist
-- Many drivers use prepared statements by default
-- Node.js pg: { prepare: false } to disable
-- JDBC: prepareThreshold=0 to disable
```

Check your driver settings:

Reference: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pool-modes

---

## 3. Security & RLS

**Impact: CRITICAL**

Row-Level Security policies, privilege management, and authentication patterns.

### 3.1 Apply Principle of Least Privilege

**Impact: MEDIUM (Reduced attack surface, better audit trail)**

Grant only the minimum permissions required. Never use superuser for application queries.

**Incorrect (overly broad permissions):**

```sql
-- Application uses superuser connection
-- Or grants ALL to application role
grant all privileges on all tables in schema public to app_user;
grant all privileges on all sequences in schema public to app_user;

-- Any SQL injection becomes catastrophic
-- drop table users; cascades to everything
```

**Correct (minimal, specific grants):**

```sql
-- Create role with no default privileges
create role app_readonly nologin;

-- Grant only SELECT on specific tables
grant usage on schema public to app_readonly;
grant select on public.products, public.categories to app_readonly;

-- Create role for writes with limited scope
create role app_writer nologin;
grant usage on schema public to app_writer;
grant select, insert, update on public.orders to app_writer;
grant usage on sequence orders_id_seq to app_writer;
-- No DELETE permission

-- Login role inherits from these
create role app_user login password 'xxx';
grant app_writer to app_user;
-- Revoke default public access
revoke all on schema public from public;
revoke all on all tables in schema public from public;
```

Revoke public defaults:

Reference: https://supabase.com/blog/postgres-roles-and-privileges

---

### 3.2 Enable Row Level Security for Multi-Tenant Data

**Impact: CRITICAL (Database-enforced tenant isolation, prevent data leaks)**

Row Level Security (RLS) enforces data access at the database level, ensuring users only see their own data.

**Incorrect (application-level filtering only):**

```sql
-- Relying only on application to filter
select * from orders where user_id = $current_user_id;

-- Bug or bypass means all data is exposed!
select * from orders;  -- Returns ALL orders
```

**Correct (database-enforced RLS):**

```sql
-- Enable RLS on the table
alter table orders enable row level security;

-- Create policy for users to see only their orders
create policy orders_user_policy on orders
  for all
  using (user_id = current_setting('app.current_user_id')::bigint);

-- Force RLS even for table owners
alter table orders force row level security;

-- Set user context and query
set app.current_user_id = '123';
select * from orders;  -- Only returns orders for user 123
create policy orders_user_policy on orders
  for all
  to authenticated
  using (user_id = auth.uid());
```

Policy for authenticated role:

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security

---

### 3.3 Optimize RLS Policies for Performance

**Impact: HIGH (5-10x faster RLS queries with proper patterns)**

Poorly written RLS policies can cause severe performance issues. Use subqueries and indexes strategically.

**Incorrect (function called for every row):**

```sql
create policy orders_policy on orders
  using (auth.uid() = user_id);  -- auth.uid() called per row!

-- With 1M rows, auth.uid() is called 1M times
```

**Correct (wrap functions in SELECT):**

```sql
create policy orders_policy on orders
  using ((select auth.uid()) = user_id);  -- Called once, cached

-- 100x+ faster on large tables
-- Create helper function (runs as definer, bypasses RLS)
create or replace function is_team_member(team_id bigint)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.team_members
    where team_id = $1 and user_id = (select auth.uid())
  );
$$;

-- Use in policy (indexed lookup, not per-row check)
create policy team_orders_policy on orders
  using ((select is_team_member(team_id)));
create index orders_user_id_idx on orders (user_id);
```

Use security definer functions for complex checks:
Always add indexes on columns used in RLS policies:

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations

---

## 4. Schema Design

**Impact: HIGH**

Table design, index strategies, partitioning, and data type selection. Foundation for long-term performance.

### 4.1 Choose Appropriate Data Types

**Impact: HIGH (50% storage reduction, faster comparisons)**

Using the right data types reduces storage, improves query performance, and prevents bugs.

**Incorrect (wrong data types):**

```sql
create table users (
  id int,                    -- Will overflow at 2.1 billion
  email varchar(255),        -- Unnecessary length limit
  created_at timestamp,      -- Missing timezone info
  is_active varchar(5),      -- String for boolean
  price varchar(20)          -- String for numeric
);
```

**Correct (appropriate data types):**

```sql
create table users (
  id bigint generated always as identity primary key,  -- 9 quintillion max
  email text,                     -- No artificial limit, same performance as varchar
  created_at timestamptz,         -- Always store timezone-aware timestamps
  is_active boolean default true, -- 1 byte vs variable string length
  price numeric(10,2)             -- Exact decimal arithmetic
);
-- IDs: use bigint, not int (future-proofing)
-- Strings: use text, not varchar(n) unless constraint needed
-- Time: use timestamptz, not timestamp
-- Money: use numeric, not float (precision matters)
-- Enums: use text with check constraint or create enum type
```

Key guidelines:

Reference: https://www.postgresql.org/docs/current/datatype.html

---

### 4.2 Index Foreign Key Columns

**Impact: HIGH (10-100x faster JOINs and CASCADE operations)**

Postgres does not automatically index foreign key columns. Missing indexes cause slow JOINs and CASCADE operations.

**Incorrect (unindexed foreign key):**

```sql
create table orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  total numeric(10,2)
);

-- No index on customer_id!
-- JOINs and ON DELETE CASCADE both require full table scan
select * from orders where customer_id = 123;  -- Seq Scan
delete from customers where id = 123;          -- Locks table, scans all orders
```

**Correct (indexed foreign key):**

```sql
create table orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  total numeric(10,2)
);

-- Always index the FK column
create index orders_customer_id_idx on orders (customer_id);

-- Now JOINs and cascades are fast
select * from orders where customer_id = 123;  -- Index Scan
delete from customers where id = 123;          -- Uses index, fast cascade
select
  conrelid::regclass as table_name,
  a.attname as fk_column
from pg_constraint c
join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
where c.contype = 'f'
  and not exists (
    select 1 from pg_index i
    where i.indrelid = c.conrelid and a.attnum = any(i.indkey)
  );
```

Find missing FK indexes:

Reference: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK

---

### 4.3 Partition Large Tables for Better Performance

**Impact: MEDIUM-HIGH (5-20x faster queries and maintenance on large tables)**

Partitioning splits a large table into smaller pieces, improving query performance and maintenance operations.

**Incorrect (single large table):**

```sql
create table events (
  id bigint generated always as identity,
  created_at timestamptz,
  data jsonb
);

-- 500M rows, queries scan everything
select * from events where created_at > '2024-01-01';  -- Slow
vacuum events;  -- Takes hours, locks table
```

**Correct (partitioned by time range):**

```sql
create table events (
  id bigint generated always as identity,
  created_at timestamptz not null,
  data jsonb
) partition by range (created_at);

-- Create partitions for each month
create table events_2024_01 partition of events
  for values from ('2024-01-01') to ('2024-02-01');

create table events_2024_02 partition of events
  for values from ('2024-02-01') to ('2024-03-01');

-- Queries only scan relevant partitions
select * from events where created_at > '2024-01-15';  -- Only scans events_2024_01+

-- Drop old data instantly
drop table events_2023_01;  -- Instant vs DELETE taking hours
```

When to partition:
- Tables > 100M rows
- Time-series data with date-based queries
- Need to efficiently drop old data

Reference: https://www.postgresql.org/docs/current/ddl-partitioning.html

---

### 4.4 Select Optimal Primary Key Strategy

**Impact: HIGH (Better index locality, reduced fragmentation)**

Primary key choice affects insert performance, index size, and replication
efficiency.

**Incorrect (problematic PK choices):**

```sql
-- identity is the SQL-standard approach
create table users (
  id serial primary key  -- Works, but IDENTITY is recommended
);

-- Random UUIDs (v4) cause index fragmentation
create table orders (
  id uuid default gen_random_uuid() primary key  -- UUIDv4 = random = scattered inserts
);
```

**Correct (optimal PK strategies):**

```sql
-- Use IDENTITY for sequential IDs (SQL-standard, best for most cases)
create table users (
  id bigint generated always as identity primary key
);

-- For distributed systems needing UUIDs, use UUIDv7 (time-ordered)
-- Requires pg_uuidv7 extension: create extension pg_uuidv7;
create table orders (
  id uuid default uuid_generate_v7() primary key  -- Time-ordered, no fragmentation
);

-- Alternative: time-prefixed IDs for sortable, distributed IDs (no extension needed)
create table events (
  id text default concat(
    to_char(now() at time zone 'utc', 'YYYYMMDDHH24MISSMS'),
    gen_random_uuid()::text
  ) primary key
);
```

Guidelines:
- Single database: `bigint identity` (sequential, 8 bytes, SQL-standard)
- Distributed/exposed IDs: UUIDv7 (requires pg_uuidv7) or ULID (time-ordered, no
  fragmentation)
- `serial` works but `identity` is SQL-standard and preferred for new
  applications
- Avoid random UUIDs (v4) as primary keys on large tables (causes index
  fragmentation)
[Identity Columns](https://www.postgresql.org/docs/current/sql-createtable.html#SQL-CREATETABLE-PARMS-GENERATED-IDENTITY)

---

### 4.5 Use Lowercase Identifiers for Compatibility

**Impact: MEDIUM (Avoid case-sensitivity bugs with tools, ORMs, and AI assistants)**

PostgreSQL folds unquoted identifiers to lowercase. Quoted mixed-case identifiers require quotes forever and cause issues with tools, ORMs, and AI assistants that may not recognize them.

**Incorrect (mixed-case identifiers):**

```sql
-- Quoted identifiers preserve case but require quotes everywhere
CREATE TABLE "Users" (
  "userId" bigint PRIMARY KEY,
  "firstName" text,
  "lastName" text
);

-- Must always quote or queries fail
SELECT "firstName" FROM "Users" WHERE "userId" = 1;

-- This fails - Users becomes users without quotes
SELECT firstName FROM Users;
-- ERROR: relation "users" does not exist
```

**Correct (lowercase snake_case):**

```sql
-- Unquoted lowercase identifiers are portable and tool-friendly
CREATE TABLE users (
  user_id bigint PRIMARY KEY,
  first_name text,
  last_name text
);

-- Works without quotes, recognized by all tools
SELECT first_name FROM users WHERE user_id = 1;
-- ORMs often generate quoted camelCase - configure them to use snake_case
-- Migrations from other databases may preserve original casing
-- Some GUI tools quote identifiers by default - disable this

-- If stuck with mixed-case, create views as a compatibility layer
CREATE VIEW users AS SELECT "userId" AS user_id, "firstName" AS first_name FROM "Users";
```

Common sources of mixed-case identifiers:

Reference: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS

---

## 5. Concurrency & Locking

**Impact: MEDIUM-HIGH**

Transaction management, isolation levels, deadlock prevention, and lock contention patterns.

### 5.1 Keep Transactions Short to Reduce Lock Contention

**Impact: MEDIUM-HIGH (3-5x throughput improvement, fewer deadlocks)**

Long-running transactions hold locks that block other queries. Keep transactions as short as possible.

**Incorrect (long transaction with external calls):**

```sql
begin;
select * from orders where id = 1 for update;  -- Lock acquired

-- Application makes HTTP call to payment API (2-5 seconds)
-- Other queries on this row are blocked!

update orders set status = 'paid' where id = 1;
commit;  -- Lock held for entire duration
```

**Correct (minimal transaction scope):**

```sql
-- Validate data and call APIs outside transaction
-- Application: response = await paymentAPI.charge(...)

-- Only hold lock for the actual update
begin;
update orders
set status = 'paid', payment_id = $1
where id = $2 and status = 'pending'
returning *;
commit;  -- Lock held for milliseconds
-- Abort queries running longer than 30 seconds
set statement_timeout = '30s';

-- Or per-session
set local statement_timeout = '5s';
```

Use `statement_timeout` to prevent runaway transactions:

Reference: https://www.postgresql.org/docs/current/tutorial-transactions.html

---

### 5.2 Prevent Deadlocks with Consistent Lock Ordering

**Impact: MEDIUM-HIGH (Eliminate deadlock errors, improve reliability)**

Deadlocks occur when transactions lock resources in different orders. Always
acquire locks in a consistent order.

**Incorrect (inconsistent lock ordering):**

```sql
-- Transaction A                    -- Transaction B
begin;                              begin;
update accounts                     update accounts
set balance = balance - 100         set balance = balance - 50
where id = 1;                       where id = 2;  -- B locks row 2

update accounts                     update accounts
set balance = balance + 100         set balance = balance + 50
where id = 2;  -- A waits for B     where id = 1;  -- B waits for A

-- DEADLOCK! Both waiting for each other
```

**Correct (lock rows in consistent order first):**

```sql
-- Explicitly acquire locks in ID order before updating
begin;
select * from accounts where id in (1, 2) order by id for update;

-- Now perform updates in any order - locks already held
update accounts set balance = balance - 100 where id = 1;
update accounts set balance = balance + 100 where id = 2;
commit;
-- Single statement acquires all locks atomically
begin;
update accounts
set balance = balance + case id
  when 1 then -100
  when 2 then 100
end
where id in (1, 2);
commit;
-- Check for recent deadlocks
select * from pg_stat_database where deadlocks > 0;

-- Enable deadlock logging
set log_lock_waits = on;
set deadlock_timeout = '1s';
```

Alternative: use a single statement to update atomically:
Detect deadlocks in logs:
[Deadlocks](https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS)

---

### 5.3 Use Advisory Locks for Application-Level Locking

**Impact: MEDIUM (Efficient coordination without row-level lock overhead)**

Advisory locks provide application-level coordination without requiring database rows to lock.

**Incorrect (creating rows just for locking):**

```sql
-- Creating dummy rows to lock on
create table resource_locks (
  resource_name text primary key
);

insert into resource_locks values ('report_generator');

-- Lock by selecting the row
select * from resource_locks where resource_name = 'report_generator' for update;
```

**Correct (advisory locks):**

```sql
-- Session-level advisory lock (released on disconnect or unlock)
select pg_advisory_lock(hashtext('report_generator'));
-- ... do exclusive work ...
select pg_advisory_unlock(hashtext('report_generator'));

-- Transaction-level lock (released on commit/rollback)
begin;
select pg_advisory_xact_lock(hashtext('daily_report'));
-- ... do work ...
commit;  -- Lock automatically released
-- Returns immediately with true/false instead of waiting
select pg_try_advisory_lock(hashtext('resource_name'));

-- Use in application
if (acquired) {
  -- Do work
  select pg_advisory_unlock(hashtext('resource_name'));
} else {
  -- Skip or retry later
}
```

Try-lock for non-blocking operations:

Reference: https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS

---

### 5.4 Use SKIP LOCKED for Non-Blocking Queue Processing

**Impact: MEDIUM-HIGH (10x throughput for worker queues)**

When multiple workers process a queue, SKIP LOCKED allows workers to process different rows without waiting.

**Incorrect (workers block each other):**

```sql
-- Worker 1 and Worker 2 both try to get next job
begin;
select * from jobs where status = 'pending' order by created_at limit 1 for update;
-- Worker 2 waits for Worker 1's lock to release!
```

**Correct (SKIP LOCKED for parallel processing):**

```sql
-- Each worker skips locked rows and gets the next available
begin;
select * from jobs
where status = 'pending'
order by created_at
limit 1
for update skip locked;

-- Worker 1 gets job 1, Worker 2 gets job 2 (no waiting)

update jobs set status = 'processing' where id = $1;
commit;
-- Atomic claim-and-update in one statement
update jobs
set status = 'processing', worker_id = $1, started_at = now()
where id = (
  select id from jobs
  where status = 'pending'
  order by created_at
  limit 1
  for update skip locked
)
returning *;
```

Complete queue pattern:

Reference: https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE

---

## 6. Data Access Patterns

**Impact: MEDIUM**

N+1 query elimination, batch operations, cursor-based pagination, and efficient data fetching.

### 6.1 Batch INSERT Statements for Bulk Data

**Impact: MEDIUM (10-50x faster bulk inserts)**

Individual INSERT statements have high overhead. Batch multiple rows in single statements or use COPY.

**Incorrect (individual inserts):**

```sql
-- Each insert is a separate transaction and round trip
insert into events (user_id, action) values (1, 'click');
insert into events (user_id, action) values (1, 'view');
insert into events (user_id, action) values (2, 'click');
-- ... 1000 more individual inserts

-- 1000 inserts = 1000 round trips = slow
```

**Correct (batch insert):**

```sql
-- Multiple rows in single statement
insert into events (user_id, action) values
  (1, 'click'),
  (1, 'view'),
  (2, 'click'),
  -- ... up to ~1000 rows per batch
  (999, 'view');

-- One round trip for 1000 rows
-- COPY is fastest for bulk loading
copy events (user_id, action, created_at)
from '/path/to/data.csv'
with (format csv, header true);

-- Or from stdin in application
copy events (user_id, action) from stdin with (format csv);
1,click
1,view
2,click
\.
```

For large imports, use COPY:

Reference: https://www.postgresql.org/docs/current/sql-copy.html

---

### 6.2 Eliminate N+1 Queries with Batch Loading

**Impact: MEDIUM-HIGH (10-100x fewer database round trips)**

N+1 queries execute one query per item in a loop. Batch them into a single query using arrays or JOINs.

**Incorrect (N+1 queries):**

```sql
-- First query: get all users
select id from users where active = true;  -- Returns 100 IDs

-- Then N queries, one per user
select * from orders where user_id = 1;
select * from orders where user_id = 2;
select * from orders where user_id = 3;
-- ... 97 more queries!

-- Total: 101 round trips to database
```

**Correct (single batch query):**

```sql
-- Collect IDs and query once with ANY
select * from orders where user_id = any(array[1, 2, 3, ...]);

-- Or use JOIN instead of loop
select u.id, u.name, o.*
from users u
left join orders o on o.user_id = u.id
where u.active = true;

-- Total: 1 round trip
-- Instead of looping in application code:
-- for user in users: db.query("SELECT * FROM orders WHERE user_id = $1", user.id)

-- Pass array parameter:
select * from orders where user_id = any($1::bigint[]);
-- Application passes: [1, 2, 3, 4, 5, ...]
```

Application pattern:

Reference: https://supabase.com/docs/guides/database/query-optimization

---

### 6.3 Use Cursor-Based Pagination Instead of OFFSET

**Impact: MEDIUM-HIGH (Consistent O(1) performance regardless of page depth)**

OFFSET-based pagination scans all skipped rows, getting slower on deeper pages. Cursor pagination is O(1).

**Incorrect (OFFSET pagination):**

```sql
-- Page 1: scans 20 rows
select * from products order by id limit 20 offset 0;

-- Page 100: scans 2000 rows to skip 1980
select * from products order by id limit 20 offset 1980;

-- Page 10000: scans 200,000 rows!
select * from products order by id limit 20 offset 199980;
```

**Correct (cursor/keyset pagination):**

```sql
-- Page 1: get first 20
select * from products order by id limit 20;
-- Application stores last_id = 20

-- Page 2: start after last ID
select * from products where id > 20 order by id limit 20;
-- Uses index, always fast regardless of page depth

-- Page 10000: same speed as page 1
select * from products where id > 199980 order by id limit 20;
-- Cursor must include all sort columns
select * from products
where (created_at, id) > ('2024-01-15 10:00:00', 12345)
order by created_at, id
limit 20;
```

For multi-column sorting:

Reference: https://supabase.com/docs/guides/database/pagination

---

### 6.4 Use UPSERT for Insert-or-Update Operations

**Impact: MEDIUM (Atomic operation, eliminates race conditions)**

Using separate SELECT-then-INSERT/UPDATE creates race conditions. Use INSERT ... ON CONFLICT for atomic upserts.

**Incorrect (check-then-insert race condition):**

```sql
-- Race condition: two requests check simultaneously
select * from settings where user_id = 123 and key = 'theme';
-- Both find nothing

-- Both try to insert
insert into settings (user_id, key, value) values (123, 'theme', 'dark');
-- One succeeds, one fails with duplicate key error!
```

**Correct (atomic UPSERT):**

```sql
-- Single atomic operation
insert into settings (user_id, key, value)
values (123, 'theme', 'dark')
on conflict (user_id, key)
do update set value = excluded.value, updated_at = now();

-- Returns the inserted/updated row
insert into settings (user_id, key, value)
values (123, 'theme', 'dark')
on conflict (user_id, key)
do update set value = excluded.value
returning *;
-- Insert only if not exists (no update)
insert into page_views (page_id, user_id)
values (1, 123)
on conflict (page_id, user_id) do nothing;
```

Insert-or-ignore pattern:

Reference: https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT

---

## 7. Monitoring & Diagnostics

**Impact: LOW-MEDIUM**

Using pg_stat_statements, EXPLAIN ANALYZE, metrics collection, and performance diagnostics.

### 7.1 Enable pg_stat_statements for Query Analysis

**Impact: LOW-MEDIUM (Identify top resource-consuming queries)**

pg_stat_statements tracks execution statistics for all queries, helping identify slow and frequent queries.

**Incorrect (no visibility into query patterns):**

```sql
-- Database is slow, but which queries are the problem?
-- No way to know without pg_stat_statements
```

**Correct (enable and query pg_stat_statements):**

```sql
-- Enable the extension
create extension if not exists pg_stat_statements;

-- Find slowest queries by total time
select
  calls,
  round(total_exec_time::numeric, 2) as total_time_ms,
  round(mean_exec_time::numeric, 2) as mean_time_ms,
  query
from pg_stat_statements
order by total_exec_time desc
limit 10;

-- Find most frequent queries
select calls, query
from pg_stat_statements
order by calls desc
limit 10;

-- Reset statistics after optimization
select pg_stat_statements_reset();
-- Queries with high mean time (candidates for optimization)
select query, mean_exec_time, calls
from pg_stat_statements
where mean_exec_time > 100  -- > 100ms average
order by mean_exec_time desc;
```

Key metrics to monitor:

Reference: https://supabase.com/docs/guides/database/extensions/pg_stat_statements

---

### 7.2 Maintain Table Statistics with VACUUM and ANALYZE

**Impact: MEDIUM (2-10x better query plans with accurate statistics)**

Outdated statistics cause the query planner to make poor decisions. VACUUM reclaims space, ANALYZE updates statistics.

**Incorrect (stale statistics):**

```sql
-- Table has 1M rows but stats say 1000
-- Query planner chooses wrong strategy
explain select * from orders where status = 'pending';
-- Shows: Seq Scan (because stats show small table)
-- Actually: Index Scan would be much faster
```

**Correct (maintain fresh statistics):**

```sql
-- Manually analyze after large data changes
analyze orders;

-- Analyze specific columns used in WHERE clauses
analyze orders (status, created_at);

-- Check when tables were last analyzed
select
  relname,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
from pg_stat_user_tables
order by last_analyze nulls first;
-- Increase frequency for high-churn tables
alter table orders set (
  autovacuum_vacuum_scale_factor = 0.05,     -- Vacuum at 5% dead tuples (default 20%)
  autovacuum_analyze_scale_factor = 0.02     -- Analyze at 2% changes (default 10%)
);

-- Check autovacuum status
select * from pg_stat_progress_vacuum;
```

Autovacuum tuning for busy tables:

Reference: https://supabase.com/docs/guides/database/database-size#vacuum-operations

---

### 7.3 Use EXPLAIN ANALYZE to Diagnose Slow Queries

**Impact: LOW-MEDIUM (Identify exact bottlenecks in query execution)**

EXPLAIN ANALYZE executes the query and shows actual timings, revealing the true performance bottlenecks.

**Incorrect (guessing at performance issues):**

```sql
-- Query is slow, but why?
select * from orders where customer_id = 123 and status = 'pending';
-- "It must be missing an index" - but which one?
```

**Correct (use EXPLAIN ANALYZE):**

```sql
explain (analyze, buffers, format text)
select * from orders where customer_id = 123 and status = 'pending';

-- Output reveals the issue:
-- Seq Scan on orders (cost=0.00..25000.00 rows=50 width=100) (actual time=0.015..450.123 rows=50 loops=1)
--   Filter: ((customer_id = 123) AND (status = 'pending'::text))
--   Rows Removed by Filter: 999950
--   Buffers: shared hit=5000 read=15000
-- Planning Time: 0.150 ms
-- Execution Time: 450.500 ms
-- Seq Scan on large tables = missing index
-- Rows Removed by Filter = poor selectivity or missing index
-- Buffers: read >> hit = data not cached, needs more memory
-- Nested Loop with high loops = consider different join strategy
-- Sort Method: external merge = work_mem too low
```

Key things to look for:

Reference: https://supabase.com/docs/guides/database/inspect

---

## 8. Advanced Features

**Impact: LOW**

Full-text search, JSONB optimization, PostGIS, extensions, and advanced Postgres features.

### 8.1 Index JSONB Columns for Efficient Querying

**Impact: MEDIUM (10-100x faster JSONB queries with proper indexing)**

JSONB queries without indexes scan the entire table. Use GIN indexes for containment queries.

**Incorrect (no index on JSONB):**

```sql
create table products (
  id bigint primary key,
  attributes jsonb
);

-- Full table scan for every query
select * from products where attributes @> '{"color": "red"}';
select * from products where attributes->>'brand' = 'Nike';
```

**Correct (GIN index for JSONB):**

```sql
-- GIN index for containment operators (@>, ?, ?&, ?|)
create index products_attrs_gin on products using gin (attributes);

-- Now containment queries use the index
select * from products where attributes @> '{"color": "red"}';

-- For specific key lookups, use expression index
create index products_brand_idx on products ((attributes->>'brand'));
select * from products where attributes->>'brand' = 'Nike';
-- jsonb_ops (default): supports all operators, larger index
create index idx1 on products using gin (attributes);

-- jsonb_path_ops: only @> operator, but 2-3x smaller index
create index idx2 on products using gin (attributes jsonb_path_ops);
```

Choose the right operator class:

Reference: https://www.postgresql.org/docs/current/datatype-json.html#JSON-INDEXING

---

### 8.2 Use tsvector for Full-Text Search

**Impact: MEDIUM (100x faster than LIKE, with ranking support)**

LIKE with wildcards can't use indexes. Full-text search with tsvector is orders of magnitude faster.

**Incorrect (LIKE pattern matching):**

```sql
-- Cannot use index, scans all rows
select * from articles where content like '%postgresql%';

-- Case-insensitive makes it worse
select * from articles where lower(content) like '%postgresql%';
```

**Correct (full-text search with tsvector):**

```sql
-- Add tsvector column and index
alter table articles add column search_vector tsvector
  generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''))) stored;

create index articles_search_idx on articles using gin (search_vector);

-- Fast full-text search
select * from articles
where search_vector @@ to_tsquery('english', 'postgresql & performance');

-- With ranking
select *, ts_rank(search_vector, query) as rank
from articles, to_tsquery('english', 'postgresql') query
where search_vector @@ query
order by rank desc;
-- AND: both terms required
to_tsquery('postgresql & performance')

-- OR: either term
to_tsquery('postgresql | mysql')

-- Prefix matching
to_tsquery('post:*')
```

Search multiple terms:

Reference: https://supabase.com/docs/guides/database/full-text-search

---

## References

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://wiki.postgresql.org/wiki/Performance_Optimization
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security


---


# FILE: .cursor\skills\supabase-postgres-best-practices\AGENTS.md

# Postgres Best Practices

**Version 1.0.0**
Supabase
January 2026

> This document is optimized for AI agents and LLMs. Rules are prioritized by performance impact.

---

## Abstract

Comprehensive Postgres performance optimization guide for developers using Supabase and Postgres. Contains performance rules across 8 categories, prioritized by impact from critical (query performance, connection management) to incremental (advanced features). Each rule includes detailed explanations, incorrect vs. correct SQL examples, query plan analysis, and specific performance metrics to guide automated optimization and code generation.

---

## Table of Contents

1. [Query Performance](#query-performance) - **CRITICAL**
   - 1.1 [Add Indexes on WHERE and JOIN Columns](#11-add-indexes-on-where-and-join-columns)
   - 1.2 [Choose the Right Index Type for Your Data](#12-choose-the-right-index-type-for-your-data)
   - 1.3 [Create Composite Indexes for Multi-Column Queries](#13-create-composite-indexes-for-multi-column-queries)
   - 1.4 [Use Covering Indexes to Avoid Table Lookups](#14-use-covering-indexes-to-avoid-table-lookups)
   - 1.5 [Use Partial Indexes for Filtered Queries](#15-use-partial-indexes-for-filtered-queries)

2. [Connection Management](#connection-management) - **CRITICAL**
   - 2.1 [Configure Idle Connection Timeouts](#21-configure-idle-connection-timeouts)
   - 2.2 [Set Appropriate Connection Limits](#22-set-appropriate-connection-limits)
   - 2.3 [Use Connection Pooling for All Applications](#23-use-connection-pooling-for-all-applications)
   - 2.4 [Use Prepared Statements Correctly with Pooling](#24-use-prepared-statements-correctly-with-pooling)

3. [Security & RLS](#security-rls) - **CRITICAL**
   - 3.1 [Apply Principle of Least Privilege](#31-apply-principle-of-least-privilege)
   - 3.2 [Enable Row Level Security for Multi-Tenant Data](#32-enable-row-level-security-for-multi-tenant-data)
   - 3.3 [Optimize RLS Policies for Performance](#33-optimize-rls-policies-for-performance)

4. [Schema Design](#schema-design) - **HIGH**
   - 4.1 [Choose Appropriate Data Types](#41-choose-appropriate-data-types)
   - 4.2 [Index Foreign Key Columns](#42-index-foreign-key-columns)
   - 4.3 [Partition Large Tables for Better Performance](#43-partition-large-tables-for-better-performance)
   - 4.4 [Select Optimal Primary Key Strategy](#44-select-optimal-primary-key-strategy)
   - 4.5 [Use Lowercase Identifiers for Compatibility](#45-use-lowercase-identifiers-for-compatibility)

5. [Concurrency & Locking](#concurrency-locking) - **MEDIUM-HIGH**
   - 5.1 [Keep Transactions Short to Reduce Lock Contention](#51-keep-transactions-short-to-reduce-lock-contention)
   - 5.2 [Prevent Deadlocks with Consistent Lock Ordering](#52-prevent-deadlocks-with-consistent-lock-ordering)
   - 5.3 [Use Advisory Locks for Application-Level Locking](#53-use-advisory-locks-for-application-level-locking)
   - 5.4 [Use SKIP LOCKED for Non-Blocking Queue Processing](#54-use-skip-locked-for-non-blocking-queue-processing)

6. [Data Access Patterns](#data-access-patterns) - **MEDIUM**
   - 6.1 [Batch INSERT Statements for Bulk Data](#61-batch-insert-statements-for-bulk-data)
   - 6.2 [Eliminate N+1 Queries with Batch Loading](#62-eliminate-n1-queries-with-batch-loading)
   - 6.3 [Use Cursor-Based Pagination Instead of OFFSET](#63-use-cursor-based-pagination-instead-of-offset)
   - 6.4 [Use UPSERT for Insert-or-Update Operations](#64-use-upsert-for-insert-or-update-operations)

7. [Monitoring & Diagnostics](#monitoring-diagnostics) - **LOW-MEDIUM**
   - 7.1 [Enable pg_stat_statements for Query Analysis](#71-enable-pgstatstatements-for-query-analysis)
   - 7.2 [Maintain Table Statistics with VACUUM and ANALYZE](#72-maintain-table-statistics-with-vacuum-and-analyze)
   - 7.3 [Use EXPLAIN ANALYZE to Diagnose Slow Queries](#73-use-explain-analyze-to-diagnose-slow-queries)

8. [Advanced Features](#advanced-features) - **LOW**
   - 8.1 [Index JSONB Columns for Efficient Querying](#81-index-jsonb-columns-for-efficient-querying)
   - 8.2 [Use tsvector for Full-Text Search](#82-use-tsvector-for-full-text-search)

---

## 1. Query Performance

**Impact: CRITICAL**

Slow queries, missing indexes, inefficient query plans. The most common source of Postgres performance issues.

### 1.1 Add Indexes on WHERE and JOIN Columns

**Impact: CRITICAL (100-1000x faster queries on large tables)**

Queries filtering or joining on unindexed columns cause full table scans, which become exponentially slower as tables grow.

**Incorrect (sequential scan on large table):**

```sql
-- No index on customer_id causes full table scan
select * from orders where customer_id = 123;

-- EXPLAIN shows: Seq Scan on orders (cost=0.00..25000.00 rows=100 width=85)
```

**Correct (index scan):**

```sql
-- Create index on frequently filtered column
create index orders_customer_id_idx on orders (customer_id);

select * from orders where customer_id = 123;

-- EXPLAIN shows: Index Scan using orders_customer_id_idx (cost=0.42..8.44 rows=100 width=85)
-- Index the referencing column
create index orders_customer_id_idx on orders (customer_id);

select c.name, o.total
from customers c
join orders o on o.customer_id = c.id;
```

For JOIN columns, always index the foreign key side:

Reference: https://supabase.com/docs/guides/database/query-optimization

---

### 1.2 Choose the Right Index Type for Your Data

**Impact: HIGH (10-100x improvement with correct index type)**

Different index types excel at different query patterns. The default B-tree isn't always optimal.

**Incorrect (B-tree for JSONB containment):**

```sql
-- B-tree cannot optimize containment operators
create index products_attrs_idx on products (attributes);
select * from products where attributes @> '{"color": "red"}';
-- Full table scan - B-tree doesn't support @> operator
```

**Correct (GIN for JSONB):**

```sql
-- GIN supports @>, ?, ?&, ?| operators
create index products_attrs_idx on products using gin (attributes);
select * from products where attributes @> '{"color": "red"}';
-- B-tree (default): =, <, >, BETWEEN, IN, IS NULL
create index users_created_idx on users (created_at);

-- GIN: arrays, JSONB, full-text search
create index posts_tags_idx on posts using gin (tags);

-- BRIN: large time-series tables (10-100x smaller)
create index events_time_idx on events using brin (created_at);

-- Hash: equality-only (slightly faster than B-tree for =)
create index sessions_token_idx on sessions using hash (token);
```

Index type guide:

Reference: https://www.postgresql.org/docs/current/indexes-types.html

---

### 1.3 Create Composite Indexes for Multi-Column Queries

**Impact: HIGH (5-10x faster multi-column queries)**

When queries filter on multiple columns, a composite index is more efficient than separate single-column indexes.

**Incorrect (separate indexes require bitmap scan):**

```sql
-- Two separate indexes
create index orders_status_idx on orders (status);
create index orders_created_idx on orders (created_at);

-- Query must combine both indexes (slower)
select * from orders where status = 'pending' and created_at > '2024-01-01';
```

**Correct (composite index):**

```sql
-- Single composite index (leftmost column first for equality checks)
create index orders_status_created_idx on orders (status, created_at);

-- Query uses one efficient index scan
select * from orders where status = 'pending' and created_at > '2024-01-01';
-- Good: status (=) before created_at (>)
create index idx on orders (status, created_at);

-- Works for: WHERE status = 'pending'
-- Works for: WHERE status = 'pending' AND created_at > '2024-01-01'
-- Does NOT work for: WHERE created_at > '2024-01-01' (leftmost prefix rule)
```

**Column order matters** - place equality columns first, range columns last:

Reference: https://www.postgresql.org/docs/current/indexes-multicolumn.html

---

### 1.4 Use Covering Indexes to Avoid Table Lookups

**Impact: MEDIUM-HIGH (2-5x faster queries by eliminating heap fetches)**

Covering indexes include all columns needed by a query, enabling index-only scans that skip the table entirely.

**Incorrect (index scan + heap fetch):**

```sql
create index users_email_idx on users (email);

-- Must fetch name and created_at from table heap
select email, name, created_at from users where email = 'user@example.com';
```

**Correct (index-only scan with INCLUDE):**

```sql
-- Include non-searchable columns in the index
create index users_email_idx on users (email) include (name, created_at);

-- All columns served from index, no table access needed
select email, name, created_at from users where email = 'user@example.com';
-- Searching by status, but also need customer_id and total
create index orders_status_idx on orders (status) include (customer_id, total);

select status, customer_id, total from orders where status = 'shipped';
```

Use INCLUDE for columns you SELECT but don't filter on:

Reference: https://www.postgresql.org/docs/current/indexes-index-only-scans.html

---

### 1.5 Use Partial Indexes for Filtered Queries

**Impact: HIGH (5-20x smaller indexes, faster writes and queries)**

Partial indexes only include rows matching a WHERE condition, making them smaller and faster when queries consistently filter on the same condition.

**Incorrect (full index includes irrelevant rows):**

```sql
-- Index includes all rows, even soft-deleted ones
create index users_email_idx on users (email);

-- Query always filters active users
select * from users where email = 'user@example.com' and deleted_at is null;
```

**Correct (partial index matches query filter):**

```sql
-- Index only includes active users
create index users_active_email_idx on users (email)
where deleted_at is null;

-- Query uses the smaller, faster index
select * from users where email = 'user@example.com' and deleted_at is null;
-- Only pending orders (status rarely changes once completed)
create index orders_pending_idx on orders (created_at)
where status = 'pending';

-- Only non-null values
create index products_sku_idx on products (sku)
where sku is not null;
```

Common use cases for partial indexes:

Reference: https://www.postgresql.org/docs/current/indexes-partial.html

---

## 2. Connection Management

**Impact: CRITICAL**

Connection pooling, limits, and serverless strategies. Critical for applications with high concurrency or serverless deployments.

### 2.1 Configure Idle Connection Timeouts

**Impact: HIGH (Reclaim 30-50% of connection slots from idle clients)**

Idle connections waste resources. Configure timeouts to automatically reclaim them.

**Incorrect (connections held indefinitely):**

```sql
-- No timeout configured
show idle_in_transaction_session_timeout;  -- 0 (disabled)

-- Connections stay open forever, even when idle
select pid, state, state_change, query
from pg_stat_activity
where state = 'idle in transaction';
-- Shows transactions idle for hours, holding locks
```

**Correct (automatic cleanup of idle connections):**

```ini
-- Terminate connections idle in transaction after 30 seconds
alter system set idle_in_transaction_session_timeout = '30s';

-- Terminate completely idle connections after 10 minutes
alter system set idle_session_timeout = '10min';

-- Reload configuration
select pg_reload_conf();
# pgbouncer.ini
server_idle_timeout = 60
client_idle_timeout = 300
```

For pooled connections, configure at the pooler level:

Reference: https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT

---

### 2.2 Set Appropriate Connection Limits

**Impact: CRITICAL (Prevent database crashes and memory exhaustion)**

Too many connections exhaust memory and degrade performance. Set limits based on available resources.

**Incorrect (unlimited or excessive connections):**

```sql
-- Default max_connections = 100, but often increased blindly
show max_connections;  -- 500 (way too high for 4GB RAM)

-- Each connection uses 1-3MB RAM
-- 500 connections * 2MB = 1GB just for connections!
-- Out of memory errors under load
```

**Correct (calculate based on resources):**

```sql
-- Formula: max_connections = (RAM in MB / 5MB per connection) - reserved
-- For 4GB RAM: (4096 / 5) - 10 = ~800 theoretical max
-- But practically, 100-200 is better for query performance

-- Recommended settings for 4GB RAM
alter system set max_connections = 100;

-- Also set work_mem appropriately
-- work_mem * max_connections should not exceed 25% of RAM
alter system set work_mem = '8MB';  -- 8MB * 100 = 800MB max
select count(*), state from pg_stat_activity group by state;
```

Monitor connection usage:

Reference: https://supabase.com/docs/guides/platform/performance#connection-management

---

### 2.3 Use Connection Pooling for All Applications

**Impact: CRITICAL (Handle 10-100x more concurrent users)**

Postgres connections are expensive (1-3MB RAM each). Without pooling, applications exhaust connections under load.

**Incorrect (new connection per request):**

```sql
-- Each request creates a new connection
-- Application code: db.connect() per request
-- Result: 500 concurrent users = 500 connections = crashed database

-- Check current connections
select count(*) from pg_stat_activity;  -- 487 connections!
```

**Correct (connection pooling):**

```sql
-- Use a pooler like PgBouncer between app and database
-- Application connects to pooler, pooler reuses a small pool to Postgres

-- Configure pool_size based on: (CPU cores * 2) + spindle_count
-- Example for 4 cores: pool_size = 10

-- Result: 500 concurrent users share 10 actual connections
select count(*) from pg_stat_activity;  -- 10 connections
```

Pool modes:
- **Transaction mode**: connection returned after each transaction (best for most apps)
- **Session mode**: connection held for entire session (needed for prepared statements, temp tables)

Reference: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler

---

### 2.4 Use Prepared Statements Correctly with Pooling

**Impact: HIGH (Avoid prepared statement conflicts in pooled environments)**

Prepared statements are tied to individual database connections. In transaction-mode pooling, connections are shared, causing conflicts.

**Incorrect (named prepared statements with transaction pooling):**

```sql
-- Named prepared statement
prepare get_user as select * from users where id = $1;

-- In transaction mode pooling, next request may get different connection
execute get_user(123);
-- ERROR: prepared statement "get_user" does not exist
```

**Correct (use unnamed statements or session mode):**

```sql
-- Option 1: Use unnamed prepared statements (most ORMs do this automatically)
-- The query is prepared and executed in a single protocol message

-- Option 2: Deallocate after use in transaction mode
prepare get_user as select * from users where id = $1;
execute get_user(123);
deallocate get_user;

-- Option 3: Use session mode pooling (port 5432 vs 6543)
-- Connection is held for entire session, prepared statements persist
-- Many drivers use prepared statements by default
-- Node.js pg: { prepare: false } to disable
-- JDBC: prepareThreshold=0 to disable
```

Check your driver settings:

Reference: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pool-modes

---

## 3. Security & RLS

**Impact: CRITICAL**

Row-Level Security policies, privilege management, and authentication patterns.

### 3.1 Apply Principle of Least Privilege

**Impact: MEDIUM (Reduced attack surface, better audit trail)**

Grant only the minimum permissions required. Never use superuser for application queries.

**Incorrect (overly broad permissions):**

```sql
-- Application uses superuser connection
-- Or grants ALL to application role
grant all privileges on all tables in schema public to app_user;
grant all privileges on all sequences in schema public to app_user;

-- Any SQL injection becomes catastrophic
-- drop table users; cascades to everything
```

**Correct (minimal, specific grants):**

```sql
-- Create role with no default privileges
create role app_readonly nologin;

-- Grant only SELECT on specific tables
grant usage on schema public to app_readonly;
grant select on public.products, public.categories to app_readonly;

-- Create role for writes with limited scope
create role app_writer nologin;
grant usage on schema public to app_writer;
grant select, insert, update on public.orders to app_writer;
grant usage on sequence orders_id_seq to app_writer;
-- No DELETE permission

-- Login role inherits from these
create role app_user login password 'xxx';
grant app_writer to app_user;
-- Revoke default public access
revoke all on schema public from public;
revoke all on all tables in schema public from public;
```

Revoke public defaults:

Reference: https://supabase.com/blog/postgres-roles-and-privileges

---

### 3.2 Enable Row Level Security for Multi-Tenant Data

**Impact: CRITICAL (Database-enforced tenant isolation, prevent data leaks)**

Row Level Security (RLS) enforces data access at the database level, ensuring users only see their own data.

**Incorrect (application-level filtering only):**

```sql
-- Relying only on application to filter
select * from orders where user_id = $current_user_id;

-- Bug or bypass means all data is exposed!
select * from orders;  -- Returns ALL orders
```

**Correct (database-enforced RLS):**

```sql
-- Enable RLS on the table
alter table orders enable row level security;

-- Create policy for users to see only their orders
create policy orders_user_policy on orders
  for all
  using (user_id = current_setting('app.current_user_id')::bigint);

-- Force RLS even for table owners
alter table orders force row level security;

-- Set user context and query
set app.current_user_id = '123';
select * from orders;  -- Only returns orders for user 123
create policy orders_user_policy on orders
  for all
  to authenticated
  using (user_id = auth.uid());
```

Policy for authenticated role:

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security

---

### 3.3 Optimize RLS Policies for Performance

**Impact: HIGH (5-10x faster RLS queries with proper patterns)**

Poorly written RLS policies can cause severe performance issues. Use subqueries and indexes strategically.

**Incorrect (function called for every row):**

```sql
create policy orders_policy on orders
  using (auth.uid() = user_id);  -- auth.uid() called per row!

-- With 1M rows, auth.uid() is called 1M times
```

**Correct (wrap functions in SELECT):**

```sql
create policy orders_policy on orders
  using ((select auth.uid()) = user_id);  -- Called once, cached

-- 100x+ faster on large tables
-- Create helper function (runs as definer, bypasses RLS)
create or replace function is_team_member(team_id bigint)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.team_members
    where team_id = $1 and user_id = (select auth.uid())
  );
$$;

-- Use in policy (indexed lookup, not per-row check)
create policy team_orders_policy on orders
  using ((select is_team_member(team_id)));
create index orders_user_id_idx on orders (user_id);
```

Use security definer functions for complex checks:
Always add indexes on columns used in RLS policies:

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations

---

## 4. Schema Design

**Impact: HIGH**

Table design, index strategies, partitioning, and data type selection. Foundation for long-term performance.

### 4.1 Choose Appropriate Data Types

**Impact: HIGH (50% storage reduction, faster comparisons)**

Using the right data types reduces storage, improves query performance, and prevents bugs.

**Incorrect (wrong data types):**

```sql
create table users (
  id int,                    -- Will overflow at 2.1 billion
  email varchar(255),        -- Unnecessary length limit
  created_at timestamp,      -- Missing timezone info
  is_active varchar(5),      -- String for boolean
  price varchar(20)          -- String for numeric
);
```

**Correct (appropriate data types):**

```sql
create table users (
  id bigint generated always as identity primary key,  -- 9 quintillion max
  email text,                     -- No artificial limit, same performance as varchar
  created_at timestamptz,         -- Always store timezone-aware timestamps
  is_active boolean default true, -- 1 byte vs variable string length
  price numeric(10,2)             -- Exact decimal arithmetic
);
-- IDs: use bigint, not int (future-proofing)
-- Strings: use text, not varchar(n) unless constraint needed
-- Time: use timestamptz, not timestamp
-- Money: use numeric, not float (precision matters)
-- Enums: use text with check constraint or create enum type
```

Key guidelines:

Reference: https://www.postgresql.org/docs/current/datatype.html

---

### 4.2 Index Foreign Key Columns

**Impact: HIGH (10-100x faster JOINs and CASCADE operations)**

Postgres does not automatically index foreign key columns. Missing indexes cause slow JOINs and CASCADE operations.

**Incorrect (unindexed foreign key):**

```sql
create table orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  total numeric(10,2)
);

-- No index on customer_id!
-- JOINs and ON DELETE CASCADE both require full table scan
select * from orders where customer_id = 123;  -- Seq Scan
delete from customers where id = 123;          -- Locks table, scans all orders
```

**Correct (indexed foreign key):**

```sql
create table orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  total numeric(10,2)
);

-- Always index the FK column
create index orders_customer_id_idx on orders (customer_id);

-- Now JOINs and cascades are fast
select * from orders where customer_id = 123;  -- Index Scan
delete from customers where id = 123;          -- Uses index, fast cascade
select
  conrelid::regclass as table_name,
  a.attname as fk_column
from pg_constraint c
join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
where c.contype = 'f'
  and not exists (
    select 1 from pg_index i
    where i.indrelid = c.conrelid and a.attnum = any(i.indkey)
  );
```

Find missing FK indexes:

Reference: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK

---

### 4.3 Partition Large Tables for Better Performance

**Impact: MEDIUM-HIGH (5-20x faster queries and maintenance on large tables)**

Partitioning splits a large table into smaller pieces, improving query performance and maintenance operations.

**Incorrect (single large table):**

```sql
create table events (
  id bigint generated always as identity,
  created_at timestamptz,
  data jsonb
);

-- 500M rows, queries scan everything
select * from events where created_at > '2024-01-01';  -- Slow
vacuum events;  -- Takes hours, locks table
```

**Correct (partitioned by time range):**

```sql
create table events (
  id bigint generated always as identity,
  created_at timestamptz not null,
  data jsonb
) partition by range (created_at);

-- Create partitions for each month
create table events_2024_01 partition of events
  for values from ('2024-01-01') to ('2024-02-01');

create table events_2024_02 partition of events
  for values from ('2024-02-01') to ('2024-03-01');

-- Queries only scan relevant partitions
select * from events where created_at > '2024-01-15';  -- Only scans events_2024_01+

-- Drop old data instantly
drop table events_2023_01;  -- Instant vs DELETE taking hours
```

When to partition:
- Tables > 100M rows
- Time-series data with date-based queries
- Need to efficiently drop old data

Reference: https://www.postgresql.org/docs/current/ddl-partitioning.html

---

### 4.4 Select Optimal Primary Key Strategy

**Impact: HIGH (Better index locality, reduced fragmentation)**

Primary key choice affects insert performance, index size, and replication
efficiency.

**Incorrect (problematic PK choices):**

```sql
-- identity is the SQL-standard approach
create table users (
  id serial primary key  -- Works, but IDENTITY is recommended
);

-- Random UUIDs (v4) cause index fragmentation
create table orders (
  id uuid default gen_random_uuid() primary key  -- UUIDv4 = random = scattered inserts
);
```

**Correct (optimal PK strategies):**

```sql
-- Use IDENTITY for sequential IDs (SQL-standard, best for most cases)
create table users (
  id bigint generated always as identity primary key
);

-- For distributed systems needing UUIDs, use UUIDv7 (time-ordered)
-- Requires pg_uuidv7 extension: create extension pg_uuidv7;
create table orders (
  id uuid default uuid_generate_v7() primary key  -- Time-ordered, no fragmentation
);

-- Alternative: time-prefixed IDs for sortable, distributed IDs (no extension needed)
create table events (
  id text default concat(
    to_char(now() at time zone 'utc', 'YYYYMMDDHH24MISSMS'),
    gen_random_uuid()::text
  ) primary key
);
```

Guidelines:
- Single database: `bigint identity` (sequential, 8 bytes, SQL-standard)
- Distributed/exposed IDs: UUIDv7 (requires pg_uuidv7) or ULID (time-ordered, no
  fragmentation)
- `serial` works but `identity` is SQL-standard and preferred for new
  applications
- Avoid random UUIDs (v4) as primary keys on large tables (causes index
  fragmentation)
[Identity Columns](https://www.postgresql.org/docs/current/sql-createtable.html#SQL-CREATETABLE-PARMS-GENERATED-IDENTITY)

---

### 4.5 Use Lowercase Identifiers for Compatibility

**Impact: MEDIUM (Avoid case-sensitivity bugs with tools, ORMs, and AI assistants)**

PostgreSQL folds unquoted identifiers to lowercase. Quoted mixed-case identifiers require quotes forever and cause issues with tools, ORMs, and AI assistants that may not recognize them.

**Incorrect (mixed-case identifiers):**

```sql
-- Quoted identifiers preserve case but require quotes everywhere
CREATE TABLE "Users" (
  "userId" bigint PRIMARY KEY,
  "firstName" text,
  "lastName" text
);

-- Must always quote or queries fail
SELECT "firstName" FROM "Users" WHERE "userId" = 1;

-- This fails - Users becomes users without quotes
SELECT firstName FROM Users;
-- ERROR: relation "users" does not exist
```

**Correct (lowercase snake_case):**

```sql
-- Unquoted lowercase identifiers are portable and tool-friendly
CREATE TABLE users (
  user_id bigint PRIMARY KEY,
  first_name text,
  last_name text
);

-- Works without quotes, recognized by all tools
SELECT first_name FROM users WHERE user_id = 1;
-- ORMs often generate quoted camelCase - configure them to use snake_case
-- Migrations from other databases may preserve original casing
-- Some GUI tools quote identifiers by default - disable this

-- If stuck with mixed-case, create views as a compatibility layer
CREATE VIEW users AS SELECT "userId" AS user_id, "firstName" AS first_name FROM "Users";
```

Common sources of mixed-case identifiers:

Reference: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS

---

## 5. Concurrency & Locking

**Impact: MEDIUM-HIGH**

Transaction management, isolation levels, deadlock prevention, and lock contention patterns.

### 5.1 Keep Transactions Short to Reduce Lock Contention

**Impact: MEDIUM-HIGH (3-5x throughput improvement, fewer deadlocks)**

Long-running transactions hold locks that block other queries. Keep transactions as short as possible.

**Incorrect (long transaction with external calls):**

```sql
begin;
select * from orders where id = 1 for update;  -- Lock acquired

-- Application makes HTTP call to payment API (2-5 seconds)
-- Other queries on this row are blocked!

update orders set status = 'paid' where id = 1;
commit;  -- Lock held for entire duration
```

**Correct (minimal transaction scope):**

```sql
-- Validate data and call APIs outside transaction
-- Application: response = await paymentAPI.charge(...)

-- Only hold lock for the actual update
begin;
update orders
set status = 'paid', payment_id = $1
where id = $2 and status = 'pending'
returning *;
commit;  -- Lock held for milliseconds
-- Abort queries running longer than 30 seconds
set statement_timeout = '30s';

-- Or per-session
set local statement_timeout = '5s';
```

Use `statement_timeout` to prevent runaway transactions:

Reference: https://www.postgresql.org/docs/current/tutorial-transactions.html

---

### 5.2 Prevent Deadlocks with Consistent Lock Ordering

**Impact: MEDIUM-HIGH (Eliminate deadlock errors, improve reliability)**

Deadlocks occur when transactions lock resources in different orders. Always
acquire locks in a consistent order.

**Incorrect (inconsistent lock ordering):**

```sql
-- Transaction A                    -- Transaction B
begin;                              begin;
update accounts                     update accounts
set balance = balance - 100         set balance = balance - 50
where id = 1;                       where id = 2;  -- B locks row 2

update accounts                     update accounts
set balance = balance + 100         set balance = balance + 50
where id = 2;  -- A waits for B     where id = 1;  -- B waits for A

-- DEADLOCK! Both waiting for each other
```

**Correct (lock rows in consistent order first):**

```sql
-- Explicitly acquire locks in ID order before updating
begin;
select * from accounts where id in (1, 2) order by id for update;

-- Now perform updates in any order - locks already held
update accounts set balance = balance - 100 where id = 1;
update accounts set balance = balance + 100 where id = 2;
commit;
-- Single statement acquires all locks atomically
begin;
update accounts
set balance = balance + case id
  when 1 then -100
  when 2 then 100
end
where id in (1, 2);
commit;
-- Check for recent deadlocks
select * from pg_stat_database where deadlocks > 0;

-- Enable deadlock logging
set log_lock_waits = on;
set deadlock_timeout = '1s';
```

Alternative: use a single statement to update atomically:
Detect deadlocks in logs:
[Deadlocks](https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS)

---

### 5.3 Use Advisory Locks for Application-Level Locking

**Impact: MEDIUM (Efficient coordination without row-level lock overhead)**

Advisory locks provide application-level coordination without requiring database rows to lock.

**Incorrect (creating rows just for locking):**

```sql
-- Creating dummy rows to lock on
create table resource_locks (
  resource_name text primary key
);

insert into resource_locks values ('report_generator');

-- Lock by selecting the row
select * from resource_locks where resource_name = 'report_generator' for update;
```

**Correct (advisory locks):**

```sql
-- Session-level advisory lock (released on disconnect or unlock)
select pg_advisory_lock(hashtext('report_generator'));
-- ... do exclusive work ...
select pg_advisory_unlock(hashtext('report_generator'));

-- Transaction-level lock (released on commit/rollback)
begin;
select pg_advisory_xact_lock(hashtext('daily_report'));
-- ... do work ...
commit;  -- Lock automatically released
-- Returns immediately with true/false instead of waiting
select pg_try_advisory_lock(hashtext('resource_name'));

-- Use in application
if (acquired) {
  -- Do work
  select pg_advisory_unlock(hashtext('resource_name'));
} else {
  -- Skip or retry later
}
```

Try-lock for non-blocking operations:

Reference: https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS

---

### 5.4 Use SKIP LOCKED for Non-Blocking Queue Processing

**Impact: MEDIUM-HIGH (10x throughput for worker queues)**

When multiple workers process a queue, SKIP LOCKED allows workers to process different rows without waiting.

**Incorrect (workers block each other):**

```sql
-- Worker 1 and Worker 2 both try to get next job
begin;
select * from jobs where status = 'pending' order by created_at limit 1 for update;
-- Worker 2 waits for Worker 1's lock to release!
```

**Correct (SKIP LOCKED for parallel processing):**

```sql
-- Each worker skips locked rows and gets the next available
begin;
select * from jobs
where status = 'pending'
order by created_at
limit 1
for update skip locked;

-- Worker 1 gets job 1, Worker 2 gets job 2 (no waiting)

update jobs set status = 'processing' where id = $1;
commit;
-- Atomic claim-and-update in one statement
update jobs
set status = 'processing', worker_id = $1, started_at = now()
where id = (
  select id from jobs
  where status = 'pending'
  order by created_at
  limit 1
  for update skip locked
)
returning *;
```

Complete queue pattern:

Reference: https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE

---

## 6. Data Access Patterns

**Impact: MEDIUM**

N+1 query elimination, batch operations, cursor-based pagination, and efficient data fetching.

### 6.1 Batch INSERT Statements for Bulk Data

**Impact: MEDIUM (10-50x faster bulk inserts)**

Individual INSERT statements have high overhead. Batch multiple rows in single statements or use COPY.

**Incorrect (individual inserts):**

```sql
-- Each insert is a separate transaction and round trip
insert into events (user_id, action) values (1, 'click');
insert into events (user_id, action) values (1, 'view');
insert into events (user_id, action) values (2, 'click');
-- ... 1000 more individual inserts

-- 1000 inserts = 1000 round trips = slow
```

**Correct (batch insert):**

```sql
-- Multiple rows in single statement
insert into events (user_id, action) values
  (1, 'click'),
  (1, 'view'),
  (2, 'click'),
  -- ... up to ~1000 rows per batch
  (999, 'view');

-- One round trip for 1000 rows
-- COPY is fastest for bulk loading
copy events (user_id, action, created_at)
from '/path/to/data.csv'
with (format csv, header true);

-- Or from stdin in application
copy events (user_id, action) from stdin with (format csv);
1,click
1,view
2,click
\.
```

For large imports, use COPY:

Reference: https://www.postgresql.org/docs/current/sql-copy.html

---

### 6.2 Eliminate N+1 Queries with Batch Loading

**Impact: MEDIUM-HIGH (10-100x fewer database round trips)**

N+1 queries execute one query per item in a loop. Batch them into a single query using arrays or JOINs.

**Incorrect (N+1 queries):**

```sql
-- First query: get all users
select id from users where active = true;  -- Returns 100 IDs

-- Then N queries, one per user
select * from orders where user_id = 1;
select * from orders where user_id = 2;
select * from orders where user_id = 3;
-- ... 97 more queries!

-- Total: 101 round trips to database
```

**Correct (single batch query):**

```sql
-- Collect IDs and query once with ANY
select * from orders where user_id = any(array[1, 2, 3, ...]);

-- Or use JOIN instead of loop
select u.id, u.name, o.*
from users u
left join orders o on o.user_id = u.id
where u.active = true;

-- Total: 1 round trip
-- Instead of looping in application code:
-- for user in users: db.query("SELECT * FROM orders WHERE user_id = $1", user.id)

-- Pass array parameter:
select * from orders where user_id = any($1::bigint[]);
-- Application passes: [1, 2, 3, 4, 5, ...]
```

Application pattern:

Reference: https://supabase.com/docs/guides/database/query-optimization

---

### 6.3 Use Cursor-Based Pagination Instead of OFFSET

**Impact: MEDIUM-HIGH (Consistent O(1) performance regardless of page depth)**

OFFSET-based pagination scans all skipped rows, getting slower on deeper pages. Cursor pagination is O(1).

**Incorrect (OFFSET pagination):**

```sql
-- Page 1: scans 20 rows
select * from products order by id limit 20 offset 0;

-- Page 100: scans 2000 rows to skip 1980
select * from products order by id limit 20 offset 1980;

-- Page 10000: scans 200,000 rows!
select * from products order by id limit 20 offset 199980;
```

**Correct (cursor/keyset pagination):**

```sql
-- Page 1: get first 20
select * from products order by id limit 20;
-- Application stores last_id = 20

-- Page 2: start after last ID
select * from products where id > 20 order by id limit 20;
-- Uses index, always fast regardless of page depth

-- Page 10000: same speed as page 1
select * from products where id > 199980 order by id limit 20;
-- Cursor must include all sort columns
select * from products
where (created_at, id) > ('2024-01-15 10:00:00', 12345)
order by created_at, id
limit 20;
```

For multi-column sorting:

Reference: https://supabase.com/docs/guides/database/pagination

---

### 6.4 Use UPSERT for Insert-or-Update Operations

**Impact: MEDIUM (Atomic operation, eliminates race conditions)**

Using separate SELECT-then-INSERT/UPDATE creates race conditions. Use INSERT ... ON CONFLICT for atomic upserts.

**Incorrect (check-then-insert race condition):**

```sql
-- Race condition: two requests check simultaneously
select * from settings where user_id = 123 and key = 'theme';
-- Both find nothing

-- Both try to insert
insert into settings (user_id, key, value) values (123, 'theme', 'dark');
-- One succeeds, one fails with duplicate key error!
```

**Correct (atomic UPSERT):**

```sql
-- Single atomic operation
insert into settings (user_id, key, value)
values (123, 'theme', 'dark')
on conflict (user_id, key)
do update set value = excluded.value, updated_at = now();

-- Returns the inserted/updated row
insert into settings (user_id, key, value)
values (123, 'theme', 'dark')
on conflict (user_id, key)
do update set value = excluded.value
returning *;
-- Insert only if not exists (no update)
insert into page_views (page_id, user_id)
values (1, 123)
on conflict (page_id, user_id) do nothing;
```

Insert-or-ignore pattern:

Reference: https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT

---

## 7. Monitoring & Diagnostics

**Impact: LOW-MEDIUM**

Using pg_stat_statements, EXPLAIN ANALYZE, metrics collection, and performance diagnostics.

### 7.1 Enable pg_stat_statements for Query Analysis

**Impact: LOW-MEDIUM (Identify top resource-consuming queries)**

pg_stat_statements tracks execution statistics for all queries, helping identify slow and frequent queries.

**Incorrect (no visibility into query patterns):**

```sql
-- Database is slow, but which queries are the problem?
-- No way to know without pg_stat_statements
```

**Correct (enable and query pg_stat_statements):**

```sql
-- Enable the extension
create extension if not exists pg_stat_statements;

-- Find slowest queries by total time
select
  calls,
  round(total_exec_time::numeric, 2) as total_time_ms,
  round(mean_exec_time::numeric, 2) as mean_time_ms,
  query
from pg_stat_statements
order by total_exec_time desc
limit 10;

-- Find most frequent queries
select calls, query
from pg_stat_statements
order by calls desc
limit 10;

-- Reset statistics after optimization
select pg_stat_statements_reset();
-- Queries with high mean time (candidates for optimization)
select query, mean_exec_time, calls
from pg_stat_statements
where mean_exec_time > 100  -- > 100ms average
order by mean_exec_time desc;
```

Key metrics to monitor:

Reference: https://supabase.com/docs/guides/database/extensions/pg_stat_statements

---

### 7.2 Maintain Table Statistics with VACUUM and ANALYZE

**Impact: MEDIUM (2-10x better query plans with accurate statistics)**

Outdated statistics cause the query planner to make poor decisions. VACUUM reclaims space, ANALYZE updates statistics.

**Incorrect (stale statistics):**

```sql
-- Table has 1M rows but stats say 1000
-- Query planner chooses wrong strategy
explain select * from orders where status = 'pending';
-- Shows: Seq Scan (because stats show small table)
-- Actually: Index Scan would be much faster
```

**Correct (maintain fresh statistics):**

```sql
-- Manually analyze after large data changes
analyze orders;

-- Analyze specific columns used in WHERE clauses
analyze orders (status, created_at);

-- Check when tables were last analyzed
select
  relname,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
from pg_stat_user_tables
order by last_analyze nulls first;
-- Increase frequency for high-churn tables
alter table orders set (
  autovacuum_vacuum_scale_factor = 0.05,     -- Vacuum at 5% dead tuples (default 20%)
  autovacuum_analyze_scale_factor = 0.02     -- Analyze at 2% changes (default 10%)
);

-- Check autovacuum status
select * from pg_stat_progress_vacuum;
```

Autovacuum tuning for busy tables:

Reference: https://supabase.com/docs/guides/database/database-size#vacuum-operations

---

### 7.3 Use EXPLAIN ANALYZE to Diagnose Slow Queries

**Impact: LOW-MEDIUM (Identify exact bottlenecks in query execution)**

EXPLAIN ANALYZE executes the query and shows actual timings, revealing the true performance bottlenecks.

**Incorrect (guessing at performance issues):**

```sql
-- Query is slow, but why?
select * from orders where customer_id = 123 and status = 'pending';
-- "It must be missing an index" - but which one?
```

**Correct (use EXPLAIN ANALYZE):**

```sql
explain (analyze, buffers, format text)
select * from orders where customer_id = 123 and status = 'pending';

-- Output reveals the issue:
-- Seq Scan on orders (cost=0.00..25000.00 rows=50 width=100) (actual time=0.015..450.123 rows=50 loops=1)
--   Filter: ((customer_id = 123) AND (status = 'pending'::text))
--   Rows Removed by Filter: 999950
--   Buffers: shared hit=5000 read=15000
-- Planning Time: 0.150 ms
-- Execution Time: 450.500 ms
-- Seq Scan on large tables = missing index
-- Rows Removed by Filter = poor selectivity or missing index
-- Buffers: read >> hit = data not cached, needs more memory
-- Nested Loop with high loops = consider different join strategy
-- Sort Method: external merge = work_mem too low
```

Key things to look for:

Reference: https://supabase.com/docs/guides/database/inspect

---

## 8. Advanced Features

**Impact: LOW**

Full-text search, JSONB optimization, PostGIS, extensions, and advanced Postgres features.

### 8.1 Index JSONB Columns for Efficient Querying

**Impact: MEDIUM (10-100x faster JSONB queries with proper indexing)**

JSONB queries without indexes scan the entire table. Use GIN indexes for containment queries.

**Incorrect (no index on JSONB):**

```sql
create table products (
  id bigint primary key,
  attributes jsonb
);

-- Full table scan for every query
select * from products where attributes @> '{"color": "red"}';
select * from products where attributes->>'brand' = 'Nike';
```

**Correct (GIN index for JSONB):**

```sql
-- GIN index for containment operators (@>, ?, ?&, ?|)
create index products_attrs_gin on products using gin (attributes);

-- Now containment queries use the index
select * from products where attributes @> '{"color": "red"}';

-- For specific key lookups, use expression index
create index products_brand_idx on products ((attributes->>'brand'));
select * from products where attributes->>'brand' = 'Nike';
-- jsonb_ops (default): supports all operators, larger index
create index idx1 on products using gin (attributes);

-- jsonb_path_ops: only @> operator, but 2-3x smaller index
create index idx2 on products using gin (attributes jsonb_path_ops);
```

Choose the right operator class:

Reference: https://www.postgresql.org/docs/current/datatype-json.html#JSON-INDEXING

---

### 8.2 Use tsvector for Full-Text Search

**Impact: MEDIUM (100x faster than LIKE, with ranking support)**

LIKE with wildcards can't use indexes. Full-text search with tsvector is orders of magnitude faster.

**Incorrect (LIKE pattern matching):**

```sql
-- Cannot use index, scans all rows
select * from articles where content like '%postgresql%';

-- Case-insensitive makes it worse
select * from articles where lower(content) like '%postgresql%';
```

**Correct (full-text search with tsvector):**

```sql
-- Add tsvector column and index
alter table articles add column search_vector tsvector
  generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''))) stored;

create index articles_search_idx on articles using gin (search_vector);

-- Fast full-text search
select * from articles
where search_vector @@ to_tsquery('english', 'postgresql & performance');

-- With ranking
select *, ts_rank(search_vector, query) as rank
from articles, to_tsquery('english', 'postgresql') query
where search_vector @@ query
order by rank desc;
-- AND: both terms required
to_tsquery('postgresql & performance')

-- OR: either term
to_tsquery('postgresql | mysql')

-- Prefix matching
to_tsquery('post:*')
```

Search multiple terms:

Reference: https://supabase.com/docs/guides/database/full-text-search

---

## References

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://wiki.postgresql.org/wiki/Performance_Optimization
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security


---


# FILE: .gemini\skills\supabase-postgres-best-practices\AGENTS.md

# Postgres Best Practices

**Version 1.0.0**
Supabase
January 2026

> This document is optimized for AI agents and LLMs. Rules are prioritized by performance impact.

---

## Abstract

Comprehensive Postgres performance optimization guide for developers using Supabase and Postgres. Contains performance rules across 8 categories, prioritized by impact from critical (query performance, connection management) to incremental (advanced features). Each rule includes detailed explanations, incorrect vs. correct SQL examples, query plan analysis, and specific performance metrics to guide automated optimization and code generation.

---

## Table of Contents

1. [Query Performance](#query-performance) - **CRITICAL**
   - 1.1 [Add Indexes on WHERE and JOIN Columns](#11-add-indexes-on-where-and-join-columns)
   - 1.2 [Choose the Right Index Type for Your Data](#12-choose-the-right-index-type-for-your-data)
   - 1.3 [Create Composite Indexes for Multi-Column Queries](#13-create-composite-indexes-for-multi-column-queries)
   - 1.4 [Use Covering Indexes to Avoid Table Lookups](#14-use-covering-indexes-to-avoid-table-lookups)
   - 1.5 [Use Partial Indexes for Filtered Queries](#15-use-partial-indexes-for-filtered-queries)

2. [Connection Management](#connection-management) - **CRITICAL**
   - 2.1 [Configure Idle Connection Timeouts](#21-configure-idle-connection-timeouts)
   - 2.2 [Set Appropriate Connection Limits](#22-set-appropriate-connection-limits)
   - 2.3 [Use Connection Pooling for All Applications](#23-use-connection-pooling-for-all-applications)
   - 2.4 [Use Prepared Statements Correctly with Pooling](#24-use-prepared-statements-correctly-with-pooling)

3. [Security & RLS](#security-rls) - **CRITICAL**
   - 3.1 [Apply Principle of Least Privilege](#31-apply-principle-of-least-privilege)
   - 3.2 [Enable Row Level Security for Multi-Tenant Data](#32-enable-row-level-security-for-multi-tenant-data)
   - 3.3 [Optimize RLS Policies for Performance](#33-optimize-rls-policies-for-performance)

4. [Schema Design](#schema-design) - **HIGH**
   - 4.1 [Choose Appropriate Data Types](#41-choose-appropriate-data-types)
   - 4.2 [Index Foreign Key Columns](#42-index-foreign-key-columns)
   - 4.3 [Partition Large Tables for Better Performance](#43-partition-large-tables-for-better-performance)
   - 4.4 [Select Optimal Primary Key Strategy](#44-select-optimal-primary-key-strategy)
   - 4.5 [Use Lowercase Identifiers for Compatibility](#45-use-lowercase-identifiers-for-compatibility)

5. [Concurrency & Locking](#concurrency-locking) - **MEDIUM-HIGH**
   - 5.1 [Keep Transactions Short to Reduce Lock Contention](#51-keep-transactions-short-to-reduce-lock-contention)
   - 5.2 [Prevent Deadlocks with Consistent Lock Ordering](#52-prevent-deadlocks-with-consistent-lock-ordering)
   - 5.3 [Use Advisory Locks for Application-Level Locking](#53-use-advisory-locks-for-application-level-locking)
   - 5.4 [Use SKIP LOCKED for Non-Blocking Queue Processing](#54-use-skip-locked-for-non-blocking-queue-processing)

6. [Data Access Patterns](#data-access-patterns) - **MEDIUM**
   - 6.1 [Batch INSERT Statements for Bulk Data](#61-batch-insert-statements-for-bulk-data)
   - 6.2 [Eliminate N+1 Queries with Batch Loading](#62-eliminate-n1-queries-with-batch-loading)
   - 6.3 [Use Cursor-Based Pagination Instead of OFFSET](#63-use-cursor-based-pagination-instead-of-offset)
   - 6.4 [Use UPSERT for Insert-or-Update Operations](#64-use-upsert-for-insert-or-update-operations)

7. [Monitoring & Diagnostics](#monitoring-diagnostics) - **LOW-MEDIUM**
   - 7.1 [Enable pg_stat_statements for Query Analysis](#71-enable-pgstatstatements-for-query-analysis)
   - 7.2 [Maintain Table Statistics with VACUUM and ANALYZE](#72-maintain-table-statistics-with-vacuum-and-analyze)
   - 7.3 [Use EXPLAIN ANALYZE to Diagnose Slow Queries](#73-use-explain-analyze-to-diagnose-slow-queries)

8. [Advanced Features](#advanced-features) - **LOW**
   - 8.1 [Index JSONB Columns for Efficient Querying](#81-index-jsonb-columns-for-efficient-querying)
   - 8.2 [Use tsvector for Full-Text Search](#82-use-tsvector-for-full-text-search)

---

## 1. Query Performance

**Impact: CRITICAL**

Slow queries, missing indexes, inefficient query plans. The most common source of Postgres performance issues.

### 1.1 Add Indexes on WHERE and JOIN Columns

**Impact: CRITICAL (100-1000x faster queries on large tables)**

Queries filtering or joining on unindexed columns cause full table scans, which become exponentially slower as tables grow.

**Incorrect (sequential scan on large table):**

```sql
-- No index on customer_id causes full table scan
select * from orders where customer_id = 123;

-- EXPLAIN shows: Seq Scan on orders (cost=0.00..25000.00 rows=100 width=85)
```

**Correct (index scan):**

```sql
-- Create index on frequently filtered column
create index orders_customer_id_idx on orders (customer_id);

select * from orders where customer_id = 123;

-- EXPLAIN shows: Index Scan using orders_customer_id_idx (cost=0.42..8.44 rows=100 width=85)
-- Index the referencing column
create index orders_customer_id_idx on orders (customer_id);

select c.name, o.total
from customers c
join orders o on o.customer_id = c.id;
```

For JOIN columns, always index the foreign key side:

Reference: https://supabase.com/docs/guides/database/query-optimization

---

### 1.2 Choose the Right Index Type for Your Data

**Impact: HIGH (10-100x improvement with correct index type)**

Different index types excel at different query patterns. The default B-tree isn't always optimal.

**Incorrect (B-tree for JSONB containment):**

```sql
-- B-tree cannot optimize containment operators
create index products_attrs_idx on products (attributes);
select * from products where attributes @> '{"color": "red"}';
-- Full table scan - B-tree doesn't support @> operator
```

**Correct (GIN for JSONB):**

```sql
-- GIN supports @>, ?, ?&, ?| operators
create index products_attrs_idx on products using gin (attributes);
select * from products where attributes @> '{"color": "red"}';
-- B-tree (default): =, <, >, BETWEEN, IN, IS NULL
create index users_created_idx on users (created_at);

-- GIN: arrays, JSONB, full-text search
create index posts_tags_idx on posts using gin (tags);

-- BRIN: large time-series tables (10-100x smaller)
create index events_time_idx on events using brin (created_at);

-- Hash: equality-only (slightly faster than B-tree for =)
create index sessions_token_idx on sessions using hash (token);
```

Index type guide:

Reference: https://www.postgresql.org/docs/current/indexes-types.html

---

### 1.3 Create Composite Indexes for Multi-Column Queries

**Impact: HIGH (5-10x faster multi-column queries)**

When queries filter on multiple columns, a composite index is more efficient than separate single-column indexes.

**Incorrect (separate indexes require bitmap scan):**

```sql
-- Two separate indexes
create index orders_status_idx on orders (status);
create index orders_created_idx on orders (created_at);

-- Query must combine both indexes (slower)
select * from orders where status = 'pending' and created_at > '2024-01-01';
```

**Correct (composite index):**

```sql
-- Single composite index (leftmost column first for equality checks)
create index orders_status_created_idx on orders (status, created_at);

-- Query uses one efficient index scan
select * from orders where status = 'pending' and created_at > '2024-01-01';
-- Good: status (=) before created_at (>)
create index idx on orders (status, created_at);

-- Works for: WHERE status = 'pending'
-- Works for: WHERE status = 'pending' AND created_at > '2024-01-01'
-- Does NOT work for: WHERE created_at > '2024-01-01' (leftmost prefix rule)
```

**Column order matters** - place equality columns first, range columns last:

Reference: https://www.postgresql.org/docs/current/indexes-multicolumn.html

---

### 1.4 Use Covering Indexes to Avoid Table Lookups

**Impact: MEDIUM-HIGH (2-5x faster queries by eliminating heap fetches)**

Covering indexes include all columns needed by a query, enabling index-only scans that skip the table entirely.

**Incorrect (index scan + heap fetch):**

```sql
create index users_email_idx on users (email);

-- Must fetch name and created_at from table heap
select email, name, created_at from users where email = 'user@example.com';
```

**Correct (index-only scan with INCLUDE):**

```sql
-- Include non-searchable columns in the index
create index users_email_idx on users (email) include (name, created_at);

-- All columns served from index, no table access needed
select email, name, created_at from users where email = 'user@example.com';
-- Searching by status, but also need customer_id and total
create index orders_status_idx on orders (status) include (customer_id, total);

select status, customer_id, total from orders where status = 'shipped';
```

Use INCLUDE for columns you SELECT but don't filter on:

Reference: https://www.postgresql.org/docs/current/indexes-index-only-scans.html

---

### 1.5 Use Partial Indexes for Filtered Queries

**Impact: HIGH (5-20x smaller indexes, faster writes and queries)**

Partial indexes only include rows matching a WHERE condition, making them smaller and faster when queries consistently filter on the same condition.

**Incorrect (full index includes irrelevant rows):**

```sql
-- Index includes all rows, even soft-deleted ones
create index users_email_idx on users (email);

-- Query always filters active users
select * from users where email = 'user@example.com' and deleted_at is null;
```

**Correct (partial index matches query filter):**

```sql
-- Index only includes active users
create index users_active_email_idx on users (email)
where deleted_at is null;

-- Query uses the smaller, faster index
select * from users where email = 'user@example.com' and deleted_at is null;
-- Only pending orders (status rarely changes once completed)
create index orders_pending_idx on orders (created_at)
where status = 'pending';

-- Only non-null values
create index products_sku_idx on products (sku)
where sku is not null;
```

Common use cases for partial indexes:

Reference: https://www.postgresql.org/docs/current/indexes-partial.html

---

## 2. Connection Management

**Impact: CRITICAL**

Connection pooling, limits, and serverless strategies. Critical for applications with high concurrency or serverless deployments.

### 2.1 Configure Idle Connection Timeouts

**Impact: HIGH (Reclaim 30-50% of connection slots from idle clients)**

Idle connections waste resources. Configure timeouts to automatically reclaim them.

**Incorrect (connections held indefinitely):**

```sql
-- No timeout configured
show idle_in_transaction_session_timeout;  -- 0 (disabled)

-- Connections stay open forever, even when idle
select pid, state, state_change, query
from pg_stat_activity
where state = 'idle in transaction';
-- Shows transactions idle for hours, holding locks
```

**Correct (automatic cleanup of idle connections):**

```ini
-- Terminate connections idle in transaction after 30 seconds
alter system set idle_in_transaction_session_timeout = '30s';

-- Terminate completely idle connections after 10 minutes
alter system set idle_session_timeout = '10min';

-- Reload configuration
select pg_reload_conf();
# pgbouncer.ini
server_idle_timeout = 60
client_idle_timeout = 300
```

For pooled connections, configure at the pooler level:

Reference: https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT

---

### 2.2 Set Appropriate Connection Limits

**Impact: CRITICAL (Prevent database crashes and memory exhaustion)**

Too many connections exhaust memory and degrade performance. Set limits based on available resources.

**Incorrect (unlimited or excessive connections):**

```sql
-- Default max_connections = 100, but often increased blindly
show max_connections;  -- 500 (way too high for 4GB RAM)

-- Each connection uses 1-3MB RAM
-- 500 connections * 2MB = 1GB just for connections!
-- Out of memory errors under load
```

**Correct (calculate based on resources):**

```sql
-- Formula: max_connections = (RAM in MB / 5MB per connection) - reserved
-- For 4GB RAM: (4096 / 5) - 10 = ~800 theoretical max
-- But practically, 100-200 is better for query performance

-- Recommended settings for 4GB RAM
alter system set max_connections = 100;

-- Also set work_mem appropriately
-- work_mem * max_connections should not exceed 25% of RAM
alter system set work_mem = '8MB';  -- 8MB * 100 = 800MB max
select count(*), state from pg_stat_activity group by state;
```

Monitor connection usage:

Reference: https://supabase.com/docs/guides/platform/performance#connection-management

---

### 2.3 Use Connection Pooling for All Applications

**Impact: CRITICAL (Handle 10-100x more concurrent users)**

Postgres connections are expensive (1-3MB RAM each). Without pooling, applications exhaust connections under load.

**Incorrect (new connection per request):**

```sql
-- Each request creates a new connection
-- Application code: db.connect() per request
-- Result: 500 concurrent users = 500 connections = crashed database

-- Check current connections
select count(*) from pg_stat_activity;  -- 487 connections!
```

**Correct (connection pooling):**

```sql
-- Use a pooler like PgBouncer between app and database
-- Application connects to pooler, pooler reuses a small pool to Postgres

-- Configure pool_size based on: (CPU cores * 2) + spindle_count
-- Example for 4 cores: pool_size = 10

-- Result: 500 concurrent users share 10 actual connections
select count(*) from pg_stat_activity;  -- 10 connections
```

Pool modes:
- **Transaction mode**: connection returned after each transaction (best for most apps)
- **Session mode**: connection held for entire session (needed for prepared statements, temp tables)

Reference: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler

---

### 2.4 Use Prepared Statements Correctly with Pooling

**Impact: HIGH (Avoid prepared statement conflicts in pooled environments)**

Prepared statements are tied to individual database connections. In transaction-mode pooling, connections are shared, causing conflicts.

**Incorrect (named prepared statements with transaction pooling):**

```sql
-- Named prepared statement
prepare get_user as select * from users where id = $1;

-- In transaction mode pooling, next request may get different connection
execute get_user(123);
-- ERROR: prepared statement "get_user" does not exist
```

**Correct (use unnamed statements or session mode):**

```sql
-- Option 1: Use unnamed prepared statements (most ORMs do this automatically)
-- The query is prepared and executed in a single protocol message

-- Option 2: Deallocate after use in transaction mode
prepare get_user as select * from users where id = $1;
execute get_user(123);
deallocate get_user;

-- Option 3: Use session mode pooling (port 5432 vs 6543)
-- Connection is held for entire session, prepared statements persist
-- Many drivers use prepared statements by default
-- Node.js pg: { prepare: false } to disable
-- JDBC: prepareThreshold=0 to disable
```

Check your driver settings:

Reference: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pool-modes

---

## 3. Security & RLS

**Impact: CRITICAL**

Row-Level Security policies, privilege management, and authentication patterns.

### 3.1 Apply Principle of Least Privilege

**Impact: MEDIUM (Reduced attack surface, better audit trail)**

Grant only the minimum permissions required. Never use superuser for application queries.

**Incorrect (overly broad permissions):**

```sql
-- Application uses superuser connection
-- Or grants ALL to application role
grant all privileges on all tables in schema public to app_user;
grant all privileges on all sequences in schema public to app_user;

-- Any SQL injection becomes catastrophic
-- drop table users; cascades to everything
```

**Correct (minimal, specific grants):**

```sql
-- Create role with no default privileges
create role app_readonly nologin;

-- Grant only SELECT on specific tables
grant usage on schema public to app_readonly;
grant select on public.products, public.categories to app_readonly;

-- Create role for writes with limited scope
create role app_writer nologin;
grant usage on schema public to app_writer;
grant select, insert, update on public.orders to app_writer;
grant usage on sequence orders_id_seq to app_writer;
-- No DELETE permission

-- Login role inherits from these
create role app_user login password 'xxx';
grant app_writer to app_user;
-- Revoke default public access
revoke all on schema public from public;
revoke all on all tables in schema public from public;
```

Revoke public defaults:

Reference: https://supabase.com/blog/postgres-roles-and-privileges

---

### 3.2 Enable Row Level Security for Multi-Tenant Data

**Impact: CRITICAL (Database-enforced tenant isolation, prevent data leaks)**

Row Level Security (RLS) enforces data access at the database level, ensuring users only see their own data.

**Incorrect (application-level filtering only):**

```sql
-- Relying only on application to filter
select * from orders where user_id = $current_user_id;

-- Bug or bypass means all data is exposed!
select * from orders;  -- Returns ALL orders
```

**Correct (database-enforced RLS):**

```sql
-- Enable RLS on the table
alter table orders enable row level security;

-- Create policy for users to see only their orders
create policy orders_user_policy on orders
  for all
  using (user_id = current_setting('app.current_user_id')::bigint);

-- Force RLS even for table owners
alter table orders force row level security;

-- Set user context and query
set app.current_user_id = '123';
select * from orders;  -- Only returns orders for user 123
create policy orders_user_policy on orders
  for all
  to authenticated
  using (user_id = auth.uid());
```

Policy for authenticated role:

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security

---

### 3.3 Optimize RLS Policies for Performance

**Impact: HIGH (5-10x faster RLS queries with proper patterns)**

Poorly written RLS policies can cause severe performance issues. Use subqueries and indexes strategically.

**Incorrect (function called for every row):**

```sql
create policy orders_policy on orders
  using (auth.uid() = user_id);  -- auth.uid() called per row!

-- With 1M rows, auth.uid() is called 1M times
```

**Correct (wrap functions in SELECT):**

```sql
create policy orders_policy on orders
  using ((select auth.uid()) = user_id);  -- Called once, cached

-- 100x+ faster on large tables
-- Create helper function (runs as definer, bypasses RLS)
create or replace function is_team_member(team_id bigint)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.team_members
    where team_id = $1 and user_id = (select auth.uid())
  );
$$;

-- Use in policy (indexed lookup, not per-row check)
create policy team_orders_policy on orders
  using ((select is_team_member(team_id)));
create index orders_user_id_idx on orders (user_id);
```

Use security definer functions for complex checks:
Always add indexes on columns used in RLS policies:

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations

---

## 4. Schema Design

**Impact: HIGH**

Table design, index strategies, partitioning, and data type selection. Foundation for long-term performance.

### 4.1 Choose Appropriate Data Types

**Impact: HIGH (50% storage reduction, faster comparisons)**

Using the right data types reduces storage, improves query performance, and prevents bugs.

**Incorrect (wrong data types):**

```sql
create table users (
  id int,                    -- Will overflow at 2.1 billion
  email varchar(255),        -- Unnecessary length limit
  created_at timestamp,      -- Missing timezone info
  is_active varchar(5),      -- String for boolean
  price varchar(20)          -- String for numeric
);
```

**Correct (appropriate data types):**

```sql
create table users (
  id bigint generated always as identity primary key,  -- 9 quintillion max
  email text,                     -- No artificial limit, same performance as varchar
  created_at timestamptz,         -- Always store timezone-aware timestamps
  is_active boolean default true, -- 1 byte vs variable string length
  price numeric(10,2)             -- Exact decimal arithmetic
);
-- IDs: use bigint, not int (future-proofing)
-- Strings: use text, not varchar(n) unless constraint needed
-- Time: use timestamptz, not timestamp
-- Money: use numeric, not float (precision matters)
-- Enums: use text with check constraint or create enum type
```

Key guidelines:

Reference: https://www.postgresql.org/docs/current/datatype.html

---

### 4.2 Index Foreign Key Columns

**Impact: HIGH (10-100x faster JOINs and CASCADE operations)**

Postgres does not automatically index foreign key columns. Missing indexes cause slow JOINs and CASCADE operations.

**Incorrect (unindexed foreign key):**

```sql
create table orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  total numeric(10,2)
);

-- No index on customer_id!
-- JOINs and ON DELETE CASCADE both require full table scan
select * from orders where customer_id = 123;  -- Seq Scan
delete from customers where id = 123;          -- Locks table, scans all orders
```

**Correct (indexed foreign key):**

```sql
create table orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  total numeric(10,2)
);

-- Always index the FK column
create index orders_customer_id_idx on orders (customer_id);

-- Now JOINs and cascades are fast
select * from orders where customer_id = 123;  -- Index Scan
delete from customers where id = 123;          -- Uses index, fast cascade
select
  conrelid::regclass as table_name,
  a.attname as fk_column
from pg_constraint c
join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
where c.contype = 'f'
  and not exists (
    select 1 from pg_index i
    where i.indrelid = c.conrelid and a.attnum = any(i.indkey)
  );
```

Find missing FK indexes:

Reference: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK

---

### 4.3 Partition Large Tables for Better Performance

**Impact: MEDIUM-HIGH (5-20x faster queries and maintenance on large tables)**

Partitioning splits a large table into smaller pieces, improving query performance and maintenance operations.

**Incorrect (single large table):**

```sql
create table events (
  id bigint generated always as identity,
  created_at timestamptz,
  data jsonb
);

-- 500M rows, queries scan everything
select * from events where created_at > '2024-01-01';  -- Slow
vacuum events;  -- Takes hours, locks table
```

**Correct (partitioned by time range):**

```sql
create table events (
  id bigint generated always as identity,
  created_at timestamptz not null,
  data jsonb
) partition by range (created_at);

-- Create partitions for each month
create table events_2024_01 partition of events
  for values from ('2024-01-01') to ('2024-02-01');

create table events_2024_02 partition of events
  for values from ('2024-02-01') to ('2024-03-01');

-- Queries only scan relevant partitions
select * from events where created_at > '2024-01-15';  -- Only scans events_2024_01+

-- Drop old data instantly
drop table events_2023_01;  -- Instant vs DELETE taking hours
```

When to partition:
- Tables > 100M rows
- Time-series data with date-based queries
- Need to efficiently drop old data

Reference: https://www.postgresql.org/docs/current/ddl-partitioning.html

---

### 4.4 Select Optimal Primary Key Strategy

**Impact: HIGH (Better index locality, reduced fragmentation)**

Primary key choice affects insert performance, index size, and replication
efficiency.

**Incorrect (problematic PK choices):**

```sql
-- identity is the SQL-standard approach
create table users (
  id serial primary key  -- Works, but IDENTITY is recommended
);

-- Random UUIDs (v4) cause index fragmentation
create table orders (
  id uuid default gen_random_uuid() primary key  -- UUIDv4 = random = scattered inserts
);
```

**Correct (optimal PK strategies):**

```sql
-- Use IDENTITY for sequential IDs (SQL-standard, best for most cases)
create table users (
  id bigint generated always as identity primary key
);

-- For distributed systems needing UUIDs, use UUIDv7 (time-ordered)
-- Requires pg_uuidv7 extension: create extension pg_uuidv7;
create table orders (
  id uuid default uuid_generate_v7() primary key  -- Time-ordered, no fragmentation
);

-- Alternative: time-prefixed IDs for sortable, distributed IDs (no extension needed)
create table events (
  id text default concat(
    to_char(now() at time zone 'utc', 'YYYYMMDDHH24MISSMS'),
    gen_random_uuid()::text
  ) primary key
);
```

Guidelines:
- Single database: `bigint identity` (sequential, 8 bytes, SQL-standard)
- Distributed/exposed IDs: UUIDv7 (requires pg_uuidv7) or ULID (time-ordered, no
  fragmentation)
- `serial` works but `identity` is SQL-standard and preferred for new
  applications
- Avoid random UUIDs (v4) as primary keys on large tables (causes index
  fragmentation)
[Identity Columns](https://www.postgresql.org/docs/current/sql-createtable.html#SQL-CREATETABLE-PARMS-GENERATED-IDENTITY)

---

### 4.5 Use Lowercase Identifiers for Compatibility

**Impact: MEDIUM (Avoid case-sensitivity bugs with tools, ORMs, and AI assistants)**

PostgreSQL folds unquoted identifiers to lowercase. Quoted mixed-case identifiers require quotes forever and cause issues with tools, ORMs, and AI assistants that may not recognize them.

**Incorrect (mixed-case identifiers):**

```sql
-- Quoted identifiers preserve case but require quotes everywhere
CREATE TABLE "Users" (
  "userId" bigint PRIMARY KEY,
  "firstName" text,
  "lastName" text
);

-- Must always quote or queries fail
SELECT "firstName" FROM "Users" WHERE "userId" = 1;

-- This fails - Users becomes users without quotes
SELECT firstName FROM Users;
-- ERROR: relation "users" does not exist
```

**Correct (lowercase snake_case):**

```sql
-- Unquoted lowercase identifiers are portable and tool-friendly
CREATE TABLE users (
  user_id bigint PRIMARY KEY,
  first_name text,
  last_name text
);

-- Works without quotes, recognized by all tools
SELECT first_name FROM users WHERE user_id = 1;
-- ORMs often generate quoted camelCase - configure them to use snake_case
-- Migrations from other databases may preserve original casing
-- Some GUI tools quote identifiers by default - disable this

-- If stuck with mixed-case, create views as a compatibility layer
CREATE VIEW users AS SELECT "userId" AS user_id, "firstName" AS first_name FROM "Users";
```

Common sources of mixed-case identifiers:

Reference: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS

---

## 5. Concurrency & Locking

**Impact: MEDIUM-HIGH**

Transaction management, isolation levels, deadlock prevention, and lock contention patterns.

### 5.1 Keep Transactions Short to Reduce Lock Contention

**Impact: MEDIUM-HIGH (3-5x throughput improvement, fewer deadlocks)**

Long-running transactions hold locks that block other queries. Keep transactions as short as possible.

**Incorrect (long transaction with external calls):**

```sql
begin;
select * from orders where id = 1 for update;  -- Lock acquired

-- Application makes HTTP call to payment API (2-5 seconds)
-- Other queries on this row are blocked!

update orders set status = 'paid' where id = 1;
commit;  -- Lock held for entire duration
```

**Correct (minimal transaction scope):**

```sql
-- Validate data and call APIs outside transaction
-- Application: response = await paymentAPI.charge(...)

-- Only hold lock for the actual update
begin;
update orders
set status = 'paid', payment_id = $1
where id = $2 and status = 'pending'
returning *;
commit;  -- Lock held for milliseconds
-- Abort queries running longer than 30 seconds
set statement_timeout = '30s';

-- Or per-session
set local statement_timeout = '5s';
```

Use `statement_timeout` to prevent runaway transactions:

Reference: https://www.postgresql.org/docs/current/tutorial-transactions.html

---

### 5.2 Prevent Deadlocks with Consistent Lock Ordering

**Impact: MEDIUM-HIGH (Eliminate deadlock errors, improve reliability)**

Deadlocks occur when transactions lock resources in different orders. Always
acquire locks in a consistent order.

**Incorrect (inconsistent lock ordering):**

```sql
-- Transaction A                    -- Transaction B
begin;                              begin;
update accounts                     update accounts
set balance = balance - 100         set balance = balance - 50
where id = 1;                       where id = 2;  -- B locks row 2

update accounts                     update accounts
set balance = balance + 100         set balance = balance + 50
where id = 2;  -- A waits for B     where id = 1;  -- B waits for A

-- DEADLOCK! Both waiting for each other
```

**Correct (lock rows in consistent order first):**

```sql
-- Explicitly acquire locks in ID order before updating
begin;
select * from accounts where id in (1, 2) order by id for update;

-- Now perform updates in any order - locks already held
update accounts set balance = balance - 100 where id = 1;
update accounts set balance = balance + 100 where id = 2;
commit;
-- Single statement acquires all locks atomically
begin;
update accounts
set balance = balance + case id
  when 1 then -100
  when 2 then 100
end
where id in (1, 2);
commit;
-- Check for recent deadlocks
select * from pg_stat_database where deadlocks > 0;

-- Enable deadlock logging
set log_lock_waits = on;
set deadlock_timeout = '1s';
```

Alternative: use a single statement to update atomically:
Detect deadlocks in logs:
[Deadlocks](https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS)

---

### 5.3 Use Advisory Locks for Application-Level Locking

**Impact: MEDIUM (Efficient coordination without row-level lock overhead)**

Advisory locks provide application-level coordination without requiring database rows to lock.

**Incorrect (creating rows just for locking):**

```sql
-- Creating dummy rows to lock on
create table resource_locks (
  resource_name text primary key
);

insert into resource_locks values ('report_generator');

-- Lock by selecting the row
select * from resource_locks where resource_name = 'report_generator' for update;
```

**Correct (advisory locks):**

```sql
-- Session-level advisory lock (released on disconnect or unlock)
select pg_advisory_lock(hashtext('report_generator'));
-- ... do exclusive work ...
select pg_advisory_unlock(hashtext('report_generator'));

-- Transaction-level lock (released on commit/rollback)
begin;
select pg_advisory_xact_lock(hashtext('daily_report'));
-- ... do work ...
commit;  -- Lock automatically released
-- Returns immediately with true/false instead of waiting
select pg_try_advisory_lock(hashtext('resource_name'));

-- Use in application
if (acquired) {
  -- Do work
  select pg_advisory_unlock(hashtext('resource_name'));
} else {
  -- Skip or retry later
}
```

Try-lock for non-blocking operations:

Reference: https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS

---

### 5.4 Use SKIP LOCKED for Non-Blocking Queue Processing

**Impact: MEDIUM-HIGH (10x throughput for worker queues)**

When multiple workers process a queue, SKIP LOCKED allows workers to process different rows without waiting.

**Incorrect (workers block each other):**

```sql
-- Worker 1 and Worker 2 both try to get next job
begin;
select * from jobs where status = 'pending' order by created_at limit 1 for update;
-- Worker 2 waits for Worker 1's lock to release!
```

**Correct (SKIP LOCKED for parallel processing):**

```sql
-- Each worker skips locked rows and gets the next available
begin;
select * from jobs
where status = 'pending'
order by created_at
limit 1
for update skip locked;

-- Worker 1 gets job 1, Worker 2 gets job 2 (no waiting)

update jobs set status = 'processing' where id = $1;
commit;
-- Atomic claim-and-update in one statement
update jobs
set status = 'processing', worker_id = $1, started_at = now()
where id = (
  select id from jobs
  where status = 'pending'
  order by created_at
  limit 1
  for update skip locked
)
returning *;
```

Complete queue pattern:

Reference: https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE

---

## 6. Data Access Patterns

**Impact: MEDIUM**

N+1 query elimination, batch operations, cursor-based pagination, and efficient data fetching.

### 6.1 Batch INSERT Statements for Bulk Data

**Impact: MEDIUM (10-50x faster bulk inserts)**

Individual INSERT statements have high overhead. Batch multiple rows in single statements or use COPY.

**Incorrect (individual inserts):**

```sql
-- Each insert is a separate transaction and round trip
insert into events (user_id, action) values (1, 'click');
insert into events (user_id, action) values (1, 'view');
insert into events (user_id, action) values (2, 'click');
-- ... 1000 more individual inserts

-- 1000 inserts = 1000 round trips = slow
```

**Correct (batch insert):**

```sql
-- Multiple rows in single statement
insert into events (user_id, action) values
  (1, 'click'),
  (1, 'view'),
  (2, 'click'),
  -- ... up to ~1000 rows per batch
  (999, 'view');

-- One round trip for 1000 rows
-- COPY is fastest for bulk loading
copy events (user_id, action, created_at)
from '/path/to/data.csv'
with (format csv, header true);

-- Or from stdin in application
copy events (user_id, action) from stdin with (format csv);
1,click
1,view
2,click
\.
```

For large imports, use COPY:

Reference: https://www.postgresql.org/docs/current/sql-copy.html

---

### 6.2 Eliminate N+1 Queries with Batch Loading

**Impact: MEDIUM-HIGH (10-100x fewer database round trips)**

N+1 queries execute one query per item in a loop. Batch them into a single query using arrays or JOINs.

**Incorrect (N+1 queries):**

```sql
-- First query: get all users
select id from users where active = true;  -- Returns 100 IDs

-- Then N queries, one per user
select * from orders where user_id = 1;
select * from orders where user_id = 2;
select * from orders where user_id = 3;
-- ... 97 more queries!

-- Total: 101 round trips to database
```

**Correct (single batch query):**

```sql
-- Collect IDs and query once with ANY
select * from orders where user_id = any(array[1, 2, 3, ...]);

-- Or use JOIN instead of loop
select u.id, u.name, o.*
from users u
left join orders o on o.user_id = u.id
where u.active = true;

-- Total: 1 round trip
-- Instead of looping in application code:
-- for user in users: db.query("SELECT * FROM orders WHERE user_id = $1", user.id)

-- Pass array parameter:
select * from orders where user_id = any($1::bigint[]);
-- Application passes: [1, 2, 3, 4, 5, ...]
```

Application pattern:

Reference: https://supabase.com/docs/guides/database/query-optimization

---

### 6.3 Use Cursor-Based Pagination Instead of OFFSET

**Impact: MEDIUM-HIGH (Consistent O(1) performance regardless of page depth)**

OFFSET-based pagination scans all skipped rows, getting slower on deeper pages. Cursor pagination is O(1).

**Incorrect (OFFSET pagination):**

```sql
-- Page 1: scans 20 rows
select * from products order by id limit 20 offset 0;

-- Page 100: scans 2000 rows to skip 1980
select * from products order by id limit 20 offset 1980;

-- Page 10000: scans 200,000 rows!
select * from products order by id limit 20 offset 199980;
```

**Correct (cursor/keyset pagination):**

```sql
-- Page 1: get first 20
select * from products order by id limit 20;
-- Application stores last_id = 20

-- Page 2: start after last ID
select * from products where id > 20 order by id limit 20;
-- Uses index, always fast regardless of page depth

-- Page 10000: same speed as page 1
select * from products where id > 199980 order by id limit 20;
-- Cursor must include all sort columns
select * from products
where (created_at, id) > ('2024-01-15 10:00:00', 12345)
order by created_at, id
limit 20;
```

For multi-column sorting:

Reference: https://supabase.com/docs/guides/database/pagination

---

### 6.4 Use UPSERT for Insert-or-Update Operations

**Impact: MEDIUM (Atomic operation, eliminates race conditions)**

Using separate SELECT-then-INSERT/UPDATE creates race conditions. Use INSERT ... ON CONFLICT for atomic upserts.

**Incorrect (check-then-insert race condition):**

```sql
-- Race condition: two requests check simultaneously
select * from settings where user_id = 123 and key = 'theme';
-- Both find nothing

-- Both try to insert
insert into settings (user_id, key, value) values (123, 'theme', 'dark');
-- One succeeds, one fails with duplicate key error!
```

**Correct (atomic UPSERT):**

```sql
-- Single atomic operation
insert into settings (user_id, key, value)
values (123, 'theme', 'dark')
on conflict (user_id, key)
do update set value = excluded.value, updated_at = now();

-- Returns the inserted/updated row
insert into settings (user_id, key, value)
values (123, 'theme', 'dark')
on conflict (user_id, key)
do update set value = excluded.value
returning *;
-- Insert only if not exists (no update)
insert into page_views (page_id, user_id)
values (1, 123)
on conflict (page_id, user_id) do nothing;
```

Insert-or-ignore pattern:

Reference: https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT

---

## 7. Monitoring & Diagnostics

**Impact: LOW-MEDIUM**

Using pg_stat_statements, EXPLAIN ANALYZE, metrics collection, and performance diagnostics.

### 7.1 Enable pg_stat_statements for Query Analysis

**Impact: LOW-MEDIUM (Identify top resource-consuming queries)**

pg_stat_statements tracks execution statistics for all queries, helping identify slow and frequent queries.

**Incorrect (no visibility into query patterns):**

```sql
-- Database is slow, but which queries are the problem?
-- No way to know without pg_stat_statements
```

**Correct (enable and query pg_stat_statements):**

```sql
-- Enable the extension
create extension if not exists pg_stat_statements;

-- Find slowest queries by total time
select
  calls,
  round(total_exec_time::numeric, 2) as total_time_ms,
  round(mean_exec_time::numeric, 2) as mean_time_ms,
  query
from pg_stat_statements
order by total_exec_time desc
limit 10;

-- Find most frequent queries
select calls, query
from pg_stat_statements
order by calls desc
limit 10;

-- Reset statistics after optimization
select pg_stat_statements_reset();
-- Queries with high mean time (candidates for optimization)
select query, mean_exec_time, calls
from pg_stat_statements
where mean_exec_time > 100  -- > 100ms average
order by mean_exec_time desc;
```

Key metrics to monitor:

Reference: https://supabase.com/docs/guides/database/extensions/pg_stat_statements

---

### 7.2 Maintain Table Statistics with VACUUM and ANALYZE

**Impact: MEDIUM (2-10x better query plans with accurate statistics)**

Outdated statistics cause the query planner to make poor decisions. VACUUM reclaims space, ANALYZE updates statistics.

**Incorrect (stale statistics):**

```sql
-- Table has 1M rows but stats say 1000
-- Query planner chooses wrong strategy
explain select * from orders where status = 'pending';
-- Shows: Seq Scan (because stats show small table)
-- Actually: Index Scan would be much faster
```

**Correct (maintain fresh statistics):**

```sql
-- Manually analyze after large data changes
analyze orders;

-- Analyze specific columns used in WHERE clauses
analyze orders (status, created_at);

-- Check when tables were last analyzed
select
  relname,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
from pg_stat_user_tables
order by last_analyze nulls first;
-- Increase frequency for high-churn tables
alter table orders set (
  autovacuum_vacuum_scale_factor = 0.05,     -- Vacuum at 5% dead tuples (default 20%)
  autovacuum_analyze_scale_factor = 0.02     -- Analyze at 2% changes (default 10%)
);

-- Check autovacuum status
select * from pg_stat_progress_vacuum;
```

Autovacuum tuning for busy tables:

Reference: https://supabase.com/docs/guides/database/database-size#vacuum-operations

---

### 7.3 Use EXPLAIN ANALYZE to Diagnose Slow Queries

**Impact: LOW-MEDIUM (Identify exact bottlenecks in query execution)**

EXPLAIN ANALYZE executes the query and shows actual timings, revealing the true performance bottlenecks.

**Incorrect (guessing at performance issues):**

```sql
-- Query is slow, but why?
select * from orders where customer_id = 123 and status = 'pending';
-- "It must be missing an index" - but which one?
```

**Correct (use EXPLAIN ANALYZE):**

```sql
explain (analyze, buffers, format text)
select * from orders where customer_id = 123 and status = 'pending';

-- Output reveals the issue:
-- Seq Scan on orders (cost=0.00..25000.00 rows=50 width=100) (actual time=0.015..450.123 rows=50 loops=1)
--   Filter: ((customer_id = 123) AND (status = 'pending'::text))
--   Rows Removed by Filter: 999950
--   Buffers: shared hit=5000 read=15000
-- Planning Time: 0.150 ms
-- Execution Time: 450.500 ms
-- Seq Scan on large tables = missing index
-- Rows Removed by Filter = poor selectivity or missing index
-- Buffers: read >> hit = data not cached, needs more memory
-- Nested Loop with high loops = consider different join strategy
-- Sort Method: external merge = work_mem too low
```

Key things to look for:

Reference: https://supabase.com/docs/guides/database/inspect

---

## 8. Advanced Features

**Impact: LOW**

Full-text search, JSONB optimization, PostGIS, extensions, and advanced Postgres features.

### 8.1 Index JSONB Columns for Efficient Querying

**Impact: MEDIUM (10-100x faster JSONB queries with proper indexing)**

JSONB queries without indexes scan the entire table. Use GIN indexes for containment queries.

**Incorrect (no index on JSONB):**

```sql
create table products (
  id bigint primary key,
  attributes jsonb
);

-- Full table scan for every query
select * from products where attributes @> '{"color": "red"}';
select * from products where attributes->>'brand' = 'Nike';
```

**Correct (GIN index for JSONB):**

```sql
-- GIN index for containment operators (@>, ?, ?&, ?|)
create index products_attrs_gin on products using gin (attributes);

-- Now containment queries use the index
select * from products where attributes @> '{"color": "red"}';

-- For specific key lookups, use expression index
create index products_brand_idx on products ((attributes->>'brand'));
select * from products where attributes->>'brand' = 'Nike';
-- jsonb_ops (default): supports all operators, larger index
create index idx1 on products using gin (attributes);

-- jsonb_path_ops: only @> operator, but 2-3x smaller index
create index idx2 on products using gin (attributes jsonb_path_ops);
```

Choose the right operator class:

Reference: https://www.postgresql.org/docs/current/datatype-json.html#JSON-INDEXING

---

### 8.2 Use tsvector for Full-Text Search

**Impact: MEDIUM (100x faster than LIKE, with ranking support)**

LIKE with wildcards can't use indexes. Full-text search with tsvector is orders of magnitude faster.

**Incorrect (LIKE pattern matching):**

```sql
-- Cannot use index, scans all rows
select * from articles where content like '%postgresql%';

-- Case-insensitive makes it worse
select * from articles where lower(content) like '%postgresql%';
```

**Correct (full-text search with tsvector):**

```sql
-- Add tsvector column and index
alter table articles add column search_vector tsvector
  generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''))) stored;

create index articles_search_idx on articles using gin (search_vector);

-- Fast full-text search
select * from articles
where search_vector @@ to_tsquery('english', 'postgresql & performance');

-- With ranking
select *, ts_rank(search_vector, query) as rank
from articles, to_tsquery('english', 'postgresql') query
where search_vector @@ query
order by rank desc;
-- AND: both terms required
to_tsquery('postgresql & performance')

-- OR: either term
to_tsquery('postgresql | mysql')

-- Prefix matching
to_tsquery('post:*')
```

Search multiple terms:

Reference: https://supabase.com/docs/guides/database/full-text-search

---

## References

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://wiki.postgresql.org/wiki/Performance_Optimization
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security


---


# FILE: .\docs\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# docs

## Purpose

Product documentation, feature plans, and technical specifications for SlateCamp superpowers (major feature initiatives). Contains planning documents and design specs that guide implementation.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `superpowers/` | Root for all superpower feature documentation |
| `superpowers/plans/` | Feature planning documents -- roadmaps, implementation plans, and scope definitions |
| `superpowers/specs/` | Technical design specifications -- detailed architecture and design decisions |

## Key Files

### superpowers/plans/

| File | Description |
|------|-------------|
| `2026-03-17-3d-lab-library.md` | 3D Lab module library expansion plan |
| `2026-03-17-campfire-rebrand.md` | Campfire design system rebrand plan (7 phases, token map) |
| `2026-03-17-design-system-overhaul.md` | Design system overhaul and component audit |
| `2026-03-17-module-expansion-146.md` | Module expansion to 146 learning modules |
| `2026-03-17-nbcp-envelope-generator.md` | NBCP building envelope generator feature plan |
| `2026-03-17-ux-ui-overhaul.md` | UX/UI overhaul master plan |
| `2026-03-25-developer-hub-sidebar-overhaul.md` | Developer Hub sidebar navigation overhaul |

### superpowers/specs/

| File | Description |
|------|-------------|
| `2026-03-17-nbcp-envelope-generator-design.md` | NBCP envelope generator technical design spec |
| `2026-03-25-developer-hub-sidebar-overhaul-design.md` | Developer Hub sidebar overhaul design spec |

## For AI Agents

### Working In This Directory

- **Plans before code** -- read the relevant plan/spec before implementing a superpower feature
- **Date-prefixed naming** -- all files use `YYYY-MM-DD-feature-name.md` format
- **Plans vs specs** -- plans define scope and phases; specs define architecture and implementation details
- **Do not create docs unprompted** -- only add documentation files when explicitly requested by the user
- **Cross-reference with PRDs** -- implementation plans may reference PRDs in `.claude/docs/`

### Common Patterns

- Plans are written before implementation begins and may be updated as work progresses
- Specs are companion documents to plans, providing deeper technical detail
- Each superpower has a plan; complex superpowers also have a spec

## Dependencies

### Internal

- `.claude/docs/` -- Product Requirement Documents (PRDs) and blueprints
- `CLAUDE.md` (root) -- Campfire design system and voice guide constraints

<!-- MANUAL: -->


---


# FILE: .\public\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# public

## Purpose

Static assets served at the root URL path by Next.js. Contains SVG icons, branding assets, textures, and the widget modules directory for distributed learning components. All files here are publicly accessible and should contain no sensitive information.

## Key Files

| File | Description |
|------|-------------|
| `SlateCampLogoMark.svg` | Primary SlateCamp logo mark -- used in branding and navigation |
| `noise.png` | Subtle noise texture overlay for Campfire aesthetic |
| `file.svg` | Document/file icon -- used in file pickers and content lists |
| `globe.svg` | Global/world icon -- used in internationalization and search contexts |
| `window.svg` | Window icon -- used in layout and dialog UI elements |
| `next.svg` | Next.js logo -- legacy, may be removed |
| `vercel.svg` | Vercel logo -- legacy, may be removed |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `widgets/` | Widget assets directory |
| `widgets/modules/` | Reserved for future widget module files (currently empty) |

## For AI Agents

### Working In This Directory

- **Static only** -- this directory is served directly; no server-side processing occurs
- **SVG preferred** -- use SVG for icons and logos for scalability and small file size
- **Optimize images** -- compress PNGs and minimize SVG files before committing
- **No sensitive data** -- all files are publicly accessible; do not add environment variables, API keys, or user data
- **Naming convention** -- use PascalCase for component-related assets (e.g., `SlateCampLogoMark.svg`), kebab-case for utility assets (e.g., `noise.png`)
- **URL paths** -- files serve at root; e.g., `/SlateCampLogoMark.svg` or `/widgets/modules/...`

### Adding Assets

1. Place new files in this directory or a subdirectory
2. Reference in Next.js via static imports or absolute `/` paths
3. Verify the file is served correctly in dev (`bun run dev`) and production (`bun run build && bun run start`)
4. Update this AGENTS.md with the new asset

<!-- MANUAL: -->


---


# FILE: .\scripts\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# scripts

## Purpose

Contains development tooling scripts for local development and database management. These scripts handle dev server launching with platform-aware bundler selection, database connection testing, schema inspection, and OpenAPI spec caching.

## Key Files

| File | Description |
|------|-------------|
| `dev.js` | Custom dev server launcher -- spawns Next.js with Webpack on Windows (CSS pipeline bug workaround) or Turbopack on other platforms |
| `db-inspect.ts` | Queries the Supabase PostgREST API to dump the full OpenAPI schema and table definitions |
| `test-db.ts` | Tests Supabase connection by querying the `taxonomy_tree` table -- validates credentials and database accessibility |
| `openapi-spec.json` | Cached OpenAPI 2.0 (Swagger) specification generated by PostgREST -- documents all available tables and REST endpoints |

## For AI Agents

### Working In This Directory

- **Invoke scripts via bun commands** -- use `bun scripts/script-name.ts` or `bun run` aliases defined in `package.json`
- **Windows dev server limitation** -- Turbopack CSS pipeline resolves to "nul" (reserved device name) on Windows, so `dev.js` forces Webpack on `win32`
- **Supabase credentials** -- hardcoded in utility scripts for development; never commit to production
- **OpenAPI spec is read-only** -- generated by Supabase PostgREST; use `db-inspect.ts` to refresh it

### Common Patterns

**Launching the dev server:**
```bash
bun run dev          # Uses dev.js (platform-aware)
bun run dev:turbo    # Force Turbopack (non-Windows)
bun run dev:webpack  # Force Webpack (Windows)
```

**Testing database connectivity:**
```bash
bun scripts/test-db.ts    # Queries taxonomy_tree table
```

**Inspecting the schema:**
```bash
bun scripts/db-inspect.ts # Dumps full OpenAPI spec from Supabase
```

### Key Implementation Details

- **dev.js uses `child_process.spawn`** with `stdio: "inherit"` to stream Next.js output directly to the console
- **db-inspect.ts** queries `{supabaseUrl}/rest/v1/` endpoint with anon key to retrieve the Swagger spec
- **test-db.ts** uses `@supabase/supabase-js` client to verify table access (shallow query on `taxonomy_tree`)
- **All scripts use TypeScript** except `dev.js` (pure Node.js for boot-time speed)

## Dependencies

### Internal

- `../package.json` -- dev command scripts reference `scripts/dev.js`
- `../DATABASE_SCHEMA.sql` -- authoritative schema; seed scripts must align with table definitions

### External

- `@supabase/supabase-js` -- Client library for database queries and auth
- `next` -- CLI available at `node_modules/.bin/next` (invoked by `dev.js`)
- Node.js built-in `child_process` module (dev.js only)

<!-- MANUAL: -->


---


# FILE: .\src\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-04-02 -->

# src

## Purpose

The `src/` directory contains all source code for SlateCamp — a high-performance, discipline-agnostic study engine for professional licensure exams. This directory is organized into layered domains: routing (app), UI components, business logic (lib), state management, types, and static data.

**Design Philosophy:** Next.js App Router with Server Components by default. Use arrow functions exclusively. State is managed via Zustand or React Context. All code follows the Campfire design system and adheres to the core constraints in `CLAUDE.md`.

## Key Files

| File | Description |
|------|-------------|
| `app/layout.tsx` | Root layout with font configuration, metadata, and global providers |
| `app/globals.css` | Tailwind CSS 4 configuration and global utility overrides |
| `app/page.tsx` | Home page (landing) |
| `app/error.tsx` | Global error boundary component |
| `app/not-found.tsx` | 404 page |
| `app/favicon.ico` | Site favicon |
| `lib/routes.ts` | Central route definitions and navigation helpers |
| `lib/readiness-score.ts` | IRT 2-parameter logistic mastery calculation core |
| `lib/rate-limit.ts` | Request rate limiting utilities |
| `lib/analytics.ts` | Client-side event tracking and analytics |
| `lib/analytics-server.ts` | Server-side analytics and telemetry |
| `lib/lab-analytics.ts` | 3D Lab-specific interaction and performance tracking |
| `lib/wiki-markdown.ts` | Wiki markdown parsing and rendering utilities |
| `config/site.ts` | Global site configuration and constants |

## Subdirectories

### app/ — Next.js App Router Pages

| Directory | Purpose |
|-----------|---------|
| `(auth)/` | Authentication group: login, signup, password reset |
| `about/` | Public about page |
| `admin/` | Admin panel: audit logs, question management, wiki editing, content reviews |
| `api/` | Serverless API routes: payments, webhooks, cron jobs |
| `auth/` | Auth-specific routes (callback, signout, profile) |
| `contact/` | Contact form page |
| `dashboard/` | Main authenticated user interface: quiz, 3D Lab, readiness, focus areas |
| `pricing/` | Pricing and subscription page |
| `tools/` | Utility tools: spaced repetition scheduler, IRT calculator, demo mode |
| `try/` | Trial/freemium experience |

**Key Files:**
- `layout.tsx` — Root layout configuration
- `page.tsx` — Homepage
- `error.tsx` — Error boundary for unhandled exceptions
- `not-found.tsx` — 404 handler
- `globals.css` — Global Tailwind CSS and style overrides

### components/ — React Components by Feature

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `dashboard/` | Dashboard cards, heatmaps, queues, catalyst sessions | 58 files |
| `ui/` | shadcn/ui components: buttons, modals, inputs, tabs, cards, etc. | 30+ files |
| `wiki/` | Wiki editor, viewer, search, markdown rendering | 44 files |
| `quiz/` | Quiz UI: question stem, confidence toggle, rationale drawer, timers | 15+ files |
| `3d/` | 3D geometry rendering components (Three.js, React Three Fiber) | 10+ files |
| `3d-lab/` | 3D Lab interface: module gallery, control panels, compliance violations | 8+ files |
| `notes/` | Note-taking UI: editor, organizer, markdown renderer | 8+ files |
| `auth/` | Auth UI: login form, signup form, social login buttons | 5+ files |
| `admin/` | Admin-only components: audit viewer, question importer, content manager | 6+ files |
| `analytics/` | Analytics dashboard and reporting components | 4+ files |
| `assessment/` | Assessment and progress reporting | 4+ files |
| `sidebar/` | Navigation sidebar and rail (mobile overlay pattern) | 5+ files |
| `layouts/` | Page layout wrappers (auth, dashboard, admin) | 4+ files |
| `shared/` | Reusable utilities: loaders, empty states, tooltips, modals | 6+ files |
| `motion/` | Framer Motion animation wrappers and effects | 3+ files |
| `tools/` | Standalone tool UIs | 3+ files |
| `developer/` | Dev-only debug and testing UI | 2+ files |
| `landing/` | Homepage and marketing components | 3+ files |
| `marketing/` | Marketing pages and promotional elements | 2+ files |
| `trails/` | Learning path and trail visualizations | 2+ files |
| `settings/` | User settings and preferences UI | 2+ files |
| `interactive-illustrations/` | SVG and canvas illustrations for learning | 2+ files |
| `graphics/` | Data visualization (charts, graphs) | 2+ files |
| `dev/` | Development-only components and helpers | 2+ files |

**Convention:** All components use arrow functions and are Server Components by default. Client-side interactivity marked with `'use client'`. No generic gamification (no confetti, badges, currency). Styling via Tailwind CSS 4 with Campfire design system tokens.

### lib/ — Business Logic and Utilities

| Directory | Purpose |
|-----------|---------|
| `actions/` | 116 server actions for mutations: quizzes, notes, admin, payments, wiki, analytics, mastery, quiz-v2, daily-dose, progress-reports |
| `supabase/` | Supabase client initialization and type definitions |
| `srs/` | Spaced Repetition System implementation (scheduling, intervals) |
| `ai/` | AI Contextual Tutor integration (Temperature 0.0, cite-verified responses) |
| `readiness/` | Readiness Score calculation, taxonomy heatmap logic |
| `blindspot/` | Focus Review mode orchestration and question selection |
| `proof-simulation/` | Full Exam Simulation mode logic and scoring |
| `outcomes/` | Learning outcomes tracking and mastery mapping |
| `audit/` | Audit logging and compliance tracking |
| `admin/` | Admin-only utilities: content management, user management |
| `analytics-server.ts` | Server-side event tracking |
| `analytics.ts` | Client-side event tracking |
| `lab-analytics.ts` | 3D Lab interaction telemetry |
| `readiness-score.ts` | **CORE:** IRT 2-parameter logistic model for mastery |
| `rate-limit.ts` | Request throttling and DOS protection |
| `wiki-markdown.ts` | Wiki content parsing and rendering |
| `routes.ts` | Route definitions and navigation helpers |
| `utils.ts` | General utility functions |
| `constants/` | Global constants, site config, feature flags |
| `context/` | React Context providers (auth, theme, user state) |
| `hooks/` | Reusable React hooks (note: some also in root hooks/) |
| `validations/` | Zod schemas and input validation |
| `dev/` | Development-only helpers and mock data |
| `demo/` | Demo/trial mode logic |
| `import/` | Question and content import utilities |
| `notes/` | Note-taking logic and storage |
| `payments/` | Payment processing and subscription logic |
| `payrex/` | PayRex integration (payment gateway) |
| `paywall/` | Paywall and subscription enforcement |
| `signals/` | Competence signal calculation (micro-signals) |
| `stripe/` | Stripe integration (if applicable) |
| `workflow/` | Workflow and automation logic |
| `endurance/` | Extended Practice session orchestration |
| `__tests__/` | Business logic unit tests |

**Critical Files:**
- `lib/readiness-score.ts` — **DO NOT MODIFY WITHOUT TESTING.** Contains IRT theta calculation. All mastery decisions depend on this.
- `lib/supabase/` — Database client. Schema-dependent. Verify against `DATABASE_SCHEMA.sql`.
- `lib/actions/` — Server mutations. Always require proper authorization checks.

### hooks/ — React Hooks

| Directory | Purpose |
|-----------|---------|
| `quiz/` | Quiz-specific hooks: state, timing, confidence logic |
| `notes/` | Note-taking hooks: editor state, sync, validation |
| Root hooks | General-purpose hooks: auth, user data, theme, etc. |

**Files:**
- `useComplianceCheck.ts` — 3D Lab compliance rule validation
- `useGuidedSequence.ts` — Guided session orchestration
- `useLabTelemetry.ts` — 3D Lab event tracking

### stores/ — Zustand State Management

| File | Purpose |
|------|---------|
| `dev-store.ts` | Development and debug state |
| `useLabStore.ts` | 3D Lab module, camera, interaction state |

**Pattern:** State is co-located with components when possible. Zustand for global, complex state only. React Context for auth and theming.

### types/ — TypeScript Definitions

| File | Purpose |
|------|---------|
| `app.ts` | Core app types (User, Question, Session, Taxonomy, etc.) |
| `dashboard.ts` | Dashboard-specific types |
| `wiki.ts` | Wiki content types |
| `3d-lab.ts` | 3D Lab module and geometry types |
| `tools.ts` | Tool and utility types |
| `supabase.ts` | Database schema TypeScript mappings |
| `bun-test.d.ts` | Bun test framework type definitions |
| `payrex-node.d.ts` | PayRex Node.js SDK type definitions |

**Convention:** Keep types close to usage. Use discriminated unions for safety. Never use `any` without comment explaining why.

### config/ — Application Configuration

| File | Purpose |
|------|---------|
| `site.ts` | Site metadata, feature flags, environment config |

### features/ — Feature Modules (Vertical Slice Architecture)

| Directory | Purpose |
|-----------|---------|
| `wall-configurator/` | 7-step wall construction configurator with CHB, drywall, plaster, paint, tile engines. Self-contained: components/, engine/, hooks/, store/, types/, __tests__/ |

**Pattern:** Each feature is fully self-contained with its own components, business logic, state, and types. Use `@/` imports only for shared utilities.

### data/ — Static Data and Seeds

| File/Dir | Purpose |
|----------|---------|
| `mock-questions.json` | Mock question data for testing and demo |
| `seed/` | Database seed data |
| `seed/models_3d.json` | Pre-built 3D model configurations |
| `seed/questions.json` | Initial question bank |
| `seed/taxonomy.json` | Exam taxonomy and topic hierarchy |

## For AI Agents

### Working In This Directory

1. **Always verify against source of truth:**
   - Database schema: `DATABASE_SCHEMA.sql` (project root)
   - Core constraints: `CLAUDE.md` (project root)
   - Agent rules: `.claude/agents/` (project root)
   - Design system: Campfire tokens in `CLAUDE.md` Section 5

2. **Read before writing:**
   - Examine existing code in the feature area before creating new files
   - Follow established patterns (e.g., all dashboard cards follow a template)
   - Preserve consistency with voice and terminology (never say "pass," always use growth-framed language)

3. **Server Components by default:**
   - Mark interactive components with `'use client'` only when necessary
   - Fetch data in Server Components, pass to Client Components as props
   - Keep server actions in `lib/actions/` with proper auth checks

4. **State management hierarchy:**
   - Local component state: `useState()`
   - Multiple related components: React Context in `lib/context/`
   - Global app state (Lab, debug): Zustand in `stores/`

5. **Type safety:**
   - Import types from `types/` — never inline complex types
   - Use discriminated unions for safety (e.g., SessionMode: 'camp' | 'storm' | 'chill' | 'blindspot')
   - Verify type mappings against `supabase.ts` for database queries

### Testing Requirements

- **Unit tests:** Place alongside source in `__tests__/` subdirectories (e.g., `lib/__tests__/readiness-score.test.ts`)
- **Critical paths to test:** Readiness Score calculation, IRT model, payment webhooks, auth flows
- **Test runner:** Bun (default in project)
- **Coverage minimum:** 80% for business logic, 60% for UI
- **Mock data:** Use `data/mock-questions.json` and seed data for consistency

### Common Patterns

#### Adding a New Page

1. Create route in `app/[feature]/page.tsx`
2. Add layout wrapper if needed: `app/[feature]/layout.tsx`
3. Create feature components in `components/[feature]/`
4. Add server actions in `lib/actions/[feature].ts` if mutating data
5. Add types in `types/` if domain-specific
6. Update `lib/routes.ts` with route definition

#### Adding a New Quiz Mode

1. Define mode type in `types/app.ts` (e.g., `'newmode'`)
2. Create orchestration logic in `lib/[mode]/` (e.g., `lib/newmode/`)
3. Create UI components in `components/quiz/` and `components/dashboard/`
4. Add server actions for progress tracking
5. Wire IRT calculation if affecting mastery
6. Test readiness score impact (always use IRT)

#### Modifying the Design System

1. **Never hardcode colors.** Use Campfire tokens from `CLAUDE.md`
2. **Max transition:** 300ms, easing out by default
3. **Shadows:** `shadow-none` (rest), `shadow-sm` (hover), `shadow-lg` (modals only)
4. **Border radius:** `rounded-sm` (buttons), `rounded-md` (cards), `rounded-lg` (modals)
5. **Typography:** Minimum 11px. Monospace only for data values and Readiness Score number.
6. Test visually in dev server (use Chrome MCP, never use preview-specific tools)

#### Working with the 3D Lab

1. Module definitions in `app/dashboard/3d-lab/_config/modules/`
2. 3D components in `components/3d/` using React Three Fiber
3. Compliance checks in `hooks/useComplianceCheck.ts`
4. Telemetry in `lib/lab-analytics.ts`
5. State in `stores/useLabStore.ts`

#### Server Actions (Authentication Critical)

All server actions must:
1. Verify user authentication: `const user = await getCurrentUser()`
2. Check authorization: `if (user.role !== 'admin') throw new Error('Unauthorized')`
3. Validate input: Use Zod schema from `lib/validations/`
4. Return typed response: `{ success: boolean, data?: T, error?: string }`
5. Log audit trail if applicable: `await logAudit()`

#### AI Tutor Integration

- Temperature: 0.0 (deterministic, no hallucination)
- All responses must include citation badges linking to exact Wiki paragraphs
- Use question rationales (Misconception vs. Principle) to tailor responses
- Cite misconceptions first, then principles
- Never provide answers directly; guide understanding

## Dependencies

### Internal

- `@/app` — Next.js routing
- `@/components` — React components (all features)
- `@/lib` — Business logic, utilities, server actions
- `@/hooks` — React hooks (feature-specific and general)
- `@/stores` — Zustand state
- `@/types` — TypeScript definitions
- `@/config` — App configuration
- `@/data` — Static data and seeds
- `.claude/docs/` — PRDs and architecture blueprints (read before coding)
- `DATABASE_SCHEMA.sql` — Source of truth for schema

### External

**Framework & UI:**
- `next@16` — App Router, Server Components, image optimization
- `react@19` — Core rendering engine
- `tailwindcss@4` — Styling with Campfire design tokens
- `shadcn/ui` (@base-ui/react) — UI primitive components
- `framer-motion` — Animations (respect `prefers-reduced-motion`)

**Spatial Computing:**
- `react-three-fiber` (R3F) — React renderer for Three.js
- `three` — 3D graphics and geometry
- `@react-three/controls` — Camera controls

**State & Data:**
- `zustand` — Lightweight state management
- `@supabase/supabase-js` — PostgreSQL client and auth
- `zod` — Schema validation and parsing

**Auth & Payments:**
- `@supabase/auth-helpers-nextjs` — Next.js auth integration
- Payrex or Stripe — Payment processing

**Utilities:**
- `date-fns` — Date manipulation
- `clsx` — Conditional class names
- `sonner` — Toast notifications

**Development:**
- `bun` — Package manager and test runner
- TypeScript — Type safety
- ESLint — Code linting
- Prettier — Code formatting

## Architecture Notes

### Request Flow

1. User request → Next.js App Router
2. Server Component renders, fetches data from Supabase
3. Interactive zones marked with `'use client'`
4. Client-side state managed by Zustand or Context
5. User action → Server Action in `lib/actions/`
6. Server action validates, mutates database, returns result
7. UI updates optimistically or after confirmation

### Data Validation Layers

1. **Input validation:** Zod schemas in `lib/validations/`
2. **Business logic:** Server actions check rules (auth, domain constraints)
3. **Database constraints:** Supabase RLS policies and foreign keys
4. **Type safety:** TypeScript prevents runtime errors

### Mastery Calculation (IRT Core)

The Readiness Score uses a 2-parameter logistic (2PL) Item Response Theory model:

```
P(correct | theta) = 1 / (1 + exp(-a * (theta - b)))
```

Where:
- `theta` = student ability
- `a` = item discrimination
- `b` = item difficulty

Implementation: `lib/readiness-score.ts`
- Never modify without unit test coverage
- Always run tests: `bun test lib/readiness-score.test.ts`
- Verify against pedagogical team before releasing

### State Persistence & Auto-Save

- All testing sessions auto-save every 10 seconds
- Quiz progress saved after each question
- Notes synced to Supabase with debouncing
- Offline support via local storage (optional feature)

<!-- MANUAL: Keep this section for domain-specific notes and overrides -->



---


# FILE: .\src\app\AGENTS.md

<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-04-02 -->

# app

## Purpose

Root Next.js App Router directory for SlateCamp -- a cognitive-first, AI-adaptive board exam prep platform. Contains 105 pages, 13 layouts, 87 loading states, and 8 error boundaries across 4 portals: Dashboard (student), Admin (content management), CEO (business analytics), and Developer (internal docs/tools). Handles all user-facing routes, API endpoints, authentication flows, and the main application interface.

This directory implements the Campfire design system and enforces strict pedagogical constraints: no generic gamification, zero temperature AI tutor, Item Response Theory (IRT) mastery calculations, and growth-framed voice throughout.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Root layout: fonts (Inter, Syne, DM Mono, Geist), theme provider, tooltip provider, demo shell, navigation progress bar, toaster, noise filter |
| `page.tsx` | Landing page (marketing site) -- force-dynamic, SEO metadata, Readiness Score messaging |
| `error.tsx` | Global error boundary -- catches unhandled errors across all routes |
| `not-found.tsx` | 404 page |
| `globals.css` | Tailwind v4 CSS-first theme with Campfire design tokens (cobalt, emerald, warm red, amber, surfaces, text hierarchy) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `(auth)` | Auth route group: login, register, forgot-password, onboarding -- unauthenticated flows |
| `(protected)` | Protected route group: CEO dashboard portal (role-gated to `ceo`/`super_admin`) |
| `about` | About page (marketing) |
| `admin` | Admin panel: question/wiki CRUD, taxonomy management, reviews, audit logs, asset uploads |
| `api` | API routes: admin flags, AI endpoints (embed, generate-questions, study-agent, tutor), cron jobs, payments, webhooks |
| `auth` | Auth callback route (OAuth/SAML handler) |
| `contact` | Contact form page |
| `dashboard` | Student portal -- authenticated routes with sidebar navigation: wiki, review, notes, 3d-lab, analytics, testing, settings |
| `developer` | Developer portal -- internal docs, API reference, architecture guides, design system catalog, dev tools |
| `pricing` | Pricing page (marketing) |
| `calculators` | Construction calculators: CHB, drywall, flooring, paint estimators |
| `quiz` | Quiz routes: dynamic [mode]/session/[sessionId] with results and review pages |
| `test-3d` | 3D rendering test page |
| `tools` | Standalone utilities: floor-tiles-calculator, lot-plotter, wall-paint-calculator |
| `try` | Try/demo page (public preview) |

## For AI Agents

### Working In This Directory

**Authentication Context:**
- All routes under `/dashboard/*` require Supabase session (checked by middleware)
- CEO portal (`/ceo`) requires `ceo` or `super_admin` role
- Developer portal (`/developer`) requires authenticated user or `ALLOW_DEV_PORTAL_BYPASS` env var
- Admin panel (`/admin`) requires admin role
- Auth flows use `/api/auth/callback` for OAuth/SAML
- Session tokens refresh via middleware in root layout
- Anonymous/public routes: `/(auth)`, `about`, `contact`, `pricing`, `try`, `page.tsx`

**Metadata & SEO:**
- Root `layout.tsx` sets `metadata.template` -- all pages inherit `%s | SlateCamp`
- Use `export const metadata: Metadata = { title: "...", description: "..." }` in page.tsx or layout.tsx
- Dynamic pages can export `generateMetadata()` function
- Root viewport uses light theme color `#FFFFFF` / dark `#000000`

**Font Loading:**
- **Inter** (main body text, default) -- loaded via `next/font/google` in root layout with `variable: --font-inter`
- **Syne** (headings, bold accents) -- weights 400/700/800 in `variable: --font-syne`
- **DM Mono** (code, data values, Readiness Score number) -- weights 400/500 in `variable: --font-dm-mono`
- **Geist Sans** (fallback via `GeistSans` from 'geist/font/sans') -- included in layout but Inter is primary
- All fonts load with `display: 'swap'` (progressive text rendering)

**Component Patterns:**
- Server Components by default -- only mark client components with `'use client'`
- Suspense boundaries for async server component content
- Dashboard routes wrap content with shared layout (sidebar, navigation, settings context)
- Use shadcn/ui base components (`Button`, `Input`, `Card`, etc.)
- Use Phosphor icons (`@phosphor-icons/react`) and Lucide icons (`lucide-react`) for nav and UI actions

**Design Constraints:**
- Color palette strictly enforced: Camp Cobalt `#1B3FC4`, Emerald `#2D9F6F`, Warm Red `#D64545`, Amber `#D4951A`, Info Blue `#3B82C8`
- Border radius: `rounded-sm` (6px) for buttons/inputs, `rounded-md` (8px) for cards, `rounded-lg` (12px) for modals -- never `rounded-xl`/`rounded-2xl`/`rounded-3xl`
- Shadows: `shadow-sm` on hover, `shadow-md` for dropdowns, `shadow-lg` for modals -- never `shadow-xl`/`shadow-2xl` on non-modal elements
- Transitions max 300ms, default `duration-150 ease-out` -- never `bounce`/`spring` easing (except framer-motion structural animations)
- Minimum text size `text-[11px]` -- never use `text-[8px]`/`text-[9px]`/`text-[10px]`
- Monospace only on code snippets, data values, and Readiness Score number -- never on labels/categories/metadata

**Voice & Messaging:**
- Never use: "blindspot protocol", "endurance cycle", "proof simulation", "drill"/"grind", "weakness"/"gap", "dominate"/"conquer", "behind"/"overdue"
- Always use: "Focus Review", "Extended Practice", "Full Exam Simulation", "practice"/"review"/"session", "area to revisit"/"developing skill", "master"/"cover"/"strengthen", "ready for review"
- Growth-framed: "42 topics covered" not "58 remaining"
- Specific CTAs: "Start 10-Question Review" not "Begin Assessment"
- Welcoming empty states -- never accusatory
- Time-aware greetings (Good morning/evening with warm tone)

**Testing Modes:**
- **Camp** -- adaptive practice with personalized question selection
- **Storm** -- rapid-fire timed practice with timer bar
- **Chill** -- untimed, relaxed review mode
- **Custom** -- user-defined session parameters
- **Focus Review** -- targets weak areas from taxonomy (formerly "Blindspot")
- **Simulation** -- Full Exam Simulation with proctored conditions, timed, cold delivery results
- **Endurance** -- Extended Practice with multiple sessions
- **Subject** -- subject-focused drill

**Pedagogical Requirements (DO NOT BYPASS):**
- **No Generic Gamification:** Zero confetti, badges, virtual currency, empty streaks
- **Progression mapping:** Readiness Score only (IRT-based), Taxonomy Heatmap, Pacing Gauge
- **AI Tutor (Temperature 0.0):** MUST include citation badges linking to exact Wiki paragraphs; use structured rationales (Misconception vs. Principle) from questions
- **State Persistence:** All test environments auto-save every 10 seconds
- **IRT Mastery:** All calculations use 2-parameter logistic model (theta, discrimination, difficulty) -- never raw percentages
- **Readiness Score:** Real-time calculation based on IRT estimates, never static
- **Wiki Sourcing:** Every claim in study materials must link to verified expert sources

**API Route Patterns:**
- Request validation with `zod` or similar schema library
- Try-catch with structured error logging (include context, not just error message)
- Return `Response.json({ ... }, { status: ... })` for consistency
- Check `Authorization` header on protected endpoints (Supabase bearer token or `CRON_SECRET` for scheduled jobs)
- Cron routes must verify `Authorization: Bearer ${process.env.CRON_SECRET}`
- Use `process.env.NEXT_PUBLIC_*` only for public values -- never expose secrets in client bundle

### Common Patterns

**Portal Shell Pattern:**
Each portal (Admin, CEO, Developer) uses `PortalLayout` from `@/components/portal` with its own navigation, topbar color, and accent. Portal configs are centralized in `@/config/portals`.

**Route Configuration:**
- Single source of truth: `src/lib/constants/routes.ts` -- defines route constants (`ROUTES.LOGIN`, `ROUTES.DASHBOARD`, etc.)
- Sidebar nav defined in `src/lib/sidebar-constants.ts` -- `SIDEBAR_NAV_ITEMS`, `DASHBOARD_ROUTES`, `getPageTitle()`
- Nav groups: `learn` (Wiki, Notes, 3D Lab), `practice` (CampTrails, Review), `data` (Analytics)

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/constants/routes` | Route constants (single source of truth for all portal paths) |
| `@/lib/sidebar-constants` | Sidebar navigation metadata and page titles |
| `@/lib/auth` | Supabase session utilities, role checks |
| `@/config/portals` | Portal configuration (Admin, CEO, Developer) |
| `@/components/portal` | Shared `PortalLayout` component for Admin, CEO, Developer shells |
| `@/components/shared` | Theme provider, navigation progress, tooltips |
| `@/components/ui` | shadcn/ui components (button, card, input, etc.) |
| `@/components/landing` | Landing page content/fallback |
| `@/components/dashboard` | Dashboard shared components (sidebar, header, etc.) |
| `@/lib/supabase` | Supabase client initialization, helpers |

### External Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.6 | App Router, server/client components, metadata |
| `react` | 19.2.4 | Components, hooks |
| `tailwindcss` | 4.2.2 | CSS-first theme, Campfire design tokens |
| `@base-ui/react` + `shadcn` | Latest | Unstyled, accessible UI primitives |
| `@phosphor-icons/react` | Latest | Icon library for nav and UI |
| `lucide-react` | Latest | Additional icon library |
| `@supabase/supabase-js` | Latest | Auth, database, realtime |
| `three` | ^r183 | 3D rendering (spatial computing) |
| `@react-three/fiber` | 9.5.0 | React/Three.js integration |
| `zustand` | 5.0.12 | State management |
| `zod` | Latest | API request validation |
| `framer-motion` | Latest | Structural animations (no decorative bounce) |
| `geist` | ^1.x | Geist font (fallback) |

## Environment Variables

**Required in `.env.local`:**
- `NEXT_PUBLIC_SUPABASE_URL` -- Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- Supabase anon key (client-safe)
- `SUPABASE_SERVICE_ROLE_KEY` -- Server-only, for admin operations
- `NEXT_PUBLIC_APP_URL` -- App base URL (for OAuth redirects, metadata)
- `CRON_SECRET` -- Bearer token for scheduled job authorization

**Optional:**
- `NEXT_PUBLIC_DEMO_MODE` -- Set to enable demo shell (`isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL`)
- `ALLOW_DEV_PORTAL_BYPASS` -- Set to `'true'` to allow unauthenticated developer portal access
- `OPENAI_API_KEY` -- For AI endpoints (embed, tutor, question generation)
- `STRIPE_SECRET_KEY`, `PAYREX_API_KEY` -- Payment processors

## MANUAL

<!-- MANUAL: -->


---


# FILE: .\src\app\(auth)\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# (auth)

## Purpose

Authentication flow route group (Next.js route group: parenthesized name excludes from URL). Handles user signup, login, password recovery, and onboarding. All routes are public and unauthenticated. Uses Supabase Auth (Google OAuth + Email). Redirects authenticated users to `/dashboard`.

## Key Files

| File | Description |
|------|-------------|
| `error.tsx` | Auth route error boundary. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `login/` | Login page. Google OAuth sign-in form. Redirects to `/dashboard` on success. Link to register if no account. |
| `register/` | Registration page. Google OAuth sign-up form. Creates new Supabase Auth user. Collects email consent. Links to login if account exists. |
| `forgot-password/` | Password recovery flow. Email-based password reset link. Supabase built-in recovery email. |
| `onboarding/` | Post-signup onboarding. Collects: discipline selection, reviewer type (first_taker/returning_reviewer/undergrad/dae), conditional fields (exam date, study window, struggled subjects, institution). Server Action writes to profiles + user_global_stats. Redirects to `/dashboard` on completion. |

## For AI Agents

### Working In This Directory

- All routes are **public and unauthenticated**.
- Routes are **grouped** via parentheses `(auth)` — the group name does NOT appear in the URL path.
  - URL: `/login`, `/register`, `/forgot-password`, `/onboarding` (not `/(auth)/login`, etc.)
- Pages are **Server Components** where possible (onboarding page fetches disciplines + taxonomy data server-side).
- Forms use `'use client'` for interactivity (LoginForm, RegisterForm, OnboardingForm).
- Server Actions handle mutations: Supabase auth, profile creation, onboarding completion.
- Redirects to `/dashboard` after success; unauthenticated users are already on these routes.

### Common Patterns

- **Google OAuth:** Both login and register use `supabase.auth.signInWithOAuth({ provider: 'google' })`. Callback redirect is set dynamically (login → `/dashboard`, register → `/onboarding`).
- **Supabase Auth:** User credentials are managed by Supabase Auth (email/password or Google). Profile data (discipline, reviewer_type, etc.) is stored in `profiles` table after signup.
- **Server Actions:** `selectDiscipline` (onboarding) is a `'use server'` function that:
  - Reads FormData (discipline, reviewer_type, exam_date, study_window, struggled_subjects, institution).
  - Updates `user_global_stats` (is_retaker, exam_attempt_number, target_exam_date, onboarding_completed_at).
  - Upserts `profiles` (reviewer_type, discipline_id, preferred_study_window, previous_exam_subjects_struggled, etc.).
  - Tracks analytics event.
  - Redirects to `/dashboard`.
- **UI Layout:** Centered card layout, consistent with Campfire design (Surface Light bg, Surface Card card bg, rounded-md borders).
- **Links:** Relative links between login/register/password-reset pages. Metadata titles set per page.

## Dependencies

### Internal

- `@/lib/supabase/server` — `createClient()`, `getUser()` (onboarding only, to check session after signup).
- `@/lib/supabase/bootstrap` — `bootstrapUser()` on onboarding page (auto-creates profiles if missing).
- `@/lib/constants/routes` — ROUTES constant (ROUTES.LOGIN, ROUTES.DASHBOARD).
- `@/lib/constants/site` — `siteConfig.name` for logo/branding.
- `@/components/auth/SignInWithGoogleButton` — Reusable OAuth button.
- `@/components/auth/LoginForm` — Client component, handles form submission.
- `@/components/auth/RegisterForm` — Client component, handles form submission.
- `@/components/auth/OnboardingForm` — Client component, discipline selector, reviewer type, conditional fields.
- `@/lib/analytics-server` — `trackServerEvent('onboarding_completed', ...)` on form submission.
- `@/types/app` — Discipline type.
- `next/navigation` — `redirect()` for post-auth redirect.
- `next/cache` — `revalidatePath()` after onboarding update.

<!-- MANUAL: Google OAuth callback URLs configured in Supabase Auth settings. Redirects are set dynamically in code (loginUrl vs registerUrl). -->


---


# FILE: .\src\app\(protected)\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# (protected)

## Purpose

Next.js route group for role-gated portals that require elevated permissions beyond standard authentication. Currently houses the CEO Dashboard portal, which provides business analytics, financial tracking, team management, and behavioral insights for executives. The `(protected)` prefix is a route group -- it does not appear in the URL path.

## Key Files

| File | Description |
|------|-------------|
| (none at group level) | Route group has no layout or page of its own; each child portal defines its own layout |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `ceo/` | CEO Dashboard portal -- business metrics, financials, engagement insights, team management |

## CEO Portal Structure

| File / Directory | Description |
|------------------|-------------|
| `ceo/layout.tsx` | CEO layout -- verifies auth + `ceo`/`super_admin` role, redirects unauthorized users, wraps children in `CeoShell` |
| `ceo/page.tsx` | Command center -- North Star metrics (MRR, ARR, runway, paying users, conversion), business health charts (runway gauge, revenue), engagement health (DAU/MAU, WAU, streaks), unit economics (CAC, LTV, LTV:CAC ratio, ARPU) |
| `ceo/loading.tsx` | Skeleton loading state for CEO dashboard |
| `ceo/financials/page.tsx` | Financial ledger -- revenue/expense charts, expense breakdown, export functionality. Uses `BREAK_EVEN_MRR` threshold (172,000 PHP) |
| `ceo/insights/page.tsx` | Behavioral insights -- cohort retention table, churn risk bars, time-to-value funnel, churn signals |
| `ceo/team/page.tsx` | Team management -- team member table, department cost chart, monthly cost tracking |
| `ceo/_components/CeoShell.tsx` | Client component -- portal shell using `PortalLayout` with CEO-specific nav groups (Business, Product, Operations, Settings) |

## For AI Agents

### Working In This Directory

- **Role check is mandatory:** The CEO layout (`layout.tsx`) verifies the user has `ceo` or `super_admin` role via Supabase profile query. Non-qualifying users are redirected to `/dashboard`.
- **Server Components with Suspense:** All page-level data fetching uses async Server Components wrapped in `<Suspense>` boundaries with skeleton fallbacks.
- **Currency formatting:** Use `formatPeso()`, `formatPercent()`, `formatRatio()` from `@/types/ceo` -- never raw number display.
- **Portal shell pattern:** `CeoShell` wraps all pages with `PortalLayout` from `@/components/portal`, providing sidebar navigation, topbar branding, and consistent layout. Portal config comes from `@/config/portals`.
- **Nav structure:** Business (Dashboard, Revenue, Growth), Product (Users, Outcomes, Content), Operations (Team, Financials), Settings.
- **Data sources:** Financial queries in `@/lib/queries/ceo/financial-queries.ts`, user/engagement queries in `@/lib/queries/ceo/user-queries.ts`, team queries in `@/lib/queries/ceo/team-queries.ts`.
- **Access verification helper:** Use `verifyCeoAccess()` from `@/lib/queries/ceo/auth` in pages that need explicit auth checks beyond the layout.

### Testing Requirements

- Verify role-gating: non-CEO users must be redirected to `/dashboard`
- Verify unauthenticated users redirect to `/login`
- Confirm financial data displays with proper PHP currency formatting
- Ensure Suspense fallbacks render correctly during data loading
- Test with null/missing data -- all metric cards should show `"--"` gracefully

### Common Patterns

- `StatCard` from `@/components/shared/stat-card` for metric display
- `Eyebrow` from `@/components/ui/eyebrow` for section labels
- `Promise.all()` for parallel data fetching in async Server Components
- Chart components from `@/components/ceo/` (RunwayGauge, RevenueChart, etc.)
- Skeleton components from `@/components/ceo/skeletons/` for loading states

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/supabase/server` | `createClient` for server-side Supabase queries |
| `@/lib/queries/ceo/financial-queries` | `getFinancialSummary`, `getRevenueBreakdown`, `getUnitEconomics`, `getEngagementPreview`, `getPayingUserCount` |
| `@/lib/queries/ceo/user-queries` | `getEngagementSnapshot`, `getCohortRetention`, `getChurnRiskDistribution`, `getTimeToValue`, `getChurnSignals` |
| `@/lib/queries/ceo/team-queries` | `getTeamMembers`, `getDepartmentCosts` |
| `@/lib/queries/ceo/auth` | `verifyCeoAccess` -- throws/redirects if not authorized |
| `@/lib/actions/ceo/` | `export-actions`, `financial-actions`, `team-actions` -- server actions for mutations |
| `@/types/ceo` | `FinancialEntry`, `formatPeso`, `formatPercent`, `formatRatio`, `CATEGORY_LABELS` |
| `@/components/ceo/` | 13 CEO-specific components: charts, tables, gauges, forms, export buttons |
| `@/components/shared/stat-card` | Reusable metric card |
| `@/components/portal` | `PortalLayout` -- shared shell for all portals |
| `@/config/portals` | Portal configuration (label, colors, back navigation) |

### External

| Package | Purpose |
|---------|---------|
| `lucide-react` | Icons for CEO navigation |
| `recharts` | Chart rendering (revenue, expenses, retention) |

<!-- MANUAL: -->


---


# FILE: .\src\app\about\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# About

## Purpose
Marketing page introducing SlateCamp's mission, technology pillars, and value proposition. Targets new users and communicates the IRT-based adaptive testing, spaced repetition, and readiness scoring that differentiate the platform from traditional ALE reviewers.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component rendering hero, founder story, tech pillars (IRT, SRS, anti-inflation scoring), and CTA to free diagnostic |
| `loading.tsx` | Loading skeleton for page |

## For AI Agents
### Working In This Directory
- This is a public marketing page (no auth required)
- Uses `MarketingNav` and `MarketingFooter` components from `@/components/marketing`
- Follows Campfire design system (primary colors, typography, spacing)
- Hero section emphasizes founder credibility ("Built by an architect") and personal mission
- Tech section showcases pedagogical rigor (IRT 2-parameter model, spaced repetition, anti-inflation)
- Always link CTAs back to `/try` (free diagnostic) or `/pricing` (upgrade path)

## Dependencies
### Internal
- `@/components/marketing/MarketingNav` — Navigation with active route tracking
- `@/components/marketing/MarketingFooter` — Site footer
- `@/lib/constants/site` — `siteConfig` (site name)
- `@phosphor-icons/react/dist/ssr` — Icon library (Brain, ChartLineUp, Buildings)

<!-- MANUAL: -->


---


# FILE: .\src\app\admin\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-31 -->

# admin

## Purpose

Admin control room for content and system management. Gated by role check (`canReviewContent()`). Admins manage the entire knowledge lifecycle: creating/editing/deleting wiki articles and questions, managing taxonomy, reviewing content submissions, and auditing system activity.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Admin landing page. Public, unauthenticated. Google OAuth sign-in button. |
| `layout.tsx` | Admin layout wrapper. Protects all routes except `/admin` root. Checks `canReviewContent()`. Renders the `AdminShell` with sidebar nav. |
| `_components/AdminShell.tsx` | Centralized sidebar navigation and layout shell for all admin portals. |

## Subdirectories (Knowledge Hub)

| Directory | Purpose |
|-----------|---------|
| `knowledge/` | **The Unified Knowledge Base.** Central hub for all content management. Consolidates legacy "Articles" and "Questions" silos. |
| `knowledge/[id]/` | **Unified Content Editor.** Integrated split-pane MDX editor for wiki articles, showing linked questions and metadata side-by-side. |
| `knowledge/questions/` | **Question Bank.** Unified view of the assessment bank, utilizing the same taxonomy-driven browser as the main knowledge hub. |
| `knowledge/questions/[id]/` | **Context-Aware Question Editor.** Moderation interface for questions that automatically loads the linked source article in a reference pane. |
| `knowledge/new/` | Creation flow for new wiki articles. |
| `knowledge/questions/new/` | Creation flow for new questions, pre-loading article context if a topic is provided. |

## Subdirectories (Management)

| Directory | Purpose |
|-----------|---------|
| `dashboard/` | High-level overview. Stats (questions, wiki, coverage gaps), quick actions, and recent activity feed. |
| `taxonomy/` | Global taxonomy management. View/edit the discipline tree structure and ALE IDs. |
| `reviews/` | SME Review Queue. Content submitted for approval, deep-linked to unified editors. |
| `audit/` | Audit Log. Deep-linked history of every change made to the knowledge base. |
| `assets/` | 3D Asset Management. Catalog and preview models used in the 3D Lab scenes. |

## For AI Agents

### Working In This Directory

- **Unified Architecture**: Do NOT use legacy `/admin/articles` or `/admin/questions` for new features. Use `/admin/knowledge`.
- **Taxonomy First**: All content (articles and questions) is filtered via the global taxonomy tree.
- **Context-Awareness**: When editing a question, always provide the source article context. When editing an article, show the linked questions.
- **Data Revalidation**: Always call `revalidatePath('/admin/knowledge')` after any mutation to ensure cache consistency.

### Common Patterns

- **Deep Linking**: Audit logs and Review items must link to `/admin/knowledge/[id]` or `/admin/knowledge/questions/[id]`.
- **Hybrid Search**: The Knowledge Browser search filters both articles and questions simultaneously.
- **Safety Net**: Use the "Unassigned" filter in the knowledge hub to find content not yet mapped to the taxonomy.

## Dependencies

### Internal

- `@/lib/admin/roles` — `canReviewContent()` for authorization.
- `@/lib/actions/admin/content` — Primary server actions for the unified Knowledge Base.
- `@/components/admin/unified-editor/` — The core component library for the split-pane editing experience.
- `@/app/admin/knowledge/questions/_components/QuestionsTableClient` — The unified question listing component.

<!-- MANUAL: All legacy routes (/admin/articles, /admin/content, /admin/questions) now redirect to /admin/knowledge. -->


---


# FILE: .\src\app\api\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# api

## Purpose

RESTful API routes. Serverless functions handling admin operations, AI interactions, scheduled cron jobs, payment processing, PDF parsing, and payment webhooks. All routes use Next.js App Router `route.ts` pattern (GET, POST, DELETE, etc.).

## Key Files

None at root level. All functionality is in subdirectories organized by domain.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `admin/` | Admin-only endpoints |
| `admin/flags/` | Feature flag management -- POST (set dev flag overrides via cookie), DELETE (clear overrides). Requires admin auth via `isAdmin()`. Cookie name: `cerebro_dev_flags`. |
| `ai/` | AI integrations using Anthropic Claude and embeddings |
| `ai/tutor/` | AI Contextual Tutor -- POST generates tutor responses with misconception + principle + wiki ref context. Uses `@anthropic-ai/sdk` directly. Rate-limited per user. |
| `ai/embed/` | Text embedding generation -- POST creates 1536-dimensional embeddings via AI provider. Returns mock embeddings in demo mode. |
| `ai/generate-questions/` | AI question generation -- POST generates questions with choices from topic/subject context. Uses `questionGenerationPrompt` template. |
| `ai/study-agent/` | Study agent actions -- POST handles summarize, flashcards, and code_check actions on user notes/content. |
| `cron/` | Scheduled serverless functions (Vercel Cron Jobs, configured in `vercel.json`) |
| `cron/blindspot-scan/` | Nightly blindspot scan -- GET scans Taxonomy Heatmap for red/grey nodes, compiles 10-15 item quiz queue. Schedule: `0 16 * * *` (midnight PHT). |
| `cron/compute-signals/` | Daily signal computation -- GET computes velocity, churn risk, and session stats for all active users. Schedule: `30 16 * * *` (00:30 PHT, after blindspot scan). |
| `payments/` | Payment and subscription management |
| `payments/checkout/` | Checkout session creation -- POST creates Stripe/PayRex checkout sessions. Returns checkout URL, session ID, and provider. Demo mode returns mock URL. |
| `pdf/` | PDF document processing |
| `pdf/process/` | PDF parsing endpoint -- reserved directory (currently empty, no route.ts). |
| `webhooks/` | Inbound webhooks from payment providers |
| `webhooks/stripe/` | Stripe webhook handler -- POST verifies signature via `stripe-signature` header, processes subscription events (checkout.session.completed, customer.subscription.*), updates user tier. |
| `webhooks/payrex/` | PayRex webhook handler -- POST verifies signature via `payrex-signature` header, processes subscription status updates, maps payment amount to user tier. |

## For AI Agents

### Working In This Directory

- All routes are **serverless functions** (stateless, single request/response per invocation).
- API routes use Next.js App Router: `export async function GET/POST/DELETE(request: Request) { ... }`.
- Authentication is **inline** (check `supabase.auth.getUser()` or verify `CRON_SECRET`).
- Rate limiting is applied per-user for AI endpoints via `checkRateLimit()`.
- Errors are returned as JSON with appropriate HTTP status codes (401 Unauthorized, 403 Forbidden, 429 Rate Limited, 500 Server Error).
- Cron jobs verify `Authorization: Bearer ${CRON_SECRET}` header, defined in `vercel.json`.
- All AI routes support demo mode via `isDemoMode()` returning mock data.

### Common Patterns

- **Auth check:** `const { data: { user } } = await supabase.auth.getUser()` then `if (!user) return new Response("Unauthorized", { status: 401 })`.
- **Cron verification:** `const headersList = await headers()` then `headersList.get('authorization')` compared to `Bearer ${process.env.CRON_SECRET}`.
- **Webhook signature verification:** Read raw body with `request.text()`, verify signature from headers before processing.
- **Response format:** `NextResponse.json({ ...data })` or `new Response(message, { status: code })`.
- **Error logging:** `console.error(...)` for server-side debugging (visible in Vercel logs).
- **Admin check:** Use `isAdmin()` from `@/lib/admin/is-admin`.
- **Demo mode:** `isDemoMode()` returns mock/synthetic data without hitting external APIs.
- **Cron jobs use admin client:** `createAdminClient()` from `@/lib/supabase/admin` (service role, bypasses RLS).

## Dependencies

### Internal

- `@/lib/supabase/server` -- `createClient()` for authenticated endpoints
- `@/lib/supabase/admin` -- `createAdminClient()` for cron jobs (service role)
- `@/lib/admin/is-admin` -- `isAdmin()` for authorization checks
- `@/lib/rate-limit` -- `checkRateLimit(key)` for AI endpoint throttling
- `@/lib/payments/provider` -- `createCheckout()`, `tierFromAmount()` for payment integration
- `@/lib/ai/provider` -- `getAIProvider()` for AI model access
- `@/lib/ai/prompts` -- `questionGenerationPrompt` and other prompt templates
- `@/lib/demo/config` -- `isDemoMode()` to skip auth and return mock data in development
- `@/lib/validations` -- Zod schemas for request validation (e.g., `featureFlagsSchema`)
- `@/lib/stripe/config` -- `getStripe()` for Stripe client
- `@/lib/payrex/config` -- `getPayRex()` for PayRex client

### External

- `@anthropic-ai/sdk` -- Anthropic Claude API client for AI Tutor
- `stripe` -- Stripe SDK for webhook signature verification and event processing
- `next/server` -- `NextResponse`, `Request` type definitions
- `next/headers` -- `headers()`, `cookies()` for request inspection

<!-- MANUAL: Cron jobs configured in vercel.json. Update schedule there, not in code. -->


---


# FILE: .\src\app\calculators\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Calculators

## Purpose
Free interactive 3D material estimation tool suite for architecture professionals. Four production calculators (flooring, paint, drywall, CHB wall) with Zustand state management, React Three Fiber 3D visualization, and real-time cost/material estimates. Public-facing SEO pages with no auth required.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Index page listing calculator tools with status badges |
| `layout.tsx` | Minimal layout (no dashboard sidebar, standalone metadata) |
| `_stores/types.ts` | `BaseCalculatorStore` interface and factory for Zustand stores |
| `_stores/{flooring,paint,drywall,chb}Store.ts` | Tool-specific Zustand stores (inputs, computed, view modes) |
| `_lib/*-engine.ts` | Calculation engines (flooring, paint, drywall, CHB) with material/waste logic |
| `_lib/__tests__/*-engine.test.ts` | Jest test suites for engines |
| `_lib/{input-validation,unit-conversion,freemium,calculator-materials}.ts` | Shared utilities |
| `{flooring,paint,drywall,chb}/page.tsx` | Tool entry pages |
| `{flooring,paint,drywall,chb}/_components/{*Calculator,*Scene,*InputPanel}.tsx` | Client components (UI + R3F scenes) |
| `_components/{ResultRow,EstimationDisclaimer,CanvasEmptyState,SponsorCard,ExportActions,AssumptionsAccordion,FloatingCameraBar}.tsx` | Shared calculator UI components |

## For AI Agents
### Working In This Directory
- **Public pages** — no auth gate, SEO-friendly metadata on layout
- **Three-tier state:** Zustand store (inputs + view modes) → engine (calculations) → components (display)
- **R3F constraint:** 60 FPS target. Watch `inputVersion` in stores to trigger Scene re-renders
- **Freemium logic:** Some features behind paywall; see `_lib/freemium.ts` for gate checks
- **Unit handling:** All engines use standard units (mm for dimensions, kg for materials); conversion layer in `_lib/unit-conversion.ts`
- **Always test engines** with unit tests before deploying calculation changes
- **Metadata on layout, not page** — page.tsx has no metadata export
- **Export/sponsor cards** — keep BOM export and sponsor promotions in top-level components

### Working With Sub-Directories
Each tool (flooring, paint, drywall, chb) follows identical pattern:
1. `page.tsx` — Server component entry point
2. `_components/{ToolCalculator, ToolScene, ToolInputPanel}` — Client triple (Zustand inputs, R3F scene, result display)
3. Scenes are wrapped in Canvas with InvalidationBoundary to catch input mutations

## Dependencies
### Internal
- `@/components/layouts/SharedPageLayout` — Not used; calculators have standalone layout
- `@/lib/constants/site` — `siteConfig`
- `@phosphor-icons/react/dist/ssr` — Icons
- React Three Fiber, Three.js (3D scenes)
- Zustand (state management)
- Tailwind CSS 4 (Campfire tokens)

<!-- MANUAL: -->


---


# FILE: .\src\app\contact\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Contact

## Purpose
Public contact page featuring support channels, response time SLA, social links, and FAQ section. Communicates SlateCamp's small-team, responsive support model and addresses common questions about platform scope, readiness scoring, freemium access, and question bank curation.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component rendering contact cards, social links, and FAQ accordion |
| `loading.tsx` | Loading skeleton |

## For AI Agents
### Working In This Directory
- This is a public marketing page (no auth required)
- Uses `MarketingNav` and `MarketingFooter` components
- FAQ content is static (no CMS; hardcoded in `FAQS` array)
- Support email: `support@slatecamp.com` with 24-hour SLA (weekdays)
- Social links: Instagram, Twitter/X, LinkedIn (all branded @slatecamp)
- Tone: Warm, approachable, emphasizing Philip's direct involvement ("small team")
- If FAQ questions become outdated, update the `FAQS` array in page.tsx

## Dependencies
### Internal
- `@/components/marketing/MarketingNav` — Navigation with active route tracking
- `@/components/marketing/MarketingFooter` — Site footer
- `@/lib/constants/site` — `siteConfig`
- `@phosphor-icons/react/dist/ssr` — Icons (EnvelopeSimple, Clock, Question, social logos)

<!-- MANUAL: -->


---


# FILE: .\src\app\dashboard\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-04-02 -->

# dashboard

## Purpose

Main authenticated app area. Protected by Supabase Auth. Renders the study interface with sidebar navigation, heatmap visualization, activity feeds, subject mastery cards, and access to all features: assessment modes (Camp/Storm/Chill/Blindspot), trails, wiki, notes, 3D lab, reviews, proof simulation, and admin tools. All routes require active user session.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Root dashboard homepage. Renders hero command bar with Readiness Score, heatmap section, subject mastery cards, activity feed, wiki daily article, streak ribbon, SRS review widget, and onboarding state card. Async, uses Suspense. |
| `layout.tsx` | Root layout wrapper. Bootstraps user, fetches subscription tier, global stats, disciplines. Provides TierProvider, DisciplineProvider, ActiveSessionProvider, NoteContextProvider, SidebarProvider. Manages sidebar shell, navbar, breadcrumb context. Shows DevToolbar if isAdmin or isDemoMode. |
| `loading.tsx` | Page-level loading skeleton fallback. |
| `error.tsx` | Page-level error boundary handler. |
| `not-found.tsx` | 404 page for dashboard route group. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `3d-lab/` | Spatial visualization lab using React Three Fiber + Three.js. Module gallery, scene rendering, hotspot annotations, exploded assemblies, floor plan walkthroughs, cutaway sections. Client-heavy with LabViewport, Canvas wrapper. |
| `analytics/` | Data analytics and reporting dashboard. User performance trends, session analysis. |
| `area-c/` | Design quiz area with interactive components for architecture design challenges. |
| `assessment/` | Entry point to quiz modes. Routes to Camp, Storm, Chill, or Blindspot protocols. |
| `camptrails/` | Trail management UI. View active trails, historical trail data, progress tracking. |
| `developer/` | Internal developer tools (admin-only). Console, database inspector, logs, test data seeding, design system reference, documentation. |
| `exam-outcome/` | Post-exam survey and outcome tracking. Collects user feedback after proof simulation. |
| `focus-review/` | Focus Review (formerly Blindspot) protocol. Targeted quiz on weak nodes. |
| `notes/` | User notes management and retrieval interface. CRUD operations on personal notes. |
| `proof-simulation/` | Full exam simulation mode. Timed, full-length exam-like experience. Results page at `proof-simulation/results/`. |
| `review/` | Camp mode dashboard and review interface. CampDashboard component, custom layout. |
| `score-reveal/` | Readiness Score reveal flow. Post-initial assessment, shows user their computed score. |
| `settings/` | User account settings: discipline selection, theme preferences, logout. |
| `testing/` | Testing engine hub: session setup, active session, debrief. Supports 7 modes (Camp, Storm, Chill, Custom, Focus Review, Simulation, Subject). Dynamic routes: session/[sessionId], simulation/[sessionId]. |
| `trails/` | Trail list and detail views. View active study trail, day-by-day breakdown at `trails/[slug]/` and `trails/[slug]/today/`. |
| `upgrade/` | Tier upgrade / payment entry point. Prompts free users to upgrade to Pro. |
| `welcome-pro/` | Welcome screen for new Pro subscribers. |
| `wiki/` | Wiki article browser and search. Article detail view at `wiki/[slug]/`. |

## For AI Agents

### Working In This Directory

- All routes are **Server Components by default** (async/await, Suspense boundaries).
- Authentication is enforced at the layout level via `getUser()` redirect to login.
- User data (tier, stats, disciplines) is fetched in the layout and passed via Context providers.
- Feature flags and admin tools are only shown if `isAdmin` or `isDemoMode`.
- All subdirectories inherit the dashboard layout (sidebar, navbar, breadcrumb, main content area).

### Common Patterns

- **Data fetching:** Use Server Actions (`'use server'`) from `@/lib/actions/` for mutations. Use `@/lib/supabase/server` for server-side Supabase calls.
- **State management:** Zustand stores or React Context (TierProvider, DisciplineProvider, NoteContextProvider, ActiveSessionProvider, BreadcrumbProvider).
- **UI:** SharedPageLayout wrapper, Navbar, DashboardHeader, QuickActionsBar. Cards use `rounded-md`, shadows on hover only.
- **Styling:** Tailwind CSS 4 with Campfire color tokens (Camp Cobalt #1B3FC4, Emerald #2D9F6F, Warm Red #D64545, etc.).
- **Loading:** Use `<Suspense>` with skeleton components (HeatmapSectionSkeleton, DashboardPageSkeleton, etc.).
- **Dev Tools:** Check `isDemoMode()` and `isAdmin` before rendering DevToolbar, DevKeyboardProvider.

## Dependencies

### Internal

- `@/lib/actions/dashboard-page` — fetches hero stats, heatmap data, activity feed, subject mastery, streak info.
- `@/lib/supabase/server` — `createClient()`, `getUser()`, Supabase client initialization.
- `@/lib/supabase/bootstrap` — user bootstrap on first login (creates profiles, global_stats).
- `@/lib/admin/feature-flags` — `getFeatureFlags()`, `getEffectiveTier()` for dev tools.
- `@/lib/context/*` — TierProvider, DisciplineProvider, ActiveSessionProvider, NoteContextProvider, BreadcrumbProvider.
- `@/components/dashboard/*` — HeroCommandBar, HeatmapSection, SubjectMasteryCard, StreakRibbon, SrsReviewWidget, OnboardingStateCard, etc.
- `@/components/layouts/SharedPageLayout` — wrapper for all subpages.
- `@/components/shared/*` — Navbar, DashboardHeader, QuickActionsBar, DashboardPageSkeleton.
- `@/components/dev/*` — DevToolbar, DevKeyboardProvider (admin-only).
- `@/types/app` — UserTier, UserGlobalStats, Discipline types.

<!-- MANUAL: Any local customizations or overrides should be documented here. -->


---


# FILE: .\src\app\dashboard\3d-lab\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# 3d-lab

## Purpose

3D Interactive Lab for spatial learning of architectural concepts using React Three Fiber (R3F) and Three.js. Features a gallery of 187 module configurations covering building codes, structural systems, architectural history, accessibility requirements, fire safety, plumbing, electrical, and more. Each module is rendered as an interactive 3D scene with control panels, hotspot annotations, and informational overlays. Access is tier-gated (Camp+ subscribers or admin bypass).

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Full-viewport layout (`h-full w-full`) -- no SharedPageLayout, since R3F Canvas needs the full height chain |
| `page.tsx` | Server Component -- checks auth + tier access, renders `ModuleGallery` (no model param) or `ModuleViewer` (with `?model=` param) |
| `error.tsx` | Error boundary for 3D rendering failures |
| `loading.tsx` | Skeleton loading state |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `_components/` | 15 client components: CanvasWrapper, ControlPanel, GenericControlPanel, GeometryMesh, HotspotAnnotation, HotspotQuestion, HumanSilhouette, InfoPanel, LabViewport, ModuleGallery, ModuleViewer, PostModuleCTA, ViolationIndicator, FocusModeToggle |
| `_config/` | Module registry (57K, central index) + `modules/` folder with 187 individual module configs |
| `_config/modules/` | 187 TypeScript module definition files (e.g., `accessible-bathing.ts`, `fire-travel-distance.ts`, `classical-orders-comparison.ts`) |
| `_constants/` | NBCP (National Building Code of the Philippines) constants and test file |
| `_hooks/` | 3 hooks: `useInvalidateOnChange`, `useModuleInvalidate`, `useNBCPInvalidateOnChange` |
| `_scenes/` | 3 custom interactive scenes: `ClassicalOrders`, `FARPlayground`, `NBCPEnvelope` |
| `_stores/` | Zustand stores: `createModuleStore` (generic), `labStore` (lab state), `nbcpStore` (NBCP envelope state) |
| `_templates/` | 5 reusable scene templates: AnimatedSequence, CutawaySection, ExplodedAssembly, FloorPlanWalkthrough, ParametricScene (each with a scene renderer) |
| `_types/` | TypeScript type definitions for templates (`templates.ts`, 12K) |
| `_utils/` | NBCP calculator utilities with tests |

## For AI Agents

### Working In This Directory

- **Performance target:** 60 FPS minimum. All R3F components must be optimized for rendering performance. Avoid unnecessary re-renders, use `useMemo`/`useCallback` for geometries and materials.
- **Tier gating:** Access requires Camp+ subscription or admin bypass. The check uses `getFeatureFlags()` and `hasTierAccess()` from `@/lib/admin/feature-flags`. The `bypass3dGate` flag allows admin override.
- **Module architecture:** Each module is a TypeScript config file in `_config/modules/` that defines metadata (title, category, description), control panel parameters, hotspots, and scene configuration. The `moduleRegistry.ts` indexes all 187 modules.
- **Template system:** Modules use one of 5 templates (AnimatedSequence, CutawaySection, ExplodedAssembly, FloorPlanWalkthrough, ParametricScene) that provide reusable 3D rendering patterns. Custom scenes (ClassicalOrders, FARPlayground, NBCPEnvelope) exist for complex interactive visualizations.
- **Layout constraint:** The layout uses `h-full w-full` without `SharedPageLayout` because the R3F Canvas requires an unbroken height chain from the viewport. Using padding or `min-h-full` collapses the 3D viewport to zero.
- **Control panels:** `GenericControlPanel` (13K) provides a data-driven UI for adjusting module parameters. `ControlPanel` is the legacy version.
- **URL-based navigation:** Gallery view (no query params) vs. viewer mode (`?model=moduleId`). No nested routes -- everything is query-param driven from a single `page.tsx`.

### Testing Requirements

- Verify tier-gating: free users should see upgrade prompt, Camp+ users see gallery
- Test module gallery rendering with search and filtering
- Verify individual module viewer loads 3D scene correctly
- Test NBCP calculator utilities (existing tests in `_utils/nbcpCalculator.test.ts` and `_constants/nbcp.test.ts`)
- Confirm hotspot interactions work (click to show annotation/question)
- Performance: ensure 60 FPS in module viewer on standard hardware

### Common Patterns

- **Module config pattern:** Each module in `_config/modules/` exports a config object with `id`, `title`, `category`, `template`, `controls`, `hotspots`, and scene-specific data
- **Store pattern:** `createModuleStore` creates a Zustand store per module instance for managing control state
- **Scene rendering:** Templates receive module config and render appropriate Three.js geometry with R3F primitives
- **Hotspot system:** `HotspotAnnotation` renders clickable 3D markers, `HotspotQuestion` shows quiz overlays at hotspot locations

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/admin/feature-flags` | `getFeatureFlags`, `hasTierAccess` for tier gating |
| `@/lib/admin/get-admin-profile` | `getAdminAwareProfile` for auth + profile |
| `@/lib/constants/routes` | `ROUTES.LOGIN`, `ROUTES.THREE_D_LAB`, `ROUTES.SETTINGS_BILLING` |
| `@/components/graphics/icons/Icon` | `SCIcon` wrapper for consistent icon rendering |
| `@/components/ui/button` | shadcn Button for upgrade CTA |

### External

| Package | Purpose |
|---------|---------|
| `three` | 3D rendering engine |
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | Helper components (OrbitControls, Environment, etc.) |
| `zustand` | Module and lab state management |
| `@phosphor-icons/react` | Icons in control panels and UI |

<!-- MANUAL: -->


---


# FILE: .\src\app\dashboard\analytics\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# analytics

## Purpose

Analytics dashboard for SlateCamp students. Displays learning progress through 8 visualization sections: summary metrics bar, study timeline heatmap, readiness trajectory chart, pacing quadrant, stamina curve, subject radar, memory health, and pacing insights. All charts are Server Components wrapped in individual Suspense boundaries with skeleton fallbacks for progressive loading. Uses `SharedPageLayout` via its layout wrapper.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Wraps children in `SharedPageLayout` from `@/components/layouts/SharedPageLayout` |
| `loading.tsx` | Full skeleton loading state with chart placeholder shapes |
| `page.tsx` | Server Component that composes 8 analytics sections, each in its own `<Suspense>` boundary with `<ChartSkeleton>` fallbacks |

## Subdirectories

None -- all analytics visualization logic lives in `@/components/analytics/`.

## For AI Agents

### Working In This Directory

- **Server Components throughout:** The page itself and all section components (`SummarySection`, `ReadinessSection`, etc.) are async Server Components that fetch data independently.
- **Independent Suspense boundaries:** Each of the 8 sections has its own `<Suspense>` boundary, so they load progressively and independently. Never wrap multiple sections in a single Suspense boundary.
- **Chart skeletons:** Use `<ChartSkeleton height="h-[Npx]" />` from `@/components/analytics/ChartSkeleton` for consistent loading states. Match the height to the expected rendered height of each section.
- **Layout grid:** The page uses a responsive grid layout:
  - Summary metrics: full width, 64px height
  - Timeline heatmap: full width, 140px height
  - Readiness trajectory: full width, 220px height
  - Pacing quadrant (7/12 cols) + Stamina (5/12 cols) at xl breakpoint, 360px height
  - Radar + Memory + Pacing Insights: 3-column grid at md breakpoint, 320px height each
- **No data fetching in this directory:** All data fetching happens inside the section components in `@/components/analytics/`. The page file only composes them.
- **IRT-based metrics:** All readiness and mastery values use IRT 2-parameter logistic model calculations -- never raw percentage scores.

### Testing Requirements

- Verify all 8 sections render independently (one failing should not break others)
- Confirm Suspense fallbacks show proper skeleton shapes
- Test responsive layout at mobile, tablet, and desktop breakpoints
- Verify charts handle empty data states gracefully (new user with no sessions)

### Common Patterns

- **Section component pattern:** Each section (e.g., `ReadinessSection`) is an async Server Component in `@/components/analytics/` that fetches its own data from Supabase and renders a chart
- **Chart library:** Uses `recharts` for all chart rendering
- **Skeleton pattern:** `ChartSkeleton` accepts a `height` prop as a Tailwind class string

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/components/layouts/SharedPageLayout` | Standard page wrapper with padding and min-height |
| `@/components/analytics/ChartSkeleton` | Skeleton loading component for chart sections |
| `@/components/analytics/SummarySection` | Summary metrics bar (total questions, accuracy, study time) |
| `@/components/analytics/ReadinessSection` | Readiness trajectory line chart over time |
| `@/components/analytics/PacingQuadrantSection` | Pacing quadrant scatter plot (signature visualization) |
| `@/components/analytics/StaminaSection` | Stamina curve showing performance over session duration |
| `@/components/analytics/RadarSection` | Subject radar chart for multi-subject comparison |
| `@/components/analytics/MemorySection` | Memory health visualization (retention decay) |
| `@/components/analytics/PacingInsightsSection` | Pacing insights and recommendations |
| `@/components/analytics/TimelineHeatmapSection` | Study activity heatmap (calendar-style) |

### External

| Package | Purpose |
|---------|---------|
| `recharts` | Chart rendering for all analytics visualizations |

<!-- MANUAL: -->


---


# FILE: .\src\app\dashboard\area-c\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Area C

## Purpose
Design & Development Controls learning area for Philippine National Building Code (PD 1096, BP 344, RA 9514) calculations and scenario-based design problems. Hosts calculator reference tools and scenario-based quizzes tied to shared design briefs. Authenticated dashboard area.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Hub page listing Development Controls Calculator and Design Quiz tools |
| `calculator/page.tsx` | Development Controls Calculator reference tool page |
| `design-problems/page.tsx` | Design problems library listing |
| `design-problems/[problemId]/page.tsx` | Individual design problem with brief and submission |
| `design-quiz/page.tsx` | Design quiz hub/selection page |
| `design-quiz/[scenarioId]/page.tsx` | Scenario-based quiz session page |
| `_components/DesignProblemCard.tsx` | Card UI for design problems (difficulty, time limit, lock status) |
| `_components/DesignProblemSession.tsx` | Active design problem session component |
| `_components/DesignQuizSession.tsx` | Active design quiz session component |
| `_components/{ScenarioCard,ScenarioList,ScenarioResults,BriefPanel,SolutionReveal,QuestionCard}.tsx` | Quiz UI components |
| `_components/{BPComplianceChecklist,DevControlsCalculator}.tsx` | Specialized calculation/checklist components |
| `loading.tsx`, `*/loading.tsx` | Skeleton loaders |

## For AI Agents
### Working In This Directory
- **Auth required** — user must be logged in (check parent dashboard auth)
- **Two main features:** Development Controls Calculator (reference tool) and Design Quiz (scenario-based practice)
- **Design Problems:** Time-limited problems with difficulty levels (1–5: Introductory to Expert), lock progression, completion tracking
- **Design Quiz:** Scenario-based (multiple questions per scenario); questions build on shared brief; tied to PD 1096, BP 344, RA 9514
- **Campfire colors:** Inline style overrides (e.g., `color: '#1A2332'`) — prefer Tailwind but legacy code uses style props
- **Lock progression:** Problems unlock after completing prerequisite levels
- **Difficulty dots UI:** Visual 5-dot difficulty indicator for each problem
- Tab/layout flow: Page → Tool cards → Dynamic [problemId] or [scenarioId] page

## Dynamic Routes
- `[problemId]` — Design problem ID (UUID)
- `[scenarioId]` — Scenario ID (UUID) for quiz scenarios

## Dependencies
### Internal
- `@/components/layouts/SharedPageLayout` — Dashboard layout wrapper
- `@/lib/actions/design-problems` — Problem fetching + types
- `@/types/app` — Type definitions
- `@/components/{trails,assessment}/*` — Related dashboard components
- `@phosphor-icons/react/dist/ssr` — Icons (Calculator, Exam, Lock, CheckCircle, Clock)

<!-- MANUAL: -->


---


# FILE: .\src\app\dashboard\assessment\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Assessment

## Purpose
Initial onboarding assessment quiz for new users. Determines baseline readiness across all ALE disciplines (via IRT 2-parameter model). Authenticated page with mandatory completion before dashboard access; redirects completed users to main dashboard.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component handling auth check, completion check, and quiz initialization |
| `loading.tsx` | Loading skeleton |

## For AI Agents
### Working In This Directory
- **Auth required** — redirects to `/auth/login` if user not authenticated
- **Mandatory onboarding:** Redirects to `/dashboard` if already completed (prevents re-taking)
- **Discipline selection:** Reads `current_discipline_id` from `user_global_stats` table; redirects to `/dashboard` if not set
- **Question fetching:** Calls `getAssessmentQuestions(disciplineId)` to fetch assessment questions; redirects if empty pool
- **Rendering:** Passes `questionIds` and `disciplineId` to `AssessmentQuiz` client component
- **Flow:** User → Check auth → Check completion → Check discipline → Load questions → Render AssessmentQuiz
- This is a **blocking page** — no skip; completion is required before accessing main study features
- After completion, update `user_global_stats.assessment_completed = true` (likely in AssessmentQuiz)

## Dependencies
### Internal
- `@/lib/supabase/server` — `createClient()`, `getUser()` for auth
- `@/lib/actions/assessment` — `hasCompletedAssessment()`, `getAssessmentQuestions(disciplineId)` server actions
- `@/components/assessment/AssessmentQuiz` — Quiz UI component
- `next/navigation` — `redirect()` function

<!-- MANUAL: -->


---


# FILE: .\src\app\dashboard\camptrails\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Camp Trails

## Purpose
Structured study paths (Camp Trails) implementation. Multi-day, topic-paced learning prescriptions calibrated to user's exam date and knowledge gaps. Hub displays active enrollments, recommendations, and trail library. Authenticated dashboard area.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Hub page listing active trails, recommendations, and full trail library |
| `[slug]/page.tsx` | Trail detail/overview page |
| `[slug]/today/page.tsx` | Today's lesson/daily study prescription page |
| `[slug]/day/[dayNumber]/complete/page.tsx` | Completion confirmation page after daily session |
| `loading.tsx`, `[slug]/loading.tsx`, etc. | Skeleton loaders |

## For AI Agents
### Working In This Directory
- **Auth required** — user must be logged in (check parent dashboard auth)
- **Hub pattern:** Index page orchestrates three zones: (1) active trail banner, (2) recommendation card, (3) trail library grid
- **Data flow on hub (page.tsx):** Promise.all fetches [trails, enrollments, recommendation] in parallel; filters active enrollments; maps trails to enrollment data
- **Single focus above fold:** Only ONE active trail or recommendation shown; prevents cognitive overload
- **Empty state:** Welcoming message when no trails available (no panic, suggests Camp Mode or Wiki as alternatives)
- **Daily experience:** `[slug]/today/page.tsx` shows "daily prescription"; completion flows to `/day/[dayNumber]/complete`
- **Enrollment states:** Track `status === 'active'` vs. completed/paused
- **URL structure:** `/dashboard/camptrails/[slug]` (slug is trail identifier), `/[slug]/today`, `/[slug]/day/[dayNumber]/complete`

## Dynamic Routes
- `[slug]` — Trail identifier/slug (friendly URL segment)
- `[dayNumber]` — Day number (integer or date-based identifier)

## Dependencies
### Internal
- `@/components/layouts/SharedPageLayout` — Dashboard layout wrapper
- `@/lib/queries/trails` — `getPublishedTrails()`, `getUserEnrollments()`, `recommendTrail()` server functions
- `@/types/app` — `CampTrail`, `TrailEnrollment` types
- `@/components/trails/{RecommendedTrailCard,ActiveTrailBanner,TrailLibrary}` — UI components
- `@phosphor-icons/react/dist/ssr` — Icons (MapTrifold, Compass)

<!-- MANUAL: -->


---


# FILE: .\src\app\dashboard\notes\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# notes

## Purpose

Note-taking system for SlateCamp students. Provides a full-height split-pane interface with a note navigator (list/search/filter) on the left and a Tiptap-based rich text editor on the right. Notes can be linked to wiki articles, quiz questions, or taxonomy topics. Supports pinning, tagging, color-coding, and folder organization. Data is fetched server-side and passed to the client-side `NotesShell` component for interactive editing.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Simple full-height wrapper (`h-full w-full overflow-hidden`) -- no SharedPageLayout since notes needs full viewport control |
| `loading.tsx` | Skeleton loading state with navigator and editor placeholders |
| `page.tsx` | Server Component -- fetches user's notes (with metadata) and folders from Supabase, maps to `NoteStub[]`, renders `NotesShell` with initial data and optional `?open=noteId` param for deep linking |

## Subdirectories

None -- all note-related UI components live in `@/components/notes/`.

## For AI Agents

### Working In This Directory

- **Server-to-client handoff:** The page fetches all note stubs and folders server-side, then passes them as props to the client-side `NotesShell`. This avoids client-side loading spinners on initial page load.
- **Deep linking:** The `?open=noteId` search param allows direct navigation to a specific note (e.g., from a quiz question or wiki article link).
- **Note types:** Notes have a `note_type` field (`standard` and potentially others). Each note can optionally link to an `article_id`, `question_id`, or `topic_id` for cross-referencing with wiki articles, quiz questions, or taxonomy topics.
- **Data shape:** Notes are mapped to `NoteStub` type (from `@/types/app`) with `id`, `title`, `updated_at`, `is_pinned`, `note_type`, `tags`, `color`, `article_id`, `question_id`, `topic_id`, and `snippet` (truncated content preview via `snippet()` utility).
- **Sorting:** Notes are fetched sorted by `is_pinned` (descending) then `updated_at` (descending) -- pinned notes always appear first.
- **Folders:** Note folders are fetched separately from the `note_folders` table and sorted alphabetically by name.
- **Layout constraint:** Like 3D Lab, Notes uses a full-height layout without `SharedPageLayout` because the split-pane editor needs the full viewport height chain.
- **Rich text editor:** The actual editor component (`NotesEditor`) uses Tiptap for rich text editing with markdown support.

### Testing Requirements

- Verify notes load correctly with pinned notes appearing first
- Test deep linking via `?open=noteId` search param
- Confirm folder organization and filtering works
- Test note creation, editing, saving, and deletion
- Verify cross-reference links (article_id, question_id, topic_id) navigate correctly
- Test empty state when user has no notes

### Common Patterns

- **Parallel data fetching** with `Promise.all` for notes and folders
- **Snippet generation** via `snippet()` from `@/lib/utils/text` for note preview text
- **Full-height layout** with `overflow-hidden` for split-pane scrolling control
- **Async searchParams** with `Promise<{ open?: string }>` (Next.js 15+ pattern)

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/supabase/server` | `createClient`, `getUser` for server-side auth and data fetching |
| `@/lib/utils/text` | `snippet()` for truncating note content to preview text |
| `@/types/app` | `NoteStub` type definition |
| `@/components/notes/NotesShell` | Client-side shell with navigator + editor split pane |
| `@/components/notes/NotesEditor` | Tiptap-based rich text editor |
| `@/components/notes/NotesNavigator` | Note list with search, filter, and folder navigation |

### External

| Package | Purpose |
|---------|---------|
| `@tiptap/react` | Rich text editor framework |
| `@tiptap/starter-kit` | Basic editor extensions (bold, italic, lists, etc.) |
| `@supabase/supabase-js` | Database queries for notes and folders |

<!-- MANUAL: -->


---


# FILE: .\src\app\dashboard\testing\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# testing

## Purpose

Testing and review hub for SlateCamp's quiz engine. Provides 8 testing modes (Camp, Storm, Chill, Custom, Focus Review, Endurance, Subject, and Simulation), each with a setup flow, active session interface, and post-session debrief. The hub page (`ReviewHub`) presents mode cards, in-progress session resume, readiness score, and weak-area suggestions. All sessions are backed by Supabase `quiz_sessions` and `user_interactions` tables with IRT-based mastery tracking.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Passthrough layout with metadata: "Review & Testing \| SlateCamp" |
| `loading.tsx` | Skeleton loading state for the testing hub |
| `page.tsx` | Hub page -- Server Component that fetches user tier, session history, readiness score, blindspot queues, exam date, and weak nodes, then renders `ReviewHub` |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `camp/setup/` | Camp mode setup -- adaptive practice with personalized question selection |
| `storm/setup/` | Storm mode setup -- rapid-fire timed practice |
| `chill/setup/` | Chill mode setup -- untimed, relaxed review |
| `custom/setup/` | Custom mode setup -- user-defined session parameters |
| `focus-review/setup/` | Focus Review setup -- targets weak taxonomy areas (formerly "Blindspot") |
| `endurance/setup/` | Endurance setup -- Extended Practice with longer sessions |
| `subject/setup/` | Subject mode setup -- subject-focused practice |
| `simulation/` | Full Exam Simulation -- briefing page, active session, cold-delivery results |
| `simulation/briefing/` | Pre-simulation briefing page |
| `simulation/[sessionId]/results/` | Post-simulation results (available after 24-hour cold delivery period) |
| `session/[sessionId]/` | Active quiz session -- renders `SessionShell` with questions, timer, navigation |
| `session/[sessionId]/debrief/` | Post-session debrief -- score reveal, question review, mastery changes, readiness delta |

## For AI Agents

### Working In This Directory

- **8 testing modes** with strict pedagogical rules defined in CLAUDE.md. Each mode has a `/setup` page that configures and creates a `quiz_session` in Supabase.
- **Session lifecycle:** Setup -> Active Session (`/session/[sessionId]`) -> Debrief (`/session/[sessionId]/debrief`). Completed sessions auto-redirect from session page to debrief.
- **Simulation cold delivery:** Proof Simulation results are withheld for 24 hours after completion. The debrief page checks `hoursSinceCompletion` and redirects to the simulation results page if under 24 hours.
- **Voice rules:** Never use "blindspot" (use "Focus Review"), "endurance cycle" (use "Extended Practice"), "proof simulation" (use "Full Exam Simulation"), "drill"/"grind" (use "practice"/"review").
- **IRT mastery:** All score calculations use the 2-parameter logistic model. The debrief shows readiness score delta (`readinessBefore` vs `readinessAfter`) from `readiness_score_snapshots`.
- **State persistence:** Sessions auto-save every 10 seconds. The `SessionShell` component handles resume from `existingInteractions`.
- **Data fetching pattern:** Setup pages and the hub page are Server Components that query Supabase directly. Active session and debrief pages fetch session data server-side and pass to client shell components.
- **Route constants:** Use `ROUTES.TESTING_DEBRIEF(sessionId)`, `ROUTES.LOGIN`, etc. from `@/lib/constants/routes`.

### Testing Requirements

- Verify each mode setup page creates a valid `quiz_session` with correct `test_mode` value
- Confirm session resume works when navigating back to an in-progress session
- Test debrief page with completed sessions -- verify score delta, question review, mastery data
- Test simulation cold delivery: results page should show waiting state within 24 hours
- Verify the hub page handles empty state (no sessions, no weak nodes) gracefully
- Ensure blindspot/Focus Review queue integration works with `blindspot_queues` table

### Common Patterns

- **Server Component data fetching** with `createClient()` and `getUser()` from `@/lib/supabase/server`
- **Auth redirect:** `if (!user) redirect(ROUTES.LOGIN)` at the top of every page
- **Suspense boundaries** around data-dependent content with skeleton fallbacks
- **Mode-specific components** in `@/components/testing/` (session behaviors, debrief views, hub)
- **Dynamic route params:** `params: Promise<{ sessionId: string }>` (Next.js 15+ async params)

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/supabase/server` | `createClient`, `getUser` for server-side auth and data |
| `@/lib/constants/routes` | `ROUTES` -- route constants including `TESTING_DEBRIEF()` |
| `@/components/testing/hub/ReviewHub` | Main hub component with mode cards, session history, readiness display |
| `@/components/testing/session/SessionShell` | Active quiz session shell -- question rendering, navigation, timer, auto-save |
| `@/components/testing/debrief/DebriefLayout` | Post-session debrief -- score hero, question review strip, mastery changes |
| `@/components/testing/session/CampSessionBehavior` | Camp-mode specific session logic |
| `@/components/testing/session/ChillSessionBehavior` | Chill-mode specific session logic |
| `@/components/testing/session/StormTimerBar` | Storm mode timer bar component |
| `@/components/testing/debrief/ScoreHero` | Readiness score reveal animation |
| `@/components/testing/debrief/BlockAccuracyChart` | Block accuracy visualization |
| `@/components/testing/debrief/QuestionReviewStrip` | Per-question review in debrief |
| `@/components/testing/debrief/NodeMasteryStrip` | Topic mastery changes visualization |
| `@/types/testing` | Testing-related TypeScript types |

### External

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Database queries for sessions, interactions, mastery |
| `framer-motion` | Session transition animations |

<!-- MANUAL: -->


---


# FILE: .\src\app\dashboard\wiki\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# wiki

## Purpose

Knowledge Wiki for SlateCamp -- the authoritative study reference for Architecture Licensure Exam content. Provides a taxonomy-tree-navigated article browser with rich content types (facts, definitions, formulas, code provisions, exam tips, warnings, cross-references). Articles are rendered with a hero section, structured content blocks, table of contents, sources popover, related articles, elaborative interrogation prompts, teach-back prompts, and wrong-answer banners linked from quiz sessions. The layout includes a sidebar with the taxonomy tree for navigation.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Wraps children in `WikiLayoutContent` (provides taxonomy sidebar) inside a full-height container with Suspense boundary |
| `loading.tsx` | Skeleton loading state mimicking article structure |
| `page.tsx` | Client component -- landing/empty state with hero icon, feature grid (Syllabus Mapped, Interactive, Smart Search), and sidebar usage hint |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[slug]/` | Dynamic article route -- renders full wiki article by slug with all content blocks, sources, related articles, and active learning prompts |
| `test/` | Empty test directory (no files) |

## Article Page (`[slug]/page.tsx`)

The article page is the primary learning surface. It:
1. Resolves article and taxonomy node from the slug via `resolveArticleAndNode()`
2. Fetches article sources via `getArticleSources()`
3. Fetches elaborative interrogation prompts via `getEIPromptsForArticle()`
4. Fetches teach-back criteria via `getTeachBackCriteria()`
5. Renders `WikiArticleHero` (title, difficulty badge, reading time, navigation)
6. Renders `WikiArticle` (structured content blocks with 10 item types)
7. Renders `WikiRightSidebar` (table of contents, related articles)
8. Includes `TeachBackPrompt`, `WrongAnswerBanner`, and `WikiReadTracker`

**Content item types:** `fact`, `definition`, `formula`, `concept`, `code_provision`, `exam_tip`, `warning`, `heading`, `detail`, `cross_ref` -- each with distinct border color, background, and label styling.

## For AI Agents

### Working In This Directory

- **Taxonomy-driven navigation:** The wiki sidebar (from `WikiLayoutContent`) renders a hierarchical taxonomy tree. Articles are organized under the 8 ALE (Architecture Licensure Exam) root categories.
- **Article sourcing:** Every article MUST have verified sources. Use `getArticleSources()` and render source citations via `WikiSourcesPopover`.
- **Active learning features:** Articles include elaborative interrogation (EI) prompts that challenge the reader to explain concepts, and teach-back prompts that assess comprehension. These are pedagogically grounded -- not generic quizzes.
- **Content block styling:** Each of the 10 content item types has specific visual treatment defined in `ITEM_STYLES` (border-left color, background tint, label text color). Follow these exactly.
- **Reading time:** Calculated via `estimateReadingTime()` from `@/lib/wiki-markdown` and displayed in the hero.
- **Wrong answer integration:** `WrongAnswerBanner` shows when a user navigates to an article after getting a related question wrong, linking their quiz experience to study material.
- **Read tracking:** `WikiReadTracker` tracks article reading progress for analytics.
- **Difficulty mapping:** Articles display difficulty as "Foundational" (level 0-1), "Intermediate" (level 2), or "Advanced" (level 3+).

### Testing Requirements

- Verify article rendering for all 10 content item types
- Test taxonomy sidebar navigation and article slug resolution
- Confirm sources popover displays article citations
- Test elaborative interrogation prompt rendering and user response flow
- Verify teach-back prompt criteria loading
- Test wrong-answer banner visibility when navigating from a failed quiz question
- Verify empty state (landing page) renders correctly with feature grid

### Common Patterns

- **Server Component data fetching** with parallel `Promise.all` for article, sources, and prompts
- **Content block rendering** via `WikiArticle` with structured item type styling
- **Sidebar layout** via `WikiLayoutContent` wrapping the taxonomy tree
- **Dynamic routes** with `[slug]` for article pages

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/actions/wiki-actions` | `resolveArticleAndNode`, `getArticleSources` |
| `@/lib/actions/ei-prompts` | `getEIPromptsForArticle`, `getUserEIResponsesForArticle` |
| `@/lib/actions/teach-back` | `getTeachBackCriteria` |
| `@/lib/wiki-markdown` | `estimateReadingTime` |
| `@/components/wiki/WikiArticle` | Article renderer with `getArticleHeadings` |
| `@/components/wiki/WikiArticleHero` | Article header (title, metadata, difficulty) |
| `@/components/wiki/WikiHeader` | Wiki page header |
| `@/components/wiki/WikiRightSidebar` | Table of contents + related articles |
| `@/components/wiki/WikiLayoutContent` | Layout wrapper with taxonomy sidebar |
| `@/components/wiki/WikiSourcesPopover` | Sources citation overlay |
| `@/components/wiki/WikiRelatedPopover` | Related articles popover |
| `@/components/wiki/TeachBackPrompt` | Active learning prompt component |
| `@/components/wiki/WrongAnswerBanner` | Post-quiz wrong answer notification |
| `@/components/wiki/WikiReadTracker` | Reading progress tracker |
| `@/components/wiki/ElaborativeInterrogation` | EI prompt component |
| `@/components/wiki/WikiSidebar` | Taxonomy tree sidebar |

### External

| Package | Purpose |
|---------|---------|
| `@phosphor-icons/react` | Icons (BookOpen, MagnifyingGlass, Sparkle, Lightning) |

<!-- MANUAL: -->


---


# FILE: .\src\app\developer\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# developer

## Purpose

Internal Developer Portal for the SlateCamp engineering team. Provides documentation, API reference, architecture guides, a live design system catalog with component previews, system status monitoring, and developer tools (feature flags, user impersonation, test data generation, console, logs). Access requires authentication or the `ALLOW_DEV_PORTAL_BYPASS` environment variable. Uses its own `DevPortalShell` layout with portal-specific navigation.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Portal layout -- verifies auth (or bypass env var), determines environment (development/staging/production), wraps children in `DevPortalShell` |
| `page.tsx` | Portal home -- section cards (Design System, System Status, Dev Tools), system health status dots, quick actions, platform metrics (50 tables, 11 API routes, 247 components, 89 RLS policies), tech stack table, recent changelog |
| `error.tsx` | Error boundary for developer portal |
| `loading.tsx` | Skeleton loading state |
| `not-found.tsx` | 404 page for developer portal |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `_components/` | 11 shared components: CodeBlock, ComponentShowcase (84K), CopyButton, DevBadge, DevPortalSearch, DevPortalShell, DevPortalSidebar, EndpointCard, PropTable, TableOfContents |
| `api-reference/` | API reference page -- documents all API endpoints with request/response schemas |
| `architecture/` | Architecture overview page -- system diagrams, data flow, component relationships |
| `components/` | Component documentation page (49K) -- full inventory of all platform components |
| `design-system/` | Live design system catalog with domain-organized previews |
| `design-system/content-blocks/` | Content block component previews with `[component]` dynamic route |
| `design-system/questions/` | Question component previews with `[component]` dynamic route |
| `design-system/shared/` | Shared component previews with `[component]` dynamic route |
| `design-system/testing-path/` | Testing path component previews with `[component]` dynamic route |
| `design-system/widgets/` | Widget component previews with `[component]` dynamic route |
| `design-system/wiki/` | Wiki component previews with `[component]` dynamic route |
| `status/` | System status overview |
| `status/database/` | Database health and metrics |
| `status/infrastructure/` | Infrastructure status monitoring |
| `tools/` | Dev tools hub page |
| `tools/console/` | Interactive console with client-side execution |
| `tools/db/` | Database inspection tool |
| `tools/logs/` | Log viewer |
| `tools/test-data/` | Test data generation tool |

## For AI Agents

### Working In This Directory

- **Access control:** Authentication is checked in `layout.tsx`. Set `ALLOW_DEV_PORTAL_BYPASS=true` in env for local development without auth.
- **Environment detection:** Layout determines `development`/`staging`/`production` based on `ALLOW_DEV_PORTAL_BYPASS` and `NEXT_PUBLIC_APP_URL`.
- **Design system catalog:** The design system section uses domain-organized categories (content-blocks, questions, shared, testing-path, widgets, wiki), each with a `[component]` dynamic route for individual component preview pages. Preview data comes from `_previews.tsx` files in each category directory.
- **Component registry:** `@/lib/developer/componentRegistry` provides `getAllComponents()` for the component count and catalog data.
- **Changelog:** `@/lib/developer/changelog` exports `CHANGELOG` array for the recent changes section.
- **Shell pattern:** `DevPortalShell` uses `PortalLayout` from `@/components/portal` with Developer-specific branding and navigation from `@/config/portals`.
- **This is an internal tool** -- it is not user-facing. Design patterns can be more functional/utilitarian than the student-facing dashboard.
- **Large files:** `ComponentShowcase.tsx` (84K) and `components/page.tsx` (49K) are intentionally large as they document the entire component library.

### Testing Requirements

- Verify auth bypass works with `ALLOW_DEV_PORTAL_BYPASS=true`
- Confirm design system component previews render correctly for each category
- Test API reference endpoint documentation accuracy
- Verify system status page shows real health data
- Test dev tools (console, DB inspector, test data generation, log viewer)
- Confirm environment badge shows correct environment

### Common Patterns

- **Dynamic component routes:** `design-system/[category]/[component]/page.tsx` pattern for individual component docs
- **Preview files:** `_previews.tsx` or `_widget-previews.tsx` files export preview configurations for design system categories
- **Status dots:** Color-coded operational/degraded indicators (`bg-emerald-500` / `bg-amber-500`)
- **Monospace for data:** Tech stack versions, metrics, and code use `font-[family-name:var(--font-dm-mono)]`

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/components/portal` | `PortalLayout` for developer portal shell |
| `@/config/portals` | Portal configuration (colors, navigation) |
| `@/lib/admin/roles` | `getUserRole` for access control |
| `@/lib/constants/routes` | `ROUTES.DASHBOARD` for redirect |
| `@/lib/developer/changelog` | `CHANGELOG` array for recent changes |
| `@/lib/developer/componentRegistry` | `getAllComponents()` for component catalog |
| `@/components/shared/stat-card` | Metric display cards |
| `@/components/ui/card` | Card component with `variant="interactive"` |
| `@/components/ui/badge` | Status and count badges |

### External

| Package | Purpose |
|---------|---------|
| `lucide-react` | Icons (Palette, Activity, Wrench, Database, etc.) |

<!-- MANUAL: -->


---


# FILE: .\src\app\pricing\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Pricing

## Purpose
Public subscription pricing page with tabbed tiers for individuals, educational institutions, and enterprise. Tracks upgrade page views via analytics event. Entry point for conversion funnel from marketing to paid plans.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component wrapping PricingContent with layout |
| `pricing-content.tsx` | Client component with tab UI and tier cards; tracks `upgrade_page_viewed` event |
| `loading.tsx` | Loading skeleton |

## For AI Agents
### Working In This Directory
- **Client component** — `pricing-content.tsx` is use client (tabs require interactivity + analytics tracking)
- **Tab structure:** Three views — Individuals, Educational, Enterprise — each with its own pricing tier grid
- **Pricing data source:** `@/lib/constants/pricing` exports `INDIVIDUAL_TIERS`, `EDUCATIONAL_TIERS`, `ENTERPRISE_TIERS`
- **Analytics:** `trackEvent({ event_name: 'upgrade_page_viewed' })` fires on mount
- **Typography:** Uses `Instrument_Serif` (italic tagline), Campfire tokens for colors
- **Layout:** Centered max-w-[1200px], responsive grid (1 col mobile → 3 cols on md/lg)
- When updating tiers (price, features, limits), edit constants in `@/lib/constants/pricing`

## Dependencies
### Internal
- `@/components/marketing/MarketingNav` — Navigation
- `@/components/marketing/MarketingFooter` — Footer
- `@/components/marketing/PricingCard` — Tier card component (accepts tier object)
- `@/lib/constants/pricing` — Tier definitions (INDIVIDUAL_TIERS, EDUCATIONAL_TIERS, ENTERPRISE_TIERS)
- `@/lib/analytics` — `trackEvent` function
- `next/font/google` — Instrument_Serif serif font

<!-- MANUAL: -->


---


# FILE: .\src\app\quiz\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Quiz

## Purpose
Quiz/testing mode router and container. Redirects quiz index to testing hub; hosts nested routes for quiz setup, active sessions, results, and review across multiple testing modes (Camp, Storm, Chill, Blindspot). Full-screen focused experience with no dashboard sidebar.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component redirecting `/quiz` to `/testing` |
| `layout.tsx` | Minimal container (no sidebar, full focus) with surface-light background |
| `[mode]/setup/page.tsx` | Server component for quiz mode selection and configuration |
| `[mode]/setup/client.tsx` | Client component handling setup form interactivity |
| `[mode]/session/[sessionId]/page.tsx` | Live quiz session page (question, timer, answer tracking) |
| `[mode]/session/[sessionId]/results/page.tsx` | Results page showing session performance metrics |
| `[mode]/session/[sessionId]/review/page.tsx` | Question review page with explanations and misconceptions |
| `loading.tsx`, `[mode]/setup/loading.tsx`, etc. | Skeleton loaders for each page |

## For AI Agents
### Working In This Directory
- **Naming:** `[mode]` is the testing mode (camp, storm, chill, blindspot) — NOT user-selected tabs but pedagogically distinct test modes
- **Session flow:** Setup → Live Session → Results → Review (each has its own page + loading state)
- **Server-first:** All pages are Server Components; setup/client.tsx is the interactivity layer
- **No auth check here** — auth is enforced at the layout/parent level (check `src/app/(dashboard)` for context)
- **Redirect pattern:** Index redirects to `/testing` (testing hub lives elsewhere in app structure)
- **Loading states:** Must provide loading.tsx at each segment to prevent layout shift

## Dynamic Routes
- `[mode]` — Testing mode ID (camp, storm, chill, blindspot)
- `[sessionId]` — Unique session identifier (UUID format)

## Dependencies
### Internal
- `@/lib/constants/routes` — `ROUTES.TESTING` for redirect target
- `next/navigation` — `redirect()` function
- Testing/quiz state likely managed at parent level or via Zustand store (check components)

<!-- MANUAL: -->


---


# FILE: .\src\app\tools\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Tools

## Purpose
Hub page for standalone browser-based utility tools (floor tiles, wall paint, lot plotter). Light, focused SEO landing pages separate from the main calculator suite. Entry point for specific tool discovery.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component listing available tools with icons and descriptions |
| `floor-tiles-calculator/page.tsx` | Floor tiles calculation tool page |
| `floor-tiles-calculator/FloorTilesPageClient.tsx` | Client wrapper component |
| `wall-paint-calculator/page.tsx` | Wall paint calculation tool page |
| `wall-paint-calculator/WallPaintPageClient.tsx` | Client wrapper component |
| `lot-plotter/page.tsx` | Lot plotter tool page |
| `lot-plotter/LotPlotterClient.tsx` | Client wrapper component |
| `loading.tsx` | Hub page loading skeleton |
| `{tool}/loading.tsx` | Tool-specific loading skeletons |

## For AI Agents
### Working In This Directory
- **Hub + sub-tools pattern:** Index page displays grid of tool cards; each tool has its own sub-directory
- **No 3D visualization** (unlike calculators) — these are simpler, focused utility tools
- **Tool card structure:** Icon, title, description, href link, tag (category: "Estimating" or "Site Planning")
- **Metadata:** SEO-friendly (keywords: architecture tools, ALE exam prep)
- **Public pages** — no auth required
- **Client wrappers:** Each tool page has a Client component wrapper for interactivity
- When adding new tools: create sub-directory, add Page component, add Client wrapper, list in TOOLS array on hub

## Tool Sub-Directories
Each tool follows:
1. `page.tsx` — Server component entry
2. `{ToolName}PageClient.tsx` — Client component with tool logic
3. `loading.tsx` — Skeleton loader

## Dependencies
### Internal
- `@/components/marketing/MarketingNav` — Navigation
- `@/components/marketing/MarketingFooter` — Footer
- `@/components/tools/ToolCard` — Reusable tool card component
- `@/lib/constants/site` — `siteConfig`
- `@phosphor-icons/react/dist/ssr` — Icons (GridFour, PaintBucket, MapTrifold)

<!-- MANUAL: -->


---


# FILE: .\src\app\try\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Try

## Purpose
Free pre-assessment teaser page implementing UX strategy Section 4 (Step 2). Public, no-auth-required experience where users answer 5 sample ALE questions before hitting "create account" gate. Delays sign-up to maximize engagement ("skin in the game" before commitment, per Duolingo insight).

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component rendering PreAssessmentTeaser component |
| `loading.tsx` | Loading skeleton |

## For AI Agents
### Working In This Directory
- **No auth required** — public free preview
- **Pre-Assessment Teaser component** lives in `@/components/assessment/PreAssessmentTeaser`; handles 5-question flow and "create account" upsell gate
- **UX strategy:** Delayed sign-up. User gets invested in answers before account requirement
- **After 5 questions:** Modal/upsell saying "Create a free account to see your Readiness Score"
- **Metadata:** Title "Try SlateCamp — Free Diagnostic Sample", description explains 5-question no-account preview
- This is a funnel conversion page — track event in analytics (likely handled by PreAssessmentTeaser component)

## Dependencies
### Internal
- `@/components/assessment/PreAssessmentTeaser` — Quiz component handling 5-question flow and account gate
- `next/font` — Possible metadata/typography imports (implicit)

<!-- MANUAL: -->


---


# FILE: .\src\components\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-04-02 -->

# components

## Purpose

This directory contains all React components organized by feature domain. Components follow the Campfire design system (warm, inviting, clean) using shadcn/ui + Tailwind CSS v4 CSS variables, with strict constraints on styling (shadow depth, border radius, transition duration) and no generic gamification (confetti, badges, virtual currency).

All components are server-first (default `'use client'` only where interactivity is required) and leverage the Next.js App Router pattern.

## Subdirectories

| Directory | Purpose | Key Components |
|-----------|---------|---|
| `3d/` | Base 3D components | Three.js/R3F primitives, scene setup |
| `3d-lab/` | 3D Lab workspace (26 files) | Spatial learning: LabViewer, LabCanvas, hotspots, exploded views, cross-sections, violation visualizers |
| `admin/` | Admin panel UI (21 files + 3 subdirs) | MDX editor, question editors, asset management, SME review, unified content editor, preview modes, settings |
| `analytics/` | Analytics dashboard (18 files) | Recharts-based: readiness trajectory, memory health, pacing quadrant, stamina curves, timeline heatmaps |
| `assessment/` | Assessment/exam UI (4 files) | Exam state, progress tracking, result rendering |
| `auth/` | Authentication UI (3 files) | Login/register forms, credential input |
| `ceo/` | CEO dashboard (13 files + skeletons/) | Revenue charts, runway gauge, team table, churn risk, cohort retention, financial ledger |
| `dashboard/` | Main dashboard (28 files + heatmap/, results/) | ReadinessScore, TaxonomyHeatmap, session builders, mode cards, activity feeds, quiz renderer |
| `dev/` | Developer tools (8 files) | Dev toolbar, demo shell, feature flag board, impersonation panel, system info |
| `developer/` | Developer portal UI (8 files) | Component page layout, status banner, status KPI, uptime bar, breadcrumbs |
| `graphics/` | Graphic system (4 files + icons/, ui/) | Design tokens, SCIcon wrapper, icon map, gradients, patterns, noise filter |
| `interactive-illustrations/` | Interactive 2D learning (2D/ subdir) | SVG-based teaching illustrations, animations |
| `landing/` | Landing page (2 files) | Marketing hero, CTAs |
| `layouts/` | Layout wrappers (1 file) | Page layout structure |
| `marketing/` | Marketing pages (20 files) | Pricing, features, testimonials, value props |
| `motion/` | Framer-motion animations (2 files) | Reusable animation components |
| `notes/` | Note-taking (9 files) | TipTap editor, note shell, navigator, quick capture, templates |
| `portal/` | Portal shell (9 files) | Shared layout for admin/CEO/developer portals: topbar, sidebar, command palette, code blocks |
| `quiz/` | Quiz primitives (17 files) | Question rendering, answer input, rationale drawers, timer, confidence toggle, save indicator |
| `quiz-v2/` | Next-gen quiz engine (32 files, results/ + setup/) | Config-driven QuizShell, setup wizard, results dashboard, score bands, mode-specific behaviors |
| `notifications/` | Notification system (6 files) | Toast notifications, notification center, real-time alerts |
| `r3f/` | React Three Fiber scenes (4 files) | 3D scene components, camera rigs, lighting setups |
| `score/` | Score display (2 files) | Readiness Score visualization, score badges |
| `session/` | Session management (1 file) | Active session UI state |
| `settings/` | User settings (1 file) | Account/preference configuration |
| `shared/` | Reusable utilities (31 files) | ThemeProvider, data-table, section-header, stat-card, taxonomy-picker, breadcrumb, empty-state, score-display |
| `sidebar/` | Sidebar navigation (13 files) | Unified v2 sidebar (52px/216px), mobile drawer, provider, constants |
| `testing/` | Testing engine (42 files, 4 subdirs) | Full testing lifecycle: setup, session, debrief, hub. Mode-specific behaviors, score bands |
| `tools/` | Standalone tools (3 subdirs) | Calculator UI, physics tools |
| `trails/` | Camp Trails (22 files) | Trail library, daily views, phase maps, catch-up, score trajectory, recommendations |
| `ui/` | shadcn/ui primitives (43 files) | button, dialog, card, tooltip, input, checkbox, badge, tabs, sheet, command, etc. |
| `wiki/` | Wiki/knowledge base (54 files + widgets/) | Article viewer, MDX rendering, sidebar, TOC, callouts, learning aids, bp344/dsgn013 widgets |

## For AI Agents

### Working In This Directory

1. **Read the feature domain first.** Before editing a component, check the sibling components in its subdirectory to understand established patterns and reused utilities.

2. **Match Campfire design rules.** All components must follow:
   - Cards: `shadow-none` at rest, `shadow-sm` on hover (never `shadow-xl`, `shadow-2xl`)
   - Border radii: `rounded-md` (8px) on cards, `rounded-sm` (6px) on buttons/inputs, `rounded-lg` (12px) on modals
   - Transitions: max 300ms, default `duration-150 ease-out` (never `duration-500+` or `bounce`/`spring`)
   - Minimum text size: 11px (`text-[11px]`). NEVER use `text-[8px]`, `text-[9px]`, `text-[10px]`.
   - Monospace: ONLY on code snippets, data values, and Readiness Score number. NEVER on labels/categories/metadata.

3. **No generic gamification.** Absolutely no confetti, badges, virtual currency, or empty streaks. Progression maps ONLY to Readiness Score, Taxonomy Heatmap, or Pacing Gauge.

4. **Server components by default.** Mark components `'use client'` ONLY if they use hooks (useState, useContext, etc.), event handlers, or client-only libraries. Most components should be server-rendereable.

5. **Import from shadcn/ui for base primitives.** Use `@/components/ui/*` for button, card, dialog, tooltip, input, etc. Do NOT create custom implementations of these.

6. **Use shared utilities.** Check `shared/` for ThemeProvider, NavigationProgress, modals, headers before creating duplicates.

7. **Arrow functions only.** All component declarations and handlers use arrow functions (`const Component = (...) => ...`), never `function` declarations.

### Common Patterns

**Type-safe props:**
```tsx
interface ComponentProps {
  label: string
  onClick?: () => void
  disabled?: boolean
}

const Component = ({ label, onClick, disabled }: ComponentProps) => {
  // Implementation
}
```

**Conditional classes with cn():**
```tsx
import { cn } from '@/lib/utils'

<div className={cn('base-class', isActive && 'active-class', disabled && 'opacity-50')}>
```

**Readiness Score coloring:**
```tsx
const getReadinessColorClass = (value: number): string => {
  if (value < 40) return 'text-[#D64545]'      // Warm Red
  if (value < 70) return 'text-[#E8853A]'      // Camp Orange
  return 'text-[#2D9F6F]'                       // Emerald
}
```

**Card styling:**
```tsx
<Card className={cn('border-border bg-white shadow-none')}>
  {/* shadow-none at rest; shadow-sm on hover applies via :hover pseudo-class */}
</Card>
```

**Quiz/dashboard components:**
- Import from `@/stores/useLabStore`, `useQuizStore`, or similar Zustand stores for state.
- Fetch session data via server actions (`'use server'`) in parent pages, pass as props.
- Never fetch inside client components; use props or context.

**3D Lab components (R3F):**
- Use `useLabStore` for camera, hotspot, and panel state.
- Import `ModuleConfig` type from `@/types/3d-lab`.
- Canvas components must be lazy-loaded with `Suspense` boundary.
- Keep geometries and materials in separate files for reusability.

## Dependencies

### Internal

| Category | Modules |
|----------|---------|
| **Stores** | `@/stores/useLabStore`, `useQuizStore`, `useDashboardStore`, `dev-store` (Zustand) |
| **Types** | `@/types/3d-lab`, `@/types/quiz`, `@/types/dashboard`, `@/types/testing`, `@/types/ceo`, `@/types/developer`, `@/types/app` |
| **Utils** | `@/lib/utils` (cn), `@/lib/color-utils`, `@/lib/format-utils` |
| **Server Actions** | `@/app/actions/*`, `@/lib/actions/*` (auth, quiz, dashboard, testing, ceo fetchers) |
| **UI Primitives** | `@/components/ui/*` (shadcn/ui base) |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | UI framework | ^19.2.4 |
| **next** | App Router, Server Components, Images | 16.1.6 |
| **@react-three/fiber** | 3D canvas abstraction | ^9.5.0 |
| **@react-three/drei** | R3F utilities (OrbitControls, Text, Html, etc.) | ^10.7.7 |
| **three** | 3D graphics engine | ^0.183.2 |
| **framer-motion** | Animations (respect prefers-reduced-motion) | ^12.35.2 |
| **recharts** | Analytics charts | ^3.8.0 |
| **@tiptap/react** | Rich text editor (notes) | ^3.20.1 |
| **@shadergradient/react** | Shader backgrounds | ^2.4.20 |
| **@supabase/supabase-js** | Database client (via Server Actions only) | ^2.98.0 |
| **zustand** | State management | ^5.0.12 |
| **tailwindcss** | CSS framework (v4 with CSS variables) | ^4.2.1 |
| **@base-ui/react** | Unstyled UI headless components | ^1.2.0 |
| **lucide-react** | Icon library (portals) | ^0.577.0 |
| **@phosphor-icons/react** | Icon library (main app, via SCIcon) | ^1.4.14 |
| **next-themes** | Theme provider (light/dark) | ^0.4.6 |
| **@radix-ui/react-toast** | Toast notifications | ^1.2.15 |
| **@anthropic-ai/sdk** | Claude AI integration (AI Tutor) | ^0.78.0 |
| **marked** | Markdown parsing | ^17.0.4 |
| **katex** | LaTeX math rendering | ^0.16.37 |
| **dompurify** | HTML sanitization | ^3.3.3 |
| **papaparse** | CSV parsing | ^5.5.3 |
| **fuse.js** | Fuzzy search (CommandPalette) | latest |

### Styling Rules (Enforced)

- **Color palette:** Use design tokens from Tailwind config (e.g., `text-[#1B3FC4]` for Camp Cobalt). NEVER use generic Tailwind colors (`text-blue-500`).
- **Shadows:** `shadow-sm` (cards hover), `shadow-md` (dropdowns), `shadow-lg` (modals). FORBIDDEN: `shadow-xl`, `shadow-2xl` on non-modal elements.
- **Typography:** Use `text-[11px]` minimum. Monospace ONLY on code/numbers.
- **Transitions:** Max 300ms, default `duration-150 ease-out`.
- **Respect motion:** All decorative animations must respect `prefers-reduced-motion: reduce`.

<!-- MANUAL: -->


---


# FILE: .\src\components\3d-lab\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# 3d-lab

## Purpose

React Three Fiber (R3F) spatial learning components for interactive 3D module exploration. Coordinates camera, hotspots, info panels, quiz modes, and guided sequences. Target: 60 FPS performance. All components use `useLabStore` (Zustand) for state management (active hotspot, panel mode, explore mode, quiz results).

## Key Files

| File | Description |
|------|-------------|
| `LabOrchestrator.tsx` | Single entry point composing all 3D Lab components. Routes config → LabViewer, HotspotGroup, InfoPanel, QuizMode, ExitSummary. |
| `LabViewer.tsx` | Container for LabCanvas + camera controls + module-specific content. |
| `LabCanvas.tsx` | R3F Canvas setup: OrbitControls, lighting (ambient + directional), contact shadows, environment. Configurable camera position & orbit. |
| `HotspotGroup.tsx` | Renders Html-overlaid hotspot dots using @react-three/drei. Filters visible hotspots by guided vs. free explore mode. |
| `HotspotDot.tsx` | Individual hotspot visual: 3D position → 2D screen dot, labels, styling by hotspot type (exam-critical, guidance, etc.). |
| `InfoPanel.tsx` | Right-side info drawer: displays selected hotspot details (title, body, references). Integrates with panelMode store state. |
| `GuidedSequencer.tsx` | Manages sequence order in guided explore mode. Next/prev buttons, progress indicator, prevents skipping hotspots. |
| `FreeExploreToggle.tsx` | Button to switch between guided and free explore modes. Updates exploreMode store state. |
| `ParameterPanel.tsx` | Editable parameter controls (sliders, toggles) for dimensional configurations. Syncs to store. |
| `PresetViewButtons.tsx` | Camera preset shortcuts (plan/section/3d views). Updates camera position on click. |
| `ToolPalette.tsx` | Tool selection: cross-section, exploded view, measurement. Manages active tool state. |
| `ExplodedView.tsx` | Animates model parts outward for anatomical visualization. Respects prefers-reduced-motion. |
| `CrossSectionPlane.tsx` | Plane-cutting visualization. Responds to ParameterPanel inputs. |
| `DisorientationDetector.tsx` | Monitors camera spin/rotation speed. Shows "You are disoriented" warning if exceeds threshold. |
| `LabTopBar.tsx` | Header bar: back button, module title, help icon, toolbar. |
| `ModuleContextCard.tsx` | Shows learning objective, code reference, estimated time. Appears pre-onboarding. |
| `OnboardingFlow.tsx` | First-time user walkthrough. Shows purpose, hotspot tutorial, controls explainer. |
| `LabLoadingState.tsx` | Skeleton/placeholder while model GLB loads. Shows estimated KB + timing. |
| `LabEmptyState.tsx` | Shown when no module config provided or invalid slug. |
| `LabErrorState.tsx` | GLB model failed to load, Supabase fetch failed, etc. Displays error message + retry. |
| `ComplianceStatus.tsx` | Sidebar showing pass/fail status for exam-critical hotspots. |
| `ExitSummary.tsx` | Quiz results screen: score, breakdown by hotspot category, "review" vs "master" tags. |
| `QuizMode.tsx` | Switches to quiz state: hotspots become multiple-choice questions, tracks correctness. |
| `QuestionPanel.tsx` | Question renderer for quiz mode: MCQ display, option selection, rationale reveal. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `modules/` | Feature-complete 3D learning modules. Each has a `{module}.config.ts` (ModuleConfig), `{Module}Model.tsx` (geometry), `{Module}Hotspots.tsx` (hotspot definitions), optional `{Module}Controls.tsx`. |
| `modules/AccessibleToilet/` | BP 344 §6.3 accessible toilet room: door clear width, turning circle, grab bar placement. Includes model, hotspots, toilet.config.ts. |
| `modules/StairwayConfigurator/` | Building code stairway design: rise, run, handrail height, guard requirements. Parametric model + StairwayControls.tsx. |
| `modules/registry.ts` | Module loader registry. Maps slug → lazy-loaded ModuleConfig. Add entries here as modules are migrated. |

## For AI Agents

### Working In This Directory

1. **Read ModuleConfig type first.** Check `@/types/3d-lab` for the shape of module configurations (hotspots, camera, presetViews, etc.).

2. **Understand useLabStore.** All state mutations (openHotspot, closePanel, selectOption, etc.) flow through `@/stores/useLabStore`. Read the store hooks used in LabOrchestrator to understand the state contract.

3. **R3F patterns:**
   - Use `Html` from @react-three/drei to overlay 2D (hotspot dots, labels) on 3D scene.
   - Camera positioning: store target and position separately; use `useThree()` if direct Three.js access needed.
   - Keep materials/geometries in separate files for reusability (e.g., `toilet.model.tsx`).
   - All Canvas children are suspended; wrap with Suspense boundary.

4. **Performance targets:**
   - Aim for 60 FPS. Monitor draw calls, geometry complexity.
   - Lazy-load GLB models (use Suspense + LabLoadingState).
   - Debounce camera/parameter changes to avoid excessive re-renders.

5. **Hotspot design:**
   - Each hotspot has `id`, `position` (3D coords), `type` (exam-critical, guidance, etc.), `sequenceOrder`.
   - In guided mode, only show hotspots up to currentSequenceIndex + 1.
   - In free explore, show all (up to MAX_PER_CATEGORY per category).

6. **No custom styling in R3F components.** Use Campfire tokens via Tailwind classes on Html overlays. Keep Three.js materials simple and purposeful.

### Common Patterns

**Loading a module config:**
```tsx
const { config } = LabOrchestrator.props
// config contains: slug, title, modelUrl, hotspots[], presetViews, cameraDefaults
```

**Opening a hotspot from user click:**
```tsx
const openHotspot = useLabStore((s) => s.openHotspot)
const handleHotspotClick = (id: string) => {
  openHotspot(id)
  // Store updates activeHotspotId → InfoPanel re-renders
}
```

**Respecting prefers-reduced-motion in ExplodedView:**
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const duration = prefersReducedMotion ? 0 : 300
```

**Camera preset view:**
```tsx
const cameraTarget = config.presetViews.plan // [0, 6, 0.001]
// Set camera position to preset; OrbitControls.target to center
```

**Quiz mode state machine:**
```tsx
const quizModeActive = useLabStore((s) => s.quizModeActive)
const selectedOptionId = useLabStore((s) => s.selectedOptionId)
if (quizModeActive) {
  // Show QuestionPanel instead of InfoPanel
  // Track selectOption calls → store checks correctness
}
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/stores/useLabStore` | Zustand store: activeHotspotId, panelMode, exploreMode, quizResults, action creators |
| `@/types/3d-lab` | ModuleConfig, HotspotData, LabQuestion, QuizResult types |
| `@/components/ui/*` | Button, Card, Dialog (used in InfoPanel, ExitSummary) |
| `@/components/shared` | NavigationProgress, info tooltips (InfoTooltip) |
| `@/lib/lab-analytics` | labEvents() for telemetry tracking |
| `@/hooks/useLabTelemetry` | Telemetry hook for quiz, exploration actions |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **@react-three/fiber** | R3F Canvas abstraction | ^9.5.0 |
| **@react-three/drei** | Html, OrbitControls, ContactShadows, Environment | ^10.7.7 |
| **three** | 3D graphics engine, Material/Geometry base | ^0.183.2 |
| **zustand** | useLabStore state management | ^5.0.12 |
| **react** | Hooks (useState, useCallback, useMemo) | ^19.2.4 |
| **next** | useRouter, usePathname for navigation | 16.1.6 |

<!-- MANUAL: -->


---


# FILE: .\src\components\admin\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# admin

## Purpose

Admin panel UI components for content management: MDX article editing, question editing, taxonomy navigation, wiki article curation, asset uploads, audit logging, SME review queues, and unified content editing. Uses the PortalLayout shell from `@/components/portal`. All client-side forms with Supabase integrations via server actions.

## Key Files

| File | Description |
|------|-------------|
| `AdminMDXEditor.tsx` | Rich MDX editor for wiki articles with live preview, formatting toolbar, and component insertion. `'use client'` |
| `AdminMDXEditorLoader.tsx` | Lazy loader/suspense boundary for AdminMDXEditor (heavy dependency). |
| `ApproveDialog.tsx` | Confirmation dialog for approving content (questions, articles) in review queue. `'use client'` |
| `ArticlePreviewTab.tsx` | Preview tab showing rendered article output alongside editor. `'use client'` |
| `ArticlePropertiesPanel.tsx` | Side panel for article metadata: title, slug, discipline, status, tags, SEO fields. `'use client'` |
| `AssetDetailView.tsx` | Detailed view of a single asset: preview, metadata, usage references, delete action. `'use client'` |
| `AssetList.tsx` | Gallery of uploaded assets: thumbnail preview, file size, upload date, delete action. Filter by type. `'use client'` |
| `AssetUploader.tsx` | File upload component for GLB/FBX 3D models and images. Progress tracking, storage bucket selection, file size validation. `'use client'` |
| `AuditLogViewer.tsx` | Read-only table of user actions: who changed what, when, old to new values. Filter by user/table/date range. `'use client'` |
| `BulkActionBar.tsx` | Floating action bar for bulk operations on selected items (approve, reject, delete). `'use client'` |
| `ComponentToolbar.tsx` | Toolbar for inserting MDX components (callouts, formulas, widgets) into the editor. `'use client'` |
| `NeedsAttentionCard.tsx` | Dashboard card highlighting items needing review or action. |
| `QuestionEditor.tsx` | Multi-field form: question text, topic dropdown, options (5 default), correct answer selector, difficulty slider, rationale textarea. `'use client'` |
| `QuestionImporter.tsx` | CSV/JSON upload dialog. Validates headers, batch inserts questions. Shows progress bar and error summary. `'use client'` |
| `QuestionPreviewPanel.tsx` | Live preview of question as it would appear in quiz context. `'use client'` |
| `QuestionQualityBadges.tsx` | Quality indicator badges for questions (reviewed, needs-work, approved). |
| `QuestionQuickPreview.tsx` | Compact inline question preview for list views. |
| `RequestChangesDialog.tsx` | Dialog for requesting changes on reviewed content with comment field. `'use client'` |
| `SMEReviewQueue.tsx` | Workflow for SME approvals: pending questions/articles grouped by status. Approve/reject with comment. `'use client'` |
| `TaxonomyEditor.tsx` | Hierarchical tree view: expand/collapse nodes, rename, add child, delete. `'use client'` |

## Subdirectories

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `preview/` | Mode-specific article preview renderers | 2 files |
| `settings/` | Admin settings components | 1 file |
| `unified-editor/` | Unified content editor system (article + questions + EI prompts in one view) | 12 files |

### preview/

| File | Description |
|------|-------------|
| `CampModePreview.tsx` | Article preview rendered in Camp mode styling. `'use client'` |
| `StormModePreview.tsx` | Article preview rendered in Storm mode styling. `'use client'` |

### settings/

| File | Description |
|------|-------------|
| `RoleSelect.tsx` | Role selection dropdown for admin user management. `'use client'` |

### unified-editor/

| File | Description |
|------|-------------|
| `UnifiedContentEditor.tsx` | Main unified editor shell: manages panels (article, questions, EI prompts, outline) in a resizable layout. `'use client'` |
| `ContentEditorIndex.tsx` | Entry point/index for the unified editor. Orchestrates data loading and panel state. `'use client'` |
| `ArticlePanel.tsx` | Article editing panel within unified editor. `'use client'` |
| `QuestionsPanel.tsx` | Questions editing panel within unified editor. `'use client'` |
| `EIPromptsPanel.tsx` | Elaborative Interrogation prompts panel within unified editor. `'use client'` |
| `OutlinePanel.tsx` | Article outline/TOC panel within unified editor. `'use client'` |
| `ContentBar.tsx` | Top content bar with article selector and navigation within unified editor. `'use client'` |
| `SaveAllBar.tsx` | Save status bar: tracks dirty state across all panels, save-all action. `'use client'` |
| `DirtyStateProvider.tsx` | Context provider tracking unsaved changes across unified editor panels. `'use client'` |
| `PanelErrorBoundary.tsx` | Error boundary wrapper for individual panels to prevent full editor crash. `'use client'` |
| `types.ts` | TypeScript interfaces for unified editor (panel config, dirty state, etc.). |
| `index.ts` | Barrel exports for unified editor components. |

## For AI Agents

### Working In This Directory

1. **Portal layout.** The admin panel uses `PortalLayout` from `@/components/portal` as its shell. Admin-specific nav items and accent colors are configured in `src/app/admin/layout.tsx`.

2. **Server actions.** Database operations use server actions from `@/lib/actions/admin/` (assets, coverage, dashboard, wiki-queries, bulk). Do NOT use Supabase client directly in components.

3. **Unified editor architecture.** The unified-editor/ subdirectory is a self-contained editing system. `DirtyStateProvider` wraps all panels and tracks unsaved changes. `SaveAllBar` aggregates dirty state. `PanelErrorBoundary` isolates panel errors. Edit these components as a unit.

4. **Error handling.** Wrap server action calls in try/catch. Show user-facing error messages via toast or in-form feedback. Log errors to console for debugging.

5. **Form state.** Use React `useState` for form fields. Debounce onChange if making real-time API calls. Disable submit while saving.

6. **Type safety.** Define interfaces for Supabase table shapes (Question, TaxonomyNode, WikiArticle). Use TypeScript strict mode.

7. **No custom styling.** Use Campfire tokens and shadcn/ui components (Button, Input, Textarea, Dialog, Card).

8. **Accessibility.** Label all form inputs. Use semantic HTML (form, fieldset, legend). Test with keyboard navigation.

### Common Patterns

**Server action fetch + state:**
```tsx
const [items, setItems] = useState<Question[]>([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  const fetch = async () => {
    setLoading(true)
    try {
      const data = await getQuestions()
      setItems(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  fetch()
}, [])
```

**Form submission with validation:**
```tsx
const handleSave = async () => {
  if (!text.trim() || !topicId) {
    alert('Please fill required fields')
    return
  }
  setIsSaving(true)
  try {
    await upsertQuestion({ id, text, topic_id: topicId, ... })
    // Success feedback
  } finally {
    setIsSaving(false)
  }
}
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/actions/admin/*` | Server actions: assets, coverage, dashboard, wiki-queries, bulk |
| `@/components/portal` | PortalLayout shell (consumed by admin layout.tsx) |
| `@/components/ui/*` | Button, Input, Textarea, Dialog, Card, Badge, Checkbox, Resizable |
| `@/lib/utils` | cn() for conditional classes |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | Hooks: useState, useEffect, useCallback, useContext | ^19.2.4 |
| **next** | useRouter, usePathname for navigation | 16.1.6 |
| **@phosphor-icons/react** | Icons: Plus, Trash, PencilSimple, etc. | ^1.4.14 |
| **lucide-react** | Icons in some admin components | ^0.577.0 |

<!-- MANUAL: -->


---


# FILE: .\src\components\analytics\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# analytics

## Purpose

Analytics dashboard visualizations powered by Recharts. Displays mastery trajectories, memory health, pacing insights, study stamina curves, taxonomy coverage (heatmaps), and readiness scoring. All components are data-driven; parent pages fetch server-side and pass props.

## Key Files

| File | Description |
|------|-------------|
| `ReadinessSection.tsx` | Server component: fetches readiness trajectory + score, renders ReadinessTrajectory chart. |
| `ReadinessTrajectory.tsx` | Recharts ComposedChart: area (passing threshold) + line (user trajectory). Shows current %ile, delta, trend icon. `'use client'` |
| `SummarySection.tsx` | Cards: total practice time, questions answered, topics covered, current readiness %. |
| `AnalyticsSummaryBar.tsx` | Horizontal summary bar: stats widgets with icons and values. Compact version of SummarySection. |
| `RadarSection.tsx` | Recharts Radar chart: discipline-level mastery on 6-point scale (0-100). `'use client'` |
| `TimelineHeatmap.tsx` | Calendar-grid heatmap: day to activity intensity (color gradient). Shows 12-month window. `'use client'` |
| `TimelineHeatmapSection.tsx` | Container for TimelineHeatmap with title, legend, metadata. |
| `StaminaCurve.tsx` | Line chart: study session duration over time. Shows fatigue patterns. `'use client'` |
| `StaminaSection.tsx` | Container: StaminaCurve + text interpretation. |
| `MemoryHealthMap.tsx` | Grid of topic cards: status badge (strong, review, fading, critical) with color-coded backgrounds. `'use client'` |
| `MemorySection.tsx` | Container for MemoryHealthMap + description. |
| `PacingQuadrant.tsx` | 2x2 quadrant: speed (x-axis) vs. accuracy (y-axis). Topics plotted as dots. `'use client'` |
| `PacingQuadrantSection.tsx` | Container: PacingQuadrant + legend explaining zones. |
| `PacingInsights.tsx` | Text analysis: "You are rushing" or "You are overthinking" based on quadrant placement. |
| `PacingInsightsSection.tsx` | Container: PacingInsights text + optional recommendations. |
| `ChartSkeleton.tsx` | Loading skeleton for chart placeholders. |
| `ChartCoachingAnnotation.tsx` | Overlay label on charts: contextual coaching messages based on data. |

## Subdirectories

None. All analytics components are flat in `src/components/analytics/`.

## For AI Agents

### Working In This Directory

1. **Server vs. Client split.** `*Section.tsx` files are server components (fetch + compose). `*Trajectory.tsx`, `*Heatmap.tsx`, `*Curve.tsx`, `*Quadrant.tsx` are client components (`'use client'`) that render charts and handle interactions.

2. **Recharts integration.**
   - Use `ResponsiveContainer` to make charts responsive (width: 100%).
   - Keep chart config (colors, margins, etc.) in a const near the component.
   - Tooltip and ReferenceLine are optional but useful for context.
   - X/YAxis: hide labels if space-constrained; use gridStroke color from Campfire palette.

3. **Data types.** Check `@/lib/actions/analytics` for the exact shape of `ReadinessTrajectoryPoint`, `MemoryHealthItem`, etc. Type components accordingly.

4. **Color consistency.** All status colors (strong, review, fading, critical) use Campfire tokens:
   - strong: Emerald (#2D9F6F) + Emerald 50 (#EDFAF4)
   - review / fading: Amber (#D4951A) + Amber 50 (#FEF8ED)
   - critical: Warm Red (#D64545) + Warm Red 50 (#FDF0F0)

5. **No hardcoded numbers.** All thresholds (e.g., readiness < 40 = red) should match business logic in `@/lib/actions/analytics`.

### Common Patterns

**Server-side fetch + render:**
```tsx
export async function ReadinessSection() {
  const [trajectory, readiness] = await Promise.all([
    getReadinessTrajectory(),
    getReadinessScore(),
  ])
  return <ReadinessTrajectory data={trajectory} currentScore={readiness.score} ... />
}
```

**Recharts chart with responsive container:**
```tsx
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis } from 'recharts'

export const MyChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#D4DAE3" />
      <XAxis dataKey="date" stroke="#8896A7" />
      <YAxis stroke="#8896A7" />
      <Area type="monotone" dataKey="value" fill="#EDFAF4" stroke="#2D9F6F" />
    </ComposedChart>
  </ResponsiveContainer>
)
```

**Status color mapping:**
```tsx
const STATUS_STYLES: Record<MemoryHealthItem['status'], string> = {
  strong: 'bg-[#EDFAF4] text-[#2D9F6F] border-[#2D9F6F]/20',
  review: 'bg-[#FEF8ED] text-[#D4951A] border-[#D4951A]/20',
  fading: 'bg-[#FEF8ED] text-[#D4951A] border-[#D4951A]/20',
  critical: 'bg-[#FDF0F0] text-[#D64545] border-[#D64545]/20',
}
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/actions/analytics` | Server functions: getReadinessTrajectory(), getMemoryHealth(), getPacingData(), etc. |
| `@/components/ui/card` | Card, CardHeader, CardTitle, CardContent |
| `@/components/dashboard/RichInfoPopover` | Info icon + popover for chart explanations |
| `@/lib/utils` | cn() for conditional styling |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **recharts** | Charts: ComposedChart, LineChart, RadarChart, etc. | ^3.8.0 |
| **react** | Hooks: useMemo, useCallback | ^19.2.4 |

<!-- MANUAL: -->


---


# FILE: .\src\components\assessment\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# assessment

## Purpose

Assessment/pre-assessment components for the diagnostic quiz that generates the initial Readiness Score. Guides users through questions without feedback, calculates score, and transitions to score reveal screen with a ceremonial "calculating" pause.

## Key Files

| File | Description |
|------|-------------|
| `AssessmentQuiz.tsx` | Main assessment quiz component with question navigation, option selection, answer tracking, completion flow |
| `AnimatedScore.tsx` | Animated number counter for Readiness Score display |
| `PreAssessmentTeaser.tsx` | Teaser/preview shown before starting assessment |
| `ScoreReveal.tsx` | Full-page score reveal with breakdown by topic and mastery indicators |

## For AI Agents

### Working In This Directory

- **Session Management**: Creates quiz session on mount; tracks sessionId throughout flow
- **Answer Tracking**: Uses Map<questionId, optionId> to store answers; enables prev/next navigation
- **Time Tracking**: Records per-question time via `Date.now()` at question start
- **IRT Integration**: Calls `completeAssessment()` server action which runs IRT 2-parameter model
- **Ceremonial UX**: 2.5-second "Calculating your Readiness Score..." pause intentionally adds weight
- **Progress**: Visual progress bar showing (currentIndex + 1) / totalQuestions
- **Navigation**: Previous/Next buttons; Previous disabled on first question, Next disabled until option selected
- **Loading States**: Shows spinner on init; error state with retry CTA; calculating state on completion
- **Accessibility**: `role="radiogroup"`, individual `role="radio"` on options, `aria-checked`

### Dependencies
### Internal

- `@/lib/actions/quiz` - Server actions: `getSessionQuestions()`, `createQuizSession()`, `saveInteraction()`, `updateQuizSession()`
- `@/lib/actions/assessment` - `completeAssessment()` (runs IRT scoring)
- `@/lib/utils/question` - `getCorrectOptionId()` helper
- `@/types/app` - Types: `Question`, `Choice`, `QuizSession`
- `@/lib/utils` - `cn()` utility
- Next.js (`next/navigation`) - Router for post-completion redirect
- React hooks - `useState`, `useEffect`, `useCallback`, `useTransition`, `useRef`

<!-- MANUAL: Verify IRT calculation accuracy with sample data before launch. Test the 2.5s pause timing for ceremonial weight — adjust if UX research suggests different value. Ensure all answers persist if user navigates away mid-assessment. -->


---


# FILE: .\src\components\auth\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# auth

## Purpose

Authentication UI components for Supabase Auth integration. Handles user sign-in with Google OAuth, sign-out, and authentication state management.

## Key Files

| File | Description |
|------|-------------|
| `SignInWithGoogleButton.tsx` | Google OAuth sign-in button with loading state and customizable label |
| `SignOutButton.tsx` | Sign-out button that clears session and redirects to home |
| `GoogleIcon.tsx` | Google logo SVG icon component |

## For AI Agents

### Working In This Directory

- **OAuth Provider**: Google via Supabase Auth (OAuth 2.0)
- **Session Management**: Supabase client-side auth via `createClient()` from `@/lib/supabase/client`
- **Sign-in Flow**: `onClick` handler calls auth service (parent page manages routing post-login)
- **Sign-out Flow**: Clears session cookie and redirects to home (`/`)
- **Loading States**: Supports `isLoading` prop with custom label for UX feedback
- **Accessibility**: Uses `aria-busy` for loading state, proper button semantics
- **Styling**: Campfire design (Camp Cobalt primary, 44px min-height buttons)

### Dependencies
### Internal

- `@/lib/supabase/client` - Supabase client instantiation
- `@/components/graphics/icons/Icon.tsx` - Icon wrapper (SCIcon)
- `@/lib/utils` - `cn()` utility
- `@phosphor-icons/react` - Icons (SignOut)
- Supabase (`@supabase/supabase-js`) - Auth API

<!-- MANUAL: Verify Google OAuth credentials are configured in Supabase project settings. Test sign-in/sign-out flow in staging before production release. -->


---


# FILE: .\src\components\ceo\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 -->

# ceo

## Purpose

CEO dashboard components for SlateCamp business operations. Displays financial metrics (revenue, expenses, runway), team management, cohort retention, churn risk, and time-to-value analytics. All components are client-side with Recharts for charting and Supabase-backed data via server actions. Uses the PortalLayout shell from `@/components/portal`.

## Key Files

| File | Description |
|------|-------------|
| `RevenueChart.tsx` | Recharts stacked AreaChart: revenue breakdown by stream (subscriptions, consulting, content). Break-even reference line. Custom tooltip with totals. `'use client'` |
| `RevenueExpenseChart.tsx` | Recharts combined revenue vs. expense comparison chart. Shows profitability trend over time. `'use client'` |
| `ExpenseBreakdownChart.tsx` | Recharts chart showing expense categories (engineering, content, marketing, ops). `'use client'` |
| `RunwayGauge.tsx` | Visual runway indicator with status tiers: Profitable (green, 999+ months), Secure (green, 12+ months), Monitor (amber, 6-12 months), Critical (red, <6 months). Shows cash on hand. `'use client'` |
| `DepartmentCostChart.tsx` | Recharts chart of costs per department over time. `'use client'` |
| `ChurnRiskBars.tsx` | Horizontal bar chart of churn risk by user segment. Color-coded by risk level. `'use client'` |
| `CohortRetentionTable.tsx` | Cohort retention grid: rows = monthly cohorts, columns = months since signup. Color-coded cells (green high retention, red low). `'use client'` |
| `TimeToValueFunnel.tsx` | Funnel visualization: signup -> first session -> 10 sessions -> subscription. Shows conversion rates. `'use client'` |
| `TeamTable.tsx` | Team member management table with department filter tabs, alumni toggle, role assignment modal. Uses DataTable from shared. `'use client'` |
| `RoleAssignmentModal.tsx` | Modal for assigning/changing team member roles. Dialog with role selector. `'use client'` |
| `FinancialLedger.tsx` | Table of financial transactions: date, description, category, amount. Sortable, filterable. `'use client'` |
| `FinancialEntryForm.tsx` | Form for adding financial entries: date, description, category dropdown, amount, type (revenue/expense). `'use client'` |
| `ExportButton.tsx` | CSV/JSON export button for financial data. `'use client'` |

## Subdirectories

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `skeletons/` | Loading skeleton components for CEO dashboard cards and charts | 3 files |

### skeletons/

| File | Description |
|------|-------------|
| `ChartSkeleton.tsx` | Animated skeleton placeholder for chart areas. |
| `MetricCardSkeleton.tsx` | Animated skeleton for metric summary cards (eyebrow + value + trend). |
| `TableSkeleton.tsx` | Animated skeleton for data tables. |

## For AI Agents

### Working In This Directory

1. **CEO types from `@/types/ceo`.** All financial types (RevenueBreakdown, TeamMember, TeamDepartment, etc.), color constants (CEO_CHART_COLORS, DEPARTMENT_COLORS), and formatting utilities (formatPeso) are defined in `@/types/ceo`. Do NOT duplicate.

2. **Server actions from `@/lib/actions/ceo/`.** Financial data fetching and mutations use server actions in `@/lib/actions/ceo/`. Components receive data as props from server-rendered parent pages.

3. **Recharts integration.** All charts use ResponsiveContainer for responsive sizing. Use CEO_CHART_COLORS for consistent color palette across charts. Custom tooltips follow the same pattern (check active, render payload).

4. **Runway status tiers.** RunwayGauge uses semantic CSS variables (`bg-success`, `bg-warning`, `bg-destructive`) rather than hardcoded hex values. The tier logic is: Profitable (999+), Secure (12+), Monitor (6-12), Critical (<6 months).

5. **DataTable reuse.** TeamTable and FinancialLedger use `DataTable` from `@/components/shared/data-table` for consistent table behavior (sorting, filtering, pagination).

6. **Portal layout.** The CEO dashboard uses `PortalLayout` from `@/components/portal` as its shell. CEO-specific nav items and accent colors are configured in the CEO layout.tsx.

7. **Currency formatting.** Use `formatPeso()` from `@/types/ceo` for all monetary values. Do NOT format currency manually.

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/types/ceo` | RevenueBreakdown, TeamMember, CEO_CHART_COLORS, DEPARTMENT_COLORS, formatPeso |
| `@/lib/actions/ceo/*` | Server actions for financial and team data |
| `@/components/shared/data-table` | DataTable, Column type for TeamTable and FinancialLedger |
| `@/components/ui/*` | Button, Dialog, Badge, Input, Select |
| `@/components/portal` | PortalLayout shell (consumed by CEO layout.tsx) |
| `@/lib/utils` | cn() for class merging |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **recharts** | AreaChart, BarChart, ResponsiveContainer, Tooltip, Legend | ^3.8.0 |
| **react** | Hooks: useState, useMemo | ^19.2.4 |
| **lucide-react** | Icons: Pencil, ShieldCheck | ^0.577.0 |

<!-- MANUAL: -->


---


# FILE: .\src\components\dashboard\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# dashboard

## Purpose

Core dashboard component library for the SlateCamp learning engine. Renders the user's personalized study hub with progression visualizations (Readiness Score, Taxonomy Heatmap, Pacing Gauge), session discovery and builders, mode cards, activity feeds, quiz renderer, and result summaries. The dashboard is the primary entry point after user onboarding.

## Key Files

| File | Description |
|------|-------------|
| `TaxonomyHeatmap.tsx` | Master syllabus visualization by subject and topic. Displays node states (mastered/familiar/danger/unexplored/thin_coverage) as colored progress bars. Optional delta view toggle (Pro feature). `'use client'` |
| `HeatmapSection.tsx` | Dashboard widget: embeds TaxonomyHeatmap with optional detail sheet for node selection. `'use client'` |
| `CustomSessionBuilder.tsx` | Dialog for building custom quiz sessions. Subject multi-select, question count, instant feedback toggle. `'use client'` |
| `QuizRenderer.tsx` | Main quiz interface orchestrator. Composes header, question stem, options, footer nav, and overlays. `'use client'` |
| `QuizRenderer.test.tsx` | Test file for QuizRenderer. |
| `QuizOptions.tsx` | Quiz session customization panel. `'use client'` |
| `QuizActionButtons.tsx` | Utility button group for quiz actions (Flag, AI Tutor, Rationale, Exit). `'use client'` |
| `QuizDrawers.tsx` | Container for all quiz overlay drawers. `'use client'` |
| `QuizFooterNav.tsx` | Footer navigation container for quiz. `'use client'` |
| `ModeCard.tsx` | Visual card for a test mode (Camp/Storm/Chill/etc.) with rules and CTA. `'use client'` |
| `ModeIntroScreen.tsx` | Intro modal for new session mode explaining rules. `'use client'` |
| `TestingHub.tsx` | Landing page for quiz subsystem. Session discovery, recent activity, mode selector. `'use client'` |
| `SubjectDrillSelector.tsx` | Drill-down UI: discipline to subject to topic to question count + mode. `'use client'` |
| `SubjectMasteryCard.tsx` | Per-subject readiness score in card form. `'use client'` |
| `SubjectRadarChart.tsx` | Radar chart of mastery across dimensions. `'use client'` |
| `SubjectFloorAlert.tsx` | Alert banner if user falls below minimum mastery. `'use client'` |
| `ActivityHeatmap.tsx` | Calendar view of study activity (GitHub-style grid). `'use client'` |
| `ImprovedActivityFeed.tsx` | Optimized activity feed view. `'use client'` |
| `HeroCommandBar.tsx` | Hero section command bar for dashboard. `'use client'` |
| `FeatureDiscoveryRow.tsx` | Promotional row for new features. Dismissible. `'use client'` |
| `SrsReviewWidget.tsx` | Spaced repetition review widget. `'use client'` |
| `StreakRibbon.tsx` | Visual ribbon for consecutive study days (only shown if streak > 0). `'use client'` |
| `OnboardingStateCard.tsx` | Conditional card during onboarding. `'use client'` |
| `LockedScoreWidget.tsx` | Readiness Score in locked/trial state for free users. `'use client'` |
| `GradientImage.tsx` | Utility component for readiness gradient background. `'use client'` |
| `RichInfoPopover.tsx` | Info tooltip with rich text and learn-more link. `'use client'` |
| `ResultsSummary.tsx` | Post-session results page. `'use client'` |

## Subdirectories

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `heatmap/` | Heatmap sub-components (grid, header, legend) | 3 files |
| `results/` | Post-session result display components | 5 files |

### heatmap/

| File | Description |
|------|-------------|
| `HeatmapGrid.tsx` | Grid layout for heatmap cells. `'use client'` |
| `HeatmapHeader.tsx` | Header bar for heatmap section. |
| `HeatmapLegend.tsx` | Legend showing mastery level color mapping. |

### results/

| File | Description |
|------|-------------|
| `ScoreHero.tsx` | Large score display for results page. `'use client'` |
| `StatCards.tsx` | Row of stat cards for results summary. `'use client'` |
| `QuestionReviewList.tsx` | List of questions with correct/incorrect indicators for review. `'use client'` |
| `TopicBreakdown.tsx` | Mastery breakdown by topic for results. `'use client'` |
| `ResultsActions.tsx` | Action buttons on results page (Review Mistakes, New Session, Return). `'use client'` |

## For AI Agents

### Working In This Directory

The dashboard is the **hub** of SlateCamp. It must never compromise on state persistence (auto-save every 10 seconds), growth-framed language, and accurate data binding to the Readiness Score, Taxonomy Heatmap, and Pacing Gauge.

**Critical constraint:** Zero generic gamification (no confetti, badges, virtual currency, empty streaks). Progression is mapped **only** to:
1. Readiness Score (IRT 2-parameter logistic model with EMA weighting)
2. Taxonomy Heatmap (node states derived from mastery thresholds)
3. Pacing Gauge (seconds per item + endurance window)

**Test modes** supported: `camp`, `chill`, `storm`, `proof_sim`, `blindspot`, `endurance`, `custom`.
- Each mode has distinct styling (`MODE_STYLES` map in QuizHeader).
- Each mode enforces pedagogical rules (instant vs. delayed feedback, timed vs. untimed, etc.).

**Language:** Growth-framed ("42 topics covered" not "58 remaining"). Avoid "weakness," "gap," "behind," "grind," "dominate." Use "developing skill," "area to revisit," "master," "practice session."

**Campfire colors:**
- Readiness thresholds: red (#D64545) <40%, amber (#E8853A) <70%, green (#2D9F6F) >=70%
- Heatmap nodes: mastered (green), familiar (amber), danger (red with pulse), unexplored (gray), thin_coverage (gray + ring)
- Timer: primary (blue) normally, amber when <=20% remaining

### Common Patterns

1. **Card-based UI:** Most dashboard widgets use `<Card>` wrapper with `CardHeader` + `CardContent`. Shadow = none at rest, sm on hover.
2. **Props-driven rendering:** Components accept data (scores, clusters, nodes) and optional callbacks (onNodeSelect, onStart). Minimal internal state unless interactive.
3. **Color-coded feedback:** Use color to communicate state (ready/develop/danger). Always pair color with text or icon for a11y.
4. **Trend indication:** Small badges or arrows show direction (improving/softening/stable). Recent data weighted more heavily.
5. **Modal & sheet patterns:** Drawers via Framer Motion + AnimatePresence. Modals via Dialog component. No inline collapsible sections in quiz context.
6. **IRT integration:** Readiness Score uses theta (IRT latent ability), discrimination, difficulty, and lucky-guess correction. Do not hardcode thresholds; derive from IRT model output.
7. **Delta views:** Heatmap supports optional delta (Pro feature) -- calculate delta as current state minus prior state (session/week/month).

## Dependencies

### Internal

- `@/components/ui/*` -- shadcn/ui primitives (Card, Dialog, Button, Switch, RadioGroup, Label, Tooltip, Sheet)
- `@/components/graphics/icons/Icon` -- Custom icon wrapper (SCIcon) for Phosphor icons
- `@/components/shared/*` -- RichInfoPopover, SectionHeader, StatCard
- `@/lib/utils` -- cn() utility, formatting helpers
- `@/types/app` -- TypeScript type definitions (TestMode, UserTier, TaxonomyNode, Choice, Question, HeatmapNode, etc.)
- `@/lib/hooks/useQuiz` -- Quiz session state
- `@/lib/hooks/useReadiness` -- Readiness Score data
- `@/lib/hooks/useMastery` -- Heatmap data fetching
- `@/lib/hooks/useSession` -- Session builder state and navigation

### External

- `react` (19.x) -- Hooks, context, suspense
- `recharts` -- Area charts, radar charts
- `framer-motion` -- Animation/transitions for drawers, sheets, modals
- `@phosphor-icons/react` -- Icon set
- `next/link`, `next/image` -- Next.js primitives
- `next/navigation` -- useRouter, usePathname for quiz flow

## Campfire Design System

### Colors & Styling

- **Text:** text-[#1A2332] (primary), text-[#4A5568] (secondary), text-[#8896A7] (tertiary/muted)
- **Borders:** border-border (#D4DAE3)
- **Backgrounds:** bg-white (cards), bg-[#F8F7F5] (page), bg-[#F5F7FA] (focused testing area), bg-[#EEF2FC] (hover/active tints)
- **Shadows:** shadow-none (at rest), shadow-sm (card hover), shadow-md (dropdown), shadow-lg (modal)
- **Radii:** rounded-sm (6px buttons/inputs), rounded-md (8px cards), rounded-lg (12px modals)
- **Transitions:** max 300ms, duration-150 ease-out default

### Typography

- Minimum text: 11px (text-[11px]). NEVER use 8px/9px/10px.
- Monospace ONLY on code, Readiness Score number, data values. NOT on labels.
- Use Inter via next/font/google.

<!-- MANUAL: -->


---


# FILE: .\src\components\dev\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 -->

# dev

## Purpose

Internal developer tools for SlateCamp development and debugging. Provides a floating dev toolbar, demo shell, feature flag management, impersonation panel, and system diagnostics. These components are intended for local development only and should NOT render in production builds.

## Key Files

| File | Description |
|------|-------------|
| `demo-shell.tsx` | Floating "Dev Mode" pill linking to dashboard + embedded DevToolbar. Only renders when NOT on dashboard routes. `'use client'` |
| `dev-toolbar.tsx` | Draggable floating toolbar: connection state indicator, tier switcher, feature flag toggles, quick links to dev routes. Uses `useDevStore` for state. Supports collapse/expand. `'use client'` |
| `dev-badge.tsx` | Small badge indicating dev/preview environment. Positioned fixed on screen. |
| `dev-keyboard-provider.tsx` | Global keyboard shortcut provider for dev tools (e.g., toggle toolbar visibility). `'use client'` |
| `dev-overlay.tsx` | Full-screen overlay for dev diagnostics and debugging panels. `'use client'` |
| `feature-flag-board.tsx` | Feature flag management panel: grouped by category (Access, Org, Dev), shows flag source (override/db/config), toggle overrides. Uses `useDevStore` and `useAllFeatureFlags`. `'use client'` |
| `impersonation-panel.tsx` | Panel for impersonating different user roles/tiers during development. `'use client'` |
| `system-info.tsx` | System information display: build version, environment, connection state, feature flags summary. |

## Subdirectories

None. All dev components are flat in `src/components/dev/`.

## For AI Agents

### Working In This Directory

1. **Dev-only rendering.** These components must NOT appear in production. Guard rendering with environment checks or conditional imports. DemoShell already filters by pathname.

2. **Dev store.** State management uses `useDevStore` from `@/stores/dev-store` (Zustand). This store holds tier simulation, feature flag overrides, and toolbar visibility state.

3. **Feature flags.** The FeatureFlagBoard reads from `@/config/feature-flags` (FEATURE_FLAGS, FeatureFlagKey, FeatureFlagCategory) and `@/lib/hooks/useFeatureFlag` for resolved values. Overrides are persisted in the dev store.

4. **Draggable positioning.** DevToolbar uses `useDraggableFloatingPosition` hook from `@/lib/hooks/` for drag-and-drop positioning. Default position is bottom-right (16px from edges).

5. **Phosphor icons.** Dev tools use Phosphor icons (`@phosphor-icons/react`) via the SCIcon wrapper from `@/components/graphics/icons/Icon`.

6. **Tier config.** DevToolbar maps UserTier values to labels and colors. The tier type comes from `@/types/app`.

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/stores/dev-store` | useDevStore: tier simulation, feature flag overrides, toolbar state |
| `@/config/feature-flags` | FEATURE_FLAGS, FeatureFlagKey, FeatureFlagCategory |
| `@/lib/hooks/useFeatureFlag` | useAllFeatureFlags for resolved flag values |
| `@/lib/hooks/useDraggableFloatingPosition` | Draggable floating panel positioning |
| `@/lib/dev/dev-mode` | DevConnectionState type |
| `@/lib/admin/feature-flags` | FeatureFlags type |
| `@/types/app` | UserTier type |
| `@/components/graphics/icons/Icon` | SCIcon wrapper |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | Hooks: useState, useCallback, useEffect | ^19.2.4 |
| **next/navigation** | usePathname, useRouter | 16.1.6 |
| **@phosphor-icons/react** | Icons: Wrench, Lightning, Cube, Brain, Terminal, etc. | ^1.4.14 |

<!-- MANUAL: -->


---


# FILE: .\src\components\developer\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 -->

# developer

## Purpose

UI components for the SlateCamp Developer Portal -- an internal documentation and design system reference hub. Provides component page layouts (preview + props table + code), system status monitoring, breadcrumb navigation, and KPI displays. Uses the PortalLayout shell from `@/components/portal`.

## Key Files

| File | Description |
|------|-------------|
| `ComponentPageLayout.tsx` | Main layout for individual component documentation pages. Three-tab interface: Preview, Props (table), Code (snippet). Shows title, description, domain badge, status badge, import path, file path. `'use client'` |
| `PreviewArea.tsx` | Sandboxed preview container for rendering component demos with consistent padding and background. |
| `DocSection.tsx` | Reusable documentation section with title and content area. Used for grouping related docs. |
| `Breadcrumbs.tsx` | Breadcrumb navigation trail for developer portal pages. |
| `StatusBanner.tsx` | Full-width system health banner. Computes worst-case status from array of service statuses (operational/degraded/outage). Color-coded: green/amber/red. Server component. |
| `StatusBadge.tsx` | Individual service status indicator badge with color and icon. |
| `StatusKPICard.tsx` | Key performance indicator card for system metrics (uptime, response time, error rate). |
| `UptimeBar.tsx` | Visual uptime history bar showing operational periods vs. incidents over time. |

## Subdirectories

None. All developer components are flat in `src/components/developer/`.

## For AI Agents

### Working In This Directory

1. **Developer types from `@/types/developer`.** Types like `PropsTableEntry`, `ServiceStatus` are defined in `@/types/developer`. Do NOT duplicate.

2. **Component registry.** ComponentPageLayout works with the component registry from `@/lib/developer/componentRegistry` for metadata (domain labels, component listings, status).

3. **Portal shell.** The developer portal uses `PortalLayout` from `@/components/portal` in its layout.tsx. These components render inside that shell.

4. **Portal imports.** ComponentPageLayout imports CopyButton and CodeBlock from `@/components/portal` and PropTable from `@/app/developer/_components/PropTable`. Check these paths before modifying.

5. **Status computation.** StatusBanner uses a `computeWorstStatus()` function to derive overall system health from individual service statuses. The priority order is: outage > degraded > operational.

6. **Lucide icons.** Developer portal components use Lucide icons (Check, AlertTriangle, X) rather than Phosphor.

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/types/developer` | PropsTableEntry, ServiceStatus types |
| `@/lib/developer/componentRegistry` | Component metadata and domain labels |
| `@/components/portal` | CopyButton, CodeBlock shared portal components |
| `@/app/developer/_components/PropTable` | Props table renderer |
| `@/app/developer/_components/CodeBlock` | Code snippet renderer |
| `@/components/ui/badge` | Badge for status and domain indicators |
| `@/lib/utils` | cn() for class merging |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | Hooks: useState | ^19.2.4 |
| **lucide-react** | Icons: Check, AlertTriangle, X | ^0.577.0 |

<!-- MANUAL: -->


---


# FILE: .\src\components\graphics\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 -->

# graphics

## Purpose

Campfire Graphic System v2 -- design tokens, icon system, CSS patterns, and SVG utility components for SlateCamp. Provides the canonical color palette for SVG/Canvas contexts, the SCIcon wrapper for Phosphor icons with standardized sizing, and CSS files for gradients and noise patterns.

## Key Files

| File | Description |
|------|-------------|
| `tokens.ts` | Campfire design tokens for graphic contexts. Exports `palette` (static hex values for SVG/Canvas), `cssVars` (CSS custom property references for JSX style props), and re-exports `getScoreColor` from shared score-display. |
| `gradients.css` | CSS gradient definitions for graphic compositions and backgrounds. |
| `patterns.css` | CSS noise and pattern definitions for textures and overlays. |
| `icons/Icon.tsx` | SCIcon component: standardized Phosphor icon wrapper. Maps size names (xs/sm/md/lg/xl/2xl) to pixel values (14/18/20/24/32/48). Supports weight, color, className, and ariaLabel. `'use client'` |
| `icons/iconMap.ts` | Registry mapping string icon names to Phosphor icon components. Used for dynamic icon resolution. |
| `icons/index.ts` | Barrel exports for icon system. |
| `ui/NoiseFilter.tsx` | SVG noise filter component for textured backgrounds. Reusable in any SVG context. |

## Subdirectories

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `icons/` | SCIcon wrapper and icon name-to-component mapping | 3 files |
| `ui/` | SVG utility components (NoiseFilter) | 1 file |

## For AI Agents

### Working In This Directory

1. **tokens.ts is the source of truth for graphic colors.** For app-wide theming, use `globals.css` CSS custom properties instead. `tokens.ts` is specifically for SVG, Canvas, and graphic composition contexts where CSS variables are not available.

2. **SCIcon usage.** Always use `SCIcon` (imported as `SCIcon` from `@/components/graphics/icons/Icon`) for Phosphor icons throughout the app. Do NOT render Phosphor icons directly. The size tiers are:
   - `xs`: 14px
   - `sm`: 18px
   - `md`: 20px (default)
   - `lg`: 24px
   - `xl`: 32px
   - `2xl`: 48px

3. **Icon map for dynamic resolution.** When an icon name is provided as a string (e.g., from a config file or database), use `iconMap.ts` to resolve it to the actual Phosphor component.

4. **Palette consistency.** The `palette` object in `tokens.ts` must stay synchronized with the Campfire design tokens defined in CLAUDE.md. If a color changes in the design system, update both `tokens.ts` and `globals.css`.

5. **Score color re-export.** `tokens.ts` re-exports `getScoreColorHex` from `@/components/shared/score-display` as `getScoreColor`. This ensures a single canonical source for readiness score color thresholds across both graphic and UI contexts.

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/components/shared/score-display` | getScoreColorHex re-exported as getScoreColor |
| `@/lib/utils` | cn() for className merging in SCIcon |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **@phosphor-icons/react** | Icon components, IconWeight type, Icon type | ^1.4.14 |

<!-- MANUAL: -->


---


# FILE: .\src\components\landing\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# landing

## Purpose

Landing page layout components that orchestrate marketing sections. Manages navigation, auth state, and composition of all major sections (hero, features, testimonials, CTA, footer).

## Key Files

| File | Description |
|------|-------------|
| `LandingPageContent.tsx` | Main landing page orchestrator; server component that checks auth state and composes all sections |
| `LandingPageFallback.tsx` | Fallback/loading skeleton while page is being generated |

## For AI Agents

### Working In This Directory

- **Server Component**: `LandingPageContent` is async server component; checks `hasAuthCookie()` for personalization
- **Auth-Aware CTA**: Button text and href change based on login status (Dashboard vs Register)
- **Composition**: Renders marketing nav, hero, features, testimonials, CTA, footer in sequence
- **CSS**: Uses `bg-page-bg` and `min-h-screen` for full-viewport layout
- **Imports**: Centralized imports from `@/components/marketing/` for all section components
- **Constants**: Uses `ROUTES` object for navigation links

### Dependencies
### Internal

- `@/lib/supabase/server` - `hasAuthCookie()` for server-side auth check
- `@/components/marketing/` - All section components (HeroSection, BentoFeatureGrid, etc.)
- `@/lib/constants` - ROUTES for navigation links

<!-- MANUAL: Update CTA logic if auth detection method changes. Test both authenticated and anonymous landing page views before deployment. -->


---


# FILE: .\src\components\layout\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# layout

## Purpose

Header action bar components. Omnibar (search), QuickCaptureDrawer (notes), NotificationBell, user menu.

## For AI Agents

1. **Reusable header:** Mount in any page needing search/notes/notifications
2. **Child state management:** Each component owns its open/closed state
3. **Consistent styling:** All buttons use iconButtonClass (36px, rounded-sm, muted)

## Dependencies

Internal: @/components/shared/Omnibar, @/components/notes/QuickCaptureDrawer, @/components/notifications/NotificationBell, @/lib/context/note-context, @/lib/utils

External: react, @phosphor-icons/react, tailwindcss

<!-- MANUAL: -->


---


# FILE: .\src\components\layouts\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# layouts

## Purpose

Page-level layout wrapper. DottedGridOverlay, consistent padding, flex structure.

## For AI Agents

1. **Page wrapper:** Wrap page children for consistent structure
2. **Server component:** No 'use client'. Safe with async components

## Dependencies

Internal: @/components/marketing/LandingPrimitives

External: react, tailwindcss

<!-- MANUAL: -->


---


# FILE: .\src\components\marketing\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# marketing

## Purpose

Marketing and landing page components for SlateCamp. Contains hero sections, pricing tiers, testimonials, feature grids, and promotional sections. All components follow the Campfire design system with warm, inviting aesthetics and growth-framed messaging.

## Key Files

| File | Description |
|------|-------------|
| `HeroHeadline.tsx` | Hero headline "Know you'll win." with rough-notation animations (circle, underline, highlight) |
| `HeroSection.tsx` | Main hero section with headline, CTA, mock question card, ALE coverage card, readiness snapshot |
| `PricingCard.tsx` | Pricing tier card component with features, limits, CTA button |
| `TestimonialShowcase.tsx` | 3-column testimonial cards with star ratings (5-star), quotes, names, titles |
| `FloatingTestimonialMarquee.tsx` | Marquee component with floating testimonials (currently unused in HeroSection) |
| `BentoFeatureGrid.tsx` | 3D bento grid showcasing core features (Questions, 3D Lab, Analytics, Wiki) |
| `FeatureSectionLayout.tsx` | Reusable layout for feature sections with left/right image + text combinations |
| `HowItWorksSection.tsx` | Step-by-step flow explaining how SlateCamp works |
| `ComparisonSection.tsx` | Feature comparison table (SlateCamp vs traditional study methods) |
| `QuestionsSection.tsx` | Section showcasing AI-powered question features |
| `ThreeDLabSection.tsx` | Section highlighting 3D Lab spatial computing features (React Three Fiber) |
| `AnalyticsSection.tsx` | Section on Readiness Score and mastery tracking |
| `WikiSection.tsx` | Section on AI Wiki with citation badges |
| `FinalCtaSection.tsx` | Bottom CTA section before footer |
| `MarketingNav.tsx` | Navigation bar with logo, menu items, auth buttons |
| `MarketingFooter.tsx` | Footer with links, social, legal |
| `LogoMarquee.tsx` | Scrolling marquee of supporting institution logos |
| `SocialProofBar.tsx` | Social proof stats (e.g., "1000+ students passed") |
| `LandingPrimitives.tsx` | Reusable SVG/visual primitives (Starburst, NoiseOverlay, DottedGridOverlay, ReadinessDial) |
| `GoogleIcon.tsx` | Google logo icon component |

## For AI Agents

### Working In This Directory

- **Design System**: All colors from Campfire palette (Camp Cobalt #1B3FC4, Camp Orange #E8853A, Emerald #2D9F6F, Warm Red #D64545, Amber #D4951A)
- **Typography**: Inter font, minimum 11px text size, never below
- **Animations**: Use Framer Motion with max 300ms duration, default ease-out
- **Voice**: Growth-framed messaging (not fear-based), specific CTAs, warm and supportive tone
- **Responsive**: Mobile-first, use `md:` and `lg:` breakpoints
- **Cards**: No shadow at rest, `shadow-sm` on hover, `rounded-md` (8px)
- **Testimonials**: Real data only; placeholder marked with "PLACEHOLDER" comment at top of component
- **Pricing**: Features use green check (Emerald), limits use gray X
- **Colors in code**: Use hex values or Tailwind classes from design system, not arbitrary colors

### Dependencies
### Internal

- `LandingPrimitives.tsx` - Shared SVG components and visual utilities
- `@/components/graphics/icons/Icon.tsx` - Icon wrapper (SCIcon)
- `@/lib/constants/pricing` - Pricing tier definitions (PricingTier type)
- `@/lib/utils` - `cn()` utility for class merging
- Framer Motion (`framer-motion`) - Animations on hero cards
- Rough Notation (`rough-notation`) - Hand-drawn annotation effects on headline
- Next.js (`next/font/google`) - Font loading (Instrument Serif for quotes, Geist Sans for headings)
- Phosphor Icons (`@phosphor-icons/react`) - Icon set

<!-- MANUAL: Keep testimonials section updated with real user feedback before launch. Replace placeholder quotes with verified student stories. -->


---


# FILE: .\src\components\motion\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# motion

## Purpose

Framer Motion animation components for scroll-triggered reveals and staggered animations. Provides reusable animation patterns respecting user `prefers-reduced-motion` settings.

## Key Files

| File | Description |
|------|-------------|
| `ScrollReveal.tsx` | Scroll-triggered reveal with fade-in, slide-up, optional scale animation |
| `StaggerChildren.tsx` | Stagger animation wrapper for animating list items sequentially |

## For AI Agents

### Working In This Directory

- **Duration Constraint**: Max 300ms for motion durations (never 500ms, 700ms, 1000ms)
- **Default Duration**: 150ms with ease-out (`[0.16, 1, 0.3, 1]` cubic-bezier)
- **ScrollReveal**: `initial={{ opacity: 0, y }}` → `whileInView={{ opacity: 1, y: 0 }}`
- **Viewport**: `once: true` (animate once on scroll), `margin: '-80px'` (trigger before visible)
- **Scale**: Optional prop to scale from 0.98 on reveal
- **Accessibility**: All animations are suppressible via CSS media query `prefers-reduced-motion: reduce`
- **No Bounce/Spring**: Use standard easing, never bounce or spring easing (except structured framer layouts)

### Dependencies
### Internal

- `framer-motion` - Animation library
- React - `ReactNode` type

<!-- MANUAL: Test scroll reveal timing on various viewport speeds. Verify prefers-reduced-motion is respected in accessibility tests. Never add bounce/spring easing without explicit design request. -->


---


# FILE: .\src\components\notes\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# notes

## Purpose

Note-taking system using TipTap rich text editor. Provides markdown-like editing with formatting toolbar, note organization via folders, search, and auto-save. Notes capture insights from quizzes and Wiki content for spaced repetition review.

## Key Files

| File | Description |
|------|-------------|
| `NotesEditor.tsx` | TipTap editor with formatting toolbar (bold, italic, strikethrough, lists), bubble menu, highlights, images, task lists, headings, font sizes. `'use client'` |
| `NoteEditor.tsx` | Wrapper showing single note with auto-save indicator and edit controls. `'use client'` |
| `NotesShell.tsx` | Main shell/layout for notes workspace (sidebar + editor). `'use client'` |
| `NotesList.tsx` | Renderable list of notes (for sidebar or standalone). `'use client'` |
| `NotesNavigator.tsx` | Navigation component for moving between notes. `'use client'` |
| `QuickCaptureDrawer.tsx` | Drawer for quick note capture (side-panel). `'use client'` |
| `TemplatePicker.tsx` | Template selection modal for new notes. `'use client'` |
| `ContextBadge.tsx` | Badge showing note context source (Quiz, Wiki, etc.). |

## Subdirectories

None. All notes components are flat in `src/components/notes/`.

## For AI Agents

### Working In This Directory

- **Editor**: Uses TipTap v3 with StarterKit, Placeholder, Typography, Image, TaskList, Highlight extensions
- **Bubble Menu**: Shows on text selection with bold, italic, underline, highlight color picker
- **Fixed Toolbar**: Optional, can be hidden with `hideToolbar` prop; includes formatting + image upload
- **Auto-save**: Debounced with 10-second persistence target (see project rules)
- **Title Extraction**: Automatically extracted from first paragraph on first edit (max 80 chars)
- **Image Upload**: Supports local base64 or Supabase Storage integration (needs userId)
- **Search**: Server-side via `getNotesList()` action with client-side filtering
- **Folders**: Optional folder organization; loaded async on sidebar open
- **Highlight Colors**: Yellow #FEF08A, Green #BBF7D0, Blue #BAE6FD, Pink #FBCFE8
- **Styling**: Prose classes for typography (prose-sm on compact, full prose-base on desktop)

### Dependencies
### Internal

- `@tiptap/react` - Editor core
- `@tiptap/starter-kit` - Basic formatting (bold, italic, strike, headings, lists, blockquote, code, hr)
- `@tiptap/extension-*` - Underline, Highlight, Placeholder, Image, TaskList, TextStyle, FontSize, HorizontalRule
- `@/lib/actions/notes-actions` - Server actions: `getNotesList`, `getNoteFolders`, `createNote`, `createNoteFolder`
- `@/lib/notes/uploadImage` - Image upload to Supabase Storage
- `@/lib/utils` - `cn()` utility
- `@phosphor-icons/react` - Icons (Plus, Folder, Note, Search, etc.)
- `date-fns` - Date formatting
- UI components from `@/components/ui/` - Sheet, Button, Input

<!-- MANUAL: Update image upload domain/bucket when Supabase Storage is configured. Ensure fallback to base64 works if upload fails. Monitor auto-save debounce -- adjust if latency issues arise. -->


---


# FILE: .\src\components\notifications\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# notifications

## Purpose

Real-time notification system UI. Popover bell icon with badge, notification list, filtering, item rendering, preferences. Integrates Supabase Realtime.

## For AI Agents

1. **Realtime via Supabase:** NotificationBell calls startRealtime() on mount
2. **State in useNotificationStore:** No local useState for notification data
3. **Filtering client-side:** NotificationFilters drives store filter state

## Dependencies

Internal: @/stores/useNotificationStore, @/lib/utils

External: react, @supabase/supabase-js, @phosphor-icons/react, date-fns, tailwindcss

<!-- MANUAL: -->


---


# FILE: .\src\components\portal\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 -->

# portal

## Purpose

Shared portal shell components used by the admin, CEO, and developer portals. Provides a consistent layout pattern (topbar + sidebar + content area) with configurable accent colors, nav groups, and optional right rail. Each portal passes its own config to these generic shell components rather than building bespoke layouts.

## Key Files

| File | Description |
|------|-------------|
| `PortalLayout.tsx` | Main layout shell: composes PortalTopbar, PortalSidebar, MobileNav, and content area with optional right rail. Accepts `portalLabel`, `topbarBg`, `accentColor`, `accentLightColor`, `navItems` props. Server component. |
| `PortalSidebar.tsx` | Left sidebar with grouped nav items, collapsible sections, search filter, pathname-based active state, badge counts. Accepts accent color props for portal-specific theming. `'use client'` |
| `PortalTopbar.tsx` | Top navigation bar with portal label, accent background, optional right content slot, optional search component, and back navigation link. |
| `MobileNav.tsx` | Mobile-responsive navigation drawer for small viewports. Renders nav items in a sheet overlay. `'use client'` |
| `CommandPalette.tsx` | Cmd+K command palette for portal-wide search. Uses Fuse.js for fuzzy matching, recent pages from localStorage, component registry search. `'use client'` |
| `CodeBlock.tsx` | Syntax-highlighted code block with copy button. Used in developer portal documentation. |
| `CopyButton.tsx` | Clipboard copy button with visual feedback (checkmark on success). `'use client'` |
| `StickyTOC.tsx` | Sticky table of contents sidebar. Tracks scroll position, highlights active heading. `'use client'` |
| `index.ts` | Barrel exports for all components and their prop types. |

## Subdirectories

None. All portal components are flat in `src/components/portal/`.

## For AI Agents

### Working In This Directory

1. **Portal pattern.** Each portal (admin, CEO, developer) uses `PortalLayout` as its shell. Portal-specific config (colors, nav items, label) is passed as props from the portal's `layout.tsx`. Do NOT hardcode portal-specific values in these components.

2. **Accent color props.** `accentColor` and `accentLightColor` are CSS color strings (e.g., `'#1B3FC4'`, `'#EEF2FC'`). They are applied inline via `style` props for portal-specific theming. Each portal defines its own accent pair.

3. **NavGroup structure.** Navigation is defined as `NavGroup[]` where each group has a `label` and `items: NavItem[]`. Each NavItem has `label`, `href`, optional `icon`, optional `children`, and optional `badge` count. This structure is consistent across all portals.

4. **Lucide icons.** Unlike the main dashboard sidebar (which uses Phosphor), the portal sidebar uses Lucide icons (`lucide-react`). This is intentional for the portal context.

5. **Type exports.** The `index.ts` barrel exports both components and their prop types. When consuming from outside, import from `@/components/portal`.

### Common Patterns

**Portal layout usage in a portal's layout.tsx:**
```tsx
import { PortalLayout } from '@/components/portal'

const AdminLayout = ({ children }) => (
  <PortalLayout
    portalLabel="Admin"
    topbarBg="bg-[#1A2332]"
    accentColor="#1B3FC4"
    accentLightColor="#EEF2FC"
    navItems={ADMIN_NAV_GROUPS}
    backHref="/dashboard"
    backLabel="Dashboard"
  >
    {children}
  </PortalLayout>
)
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/utils` | cn() for class merging |
| `@/components/ui/command` | CommandDialog, CommandInput, CommandList for CommandPalette |
| `@/components/ui/badge` | Badge for nav item counts |
| `@/lib/developer/componentRegistry` | Component registry for CommandPalette search |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | Hooks: useState, useEffect, useCallback, useMemo | ^19.2.4 |
| **next/link** | Client-side navigation | 16.1.6 |
| **next/navigation** | usePathname, useRouter | 16.1.6 |
| **lucide-react** | Icons: Search, Clock, ChevronLeft | ^0.577.0 |
| **fuse.js** | Fuzzy search in CommandPalette | latest |

<!-- MANUAL: -->


---


# FILE: .\src\components\quiz\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# quiz

## Purpose

Quiz and testing interface primitive components for SlateCamp. Renders individual question items, answer input, session UI (header, timer, progress tracking), drawers (rationale feedback, AI tutor, restudy options), and navigation. These are the low-level building blocks consumed by both `dashboard/QuizRenderer` and `testing/session/SessionShell`. Supports 7 test modes with distinct pedagogical rules and IRT 2-parameter logistic model mastery scoring. Auto-saves every 10 seconds with visual save status indicator.

## Key Files

| File | Description |
|------|-------------|
| `QuizHeader.tsx` | Session header with mode badge (Camp/Chill/Storm/Proof Sim/Blindspot/Custom/Endurance), question counter, flag toggle, AI tutor trigger, exit button, save status. Mode-specific styling via MODE_STYLES map. `'use client'` |
| `QuestionStem.tsx` | Main question text renderer. Supports Markdown, LaTeX formulas, images. Semantic HTML (article/h2 pattern). `'use client'` |
| `OptionButton.tsx` | Answer choice button. Shows option text, selection state, feedback styling (correct/incorrect/flagged). Handles single/multi-select. `'use client'` |
| `TimerBar.tsx` | Timed session countdown. Blue to amber at <=20%, critical at <=10%. Shows MM:SS. Clickable to minimize. `'use client'` |
| `QuestionMap.tsx` | Visual map of all questions in session. Shows completion state. Allows jump-to-question navigation. `'use client'` |
| `ConfidenceToggle.tsx` | Per-question confidence rating (1-5 scale or two-level). Influences IRT theta estimation. `'use client'` |
| `ConfidenceCheckScreen.tsx` | Pre-submission screen asking "How confident are you?" Forces confidence rating. `'use client'` |
| `ErrorTypePrompt.tsx` | Post-incorrect-answer modal: "Why did you miss this?" (careless/conceptual/guessed). `'use client'` |
| `RationaleDrawer.tsx` | Side drawer: post-answer feedback with explanation, misconception/principle breakdown, wiki reference link. `'use client'` |
| `AITutorDrawer.tsx` | AI-powered tutoring drawer. Temperature 0.0 with structured format and mandatory citation badges. `'use client'` |
| `SaveIndicator.tsx` | Status indicator (idle/saving/saved/error/offline). Auto-save progress every 10 seconds. `'use client'` |
| `ConfirmSubmitSheet.tsx` | Confirmation modal for quiz exit or final submission. Lists unsaved changes or flagged questions. `'use client'` |
| `FooterNavigator.tsx` | Quiz footer: Previous/Next buttons, Question Map toggle, Confidence Check, Submit/Finish CTA. `'use client'` |
| `QuizOverlay.tsx` | Container for all overlay components (drawers, sheets, modals). Manages z-index and animation state. `'use client'` |
| `RestudyLoop.tsx` | Post-session UI for selecting incorrect answers to inline review. Links to Wiki. `'use client'` |
| `index.ts` | Barrel exports for quiz components. |

## Subdirectories

None. All quiz components are flat in `src/components/quiz/`.

## For AI Agents

### Working In This Directory

Quiz components are **primitive building blocks** for the testing engine. They are consumed by both `dashboard/QuizRenderer` (legacy) and `testing/session/SessionShell` (v2). They enforce strict pedagogical rules and IRT-based mastery calculation. All quiz state must persist with auto-save every 10 seconds.

**Test modes (7 types):**
1. **Camp** -- Instant feedback after each answer. Learning-focused. Mode badge: `bg-[#EEF2FC] text-[#1535A8]`
2. **Chill** -- Untimed, instant feedback. Low-stress practice. Mode badge: `bg-[#F5F5F5] text-[#4A5568]`
3. **Storm** -- Timed, no feedback until end-of-session. Exam-like. Mode badge: `bg-[#1A2332] text-white`
4. **Proof Sim** -- Full exam simulation (timed, no feedback, full session). Mode badge: `bg-[#1A2332] text-white`
5. **Blindspot** -- Focused review of flagged/error topics. Instant feedback. Mode badge: `bg-[#FEF8ED] text-[#D4951A]`
6. **Custom** -- User-defined: subject mix, count, feedback style. Mode badge: `bg-[#F5F5F5] text-[#4A5568]`
7. **Endurance** -- Extended session (50+ questions, timed). Mode badge: `bg-[#F5F5F5] text-[#4A5568]`

**State constraints:**
- Auto-save every 10 seconds to Supabase. Show visual indicator (SaveIndicator).
- Preserve session state in browser (zustand store) for instant UX.
- On session exit, confirm with modal (ConfirmSubmitSheet) to prevent data loss.
- Flagged questions are always visible in question map.

**Mastery scoring (IRT 2-parameter logistic):**
- Theta (ability estimate) updated per question based on response and question difficulty.
- Discrimination (a) and difficulty (b) parameters from question metadata.
- Lucky-guess correction applied.
- EMA (exponential moving average) weights recent sessions more heavily.

**AI Tutor rules:**
- Temperature = 0.0 (deterministic).
- ALWAYS include citation badges linking to exact Wiki paragraph IDs.
- Parse response into Misconception / Principle / Wiki Reference.

### Common Patterns

1. **Mode-specific styling:** Each TestMode maps to a unique color scheme in `MODE_STYLES`.
2. **Post-submit disabled state:** After answer submission, option buttons are disabled until rationale is reviewed.
3. **Drawer composition:** RationaleDrawer and AITutorDrawer both use Framer Motion + AnimatePresence. Slide from right.
4. **Timer color shift:** TimerBar uses primary (blue #1B3FC4) normally, amber (#D4951A) when <=20%, critical red when <=10%.
5. **Question map jump:** Clicking a question in QuestionMap updates active question index and scrolls stem into view.
6. **Save status loop:** Component hooks into quiz store, detects changes, auto-saves on 10s interval, updates SaveIndicator.

## Dependencies

### Internal

- `@/types/app` -- TestMode, Question, Choice, IRT metadata, UserResponse
- `@/types/testing` -- ModeSource, ConfidenceTag, ErrorTag, AnswerState
- `@/lib/hooks/useQuiz` -- Quiz session state
- `@/lib/hooks/useIRT` -- IRT scoring function
- `@/lib/hooks/useSave` -- Auto-save hook (10s interval)
- `@/lib/actions/quiz-actions` -- submitAnswer, flagQuestion, exitSession
- `@/lib/actions/ai-tutor` -- AI tutor generation (Temperature 0.0)
- `@/lib/utils` -- cn(), time formatting
- `@/components/ui/*` -- shadcn/ui (Dialog, Sheet, Button, etc.)
- `@/components/graphics/icons/Icon` -- SCIcon wrapper

### External

- `react` (19.x) -- Hooks, context, Suspense
- `framer-motion` -- Drawer/sheet animations, AnimatePresence
- `@phosphor-icons/react` -- Icons (Flag, Brain, CircleNotch, X, etc.)
- `next/navigation` -- useRouter for quiz flow control

## Campfire Design System

### Colors & Styling

- **Primary (Camp mode):** bg-[#EEF2FC] text-[#1535A8] border-[#1535A8]/20
- **Secondary (Chill/Custom/Endurance):** bg-[#F5F5F5] text-[#4A5568] border-[#D4DAE3]
- **Dark (Storm/Proof Sim):** bg-[#1A2332] text-white border-[#1A2332]
- **Warning (Blindspot):** bg-[#FEF8ED] text-[#D4951A] border-[#D4951A]/20
- **Feedback colors:**
  - Correct: Emerald (#2D9F6F) + bg-[#EDFAF4]
  - Incorrect: Warm Red (#D64545) + bg-[#FDF0F0]
  - Flagged: Amber (#D4951A)
  - Unanswered: gray (#D4DAE3)
- **Text:** text-[#1A2332] (primary), text-[#4A5568] (secondary), text-[#8896A7] (tertiary)
- **Transitions:** max 300ms, duration-150 ease-out

### Typography

- Minimum text: 11px (text-[11px]). NEVER 8/9/10px.
- Monospace ONLY on code, numbers (timer, question count). NOT on labels.
- Inter via next/font/google.

<!-- MANUAL: -->


---


# FILE: .\src\components\quiz-v2\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# quiz-v2

## Purpose

Next-generation quiz engine components implementing pedagogically-sound testing modes (Camp, Chill, Storm, Full Exam, Extended, Subject, Focused, Custom, Article Review). Session lifecycle: setup to quiz to results. Includes prediction/postdiction, confidence tracking, spaced repetition signals, and results analytics.

All components use 'use client' with state via useQuizStore (Zustand). Server actions handle session init, submission, IRT computation, and feedback.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| setup/ | Config flow: intro slides, mode selector, pressure level, checklist |
| results/ | Analytics: score reveal, breakdown, matrix, debrief, review cards |
| review/ | Full-screen review: filters, rationales, misconceptions, citations |

## For AI Agents

1. **Quiz lifecycle:** QuizShell -> SetupFlow -> quiz loop -> ResultsDashboard -> ReviewMode
2. **Config immutable after setup:** Do not modify QuizSessionConfig mid-session
3. **Prediction/postdiction optional:** Check MODE_PRESETS
4. **Feedback AI-driven (Temp 0.0):** Mandatory Wiki citations required
5. **IRT server-side:** No client calculations
6. **Review separate:** Full-screen overlay with read-only data
7. **Gesture capture:** GestureCaptureZone only place for invalidate()
8. **Micro-breaks enforced:** 30s after N questions in Storm/Extended
9. **Pacing contextual:** Warm advisory tone
10. **Zone colors strict:** Use getReadinessColorClass()

## Dependencies

Internal: @/stores/useQuizStore, @/types/quiz-config, @/lib/quiz/mode-presets, @/lib/actions/quiz-v2, @/components/shared/score-display

External: react, framer-motion, recharts, zustand, @react-three/fiber, tailwindcss

<!-- MANUAL: -->


---


# FILE: .\src\components\r3f\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# r3f

## Purpose

React Three Fiber utilities. Scene invalidation via version counter, geometry switching, loading overlay. For Calculator Suite frameloop="demand" tools.

## For AI Agents

1. **SceneInvalidator is render gate:** Mount inside Canvas with inputVersion selector
2. **Version counter pattern:** Increment numeric inputVersion in Zustand on user input
3. **60 FPS target:** All calculations within 16.6ms per frame

## Dependencies

Internal: @/stores/*, @/lib/utils

External: @react-three/fiber, three, react, tailwindcss

<!-- MANUAL: -->


---


# FILE: .\src\components\score\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# score

## Purpose

Readiness Score display. Animated SVG ring (0-100), zone badges, delta display, loading skeleton.

## For AI Agents

1. **Zones fixed:** Strong 85-100, On Track 70-84, Developing 40-69, Needs Review <40
2. **Color strict:** Use getReadinessColorClass()
3. **Motion respected:** Check prefers-reduced-motion
4. **Sizes predefined:** sm (80px), md (160px), lg (240px)

## Dependencies

Internal: @/components/shared/score-display, @/lib/utils

External: react, tailwindcss

<!-- MANUAL: -->


---


# FILE: .\src\components\session\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# session

## Purpose

Session results UI. Score, question breakdown, topic performance, time elapsed, next action CTA.

## For AI Agents

1. **Topic breakdown structured:** {topicName, correct, total} array
2. **Score color coding:** Use getScoreColor()
3. **Next action contextual:** Dashboard, new quiz, or review link

## Dependencies

Internal: @/components/shared/score-display, @/lib/utils

External: next/link, react, tailwindcss

<!-- MANUAL: -->


---


# FILE: .\src\components\settings\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# settings

## Purpose

User settings and preferences UI. Account, study window, profile management.

## For AI Agents

1. **Server actions persist:** Call server actions on state change
2. **Compact mode:** Use compact=true for form embedding

## Dependencies

Internal: @/lib/actions/profile, @/lib/utils

External: react, tailwindcss

<!-- MANUAL: -->


---


# FILE: .\src\components\shared\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# shared

## Purpose

Cross-cutting reusable components used throughout the app: theme provider, navigation structure (navbar, sidebar with rail+overlay pattern), header, progress tracking, info tooltips, loading states, error boundaries, data tables, section headers, stat cards, score displays, taxonomy pickers, and breadcrumbs. Most are client components; some are server-renderable.

## Key Files

| File | Description |
|------|-------------|
| `ThemeProvider.tsx` | Next-themes provider wrapper: light/dark mode with system detection. Usually in root layout. `'use client'` |
| `ThemeToggle.tsx` | Sun/Moon icon button to switch theme. Calls `setTheme()` from useTheme hook. `'use client'` |
| `Navbar.tsx` | Top navigation: logo, nav items (Dashboard, Wiki, Quiz, etc.), theme toggle, user menu. `'use client'` |
| `DashboardHeader.tsx` | Page header: breadcrumb or page title, optional action buttons. Reused across dashboard pages. |
| `NavigationProgress.tsx` | Progress bar: top-of-page loading indicator. Triggered on route changes. `'use client'` |
| `LogoutButton.tsx` | Logout action: calls Supabase signOut, redirects to /login. `'use client'` |
| `Omnibar.tsx` | Command palette: global search input (topics, questions, articles). Keyboard shortcut (Cmd+K). `'use client'` |
| `QuickActionsBar.tsx` | Floating action bar: shortcuts to common tasks. `'use client'` |
| `InfoTooltip.tsx` | Help icon + tooltip: explains UI concepts. Reusable across pages. |
| `StandardInfoPopover.tsx` | Info icon + popover (wider/taller than tooltip): detailed explanations with links. `'use client'` |
| `TierBadge.tsx` | User tier badge: Free/Pro/Enterprise. Shows next tier benefits on hover. |
| `TransitionLink.tsx` | Next Link wrapper with page transition animation. Respects prefers-reduced-motion. `'use client'` |
| `DashboardPageSkeleton.tsx` | Loading skeleton for full pages: header placeholder + grid of card skeletons. |
| `data-table.tsx` | Generic sortable, searchable, paginated data table. Supports column definitions, selection (Checkbox), search, sorting, pagination. Exports `DataTable` and `Column` type. `'use client'` |
| `section-header.tsx` | Standardized section header with eyebrow, title, subtitle, action slot. Three levels: page, section, card. |
| `stat-card.tsx` | Metric card with eyebrow label, value, trend indicator (up/down/flat), optional link. |
| `score-display.tsx` | Score rendering utilities. Exports `getScoreColorHex()` for readiness score coloring. `'use client'` |
| `taxonomy-picker.tsx` | Taxonomy node picker with tree navigation. `'use client'` |
| `taxonomy-tree.tsx` | Taxonomy tree rendering component. `'use client'` |
| `legal-citation-badge.tsx` | Citation badge linking to legal/code references. `'use client'` |
| `breadcrumb.tsx` | Breadcrumb navigation component. |
| `page-header.tsx` | Alternative page header component. |
| `sidebar-nav.tsx` | Sidebar navigation for settings/sub-pages. `'use client'` |
| `content-sidebar.tsx` | Content area sidebar for secondary navigation. `'use client'` |
| `action-card.tsx` | Action card with title, description, and CTA button. |
| `app-drawer.tsx` | Application-wide drawer component. `'use client'` |
| `empty-state.tsx` | Empty state placeholder with icon, message, and optional action. |
| `floating-panel.tsx` | Floating panel for contextual content. `'use client'` |
| `question-card.tsx` | Question display card for lists and previews. |
| `question-dot-navigator.tsx` | Dot-based question navigator for quiz progress. `'use client'` |

## Subdirectories

None. All shared components are flat in `src/components/shared/`.

## For AI Agents

### Working In This Directory

1. **ThemeProvider setup.** All components in Navbar/Sidebar assume ThemeProvider wraps the app root. Do not add theme logic to individual components.

2. **Navigation pattern (rail + overlay).** On desktop, Navbar is horizontal, Sidebar is optional right-rail. On mobile (<md breakpoint), both collapse into sheet overlays triggered by hamburger icon. See Sidebar/Navbar for implementation.

3. **useTheme hook.** Access theme state via `const { theme, setTheme } = useTheme()`. Only available inside ThemeProvider boundary.

4. **DataTable reuse.** The `data-table.tsx` component is a generic table used by CEO TeamTable, admin audit logs, and other tabular views. Define columns via `Column<T>[]` interface. Supports sorting, search, pagination, and row selection.

5. **SectionHeader levels.** Use `level="page"` for top-level page headers, `level="section"` for content sections, `level="card"` for card-internal headers. Each level has appropriate typography sizing.

6. **Score display.** `score-display.tsx` exports `getScoreColorHex()` which is the canonical source for readiness score color thresholds. It is re-exported by `@/components/graphics/tokens.ts` for graphic contexts.

7. **No route logic inside shared components.** All navigation logic lives in ROUTES constants (@/lib/constants/routes.ts). Shared components reference these constants only.

### Common Patterns

**Data table usage:**
```tsx
import { DataTable, type Column } from '@/components/shared/data-table'

const columns: Column<MyRow>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'status', header: 'Status', type: 'badge' },
  { key: 'date', header: 'Date', type: 'date', sortable: true },
]

<DataTable columns={columns} data={rows} keyField="id" />
```

**Section header usage:**
```tsx
import { SectionHeader } from '@/components/shared/section-header'

<SectionHeader
  eyebrow="Analytics"
  title="Readiness Trajectory"
  level="section"
  action={<Button size="sm">Export</Button>}
/>
```

**Stat card usage:**
```tsx
import { StatCard } from '@/components/shared/stat-card'

<StatCard
  eyebrow="Questions Answered"
  value={342}
  trend={{ direction: 'up', label: '+12 this week' }}
/>
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/constants/routes` | ROUTES object: all route strings |
| `@/lib/context/*` | Auth context hooks, active session context |
| `@/components/ui/*` | Button, Sheet, Dialog, Tooltip, Badge, Checkbox, Input, Skeleton |
| `@/lib/utils` | cn() for conditional styling |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **next-themes** | ThemeProvider, useTheme hook | ^0.4.6 |
| **next/navigation** | useRouter, usePathname for routing | 16.1.6 |
| **next/link** | Client-side navigation | 16.1.6 |
| **react** | Hooks: useState, useEffect, useMemo | ^19.2.4 |
| **lucide-react** | Icons: TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, ArrowUpDown | ^0.577.0 |
| **@phosphor-icons/react** | Icons: Sun, Moon, Bell, SidebarSimple, etc. | ^1.4.14 |
| **framer-motion** | Page transition animations (TransitionLink) | ^12.35.2 |

<!-- MANUAL: -->


---


# FILE: .\src\components\sidebar\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# sidebar

## Purpose

Fixed navigation sidebar for SlateCamp using the v2 "Quiet Navigation" architecture -- a single unified element that transitions between collapsed (52px) and expanded (216px) states via CSS width transitions only. The sidebar is `position: fixed` so content never reflows; a permanent `margin-left: 52px` on `SidebarContent` keeps the layout stable at all viewport sizes. Mobile navigation is handled by a separate `MobileSidebarShell` (top bar + full-screen drawer), hidden on `lg+`.

## Key Files

| File | Purpose | Directive |
|------|---------|-----------|
| `types.ts` | Z-index scale, layout constants (52px/216px), TypeScript interfaces, icon tier system | N/A (data) |
| `sidebar-constants.ts` | Nav items config, nav groups, keyboard shortcut map | N/A (data) |
| `SidebarProvider.tsx` | React Context: expanded state, keyboard shortcuts (Cmd+B, Cmd+1-4, Escape), click-outside handler, inert management, reduced-motion support | `'use client'` |
| `Sidebar.tsx` | Unified fixed nav shell (replaces the old SidebarShell + SidebarRail + SidebarOverlay split). CSS transitions, backdrop overlay, leave-session guard | `'use client'` |
| `SidebarContent.tsx` | Main content wrapper. Permanent `margin-left: 52px` on desktop, `padding-top: 42px` on mobile | `'use client'` |
| `SidebarNavItem.tsx` | Individual nav link. Spatially locked icon in a fixed 40x32 container so icons never shift between states. Active indicator, tooltips in collapsed state, tier-based opacity | `'use client'` |
| `SidebarHeader.tsx` | Logo section: BookOpen icon + "SlateCamp" wordmark. `h-16` matches DashboardHeader height | `'use client'` |
| `SidebarFooter.tsx` | Profile row (avatar, name, Pro badge) + expand/collapse toggle (CaretDoubleRight, rotates 180 deg when expanded) | `'use client'` |
| `MobileTopBar.tsx` | Fixed hamburger bar for mobile (42px tall, visible only below lg breakpoint) | `'use client'` |
| `MobileDrawer.tsx` | Full-screen slide-in drawer for mobile navigation | `'use client'` |
| `MobileSidebarShell.tsx` | Coordinates MobileTopBar + MobileDrawer open/close state | `'use client'` |
| `index.ts` | Barrel exports | N/A |

## Subdirectories

None. All sidebar components are flat in `src/components/sidebar/`.

## For AI Agents

### Working In This Directory

**The v2 sidebar is a single unified element -- NOT a rail+overlay split.** Do not introduce separate rail and overlay components. The single `<Sidebar>` element changes width via a CSS transition.

**Critical constraints:**
- Width: 52px collapsed / 216px expanded. These values are defined in `types.ts` and must be the single source of truth.
- The sidebar is `position: fixed`. Content offset is a permanent `margin-left: 52px` on `SidebarContent` -- it does NOT change when the sidebar expands (the expanded panel overlays content, it does not push it).
- CSS transitions only. Do NOT introduce Framer Motion into the desktop sidebar.
- Keyboard shortcuts: Cmd+B toggles expand/collapse, Cmd+1-4 jump to nav sections, Escape closes. All managed in `SidebarProvider`.
- Icon spatial lock: every nav icon sits in a fixed 40x32 container (`flex-shrink-0`). Icons must be at the same x,y in both collapsed and expanded states. Never break this with flex or padding changes.
- 3-tier icon opacity: default `opacity-100`, secondary `opacity-65`, tertiary `opacity-55`.
- Icons: Phosphor (`@phosphor-icons/react`) only. Do NOT use Lucide.
- Nav config lives in `sidebar-constants.ts`. Do NOT derive nav items from `routes.ts` or any other file.
- The leave-session guard (`@/lib/context/active-session-context`) must fire before any navigation that would exit an active test session.

**Mobile (below lg breakpoint):**
- `MobileTopBar` is a 42px fixed bar that renders the hamburger.
- `MobileDrawer` is a full-screen slide-in overlay.
- `MobileSidebarShell` owns open/close state and composes the two.
- The desktop `<Sidebar>` is hidden on mobile; `MobileSidebarShell` is hidden on `lg+`.

### Layout Integration

```
dashboard/layout.tsx renders:
  <SidebarProvider>
    <Sidebar userDisplay={...} tier={...} />
    <MobileSidebarShell userDisplay={...} tier={...} />
    <SidebarContent>
      <Navbar />
      <DashboardHeader />
      <main>{children}</main>
    </SidebarContent>
  </SidebarProvider>
```

### Z-Index Scale

| Layer | Z-index |
|-------|---------|
| Backdrop | 30 |
| Sidebar | 40 |
| Mobile top bar | 45 |
| Mobile drawer | 50 |
| Tooltip | 50 |
| Dialog | 100 |

All z-index values are co-located in `types.ts`. Do not hard-code z-index values in component files.

## Dependencies

### Internal

- `@/lib/context/active-session-context` -- leave-session guard before navigation
- `@/components/ui/tooltip` -- shadcn Tooltip shown in collapsed state
- `@/lib/utils` -- `cn()` utility for class merging

### External

- `@phosphor-icons/react` -- all icons (BookOpen, CaretDoubleRight, etc.)
- `next/link` -- client-side navigation
- `next/navigation` -- `usePathname`, `useRouter`
- `react` -- hooks, context

## Campfire Design System

### Colors & Styling

- **Sidebar background:** `bg-white` with `border-r border-[#D4DAE3]`
- **Active nav item:** `bg-[#EEF2FC] text-[#1535A8]` with left accent indicator
- **Hover nav item:** `bg-[#F8F7F5]`
- **Text (normal):** `text-[#4A5568]`
- **Text (muted):** `text-[#8896A7]`
- **Backdrop (when expanded):** semi-transparent, `z-[30]`
- **Transitions:** CSS only, max 300ms, `ease-out`. Do NOT use `duration-500` or longer.
- **Shadows:** `shadow-none` at rest; `shadow-md` on expanded drawer. Never `shadow-xl` or `shadow-2xl`.

### Typography

- Minimum text: `text-[11px]`. Never `text-[8px]`, `text-[9px]`, or `text-[10px]`.
- Nav item labels: `text-sm font-medium`
- Wordmark: `text-sm font-semibold` (visible only when expanded)
- User name: `text-sm font-medium text-[#1A2332]`
- Tier badge: `text-[11px]`
- Monospace: NOT used anywhere in the sidebar.

### Layout Constants (from `types.ts`)

| Constant | Value | Usage |
|----------|-------|-------|
| `SIDEBAR_COLLAPSED_WIDTH` | `52px` | Rail width; permanent content margin-left |
| `SIDEBAR_EXPANDED_WIDTH` | `216px` | Expanded overlay width |
| `MOBILE_TOPBAR_HEIGHT` | `42px` | Mobile top bar height; content padding-top on mobile |

<!-- MANUAL: -->


---


# FILE: .\src\components\testing\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 -->

# testing

## Purpose

Full testing engine for SlateCamp, organized into four lifecycle phases: setup (session configuration), session (live quiz interaction), debrief (post-session results), and hub (session discovery and mode selection). Supports all test modes (Camp, Storm, Chill, Proof Simulation, Focus Review, Custom, Endurance) with mode-specific behaviors, IRT-based scoring, and auto-save every 10 seconds.

## Key Files

| File | Description |
|------|-------------|
| `debrief/DebriefLayout.tsx` | Master debrief orchestrator. Composes ScoreHero, ReadinessDelta, NodeMasteryStrip, QuestionReviewStrip, CalibrationReveal, BlockAccuracyChart, DebriefActions. Transforms raw DB shapes into typed props. `'use client'` |
| `debrief/ScoreHero.tsx` | Large score display (correct/total) with score band coloring and percentage badge. Uses `SCORE_BAND_THRESHOLDS` from `@/types/testing`. `'use client'` |
| `debrief/ReadinessDelta.tsx` | Before/after readiness score comparison with delta arrow. `'use client'` |
| `debrief/NodeMasteryStrip.tsx` | Horizontal strip of taxonomy nodes showing mastery delta per node. `'use client'` |
| `debrief/QuestionReviewStrip.tsx` | Scrollable list of answered questions with correct/incorrect/flagged indicators. `'use client'` |
| `debrief/CalibrationReveal.tsx` | Confidence calibration visualization: how well user's confidence matched actual performance. `'use client'` |
| `debrief/BlockAccuracyChart.tsx` | Recharts bar chart showing accuracy by question block (e.g., first 10, second 10). `'use client'` |
| `debrief/PressureGapCard.tsx` | Card showing gap between timed and untimed performance. `'use client'` |
| `debrief/SimulationResults.tsx` | Extended debrief for Proof Simulation mode with pass/fail threshold and section breakdowns. `'use client'` |
| `debrief/DebriefActions.tsx` | Action buttons: Review Mistakes, Start New Session, Return to Hub. `'use client'` |
| `hub/ReviewHub.tsx` | Main testing hub page. Composes WelcomeCard, SmartSuggestionCard, InProgressBanner, ZoneSection. Fetches mode stats and smart suggestions from props. `'use client'` |
| `hub/WelcomeCard.tsx` | Greeting card with time-aware message and quick-start CTA. `'use client'` |
| `hub/SmartSuggestionCard.tsx` | AI-driven session recommendation based on mastery gaps and pacing. `'use client'` |
| `hub/ModeCard.tsx` | Individual test mode card with description, rules summary, and Start CTA. `'use client'` |
| `hub/ZoneSection.tsx` | Groups mode cards into zones (Practice, Exam Prep, Review). `'use client'` |
| `hub/InProgressBanner.tsx` | Sticky banner for resuming an in-progress session. Shows mode, progress, last activity. `'use client'` |
| `session/SessionShell.tsx` | Live quiz session shell. Manages question navigation, answer submission, flagging, timer, save state. Delegates to mode-specific behavior components. `'use client'` |
| `session/CampSessionBehavior.tsx` | Camp mode behavior: instant feedback after each answer, rationale drawer. `'use client'` |
| `session/StormSessionBehavior.tsx` | Storm mode behavior: no feedback until session end, timed. `'use client'` |
| `session/ChillSessionBehavior.tsx` | Chill mode behavior: untimed, instant feedback, relaxed pacing. `'use client'` |
| `session/StormTimerBar.tsx` | Countdown timer bar for timed modes. Blue to amber at 20%, red at 10%. `'use client'` |
| `session/NavigatorOverlay.tsx` | Question map overlay for jumping between questions. `'use client'` |
| `session/ConfidenceTag.tsx` | Per-question confidence rating tag (confident/unsure). `'use client'` |
| `session/ErrorTaxonomyPrompt.tsx` | Post-incorrect prompt: careless/conceptual/guessed classification. `'use client'` |
| `session/FirstTimeTooltip.tsx` | Onboarding tooltip shown on first session for UI guidance. `'use client'` |
| `setup/CampSetup.tsx` | Camp mode configuration: question count, focus selector, confidence check. `'use client'` |
| `setup/StormSetup.tsx` | Storm mode configuration: timed settings, question count. `'use client'` |
| `setup/ChillSetup.tsx` | Chill mode configuration: untimed, relaxed settings. `'use client'` |
| `setup/CustomSetup.tsx` | Custom session builder: full control over subjects, count, feedback, timing. `'use client'` |
| `setup/EnduranceSetup.tsx` | Endurance mode: extended 50+ question sessions. `'use client'` |
| `setup/FocusReviewSetup.tsx` | Focus Review (Blindspot) mode: targets weak areas from error patterns. `'use client'` |
| `setup/SimulationBriefing.tsx` | Proof Simulation briefing: exam rules, timing, pass threshold. `'use client'` |
| `setup/SubjectSetup.tsx` | Subject-focused setup: single subject drill-down. `'use client'` |
| `setup/SetupSkeleton.tsx` | Loading skeleton for setup pages. |
| `setup/shared/QuestionCountPills.tsx` | Pill selector for question count (5/10/20/50). `'use client'` |
| `setup/shared/ConfidenceCheck.tsx` | Pre-session confidence rating per subject. `'use client'` |
| `setup/shared/FocusSelector.tsx` | Focus option selector (weakest/balanced/single-subject). `'use client'` |
| `setup/shared/SubjectGrid.tsx` | Grid of subject cards with mastery indicators for selection. `'use client'` |

## Subdirectories

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `debrief/` | Post-session results and review UI | 11 files |
| `hub/` | Session discovery, mode selection, resume banners | 7 files |
| `session/` | Live quiz session shell and mode-specific behaviors | 10 files |
| `setup/` | Pre-session configuration screens per mode | 10 files + `shared/` |
| `setup/shared/` | Reusable setup sub-components (pills, grids, selectors) | 4 files |

## For AI Agents

### Working In This Directory

The testing system follows a strict lifecycle: **Setup -> Session -> Debrief**. The Hub is the entry point.

**Critical constraints:**

1. **Mode-specific behavior.** Each test mode has its own setup screen and session behavior component. Do NOT mix mode logic into a single component. SessionShell delegates to CampSessionBehavior, StormSessionBehavior, or ChillSessionBehavior based on the mode.

2. **Types from `@/types/testing`.** All testing types (ModeSource, ScoreBand, ConfidenceTag, ErrorTag, SessionConfig, SmartSuggestion, etc.) are defined in `@/types/testing`. Do NOT duplicate type definitions.

3. **Server actions from `@/lib/actions/testing`.** Session creation (`createTestingSession`), answer saving (`saveTestingInteraction`), session completion (`completeTestingSession`), progress updates (`updateSessionProgress`), and abandonment (`abandonTestingSession`) are all server actions.

4. **Auto-save every 10 seconds.** SessionShell must persist answer state on a 10-second interval. Show SaveIndicator status.

5. **Score bands.** Use `getScoreBand()` and `SCORE_BAND_THRESHOLDS` from `@/types/testing` for color-coding results. Do NOT hardcode score thresholds.

6. **Shared setup components.** The `setup/shared/` directory contains reusable sub-components (QuestionCountPills, ConfidenceCheck, FocusSelector, SubjectGrid) used across multiple setup screens. Import from there.

7. **Barrel exports.** Each subdirectory has an `index.ts` barrel file. Import from the barrel, not individual files, when consuming from outside the testing directory.

8. **Mode constants.** Mode definitions and zone groupings come from `@/lib/constants/testing-modes` (MODE_DEFINITIONS, MODES_BY_ZONE, QUESTION_COUNT_OPTIONS). Do NOT hardcode mode metadata.

### Common Patterns

**Mode-specific setup screen:**
```tsx
const CampSetup = ({ userId, completedSessionCount }: CampSetupProps) => {
  const router = useRouter()
  const [questionCount, setQuestionCount] = useState(20)
  // ... configuration state

  const handleStart = async () => {
    const config: SessionConfig = { source: 'camp_mode', questionCount, ... }
    const result = await createTestingSession(userId, config)
    router.push(`${ROUTES.TESTING_SESSION}/${result.sessionId}`)
  }
}
```

**Session behavior delegation:**
```tsx
// SessionShell renders the appropriate behavior component:
{modeSource === 'camp_mode' && <CampSessionBehavior ... />}
{modeSource === 'storm_mode' && <StormSessionBehavior ... />}
{modeSource === 'chill_mode' && <ChillSessionBehavior ... />}
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/types/testing` | All testing types: ModeSource, ScoreBand, SessionConfig, SmartSuggestion, etc. |
| `@/lib/actions/testing` | Server actions: createTestingSession, saveTestingInteraction, completeTestingSession |
| `@/lib/constants/testing-modes` | MODE_DEFINITIONS, MODES_BY_ZONE, QUESTION_COUNT_OPTIONS |
| `@/lib/constants/routes` | ROUTES for navigation |
| `@/components/ui/*` | Button, Eyebrow, Badge |
| `@/components/shared/section-header` | SectionHeader for hub sections |
| `@/components/quiz/*` | QuizOverlay, SaveIndicator, ConfirmSubmitSheet (shared quiz primitives) |
| `@/components/graphics/icons/Icon` | SCIcon wrapper for Phosphor icons |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | Hooks: useState, useMemo, useCallback, useRef, useEffect | ^19.2.4 |
| **next/navigation** | useRouter, usePathname | 16.1.6 |
| **@phosphor-icons/react** | Icons: Flag, MapTrifold, X, etc. | ^1.4.14 |
| **recharts** | BlockAccuracyChart bar chart | ^3.8.0 |

<!-- MANUAL: -->


---


# FILE: .\src\components\tools\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# tools

## Purpose

Standalone calculator tools for architecture professionals. Three specialized tools: Floor Tiles (tile layout calculator), Wall Paint (paint coverage estimator), and Lot Plotter (land area calculator). Each tool provides form input, validation, and result display.

## Key Files

| File | Description |
|------|-------------|
| `ToolCard.tsx` | Reusable card component for tool discovery (icon, title, description, CTA) |
| `ToolPageLayout.tsx` | Page layout wrapper for individual tool pages |
| `ThreeDCanvasPlaceholder.tsx` | Placeholder for 3D visualization (React Three Fiber ready) |
| `floor-tiles/FloorTilesForm.tsx` | Form for floor tile calculator (room dimensions, tile size, grout width, waste calculation) |
| `wall-paint/WallPaintForm.tsx` | Form for wall paint calculator (surface area, paint coverage) |
| `lot-plotter/LotPlotterForm.tsx` | Form for lot area calculator (land dimensions, area calculation) |

## For AI Agents

### Working In This Directory

- **Validation**: Client-side validation with error state display; prevents invalid submissions
- **Calculations**: All math done client-side; results returned to parent via `onCalculate()` callback
- **Presets**: Common values offered as buttons (e.g., tile sizes 300/400/600mm); custom override available
- **Units**: Floor Tiles (mm input, m output), Wall Paint (varies), Lot Plotter (varies)
- **Type Safety**: Dedicated result types (`FloorTilesResult`, etc.) imported from `@/types/tools`
- **Styling**: Use `Card`, `CardHeader`, `CardTitle`, `CardContent` from `@/components/ui/card`
- **Error Display**: Red text, `text-destructive` class; messages appear below failing input
- **Accessibility**: Input `id` + `Label htmlFor`, `aria-invalid` on errors

### Dependencies
### Internal

- `@/components/ui/` - Button, Input, Label, Card
- `@/types/tools` - Result types (FloorTilesResult, WallPaintResult, LotPlotterResult)
- `@/lib/utils` - `cn()` utility
- React hooks - `useState`

<!-- MANUAL: Test all calculator formulas against known reference values before launch. Add unit tests for edge cases (zero values, max limits). Ensure result accuracy for professional use. -->


---


# FILE: .\src\components\trail\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# trail

## Purpose

Camp Trails daily practice cards. Day number, topic, estimated time, status, score, onStart handler.

## For AI Agents

1. **Status styling:** available (normal), completed (green), locked (disabled), current (amber)
2. **onStart callback:** Optional - fires on button click
3. **Score optional:** Display if provided and status=completed

## Dependencies

Internal: @/lib/utils, @phosphor-icons/react

External: react, tailwindcss

<!-- MANUAL: -->


---


# FILE: .\src\components\trails\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# trails

## Purpose

Camp Trails -- guided learning paths through taxonomy topics with daily assignments, progress tracking, phase maps, and recommendations. Provides structure for multi-day study plans with intensity levels (intensive, accelerated, standard, comprehensive, undergraduate). Includes trail library, daily views, catch-up mechanics, and dashboard integration cards.

## Key Files

| File | Description |
|------|-------------|
| `TrailDetail.tsx` | Trail overview with stats (duration, intensity, step count), enrollment CTA, week-by-week breakdown. `'use client'` |
| `TrailDetailEnroll.tsx` | Enrollment form/CTA for a specific trail. `'use client'` |
| `TrailDailyView.tsx` | Daily view showing current day's steps and progress. `'use client'` |
| `TrailDayView.tsx` | Individual day view within a trail. `'use client'` |
| `TrailLibrary.tsx` | Browsable library of all available trails with filtering. `'use client'` |
| `TrailFilterRow.tsx` | Filter controls for trail library (intensity, duration, subject). `'use client'` |
| `TrailCard.tsx` | Summary card for a trail in list/grid views. `'use client'` |
| `DashboardTrailCard.tsx` | Compact trail card for dashboard integration. `'use client'` |
| `RecommendedTrailCard.tsx` | AI-recommended trail card with rationale. `'use client'` |
| `TrailPhaseMap.tsx` | Visual phase map showing trail structure and progress. `'use client'` |
| `PhaseTransitionCard.tsx` | Card shown at phase boundaries within a trail. `'use client'` |
| `TrailStepCard.tsx` | Individual step within a trail day. `'use client'` |
| `TrailRibbon.tsx` | Visual ribbon showing trail progress/completion. `'use client'` |
| `ActiveTrailBanner.tsx` | Banner for currently active trail with progress and continue CTA. `'use client'` |
| `DayCompletionMoment.tsx` | Celebration/completion screen when user finishes a day. `'use client'` |
| `CatchUpView.tsx` | Catch-up interface for missed trail days. `'use client'` |
| `MissedDayCard.tsx` | Card for a missed day with catch-up options. `'use client'` |
| `ScoreTrajectoryChart.tsx` | Recharts line chart showing score trajectory through trail. `'use client'` |
| `MiniHeatmapPreview.tsx` | Compact heatmap preview for trail topic coverage. `'use client'` |
| `BlindspotPriorityFlag.tsx` | Flag indicating blindspot topics within trail. `'use client'` |
| `SleepAwareLabel.tsx` | Label that adjusts messaging based on time of day. `'use client'` |
| `index.ts` | Barrel exports for trails components. |

## Subdirectories

None. All trails components are flat in `src/components/trails/`.

## For AI Agents

### Working In This Directory

- **Intensity Colors**: Red (intensive), Amber (accelerated), Cobalt (standard), Emerald (comprehensive/undergraduate)
- **Duration**: Measured in days; weeks calculated as `Math.ceil(dayNumber / 7)`
- **Steps**: Trail days contain step arrays; total steps rolled up from all days
- **Enrollment**: Server action `enrollInTrail()` creates enrollment record and routes to `/dashboard/trails/{slug}/today`
- **Progress**: Tracked via `TrailEnrollment` with `current_day` and `days_completed` fields
- **State Management**: Uses `useTransition()` for async enrollment operations
- **Navigation**: Uses Next.js `useRouter()` for programmatic routing post-enrollment
- **Catch-up**: MissedDayCard and CatchUpView handle days the user skipped, offering condensed review
- **Score trajectory**: ScoreTrajectoryChart uses Recharts to plot mastery score changes throughout the trail
- **Dashboard integration**: DashboardTrailCard and ActiveTrailBanner are designed for embedding in the main dashboard

### Dependencies
### Internal

- `@/lib/actions/trails` - Server actions: `enrollInTrail()`
- `@/types/app` - Types: `CampTrail`, `TrailDay`, `TrailEnrollment`
- `@phosphor-icons/react` - Icons (CaretDown, CaretRight, Clock, Fire, ListChecks)
- `@/components/ui/*` - Card, Button, Badge
- `@/lib/utils` - cn() utility
- Next.js (`next/navigation`) - Router for client-side navigation
- React hooks - `useState`, `useTransition`
- `recharts` - ScoreTrajectoryChart

<!-- MANUAL: Ensure trail durations align with learning science research on spaced repetition intervals. Test enrollment flow end-to-end. Verify intensity color mappings match Campfire palette. -->


---


# FILE: .\src\components\ui\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# ui

## Purpose

shadcn/ui primitive components with Campfire design system tokens applied via Tailwind CSS v4 CSS variables. Base UI layer (Button, Card, Dialog, Input, etc.) used throughout the codebase. All styled with strict design constraints: no `shadow-xl`/`shadow-2xl` (except modals), max 300ms transitions, min 11px text, proper border radii (cards `rounded-md`, buttons `rounded-sm`, modals `rounded-lg`).

## Key Files

| File | Description |
|------|-------------|
| `button.tsx` | Button primitive: variants (default, outline, secondary, ghost, destructive, warmCta, link), sizes (xs-lg, icon sizes). Uses `class-variance-authority` (CVA). |
| `card.tsx` | Card container: `shadow-none` at rest, `shadow-sm` on hover. Supports CardHeader, CardTitle, CardContent, CardFooter via data-slot. |
| `input.tsx` | Text input: base styles, focus ring, validation states (aria-invalid). |
| `textarea.tsx` | Multi-line text input. |
| `label.tsx` | Form label: pairs with inputs via `htmlFor`. |
| `dialog.tsx` | Modal dialog: DialogRoot, DialogTrigger, DialogContent, DialogClose. Backdrop with blur. Escape closes. |
| `alert-dialog.tsx` | Confirmation dialog for destructive actions. |
| `select.tsx` | Dropdown: SelectRoot, SelectTrigger, SelectContent, SelectItem. Keyboard navigation. |
| `dropdown-menu.tsx` | Context menu: DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem. |
| `popover.tsx` | Floating popover: PopoverRoot, PopoverTrigger, PopoverContent. Auto-positioning. |
| `tooltip.tsx` | Hover/focus tooltip with keyboard support. |
| `tabs.tsx` | Tabbed interface with keyboard (arrow keys) support. |
| `progress.tsx` | Linear progress bar. |
| `progress-bar.tsx` | Alternative progress bar component. |
| `slider.tsx` | Range input: single or dual-handle. |
| `radio-group.tsx` | Radio button group with label association. |
| `switch.tsx` | Toggle switch: checked/unchecked states. |
| `checkbox.tsx` | Checkbox: checked/indeterminate/unchecked. Label pairing. |
| `badge.tsx` | Semantic badge: status (success, warning, error) or default. |
| `avatar.tsx` | User avatar: AvatarImage (with fallback) + AvatarFallback (initials). |
| `scroll-area.tsx` | Scrollable container with custom scrollbar styling. |
| `separator.tsx` | Horizontal or vertical divider line. |
| `sheet.tsx` | Slide-out sheet: SheetRoot, SheetTrigger, SheetContent. From left, right, top, bottom. |
| `command.tsx` | Command palette / search input. Filterable list with keyboard navigation. |
| `calendar.tsx` | Month calendar picker. |
| `resizable.tsx` | Resizable panel groups: PanelGroup, Panel, PanelResizeHandle. |
| `input-group.tsx` | Input with icon slots: icon-start, icon-end. |
| `skeleton.tsx` | Loading placeholder with animated shimmer. |
| `toast.tsx` | Toast notification: ToastRoot, ToastTitle, ToastDescription, ToastAction. Auto-dismiss. |
| `toaster.tsx` | Toast container: renders all active toasts. |
| `accordion.tsx` | Accordion component. |
| `close-button.tsx` | Reusable close button with X icon. |
| `difficulty-bar.tsx` | Visual difficulty indicator bar (1-5 scale). |
| `event-badge.tsx` | Event/activity type badge. |
| `eyebrow.tsx` | Eyebrow text component (small uppercase label above titles). |
| `form-field.tsx` | Form field wrapper with label, input, error message. |
| `icon-button.tsx` | Icon-only button variant. |
| `mode-button.tsx` | Test mode selection button. |
| `status-badge.tsx` | Status indicator badge with semantic colors. |
| `student-view-watermark.tsx` | Watermark overlay for student preview mode. |
| `toolbar.tsx` | Generic toolbar component. |
| `SlateCampLogo.tsx` | SlateCamp logo SVG. Sized via className. |

## Subdirectories

None. All UI primitives are flat in `src/components/ui/`.

## For AI Agents

### Working In This Directory

1. **Do not modify these files unless updating design tokens.** These are foundational primitives. If a new variant is needed, discuss with design first and add via CVA (button.tsx pattern).

2. **CSS variable mapping.** All colors (text, background, border) map to Tailwind CSS v4 variables defined in tailwind.config.ts. Example: `bg-primary` maps to `var(--color-primary)`. Do NOT hardcode hex values in new primitives.

3. **Accessibility mandatory.**
   - All interactive elements must be keyboard-accessible (tab, arrow keys, Enter, Escape).
   - Use semantic HTML (button, input, label, dialog, etc.).
   - ARIA attributes (aria-label, aria-expanded, aria-invalid) where needed.

4. **Transitions must respect prefers-reduced-motion.** Use Tailwind `data-[state=open]:animate-*` with conditional logic, or CSS media queries.

5. **No custom Campfire logic.** These are unstyled headless components with Campfire tokens baked in. Business logic (quiz, analytics) belongs in domain-specific components (quiz/, analytics/).

### Common Patterns

**Using button variants:**
```tsx
import { Button } from '@/components/ui/button'

<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="warmCta">Action</Button>
<Button size="xs">Extra small</Button>
<Button size="icon">Icon</Button>
```

**Card structure:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

**Dialog with form:**
```tsx
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogTitle>Confirm</DialogTitle>
    <DialogDescription>Are you sure?</DialogDescription>
    <form onSubmit={handleSubmit}>
      <Button type="submit">Confirm</Button>
    </form>
  </DialogContent>
</Dialog>
```

**Eyebrow label:**
```tsx
import { Eyebrow } from '@/components/ui/eyebrow'

<Eyebrow>Section Label</Eyebrow>
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/utils` | cn() for merging classNames |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **@base-ui/react** | Unstyled headless components (Button, Dialog, Popover, etc.) | ^1.2.0 |
| **class-variance-authority** | CVA for variant styling (button.tsx, badge.tsx, etc.) | latest |
| **@phosphor-icons/react** | Icons (X, ChevronDown, etc.) | ^1.4.14 |
| **lucide-react** | Some icons in newer components | ^0.577.0 |
| **clsx** / **tailwind-merge** | className merging (via cn() utility) | latest |
| **react** | Hooks, React.ReactNode types | ^19.2.4 |
| **next** | Image optimization (if used in card/avatar) | 16.1.6 |

<!-- MANUAL: -->


---


# FILE: .\src\components\wiki\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# wiki

## Purpose

Knowledge base and reference system for SlateCamp. Renders structured article content with syntax highlighting, interactive widgets, pedagogical callouts, navigation, and inline learning aids (note anchors, bookmarks, highlights, teaching prompts, elaborative interrogation). The wiki is the primary context source for the AI Contextual Tutor and supports deep-dive learning between quiz sessions.

## Key Files

| File | Description |
|------|-------------|
| `WikiArticle.tsx` | Main article renderer using MDXRemote. Composes heading navigation, MDX components (callouts, tables, formulas, accordions, tabs, widgets), elaborative interrogation, mistake lists, inline quiz. |
| `WikiLayoutContent.tsx` | Inner content container. Applies typography, spacing, and responsive widths for readability. |
| `WikiContentShell.tsx` | Wrapper for article body. Manages scroll context, reading progress tracking, TOC sticky positioning. |
| `WikiHeader.tsx` | Top navigation bar with discipline/article breadcrumb, mobile menu toggle, search, settings. |
| `WikiHeaderClient.tsx` | Client-side header logic (mobile detection, drawer state). `'use client'` |
| `WikiArticleHeader.tsx` | Article title, discipline context, publication/update metadata, action buttons (bookmark, share, flag). |
| `WikiArticleHero.tsx` | Large hero section with article cover image, title, intro paragraph, estimated read time. `'use client'` |
| `WikiPartHeader.tsx` | Section divider header within article. Marks major structural boundaries. `'use client'` |
| `WikiSidebar.tsx` | Left sidebar with article taxonomy tree, related articles, search. Collapsible on mobile via rail+overlay pattern. `'use client'` |
| `WikiSidebarShell.tsx` | Container for sidebar. |
| `WikiSidebarLoader.tsx` | Lazy loader for sidebar content. |
| `WikiSidebarSkeleton.tsx` | Loading skeleton for sidebar. |
| `WikiRightSidebar.tsx` | Right sidebar with table of contents, reading progress, bookmark list, note anchors. |
| `WikiTableOfContents.tsx` | Interactive TOC extracted from h2/h3 headings. Scrolling highlights current section. Sticky positioning. |
| `WikiReadingProgress.tsx` | Progress bar or visual indicator showing scroll % through article. |
| `WikiNavigationContext.tsx` | Context provider for navigation state (current article, discipline, breadcrumb). |
| `WikiDisciplineContext.tsx` | Context provider for discipline metadata (id, name, tree, icon). |
| `WikiHighlighter.tsx` | User-initiated text selection highlight in color. Stores to user's personal workspace. |
| `WikiTextSelection.tsx` | Utility for capturing user text selection on mobile/desktop. |
| `WikiNoteAnchor.tsx` | Inline anchor for a user-created note or highlight. Shows note preview on hover. |
| `WikiBookmarks.tsx` | List of bookmarked articles or sections. |
| `WikiReadTracker.tsx` | Tracks user read progress per article (scroll depth, time spent). Persisted to user profile. |
| `WikiCallout.tsx` | Semantic callout component: Note, Warn, Tip, Example. Styled with Campfire colors + icons. |
| `WikiCalloutBox.tsx` | Container for callout content. Applies border, background tint, icon. |
| `WikiChangedPill.tsx` | Badge indicating "Updated X days ago" or "New." Content freshness indicator. `'use client'` |
| `WikiExamTable.tsx` | Styled table for exam content (requirements matrix, comparison table). Responsive grid on mobile. `'use client'` |
| `WikiMistakeCard.tsx` | Card highlighting a common misconception with correct principle. |
| `WikiMistakeList.tsx` | List of common mistakes for a topic. |
| `WikiSourcesPopover.tsx` | Popover with citation metadata and links to source documents. `'use client'` |
| `WikiRelatedPopover.tsx` | Popover suggesting related articles, prerequisite topics, or advanced depth. `'use client'` |
| `WrongAnswerBanner.tsx` | Banner above article when linked from incorrect quiz answer. |
| `Accordion.tsx` | Reusable accordion component (base UI). Used by WikiAccordion. |
| `WikiAccordion.tsx` | Accordion wrapper for MDX content. |
| `Tabs.tsx` | Reusable tab component (base UI). Used by WikiTabs. |
| `WikiTabs.tsx` | Tab wrapper for MDX content. |
| `AlertBox.tsx` | Alert box MDX component for important notices. |
| `AuthorityContent.tsx` | Authority content block for official references. |
| `Callout.tsx` | Generic callout MDX component. |
| `ComparisonTable.tsx` | Side-by-side comparison table MDX component. |
| `ExamTip.tsx` | Exam tip callout for test-relevant information. |
| `FormulaBlock.tsx` | Renders mathematical formulas/equations using KaTeX. `'use client'` |
| `GenericBlock.tsx` | Generic content block MDX component. |
| `InlineQuiz.tsx` | Embedded quiz within article body. Quick self-check with instant feedback. |
| `KeyValues.tsx` | Two-column key-value pairs (term, definition). |
| `LawCallout.tsx` | Specialized callout for legal/code reference (e.g., "IBC 101.2.1"). Uses monospace for code. |
| `ProcessFlow.tsx` | Process flow diagram MDX component. |
| `ElaborativeInterrogation.tsx` | "Why is this true?" prompts activating deeper recall. Toggles reveal of deeper explanation. `'use client'` |
| `TeachBackPrompt.tsx` | "Explain this concept in your own words." Text input + AI evaluation. `'use client'` |
| `index.ts` | Barrel exports for wiki components. |
| `mdx-components-shared.ts` | Shared MDX component mappings for article rendering. |
| `parse-mdx-prop.ts` | Utility for parsing MDX component props from content. |
| `transform-mistake-string.ts` | Utility for transforming mistake data into display format. |
| `wiki-icons.ts` | Wiki-specific icon definitions. |

## Subdirectories

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `widgets/` | Interactive widget subdirectory with registry | 1 file (registry.ts) |
| `widgets/bp344/` | Building Performance 344 code widgets | 7 files |
| `widgets/dsgn013/` | Design/ergonomics widgets | 10 files |

### widgets/bp344/

| File | Description |
|------|-------------|
| `DoorConfigurator.tsx` | Interactive door opening width, threshold height, approach space validator. `'use client'` |
| `GrabBarExplainer.tsx` | 3D grab bar placement and specification tool. `'use client'` |
| `CorridorVisualizer.tsx` | 2D corridor layout with width, cross-slope, tactile warning visualization. `'use client'` |
| `CubicleChecker.tsx` | Cubicle dimension checker with compliance legend. `'use client'` |
| `ComparisonTable.tsx` | Side-by-side comparison of code requirements. `'use client'` |
| `RecallDrill.tsx` | Spaced repetition drill for code dimensions/requirements. `'use client'` |
| `index.ts` | Barrel exports for bp344 widgets. |

### widgets/dsgn013/

| File | Description |
|------|-------------|
| `BodyDimensionExplorer.tsx` | Interactive explorer of male/female body dimensions (percentiles: 5th, 50th, 95th). `'use client'` |
| `BodyDimensionDrill.tsx` | Spaced repetition drill for body dimension questions. `'use client'` |
| `DimensionDrill.tsx` | General-purpose dimension flashcard tool. `'use client'` |
| `BedSizeComparator.tsx` | Interactive bed size comparison with dimensions. `'use client'` |
| `BedroomPlanView.tsx` | Top-down 2D bedroom plan view with draggable furniture. `'use client'` |
| `ReachEnvelopeDiagram.tsx` | Visualization of comfortable reach envelope. `'use client'` |
| `SpatialQualityDrill.tsx` | Drill for spatial quality dimension questions. `'use client'` |
| `ProportionComparator.tsx` | Slider to compare proportional dimensions. `'use client'` |
| `DHRatioExplorer.tsx` | Door height ratio explorer. `'use client'` |
| `WorkstationCalculator.tsx` | Ergonomic workstation calculator based on user height. `'use client'` |

## For AI Agents

### Working In This Directory

The wiki is a **structured knowledge base** designed for reference and deep learning between quiz sessions. Articles are authored in Markdown with custom MDX syntax for callouts, widgets, and learning aids.

**Critical constraints:**
1. **Widget registration:** New widgets must be added to `widgets/registry.ts` with a unique namespace (e.g., `bp344/WidgetName`). Do NOT hardcode widget imports in WikiArticle.tsx.
2. **No quiz content in wiki:** The wiki explains *concepts*. Quiz *questions* live separately and link to wiki for rationales.
3. **Citation badges required:** Any AI-generated explanation must include citation badges linking to exact Wiki paragraph IDs.
4. **Reading progress:** Track scroll depth and time spent. Persist to user profile for analytics.
5. **Responsive:** Mobile-first. Sidebar collapses to rail+overlay (like Supabase/GitHub). NEVER use inline collapsible width transitions.

**Pedagogical hooks:**
- **Elaborative Interrogation:** "Why is this true?" prompts activate deeper recall.
- **Teach-Back:** Ask users to explain concepts in their own words.
- **Spaced Repetition:** Inline quizzes and drills within article body.
- **Mistake highlighting:** Common misconceptions paired with correct principles.
- **Related articles:** Link to prerequisites, advanced depth, and alternative explanations.

**Language:** Growth-framed. Avoid "weakness," "gap," "behind." Use "developing skill," "area to revisit," "strengthen understanding."

### Common Patterns

1. **MDX composition:** Articles import MDX components for callouts, formulas, tabs, accordions, widgets, and learning aids. Each component receives `children` (from Markdown) or explicit props.
2. **Widget isolation:** Widgets are standalone client components. They receive article context (nodeId, nodeName) but manage their own state. Use `'use client'` at the top.
3. **Sidebar pattern:** Rail (icon buttons) on left when wide, drawer on mobile. NO inline width transitions. Use Framer Motion for drawer slide.
4. **TOC generation:** Headings (h2, h3) are auto-collected and rendered in right sidebar. Use consistent heading structure.
5. **Note anchors:** User-created notes/highlights are stored in personal workspace and linked back as inline elements with hover previews.
6. **Image & diagram responsive:** Use Next.js Image with responsive sizes. SVG diagrams scale via viewBox.

## Dependencies

### Internal

- `@/types/app` -- WikiArticle, TocHeading, EIPrompt, EIResponseMap, TaxonomyNode
- `@/lib/wiki-markdown` -- extractHeadings(), heading ID generation, Markdown utilities
- `@/lib/actions/ei-prompts` -- Elaborative interrogation prompt fetching
- `@/lib/routes` -- GROUPED_NAVIGATION for sidebar tree
- `@/components/ui/*` -- shadcn/ui (Sheet, Tooltip, etc.)
- `@/components/graphics/icons/Icon` -- SCIcon wrapper for Phosphor
- `@/components/shared/score-display` -- Score display utilities

### External

- `react` (19.x) -- Hooks, Suspense, context
- `next-mdx-remote/rsc` -- Server-side MDX rendering
- `remark-gfm` -- GitHub Flavored Markdown plugin
- `framer-motion` -- Drawer animations, transitions
- `@phosphor-icons/react` -- Icon set
- `katex` -- LaTeX math rendering (FormulaBlock)
- `recharts` (if any charts in widgets)

## Campfire Design System

### Colors & Styling

- **Text:** text-[#1A2332] (primary), text-[#4A5568] (secondary), text-[#8896A7] (tertiary)
- **Borders:** border-[#D4DAE3] (#D4DAE3)
- **Backgrounds:** bg-white (content), bg-[#F8F7F5] (page), callout tints per type (Info Blue, Warm Red, Amber, Emerald with 50 variant)
- **Callout colors:**
  - Note: Info Blue (#3B82C8) + bg-[#F0F6FF] (approx)
  - Warn: Warm Red (#D64545) + bg-[#FDF0F0]
  - Tip: Emerald (#2D9F6F) + bg-[#EDFAF4]
  - Example: Amber (#D4951A) + bg-[#FEF8ED]
- **Shadows:** shadow-sm (cards), shadow-md (popovers)
- **Radii:** rounded-sm (6px), rounded-md (8px)
- **Transitions:** max 300ms, duration-150 ease-out

### Typography

- Minimum text: 11px. NEVER 8/9/10px.
- Monospace ONLY on code, formulas, specifications. NOT on labels.
- Inter via next/font/google.
- Code blocks: light background, line numbers optional, syntax highlighting.

<!-- MANUAL: -->


---


# FILE: .\src\config\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# config

## Purpose

Application configuration and feature flag definitions. Provides portal configuration for admin/developer/CEO shells and zero-latency, config-only feature gating with a resolution order of: dev override > DB value > config default.

## Key Files

| File | Description |
|------|-------------|
| `portals.ts` | Portal configuration -- defines label, basePath, topbarBg, accentColor, accentLightColor, backLabel/backHref for admin, developer, and ceo portals. Exports `PORTALS` const and `PortalKey` type. |
| `feature-flags.ts` | Feature flag definitions -- 3d_lab_access, ai_tutor_access, srs_review_access, org_dashboard, seat_management, dev_badges, dev_console. Categories: access, org, dev. Exports `FEATURE_FLAGS`, `FeatureFlagKey`, `FeatureFlagDefinition`. |

## For AI Agents

### Working In This Directory

- **Portals:** Add new portal shells by adding an entry to the `PORTALS` object in `portals.ts` with all required `PortalConfig` fields
- **Feature flags:** Add to the `FEATURE_FLAGS` object with key, defaultValue, description, and category
- Flag categories: `access` (user-tier gating), `org` (organization features), `dev` (developer tools)
- Resolution order: dev override > database value > config default
- Use `getConfigDefault(key)` to read defaults, `getAllFlags(category?)` to list flags

### Common Patterns

- `as const satisfies Record<string, ...>` for type-safe keys on both portals and flags
- `PortalKey` and `FeatureFlagKey` types derived from `keyof typeof` their respective const objects
- Portal colors use hex values matching the Campfire design system

## Dependencies

### Internal

- Used by `src/components/portal/` -- PortalLayout consumes portal config
- Used by `src/lib/context/` -- flag provider context
- Used by `src/lib/actions/admin/` -- admin flag management
- Used by `src/app/api/admin/flags/` -- API route for dev flag overrides

<!-- MANUAL: -->


---


# FILE: .\src\data\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# data

## Purpose

Static data files and seed scripts for populating the database during development. Contains reference data for taxonomy, questions, 3D models, and mock content.

## Key Files

| File | Description |
|------|-------------|
| `mock-questions.json` | Mock question data for development and testing -- used by demo mode and UI prototyping |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `seed/` | Database seed data files -- `taxonomy.json` (taxonomy tree nodes and hierarchies), `questions.json` (sample questions with IRT parameters), `models_3d.json` (3D model metadata for Lab modules) |

## For AI Agents

### Working In This Directory

- Seed data must match DATABASE_SCHEMA.sql column names and foreign key relationships
- Use `bun run db:seed` to execute seed scripts
- Keep seed data realistic -- use domain-appropriate content for architecture/engineering exams
- `mock-questions.json` is for client-side demo mode; seed JSON files are for database population
- IRT parameters in `questions.json` must include discrimination (a) and difficulty (b) values

### Common Patterns

- Seed files are plain JSON arrays matching table row structures
- `taxonomy.json` defines the full tree: discipline > subject > topic > subtopic
- `models_3d.json` entries reference asset URLs and module slugs used by the 3D Lab

## Dependencies

### Internal

- `DATABASE_SCHEMA.sql` (root) -- authoritative schema reference
- `src/types/supabase.ts` -- Database type definitions
- `supabase/02_RUN_ALL_SEEDS.sql` -- master seed script references this data

<!-- MANUAL: -->


---


# FILE: .\src\features\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# features

## Purpose

Feature-scoped modules organized by domain. Each feature is self-contained with its own components, engine logic, hooks, store, types, and tests. This directory follows a vertical slice architecture — everything related to a feature lives together.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `wall-configurator/` | 3D wall construction configurator with CHB, drywall, plaster, paint, and tile calculation engines (see `wall-configurator/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Each feature is a self-contained module — keep all related code within its directory
- Follow the vertical slice pattern: components/, engine/, hooks/, store/, types/, __tests__/
- Import from the feature's own subdirectories first; use `@/` imports only for shared utilities
- New features should follow the same directory structure as `wall-configurator/`

<!-- MANUAL: -->


---


# FILE: .\src\features\wall-configurator\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# wall-configurator

## Purpose

A 7-step interactive wall construction configurator for the 3D Lab. Users select a core wall type (CHB, drywall), define geometry (height, length, thickness), specify openings (doors, windows), configure sides (interior/exterior), choose treatments (plaster, paint, tile), pick finish materials, and view a Bill of Materials (BOM). All calculations are handled by pure engine functions with no side effects.

## Key Files

| File | Description |
|------|-------------|
| `components/WallConfigurator.tsx` | Root configurator component — orchestrates the 7-step wizard flow |
| `components/AreaSummaryBar.tsx` | Real-time area summary display during configuration |
| `engine/index.ts` | Barrel export for all calculation engines |
| `engine/constants.ts` | Material constants, pricing data, standard dimensions |
| `engine/geometry.engine.ts` | Wall geometry calculations — area, perimeter, net area after openings |
| `engine/chb.engine.ts` | Concrete Hollow Block engine — block count, mortar volume, rebar requirements |
| `engine/drywall.engine.ts` | Drywall engine — board count, framing, fasteners, joint compound |
| `engine/plaster.engine.ts` | Plaster engine — mix ratios, coverage, material quantities |
| `engine/paint.engine.ts` | Paint engine — coverage area, coats, liters needed |
| `engine/tile.engine.ts` | Tile engine — tile count, adhesive, grout, wastage factor |
| `engine/packaging.engine.ts` | Packaging engine — rounds up material quantities to purchasable units |
| `hooks/useWallComputation.ts` | React hook bridging store state to engine computations |
| `store/useWallConfigStore.ts` | Zustand store for wall configuration state (steps, selections, geometry) |
| `store/layer-defaults.ts` | Default layer configurations per wall type |
| `types/wall.types.ts` | TypeScript definitions for wall config, materials, BOM items |
| `__tests__/engine-validation.test.ts` | Unit tests for engine calculation accuracy |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `components/` | UI components for the configurator wizard |
| `components/steps/` | Step-specific components (Step1CoreSelect through Step7BOM) |
| `engine/` | Pure calculation engines — no side effects, easily testable |
| `hooks/` | React hooks for bridging store to engine |
| `store/` | Zustand state management for configurator |
| `types/` | TypeScript type definitions |
| `__tests__/` | Unit tests for engine validation |

## For AI Agents

### Working In This Directory
- **Engine functions are pure** — they take input parameters and return computed results with no side effects or database access
- **7-step wizard flow**: CoreSelect → Geometry → Openings → Sides → Treatment → Finish → BOM
- **All calculations use Philippine construction standards** — material sizes, pricing in PHP, local building practices
- **Zustand store** (`useWallConfigStore`) holds all wizard state — steps navigate by updating store
- **Hook pattern**: `useWallComputation` reads store state and calls engine functions reactively
- **Constants** in `engine/constants.ts` define material specs — update here for pricing/dimension changes

### Testing Requirements
- Run `bun test src/features/wall-configurator/__tests__/` for engine validation
- All engine functions must be testable without React — they're pure functions
- Test edge cases: zero-area walls, maximum openings, unusual dimensions

## Dependencies

### Internal
- `@/components/ui/*` — shadcn/ui primitives for wizard UI
- `@/stores/useLabStore` — Parent 3D Lab state (module context)
- `@/types/3d-lab` — Module configuration types

### External
- `zustand` — State management for wizard flow
- `react` — Component rendering
- `lucide-react` — Step icons

<!-- MANUAL: -->


---


# FILE: .\src\hooks\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# hooks

## Purpose

Custom React hooks organized by feature domain. Provides reusable stateful logic for quiz sessions, note-taking, compliance checks, guided sequences, and 3D Lab telemetry.

## Key Files

| File | Description |
|------|-------------|
| `useComplianceCheck.ts` | Building code compliance validation -- evaluates parametric values against code thresholds using LabStore, returns ComplianceState |
| `useGuidedSequence.ts` | Step-by-step guided learning sequence controller -- manages hotspot sequencing during guided exploration mode in the 3D Lab |
| `useLabTelemetry.ts` | 3D Lab behavioral event tracking -- tracks disorientation, idle, linger, erratic rotation, and zoom cycle signals for adaptive scaffolding |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `notes/` | Note-taking hooks (3 hooks + barrel index) -- `useNoteEditor` (CRUD, autosave), `useNotesList` (stubs state, filter-driven refetching), `useNotesPanels` (panel collapse states, keyboard shortcuts, localStorage persistence) |
| `quiz/` | Quiz session hooks (4 hooks + barrel index) -- `useQuizState` (answer tracking, option states, navigation), `useQuizPersistence` (localStorage + Supabase autosave), `useQuizTimer` (strict/flexible timer with per-question and total modes), `useQuizTelemetry` (interaction logging, confidence tracking) |

## For AI Agents

### Working In This Directory

- Hooks must follow React rules (call order, dependency arrays)
- Use arrow function syntax for all hook definitions
- Prefix all hooks with `use`
- Keep hooks focused on a single concern -- split if a hook exceeds ~100 lines
- Additional shared hooks live in `src/lib/hooks/` -- check there before creating duplicates
- All hooks in `notes/` and `quiz/` are `'use client'` components

### Common Patterns

- Feature-specific hooks are grouped in subdirectories (`notes/`, `quiz/`)
- Barrel exports via `index.ts` in each subdirectory
- General-purpose hooks go in `src/lib/hooks/` instead
- Hooks that need Supabase access use Server Actions from `@/lib/actions/`
- 3D Lab hooks consume state from `@/stores/useLabStore`

## Dependencies

### Internal

- `src/lib/supabase/` -- Database access (via Server Actions)
- `src/lib/actions/` -- `notes-actions`, `quiz` Server Actions
- `src/types/` -- Shared type definitions (`app.ts`, `3d-lab.ts`)
- `src/stores/useLabStore` -- 3D Lab global state (used by useComplianceCheck, useGuidedSequence)
- `src/lib/lab-analytics` -- Event tracking (used by useLabTelemetry)

### External

- `react` -- useState, useEffect, useCallback, useMemo, useRef

<!-- MANUAL: -->


---


# FILE: .\src\lib\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-04-02 -->

# lib

## Purpose

The `src/lib` directory contains all business logic, utilities, and service integrations for SlateCamp. This is a discipline-agnostic, high-performance study engine for professional licensure exams, built with Next.js, React, Supabase, and Three.js.

All data mutations flow exclusively through **Server Actions** in `actions/`. No direct database writes from components.

## Key Files

| File | Description |
|------|-------------|
| `utils.ts` | Utility exports: `cn()` for Tailwind class merging (use `clsx` + `twMerge`, never string concat) |
| `routes.ts` | Single source of truth for dashboard route configs—labels, icons, groups, and navigation structure |
| `analytics.ts` | Client-side event tracking (page views, interactions, feature usage) |
| `analytics-server.ts` | Server-side event tracking (async event dispatch to analytics backend) |
| `lab-analytics.ts` | 3D Lab analytics: spatial interaction tracking, performance metrics for Three.js/R3F |
| `readiness-score.ts` | Readiness Score calculation engine using IRT 2-parameter logistic model with 6 anti-inflation vectors (pure function, no DB access) |
| `rate-limit.ts` | Rate limiting implementation (prevents abuse of APIs and endpoints) |
| `wiki-markdown.ts` | Wiki markdown processing: parsing, citation extraction, formatting for display |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `actions/` | **Server Actions only.** 116 files across root + admin/ (13 files), ceo/ (4 files), dev/ (2 files), analytics/ (5 files), mastery/ (5 files), quiz-v2/ (18 files), daily-dose/ (2 files), progress-report/ (2 files), wiki/ (2 files), ai/ (1 file) handling ALL data mutations. Never access DB from components; always route through actions. |
| `admin/` | Admin-specific logic: role checks, permission gates, admin profile retrieval, feature flags. |
| `ai/` | AI contextual tutor integration (Anthropic API). Temperature 0.0. Mandatory citation badges. Prompts and provider abstraction. |
| `audio/` | Audio playback utilities for feedback sounds and ambient cues. |
| `audit/` | Audit trail logging: action tracking, user behavior logs for compliance and debugging. |
| `blindspot/` | Blindspot detection algorithm: identifies weak knowledge areas by analyzing question patterns and mastery data. |
| `constants/` | Centralized constants: site config, design tokens (Campfire palette), enums, pricing, analytics event names, readiness thresholds. |
| `context/` | React Context providers: auth, user profile, feature flags, theme, modal state, demo mode. |
| `demo/` | Demo mode utilities: mock Supabase client, config flags, fake data generation. |
| `dev/` | Developer utilities: dev mode flags, debug helpers, test data generation. |
| `endurance/` | Extended practice session logic: session scheduling, streak tracking, difficulty adaptation. |
| `hooks/` | Shared React hooks: `useToast`, `useDraggableFloatingPosition`, `useFeatureFlag`, `useUserRole`. |
| `import/` | Data import utilities: CSV parsing, question import schema, validation. |
| `notes/` | Note system logic: image uploads, note persistence, attachments. |
| `outcomes/` | Exam outcome predictions: scoring models, pass/fail estimation. |
| `payments/` | Payment provider abstraction: routes checkout to Stripe or PayRex based on `PAYMENT_PROVIDER` env var. |
| `payrex/` | PayRex payment gateway config: singleton client, PHP plans (centavos), GCash/Maya/QRPH support. |
| `paywall/` | Paywall and access control: daily cap enforcement, score reveal gates, feature paywalls. |
| `proof-simulation/` | Full exam simulation logic: full-length test mode, timer, review rules. |
| `readiness/` | Readiness score details: velocity tracking, churn detection, threshold logic. |
| `signals/` | User learning signals: learning velocity, struggle indicators, mastery signals. |
| `queries/` | Read-only query functions for server components (NOT server actions). Trail queries + ceo/ subdir for CEO portal reads. |
| `srs/` | **Spaced Repetition System.** 7 files: IRT 2-parameter logistic model, SM2 algorithm, retention curves, review queue scheduling. Core mastery algorithm. |
| `stripe/` | Stripe payment gateway config: singleton client, PHP plans, price IDs from env vars. |
| `supabase/` | Supabase client and utilities: browser client, server client, middleware, admin client, type definitions, error formatting. |
| `utils/` | General utilities: text processing, constants, helper functions, wiki utilities. |
| `validations/` | Zod validation schemas: request body validation, form input schemas. |
| `wiki/` | Wiki article lifecycle: CRUD with SME review workflow (draft -> review -> approved -> published). |
| `quiz/` | Quiz engine logic (19 files): question selection algorithms, session management, mode orchestration, offline support. |
| `pd1096/` | PD 1096 (Philippine Building Code) calculation logic (6 files): setback computation, building height, lot occupancy, FLAR. |
| `lot-geometry/` | Lot geometry calculations (5 files): site planning, setback visualization, area computation. |
| `cage/` | CAGE content assessment framework (5 files): question quality, content grading, assessment metrics. |
| `inference/` | Statistical inference (3 files): learning analytics, pattern detection, predictive modeling. |
| `adaptive/` | Adaptive learning algorithms (1 file): difficulty adjustment, personalized sequencing. |
| `workflow/` | Workflow and pipeline logic: content orchestration, async processing. |
| `__tests__/` | Unit tests and integration tests. |

## For AI Agents

### Working In This Directory

**Before writing any code:**

1. **Check the Agent Protocol.** Read `.claude/agents/` for domain-specific persona rules (e.g., `db-architect.md`, `quiz-engineer.md`).
2. **Check the Skills.** Apply universal constraints from `.claude/skills/` (e.g., `enforce-server-components`, `clean-code`).
3. **Verify against PRDs.** Consult `.claude/docs/` blueprints and PRDs to understand the _why_ before building.
4. **Check DATABASE_SCHEMA.sql.** Never hallucinate tables, columns, or foreign keys—read the actual schema.

**Mutation Rule (CRITICAL):**
- **ALL data mutations MUST go through Server Actions in `actions/`.** Do not access the database directly from React components. Components call Server Actions, which handle all Supabase writes.
- Server Actions use `'use server'` directive and live in `actions/` subdirectories.

**IRT Mastery Calculations (CRITICAL):**
- All mastery and difficulty calculations use the **2-parameter logistic IRT model** defined in `srs/irt.ts`.
- Probability formula: `P(correct | θ, a, b) = 1 / (1 + exp(-a * (θ - b)))`
- Theta = student ability, a = discrimination, b = difficulty.
- Never implement ad-hoc mastery scoring; use `srs/irt.ts` functions.

**Readiness Score (CRITICAL):**
- Implements 6 anti-inflation vectors in `readiness-score.ts` (pure function):
  1. Diminishing returns on consecutive correct streaks
  2. Difficulty ceiling (score capped until Level 3/4 questions answered correctly)
  3. Grey node penalty (unvisited nodes drag score down)
  4. Bloom's cognitive level ceiling (recall-only practice capped)
  5. Question bank depth weight (thin coverage reduces contribution)
  6. Recency decay (stale mastery counts less)
- Called from `readiness-score-update.ts` Server Action (DB reads happen in the action, not in the pure function).

**AI Tutor (CRITICAL):**
- Temperature MUST be 0.0 (deterministic output).
- Always include mandatory citation badges linking to exact Wiki paragraphs.
- Use structured rationales from questions (Misconception vs. Principle) to tailor responses.
- Implemented in `ai/provider.ts` (Anthropic or OpenAI abstraction).

**Design System (Campfire):**
- Colors: Camp Cobalt (`#1B3FC4`), Camp Orange (`#E8853A`), Emerald (`#2D9F6F`), Warm Red (`#D64545`), Amber (`#D4951A`).
- Typography: Inter font, minimum 11px text size (never `text-[8px]`, `text-[9px]`, `text-[10px]`).
- Shadows: `shadow-none` for cards at rest, `shadow-sm` on hover, `shadow-md` for dropdowns, `shadow-lg` for modals.
- Border radii: `rounded-md` (8px) for cards, `rounded-sm` (6px) for buttons/inputs, `rounded-lg` (12px) for modals.
- Transitions: max 300ms, `duration-150 ease-out` default. Never use `bounce` or `spring` easing.
- See `constants/` for Campfire design tokens.

**Voice & Tone (Campfire):**
- Words to avoid: "Blindspot Protocol" → "Focus Review"; "Endurance Cycle" → "Extended Practice"; "drill/grind" → "practice/review/session".
- Growth-framed copy: "42 topics covered" not "58 remaining"; "area to revisit" not "weakness".
- Never use "pass" as a guaranteed outcome in headlines; use "Know you'll win."

**Arrow Functions Only:**
- Always use arrow functions: `const fn = () => {}` never `function fn() {}`.

**Common Patterns:**

#### Creating a Server Action
```typescript
'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics-server'

export const myMutation = async (payload: MyInput): Promise<MyOutput> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // DB write via Supabase
  const { data, error } = await supabase
    .from('my_table')
    .insert({ user_id: user.id, ...payload })
    .single()

  if (error) throw new Error(error.message)

  // Track event (async, can fire-and-forget)
  trackServerEvent('action_completed', {
    userId: user.id,
    timestamp: new Date().toISOString(),
  })

  return data
}
```

#### Using Readiness Score
```typescript
import { computeReadinessScore } from '@/lib/readiness-score'
import { getReadinessData } from '@/lib/actions/readiness-score-update'

// In a Server Action:
const data = await getReadinessData(userId) // fetch from DB
const { overallScore, subScores } = computeReadinessScore(data)
```

#### IRT Mastery Query
```typescript
import { probabilityCorrect, selectNextQuestion } from '@/lib/srs/irt'

const userTheta = 0.5 // student ability estimate
const question = { difficulty_rating: 0.2, discrimination_rating: 1.5 }
const prob = probabilityCorrect(userTheta, 1.5, 0.2) // ≈ 0.75
```

#### Client-Side Analytics
```typescript
'use client'

import { trackEvent } from '@/lib/analytics'

const handleQuestionAnswered = (questionId: string, isCorrect: boolean) => {
  trackEvent('question_answered', {
    question_id: questionId,
    is_correct: isCorrect,
    timestamp: new Date().toISOString(),
  })
}
```

#### Supabase Query (Server Action)
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export const getUserQuizzes = async () => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw new Error(error.message)
  return data
}
```

#### Using a Hook
```typescript
'use client'

import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag'

const MyComponent = () => {
  const isNewUIEnabled = useFeatureFlag('new_ui_v2')

  if (!isNewUIEnabled) return <OldUI />
  return <NewUI />
}
```

#### Validating Input (Zod)
```typescript
'use server'

import { z } from 'zod'
import { validateInput } from '@/lib/validations'

const CreateQuizSchema = z.object({
  name: z.string().min(1).max(255),
  questionCount: z.number().int().min(1).max(100),
  difficulty: z.enum(['easy', 'medium', 'hard']),
})

export const createQuiz = async (input: unknown) => {
  const validated = CreateQuizSchema.parse(input) // throws if invalid
  // proceed with validated data
}
```

### Common Patterns

**Server Actions (Data Mutations):**
- Location: `actions/` subdirectories.
- Always mark with `'use server'` directive.
- Call `createClient()` to get Supabase instance (server-side version).
- Call `getUser()` to get current user.
- Throw meaningful errors; let Next.js error boundary catch.
- Fire `trackServerEvent()` for analytics (async, non-blocking).

**Pure Calculations:**
- Functions like `readiness-score.ts`, `srs/irt.ts` are pure functions with no side effects.
- Database reads happen in the calling Server Action, not in the pure function.
- Tests should run without DB access; use mocked input objects.

**React Hooks:**
- Hooks live in `hooks/`.
- Use React hooks for client-side state (feature flags, user role, toast messages).
- Never access Supabase directly from hooks; call Server Actions instead.

**Constants & Config:**
- Design tokens (colors, spacing) in `constants/design.ts` or similar.
- Site configuration in `constants/index.ts`.
- Centralize all magic strings and numbers to avoid duplication.

**Error Handling:**
- Supabase errors are caught and logged.
- Use `supabase/format-error.ts` to format errors consistently.
- Never expose raw DB errors to the client; sanitize messages.

**Testing:**
- Tests live in `__tests__/` or co-located with source (e.g., `file.test.ts`).
- Use unit tests for pure functions (IRT, readiness score).
- Use integration tests for Server Actions (mock Supabase).

## Dependencies

### Internal

- **Supabase:** Database, auth, real-time subscriptions. Client created via `createClient()` (browser) or `createServerClient()` (server).
- **Analytics:** Event tracking via `analytics.ts` (client) and `analytics-server.ts` (server).
- **IRT Model:** Mastery calculations via `srs/irt.ts` (2-parameter logistic).
- **Readiness Score:** Anti-inflation scoring via `readiness-score.ts` (pure function).
- **AI Tutor:** Contextual help via `ai/provider.ts` (Anthropic/OpenAI, Temperature 0.0).
- **Validation:** Input schemas via `validations/` (Zod).
- **Routes:** Navigation metadata via `routes.ts` (SSOT for dashboard routes).

### External

- **Next.js:** App Router, Server Actions, middleware.
- **React:** Components, hooks, context.
- **Tailwind CSS 4:** Utility-first styling. Use `cn()` helper for class merging.
- **shadcn/ui:** Base UI components from @base-ui/react.
- **Three.js & React Three Fiber:** 3D Lab spatial computing (target 60 FPS).
- **Anthropic / OpenAI:** LLM providers for AI tutor.
- **Zod:** Schema validation for runtime type checking.
- **Zustand:** (Optional) Client-side state management.

---

**Last Updated:** 2026-03-25

**For questions or updates to this guide, consult `.claude/agents/` and `.claude/docs/` in the repository root.**


---


# FILE: .\src\lib\actions\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-04-02 -->

# actions

## Purpose

Data mutation layer for SlateCamp. All CRUD operations on user data, quizzes, questions, wiki articles, taxonomy, notes, and analytics flow through **Server Actions** (`'use server'`) defined here. This is the single point of mutation for the application state.

## Key Files

| File | Description |
|------|-------------|
| **quiz.ts** | Quiz session creation, retrieval, answer submission, SRS updates, readiness recomputation |
| **assessment.ts** | Assessment completion checks, result retrieval, subject score breakdown |
| **analytics.ts** | Server-side event tracking, analytics data aggregation |
| **daily-mission.ts** | Daily mission generation, completion tracking, rewards |
| **dashboard.ts** | Dashboard data aggregation (readiness, catalysts, recent activity) |
| **dashboard-page.ts** | Page-level dashboard queries and data transformation |
| **dashboard-helpers.ts** | Helpers for dashboard data computation |
| **mastery.ts** | Subject mastery retrieval, taxonomy node mastery tracking |
| **mastery-actions.ts** | Mastery-related mutations |
| **debrief.ts** | Quiz debrief/summary data after session completion |
| **readiness-score-update.ts** | Readiness score calculation and persistence |
| **readiness.ts** | Readiness data queries for dashboard display |
| **heatmap.ts** | Taxonomy heatmap/performance distribution data |
| **notes-actions.ts** | User note CRUD operations |
| **feature-flags.ts** | Feature flag checks and overrides |
| **final-stretch.ts** | Final review/cram session logic |
| **lab.ts** | 3D lab interaction and state |
| **ei-prompts.ts** | Educational instant (AI tutor) prompt management |
| **email-preferences.ts** | Email subscription/notification preferences |
| **onboarding.ts** | User onboarding flow and profile setup |
| **profile.ts** | User profile reads and updates |
| **session-actions.ts** | Session lifecycle: create, pause, resume, complete |
| **session-discovery.ts** | Session discovery and filtering for review hub |
| **session-insights.ts** | Post-session insight computation |
| **sessions.ts** | Session listing and history queries |
| **social-proof.ts** | Social proof metrics (user counts, activity) |
| **srs-dashboard.ts** | SRS dashboard data: review queue, schedule stats |
| **srs-review.ts** | SRS review session handling |
| **stats-actions.ts** | User statistics mutations and aggregation |
| **streak.ts** | Study streak tracking and persistence |
| **taxonomy.ts** | Taxonomy tree queries for quiz and navigation |
| **teach-back.ts** | Teach-back prompt generation and validation |
| **testing.ts** | Test mode session configuration (Camp, Storm, Chill) |
| **trails.ts** | Learning trail mutations: enroll, pause, abandon, complete |
| **user-stats.ts** | User global stats computation and caching |
| **wiki.ts** | Wiki article queries for student-facing views |
| **wiki-actions.ts** | Wiki interaction tracking (reads, bookmarks) |
| **wiki-bookmarks.ts** | Wiki bookmark CRUD |
| **wiki-reads.ts** | Wiki read tracking and history |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| **admin/** | Admin-only mutations: 13 files for questions, wiki, taxonomy, assets, bulk ops, roles, pipeline, coverage, content, dashboard. See `admin/AGENTS.md`. |
| **analytics/** | Analytics data aggregation and reporting: 5 files for performance tracking, session analytics, user behavior metrics. |
| **ai/** | AI tutor server actions: prompt dispatch, citation-verified responses. |
| **ceo/** | CEO portal mutations: 4 files for financial entries, team management, investor export. See `ceo/AGENTS.md`. |
| **daily-dose/** | Daily practice dose: 2 files for daily question selection and completion tracking. |
| **dev/** | Development/test utilities: test data generation, database viewer tools. |
| **mastery/** | Mastery calculations: 5 files for IRT theta updates, subject mastery aggregation, taxonomy node scoring. |
| **progress-report/** | Progress reporting: 2 files for periodic progress summary generation and delivery. |
| **quiz-v2/** | V2 quiz engine actions: 18 files for config-driven session creation, question fetching, answer processing, results computation, mode-specific behaviors. |
| **wiki/** | Wiki content actions: 2 files for article queries, bookmark management. |

## For AI Agents

### Working In This Directory

1. **Always use `'use server'`** at the top of action files for Server Actions.
2. **Read from Supabase** using `createClient()` from `@/lib/supabase/server` for authenticated queries.
3. **Admin mutations** use `createAdminClient()` from `@/lib/supabase/admin` (service role key).
4. **Validation** occurs before mutation — use Zod schemas from `@/lib/validations`.
5. **Revalidate cache** after mutations using `revalidatePath()` from `next/cache`.
6. **Silent failures on SRS** — SRS updates must not throw or block the quiz; catch and log only.
7. **Track analytics** — wrap user actions with `trackServerEvent()` from `@/lib/analytics-server`.

### Common Patterns

**User authentication context:**
```typescript
'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export async function myAction() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Perform mutation
  const { error } = await supabase
    .from('table_name')
    .insert([{ user_id: user.id, ... }])

  // Revalidate
  revalidatePath('/dashboard')
  return { error }
}
```

**Admin-only operations:**
```typescript
// In admin/ subdirectory
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function deleteQuestion(questionId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('question_id', questionId)

  if (!error) {
    revalidatePath('/admin/questions')
  }

  return { error }
}
```

**SRS updates (silent on failure):**
```typescript
import { updateSrsSchedule } from '@/lib/srs/update'

// Inside answer submission
try {
  await updateSrsSchedule(userId, topicId, qualityRating)
} catch (err) {
  // Log but do not throw — SRS must not block quiz
  console.error('SRS update failed:', err)
}
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient, getUser, authenticated queries
- `@/lib/supabase/admin` — createAdminClient, service-role mutations
- `@/lib/analytics-server` — trackServerEvent
- `@/lib/srs/update` — updateSrsSchedule, deriveQualityRating
- `@/lib/signals/compute` — computeUserSignals
- `@/lib/paywall/daily-cap` — checkDailyCap, incrementDailyCount
- `@/lib/endurance/compute` — computeAccuracyByBlock, updateEnduranceSignals
- `@/lib/validations` — Zod schemas for input validation
- `@/types/app` — TypeScript interfaces (QuizSession, Question, TestMode, etc.)

### External

- `@supabase/supabase-js` — Supabase client
- `next/cache` — revalidatePath, revalidateTag
- `zod` — input validation


---


# FILE: .\src\lib\actions\admin\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# actions/admin

## Purpose

Admin-only server actions for content management, user role administration, and dashboard analytics. All mutations require role authorization via `canManageContent()` or `canManageUsers()` before execution. Uses `createAdminClient()` (service role) for privileged writes and `createClient()` for authenticated reads.

## Key Files

| File | Description |
|------|-------------|
| **assets.ts** | 3D model asset CRUD: `getAssets()`, `getAsset(id)`, upload, update, delete. Reads from `models_3d` table. |
| **bulk.ts** | Bulk delete operations: `bulkDeleteQuestions(ids)`, `bulkDeleteArticles(ids)`. Revalidates admin paths after deletion. |
| **content.ts** | MDX preview compilation via `next-mdx-remote`, content index page query, article listing with metadata. |
| **coverage.ts** | Taxonomy coverage analysis: maps taxonomy nodes to question counts and article presence. Exports `CoverageCellData` and `CoverageLevel` types. |
| **dashboard.ts** | Admin dashboard stats: `getAdminStats()` (question/wiki/asset counts), `getAdminDashboardData()` (full dashboard with audit logs). |
| **pipeline.ts** | Article publishing pipeline: `getPipelineArticles()`, `updateArticleStatus()` (draft/review/published transitions). |
| **question-queries.ts** | Question library queries: `getQuestions()`, `getQuestionsForAnalytics()`. Ensures `options` is always an array. |
| **questions.ts** | Question mutations: `deleteQuestions(ids)`, create/update questions with Zod validation. Uses admin client for writes. |
| **roles.ts** | User role management: `getAdminUsers()`, `assignRole()`, `removeRole()`. Requires `canManageUsers()` (super_admin only). |
| **taxonomy.ts** | Taxonomy node CRUD: `getTaxonomyNodes()`, `updateTaxonomyNode()`. Zod-validated name updates. |
| **wiki-queries.ts** | Wiki article queries with coverage: `getArticlesWithCoverage()` joins articles with taxonomy mappings and question counts. |
| **wiki.ts** | Wiki article mutations: `updateWikiArticle()`, `createWikiArticle()`, `deleteWikiArticle()`. Zod-validated, audit-logged. |

## For AI Agents

### Working In This Directory

1. **Authorization is mandatory.** Every mutation must call `canManageContent()` or `canManageUsers()` before DB writes.
2. **Use `createAdminClient()`** for privileged writes (service role key). Use `createClient()` for authenticated reads.
3. **Revalidate paths** after mutations: `revalidatePath('/admin/questions')`, `revalidatePath('/admin/content')`, etc.
4. **Zod validation** before any insert/update. Parse with `.safeParse()` and return structured errors.
5. **Coverage queries** are read-only (no `'use server'` needed for pure query files like `coverage.ts`, `question-queries.ts`, `wiki-queries.ts`).

### Common Patterns

**Authorized mutation:**
```typescript
'use server'

import { canManageContent } from '@/lib/admin/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export const myAdminAction = async (id: string) => {
  const authorized = await canManageContent()
  if (!authorized) return { error: 'Unauthorized' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('table_name')
    .update({ field: 'value' })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { error: null }
}
```

## Dependencies

### Internal

- `@/lib/admin/roles` -- `canManageContent()`, `canManageUsers()` authorization checks
- `@/lib/supabase/server` -- `createClient()` for authenticated reads
- `@/lib/supabase/admin` -- `createAdminClient()` for service-role writes
- `@/lib/audit/audit-queries` -- `AuditLog` type for dashboard data
- `@/types/ceo` -- shared types

### External

- `next/cache` -- `revalidatePath`
- `next-mdx-remote/serialize` -- MDX compilation (content.ts)
- `remark-gfm` -- GitHub-flavored markdown
- `zod` -- input validation


---


# FILE: .\src\lib\actions\ai\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# ai

## Purpose

AI tutor and mnemonic generation server actions. Provides context-aware AI completions for educational purposes, including mnemonic generation for frequently missed facts.

## Key Files

| File | Description |
|------|-------------|
| **generate-mnemonic.ts** | Generate culturally-relevant mnemonics for missed facts using AI: encodes key information, uses Filipino cultural references (foods, landmarks, Tagalog wordplay), phonetically sticky (rhythm, rhyme, alliteration) |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Temperature = 0.0** — all AI completions use deterministic generation (no randomness) for reproducible mnemonics.
3. **Demo mode fallback** — check `isDemoMode()` before calling AI provider; return static demo mnemonic if in demo.
4. **Max tokens limiting** — set `maxTokens: 80` to keep mnemonics short (< 20 words).
5. **Error graceful** — if AI provider fails, return a helpful text string (e.g., "Try creating your own acronym...") rather than throwing.
6. **Cultural context** — for Filipino board exams, weave in local references: foods (adobo, lumpia), landmarks (Intramuros, Pagsanjan Falls), Tagalog wordplay, common phrases.

### Common Patterns

**Mnemonic generation with demo mode and error handling:**
```typescript
'use server'

import { getAIProvider } from '@/lib/ai/provider'
import { isDemoMode } from '@/lib/demo/config'

const DEMO_MNEMONICS: Record<string, string> = {
  default: 'Think "BAHAY" — B for Beam depth, A for Area load, H for Height limit...',
}

const SYSTEM_PROMPT = `You are a mnemonic generator for Filipino architecture board exam students.

TASK: Create ONE memorable mnemonic device for the given fact/concept.

RULES:
- Use Filipino cultural references when possible (local foods, landmarks, Tagalog wordplay).
- Keep it under 20 words.
- Make it phonetically sticky — rhythm, rhyme, alliteration, or acronyms.
- Do NOT explain the mnemonic. Just output the mnemonic text, nothing else.`

export const generateMnemonic = async (
  factToRemember: string,
  topicName: string,
): Promise<string> => {
  if (isDemoMode()) {
    return DEMO_MNEMONICS.default
  }

  const ai = getAIProvider()

  try {
    const prompt = `Topic: ${topicName}\nFact to remember: ${factToRemember}\n\nGenerate a mnemonic:`

    const mnemonic = await ai.generateCompletion(prompt, {
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 80,
      temperature: 0,  // Deterministic
    })

    return mnemonic.trim()
  } catch (error) {
    console.error('Mnemonic generation error:', error)
    // Return helpful fallback text rather than crashing
    return 'Try creating your own acronym from the key terms — it sticks better when you make it yourself.'
  }
}
```

## Dependencies

### Internal

- `@/lib/ai/provider` — getAIProvider
- `@/lib/demo/config` — isDemoMode

### External

- AI provider SDK (OpenAI, Anthropic, or Vercel AI SDK depending on implementation)


---


# FILE: .\src\lib\actions\analytics\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# analytics

## Purpose

Server actions for analytics dashboard data retrieval. Computes and fetches learning metrics including forgetting curves, stamina heatmaps, difficulty-mastery relationships, study velocity, pacing-accuracy correlations, and exam countdown signals.

## Key Files

| File | Description |
|------|-------------|
| **chart-data.ts** | Main analytics aggregation: forgetting curves, stamina heatmap, difficulty-mastery scatter, study velocity, pacing-accuracy, exam countdown data |
| **get-calibration-data.ts** | Confidence calibration metrics: calibration score, Brier score, confidence accuracy breakdown (confident/guessing/partly), overconfidence/underconfidence indices |
| **get-error-patterns.ts** | Error classification trends and aggregation by category, topic, and session mode |
| **get-review-calendar.ts** | Spaced repetition review schedule visualization: due cards by date, review distribution |
| **get-memory-strength-data.ts** | Storage strength and retrieval strength trends per topic over time |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** at the top of all action files.
2. **Auth required** — all actions check `getUser()` and return empty/null data if unauthenticated.
3. **Parallel queries** — fetch independent signals concurrently with `Promise.all()` to minimize round trips.
4. **Type exports** — each action exports its own interface (e.g., `ForgettingCurveData`, `CalibrationData`).
5. **Aggregation pattern** — `getAnalyticsDashboardData()` in chart-data.ts fetches all metrics in parallel and returns a combined object.
6. **No mutations** — analytics actions are read-only. No revalidatePath calls.
7. **Graceful empty states** — return empty arrays/objects with sensible defaults if no data exists for the user.

### Common Patterns

**Fetching user-specific metrics with auth:**
```typescript
'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export const getMetricData = async (): Promise<MetricType | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const { data } = await supabase
    .from('table_name')
    .select('...')
    .eq('user_id', user.id)

  return transformData(data)
}
```

**Parallel aggregation of multiple signals:**
```typescript
const [signal1, signal2, signal3] = await Promise.all([
  fetchSignal1(supabase, user.id),
  fetchSignal2(supabase, user.id),
  fetchSignal3(supabase, user.id),
])

return {
  signal1,
  signal2,
  signal3,
}
```

**Computing derived metrics (e.g., decay rate from mastery):**
```typescript
const withDecay = masteryData.map(m => ({
  ...m,
  decayRate: Math.LN2 / halfLife,
  optimalReviewDay: -Math.log(threshold / 100) / decayRate,
}))
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient, getUser
- `@/lib/constants/analytics` — PACING_TARGET_MS, PASSING_ACCURACY, color helpers
- `@/lib/quiz/answer-matching` — matchGenerationAnswer
- `@/lib/utils/question` — resolveRationaleText, normalizeOptions
- `@/types/quiz-config` — TypeScript types for quiz sessions, questions, test modes

### External

- `@supabase/supabase-js` — Supabase client
- Built-in Node.js: `Date`, `Math` for calculations


---


# FILE: .\src\lib\actions\ceo\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# actions/ceo

## Purpose

CEO portal server actions for financial management, team administration, and investor report generation. All actions require CEO or super_admin role, verified via `assertCeoRole()` from `@/lib/queries/ceo/auth`. Financial data uses Philippine Peso (PHP) as the base currency.

## Key Files

| File | Description |
|------|-------------|
| **export-actions.ts** | `generateInvestorExport()` -- builds a markdown investor report combining financial summary, team data, paying/total user counts, and churn metrics. |
| **financial-actions.ts** | `addFinancialEntry()` -- creates revenue/expense/investment entries. Zod-validated with `entry_date`, `entry_type`, `category`, `amount_php`, `description`, `is_recurring`. |
| **team-actions.ts** | `addTeamMember()`, `updateTeamMember()`, `removeTeamMember()` -- CRUD for `ceo_team_members` table. Validates department, system role, monthly cost. |

## For AI Agents

### Working In This Directory

1. **CEO role gate.** Every action calls `assertCeoRole()` which throws on unauthorized access. Do not add redundant auth checks.
2. **Currency is PHP.** All financial amounts are in Philippine Peso. Field names use `_php` suffix (e.g., `amount_php`, `monthly_cost_php`).
3. **FormData input.** Actions accept `FormData` for form submissions, parsed through Zod schemas.
4. **Revalidate `/ceo/*` paths** after mutations using `revalidatePath()`.
5. **Read queries live in `@/lib/queries/ceo/`**, not here. This directory is mutations only.

### Common Patterns

**CEO-gated mutation:**
```typescript
'use server'

import { assertCeoRole } from '@/lib/queries/ceo/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const myCeoAction = async (formData: FormData) => {
  const { user } = await assertCeoRole() // throws if not CEO
  const supabase = await createClient()

  // mutation logic...

  revalidatePath('/ceo')
  return { success: true }
}
```

## Dependencies

### Internal

- `@/lib/queries/ceo/auth` -- `assertCeoRole()` authorization
- `@/lib/queries/ceo/financial-queries` -- `getFinancialSummary()` for export
- `@/lib/queries/ceo/team-queries` -- `getTeamMembers()` for export
- `@/lib/supabase/server` -- `createClient()` for DB access
- `@/types/ceo` -- `SystemRole`, `formatPeso`, `formatPercent`

### External

- `next/cache` -- `revalidatePath`
- `zod` -- input validation


---


# FILE: .\src\lib\actions\daily-dose\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# daily-dose

## Purpose

Server actions for daily practice dose generation. Analyzes user signals (weak topics, overdue SRS, decaying nodes, exam countdown) and recommends a prioritized list of activities (quiz, SRS review, or timed practice) tailored to time budget.

## Key Files

| File | Description |
|------|-------------|
| **generate.ts** | Main dose generator: fetches weak nodes, overdue SRS, decaying mastery, exam date, recent topics, and avg session time, then builds prioritized activities list |
| **actions.ts** | Additional actions: adjust dose to time budget, persist dose preferences, fetch dose history |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Auth check** — generateDailyDose takes userId directly (not relying on getUser) to allow dashboard caching; validate user context at caller.
3. **Parallel signals** — use `Promise.all()` to fetch all signals (weak nodes, SRS, decay, exam date, recent topics, session history) concurrently.
4. **Priority ranking** — build activities in priority order: overdue SRS → decaying → weak nodes → exam countdown → fallback.
5. **Time clamping** — respect budget with `clampMinutes()` and stop adding activities once budget is exhausted.
6. **Rationale segments** — build human-readable explanation of why each activity was recommended.
7. **No mutations** — dose generation is read-only. Actions persist preferences separately if needed.

### Common Patterns

**Parallel signal fetching:**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

const [weakNodesResult, overdueSrsResult, decayingNodesResult, examDateResult] = await Promise.all([
  supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, taxonomy_tree(name, subject_area)')
    .eq('user_id', userId)
    .gt('total_attempts', 0)
    .order('current_mastery_weight', { ascending: true })
    .limit(5),
  supabase
    .from('user_srs_cards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lt('next_review_at', new Date().toISOString()),
  // ... more queries
])
```

**Priority-based activity building:**
```typescript
const activities: DoseActivity[] = []
let totalMinutes = 0
const rationaleSegments: string[] = []

// Priority 1: Overdue SRS
if (overdueSrsCount > 0 && totalMinutes < budget) {
  const srsMinutes = clampMinutes(Math.ceil(cardCount * 0.5), budget - totalMinutes)
  activities.push({
    type: 'srs_review',
    config: { cardCount, source: 'overdue_srs' },
    minutes: srsMinutes,
    reason: `${cardCount} review ${cardCount === 1 ? 'card is' : 'cards are'} overdue`,
  })
  totalMinutes += srsMinutes
  rationaleSegments.push(`${cardCount} overdue review cards`)
}

// Priority 2: Decaying nodes (not recently studied)
// Priority 3: Weak nodes (not covered, not recent)
// Priority 4: Exam countdown (if <= 30 days)
// Fallback: General Camp session
```

**Avoiding double-counting topics:**
```typescript
const coveredTopicIds = new Set(
  activities
    .filter(a => a.type === 'quiz')
    .flatMap(a => (a.config.topicIds as string[]) ?? []),
)

const weakNotCovered = weakNodes.filter(
  n => !coveredTopicIds.has(n.topic_id) && !recentTopicIds.has(n.topic_id),
)
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient
- `@/lib/constants/time` — time budget defaults, window sizes (3 days, 2 weeks)
- `@/types/daily-dose` — DoseActivity, DailyDose interfaces

### External

- `@supabase/supabase-js` — Supabase client
- Built-in Node.js: `Date`, `Math` for date calculations and time budget logic


---


# FILE: .\src\lib\actions\dev\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# dev

## Purpose

Development and debugging utilities. Database inspection tools, test data generation, and introspection helpers for development environments only.

## Key Files

| File | Description |
|------|-------------|
| **db-viewer.ts** | Query table info: table names, approximate row counts, RLS status for all public tables |
| **test-data.ts** | Generate test data: seed users, quiz sessions, interactions, mastery snapshots for testing |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Development only** — these actions should be wrapped with environment checks (dev mode only, not production).
3. **RPC fallback** — db-viewer attempts RPC first (`get_table_info_for_dev`), falls back to direct table queries if RPC unavailable.
4. **No auth required** — dev actions may bypass authentication if explicitly intended for developer tooling.
5. **Non-destructive** — prefer read-only queries; if write operations are needed, guard with explicit dev mode checks.
6. **Error handling** — be graceful with RPC failures and missing tables; return sensible defaults.

### Common Patterns

**RPC with fallback:**
```typescript
'use server'

export async function getTableInfo(): Promise<TableInfo[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_table_info_for_dev')

  if (error) {
    // Fallback: iterate known tables manually
    const knownTables = ['profiles', 'quiz_sessions', ...]
    const results: TableInfo[] = []

    for (const table of knownTables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      results.push({
        table_name: table,
        row_count: count ?? 0,
        rls_enabled: true,
      })
    }

    return results
  }

  return (data as TableInfo[]) ?? []
}
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient

### External

- `@supabase/supabase-js` — Supabase client


---


# FILE: .\src\lib\actions\mastery\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# mastery

## Purpose

Server actions for mastery and Item Response Theory (IRT) calculations. Updates memory strength (storage/retrieval), decay rates, detects cramming, computes mastery weights, and applies post-interaction hooks. All updates follow IRT 2-parameter logistic model (theta, discrimination, difficulty).

## Key Files

| File | Description |
|------|-------------|
| **update-memory-strength.ts** | Post-interaction memory updates: storage strength (SS) and retrieval strength (RS) with generation effect multiplier (1.2x for correct generation answers) and EMA weighting |
| **update-decay-rate.ts** | Compute and persist decay rate per topic based on mastery weight, accuracy ratio, and recency |
| **post-interaction-hooks.ts** | Fire-and-forget hooks after each interaction: mastery updates, decay rate recomputation, IRT theta calibration |
| **cramming-detector.ts** | Detect and flag cramming behavior: rapid repeated attempts within time window, reduced learning signal |
| **dismiss-empty-topic.ts** | Mark exhausted topics (all questions answered, mastery plateaued) to avoid redundant practice |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Non-blocking** — all mastery updates are fire-and-forget. Failures are logged but never propagate to the quiz flow.
3. **EMA weighting** — storage strength updates apply `emaWeightMultiplier` (1.2x for generation effect, 0.5x for lucky guess) to the SS increment.
4. **Decay calculation** — use half-life formula: `decayRate = Math.LN2 / halfLife` where `halfLife = 5 + accuracyRatio * 25` days.
5. **Context diversity** — track `practice_contexts` to detect learning variability (same material across different session modes).
6. **IRT 2-parameter** — theta (user ability) and difficulty calibration happen post-interaction; use Supabase RPC or async background process.
7. **Catch all errors** — wrap mastery updates in try/catch with console.error but no rethrow.

### Common Patterns

**Memory strength update with generation effect:**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { updateStorageStrength, currentRetrievalStrength } from '@/lib/quiz/memory-strength'

export const updateMemoryStrength = async (
  userId: string,
  topicId: string,
  isCorrect: boolean,
  difficulty: number,
  isInterleaved: boolean,
  sessionMode: string,
  emaWeightMultiplier = 1.0,
): Promise<void> => {
  try {
    const supabase = await createClient()

    // 1. Fetch current mastery
    const { data: mastery } = await supabase
      .from('user_node_mastery')
      .select('storage_strength, retrieval_strength, practice_count, practice_contexts, last_encountered')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single()

    if (!mastery) {
      // Initialize new row with base SS/RS values
      await supabase.from('user_node_mastery').upsert({
        user_id: userId,
        topic_id: topicId,
        storage_strength: 0.3,
        retrieval_strength: 0.5,
        practice_count: 1,
      }, { onConflict: 'user_id,topic_id' })
      return
    }

    // 2. Compute decayed RS before applying new interaction
    const daysSinceReview = (Date.now() - new Date(mastery.last_encountered).getTime()) / (1000 * 60 * 60 * 24)
    const decayedRS = currentRetrievalStrength(mastery.retrieval_strength, mastery.storage_strength, daysSinceReview)

    // 3. Update SS with generation effect multiplier
    const baseSS = updateStorageStrength(mastery.storage_strength, { isCorrect, difficulty, isInterleaved })
    const ssIncrement = baseSS - mastery.storage_strength
    const newSS = Math.min(mastery.storage_strength + ssIncrement * emaWeightMultiplier, 1.0)

    // 4. Update RS based on correctness
    const newRS = isCorrect ? Math.max(decayedRS, 0.8) : decayedRS

    // 5. Persist
    await supabase.from('user_node_mastery').update({
      storage_strength: Math.round(newSS * 1000) / 1000,
      retrieval_strength: Math.round(newRS * 1000) / 1000,
      practice_count: mastery.practice_count + 1,
      last_encountered: new Date().toISOString(),
    }).eq('user_id', userId).eq('topic_id', topicId)
  } catch (err) {
    console.error('[MEMORY-STRENGTH] Update failed:', err)
    // Do not rethrow — mastery must not break quiz
  }
}
```

**Decay rate calculation (exponential decay model):**
```typescript
const accuracyRatio = totalAttempts > 0 ? totalCorrect / totalAttempts : 0.5
const halfLife = 5 + accuracyRatio * 25 // 5-30 day range
const decayRate = Math.LN2 / halfLife

// Day where recall crosses 70% threshold
const optimalReviewDay = decayRate > 0
  ? Math.round(-Math.log(0.7) / decayRate)
  : 30
```

**Post-interaction hook (fire-and-forget):**
```typescript
runPostInteractionHooks({
  userId,
  topicId,
  isCorrect,
  timeSpentMs,
  avgTimeMs,
  difficulty,
  isInterleaved,
  sessionMode: 'camp',
  emaWeightMultiplier: 1.2, // generation effect
}).catch(() => {
  // Swallow — hooks are non-blocking
})
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient
- `@/lib/supabase/admin` — createAdminClient
- `@/lib/quiz/memory-strength` — updateStorageStrength, currentRetrievalStrength
- `@/lib/constants/mastery` — IRT thresholds, time windows
- `@/types/mastery` — TypeScript interfaces

### External

- `@supabase/supabase-js` — Supabase client
- Built-in Node.js: `Date`, `Math` for decay calculations


---


# FILE: .\src\lib\actions\progress-report\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# progress-report

## Purpose

Server actions for generating weekly/monthly progress reports. Aggregates questions answered, sessions completed, study time, readiness score changes, node mastery improvements, and highlights weakest/strongest areas within a period.

## Key Files

| File | Description |
|------|-------------|
| **generate.ts** | Report generator: fetches interactions and sessions in period, calculates total study time, readiness score delta, node mastery improvements, weakest and strongest topics |
| **actions.ts** | Additional actions: schedule reports, fetch report history, email reports |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Period-scoped queries** — all data fetches use `gte(timestamp, periodStart)` and `lte(timestamp, periodEnd)`.
3. **Readiness score snapshots** — compare snapshots at period start and end (not per-interaction scores).
4. **Study time aggregation** — sum `time_spent_ms` from interactions, filter outliers (< 300s, > 300k ms), convert to minutes.
5. **Mastery delta calculation** — compute per-topic accuracy delta (period vs pre-period) to identify improvement.
6. **Sorting and ranking** — weakest nodes by lowest current mastery; strongest improvement by highest positive delta.
7. **Graceful nulls** — handle missing snapshots, zero-interaction periods, or no mastery data.

### Common Patterns

**Period-scoped count queries:**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export const generateProgressReport = async (
  userId: string,
  periodStart: string,
  periodEnd: string,
): Promise<ProgressReport> => {
  const supabase = await createClient()

  // Questions answered in period
  const { count: questionsAnswered } = await supabase
    .from('user_interactions')
    .select('interaction_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('interaction_timestamp', periodStart)
    .lte('interaction_timestamp', periodEnd)

  // Sessions completed in period
  const { count: sessionsCompleted } = await supabase
    .from('quiz_sessions')
    .select('session_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', periodStart)
    .lte('completed_at', periodEnd)
}
```

**Study time aggregation (sum, filter outliers):**
```typescript
const { data: timeData } = await supabase
  .from('user_interactions')
  .select('time_spent_ms')
  .eq('user_id', userId)
  .gte('interaction_timestamp', periodStart)
  .lte('interaction_timestamp', periodEnd)
  .gt('time_spent_ms', 0)
  .lt('time_spent_ms', 300_000) // Filter extreme outliers

const totalMs = (timeData || []).reduce(
  (acc, row) => acc + (row.time_spent_ms ?? 0),
  0,
)
const studyMinutes = Math.round(totalMs / 60_000)
```

**Readiness score snapshot comparison:**
```typescript
const [startSnapshot, endSnapshot] = await Promise.all([
  supabase
    .from('readiness_score_snapshots')
    .select('score')
    .eq('user_id', userId)
    .lte('computed_at', periodStart)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle(),
  supabase
    .from('readiness_score_snapshots')
    .select('score')
    .eq('user_id', userId)
    .lte('computed_at', periodEnd)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle(),
])

const scoreStart = startSnapshot.data?.score ?? 0
const scoreEnd = endSnapshot.data?.score ?? 0
const readinessScoreChange = Math.round(scoreEnd - scoreStart)
```

**Mastery delta calculation (pre-period vs in-period accuracy):**
```typescript
// In-period accuracy per topic
const accIn = new Map<string, { correct: number; total: number }>()
for (const row of periodAccuracy) {
  const entry = accIn.get(row.topic_id) ?? { correct: 0, total: 0 }
  entry.total++
  if (row.is_correct) entry.correct++
  accIn.set(row.topic_id, entry)
}

// Pre-period accuracy per topic (for comparison)
const accBefore = new Map<string, { correct: number; total: number }>()
for (const row of priorAccuracy) {
  const entry = accBefore.get(row.topic_id) ?? { correct: 0, total: 0 }
  entry.total++
  if (row.is_correct) entry.correct++
  accBefore.set(row.topic_id, entry)
}

// Calculate delta
const deltas = []
for (const topicId of topicIds) {
  const inPeriod = accIn.get(topicId)
  const before = accBefore.get(topicId)
  if (!inPeriod) continue

  const accNow = inPeriod.correct / inPeriod.total
  const accPrev = before ? before.correct / before.total : 0
  const delta = Math.round((accNow - accPrev) * 100)
  deltas.push({ topicId, delta })
}
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient, getUser
- `@/types/progress-report` — ProgressReport interface

### External

- `@supabase/supabase-js` — Supabase client
- Built-in Node.js: `Date`, `Math` for time calculations and aggregation


---


# FILE: .\src\lib\actions\quiz-v2\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# quiz-v2

## Purpose

V2 quiz engine server actions for session lifecycle, answer submission, feedback, confidence tracking, post-interaction mastery updates, and SRS scheduling. This is the core mutation layer for all quiz interactions in Camp, Storm, Chill, and timed modes.

## Key Files

| File | Description |
|------|-------------|
| **start-session.ts** | Quiz session creation with question selection (standard, interleaved, or discipline-filtered), difficulty filtering, taxonomy breadcrumb enrichment, CAGE nonce issuance |
| **submit-answer.ts** | Answer submission (MCQ and generation types), correctness determination, confidence recording, lucky guess detection, SRS scheduling, error classification, behavioral signal storage |
| **end-session.ts** | Session completion: final stats, readiness score recomputation, post-session hooks (streak updates, debrief generation) |
| **skip-question.ts** | Skip a question in session without answering |
| **flag-question.ts** | Mark a question for later review within session |
| **pause-resume.ts** | Session pause/resume state management |
| **get-review-data.ts** | Fetch review session summary: answered/skipped/flagged questions, rationales, error diagnostics |
| **get-confidence-matrix.ts** | Confidence calibration matrix: correctness vs confidence level cross-tabulation |
| **save-prediction.ts** | Store user confidence prediction before answering (pre-commitment) |
| **save-postdiction.ts** | Store user confidence assessment after revealing answer |
| **get-prediction-history.ts** | Fetch prior predictions and postdictions for a user across sessions |
| **check-generation-answer.ts** | Validate numeric, formula, or short-text answers against correct values |
| **classify-and-store-error.ts** | ML-based error classification: misconception, careless, time-pressure, etc. |
| **successive-relearning.ts** | Successive relearning protocol: schedule questions for repeated retrieval practice |
| **sr-post-submit.ts** | Spaced repetition scheduling post-submit: update SRS queue based on correctness |
| **post-session-hooks.ts** | Fire-and-forget hooks after session completion: streak updates, goal progress, catalyst events |
| **generate-recommendations.ts** | Post-session recommendations: next study topics, modes, review priorities |
| **index.ts** | Barrel export of public actions |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Auth validation** — all actions validate user and session ownership with `getUser()` and `.eq('user_id', user.id)`.
3. **Try/catch for non-critical ops** — SRS updates, hooks, and signal storage are fire-and-forget and must not break the quiz flow.
4. **Question ordering** — always compute `questionOrder` as `sessionQuestionIds.indexOf(questionId) + 1` to track position.
5. **Confident heuristics** — lucky guess detection uses `timeSpentMs < speedThreshold` where `speedThreshold = 3000 + difficulty * 5000`.
6. **Feedback timing** — respect session config `feedback.timing` (immediate/deferred/none) to control rationale visibility.
7. **Revalidate on critical mutations** — call `revalidatePath()` on session completion only.
8. **Generation effect** — correct generation (non-MCQ) answers get 1.2x EMA weight multiplier for stronger memory trace.

### Common Patterns

**Answer submission with auth and session validation:**
```typescript
'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export const submitAnswer = async (input: SubmitAnswerInput): Promise<SubmitAnswerResult> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Validate session belongs to user and is in progress
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('session_id, user_id, status, question_ids')
    .eq('session_id', input.sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session || session.status !== 'in_progress') throw new Error('Session not found')

  // Proceed with mutation
  return { ... }
}
```

**Lucky guess detection and correctness determination:**
```typescript
const difficulty = question.difficulty ?? 0.5
const speedThreshold = 3000 + difficulty * 5000
const isSuspectedLuckyGuess = isCorrect && timeSpentMs < speedThreshold

// Lucky guess overrides generation effect: 0.5x EMA weight
let generationMultiplier = isGeneration && isCorrect ? 1.2 : 1.0
if (isSuspectedLuckyGuess) {
  generationMultiplier = 0.5
}
```

**Confident calibration mapping (0–1 scale to legacy text):**
```typescript
const confidenceScore = confidenceLevel ?? null
const confidenceText =
  confidenceLevel != null
    ? confidenceLevel <= 0.33 ? 'unsure' : confidenceLevel >= 0.67 ? 'sure' : null
    : null
```

**SRS scheduling (non-blocking, fire-and-forget):**
```typescript
if (sessionConfig?.mode === 'camp' || sessionConfig?.mode === 'focused') {
  const quality = deriveQualityRating({
    isCorrect,
    timeSpentMs,
    avgTimeMs: 0,
    confidence: confidenceText,
    isSuspectedLuckyGuess,
  })
  updateSrsSchedule(user.id, question.topic_id!, quality).catch(() => {
    // Log but do not throw — SRS must not block quiz
  })
}
```

**Behavioral signal storage (fire-and-forget):**
```typescript
if (interactionId && (input.signalTrace?.length || input.cageToken)) {
  ;(async () => {
    try {
      const { createAdminClient: getAdmin } = await import('@/lib/supabase/admin')
      const admin = getAdmin()

      // Store signal trace, CAGE token, feature extraction, cognitive state
      // All non-blocking — wrapped in dynamic import + async IIFE
    } catch {
      // Swallow — entire block is optional
    }
  })()
}
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient, getUser
- `@/lib/supabase/admin` — createAdminClient for signal/behavioral storage
- `@/lib/quiz/mode-presets` — mergeWithPreset
- `@/lib/quiz/interleaved-selection` — selectQuestionsWithInterleaving
- `@/lib/quiz/answer-matching` — matchGenerationAnswer
- `@/lib/quiz/memory-strength` — updateStorageStrength, currentRetrievalStrength
- `@/lib/srs/update` — deriveQualityRating, updateSrsSchedule
- `@/lib/signals/extractFeatures` — extractFeatures
- `@/lib/inference/classifyConfidence` — classifyBehavioralState
- `@/lib/cage/nonceService` — issueNonceBatch
- `@/lib/utils/question` — resolveRationaleText, normalizeOptions
- `@/lib/actions/mastery/post-interaction-hooks` — runPostInteractionHooks
- `@/lib/constants/analytics` — color mappings, thresholds
- `@/types/quiz-config` — StartSessionInput, SubmitAnswerInput, QuestionForClient, etc.

### External

- `@supabase/supabase-js` — Supabase client
- `crypto` — randomBytes for session key generation
- `next/cache` — revalidatePath


---


# FILE: .\src\lib\actions\wiki\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# wiki

## Purpose

Wiki interaction server actions. Handles pre-reading questions (prequestions), prequestion submissions with reduced mastery weight, and prequestion retrieval for wiki article navigation.

## Key Files

| File | Description |
|------|-------------|
| **submit-prequestion.ts** | Submit a prequestion answer: validate correctness, record interaction with `source_type: 'prequestion'`, update mastery with reduced alpha (0.1 vs standard 0.3), return rationale |
| **get-prequestions.ts** | Fetch prequestions for a wiki article or topic to populate pre-reading assessment flow |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Auth required** — all actions validate user with `getUser()`.
3. **Reduced EMA weight** — prequestions use alpha = 0.1 (vs. 0.3 standard) because they measure baseline knowledge, not post-study mastery.
4. **Source type marker** — all interactions record `source_type: 'prequestion'` to allow mastery system to apply different weighting.
5. **Rationale delivery** — extract a brief summary sentence (~200 chars) for prequestion feedback; store full rationale separately if needed.
6. **Non-blocking hooks** — post-interaction hooks run with reduced weight context; failures are logged but never thrown.

### Common Patterns

**Prequestion submission with reduced mastery weight:**
```typescript
'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { runPostInteractionHooks } from '@/lib/actions/mastery/post-interaction-hooks'

export const submitPrequestion = async (
  input: SubmitPrequestionInput,
): Promise<SubmitPrequestionResult> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Validate question and determine correctness
  const { data: question } = await supabase
    .from('questions')
    .select('question_id, topic_id, correct_option_id, rationale')
    .eq('question_id', input.questionId)
    .single()

  const isCorrect = question.correct_option_id === input.selectedOptionId

  // 2. Record interaction with source_type marker
  await supabase.from('user_interactions').upsert({
    session_id: input.sessionId,
    question_id: input.questionId,
    topic_id: question.topic_id,
    user_id: user.id,
    selected_option_id: input.selectedOptionId,
    is_correct: isCorrect,
    time_spent_ms: input.timeSpentMs,
    source_type: 'prequestion',  // Marker for reduced mastery weight
    interaction_timestamp: new Date().toISOString(),
  }, { onConflict: 'user_id,session_id,question_id' })

  // 3. Update mastery with reduced alpha (0.1)
  const prevMastery = currentMastery?.current_mastery_weight ?? 0.0
  const alpha = 0.1  // Reduced from standard 0.3
  const newMastery = Math.min(Math.max(alpha * (isCorrect ? 1.0 : 0.0) + (1 - alpha) * prevMastery, 0), 1)

  await supabase.from('user_node_mastery').upsert({
    user_id: user.id,
    topic_id: question.topic_id,
    current_mastery_weight: newMastery,
    total_attempts: totalAttempts,
    total_correct: totalCorrect,
    last_encountered: now,
  }, { onConflict: 'user_id,topic_id' })

  // 4. Fire hooks (reduced weight context)
  runPostInteractionHooks({
    userId: user.id,
    topicId: question.topic_id,
    isCorrect,
    timeSpentMs: input.timeSpentMs,
    avgTimeMs: 0,
    difficulty: 0.5,
    isInterleaved: false,
    sessionMode: 'prequestion',  // Mode marker
  }).catch(() => {
    // Non-fatal
  })

  // 5. Return brief rationale (first sentence, ~200 chars)
  const fullRationale = resolveRationaleText(question.rationale)
  const briefRationale = fullRationale
    ? fullRationale.split(/(?<=[.!?])\s+/)[0]?.slice(0, 200) ?? fullRationale.slice(0, 200)
    : null

  return {
    isCorrect,
    correctOptionId: question.correct_option_id,
    rationale: briefRationale,
    fullRationale: fullRationale ?? null,
  }
}
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient, getUser
- `@/lib/actions/mastery/post-interaction-hooks` — runPostInteractionHooks
- `@/lib/utils/question` — resolveRationaleText
- `@/types/wiki` — SubmitPrequestionInput, SubmitPrequestionResult

### External

- `@supabase/supabase-js` — Supabase client


---


# FILE: .\src\lib\adaptive\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# adaptive

## Purpose

The `adaptive` directory implements adaptive feedback generation (Patent Claims 22, 23, 24): coach-voiced behavioral observations based on confidence × correctness quadrants (mastery/overconfidence/fragile/blindspot), disengagement detection, and session behavioral summaries for admin review. Used to surface actionable insights to students and flag integrity concerns.

## Key Files

| File | Description |
|------|-------------|
| `generateCoachObservation.ts` | Main exports: `generateCoachObservation()` for student-facing feedback, `generateSessionSummary()` for admin, `shouldTriggerIntervention()` for disengagement |

## For AI Agents

### Working In This Directory

**Confidence × Correctness Matrix (Patent Claim 22):**
- High Confidence + Correct = Mastery (celebrate).
- High Confidence + Incorrect = Overconfidence (most dangerous; flag for review).
- Low Confidence + Correct = Fragile (knowledge is shaky; reinforce).
- Low Confidence + Incorrect = Blindspot (true gap; revisit).

**Coach Observation Generation:**
- Input: ≥5 item results with {questionId, topicName, isCorrect, confidence}.
- Output: One coach-voiced message (max 4 sentences) with recommendations per topic.
- Rules:
  - Never use the word "confidence" as a metric label (use "decisive" or "hesitant").
  - Always pair observation with actionable next step: celebrate, revisit, reinforce.
  - Only surface if signal strength ≥30% (avoid noise).
  - Never surface integrity flags (CAGE, anomalies) to student.
  - Frame hesitation as useful information, not weakness.
- Returns null if insufficient signal (<5 items or <30% classified).

**Session Behavioral Summary (Patent Claim 24):**
- Input: array of {questionId, indicators} for all items in session.
- Output: `SessionBehavioralSummary` for admin review.
- Computes:
  - Session consistency score: inverse of average hesitancy (0–1).
  - Session engagement score: inverse of average anomalous behavior (0–1).
  - Integrity flags: CAGE failures, temporal anomalies (>0.8 hesitancy), behavioral anomalies (>0.7 anomaly likelihood).
- Stored in `session_behavioral_summaries` table for auditing.

**Disengagement Detection (Patent Claim 23):**
- Triggers after 5+ consecutive low-engagement items.
- Low engagement = guessing OR (high anomaly AND low hesitancy) = possible AFT (automated form-filling).
- Max 1 intervention per session.
- Returns boolean: should trigger break suggestion or engagement nudge.

### Common Patterns

**Generating Coach Observation:**
```typescript
import { generateCoachObservation } from '@/lib/adaptive'

const items = [
  { questionId: 'q1', topicName: 'Setbacks', isCorrect: true, confidence: 'high' },
  { questionId: 'q2', topicName: 'FLAR', isCorrect: false, confidence: 'high' },
  { questionId: 'q3', topicName: 'Setbacks', isCorrect: true, confidence: 'moderate' },
  // ... more items
]

const observation = generateCoachObservation(items)
// {
//   message: "You were decisive on X items... On Y items, you moved quickly but...",
//   recommendations: [{ topicName: 'Setbacks', action: 'celebrate' }, ...],
//   signalStrength: 'strong'
// }
```

**Session Behavioral Summary:**
```typescript
import { generateSessionSummary } from '@/lib/adaptive'

const items = [
  { questionId: 'q1', indicators: { decisionConfidence: 'high', hesitancyIndex: 0.1, ... } },
  // ... more items
]

const summary = generateSessionSummary(items)
// {
//   sessionConsistencyScore: 0.85,
//   sessionEngagementScore: 0.92,
//   integrityFlags: { cageFailures: 0, temporalAnomalies: 1, behavioralAnomalies: 0 }
// }
```

**Disengagement Check:**
```typescript
import { shouldTriggerIntervention } from '@/lib/adaptive'

const recentIndicators = [...] // Last 10 cognitive state indicators
const shouldTrigger = shouldTriggerIntervention(recentIndicators, interventionAlreadyFired)

if (shouldTrigger) {
  // Show: "Take a break?" or "Let's focus on X for a moment"
}
```

## Dependencies

### Internal

- **Types:** `CognitiveStateIndicators`, `ConfidenceClassification`, `CoachObservation`, `SessionBehavioralSummary` from `@/types/patent`.
- **Inference:** Confidence classification via `@/lib/inference/classifyConfidence`.

### External

- **Zero external npm dependencies.** Pure TypeScript feedback engine.
- **Target runtime:** Node.js (Server Actions) or browser (real-time coaching).

---

**Last Updated:** 2026-04-02

**For patent details, see `.claude/docs/patents/adaptive-feedback.md` in the repository root.**


---


# FILE: .\src\lib\admin\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# admin

## Purpose

The `admin` directory contains admin-specific utility functions: role checking, permission gates, admin profile retrieval, and feature flag management. Used to gate admin-only features (content review, user impersonation, analytics dashboards) and enforce role-based access control across the application.

## Key Files

| File | Description |
|------|-------------|
| `is-admin.ts` | Re-exports from `roles.ts` + legacy email-based `isAdminByEmail()` check for backward compatibility |
| `roles.ts` | Core role system: `isAdmin()`, `isSuperAdmin()`, `canManageContent()`, `canReviewContent()`, `getUserRole()`, `UserRole` enum |
| `get-admin-profile.ts` | Fetch admin user profile from Supabase: name, email, role, permissions, last activity |
| `feature-flags.ts` | Admin feature flags: check if feature is enabled for user by feature key |

## For AI Agents

### Working In This Directory

**Role System (CRITICAL):**
- Admin roles: `admin`, `super_admin`, `reviewer`, `content_manager`.
- Roles stored in auth metadata (Supabase auth.users → raw_app_meta_data) or inferred from email domain (@slatecamp.com).
- `getUserRole()` returns the strongest role for a user.
- `isAdmin()` = user has `admin` or `super_admin` role.
- `isSuperAdmin()` = user has `super_admin` role only.
- `canManageContent()` = `admin` or `content_manager`.
- `canReviewContent()` = `admin`, `super_admin`, or `reviewer`.

**Feature Flags:**
- Stored in Supabase `feature_flags` table: {key, enabled, admin_only, rollout_percentage}.
- `admin_only=true` → only admins can use.
- `rollout_percentage=50` → enabled for 50% of non-admin users (random seed by user ID).
- Check before rendering admin features or experimental endpoints.

**Admin Profile:**
- Fetched server-side only (no direct client-side access to admin metadata).
- Used for audit logs: "Reviewed by Admin Name".
- Includes last activity timestamp for admin dashboard.

**Backward Compatibility:**
- `isAdminByEmail()` checks if email ends with `@slatecamp.com` or is in `ADMIN_EMAILS` env var (comma-separated).
- Deprecated—use `getUserRole()` instead.

### Common Patterns

**Checking Admin Status (Server Action):**
```typescript
'use server'

import { isAdmin, canManageContent } from '@/lib/admin'

export const adminOnlyAction = async () => {
  if (!await isAdmin()) {
    throw new Error('Unauthorized: admin role required')
  }
  // Proceed with admin-only logic
}
```

**Checking Specific Permission:**
```typescript
import { canReviewContent } from '@/lib/admin'

if (await canReviewContent()) {
  // Show content review queue
}
```

**Getting Admin Role:**
```typescript
import { getUserRole } from '@/lib/admin'

const role = await getUserRole()
// role: 'admin' | 'super_admin' | 'reviewer' | 'content_manager' | 'user'
```

**Feature Flag Check:**
```typescript
import { isFeatureEnabled } from '@/lib/admin'

const showBetaUI = await isFeatureEnabled('beta_ui_v2')
if (showBetaUI) {
  return <BetaUI />
}
```

**Admin Profile (Server-side only):**
```typescript
'use server'

import { getAdminProfile } from '@/lib/admin'

const profile = await getAdminProfile()
// { id, email, fullName, role, lastActivity }
```

## Dependencies

### Internal

- **Supabase:** Database queries for feature flags and user metadata (in Server Actions).
- **Auth:** Current user from `getUser()` (via Supabase auth context).
- **Env vars:** `ADMIN_EMAILS` (comma-separated list of additional admin emails).

### External

- **Supabase auth:** User metadata stored in `raw_app_meta_data` JSON field.
- **Environment variables:** `ADMIN_EMAILS` (optional, for legacy email-based admin checks).

---

**Last Updated:** 2026-04-02

**For role management questions, consult `.claude/agents/` in the repository root.**


---


# FILE: .\src\lib\ai\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# ai

AI provider abstraction and prompt templates. Supports Anthropic Claude and OpenAI.

## Purpose

Centralized AI integration. Provider pattern allows swapping between Anthropic (primary, Temperature 0.0 for tutoring) and OpenAI. Prompt templates for question generation and Socratic tutoring.

## Key Files

| File | Description |
|------|-------------|
| `prompts.ts` | `questionGenerationPrompt()` — exam question writer with 4-choice format, difficulty, tags. `socraticTutorSystemPrompt()` — Temperature 0.0 Socratic tutor (Anthropic only) with RAG context + weak domain hints. |
| `provider.ts` | `AIProvider` interface (generateCompletion, generateEmbedding, streamCompletion). `OpenAIProvider` + `AnthropicProvider` implementations. `getAIProvider()` resolves from `AI_PROVIDER` env var. |

## For AI Agents

### Working In This Directory

- Provider pattern: Implement `AIProvider` interface for new providers.
- Prompts are functions returning prompt strings; kept separate from provider.
- Temperature: Question generation 0.7 (creative), tutoring 0.0 (deterministic).
- Anthropic: Primary for tutoring (mandated Temperature 0.0, citation badges in response).

### Adding a New Prompt

1. Create function in `prompts.ts`: `export function myPrompt(...): string`.
2. Accept context params (profession, discipline, content, etc.).
3. Return template string with injected values.
4. Include system prompt instruction if tutoring/guardrails needed.

### Common Patterns

- **System prompts**: Only in tutoring (0.0 temperature). Used in `generateCompletion(..., { systemPrompt })`.
- **RAG context**: Injected into socratic prompts via `ragContext` param.
- **JSON responses**: Question generator expects JSON array; client parses.
- **Streaming**: Used for chat/tutor responses; client handles token arrival.

## Dependencies

### Internal

- None (prompts are static template generators).

### External

- Anthropic API (claude-sonnet-4-20250514).
- OpenAI API (gpt-4o, text-embedding-3-small).
- Environment: `AI_PROVIDER`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`.

<!-- MANUAL: -->


---


# FILE: .\src\lib\audio\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# audio

## Purpose

The `audio` directory provides simple audio feedback utilities using the Web Audio API: synthesized tones for correct answer confirmation and session completion. Zero bundle size (runtime synthesis), respects `prefers-reduced-motion` for accessibility.

## Key Files

| File | Description |
|------|-------------|
| `feedbackSounds.ts` | Web Audio API synthesis: `playCorrectSound()` (A5 sine, 880 Hz, 300ms), `playCompletionSound()` (two-note chime) |

## For AI Agents

### Working In This Directory

**Audio Feedback Philosophy:**
- NO incorrect answer sound (silence IS the feedback).
- Correct answer: single ascending tone (A5, 880 Hz, 300ms) → positive reinforcement.
- Session completion: two-note chime (C5 523Hz + E5 659Hz, staggered start) → celebratory.
- Zero incorrect/error sound: negative audio feedback can increase anxiety and reduce retention.

**Web Audio API:**
- No npm dependencies; uses browser's native AudioContext.
- Sine wave oscillator (smooth tone).
- Gain envelope with exponential ramp (natural fade-out).
- Safe for client-side: checks `typeof window` to avoid SSR errors.

**Accessibility (CRITICAL):**
- Always respect `prefers-reduced-motion: reduce` media query.
- Users with motion sensitivity or vestibular disorders will have this set.
- Check before playing any audio.
- No auto-play; only trigger on user interaction (answer submission).

### Common Patterns

**Playing Correct Sound:**
```typescript
'use client'

import { playCorrectSound } from '@/lib/audio'

const handleCorrectAnswer = () => {
  playCorrectSound() // Safe to call; checks window and prefers-reduced-motion
}
```

**Playing Completion Sound:**
```typescript
'use client'

import { playCompletionSound } from '@/lib/audio'

const handleSessionComplete = () => {
  playCompletionSound() // Two-note chime
}
```

**In a Quiz Component:**
```typescript
'use client'

import { playCorrectSound } from '@/lib/audio'
import { trackEvent } from '@/lib/analytics'

const QuestionCard = ({ question, onAnswer }) => {
  const handleSubmit = async (selectedOption) => {
    const isCorrect = selectedOption === question.correctAnswer
    
    if (isCorrect) {
      playCorrectSound()
      trackEvent('correct_answer', { questionId: question.id })
    } else {
      trackEvent('incorrect_answer', { questionId: question.id })
    }
    
    onAnswer(isCorrect)
  }
  
  return (...)
}
```

## Dependencies

### Internal

- **Analytics:** `trackEvent()` optional for logging audio playback (can be fire-and-forget).

### External

- **Web Audio API:** Native browser API (no npm dependencies).
- **AudioContext:** Available in all modern browsers.

---

**Last Updated:** 2026-04-02

**For accessibility guidelines, consult WCAG 2.1 and `.claude/agents/` in the repository root.**


---


# FILE: .\src\lib\audit\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# audit

Audit trail logging for admin actions and data changes. Server-side only (use server).

## Purpose

Immutable log of admin/system actions (create, update, delete) for compliance and debugging. Requires super-admin role to query. Supports filtering by table, event type, actor, date range, record ID.

## Key Files

| File | Description |
|------|-------------|
| `audit-actions.ts` | `getAuditLogsAction(filters)` — server action to fetch audit logs. Super-admin gated. Returns `AuditLog[]` ordered by created_at DESC. |
| `audit-queries.ts` | `getAuditLogs(filters)`, `getAuditLogsByTable(tableName, recordId?)`, `getAuditLogsByActor(actorId)`, `getAuditLogCount(filters)`. All super-admin gated. |

## For AI Agents

### Working In This Directory

- All functions are `'use server'` (server actions/utilities).
- Every function checks `isSuperAdmin()` before querying; throws if not authorized.
- `AuditLog` schema: `id`, `actor_id`, `event_type`, `table_name`, `record_id`, `metadata`, `content_snapshot`, `created_at`.
- Supports filtering: `tableName`, `eventType`, `actorId`, `recordId`, date range, pagination (offset/limit).

### Adding New Audit Query

1. Create function in `audit-queries.ts`.
2. Call `isSuperAdmin()` first; throw if not authorized.
3. Build query from base: `supabase.from('audit_logs').select('*')`.
4. Apply filters using `.eq()`, `.gte()`, `.lte()` as needed.
5. Return `AuditLog[]` or count; handle errors with throw.

### Common Patterns

- **Filtering**: Each filter param is optional; only add `.eq()` if provided.
- **Pagination**: Use `.range(offset, offset + limit - 1)` for slice behavior.
- **Authorization**: All queries check super-admin; no partial/role-based data filtering.
- **Error handling**: Throw on Supabase error; client/caller handles try/catch.

## Dependencies

### Internal

- `@/lib/supabase/server` — Create server Supabase client.
- `@/lib/admin/roles` — `isSuperAdmin()` authorization check.

### External

- Supabase (server client).

<!-- MANUAL: -->


---


# FILE: .\src\lib\blindspot\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# blindspot

Blindspot queue generation and tracking. Server-side only (use server).

## Purpose

Implements Blindspot (Focus Review) protocol: identifies user's 3 weakest taxonomy nodes (Red zone < 0.4 mastery + Grey zone untouched) and creates 12-question quiz queue. Nightly job + on-demand via dashboard. Tracks pre/post mastery and improvement.

## Key Files

| File | Description |
|------|-------------|
| `generate-queue.ts` | `generateBlindspotQueue(userId)` — finds 3 weakest + untouched nodes, creates queue, snapshots pre-mastery. `completeBlindspotQueue(queueId, userId)` — snapshots post-mastery, counts improved nodes. `deferBlindspotQueue(queueId, userId)` — defer 48h. `getActiveBlindspotQueue(userId)` — returns current queue for dashboard. |
| `generate-queue.test.ts` | Bun tests: active queue guard, no weak nodes, queue creation, 3-node cap, grey node discovery. Uses mocked Supabase client. |

## For AI Agents

### Working In This Directory

- All functions are `'use server'` (server actions/cron jobs).
- Red nodes: `current_mastery_weight < 0.4`. Grey nodes: no row in `user_node_mastery` (untouched).
- Capped at 3 target nodes per queue (top 1-3 weak + fill with grey if needed).
- Snapshots pre/post mastery; tracks `nodes_improved` count for completion stats.

### Adding New Queue Logic

1. Follow existing query pattern: find weak nodes → find grey nodes → create queue.
2. Always snapshot pre-state before modification.
3. Return `{ queueId, nodeIds }` or null for guard conditions.
4. Log errors with timestamp + context (console.error as fallback).

### Common Patterns

- **Queue guards**: Check `blindspot_queues` for pending/in_progress before creating new.
- **Mastery filtering**: `.lt('current_mastery_weight', 0.4)` for red, check touched set for grey.
- **Snapshot logic**: Before queue (pre), after completion (post). Compare for improvement.
- **Error handling**: Return null on insert failure; never throw on paywall/queue logic.

## Dependencies

### Internal

- `@/lib/supabase/server` — Create server Supabase client.

### External

- Supabase (server client).

<!-- MANUAL: -->


---


# FILE: .\src\lib\cage\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# cage

## Purpose

The `cage` directory implements **CAGE**: Confidence-Aware Gesture Encoding (Patent Claims 3, 8). A cryptographic token system that binds answer selections to behavioral gesture signals (touch velocity, path deviation, pressure, jerk, pauses) collected during question answering. Used to detect and flag anomalous behavior (cheating, automated submission, outsourced answers) on the server-side for integrity verification and analytics.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | (Not present—exports from other files) |
| `generateBindingToken.ts` | CAGE token generation at gesture initiation (onPointerDown). Computes response hash, behavioral attestation, HMAC signature. |
| `verifyBindingToken.ts` | CAGE token verification: validate signature, check nonce freshness, compute trust level (verified/absent/timeout/dev_mode) |
| `nonceService.ts` | Nonce generation and server-side tracking: issue nonce per question, track expiry (prevents replay attacks) |
| `server-only-guard.ts` | Server-only assertion: prevents accidental client-side import of sensitive cryptographic code |
| `TRADE_SECRET.md` | (Confidential) Patent claim summary and technical rationale |

## For AI Agents

### Working In This Directory

**CAGE Binding Token Rules (Patent Claim 3):**
- Token generated at gesture initiation (onPointerDown), BEFORE the slider is moved.
- Captures frozen answer state: {questionId, selectedOptionId}.
- Computes one-way hash of answer state (SHA-256 for determinism).
- Records behavioral attestation: hash of first N gesture events (window_size=5 default).
- Signs token payload with session-derived HMAC-SHA256 key.
- Returns: {responseHash, behavioralAttestation, nonce, sequenceNumber, signature, previousTokenHash, generatedAt}.
- 150ms timeout budget—gracefully degrades to null token if crypto unavailable.

**Behavioral Attestation:**
- One-way hash of initial gesture events (velocity, path, pressure, jerk, pauses).
- Deterministic: same gesture sequence → same hash.
- Used to flag anomalous patterns (e.g., robotic straight line, burst submissions).

**Nonce Lifecycle:**
- Server issues nonce per question in quiz session.
- Client includes nonce in token.
- Server validates nonce in `verifyBindingToken()`: must exist, not expired, not already used.
- Prevents replay attacks (token from one question cannot be replayed on another).

**Trust Levels:**
- `verified`: Token signature valid, nonce fresh, gesture signals coherent.
- `absent`: Nonce or session key missing (pre-question setup failed).
- `timeout`: Crypto operation exceeded 150ms (graceful degradation).
- `dev_mode`: Web Crypto API unavailable (dev/test environment).
- `nonce_expired`: Nonce TTL exceeded.
- `offline_nonce`: Nonce issued during offline mode (less restrictive).

**Session Key Derivation:**
- Derived from session secret + user ID + question index (in a Server Action).
- Rotated per question for defense in depth.
- Never exposed to client except as hex string for HMAC signing.

### Common Patterns

**Generating Token (Client, onPointerDown):**
```typescript
import { generateBindingTokenSafe } from '@/lib/cage'

const answerState = { questionId: 'q-123', selectedOptionId: 'opt-b' }
const signalEvents = [] // populated as user moves slider
const { token, trustLevel } = await generateBindingTokenSafe(
  answerState,
  signalEvents,
  nonce,           // from server
  sequenceNumber,  // incremented per question
  sessionKey,      // from server
  previousTokenHash // from previous question
)

// Include token in quiz submission
```

**Verifying Token (Server, in submitQuizAnswer action):**
```typescript
import { verifyBindingToken } from '@/lib/cage'

const result = await verifyBindingToken(
  receivedToken,
  expectedAnswerState,
  sessionKey,
  questionNonce,
  sessionSecret
)

if (result.trustLevel === 'verified') {
  // Safe to accept submission
} else if (result.trustLevel === 'absent') {
  // Nonce was missing—CAGE setup failed, but allow submission
} else if (result.trustLevel !== 'dev_mode') {
  // Flag for admin review (timeout, anomalous behavior)
}
```

**Nonce Issuance (Server, in startQuizSession action):**
```typescript
import { generateNonce, issueNonce } from '@/lib/cage'

const nonce = generateNonce() // Cryptographically secure random
await issueNonce(sessionId, questionIndex, nonce, expiryMs = 60000)

// Send nonce to client with question
```

## Dependencies

### Internal

- **Types:** `CAGEBindingToken`, `GestureSignalEvent` from `@/types/patent`.
- **Server-only guard:** `server-only` package (prevents client-side imports).

### External

- **Web Crypto API:** SHA-256, HMAC-SHA256 (browser native, no npm dependency).
- **Crypto utilities:** `crypto.subtle` (modern browsers, Node.js ≥15).

---

**Last Updated:** 2026-04-02

**For patent details, see `.claude/docs/patents/cage.md` in the repository root. This is confidential IP.**


---


# FILE: .\src\lib\constants\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# constants

## Purpose

Centralized configuration and constants. Single source of truth for site metadata, route paths, design tokens, enum values, error messages, and thresholds. Eliminates magic strings and ensures consistency across the application.

## Key Files

| File | Description |
|------|-------------|
| **index.ts** | Main export barrel; re-exports all constants |
| **site.ts** | Site metadata: name, description, branding |
| **routes.ts** | Centralized route paths (ROUTES object); route builders with params |
| **readiness.ts** | Readiness score thresholds, labels, color tokens (70/40 for success/warning) |
| **mastery.ts** | Mastery scoring thresholds, progression levels |
| **analytics.ts** | Analytics event names, event property keys |
| **ads.ts** | Ad placement configuration, frequency caps |
| **pricing.ts** | Pricing plans, feature matrix, billing periods |
| **developer.ts** | Developer/API constants, feature flags, debug settings |

## For AI Agents

### Working In This Directory

1. **Import from the barrel** — use `import { ROUTES, siteConfig } from '@/lib/constants'`.
2. **No magic strings** — always reach for the constant instead of hardcoding.
3. **Route builders** — use functions like `ROUTES.QUIZ_SESSION(sessionId)` for dynamic routes.
4. **Design tokens** — readiness/mastery colors are CSS variables (e.g., `var(--success)`), not hex codes.
5. **Thresholds are immutable** — use `as const` for strict typing.

### Common Patterns

**Using route constants:**
```typescript
import { ROUTES } from '@/lib/constants'

// Static routes
const dashboardUrl = ROUTES.DASHBOARD // "/dashboard"
const wikiUrl = ROUTES.WIKI // "/dashboard/wiki"

// Dynamic routes
const sessionUrl = ROUTES.QUIZ_SESSION(sessionId) // "/dashboard/quiz/{sessionId}"
const noteUrl = ROUTES.NOTE(noteId) // "/dashboard/notes/{noteId}"

// Redirect or href
<a href={ROUTES.QUIZ_SESSION(id)}>Continue Quiz</a>
redirect(ROUTES.DASHBOARD)
```

**Readiness score labels and colors:**
```typescript
import { getReadinessLabel, getReadinessColor, READINESS_THRESHOLDS } from '@/lib/constants'

const score = 75
const label = getReadinessLabel(score) // "Strong"
const color = getReadinessColor(score) // "var(--success)"

// Check threshold
if (score >= READINESS_THRESHOLDS.EXAM_READY) {
  // User is exam-ready (≥90)
}
```

**Site config in metadata:**
```typescript
import { siteConfig } from '@/lib/constants'

// In layout metadata
export const metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
}
```

**Analytics event names:**
```typescript
import { ANALYTICS_EVENTS } from '@/lib/constants'

trackServerEvent(ANALYTICS_EVENTS.QUIZ_STARTED, {
  sessionId,
  testMode: 'camp',
})
```

## Dependencies

### Internal

None — constants are leaf nodes with no internal imports.

### External

None — pure TypeScript/JavaScript objects.

<!-- MANUAL: -->


---


# FILE: .\src\lib\context\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# context

React Context providers for global app state. Client-side only.

## Purpose

Provides isolated Context + Provider pairs for global state that multiple features need. Each context handles a single concern: session state, UI breadcrumbs, discipline selection, note anchoring, and subscription tier gating.

## Key Files

| File | Description |
|------|-------------|
| `active-session-context.tsx` | Tracks if user is in "review" or "quiz" mode (or null). Used to prevent nav escapes mid-session. |
| `breadcrumb-context.tsx` | Stores breadcrumb trail `{ href, label }[]` for wiki/article navigation. Null = no breadcrumbs. |
| `discipline-context.tsx` | Current active discipline, all available disciplines, switch/refresh handlers. Queries `user_global_stats` on discipline change. |
| `note-context.tsx` | Note drawer state + anchor metadata (topic/question/article). Supports opening drawer with pre-filled context. |
| `tier-context.tsx` | User's DB tier, effective tier (after dev overrides), dev mode flag, capabilities, hasAccess() method. |

## For AI Agents

### Working In This Directory

- All files are client components (`'use client'`).
- Each context exports: a hook (`useContextName()`) + a provider component (`ContextNameProvider`).
- Providers must wrap relevant components in `layout.tsx` or `page.tsx`.
- Use TypeScript generics (`<T>`) sparingly; most contexts have fixed shapes.

### Adding a New Context

1. Create file `new-context.tsx` with `'use client'` at top.
2. Define interface `NewContextValue { ... }`.
3. Create context with `createContext<NewContextValue>({...})`.
4. Export hook `export function useNewContext() { return useContext(...) }`.
5. Export provider `export function NewContextProvider({ children, ...props })`.
6. Provider wraps with `<Context.Provider value={{ ... }}>`.

### Common Patterns

- **useCallback**: Used in providers for stable dispatch functions (`switchDiscipline`, `setAnchor`).
- **useState**: Minimal local state, usually derived from props on mount.
- **useRouter** + **createClient**: In discipline context for Supabase interaction.

## Dependencies

### Internal

- `@/types/app` — `Discipline`, `UserTier`, `NoteAnchor`.
- `@/lib/supabase/client` — Create Supabase client (used in discipline context).
- `@/lib/dev/dev-mode` — `TIER_CAPABILITIES` for tier context.

### External

- React 19 (Context API, hooks).

<!-- MANUAL: -->


---


# FILE: .\src\lib\demo\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# demo

## Purpose

Demo mode configuration and mock data layer. Activated via `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` environment variable. Provides a complete mock Supabase client and fake data for the `/try` landing experience, allowing the app to run without a real Supabase backend.

## Key Files

| File | Description |
|------|-------------|
| **config.ts** | `isDemoMode()` -- checks `NEXT_PUBLIC_ENABLE_DEMO_MODE` env var. `DEMO_USER` -- constant demo user identity with fixed UUID and email. |
| **data.ts** | `getDemoProfile(tier)` -- builds a demo user profile for any tier. `getDemoDataForTable(table)` -- returns mock rows for any Supabase table. Provides quiz sessions, questions, wiki articles, taxonomy nodes, mastery data. |
| **mock-supabase.ts** | `createMockSupabaseClient()` -- in-memory Supabase client replacement. Supports `.from().select()`, `.insert()`, `.update()`, `.delete()` with filter chaining. Uses `globalThis` for HMR-safe persistence. |

## For AI Agents

### Working In This Directory

1. **Environment-gated.** Demo mode activates only when `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`. Production builds with valid Supabase keys always use real clients.
2. **Do not delete.** This module is env-gated, not import-gated. Other modules dynamically check `isDemoMode()`.
3. **Mock client mimics Supabase API.** The mock client implements chainable query builders (`.from().select().eq().order()` etc.) returning demo data.
4. **Data freshness.** `getRows()` always returns fresh copies from `data.ts` (not cached), so edits to mock data take effect immediately.
5. **Used by `@/lib/supabase/client.ts`** -- browser client returns mock client when demo mode is active.

## Dependencies

### Internal

- `@/types/app` -- `UserTier`
- `@/lib/dev/dev-mode` -- `TIER_CAPABILITIES`

### External

- None (self-contained mock layer)


---


# FILE: .\src\lib\developer\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# developer

## Purpose

The `developer` directory contains utilities for the developer portal: changelog tracking and component registry indexing. Used to expose internal system state (deployed versions, component library status) to the admin/developer dashboard.

## Key Files

| File | Description |
|------|-------------|
| `changelog.ts` | Changelog parser and version tracker: reads deployment history, formats release notes |
| `componentRegistry.ts` | Component registry indexer: lists all shadcn/ui and custom components, their props, usage examples |

## For AI Agents

### Working In This Directory

**Changelog:**
- Source: `CHANGELOG.md` or git commit history.
- Exports: `getChangelog()`, `getVersions()`, `getReleaseNotes(version)`.
- Format: semantic versioning (major.minor.patch).
- Categories: Features, Fixes, Breaking Changes, Deprecated.
- Used in developer portal: "What's new" section, version history, rollback info.

**Component Registry:**
- Scans `src/components/` and `src/components/ui/` for component files.
- Extracts: component name, prop types (from TypeScript), default props, docstrings.
- Exports: `listComponents()`, `getComponentDocs(name)`, `getComponentUsage(name)`.
- Used in developer portal: component browser, prop documentation, copy-paste examples.

### Common Patterns

**Getting Changelog:**
```typescript
import { getChangelog, getVersions } from '@/lib/developer'

const versions = getVersions() // ['1.0.0', '0.9.2', '0.9.1', ...]
const latest = versions[0]
const notes = getChangelog(latest)
// { version, date, features: [], fixes: [], breaking: [] }
```

**Component Registry:**
```typescript
import { listComponents, getComponentDocs } from '@/lib/developer'

const components = listComponents()
// ['Button', 'Input', 'Modal', 'Tabs', ...]

const buttonDocs = getComponentDocs('Button')
// { name, description, props: { label: string, onClick: () => void }, examples: [...] }
```

## Dependencies

### Internal

- **File system:** Read `CHANGELOG.md` or scan component directory.
- **TypeScript:** Parse prop types from component files.

### External

- **None.** Pure utility functions for documentation extraction.

---

**Last Updated:** 2026-04-02

**For questions about the developer portal, consult `.claude/agents/` in the repository root.**


---


# FILE: .\src\lib\email-templates\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# email-templates

## Purpose

The `email-templates` directory contains email template generators for lifecycle milestones: pre-oath and post-oath emails for Filipino architects taking the Panunumpa ng Propesyonal (Professional Oath). Generates both plain-text and HTML versions with Campfire design system styling.

## Key Files

| File | Description |
|------|-------------|
| `oath-taking.ts` | Email template generators: `generatePreOathEmail()` (day before), `generatePostOathEmail()` (day after) |

## For AI Agents

### Working In This Directory

**Email Strategy:**
- Pre-oath (day before): Motivational message encouraging the student to share their story after taking the oath.
- Post-oath (day after): Celebratory message welcoming the new architect into the professional community.
- Growth-framed, warm tone (Campfire voice): no pressuring language, genuine celebration of achievement.
- Design: Campfire brand colors (Camp Cobalt primary, Surface Light background), Inter font, responsive mobile layout.

**Template Outputs:**
- Plain text body: concise, readable, platform-agnostic.
- HTML body: styled with inline CSS, responsive breakpoints, accessible button links.
- Subject lines: short, memorable, action-oriented.

**Personalization:**
- Input: userName (full name, e.g., "Maria Santos").
- Extract: firstName from first token (e.g., "Maria").
- Output: "Architect Maria, RLA" or "Architect Maria" in greeting.

### Common Patterns

**Generating Pre-Oath Email:**
```typescript
import { generatePreOathEmail } from '@/lib/email-templates'

const email = generatePreOathEmail('Maria Santos')
// {
//   subject: 'Tomorrow: your oath.',
//   body: 'Tomorrow you take the Panunumpa ng Propesyonal...',
//   html: '<html>...'
// }

// Send via email service (Resend, SendGrid, etc.)
await emailClient.send({
  to: user.email,
  subject: email.subject,
  html: email.html,
  text: email.body,
})
```

**Generating Post-Oath Email:**
```typescript
import { generatePostOathEmail } from '@/lib/email-templates'

const email = generatePostOathEmail('Maria Santos')
// {
//   subject: 'You are now Architect Maria, RLA.',
//   body: 'The Campfire is waiting for your story.',
//   html: '<html>...'
// }
```

## Dependencies

### Internal

- **Campfire Design System:** Colors, typography (defined inline in HTML).
  - Camp Cobalt: `#1B3FC4` (primary action).
  - Camp Cobalt 700: `#1535A8` (hover state).
  - Surface Light: `#f8f7f5` (background).
  - Ink Primary: `#1a2332` (text).
  - Ink Secondary: `#4a5568` (secondary text).

### External

- **Email client library:** Resend, SendGrid, AWS SES (caller's responsibility).
- **No npm dependencies** in this directory.

---

**Last Updated:** 2026-04-02

**For email strategy, consult `.claude/docs/campfire-voice.md` in the repository root.**


---


# FILE: .\src\lib\endurance\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# endurance

## Purpose

The `endurance` directory implements extended practice session (Endurance / Stamina mode) utilities: accuracy-by-block computation, endurance window detection, and endurance signal updates. Tracks how long a student can maintain 70%+ accuracy under pressure, informing stamina-building practice recommendations.

## Key Files

| File | Description |
|------|-------------|
| `compute.ts` | Main exports: `computeAccuracyByBlock()` (10-item blocks), `computeEnduranceWindow()` (items before drop below 70%), `updateEnduranceSignals()` (Supabase upsert) |

## For AI Agents

### Working In This Directory

**Accuracy-by-Block Computation:**
- Divides session interactions into 10-item blocks.
- Per-block metrics: correct count, total count, accuracy percentage.
- Input: array of {question_order, is_correct}.
- Output: array of {block number, correct, total, accuracy (0.0–1.0)}.
- Block 1 = items 1–10, Block 2 = items 11–20, etc.

**Endurance Window:**
- The "reliable performance window" = items answered before accuracy drops <70%.
- First block with accuracy <0.70 signals endurance limit.
- Example: Block 1 (85%), Block 2 (80%), Block 3 (65%) → endurance window = 20 items.
- Used to gauge current stamina and suggest target improvements.

**Endurance Signals (Supabase `user_computed_signals`):**
- `endurance_baseline_items`: Baseline set during first calibration week (typically day 7 of onboarding).
- `endurance_window_items`: Current observed window from most recent endurance session.
- `endurance_target_items`: Target for the exam (e.g., 150 items for a 3-hour exam).
- `endurance_last_updated`: Timestamp of last update.
- Calibration week override: if `isCalibrationWeek=true`, reset baseline to current window.

**Silent Failure:**
- Endurance signals are non-critical; failures are logged silently (no user-facing errors).
- Session can complete even if signal update fails.

### Common Patterns

**Computing Accuracy by Block:**
```typescript
import { computeAccuracyByBlock } from '@/lib/endurance'

const interactions = [
  { question_order: 1, is_correct: true },
  { question_order: 2, is_correct: false },
  { question_order: 3, is_correct: true },
  // ... more interactions
]

const blocks = computeAccuracyByBlock(interactions)
// [
//   { block: 1, correct: 7, total: 10, accuracy: 0.70 },
//   { block: 2, correct: 6, total: 10, accuracy: 0.60 },
//   ...
// ]
```

**Computing Endurance Window:**
```typescript
import { computeEnduranceWindow } from '@/lib/endurance'

const blocks = [
  { block: 1, accuracy: 0.85, total: 10 },
  { block: 2, accuracy: 0.80, total: 10 },
  { block: 3, accuracy: 0.65, total: 10 }, // Dropped below 70%
]

const window = computeEnduranceWindow(blocks)
// 20 (items from blocks 1 and 2 only)
```

**Updating Endurance Signals (Server Action):**
```typescript
'use server'

import { updateEnduranceSignals } from '@/lib/endurance'

export const completeEnduranceSession = async (
  userId: string,
  sessionBlocks: { block: number; accuracy: number; total: number }[],
) => {
  const isCalibrationWeek = /* determine from user timeline */
  await updateEnduranceSignals(userId, sessionBlocks, isCalibrationWeek)
  // Silently updates Supabase; no error thrown if fails
}
```

## Dependencies

### Internal

- **Supabase:** Database upsert for `user_computed_signals` table (in `updateEnduranceSignals`).
- **Server:** Only `updateEnduranceSignals` is async and requires server context; others are pure functions.

### External

- **No external npm dependencies** (pure TypeScript).

---

**Last Updated:** 2026-04-02

**For stamina-building pedagogy, consult `.claude/docs/extended-practice-prd.md` in the repository root.**


---


# FILE: .\src\lib\hooks\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# hooks

Shared React hooks for client components. Used across multiple features.

## Purpose

Custom hooks that encapsulate repeated logic: toast notifications, draggable floating elements, feature flags, and user role resolution. Separate from feature-specific hooks in `src/hooks/`.

## Key Files

| File | Description |
|------|-------------|
| `use-toast.ts` | Toast state machine (ADD, UPDATE, DISMISS, REMOVE actions). Single toast at a time. Returns `{ toasts, toast(), dismiss() }`. |
| `useDraggableFloatingPosition.ts` | Draggable dev pill with localStorage persistence. Supports centered positioning. Returns `{ style, onPointerDown, didDragRef, resetPosition }`. |
| `useFeatureFlag.ts` | 3-layer resolution: dev override > DB value > config default. Returns `{ enabled, source }`. Also `useAllFeatureFlags()` for flag board UI. |
| `useUserRole.ts` | Returns effective user role accounting for dev impersonation. In production, always returns real role. In dev, returns impersonated role if active. |

## For AI Agents

### Working In This Directory

- All hooks use `'use client'` at the top.
- Hooks must follow React hooks rules (dependency arrays, call order).
- Return types should be minimal and specific.
- Use Zustand stores when accessing global dev state.

### Adding a New Hook

1. Create file `use{HookName}.ts` with `'use client'` at top.
2. Use React hooks (useState, useCallback, useEffect, useContext).
3. Export single named function `export function use{HookName}() { ... }`.
4. Return minimal object/value needed by consumers.

### Common Patterns

- **Feature flag resolution**: 3-layer (override > DB > config), return source for UI feedback.
- **localStorage**: Persist UI state (position, preferences); wrap in try/catch.
- **Zustand integration**: Access dev store for impersonation, feature overrides.
- **Event listeners**: Cleanup in useEffect return; use useRef for refs like `didDragRef`.

## Dependencies

### Internal

- `@/stores/dev-store` — Feature flag overrides, impersonation state.
- `@/config/feature-flags` — Feature flag config defaults.
- `@/components/ui/toast` — Toast type definitions.
- `@/lib/supabase/server` — For server-side role checks.

### External

- React 19 (hooks).

<!-- MANUAL: -->


---


# FILE: .\src\lib\import\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# import

## Purpose

Question import pipeline: parses CSV and JSON question files, validates against Zod schemas, converts to database format, and bulk-inserts into the `questions` table. Used by admin content management for batch question uploads.

## Key Files

| File | Description |
|------|-------------|
| **question-schema.ts** | Zod schemas for import formats: `QuestionCSVSchema` (denormalized columns: `option_a` through `option_e`, `correct_answer` as letter), `QuestionJSONSchema` (nested `options` array, answer as letter or index). `BulkImportSchema` wrapper. Conversion functions: `csvToDbFormat()`, `jsonToDbFormat()`. |
| **question-importer.ts** | File parsing: `parseCSV(file)` (uses PapaParse), `parseJSON(file)`. Returns `ImportResult` with `validCount`, row-level `errors[]`. Validates each row against the appropriate schema. |
| **import-actions.ts** | Server action: `importQuestionsToDb(questions)` -- converts validated questions to DB format and bulk-inserts via Supabase. All-or-nothing transaction. |

## For AI Agents

### Working In This Directory

1. **Two input formats.** CSV uses flat columns (`option_a`, `option_b`, etc.). JSON uses nested arrays. Both validate via Zod.
2. **Validation before import.** `parseCSV`/`parseJSON` validate every row. Only valid rows pass to `importQuestionsToDb`.
3. **Difficulty range.** 1-5 integer scale. Question text minimum 10 characters.
4. **Taxonomy node ID required.** Every question must have a valid `taxonomy_node_id` (UUID).
5. **CSV parsing.** Uses PapaParse with `header: true`, `skipEmptyLines: true`, `dynamicTyping: true`.

### Common Patterns

**Import flow:**
```typescript
import { parseCSV } from '@/lib/import/question-importer'
import { importQuestionsToDb } from '@/lib/import/import-actions'

const result = await parseCSV(file)
if (result.success && result.validCount > 0) {
  await importQuestionsToDb(validatedQuestions)
}
```

## Dependencies

### Internal

- `@/lib/supabase/server` -- `createClient()` for DB inserts

### External

- `papaparse` -- CSV parsing
- `zod` -- schema validation


---


# FILE: .\src\lib\inference\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# inference

## Purpose

The `inference` directory implements rule-based behavioral confidence classification (Patent Claims 1g, 11) as a Phase 4a implementation. Classifies decision confidence (high/moderate/low/guessing) from behavioral feature vectors extracted from gesture signals. Provides hesitancy index, cognitive load proxy, and anomalous behavior detection for adaptive feedback and integrity monitoring.

## Key Files

| File | Description |
|------|-------------|
| `classifyConfidence.ts` | Main export: `classifyBehavioralState()` computes confidence, hesitancy, cognitive load, anomaly flags from gesture features |
| `server-only-guard.ts` | Server-only assertion: prevents accidental client-side import of sensitive classification logic |
| `TRADE_SECRET.md` | (Confidential) Patent claim summary and ML model roadmap |

## For AI Agents

### Working In This Directory

**Confidence Classification (Patent Claim 11):**
- Discrete levels: `high`, `moderate`, `low`, `guessing`.
- Derived from behavioral feature vector: {velocityProfile, pathDeviation, reversalCount, temporalMetric, micropatterns, jerkMetric, ...}.
- Guessing detected: submission <250ms OR velocity >0.08 (very fast, reflexive).
- High confidence: smooth motion, low path deviation, ≤1 reversal, no pauses, low jerk.
- Low confidence: high deviation, many reversals (>5), multiple pauses (>3), or >3s submission time.
- Moderate: default fallback for mid-range signals.

**Hesitancy Index (0–1 continuous):**
- Combines reversal count (30% weight), pause count (25%), temporal duration (25%), path deviation (20%).
- High hesitancy = uncertain answer (may indicate fragile knowledge or blindspot).
- Low hesitancy = confident answer (may indicate mastery or overconfidence).

**Cognitive Load Proxy (0–1 continuous):**
- Combines jerk metric (25%), velocity variance (25%), item difficulty (30%), answer change count (20%).
- Proxy for working memory demand during decision-making.
- Used to adapt question difficulty or suggest breaks.

**Anomalous Behavior Likelihood (0–1 continuous):**
- Flags: extremely fast (<100ms), zero path deviation (robotic), velocity bursts (>3), missing pressure data, inhuman consistency.
- Scores 0.1–0.4 per flag, capped at 1.0.
- High likelihood (>0.7) triggers admin review flag.

**Phase 4a vs. Phase 4b:**
- Phase 4a (current): Rule-based thresholds derived from internal testing.
- Phase 4b (future): ML model trained on labeled data (self-reported confidence, answer correctness, admin flags).
- This module ships now to collect training data.

### Common Patterns

**Classifying Behavioral State:**
```typescript
import { classifyBehavioralState } from '@/lib/inference'

const features = {
  velocityProfile: { mean: 0.02, stdDev: 0.005, isDeliberate: true },
  pathDeviation: 0.08,
  reversalCount: 2,
  temporalMetric: 1500, // ms
  micropatterns: { pauseCount: 1, burstCount: 0 },
  jerkMetric: 0.0005,
  assessmentContext: { itemDifficulty: 0.6, answerChangeCount: 0 },
  pressureProfile: { available: true, peakForce: 50 },
  interactionPathMetric: 120,
}

const state = classifyBehavioralState(features)
// state.decisionConfidence: 'high' | 'moderate' | 'low' | 'guessing'
// state.hesitancyIndex: 0.15
// state.cognitiveLoadProxy: 0.42
// state.anomalousBehaviorLikelihood: 0.05
```

## Dependencies

### Internal

- **Types:** `BehavioralFeatureVector`, `CognitiveStateIndicators`, `ConfidenceClassification` from `@/types/patent`.
- **Server-only guard:** `server-only` package.

### External

- **Zero external npm dependencies.** Pure TypeScript rule engine.
- **Target runtime:** Node.js (Server Actions only).

---

**Last Updated:** 2026-04-02

**For patent details and ML roadmap, see `.claude/docs/patents/inference.md` in the repository root. This is confidential IP.**


---


# FILE: .\src\lib\lot-geometry\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# lot-geometry

## Purpose

The `lot-geometry` directory implements computational geometry utilities for lot surveying and polygon manipulation: bearing conversions, polygon construction from survey segments, Bowditch closure adjustment for coordinate reconciliation, and setback inset calculation. Used by the 3D Lab to render accurate lot geometry with survey data as input.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | Barrel exports: bearing conversions, polygon builders, Bowditch adjustment, inset calculation |
| `bearing.ts` | Bearing-to-azimuth conversion (bearing 0° = North, azimuth 0° = East). Polar-to-Cartesian projection. |
| `polygon.ts` | Polygon construction: `buildPolygonFromSegments()` from survey data, `buildRectangularPolygon()` for simple lots |
| `bowditch.ts` | Bowditch method: coordinate closure adjustment (minimizes error accumulation from survey measurements) |
| `inset.ts` | Setback inset: shrink polygon by per-side setback distances (for AMBF visualization) |
| `__tests__/lot-geometry.test.ts` | Unit tests for bearing conversion, closure, and inset calculations |

## For AI Agents

### Working In This Directory

**Survey Data Format:**
- Bearings expressed as cardinal compass directions: "N 30° E", "S 45° 30' W", etc.
- Distances in meters.
- Polygon vertices stored as {x, z} (x = East–West, z = North–South in 3D space).
- Vertices ordered counter-clockwise (CCW convention).

**Bearing Conversion Rules:**
- Bearing 0° = North (positive z-axis).
- Bearing 90° = East (positive x-axis).
- Bearings increase clockwise.
- Azimuth 0° = East (positive x-axis).
- Azimuth 90° = South (negative z-axis).
- Conversion: `azimuth = (450 - bearing) % 360`.

**Bowditch Closure Adjustment:**
- Input: survey segments with bearings and distances.
- Calculation: compute coordinates from bearings, measure closure error (discrepancy between computed final point and actual closure).
- Adjustment: proportionally distribute error back to each coordinate based on segment length.
- Output: adjusted coordinates with minimal closure error.
- Used to reconcile hand-measured surveys with ground truth.

**Setback Inset:**
- Input: polygon vertices and per-side setback distances (front, rear, left, right).
- Calculation: parallel inset of each edge by setback distance.
- Output: new polygon representing buildable area (AMBF boundary).
- Edge cases: convex vs. concave vertices require different handling (offset direction).

### Common Patterns

**Converting Bearing to Azimuth:**
```typescript
import { bearingToAzimuthRad } from '@/lib/lot-geometry'

const bearing = 'N 45 E' // 45° east of north
const azimuthRad = bearingToAzimuthRad(bearing)
```

**Polar to Cartesian:**
```typescript
import { polarToCartesian } from '@/lib/lot-geometry'

const azimuth = Math.PI / 4 // 45°
const distance = 30 // meters
const { x, z } = polarToCartesian(azimuth, distance)
```

**Building Polygon from Survey Segments:**
```typescript
import { buildPolygonFromSegments } from '@/lib/lot-geometry'

const segments = [
  { bearing: 'N 0°', distance: 30 },  // North 30m
  { bearing: 'E 90°', distance: 40 }, // East 40m
  { bearing: 'S 0°', distance: 30 },  // South 30m
  { bearing: 'W 90°', distance: 40 }, // West 40m
]
const polygon = buildPolygonFromSegments(segments)
// polygon.vertices: [{x: 0, z: 0}, {x: 40, z: 0}, {x: 40, z: -30}, {x: 0, z: -30}]
```

**Bowditch Adjustment:**
```typescript
import { bowditchAdjust } from '@/lib/lot-geometry'

const segments = [
  { bearing: 'N 0°', distance: 30 },
  { bearing: 'E 90°', distance: 40 },
  { bearing: 'S 0°', distance: 29.8 }, // Slight measurement error
  { bearing: 'W 90°', distance: 39.7 }, // Slight measurement error
]
const adjusted = bowditchAdjust(segments)
// adjusted coordinates sum to exact closure
```

**Setback Inset:**
```typescript
import { computeSetbackInsetPolygon } from '@/lib/lot-geometry'

const polygon = { vertices: [{x: 0, z: 0}, {x: 40, z: 0}, {x: 40, z: -30}, {x: 0, z: -30}] }
const setbacks = { front: 5, rear: 3, left: 2, right: 2 }
const ambfPolygon = computeSetbackInsetPolygon(polygon, setbacks)
// ambfPolygon represents the buildable footprint area
```

## Dependencies

### Internal

- **Bearing/Azimuth Types:** Cardinal directions parsed from strings (e.g., "N 30° E").
- **Polygon Types:** {x, z} Cartesian coordinates.

### External

- **Zero external npm dependencies.** Pure TypeScript for deterministic geometry calculations.
- **Target runtime:** Node.js or browser (3D Lab visualization).

---

**Last Updated:** 2026-04-02

**For questions about survey geometry, consult `.claude/agents/ph-arch-professional-context.md` in the repository root.**


---


# FILE: .\src\lib\mocks\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# mocks

## Purpose

The `mocks` directory contains mock data and fake API responses for testing, staging, and demo mode: database status, infrastructure health, API latency metrics. Used to populate developer dashboard and enable offline testing without requiring live backend connections.

## Key Files

| File | Description |
|------|-------------|
| `status.ts` | Mock status endpoints: `getDatabaseStatus()`, `getInfrastructureStatus()` (async, 200ms delay) |

## For AI Agents

### Working In This Directory

**Mock Data Pattern:**
- Each function is async and returns a typed response matching the real API shape.
- Includes artificial 200ms delay to simulate network latency.
- Used in staging and demo deployments; swap the body for a real fetch() call in production.

**Database Status:**
- Connections: active, idle, max pool size.
- Table inventory: row counts, storage size per table.
- Migrations: applied migrations with timestamps and status.
- Used to monitor data growth and schema changes.

**Infrastructure Status:**
- API latency: p50, p95, p99 percentiles in milliseconds.
- Edge functions: operational status and last invocation timestamp per function.
- Deployment: latest deployment timestamp, commit hash, duration, success/failure status.
- Used to detect performance degradation and function failures.

### Common Patterns

**Getting Database Status:**
```typescript
import { getDatabaseStatus } from '@/lib/mocks'

const status = await getDatabaseStatus()
// {
//   connections: { active: 12, idle: 8, max: 20 },
//   tables: [
//     { name: 'users', rowCount: 2847, size: '14.2 MB' },
//     ...
//   ],
//   migrations: [...]
// }
```

**Getting Infrastructure Status:**
```typescript
import { getInfrastructureStatus } from '@/lib/mocks'

const status = await getInfrastructureStatus()
// {
//   apiLatency: { p50: 45, p95: 189, p99: 342, unit: 'ms' },
//   edgeFunctions: [
//     { name: 'compute-readiness-score', status: 'operational', lastInvocation: '...' },
//     ...
//   ],
//   deployment: { timestamp, status, commit, duration }
// }
```

**In Developer Dashboard:**
```typescript
'use client'

import { getDatabaseStatus, getInfrastructureStatus } from '@/lib/mocks'

export const DeveloperDashboard = async () => {
  const dbStatus = await getDatabaseStatus()
  const infra = await getInfrastructureStatus()
  
  return (
    <div>
      <DatabaseOverview tables={dbStatus.tables} />
      <EdgeFunctionStatus functions={infra.edgeFunctions} />
      <DeploymentStatus {...infra.deployment} />
    </div>
  )
}
```

## Dependencies

### Internal

- **Types:** `DatabaseStatus`, `InfrastructureStatus` from `@/types/developer`.

### External

- **No external npm dependencies** (pure mock data).

---

**Last Updated:** 2026-04-02

**For developer portal design, consult `.claude/agents/` in the repository root.**


---


# FILE: .\src\lib\notes\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# notes

## Purpose

The `notes` directory provides note-taking utilities: image upload to Supabase Storage with signed URLs. Enables students to attach images to study notes (e.g., diagrams, reference photos) with 1-year expiry and user-specific folder organization.

## Key Files

| File | Description |
|------|-------------|
| `uploadImage.ts` | Client-side image upload: `uploadNoteImage(file, userId)` → signed URL (1-year expiry) |

## For AI Agents

### Working In This Directory

**Image Upload Flow:**
1. User selects image file in notes editor (onchange).
2. Call `uploadNoteImage(file, userId)` in client component.
3. File uploaded to `note-images` bucket under `userId/` folder.
4. Return signed URL (valid for 1 year).
5. Embed URL in note content (TipTap JSON, markdown image syntax, etc.).

**File Naming:**
- Path: `{userId}/{randomUUID}.{ext}`.
- Example: `user-123/a1b2c3d4-e5f6-7890-abcd/png`.
- Random UUID prevents collisions and path guessing.

**Storage Settings:**
- Bucket: `note-images` (must exist in Supabase Storage).
- Cache control: 31536000 seconds (1 year), `upsert: false` to prevent overwrites.
- Signed URL duration: 60 × 60 × 24 × 365 (1 year) = 31536000 seconds.

**Error Handling:**
- Upload error → throw message (component catches and shows toast).
- Signed URL generation failure → throw error (should not happen if upload succeeds).

### Common Patterns

**Uploading Image (Client):**
```typescript
'use client'

import { uploadNoteImage } from '@/lib/notes'
import { useToast } from '@/lib/hooks/useToast'
import { useUser } from '@/lib/context/AuthContext'

const NotesEditor = () => {
  const { user } = useUser()
  const { toast } = useToast()
  
  const handleImageUpload = async (file: File) => {
    try {
      const signedUrl = await uploadNoteImage(file, user.id)
      // Insert image into editor
      insertImage(signedUrl, file.name)
      toast({ title: 'Image uploaded' })
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    }
  }
  
  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
    />
  )
}
```

**In TipTap Editor:**
```typescript
// When inserting into TipTap JSON:
editor.commands.setImage({ src: signedUrl, alt: file.name })

// In rendered note (HTML):
<img src={signedUrl} alt="User uploaded diagram" />
```

## Dependencies

### Internal

- **Supabase Client:** Browser client via `createClient()` (from `@/lib/supabase/client`).
- **Types:** File, UUID generation (Web Crypto API).

### External

- **Supabase Storage:** `note-images` bucket must be created and accessible to authenticated users.
- **Web Crypto API:** `crypto.randomUUID()` (native, no npm dependency).

---

**Last Updated:** 2026-04-02

**For notes system design, consult `.claude/docs/` in the repository root.**


---


# FILE: .\src\lib\outcomes\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# outcomes

## Purpose

The `outcomes` directory implements exam outcome prediction and pre-population: gathers peak readiness scores, usage statistics, and accuracy data for active users before a Professional Regulation Commission (PRC) exam batch, enabling students to confirm pass/fail with pre-populated analytics context.

## Key Files

| File | Description |
|------|-------------|
| `prepopulate.ts` | Server Action: `prepopulateExamOutcomes()` queries user activity, readiness history, and session stats → upserts `exam_outcomes` rows |

## For AI Agents

### Working In This Directory

**Prepopulation Logic (Server Action):**
1. Find all users active in 90 days before exam date.
2. For each user, gather:
   - Peak readiness score (max from snapshots).
   - Readiness score 7 days before exam.
   - Total sessions completed.
   - Total questions answered.
   - Average session accuracy.
   - Days active (distinct dates with completed sessions).
   - Signup source and customer archetype (from `user_global_stats`).
3. Insert/upsert `exam_outcomes` row: `{ user_id, discipline_id, exam_batch, result: 'did_not_take', ...metrics }`.
4. Return: {created: number, errors: string[]}.

**Result Status:**
- Pre-population: `result='did_not_take'` (placeholder).
- After PRC publishes: manual admin update to `passed` or `failed`.
- Pre-populated rows allow students to see "Your readiness was X% before the exam" without waiting for results.

**Error Handling:**
- Per-user errors collected; batch operation continues.
- Non-critical: failures don't block other users.
- Return error summaries for admin review.

**Timing:**
- Run 1 day before PRC results release (typically ~2 weeks after exam).
- Triggered manually or via cron job.

### Common Patterns

**Prepopulating Outcomes (Server Action):**
```typescript
'use server'

import { prepopulateExamOutcomes } from '@/lib/outcomes'

export const runExamOutcomePrepopulation = async () => {
  const examBatch = 'LE-2026-01' // Licensure Exam January 2026
  const disciplineId = 'architecture' // or 'civil-engineering', etc.
  const examDate = new Date('2026-04-15') // When exam occurred
  
  const result = await prepopulateExamOutcomes(examBatch, disciplineId, examDate)
  
  console.log(`Created ${result.created} exam outcome records`)
  if (result.errors.length > 0) {
    console.error('Errors:', result.errors)
  }
}
```

**Before and After Prepopulation:**
- Before: `exam_outcomes` table is empty.
- After: {user_id, discipline_id, exam_batch, result: 'did_not_take', peak_readiness_score, ...}.
- Admin updates: Change `result` to `'passed'` or `'failed'` when PRC publishes official results.

## Dependencies

### Internal

- **Supabase:** Queries `quiz_sessions`, `user_interactions`, `readiness_score_snapshots`, `user_global_stats`; upserts `exam_outcomes`.
- **Server context:** Must run in Server Action (requires `createClient()` for server-side Supabase).

### External

- **No external npm dependencies** (pure SQL queries and data aggregation).

---

**Last Updated:** 2026-04-02

**For exam outcome analytics, consult `.claude/docs/outcomes-prd.md` in the repository root.**


---


# FILE: .\src\lib\payments\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# payments

## Purpose

Payment provider abstraction layer. Routes checkout creation to either Stripe or PayRex based on the `PAYMENT_PROVIDER` environment variable. Defines the `PaymentProvider` type, `CreateCheckoutParams`, and `CheckoutResult` interfaces used across the billing system.

## Key Files

| File | Description |
|------|-------------|
| **provider.ts** | `getPaymentProvider()` -- resolves active provider (`"stripe"` or `"payrex"`, defaults to `"payrex"`). `createCheckout(params)` -- creates a checkout session via the active provider. Dynamically imports `@/lib/stripe/config` or `@/lib/payrex/config`. |

## For AI Agents

### Working In This Directory

1. **Provider resolution.** `getPaymentProvider()` checks `PAYMENT_PROVIDER` env var. Falls back to `"payrex"` if Stripe key is missing.
2. **Dynamic imports.** Provider configs are dynamically imported to avoid loading both SDKs.
3. **Tiers.** Three subscription tiers: `"camp"`, `"insurance"`, `"institutional"`.
4. **Adding a new provider:** Implement the same checkout interface (`CreateCheckoutParams` -> `CheckoutResult`), add a branch in `createCheckout()`, create config in `@/lib/{provider}/config.ts`.

### Common Patterns

**Creating a checkout:**
```typescript
import { createCheckout } from '@/lib/payments/provider'

const result = await createCheckout({
  userId: user.id,
  email: user.email,
  tier: 'camp',
  successUrl: `${baseUrl}/success`,
  cancelUrl: `${baseUrl}/pricing`,
})
// result.url -> redirect URL, result.provider -> 'stripe' | 'payrex'
```

## Dependencies

### Internal

- `@/lib/stripe/config` -- `getStripe()`, `STRIPE_PLANS` (dynamic import)
- `@/lib/payrex/config` -- `getPayRex()`, `PAYREX_PLANS` (dynamic import)
- `@/types/app` -- `UserTier`

### External

- Environment: `PAYMENT_PROVIDER`, `STRIPE_SECRET_KEY`


---


# FILE: .\src\lib\payrex\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# payrex

## Purpose

PayRex payment gateway configuration for Philippine payment methods. Provides a singleton PayRex client, supported payment method types, and plan/pricing constants. Default payment provider for SlateCamp (Philippine market).

## Key Files

| File | Description |
|------|-------------|
| **config.ts** | `getPayRex()` -- singleton PayRex client factory (uses `require` for CommonJS compatibility). `PAYREX_PAYMENT_METHODS` -- supported methods: `card`, `gcash`, `maya`, `qrph`. `PAYREX_PLANS` -- plan definitions with amounts in centavos (camp: 49900, insurance: 149900, institutional: 499900). |

## For AI Agents

### Working In This Directory

1. **Singleton pattern.** `getPayRex()` creates one client per process. Do not create clients directly.
2. **Amounts in centavos.** PayRex uses centavo amounts (49900 = 499.00 PHP). Stripe uses peso amounts.
3. **CommonJS import.** PayRex SDK uses `require()` due to ESM/CJS compatibility. The eslint disable comment is intentional.
4. **Payment methods.** Philippine-specific: GCash, Maya, QRPH (QR-based), plus card.
5. **Do not import directly from components.** Access PayRex through `@/lib/payments/provider.ts`.

## Dependencies

### Internal

- `@/lib/constants/site` -- `siteConfig` for plan descriptions

### External

- `payrex-node` -- PayRex Node.js SDK
- Environment: `PAYREX_SECRET_KEY`


---


# FILE: .\src\lib\paywall\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# paywall

Access control and tier-gated feature logic. Server-side only (use server).

## Purpose

Enforces paywall rules for free vs paid tiers. Tracks free user daily question cap, score reveal (once-per-free-user), and feature-level gating. All functions are server actions.

## Key Files

| File | Description |
|------|-------------|
| `check-access.ts` | `checkFeatureAccess(featureKey)`, `canAccess(featureKey)`, `getUserTier()`, `isPaidUser()`. Queries `feature_flags` + `user_subscriptions`. |
| `daily-cap.ts` | `checkDailyCap(userId)` (free users: 20 Q/day), `incrementDailyCount(userId, count)`. Resets daily at UTC midnight. Returns remaining count. |
| `score-reveal.ts` | `checkScoreRevealAccess(userId)` (free users see once), `markScoreRevealed(userId)`. Paid users always see score. |
| `index.ts` | Barrel exports: `checkFeatureAccess`, `canAccess`, `getUserTier`, `isPaidUser`, types. |

## For AI Agents

### Working In This Directory

- All functions are `'use server'` only (server actions, no client calls).
- Read from `user_subscriptions` and `user_global_stats` tables.
- Return structured results: `{ allowed, reason?, ... }` for diagnostics.
- Silent failures on edge cases (e.g., increment cap failure won't break quiz).

### Adding New Paywall Rule

1. Create new function in appropriate file (e.g., `feature-limits.ts` for feature-level gating).
2. Accept `userId` as param; query `user_subscriptions` to resolve tier.
3. Return structured result with `allowed` boolean + context (remaining, cap, etc.).
4. Export from `index.ts` barrel.

### Common Patterns

- **Tier checking**: Query `user_subscriptions` with status = 'active' or 'trialing'; default to 'free'.
- **Daily reset**: Split date on 'T', compare to `free_questions_reset_date`, reset if new day.
- **Error handling**: Use `try/catch` for increment/update; never throw on paywall failure.
- **Reason strings**: Provide user-facing message in result (e.g., "Upgrade to Camp to unlock").

## Dependencies

### Internal

- `@/lib/supabase/server` — Create server Supabase client.
- `@/types/app` — `UserTier` type.

### External

- Supabase (server client).

<!-- MANUAL: -->


---


# FILE: .\src\lib\pd1096\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# pd1096

## Purpose

The `pd1096` directory implements the **PD 1096 computation engine**: a deterministic calculator for Philippine building code compliance (2004 Revised IRR). It encodes setback rules, zoning tables, floor area ratios (FLAR), building height limits (BHL), and site geometry validation for the 3D Lab's parametric architecture design module. Zero framework dependencies—pure TypeScript.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | Barrel exports: computation engine, setback calculator, zoning lookup functions, types |
| `types.ts` | Canonical TypeScript interfaces: ZoneClass, LotParams, ZoningParams, DevControlsResult, ComplianceCheck (no npm dependencies) |
| `computationEngine.ts` | Main entry point: `computeDevControls()` orchestrates site area, floor area, volumetric, and compliance calculations |
| `computeSetbacks.ts` | Setback calculator: front/rear/side setbacks by zone class, lot type (interior/corner/through), firewall rules |
| `zoningTables.ts` | Zoning lookup tables: FLAR ranges, PSO%, BHL storeys, ISA/USA percentages, TGFA multipliers (sourced from 2004 IRR §§ VII–VIII) |
| `errors.ts` | Error types: `ClosureIdentityViolationError` (TLA ≠ AMBF + ISA + USA) |
| `__tests__/computationEngine.test.ts` | Unit tests for setback and compliance calculations |

## For AI Agents

### Working In This Directory

**PD 1096 Compliance Rules (CRITICAL):**
- All values sourced exclusively from 2004 Revised IRR (DPWH, April 2005). Do not hallucinate zone rules.
- Setback rules vary by zone class (R-1, R-2, R-3, R-4, R-5, Com-1 to Com-3, Ind-1 to Ind-3, Institutional, Cultural).
- Lot type affects setbacks: interior, corner (two front exposures), through (two opposite sides), corner-through.
- Firewall presence alters setback requirements on specified sides (front/rear/left/right).

**Key Calculations:**
1. **Total Lot Area (TLA):** Width × Depth (or provided override). Polygon lots use bounding box.
2. **Setbacks:** Base setback from zone tables; §804.6 adds incremental setback based on zone class. Effective setback = base + incremental.
3. **Allowable Building Footprint Area (AMBF):** min(by setbacks, by PSO%). "By setbacks" = (width - L - R) × (depth - F - Rear). "By PSO" = PSO% × TLA.
4. **Floor Area Ratio (FLAR):** GFA = FLAR × TLA. FLAR range varies by zone; typically 1.0–4.0.
5. **Total Gross Floor Area (TGFA):** min(FLAR-based, BHL-based). FLAR-based = GFA × multiplier. BHL-based = BHL storeys × AMBF.
6. **Building Height Limit (BHL):** Determined by zoning or RROW (Road Right-of-Way). Higher value = more restrictive.
7. **Open Space (TOSL):** 1 - (ISA + USA)/TLA. Must meet PSO% requirement.
8. **Compliance Checks:** Verify proposed GFA ≤ TGFA, proposed storeys ≤ BHL storeys, AMBF ≥ required parking, etc.
9. **Closure Identity:** TLA = AMBF + ISA + USA (±0.01 tolerance). If violated → `ClosureIdentityViolationError`.

**Type Safety:**
- All zone classes, lot types, and layer keys are union types (not strings).
- Use `ZoneClass`, `LotType`, `LayerKey` enums from `types.ts`.
- `DevControlsInput` and `DevControlsResult` are the canonical I/O shapes.

**Audit Flags:**
- AMVB (Angular Plane Volume Block) calculation is marked ⚠️ — not yet fully validated against 3D geometry.
- Store audit flags in `result.buildableWidth` and `result.buildableDepth` for R3F sizing feedback.

### Common Patterns

**Computing Setbacks:**
```typescript
import { computeSetbacks } from '@/lib/pd1096'

const result = computeSetbacks({
  lot: { width: 30, depth: 40, type: 'corner' },
  zoning: { zoneClass: 'Com-1', firewallActive: true, firewallSides: ['rear'] },
  building: { proposedFootprintWidth: 25, proposedFootprintDepth: 35, proposedStoreys: 5, floorHeight: 3.5 },
  rrow: { width: 20 },
})
// result.effective gives front/rear/left/right meters
```

**Full Development Controls:**
```typescript
import { computeDevControls } from '@/lib/pd1096'

const devResult = computeDevControls({
  lot: { width: 50, depth: 60, area: 3000 },
  zoning: { zoneClass: 'R-2-max', firewallActive: false, firewallSides: [] },
  building: { proposedFootprintWidth: 40, proposedFootprintDepth: 50, proposedStoreys: 8, floorHeight: 3.5 },
  rrow: { width: 20 },
})

if (!devResult.overallCompliant) {
  devResult.checks.forEach((check) => {
    if (!check.compliant) {
      console.log(`${check.label}: need ${check.required}${check.unit}, have ${check.actual}`)
    }
  })
}
```

**Zoning Lookup:**
```typescript
import { getZoningEntry, lookupFLAR, lookupBHL } from '@/lib/pd1096'

const entry = getZoningEntry('Com-2')
const flarRange = lookupFLAR('Com-2')
const bhlStoreys = lookupBHL('Com-2', 20) // zone, RROW width in meters
```

## Dependencies

### Internal

- **Types:** `ZoneClass`, `LotType`, `LabMode`, `CameraPreset`, `LayerKey`, `FirewallSide` from `types.ts`.
- **Errors:** `ClosureIdentityViolationError` from `errors.ts`.
- **Zoning Tables:** Canonical lookup tables from `zoningTables.ts`.

### External

- **Zero external npm dependencies.** Pure TypeScript for deterministic, offline computation.
- **Target runtime:** Node.js (Server Actions) or browser (3D Lab R3F scene).

---

**Last Updated:** 2026-04-02

**For questions about PD 1096 rules, consult `.claude/agents/ph-arch-professional-context.md` in the repository root.**


---


# FILE: .\src\lib\proof-simulation\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# proof-simulation

## Purpose

The `proof-simulation` directory implements the competence gate for Full Exam Simulation mode: verification that a student has reached sufficient mastery and endurance before accessing a high-stakes, timed full-length exam simulation. Checks taxonomy coverage (70% of nodes at Amber or above) and stamina (80% of exam duration endurance window).

## Key Files

| File | Description |
|------|-------------|
| `gate.ts` | Server Action: `checkProofSimulationGate()` verifies mastery and endurance prerequisites → `ProofSimulationGateResult` |

## For AI Agents

### Working In This Directory

**Gate Verification (Server Action):**

**Competence Gate Rules:**
1. **Taxonomy Coverage:** ≥70% of leaf taxonomy nodes at Amber or above (mastery ≥ 0.4).
   - Count nodes with `current_mastery_weight ≥ 0.4`.
   - Count total leaf nodes (non-deprecated, non-cross-ref, with ALE mapping).
   - Required: ceil(total × 0.70).
   - Pass if: covered ≥ required.

2. **Endurance Window:** ≥80% of exam duration (target items).
   - Fetch `endurance_window_items` and `endurance_target_items` from `user_computed_signals`.
   - Default target: 150 items (typical 3-hour exam).
   - Required: ceil(target × 0.80) = ceil(150 × 0.80) = 120 items.
   - Pass if: window ≥ required.

**Result Structure:**
```typescript
{
  allowed: boolean,                    // true if both checks pass
  nodesCovered: number,                // current coverage
  nodesRequired: number,               // threshold (70% of total)
  enduranceWindow: number,             // current window in items
  enduranceRequired: number,           // threshold (80% of target)
  reasons: string[],                   // human-readable failure reasons
}
```

**Failure Messages:**
- If coverage fails: "X of Y topics at developing level or above (need 70%)".
- If endurance fails: "Endurance window: X of Y items (need 80% of exam length)".
- Both failing: both reasons listed.

**Gate Behavior:**
- If `allowed=false`, redirect student to "Ready for Exam Sim?" dashboard with reasons.
- Suggest: "Master Y more topics" or "Build endurance with 20 more items".
- Re-check gate before each simulation attempt.

### Common Patterns

**Checking Simulation Gate (Server Action):**
```typescript
'use server'

import { checkProofSimulationGate } from '@/lib/proof-simulation'

export const canStartProofSimulation = async (userId: string) => {
  const result = await checkProofSimulationGate(userId)
  
  if (!result.allowed) {
    return {
      allowed: false,
      message: `Not ready yet. ${result.reasons.join(' ')}`,
      progress: {
        topics: `${result.nodesCovered}/${result.nodesRequired}`,
        endurance: `${result.enduranceWindow}/${result.enduranceRequired}`,
      }
    }
  }
  
  return { allowed: true, message: 'Ready for exam simulation!' }
}
```

**In Proof Simulation Page:**
```typescript
// In layout or page component:
const gateResult = await canStartProofSimulation(userId)

if (!gateResult.allowed) {
  return (
    <ReadynessCard>
      <p>{gateResult.message}</p>
      <ProgressBar label="Topics" value={gateResult.progress.topics} />
      <ProgressBar label="Endurance" value={gateResult.progress.endurance} />
    </ReadynessCard>
  )
}

// User is allowed; show simulation interface
return <ProofSimulation />
```

## Dependencies

### Internal

- **Supabase:** Queries `user_node_mastery`, `taxonomy_tree`, `user_computed_signals`.
- **Server context:** Must run in Server Action.
- **Types:** `ProofSimulationGateResult` from `@/types/proof-simulation` or inline.

### External

- **No external npm dependencies** (pure SQL and logic).

---

**Last Updated:** 2026-04-02

**For exam simulation design, consult `.claude/docs/proof-simulation-prd.md` in the repository root.**


---


# FILE: .\src\lib\queries\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# queries

## Purpose

Read-only query functions for server components. These are plain async functions (NOT server actions) that can be called directly from server components without the `'use server'` serialization boundary. Mutations for the same domains live in `@/lib/actions/`.

## Key Files

| File | Description |
|------|-------------|
| **trails.ts** | Trail read queries: `getPublishedTrails()`, `getUserTrailEnrollment()`, `getTrailProgress()`, `getTrailRecommendations()`. Fetches from `camp_trails`, `trail_days`, `trail_steps`, `trail_enrollments` tables. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| **ceo/** | CEO portal queries: auth verification, financial summaries, team data, user engagement metrics. See `ceo/AGENTS.md`. |

## For AI Agents

### Working In This Directory

1. **Not server actions.** Files here do NOT use `'use server'`. They are plain async functions safe for direct import in server components.
2. **Read-only.** No mutations in this directory. All writes go through `@/lib/actions/`.
3. **Supabase reads.** Use `createClient()` from `@/lib/supabase/server` for authenticated queries.
4. **Type imports.** Import domain types from `@/types/app` or `@/types/ceo`.

### Common Patterns

**Server component query:**
```typescript
import { getPublishedTrails } from '@/lib/queries/trails'

// In a server component:
const trails = await getPublishedTrails()
```

## Dependencies

### Internal

- `@/lib/supabase/server` -- `createClient()`, `getUser()`
- `@/types/app` -- `CampTrail`, `TrailDay`, `TrailStep`, etc.

### External

- `@supabase/supabase-js` -- Supabase client


---


# FILE: .\src\lib\queries\ceo\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# queries/ceo

## Purpose

CEO portal read queries and authorization. Provides financial summaries, team data, user engagement snapshots, cohort analysis, and churn risk segmentation. All queries require CEO or super_admin role. Used by CEO server components and CEO server actions.

## Key Files

| File | Description |
|------|-------------|
| **auth.ts** | `verifyCeoAccess()` -- server component auth (redirects on failure). `assertCeoRole()` -- server action auth (throws on failure). Both check `profiles.role` for `ceo` or `super_admin`. |
| **financial-queries.ts** | `getFinancialSummary()` -- MRR, monthly burn, net profit, runway. `getRevenueBreakdown()` -- revenue by category. `getUnitEconomics()` -- LTV, CAC, ARPU. |
| **team-queries.ts** | `getTeamMembers()` -- all team members from `ceo_team_members` with role, department, cost. `getDepartmentCosts()` -- aggregated cost by department. |
| **user-queries.ts** | `getEngagementSnapshot()` -- DAU/WAU/MAU, session frequency, streak data (uses `mv_engagement_snapshot` materialized view). `getCohortRetention()`, `getChurnRiskSegments()`, `getTimeToValue()`. |

## For AI Agents

### Working In This Directory

1. **Two auth patterns.** `verifyCeoAccess()` redirects (for server components). `assertCeoRole()` throws (for server actions in `@/lib/actions/ceo/`).
2. **Materialized views.** `user-queries.ts` reads from `mv_engagement_snapshot` for performance, with fallback to live queries.
3. **Currency is PHP.** Financial amounts are in Philippine Peso. Use `formatPeso()` from `@/types/ceo` for display.
4. **Read-only.** No mutations here. Writes go through `@/lib/actions/ceo/`.

## Dependencies

### Internal

- `@/lib/supabase/server` -- `createClient()` for authenticated queries
- `@/types/ceo` -- `FinancialSummary`, `TeamMember`, `EngagementSnapshot`, `CohortRow`, `ChurnRiskSegment`, etc.

### External

- `next/navigation` -- `redirect` (auth.ts)


---


# FILE: .\src\lib\quiz\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# quiz

## Purpose

The `quiz` directory contains the core quiz engine v2: algorithms for adaptive difficulty, question selection, session configuration, confidence calibration, stamina analysis, and offline synchronization. This is the centerpiece of the assessment system, implementing the 85% Rule (Wilson et al., 2019) for optimal learning and spaced repetition mastery calculations using the IRT 2-parameter logistic model.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | Barrel exports for quiz engine (mode presets, adaptive state, question selection, calibration) |
| `mode-presets.ts` | Default configs for Camp, Storm, Chill, Blindspot, and Endurance modes (13+ KB) |
| `adaptive-difficulty.ts` | Adaptive difficulty algorithm: 85% accuracy target, difficulty scaling (1-5 levels) |
| `question-selection.ts` | Question selection query builder: topic filtering, recency exclusion, difficulty distribution by mode |
| `stamina-analysis.ts` | Fatigue detection and endurance tracking from block-by-block accuracy decay |
| `confidence-calibration.ts` | Confidence calibration state: pre-post answer confidence adjustments (meta-cognitive refinement) |
| `pressure-config.ts` | Pressure mode configuration: time constraints, warning thresholds, timer visibility |
| `error-classifier.ts` | Error categorization: careless vs. conceptual vs. knowledge gaps |
| `median-time.ts` | Median response time computation for pacing estimation and time budgeting |
| `memory-strength.ts` | Memory strength signal from spaced repetition: recency decay, review intervals |
| `should-interleave.ts` | Decision logic for interleaved question sequencing (mixing topics vs. blocked) |
| `interleaved-selection.ts` | Interleaved question selection algorithm: weighted topic sampling, difficulty balancing |
| `answer-matching.ts` | Answer validation and response matching (MCQ, numeric, short text, formula) |
| `haptics.ts` | Haptic feedback triggers for correct/incorrect/submission events (client-side) |
| `temporal-bounds.ts` | Session time bounds: remaining time, per-question budgets, warning thresholds |
| `offline/db.ts` | Offline SQLite database: local session state, question cache |
| `offline/sync.ts` | Offline-to-online sync: reconciliation of local changes with server state |
| `mode-presets.test.ts` | Unit tests for mode preset merging and score banding |
| `adaptive-difficulty.test.ts` | Tests for adaptive difficulty state transitions |
| `stamina-analysis.test.ts` | Tests for fatigue detection thresholds |
| `confidence-calibration.test.ts` | Tests for confidence state updates |

## For AI Agents

### Working In This Directory

**Quiz Engine Rules (CRITICAL):**
- All mode configs (Camp, Storm, Chill, Blindspot, Endurance) derive from `MODE_PRESETS` and are merged with user overrides in `startSession` (Server Action in `actions/`).
- Adaptive difficulty uses the 85% Rule: optimal learning occurs at 85% accuracy (Wilson et al., 2019).
- Difficulty ranges 1–5; current difficulty adjusts after ≥3 answers in a rolling window.
- If accuracy ≥90% for 3+ recent answers → increase difficulty. If ≤60% → decrease difficulty. 60–90% = hold.
- Question selection uses distribution percentages (easy/medium/hard) that vary by mode (adaptive, static, user-selected).

**Confidence Calibration (Patent Claims 9, 10):**
- Pre-answer confidence is collected BEFORE displaying options.
- Post-answer confidence is collected AFTER the student sees the correct answer.
- Calibration state tracks both to compute meta-cognitive refinement (how well students know what they know).

**Stamina Analysis:**
- Sessions are divided into 10-item blocks. Accuracy per block is tracked.
- Endurance window = items answered before accuracy drops below 70% in a block.
- Used to trigger break suggestions and predict test-day stamina.

**Offline Mode (src/lib/quiz/offline/):**
- SQLite schema mirrors Supabase tables (questions, quiz_sessions, user_interactions).
- Sync reconciles local changes: submissions marked pending → awaiting server acknowledgment.
- Never delete offline data; mark as synced.

**Interleaving vs. Blocking:**
- `should-interleave.ts` decides whether to mix topics or block by topic.
- Interleaving improves retention (spacing effect) but increases cognitive load.
- Decision based on session mode, user mastery, and performance on recent items.

**Error Classification:**
- Careless: high confidence + incorrect (overconfidence).
- Conceptual: systematic pattern of errors on related topics.
- Knowledge gap: low confidence + incorrect (true gaps).
- Use to inform AI tutor feedback and next-item selection.

### Common Patterns

**Merging Mode Presets:**
```typescript
import { MODE_PRESETS, mergeWithPreset } from '@/lib/quiz'

const userOverrides = { questionCount: 15 }
const finalConfig = mergeWithPreset('camp', userOverrides)
```

**Adaptive Difficulty State:**
```typescript
import { createAdaptiveState, updateAdaptiveState } from '@/lib/quiz'

let adaptive = createAdaptiveState(3) // Start at level 3
adaptive = updateAdaptiveState(adaptive, true) // Answer correct
// adaptive.currentDifficulty may increase if accuracy threshold met
```

**Question Selection:**
```typescript
import { buildQuestionSelectionQuery } from '@/lib/quiz'

const query = buildQuestionSelectionQuery({
  userId: 'user-123',
  config: quizSessionConfig,
  userMasteryLevel: 3,
})
// Use query to fetch questions from Supabase in a Server Action
```

**Stamina Analysis:**
```typescript
import { analyzeStamina, detectFatigue } from '@/lib/quiz'

const blocks = [ /* accuracy by block */ ]
const fatigue = detectFatigue(blocks)
if (fatigue.isFatigued) {
  // Suggest break
}
```

## Dependencies

### Internal

- **Supabase:** Database queries for user mastery, question metadata (in Server Actions, not here).
- **IRT Model:** Mastery calculations via `srs/irt.ts` (2-parameter logistic).
- **Mode Config Types:** `QuizSessionConfig`, `QuizMode` from `@/types/quiz-config`.
- **Normalization Utilities:** `@/lib/utils/question` for option normalization.

### External

- **TypeScript:** Pure type definitions; no external npm dependencies.
- **Web APIs:** `prefers-reduced-motion` for haptics guard (browser feature detection).

---

**Last Updated:** 2026-04-02

**For questions or updates, consult `.claude/agents/quiz-engineer.md` in the repository root.**


---


# FILE: .\src\lib\readiness\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# readiness

Readiness score calculation using Item Response Theory (IRT) 2-parameter logistic model, score velocity, and churn risk.

## Purpose

Computes three pedagogical metrics: Readiness Score (IRT-based mastery), Score Velocity (7-day pts/day trend), and Churn Risk (engagement/exam urgency triple-condition). Used in dashboard, pacing gauge, and churn alerts.

## Key Files

| File | Description |
|------|-------------|
| `velocity.ts` | `computeScoreVelocity(snapshots)` — returns `{ velocity, state }`. States: accelerating (>0.8 pts/day), steady (0.2–0.8), plateaued (−0.2–0.2), declining (<−0.2). Based on 7-day delta. |
| `churn.ts` | `computeChurnRisk(params)` — triple-condition model: velocity negative 10+ days, last session >5 days ago, exam >45 days away. Returns `{ risk: 0|0.33|0.67|1.0, isHighRisk }`. |

## For AI Agents

### Working In This Directory

- Pure calculation functions (no DB queries, no side effects).
- `velocity.ts`: Sorts snapshots descending (newest first), finds 7-day baseline or uses oldest.
- `churn.ts`: Counts risk factors (0–3), normalizes to 0–1 risk score. High risk = all 3 conditions met.
- IRT 2-parameter model: Handled elsewhere (not in readiness/); Readiness Score uses theta + discrimination + difficulty.

### Adding New Metric

1. Create function `compute{Metric}(params)` returning typed result.
2. Pure functions only (no DB access).
3. Accept snapshot data or state params; return `{ value, status|state|risk }`.
4. Add JSDoc explaining formula/thresholds (e.g., "velocity > 0.8 = accelerating").

### Common Patterns

- **Velocity calculation**: `(latest.score − baseline.score) / daysDelta` in points/day.
- **State mapping**: Map velocity ranges to enum states (4 levels typical).
- **Churn risk factors**: Count conditions met, divide by 3 for 0–1 score.
- **Date math**: Use `getTime()` / (1000 * 60 * 60 * 24) for days delta.

## Dependencies

### Internal

- None (pure math functions).

### External

- None.

<!-- MANUAL: -->


---


# FILE: .\src\lib\signals\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# signals

## Purpose

User learning signal computation. Derives engagement and mastery metrics from raw session data and upserts them into `user_learning_signals`. Called after session completion to maintain up-to-date signal values for dashboard display and churn detection.

## Key Files

| File | Description |
|------|-------------|
| **compute.ts** | `computeUserSignals(userId)` -- server action that computes and upserts: `score_velocity_7d` (readiness score change in pts/day over 7 days), `churn_risk_score` (0.0-1.0 composite risk), `days_since_last_session`, `sessions_last_7d`. Silent on failure (catches and logs errors). |

## For AI Agents

### Working In This Directory

1. **Server action.** Uses `'use server'` directive. Called from quiz completion flow.
2. **Silent failures.** `computeUserSignals()` wraps all logic in try/catch. Must never throw or block the quiz session.
3. **Reads multiple tables.** Queries `user_global_stats`, `readiness_score_snapshots`, `quiz_sessions` to derive signals.
4. **Upserts to `user_learning_signals`.** Uses `.upsert()` with `user_id` as conflict key.
5. **Velocity formula.** `(currentScore - baselineScore) / daysDelta` where baseline is the oldest snapshot within the last 7 days.

## Dependencies

### Internal

- `@/lib/supabase/server` -- `createClient()` for DB access

### External

- None (pure DB reads and upserts)


---


# FILE: .\src\lib\srs\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# srs

## Purpose

Spaced Repetition System (SRS) and Item Response Theory (IRT) algorithms. Implements adaptive question selection, mastery scoring, and review scheduling for exam preparation. Combines SM-2 (SuperMemo 2) intervals with IRT 2-parameter logistic model for theta-driven difficulty matching.

## Key Files

| File | Description |
|------|-------------|
| **sm2.ts** | SM-2 algorithm: interval calculation, ease factor, next review scheduling |
| **sm2.test.ts** | Unit tests for SM-2 calculation |
| **update.ts** | Server action: derives quality rating from user interaction, updates SRS schedule in DB |
| **update.test.ts** | Unit tests for update logic |
| **irt.ts** | 2-parameter logistic IRT model: theta estimation, question selection, discrimination/difficulty |
| **irt.test.ts** | Unit tests for IRT calculations |
| **retention.ts** | Ebbinghaus-style retention curve: estimates knowledge decay over time |

## For AI Agents

### Working In This Directory

1. **SM-2 is the interval engine** — calculates next review date based on quality (0–5) and repetition count.
2. **Quality rating** (0–5) is derived from: correctness, time spent, confidence, lucky guess detection.
3. **IRT theta** is the user's ability estimate; difficulty/discrimination come from question metadata.
4. **Next question selection** uses IRT to target questions at ~0.75 probability of correct (adaptive difficulty).
5. **Retention decay** uses exponential model: R(t) = e^(-t / S), where S = stability (interval).
6. **Silent failures** — SRS updates must catch errors and log without throwing.

### Common Patterns

**SM-2 interval calculation:**
```typescript
import { calculateNextReview, getNextReviewDate } from '@/lib/srs/sm2'

const quality = 4 // 0–5, derived from user answer
const currentInterval = mastery?.review_interval_days ?? 1
const currentEF = mastery?.ease_factor ?? 2.5
const reps = mastery?.repetitions ?? 0

const { interval, easeFactor, repetitions } = calculateNextReview(
  quality,
  reps,
  currentEF,
  currentInterval
)

const nextReviewDate = getNextReviewDate(interval) // Date object
```

**Quality rating derivation:**
```typescript
import { deriveQualityRating } from '@/lib/srs/update'

const quality = await deriveQualityRating({
  isCorrect: true,
  timeSpentMs: 12000,
  avgTimeMs: 15000,
  confidence: 'sure',
  isSuspectedLuckyGuess: false,
})
// Returns 0–5 based on correctness, speed, confidence
```

**IRT question selection (adaptive difficulty):**
```typescript
import { selectNextQuestion, probabilityCorrect } from '@/lib/srs/irt'

const userTheta = 0.5 // Estimated ability
const availableQuestions = [...] // Question[]
const answeredIds = new Set([...]) // Already answered

const nextQ = selectNextQuestion(userTheta, availableQuestions, answeredIds)
// Returns question closest to difficulty = theta - ln(3)/discrimination
// Targets ~75% success probability
```

**Retention estimation:**
```typescript
import { retentionAfterDays, formatRetentionPercent } from '@/lib/srs/retention'

const daysSince = 10
const stability = 21 // SM-2 interval
const retention = retentionAfterDays(daysSince, stability)
// retention ≈ 0.62 (62% remembered)

console.log(formatRetentionPercent(retention)) // "62%"
```

**Theta update (adaptive estimation):**
```typescript
import { updateTheta } from '@/lib/srs/irt'

const currentTheta = 0.3
const question = { difficulty_rating: 0.5, discrimination_rating: 1.2 }
const isCorrect = true

const newTheta = updateTheta(currentTheta, question, isCorrect)
// newTheta increases slightly (user proved ability on this difficulty)
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient for DB updates
- `@/types/app` — Question interface

### External

- Built-in Math (no external libraries)


---


# FILE: .\src\lib\stripe\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# stripe

## Purpose

Stripe payment gateway configuration. Provides a singleton Stripe client and plan/pricing constants. Used by `@/lib/payments/provider.ts` when the active payment provider is Stripe.

## Key Files

| File | Description |
|------|-------------|
| **config.ts** | `getStripe()` -- singleton Stripe client factory (API version `2026-02-25.clover`). `STRIPE_PLANS` -- plan definitions for `camp` (499 PHP), `insurance` (1499 PHP), `institutional` (4999 PHP) with price IDs from env vars. |

## For AI Agents

### Working In This Directory

1. **Singleton pattern.** `getStripe()` creates one Stripe instance per process. Do not create clients directly.
2. **Price IDs from env.** Each plan's `priceId` comes from `STRIPE_CAMP_PRICE_ID`, `STRIPE_INSURANCE_PRICE_ID`, `STRIPE_INSTITUTIONAL_PRICE_ID`.
3. **Currency is PHP.** All amounts are in Philippine Peso.
4. **Do not import directly from components.** Access Stripe through `@/lib/payments/provider.ts`.

## Dependencies

### Internal

- None (leaf module)

### External

- `stripe` -- Stripe Node.js SDK
- Environment: `STRIPE_SECRET_KEY`, `STRIPE_CAMP_PRICE_ID`, `STRIPE_INSURANCE_PRICE_ID`, `STRIPE_INSTITUTIONAL_PRICE_ID`


---


# FILE: .\src\lib\supabase\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# supabase

## Purpose

Supabase client factory and utilities. Handles creation of authenticated browser/server clients, admin (service-role) clients, middleware clients, and error formatting. Abstracts away environment variable loading and client configuration.

## Key Files

| File | Description |
|------|-------------|
| **client.ts** | Browser client factory (`createClient()`); handles demo mode mock |
| **server.ts** | Server client factory (`createClient()`, `getUser()`, `hasAuthCookie()`); uses cookies for auth |
| **admin.ts** | Admin client factory (`createAdminClient()`); uses service role key, no refresh |
| **middleware.ts** | Middleware client for auth state refresh in `middleware.ts` |
| **bootstrap.ts** | Initial client setup, environment validation |
| **format-error.ts** | Supabase error formatter; converts DB errors to readable messages |

## For AI Agents

### Working In This Directory

1. **Client creation is lazy** — clients are created on-demand, not globally.
2. **Browser vs Server** — use `client.ts` in React components, `server.ts` in Server Actions.
3. **Admin client** — only use in admin actions; has full database access.
4. **Demo mode** — all clients return mock clients if `isDemoMode()` is true.
5. **No auth cookie management** — cookies are handled by Next.js + Supabase SSR adapter.
6. **Error formatting** — use `formatSupabaseError()` to convert database errors to user-facing messages.

### Common Patterns

**In a Server Action:**
```typescript
'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export async function fetchUserData() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('user_id', user.id)

  return { data, error }
}
```

**In a Client Component:**
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('table_name')
      .on('*', payload => console.log(payload))
      .subscribe()
  }, [supabase])
}
```

**Admin mutation:**
```typescript
'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function deleteRecord(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('table_name')
    .delete()
    .eq('id', id)

  return { error }
}
```

**Error formatting:**
```typescript
import { formatSupabaseError } from '@/lib/supabase/format-error'

const { error } = await supabase.from('table').insert([data])
if (error) {
  const message = formatSupabaseError(error)
  // message is now user-friendly ("Email already exists" instead of "duplicate key value")
}
```

## Dependencies

### Internal

- `@/lib/demo/config` — isDemoMode check
- `@/lib/demo/mock-supabase` — createMockSupabaseClient

### External

- `@supabase/ssr` — createBrowserClient, createServerClient
- `@supabase/supabase-js` — createClient (admin)
- `next/headers` — cookies
- `react` — cache, useCallback


---


# FILE: .\src\lib\utils\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# utils

Stateless utility functions: formatting, date math, string manipulation, wiki navigation, and question helpers.

## Purpose

Reusable pure functions for common operations across the app. No side effects, no state, no dependencies on Context or stores. Safe to call from components, server actions, and middleware.

## Key Files

| File | Description |
|------|-------------|
| `constants.ts` | `PROFESSIONS` (discipline/exam list), `TIER_LIMITS` (questions/day, AI tokens, configs), `TIER_PRICES`. |
| `helpers.ts` | `formatDuration(ms)`, `formatPercentage(val)`, `daysUntil(date)`, `getGreeting()`, `pluralize(count, singular, plural?)`. |
| `wiki.ts` | `findAdjacentPages(pages, currentId)` — returns `{ prev, next }` for wiki navigation. Sorts by `order_index`. |
| `text.ts` | `snippet(content, maxLen=80)` — extracts plain text from TipTap/ProseMirror JSON; truncates to maxLen. |
| `question.ts` | `getCorrectOptionId(question)` — resolves `correct_option_id` with fallback to legacy `correct_answer` field. |

## For AI Agents

### Working In This Directory

- All functions are **pure** (no side effects, deterministic).
- Functions accept typed params, return typed values.
- No imports of Context, stores, or client-side hooks.
- Safe to use in server actions, middleware, and server components.

### Adding a New Utility

1. Create or update file based on category (formatting, date, string, etc.).
2. Write pure function with clear JSDoc if complex.
3. Export named function (no default exports).
4. Test edge cases (null, empty, boundary values).

### Naming Conventions

- **format***: Return formatted strings (`formatDuration`, `formatPercentage`).
- **compute***: Return computed values from calculations.
- **get***: Retrieve/derive values (`getGreeting`, `getCorrectOptionId`).
- **find***: Return search results (`findAdjacentPages`).

## Dependencies

### Internal

- `@/types/app` — `Profession`, `WikiPage`, `UserTier`.

### External

- None (no third-party libraries).

<!-- MANUAL: -->


---


# FILE: .\src\lib\validations\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# validations

## Purpose

Centralized Zod validation schemas for all user-facing inputs: notes, sessions, answers, wiki search, AI tutor messages, checkout, and feature flags. Schemas are consumed by server actions for runtime type checking. Exports both schemas and inferred TypeScript types.

## Key Files

| File | Description |
|------|-------------|
| **index.ts** | All validation schemas and type exports. Key schemas: `createNoteSchema`, `updateNoteSchema`, `deleteNoteSchema`, `sessionIdSchema`, `createSessionSchema`, `submitAnswerSchema`, `wikiSearchSchema`, `aiTutorSchema`, `studyAgentSchema`, `checkoutSchema`, `featureFlagsSchema`, `UUIDSchema`. |

## For AI Agents

### Working In This Directory

1. **Single barrel file.** All schemas live in `index.ts`. Import via `import { schemaName } from '@/lib/validations'`.
2. **UUID helper.** Use `UUIDSchema` (`z.string().uuid()`) for any ID field. Also available as `uuidSchema` (internal).
3. **Session types.** `createSessionSchema` supports types: `subject_quick`, `custom_compiled`, `srs_review`, `ai_adaptive`, `retake`, `topic_drill`, `weak_areas`.
4. **Checkout tiers.** `checkoutSchema` validates `tier` as `"camp" | "insurance" | "institutional"` with URL validation for success/cancel URLs.
5. **Type exports.** Every schema has a corresponding `z.infer<>` type export (e.g., `CreateNoteInput`, `SubmitAnswerInput`).

### Adding a New Schema

1. Define the Zod schema with descriptive error messages.
2. Export the schema as a named constant.
3. Export the inferred type: `export type MyInput = z.infer<typeof mySchema>`.
4. Use in server actions: `const parsed = mySchema.safeParse(input)`.

## Dependencies

### Internal

- None (leaf module, pure schema definitions)

### External

- `zod` -- schema validation library


---


# FILE: .\src\lib\wiki\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# wiki

## Purpose

Wiki article lifecycle management with role-based review workflow. Handles article creation, status transitions (draft -> pending_review -> approved -> published), reviewer assignment, and content updates. Supports SME (Subject Matter Expert) review queue.

## Key Files

| File | Description |
|------|-------------|
| **wiki-actions.ts** | Server actions for wiki CRUD with review workflow: `createArticle()`, `updateArticle()`, `deleteArticle()`, `submitForReview()`, `approveArticle()`, `requestChanges()`, `publishArticle()`. Role-gated via `canReviewContent()` and `getUserRole()`. |

## For AI Agents

### Working In This Directory

1. **Review workflow.** Articles follow: `draft` -> `pending_review` -> `changes_requested` or `approved` -> `published` -> `archived`.
2. **Role gates.** Creating requires auth. Reviewing requires `canReviewContent()`. Status fields track `reviewed_by`, `reviewed_at`, `reviewer_comments`.
3. **Separate from admin wiki actions.** `@/lib/actions/admin/wiki.ts` handles admin-panel CRUD. This module handles the review workflow and SME queue.
4. **Article interface.** `WikiArticle` type includes `id`, `title`, `content`, `discipline_id`, `author_id`, `status`, review metadata, timestamps.

### Common Patterns

**Creating an article:**
```typescript
import { createArticle } from '@/lib/wiki/wiki-actions'

const result = await createArticle({
  title: 'Article Title',
  content: 'MDX content...',
  discipline_id: disciplineId,
})
```

## Dependencies

### Internal

- `@/lib/supabase/server` -- `createClient()` for DB access
- `@/lib/admin/roles` -- `canReviewContent()`, `getUserRole()` for authorization

### External

- `next/cache` -- `revalidatePath`


---


# FILE: .\src\stores\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# stores

## Purpose

Zustand state stores for client-side global state management. Used when state needs to be shared across multiple components without prop drilling.

## Key Files

| File | Description |
|------|-------------|
| `dev-store.ts` | Developer tools state -- dev panel visibility, feature flag overrides, debug mode, impersonation presets (architecture student, pro subscriber, org admin, etc.), persisted to localStorage via zustand/persist |
| `useLabStore.ts` | 3D Lab workspace state -- active hotspot, panel mode, visited/answered/correct tracking sets, explore mode (guided/free), parametric values, compliance state, camera position, quiz results |

## For AI Agents

### Working In This Directory

- Use Zustand `create()` with arrow functions
- Keep stores focused -- one store per major feature area
- Prefer Server Components + props over client stores when possible
- Only use stores for truly client-side interactive state (camera position, UI toggles, etc.)
- Never store server-fetched data in Zustand -- use Server Components or React Context instead
- `dev-store.ts` uses `zustand/persist` with `createJSONStorage` for localStorage persistence

### Common Patterns

- `create<StoreType>()((set, get) => ({ ... }))` pattern
- Selectors for performance: `useLabStore((s) => s.activeScene)`
- Actions defined inline in the store creator
- `Set<string>` for tracking collections (visited, answered, correct IDs)
- Impersonation presets in dev-store define role/tier/userType combos for testing

## Dependencies

### Internal

- `src/types/3d-lab.ts` -- PanelMode, ExploreMode, ComplianceState, QuizResult types
- `src/types/app.ts` -- UserTier, UserType, OrgMemberRole types
- `src/config/feature-flags.ts` -- FeatureFlagKey type for dev overrides

### External

- `zustand` -- State management library
- `zustand/middleware` -- persist, createJSONStorage

<!-- MANUAL: -->


---


# FILE: .\src\types\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# types

## Purpose

Centralized TypeScript type definitions shared across the entire application. Defines domain models (disciplines, taxonomy nodes, questions, sessions), UI types, Supabase database types, portal-specific contracts, and module declarations.

## Key Files

| File | Description |
|------|-------------|
| `app.ts` | Core domain types -- UserTier, QuestionType, DifficultyLevel, TestMode, SessionStatus, Profession, TaxonomyNode, Choice, Discipline, and all major entity interfaces |
| `supabase.ts` | Auto-generated Supabase database types -- maps to DATABASE_SCHEMA.sql (51 tables) |
| `testing.ts` | Testing session types -- ModeSource, UIMode, mode metadata, session config, and debrief result interfaces |
| `dashboard.ts` | Dashboard-specific UI types -- HeroMicroStat, HeatmapDay, RecommendedAction, and component props |
| `wiki.ts` | Wiki content types -- WikiCalloutType, WikiTableRow, article and section interfaces |
| `ceo.ts` | CEO Dashboard type contracts -- FinancialSummary, RevenueBreakdown, UnitEconomics, and all CEO panel interfaces |
| `developer.ts` | Developer Hub types -- PropsTableEntry, ComponentMeta, ComponentPageData for component documentation |
| `3d-lab.ts` | 3D Lab types -- HotspotType, PanelMode, ComplianceState, ExploreMode, scene and module interfaces |
| `tools.ts` | Calculator tool types -- FloorTilesInput/Result, LotPlotter, WallPaint interfaces |
| `bun-test.d.ts` | Bun test runner type declarations |
| `payrex-node.d.ts` | PayRex payment SDK type declarations |

## For AI Agents

### Working In This Directory

- **`app.ts` is the master type file** -- check here first for any domain type
- **`supabase.ts` is auto-generated** -- do not edit manually; regenerate from DATABASE_SCHEMA.sql
- **`testing.ts` owns all quiz/session mode types** -- ModeSource maps DB sources to UIMode for routing
- **`ceo.ts` owns all CEO Dashboard contracts** -- components and Server Actions must use these types, no `any`
- When adding new types, place them in the most specific file (e.g., wiki types in `wiki.ts`, developer hub types in `developer.ts`)
- If a type is used across 3+ feature areas, put it in `app.ts`
- Always export types with `export type` or `export interface`

### Common Patterns

- Union types for enums: `type TestMode = "camp" | "storm" | "chill" | ...`
- Interfaces match database table structures (consult DATABASE_SCHEMA.sql)
- Optional fields use `?` suffix, nullable fields use `| null`
- `.d.ts` files for third-party module declarations only
- `testing.ts` imports from `app.ts` -- never the reverse

## Dependencies

### Internal

- `DATABASE_SCHEMA.sql` (root) -- authoritative schema for `supabase.ts`
- `src/config/portals.ts` -- portal types reference PortalKey
- `src/components/quiz/` -- quiz components consume `testing.ts` types

<!-- MANUAL: -->


---


# FILE: .\supabase\AGENTS.md

<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# supabase

## Purpose

This directory contains all database migrations, seed scripts, and schema management for SlateCamp's Supabase (PostgreSQL) backend. The authoritative schema reference is `DATABASE_SCHEMA.sql` in the project root. All database work must follow the schema exactly: never hallucinate tables, foreign keys, or column types.

The supabase directory manages:
- **Schema versioning** via ordered SQL migrations
- **Seed data** for development and testing
- **Database reset and recovery** procedures

## Key Files

| File | Description |
|------|-------------|
| `DATABASE_SCHEMA.sql` | (In project root) Authoritative relational schema with 51 tables, 13 enums, 89 RLS policies, and 134 indexes. Consult before any DB work. |
| `00_DROP_ALL_TABLES.sql` | **DANGEROUS** -- Nuclear reset script that drops all tables, types, and functions. Dev only. |
| `01_RESET_AND_SEED.sql` | Safe reset script -- re-seeds baseline data with IF NOT EXISTS checks; does not drop tables. |
| `02_RUN_ALL_SEEDS.sql` | Master seed script (155KB) -- runs all quiz, analytics, and sample data seeds. |
| `03_QUIZ SEED.sql` | Quiz-specific seed data -- questions, options, solutions, and IRT parameters. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `migrations/` | 38 numbered SQL migration files (004-039 + dated migrations). Applied sequentially by Supabase CLI. |
| `.temp/` | Temporary working files (e.g., `cli-latest`). Not committed to production. |

## Migration Files Overview

All migrations are applied sequentially and are cumulative. Key categories:

### Core Schema (004-010)
- `004_add_user_roles.sql` -- User role and permission system
- `005_add_wiki_content_status.sql` -- Wiki article status tracking
- `006_add_3d_asset_status.sql` -- 3D Lab asset metadata
- `007_add_audit_logs.sql` -- Audit trail for compliance
- `008_notes_overhaul.sql` -- User notes and annotation system
- `009_quiz_session_fixes.sql` -- Quiz session state corrections
- `010_schema_hardening.sql` -- Security and integrity fixes

### Business Logic (011-021)
- `011_marketing_attribution_and_mastery_trigger.sql` -- Marketing attribution + IRT mastery trigger
- `012_camp_trail_and_assessment.sql` -- Camp Trail enrollment and assessment workflows
- `013_analytics_infrastructure.sql` -- Analytics and signal data
- `014_learning_science_sprint1.sql` -- Learning science data structures (Sprint 1)
- `015_learning_science_sprint2.sql` -- Learning science enhancements (Sprint 2)
- `016_learning_science_sprint3.sql` -- Learning science optimizations (Sprint 3)
- `017_fix_rls_and_fk.sql` -- RLS policy and foreign key fixes
- `018_proof_simulation_and_signals.sql` -- Proof Simulation test mode and signal computation
- `019_application_layer_schema.sql` -- Client-facing feature flags and settings
- `020_populate_feature_flags.sql` -- Default feature flag values
- `021_study_streak_and_sprint2.sql` -- Study streak tracking

### Feature Tables (032-039)
- `032_profiles_column_additions.sql` -- Profile metadata (reviewer type, study windows)
- `033_design_problems_tables.sql` -- Design problem bank for architectural exams
- `034_study_pods.sql` -- Study group and collaboration tables
- `035_oath_taking_schedules.sql` -- Professional oath ceremony scheduling
- `036_code_updates.sql` -- Code snippets and provision management
- `037_questions_practice_context.sql` -- Question context and practice metadata
- `038_readiness_anti_inflation.sql` -- Readiness Score anti-inflation rules
- `039_camp_trail_ux_enhancements.sql` -- Camp Trail UX improvements

### Dated Migrations (March 2025-March 2026)
- `20250315000000_add_test_mode_enum_values.sql` -- Test mode enum expansion (camp, timed, practice, storm, chill, custom, blindspot, proof_sim, endurance)
- `20260320_wiki_article_hero_metadata.sql` -- Wiki hero image and metadata
- `20260321_wiki_bookmarks.sql` -- User wiki bookmarks
- `20260321_wiki_dsgn013_*.sql` -- Wiki content design migrations (3 parts, 28-30KB each)
- `20260324_add_attribution_columns.sql` -- Marketing attribution column additions
- `20260324_add_check_user_admin_role_rpc.sql` -- Admin role check RPC function
- `20260324_unify_rls_admin_patterns.sql` -- Unified RLS admin policy patterns
- `20260325_camp_trail_seed_data.sql` -- Camp Trail seed data
- `20260325_ceo_dashboard.sql` -- CEO Dashboard tables and views
- `20260325_testing_review_schema_gaps.sql` -- Testing and review schema gap fixes

## For AI Agents

### Working In This Directory

1. **Always consult `DATABASE_SCHEMA.sql` first** -- it is authoritative. Never assume table names, column types, or foreign key relationships.
2. **Migrations are cumulative and sequential** -- do not skip or reorder migrations. Apply them in numerical order.
3. **Use parametrized queries in application code** -- never construct SQL strings in client or server code without prepared statements.
4. **Row Level Security (RLS) is mandatory** -- all user-facing tables have RLS policies. Do not bypass with `GRANT` statements.
5. **IRT 2-parameter logistic model** -- all mastery and readiness calculations use IRT with theta, discrimination (a), and difficulty (b) parameters. Stored in `user_mastery` and `quiz_session` tables.
6. **Test mode enums** -- camp, timed, practice, storm, chill, custom, blindspot, proof_sim, endurance. Use exact enum values.
7. **UUIDs for all PKs** -- use `gen_random_uuid()` or `uuid_generate_v4()`, never serial integers for user-facing data.

### Migration Best Practices

- **Always use `IF NOT EXISTS`** when creating types, extensions, or tables that might exist.
- **Never drop existing columns** in production migrations -- use `ALTER TABLE ... DROP COLUMN IF EXISTS` with explicit testing first.
- **Indexes are critical** -- new tables with foreign keys must have indexes on the FK columns (e.g., `CREATE INDEX idx_table_user_id ON table(user_id);`).
- **Transactions should be short** -- do not hold locks across multiple operations in a single migration.
- **Test locally first** -- use `supabase db reset` in a local dev environment before applying to production.

### Common Patterns

**Querying with RLS:**
```sql
-- RLS policies filter automatically based on auth.uid()
-- No additional WHERE clauses needed if policy is correct
SELECT * FROM user_mastery WHERE user_id = auth.uid();
```

**Inserting with RLS:**
```sql
-- auth.uid() is accessible in INSERT triggers and policies
INSERT INTO user_mastery (user_id, subject_id, theta, a, b)
VALUES (auth.uid(), 'ALE001', 0.5, 1.2, -0.3);
```

**Creating indexes for performance:**
```sql
-- FK columns must be indexed
CREATE INDEX idx_user_mastery_user_id ON user_mastery(user_id);

-- Composite index for frequent filters
CREATE INDEX idx_quiz_session_user_mode ON quiz_session(user_id, test_mode);

-- Partial index for active records
CREATE INDEX idx_camp_trail_active ON camp_trail_enrollment(user_id)
  WHERE status = 'active';
```

**Using enums correctly:**
```sql
-- Enums are type-safe and prevent invalid values
ALTER TABLE quiz_session ADD COLUMN test_mode public.test_mode DEFAULT 'camp';

-- Valid values: camp, timed, practice, storm, chill, custom, blindspot, proof_sim, endurance
INSERT INTO quiz_session (user_id, test_mode) VALUES (uuid, 'camp');
```

### Testing Requirements

Before committing a migration:

1. **Syntax validation** -- SQL must be valid PostgreSQL 15+
2. **RLS policy check** -- ensure `SELECT * FROM table;` behaves correctly with auth context
3. **Index performance** -- new tables with >1000 rows should have indexes on all FK and filtered columns
4. **FK integrity** -- all foreign key references must exist in target table
5. **Enum values** -- if adding to an existing enum, use `ALTER TYPE ... ADD VALUE` with explicit position

**Local testing example:**
```bash
# Reset local database with all migrations
supabase db reset

# Verify schema matches authoritative reference
psql supabase_url -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"

# Check RLS policies are applied
psql supabase_url -c "SELECT table_name, COUNT(*) FROM pg_policies GROUP BY table_name;"
```

## Dependencies

### Internal

- **`DATABASE_SCHEMA.sql`** -- Authoritative schema reference. Regenerated from live Supabase instance.
- **Auth system** -- Supabase auth with JWT tokens; `auth.users` table referenced by all user-facing tables via FK.
- **IRT calculations** -- Mastery and readiness scores use stored `theta`, `a`, `b` parameters; triggers compute readiness on quiz completion.

### External

- **Supabase CLI** -- applies migrations via `supabase db push` (local) or automated deploys
- **PostgreSQL 15+** -- Supabase uses PostgreSQL 15. All SQL must be compatible.
- **Supabase auth** -- JWT-based auth with `auth.uid()` context variable available in RLS policies
- **pg_graphql** -- GraphQL API auto-generated from schema (extension: `CREATE EXTENSION pg_graphql`)
- **pg_stat_statements** -- Query performance monitoring (extension: `CREATE EXTENSION pg_stat_statements`)
- **pgcrypto** -- Encryption utilities (extension: `CREATE EXTENSION pgcrypto`)
- **pgjwt** -- JWT generation and verification (extension: `CREATE EXTENSION pgjwt`)
- **supabase_vault** -- Secrets management (extension: `CREATE EXTENSION supabase_vault`)
- **uuid-ossp** -- UUID utilities (extension: `CREATE EXTENSION uuid-ossp`)

<!-- MANUAL: -->


---

