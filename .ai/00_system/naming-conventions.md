# .ai Naming Conventions

**Last Updated:** 2026-04-16

## Date format

Use ISO-style dates in filenames whenever the document is time-bound:

- `YYYY-MM-DD_subject-purpose.md`
- Example: `2026-04-16_ai-workspace-audit.md`

## Preferred filename patterns by document type

| Type | Preferred Pattern | Example |
| --- | --- | --- |
| Audit | `YYYY-MM-DD_<scope>-audit.md` | `2026-04-16_ai-workspace-audit.md` |
| Plan | `YYYY-MM-DD_<scope>-plan.md` | `2026-04-16_ai-workspace-upgrade-plan.md` |
| Task list | `YYYY-MM-DD_<scope>-tasks.md` | `2026-04-16_ai-workspace-tasks.md` |
| Log | `YYYY-MM-DD_<scope>-log.md` or stable rolling log name | `organizational-upgrade-log.md` |
| Spec | `YYYY-MM-DD_<scope>-spec.md` or numbered spec series | `2026-04-16_state-system-spec.md` |
| Research | `YYYY-MM-DD_<topic>-research.md` | `2026-04-16_doc-taxonomy-research.md` |
| Prompt | `YYYY-MM-DD_<scope>-prompt.md` | `2026-04-16_audit-prompt.md` |

## Version suffixes

Use version suffixes only when a document evolves materially:

- `-v2`, `-v3`
- `-draft`, `-candidate`, `-superseded`, `-implemented`

Examples:

- `2026-04-16_admin-editor-plan-v2.md`
- `feature-gate-spec-draft.md`
- `stairway-configurator-fix-superseded.md`

## Folder naming rules

- Use numbered top-level folders for operational taxonomy: `00_*` through `13_*`
- Use lowercase kebab-case for new subordinate folders unless an existing legacy folder is being preserved as-is
- Preserve inherited legacy names when they already carry historical meaning or external references

## Readability rules

- Prefer concise, explicit nouns over vague names like `misc`, `stuff`, or `notes2`
- Encode status in content or metadata when possible, not just in filename
- Do not rename historical files solely to enforce this standard unless a migration plan is documented first
