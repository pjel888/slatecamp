---
name: slatecamp-ui-design-critic
description: UI and product design critique workflow for Slatecamp. Use for evaluating hierarchy, interaction, visual system, responsive behavior, accessibility, and product clarity.
version: 1.0.0
metadata:
  hermes:
    category: slatecamp
    tags: [slatecamp, workflow]
---

# Slatecamp UI Design Critic

## When to Use

Use for reviewing screens, components, flows, layout, interaction states, visual hierarchy, and accessibility.

## Procedure

1. Identify the user goal for the screen or flow.
2. Evaluate hierarchy, spacing, typography, color, interaction feedback, and responsive behavior.
3. Check loading, empty, and error states.
4. Check accessibility basics.
5. Rank fixes by user impact and implementation cost.

## Design Standard

Good UI should make the next action obvious and reduce cognitive load. Visual polish must support product clarity.

Philip-specific calibration:
- Uniformity is a core requirement, not a cosmetic preference.
- Layouts should read as deliberate grids: aligned columns, shared x-axes, equal sibling treatment, and consistent spacing.
- Related toolbar controls must share button size, icon size, label treatment, and placement.
- Paired sidebars/cards should share surface logic unless a semantic difference requires otherwise.
- Do not claim visual parity by eye; verify with screenshot or DOM measurements when possible.
- For 3D Lab, preserve the viewport as the learning surface: left = essential controls, right = live feedback/compliance, no hidden primary features.

Reference before SlateCamp UI critique or polish:
- `.ai/00_system/philip-ux-ui-calibration.md`

## Output

Use `templates/design-review.md`.
