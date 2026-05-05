# Supabase Docs Notes Used for This Spec

This pack is aligned with the following Supabase platform concepts:

- Public schema tables should use Row Level Security when exposed through the API.
- Policies should restrict access based on authenticated user context.
- Server-side code may use privileged keys only if kept out of client/browser code.
- Supabase's database/API model works well for admin dashboards backed by Postgres tables.
- Local migrations should be used to manage schema changes in the repository.

Implementation note:

Codex should use the latest project conventions and existing Supabase helpers rather than copying generic examples blindly.
