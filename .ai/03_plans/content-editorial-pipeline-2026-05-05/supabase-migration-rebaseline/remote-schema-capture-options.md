# Remote Schema Capture Options

## db pull decision

`supabase db pull` is not run in this phase. It can capture schema shape, but it does not repair migration lineage. Use it only in a dedicated backup-backed rebaseline branch.

## Safer current alternative

Generate an additive admin audit shadow migration and validate it locally as SQL text.
