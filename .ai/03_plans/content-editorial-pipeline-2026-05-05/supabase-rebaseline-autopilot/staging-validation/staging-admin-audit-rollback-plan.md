# Staging Admin Audit Rollback Plan

Local/staging rollback key: delete admin audit rows by imported run_id / payload family id. For local simulation, rollback clears only the simulated audit ledger. Production rollback is forbidden because production was not mutated.
