# Content Audit Editor Protocol Rollout Plan

**Status:** Active rollout plan
**Spec owner:** `.ai/06_specs/deep/05-reference/content-audit-editor-protocol/`
**Generated working data:** `.ai/content-audit-export/`
**Implementation scripts:** `scripts/content-audit/` and `package.json` `content-audit:*` scripts

## Goal

Make the content round-trip export usable by AI-assisted and human editors through a tracked, safety-first protocol for article edits, linked question edits, fact-check evidence, validation, and safe push commands.

## Deliverables

- Durable editor protocol spec folder.
- Active rollout checklist.
- Cross-links from `.ai/03_plans/` and `.ai/06_specs/` indexes.
- Verification that command references match live package scripts.

## Current scope

This rollout creates documentation and operating protocol only. It does not build AI fact-checking, automatic rewriting, admin UI workflows, or new Supabase mutations.

## Status board

| Item | Status | Evidence |
| --- | --- | --- |
| Protocol spec folder | Complete | `.ai/06_specs/deep/05-reference/content-audit-editor-protocol/` |
| Article editing protocol | Complete | `02-article-editing-rules.md` |
| Question editing protocol | Complete | `03-question-editing-rules.md` |
| Fact-check source policy | Complete | `04-fact-checking-and-source-policy.md` |
| Safety checklist | Complete | `05-review-and-safety-checklist.md` |
| Command runbook | Complete | `06-command-runbook.md` |
| Review packet templates | Complete | `07-review-packets-and-templates.md` |
| Quality rubric and pilot playbook | Complete | `08-quality-rubric-and-pilot-playbook.md` |
| Index updates | Complete | `.ai/03_plans/README.md`, `.ai/06_specs/README.md`, deep index |
| Verification | Complete | `git diff --check`, command reference grep |

## Stop condition

The rollout is complete when the protocol exists, indexes point to it, command references are verified against `package.json`, docs whitespace checks pass, and the dry-run pilot is either completed or explicitly queued as follow-up.


## Pilot tracking

| Pilot step | Status | Notes |
| --- | --- | --- |
| Select one article with linked questions and sources | Queued | Prefer a small article with at least one UI placeholder. |
| Complete review packet | Queued | Use `07-review-packets-and-templates.md`. |
| Run compose/diff/validate/push dry-run | Queued | No apply during pilot unless separately approved. |
| Capture friction and update protocol | Queued | Required before batch editing. |

## Quality upgrade notes

The protocol now includes role boundaries, review packets, risk tiers, failure recovery rules, and a dry-run pilot playbook so editors do not rely on command snippets alone.
