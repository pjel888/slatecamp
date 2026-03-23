'use client'

import { useState } from 'react'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { FloorTilesForm } from '@/components/tools/floor-tiles/FloorTilesForm'
import { ThreeDCanvasPlaceholder } from '@/components/tools/ThreeDCanvasPlaceholder'
import type { FloorTilesResult } from '@/types/tools'

export const FloorTilesPageClient = () => {
  const [results, setResults] = useState<{ label: string; value: string }[] | undefined>(
    undefined,
  )

  const handleCalculate = (r: FloorTilesResult) => {
    setResults([
      { label: 'Total Area', value: `${r.totalArea.toFixed(2)} m²` },
      { label: 'Whole Tiles', value: String(r.wholeTiles) },
      { label: 'Cut Tiles', value: String(r.cutTiles) },
      { label: 'Total Tiles', value: String(r.totalTiles) },
      { label: 'Waste', value: `${r.wastePercentage.toFixed(1)}%` },
    ])
  }

  return (
    <ToolPageLayout
      toolName='Floor Tiles Calculator'
      form={<FloorTilesForm onCalculate={handleCalculate} />}
      canvas={<ThreeDCanvasPlaceholder label='Floor Preview' results={results} />}
    />
  )
}
