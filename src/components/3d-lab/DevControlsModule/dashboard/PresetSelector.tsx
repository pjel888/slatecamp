'use client'

import { useDevControlsStore, PRESETS, VIOLATION_PRESETS, type DevControlsPreset } from '../stores/useDevControlsStore'
import { CollapsibleSection } from './CollapsibleSection'
import { RotateCcw } from 'lucide-react'

// ─── Violation descriptions (from UX research doc) ─────────────────────────

const VIOLATION_DESCRIPTIONS: Record<string, string> = {
  'Lot Encroachment': 'Building footprint extends past the required setback line',
  'BHL Violation': 'Proposed height exceeds the max building height limit for this zone',
  'Setback Breach': 'Building footprint violates the required front, side, or rear setback',
  'TGFA Overbuilt': 'Total gross floor area exceeds the floor-area-ratio allowance',
}

// ─── Preset Selector ───────────────────────────────────────────────────────
// Redesigned from scattered pill buttons to:
//   1. Collapsible "Presets" section with compact mono chips
//   2. Collapsible "Violation Case Studies" section with amber mini cards
// Both collapsed by default — progressive disclosure for novice users.

export function PresetSelector() {
  const applyPreset = useDevControlsStore((s) => s.applyPreset)
  const reset = useDevControlsStore((s) => s.reset)

  return (
    <div className="space-y-0">
      {/* ─── Presets: Compact Chips ─── */}
      <CollapsibleSection
        title="Presets"
        defaultOpen={false}
        persistKey="presets"
        badge={
          <button
            onClick={(e) => {
              e.stopPropagation()
              reset()
            }}
            className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            title="Reset to defaults"
          >
            <RotateCcw size={10} />
            Reset
          </button>
        }
      >
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <PresetChip key={p.label} preset={p} onClick={() => applyPreset(p)} />
          ))}
        </div>
      </CollapsibleSection>

      {/* ─── Violation Case Studies: Amber Mini Cards ─── */}
      <CollapsibleSection
        title="Violation Case Studies"
        defaultOpen={false}
        persistKey="violations"
        badge={
          <span className="text-[10px] text-amber-600">&#9888;</span>
        }
      >
        <div className="space-y-1.5">
          {VIOLATION_PRESETS.map((p) => (
            <ViolationCard
              key={p.label}
              preset={p}
              description={VIOLATION_DESCRIPTIONS[p.label] ?? p.description}
              onClick={() => applyPreset(p)}
            />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  )
}

// ─── Preset Chip ───────────────────────────────────────────────────────────

function PresetChip({ preset, onClick }: { preset: DevControlsPreset; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={preset.description}
      className="h-7 rounded-md border border-border px-2.5 font-mono text-[10px] font-medium text-foreground transition-colors duration-150 hover:border-primary hover:bg-primary/5"
    >
      {preset.label}
    </button>
  )
}

// ─── Violation Mini Card ───────────────────────────────────────────────────

function ViolationCard({
  preset,
  description,
  onClick,
}: {
  preset: DevControlsPreset
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-r-md border-l-2 border-l-amber-500 bg-amber-50/50 p-2 text-left transition-colors duration-150 hover:bg-amber-100/70 dark:bg-amber-950/20 dark:hover:bg-amber-900/30"
    >
      <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
        &#9888; {preset.label}
      </p>
      <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
        {description}
      </p>
    </button>
  )
}
