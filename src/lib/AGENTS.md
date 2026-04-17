<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# src/lib

## Scope
This file governs `src/lib/` and its subtrees unless a deeper `AGENTS.md` overrides it.

## Current subtree reality
`src/lib/` is the shared logic and service layer with 60 directories and 396 files.

High-value areas include:
- `actions/`
- `queries/`
- `entitlements/`
- `srs/`, `readiness/`, `quiz/`
- `wiki/`
- `admin/`
- `payments/`, `payrex/`, `lemonsqueezy/`, `paywall/`
- `analytics/`, `logging/`, `audit/`
- `supabase/`
- `pd1096/`, `lot-geometry/`
- `ai/`

## What agents must inspect before editing
- actual call sites
- adjacent tests
- schema/config dependencies
- route/components consumers
- auth/entitlement implications where relevant

## Logic-layer rules
- Do not change contracts from assumption; trace callers and data dependencies.
- Preserve action/query/helper boundaries.
- Treat readiness/SRS/quiz/entitlements/payments as high-risk logic areas.
- Keep documentation grounded in code and tests, not historical plans alone.

## Validation expectations
- `bun run type-check`
- `bun run lint`
- targeted tests for affected logic areas
- schema/path/reference validation for every documented integration or subsystem claim

## Anti-laziness rule
This subtree is too interconnected for grep-only edits. Trace live consumers, tests, and schema/config ties before changing code or guidance.
