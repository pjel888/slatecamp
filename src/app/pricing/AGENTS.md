<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Pricing

## Purpose
Public subscription pricing page with tabbed tiers for individuals, educational institutions, and enterprise. Tracks upgrade page views via analytics event. Entry point for conversion funnel from marketing to paid plans.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component wrapping PricingContent with layout |
| `pricing-content.tsx` | Client component with tab UI and tier cards; tracks `upgrade_page_viewed` event |
| `loading.tsx` | Loading skeleton |

## For AI Agents
### Working In This Directory
- **Client component** — `pricing-content.tsx` is use client (tabs require interactivity + analytics tracking)
- **Tab structure:** Three views — Individuals, Educational, Enterprise — each with its own pricing tier grid
- **Pricing data source:** `@/lib/constants/pricing` exports `INDIVIDUAL_TIERS`, `EDUCATIONAL_TIERS`, `ENTERPRISE_TIERS`
- **Analytics:** `trackEvent({ event_name: 'upgrade_page_viewed' })` fires on mount
- **Typography:** Uses `Instrument_Serif` (italic tagline), Slatecamp tokens for colors
- **Layout:** Centered max-w-[1200px], responsive grid (1 col mobile → 3 cols on md/lg)
- When updating tiers (price, features, limits), edit constants in `@/lib/constants/pricing`

## Dependencies
### Internal
- `@/components/marketing/MarketingNav` — Navigation
- `@/components/marketing/MarketingFooter` — Footer
- `@/components/marketing/PricingCard` — Tier card component (accepts tier object)
- `@/lib/constants/pricing` — Tier definitions (INDIVIDUAL_TIERS, EDUCATIONAL_TIERS, ENTERPRISE_TIERS)
- `@/lib/analytics` — `trackEvent` function
- `next/font/google` — Instrument_Serif serif font

<!-- MANUAL: -->
