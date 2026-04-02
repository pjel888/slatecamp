<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# score

## Purpose

Readiness Score display. Animated SVG ring (0-100), zone badges, delta display, loading skeleton.

## For AI Agents

1. **Zones fixed:** Strong 85-100, On Track 70-84, Developing 40-69, Needs Review <40
2. **Color strict:** Use getReadinessColorClass()
3. **Motion respected:** Check prefers-reduced-motion
4. **Sizes predefined:** sm (80px), md (160px), lg (240px)

## Dependencies

Internal: @/components/shared/score-display, @/lib/utils

External: react, tailwindcss

<!-- MANUAL: -->
