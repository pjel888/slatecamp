# Open Questions and Gaps

**Last Updated:** 2026-04-27

## Things Not Verifiable from Code

### Q1: Are there any admin API routes outside `src/lib/actions/admin/`?
- **Status:** Unknown
- **Context:** The audit found 23 action files under `src/lib/actions/admin/`, but there may be admin-related mutations in other directories (e.g., `src/lib/actions/wiki/` shared with dashboard).
- **Action:** Search for `canManageContent`, `canReviewContent`, `isSuperAdmin` outside `src/lib/actions/admin/`.

### Q2: What is the current production role distribution?
- **Status:** Unknown
- **Context:** We know the role resolution logic but not how many users have each role in production.
- **Action:** Run query on `user_roles` and `profiles.role` in production (or staging).

### Q3: Are `OWNER_EMAILS` or `ADMIN_EMAILS` set in production?
- **Status:** Unknown
- **Context:** These env vars grant fallback admin access.
- **Action:** Verify production environment configuration.

### Q4: Is `DEV_FORCE_USER_ID` or `ALLOW_DEV_PORTAL_BYPASS` set in any shared environment?
- **Status:** Unknown
- **Context:** These are dev-only overrides but could leak to staging.
- **Action:** Audit all deployment environment variables.

### Q5: What is the actual performance of Content Search at scale?
- **Status:** Unknown
- **Context:** `ilike` with `%term%` and no pagination is a known risk, but we don't know the current data volume.
- **Action:** Measure query time with production-like data volume.

## Missing Product Requirements

### Q6: Should `/admin/settings` be removed or made read-only?
- **Status:** Needs decision
- **Context:** The RBAC plan proposes moving role management to `/ceo`. What happens to `/admin/settings`?
- **Options:** Remove it, make it read-only, or keep it as a super-admin-only diagnostics page.

### Q7: Should CEO users be able to create custom roles?
- **Status:** Needs decision
- **Context:** The proposed RBAC model has predefined roles. Should CEOs define custom permission combinations?
- **Impact:** High — affects database schema and UI complexity.

### Q8: Should role changes take effect immediately or require re-authentication?
- **Status:** Needs decision
- **Context:** Current Supabase sessions are cookie-based. Role resolution happens on every request, so changes should be immediate.
- **Verification needed:** Confirm session refresh behavior after role change.

### Q9: What is the intended behavior for `sme_reviewer`?
- **Status:** Partially documented
- **Context:** SME reviewers can view article editors (read-only) and approve reviews. Can they also view the pipeline? Can they view analytics?
- **Action:** Define SME reviewer permissions explicitly.

## Missing RBAC Decisions

### Q10: Should `developer` role have admin access?
- **Status:** Current code says yes
- **Context:** `developer` is in `adminCms` and `canManageContent`. Is this intentional?
- **Action:** Confirm with product owner.

### Q11: Should `ceo` role have `canManageUsers`?
- **Status:** Current code says no
- **Context:** CEO cannot access `/admin/settings`. The proposed plan gives CEO `admin.users.manage` permission.
- **Action:** Confirm if CEO should manage all admin users or only a subset.

### Q12: Should there be an `auditor` role?
- **Status:** Not implemented
- **Context:** A read-only role that can view audit logs and analytics but not mutate anything.
- **Action:** Decide if needed for compliance or investor reporting.

## Missing Data Model Decisions

### Q13: Should `profiles.role` be deprecated?
- **Status:** Needs decision
- **Context:** `user_roles` is the canonical table, but `profiles.role` is still used as fallback.
- **Options:** Migrate all roles to `user_roles` and drop `profiles.role`, or keep it for primary role display.

### Q14: Should `ceo_team_members.system_role` sync to `user_roles`?
- **Status:** Proposed
- **Context:** Currently syncs only to `profiles.role`.
- **Action:** Update trigger or application logic.

## Missing Test Data

### Q15: Are there seeded test users for each role?
- **Status:** Unknown
- **Context:** E2E tests need users with specific roles.
- **Action:** Check `supabase/03_QUIZ SEED.sql` or create admin-specific seed data.

## Questions for Maintainers

1. **Who is the current product owner for admin features?** — Needed for RBAC decisions.
2. **What is the launch timeline for RBAC hardening?** — Affects phase prioritization.
3. **Are there compliance requirements for audit logging?** — Affects audit log schema.
4. **Should the `developer` portal and `admin` portal remain separate?** — Affects role design.
5. **What is the expected admin user count at launch?** — Affects UX priorities (e.g., search pagination).
6. **Are there any third-party integrations that need admin API access?** — Affects API security design.
7. **Has `isAdminByEmail()` been called by any external system?** — Affects safe removal.
8. **What is the current Supabase RLS policy status for `user_roles`?** — The audit noted `is_super_admin()` can manage rows; verify this is enforced.

## Recommended Follow-Up

### Short Term (This Week)
- [ ] Answer Q1: Search for admin guards outside `src/lib/actions/admin/`
- [ ] Answer Q6-Q9: Product owner decisions on settings, CEO permissions, SME reviewer scope
- [ ] Remove `isAdminByEmail()` (Phase 1)

### Medium Term (This Month)
- [ ] Implement Phase 2 (permission constants)
- [ ] Implement Phase 3 (server-side checks)
- [ ] Implement Phase 7 (high-priority UX fixes)

### Long Term (Next Quarter)
- [ ] Implement Phase 5 (CEO control plane)
- [ ] Implement Phase 6 (audit logging)
- [ ] Implement Phase 8 (comprehensive tests)

## Evidence

- All questions grounded in code findings from this audit
- See other audit documents for detailed evidence paths
