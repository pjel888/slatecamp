# Code Change Protocol

## Before editing

- Check current Git status.
- Identify files likely affected.
- Read existing implementation and adjacent tests.
- Determine repo-native commands for lint, typecheck, tests, and build.
- Look for project conventions before introducing new patterns.

## During editing

- Keep changes narrow.
- Preserve existing naming, formatting, and component structure unless those are the defect.
- Avoid broad dependency additions.
- Avoid changing public contracts without documenting effects.
- Keep UI, data, and side effects separated when the repo supports that separation.

## After editing

Run the strongest available verification for the task:

- Unit tests for logic.
- Typecheck for typed projects.
- Lint/format for style guarantees.
- Build for integration breakage.
- Manual smoke path for UI flows when automated coverage is absent.

## Final report

Use this exact structure:

```text
Summary: <one sentence>
Changed: <file paths and purpose>
Verified: <commands run and results>
Risks: <remaining risks or none>
Next: <one recommended next action>
```
