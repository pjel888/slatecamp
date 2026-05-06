# Publish Dry-Run Report

Supabase write/read credentials are not present in the process environment, so remote backup and remote dry-run diff could not be completed. Local content-audit safe-check dry-run passed for the first smoke article with blockers=0.

Credential presence:
{
  "NEXT_PUBLIC_SUPABASE_URL": false,
  "SUPABASE_URL": false,
  "SUPABASE_SERVICE_ROLE_KEY": false,
  "SUPABASE_SERVICE_KEY": false
}
