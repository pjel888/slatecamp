# Open Questions and Gaps

**Last Updated:** 2026-04-28

## Unknowns Not Verifiable from Code

1. **Production environment variables:** Is `ALLOW_DEV_PORTAL_BYPASS` ever set in production or staging? This cannot be verified from source code.
   - **Action:** Check deployment environment configs (Vercel, etc.) outside this repo.

2. **Supabase status API reliability:** How often does `https://status.supabase.com/api/v2/summary.json` fail or return unexpected shapes?
   - **Action:** Monitor logs for fetch failures.

3. **Real usage of test data generator:** Is the test data generator actively used by developers, or is it legacy?
   - **Action:** Check with team or review analytics events.

## Product Decisions Needed

1. **Mock data on status pages:** Should `/developer/status/database` and `/developer/status/infrastructure` remain mock-backed indefinitely, or is there a plan to wire live telemetry?
   - **Current decision:** Documented as fallback. Safe to keep for MVP.
   - **Future:** Consider Vercel deployments API, Supabase metrics API.

2. **Fine-grained developer permissions:** Should different developer tools (console, db, logs, test data) have separate permission checks?
   - **Current decision:** Single `developerPortal` gate is sufficient for MVP.
   - **Future:** Consider splitting if team grows or tools become more sensitive.

3. **Audit log access:** Should developers (non-super-admin) see a read-only subset of audit logs, or should the section be completely hidden?
   - **Current decision:** Shows error state. Could be improved with "Super Admin Only" notice.

## Missing Requirements

1. **Rate limiting spec:** No documented rate limits for test data generation.
   - **Implemented assumption:** 10 requests per minute per user.

2. **Data retention for test data:** No documented policy for cleaning up generated test sessions and organizations.
   - **Gap:** Test data may accumulate in production if generator is used.

3. **Impersonation panel security:** The `ImpersonationPanel` component is included in the console but its security model was not deeply audited in this pass.
   - **Note:** It is a client component with its own server actions that should have their own auth checks.

## Missing Environment Info

1. **Staging URL pattern:** `layout.tsx` checks `NEXT_PUBLIC_APP_URL?.includes('staging')` for env badge. This assumes the URL contains the word "staging".
   - **Risk:** May not match actual staging URL.

## Missing Security Decisions

1. **Is exposing `userId` in SystemInfo acceptable?**
   - **Current assessment:** Low risk — user sees their own ID.
   - **Decision:** Keep as-is for MVP.

2. **Should `getTableInfo` fallback query all known tables?**
   - **Current assessment:** Low risk — only counts, no data exposure.
   - **Future:** Could be slow with many tables.

## Unresolved Implementation Blockers

None identified. All implementation items can proceed without external dependencies.

## Recommended Maintainer Questions

1. Do we want to keep the test data generator in production, or should it be dev-only?
2. Should we wire live telemetry to the status pages before launch?
3. Is the current `developerPortal` coarse permission acceptable for launch?
4. Should we add a "cleanup test data" feature?

## Assumptions Made During Implementation

1. `assertDeveloperAccess()` will reuse the existing `getViewerEntitlements` infrastructure.
2. Rate limiting will be simple in-memory (not Redis) since it's dev-only.
3. Accessibility fixes will follow existing design system patterns.
4. No new dependencies will be added.
