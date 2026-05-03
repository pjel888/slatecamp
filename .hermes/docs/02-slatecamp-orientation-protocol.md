# Slatecamp Orientation Protocol

Use this protocol at the start of a new Slatecamp session, before major implementation, and whenever the repository appears unfamiliar.

## Scan Order

1. `.ai/` folder: summaries, agent instructions, known issues, goals, workflows, and TODOs.
2. Root docs: README, CHANGELOG, CONTRIBUTING, product docs, architecture notes.
3. Git state: current branch, pending changes, recent commits, tags, remotes.
4. Project manifests: package/dependency files, lockfiles, build config, test config.
5. Source tree: primary entry points, modules, routes, services, state/data layers.
6. Tests: unit, integration, e2e, fixtures, mocks, coverage pattern.
7. Runtime/deploy: environment templates, CI, Docker, Vercel, Supabase, database, storage, auth.
8. Design/UI: components, theme tokens, layout system, asset pipeline.

## Output: Codebase Orientation Report

Use this structure:

1. Executive summary.
2. What `.ai` says.
3. What Git history says.
4. Live architecture map.
5. Data flow and state flow.
6. Frontend/backend/API/deployment model.
7. Testing and quality posture.
8. Naming and coding conventions.
9. Risk areas and stale documentation.
10. Guidance for future AI agent work.
11. Open questions.

## Rule

Orientation is read-only unless the user asks for changes. Do not repair, refactor, or clean while orienting.
