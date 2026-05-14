# Batch 164 Application Context Constraint Fix

Generated: 2026-05-14

## Problem

The first live Supabase apply attempted all 90 Batch 164 question updates and every row was rejected by the database check constraint `chk_application_context`. No rows were updated.

The migration `supabase/migrations/015_learning_science_sprint2.sql` allows only:

- `recall`
- `calculation`
- `design_application`
- `code_interpretation`
- `client_scenario`

Batch 164 used source-audit labels such as `source_audited_nscp_embedments_batch_164` in `proposed.application_context`, which are audit metadata, not valid DB context values.

## Fix

Normalized all 90 Batch 164 proposed `application_context` values to `code_interpretation`, because these questions test interpretation of NSCP code provisions and source-anchored rule application. The source-audit/batch context remains preserved in `practice_context`, source-audit evidence, per-question source support, reports, and logs.

## Scope

- Question edits updated: 90
- Article body changes: 0
- Answer-key changes: 0
- Question text/options/rationale changes: 0
- Source scope expansion: none

## Original values

- `source_audited_nscp_seismic_zone_factor_batch_164`: 10
- `source_audited_nscp_serviceability_deflection_batch_164`: 10
- `source_audited_nscp_embedments_batch_164`: 10
- `source_audited_nscp_wood_decay_termite_batch_164`: 10
- `source_audited_nscp_timber_stress_groups_batch_164`: 10
- `source_audited_nscp_wind_definitions_batch_164`: 10
- `source_audited_nscp_nonstructural_equipment_batch_164`: 15
- `source_audited_nscp_seismic_bracing_batch_164`: 15
