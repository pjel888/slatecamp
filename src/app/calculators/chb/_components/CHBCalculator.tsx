'use client'

import dynamic from 'next/dynamic'
import type { CalculatorConfig } from '@/features/3d-lab/types/templates'

const CalculatorTemplate = dynamic(
  () => import('@/app/dashboard/3d-lab/_templates/CalculatorTemplate'),
  { ssr: false }
)

const CHB_CONFIG: CalculatorConfig = {
  id: 'calculator-chb',
  title: 'CHB Wall Builder',
  description: 'Estimate hollow blocks, mortar, cement, and rebar for masonry walls',
  subject: 'Estimating & Quantity Surveying',
  toolType: 'chb',
  camera: {
    position: [4, 4, 6],
    zoom: 70,
  },
}

export function CHBCalculator() {
  return (
    <div className="h-screen w-full">
      <CalculatorTemplate config={CHB_CONFIG} />
    </div>
  )
}
