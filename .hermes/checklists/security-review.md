# Security Review Checklist

## Supabase / Database Checklist

For any Supabase, migration, RLS, RPC, grant, policy, or Supabase-client access change, follow `.ai/00_system/supabase-change--protocol--v1.md`.

- [ ] Supabase Advisor baseline captured before SQL work, or unavailable evidence stated.
- [ ] Supabase lint baseline captured before SQL work, or unavailable evidence stated.
- [ ] New/changed public tables have RLS enabled and explicit policies.
- [ ] `anon`, `authenticated`, and `service_role` access is intentionally documented per object.
- [ ] SECURITY DEFINER functions have callsite review, fixed search path/grants, and no unnecessary public/authenticated exposure.
- [ ] Service-role usage stays server-only and is preceded by explicit user/ownership/admin checks.
- [ ] Migration validated with lint, dry-run, and rollback smoke before live apply.
- [ ] After live apply, advisors/lint rerun and remaining warning names recorded.
- [ ] Hosted Supabase dashboard warnings are tracked separately from SQL remediation.

## General Checklist

- [ ] Auth boundary enforced server-side.
- [ ] Authorization checks match user roles or ownership rules.
- [ ] Sensitive values not logged or exposed.
- [ ] Inputs validated.
- [ ] Outputs safe for the context where they render.
- [ ] Dependencies are justified.
- [ ] File uploads, webhooks, and external calls are constrained if present.
- [ ] Error messages do not reveal sensitive internals.
