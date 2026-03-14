# RESEARCH: Phase 3 Spatial & Data Infrastructure

## 📐 3D Workspace State
- **Current Component:** `src/components/3d/Workspace.tsx`.
- **Status:** Monolithic. Uses hardcoded mock geometries and callouts.
- **Refactor Need:** Shift to `useGLTF` with Draco compression. Extract `ActiveModel` into a registry that reads from the proposed `3d_parameters` table.
- **Gating:** Middleware/Context check for `tier !== 'free'` before initializing the R3F Canvas.

## 🗄️ Architecture Drift & Schema Mapping
- **Identified Legacy Tables in Code:**
  - `profiles` (Use `user_global_stats`)
  - `exam_profiles` (Use `user_global_stats`)
  - `review_sessions` (Use `quiz_sessions`)
  - `session_questions` (Use `user_interactions`)
  - `wiki_pages` (Use `wiki_articles`)
- **Action:** Phase 3 must refactor `src/lib/actions/` (readiness, daily-mission, sessions) to match the `DATABASE_SCHEMA.sql` mirror.

## 🔄 Seed Pipeline
- **Supabase CLI:** Workspace is linked to `hrpdwqurngnyajuhbkdg`.
- **Reset Logic:** Need a custom `scripts/seed.ts` that reads JSON from `src/data/seed/` and uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS during setup.
- **Binary Assets:** Verification that `.glb` files are hosted on public CDNs (per CONTEXT.md).

## 🧩 Schema-Feature Contract
- **Contract:** Any component in `src/components/3d` must have a corresponding entry in `3d_parameters` table.
- **Sync:** CI needs a check for `supabase/migrations/*.sql` presence in PRs affecting DB logic.
