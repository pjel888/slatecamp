// canvas/cursor.ts
// ─── Lightweight cursor management — zero React re-renders ─────────────────
// Directly mutates document.body.style.cursor. No state, no hooks, no renders.
// Priority stack: drag > resize > hover > orbit > default

type CursorPriority = 'drag' | 'resize' | 'hover' | 'orbit' | 'default'

const CURSOR_MAP: Record<CursorPriority, string> = {
  drag: 'grabbing',
  resize: 'nwse-resize',
  hover: 'grab',
  orbit: 'all-scroll',
  default: 'default',
}

// Active cursors — highest priority wins
const active = new Set<CursorPriority>()

function apply() {
  const priorities: CursorPriority[] = ['drag', 'resize', 'hover', 'orbit', 'default']
  for (const p of priorities) {
    if (active.has(p)) {
      document.body.style.cursor = CURSOR_MAP[p]
      return
    }
  }
  document.body.style.cursor = 'default'
}

export function setCursor(priority: CursorPriority) {
  active.add(priority)
  apply()
}

export function clearCursor(priority: CursorPriority) {
  active.delete(priority)
  apply()
}

export function resetCursor() {
  active.clear()
  document.body.style.cursor = 'default'
}
