# GitNexus Refresh / Impact Evidence — 2026-04-28

## Index refresh

Command:

```bash
npx --yes gitnexus analyze
```

Result: PASS. GitNexus indexed SlateCamp successfully.

Evidence: `.ai/05_logs/2026-04-28/gitnexus-analyze-attempt.log`.

## Detect changes

Command:

```bash
npx --yes gitnexus detect-changes --scope all --repo slatecamp
```

Result: PASS with critical blast radius because 77 files and 196 symbols changed across admin/developer/CEO/demo-auth surfaces.

Evidence: `.ai/05_logs/2026-04-28/gitnexus-detect-changes-final-after-agent-doc-restore.log`.

## Symbol impact checks

| Symbol | Result | Evidence |
| --- | --- | --- |
| `assertCeoAccess` | MEDIUM, 14 direct impacted CEO query functions | `.ai/05_logs/2026-04-28/gitnexus-impact-assert-ceo-access-slatecamp.log` |
| `assertPermission` | CRITICAL, 66 impacted admin/action flows | `.ai/05_logs/2026-04-28/gitnexus-impact-assert-permission-slatecamp.log` |
| `resolveCurrentUserRole` | LOW by GitNexus after disambiguation | `.ai/05_logs/2026-04-28/gitnexus-impact-resolve-current-user-role-uid.log` |
| server `createClient` | LOW by GitNexus after disambiguation | `.ai/05_logs/2026-04-28/gitnexus-impact-server-create-client-uid.log` |

## Notes

Initial GitNexus commands without `--repo slatecamp` failed because both `vitruvius` and `slatecamp` are indexed. The commands were rerun with the explicit repo selector.
