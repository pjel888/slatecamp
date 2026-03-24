import { ModeCard } from './ModeCard'
import { ZONE_LABELS } from '@/lib/constants/testing-modes'
import type { ModeDefinition, ModeStats, SimulationGateStatus } from '@/types/testing'

interface ZoneSectionProps {
  zone: 1 | 2 | 3
  modes: ModeDefinition[]
  modeStats: Record<string, ModeStats | null>
  userTier: 'free' | 'pro'
  simulationGateStatus?: SimulationGateStatus | null
  /** 0–1, applied as opacity. 1 = full. */
  opacity?: number
}

const ZoneSection = ({
  zone,
  modes,
  modeStats,
  userTier,
  simulationGateStatus = null,
  opacity = 1,
}: ZoneSectionProps) => {
  const zoneLabel = ZONE_LABELS[zone]

  // Zone 1 → 2-col, Zones 2-3 → 3-col
  const gridClass =
    zone === 1
      ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
      : 'grid grid-cols-1 md:grid-cols-3 gap-4'

  return (
    <section
      aria-label={`Zone ${zoneLabel.number} — ${zoneLabel.name}`}
      style={{ opacity }}
    >
      {/* Zone header */}
      <div className="flex items-center gap-3 mb-4" aria-hidden="true">
        <span
          className="text-[11px] font-medium uppercase tracking-widest whitespace-nowrap shrink-0"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Zone {zoneLabel.number} · {zoneLabel.name}
        </span>
        {/* Extending line */}
        <div
          className="flex-1 h-px"
          style={{ backgroundColor: 'var(--border)' }}
        />
      </div>

      {/* Mode cards grid */}
      <div className={gridClass}>
        {modes.map((mode) => {
          const isSimulation = mode.key === 'simulation'
          const isLocked =
            isSimulation &&
            simulationGateStatus !== null &&
            simulationGateStatus !== undefined &&
            !simulationGateStatus.isUnlocked

          return (
            <ModeCard
              key={mode.key}
              mode={mode}
              stats={modeStats[mode.key] ?? null}
              isLocked={isLocked}
              lockProgress={isLocked ? simulationGateStatus : null}
              userTier={userTier}
            />
          )
        })}
      </div>
    </section>
  )
}

ZoneSection.displayName = 'ZoneSection'

export { ZoneSection }
