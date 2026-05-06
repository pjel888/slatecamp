# Staging Branch Setup Runbook

Use an isolated Supabase preview branch or separate staging project. Do not target production.

1. Confirm target project ref is not production.
2. Confirm backup/restore path.
3. Export required environment variables only in local shell.
4. Run schema dry-run against staging.
5. Apply admin audit rebaseline migration to staging only after dry-run review.
