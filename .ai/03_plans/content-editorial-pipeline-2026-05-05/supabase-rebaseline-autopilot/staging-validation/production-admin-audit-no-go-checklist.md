# Production Admin Audit No-Go Checklist

No-go if any item is true:

- 214 remote-only migration history entries remain unreconciled without approved strategy.
- No production backup.
- No hosted staging apply/readback.
- No rollback proof.
- `db push --dry-run` shows unrelated/destructive changes.
- Target project ref equals production during staging phase.
