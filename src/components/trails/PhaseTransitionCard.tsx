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
    <div className="rounded-md border border-[#D4DAE3] bg-[#F8F7F5] p-4">
      <p className="text-sm font-semibold text-[#1A2332]">
        Phase {fromPhase.phase_number}: {fromPhase.name} &mdash; complete.
      </p>
      <p className="text-sm text-[#4A5568] mt-1">
        Phase {toPhase.phase_number}: {toPhase.name} begins.
      </p>
    </div>
  )
}
