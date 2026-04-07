# Prompt — Paste this entire block into Claude Code

```
Read these three files before writing any code:

1. DEVELOPER-PORTAL-BUILD.md — The complete implementation plan with 10 phases
2. SLATECAMP-DEVELOPER-PORTAL.html — The visual prototype showing exactly what each page looks like
3. CODEBASE-AUDIT-2026-03-24.md — The ground truth of every route, table, API endpoint, component, and file in this codebase

Then read the existing design system:
- src/components/ui/ — ALL files. These are your canonical primitives (Button, Badge, Card, Input, Dialog, Tabs, Tooltip, Skeleton, etc.)
- src/components/shared/ — ALL files. These are composed shared components (SectionHeader, ScoreDisplay, TaxonomyPicker, EmptyState, StatCard, DataTable, Breadcrumb, SearchInput, etc.)
- src/app/globals.css — The CSS variables and Campfire design tokens
- CLAUDE.md — The project conventions and design constraints

CRITICAL RULE: You MUST use the existing components from src/components/ui/ and src/components/shared/ for everything. Do NOT create new button components, new badge components, new card components, new input components, or any UI primitive that already exists. Import and use what's there. If a component variant you need doesn't exist yet, extend the existing component — do not duplicate it.

Before building any page, run this check: search src/components/ui/ and src/components/shared/ and list every component available. Use this as your palette. Every button is <Button>, every badge is <Badge>, every card is <Card>, every input is <Input>. No exceptions.

Now execute DEVELOPER-PORTAL-BUILD.md phase by phase, in exact order. For each phase:

1. Build exactly what the plan describes
2. Match the visual appearance shown in SLATECAMP-DEVELOPER-PORTAL.html
3. Use ONLY existing components from src/components/ui/ and src/components/shared/
4. Pull real data from the actual source files when documenting APIs, schemas, and components — read the actual route handlers, server actions, Zod schemas, and type definitions. Do not hallucinate signatures or response shapes.
5. Run bun run build after completing each phase
6. Do not proceed to the next phase if the build fails
7. Commit after each phase with message: feat: developer portal phase N — [description]

Auth guard for the /developer layout: use getUserRole() from src/lib/admin/roles.ts. Allow access if NODE_ENV === 'development' OR user has any role in user_roles table. No hardcoded emails. No domain checks. Redirect unauthorized users to /dashboard.

For the developer-portal-specific components that don't exist yet (CodeBlock with copy button, EndpointCard, PropTable), create them in src/components/developer/ — NOT in src/components/ui/ or src/components/shared/. These are portal-specific, not app-wide.

Start Phase 1 now.
```

