# MEMORY.md — Slatecamp

Slatecamp is local-first. The active project Hermes system lives in the repo-local `.hermes/` folder, not a required global `~/.hermes` setup. Do not recommend global Hermes install/copy/sync unless Philip explicitly asks.

§

Primary Slatecamp AI/context folders:
- `.ai/` = primary intelligence layer: strategy, audits, plans, workflows, AI notes, prompt systems, known issues.
- `.hermes/` = local Hermes operating system: guardrails, skills, checklists, prompts, docs.
- `.codex/` = prior code-agent work, implementation artifacts, generated plans/patches.
- `.omx/` = orchestration/runtime state, loop outputs, execution traces, automation context.
Also inspect `.cursor/`, `.claude/`, `.gemini/`, `.github/`, `AGENTS.md`, and `.cursorrules` when relevant.

§

Do not assume Slatecamp’s tech stack, commands, package manager, architecture, deployment target, product behavior, or folder meaning. Infer from live repo files, current Git state, package manifests, lockfiles, configs, source tree, and actual errors.

§

Before significant Slatecamp work, inspect in this order when relevant:
1. current directory / `pwd`
2. Git status and branch
3. `.ai/`
4. `.hermes/`
5. `.codex/`
6. `.omx/`
7. root docs/configs/manifests
8. live code and tests

§

Path discipline is critical. Philip may already be inside `~/slatecamp` or `~/slatecamp/.hermes`. Do not tell him to `cd` into Slatecamp if he is already there. If prompt shows `~/slatecamp/.hermes`, repo-root files are referenced with `../`, e.g. `../.hermes.md` and `../.ai/`. Never accidentally reference `.hermes/.hermes/` unless that path truly exists.

§

Root `.hermes.md` is the active project instruction trigger. Local `.hermes/` is the deeper operating system it points to. Keep them distinct:
- `.hermes.md` = repo-root control file
- `.hermes/` = local Hermes folder/system
- `.ai/` = primary AI knowledge base

§

Default Slatecamp workflow:
Orient → diagnose → plan smallest safe change → implement minimally → verify with repo-native checks → report exact files changed, commands run, results, risks, and next action.

§

Orientation mode is read-only. Do not modify files during orientation unless Philip explicitly requests implementation. Produce a Codebase Orientation Report covering purpose, architecture, workflows, conventions, risks, AI-agent guidance, stale docs, and open questions.

§

Implementation mode must be conservative. Check Git status before editing. Preserve existing conventions. Avoid unrelated files. Prefer reversible changes. Do not touch auth, database, migrations, billing, production config, deployment config, secrets, or environment behavior without an explicit instruction and verification plan.

§

Treat `.ai/` as high-value but not unquestionable. Validate `.ai` claims against live code and Git state. If `.ai` is stale, say exactly what conflicts. If live code violates `.ai` intent, report the drift.

§

Philip wants direct, compact, operational answers. Avoid filler, over-explaining, generic advice, unnecessary setup complexity, and wrong-directory commands. When an error is caused by path confusion, give the exact corrected command for the current directory.