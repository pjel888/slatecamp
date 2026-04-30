'use client'

import dynamic from 'next/dynamic'
import { CALCULATOR_TOOL_CONFIGS, type CalculatorToolSlug } from './calculator-tool-registry'

const CalculatorTemplate = dynamic(
  () => import('@/features/3d-lab/templates/CalculatorTemplate'),
  { ssr: false },
)

export function CalculatorToolShell({ tool }: { tool: CalculatorToolSlug }) {
  return (
    <div className="h-screen w-full">
      <CalculatorTemplate config={CALCULATOR_TOOL_CONFIGS[tool]} />
    </div>
  )
}
