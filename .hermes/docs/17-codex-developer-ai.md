# Codex Developer AI

SlateCamp developer AI is Codex-first. Use GPT-5.5 where available.

OpenRouter is not the default developer-agent provider. Keep OpenRouter for app/runtime AI that serves learners and product users through `src/lib/ai/provider.ts`.

## Local Hermes setup

When Hermes is used for developer-agent work, point Hermes at the Codex provider instead of OpenRouter:

```bash
hermes config set model.provider openai-codex
hermes config set model.default gpt-5.5
hermes config set model.api_mode responses
hermes config set model.max_tokens 4096
hermes config set agent.reasoning_effort low
hermes config set delegation.provider openai-codex
hermes config set delegation.model gpt-5.5
```

Verify without printing secrets:

```bash
hermes config check
hermes -z "Health check only. Reply exactly: CODEX_HERMES_DEFAULT_PATH_OK" -t "" --ignore-rules
```

## Developer bench roles

| Lane | Use for |
|---|---|
| Codex / GPT-5.5 | Primary implementation builder, refactors, tests, bug fixes, and PR-ready diffs. |
| Hermes with `openai-codex` | Orchestration, summaries, task routing, and delegated subagents when Hermes is the coordinator. |
| OpenCode / OpenCode Go | Fallback planner/reviewer, codebase explorer, and flexible worker lane. |
| Command Code | Taste-aware planning, review, and implementation where useful. |
| Kimi | Long-context synthesis and alternate review. |
| OpenRouter | App/runtime AI provider for learners/users; not the required developer-agent default. |

## Boundary

- Developer AI auth belongs to Codex/Hermes provider auth, not app runtime env.
- Product AI keys belong in app/deployment server env such as `.env.local` or hosting secrets.
- Public learner AI should only be enabled after privacy, cost, rate-limit, staging, and copy review.
- Never use `NEXT_PUBLIC_*` for OpenRouter secrets.
