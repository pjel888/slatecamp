# Landing Page Best-Representation Implementation Plan

**Date:** 2026-05-07
**Branch:** `feat/landing-3d-hero-best-representation`
**Status:** Implementation plan for current build pass

## Goal

Rewrite the public landing page so SlateCamp is presented as a premium architecture study companion: a reliable, source-backed, visual field guide that helps students and board aspirants feel oriented, comfortable, and prepared without pretending to replace review centers, instructors, official sources, or licensed professional judgment.

## Non-goals

- Do not claim pass guarantees, PRC prediction, official-source status, or review-center replacement.
- Do not lead with SRS, active recall, IRT, SM-2, taxonomy jargon, or internal learning-science mechanics.
- Do not hardcode public legal/code calculator values as authoritative if source locators are not fully verified.
- Do not make the landing page depend on a heavy authenticated dashboard shell.

## Constraints

- Follow `.ai/03_plans/2026-05-07-landing-page-final-messaging-gate.md`.
- Follow `.ai/03_plans/2026-05-07-hero-3d-interactive-diagram-plan.md`.
- Public exam copy uses `Licensure Examination for Architects`; `LEA` is avoided in public landing copy except metadata/internal contexts.
- Free resources may be dashboard-gated, but CTAs must be honest about signup or preview state.
- Exact setback values in public copy must be framed as an educational preview unless backed by verified locators.

## Implementation sequence

1. Replace the hero with outcome-first copy: assurance, clarity, source-backed guidance, and companion positioning.
2. Add an interactive Code Envelope Explorer hero visual using accessible React controls and an SVG/isometric static-first visual: eave projection, 750 mm clear zone, setback layer toggle, buildable envelope.
3. Rewrite the four-pillar grid into Knowledge Resources, Quizzes, 3D Lab, and Free Tools.
4. Rewrite quiz, wiki, 3D Lab, readiness/pathway, how-it-works, comparison/companion, social proof, final CTA, metadata, and site hidden description to match the messaging gate.
5. Run type-check, lint, and build. Inspect the landing page in browser at desktop and mobile-ish sizes. Fix issues until clean.
6. Run independent review passes with Claude/CommandCode/OpenCode/Kimi/Codex-style review prompts, then close findings.

## Acceptance criteria

- Above-the-fold answers: what SlateCamp is, who it is for, what is free, and how it helps Licensure Examination for Architects readiness.
- Hero shows a strong product proof, not a generic dashboard mockup.
- Copy positions SlateCamp as a companion beside review centers, books, notes, mentors, and instructors.
- No first-scroll jargon: SRS, SM-2, IRT, EMA, taxonomy, active recall.
- No dangerous legal/marketing claims: pass guarantees, official status, exam prediction, replacement of review centers.
- CTAs are honest: free account, free tools, preview, dashboard-gated resources.
- TypeScript, lint, and build pass or any unrelated blocker is documented with evidence.
