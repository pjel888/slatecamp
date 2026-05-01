# PRD — Landing Page Focus Fix

## Goal
Make the SlateCamp landing page feel focused, credible, and production-ready by removing confusing decorative controls and tightening the user-facing story around ALE readiness.

## User stories
- US-001: As an anxious ALE candidate, I immediately understand SlateCamp tells me where I stand and what to study next.
- US-002: As a visitor, I am not distracted by internal waypoint cards, animation controls, or unexplained game-like UI.
- US-003: As a reviewer/founder, I can inspect the page in browser screenshots without dev or prototype chrome.

## Acceptance criteria
- No visible “Current waypoint” UI or waypoint card language on `/`.
- No visible “Pause motion” / play-pause control on `/`.
- Hero keeps the immersive 3D background but treats it as ambient proof, not a mini-game.
- Primary CTA and page copy remain clear and actionable.
- Desktop and mobile browser smoke checks pass.
- `bun run type-check`, `bun run lint`, `bun run build`, and `git diff --check` pass.
