'use client'

// Zone legend — explains what each colored layer represents in the 3D scene.

const LEGEND_ITEMS = [
  { color: '#C8C0A8', label: 'Lot Surface (TLA)', opacity: 1 },
  { color: '#E74C3C', label: 'Setback Zones', opacity: 0.3 },
  { color: '#1B3FC4', label: 'AMBF (Binding Footprint)', opacity: 0.4 },
  { color: '#F5A623', label: 'ISA (Impervious Surface)', opacity: 0.5 },
  { color: '#4A7C59', label: 'USA (Unpaved Surface)', opacity: 0.5 },
  { color: '#88A898', label: 'TOSL Overlay', opacity: 0.3 },
  { color: '#B8B4A8', label: 'Building Floor Slabs', opacity: 0.85 },
  { color: '#1B3FC4', label: 'Buildable Envelope (BHL)', opacity: 0.25, dashed: true },
  { color: '#F5A623', label: 'AMBF Ghost (PSO)', opacity: 0.2, dashed: true },
  { color: '#E63329', label: 'Violation', opacity: 0.7 },
  { color: '#FF6B35', label: 'Firewall', opacity: 0.6 },
  { color: '#6B7280', label: 'Road (RROW)', opacity: 1 },
]

export function ZoneLegend() {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Zone Legend
      </label>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className={`h-2.5 w-4 shrink-0 rounded-[2px] ${item.dashed ? 'border border-dashed' : ''}`}
              style={{
                backgroundColor: item.dashed ? 'transparent' : item.color,
                opacity: item.opacity,
                borderColor: item.dashed ? item.color : undefined,
              }}
            />
            <span className="text-[9px] text-text-secondary leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
