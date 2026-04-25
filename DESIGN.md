---
version: alpha
name: SlateCamp
description: Agent-readable visual identity and design-token contract for SlateCamp.
colors:
  primary: "#1B3FC4"
  primary-50: "#EEF2FC"
  primary-700: "#1535A8"
  primary-foreground: "#FFFFFF"
  background: "#FFFFFF"
  foreground: "#1A2332"
  card: "#FFFFFF"
  secondary: "#F5F5F5"
  muted: "#F5F5F5"
  muted-foreground: "#8896A7"
  border: "#D4DAE3"
  success: "#2D9F6F"
  success-50: "#EDFAF4"
  success-800: "#186243"
  warning: "#D4951A"
  warning-50: "#FEF8ED"
  destructive: "#D64545"
  destructive-50: "#FDF0F0"
  camp-orange: "#E8853A"
  info: "#3B82C8"
  trail-accent: "#534AB7"
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0em
  body-md:
    fontFamily: Atkinson Hyperlegible
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  body-sm:
    fontFamily: Atkinson Hyperlegible
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  label-md:
    fontFamily: Atkinson Hyperlegible
    fontSize: 13px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0em
  code-sm:
    fontFamily: DM Mono
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0em
rounded:
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 8px
spacing:
  micro: 4px
  inline: 8px
  form-gap: 16px
  card: 16px
  section: 24px
  page-gutter: 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 12px
    height: 40px
  button-primary-hover:
    backgroundColor: "{colors.primary-700}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 12px
    height: 40px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 12px
    height: 40px
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 16px
  input-default:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 12px
    height: 40px
  badge-default:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 6px
  quiz-correct:
    backgroundColor: "{colors.success-50}"
    textColor: "{colors.success-800}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: 12px
  quiz-selected:
    backgroundColor: "{colors.primary-50}"
    textColor: "{colors.primary-700}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: 12px
---

# SlateCamp Design System

## Overview

SlateCamp is a calm, work-focused review platform for Philippine Architecture Licensure Exam candidates. The interface should feel serious, legible, and coach-like: dense enough for repeated study, quiet enough for anxious candidates, and precise enough for professional exam preparation.

The visual language is restrained and instructional. Use structural hierarchy, strong typography, exact spacing, and a small semantic color system instead of decorative effects. Every screen should help the student decide what to do next without hype, shame, or manufactured gamification.

`DESIGN.md` is the agent-readable design contract. `src/app/globals.css` remains the implementation source for CSS custom properties and Tailwind CSS 4 tokens.

## SlateCamp Design Standard

SlateCamp's design system is owned by SlateCamp. External systems and historical references can inform decisions, but they are not the authority for how this product should look or feel.

The current standard is:

- **Study-first:** every layout should reduce exam-prep friction and help candidates keep momentum.
- **Signal-first:** color, motion, badges, and visual weight must communicate status, priority, or next action.
- **Legible by default:** Atkinson Hyperlegible body text, clear contrast, obvious focus states, and stable reading layouts are product requirements.
- **Dense but breathable:** dashboards and study tools should support repeated daily use without becoming marketing pages or over-spaced SaaS screens.
- **Calm under pressure:** avoid shame, hype, urgency theater, social comparison, and decorative reward loops.
- **Evidence over inspiration:** use source-backed accessibility and token practices, then translate them into SlateCamp's own rules.

Do not describe new UI work through borrowed external design-language labels. Describe it in SlateCamp terms: candidate goal, study context, state clarity, hierarchy, accessibility, and token compliance.

## System Layers

The design system has four layers:

1. **Foundations:** color, typography, spacing, radius, elevation, motion, and accessibility constraints.
2. **Components:** buttons, inputs, cards, badges, dialogs, tables, nav, quiz feedback, and 3D controls.
3. **Patterns:** onboarding, empty states, loading, error recovery, settings, admin workflows, study-session interruption, and content review.
4. **Governance:** source-of-truth docs, lint checks, route/component audits, visual QA, and design-change acceptance criteria.

Promote a repeated UI treatment into the system only when it appears in multiple product surfaces, carries a stable user meaning, or prevents recurring implementation drift.

## Colors

The palette uses Camp Cobalt as the product color, neutral white and gray surfaces for study density, and semantic signal colors only when the state genuinely requires them.

- **Primary / Camp Cobalt (`#1B3FC4`):** primary actions, active navigation, links, progress bars, selected states, and key metrics.
- **Foreground / Ink (`#1A2332`):** core reading text and high-emphasis labels.
- **Muted Foreground (`#8896A7`):** placeholders, secondary metadata, and low-emphasis helper text.
- **Border (`#D4DAE3`):** default separators, cards, forms, tables, and quiet structure.
- **Success (`#2D9F6F`):** correct answers, mastery, completion, and verified healthy states.
- **Warning (`#D4951A`):** developing skill, incomplete setup, and non-blocking caution.
- **Destructive (`#D64545`):** validation errors, critical alerts, and irreversible destructive actions only.
- **Camp Orange (`#E8853A`):** sparing warm CTA accent when one next action deserves special emphasis.
- **Trail Accent (`#534AB7`):** CampTrails progression context only.

Do not use red to describe low scores or student failure. Low performance should be presented as neutral review guidance unless a real system error or destructive action is involved.

## Typography

SlateCamp prioritizes legibility over personality.

