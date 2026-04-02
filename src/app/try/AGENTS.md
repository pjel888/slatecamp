<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Try

## Purpose
Free pre-assessment teaser page implementing UX strategy Section 4 (Step 2). Public, no-auth-required experience where users answer 5 sample ALE questions before hitting "create account" gate. Delays sign-up to maximize engagement ("skin in the game" before commitment, per Duolingo insight).

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component rendering PreAssessmentTeaser component |
| `loading.tsx` | Loading skeleton |

## For AI Agents
### Working In This Directory
- **No auth required** — public free preview
- **Pre-Assessment Teaser component** lives in `@/components/assessment/PreAssessmentTeaser`; handles 5-question flow and "create account" upsell gate
- **UX strategy:** Delayed sign-up. User gets invested in answers before account requirement
- **After 5 questions:** Modal/upsell saying "Create a free account to see your Readiness Score"
- **Metadata:** Title "Try SlateCamp — Free Diagnostic Sample", description explains 5-question no-account preview
- This is a funnel conversion page — track event in analytics (likely handled by PreAssessmentTeaser component)

## Dependencies
### Internal
- `@/components/assessment/PreAssessmentTeaser` — Quiz component handling 5-question flow and account gate
- `next/font` — Possible metadata/typography imports (implicit)

<!-- MANUAL: -->
