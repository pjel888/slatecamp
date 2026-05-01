# Decision 002: Preserve UI Blocks Exactly

## Decision

Custom UI blocks are extracted and preserved exactly in `ui-blocks.json`.

## Reason

Article UI/component syntax may contain important embedded learning data. Deleting or rewriting it risks breaking SlateCamp learning experiences.

## Consequence

AI and humans should edit `normalized.md`, not raw custom UI syntax, unless deliberately editing a UI block through a tracked sidecar.
