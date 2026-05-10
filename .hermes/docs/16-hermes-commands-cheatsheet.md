# Hermes Commands Cheatsheet

## Setup and health

```bash
hermes doctor
hermes model
hermes config
hermes config check
hermes config env-path
```

## Codex developer AI

SlateCamp developer AI is Codex-first with GPT-5.5 where available.

```bash
hermes config set model.provider openai-codex
hermes config set model.default gpt-5.5
hermes config set model.api_mode responses
hermes config set model.max_tokens 4096
hermes config set agent.reasoning_effort low
hermes config set delegation.provider openai-codex
hermes config set delegation.model gpt-5.5
hermes -z "Health check only. Reply exactly: CODEX_HERMES_DEFAULT_PATH_OK" -t "" --ignore-rules
```

OpenRouter belongs to app/runtime learner and user AI through `src/lib/ai/provider.ts`; do not force Hermes/developer agents through OpenRouter by default.

## Chat

```bash
hermes chat
hermes --tui
hermes chat -q "Use the slatecamp-orientation skill and inspect the repo."
```

## Project workflow

```bash
cd /path/to/slatecamp
hermes chat
```

In chat:

```text
/skills
/slatecamp-orientation
/rollback
/rollback diff 1
```

## Recovery

Use `/rollback` for agent-driven file changes. Prefer previewing a rollback diff before restoring.
