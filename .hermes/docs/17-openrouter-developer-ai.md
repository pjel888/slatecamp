# OpenRouter Developer AI

SlateCamp developer AI should prefer OpenRouter when `OPENROUTER_API_KEY` is available.

Canonical runbook: `.ai/00_system/OPENROUTER_DEVELOPER_AI_RUNBOOK.md`.

## Local Hermes setup

Keep the real key outside the repo:

```bash
hermes config env-path
# add OPENROUTER_API_KEY=<developer-openrouter-key> to that file
```

Set Hermes to use OpenRouter with the verified current-account default:

```bash
hermes config set model.provider openrouter
hermes config set model.default deepseek/deepseek-chat
hermes config set model.api_mode chat_completions
hermes config set model.max_tokens 1000
hermes config set agent.reasoning_effort low
hermes config set delegation.provider openrouter
hermes config set delegation.model deepseek/deepseek-chat
```

After OpenRouter credits/limits can afford GPT-5.5-sized Hermes prompts, upgrade with:

```bash
hermes config set model.default openai/gpt-5.5
hermes config set delegation.model openai/gpt-5.5
hermes config set model.max_tokens 4096
```

Smoke test:

```bash
hermes -z "Health check only. Reply exactly: OPENROUTER_HERMES_DEFAULT_PATH_OK" -t "" --ignore-rules
```

## Boundary

- Developer AI key: `~/.hermes/.env`.
- Product AI key: app/deployment server env such as `.env.local`.
- Public learner AI remains deferred for the current launch.
- Never use `NEXT_PUBLIC_*` for OpenRouter secrets.
