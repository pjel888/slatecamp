<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# public

## Purpose

Static assets served at the root URL path by Next.js. Contains SVG icons, branding assets, textures, and the widget modules directory for distributed learning components. All files here are publicly accessible and should contain no sensitive information.

## Key Files

| File | Description |
|------|-------------|
| `SlateCampLogoMark.svg` | Primary SlateCamp logo mark -- used in branding and navigation |
| `noise.png` | Subtle noise texture overlay for Campfire aesthetic |
| `file.svg` | Document/file icon -- used in file pickers and content lists |
| `globe.svg` | Global/world icon -- used in internationalization and search contexts |
| `window.svg` | Window icon -- used in layout and dialog UI elements |
| `next.svg` | Next.js logo -- legacy, may be removed |
| `vercel.svg` | Vercel logo -- legacy, may be removed |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `widgets/` | Widget assets directory |
| `widgets/modules/` | Reserved for future widget module files (currently empty) |

## For AI Agents

### Working In This Directory

- **Static only** -- this directory is served directly; no server-side processing occurs
- **SVG preferred** -- use SVG for icons and logos for scalability and small file size
- **Optimize images** -- compress PNGs and minimize SVG files before committing
- **No sensitive data** -- all files are publicly accessible; do not add environment variables, API keys, or user data
- **Naming convention** -- use PascalCase for component-related assets (e.g., `SlateCampLogoMark.svg`), kebab-case for utility assets (e.g., `noise.png`)
- **URL paths** -- files serve at root; e.g., `/SlateCampLogoMark.svg` or `/widgets/modules/...`

### Adding Assets

1. Place new files in this directory or a subdirectory
2. Reference in Next.js via static imports or absolute `/` paths
3. Verify the file is served correctly in dev (`bun run dev`) and production (`bun run build && bun run start`)
4. Update this AGENTS.md with the new asset

<!-- MANUAL: -->
