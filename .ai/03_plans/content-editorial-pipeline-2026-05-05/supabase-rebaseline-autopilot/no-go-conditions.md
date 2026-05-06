# No-Go Conditions

Production remains blocked if any of these are true:

- Migration repair would be speculative.
- `db push --dry-run` shows unrelated destructive changes.
- Backup/restore path is unverified.
- Staging/preview cannot reproduce the admin audit schema apply.
- Readback validation fails.
- Secret scan finds real secrets.
- Generated SQL contains DROP, TRUNCATE, or unscoped DELETE.
