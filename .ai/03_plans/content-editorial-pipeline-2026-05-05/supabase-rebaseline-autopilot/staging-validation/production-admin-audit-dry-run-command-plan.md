# Production Admin Audit Dry-Run Command Plan

Future-only commands after staging proof and backup:

1. `bunx supabase db push --dry-run --linked`
2. Direct SQL plan review for admin audit objects only.
3. Schema probe for existing objects.
4. Apply only if lineage strategy and no-go checklist pass.

This file is a plan, not an execution log.
