# Docs Implementation Plan

This plan captures a full audit of every markdown file under `.ai/docs`, including the archived `portal/` subtree. The goal is to document what is stale, what needs referencing in the live code, and the exact editing steps for each file. At the end of each folder’s review, update this plan with the status of the corrections.

## Folder Strategy

1. **Root overviews:** keep the high-level docs (`SlateCamp Design System.md`, `PLATFORM_OVERVIEW.md`, `COPY-CONTENT...`, `docs-implementation-plan.md`) at the root for easy discovery.
2. **Thematic folders:** reorganize into `design/`, `security/`, `ops/`, `product/`, and `portal/`. Move corresponding docs into those folders over time so content stays grouped by purpose.
3. **Portal docs:** treat `.ai/docs/portal` as the living portal-specific repo; inside it, use subfolders like `architecture/`, `wiki/`, and `observations/` and eventually drop duplicates from the root-level folders.
4. **Archive legacy:** anything removed from the main tree should land in `.ai/archive/docs-legacy/` to preserve historical context (SQL dumps, old observations).
5. **Naming standard:** future docs should embed a “Last updated” line referencing the source file (e.g., `globals.css`), and each folder should include a README explaining its focus and source-of-truth files.

## Audit Findings by File

| File                                            | Scope                           | Stale Elements                                                                                                  | Live References                                                     | Action Items                                                                                                                                                 |
| ----------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SlateCamp Design System.md`                    | Design tokens & typography      | Still needs clearer mapping to `globals.css`, and the Campfire alias tension should be explained in detail      | `src/app/globals.css`, `src/app/layout.tsx`                         | Double-check each token/radius/motion note, add a “legacy alias” section, and emphasize the new SlateCamp terminology.                                       |
| `PLATFORM_OVERVIEW.md`                          | Overview + portals              | Mentions Campfire design name and may still describe portal counts pre-consolidation                            | `.ai/docs/portal/**`, `siteConfig`, `src/app` routes                | Replace the DS section with SlateCamp wording, update portal counts to reflect `.ai/docs/portal`, and link to the new DS doc.                                |
| `RLS-POLICY-PATTERNS.md`                        | Supabase security patterns      | Policies may reference tables/columns that have been added/renamed recently (e.g., readiness snapshots)         | `supabase/migrations`, `DATABASE_SCHEMA.sql`                        | Validate each pattern’s condition against the current schema, note missing policies, and remove references to tables that no longer exist.                   |
| `COPY-CONTENT-SOURCE-OF-TRUTH.md`               | Copy catalogue                  | Lacks the new SlateCamp voice guide wording and current component copy                                          | `src/components/marketing`, `notes`, `SlateCamp Design System.md`   | Insert updated copy snippets for onboarding, upgrade CTAs, and reference the SlateCamp tone; drop old “Campfire channel” naming.                             |
| `01-Discovery/01 — Discovery.md`                | Discovery narrative             | Contains legacy Campfire branding and personas (old names, “Campfire Upstate”)                                  | `.ai/docs/SlateCamp Design System.md`, `siteConfig`, `src/app`      | Rewrite sections to mention SlateCamp design system, update the persona list to current archetypes, and highlight live features (news feed, 3D lab).         |
| `02-Frameworks/02 — Frameworks.md`              | Tech stack                      | Tooling list still mentions npm/pnpm; dependency versions may have changed                                      | `package.json`, `bun.lock`, `next.config.ts`                        | Rewrite the stack table with Bun as the package manager, track current versions, and refresh tooling commands (dev, build, storybook).                       |
| `03-PRDs/*.md`                                  | Product requirements            | Several PRDs describe flows that no longer run (older onboarding, AE-specific screens)                          | Current `src/app` routes                                            | Check whether each PRD corresponds to an existing route/component; archive outdated PRDs and update the rest to reference the new portal architecture names. |
| `04-Architecture/04 — Architecture.md`          | System map                      | Portal architecture descriptions may not match the reorganized directories (`docs/portal` vs `.ai/docs/portal`) | `src/app`, `.ai/docs/portal/architecture/SLATECAMP-ARCHITECTURE.md` | Sync the architecture summary with the portal folder structure, confirm the component tables match live directories, and reference the new DS doc.           |
| `06-Development/06 — Development.md`            | Dev tooling                     | References outdated scripts (pre-Bun commands) and former dev flags                                             | `package.json`, `scripts/`, `bun.lock`                              | Update command lists (use `bun run dev` etc.), mention lint/type-check targets, and note any generator scripts that have moved (e.g., `scripts/dev.js`).     |
| `07-Tests/07 — Tests.md`                        | Testing matrix                  | Some entries refer to yarn/older coverage stats; watchers not relevant anymore                                  | `package.json`, `bun run lint`, `tsc` results                       | Refresh the table with actual `bun run` scripts, list the known failing test (`mode-presets`) and note that the suite is not run in CI yet.                  |
| `08-Feedback/08 — Feedback.md`                  | Feedback ecosystem              | Outlines older notification flows and uses the Campfire naming                                                  | `src/components/testing`, notification triggers                     | Document Socratic Explorer, Calculating Results overlay, and mention the SlateCamp DS tone; remove outdated channel descriptions.                            |
| `09-Analytics/09 — Analytics.md`                | Analytics capabilities          | Charts names/values may not match current dashboard components                                                  | `src/app/dashboard`, chart definitions                              | Verify each listed visualization (readiness trajectory, memory health, etc.) against the actual components and update stats/outcome descriptions.            |
| `10-Marketing/10 — Marketing.md`                | Go-to-market story              | Messaging might predate the new upgrade flow or use old copy                                                    | `siteConfig`, marketing components                                  | Refresh hero/benefit text, call out the SlateCamp voice, and link to the new design system doc.                                                              |
| `portal/architecture/SLATECAMP-ARCHITECTURE.md` | Developer architecture overview | Possibly duplicates `04 — Architecture` with older portal counts                                                | `src/app`, `.ai/docs/04-Architecture`                               | Merge consistent sections with the master architecture doc and ensure table data matches actual directories.                                                 |
| `portal/AGENTS.md`                              | Portal doc guidance             | References relocated docs and uses outdated DS names                                                            | `.ai/docs/SlateCamp Design System.md`, `.ai/docs/portal` content    | Update intro paragraph and the doc reference list so agents know where the current materials live.                                                           |
| `portal/wiki-articles/*`                        | Wiki content                    | Contains bulk SQL/MD files that may be obsolete or redundant                                                    | Production wiki structure, taxonomy tables                          | Decide which articles to keep, archive the rest, and plan rewrites using up-to-date taxonomy references.                                                     |
| `portal/observations/*`                         | Observational notes             | May include personal logs no longer relevant                                                                    | Current project focus                                               | Archive or refresh entries with actionable updates for the team.                                                                                             |

## Folder-by-Folder AUDIT DETAILS

### Root overviews

- `SlateCamp Design System.md`: verify every token/radius/motion note against `globals.css`, expand the explanation of legacy Camp Standard aliases, and keep the SlateCamp terminology consistent.
- `PLATFORM_OVERVIEW.md`: refresh portal counts, update the design system section to SlateCamp, and add direct references to `.ai/docs/portal/` documents for each portal subsection.
- `COPY-CONTENT-SOURCE-OF-TRUTH.md`: add an “updated SlateCamp voice” section linking to `siteConfig` copy and mention new components that ship with bearer/resume instructions.

### Framework & Infrastructure

- `02 — Frameworks.md`: replace outdated tool references with current Bun commands, list the precise dependency versions from `package.json`, and mention the use of Turbopack (if applicable).
- `04 — Architecture.md` & `portal/architecture/SLATECAMP-ARCHITECTURE.md`: align both docs on the same portal counts, reference actual `src/app` folders, and include a quick summary of where each portal layout lives.
- `06 — Development.md` & `07 — Tests.md`: ensure the command tables match `package.json` scripts (including `bun run lint`, `bun run type-check`), update the testing matrix, and call out the known `mode-presets.test.ts` failure.

### Product/Tactical docs

- `01 — Discovery.md`: rephrase personas/features to highlight SlateCamp’s current capabilities (3D Lab, Trails, readiness score updates) and drop any outdated “Campfire Upstate” mentions.
- `03 — PRDs` folder: for each PRD, verify the linked route/component exists in `src/app`; if not, set it aside in `.ai/archive/docs-legacy/` and note the reason.
- `08 — Feedback.md`, `09 — Analytics.md`, `10 — Marketing.md`: update narrative to reflect current dashboards, rewrite CTA language using the SlateCamp voice, and ensure any metrics match live data in `src/app/dashboard`.

### Portal-specific content

- `portal/AGENTS.md`: rework to point to `.ai/docs/portal` files, highlight the SlateCamp DS doc, and clarify how new doc folders should be layered.
- `portal/wiki-articles/*`: create a short inventory (maybe a README) next to the `wiki-articles` folder summarizing which files remain active vs. archived; for active ones, mention the taxonomy nodes they map to.
- `portal/observations/*`: catalog which notes need refreshing and which should move to `archive`; label them with a timestamp/source.

## Execution Checklist

1. Export this plan table to a spreadsheet or issue tracker with columns: file, drift, reference, status, owner.
2. Tackle edits folder by folder (design/core, architecture/op, product/portal) and after each batch rerun `rg "Campfire design system" .ai` to ensure no legacy phrasing remains.
3. Move deprecated files (SQL dumps, old observations) to `.ai/archive/docs-legacy/` before editing, keeping a README that maps old names to the new doc location.
4. Once a folder is updated, annotate this plan with the completion date and any new live reference files discovered during the audit.
5. Repeat this plan’s evaluation every sprint so new stale docs are quickly captured.

## Detailed Audit Process

1. **Execute `rg` checks** on loaded terms (`Campfire design system`, `Inter only`, `rounded-xl`) to find remaining legacy references; log each hit per file.
2. **Scan each file for actionable mismatches** using live references: e.g., `RLS` doc against the current migrations, marketing doc vs. `siteConfig`, portal docs vs. actual `src/app` pages.
3. **Tag outdated sections** directly in each file (via comments or TODOs) before editing so future editors know what needs rewriting.
4. **Archive obsolete material** (e.g., wiki SQL scripts) into `.ai/archive/docs-legacy/` before rewriting to preserve history.
5. **Update this plan after each folder** to show completion status, highlight new files discovered, and note any blockers encountered.
