# Task 04: Write Architecture Documentation

**Status:** pending  
**Created:** 2026-04-06  
**Objective:** Write all `02-architecture/` documents sourced from verified code

---

## Steps

### 4.1 Write `02-architecture/001-system-architecture.md`

**Source:** `src/app/AGENTS.md`, `src/AGENTS.md`, `package.json`

Content:
- System overview diagram (text-based)
- 4 portals with routes and purposes
- Tech stack summary
- Key architectural patterns (Server Components, Server Actions, Zustand)
- Data flow: Supabase → Server Components → Client

### 4.2 Write `02-architecture/002-portal-breakdown.md`

**Source:** `src/app/*/AGENTS.md`

Content per portal:
- Route structure
- Page count
- Key features
- Portal-specific components
- Navigation structure

### 4.3 Write `02-architecture/003-database-schema.md`

**Source:** `DATABASE_SCHEMA.sql`

Content:
- Table overview (51 tables)
- Key relationships
- Link to `DATABASE_SCHEMA.sql` as canonical reference
- RLS policy summary (89+ policies)
- Migration history (60 migrations)

### 4.4 Write `02-architecture/004-api-reference.md`

**Source:** `src/lib/actions/`, `src/lib/queries/`, `src/app/api/`

Content:
- Server actions in `src/lib/actions/`
- Query modules in `src/lib/queries/`
- API routes in `src/app/api/`
- Key action files (116 total)
- Pattern: each action/query module with purpose and parameters

---

## Verification

- [ ] Portal count matches: 4 portals (Dashboard, Admin, CEO, Developer)
- [ ] CEO portal location correct: `src/app/(protected)/ceo/`
- [ ] Database table count matches: 51 tables
- [ ] All cited files exist in `src/`
- [ ] No outdated assumptions from legacy docs

## Notes

- This is the highest-priority architecture doc — everything else depends on correct portal/tech stack info
- Verify all file paths cited actually exist before finalizing
