# 24 — API / Provider Timeout Remediation

Generated: 2026-04-27T00:26:50Z

## Hypothesis
AI provider calls were unbounded. A slow OpenAI/Anthropic call could hold an API route until the platform/serverless timeout and distort p95/p99 latency. Adding provider-level timeout signals and non-2xx checks gives API routes bounded failure behavior without calling live paid providers during tests.

## Change made

| File | Change |
| --- | --- |
| `src/lib/ai/provider.ts` | Added timeout budgets for completion, embedding, and streaming fetches. |
| `src/lib/ai/provider.ts` | Added `res.ok` checks with bounded error-body excerpts before JSON parsing/stream reading. |

## Timeout budgets

| Budget | Default | Override env name |
| --- | ---: | --- |
| AI completion | 30,000 ms | `AI_COMPLETION_TIMEOUT_MS` |
| AI embedding | 10,000 ms | `AI_EMBEDDING_TIMEOUT_MS` |
| AI stream | 60,000 ms | `AI_STREAM_TIMEOUT_MS` |

No provider API keys or live provider calls were used for this remediation.

## Remaining API/provider work
- Payment SDK timeout wrappers are still pending; they require mock-provider tests around `src/lib/payments/provider.ts`.
- `/api/ai/tutor` still has a sequential chain: embedding → Supabase RPC → completion → audit completion. The provider calls now have budgets, but the route needs an aggregate route-level budget and mock benchmark.
- Existing `perf:api` only covers safe static GETs and auth-guard behavior, not POST provider flows.

## Safe mock benchmark design
1. Stub `globalThis.fetch` for OpenAI/Anthropic JSON and streaming responses.
2. Exercise direct provider methods with delay buckets: 50 ms, 500 ms, near-timeout, and timeout.
3. Mock route dependencies for `/api/ai/tutor` and measure p50/p95/p99 + timeout rate.
4. Keep live provider calls opt-in only through local/CI secrets.

## Verification
| Command | Exit | Log |
| --- | ---: | --- |
| `bun run type-check` | 0 | `.ai/00_performance/logs/remediation-type-check-after-ai-timeouts.log` |

## Rollback plan
Remove the timeout constants/helpers and `signal`/`res.ok` additions from `src/lib/ai/provider.ts`. This restores the previous unbounded provider behavior.
