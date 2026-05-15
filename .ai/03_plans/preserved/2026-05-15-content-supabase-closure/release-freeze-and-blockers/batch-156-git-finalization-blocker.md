# Batch 156 Git Finalization Blocker

## Status

Blocked at git staging.

## Blocker

The Batch 156 content bundle passed local generation and scoped validation, but `git add` cannot create the repository index lock in this sandbox.

```text
Command: git add -f --pathspec-from-file=.ai/03_plans/batch-156-git-handoff-stage-paths.txt
Error: fatal: Unable to create '/Users/philiplewis/slatecamp/.git/index.lock': Operation not permitted
```

## Exact Stage Pathspec

Use the existing pathspec file:

```text
.ai/03_plans/batch-156-git-handoff-stage-paths.txt
```

The pathspec contains only the intended Batch 156 reservation, manifest, article bundle, source-map, QA, report, ledger, scoped-check, runner, and handoff files. It intentionally excludes unrelated dirty files, active read-only recovery prompts, content-roundtrip run spam, `.hermes` skill docs, root aggregate validation files, and unrelated compose-error deletions.

## Validation Completed Before Blocker

- Batch 156 runner: pass
- Path existence: pass, with the target article stale compose-error intentionally deleted
- JSON parse across Batch 156 JSON paths: pass
- Compose/diff validation: pass
- Content marker scan: pass
- Unsupported exact-claim scan: pass
- Linked-question/question-edit parity: pass
- Answer-key change review: pass_no_answer_key_changes
- Source hash checks: pass
- Scoped file whitespace check: pass

## Required Next Git Commands Outside This Sandbox

```bash
git add -f --pathspec-from-file=.ai/03_plans/batch-156-git-handoff-stage-paths.txt
git diff --cached --check
git diff --cached --name-only
git commit -m "chore(content): accept source-audited batch 156"
git push origin 3dlab-gray-viewport-bg
```

## Safety Notes

Do not stage unrelated dirty files. Do not stage content-roundtrip run directories not listed in the Batch 156 pathspec. Do not stage `.hermes` skill docs, root aggregate validation files, active read-only blocked-source-recovery prompts, or unrelated compose-error deletions.
