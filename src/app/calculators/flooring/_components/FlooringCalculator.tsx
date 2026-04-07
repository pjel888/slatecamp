'use client'

import dynamic from 'next/dynamic'
import type { CalculatorConfig } from '@/features/3d-lab/types/templates'

const CalculatorTemplate = dynamic(
  () => import('@/features/3d-lab/templates/CalculatorTemplate'),
  { ssr: false }
)

const FLOORING_CONFIG: CalculatorConfig = {
  id: 'calculator-flooring',
  title: 'Flooring / Tile Visualizer',
  description: 'Estimate tiles with 3D pattern preview and waste calculation',
  subject: 'Building Technology',
  toolType: 'flooring',
  camera: {
    position: [5, 5, 5],
    zoom: 80,
  },
}

export function FlooringCalculator() {
  return (
    <div className="h-screen w-full">
      <CalculatorTemplate config={FLOORING_CONFIG} />
    </div>
  )
}
