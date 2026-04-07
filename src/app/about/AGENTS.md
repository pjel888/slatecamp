<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# About

## Purpose
Marketing page introducing SlateCamp's mission, technology pillars, and value proposition. Targets new users and communicates the IRT-based adaptive testing, spaced repetition, and readiness scoring that differentiate the platform from traditional ALE reviewers.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component rendering hero, founder story, tech pillars (IRT, SRS, anti-inflation scoring), and CTA to free diagnostic |
| `loading.tsx` | Loading skeleton for page |

## For AI Agents
### Working In This Directory
- This is a public marketing page (no auth required)
- Uses `MarketingNav` and `MarketingFooter` components from `@/components/marketing`
- Follows Slatecamp design system (primary colors, typography, spacing)
- Hero section emphasizes founder credibility ("Built by an architect") and personal mission
- Tech section showcases pedagogical rigor (IRT 2-parameter model, spaced repetition, anti-inflation)
- Always link CTAs back to `/try` (free diagnostic) or `/pricing` (upgrade path)

## Dependencies
### Internal
- `@/components/marketing/MarketingNav` — Navigation with active route tracking
- `@/components/marketing/MarketingFooter` — Site footer
- `@/lib/constants/site` — `siteConfig` (site name)
- `@phosphor-icons/react/dist/ssr` — Icon library (Brain, ChartLineUp, Buildings)

<!-- MANUAL: -->
