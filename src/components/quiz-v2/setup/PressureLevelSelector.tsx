'use client'

import { Lock } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import {
  PRESSURE_LEVELS,
  getUnlockedPressureLevel,
  type PressureLevel,
} from '@/lib/quiz/pressure-config'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PressureLevelSelectorProps {
  currentRS: number
  selected: PressureLevel
  onChange: (level: PressureLevel) => void
}

// ─── Unlock threshold labels ──────────────────────────────────────────────────

const UNLOCK_THRESHOLDS: Record<PressureLevel, number> = {
  0: 0,
  1: 40,
  2: 55,
  3: 65,
}

// ─── Component ────────────────────────────────────────────────────────────────

const PressureLevelSelector = ({
  currentRS,
  selected,
  onChange,
}: PressureLevelSelectorProps) => {
  const maxUnlocked = getUnlockedPressureLevel(currentRS)

  const levels = (Object.keys(PRESSURE_LEVELS) as unknown as PressureLevel[]).map(
    (key) => Number(key) as PressureLevel,
  )

  return (
    <div className="space-y-2.5">
      <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
        Pressure Level
      </p>

      {/* Horizontal stepper */}
      <div className="flex gap-2" role="radiogroup" aria-label="Pressure level">
        {levels.map((level) => {
          const config = PRESSURE_LEVELS[level]
          const isUnlocked = level <= maxUnlocked
          const isSelected = level === selected

          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={!isUnlocked}
              disabled={!isUnlocked}
              onClick={() => isUnlocked && onChange(level)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1.5 px-2 py-3 rounded-md border transition-colors duration-150 ease-out text-center',
                isSelected && isUnlocked
                  ? 'border-primary bg-primary-50'
                  : isUnlocked
                    ? 'border-border bg-white hover:border-primary/40 cursor-pointer'
                    : 'border-border bg-surface-light cursor-not-allowed opacity-60',
              )}
            >
              {/* Level number pip */}
              <span
                className={cn(
                  'flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-semibold',
                  isSelected && isUnlocked
                    ? 'bg-primary text-white'
                    : isUnlocked
                      ? 'bg-border text-text-secondary'
                      : 'bg-border text-muted-foreground',
                )}
                aria-hidden="true"
              >
                {isUnlocked ? level : <Lock size={12} />}
              </span>

              {/* Name */}
              <span
                className={cn(
                  'text-[12px] font-medium leading-tight',
                  isSelected && isUnlocked ? 'text-primary' : 'text-foreground',
                  !isUnlocked && 'text-muted-foreground',
                )}
              >
                {config.name}
              </span>

              {/* Description or unlock hint */}
              <span className="text-[11px] leading-snug text-muted-foreground">
                {isUnlocked
                  ? config.description
                  : `Unlock at ${UNLOCK_THRESHOLDS[level]}% Readiness`}
              </span>
            </button>
          )
        })}
      </div>

      {/* Current readiness context */}
      <p className="text-[11px] text-muted-foreground">
        Your Readiness Score: <span className="font-medium text-text-secondary">{currentRS}%</span>
      </p>
    </div>
  )
}

PressureLevelSelector.displayName = 'PressureLevelSelector'

export { PressureLevelSelector }
