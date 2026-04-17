# Architecture Improvement Plan

**Last Updated:** 2026-04-16

## Plan
1. Keep stable architecture docs current with route and service changes.
2. Identify the top 10 client-heavy files that should remain client-only vs move server-first.
3. Shrink cross-boundary ambiguity in admin/editor and quiz-v2 flows.
4. Document shared runtime chokepoints: root layout, middleware, Supabase server helpers, portal layout, quiz store.
