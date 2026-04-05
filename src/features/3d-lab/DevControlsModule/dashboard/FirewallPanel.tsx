'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'
import { getZoningEntry } from '@/lib/pd1096/zoningTables'
import type { FirewallSide } from '@/lib/pd1096/types'

// Per-side firewall toggles with visual lot diagram.
// Firewalls zero the setback on the activated side (§704.4c)
// and switch PSO to the "with firewall" column in Table VIII.1.

const SIDES: { key: FirewallSide; label: string; position: string }[] = [
  { key: 'front', label: 'Front', position: 'Road-facing' },
  { key: 'left', label: 'Left', position: 'Side boundary' },
  { key: 'right', label: 'Right', position: 'Side boundary' },
  { key: 'rear', label: 'Rear', position: 'Back boundary' },
]

export function FirewallPanel() {
  const zoneClass = useDevControlsStore((s) => s.zoning.zoneClass)
  const firewallActive = useDevControlsStore((s) => s.zoning.firewallActive)
  const firewallSides = useDevControlsStore((s) => s.zoning.firewallSides)
  const setFirewall = useDevControlsStore((s) => s.setFirewall)

  const entry = getZoningEntry(zoneClass)
  const allowed = entry.firewallAllowed
  const canFirewall = allowed.length > 0

  const toggleSide = (side: FirewallSide) => {
    const next = firewallSides.includes(side)
      ? firewallSides.filter(s => s !== side)
      : [...firewallSides, side]
    setFirewall(next.length > 0, next)
  }

  if (!canFirewall) {
    return (
      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Firewall (§704.4c)
        </label>
        <p className="text-[9px] text-muted-foreground">Not permitted for {entry.label}</p>
      </div>
    )
  }

  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Firewall (§704.4c)
      </label>

      {/* Mini lot diagram showing which sides have firewalls */}
      <div className="relative mx-auto mb-2 h-16 w-24 rounded-sm border border-border bg-surface-light">
        {/* Front edge (bottom) */}
        <div className={`absolute bottom-0 left-1 right-1 h-0.5 rounded-full transition-colors duration-150 ${
          firewallSides.includes('front') ? 'bg-camp-orange' : 'bg-border'
        }`} />
        {/* Rear edge (top) */}
        <div className={`absolute top-0 left-1 right-1 h-0.5 rounded-full transition-colors duration-150 ${
          firewallSides.includes('rear') ? 'bg-camp-orange' : 'bg-border'
        }`} />
        {/* Left edge */}
        <div className={`absolute left-0 top-1 bottom-1 w-0.5 rounded-full transition-colors duration-150 ${
          firewallSides.includes('left') ? 'bg-camp-orange' : 'bg-border'
        }`} />
        {/* Right edge */}
        <div className={`absolute right-0 top-1 bottom-1 w-0.5 rounded-full transition-colors duration-150 ${
          firewallSides.includes('right') ? 'bg-camp-orange' : 'bg-border'
        }`} />
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center text-[8px] text-muted-foreground">
          LOT
        </div>
      </div>

      {/* Per-side toggles */}
      <div className="grid grid-cols-2 gap-1">
        {SIDES.map(({ key, label }) => {
          const isAllowed = allowed.includes(key)
          const isActive = firewallSides.includes(key)
          return (
            <button
              key={key}
              disabled={!isAllowed}
              onClick={() => toggleSide(key)}
              className={`rounded-sm border px-2 py-1 text-[9px] font-medium transition-colors duration-150 ${
                !isAllowed
                  ? 'border-border bg-surface-light text-border cursor-not-allowed'
                  : isActive
                    ? 'border-camp-orange bg-camp-orange/10 text-camp-orange'
                    : 'border-border text-text-secondary hover:border-camp-orange hover:bg-camp-orange/5'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Status */}
      {firewallActive && (
        <p className="mt-1.5 text-[9px] text-camp-orange">
          Active on {firewallSides.join(', ')} — setback zeroed on firewalled sides
        </p>
      )}
    </div>
  )
}
