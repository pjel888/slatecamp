# Create A Plan Pack

## Load

Read `Frontier-Planning-Kernel.md`, applicable `Frontier-Applicability-Gates.md`,
this prompt, and `Plan-Pack-Schema.md`. Load `Multi-Agent-Execution-Directive.md`
only when orchestration is selected. For Supabase-touching work, also load
`../../00_system/supabase-change--protocol--v1.md`.

## Objective

Create the smallest executable pack that preserves the full requested outcome.
This stage plans; it does not implement product code.

## Method

1. Prove the task belongs in the Plan Pack lane (genuinely expensive-to-reverse:
   destructive Supabase migration, live auth/token compatibility, material
   security boundaries, broad architecture replacement, or coordinated
   multi-owner work).
2. Record the outcome-first Task Contract, non-goals, authorization boundaries,
   acceptance criteria, evidence decisions, and stop condition.
3. Inspect current source and only task-relevant durable truth
   (`DATABASE_SCHEMA.sql`, relevant `supabase/migrations/`, `package.json`,
   actual route/lib files in scope).
4. Map the evidence-supported blast radius and triggered gates — use the
   three-signal triad (GitNexus / code-review-graph / ChunkHound) for the
   bounded symbols in scope.
5. Resolve ordinary choices and isolate exact external boundaries.
6. Build the minimum acyclic, dependency-ordered units with owned paths,
   implementation boundaries, evidence, recovery, and completion signals.
7. Add orchestration assignments only for independent work that benefits.
8. Write `plan-pack.json` and the fewest useful Markdown artifacts under
   `.ai/03_plans/<YYYY-MM-DD>--<topic>--<purpose>/`.
9. Repair every validation failure.

## Completion

Return the folder, profile, first ready unit, material decisions/boundaries, and
validation result. Stop when a fresh executor can start without invention,
routine questions, or unrelated context.
