<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# landing

## Purpose

Landing page layout components that orchestrate marketing sections. Manages navigation, auth state, and composition of all major sections (hero, features, testimonials, CTA, footer).

## Key Files

| File | Description |
|------|-------------|
| `LandingPageContent.tsx` | Main landing page orchestrator; server component that checks auth state and composes all sections |
| `LandingPageFallback.tsx` | Fallback/loading skeleton while page is being generated |

## For AI Agents

### Working In This Directory

- **Server Component**: `LandingPageContent` is async server component; checks `hasAuthCookie()` for personalization
- **Auth-Aware CTA**: Button text and href change based on login status (Dashboard vs Register)
- **Composition**: Renders marketing nav, hero, features, testimonials, CTA, footer in sequence
- **CSS**: Uses `bg-page-bg` and `min-h-screen` for full-viewport layout
- **Imports**: Centralized imports from `@/components/marketing/` for all section components
- **Constants**: Uses `ROUTES` object for navigation links

### Dependencies
### Internal

- `@/lib/supabase/server` - `hasAuthCookie()` for server-side auth check
- `@/components/marketing/` - All section components (HeroSection, BentoFeatureGrid, etc.)
- `@/lib/constants` - ROUTES for navigation links

<!-- MANUAL: Update CTA logic if auth detection method changes. Test both authenticated and anonymous landing page views before deployment. -->