- **Atkinson Hyperlegible:** default body and UI text through `font-sans`.
- **Plus Jakarta Sans:** display headings and stronger section titles through `font-display`.
- **DM Mono:** code snippets, numeric data, score displays, and technical references only. Do not use monospace for ordinary labels or category text.
- **Sora:** logo treatment only.
- **Syne / Boldonse:** rare accent display use where already established.

Letter spacing should be `0` by default. Avoid negative tracking and avoid viewport-scaled type. Use compact type inside cards, panels, sidebars, dashboards, and tools; reserve large display type for true hero moments.

## Layout

Use a 4px base rhythm with common steps of 8px, 16px, and 24px. Page and tool surfaces should be dense but scannable:

- 8px for inline control gaps.
- 16px for standard card padding and form field groups.
- 24px for section padding and page gutters.
- Stable dimensions for boards, tiles, toolbars, counters, and fixed-format controls.

Do not nest UI cards inside other cards. Page sections should be unframed layouts or full-width bands; repeated content items, modals, and genuine tools may use cards.

## Elevation & Depth

Depth comes from borders, tonal surfaces, and spacing before shadows. Resting cards should use little or no shadow. Reserve stronger shadows for dropdowns, popovers, dialogs, and other temporary elevation.

Avoid decorative blobs, gradient orbs, bokeh backgrounds, and ornamental gradients. Gradients are allowed only when they clarify a domain-specific state or when already defined by the app token system.

## Shapes

SlateCamp has a compact radius scale:

- 2px for micro elements and small badges.
- 4px for buttons, inputs, chips, and common controls.
- 6px for cards.
- 8px for dialogs, modals, and larger framed tools.

Do not use `rounded-2xl`, `rounded-3xl`, or large soft containers. `rounded-full` is reserved for avatars, pills, and circular controls.

## Components

Use the existing shadcn-style primitives and SlateCamp shared components before creating new component styling.

- **Buttons:** one primary action per view. Secondary and ghost actions should stay visibly subordinate.
- **Cards:** quiet border, white or semantic surface, compact heading, clear content hierarchy, no nested card stacks.
- **Forms:** visible labels, clear helper/error text, strong focus states, and no unlabeled icon-only inputs.
- **Badges:** status and metadata only; avoid turning badges into gamification rewards.
- **Quiz feedback:** correct/selected states can use semantic backgrounds; wrong/low-score states should avoid anxiety-inducing red unless marking an actual incorrect answer.
- **Empty states:** name what is missing and give the next action. Avoid generic "No data found" copy.
- **3D and interactive tools:** the viewport is for spatial thinking. Keep text-heavy explanations in panels and use color/state changes in geometry sparingly and consistently.

## Accessibility & Interaction

Accessibility is part of the SlateCamp standard, not a downstream QA pass.

- Interactive targets should be at least 40px in SlateCamp components, with 44px preferred for primary mobile actions.
- Never remove visible focus. Focus rings must remain easy to see and must not be hidden by sticky headers, drawers, or overlays.
- Icon-only controls need accessible names and visible tooltips when the icon is not universally obvious.
- Forms need persistent labels, inline validation, useful error messages, and non-color-only state communication.
- Loading, saved, failed, empty, and unauthorized states should be announced or visually persistent enough to support recovery.
- Motion must respect `prefers-reduced-motion`; animated study and 3D surfaces need a static or reduced-motion fallback.

## Research Inputs

These references inform the system, but they do not replace SlateCamp's own design standard:

- [W3C Design Tokens Format Module 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/) supports treating design tokens as platform-agnostic decisions with names, values, aliases, groups, and metadata.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) is the accessibility baseline for focus visibility, focus not obscured, labels, input assistance, contrast, and pointer target sizing.
- [Figma variables, collections, and modes](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes) are the preferred design-tool model for reusable values, semantic aliases, and context modes.
- [Storybook UI testing](https://storybook.js.org/docs/writing-tests) is the preferred component-state review model when shared components need browser-level state coverage.

## Governance

When visual guidance changes, update the full authority chain in the same pass:

1. `DESIGN.md` for agent-readable doctrine and token contract.
2. `src/app/globals.css` for implemented CSS custom properties and Tailwind CSS 4 tokens.
3. `.ai/06_specs/deep/03-design/001-design-system.md` for the deep reference.
4. `.codex/skills/slatecamp-design-system-engineer/SKILL.md` for Codex design-agent behavior.
5. `/developer/design-system` or Storybook examples when the component catalog changes.

New color, typography, radius, motion, or component-state rules require `bun run design:lint` and at least one implementation or audit reference showing why the rule exists. Pre-launch work does not preserve legacy visual variants for backwards compatibility; stale patterns should be removed, renamed, or explicitly marked legacy.

## Do's and Don'ts

- Do use `DESIGN.md` for agent-facing visual guidance and `src/app/globals.css` for implemented tokens.
- Do use `bg-primary`, `text-foreground`, `border-border`, and other semantic utilities instead of hardcoded hex values.
- Do use Atkinson Hyperlegible for ordinary UI text.
- Do keep cards at `rounded-md` or smaller unless using a modal/dialog.
- Do maintain WCAG AA contrast for text and controls.
- Do design empty, loading, error, and unauthorized states as first-class UI.
- Don't use red for low scores, shame, or motivational pressure.
- Don't add confetti, leaderboards, trophies, decorative animation, or hype copy.
- Don't use monospace for ordinary labels, categories, or metadata.
- Don't build landing-page style hero layouts inside operational dashboards.
- Don't add new visual tokens without updating `src/app/globals.css`, `DESIGN.md`, and the design-system docs together.
