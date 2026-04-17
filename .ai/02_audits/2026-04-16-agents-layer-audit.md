# AGENTS Layer Audit

**Date:** 2026-04-16

## Summary
The repository contains 113 tracked `AGENTS.md` files. This is a strength only if the files stay current. Before this refresh, many had:
- outdated counts
- outdated subtree names
- stale architectural assumptions
- incorrect doc-path references
- insufficient anti-laziness and reconciliation guidance

## Action taken
All tracked `AGENTS.md` files were refreshed to a current-snapshot format that now states:
- governed scope
- live subtree snapshot
- local edit expectations
- validation expectations
- anti-laziness guidance
- requirement to update the local `AGENTS.md` when subtree reality changes

## Remaining limitation
The generated refresh format is intentionally concise. Future work can deepen especially important scope files (`src/app`, `src/lib`, `src/components`, `supabase`, etc.) further if more local nuance becomes necessary.
