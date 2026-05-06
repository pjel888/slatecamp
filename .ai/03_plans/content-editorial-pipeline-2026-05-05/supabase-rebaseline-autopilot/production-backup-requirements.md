# Production Backup Requirements

Before any production rebaseline or admin audit production apply:

- Confirm Supabase PITR or full logical backup availability.
- Export schema-only backup.
- Export data backup for tables touched by admin audit or content sync.
- Record project ref, backup timestamp, and restore procedure.
- Perform restore drill in staging/preview.
- Require successful dry-run and readback validation.
