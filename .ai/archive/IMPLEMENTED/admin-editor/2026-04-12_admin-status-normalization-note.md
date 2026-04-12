# Admin Status Normalization Note

## Final canonical status model
Canonical app-level statuses remain:
- `draft`
- `in_review`
- `changes_requested`
- `approved`
- `published`
- `archived`

## Final storage decision
- Canonical app contract is still `in_review`.
- A transitional storage bridge remains for environments that still only accept `pending_review`.

## Compatibility handling retained
- `getStatusWriteCandidates()` now explicitly emits:
  - `['in_review', 'pending_review']` for review-state writes
  - a single canonical value for all other statuses
- `isLegacyStatusConstraintError()` explicitly defines the fallback trigger condition.
- The compatibility path is used in:
  - pipeline writes
  - article save/update writes
  - wiki create/update writes

## Why compatibility remains
- The current local environment still demonstrates legacy constraint behavior.
- Removing the bridge now would make owner/admin review transitions fail again.
- Therefore the compatibility layer is retained, but it is now centralized, explicit, and tested.

## What is now finished
- One canonical app vocabulary
- One explicit write adapter for legacy schema compatibility
- No ad hoc hidden retry logic in only one action path

## What remains transitional
- Actual database/storage normalization is still environment-dependent until all target environments accept canonical `in_review` storage directly.
