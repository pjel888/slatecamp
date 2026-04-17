# Data Flow Map

**Last Updated:** 2026-04-16

## Main flow types
- **Learner flow:** route -> server action/query -> Supabase tables/RPC -> client store/UI
- **Admin flow:** admin route -> admin action -> validation/compatibility helpers -> Supabase -> cache revalidation
- **Quiz-v2 flow:** setup route -> `startSession` -> entitlements + selection logic + session issuance -> client stores -> answer submission/end-session actions
- **Wiki flow:** route/sidebar/search -> wiki actions -> taxonomy/article joins -> published article rendering
- **Ops flow:** cron/webhook/AI route handlers -> service helpers / Supabase / external providers
