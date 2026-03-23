'use client'

import { useState } from 'react'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { ThreeDCanvasPlaceholder } from '@/components/tools/ThreeDCanvasPlaceholder'
import { LotPlotterForm } from '@/components/tools/lot-plotter/LotPlotterForm'
import type { LotPlotterResult } from '@/types/tools'

export const LotPlotterClient = () => {
  const [results, setResults] = useState<LotPlotterResult | null>(null)

  const handleCalculate = (r: LotPlotterResult) => {
    setResults(r)
  }

  const canvasResults = results
    ? [
        { label: 'Lot Area', value: `${results.totalArea.toFixed(2)} m²` },
        { label: 'Perimeter', value: `${results.perimeter.toFixed(2)} m` },
        {
          label: 'Status',
          value: results.isClosed
            ? 'Closed'
            : (() => {
                const last = results.coordinates[results.coordinates.length - 1]
                const gap = Math.sqrt(last.x * last.x + last.y * last.y)
                return `Open — ${gap.toFixed(3)}m gap`
              })(),
        },
        { label: 'Points', value: `${results.coordinates.length}` },
      ]
    : undefined

  return (
    <ToolPageLayout
      toolName='Lot Plotter'
      form={<LotPlotterForm onCalculate={handleCalculate} />}
      canvas={<ThreeDCanvasPlaceholder label='Lot Plot' results={canvasResults} />}
    />
  )
}
