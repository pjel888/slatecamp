# OPENROUTER_DEVELOPER_AI_RUNBOOK

**Status:** Current after 2026-05-09 developer OpenRouter audit.
**Scope:** Internal developer AI only: Hermes sessions, delegated agent calls, companion AI reviews, local scripts run by maintainers.
**Not scope:** Learner/public AI features. Those remain deferred for the current payment-free/live-AI-provider-free launch cutline.

## Decision

SlateCamp should use OpenRouter as the preferred provider for developer AI when an `OPENROUTER_API_KEY` is available.

This is separate from the product runtime provider boundary:

| Boundary | Current stance | Key location | Notes |
|---|---|---|---|
| Developer AI | Active/preferred through OpenRouter | `~/.hermes/.env` for Hermes; tool-specific local env only when needed | Used for agent planning, review, summaries, and local developer automation. |
| Learner/public AI | Deferred post-launch | App server env such as `.env.local` or deployment env | `/api/ai/*`, teach-back, question generation, embeddings, and maintenance AI scripts use `src/lib/ai/provider.ts` but should not be public launch blockers. |

Do not use `NEXT_PUBLIC_*` for OpenRouter credentials in either boundary.

## Current audit findings

- App AI routes/actions/scripts now use `src/lib/ai/provider.ts`; direct OpenAI/Anthropic SDK calls were not found in `src/` or `scripts/` outside the provider abstraction and tests.
- `src/lib/ai/provider.ts` supports `AI_PROVIDER=openrouter`, direct `openai`, and direct `anthropic` fallback modes.
- Product AI is still launch-deferred: quiz AI helper UI is disabled, and public copy must not imply live AI readiness.
- Repo-local `.hermes/config.yaml` is now an OpenRouter-preferred baseline, but real secrets still belong in `~/.hermes/.env`, not the repo.
- Active user Hermes config verified on 2026-05-09: `model.provider=openrouter`, `model.default=deepseek/deepseek-chat`, `model.api_mode=chat_completions`, `model.max_tokens=1000`, `agent.reasoning_effort=low`, `delegation.provider=openrouter`, and `delegation.model=deepseek/deepseek-chat`.
- `OPENROUTER_API_KEY` is present in the active Hermes env from `hermes config env-path`; the key value was not printed or committed.
- `.codex/config.toml` is absent in this worktree even though older docs mention it. Treat those references as stale until a config file is recreated intentionally.
- `.codex/agents/*.md` frontmatter uses model aliases such as `sonnet`, `opus`, and `haiku`; those are agent-role hints, not provider credentials.

## Recommended Hermes configuration

Add the developer OpenRouter key to the Hermes env file without printing it:

```bash
hermes config env-path
# edit that file and add:
OPENROUTER_API_KEY=<developer-openrouter-key>
```

Prefer a separate developer OpenRouter key from any product/staging key so cost limits, logging, and revocation are isolated.

Set the main Hermes provider to OpenRouter. The verified working default for the current account is `deepseek/deepseek-chat` with a conservative token cap:

```bash
hermes config set model.provider openrouter
hermes config set model.default deepseek/deepseek-chat
hermes config set model.api_mode chat_completions
hermes config set model.max_tokens 1000
hermes config set agent.reasoning_effort low
```

Set delegated Hermes subagents to OpenRouter when using Hermes delegation instead of direct Codex/Kimi CLIs:

```bash
hermes config set delegation.provider openrouter
hermes config set delegation.model deepseek/deepseek-chat
```

Verified one-shot checks:

```bash
hermes -z "Health check only. Reply exactly: OPENROUTER_HERMES_DEFAULT_PATH_OK" -t "" --ignore-rules
```

A direct OpenRouter API smoke also passed for `openai/gpt-5.5`, but Hermes with `openai/gpt-5.5` is currently blocked by account credit/token affordability for Hermes' loaded system prompt (`Prompt tokens limit exceeded`). After topping up credits or raising limits, upgrade with:

