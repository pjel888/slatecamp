# Staging Rebaseline Plan

1. Create isolated Supabase preview branch or separate staging project.
2. Load production-like schema snapshot or pull from production into staging.
3. Apply generated admin audit rebaseline migration to staging only.
4. Run schema probe.
5. Apply admin sync payloads to staging only.
6. Validate readback counts and hashes.
7. Run rollback validation.
8. Produce go/no-go report for production.
