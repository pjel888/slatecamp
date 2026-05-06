# X5 Dashboard Operator Steps

Option A — Branching:
1. Open Supabase dashboard organization `unfair-black-sb5unhb`.
2. Upgrade to Pro or enable Branching.
3. Create preview branch `admin-audit-staging` for project `hrpdwqurngnyajuhbkdg`, without production data unless explicitly needed.
4. Export branch connection details to environment only; do not commit them.

Option B — Separate staging project:
1. Create project `SlateCamp Staging` in Tokyo region or matching production region.
2. Store project ref as `SUPABASE_STAGING_PROJECT_REF`.
3. Store staging database URL as `SUPABASE_STAGING_DB_URL`.
4. Do not reuse production ref.
