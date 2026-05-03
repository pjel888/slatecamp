# Backup and Recovery

## Before major changes

```bash
cp -a ~/.hermes ~/.hermes.backup-$(date +%Y%m%d-%H%M%S)
```

## Important files to protect

- `SOUL.md`
- `config.yaml`
- `.env`
- `auth.json`
- `memories/`
- `skills/`
- `cron/`

## Recovery mindset

If Hermes behaves strangely after a configuration change, restore the last known good file, then run:

```bash
hermes doctor
hermes config check
```
