# Phase 1 Inventory Report

Date/time: 2026-05-06T17:08:50

## Summary

Generated inventory from six read-only audits plus direct file-system primitive/story discovery. No app code was changed in Phase 1.

- UI primitives inventoried: 36
- Custom UI findings queued: 35
- Modal/dialog/sheet/popover findings: 13
- Storybook-required findings: 35

## Queue counts

- queue-definite-drift.json: 13
- queue-primitive-gap.json: 9
- queue-shared-pattern.json: 7
- queue-modal-dialog-sheet.json: 13
- queue-storybook-gap.json: 35
- queue-intentional-custom.json: 2
- queue-decision-needed.json: 4
- queue-completed.json: 0
- queue-quarantined.json: 0

## Notable safe first candidates

- `UIA-DSS-0003` MobileDrawer close button -> CloseButton/Button icon, after checking visual parity.
- `UIA-DSS-0004` MobileTopBar hamburger -> Button icon, if 34px shell sizing can be preserved.
- `UIA-PUBLIC-0022` and `UIA-PUBLIC-0023` auth error divs -> shared Alert/AuthErrorAlert.
- `UIA-PUBLIC-0018` calculator CheckboxField -> Checkbox/Label wrapper.
- `UIA-PUBLIC-0003` PricingCard CTA -> Button asChild if supported, plus story.

## Quarantine/high-risk areas

- WikiQuizModal.
- 3D Lab world-projected overlays and draggable snap bottom sheet.
- Quiz session/sheet overlays until Dialog/Sheet behavior is reviewed.
- Sidebar shell/drawer broad refactors.
- Unified admin editor internals.

## Code intelligence availability

GitNexus/code-review-graph/ChunkHound are required by root guidance for final blast-radius conclusions, but no native Hermes bindings are exposed in this session. The inventory used file search, direct inspection, subagents, and route/test matrices. If CLI bindings are later available, run the triad before editing high-blast-radius primitives.
