# Decision 001: Local-First Export

## Decision

Use a local-first export inside the SlateCamp repo workspace.

## Reason

Local files are easier for Codex/Kimi/humans to inspect, diff, normalize, and safely round-trip.

## Consequence

The repo needs scripts to keep local files in sync with Supabase and avoid stale pushes.
