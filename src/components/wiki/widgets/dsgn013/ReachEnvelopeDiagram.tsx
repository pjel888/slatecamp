'use client'

import { useState } from 'react'

type Posture = 'standing' | 'seated' | 'wheelchair'

const DATA = {
  standing: {
    label: 'Standing Adult',
    forward: { max: '610 mm', comfortable: '460 mm' },
    overhead: { max: '2,060 mm', comfortable: '1,830 mm' },
    low: { min: '380 mm above floor' },
    side: { max: '740 mm', comfortable: '560 mm' },
    notes: 'Forward reach is measured from the front of the body with arm extended. Comfortable reach is ~75% of maximum. Overhead reach assumes 50th percentile male. For shelving: items above 1,830 mm require a step stool for most users.',
  },
  seated: {
    label: 'Seated (Desk Chair)',
    forward: { max: '560 mm', comfortable: '410 mm' },
    overhead: { max: '1,370 mm', comfortable: '1,220 mm' },
    low: { min: 'Seat level (~450 mm)' },
    side: { max: '680 mm', comfortable: '510 mm' },
    notes: 'Seated reach is significantly reduced. Desktop controls should be within 410 mm forward reach. Overhead storage above 1,220 mm requires leaning or standing. Monitor distance: 460–710 mm from eyes.',
  },
  wheelchair: {
    label: 'Wheelchair User (BP 344)',
    forward: { max: '610 mm over obstruction', comfortable: '460 mm' },
    overhead: { max: '1,220 mm (unobstructed)', comfortable: '1,065 mm' },
    low: { min: '380 mm (minimum accessible)' },
    side: { max: '610 mm (no obstruction)', comfortable: '460 mm' },
    notes: 'BP 344 §4.2: Forward reach over a 510 mm deep obstruction maxes at 1,220 mm. Side reach without obstruction: 230–1,370 mm. Clear floor space: 750 × 1,200 mm must be provided at all accessible elements. Knee clearance under counters: 685 mm minimum.',
  },
}

export const ReachEnvelopeDiagram = () => {
  const [posture, setPosture] = useState<Posture>('standing')
  const d = DATA[posture]

  const buttons: { key: Posture; label: string }[] = [
    { key: 'standing', label: 'Standing' },
    { key: 'seated', label: 'Seated' },
    { key: 'wheelchair', label: 'Wheelchair' },
  ]

  return (
    <div className="not-prose my-5 rounded-md border border-border overflow-hidden bg-card dark:bg-card">
      {/* Header */}
      <div className="px-5 py-3.5 bg-muted border-b border-wiki-border dark:bg-wiki-surface-dark dark:border-wiki-invert-divider">
        <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-camp-cobalt">
          Interactive · Reach Envelope Zones
        </div>
      </div>

      {/* Posture tabs */}
      <div className="flex border-b border-wiki-border dark:border-wiki-invert-divider">
        {buttons.map((b) => (
          <button
            key={b.key}
            type="button"
            onClick={() => setPosture(b.key)}
            className={`flex-1 py-2.5 text-[12px] font-[var(--font-dm-mono)] font-medium transition-all duration-150 border-b-2 -mb-px ${
              posture === b.key
                ? 'text-camp-cobalt border-camp-cobalt bg-white dark:bg-wiki-ink'
                : 'text-ink-muted border-transparent hover:text-wiki-ink dark:text-wiki-muted'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Reach zones grid */}
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Forward reach', max: d.forward.max, comfortable: d.forward.comfortable },
            { label: 'Overhead reach', max: d.overhead.max, comfortable: d.overhead.comfortable },
            { label: 'Lowest reach', max: d.low.min, comfortable: null },
            { label: 'Side reach', max: d.side.max, comfortable: d.side.comfortable },
          ].map((zone) => (
            <div key={zone.label} className="bg-muted rounded-lg p-3 dark:bg-wiki-surface-dark">
              <div className="font-[var(--font-dm-mono)] text-[11px] uppercase tracking-[0.08em] text-wiki-muted mb-2">
                {zone.label}
              </div>
              <div className="font-[var(--font-dm-mono)] text-sm font-medium text-camp-cobalt mb-0.5">
                {zone.max}
              </div>
              {zone.comfortable && (
                <div className="font-[var(--font-dm-mono)] text-[11px] text-emerald">
                  Comfortable: {zone.comfortable}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="bg-cobalt-light rounded-lg p-3.5 text-[13px] text-wiki-body leading-relaxed dark:bg-camp-cobalt/10 dark:text-wiki-invert-body">
          <div className="font-[var(--font-dm-mono)] text-[11px] uppercase tracking-[0.1em] text-camp-cobalt mb-1.5 font-medium">
            {d.label} — Design Notes
          </div>
          {d.notes}
        </div>
      </div>
    </div>
  )
}
