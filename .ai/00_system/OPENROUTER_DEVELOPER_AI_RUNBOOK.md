# OPENROUTER_DEVELOPER_AI_RUNBOOK

**Status:** Current after 2026-05-09 developer OpenRouter audit.
**Scope:** Internal developer AI only: Hermes sessions, delegated agent calls, companion AI reviews, local scripts run by maintainers.
**Not scope:** Learner/public AI features. Those remain deferred for the current payment-free/live-AI-provider-free launch cutline.

## Decision

SlateCamp should use OpenRouter as a first-class member of the Hermes developer-AI arsenal when an `OPENROUTER_API_KEY` is available.

Operationally, OpenRouter is not another product feature and not just an app provider. It is the provider/model bench behind Hermes sessions, Hermes delegation, one-shot developer agents, and swarm-style review/planning lanes — alongside Codex, OpenCode, Command Code, Kimi, and direct provider CLIs.

This is separate from the product runtime provider boundary:

| Boundary | Current stance | Key location | Notes |
|---|---|---|---|
| Developer AI | Active/preferred through OpenRouter | `~/.hermes/.env` for Hermes; tool-specific local env only when needed | Used for Hermes main sessions, Hermes delegated subagents, one-shot developer agents, planning, review, summaries, and local developer automation. |
| Learner/public AI | Deferred post-launch | App server env such as `.env.local` or deployment env | `/api/ai/*`, teach-back, question generation, embeddings, and maintenance AI scripts use `src/lib/ai/provider.ts` but should not be public launch blockers. |

Do not use `NEXT_PUBLIC_*` for OpenRouter credentials in either boundary.

## Current audit findings

- App AI routes/actions/scripts now use `src/lib/ai/provider.ts`; direct OpenAI/Anthropic SDK calls were not found in `src/` or `scripts/` outside the provider abstraction and tests.
- `src/lib/ai/provider.ts` supports `AI_PROVIDER=openrouter`, direct `openai`, and direct `anthropic` fallback modes.
- Product AI is still launch-deferred: quiz AI helper UI is disabled, and public copy must not imply live AI readiness.
- Repo-local `.hermes/config.yaml` is now an OpenRouter-preferred baseline, but real secrets still belong in `~/.hermes/.env`, not the repo.
- Active user Hermes config verified on 2026-05-09: `model.provider=openrouter`, `model.default=deepseek/deepseek-chat`, `model.api_mode=chat_completions`, `model.max_tokens=1000`, `agent.reasoning_effort=low`, `delegation.provider=openrouter`, and `delegation.model=deepseek/deepseek-chat`. Actual Hermes CLI calls currently hit the OpenRouter account prompt-token affordability ceiling (`Prompt tokens limit exceeded: ~24k > 3428`) until credits/limits are raised.
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

Set the main Hermes provider to OpenRouter. Use `deepseek/deepseek-chat` with a conservative token cap as the intended low-cost default; actual Hermes invocations still require enough OpenRouter prompt-token allowance for Hermes' loaded system prompt:

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

Hermes one-shot smoke command:

```bash
hermes -z "Health check only. Reply exactly: OPENROUTER_HERMES_DEFAULT_PATH_OK" -t "" --ignore-rules
```

Current result: blocked by OpenRouter account prompt-token affordability for Hermes' loaded system prompt (`Prompt tokens limit exceeded: ~24k > 3428`). This is an account limit/credit issue, not a repo secret or provider-abstraction issue. Direct OpenRouter API smoke for short prompts passed, and local provider tests pass.

After topping up credits or raising limits, re-run the Hermes smoke above. To upgrade to GPT-5.5 after credits/limits allow it:

```bash
hermes config set model.default openai/gpt-5.5
hermes config set delegation.model openai/gpt-5.5
hermes config set model.max_tokens 4096
```

Model examples verified from the OpenRouter catalog during this pass included `anthropic/claude-sonnet-4.5`, `anthropic/claude-sonnet-4`, `openai/gpt-5.5`, `openai/gpt-5.1`, `openai/gpt-5`, `deepseek/deepseek-chat`, and `openai/gpt-4o`.

## Developer AI bench / delegation policy

Treat OpenRouter as a provider-backed delegate lane in the same Hermes arsenal as the other AI CLIs. Use the smallest useful bench member for the job:

| Bench member | Role | How OpenRouter fits |
|---|---|---|
| Hermes + OpenRouter | Provider-unified developer AI lane for planning, review, summaries, local automation, and delegated Hermes subagents. | Use `model.provider=openrouter` and `delegation.provider=openrouter`. Current intended default is `deepseek/deepseek-chat`; actual Hermes calls require OpenRouter prompt-token affordability. GPT-5.5 is an upgrade after credits/limits allow it. |
| Codex CLI | Primary production-code builder when implementation is required. | Do not assume standalone Codex routes through OpenRouter unless the installed Codex config proves it. Hermes/OpenRouter can still plan or review Codex work. |
| OpenCode / OpenCode Go | Flexible coding/review bench and cheap fallback lane. | Keep OpenCode on its own auth/model catalog; use Hermes/OpenRouter for provider-unified second opinions or when OpenCode provider prefixes/balance fail. |
| Command Code | Taste-aware coding, planning, review, and project-style work. | Use as a separate CLI worker; use Hermes/OpenRouter for independent review or lower-cost model-bench routing. |
| Kimi direct | Long-context synthesis and alternate code/review perspective. | Direct Kimi remains valid; to route Kimi-family models through OpenRouter, use Hermes/OpenRouter model slugs when available. |
| DeepSeek via OpenRouter | Current low-cost Hermes default for this account. | Use for routine reasoning/review/delegation until GPT-5.5 credits/limits are raised. |

OpenRouter is therefore a first-class delegate path, but it is a provider/router, not a separate shell CLI. For spawned worker processes, run Hermes with `--provider openrouter -m <openrouter/model-slug>` or rely on the configured Hermes delegation defaults.

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
| Hermes OpenRouter calls exceed current account prompt-token affordability | Open | Active Hermes config uses `deepseek/deepseek-chat` through OpenRouter with `model.max_tokens=1000`, but the current account prompt-token allowance is still below Hermes' loaded prompt size. Top up OpenRouter credits or raise limits before relying on Hermes/OpenRouter delegation or switching to `openai/gpt-5.5`. |
| Learner AI still needs privacy/cost/rate-limit review | Deferred | Before enabling public AI, run staging smoke tests, cost caps, rate limits, provider data-control review, and copy review. |
| Embedding model dimensionality drift | Deferred | Keep `OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small` unless re-indexing existing 1536-dimensional embeddings. |
| `.codex/config.toml` docs are stale | Mitigated in current docs | Current docs say standalone Codex OpenRouter routing is unverified and must not be assumed. |

## Verification checklist

- [x] `~/.hermes/.env` contains `OPENROUTER_API_KEY` without exposing its value.
- [x] `hermes config` shows `model.provider: openrouter` and an OpenRouter model slug.
- [x] Direct OpenRouter API health check returned `OPENROUTER_DIRECT_OK` for `openai/gpt-5.5`.
- [ ] Hermes default-path health check is currently blocked by OpenRouter prompt-token affordability (`Prompt tokens limit exceeded: ~24k > 3428`) even with `deepseek/deepseek-chat`.
- [ ] Hermes `openai/gpt-5.5` default is blocked until OpenRouter credits/token affordability are raised.
- [x] Product runtime remains live-AI-free unless a future AI launch PR explicitly changes the cutline.
- [x] No OpenRouter secret is committed or exposed as `NEXT_PUBLIC_*`.
