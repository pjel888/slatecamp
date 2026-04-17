# Admin Owner Blocker Closure Report

**Date:** 2026-04-12

## Scope
Close the two remaining owner-smoke blockers and harden the compatibility paths they exposed.

## Closed blockers
- `/admin/preview/[previewId]`
  - Admin shell chrome is now bypassed in `src/app/admin/_components/AdminShell.tsx`.
  - The route renders article content with the intended draft-preview banner and without admin navigation/sidebar/topbar chrome.

- `/admin/audit`
  - The route no longer hard-fails when `public.audit_logs` is unavailable in the current environment schema cache.
  - It now renders a clearly-labeled synthesized fallback feed from admin-managed tables.

## Compatibility hardening completed
- Status compatibility is now explicit through the editor workflow adapter rather than hidden in one pipeline action.
- Role fallback is now explicit in code and UI, with `user_roles` as canonical and `profiles.role` as degraded fallback.
- Multi-primary topic ownership is now deterministic and operator-visible rather than silently arbitrary.

## Final closure verdict
- Preview blocker: **closed**
- Audit blocker: **closed at the application level**
- Environment still lacks the true `audit_logs` schema exposure, but the route is now truthful and operational instead of broken.
