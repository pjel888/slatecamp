# X5 Staging Target Provisioning Template

```bash
# Branching path after Pro is enabled
bunx supabase --experimental branches create admin-audit-staging \
  --persistent \
  --project-ref hrpdwqurngnyajuhbkdg \
  --yes

# Then set in shell only
export SUPABASE_STAGING_PROJECT_REF="<non-production-ref>"
export SUPABASE_STAGING_DB_URL="<staging-db-url>"
```
