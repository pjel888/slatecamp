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
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
          Firewall (§704.4c)
        </label>
        <p className="text-[9px] text-[#8896A7]">Not permitted for {entry.label}</p>
      </div>
    )
  }

  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
        Firewall (§704.4c)
      </label>

      {/* Mini lot diagram showing which sides have firewalls */}
      <div className="relative mx-auto mb-2 h-16 w-24 rounded-sm border border-[#D4DAE3] bg-[#F8F7F5]">
        {/* Front edge (bottom) */}
        <div className={`absolute bottom-0 left-1 right-1 h-0.5 rounded-full transition-colors duration-150 ${
          firewallSides.includes('front') ? 'bg-[#FF6B35]' : 'bg-[#D4DAE3]'
        }`} />
        {/* Rear edge (top) */}
        <div className={`absolute top-0 left-1 right-1 h-0.5 rounded-full transition-colors duration-150 ${
          firewallSides.includes('rear') ? 'bg-[#FF6B35]' : 'bg-[#D4DAE3]'
        }`} />
        {/* Left edge */}
        <div className={`absolute left-0 top-1 bottom-1 w-0.5 rounded-full transition-colors duration-150 ${
          firewallSides.includes('left') ? 'bg-[#FF6B35]' : 'bg-[#D4DAE3]'
        }`} />
        {/* Right edge */}
        <div className={`absolute right-0 top-1 bottom-1 w-0.5 rounded-full transition-colors duration-150 ${
          firewallSides.includes('right') ? 'bg-[#FF6B35]' : 'bg-[#D4DAE3]'
        }`} />
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center text-[8px] text-[#8896A7]">
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
                  ? 'border-[#D4DAE3] bg-[#F8F7F5] text-[#D4DAE3] cursor-not-allowed'
                  : isActive
                    ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                    : 'border-[#D4DAE3] text-[#4A5568] hover:border-[#FF6B35] hover:bg-[#FF6B35]/5'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Status */}
      {firewallActive && (
        <p className="mt-1.5 text-[9px] text-[#FF6B35]">
          Active on {firewallSides.join(', ')} — setback zeroed on firewalled sides
        </p>
      )}
    </div>
  )
}
