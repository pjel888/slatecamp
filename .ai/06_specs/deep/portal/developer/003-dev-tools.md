# Developer Tools

**Analysis Date:** 2026-04-06

## Overview

Internal development tools at `/developer/tools/`. Access requires authenticated user or `ALLOW_DEV_PORTAL_BYPASS=true` env var.

**Source:** `src/app/developer/tools/`, `src/lib/dev/`

## Tool Routes

| Route | Tool | Purpose |
|-------|------|---------|
| `/developer/tools` | Hub page | Overview of all dev tools |
| `/developer/tools/console` | Interactive Console | Client-side JS execution |
| `/developer/tools/db` | Database Inspector | Query and inspect Supabase tables |
| `/developer/tools/logs` | Log Viewer | Application log display |
| `/developer/tools/test-data` | Test Data Generator | Seed test data for development |

**Source:** `src/app/developer/tools/`

## Interactive Console

Client-side JavaScript execution:
- Input field for arbitrary JS
- Output panel with results
- Error display
- History of commands

**Source:** `src/app/developer/tools/console/ConsoleClient.tsx`

## Database Inspector

Direct Supabase query interface:
- Table browser
- Custom SQL query input
- Result grid display
- Export results

**Note:** Uses service role key — restricted to developer portal only.

**Source:** `src/app/developer/tools/db/DbInspector.tsx`

## Log Viewer

Application log display:
- Filterable by log level
- Date range filtering
- Search across log messages
- Real-time updates

**Source:** `src/app/developer/tools/logs/LogViewer.tsx`

## Test Data Generator

Generate synthetic test data:
- User accounts
- Quiz sessions
- Questions and articles
- Taxonomy nodes

**Source:** `src/app/developer/tools/test-data/TestDataGenerator.tsx`

## Dev Utilities

Additional dev utilities in `src/lib/dev/`:
- Feature flag overrides
- Mock data generation
- Debug helpers
- Demo mode utilities

**Source:** `src/lib/dev/`, `src/components/dev/`

## Environment Detection

Portal layout determines environment:
- **development:** Local dev (`ALLOW_DEV_PORTAL_BYPASS` set)
- **staging:** Staging deployment
- **production:** Production deployment

Environment badge displayed in `DevPortalShell`.

**Source:** `src/app/developer/layout.tsx`

---

*Developer tools: 2026-04-06*
