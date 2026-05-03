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

If your model/provider is not configured yet:

```bash
hermes model
```
