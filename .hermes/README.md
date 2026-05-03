# `.hermes` Slatecamp Operating System

This folder is a project-aware Hermes home scaffold. It gives Hermes a clear identity, stable working rules, bounded memory, reusable skills, and a document library for Slatecamp.

## How Hermes should use this folder

1. `SOUL.md` defines the global agent identity.
2. `memories/MEMORY.md` and `memories/USER.md` seed durable memory.
3. `skills/` contains reusable workflows that Hermes can load only when relevant.
4. `docs/`, `guardrails/`, `checklists/`, `templates/`, and `prompts/` are reference material.
5. `project-context/slatecamp/.hermes.md` should be copied into the Slatecamp repository root so Hermes can load project-local rules automatically.

## Strong default behavior

Hermes should inspect before acting, prefer verifiable repository facts over assumptions, run tests or explain why it cannot, preserve user work, and avoid risky file operations unless the task explicitly requires them.

## Files intentionally excluded

This pack does not include `.env`, `auth.json`, real API keys, session history, logs, cache files, checkpoints, or provider credentials.
