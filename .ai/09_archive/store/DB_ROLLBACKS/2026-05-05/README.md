# Archived DB Rollback Scripts

Date: 2026-05-05
Source audit: `.ai/02_audits/CODEBASE_AUDIT_REPORT_2026_05_05.md`

This folder holds SQL rollback/repair scripts that must not live in `supabase/migrations/` because migration tooling may treat SQL files in that folder as forward migrations.

Archived file:
- `rollback_lea_to_ale.sql` — moved out of `supabase/migrations/` during P0 production remediation. It is retained for historical traceability only. Do not apply it without explicit human approval and a current database backup/restore plan.
