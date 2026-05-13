# 05 - Comprehensive UX/UI Implementation Plan

## UX Objective

LI should feel like a calm learning instrument, not a stripped-down PI module. The interface should make the next action obvious: look at the model, tap a hotspot, learn one thing, verify it, continue.

## Product Surfaces

| Surface | MVP behavior |
| --- | --- |
| 3D Lab dashboard | Show Learning badge for LI modules; optional mode filter when LI exists. |
| Module route | Reuse existing `/dashboard/3d-lab/[moduleId]` route. |
| Viewport | Full 3D model, shared camera/header/toolbar primitives. |
| Right panel | Hotspot list, explored count, optional layer toggles, source status. |
| Overlay/modal | Hotspot content: info, quiz, or comparison. |
| Mobile | Hotspot tap opens bottom sheet/modal; right panel collapses into sheet. |
| Static fallback | Text/image/card fallback with same learning objective and source cards. |

## Dashboard UX

### Card Badge

Every module card should communicate interaction mode:

- Parametric: existing PI styling, no visual regression.
- Learning: distinct but calm badge label, for example `Learning`.

Rules:

- Do not over-emphasize mode over topic.
- The topic remains the card's primary scan target.
- Badge copy should be plain: `Parametric` and `Learning`.

### Mode Filter

Filter chips:

- `All`
- `Parametric`
- `Learning`

Rules:

- Only show filter when at least one LI module is visible and the feature flag allows it.
- Counts are useful but optional.
- Filtering must not hide locked/access-controlled state incorrectly.

## LI Module Layout

### Desktop

Recommended layout:

- existing viewport header,
- shared canvas and toolbar,
- model centered,
- DOM hotspots over model,
- compact right panel,
- no left sidebar,
- bottom status line with explored count and source/review status.

Right panel content order:

1. Module title/short objective.
2. Hotspot progress: `3 of 8 explored`.
3. Hotspot list grouped by type or model region.
4. Optional layer toggles.
5. Source status and correction/report link.

### Mobile

Rules:

- Hotspots are touch-first.
- Avoid permanent side panels.
- Open hotspot content in a bottom sheet or modal.
- Keep close/back controls obvious.
- Keep tap targets large enough for thumb use.
- Preserve orbit/pan gestures without fighting overlay interactions.

## Hotspot Interaction Model

### Load State

The model loads clean:

- 0-2 orientation labels only.
- No dense dimensions on first paint.
- Hotspots appear after brief orientation, orbit, or deliberate "show hotspots" state.

### Hotspot States

| State | Behavior |
| --- | --- |
| Available | Dot visible with label on hover/focus/tap. |
| Focused | Dot and related geometry highlight. |
| Open | Panel/modal appears with one concept. |
| Explored | Dot becomes quieter but remains revisitable. |
| Hidden layer | Dot hides or shows disabled/ghost state with explanation. |
| Quiz correct | Show rationale and source, mark explored. |
| Quiz incorrect | Show corrective feedback and highlight related info hotspot. |

### Hotspot Type Visuals

Use color plus icon/text:

- Info: info icon/label.
- Quiz: question/check icon/label.
- Comparison: split/table icon/label.

Do not rely on color alone.

## Hotspot Content Rules

1. One concept per hotspot.
2. Plain language first, code citation second.
3. Dimension callout is the most memorable element.
4. Source card link is visible for source-sensitive claims.
5. Quiz feedback explains why, not only whether.
6. Do not auto-open dense source text.
7. Do not show more than one active learning task at a time.

Recommended content structure:

- Type badge.
- Title.
- 1-3 sentence plain-language explanation.
- Dimension callout if applicable.
- Source card ID/citation.
- Optional `Learn in Wiki`.
- Optional `Report issue`.
- Optional quiz or comparison table.

## Accessibility Plan

Keyboard:

- Hotspot markers must be focusable.
- Enter/Space opens hotspot.
- Escape closes active hotspot.
- Tab order moves from viewport controls to hotspot list to right-panel controls.

Screen reader:

- Hotspot accessible names include type and topic.
- Quiz feedback is announced.
- Layer toggle state is announced.
- Progress count is text, not only visual.

Reduced motion:

- Pulsing dots and camera transitions respect `prefers-reduced-motion`.
- Provide non-animated focus/highlight.

Color:

- Functional red only for errors/critical state.
- Do not use anxiety-red for "low mastery".
- Use existing SlateCamp tokens and compact design system patterns.

## Visual Design Rules

- Keep the module surface quiet and utilitarian.
- Avoid decorative cards inside cards.
- Keep panels compact.
- Use icons for hotspot type and controls.
- Keep card radius and controls consistent with existing 3D Lab.
- Do not introduce a new one-note palette.
- Text must fit inside buttons/panels at mobile and desktop sizes.

## Learning UI Patterns

### First-time learner

- Start with guided orientation copy in the right panel.
- Show 2-3 priority hotspots first.
- Progress count reduces uncertainty.
- Quiz appears after exploration or as optional orange hotspot.

### Retaker

- Allow direct deep link to hotspot.
- Highlight priority hotspots immediately.
- Make quiz hotspots easier to find.
- Show "reviewed after wrong answer" state later when quiz integration exists.

### Working professional

- Provide "critical hotspots" path.
- Keep session length to 10-15 minutes.
- Avoid requiring full exploration before quiz.

## UX Acceptance Criteria

- A student understands what to do within 3 seconds of module load.
- Opening a hotspot never covers the entire model on desktop unless needed.
- Mobile hotspot content is readable without pinch zoom.
- Quiz feedback is understandable without source-card deep reading.
- The right panel helps navigation but is not required to learn.
- PI and LI are visibly distinct but still part of one 3D Lab system.
