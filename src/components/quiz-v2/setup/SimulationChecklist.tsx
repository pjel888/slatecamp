'use client'

import { useState } from 'react'
import { CheckSquare, Square, Info } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Checklist items ──────────────────────────────────────────────────────────

const CHECKLIST_ITEMS = [
  {
    id: 'time',
    label: 'I have enough uninterrupted time',
    detail: 'This simulation takes up to 4 hours. Plan accordingly.',
  },
  {
    id: 'quiet',
    label: "I'm in a quiet space",
    detail: 'Minimize distractions to match real exam conditions.',
  },
  {
    id: 'nourished',
    label: "I've eaten and I'm hydrated",
    detail: 'A clear mind performs best. Take care of the basics first.',
  },
  {
    id: 'charged',
    label: 'My device is charged',
    detail: 'Ensure your battery or power supply will last the full session.',
  },
  {
    id: 'no-pause',
    label: 'I understand this cannot be paused',
    detail: 'Once started, the timer runs continuously until completion.',
  },
] as const

type ChecklistId = (typeof CHECKLIST_ITEMS)[number]['id']

// ─── Props ────────────────────────────────────────────────────────────────────

interface SimulationChecklistProps {
  onReady: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

const SimulationChecklist = ({ onReady }: SimulationChecklistProps) => {
  const [checked, setChecked] = useState<Set<ChecklistId>>(new Set())

  const toggle = (id: ChecklistId) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const allChecked = CHECKLIST_ITEMS.every((item) => checked.has(item.id))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex gap-2.5 rounded-md bg-primary-50 border border-primary/20 px-4 py-3">
        <Info
          className="h-4 w-4 shrink-0 mt-0.5 text-primary"
          aria-hidden="true"
          weight="fill"
        />
        <div>
          <p className="text-[13px] font-medium text-foreground mb-0.5">
            Before you begin
          </p>
          <p className="text-[13px] text-text-secondary">
            This is a full exam simulation under real conditions. Take a moment
            to confirm you are ready.
          </p>
        </div>
      </div>

      {/* Checklist */}
      <fieldset>
        <legend className="sr-only">Pre-simulation readiness checklist</legend>
        <div className="space-y-1">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = checked.has(item.id)
            return (
              <button
                key={item.id}
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => toggle(item.id)}
                className={cn(
                  'w-full flex items-start gap-3 px-3.5 py-3 rounded-md border text-left transition-colors duration-150 ease-out',
                  isChecked
                    ? 'border-success/30 bg-success-50'
                    : 'border-border bg-white hover:border-primary/30',
                )}
              >
                {/* Checkbox icon */}
                <span className="shrink-0 mt-0.5" aria-hidden="true">
                  {isChecked ? (
                    <CheckSquare
                      size={18}
                      weight="fill"
                      className="text-success"
                    />
                  ) : (
                    <Square
                      size={18}
                      weight="regular"
                      className="text-muted-foreground"
                    />
                  )}
                </span>

                {/* Text */}
                <div>
                  <p
                    className={cn(
                      'text-[13px] font-medium leading-snug',
                      isChecked ? 'text-foreground' : 'text-text-secondary',
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    {item.detail}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Progress hint */}
      {!allChecked && (
        <p className="text-[11px] text-muted-foreground text-center">
          {checked.size} of {CHECKLIST_ITEMS.length} confirmed
        </p>
      )}

      {/* Start button */}
      <Button
        variant="default"
        size="lg"
        fullWidth
        disabled={!allChecked}
        onClick={onReady}
        className="rounded-sm"
        style={{ backgroundColor: 'var(--camp-orange)' } as React.CSSProperties}
      >
        Start Simulation
      </Button>
    </div>
  )
}

SimulationChecklist.displayName = 'SimulationChecklist'

export { SimulationChecklist }
