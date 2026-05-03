# Repository Truth Policy

## Evidence hierarchy

When sources conflict, prioritize in this order:

1. Current user instruction.
2. Current Git working tree and file contents.
3. Current tests/build/deployment config.
4. Git history and recent commits.
5. `.ai` folder and internal docs.
6. Older external notes or prior summaries.
7. General framework knowledge.

## How to handle conflicts

- Name the conflict directly.
- Quote or cite the file paths and commit evidence where possible.
- Do not silently choose the more convenient source.
- Mark stale docs as stale rather than forcing the code to match them.
- Ask for user direction only when the conflict blocks safe progress.

## Claims standard

Every strong technical claim should be backed by at least one of:

- file path and relevant line range,
- command output,
- test result,
- dependency/config entry,
- Git commit or diff.
