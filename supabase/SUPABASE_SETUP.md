# Supabase setup for Project Cerebro

Use the **same** Supabase project as in your `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`). Follow these steps in order.

---

## Start over (drop all tables and reapply)

If you want to wipe the database and run the schema from scratch:

1. In Supabase go to **SQL Editor**.
2. Run **supabase/drop_all.sql** (drops all `public` tables and custom types).
3. Run **DATABASE_SCHEMA.sql** from the project root (full schema).
4. Run **supabase/seed.sql**.
5. Restart the app and log in again.

---

## 1. Confirm project

- Open [Supabase Dashboard](https://supabase.com/dashboard) and select the project whose URL matches `.env.local` (e.g. `https://xxxxx.supabase.co`).
- Note: If you use a new project, create it first, then set `NEXT_PUBLIC_SUPABASE_URL` and both keys in `.env.local`.

---

## 2. Apply the schema

You need the database tables and RLS policies before seeding.

**Option A — Supabase CLI (recommended)**

From the project root:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Replace `YOUR_PROJECT_REF` with the ref from your project URL (e.g. `hrpdwqurngnyajuhbkdg`).

**Option B — SQL Editor**

1. In the dashboard go to **SQL Editor**.
2. Open each migration in order and run it:
   - `supabase/migrations/001_initial_schema.sql`
   - `002_admin_and_payrex.sql`
   - `003_multi_select_and_media.sql`
   - `004_review_sessions.sql`
   - `005_new_enums.sql`
   - `006_exam_profile_system.sql`
   - `007_questions_upgrade.sql`
   - `008_review_mode.sql`
   - `009_sessions_system.sql`
   - `010_3d_library.sql`
   - `011_analytics_tables.sql`
   - `012_materialized_view_and_remaining.sql`
3. Or run the full **DATABASE_SCHEMA.sql** from the project root once (only on an empty database; re-running may error on existing objects).

---

## 3. Run the seed

1. In Supabase go to **SQL Editor**.
2. Open **supabase/seed.sql** from this repo (or paste its contents into a new query).
3. Click **Run** (or Ctrl+Enter).
4. Confirm no errors. The script inserts:
   - **board_exams** (6 exams; ALE is the one with `has_content = true`)
   - **subjects** (10 ALE subjects)
   - **topics** (per subject)
   - **question_banks** (1: ALE Architecture Fundamentals)
   - **questions** (5 sample questions)

---

## 4. Verify in Table Editor

- **board_exams**: You should see a row with id `be000000-0000-0000-0000-000000000001`, profession `Architecture`, `is_active` and `has_content` = true.
- **subjects**: 10 rows with `board_exam_id` = that ALE id.
- **question_banks**: 1 row; **questions**: 5 rows.

---

## 5. Env for app (optional)

- **SUPABASE_SERVICE_ROLE_KEY**: Required so the app can bootstrap new users (create profile + ALE exam_profile). In Dashboard → Project Settings → API, copy the `service_role` key (secret) into `.env.local`.
- **ADMIN_EMAILS**: Comma-separated emails that get admin (e.g. Dev Settings, Admin page). Example: `ADMIN_EMAILS=you@example.com`. The schema has no `profiles.is_admin` column; admin is determined by this env.

## 6. Refresh the app

1. Restart or hard-refresh the app (e.g. Ctrl+Shift+R on the Quiz page).
2. Log in and open **Dashboard** then **Quiz**. The app will create your **exam_profile** for ALE and show the quiz UI (Custom Session, Subject Quick Start, etc.).

---

## If you still see "Board exam (ALE) data is missing" or quiz doesn’t load

- Confirm **board_exams** has at least one row with `has_content = true` (Table Editor).
- Confirm `.env.local` points to this project (same URL as in the dashboard).
- If you use RLS, ensure **board_exams** has a policy that allows `SELECT` for authenticated users (e.g. "Public read" in `DATABASE_SCHEMA.sql`).
