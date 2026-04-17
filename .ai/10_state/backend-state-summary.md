# Backend State Summary

**Last Updated:** 2026-04-17

SlateCamp’s backend remains action-centric and Supabase-centric:
- `156` action files under `src/lib/actions/`
- `19` query files under `src/lib/queries/`
- `89` tracked migrations under `supabase/migrations/`

The main backend risk is not lack of capability; it is hidden complexity across admin workflows, entitlements, payments, and compatibility logic. Safe backend work requires reading the data boundary and environment contracts first.

Use:
- `../06_specs/backend-system-map.md`
- `../00_system/data-boundary-map.md`
- `../00_system/environment-contract.md`
