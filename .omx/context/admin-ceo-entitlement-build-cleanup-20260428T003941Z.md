# Admin/CEO entitlement build cleanup snapshot

Task statement: resolve the remaining dirty main working tree and main-tree build blocker left after the 3D Lab unification commit. User authorized committing these changes with meaningful messages.

Desired outcome:
- Inspect all remaining dirty/untracked files.
- Determine which are actual admin/CEO/entitlement feature changes versus generated/perf noise.
- Fix build/type/lint blockers caused by those dirty files.
- Verify with Bun commands.
- Commit and push meaningful Lore-style commits without reverting prior work.

Known facts:
- Previous 3D Lab unification commit was pushed as 279572553ced82164a01313257dac7735632a8df.
- Main-tree build previously failed due unrelated /ceo/team/admin-roles server-action export issue.
- Current surface is Codex App/native outside tmux, so OMX tmux team cannot be launched here.

Constraints:
- Use Bun.
- Do not print/store secrets.
- Prefer preserving user changes; user explicitly authorized committing dirty changes too.
- Use meaningful commit messages.
- Run type-check/lint/build before final completion where practical.

Likely touchpoints:
- src/app/(protected)/ceo/team/admin-roles
- src/app/(protected)/ceo/team/permission-audit
- src/components/ceo/CeoAdminRoleManager.tsx
- src/hooks/usePermission.ts
- src/lib/actions/ceo/admin-role-actions.ts
- src/lib/admin/audit.ts
- src/app/admin/**
- src/lib/actions/admin/**
- src/lib/entitlements/**
