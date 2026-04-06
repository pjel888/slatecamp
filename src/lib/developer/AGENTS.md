<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-06 -->

# developer

## Purpose

The `developer` directory contains lightweight utilities for the developer portal. At the moment that primarily means changelog data used by the internal portal.

## Key Files

| File | Description |
|------|-------------|
| `changelog.ts` | Changelog parser and version tracker: reads deployment history and formats release notes |

## For AI Agents

### Working In This Directory

**Changelog:**
- Source: `CHANGELOG.md` or git commit history.
- Exports: `getChangelog()`, `getVersions()`, `getReleaseNotes(version)`.
- Format: semantic versioning (major.minor.patch).
- Categories: Features, Fixes, Breaking Changes, Deprecated.
- Used in developer portal: recent changes, version history, rollback info.

## Common Patterns

**Getting changelog data:**
```typescript
import { getChangelog, getVersions } from '@/lib/developer'

const versions = getVersions()
const latest = versions[0]
const notes = getChangelog(latest)
```

## Dependencies

### Internal

- **File system:** Read `CHANGELOG.md` when regenerating release data.

### External

- **None.** Pure utility functions for developer-facing metadata.

---

**Last Updated:** 2026-04-06

**For questions about the developer portal, consult `.claude/agents/` in the repository root.**
