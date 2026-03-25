<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# paywall

Access control and tier-gated feature logic. Server-side only (use server).

## Purpose

Enforces paywall rules for free vs paid tiers. Tracks free user daily question cap, score reveal (once-per-free-user), and feature-level gating. All functions are server actions.

## Key Files

| File | Description |
|------|-------------|
| `check-access.ts` | `checkFeatureAccess(featureKey)`, `canAccess(featureKey)`, `getUserTier()`, `isPaidUser()`. Queries `feature_flags` + `user_subscriptions`. |
| `daily-cap.ts` | `checkDailyCap(userId)` (free users: 20 Q/day), `incrementDailyCount(userId, count)`. Resets daily at UTC midnight. Returns remaining count. |
| `score-reveal.ts` | `checkScoreRevealAccess(userId)` (free users see once), `markScoreRevealed(userId)`. Paid users always see score. |
| `index.ts` | Barrel exports: `checkFeatureAccess`, `canAccess`, `getUserTier`, `isPaidUser`, types. |

## For AI Agents

### Working In This Directory

- All functions are `'use server'` only (server actions, no client calls).
- Read from `user_subscriptions` and `user_global_stats` tables.
- Return structured results: `{ allowed, reason?, ... }` for diagnostics.
- Silent failures on edge cases (e.g., increment cap failure won't break quiz).

### Adding New Paywall Rule

1. Create new function in appropriate file (e.g., `feature-limits.ts` for feature-level gating).
2. Accept `userId` as param; query `user_subscriptions` to resolve tier.
3. Return structured result with `allowed` boolean + context (remaining, cap, etc.).
4. Export from `index.ts` barrel.

### Common Patterns

- **Tier checking**: Query `user_subscriptions` with status = 'active' or 'trialing'; default to 'free'.
- **Daily reset**: Split date on 'T', compare to `free_questions_reset_date`, reset if new day.
- **Error handling**: Use `try/catch` for increment/update; never throw on paywall failure.
- **Reason strings**: Provide user-facing message in result (e.g., "Upgrade to Camp to unlock").

## Dependencies

### Internal

- `@/lib/supabase/server` — Create server Supabase client.
- `@/types/app` — `UserTier` type.

### External

- Supabase (server client).

<!-- MANUAL: -->
