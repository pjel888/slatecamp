# X9 Production Cutover Runbook

Do not run now. After hosted staging exists and passes X6-X8 against real DB:

1. Confirm production backup.
2. Confirm migration lineage strategy.
3. Run `bunx supabase db push --dry-run --linked`.
4. Direct-apply admin audit schema only if SQL diff is admin-audit-only and non-destructive.
5. Sync admin audit payloads only.
6. Do not mutate article/question/source content.
