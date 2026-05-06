# X5 Required Secrets and Env

Required for hosted staging apply:
- `SUPABASE_STAGING_PROJECT_REF` — non-production project/branch ref.
- `SUPABASE_STAGING_DB_URL` — staging DB connection string.
- Optional `SUPABASE_ACCESS_TOKEN` — CLI management token.

Never write values to repo. Presence-only reporting is allowed.
