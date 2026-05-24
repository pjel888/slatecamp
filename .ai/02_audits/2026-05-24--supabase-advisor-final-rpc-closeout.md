# Supabase Advisor Final RPC Closeout — 2026-05-24

## Scope

Follow-up to the two SQL remediation passes that reduced Supabase Advisor findings from 183 to 15 warnings.

Remaining warnings before this pass:

- 14 `authenticated_security_definer_function_executable`
- 1 `auth_leaked_password_protection`

## Decision

The 14 remaining SECURITY DEFINER functions are app-critical or RLS/admin helper contracts. Blindly revoking `authenticated` would risk breaking quiz submission, adaptive question selection, SRS review, wiki article reads, notifications, and admin/reviewer checks.

Instead of revoking app-critical grants, the safe follow-up migration hardens user-scoped RPCs so authenticated callers cannot pass another user's UUID into SECURITY DEFINER logic.

Migration:

- `supabase/migrations/20260524020000_harden_authenticated_rpc_user_scope.sql`

## Functions hardened

Current-user guard added to:

- `check_user_admin_role(p_user_id uuid)`
- `create_notification(p_user_id uuid, ...)`
- `get_review_deck(p_user_id uuid, ...)`
- `get_review_due_count(p_user_id uuid)`
- `get_unseen_questions(p_user_id uuid, ...)`
- `select_next_item(p_user_id uuid, ...)`
- `submit_quiz_answer_v2(p_user_id uuid, ...)`
- `update_theta(p_user_id uuid, ...)`

Guard pattern:

- allow `service_role`
- allow the current authenticated user when `(select auth.uid()) = p_user_id`
- for `create_notification`, also allow existing admin notification orchestration through `public.has_admin_role()`

Additional hardening:

- `select_next_item` now scopes previously answered IDs to both `session_id` and `user_id`.
- `submit_quiz_answer_v2` now updates `quiz_sessions` only when `session_id` and `user_id` both match.

## Functions intentionally left callable

These remain callable by `authenticated` because they are app contracts or RLS helper contracts:

- `can_review_content`
- `check_user_admin_role`
- `create_notification`
- `get_article_with_node`
- `get_fallback_questions`
- `get_review_deck`
- `get_review_due_count`
- `get_unseen_questions`
- `has_admin_role`
- `is_ceo_or_super_admin`
- `is_super_admin`
- `select_next_item`
- `submit_quiz_answer_v2`
- `update_theta`

## Validation

Pre-apply validation:

- `bunx supabase db lint --linked` — PASS
- `bunx supabase db push --dry-run --linked` — PASS; only `20260524020000` would be pushed
- rollback smoke on linked remote with `BEGIN; <migration>; ROLLBACK;` — PASS
- independent review via delegated reviewer — no blocker found

Reviewer non-blockers:

- `submit_quiz_answer_v2` app/type contract appears to expect `wiki_article_id`, while live DB returns `wiki_slug`; this predates the migration and is not introduced here.
- `adaptive-session.ts` allows undefined `disciplineId` even though the RPC expects UUID; pre-existing behavior.
- `get_unseen_questions` remains `STABLE` while using `random()`; pre-existing behavior preserved.

## Leaked password protection

`auth_leaked_password_protection` is a hosted Supabase Auth dashboard setting, not a SQL migration.

Attempted safe automation paths:

- Supabase CLI has no `auth` management command for this setting.
- `supabase config push` is available, but local `supabase/config.toml` does not expose a leaked-password/HIBP setting.
- Direct browser access requires dashboard login.
- Direct Management API probing was not used for mutation; available local CLI token is a CLI access token and direct Python HTTP calls were blocked/unsupported for this path.

Required manual action:

- Supabase Dashboard → project `hrpdwqurngnyajuhbkdg` / SlateCamp → Authentication settings → enable leaked password protection / Have I Been Pwned password check.

## Expected advisor state after migration

This migration hardens risk but should not eliminate the `authenticated_security_definer_function_executable` warnings, because the app-critical grants remain by design.

Expected remaining warnings:

- 14 authenticated SECURITY DEFINER warnings — accepted until product-aware RPC refactor moves privileged operations behind server/service-role paths.
- 1 leaked password protection warning — dashboard setting.
