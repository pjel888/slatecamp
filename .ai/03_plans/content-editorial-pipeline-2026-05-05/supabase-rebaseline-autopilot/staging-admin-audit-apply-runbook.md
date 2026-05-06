# Staging Admin Audit Apply Runbook

1. Apply `admin-audit-rebaseline-migration.generated.sql` to staging only.
2. Run schema probe.
3. Confirm ai_audit objects and RLS policies exist.
4. Do not apply to production while lineage drift remains.
