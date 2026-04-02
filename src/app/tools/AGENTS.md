<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Tools

## Purpose
Hub page for standalone browser-based utility tools (floor tiles, wall paint, lot plotter). Light, focused SEO landing pages separate from the main calculator suite. Entry point for specific tool discovery.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component listing available tools with icons and descriptions |
| `floor-tiles-calculator/page.tsx` | Floor tiles calculation tool page |
| `floor-tiles-calculator/FloorTilesPageClient.tsx` | Client wrapper component |
| `wall-paint-calculator/page.tsx` | Wall paint calculation tool page |
| `wall-paint-calculator/WallPaintPageClient.tsx` | Client wrapper component |
| `lot-plotter/page.tsx` | Lot plotter tool page |
| `lot-plotter/LotPlotterClient.tsx` | Client wrapper component |
| `loading.tsx` | Hub page loading skeleton |
| `{tool}/loading.tsx` | Tool-specific loading skeletons |

## For AI Agents
### Working In This Directory
- **Hub + sub-tools pattern:** Index page displays grid of tool cards; each tool has its own sub-directory
- **No 3D visualization** (unlike calculators) — these are simpler, focused utility tools
- **Tool card structure:** Icon, title, description, href link, tag (category: "Estimating" or "Site Planning")
- **Metadata:** SEO-friendly (keywords: architecture tools, ALE exam prep)
- **Public pages** — no auth required
- **Client wrappers:** Each tool page has a Client component wrapper for interactivity
- When adding new tools: create sub-directory, add Page component, add Client wrapper, list in TOOLS array on hub

## Tool Sub-Directories
Each tool follows:
1. `page.tsx` — Server component entry
2. `{ToolName}PageClient.tsx` — Client component with tool logic
3. `loading.tsx` — Skeleton loader

## Dependencies
### Internal
- `@/components/marketing/MarketingNav` — Navigation
- `@/components/marketing/MarketingFooter` — Footer
- `@/components/tools/ToolCard` — Reusable tool card component
- `@/lib/constants/site` — `siteConfig`
- `@phosphor-icons/react/dist/ssr` — Icons (GridFour, PaintBucket, MapTrifold)

<!-- MANUAL: -->
