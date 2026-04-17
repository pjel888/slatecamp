# Admin Role Authority Decision Note

## Final authority decision
**Canonical source of truth for internal admin/staff roles:** `user_roles`

## Precedence contract
1. `DEV_FORCE_USER_ID` local bypass
2. `user_roles`
3. `profiles.role`
4. `app_metadata.role`
5. `user_metadata.role`
6. `OWNER_EMAILS` / `ADMIN_EMAILS` bootstrap fallback
7. anonymous/member fallback

## Interpretation
- `user_roles` is the canonical internal-role authority.
- `profiles.role` is a degraded compatibility surface, not the preferred authority.
- metadata/email sources are lower-precedence compatibility/bootstrap paths.

## Why this model was chosen
- It stops the previous “strongest role from all sources wins” split-brain behavior.
- It makes one source authoritative while still allowing the system to function in constrained environments.
- It keeps route gating, settings, and entitlement resolution aligned under one explicit precedence order.

## Settings behavior
- The settings UI now tells the operator when it is running in `profiles.role` fallback mode.
- Assign/revoke actions return storage mode explicitly.
- The client manager updates visible role state immediately and truthfully.

## Remaining compatibility debt
- `profiles.role` fallback remains because some environments still block `user_roles`.
- This fallback is now explicit, surfaced, and tested.