```bash
hermes config set model.default openai/gpt-5.5
hermes config set delegation.model openai/gpt-5.5
hermes config set model.max_tokens 4096
```

Model examples verified from the OpenRouter catalog during this pass included `anthropic/claude-sonnet-4.5`, `anthropic/claude-sonnet-4`, `openai/gpt-5.5`, `openai/gpt-5.1`, `openai/gpt-5`, `deepseek/deepseek-chat`, and `openai/gpt-4o`.

## Companion tool policy

- Hermes: preferred developer AI router. Use OpenRouter for main and delegated Hermes calls when the key is configured.
- Codex CLI: may still require OpenAI/Codex OAuth or its own supported provider configuration. Do not assume standalone Codex uses OpenRouter unless a working Codex config proves it.
- Kimi CLI: remains a direct Kimi/Moonshot companion unless configured otherwise by its own supported config. To use Kimi through OpenRouter, prefer a Hermes/OpenRouter model such as `moonshotai/kimi-k2.6`.
- DeepSeek/direct provider keys: fallback only. Keep them available if useful, but do not document them as the preferred SlateCamp developer AI path.

## Privacy and source-control rules

- Never commit OpenRouter keys, `.env.local`, `~/.hermes/.env`, `~/.codex/auth.json`, or OAuth/session files.
- Do not paste Supabase service-role keys, private env values, production data rows, student PII, or proprietary source drops into OpenRouter prompts.
- OpenRouter routes requests to third-party model providers. Treat prompts and uploaded context as external processing unless a provider-specific data-control setting has been verified.
- Prefer source excerpts and redacted logs over raw env files or database exports.
- Use app/runtime `OPENROUTER_API_KEY` only for product AI surfaces; use Hermes/developer `OPENROUTER_API_KEY` for agent work. They may be the same during solo development only if the budget owner intentionally accepts shared cost and audit trails.

## Remaining risks / notes

| Risk | Status | Mitigation |
|---|---|---|
| Developer and product OpenRouter keys can be confused | Mitigated, keep monitoring | Product key belongs in app server env; developer key belongs in `~/.hermes/.env`; use separate OpenRouter dashboard limits when possible. |
| Standalone Codex/Kimi CLIs may not route through OpenRouter | Open | Use Hermes/OpenRouter for provider-unified developer AI; keep direct CLI usage documented as fallback/companion behavior only. |
| GPT-5.5 through Hermes exceeds current OpenRouter credit/token affordability | Open | Active Hermes default uses `deepseek/deepseek-chat` through OpenRouter with `model.max_tokens=1000`; top up OpenRouter credits before switching Hermes default to `openai/gpt-5.5`. |
| Learner AI still needs privacy/cost/rate-limit review | Deferred | Before enabling public AI, run staging smoke tests, cost caps, rate limits, provider data-control review, and copy review. |
| Embedding model dimensionality drift | Deferred | Keep `OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small` unless re-indexing existing 1536-dimensional embeddings. |
| `.codex/config.toml` docs are stale | Mitigated in current docs | Current docs say standalone Codex OpenRouter routing is unverified and must not be assumed. |

## Verification checklist

- [x] `~/.hermes/.env` contains `OPENROUTER_API_KEY` without exposing its value.
- [x] `hermes config` shows `model.provider: openrouter` and an OpenRouter model slug.
- [x] Direct OpenRouter API health check returned `OPENROUTER_DIRECT_OK` for `openai/gpt-5.5`.
- [x] Hermes default-path health check returned `OPENROUTER_HERMES_DEFAULT_PATH_OK` using `deepseek/deepseek-chat` through OpenRouter.
- [ ] Hermes `openai/gpt-5.5` default is blocked until OpenRouter credits/token affordability are raised.
- [x] Product runtime remains live-AI-free unless a future AI launch PR explicitly changes the cutline.
- [x] No OpenRouter secret is committed or exposed as `NEXT_PUBLIC_*`.
