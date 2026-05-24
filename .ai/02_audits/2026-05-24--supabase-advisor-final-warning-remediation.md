# Supabase Advisor Final Warning Remediation — 2026-05-24

## Scope

Closeout pass for the 15 remaining Supabase Advisor warnings after the earlier SQL remediation passes.

Baseline before this branch:

- 14 `authenticated_security_definer_function_executable`
- 1 `auth_leaked_password_protection`

## Root cause

Supabase Advisor flags any `SECURITY DEFINER` function in an exposed schema when `authenticated` can execute it through PostgREST `/rest/v1/rpc/*`.

Earlier migrations had already:

- revoked `anon`/`PUBLIC` execute;
- preserved `authenticated` for app-critical functions;
- added current-user guards for user-scoped RPCs.

That hardened behavior, but the Advisor warnings remained because direct authenticated RPC execution still existed.

## Implemented fixes

### 1. Helper RPCs moved out of exposed API surface

Migration:

- `supabase/migrations/20260524030000_move_helper_rpcs_to_private_schema.sql`

Changes:

- created `private` schema;
- created private equivalents for helper functions:
  - `private.can_review_content()`
  - `private.check_user_admin_role(uuid)`
  - `private.has_admin_role()`
  - `private.is_ceo_or_super_admin()`
  - `private.is_super_admin()`
- updated live RLS policies on:
  - `admin_draft_previews`
  - `wiki_article_sources`
- updated `public.create_notification()` to call `private.has_admin_role()`;
- revoked `authenticated` from the exposed public helper RPCs;
- kept `service_role` on public helpers for operator/server compatibility.

Advisor delta after apply:

- 15 warnings → 10 warnings
- remaining:
  - 9 app RPC warnings
  - 1 leaked password protection warning

### 2. App RPC calls moved behind server service-role execution

Code changed:

- `src/lib/actions/notification-triggers.ts`
- `src/lib/actions/sync-notifications.ts`
- `src/lib/actions/srs.ts`
- `src/lib/queries/srs.ts`
- `src/lib/queries/adaptive-quiz.ts`
- `src/lib/actions/adaptive-session.ts`
- `src/lib/actions/wiki-actions.ts`
- `src/lib/actions/quiz-v2/submit-answer.ts`

Migration:

- `supabase/migrations/20260524040000_revoke_authenticated_from_app_rpcs.sql`

Changes:

- moved app callsites for elevated RPCs to server-side `createServiceClient()` execution;
- preserved current-user checks in server actions/query helpers where `userId` is passed as a parameter;
- revoked `authenticated` execute from:
  - `public.create_notification(uuid, notification_type, text, text, jsonb)`
  - `public.get_article_with_node(text)`
  - `public.get_fallback_questions(uuid[], uuid[], integer)`
  - `public.get_review_deck(uuid, integer)`
  - `public.get_review_due_count(uuid)`
  - `public.get_unseen_questions(uuid, uuid[], integer, numeric, numeric)`
  - `public.select_next_item(uuid, uuid, uuid, uuid, double precision)`
  - `public.submit_quiz_answer_v2(uuid, uuid, uuid, text, boolean, integer, text, numeric, boolean, integer)`
  - `public.update_theta(uuid, uuid, double precision, double precision, boolean)`
- kept `service_role` execute on those functions.

Advisor delta after apply:

- 10 warnings → 1 warning
- remaining:
  - 1 `auth_leaked_password_protection`

## Validation evidence

Before applying `20260524030000`:

- `bunx supabase db lint --linked` — PASS
- `bunx supabase db push --dry-run --linked` — PASS; only `20260524030000` pending
- rollback smoke on linked DB — PASS
- independent review — no blocker

After applying `20260524030000`:

- `bunx supabase db advisors --linked --output json` — 10 warnings:
  - 9 `authenticated_security_definer_function_executable`
  - 1 `auth_leaked_password_protection`

Before applying `20260524040000`:

- `bun run type-check` — PASS
- `bunx supabase db lint --linked` — PASS
- `bunx supabase db push --dry-run --linked` — PASS; only `20260524040000` pending
- rollback smoke on linked DB — PASS
- independent review — no blocker

After applying `20260524040000`:

- `bunx supabase db advisors --linked --output json` — 1 warning:
  - `auth_leaked_password_protection`

## Remaining warning

`auth_leaked_password_protection` remains unresolved because it is a hosted Supabase Auth dashboard setting, not SQL.

Attempted automation status:

- Supabase CLI does not expose a leaked-password/HIBP setting in project config.
- `supabase/config.toml` has no setting for leaked-password protection.
- Dashboard browser access currently lands on sign-in in the automation browser, so the toggle cannot be changed safely from this session.

Manual action required:

- Supabase Dashboard → SlateCamp project `hrpdwqurngnyajuhbkdg` → Authentication → Attack Protection → enable leaked password protection / Have I Been Pwned password check.

## Final state

SQL-addressable Advisor warnings are resolved.

Remaining Advisor count: 1 hosted Auth configuration warning.
