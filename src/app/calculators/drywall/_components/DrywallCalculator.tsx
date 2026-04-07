'use client'

import dynamic from 'next/dynamic'
import type { CalculatorConfig } from '@/features/3d-lab/types/templates'

const CalculatorTemplate = dynamic(
  () => import('@/features/3d-lab/templates/CalculatorTemplate'),
  { ssr: false }
)

const DRYWALL_CONFIG: CalculatorConfig = {
  id: 'calculator-drywall',
  title: 'Drywall Partition Estimator',
  description: 'Estimate studs, boards, and tracks for drywall partitions',
  subject: 'Building Technology',
  toolType: 'drywall',
  camera: {
    position: [4, 4, 6],
    zoom: 70,
  },
}

export function DrywallCalculator() {
  return (
    <div className="h-screen w-full">
      <CalculatorTemplate config={DRYWALL_CONFIG} />
    </div>
  )
}
