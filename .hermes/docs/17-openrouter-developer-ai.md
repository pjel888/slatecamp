# OpenRouter Developer AI

SlateCamp developer AI should prefer OpenRouter when `OPENROUTER_API_KEY` is available. Treat it as a first-class provider/model lane in the Hermes agent bench — the way Codex, OpenCode, Command Code, and Kimi are first-class worker lanes — while remembering that OpenRouter itself is a provider router, not a separate shell CLI.

Canonical runbook: `.ai/00_system/OPENROUTER_DEVELOPER_AI_RUNBOOK.md`.

## Local Hermes setup

Keep the real key outside the repo:

```bash
hermes config env-path
# add OPENROUTER_API_KEY=<developer-openrouter-key> to that file
```

Set Hermes to use OpenRouter with the intended low-cost default. Actual calls still require enough OpenRouter prompt-token allowance for Hermes' loaded system prompt:

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

Current account caveat: this can fail with `Prompt tokens limit exceeded` when the OpenRouter account allowance is below Hermes' loaded prompt size. That means the config path is wired but the account needs credits/limits raised before Hermes/OpenRouter delegation is reliable.

## Delegation role

Use OpenRouter for Hermes-native delegation and one-shot workers. Default to read-only prompts unless a task intentionally authorizes edits:

```bash
hermes -z "Read-only review: inspect the diff and report blockers only. Do not modify files." \
  --provider openrouter \
  -m deepseek/deepseek-chat \
  -t terminal,file \
  --ignore-rules
```

Use the full CLI bench deliberately:

| Lane | Use for |
|---|---|
| Codex | Primary implementation builder. |
| OpenCode / OpenCode Go | Flexible coding/review worker and fallback. |
| Command Code | Taste-aware planning/review/implementation. |
| Kimi | Long-context synthesis and alternate review. |
| Hermes + OpenRouter | Provider-unified planning, review, summaries, one-shot workers, and delegated Hermes subagents. |

## Boundary

- Developer AI key: `~/.hermes/.env`.
- Product AI key: app/deployment server env such as `.env.local`.
- Public learner AI remains deferred for the current launch.
- Never use `NEXT_PUBLIC_*` for OpenRouter secrets.
