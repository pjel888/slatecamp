'use client'

import { useWallConfigStore } from '../store/useWallConfigStore'
import { useWallComputation } from '../hooks/useWallComputation'
import { AreaSummaryBar } from './AreaSummaryBar'
import { Step1CoreSelect } from './steps/Step1CoreSelect'
import { Step2Geometry } from './steps/Step2Geometry'
import { Step4Sides } from './steps/Step4Sides'
import { Step5Treatment } from './steps/Step5Treatment'
import { Step6Finish } from './steps/Step6Finish'
import { Step7BOM } from './steps/Step7BOM'

// Ordered step sequence — step 3 is intentionally omitted
const STEP_SEQUENCE = [1, 2, 4, 5, 6, 7] as const
type ActiveStep = (typeof STEP_SEQUENCE)[number]

const STEP_LABELS: Record<ActiveStep, string> = {
  1: 'Wall Core Type',
  2: 'Wall Geometry',
  4: 'Sides to Finish',
  5: 'Treatment Layers',
  6: 'Primer & Topcoat',
  7: 'Bill of Materials',
}

function isActiveStep(n: number): n is ActiveStep {
  return (STEP_SEQUENCE as readonly number[]).includes(n)
}

function _nextInSequence(current: ActiveStep): ActiveStep {
  const idx = STEP_SEQUENCE.indexOf(current)
  return idx < STEP_SEQUENCE.length - 1 ? STEP_SEQUENCE[idx + 1] : current
}

function StepContent({ stepNum }: { stepNum: ActiveStep }) {
  switch (stepNum) {
    case 1: return <Step1CoreSelect />
    case 2: return <Step2Geometry />
    case 4: return <Step4Sides />
    case 5: return <Step5Treatment />
    case 6: return <Step6Finish />
    case 7: return <Step7BOM />
  }
}

function StepSummary({ stepNum }: { stepNum: ActiveStep }) {
  const config = useWallConfigStore((s) => s.config)
  const { areaState } = useWallComputation()

  switch (stepNum) {
    case 1: {
      const labels: Record<string, string> = {
        chb: 'CHB Hollow Block',
        drywall: 'Drywall',
        'existing-wall': 'Existing Wall',
      }
      return <>{labels[config.coreType] ?? config.coreType}</>
    }
    case 2: {
      const { lengthM, heightM, wallCount } = config.geometry
      const gross = (lengthM * heightM * wallCount).toFixed(2)
      return <>{lengthM} × {heightM} × {wallCount} wall{wallCount !== 1 ? 's' : ''} = {gross} sqm</>
    }
    case 4: {
      const label = config.sides === 2 ? '2 sides' : '1 side'
      return <>{label} → {areaState.finishAreaSqm.toFixed(2)} sqm</>
    }
    case 5: {
      const count = config.layers.filter((l) => l.enabled).length
      return <>{count} treatment layer{count !== 1 ? 's' : ''} enabled</>
    }
    case 6: {
      const primer = config.layers.find((l) => l.code === 'PRIMER')?.enabled
      const topcoat = config.layers.find((l) => l.code === 'TOPCOAT')?.enabled
      const parts = [primer && 'Primer', topcoat && 'Topcoat'].filter(Boolean)
      return <>{parts.length > 0 ? parts.join(' + ') : 'No paint layers'}</>
    }
    case 7:
      return <>BOM ready</>
  }
}

interface AccordionStepProps {
  stepNum: ActiveStep
  displayIndex: number
  activeStep: ActiveStep
  completedSteps: Set<number>
  onEdit: (step: ActiveStep) => void
}

function AccordionStep({
  stepNum,
  displayIndex,
  activeStep,
  completedSteps,
  onEdit,
}: AccordionStepProps) {
  const isActive = stepNum === activeStep
  const isCompleted = completedSteps.has(stepNum)
  const isFuture = !isActive && !isCompleted

  return (
    <div className={`border-b border-border last:border-b-0`}>
      {/* Header */}
      <div
        className={[
          'flex items-center gap-3 px-4 py-3',
          isActive ? 'bg-primary-50' : 'bg-card',
          isCompleted ? 'cursor-pointer hover:bg-surface-light' : 'cursor-default',
        ].join(' ')}
        onClick={() => isCompleted && onEdit(stepNum)}
        role={isCompleted ? 'button' : undefined}
        aria-expanded={isActive}
      >
        {/* Step badge */}
        <span
          className={[
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
            isCompleted
              ? 'bg-success text-white'
              : isActive
              ? 'bg-primary text-white'
              : 'bg-border text-text-tertiary',
          ].join(' ')}
        >
          {isCompleted ? '✓' : displayIndex}
        </span>

        {/* Label */}
        <span
          className={[
            'text-[13px] font-medium',
            isFuture ? 'text-text-tertiary' : 'text-text-primary',
          ].join(' ')}
        >
          {STEP_LABELS[stepNum]}
        </span>

        {/* Summary + Edit (completed only) */}
        {isCompleted && (
          <span className="ml-auto flex items-center gap-3">
            <span className="font-mono text-[10px] text-text-tertiary">
              <StepSummary stepNum={stepNum} />
            </span>
            <button
              type="button"
              className="font-mono text-[9px] uppercase tracking-wide text-primary hover:underline"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(stepNum)
              }}
            >
              Edit
            </button>
          </span>
        )}
      </div>

      {/* Body — only rendered when active */}
      {isActive && (
        <div className="bg-card p-4">
          <StepContent stepNum={stepNum} />
        </div>
      )}
    </div>
  )
}

export function WallConfigurator() {
  const step = useWallConfigStore((s) => s.step)
  const setStep = useWallConfigStore((s) => s.setStep)

  // Treat the store step as the active accordion step (coerce to sequence)
  const activeStep: ActiveStep = isActiveStep(step) ? step : 1

  // Every step that comes before the active step in the sequence is completed
  const activeIdx = STEP_SEQUENCE.indexOf(activeStep)
  const completedSteps = new Set(STEP_SEQUENCE.slice(0, activeIdx))

  function handleEdit(target: ActiveStep) {
    setStep(target)
  }

  return (
    <>
      {/* Print styles: hide everything except bom-content */}
      <style>{`
        @media print {
          body > *:not(#wall-configurator-root) { display: none !important; }
          #wall-configurator-root header,
          #wall-configurator-root .print\\:hidden { display: none !important; }
          #bom-content { display: block !important; }
        }
      `}</style>

      <div id="wall-configurator-root" className="flex min-h-screen flex-col bg-surface-light">
        {/* Header */}
        <header className="border-b border-border bg-card px-4 py-3 print:hidden">
          <h1 className="text-lg font-semibold text-text-primary">Wall Configurator</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Unified CHB, drywall &amp; paint estimator
          </p>
        </header>

        {/* Dark area summary bar */}
        <div className="print:hidden">
          <AreaSummaryBar />
        </div>

        {/* Accordion */}
        <main className="mx-auto w-full max-w-2xl flex-1 px-0 pb-12 sm:px-4">
          <div className="overflow-hidden rounded-md border border-border bg-card sm:mt-4">
            {STEP_SEQUENCE.map((stepNum, idx) => (
              <AccordionStep
                key={stepNum}
                stepNum={stepNum}
                displayIndex={idx + 1}
                activeStep={activeStep}
                completedSteps={completedSteps}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </main>
      </div>
    </>
  )
}
