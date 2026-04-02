<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Contact

## Purpose
Public contact page featuring support channels, response time SLA, social links, and FAQ section. Communicates SlateCamp's small-team, responsive support model and addresses common questions about platform scope, readiness scoring, freemium access, and question bank curation.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component rendering contact cards, social links, and FAQ accordion |
| `loading.tsx` | Loading skeleton |

## For AI Agents
### Working In This Directory
- This is a public marketing page (no auth required)
- Uses `MarketingNav` and `MarketingFooter` components
- FAQ content is static (no CMS; hardcoded in `FAQS` array)
- Support email: `support@slatecamp.com` with 24-hour SLA (weekdays)
- Social links: Instagram, Twitter/X, LinkedIn (all branded @slatecamp)
- Tone: Warm, approachable, emphasizing Philip's direct involvement ("small team")
- If FAQ questions become outdated, update the `FAQS` array in page.tsx

## Dependencies
### Internal
- `@/components/marketing/MarketingNav` — Navigation with active route tracking
- `@/components/marketing/MarketingFooter` — Site footer
- `@/lib/constants/site` — `siteConfig`
- `@phosphor-icons/react/dist/ssr` — Icons (EnvelopeSimple, Clock, Question, social logos)

<!-- MANUAL: -->
