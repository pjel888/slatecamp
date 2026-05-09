# Install and Merge Guide

## Safe install

Use the root `install-safe.sh` script. It writes candidate copies when a critical file already exists, instead of overwriting.

```bash
./install-safe.sh
```

## Manual install

Copy these into `~/.hermes/`:

```text
SOUL.md
config.yaml
.env.example
.gitignore
memories/
docs/
prompts/
templates/
checklists/
guardrails/
skills/
project-context/
cron/
maintenance/
```

If `~/.hermes/config.yaml` already exists, merge the recommended sections instead of replacing the file. Existing model/provider settings are usually important.

SlateCamp developer AI should prefer OpenRouter. Keep the real key in `~/.hermes/.env`, then merge/set:

```bash
hermes config set model.provider openrouter
hermes config set model.default deepseek/deepseek-chat
hermes config set model.api_mode chat_completions
hermes config set model.max_tokens 1000
hermes config set agent.reasoning_effort low
hermes config set delegation.provider openrouter
hermes config set delegation.model deepseek/deepseek-chat
```

`openai/gpt-5.5` is available on OpenRouter, but this audit found Hermes' loaded system prompt can exceed the current account's prompt-token affordability even on the low-cost default. Top up credits or raise limits before relying on Hermes/OpenRouter delegation, and only then consider making GPT-5.5 the Hermes default.

See `docs/17-openrouter-developer-ai.md` and `.ai/00_system/OPENROUTER_DEVELOPER_AI_RUNBOOK.md` before changing provider behavior.

## Project context install

Hermes loads project context from the working directory. Copy the Slatecamp project context into the Slatecamp repository root:

```bash
cp ~/.hermes/project-context/slatecamp/.hermes.md /path/to/slatecamp/.hermes.md
```

Optional compatibility file:

```bash
cp ~/.hermes/project-context/slatecamp/AGENTS.md /path/to/slatecamp/AGENTS.md
```

## First command sequence

```bash
cd /path/to/slatecamp
hermes doctor
hermes model      # only if provider/model is not configured
hermes chat
```

Start with:

```text
Use the slatecamp-orientation skill. Inspect the .ai folder, repo docs, git history, and current tree. Produce the Codebase Orientation Report before modifying files.
```
