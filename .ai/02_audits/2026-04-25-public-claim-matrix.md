# 2026-04-25 Public Claim Matrix

## Scope

Public and student-facing claim audit for landing, pricing, contact/about, auth/try, dashboard results-day, notifications, upgrade, and email surfaces.

## Status legend

- `implemented` - claim is live and backed by the current product surface.
- `narrowed` - copy was tightened in this task to match what is actually shipped.
- `hidden` - the risky claim is no longer rendered or is gated off in the current build.
- `deferred` - the claim surface still exists and should be resolved in a follow-up implementation pass.

## Summary

- Removed unsupported partner/testimonial social proof from the landing page.
- Rewrote pricing/contact copy so the public billing story matches the current payments-disabled build.
- Repointed Campfire messaging on results-day and oath-taking emails to the shipped Professional Reference hub.
- Removed the remaining student-facing Library navigation promise and Campfire notification/filter/deep-link promises.
- Removed stale dashboard Campfire and Library route constants from the current route source of truth.

## Claim matrix

| Surface | Claim / promise | Status | Evidence | Note |
| --- | --- | --- | --- | --- |
| Landing hero + try flow | "Free to start", "No credit card required", and a free readiness/sample flow | implemented | `src/components/marketing/HeroSection.tsx:75-83`, `src/app/try/page.tsx:14-17`, `src/components/assessment/PreAssessmentTeaser.tsx:110-138` | Public sample still starts without auth, then gates full-score reveal behind account creation. |
| Landing social proof | "Trusted partners" brand marquee | hidden | `src/components/landing/LandingPageContent.tsx:35-47`, `src/components/marketing/SocialProofBar.tsx:3-20` | Landing no longer renders the partner marquee or partner-heading copy. |
| Landing testimonials | Student testimonial quotes | hidden | `src/components/landing/LandingPageContent.tsx:35-49`, `src/components/marketing/TestimonialShowcase.tsx:1-2` | The live landing page no longer renders the placeholder testimonial component. |
| Pricing FAQ | Payment methods / cancel-anytime / student discount / team pricing | narrowed | `src/app/pricing/page.tsx:12-56` | Public FAQ now reflects the current build instead of promising unsupported billing features. |
| Pricing route | Current build is effectively free while payments are off | implemented | `src/lib/constants/feature-flags.ts:7-13`, `src/app/pricing/pricing-content.tsx:34-47` | Billing is off by default and the pricing surface falls back to free-access messaging. |
| Paid pricing catalog | Institutional / enterprise / sponsor / AI Tutor plan claims | hidden | `src/lib/constants/pricing.ts:63-114`, `src/lib/constants/pricing.ts:119-191`, `src/app/pricing/pricing-content.tsx:34-47` | Risky paid-plan claims still exist in code, but they are hidden while payments remain disabled. |
| Contact hero | "small team" support copy | narrowed | `src/app/contact/page.tsx:53-55` | Updated to founder-led wording to match the current operating reality. |
| Contact FAQ | 48-hour question-bank review SLA | narrowed | `src/app/contact/page.tsx:33-35` | Tightened to a generic review promise without an unsupported time-bound SLA. |
| Landing / metadata | "expert-verified wiki" global site description | deferred | `src/app/page.tsx:11-26`, `src/lib/constants/site.ts:1-4` | This claim is still live in metadata/site config and was not fully evidentiated in this pass. |
| AI answers | "AI answers cite their sources" | implemented | `src/components/marketing/HeroSection.tsx:19-23`, `src/app/api/ai/tutor/route.ts:43-58`, `src/app/api/ai/tutor/route.ts:87-96` | The tutor route explicitly requires `[Source: slug]` citations and rejects unsupported answers. |
| Results Day | Passers are sent to Campfire next | narrowed | `src/app/dashboard/results-day/_components/PasserFlow.tsx:87-125`, `src/app/dashboard/professional/page.tsx:1-20` | The live CTA now points at the shipped Professional Reference hub instead of the missing Campfire route. |
| Oath-taking emails | Campfire follow-up / Campfire CTA | narrowed | `src/lib/email-templates/oath-taking.ts:29-35`, `src/lib/email-templates/oath-taking.ts:46-49`, `src/lib/email-templates/oath-taking.ts:146-155`, `src/lib/email-templates/oath-taking.ts:255-261` | Email copy now points to the Professional Reference hub. |
| Upgrade paywall | GCash/Maya, secure payment, cancel-anytime copy | hidden | `src/app/dashboard/upgrade/page.tsx`, `src/components/dashboard/upgrade/UpgradeButtons.tsx` | The Campfire social-proof label was removed. The remaining paid-plan claims are still hidden while payments remain disabled. |
| Notifications | Campfire filters/preferences/deep links | narrowed | `src/components/notifications/NotificationPreferences.tsx`, `src/components/notifications/NotificationFilters.tsx`, `src/types/notifications.ts` | Student-facing Campfire filter/preference copy is no longer rendered, and fallback deep links now land on shipped dashboard surfaces. DB enum/type remnants remain only to read existing notification rows safely. |
| Mobile/dashboard nav | Library link | hidden | `src/components/shared/Navbar.tsx`, `src/lib/routes.ts` | The mobile nav no longer renders Library, and `ROUTES.dashboard.library` has been removed from the current dashboard route constants. |
| Dashboard routes | Campfire route constant | hidden | `src/lib/routes.ts`, route check: `find src/app -path '*/campfire*'` -> `0` | `ROUTES.dashboard.campfire` has been removed; no current surface links users to a missing Campfire route. |
| Dashboard routes | Library route constant | hidden | `src/lib/routes.ts`, route check: `find src/app -path '*/library*'` -> `0` | `ROUTES.dashboard.library` has been removed; no current navigation surface links users to a missing Library route. |

## Recommended next fixes

1. Re-audit global metadata/site-description claims (`expert-verified wiki`) against the current wiki review pipeline.
2. If payments are re-enabled, re-audit the hidden pricing and upgrade claims before launch; the gated copy is still too ambitious for the current implementation.
3. Keep DB-backed Campfire notification enum/type compatibility until a schema cleanup migration deliberately removes those historical values.
