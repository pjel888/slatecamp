# DEPRECATED: Pending IP & Architectural Features

**Date:** 2026-04-04
**Source Audit:** `.ai/IP Execution Plan/IP_EXECUTION_PLAN.md`, `.ai/GLOBAL-CODEBASE-AUDIT-REPORT.md`, `.ai/docs/PLATFORM_OVERVIEW.md`

> ⚠️ **DEPRECATION NOTICE**
> The proprietary "IP-defining" features listed below (Lucky Guess Detector, Double-Pass LLM, 3D Bounds Breaking, etc.) have been formally **deprecated and archived**. We are shifting focus away from these complex behavioral heuristics to focus on core platform stability and content.
> 
> The original design documents for these features have been moved to `@prompts/archives-organized/10-legal-patents/` (including `2026-04-01_slatecamp-ip-implementation-plan.md`, `2026-04-01_slatecamp-patent-framework.md`, and `2026-04-01_slatecamp-patent-ux-ui-implementation-plan.md`). They remain available for historical reference but are not slated for implementation.

---

## 1. ~~The "Lucky Guess" Detector (High Priority)~~ [DEPRECATED]
**Concept:** A time-difficulty correlation system that penalizes students who answer high-difficulty questions suspiciously fast.

## 2. ~~Zero-Hallucination Double-Pass & Citation UI~~ [DEPRECATED]
**Concept:** A two-LLM verification pipeline for the AI Tutor to ensure it never hallucinates building codes or legal citations.

## 3. ~~3D Lab "Learning by Breaking"~~ [DEPRECATED]
**Concept:** The 3D models must visually communicate legal failure when a student drags a parametric slider beyond building code limits.

## 4. ~~Full Exam Simulation 24-Hour Delay~~ [DEPRECATED]
**Concept:** "Proof Simulation™" requires a 24-hour cooling-off period before results are revealed.

## 5. ~~Nightly Focus Review Scan / Blindspot Protocol~~ [DEPRECATED]
**Concept:** A nightly cron job that hunts for a student's weakest or unexplored taxonomy nodes and auto-generates a targeted quiz queue for the next day.

---

## Resolved Technical Debt

While auditing the legacy `.ai/` files, several critical technical debt items were flagged in `GLOBAL-CODEBASE-AUDIT-REPORT.md`. **These have been verified as RESOLVED in the current codebase:**

1. ✅ **Security Headers:** `next.config.ts` successfully includes `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, etc.
2. ✅ **XSS Vulnerabilities:** `DOMPurify` is actively used around all `dangerouslySetInnerHTML` injections in `src/components/shared/question-card.tsx` to sanitize markdown and HTML strings.
3. ✅ **Payment Button Wiring:** The upgrade buttons are being refactored to use **LemonSqueezy** (replacing Stripe) alongside PayRex for Philippine local payments.
4. ✅ **TypeScript Strict Mode:** Project now respects strict type boundaries, though ongoing typing improvements continue.
