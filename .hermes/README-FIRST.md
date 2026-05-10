# Slatecamp Hermes Pack

This ZIP contains a ready-to-drop Hermes home scaffold for Slatecamp. It is built to make Hermes safer, more useful, and more project-aware without assuming a tech stack that has not been verified from the repository.

## What this pack does

- Sets a strong global `SOUL.md` for a rigorous Slatecamp-focused AI operator.
- Adds bounded `MEMORY.md` and `USER.md` seed files.
- Adds project operating documents, prompts, templates, checklists, and guardrails.
- Adds Slatecamp-specific Hermes skills under `~/.hermes/skills/`.
- Includes project context files that should be copied into the Slatecamp repository root.

## Critical install rule

Do not blindly overwrite an existing `~/.hermes/config.yaml`, `~/.hermes/SOUL.md`, `~/.hermes/memories/MEMORY.md`, or `~/.hermes/memories/USER.md` if you already use Hermes. Existing files may contain model settings, OAuth state, provider keys, memory, or custom persona content.

Use `install-safe.sh` for a non-destructive copy, or merge manually.

## Fast install

```bash
unzip slatecamp-hermes-pack.zip
cd slatecamp-hermes-pack
./install-safe.sh
```

Then copy the project context file into the Slatecamp repo root:

```bash
cp ~/.hermes/project-context/slatecamp/.hermes.md /path/to/slatecamp/.hermes.md
# optional compatibility file for other agents:
cp ~/.hermes/project-context/slatecamp/AGENTS.md /path/to/slatecamp/AGENTS.md
```

Start Hermes from the Slatecamp repository:

```bash
cd /path/to/slatecamp
hermes doctor
hermes chat
```

SlateCamp developer AI is Codex-first with GPT-5.5 where available. If your model/provider is not configured yet, use the interactive picker or set the Codex defaults:

```bash
hermes model
hermes config set model.provider openai-codex
hermes config set model.default gpt-5.5
hermes config set model.api_mode responses
hermes config set model.max_tokens 4096
hermes config set agent.reasoning_effort low
hermes config set delegation.provider openai-codex
hermes config set delegation.model gpt-5.5
```

OpenRouter belongs to app/runtime AI for learners and product users through `src/lib/ai/provider.ts`; do not force Hermes/developer agents through OpenRouter by default.

See `docs/17-codex-developer-ai.md` for the developer-agent model policy.
