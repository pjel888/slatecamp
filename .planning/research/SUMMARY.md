# Research Summary: Dashboard Sidebar Redesign

**Domain:** SaaS dashboard sidebar navigation (overlay-style, grouped)
**Researched:** 2026-03-20
**Overall confidence:** HIGH

## Executive Summary

Professional SaaS dashboard sidebars in 2026 follow a well-established pattern: a collapsed icon rail that expands via overlay (not pushing content), navigation grouped into labeled sections, and an account popover anchored at the bottom. GitHub, Supabase, Linear, Vercel, and Notion all implement variations of this pattern. The core features are standardized enough that deviating from them reads as amateur rather than innovative.

SlateCamp's current sidebar has most of the raw ingredients (collapse/expand, tooltips, active indicator, avatar) but implements them in a push-model layout with a flat navigation list. The primary architectural change is converting from push-to-overlay expand behavior. The primary organizational change is grouping the 7 nav items into labeled sections (LEARN, PRACTICE, DATA) with Dashboard as a standalone top-level item.

The feature set divides cleanly into three tiers: (1) table stakes that every professional sidebar has and users notice when missing (overlay model, grouped nav, account popover), (2) differentiators that elevate polish (keyboard navigation, focus management, reduced-motion compliance), and (3) anti-features that seem appealing but create problems for SlateCamp's specific use case (nested flyouts, drag-to-reorder, notification badges).

The research is HIGH confidence because the patterns are mature and well-documented across multiple reference products. There is no ambiguity about what "professional" looks like in this domain.

## Key Findings

**Stack:** No new libraries needed. shadcn/ui's Popover + existing Tooltip + Tailwind CSS handle all new UI. The overlay model is CSS positioning (fixed/absolute), not a new component library.

**Architecture:** The fundamental change is positioning: collapsed rail stays in document flow, expanded sidebar is a fixed overlay with backdrop. This is a CSS architecture change, not a component architecture change.

**Critical pitfall:** The overlay model requires careful focus management. Without a focus trap, keyboard users get lost behind the overlay. Without click-outside-to-close, the overlay feels like a bug. These must ship together.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Phase 1: Structural reorganization** -- Group navigation, rename routes, add CampTrails stub, Dashboard standalone item
   - Addresses: Grouped navigation, section labels, route renaming
   - Avoids: Touching the expand/collapse architecture (minimizes risk)
   - Rationale: Pure content/organization changes that can be tested independently

2. **Phase 2: Overlay expand model** -- Convert from push to overlay, add backdrop, click-outside, Escape-to-close
   - Addresses: Overlay behavior, backdrop scrim, basic keyboard (Escape)
   - Avoids: Complex accessibility (full keyboard nav, focus trap)
   - Rationale: The highest-risk architectural change, isolated for focused testing

3. **Phase 3: Account popover + CTA** -- Bottom account popover with theme toggle, settings, logout; freemium CTA card
   - Addresses: Account popover, freemium CTA, theme toggle relocation
   - Avoids: N/A -- this is additive, low risk
   - Rationale: Depends on sidebar layout being stable from Phase 2

4. **Phase 4: Accessibility polish** -- Full keyboard navigation, focus trap, reduced-motion, screen reader announcements
   - Addresses: WCAG compliance, keyboard navigation, reduced-motion
   - Avoids: N/A
   - Rationale: Polish layer that should not be mixed with architectural changes

**Phase ordering rationale:**
- Phase 1 before Phase 2 because grouping is independent of overlay behavior and reduces the diff size of Phase 2
- Phase 2 before Phase 3 because the account popover positioning depends on the overlay layout being finalized
- Phase 4 last because accessibility polish is best applied to a stable interface

**Research flags for phases:**
- Phase 2: Likely needs attention to edge cases (overlay z-index vs modals, popover positioning in overlay context)
- Phase 1, 3, 4: Standard patterns, unlikely to need additional research

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | No new dependencies. shadcn/ui + Tailwind handle everything. |
| Features | HIGH | Patterns are mature and standardized across 6 reference products. |
| Architecture | HIGH | Overlay sidebar is a well-documented CSS pattern, not novel. |
| Pitfalls | HIGH | Focus management and overlay interaction pitfalls are well-documented in WCAG and component library discussions. |

## Gaps to Address

- **Mobile sidebar** is explicitly out of scope but will eventually need research (responsive hamburger, sheet-based sidebar)
- **Hover-to-expand timing** needs prototyping if it moves from P3 to P2 -- the delay thresholds are not well-documented and vary by product
- **Partner ad placement** mentioned in PROJECT.md needs business requirements before technical research

---
*Research summary for: Dashboard Sidebar Redesign*
*Researched: 2026-03-20*
