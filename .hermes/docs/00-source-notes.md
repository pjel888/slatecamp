# Source Notes

This pack follows the current Hermes Agent structure and behavior as documented by Nous Research. The key implementation assumptions are:

- Hermes stores its home files under `~/.hermes/`.
- `SOUL.md` is global to the Hermes instance.
- Persistent memory is stored under `~/.hermes/memories/`.
- Skills live under `~/.hermes/skills/`.
- Project context files are loaded from the working directory, not from the global docs folder.

Useful references:

- Hermes configuration: https://hermes-agent.nousresearch.com/docs/user-guide/configuration
- Context files: https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files
- Persistent memory: https://hermes-agent.nousresearch.com/docs/user-guide/features/memory
- Skills: https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
- SOUL.md: https://hermes-agent.nousresearch.com/docs/user-guide/features/personality
- Checkpoints: https://hermes-agent.nousresearch.com/docs/user-guide/checkpoints-and-rollback
