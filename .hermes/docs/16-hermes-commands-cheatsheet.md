# Hermes Commands Cheatsheet

## Setup and health

```bash
hermes doctor
hermes model
hermes config
hermes config check
hermes config env-path
```

## OpenRouter developer AI

```bash
hermes config set model.provider openrouter
hermes config set model.default deepseek/deepseek-chat
hermes config set model.api_mode chat_completions
hermes config set model.max_tokens 1000
hermes config set agent.reasoning_effort low
hermes config set delegation.provider openrouter
hermes config set delegation.model deepseek/deepseek-chat
hermes -z "Health check only. Reply exactly: OPENROUTER_HERMES_DEFAULT_PATH_OK" -t "" --ignore-rules
```

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
