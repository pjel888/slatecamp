# SlateCamp Dashboard Sidebar Redesign

## What This Is

A complete redesign of the SlateCamp dashboard sidebar to replace the current amateurish implementation with a professional, GitHub/Supabase-quality navigation system. The sidebar will feature grouped navigation, an overlay expand model, a user profile popover, freemium ad/upgrade space, and polished collapsed/expanded states.

## Core Value

The sidebar must feel immediately professional — like a serious product built for working adults preparing for licensure exams, not a student project.

## Requirements

### Validated

- ✓ Sidebar renders navigation links to all dashboard pages — existing
- ✓ Active route is visually highlighted — existing
- ✓ Sidebar collapses to icon-only rail with tooltips — existing
- ✓ Collapse state persists in localStorage — existing
- ✓ Leave-session dialog prevents accidental navigation during active quiz/review — existing
- ✓ Admin-only Dev Settings link renders conditionally — existing
- ✓ User avatar with fallback initials displayed — existing
- ✓ Tier badge and upgrade button displayed for free users — existing
- ✓ CampTrails nav link added with route stub — Phase 1
- ✓ "Testing" renamed to "Review" across codebase — Phase 1

### Active

- [ ] Sidebar expands as an overlay (not pushing content) with subtle backdrop
- [ ] Collapsed state is a polished icon-only vertical rail that stays in-place
- [ ] Navigation grouped into labeled sections: LEARN, PRACTICE, DATA
- [ ] Dashboard link rendered as standalone item at category-level visual weight
- [ ] LEARN group contains: Wiki, Notes, 3D Lab
- [ ] PRACTICE group contains: CampTrails (new), Review (renamed from Testing)
- [ ] DATA group contains: Analytics
- [x] CampTrails nav link added (route: /dashboard/camptrails, Coming Soon stub)
- [x] "Testing" renamed to "Review" (label, URL, directory, constants, page title)
- [ ] User profile (avatar + name + tier badge) displayed at top below logo
- [ ] Account settings moved to bottom popover (like GitHub) with theme toggle, settings link, and logout
- [ ] Freemium ad/upgrade CTA card pinned above bottom popover
- [ ] Option for partner ad placement in same slot (future)
- [ ] Text sizes reduced, spacing tightened — professional proportions
- [ ] Collapse/expand toggle button clearly accessible
- [ ] Group labels hidden when collapsed, shown when expanded
- [ ] Smooth transitions between collapsed/expanded states (max 300ms per Campfire design system)
- [ ] Respects prefers-reduced-motion

### Out of Scope

- CampTrails page implementation — only the nav link and route stub
- Mobile sidebar / responsive hamburger menu (separate effort)
- Redesigning the Navbar or DashboardHeader
- Changing the dashboard layout beyond sidebar width behavior

## Context

- **Existing codebase:** Next.js 16 App Router, React 19, Tailwind CSS 4, shadcn/ui, Phosphor Icons
- **Current sidebar:** `src/components/shared/Sidebar.tsx` (~424 lines), uses `TransitionLink`, `SCIcon`, Zustand-free (localStorage for collapse state)
- **Routes defined in:** `src/lib/routes.ts` (DASHBOARD_ROUTES array) and `src/lib/constants/routes.ts` (ROUTES object)
- **Dashboard layout:** `src/app/dashboard/layout.tsx` — sidebar is a direct child of the flex container
- **Design system:** Campfire (warm, professional) — Camp Cobalt primary, Inter font, strict shadow/radius/transition rules per CLAUDE.md
- **Reference UIs:** GitHub sidebar (overlay expand, avatar popover at bottom), Supabase sidebar (clean groups, professional density)

## Constraints

- **Design System**: Must follow Campfire tokens (colors, shadows, radii, transitions) defined in CLAUDE.md
- **Tech Stack**: shadcn/ui + Phosphor Icons + Tailwind CSS 4 — no new UI libraries
- **Typography**: Inter font, minimum 11px text, no monospace on labels
- **Transitions**: Max 300ms, ease-out default, respect prefers-reduced-motion
- **Overlay behavior**: Expanded sidebar must not cause layout shift in the main content area

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Overlay expand instead of push | Current push model squeezes content, poor UX — GitHub overlay is smoother | — Pending |
| Grouped navigation with section labels | Flat list lacks hierarchy, makes sidebar feel basic | — Pending |
| Account settings in bottom popover | Frees nav space, matches professional patterns (GitHub, Supabase) | — Pending |
| Rename Testing to Review | Better aligns with the activity (reviewing questions, not "testing") | — Pending |
| Freemium ad/upgrade CTA at bottom | Monetization without disrupting primary navigation flow | — Pending |

---
*Last updated: 2026-03-20 after Phase 1 completion*
