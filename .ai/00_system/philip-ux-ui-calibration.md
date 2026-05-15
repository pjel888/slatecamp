# Philip UX/UI Calibration

This document records durable SlateCamp design calibration for future agents.

## Fast lookup

| Situation | Default response |
| --- | --- |
| UI feels inconsistent | Check shared dimensions, spacing, surfaces, and alignment before changing content or architecture. |
| Philip asks for same-size icons/buttons | Measure button box, icon box, label placement, and font size in DOM; then harmonize sibling controls. |
| Sidebar feels cramped | Remove redundant wrappers/borders, reduce decorative padding, keep controls full-width, verify scrollHeight/clientHeight. |
| 3D Lab workbench polish | Preserve viewport priority; left = controls, right = feedback/compliance; verify no overlap and no accidental scroll. |
| Design claim in final report | Include file paths plus screenshot/DOM evidence. |

## Core philosophy

Philip values UI/UX that is properly executed, not merely functional. The recurring standard is:

- strict uniformity;
- visible grid discipline;
- consistent alignment;
- matched icon and button sizing;
- sibling panels that share spacing, surface treatment, and hierarchy;
- learning interfaces that feel intentionally designed and pedagogically useful.

Treat Philip's visual corrections as system-level taste calibration. Do not defend inconsistent UI. Inspect the rendered screen, measure the discrepancy, harmonize the system, and verify with screenshot or DOM evidence.

## What “good” usually means for Philip

1. Uniform components
   - Related toolbars use the same button size, icon size, text placement, and label scale.
   - Related cards use the same radius, shadow/border logic, and padding.
   - Left and right sidebars use consistent outer padding and density unless intentionally different.

2. Grid-first layouts
   - Titles align to their actual content column, not accidentally to the whole page.
   - Labels and values sit on shared x-axes.
   - Comparison cards use equal heights when comparison is the learning task.
   - Controls line up and fill the space they are given.

3. Compact but not cramped
   - Remove redundant wrappers, labels, borders, and decorative spacing before reducing the learning surface.
   - Prefer full-width sliders and precise controls.
   - Avoid accidental scroll at normal desktop sizes when content can reasonably fit.

4. Learning-first polish
   - The UI must teach the concept, not simply look polished.
   - Violations, feedback, and repair paths should be immediate and readable.
   - Primary learning controls should not be hidden.
   - Use modals/drawers for extended explanation, not for core feedback that learners need during manipulation.

## SlateCamp 3D Lab calibration

For 3D Lab workbenches:

- The viewport is the learning surface.
- Left sidebar = essential controls and object parameters.
- Right sidebar = live consequences, compliance, violations, and repair cues.
- Sidebars should be compact, aligned, and preferably no-scroll at target desktop sizes.
- Slider ranges may exceed legal limits so learners can intentionally create violations.
- Do not put violation styling in the left controls if the right feedback panel owns violation explanation.
- Code violations must use universal red in both UI feedback and 3D model geometry; law colors are identity accents only, not failure-state colors.
- Camera and scene toolbars should behave as one visual system: same size, same icon scale, same label placement.
- Preserve useful original structures when Philip likes them; refine density and alignment instead of replacing the mental model.

## Required verification behavior

For UI implementation claims, verify with evidence:

- screenshot path;
- DOM measurements for same-size claims;
- no-scroll checks using scrollHeight/clientHeight;
- lint/typecheck results where practical;
- exact files changed.

Do not say two elements are the same size unless measured or directly verified.

## Agent behavior rule

When Philip asks for design improvement, act like a disciplined product designer and front-end auditor:

1. Load relevant skills.
2. Inspect the actual code/screen.
3. Identify the grid/system inconsistency.
4. Make the smallest coherent system fix.
5. Verify visually and numerically.
6. Report concise evidence.
