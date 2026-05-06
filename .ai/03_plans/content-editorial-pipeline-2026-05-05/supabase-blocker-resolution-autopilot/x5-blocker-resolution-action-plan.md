# X5 Blocker Resolution Action Plan

Known production ref: hrpdwqurngnyajuhbkdg. Do not target this ref for staging apply.

Exact missing capability: Supabase Branching is unavailable on current plan (`402 Branching is supported only on the Pro plan or above`); projects list exposes only production; Docker daemon is unavailable; no DB URL env vars are present.

Executable solution paths:

1. Upgrade/enable Supabase Branching, then rerun `bunx supabase --experimental branches create admin-audit-staging --persistent --project-ref hrpdwqurngnyajuhbkdg --yes`.
2. Or create a separate project named `SlateCamp Staging`, set `SUPABASE_STAGING_PROJECT_REF` and `SUPABASE_STAGING_DB_URL` in environment, then rerun Hermes from this folder.
3. Or start Docker Desktop and rerun local restore/apply proof.

Success condition: a non-production target ref or local DB URL exists and differs from production.

Resume prompt: “Continue Supabase blocker resolution from `.ai/03_plans/content-editorial-pipeline-2026-05-05/supabase-blocker-resolution-autopilot/` using supplied staging target env; do not redo X1-X5 except to refresh target proof.”
