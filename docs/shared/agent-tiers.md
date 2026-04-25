# Agent Tiers

This file is the local reference for OMX ultrawork and team delegation tier choices.

## LOW

Use for bounded lookup, inventory, grep-backed mapping, straightforward documentation edits, and narrow verification tasks.

Examples:
- route/file inventory
- claim-string scan
- stale-doc count checks
- small bridge-doc updates

## STANDARD

Use for normal implementation, focused refactors, test additions, and cross-file fixes with clear ownership.

Examples:
- route constant cleanup
- public-claim copy narrowing
- audit script implementation
- focused Supabase drift reports

## THOROUGH

Use for high-risk architecture, database, security, migration, or app-wide UX decisions where mistakes have broad blast radius.

Examples:
- destructive database cleanup planning
- schema reconciliation strategy
- launch-blocking UX review
- final verification and release-readiness synthesis

## Current SlateCamp Guidance

- Prefer parallel LOW/STANDARD discovery after a baseline snapshot.
- Keep database/schema/types/migrations single-owner and THOROUGH-reviewed.
- Keep docs/AGENTS sync single-owner.
- Keep final verification independent from implementation lanes.
- Do not send secrets, service-role keys, private env values, or production data to companion AI tools.
