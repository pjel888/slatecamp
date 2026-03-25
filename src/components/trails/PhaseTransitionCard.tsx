import type { TrailPhase } from '@/types/app'

/* ------------------------------------------------------------------ */
/*  PhaseTransitionCard — Server Component                             */
/*  Appears between trail phases (week transitions).                   */
/* ------------------------------------------------------------------ */

interface PhaseTransitionCardProps {
  fromPhase: TrailPhase
  toPhase: TrailPhase
}

export const PhaseTransitionCard = ({
  fromPhase,
  toPhase,
}: PhaseTransitionCardProps) => {
  return (
    <div className="rounded-md border border-border bg-surface-light p-4">
      <p className="text-sm font-semibold text-text-primary">
        Phase {fromPhase.phase_number}: {fromPhase.name} &mdash; complete.
      </p>
      <p className="text-sm text-text-secondary mt-1">
        Phase {toPhase.phase_number}: {toPhase.name} begins.
      </p>
    </div>
  )
}
