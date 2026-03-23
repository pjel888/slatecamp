'use client'

import { useState } from 'react'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { ThreeDCanvasPlaceholder } from '@/components/tools/ThreeDCanvasPlaceholder'
import { WallPaintForm } from '@/components/tools/wall-paint/WallPaintForm'
import type { WallPaintResult } from '@/types/tools'

export const WallPaintPageClient = () => {
  const [results, setResults] = useState<WallPaintResult | null>(null)

  const handleCalculate = (r: WallPaintResult) => {
    setResults(r)
  }

  const canvasResults = results
    ? [
        { label: 'Gross Area', value: `${results.grossArea.toFixed(2)} m²` },
        { label: 'Openings', value: `${results.openingsArea.toFixed(2)} m²` },
        { label: 'Net Paintable', value: `${results.netPaintableArea.toFixed(2)} m²` },
        { label: 'Paint Needed', value: `${results.litersNeeded} L` },
      ]
    : undefined

  return (
    <ToolPageLayout
      toolName='Wall Paint Calculator'
      form={<WallPaintForm onCalculate={handleCalculate} />}
      canvas={<ThreeDCanvasPlaceholder label='Wall Preview' results={canvasResults} />}
    />
  )
}
