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

SlateCamp developer AI is Codex-first with GPT-5.5 where available. Merge/set:

```bash
hermes config set model.provider openai-codex
hermes config set model.default gpt-5.5
hermes config set model.api_mode responses
hermes config set model.max_tokens 4096
hermes config set agent.reasoning_effort low
hermes config set delegation.provider openai-codex
hermes config set delegation.model gpt-5.5
```

OpenRouter belongs to app/runtime AI for learners and product users through `src/lib/ai/provider.ts`; do not force Hermes/developer agents through OpenRouter by default.

See `docs/17-codex-developer-ai.md` and `.ai/00_system/OPENROUTER_APP_AI_RUNBOOK.md` before changing provider behavior.

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
