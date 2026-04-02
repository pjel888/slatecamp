<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# developer

## Purpose

The `developer` directory contains utilities for the developer portal: changelog tracking and component registry indexing. Used to expose internal system state (deployed versions, component library status) to the admin/developer dashboard.

## Key Files

| File | Description |
|------|-------------|
| `changelog.ts` | Changelog parser and version tracker: reads deployment history, formats release notes |
| `componentRegistry.ts` | Component registry indexer: lists all shadcn/ui and custom components, their props, usage examples |

## For AI Agents

### Working In This Directory

**Changelog:**
- Source: `CHANGELOG.md` or git commit history.
- Exports: `getChangelog()`, `getVersions()`, `getReleaseNotes(version)`.
- Format: semantic versioning (major.minor.patch).
- Categories: Features, Fixes, Breaking Changes, Deprecated.
- Used in developer portal: "What's new" section, version history, rollback info.

**Component Registry:**
- Scans `src/components/` and `src/components/ui/` for component files.
- Extracts: component name, prop types (from TypeScript), default props, docstrings.
- Exports: `listComponents()`, `getComponentDocs(name)`, `getComponentUsage(name)`.
- Used in developer portal: component browser, prop documentation, copy-paste examples.

### Common Patterns

**Getting Changelog:**
```typescript
import { getChangelog, getVersions } from '@/lib/developer'

const versions = getVersions() // ['1.0.0', '0.9.2', '0.9.1', ...]
const latest = versions[0]
const notes = getChangelog(latest)
// { version, date, features: [], fixes: [], breaking: [] }
```

**Component Registry:**
```typescript
import { listComponents, getComponentDocs } from '@/lib/developer'

const components = listComponents()
// ['Button', 'Input', 'Modal', 'Tabs', ...]

const buttonDocs = getComponentDocs('Button')
// { name, description, props: { label: string, onClick: () => void }, examples: [...] }
```

## Dependencies

### Internal

- **File system:** Read `CHANGELOG.md` or scan component directory.
- **TypeScript:** Parse prop types from component files.

### External

- **None.** Pure utility functions for documentation extraction.

---

**Last Updated:** 2026-04-02

**For questions about the developer portal, consult `.claude/agents/` in the repository root.**
