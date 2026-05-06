# X4 Backup/Dump Plan

No production DB URL environment variable was present, so no dump was created. Future safe dump requires a read-only production DB URL supplied by environment, then `pg_dump --schema-only` and separate `supabase_migrations` export without writing credentials.
