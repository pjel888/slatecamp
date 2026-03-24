<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# tools

## Purpose

Standalone calculator tools for architecture professionals. Three specialized tools: Floor Tiles (tile layout calculator), Wall Paint (paint coverage estimator), and Lot Plotter (land area calculator). Each tool provides form input, validation, and result display.

## Key Files

| File | Description |
|------|-------------|
| `ToolCard.tsx` | Reusable card component for tool discovery (icon, title, description, CTA) |
| `ToolPageLayout.tsx` | Page layout wrapper for individual tool pages |
| `ThreeDCanvasPlaceholder.tsx` | Placeholder for 3D visualization (React Three Fiber ready) |
| `floor-tiles/FloorTilesForm.tsx` | Form for floor tile calculator (room dimensions, tile size, grout width, waste calculation) |
| `wall-paint/WallPaintForm.tsx` | Form for wall paint calculator (surface area, paint coverage) |
| `lot-plotter/LotPlotterForm.tsx` | Form for lot area calculator (land dimensions, area calculation) |

## For AI Agents

### Working In This Directory

- **Validation**: Client-side validation with error state display; prevents invalid submissions
- **Calculations**: All math done client-side; results returned to parent via `onCalculate()` callback
- **Presets**: Common values offered as buttons (e.g., tile sizes 300/400/600mm); custom override available
- **Units**: Floor Tiles (mm input, m output), Wall Paint (varies), Lot Plotter (varies)
- **Type Safety**: Dedicated result types (`FloorTilesResult`, etc.) imported from `@/types/tools`
- **Styling**: Use `Card`, `CardHeader`, `CardTitle`, `CardContent` from `@/components/ui/card`
- **Error Display**: Red text, `text-destructive` class; messages appear below failing input
- **Accessibility**: Input `id` + `Label htmlFor`, `aria-invalid` on errors

### Dependencies
### Internal

- `@/components/ui/` - Button, Input, Label, Card
- `@/types/tools` - Result types (FloorTilesResult, WallPaintResult, LotPlotterResult)
- `@/lib/utils` - `cn()` utility
- React hooks - `useState`

<!-- MANUAL: Test all calculator formulas against known reference values before launch. Add unit tests for edge cases (zero values, max limits). Ensure result accuracy for professional use. -->
