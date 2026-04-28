'use client'

import { useWallLabStore } from '@/features/3d-lab/stores/useWallLabStore'
import { AreaSummaryBar } from './AreaSummaryBar'
import { CoreTypeStep } from './steps/CoreTypeStep'
import { GeometryStep } from './steps/GeometryStep'
import { TreatmentStep } from './steps/TreatmentStep'
import { FinishTypeStep } from './steps/FinishTypeStep'
import { ColorSponsorStep } from './steps/ColorSponsorStep'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 px-3 py-3 border-b border-border last:border-b-0">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </span>
      {children}
    </div>
  )
}

export function ConfigPanel() {
  const reset = useWallLabStore((s) => s.reset)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AreaSummaryBar />

      <div className="flex-1 overflow-y-auto">
        <Section title="Wall Dimensions">
          <GeometryStep />
        </Section>

        <Section title="Wall Core Type">
          <CoreTypeStep />
        </Section>

        <Section title="Treatment & Sides">
          <TreatmentStep />
        </Section>

        <Section title="Wall Finish">
          <FinishTypeStep />
        </Section>

        <Section title="Colors & Brands">
          <ColorSponsorStep />
        </Section>
      </div>

      <div className="px-3 py-2 border-t border-border shrink-0">
        <button
          type="button"
          onClick={reset}
          className="text-[12px] text-muted-foreground hover:text-text-secondary transition-colors duration-150"
        >
          Reset All
        </button>
      </div>
    </div>
  )
}
