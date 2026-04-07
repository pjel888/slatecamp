Design System Migration: SlateCamp x Flowbite Pro v3.1 (MCP-Augmented)

CURRENT DOMAIN: Design System / UI Components / Wiki Reading Experience
STATUS: ALL PLANS CREATED — Awaiting review before coding

COMPLETED:
- Phase 1–6: Wiki Perf, Payment Decoupling (prior work)
- Flowbite Pro v3.1 Figma audit completed
- Gap analysis: 12 missing components, 6 structural inconsistencies
- Migration plan v3 written: `.ai/plans/design_system_migration_plan.md`
  - MCP-augmented workflow (Figma-to-code + Theme generator)
  - Block-driven implementation protocol (flowbite-react-blocks extraction)
  - Identity Lock for SlideToSubmit components
  - Git branching strategy (one branch per phase)
  - Form scope pre-computed (17 forms across 15 files)
  - Visual regression strategy (manual screenshots)
  - Bottom navigation decision: IN SCOPE
- Wiki upgrade plan written: `.ai/plans/wiki_component_upgrade_plan.md`
  - Typography refinement (h2-h4, blockquotes, lists)
  - MDX table transformation (striped rows, cobalt headers, sticky thead, hover)
  - Callout refinement (bordered variant, action prop, icon size bump)
  - Widget container standardization (18 widgets)
- Surface hierarchy plan written: `.ai/plans/surface_hierarchy_plan.md`
  - 5 sidebar/panel border-r separators identified for surface-contrast replacement
  - Canvas→Surface→Raised three-layer depth system defined
  - shadow-card custom token for border→shadow migration
  - WCAG AA contrast verified for all surface pairs
  - Integrates into Migration Phase 1 (tokens) and Phase 3 (layout)
- Identity lock documented: `.ai/plans/identity_preservation_lock.md`
  - SlideToSubmit component fully analyzed
  - 7 usage sites documented
  - Zero interference confirmed (hardcoded hex values + inline CSS)
  - Pre-phase verification protocol defined

NEXT ACTION: Review all three plans, then begin Phase 1 (Alignment Reference & Token Mapping)

PLAN SUMMARY (Main Migration — 6 Phases):
1. Alignment Reference & Token Mapping — flowbite-alignment.md first, then spacing tokens
2. Missing Primitive Components — Alert, Table, Pagination, Breadcrumb, Stepper, BottomNav, ListGroup
3. Layout & Navigation Overhaul — Navbar, sidebar, DashboardHeader, bottom nav
4. Form Elements & Interactive Components — 17 forms, FormField enforcement
5. Feedback & Data Display — Alert integration, toast, stat-card, data-table, badge
6. Marketing & Application Section Patterns — connected to GTM/launch work

PLAN SUMMARY (Wiki Upgrade — 3 Phases):
W1. MDX Global Styles (typography + tables)
W2. Callout Refinement
W3. Widget Container & TOC

KEY DECISIONS:
- NOT installing flowbite or flowbite-react (patterns only, zero new deps)
- Using flowbite/ local reference folders as copy-adapt sources
- MCP tools (Figma-to-code, Theme generator) available but optional
- SlideToSubmit is IMMUTABLE — excluded from all migration work
- All SlateCamp brand colors, typography, and radius caps LOCKED

BLOCKERS: None
