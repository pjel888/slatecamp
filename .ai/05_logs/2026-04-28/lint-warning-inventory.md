# Lint Warning Inventory — 2026-04-28

`bun run lint` passed with 0 errors and 344 warnings during `.ai/05_logs/2026-04-28/validate-release-final-green-9.log`.

Warning classes observed:

- Unused variables/imports/arguments under `@typescript-eslint/no-unused-vars`.
- Unused eslint-disable directives.
- Design-token warnings for hardcoded hex Tailwind classes.
- `@next/next/no-img-element` warnings.
- React hooks dependency/suppression warnings.

These warnings are not new hard failures for this release-validation loop. They should be addressed in a dedicated cleanup pass to avoid obscuring RBAC/security validation changes.
