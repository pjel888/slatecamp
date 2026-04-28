# CEO Live/Staging Credential Readiness — Lint Loop

Date: 2026-04-28
Branch: main
HEAD at start: 43b5a0bf5d4a394ae9fe9c548d75078ea878e660

## Sanitized local env inspection

`.env.local` is present. Values were not printed or copied.

Relevant presence check:

| Variable | Status |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | present |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | present |
| `SUPABASE_SERVICE_ROLE_KEY` | present |
| `ADMIN_EMAILS` | present |
| `CEO_EMAILS` | missing |
| `PLAYWRIGHT_CEO_EMAIL` | missing |
| `PLAYWRIGHT_CEO_PASSWORD` | missing |
| `PLAYWRIGHT_TEST_EMAIL` | missing |
| `PLAYWRIGHT_TEST_PASSWORD` | missing |
| `PLAYWRIGHT_ADMIN_EMAIL` | missing |
| `PLAYWRIGHT_ADMIN_PASSWORD` | missing |
| `NEXT_PUBLIC_ENABLE_DEMO_MODE` | present |
| `NEXT_PUBLIC_APP_URL` | present |
| `PLAYWRIGHT_BASE_URL` | missing |

## Credential conclusion

The provided CEO email can identify the intended account, but a live/staging password or non-secret auth fixture is not present in `.env.local`. Do not paste the password in chat. To run credentialed live/staging CEO Playwright coverage, set these locally only:

```bash
PLAYWRIGHT_CEO_EMAIL=<CEO email>
PLAYWRIGHT_CEO_PASSWORD=<local secret password>
PLAYWRIGHT_BASE_URL=<staging or live URL>
```

If the target environment does not already recognize the CEO account, add a non-secret role/entitlement fixture path or ensure the account is entitled to CEO access through the live/staging admin process. This report intentionally stores env variable names only.

## Current runnable coverage

The existing repo supports demo-mode CEO coverage via:

```bash
bun run test:e2e:auth-demo:ceo-portal
```

That path uses redacted demo auth variables created by `scripts/playwright-run.ts`; it does not use live Supabase credentials.
