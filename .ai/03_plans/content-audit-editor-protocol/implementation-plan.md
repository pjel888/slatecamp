# Implementation Plan — Content Audit Editor Protocol

## Decision

Create a deep reference protocol under `.ai/06_specs/deep/05-reference/content-audit-editor-protocol/` and a tracked rollout plan under `.ai/03_plans/content-audit-editor-protocol/`.

## Drivers

1. `.ai/content-audit-export/` is generated and should not carry durable instructions.
2. Editors need exact rules for article edits, question edits, UI-block preservation, and safe push commands.
3. Future AI fact-checking must have a safety protocol before automation exists.
4. Existing content-audit scripts already enforce many safety gates; docs should teach editors how to use them.

## Alternatives considered

| Option | Outcome |
| --- | --- |
| Put instructions in `.ai/content-audit-export/` | Rejected: generated data is not canonical and may be deleted/re-exported. |
| Put everything in `.ai/03_plans/` | Rejected: plans are active rollout state, not durable operating protocol. |
| Put everything in `.ai/06_specs/deep/` | Rejected for tracking: deep specs are durable reference, not active rollout ledger. |
| Split spec + plan | Chosen: durable protocol plus active rollout tracking. |

## Work phases

### Phase 1 — Protocol creation

- Add local `AGENTS.md` for protocol scope.
- Add README and eight operating docs.
- Cover articles, questions, fact-checking, review safety, commands, review packet templates, quality rubric, and pilot playbook.

### Phase 2 — Index sync

- Add plan entry to `.ai/03_plans/README.md`.
- Add reference entry to `.ai/06_specs/README.md`.
- Add the new folder/files to `.ai/06_specs/deep/00-meta/001-index.md`.

### Phase 3 — Verification

- Verify referenced package scripts exist.
- Verify referenced paths are either present or generated/optional by design.
- Run `git diff --check`.
- Run lightweight grep checks for `content-audit:*` command references.

### Phase 4 — Pilot adoption (queued)

- Select one exported article with linked questions and sources.
- Complete a review packet using the template.
- Follow the protocol through dry-run only.
- Record friction and update the protocol if command behavior or review language is unclear.

### Phase 5 — Future automation gates (future)

These are intentionally out of scope for the docs rollout:

- AI fact-check execution.
- Article rewrite automation.
- Admin AI Audit UI integration.
- Source row edit workflow.
- Component auto-insertion.

## Acceptance criteria

- [x] `.ai/06_specs/deep/05-reference/content-audit-editor-protocol/` exists with protocol docs.
- [x] `.ai/03_plans/content-audit-editor-protocol/` exists with rollout tracking.
- [x] Article, question, fact-check, safety, and command workflows are documented.
- [x] Review packet templates and quality rubric are documented.
- [x] Docs state dry-run-first and apply-gated Supabase mutation rules.
- [x] Docs state no AI APIs are integrated.
- [x] Docs state generated exports are not canonical docs.
- [x] Indexes point to the new docs.
- [ ] Dry-run-only editorial pilot completed.
- [ ] `git diff --check` passes for the latest docs update.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Editors hand-edit `candidate.md` | Protocol marks it generated-only and source edits go through `normalized.md`. |
| UI placeholders are damaged | Protocol requires placeholder preservation and validation before push. |
| Question changes are mixed into article edits | Separate `question-edits/<question_id>.json` workflow. |
| Stale remote data is overwritten | Push scripts must stale-check before update. |
| Bulk apply is misused | Exact confirmation phrase and dry-run-first policy. |
| Future AI workflows bypass source policy | Fact-check policy requires evidence records and forbids invented citations. |

## Verification commands

```bash
node -e "const p=require('./package.json'); for (const k of Object.keys(p.scripts)) if(k.startsWith('content-audit')) console.log(k)"
git diff --check
```

## Rollout notes

- Keep this plan active until one dry-run-only editorial pilot completes.
- After pilot, update status fields and either close this plan or create a follow-up plan for AI fact-checking implementation.
