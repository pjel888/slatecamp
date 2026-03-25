'use client'

import dynamic from 'next/dynamic'

/* ------------------------------------------------------------------ */
/*  Widget preview wrappers — client-side dynamic imports              */
/*  Separated from the page (Server Component) because ssr:false       */
/*  requires 'use client'.                                             */
/* ------------------------------------------------------------------ */

const DoorConfiguratorInner = dynamic(
  () => import('@/components/wiki/widgets/bp344/DoorConfigurator').then((m) => m.DoorConfigurator),
  { ssr: false },
)

const CorridorVisualizerInner = dynamic(
  () => import('@/components/wiki/widgets/bp344/CorridorVisualizer').then((m) => m.CorridorVisualizer),
  { ssr: false },
)

const WorkstationCalculatorInner = dynamic(
  () => import('@/components/wiki/widgets/dsgn013/WorkstationCalculator').then((m) => m.WorkstationCalculator),
  { ssr: false },
)

export const DoorConfiguratorPreview = () => (
  <div className="max-w-md">
    <DoorConfiguratorInner />
  </div>
)

export const CorridorVisualizerPreview = () => (
  <div className="max-w-lg">
    <CorridorVisualizerInner />
  </div>
)

export const WorkstationCalculatorPreview = () => (
  <div className="max-w-md">
    <WorkstationCalculatorInner />
  </div>
)
