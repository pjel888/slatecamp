# PRD: 3D Lab Camera Controls Stability

## Problem
3D Lab camera controls have recurring failures around perspective/isometric projection toggles, named views, fit-to-view, pan, and clipping. The most urgent bug is that switching from perspective to isometric zooms out excessively and causes clipping / model-loss.

## Goals
1. Default view loads as SE and fit-to-model.
2. Projection toggles (`perspective`, `iso`) preserve the current framing instead of zooming out.
3. Named views change orientation without resetting user framing or forcing projection mode.
4. Zoom-to-fit fits actual visible model geometry, excluding grids/ground/helper planes.
5. Controls remain usable: pan unconstrained, toolbar non-overlapping, clipping sane.
6. Regression coverage captures projection-toggle, named-view, default-view, and fit edge cases.

## Non-goals
- No new camera-control dependency.
- No major UI redesign beyond fixing toolbar/layout regressions already in scope.
- No database/backend changes.

## User stories
- As an ALE learner, I can open any 3D module and immediately see the model from the SE at a useful fit.
- As a learner, I can toggle perspective/isometric without losing zoom position or clipping the subject.
- As a learner, I can choose NE/NW/SE views without unintentionally switching projection or resetting zoom.
- As a learner, I can pan freely across the scene.

## Acceptance criteria
- Initial camera command produces SE orientation and model-only fit.
- Perspective -> isometric and isometric -> perspective preserve visible subject framing within tolerance.
- Named view commands preserve distance/orthographic zoom and projection mode.
- Zoom-to-fit bounds exclude grid/ground/helper surfaces.
- Targeted unit tests, audit script, typecheck/lint, and browser sanity check pass.
