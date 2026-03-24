<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# blindspot

Blindspot queue generation and tracking. Server-side only (use server).

## Purpose

Implements Blindspot (Focus Review) protocol: identifies user's 3 weakest taxonomy nodes (Red zone < 0.4 mastery + Grey zone untouched) and creates 12-question quiz queue. Nightly job + on-demand via dashboard. Tracks pre/post mastery and improvement.

## Key Files

| File | Description |
|------|-------------|
| `generate-queue.ts` | `generateBlindspotQueue(userId)` — finds 3 weakest + untouched nodes, creates queue, snapshots pre-mastery. `completeBlindspotQueue(queueId, userId)` — snapshots post-mastery, counts improved nodes. `deferBlindspotQueue(queueId, userId)` — defer 48h. `getActiveBlindspotQueue(userId)` — returns current queue for dashboard. |
| `generate-queue.test.ts` | Bun tests: active queue guard, no weak nodes, queue creation, 3-node cap, grey node discovery. Uses mocked Supabase client. |

## For AI Agents

### Working In This Directory

- All functions are `'use server'` (server actions/cron jobs).
- Red nodes: `current_mastery_weight < 0.4`. Grey nodes: no row in `user_node_mastery` (untouched).
- Capped at 3 target nodes per queue (top 1-3 weak + fill with grey if needed).
- Snapshots pre/post mastery; tracks `nodes_improved` count for completion stats.

### Adding New Queue Logic

1. Follow existing query pattern: find weak nodes → find grey nodes → create queue.
2. Always snapshot pre-state before modification.
3. Return `{ queueId, nodeIds }` or null for guard conditions.
4. Log errors with timestamp + context (console.error as fallback).

### Common Patterns

- **Queue guards**: Check `blindspot_queues` for pending/in_progress before creating new.
- **Mastery filtering**: `.lt('current_mastery_weight', 0.4)` for red, check touched set for grey.
- **Snapshot logic**: Before queue (pre), after completion (post). Compare for improvement.
- **Error handling**: Return null on insert failure; never throw on paywall/queue logic.

## Dependencies

### Internal

- `@/lib/supabase/server` — Create server Supabase client.

### External

- Supabase (server client).

<!-- MANUAL: -->
