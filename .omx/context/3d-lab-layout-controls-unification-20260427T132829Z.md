# Ralph Context Snapshot — 3D Lab Layout and Controls Unification

## Task statement
Unify active SlateCamp 3D Lab modules so all active modules share the same global shell, header/footer/status, viewport/canvas structure, toolbar/control overlay, sidebars, loading/error/empty states, responsive behavior, and camera/control behavior. Only module sidebar content, scene/model content, approved metadata, and approved camera presets may vary.

## Desired outcome
A verified implementation with static audits, Playwright consistency gates, report `.ai/00_performance/41_3d_lab_layout_and_controls_unification.md`, required existing 3D checks passing, committed and pushed to `origin/main`.

## Known facts/evidence
Previous commit `34d5a620` added 3D hardening/perf gates but did not prove layout/control consistency. User reports current unacceptable examples: Site Development Control has footer while Stairs does not; PAN/Orbit behavior differs; modules own/override global layout.

## Constraints
No speculative production-quality claim. Must discover active modules from code. Must not rely on route smoke as consistency proof. Must preserve performance ledger under `.ai/00_performance`. Must commit and push. Must use Bun. Must avoid secrets.

## Unknowns/open questions
Current active module registry shape, module route component architecture, current shared shell availability, all current controls implementations, whether legacy detail pages use one ModuleViewer path or custom wrappers.

## Likely codebase touchpoints
`src/app/dashboard/3d-lab/**`, `src/features/3d-lab/**`, `.ai/00_performance/playwright/**`, `.ai/00_performance/scripts/**`, `package.json`, `.github/workflows/**`.
