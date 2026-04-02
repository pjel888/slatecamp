'use client'

import dynamic from 'next/dynamic'
import type { CalculatorConfig } from '@/app/dashboard/3d-lab/_types/templates'

const CalculatorTemplate = dynamic(
  () => import('@/app/dashboard/3d-lab/_templates/CalculatorTemplate'),
  { ssr: false }
)

const PAINT_CONFIG: CalculatorConfig = {
  id: 'calculator-paint',
  title: 'Paint Visualizer',
  description: 'Calculate paint for walls and ceilings with 3D room preview',
  subject: 'Building Technology',
  toolType: 'paint',
  camera: {
    position: [6, 5, 6],
    zoom: 60,
  },
}

export function PaintCalculator() {
  return (
    <div className="h-screen w-full">
      <CalculatorTemplate config={PAINT_CONFIG} />
    </div>
  )
}
