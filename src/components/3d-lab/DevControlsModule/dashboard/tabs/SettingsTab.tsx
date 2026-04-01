'use client'

import { useDevControlsStore } from '../../stores/useDevControlsStore'
import type { LayerKey } from '@/lib/pd1096/types'

// ─── Settings Tab ──────────────────────────────────────────────────────────
// Display toggles, export options. Lightweight — mostly view settings.

const DISPLAY_TOGGLES: { key: LayerKey; label: string }[] = [
  { key: 'rrow', label: 'Road & ground grid' },
]

export function SettingsTab() {
  const showDimensions = useDevControlsStore((s) => s.showDimensions)
  const setShowDimensions = useDevControlsStore((s) => s.setShowDimensions)
  const visibleLayers = useDevControlsStore((s) => s.visibleLayers)
  const toggleLayer = useDevControlsStore((s) => s.toggleLayer)

  return (
    <div className="space-y-5">
      {/* Display section */}
      <div>
        <p className="mb-2 font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
          Display
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={showDimensions}
              onChange={(e) => setShowDimensions(e.target.checked)}
              className="size-3.5 rounded border-border accent-primary"
            />
            Dimension labels
          </label>
          {DISPLAY_TOGGLES.map((t) => (
            <label key={t.key} className="flex items-center gap-2 text-xs text-foreground">
              <input
                type="checkbox"
                checked={visibleLayers.has(t.key)}
                onChange={() => toggleLayer(t.key)}
                className="size-3.5 rounded border-border accent-primary"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {/* Export section */}
      <div>
        <p className="mb-2 font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
          Export
        </p>
        <div className="space-y-2">
          <button
            onClick={() => {
              // Screenshot: capture the canvas via toDataURL
              const canvas = document.querySelector('canvas')
              if (!canvas) return
              const link = document.createElement('a')
              link.download = 'slatecamp-3dlab-screenshot.png'
              link.href = canvas.toDataURL('image/png')
              link.click()
            }}
            className="w-full rounded-sm border border-border px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors duration-150 hover:bg-muted"
          >
            Screenshot (.png)
          </button>
        </div>
      </div>
    </div>
  )
}
