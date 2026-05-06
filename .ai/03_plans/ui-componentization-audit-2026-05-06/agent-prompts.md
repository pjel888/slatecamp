# Agent Prompts — UI Componentization Audit

## Read-only inventory agent

You are auditing SlateCamp UI componentization opportunities. Do not modify files.

Inputs:
- DESIGN.md
- src/components/ui/AGENTS.md
- src/components/AGENTS.md
- implementation-plan.md

Task:
1. Search one assigned surface for raw/custom UI that duplicates existing primitives or repeated shared patterns.
2. Classify every finding as definite_drift, primitive_gap, shared_pattern, intentional_custom, or decision_needed.
3. Return JSON-like rows matching inventory-template.json.
4. Include exact file paths and line numbers where possible.
5. Do not suggest broad rewrites; suggest smallest safe migration.

## Modal/dialog/sheet inventory agent

Do not modify files.

Search for role="dialog", aria-modal, fixed inset overlays, createPortal, Modal/Dialog/Drawer/Sheet/Overlay component names.
Classify each as ConfirmDialog, Dialog, Sheet, or intentional custom.
For each custom candidate, document dismissal policy, focus behavior, scroll lock, z-index/portal needs, and tests required.

## Primitive gap reviewer

Do not modify files.

Review proposed primitive API changes. Reject changes that break existing consumers or mix primitive API changes with domain migrations. Ensure Storybook states and accessibility checks exist.

## Builder agent, later phases only

Implement only assigned queue IDs. Do not touch unrelated files. Preserve public props where possible. Add/update Storybook. Run assigned commands. Return changed files, tests, visual inspection notes, and risks.

## Reviewer agent

Review the batch diff for:
- DESIGN.md compliance.
- Accessibility regressions.
- Storybook coverage.
- Unrelated changes.
- Shared primitive blast radius.
- Missing tests or browser inspection.
Return approve/block with evidence.
