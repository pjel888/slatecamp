# RLS Admin Policy Spec

All new AI audit tables are in the public schema, so RLS must be enabled and policies must restrict access to admins.

Supabase docs emphasize enabling Row Level Security for public tables and creating policies to grant access based on authenticated user context.

## Tables requiring RLS

```text
ai_audit_runs
ai_audit_items
ai_audit_findings
ai_change_proposals
ai_review_decisions
ai_audit_status_cache
```

## Enable RLS

```sql
alter table public.ai_audit_runs enable row level security;
alter table public.ai_audit_items enable row level security;
alter table public.ai_audit_findings enable row level security;
alter table public.ai_change_proposals enable row level security;
alter table public.ai_review_decisions enable row level security;
alter table public.ai_audit_status_cache enable row level security;
```

## Admin predicate

Codex must inspect existing SlateCamp auth/admin logic first.

Search for:

```bash
rg "user_roles"
rg "is_admin"
rg "isAdmin"
rg "requireAdmin"
rg "admin" app src lib
```

If the app already has an admin-check SQL function, reuse it.

If not, create one only after verifying the `user_roles` schema. The following is a placeholder pattern, not guaranteed to match the current table columns:

```sql
-- Adapt this to actual user_roles columns.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('admin', 'owner')
  );
$$;
```

## Policies

Example policies if `public.is_admin()` exists:

```sql
create policy "Admins can read ai_audit_runs"
on public.ai_audit_runs for select
to authenticated
using (public.is_admin());

create policy "Admins can write ai_audit_runs"
on public.ai_audit_runs for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
```

Repeat for each audit table.

## Server-side fallback

If existing admin UI uses server-side service role operations, keep service-role usage strictly server-side. Never expose service role keys in browser code.

## Non-admin behavior

Non-admin users should not be able to read or mutate any AI audit table through client-side Supabase.
