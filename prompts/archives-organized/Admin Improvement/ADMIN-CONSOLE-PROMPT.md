# Prompt — Paste this entire block into Claude Code

```
Read these files before writing any code:

1. ADMIN-CONSOLE-REBUILD.md — The complete implementation plan with 10 phases
2. ADMIN-CONSOLE-PROTOTYPE.html — The visual prototype showing exactly what each page looks like (red topbar, dashboard, questions table, coverage map, publishing pipeline, activity feed)
3. CODEBASE-AUDIT-2026-03-24.md — The ground truth of every route, table, API endpoint, component, and file in this codebase
4. ADMIN-AUDIT-REPORT.md — Detailed audit of all existing admin routes, auth, schema, queries, and security gaps

Then read the existing codebase:
- src/components/ui/ — ALL files. These are your canonical UI primitives. List them.
- src/components/shared/ — ALL files. These are composed shared components. List them.
- src/components/portal/ — ALL files. These are shared portal components (PortalTopbar, PortalSidebar, PortalLayout, CodeBlock, StickyTOC) created during the developer portal build. List them.
- src/components/admin/ — ALL files. These are existing admin-specific components. List them.
- src/components/developer/ — ALL files. Note how the developer portal was built for reference.
- src/app/developer/layout.tsx — Read this to understand the portal layout pattern you must match.
- src/app/globals.css — CSS variables and Campfire design tokens.
- CLAUDE.md — Project conventions and design constraints.

CRITICAL RULES:

1. You MUST use existing components from src/components/ui/ and src/components/shared/. No new Button, Badge, Card, Input, DataTable, TaxonomyPicker, or any other component that already exists. Import what's there.

2. You MUST use the shared portal components from src/components/portal/ for the layout shell. The admin console uses the SAME PortalTopbar, PortalSidebar, and PortalLayout as the developer portal — just with different props (red topbar, red nav accent, "Admin Console" label, admin nav items). If PortalLayout doesn't exist yet because the developer portal hasn't been built, create it in src/components/portal/ following the pattern described in ADMIN-CONSOLE-REBUILD.md Phase 1.

3. Admin-specific components go in src/components/admin/. Things like AdminMDXEditor, QuestionImporter, TaxonomyEditor, SMEReviewQueue stay there.

4. New admin pages go in src/app/admin/. Preserve ALL existing admin routes. Do NOT delete or break any existing page.

5. The admin visual identity: topbar background is #6B1A1A (deep red), nav accent is #B91C1C, nav active background is #FEF2F2. But primary ACTION buttons stay Cobalt Blue (#1B3FC4). Red is chrome, not action — red buttons would feel destructive.

6. Pull real data from actual source files. Read the route handlers, server actions, Zod schemas, table schemas, and type definitions. Do not hallucinate column names, function signatures, or response shapes.

7. For new features (coverage map, publishing pipeline, activity feed, content search, question analytics, command palette), read the actual database schema to understand what data is available before building the UI. If a required column doesn't exist (like wiki_articles.status needing a 'review' value), write the migration.

Now execute ADMIN-CONSOLE-REBUILD.md phase by phase, in exact order. For each phase:

1. Build exactly what the plan describes
2. Match the visual appearance shown in ADMIN-CONSOLE-PROTOTYPE.html
3. Use ONLY existing components — check before creating anything new
4. Run bun run build after completing each phase
5. Do not proceed to the next phase if the build fails
6. Commit after each phase: feat: admin console phase N — [description]

Start Phase 1 now.
```
